## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)

## Project conventions (mmt portfolio)

- Keep it simple: vanilla CSS, no UI libs, no framework islands. See `PLAN.md` "Guiding principle".
- Content lives in `src/content/work/*.mdx` and `src/content/blog/*.md`; images in `src/assets/`; video loops in `public/video/`.
- Video: GIFs are never committed. Drop a GIF in `src/assets/work/<project>/`, run `scripts/gif2mp4.sh <project>`, reference `/video/<project>/<name>.mp4` via `<VideoLoop>` or a Gallery `{ video }` item, delete the GIF. Needs `ffmpeg` (brew).
- Project page structure + media components: `docs/case-study-layout.md`. Group media by aspect ratio; captions via `caption` prop.
- Tag vocabulary: `src/lib/tags.ts` only. Work taxonomy explained in `docs/work-taxonomy.md`.
- `raw/` = scraped Squarespace source (gitignored). Re-run `node scripts/scrape.mjs` to refresh.
- Be extremely concise in commits and replies.
