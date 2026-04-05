# 【配信部】週刊ニュースを生成・配信する

`scripts/weekly-news.mjs` を使って週次ニュースレターを生成し、Discordに配信する。

## 実行手順

1. `src/content/news/` の直近7日間のニュース件数を確認する
2. 配信に使う `scripts/weekly-news.mjs` の動作概要を説明する
3. 実行コマンドを提示する

## 仕組み

- 毎週月曜 9時（JST）に `weekly-news.yml` が自動実行
- `src/content/news/` と `src/content/articles/` から直近7日分を集計
- Claude Haiku でダイジェスト文を生成
- Discord Webhook で `#函館ニュース` チャンネルに投稿

## 手動実行

GitHub Actions → `週刊ニュース生成・配信` → workflow_dispatch

```bash
ANTHROPIC_API_KEY=... DISCORD_ARTICLE_WEBHOOK_URL=... node scripts/weekly-news.mjs
```

## 確認ポイント

- ニュースが0件の場合は配信しない（空のメッセージを防ぐ）
- Discord Webhook URL が `DISCORD_ARTICLE_WEBHOOK_URL` シークレットに設定されているか確認
