import { MetadataRoute } from 'next';
import prisma from '@/lib/prisma';

const BASE_URL = 'https://kattenihakodate.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 固定ページ
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL,              lastModified: new Date(), changeFrequency: 'daily',  priority: 1.0 },
    { url: `${BASE_URL}/stores`,  lastModified: new Date(), changeFrequency: 'daily',  priority: 0.9 },
    { url: `${BASE_URL}/news`,    lastModified: new Date(), changeFrequency: 'hourly', priority: 0.9 },
    { url: `${BASE_URL}/submit`,  lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/about`,   lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    { url: `${BASE_URL}/terms`,   lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
  ];

  // 公開済み店舗の個別ページ
  const stores = await prisma.store.findMany({
    where: { is_approved: true },
    select: { slug: true, created_at: true },
    orderBy: { created_at: 'desc' },
  });

  const storeRoutes: MetadataRoute.Sitemap = stores.map((store) => ({
    url: `${BASE_URL}/stores/${store.slug}`,
    lastModified: store.created_at,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  return [...staticRoutes, ...storeRoutes];
}
