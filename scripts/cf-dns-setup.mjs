/**
 * Cloudflare DNS setup — email anti-spoofing records.
 *
 * Wrangler cannot do this: its OAuth scopes are Workers-only (`zone:read`,
 * no DNS write), and it ships no DNS commands. This talks to the REST API
 * directly.
 *
 * WHY THESE RECORDS EXIST
 *
 * The domain publishes no SPF or DMARC policy, which means any server on the
 * internet can send mail claiming to be `@varunmalhotra.net` and receiving
 * mail servers have no way to tell it is forged. That is a live risk even
 * though the domain sends no mail at all — arguably *more* of one, because
 * nobody is watching for it. Someone could phish a recruiter using this
 * domain and the name attached to it.
 *
 *   SPF  (`v=spf1 -all`)  lists which servers may send as this domain.
 *                         `-all` means: none. Correct when you send no mail.
 *   DMARC (`p=reject`)    tells receivers what to do when SPF fails. Without
 *                         it, SPF is advisory and most receivers will still
 *                         deliver the forgery.
 *
 * DKIM is deliberately absent: it signs *outgoing* mail, so it is meaningless
 * until this domain actually sends some.
 *
 * IF YOU LATER ENABLE EMAIL ROUTING: Cloudflare will replace the SPF record
 * with one authorising its own servers. That is expected — re-running this
 * script afterwards would break inbound mail, so don't.
 *
 * USAGE
 *
 *   Create a token at dash.cloudflare.com/profile/api-tokens
 *   using the "Edit zone DNS" template, scoped to varunmalhotra.net only.
 *   Then, in your own terminal so the value is never pasted into a chat:
 *
 *     CLOUDFLARE_API_TOKEN=xxxx node scripts/cf-dns-setup.mjs
 *
 *   Add --dry-run to print what would change without changing it.
 */

const TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const ZONE_NAME = process.env.CF_ZONE ?? "varunmalhotra.net";
const DRY = process.argv.includes("--dry-run");

if (!TOKEN) {
  console.error(
    "\n✗ CLOUDFLARE_API_TOKEN is not set.\n\n" +
      "  Create one at https://dash.cloudflare.com/profile/api-tokens\n" +
      '  Template: "Edit zone DNS"   Zone Resources: Include > Specific zone > ' +
      ZONE_NAME +
      "\n\n  Then run:\n" +
      "    CLOUDFLARE_API_TOKEN=xxxx node scripts/cf-dns-setup.mjs\n",
  );
  process.exit(1);
}

const API = "https://api.cloudflare.com/client/v4";

async function cf(path, init = {}) {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
  const body = await res.json();
  if (!body.success) {
    const msg = (body.errors ?? []).map((e) => `${e.code} ${e.message}`).join("; ");
    throw new Error(`${init.method ?? "GET"} ${path} failed: ${msg || res.status}`);
  }
  return body.result;
}

/**
 * The records to converge on. `name` is fully qualified because the API
 * returns it that way, which keeps the comparison honest.
 */
const desired = [
  {
    type: "TXT",
    name: ZONE_NAME,
    content: "v=spf1 -all",
    comment: "SPF: no server is authorised to send mail as this domain.",
  },
  {
    type: "TXT",
    name: `_dmarc.${ZONE_NAME}`,
    // rua is where aggregate reports go. Harmless if nothing is ever forged;
    // an early warning if something is.
    content: "v=DMARC1; p=reject; rua=mailto:vama0259@gmail.com",
    comment: "DMARC: reject mail failing SPF, report attempts.",
  },
];

const zones = await cf(`/zones?name=${encodeURIComponent(ZONE_NAME)}`);
if (!zones.length) throw new Error(`zone ${ZONE_NAME} not found for this token`);
const zoneId = zones[0].id;
console.log(`zone ${ZONE_NAME} -> ${zoneId}`);

const existing = await cf(`/zones/${zoneId}/dns_records?per_page=100`);

for (const rec of desired) {
  // Match on type+name. For SPF there must be exactly one TXT at the apex
  // starting `v=spf1` — multiple SPF records is a spec violation that makes
  // receivers fail the check entirely, so replace rather than add.
  const prior = existing.find(
    (e) =>
      e.type === rec.type &&
      e.name === rec.name &&
      (rec.content.startsWith("v=spf1")
        ? String(e.content).includes("v=spf1")
        : String(e.content).includes("v=DMARC1")),
  );

  if (prior && prior.content === rec.content) {
    console.log(`= ${rec.name} ${rec.type} already correct`);
    continue;
  }

  if (DRY) {
    console.log(`${prior ? "~" : "+"} ${rec.name} ${rec.type} -> ${rec.content} (dry run)`);
    continue;
  }

  const payload = { ...rec, ttl: 1 }; // ttl 1 = "automatic"
  if (prior) {
    await cf(`/zones/${zoneId}/dns_records/${prior.id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    console.log(`~ updated ${rec.name} ${rec.type}`);
  } else {
    await cf(`/zones/${zoneId}/dns_records`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    console.log(`+ created ${rec.name} ${rec.type}`);
  }
}

console.log(
  DRY
    ? "\ndry run complete — nothing changed"
    : "\n✓ done. Verify with: node scripts/cf-dns-verify.mjs",
);
