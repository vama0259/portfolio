// @ts-check
import { defineConfig } from "astro/config";

import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  // Update once the Cloudflare Pages project exists (or a custom domain is
  // attached) — this drives canonical URLs.
  site: "https://varun-malhotra.pages.dev",

  // @astrojs/sitemap is build-time-only (walks the static output and writes
  // sitemap-index.xml / sitemap-0.xml to dist/) — it does not add a runtime
  // dependency or touch `output`, so it's free on Cloudflare Pages.
  //
  // No framework integration otherwise. Registering react() emits the ~191 KB
  // client runtime even when nothing hydrates, and nothing here needs it: the
  // counters are CSS `@property` animations and the command palette is vanilla
  // TS on a native <dialog>. Re-add it only alongside an island that earns it.
  integrations: [
    sitemap({
      // The mockups are copied into public/ so the dev server can serve them.
      // They are unlinked reference files with no <title> and no canonical —
      // exactly the thin duplicates that dilute a five-page site. Keep them
      // out of the sitemap; robots.txt disallows them as well.
      filter: (page) => !/\/(a-kinetic|b-cinematic|c-technical)\.html$/.test(page),
      serialize(item) {
        // Priority is a weak signal, but on a site this small the ordering is
        // unambiguous and free to state: home, then work, then everything else.
        //
        // No `lastmod`: the only value available at build time is "now", which
        // would stamp every page as freshly modified on every deploy. Google
        // demotes a lastmod it catches lying, so an absent one beats a false
        // one. Add it back only if it can be sourced per-page (git mtime or
        // frontmatter).
        const path = new URL(item.url).pathname;
        item.changefreq = "monthly";
        item.priority = path === "/" ? 1.0 : /^\/work/.test(path) ? 0.8 : 0.6;
        return item;
      },
    }),
  ],

  // Static output is what keeps the Cloudflare Pages deploy free.
  output: "static",

  // Canonical tags, internal links and BreadcrumbList items all render
  // slash-less (`/work`), but @astrojs/sitemap follows this setting and was
  // emitting `/work/` — a sitemap that disagrees with the canonical it points
  // at is the classic self-inflicted duplicate. Setting it here makes one form
  // authoritative everywhere. Pages are still written as `work/index.html`
  // (build.format stays "directory"); Cloudflare Pages strips the trailing
  // slash on request, so both forms resolve and only one is advertised.
  trailingSlash: "never",

  vite: {
    plugins: [tailwindcss()],
  },
});
