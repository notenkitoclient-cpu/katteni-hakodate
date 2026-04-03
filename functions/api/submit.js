/**
 * Cloudflare Pages Function
 * POST /api/submit — 市民投稿をDiscordに通知（画像添付対応）
 */

const MAX_IMAGE_BYTES = 8 * 1024 * 1024; // 8MB (Discord制限)
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

export async function onRequestPost(context) {
  const webhookUrl = context.env.DISCORD_SUBMIT_WEBHOOK_URL;

  if (!webhookUrl) {
    return json({ ok: false, error: 'webhook未設定' }, 500);
  }

  let formData;
  try {
    formData = await context.request.formData();
  } catch {
    return json({ ok: false, error: 'リクエスト形式が不正です' }, 400);
  }

  const title    = formData.get('title')?.trim();
  const type     = formData.get('type')?.trim();
  const area     = formData.get('area')?.trim();
  const detail   = formData.get('detail')?.trim() || '';
  const sourceUrl = formData.get('sourceUrl')?.trim() || '';
  const reporter = formData.get('reporter')?.trim() || '';
  const imageFile = formData.get('image');

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
    detail    ? '**詳細**: ' + detail       : '',
    sourceUrl ? '**情報元**: ' + sourceUrl  : '',
    reporter  ? '**投稿者**: ' + reporter   : '**投稿者**: 匿名',
    '',
    '---',
    '✅ 掲載コマンド:',
    '```',
    `npm run news -- --title "${title}" --type "${type}" --area "${area}"${detail ? ` --body "${detail}"` : ''}`,
    '```',
    imageFile && imageFile.size > 0 ? '📷 画像あり（↑に `--image /path/to/image` を追加してください）' : '',
  ].filter(Boolean).join('\n');

  // 画像あり → multipart で送信
  const hasImage = imageFile && imageFile instanceof File && imageFile.size > 0;

  if (hasImage) {
    if (!ALLOWED_TYPES.includes(imageFile.type)) {
      return json({ ok: false, error: '対応していない画像形式です（JPEG/PNG/GIF/WebP）' }, 400);
    }
    if (imageFile.size > MAX_IMAGE_BYTES) {
      return json({ ok: false, error: '画像サイズが大きすぎます（8MB以内）' }, 400);
    }

    const discordForm = new FormData();
    discordForm.append('content', message);
    discordForm.append('file', imageFile, imageFile.name || 'image.jpg');

    const res = await fetch(webhookUrl, { method: 'POST', body: discordForm });
    if (!res.ok) return json({ ok: false, error: 'Discord通知に失敗しました' }, 500);
  } else {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: message }),
    });
    if (!res.ok) return json({ ok: false, error: 'Discord通知に失敗しました' }, 500);
  }

  return json({ ok: true });
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
