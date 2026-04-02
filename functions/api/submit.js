/**
 * Cloudflare Pages Function
 * POST /api/submit — 市民投稿をDiscordに通知
 */

export async function onRequestPost(context) {
  const webhookUrl = context.env.DISCORD_SUBMIT_WEBHOOK_URL;

  if (!webhookUrl) {
    return json({ ok: false, error: 'webhook未設定' }, 500);
  }

  let body;
  try {
    body = await context.request.json();
  } catch {
    return json({ ok: false, error: 'リクエスト形式が不正です' }, 400);
  }

  const { title, type, area, detail, sourceUrl, reporter } = body;

  if (!title || !type || !area) {
    return json({ ok: false, error: '必須項目が不足しています' }, 400);
  }

  const TYPE_EMOJI = {
    '開店': '🟢', '閉店': '⚫', '工事中': '🟡',
    'イベント': '🔴', '目撃情報': '🔵', 'その他': '⚪',
  };
  const emoji = TYPE_EMOJI[type] || '📋';

  const message = [
    '## ' + emoji + ' 【市民投稿】' + type + ' — ' + title,
    '',
    '**エリア**: ' + area,
    detail ? '**詳細**: ' + detail : '',
    sourceUrl ? '**情報元**: ' + sourceUrl : '',
    reporter ? '**投稿者**: ' + reporter : '**投稿者**: 匿名',
    '',
    '---',
    '✅ 掲載する場合は `npm run news -- --title "' + title + '" --type "' + type + '" --area "' + area + '"` を実行',
  ].filter(Boolean).join('\n');

  const res = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: message }),
  });

  if (!res.ok) {
    return json({ ok: false, error: 'Discord通知に失敗しました' }, 500);
  }

  return json({ ok: true });
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
