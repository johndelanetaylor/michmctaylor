# Work section taxonomy — Hybrid model (Option C)

Decided 2026-09-21. Reference for how `/work` is structured, why, and how to add/maintain content.

> **Revised 2026-09-21 (afternoon):** the original analysis below assumed `branding`, `content`, and `motion-graphics` were cross-client *roundups* of other projects' assets. Inspecting the scraped pages showed that's wrong — each has its own unique work (24 illustrations; 6 identity systems; 14 animations). **All 8 original Squarespace pages are now first-class projects at their original slugs.** No redirects, no separate reel page, no `reels` collection. What survives from the plan: the tag vocabulary, `/work/tag/[tag]` pages, auto "more work", and one MDX-per-project. Sections 1–5 below are kept for history; **Section 6+ is current.**

## 1. The problem this solves

Squarespace site had 8 pages under `/work/*`, but they were two different things sharing one namespace:

| Kind | Old URLs | Nature |
|---|---|---|
| Client case studies | `funkwerks`, `howdy-beer`, `new-planet`, `stem-ciders-brand-development`, `merch` | One client/body of work, sections per deliverable |
| Discipline roundups | `branding`, `content`, `motion-graphics` | Hand-curated cuts of the *same* assets across clients |

Costs: duplicate content, hand-wired + asymmetric "related" links, adding a project meant editing up to 3 roundup pages, and the work grid mixed apples/oranges.

## 2. The model

**Projects are the only source of truth.** Everything else is derived from tags — except one hand-written reel page for motion.

```
src/content/work/           ← collection: one .mdx per project
  funkwerks.mdx
  howdy-beer.mdx
  new-planet.mdx
  stem-ciders-brand-development.mdx
  merch.mdx
  vanilla-gift.mdx          ← stub, owns its motion clips
src/pages/work/motion.mdx   ← the ONE curated page. Plain MDX, not a collection
```

Simplicity rule: no second collection for reels. If a second curated page is ever needed, add another `.mdx` in `src/pages/work/`.

### 2.1 Tags (fixed vocabulary)

Enforced by zod enum so typos fail the build.

| tag | label | notes |
|---|---|---|
| `branding` | Branding | logo, identity, rebrand |
| `packaging` | Packaging | cans, labels, boxes |
| `motion` | Motion | any animated deliverable |
| `content` | Content Creation | social, photo, video shoots |
| `merch` | Merch | apparel, swag |
| `print` | Print | collateral, POS, environmental |
| `digital` | Digital | web, email, ads |

Add a tag = edit the enum in `src/content.config.ts` + label map in `src/lib/tags.ts`. Nothing else.

### 2.2 `work` schema

```ts
// src/content.config.ts
const work = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/work' }),
  schema: ({ image }) => z.object({
    title: z.string(),                 // "Funkwerks"
    client: z.string(),                // "Funkwerks Brewing" | "Various" (for merch)
    summary: z.string().max(200),      // card + meta description
    year: z.number().int(),            // or range as string if needed
    tags: z.array(Tag).min(1),
    services: z.array(z.string()),     // free-text meta strip: "Packaging design", "Brand dev"
    hero: image(),
    heroAlt: z.string(),
    featured: z.boolean().default(false), // shows on home
    order: z.number().default(99),     // sort on /work (lower = first)
    draft: z.boolean().default(false),
  }),
});
```

Body = MDX using layout components (`<Section>`, `<TwoUp>`, `<Grid cols={3}>`, `<VideoLoop>`, `<Gallery>`, `<Vimeo id="..." />`).

### 2.3 The motion reel page (`src/pages/work/motion.mdx`)

Plain MDX page using `BaseLayout`. Intro copy, then hand-ordered sections — each section = client heading + a few `<VideoLoop>`s + link to the case study. Bottom: `<ProjectGrid tag="motion" />` auto-lists every project tagged `motion`.

Curation = editing this file. Clips live in `public/video/<project>/` and are referenced by path from both the project's own page and this reel — no duplication of files, just of references.

## 3. URL map

| URL | Source | Notes |
|---|---|---|
| `/work` | `pages/work/index.astro` | All projects, `order` asc. Tag links (plain `<a>` to `/work/tag/x`, no JS filter needed). Motion reel gets one distinct card/link |
| `/work/[slug]` | `pages/work/[slug].astro` ← `work` | Case study. Footer: "More {tag}" = other projects sharing ≥1 tag, auto, max 3; + prev/next by `order` |
| `/work/tag/[tag]` | `pages/work/tag/[tag].astro` | Static tag page. Lists projects w/ that tag. For `motion`, a one-line link to `/work/motion` |
| `/work/motion` | `pages/work/motion.mdx` | Curated reel (see 2.3) |

