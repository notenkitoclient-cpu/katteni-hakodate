import Link from 'next/link';
import prisma from '@/lib/prisma';
import StoreCard from '@/components/store/StoreCard';

export const dynamic = 'force-dynamic';

const TYPE_STYLES: Record<string, string> = {
  '開店':     'bg-green-600 text-white',
  '閉店':     'bg-foreground text-white',
  '工事中':   'bg-amber-500 text-white',
  'イベント': 'bg-accent text-white',
  '目撃情報': 'bg-blue-600 text-white',
};

function formatDate(d: Date) {
  return new Date(d).toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' });
}

export default async function Home() {
  const [stores, news] = await Promise.all([
    prisma.store.findMany({
      where: { is_approved: true },
      orderBy: { created_at: 'desc' },
      take: 3,
    }),
    prisma.news.findMany({
      orderBy: { published_at: 'desc' },
      take: 5,
    }),
  ]);

  return (
    <main>
      {/* ── ヒーロー ──────────────────────────────────────────── */}
      <section className="bg-background border-b-2 border-black py-16 md:py-32 px-4">
        <div className="popeye-container">
          <div className="max-w-2xl px-0 md:px-2">
            <h1 className="font-serif text-4xl sm:text-5xl md:text-7xl font-black leading-[1.2] mb-6 md:mb-8 tracking-tight break-keep">
              リアルな函館
            </h1>
            <p className="text-base sm:text-lg md:text-2xl leading-relaxed mb-6 font-serif font-medium text-gray-800">
              地元の人が知るべき店を集めた<br className="hidden sm:block" />
              みんなで作る函館まち図鑑。
            </p>
            <p className="text-lg md:text-xl font-bold mb-12 bg-black text-white inline-block px-4 py-2">
              掲載もなにもかも無料。
            </p>
            <div>
              <Link
                href="/submit"
                className="block md:inline-block text-center bg-accent text-white px-6 md:px-8 py-4 md:py-5 text-base md:text-lg font-bold hover:bg-red-700 transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-none w-full md:w-auto"
              >
                掲載する（もちろん無料）
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── 街の呼吸（ニュース）──────────────────────────────── */}
      <section className="bg-background border-b-2 border-black py-12 md:py-14 px-4">
        <div className="popeye-container">
          <div className="flex justify-between items-end mb-6 border-b-2 border-black pb-4">
            <div>
              <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-subtext mb-1">Latest News</p>
              <h2 className="text-2xl md:text-3xl font-mono font-black uppercase tracking-tighter">街の呼吸</h2>
            </div>
            <Link
              href="/news"
              className="text-xs font-bold border-b-2 border-black hover:opacity-70 transition-opacity pb-1 uppercase tracking-widest"
            >
              すべて見る →
            </Link>
          </div>

          {news.length > 0 ? (
            <div className="divide-y divide-border">
              {news.map(item => (
                <div key={item.id} className="flex items-start gap-3 md:gap-4 py-4">
                  <span
                    className={`font-mono text-[10px] px-2 py-1 shrink-0 mt-0.5 whitespace-nowrap ${
                      TYPE_STYLES[item.type] ?? 'bg-gray-400 text-white'
                    }`}
                  >
                    {item.type}
                  </span>
                  <div className="flex-1 min-w-0">
                    {item.url ? (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-serif font-bold leading-snug hover:text-accent transition-colors"
                      >
                        {item.title}
                      </a>
                    ) : (
                      <p className="font-serif font-bold leading-snug">{item.title}</p>
                    )}
                    {item.area && (
                      <p className="font-mono text-[11px] text-subtext mt-1">📍 {item.area}</p>
                    )}
                  </div>
                  <span className="font-mono text-[11px] text-subtext shrink-0 mt-0.5 hidden sm:block">
                    {formatDate(item.published_at)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-8 text-center font-serif italic text-subtext">
              ニュースはまだありません。
            </p>
          )}
        </div>
      </section>

      {/* ── 新着のお店 ───────────────────────────────────────── */}
      <section className="bg-white py-16 md:py-20 px-4">
        <div className="popeye-container">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 md:mb-12 border-b-2 border-black pb-4 gap-4">
            <h2 className="text-2xl md:text-3xl font-mono font-black uppercase tracking-tighter">新着のお店</h2>
            <Link
              href="/stores"
              className="text-xs md:text-sm font-bold border-b-2 border-black hover:opacity-70 transition-opacity pb-1 uppercase tracking-widest"
            >
              すべて見る →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {stores.length > 0 ? (
              stores.map(store => (
                <StoreCard key={store.id} store={store} />
              ))
            ) : (
              <p className="col-span-3 text-center py-20 font-serif italic text-gray-400">
                まだ投稿がありません。
              </p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
