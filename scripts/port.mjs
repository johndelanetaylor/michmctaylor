// Emit an MDX body skeleton + copy images for one scraped project page.
// node scripts/port.mjs work__funkwerks funkwerks  →  prints MDX to stdout, copies assets to src/assets/work/funkwerks/
import { readFileSync, mkdirSync, copyFileSync, existsSync } from 'node:fs';
import * as cheerio from 'cheerio';

const [raw, slug] = process.argv.slice(2);
const $ = cheerio.load(readFileSync(`raw/${raw}/page.html`, 'utf8'));
$('style, script').remove();
const outDir = `src/assets/work/${slug}`;
mkdirSync(outDir, { recursive: true });

const fname = (u) => decodeURIComponent((u || '').split('?')[0].split('/').pop()).replace(/\+/g, ' ').replace(/[^\w.\- ]/g, '_');
const imports = [];
const seen = new Map();
let idx = 0;
const asset = (u) => {
  const f = fname(u);
  if (seen.has(f)) return seen.get(f);
  const src = `raw/${raw}/${f}`;
  if (!existsSync(src)) { console.error('MISSING', src); return null; }
  idx++;
  const ext = f.split('.').pop().toLowerCase();
  const clean = f.replace(/\.[^.]+$/, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
  const dest = `${String(idx).padStart(2, '0')}-${clean}.${ext}`;
  copyFileSync(src, `${outDir}/${dest}`);
  const v = `img${idx}`;
  imports.push(`import ${v} from '../../assets/work/${slug}/${dest}';`);
  seen.set(f, { v, ext, dest });
  return seen.get(f);
};

const md = (el) => {
  const $el = $(el).clone();
  $el.find('a').each((_, a) => { const h = $(a).attr('href'); $(a).replaceWith(h ? `[${$(a).text()}](${h})` : $(a).text()); });
  $el.find('strong,b').each((_, x) => $(x).replaceWith(`**${$(x).text()}**`));
  $el.find('em,i').each((_, x) => $(x).replaceWith(`*${$(x).text()}*`));
  const out = [];
  $el.children().each((_, c) => {
    const t = $(c).text().replace(/\s+/g, ' ').trim(); if (!t) return;
    const tag = c.tagName;
    if (tag === 'h1') return; // title lives in frontmatter
    if (/^h[2-4]$/.test(tag)) out.push(`${'#'.repeat(+tag[1])} ${t.toLowerCase()}`);
    else if (tag === 'ul' || tag === 'ol') out.push($(c).children('li').map((_, li) => `- ${$(li).text().trim()}`).get().join('\n'));
    else out.push(t);
  });
  return out.join('\n\n');
};

const body = [];
const imgTag = (a, alt = '') => `<Figure src={${a.v}} alt="${alt}" />`;

$('section.page-section').each((si, sec) => {
  const $s = $(sec);
  const bg = $s.find('.section-background img').first();
  if (bg.length) { const a = asset(bg.attr('data-src') || bg.attr('src')); if (a) body.push(`{/* live page banner: ${a.dest} — use as frontmatter hero */}`); }
  // gallery *sections* (SS 7.1 gallery page section, no sqs-block wrapper)
  const gsec = $s.find('.gallery-grid, .gallery-strips, .gallery-slideshow, .gallery-masonry, .gallery-reel, .gallery-fullscreen-slideshow').first();
  if (gsec.length) {
    const layout = (gsec.attr('class') || '').match(/gallery-(grid|strips|slideshow|masonry|reel|fullscreen-slideshow)/)?.[1];
    const items = gsec.find('img[data-src]').map((_, img) => asset($(img).attr('data-src'))).get().filter(Boolean);
    body.push(`{/* gallery section: ${layout} */}\n<Gallery cols={3} images={[\n${items.map((r) => `  { src: ${r.v}, alt: '' },`).join('\n')}\n]} />`);
    return;
  }
  const blocks = $s.find('.sqs-block').not('.sqs-block .sqs-block');
  let run = [];
  const flush = () => {
    if (run.length > 1) body.push(`<Gallery cols={${Math.min(run.length, 3)}} images={[\n${run.map((r) => `  { src: ${r.v}, alt: '' },`).join('\n')}\n]} />`);
    else if (run.length === 1) body.push(imgTag(run[0]));
    run = [];
  };
  blocks.each((_, b) => {
    const $b = $(b);
    const type = ($b.attr('class').match(/sqs-block-(html|image|gallery|video|button|marquee|spacer|horizontalrule)/) || [])[1];
    if (type === 'image') { const img = $b.find('img').first(); const a = asset(img.attr('data-src') || img.attr('src')); if (a) run.push(a); return; }
    flush();
    if (type === 'html') { const t = md($b.find('.sqs-html-content')); if (t && !/copyright ©|^(## )?\[?(WORK|CONTACT|BLOG|mmt)\]?/.test(t)) body.push(t); }
    else if (type === 'gallery') {
      const j = $b.attr('data-block-json') || '';
      const cols = +(j.match(/"thumbnails-per-row":(\d+)/)?.[1] ?? 2);
      const items = $b.find('img').map((_, img) => asset($(img).attr('data-src') || $(img).attr('src'))).get().filter(Boolean);
      body.push(`<Gallery cols={${cols}} images={[\n${items.map((r) => `  { src: ${r.v}, alt: '' },`).join('\n')}\n]} />`);
    }
    else if (type === 'video') { const h = $b.find('.sqs-video-wrapper').attr('data-html') || ''; const id = h.match(/vimeo\.com\/video\/(\d+)/)?.[1]; const title = h.match(/title="([^"]+)"/)?.[1] || ''; body.push(id ? `<Vimeo id="${id}" title="${title}" />` : `{/* TODO video: ${h.slice(0, 120)} */}`); }
  });
  flush();
});

console.log(`import Figure from '../../components/Figure.astro';\nimport Gallery from '../../components/Gallery.astro';\nimport Vimeo from '../../components/Vimeo.astro';\n${imports.join('\n')}\n\n${body.join('\n\n')}\n`);
