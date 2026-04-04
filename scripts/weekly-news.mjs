/**
 * カッテニハコダテ — 週刊まとめ記事生成スクリプト
 * 直近7日間のニュース（src/content/news/）を読み、
 * Claudeが1本の週刊まとめ記事を生成してarticlesに保存する。
 */

import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname  = path.dirname(fileURLToPath(import.meta.url));
const NEWS_DIR   = path.join(__dirname, '../src/content/news');
const OUTPUT_DIR = path.join(__dirname, '../src/content/articles');

// ── 日付ユーティリティ ──────────────────────────────────────────

function todayJST() {
  return new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().split('T')[0];
}

function lastWeekRange() {
  const now = Date.now() + 9 * 60 * 60 * 1000;
  const end   = new Date(now);
  const start = new Date(now - 7 * 24 * 60 * 60 * 1000);
  const fmt = d => d.toISOString().split('T')[0];
  return { start: fmt(start), end: fmt(end) };
}

function jpDateRange(start, end) {
  const fmt = s => {
    const d = new Date(s);
    return `${d.getMonth() + 1}月${d.getDate()}日`;
  };
  return `${fmt(start)}〜${fmt(end)}`;
}

// ── ニュース収集 ────────────────────────────────────────────────

function loadWeeklyNews(start, end) {
  const files = fs.readdirSync(NEWS_DIR).filter(f => f.endsWith('.md'));
  const items = [];

  for (const file of files) {
    const raw  = fs.readFileSync(path.join(NEWS_DIR, file), 'utf-8');
    const date = (raw.match(/^date:\s*"?([^"\n]+)"?/m) || [])[1]?.trim();
    if (!date || date < start || date > end) continue;

    const title    = (raw.match(/^title:\s*"?([^"\n]+)"?/m) || [])[1]?.replace(/\\"/g, '"').trim();
    const type     = (raw.match(/^type:\s*"?([^"\n]+)"?/m) || [])[1]?.trim();
    const area     = (raw.match(/^area:\s*"?([^"\n]+)"?/m) || [])[1]?.trim();
    const body     = raw.split('---').slice(2).join('---').trim();

    if (title) items.push({ date, type, area, title, body });
  }

  return items.sort((a, b) => a.date.localeCompare(b.date));
}

// ── 記事生成 ────────────────────────────────────────────────────

async function generateArticle(items, dateRange, today) {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const newsText = items.map((n, i) =>
    `${i + 1}. 【${n.type}】${n.title}（${n.area}、${n.date}）\n${n.body || ''}`
  ).join('\n\n');

  const prompt = `あなたは「カッテニハコダテ」という函館ローカルメディアの編集部員です。
以下は今週（${dateRange}）に収集した函館の開店・閉店・街の変化情報です。

${newsText}

これらをもとに、函館市民・函館ファン向けの「今週の函館ニュースまとめ」記事を書いてください。

【条件】
- 記事タイトル：「今週の函館（${dateRange}）開店・閉店・街の変化まとめ」に近い形で自然に
- 書き出しは「今週も函館のあちこちで…」のような自然な導入から
- 各ニュースを簡潔に紹介（1〜2文ずつ）
- 開店・閉店・工事中などタイプ別にまとめるとわかりやすい
- 締めは「来週もカッテニハコダテで函館の変化をお届けします」的な一言
- 文体：明るく親しみやすく、地元愛を感じる雰囲気
- 分量：400〜600文字
- Markdown形式（##見出しを使ってOK）

以下のJSON形式で返してください（コードブロック不要）：
{
  "title": "記事タイトル",
  "description": "記事の概要（60文字以内）",
  "slug": "weekly-news-YYYY-MM-DD形式（例：weekly-news-${today}）",
  "content": "記事本文（Markdown）"
}`;

  const res = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = res.content[0].text.trim();
  const json = text.startsWith('{') ? text : text.match(/\{[\s\S]+\}/)?.[0];
  return JSON.parse(json);
}

// ── ファイル保存 ────────────────────────────────────────────────

function saveArticle(article, today) {
  const slug     = article.slug || `weekly-news-${today}`;
  const filePath = path.join(OUTPUT_DIR, `${slug}.md`);

  const md = `---
title: "${article.title.replace(/"/g, '\\"')}"
description: "${article.description.replace(/"/g, '\\"')}"
category: "暮らし"
date: "${today}"
author: "編集部"
featured: true
---

${article.content.trim()}
`;

  fs.writeFileSync(filePath, md, 'utf-8');
  return { filePath, slug };
}

// ── 結果出力 ────────────────────────────────────────────────────

function writeResult(slug, article) {
  fs.writeFileSync('/tmp/weekly-result.json', JSON.stringify({
    slug,
    title:       article.title,
    description: article.description,
  }), 'utf-8');
}

// ── メイン ──────────────────────────────────────────────────────

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY が必要です');

  const today = todayJST();
  const { start, end } = lastWeekRange();
  const dateRange = jpDateRange(start, end);

  console.log(`📅 ${today} — 週刊まとめ記事生成`);
  console.log(`📰 対象期間: ${start} 〜 ${end}`);

  const items = loadWeeklyNews(start, end);
  console.log(`✅ ${items.length}件のニュースを取得`);

  if (items.length === 0) {
    console.log('今週のニュースがないため記事生成をスキップします');
    process.exit(0);
  }

  console.log('✍️  記事を生成中...');
  const article = await generateArticle(items, dateRange, today);

  const { filePath, slug } = saveArticle(article, today);
  writeResult(slug, article);

  console.log(`✅ 完了！`);
  console.log(`   タイトル: ${article.title}`);
  console.log(`   ファイル: ${filePath}`);
}

main().catch(err => {
  console.error('❌ エラー:', err.message);
  process.exit(1);
});
