// One-time Squarespace scrape. Downloads every page's HTML + all squarespace-cdn
// assets at original resolution into raw/<page>/. Run: node scripts/scrape.mjs
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const ORIGIN = 'https://www.michmctaylor.com';
const OUT = 'raw';

const sitemap = await (await fetch(`${ORIGIN}/sitemap.xml`)).text();
const pages = [...sitemap.matchAll(/<loc>(https:\/\/www\.michmctaylor\.com[^<]*)<\/loc>/g)]
  .map((m) => new URL(m[1]).pathname)
  .filter((p) => p !== '/home');
pages.unshift('/');

const manifest = {};

for (const page of pages) {
  const slug = page === '/' ? 'home' : page.slice(1).replace(/\//g, '__');
  const dir = path.join(OUT, slug);
  await mkdir(dir, { recursive: true });

  const html = await (await fetch(ORIGIN + page)).text();
  await writeFile(path.join(dir, 'page.html'), html);

  // text-only dump for copy porting
  const text = html
    .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, '')
    .replace(/<\/(p|h[1-6]|li|div|br)>/g, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"')
    .replace(/[ \t]+/g, ' ').replace(/\n\s*\n+/g, '\n\n').trim();
  await writeFile(path.join(dir, 'text.txt'), text);

  // assets: images (data-src / src), vimeo ids
  const urls = new Set(
    [...html.matchAll(/https:\/\/images\.squarespace-cdn\.com\/content\/v1\/[^"'?\s)]+/g)].map((m) => m[0]),
  );
  const vimeo = [...new Set([...html.matchAll(/vimeo\.com\/video\/(\d+)/g)].map((m) => m[1]))];
  manifest[page] = { slug, vimeo, assets: [] };

  for (const u of urls) {
    const name = decodeURIComponent(u.split('/').pop()).replace(/\+/g, ' ').replace(/[^\w.\- ]/g, '_');
    const dest = path.join(dir, name);
    manifest[page].assets.push({ url: u, file: name });
    if (existsSync(dest)) continue;
    try {
      const res = await fetch(`${u}?format=original`, { headers: { Accept: "image/jpeg,image/png,image/gif,image/*;q=0.8,*/*;q=0.5" } });
      if (!res.ok) throw new Error(res.status);
      await writeFile(dest, Buffer.from(await res.arrayBuffer()));
      console.log('✓', slug, name);
    } catch (e) {
      console.log('✗', slug, name, e.message);
    }
  }
}

await writeFile(path.join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 2));
console.log('done', Object.keys(manifest).length, 'pages');
