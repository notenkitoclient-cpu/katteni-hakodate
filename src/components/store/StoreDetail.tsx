import { Store } from '@prisma/client';
import OpenBadge from './OpenBadge';

export default function StoreDetail({ store, isPreview = false }: { store: Store; isPreview?: boolean }) {
  let images: string[] = [];
  try { images = JSON.parse(store.images); } catch (e) {}

  const snsLinks = [
    store.website_url      && { label: '公式HP', url: store.website_url, style: 'bg-foreground text-background hover:bg-accent' },
    store.reservation_url && { label: '予約・問い合わせ', url: store.reservation_url, style: 'border-2 border-foreground hover:bg-foreground hover:text-background' },
    store.sns_line       && { label: 'LINE公式', url: store.sns_line, style: 'bg-[#06C755] text-white hover:opacity-80' },
    store.sns_instagram  && { label: 'Instagram', url: store.sns_instagram.startsWith('http') ? store.sns_instagram : `https://instagram.com/${store.sns_instagram.replace('@', '')}`, style: 'border border-foreground hover:bg-foreground hover:text-background' },
    store.sns_x          && { label: 'X (Twitter)', url: store.sns_x.startsWith('http') ? store.sns_x : `https://x.com/${store.sns_x.replace('@', '')}`, style: 'border border-foreground hover:bg-foreground hover:text-background' },
    store.sns_facebook   && { label: 'Facebook', url: store.sns_facebook, style: 'border border-foreground hover:bg-foreground hover:text-background' },
  ].filter(Boolean) as { label: string; url: string; style: string }[];

  return (
    <div className="w-full pb-20">
      {isPreview && (
        <div className="bg-accent text-white p-4 text-center font-bold tracking-widest text-sm uppercase sticky top-0 z-50">
          Preview Mode — 審査待ちのため一般公開されていません
        </div>
      )}

      {/* Main Image */}
      <div className="w-full h-[40vh] md:h-[60vh] bg-gray-200 overflow-hidden relative border-b-4 border-foreground">
        {images.length > 0 ? (
          <img src={images[0]} alt={store.store_name} className="w-full h-full object-cover grayscale opacity-80 mix-blend-multiply" />
        ) : (
          <div className="w-full h-full flex items-center justify-center font-tele text-subtext text-xl tracking-widest">NO IMAGE</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent opacity-50 pointer-events-none" />
      </div>

      <div className="popeye-container -mt-20 relative z-10">

        {/* Header Card */}
        <div className="bg-background border-2 border-foreground p-8 md:p-12 mb-12 shadow-[8px_8px_0_0_rgba(26,26,26,1)]">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 border-b-2 border-foreground pb-6 gap-4">
            <div>
              <span className="font-tele text-subtext text-xs uppercase tracking-widest mb-2 block">
                {store.location_area} / {store.category}
              </span>
              <h1 className="text-4xl md:text-5xl font-serif leading-tight">{store.store_name}</h1>
            </div>
            <OpenBadge hoursString={store.opening_hours} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Left: SPEC */}
            <div className="font-tele text-sm">
              <h3 className="font-bold border-b border-border pb-2 mb-4">SPEC</h3>
              <ul className="space-y-3 mb-6">
                <li className="flex gap-3">
                  <span className="w-20 text-subtext shrink-0">ADD.</span>
                  <span>{store.address || '非公開'}</span>
                </li>
                {store.contact_tel && (
                  <li className="flex gap-3">
                    <span className="w-20 text-subtext shrink-0">TEL.</span>
                    <a href={`tel:${store.contact_tel}`} className="text-accent underline">{store.contact_tel}</a>
                  </li>
                )}
                {store.opening_hours && (
                  <li className="flex gap-3">
                    <span className="w-20 text-subtext shrink-0">OPEN.</span>
                    <span className="whitespace-pre-wrap">{store.opening_hours}</span>
                  </li>
                )}
              </ul>

              {/* SNS Buttons */}
              {snsLinks.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {snsLinks.map(({ label, url, style }) => (
                    <a
                      key={label}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`px-4 py-2 text-xs font-tele font-bold tracking-wider transition-colors ${style}`}
                    >
                      {label}
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* Right: OUR CHALLENGE */}
            <div className="border-t md:border-t-0 md:border-l border-border pt-8 md:pt-0 md:pl-8">
              <h3 className="font-bold font-tele border-b border-border pb-2 mb-4">OUR CHALLENGE</h3>
              <p className="text-lg leading-loose">{store.our_challenge || '（情報準備中）'}</p>
            </div>
          </div>
        </div>

        {/* Google Map */}
        {store.address && (
          <div className="mb-12">
            <h3 className="font-tele text-xs tracking-widest text-subtext mb-3">MAP</h3>
            <div className="border border-border overflow-hidden">
              <iframe
                src={`https://maps.google.com/maps?q=${encodeURIComponent(store.address)}&output=embed&hl=ja&z=16`}
                width="100%"
                height="320"
                loading="lazy"
                className="block"
              />
            </div>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(store.address)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-tele text-xs text-subtext hover:text-accent mt-2 inline-block"
            >
              Google マップで開く →
            </a>
          </div>
        )}

        {/* PR Video */}
        {store.video_url && (
          <div className="mb-12">
            <h3 className="font-tele text-xs tracking-widest text-subtext mb-3">PR VIDEO</h3>
            <a
              href={store.video_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block border-2 border-foreground px-6 py-3 font-bold hover:bg-foreground hover:text-background transition-colors"
            >
              動画を見る →
            </a>
          </div>
        )}

        {/* Katteni Review */}
        {store.user_comment && (
          <div className="max-w-3xl mx-auto mb-20 flex gap-6 items-start">
            <div className="w-12 h-12 bg-foreground rounded-full shrink-0 mt-2 flex items-center justify-center text-background font-serif font-bold text-xl">K</div>
            <div className="bg-gray-100 p-8 relative">
              <div className="absolute top-8 -left-4 w-0 h-0 border-t-8 border-t-transparent border-r-[16px] border-r-gray-100 border-b-8 border-b-transparent" />
              <h4 className="font-tele text-xs text-subtext mb-2 tracking-widest font-bold">KATTENI REVIEW</h4>
              <p className="text-xl font-serif leading-relaxed">「{store.user_comment}」</p>
              {store.hidden_gem && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <span className="bg-accent text-white text-[10px] font-tele tracking-widest px-2 py-1 mr-3">HIDDEN GEM</span>
                  <span className="text-sm font-bold">{store.hidden_gem}</span>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
