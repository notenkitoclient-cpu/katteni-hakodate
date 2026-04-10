/** 波SVGアニメーション — イカエッセイの背景 */
export default function OceanWave({ depth = 0 }: { depth: number }) {
  // depth: 0=海面, 1=浅瀬, 2=深海, 3=深淵
  const colors = [
    ['#0a2a4a', '#0d4a8a'],  // 海面
    ['#071e36', '#0a3060'],  // 浅瀬
    ['#040e1e', '#071838'],  // 深海
    ['#020810', '#030e20'],  // 深淵
  ];
  const [bg1, bg2] = colors[Math.min(depth, colors.length - 1)];

  return (
    <svg
      viewBox="0 0 1440 900"
      xmlns="http://www.w3.org/2000/svg"
      className="absolute inset-0 w-full h-full"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id="oceanGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={bg1} />
          <stop offset="100%" stopColor={bg2} />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* 背景 */}
      <rect width="1440" height="900" fill="url(#oceanGrad)" />

      {/* 波レイヤー1 */}
      <path opacity="0.15" fill="#4a9eff">
        <animate
          attributeName="d"
          dur="8s"
          repeatCount="indefinite"
          values="
            M0,400 C360,350 720,450 1080,400 C1260,375 1380,390 1440,385 L1440,900 L0,900 Z;
            M0,415 C360,380 720,430 1080,415 C1260,405 1380,410 1440,400 L1440,900 L0,900 Z;
            M0,400 C360,350 720,450 1080,400 C1260,375 1380,390 1440,385 L1440,900 L0,900 Z
          "
        />
      </path>

      {/* 波レイヤー2 */}
      <path opacity="0.10" fill="#1a6aff">
        <animate
          attributeName="d"
          dur="11s"
          repeatCount="indefinite"
          values="
            M0,450 C400,410 800,490 1200,450 C1340,430 1400,445 1440,440 L1440,900 L0,900 Z;
            M0,435 C400,460 800,420 1200,460 C1340,470 1400,455 1440,450 L1440,900 L0,900 Z;
            M0,450 C400,410 800,490 1200,450 C1340,430 1400,445 1440,440 L1440,900 L0,900 Z
          "
        />
      </path>

      {/* 光のシャフト（深度によって表示変化） */}
      {depth < 2 && (
        <g opacity={depth === 0 ? 0.12 : 0.05}>
          {[200, 500, 900, 1200].map((x, i) => (
            <ellipse
              key={i}
              cx={x} cy={200} rx={30} ry={400}
              fill="#7ecfff"
              transform={`rotate(${-10 + i * 5} ${x} 0)`}
            >
              <animate
                attributeName="opacity"
                values="0.3;0.8;0.3"
                dur={`${4 + i}s`}
                repeatCount="indefinite"
              />
            </ellipse>
          ))}
        </g>
      )}

      {/* 深海の発光粒子 */}
      {depth >= 2 && (
        <g>
          {Array.from({ length: 20 }).map((_, i) => (
            <circle
              key={i}
              cx={72 * i + 40}
              cy={100 + (i * 37) % 700}
              r={2 + (i % 3)}
              fill="#00ffcc"
              filter="url(#glow)"
            >
              <animate
                attributeName="opacity"
                values="0;1;0"
                dur={`${2 + (i % 4)}s`}
                begin={`${i * 0.3}s`}
                repeatCount="indefinite"
              />
            </circle>
          ))}
        </g>
      )}
    </svg>
  );
}
