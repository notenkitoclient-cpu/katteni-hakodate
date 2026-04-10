/**
 * Step — スクローリテリングの各テキストブロック
 *
 * - data-step 属性でIntersection Observerが検知
 * - pointer-events-auto でリンク等のインタラクションを復活
 * - 画面の下半分に配置するためにpadding-topで押し下げ
 */

import type { ReactNode } from 'react';

interface StepProps {
  index: number;
  children: ReactNode;
  /** テキストボックスの背景スタイル（デフォルト: 半透明黒） */
  theme?: 'dark' | 'light' | 'ghost';
}

const THEME_STYLES = {
  dark:  'bg-black/80 text-white border-white/10',
  light: 'bg-white/90 text-gray-900 border-black/10',
  ghost: 'bg-transparent text-white border-transparent',
};

export default function Step({ index, children, theme = 'dark' }: StepProps) {
  return (
    <div
      data-step={index}
      className="min-h-screen flex items-center px-6 md:px-12 pointer-events-auto"
      style={{ paddingTop: index === 0 ? '20vh' : 0 }}
    >
      <div
        className={`
          max-w-sm md:max-w-md w-full ml-auto mr-0 md:mr-12
          border backdrop-blur-sm rounded-none p-8 md:p-10
          ${THEME_STYLES[theme]}
        `}
      >
        {children}
      </div>
    </div>
  );
}
