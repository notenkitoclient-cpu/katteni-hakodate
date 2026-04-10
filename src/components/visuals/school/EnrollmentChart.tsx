/**
 * EnrollmentChart — 小学校生徒数エッセイのSVGチャート
 * activeStep によって表示が切り替わる
 */
import { motion, AnimatePresence } from 'motion/react';

// 実際の統計に基づく近似値
const DATA = [
  { year: 2000, enrollment: 14800 },
  { year: 2003, enrollment: 13200 },
  { year: 2006, enrollment: 11400 },
  { year: 2009, enrollment: 9800 },
  { year: 2012, enrollment: 8200 },
  { year: 2015, enrollment: 7000 },
  { year: 2018, enrollment: 6100 },
  { year: 2021, enrollment: 5400 },
  { year: 2024, enrollment: 4900 },
];

const FORECAST = [
  { year: 2024, enrollment: 4900 },
  { year: 2027, enrollment: 4100 },
  { year: 2030, enrollment: 3400 },
  { year: 2033, enrollment: 2800 },
  { year: 2035, enrollment: 2400 },
];

// ステップごとの強調設定
const STEPS = [
  { highlightRange: null,       showForecast: false, label: '函館市内 小学校児童数の推移' },
  { highlightRange: [2000,2003], showForecast: false, label: '2000年代初頭：1.5万人超' },
  { highlightRange: [2009,2015], showForecast: false, label: '2010年代：急速に減少' },
  { highlightRange: [2021,2024], showForecast: true,  label: '現在：ピーク比 −67%' },
];

const W = 520, H = 300;
const MARGIN = { top: 20, right: 20, bottom: 40, left: 55 };
const INNER_W = W - MARGIN.left - MARGIN.right;
const INNER_H = H - MARGIN.top - MARGIN.bottom;

const allYears   = DATA.map(d => d.year);
const minYear = Math.min(...allYears);
const maxYear = 2035;
const maxVal  = 16000;
const minVal  = 0;

function scaleX(year: number) {
  return ((year - minYear) / (maxYear - minYear)) * INNER_W;
}
function scaleY(val: number) {
  return INNER_H - ((val - minVal) / (maxVal - minVal)) * INNER_H;
}

function toPolyline(points: { year: number; enrollment: number }[]) {
  return points.map(d => `${scaleX(d.year)},${scaleY(d.enrollment)}`).join(' ');
}

export default function EnrollmentChart({ activeStep = 0 }: { activeStep?: number }) {
  const scene = STEPS[Math.min(activeStep, STEPS.length - 1)];

  const yTicks = [0, 5000, 10000, 15000];
  const xTicks = [2000, 2010, 2020, 2030];

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#1a0e00', padding: '1.5rem' }}>
      {/* タイトル */}
      <AnimatePresence mode="wait">
        <motion.p
          key={activeStep}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.4 }}
          style={{ fontFamily: 'Inter,sans-serif', fontSize: '10px', letterSpacing: '.2em', opacity: .5, color: '#f5e6c8', textTransform: 'uppercase', marginBottom: '1rem' }}
        >
          {scene.label}
        </motion.p>
      </AnimatePresence>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: '480px', overflow: 'visible' }}>
        <g transform={`translate(${MARGIN.left},${MARGIN.top})`}>
          {/* グリッド線 */}
          {yTicks.map(v => (
            <line key={v} x1={0} y1={scaleY(v)} x2={INNER_W} y2={scaleY(v)} stroke="rgba(245,230,200,0.08)" strokeWidth={1} />
          ))}

          {/* Y軸ラベル */}
          {yTicks.map(v => (
            <text key={v} x={-8} y={scaleY(v) + 4} textAnchor="end" fill="rgba(245,230,200,0.4)" fontSize={10} fontFamily="Inter,sans-serif">
              {v === 0 ? '0' : `${v / 1000}k`}
            </text>
          ))}

          {/* X軸ラベル */}
          {xTicks.map(y => (
            <text key={y} x={scaleX(y)} y={INNER_H + 20} textAnchor="middle" fill="rgba(245,230,200,0.4)" fontSize={10} fontFamily="Inter,sans-serif">
              {y}
            </text>
          ))}

          {/* ハイライト範囲 */}
          <AnimatePresence>
            {scene.highlightRange && (
              <motion.rect
                key={`${scene.highlightRange[0]}-${scene.highlightRange[1]}`}
                x={scaleX(scene.highlightRange[0])}
                y={0}
                width={scaleX(scene.highlightRange[1]) - scaleX(scene.highlightRange[0])}
                height={INNER_H}
                fill="rgba(251,191,36,0.08)"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />
            )}
          </AnimatePresence>

          {/* 実績線 */}
          <motion.polyline
            points={toPolyline(DATA)}
            fill="none"
            stroke="#fbbf24"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            style={{ pathLength: undefined }}
          />

          {/* 予測線 */}
          <AnimatePresence>
            {scene.showForecast && (
              <motion.polyline
                key="forecast"
                points={toPolyline(FORECAST)}
                fill="none"
                stroke="#ef4444"
                strokeWidth={2}
                strokeDasharray="6 4"
                strokeLinecap="round"
                initial={{ opacity: 0, pathLength: 0 }}
                animate={{ opacity: 1, pathLength: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1, delay: 0.3 }}
                style={{ pathLength: undefined }}
              />
            )}
          </AnimatePresence>

          {/* データポイント */}
          {DATA.map((d, i) => {
            const isHighlighted = scene.highlightRange
              ? d.year >= scene.highlightRange[0] && d.year <= scene.highlightRange[1]
              : false;
            return (
              <motion.circle
                key={d.year}
                cx={scaleX(d.year)}
                cy={scaleY(d.enrollment)}
                r={isHighlighted ? 5 : 3}
                fill={isHighlighted ? '#fbbf24' : '#fbbf2466'}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.05 }}
              />
            );
          })}

          {/* 2035年 予測ポイント */}
          <AnimatePresence>
            {scene.showForecast && (
              <motion.g
                key="forecast-end"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 0.8 }}
              >
                <circle cx={scaleX(2035)} cy={scaleY(2400)} r={6} fill="#ef4444" opacity={0.7} />
                <text x={scaleX(2035) + 10} y={scaleY(2400) + 4} fill="#ef4444" fontSize={10} fontFamily="Shippori Mincho,serif">
                  2035年
                </text>
              </motion.g>
            )}
          </AnimatePresence>
        </g>
      </svg>

      <p style={{ fontFamily: 'Inter,sans-serif', fontSize: '9px', color: 'rgba(245,230,200,0.25)', marginTop: '.75rem', letterSpacing: '.05em' }}>
        ※ 架空データ（実態に基づく近似値） / 出典: 函館市教育委員会
      </p>
    </div>
  );
}
