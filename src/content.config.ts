import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const articles = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/articles' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    category: z.enum(['グルメ', '観光', '暮らし', 'イベント', '人・ビジネス', '特産品']),
    date: z.string(),
    author: z.string(),
    image: z.string().optional(),
    tags: z.array(z.string()).optional(),
    featured: z.boolean().optional().default(false),
  }),
});

const crowdfunding = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/crowdfunding' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    owner: z.string(),
    area: z.string(),
    category: z.string(),
    goalAmount: z.number(),
    currentAmount: z.number(),
    supporterCount: z.number(),
    endDate: z.string(),
    url: z.string(),
    featured: z.boolean().optional().default(false),
  }),
});

const events = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/events' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.string(),
    endDate: z.string().optional(),
    venue: z.string(),
    area: z.string(),
    category: z.string(),
    url: z.string().optional(),
    free: z.boolean().optional().default(false),
  }),
});

const drafts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/drafts' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    category: z.enum(['グルメ', '暮らし', 'イベント', '人・ビジネス', '特産品']),
    date: z.string(),
    author: z.string(),
    writerId: z.string(),
    sourceUrl: z.string().optional(),
    tags: z.array(z.string()).optional(),
    featured: z.boolean().optional().default(false),
  }),
});

const news = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/news' }),
  schema: z.object({
    title: z.string(),
    type: z.enum(['開店', '閉店', '工事中', 'イベント', '目撃情報', 'その他']),
    date: z.string(),
    area: z.string(),
    reporter: z.string().default('編集部'),
    source: z.string().optional(),
    image: z.string().optional(),
  }),
});

const essays = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/essays' }),
  schema: z.object({
    title: z.string(),
    subtitle: z.string().optional(),
    date: z.string(),
    minutes: z.number(),
    tags: z.array(z.string()).optional(),
    source: z.string().optional(),
    coverBg: z.string().optional(),
    coverAccent: z.string().optional(),
  }),
});

export const collections = { articles, crowdfunding, events, drafts, news, essays };
