"use client";

import { useState } from 'react';
import Link from 'next/link';
import { approveStore, deleteStore, updateStore } from './actions';
import ImageManager from '@/components/store/ImageManager';

type Store = {
  id: number; slug: string; store_name: string; category: string;
  location_area: string; address: string | null; contact_tel: string | null;
  website_url: string | null; reservation_url: string | null;
  sns_instagram: string | null; sns_x: string | null;
  sns_facebook: string | null; sns_line: string | null; video_url: string | null;
  our_challenge: string | null; user_comment: string | null; opening_hours: string | null;
  images: string; // JSON string
};

export default function PendingStoreCard({ store }: { store: Store }) {
  const [editing, setEditing] = useState(false);

  return (
    <div className="bg-white border border-border">
      <div className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex-1 min-w-0">
          <span className="bg-gray-200 text-xs px-2 py-1 font-bold mr-2">{store.category}</span>
          <strong className="text-lg">{store.store_name}</strong>
          <div className="text-sm text-subtext border-t mt-3 pt-3 space-y-1">
            <div>📍 {store.address || '（住所未入力）'}</div>
            <div>📞 {store.contact_tel || '（電話未入力）'}</div>
            {(store.user_comment || store.our_challenge) && (
              <div className="truncate max-w-sm">💬 {store.user_comment || store.our_challenge}</div>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          <Link href={`/stores/${store.slug}/preview`} target="_blank"
            className="px-4 py-2 border border-border text-center text-sm font-bold bg-gray-50 hover:bg-gray-100">
            プレビュー
          </Link>
          <button onClick={() => setEditing(v => !v)}
            className="px-4 py-2 border border-border text-sm font-bold hover:bg-gray-100">
            {editing ? '閉じる' : '編集'}
          </button>
          <form action={async () => { await approveStore(store.id); }}>
            <button type="submit" className="px-6 py-2 bg-foreground text-background text-sm font-bold uppercase tracking-widest hover:bg-accent transition-colors">
              公開する
            </button>
          </form>
          <form action={async () => { await deleteStore(store.id); }}>
            <button type="submit" className="px-4 py-2 text-sm font-bold text-accent border border-accent hover:bg-accent hover:text-white transition-colors">
              削除
            </button>
          </form>
        </div>
      </div>

      {editing && (
        <form action={async (fd) => { await updateStore(store.id, fd); setEditing(false); }}
          className="border-t-2 border-border bg-gray-50 p-6">
          <StoreEditFields store={store} onCancel={() => setEditing(false)} />
        </form>
      )}
    </div>
  );
}

export function StoreEditFields({ store, onCancel }: { store: Store; onCancel: () => void }) {
  let initialImages: string[] = [];
  try { initialImages = JSON.parse(store.images); } catch {}

  return (
    <>
      <h3 className="font-tele text-xs tracking-widest mb-6 text-subtext">EDIT STORE INFO</h3>

      {/* 画像管理 */}
      <div className="mb-6">
        <label className="block text-xs text-subtext mb-2">画像（最大5枚）</label>
        <ImageManager initialImages={initialImages} name="images" maxImages={5} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="店舗名 *" name="store_name" defaultValue={store.store_name} required />
        <div>
          <label className="block text-xs text-subtext mb-1">カテゴリ</label>
          <select name="category" defaultValue={store.category} className="w-full border border-border px-3 py-2 text-sm focus:border-accent outline-none bg-white">
            {['飲食店','新規オープン','暮らしの困りごと','小売・アパレル','美容・健康','その他'].map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs text-subtext mb-1">エリア</label>
          <select name="location_area" defaultValue={store.location_area} className="w-full border border-border px-3 py-2 text-sm focus:border-accent outline-none bg-white">
            {['本町・五稜郭','西部地区','函館駅前・大門','湯の川','桔梗・昭和','その他'].map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
        <Field label="住所" name="address" defaultValue={store.address} placeholder="函館市〇〇町X-X" />
        <Field label="電話番号" name="contact_tel" defaultValue={store.contact_tel} placeholder="0138-XX-XXXX" />
        <Field label="営業時間" name="opening_hours" defaultValue={store.opening_hours} placeholder="11:00〜22:00 / 火曜定休" />
        <Field label="公式HP URL" name="website_url" defaultValue={store.website_url} placeholder="https://..." />
        <Field label="予約URL" name="reservation_url" defaultValue={store.reservation_url} placeholder="https://..." />
        <Field label="LINE URL" name="sns_line" defaultValue={store.sns_line} />
        <Field label="Instagram" name="sns_instagram" defaultValue={store.sns_instagram} placeholder="@account" />
        <Field label="X (Twitter)" name="sns_x" defaultValue={store.sns_x} placeholder="@account" />
        <Field label="Facebook URL" name="sns_facebook" defaultValue={store.sns_facebook} />
        <Field label="PR動画URL" name="video_url" defaultValue={store.video_url} />
        <div className="md:col-span-2">
          <label className="block text-xs text-subtext mb-1">今取り組んでいること（Our Challenge）</label>
          <textarea name="our_challenge" defaultValue={store.our_challenge || ''} rows={3}
            className="w-full border border-border px-3 py-2 text-sm focus:border-accent outline-none bg-white resize-none" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs text-subtext mb-1">推しポイント（User Comment）</label>
          <textarea name="user_comment" defaultValue={store.user_comment || ''} rows={2}
            className="w-full border border-border px-3 py-2 text-sm focus:border-accent outline-none bg-white resize-none" />
        </div>
      </div>
      <div className="flex gap-3 mt-6">
        <button type="submit" className="px-8 py-2 bg-foreground text-background text-sm font-bold hover:bg-accent transition-colors">
          保存する
        </button>
        <button type="button" onClick={onCancel} className="px-6 py-2 border border-border text-sm hover:bg-gray-100">
          キャンセル
        </button>
      </div>
    </>
  );
}

function Field({ label, name, defaultValue, placeholder, required }: {
  label: string; name: string; defaultValue?: string | null;
  placeholder?: string; required?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs text-subtext mb-1">{label}</label>
      <input name={name} defaultValue={defaultValue || ''} placeholder={placeholder}
        required={required}
        className="w-full border border-border px-3 py-2 text-sm focus:border-accent outline-none bg-white" />
    </div>
  );
}
