# 【編集部】記事キューを管理する

`src/content/article-queue.txt` のトピックキューを確認・追加・処理する。

## 現在のキューを表示

`src/content/article-queue.txt` の内容を全行表示する。

## トピックを追加する

$ARGUMENTS にトピック文字列が含まれていれば `article-queue.txt` の末尾に追記する。

例: `/編集部/article-queue 函館の新しいコワーキングスペース事情`

追記フォーマット（1行1トピック）:
```
函館の新しいコワーキングスペース事情
```

## 処理の仕組み

1. Apps Script `08_queue.gs` もしくは手動で `article-queue.txt` にトピックを追記
2. main ブランチへのpushで `edit-article-queue.yml` が起動
3. `scripts/write.mjs --topic "<先頭行>"` で下書きを生成
4. 先頭行を削除してコミット・プッシュ

## 手動実行

GitHub Actions → `【編集部】記事キューを処理` → workflow_dispatch

または:
```bash
ANTHROPIC_API_KEY=... EXA_API_KEY=... node scripts/write.mjs --topic "函館の○○"
```
