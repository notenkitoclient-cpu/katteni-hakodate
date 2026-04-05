# 【リサーチ部】ウェブリサーチを実行する

`scripts/research.mjs` を使って Exa で函館の最新情報（開店・閉店・イベント等）を検索し、`src/content/news/*.md` に自動追加する。

## 仕組み

1. Exa で以下のクエリを実行（各3件、最大8件取得）:
   - 函館 グルメ 新店 オープン（当月）
   - 函館 イベント（当月）
   - 函館 暮らし 移住 地域（今年）
   - 北斗市 七飯町 ニュース（今年）
   - 函館 お店 開店 閉店（当月）
   - 函館 ビジネス 起業 地域経済（今年）
   - site:dateper.net 函館（当月）

2. `classifyNewsType()` で開店・閉店・イベント・工事中のいずれかに分類（対象外はスキップ）
3. URL重複チェックで既存 news/*.md との重複を除外
4. `src/content/news/*.md` に自動保存
5. Discord Webhook で結果を通知（担当ライター推薦付き）

## 自動実行スケジュール

- 毎朝 **7:00 JST** (`research.yml`)
- 毎夕 **17:00 JST** (`research.yml`)

## 手動実行

GitHub Actions → `リサーチ＆情報収集自動追加` → workflow_dispatch

```bash
EXA_API_KEY=... DISCORD_ARTICLE_WEBHOOK_URL=... node scripts/research.mjs
```

## 必要なシークレット

- `EXA_API_KEY`
- `DISCORD_ARTICLE_WEBHOOK_URL`（通知先）
- `SITE_URL`（任意）

## 収集された情報の確認

`src/content/news/` に `YYYY-MM-DD-<キーワード>.md` 形式で保存される。
`reporter: "編集部"` フィールドで識別可能。
