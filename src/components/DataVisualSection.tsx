import { motion, useInView, useSpring, useTransform } from 'motion/react';
import { useRef, useEffect, useState } from 'react';

const data = [
  { year: '2000', population: 100, label: '100%' },
  { year: '2005', population: 97,  label: '97%' },
  { year: '2010', population: 93,  label: '93%' },
  { year: '2015', population: 88,  label: '88%' },
  { year: '2020', population: 82,  label: '82%' },
  { year: '2025', population: 76,  label: '76%' },
];

function AnimatedBar({ value, delay, year, label }: { value: number; delay: number; year: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-10% 0px' });

  return (
    <div ref={ref} className="flex flex-col items-center gap-3">
      <span className="text-xs font-sans opacity-50 tracking-widest">{label}</span>
      <div className="relative w-full bg-white/10 rounded-sm overflow-hidden" style={{ height: '180px' }}>
        <motion.div
          className="absolute bottom-0 w-full bg-white rounded-sm"
          initial={{ height: 0 }}
          animate={inView ? { height: `${value}%` } : { height: 0 }}
          transition={{ duration: 1.2, delay, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
      <span className="text-xs font-sans opacity-40 tracking-widest">{year}</span>
    </div>
  );
}

function CountUp({ target, suffix = '' }: { target: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 1500;
    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView, target]);

  return <span ref={ref}>{count}{suffix}</span>;
}

export default function DataVisualSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: '-20% 0px' });

  return (
    <section
      ref={sectionRef}
      className="py-32 md:py-48 px-6 md:px-10 bg-spicato-black text-white"
    >
      <div className="max-w-6xl mx-auto">

        {/* ヘッダー */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="mb-20 md:mb-28"
        >
          <span className="text-xs font-sans tracking-[0.3em] opacity-40 uppercase block mb-6">
            Data Report / 若者流出
          </span>
          <h2 className="text-[clamp(2rem,6vw,5rem)] font-serif leading-tight tracking-widest [font-feature-settings:'palt'] mb-8">
            函館から若者が<br />消えていく。
          </h2>
          <p className="font-sans text-sm md:text-base opacity-50 leading-loose max-w-xl">
            2000年を基準に、函館市の20代人口は25年で約24%減少した。
            この数字が意味することを、私たちは直視しなければならない。
          </p>
        </motion.div>

        {/* KPI */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-3 gap-8 mb-24 border-t border-white/10 pt-12"
        >
          {[
            { value: 24, suffix: '%', label: '20代人口の減少率（2000→2025）' },
            { value: 3200, suffix: '人', label: '年間の転出超過数（推計）' },
            { value: 11, suffix: '万人', label: '2040年の予測人口' },
          ].map((stat, i) => (
            <div key={i} className="flex flex-col gap-2">
              <span className="text-3xl md:text-5xl font-serif font-light">
                <CountUp target={stat.value} suffix={stat.suffix} />
              </span>
              <span className="text-[10px] md:text-xs font-sans opacity-40 leading-relaxed tracking-wide">
                {stat.label}
              </span>
            </div>
          ))}
        </motion.div>

        {/* バーチャート */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <p className="text-xs font-sans opacity-30 tracking-widest mb-8 uppercase">
            20代人口指数（2000年=100%）
          </p>
          <div className="grid grid-cols-6 gap-3 md:gap-6">
            {data.map((d, i) => (
              <AnimatedBar
                key={d.year}
                value={d.population}
                delay={0.5 + i * 0.1}
                year={d.year}
                label={d.label}
              />
            ))}
          </div>
        </motion.div>

        {/* フッターメッセージ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="mt-24 border-t border-white/10 pt-12 flex flex-col md:flex-row justify-between items-start gap-6"
        >
          <p className="font-serif text-xl md:text-2xl tracking-widest [font-feature-settings:'palt']">
            だから、カッテニ調べる。
          </p>
          <a
            href="/articles"
            className="text-xs font-sans tracking-[0.2em] opacity-60 hover:opacity-100 transition-opacity uppercase border-b border-white/30 pb-1"
          >
            調査記事を読む →
          </a>
        </motion.div>
      </div>
    </section>
  );
}
