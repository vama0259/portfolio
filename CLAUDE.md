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
  layouts/Base.astro     shell: head, nav, grid overlay, footer
  components/
    AgentTrace.astro     scroll-driven ReAct diagram — pure CSS, zero JS
    MetricStrip.astro    the repeating label/value/basis unit
    WorkCard.astro       case study card
    CountUp.tsx          the only React island on the site
  pages/                 index, work/, work/[...slug], research, about
  styles/global.css      design tokens in @theme (Tailwind v4, CSS-first)
```

### The schema enforces the editorial rules

`src/content.config.ts` requires `problem`, `tradeoff`, `wouldChange`, and a `basis` on every
metric. This is deliberate — the rules are "open with the problem, cite every number, admit
what you'd change," and the build fails rather than trusting anyone to remember them. Do not
loosen the schema to make a case study easier to write; write the missing part.

Note that YAML parses a bare `2024` as a number — quote `period` values.

## Design direction: "the offprint"

The site is a contemporary scientific offprint. Light ledger paper by default, Spectral for
text, Archivo for utility, Martian Mono for figures only, one proof-correction red. Every
corner is `0px`. There are no cards.

The full spec — tokens with verified contrast ratios, the `.sheet` grid, component
composition, per-page layouts, ship checklist — is `.design/DIRECTION.md`. Read it before
changing anything visual. `.design/REFERENCES.md` §C is a banned list of visual patterns that
read as machine-generated; check work against it.

The premise it replaced was "instrument panel" — dark, amber, mono micro-labels. It was
discarded, not tuned: near-black plus one bright accent is a top-two identifiable AI default,
and a competent instance of the most common answer still reads as generated. Do not drift back
toward it.

Two rules carry the identity:

- **`basis` is the visual signature.** Every metric's basis renders as a margin note in the
  apparatus rail, keyed by a superscript anchor. Real in-page anchors — the apparatus must work
  with JS *and* CSS disabled. This is the schema rule made visible; it is why the design cannot
  decay away from the content.
- **The accent has exactly three permitted uses**: the errata marker, the `production` status
  glyph, and focus/basis markers. A fourth use is a regression.

### Motion budget

Concentrated, never sprinkled. The entire budget is spent on **Fig. 1, the ReAct trace**, which
is a simulation rather than a diagram: the reader drives a query through the loop, watches it
stall at the human-in-the-loop gate, and watches a write bounce off the read-only guardrail. The
interaction *is* the argument — a reader tests the guardrail claim instead of taking it on faith.

Everywhere else, motion is limited to interface physics on state: focus, hover, the nav
underline, the basis-marker link. Spring curves, ~120–180ms, critically damped so things settle
rather than bounce.

- **No scroll-reveal. Anywhere.** Nothing fades in because it entered the viewport. Uniform
  fade-up is on the banned list and spring-easing everything is its successor.
- First paint is the final state. No entrance animation stands between a hurried reader and the
  results table.
- Fig. 1 must be complete and readable with JS off. Motion is enhancement, never a prerequisite.
- Everything respects `prefers-reduced-motion`.

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
