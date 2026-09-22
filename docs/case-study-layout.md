# Case-study layout system

Every project page (`src/content/work/*.mdx`) renders through `src/pages/work/[slug].astro` with one fixed skeleton, so pages differ only in content:

```
eyebrow   CLIENT · YEAR
h1        title (lowercase Archivo Black)
lede      summary
hero      16:9 cover (4:3 on mobile), full content width
meta      Client | Year | Services | Disciplines   (rule above)
body      .prose — narrow text (62ch), full-width media, rule above every h2
more work 3 related cards (shared tag)
```

## Body building blocks (import in the MDX)

| Component | Use | Key props |
|---|---|---|
| `## heading` | one per section; lowercase | – |
| paragraph | 1–3 sentences per section, max | – |
| `<Gallery>` | 2+ media in a **uniform-tile** grid | `cols` 2–5 (default 3), `ratio` (default `"1"`), `fit` `cover`\|`contain`, `caption`, `images=[{src,alt} \| {video,alt}]` |
| `<Figure>` | single image | `ratio`, `fit`, `caption` |
| `<VideoLoop>` | single loop (or `controls` for long-form) | `ratio`, `fit`, `caption`, `controls` |
| `<Vimeo>` | embed | `id`, `title`, `caption` |
| `<div class="grid grid--2">…</div>` | two Figures/loops side by side, each w/ own caption | – |

## Rules of thumb
- **Group by aspect ratio.** Squares in one `Gallery ratio="1"`, stories in `ratio="9/16"`, slides in `ratio="16/9"`, portrait photos `ratio="4/5"`. Never mix tall + square in one grid.
- **Pick `cols` so the last row is full** (6 → 3, 8 → 4, 10 → 5, 24 → 4). A 2-item 9:16 gallery in `cols={4}` is fine (reads as a phone lineup).
- **`fit="contain"`** for product renders / logo sheets on white; **`cover`** for photography.
- **Captions live on the media** (`caption` prop), not as a trailing paragraph.
- Text stays in the 62ch measure; media goes full width. Don't wrap text in columns.
- GIFs never ship: `scripts/gif2mp4.sh <slug>` → `/video/<slug>/<name>.mp4`.
