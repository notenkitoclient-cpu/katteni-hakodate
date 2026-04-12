import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'このサイトについて',
  description: 'カッテニハコダテは、誰でも自由に使える函館まち図鑑です。技術と愛情で、函館の「今」を記録します。',
  openGraph: {
    title: 'このサイトについて | カッテニハコダテ',
    description: 'カッテニハコダテは、誰でも自由に使える函館まち図鑑です。技術と愛情で、函館の「今」を記録します。',
  },
};

export default function AboutPage() {
  return (
    <main className="bg-white min-h-screen">

      {/* ── マストヘッド ─────────────────────────────────── */}
      <section className="bg-background border-b-4 border-black">
        <div className="popeye-container py-16 md:py-28 px-4">
          <div className="max-w-3xl">
            <p className="font-mono text-[11px] tracking-[0.4em] uppercase text-subtext mb-6">
              Vol. 01 &nbsp;/&nbsp; About the Project
            </p>
            <h1 className="font-serif text-4xl sm:text-5xl md:text-7xl font-black tracking-tight leading-[1.1]">
              届けるための、<br />
              場所をつくる。
            </h1>
          </div>
        </div>
      </section>

      {/* ── 本文 ─────────────────────────────────────────── */}
      <article className="popeye-container px-4 py-16 md:py-24">
        <div className="max-w-2xl mx-auto space-y-20">

          {/* 章 01 */}
          <section>
            <div className="flex items-center gap-6 mb-8">
              <span className="font-mono text-5xl font-black text-border leading-none select-none">01</span>
              <div className="flex-1 border-t-2 border-black" />
            </div>
            <h2 className="font-serif text-2xl md:text-3xl font-black mb-6 leading-snug">
              技術はあった。<br className="hidden md:block" />でも、届かなかった。
            </h2>
            <div className="space-y-5 font-serif text-lg leading-[2] text-gray-800">
              <p>
                SNS投稿もできる。ホームページも作れる。それなりに発信してきたつもりだった。
              </p>
              <p>
                でも、いくら発信しても、函館の外まで届かない。<br />
                地元の人でさえ、すぐ近くにある素晴らしいお店を知らないままでいる。
              </p>
              <p>
                個人の発信力だけでは、どこかに限界がある。<br />
                その壁に、何度もぶつかった。
              </p>
            </div>
          </section>

          {/* プルクォート */}
          <blockquote className="border-l-8 border-black pl-8 py-2">
            <p className="font-serif text-2xl md:text-3xl font-black leading-snug">
              「必要なのは、一人が孤独に発信することじゃない。<br className="hidden md:block" />
              みんなが集まれる"場所"なんじゃないか。」
            </p>
          </blockquote>

          {/* 章 02 */}
          <section>
            <div className="flex items-center gap-6 mb-8">
              <span className="font-mono text-5xl font-black text-border leading-none select-none">02</span>
              <div className="flex-1 border-t-2 border-black" />
            </div>
            <h2 className="font-serif text-2xl md:text-3xl font-black mb-6 leading-snug">
              街の手触りが、<br className="hidden md:block" />検索に出てこない。
            </h2>
            <div className="space-y-5 font-serif text-lg leading-[2] text-gray-800">
              <p>
                函館の路地を歩くと、至るところに店主の息づかいがある。<br />
                手書きの看板、窓越しに見える厨房、年季の入った暖簾。<br />
                どれも、その人の歴史が刻まれたものだ。
              </p>
              <p>
                そういう場所が、検索してもひっかからない。<br />
                SNSをやっていない。ホームページもない。<br />
                でも確かに、街のそこにある。
              </p>
              <p>
                そのリアルな街の手触りを、デジタルに刻む方法はないか。<br />
                ずっとそれを考えてきた。
              </p>
            </div>
          </section>

          {/* 章 03 */}
          <section>
            <div className="flex items-center gap-6 mb-8">
              <span className="font-mono text-5xl font-black text-border leading-none select-none">03</span>
              <div className="flex-1 border-t-2 border-black" />
            </div>
            <h2 className="font-serif text-2xl md:text-3xl font-black mb-6 leading-snug">
              あの日の自分が、<br className="hidden md:block" />欲しかった場所。
            </h2>
            <div className="space-y-5 font-serif text-lg leading-[2] text-gray-800">
              <p>
                「カッテニハコダテ」は、そういう問いから生まれた。
              </p>
              <p>
                技術に不慣れな店主さんのためでもある。<br />
                そして、発信する手段を持っていても届かないと感じていた、<br />
                あの頃の自分のためでもある。
              </p>
              <p>
                ここを入り口に、お客さんがお店の息づかいを感じてほしい。<br />
                店主さんは本業に集中しながら、街に存在を刻んでほしい。
              </p>
              <p>
                ITが苦手でも大丈夫。操作や更新は、こちらが全力でサポートします。
              </p>
            </div>
          </section>

          {/* CTA */}
          <div className="border-4 border-black p-8 md:p-12 bg-background">
            <p className="font-mono text-xs tracking-widest uppercase text-subtext mb-4">Join Us</p>
            <h3 className="font-serif text-2xl md:text-3xl font-black leading-snug mb-6">
              街の手触りを、<br />一緒に記録しよう。
            </h3>
            <p className="font-serif text-base text-gray-700 mb-8 leading-relaxed">
              掲載も、情報更新も、ぜんぶ無料です。<br />
              函館をもっと面白くするために、あなたのお店の話を聞かせてください。
            </p>
            <Link
              href="/submit"
              className="block sm:inline-block text-center bg-accent text-white px-8 py-4 font-bold tracking-widest hover:bg-black transition-colors shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-none"
            >
              お店を掲載する（無料）
            </Link>
          </div>

        </div>
      </article>

    </main>
  );
}
