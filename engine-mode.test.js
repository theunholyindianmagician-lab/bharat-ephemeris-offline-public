'use strict';
/* engine-mode.test.js — the tier contract (2026-10-08, owner decisions: three tiers, one code path each).
 *   'ss+parameshvara' (the page default) and 'ss' (alias 'classical'): the text tier through ss-tier.js;
 *   'drik': Modern Bhāratīya (dṛk) through siddhanta-tier.js only; 'calibrated' is retired.
 * The 'classical' fixture was re-derived by scripts/refreeze-text-tier.cjs from the sovereign modules and cross-checked
 * against the independent path (68905b9's arithmetic, ΔT cancelled); the 'modern' block pins the raw drigCoordinates
 * referee and is unchanged. */
const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const M = require(process.env.ENGINE_CORE_PATH || './math-core.js');
const S = require('./sphuta.js');
const G = require('./ss-graha.js');
const fixture = require('./test-fixtures/engine-mode-regressions.json');
const jd = 2461290.7708333335;
const SOVEREIGN = ['kala-dvara.js', 'sphuta.js', 'dhruva.js', 'ss-udaya.js', 'spanda-ganita.js', 'ss-graha.js', 'ss-chaya.js', 'ss-grahana.js',
  'ss-ahargana.js', 'panchanga.js', 'dasha.js', 'muhurta.js', 'utsava.js', 'parampara.js', 'ss-tier.js'];
const read = (f) => fs.readFileSync(path.join(__dirname, f), 'utf8');

test("the text tier ('ss'; 'classical' is its alias) equals the re-derived fixture, which equals the sovereign modules", () => {
  assert.match(fixture.provenance.classicalRepinnedD2, /refreeze-text-tier\.cjs/);
  assert.equal(fixture.classicalPreD2.length, fixture.classical.length, 'the pre-D2 values are kept beside the new ones');
  for (const row of fixture.classical) {
    assert.deepEqual(M.sphutaGrahaModel(row.jd, 'ss').map((g) => g.longitude), row.longitudes);
    assert.deepEqual(M.sphutaGrahaModel(row.jd, 'classical').map((g) => g.longitude), row.longitudes);
    const t = (row.jd - 588465.5) + 75.7885 / 360, p = S.sphutaAtDays(t), q = G.truePlaces(t);
    assert.deepEqual([p.sun, p.moon, q.mars.longitude, q.mercury.longitude, q.jupiter.longitude, q.venus.longitude, q.saturn.longitude, p.rahu, p.ketu], row.longitudes);
  }
});

test('Node and a standalone browser build give the same text tiers; a build without the sovereign modules loads and its first text call names what is missing', () => {
  const scope = { console }; scope.globalThis = scope;
  for (const f of SOVEREIGN) vm.runInNewContext(read(f), scope, { filename: f });
  scope.SSTier.useParampara(scope.Parampara.load({ registry: JSON.parse(read('corpus/parampara/registry.json')), samskara: JSON.parse(read('corpus/parampara/samskara.json')) }));
  for (const f of ['vsop87-full.js', 'elp-moon.js', 'math-core.js']) vm.runInNewContext(read(f), scope, { filename: f });
  for (const mode of ['ss', 'ss+parameshvara']) {
    assert.equal(JSON.stringify(scope.ShunyaMath.canonicalGrahaModel(jd, { mode })), JSON.stringify(M.canonicalGrahaModel(jd, { mode })), mode);
    assert.equal(JSON.stringify(scope.ShunyaMath.panchangAtJd(jd, 5.5, mode)), JSON.stringify(M.panchangAtJd(jd, 5.5, mode)), mode);
  }
  assert.notEqual(M.drigCoordinates('candra', jd).longitude, M.drigCoordinates('surya', jd).longitude);
  // without them: math-core still loads (no load-time dependency), the raw referee API works, the text tier refuses clearly
  const bare = { console }; bare.globalThis = bare;
  for (const f of ['vsop87-full.js', 'elp-moon.js', 'math-core.js']) vm.runInNewContext(read(f), bare, { filename: f });
  assert.equal(bare.ShunyaMath.BIJA_ANCHOR_JD, 2378496.5);
  assert.equal(bare.ShunyaMath.drigCoordinates('surya', jd).longitude, M.drigCoordinates('surya', jd).longitude);
  assert.throws(() => bare.ShunyaMath.canonicalGrahaModel(jd), /ss-tier\.js and the sovereign modules must be loaded before math-core\.js is used/);
  assert.throws(() => bare.ShunyaMath.gregorianToJulianDay('2026-10-08'), /must be loaded before math-core\.js is used/);
});

test('original compact kernel regression values remain pinned at eight epochs', () => {
  for (const epoch of fixture.modern) for (const row of epoch.rows) {
    assert.equal(M.drigCoordinates(row.key, epoch.jd, { planetaryTheory: "compact" }).longitude.toFixed(9), row.longitude);
  }
});

