/**
 * StoryCard — Gallery View スタイルのエッセイカード
 * 枠なし・影なし、ホバーで opacity のみ変化する静かなデザイン
 */

export interface Story {
  id: string;          // '001', '002', ...
  href: string;
  title: string;
  subtitle: string;
  month: string;       // 'Apr 2026'
  tags: string[];
  bg: string;          // パステルカラー（visual area に10%opacity で使用）
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
      {/* Visual area — パステルカラーを薄く wash */}
      <div
        className="gallery-visual"
        style={{ background: bg + '1a' /* ~10% opacity hex */ }}
      >
        <span className="gallery-id">#{id}</span>
      </div>

      {/* Text area */}
      <div className="gallery-text">
        <p className="gallery-month">{month}</p>

        <h2
          className="gallery-title"
          style={{ fontSize: featured ? 'clamp(1.6rem,3vw,2.6rem)' : 'clamp(1.1rem,2vw,1.5rem)' }}
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
