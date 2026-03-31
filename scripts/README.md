# カッテニハコダテ 運用スクリプト

## スクリプト一覧

### research.sh — コンテンツリサーチ
Agent-Reach を使って函館の最新情報を収集します。

```bash
cd /Users/watanabehiroya/works/カッテニハコダテ
./scripts/research.sh
```

### new-article.sh — 新規記事作成
記事のテンプレートを対話形式で生成します。

```bash
./scripts/new-article.sh
```

## Agent-Reach 利用可能なチャンネル

| チャンネル | 状態 | 使い方 |
|-----------|------|--------|
| 任意のウェブページ | ✅ | `curl https://r.jina.ai/URL` |
| RSS/Atom | ✅ | `curl RSS_URL` |
| YouTube | ✅ | `yt-dlp --dump-json URL` |
| Reddit | ✅ | `curl https://www.reddit.com/r/SUBREDDIT/hot.json` |
| GitHub | ✅ | `gh repo view REPO` |
| Twitter/X | 🔑 要設定 | `bird search "キーワード"` |
| 全文検索(Exa) | 🔑 要APIキー | `mcporter call 'exa.web_search_exa(...)'` |

## Exa API キーの設定方法

1. https://exa.ai で無料アカウント作成
2. APIキーを取得
3. 以下を実行:
```bash
mcporter config add exa https://mcp.exa.ai/mcp --header "x-api-key: YOUR_KEY"
```

## Twitter/X の設定方法

```bash
npm install -g @steipete/bird
bird auth  # ブラウザでログイン
```
