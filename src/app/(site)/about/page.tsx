import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'このサイトについて',
  description: 'カッテニハコダテは、函館を勝手に応援するプロジェクトです。誰でも自由に使える、みんなで作る函館まち図鑑。',
  openGraph: {
    title: 'このサイトについて | カッテニハコダテ',
    description: 'カッテニハコダテは、函館を勝手に応援するプロジェクトです。誰でも自由に使える、みんなで作る函館まち図鑑。',
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
              About the Project
            </p>
            <h1 className="font-serif text-4xl sm:text-5xl md:text-7xl font-black tracking-tight leading-[1.1]">
              函館を、<br />
              勝手に応援する。
            </h1>
          </div>
        </div>
      </section>

      {/* ── 本文 ─────────────────────────────────────────── */}
      <article className="popeye-container px-4 py-16 md:py-24">
        <div className="max-w-2xl mx-auto space-y-20">

          {/* リード */}
          <p className="font-serif text-xl md:text-2xl leading-relaxed text-gray-800">
            「函館まち図鑑」は、街のいいもの・面白いもの・みんなに知ってほしいものを、<br className="hidden md:block" />
            みんなでPRし合うための「お節介な」プラットフォームです。
          </p>

          {/* 章 01 */}
          <section>
            <div className="flex items-center gap-6 mb-8">
              <span className="font-mono text-5xl font-black text-border leading-none select-none">01</span>
              <div className="flex-1 border-t-2 border-black" />
            </div>
            <h2 className="font-serif text-2xl md:text-3xl font-black mb-6 leading-snug">
              みんなの「伝えたい」が<br className="hidden md:block" />集まった場所
            </h2>
            <div className="space-y-5 font-serif text-lg leading-[2] text-gray-800">
              <p>
                「うちの店のこれが美味しい」「これをいま応援してほしい！」
              </p>
              <p>
                そんな、普段は埋もれてしまいがちなみんなの「知ってほしい」を持ち寄ってください。<br />
                ここは単なる記録の場所ではありません。
              </p>
              <p>
                函館をもっと盛り上げるために、みんなで情報を出し合い、広めていくための場所です。
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
              誰でも自由に、<br className="hidden md:block" />使い倒せる
            </h2>
            <div className="space-y-5 font-serif text-lg leading-[2] text-gray-800">
              <p>
                ここに集まったPR情報は、誰でも無料で自由に活用できます。商用利用もOK。
              </p>
              <p>
                いい情報を独り占めせず、みんなで共有して、街全体の力に変えていきましょう。
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
              勝手にやってるから、<br className="hidden md:block" />無料です。<span className="text-base font-normal text-subtext ml-2">※審査あり</span>
            </h2>
            <div className="space-y-5 font-serif text-lg leading-[2] text-gray-800">
              <p>
                誰かに頼まれたわけじゃない。自分たちが函館を応援したいから、勝手に作っているプロジェクトです。<br />
                だから、利用料も、掲載料も、一切いりません。
              </p>
              <p>
                ただし、「本当に函館のためになるか」の審査はあります。<br />
                自信を持って「これ、いいよ！」と言えるものだけを、勝手に応援し続けます。
              </p>
            </div>
          </section>

          {/* CTA */}
          <div className="bg-black text-white p-8 md:p-12">
            <p className="font-mono text-xs tracking-widest text-gray-500 mb-4">Join Us</p>
            <h3 className="font-serif text-2xl md:text-3xl font-black leading-snug mb-6 text-white">
              あなたの「知ってほしい」のために、<br />ここを自由に使ってください。
            </h3>
            <p className="font-serif text-base text-gray-400 mb-8 leading-relaxed">
              それが誰かの新しい発見になり、街の応援に繋がるはず。<br />
              掲載も、情報更新も、ぜんぶ無料です。
            </p>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Link
                href="/submit"
                className="block text-center bg-accent text-white px-8 py-4 font-bold tracking-widest hover:bg-red-700 transition-colors"
              >
                お店を掲載する（無料）
              </Link>
              <span className="font-mono text-xs tracking-widest text-gray-600 border border-gray-700 px-3 py-1">
                勝手に応援中 ✔
              </span>
            </div>
          </div>

        </div>
      </article>

    </main>
  );
}
