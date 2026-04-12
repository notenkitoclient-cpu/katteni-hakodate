"use client";

import { useState } from 'react';
import Link from 'next/link';
import { deleteStore, updateStore } from './actions';
import { StoreEditFields } from './PendingStoreCard';

type Store = {
  id: number; slug: string; store_name: string; category: string;
  location_area: string; address: string | null; contact_tel: string | null;
  website_url: string | null; reservation_url: string | null;
  sns_instagram: string | null; sns_x: string | null;
  sns_facebook: string | null; sns_line: string | null; video_url: string | null;
  our_challenge: string | null; user_comment: string | null; opening_hours: string | null;
  images: string;
  created_at: Date;
};

export default function ApprovedStoreCard({ store }: { store: Store }) {
  const [editing, setEditing] = useState(false);

  return (
    <div className="border-b border-border last:border-b-0">
      {/* Table row */}
      <div className="grid grid-cols-[1fr_auto_auto_auto_auto] items-center gap-4 px-4 py-3 text-sm">
        <div className="font-bold min-w-0">
          <Link href={`/stores/${store.slug}`} target="_blank" className="hover:underline hover:text-accent">
            {store.store_name}
          </Link>
          <span className="ml-2 text-xs text-subtext font-normal">{store.category}</span>
        </div>
        <span className="text-subtext text-xs hidden md:block">{store.location_area}</span>
        <span className="text-subtext text-xs hidden md:block">
          {new Date(store.created_at).toLocaleDateString('ja-JP')}
        </span>
        <button
          onClick={() => setEditing(v => !v)}
          className="px-3 py-1 border border-border text-xs font-bold hover:bg-gray-100 whitespace-nowrap"
        >
          {editing ? '閉じる' : '編集'}
        </button>
        <form action={async () => { await deleteStore(store.id); }}>
          <button type="submit" className="px-3 py-1 text-xs font-bold text-accent border border-accent hover:bg-accent hover:text-white transition-colors">
            削除
          </button>
        </form>
      </div>

      {/* Inline edit form */}
      {editing && (
        <form
          action={async (fd) => { await updateStore(store.id, fd); setEditing(false); }}
          className="bg-gray-50 border-t border-border px-6 py-6"
        >
          <StoreEditFields store={store} onCancel={() => setEditing(false)} />
        </form>
      )}
    </div>
  );
}
