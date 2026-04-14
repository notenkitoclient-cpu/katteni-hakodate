"""
Threads アカウント分析スクリプト

使用方法（ローカル）:
  THREADS_ACCESS_TOKEN=xxx python3 scripts/threads-analyze.py
  THREADS_ACCESS_TOKEN=xxx GEMINI_API_KEY=xxx python3 scripts/threads-analyze.py

環境変数:
  THREADS_ACCESS_TOKEN   必須: Threads API アクセストークン
  THREADS_USER_ID        任意: ユーザーID（省略時は /me から自動取得）
  GEMINI_API_KEY         任意: AI分析コメントの生成に使用
  DISCORD_WEBHOOK_URL    任意: 分析結果をDiscordに送信
"""

import os
import sys
import json
import requests
from datetime import datetime, timezone, timedelta

THREADS_TOKEN = os.environ.get("THREADS_ACCESS_TOKEN", "")
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
DISCORD_WEBHOOK = os.environ.get("DISCORD_WEBHOOK_URL", "")
API_BASE = "https://graph.threads.net/v1.0"
JST = timezone(timedelta(hours=9))


# ─── API ───────────────────────────────────────────────

def api_get(path, params=None):
    p = dict(params or {})
    p["access_token"] = THREADS_TOKEN
    r = requests.get(f"{API_BASE}{path}", params=p, timeout=15)
    if r.status_code != 200:
        print(f"[API Error {r.status_code}] {path}: {r.text[:200]}", file=sys.stderr)
        return None
    return r.json()


def fetch_profile():
    fields = "id,username,name,threads_biography,followers_count,following_count"
    return api_get("/me", {"fields": fields})


def fetch_posts(limit=25):
    fields = "id,text,timestamp,media_type,like_count,reply_count,repost_count,quote_count,views"
    data = api_get("/me/threads", {"fields": fields, "limit": limit})
    return (data or {}).get("data", [])


def fetch_account_insights():
    """過去30日のアカウントインサイト"""
    since = int((datetime.now(JST) - timedelta(days=30)).timestamp())
    until = int(datetime.now(JST).timestamp())
    metrics = "views,likes,replies,reposts,quotes,followers_count"
    data = api_get(
        "/me/threads_insights",
        {"metric": metrics, "period": "day", "since": since, "until": until},
    )
    if not data:
        return {}
    result = {}
    for item in (data.get("data") or []):
        values = item.get("values") or []
        result[item["name"]] = sum(v.get("value", 0) for v in values)
    return result


# ─── 集計 ──────────────────────────────────────────────

def summarize(posts):
    if not posts:
        return {}

    def n(p, k):
        return p.get(k) or 0

    total_likes   = sum(n(p, "like_count")   for p in posts)
    total_replies = sum(n(p, "reply_count")  for p in posts)
    total_reposts = sum(n(p, "repost_count") for p in posts)
    total_quotes  = sum(n(p, "quote_count")  for p in posts)
    total_views   = sum(n(p, "views")        for p in posts)
    cnt = len(posts)

    engagement = 0.0
    if total_views > 0:
        engagement = (total_likes + total_replies + total_reposts) / total_views * 100

    timestamps = []
    for p in posts:
        ts = p.get("timestamp")
        if ts:
            try:
                timestamps.append(datetime.fromisoformat(ts.replace("Z", "+00:00")).astimezone(JST))
            except Exception:
                pass

    date_range = ""
    if timestamps:
        date_range = f"{min(timestamps):%Y/%m/%d} 〜 {max(timestamps):%Y/%m/%d}"

    top3 = sorted(posts, key=lambda p: n(p, "like_count"), reverse=True)[:3]

    return {
        "post_count":    cnt,
        "date_range":    date_range,
        "total_likes":   total_likes,
        "total_replies": total_replies,
        "total_reposts": total_reposts,
        "total_quotes":  total_quotes,
        "total_views":   total_views,
        "avg_likes":     round(total_likes   / cnt, 1),
        "avg_replies":   round(total_replies / cnt, 1),
        "avg_views":     round(total_views   / cnt, 1),
        "engagement":    round(engagement, 2),
        "top3":          top3,
    }


# ─── AI分析 ────────────────────────────────────────────

