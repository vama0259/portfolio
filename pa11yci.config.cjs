/**
 * pa11y-ci config for scripts/check-a11y.mjs, which starts `astro preview`
 * on PORT below, waits for it to answer, runs this, then tears the server
 * down. Keep PORT in sync with scripts/check-a11y.mjs.
 *
 * WCAG2AA is the standard the rest of the industry gates on. Threshold 0
 * means any error fails the build; pa11y's "notice"/"warning" levels are not
 * counted as errors because they are frequently judgment calls pa11y itself
 * flags as needing a human, not something to break CI over.
 *
 * The page list is kept in sync by hand with scripts/check-a11y.mjs and
 * src/pages/ — a `.astro`-only site gives no cheap way to discover routes
 * automatically.
 */
const PORT = 4173;
const BASE = `http://127.0.0.1:${PORT}`;

const ROUTES = [
  "/",
  "/about",
  "/research",
  "/work",
  "/work/talk-to-data",
  "/work/anomaly-detection",
  "/work/web-agent",
  "/404",
];

module.exports = {
  defaults: {
    standard: "WCAG2AA",
    timeout: 30000,
    wait: 250,
    chromeLaunchConfig: {
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    },
  },
  urls: ROUTES.map((path) => BASE + path),
};
