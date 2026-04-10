/**
 * SquidViz — イカ漁獲エッセイのメインビジュアル
 * currentStep によって完全に異なる表示に切り替わる
 */
import { motion, AnimatePresence } from 'motion/react';
import OceanWave from './OceanWave';
import CatchChart from './CatchChart';

// ステップごとのシーン定義
const SCENES = [
  {
    depth: 0,
    title: '函館はイカの街だった',
    subtitle: null,
    showChart: false,
    showForecast: false,
    highlightYear: undefined,
    squidCount: 12,
    squidOpacity: 1,
  },
  {
    depth: 0,
    title: '1985年、\n漁獲量ピーク',
    subtitle: '函館港の水揚げ量\n約9.7万トン',
    showChart: true,
    showForecast: false,
    highlightYear: 1985,
    squidCount: 10,
    squidOpacity: 0.9,
  },
  {
    depth: 1,
    title: '転落の始まり',
    subtitle: '2000年代に入り\n半減以下へ',
    showChart: true,
    showForecast: false,
    highlightYear: 2005,
    squidCount: 5,
    squidOpacity: 0.6,
  },
  {
    depth: 2,
    title: '2020年代、\n崩壊',
    subtitle: 'ピーク比 -93%\nわずか7,200トン',
    showChart: true,
    showForecast: false,
    highlightYear: 2020,
    squidCount: 2,
    squidOpacity: 0.3,
  },
  {
    depth: 3,
    title: 'このまま続けば——',
    subtitle: '2035年、函館の\nイカ漁は終わる',
    showChart: true,
    showForecast: true,
    highlightYear: 2035,
    squidCount: 0,
    squidOpacity: 0,
  },
];

// シンプルなイカSVG
function Squid({ x, y, size = 1, opacity = 1, delay = 0 }: {
  x: number; y: number; size?: number; opacity?: number; delay?: number;
}) {
  return (
    <motion.g
      style={{ originX: `${x}px`, originY: `${y}px` }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity, scale: size }}
      exit={{ opacity: 0, scale: 0 }}
      transition={{ duration: 0.8, delay }}
    >
      {/* 胴体 */}
      <ellipse cx={x} cy={y} rx={18} ry={28} fill="rgba(160,220,255,0.6)" />
      {/* 頭部フィン */}
      <polygon
        points={`${x},${y - 28} ${x - 10},${y - 18} ${x + 10},${y - 18}`}
        fill="rgba(120,190,240,0.7)"
      />
      {/* 触手 */}
      {[-3, -1, 1, 3, 5, -5].map((offset, i) => (
        <line
          key={i}
          x1={x + offset * 2.5} y1={y + 28}
          x2={x + offset * 4} y2={y + 50}
          stroke="rgba(160,220,255,0.5)" strokeWidth="1.5"
          strokeLinecap="round"
        />
      ))}
      {/* 目 */}
      <circle cx={x - 6} cy={y - 4} r={3} fill="rgba(0,0,0,0.6)" />
      <circle cx={x + 6} cy={y - 4} r={3} fill="rgba(0,0,0,0.6)" />
      {/* 浮遊アニメ */}
      <animateTransform
        attributeName="transform"
        type="translate"
        values={`0,0; 0,${-8 - delay * 3}; 0,0`}
        dur={`${3 + delay}s`}
        repeatCount="indefinite"
      />
    </motion.g>
  );
}

export default function SquidViz({ currentStep }: { currentStep: number }) {
  const scene = SCENES[Math.min(currentStep, SCENES.length - 1)];

  // イカの配置（左側上部に散らばる）
  const squidPositions = [
    { x: 180, y: 200 }, { x: 280, y: 160 }, { x: 120, y: 300 },
    { x: 350, y: 240 }, { x: 200, y: 380 }, { x: 80,  y: 420 },
    { x: 300, y: 340 }, { x: 160, y: 460 }, { x: 250, y: 140 },
    { x: 400, y: 300 }, { x: 130, y: 200 }, { x: 320, y: 420 },
  ];

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      {/* 海背景 */}
      <OceanWave depth={scene.depth} />

      {/* メインコンテンツエリア */}
      <div className="relative z-10 w-full h-full flex flex-col md:flex-row">

        {/* 左: イカのSVGシーン */}
        <div className="flex-1 relative">
          <svg viewBox="0 0 500 600" className="w-full h-full" style={{ maxHeight: '60vh' }}>
            <AnimatePresence>
              {squidPositions.slice(0, scene.squidCount).map((pos, i) => (
                <Squid
                  key={i}
                  x={pos.x} y={pos.y}
                  size={0.6 + (i % 3) * 0.2}
                  opacity={scene.squidOpacity}
                  delay={i * 0.08}
                />
              ))}
            </AnimatePresence>

            {/* 深海警告テキスト */}
            {scene.depth >= 3 && (
              <motion.text
                x={250} y={300}
                textAnchor="middle"
                fill="rgba(255,100,100,0.6)"
                fontSize="14"
                fontFamily="Shippori Mincho, serif"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                イカの群れが——消えた。
              </motion.text>
            )}
          </svg>

          {/* タイトルオーバーレイ */}
          <div className="absolute bottom-8 left-8 right-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.5 }}
              >
                <p className="font-serif text-white text-2xl md:text-3xl leading-snug tracking-widest whitespace-pre-line"
                   style={{ fontFeatureSettings: "'palt'" }}>
                  {scene.title}
                </p>
                {scene.subtitle && (
                  <p className="font-sans text-cyan-300 text-sm mt-2 opacity-80 whitespace-pre-line">
                    {scene.subtitle}
                  </p>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* 右: チャート */}
        <AnimatePresence>
          {scene.showChart && (
            <motion.div
              className="flex-1 flex items-center justify-center px-6 pb-8 md:pb-0"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              transition={{ duration: 0.7 }}
            >
              <div className="w-full max-w-lg">
                <p className="font-sans text-[10px] text-white/40 tracking-[0.2em] uppercase mb-4">
                  函館港 スルメイカ水揚げ量 推移
                </p>
                <CatchChart
                  highlightYear={scene.highlightYear}
                  showForecast={scene.showForecast}
                />
                <p className="font-sans text-[9px] text-white/25 mt-3 tracking-wide">
                  ※ 架空データ（実態に基づく近似値）
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 深度インジケーター */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2">
        {['海面', '浅瀬', '深海', '深淵'].map((label, i) => (
          <div key={i} className="flex items-center gap-2">
            <div
              className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${
                i === scene.depth ? 'bg-cyan-400 scale-150' : 'bg-white/20'
              }`}
            />
            {i === scene.depth && (
              <span className="text-[9px] font-sans text-white/40">{label}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
