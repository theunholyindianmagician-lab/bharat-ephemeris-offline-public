/*
 * e2e-offline.mjs — proves the whole observatory survives airplane mode, in every tier.
 *
 *   Run:       node e2e-offline.mjs          (serves the repository itself on a free 127.0.0.1 port;
 *                                             PLAYWRIGHT_CHROMIUM_EXECUTABLE picks the browser)
 *   Companion: node kernel-regression.test.js, node scripts/legacy-tier-ui.test.cjs
 *
 * Sequence: visit every product page online → wait for serviceWorker.ready → check that every URL in sw.js's CORE
 * list (the precache, which now holds the text tiers' modules, the paramparā record, ss-tier.js, siddhanta-tier.js and
 * drik-grahana.js) is in the cache → context goes offline → reload every page from the service-worker cache and, on
 * each, compute through math-core's tier API: the three tiers at 2026-10-08 12:00 IST Ujjain, and at 1500-03-20
 * 06:00 IST (Julian) the two text tiers, while the dṛk tier refuses (TIER_OUT_OF_SPAN; PG-23). Any pageerror event
 * (online or offline), any request that leaves 127.0.0.1, or a missing precache entry fails the run. Exits 1 on failure.
 */
import { createRequire } from "node:module";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const { chromium } = require("./node_modules/playwright/index.js");
const B = require("./scripts/build-site.cjs");
const ROOT = path.dirname(fileURLToPath(import.meta.url));
const PAGES = B.PAGES;
const CORE = (() => {
  const m = fs.readFileSync(path.join(ROOT, "sw.js"), "utf8").match(/const CORE = \[([\s\S]*?)\];/);
  return [...m[1].matchAll(/"([^"]+)"/g)].map((x) => x[1]).filter((u) => u !== "./");
})();

/* ── 0 · a private static server (no network beyond 127.0.0.1) ─────────── */
const server = http.createServer((req, res) => {
  let pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
  if (pathname.endsWith("/")) pathname += "index.html";          // "./" is in the precache, as a real host serves it
  const file = path.resolve(ROOT, "." + pathname);
  if (!file.startsWith(ROOT + path.sep)) { res.writeHead(403).end(); return; }
  const type = { ".js": "text/javascript", ".css": "text/css", ".html": "text/html; charset=utf-8", ".json": "application/json", ".svg": "image/svg+xml",
    ".png": "image/png", ".webmanifest": "application/manifest+json" }[path.extname(file)];
  fs.readFile(file, (error, data) => { if (error) res.writeHead(404).end(); else { res.setHeader("Content-Type", type || "application/octet-stream"); res.end(data); } });
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const BASE = `http://127.0.0.1:${server.address().port}`;

const results = [];      // { page, phase, ok, note }
const pageErrors = [];   // { page, phase, message }
const outside = [];      // requests that tried to leave 127.0.0.1
let phase = "online";

const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || undefined });
const context = await browser.newContext();
// Requests are watched, not routed: request interception (context.route) keeps a service worker from installing in
// Chromium, which is what this script tests. Any page request off 127.0.0.1 fails the run.
context.on("request", (request) => {
  const url = request.url();
  if (/^(?:https?|wss?):/.test(url) && new URL(url).hostname !== "127.0.0.1") outside.push(url);
});
const page = await context.newPage();

let currentPage = "(none)";
page.on("pageerror", (error) => {
  pageErrors.push({ page: currentPage, phase, message: String(error).split("\n")[0] });
});

/* ── 1 · Online pass: load every page, wait for the service worker ───── */
for (const name of PAGES) {
  currentPage = name;
  let ok = true;
  let note = "sw ready";
  try {
    const response = await page.goto(`${BASE}/${name}`, { waitUntil: "load", timeout: 120000 });
    if (!response || !response.ok()) throw new Error(`HTTP ${response ? response.status() : "null"}`);
    await page.evaluate(() => Promise.race([navigator.serviceWorker.ready.then(() => true),
      new Promise((_, reject) => setTimeout(() => reject(new Error("serviceWorker.ready timed out (60 s)")), 60000))]));
  } catch (error) {
    ok = false;
    note = String(error && error.message ? error.message : error).split("\n")[0];
  }
  results.push({ page: name, phase: "online", ok, note });
  console.log(`online  ${name}: ${ok ? "ok" : "FAIL"} ${note}`);
}

