"""
Threads アカウント分析スクリプト

環境変数:
  THREADS_ACCESS_TOKEN  必須: Threads API アクセストークン
  DISCORD_WEBHOOK_URL   任意: 分析結果をDiscordに送信
"""

import os
import sys
import requests
from datetime import datetime, timezone, timedelta

THREADS_TOKEN  = os.environ.get("THREADS_ACCESS_TOKEN", "")
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
    return api_get("/me", {"fields": "id,username,name,threads_biography"})


def fetch_posts(limit=25):
    # メトリクス系フィールドは /insights で個別取得するためここでは除外
    fields = "id,text,timestamp,media_type"
    data = api_get("/me/threads", {"fields": fields, "limit": limit})
    posts = (data or {}).get("data", [])

    # 各投稿のメトリクスを /insights で取得（最大limit件）
    for post in posts:
        insights = api_get(
            f"/{post['id']}/insights",
            {"metric": "likes,views,replies,reposts,quotes"},
        )
        if insights:
            for item in (insights.get("data") or []):
                name = item["name"]
                value = (item.get("values") or [{}])[0].get("value", 0)
                # like_count/reply_count 等の命名に合わせる
                key_map = {
                    "likes":   "like_count",
                    "views":   "views",
                    "replies": "reply_count",
                    "reposts": "repost_count",
                    "quotes":  "quote_count",
                }
                post[key_map.get(name, name)] = value

    return posts


def fetch_account_insights():
    since = int((datetime.now(JST) - timedelta(days=1)).timestamp())
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


# ─── レポート生成・送信 ─────────────────────────────────

def fmt_int(v):
    return f"{v:,}" if isinstance(v, (int, float)) else str(v)


def build_report(profile, stats, insights):
    yesterday = (datetime.now(JST) - timedelta(days=1)).strftime("%Y-%m-%d")
    lines = [
        f"📊 **Threads前日レポート** | {yesterday}",
        f"@{profile.get('username')}",
        "",
        "━━━ 前日のアカウント実績 ━━━",
    ]

    label = {
        "views":           "👁 閲覧",
        "likes":           "❤️ いいね",
        "replies":         "💬 リプライ",
        "reposts":         "🔁 リポスト",
        "quotes":          "💬 引用",
        "followers_count": "👤 フォロワー増減",
    }
    for k, v in insights.items():
        lines.append(f"  {label.get(k, k)}: {fmt_int(v)}")

    if not insights:
        lines.append("  （インサイトデータなし）")

    lines += ["", "━━━ 直近投稿サマリー ━━━"]
    if stats:
        lines += [
            f"期間: {stats.get('date_range', 'N/A')}  投稿数: {stats['post_count']}件",
            f"❤️ いいね計 {fmt_int(stats['total_likes'])}  平均 {stats['avg_likes']}",
            f"💬 リプライ計 {fmt_int(stats['total_replies'])}  🔁 リポスト {fmt_int(stats['total_reposts'])}",
            f"👁 閲覧計 {fmt_int(stats['total_views'])}  平均 {fmt_int(stats['avg_views'])}",
            f"📈 エンゲージメント率 {stats['engagement']}%",
        ]

    top3 = (stats or {}).get("top3", [])
    if top3:
        lines += ["", "━━━ バズった投稿TOP3（いいね順） ━━━"]
        for i, p in enumerate(top3, 1):
            text = (p.get("text") or "(テキストなし)")[:60]
            ts = p.get("timestamp", "")
            try:
                dt = datetime.fromisoformat(ts.replace("Z", "+00:00")).astimezone(JST).strftime("%m/%d")
            except Exception:
                dt = ""
            lines.append(f"{i}. [{dt}] {text}  ❤️{p.get('like_count', 0)}")

    return "\n".join(lines)


def send_discord(text):
    if not DISCORD_WEBHOOK:
        print("DISCORD_WEBHOOK_URL 未設定のためスキップ")
        return
    r = requests.post(DISCORD_WEBHOOK, json={"content": text[:2000]}, timeout=10)
    print(f"Discord送信: {r.status_code}")


# ─── エントリポイント ───────────────────────────────────

def main():
    if not THREADS_TOKEN:
        print("エラー: THREADS_ACCESS_TOKEN が未設定です。", file=sys.stderr)
        sys.exit(1)

    print("Threads分析を開始します...")

    profile = fetch_profile()
    if not profile:
        print("プロフィール取得失敗。アクセストークンを確認してください。", file=sys.stderr)
        sys.exit(1)

    print(f"対象: @{profile.get('username')}")

    posts    = fetch_posts(limit=25)
    stats    = summarize(posts)
    insights = fetch_account_insights()

    report = build_report(profile, stats, insights)
    print(report)
    send_discord(report)


if __name__ == "__main__":
    main()
