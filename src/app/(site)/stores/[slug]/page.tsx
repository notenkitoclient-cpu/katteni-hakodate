export const dynamic = 'force-dynamic';
import prisma from '@/lib/prisma';
import StoreDetail from '@/components/store/StoreDetail';
import { notFound } from 'next/navigation';

export default async function StorePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const store = await prisma.store.findUnique({
    where: { 
      slug,
      is_approved: true // 一般公開ページは承認済みのみ
    }
  });

  if (!store) {
    notFound();
  }

  return <StoreDetail store={store} isPreview={false} />;
}
