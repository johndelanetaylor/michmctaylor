import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { tagKeys } from './lib/tags';

const Tag = z.enum(tagKeys as [string, ...string[]]);

const work = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/work' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      client: z.string(),
      summary: z.string().max(200),
      year: z.union([z.number().int(), z.string()]).optional(),
      tags: z.array(Tag).min(1),
      services: z.array(z.string()).default([]),
      hero: image(),
      heroAlt: z.string(),
      card: image().optional(), // grid thumbnail; falls back to hero
      featured: z.boolean().default(false),
      order: z.number().default(99),
      draft: z.boolean().default(false),
    }),
});

const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      hero: image().optional(),
      heroAlt: z.string().optional(),
      tags: z.array(z.string()).default([]),
      draft: z.boolean().default(false),
    }),
});

export const collections = { work, blog };
