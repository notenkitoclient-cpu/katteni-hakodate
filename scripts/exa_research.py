#!/usr/bin/env python3
"""
カッテニハコダテ - フルリサーチエージェント（Exa + X/Twitter）
使い方:
  python3 scripts/exa_research.py          # 全テーマをリサーチ
  python3 scripts/exa_research.py "函館 グルメ"  # 個別クエリ
  python3 scripts/exa_research.py --x "#函館"   # Xのみ検索
"""

import sys
import os
import subprocess
import requests
from datetime import datetime

EXA_API_KEY = "6146bbcf-85b9-4839-a3ef-cf992cc2e08d"
BASE_URL = "https://api.exa.ai"

# bird CLI 用の認証情報を ~/.zshrc から読み込む
_ZSHRC = os.path.expanduser("~/.zshrc")
if os.path.exists(_ZSHRC):
    for line in open(_ZSHRC):
        line = line.strip()
        if line.startswith("export AUTH_TOKEN="):
            os.environ.setdefault("AUTH_TOKEN", line.split("=", 1)[1].strip('"'))
        elif line.startswith("export CT0="):
            os.environ.setdefault("CT0", line.split("=", 1)[1].strip('"'))

# ── Exa 検索 ────────────────────────────────────────
def exa_search(query: str, num_results: int = 8) -> list:
    resp = requests.post(
        f"{BASE_URL}/search",
        headers={"x-api-key": EXA_API_KEY, "Content-Type": "application/json"},
        json={
            "query": query,
            "type": "auto",
            "num_results": num_results,
            "contents": {"highlights": {"max_characters": 400}}
        }
    )
    resp.raise_for_status()
    return resp.json().get("results", [])

def format_exa(results: list) -> str:
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

# ── X (bird CLI) 検索 ────────────────────────────────
def x_search(query: str, limit: int = 10) -> str:
    env = os.environ.copy()
    try:
        result = subprocess.run(
            ["bird", "search", query],
            capture_output=True, text=True, timeout=15, env=env
        )
        if result.returncode != 0:
            return f"❌ X検索エラー: {result.stderr[:200]}"
        lines = result.stdout.strip().split("\n")
        return "\n".join(lines[:limit * 8])  # 1ツイート約8行
    except subprocess.TimeoutExpired:
        return "❌ X検索タイムアウト"
    except FileNotFoundError:
        return "❌ bird CLI が見つかりません"

# ── メイン ───────────────────────────────────────────
DEFAULT_EXA_TOPICS = [
    "函館 2026年 新店 オープン カフェ レストラン",
    "函館 イベント 2026年 春 祭り",
    "函館 移住 暮らし リアル 2026",
    "函館 観光 穴場 地元民 おすすめ",
    "函館 海産物 グルメ 旬",
]

X_HASHTAGS = [
    "#函館グルメ",
    "#函館観光",
    "#函館カフェ",
    "函館 移住",
]

if __name__ == "__main__":
    args = sys.argv[1:]
    report = [f"# カッテニハコダテ リサーチレポート"]
    report.append(f"実行日時: {datetime.now().strftime('%Y-%m-%d %H:%M')}\n")

    # X のみモード
    if args and args[0] == "--x":
        query = " ".join(args[1:]) if len(args) > 1 else "#函館"
        report.append(f"## X検索: {query}")
        report.append(x_search(query))

    # 個別クエリモード
    elif args:
        query = " ".join(args)
        print(f"🔍 Exa検索: {query}", file=sys.stderr)
        try:
            results = exa_search(query)
            report.append(f"## Exa: {query}")
            report.append(format_exa(results))
        except Exception as e:
            report.append(f"❌ {e}")

    # フルリサーチモード
    else:
        report.append("## 📰 Web リサーチ（Exa）\n")
        for topic in DEFAULT_EXA_TOPICS:
            print(f"🔍 Exa: {topic}", file=sys.stderr)
            try:
                results = exa_search(topic)
                report.append(f"### {topic}")
                report.append(format_exa(results))
            except Exception as e:
                report.append(f"### {topic}\n❌ {e}")

        report.append("\n---\n## 🐦 X リアルタイム検索\n")
        for tag in X_HASHTAGS:
            print(f"🐦 X: {tag}", file=sys.stderr)
            report.append(f"### {tag}")
            report.append(x_search(tag))
            report.append("")

    print("\n".join(report))
