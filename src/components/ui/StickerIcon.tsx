/**
 * StickerIcon — カードの角に貼るスタンプ風デコレーション
 */
interface Props {
  text?: string;
  size?: number;
  rotate?: number;
  color?: string;
}

export default function StickerIcon({
  text = '勝手に',
  size = 56,
  rotate = -18,
  color = '#0d0d0d',
}: Props) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        border: `1.5px solid ${color}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transform: `rotate(${rotate}deg)`,
        flexShrink: 0,
      }}
    >
      <span
        style={{
          fontFamily: "'Shippori Mincho', serif",
          fontSize: size * 0.18,
          fontWeight: 700,
          letterSpacing: '0.08em',
          color,
          textAlign: 'center',
          lineHeight: 1.3,
        }}
      >
        {text}
      </span>
    </div>
  );
}
