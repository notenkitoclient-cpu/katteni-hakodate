import prisma from '@/lib/prisma';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '街の呼吸 — 開店・閉店ニュース',
  description: '函館の開店・閉店・イベント情報をリアルタイムで更新。街の今の動きをいち早くお届けします。',
  openGraph: {
    title: '街の呼吸 — 開店・閉店ニュース | カッテニハコダテ',
    description: '函館の開店・閉店・イベント情報をリアルタイムで更新。街の今の動きをいち早くお届けします。',
  },
};

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

function formatDateFull(d: Date) {
  return new Date(d).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default async function NewsPage() {
  const news = await prisma.news.findMany({
    orderBy: { published_at: 'desc' },
    take: 100,
  });

  // 日付でグループ化
  const grouped = news.reduce<Record<string, typeof news>>((acc, item) => {
    const key = new Date(item.published_at).toISOString().split('T')[0];
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  const dates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  return (
    <main className="bg-white min-h-screen">
      <section className="popeye-container py-16 md:py-24 px-4">

        {/* ヘッダー */}
        <header className="mb-12 border-b-4 border-black pb-8">
          <p className="font-mono text-xs tracking-[0.3em] uppercase text-subtext mb-3">Latest News</p>
          <h1 className="font-serif text-4xl md:text-6xl font-black tracking-tight leading-none mb-4">
            街の呼吸
          </h1>
          <p className="font-serif text-lg text-gray-600">
            函館の開店・閉店・工事・イベント情報を随時更新。
          </p>
        </header>

        {/* ニュースリスト */}
        {dates.length === 0 ? (
          <p className="py-20 text-center font-serif italic text-subtext text-lg">
            ニュースはまだありません。
          </p>
        ) : (
          <div className="space-y-12">
            {dates.map(date => (
              <div key={date}>
                {/* 日付ヘッダー */}
                <div className="flex items-center gap-4 mb-4">
                  <span className="font-mono text-xs tracking-widest text-subtext uppercase">
                    {formatDateFull(new Date(date))}
                  </span>
                  <div className="flex-1 border-t border-border" />
                </div>

                {/* その日のアイテム */}
                <div className="divide-y divide-border">
                  {grouped[date].map(item => (
                    <div key={item.id} className="flex items-start gap-4 py-5">
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
                            className="font-serif font-bold text-base md:text-lg leading-snug hover:text-accent transition-colors"
                          >
                            {item.title}
                          </a>
                        ) : (
                          <p className="font-serif font-bold text-base md:text-lg leading-snug">
                            {item.title}
                          </p>
                        )}
                        {item.body && (
                          <p className="text-sm text-gray-600 mt-1 leading-relaxed">{item.body}</p>
                        )}
                        <div className="flex items-center gap-3 mt-2 font-mono text-[11px] text-subtext">
                          {item.area && <span>📍 {item.area}</span>}
                          {item.source && <span>via {item.source}</span>}
                        </div>
                      </div>

                      <span className="font-mono text-[11px] text-subtext shrink-0 mt-1 hidden sm:block">
                        {formatDate(item.published_at)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 情報提供CTA */}
        <div className="mt-20 border-2 border-black p-8 bg-background">
          <p className="font-serif text-lg font-bold mb-2">開店・閉店情報を知っている方へ</p>
          <p className="text-sm text-gray-600 mb-4">
            函館の街で見かけた情報をお寄せください。掲載させていただく場合があります。
          </p>
          <Link
            href="/submit"
            className="inline-block bg-accent text-white px-6 py-3 font-bold tracking-widest text-sm hover:bg-black transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-none"
          >
            お店を掲載する（無料）
          </Link>
        </div>
      </section>
    </main>
  );
}
