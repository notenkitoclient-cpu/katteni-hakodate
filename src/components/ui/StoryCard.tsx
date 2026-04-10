/**
 * StoryCard — Gallery View
 * モノクロの世界に、鮮やかなカラーブロックが飛び込んでくる
 * ホバー = 色の変化ではなく「浮き上がり」で表現
 */

export interface Story {
  id: string;
  href: string;
  title: string;
  subtitle: string;
  month: string;
  tags: string[];
  bg: string;          // 高彩度カラー（vivid cyan / magenta / yellow etc.）
  filterTags: string[];
}

interface Props {
  story: Story;
  featured?: boolean;
}

export default function StoryCard({ story, featured = false }: Props) {
  const { href, id, title, subtitle, month, tags, bg } = story;

  return (
    <a href={href} className="gallery-card">
      {/* ── 額縁フレーム ──
          白い padding = 美術館の白壁
          内側の vivid color block = 展示された作品
      */}
      <div
        className="gallery-visual-frame"
        style={{ padding: featured ? '1.5rem' : '0.875rem' }}
      >
        <div
          className="gallery-visual-inner"
          style={{ background: bg /* 彩度100%で表示 */ }}
        >
          <span
            style={{
              position: 'absolute',
              top: '0.6rem',
              left: '0.75rem',
              fontFamily: "'JetBrains Mono','Courier New',monospace",
              fontSize: '8px',
              letterSpacing: '0.08em',
              /* 背景が鮮やかでも読めるよう白で表示 */
              color: 'rgba(255,255,255,0.55)',
            }}
          >
            #{id}
          </span>
        </div>
      </div>

      {/* ── テキスト — 純白の「額縁」として機能 ── */}
      <div className="gallery-text" style={{ background: '#ffffff' }}>
        <p className="gallery-month">{month}</p>

        <h2
          className="gallery-title"
          style={
            featured
              ? {
                  fontSize: 'clamp(2.6rem, 5vw, 5rem)',
                  fontWeight: 700,
                  letterSpacing: '0.02em',
                  lineHeight: 1.1,
                }
              : {
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
