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
  integrations: [sitemap()],

  // Static output is what keeps the Cloudflare Pages deploy free.
  output: "static",

  vite: {
    plugins: [tailwindcss()],
  },
});
