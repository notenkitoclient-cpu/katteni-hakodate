/**
 * カッテニハコダテ — リサーチスクリプト
 *
 * 前日〜当日の24時間ウィンドウで函館の最新情報を収集し
 * src/content/news/ に重複なく自動追加する。
 *
 * 動作:
 *   - 検索対象: 昨日〜今日（JST）
 *   - 多様なクエリで函館ローカルメディアを中心に広くカバー
 *   - URL + タイトル類似の両方で既存ニュースとの重複を排除
 *   - Google News RSS URL（news.google.com）はスキップ
 *   - 函館・道南に無関係な記事はスキップ
 *   - 完了後 process.exit(0) で確実に終了（ハング防止）
 */

import Exa from 'exa-js';
import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const NEWS_DIR  = path.join(__dirname, '../src/content/news');

// ── 日付ユーティリティ ────────────────────────────────────────

function todayJST() {
  return new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().split('T')[0];
}

function yesterdayJST() {
  return new Date(Date.now() + 9 * 60 * 60 * 1000 - 24 * 60 * 60 * 1000)
    .toISOString().split('T')[0];
}

// ── 函館・道南関連チェック ────────────────────────────────────

const HAKODATE_WORDS = [
  '函館', '北斗', '七飯', '松前', '江差', '八雲', '長万部', '今金', '森町',
  '五稜郭', '湯川', '末広', '大門', '本町', '元町', '棒二', 'シエスタ',
  'ベイエリア', '函館駅', '亀田', '桔梗', '道南',
];

const OTHER_AREAS = [
  '新潟', '神保町', '東京', '大阪', '札幌', '仙台', '名古屋', '福岡',
  '横浜', '埼玉', '千葉', '京都', '広島', '沖縄', '旭川', '帯広',
];

function isHakodateRelated(title) {
  if (!HAKODATE_WORDS.some(w => title.includes(w))) return false;
  const firstOther = Math.min(...OTHER_AREAS.map(w => title.indexOf(w)).filter(i => i >= 0), Infinity);
  const firstLocal = Math.min(...HAKODATE_WORDS.map(w => title.indexOf(w)).filter(i => i >= 0), Infinity);
  return firstLocal <= firstOther;
}

// ── Google News RSS チェック ──────────────────────────────────

function isGoogleNewsUrl(url) {
  return /news\.google\.com/.test(url);
}

// ── ニュースタイプ分類（タイトルのみで判定）────────────────────

function classifyType(title) {
  if (/開店|オープン|新店|ニューオープン|リニューアルオープン|grand open/i.test(title)) return '開店';
  if (/閉店|クローズ|撤退|終了|破産|廃業|営業終了/.test(title)) return '閉店';
  return null;
}

// ── エリア抽出 ────────────────────────────────────────────────

function extractArea(title, text) {
  const c = title + ' ' + (text || '');
  const named = c.match(/(函館駅前|ベイエリア|五稜郭|湯川|元町|西部地区|末広町|大門|本町|棒二|シエスタ|亀田|桔梗|松風|美原|昭和|石川町|港町|田家)/);
  if (named) return named[1];
  const m = c.match(/([^\s　、。「」【】\d]{1,6}(?:丁目|[町区]))/);
  return m ? m[1] : '函館市内';
}

// ── タイトル類似チェック ──────────────────────────────────────

function extractKeyTerms(title) {
  const ja = title.match(/[\u3040-\u9fff\uff01-\uff60]{2,}/g) || [];
  const en = title.match(/[a-zA-Z0-9]{3,}/g) || [];
  return [...ja, ...en];
}

function isSimilarTitle(a, b) {
  const setA = new Set(extractKeyTerms(a));
  return extractKeyTerms(b).filter(t => setA.has(t)).length >= 2;
}

// ── 処理済みURL永続管理 ──────────────────────────────────────

const PROCESSED_URLS_FILE = path.join(__dirname, '../src/data/research-processed-urls.json');

function loadProcessedUrls() {
  try {
    return new Set(JSON.parse(fs.readFileSync(PROCESSED_URLS_FILE, 'utf-8')));
  } catch { return new Set(); }
}

function saveProcessedUrls(urlSet) {
  fs.writeFileSync(PROCESSED_URLS_FILE, JSON.stringify([...urlSet], null, 2) + '\n', 'utf-8');
}

// ── 既存ニュース読み込み ──────────────────────────────────────

