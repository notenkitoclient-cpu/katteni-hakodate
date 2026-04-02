/**
 * カッテニハコダテ — 下書き生成スクリプト
 *
 * 使い方（ローカル）:
 *   node scripts/write.mjs --topic "URL or 説明" --writer "taro"
 *
 * 使い方（GitHub Actions）:
 *   workflow_dispatch inputs: topic, writer
 *
 * ネタ（topic）は URL でも日本語のテキスト説明でも OK。
 * writer を省略すると内容から自動選定。
 */

import Anthropic from '@anthropic-ai/sdk';
import Exa from 'exa-js';
import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DRAFTS_DIR = path.join(__dirname, '../src/content/drafts');
const SITE_URL = process.env.SITE_URL?.replace(/\/$/, '') || 'https://katteni-hakodate.pages.dev';

// ── ライター定義（generate-article.mjs と共通） ───────────────

const WRITERS = {
  shizuku: {
    id: 'shizuku', name: '霧野 しずく', emoji: '🌫',
    profile: '32歳。神奈川出身、元グラフィックデザイナー。7年前に函館へIターン。朝は必ず函館港をひとりで歩く。',
    specialty: '暮らし・移住・日常の気づき',
    voice: `
内省的ナラティブ型。「ふと、気がついた」「気がつけば」で段落を始める。
「――そう、」で自分の気づきを補足。「〜なのかもしれない」で文末を締める。
五感（視覚・聴覚・嗅覚）を3つ以上描写に含める。
書き出し: 「最近、〜していますか？」か「〜のことを、考えていた。」か「ふと、〜に気がついた。」
締め: 読者が自分の足元を見つめ直すような静かなエール。
絶対禁止: おすすめ、必見、ぜひ、トレンド、インスタ映え。`,
  },
  masaru: {
    id: 'masaru', name: '港 まさあき', emoji: '🐟',
    profile: '41歳。函館生まれ函館育ち。漁師の息子で朝市歴35年。「函館のうまいもん」なら誰にも負けない。',
    specialty: 'グルメ・食・地元民目線',
    voice: `
熱量共有型・地元民。「正直に言う」「函館生まれとして言わせてもらうと、」が口癖。
一人称は「オレ」。感嘆符「！」を6〜9回。
食レポは「見た目→香り→食感→味の余韻」の順。
書き出し: 「正直に言う。〜」か「〜を食べた。そのとき、思った。」か「函館生まれとして、これは黙っていられない。」
締め: 「絶対また来る」レベルの熱量で。
絶対禁止: 〜でございます、〜をご堪能ください。`,
  },
  taro: {
    id: 'taro', name: '坂本 颯', emoji: '🚲',
    profile: '28歳。函館市民歴28年（生え抜き）。フリーライター兼自転車愛好家。函館の変化を誰よりも早くキャッチするのが生きがい。',
    specialty: '開店・閉店・街の変化・速報',
    voice: `
地元密着エンタメ型。「〜のようす」を必ず1回以上。「なんと！」「ついに！」「まさかの」で驚きを表現。
【　】内のキャプション風コメントを1〜2か所（軽いボケを入れる）。
締めは必ず「以上、かってにはこだてでした」。
書き出し: 「函館に、〜がついに登場しました。」か「なんと！〜なようすが目撃されました。」か「〜ということで、行ってきました。」
絶対禁止: 弊社、〜させていただき、〜でございます。`,
  },
  rin: {
    id: 'rin', name: '深海 凛', emoji: '📊',
    profile: '38歳。函館市出身、東京のシンクタンク勤務を経て7年前にUターン。地域経済とまちづくりの研究をしながら執筆。',
    specialty: '人・ビジネス・地域経済',
    voice: `
構造的分析・ブリッジ型。数字・年・統計を必ず1か所以上。
「データを見ると、〜」「一方で、」「しかし、」が口癖。
専門用語の直後に「——つまり、〜ということだ」と言い換え必須。
書き出し: 「函館市の〜（数字）〜。この数字が示すのは〜」か「ある移住者が、こんなことを言っていた。『〜』」か「〜年前と今を比べると、函館の〜は大きく変わった。」
締め: 「人」や「暮らし」に帰着させ、静かな問いかけで。
絶対禁止: おすすめ、必見、絶対、インスタ映え。`,
  },
  sora: {
    id: 'sora', name: '西野 そら', emoji: '🌟',
    profile: '21歳。神奈川県横浜市出身。函館の大学に進学して2年目。函館に来て「当たり前」が全然違うことに毎日驚いている。',
    specialty: 'イベント・若者目線・地元との出会い',
    voice: `
道外出身・大学生・新鮮な若者目線。「え、これって普通じゃないの!?」「横浜だったら〜なのに」が口癖。
一人称は「わたし」。横浜・神奈川との比較を必ず1か所。
「まじで!?」「やばい（いい意味で）」「エモい」は1〜2回まで。
書き出し: 「函館に来て〜か月。いまだに慣れないことがある。」か「正直に言う。函館に来る前、わたしは〜だと思っていた。」か「先日、地元（横浜）の友達に電話したら、〜と言われた。」
締め: 謙虚さと函館への愛着で。
絶対禁止: 〜でございます、〜となっております、難しい専門用語。`,
  },
};

