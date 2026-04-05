/**
 * カッテニハコダテ【収集部】SNSキュー処理スクリプト
 *
 * Apps Script 09_sns.gs が src/content/sns-queue/ にコミットした
 * スクショ画像を Claude Vision で解析して news/*.md を生成する。
 * 処理済み画像は削除する。
 */

import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname   = path.dirname(fileURLToPath(import.meta.url));
const QUEUE_DIR   = path.join(__dirname, '../src/content/sns-queue');
const NEWS_DIR    = path.join(__dirname, '../src/content/news');

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
if (!ANTHROPIC_API_KEY) { console.error('❌ ANTHROPIC_API_KEY が未設定'); process.exit(1); }

const IMAGE_EXTS = /\.(jpg|jpeg|png|webp|gif|heic|heif)$/i;
const MIME_MAP   = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', gif: 'image/gif' };

// ── ユーティリティ ─────────────────────────────────────────────

function todayJST() {
  return new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().split('T')[0];
}

function getMimeType(filePath) {
  const ext = path.extname(filePath).slice(1).toLowerCase();
  return MIME_MAP[ext] || 'image/jpeg';
}

// ── Claude Vision で複数画像を一括解析 ────────────────────────

async function analyzeImages(imagePaths) {
  const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

  const imageBlocks = imagePaths.map(p => ({
    type: 'image',
    source: {
      type: 'base64',
      media_type: getMimeType(p),
      data: fs.readFileSync(p).toString('base64'),
    },
  }));

  const prompt = `あなたは函館ローカル情報サイト「カッテニハコダテ」の編集スタッフです。
${imagePaths.length}枚の画像（店舗の看板・お知らせ・SNSのスクリーンショットなど）を解析してください。

各画像について以下のJSON配列形式で返してください（コードブロック不要）:
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

  const res = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    messages: [{
      role: 'user',
      content: [...imageBlocks, { type: 'text', text: prompt }],
    }],
  });

  const text = res.content[0].text.trim();
  const json = text.startsWith('[') ? text : text.match(/\[[\s\S]+\]/)?.[0];
  const results = JSON.parse(json);
  return Array.isArray(results) ? results : [results];
}

// ── news ファイル生成 ──────────────────────────────────────────

function saveNewsFile(info, date) {
  if (!fs.existsSync(NEWS_DIR)) fs.mkdirSync(NEWS_DIR, { recursive: true });

  const typeSlug = { '開店': 'open', '閉店': 'close', '工事中': 'kojichu', 'イベント': 'event', '目撃情報': 'sighting', 'その他': 'news' }[info.type] || 'news';
  const timestamp = Date.now().toString().slice(-4);
  const slug = `${date}-sns-${typeSlug}-${timestamp}`;

  const md = `---
title: "${info.title.replace(/"/g, '\\"')}"
type: "${info.type}"
date: "${date}"
area: "${info.area}"
reporter: "SNS投稿"
---

${info.body || ''}
`.trimEnd() + '\n';

  fs.writeFileSync(path.join(NEWS_DIR, `${slug}.md`), md, 'utf-8');
  console.log(`✅ 生成: ${slug}`);
  return slug;
}

// ── メイン ────────────────────────────────────────────────────

async function main() {
  if (!fs.existsSync(QUEUE_DIR)) {
    console.log('SNSキューディレクトリが存在しません');
    fs.writeFileSync('/tmp/sns-queue-result.json', JSON.stringify({ created: [] }));
    return;
  }

  const imageFiles = fs.readdirSync(QUEUE_DIR)
    .filter(f => IMAGE_EXTS.test(f) && !f.startsWith('_done_'))
    .map(f => path.join(QUEUE_DIR, f));

  if (imageFiles.length === 0) {
    console.log('処理対象の画像なし');
    fs.writeFileSync('/tmp/sns-queue-result.json', JSON.stringify({ created: [] }));
    return;
  }

  console.log(`🖼  SNSキュー内の画像: ${imageFiles.length}件`);

  const today = todayJST();
  const created = [];
  const BATCH = 5; // 1リクエストあたり最大5枚

  for (let i = 0; i < imageFiles.length; i += BATCH) {
    const batch = imageFiles.slice(i, i + BATCH);
    console.log(`\n📦 バッチ ${Math.floor(i / BATCH) + 1}: ${batch.map(p => path.basename(p)).join(', ')}`);

    try {
      const results = await analyzeImages(batch);

      for (let j = 0; j < results.length; j++) {
        const info = results[j];
        const imgPath = batch[j];
        const basename = path.basename(imgPath);

        if (info.skip) {
          console.log(`  [${basename}] → スキップ（情報なし）`);
        } else if (info.confidence === 'low') {
          console.log(`  [${basename}] → 信頼度低のためスキップ: ${info.title}`);
        } else {
          console.log(`  [${basename}] → ${info.type}「${info.title}」（${info.area}）`);
          created.push(saveNewsFile(info, today));
        }

        // 処理済みとしてリネーム
        fs.renameSync(imgPath, path.join(QUEUE_DIR, `_done_${basename}`));
      }
    } catch (err) {
      console.error(`  ❌ バッチエラー: ${err.message}`);
    }
  }

  console.log(`\n✅ 完了 — ${created.length}件のニュースを生成`);
  fs.writeFileSync('/tmp/sns-queue-result.json', JSON.stringify({ created }));
}

main().catch(err => {
  console.error('❌ エラー:', err.message);
  process.exit(1);
});
