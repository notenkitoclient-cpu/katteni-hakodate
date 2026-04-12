import { ImageResponse } from '@vercel/og';

export const runtime = 'edge';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const title = searchParams.get('title') || '函館まち図鑑';

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#fff',
            padding: '60px 80px',
            position: 'relative',
          }}
        >
          {/* 上部の装飾ライン（アクセント） */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '12px',
              backgroundColor: '#333',
            }}
          />

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              flex: 1,
              justifyContent: 'space-between',
            }}
          >
            {/* メインタイトルエリア */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                marginTop: '40px',
              }}
            >
              <div
                style={{
                  fontSize: 24,
                  color: '#666',
                  marginBottom: '16px',
                  letterSpacing: '0.1em',
                }}
              >
                函館の「いいもの」、みんなで勝手にPR。
              </div>
              <div
                style={{
                  fontSize: 72,
                  fontWeight: '900',
                  color: '#000',
                  textAlign: 'left',
                  lineHeight: 1.1,
                  wordBreak: 'break-all',
                }}
              >
                {title}
              </div>
            </div>

            {/* フッターエリア */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderTop: '1px solid #eee',
                paddingTop: '30px',
              }}
            >
              <div
                style={{
                  fontSize: 32,
                  fontWeight: 'bold',
                  color: '#000',
                  letterSpacing: '-0.02em',
                }}
              >
                函館まち図鑑
              </div>
              <div
                style={{
                  fontSize: 20,
                  color: '#888',
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  backgroundColor: '#f5f5f5',
                  padding: '8px 20px',
                  borderRadius: '30px',
                }}
              >
                Open & Free
              </div>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
