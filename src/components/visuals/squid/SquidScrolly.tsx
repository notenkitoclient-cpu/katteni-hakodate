/**
 * SquidScrolly — イカエッセイ用の自己完結スクローリテリングコンポーネント
 * Astroから client:load で呼び出す
 */
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import OceanWave from './OceanWave';
import CatchChart from './CatchChart';
import SquidViz from './SquidViz';

const STEPS = [
  {
    chapter: 'Chapter 01',
    title: '函館はイカの街だった',
    body: 'イカソーメン、イカ飯、塩辛——。函館の食文化はイカなしでは語れない。かつて函館港には、水揚げされたスルメイカが山積みになっていた。漁師たちの声と潮の匂いが、街の空気だった。',
    stat: null,
  },
  {
    chapter: 'Chapter 02',
    title: '1985年、絶頂期',
    body: '函館港の水揚げは1985年にピークを迎えた。年間約9.7万トン。これは現在の約35倍に相当する量だ。当時、函館はスルメイカ漁獲量で全国トップクラスを誇っていた。',
    stat: { label: '1985年水揚げ量', value: '97,000', unit: 'トン', color: '#00ccff' },
  },
  {
    chapter: 'Chapter 03',
    title: '転落の始まり',
    body: '1990年代から減少傾向が始まった。海水温の上昇、北方漁場への回遊ルート変化、そして乱獲——複合的な要因が重なった。2005年には早くも半減以下となった。それでも、漁師たちは「来年は戻る」と信じていた。',
    stat: null,
  },
  {
    chapter: 'Chapter 04',
    title: '2020年代、崩壊',
    body: '2020年の水揚げはわずか7,200トン。ピーク比で-93%。廃業する漁師が続出し、イカ専用の干し場は空っぽになった。函館朝市のイカ釣り体験も、多くの日は「獲れないので中止」になっている。',
    stat: { label: 'ピーク比減少率', value: '-93%', unit: '', color: '#ff6b6b' },
  },
  {
    chapter: 'Chapter 05 / Forecast',
    title: 'このまま続けば、\n2035年に函館のイカ漁は終わる。',
    body: '現在の減少トレンドが続いた場合、2035年の漁獲量は200トンを下回ると試算される。採算が取れる水準（推定3,000トン以上）を2028年頃に割り込む見通しだ。',
    stat: null,
  },
];

export default function SquidScrolly() {
  const [currentStep, setCurrentStep] = useState(0);
  const stepsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const els = stepsRef.current?.querySelectorAll<HTMLElement>('[data-step]');
    if (!els) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) setCurrentStep(parseInt((e.target as HTMLElement).dataset.step ?? '0', 10));
        });
      },
      { rootMargin: '-40% 0px -40% 0px' }
    );
    els.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const step = STEPS[Math.min(currentStep, STEPS.length - 1)];

  return (
    <div>
      {/* Sticky ビジュアル */}
      <div className="sticky top-0 h-screen w-full overflow-hidden" style={{ background: '#040e1e' }}>
        <SquidViz currentStep={currentStep} />
      </div>

      {/* スクロールするテキスト */}
      <div ref={stepsRef} style={{ marginTop: '-100vh', position: 'relative' }}>
        {STEPS.map((s, i) => (
          <div
            key={i}
            data-step={i}
            className="min-h-screen flex items-center px-6 md:px-12 pointer-events-auto"
            style={{ paddingTop: i === 0 ? '20vh' : 0 }}
          >
            <div
              className="max-w-sm w-full ml-auto mr-0 md:mr-12 p-8 md:p-10 backdrop-blur-sm"
              style={{ background: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <p style={{ fontFamily: 'Inter,sans-serif', fontSize: '10px', letterSpacing: '.2em', opacity: .4, textTransform: 'uppercase', marginBottom: '1rem', color: 'white' }}>
                {s.chapter}
              </p>
              <h2 style={{ fontFamily: "'Shippori Mincho',serif", fontSize: '1.4rem', lineHeight: 1.6, letterSpacing: '.04em', marginBottom: '1rem', fontFeatureSettings: "'palt'", color: 'white', whiteSpace: 'pre-line' }}>
                {s.title}
              </h2>
              <p style={{ fontFamily: 'Inter,sans-serif', fontSize: '.8rem', lineHeight: 1.9, opacity: .7, color: 'white' }}>
                {s.body}
              </p>
              {s.stat && (
                <div style={{ marginTop: '1rem', padding: '.75rem', border: `1px solid ${s.stat.color}33`, background: `${s.stat.color}0d` }}>
                  <p style={{ fontFamily: 'Inter,sans-serif', fontSize: '10px', opacity: .5, marginBottom: '.25rem', color: 'white' }}>{s.stat.label}</p>
                  <p style={{ fontFamily: "'Shippori Mincho',serif", fontSize: '2rem', color: s.stat.color }}>{s.stat.value}<span style={{ fontSize: '1rem', marginLeft: '4px', opacity: .6 }}>{s.stat.unit}</span></p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
