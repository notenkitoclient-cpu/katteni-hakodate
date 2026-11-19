import type { ReactNode } from 'react';

export const metadata = {
  title: 'まちの情報を投稿',
  alternates: { canonical: '/submit' },
};

export default function SubmitLayout({ children }: { children: ReactNode }) {
  return children;
}
