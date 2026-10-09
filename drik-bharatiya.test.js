'use strict';
/* drik-bharatiya.test.js — the referee suite of the "Modern Bhāratīya (dṛk)" tier · आधुनिक भारतीय (दृक्) · 2026-10-08
 *
 * Under test: siddhanta-tier.js (window.SiddhantaTier: the owner's series v2.4.2 through its one guarded gate) and
 * drik-grahana.js (window.DrikGrahana: the eclipse search on that series, owner decision DK-3).
 * Referees (each used only here, never by a page — owner decisions DK-1…DK-5):
 *   A   NASA-JPL DE440s: test-fixtures/full-vsop-reference.json (Skyfield 1.54, apparent, 180 TT epochs) and
 *       test-fixtures/drik-de440-geometric.json (geometric, every 100 d; scripts/make-drik-fixture.cjs). Independent of
 *       the series' code, fit and reduction, NOT of its initial conditions (the N-body is restarted from DE440s states
 *       every 720 days): "agreement with DE440", never "independent of JPL".
 *   B   VSOP87B + ELP/MPP02 (astronomia, MIT) through math-core drigCoordinates: dense, independent lineage. It shares
 *       ΔT and the IAU 2006/2000B models with the tier (independent implementations).
 *   AE  Astronomy Engine 2.1.19 (drik-engine.js, MIT): its own Sun, Moon, sidereal time, obliquity, rise/set and eclipse
 *       searches — the algorithm referee (sunrise, lagna, eclipses). Its Moon is the coarsest of the three (≈6″).
 * Tolerances are the design's (design-final.json "tests"); each test prints what it measured.
 * No Swiss-Ephemeris data is used (DK-4: not committed).
 */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');

const M = require('./math-core.js');
const SD = require('./siddhanta-drik.js');
const ST = require('./siddhanta-tier.js');
const G = require('./drik-grahana.js');
const A = require('./drik-engine.js');
A.SetDeltaTFunction((ut) => M.observedDeltaTSeconds(ut));   // the referee on the tier's own ΔT (common mode, untested here)

const J2000 = 2451545.0, DEG = Math.PI / 180;
const n360 = (x) => ((x % 360) + 360) % 360;
const w180 = (x) => { const y = n360(x); return y > 180 ? y - 360 : y; };
const arcsec = (a, b) => w180(a - b) * 3600;
const jdOfYear = (y) => J2000 + (y - 2000) * 365.25;
const yearOf = (jd) => 2000 + (jd - J2000) / 365.25;
const aeTime = (jdUT) => new A.AstroTime(jdUT - J2000);
const aeJd = (t) => t.ut + J2000;
const jdOfDate = (d) => d.getTime() / 86400000 + 2440587.5;
const maxAbs = (m, k, v) => { if (!(k in m) || Math.abs(v) > Math.abs(m[k])) m[k] = v; };
const fmt = (m, d = 3) => Object.entries(m).map(([k, v]) => `${k} ${Number(v).toFixed(d)}`).join(', ');
function lcg(seed) { let s = seed >>> 0; return () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; }; }
const SPAN = ST.spanJdUT();
const SITES = { Ujjain: [23.1765, 75.7885], Delhi: [28.6139, 77.209] };
const BODIES7 = ['surya', 'candra', 'budha', 'shukra', 'mangala', 'guru', 'shani'];

// ── a spy on the raw series: every instant the tier evaluates it at, through its two entry points ────────────────────
const spy = { calls: 0, worstBelow: 0, worstAbove: 0 };
{
  const core = SD.core, vec = core.vector, god = SD.grahaOfDate;
  const note = (jdTT) => {
    spy.calls++;
    const y = yearOf(jdTT);
    if (!(y >= 1850 - 1 && y <= 2150 + 1)) throw new Error(`raw series evaluated far outside its span: y = ${y}`);
    if (y < 1850) spy.worstBelow = Math.max(spy.worstBelow, (jdOfYear(1850) - jdTT));
    if (y > 2150) spy.worstAbove = Math.max(spy.worstAbove, (jdTT - jdOfYear(2150)));
  };
  core.vector = function (S, body, t) { note(t + J2000); return vec.apply(this, arguments); };
  SD.grahaOfDate = function (jdTT) { note(jdTT); return god.apply(this, arguments); };
}

// ── A: DE440s ────────────────────────────────────────────────────────────────────────────────────────────────────
test('[A] DE440s apparent fixture (180 TT epochs × 7 bodies): tropical λ within the design\'s tolerances; label claims hold', () => {
  const ref = require('./test-fixtures/full-vsop-reference.json');
  const LIM = { surya: 0.15, candra: 0.75, budha: 0.30, shukra: 0.50, mangala: 0.60, guru: 1.0, shani: 1.0 };
  const worst = {};
  for (const [b, rows] of Object.entries(ref.data)) for (const r of rows) {
    const g = ST.tropicalGrahas(r.jdTT, { timeScale: 'TT' });
    assert.ok(g, `served at ${r.jdTT}`);
    const d = arcsec(g[b], r.longitude);
    maxAbs(worst, b, d);
    assert.ok(Math.abs(d) <= LIM[b], `${b} at JD(TT) ${r.jdTT}: ${d.toFixed(3)}″ > ${LIM[b]}″`);
  }
  console.log(`  [A] max |Δλ| vs DE440s (180 epochs): ${fmt(worst)}″`);
  const all = Math.max(...Object.values(worst).map(Math.abs));
  assert.ok(all <= 0.81, `PROVENANCE says 0.81″ at the 180 fixture epochs; measured ${all}`);
  assert.match(ST.PROVENANCE.accuracyMeasured, /0\.81″ at 180 apparent fixture epochs/);
});

