# 【収集部】SNSキューを処理する

`src/content/sns-queue/` 内の画像を Claude Haiku Vision で解析し、`src/content/news/*.md` を生成する。

## 実行手順

1. `src/content/sns-queue/` の中身を確認する（未処理画像 = `_done_` プレフィックスなし）
2. 未処理画像があれば `scripts/sns-queue-process.mjs` の実行を提案する
3. 生成されたニュースファイルを確認・報告する

## 仕組み

- Apps Script `09_sns.gs` が Instagram/SNSのスクリーンショットを `src/content/sns-queue/` にコミット
- このスクリプトが画像をバッチ処理（1リクエスト最大5枚）
- confidence: low の画像はスキップ（品質管理）
- 処理済み画像は `_done_` プレフィックスでリネーム

## GitHub Actions

`collect-sns-queue.yml` が `src/content/sns-queue/**` へのpushで自動起動する。

## ローカルでの実行確認

```bash
node scripts/sns-queue-process.mjs
```
