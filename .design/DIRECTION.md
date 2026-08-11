# Design direction: full rebuild

Phase: design only. No application code, no changes under `src/`.
Date: 2026-08-10.

---

> ## SUPERSEDED — 2026-08-12
>
> **The committed direction in this document ("The Offprint") is no longer the design of
> this site.** It was built, reviewed by the client, and rejected: too restrained, and its
> grid shipped a dead rail column that left every page reading as a narrow centre strip.
>
> Two later directions were built as working mockups and compared in an adversarial audit:
> `mockups/a-kinetic.html` (warm-paper editorial, Fraunces) and `mockups/c-technical.html`
> (Swiss technical, plotted metrics, operable ReAct diagram). **C won** — chiefly because A's
> hero and metric strip depended on JavaScript and rendered `0 analysts served` when it did
> not run, whereas C degrades correctly.
>
> **`mockups/c-technical.html` is now the design source of truth.** Current scores live in
> `.design/BENCHMARK.md`.
>
> What survives from this document and is still binding:
> - Every metric renders with its `basis`. The Zod schema in `src/content.config.ts` enforces it.
> - The wording rule on Talk to Data: own / architect / build / engineer, never *led*.
> - First paint is the final state; the site must render complete and correct with JS disabled.
> - Square corners, one rationed accent, no scroll-reveal that hides content behind JS.
>
> What is **dead** and must not be reintroduced from here: the apparatus rail with superscript
> basis markers keyed to margin notes, the ledger-paper palette, Spectral/Archivo/Martian Mono,
> and the zero-motion budget (the client asked for motion; the current budget is defined in
> `## Design direction` in `CLAUDE.md`).

---

## 0. What went wrong with the current site

The current build is: near-black ground, one amber accent, uppercase monospace micro-labels,
an `01 / 02 / 03` three-principle grid, and a hero reading "I build LLM systems that survive
production."

Every one of those five is an item on a published list of AI design tells.

- `frontend-design` names three clusters that AI design converges on regardless of subject.
  Cluster 2 is *"a near-black background with a single bright acid-green or vermilion accent."*
  Amber-on-near-black is that cluster.
- `impeccable/new-work.md` names the same clusters and adds *"broadsheet-editorial hairlines
  and small tracked mono labels."* The site has those too.
- `design-taste-frontend` §9.F bans section-number eyebrows (`00 / INDEX`, `001 · Capabilities`)
  outright, and §4.7 caps eyebrows at one per three sections. The `01 / 02 / 03` grid is the
  banned pattern in its purest form.
- `frontend-design` says structural devices *"should encode something true about the content."*
  Three principles are not a sequence. Numbering them encodes nothing.

The verdict "it looks AI generated" is correct and mechanically explainable. The instrument-panel
direction in `CLAUDE.md` is therefore discarded, not adjusted.

One thing the current site got right and the rebuild keeps: the schema-enforced editorial rules.
`problem` / `tradeoff` / `wouldChange` / per-metric `basis` are the best asset here. The rebuild's
job is to make them *visible as structure*, not to decorate around them.

## 1. Design read

> Reading this as: a **credential document** for a research lead or senior hiring manager who will
> spend 90 seconds on it between other tabs, with a **contemporary scientific-journal** language,
> leaning toward **native CSS + a printed-page grid + a motion budget of effectively zero**.

Visitor mode (impeccable taxonomy): **Read**, with a Persuade opening. Comprehension and
wayfinding win over expression. This forces the dials down:

- `DESIGN_VARIANCE: 5` — asymmetric by grid, not by chaos. The asymmetry is a real margin rail.
- `MOTION_INTENSITY: 2` — state feedback only. See §6.
- `VISUAL_DENSITY: 5` — dense enough to look like a document, open enough to read.

Physical scene test (impeccable §4, "let it force the answer"): a hiring manager, daytime, laptop
browser, twelve tabs open, possibly printing to PDF for a panel. That scene wants a **light
ground**. Dark mode is offered via `prefers-color-scheme` only, never as the default and never
with a JS toggle.

## 2. Ground truth read

Read before designing: `src/data/profile.ts`, all three of `src/content/work/*.md`,
`src/content.config.ts`.

Facts that must shape the design, not just sit inside it:

| Fact | Design consequence |
|---|---|
| Two peer-reviewed papers, first author on MLDS 2025 | The rarest thing on the CV. It is the direction, not a list item. |
| Every metric carries a `basis`, enforced by Zod | The apparatus (footnote / margin note) is the signature element. |
| `tradeoff` + `wouldChange` are required | Journals call these Limitations and Future Work. The form already exists. |
| Numbers are measurements (95%, 85%, $0.05-0.20, 30% → 59-68%) | Tabular mono figures with a superscript marker, always. |
| Never "led" / "project lead" / headcount on Talk to Data | Ownership is stated as an author-contribution line, not a title. See §9. |
| Static output, Cloudflare Pages free tier | Zero JS budget is a feature of the chosen direction, not a compromise. |

---

# THREE CANDIDATE DIRECTIONS

Each is a real position. All three deliberately avoid the three named AI clusters.

---

## Candidate A — **THE OFFPRINT**

### Thesis

The site is a scientific offprint: this engineer's distinguishing fact is that his work has been
peer-reviewed, so the whole surface adopts the apparatus of a journal article, where every claim
carries its citation in the margin.

