# 【管理部】必要なシークレット・設定を確認する

GitHub Actions で必要な全シークレットの設定状況を確認する。

## 必要なシークレット一覧

以下のシークレットが GitHub リポジトリに設定されているか確認してください（Settings → Secrets and variables → Actions）：

| シークレット名 | 用途 | 必須ワークフロー |
|---|---|---|
| `ANTHROPIC_API_KEY` | Claude API（記事生成・ニュース分析） | article-generator, write, sns-queue, weekly-news |
| `EXA_API_KEY` | Exa検索API（リアルタイムリサーチ） | article-generator, write |
| `DISCORD_ARTICLE_WEBHOOK_URL` | Discord通知 | edit-publish, collect-sns-queue, weekly-news |
| `SITE_URL` | 公開URL（https://kattenihakodate.com） | edit-publish |
| `SHEETS_CSV_URL` | スプレッドシートCSVエクスポートURL | sheets-import |
| `SHEETS_WEBHOOK_URL` | Apps Script WebhookURL（処理済みステータス書き戻し） | sheets-import |

## Apps Script の設定確認

Google Apps Script プロジェクト内の確認事項：

1. `10_webhook.gs` が追加されているか
2. Web アプリとしてデプロイされているか（「全員」アクセス可）
3. デプロイURLが `SHEETS_WEBHOOK_URL` に設定されているか
4. `DISCORD_WEBHOOK_URL` スクリプトプロパティが設定されているか

## Cloudflare Pages の設定確認

- ビルドコマンド: `npm run build`
- 出力ディレクトリ: `dist`
- Node.js バージョン: 20以上
- 環境変数: 特になし（静的サイト）

## ローカル開発環境

`.env` ファイル（コミット禁止）に以下を設定：
```
ANTHROPIC_API_KEY=sk-ant-...
EXA_API_KEY=...
DISCORD_ARTICLE_WEBHOOK_URL=https://discord.com/api/webhooks/...
SHEETS_CSV_URL=https://docs.google.com/spreadsheets/...
SHEETS_WEBHOOK_URL=https://script.google.com/macros/s/.../exec
SITE_URL=http://localhost:4321
```
