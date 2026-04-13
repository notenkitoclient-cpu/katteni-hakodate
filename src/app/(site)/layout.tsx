import Link from 'next/link';

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-accent selection:text-white">

      {/* Header */}
      <header className="bg-white border-b-2 border-black sticky top-0 z-50">
        <div className="popeye-container flex justify-between items-center py-4">
          <Link href="/" className="font-serif text-xl md:text-2xl font-black tracking-tighter uppercase whitespace-nowrap">
            Katteni<span className="text-accent">.</span>Hakodate
          </Link>
          <nav className="flex gap-3 sm:gap-6 md:gap-8 items-center text-[10px] sm:text-xs md:text-sm font-black tracking-widest">
            <Link href="/stores" className="shrink-0 hover:text-accent transition-colors border-b-2 border-transparent hover:border-black">まち図鑑</Link>
            <Link href="/news" className="shrink-0 hover:text-accent transition-colors border-b-2 border-transparent hover:border-black">ニュース</Link>
            <Link href="/submit" className="shrink-0 hover:text-accent transition-colors border-b-2 border-transparent hover:border-black">掲載する</Link>
            <Link href="/about" className="shrink-0 hover:text-accent transition-colors border-b-2 border-transparent hover:border-black">想い</Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 bg-white">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-black text-white pt-20 md:pt-32 pb-16">
        <div className="popeye-container">

          {/* Top grid: brand + nav */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 mb-12 md:mb-16">
            <div>
              <h2 className="font-serif text-4xl font-black mb-8 leading-none">
                KATTENI<br />HAKODATE.
              </h2>
              <p className="font-serif italic text-gray-400 text-lg max-w-sm">
                Everything you love about Hakodate, collected by those who love it most.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-8 text-sm font-bold tracking-widest">
              <div className="flex flex-col gap-4">
                <span className="text-gray-600 mb-2 uppercase">メイン</span>
                <Link href="/stores" className="hover:text-accent">函館まち図鑑</Link>
                <Link href="/news" className="hover:text-accent">街の呼吸（ニュース）</Link>
                <Link href="/submit" className="hover:text-accent">お店を掲載する</Link>
              </div>
              <div className="flex flex-col gap-4">
                <span className="text-gray-600 mb-2 uppercase">運営情報</span>
                <Link href="/about" className="hover:text-accent">このサイトについて</Link>
                <Link href="/terms" className="hover:text-accent">ガイドライン</Link>
              </div>
            </div>
          </div>

          {/* SNS Links */}
          <div className="border-t border-gray-800 pt-10 mb-10">
            <p className="font-mono text-[10px] text-gray-600 uppercase tracking-widest mb-6">Follow Us</p>
            <div className="flex flex-wrap gap-4">
              <a
                href="https://x.com/katteni_hako"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 border border-gray-700 px-5 py-3 text-xs font-bold tracking-widest hover:border-white hover:text-white transition-colors text-gray-400"
              >
                <svg width="14" height="14" viewBox="0 0 1200 1227" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M714.163 519.284L1160.89 0H1055.03L667.137 450.887L357.328 0H0L468.492 681.821L0 1226.37H105.866L515.491 750.218L842.672 1226.37H1200L714.163 519.284ZM569.165 687.828L521.697 619.934L144.011 79.6944H306.615L611.412 515.685L658.88 583.579L1055.08 1150.3H892.476L569.165 687.828Z"/>
                </svg>
                X (Twitter)
              </a>
              <a
                href="https://www.instagram.com/katteni_hakodate"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 border border-gray-700 px-5 py-3 text-xs font-bold tracking-widest hover:border-white hover:text-white transition-colors text-gray-400"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                Instagram
              </a>
              <a
                href="https://www.threads.com/@katteni_hakodate"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 border border-gray-700 px-5 py-3 text-xs font-bold tracking-widest hover:border-white hover:text-white transition-colors text-gray-400"
              >
                <svg width="14" height="14" viewBox="0 0 192 192" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M141.537 88.988a66.667 66.667 0 0 0-2.518-1.143c-1.482-27.307-16.403-42.94-41.457-43.1h-.34c-14.986 0-27.449 6.396-35.12 18.036l13.779 9.452c5.73-8.695 14.724-10.548 21.348-10.548h.229c8.249.053 14.474 2.452 18.503 7.129 2.932 3.405 4.893 8.111 5.864 14.05-7.314-1.243-15.224-1.626-23.68-1.14-23.82 1.371-39.134 15.264-38.105 34.568.522 9.792 5.4 18.216 13.735 23.719 7.047 4.652 16.124 6.927 25.557 6.412 12.458-.683 22.231-5.436 29.049-14.127 5.178-6.6 8.453-15.153 9.899-25.93 5.937 3.583 10.337 8.298 12.767 13.966 4.132 9.635 4.373 25.468-8.546 38.376-11.319 11.308-24.925 16.2-45.488 16.351-22.809-.169-40.06-7.484-51.275-21.741C35.236 139.966 29.808 120.682 29.605 96c.203-24.682 5.63-43.966 16.133-57.317C56.954 24.435 74.204 17.12 97.013 16.951c22.961.17 40.526 7.52 52.208 21.847 5.73 7.107 10.083 16.133 12.853 26.675l16.217-4.33c-3.422-12.913-8.878-24.212-16.214-33.54C147.439 9.657 125.53.2 97.07 0h-.113C68.685.2 46.957 9.686 32.777 28.24 20.165 44.843 13.799 67.984 13.602 96.09l-.002.183.002.183c.197 28.106 6.563 51.247 19.175 67.85C46.957 182.312 68.684 191.8 96.957 192h.113c24.514-.173 41.731-6.708 55.999-21.155 18.874-18.787 18.287-42.09 12.061-56.442-4.462-10.405-13.017-18.966-23.593-24.415Z"/>
                </svg>
                Threads
              </a>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="font-mono text-[10px] text-gray-500 uppercase tracking-widest">
              © {new Date().getFullYear()} Katteni Hakodate Project. Built for the city.
            </p>
            <div className="flex gap-6 text-[10px] font-bold uppercase tracking-widest text-gray-500">
              <Link href="/terms" className="hover:text-white">カッテニ楽しむためのお願い (Guidelines)</Link>
              <span>函館から愛を込めて (Made in Hakodate)</span>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}