### Why it is un-templated for this subject

The AI default for an LLM engineer is a terminal. The default for a "thoughtful" engineer is a
blog. Neither is derived from *him*. The offprint is derived from the one credential 49 of 50
competing portfolios do not have, and it is structurally identical to the constraint the repo
already enforces in code: a metric with a `basis` **is** a claim with a citation. The form is not
applied to the content, it is read off the content's own schema.

Critically this is **not** LaTeX cosplay. It is a contemporary journal *identity program* (the
register of a well-art-directed scientific press), which means: no Computer Modern, no pure white,
no justified text with hyphenation artifacts, no fake DOI, no fake `arXiv:2501.xxxxx` stamp.

### Palette (light, default)

Cool blue-grey ledger stock and a deep navy-black ink, with one accent: a proof-correction red
that is also, honestly, Michelin red.

| Token | Hex | Role | Contrast vs ground |
|---|---|---|---|
| `--paper` | `#E8ECEF` | page ground | — |
| `--paper-raised` | `#F2F4F6` | figure plates, table zebra | — |
| `--ink` | `#0E1620` | body and headings | **15.31 : 1** (AAA) |
| `--ink-muted` | `#424D57` | basis notes, captions, metadata | **7.27 : 1** (AAA) |
| `--rule` | `#737F88` | structural rules (carry meaning) | **3.45 : 1** (≥3, non-text AA) |
| `--hairline` | `#C3C9CD` | decorative grid, table interior | 1.41 : 1 (decorative only) |
| `--accent` | `#C8102E` | errata marks, live status, links on hover | **4.95 : 1** (AA small text) |

Dark variant (`prefers-color-scheme: dark`), same roles inverted:

| Token | Hex | Contrast vs `#0E1620` ground |
|---|---|---|
| `--ink` (text) | `#E8ECEF` | **15.31 : 1** |
| `--ink-muted` | `#9FAAB3` | **7.69 : 1** |
| `--rule` | `#5A6874` | **3.18 : 1** |
| `--accent` | `#FF4D5E` | **5.61 : 1** |

Hard rule: `--accent` at `#C8102E` on the ink field is only **3.09 : 1**. Red small text never
appears on a dark field; use `--accent-dark` there. Both values verified by computation, not eye.

Colour strategy (impeccable §4): **Restrained** — neutrals plus one accent. Correct for a Read
surface. The accent is rationed to three semantic jobs and nothing else: (1) the errata marker
that opens `wouldChange`, (2) the `production` status mark, (3) link hover/focus. No red
decoration, ever.

### Type

Three families, three jobs, no overlap. All verified present on Fontsource (versions checked):

| Role | Family | Package | Weights |
|---|---|---|---|
| Text + display | **Spectral** | `@fontsource/spectral@5.3.0` | 400, 400 italic, 600 |
| Utility (labels, nav, §heads, captions) | **Archivo Variable** | `@fontsource-variable/archivo@5.3.0` | wght 400-700, wdth axis |
| Figures only | **Martian Mono Variable** | `@fontsource-variable/martian-mono@5.3.0` | wght 400-600 |

Why these and not the reflexes: Spectral is a Production Type screen serif with an angular,
slightly severe cut that reads as scholarly rather than cosy — it is not Playfair, Fraunces,
Cormorant, Lora, Crimson or Newsreader, all of which are on the `impeccable` and
`design-taste-frontend` banned-default lists. Archivo has a genuine industrial grotesque
character with a width axis, so the masthead condenses on narrow screens without a fourth
font file — it is not Inter, DM Sans, Outfit, Plus Jakarta or Instrument Sans. Martian Mono is
squarish and engineered, which makes a figure look like an instrument reading rather than like
code — it is not Space Mono or IBM Plex Mono.

Martian Mono appears **only** on numerals, never on running text, never as an uppercase
micro-label. That is the single most important type rule in the system: the tell being avoided is
tracked-uppercase-mono chrome, and the fix is to give mono exactly one job.

### Layout

A margin-and-measure grid, not a 12-column grid.

```
DESKTOP (>=1024px)                                 max-width 1180px
+---------------+--+--------------------------------+-----------+
|  APPARATUS    |  |  MEASURE                        |  TAIL     |
|  RAIL         |  |  minmax(0, 62ch)                |  1fr      |
|  15rem        |  |                                 |           |
|               |  |                                 |           |
|  §2           |  |  Ninety-five percent accuracy   |           |
|               |  |  on a 500-question benchmark    |           |
|  a. 500-item  |  |  is the number that gets        |           |
|     benchmark |  |  quoted.[a] The interesting     |           |
|     n=500,    |  |  work was the other five        |           |
|     Nov 2024  |  |  percent...                     |           |
|               |  |                                 |           |
|  Fig. 1       |  |  [ figure spans measure + tail ]------------>|
+---------------+--+--------------------------------+-----------+
```

- `grid-template-columns: [rail] 15rem [gut] 2.5rem [measure] minmax(0, 62ch) [tail] 1fr;`
- The rail is the **apparatus**: section numbers, figure numbers, and basis notes.
- Figures and tables may break out across `measure / tail`. Prose never leaves `measure`.
- Tablet (768-1023px): rail narrows to 8rem and carries only section and figure numbers. Basis
  notes relocate inline beneath their paragraph.
