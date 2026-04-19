'use client';

import dynamic from 'next/dynamic';

type StorePin = {
  id: number;
  slug: string;
  store_name: string;
  category: string;
  location_area: string;
  lat: number;
  lng: number;
};

const StoreMap = dynamic(() => import('./StoreMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100">
      <p className="font-mono text-xs text-gray-400 tracking-widest animate-pulse">MAP LOADING...</p>
    </div>
  ),
});

export default function StoreMapDynamic({ stores }: { stores: StorePin[] }) {
  return <StoreMap stores={stores} />;
}
