import type { APIRoute } from "astro";

/**
 * robots.txt is generated rather than kept in `public/` so the sitemap URL can
 * never drift from `site` in astro.config.mjs.
 *
 * This matters because the domain is expected to change: the site currently
 * lives on a *.pages.dev subdomain and will likely move to a custom domain.
 * A hardcoded public/robots.txt would keep pointing search engines at the old
 * host after that move, and nothing would fail loudly enough to notice.
 * Changing `site` in the config is now the only edit that migration needs.
 */
export const GET: APIRoute = ({ site }) => {
  if (!site) {
    throw new Error(
      "astro.config.mjs is missing `site`. It is required to emit an absolute " +
        "sitemap URL in robots.txt.",
    );
  }

  const body = [
    "User-agent: *",
    "Allow: /",
    "",
    `Sitemap: ${new URL("sitemap-index.xml", site).href}`,
    "",
  ].join("\n");

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
