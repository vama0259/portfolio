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

## Design direction: "instrument panel"

Dark, dense, monospace numerals, one accent (amber `--color-signal`). The premise is that the
site should look like the observability tooling Varun builds, not like a sci-fi movie.

- **Amber is for live values and nothing else.** Spending it on decoration kills the signal.
- **Numbers always use `.num`** (monospace, tabular). A figure should look like a measurement.
- **Motion only where it explains.** The agent trace earns animation because it teaches the
  ReAct loop. Nothing else should move without a comparable argument.
- Explicitly avoided: purple/blue gradients, particle fields, glow, typing effects — the
  templated "AI portfolio" signals.

All motion sits behind `@supports (animation-timeline: view())` and `prefers-reduced-motion`,
and degrades to a static, fully legible state.

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

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
