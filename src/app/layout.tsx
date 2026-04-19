import type { Metadata } from "next";
import "./globals.css";
import "leaflet/dist/leaflet.css";

export const metadata: Metadata = {
  metadataBase: new URL('https://kattenihakodate.com'),
  title: {
    default: '函館まち図鑑 | カッテニハコダテ',
    template: '%s | 函館まち図鑑',
  },
  description: '誰でも自由に使える、みんなで作る函館のオープンデータ図鑑。',
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    url: 'https://kattenihakodate.com',
    siteName: 'カッテニハコダテ',
    title: '函館まち図鑑 | カッテニハコダテ',
    description: '誰でも自由に使える、みんなで作る函館のオープンデータ図鑑。',
    images: [{ url: '/ogp.png', width: 1200, height: 630, alt: '函館まち図鑑 | カッテニハコダテ' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: '函館まち図鑑 | カッテニハコダテ',
    description: '誰でも自由に使える、みんなで作る函館のオープンデータ図鑑。',
    images: ['/ogp.png'],
  },
  alternates: {
    canonical: 'https://kattenihakodate.com',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700;900&family=Noto+Serif+JP:wght@700;900&family=Space+Mono:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
