/**
 * カッテニハコダテ — Google Sheetsインポートスクリプト
 * スプレッドシートの未処理行を取得し、src/content/news/ に自動追加する。
 *
 * 列マッピング（実測）:
 *   0: 取得日（YYYY-MM-DD）
 *   1: 共通ID（= "タイトル - ソース名"）
 *   2: 求人タイトル（= ソース名）
 *   3: 会社名/店名（= Google News URL）
 *  11: ステータス
 *  12: 備考
 *
 * 動作:
 *   - EARLIEST_DATE 以降の行のみ対象（古い記事を完全排除）
 *   - Google News RSS URL（news.google.com）はリダイレクト先の実URLに解決（失敗時スキップ）
 *   - タイトルに古い年（～2025年以前）が含まれる場合はスキップ
 *   - 会社名を正規化してから重複チェック（ヨーカドー系などを統一）
 *   - 1回の実行で最大 BATCH_SIZE 件まで追加（古い順）
 */

import fs from 'fs';
import https from 'https';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const NEWS_DIR        = path.join(__dirname, '../src/content/news');
const PROCESSED_FILE  = path.join(__dirname, '../src/data/sheets-processed-ids.json');

const SHEET_ID      = '1pahfD31CQu4Gk3-DO_Oski001F6n_givsfg0KMjS_AA';
const GID           = '754262894';
const EARLIEST_DATE = '2026-01-01'; // これより古い記事は一切取り込まない
const BATCH_SIZE    = 20;   // 1回の実行で追加する最大件数

// ── ユーティリティ ─────────────────────────────────────────────

function todayJST() {
  return new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().split('T')[0];
}

function cutoffDate(days) {
  const d = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  return d.toISOString().split('T')[0];
}

// ── CSV パーサー（RFC4180準拠）────────────────────────────────

function parseCSV(text) {
  const rows = [];
  const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  for (const line of lines) {
    if (!line.trim()) continue;
    const cols = [];
    let col = '', inQuote = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuote && line[i + 1] === '"') { col += '"'; i++; }
        else inQuote = !inQuote;
      } else if (ch === ',' && !inQuote) {
        cols.push(col); col = '';
      } else {
        col += ch;
      }
    }
    cols.push(col);
    rows.push(cols);
  }
  return rows;
}

// ── Google Sheets CSV 取得 ────────────────────────────────────

