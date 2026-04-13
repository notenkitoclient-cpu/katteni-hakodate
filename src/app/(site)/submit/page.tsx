"use client";

import { useState, useRef } from 'react';
import { submitStore } from './actions';

type Preview = {
  store_name: string; category: string; location_area: string;
  address: string; contact_tel: string; reservation_url: string;
  website_url: string; sns_line: string; sns_instagram: string; our_challenge: string; video_url: string;
};

export default function SubmitWizard() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [preview, setPreview] = useState<Preview | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const nextStep = () => setStep(prev => Math.min(prev + 1, 5));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  const goToPreview = () => {
    if (!formRef.current) return;
    const fd = new FormData(formRef.current);
    setPreview({
      store_name:      fd.get('store_name') as string || '',
      category:        fd.get('category') as string || '',
      location_area:   fd.get('location_area') as string || '',
      address:         fd.get('address') as string || '',
      contact_tel:     fd.get('contact_tel') as string || '',
      website_url:     fd.get('website_url') as string || '',
      reservation_url: fd.get('reservation_url') as string || '',
      sns_line:        fd.get('sns_line') as string || '',
      sns_instagram:   fd.get('sns_instagram') as string || '',
      our_challenge:   fd.get('our_challenge') as string || '',
      video_url:       fd.get('video_url') as string || '',
    });
    setStep(6);
  };

  const isPreviewStep = step === 6;

  return (
    <div className="popeye-container max-w-2xl py-20 min-h-[70vh]">

      {/* ヒーロー */}
      <div className="mb-12 pb-10 border-b-2 border-black">
        <p className="font-mono text-[10px] tracking-[0.4em] uppercase text-subtext mb-4">函館まち図鑑 — 掲載申請</p>
        <h1 className="font-serif text-3xl md:text-4xl font-black leading-snug mb-4">
          頑張っている人が、<br />知られないのはもったいない。
        </h1>
        <p className="font-serif text-base text-gray-700 leading-relaxed mb-4">
          掲載も、情報更新も、ぜんぶ無料。<br />
          函館で何かを仕掛けている人は、ここを自由に使い倒してください。
        </p>
        <p className="font-mono text-xs text-subtext">── 審査はあります。でも、本気の人なら全力で載せます。</p>
      </div>

      <div className="mb-12">
        <div className="flex flex-wrap items-baseline gap-4 mb-4">
          <span className="text-xl font-bold">
            {!isPreviewStep ? `Step ${step} / 5` : 'PREVIEW'}
          </span>
        </div>
        <div className="bg-gray-50 border-l-4 border-accent p-4 mb-6">
          <p className="text-sm md:text-base font-bold text-gray-800">
            書き方が分からなくても大丈夫。DMをくれたら、一緒に作ります。
          </p>
        </div>
        <div className="w-full h-1 bg-border rounded-full overflow-hidden">
          <div
            className="h-full bg-accent transition-all duration-500 ease-out"
            style={{ width: `${isPreviewStep ? 100 : (step / 5) * 100}%` }}
          />
        </div>
      </div>

      <form ref={formRef} action={async (formData) => {
        setIsSubmitting(true);
        await submitStore(formData);
      }} className="space-y-8">

        {/* STEP 1: 基本情報 */}
        <div className={step === 1 ? 'block' : 'hidden'}>
          <h2 className="text-xl font-bold mb-8">お店の名前から、始めましょう。</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm text-subtext mb-2 tracking-widest uppercase">STORE NAME *</label>
              <input type="text" name="store_name" required className="form-input text-xl" placeholder="例：ラッキーピエロ 本町店" />
            </div>
            <div>
              <label className="block text-sm text-subtext mb-2 tracking-widest uppercase">CATEGORY</label>
              <select name="category" className="form-input">
                <option value="飲食店">飲食店</option>
                <option value="新規オープン">新規オープン</option>
                <option value="暮らしの困りごと">暮らしの困りごと（水道・鍵など）</option>
                <option value="小売・アパレル">小売・アパレル</option>
                <option value="美容・健康">美容・健康</option>
                <option value="その他">その他</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-subtext mb-2 tracking-widest uppercase">AREA</label>
              <select name="location_area" className="form-input">
                <option value="本町・五稜郭">本町・五稜郭エリア</option>
                <option value="西部地区">西部地区（元町・十字街周辺）</option>
                <option value="函館駅前・大門">函館駅前・大門エリア</option>
                <option value="湯の川">湯の川エリア</option>
                <option value="桔梗・昭和">桔梗・昭和・美原エリア</option>
                <option value="その他">その他</option>
              </select>
            </div>
          </div>
        </div>

        {/* STEP 2: 場所・連絡先 */}
        <div className={step === 2 ? 'block' : 'hidden'}>
          <h2 className="text-xl font-bold mb-8">来てほしい人が、迷わないように。</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm text-subtext mb-2 tracking-widest uppercase">ADDRESS</label>
              <input type="text" name="address" className="form-input text-lg" placeholder="函館市本町X-X" />
              <p className="text-xs text-subtext mt-2">入力した住所でGoogleマップのピンを自動生成します。</p>
            </div>
            <div>
              <label className="block text-sm text-subtext mb-2 tracking-widest uppercase">PHONE</label>
              <input type="tel" name="contact_tel" className="form-input font-tele text-lg" placeholder="0138-XX-XXXX" />
            </div>
          </div>
        </div>

        {/* STEP 3: アクション情報 */}
        <div className={step === 3 ? 'block' : 'hidden'}>
          <h2 className="text-xl font-bold mb-8">興味を持った人が、次に進める場所を。</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm text-subtext mb-2 tracking-widest uppercase">OFFICIAL WEBSITE</label>
              <input type="url" name="website_url" className="form-input" placeholder="https://your-shop.com" />
            </div>
            <div>
              <label className="block text-sm text-subtext mb-2 tracking-widest uppercase">RESERVATION LINK</label>
              <input type="url" name="reservation_url" className="form-input" placeholder="https://..." />
            </div>
            <div>
              <label className="block text-sm text-subtext mb-2 tracking-widest uppercase">OFFICIAL LINE</label>
              <input type="url" name="sns_line" className="form-input" placeholder="https://lin.ee/..." />
            </div>
            <div>
              <label className="block text-sm text-subtext mb-2 tracking-widest uppercase">INSTAGRAM</label>
              <input type="text" name="sns_instagram" className="form-input" placeholder="@your_account" />
            </div>
          </div>
        </div>

        {/* STEP 4: こだわり・PR */}
        <div className={step === 4 ? 'block' : 'hidden'}>
          <h2 className="text-xl font-bold mb-8">一番伝えたいことを、ここで叫んでください。</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm text-subtext mb-2 tracking-widest uppercase flex justify-between">
                <span>OUR CHALLENGE</span>
                <span className="text-xs opacity-50">200文字程度</span>
              </label>
              <textarea
                name="our_challenge"
                rows={4}
                className="w-full border-2 border-border p-4 outline-none focus:border-accent resize-none placeholder:text-gray-300"
                placeholder="今年から地元の野菜を使ったメニューに切り替えました。常連さんにも好評で..."
              />
              <p className="text-xs text-subtext mt-2">クラウドファンディング中でも、新店オープンでも、新メニュー開発中でも。今まさに知ってほしいことを、ここで全部書いてください。</p>
            </div>
            <div>
              <label className="block text-sm text-subtext mb-2 tracking-widest uppercase">
                PR VIDEO URL <span className="text-accent text-[10px] ml-2">RECOMMENDED</span>
              </label>
              <input type="url" name="video_url" className="form-input" placeholder="YouTube or Instagram Reel URL" />
              <p className="text-xs text-subtext mt-2">15〜30秒程度の短尺動画があると信頼感がUPします。</p>
            </div>
          </div>
        </div>

        {/* STEP 5: 画像 */}
        <div className={step === 5 ? 'block' : 'hidden'}>
          <h2 className="text-xl font-bold mb-8">写真があると、もっと伝わります。（任意）</h2>
          <div className="border-2 border-dashed border-border p-12 text-center bg-white opacity-50 cursor-not-allowed">
            <span className="font-tele text-subtext block mb-2">IMAGE UPLOAD</span>
            <span className="text-sm">画像アップロードは近日対応予定</span>
          </div>
        </div>

        {/* STEP 6: プレビュー確認 */}
        {isPreviewStep && preview && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold">内容をご確認ください。</h2>
            <div className="border-2 border-foreground bg-white p-8 space-y-0 text-sm divide-y divide-border">
              <Row label="店舗名" value={preview.store_name} />
              <Row label="カテゴリ" value={preview.category} />
              <Row label="エリア" value={preview.location_area} />
              <Row label="住所" value={preview.address} />
              <Row label="電話番号" value={preview.contact_tel} />
              <Row label="公式HP" value={preview.website_url} />
              <Row label="予約URL" value={preview.reservation_url} />
              <Row label="LINE" value={preview.sns_line} />
              <Row label="Instagram" value={preview.sns_instagram} />
              <Row label="PR動画URL" value={preview.video_url} />
              {preview.our_challenge && (
                <div className="py-4">
                  <span className="text-subtext font-tele text-xs block mb-2">OUR CHALLENGE</span>
                  <p className="leading-relaxed">{preview.our_challenge}</p>
                </div>
              )}
            </div>
            <div className="bg-gray-100 p-5 text-sm leading-relaxed">
              当ポータルは<strong>承認制</strong>です。送信後にプレビューURLが発行されます。運営者が確認後、数日以内に本公開となります。<br />
              公開後、SNSでの発信を行います！ご了承ください！
            </div>
          </div>
        )}

        {/* ナビゲーション */}
        <div className="flex gap-4 pt-8">
          {(step > 1 || isPreviewStep) && (
            <button
              type="button"
              onClick={isPreviewStep ? () => setStep(5) : prevStep}
              className="flex-1 py-4 border-2 border-border font-tele font-bold tracking-widest hover:bg-gray-50 uppercase"
            >
              Back
            </button>
          )}

          {step < 5 && (
            <button
              type="button"
              onClick={nextStep}
              className="flex-1 py-4 bg-foreground text-background font-tele font-bold tracking-widest hover:bg-black uppercase"
            >
              Next Step
            </button>
          )}

          {step === 5 && (
            <button
              type="button"
              onClick={goToPreview}
              className="flex-1 py-4 bg-foreground text-background font-tele font-bold tracking-widest hover:bg-black uppercase"
            >
              内容を確認する →
            </button>
          )}

          {isPreviewStep && (
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex-1 py-4 bg-accent text-white font-tele font-bold tracking-widest uppercase transition-colors ${
                isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-700'
              }`}
            >
              {isSubmitting ? '送信中...' : '申請を送信する'}
            </button>
          )}
        </div>

      </form>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="flex gap-4 py-3">
      <span className="text-subtext font-tele text-xs w-28 shrink-0 pt-0.5">{label}</span>
      <span className="flex-1 break-all">{value}</span>
    </div>
  );
}
