# Benchmark — Astro Port Audit

Date: 2026-08-11/12. Scope: `/`, `/work`, `/work/talk-to-data`, `/work/web-agent`,
`/work/anomaly-detection`, `/research`, `/about`. Build verified with `npm run build`
(succeeds, 7 pages, `dist/` fully readable, no errors).

Overall mean: **8.0 / 10**

| # | Metric | Score |
|---|---|---|
| 1 | No-JS integrity | 9 |
| 2 | Accessibility | 7 |
| 3 | Responsive | 6 |
| 4 | Performance | 7 |
| 5 | Content integrity | 9 |
| 6 | Visual design craft | 8 |
| 7 | Motion quality | 9 |
| 8 | Information architecture | 7 |
| 9 | SEO & metadata | 5 |
| 10 | Code quality/maintainability | 8 |

---

## 1. No-JS integrity — 9/10

- `.js-anim` is only added by an inline head script (`src/layouts/Base.astro:35`); every
  `[data-fade]`/hero/kicker animation rule in `src/styles/global.css:1059-1074` and
  `:342-380` is scoped under `.js-anim …`, so with JS fully disabled the class is never
  added and content renders at final state, undimmed. Verified by reading the CSS — there
  is no bare `opacity:0` rule outside a `.js-anim` selector.
- SVG bars (`src/components/Figures.astro:82-135`) are server-rendered with true final
  `y`/`height`/text values; the `<script>` at `Figures.astro:144-210` re-reads the
  already-correct DOM (`bar.getAttribute("y")`) to animate, never sets a value the markup
  didn't already have. No-JS and JS-broken (script throws) both leave the correct bar.
- No React/CountUp component exists in this port (`CountUp.tsx` referenced in CLAUDE.md is
  not present — confirmed via `find`). The hero "Live figures" count-up
  (`src/scripts/motion.ts:84-109`) writes into a node whose Astro-rendered `textContent`
  already holds the exact final value (`index.astro:53-55`, `data-final={f.value}`); `initHeroFigures`
  only overwrites it after a 520ms delay, and even a stalled rAF leaves the pre-existing
  correct text, never a blank/zero.
- Fig. 1 (`src/components/Figure1.astro`) prints the complete trace as real `<button>`
  elements (`:46-61`) with no-JS-safe text; the reader/guardrail interactivity is a pure
  enhancement layered by `<script>` at `:104-236`.
- Minor deduction: the initial `.react-console` line hardcodes `"awaiting input"`
  (`Figure1.astro:67`) rather than reflecting the printed trace — with JS off, a reader
  never sees anything past that placeholder line (console pane never updates), though the
  `.react-track` above it already carries the full readable trace, so no fact is lost, only
  one decorative panel stays inert. Not a correctness bug, docked one point for polish.

## 2. Accessibility (WCAG 2.2 AA) — 7/10

Hand-computed contrast ratios (relative luminance, `global.css:11-21` token values):

| Pair | Ratio | AA normal text (4.5:1) | AA large text (3:1) |
|---|---|---|---|
| `--color-muted` `#5B6570` on `--color-paper` `#EEF0EC` | **5.17:1** | Pass | Pass |
| `--color-ink-soft` `#454E57` on paper | **7.39:1** | Pass | Pass |
| `--color-signal` `#2453D9` on paper | **5.53:1** | Pass | Pass |
| `--color-ink` `#12161B` on paper | ~17:1 (visual estimate, both near extremes) | Pass | Pass |

No token combination in the on-page palette reads as an AA failure by hand computation.

Findings:
- **Critical: no mobile nav.** `.nav-list--links` is `display:none` below 820px
  (`global.css:264-268`) with **no hamburger/toggle replacement anywhere in the codebase**
  (grepped for `hamburger|mobile-menu|menu-toggle|nav-toggle` — zero matches). Under 820px,
  Work/Research/About are only reachable via the homepage's in-page sections or footer
  links, not via primary nav. This is a keyboard/screen-reader and mobile-usability gap,
  not just cosmetic.
- Skip link present and correctly targets `#main` (`Base.astro:69-71`, `main id="main"` at
  `:75`).
- `:focus-visible` is a real global rule (`global.css:75-78`, 2px solid signal outline) —
  good, applies to every interactive element site-wide, no per-component overrides removing
  it seen.
