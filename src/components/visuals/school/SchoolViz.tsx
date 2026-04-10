/**
 * SchoolViz — 函館市立小学校生徒数・統廃合ビジュアル
 * 「灯りが消えていく」世界観
 */
import { motion, AnimatePresence } from 'motion/react';

// 函館市内の小学校（架空座標 + 実態近似データ）
const SCHOOLS = [
  { id:  1, name: '港小学校',   x: 220, y: 140, pupils2000: 480, pupils2025: 92,  closed: false },
  { id:  2, name: '元町小学校', x: 180, y: 190, pupils2000: 620, pupils2025: 0,   closed: true,  closedYear: 2018 },
  { id:  3, name: '末広小学校', x: 260, y: 170, pupils2000: 540, pupils2025: 78,  closed: false },
  { id:  4, name: '大森小学校', x: 320, y: 200, pupils2000: 810, pupils2025: 143, closed: false },
  { id:  5, name: '亀田小学校', x: 380, y: 260, pupils2000: 920, pupils2025: 210, closed: false },
  { id:  6, name: '湯川小学校', x: 440, y: 220, pupils2000: 760, pupils2025: 168, closed: false },
  { id:  7, name: '石川小学校', x: 300, y: 300, pupils2000: 590, pupils2025: 0,   closed: true,  closedYear: 2021 },
  { id:  8, name: '桔梗小学校', x: 360, y: 340, pupils2000: 430, pupils2025: 84,  closed: false },
  { id:  9, name: '昭和小学校', x: 240, y: 280, pupils2000: 680, pupils2025: 0,   closed: true,  closedYear: 2015 },
  { id: 10, name: '美原小学校', x: 420, y: 300, pupils2000: 510, pupils2025: 97,  closed: false },
  { id: 11, name: '青柳小学校', x: 200, y: 350, pupils2000: 360, pupils2025: 0,   closed: true,  closedYear: 2019 },
  { id: 12, name: '旭岡小学校', x: 480, y: 260, pupils2000: 290, pupils2025: 52,  closed: false },
];

const STEPS_DATA = [
  { year: 2000, label: '2000年', showClosed: false },
  { year: 2010, label: '2010年', showClosed: false },
  { year: 2020, label: '2020年', showClosed: true  },
  { year: 2025, label: '現在',   showClosed: true  },
];

interface Props { currentStep: number }

