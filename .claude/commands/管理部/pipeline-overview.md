# 【管理部】パイプライン全体図を表示する

カッテニハコダテの情報収集〜公開までのフロー全体を説明する。

## システム全体図

```
【情報収集】
  SNS投稿
    → Apps Script 09_sns.gs
    → src/content/sns-queue/ (画像コミット)
    → GitHub Actions: collect-sns-queue.yml
    → scripts/sns-queue-process.mjs (Claude Haiku Vision)
    → src/content/news/*.md ✅

  Googleスプレッドシート (求人・行政情報)
    → GitHub Actions: sheets-import.yml (毎日9時JST)
    → scripts/sheets-import.mjs
    → src/content/news/*.md ✅
    → Apps Script 10_webhook.gs でステータス更新

  記事キュー
    → Apps Script 08_queue.gs / 手動追記
    → src/content/article-queue.txt
    → GitHub Actions: edit-article-queue.yml
    → scripts/write.mjs (Claude Sonnet + Exa)
    → src/content/drafts/*.md ✅

【記事生成】
  自動生成（毎朝8時JST）
    → GitHub Actions: article-generator.yml
    → scripts/generate-article.mjs
      ├─ src/content/news/*.md を優先読み込み（収集部ネタ活用）
      ├─ Exa でネタを深掘りリサーチ
      └─ Claude Sonnet で5名のライターが執筆
    → src/content/drafts/*.md ✅

【編集・公開】
  下書きレビュー
    → src/content/drafts/ を確認
    → GitHub Actions: edit-publish.yml (workflow_dispatch)
      - action=publish: drafts → articles + Discord通知
      - action=reject: drafts から削除

【配信】
  週刊ニュース（毎週月曜9時JST）
    → GitHub Actions: weekly-news.yml
    → scripts/weekly-news.mjs (Claude Haiku)
    → Discord #函館ニュース に配信

  記事公開時
    → Discord に即時通知

【Webサイト】
  GitHub Push → Cloudflare Pages 自動デプロイ
    → https://kattenihakodate.com
```

## 部署別スキル

| 部署 | スキル | 説明 |
|---|---|---|
| 収集部 | `/収集部/sheets-import` | スプレッドシート取り込み |
| 収集部 | `/収集部/sns-queue` | SNSキュー処理 |
| 収集部 | `/収集部/status` | 収集状況確認 |
| 編集部 | `/編集部/generate` | 記事生成 |
| 編集部 | `/編集部/draft-review` | 下書きレビュー |
| 編集部 | `/編集部/publish` | 公開・ボツ |
| 編集部 | `/編集部/article-queue` | キュー管理 |
| 配信部 | `/配信部/weekly-news` | 週刊ニュース |
| 配信部 | `/配信部/discord-notify` | Discord通知 |
| 管理部 | `/管理部/status` | 全体ステータス |
| 管理部 | `/管理部/secrets-check` | シークレット確認 |
| 管理部 | `/管理部/pipeline-overview` | このドキュメント |
