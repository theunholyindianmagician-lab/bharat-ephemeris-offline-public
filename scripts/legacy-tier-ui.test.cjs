'use strict';
/* legacy-tier-ui.test.cjs — the legacy pages (index, panchang, museum, library, the dashboard) driven through the three
 * tiers in a browser (owner, 2026-10-08):
 *   - every page opens in each choice ('ss+parameshvara' the default, 'ss', 'drik') with no page error and no console
 *     error, shows the tier's labels (read from M.TIERS) and computes with that tier: the values shown equal
 *     math-core's own panchangExtended / tierGrahaRows / vimshottariTier for the same instant, site and tier;
 *   - the dṛk choice refuses outside 1850.0–2150.0 (TierSpanError), says so plainly and offers the text choices;
 *   - no foreign theory is called on any page path: DrikTier, drigCoordinates/drigGeoJ2000, Astronomy Engine (but its
 *     ΔT helpers, an external input the dṛk tier names), VSOP87/ELP and the precision ephemeris are instrumented to
 *     record and throw if called;
 *   - the choice is one shared key: made on one page it holds on the next; a crafted ?tier=bogus is shown as a problem
 *     and never stored;
 *   - no request leaves 127.0.0.1.
 * Chromium: PLAYWRIGHT_CHROMIUM_EXECUTABLE (or Playwright's own).
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '..');
const TIERS = ['ss+parameshvara', 'ss', 'drik'];
const PAST_MS = Date.UTC(1700, 5, 15, 6, 30, 0);          // a "now" outside the dṛk span, for the pages that show the present

// Installed before any page script: record (and throw on) every call into a vendored foreign theory.
function instrument(fakeNowMs) {
  window.__foreign = [];
  const note = (name) => { window.__foreign.push(name); return new Error(`foreign theory called on a page path: ${name}`); };
  const ALLOW = new Set(['DeltaT_EspenakMeeus', 'DeltaT_JplHorizons', 'SetDeltaTFunction']);   // ΔT: an external input the dṛk tier names
  const trapFn = (name, fn) => new Proxy(fn, {
    apply() { throw note(name); },
    construct() { throw note(name); },
    get(t, k) { const v = t[k]; return typeof v === 'function' && k !== 'prototype' ? trapFn(`${name}.${String(k)}`, v) : v; },
  });
  const trapObject = (label, obj, allow) => {
    if (!obj || typeof obj !== 'object') return obj;
    const out = {};
    for (const k of Object.keys(obj)) out[k] = typeof obj[k] === 'function' && !(allow && allow.has(k)) ? trapFn(`${label}.${k}`, obj[k]) : obj[k];
    return out;
  };
  const hook = (name, wrap) => {
    let held;
    Object.defineProperty(window, name, { configurable: true, get() { return held; }, set(v) { held = wrap(v); } });
  };
  hook('Astronomy', (v) => trapObject('Astronomy', v, ALLOW));
  hook('DrikTier', (v) => trapObject('DrikTier', v));
  hook('ShunyaVsop87', (v) => trapObject('ShunyaVsop87', v));
  hook('ShunyaElp', (v) => trapObject('ShunyaElp', v));
  hook('KaalPrecisionEphemeris', (v) => trapObject('KaalPrecisionEphemeris', v));
  hook('ShunyaMath', (v) => {
    if (!v || typeof v !== 'object') return v;
    const copy = Object.assign({}, v);
    for (const k of ['drigCoordinates', 'drigGeoJ2000', 'computePrecisionChart']) if (typeof v[k] === 'function') copy[k] = trapFn(`ShunyaMath.${k}`, v[k]);
    return copy;
  });
  if (fakeNowMs) { const offset = fakeNowMs - Date.now(); const real = Date.now.bind(Date); Date.now = () => real() + offset; }
}

const server = http.createServer((req, res) => {
  const file = path.resolve(root, '.' + decodeURIComponent(new URL(req.url, 'http://localhost').pathname));
  if (!file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
  const type = { '.js': 'text/javascript', '.css': 'text/css', '.html': 'text/html; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.webmanifest': 'application/manifest+json' }[path.extname(file)];
  fs.readFile(file, (error, data) => { if (error) res.writeHead(404).end(); else { res.setHeader('Content-Type', type || 'application/octet-stream'); res.end(data); } });
});

let browser, base, passed = 0;
const outside = [];
async function open(pageName, { query = '', fakeNowMs = null, context = null, wait = 1800 } = {}) {
  const ctx = context || await browser.newContext({ serviceWorkers: 'block' });
  await ctx.route('**/*', (route) => { if (new URL(route.request().url()).hostname === '127.0.0.1') return route.continue(); outside.push(route.request().url()); return route.abort(); });
  const page = await ctx.newPage(), errors = [];
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(`console.error: ${m.text().slice(0, 300)}`); });
  await page.addInitScript(instrument, fakeNowMs);
  await page.goto(`${base}/${pageName}${query}`, { waitUntil: 'load', timeout: 120000 });
  await page.waitForTimeout(wait);
  return { ctx, page, errors, own: !context };
}
async function close(o) { if (o.own) await o.ctx.close(); else await o.page.close(); }
async function clean(o, what) {
  const foreign = await o.page.evaluate(() => window.__foreign.slice());
  assert.deepEqual(foreign, [], `${what}: a foreign theory was called`);
  assert.deepEqual(o.errors, [], `${what}: errors`);
}
const ok = (msg) => { passed++; console.log(`PASS ${msg}`); };

