# CLAUDE.md

Guidance for Claude Code when working in this repository.

## What this is

Varun Malhotra's portfolio site. Astro + TypeScript, static output, deployed free on
Cloudflare Pages. It is the public counterpart to the private LaTeX resume repo at
`../Resume` — the two must agree on every fact.

## Commands

```powershell
npm run dev            # dev server on :4321
npm run build          # static build -> dist/
npm run preview        # serve dist/ locally
```

Astro 7 runs the dev server detached — manage it with `astro dev stop`, `astro dev status`,
`astro dev logs`.

There is no test suite. The content schema is the test — see below.

## The two hard constraints

**1. Never claim project lead on Talk to Data.** Varun owned the agent architecture, LLMOps,
security and frontend workstreams, but someone else held the lead title and he managed no one.
Use *own*, *architect*, *build*, *engineer*. Never *led*, *project lead*, or any headcount
claim. This is a reference-check risk, not a style preference. The build work belongs to the
Assistant Data Scientist period (Jun 2024 – Mar 2026); ownership and scale to Associate
(Mar 2026 – present).

**2. Metrics must match `../Resume`.** Every number lives in `src/data/profile.ts` or a case
study's frontmatter, and every one of them appears in `sections/*.tex` in the resume repo. If a
number changes, change it in both, same sitting. A portfolio that disagrees with the resume is
the one thing an interviewer can catch without doing any work.

## Architecture

```
src/
  data/profile.ts        single source of truth for facts — start here
  content.config.ts      Zod schema for case studies (see below)
  content/work/*.md      one case study per file
  layouts/Base.astro     shell: head, fonts, js-anim gate, SEO/JSON-LD, grid, footer
  components/
    Figures.astro        generates SVG bar charts from a metrics array + basis captions
    Figure1.astro        ReAct diagram built from `trace` frontmatter + guardrail demo
    Entry.astro          a work-list row
    Nav.astro            desktop list + pure-CSS <details> mobile nav (no JS)
    Masthead.astro       page title block
    BasisNote.astro      the basis caption under a figure
    Colophon.astro       footer
  pages/                 index, work/, work/[...slug], research, about
  scripts/motion.ts      the only shared JS: reveals, kickers, count-up
  styles/global.css      design tokens in @theme (Tailwind v4, CSS-first)

mockups/                 standalone reference designs (a-kinetic, b-cinematic, c-technical)
public/                  og-image.svg, robots.txt, favicons; mockups copied here to preview
```

`mockups/*.html` are also copied into `public/` so the dev server can serve them at e.g.
`/c-technical.html`. They are not linked from any route and are reference only — but they do
ship in `dist/`. Remove them from `public/` before a real launch if you would rather not
publish them.

### The schema enforces the editorial rules

`src/content.config.ts` requires `problem`, `tradeoff`, `wouldChange`, and a `basis` on every
metric. This is deliberate — the rules are "open with the problem, cite every number, admit
what you'd change," and the build fails rather than trusting anyone to remember them. Do not
loosen the schema to make a case study easier to write; write the missing part.

Note that YAML parses a bare `2024` as a number — quote `period` values.

## Design direction: "Swiss technical"

**Source of truth: `mockups/c-technical.html`.** That file is the approved design, kept as a
standalone reference implementation; `src/` is the content-driven port of it. Read it before
changing anything visual. Current quality scores and the open worklist are in
`.design/BENCHMARK.md`. `.design/REFERENCES.md` §C is a banned list of visual patterns that
read as machine-generated; check work against it.

Space Grotesk (display) + Source Sans 3 (body) + JetBrains Mono (figures, labels, console).
Ledger paper `#EEF0EC`, ink `#12161B`, one signal blue `#2453D9`, alert red `#C4291A` reserved
for the guardrail rejection and errata. `--muted` is `#5B6570` and must never go lighter — it
carries the `basis` captions and is the AA floor. A 64px technical grid sits behind everything.
Every corner is `0px`.

Two earlier directions were built and discarded — do not drift back toward either. "Instrument
panel" (dark, amber, mono micro-labels) is a top-two identifiable AI default. "The Offprint"
(ledger paper, Spectral, apparatus rail) was built, rejected as too restrained, and its spec in
`.design/DIRECTION.md` is marked superseded.

Three rules carry the identity:

- **The work is the visual content.** Metrics render as plotted SVG bars generated from each
  case study's `metrics` array; Fig. 1 is built from the `trace` frontmatter. Adding a metric in
  markdown produces a plotted bar with its basis, with no template change. The design cannot
  decay away from the content because the content generates it.
- **The interaction is the argument.** Fig. 1's guardrail demo lets a reader fire a write query
  and watch it get rejected. The case study *claims* read-only enforcement; the page lets you
  test it. This is the single most valuable element on the site — protect it.
- **Every metric shows its `basis`**, enforced by the Zod schema in `src/content.config.ts`.

### Motion budget

The client asked for motion explicitly, twice. The budget is real but disciplined: hero
entrance stagger, count-up on figures and chart labels, charts drawing in, scroll-spy nav,
mechanical hover on work rows, animated connectors in Fig. 1, and section rules drawing in.

