import prisma from '@/lib/prisma';
import StoreDetail from '@/components/store/StoreDetail';
import { notFound } from 'next/navigation';

export default async function StorePreviewPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  // プレビューページは is_approved の状態に関わらず表示する（slugを知っている人のみ）
  const store = await prisma.store.findUnique({
    where: { 
      slug
    }
  });

  if (!store) {
    notFound();
  }

  return <StoreDetail store={store} isPreview={true} />;
}
