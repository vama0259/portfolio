# Motion — the site-wide system

Supersedes the "near-zero motion" stance in the earlier design pass. The user has explicitly
and repeatedly asked for a nicely animated site: calm, elegant, not flashy. This document is
the concrete spec. It does not touch `src/`; implement from here.

## 0. Tech decision: extend the hand-rolled spring, do not add GSAP

**Recommendation: keep GSAP out. Extend `Figure1.astro`'s spring integrator into a small
shared module (`src/scripts/motion.ts`, ~1–1.5KB gzipped) and drive everything else — entrance,
hover, scroll reveal — with that plus native CSS (`@starting-style`, `transition`,
`animation-timeline: view()` where supported, IntersectionObserver fallback).**

Why, weighed explicitly:

- **Bundle cost.** GSAP core is ~28KB min, +~8KB for ScrollTrigger — a 10–20x increase over the
  site's current ~2.8KB total JS, on a static portfolio with no other runtime cost to amortize
  it against. This site's whole pitch (the "offprint," the apparatus rail, "readable with JS
  off") is restraint as an aesthetic; shipping a general-purpose animation library to stagger
  eight DOM nodes undercuts that argument even if nobody notices the KB count.
- **Capability match.** Nothing in this spec needs GSAP's actual differentiators — MorphSVG,
  physics plugins, complex nested timelines with re-orderable labels, cross-browser SVG
  transform quirks from a decade ago. It's stagger, spring-to-rest on discrete state changes,
  and viewport-triggered class toggles. `Figure1.astro` already proves the spring integrator
  (k=210, ζ=0.9) reads as "physical, settles, no bounce" — the exact brief. Reusing it site-wide
  instead of introducing a second, differently-tuned motion vocabulary (GSAP's `power`/`elastic`
  eases) is *more* coherent, not less.
- **Scroll-driven reveals** are the one place GSAP+ScrollTrigger genuinely saves code (IO-based
  reveals need manual bookkeeping GSAP hides). But CSS `animation-timeline: view()` now covers
  the same ground natively in Chromium/Edge, and a ~40-line IntersectionObserver fallback
  covers Firefox/Safari without a library. That's the honest tradeoff: a bit more hand-written
  code vs. 28KB. Given the site's identity is partly *about* minimalism, hand-written wins.
- **When to revisit:** if a future page needs genuinely complex choreography (branching
  timelines, draggable SVG physics à la ciechanow.ski) GSAP is the right tool then — this is a
  page-scoped decision, not a permanent ban. `gsap-*` skills stay installed for that day.

New shared primitives (extend, don't duplicate, `Figure1.astro`'s spring):

```ts
// src/scripts/motion.ts
export const SPRING = { k: 210, zeta: 0.9 } as const; // matches Fig. 1 exactly
export function prefersReducedMotion() { return matchMedia("(prefers-reduced-motion: reduce)").matches; }
export function makeSpring(v: number) { return { pos: v, vel: 0, target: v }; }
export function stepSpring(s, dt) { /* same integrator as Figure1.astro, lifted out */ }
```

`Figure1.astro` should eventually import from here instead of defining its own copy — a
follow-up refactor, not part of this spec.

## 1. Design tokens to add to `src/styles/global.css`

The existing `--dur-state: 120ms` / `--ease-state: cubic-bezier(0.2, 0, 0, 1)` pair stays for
micro-interactions. Add one tier for entrance/reveal work, all critically-damped-feeling
(no cubic-bezier overshoot past 1):

```css
--dur-entrance: 480ms;
--ease-entrance: cubic-bezier(0.16, 1, 0.3, 1); /* expo-out: fast start, long calm settle */
--dur-reveal:   420ms;
--ease-reveal:  cubic-bezier(0.22, 1, 0.36, 1);
--stagger-step: 60ms;   /* gap between successive staggered items */
--stagger-step-lg: 90ms; /* wider gap for fewer, larger items (pub rows, entries) */
```

These are CSS equivalents of the same "fast in, no bounce, settle" character as Fig. 1's
spring (k=210, ζ=0.9 has a settle profile close to `cubic-bezier(0.16,1,0.3,1)` for a single
discrete transition). Fig. 1 keeps its JS spring because it's a continuous drag/position
system; everything else is a discrete state change, so a tuned cubic-bezier is enough and
cheaper.

## 2. Hero entrance choreography (load, `index.astro` masthead)

