# 【配信部】Discordに手動通知する

特定のニュースや記事をDiscordチャンネルに手動で通知する。

## 使い方

```
/配信部/discord-notify <通知したい内容や記事のslug>
```

## 実行手順

$ARGUMENTS の内容を確認し：

1. スラッグが指定された場合: `src/content/articles/<slug>.md` または `src/content/news/<slug>.md` を読み込んでタイトル・URLを取得
2. 通知メッセージを組み立てる:
   ```
   📢 **<タイトル>**
   <URL>
   ```
3. `DISCORD_ARTICLE_WEBHOOK_URL` シークレットが必要なため、GitHub Actions経由での実行を推奨

## 自動通知のタイミング

- 記事公開時: `edit-publish.yml` が自動通知
- SNSキュー処理時: `collect-sns-queue.yml` が件数通知
- 週次ニュース: `weekly-news.yml` が毎週月曜に配信

## Webhook URL の確認

GitHub リポジトリ → Settings → Secrets and variables → Actions → `DISCORD_ARTICLE_WEBHOOK_URL`
