/**
 * ビジネスインテリジェンス → Discord 送信スクリプト
 * 必要な環境変数:
 *   DISCORD_WEBHOOK_URL  — Discord ウェブフック URL
 *   ANTHROPIC_API_KEY    — Claude API キー（キュレーション用）
 */

import https from 'https';
import http  from 'http';

// ── ユーティリティ ────────────────────────────────────
function fetch(url, opts = {}) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http;
    const req = mod.get(url, { timeout: 8000, headers: { 'User-Agent': 'Mozilla/5.0', ...(opts.headers || {}) } }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
  });
}

function post(url, payload) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(payload);
    const u = new URL(url);
    const req = https.request({
      hostname: u.hostname, path: u.pathname + u.search,
      method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ── データ取得 ────────────────────────────────────────
async function fetchHN() {
  try {
    const r = await fetch('https://hn.algolia.com/api/v1/search?tags=front_page&hitsPerPage=20');
    if (r.status !== 200) return [];
    const d = JSON.parse(r.body);
    return (d.hits || []).map(h => ({
      title: h.title || '',
      url:   h.url || `https://news.ycombinator.com/item?id=${h.objectID}`,
      source: 'HN',
    }));
  } catch { return []; }
}

async function fetchGitHub() {
  try {
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const r = await fetch(
      `https://api.github.com/search/repositories?q=created:>${since}+stars:>50&sort=stars&order=desc&per_page=15`,
      { headers: { Accept: 'application/vnd.github.v3+json' } }
    );
    if (r.status !== 200) return [];
    const d = JSON.parse(r.body);
    return (d.items || []).map(i => ({
      title: `${i.full_name} — ${i.description || ''}`,
      url:   i.html_url,
      source: 'GitHub',
    }));
  } catch { return []; }
}

async function fetchDevTo() {
  try {
    const r = await fetch('https://dev.to/api/articles?top=7&per_page=15');
    if (r.status !== 200) return [];
    const d = JSON.parse(r.body);
    return d.map(a => ({
      title: a.title,
      url:   `https://dev.to${a.path}`,
      source: 'DevTo',
    }));
  } catch { return []; }
}

// ── Claude でキュレーション ────────────────────────────
async function curate(items, today) {
  if (!items.length) return null;

  const Anthropic = (await import('@anthropic-ai/sdk')).default;
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const list = items.slice(0, 40).map((i, n) =>
    `${n + 1}. [${i.source}] ${i.title} | ${i.url}`
  ).join('\n');

  const prompt = `あなたはビジネスインテリジェンスのキュレーターです。

以下の海外のIT/スタートアップ情報一覧から、日本のビジネスパーソンに価値ある情報を選んでください。

【情報一覧】
${list}

【選定基準（優先順）】
1. 海外の新規事業・スタートアップで斬新なアイデア
2. ソロ創業者・個人開発者が凄いことをしている事例
3. 非自明なビジネスモデルの洞察
4. AI・クリエイターエコノミー・気候テック・B2B SaaSのトレンド
5. 日本市場への応用可能性が高いもの

【出力形式】（必ずこのJSONのみ出力、前後のテキスト不要）
{
  "overseas": [
    {"title": "短いタイトル（日本語訳可）", "url": "URL", "summary": "20文字以内の一行要約"},
    {"title": "...", "url": "...", "summary": "..."},
    {"title": "...", "url": "...", "summary": "..."}
  ],
  "individual": [
    {"title": "短いタイトル（日本語訳可）", "url": "URL", "summary": "20文字以内の一行要約"},
    {"title": "...", "url": "...", "summary": "..."}
  ],
  "insight": "今日の着眼点（日本市場への応用可能性や見落としがちな観点を含む2〜3文、80文字以内）"
}`;

  const res = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = res.content[0].text.trim();
  const m = text.match(/```json\s*([\s\S]+?)\s*```/) || text.match(/(\{[\s\S]+\})/);
  if (!m) throw new Error(`JSON not found: ${text.slice(0, 200)}`);
  return JSON.parse(m[1]);
}

// ── Discord メッセージ組み立て ─────────────────────────
function buildMessage(curated, today, noData) {
  if (noData) {
    return `⚠️ ネットワーク制限により情報取得できませんでした。${today}`;
  }

  const ov = (curated.overseas || []).slice(0, 3)
    .map(i => `• [${i.title}](${i.url}) — ${i.summary}`)
    .join('\n');

  const ind = (curated.individual || []).slice(0, 3)
    .map(i => `• [${i.title}](${i.url}) — ${i.summary}`)
    .join('\n');

  return [
    `📰 **ビジネスインテリジェンス** | ${today}`,
    '',
    '━━━ 🌍 海外新規事業 ━━━',
    ov || '• 該当なし',
    '',
    '━━━ 👤 個人の挑戦 ━━━',
    ind || '• 該当なし',
    '',
    '━━━ 💡 今日の着眼点 ━━━',
    curated.insight || '',
  ].join('\n').slice(0, 1900); // Discord 上限に収める
}

// ── Discord 送信 ────────────────────────────────────────
async function sendDiscord(message) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) throw new Error('DISCORD_WEBHOOK_URL が設定されていません');
  const res = await post(webhookUrl, { content: message });
  if (res.status < 200 || res.status >= 300) {
    throw new Error(`Discord API エラー: ${res.status} ${res.body}`);
  }
  console.log(`✅ Discord 送信完了 (HTTP ${res.status})`);
}

// ── メイン ─────────────────────────────────────────────
async function main() {
  const today = new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().split('T')[0];
  console.log(`📅 ${today} — BI キュレーション開始`);

  // 並行して全ソースを取得
  const [hn, gh, dev] = await Promise.all([fetchHN(), fetchGitHub(), fetchDevTo()]);
  const all = [...hn, ...gh, ...dev];
  console.log(`📥 取得件数: HN=${hn.length} GitHub=${gh.length} DevTo=${dev.length}`);

  if (!all.length) {
    await sendDiscord(buildMessage(null, today, true));
    return;
  }

  const curated = await curate(all, today);
  const message = buildMessage(curated, today, false);
  console.log('--- Discord メッセージ ---');
  console.log(message);
  console.log('-------------------------');
  await sendDiscord(message);
}

main().catch(err => {
  console.error('❌ エラー:', err.message);
  process.exit(1);
});
