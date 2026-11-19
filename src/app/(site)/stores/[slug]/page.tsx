export const dynamic = 'force-dynamic';
import { cache } from 'react';
import prisma from '@/lib/prisma';
import StoreDetail from '@/components/store/StoreDetail';
import { notFound } from 'next/navigation';

type StorePageProps = { params: Promise<{ slug: string }> };

const getPublishedStore = cache((slug: string) => prisma.store.findUnique({
  where: { slug, is_approved: true },
}));

export async function generateMetadata({ params }: StorePageProps) {
  const { slug } = await params;
  const store = await getPublishedStore(slug);
  if (!store) notFound();
  return {
    title: store.store_name,
    description: [store.location_area, store.category, store.store_name].filter(Boolean).join('｜'),
    alternates: { canonical: '/stores/' + encodeURIComponent(store.slug) },
  };
}

export default async function StorePage({ params }: StorePageProps) {
  const { slug } = await params;
  const store = await getPublishedStore(slug);
  if (!store) notFound();
  return <StoreDetail store={store} isPreview={false} />;
}
