import { NextResponse } from 'next/server';

export async function GET() {
  const webhookUrl = process.env.DISCORD_SUBMIT_WEBHOOK_URL;

  if (!webhookUrl) {
    return NextResponse.json({ ok: false, error: 'DISCORD_SUBMIT_WEBHOOK_URL is not set' }, { status: 500 });
  }

  const res = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: '🧪 Discord通知テスト from kattenihakodate.com' }),
  });

  return NextResponse.json({ ok: res.ok, status: res.status, webhookSet: true });
}
