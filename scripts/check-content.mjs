/**
 * Content-integrity gate. Runs against the BUILT html in dist/, because the
 * only thing that matters is what a visitor actually receives.
 *
 * Every assertion here exists because the thing it checks for went wrong at
 * least once. This is a regression net, not a style preference:
 *
 *   - The site shipped an HTML comment containing the design brief on all
 *     seven pages, visible in View Source.
 *   - The footer printed the design direction's internal codename.
 *   - A metric once rendered as "0 analysts served" because an animation
 *     blanked the real value before running.
 *   - Claiming project lead on Talk to Data is a reference-check risk, not a
 *     style question. See src/data/profile.ts.
 *
 * Exit code 1 fails CI.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const DIST = "dist";
const failures = [];
const fail = (page, msg) => failures.push(`${page}: ${msg}`);

/** Every .html file under dist/, recursively. */
function htmlFiles(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...htmlFiles(p));
    else if (name.endsWith(".html")) out.push(p);
  }
  return out;
}

/**
 * Internal vocabulary that must never reach a visitor. These are design-process
 * words: they mean nothing to a reader and signal leaked process.
 */
const INTERNAL_TERMS = [
  "swiss technical",
  "the offprint",
  "instrument panel",
  "kinetic editorial",
  "dark cinematic",
  "mockup",
  "design direction",
  "own-world",
  "banned list",
  "lorem ipsum",
];

/** Wording that is a reference-check risk on Talk to Data. */
const FORBIDDEN_CLAIMS = [
  /\bled the\b/i,
  /\bproject lead\b/i,
  /\bteam of \d/i,
  /\bmanaged a team\b/i,
];

let pages;
try {
  pages = htmlFiles(DIST);
} catch {
  console.error(`✗ ${DIST}/ not found — run \`npm run build\` first.`);
  process.exit(1);
}

if (pages.length === 0) {
  console.error(`✗ no .html files found in ${DIST}/`);
  process.exit(1);
}

for (const file of pages) {
  const page = relative(DIST, file);
  const html = readFileSync(file, "utf8");
  const lower = html.toLowerCase();

  // 1. No HTML comments at all. An Astro comment {/* */} is compiled away; an
  //    HTML comment ships. We have no legitimate need for one, so any comment
  //    is either leaked process or dead markup. (Conditional comments for IE
  //    are long dead.)
  const comments = html.match(/<!--(?!\[if)[\s\S]*?-->/g) ?? [];
  for (const c of comments) {
    fail(page, `ships an HTML comment: ${c.slice(0, 80).replace(/\s+/g, " ")}…`);
  }

  // 2. No internal design vocabulary.
  for (const term of INTERNAL_TERMS) {
    if (lower.includes(term)) fail(page, `contains internal term "${term}"`);
  }

  // 3. No ownership claims that overstate the role.
  for (const re of FORBIDDEN_CLAIMS) {
    const m = html.match(re);
    if (m) fail(page, `contains forbidden claim "${m[0]}"`);
  }

  // 4. Every metric figure must be accompanied by a basis. The design renders
  //    basis captions as .basis elements; if a page shows figures it must show
  //    at least as many bases as metric blocks.
  const metricBlocks = (html.match(/class="[^"]*\bwm\b[^"]*"/g) ?? []).length;
  const bases = (html.match(/class="[^"]*\bbasis\b[^"]*"/g) ?? []).length;
  if (metricBlocks > 0 && bases < metricBlocks) {
    fail(page, `${metricBlocks} metric blocks but only ${bases} basis captions`);
  }

  // 5. No placeholder or unfinished markers.
  for (const marker of ["TODO", "FIXME", "XXX:", "PLACEHOLDER"]) {
    if (html.includes(marker)) fail(page, `contains "${marker}"`);
  }

  // 6. Every page needs a unique, non-empty title and description.
  const title = html.match(/<title>([^<]*)<\/title>/)?.[1]?.trim();
  const desc = html.match(/<meta name="description" content="([^"]*)"/)?.[1]?.trim();
  if (!title) fail(page, "missing <title>");
  if (!desc) fail(page, "missing meta description");
  if (desc && desc.length < 50) {
    fail(page, `meta description is only ${desc.length} chars (want >= 50)`);
  }
}

// 7. Descriptions must actually be distinct across pages — four pages once
//    shared a single description.
const descs = new Map();
for (const file of pages) {
  const html = readFileSync(file, "utf8");
  const d = html.match(/<meta name="description" content="([^"]*)"/)?.[1];
  if (!d) continue;
  if (!descs.has(d)) descs.set(d, []);
  descs.get(d).push(relative(DIST, file));
}
for (const [d, files] of descs) {
  if (files.length > 1) {
    failures.push(`duplicate meta description across ${files.join(", ")}: "${d.slice(0, 60)}…"`);
  }
}

if (failures.length) {
  console.error(`\n✗ content integrity: ${failures.length} failure(s)\n`);
  for (const f of failures) console.error(`  - ${f}`);
  console.error("");
  process.exit(1);
}

console.log(`✓ content integrity: ${pages.length} pages clean`);
