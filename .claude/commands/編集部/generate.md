# 【編集部】記事を生成する

`scripts/generate-article.mjs` を使って下書き記事を生成する。収集部のニュース（`src/content/news/`）を優先的に記事化する。

## 実行手順

1. `src/content/news/` の直近ニュースを確認（どのネタを記事化するか把握）
2. `src/content/drafts/` の既存下書きを確認（重複チェック）
3. `scripts/generate-article.mjs` の実行コマンドを提示する
4. 生成された下書きのタイトル・カテゴリ・担当ライターを報告する

## 仕組み

- 収集部のニュース（直近14日以内）を最優先トピックとして使用
- ニュースがない場合は Exa でリアルタイムリサーチ
- 5名の架空ライターがキーワードマッチで自動選定
- 下書きは `src/content/drafts/` に保存

## GitHub Actions

`article-generator.yml` が毎朝8時（JST）に自動実行する。

## ローカルでの実行

```bash
ANTHROPIC_API_KEY=... EXA_API_KEY=... node scripts/generate-article.mjs
```

## 関連コマンド

- `/編集部/draft-review` — 下書きをレビューする
- `/編集部/publish` — 下書きを公開する
