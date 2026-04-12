import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

type NewsItem = {
  title: string;
  type?: string;
  area?: string;
  body?: string;
  url?: string;
  source?: string;
  reporter?: string;
  published_at?: string;
};

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const token = process.env.API_SECRET_TOKEN;

  if (!token || authHeader !== `Bearer ${token}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { items?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (!Array.isArray(body.items) || body.items.length === 0) {
    return NextResponse.json({ error: 'items array required' }, { status: 400 });
  }

  const validItems = (body.items as unknown[]).filter(
    (item): item is NewsItem =>
      typeof item === 'object' &&
      item !== null &&
      typeof (item as NewsItem).title === 'string' &&
      (item as NewsItem).title.trim().length > 0
  );

  if (validItems.length === 0) {
    return NextResponse.json({ error: 'No valid items' }, { status: 400 });
  }

  const results = await Promise.all(
    validItems.map(item =>
      prisma.news.create({
        data: {
          title:        item.title.trim(),
          type:         item.type || 'その他',
          area:         item.area || null,
          body:         item.body || null,
          url:          item.url || null,
          source:       item.source || null,
          reporter:     item.reporter || '編集部',
          published_at: item.published_at ? new Date(item.published_at) : new Date(),
        },
      })
    )
  );

  return NextResponse.json({ success: true, count: results.length });
}

/*
 * ─── GitHub Actions / curl からの呼び出しサンプル ───────────────────────────
 *
 * curl -X POST https://kattenihakodate.com/api/news \
 *   -H "Content-Type: application/json" \
 *   -H "Authorization: Bearer $API_SECRET_TOKEN" \
 *   -d '{
 *     "items": [
 *       {
 *         "title": "函館駅前に新カフェ「◯◯」がオープン",
 *         "type": "開店",
 *         "area": "函館駅前",
 *         "body": "2026年4月12日にオープン。道産素材のスイーツが評判。",
 *         "url": "https://example.com/article/123",
 *         "source": "Google News",
 *         "published_at": "2026-04-12"
 *       }
 *     ]
 *   }'
 *
 * GitHub Actions での使い方（sheets-import.yml に追記）:
 *
 *   - name: Vercel APIにニュースを送信
 *     env:
 *       API_SECRET_TOKEN: ${{ secrets.API_SECRET_TOKEN }}
 *     run: |
 *       curl -s -X POST https://kattenihakodate.com/api/news \
 *         -H "Content-Type: application/json" \
 *         -H "Authorization: Bearer $API_SECRET_TOKEN" \
 *         -d "$(cat /tmp/news-payload.json)"
 */
