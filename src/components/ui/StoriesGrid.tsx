/**
 * StoriesGrid — フィルター + エッセイグリッド + CTAインタースティシャル
 * client:load で使用する
 */
import { useState } from 'react';
import StoryCard, { type Story } from './StoryCard';

const FILTERS = [
  { label: 'すべて', value: 'all' },
  { label: '人口',   value: '人口' },
  { label: '漁業',   value: '漁業' },
  { label: '教育',   value: '教育' },
];

interface Props {
  stories: Story[];
}

export default function StoriesGrid({ stories }: Props) {
  const [active, setActive] = useState('all');

  const filtered = active === 'all'
    ? stories
    : stories.filter(s => s.filterTags.includes(active));

  const [featured, ...rest] = filtered;

  return (
    <div>
      {/* ── Filters ── */}
      <div
        style={{
          display: 'flex',
          gap: '0.75rem',
          flexWrap: 'wrap',
          marginBottom: '2.5rem',
          alignItems: 'center',
        }}
      >
        <span
          style={{
            fontFamily: 'Inter,sans-serif',
            fontSize: '10px',
            letterSpacing: '0.2em',
            opacity: 0.3,
            textTransform: 'uppercase',
            marginRight: '0.5rem',
          }}
        >
          Filter
        </span>
        {FILTERS.map(f => (
          <button
            key={f.value}
            onClick={() => setActive(f.value)}
            className={`brutalist-btn${active === f.value ? ' active' : ''}`}
            style={{
              fontFamily: "'Shippori Mincho',serif",
              fontSize: '0.8rem',
              padding: '0.4rem 1rem',
              letterSpacing: '0.06em',
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* ── Grid ── */}
      {filtered.length === 0 ? (
        <p style={{ fontFamily: 'Inter,sans-serif', fontSize: '0.85rem', opacity: 0.35, padding: '3rem 0' }}>
          該当するエッセイはまだありません。
        </p>
      ) : (
        <div>
          {/* Featured (最初の1枚) */}
          {featured && (
            <div style={{ marginBottom: '12px' }}>
              <StoryCard story={featured} featured />
            </div>
          )}

          {/* Rest grid */}
          {rest.length > 0 && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '12px',
                marginBottom: '12px',
              }}
            >
              {rest.map((story, i) => (
                <StoryCard key={story.id} story={story} />
              ))}

              {/* CTA インタースティシャル */}
              <div
                className="brutalist-card"
                style={{
                  background: '#fdfdfd',
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: '260px',
                }}
              >
                <p
                  style={{
                    fontFamily: 'Inter,sans-serif',
                    fontSize: '9px',
                    letterSpacing: '0.25em',
                    opacity: 0.3,
                    textTransform: 'uppercase',
                    marginBottom: '1rem',
                  }}
                >
                  Your Info
                </p>
                <div>
                  <p
                    style={{
                      fontFamily: "'Shippori Mincho',serif",
                      fontSize: '1.1rem',
                      lineHeight: 1.6,
                      letterSpacing: '0.04em',
                      marginBottom: '1.5rem',
                      fontFeatureSettings: "'palt'",
                    }}
                  >
                    「そういえば<br />あのお店が…」<br />
                    その情報、ください。
                  </p>
                  <a
                    href="/submit"
                    className="brutalist-btn"
                    style={{
                      display: 'inline-block',
                      padding: '0.5rem 1.25rem',
                      fontFamily: 'Inter,sans-serif',
                      fontSize: '0.75rem',
                      letterSpacing: '0.08em',
                    }}
                  >
                    情報を投稿する ＋
                  </a>
                </div>
              </div>

              {/* Coming Soon */}
              <div
                style={{
                  border: '1.5px dashed rgba(0,0,0,0.15)',
                  padding: '1.5rem',
                  minHeight: '260px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  background: 'transparent',
                }}
              >
                <p
                  style={{
                    fontFamily: 'Inter,sans-serif',
                    fontSize: '9px',
                    letterSpacing: '0.25em',
                    opacity: 0.2,
                    textTransform: 'uppercase',
                    marginBottom: '0.75rem',
                  }}
                >
                  Coming Soon
                </p>
                <p
                  style={{
                    fontFamily: "'Shippori Mincho',serif",
                    fontSize: '1.1rem',
                    lineHeight: 1.6,
                    letterSpacing: '0.04em',
                    opacity: 0.2,
                    fontFeatureSettings: "'palt'",
                  }}
                >
                  函館のコンビニ密度は<br />異常なのか、調べた。
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