test('TT diagnostic accepts TT directly and does not apply Delta-T twice', () => {
  const tt = M.drigCoordinates('candra', 2451545, { timeScale: 'TT' });
  assert.equal(tt.jdTT, 2451545);
  assert.ok(tt.jdUT < tt.jdTT);
  const ut = M.drigCoordinates('candra', 2451545, { timeScale: 'UT' });
  assert.equal(ut.jdUT, 2451545);
  assert.ok(ut.jdTT > ut.jdUT);
  assert.notEqual(tt.longitude, ut.longitude);
});

test("'calibrated' is retired 2026-10-08 everywhere a tier is taken; the hybrid drigGrahaLongitude is gone", () => {
  const retired = /retired 2026-10-08/;
  assert.equal(M.drigGrahaLongitude, undefined);
  assert.throws(() => M.resolveTier('calibrated'), retired);
  assert.throws(() => M.sphutaGrahaModel(jd, 'calibrated'), retired);
  assert.throws(() => M.canonicalGrahaModel(jd, { mode: 'calibrated' }), retired);
  assert.throws(() => M.panchangAtJd(jd, 5.5, 'calibrated'), retired);
  assert.throws(() => M.panchangExtended(jd, 42.62, 25.39, 2, 'calibrated'), retired);
  assert.throws(() => M.computePlanetaryVelocities(jd, { mode: 'calibrated' }), retired);
  assert.throws(() => M.ayanamshaDeg(jd, 'calibrated'), retired);
  assert.throws(() => M.ayanamshaRateArcsecPerYear(jd, 'calibrated'), retired);
  assert.throws(() => M.coordinateFrameOffsetDeg(jd, 'calibrated'), retired);
  assert.throws(() => M.bhavaModel(jd, 42.62, 25.39, 'calibrated'), retired);
  assert.throws(() => M.siderealAscendantDeg(jd, 42.62, 25.39, 'calibrated'), retired);
  assert.throws(() => M.solarRiseSet(jd, 42.62, 25.39, 2, 'calibrated'), retired);
});

test('the text tiers: pañcāṅga, extended pañcāṅga, bhāva rows and velocities follow the selected tier', () => {
  for (const mode of ['ss', 'ss+parameshvara']) {
    const planets = M.canonicalGrahaModel(jd, { mode });
    const pan = M.panchangAtJd(jd, 2, mode, { latitude: 42.62, longitude: 25.39 });
    const ext = M.panchangExtended(jd, 42.62, 25.39, 2, mode);
    const bhava = M.bhavaModel(jd, 42.62, 25.39, mode);
    const velocities = M.computePlanetaryVelocities(jd, { mode });
    assert.equal(pan.tier, mode); assert.equal(pan.mode, mode);
    assert.equal(pan.surya, planets[0].longitude);
    assert.equal(pan.chandra, planets[1].longitude);
    for (const key of ['surya', 'chandra', 'lunar', 'tithiIndex', 'nakshatraIndex', 'yogaIndex', 'karanaIndex', 'varaIndex', 'masaName']) assert.equal(ext[key], pan[key], key);
    assert.deepEqual(bhava.grahas.map(g => g.longitude), planets.map(g => g.longitude));
    assert.deepEqual(velocities.map(g => g.longitude), planets.map(g => g.longitude));
    assert.equal(bhava.lagna, M.siderealAscendantDeg(jd, 42.62, 25.39, mode));
  }
  // the saṃskāra moves the Moon and the node only (as its record says); the Sun and the planets are the text's
  const a = M.canonicalGrahaModel(jd, { mode: 'ss' }), b = M.canonicalGrahaModel(jd, { mode: 'ss+parameshvara' });
  for (const i of [0, 2, 3, 4, 5, 6]) assert.equal(b[i].longitude, a[i].longitude, a[i].key);
  for (const i of [1, 7, 8]) assert.notEqual(b[i].longitude, a[i].longitude, a[i].key);
});

test('the dṛk tier follows the same contract through siddhanta-tier.js (needs its contract functions: sunMoon, riseSet, lagna, gast, ayanamsha)', () => {
  const planets = M.canonicalGrahaModel(jd, { mode: 'drik' });
  const pan = M.panchangAtJd(jd, 2, 'drik', { latitude: 42.62, longitude: 25.39 });
  const ext = M.panchangExtended(jd, 42.62, 25.39, 2, 'drik');
  const bhava = M.bhavaModel(jd, 42.62, 25.39, 'drik');
  assert.equal(pan.tier, 'drik');
  assert.equal(Math.abs(((pan.chandra - planets[1].longitude + 540) % 360) - 180) < 1e-9, true);
  for (const key of ['tithiIndex', 'nakshatraIndex', 'yogaIndex', 'karanaIndex', 'varaIndex', 'masaName']) assert.equal(ext[key], pan[key], key);
  assert.deepEqual(bhava.grahas.map(g => g.longitude), planets.map(g => g.longitude));
  assert.equal(bhava.lagna, M.siderealAscendantDeg(jd, 42.62, 25.39, 'drik'));
  // the TT option reaches siddhanta-tier.js
  const tt = M.canonicalGrahaModel(jd, { mode: 'drik', timeScale: 'TT' });
  assert.notEqual(tt[1].longitude, planets[1].longitude);
  assert.throws(() => M.canonicalGrahaModel(jd, { mode: 'drik', timeScale: 'TDB' }), /Unknown time scale/);
});