test('[A-dense] DE440s geometric every 100 d (1096 epochs × 7 bodies, the series frame): λ ≤ 1.0″, β ≤ 0.8″; the label\'s ≤ 0.9″ holds', () => {
  const F = require('./test-fixtures/drik-de440-geometric.json');
  assert.match(F.provenance.licence, /public domain/);
  assert.doesNotMatch(JSON.stringify(F.provenance), /\/Users\//);
  assert.match(F.provenance.honesty, /NOT of its initial conditions/);
  assert.ok(F.rows.length >= 1090);
  const S = SD.series, C = SD.core, EO = SD.EO; C.prepare(S);
  const SK = { budha: 'Me', shukra: 'Ve', mangala: 'Ma', guru: 'Ju', shani: 'Sa' };
  const wl = {}, wb = {};
  for (const r of F.rows) {
    const t = r.jdTDB - J2000, T = t / 36525, Mx = EO.eclipticOfDateMatrix(T), pA = EO.generalPrecessionArcsec(T) / 3600;
    const raw = ST.eclipseKernel.rawTT(r.jdTDB);
    assert.ok(raw, 'in span');
    for (const k of F.bodies) {
      const [ra, dec] = r[k].map((x) => x * DEG);
      const w = EO.apply(Mx, [Math.cos(dec) * Math.cos(ra), Math.cos(dec) * Math.sin(ra), Math.sin(dec)]);
      const v = k === 'surya' ? raw.E.map((x) => -x) : k === 'candra' ? raw.M : C.vector(S, SK[k], t).map((x, i) => x - raw.E[i]);
      const dl = arcsec(Math.atan2(v[1], v[0]) / DEG, Math.atan2(w[1], w[0]) / DEG - pA);
      const db = (Math.atan2(v[2], Math.hypot(v[0], v[1])) - Math.atan2(w[2], Math.hypot(w[0], w[1]))) / DEG * 3600;
      maxAbs(wl, k, dl); maxAbs(wb, k, db);
    }
  }
  console.log(`  [A-dense] max |Δλ|: ${fmt(wl)}″\n  [A-dense] max |Δβ|: ${fmt(wb)}″`);
  for (const k of F.bodies) {
    assert.ok(Math.abs(wl[k]) <= 1.0, `${k} λ ${wl[k]}″`);
    assert.ok(Math.abs(wb[k]) <= 0.8, `${k} β ${wb[k]}″`);
  }
  const all = Math.max(...Object.values(wl).map(Math.abs));
  assert.ok(all <= 0.9, `LABEL.range claims λ ≤ 0.9″; measured ${all}″`);
  assert.match(ST.LABEL.range, /λ ≤ 0\.9″/);
  assert.match(ST.LABEL.range, /not independent of JPL/);
  assert.match(ST.LABEL.range, /restarted from DE440s states every 720 days/);
});

// ── B: VSOP87B + ELP/MPP02 ────────────────────────────────────────────────────────────────────────────────────────
test('[B] 400 seeded epochs 1850–2150 vs VSOP87B + ELP/MPP02: λ ≤ 1.5″, β ≤ 1.0″ (planets < 1° from the Sun ≤ 15″); Rāhu is the mean node', () => {
  const rnd = lcg(20261008), wl = {}, wb = {}, near = {};
  let rahu = 0;
  for (let i = 0; i < 400; i++) {
    const jd = SPAN[0] + 1 + rnd() * (SPAN[1] - SPAN[0] - 2);
    const g = ST.grahas(jd, { speed: false });
    const sun = M.drigCoordinates('surya', jd).longitude;
    for (const k of BODIES7) {
      const row = g[ST.ORDER.indexOf(k)], b = M.drigCoordinates(k, jd);
      assert.equal(row.key, k);
      const dl = arcsec(row.tropical, b.longitude), db = (row.latitude - b.latitude) * 3600;
      const elong = Math.abs(w180(b.longitude - sun));
      if (k !== 'surya' && k !== 'candra' && elong < 1) { maxAbs(near, k, Math.max(Math.abs(dl), Math.abs(db))); continue; }
      maxAbs(wl, k, dl); maxAbs(wb, k, db);
    }
    // Rāhu: the series' fitted node line against the Meeus mean node (+ Δψ), both − the same ayanāṃśa
    const ay = ST.ayanamsha(jd), T = (g.jdTT - J2000) / 36525;
    const meeus = 125.0445479 - 1934.1362891 * T + 0.0020754 * T * T + T ** 3 / 467441 - T ** 4 / 60616000;   // AA ch. 47, mean equinox of date
    rahu = Math.max(rahu, Math.abs(arcsec(g.rahu, meeus + ay.nutationDeg - ay.deg)));
    assert.ok(Math.abs(w180(g.ketu - g.rahu - 180)) < 1e-9, 'Ketu = Rāhu + 180°');
  }
  console.log(`  [B] max |Δλ|: ${fmt(wl)}″\n  [B] max |Δβ|: ${fmt(wb)}″\n  [B] < 1° from the Sun: ${fmt(near)}″; Rāhu vs Meeus mean node ${rahu.toFixed(2)}″`);
  for (const k of BODIES7) {
    assert.ok(Math.abs(wl[k]) <= 1.5, `${k} λ ${wl[k]}″`);
    assert.ok(Math.abs(wb[k]) <= 1.0, `${k} β ${wb[k]}″`);
  }
  for (const [k, v] of Object.entries(near)) assert.ok(Math.abs(v) <= 15, `${k} near the Sun ${v}″ (the unlimited deflection formula behind the disc)`);
  assert.ok(rahu <= 10, `mean node within 10″ of Meeus (design: max 8.70″ at 1850.0); got ${rahu}`);
});

test('[B] end times over 2026 (0.25-d tables, the same crossing code, the same Citrā-pakṣa): tithi, nakṣatra, yoga ≤ 2.5 s, saṅkrānti ≤ 5 s; none missing or extra', () => {
  const jd0 = 2461041.5 - 0.25, h = 0.25, N = Math.round(365 / h) + 4;
  const ours = { s: [], m: [] }, ref = { s: [], m: [] };
  for (let i = 0; i < N; i++) {
    const jd = jd0 + i * h, o = ST.sunMoon(jd), ay = ST.ayanamsha(jd).deg;
    ours.s.push(o.sunSid); ours.m.push(o.moonSid);
    ref.s.push(n360(M.drigCoordinates('surya', jd).longitude - ay)); ref.m.push(n360(M.drigCoordinates('candra', jd).longitude - ay));
  }
  const unwrap = (y) => { const o = [y[0]]; for (let i = 1; i < y.length; i++) { let d = y[i] - y[i - 1]; d -= 360 * Math.round(d / 360); o.push(o[i - 1] + d); } return o; };
  const crossings = (f, step) => {
    const lag = (x) => { const i = Math.min(Math.max(Math.floor(x) - 1, 0), f.length - 4); let s = 0;
      for (let j = 0; j < 4; j++) { let w = 1; for (let k = 0; k < 4; k++) if (k !== j) w *= (x - (i + k)) / (j - k); s += w * f[i + j]; } return s; };
    const out = [];
    for (let i = 1; i < f.length - 2; i++) {
      const a = Math.floor(f[i] / step), b = Math.floor(f[i + 1] / step);
      for (let c = a + 1; c <= b; c++) {
        let lo = i, hi = i + 1;
        for (let k = 0; k < 60; k++) { const mid = (lo + hi) / 2; if (lag(mid) < c * step) lo = mid; else hi = mid; }
        out.push({ jd: jd0 + (lo + hi) / 2 * h, c });
      }
    }
    return out;
  };
  const LIMB = {
    tithi: [(S, Mo) => unwrap(Mo.map((m, i) => n360(m - S[i]))), 12, 2.5],
    nakshatra: [(S, Mo) => unwrap(Mo), 360 / 27, 2.5],
    yoga: [(S, Mo) => unwrap(Mo.map((m, i) => n360(m + S[i]))), 360 / 27, 2.5],
    sankranti: [(S) => unwrap(S), 30, 5],
  };
  const seen = {};
  for (const [name, [fn, step, tol]] of Object.entries(LIMB)) {
    const co = crossings(fn(ours.s, ours.m), step), cr = crossings(fn(ref.s, ref.m), step);
    assert.equal(co.length, cr.length, `${name}: ${co.length} crossings vs the referee's ${cr.length}`);
    let mx = 0;
    for (let i = 0; i < co.length; i++) {
      assert.equal(n360(co[i].c * step), n360(cr[i].c * step), `${name} #${i}: the same boundary`);
      mx = Math.max(mx, Math.abs(co[i].jd - cr[i].jd) * 86400);
    }
    seen[name] = mx;
    assert.ok(mx <= tol, `${name}: ${mx.toFixed(3)} s > ${tol} s`);
  }
  console.log(`  [B] end times 2026, max |Δ|: ${fmt(seen)} s`);
});

// ── the tier's own consistency ────────────────────────────────────────────────────────────────────────────────────
test('[fast paths] sun() and sunMoon() equal grahas()\' Sun and Moon bit for bit at 300 instants; the rows carry the contract\'s fields', () => {
  const rnd = lcg(7);
  for (let i = 0; i < 300; i++) {
    const jd = SPAN[0] + rnd() * (SPAN[1] - SPAN[0]);
    const g = ST.grahas(jd, { speed: false }), s = ST.sun(jd), m = ST.sunMoon(jd);
    assert.equal(s.sunSid, g[0].longitude); assert.equal(s.sunLat, g[0].latitude); assert.equal(s.sunTrop, g[0].tropical);
    assert.equal(m.sunSid, g[0].longitude); assert.equal(m.sunLat, g[0].latitude); assert.equal(m.sunTrop, g[0].tropical);
    assert.equal(m.moonSid, g[1].longitude); assert.equal(m.moonLat, g[1].latitude); assert.equal(m.moonTrop, g[1].tropical);
    assert.ok(Math.abs(w180(m.elongation - (m.moonSid - m.sunSid))) < 1e-9, 'elongation');
    assert.ok(Math.abs(m.moonDistAU / g[1].distanceAU - 1) < 1e-9 && Math.abs(s.sunDistAU / g[0].distanceAU - 1) < 1e-9, 'distances');
    if (i === 0) {
      const full = ST.grahas(jd);
      assert.equal(full.length, 9);
      for (const r of full) {
        for (const k of ['key', 'longitude', 'latitude', 'speed', 'source']) assert.ok(k in r, `row field ${k}`);
        assert.equal(r.source, 'own'); assert.ok(Number.isFinite(r.speed)); assert.equal(r.longitude, full[r.key]);
      }
      assert.equal(full.source, 'own'); assert.equal(full.tier, 'drik');
    }
  }
});

test('[window] table(…, 0.25 d).at(jd) within 0.05″ of direct evaluation in every interval, the first and the last included', () => {
  const j0 = 2461041.5 + 0.123, tb = ST.table(j0, j0 + 31, 0.25);
  assert.equal(tb.source, 'own');
  let mx = 0;
  const n = Math.round((tb.jd1 - tb.jd0) / tb.step);
  for (let i = 0; i < n; i++) for (const f of [0.37, 0.81]) {
    const jd = tb.jd0 + (i + f) * tb.step, a = tb.at(jd), d = ST.sunMoon(jd);
    for (const k of ['sunSid', 'moonSid', 'sunTrop', 'moonTrop']) mx = Math.max(mx, Math.abs(arcsec(a[k], d[k])));
  }
  console.log(`  [window] max |interpolation − direct| ${mx.toFixed(4)}″ over ${n} intervals`);
  assert.ok(mx <= 0.05, `${mx}″`);
  assert.equal(tb.at(tb.jd0 - 1e-6), null); assert.equal(tb.at(tb.jd1 + 1e-6), null);
});

test('[ayanāṃśa] Citrā-pakṣa true: the IAE value at its epoch, the constant offset from the series frame, displayed = applied', () => {
  // the reference epoch: 23°15′00.658″ (true equinox) + Swiss's 0.138235″ realisation, JD 2435553.5 (TT)
  const t0 = ST.ayanamsha(2435553.5, { timeScale: 'TT' });
  const d0 = (t0.deg - (23.250182778 + 0.138235 / 3600)) * 3600;
  console.log(`  [ayanāṃśa] at JD 2435553.5 TT: ${t0.deg.toFixed(9)}° (IAE + 0.138235″ ${d0 >= 0 ? '+' : ''}${d0.toFixed(5)}″; Swiss vs own Δψ(t0))`);
  assert.ok(Math.abs(d0) <= 0.005, `${d0}″`);
  assert.equal(t0.name, 'citra-paksha'); assert.equal(t0.trueDeg, t0.deg); assert.equal(t0.deg, t0.meanDeg + t0.nutationDeg);
  // a pinned instant: 2026-10-08 06:00 IST (JD UT 2461321.520833); the design's critic computed 24.233374967° with the
  // engine's own chart.cjs (c3-ayanamsha.cjs) — the port reproduces it
  const a = ST.ayanamsha(2461321.520833);
  assert.ok(Math.abs(a.deg - 24.233374967) * 3600 < 1e-3, `${a.deg}`);
  assert.ok(Math.abs(a.meanDeg - 24.231014469) * 3600 < 1e-3, `${a.meanDeg}`);
  assert.ok(a.rateArcsecPerYear > 50.2 && a.rateArcsecPerYear < 50.4, `${a.rateArcsecPerYear}″/yr`);
  // sidereal λ = the series' native (frame) longitude − 23.857092288°, a constant (design: holds to 3.7e-10°)
  let mx = 0, applied = 0;
  for (let i = 0; i < 300; i++) {
    const jd = 2397000 + i * 365.0 + (i % 11) * 0.37, g = ST.grahas(jd, { speed: false });
    const pA = SD.EO.generalPrecessionArcsec((g.jdTT - J2000) / 36525) / 3600, raw = SD.grahaOfDate(g.jdTT);
    for (const [k, e] of [['surya', 'surya'], ['candra', 'chandra'], ['shani', 'shani'], ['rahu', 'rahu']]) {
      mx = Math.max(mx, Math.abs(w180(g[k] - (raw._lonMean[e] - pA - 23.857092288))));
    }
    const ay = ST.ayanamsha(jd);
    assert.equal(g.ayanamshaDeg, ay.deg, 'the value displayed is the value applied');
    for (const r of g) if (r.key !== 'rahu' && r.key !== 'ketu') applied = Math.max(applied, Math.abs(w180(r.longitude - (r.tropical - ay.deg))));
  }
  console.log(`  [ayanāṃśa] |sidereal − (native − 23.857092288°)| ≤ ${mx.toExponential(2)}°, |sidereal − (tropical − deg)| ≤ ${applied.toExponential(2)}°`);
  assert.ok(mx <= 1e-9, `${mx}`); assert.ok(applied <= 1e-9, `${applied}`);
  // a named ayanāṃśa is refused everywhere (DK-2), whatever the form: by every entry that takes options, and by the
  // entries without options when one is passed in an extra argument (C4: lunarMonth(jd, 'spica_lahiri') used to return
  // the Citrā-pakṣa month silently)
  const J = 2461321.5, U = { latitude: 23.1765, longitude: 75.7885 };
  const takesOptions = {
    grahas: (x) => ST.grahas(J, x), sun: (x) => ST.sun(J, x), sunMoon: (x) => ST.sunMoon(J, x), ayanamsha: (x) => ST.ayanamsha(J, x),
    lagna: (x) => ST.lagna(J, 23, 75, x), tropicalGrahas: (x) => ST.tropicalGrahas(J, x), inSpan: (x) => ST.inSpan(J, x),
    riseSet: (x) => ST.riseSet('sun', J, 23, 75, x), sunEvents: (x) => ST.sunEvents(J, 23, 75, x), moonEvents: (x) => ST.moonEvents(J, 23, 75, x),
    eclipses: (x) => ST.eclipses(J, J + 1, U, x), 'DrikGrahana.eclipses': (x) => G.eclipses(J, J + 1, U, x), 'DrikGrahana.geometryAt': (x) => G.geometryAt(J, U, x),
  };
  const extraArgument = {
    gast: (x) => ST.gast(J, x), syzygy: (x) => ST.syzygy(J, 0, 1, x), sankrantisBetween: (x) => ST.sankrantisBetween(J, J + 40, x),
    lunarMonth: (x) => ST.lunarMonth(J, x), table: (x) => ST.table(J, J + 1, 0.25, x),
  };
  for (const [name, fn] of Object.entries({ ...takesOptions, ...extraArgument })) {
    assert.throws(() => fn('spica_lahiri'), (e) => e instanceof RangeError && /Citrā-pakṣa/.test(e.message), `${name}: a string name`);
    assert.throws(() => fn({ ayanamsha: 'lahiri' }), (e) => e instanceof RangeError && /Citrā-pakṣa/.test(e.message), `${name}: opts.ayanamsha`);
    assert.notEqual(fn('citra-paksha'), null, `${name}: its own name is accepted`);
  }
  // the entries without options say so in their doc
  const src = fs.readFileSync(path.join(__dirname, 'siddhanta-tier.js'), 'utf8');
  for (const name of Object.keys(extraArgument)) {
    const at = src.indexOf(`const ${name} = guarded(function`);
    assert.ok(at > 0, name);
    assert.match(src.slice(src.lastIndexOf('/**', at), at).replace(/\s*\n\s*\*\s*/g, ' '), /No options/, `${name}'s doc says it takes no options`);
  }
  assert.match(ST.LABEL.ayanamsha, /the value shown is the value applied/);
});

// ── the span, refusal, the EDGE RULE and the seams ─────────────────────────────────────────────────────────────────
test('[span] inSpan is the series rule (y = 1850.0 … 2150.0 TT): true at both ends, false 1e-6 d outside; every entry refuses outside, fast, without NaN', () => {
  const [a, b] = SPAN;
  assert.ok(Math.abs(yearOf(ST.jdTTofUT(a)) - 1850) < 1e-9 && Math.abs(yearOf(ST.jdTTofUT(b)) - 2150) < 1e-9);
  assert.equal(ST.inSpan(a), true); assert.equal(ST.inSpan(b), true);
  assert.equal(ST.inSpan(a - 1e-6), false); assert.equal(ST.inSpan(b + 1e-6), false);
  assert.deepEqual(ST.span(), [1850, 2150]);
  const entries = {
    tropicalGrahas: (j) => ST.tropicalGrahas(j), grahas: (j) => ST.grahas(j), sun: (j) => ST.sun(j), sunMoon: (j) => ST.sunMoon(j),
    ayanamsha: (j) => ST.ayanamsha(j), gast: (j) => ST.gast(j), lagna: (j) => ST.lagna(j, 23.18, 75.79),
    riseSetSun: (j) => ST.riseSet('sun', j, 23.18, 75.79), riseSetMoon: (j) => ST.riseSet('moon', j, 23.18, 75.79),
    sunEvents: (j) => ST.sunEvents(j, 23.18, 75.79), moonEvents: (j) => ST.moonEvents(j, 23.18, 75.79),
    syzygy: (j) => ST.syzygy(j, 0, 1), sankrantisBetween: (j) => ST.sankrantisBetween(j, j + 40), lunarMonth: (j) => ST.lunarMonth(j),
    table: (j) => ST.table(j, j + 2), eclipses: (j) => ST.eclipses(j, j + 30), eclipsesSite: (j) => G.eclipses(j, j + 30, { latitude: 23.18, longitude: 75.79 }),
    geometryAt: (j) => G.geometryAt(j), rawTT: (j) => ST.eclipseKernel.rawTT(j), vectorsTT: (j) => ST.eclipseKernel.sunMoonVectorsTT(j),
  };
  const BAD = { 'JD 0': 0, '+2^23 d': 2 ** 23, '−2^23 d': -(2 ** 23), '+50,000 y': jdOfYear(52000), '−50,000 y': jdOfYear(-48000),
    '1e-6 d before 1850.0': a - 1e-6, '1e-6 d after 2150.0': b + 1e-6, 'y = 1849.99': jdOfYear(1849.99), 'y = 2150.01': jdOfYear(2150.01) };
  let worstMs = 0;
  for (const [what, j] of Object.entries(BAD)) for (const [name, fn] of Object.entries(entries)) {
    const t = process.hrtime.bigint();
    // the kernel takes TT; a rise/set entry takes the start of a civil day, refused when the day's events fall outside
    // (a day that begins before 1850.0 but whose events all lie inside is served: [edge rule])
    const arg = name === 'rawTT' || name === 'vectorsTT' ? (Number.isFinite(j) ? ST.jdTTofUT(j) : j)
      : /^(riseSet|sunEvents|moonEvents)/.test(name) && Number.isFinite(j) && j < a ? j - 1 : j;
    const r = fn(arg);
    worstMs = Math.max(worstMs, Number(process.hrtime.bigint() - t) / 1e6);
    assert.equal(r, null, `${name} at ${what} must be null`);
  }
  console.log(`  [span] ${Object.keys(BAD).length} instants × ${Object.keys(entries).length} entries refused, slowest ${worstMs.toFixed(3)} ms`);
  assert.ok(worstMs < 100, `${worstMs} ms`);
  // a bad argument is a TypeError, never a refusal: null means only "outside the span" (C4; it used to be null, which
  // math-core turned into a TierSpanError, so a typo read as 'outside 1850–2150')
  const NOT_A_NUMBER = { NaN: NaN, '+Infinity': Infinity, '−Infinity': -Infinity, 'a numeric string': '2461321.5', undefined: undefined, null: null, 'an object': {} };
  for (const [what, j] of Object.entries(NOT_A_NUMBER)) for (const [name, fn] of Object.entries(entries)) {
    assert.throws(() => fn(j), TypeError, `${name} at ${what} must throw TypeError`);
  }
  for (const [what, f] of Object.entries({ inSpan: () => ST.inSpan(NaN), inSpanTT: () => ST.inSpanTT('x'), jdTTofUT: () => ST.jdTTofUT(undefined), utOfTT: () => ST.utOfTT(NaN),
    deltaTSeconds: () => ST.deltaTSeconds(null), 'riseSet latitude': () => ST.riseSet('moon', 2461321.5, NaN, 75), 'lagna longitude': () => ST.lagna(2461321.5, 23, '75') })) {
    assert.throws(f, TypeError, what);
  }
  assert.throws(() => ST.riseSet('moon', 2461321.5, 90, 75), RangeError, 'a pole is a range error, not a type error');
  // DrikTier (referee B) never stands in for the tier
  require('./drik-tier.js');
  assert.equal(globalThis.DrikTier.grahas(a - 1), null);
  assert.equal(globalThis.DrikTier.role, 'referee');
  assert.throws(() => globalThis.DrikTier.grahas(2461321.5, 'spica_lahiri'), /Citrā-pakṣa/);
  assert.match(ST.LABEL.refusal, /refuses/); assert.match(ST.LABEL.range, /Outside 1850–2150: refused/);
});

test('[edge rule] a month or year block that needs an instant outside 1850.0–2150.0 is refused; in-span blocks at the edges are own', () => {
  const [a, b] = SPAN;
  // the month holding 1850.0 began at a new moon in 1849: refused (no value from outside, no foreign fill)
  assert.equal(ST.lunarMonth(a + 1), null);
  assert.equal(ST.sankrantisBetween(a - 1, a + 30), null);
  // the first in-span year: the new moon of 1850.1998, Meṣa saṅkrānti 1850.2794 (design c12) — Caitra, own
  const first = ST.lunarMonth(jdOfYear(1850.215));
  assert.equal(first.source, 'own'); assert.equal(first.name, 'Caitra'); assert.equal(first.adhika, false);
  assert.ok(Math.abs(yearOf(first.start) - 1850.1998) < 2e-4, `${yearOf(first.start)}`);
  assert.equal(first.sankrantis[0].index, 0); assert.ok(Math.abs(yearOf(first.sankrantis[0].jd) - 1850.2794) < 2e-4);
  // the last year: it starts at 2149.2645 (Caitra, own) and ends after 2150.0 (design c12) — its end is refused
  const last = ST.lunarMonth(jdOfYear(2149.27));
  assert.equal(last.name, 'Caitra'); assert.ok(Math.abs(yearOf(last.start) - 2149.2645) < 2e-4, `${yearOf(last.start)}`);
  assert.equal(ST.sankrantisBetween(jdOfYear(2149.9), jdOfYear(2150.3)), null, 'the next Meṣa saṅkrānti (2150.27) is outside');
  const lastMonth = ST.lunarMonth(b - 3);                         // the last whole month: it ends at a new moon before 2150.0
  assert.equal(lastMonth.source, 'own'); assert.ok(lastMonth.end <= b);
  assert.equal(ST.lunarMonth(lastMonth.end + 0.5), null, 'the month after it ends after 2150.0');
  // windows and days that reach outside: refused; those wholly inside: served
  assert.equal(ST.table(b - 1, b + 1), null); assert.ok(ST.table(b - 2, b - 1));
  assert.equal(ST.riseSet('sun', b - 0.3, 23, 75), null, 'the sunset of the last day falls after 2150.0');
  const d0 = ST.riseSet('sun', a - 0.3, 23, 75);                  // a civil day beginning before 1850.0 whose events are inside
  assert.ok(d0 && d0.riseJd > a && d0.setJd > a && d0.source === 'own', 'served: every instant it uses is inside');
  assert.equal(ST.riseSet('sun', a - 1, 23, 75), null, 'a day wholly before 1850.0');
  assert.equal(ST.eclipses(a, a + 30), null, 'the search window reaches 0.6 d before 1850.0');
  assert.ok(Array.isArray(ST.eclipses(a + 1, a + 60)));
  // at the end: a window whose end + 0.6 d is inside is served although the next syzygy falls after 2150.0 (it is not
  // needed, and the raw series is not asked for it); the annular eclipse of 2149-12 (Astronomy Engine: JD 2506329.5470)
  const nearEnd = ST.eclipses(b - 41, b - 1);
  assert.ok(Array.isArray(nearEnd) && nearEnd.some((e) => e.kind === 'solar' && e.type === 'annular' && Math.abs(e.maxJdUT - 2506329.547) < 1e-3),
    `the last eclipse in the span is served: ${JSON.stringify(nearEnd && nearEnd.map((e) => [e.kind, e.type, e.maxJdUT]))}`);
  assert.equal(ST.eclipses(b - 41, b - 0.5), null, 'the search window reaches 0.6 d after 2150.0');
});

test('[seams] at both span edges: values up to the edge, null beyond; speeds at the edge from inside-only stencils agree with the central rate; the raw series is never asked for an instant beyond its stencils', () => {
  for (const [edge, dir] of [[SPAN[0], -1], [SPAN[1], 1]]) {
    for (let k = -48; k <= 48; k++) {
      const jd = edge + k / 24, r = ST.sunMoon(jd), inside = dir < 0 ? jd >= edge : jd <= edge;
      if (inside) assert.ok(r && Number.isFinite(r.moonSid) && Number.isFinite(r.sunSid), `served at ${k} h`);
      else assert.equal(r, null, `refused at ${k} h`);
    }
    const g = ST.grahas(edge), gi = ST.grahas(edge - dir * 0.02);
    for (let i = 0; i < 9; i++) assert.ok(Math.abs(g[i].speed - gi[i].speed) < 2e-3 * Math.max(1, Math.abs(g[i].speed)), `${g[i].key}: edge ${g[i].speed} vs inside ${gi[i].speed}`);
  }
  // the gate's stencils (light-time ≤ 0.07 d for Saturn, the core's ±0.02-d velocity) are the only reach beyond an edge
  console.log(`  [seams] raw series: ${spy.calls} evaluations so far; furthest beyond 1850.0 ${spy.worstBelow.toFixed(4)} d, beyond 2150.0 ${spy.worstAbove.toFixed(4)} d (stencils of in-span values)`);
  assert.ok(spy.worstBelow <= 0.1 && spy.worstAbove <= 0.1);
  // the one gate: nothing served calls the raw series except siddhanta-tier.js
  const served = fs.readdirSync(__dirname).filter((f) => /\.(js|html|mjs)$/.test(f) && !/\.test\./.test(f) && f !== 'siddhanta-tier.js' && f !== 'siddhanta-drik.js');
  for (const f of served) {
    const text = fs.readFileSync(path.join(__dirname, f), 'utf8');
    assert.doesNotMatch(text, /\bSiddhantaDrik\s*[.[]|require\(\s*["']\.\/siddhanta-drik(?:\.js)?["']\s*\)/, `${f} reaches the raw series`);
  }
  // the tier and its eclipse search run no foreign theory
  for (const f of ['siddhanta-tier.js', 'drik-grahana.js']) {
    const text = fs.readFileSync(path.join(__dirname, f), 'utf8');
    assert.doesNotMatch(text, /\bAstronomy\s*\.|ShunyaVsop87|ShunyaElp|drigCoordinates|drik-engine|vsop87-full|elp-moon|DrikTier\s*\./, f);
  }
});

// ── the horizon: sunrise, lagna, moonrise ──────────────────────────────────────────────────────────────────────────
const altitudeDeg = (raDeg, decDeg, gastDeg, lat, lon) => {
  const H = (gastDeg + lon - raDeg) * DEG, d = decDeg * DEG, p = lat * DEG;
  return Math.asin(Math.sin(p) * Math.sin(d) + Math.cos(p) * Math.cos(d) * Math.cos(H)) / DEG;
};
/** Seconds by which the referee's altitude at jd misses h0: (alt(jd) − h0) / (d alt/dt). Referee B's body (drigCoordinates
 *  RA/Dec of date) and Astronomy Engine's apparent sidereal time — nothing of the tier's own. */
function residualSeconds(body, jd, lat, lon, h0) {
  const alt = (j) => { const c = M.drigCoordinates(body, j); return altitudeDeg(c.rightAscensionDeg, c.declinationDeg, A.SiderealTime(aeTime(j)) * 15, lat, lon); };
  const rate = (alt(jd + 1 / 86400) - alt(jd - 1 / 86400)) / 2;
  return (alt(jd) - h0) / rate;
}

test('[sunrise] Ujjain and Delhi, 52 weekly days of 2026: referee B\'s Sun sits at −50′ at our instants (≤ 0.05 s); within 3 s of Astronomy Engine SearchRiseSet', () => {
  const out = {};
  for (const [name, [lat, lon]] of Object.entries(SITES)) {
    const obs = new A.Observer(lat, lon, 0);
    let ae = 0, b = 0;
    for (let w = 0; w < 52; w++) {
      const mid = 2461041.5 + w * 7 - 5.5 / 24, r = ST.sunEvents(mid, lat, lon);
      assert.ok(r.riseJd > mid && r.riseJd < r.noonJd && r.noonJd < r.setJd && r.setJd < mid + 1);
      const aR = aeJd(A.SearchRiseSet(A.Body.Sun, obs, +1, aeTime(mid), 1)), aS = aeJd(A.SearchRiseSet(A.Body.Sun, obs, -1, aeTime(mid), 1));
      ae = Math.max(ae, Math.abs(r.riseJd - aR) * 86400, Math.abs(r.setJd - aS) * 86400);
      b = Math.max(b, Math.abs(residualSeconds('surya', r.riseJd, lat, lon, -50 / 60)), Math.abs(residualSeconds('surya', r.setJd, lat, lon, -50 / 60)));
    }
    out[name] = { ae, b };
    assert.ok(ae <= 3, `${name}: ${ae} s vs SearchRiseSet`);
    assert.ok(b <= 0.05, `${name}: ${b} s vs referee B's Sun`);
  }
  console.log(`  [sunrise] vs AE SearchRiseSet: Ujjain ${out.Ujjain.ae.toFixed(2)} s, Delhi ${out.Delhi.ae.toFixed(2)} s; B-Sun altitude residual ${Math.max(out.Ujjain.b, out.Delhi.b).toFixed(4)} s`);
  // polar day and night are reported, not invented
  const pd = ST.sunEvents(jdOfYear(2026.47), 78.2, 15.6), pn = ST.sunEvents(jdOfYear(2026.97), 78.2, 15.6);
  assert.equal(pd.riseJd, null); assert.equal(pd.setJd, null); assert.equal(pd.polar, 'up');
  assert.equal(pn.riseJd, null); assert.equal(pn.setJd, null); assert.equal(pn.polar, 'down');
  assert.match(ST.LABEL.sunrise, /upper limb on the horizon with 34′ refraction/);
});

test('[lagna] 500 instants at five sites: within 2″ of the same formula on Astronomy Engine\'s GAST and true obliquity; the point rises in the east; sidereal = tropical − the applied ayanāṃśa', () => {
  const sites = [[23.1765, 75.7885], [28.6139, 77.209], [-33.9, 18.4], [51.5, -0.12], [64.1, -21.9]];
  let mx = 0, alt = 0;
  for (let i = 0; i < 500; i++) {
    const jd = SPAN[0] + 43 + i * 219.137 + (i % 7) * 0.13, [lat, lon] = sites[i % 5];
    const L = ST.lagna(jd, lat, lon), t = aeTime(jd);
    const th = (A.SiderealTime(t) * 15 + lon) * DEG, eps = A.e_tilt(t).tobl * DEG, phi = lat * DEG;
    const asc = n360(Math.atan2(Math.cos(th), -(Math.sin(th) * Math.cos(eps) + Math.tan(phi) * Math.sin(eps))) / DEG);
    mx = Math.max(mx, Math.abs(arcsec(L.ascTropical, asc)));
    // the ecliptic point (λ = asc, β = 0) on the horizon, in the east
    const l = L.ascTropical * DEG, ra = Math.atan2(Math.sin(l) * Math.cos(eps), Math.cos(l)) / DEG, dec = Math.asin(Math.sin(l) * Math.sin(eps)) / DEG;
    alt = Math.max(alt, Math.abs(altitudeDeg(ra, dec, A.SiderealTime(t) * 15, lat, lon)) * 3600);
    const H = w180(A.SiderealTime(t) * 15 + lon - ra);
    assert.ok(H < 0, 'rising: hour angle negative');
    const ay = ST.ayanamsha(jd).deg;
    assert.ok(Math.abs(w180(L.asc - (L.ascTropical - ay))) < 1e-9 && Math.abs(w180(L.mc - (L.mcTropical - ay))) < 1e-9);
    assert.equal(L.ayanamshaDeg, ay);
  }
  console.log(`  [lagna] vs AE-GAST formula ${mx.toFixed(3)}″; altitude of the lagna point ${alt.toFixed(3)}″ (the Swiss houses check, 2.70″, is the design's — DK-4 data not committed)`);
  assert.ok(mx <= 2, `${mx}″`); assert.ok(alt <= 2, `${alt}″`);
});

test('[moonrise, DK-5] Ujjain, 52 weekly days of 2026: referee B\'s Moon centre sits on the net +7′ geocentric horizon at our instants (≤ 2 s)', () => {
  const [lat, lon] = SITES.Ujjain;
  let mx = 0, n = 0;
  for (let w = 0; w < 52; w++) {
    const mid = 2461041.5 + w * 7 - 5.5 / 24, r = ST.moonEvents(mid, lat, lon);
    for (const ev of [r.riseJd, r.setJd]) {
      if (ev === null) continue;
      assert.ok(ev >= mid && ev < mid + 1);
      mx = Math.max(mx, Math.abs(residualSeconds('candra', ev, lat, lon, 7 / 60))); n++;
    }
  }
  console.log(`  [moonrise] ${n} events, B-Moon residual ≤ ${mx.toFixed(3)} s (the design's c10: ≤ 0.7 s against math-core lunarRiseSet's own algorithm)`);
  assert.ok(n >= 90, `${n} events`); assert.ok(mx <= 2, `${mx} s`);
  // a grazing Moon at high latitude (Tromsø, 2026-01-05 local): it sets about 12.5 h after midnight and rises again
  // about 3 h later; the declination moves ≈ 2.5° between the transit and the set, so both events must be found
  const [tl, tn] = [69.65, 18.96], g = ST.moonEvents(2461041.5 + 4 - 1 / 24, tl, tn);
  assert.ok(g.setJd !== null && g.riseJd !== null && g.setJd < g.riseJd, `grazing set and rise both found: ${JSON.stringify(g)}`);
  for (const ev of [g.setJd, g.riseJd]) assert.ok(Math.abs(residualSeconds('candra', ev, tl, tn, 7 / 60)) <= 2, `Tromsø grazing event at ${ev}`);
  assert.equal(ST.CONSTANTS.MOON_HORIZON_DEG, 7 / 60);
  assert.match(ST.LABEL.moonrise, /net \+7′ horizon/);
});

test('[two rises in a day] Tromsø, 56 days of 2026 (2026-05-11 … 07-05): riseSet(…, { events: true }) lists every crossing of the +7′ horizon that a 5-minute scan of our own Moon finds, including the days with two rises or two sets; riseJd/setJd keep their meaning', () => {
  // the scan: our own Moon (hourly sunMoon RA/Dec, 4-point Lagrange) against our own GAST every 5 minutes, crossings
  // bisected; a check on completeness, not a referee
  const [lat, lon] = [69.65, 18.96], d0 = 2461171.5 - 1 / 24, days = 56, ra = [], dec = [];
  for (let i = -24; i <= days * 24 + 48; i++) { const m = ST.sunMoon(d0 + i / 24); ra.push(m.moonRa); dec.push(m.moonDec); }
  for (let i = 1; i < ra.length; i++) ra[i] = ra[i - 1] + w180(ra[i] - ra[i - 1]);
  const lag = (y, x) => { const i = Math.min(Math.max(Math.floor(x) - 1, 0), y.length - 4); let s = 0;
    for (let j = 0; j < 4; j++) { let w = 1; for (let k = 0; k < 4; k++) if (k !== j) w *= (x - (i + k)) / (j - k); s += w * y[i + j]; } return s; };
  const alt = (jd) => { const x = (jd - d0) * 24 + 24; return altitudeDeg(lag(ra, x), lag(dec, x), ST.gast(jd), lat, lon) - 7 / 60; };
  let doubles = 0, worst = 0, n = 0;
  for (let day = 0; day < days; day++) {
    const a = d0 + day, scan = [];
    let prev = alt(a);
    for (let k = 1; k <= 288; k++) {
      const t = a + k / 288, v = alt(t);
      if ((prev < 0) !== (v < 0)) {
        let lo = t - 1 / 288, hi = t; const up = v >= 0;
        for (let it = 0; it < 30; it++) { const m = (lo + hi) / 2; if ((alt(m) >= 0) === up) hi = m; else lo = m; }
        scan.push({ kind: up ? 'rise' : 'set', jd: (lo + hi) / 2 });
      }
      prev = v;
    }
    const r = ST.riseSet('moon', a, lat, lon, { events: true }), plain = ST.riseSet('moon', a, lat, lon);
    assert.deepEqual(r.events.map((e) => e.kind), scan.map((e) => e.kind), `day ${day}: ${JSON.stringify(r.events)} vs scan ${JSON.stringify(scan)}`);
    r.events.forEach((e, i) => { worst = Math.max(worst, Math.abs(e.jd - scan[i].jd) * 86400); n++; });
    for (const e of r.events) assert.ok(e.jd >= a && e.jd < a + 1);
    for (let i = 1; i < r.events.length; i++) assert.ok(r.events[i].jd > r.events[i - 1].jd, 'in time order');
    // the old fields are unchanged by the option, and each is one of the listed events
    for (const k of ['riseJd', 'setJd', 'transitJd', 'polar']) assert.equal(r[k], plain[k], `day ${day} ${k}`);
    assert.equal(plain.events, undefined, 'events only when asked');
    if (r.riseJd !== null) assert.ok(r.events.some((e) => e.kind === 'rise' && e.jd === r.riseJd));
    if (r.setJd !== null) assert.ok(r.events.some((e) => e.kind === 'set' && e.jd === r.setJd));
    if (r.events.filter((e) => e.kind === 'rise').length > 1 || r.events.filter((e) => e.kind === 'set').length > 1) doubles++;
  }
  console.log(`  [two rises in a day] Tromsø 2026-05-11 … 07-05: ${n} events, ${doubles} days with two rises or two sets; |events − scan| ≤ ${worst.toFixed(2)} s`);
  // the same scan over all of 2026 finds five such days at Tromsø, all inside this window (days 134, 146, 159, 170, 183)
  assert.equal(doubles, 5, `${doubles} days with two rises or two sets`);
  assert.ok(worst <= 30, `${worst} s`);
  // sunEvents and moonEvents pass the option through
  assert.deepEqual(ST.moonEvents(d0 + 4, lat, lon, { events: true }).events, ST.riseSet('moon', d0 + 4, lat, lon, { events: true }).events);
});

// ── eclipses (DK-3): our search on our series, refereed ─────────────────────────────────────────────────────────────
function aeLunar(a, b) { const out = []; let e = A.SearchLunarEclipse(new Date((a - 2440587.5) * 86400000)); while (jdOfDate(e.peak.date) <= b) { out.push(e); e = A.NextLunarEclipse(e.peak); } return out; }
function aeSolar(a, b) { const out = []; let e = A.SearchGlobalSolarEclipse(new Date((a - 2440587.5) * 86400000)); while (jdOfDate(e.peak.date) <= b) { out.push(e); e = A.NextGlobalSolarEclipse(e.peak); } return out; }
function pair(ours, refs, peakOf, name) {
  const used = new Set(), pairs = [];
  for (const r of refs) {
    const pj = peakOf(r), i = ours.findIndex((o, j) => !used.has(j) && Math.abs(o.maxJdUT - pj) < 0.5);
    assert.ok(i >= 0, `${name}: the referee's eclipse at JD ${pj.toFixed(4)} (${r.kind}) is missing from ours`);
    used.add(i); pairs.push([ours[i], r, pj]);
  }
  const extra = ours.filter((o, j) => !used.has(j));
  assert.equal(extra.length, 0, `${name}: ours has eclipses the referee does not: ${extra.map((o) => o.maxJdUT.toFixed(3) + ' ' + o.type).join(', ')}`);
  return pairs;
}

test('[eclipses vs AE] 1900–2100: every lunar and solar eclipse found by both (one-to-one), times, types and magnitudes within the measured tolerances', () => {
  const a = jdOfYear(1900), b = jdOfYear(2100);
  const t = Date.now(), ours = ST.eclipses(a, b), ms = Date.now() - t;
  const oL = ours.filter((r) => r.kind === 'lunar'), oS = ours.filter((r) => r.kind === 'solar');
  const L = pair(oL, aeLunar(a, b), (r) => jdOfDate(r.peak.date), 'lunar'), S = pair(oS, aeSolar(a, b), (r) => jdOfDate(r.peak.date), 'solar');
  const m = {}, borderline = [], nonCentral = [], hybrid = [];
  for (const [o, r, pj] of L) {
    maxAbs(m, 'lunar peak s', (o.maxJdUT - pj) * 86400);
    maxAbs(m, 'penumbral semi-duration min', o.semiDurationMinutes.penumbral - r.sd_penum);
    if (r.sd_partial > 0 && o.semiDurationMinutes.partial > 0) maxAbs(m, 'partial semi-duration min', o.semiDurationMinutes.partial - r.sd_partial);
    if (r.sd_total > 0 && o.semiDurationMinutes.total > 0) maxAbs(m, 'total semi-duration min', o.semiDurationMinutes.total - r.sd_total);
    maxAbs(m, 'lunar obscuration', o.obscuration - r.obscuration);
    if (o.type !== r.kind) { borderline.push(o); assert.ok(Math.abs(o.umbralMagnitude) < 0.01, `lunar ${pj}: ${o.type} vs ${r.kind} with umbral magnitude ${o.umbralMagnitude}`); }
    assert.ok(o.contacts.P1.jdUT < o.maxJdUT && o.maxJdUT < o.contacts.P4.jdUT);
    assert.equal(o.source, 'own');
  }
  for (const [o, r, pj] of S) {
    maxAbs(m, 'solar peak s', (o.maxJdUT - pj) * 86400);
    if (o.central && Math.abs(o.gamma) < 0.9) {
      maxAbs(m, 'greatest-eclipse latitude deg', o.greatest.latitude - r.latitude);
      maxAbs(m, 'greatest-eclipse longitude deg', w180(o.greatest.longitude - r.longitude));
      maxAbs(m, 'solar obscuration (central)', o.obscuration - r.obscuration);
    }
    // Astronomy Engine has no 'hybrid' (it reports the type at greatest eclipse) and calls a non-central total or
    // annular eclipse 'partial'; ours keeps both classes of the canons
    if (o.type === 'hybrid') { hybrid.push(o); assert.equal(o.typeAtGreatest, r.kind); }
    else if (!o.central && o.type !== 'partial') { nonCentral.push(o); assert.equal(r.kind, 'partial'); assert.ok(Math.abs(o.gamma) > 0.99 && Math.abs(o.gamma) < 1.03, `${o.gamma}`); }
    else assert.equal(o.type, r.kind, `solar ${pj}: ${o.type} vs ${r.kind}`);
    assert.ok(o.contacts.P1.jdUT < o.maxJdUT && o.maxJdUT < o.contacts.P4.jdUT);
  }
  console.log(`  [eclipses] ours: ${oL.length} lunar + ${oS.length} solar in ${ms} ms; all paired with Astronomy Engine's\n  [eclipses] ${fmt(m, 4)}`
    + `\n  [eclipses] lunar type differs only at |umbral magnitude| < 0.01: ${borderline.map((o) => yearOf(o.maxJdUT).toFixed(2) + ' (' + o.umbralMagnitude.toFixed(4) + ')').join(', ')}`
    + `\n  [eclipses] hybrid: ${hybrid.length}; non-central total/annular: ${nonCentral.map((o) => yearOf(o.maxJdUT).toFixed(2) + ' ' + o.type).join(', ')}`);
  assert.equal(oL.length, 457); assert.equal(oS.length, 452);
  const TOL = { 'lunar peak s': 20, 'penumbral semi-duration min': 10, 'partial semi-duration min': 10, 'total semi-duration min': 6, 'lunar obscuration': 0.01,
    'solar peak s': 20, 'greatest-eclipse latitude deg': 0.1, 'greatest-eclipse longitude deg': 0.2, 'solar obscuration (central)': 0.005 };
  for (const [k, v] of Object.entries(TOL)) assert.ok(Math.abs(m[k]) <= v, `${k}: ${m[k]} > ${v}`);
  assert.ok(borderline.length <= 5);
  // the claim PROVENANCE.eclipsesMeasured makes
  assert.match(ST.PROVENANCE.eclipsesMeasured, /457 lunar and 452 solar/);
  assert.ok(Math.abs(m['lunar peak s']) <= 9 && Math.abs(m['solar peak s']) <= 9, 'peaks within 9 s, as labelled');
});

test('[eclipses, algorithm] our geometry fed Astronomy Engine\'s own Sun, Moon and shadow constants reproduces its search 1950–2050 (peaks ≤ 2 s, durations ≤ 0.2 min)', () => {
  // AE's conventions (drik-engine.js): Earth shadow sphere 6459 km, Moon 1737.4 km, Sun 695700 km, linear cones; its Moon
  // geometric and its Sun aberrated; the penumbral test on a sphere of 6378.1366 km. Equivalent angular factor 6459/6378.1366.
  const vectorSource = (jdTT) => {
    const time = A.AstroTime.FromTerrestrialTime(jdTT - J2000), rot = A.Rotation_EQJ_EQD(time);
    const s = A.RotateVector(rot, A.GeoVector(A.Body.Sun, time, true)), mo = A.RotateVector(rot, A.GeoMoon(time));
    const ds = Math.hypot(s.x, s.y, s.z), dm = Math.hypot(mo.x, mo.y, mo.z);
    return { sun: [s.x / ds, s.y / ds, s.z / ds], sunDistAU: ds, moon: [mo.x / dm, mo.y / dm, mo.z / dm], moonDistAU: dm };
  };
  const conventions = { name: 'Astronomy Engine', sunRadiusKm: 695700, moonRadiusKm: 1737.4, moonUmbraRadiusKm: 1737.4,
    lunarParallaxFactor: 6459 / 6378.1366, lunarSunParallaxFactor: 6459 / 6378.1366, penumbraEarthSphereKm: 6378.1366 };
  const a = jdOfYear(1950), b = jdOfYear(2050), ours = G.eclipses(a, b, null, { vectorSource, conventions });
  assert.ok(ours.every((r) => r.source === 'referee'), 'rows on another ephemeris are marked referee');
  const L = pair(ours.filter((r) => r.kind === 'lunar'), aeLunar(a, b), (r) => jdOfDate(r.peak.date), 'lunar (AE inputs)');
  const S = pair(ours.filter((r) => r.kind === 'solar'), aeSolar(a, b), (r) => jdOfDate(r.peak.date), 'solar (AE inputs)');
  const m = {};
  for (const [o, r, pj] of L) {
    maxAbs(m, 'lunar peak s', (o.maxJdUT - pj) * 86400); maxAbs(m, 'penumbral min', o.semiDurationMinutes.penumbral - r.sd_penum);
    if (r.sd_partial > 0) maxAbs(m, 'partial min', o.semiDurationMinutes.partial - r.sd_partial);
    if (r.sd_total > 0) maxAbs(m, 'total min', o.semiDurationMinutes.total - r.sd_total);
    assert.equal(o.type, r.kind);
  }
  for (const [o, r, pj] of S) {
    maxAbs(m, 'solar peak s', (o.maxJdUT - pj) * 86400);
    if (o.central) { maxAbs(m, 'lat deg', o.greatest.latitude - r.latitude); maxAbs(m, 'lon deg', w180(o.greatest.longitude - r.longitude)); }
  }
  console.log(`  [eclipses, algorithm] ${L.length} lunar + ${S.length} solar: ${fmt(m, 4)}`);
  for (const k of ['lunar peak s', 'solar peak s']) assert.ok(Math.abs(m[k]) <= 2, `${k} ${m[k]}`);
  for (const k of ['penumbral min', 'partial min', 'total min']) assert.ok(Math.abs(m[k]) <= 0.2, `${k} ${m[k]}`);
  assert.ok(Math.abs(m['lat deg']) <= 0.02 && Math.abs(m['lon deg']) <= 0.05);
  assert.ok(Math.abs(m['lunar peak s']) <= 1 && Math.abs(m['solar peak s']) <= 1, 'within 1 s, as PROVENANCE.eclipsesMeasured says');
});

test('[eclipses, ephemeris B] 2000–2030: the same geometry on VSOP87B + ELP/MPP02 finds the same eclipses; peaks ≤ 3 s, contacts ≤ 6 s, magnitudes ≤ 0.001', () => {
  const unit = (ra, dec) => [Math.cos(dec * DEG) * Math.cos(ra * DEG), Math.cos(dec * DEG) * Math.sin(ra * DEG), Math.sin(dec * DEG)];
  const vectorSource = (jdTT) => {
    const s = M.drigCoordinates('surya', jdTT, { timeScale: 'TT' }), mo = M.drigCoordinates('candra', jdTT, { timeScale: 'TT' });
    return { sun: unit(s.rightAscensionDeg, s.declinationDeg), sunDistAU: s.distanceAU, moon: unit(mo.rightAscensionDeg, mo.declinationDeg), moonDistAU: mo.distanceAU };
  };
  const a = jdOfYear(2000), b = jdOfYear(2030), ours = ST.eclipses(a, b), refB = G.eclipses(a, b, null, { vectorSource });
  assert.equal(ours.length, refB.length);
  const m = {};
  for (let i = 0; i < ours.length; i++) {
    const o = ours[i], r = refB[i], k = o.kind;
    assert.equal(o.kind, r.kind); assert.equal(o.type, r.type, `${k} ${o.maxJdUT}`);
    maxAbs(m, k + ' peak s', (o.maxJdUT - r.maxJdUT) * 86400); maxAbs(m, k + ' magnitude', o.magnitude - r.magnitude);
    for (const c of Object.keys(o.contacts)) if (o.contacts[c] && r.contacts[c]) maxAbs(m, k + ' contacts s', (o.contacts[c].jdUT - r.contacts[c].jdUT) * 86400);
  }
  console.log(`  [eclipses, ephemeris B] ${ours.length} eclipses: ${fmt(m, 5)}`);
  assert.ok(Math.abs(m['lunar peak s']) <= 3 && Math.abs(m['solar peak s']) <= 3);
  assert.ok(Math.abs(m['lunar contacts s']) <= 6 && Math.abs(m['solar contacts s']) <= 6);
  assert.ok(Math.abs(m['lunar magnitude']) <= 1e-3 && Math.abs(m['solar magnitude']) <= 1e-3);
  assert.ok(Math.abs(m['lunar peak s']) <= 0.8 && Math.abs(m['solar peak s']) <= 0.8, 'within 0.8 s, as PROVENANCE.eclipsesMeasured says');
});

test('[eclipses, local] Ujjain 1900–2100 and Boulder 2000–2050 vs Astronomy Engine SearchLocalSolarEclipse: every eclipse it finds is ours and visible; contacts, maximum and obscuration within tolerance', () => {
  const cases = [['Ujjain', 23.1765, 75.7885, 1900, 2100], ['Boulder', 40.015, -105.27, 2000, 2050]];
  for (const [name, lat, lon, y0, y1] of cases) {
    const a = jdOfYear(y0), b = jdOfYear(y1), obs = new A.Observer(lat, lon, 0);
    const rows = G.eclipses(a, b, { latitude: lat, longitude: lon }, { kinds: ['solar'] });
    const seen = rows.filter((r) => r.local.eclipsed);
    const ae = []; let e = A.SearchLocalSolarEclipse(aeTime(a), obs);
    while (aeJd(e.peak.time) <= b) { ae.push(e); e = A.NextLocalSolarEclipse(e.peak.time, obs); }
    const m = {}, used = new Set();
    for (const x of ae) {
      const pj = aeJd(x.peak.time), i = seen.findIndex((o, j) => !used.has(j) && Math.abs(o.local.maxJdUT - pj) < 0.3);
      assert.ok(i >= 0, `${name}: AE's local eclipse at ${pj.toFixed(4)} is missing`);
      used.add(i); const o = seen[i].local;
      assert.equal(o.visible, true, `${name} ${pj}: visible`);
      maxAbs(m, 'maximum s', (o.maxJdUT - pj) * 86400);
      maxAbs(m, 'C1/C4 s', (o.contacts.C1.jdUT - aeJd(x.partial_begin.time)) * 86400); maxAbs(m, 'C1/C4 s', (o.contacts.C4.jdUT - aeJd(x.partial_end.time)) * 86400);
      if (x.total_begin && o.contacts.C2) { maxAbs(m, 'C2/C3 s', (o.contacts.C2.jdUT - aeJd(x.total_begin.time)) * 86400); maxAbs(m, 'C2/C3 s', (o.contacts.C3.jdUT - aeJd(x.total_end.time)) * 86400); }
      maxAbs(m, 'obscuration', o.obscuration - x.obscuration);
      maxAbs(m, 'Sun altitude at maximum deg', o.sunAltitudeDeg.max - x.peak.altitude);
      if (x.kind !== 'partial') assert.equal(o.type, x.kind, `${name} ${pj}`);
    }
    // ours beyond AE's list: the discs overlap only for an observer the Earth hides (the Sun below the horizon)
    const extra = seen.filter((o, j) => !used.has(j));
    for (const o of extra) assert.ok(o.local.sunAltitudeDeg.max < -0.5 && o.local.visible === false, `${name}: extra ${o.local.maxJdUT} at Sun altitude ${o.local.sunAltitudeDeg.max}`);
    console.log(`  [eclipses, local] ${name} ${y0}–${y1}: ${ae.length} found by AE, all ours and visible; ${extra.length} more only below the horizon; ${fmt(m, 4)}`);
    assert.ok(Math.abs(m['maximum s']) <= 15 && Math.abs(m['C1/C4 s']) <= 40 && Math.abs(m.obscuration) <= 0.005, name);
    if ('C2/C3 s' in m) assert.ok(Math.abs(m['C2/C3 s']) <= 10, name);
    assert.ok(Math.abs(m['Sun altitude at maximum deg']) <= 1, 'AE altitude has refraction, ours is geometric');
  }
});

test('[eclipses, contract] rows, sites and refusals as the interface says', () => {
  const r = ST.eclipses(jdOfYear(2026.0), jdOfYear(2027.0), { latitude: 23.1765, longitude: 75.7885 });
  assert.ok(Array.isArray(r) && r.length >= 4);
  for (const e of r) {
    assert.ok(e.kind === 'lunar' || e.kind === 'solar');
    for (const k of ['type', 'maxJdUT', 'contacts', 'magnitude', 'local', 'source', 'sunSiderealDeg', 'moonSiderealDeg']) assert.ok(k in e, k);
    assert.equal(e.source, 'own');
    assert.ok(Math.abs(e.maxJdUT + e.deltaTSeconds / 86400 - e.maxJdTT) < 1e-12);
  }
  // 2026-03-03 total lunar eclipse: the two independent searches agree on its kind
  const tl = r.find((e) => e.kind === 'lunar' && Math.abs(yearOf(e.maxJdUT) - 2026.17) < 0.02);
  assert.equal(tl.type, 'total');
  assert.throws(() => G.eclipses(2461000, 2461100, { latitude: 95, longitude: 0 }), /latitude/);
  assert.throws(() => G.eclipses(2461100, 2461000), /precede/);
  assert.throws(() => G.eclipses(NaN, 2461000), TypeError, "a bad argument is a TypeError, not a refusal");
  assert.match(ST.LABEL.eclipses, /own Sun and Moon/);
  assert.match(G.label, /Explanatory Supplement/);
});

test('[eclipses, the common rows] math-core\'s dṛk rows at Ujjain, 2000–2030: a penumbral eclipse is penumbral with no grāsa, never a negative one; every lunar eclipse and every solar eclipse the site is in, as drik-grahana.js finds them (C4)', () => {
  const site = { latitude: 23.1765, longitude: 75.7885 }, rows = [], raw = [];
  for (let k = 0; k < 3; k++) {
    const a = J2000 + k * 3652.5, b = a + 3652.5;
    rows.push(...M.tierEclipses(a, b, site.latitude, site.longitude, 'drik').list);
    raw.push(...ST.eclipses(a, b, site).filter((e) => e.kind === 'lunar' || e.local.eclipsed));
  }
  const keyOf = (e) => `${e.kind} ${e.maxJdUT.toFixed(6)}`;
  assert.deepEqual(rows.map(keyOf).sort(), raw.map(keyOf).sort(), 'the same eclipses: none lost, none added');
  let pen = 0;
  for (const r of rows) {
    for (const k of M.ECLIPSE_ROW_FIELDS) assert.ok(k in r, k);
    assert.ok(r.grasa === null || r.grasa >= 0, `grāsa ${r.grasa}`);
    if (r.kind === 'lunar') {
      assert.equal(r.penumbral, r.type === 'penumbral');
      if (r.penumbral) { pen++; assert.ok(r.umbralMagnitude < 0); assert.equal(r.magnitude, null); assert.equal(r.grasa, null); assert.equal(r.contacts.sparsha, null); assert.ok(r.penumbralMagnitude > 0); }
      else { assert.ok(r.umbralMagnitude >= 0); assert.equal(r.grasa, r.umbralMagnitude); assert.equal(r.contacts.sparsha, r.contactsDetail.U1.jdUT); }
    } else { assert.equal(r.local.eclipsed, true); assert.equal(r.grasa, r.local.magnitude); assert.equal(r.penumbral, false); }
  }
  console.log(`  [eclipses, rows] 2000–2030 at Ujjain: ${rows.length} rows (${rows.filter((r) => r.kind === 'lunar').length} lunar, ${pen} of them penumbral; ${rows.filter((r) => r.kind === 'solar').length} solar the site is in), no negative grāsa`);
  assert.ok(pen >= 10, `${pen} penumbral eclipses`);
});

test('[browser globals] the four scripts load as plain browser scripts (no require): window.SiddhantaTier and window.DrikGrahana find each other', () => {
  const vm = require('node:vm');
  const ctx = { console }; ctx.globalThis = ctx; ctx.window = ctx; vm.createContext(ctx);
  for (const f of ['math-core.js', 'siddhanta-drik.js', 'siddhanta-tier.js', 'drik-grahana.js']) vm.runInContext(fs.readFileSync(path.join(__dirname, f), 'utf8'), ctx, { filename: f });
  assert.equal(typeof ctx.SiddhantaTier.eclipses, 'function'); assert.equal(typeof ctx.DrikGrahana.eclipses, 'function');
  const r = ctx.SiddhantaTier.eclipses(2461090, 2461110);
  assert.equal(JSON.stringify(r.map((e) => `${e.kind} ${e.type}`)), '["lunar total"]', '2026-03-03');
  assert.equal(r[0].maxJdUT, ST.eclipses(2461090, 2461110)[0].maxJdUT, 'the same number in both hosts');
});

// ── the browser: cost of page-sized calls in Chromium ─────────────────────────────────────────────────────────────
test('[browser cost] Chromium (headless; ×1 and CPU throttling ×4 as a phone proxy): ms per page-sized call', async () => {
  const { chromium } = require('playwright');
  const root = __dirname;
  const page0 = `<!doctype html><meta charset="utf-8"><title>dṛk cost</title>
<script src="math-core.js"></script><script src="siddhanta-drik.js"></script><script src="siddhanta-tier.js"></script><script src="drik-grahana.js"></script>`;
  const server = http.createServer((req, res) => {
    const p = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    if (p === '/__drik_cost__.html') { res.setHeader('Content-Type', 'text/html; charset=utf-8'); res.end(page0); return; }
    const file = path.resolve(root, '.' + p);
    if (!file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
    fs.readFile(file, (err, data) => { if (err) res.writeHead(404).end(); else { res.setHeader('Content-Type', file.endsWith('.js') ? 'text/javascript' : 'application/octet-stream'); res.end(data); } });
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  let browser;
  try {
    browser = await chromium.launch({ headless: true, executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || undefined });
    const page = await browser.newPage();
    const errors = []; page.on('pageerror', (e) => errors.push(e.message));
    await page.route('**/*', (route) => (new URL(route.request().url()).hostname === '127.0.0.1' ? route.continue() : route.abort()));
    await page.goto(`http://127.0.0.1:${server.address().port}/__drik_cost__.html`);
    assert.deepEqual(errors, []);
    const run = () => page.evaluate(() => {
      const ST = window.SiddhantaTier, jd = 2461321.520833, site = { latitude: 23.1765, longitude: 75.7885 };
      const med = (f, n) => { const t = []; for (let i = 0; i < n; i++) { const a = performance.now(); f(i); t.push(performance.now() - a); } t.sort((x, y) => x - y); return +t[n >> 1].toFixed(3); };
      const ECL = [2461103.0, 2461264.7, 2461280.7];   // 2026-03-03 total lunar, 2026-08-12 total solar, 2026-08-28 partial lunar
      ST.grahas(jd); // warm
      return {
        grahas: med((i) => ST.grahas(jd + i * 0.37), 15), grahasNoSpeed: med((i) => ST.grahas(jd + i * 0.37, { speed: false }), 15),
        sunMoon: med((i) => ST.sunMoon(jd + i * 0.37), 30), sun: med((i) => ST.sun(jd + i * 0.37), 30),
        lagna: med((i) => ST.lagna(jd + i * 0.01, 23.18, 75.79), 30),
        sunriseDay: med((i) => ST.riseSet('sun', jd + i, 23.18, 75.79), 7), moonriseDay: med((i) => ST.riseSet('moon', jd + i, 23.18, 75.79), 7),
        lunarMonth: med((i) => ST.lunarMonth(jd + i * 31), 3), table31d: med((i) => ST.table(jd + i * 40, jd + i * 40 + 31), 2),
        eclipses32dSite: med((i) => { if (ST.eclipses(ECL[i] - 16, ECL[i] + 16, site).length < 1) throw new Error('no eclipse'); }, 3),
        sample: ST.grahas(jd)[1].longitude,
      };
    });
    const x1 = await run();
    const cdp = await page.context().newCDPSession(page);
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
    const x4 = await run();
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
    assert.equal(x1.sample, ST.grahas(2461321.520833)[1].longitude, 'the browser computes the same Moon, bit for bit');
    console.log('  [browser cost] ms (median) ×1: ' + Object.entries(x1).filter(([k]) => k !== 'sample').map(([k, v]) => `${k} ${v}`).join(', '));
    console.log('  [browser cost] ms (median) ×4: ' + Object.entries(x4).filter(([k]) => k !== 'sample').map(([k, v]) => `${k} ${v}`).join(', '));
    // generous ceilings (×5 the measured ×1 values on the shared build machine): a regression guard, not a promise
    const CEIL = { grahas: 150, grahasNoSpeed: 100, sunMoon: 30, sun: 10, lagna: 5, sunriseDay: 200, moonriseDay: 400, lunarMonth: 1500, table31d: 2000, eclipses32dSite: 2500 };
    for (const [k, v] of Object.entries(CEIL)) assert.ok(x1[k] <= v, `${k}: ${x1[k]} ms > ${v} ms`);
    assert.deepEqual(errors, []);
  } finally {
    if (browser) await browser.close();
    server.close();
  }
});
