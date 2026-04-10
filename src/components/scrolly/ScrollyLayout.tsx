/**
 * ScrollyLayout — The Pudding式 sticky 2カラムレイアウト
 *
 * 使い方:
 *   const { currentStep, stepsRef } = useScrollama(STEPS.length);
 *   return (
 *     <ScrollyLayout
 *       stepsRef={stepsRef}
 *       steps={STEPS}
 *       visual={<MyChart activeStep={currentStep} />}
 *       bg="#040e1e"
 *     />
 *   );
 *
 * 新しいエッセイは STEPS 配列と visual コンポーネントを差し替えるだけ。
 */

import type { RefObject } from 'react';
import StepPanel, { type StepData, type PanelTheme, PANEL_DARK } from './StepPanel';

interface Props {
  stepsRef: RefObject<HTMLDivElement | null>;
  steps: StepData[];
  visual: React.ReactNode;
  /** スティッキービジュアルの背景色 */
  bg?: string;
  /** テキストパネルの位置 */
  panelSide?: 'left' | 'right';
  /** テキストパネルのテーマ */
  panelTheme?: PanelTheme;
}

export default function ScrollyLayout({
  stepsRef,
  steps,
  visual,
  bg = '#040e1e',
  panelSide = 'right',
  panelTheme = PANEL_DARK,
}: Props) {
  return (
    <div>
      {/* Sticky ビジュアル */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          height: '100vh',
          width: '100%',
          overflow: 'hidden',
          background: bg,
        }}
      >
        {visual}
      </div>

      {/* スクロールテキスト（-100vh オーバーレイ） */}
      <div
        ref={stepsRef}
        style={{ marginTop: '-100vh', position: 'relative', pointerEvents: 'none' }}
      >
        {steps.map((step, i) => (
          <div
            key={i}
            data-step={i}
            style={{
              minHeight: '100vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: panelSide === 'right' ? 'flex-end' : 'flex-start',
              padding: i === 0 ? '20vh 1.5rem 0' : '0 1.5rem',
              pointerEvents: 'auto',
            }}
          >
            <StepPanel {...step} theme={panelTheme} />
          </div>
        ))}
      </div>
    </div>
  );
}