test('yantraState: tier and calendar replace engineMode and ayanamsha; a stored or linked engineMode is migrated (calibrated → drik; classical, the old default every visitor stored, → the page default)', () => {
  const store = new Map();
  const g = globalThis, saved = { localStorage: g.localStorage, location: g.location };
  g.localStorage = { getItem: (k) => (store.has(k) ? store.get(k) : null), setItem: (k, v) => store.set(k, String(v)) };
  try {
    assert.deepEqual(Object.keys(M.YANTRA_STATE_DEFAULTS).sort(), ['applyBija', 'calendar', 'date', 'latitude', 'longitude', 'tier', 'time', 'timezone']);
    assert.equal(M.YANTRA_STATE_DEFAULTS.tier, '');
    assert.equal(M.pageTier(M.YANTRA_STATE_DEFAULTS.tier), 'ss+parameshvara', 'the page default');
    g.location = { search: '?engineMode=calibrated' };
    assert.equal(M.yantraState().get().tier, 'drik');
    store.clear(); g.location = { search: '' };
    // the state the old code stored for every visitor (its defaults, persisted on load) and wrote into every shared link:
    // it records no choice, so the visitor gets the owner's page default, not the plain text (review 2026-10-08)
    store.set(M.YANTRA_STATE_KEY, JSON.stringify({ engineMode: 'classical', ayanamsha: 'effective_49' }));
    const s = M.yantraState().get();
    assert.equal(s.tier, ''); assert.equal(M.pageTier(s.tier), 'ss+parameshvara'); assert.equal(s.engineMode, undefined); assert.equal(s.ayanamsha, undefined);
    store.clear(); g.location = { search: '?date=2026-08-09&engineMode=classical&ayanamsha=effective_49' };
    assert.equal(M.pageTier(M.yantraState().get().tier), 'ss+parameshvara', 'an old shared link opens on the page default');
    store.clear(); g.location = { search: '?engineMode=classical&tier=ss' };
    assert.equal(M.yantraState().get().tier, 'ss', 'an explicit tier wins');
    store.clear(); g.location = { search: '?tier=ss+parameshvara' };               // '+' decodes to a space in a query
    assert.equal(M.pageTier(M.yantraState().get().tier), 'ss+parameshvara');
    store.clear(); g.location = { search: '?tier=ss%2Bparameshvara&calendar=julian' };
    const t = M.yantraState().get();
    assert.equal(M.pageTier(t.tier), 'ss+parameshvara'); assert.equal(t.calendar, 'julian');
    store.clear(); g.location = { search: '?tier=calibrated' };
    M.yantraState().get();
    assert.equal(JSON.parse(store.get(M.YANTRA_STATE_KEY)).tier, '', 'a retired tier is not persisted');
  } finally {
    if (saved.localStorage === undefined) delete g.localStorage; else g.localStorage = saved.localStorage;
    if (saved.location === undefined) delete g.location; else g.location = saved.location;
  }
});

test('invalid tiers and unavailable bodies fail explicitly rather than yielding zeros', () => {
  for (const mode of ['typo', '', null]) {
    assert.throws(() => M.sphutaGrahaModel(jd, { mode }), /Unknown engine mode/);
    assert.throws(() => M.panchangAtJd(jd, 5.5, mode), /Unknown engine mode/);
    assert.throws(() => M.computePlanetaryVelocities(jd, { mode }), /Unknown engine mode/);
  }
  assert.throws(() => M.drigCoordinates('typo', jd), /Unsupported/);
  assert.throws(() => M.drigCoordinates('surya', NaN), /finite/);
  assert.throws(() => M.drigCoordinates('surya', jd, { timeScale: 'TDB' }), /Unknown time scale/);
  assert.throws(() => M.sphutaGrahaModel(jd, { mode: 'drik', applyBija: true }), /cannot be combined/);
});

test('harmonics remain explicit experiments and cannot silently alter default output', () => {
  const normal = M.drigCoordinates('budha', jd);
  const experimental = M.drigCoordinates('budha', jd, { quantumBija: true });
  assert.equal(normal.quantumBijaApplied, false);
  assert.equal(experimental.correctionStatus, 'experimental-unvalidated');
  assert.notEqual(normal.longitude, experimental.longitude);
  assert.equal(M.drigGeoJ2000('budha', jd), normal.longitudeJ2000);
});
