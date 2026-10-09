'use strict';
/*
 * legacy-honesty.test.js — guards for the claims the 2026-10-07 council removed from the legacy pages
 * (satya P0-2…P0-5, P0-9…P0-11, P1-1, P1-4, P1-7, P1-12; khagola KH-02, KH-08, KH-13; vaidya VAI-03…VAI-12;
 * rakshaka R-06, R-07, R-15, R-16, R-17; jyotisha JY-04; shilpi S-03, S-04, S-17). Each check is a plain text or
 * behaviour test, so a removed claim cannot come back unnoticed. Nothing here touches the sovereign engine.
 *
 * 2026-10-08 (the three tiers, owner decision): the legacy pages offer 'ss+parameshvara' (the default), 'ss' and 'drik'
 * through math-core's tier API only. The dṛk tier is the owner's own series (siddhanta-tier.js); VSOP87/ELP and Astronomy
 * Engine are referees in the tests, never a page's source. The [TIER-*] and [LOAD] checks below guard that statically
 * (scripts/legacy-tier-ui.test.cjs drives the pages in a browser).
 */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = __dirname;
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const LEGACY_PAGES = ['index.html', 'panchang.html', 'museum.html', 'shunyabheda.html', 'shoonya_sovereign_dashboard.html'];
// the legacy pages and scripts this group rewired to the tiers (shunyabheda.html / shunyabheda-app.js are G3's)
const TIER_PAGES = ['index.html', 'panchang.html', 'museum.html', 'library.html', 'shoonya_sovereign_dashboard.html', 'test_astro.html'];
const TIER_FILES = [...TIER_PAGES, 'live-board.js', 'page-live.js'];
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
  // the static copy states the dṛk tier's measured figure exactly as M.TIERS.drik states it (taken, not computed)
  const M = require('./math-core.js');
  const fig = M.TIERS.drik.span.accuracyMeasured.match(/λ ≤ ([0-9.]+)″ against NASA-JPL DE440s/);
  assert.ok(fig, 'M.TIERS.drik.span.accuracyMeasured names the λ figure against DE440s');
  assert.ok(idx.includes(`सूर्य से शनि तक 7 ग्रह NASA-JPL DE440s से λ ≤ ${fig[1]}″ (1850–2150, repository के tests में मापा; JPL से स्वतन्त्र नहीं)`));
  assert.ok(idx.includes(`agree with NASA-JPL DE440s to λ ≤ ${fig[1]}″`));
  assert.match(idx, /राहु-केतु मध्य-पात/);
  noMatch(TIER_PAGES, /JPL DE440 से 1′ के भीतर|7 ग्रह vs JPL DE440</, 'the old dṛk-tier claim (VSOP87/ELP within 1′) is retired with that tier');
});