/* 3 s warm-up: lets the SW runtime cache finish storing fetched assets. */
await page.waitForTimeout(3000);
{
  currentPage = "(precache)";
  const missing = await page.evaluate(async (core) => {
    const out = [];
    for (const u of core) if (!(await caches.match(new URL(u, location.href).href, { ignoreSearch: true }))) out.push(u);
    return out;
  }, CORE);
  results.push({ page: `sw.js CORE (${CORE.length})`, phase: "online", ok: missing.length === 0, note: missing.length ? `not cached: ${missing.join(", ")}` : "every CORE URL is in the cache" });
}

/* ── 2 · Offline pass: reload every page from the SW cache; compute in every tier ── */
phase = "offline";
await context.setOffline(true);

for (const name of PAGES) {
  currentPage = name;
  let ok = true;
  let note = "";
  try {
    await page.goto(`${BASE}/${name}`, { waitUntil: "load", timeout: 120000 });
    const check = await page.evaluate(() => {
      const M = window.ShunyaMath;
      if (!M) return { ok: true, why: "no math-core on this page (sovereign modules only)", skip: true };
      if (!M.TIERS || !window.SSTier) return { ok: false, why: "math-core without its tiers (ss-tier.js not loaded)" };
      const site = [23.1765, 75.7885];
      const jd = M.gregorianToJulianDay("2026-10-08", "12:00:00", 5.5);
      const parts = [];
      for (const id of M.TIER_IDS) {
        const p = M.panchangExtended(jd, site[0], site[1], 5.5, id);
        if (!Number.isFinite(p.chandra) || !p.nakshatraName) return { ok: false, why: `${id}: no limbs` };
        parts.push(`${id} ${p.nakshatraName}`);
      }
      const jd1500 = M.civilToJd({ calendar: "julian", year: 1500, month: 3, day: 20 }, "06:00:00", 5.5);
      for (const id of ["ss+parameshvara", "ss"]) {
        const p = M.panchangExtended(jd1500, site[0], site[1], 5.5, id);
        if (!Number.isFinite(p.chandra) || !p.masaName) return { ok: false, why: `1500 ${id}: no month` };
        parts.push(`1500 ${id} ${p.tithiName}/${p.masaName}`);
      }
      try { M.panchangExtended(jd1500, site[0], site[1], 5.5, "drik"); return { ok: false, why: "the dṛk tier did not refuse 1500" }; }
      catch (e) { if (e.code !== "TIER_OUT_OF_SPAN") return { ok: false, why: `1500 drik: ${e.message}` }; parts.push("1500 drik refused"); }
      return { ok: true, why: parts.join(" · ") };
    });
    ok = check.ok;
    note = check.why;
  } catch (error) {
    ok = false;
    note = String(error && error.message ? error.message : error).split("\n")[0];
  }
  results.push({ page: name, phase: "offline", ok, note });
  console.log(`offline ${name}: ${ok ? "ok" : "FAIL"} ${note.slice(0, 160)}`);
}

await browser.close();
server.close();

/* ── 3 · Report ──────────────────────────────────────────────────────── */
const errorFree = pageErrors.length === 0 && outside.length === 0;
const allLoaded = results.every((r) => r.ok);

const width = Math.max(...results.map((r) => r.page.length));
console.log("\nPAGE".padEnd(width + 3) + "PHASE".padEnd(9) + "RESULT  NOTE");
console.log("─".repeat(width + 3 + 9 + 8 + 30));
for (const r of results) {
  console.log(r.page.padEnd(width + 2) + " " + r.phase.padEnd(8) + " " + (r.ok ? "PASS " : "FAIL ") + "  " + r.note);
}
console.log("─".repeat(width + 3 + 9 + 8 + 30));
console.log(`pageerror events: ${pageErrors.length}` + (pageErrors.length === 0 ? "  (zero — clean)" : ""));
for (const e of pageErrors) console.log(`  [${e.phase}] ${e.page}: ${e.message}`);
console.log(`requests outside 127.0.0.1: ${outside.length}`);
for (const u of outside.slice(0, 10)) console.log(`  ${u}`);

if (allLoaded && errorFree) {
  console.log(`\nOVERALL: PASS — all ${PAGES.length} pages load offline and every tier computes (the dṛk tier refuses outside 1850–2150).`);
  process.exit(0);
} else {
  console.log("\nOVERALL: FAIL");
  process.exit(1);
}