Total budget: **820ms**, well under the 1s cap once you include the stagger tail. First paint
already shows the full text (no FOUC, no invisible-until-JS-runs pattern — that fails the
JS-off requirement in spirit even where JS-off isn't literal here).

Sequence, each item `opacity 0→1` + `translateY(10px)→0`, `var(--dur-entrance)` /
`var(--ease-entrance)`:

| # | Element | Delay | Notes |
|---|---|---|---|
| 1 | `h1.home-title` | 0ms | Starts immediately, no pause on load |
| 2 | `.home-subtitle` | 90ms | one `--stagger-step-lg` after title |
| 3 | `.lede` | 170ms | |
| 4 | `Figures` metric strip (as a whole block, not per-metric) | 260ms | see §2b for the numerals inside |
| 5 | Hairline rule under masthead (`.section-divider`) | 340ms, `transform: scaleX(0)→1` from left, 380ms/`--ease-reveal` | reads as a pen-stroke underline, not a fade |

Implementation: a single `data-entrance` attribute on the masthead wrapper, toggled to
`data-entrance="run"` on `DOMContentLoaded` (or immediately if already past load), with each
child using `transition-delay` per the table via a `nth-child`/data-index selector — **CSS
only, no JS animation loop needed for this part.** JS's only job is flipping one attribute
after checking `prefersReducedMotion()`; if reduced motion, attribute is set with all delays
zeroed and durations at 1ms (content just appears — still respects "final state = first
readable state").

Do not stagger every word or letter. Four content blocks + one rule, full-block entrance —
matches the "1–2 key elements per view" motion guideline pulled from ui-ux-pro-max
(ux-guidelines.csv, "Excessive Motion", severity High) and avoids the fussy word-by-word
reveal that reads as a template default.

## 3. Count-up on metric figures (`CountUp.tsx`, `MetricStrip.astro`)

`CountUp.tsx` is the one React island — keep it that way, don't route this through the spring
module (React island already pays its own hydration cost; reusing vanilla spring code inside
it adds complexity for no gain).

- **Trigger:** IntersectionObserver, `threshold: 0.6`, fires once (`unobserve` after first
  trigger — never re-count on scroll-back, that reads as a slot machine).
- **Duration:** 900ms for any value, regardless of magnitude — do not scale duration by digit
  count (a 3-digit and a 6-digit metric finishing at different times looks like a bug when
  they're in the same `Figures` row).
- **Easing:** `cubic-bezier(0.16, 1, 0.3, 1)` (same expo-out family as §1) applied to a `0→1`
  progress value, output mapped `Math.round(progress * target)`. No overshoot, no decimal
  jitter in the final 100ms — snap to the exact target value on completion, don't let float
  rounding leave it one off.
- **Stagger across a row:** if `Figures` renders 2–4 metrics in one strip, start each 80ms
  after the previous (`--stagger-step` × 1.3), not simultaneous — same logic as the hero:
  sequence reads as deliberate, simultaneous reads as generated.
- **Reduced motion:** render the final value immediately, no counting frames at all.
- Numerals use `font-variant-numeric: tabular-nums` (verify already set in `.fig` utility
  class) so digit width doesn't jitter the layout during count.

## 4. Hover / focus micro-interactions

All on the existing `--dur-state: 120ms` / `--ease-state` tier — these were already speced,
this section makes them explicit and extends coverage:

- **Nav underline** (`link-underline` class, used in nav + "All work" link): `transform:
  scaleX(0)→1` from the left origin on hover/focus-visible, `160ms`, `--ease-state`. Reverse on
  blur/mouseleave at the same duration — no asymmetric slow-in-fast-out, that's the "sprinkled
  gimmick" failure mode.
- **Entry rows** (`Entry.astro`, work list items): on hover/focus-within, `border-left-color`
  transition already exists in `Figure1.astro`'s row pattern (`.fig1-row`) — apply the identical
  treatment (`transition: border-color 120ms var(--ease-state)`, accent-colored left border) to
  `WorkCard`/`Entry` rows so the two list types (trace steps, work entries) share one hover
  language site-wide.
- **Buttons / `.fig1-btn`-style controls:** already correct (border-color + color transition,
  120ms). No change — just confirms this is the pattern to reuse, not reinvent, wherever a new
  button appears (e.g. any future filter control on `/work`).
- **Basis-marker links** (apparatus rail superscripts): on hover, the linked margin note gets a
  `background-color` flash-to-`--color-accent-quiet` that fades over `240ms` (slightly longer
  than `--dur-state` since it's a "look here" cue across a gap, not a direct hover target) —
  `ease-out` only, decays to transparent, never pulses more than once.
- **Focus rings:** no animation — instant, per WCAG. Never spring or fade a focus ring in;
  that delays the exact feedback a keyboard user needs first.

## 5. Scroll-driven reveals — NOT uniform fade-up

Banned per `.design/REFERENCES.md` §C: uniform fade-up-on-scroll (identical `opacity+translateY`
on every section, same duration, same easing, no variation). The replacement is
**direction-aware, per-content-type**, driven by IntersectionObserver (`threshold: 0.15`, fires
once per element, `rootMargin: "0px 0px -10% 0px"` so reveal completes slightly before the
element hits viewport center):

| Content type | Motion | Duration | Stagger |
|---|---|---|---|
| Section heading (`.section-heading`, e.g. "Selected work") | `translateY(14px)→0` + opacity, **no horizontal component** | 420ms `--ease-reveal` | none — single element |
| Work entries list (`Entry.astro` rows) | `translateX(-10px)→0` + opacity — enters from the **left**, echoing the reading direction and the left-border hover accent from §4 | 420ms | `--stagger-step` (60ms) per row, capped at first 6 rows visible — rows below the fold on entry don't queue a long stagger chain, they just reveal individually as they cross the threshold |
| Publications rows (`.pub-row`) | `translateY(10px)→0` + opacity — vertical, distinct from work entries so the two lists don't feel identical | 380ms | `--stagger-step-lg` (90ms) |
| Hairline rules between sections (`.section-divider`) | `scaleX(0)→1` from left (same pen-stroke as §2) | 380ms `--ease-reveal` | triggers slightly before the section it introduces, not after |
| Apparatus rail / margin notes | **no scroll reveal at all** — they appear with their anchor's paragraph, instantly, since they're reference material a reader may jump to directly (anchor link), not a narrative beat | — | — |

Rule enforced across all of these: **never opacity-only, never the same easing curve across
two different content types on one page, direction always signals reading order** (headings
drop down like a stamp, entries slide in from the reading edge, rules draw themselves
left-to-right). This is what makes it "not uniform fade-up" — the variation is systematic
(keyed to content type) rather than random, so it still reads as one coherent voice.

Implementation stays framework-free: one shared IntersectionObserver instance in
`src/scripts/motion.ts` (`observeReveal(selector, variant)`), attaching a `data-revealed`
attribute that CSS keys off via `[data-reveal][data-revealed] { ... }`. No scroll-position
math, no per-frame work — IO does the triggering, CSS transitions do the motion.

## 6. Page transitions

`@view-transition` (cross-document) is already declared. Keep it declarative — no JS
`document.startViewTransition` orchestration needed for a static multi-page site; the native
API handles the default crossfade.

Refinement: name the persistent chrome so it *doesn't* crossfade with the content (nav, footer,
grid overlay should hold still; only the `Sheet` content area should transition), using
`view-transition-name` on `Base.astro`'s nav/footer and letting the main content area take the
default root transition. Concretely:

```css
nav, footer { view-transition-name: chrome; }
```

with `::view-transition-old(chrome)` / `::view-transition-new(chrome)` set to `animation: none`
so the shell is static and only the page body (default `root`) crossfades — `180ms` (browser
default is close to this; do not lengthen it, page transitions are the one place where "fast"
reads as elegant and "considered" reads as slow).

## 7. Fig. 1's spring as the site-wide signature

Fig. 1 is the deep, expensive, uncopiable investment (per `.design/REFERENCES.md` §B.2) — the
site-wide motion system should visibly descend from it rather than sit next to it as an
unrelated flourish:

- The **k=210, ζ=0.9 settle character** (fast approach, no overshoot, quick stop — not a slow
  ease-out that trails off) is encoded as `--ease-entrance` and `--ease-reveal` above so every
  discrete transition on the site *feels* like the same physical system, even though only
  Fig. 1 runs the literal integrator (continuous drag needs it; discrete on/off states don't).
- The **left-border accent-on-active pattern** from `.fig1-row--emphasis` / `[data-active]`
  becomes the shared hover/reveal-entry language for `Entry.astro` and any future list (§4, §5)
  — one visual grammar for "this row has focus," whether that focus is scroll-driven, hover, or
  Fig. 1's reader-driven token.
- Both defer to `prefersReducedMotion()` from the same shared check (§0), and both treat
  "reduced motion" identically: final state renders immediately, zero animated frames, nothing
  hidden or degraded — motion is enhancement everywhere, per the existing rule in `CLAUDE.md`.

## 8. Non-negotiables carried over

- Nothing loops. Nothing autoplays. Every animation in this document is triggered by load,
  scroll-into-view (once), hover, or focus — never a `setInterval`/CSS `infinite`.
- Nothing blocks reading: hero entrance is 820ms of a page that's already fully painted and
  legible from frame one; reveals fire before content is centered in viewport, never after a
  reader has already started reading the (invisible) text.
- All of §2–§6 checked against `prefers-reduced-motion: reduce` — durations to ~1ms, no
  translate/scale, content simply present.
