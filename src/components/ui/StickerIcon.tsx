/**
 * StickerIcon — カードの角に貼るスタンプ風デコレーション
 * .sticker-icon クラスで親カードのホバー時にscaleアニメーション
 * Star アイコンで五稜郭モチーフを忍ばせている
 */
import { Star } from 'lucide-react';

interface Props {
  text?: string;
  size?: number;
  color?: string;
}

export default function StickerIcon({ text = '勝手に', size = 56, color = '#0d0d0d' }: Props) {
  return (
    <div
      className="sticker-icon"
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        border: `1.5px solid ${color}`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '2px',
        flexShrink: 0,
      }}
    >
      <span
        style={{
          fontFamily: "'Shippori Mincho', serif",
          fontSize: size * 0.18,
          fontWeight: 700,
          letterSpacing: '0.05em',
          color,
          lineHeight: 1,
        }}
      >
        {text}
      </span>
      {/* 五稜郭モチーフ */}
      <Star
        size={size * 0.2}
        strokeWidth={1.5}
        color={color}
        style={{ opacity: 0.5 }}
      />
    </div>
  );
}
