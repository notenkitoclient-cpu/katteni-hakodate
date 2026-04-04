/**
 * カッテニハコダテ — リサーチスクリプト
 * 函館の最新情報を収集し：
 *   1. 開店・閉店・イベント等を情報収集（src/content/news/）に自動追加
 *   2. ネタ候補全件をDiscordに通知（詳細記事化は write.mjs で別途対応）
 */

import Exa from 'exa-js';
import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const NEWS_DIR  = path.join(__dirname, '../src/content/news');
const SITE_URL  = process.env.SITE_URL?.replace(/\/$/, '') || 'https://katteni-hakodate.pages.dev';

// ── ライター推薦 ──────────────────────────────────────────────

const WRITER_SPECIALTY = {
  masaru:  { name: '港 まさあき', emoji: '🐟', tags: ['グルメ', '食', '朝市', '飲食店', '居酒屋', '海鮮'] },
  taro:    { name: '坂本 颯',     emoji: '🚲', tags: ['開店', 'オープン', '閉店', '工事', '新しい', '変化'] },
  rin:     { name: '深海 凛',     emoji: '📊', tags: ['ビジネス', '移住', '経済', '行政', '企業', '起業'] },
  sora:    { name: '西野 そら',   emoji: '🌟', tags: ['イベント', '祭り', 'フェス', '若者', '大学', '体験'] },
  shizuku: { name: '霧野 しずく', emoji: '🌫', tags: ['暮らし', '移住', '日常', 'カフェ', '生活'] },
};

function suggestWriter(title, text) {
  const content = (title + ' ' + text).toLowerCase();
  for (const [id, w] of Object.entries(WRITER_SPECIALTY)) {
    if (w.tags.some(tag => content.includes(tag))) return { id, ...w };
  }
  return { id: 'taro', ...WRITER_SPECIALTY.taro };
}

// ── 情報収集への自動追加 ──────────────────────────────────────

/** 既存newsファイルのsource URLをSetで返す（重複チェック用） */
function loadExistingSourceUrls() {
  if (!fs.existsSync(NEWS_DIR)) return new Set();
  const urls = new Set();
  for (const file of fs.readdirSync(NEWS_DIR).filter(f => f.endsWith('.md'))) {
    const raw = fs.readFileSync(path.join(NEWS_DIR, file), 'utf-8');
    const m = raw.match(/^source:\s*["']?(.+?)["']?\s*$/m);
    if (m) urls.add(m[1].trim());
  }
  return urls;
}

/** タイトル・本文からニュースタイプを判定。非対象はnull */
function classifyNewsType(title, text) {
  const c = title + ' ' + (text || '');
  if (/開店|オープン|新店|ニューオープン|grand open/i.test(c)) return '開店';
  if (/閉店|クローズ|撤退|終了|破産|廃業|営業終了/.test(c))   return '閉店';
  if (/イベント|祭り|まつり|フェス|マルシェ|開催|コンサート|展示|展覧会|フリマ/.test(c)) return 'イベント';
  if (/工事|建設|リニューアル|改装|解体/.test(c))              return '工事中';
  return null;
}

/** タイトル・本文からエリアを抽出 */
function extractArea(title, text) {
  const c = title + ' ' + (text || '');
  const m = c.match(/([^\s　、。「」【】]{1,8}[町丁目区])/) ||
            c.match(/(函館駅前|ベイエリア|五稜郭|湯川|元町|西部地区|末広町|大門|本町)/);
  return m ? m[1] : '函館市内';
}

/** ニュースファイル用スラッグを生成（重複回避付き） */
function toNewsSlug(today, title, url, usedSlugs) {
  // タイトルの英数字部分を抽出
  let base = title
    .replace(/[^\w\s]/g, ' ')
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .filter(w => /^[a-z][a-z0-9]{1,}$/.test(w))
    .slice(0, 4)
    .join('-');

  // 英字がなければURLのドメインから生成
  if (base.length < 3) {
    try {
      base = new URL(url).hostname.replace(/^www\./, '').split('.')[0];
    } catch {
      base = 'news';
    }
  }

  let slug = `${today}-${base}`.slice(0, 55);
  const orig = slug;
  let i = 2;
  while (usedSlugs.has(slug)) slug = `${orig}-${i++}`;
  usedSlugs.add(slug);
  return slug;
}

/**
 * リサーチ結果から情報収集ニュースファイルを生成。
 * 新たに追加したアイテムのリストを返す。
 */
function saveNewsItems(topics, today) {
  if (!fs.existsSync(NEWS_DIR)) fs.mkdirSync(NEWS_DIR, { recursive: true });

  const existingUrls = loadExistingSourceUrls();
  const usedSlugs = new Set(
    fs.readdirSync(NEWS_DIR).map(f => f.replace('.md', ''))
  );

  const saved = [];

  for (const topic of topics) {
    // URL重複チェック
    if (existingUrls.has(topic.url)) {
      console.log(`⏭  スキップ（既存）: ${topic.title.slice(0, 40)}`);
      continue;
    }

    const type = classifyNewsType(topic.title, topic.summary);
    if (!type) {
      console.log(`⏭  スキップ（対象外）: ${topic.title.slice(0, 40)}`);
      continue;
    }

    const area = extractArea(topic.title, topic.summary);
    const slug = toNewsSlug(today, topic.title, topic.url, usedSlugs);
    const body = (topic.summary || '').replace(/\s+/g, ' ').trim().slice(0, 150);

    const md = `---
title: "${topic.title.replace(/"/g, '\\"')}"
type: "${type}"
date: "${today}"
area: "${area}"
reporter: "編集部"
source: "${topic.url}"
---

${body}
`.trimEnd() + '\n';

    fs.writeFileSync(path.join(NEWS_DIR, `${slug}.md`), md, 'utf-8');
    existingUrls.add(topic.url); // 同一実行内の重複も防ぐ
    saved.push({ slug, title: topic.title, type });
    console.log(`✅ 情報収集に追加: [${type}] ${topic.title.slice(0, 40)}`);
  }

  return saved;
}

// ── Exa リサーチ ──────────────────────────────────────────────

function todayJST() {
  return new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().split('T')[0];
}

function getRunLabel() {
  const hour = parseInt(new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(11, 13));
  return hour < 13 ? '朝' : '夕方';
}

async function runResearch(today) {
  if (!process.env.EXA_API_KEY) throw new Error('EXA_API_KEY が設定されていません');

  const exa = new Exa(process.env.EXA_API_KEY);
  const yyyy   = today.slice(0, 4);
  const yyyymm = today.slice(0, 7);

  const queries = [
    `函館 グルメ 新店 オープン ${yyyymm}`,
    `函館 イベント ${yyyymm}`,
    `函館 暮らし 移住 地域 ${yyyy}`,
    `北斗市 七飯町 ニュース ${yyyy}`,
    `函館 お店 開店 閉店 ${yyyymm}`,
    `函館 ビジネス 起業 地域経済 ${yyyy}`,
    `site:dateper.net 函館 ${yyyymm}`,
  ];

  const seen    = new Set();
  const results = [];

  for (const query of queries) {
    try {
      const res = await exa.searchAndContents(query, {
        numResults: 3,
        type: 'neural',
        useAutoprompt: true,
        startPublishedDate: `${yyyy}-01-01`,
        text: { maxCharacters: 300 },
      });
      for (const r of res.results) {
        if (!seen.has(r.url) && r.title) {
          seen.add(r.url);
          results.push({
            title:   r.title,
            url:     r.url,
            summary: (r.text || '').replace(/\s+/g, ' ').trim().slice(0, 120),
            writer:  suggestWriter(r.title, r.text || ''),
          });
        }
      }
    } catch (e) {
      console.warn(`  検索スキップ (${query}): ${e.message}`);
    }
  }

  return results.slice(0, 8);
}

// ── Discord 通知 ──────────────────────────────────────────────

function sendDiscord(webhookUrl, message) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ content: message });
    const url  = new URL(webhookUrl);
    const req  = https.request({
      hostname: url.hostname, path: url.pathname + url.search,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
    }, res => { console.log(`Discord通知: HTTP ${res.statusCode}`); resolve(); });
    req.on('error', reject);
    req.write(body); req.end();
  });
}

