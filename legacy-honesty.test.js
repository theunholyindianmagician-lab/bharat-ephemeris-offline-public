'use strict';
/*
 * legacy-honesty.test.js — guards for the claims the 2026-10-07 council removed from the legacy pages
 * (satya P0-2…P0-5, P0-9…P0-11, P1-1, P1-4, P1-7, P1-12; khagola KH-02, KH-08, KH-13; vaidya VAI-03…VAI-12;
 * rakshaka R-06, R-07, R-15, R-16, R-17; jyotisha JY-04; shilpi S-03, S-04, S-17). Each check is a plain text or
 * behaviour test, so a removed claim cannot come back unnoticed. Nothing here touches the sovereign engine.
 */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = __dirname;
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const LEGACY_PAGES = ['index.html', 'panchang.html', 'museum.html', 'shunyabheda.html', 'shoonya_sovereign_dashboard.html'];
const ENGINE_FILES = ['shunyabheda.html', 'shunyabheda-app.js', 'math-core.js'];
function gtmFiles(dir = path.join(ROOT, 'gtm')) {
  if (!fs.existsSync(dir)) return [];             // the public snapshot (scripts/export-public.cjs) carries no gtm/
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => d.isDirectory() ? gtmFiles(path.join(dir, d.name)) : [path.join(dir, d.name)]);
}
function noMatch(files, re, why) {
  for (const f of files) {
    const s = read(f);
    const m = s.match(re);
    assert.equal(m, null, `${f}: ${why} — found ${m && JSON.stringify(m[0])}`);
  }
}

