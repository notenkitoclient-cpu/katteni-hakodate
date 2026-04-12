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
            <p className="font-mono text-[10px] tracking-[0.4em] uppercase text-subtext mb-6">
              函館まち図鑑
            </p>
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-black leading-[1.2] mb-6 md:mb-8 tracking-tight break-keep">
              函館の「いいもの」、<br />みんなで勝手にPR。
            </h1>
            <p className="text-base sm:text-lg md:text-xl leading-relaxed mb-10 font-serif text-gray-800">
              誰でも、自由に、無料で使える。<br />
              地元民の「推し」と「応援」が詰め込まれた、<br />
              函館最大級の市民参加型・公開データベース。
            </p>

            {/* 黒帯CTA */}
            <div className="bg-black text-white px-6 py-8 mb-8 md:mb-10">
              <p className="font-serif text-lg md:text-xl leading-relaxed mb-6 text-gray-200">
                あなたの「知ってほしい」のために、<br />ここを自由に使ってください。<br />
                <span className="text-gray-400 text-base">それが誰かの新しい発見になり、街の応援に繋がるはず。</span>
              </p>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <Link
                  href="/submit"
                  className="block text-center bg-accent text-white px-6 md:px-8 py-4 text-base md:text-lg font-bold hover:bg-red-700 transition-colors shadow-[4px_4px_0px_0px_rgba(255,255,255,0.3)] hover:shadow-none"
                >
                  お店を掲載する（無料）
                </Link>
                <span className="font-mono text-xs tracking-widest text-gray-500 border border-gray-700 px-3 py-1">
                  勝手に応援中 ✔
                </span>
              </div>
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
