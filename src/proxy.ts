import { NextRequest, NextResponse } from 'next/server';

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 管理画面以外は全て通す（マッチャーが効かない場合の安全策）
  if (!pathname.startsWith('/admin')) return NextResponse.next();

  // ログインページ自体は通す
  if (pathname === '/admin/login') return NextResponse.next();

  const token    = req.cookies.get('admin_token')?.value;
  const password = process.env.ADMIN_PASSWORD;

  // ADMIN_PASSWORD 未設定の場合はアクセス拒否
  if (!password) {
    const url = req.nextUrl.clone();
    url.pathname = '/admin/login';
    return NextResponse.redirect(url);
  }

  const expected = Buffer.from(password).toString('base64');

  if (!token || token !== expected) {
    const url = req.nextUrl.clone();
    url.pathname = '/admin/login';
    url.searchParams.set('from', pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const proxyConfig = {
  matcher: ['/admin/:path*'],
};
