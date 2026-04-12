import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const title = searchParams.get('title') ?? 'カッテニハコダテ';
  const sub   = searchParams.get('sub')   ?? '函館まち図鑑 — OPEN & FREE';

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          background: '#0a0a0a',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '80px',
        }}
      >
        {/* アクセントライン */}
        <div style={{ display: 'flex', gap: '6px' }}>
          <div style={{ width: '40px', height: '4px', background: '#D94F3D' }} />
          <div style={{ width: '12px', height: '4px', background: '#D94F3D', opacity: 0.4 }} />
        </div>

        {/* メインテキスト */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div
            style={{
              fontSize: title.length > 20 ? '48px' : '60px',
              fontWeight: 900,
              color: '#FAFAF8',
              lineHeight: 1.2,
              letterSpacing: '-0.02em',
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontSize: '24px',
              color: '#666',
              letterSpacing: '0.05em',
            }}
          >
            {sub}
          </div>
        </div>

        {/* フッター */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div
            style={{
              fontSize: '28px',
              fontWeight: 900,
              color: '#FAFAF8',
              letterSpacing: '0.1em',
              display: 'flex',
            }}
          >
            KATTENI
            <span style={{ color: '#D94F3D' }}>.</span>
            HAKODATE
          </div>
          <div style={{ fontSize: '14px', color: '#444', letterSpacing: '0.15em' }}>
            kattenihakodate.com
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
