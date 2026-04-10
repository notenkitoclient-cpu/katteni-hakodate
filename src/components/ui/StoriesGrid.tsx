/**
 * StoriesGrid — フィルター + Gallery View + スクロール時のStaggerアニメーション
 * client:load で使用する
 */
import { useState } from 'react';
import { motion } from 'motion/react';
import StoryCard, { type Story } from './StoryCard';

const FILTERS = [
  { label: 'すべて', value: 'all' },
  { label: '人口',   value: '人口' },
  { label: '漁業',   value: '漁業' },
  { label: '教育',   value: '教育' },
];

// スクロール時に時間差で浮き上がるアニメーション
const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] },
  },
};

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
            fontSize: '9px',
            letterSpacing: '0.28em',
            opacity: 0.22,
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
        <p style={{ fontFamily: 'Inter,sans-serif', fontSize: '0.8rem', opacity: 0.25, padding: '4rem 0', letterSpacing: '0.08em' }}>
          該当するエッセイはまだありません。
        </p>
      ) : (
        <div>
          {/* Featured — full-width、ふわっと浮き上がる */}
          {featured && (
            <motion.div
              className="mb-24"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
            >
              <StoryCard story={featured} featured />
            </motion.div>
          )}

          {/* Rest — 時間差で浮き上がるグリッド */}
          {rest.length > 0 && (
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-20"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
            >
              {rest.map(story => (
                <motion.div key={story.id} variants={itemVariants}>
                  <StoryCard story={story} />
                </motion.div>
              ))}

              {/* CTA — 静かなスタイル */}
              <motion.div variants={itemVariants}>
                <div
                  style={{
                    borderTop: '1px solid rgba(0,0,0,0.08)',
                    paddingTop: '1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: '180px',
                  }}
                >
                  <p
                    style={{
                      fontFamily: 'Inter,sans-serif',
                      fontSize: '8px',
                      letterSpacing: '0.28em',
                      opacity: 0.2,
                      textTransform: 'uppercase',
                      marginBottom: '1.25rem',
                    }}
                  >
                    Your Info
                  </p>
                  <div>
                    <p
                      style={{
                        fontFamily: "'Shippori Mincho',serif",
                        fontSize: '1rem',
                        lineHeight: 1.7,
                        letterSpacing: '0.06em',
                        marginBottom: '1.5rem',
                        fontFeatureSettings: "'palt'",
                        opacity: 0.45,
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
                        fontSize: '0.7rem',
                        letterSpacing: '0.14em',
                        opacity: 0.3,
                        borderBottom: '1px solid currentColor',
                        paddingBottom: '2px',
                        transition: 'opacity 0.25s',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.opacity = '0.7')}
                      onMouseLeave={e => (e.currentTarget.style.opacity = '0.3')}
                    >
                      情報を投稿する →
                    </a>
                  </div>
                </div>
              </motion.div>

              {/* Coming Soon */}
              <motion.div variants={itemVariants}>
                <div
                  style={{
                    borderTop: '1px dashed rgba(0,0,0,0.1)',
                    paddingTop: '1.25rem',
                    minHeight: '180px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                  }}
                >
                  <p
                    style={{
                      fontFamily: 'Inter,sans-serif',
                      fontSize: '8px',
                      letterSpacing: '0.28em',
                      opacity: 0.15,
                      textTransform: 'uppercase',
                      marginBottom: '0.75rem',
                    }}
                  >
                    Coming Soon
                  </p>
                  <p
                    style={{
                      fontFamily: "'Shippori Mincho',serif",
                      fontSize: '0.875rem',
                      lineHeight: 1.7,
                      letterSpacing: '0.12em',
                      opacity: 0.15,
                      fontFeatureSettings: "'palt'",
                    }}
                  >
                    函館のコンビニ密度は<br />異常なのか、調べた。
                  </p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}