- Mobile (<768px): single column, 1.25rem side padding. The rail does **not** disappear. Section
  numbers become a line above the heading; basis notes become an indented note directly beneath
  the block they annotate, with a 2px `--rule` left border. Mobile is a re-composition of the
  apparatus, not a truncation of it.

### The three headline metrics

Rejected: the metric strip. Three equal cards with big numbers is the exact "big number with a
small label, supporting stats" arrangement `frontend-design` names as the template answer.

Instead, the headline metrics are set as **a results table with a marker column**, in the
document's own vocabulary:

```
50+       analysts, US and Europe                                    [a]
95%       accuracy, 500-question benchmark                           [b]
27/wk     analyst-hours returned, stakeholder-reported               [c]

[a] Daily active use across two regions, Talk to Data, 2026.
[b] n = 500 held-out questions. Run-to-run consistency 85% on the same set.
[c] Stakeholders' own count, not instrumented.
```

Value in Martian Mono at `clamp(1.75rem, 5vw, 2.5rem)`, right-aligned on its own decimal-ish
axis so the three figures form a vertical edge. Label in Spectral at body size. Marker in Archivo
at 0.6875rem, superscript, `--accent`. The basis lives in the rail on desktop and directly beneath
on mobile. Nothing is boxed. No cards. No dividers between rows except a single `--hairline`.

This is the signature element and the reason to pick this direction: **the site's hardest editorial
rule becomes its visual identity.** You cannot copy the look without adopting the rule.

### Case study page composition

The case study is an article. Sections are numbered because they are genuinely sequential and
genuinely referenceable, which is the test `frontend-design` sets for numbering.

```
Masthead        title, tagline, and an author-contribution line
                status / period / stack as a metadata block, not pills
Abstract        the `problem` field, set at 1.25rem, no heading
§1 Results      the metrics table (above), plus Fig. 1
Fig. 1          the ReAct trace, printed and numbered. Static. Captioned.
§2 Method       the markdown body's own H2s, renumbered §2.1, §2.2...
§3 Trade-off    the `tradeoff` field, one paragraph, rule above
§4 Errata       the `wouldChange` field. Marked with the accent glyph.
                Heading reads "What I would build differently." No cuteness.
Colophon        stack list, period, links. Footer rule.
```

The `AgentTrace` scroll-animation is retired and replaced by **Figure 1**: a static, printed
process diagram, numbered, captioned, with the two `emphasis: true` steps (Schema selection,
Guardrail) set in accent-marked rules. It teaches the ReAct loop just as well and it works on a
printed page, in a screenshot, and with `prefers-reduced-motion` with no code path.

### Motion budget

Effectively zero, and that is the point.

- No entrance animations. No scroll reveals. No parallax. No counters. No marquee.
- Permitted: `120ms` colour/underline transition on link hover and `:focus-visible`.
- Permitted (one earned interaction): `:has()` / `:focus-within` on a metric marker highlights its
  corresponding basis note in the rail, and vice versa. Pure CSS, instant, no transform. This is
  motivated by feedback, which is a valid reason under `design-taste-frontend` §5.
- Under `prefers-reduced-motion: reduce` nothing changes, because there is nothing to reduce.

Fifty other portfolios move. Stillness is the distinctive choice here, not the safe one.

### The honest argument against it — failure mode

**It can read as dry, and dry is a real risk in 90 seconds.** A journal page has no hook. If the
masthead is set timidly, a scanner sees grey text on grey paper and leaves before reaching the
results table. The direction lives or dies on the first viewport carrying one large, confident,
un-serif-cliché typographic moment.

**LaTeX cosplay is one bad decision away.** Add Computer Modern, a fake DOI, a fake `arXiv` stamp,
or justified text with rivers, and it stops being an identity program and becomes a costume. The
mitigation is written into §11 as an explicit prohibition list, because this failure mode is
seductive during implementation.

**The apparatus rail is dead weight on short pages.** `/about` and `/research` have little
marginalia. A 15rem empty column reads as a layout bug. Mitigated by a `.no-rail` variant that
collapses the grid to `measure` + `tail` and shifts left, but that variant must be specified, not
improvised.

---

## Candidate B — **THE LEGEND**

### Thesis

The work is a territory and the site is its map key: every project is a plotted feature, and the
legend that explains the symbols is the primary navigation.

### Why it is un-templated for this subject

Derived from Michelin's own graphic tradition, which is one of the great cartographic identity
programs of the twentieth century (the road maps, the Guide). A map legend is a formal device
whose entire purpose is *symbol → meaning*, which is exactly the shape of `value → basis`. No
engineering portfolio looks like a map sheet.

### Palette

Modern topographic-sheet palette rather than antique map cream:

| Token | Hex | Role | Contrast on `--sheet` |
|---|---|---|---|
| `--sheet` | `#FAFAF7` | sheet ground | — |
| `--contour` | `#1D2321` | linework and text | ~16 : 1 |
| `--contour-muted` | `#4A534F` | annotation | ~7 : 1 |
| `--water` | `#2E6E8E` | secondary plate, links | ~4.7 : 1 |
| `--overprint` | `#C8305A` | route marks, current status | ~4.6 : 1 |
| `--grid` | `#D8D8D0` | graticule, decorative | 1.3 : 1 |

Two plates plus ink is a **Full palette** strategy, which for a Read surface is already one step
bolder than the mode wants.

