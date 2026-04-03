/**
 * カッテニハコダテ — 短信ニュース追加スクリプト
 *
 * 使い方:
 *   npm run news -- --title "函館駅前に新カフェ" --type "開店" --area "駅前" --body "..." --source "https://..."
 *
 * type: 開店 / 閉店 / 工事中 / イベント / 目撃情報 / その他
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const NEWS_DIR = path.join(__dirname, '../src/content/news');

const VALID_TYPES = ['開店', '閉店', '工事中', 'イベント', '目撃情報', 'その他'];

function parseArgs() {
  const args = process.argv.slice(2);
  const get = (flag) => {
    const i = args.indexOf(flag);
    return i !== -1 ? args[i + 1] : null;
  };
  return {
    title:    get('--title'),
    type:     get('--type') || 'その他',
    area:     get('--area') || '函館市内',
    body:     get('--body') || '',
    source:   get('--source') || '',
    reporter: get('--reporter') || '編集部',
  };
}

function todayJST() {
  return new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().split('T')[0];
}

function toSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 40)
    || 'news';
}

const args = parseArgs();

if (!args.title) {
  console.error('❌ --title が必要です');
  console.error('   npm run news -- --title "函館駅前に新カフェ" --type "開店" --area "駅前"');
  process.exit(1);
}

if (!VALID_TYPES.includes(args.type)) {
  console.error(`❌ --type は次のいずれかを指定: ${VALID_TYPES.join(' / ')}`);
  process.exit(1);
}

const today = todayJST();
const slug = `${today}-${toSlug(args.title)}`;
const filePath = path.join(NEWS_DIR, `${slug}.md`);

if (fs.existsSync(filePath)) {
  console.error(`❌ すでに存在します: ${filePath}`);
  process.exit(1);
}

const sourceLine = args.source ? `\nsource: "${args.source}"` : '';
const content = `---
title: "${args.title}"
type: "${args.type}"
date: "${today}"
area: "${args.area}"
reporter: "${args.reporter}"${sourceLine}
---

${args.body}
`.trimEnd() + '\n';

fs.writeFileSync(filePath, content, 'utf-8');
console.log(`✅ 追加: ${filePath}`);

try {
  execSync(
    `git add "${filePath}" && git commit -m "news: ${args.type} [${args.title}]"`,
    { stdio: 'inherit' }
  );
  execSync('git push origin main', { stdio: 'inherit' });
  console.log('🚀 プッシュ完了');
} catch {
  console.log('（git push はスキップされました）');
}
