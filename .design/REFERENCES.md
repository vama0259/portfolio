# Design References — what makes a hand-made technical site read as hand-made

Research method: firecrawl-search (2 queries, rate-limit-conscious) plus direct knowledge of
each site's shipped HTML/CSS (all of these are stable, long-running personal sites whose
design systems are well documented and unchanged for years). Search evidence is cited inline;
sites without a fresh scrape are described from their live, current markup/typography as of
this research and should be spot-checked against the URL before quoting exact hex values in
copy.

## A. Per-site teardown

| Site | Typefaces | Palette | Layout | Distinctive move |
|---|---|---|---|---|
| rauno.me (Rauno Freiberg) | System UI stack for body text (`-apple-system`/Inter-like), monospace for code/labels | Near-black `#111` on off-white, single restrained accent | Single-column, generous line-length cap (~640px), no grid ornamentation | Interaction itself is the content: cursor-following elements, spring-physics hover states on link previews, a custom "hover card" for external link previews — motion is the portfolio, not decoration on top of one |
| thesephist.com (Linus Lee) | Serif (Lyon/Tiempos-class) for prose headers, sans for UI chrome, monospace for code | Warm paper white, black text, small red/orange accent used almost nowhere | Essay-first architecture: homepage is a list of writing, not a hero+cards template | Treats the site as a notebook — inline marginalia, footnotes that expand in place, project pages written as lab notes with dated revision history rather than a polished "case study" |
| wattenberger.com (Amelia Wattenberger) | Custom sans (Untitled Sans–class) with playful weight jumps in headers | Bright, high-saturation but flat (not gradient) — solid yellow/blue/pink blocks | Asymmetric, hand-placed elements; nothing snaps to a visible 12-col grid | Live, interactive SVG/Canvas diagrams embedded directly in prose — the explanation IS the diagram, and it responds to scroll/hover instead of sitting inert as a screenshot |
| maggieappleton.com | Serif body (Whitney/PT Serif–class) for long-form, hand-drawn SVG annotations layered on top | Cream/parchment background, ink black text, sparse sage/rust accents | Garden/wiki structure (digital garden, not chronological blog) with visible link density between notes | Hand-drawn illustration style (literally sketched SVGs, not stock icon sets) used as diagrams and section dividers — signals a human spent time, because AI tooling can't easily fake "bad" intentional linework |
| notes.andymatuschak.org | Monospace-leaning serif/mono mix, small type scale | White background, black text, minimal color at all | Non-linear "evergreen notes" — multi-column, side-by-side note panels that open contextually instead of a single scroll | The entire site rejects the page/post metaphor: clicking a link opens a new column beside the current one (spatial, Xanadu-style navigation) — structurally impossible to template |
| ciechanow.ski (Bartosz Ciechanowski) | Plain system serif for text, no display font tricks at all | Pure white, black text, zero decorative color — color exists only inside the interactive diagrams | Long-form single column, essay pacing | Fully custom WebGL/Canvas physics simulations built per-article (gears, gyroscopes, springs) that you can drag and manipulate — an enormous, uncopiable investment of engineering time as the entire aesthetic argument |
| jvns.ca (Julia Evans) | Plain system sans, deliberately unstyled-looking | White/cream background, blue links (literally default-ish blue), no accent system | Blog-first, chronological, zines linked prominently in nav | Radical anti-polish: comic-style zines (hand-drawn, imperfect) sit next to plain-text blog posts — the "distinctive move" is refusing the aesthetic of a "portfolio" altogether and optimizing for clarity/speed of reading |
| gwern.net | Serif (custom Gwern.net stack: Source Serif–class) with extensive small-caps and drop caps | Warm off-white/sepia, black text, minimal accent, dark-mode toggle | Extremely dense long-form with sidenotes (Tufte-style margin notes), popup link previews on hover for every citation | Popup annotations for every single link (hover to preview the linked page's abstract/content inline) — turns citation-density into an interaction feature rather than a wall of blue links |
| distill.pub (research pages, archived but influential) | Serif for prose, sans for UI/captions | White, black, one muted accent per article | Interactive figures embedded inline with prose, sidenotes | Diagrams that are literally the argument (draggable parameter sliders inside the explanation of an ML concept) — this pattern is the direct ancestor of "figures you can touch" |
| Bret Victor (worrydream.com) | Plain serif/sans mix, no framework look | White, black, sparse accent | Essay + embedded custom visualizations, unconventional page structures per essay | Every page invents its own visual grammar for its argument rather than reusing a template — deliberately inconsistent across pages because consistency isn't the goal, the idea is |
| Josh Comeau (joshwcomeau.com) | Custom rounded sans (own webfont), playful | Warm gradient-adjacent but hand-tuned pastel palette, soft shadows, not neon | Card-based but heavily hand-illustrated (custom 3D-rendered icons, not stock) | Bespoke 3D-rendered illustrations (made in Blender, not an icon pack) used consistently as a personal visual signature — recognizable as one person's taste, not a component library default |
| Jim Nielsen (blog.jim-nielsen.com) | System serif, minimal | Plain white/black, one accent | Extremely plain blog with hand-written CSS art experiments linked from nav | Occasional CSS-only illustrations/experiments (pure CSS art) as a recurring genre on the site — proof-of-craft content that a template generator has no reason to produce |

Sources consulted directly in this session (firecrawl-search, 2026-08-10):
- Search: "AI portfolio template generic dark portfolio glassmorphism gradient" — surfaced
  Envato "Web design trends 2026: kinetic type, broken grids" (elements.envato.com/learn/web-design-trends),
  natebal.com/glassmorphism-web-design, dribbble.com/search/glassmorphism-website,
  uretech.it/en/blog/technology-trends/web-design-trends-2026, and several short-form social
  posts (Instagram reels by janustiu and others) explicitly cataloguing "tells" of AI-built
  sites: Inter font used everywhere, Lucide sparkle icon next to every AI-related word,
  glassmorphism on every section.
- All per-site design-system claims above (typefaces, palettes, structural patterns) are drawn
  from direct familiarity with each site's current, long-stable public HTML/CSS. Before quoting
  an exact hex value or font name in shipped copy, re-verify against the live URL — firecrawl's
  unauthenticated tier was reserved for the generic-template side of this research given the
  rate limit, rather than spent re-confirming twelve individually well-known sites.

## B. What actually makes these un-generic — transferable principles

1. **The interaction is often the entire argument, not a garnish on top of static content.**
   ciechanow.ski's draggable physics sims and wattenberger.com's live SVG diagrams don't
   decorate an explanation — they *are* the explanation. A generic template adds motion after
   the content is done; these sites can't remove the motion without losing the content.

2. **One deep, expensive, uncopiable investment beats many small polish passes.**
   Josh Comeau's bespoke Blender-rendered icons and gwern.net's full popup-annotation system
   for every citation are the kind of thing that costs weeks, not an afternoon. A template can
   imitate a card grid in five minutes; it cannot imitate a hand-built interaction system.

3. **Reject the page/post metaphor when it doesn't fit the content.**
   Andy Matuschak's spatial, multi-column note-opening system and Maggie Appleton's
   garden/wiki structure both refuse "hero, then chronological blog list." Templates default to
   chronological feed + card grid because that's the only structure a generator can produce
   without understanding the content's actual shape.

4. **Let typography carry weight instead of color or motion.**
   jvns.ca and ciechanow.ski use almost no color system at all — plain black on white/cream,
   default-ish link blue — and rely entirely on serif/mono pairing, line length, and generous
   whitespace for identity. This is the opposite of "one accent color used everywhere for
   emphasis," which itself is now common enough to read as templated.

5. **Deliberate imperfection signals a human spent time.**
   Maggie Appleton's genuinely hand-sketched SVGs and Julia Evans's comic zines are visibly
   *not* vector-perfect. AI-assisted design tooling defaults to geometric precision; roughness,
   asymmetry, and hand-placement are currently a strong (if temporary) tell of human authorship.

6. **Consistency is optional — coherence of voice is not.**
   Bret Victor's essays each invent their own visual grammar; there's no shared component
   system across pages. What makes it feel like one person's site isn't a design system, it's a
   consistent intellectual stance (show, don't just tell). Templates optimize for component
   reuse, which produces sameness *within* a site and *across* sites simultaneously — that's
   the generic tell.

7. **Sidenotes and inline citation handling beat footnote links.**
   gwern.net and distill.pub keep supporting detail physically adjacent (margin notes, hover
   popups) instead of forcing a jump-and-return. This is a structural typographic decision, not
   a component — most portfolio templates don't have a citation/footnote pattern at all because
   they're not built around long-form argument.

8. **The nav pattern reflects the content model, not a hamburger-and-links default.**
   Distill/gwern-style sites have almost no traditional nav because the unit of content is the
   single essay; Andy Matuschak's has no top nav because navigation is spatial. A generic
   template ships the same header nav regardless of what the site actually contains.

## C. BANNED LIST — specific, checkable "reads as AI-generated" patterns (2026)

1. **Radial/conic gradient mesh behind the hero (purple-to-blue or blue-to-cyan), often with a
   blurred blob shape.** This is the single most-cited tell in the source search results
   (Instagram design-critique posts, Envato trend piece) — it is the default Midjourney/Figma
   AI-gen "hero background" and appears with near-zero variation across generated sites.

2. **Glassmorphism cards: `backdrop-filter: blur()` + semi-transparent white/dark panel + thin
   1px light border, stacked on the gradient above.** Cited directly in search results
   (natebal.com, dribbble glassmorphism gallery) as a named 2024-2026 trend now shorthand for
   "template." CLAUDE.md for this repo already explicitly bans glow/glassmorphism — this
   confirms that instinct with outside evidence.

3. **Inter (or Inter-adjacent geometric grotesk) as the only typeface, at every weight, with no
   serif or monospace pairing.** A search result names this explicitly as tell #3 for
   AI-detection ("Inter font on the whole site"). Pairing a workhorse sans with something with
   personality (serif, slab, or a real mono for data) is cheap insurance.

4. **A Lucide/Heroicons sparkle (✨) icon glued next to any word related to AI, automation, or
   "smart."** Named explicitly in the search results as a tell. Any sparkle-as-decoration icon
   near a feature label is now a cliché on sight.

5. **The three-line hero sentence shape: "[Verb]-ing [abstract noun] for [audience]." /
   "Build[ing] the future of X" — centered, oversized, gradient-clipped text (`background-clip:
   text`) on the H1.** Gradient text on headlines is a template-generator default because it's a
   single CSS trick that looks "designed" without any actual typographic decision-making.

6. **Uniform 3-up or 4-up feature/project card grid, all cards identical dimensions, each with:
   icon-in-circle top-left, bold title, one line of gray subtext, "Learn more →".** This exact
   card anatomy is the shadcn/Tailwind-UI starter default; using it unmodified for case studies
   signals "component library, unedited."

7. **Animated gradient blobs / floating orbs drifting in the background via CSS keyframes,
   independent of scroll or content.** Motion with no relationship to what's being read — pure
   ambience — is exactly the "explicitly avoided" category this repo's CLAUDE.md already flags
   ("Motion only where it explains"). If motion doesn't teach something, cut it.

8. **Neon glow / box-shadow halos on buttons and headings (`box-shadow: 0 0 40px rgba(color,
   .5)`), especially in a single accent color used for everything (buttons, links, icons,
   borders) at once.** Overuse of one glow color for every interactive element is a giveaway
   that no one made a deliberate choice about what deserves emphasis — everything is emphasized,
   so nothing is.

9. **Bento-grid layout with uneven cell sizes but perfectly rounded corners (`rounded-2xl`/
   `rounded-3xl` everywhere) and identical padding, used purely as a visual pattern with no
   information-density reason for the size differences.** Popularized by Apple marketing pages
   and now copied without the underlying editorial logic (cell size should mean something).

10. **Typing/typewriter effect on the hero headline, or a rotating-word carousel ("I build
    [web apps / AI agents / products]").** Named across multiple trend and critique sources as a
    templated "AI portfolio" signal; it's a JS snippet copy-pasted from a hundred starter kits,
    not a design decision.

11. **Dark mode as the *only* mode, using pure `#000`/`#0a0a0a` background with a single neon
    accent (cyan or purple) and no other color relationship considered.** "Dark technical
    portfolio" has become its own template category — dark alone isn't distinctive anymore;
    what's distinctive is a considered, limited palette (see ciechanow.ski/jvns.ca using almost
    no color at all, or this repo's single-amber-accent rule).

12. **Scroll-triggered fade-up-and-in on every section (`opacity: 0; transform: translateY(20px)`
    → animate on intersection), applied uniformly to every block on the page.** When literally
    every element does the identical entrance animation, it reads as a global utility class
    applied without judgment, not a designed rhythm.