### Type

Faustina (`@fontsource-variable/faustina@5.3.0`) for text, Archivo Variable for map-lettering
labels tracked at 0.12em, Martian Mono for grid references and figures. Faustina is a Latin-
American-designed screen serif with a distinctive high-waisted cut, and is not on any banned list.

### Layout

A sheet with a graticule. Content sits in an 8-column grid over a very low-contrast `--grid`
graticule, with a fixed **legend panel** bottom-left on desktop (below the fold on mobile) listing
the four symbol classes: production, research, shipped, publication. Project cards are plotted
features with a leader line to their legend entry.

### Headline metrics

Set as a **scale bar**: three figures reading left to right along a ruled baseline, each with its
unit and basis beneath, in the manner of a map's distance scale. Genuinely fresh; genuinely risky.

### Case study page

A map sheet: title block bottom-right (period, status, stack, sheet number), body in a
two-column measure, the ReAct trace drawn as a **route** with numbered waypoints and a
legend key for the two guarded steps.

### Motion budget

Low. One idea: leader lines between a project and its legend entry draw on `:hover` with a
`stroke-dashoffset` transition, 200ms. Retired entirely under reduced motion.

### The honest argument against it — failure mode

**It is decoration wearing a metaphor.** The graticule, the legend panel, and the leader lines do
not carry information the reader needs; they assert a theme. `frontend-design`'s test is that
structural devices must encode something true. A legend for four status values is a solved problem
that needs one word each, not a panel.

**It appropriates an employer's brand identity for a personal site.** Michelin red and the Michelin
map look are Michelin's, not Varun's. On a portfolio whose whole thesis is factual precision, that
is a category error a sharp reader will notice.

**It drifts into the cream cluster under pressure.** `#FAFAF7` plus a red overprint plus a serif is
one bad implementation day away from the exact "warm cream ground, high-contrast serif, terracotta
accent" cluster that `frontend-design` and `impeccable` both name as AI default #1.

**It is the worst of the three on mobile.** A legend panel, a graticule and leader lines all
require width. Collapsed to 375px, the metaphor evaporates and what remains is a plain list, which
means the identity does not survive the platform half the traffic arrives on.

---

## Candidate C — **THE FIELD**

### Thesis

One saturated colour owns the page and the typography operates at extreme scale contrast, so the
site is read as a designed identity rather than a document, and the numbers are the only quiet
things on it.

### Why it is un-templated for this subject

An engineer's portfolio that behaves like a brand identity program is genuinely uncommon, and the
inversion is smart: everywhere else the numbers shout and the prose whispers; here the field
shouts and the measurements are set small, tabular and calm, which is what a person who actually
trusts their data does.

### Palette

**Committed** strategy (impeccable §4): one saturated colour occupies 40-60% of the surface.

| Token | Hex | Role |
|---|---|---|
| `--field` | `#0F2E3D` | full-bleed deep petrol regions |
| `--ground` | `#E6E9E4` | reading regions |
| `--mark` | `#E4572E` | one accent, on both grounds |
| `--ink` | `#14191C` | text on ground |
| `--ink-inverse` | `#E6E9E4` | text on field |

`#14191C` on `#E6E9E4` is roughly 14.9 : 1. `#E4572E` on `#0F2E3D` is roughly 4.2 : 1 — large text
only, which is a real constraint the direction must respect.

### Type

Archivo Variable at `wdth 112` and `wght 700` for display at 5-9rem; Faustina for body; Martian
Mono for figures. Display type is the primary visual asset, so no imagery is required, which suits
a site with no product screenshots that can be published.

### Layout

Full-bleed alternating fields. Hero is a field region carrying a five-word statement at 8rem.
Work index is a ground region. Each case study opens with a field region and drops to ground for
the reading. Metrics set at 1rem in Martian Mono against the field, deliberately small.

### Headline metrics

Deliberately anti-climactic: a single line of small tabular figures across the bottom of the hero
field, each with its basis inline in parentheses. The restraint is the statement.

### Motion budget

Moderate by these standards: one `view()`-timeline field-colour transition as sections cross,
gated behind `@supports` and `prefers-reduced-motion`.

### The honest argument against it — failure mode

**It violates the Page Theme Lock.** `design-taste-frontend` §4.11 is explicit: sections do not
invert mid-page. Alternating deep-petrol and light-grey fields is exactly the "user walked into a
different website mid-scroll" pattern, permitted at most once per page as a deliberate device.
This direction is built on doing it five times.

**Extreme scale contrast is the least mobile-safe choice.** An 8rem display line at 375px is either
four lines tall or it has been scaled down until the whole idea is gone. The brief requires
excellent, not merely responsive, mobile.

**It fights the content.** The case studies are 700-900 words of careful argumentative prose. A
poster identity is built for five-word statements. The design would spend its energy on the
smallest part of the site and go quiet exactly where the substance is.

**Its hero is the named template answer.** A giant statement with supporting stats over a colour
field is what every agency landing page does, which means the distinctiveness would come from
colour choice alone — the shallowest kind, and the kind that evaporates when seen next to fifty
others.

---

# COMMITMENT

## The direction is **A — THE OFFPRINT**.

### The three sharpest reasons

