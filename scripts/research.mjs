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

function buildDiscordMessage(today, topics) {
  const lines = [
    `🔍 **${today} 朝のネタ候補** | カッテニハコダテ`,
    '',
    `${topics.length}件の情報が見つかりました。記事にしたいネタを選んで \`write.yml\` を実行してください。`,
    '',
  ];

  topics.forEach((t, i) => {
    lines.push(`**${i + 1}. ${t.title}**`);
    if (t.summary) lines.push(`> ${t.summary}`);
    lines.push(`🔗 ${t.url}`);
    lines.push(`→ ${t.writer.emoji} **${t.writer.name}** (ID: \`${t.writer.id}\`) 向き`);
    lines.push('');
  });

  lines.push('---');
  lines.push('**記事を書かせる方法（GitHubの Actions → 記事下書き生成 から実行）**');
  lines.push('```');
  lines.push('ネタ: URLまたは説明文');
  lines.push('ライターID: masaru / taro / rin / sora / shizuku（空欄で自動）');
  lines.push('```');

  return lines.join('\n');
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

  const message = buildDiscordMessage(today, topics);
  await sendDiscord(process.env.DISCORD_ARTICLE_WEBHOOK_URL, message);
  console.log('✅ Discord通知完了');
}

main().catch(err => {
  console.error('❌ エラー:', err.message);
  process.exit(1);
});