- **Reveals are differentiated per content type** — labels wipe, charts draw, entries slide from
  the reading edge, rows rise. Applying one identical fade-up to every section is on the banned
  list, and doing it is a regression.
- **Motion never owns a correct value.** This bit us: a count-up that sets `textContent = "0"`
  before animating will display `0 analysts served` if anything stalls. Markup always holds the
  true final value; JS zeroes it only on the animation's own first frame.
- **Prefer keyframes with `both` fill over class-toggled transitions** for anything that starts
  hidden. A toggled transition can land in the same style recalculation as first paint and never
  run, leaving the element invisible forever.
- Everything respects `prefers-reduced-motion`.

**Testing caveat that will waste your time otherwise:** the automated Chrome used here pauses
CSS animations and throttles `requestAnimationFrame` because the tab is unfocused. Anything
animating from `opacity: 0` reads as `0` forever when inspected, and count-ups appear frozen
mid-flight. That is a measurement artifact, not a bug. Verify end-states with
`el.getAnimations().forEach(a => a.finish())` before reporting anything as broken.

## Agent tooling

Project-scoped design tooling lives in `.claude/skills/` (committed) and `.agents/skills/`
(the `skills` CLI payload that `.claude/skills` symlinks into).

- `ui-ux-pro-max` — searchable style/palette/font/UX database. Its scripts are Python; use
  `python3 .agents/skills/ui-ux-pro-max/scripts/search.py "<query>" --domain style`.
- `gsap-*` — GSAP reference. **Read `## Design direction` above first.** GSAP is available for
  reference, but the site's motion budget is deliberately near zero and the existing animation
  is pure CSS. Do not introduce a JS animation library without an explicit reason.
- `design-mono`, `design-minimal`, `design-editorial`, `design-refined`, `design-premium`,
  `design-shadcn` — from `bergside/awesome-design-skills`. Only a subset is installed; pull
  more with `npx typeui.sh pull <name>`. The loud ones (neon, cosmic, glassmorphism,
  brutalism) are deliberately absent — see the "explicitly avoided" list above.

MCP servers:

- `firecrawl` — declared in `.mcp.json` (committed) with **no API key**, so it runs
  unauthenticated: `search`, `scrape` and `parse` only, rate-limited. That covers the research
  use case. To unlock crawl/extract/monitor, put a real key in `.claude/settings.local.json`
  under `env.FIRECRAWL_API_KEY` and add it back to `.mcp.json` as `${FIRECRAWL_API_KEY}`.
  Do not set that variable to a placeholder — an invalid token fails *worse* than no token,
  because the server still reports "Connected" and only errors on the first real call.
- `21st` — HTTP transport, added at project scope in `~/.claude.json` with the key inline.
  It lives there rather than in `.mcp.json` on purpose: `.mcp.json` is committed and that key
  is a secret. Free tier allows 2 component-code retrievals/day; search is unmetered.

OpenArt, Figma, Canva and Chrome are account-level connectors, not configured here.

`graphify` is a separate CLI, not a skill payload like the above: installed globally via
`uv tool install graphifyy` (note the double-y — the single-y PyPI packages are unaffiliated),
with the skill registered project-scoped. See `## graphify` below.

## Deployment

Static output to Cloudflare Pages, free tier. Keep `output: "static"` — switching to SSR
starts costing money and buys nothing until there is a live demo.

Git over HTTPS is blocked on this Windows machine; push from WSL.

## Astro documentation

- [Routing and dynamic routes](https://docs.astro.build/en/guides/routing/)
- [Content collections](https://docs.astro.build/en/guides/content-collections/)
- [Framework components / islands](https://docs.astro.build/en/guides/framework-components/)
- [Styling and Tailwind](https://docs.astro.build/en/guides/styling/)

## graphify

graphify builds a knowledge graph at `graphify-out/` (gitignored — derived, and faster to
rebuild than to review in a diff). A `post-commit` hook rebuilds it after every commit,
AST-only and detached, so `git commit` returns immediately.

**Know what this graph is worth here before trusting it.** tree-sitter has no `.astro`
grammar, so every `.astro` file fails to parse and contributes 1–3 nodes. In the current
build `package.json` yields 27 nodes while `AgentTrace.astro` yields 1, and `profile.ts` —
the single source of truth for every fact on the site — yields 2. The graph is a rough
orientation aid for the TypeScript and content layers; it is **not** a substitute for reading
the components, and the rules below should not stop you from grepping when the graph is thin.

`.graphifyignore` excludes `.claude/` and `.agents/`. Without it the agent tooling swamps the
graph — the first build was 2392 nodes, of which the actual site was under 10%.

**Optional, not mandatory.** An earlier version of this file required a `graphify query` before
reading any source file. That rule was removed: it cost a tool round-trip before every read, on a
codebase where the graph cannot parse the files being read. This site is ~15 files. Read them.

Use it when it actually helps:
- `graphify query "<question>"` / `path "<A>" "<B>"` / `explain "<concept>"` for orientation in the
  TypeScript and content layers, where the AST is real.
- Do not run it before reading a `.astro` file. It has nothing to say about them.
- After a substantial refactor, `graphify update .` keeps it current (AST-only, no API cost).
