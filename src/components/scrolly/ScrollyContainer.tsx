/**
 * ScrollyContainer
 *
 * 2レイヤー構造:
 * - 左(or 背面): VisualCanvas — sticky固定、currentStepを受け取る
 * - 右(or 前面): ScrollSteps — テキストブロックが流れる
 *
 * Intersection Observerで「どのStepが今画面中央にいるか」を検知し
 * onStepChange コールバックで親に通知する。
 */

import { useEffect, useRef, useState, type ReactNode } from 'react';

interface ScrollyContainerProps {
  /** ビジュアル側に渡す現在のstepインデックス */
  children: ReactNode;
  /** 左側に表示するビジュアルコンポーネント（currentStepを受け取る） */
  visual: (currentStep: number) => ReactNode;
  /** ビジュアルの背景色 */
  visualBg?: string;
}

interface StepElement extends HTMLElement {
  dataset: DOMStringMap & { step: string };
}

export default function ScrollyContainer({
  children,
  visual,
  visualBg = '#111111',
}: ScrollyContainerProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const stepsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const steps = stepsRef.current?.querySelectorAll<StepElement>('[data-step]');
    if (!steps || steps.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const step = parseInt((entry.target as StepElement).dataset.step ?? '0', 10);
            setCurrentStep(step);
          }
        });
      },
      {
        rootMargin: '-40% 0px -40% 0px', // 画面中央40%帯でトリガー
        threshold: 0,
      }
    );

    steps.forEach((step) => observer.observe(step));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="relative">
      {/* ビジュアル(sticky) */}
      <div
        className="sticky top-0 h-screen w-full overflow-hidden"
        style={{ background: visualBg }}
      >
        {visual(currentStep)}
      </div>

      {/* テキストステップ(ビジュアルの上にオーバーレイ) */}
      <div
        ref={stepsRef}
        className="relative -mt-screen pointer-events-none"
        style={{ marginTop: '-100vh' }}
      >
        {children}
      </div>
    </div>
  );
}
