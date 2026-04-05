# 【収集部】スプレッドシートからニュースを取り込む

`scripts/sheets-import.mjs` を実行して、Googleスプレッドシート（求人・行政許可等）から函館関連情報を取り込む。

## 実行手順

1. `src/data/sheets-processed-ids.json` を確認し、処理済みIDを把握する
2. `scripts/sheets-import.mjs` の動作を確認し、必要なら実行コマンドを提示する
3. 取り込まれた `src/content/news/*.md` の件数を報告する
4. 重複・非函館情報がスキップされた件数も報告する

## 注意事項

- 環境変数 `SHEETS_CSV_URL` が必要（ローカル実行時は `.env` を確認）
- `SHEETS_WEBHOOK_URL` が設定されていれば処理済みステータスをシートに書き戻す
- GitHub Actions の `sheets-import.yml` ワークフローで自動実行される（毎日9時JST）

## ローカルでの実行確認

```bash
node scripts/sheets-import.mjs
```

実行後、`src/content/news/` に新規ファイルが生成されているか確認する。
