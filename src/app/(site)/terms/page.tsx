export default function TermsPage() {
  return (
    <main className="bg-background min-h-screen">
      <section className="popeye-container py-20 px-4 md:py-32">
        <div className="max-w-3xl mx-auto bg-white border-4 border-black p-8 md:p-16 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
          <header className="mb-16 border-b-2 border-black pb-8">
            <h1 className="font-serif text-3xl md:text-5xl font-black tracking-tight leading-tight mb-4">
              「カッテニ」楽しむための、<br className="hidden md:block" />
              大切なお願い。
            </h1>
            <p className="font-mono text-sm tracking-widest text-gray-500">ガイドライン (Guidelines)</p>
          </header>

          <div className="space-y-12 font-serif text-lg leading-loose text-gray-800">
            
            <section>
              <h2 className="text-2xl font-bold bg-black text-white inline-block px-4 py-1 mb-4">1. 愛のある情報を</h2>
              <p>
                この掲示板は、みんなで函館を盛り上げるための場所です。お店を応援する愛のある情報をお待ちしています。<br />
                誰かを傷つけるような誹謗中傷や、悪用目的の投稿は絶対にやめてください。サイトの治安を守るため、もしそうした投稿があった場合は、運営の判断で「勝手に」削除させていただきます。
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold bg-black text-white inline-block px-4 py-1 mb-4">2. 権利について</h2>
              <p>
                あなたが投稿したテキストや写真の著作権は、もちろんあなた（またはお店）のものです。<br />
                ただし、このサイトをもっと多くの人に知ってもらうためのPR（InstagramやXなどのSNS）で、投稿の内容を二次利用させていただくことがあります。その点だけ、あらかじめご了承ください。
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold bg-black text-white inline-block px-4 py-1 mb-4">3. 免責について</h2>
              <p>
                このサイトをきっかけにお店とお客さんが繋がってくれるのは最高に嬉しいですが、万が一利用者間で起きたトラブルなどについては、運営では責任を負うことができません。<br />
                ルールを守って、楽しい思い出のきっかけ作りとして使ってください。
              </p>
            </section>

            <div className="mt-16 bg-gray-100 p-8 border-l-8 border-accent text-xl font-bold">
              <p className="mb-4">
                最後に。
              </p>
              <p>
                このサイトは、好きなように使って、みんなで函館をもりもり盛り上げるためのものです！<br />
                HP代わりに使うもよし、知られざる名店をこっそり自慢するもよし、ご自由にお使いください！
              </p>
              <p className="mt-4 text-accent">
                「カッテニハコダテ」ってどこかに書いてもらえると、僕たちに勇気と元気が届きます！
              </p>
            </div>

          </div>
        </div>
      </section>
    </main>
  );
}
