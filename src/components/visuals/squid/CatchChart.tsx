/**
 * CatchChart — スルメイカ漁獲高の推移グラフ（SVG）
 * データ: 函館港水揚げ量（架空データ・実態近似値）
 */
import { motion } from 'motion/react';

export const SQUID_DATA = [
  { year: 1980, catch: 82000 },
  { year: 1985, catch: 97000 },
  { year: 1990, catch: 91000 },
  { year: 1995, catch: 74000 },
  { year: 2000, catch: 58000 },
  { year: 2005, catch: 42000 },
  { year: 2010, catch: 31000 },
  { year: 2015, catch: 18000 },
  { year: 2020, catch:  7200 },
  { year: 2025, catch:  2800 },
  // 予測
  { year: 2030, catch:   900, forecast: true },
  { year: 2035, catch:   200, forecast: true },
];

interface Props {
  highlightYear?: number;
  showForecast?: boolean;
}

export default function CatchChart({ highlightYear, showForecast = false }: Props) {
  const W = 600, H = 300;
  const PL = 60, PR = 20, PT = 20, PB = 40;
  const data = showForecast ? SQUID_DATA : SQUID_DATA.filter(d => !d.forecast);

  const maxY = 100000;
  const minX = data[0].year;
  const maxX = showForecast ? 2035 : 2025;

  const toX = (year: number) => PL + ((year - minX) / (maxX - minX)) * (W - PL - PR);
  const toY = (val: number)  => PT + (1 - val / maxY) * (H - PT - PB);

  const points = data.map(d => `${toX(d.year)},${toY(d.catch)}`).join(' ');
  const realData  = data.filter(d => !d.forecast);
  const foreData  = data.filter(d => d.forecast);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-2xl" style={{ overflow: 'visible' }}>
      {/* グリッド */}
      {[0, 25000, 50000, 75000, 100000].map(v => (
        <g key={v}>
          <line
            x1={PL} y1={toY(v)} x2={W - PR} y2={toY(v)}
            stroke="rgba(255,255,255,0.1)" strokeWidth="1"
          />
          <text x={PL - 8} y={toY(v) + 4} textAnchor="end"
            fill="rgba(255,255,255,0.35)" fontSize="9" fontFamily="Inter,sans-serif">
            {v === 0 ? '0' : `${v / 10000}万t`}
          </text>
        </g>
      ))}

      {/* X軸ラベル */}
      {data.filter(d => d.year % 10 === 0).map(d => (
        <text key={d.year} x={toX(d.year)} y={H - PB + 16} textAnchor="middle"
          fill="rgba(255,255,255,0.4)" fontSize="9" fontFamily="Inter,sans-serif">
          {d.year}
        </text>
      ))}

      {/* 面グラフ（実データ） */}
      <motion.polygon
        points={`${PL},${H - PB} ${realData.map(d => `${toX(d.year)},${toY(d.catch)}`).join(' ')} ${toX(realData[realData.length - 1].year)},${H - PB}`}
        fill="url(#catchGradient)"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2 }}
      />

      {/* グラデーション定義 */}
      <defs>
        <linearGradient id="catchGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#00ccff" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#00ccff" stopOpacity="0.02" />
        </linearGradient>
        <linearGradient id="forecastGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ff6b6b" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#ff6b6b" stopOpacity="0.02" />
        </linearGradient>
      </defs>

      {/* 折れ線（実データ） */}
      <motion.polyline
        points={realData.map(d => `${toX(d.year)},${toY(d.catch)}`).join(' ')}
        fill="none" stroke="#00ccff" strokeWidth="2.5"
        strokeLinecap="round" strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 2, ease: 'easeOut' }}
      />

      {/* 折れ線（予測） */}
      {showForecast && foreData.length > 0 && (
        <>
          <motion.polygon
            points={`${toX(realData[realData.length-1].year)},${H-PB} ${toX(realData[realData.length-1].year)},${toY(realData[realData.length-1].catch)} ${foreData.map(d=>`${toX(d.year)},${toY(d.catch)}`).join(' ')} ${toX(foreData[foreData.length-1].year)},${H-PB}`}
            fill="url(#forecastGradient)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
          />
          <motion.polyline
            points={[realData[realData.length-1], ...foreData].map(d => `${toX(d.year)},${toY(d.catch)}`).join(' ')}
            fill="none" stroke="#ff6b6b" strokeWidth="2" strokeDasharray="6 4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
          />
          <text x={toX(2032)} y={toY(550)} fill="#ff6b6b" fontSize="9"
            fontFamily="Inter,sans-serif" opacity="0.8">
            予測
          </text>
        </>
      )}

      {/* ハイライトドット */}
      {highlightYear && (() => {
        const d = data.find(x => x.year === highlightYear);
        if (!d) return null;
        return (
          <motion.circle
            cx={toX(d.year)} cy={toY(d.catch)} r={6}
            fill={d.forecast ? '#ff6b6b' : '#00ccff'}
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300 }}
          />
        );
      })()}
    </svg>
  );
}
