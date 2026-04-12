export const dynamic = 'force-dynamic';
import prisma from '@/lib/prisma';
import { deleteStore } from './actions';
import { logout } from './login/actions';
import PendingStoreCard from './PendingStoreCard';
import ApprovedStoreCard from './ApprovedStoreCard';

export default async function AdminDashboard() {
  const pendingStores = await prisma.store.findMany({
    where: { is_approved: false },
    orderBy: { created_at: 'desc' }
  });

  const approvedStores = await prisma.store.findMany({
    where: { is_approved: true },
    orderBy: { created_at: 'desc' }
  });

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
