# michmctaylor.com — Squarespace → Astro migration plan

## Current-state audit (2026-09-21)

**Pages (16 in sitemap)**
- `/` (home), `/about`, `/services`, `/contact` (Squarespace form), `/blog`
- `/work` index + 8 projects: `funkwerks`, `howdy-beer`, `stem-ciders-brand-development`, `new-planet`, `merch`, `branding`, `content`, `motion-graphics`
- Blog: 2 posts (`portfolio-mockups`, `artsy-baby`)
- `/cart` link in nav but no products → dead ecommerce residue

**Assets**: ~157 images in sitemap (82 jpg, 43 png, 24 gif, 6 jpeg). Heavy GIF use for motion work (42 on motion-graphics page alone). 1 Vimeo embed (funkwerks). All on `images.squarespace-cdn.com`. Two SS site IDs in asset URLs (`6303c11e…`, `64df9e4c…`) → content pulled from an older site, likely inconsistent sizing/formats.

**Design**: Archivo Black (headings) + a Typekit font (body). Pages built from ad-hoc SS blocks (html/image/button/gallery/video) → no consistent project-page template. Titles inconsistent (`— MMT` vs `| Michelle M. Taylor Graphic Designer`). No analytics detected.

**Pain points to fix in rebuild**
- No repeatable project template; each case study hand-laid-out
- GIFs → large, low-quality; should be MP4/WebM loops
- Orphan `/home`, `/cart` URLs; inconsistent metadata
- ~~Two-person "we" voice on about/services~~ → **discovered 2026-09-21: `/about` and `/services` are unedited Squarespace template placeholder copy** ("Alex Agaro", "1.5 billion websites"), not in nav. Not porting them. Nav = Work / Blog / Contact

---

## Guiding principle — keep it simple (decided 2026-09-21)
Small portfolio site. Rules:
- Vanilla CSS w/ custom properties, no Tailwind, no UI libs
- Astro + 3 official integrations max (`mdx`, `sitemap`, `rss`). No React/Vue islands; ≤1 tiny `<script>` for nav toggle/filter
- Two content collections (`work`, `blog`). No third collection — one-off pages are plain `.astro`/`.mdx` files in `src/pages/`
- ~8 components total. If a component is used once, inline it
- No CI beyond the deploy workflow. No Lighthouse CI, dependabot, visual regression, styleguide page
- Content author touches only `src/content/**` + `src/assets/**`. Everything else is "the theme"

## Timeline — launch ≤ 2026-09-28 (7 days, decided 2026-09-21)
| Day | Work |
|---|---|
| 1 (Mon) | Phase 0 scaffold + local dev; Phase 1 asset scrape script running |
| 2 | Phase 2 tokens/components; Phase 3 schemas + routes |
| 3 | Phase 4 ffmpeg batch; port 4 projects |
| 4 | Port remaining projects + blog + about/services/contact |
| 5 | QA, redirects, Lighthouse, link crawl |
| 6 | Buffer / fixes; push to final GH repo, Pages enabled, test at `*.github.io` |
| 7 (Sun) | Cutover: point DNS (at SS for now) → GH Pages, HTTPS, Search Console |

**Scope cuts if behind**: skip tag filter chips (plain grid), skip prev/next. Do NOT cut: redirects, alt text, mobile pass, GIF→MP4 on motion page.
**Domain transfer deferred** (decided 2026-09-21): launch by editing DNS records inside Squarespace (A → GH IPs, `www` CNAME). Registrar transfer = post-launch, Phase 5b moves after Phase 7.

