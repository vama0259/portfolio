/**
 * Accessibility gate. Serves the built `dist/` with `astro preview` and runs
 * @axe-core/cli against every page, failing CI on serious/critical WCAG
 * violations.
 *
 * Runs against the *built* output for the same reason check-content.mjs and
 * check-nojs.mjs do: what a visitor gets is the only thing that matters, and
 * `astro preview` is the closest local stand-in for the static file server
 * Cloudflare Pages will use.
 *
 * Non-flaky by construction: it polls the preview server's own port until it
 * answers HTTP 200 (bounded by a timeout) instead of a blind `sleep`, and it
 * always tears the server down — including on failure — so a bad run cannot
 * leave an orphaned `astro preview` process behind in CI.
 *
 * Exit code 1 fails CI.
 */
import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";

const PORT = 4173;
const HOST = "127.0.0.1";
const BASE = `http://${HOST}:${PORT}`;
const START_TIMEOUT_MS = 30_000;
const POLL_INTERVAL_MS = 250;

// Every route the build emits. Kept in sync by hand — there are five pages
// plus the three case studies, and a `.astro`-only site gives graphify (and
// therefore this script) no cheap way to discover routes automatically.
const PAGES = [
  "/",
  "/about",
  "/research",
  "/work",
  "/work/talk-to-data",
  "/work/anomaly-detection",
  "/work/web-agent",
  "/404",
];

async function waitForServer(url, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(url, { method: "GET" });
      if (res.ok || res.status === 404) return true;
    } catch {
      // Not up yet — keep polling.
    }
    await delay(POLL_INTERVAL_MS);
  }
  return false;
}

function run(cmd, args, opts = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: "inherit", shell: true, ...opts });
    child.on("error", reject);
    child.on("exit", (code) => resolve(code ?? 1));
  });
}

async function main() {
  console.log(`Starting \`astro preview\` on ${BASE} ...`);
  const server = spawn(
    "npx",
    ["astro", "preview", "--port", String(PORT), "--host", HOST],
    { shell: true, stdio: ["ignore", "pipe", "pipe"] },
  );

  let serverOutput = "";
  server.stdout?.on("data", (d) => (serverOutput += d.toString()));
  server.stderr?.on("data", (d) => (serverOutput += d.toString()));

  const shutdown = () => {
    if (!server.killed) {
      server.kill();
    }
  };
  process.on("exit", shutdown);
  process.on("SIGINT", () => {
    shutdown();
    process.exit(1);
  });

  try {
    const ready = await waitForServer(BASE + "/", START_TIMEOUT_MS);
    if (!ready) {
      console.error(`✗ preview server did not respond within ${START_TIMEOUT_MS}ms`);
      console.error(serverOutput);
      process.exitCode = 1;
      return;
    }

    const urls = PAGES.map((p) => BASE + p);
    console.log(`Running axe against ${urls.length} page(s)...`);

    const code = await run("npx", [
      "axe",
      ...urls,
      "--exit",
      "--tags",
      "wcag2a,wcag2aa,wcag21a,wcag21aa",
      "--save",
      "axe-report.json",
    ]);

    if (code !== 0) {
      console.error("\n✗ accessibility: axe reported violations (see above / axe-report.json)\n");
      process.exitCode = code;
      return;
    }

    console.log(`\n✓ accessibility: ${urls.length} page(s) clean against WCAG 2.1 A/AA\n`);
  } finally {
    shutdown();
  }
}

main();