**1. The form is the credential.** Two peer-reviewed papers, first author on one, is the rarest
fact in the ground truth and the single hardest thing for a competing candidate to fake.
Candidates B and C would express that fact as a list item on a `/research` page. A only expresses
it: the visitor is reading a peer-reviewed artefact before they have read a word about
publications. `frontend-design` says the hero should open with the most characteristic thing in
the subject's world. For this subject that is the reviewed paper, not the terminal.

**2. The hardest constraint becomes the identity, so the design cannot decay.** `content.config.ts`
already fails the build when a metric has no `basis`. In the offprint, `basis` renders as a margin
note keyed to a superscript marker: the constraint is not merely honoured, it is the visible
apparatus that makes the page look like what it is. A design whose signature element is generated
by a schema rule cannot drift away from the content, and cannot be copied by anyone unwilling to
adopt the rule. That is durable distinctiveness rather than palette distinctiveness.

**3. It is the only one of the three that is better on a phone and better in 90 seconds.** The
offprint's desktop layout is a reading measure plus an apparatus rail; on mobile the measure is
already the whole page and the apparatus tucks under its own paragraph. Nothing is lost, so mobile
is a re-composition and not a degradation. And because the motion budget is zero, first paint is
the final state: no entrance animation stands between a hurried reader and the results table.
B collapses on narrow screens; C has to shrink its only idea until it disappears.

Secondary but real: A is the only direction that stays clear of all three named AI clusters
without effort. It is not cream-and-serif-and-terracotta (the ground is cool blue-grey, the accent
is a proof red used only semantically). It is not near-black-with-a-neon-accent (it is a light
document by default). It is not broadsheet hairlines with tracked mono micro-labels (mono is
restricted to figures and appears nowhere as a label).

---

# IMPLEMENTABLE SPEC — THE OFFPRINT

## 1. Token block (Tailwind v4 CSS-first, paste into `src/styles/global.css`)

```css
@import "tailwindcss";

@theme {
  /* ---- colour: light is the default; dark is a media-query override ---- */
  --color-paper:        #E8ECEF;  /* page ground                                   */
  --color-paper-raised: #F2F4F6;  /* figure plates, table zebra                    */
  --color-ink:          #0E1620;  /* body + headings        15.31:1 on paper  AAA  */
  --color-ink-muted:    #424D57;  /* basis notes, captions   7.27:1 on paper  AAA  */
  --color-rule:         #737F88;  /* structural rules        3.45:1 on paper  AA   */
  --color-hairline:     #C3C9CD;  /* decorative only         1.41:1 -- no text     */
  --color-accent:       #C8102E;  /* errata / status / focus 4.95:1 on paper  AA   */
  --color-accent-quiet: #F3DDE1;  /* accent wash, backgrounds only, never text     */

  /* ---- type ---- */
  --font-text:  "Spectral", ui-serif, Georgia, serif;
  --font-util:  "Archivo Variable", "Archivo", ui-sans-serif, system-ui, sans-serif;
  --font-fig:   "Martian Mono Variable", "Martian Mono", ui-monospace, monospace;

  --text-caption:   0.75rem;    --text-caption--line-height:   1.4;
  --text-label:     0.6875rem;  --text-label--line-height:     1.2;
  --text-note:      0.8125rem;  --text-note--line-height:      1.5;
  --text-body:      1.0625rem;  --text-body--line-height:      1.65;
  --text-lede:      1.25rem;    --text-lede--line-height:      1.55;
  --text-h3:        1.125rem;   --text-h3--line-height:        1.35;
  --text-h2:        1.375rem;   --text-h2--line-height:        1.3;
  --text-figure:    clamp(1.75rem, 5vw, 2.5rem);
  --text-figure--line-height: 1;
  --text-display:   clamp(2.25rem, 1.6rem + 3.2vw, 4rem);
  --text-display--line-height: 1.02;

  /* ---- measure + grid ---- */
  --measure:      62ch;
  --rail:         15rem;
  --rail-md:      8rem;
  --gutter:       2.5rem;
  --page-max:     1180px;

  /* ---- spacing: 4px base, named by role not by number ---- */
  --space-hair:   0.25rem;
  --space-tight:  0.5rem;
  --space-note:   0.875rem;
  --space-para:   1.25rem;
  --space-block:  2.5rem;
  --space-section:4.5rem;
  --space-page:   7rem;

  /* ---- shape: one system, sharp ---- */
  --radius-none:  0px;

  /* ---- motion: the entire budget ---- */
  --dur-state:    120ms;
  --ease-state:   cubic-bezier(0.2, 0, 0, 1);
}

@media (prefers-color-scheme: dark) {
  @theme {
    --color-paper:        #0E1620;
    --color-paper-raised: #16202C;
    --color-ink:          #E8ECEF;  /* 15.31:1 */
    --color-ink-muted:    #9FAAB3;  /*  7.69:1 */
    --color-rule:         #5A6874;  /*  3.18:1 */
    --color-hairline:     #2A3541;
    --color-accent:       #FF4D5E;  /*  5.61:1 */
    --color-accent-quiet: #2A1A1F;
  }
}
```

**Shape lock:** every corner on the site is `0px`. No exceptions, no pill buttons, no rounded
cards. There are no cards.

**Colour lock:** `--color-accent` has exactly three permitted uses. (1) The errata marker before
the "What I would build differently" section. (2) The `production` status glyph. (3) Link
`:hover` / `:focus-visible` underline and the superscript basis markers. Any fourth use is a
regression.

