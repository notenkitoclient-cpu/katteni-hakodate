"use server";

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

async function geocode(address: string | null, locationArea: string): Promise<{ lat: number; lng: number } | null> {
  const query = address || `${locationArea} 函館市`;
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query + ' 北海道函館市')}&format=json&limit=1`;
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'katteni-hakodate/1.0' } });
    const data = await res.json();
    if (data[0]) return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
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
