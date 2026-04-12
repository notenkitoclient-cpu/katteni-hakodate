
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

        {/* Main Grid (Collage style) */}
        <div className="md:col-span-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 gap-y-16">
            {stores.map((store, i) => {
              // Parse image mapping
              let img = '/uploads/placeholder.jpg';
              try {
                const arr = JSON.parse(store.images);
                if (arr.length > 0) img = arr[0];
              } catch (e) {}

              // Slightly offset even items for collage look
              const marginTop = i % 2 !== 0 ? 'sm:mt-12' : '';

              return (
                <Link href={`/stores/${store.slug}`} key={store.id} className={`group block ${marginTop}`}>
                  <div className="aspect-[3/4] bg-gray-200 mb-4 overflow-hidden border border-border relative">
                    {img !== '/uploads/placeholder.jpg' ? (
                      <img src={img} alt={store.store_name} className="w-full h-full object-cover grayscale transition-all duration-500 group-hover:grayscale-0 group-hover:scale-105" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-subtext font-tele p-4 text-center">
                        NO IMAGE<br/><span className="text-xs mt-2">Check the details inside.</span>
                      </div>
                    )}
                    {/* Badge */}
                    <div className="absolute top-4 left-4 bg-background text-foreground text-xs font-tele font-bold px-3 py-1 border border-foreground">
                      {store.category}
                    </div>
                  </div>
                  <div>
                    <h2 className="font-serif text-2xl font-bold mb-2 group-hover:text-accent transition-colors flex items-center justify-between">
                      <span>{store.store_name}</span>
                      <div className="scale-75 origin-right">
                        <OpenBadge hoursString={store.opening_hours} />
                      </div>
                    </h2>
                    <p className="font-tele text-xs text-subtext border-t border-border pt-2">
                      📍 {store.location_area} <span className="mx-2">|</span> 📞 {store.contact_tel || '非公開'}
                    </p>
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
