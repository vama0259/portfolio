/**
 * Accessibility gate. Serves the built `dist/` with `astro preview` and runs
 * pa11y-ci (WCAG2AA, via `pa11yci.config.cjs`) against every page, failing
 * CI on any error-level violation.
 *
 * pa11y-ci was chosen over @axe-core/cli specifically because it drives
 * Chromium through puppeteer, which npm-installs its own browser binary. The
 * axe-core CLI instead drives *system* Chrome through selenium-webdriver +
 * chromedriver, and on a machine with no system Chrome installed (true of
 * this dev box) it hangs indefinitely waiting for a browser that will never
 * appear rather than failing fast. That is exactly the kind of flakiness
 * this script exists to avoid.
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

const PORT = 4173; // must match PORT in pa11yci.config.cjs
const HOST = "127.0.0.1";
const BASE = `http://${HOST}:${PORT}`;
const START_TIMEOUT_MS = 30_000;
const POLL_INTERVAL_MS = 250;

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

    console.log(`Running pa11y-ci against the pages in pa11yci.config.cjs...`);

    const code = await run("npx", ["pa11y-ci", "--config", "pa11yci.config.cjs"]);

    if (code !== 0) {
      console.error("\n✗ accessibility: pa11y-ci reported violations (see above)\n");
      process.exitCode = code;
      return;
    }

    console.log(`\n✓ accessibility: all pages clean against WCAG2AA\n`);
  } finally {
    shutdown();
  }
}

main();
