# 【編集部】下書きを公開 / ボツにする

指定した下書きを公開記事として移動するか、ボツにする。

## 使い方

```
/編集部/publish <slug> [publish|reject]
```

例:
- `/編集部/publish hakodate-new-cafe-2026` → 公開（デフォルト）
- `/編集部/publish hakodate-new-cafe-2026 reject` → ボツ

## 実行手順

$ARGUMENTS の内容を解析して slug と action（省略時は publish）を取得し、以下を実行する：

1. `src/content/drafts/<slug>.md` の存在を確認する
2. 存在すれば記事タイトルを表示して確認を求める
3. 確認後、`node scripts/publish.mjs <action> <slug>` の実行コマンドを提示する

## 仕組み

- **publish**: `src/content/drafts/<slug>.md` → `src/content/articles/<slug>.md` に移動。`date` を今日の日付に更新。
- **reject**: `src/content/drafts/<slug>.md` を削除。

## GitHub Actions（手動トリガー）

GitHub の Actions タブ → `【編集部】下書きを公開 / ボツ` → workflow_dispatch で slug と action を入力して実行。
公開時は Discord に自動通知される。