## 2. Font imports

```bash
npm i @fontsource/spectral @fontsource-variable/archivo @fontsource-variable/martian-mono
```

In `src/layouts/Base.astro`, imported once at the layout level so Astro fingerprints and inlines
the `@font-face` rules into the static build. Self-hosted; no `<link>` to Google:

```ts
import "@fontsource/spectral/400.css";
import "@fontsource/spectral/400-italic.css";
import "@fontsource/spectral/600.css";
import "@fontsource-variable/archivo";        // wght 100-900, wdth 62-125
import "@fontsource-variable/martian-mono";   // wght 100-800, wdth 75-112.5
```

Five files total. Set `font-display: swap` (Fontsource default) and add
`size-adjust`-matched fallbacks in `global.css` so the swap does not shift layout (CLS budget
< 0.1). Do not load Spectral 200/300/700/800 or any Spectral italic beyond 400.

Variable-axis settings:

```css
.u-label   { font-family: var(--font-util); font-variation-settings: "wdth" 100, "wght" 600; }
.u-display { font-family: var(--font-util); font-variation-settings: "wdth" 96,  "wght" 700; }
.fig       { font-family: var(--font-fig);  font-variation-settings: "wdth" 87,  "wght" 500;
             font-variant-numeric: tabular-nums; letter-spacing: -0.03em; }
```

Martian Mono is set at `wdth 87` because at default width the figures are too loose to form a
vertical edge in the results table.

## 3. Grid spec

```css
.sheet {
  max-width: var(--page-max);
  margin-inline: auto;
  padding-inline: 1.25rem;
  display: grid;
  grid-template-columns: [full-start] minmax(0,1fr) [measure-start] minmax(0, var(--measure)) [measure-end] minmax(0,1fr) [full-end];
}
@media (min-width: 48rem) {                  /* 768px  tablet */
  .sheet {
    padding-inline: 2rem;
    grid-template-columns:
      [full-start rail-start] var(--rail-md) [rail-end] var(--gutter)
      [measure-start] minmax(0, var(--measure)) [measure-end]
      minmax(0, 1fr) [full-end];
  }
}
@media (min-width: 64rem) {                  /* 1024px desktop */
  .sheet { grid-template-columns:
      [full-start rail-start] var(--rail) [rail-end] var(--gutter)
      [measure-start] minmax(0, var(--measure)) [measure-end]
      minmax(0, 1fr) [full-end]; }
}
```

- Default child placement: `grid-column: measure`.
- Rail children: `grid-column: rail` (desktop/tablet). Below 768px, rail children are reordered by
  source position, not by grid, so markup order must already be reading order: section number →
  heading → prose → basis notes.
- Breakout figures: `grid-column: measure-start / full-end`.
- Full-bleed rules: `grid-column: full`.
- `.sheet--no-rail` variant for `/about` and `/research`: drops the rail columns entirely at all
  breakpoints and centres `measure`. Specified so it is never improvised.

Vertical rhythm: all block spacing comes from the `--space-*` scale. Sections separated by
`--space-section` and a `--color-rule` 1px line spanning `full`. Never `border-t` *and*
`border-b` on the same element (`design-taste-frontend` §9.F).

## 4. Component composition notes

**`Sheet.astro`** — the grid wrapper. Replaces the old `Base.astro` grid overlay entirely; the
decorative grid overlay is deleted, since decorative hairlines are a named tell.

**`Masthead.astro`** — page header. Name in Archivo `wdth 96 / wght 700` at `--text-display`,
tracking `-0.02em`. One line beneath in Spectral: role, employer, place. A single `--color-rule`
line spanning `full` closes it. No nav inside it.

**`Nav.astro`** — one line, ≤ 64px tall, sticky only on `/work/[slug]`. Four items: Work,
Research, About, and an email link. Archivo 500 at `--text-caption`, sentence case, **not**
uppercase-tracked. Current page marked with a 2px `--color-accent` underline. No logo mark, no
status dot, no locale strip, no theme toggle.

**`Figures.astro`** (replaces `MetricStrip.astro`) — the results table described above. A
`<dl>`-derived structure, semantically: each row is value + label + a marker anchoring to its
basis note. Value uses `.fig`. Rows separated by one `--color-hairline`. The marker is an
`<a href="#basis-a">` styled superscript in `--color-accent`; the basis note is an
`<li id="basis-a">` in the rail. Anchor linking means the apparatus works with JS entirely
disabled, which is the whole point.

**`BasisNote.astro`** — the rail note. Spectral 400 italic at `--text-note`, `--color-ink-muted`,
`text-wrap: pretty`. On mobile it renders in flow beneath its block with a 2px
`--color-rule` left border and `--space-note` inset.

**`Figure1.astro`** (replaces `AgentTrace.astro`) — the printed ReAct trace. A numbered vertical
sequence on `--color-paper-raised`, each step a row: ordinal in `.fig`, step name in Archivo 600,
detail in Spectral. Steps with `emphasis: true` carry a 2px `--color-accent` left rule and their
detail set in `--color-ink` rather than `--color-ink-muted`. Caption beneath in Archivo
`--text-caption`: `Fig. 1 — ReAct loop, Talk to Data. Guarded steps marked.` Zero animation. The
`CountUp.tsx` React island is deleted; the site ships with no framework islands at all.