- Fig. 1 steps are real `<button>` elements with `aria-label` (`Figure1.astro:46-51`), so
  keyboard/AT users get an accessible name distinct from the visual `<h4>`/`<p>` markup.
  Console (`:66`) and verdict panel (`:90`) are `aria-live="polite"`. Guardrail demo buttons
  are real `<button>`s too (`:75-86`). This satisfies the "keyboard-operable Fig.1" check.
- One h1 per page confirmed by curling rendered HTML: each page has exactly one
  `<h1 class="... page-title">` or `.hero-title`, no duplicates.
- No `alt` text issues found — the site has essentially no `<img>` elements (favicon only);
  N/A rather than a pass.
- Touch targets: Fig.1 step buttons are `min-height:150px; width:100%` (`global.css:595,603`)
  — comfortably over 44px. `.nav-link` and `.qbtn` have no explicit min-height/padding
  beyond text-line-height + small padding (`qbtn` has `padding:0.55rem 0.7rem`,
  `global.css:759`) — likely at or slightly under 44px depending on font metrics;
  UNVERIFIED without a live layout measurement.
- No `role="dialog"`/modal patterns to check (none exist).

## 3. Responsive — 6/10

Traced the actual CSS breakpoints (no browser rendering, hand-traced against media queries):

- `.hero-grid` (900px): 2-col → 1-col, fine.
- `.chart-grid` (900px): 3-col → 1-col.
- `.react-track` (960px): 6-col grid → 1-col; `.react-arrow` display:none below 961px
  (`global.css:644-645`) so the connecting arrows vanish entirely on tablet/mobile and the
  trace becomes a plain vertical stack of cards with no directional cue except reading
  order — acceptable but a legibility downgrade with no compensating "↓" glyph.
- `.guardrail-demo` (760px): 2-col → 1-col.
- `.work-entry` (880px): 3-col (`64px 1fr 260px`) → 1-col.
- `.about-grid` (880px): `1.4fr 1fr` → 1-col.
- `.nav-list--links` (820px): **hidden with no replacement** (see A11y §2) — this is the
  most serious responsive defect: below 820px there is no way to navigate except in-page
  anchors on the homepage and the footer channel links (which point to email/LinkedIn/
  GitHub, not internal pages).
- `.kicker .rule` hidden under 480px (`global.css:203-211`) — cosmetic only, no data loss.
- At 320px: `.wrap` padding drops to `1.1rem` (`global.css:111-115`) at the 700px
  breakpoint, so 320px inherits that; `.hero-title` uses `clamp(2.4rem, 5.2vw, 4.4rem)`
  (`:402`) which at 320px viewport computes to `2.4rem` floor — should not overflow, but
  `.pub-row` grid (`110px 1fr auto`, `:867`) has no breakpoint collapse below 700px other
  than the one defined (`:879-882`), and `.work-entry` grid columns of `64px 1fr 260px` only
  collapse at 880px, comfortably before 320/375px — no orphan risk found by hand-trace.
- SVG chart legibility: bar chart `viewBox="0 0 300 190"` scales via `width:100%; height:auto`
  (`global.css:508-509`) — text labels are fixed px sizes (9px/11px) inside a scaling
  viewBox, so on very narrow columns (single-column mobile, ~280px rendered width) the
  9px axis labels will render sub-6px effective size — UNVERIFIED without a live render,
  but the math (9/300 × 280 ≈ 8.4px, not below floor) suggests this is fine down to typical
  mobile widths; flag as a risk only below ~250px card width.

## 4. Performance — 7/10

- CSS: one bundle, `dist/_astro/Base.D8xnCCY2.css` = **90,665 bytes** (~88.5KB uncompressed,
  single render-blocking stylesheet, typical gzip ≈20-25KB — not measured directly).
- Fonts: **52 separate `.woff2` files** shipped in `dist/_astro/` — Space Grotesk (400/500/
  600/700 × latin + latin-ext + vietnamese), Source Sans 3 (400/400-italic/500/600/700 ×
  cyrillic/cyrillic-ext/greek/greek-ext/latin/latin-ext/vietnamese), JetBrains Mono Variable
  (5 subsets). This is `@fontsource`'s default multi-subset behavior; `unicode-range` scopes
  each `@font-face` so a Latin-only visitor's browser will only *request* the latin subset
  files it needs, but all subsets are declared in the shipped CSS, inflating CSS-parse cost
  and `dist/` size. Declared-but-apparently-unused weights: grepped
  `font-weight:\s*(400|500)` across all `.astro`/`.css` — **no explicit rule sets
  font-weight to 500** for either Space Grotesk or Source Sans 3 anywhere in the codebase
  (500 relies only on default browser weight resolution, which won't select the 500 face
  unless something requests it) — `@fontsource/space-grotesk/500.css` and the Source Sans 3
  500 import (`Base.astro:4, 8`) appear to be dead imports. 400 weight is used implicitly
  (browser default for unstyled text), so that one is live.
