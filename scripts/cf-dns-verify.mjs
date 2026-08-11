/**
 * Verify the live DNS and edge behaviour of the deployed site.
 *
 * Needs no credentials: it checks what the public internet actually sees,
 * which is the only thing that matters. Run it after any DNS or Cloudflare
 * settings change.
 *
 *   node scripts/cf-dns-verify.mjs [domain]
 */
import { promises as dns } from "node:dns";

const DOMAIN = process.argv[2] ?? "varunmalhotra.net";
const failures = [];
const ok = [];

const pass = (m) => ok.push(m);
const fail = (m) => failures.push(m);

/** Flatten TXT chunks — DNS splits long strings into 255-char segments. */
const txt = async (name) => {
  try {
    return (await dns.resolveTxt(name)).map((chunks) => chunks.join(""));
  } catch {
    return [];
  }
};

// --- SPF -------------------------------------------------------------------
const apexTxt = await txt(DOMAIN);
const spf = apexTxt.filter((r) => r.toLowerCase().startsWith("v=spf1"));
if (spf.length === 0) {
  fail("no SPF record — anyone can send mail claiming to be this domain");
} else if (spf.length > 1) {
  // More than one SPF is a spec violation; receivers treat it as permerror
  // and typically ignore SPF entirely, which is worse than having none.
  fail(`${spf.length} SPF records found — must be exactly one: ${spf.join(" | ")}`);
} else {
  pass(`SPF: ${spf[0]}`);
  if (!/[-~]all/.test(spf[0])) {
    fail(`SPF does not end in -all or ~all, so it authorises nothing explicitly: ${spf[0]}`);
  }
}

// --- DMARC -----------------------------------------------------------------
const dmarcTxt = await txt(`_dmarc.${DOMAIN}`);
const dmarc = dmarcTxt.find((r) => r.toLowerCase().startsWith("v=dmarc1"));
if (!dmarc) {
  fail("no DMARC record — SPF failures will still be delivered by most receivers");
} else {
  pass(`DMARC: ${dmarc}`);
  const policy = /p=(\w+)/.exec(dmarc)?.[1];
  if (policy === "none") {
    fail("DMARC policy is p=none (monitor only) — forged mail is still delivered");
  }
}

// --- apex + www resolve ----------------------------------------------------
for (const host of [DOMAIN, `www.${DOMAIN}`]) {
  // dns.lookup (getaddrinfo, the OS resolver) rather than dns.resolve4.
  // resolve4 talks to a resolver directly and, on Windows, aborted queries
  // can trip a libuv assertion that kills the process mid-run — it reported
  // "does not resolve" for hosts that plainly did resolve via nslookup and
  // curl. A verification script that lies is worse than no script.
  try {
    const addrs = await dns.lookup(host, { all: true });
    if (addrs.length) {
      const v4 = addrs.filter((a) => a.family === 4).length;
      const v6 = addrs.filter((a) => a.family === 6).length;
      pass(`${host} resolves (${v4} IPv4, ${v6} IPv6)`);
    } else {
      fail(`${host} does not resolve`);
    }
  } catch (e) {
    fail(`${host} does not resolve: ${e.code ?? e.message}`);
  }
}

// --- HTTP behaviour --------------------------------------------------------
const head = async (url) => {
  try {
    const res = await fetch(url, { redirect: "manual" });
    return { status: res.status, location: res.headers.get("location") };
  } catch (e) {
    return { error: e.message };
  }
};

const httpApex = await head(`http://${DOMAIN}/`);
if (httpApex.status === 301 || httpApex.status === 308) {
  if (httpApex.location?.startsWith("https://")) {
    pass(`http://${DOMAIN} -> ${httpApex.status} ${httpApex.location}`);
  } else {
    fail(`http://${DOMAIN} redirects to a non-https target: ${httpApex.location}`);
  }
} else {
  fail(`http://${DOMAIN} returned ${httpApex.status ?? httpApex.error} — expected a 301 to https`);
}

// www must redirect to the apex, preserving the path, or the canonical tags
// and the served URL disagree and Google sees duplicate content.
const wwwDeep = await head(`https://www.${DOMAIN}/work`);
if (wwwDeep.status === 301 || wwwDeep.status === 308) {
  if (wwwDeep.location === `https://${DOMAIN}/work`) {
    pass(`https://www.${DOMAIN}/work -> ${wwwDeep.location} (path preserved)`);
  } else {
    fail(`www redirect loses the path: /work went to ${wwwDeep.location}`);
  }
} else if (wwwDeep.status === 200) {
  fail(`https://www.${DOMAIN}/work serves 200 — it should 301 to the apex, or you have two canonical hostnames`);
} else if (wwwDeep.status === 522 || wwwDeep.status === 523) {
  // Specific and common: a www CNAME exists, so the name resolves, but no
  // origin is bound to it — the Worker custom domain covers the apex only.
  // Cloudflare then times out reaching an origin that was never there.
  // A redirect rule fixes it because redirect rules run at the edge, before
  // Worker routing, so the request never needs an origin at all.
  fail(
    `https://www.${DOMAIN}/work returned ${wwwDeep.status} (no origin bound to www). ` +
      `Add a Redirect Rule: hostname eq "www.${DOMAIN}" -> 301 ` +
      `concat("https://${DOMAIN}", http.request.uri.path)`,
  );
} else {
  fail(`https://www.${DOMAIN}/work returned ${wwwDeep.status ?? wwwDeep.error}`);
}

// --- report ----------------------------------------------------------------
for (const m of ok) console.log(`  ✓ ${m}`);
if (failures.length) {
  console.error(`\n✗ ${failures.length} issue(s):\n`);
  for (const m of failures) console.error(`  - ${m}`);
  console.error("");
  process.exit(1);
}
console.log(`\n✓ ${DOMAIN}: DNS, mail policy and redirects all correct`);
