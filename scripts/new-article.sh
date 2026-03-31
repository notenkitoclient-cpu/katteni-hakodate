#!/bin/bash
# 新規記事テンプレート生成スクリプト
# 使い方: ./scripts/new-article.sh

DATE=$(date +%Y-%m-%d)

echo "=========================================="
echo "カッテニハコダテ 新規記事作成"
echo "=========================================="
echo ""
echo "以下の情報を入力してください："
echo ""

read -p "記事スラッグ（英数字・ハイフン）: " SLUG
read -p "タイトル: " TITLE
read -p "説明文（1-2文）: " DESC
echo "カテゴリを選択（グルメ/観光/暮らし/イベント/人・ビジネス/特産品）:"
read -p "カテゴリ: " CATEGORY
read -p "著者名: " AUTHOR

FILE="src/content/articles/${SLUG}.md"

cat > "$FILE" << EOF
---
title: "$TITLE"
description: "$DESC"
category: $CATEGORY
date: "$DATE"
author: "$AUTHOR"
tags: []
featured: false
---

## はじめに

ここに本文を書いてください。

## 見出し2

内容...

## まとめ

まとめの内容...
EOF

echo ""
echo "✅ 記事テンプレートを作成しました: $FILE"
echo ""
echo "次のステップ:"
echo "  1. $FILE を編集して本文を書く"
echo "  2. npm run dev でプレビュー確認"
echo "  3. featured: true に変更するとトップページに表示されます"