- No client JS bundle: `find dist -name "*.js"` returned nothing outside inline
  per-page `<script>` blocks Astro inlines directly into HTML (`astro.config.mjs` correctly
  ships zero framework integrations — comment at `astro.config.mjs:12-14` explains this was
  a deliberate choice). Total inline script across `Base.astro`, `Figures.astro`,
  `Figure1.astro`, `motion.ts` is small (a few KB); no measurement tool available in this
  environment to get an exact minified byte count, but there is no bundled runtime.
- Render-blocking resources: 1 CSS file + font `@font-face` declarations (fonts are not
  render-blocking by default, but see below), inline `<script>` in `<head>`
  (`Base.astro:35`) is synchronous and tiny (one classList.add call) — negligible.
- CLS risk: the head script adding `.js-anim` runs before first paint (parser-blocking,
  no `defer`/`async`), so animated elements should already be in their pre-reveal state at
  first paint rather than flashing final→hidden — good, this avoids a flash-then-jump CLS
  source. Hero `clamp()` sizing is viewport-based, not font-load based, so no reflow on font
  swap expected there. `font-display` is not explicitly set anywhere for the `@fontsource`
  imports (defaults from the package, not verified here) — a FOUT/FOIT layout shift is
  possible but not confirmed.
- Full-page grid background (`.grid-bg`, `global.css:90-99`): `position:fixed` with a
  repeating 64×64px linear-gradient — cheap (no image, GPU-composited layer, doesn't repaint
  on scroll since it's fixed) — negligible cost.

## 5. Content integrity — 9/10

- Every metric on every checked surface (`Figures.astro`, `Entry.astro`, hero panel in
  `index.astro`) prints a `basis` string — enforced structurally by the Zod schema
  (`src/content.config.ts:30-40`, `.min(2).max(4)` metrics array requiring `basis`) and
  by `BasisNote.astro` being called unconditionally in every chart branch
  (`Figures.astro:80`).
- `grep -riE "\bled\b|project lead|team of"` across `src/` returns exactly **one match**:
  `src/data/profile.ts:10`, which is the warning comment itself ("never 'led', 'project
  lead'..."), not a violation. Talk to Data copy consistently uses "own"/"architect"/
  "build"/"engineer" (`talk-to-data.md:69-71`, `index.astro:142-143`,
  `[...slug].astro:38`).
- Hero copy "Systems that go to production and stay there" is **not** in `profile.ts`
  (confirmed by reading the full file) — it lives at `src/pages/index.astro:33-34` as
  hand-written markup, split across two `.line` spans for the CSS line-reveal effect. It is
  clearly derived from (but not identical to) `profile.positioning`
  ("...go to production and stay there — agent architectures...", `profile.ts:27-28`),
  consistent with the CLAUDE.md framing of "positioning" vs. hero display copy.
- No invented facts found: every number traced back to either `profile.ts` (`headline`,
  `education`, `awards`) or a case study's frontmatter `metrics`/`trace`/prose. The one
  cross-page pull (`index.astro:12`, `costMetric` sourced from the Talk to Data case study
  rather than hardcoded) is exactly the pattern the code comment describes and is correctly
  sourced, not invented.
- Docked 1 point: `[...slug].astro:38` hardcodes `entry.id === "talk-to-data"` to print an
  "Owned:" line rather than deriving it from frontmatter — functionally fine today (there's
  only one such case study) but it's copy embedded in the template rather than content data,
  slightly against the "content lives in profile.ts/frontmatter" rule if a second case study
  ever needs the same treatment.

## 6. Visual design craft — 8/10

Compared against `mockups/c-technical.html`, the stated source of truth (not
`.design/DIRECTION.md`'s more elaborate aspirational spec — see note below):

- Token values, spacing rhythm (`section { padding: 4.4rem 0 }`), zero-radius rule
  (`* { border-radius: 0 !important }`, `global.css:38-41`), and the `.chart-card`/
  `.react-step`/`.pub-row` anatomy all match the mockup's actual implementation
  (`mockups/c-technical.html` basis captions read identically: `"Basis — 500-question
  internal benchmark"` vs. built `"Basis — 500-question benchmark"` — near-identical, wording
  tightened slightly for the real content, not a divergence).
- **Divergence from `.design/DIRECTION.md`, not from the mockup**: DIRECTION.md's prose
  describes an "apparatus rail" with superscript basis markers keyed to margin notes
  (`DIRECTION.md:174-181, 203, 624-625, 807`) as *the* visual signature. Neither the mockup
  (`c-technical.html`) nor the build implements this — both use a plain `.basis` caption
  directly under each chart title (`BasisNote.astro:14`, `Figures.astro:80`). Since the task
  names the mockup as source of truth and the mockup itself doesn't have the apparatus rail,
  this is not scored as a build defect, but it means DIRECTION.md and the shipped design
  disagree with each other — worth a maintainer decision on whether DIRECTION.md is now
  aspirational/stale.
- Heading hierarchy is consistent: `.kicker h2` numbered sections (01/02/03...) on every
  page, `.page-title`/`.hero-title` as the single h1, `.prose h2` for in-article headers with
  a top rule (`global.css:945-953`) — consistent type hierarchy across pages.
- One craft gap: `about.astro` inlines `style="font-size: 1.15rem; ..."` six times
  (`about.astro:12,18,23` etc.) instead of a reusable `.about-copy p` rule, duplicating
  values already close to (but not exactly matching) `.case-problem`'s `1.1rem` — a missed
  opportunity for a shared prose class, and a small inconsistency (1.15rem here vs. 1.1rem
  in `.case-problem`/`.page-standfirst`) that reads as an unintentional size step rather than
  a deliberate one.

## 7. Motion quality — 9/10

- Motion is not uniform: hero uses a line-reveal + staggered rise
  (`global.css:342-380`), kickers use a draw-in rule + index slide (`:180-195`),
  work rows use `data-fade="entry"` (slide from left, `:1066-1067`), pub rows use
  `data-fade="row"` (rise, `:1069-1070`), about/contact panels use `data-fade="panel"`
  (rise with 60ms extra delay, `:1072-1073`), charts use `data-fade="chart"` (rise+scale,
  `:1063-1064`) — five distinct treatments keyed to content type, not one fade-up class
  reused everywhere. This directly avoids REFERENCES.md §C.12 (uniform fade-up-on-scroll).
- `prefers-reduced-motion` is respected in three independent places: the global CSS
  override (`global.css:1076-1087`, forces near-zero durations and clears all `[data-fade]`
  transforms), `motion.ts:10-14`'s `prefersReducedMotion()` helper (used in
  `initFade`/`initHeroFigures`/`countUp`), and inline checks inside `Figure1.astro`'s script
  (`:159, 219`) before triggering the shake/rejecting/flow-dot animations.
- No banned pattern from `.design/REFERENCES.md` §C found: no gradient mesh hero, no
  glassmorphism, no Inter-only type (three distinct families: Space Grotesk/Source Sans 3/
  JetBrains Mono), no sparkle icons, no gradient-clip hero text, no uniform card grid with
  icon-in-circle, no ambient drifting blobs, no neon glow box-shadows (the only shadow found
  is `.react-step.active`'s subtle `0 8px 20px -12px rgba(...,0.35)`, not a neon halo), no
  rounded-everywhere bento grid (radius is literally forced to 0), no typewriter/rotating-
  word hero, not dark-mode-only.
- Checked for stuck-mid-transition risk: `Figure1.astro`'s `rejecting`/`blocked` classes are
  removed and re-triggered via `void el.offsetWidth` reflow forcing (`:217-220, 224-227`)
  before re-adding — this is the correct pattern to avoid an animation not re-firing on
  repeated triggers, and since these are one-shot CSS animations (not toggled transitions
  left in an indeterminate state), there's no half-finished-transition class combination
  found by reading the state machine (`current`/`.active`/`.done` are mutually exclusive and
  fully re-computed on every `renderSteps()` call, `Figure1.astro:141-150`).
- Docked 1 point: the hero's `.js-anim .hero-title .line span` reveal (`global.css:362-369`)
  and the `.kicker .idx`/`.rule` reveal both run unconditionally on `.js-anim` (hero) or via
  IntersectionObserver (kicker) — two different triggering mechanisms for visually similar
  "reveal" effects is a minor inconsistency in the motion system's internal logic, not a
  user-visible bug.

## 8. Information architecture — 7/10

- Nav markup is generated once from `Nav.astro` and imported by `Base.astro:74`, so it is
  byte-identical across all seven pages — no drift risk.
- `aria-current="page"` logic (`Nav.astro:20`, `isActive`) correctly matches `/work` active
  state on `/work`, `/work/talk-to-data`, etc. (prefix match), verified by reading the
  `startsWith` check.
- All page types are reachable **from desktop nav only**: Work, Research, About + email.
  Below 820px, only in-page/footer links remain (see §2/§3) — nav is not equally usable
  across breakpoints, which is an IA regression on mobile specifically.
- `/work` vs. home's listing: `/work` (`work/index.astro`) shows only the `Entry` list with
  a `Masthead`; home (`index.astro`) shows the same `Entry` list embedded inside a longer
  page (hero, Results-plotted charts, Publications, About/Contact). They are not
  meaningfully different in the *work-list* content itself — same three entries, same sort,
  same component — `/work` exists purely to give the list a dedicated URL/standfirst. This
  is reasonable IA (a "see all" page), not a defect, but there's no filtering, richer detail,
  or distinct value proposition to `/work` beyond the standfirst copy.
- Case-study structural order verified against `[...slug].astro` and cross-checked with
  `talk-to-data.md`: title/tagline/owned-line → **problem** → stack chips → **Results,
  plotted** (§01) → **Fig. 1** (§02, only if `trace` present) → **body** (`<Content />`
  from markdown) → **Trade-off** → **What I would build differently** (errata). This matches
  the required `problem → results → Fig.1 → body → tradeoff → errata` order exactly
  (`[...slug].astro:42-84`).

## 9. SEO & metadata — 5/10

- `<html lang="en">` present (`Base.astro:33`) — correct.
- Canonical link present and per-page (`Base.astro:29,40`, uses `Astro.url.pathname`).
- OG tags present: `og:type`, `og:title`, `og:description`, `og:url`
  (`Base.astro:44-47`). **No `og:image`** anywhere in the codebase — Twitter card is set to
  `summary_large_image` (`Base.astro:48`) which expects an image; without one, link
  unfurling on Slack/Twitter/LinkedIn will show a title-only or broken preview.
  **No `twitter:title`/`twitter:description`** either (only `twitter:card` is set) —
  platforms that don't fall back to `og:*` for Twitter cards will show nothing.
- Titles are unique per page (verified via curl: `/`, `/work`, `/research`, `/about`,
  and all three case studies each render a distinct `<title>`).
- **Meta descriptions are NOT unique**: `/`, `/work`, `/research`, and `/about` all render
  the identical description `"I build LLM systems that go to production and stay
  there..."` (curl-verified) because none of `about.astro`, `research.astro`, or
  `work/index.astro` pass a `description` prop to `<Base>` — only the three case-study
  pages override it (`[...slug].astro:24`, `description={d.tagline}`). This is a real,
  easily-fixed SEO defect: 4 of 7 pages share one description.
- **No `sitemap.xml`, no `robots.txt`** — `public/` contains only mockups, favicons; no
  `@astrojs/sitemap` integration in `astro.config.mjs`, no static `robots.txt`. For a static
  Astro site this is a one-line integration away but is currently absent.
- **No JSON-LD structured data** anywhere (`grep -rl "application/ld"` returns nothing) — no
  `Person`/`ProfilePage`/`Article` schema for the case studies, which is low-hanging fruit
  for a resume-adjacent site aiming at recruiter/hiring-manager discovery.

## 10. Code quality/maintainability — 8/10

- Hardcoded hex colors outside `global.css`: only `Base.astro:42` (`theme-color`, a
  legitimate one-off meta tag, not a stylable element) and a design-thesis HTML comment at
  `Base.astro:55` (not live CSS). No component hardcodes a color value in a `style=` attribute
  or inline `<style>` block. Clean.
- Inline `style=""` occurrences: `about.astro` ×6 (repeated `font-size:1.15rem;
  line-height:1.65; color: var(--color-ink); max-width: 62ch` block, `:12,18,23` and two
  more), `Figure1.astro` ×1 (figcaption styling, `:99`), `Masthead.astro` ×1 (`header`
  padding, `:14`), `[...slug].astro` ×4 (byline/paragraph spacing, `:26-27,33,49`). None are
  color/token overrides (all use `var(--color-*)` even inline), so they don't fight the
  design-token system, but they are duplication that could be `.prose`/utility classes —
  moderate, not severe.
- Semantic landmarks present: `<header>` (Nav, Masthead), `<nav aria-label="Primary">`
  (`Nav.astro:26`), `<main id="main">` (`Base.astro:75`), `<footer>` (`Colophon.astro:17`),
  `<article>` for case studies (`[...slug].astro:25`), `<figcaption>` for Fig. 1
  (`Figure1.astro:99`). No table-for-layout anywhere (grepped; only semantic data would use
  `<table>` and none is present — all grids are CSS Grid/Flexbox `<div>`s, correct for
  non-tabular data).
- Component duplication vs. reuse: `Entry.astro` is correctly shared between `index.astro`
  and `work/index.astro` (no duplicated markup); `Figures.astro` is shared between home and
  case-study pages; `BasisNote.astro` is a genuinely tiny (14-line) component that earns its
  existence by being the single place the "Basis — " prefix is spelled. `Sheet.astro`
  (15 lines) exists but its usage wasn't found via grep in any page — **possible dead
  component**, worth confirming.
- Dead CSS / stale "instrument panel" terms: grepped `global.css` and all components for
  `amber|instrument.panel|dark-mode|neon` — no matches. The design has fully moved off the
  discarded premise; no leftover selectors targeting removed classes were found (every class
  referenced in `.astro` files has a corresponding rule in `global.css`, spot-checked for
  `.hero-*`, `.chart-*`, `.react-*`, `.work-*`, `.pub-row`, `.about-*`, `.contact-*`).
- TypeScript: only one `.ts` file with logic (`motion.ts`) plus `content.config.ts` and
  `profile.ts`. No `any`, no `@ts-ignore`/`@ts-expect-error`, no unsound casts found in any
  of the three. Types are narrow and explicit (`HTMLElement`, `SVGRectElement`, etc.).
  `Figure1.astro`'s inline `<script>` is untyped Astro script (not run through the project's
  `tsconfig` the same way `motion.ts` is) but uses consistent optional-chaining and null
  guards throughout (`shell.querySelector<HTMLButtonElement>(...)`) — no obvious unsoundness
  despite being outside strict-checked scope.

---

## Top defects by file:line (all metrics, deduplicated)

1. `src/components/Nav.astro:27,264-268 (global.css)` — no mobile nav: `.nav-list--links`
   hidden under 820px with zero replacement affordance. Breaks IA + accessibility + responsive
   simultaneously. **Highest-impact single fix.**
2. `src/pages/about.astro`, `src/pages/research.astro`, `src/pages/work/index.astro` — none
   pass a `description` prop to `<Base>`, so 4/7 pages share one meta description.
3. `src/layouts/Base.astro:44-48` — no `og:image`, no `twitter:title`/`twitter:description`;
   link previews will be broken or title-only.
4. Missing `sitemap.xml`/`robots.txt`/JSON-LD — no `@astrojs/sitemap` integration, no static
   `robots.txt`, no structured data anywhere in `src/` or `public/`.
5. `src/layouts/Base.astro:3-10` — `@fontsource/space-grotesk/500.css` and Source Sans 3
   500-weight import appear unused (no `font-weight: 500` rule found anywhere) — dead font
   weight shipped in every page load.
6. `src/pages/about.astro:12,18,23,...` — six repeated inline `style=""` blocks that duplicate
   a paragraph style already close to `.case-problem`/`.page-standfirst` (with an
   inconsistent `1.15rem` vs. `1.1rem`) — candidate for a shared `.about-copy p` rule.
7. `src/components/Sheet.astro` — appears unused across all pages; confirm or remove.

## Top 5 fixes by impact

1. **Add a mobile nav.** Either an accessible hamburger/disclosure menu or, at minimum,
   un-hide `.nav-list--links` in a stacked/full-width form below 820px so Work/Research/About
   remain reachable via primary nav on phones and tablets. This single gap touches
   Accessibility, Responsive, and Information Architecture scores simultaneously.
2. **Give every page a distinct meta description** (`about.astro`, `research.astro`,
   `work/index.astro` — pass a `description` prop to `<Base>` the same way the case-study
   pages already do via `d.tagline`).
3. **Add `og:image` (+ `twitter:title`/`twitter:description`)** and a minimal
   `@astrojs/sitemap` integration + `robots.txt` — cheap, standard, currently fully absent.
4. **Drop the unused 500-weight font imports** (`Base.astro:4,8`) or start using them
   deliberately — currently pure dead weight on every page load.
5. **Consolidate `about.astro`'s six duplicated inline paragraph styles** into a shared class
   and reconcile the `1.15rem`/`1.1rem` inconsistency with `.case-problem`/`.page-standfirst`.
