export const dynamic = 'force-dynamic';
import prisma from '@/lib/prisma';
import { deleteStore, approveNews, deleteNews } from './actions';
import { logout } from './login/actions';
import PendingStoreCard from './PendingStoreCard';
import ApprovedStoreCard from './ApprovedStoreCard';

const TYPE_STYLES: Record<string, string> = {
  '開店': 'bg-green-600 text-white',
  '閉店': 'bg-gray-800 text-white',
  '工事中': 'bg-amber-500 text-white',
  'イベント': 'bg-red-500 text-white',
  '目撃情報': 'bg-blue-600 text-white',
};

export default async function AdminDashboard() {
  const [pendingStores, approvedStores, pendingNews] = await Promise.all([
    prisma.store.findMany({ where: { is_approved: false }, orderBy: { created_at: 'desc' } }),
    prisma.store.findMany({ where: { is_approved: true },  orderBy: { created_at: 'desc' } }),
    prisma.news.findMany({  where: { is_approved: false }, orderBy: { created_at: 'desc' } }),
  ]);

  return (
    <div className="w-full bg-gray-50 min-h-screen pb-20">
      <div className="bg-foreground text-background py-8 mb-8">
        <div className="popeye-container flex justify-between items-center">
          <h1 className="font-serif text-2xl">Admin Dashboard</h1>
          <form action={logout}>
            <button
              type="submit"
              className="font-mono text-xs tracking-widest uppercase opacity-50 hover:opacity-100 transition-opacity border-b border-white pb-0.5"
            >
              Logout
            </button>
          </form>
        </div>
      </div>

      <div className="popeye-container">

        {/* ニュース審査 */}
        <section className="mb-16">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-500 inline-block animate-pulse" />
            ニュース審査待ち（{pendingNews.length}件）
          </h2>

          {pendingNews.length === 0 ? (
            <div className="bg-white border text-subtext p-8 text-center">審査待ちのニュースはありません</div>
          ) : (
            <div className="space-y-3">
              {pendingNews.map(news => (
                <div key={news.id} className="bg-white border p-4 flex flex-col sm:flex-row sm:items-start gap-3">
                  <span className={`font-mono text-[10px] px-2 py-1 shrink-0 whitespace-nowrap ${TYPE_STYLES[news.type] ?? 'bg-gray-400 text-white'}`}>
                    {news.type}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm leading-snug mb-1">{news.title}</p>
                    {news.body && <p className="text-xs text-subtext mb-1 line-clamp-2">{news.body}</p>}
                    <div className="flex items-center gap-3 font-mono text-[10px] text-subtext">
                      {news.area && <span>📍 {news.area}</span>}
                      {news.url && (
                        <a href={news.url} target="_blank" rel="noopener noreferrer" className="underline hover:text-accent truncate max-w-[200px]">
                          元記事 →
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <form action={approveNews.bind(null, news.id)}>
                      <button className="bg-green-600 text-white font-mono text-xs px-3 py-1.5 hover:bg-green-700 transition-colors">
                        承認＋投稿
                      </button>
                    </form>
                    <form action={deleteNews.bind(null, news.id)}>
                      <button className="bg-gray-200 text-gray-700 font-mono text-xs px-3 py-1.5 hover:bg-gray-300 transition-colors">
                        削除
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 審査待ち */}
        <section className="mb-16">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-accent inline-block animate-pulse" />
            審査待ち（{pendingStores.length}件）
          </h2>

          {pendingStores.length === 0 ? (
            <div className="bg-white border text-subtext p-8 text-center">審査待ちの投稿はありません</div>
          ) : (
            <div className="space-y-4">
              {pendingStores.map(store => (
                <PendingStoreCard key={store.id} store={store} />
              ))}
            </div>
          )}
        </section>

        {/* 公開済み */}
        <section>
          <h2 className="text-xl font-bold mb-6 text-subtext">公開済み（{approvedStores.length}件）</h2>
          <div className="bg-white border rounded overflow-hidden">
            <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-4 py-2 bg-gray-100 font-tele text-xs tracking-widest border-b">
              <span>STORE NAME</span>
              <span className="hidden md:block">AREA</span>
              <span className="hidden md:block">DATE</span>
              <span>EDIT</span>
              <span>DEL</span>
            </div>
            {approvedStores.length === 0 ? (
              <div className="p-8 text-center text-subtext text-sm">公開済みの店舗はありません</div>
            ) : (
              approvedStores.map(store => (
                <ApprovedStoreCard key={store.id} store={store} />
              ))
            )}
          </div>
        </section>

      </div>
    </div>
  );
}