export default function SchoolViz({ currentStep }: Props) {
  const step = STEPS_DATA[Math.min(currentStep, STEPS_DATA.length - 1)];
  const totalPupils2000 = SCHOOLS.reduce((s, sc) => s + sc.pupils2000, 0);
  const totalPupils2025 = SCHOOLS.filter(sc => !sc.closed).reduce((s, sc) => s + sc.pupils2025, 0);

  // ステップごとの表示生徒数（線形補間）
  const ratio = [1, 0.72, 0.45, 0.36][Math.min(currentStep, 3)];
  const displayTotal = Math.round(totalPupils2000 * ratio);

  return (
    <div
      className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #1a0e00 0%, #2a1a08 50%, #1a1000 100%)' }}
    >
      {/* 和紙テクスチャ風オーバーレイ */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\'/%3E%3C/filter%3E%3Crect width=\'60\' height=\'60\' filter=\'url(%23n)\' opacity=\'1\'/%3E%3C/svg%3E")',
        }}
      />

      <div className="relative z-10 w-full h-full flex flex-col md:flex-row items-center gap-8 px-8 py-12">

        {/* 左: 函館市マップ（学校ドット） */}
        <div className="flex-1 relative">
          <p className="font-sans text-[10px] text-amber-200/40 tracking-[0.2em] uppercase mb-4">
            函館市内 小学校マップ
          </p>
          <svg viewBox="120 100 420 320" className="w-full" style={{ maxHeight: '50vh' }}>
            {/* 市境界線（簡略） */}
            <path
              d="M130,160 C160,130 220,120 280,130 C340,140 400,150 460,170 C500,185 530,210 520,250 C510,290 480,330 440,350 C400,370 350,380 300,375 C250,370 200,360 165,340 C135,320 125,290 130,260 C135,230 125,190 130,160 Z"
              fill="none" stroke="rgba(251,191,36,0.15)" strokeWidth="1.5"
            />

            {/* 海 */}
            <path
              d="M130,160 C110,180 100,220 110,260 C120,300 140,330 165,340"
              fill="none" stroke="rgba(100,160,220,0.2)" strokeWidth="2"
            />
            <text x="118" y="260" fill="rgba(100,160,220,0.3)" fontSize="8"
              fontFamily="serif" transform="rotate(-30 118 260)">津軽海峡</text>

            {/* 学校ドット */}
            {SCHOOLS.map(school => {
              const isClosed = step.showClosed && school.closed;
              const size = isClosed ? 4 : Math.max(4, Math.sqrt(school.pupils2000) * 0.4);

              return (
                <motion.g key={school.id}>
                  {isClosed ? (
                    /* 廃校: バツ印 */
                    <motion.g
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: school.id * 0.05 }}
                    >
                      <line
                        x1={school.x - 5} y1={school.y - 5}
                        x2={school.x + 5} y2={school.y + 5}
                        stroke="rgba(239,68,68,0.6)" strokeWidth="1.5"
                      />
                      <line
                        x1={school.x + 5} y1={school.y - 5}
                        x2={school.x - 5} y2={school.y + 5}
                        stroke="rgba(239,68,68,0.6)" strokeWidth="1.5"
                      />
                      <text x={school.x + 8} y={school.y + 3}
                        fill="rgba(239,68,68,0.4)" fontSize="7" fontFamily="serif">
                        {school.closedYear}廃校
                      </text>
                    </motion.g>
                  ) : (
                    /* 現役: 光るドット */
                    <motion.circle
                      cx={school.x} cy={school.y} r={size}
                      fill="rgba(251,191,36,0.7)"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.5, delay: school.id * 0.04 }}
                    >
                      <animate
                        attributeName="r"
                        values={`${size};${size * 1.3};${size}`}
                        dur="3s"
                        begin={`${school.id * 0.2}s`}
                        repeatCount="indefinite"
                      />
                    </motion.circle>
                  )}
                </motion.g>
              );
            })}
          </svg>

          <div className="flex items-center gap-4 mt-2 text-[9px] font-sans text-amber-200/40">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-amber-400/70" />
              <span>現役校（規模比）</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-red-400">×</span>
              <span>廃校</span>
            </div>
          </div>
        </div>

        {/* 右: 統計 */}
        <div className="flex-1 flex flex-col gap-8">

          {/* 大きな数字 */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.6 }}
            >
              <p className="font-sans text-[10px] text-amber-200/40 tracking-widest uppercase mb-1">
                {step.label} 小学生の数
              </p>
              <p className="font-serif text-5xl md:text-6xl text-amber-100 font-light">
                {displayTotal.toLocaleString('ja-JP')}
                <span className="text-lg ml-1 opacity-60">人</span>
              </p>
              <p className="font-sans text-xs text-amber-200/40 mt-1">
                2000年比 {Math.round(ratio * 100)}%
              </p>
            </motion.div>
          </AnimatePresence>

          {/* バー比較 */}
          <div className="space-y-4">
            <p className="font-sans text-[10px] text-amber-200/30 tracking-widest uppercase">
              規模別 生徒数推移
            </p>
            {SCHOOLS.filter(sc => !sc.closed || step.showClosed).slice(0, 6).map(sc => {
              const val = step.showClosed && sc.closed ? 0 : sc.pupils2025;
              const max = 920;
              return (
                <div key={sc.id} className="flex items-center gap-3">
                  <span className="font-sans text-[9px] text-amber-200/40 w-20 shrink-0 text-right">
                    {sc.name}
                  </span>
                  <div className="flex-1 h-2 bg-white/5 rounded-none overflow-hidden">
                    <motion.div
                      className="h-full rounded-none"
                      style={{
                        background: sc.closed
                          ? 'rgba(239,68,68,0.4)'
                          : 'rgba(251,191,36,0.6)',
                      }}
                      initial={{ width: `${(sc.pupils2000 / max) * 100}%` }}
                      animate={{ width: `${(val / max) * 100}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                    />
                  </div>
                  <span className="font-sans text-[9px] text-amber-200/40 w-10">
                    {sc.closed ? '廃校' : `${val}人`}
                  </span>
                </div>
              );
            })}
          </div>

          {/* 廃校カウント */}
          {step.showClosed && (
            <motion.div
              className="border border-red-500/20 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <p className="font-sans text-[10px] text-red-400/60 tracking-widest uppercase mb-1">
                廃校数
              </p>
              <p className="font-serif text-3xl text-red-400">
                {SCHOOLS.filter(sc => sc.closed).length}
                <span className="text-sm ml-1 opacity-60">校</span>
              </p>
              <p className="font-sans text-[9px] text-red-400/40 mt-1">
                2015年〜2021年に統廃合
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
