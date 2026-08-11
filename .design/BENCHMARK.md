# Benchmark — Astro Port Audit (Round 2)

Date: 2026-08-12. Scope: `/`, `/work`, `/work/talk-to-data`, `/work/web-agent`,
`/work/anomaly-detection`, `/research`, `/about`. Build verified with `npm run build`
(succeeds, 7 pages, `dist/sitemap-index.xml` generated). `dist/` itself is
**permission-blocked** for direct reads in this session — build console output, curl
against the dev server (`localhost:4321`), and source inspection were used as evidence
instead; called out per-metric where that substitutes for a `dist/` read.

Round 1 mean: 8.0 / 10 → **Round 2 mean: 8.5 / 10**

| # | Metric | Round 1 | Round 2 | Delta | Evidence |
|---|---|---|---|---|---|
| 1 | No-JS integrity | 9 | 9 | 0 | untouched this round |
| 2 | Accessibility (WCAG 2.2 AA) | 7 | 9 | +2 | mobile nav shipped, verified no-JS-safe and non-overlapping |
| 3 | Responsive | 6 | 8 | +2 | mobile nav + Fig.1 vertical connector both verified |
| 4 | Performance | 7 | 8 | +1 | dead font-weight imports removed; font count still large |
| 5 | Content integrity | 9 | 9 | 0 | untouched this round |
| 6 | Visual design craft | 8 | 8 | 0 | untouched this round |
| 7 | Motion quality | 9 | 9 | 0 | kicker reveal now `both`-fill keyframes, same score (was already high) |
| 8 | Information architecture | 7 | 9 | +2 | primary nav now reachable at every breakpoint |
| 9 | SEO & metadata | 5 | 8 | +3 | og:image, JSON-LD, sitemap, robots.txt, unique descriptions all verified live |
| 10 | Code quality/maintainability | 8 | 8 | 0 | Nav.astro/global.css additions are clean, no new debt found |

**New overall mean: 8.5 / 10** (was 8.0).

---

## 1. No-JS integrity — 9/10 (unchanged)

Not touched by round 1's fix list. No regression found — grepped the diff-relevant files
(`Nav.astro`, `Base.astro`, `global.css`) for any new bare `opacity:0`/`display:none` outside
a `.js-anim`/media-query guard; found none. The `<details>`/`<summary>` mobile nav
(`Nav.astro:46-72`) is itself a no-JS-native pattern — native browser disclosure behavior,
zero script dependency, which is a positive addition to this metric's evidence base rather than
a risk.

## 2. Accessibility (WCAG 2.2 AA) — 9/10 (+2)

- **Mobile nav fixed, verified end to end.** `Nav.astro:46-72` adds a `<details class="nav-mobile">`
  with a `<summary>` toggle and a second `<nav aria-label="Primary (mobile)">` containing the
  same three links + email. `global.css:279-283` hides `.nav-list--links` at `max-width: 820px`;
  `global.css:291-295` shows `.nav-mobile` (default `display:none`, `global.css:287-289`) only at
  the same `max-width: 820px` breakpoint. The two are exact complements on the same breakpoint
  value (820px/820px, not 819/821 or similar off-by-one) — confirmed by reading both rules
  side by side. **No width exists where both or neither nav is visible.**
- **No dual-landmark exposure.** Both `<nav>` elements are always present in the DOM, but
  `.nav-mobile`'s `display:none` default (removed from the accessibility tree at desktop widths)
  and `.nav-list--links`'s `display:none` under 820px mean a screen reader at any single viewport
  only ever encounters one `nav` landmark's links as exposed content — verified by tracing the
  CSS rules, not a live AT test. Distinct `aria-label`s ("Primary" vs. "Primary (mobile)") mean
  even a browser/AT that doesn't respect `display:none` for landmark listing (rare, but some
  older AT landmark lists ignore visibility) would still distinguish the two rather than reading
  as duplicates.
- **Touch targets fixed.** `.nav-mobile-toggle` now has explicit `min-width:44px; min-height:44px`
  (`global.css:303-304`). `.nav-mobile-link` has `min-height:44px` (`global.css:353`). `.btn` has
  `min-height:44px` (`global.css:672`, confirmed via grep). `.qbtn` has `min-height:44px`
  (`global.css:902`, confirmed via grep) — this closes round 1's "UNVERIFIED, likely under 44px"
  flag on `.qbtn`.
