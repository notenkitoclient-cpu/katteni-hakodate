#!/usr/bin/env python3
"""
カッテニハコダテ - Exa AIリサーチエージェント
使い方: python3 scripts/exa_research.py [クエリ]
例: python3 scripts/exa_research.py "函館 グルメ 2026"
"""

import sys
import json
import requests
from datetime import datetime

API_KEY = "6146bbcf-85b9-4839-a3ef-cf992cc2e08d"
BASE_URL = "https://api.exa.ai"

def search(query: str, num_results: int = 8, search_type: str = "auto") -> list:
    resp = requests.post(
        f"{BASE_URL}/search",
        headers={"x-api-key": API_KEY, "Content-Type": "application/json"},
        json={
            "query": query,
            "type": search_type,
            "num_results": num_results,
            "contents": {"highlights": {"max_characters": 500}}
        }
    )
    resp.raise_for_status()
    return resp.json().get("results", [])

def format_results(results: list) -> str:
    lines = []
    for i, r in enumerate(results, 1):
        date = (r.get("publishedDate") or "")[:10] or "日付不明"
        lines.append(f"\n### {i}. {r.get('title', 'タイトルなし')}")
        lines.append(f"- URL: {r.get('url', '')}")
        lines.append(f"- 日付: {date}")
        h = r.get("highlights", [])
        if h:
            lines.append(f"- 概要: {h[0][:300]}")
    return "\n".join(lines)

def run_research(topics: list) -> str:
    report = [f"# カッテニハコダテ リサーチレポート"]
    report.append(f"実行日時: {datetime.now().strftime('%Y-%m-%d %H:%M')}\n")

    for topic in topics:
        print(f"🔍 検索中: {topic}", file=sys.stderr)
        try:
            results = search(topic)
            report.append(f"\n## {topic}")
            report.append(format_results(results))
        except Exception as e:
            report.append(f"\n## {topic}\n❌ エラー: {e}")

    return "\n".join(report)

# デフォルトのリサーチクエリ
DEFAULT_TOPICS = [
    "函館 2026年 新店 オープン カフェ レストラン",
    "函館 イベント 2026年 春 祭り",
    "函館 移住 暮らし リアル 2026",
    "函館 観光 穴場 地元民 おすすめ",
    "函館 海産物 グルメ 旬",
]

if __name__ == "__main__":
    if len(sys.argv) > 1:
        topics = [" ".join(sys.argv[1:])]
    else:
        topics = DEFAULT_TOPICS

    report = run_research(topics)
    print(report)
