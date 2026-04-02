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

export const collections = { articles, crowdfunding, events, drafts };
