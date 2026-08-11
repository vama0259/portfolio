/**
 * No-JS integrity gate.
 *
 * The site's core contract is that it renders COMPLETE and FACTUALLY CORRECT
 * with JavaScript disabled. This is not a nicety — it is the reason this design
 * was chosen over the alternative. Two competing mockups were rejected because
 * their hero and metric strip depended on JS: with it off, one displayed
 * "0 analysts served, 0% accuracy". A portfolio that shows wrong numbers is
 * worse than one that shows none.
 *
 * This test parses the built HTML as text — never executing a line of the
 * site's JavaScript — and asserts the real figures are present in the markup.
 * If someone reintroduces a `textContent = "0"`-before-animating pattern, or
 * hides content behind a JS-only reveal, this fails.
 *
 * Exit code 1 fails CI.
 */
import { readFileSync, existsSync } from "node:fs";

const failures = [];
const fail = (msg) => failures.push(msg);

const read = (p) => {
  if (!existsSync(p)) {
    fail(`missing built page: ${p}`);
    return "";
  }
  return readFileSync(p, "utf8");
};

/** Strip <script>…</script> so we only assert on what renders without JS. */
const withoutScripts = (html) => html.replace(/<script[\s\S]*?<\/script>/gi, "");

const home = withoutScripts(read("dist/index.html"));
const talk = withoutScripts(read("dist/work/talk-to-data/index.html"));

/**
 * Figures that must be literally present in the served markup.
 * Sourced from src/data/profile.ts and src/content/work/talk-to-data.md.
 * If a number here changes, it must change in the resume too — see CLAUDE.md.
 */
const HOME_FIGURES = ["50+", "95%", "27/wk", "$0.05–0.20"];
for (const fig of HOME_FIGURES) {
  if (!home.includes(fig)) {
    fail(`home page does not contain the figure "${fig}" without JS`);
  }
}

/** The bases that must accompany them. */
const HOME_BASES = ["500-question benchmark", "US and Europe", "stakeholder-reported"];
for (const basis of HOME_BASES) {
  if (!home.toLowerCase().includes(basis.toLowerCase())) {
    fail(`home page is missing basis text "${basis}" without JS`);
  }
}

/**
 * A zeroed figure is the specific failure this file exists to prevent.
 * Catches `>0<`, `>0%<`, `>0+<` inside a value element.
 */
const zeroed = home.match(/class="[^"]*\bv\b[^"]*"[^>]*>\s*(0|0%|0\+|\$0\.00)\s*</g);
if (zeroed) {
  fail(`home page renders a zeroed metric without JS: ${zeroed.join(", ")}`);
}

/**
 * SVG bars must carry a real height in the markup. A bar with height="0" means
 * the chart only draws once JS runs, so a JS-off reader sees empty axes.
 */
const zeroBars = home.match(/<rect[^>]*class="bar-fill[^"]*"[^>]*height="0(\.0+)?"/g);
if (zeroBars) {
  fail(`home page has ${zeroBars.length} SVG bar(s) with height="0" in markup`);
}
const bars = home.match(/<rect[^>]*class="bar-fill[^"]*"[^>]*height="([\d.]+)"/g) ?? [];
if (bars.length === 0) {
  fail("home page has no plotted SVG bars in markup at all");
}

/**
 * Fig. 1's trace must be fully readable without JS: every step name and the
 * guardrail's detail text.
 */
const TRACE_STEPS = [
  "Question arrives",
  "Memory recall",
  "Schema selection",
  "Guardrail",
  "Execution",
  "Answer",
];
for (const step of TRACE_STEPS) {
  if (!talk.includes(step)) {
    fail(`talk-to-data is missing trace step "${step}" without JS`);
  }
}
if (!talk.toLowerCase().includes("read-only enforced")) {
  fail("talk-to-data is missing the guardrail detail text without JS");
}

/**
 * The case study's own metrics and their bases.
 */
for (const fig of ["50+", "95%", "85%", "$0.05–0.20"]) {
  if (!talk.includes(fig)) {
    fail(`talk-to-data does not contain the figure "${fig}" without JS`);
  }
}

/**
 * Interactive controls must be real buttons, not clickable divs — they have to
 * be keyboard operable, and they must exist in markup rather than being
 * injected by script.
 */
const stepButtons = (talk.match(/<button[^>]*class="[^"]*react-step/g) ?? []).length;
if (stepButtons < 6) {
  fail(`talk-to-data has ${stepButtons} react-step <button> elements in markup (want 6)`);
}

/**
 * Nothing may be hidden behind the js-anim gate in a way that removes content:
 * the gate class is set by an inline script, so any element that is only
 * visible *because* JS ran is a contract violation. We approximate by checking
 * no element carries an inline opacity:0.
 */
for (const [name, html] of [["home", home], ["talk-to-data", talk]]) {
  const inlineHidden = html.match(/style="[^"]*opacity:\s*0[^."][^"]*"/g);
  if (inlineHidden) {
    fail(`${name} has ${inlineHidden.length} element(s) with inline opacity:0`);
  }
}

if (failures.length) {
  console.error(`\n✗ no-JS integrity: ${failures.length} failure(s)\n`);
  for (const f of failures) console.error(`  - ${f}`);
  console.error("\nThe site must render complete and correct with JavaScript disabled.");
  console.error("See CLAUDE.md § Motion budget.\n");
  process.exit(1);
}

console.log("✓ no-JS integrity: figures, bases, trace and controls all present without JS");
