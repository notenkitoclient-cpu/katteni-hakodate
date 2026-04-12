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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 mb-16 md:mb-20">
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