// ── ユーティリティ ────────────────────────────────────────────

function todayJST() {
  const jst = new Date(Date.now() + 9 * 60 * 60 * 1000);
  return jst.toISOString().split('T')[0];
}

function parseArgs() {
  const args = process.argv.slice(2);
  const get = (flag) => {
    const i = args.indexOf(flag);
    return i !== -1 ? args[i + 1] : null;
  };
  const topic  = get('--topic')  || process.env.TOPIC;
  const writer = get('--writer') || process.env.WRITER_ID;
  if (!topic) throw new Error('--topic が必要です（URLまたは説明文）');
  return { topic, writerId: writer };
}

function autoSelectWriter(topic) {
  const t = topic.toLowerCase();
  if (/グルメ|食|うまい|飲食|居酒屋|海鮮|朝市/.test(t)) return WRITERS.masaru;
  if (/開店|オープン|閉店|工事|新しい|できた/.test(t))   return WRITERS.taro;
  if (/ビジネス|起業|移住|経済|企業|行政/.test(t))        return WRITERS.rin;
  if (/イベント|祭り|フェス|体験|若者/.test(t))           return WRITERS.sora;
  return WRITERS.shizuku;
}

function loadExistingTitles() {
  const dir = path.join(__dirname, '../src/content/articles');
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.md'))
    .map(f => {
      const raw = fs.readFileSync(path.join(dir, f), 'utf-8');
      return (raw.match(/^title:\s*["']?(.+?)["']?\s*$/m) || [])[1] || '';
    });
}

// ── Exa でネタ深掘り ──────────────────────────────────────────

async function deepResearch(topic) {
  if (!process.env.EXA_API_KEY) {
    console.log('⚠️  EXA_API_KEY未設定 — ネタをそのままプロンプトに渡します');
    return null;
  }

  const exa = new Exa(process.env.EXA_API_KEY);
  const results = [];

  try {
    // URL が渡された場合はそのページを直接取得
    if (topic.startsWith('http')) {
      const res = await exa.getContents([topic], { text: { maxCharacters: 2000 } });
      if (res.results[0]) {
        results.push({ title: res.results[0].title, url: topic, text: res.results[0].text });
      }
    }

    // 関連情報も検索
    const searchRes = await exa.searchAndContents(
      topic.startsWith('http') ? `函館 関連情報 ${topic}` : `函館 ${topic}`,
      { numResults: 4, type: 'neural', useAutoprompt: true, text: { maxCharacters: 600 } }
    );
    for (const r of searchRes.results) {
      if (!results.find(x => x.url === r.url)) {
        results.push({ title: r.title, url: r.url, text: (r.text || '').trim() });
      }
    }
  } catch (e) {
    console.warn('リサーチエラー:', e.message);
  }

  console.log(`🔍 ${results.length}件の関連情報を取得`);
  return results.slice(0, 5);
}

// ── Claude で記事生成 ─────────────────────────────────────────

async function generateDraft(writer, topic, research, existingTitles, today) {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const researchSection = research && research.length > 0
    ? `## リサーチ情報（これをもとに書いてください）
${research.map((r, i) => `### [${i+1}] ${r.title}\n出典: ${r.url}\n${r.text}`).join('\n\n')}`
    : `## ネタ
${topic}`;

  const existingList = existingTitles.map(t => `- 『${t}』`).join('\n');

  const userPrompt = `今日は ${today} です。
あなた（${writer.name}）として、以下のネタをもとに記事を1本書いてください。

${researchSection}

## 既存記事（重複禁止）
${existingList || '（まだ記事はありません）'}

## 執筆ルール
カテゴリ（以下から1つ）: グルメ / 暮らし / イベント / 特産品 / 人・ビジネス

⚠️ 絶対に守ること:
- あなたの口癖・書き出し・締めのパターンを必ず使う
- 観光客向けの内容は禁止。函館市民の日常目線で
- リサーチ情報にない現状の事実（〜が咲いた、〜がオープンした等）は書かない
- 「行ってきた」等の架空体験は禁止
- 出典がある場合は記事末尾に「参考：URL」を記載

## 出力形式（JSONのみ）
{
  "slug": "半角英数字とハイフンのみ",
  "title": "記事タイトル（日本語）",
  "description": "要約80文字以内",
  "category": "カテゴリ名",
  "tags": ["タグ1", "タグ2"],
  "content": "記事本文（Markdown形式、400〜600文字、##見出し1〜2個）"
}`;

  const res = await client.messages.create({
    model: process.env.ARTICLE_MODEL || 'claude-sonnet-4-6',
    max_tokens: 2048,
    system: `あなたは「カッテニハコダテ」の専属ライター、${writer.name}です。\n\nプロフィール: ${writer.profile}\n\n文体・口癖（厳守）:\n${writer.voice}`,
    messages: [{ role: 'user', content: userPrompt }],
  });

  const text = res.content[0].text.trim();
  const m = text.match(/```json\s*([\s\S]+?)\s*```/) || text.match(/(\{[\s\S]+\})/);
  if (!m) throw new Error(`JSONが見つかりませんでした:\n${text.slice(0, 300)}`);
  return JSON.parse(m[1]);
}

// ── 下書き保存 ────────────────────────────────────────────────

function saveDraft(article, writer, topic, today) {
  if (!fs.existsSync(DRAFTS_DIR)) fs.mkdirSync(DRAFTS_DIR, { recursive: true });

  let slug = article.slug.replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
  if (fs.existsSync(path.join(DRAFTS_DIR, `${slug}.md`))) {
    slug = `${slug}-${today.replace(/-/g, '')}`;
  }

  const sourceUrl = topic.startsWith('http') ? topic : '';

  const md = `---
title: "${article.title.replace(/"/g, '\\"')}"
description: "${article.description.replace(/"/g, '\\"')}"
category: "${article.category}"
date: "${today}"
author: "${writer.name}"
writerId: "${writer.id}"${sourceUrl ? `\nsourceUrl: "${sourceUrl}"` : ''}${article.tags?.length ? `\ntags: [${article.tags.map(t => `"${t}"`).join(', ')}]` : ''}
featured: false
---

${article.content.trim()}
`;

  const filePath = path.join(DRAFTS_DIR, `${slug}.md`);
  fs.writeFileSync(filePath, md, 'utf-8');
  return { filePath, slug };
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
    }, res => { console.log(`Discord: HTTP ${res.statusCode}`); resolve(); });
    req.on('error', reject);
    req.write(body); req.end();
  });
}

