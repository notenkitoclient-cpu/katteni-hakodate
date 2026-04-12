import { Store } from '@prisma/client';
import Link from 'next/link';
import OpenBadge from './OpenBadge';

export default function StoreCard({ store }: { store: Store }) {
  let images: string[] = [];
  try { images = JSON.parse(store.images); } catch {}

  return (
    <Link href={`/stores/${store.slug}`} className="group block">
      <div className="aspect-[3/4] bg-gray-100 border border-border mb-4 overflow-hidden relative">
        {images[0] ? (
          <img
            src={images[0]}
            alt={store.store_name}
            className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center font-tele text-xs text-subtext">NO IMAGE</div>
        )}
        <span className="absolute top-3 left-3 bg-background text-foreground font-tele text-xs px-2 py-1 border border-foreground">
          {store.category}
        </span>
      </div>
      <h3 className="font-serif text-xl font-bold group-hover:text-accent transition-colors mb-1">
        {store.store_name}
      </h3>
      <div className="flex items-center gap-2 font-tele text-xs text-subtext">
        <span>{store.location_area}</span>
        <OpenBadge hoursString={store.opening_hours} />
      </div>
    </Link>
  );
}
