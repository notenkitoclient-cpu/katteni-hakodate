"use server";

import prisma from '@/lib/prisma';
import { generateSlug } from '@/lib/slug';
import { redirect } from 'next/navigation';

export async function submitStore(formData: FormData) {
  // Extract simple fields
  const store_name = formData.get('store_name') as string;
  const category = formData.get('category') as string;
  const location_area = formData.get('location_area') as string;
  const address = formData.get('address') as string;
  const contact_tel = formData.get('contact_tel') as string;
  const website_url = formData.get('website_url') as string;
  const reservation_url = formData.get('reservation_url') as string;
  const sns_instagram = formData.get('sns_instagram') as string;
  const sns_line = formData.get('sns_line') as string;
  const video_url = formData.get('video_url') as string;
  const our_challenge = formData.get('our_challenge') as string;
  
  if (!store_name) throw new Error("Store name is required");

  const slug = generateSlug(store_name);

  const newStore = await prisma.store.create({
    data: {
      slug,
      store_name,
      category,
      location_area,
      address,
      contact_tel,
      website_url,
      reservation_url,
      sns_instagram,
      sns_line,
      video_url,
      our_challenge,
      // Status is automatically false (unapproved)
    }
  });

  // Redirect to completion page passing the slug
  redirect(`/submit/complete?slug=${newStore.slug}`);
}
