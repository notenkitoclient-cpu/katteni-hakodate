/**
 * StoryCard — Gallery View
 * 額縁効果・タイポグラフィの疎と密・ホバーでブルータリズムの影がのぞく
 */

export interface Story {
  id: string;
  href: string;
  title: string;
  subtitle: string;
  month: string;
  tags: string[];
  bg: string;
  filterTags: string[];
}

interface Props {
  story: Story;
  featured?: boolean;
}

export default function StoryCard({ story, featured = false }: Props) {
  const { href, id, title, subtitle, month, tags, bg } = story;

  // パステルカラーを hex + alpha で薄く重ねる
  const washColor = bg + '28'; // ~16% opacity

  return (
    <a href={href} className="gallery-card">
      {/* ── 額縁フレーム ── */}
      {/* 白い余白がフレームになり、内側のカラー面が「展示された作品」に見える */}
      <div
        className="gallery-visual-frame"
        style={{ padding: featured ? '1.5rem' : '0.875rem' }}
      >
        <div className="gallery-visual-inner" style={{ background: washColor }}>
          {/* 極小の ID — 余白の中のアクセント */}
          <span
            style={{
              position: 'absolute',
              top: '0.6rem',
              left: '0.75rem',
              fontFamily: "'JetBrains Mono','Courier New',monospace",
              fontSize: '8px',
              letterSpacing: '0.08em',
              opacity: 0.18,
            }}
          >
            #{id}
          </span>
        </div>
      </div>

      {/* ── テキスト ── */}
      <div className="gallery-text">
        <p className="gallery-month">{month}</p>

        <h2
          className="gallery-title"
          style={
            featured
              ? {
                  // Featured: 極端に大きく — インパクトで引き込む
                  fontSize: 'clamp(2.6rem, 5vw, 5rem)',
                  fontWeight: 700,
                  letterSpacing: '0.02em',
                  lineHeight: 1.1,
                }
              : {
                  // Grid: 極端に小さく + 字間を広げて空気感
                  fontSize: '0.875rem',
                  fontWeight: 400,
                  letterSpacing: '0.16em',
                  lineHeight: 1.65,
                }
          }
        >
          {title}
        </h2>

        <p className="gallery-sub">{subtitle}</p>

        <div className="gallery-tags">
          {tags.map(tag => (
            <span key={tag} className="gallery-tag">{tag}</span>
          ))}
        </div>
      </div>
    </a>
  );
}
