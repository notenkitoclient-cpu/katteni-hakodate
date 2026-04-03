/**
 * カッテニハコダテ — 朝のリサーチスクリプト
 * 函館の最新情報を収集してネタ候補をDiscordに通知する
 * （記事は書かない。編集長が選んだネタだけ write.mjs で記事化する）
 */

import Exa from 'exa-js';
import https from 'https';
import { fileURLToPath } from 'url';

const SITE_URL = process.env.SITE_URL?.replace(/\/$/, '') || 'https://katteni-hakodate.pages.dev';

// ライターの得意分野（ネタ候補への推薦用）
const WRITER_SPECIALTY = {
  masaru: { name: '港 まさあき', emoji: '🐟', tags: ['グルメ', '食', '朝市', '飲食店', '居酒屋', '海鮮'] },
  taro:   { name: '坂本 颯',     emoji: '🚲', tags: ['開店', 'オープン', '閉店', '工事', '新しい', '変化'] },
  rin:    { name: '深海 凛',     emoji: '📊', tags: ['ビジネス', '移住', '経済', '行政', '企業', '起業'] },
  sora:   { name: '西野 そら',   emoji: '🌟', tags: ['イベント', '祭り', 'フェス', '若者', '大学', '体験'] },
  shizuku:{ name: '霧野 しずく', emoji: '🌫', tags: ['暮らし', '移住', '日常', 'カフェ', '生活'] },
};

function suggestWriter(title, text) {
  const content = (title + ' ' + text).toLowerCase();
  for (const [id, w] of Object.entries(WRITER_SPECIALTY)) {
    if (w.tags.some(tag => content.includes(tag))) return { id, ...w };
  }
  return { id: 'taro', ...WRITER_SPECIALTY.taro }; // デフォルト
}

function todayJST() {
  const jst = new Date(Date.now() + 9 * 60 * 60 * 1000);
  return jst.toISOString().split('T')[0];
}

// ── Exa リサーチ ──────────────────────────────────────────────

async function runResearch(today) {
  if (!process.env.EXA_API_KEY) throw new Error('EXA_API_KEY が設定されていません');

  const exa = new Exa(process.env.EXA_API_KEY);
  const yyyy = today.slice(0, 4);
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

  const seen = new Set();
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
          const writer = suggestWriter(r.title, r.text || '');
          results.push({
            title: r.title,
            url: r.url,
            summary: (r.text || '').replace(/\s+/g, ' ').trim().slice(0, 120),
            writer,
          });
        }
      }
    } catch (e) {
      console.warn(`  検索スキップ (${query}): ${e.message}`);
    }
  }

  // 重複排除して最大8件
  return results.slice(0, 8);
}

// ── Discord 通知 ──────────────────────────────────────────────

function sendDiscord(webhookUrl, message) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ content: message });
    const url = new URL(webhookUrl);
    const req = https.request({
      hostname: url.hostname, path: url.pathname + url.search,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
    }, res => {
      console.log(`Discord通知: HTTP ${res.statusCode}`);
      resolve();
    });
    req.on('error', reject);
    req.write(body); req.end();
  });
}

function buildDiscordMessages(today, topics) {
  // 1通目：ヘッダー
  const header = [
    `🔍 **${today} 朝のネタ候補** | カッテニハコダテ`,
    `${topics.length}件見つかりました。記事化したいネタは Actions → 記事下書き生成 で実行。`,
  ].join('\n');

  // 2通目以降：トピックを1件ずつ
  const topicMessages = topics.map((t, i) => {
    const lines = [
      `**${i + 1}. ${t.title}**`,
      t.summary ? `> ${t.summary.slice(0, 100)}${t.summary.length > 100 ? '…' : ''}` : '',
      `🔗 ${t.url}`,
      `→ ${t.writer.emoji} ${t.writer.name}（\`${t.writer.id}\`）向き`,
    ].filter(Boolean);
    return lines.join('\n');
  });

  return [header, ...topicMessages];
}

// ── メイン ────────────────────────────────────────────────────

async function main() {
  const today = todayJST();
  console.log(`📅 ${today} のリサーチ開始`);

  const topics = await runResearch(today);
  console.log(`✅ ${topics.length}件のネタ候補を取得`);

  if (!process.env.DISCORD_ARTICLE_WEBHOOK_URL) {
    console.log('DISCORD_ARTICLE_WEBHOOK_URL未設定 — 結果をコンソール出力のみ');
    topics.forEach((t, i) => console.log(`${i+1}. [${t.writer.name}] ${t.title}\n   ${t.url}`));
    return;
  }

  const messages = buildDiscordMessages(today, topics);
  for (const msg of messages) {
    await sendDiscord(process.env.DISCORD_ARTICLE_WEBHOOK_URL, msg);
  }
  console.log('✅ Discord通知完了');
}

main().catch(err => {
  console.error('❌ エラー:', err.message);
  process.exit(1);
});
