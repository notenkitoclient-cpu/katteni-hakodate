/**
 * カッテニハコダテ — Discord スクショ読み取りスクリプト
 *
 * 指定チャンネルの新規画像投稿を取得 → Claude で内容解析 →
 * /api/news/ingest に送信して管理画面の審査待ちに追加する。
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Anthropic from '@anthropic-ai/sdk';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROCESSED_FILE = path.join(__dirname, '../src/data/discord-processed-message-ids.json');

const DISCORD_TOKEN  = process.env.DISCORD_BOT_TOKEN;
const CHANNEL_ID     = process.env.DISCORD_SCREENSHOT_CHANNEL_ID;
const ANTHROPIC_KEY  = process.env.ANTHROPIC_API_KEY;
const SITE_URL       = process.env.SITE_URL;
const INGEST_SECRET  = process.env.INGEST_SECRET;

// ── 処理済みメッセージID管理 ──────────────────────────────────

function loadProcessedIds() {
  try { return new Set(JSON.parse(fs.readFileSync(PROCESSED_FILE, 'utf-8'))); }
  catch { return new Set(); }
}

function saveProcessedIds(ids) {
  // 最新1000件だけ保持
  const arr = [...ids].slice(-1000);
  fs.writeFileSync(PROCESSED_FILE, JSON.stringify(arr, null, 2) + '\n', 'utf-8');
}

// ── Discord APIから画像付きメッセージを取得 ────────────────────

async function fetchDiscordMessages(afterId) {
  const url = `https://discord.com/api/v10/channels/${CHANNEL_ID}/messages?limit=50${afterId ? `&after=${afterId}` : ''}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bot ${DISCORD_TOKEN}` },
  });
  if (!res.ok) throw new Error(`Discord API エラー: ${res.status}`);
  return await res.json();
}

// ── 画像をbase64に変換 ───────────────────────────────────────

async function imageToBase64(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`画像取得失敗: ${res.status}`);
  const buffer = await res.arrayBuffer();
  const contentType = res.headers.get('content-type') || 'image/png';
  return { base64: Buffer.from(buffer).toString('base64'), mediaType: contentType };
}

// ── Claude で画像を解析 ──────────────────────────────────────

async function analyzeImage(base64, mediaType) {
  const client = new Anthropic({ apiKey: ANTHROPIC_KEY });

  const response = await client.messages.create({
    model: 'claude-opus-4-7',
    max_tokens: 1024,
    messages: [{
      role: 'user',
      content: [
        {
          type: 'image',
          source: { type: 'base64', media_type: mediaType, data: base64 },
        },
        {
          type: 'text',
          text: `この画像から函館市内の店舗・ニュース情報を抽出してください。

以下のJSON形式で返してください。情報が読み取れない場合はnullにしてください。
{
  "title": "ニュースのタイトル（店名＋内容を簡潔に）",
  "type": "開店 or 閉店 or イベント or 目撃情報 or その他",
  "area": "エリア名（例：函館駅前、西部地区、五稜郭など）",
  "body": "詳細情報（最大100文字）",
  "url": null
}

JSONのみ返してください。前後に説明文は不要です。`,
        },
      ],
    }],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  return JSON.parse(match[0]);
}

// ── メイン ───────────────────────────────────────────────────

async function main() {
  if (!DISCORD_TOKEN || !CHANNEL_ID || !ANTHROPIC_KEY || !SITE_URL || !INGEST_SECRET) {
    throw new Error('必要な環境変数が未設定です');
  }

  const processedIds = loadProcessedIds();
  const lastId = [...processedIds].sort().pop() || null;

  console.log(`📡 Discord チャンネル取得中... (after: ${lastId ?? '先頭から'})`);
  const messages = await fetchDiscordMessages(lastId);

  // 画像付きメッセージだけ抽出
  const imageMessages = messages.filter(m =>
    m.attachments?.some(a => a.content_type?.startsWith('image/'))
  );

  console.log(`🖼  画像付きメッセージ: ${imageMessages.length}件`);

  const toIngest = [];

  for (const msg of imageMessages) {
    if (processedIds.has(msg.id)) continue;

    const attachment = msg.attachments.find(a => a.content_type?.startsWith('image/'));
    if (!attachment) continue;

    console.log(`  解析中: message ${msg.id} (${attachment.filename})`);
    try {
      const { base64, mediaType } = await imageToBase64(attachment.url);
      const info = await analyzeImage(base64, mediaType);

      if (info?.title) {
        toIngest.push(info);
        console.log(`  ✅ 抽出: [${info.type}] ${info.title}`);
      } else {
        console.log(`  ⏭  情報なし: スキップ`);
      }
    } catch (e) {
      console.warn(`  ⚠️  解析エラー: ${e.message}`);
    }

    processedIds.add(msg.id);
  }

  saveProcessedIds(processedIds);

  if (toIngest.length === 0) {
    console.log('\n新規ニュースなし。完了。');
    return;
  }

  // API経由でDB保存
  const res = await fetch(`${SITE_URL}/api/news/ingest`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-ingest-secret': INGEST_SECRET },
    body: JSON.stringify(toIngest),
  });
  const json = await res.json();
  console.log(`\n📥 DB保存: ${json.added}件追加, ${json.skipped}件スキップ`);
  console.log('✅ 完了 — 管理画面の「ニュース審査待ち」を確認してください');
}

main()
  .then(() => process.exit(0))
  .catch(err => { console.error('❌', err.message); process.exit(1); });
