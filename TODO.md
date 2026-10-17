# TODO — michmctaylor.com rebuild

Working checklist. `PLAN.md` = why/phases; this = what's left. Tick as done.

## Content migration (verify vs live page, per project)
Use `node scripts/outline.mjs work__<slug>` + `raw/_shots/<slug>.png` as the source of truth.

| Project | Title/meta | Copy complete | All images | Video/GIF | Alt text | Reviewed |
|---|---|---|---|---|---|---|
| stem-ciders-brand-development | [x] | [x] | [x] 28 | [x] 5 loops | [x] | [ ] |
| howdy-beer | [x] | [x] | [x] 14 | [x] 1 loop | [x] | [ ] |
| funkwerks | [x] | [x] | [x] 19 | [x] 2 loops + Vimeo | [x] | [ ] |
| new-planet | [x] | [x] | [x] 19 | – | [x] | [ ] |
| merch | [x] | [x] | [x] 22 | [x] 1 loop | [x] | [ ] |
| motion-graphics | [x] | [x] | [x] 14 loops + 2 videos | [x] | [x] | [ ] |
| content | [x] | [x] | [x] 24 | [x] 1 loop | [x] | [ ] |
| branding | [x] | [x] | [x] 7 | – | [x] | [ ] |
| vanilla-gift (draft, hidden) | [x] | [x] | [ ] hero = stock meadow | [x] | [x] | [ ] |
| blog: portfolio-mockups | [ ] | [x] | [ ] | – | [ ] | [ ] |
| blog: artsy-baby | [ ] | [x] | [ ] | – | [ ] | [ ] |
| home | [x] | [x] | [x] new light styling (Michelle prefers it over SS look) | – | [x] | [ ] |
| contact | [x] | [x] | [ ] SS had a photo | – | – | [ ] |

- [ ] Every project: `title`, `client`, `year`, `summary`, `services`, `tags` confirmed w/ Michelle
- [ ] Hero image choice per project confirmed
- [ ] `featured` + `order` on home confirmed
- [ ] Old-page `<title>`s → new consistent pattern `<Page> — Michelle M. Taylor`
- [x] GIFs → MP4/WebM via `scripts/gif2mp4.sh` — 23 GIFs (~90 MB) → 19 MB mp4 + 12 MB webm; dist 188 → 94 MB
- [x] Vanilla Gift videos pulled from SS HLS, re-encoded 720p (3 MB + 2.3 MB); 1080p originals kept in `raw/_video/`
- [x] Motion reel page built from `raw/work__motion-graphics`
- [x] Section headings in bodies match live (lowercase h2s)
- [x] Image ordering/grouping matches live (via `scripts/outline.mjs` + `port.mjs`); decorative SS blob/band backgrounds intentionally dropped

## Design / consistency
- [ ] Color palette review: off-white + orange accent site-wide (indigo SS look rejected 2026-09-21); yellow/indigo tokens currently unused
- [ ] Type scale check on real content (h1 on long titles; prose h2 now fs-3 w/ rule)
- [ ] Card image crop: square vs original aspect — decide
- [x] Galleries = uniform tiles (`ratio`/`fit`), regrouped by aspect; captions on media. System documented in `docs/case-study-layout.md`
- [ ] Review crops: every `ratio="1"` cover gallery may clip edges of designed graphics — spot-check w/ Michelle
- [x] Project hero: contained 16:9 (4:3 mobile)
- [ ] Marquees (home flat + footer tilt): speed/size OK?
- [ ] Footer CTA + social layout on mobile
- [ ] 404 page
- [ ] OG default image (`public/og-default.jpg`) — currently missing
- [ ] Favicon: SVG placeholder → real mark

## Accessibility
- [ ] Color contrast ≥ 4.5:1: body, `--c-ink-soft` on `--c-bg`, accent-on-ink buttons, chips
- [ ] Alt text on every image (schema enforces `heroAlt`; body images need manual pass — SS alt was filename or empty)
- [ ] Headings: one h1 per page, no skipped levels (prose h2 → h3)
- [ ] Focus states visible on links/buttons/chips
- [ ] Mobile nav: keyboard operable, `aria-expanded`, Esc closes, focus trap not needed
- [x] `prefers-reduced-motion`: marquee stops, video loops don't autoplay + show controls (VideoLoop script)
- [ ] Autoplay loops: muted/playsinline ✔; consider a visible pause control (WCAG 2.2.2 for >5s motion)
- [ ] Vimeo iframe has `title` ✔
- [ ] Skip link ✔ — verify it targets `#main`
- [ ] Lighthouse a11y ≥ 95 on home, work, a project, blog post
- [ ] Screen reader pass: VoiceOver on home + one project

## Performance
- [ ] Lighthouse perf ≥ 90 mobile on motion page after GIF→MP4
- [ ] Hero `loading="eager"` + `fetchpriority="high"` on LCP image
- [ ] Font subsetting / `font-display: swap` (fontsource default) ✔

## SEO / launch
- [ ] Per-page titles + descriptions reviewed
- [ ] `sitemap-index.xml` ✔, `robots.txt` ✔
- [ ] Redirects verified: `/home`, `/cart` (all 8 work slugs unchanged → no redirects needed)
- [ ] Search Console: add property, submit sitemap post-launch
- [x] Repo: `johndelanetaylor/michmctaylor` (public) — transfer to Michelle's account later if desired
- [x] **Launch flip** 2026-10-17: `public/CNAME` restored, preview `SITE`/`BASE` env removed from workflow
- [ ] DNS in Squarespace → GH Pages; HTTPS enforced
- [ ] Squarespace kept 2–4 wks then cancelled (after domain transfer)

## Later (post-launch)
- [ ] **Contact form** (Formspree/Web3Forms) replacing `mailto:` — add honeypot, success state
- [ ] GA4
- [ ] Domain transfer out of Squarespace (Phase 8 in PLAN.md)
- [ ] Copy pass on voice
- [ ] `README.md` how-to for adding projects/posts
- [ ] Delete `scripts/scrape.mjs`, `outline.mjs`, `blog2md.py`, `cheerio` dep once migration done