**Collision rule**: a static file in `src/pages/work/` wins over `[slug].astro` in Astro's routing, so never name a project `motion`.

## 4. Redirects (old → new)

Configured in `astro.config.mjs` `redirects` (GH Pages has no server 301s → emits meta-refresh pages w/ `<link rel=canonical>`).

```js
redirects: {
  '/home': '/',
  '/cart': '/',
  '/work/branding': '/work/tag/branding',
  '/work/content':  '/work/tag/content',
  '/work/motion-graphics': '/work/motion',
  '/work/stem-ciders-brand-development': '/work/stem-ciders', // only if slug shortened; else keep
}
```

Keep client slugs unchanged unless there's a strong reason (`stem-ciders-brand-development` is the only awkward one — shortening is optional).

## 5. Mapping old content → new

| Old page | Becomes | Action |
|---|---|---|
| `/work/funkwerks` | `work/funkwerks.mdx` — tags `[branding, packaging, motion, print]` | Port. Vimeo 478183215 → `<Vimeo>`. 10 GIFs → `motion[]` MP4s |
| `/work/howdy-beer` | `work/howdy-beer.mdx` — `[packaging, branding, print, content, motion]` | Port |
| `/work/new-planet` | `work/new-planet.mdx` — `[branding, packaging]` | Port |
| `/work/stem-ciders-brand-development` | `work/stem-ciders.mdx` — `[branding, digital, content, motion]` | Port; redirect old slug |
| `/work/merch` | `work/merch.mdx` — `client: Various`, `[merch, content, motion]` | Port as a project |
| `/work/branding` | **deleted** → `/work/tag/branding` | Auto-lists Funkwerks + New Planet (+ any tagged). Any unique intro copy → drop or move to `/services` |
| `/work/content` | **deleted** → `/work/tag/content` | Auto-lists Howdy + Merch. Same copy rule |
| `/work/motion-graphics` | `pages/work/motion.mdx` → `/work/motion` | Port intro copy. 42 GIFs → convert to MP4, file under owning project's `public/video/<slug>/`, hand-order sections: Stem, Howdy, Funkwerks, Vanilla Gift*, Merch |

\* **Vanilla Gift** appears only on the motion page, no case study exists → create a minimal `work/vanilla-gift.mdx` (tags `[motion]`, short summary, 1 hero) so its clips have an owner and it shows on `/work/tag/motion`.

## 6. Current model (authoritative)

- `src/content/work/*.mdx` — 8 projects (+ `vanilla-gift.mdx`, `draft: true`, kept for its two videos which are also embedded in `motion-graphics.mdx`)
- Slugs = original Squarespace URLs: `stem-ciders-brand-development`, `motion-graphics`, `merch`, `content`, `howdy-beer`, `funkwerks`, `branding`, `new-planet`
- `order` = live grid order (10…80). `featured: true` on all 8 → home grid
- `card` (optional) = grid thumbnail when it differs from `hero` (motion, funkwerks, new-planet do)
- Multi-client pages use `client: Various`
- Tags → `/work/tag/[tag]` static pages + chips on `/work`; "more work" on each project = other projects sharing a tag
- Redirects in `astro.config.mjs`: only `/home` and `/cart`

## 7. How-to: add a new project

1. `cp src/content/work/_template.mdx src/content/work/<slug>.mdx`
2. Fill frontmatter; drop assets in `src/assets/work/<slug>/`, videos in `public/video/<slug>/` (MP4 + WebM + poster; see `docs/video.md`)
3. Pick `tags` from the enum; set `order`; `featured: true` if it should be on home
4. If it has motion clips: run `scripts/gif2mp4.sh <slug>`, reference `/video/<slug>/<name>.mp4` via `<VideoLoop>` or a Gallery `{ video }` item, tag it `motion`
5. `npm run dev` → check `/work`, `/work/<slug>`, tag pages. Build fails loudly on bad tag/missing alt
6. PR → preview → merge → GH Action deploys

That's it — no roundup pages to edit, related links are automatic.

## 8. Decisions log

- 2026-09-21 pm — **Superseded Hybrid C.** All 8 SS pages are real projects; ported 1:1 at original slugs. Tag layer kept.

- 2026-09-21 — Hybrid chosen over pure-tags (A) or all-curated (B). Motion is the only discipline where cross-client viewing beats per-client; branding/content roundups were 2 projects each = pure duplication.
- 2026-09-21 — `merch` stays a project (`client: Various`) rather than dissolving into a tag; it has real standalone content.
- 2026-09-21 — Simplified: no `reels` collection; motion reel = one plain MDX page. Tag filtering = static pages + links, no client JS.
- Default: keep `stem-ciders-brand-development` slug (no redirect needed). Vanilla Gift = stub project.
