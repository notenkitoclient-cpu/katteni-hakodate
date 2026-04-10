import { useEffect, useRef, useState } from 'react';
import scrollama from 'scrollama';

/**
 * useScrollama — Scrollamaをラップしたカスタムフック
 *
 * 使い方:
 *   const { currentStep, stepsRef } = useScrollama(STEPS.length);
 *
 *   stepsRef を scroll steps の親divに付ける。
 *   その直下の [data-step] 要素をScrollamaが自動監視する。
 */
export function useScrollama(stepCount: number, offset = 0.5) {
  const [currentStep, setCurrentStep] = useState(0);
  const stepsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = stepsRef.current;
    if (!container) return;

    const steps = container.querySelectorAll<HTMLElement>('[data-step]');
    if (!steps.length) return;

    const scroller = scrollama();

    scroller
      .setup({ step: steps, offset })
      .onStepEnter(({ index }: { index: number }) => setCurrentStep(index));

    const handleResize = () => scroller.resize();
    window.addEventListener('resize', handleResize);

    return () => {
      scroller.destroy();
      window.removeEventListener('resize', handleResize);
    };
  }, [offset]);

  return { currentStep, stepsRef };
}
