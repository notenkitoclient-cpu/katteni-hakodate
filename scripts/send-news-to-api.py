"""
直前の git コミットで追加された src/content/news/*.md を検出し、
カッテニハコダテ ディレクトリサイト (Vercel) の /api/news に送信する。

環境変数:
  API_SECRET_TOKEN  - Vercel APIの認証トークン
  SITE_URL          - 送信先URL（デフォルト: https://katteni-hakodate.vercel.app）
"""

import os, json, re, sys
from urllib import request, error

SITE_URL = os.environ.get('SITE_URL', 'https://katteni-hakodate.vercel.app')
TOKEN    = os.environ.get('API_SECRET_TOKEN', '')

# 函館・道南に関連するキーワード（いずれかが title か area に含まれれば通過）
HAKODATE_KEYWORDS = [
    '函館', 'はこだて', 'ハコダテ', 'hakodate',
    '北斗', '七飯', '森町', '八雲', '長万部', '松前', '江差', '乙部',
    '道南',
]

def is_hakodate(title: str, area: str) -> bool:
    text = (title + area).lower()
    return any(kw.lower() in text for kw in HAKODATE_KEYWORDS)


# 直前コミットで追加されたニュースファイルを取得
result = os.popen(
    "git diff --name-only --diff-filter=A HEAD~1 HEAD -- 'src/content/news/*.md' 2>/dev/null"
).read().strip()
files = [f for f in result.split('\n') if f.strip()]

if not files:
    print('新規ニュースなし。API送信をスキップ。')
    sys.exit(0)

print(f'検出ファイル: {len(files)}件')


def parse_fm(text):
    m = re.match(r'^---\s*\n(.*?)\n---', text, re.DOTALL)
    if not m:
        return {}
    out = {}
    for line in m.group(1).split('\n'):
        kv = re.match(r'^(\w+):\s*["\']?(.*?)["\']?\s*$', line)
        if kv:
            out[kv.group(1)] = kv.group(2).strip()
    return out


items = []
skipped = []
for f in files:
    try:
        with open(f, encoding='utf-8') as fh:
            fm = parse_fm(fh.read())
        title = fm.get('title', '')
        area  = fm.get('area', '')
        if not title:
            continue
        if not is_hakodate(title, area):
            skipped.append(title)
            print(f'  SKIP（函館外）: {title}')
            continue
        items.append({
            'title':        title,
            'type':         fm.get('type', 'その他'),
            'area':         area,
            'url':          fm.get('source', ''),
            'source':       'Google News',
            'reporter':     fm.get('reporter', '編集部'),
            'published_at': fm.get('date', ''),
        })
    except Exception as e:
        print(f'SKIP（エラー）: {f}: {e}')

print(f'送信対象: {len(items)}件 / スキップ: {len(skipped)}件')

if not items:
    print('有効なアイテムなし。スキップ。')
    sys.exit(0)

payload = json.dumps({'items': items}, ensure_ascii=False).encode('utf-8')

req = request.Request(
    f'{SITE_URL}/api/news',
    data=payload,
    headers={
        'Content-Type':  'application/json',
        'Authorization': f'Bearer {TOKEN}',
    },
    method='POST',
)

try:
    with request.urlopen(req, timeout=30) as res:
        body = res.read().decode()
        print(f'✅ 送信完了: HTTP {res.status} — {body}')
except error.HTTPError as e:
    body = e.read().decode()
    print(f'⚠️ 送信失敗: HTTP {e.code} — {body}')
    sys.exit(1)
except Exception as e:
    print(f'⚠️ 送信エラー: {e}')
    sys.exit(1)
