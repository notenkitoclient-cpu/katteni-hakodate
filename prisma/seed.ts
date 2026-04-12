const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Clear existing
  await prisma.store.deleteMany();

  const stores = [
    {
      slug: 'coffeeshop-hoshizora',
      store_name: '喫茶 星空',
      category: '飲食店',
      location_area: '西部地区',
      address: '北海道函館市元町1-2-3',
      contact_tel: '0138-22-XXXX',
      reservation_url: '',
      sns_instagram: '@hoshizora_cafe_hkdt',
      video_url: '',
      images: JSON.stringify(['/uploads/sample-coffee.webp', '/uploads/sample-coffee2.webp']),
      our_challenge: '昔ながらのサイフォン式コーヒーを守りつつ、最近は地元で採れたリンゴを使った自家製タルトの提供を始めました。若い方にも純喫茶の雰囲気を楽しんでもらえたら。',
      user_comment: 'マスターの声がとにかく渋い。夕暮れ時に窓際で飲むウインナーコーヒーは函館一だと思う。',
      vibe_level: 2, // 1:静か - 5:賑やか
      hidden_gem: '裏メニューのナポリタン（要予約）',
      opening_hours: '10:00 - 18:00 (水曜定休)',
      is_approved: true, // シードデータは公開済み
    },
    {
      slug: 'mizu-no-trouble-hakodate',
      store_name: 'ハコダテ水道メンテ',
      category: '暮らしの困りごと',
      location_area: '桔梗・昭和',
      address: '北海道函館市昭和2-4-5',
      contact_tel: '0120-XXX-XXX',
      reservation_url: 'https://example.com/reserve',
      sns_line: 'https://lin.ee/sample',
      video_url: 'https://youtube.com/watch?v=sample',
      images: JSON.stringify(['/uploads/sample-plumber.webp']),
      our_challenge: '「深夜でも絶対に電話に出る」をモットーに20年。最近はLINEで水漏れの写真を送ってもらい、事前にざっくり見積もりを出せる仕組みを導入しました。',
      user_comment: '冬の夜中に水道管が破裂した時、パジャマ姿で30分で飛んできてくれた。本当に神様に見えた。',
      vibe_level: null,
      hidden_gem: '社長のダジャレ',
      opening_hours: '24時間対応 (年中無休)',
      is_approved: true,
    },
    {
      slug: 'minato-bakery-new',
      store_name: 'Minato Bakery',
      category: '新規オープン',
      location_area: '本町・五稜郭',
      address: '北海道函館市本町5-1',
      contact_tel: '0138-51-XXXX',
      sns_instagram: '@minato_bakery_2024',
      images: JSON.stringify(['/uploads/sample-bread.webp']),
      our_challenge: '東京の有名店で10年修行し、地元函館でついにお店を開きました。道産小麦100%と、函館牛乳だけを使った無添加パンを焼いています。',
      user_comment: 'クロワッサンがパリパリすぎて服が散らかるが、バターの香りがたまらないので許せる。',
      vibe_level: 4,
      hidden_gem: '土日限定の明太フランス',
      opening_hours: '08:00 - 売切次第終了 (月・火定休)',
      is_approved: true,
    }
  ];

  for (const store of stores) {
    await prisma.store.create({ data: store });
  }

  console.log('Seeded database with sample stores!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
