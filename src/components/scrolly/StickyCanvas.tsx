import React from 'react';
import { useScrolly } from './ScrollyContext';

interface Props {
  children: React.ReactElement<{ activeStep?: number }>;
  height?: string;
}

/**
 * StickyCanvas — sticky視覚エリア
 * 子コンポーネントに currentStep を activeStep として注入する
 */
export default function StickyCanvas({ children, height = '100vh' }: Props) {
  const { currentStep } = useScrolly();

  const child = React.cloneElement(children, { activeStep: currentStep });

  return (
    <div
      style={{
        position: 'sticky',
        top: 0,
        height,
        width: '100%',
        overflow: 'hidden',
        zIndex: 1,
      }}
    >
      {child}
    </div>
  );
}
