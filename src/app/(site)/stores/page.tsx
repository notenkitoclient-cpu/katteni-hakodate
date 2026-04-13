
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '函館まち図鑑',
  description: '誰でも自由に使える、みんなで作る函館のオープンデータ図鑑。飲食店、小売、美容など函館の魅力的なお店が集まっています。',
  openGraph: {
    title: '函館まち図鑑 | カッテニハコダテ',
    description: '誰でも自由に使える、みんなで作る函館のオープンデータ図鑑。飲食店、小売、美容など函館の魅力的なお店が集まっています。',
  },
};

export const dynamic = 'force-dynamic';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import OpenBadge from '@/components/store/OpenBadge';

export default async function StoresPage({
  searchParams,
}: {
  searchParams: Promise<{ area?: string; category?: string; }>;
}) {
  const { area, category } = await searchParams;
  const where: any = { is_approved: true };
  if (area) where.location_area = area;
  if (category) where.category = category;

  const stores = await prisma.store.findMany({
    where,
    orderBy: { created_at: 'desc' }
  });

  return (
    <div className="w-full">
      
      {/* Header */}
      <div className="border-b border-border bg-gray-50 py-12">
        <div className="popeye-container">
          <h1 className="font-serif text-4xl mb-4">函館まち図鑑</h1>
          <p className="text-subtext">みんなで作る函館のオープンデータ図鑑（全 {stores.length} 件）</p>
        </div>
      </div>

      <div className="popeye-container py-12 grid grid-cols-1 md:grid-cols-4 gap-12">
        
        {/* Navigation Sidebar */}
        <aside className="md:col-span-1 space-y-8 font-tele text-sm">
          <div>
            <h3 className="font-bold border-b-2 border-foreground pb-2 mb-4 tracking-widest">AREA</h3>
            <ul className="space-y-3">
              <li><Link href="/stores" className="hover:text-accent">すべて</Link></li>
              <li><Link href="/stores?area=本町・五稜郭" className="hover:text-accent">本町・五稜郭</Link></li>
              <li><Link href="/stores?area=西部地区" className="hover:text-accent">西部地区</Link></li>
              <li><Link href="/stores?area=函館駅前・大門" className="hover:text-accent">函館駅前・大門</Link></li>
              <li><Link href="/stores?area=桔梗・昭和" className="hover:text-accent">桔梗・昭和</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold border-b-2 border-foreground pb-2 mb-4 tracking-widest">CATEGORY</h3>
            <ul className="space-y-3">
              <li><Link href="/stores?category=飲食店" className="hover:text-accent">飲食店</Link></li>
              <li><Link href="/stores?category=暮らしの困りごと" className="hover:text-accent">暮らしの困りごと</Link></li>
              <li><Link href="/stores?category=新規オープン" className="hover:text-accent">新規オープン</Link></li>
            </ul>
          </div>
        </aside>

        {/* Main Grid */}
        <div className="md:col-span-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {stores.map((store) => {
              let img: string | null = null;
              try {
                const arr = JSON.parse(store.images);
                if (arr.length > 0) img = arr[0];
              } catch {}

              return (
                <Link href={`/stores/${store.slug}`} key={store.id} className="group block">
                  {/* 画像エリア：固定アスペクト比で統一 */}
                  <div className="aspect-[4/3] bg-gray-100 mb-3 overflow-hidden border border-border relative">
                    {img ? (
                      <img
                        src={img}
                        alt={store.store_name}
                        className="w-full h-full object-cover grayscale transition-all duration-500 group-hover:grayscale-0 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-subtext font-tele text-xs">
                        NO IMAGE
                      </div>
                    )}
                    <div className="absolute top-3 left-3 bg-background text-foreground text-xs font-tele font-bold px-2 py-0.5 border border-foreground">
                      {store.category}
                    </div>
                  </div>
                  {/* テキストエリア */}
                  <h2 className="font-serif text-lg font-bold leading-snug group-hover:text-accent transition-colors mb-1">
                    {store.store_name}
                  </h2>
                  <div className="flex items-center gap-2">
                    <p className="font-tele text-xs text-subtext">📍 {store.location_area}</p>
                    <OpenBadge hoursString={store.opening_hours} />
                  </div>
                </Link>
              );
            })}

            {stores.length === 0 && (
              <div className="col-span-full py-20 text-center text-subtext">
                指定された条件のお店は見つかりませんでした。
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
