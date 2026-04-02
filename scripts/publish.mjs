/**
 * カッテニハコダテ — 下書き公開スクリプト
 *
 * 使い方:
 *   npm run publish <slug>    下書きを本番に移動して公開
 *   npm run reject <slug>     下書きを削除（ボツ）
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname  = path.dirname(fileURLToPath(import.meta.url));
const DRAFTS_DIR = path.join(__dirname, '../src/content/drafts');
const ARTICLES_DIR = path.join(__dirname, '../src/content/articles');

const action = process.argv[2]; // 'publish' or 'reject'
const slug   = process.argv[3];

if (!slug) {
  console.error('❌ スラッグを指定してください');
  console.error('   npm run publish <slug>');
  console.error('   npm run reject <slug>');
  process.exit(1);
}

const draftPath   = path.join(DRAFTS_DIR, `${slug}.md`);
const articlePath = path.join(ARTICLES_DIR, `${slug}.md`);

if (!fs.existsSync(draftPath)) {
  console.error(`❌ 下書きが見つかりません: ${draftPath}`);
  process.exit(1);
}

const raw   = fs.readFileSync(draftPath, 'utf-8');
const title = (raw.match(/^title:\s*["']?(.+?)["']?\s*$/m) || [])[1] || slug;

if (action === 'reject') {
  fs.unlinkSync(draftPath);
  console.log(`🗑  ボツ: 『${title}』を削除しました`);

  try {
    execSync(`git add "${draftPath}" && git commit -m "reject: 下書きをボツにした [${slug}]"`, { stdio: 'inherit' });
    execSync('git push origin main', { stdio: 'inherit' });
  } catch (e) {
    console.log('（git push はスキップされました）');
  }
  process.exit(0);
}

// publish
// writerId と sourceUrl を frontmatter から除去して articles/ にコピー
const cleaned = raw
  .replace(/^writerId:.*$/m, '')
  .replace(/^sourceUrl:.*$/m, '')
  .replace(/\n{3,}/g, '\n\n')
  .trim() + '\n';

fs.writeFileSync(articlePath, cleaned, 'utf-8');
fs.unlinkSync(draftPath);

console.log(`✅ 公開: 『${title}』`);
console.log(`   ${articlePath}`);

try {
  execSync(
    `git add "${articlePath}" "${draftPath}" && git commit -m "content: 記事を公開 [${slug}]"`,
    { stdio: 'inherit' }
  );
  execSync('git push origin main', { stdio: 'inherit' });
  console.log('🚀 Cloudflare に自動デプロイ中...');
} catch (e) {
  console.warn('git push に失敗しました。手動でpushしてください。');
}
