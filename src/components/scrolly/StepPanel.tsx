/**
 * StepPanel — スクローリテリングのテキストパネル
 *
 * ScrollyLayout が各ステップに自動的に配置する。
 * panelTheme で背景・テキスト色をエッセイごとにカスタマイズ可能。
 */

export interface StepData {
  chapter: string;
  title: string;
  body: string;
  stat?: {
    label: string;
    value: string;
    unit?: string;
    color: string;
  } | null;
}

export interface PanelTheme {
  bg?: string;
  border?: string;
  titleColor?: string;
  bodyColor?: string;
  chapterColor?: string;
}

export const PANEL_DARK: PanelTheme = {
  bg: 'rgba(0,0,0,0.82)',
  border: '1px solid rgba(255,255,255,0.08)',
  titleColor: 'white',
  bodyColor: 'rgba(255,255,255,0.7)',
  chapterColor: 'rgba(255,255,255,0.35)',
};

export const PANEL_AMBER: PanelTheme = {
  bg: 'rgba(245,230,200,0.93)',
  border: '1px solid rgba(0,0,0,0.08)',
  titleColor: '#1a0e00',
  bodyColor: 'rgba(26,14,0,0.65)',
  chapterColor: 'rgba(26,14,0,0.35)',
};

interface Props extends StepData {
  theme?: PanelTheme;
}

export default function StepPanel({
  chapter,
  title,
  body,
  stat,
  theme = PANEL_DARK,
}: Props) {
  const { bg, border, titleColor, bodyColor, chapterColor } = theme;

  return (
    <div
      style={{
        maxWidth: '26rem',
        width: '100%',
        padding: '2rem 2.5rem',
        background: bg,
        border,
        backdropFilter: 'blur(8px)',
      }}
    >
      <p
        style={{
          fontFamily: 'Inter,sans-serif',
          fontSize: '10px',
          letterSpacing: '.2em',
          color: chapterColor,
          textTransform: 'uppercase',
          marginBottom: '1rem',
        }}
      >
        {chapter}
      </p>

      <h2
        style={{
          fontFamily: "'Shippori Mincho',serif",
          fontSize: '1.4rem',
          lineHeight: 1.6,
          letterSpacing: '.04em',
          marginBottom: '1rem',
          fontFeatureSettings: "'palt'",
          color: titleColor,
          whiteSpace: 'pre-line',
        }}
      >
        {title}
      </h2>

      <p
        style={{
          fontFamily: 'Inter,sans-serif',
          fontSize: '.8rem',
          lineHeight: 1.9,
          color: bodyColor,
        }}
      >
        {body}
      </p>

      {stat && (
        <div
          style={{
            marginTop: '1rem',
            padding: '.75rem',
            border: `1px solid ${stat.color}44`,
            background: `${stat.color}0d`,
          }}
        >
          <p
            style={{
              fontFamily: 'Inter,sans-serif',
              fontSize: '10px',
              color: chapterColor,
              marginBottom: '.25rem',
            }}
          >
            {stat.label}
          </p>
          <p
            style={{
              fontFamily: "'Shippori Mincho',serif",
              fontSize: '2rem',
              color: stat.color,
            }}
          >
            {stat.value}
            {stat.unit && (
              <span style={{ fontSize: '1rem', marginLeft: '4px', opacity: 0.6 }}>
                {stat.unit}
              </span>
            )}
          </p>
        </div>
      )}
    </div>
  );
}
