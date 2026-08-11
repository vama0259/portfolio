/**
 * SEO check over the built output. Not a test suite — a printout of the 30
 * audited metrics so a rebuild can be re-scored without re-reading dist/ by
 * hand. Run: `npm run build && node .design/_seo.cjs`.
 */
const fs = require("fs");
const path = require("path");

const DIST = path.join(__dirname, "..", "dist");
const pages = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith(".html")) pages.push(p);
  }
})(DIST);

const rel = (p) => "/" + path.relative(DIST, p).replace(/\\/g, "/");
const site = pages
  .filter((p) => !/(a-kinetic|b-cinematic|c-technical)\.html$/.test(p))
  .map((p) => ({ file: rel(p), html: fs.readFileSync(p, "utf8") }));

// Lengths must be measured on decoded text: "&amp;" is one character in a SERP
// and five in the markup, which is enough to fake a title-length failure.
const decode = (s = "") =>
  s
    .replace(/&amp;/g, "&")
    .replace(/&mdash;/g, "—")
    .replace(/&middot;/g, "·")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
const grab = (h, re) => decode((h.match(re) || [])[1]);
const rows = [];

for (const { file, html } of site) {
  const head = html.slice(0, html.indexOf("</head>"));
  const title = grab(head, /<title>([\s\S]*?)<\/title>/) || "";
  const desc = grab(head, /name="description" content="([\s\S]*?)"/) || "";
  const isNoindex = /name="robots" content="noindex/.test(head);
  const h1s = html.match(/<h1[\s>]/g) || [];
  const ld = [...head.matchAll(/application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)];
  let types = [];
  for (const m of ld) {
    try {
      const j = JSON.parse(m[1]);
      types = types.concat((j["@graph"] || [j]).map((n) => n["@type"]));
    } catch (e) {
      types.push("PARSE-ERROR");
    }
  }
  rows.push({
    file,
    // title/desc are carried for the uniqueness checks and kept out of the
    // printed table by the explicit column list passed to console.table
    title,
    desc,
    noindex: isNoindex,
    titleLen: title.length,
    descLen: desc.length,
    h1: h1s.length,
    canonical: /rel="canonical"/.test(head),
    robots: (grab(head, /name="robots" content="([^"]*)"/) || "").slice(0, 20),
    ogType: grab(head, /property="og:type" content="([^"]*)"/),
    schema: types.join("+"),
    preload: (head.match(/rel="preload" as="font"/g) || []).length,
    imgNoAlt: (html.match(/<img(?![^>]*\balt=)[^>]*>/g) || []).length,
    svgNoLabel: (html.match(/<svg(?![^>]*aria-)[^>]*>/g) || []).length,
  });
}

console.table(rows, [
  "file",
  "noindex",
  "titleLen",
  "descLen",
  "h1",
  "canonical",
  "ogType",
  "schema",
  "preload",
  "imgNoAlt",
  "svgNoLabel",
]);

const problems = [];
for (const r of rows) {
  if (r.titleLen > 60) problems.push(`${r.file}: title ${r.titleLen} chars (>60)`);
  // A noindexed page has no snippet to size, so only require that it has one.
  if (r.noindex ? r.descLen === 0 : r.descLen < 120 || r.descLen > 160)
    problems.push(`${r.file}: description ${r.descLen} chars (want 120-160)`);
  if (r.h1 !== 1) problems.push(`${r.file}: ${r.h1} h1 tags`);
  if (!r.canonical) problems.push(`${r.file}: no canonical`);
  if (!r.robots) problems.push(`${r.file}: no robots directive`);
  if (r.schema.includes("PARSE-ERROR")) problems.push(`${r.file}: invalid JSON-LD`);
  if (r.imgNoAlt) problems.push(`${r.file}: ${r.imgNoAlt} <img> without alt`);
  if (r.svgNoLabel) problems.push(`${r.file}: ${r.svgNoLabel} <svg> without aria-*`);
  if (r.preload !== 2) problems.push(`${r.file}: ${r.preload} font preloads (want 2)`);
}

const titles = rows.map((r) => r.title);
if (new Set(titles).size !== titles.length) problems.push("duplicate <title> across pages");
const descs = rows.map((r) => r.desc);
if (new Set(descs).size !== descs.length) problems.push("duplicate meta descriptions across pages");

for (const f of ["robots.txt", "sitemap-index.xml", "sitemap-0.xml", "site.webmanifest", "_headers", "og-image.png", "404.html"]) {
  if (!fs.existsSync(path.join(DIST, f))) problems.push(`missing dist/${f}`);
}
const sm = fs.readFileSync(path.join(DIST, "sitemap-0.xml"), "utf8");
if (/(a-kinetic|b-cinematic|c-technical)/.test(sm)) problems.push("mockups present in sitemap");
if (/404/.test(sm)) problems.push("404 present in sitemap");

// Every sitemap <loc> must be byte-identical to that page's own canonical, or
// the two are advertising different URLs for the same document.
// `https://host` and `https://host/` are the same URL per RFC 3986 (an empty
// path normalises to "/"), so the root is compared normalised. /work vs /work/
// are NOT equivalent and are compared exactly.
const norm = (u) => u.replace(/^(https?:\/\/[^/]+)$/, "$1/");
const canonicals = new Set(
  site
    .filter((p) => !/name="robots" content="noindex/.test(p.html))
    .map((p) => norm(grab(p.html, /rel="canonical" href="([^"]*)"/))),
);
for (const loc of sm.match(/<loc>([^<]*)<\/loc>/g) || []) {
  const url = norm(loc.replace(/<\/?loc>/g, ""));
  if (!canonicals.has(url)) problems.push(`sitemap ${url} is not any page's canonical`);
}
const robotsTxt = fs.readFileSync(path.join(DIST, "robots.txt"), "utf8");
if (!/^Sitemap:\s*\S+sitemap-index\.xml/m.test(robotsTxt)) problems.push("robots.txt missing sitemap reference");
for (const m of ["a-kinetic", "b-cinematic", "c-technical"]) {
  if (!new RegExp(`Disallow: /${m}\\.html`).test(robotsTxt)) problems.push(`robots.txt does not disallow ${m}`);
}
console.log("\nsitemap urls:", (sm.match(/<loc>/g) || []).length);

console.log(problems.length ? "\nFAIL\n" + problems.join("\n") : "\nPASS — all checks clean");
