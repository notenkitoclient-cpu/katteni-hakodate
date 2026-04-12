
import Link from 'next/link';

export default async function SubmitCompletePage({
  searchParams,
}: {
  searchParams: Promise<{ slug?: string }>;
}) {
  const { slug } = await searchParams;
  const storeUrl = `https://katteni-hakodate.com/stores/${slug || 'preview-slug'}`;

  return (
    <div className="popeye-container max-w-2xl py-20 text-center">
      
      <div className="mb-12">
        <h1 className="text-4xl font-serif mb-6 text-accent">Thank you.</h1>
        <p className="text-lg mb-4">申請の送信が完了しました！</p>
        <p className="text-subtext">
          現在、審査待ち（未公開）の状態です。<br/>
          運営側で内容を確認後、数日以内に本公開となります。
        </p>
      </div>

      {/* バナー＆プレビューセクション */}
      <div className="border-2 border-foreground p-8 md:p-12 text-left mb-12">
        <h2 className="text-xl font-bold mb-6 border-b-2 border-foreground pb-2 inline-block">
          承認前にできること
        </h2>
        
        <div className="space-y-8">
          <div>
            <h3 className="font-bold mb-2">① プレビューの確認</h3>
            <p className="text-sm text-subtext mb-4">
              実際にどのように表示されるか、「プレビューページ」で確認できます。（あなただけが見れるURLです）
            </p>
            <Link 
              href={`/stores/${slug}/preview`}
              className="inline-block bg-gray-100 px-6 py-3 text-sm font-bold border border-border hover:bg-gray-200 transition-colors"
            >
              プレビューページを見る →
            </Link>
          </div>

          <div>
            <h3 className="font-bold mb-2">② 掲載のアピール準備</h3>
            <p className="text-sm text-subtext mb-4">
              審査が通って本公開されたら、以下のURLをSNSでシェアして、「函館まち図鑑に載ったよ！」とお客さんに伝えましょう。
            </p>
            <div className="bg-gray-50 p-4 font-tele text-xs overflow-x-auto border border-border">
              {storeUrl}
            </div>
            {/* モックバナー */}
            <div className="mt-4 border-2 border-dashed border-border bg-gray-50 p-8 text-center">
              <span className="text-xs font-tele text-subtext">AUTO-GENERATED BANNER</span><br/>
              <span className="font-serif">「カッテニハコダテに掲載されました」</span><br/>
              <span className="text-xs text-subtext mt-2 block">※本公開時にQRコード付き画像がここに生成されます。長押しで保存してInstagramに投稿！</span>
            </div>
          </div>
        </div>
      </div>

      <Link 
        href="/"
        className="font-tele text-sm uppercase tracking-widest border-b-2 border-foreground pb-1 hover:text-accent hover:border-accent transition-colors"
      >
        Return to Top
      </Link>

    </div>
  );
}