// the tier's labels are on the page: a details block for the tier, with its label and ayanāṃśa name from M.TIERS
async function labelsShown(page, tier, selector = 'details.tier-labels') {
  return page.evaluate(([tier, selector]) => {
    const M = window.ShunyaMath, T = M.TIERS[tier];
    const d = [...document.querySelectorAll(selector)].find((x) => x.dataset.tier === tier);
    if (!d) return `no labels block for ${tier}`;
    const text = d.textContent;
    for (const need of [T.label, T.labelSa, T.ayanamsha.name, T.sunrise, T.karanaOrder, T.month, T.samvatsara]) if (!text.includes(need)) return `labels for ${tier} lack: ${need.slice(0, 60)}`;
    if (T.family === 'drik' && !text.includes(T.span.accuracyMeasured)) return 'the dṛk labels lack the measured figure';
    return null;
  }, [tier, selector]);
}

(async () => {
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  base = `http://127.0.0.1:${server.address().port}`;
  browser = await chromium.launch({ headless: true, executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || undefined });
  try {
    // ── index: the select, the labels, the values = math-core's at the same instant and tier ──
    for (const tier of TIERS) {
      const o = await open('index.html', { query: tier === 'ss+parameshvara' ? '' : `?tier=${encodeURIComponent(tier)}` });
      const r = await o.page.evaluate((tier) => {
        const M = window.ShunyaMath, s = window.LiveBoard.lastState();
        if (!s) return { why: 'no state' };
        const p = M.panchangExtended(s.jd, 23.1765, 75.7885, 5.5, tier), rows = M.tierGrahaRows(s.jd, tier);
        return { tier: s.tier, select: document.getElementById('homeTierSelect').value, options: document.getElementById('homeTierSelect').options.length,
          chip: document.getElementById('homeTier').textContent, tithi: document.getElementById('liveTithi').textContent, want: `${p.paksha} ${p.tithiName}`,
          sun: document.getElementById('engSurya').textContent, wantSun: `${rows[0].longitude.toFixed(4)}°`, tags: [...document.querySelectorAll('[data-tier-tag]')].map((n) => n.dataset.tier),
          labelSa: M.TIERS[tier].labelSa };
      }, tier);
      assert.equal(r.tier, tier); assert.equal(r.select, tier); assert.equal(r.options, 3);
      assert.ok(r.chip.includes(r.labelSa), r.chip);
      assert.equal(r.tithi, r.want, 'index tithi = panchangExtended(…, tier)');
      assert.equal(r.sun, r.wantSun, 'index Sun = tierGrahaRows(…, tier)');
      assert.ok(r.tags.length >= 4 && r.tags.every((t) => t === tier), 'every block names the tier');
      assert.equal(await labelsShown(o.page, tier), null);
      await clean(o, `index.html [${tier}]`);
      await close(o);
      ok(`index.html in ${tier}: select, labels, tithi and Sun from the tier`);
    }
    // the instrumentation itself: a call into a foreign theory is recorded (a negative control), ΔT stays allowed
    {
      const o = await open('index.html');
      const r = await o.page.evaluate(() => {
        const tries = [() => window.ShunyaMath.drigCoordinates('surya', 2451545), () => window.Astronomy.GeoVector('Sun', 0, true), () => window.Astronomy.AstroTime.FromTerrestrialTime(0)];
        const threw = tries.map((f) => { try { f(); return false; } catch (e) { return /foreign theory called/.test(e.message); } });
        const recorded = window.__foreign.splice(0);
        return { threw, recorded, dt: Number.isFinite(window.Astronomy.DeltaT_EspenakMeeus(0)) };
      });
      assert.deepEqual(r.threw, [true, true, true]);
      assert.deepEqual(r.recorded, ['ShunyaMath.drigCoordinates', 'Astronomy.GeoVector', 'Astronomy.AstroTime.FromTerrestrialTime']);
      assert.equal(r.dt, true, 'the ΔT helper (an external input the dṛk tier names) is not trapped');
      await clean(o, 'index.html [instrumentation control]');
      await close(o);
      ok('the foreign-theory instrumentation records and throws on a call (negative control)');
    }
    // index: the present outside the dṛk span → the refusal, the text choices offered; picking one recomputes
    {
      const o = await open('index.html', { query: '?tier=drik', fakeNowMs: PAST_MS });
      const r = await o.page.evaluate(() => ({ refusal: document.getElementById('homeTierRefusal').hidden ? '' : document.getElementById('homeTierRefusal').textContent,
        buttons: [...document.querySelectorAll('#homeTierRefusal button')].map((b) => b.dataset.tier) }));
      assert.match(r.refusal, /1850\.0–2150\.0/); assert.deepEqual(r.buttons, ['ss+parameshvara', 'ss']);
      await o.page.click('#homeTierRefusal button[data-tier="ss"]');
      await o.page.waitForTimeout(600);
      const after = await o.page.evaluate(() => ({ tier: window.LiveBoard.lastState() && window.LiveBoard.lastState().tier, year: window.LiveBoard.lastState() && window.LiveBoard.lastState().date }));
      assert.equal(after.tier, 'ss'); assert.match(after.year, /^1700-/);
      await clean(o, 'index.html [drik refused in 1700]');
      await close(o);
      ok('index.html: the dṛk choice refuses a present in 1700 and offers the text tiers; ss computes it');
    }

    // ── panchang: every field from one panchangExtended(…, tier); the comparison row; the refusal; the exporters ──
    for (const tier of TIERS) {
      const o = await open('panchang.html', { query: tier === 'ss+parameshvara' ? '' : `?tier=${encodeURIComponent(tier)}` });
      const r = await o.page.evaluate((tier) => {
        const M = window.ShunyaMath, $ = (id) => document.getElementById(id);
        $('pauseButton').click();
        const snap = window.__panchangDiagnostics.snapshot(), jd = snap.instantMs / 86400000 + 2440587.5;
        const t = M.TEMPLE_PRESETS.find((x) => x.id === snap.temple);
        const p = M.panchangExtended(jd, t.lat, t.lon, snap.offsetMinutes / 60, tier);
        return { select: $('tierSelect').value, chip: $('ganaTahChip').textContent, tithi: $('s-tithi').textContent, want: `${p.paksha} ${p.tithiName}`,
          masa: $('m-masa').textContent, wantMasa: p.masaName, lagna: $('m-lagna').textContent, wantLagna: `${p.lagna.toFixed(4)}° · ${p.lagnaRashiSa}`,
          rise: $('sol-rise').textContent, wantRise: p.solar.riseTime, solRule: $('solRule').textContent, rule: M.TIERS[tier].sunrise,
          cmp: $('tierCompareValues').textContent, others: M.TIER_IDS.filter((x) => x !== tier).map((x) => M.TIERS[x].labelSa), labelSa: M.TIERS[tier].labelSa,
          lunRule: $('lun-rule').textContent, horizon: $('lun-horizon').textContent };
      }, tier);
      assert.equal(r.select, tier);
      assert.ok(r.chip.includes(r.labelSa));
      assert.equal(r.tithi, r.want); assert.ok(r.masa.startsWith(r.wantMasa), r.masa); assert.equal(r.lagna, r.wantLagna); assert.equal(r.rise, r.wantRise);
      assert.ok(r.solRule.includes(r.rule), 'the sunrise rule beside the sunrise');
      for (const x of r.others) assert.ok(r.cmp.includes(x), `comparison row names ${x}`);
      assert.match(r.horizon, tier === 'drik' ? /^\+7′/ : /^0′/, 'the moonrise horizon of the tier (KH-13)');
      assert.equal(await labelsShown(o.page, tier), null);
      await clean(o, `panchang.html [${tier}]`);
      await close(o);
      ok(`panchang.html in ${tier}: limbs, amānta month, lagna, sunrise and its rule, moonrise horizon from the tier; comparison row`);
    }
    {
      const o = await open('panchang.html');
      const r = await o.page.evaluate(async () => {
        const $ = (id) => document.getElementById(id), sleep = (ms) => new Promise((res) => setTimeout(res, ms));
        $('dateInput').value = '1500-03-20'; $('timeInput').value = '06:00:00'; $('calendarInput').value = 'julian';
        $('calculateButton').click();
        const text = { tithi: $('s-tithi').textContent, masa: $('m-masa').textContent };
        const sel = $('tierSelect'); sel.value = 'drik'; sel.dispatchEvent(new Event('change'));
        const refused = { box: $('tierRefusal').hidden ? '' : $('tierRefusal').textContent, tithi: $('s-tithi').textContent, buttons: [...document.querySelectorAll('#tierRefusal button')].map((b) => b.dataset.tier) };
        document.querySelector('#tierRefusal button[data-tier="ss"]').click();
        await sleep(200);
        const after = { select: sel.value, tithi: $('s-tithi').textContent, refusalHidden: $('tierRefusal').hidden, stored: JSON.parse(localStorage.getItem(window.ShunyaMath.YANTRA_STATE_KEY)).tier };
        // the exporters: the CSV names the tier on every row; the deep-time CSV is the text tier inside its span
        const blobs = []; URL.createObjectURL = (b) => { blobs.push(b); return 'blob:x'; }; URL.revokeObjectURL = () => {};
        HTMLAnchorElement.prototype.click = function () {};          // capture the files; download nothing
        window.exportBatchPanchang(3, 'csv'); await sleep(400);
        $('deepTimeRows').value = '100000'; $('deepTimeStride').value = '36525'; $('deepTimeDirection').value = '-1';
        window.exportDeepTimeCSV(); await sleep(1500);
        const texts = await Promise.all(blobs.map((b) => b.text()));
        // the deep past: −45000 (Gregorian) in the plain text tier
        $('dateInput').value = '-45000-06-15'; $('calendarInput').value = 'gregorian'; $('calculateButton').click();
        const deep = { tithi: $('s-tithi').textContent, status: $('instrumentStatus').textContent, ah: $('m-ahargana').textContent };
        $('dateInput').value = '60000-01-01'; $('calculateButton').click();
        const beyond = $('instrumentStatus').textContent;
        return { text, refused, after, csv: texts[0], deepCsv: texts[1], deep, beyond };
      });
      assert.notEqual(r.text.tithi, '—'); assert.match(r.text.masa, /चैत्र/);
      assert.match(r.refused.box, /1850\.0–2150\.0/); assert.equal(r.refused.tithi, '—'); assert.deepEqual(r.refused.buttons, ['ss+parameshvara', 'ss']);
      assert.equal(r.after.select, 'ss'); assert.notEqual(r.after.tithi, '—'); assert.equal(r.after.refusalHidden, true); assert.equal(r.after.stored, 'ss');
      const csvRows = r.csv.split('\n').filter((l) => /^"ss"/.test(l));
      assert.equal(csvRows.length, 3); assert.match(r.csv, /^# Bharat Ephemeris · tier ss — Sūrya-Siddhānta/); assert.match(r.csv, /# ayanamsha: SS 3\.9-3\.10/);
      assert.match(r.deepCsv, /tier ss/); assert.match(r.deepCsv, /# cut after \d+ rows: the next row would leave the text tier's tested span \(-50000\.\.50000\)/);
      const deepRows = r.deepCsv.split('\n').filter((l) => /^-?\d/.test(l));
      // 1500 back to −50,000 at a century a row: (1500 + 50,000) / 100.0 ≈ 515 rows, then the cut
      assert.ok(deepRows.length >= 510 && deepRows.length <= 516, `${deepRows.length} rows reach back to −50,000 at a century stride`);
      assert.notEqual(r.deep.tithi, '—'); assert.match(r.deep.ah, /^-/); assert.doesNotMatch(r.deep.status, /failed/);
      assert.match(r.beyond, /-50000…\+50000/);
      await clean(o, 'panchang.html [1500 / refusal / exports / deep time]');
      await close(o);
      ok('panchang.html: 1500 (Julian) in the text tier, the dṛk refusal with the text choices, the tiered exports, −45000, a year beyond the span refused by the parser');
    }

    // ── the dashboard: the strip and the HUD read the same object (PG-12); the shared key from another page ──
    for (const tier of TIERS) {
      const o = await open('shoonya_sovereign_dashboard.html', { query: tier === 'ss+parameshvara' ? '' : `?tier=${encodeURIComponent(tier)}` });
      const r = await o.page.evaluate((tier) => {
        const M = window.ShunyaMath, $ = (id) => document.getElementById(id), p = window.PageLive.last();
        const rows = M.tierGrahaRows(p.jd, tier);
        return { stripTier: $('page-live-strip').dataset.tier, pTier: p.tier, stripNak: $('pls-nak').textContent, hudNak: $('chandraSub').textContent,
          hudTier: $('hudTier').textContent, labelSa: M.TIERS[tier].labelSa, moon: $('chandraVal').textContent, wantMoon: `${rows[1].longitude.toFixed(4)}°`,
          cells: document.querySelectorAll('#grahaGrid .graha-cell').length };
      }, tier);
      assert.equal(r.stripTier, tier); assert.equal(r.pTier, tier);
      assert.ok(r.hudNak.startsWith(r.stripNak.split(' · ')[0]), `strip ${r.stripNak} vs HUD ${r.hudNak}`);
      assert.ok(r.hudTier.includes(r.labelSa));
      assert.equal(r.cells, 9);
      assert.equal(await labelsShown(o.page, tier), null);
      await clean(o, `dashboard [${tier}]`);
      await close(o);
      ok(`shoonya_sovereign_dashboard.html in ${tier}: strip and HUD one object, nine rows of the tier, labels`);
    }
    {
      const ctx = await browser.newContext({ serviceWorkers: 'block' });
      const a = await open('panchang.html', { context: ctx });
      await a.page.selectOption('#tierSelect', 'drik');
      await a.page.waitForTimeout(300);
      await clean(a, 'panchang (choosing drik)');
      await close(a);
      const b = await open('shoonya_sovereign_dashboard.html', { context: ctx });
      const r = await b.page.evaluate(() => ({ select: document.getElementById('pls-tier').value, tier: window.PageLive.last().tier }));
      assert.deepEqual(r, { select: 'drik', tier: 'drik' }, 'a choice made on panchang holds on the dashboard (one shared key)');
      await clean(b, 'dashboard (shared key)');
      await close(b);
      const c = await open('shoonya_sovereign_dashboard.html', { context: ctx, query: '?tier=bogus' });
      const bogus = await c.page.evaluate(() => ({ loc: document.getElementById('pls-loc').textContent, tier: window.PageLive.last().tier,
        stored: JSON.parse(localStorage.getItem(window.ShunyaMath.YANTRA_STATE_KEY)).tier }));
      assert.match(bogus.loc, /bogus/); assert.equal(bogus.tier, 'ss+parameshvara'); assert.equal(bogus.stored, 'drik', 'the crafted value is not stored; the earlier choice stays');
      await clean(c, 'dashboard ?tier=bogus');
      await ctx.close();
      ok('the tier is one shared key across pages; a crafted ?tier=bogus is reported, computes with the default and is not stored');
    }
    {
      const o = await open('shoonya_sovereign_dashboard.html', { query: '?tier=drik', fakeNowMs: PAST_MS });
      const r = await o.page.evaluate(() => ({ strip: document.getElementById('pls-refusal').hidden ? '' : document.getElementById('pls-refusal').textContent,
        hudTier: document.getElementById('hudTier').textContent, sun: document.getElementById('suryaVal').textContent }));
      assert.match(r.strip, /1850\.0–2150\.0/);
      assert.equal(r.sun, '—', 'the HUD shows no value it cannot compute in the tier');
      await clean(o, 'dashboard [drik refused in 1700]');
      await close(o);
      ok('shoonya_sovereign_dashboard.html: the dṛk choice refuses a present in 1700 (strip says so, the HUD shows nothing in its place)');
    }

    // ── library: the strip in each tier ──
    for (const tier of TIERS) {
      const o = await open('library.html', { query: tier === 'ss+parameshvara' ? '' : `?tier=${encodeURIComponent(tier)}` });
      const r = await o.page.evaluate((tier) => {
        const M = window.ShunyaMath, p = window.PageLive.last();
        const q = M.panchangExtended(p.jd, 23.1765, 75.7885, 5.5, tier);
        return { tier: document.getElementById('page-live-strip').dataset.tier, nak: document.getElementById('pls-nak').textContent, want: `${q.nakshatraName} · ${q.nakshatraPada}` };
      }, tier);
      assert.equal(r.tier, tier); assert.equal(r.nak, r.want);
      assert.equal(await labelsShown(o.page, tier), null);
      await clean(o, `library.html [${tier}]`);
      await close(o);
      ok(`library.html in ${tier}: the strip computes in the tier and shows its labels`);
    }

    // ── museum: the exhibit is the plain text; the daśā/bhāva drawer follows the tier; the dṛk refusal in the past ──
    for (const tier of TIERS) {
      const o = await open('museum.html', { query: tier === 'ss+parameshvara' ? '' : `?tier=${encodeURIComponent(tier)}` });
      const r = await o.page.evaluate(async (tier) => {
        const M = window.ShunyaMath, $ = (id) => document.getElementById(id), sleep = (ms) => new Promise((res) => setTimeout(res, ms));
        toggleDrawer('dDasha'); await sleep(300); renderBhavaChakra();
        const jd = 2451545.0 + T, v = M.vimshottariTier(jd, jd, tier), b = M.bhavaModel(jd, 23.1765, 75.7885, tier);
        const lordSa = { 'Ketu': 'केतु', 'Śukra': 'शुक्र', 'Sūrya': 'सूर्य', 'Candra': 'चन्द्र', 'Maṅgala': 'मंगल', 'Rāhu': 'राहु', 'Guru': 'गुरु', 'Śani': 'शनि', 'Budha': 'बुध' };
        return { select: $('museumTierSelect').value, dasha: $('dashaBody').textContent, maha: `महादशा ▶ ${lordSa[v.maha.lord]} · ${M.julianDayToIsoDate(v.maha.startJd, 5.5)}`,
          bhava: $('bhavachakra').textContent, lagna: `${b.lagna.toFixed(4)}°`, labelSa: M.TIERS[tier].labelSa, identity: window.__SS_ENGINE_IDENTITY,
          exhibitLabels: !!document.querySelector('#exhibitTierLabels details.tier-labels[data-tier="ss"]') };
      }, tier);
      assert.equal(r.select, tier); assert.equal(r.identity, true); assert.equal(r.exhibitLabels, true);
      assert.ok(r.dasha.includes(r.labelSa) && r.dasha.includes(r.maha), `${r.maha} in the daśā panel`);
      assert.ok(r.bhava.includes(r.labelSa) && r.bhava.includes(r.lagna), 'the bhāva-chakra in the tier');
      assert.equal(await labelsShown(o.page, tier, '#museumTierLabels details.tier-labels'), null);
      await clean(o, `museum.html [${tier}]`);
      await close(o);
      ok(`museum.html in ${tier}: daśā (dasha.js by time) and bhāva-chakra from the tier; the exhibit labelled as the plain text`);
    }
    {
      const o = await open('museum.html', { query: '?tier=drik' });
      const r = await o.page.evaluate(async () => {
        const $ = (id) => document.getElementById(id), sleep = (ms) => new Promise((res) => setTimeout(res, ms));
        toggleDrawer('dDasha'); await sleep(200); jumpTo(TODAY0 - 300 * 365.25); await sleep(200); renderDasha(); renderBhavaChakra(); updateHUD({}, '#fff');
        return { dasha: $('dashaBody').textContent, bhava: $('bhavachakra').textContent, buttons: [...document.querySelectorAll('#dashaBody button')].map((b) => b.dataset.tier) };
      });
      assert.match(r.dasha, /1850\.0–2150\.0/); assert.match(r.bhava, /1850\.0–2150\.0/); assert.deepEqual(r.buttons, ['ss+parameshvara', 'ss']);
      await clean(o, 'museum.html [drik refused ~1726]');
      await close(o);
      ok('museum.html: the dṛk choice refuses a sim-instant three centuries back and offers the text tiers');
    }

    // ── no stale values: a page already showing one tier's values clears them when it switches into the dṛk refusal,
    //    and a failed input leaves no value of the previous instant (review of C2, 2026-10-09) ──
    {
      const o = await open('index.html', { query: '?tier=ss', fakeNowMs: PAST_MS });
      const grab = () => o.page.evaluate(() => ({ tithi: document.getElementById('liveTithi').textContent, sun: document.getElementById('engSurya').textContent,
        hud: document.getElementById('hudSurya').textContent, grahas: document.getElementById('liveGrahas').textContent, muhurta: document.getElementById('abhyasMuhurta').textContent,
        tags: [...new Set([...document.querySelectorAll('[data-tier-tag]')].map((n) => n.dataset.tier))], labels: [...document.querySelectorAll('#homeTierLabels details.tier-labels')].map((d) => d.dataset.tier) }));
      const before = await grab();
      assert.notEqual(before.sun, '—'); assert.match(before.muhurta, /सूर्य-सिद्धान्त का सूर्योदय/);
      await o.page.selectOption('#homeTierSelect', 'drik');
      await o.page.waitForTimeout(1500);
      const after = await grab();
      assert.deepEqual([after.tithi, after.sun, after.hud, after.grahas, after.muhurta], ['—', '—', '—', '', '—'], 'no value of the previous tier beside the refusal');
      assert.deepEqual(after.tags, ['drik']); assert.deepEqual(after.labels, ['drik']);
      await o.page.click('#homeTierRefusal button[data-tier="ss+parameshvara"]');
      await o.page.waitForTimeout(1500);
      const back = await o.page.evaluate(() => { const M = window.ShunyaMath, s = window.LiveBoard.lastState(); return { tier: s && s.tier, sun: document.getElementById('engSurya').textContent, want: s ? `${M.tierGrahaRows(s.jd, s.tier)[0].longitude.toFixed(4)}°` : null, muhurta: document.getElementById('abhyasMuhurta').textContent }; });
      assert.equal(back.tier, 'ss+parameshvara'); assert.equal(back.sun, back.want); assert.match(back.muhurta, /परमेश्वर-संस्कार का सूर्योदय/);
      await clean(o, 'index.html [ss → drik refused → ss+parameshvara]');
      await close(o);
    }
    {
      const o = await open('shoonya_sovereign_dashboard.html', { query: '?tier=ss', fakeNowMs: PAST_MS });
      assert.notEqual(await o.page.evaluate(() => document.getElementById('suryaVal').textContent), '—');
      await o.page.selectOption('#pls-tier', 'drik');
      await o.page.waitForTimeout(1500);
      const r = await o.page.evaluate(() => ({ sun: document.getElementById('suryaVal').textContent, moon: document.getElementById('chandraVal').textContent, lagna: document.getElementById('lagnaVal').textContent,
        grid: document.getElementById('grahaGrid').textContent, hudTier: document.getElementById('hudTier').textContent, labels: [...document.querySelectorAll('#pls-tier-labels details.tier-labels')].map((d) => d.dataset.tier) }));
      assert.deepEqual([r.sun, r.moon, r.lagna, r.grid], ['—', '—', '—', '']); assert.match(r.hudTier, /आधुनिक भारतीय/); assert.deepEqual(r.labels, ['drik']);
      await clean(o, 'dashboard [ss → drik refused]');
      await close(o);
    }
    {
      const o = await open('panchang.html');
      await o.page.click('#pauseButton');
      await o.page.fill('#dateInput', '2026-10-08'); await o.page.fill('#timeInput', '12:00:00'); await o.page.click('#calculateButton'); await o.page.waitForTimeout(300);
      assert.notEqual(await o.page.evaluate(() => document.getElementById('s-tithi').textContent), '—');
      for (const bad of ['abc', '2026-13-45', '60000-01-01']) {
        await o.page.fill('#dateInput', bad); await o.page.click('#calculateButton'); await o.page.waitForTimeout(300);
        const r = await o.page.evaluate(() => ({ v: ['s-tithi', 's-nakshatra', 'm-surya', 'm-lagna', 'sol-rise', 'clockSub'].map((id) => document.getElementById(id).textContent), status: document.getElementById('instrumentStatus').textContent }));
        assert.deepEqual(r.v, ['—', '—', '—', '—', '—', '—'], `panchang '${bad}': no value of the previous instant stays`); assert.match(r.status, /Calculation failed/);
      }
      await clean(o, 'panchang.html [failed inputs]');
      await close(o);
    }
    {
      const o = await open('museum.html', { query: '?tier=drik' });
      const r = await o.page.evaluate(async () => {
        const sleep = (ms) => new Promise((res) => setTimeout(res, ms)), log = [];
        jumpTo(TODAY0 - 300 * 365.25); await sleep(200);
        for (const [n, f] of [['panch', () => toggleDrawer('dPanch')], ['kosh', () => toggleDrawer('dKosh')], ['dasha', () => toggleDrawer('dDasha')],
          ['lagnaSel', () => { const s = document.getElementById('lagnaSel'); s.value = '-1'; s.onchange(); }], ['rashi', () => gyanShow('rashi', 3)]]) {
          try { f(); log.push(`${n}: ok`); } catch (e) { log.push(`${n}: ${e.message}`); }
          await sleep(100);
        }
        return { log, lagna: Number.isFinite(lagna) };
      });
      assert.deepEqual(r.log, ['panch: ok', 'kosh: ok', 'dasha: ok', 'lagnaSel: ok', 'rashi: ok']); assert.equal(r.lagna, true);
      await clean(o, 'museum.html [drik refused: every drawer]');
      await close(o);
    }
    ok('no stale values: index and the dashboard clear the previous tier on the dṛk refusal, panchang on a failed input; museum\'s drawers survive the refusal');

    assert.deepEqual(outside, [], 'no request leaves 127.0.0.1');
    ok('no page made a request outside 127.0.0.1');
    console.log(`\nAll ${passed} legacy tier UI checks passed.`);
  } finally {
    if (browser) await browser.close();
    server.close();
  }
})().catch((e) => { console.error(e); process.exit(1); });
