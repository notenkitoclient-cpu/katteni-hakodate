"use server";

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function approveStore(id: number) {
  await prisma.store.update({
    where: { id },
    data: { is_approved: true }
  });
  revalidatePath('/admin');
  revalidatePath('/stores');
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
