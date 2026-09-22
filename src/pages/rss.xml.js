import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { SITE } from '../lib/site';

export async function GET(context) {
  const posts = (await getCollection('blog', ({ data }) => !data.draft)).sort((a, b) => +b.data.pubDate - +a.data.pubDate);
  return rss({
    title: `${SITE.name} — Blog`,
    description: 'Graphic design insights and creative delights.',
    site: context.site,
    items: posts.map((p) => ({ title: p.data.title, description: p.data.description, pubDate: p.data.pubDate, link: `/blog/${p.id}/` })),
  });
}