## Phase 0 — Decisions & setup (½ day)
- [x] Stack: **Astro** (static), vanilla CSS (decided 2026-09-21; 11ty/Liquid rejected, Kirby rejected — PHP can't run on GH Pages)
- [x] Host: **GitHub Pages** (decided 2026-09-21). Implications: static only → no server redirects/forms; deploy via `withastro/action` GH Actions; custom domain via `public/CNAME` + DNS
- [ ] GH account: project site works under either account (user site `johndelanetaylor.github.io` doesn't conflict — project repos get their own custom domain). Decide on ownership: Michelle's account or shared org, John = collaborator. Build locally now, push to whichever repo later
- [x] Content editing model: **markdown/MDX in repo** (decided 2026-09-21); CMS UI deferred to Phase 7
- [x] Contact: **`mailto:michmctaylor@gmail.com`** for now (decided 2026-09-21); no form. Obfuscate lightly (JS-assembled href) to cut scraping. Form via Formspree/Web3Forms = Phase 7 optional
- [x] Video: **self-host MP4/WebM** for short loops (GIF replacements); **embed** (Vimeo/YouTube) for long-form (decided 2026-09-21). GH Pages soft limit 1GB repo / 100MB per file → keep loops <5MB, use Git LFS-free approach (compress hard)
- [ ] Analytics: **GA4, post-launch** (decided 2026-09-21) — not in launch scope
- [x] Init: Astro 7 minimal, `.nvmrc`, `.github/workflows/deploy.yml`, `site` set, `public/CNAME`

## Phase 1 — Content extraction (1 day)
- [ ] Squarespace → Settings → Advanced → **Export** (WordPress XML) — optional now, scrape covered it
- [x] `scripts/scrape.mjs` → `raw/<page>/` (gitignored): 220 assets / 184 MB, page.html + text.txt + manifest.json. Originals via `Accept: image/jpeg` header
- [x] 6 project entries in `src/content/work/` w/ frontmatter + body copy ported (galleries still TODO per file)
- [x] Vimeo 478183215 (funkwerks); blog bodies ported via `scripts/blog2md.py` incl. affiliate links
- [ ] Full-page screenshots of every SS page → `reference/` for visual regression / reminders
- [ ] Record all live URLs → `redirects.csv` (old → new)

## Phase 2 — Design system (1–2 days)
- [x] `src/styles/global.css` — tokens from SS palette (orange/yellow/indigo), Archivo Black lowercase headings
- [x] Fonts: **Google Fonts only** (decided 2026-09-21). Keep Archivo Black (headings); pick body from Google (candidates: Archivo, Inter, Work Sans, DM Sans). Self-host via `@fontsource/*` or Astro `fonts` config → no runtime Google request, better perf/privacy. Drop Typekit
- [x] Components (8): `BaseLayout` (head/SEO/nav/footer in one), `Nav`, `Footer`, `ProjectCard`, `VideoLoop` (muted autoplay MP4 + poster, replaces GIFs), `Gallery` (CSS grid, no lightbox), `Vimeo` (plain iframe, lazy), `Figure`. Use Astro's built-in `<Image>` directly
- [x] Case-study layout: hero → meta strip (client/year/services) → MDX body using `Figure`/`Gallery`/`VideoLoop` → 'More work' (3 cards, shared tag)

## Phase 3 — Content collections & templates (2 days)
- [x] `src/content.config.ts`: `work` + `blog` only; zod schemas enforce required fields (hero, alt text, order, featured)
- [x] Blog schema: title, description, pubDate, updatedDate?, hero?, tags[], draft (drafts excluded from build); MDX for embeds; `/blog/[slug]` keeps existing slugs
- [x] Routes: `/`, `/work`, `/work/[slug]`, `/about`, `/services`, `/contact`, `/blog`, `/blog/[slug]`, `/404`
- [x] Home: hero + featured work grid (from `featured: true`) + services teaser + CTA
- [x] Work taxonomy → **revised**: all 8 SS pages are real projects at original slugs (roundup assumption was wrong); tag layer on top. See `docs/work-taxonomy.md` §6
- [x] Contact page: `mailto:` CTA button + optional prefilled `?subject=`; drop SS form; no success page needed
- [x] SEO: title/description/canonical/OG props on `BaseLayout`; one static default OG image; `@astrojs/sitemap`, hand-written `robots.txt`, RSS for blog

## Phase 4 — Asset pipeline (1 day)
- [ ] `ffmpeg` batch: GIF → MP4 (h264) + WebM (vp9), poster frame; keep GIF fallback only if needed
- [ ] Images → `src/assets/work/<slug>/`, Astro image service handles formats/sizes; strip EXIF; enforce max source dimension (~2400px)
- [ ] Alt text pass for every image (schema-required)
- [ ] Sanity check: Lighthouse once on motion page, fix anything egregious

## Phase 5 — Content migration & QA (1–2 days)
- [ ] Port all 8 projects, 2 blog posts, about/services/contact copy **verbatim** — keep existing we/I voice as-is (decided 2026-09-21); copy edit = post-launch
- [ ] Rewrite page titles/descriptions consistently: `<Page> — Michelle M. Taylor`
- [ ] Side-by-side review vs `reference/` screenshots; sign-off checklist per page
- [ ] Cross-browser/mobile pass, keyboard nav, reduced-motion (pause loops), contrast check
- [ ] Broken-link crawl (`lychee`/`linkinator`) on preview build

## Phase 6 — Launch (½ day)
- [x] Redirects: `/home → /`, `/cart → /`, renamed slugs — GH Pages has no 301s → use Astro `redirects` config (emits meta-refresh + canonical pages); acceptable for SEO w/ Search Console change notice
- [ ] Deploy to `<user>.github.io/mmt` first (temp `base`) or preview branch; verify mailto; then flip to custom domain
- [ ] In **Squarespace DNS settings** (domain stays at SS for now): apex A → 185.199.108.153/109/110/111, `www` CNAME → `<account>.github.io`; add `public/CNAME`; enable **Enforce HTTPS** in repo Pages settings; GH auto-redirects apex↔www
- [ ] Submit new sitemap in Google Search Console; verify old URLs 301
- [ ] Keep Squarespace live 2–4 wks as fallback, then cancel — **not before domain transfer done** (Phase 8); export final backup first

## Phase 7 — Post-launch / ongoing
- [ ] `README.md`: how to add a project/post (copy template, drop assets, push)
- [ ] Optional: Decap/Keystatic CMS UI over the markdown if non-dev editing needed
- [ ] Optional: real contact form (Formspree/Web3Forms) replacing mailto
- [ ] GA4: create property, add gtag via Astro `<head>` partial (or Partytown), verify
- [ ] Copy pass: unify we/I voice across about/services/home

## Phase 8 — Domain transfer out of Squarespace (post-launch; ~1–2 wks calendar)
- [ ] Pick registrar (Cloudflare Registrar = at-cost, free DNS; or Porkbun/Namecheap)
- [ ] Pre-check in SS Domains panel: registration not expiring <15 days, no registrar changes in last 60 days (ICANN lock), WHOIS email = one you control
- [ ] **Decouple DNS first**: create zone at new DNS host, copy all records (incl. MX/email!), switch nameservers at SS → site keeps serving from SS meanwhile. Verify email still works
- [ ] Then: SS → Domains → unlock + get **auth/EPP code**, disable privacy if required, initiate transfer at new registrar, approve confirmation email (else waits 5–7 days)
- [ ] After transfer: re-enable lock + WHOIS privacy, set auto-renew, confirm nameservers unchanged
- [ ] Only after transfer completes → cancel SS website plan (domain must be out first or it can be lost w/ account)

---

## Unresolved questions
1. ~~Editing model~~ → markdown in repo (decided)
2. ~~Host~~ → GitHub Pages (decided)
3. ~~Form~~ → `mailto:michmctaylor@gmail.com` (decided)
4. ~~Fonts~~ → Google Fonts (decided). Body face pick: Archivo (pairs w/ Archivo Black) unless you prefer another?
5. ~~Voice~~ → keep mixed for now, edit later (decided)
6. ~~Blog~~ → migrate + keep active (decided)
7. ~~Category pages~~ → moot: all 8 are real projects, ported 1:1. Slugs unchanged. Vanilla Gift = hidden draft (videos live on motion-graphics)
8. ~~SS extras~~ → none believed in use (decided). Double-check in SS panel during Phase 1 export
9. ~~Registrar~~ → transfer out of SS **later** (Phase 8). Registrar TBD (rec: Cloudflare)
13. ~~GH repo owner~~ → `johndelanetaylor/michmctaylor` for now; transfer later (decided 2026-09-22)
10. ~~Video~~ → self-host loops + embed long-form (decided)
11. ~~Launch~~ → ≤ 2026-09-28 (decided)
12. ~~Analytics~~ → GA4 later, Phase 7 (decided)
