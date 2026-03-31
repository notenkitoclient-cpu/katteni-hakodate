#!/bin/bash
# カッテニハコダテ コンテンツリサーチスクリプト
# 使い方: ./scripts/research.sh [topic]
# 例: ./scripts/research.sh グルメ

set -e

VENV=".venv/bin"
TOPIC="${1:-函館 最新情報}"
DATE=$(date +%Y-%m-%d)

echo "=========================================="
echo "カッテニハコダテ リサーチエージェント"
echo "テーマ: $TOPIC"
echo "日付: $DATE"
echo "=========================================="
echo ""

# Jina Reader でウェブページを取得する関数
fetch_page() {
  local url=$1
  local label=$2
  echo "### $label"
  curl -s "https://r.jina.ai/$url" 2>/dev/null | head -80 || echo "(取得失敗)"
  echo ""
}

# RSS フィードを取得する関数
fetch_rss() {
  local url=$1
  local label=$2
  echo "### RSS: $label"
  curl -s "$url" 2>/dev/null | grep -E "<title>|<description>" | head -20 | sed 's/<[^>]*>//g' | grep -v "^$" || echo "(取得失敗)"
  echo ""
}

echo "## 1. 函館観光公式情報"
fetch_page "https://www.hakobura.jp/" "はこぶら（函館市公式観光情報）"

echo "## 2. 函館 新着情報"
fetch_page "https://hakodate.goguynet.jp/category/cat_openclose/" "号外NET 函館 開店・閉店情報"

echo "## 3. 函館イベント情報"
fetch_rss "https://www.hakobura.jp/feed" "はこぶら RSS"

echo "=========================================="
echo "リサーチ完了。上記の情報をもとに記事を作成してください。"
echo "=========================================="
