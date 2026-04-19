'use client';

import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import Link from 'next/link';
import L from 'leaflet';

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

const HAKODATE_CENTER: [number, number] = [41.7780, 140.7290];

export default function StoreMap({ stores }: { stores: StorePin[] }) {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    L.Marker.prototype.options.icon = icon;
  }, []);

  // タッチ操作でページスクロールを妨げないようにする
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const prevent = (e: TouchEvent) => { if (e.touches.length === 1) e.stopPropagation(); };
    el.addEventListener('touchmove', prevent, { passive: true });
    return () => el.removeEventListener('touchmove', prevent);
  }, []);

  return (
    <div ref={wrapperRef} style={{ height: '100%', width: '100%' }}>
      <MapContainer
        center={HAKODATE_CENTER}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
        dragging={true}
        touchZoom={true}
        doubleClickZoom={true}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
          maxZoom={19}
        />
        {stores.map(store => (
          <Marker key={store.id} position={[store.lat, store.lng]} icon={icon}>
            <Popup>
              <div style={{ minWidth: 160 }}>
                <p style={{ fontWeight: 'bold', marginBottom: 4 }}>{store.store_name}</p>
                <p style={{ color: '#888', fontSize: 12, marginBottom: 8 }}>{store.category} · {store.location_area}</p>
                <Link
                  href={`/stores/${store.slug}`}
                  style={{ color: '#dc2626', fontWeight: 'bold', fontSize: 12 }}
                >
                  詳しく見る →
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
