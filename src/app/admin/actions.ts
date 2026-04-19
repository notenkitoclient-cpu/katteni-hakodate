"use server";

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

async function geocode(address: string | null, locationArea: string): Promise<{ lat: number; lng: number } | null> {
  const query = address ? `北海道函館市${address}` : `北海道函館市${locationArea}`;
  const url = `https://msearch.gsi.go.jp/address-search/AddressSearch?q=${encodeURIComponent(query)}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data[0]?.geometry?.coordinates) {
      const [lng, lat] = data[0].geometry.coordinates;
      return { lat, lng };
    }
  } catch {}
  return null;
}

export async function approveStore(id: number) {
  const store = await prisma.store.findUnique({ where: { id } });
  const coords = store && (!store.lat || !store.lng)
    ? await geocode(store.address, store.location_area)
    : null;

  await prisma.store.update({
    where: { id },
    data: {
      is_approved: true,
      ...(coords ? { lat: coords.lat, lng: coords.lng } : {}),
    },
  });
  revalidatePath('/admin');
  revalidatePath('/stores');
  revalidatePath('/');
}

async function postToThreads(news: { title: string; type: string; area: string | null; url: string | null }) {
  const token  = process.env.THREADS_ACCESS_TOKEN;
  const userId = process.env.THREADS_USER_ID;
  if (!token || !userId) return;

  const TYPE_EMOJI: Record<string, string> = {
    '開店': '🟢', '閉店': '⚫', '工事中': '🟡',
    'イベント': '🔴', '目撃情報': '🔵', 'その他': '⚪',
  };
  const emoji = TYPE_EMOJI[news.type] ?? '📋';
  const text = `${emoji}【${news.type}】${news.title}\n\n📍 ${news.area ?? '函館市内'}\n\n#函館 #函館情報 #函館開店 #函館閉店 #カッテニハコダテ`;

  const base = `https://graph.threads.net/v1.0/${userId}`;
  const r1 = await fetch(`${base}/threads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ media_type: 'TEXT', text, access_token: token }),
  });
  const { id: containerId } = await r1.json();
  if (!containerId) return;

  await new Promise(r => setTimeout(r, 3000));
  await fetch(`${base}/threads_publish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ creation_id: containerId, access_token: token }),
  });
}

export async function approveNews(id: number) {
  const news = await prisma.news.update({
    where: { id },
    data: { is_approved: true },
  });
  revalidatePath('/admin');
  revalidatePath('/news');
  revalidatePath('/');
  await postToThreads(news).catch(() => {});
}

export async function deleteNews(id: number) {
  await prisma.news.delete({ where: { id } });
  revalidatePath('/admin');
  revalidatePath('/news');
  revalidatePath('/');
}

export async function deleteStore(id: number) {
  await prisma.store.delete({ where: { id } });
  revalidatePath('/admin');
  revalidatePath('/stores');
}

export async function updateStore(id: number, formData: FormData) {
  const str = (key: string) => (formData.get(key) as string) || null;
  await prisma.store.update({
    where: { id },
    data: {
      store_name:      formData.get('store_name') as string,
      category:        formData.get('category') as string,
      location_area:   formData.get('location_area') as string,
      address:         str('address'),
      contact_tel:     str('contact_tel'),
      website_url:     str('website_url'),
      reservation_url: str('reservation_url'),
      sns_instagram:   str('sns_instagram'),
      sns_x:           str('sns_x'),
      sns_facebook:    str('sns_facebook'),
      sns_line:        str('sns_line'),
      video_url:       str('video_url'),
      our_challenge:   str('our_challenge'),
      user_comment:    str('user_comment'),
      opening_hours:   str('opening_hours'),
      images:          (formData.get('images') as string) || '[]',
    }
  });
  revalidatePath('/admin');
  revalidatePath('/stores');
}
