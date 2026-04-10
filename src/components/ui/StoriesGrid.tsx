/**
 * StoriesGrid — フィルター + Gallery View グリッド
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
      <div className="flex flex-wrap gap-2 sm:gap-3 mb-16 items-center">
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
          {/* Featured (最初の1枚) — full-width */}
          {featured && (
            <div className="mb-20">
              <StoryCard story={featured} featured />
            </div>
          )}

          {/* Rest grid — wide gap, gallery feel */}
          {rest.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-16">
              {rest.map(story => (
                <StoryCard key={story.id} story={story} />
              ))}

              {/* CTA — 静かなスタイル */}
              <div
                style={{
                  borderTop: '1px solid rgba(0,0,0,0.1)',
                  paddingTop: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: '200px',
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
                      fontSize: '1.05rem',
                      lineHeight: 1.65,
                      letterSpacing: '0.04em',
                      marginBottom: '1.5rem',
                      fontFeatureSettings: "'palt'",
                      opacity: 0.6,
                    }}
                  >
                    「そういえば<br />あのお店が…」<br />
                    その情報、ください。
                  </p>
                  <a
                    href="/submit"
                    style={{
                      display: 'inline-block',
                      fontFamily: 'Inter,sans-serif',
                      fontSize: '0.75rem',
                      letterSpacing: '0.1em',
                      opacity: 0.4,
                      borderBottom: '1px solid currentColor',
                      paddingBottom: '2px',
                      transition: 'opacity 0.2s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = '0.8')}
                    onMouseLeave={e => (e.currentTarget.style.opacity = '0.4')}
                  >
                    情報を投稿する →
                  </a>
                </div>
              </div>

              {/* Coming Soon */}
              <div
                style={{
                  borderTop: '1px dashed rgba(0,0,0,0.12)',
                  paddingTop: '1.5rem',
                  minHeight: '200px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
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
                    fontSize: '1.05rem',
                    lineHeight: 1.65,
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