// ── メイン ────────────────────────────────────────────────────

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY が未設定です');

  const today = todayJST();
  const { topic, writerId } = parseArgs();
  const writer = writerId ? WRITERS[writerId] : autoSelectWriter(topic);
  if (!writer) throw new Error(`不明なライターID: ${writerId}。使えるID: ${Object.keys(WRITERS).join(', ')}`);

  console.log(`📅 日付       : ${today}`);
  console.log(`📌 ネタ       : ${topic.slice(0, 80)}`);
  console.log(`${writer.emoji}  ライター   : ${writer.name}（${writer.specialty}）`);
  console.log('──────────────────────────');
  console.log('🔍 ネタを深掘りリサーチ中...');

  const research      = await deepResearch(topic);
  const existingTitles = loadExistingTitles();

  console.log('✍️  下書きを生成中...');
  const article = await generateDraft(writer, topic, research, existingTitles, today);

  console.log('💾 下書きを保存中...');
  const { slug } = saveDraft(article, writer, topic, today);

  const previewUrl = `${SITE_URL}/drafts/${slug}`;

  console.log('');
  console.log('✅ 下書き生成完了！');
  console.log(`   タイトル   : ${article.title}`);
  console.log(`   カテゴリ   : ${article.category}`);
  console.log(`   ライター   : ${writer.name}`);
  console.log(`   スラッグ   : ${slug}`);
  console.log(`   プレビュー : ${previewUrl}`);

  // 結果をファイルに書き出し（GitHub Actions の後続ステップで使用）
  fs.writeFileSync('/tmp/draft-result.json', JSON.stringify({
    slug, title: article.title, category: article.category,
    writer: writer.name, writerId: writer.id, writerEmoji: writer.emoji,
    previewUrl, sourceUrl: topic.startsWith('http') ? topic : '',
  }), 'utf-8');

  if (process.env.DISCORD_ARTICLE_WEBHOOK_URL) {
    const message = [
      `📝 **下書きができました** | カッテニハコダテ`,
      '',
      `${writer.emoji} **${article.title}**`,
      `> ${article.description}`,
      '',
      `🏷 カテゴリ: ${article.category}`,
      `✍️ ライター: ${writer.name}`,
      topic.startsWith('http') ? `📎 出典: ${topic}` : '',
      '',
      `👁 **プレビュー（デプロイ後1〜2分で閲覧可）**`,
      previewUrl,
      '',
      '---',
      '```',
      `✅ 公開する:  npm run publish ${slug}`,
      `❌ ボツにする: npm run reject ${slug}`,
      '```',
    ].filter(l => l !== undefined && !(l === '' && l !== '')).join('\n');

    await sendDiscord(process.env.DISCORD_ARTICLE_WEBHOOK_URL, message.replace(/\n{3,}/g, '\n\n'));
    console.log('✅ Discord通知完了');
  }
}

main().catch(err => {
  console.error('❌ エラー:', err.message);
  process.exit(1);
});
