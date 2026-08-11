# varunmalhotra.net

Varun Malhotra's portfolio. Static site, zero client-side framework, built with
[Astro](https://astro.build).

**Live:** https://varunmalhotra.net

## Stack, and why

- **Astro, `output: "static"`.** The site is five pages and three case studies — there is
  no state that needs a server, so static HTML served from Cloudflare's edge is both the
  fastest option and the free one. Switching to SSR would start costing money and buy
  nothing until there's a live demo to serve.
- **Zero framework JS by default.** No React, Vue, or Svelte is registered as an Astro
  integration. The metric counters are CSS `@property` animations; the one interactive
  piece — the ReAct trace simulation on the Talk to Data case study — is plain CSS and
  vanilla `<script>`, not a component island. Every byte of client JS on this site was a
  deliberate decision, not a framework default.
- **Tailwind v4 (CSS-first `@theme`)** for design tokens, **Spectral** for reading text,
  **Archivo** for interface chrome, **Martian Mono** for figures only. See
  `.design/DIRECTION.md` for the full rationale — the site's visual language is "a
  contemporary scientific offprint," deliberately not the dark/near-black-plus-accent
  look that reads as an AI default.

## Content model

Every fact on the site is meant to be true, sourced, and traceable to one of two places:

- **`src/data/profile.ts`** — name, roles, education, publications, awards, headline
  metrics. The single source of truth for anything that isn't a case study. It is written
  to stay in sync with a private LaTeX resume repo: if a number changes, it changes in
  both places in the same commit.
- **`src/content/work/*.md`** — one Markdown file per case study, validated against a Zod
  schema in `src/content.config.ts`.

The schema is the enforcement mechanism, not a style guide. It requires, on every case
study:

- `problem` (min 80 chars) — so a case study has to open with what was broken, not with
  the technology used to fix it.
- `metrics[].basis` on every metric — so no number appears without a citation for where it
  came from (a benchmark, a stakeholder report, a measured cost). This is also the site's
  visual signature: every metric's basis renders as a margin note keyed by a superscript
  anchor, in the apparatus rail.
- `tradeoff` and `wouldChange` (min 60 chars each) — so the honest, harder-to-write parts
  of a case study (what the design cost, what you'd build differently now) can't be
  quietly dropped.

If any of these are missing, `npm run build` fails. The schema is deliberately not
loosened to make a case study easier to write — the fix is to write the missing part.

## The no-JS contract

The site is required to render **complete and factually correct with JavaScript
disabled.** This isn't a progressive-enhancement nicety; it's load-bearing for the site's
central claim. Two earlier design directions were rejected specifically because their
hero and metric strip depended on JS running: with it off, one displayed "0 analysts
served, 0% accuracy" — a portfolio that shows wrong numbers is worse than one that shows
none.

`scripts/check-nojs.mjs` enforces this against the built output: it strips every
`<script>` tag from the built HTML and asserts the real figures, metric bases, and the
Fig. 1 trace steps are still present in the markup. `scripts/check-content.mjs` enforces a
related set of rules — no leaked internal design vocabulary, no HTML comments, no
placeholder text, unique per-page titles and descriptions, and no wording that overstates
Varun's role on the Talk to Data project (see `CLAUDE.md` for why that one in particular is
a hard rule, not a style preference).

## Running locally

Requires Node 24 and npm.

```bash
npm install
npm run dev        # dev server on :4321
npm run build      # static build -> dist/
npm run preview    # serve dist/ locally
```

Astro 7 runs the dev server detached — use `astro dev stop` / `astro dev status` /
`astro dev logs` to manage it.

There is no unit test suite; the content schema and the checks below are the tests.

## CI

`.github/workflows/ci.yml` runs on every push to `main`/`master` and on every pull
request, as two jobs:

1. **Build, types, content and no-JS gates** — `npx astro check` (type errors fail the
   build), `npm run build`, then `scripts/check-content.mjs` and `scripts/check-nojs.mjs`
   against the built output.
2. **Accessibility** — `npm run check:a11y` serves `dist/` with `astro preview` and runs
   [pa11y-ci](https://github.com/pa11y/pa11y-ci) against every page against WCAG2AA,
   failing on any error-level violation. pa11y-ci drives Chromium via
   [puppeteer](https://pptr.dev), which installs its own browser binary on `npm ci` —
   this was chosen deliberately over `@axe-core/cli`, whose default driver (Selenium +
   chromedriver) depends on a system-installed Chrome and hangs indefinitely rather than
   failing fast when one isn't present.

Locally, `npm test` runs the build-and-gate sequence (build, content, no-JS, types) in
one command; `npm run check:a11y` is separate because it needs a running preview server.

## Adding a new case study

1. Add a Markdown file under `src/content/work/`, matching the frontmatter shape in
   `src/content.config.ts` (see an existing file, e.g. `talk-to-data.md`, for the pattern).
   The build will fail with a clear error if a required field — `problem`, a `basis` on
   every metric, `tradeoff`, or `wouldChange` — is missing.
2. Set `order` to control its position in the work listing.
3. If any figure in the new case study also needs to change something on the home page
   (the headline strip, the plotted results), update `src/data/profile.ts` and
   `src/pages/index.astro` in the same commit — the home page pulls case-study metrics by
   label rather than duplicating numbers by hand.
4. Every number in the case study must match the private resume repo (`../Resume`). If a
   number changes, it changes in both places in the same sitting.
5. Run `npm test` before opening a PR — it builds and runs the content-integrity and
   no-JS gates the same way CI does.

## License

MIT — see `LICENSE`. The code is MIT-licensed; the content (Varun's resume facts, case
study writing) describes one specific person's work history and isn't a template to reuse
as-is.
