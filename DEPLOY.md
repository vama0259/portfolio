# Deploying to Cloudflare Pages

This site deploys as a static site on Cloudflare Pages' free tier. Deployment is done
through the Cloudflare dashboard's GitHub integration — **not** from a GitHub Actions
workflow, and no Cloudflare credentials are stored as repo secrets.

## Dashboard settings

When connecting this repository in Cloudflare Pages ("Workers & Pages" → "Create" →
"Pages" → "Connect to Git"), use:

| Setting               | Value           |
| ---------------------- | --------------- |
| Framework preset        | Astro (or None) |
| Build command            | `npm run build` |
| Build output directory  | `dist`          |
| Root directory           | `/`             |
| Node.js version          | `24` (set `NODE_VERSION=24` in the project's Environment Variables if the preset doesn't pick it up) |

No environment variables or secrets are required for the build — the site has no
runtime API keys and `output: "static"` in `astro.config.mjs` means nothing calls out
to a backend at build time either.

## What connecting the repo gives you

Once the GitHub repo is connected, Cloudflare Pages handles the rest automatically:

- **Production deploys** on every push to `main`.
- **Preview deploys** on every pull request, each on its own `*.pages.dev` URL, with a
  status check posted back to the PR — no Actions workflow, no secrets, no additional
  configuration.
- Cloudflare Pages serves `dist/404.html` automatically for any unmatched path, which is
  why `src/pages/404.astro` doesn't need a `_redirects` entry.

GitHub Actions CI (`.github/workflows/ci.yml`) is a separate, independent gate: it
builds and checks the site (types, content integrity, no-JS integrity, accessibility)
but does not deploy anything. Cloudflare's own build is the one that ships.

## If a custom domain gets attached

`astro.config.mjs` hardcodes the canonical domain in `site`:

```js
site: "https://varun-malhotra.pages.dev",
```

That value drives canonical `<link>` tags, the sitemap (`@astrojs/sitemap`),
`robots.txt`, and the OG/Twitter image URLs and JSON-LD `@id`s in
`src/layouts/Base.astro`. If a custom domain (e.g. a `varunmalhotra.me`) is attached in
the Cloudflare Pages dashboard, **update `site` to match in the same commit** — otherwise
canonicals, the sitemap, and structured data will keep advertising the old
`*.pages.dev` host even though the site now serves from the new domain.
