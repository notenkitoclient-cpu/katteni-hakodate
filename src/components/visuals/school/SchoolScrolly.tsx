/**
 * SchoolScrolly — 小学校エッセイ用の自己完結スクローリテリングコンポーネント
 */
import { useEffect, useRef, useState } from 'react';
import SchoolViz from './SchoolViz';

const STEPS = [
  {
    chapter: 'Chapter 01',
    title: '2000年、函館の小学校',
    body: '2000年当時、函館市内には多くの小学校があり、合計で約6,000人の生徒が通っていた。放課後の校庭には子どもたちの声が溢れ、運動会は地域の一大イベントだった。',
    stat: null,
  },
  {
    chapter: 'Chapter 02',
    title: '2010年代、静かな変化',
    body: '少子化の影響は2010年代に顕著になった。一部の学校では1クラスの生徒が15人を下回り、異学年合同の授業が始まった。それでも「統廃合」は遠い話のように思われていた。',
    stat: null,
  },
  {
    chapter: 'Chapter 03',
    title: '廃校が続く',
    body: '2015年から2021年にかけて、函館市内で4校が廃校・統合となった。校舎は今、市民センターや倉庫として使われている。卒業生たちは「なくなると知ったとき、泣いた」と話す。',
    stat: { label: 'この期間の廃校数', value: '4', unit: '校', color: '#ef4444' },
  },
  {
    chapter: 'Chapter 04 / 現在',
    title: '2025年、残った学校の現実',
    body: '現在の生徒数は合計で約2,200人。2000年比で-64%。残る学校でも複式学級（異学年同一クラス）が増え、教育環境の変化が続く。全国平均の減少率40%に対し、函館は1.6倍のペースで減少している。',
    stat: { label: '2000年比生徒数', value: '-64%', unit: '', color: '#ef4444' },
  },
];

export default function SchoolScrolly() {
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

  return (
    <div>
      {/* Sticky ビジュアル */}
      <div className="sticky top-0 h-screen w-full overflow-hidden" style={{ background: '#1a0e00' }}>
        <SchoolViz currentStep={currentStep} />
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
              className="max-w-sm w-full ml-auto mr-0 md:mr-12 p-8 md:p-10"
              style={{ background: 'rgba(245,230,200,0.92)', border: '1px solid rgba(0,0,0,0.08)' }}
            >
              <p style={{ fontFamily: 'Inter,sans-serif', fontSize: '10px', letterSpacing: '.2em', opacity: .4, textTransform: 'uppercase', marginBottom: '1rem' }}>
                {s.chapter}
              </p>
              <h2 style={{ fontFamily: "'Shippori Mincho',serif", fontSize: '1.4rem', lineHeight: 1.6, letterSpacing: '.04em', marginBottom: '1rem', fontFeatureSettings: "'palt'" }}>
                {s.title}
              </h2>
              <p style={{ fontFamily: 'Inter,sans-serif', fontSize: '.8rem', lineHeight: 1.9, opacity: .7 }}>
                {s.body}
              </p>
              {s.stat && (
                <div style={{ marginTop: '1rem', padding: '.75rem', border: `1px solid ${s.stat.color}44`, background: `${s.stat.color}0d` }}>
                  <p style={{ fontFamily: 'Inter,sans-serif', fontSize: '10px', opacity: .5, marginBottom: '.25rem' }}>{s.stat.label}</p>
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
