# 【リサーチ部】リサーチ状況を確認する

リサーチ部が管理する全収集チャネルの状況を確認する。

## 確認内容

以下をすべて調べて報告してください：

1. **Exa ウェブリサーチ** (`research.mjs`)
   - 直近7日間に収集されたニュースのうち `reporter: "編集部"` の件数
   - 最後の実行タイミング（git log で `news: リサーチから` のコミットを確認）

2. **Discord スクショ監視** (`discord-screenshot-check.mjs`)
   - `src/data/discord-last-message-id.txt` の値（最後に処理したメッセージID）
   - 直近7日間に収集されたニュースのうち `reporter: "Discord投稿"` の件数

3. **ニュース全体のサマリ** (`src/content/news/`)
   - 総件数・直近7日間の件数
   - reporter 別の内訳（編集部 / Discord投稿 / SNS投稿）
   - type 別の内訳（開店 / 閉店 / イベント / 工事中 / 目撃情報 / その他）

4. **問題の検出**
   - 3日以上リサーチ結果がない場合 → ワークフロー停止の可能性を警告
   - discord-last-message-id.txt が存在しない場合 → 初回セットアップが未完了

最後に「次にすべきアクション」を提示する。
