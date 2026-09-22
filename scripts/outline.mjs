// Print an ordered content outline of a scraped Squarespace page.
// node scripts/outline.mjs work__funkwerks
import { readFileSync } from 'node:fs';
import * as cheerio from 'cheerio';

const slug = process.argv[2];
const html = readFileSync(`raw/${slug}/page.html`, 'utf8');
const $ = cheerio.load(html);
$('style, script').remove();
const fname = (u) => decodeURIComponent((u || '').split('?')[0].split('/').pop()).replace(/\+/g, ' ').replace(/[^\w.\- ]/g, '_');

const md = (el) => {
  const $el = $(el).clone();
  $el.find('a').each((_, a) => { const h = $(a).attr('href'); $(a).replaceWith(h ? `[${$(a).text()}](${h})` : $(a).text()); });
  $el.find('strong,b').each((_, x) => $(x).replaceWith(`**${$(x).text()}**`));
  $el.find('em,i').each((_, x) => $(x).replaceWith(`*${$(x).text()}*`));
  const out = [];
  $el.children().each((_, c) => {
    const t = $(c).text().replace(/\s+/g, ' ').trim(); if (!t) return;
    const tag = c.tagName;
    if (/^h[1-4]$/.test(tag)) out.push(`${'#'.repeat(+tag[1])} ${t}`);
    else if (tag === 'ul' || tag === 'ol') out.push($(c).children('li').map((_, li) => `- ${$(li).text().trim()}`).get().join('\n'));
    else out.push(t);
  });
  return out.join('\n\n') || $el.text().replace(/\s+/g, ' ').trim();
};

let n = 0;
$('section.page-section').each((si, sec) => {
  const $s = $(sec);
  console.log(`\n══ SECTION ${si + 1} ${$s.attr('data-section-theme') || ''}`);
  const bg = $s.find('.section-background img').first(); if (bg.length) console.log(`  [section-bg] ${fname(bg.attr('data-src') || bg.attr('src'))}  alt="${bg.attr('alt') || ''}"`);
  // gallery sections (no sqs-block wrapper)
  if ($s.hasClass('gallery-section') || $s.find('.gallery-grid, .gallery-strips, .gallery-slideshow, .gallery-masonry, .gallery-reel').length) {
    const layout = ($s.find('[class*="gallery-"]').first().attr('class') || '').match(/gallery-(grid|strips|slideshow|masonry|reel|fullscreen-slideshow)/)?.[1];
    console.log(`  [gallery:${layout}]`);
    $s.find('img[data-src]').each((_, img) => console.log(`    - ${fname($(img).attr('data-src'))}  alt="${$(img).attr('alt') || ''}"`));
    return;
  }
  $s.find('.sqs-block').not('.sqs-block .sqs-block').each((_, b) => {
    const $b = $(b); n++;
    const type = ($b.attr('class').match(/sqs-block-(html|image|gallery|video|button|marquee|spacer|horizontalrule|code|embed|summary)/) || [])[1];
    if (type === 'html') { console.log(`  [text]\n${md($b.find('.sqs-html-content')).split('\n').map((l) => '    ' + l).join('\n')}`); }
    else if (type === 'image') { const img = $b.find('img').first(); console.log(`  [image] ${fname(img.attr('data-src') || img.attr('src'))}  alt="${img.attr('alt') || ''}"  cap="${$b.find('figcaption, .image-caption').text().trim()}"`); }
    else if (type === 'gallery') { const j = $b.attr('data-block-json') || ''; console.log(`  [gallery-block design=${j.match(/"design":"(\w+)"/)?.[1]} aspect=${j.match(/"aspect-ratio":"([^"]+)"/)?.[1]} cols=${j.match(/"thumbnails-per-row":(\d+)/)?.[1] ?? ''}]`); $b.find('img').each((_, img) => console.log(`    - ${fname($(img).attr('data-src') || $(img).attr('src'))}  alt="${$(img).attr('alt') || ''}"`)); }
    else if (type === 'video') { const h = $b.find('.sqs-video-wrapper').attr('data-html') || ''; const src = h.match(/src="([^"]+)"/)?.[1]; const title = h.match(/title="([^"]+)"/)?.[1]; const native = $b.find('video source, video').attr('src'); console.log(`  [video] ${src || native}  title="${title || ''}"`); }
    else if (type === 'button') console.log(`  [button] ${$b.find('a').text().trim()} → ${$b.find('a').attr('href')}`);
    else if (type === 'marquee') console.log(`  [marquee] ${$b.text().replace(/\s+/g, ' ').trim().slice(0, 100)}`);
    else if (type === 'spacer' || type === 'horizontalrule') return;
    else console.log(`  [${type}] ${$b.text().replace(/\s+/g, ' ').trim().slice(0, 120)}`);
  });
});