test('[P0-3/KH-08] the सिद्धान्त-दृक् tier is never sold as the Sūrya-Siddhānta at arc-second accuracy', () => {
  noMatch(['index.html', 'shunyabheda.html', 'shunyabheda-app.js', 'README.md'], /7\/7 ≤1″|Sūrya-Siddhānta structure at arc-second accuracy|no VSOP\/ELP\/JPL at run time\.|author's own N-body/, 'it is a series fitted to a JPL-DE440-started N-body');
  assert.match(read('index.html'), /withheld-दशक: सूर्य 110″, चन्द्र 13″/);
  assert.match(read('shunyabheda.html'), /JPL DE440 states से आरम्भ/);
});

test('[P0-2] (inverted 2026-10-08) panchang names each tier; the dṛk tier is the owner\'s own series, VSOP87/ELP only a test referee', () => {
  const p = read('panchang.html');
  noMatch(['panchang.html'], /Sūrya Siddhānta Engine|Sūrya Siddhānta Geodetic Ephemeris|यह एक <em>सूर्य-सिद्धान्त sphuṭa<\/em> यन्त्र है|classical Sūrya-Siddhānta sphuṭa angular boundaries/, 'no tier is sold as "the" engine');
  noMatch(['panchang.html'], /दृक्-तह \(VSOP87\/ELP\)|गणना-तह: दृक् \(VSOP87\/ELP\)|DrikTier/, 'the dṛk tier is no longer VSOP87/ELP, and no page computes with it');
  assert.match(p, /तीन गणना-तह: सूर्य-सिद्धान्त \+ परमेश्वर-संस्कार \(मूल\) · सूर्य-सिद्धान्त · आधुनिक भारतीय \(दृक्\)/);
  assert.match(p, /VSOP87\/ELP और Astronomy Engine केवल tests में referee हैं/);
  const M = require('./math-core.js');
  assert.match(M.TIERS.drik.engine, /^Our dṛk-siddhānta series/);
  assert.doesNotMatch(M.TIERS.drik.engine + M.TIERS.drik.provenance, /VSOP|ELP|Astronomy Engine/);
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

test('[KH-13] the dṛk lunar horizon is +7′ (the altitude the solver uses), not −7′; the text tiers\' horizon is 0', () => {
  const M = require('./math-core.js');
  const jd = M.gregorianToJulianDay('2026-10-07', '00:00:00', 5.5);
  const drik = M.lunarRiseSet(jd, 23.1765, 75.7885, 5.5, 'drik');
  assert.equal(drik.horizonAltitudeDeg, 7 / 60);
  assert.equal(drik.rule, M.TIERS.drik.moonrise);
  for (const tier of ['ss', 'ss+parameshvara']) assert.equal(M.lunarRiseSet(jd, 23.1765, 75.7885, 5.5, tier).horizonAltitudeDeg, 0, tier);
  assert.doesNotMatch(read('panchang.html'), /−7′ net/);
  assert.match(read('panchang.html'), /M\.lunarRiseSet\(jdMidnight, temple\.lat, temple\.lon, tzHours, tier\)/);
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

test('[R-15] a crafted ?tier=bogus (or ?engineMode=bogus) link is not persisted; old engineMode links migrate', () => {
  const M = require('./math-core.js');
  const store = new Map();
  const g = globalThis;
  const saved = { localStorage: g.localStorage, location: g.location };
  g.localStorage = { getItem: (k) => (store.has(k) ? store.get(k) : null), setItem: (k, v) => store.set(k, String(v)) };
  const KEY = M.YANTRA_STATE_KEY || 'bharat-ephemeris-yantra-state-v1';
  try {
    g.location = { search: '?tier=bogus&engineMode=bogus&latitude=999&ayanamsha=nope&date=2026-09-07' };
    const visit = M.yantraState().get();
    assert.equal(visit.tier, 'bogus', 'this visit still sees (and reports) the link as given');
    assert.throws(() => M.pageTier(visit.tier), RangeError, 'a page never computes with it');
    let kept = JSON.parse(store.get(KEY));
    assert.equal(kept.tier, '', 'the bogus tier is not persisted (the page default stays)');
    assert.equal('engineMode' in kept, false);
    assert.equal('ayanamsha' in kept, false, 'a named ayanāṃśa is no longer state (a tier carries its own)');
    assert.equal(kept.latitude, '23.1765');
    assert.equal(kept.date, '2026-09-07', 'valid link values are kept');
    store.clear();
    g.location = { search: '?engineMode=bogus' };
    assert.equal(M.yantraState().get().tier, '');
    kept = JSON.parse(store.get(KEY));
    assert.equal(kept.tier, '');
    assert.equal('engineMode' in kept, false, '?engineMode=bogus is not persisted');
    store.clear();
    g.location = { search: '?engineMode=classical' };
    M.yantraState().get();
    assert.equal(JSON.parse(store.get(KEY)).tier, '', 'an old classical link opens on the page default (it recorded no choice)');
    store.clear();
    g.location = { search: '?engineMode=calibrated' };
    M.yantraState().get();
    assert.equal(JSON.parse(store.get(KEY)).tier, 'drik', 'the retired hybrid maps to the dṛk tier');
    store.clear();
    g.location = { search: '?tier=ss' };
    M.yantraState().get();
    assert.equal(JSON.parse(store.get(KEY)).tier, 'ss', 'a valid tier link is kept');
    g.location = { search: '' };
    assert.equal(M.pageTier(M.yantraState().get().tier), 'ss', 'a later clean visit keeps the stored choice');
    store.clear();
    assert.equal(M.pageTier(M.yantraState().get().tier), 'ss+parameshvara', 'with nothing stored: the page default');
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

// ── the three tiers on the legacy pages (2026-10-08) ─────────────────────────────────────────────────────────────

/** Every call `.fn(` in src: its top-level argument texts (strings, template literals and brackets respected). */
function callsOf(src, fn) {
  const out = [];
  const re = new RegExp(`\\.${fn}\\s*\\(`, 'g');
  let m;
  while ((m = re.exec(src))) {
    let i = m.index + m[0].length, depth = 0, quote = null, cur = '', args = [];
    for (; i < src.length; i++) {
      const c = src[i];
      if (quote) { cur += c; if (c === '\\') { cur += src[++i]; continue; } if (c === quote) quote = null; continue; }
      if (c === '"' || c === "'" || c === '`') { quote = c; cur += c; continue; }
      if (c === '(' || c === '[' || c === '{') { depth++; cur += c; continue; }
      if (c === ')' || c === ']' || c === '}') { if (depth === 0 && c === ')') break; depth--; cur += c; continue; }
      if (c === ',' && depth === 0) { args.push(cur.trim()); cur = ''; continue; }
      cur += c;
    }
    if (cur.trim()) args.push(cur.trim());
    out.push({ at: src.slice(0, m.index).split('\n').length, args });
  }
  return out;
}
// tier-taking APIs and the argument count that includes the tier (interfaces (C)); panchangAtJd also needs a site
const TIER_ARITY = { panchangExtended: 5, panchangAtJd: 4, lunarRiseSet: 5, solarRiseSet: 5, bhavaModel: 4, tierGrahaRows: 2, tierAyanamsha: 2,
  vimshottariTier: 3, tierDay: 5, tierMeridian: 4, siderealAscendantDeg: 4, sayanaAscendantDeg: 4, scanAuspiciousMuhurtas: 7, computeSpecialLagnas: 8,
  kalaUpagrahaParts: 5, computeUpagrahas: 6, computeSuryaSiddhanta14Adhikaras: 7, getSolarCoordinates: 2, getLunarCoordinates: 2 };
const MODE_OPTION = ['canonicalGrahaModel', 'sphutaGrahaModel', 'computePlanetaryVelocities'];

test('[TIER-1] every call to a tier-taking API on the legacy pages passes a tier (and panchangAtJd a site)', () => {
  let n = 0;
  for (const f of TIER_FILES) {
    const src = read(f);
    for (const [fn, arity] of Object.entries(TIER_ARITY)) {
      for (const c of callsOf(src, fn)) { n++; assert.ok(c.args.length >= arity, `${f}:${c.at} ${fn}(${c.args.join(', ')}) — needs ${arity} arguments, the tier included`); }
    }
    for (const fn of MODE_OPTION) for (const c of callsOf(src, fn)) { n++; assert.ok(c.args.length >= 2 && /\bmode\s*:/.test(c.args[1]), `${f}:${c.at} ${fn}(${c.args.join(', ')}) — needs { mode: tier }`); }
  }
  assert.ok(n >= 15, `found ${n} tier-taking calls`);
});

test('[TIER-2] no legacy page passes a named ayanāṃśa, reads a foreign theory, or loads one', () => {
  noMatch(TIER_FILES, /['"](?:effective_49|spica_lahiri|linear_54|linear_50|sinusoidal_27|raman_spica|yukteshwar)['"]/, 'a named ayanāṃśa is not a frame: bridges take a tier');
  noMatch(TIER_FILES, /\bDrikTier\b|drigCoordinates|drigGeoJ2000|\bAstronomy\.|KaalPrecisionEphemeris|computePrecisionChart|ShunyaVsop87|ShunyaElp/, 'a vendored foreign theory is a test referee, never a page\'s source');
  noMatch(TIER_PAGES, /src="(?:vsop87-full|elp-moon|drik-engine|drik-tier|precision-ephemeris)\.js/, 'no foreign theory is loaded on these pages');
  noMatch(TIER_FILES, /['"]calibrated['"]|['"]classical['"]/, 'the retired engine modes');
});

test('[TIER-3] panchang: one panchangExtended per tier — no local karaṇa mapping, no static saṃvatsara card', () => {
  const p = read('panchang.html');
  noMatch(['panchang.html'], /karanaHalf|function drikLimbs|limbsFromSphuta\(/, 'a second limb mapping on the page');
  noMatch(['panchang.html'], /कालयुक्त|विक्रम संवत् २०८३|सौर श्रावण मास · शुक्ल पक्ष/, 'a static year, saṃvatsara or month in the saṅkalpa card');
  noMatch(['panchang.html'], /BE-S03 सीमा में/, 'a several-degree Moon gap called "within limits"');
  assert.match(p, /<input id="dateInput" type="text" inputmode="text"/, 'one signed parser, not type=date');
  assert.match(p, /LT\.parseCivil\(\$\('dateInput'\)\.value, \$\('calendarInput'\)\.value\)/);
  // the exporters name the tier and take its labels from M.TIERS (AY-11)
  assert.doesNotMatch(p, /Effective 49\.2 arcsec\/year|Surya Siddhanta Canonical Sphuta \(Four-Fold/);
  assert.match(p, /ayanamsa: `\$\{T\.ayanamsha\.name\} — \$\{T\.ayanamsha\.source\}`/);
  assert.match(p, /"Tier,Date,DayOfWeek/);
  // the deep-time exporter: the text tier, inside its tested span, the row cap stated
  assert.match(p, /M\.TIERS\.ss\.span\.years/);
  assert.match(p, /if \(rows > 100000\) rows = 100000;/);
});

test('[TIER-4] museum: the Bhāgavata 3.11 chain is a claim awaiting an edition; no bare ayanāṃśa constant; one daśā', () => {
  const m = read('museum.html');
  assert.match(m, /भागवत 3\.11 का बताया क्रम: दावा, संस्करण की प्रतीक्षा में/);
  assert.doesNotMatch(m, />भागवत 3\.11: परमाणु/);
  assert.doesNotMatch(m, /23\.85675/);
  assert.match(m, /tierAyanamsha\(2451545\.0,'drik'\)\.meanDeg/);
  assert.match(m, /SMx\.vimshottariTier\(jd,jd,tier\)/);
  assert.doesNotMatch(m, /t\*365\.25\*86400000/, 'no 365.25-day daśā dates');
  // repository check: no Bhāgavata edition is in the repository, so the label stays a claim
  const editions = fs.readdirSync(path.join(ROOT, 'editions')).concat(fs.readdirSync(path.join(ROOT, 'corpus')));
  assert.equal(editions.some((f) => /bhagavat|bhāgavata|bhagavata/i.test(f)), false);
});

test('[TIER-5] every label a legacy page shows for a tier is read from M.TIERS (the helper has no typed figure)', () => {
  const src = read('page-live.js');
  assert.doesNotMatch(src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, ''), /0\.9″|DE440|365\.25636|SS 3\.9-3\.10|Citrā|Lahiri/, 'labels come from M.TIERS, not re-typed');
  for (const k of ['engine', 'ayanamsha', 'sunrise', 'dayBoundary', 'karanaOrder', 'month', 'samvatsara', 'span', 'provenance']) assert.match(src, new RegExp(`t\\.${k}\\b`), k);
});

test('[TIER-6] parampara-record.js is the corpus record, value for value (node parampara-record.js --write regenerates it)', () => {
  const rec = require('./parampara-record.js');
  assert.deepEqual(rec, { registry: JSON.parse(read('corpus/parampara/registry.json')), samskara: JSON.parse(read('corpus/parampara/samskara.json')) });
  const P = require('./parampara.js').load(rec).samskaraParameshvara();
  assert.equal(P.offered, true);
});

/** The local script srcs of a page, in order, without ?v= queries. */
const scriptsOf = (f) => [...read(f).matchAll(/<script\b[^>]*\bsrc="([^"]+)"/g)].map((m) => m[1].replace(/[?#].*$/, '').replace(/^\.\//, ''));
const TEXT_SET = ['kala-dvara.js', 'sphuta.js', 'dhruva.js', 'ss-udaya.js', 'spanda-ganita.js', 'ss-graha.js', 'ss-chaya.js', 'ss-grahana.js', 'ss-ahargana.js',
  'panchanga.js', 'dasha.js', 'muhurta.js', 'utsava.js', 'parampara.js', 'ss-tier.js'];
function checkContract(f, needRecordScript) {
  const s = scriptsOf(f), mc = s.indexOf('math-core.js');
  assert.ok(mc >= 0, `${f} loads math-core.js`);
  for (const m of TEXT_SET) { const i = s.indexOf(m); assert.ok(i >= 0 && i < mc, `${f}: ${m} before math-core.js`); }
  assert.ok(s.indexOf('parampara.js') < s.indexOf('ss-tier.js'), `${f}: parampara.js before ss-tier.js`);
  if (needRecordScript) { const r = s.indexOf('parampara-record.js'); assert.ok(r > s.indexOf('ss-tier.js') && r < mc, `${f}: parampara-record.js between ss-tier.js and math-core.js`); }
  for (const m of ['siddhanta-drik.js', 'siddhanta-tier.js', 'drik-grahana.js']) assert.ok(s.indexOf(m) > mc, `${f}: ${m} after math-core.js`);
  assert.ok(s.indexOf('siddhanta-drik.js') < s.indexOf('siddhanta-tier.js') && s.indexOf('siddhanta-tier.js') < s.indexOf('drik-grahana.js'), `${f}: the dṛk trio in order`);
  // a deferred math-core keeps the order only if everything before it is deferred too
  const html = read(f), deferred = (m) => new RegExp(`<script[^>]*\\bdefer\\b[^>]*src="${m.replace(/\./g, '\\.')}`).test(html);
  if (deferred('math-core.js')) for (const m of TEXT_SET) assert.ok(deferred(m), `${f}: ${m} deferred like math-core.js`);
}

test('[LOAD] every legacy page that loads math-core.js loads the sovereign set, the paramparā record and ss-tier.js first', () => {
  for (const f of TIER_PAGES) checkContract(f, true);
});

test('[LOAD-G3] shunyabheda.html (G3) follows the same contract — passes once G3\'s page is merged', () => {
  checkContract('shunyabheda.html', false);
  const app = read('shunyabheda-app.js');
  assert.ok(scriptsOf('shunyabheda.html').includes('parampara-record.js') || (/corpus\/parampara\/registry\.json/.test(app) && /useParampara/.test(app)),
    'the page hands the paramparā record to the text tier');
});

test('[SW] sw.js precaches every local script every product page loads, and the paramparā record', () => {
  const B = require('./scripts/build-site.cjs');
  const pre = B.precacheList();
  for (const f of B.PAGES) for (const src of scriptsOf(f)) assert.ok(pre.has(src), `${f} loads ${src}: not precached`);
  for (const u of ['parampara-record.js', 'ss-tier.js', 'parampara.js', 'drik-grahana.js', 'corpus/parampara/registry.json', 'corpus/parampara/samskara.json']) assert.ok(pre.has(u), u);
  assert.doesNotMatch(read('sw.js'), /const CACHE = "bharat-ephemeris-s9-v24-downloads40"/, 'the cache name is bumped');
});