async function fetchSheetCSV() {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${GID}`;
  const res = await fetch(url, { redirect: 'follow' });
  if (!res.ok) throw new Error(`Sheets取得失敗: HTTP ${res.status}`);
  return res.text();
}

// ── カラムレイアウト検出＆行パース ───────────────────────────
//
// Apps Script 03_jobs.gs が書く「新フォーマット」:
//   B(1): 生成ID (例: "20260402-NEWS-001")
//   C(2): タイトル
//   I(8): ソース名
//   J(9): URL
//   L(11): ステータス
//
// それ以前に蓄積された「旧フォーマット」:
//   B(1): "タイトル - ソース名"
//   C(2): ソース名
//   D(3): URL
//   L(11): ステータス

function parseRow(row) {
  const colB = (row[1] || '').trim();
  const isNewFormat = /^\d{8}-[A-Z]+-\d+$/.test(colB);

  if (isNewFormat) {
    // IDの先頭8桁（例: "20240505"）を YYYY-MM-DD に変換して記事日付として使う
    const d = colB.slice(0, 8);
    const itemDate = `${d.slice(0,4)}-${d.slice(4,6)}-${d.slice(6,8)}`;
    return {
      rawId:     colB,
      title:     (row[2] || '').trim(),
      sourceUrl: (row[9] || '').trim(),
      status:    (row[11] || '').trim(),
      itemDate,  // ID埋め込み日付
    };
  } else {
    return {
      rawId:     colB,
      title:     cleanTitle(colB),
      sourceUrl: (row[3] || '').trim(),
      status:    (row[11] || '').trim(),
      itemDate:  (row[0] || '').trim(), // 旧フォーマットは列A（取得日）
    };
  }
}

// ── 処理済みID管理 ───────────────────────────────────────────

function loadProcessedIds() {
  try { return new Set(JSON.parse(fs.readFileSync(PROCESSED_FILE, 'utf-8'))); }
  catch { return new Set(); }
}

function saveProcessedIds(ids) {
  fs.mkdirSync(path.dirname(PROCESSED_FILE), { recursive: true });
  fs.writeFileSync(PROCESSED_FILE, JSON.stringify([...ids], null, 2), 'utf-8');
}

// ── 既存newsタイトル一覧 ──────────────────────────────────────

function loadExistingTitles() {
  if (!fs.existsSync(NEWS_DIR)) return new Set();
  const titles = new Set();
  for (const file of fs.readdirSync(NEWS_DIR).filter(f => f.endsWith('.md'))) {
    const raw = fs.readFileSync(path.join(NEWS_DIR, file), 'utf-8');
    const m = raw.match(/^title:\s*["']?(.+?)["']?\s*$/m);
    if (m) titles.add(m[1].trim());
  }
  return titles;
}

// ── タイトル正規化 ───────────────────────────────────────────

function cleanTitle(raw) {
  return raw
    .replace(/\s*[-–]\s*(北海道新聞デジタル|Yahoo!ニュース|PR TIMES|流通ニュース|sasaru\.media|函館新聞デジタル|[^\s-–]{1,30})\s*$/, '')
    .trim();
}

// ── 古い年が含まれているタイトルを排除 ──────────────────────
// 例: "22年7月オープン", "2024年1月閉店" → スキップ

function titleHasOldEventDate(title) {
  // "2020年〜2025年" を含む表記
  if (/201[0-9]年|202[0-5]年/.test(title)) return true;
  // "22年" "23年" "24年" など2桁年号（2桁数字＋年）
  if (/\b(1[0-9]|2[0-4])年/.test(title)) return true;
  return false;
}

// ── Google News RSS URL → 実URLへのリダイレクト解決 ─────────
// news.google.com/rss/articles/... はリダイレクトで実際の記事URLに辿り着く
// タイムアウト3秒、失敗したらnullを返す（→その行はスキップ）

function resolveGoogleNewsUrl(rssUrl) {
  return new Promise(resolve => {
    const timeout = setTimeout(() => resolve(null), 3000);
    try {
      const req = https.get(rssUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
        clearTimeout(timeout);
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          const loc = res.headers.location;
          // Google Newsの中間URLの場合はさらに解決（最大1回）
          if (loc.includes('news.google.com')) {
            resolve(null); // 解決できなかった
          } else {
            resolve(loc);
          }
        } else {
          resolve(null); // リダイレクトなし = RSS URLのまま = 使えない
        }
        res.resume();
      });
      req.on('error', () => { clearTimeout(timeout); resolve(null); });
      req.end();
    } catch { clearTimeout(timeout); resolve(null); }
  });
}

function isGoogleNewsRssUrl(url) {
  return /news\.google\.com\/(rss|articles)/.test(url);
}

// ── 会社名・店名の正規化（重複排除用） ──────────────────────
// 同じ企業・店舗を複数表記でインポートするのを防ぐ

const COMPANY_NORMALIZE = {
  'イトーヨーカドー': 'ヨーカドー',
  'Ito Yokado':      'ヨーカドー',
  'マクドナルド':    'マクド',
  'McDonald\'s':     'マクド',
  'スターバックス':  'スタバ',
  'Starbucks':       'スタバ',
  'セブン-イレブン': 'セブンイレブン',
  'セブン－イレブン': 'セブンイレブン',
  '7-Eleven':        'セブンイレブン',
  'ファミリーマート': 'ファミマ',
  'ローソン函館':    'ローソン',
  'ツルハドラッグ':  'ツルハ',
  'ツルハ薬局':      'ツルハ',
};

function normalizeCompany(title) {
  let t = title;
  for (const [from, to] of Object.entries(COMPANY_NORMALIZE)) {
    t = t.replaceAll(from, to);
  }
  return t;
}

// ── 函館・道南関連チェック ────────────────────────────────────

const HAKODATE_AREA_WORDS = [
  '函館', '北斗', '七飯', '松前', '江差', '八雲', '長万部', '今金', '森町',
  '五稜郭', '湯川', '末広', '大門', '本町', '元町', '棒二', 'シエスタ',
  '西部地区', 'ベイエリア', '函館駅', '亀田', '桔梗',
];

// 函館以外の地名を含み、かつ函館が店名・ブランド名として使われている可能性がある表現
const NON_HAKODATE_AREAS = [
  '新潟', '神保町', '東京', '大阪', '札幌', '仙台', '名古屋', '福岡',
  '横浜', '埼玉', '千葉', '京都', '広島', '沖縄', '旭川', '帯広',
  '藤沢', '宇治', '八戸', '青森', '秋田', '盛岡', '山形', '仙台',
  '那覇', '熊本', '鹿児島', '長崎', '静岡', '浜松', '金沢', '富山',
  '高松', '松山', '岡山', '姫路', '奈良', '和歌山', '岐阜', '津市',
  '北谷', // 沖縄北谷（アメリカンビレッジ周辺）
];

// 「／地名」「（地名）」で他都市店舗を示すパターン
const OUT_OF_TOWN_PATTERN = /[\/／]\s*(八戸|青森|札幌|仙台|東京|大阪|神戸|京都|福岡|那覇|新潟)[\s　】）]|【(藤沢市|宇治市|北谷町|新潟市)/;

function isHakodateRelated(title) {
  // 函館・道南キーワードを含むか
  const hasHakodate = HAKODATE_AREA_WORDS.some(w => title.includes(w));
  if (!hasHakodate) return false;

  // 「／八戸」「【藤沢市】」など明示的な他都市パターンがあれば除外
  if (OUT_OF_TOWN_PATTERN.test(title)) return false;

  // 他都市名が函館より先に出てくる場合は除外（例:「新潟に函館ラーメン出店」）
  const firstNonHakodate = Math.min(
    ...NON_HAKODATE_AREAS.map(w => title.indexOf(w)).filter(i => i >= 0),
    Infinity
  );
  const firstHakodate = Math.min(
    ...HAKODATE_AREA_WORDS.map(w => title.indexOf(w)).filter(i => i >= 0),
    Infinity
  );
  return firstHakodate <= firstNonHakodate;
}

// ── タイトル類似チェック ──────────────────────────────────────

function extractKeyTerms(title) {
  const ja = title.match(/[\u3040-\u9fff\uff01-\uff60]{2,}/g) || [];
  const en = title.match(/[a-zA-Z0-9]{3,}/g) || [];
  return [...ja, ...en];
}

function isSimilarTitle(titleA, titleB) {
  const setA = new Set(extractKeyTerms(titleA));
  const overlap = extractKeyTerms(titleB).filter(t => setA.has(t));
  return overlap.length >= 2;
}

// ── ニュース分類・エリア抽出 ─────────────────────────────────

function classifyType(title) {
  if (/開店|オープン|新店|ニューオープン|grand open/i.test(title)) return '開店';
  if (/閉店|クローズ|撤退|終了|破産|廃業|営業終了/.test(title))   return '閉店';
  if (/イベント|祭り|まつり|フェス|マルシェ|開催|コンサート|展示/.test(title)) return 'イベント';
  if (/工事|建設|リニューアル|改装|解体/.test(title))              return '工事中';
  return null;
}

function extractArea(title) {
  // 固定エリア名を優先（誤マッチ防止）
  const named = title.match(/(函館駅前|ベイエリア|五稜郭|湯川|元町|西部地区|末広町|大門|本町|棒二|シエスタ|亀田|桔梗|松風|美原|昭和|杉並|石川町|鍛治|港町|田家|鱒川)/);
  if (named) return named[1];
  // 「XX町」「XX丁目」「XX区」にマッチ（数字のみや長すぎるものは除外）
  const m = title.match(/([^\s　、。「」【】\d]{1,6}(?:丁目|[町区]))/);
  return m ? m[1] : '函館市内';
}

// ── newsファイル保存 ──────────────────────────────────────────

function saveNewsFile(title, type, area, date, sourceUrl) {
  if (!fs.existsSync(NEWS_DIR)) fs.mkdirSync(NEWS_DIR, { recursive: true });
  const usedSlugs = new Set(fs.readdirSync(NEWS_DIR).map(f => f.replace('.md', '')));

  let base = title
    .replace(/[^\w\s]/g, ' ').toLowerCase().trim()
    .split(/\s+/).filter(w => /^[a-z][a-z0-9]{1,}$/.test(w))
    .slice(0, 3).join('-');
  if (base.length < 3) base = 'news';

  let slug = `${date}-sheets-${base}`.slice(0, 55);
  const orig = slug; let i = 2;
  while (usedSlugs.has(slug)) slug = `${orig}-${i++}`;

  const md = `---
title: "${title.replace(/"/g, '\\"')}"
type: "${type}"
date: "${date}"
area: "${area}"
reporter: "編集部"
source: "${sourceUrl}"
---
`.trimEnd() + '\n';

  fs.writeFileSync(path.join(NEWS_DIR, `${slug}.md`), md, 'utf-8');
  return slug;
}

// ── メイン ────────────────────────────────────────────────────

async function main() {
  const today  = todayJST();
  const cutoff = EARLIEST_DATE;
  console.log(`📊 Sheetsインポート開始 (${today}) | 対象: ${cutoff} 以降 | 上限: ${BATCH_SIZE}件`);

  const csvText = await fetchSheetCSV();
  const rows = parseCSV(csvText);

  if (rows.length < 2) { console.log('データなし'); return; }

  const allDataRows = rows.slice(1);
  console.log(`📋 総行数: ${allDataRows.length}`);

  // 取得日でフィルタ（古い順に並び替えて処理）
  const filteredRows = allDataRows
    .filter(r => (r[0] || '') >= cutoff)
    .sort((a, b) => (a[0] || '') > (b[0] || '') ? 1 : -1); // 古い順

  console.log(`📋 ${cutoff}以降の行数: ${filteredRows.length}`);

  const processedIds   = loadProcessedIds();
  const existingTitles = loadExistingTitles();
  const saved = [];
  let skipped = 0;

  for (const row of filteredRows) {
    if (saved.length >= BATCH_SIZE) break;

    const { rawId, title: parsedTitle, sourceUrl, itemDate } = parseRow(row);

    // ID埋め込み日付が cutoff より古ければスキップ（2024年以前の記事の混入防止）
    if (itemDate && itemDate < cutoff) {
      processedIds.add(rawId);
      skipped++;
      continue;
    }

    if (!rawId) continue;
    if (processedIds.has(rawId)) continue;

    const title = parsedTitle;
    if (!title) { processedIds.add(rawId); skipped++; continue; }

    // Google News RSS URLはリダイレクト先の実URLを取得して置き換え
    let resolvedUrl = sourceUrl;
    if (isGoogleNewsRssUrl(sourceUrl)) {
      resolvedUrl = await resolveGoogleNewsUrl(sourceUrl);
      if (!resolvedUrl) {
        console.log(`⏭  RSS解決失敗: ${title.slice(0, 40)}`);
        processedIds.add(rawId);
        skipped++;
        continue;
      }
      console.log(`🔗 RSS→実URL: ${resolvedUrl.slice(0, 60)}`);
    }

    // タイトルに古い年が含まれているものはスキップ
    if (titleHasOldEventDate(title)) {
      console.log(`⏭  古い年: ${title.slice(0, 40)}`);
      processedIds.add(rawId);
      skipped++;
      continue;
    }

    // 函館・道南関連チェック
    if (!isHakodateRelated(title)) {
      processedIds.add(rawId);
      skipped++;
      continue;
    }

    // ニュースタイプ分類
    const type = classifyType(title);
    if (!type) {
      processedIds.add(rawId);
      skipped++;
      continue;
    }

    // 会社名を正規化してからタイトル重複チェック
    const normalizedTitle = normalizeCompany(title);
    const duplicate = [...existingTitles].find(t => isSimilarTitle(normalizedTitle, normalizeCompany(t)));
    if (duplicate) {
      console.log(`⏭  重複: ${title.slice(0, 40)}`);
      processedIds.add(rawId);
      skipped++;
      continue;
    }

    const area = extractArea(title);
    const slug = saveNewsFile(title, type, area, today, resolvedUrl);

    processedIds.add(rawId);
    existingTitles.add(title);
    saved.push({ slug, title, type, area });
    console.log(`✅ [${type}][${area}] ${title.slice(0, 45)}`);
  }

  saveProcessedIds(processedIds);

  const remaining = filteredRows.filter(r => !processedIds.has((r[1] || '').trim())).length;
  console.log(`\n完了: ${saved.length}件追加 / ${skipped}件スキップ / 残り約${remaining}件（次回以降）`);
  fs.writeFileSync('/tmp/sheets-result.json', JSON.stringify({ saved }), 'utf-8');

  // ── スプレッドシートのステータスを「処理済み」に更新 ──────────
  await updateSheetStatus([...processedIds]);
}

/**
 * Apps Script ウェブアプリ経由でステータスを「処理済み」に更新する。
 * SHEETS_WEBHOOK_URL が未設定の場合はスキップ。
 */
async function updateSheetStatus(processedRawIds) {
  const webhookUrl = process.env.SHEETS_WEBHOOK_URL;
  if (!webhookUrl) {
    console.log('ℹ️  SHEETS_WEBHOOK_URL未設定 — スプレッドシートのステータス更新をスキップ');
    return;
  }
  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: processedRawIds }),
      redirect: 'follow',
    });
    const result = await res.json();
    if (result.updated !== undefined) {
      console.log(`📝 スプレッドシート更新: ${result.updated}件を「処理済み」に変更`);
    } else {
      console.warn('⚠️  Sheets更新レスポンス異常:', JSON.stringify(result));
    }
  } catch (err) {
    console.warn('⚠️  Sheets更新失敗（インポート結果には影響なし）:', err.message);
  }
}

main().catch(err => {
  console.error('❌ エラー:', err.message);
  process.exit(1);
});
