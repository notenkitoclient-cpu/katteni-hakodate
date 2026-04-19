import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-ingest-secret');
  if (secret !== process.env.INGEST_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const items: { title: string; type: string; area: string; url: string; body: string }[] = await req.json();
  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ added: 0 });
  }

  // 既存URLと重複しないものだけ保存
  const existingUrls = new Set(
    (await prisma.news.findMany({ select: { url: true } })).map(n => n.url).filter(Boolean)
  );

  const toInsert = items.filter(item => item.url && !existingUrls.has(item.url));

  await prisma.news.createMany({
    data: toInsert.map(item => ({
      title:       item.title,
      type:        item.type,
      area:        item.area,
      body:        item.body,
      url:         item.url,
      source:      item.url,
      reporter:    '編集部',
      is_approved: false,
    })),
  });

  return NextResponse.json({ added: toInsert.length, skipped: items.length - toInsert.length });
}
