'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import Link from 'next/link';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Leaflet のデフォルトアイコン修正（Next.js ビルド対応）
const icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

type StorePin = {
  id: number;
  slug: string;
  store_name: string;
  category: string;
  location_area: string;
  lat: number;
  lng: number;
};

// 函館市中心部
const HAKODATE_CENTER: [number, number] = [41.7687, 140.7290];

export default function StoreMap({ stores }: { stores: StorePin[] }) {
  useEffect(() => {
    // SSR対策：アイコンをクライアント側で設定
    L.Marker.prototype.options.icon = icon;
  }, []);

  return (
    <MapContainer
      center={HAKODATE_CENTER}
      zoom={13}
      style={{ height: '100%', width: '100%' }}
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {stores.map(store => (
        <Marker key={store.id} position={[store.lat, store.lng]} icon={icon}>
          <Popup>
            <div className="text-sm">
              <p className="font-bold text-base leading-snug mb-1">{store.store_name}</p>
              <p className="text-gray-500 text-xs mb-2">{store.category} · {store.location_area}</p>
              <Link
                href={`/stores/${store.slug}`}
                className="text-red-600 font-bold text-xs underline"
              >
                詳しく見る →
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
