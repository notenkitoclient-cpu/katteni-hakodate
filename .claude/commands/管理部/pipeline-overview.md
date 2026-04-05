# 【管理部】パイプライン全体図を表示する

カッテニハコダテの情報収集〜公開までのフロー全体を説明する。

## システム全体図

```
┌─────────────────────────────────────────────────────┐
│                 【リサーチ部】情報収集                    │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Exa ウェブ検索（毎朝7時・毎夕17時 JST）                 │
│    → scripts/research.mjs                           │
│    → 開店・閉店・イベントを自動分類                       │
│    → src/content/news/*.md ✅（reporter: 編集部）      │
│    → Discord に結果通知（ライター推薦付き）               │
│                                                     │
│  Discord チャンネル監視（毎時30分）                      │
│    → scripts/discord-screenshot-check.mjs           │
│    → 画像を Claude Haiku Vision で解析                 │
│    → src/content/news/*.md ✅（reporter: Discord投稿） │
│                                                     │
├─────────────────────────────────────────────────────┤
│                 【収集部】SNS・スプレッドシート            │
├─────────────────────────────────────────────────────┤
│                                                     │
│  SNS投稿スクショ（Apps Script 09_sns.gs）              │
│    → src/content/sns-queue/ にコミット                │
│    → GitHub Actions: collect-sns-queue.yml          │
│    → scripts/sns-queue-process.mjs                  │
│    → src/content/news/*.md ✅（reporter: SNS投稿）    │
│                                                     │
│  Googleスプレッドシート（求人・行政情報）                  │
│    → GitHub Actions: sheets-import.yml（毎日9時JST）  │
│    → scripts/sheets-import.mjs                     │
│    → src/content/news/*.md ✅                       │
│    → Apps Script 10_webhook.gs でステータス更新        │
│                                                     │
│  記事キュー（Apps Script 08_queue.gs / 手動）           │
│    → src/content/article-queue.txt                  │
│    → GitHub Actions: edit-article-queue.yml         │
│    → scripts/write.mjs (Claude Sonnet + Exa)        │
│    → src/content/drafts/*.md ✅                     │
│                                                     │
├─────────────────────────────────────────────────────┤
│                 【編集部】記事生成                       │
├─────────────────────────────────────────────────────┤
│                                                     │
│  自動生成（毎朝8時JST）                                 │
│    → GitHub Actions: article-generator.yml          │
│    → scripts/generate-article.mjs                  │
│      ├─ news/*.md を優先トピックとして読み込み            │
│      │   （リサーチ部・収集部が集めたネタを記事化）         │
│      ├─ Exa でネタを深掘りリサーチ                      │
│      └─ Claude Sonnet で5名ライターが執筆              │
│    → src/content/drafts/*.md ✅                     │
│                                                     │
│  下書きレビュー・公開                                   │
│    → GitHub Actions: edit-publish.yml               │
│      - action=publish: drafts → articles            │
│      - action=reject:  drafts を削除                 │
│    → Discord に公開通知                              │
│                                                     │
├─────────────────────────────────────────────────────┤
│                 【配信部】配信・SNS                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│  週刊ニュース（毎週月曜9時JST）                          │
│    → GitHub Actions: weekly-news.yml                │
│    → scripts/weekly-news.mjs (Claude Haiku)         │
│    → Discord に配信                                  │
│                                                     │
│  Threads 投稿                                        │
│    → news-threads-*.yml (enqueue/schedule/post)     │
│    → 公開記事を自動でThreads投稿                       │
│                                                     │
└─────────────────────────────────────────────────────┘
              ↓
    GitHub Push → Cloudflare Pages 自動デプロイ
              ↓
    https://kattenihakodate.com
```

## 部署別スキル一覧

| 部署 | スキル | 説明 |
|---|---|---|
| リサーチ部 | `/リサーチ部/web-research` | Exa ウェブリサーチ実行 |
| リサーチ部 | `/リサーチ部/discord-monitor` | Discord スクショ取り込み |
| リサーチ部 | `/リサーチ部/status` | リサーチ状況確認 |
| 収集部 | `/収集部/sheets-import` | スプレッドシート取り込み |
| 収集部 | `/収集部/sns-queue` | SNSキュー処理 |
| 収集部 | `/収集部/status` | 収集状況確認 |
| 編集部 | `/編集部/generate` | 記事生成 |
| 編集部 | `/編集部/draft-review` | 下書きレビュー |
| 編集部 | `/編集部/publish` | 公開・ボツ |
| 編集部 | `/編集部/article-queue` | キュー管理 |
| 配信部 | `/配信部/weekly-news` | 週刊ニュース |
| 配信部 | `/配信部/discord-notify` | Discord手動通知 |
| 管理部 | `/管理部/status` | 全体ステータス |
| 管理部 | `/管理部/secrets-check` | シークレット確認 |
| 管理部 | `/管理部/pipeline-overview` | このドキュメント |

## 情報の流れ（ポイント）

- **全ての情報は `news/*.md` に集約される**
- `reporter` フィールドで情報源を識別:
  - `"編集部"` = Exa リサーチ
  - `"Discord投稿"` = Discord スクショ監視
  - `"SNS投稿"` = SNSキュー（Apps Script 09）
- **`generate-article.mjs` は `news/*.md` を優先的に記事化**する（収集→編集の連携）
