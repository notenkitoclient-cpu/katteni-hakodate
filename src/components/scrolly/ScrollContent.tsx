import { useEffect, useRef, Children, cloneElement, isValidElement } from 'react';
import { useScrolly } from './ScrollyContext';

interface Props {
  children: React.ReactNode;
}

/**
 * ScrollContent — スクロールテキストエリア
 * 子の Step コンポーネントを監視して currentStep を更新する
 */
export default function ScrollContent({ children }: Props) {
  const { setCurrentStep } = useScrolly();
  const containerRef = useRef<HTMLDivElement>(null);

  // 子に index を付与
  const steps = Children.map(children, (child, i) => {
    if (isValidElement(child)) {
      return cloneElement(child as React.ReactElement<{ 'data-step-index': number }>, {
        'data-step-index': i,
      });
    }
    return child;
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const els = container.querySelectorAll<HTMLElement>('[data-step-index]');
    if (!els.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const idx = parseInt((e.target as HTMLElement).dataset.stepIndex ?? '0', 10);
            setCurrentStep(idx);
          }
        });
      },
      { rootMargin: '-40% 0px -40% 0px' }
    );

    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [setCurrentStep]);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        zIndex: 2,
        marginTop: '-100vh',
        pointerEvents: 'none',
      }}
    >
      {steps}
    </div>
  );
}
