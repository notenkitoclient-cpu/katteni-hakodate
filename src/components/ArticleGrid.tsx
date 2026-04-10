import { motion } from 'motion/react';

export interface ArticleItem {
  slug: string;
  title: string;
  description: string;
  category: string;
  date: string;
  readingMinutes: number;
  source?: string;
  isInvestigation?: boolean;
  href: string;
}

const CATEGORY_STYLE: Record<string, { bg: string; label: string }> = {
  'グルメ':      { bg: 'linear-gradient(135deg, #0d4a4a 0%, #0d8a87 100%)', label: 'グルメ' },
  '観光':        { bg: 'linear-gradient(135deg, #0d2d52 0%, #1a5a9e 100%)', label: '観光' },
  '暮らし':      { bg: 'linear-gradient(135deg, #2a3a2a 0%, #3a6a3a 100%)', label: '暮らし' },
  'イベント':    { bg: 'linear-gradient(135deg, #4a2a1a 0%, #9E3D26 100%)', label: 'イベント' },
  '人・ビジネス':{ bg: 'linear-gradient(135deg, #2a1a4a 0%, #5a3a7a 100%)', label: '人・ビジネス' },
  '特産品':      { bg: 'linear-gradient(135deg, #1a3a2a 0%, #2a7a5a 100%)', label: '特産品' },
  '調査報告':    { bg: 'linear-gradient(135deg, #111111 0%, #2a2a2a 100%)', label: '調査報告' },
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

function ArticleCard({ article }: { article: ArticleItem }) {
  const style = CATEGORY_STYLE[article.category] ?? CATEGORY_STYLE['暮らし'];

  return (
    <motion.a
      href={article.href}
      className="group flex flex-col text-spicato-black no-underline"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-5% 0px' }}
      transition={{ duration: 0.6 }}
    >
      {/* 画像エリア (4:3) */}
      <div className="relative overflow-hidden" style={{ aspectRatio: '4/3' }}>
        <motion.div
          className="w-full h-full"
          style={{ background: style.bg }}
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* カテゴリラベル（画像中央） */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white/20 font-serif text-4xl md:text-5xl font-bold tracking-widest select-none [font-feature-settings:'palt']">
              {style.label}
            </span>
          </div>

          {/* 調査報告バッジ */}
          {article.isInvestigation && (
            <div className="absolute top-3 left-3 bg-white text-spicato-black text-[9px] font-sans font-bold tracking-[0.2em] uppercase px-2 py-1">
              Investigation
            </div>
          )}

          {/* 出典バッジ */}
          {article.source && (
            <div className="absolute bottom-3 right-3 bg-black/50 text-white/80 text-[9px] font-sans tracking-wide px-2 py-1 backdrop-blur-sm">
              出典：{article.source}
            </div>
          )}
        </motion.div>
      </div>

      {/* テキストエリア */}
      <div className="pt-4 flex flex-col gap-2">
        {/* メタ情報 */}
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-sans text-spicato-black/30 tracking-widest">
            {formatDate(article.date)}
          </span>
          <span className="text-[10px] font-sans text-spicato-black/30">·</span>
          <span className="text-[10px] font-sans text-spicato-black/30 tracking-wide">
            {article.readingMinutes}分で読める現実
          </span>
        </div>

        {/* タイトル */}
        <h2 className="font-serif text-base md:text-lg leading-relaxed [font-feature-settings:'palt'] group-hover:opacity-60 transition-opacity duration-300">
          {article.title}
        </h2>

        {/* 説明 */}
        <p className="font-sans text-xs text-spicato-black/50 leading-relaxed line-clamp-2">
          {article.description}
        </p>
      </div>
    </motion.a>
  );
}

export default function ArticleGrid({ articles }: { articles: ArticleItem[] }) {
  return (
    <section className="px-6 md:px-10 pb-32 bg-spicato-white">
      <div className="max-w-6xl mx-auto">
        {articles.length === 0 ? (
          <div className="text-center py-32">
            <p className="font-serif text-2xl text-spicato-black/30 tracking-widest">
              鋭意執筆中。
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16">
            {articles.map(article => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