def ai_comment(profile, stats):
    if not GEMINI_API_KEY or not stats:
        return None

    top_text = "\n".join(
        f"{i+1}. 「{(p.get('text') or '')[:80]}」 ❤️{p.get('like_count', 0)}"
        for i, p in enumerate(stats.get("top3", []))
    )
    prompt = f"""以下はThreadsアカウント「@{profile.get('username')}」の分析データです。

フォロワー数: {profile.get('followers_count', 'N/A')}
直近{stats['post_count']}件 ({stats['date_range']})
　総いいね: {stats['total_likes']}  総リプライ: {stats['total_replies']}
　平均いいね/投稿: {stats['avg_likes']}  平均閲覧数: {stats['avg_views']}
　エンゲージメント率: {stats['engagement']}%

バズった投稿TOP3:
{top_text}

以下の3点を日本語で分析してください（各100文字以内）:
1. このアカウントの強み・特徴
2. エンゲージメント改善の具体的アドバイス（2点）
3. バズ投稿の傾向と活用法

余分な前置きは不要。番号付きで簡潔に。"""

    body = {"contents": [{"parts": [{"text": prompt}]}]}
    for model in ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash-latest"]:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={GEMINI_API_KEY}"
        r = requests.post(url, json=body, timeout=30)
        d = r.json()
        if "candidates" in d:
            return d["candidates"][0]["content"]["parts"][0]["text"]
    return None


# ─── 出力 ──────────────────────────────────────────────

def fmt_int(v):
    return f"{v:,}" if isinstance(v, (int, float)) else str(v)


def build_report(profile, stats, insights, ai_text):
    now = datetime.now(JST).strftime("%Y-%m-%d %H:%M JST")
    lines = [
        f"📊 **Threads分析レポート** | {now}",
        f"@{profile.get('username')} / フォロワー {fmt_int(profile.get('followers_count', '?'))}",
        "",
        "━━━ 直近投稿サマリー ━━━",
        f"期間: {stats.get('date_range', 'N/A')}  投稿数: {stats['post_count']}件",
        f"❤️ いいね計 {fmt_int(stats['total_likes'])}  平均 {stats['avg_likes']}",
        f"💬 リプライ計 {fmt_int(stats['total_replies'])}  🔁 リポスト {fmt_int(stats['total_reposts'])}",
        f"👁 閲覧計 {fmt_int(stats['total_views'])}  平均 {fmt_int(stats['avg_views'])}",
        f"📈 エンゲージメント率 {stats['engagement']}%",
    ]

    if insights:
        lines += ["", "━━━ 過去30日合計 ━━━"]
        label = {"views": "閲覧", "likes": "いいね", "replies": "リプライ",
                 "reposts": "リポスト", "quotes": "引用", "followers_count": "フォロワー増減"}
        for k, v in insights.items():
            lines.append(f"  {label.get(k, k)}: {fmt_int(v)}")

    if stats.get("top3"):
        lines += ["", "━━━ バズった投稿TOP3 ━━━"]
        for i, p in enumerate(stats["top3"], 1):
            text = (p.get("text") or "(テキストなし)")[:60]
            ts = p.get("timestamp", "")
            try:
                dt = datetime.fromisoformat(ts.replace("Z", "+00:00")).astimezone(JST).strftime("%m/%d")
            except Exception:
                dt = ""
            lines.append(f"{i}. [{dt}] {text}  ❤️{p.get('like_count',0)}")

    if ai_text:
        lines += ["", "━━━ AI分析 ━━━", ai_text]

    return "\n".join(lines)


def send_discord(text):
    if not DISCORD_WEBHOOK:
        return
    payload = {"content": text[:2000]}
    r = requests.post(DISCORD_WEBHOOK, json=payload, timeout=10)
    print(f"Discord: {r.status_code}")


def print_report(report):
    # ターミナル用にMarkdown記法を少し整える
    print("\n" + "=" * 55)
    for line in report.splitlines():
        print("  " + line)
    print("=" * 55 + "\n")


# ─── エントリポイント ───────────────────────────────────

def main():
    if not THREADS_TOKEN:
        print("エラー: THREADS_ACCESS_TOKEN が未設定です。", file=sys.stderr)
        print("使用方法: THREADS_ACCESS_TOKEN=xxx python3 scripts/threads-analyze.py")
        sys.exit(1)

    print("Threads分析を開始します...")

    profile = fetch_profile()
    if not profile:
        print("プロフィール取得失敗。アクセストークンを確認してください。", file=sys.stderr)
        sys.exit(1)

    print(f"対象: @{profile.get('username')} (フォロワー {profile.get('followers_count', '?')})")

    posts    = fetch_posts(limit=25)
    stats    = summarize(posts)
    insights = fetch_account_insights()

    print("AI分析中..." if GEMINI_API_KEY else "（GEMINI_API_KEY未設定のためAI分析なし）")
    ai_text = ai_comment(profile, stats)

    report = build_report(profile, stats, insights, ai_text)
    print_report(report)

    if DISCORD_WEBHOOK:
        send_discord(report)
        print("Discordに送信しました。")


if __name__ == "__main__":
    main()
