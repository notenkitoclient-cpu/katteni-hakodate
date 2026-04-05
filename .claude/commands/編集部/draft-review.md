# 【編集部】下書きをレビューする

`src/content/drafts/` 内の未公開下書きを一覧表示し、内容を確認・フィードバックする。

## 実行手順

1. `src/content/drafts/` 内の全 `.md` ファイルを一覧表示する
2. 各下書きのタイトル・カテゴリ・担当ライター・作成日を抽出して表形式で表示
3. ユーザーが指定したスラッグの記事内容を表示する
4. 必要に応じてフィードバックや修正提案を行う

## チェックポイント

- ライターの口癖・文体が守られているか
- 函館市民目線で書かれているか（観光客向けになっていないか）
- 事実確認が取れている情報のみ記載されているか
- タイトルが魅力的か
- 参考URLが記事末尾に記載されているか（リサーチ情報がある場合）

## 公開・却下

公開: GitHub Actions `edit-publish.yml` の workflow_dispatch で `action=publish`
却下: GitHub Actions `edit-publish.yml` の workflow_dispatch で `action=reject`

またはローカルで:
```bash
node scripts/publish.mjs publish <slug>
node scripts/publish.mjs reject <slug>
```