function loadExistingNews() {
  if (!fs.existsSync(NEWS_DIR)) return { urls: new Set(), titles: [] };
  const urls   = loadProcessedUrls();
  const titles = [];
  for (const file of fs.readdirSync(NEWS_DIR).filter(f => f.endsWith('.md'))) {
    const raw = fs.readFileSync(path.join(NEWS_DIR, file), 'utf-8');
    const urlM   = raw.match(/^source:\s*["']?(.+?)["']?\s*$/m);
    const titleM = raw.match(/^title:\s*["']?(.+?)["']?\s*$/m);
    if (urlM)   urls.add(urlM[1].trim());
    if (titleM) titles.push(titleM[1].trim());
  }
  return { urls, titles };
}

// ── ニュースファイル保存 ──────────────────────────────────────

function saveNewsFile(title, type, area, date, url, summary) {
  if (!fs.existsSync(NEWS_DIR)) fs.mkdirSync(NEWS_DIR, { recursive: true });
  const usedSlugs = new Set(fs.readdirSync(NEWS_DIR).map(f => f.replace('.md', '')));

  let base = title
    .replace(/[^\w\s]/g, ' ').toLowerCase().trim()
    .split(/\s+/).filter(w => /^[a-z][a-z0-9]{1,}$/.test(w))
    .slice(0, 3).join('-');
  if (base.length < 3) {
    try { base = new URL(url).hostname.replace(/^www\./, '').split('.')[0]; }
    catch { base = 'news'; }
  }

  let slug = `${date}-${base}`.slice(0, 55);
  const orig = slug; let i = 2;
  while (usedSlugs.has(slug)) slug = `${orig}-${i++}`;

  // hakodate.blogなど一部サイトは関連記事タイトルがサマリーに混入する
  // 最初の1文（句点区切り）のみを本文として使用
  const cleanSummary = (summary || '').replace(/\s+/g, ' ').trim();
  const body = (cleanSummary.split('。')[0] || cleanSummary).slice(0, 120);
  const md = `---
title: "${title.replace(/"/g, '\\"')}"
type: "${type}"
date: "${date}"
area: "${area}"
reporter: "編集部"
source: "${url}"
---

${body}
`.trimEnd() + '\n';

  fs.writeFileSync(path.join(NEWS_DIR, `${slug}.md`), md, 'utf-8');
  return slug;
}

// ── 信頼済みローカルメディアドメイン ─────────────────────────
// これらのドメインからの記事は函館関連チェックをスキップ（タイトルに「函館」が入らない場合も多い）

const TRUSTED_LOCAL_DOMAINS = [
  'hakodate.blog', 'hakoaru.net', 'hakodate.goguynet.jp',
  'e-hakodate.com', 'hakodate-keizai.co.jp',
];

function isTrustedLocalDomain(url) {
  try {
    const host = new URL(url).hostname.replace(/^www\./, '');
    return TRUSTED_LOCAL_DOMAINS.some(d => host === d || host.endsWith('.' + d));
  } catch { return false; }
}

// ── Exa リサーチ ──────────────────────────────────────────────

async function runResearch(yesterday, today) {
  if (!process.env.EXA_API_KEY) throw new Error('EXA_API_KEY が設定されていません');

  const exa = new Exa(process.env.EXA_API_KEY);

  // 7日前（ローカルメディアは毎日更新されるとは限らない）
  const weekAgo = new Date(Date.now() + 9 * 60 * 60 * 1000 - 7 * 24 * 60 * 60 * 1000)
    .toISOString().split('T')[0];

  const queries = [
    // 開店・閉店（昨日〜今日）
    { q: '函館 オープン 開店',         n: 5, start: yesterday },
    { q: '函館 閉店 撤退 廃業',        n: 5, start: yesterday },
    { q: '函館 出店 進出 新規オープン', n: 4, start: yesterday },
    { q: '北斗市 七飯町 開店 閉店',    n: 3, start: yesterday },
    // ローカルメディア直接（過去7日）
    { q: 'site:hakodate.blog',          n: 5, start: weekAgo },
    { q: 'site:hakoaru.net',            n: 5, start: weekAgo },
    { q: 'site:hakodate.goguynet.jp',   n: 5, start: weekAgo },
  ];

  const seen    = new Set();
  const results = [];

  for (const { q, n, start } of queries) {
    try {
      const res = await exa.searchAndContents(q, {
        numResults:        n,
        type:              'neural',
        useAutoprompt:     true,
        startPublishedDate: start,
        endPublishedDate:   today,
        text: { maxCharacters: 400 },
      });
      const found = res.results.filter(r => r.title && !seen.has(r.url));
      console.log(`  "${q}": ${found.length}件`);
      for (const r of found) {
        seen.add(r.url);
        results.push({
          title:       r.title,
          url:         r.url,
          summary:     (r.text || '').replace(/\s+/g, ' ').trim(),
          trustedLocal: isTrustedLocalDomain(r.url),
        });
      }
    } catch (e) {
      console.warn(`  検索スキップ (${q}): ${e.message}`);
    }
  }

  return results;
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
    }, res => {
      res.resume(); // レスポンスボディを消費してTCP接続を解放（ハング防止）
      console.log(`Discord通知: HTTP ${res.statusCode}`);
      resolve();
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ── メイン ────────────────────────────────────────────────────

async function main() {
  const today     = todayJST();
  // RESEARCH_START_DATE で開始日を上書き可能（例: '2026-04-13'）
  const yesterday = process.env.RESEARCH_START_DATE || yesterdayJST();
  console.log(`📅 リサーチ開始: ${yesterday} → ${today}`);

  // 検索実行
  const rawResults = await runResearch(yesterday, today);
  console.log(`🔍 Exa取得: ${rawResults.length}件`);

  // 既存ニュースを読み込んでおく
  const { urls: existingUrls, titles: existingTitles } = loadExistingNews();
  const savedThisRun = [];

  for (const r of rawResults) {
    // Google News URLはスキップ
    if (isGoogleNewsUrl(r.url)) {
      console.log(`⏭  Google News: ${r.title.slice(0, 40)}`);
      continue;
    }

    // 函館・道南関連チェック（信頼済みローカルドメインはスキップ）
    if (!r.trustedLocal && !isHakodateRelated(r.title)) {
      console.log(`⏭  函館無関係: ${r.title.slice(0, 40)}`);
      continue;
    }

    // URL重複チェック
    if (existingUrls.has(r.url)) {
      console.log(`⏭  URL重複: ${r.title.slice(0, 40)}`);
      continue;
    }

    // タイトル類似チェック（既存＋今回追加分）
    const allTitles = [...existingTitles, ...savedThisRun.map(s => s.title)];
    if (allTitles.some(t => isSimilarTitle(r.title, t))) {
      console.log(`⏭  タイトル重複: ${r.title.slice(0, 40)}`);
      continue;
    }

    // ニュースタイプ判定（タイトルのみ）
    const type = classifyType(r.title);
    if (!type) {
      console.log(`⏭  対象外タイプ: ${r.title.slice(0, 40)}`);
      continue;
    }

    const area = extractArea(r.title, r.summary);
    const cleanSummary = (r.summary || '').replace(/\s+/g, ' ').trim();
    const body = (cleanSummary.split('。')[0] || cleanSummary).slice(0, 120);

    existingUrls.add(r.url);
    savedThisRun.push({ title: r.title, type, area, url: r.url, body });
    console.log(`✅ [${type}][${area}] ${r.title.slice(0, 45)}`);
  }

  // 処理済みURLをmainブランチ用ファイルに保存（次回実行時の重複防止）
  saveProcessedUrls(existingUrls);
  console.log(`\n完了: ${savedThisRun.length}件候補 (検索結果${rawResults.length}件中)`);

  // API経由でDBに保存（未承認として）
  const siteUrl = process.env.SITE_URL;
  const ingestSecret = process.env.INGEST_SECRET;
  if (siteUrl && ingestSecret && savedThisRun.length > 0) {
    try {
      const res = await fetch(`${siteUrl}/api/news/ingest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-ingest-secret': ingestSecret },
        body: JSON.stringify(savedThisRun),
      });
      const json = await res.json();
      console.log(`📥 DB保存: ${json.added}件追加, ${json.skipped}件スキップ`);
    } catch (e) {
      console.warn(`⚠️  DB保存エラー: ${e.message}`);
    }
  } else {
    console.log('SITE_URL/INGEST_SECRET未設定 — DB保存をスキップ');
  }

  // Discord通知
  const webhookUrl = process.env.DISCORD_ARTICLE_WEBHOOK_URL;
  if (!webhookUrl) {
    console.log('DISCORD_ARTICLE_WEBHOOK_URL未設定 — コンソール出力のみ');
    return;
  }

  const lines = [
    `🔍 **${today} リサーチ結果** | カッテニハコダテ`,
    `対象期間: ${yesterday} → ${today}`,
    `検索: ${rawResults.length}件取得 / **${savedThisRun.length}件** を情報収集に追加`,
    '',
    ...savedThisRun.map(s => `✅ [${s.type}] ${s.title}\n🔗 <${s.url}>`),
  ].filter(l => l !== undefined);

  // Discordは2000文字制限があるため2000字ごとに分割
  let chunk = '';
  const chunks = [];
  for (const line of lines) {
    if ((chunk + '\n' + line).length > 1900) { chunks.push(chunk); chunk = line; }
    else chunk = chunk ? chunk + '\n' + line : line;
  }
  if (chunk) chunks.push(chunk);

  for (const c of chunks) {
    await sendDiscord(webhookUrl, c);
  }
  console.log('✅ Discord通知完了');
}

main()
  .then(() => process.exit(0))   // 確実に終了（TCP接続残存によるハング防止）
  .catch(err => {
    console.error('❌ エラー:', err.message);
    process.exit(1);
  });
