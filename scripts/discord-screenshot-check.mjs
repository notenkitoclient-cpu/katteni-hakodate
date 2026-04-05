/**
 * カッテニハコダテ — Discord スクショ自動取り込みスクリプト
 * 指定チャンネルの未処理メッセージを取得し、
 * 添付画像を Claude Vision で解析して news/*.md を生成する。
 */

import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const NEWS_DIR   = path.join(__dirname, '../src/content/news');
const STATE_FILE = path.join(__dirname, '../src/data/discord-last-message-id.txt');

const DISCORD_BOT_TOKEN     = process.env.DISCORD_BOT_TOKEN;
const DISCORD_CHANNEL_ID    = process.env.DISCORD_SCREENSHOT_CHANNEL_ID;
const ANTHROPIC_API_KEY     = process.env.ANTHROPIC_API_KEY;

if (!DISCORD_BOT_TOKEN || !DISCORD_CHANNEL_ID || !ANTHROPIC_API_KEY) {
  console.error('❌ 必要な環境変数が不足しています');
  process.exit(1);
}

// ── ユーティリティ ─────────────────────────────────────────────

function todayJST() {
  return new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().split('T')[0];
}

function loadLastMessageId() {
  try {
    return fs.readFileSync(STATE_FILE, 'utf-8').trim();
  } catch {
    return null;
  }
}

function saveLastMessageId(id) {
  fs.mkdirSync(path.dirname(STATE_FILE), { recursive: true });
  fs.writeFileSync(STATE_FILE, id, 'utf-8');
}

// ── Discord API ────────────────────────────────────────────────

function discordGet(endpoint) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'discord.com',
      path: `/api/v10${endpoint}`,
      method: 'GET',
      headers: {
        'Authorization': `Bot ${DISCORD_BOT_TOKEN}`,
        'Content-Type': 'application/json',
      },
    };
    const req = https.request(options, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch { reject(new Error(`JSON parse error: ${data}`)); }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function fetchNewMessages(afterId) {
  let endpoint = `/channels/${DISCORD_CHANNEL_ID}/messages?limit=20`;
  if (afterId) endpoint += `&after=${afterId}`;
  const messages = await discordGet(endpoint);
  if (!Array.isArray(messages)) {
    console.error('Discord API error:', messages);
    return [];
  }
  // after指定時は古い順に返す
  return afterId ? messages.reverse() : messages;
}

// ── 画像ダウンロード ───────────────────────────────────────────

function downloadImageAsBase64(url) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = { hostname: urlObj.hostname, path: urlObj.pathname + urlObj.search };
    https.get(options, res => {
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => {
        const buf = Buffer.concat(chunks);
        resolve(buf.toString('base64'));
      });
    }).on('error', reject);
  });
}

// ── Claude Vision で情報抽出（複数画像バッチ対応）────────────

/**
 * 同一メッセージの画像をまとめて1リクエストで解析する。
 * 返り値: 各画像に対応する結果オブジェクトの配列
 */
async function analyzeImages(base64Images, messageText) {
  const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

  const imageCount = base64Images.length;
  const prompt = `あなたは函館ローカル情報サイト「カッテニハコダテ」の編集スタッフです。
${imageCount > 1 ? `${imageCount}枚の画像が` : '画像が'}送られてきました（店舗の看板・お知らせ・SNSのスクリーンショットなど）。
函館の開店・閉店・その他街の変化に関する情報を読み取ってください。

${messageText ? `投稿者のコメント: "${messageText}"` : ''}

各画像について以下のJSON形式で返してください。配列で返し、画像と同じ順番にしてください（コードブロック不要）:
[
  {
    "type": "開店" | "閉店" | "工事中" | "イベント" | "目撃情報" | "その他",
    "title": "簡潔なニュースタイトル（40文字以内）",
    "area": "場所・エリア（例: 五稜郭、末広町、湯川など）",
    "body": "詳細内容（2〜3文。わかる範囲で）",
    "confidence": "high" | "medium" | "low"
  }
]

情報が読み取れない・函館と無関係な画像は {"skip": true} を入れてください。`;

  const imageBlocks = base64Images.map(b64 => ({
    type: 'image',
    source: { type: 'base64', media_type: 'image/jpeg', data: b64 },
  }));

  const res = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    messages: [{
      role: 'user',
      content: [...imageBlocks, { type: 'text', text: prompt }],
    }],
  });

  const text = res.content[0].text.trim();
  // 配列JSON を抽出
  const json = text.startsWith('[') ? text : text.match(/\[[\s\S]+\]/)?.[0];
  const results = JSON.parse(json);
  // 1枚のとき配列でなくオブジェクトが返る場合も吸収
  return Array.isArray(results) ? results : [results];
}