function buildDiscordMessages(today, label, topics, savedNews) {
  const savedUrls = new Set(savedNews.map(s => s.slug));
  const addedCount = savedNews.length;

  // ヘッダー
  const header = [
    `🔍 **${today} ${label}のリサーチ** | カッテニハコダテ`,
    `${topics.length}件見つかりました。${addedCount > 0 ? `うち **${addedCount}件** を情報収集に自動追加。` : '情報収集への新規追加はなし。'}`,
    addedCount > 0 ? `記事化したいネタは Actions → 記事下書き生成 で実行。` : `記事化したいネタは Actions → 記事下書き生成 で実行。`,
  ].join('\n');

  // トピックを1件ずつ
  const topicMessages = topics.map((t, i) => {
    const newsItem = savedNews.find(s => s.title === t.title);
    const newsTag  = newsItem ? `✅ 情報収集に追加 [${newsItem.type}]` : '';
    const lines = [
      `**${i + 1}. ${t.title}**`,
      t.summary ? `> ${t.summary.slice(0, 100)}${t.summary.length > 100 ? '…' : ''}` : '',
      `🔗 <${t.url}>`,
      newsTag,
      `→ ${t.writer.emoji} ${t.writer.name}（\`${t.writer.id}\`）向き`,
    ].filter(Boolean);
    return lines.join('\n');
  });

  return [header, ...topicMessages];
}

// ── メイン ────────────────────────────────────────────────────

async function main() {
  const today = todayJST();
  const label = getRunLabel();
  console.log(`📅 ${today} ${label}のリサーチ開始`);

  const topics = await runResearch(today);
  console.log(`✅ ${topics.length}件のネタ候補を取得`);

  // 情報収集に自動追加
  console.log('📋 情報収集への自動追加を処理中...');
  const savedNews = saveNewsItems(topics, today);
  console.log(`📋 情報収集に ${savedNews.length}件追加`);

  if (!process.env.DISCORD_ARTICLE_WEBHOOK_URL) {
    console.log('DISCORD_ARTICLE_WEBHOOK_URL未設定 — 結果をコンソール出力のみ');
    topics.forEach((t, i) => console.log(`${i+1}. [${t.writer.name}] ${t.title}\n   ${t.url}`));
    return;
  }

  const messages = buildDiscordMessages(today, label, topics, savedNews);
  for (const msg of messages) {
    await sendDiscord(process.env.DISCORD_ARTICLE_WEBHOOK_URL, msg);
  }
  console.log('✅ Discord通知完了');
}

main().catch(err => {
  console.error('❌ エラー:', err.message);
  process.exit(1);
});
