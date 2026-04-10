/**
 * StoriesGrid — フィルター + Gallery View + スクロール Stagger
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

// 静寂な空間に、作品が静かに並べられていく演出
const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
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
      {/* ── Controls — テキストのみ、UIとしての存在感を最小に ── */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.25rem 2rem',
          alignItems: 'center',
          marginBottom: '5rem',
        }}
      >
        <span
          style={{
            fontFamily: 'Inter,sans-serif',
            fontSize: '8px',
            letterSpacing: '0.38em',
            opacity: 0.18,
            textTransform: 'uppercase',
            marginRight: '1rem',
          }}
        >
          Filter
        </span>
        {FILTERS.map(f => (
          <button
            key={f.value}
            onClick={() => setActive(f.value)}
            style={{
              fontFamily: 'Inter,sans-serif',
              fontSize: '0.75rem',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0.2rem 0',
              color: '#0d0d0d',
              opacity: active === f.value ? 0.9 : 0.25,
              borderBottom: active === f.value
                ? '1px solid rgba(13,13,13,0.6)'
                : '1px solid transparent',
              transition: 'opacity 0.25s, border-bottom-color 0.25s',
            }}
            onMouseEnter={e => {
              if (active !== f.value) e.currentTarget.style.opacity = '0.55';
            }}
            onMouseLeave={e => {
              if (active !== f.value) e.currentTarget.style.opacity = '0.25';
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* ── Grid ── */}
      {filtered.length === 0 ? (
        <p
          style={{
            fontFamily: 'Inter,sans-serif',
            fontSize: '0.75rem',
            opacity: 0.2,
            padding: '5rem 0',
            letterSpacing: '0.1em',
          }}
        >
          該当するエッセイはまだありません。
        </p>
      ) : (
        <div>
          {/* Featured — ゆっくりと、滑らかに浮き上がる */}
          {featured && (
            <motion.div
              style={{ marginBottom: '8rem' }}
              initial={{ opacity: 0, y: 36 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
            >
              <StoryCard story={featured} featured />
            </motion.div>
          )}

          {/* Rest — 静寂に時間差で作品が並ぶ */}
          {rest.length > 0 && (
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
              style={{ gap: 'clamp(3rem, 6vw, 7rem)' }}
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

              {/* CTA — 最小限の存在感 */}
              <motion.div variants={itemVariants}>
                <div
                  style={{
                    paddingTop: '1.75rem',
                    borderTop: '1px solid rgba(0,0,0,0.06)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: '200px',
                  }}
                >
                  <p
                    style={{
                      fontFamily: 'Inter,sans-serif',
                      fontSize: '8px',
                      letterSpacing: '0.32em',
                      opacity: 0.18,
                      textTransform: 'uppercase',
                      marginBottom: '1.5rem',
                    }}
                  >
                    Your Info
                  </p>
                  <div>
                    <p
                      style={{
                        fontFamily: "'Shippori Mincho',serif",
                        fontSize: '1rem',
                        lineHeight: 1.8,
                        letterSpacing: '0.07em',
                        marginBottom: '2rem',
                        fontFeatureSettings: "'palt'",
                        opacity: 0.4,
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
                        letterSpacing: '0.16em',
                        textTransform: 'uppercase',
                        opacity: 0.25,
                        borderBottom: '1px solid currentColor',
                        paddingBottom: '2px',
                        transition: 'opacity 0.3s',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.opacity = '0.65')}
                      onMouseLeave={e => (e.currentTarget.style.opacity = '0.25')}
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
                    paddingTop: '1.75rem',
                    borderTop: '1px dashed rgba(0,0,0,0.08)',
                    minHeight: '200px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                  }}
                >
                  <p
                    style={{
                      fontFamily: 'Inter,sans-serif',
                      fontSize: '8px',
                      letterSpacing: '0.32em',
                      opacity: 0.13,
                      textTransform: 'uppercase',
                      marginBottom: '1rem',
                    }}
                  >
                    Coming Soon
                  </p>
                  <p
                    style={{
                      fontFamily: "'Shippori Mincho',serif",
                      fontSize: '0.875rem',
                      lineHeight: 1.8,
                      letterSpacing: '0.14em',
                      opacity: 0.13,
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
