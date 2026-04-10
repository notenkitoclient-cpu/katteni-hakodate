/**
 * StoryCard — Neo-Brutalism スタイルのエッセイカード
 */
import StickerIcon from './StickerIcon';

export interface Story {
  id: string;          // '001', '002', ...
  href: string;
  title: string;
  subtitle: string;
  month: string;       // 'Apr 2026'
  tags: string[];
  bg: string;          // パステルカラー
  filterTags: string[];
}

interface Props {
  story: Story;
  featured?: boolean;
}

export default function StoryCard({ story, featured = false }: Props) {
  const { href, id, title, subtitle, month, tags, bg } = story;

  return (
    <a href={href} className="brutalist-card" style={{ background: bg }}>
      <div
        style={{
          padding: featured ? 'clamp(1.5rem,3vw,2.5rem)' : '1.5rem',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: '0',
          position: 'relative',
          minHeight: featured ? 'clamp(280px,40vw,440px)' : '260px',
        }}
      >
        {/* Header row: number + sticker */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
          <span
            style={{
              fontFamily: "'JetBrains Mono','Courier New',monospace",
              fontSize: '11px',
              opacity: 0.35,
              letterSpacing: '0.05em',
            }}
          >
            #{id}
          </span>
          <StickerIcon size={featured ? 60 : 48} />
        </div>

        {/* Month */}
        <p
          style={{
            fontFamily: 'Inter,sans-serif',
            fontSize: '10px',
            letterSpacing: '0.2em',
            opacity: 0.4,
            textTransform: 'uppercase',
            marginBottom: '0.75rem',
          }}
        >
          {month}
        </p>

        {/* Title */}
        <h2
          style={{
            fontFamily: "'Shippori Mincho',serif",
            fontSize: featured ? 'clamp(1.6rem,3vw,2.8rem)' : 'clamp(1.2rem,2vw,1.7rem)',
            fontWeight: 700,
            lineHeight: 1.25,
            letterSpacing: '0.03em',
            fontFeatureSettings: "'palt'",
            margin: '0 0 0.75rem',
            flex: 1,
          }}
        >
          {title}
        </h2>

        {/* Subtitle */}
        <p
          style={{
            fontFamily: 'Inter,sans-serif',
            fontSize: '0.78rem',
            opacity: 0.5,
            marginBottom: '1.25rem',
            lineHeight: 1.5,
          }}
        >
          {subtitle}
        </p>

        {/* Tags */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: 'auto' }}>
          {tags.map(tag => (
            <span
              key={tag}
              style={{
                fontFamily: 'Inter,sans-serif',
                fontSize: '9px',
                padding: '3px 8px',
                border: '1px solid rgba(0,0,0,0.2)',
                letterSpacing: '0.06em',
              }}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Read arrow */}
        <span
          style={{
            position: 'absolute',
            bottom: featured ? 'clamp(1.5rem,3vw,2.5rem)' : '1.5rem',
            right: featured ? 'clamp(1.5rem,3vw,2.5rem)' : '1.5rem',
            fontFamily: 'Inter,sans-serif',
            fontSize: '0.75rem',
            letterSpacing: '0.1em',
            opacity: 0.35,
          }}
        >
          読む →
        </span>
      </div>
    </a>
  );
}