test('[P0-9/KH-02] no "nine grahas ≤1′ from the sky" claim on the legacy pages (meta, og, JSON-LD, hero, tiles, chips)', () => {
  noMatch(LEGACY_PAGES, /आकाश से ≤1′|आकाश-मिलान|9 ग्रह ≤1′|सभी 9 ग्रह[^"<]{0,20}≤1′|नौ ग्रह · आकाश/, 'the dṛk tier is agreement with JPL for Sun–Saturn; Rāhu/Ketu are the mean node');
  const idx = read('index.html');
  assert.match(idx, /सूर्य से शनि तक 7 ग्रह JPL DE440 से 1′ के भीतर \(1850–2150\)/);
  assert.match(idx, /राहु-केतु मध्य-पात/);
});

test('[P0-3/KH-08] the सिद्धान्त-दृक् tier is never sold as the Sūrya-Siddhānta at arc-second accuracy', () => {
  noMatch(['index.html', 'shunyabheda.html', 'shunyabheda-app.js', 'README.md'], /7\/7 ≤1″|Sūrya-Siddhānta structure at arc-second accuracy|no VSOP\/ELP\/JPL at run time\.|author's own N-body/, 'it is a series fitted to a JPL-DE440-started N-body');
  assert.match(read('index.html'), /withheld-दशक: सूर्य 110″, चन्द्र 13″/);
  assert.match(read('shunyabheda.html'), /JPL DE440 states से आरम्भ/);
});

test('[P0-2] panchang does not call its dṛk-tier numbers the Sūrya-Siddhānta engine', () => {
  const p = read('panchang.html');
  noMatch(['panchang.html'], /Sūrya Siddhānta Engine|Sūrya Siddhānta Geodetic Ephemeris|यह एक <em>सूर्य-सिद्धान्त sphuṭa<\/em> यन्त्र है|classical Sūrya-Siddhānta sphuṭa angular boundaries/, 'the displayed limbs come from the dṛk tier');
  assert.match(p, /दृक्-तह \(VSOP87\/ELP\) · सूर्य-सिद्धान्त साथ में/);
  assert.match(p, /'गणना-तह: दृक् \(VSOP87\/ELP\) · शास्त्रीय तुलना नीचे'/);
});

test('[P0-4/P1-5] a kernel fitted to the dṛk tier is not "sovereign"; the dṛk tier is attributed to VSOP87/ELP', () => {
  noMatch(['shunyabheda.html'], /दृग्गणित-संस्कार \(sovereign\)|astronomy-engine substrate, ≤1′/, 'fitted to the dṛk tier, not sovereign');
  noMatch(['index.html'], /दृक्-tier \(astronomy-engine, MIT\)/, 'the browser tier computes with VSOP87B + ELP/MPP02');
});

test('[P0-5] no quantum-hardware or "Trinity" figures on the ENGINE page or in its engine', () => {
  noMatch(ENGINE_FILES, /Qubit|Trinity Advantage|Brahman Lock|IBM|187,?589,?255/, 'hard-coded or invented quantum figures');
});

test('[P0-10] no financial "stance" advice or economic claim on the ENGINE page', () => {
  noMatch(['shunyabheda.html', 'shunyabheda-app.js'], /capital|high-yield|Aggressive|liquidity oscillations|ACTIONABLE EXECUTIVE|Execution Stance/, 'financial advice language');
});

test('[P0-11/P0-4] gtm copy blames no "500-year-old tradition" and calls no dṛk-fitted kernel sovereign', () => {
  const files = gtmFiles().map((f) => path.relative(ROOT, f));
  noMatch(files, /500.?(साल|वर्ष|year|saal)|~500 saal|लगभग 500 वर्षों/i, 'the sign error was in our own code');
  for (const f of files) {
    for (const line of read(f).split('\n')) {
      if (/sovereign/i.test(line) && /kernel|संस्कार/.test(line)) assert.match(line, /sovereign नहीं|not sovereign|sovereign nahin|sovereign_dashboard/i, `${f}: ${line.slice(0, 120)}`);
    }
  }
});

test('[P1-1] the index gate tile is computed live, not a static 19/19', () => {
  const idx = read('index.html');
  assert.doesNotMatch(idx, />19\/19</);
  assert.match(idx, /id="ssGateCount"/);
  assert.match(idx, /M\.ssAudit, M\.ssSphutaAudit, M\.ssSpaceAudit/);
  noMatch(['shunyabheda.html'], /19\/19 प्रमाण-द्वार/, 'static badge in meta/JSON-LD');
});

test('[P1-4/P1-7/P1-8] no "sovereign"/"complete"/"exact" overclaims on the legacy ENGINE and panchang surfaces', () => {
  noMatch(['shunyabheda.html'], /Sovereign Kernel Audit|Sovereign Muhūrta|Compute Sovereign Windows|Complete 97-Adhyaya|Fully Integrated ✓|6\/6 Masters Verified|across all 14 Adhikaras/, 'overclaim');
  noMatch(['panchang.html'], /Exact Geodetic|सटीक geodetic|Sovereign Substrate/, 'overclaim');
});

test('[P1-12/VAI-08] no unexplained "Hinge 2028-02-23" countdown on any page', () => {
  noMatch(['panchang.html', 'shunyabheda.html', 'shunyabheda-app.js'], /Hinge|computeDecadeHingeStatus|decade-hinge/, 'a fixed-date countdown with "terminal" strings');
  noMatch(['math-core.js'], /Terminal Degrees Release|Master Cycle Renewal|isTerminalReleaseReached|Shoonya-Stasis|computeAutophagyKinetics|Spermidine|spermidine/, 'fate / health strings');
});

test('[VAI-03/VAI-05] the practice card gives no breath dose or breath target; prāṇa is a time unit', () => {
  const idx = read('index.html');
  assert.doesNotMatch(idx, /श्वास\/नक्षत्र|श्वास-कोष|21,600 श्वास\/दिन|अजपा-लक्ष्य/);
  assert.match(idx, /सावधानी: कुम्भक \(श्वास रोकना\) सबके लिए सुरक्षित नहीं/);
  assert.match(idx, /Caution: breath-holding is not safe for everyone/);
  assert.match(idx, /यह अनुपात का गणित है, अभ्यास-निर्देश नहीं/);
  noMatch(['museum.html'], /मनुष्य के २१,६०० श्वास|४ सेकण्ड प्रति श्वास|श्रीमद्भागवत ३\.११/, 'prāṇa stated as physiology / unverified cite');
  noMatch(['live-board.js', 'shunyabheda.html', 'shunyabheda-app.js'], /श्वास ladder|" · श्वास "|replace\(\/shvas\/g, "श्वास"\)/, 'prāṇa labelled as breath');
  noMatch(['panchang.html'], /कला\/श्वास/, 'prāṇa labelled as breath');
});

test('[VAI-06/VAI-07/VAI-15] no health, fear or fate labels on the ENGINE page', () => {
  noMatch(['math-core.js'], /physical invincibility|wealth windfalls, longevity|Critical Vulnerability|mandates father|severity: "Critical"|requires Mrityunjaya|shanti prescribed/, 'fear / health promise');
  noMatch(['shunyabheda-app.js'], /Critical Vulnerability|Shubha Janma Verified|birth curses|Destiny Pivot|Karmic Disruption|monitor vitality|physical vigilance|health vigilance|mental peace/, 'fear / health advice');
  noMatch(['shunyabheda.html'], /KARMIC AXIS|Vulnerability Guard|Remedial Shanti Diagnostics/, 'fear label');
  assert.match(read('math-core.js'), /शिशु से दूरी या उसका त्याग शिशु के लिए हानिकारक है/);
});

test('[VAI-12] every legacy product page in this set carries the health line', () => {
  for (const f of LEGACY_PAGES) {
    const s = read(f);
    assert.match(s, /चिकित्सा-परामर्श नहीं/, `${f}: Hindi health line`);
    assert.match(s, /not medical advice/, `${f}: English health line`);
  }
});

test('[KH-13] the lunar horizon is +7′ (the altitude the solver uses), not −7′', () => {
  const M = require('./math-core.js');
  const jd = M.gregorianToJulianDay('2026-10-07', '00:00:00', 5.5);
  assert.equal(M.lunarRiseSet(jd, 23.1765, 75.7885, 5.5).horizonAltitudeDeg, 7 / 60);
  assert.doesNotMatch(read('panchang.html'), /−7′ net/);
});

test('[R-06] payment.js never loads an outside script on mount — only after a click on a configured button; no ID is configured', () => {
  const src = read('payment.js');
  const ids = src.match(/const PAYMENT_BUTTONS = \{([\s\S]*?)\};/)[1];
  for (const m of ids.matchAll(/(\w+):\s*"([^"]*)"/g)) assert.equal(m[2], '', `PAYMENT_BUTTONS.${m[1]} must stay empty (no payment link)`);
  // behaviour, with a tiny fake DOM: a configured SKU mounts a local button and creates no <script> until clicked
  const created = [];
  const mk = (tag) => {
    const el = { tagName: tag.toUpperCase(), children: [], attrs: {}, listeners: {}, textContent: '', className: '',
      set innerHTML(v) { this.children = []; }, appendChild(c) { this.children.push(c); return c; },
      setAttribute(k, v) { this.attrs[k] = String(v); }, getAttribute(k) { return this.attrs[k] == null ? null : this.attrs[k]; },
      addEventListener(t, f) { this.listeners[t] = f; } };
    created.push(el);
    return el;
  };
  const host = mk('div'); host.setAttribute('data-pay-sku', 'sadhaka'); created.length = 0;
  const ctx = { document: { readyState: 'complete', createElement: mk, querySelectorAll: () => [host], addEventListener() {} },
    navigator: { onLine: true }, location: { pathname: '/index.html' } };
  ctx.globalThis = ctx;
  vm.runInNewContext(src, ctx);
  assert.ok(!created.some((e) => e.tagName === 'SCRIPT'), 'waitlist mount creates no script');
  ctx.BharatPay.PAYMENT_BUTTONS.sadhaka = 'pl_TEST';
  created.length = 0;
  ctx.BharatPay.mount(host, 'sadhaka', 'x');
  assert.ok(!created.some((e) => e.tagName === 'SCRIPT'), 'a configured mount creates no script before a click');
  const btn = host.children.find((c) => c.tagName === 'BUTTON');
  assert.ok(btn && typeof btn.listeners.click === 'function');
  btn.listeners.click();
  const s = created.find((e) => e.tagName === 'SCRIPT');
  assert.ok(s && /checkout\.razorpay\.com/.test(s.src), 'the script is created only after the click');
});

test('[R-07] museum.html makes no /be/api request unless the visitor clicks the visible opt-in', () => {
  const s = read('museum.html');
  assert.match(s, /const BE=\{on:false,/);
  assert.doesNotMatch(s, /hostname==='bharatephemeris\.com'|get\('be'\)==='1'/);
  assert.match(s, /id="beOptIn"/);
  assert.match(s, /बिना click कोई network अनुरोध नहीं/);
});

test('[R-15] a crafted ?engineMode=bogus link is not persisted', () => {
  const M = require('./math-core.js');
  const store = new Map();
  const g = globalThis;
  const saved = { localStorage: g.localStorage, location: g.location };
  g.localStorage = { getItem: (k) => (store.has(k) ? store.get(k) : null), setItem: (k, v) => store.set(k, String(v)) };
  try {
    g.location = { search: '?engineMode=bogus&latitude=999&ayanamsha=nope&date=2026-09-07' };
    const visit = M.yantraState().get();
    assert.equal(visit.engineMode, 'bogus', 'this visit still sees (and reports) the link as given');
    const kept = JSON.parse(store.get(M.YANTRA_STATE_KEY || 'bharat-ephemeris-yantra-state-v1'));
    assert.equal(kept.engineMode, 'classical');
    assert.equal(kept.latitude, '23.1765');
    assert.equal(kept.ayanamsha, 'effective_49');
    assert.equal(kept.date, '2026-09-07', 'valid link values are kept');
    g.location = { search: '' };
    assert.equal(M.yantraState().get().engineMode, 'classical', 'a later clean visit is not broken');
  } finally {
    if (saved.localStorage === undefined) delete g.localStorage; else g.localStorage = saved.localStorage;
    if (saved.location === undefined) delete g.location; else g.location = saved.location;
  }
});

test('[R-16/R-17] museum mudra is checked before innerHTML; no owner path in the served siddhanta-drik.js', () => {
  assert.match(read('museum.html'), /R-16: never put an unchecked stored value into innerHTML/);
  assert.doesNotMatch(read('siddhanta-drik.js'), /\/Users\//);
});

test('[S-03/S-04] global.css keeps every token inside :root and gold buttons keep dark ink', () => {
  const css = read('global.css');
  const i = css.indexOf(':root {');
  const block = css.slice(i, css.indexOf('}', i));
  for (const t of ['--nav-height', '--touch-target', '--space-3', '--page-gutter', '--layer-nav']) assert.ok(block.includes(t), `${t} inside the first :root block`);
  assert.match(css, /\*,\s*\*::before,\s*\*::after\s*\{\s*box-sizing: border-box;/);
  assert.match(css, /\.btn-gold:link[^{]*\{\s*color: #161006 !important;/);
});

test('[S-17] no page registers the service worker twice', () => {
  for (const f of LEGACY_PAGES) {
    const n = (read(f).match(/serviceWorker\.register\(/g) || []).length;
    assert.ok(n <= 1, `${f}: ${n} registrations`);
  }
});