// ── news ファイル生成 ──────────────────────────────────────────

function saveNewsFile(info, date) {
  const slugDate = date;
  // 重複しないようにタイムスタンプをサフィックスに
  const timestamp = Date.now().toString().slice(-4);
  const typeSlug = { '開店': 'open', '閉店': 'close', '工事中': 'kojichu', 'イベント': 'event', '目撃情報': 'sighting', 'その他': 'news' }[info.type] || 'news';
  const slug = `${slugDate}-discord-${typeSlug}-${timestamp}`;
  const filePath = path.join(NEWS_DIR, `${slug}.md`);

  const md = `---
title: "${info.title.replace(/"/g, '\\"')}"
type: "${info.type}"
date: "${date}"
area: "${info.area}"
reporter: "Discord投稿"
---

${info.body || ''}
`;

  fs.writeFileSync(filePath, md, 'utf-8');
  console.log(`✅ 生成: ${slug}`);
  return slug;
}

// ── 結果出力 ──────────────────────────────────────────────────

function writeResult(created) {
  fs.writeFileSync('/tmp/discord-result.json', JSON.stringify({ created }), 'utf-8');
}

// ── メイン ────────────────────────────────────────────────────

async function main() {
  const lastId = loadLastMessageId();
  console.log(`📌 前回の最終メッセージID: ${lastId || 'なし（初回）'}`);

  const messages = await fetchNewMessages(lastId);
  console.log(`📨 取得メッセージ数: ${messages.length}`);

  if (messages.length === 0) {
    console.log('新しいメッセージなし');
    writeResult([]);
    return;
  }

  const created = [];

  for (const msg of messages) {
    const attachments = (msg.attachments || []).filter(a =>
      a.content_type?.startsWith('image/') ||
      a.content_type?.startsWith('application/octet-stream') ||
      /\.(jpg|jpeg|png|webp|gif|heic|heif)$/i.test(a.filename ?? '')
    );

    if (attachments.length === 0) continue;

    console.log(`\n🖼  メッセージ ${msg.id} に画像 ${attachments.length}件 → まとめて解析`);

    try {
      // 全画像を並列ダウンロード
      const base64Images = await Promise.all(
        attachments.map(a => downloadImageAsBase64(a.url))
      );

      // 1リクエストでまとめて解析
      const results = await analyzeImages(base64Images, msg.content || '');

      for (let i = 0; i < results.length; i++) {
        const info = results[i];
        const filename = attachments[i]?.filename || `image${i + 1}`;

        if (info.skip) {
          console.log(`  [${filename}] → スキップ（情報なし）`);
          continue;
        }
        if (info.confidence === 'low') {
          console.log(`  [${filename}] → 信頼度低のためスキップ: ${info.title}`);
          continue;
        }

        console.log(`  [${filename}] → ${info.type}「${info.title}」（${info.area}）`);
        const slug = saveNewsFile(info, todayJST());
        created.push(slug);
      }
    } catch (err) {
      console.error(`  ❌ エラー: ${err.message}`);
    }
  }

  // 最後のメッセージIDを保存
  const newestId = messages[messages.length - 1].id;
  saveLastMessageId(newestId);
  console.log(`\n💾 最終メッセージID更新: ${newestId}`);
  console.log(`✅ 完了 — ${created.length}件のニュースファイルを生成`);

  writeResult(created);
}

main().catch(err => {
  console.error('❌ エラー:', err.message);
  process.exit(1);
});