- `:focus-visible` global rule unchanged and still applies to the new `.nav-mobile-toggle` and
  `.nav-mobile-link` elements (no override found removing it for these classes).
- Contrast ratios unchanged (no token values touched this round) — same pass table as round 1
  applies.
- Docked to 9, not 10: the `\2261`/`\2715` (☰/✕) pseudo-icon swap on `.nav-mobile-toggle::before`
  (`global.css:316-322`) is decorative and not exposed via `aria-hidden`/an accessible name change
  — the `<summary>` text itself stays "Menu" regardless of open/closed state
  (`Nav.astro:47-49`), so a screen reader announces "Menu" both times rather than "Menu"/"Close
  menu". Minor: functional but not ideal AT feedback on state change. Native `<details>` does
  expose the open/closed state via its own semantics (`aria-expanded` equivalent is implicit for
  `<details>`/`<summary>` in modern browsers), so this is a small polish gap, not a blocking issue.

## 3. Responsive — 8/10 (+2)

- **Mobile nav fixed** (see §2) — the round 1 "most serious responsive defect" (no way to reach
  Work/Research/About below 820px except homepage anchors/footer) is resolved.
- **Fig.1 vertical connector added and verified.** `global.css:754-785`: `.react-arrow` is
  `display:none` by default and only `display:block` at `min-width:961px`
  (`global.css:787-789`) — same complementary-breakpoint pattern as the nav. Below 960px,
  `.react-step:not(:last-child)::after` draws a 1px vertical line plus a "↓" glyph appended to
  `.n::after` (`content:"\2193"`, `global.css:776-781`), and both the line and the arrow glyph
  switch to the signal color when `.react-step.done` (`global.css:773-775, 782-784`). This
  directly closes round 1's "arrows vanish with no compensating directional cue" finding — a
  concrete visible cue now exists at every stacked width.
- Remaining responsive items from round 1 are unchanged and unverified without a live render:
  the 9px/11px SVG chart axis labels at ~280px rendered width (round 1's math suggested this
  stays above floor down to typical mobile widths, still not visually confirmed), and no new
  breakpoint issues were introduced by the round 1 diff (checked `.nav-inner` padding step at
  700px, `.nav-mobile-list` left/min-width split at 481px — both look intentional and don't
  collide with any other component's breakpoint).
- Docked to 8, not 9/10: still no live-rendered verification (no headless browser screenshot
  tool available in this pass) of the 320px/375px cases: this is the same caveat as round 1,
  carried forward rather than a new defect, and the fixes made are architecturally sound by
  hand-trace of the CSS but not pixel-confirmed.

## 4. Performance — 8/10 (+1)

- `Base.astro:1-14`: `@fontsource/space-grotesk/500.css` and the Source Sans 3 500-weight import
  are **removed**, replaced with a comment (`:2-6`) documenting the grep that justified it
  ("grepped `font-weight:\s*500` and Tailwind `font-medium` — zero matches for both families").
  Independently re-verified: `grep -rn "font-weight:\s*500\|font-medium" src/` still returns zero
  matches against the current tree, so the removal doesn't drop a weight that's secretly used
  anywhere. This removes 2 of round 1's 52 shipped `.woff2` files (or more, if 500 was subset
  per-language like the others) — a real but small reduction relative to the ~50 remaining
  Source Sans 3 (5 weights × 6 subsets) and Space Grotesk (3 weights, several subsets) files.
  `dist/` itself could not be re-read to get an exact byte delta (permission-blocked); this is
  inferred from the source-level import removal, not confirmed against a rebuilt file listing.
- No other performance-relevant change this round: CSS is still one bundle (untouched), no new
  render-blocking resources added, `og-image.svg` adds one new static asset (single request,
  not render-blocking, confirmed 200 OK via `curl localhost:4321/og-image.svg`).
- Docked to 8, not 9: the larger performance opportunity flagged in round 1 (the `@fontsource`
  multi-subset default shipping cyrillic/greek/vietnamese subsets nobody requests) is untouched;
  only the two clearly-dead weight imports were removed. This was the correct, minimal fix for
  what round 1 actually found dead — not a full font-loading pass — so the score moves modestly,
  not dramatically.