**`Entry.astro`** (replaces `WorkCard.astro`) — a work-index row, not a card. Full-width, three
lines: title in Spectral 600 at `--text-h2`; tagline in Spectral 400 `--color-ink-muted`; a
metadata line in Archivo `--text-caption` carrying period, status and up to four stack items
separated by a thin space and a hairline pipe, not a middle dot. One `--color-hairline` between
rows. Whole row is the link target; `:focus-visible` shows a 2px `--color-accent` outline offset
4px. Minimum tap height 56px.

**`Colophon.astro`** — footer. Left: contact lines. Right: a build line reading only the year and
"Set in Spectral, Archivo and Martian Mono." No version string, no build number, no last-sync
timestamp (`design-taste-frontend` §9.F).

## 5. Per-page layout plan

### `/` — home

The first viewport must carry the thesis, the credential and one metric without scrolling.

1. **Masthead.** Name at `--text-display`. Beneath it, one line: `Data scientist, generative AI
   and LLM engineering. Michelin, Pune.`
2. **Abstract.** The `positioning` line from `profile.ts`, set at `--text-lede` on the measure,
   max 3 lines at desktop. This is the whole hero. No CTA button, no eyebrow, no scroll cue.
3. **Results table.** The three headline metrics, immediately below the abstract and above the
   fold at 1440×900. Basis notes in the rail.
4. Rule spanning `full`.
5. **§1 Selected work.** Three `Entry` rows, ordered by `order`. Ends with a text link,
   `All work`. One CTA intent only: everything that means "read the work" uses the same label.
6. **§2 Publications.** Two rows, each: venue and year in `.fig`, title in Spectral 600, the
   `note` in `--color-ink-muted`. MLDS 2025 carries a `First author` mark in Archivo 600. This
   section is high on the page on purpose.
7. **Colophon.**

Total: four content blocks and a footer, three distinct layout families (measure prose, results
table, entry rows). No section repeats a family.

**Mobile:** identical order, single column, abstract at 1.125rem, results table figures at
`clamp` floor 1.75rem, basis notes inline. The whole first screen at 375×667 is masthead +
abstract + the first two metric rows. That is the correct 90-second payload.

### `/work` — index

1. Masthead reduced: `Work` at `--text-h2` and a one-sentence standfirst on the measure.
2. All three `Entry` rows at full weight, each carrying its two strongest metrics inline in
   `.fig` with markers, basis in the rail.
3. Colophon.

No filters, no tags, no cards, no grid. Three items do not need a grid.

### `/work/[slug]` — case study

The composition given in Candidate A above, concretely:

| Region | Grid | Contents |
|---|---|---|
| Masthead | `measure` + rail | Title (`--text-display`), tagline (`--text-lede`, `--color-ink-muted`). Rail holds period and status. |
| Contribution line | `measure` | Archivo `--text-caption`: `Owned: agent architecture, LLMOps, security model, frontend.` See §9. |
| Abstract | `measure` | The `problem` field, `--text-lede`. No heading above it. |
| §1 Results | `measure` + rail | `Figures.astro`, all frontmatter metrics, basis in rail. |
| Fig. 1 | `measure-start / full-end` | `Figure1.astro`, when `trace` exists. |
| §2… Method | `measure` | Rendered markdown body. Its `##` headings become `§2.1`, `§2.2`, … via a rehype-free approach: a CSS counter on `.prose h2`. Numbering is generated, never hand-typed into content. |
| §n Trade-off | `measure` | Rule above. Heading `Trade-off`. The `tradeoff` field. |
| §n+1 Errata | `measure` | Accent marker glyph. Heading `What I would build differently`. The `wouldChange` field. |
| Colophon | `full` | Stack list in Archivo `--text-caption`, then footer. |

Sticky nav on this page only, because it is the one page long enough to lose the reader.

**Mobile:** rail contents inline. Fig. 1 becomes a single column with the ordinal above each step
rather than beside it. Sticky nav collapses to a 44px bar with the case-study title truncated and
a back affordance.

### `/research`

Uses `.sheet--no-rail`.

1. Masthead: `Research`.
2. Two publication entries at full weight. Each: venue + year in `.fig`; title in Spectral 600
   `--text-h3`; `note` line; the `detail` paragraph on the measure. MLDS 2025 first, marked
   `First author`.
3. Rule.
4. **Awards and recognition.** Three rows, date in `.fig`, title in Spectral. Not a list with
   bullets, not a table with a border on every row.
5. Colophon.

### `/about`

Uses `.sheet--no-rail`.

1. Masthead: `About`.
2. Two to three paragraphs of prose on the measure. This page is the one place the writing runs
   without apparatus, which is a deliberate change of texture at the end of the site.
3. **Positions.** Four rows: dates in `.fig`, title in Spectral 600, employer in
   `--color-ink-muted`. Chronological, current first, current marked with the accent glyph.
4. **Education.** One row, same treatment.
5. **Skills.** Three named groups. Set as running text separated by a hairline pipe, not as pill
   badges. Badges are a card pattern and there are no cards.
6. Contact block: email, LinkedIn, GitHub, location. Plain links.
7. Colophon.

## 6. Accessibility acceptance criteria

Testable, per `design-editorial`'s requirement that every accessibility claim be verifiable:

- Body text ≥ 7 : 1 against its ground in both colour schemes. Verified: 15.31 and 7.27 light,
  15.31 and 7.69 dark.
- `--color-accent` never carries text smaller than 18px on a dark ground (measured 3.09 : 1);
  `--color-accent` dark variant used instead (5.61 : 1).
- `--color-hairline` never separates two things whose separation carries meaning; `--color-rule`
  (≥ 3 : 1) is used where it does.
- Heading levels sequential, `h1` once per page, `§` numbering generated by CSS counters so screen
  readers hear the heading text, not the ornament.
- Every basis marker is a real in-page anchor; the apparatus is fully usable with JS disabled and
  with CSS disabled.
- All interactive targets ≥ 44px; `Entry` rows ≥ 56px.
- `:focus-visible` is a 2px `--color-accent` outline at 4px offset on every interactive element.
  Never removed.
- Reflow at 320px and at 200% zoom without horizontal scroll: guaranteed by `minmax(0, …)` on
  every grid track and `measure` in `ch`.
- `prefers-reduced-motion: reduce` has nothing to disable; assert this in a comment rather than
  shipping an empty media block.

## 7. Performance budget

- Zero framework islands. `CountUp.tsx` deleted. Astro emits no client JS.
- Five font files, subset to `latin`. Preload only Spectral 400 and Archivo Variable.
- LCP element is the masthead text, so LCP is font-load bound; `size-adjust` fallbacks keep CLS
  near zero.
- No images required by the direction. If a figure ever needs one, it is a real diagram, never a
  div-built fake screenshot.

## 8. Prohibitions specific to this build

Written down because each is a failure mode this direction is uniquely prone to.

1. No Computer Modern, no Latin Modern, no TeX-default look.
2. No fake DOI, no fake arXiv identifier, no fake citation count, no invented `n =` that is not in
   the frontmatter.
3. No justified text. Ragged right, `text-wrap: pretty` on headings and notes.
4. No uppercase tracked mono anywhere. Mono renders figures only.
5. No cards, no pills, no badges, no border-radius, no shadows.
6. No decorative grid overlay, no crosshairs, no corner brackets.
7. No section-number eyebrows of the `001 · Capabilities` form. Section numbers are `§n`,
   attached to real headings, generated by counter.
8. No scroll cue, no version footer, no locale or time strip, no status dots except the single
   accent glyph on `production` and on the current role.
9. No em-dash or en-dash in any string **this design authors**: nav labels, captions, headings,
   figure captions, footer text, alt text. Use a hyphen. (The case-study prose is the user's
   authored content and is explicitly out of scope for rewriting; its punctuation stands.)
10. Maximum one uppercase micro-label per three sections, counted mechanically before ship.

## 9. Wording guard on Talk to Data

The masthead contribution line for `talk-to-data` renders exactly the ownership vocabulary already
in the content, in the form a paper uses for author contributions:

> `Owned: agent architecture, LLMOps stack, security model, frontend.`

Permitted verbs anywhere on the site: **own, architect, build, engineer, ship, design**.
Forbidden: **led, lead, project lead, managed, headcount, team of N, directed**. The word "lead"
must not appear in any component, label, alt text or aria-label. Grep for it before shipping.

## 10. Direction contract (to be pasted as the first child of `<body>` in `Base.astro`)

```html
<!--
THESIS: This is a peer-reviewed artefact, not a landing page. It refuses the dark
  instrument-panel with one neon accent and the numbered three-principle grid.
OWN-WORLD: Cool blue-grey ledger paper #E8ECEF, navy-black ink, one proof-correction
  red used only for errata, live status and focus. Spectral text, Archivo utility,
  Martian Mono for figures only. Zero radius, zero shadow, zero cards. A 15rem
  apparatus rail carries every metric's basis as a margin note.
STORY: A hiring manager reads a positioning line, three measured results with their
  bases visible, and two peer-reviewed papers, inside 90 seconds, then opens one
  case study and finds the trade-off and the errata stated without being asked.
FIRST VIEWPORT: Masthead name at clamp(2.25,4rem). One-line role. Abstract on a 62ch
  measure. Results table of three figures in tabular mono, bases in the left rail.
  No button, no image, no motion.
FORM: The Offprint. Chosen over The Legend and The Field on mobile survivability,
  90-second legibility, and because the schema already enforces the apparatus.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish
  review, the verdict, and DESIGN.md.
-->
```

## 11. Ship checklist

- [ ] Contract comment present in built `dist/` output (grep it after `npm run build`).
- [ ] `--color-accent` appears in exactly three semantic roles; grep the stylesheet.
- [ ] `grep -ri "\bled\b\|project lead\|team of" src/` returns nothing.
- [ ] No `border-radius` other than `0` anywhere.
- [ ] No `client:` directive anywhere in `src/`; `dist/` ships no JS bundle.
- [ ] Uppercase micro-label count ≤ ceil(sections / 3) on every page.
- [ ] Zero `—` and `–` in components, layouts and page files (content collection exempt).
- [ ] Every metric on every page resolves to a basis note by anchor with JS disabled.
- [ ] 320px and 200% zoom: no horizontal scroll on any of the five page types.
- [ ] Both colour schemes opened and read; no section inverts mid-page.
- [ ] Numbers in `profile.ts` and every frontmatter block still match `../Resume`.
