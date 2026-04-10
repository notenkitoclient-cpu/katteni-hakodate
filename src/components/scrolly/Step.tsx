/**
 * Step — スクローリテリングの1ステップ
 * ScrollContent の直接の子として使う。id prop でアンカーにもなる。
 * ScrollContent が data-step-index を自動付与する。
 */

import type { ReactNode } from 'react';

interface StepProps {
  id: string;
  children: ReactNode;
  theme?: 'dark' | 'light' | 'ghost';
  /** ScrollContent が自動付与 */
  'data-step-index'?: number;
}

const THEME_STYLES = {
  dark:  { background: 'rgba(0,0,0,0.82)', color: 'white', border: '1px solid rgba(255,255,255,0.08)' },
  light: { background: 'rgba(255,255,255,0.92)', color: '#111', border: '1px solid rgba(0,0,0,0.08)' },
  ghost: { background: 'transparent', color: 'white', border: '1px solid transparent' },
};

export default function Step({ id, children, theme = 'dark', ...rest }: StepProps) {
  const stepIndex = (rest as Record<string, unknown>)['data-step-index'] as number | undefined;

  return (
    <div
      id={id}
      data-step-index={stepIndex}
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        padding: '0 1.5rem',
        pointerEvents: 'auto',
      }}
    >
      <div
        style={{
          maxWidth: '26rem',
          width: '100%',
          marginLeft: 'auto',
          marginRight: 0,
          padding: '2rem 2.5rem',
          backdropFilter: 'blur(8px)',
          ...THEME_STYLES[theme],
        }}
      >
        {children}
      </div>
    </div>
  );
}