## 5. Content integrity — 9/10 (unchanged)

Not in scope for round 1's QA fixes. Re-spot-checked the new JSON-LD block
(`Base.astro:36-51`) against `profile.ts` since it's new content-bearing code this round:
`name`, `jobTitle`, `worksFor.name` (`profile.roles[0].company`), `sameAs` (linkedin/github),
and `alumniOf.name` (`profile.education.school`) all trace directly to `profile.ts` fields —
confirmed live via `curl localhost:4321/` — no invented or drifted fact introduced. Round 1's
one docked point (hardcoded `entry.id === "talk-to-data"` in `[...slug].astro:38`) is untouched.

## 6. Visual design craft — 8/10 (unchanged)

Not a round 1 target. The new `.nav-mobile-toggle`/`.nav-mobile-list` styling
(`global.css:297-372`) is consistent with the existing design language (mono uppercase labels,
`--color-line-strong` borders, zero radius inherited from the global `border-radius:0 !important`
rule, signal-blue hover/active states matching `.nav-link`'s pattern) — no new visual-craft
regression introduced, but also not enough new surface area to move this score. Round 1's two
findings (`about.astro` inline-style duplication, DIRECTION.md/mockup apparatus-rail divergence)
are both unaddressed.

## 7. Motion quality — 9/10 (unchanged)

- The kicker reveal (`.kicker .rule`/`.kicker .idx`) was converted from a class-toggled
  transition to `@keyframes ... both` (`global.css:180-209`), exactly as the task described.
  Verified the fill-mode: `animation: kickerRule 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;`
  (`:197`) and `kickerIdx 0.3s ease both` (`:200`) both carry `both`, so per the stated
  measurement caveat (paused animations in an unfocused automated Chrome read as their start
  frame, not a bug) these reach the correct final state whether or not the IntersectionObserver
  ever adds `.in` — this was cross-checked by reading the animation-fill-mode semantics, not by
  observing a live paused frame, per the caveat.
  This closes round 1's implicit risk (a class-toggled transition with no guaranteed-terminal
  state) with a mechanism that has one, same as the hero/Fig.1 patterns already praised in
  round 1.
- Round 1 docked one point for "two different triggering mechanisms for visually similar reveal
  effects" (hero runs unconditionally on `.js-anim`; kicker uses IntersectionObserver). That
  duality is **still present** — the kicker still uses `.in` as an IO-driven replay trigger
  (`global.css:204-209`) layered on top of the new guaranteed-terminal keyframe. The round 1 fix
  makes the *terminal state* safe, which is the more important property, but doesn't unify the
  triggering model, so the score doesn't move up from what was already a 9 — the underlying nit
  survives, just de-risked rather than eliminated.

## 8. Information architecture — 9/10 (+2)

- Round 1's core finding — "all page types are reachable from desktop nav only... nav is not
  equally usable across breakpoints, which is an IA regression on mobile specifically" — is
  resolved by the same mobile-nav fix scored under Accessibility/Responsive. Re-verified from
  the IA angle specifically: the mobile nav (`Nav.astro:50-71`) carries the identical link set,
  order, and `aria-current` logic (`isActive`, same function reused for both desktop and mobile
  link lists, `Nav.astro:20, 33, 57`) as desktop nav — no IA drift between the two surfaces (e.g.
  no missing link, no reordering, no separate "mobile menu" that diverges from desktop's
  structure).
- Case-study structural order, `/work` vs. home listing relationship, and byte-identical nav
  across pages (still true — `Nav.astro` is still imported once by `Base.astro:106`) are all
  unchanged from round 1 and still hold.
