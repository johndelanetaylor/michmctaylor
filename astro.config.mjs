// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: process.env.SITE ?? 'https://michmctaylor.com',
  base: process.env.BASE ?? '/',
  integrations: [mdx(), sitemap()],
  // GitHub Pages has no server redirects; Astro emits meta-refresh pages for these.
  redirects: {
    '/home': (process.env.BASE ?? '') + '/',
    '/cart': (process.env.BASE ?? '') + '/',
  },
});
