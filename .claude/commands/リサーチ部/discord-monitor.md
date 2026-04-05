# 【リサーチ部】Discordスクショを取り込む

Discord の指定チャンネルに投稿された画像（店舗看板・お知らせ・SNSスクリーンショット等）を Claude Haiku Vision で解析し、`src/content/news/*.md` を生成する。

## 仕組み

1. `src/data/discord-last-message-id.txt` で前回取得済みのメッセージIDを管理
2. Discord API で `DISCORD_SCREENSHOT_CHANNEL_ID` チャンネルの新着メッセージを取得（最大20件）
3. 画像添付のあるメッセージのみ処理
4. 同一メッセージ内の複数画像を1リクエストで一括解析（Claude Haiku Vision）
5. `confidence: low` はスキップ（品質管理）
6. `src/content/news/` に `YYYY-MM-DD-discord-<type>-<timestamp>.md` 形式で保存
7. `reporter: "Discord投稿"` フィールドで識別可能

## 自動実行スケジュール

毎時30分（JST）に `discord-screenshot-check.yml` が自動実行。

## 手動実行

GitHub Actions → `Discordスクショを取り込んでニュース生成` → workflow_dispatch

```bash
DISCORD_BOT_TOKEN=... DISCORD_SCREENSHOT_CHANNEL_ID=... ANTHROPIC_API_KEY=... node scripts/discord-screenshot-check.mjs
```

## 必要なシークレット

- `DISCORD_BOT_TOKEN` — Discord Bot のトークン
- `DISCORD_SCREENSHOT_CHANNEL_ID` — 監視するチャンネルのID
- `ANTHROPIC_API_KEY` — Claude Haiku Vision 使用
- `DISCORD_ARTICLE_WEBHOOK_URL` — 取り込み結果の通知先

## 運用フロー

1. スタッフが Discord の指定チャンネルに店舗写真・看板・SNSスクショを投稿
2. 毎時30分に自動取り込み
3. news/*.md が生成 → 次の朝の記事生成（generate-article.mjs）で活用

## 状態確認

```bash
cat src/data/discord-last-message-id.txt  # 前回処理済みIDの確認
ls src/content/news/ | grep discord       # Discord由来のニュース一覧
```
