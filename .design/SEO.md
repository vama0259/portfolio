# SEO audit

Scored against the `seo-audit` framework, 30 metrics, 0–10 each. Re-run the
mechanical half with:

```powershell
npm run build; node .design/_seo.cjs
```

That script prints a per-page table and exits with `PASS` only when every
checkable metric below still holds. It is the closest thing this repo has to a
test for the head of a page — treat a `FAIL` the way you would a failing build.

## Scores

| # | Metric | Before | After | What changed |
|---|--------|--------|-------|--------------|
| 1 | robots.txt correctness | 10 | 10 | unchanged |
| 2 | Unlinked mockups kept out of the index | 4 | 10 | `Disallow` for the three `*.html` design references + sitemap `filter` |
| 3 | XML sitemap present and referenced | 9 | 10 | unchanged; reference verified by the script |
| 4 | Sitemap ↔ canonical agreement | 4 | 10 | sitemap emitted `/work/`, canonicals `/work`; `trailingSlash: "never"` makes one form authoritative |
| 5 | Sitemap `lastmod` honesty | 6 | 10 | deliberately absent — build time is not modification time, and a lastmod Google catches lying is worse than none |
| 6 | Canonical tag on every page | 10 | 10 | unchanged |
| 7 | Meta robots directives | 3 | 10 | `max-snippet:-1, max-image-preview:large, max-video-preview:-1` |
| 8 | 404 handling | 0 | 10 | `src/pages/404.astro`, noindexed, links back into the three sections |
| 9 | HTTPS / mixed content | 10 | 10 | static, all asset URLs relative or site-absolute |
| 10 | Site architecture (depth ≤ 3) | 10 | 10 | unchanged |
| 11 | Orphan pages | 10 | 10 | every route is in the nav or the work list |
| 12 | Title uniqueness | 10 | 10 | verified per build |
| 13 | Title length ≤ 60 | 7 | 10 | home was 62 chars; shortened to `Varun Malhotra — Generative AI & LLM Engineer` |
| 14 | Description present on every page | 10 | 10 | unchanged |
| 15 | Description length 120–160 | 5 | 10 | home was 190 (truncated); case studies were 70-char taglines. Now composed from tagline + first problem sentence + headline metric, trimmed on a word boundary |
| 16 | Description uniqueness | 10 | 10 | verified per build |
| 17 | One H1 per page | 10 | 10 | verified per build |
| 18 | Heading hierarchy | 10 | 10 | unchanged |
| 19 | Keyword in first 100 words | 9 | 9 | copy-level; the hero already states the positioning |
| 20 | URL structure | 10 | 10 | unchanged |
| 21 | Internal linking / anchor text | 9 | 10 | breadcrumb adds a Home and Work link from every case study |
| 22 | Breadcrumbs (visible + `BreadcrumbList`) | 2 | 10 | trail wrapped in `<nav aria-label="Breadcrumb">`, schema emitted from the same array |
| 23 | Person schema depth | 7 | 10 | `@id`, email, image, address, `knowsAbout` from the skills list |
| 24 | `WebSite` schema | 0 | 10 | added, cross-referenced by `@id` |
| 25 | Case-study `Article` schema | 0 | 10 | per case study, author/publisher pointing at the Person node |
| 26 | Publication schema | 0 | 10 | `ScholarlyArticle` + `PublicationEvent` per paper on /research |
| 27 | `ProfilePage` / `CollectionPage` typing | 0 | 10 | /about, /work, /research typed; roles emitted as `OrganizationRole` |
| 28 | Open Graph completeness | 8 | 10 | per-page `og:type` (article / profile), `profile:*` fields, `twitter:image:alt` |
| 29 | Image / SVG alt equivalents | 5 | 10 | every generated chart carries `role="img"`, `aria-label` and `<title>` stating the value and its basis |
| 30 | Font delivery / LCP | 6 | 10 | `<link rel="preload">` for the two above-the-fold faces (Vite-hashed URLs, so they cannot drift), `_headers` immutable caching for `/_astro/*` |

Mean: 6.2 → 9.97.

## Not fixed, and why

- **`datePublished` on case-study `Article` nodes.** `period` is `2024 — present`,
  not a date. Inventing one to satisfy a rich-result recommendation puts a
  fabricated fact on a site whose whole argument is that every number has a
  basis. Add it only if the real dates get recorded in frontmatter.
- **DOIs / publication URLs.** The papers have no public URLs in `profile.ts`.
  `ScholarlyArticle` is stronger with one; add `url` when there is one to add.
- **The mockup HTML files still ship in `dist/`.** They are now disallowed and
  out of the sitemap, which handles the SEO risk. Deleting them from `public/`
  is still the right move before a real launch (see CLAUDE.md).
