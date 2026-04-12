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
          {/* 上部のブランドライン */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '12px',
              backgroundColor: '#000',
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
            {/* メインエリア */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                marginTop: '40px',
              }}
            >
              <div
                style={{
                  fontSize: 26,
                  fontWeight: 'bold',
                  color: '#333',
                  marginBottom: '10px',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                カッテニハコダテ ｜ 函館まち図鑑
              </div>
              <div
                style={{
                  fontSize: 20,
                  color: '#888',
                  marginBottom: '30px',
                  letterSpacing: '0.05em',
                }}
              >
                勝手に函館で応援されるサイト・掲載も使用も全部無料
              </div>
              <div
                style={{
                  fontSize: 72,
                  fontWeight: '900',
                  color: '#000',
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
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <span style={{ fontSize: 24, fontWeight: '900', color: '#000' }}>
                  HAKODATE MACHI-ZUKAN
                </span>
              </div>
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 'bold',
                  color: '#fff',
                  backgroundColor: '#000',
                  padding: '6px 18px',
                  borderRadius: '4px',
                  letterSpacing: '0.1em',
                }}
              >
                OPEN DATA
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