- Docked to 9, not 10: `/work`'s lack of a distinct value proposition beyond a dedicated URL
  (round 1's finding, not a defect but not fully realized IA either) is unchanged.

## 9. SEO & metadata — 8/10 (+3)

All four round 1 "Top 5 fixes" items 2–4 were implemented and independently verified live
against the dev server, not just read from source:

- **Unique meta descriptions**, verified via `curl` against all four previously-duplicate pages:
  `/about` → "Why the work moved from models to evaluation and guardrails, plus positions,
  education, and skills..."; `/research` → "Two peer-reviewed papers on visual grounding..."; 
  `/work` → "Three production LLM and ML systems..."; `/` → the original positioning line. All
  four are now distinct (curl-confirmed, not just source-read).
- **`og:image` present and resolves.** `Base.astro:33-34, 72-75` builds an absolute URL to
  `/og-image.svg`, sets `og:image:width/height/alt`; `curl localhost:4321/og-image.svg` returns
  200 with valid SVG content (`<svg width="1200" height="630" ...>`, confirmed). `twitter:title`
  and `twitter:description` are also now present (`:77-78`), closing that specific round 1 gap.
  **Scored honestly against the caveat the task called out**: SVG `og:image` support is
  inconsistent across consumers — Facebook/LinkedIn's crawlers have historically not rendered
  SVG open-graph images reliably, and X's card validator has mixed SVG support depending on
  content-type headers Cloudflare Pages serves. This is a real risk that a PNG/JPG fallback
  would not have. The metadata is technically complete and spec-correct, but the actual
  link-preview outcome on at least one major platform is uncertain — this is the main reason the
  score is 8 and not 9-10 despite every checklist item being done.
- **`robots.txt` and sitemap both present and correct.** `curl localhost:4321/robots.txt` returns
  `User-agent: *` / `Allow: /` / `Sitemap: https://varun-malhotra.pages.dev/sitemap-index.xml`.
  `npm run build` console output confirms `[@astrojs/sitemap] sitemap-index.xml created at dist`
  and the integration is correctly registered in `astro.config.mjs:5, 21` with `site` set
  (`:11`) — sitemap generation requires `site` to be configured, and it is. (Could not read the
  generated `dist/sitemap-index.xml` file directly — permission-blocked — but the build log's
  explicit success message plus a correctly-configured integration is strong evidence it's
  correct.)
- **JSON-LD added and valid.** `Base.astro:36-51, 80` — `Person` schema, single
  `<script type="application/ld+json">`, verified via `curl` to be present, well-formed JSON
  (parses cleanly — no trailing commas or unescaped quotes), and every field traced back to
  `profile.ts` (see §5). This is a genuine, previously-completely-absent win for
  recruiter/hiring-manager discovery, exactly as round 1's fix list called for.
- `<html lang>`, canonical links, unique titles, `og:site_name`/`og:locale` (new,
  `Base.astro:67-68`) all remain/are now present. Nothing regressed.

## 10. Code quality/maintainability — 8/10 (unchanged)

- The round 1 diff (`Nav.astro` additions, `global.css` nav/kicker/button rules, `Base.astro`
  head additions) is clean: no new hardcoded colors (`.nav-mobile-list` box-shadow uses a raw
  `rgba(18, 22, 27, 0.35)` literal rather than a token, `global.css:341` — same pattern as the
  pre-existing `.react-step.active` shadow round 1 already noted as acceptable, not a new
  regression), no new inline `style=""` attributes introduced, no `any`/unsound TS.
  `Base.astro`'s new `personLd`/`ogImage`/`ogImageAlt` construction (`:32-51`) is plain typed
  object literals sourced from `profile`, consistent with the file's existing style.
- Round 1's two open findings — `about.astro`'s six duplicated inline `style=""` blocks, and
  `Sheet.astro`'s possible dead-component status — are both untouched this round, so the score
  doesn't move. Re-ran the grep for `Sheet` usage across `.astro` files this round: still zero
  matches outside `Sheet.astro` itself — still unconfirmed dead code.
- No regressions found in the reviewed diff area.

---

## Regressions introduced by round 1 — none found

Specifically checked for each risk the task flagged:

- **New contrast failure**: no color tokens changed this round; `.nav-mobile-toggle`/
  `.nav-mobile-link` reuse existing `--color-ink`, `--color-ink-soft`, `--color-signal` against
  `--color-paper`/`--color-panel` — all previously-verified-passing pairs. No new pair
  introduced.
- **New overflow**: `.nav-mobile-list` is `position:absolute` with explicit `left:0; right:0`
  below 481px and `min-width:260px` with `left:auto` above it (`global.css:336-348`) — bounded,
  no unconstrained-width risk found.
- **Weight-500 removal breaking rendered text**: re-verified via grep (see §4) that no
  `font-weight:500`/`font-medium` rule exists anywhere in `src/` — removal is safe, confirmed
  independently rather than trusting the round 1 commit's own comment.
- **`<details>` nav duplicating links for screen readers**: addressed in full in §2 — the two
  nav landmarks are mutually exclusive via `display:none` at complementary breakpoints, not
  simultaneously exposed.
- **JSON-LD validity/fact match**: addressed in full in §5/§9 — valid JSON, every field
  traced to `profile.ts`.
- **og-image.svg render reliability**: not a regression (net-new), but scored honestly under
  SEO §9 rather than credited as a full fix — SVG og:image support is genuinely inconsistent
  on X/LinkedIn.

---

## Worklist for round 3 (every metric still below 9)

### Responsive — 8/10
1. No live-rendered/screenshot verification exists for 320–375px viewports in this environment.
   Priority: low-effort if a headless browser becomes available — spot-check `.hero-title`
   clamp floor, `.pub-row` grid, and SVG chart label legibility at 320px.

### Performance — 8/10
2. `src/layouts/Base.astro:7-13` — still importing full multi-subset `@fontsource` packages
   (cyrillic/cyrillic-ext/greek/greek-ext/vietnamese subsets for Source Sans 3, latin-ext/
   vietnamese for Space Grotesk) that a Latin-only audience never requests but that still bloat
   the shipped CSS declaration count. Consider `@fontsource`'s subset-specific import path
   (e.g. `@fontsource/source-sans-3/latin-400.css`) instead of the umbrella per-weight file.
3. No measured gzip/Lighthouse numbers exist for either round — this metric has been scored by
   file/import inspection both times. A real Lighthouse pass (mobile, throttled) would sharpen
   this score in either direction.

### Visual design craft — 8/10
4. `src/pages/about.astro:12,18,23,...` — six repeated inline `style="font-size: 1.15rem; ..."`
   blocks, still unconsolidated. Extract to a shared `.about-copy p` rule and reconcile the
   `1.15rem` vs. `.case-problem`'s `1.1rem` inconsistency.
5. `.design/DIRECTION.md` vs. shipped design still disagree on whether the "apparatus rail"
   (superscript basis markers keyed to margin notes) is the intended visual signature. Needs a
   maintainer decision, not a code fix: either implement it or mark DIRECTION.md's relevant
   section as superseded by `mockups/c-technical.html`.

### SEO & metadata — 8/10
6. Add a raster fallback for `og:image` (PNG, 1200×630) alongside the existing SVG, or convert
   the primary `og:image` to PNG and keep SVG as a secondary `og:image` entry — multiple
   `og:image` tags are valid OG spec and let consumers pick the format they support. This is the
   single highest-leverage remaining SEO item given the SVG-support caveat.
7. Could not confirm `dist/sitemap-index.xml`'s actual URL list content this round (permission-
   blocked read) — only the build log's success message was available as evidence. Worth a
   direct read in an environment where `dist/` is accessible, to confirm all 7 pages are listed
   and no `/work/[slug]` dynamic routes were missed.

### Accessibility — 9/10
8. `Nav.astro:47-49` — the `<summary>` text stays "Menu" in both open and closed states; no
   `aria-label` or text swap communicates state change beyond the native `<details>` semantics
   and the `::before` glyph swap (which is not announced). Minor: add a visually-hidden state
   announcement or accept native `<details>` semantics as sufficient (they likely are for modern
   AT, but this wasn't independently verified against a real screen reader in this pass).

### Code quality/maintainability — 8/10
9. `src/components/Sheet.astro` — still zero usages found via grep across two rounds. Confirm
   dead and remove, or find where it was meant to be used.
10. `.nav-mobile-list`'s `box-shadow: 0 8px 20px -12px rgba(18, 22, 27, 0.35)` (`global.css:341`)
    is a raw color literal rather than a `var(--color-*)`-derived value — same pre-existing
    pattern as `.react-step.active`, worth a token (`--shadow-panel` or similar) if a third
    instance appears.

### Information architecture — 9/10
11. `/work`'s listing is still identical in content to the homepage's embedded work section
    (same three entries, same component, same sort) — not a defect, but no filtering or added
    value beyond a dedicated URL. Low priority; only worth addressing if the case-study count
    grows enough to need it.
