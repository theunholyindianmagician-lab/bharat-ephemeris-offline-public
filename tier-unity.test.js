'use strict';
/* tier-unity.test.js — one implementation per tier (owner decisions of 2026-10-08).
 *
 *   'ss+parameshvara' (the page default) — the Sūrya-Siddhānta with Parameśvara's saṃskāra (ss-tier.js, the record read
 *        through parampara.js);
 *   'ss' ('classical' is its alias) — the plain text: math-core's text path IS the sovereign modules (sphuta.js,
 *        ss-graha.js, panchanga.js, ss-ahargana.js, dasha.js, muhurta.js, utsava.js, ss-chaya.js, ss-grahana.js) through
 *        ss-tier.js, so it must equal them bit for bit;
 *   'drik' — Modern Bhāratīya (dṛk), siddhanta-tier.js only, served 1850.0–2150.0 and refused outside (DK-1).
 *
 * Every equality below is against the sovereign modules called directly at the text's own day count
 * t = jd − 588465.5 + 75.7885/360 (civil days from midnight at Laṅkā, SS 1.45-1.47; no ΔT). The plan's tier-unity list
 * (1)-(12) is covered; the dṛk tier's contract tests need siddhanta-tier.js's contract functions (B2).
 */
const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const M = require('./math-core.js');
const K = require('./kala-dvara.js');
const S = require('./sphuta.js');
const D = require('./dhruva.js');
const G = require('./ss-graha.js');
const P = require('./panchanga.js');
const DA = require('./dasha.js');
const SST = require('./ss-tier.js');
const PA = require('./parampara.js');

const read = (f) => fs.readFileSync(path.join(__dirname, f), 'utf8');
const textDays = (jd) => (jd - 588465.5) + 75.7885 / 360;         // ss-tier.js daysOfJd
const jdOfDays = (t) => (t - 75.7885 / 360) + 588465.5;           // ss-tier.js jdOfDays
const wrap = (d) => ((d % 360) + 540) % 360 - 180;
const UJJAIN = { latitude: 23.1765, longitude: 75.7885 };
const siteOf = (s) => ({ latitude: s.latitude, deshantara: s.longitude - 75.7885 });
const TEXT_TIERS = ['ss', 'ss+parameshvara'];

/** 200 instants over −50,000 … +50,000 years, each at a different time of day (a fixed LCG). */
function instants(n = 200) {
  let x = 20261008;
  const rnd = () => ((x = (x * 1103515245 + 12345) % 2147483648) / 2147483648);
  const out = [];
  for (let i = 0; i < n; i++) out.push(2451545 + (-50000 + 100000 * (i + rnd()) / n - 2000) * 365.2425 + rnd());
  return out;
}
const JDS = instants();

// ── the tiers and their labels ─────────────────────────────────────────────────────────────────────────────────────
test('three tiers, one default: ss+parameshvara is the page default, API parameters default to the plain text', () => {
  assert.deepEqual(Object.keys(M.TIERS), ['ss+parameshvara', 'ss', 'drik']);
  assert.equal(M.DEFAULT_TIER, 'ss+parameshvara');
  assert.deepEqual(Object.values(M.TIERS).filter((t) => t.default).map((t) => t.id), ['ss+parameshvara']);
  assert.equal(M.pageTier(''), 'ss+parameshvara');
  assert.equal(M.pageTier(undefined), 'ss+parameshvara');
  assert.equal(M.pageTier('drik'), 'drik');
  for (const id of Object.keys(M.TIERS)) {
    const T = M.TIERS[id];
    for (const k of ['engine', 'ayanamsha', 'sunrise', 'dayBoundary', 'karanaOrder', 'month', 'samvatsara', 'span', 'provenance']) assert.ok(T[k], `${id}.${k}`);
    assert.ok(T.label && T.labelSa, id);
  }
  assert.equal(M.TIERS['ss+parameshvara'].label, "Sūrya-Siddhānta + Parameśvara's saṃskāra");
  assert.equal(M.TIERS['ss+parameshvara'].labelSa, 'सूर्य-सिद्धान्त + परमेश्वर-संस्कार');
  assert.equal(M.TIERS.drik.label, 'Modern Bhāratīya (dṛk)');
  assert.equal(M.TIERS.drik.labelSa, 'आधुनिक भारतीय (दृक्)');
  assert.deepEqual(M.TIERS.drik.span.years, [1850, 2150]);
  assert.equal(M.TIERS.drik.fallback, null, 'DK-1: refuse, no foreign fallback');
  assert.match(M.TIERS.drik.provenance, /restarted from NASA-JPL DE440s states every 720 days/);
  assert.match(M.TIERS.drik.provenance, /not independence from JPL/);
  assert.match(M.TIERS.drik.provenance, /ΔT after 2027 is a prediction/);
  assert.match(M.TIERS.drik.ayanamsha.name, /Citrā-pakṣa/);
  for (const id of TEXT_TIERS) assert.match(M.TIERS[id].obliquity, /1397 on R = 3438 \(SS 2\.28\)/);
  // aliases; 'calibrated' retired
  const alias = { classical: 'ss', ss: 'ss', 'ss parameshvara': 'ss+parameshvara', 'ss-parameshvara': 'ss+parameshvara', 'ss+parameshvara': 'ss+parameshvara',
    modern: 'drik', 'bharatiya-drik': 'drik', drik: 'drik' };
  for (const [k, v] of Object.entries(alias)) assert.equal(M.resolveTier(k), v, k);
  for (const [k, v] of Object.entries({ ss: 'ss', 'ss+parameshvara': 'ss', classical: 'ss', drik: 'drik' })) assert.equal(M.tierFamily(k), v);
  assert.throws(() => M.resolveTier('calibrated'), /retired 2026-10-08/);
  assert.throws(() => M.resolveTier('lahiri'), /Unknown engine mode/);
  // API parameter defaults stay the plain text (the dṛk design's CRITIC note): a call without a tier is 'ss'
  const jd = 2461321.520833;
  assert.equal(M.panchangAtJd(jd).tier, 'ss');
  assert.deepEqual(M.canonicalGrahaModel(jd).map((r) => r.longitude), M.canonicalGrahaModel(jd, { mode: 'ss' }).map((r) => r.longitude));
});

// ── (1) bit equality: math-core 'ss' ↔ the sovereign modules ──────────────────────────────────────────────────────
test("(1) the plain text tier equals the sovereign modules bit for bit at 200 instants over ±50,000 years", () => {
  const PL = { mangala: 'mars', budha: 'mercury', guru: 'jupiter', shukra: 'venus', shani: 'saturn' };
  const OLD = { mangala: 'mangal', budha: 'budh', guru: 'guru', shukra: 'shukra', shani: 'shani' };
  for (const jd of JDS) {
    const t = textDays(jd), p = S.sphutaAtDays(t), q = G.truePlaces(t), m = G.meanPlaces(t), md = S.madhyama(S.spandasOfDays(t));
    const rows = M.canonicalGrahaModel(jd, { mode: 'ss' });
    const want = { surya: p.sun, candra: p.moon, rahu: p.rahu, ketu: p.ketu };
    for (const [k, en] of Object.entries(PL)) want[k] = q[en].longitude;
    for (const r of rows) assert.equal(r.longitude, want[r.key], `${r.key} at JD ${jd}`);
    for (const [k, en] of Object.entries(PL)) assert.equal(rows.find((r) => r.key === k).latitudeDeg, q[en].latitude / 60, `${k} latitude`);
    assert.equal(rows[1].latitudeDeg, p.moonLatitude);
    assert.equal(M.ayanamshaDeg(jd, 'ss'), S.ayanamshaSS(S.spandasOfDays(t)));
    assert.equal(M.tierAyanamsha(jd, 'ss').deg, S.ayanamshaSS(S.spandasOfDays(t)));
    // the ss*(k, t since J2000) functions: means, mandoccas, nodes and latitudes at the same instant
    const tJ = jd - 2451545, t2 = textDays(tJ + 2451545), md2 = S.madhyama(S.spandasOfDays(t2)), m2 = G.meanPlaces(t2), q2 = G.truePlaces(t2);
    assert.equal(M.ssPlanetMeanAt('surya', tJ), md2.sun);
    assert.equal(M.ssPlanetMeanAt('chandra', tJ), md2.moon);
    assert.equal(M.ssPlanetMeanAt('rahu', tJ), md2.node);
    assert.equal(M.ssMandoccaAt('chandra', tJ), md2.moonApogee);
    assert.equal(M.ssMandoccaAt('surya', tJ), md2.sunApogee);
    for (const [k, en] of Object.entries(PL)) {
      assert.equal(M.ssPlanetMeanAt(OLD[k], tJ), k === 'budha' || k === 'shukra' ? md2.sun : m2[en].mean);
      assert.equal(M.ssMandoccaAt(OLD[k], tJ), m2[en].mandocca);
      assert.equal(M.ssMeanNodeAt(OLD[k], tJ), m2[en].node);
      assert.equal(M.ssSphutaAt(OLD[k], tJ).sphuta, q2[en].longitude);
      assert.equal(M.ssLatitudeAt(OLD[k], tJ).latitude, q2[en].latitude / 60);
      assert.equal(M.ssNodeAt(OLD[k], tJ).sphuta, q2[en].node);
    }
    // meanRawExact: math-core's own BigInt residue (an independent integer path), fed the text's spanda count
    const sp = M.jdToAharganaSpandas(jd);
    assert.equal(sp, S.spandasOfDays(t));
    const served = { surya: md.sun, candra: md.moon, rahu: md.node, mangala: m.mars.mean, budha: m.mercury.sighrocca, guru: m.jupiter.mean, shukra: m.venus.sighrocca, shani: m.saturn.mean };
    for (const [k, v] of Object.entries(served)) assert.ok(Math.abs(wrap(M.meanRawExact(k, sp) - v)) < 1e-12, `meanRawExact ${k} at JD ${jd}`);
    assert.ok(Math.abs(wrap(M.meanRawExact('ketu', sp) - md.node - 180)) < 1e-12);
  }
});

test('(1) pañcāṅga limbs, lagna, madhya-lagna, the civil day, the month and the saṃvatsara are the sovereign ones (200 instants)', () => {
  for (const [i, jd] of JDS.entries()) {
    const site = i % 3 === 0 ? UJJAIN : i % 3 === 1 ? { latitude: 28.6139, longitude: 77.209 } : { latitude: 13.0827, longitude: 80.2707 };
    const t = textDays(jd), st = siteOf(site);
    const L = P.limbsAt(t), pan = M.panchangAtJd(jd, 5.5, 'ss', site);
    assert.deepEqual([pan.tithiIndex, pan.nakshatraIndex, pan.yogaIndex, pan.karanaIndex, pan.nakshatraPada],
      [L.tithi - 1, L.nakshatra - 1, L.yoga - 1, M.karanaIndexSS(L.karana), L.pada], `limbs at JD ${jd}`);
    assert.equal(pan.surya, L.sun); assert.equal(pan.chandra, L.moon);
    assert.equal(pan.ahargana, t);
    const lg = P.lagnaAt(t, st);
    assert.equal(M.siderealAscendantDeg(jd, site.latitude, site.longitude, 'ss'), lg.longitude, `lagna at JD ${jd}`);
    const mer = P.meridianAt(t, st), tm = M.tierMeridian(jd, site.latitude, site.longitude, 'ss');
    assert.equal(tm.ramcDeg, mer.ramcDeg); assert.equal(tm.madhyaLagnaSidereal, mer.madhyaLagna.longitude);
    const d = P.civilDayOf(t, st), td = M.tierDay(jd, site.latitude, site.longitude, 5.5, 'ss');
    assert.equal(td.N, d.N); assert.equal(td.varaIndex, d.vara.index); assert.equal(pan.varaIndex, d.vara.index);
    assert.equal(td.polar, d.polar);
    if (!d.polar) { assert.equal(td.sunriseJd, jdOfDays(d.sunrise)); assert.equal(td.nextSunriseJd, jdOfDays(d.nextSunrise)); }
    const mo = P.lunarMonth(t);
    assert.deepEqual([pan.masa.name, pan.masa.adhika, pan.masa.kshaya], [mo.name, mo.adhika, mo.kshaya], `month at JD ${jd}`);
  }
  for (const jd of JDS.filter((_, i) => i % 5 === 0)) {
    const t = textDays(jd), sv = G.samvatsara(t), ext = M.panchangExtended(jd, UJJAIN.latitude, UJJAIN.longitude, 5.5, 'ss');
    assert.equal(ext.samvatsara.index, sv.prabhavaIndex);
    assert.equal(ext.samvatsara.nameIast, sv.name);
    assert.equal(ext.samvatsaraName, M.SAMVATSARA_NAMES[sv.prabhavaIndex]);
    const y = require('./ss-ahargana.js').lunarYear(t, P);
    assert.equal(ext.kaliYear, y.k); assert.equal(ext.vikramYear, y.k - 3044); assert.equal(ext.shakaYear, y.k - 3179);
    assert.equal(ext.yearStartJd, jdOfDays(y.start));
  }
});

test('(1) the Devanagari saṃvatsara list is the IAST list of ss-graha.js, name for name (Prabhava first)', () => {
  assert.equal(M.SAMVATSARA_NAMES.length, 60);
  assert.equal(G.SAMVATSARA.length, 60);
  const spot = { 0: ['प्रभव', 'Prabhava'], 1: ['विभव', 'Vibhava'], 26: ['विजय', 'Vijaya'], 50: ['पिङ्गल', 'Piṅgala'], 53: ['रौद्र', 'Raudra'], 59: ['क्षय', 'Kṣaya'] };
  for (const [i, [sa, en]] of Object.entries(spot)) {
    assert.equal(M.SAMVATSARA_NAMES[i], sa, `${i}`);
    assert.equal(G.SAMVATSARA[i], en, `${i}`);
  }
});

test('(1) Vimśottarī of the text tier is dasha.js (birth nakṣatra by time, BPHS 46.16; the text\'s solar year)', () => {
  const toJd = (r) => { const spd = 328050000000n, qq = r.num / r.den, rem = r.num % r.den; return jdOfDays(Number(qq / spd) + (Number(qq % spd) + Number(rem) / Number(r.den)) / Number(spd)); };
  for (const jd of JDS.filter((_, i) => i % 10 === 0)) {
    const at = jd + 12345.6, v = M.vimshottariTier(jd, at, 'ss');
    const tb = textDays(jd), cycles = Math.max(1, Math.ceil((at - jd) / (120 * 1577917828 / 4320000)) + 1);
    const d = DA.vimshottari(tb, { balance: 'time', cycles }), chain = DA.chainAt(d, S.spandasOfDays(textDays(at)), 2);
    assert.equal(v.birthState.nakshatraIndex, d.birth.nakshatra - 1);
    assert.equal(v.birthState.lord, DA.LORDS[d.lordAtBirth]);
    assert.equal(v.maha.lord, chain[0].name); assert.equal(v.antara.lord, chain[1].name);
    assert.equal(v.maha.startJd, toJd(chain[0].start)); assert.equal(v.antara.endJd, toJd(chain[1].end));
    assert.ok(v.maha.startJd <= at && at < v.maha.endJd);
    assert.equal(v.year.days, 1577917828 / 4320000);
  }
});

// ── (1b) the default tier: the saṃskāra from the paramparā record, never typed ──────────────────────────────────────
test("the default tier applies Parameśvara's saṃskāra as the paramparā record gives it (parampara.js), to what it names only", () => {
  const rec = PA.load({ registry: JSON.parse(read('corpus/parampara/registry.json')), samskara: JSON.parse(read('corpus/parampara/samskara.json')) }).samskaraParameshvara();
  assert.equal(rec.offered, true);
  const corr = SST.correction('parameshvara');
  const shift = { moon: 0, node: 0, moonApogee: 0 };
  for (const b of rec.corrects) shift[b] = rec[{ moon: 'moonArcmin', node: 'nodeArcmin', moonApogee: 'moonApogeeArcmin' }[b]] / 60;
  assert.deepEqual({ ...corr.shiftDeg }, shift);
  assert.deepEqual([...corr.corrects], rec.corrects);
  assert.equal(M.TIERS['ss+parameshvara'].label, rec.label);
  // no number of the record is typed in math-core.js or ss-tier.js
  for (const f of ['math-core.js', 'ss-tier.js']) {
    const src = read(f);
    for (const k of ['moonArcmin', 'nodeArcmin', 'moonApogeeArcmin', 'epochKali']) if (Number.isFinite(rec[k])) assert.equal(src.includes(String(rec[k])), false, `${f} types ${k} = ${rec[k]}`);
  }
  // the tier's places are exactly samskara.js's model with the record's deltas at its epoch — the code the fit itself uses
  // (README "How Stage B applies it"): an independent path to the same numbers
  const SK = require('./samskara.js');
  const fitModel = SK.model({ 'moon.epoch': rec.moonArcmin, 'node.epoch': rec.nodeArcmin }, { epoch: rec.epochKali });
  for (const jd of JDS.filter((_, i) => i % 10 === 0)) {
    const t = textDays(jd), a = fitModel.places(t), b = SST.places(t, { samskara: 'parameshvara' });
    // equal to the last bit or two (samskara.js reduces the Sun's sum in its own order: ≤ 1 ulp of 360° measured)
    for (const [x, y, k] of [[b.sun, a.sun, 'sun'], [b.moon, a.moon, 'moon'], [b.rahu, a.node, 'node'], [b.moonLatitude, a.latitude / 60, 'latitude']]) {
      assert.ok(Math.abs(wrap(x - y)) < 1e-12, `samskara.js model ${k} at JD ${jd}: ${x} vs ${y}`);
    }
  }
  const mod = (a) => ((a % 360) + 360) % 360;
  for (const jd of JDS.filter((_, i) => i % 4 === 0)) {
    const t = textDays(jd), md = S.madhyama(S.spandasOfDays(t));
    const moonMean = mod(md.moon + shift.moon), apogee = mod(md.moonApogee + shift.moonApogee), node = mod(md.node + shift.node);
    const moon = mod(moonMean + S.mandaPhala(moonMean, apogee, S.PARIDHI.moon).degrees);
    const a = M.canonicalGrahaModel(jd, { mode: 'ss' }), b = M.canonicalGrahaModel(jd, { mode: 'ss+parameshvara' });
    assert.equal(b[1].longitude, moon, `Moon at JD ${jd}`);
    assert.equal(b[7].longitude, node); assert.equal(b[8].longitude, mod(node + 180));
    for (const i of [0, 2, 3, 4, 5, 6]) assert.equal(b[i].longitude, a[i].longitude, `${a[i].key} is the text's`);
    const pan = M.panchangAtJd(jd, 5.5, 'ss+parameshvara', UJJAIN);
    assert.equal(pan.tithiIndex, Math.floor(mod(moon - a[0].longitude) / 12));
    assert.equal(pan.nakshatraIndex, Math.floor(moon / (360 / 27)));
    assert.equal(M.ayanamshaDeg(jd, 'ss+parameshvara'), M.ayanamshaDeg(jd, 'ss'), 'the saṃskāra does not touch the ayanāṃśa');
    assert.equal(M.tierDay(jd, 23.1765, 75.7885, 5.5, 'ss+parameshvara').N, M.tierDay(jd, 23.1765, 75.7885, 5.5, 'ss').N, 'nor the Sun, so nor the day');
  }
});

// ── (2) one frame per tier ────────────────────────────────────────────────────────────────────────────────────────
test("(2) one frame per text tier: the ayanāṃśa shown is the one applied, and the text's ε (SS 2.28) is used everywhere", () => {
  for (const tier of TEXT_TIERS) for (const jd of JDS.filter((_, i) => i % 8 === 0)) {
    const A = M.tierAyanamsha(jd, tier).deg;
    assert.equal(M.coordinateFrameOffsetDeg(jd, tier), A);
    assert.equal(M.ayanamshaDeg(jd, tier), A);
    assert.ok(Math.abs(wrap(M.sayanaAscendantDeg(jd, 23.1765, 75.7885, tier) - M.siderealAscendantDeg(jd, 23.1765, 75.7885, tier) - A)) < 1e-9);
    const b = M.bhavaModel(jd, 23.1765, 75.7885, tier);
    assert.equal(b.lagna, M.siderealAscendantDeg(jd, 23.1765, 75.7885, tier));
    assert.equal(b.madhyaLagna, P.meridianAt(textDays(jd), siteOf(UJJAIN)).madhyaLagna.longitude);
    assert.equal(b.ayanamsha, A);
    const s = M.getSolarCoordinates(jd, tier), m = M.getLunarCoordinates(jd, tier);
    assert.equal(s.obliquityDeg, D.SS_EPSILON_DEG);
    assert.equal(m.obliquityDeg, D.SS_EPSILON_DEG);
    assert.ok(Math.abs(wrap(s.tropical - s.sidereal - A)) < 1e-9);
    assert.ok(Math.abs(wrap(m.tropical - m.sidereal - A)) < 1e-9);
  }
  // SS 2.28: the greatest declination is the arc whose sine is 1397 on R = 3438 (Dhruva's value, by Mādhava's arc)
  assert.ok(Math.abs(D.SS_EPSILON_DEG - Math.asin(1397 / 3438) * 180 / Math.PI) < 1e-4);
  // the 14 adhikāras' valana uses the tier's ε and sāyana Sun
  const jd = 2461266.770833, planets = M.sphutaGrahaModel(jd, 'ss');
  const a14 = M.computeSuryaSiddhanta14Adhikaras(jd, 23.1765, 75.7885, planets, M.siderealAscendantDeg(jd, 23.1765, 75.7885, 'ss'), 5.5, 'ss');
  assert.equal(a14.adhikara6_chedyaka.obliquityDeg, D.SS_EPSILON_DEG);
  assert.ok(Math.abs(wrap(a14.adhikara6_chedyaka.sayanaSun - planets[0].longitude - M.tierAyanamsha(jd, 'ss').deg)) < 1e-9);
});

// ── (3) the retired mode and the named ayanāṃśas ──────────────────────────────────────────────────────────────────
test("(3) 'calibrated' is refused by every tier-taking API, and a named ayanāṃśa by every bridge", () => {
  const jd = 2461321.520833, lat = 23.1765, lon = 75.7885, rows = M.sphutaGrahaModel(jd, 'ss');
  const calls = {
    tierAyanamsha: (x) => M.tierAyanamsha(jd, x), tierGrahaRows: (x) => M.tierGrahaRows(jd, x), panchangAtJd: (x) => M.panchangAtJd(jd, 5.5, x),
    panchangExtended: (x) => M.panchangExtended(jd, lat, lon, 5.5, x), bhavaModel: (x) => M.bhavaModel(jd, lat, lon, x),
    siderealAscendantDeg: (x) => M.siderealAscendantDeg(jd, lat, lon, x), sayanaAscendantDeg: (x) => M.sayanaAscendantDeg(jd, lat, lon, x),
    tierMeridian: (x) => M.tierMeridian(jd, lat, lon, x), coordinateFrameOffsetDeg: (x) => M.coordinateFrameOffsetDeg(jd, x),
    tierDay: (x) => M.tierDay(jd, lat, lon, 5.5, x), solarRiseSet: (x) => M.solarRiseSet(jd, lat, lon, 5.5, x), lunarRiseSet: (x) => M.lunarRiseSet(jd, lat, lon, 5.5, x),
    getSolarCoordinates: (x) => M.getSolarCoordinates(jd, x), getLunarCoordinates: (x) => M.getLunarCoordinates(jd, x),
    computeSpecialLagnas: (x) => M.computeSpecialLagnas(jd, lat, lon, 1, 2, 3, 5.5, x), kalaUpagrahaParts: (x) => M.kalaUpagrahaParts(jd, lat, lon, 5.5, x),
    computeUpagrahas: (x) => M.computeUpagrahas(1, jd, lat, lon, 5.5, x), vimshottariTier: (x) => M.vimshottariTier(jd, jd, x),
    scanAuspiciousMuhurtas: (x) => M.scanAuspiciousMuhurtas(jd, 1, 'business', lat, lon, 5.5, x),
    computeSuryaSiddhanta14Adhikaras: (x) => M.computeSuryaSiddhanta14Adhikaras(jd, lat, lon, rows, 0, 5.5, x),
    computeBirthDoshasAndShanti: (x) => M.computeBirthDoshasAndShanti(jd, lat, lon, 1, 2, 3, 5.5, x),
    sphutaGrahaModel: (x) => M.sphutaGrahaModel(jd, x), computePlanetaryVelocities: (x) => M.computePlanetaryVelocities(jd, { mode: x }),
  };
  // ayanamshaDeg / ayanamshaRateArcsecPerYear take a tier OR a named hypothesis (for labelled comparison rows): only
  // the retired mode is refused there
  assert.throws(() => M.ayanamshaDeg(jd, 'calibrated'), /retired 2026-10-08/);
  assert.throws(() => M.ayanamshaRateArcsecPerYear(jd, 'calibrated'), /retired 2026-10-08/);
  for (const [name, f] of Object.entries(calls)) {
    assert.throws(() => f('calibrated'), /retired 2026-10-08/, name);
    assert.throws(() => f('effective_49'), /bridges take a tier|Unknown engine mode|Unknown ayanāṃśa/, `${name} must not take a named ayanāṃśa`);
  }
  for (const name of ['bhavaModel', 'siderealAscendantDeg', 'sayanaAscendantDeg', 'tierMeridian', 'coordinateFrameOffsetDeg', 'tierDay', 'solarRiseSet',
    'lunarRiseSet', 'getSolarCoordinates', 'getLunarCoordinates', 'computeSpecialLagnas', 'kalaUpagrahaParts', 'computeUpagrahas', 'panchangExtended',
    'computeSuryaSiddhanta14Adhikaras']) {
    assert.throws(() => calls[name]('spica_lahiri'), /bridges take a tier: ss\+parameshvara, ss or drik/, name);
  }
  assert.equal(M.drigGrahaLongitude, undefined);
});

// ── (4) the dṛk tier's span ───────────────────────────────────────────────────────────────────────────────────────
const OUTSIDE = [2396000.5 /* 1847 */, 2506700.5 /* 2151 */, 2378496.5 /* 1800 */, 2524593.5 /* 2200 */, -16541065.5, 19983549.5, 0];
test('(4) the dṛk tier refuses outside 1850.0–2150.0 with TIER_OUT_OF_SPAN on every entry, and the raw referee API stays ungated', () => {
  const lat = 23.1765, lon = 75.7885;
  for (const jd of OUTSIDE) {
    assert.equal(M.tierInSpan(jd, 'drik'), false, `JD ${jd}`);
    assert.equal(M.tierInSpan(jd, 'ss'), true);
    const rows = M.sphutaGrahaModel(jd, 'ss');
    const entries = [() => M.tierGrahaRows(jd, 'drik'), () => M.canonicalGrahaModel(jd, { mode: 'drik' }), () => M.tierAyanamsha(jd, 'drik'),
      () => M.panchangAtJd(jd, 5.5, 'drik', UJJAIN), () => M.panchangExtended(jd, lat, lon, 5.5, 'drik'), () => M.bhavaModel(jd, lat, lon, 'drik'),
      () => M.siderealAscendantDeg(jd, lat, lon, 'drik'), () => M.tierMeridian(jd, lat, lon, 'drik'), () => M.tierDay(jd, lat, lon, 5.5, 'drik'),
      () => M.solarRiseSet(jd, lat, lon, 5.5, 'drik'), () => M.lunarRiseSet(jd, lat, lon, 5.5, 'drik'), () => M.getSolarCoordinates(jd, 'drik'),
      () => M.getLunarCoordinates(jd, 'drik'), () => M.vimshottariTier(jd, jd, 'drik'), () => M.computePlanetaryVelocities(jd, { mode: 'drik' }),
      () => M.computeSuryaSiddhanta14Adhikaras(jd, lat, lon, rows, 0, 5.5, 'drik'), () => M.ayanamshaDeg(jd, 'drik')];
    for (const [i, f] of entries.entries()) {
      assert.throws(f, (e) => e && e.code === 'TIER_OUT_OF_SPAN' && e.tier === 'drik' && e.span[0] === 1850 && e.span[1] === 2150 && e instanceof RangeError && /no foreign fallback/.test(e.message),
        `entry ${i} at JD ${jd} must refuse`);
    }
  }
  // the raw referee API (drigCoordinates) is a test referee, ungated, and is not a tier
  for (const jd of [2378496.5, 2524593.5]) assert.ok(Number.isFinite(M.drigCoordinates('candra', jd).longitude));
  // the overlay's dṛk column is null outside the span (not a foreign value)
  const k = M.keralaDrikSphuta(2378496.5);
  assert.equal(k.surya.drik, null); assert.equal(k.surya.deltaVsDrikArcmin, null);
});

test("(4) the dṛk path calls only siddhanta-tier.js: no VSOP87, ELP, Astronomy Engine, IAU-1980 or linear-Lahiri code in its functions", () => {
  const src = read('math-core.js');
  const bodyOf = (name) => {
    const at = src.indexOf(`  function ${name}(`);
    assert.ok(at >= 0, `function ${name} not found`);
    const end = src.indexOf('\n  }\n', at);
    return src.slice(at, end).replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, '').replace(/"(?:[^"\\]|\\.)*"|`(?:[^`\\]|\\.)*`/g, '""');
  };
  const FOREIGN = /drigCoordinates|drigGeoJ2000|\bAstronomy\b|DrikTier|drik-engine|vsop|elp|meanObliquityDeg|localSiderealTimeDeg|tropicalAscendantDeg|tropicalMidheavenDeg|observedDeltaTSeconds|calculateDeltaT|AYANAMSHA_MODES|SiddhantaDrik/i;
  for (const name of ['tierAyanamsha', 'siderealAscendantDeg', 'sayanaAscendantDeg', 'tierMeridian', 'drikRows', 'tierGrahaRows', 'sphutaGrahaModel', 'drikSunMoon', 'drikSun',
    'drikRiseSet', 'skyCrossing', 'skyNewMoonBefore', 'skySankrantisBetween', 'skyLunarMonth', 'skyYear', 'skyNakshatraSpan', 'tierDay', 'panchangAtJd', 'drikTrueObliquityDeg',
    'getSolarCoordinates', 'solarRiseSet', 'getLunarCoordinates', 'lunarRiseSet', 'tierAbhijit', 'tierYear', 'panchangExtended', 'bhavaModel', 'vimshottariTier',
    'limbsFromSphuta', 'computePlanetaryVelocities']) {
    assert.equal(FOREIGN.test(bodyOf(name)), false, `${name} reaches a foreign theory: ${(bodyOf(name).match(FOREIGN) || [])[0]}`);
  }
});

test('(4) inside the span the dṛk tier serves its own values (needs siddhanta-tier.js\'s contract: grahas, sun, sunMoon, ayanamsha, gast, lagna, riseSet, eclipses)', () => {
  const jd = 2461321.520833, lat = 23.1765, lon = 75.7885;
  assert.equal(M.tierInSpan(jd, 'drik'), true);
  const SD = require('./siddhanta-tier.js');
  for (const f of ['inSpan', 'grahas', 'sun', 'sunMoon', 'ayanamsha', 'gast', 'lagna', 'riseSet', 'eclipses']) assert.equal(typeof SD[f], 'function', `SiddhantaTier.${f}`);
  const rows = M.tierGrahaRows(jd, 'drik'), g = SD.grahas(jd);
  const own = Array.isArray(g) ? Object.fromEntries(g.map((r) => [r.key, r.longitude])) : g;
  for (const r of rows) { assert.ok(own[r.key] >= 0 && own[r.key] < 360); assert.equal(r.longitude, own[r.key], r.key); assert.equal(r.source, 'own'); }
  const a = M.tierAyanamsha(jd, 'drik');
  assert.equal(a.deg, SD.ayanamsha(jd).deg);
  assert.equal(M.coordinateFrameOffsetDeg(jd, 'drik'), a.deg);
  assert.ok(Math.abs(wrap(M.sayanaAscendantDeg(jd, lat, lon, 'drik') - M.siderealAscendantDeg(jd, lat, lon, 'drik') - a.deg)) < 1e-9);
  assert.equal(M.siderealAscendantDeg(jd, lat, lon, 'drik'), SD.lagna(jd, lat, lon).asc);
  const pan = M.panchangAtJd(jd, 5.5, 'drik', UJJAIN), sm = SD.sunMoon(jd);
  assert.equal(pan.tithiIndex, Math.floor(sm.elongation / 12));
  assert.match(pan.karanaOrder, /common order/);
  const ext = M.panchangExtended(jd, lat, lon, 5.5, 'drik');
  assert.equal(ext.yearStartRule, M.TIERS.drik.yearStart);
  assert.ok(ext.samvatsara.rule.includes('unverified convention'));
  const day = M.tierDay(jd, lat, lon, 5.5, 'drik');
  assert.ok(day.sunriseJd < jd && jd < day.nextSunriseJd);
  assert.equal(M.lunarRiseSet(M.gregorianToJulianDay('2026-10-08', '00:00:00', 5.5), lat, lon, 5.5, 'drik').horizonAltitudeDeg, 7 / 60);
  const s = M.getSolarCoordinates(jd, 'drik');
  assert.ok(Math.abs(s.obliquityDeg - 23.4381) < 0.001, `true obliquity ${s.obliquityDeg}`);
  // the Sūrya-grahaṇa adhikāra is the site's in both families (review 2026-10-08): the annular eclipse of 2026-02-17
  // (Antarctica) is not Ujjain's; the total eclipse of 2026-08-12 is — the site is in its penumbra, below the horizon,
  // as the text tier also lists an eclipse the site is in whether or not it is seen (seenAtSite)
  const solarAt = (iso) => { const j = M.gregorianToJulianDay(iso, '12:00:00', 5.5);
    return M.computeSuryaSiddhanta14Adhikaras(j, lat, lon, M.canonicalGrahaModel(j, { mode: 'drik' }), 0, 5.5, 'drik').adhikara5_surya_grahana; };
  const feb = solarAt('2026-02-17'), aug = solarAt('2026-08-12');
  assert.equal(feb.isSolarEclipsePossible, false); assert.deepEqual(feb.eclipses.list, []);
  assert.equal(aug.isSolarEclipsePossible, true); assert.ok(aug.eclipses.list.every((e) => e.local && e.local.eclipsed === true));
});

test('(4) the EDGE RULE: a month or year that needs an instant outside 1850.0–2150.0 is refused as a block, never filled from elsewhere (needs siddhanta-tier.js\'s contract)', () => {
  // the span's edges in UT, by bisection on the tier's own inSpan
  const edge = (lo, hi, inside) => { for (let i = 0; i < 60; i++) { const m = (lo + hi) / 2; (M.tierInSpan(m, 'drik') === inside ? (hi = m) : (lo = m)); } return hi; };
  const first = edge(2396700, 2396800, true), last = edge(2506300, 2506400, false);
  assert.equal(M.tierInSpan(first + 1e-6, 'drik'), true); assert.equal(M.tierInSpan(first - 1e-6, 'drik'), false);
  // ten days in: the day and the limbs are served, the month (begun in 1849) and the year (begun in 1849) are refused
  const early = M.panchangExtended(first + 10.6, 23.1765, 75.7885, 5.5, 'drik');
  assert.ok(Number.isInteger(early.tithiIndex) && early.varaName);
  assert.equal(early.masa.refused, true); assert.equal(early.masaName, null); assert.equal(early.masa.code, 'TIER_OUT_OF_SPAN');
  assert.equal(early.vikramYear, null); assert.equal(early.samvatsaraName, null); assert.match(early.yearRefused, /outside it and is refused/);
  assert.throws(() => M.generateSankalpaText(early), /is missing/, 'no saṅkalpa from a refused block');
  // the first year that starts inside the span (its nija Caitra new moon of 1850-03-14) is the tier's own from that
  // start, before its Meṣa saṅkrānti too: it needs no instant of 1849 (review 2026-10-08: it was refused until 1850-04-12)
  const firstYear = M.panchangExtended(M.gregorianToJulianDay('1850-03-20', '12:00:00', 5.5), 23.1765, 75.7885, 5.5, 'drik');
  assert.equal(firstYear.yearRefused, null); assert.equal(firstYear.vikramYear, 1907); assert.equal(firstYear.masa.name, 'Caitra');
  assert.ok(M.tierInSpan(firstYear.yearStartJd, 'drik') && firstYear.yearStartJd <= firstYear.jd && firstYear.jd < firstYear.yearEndJd);
  assert.equal(M.panchangExtended(M.gregorianToJulianDay('1850-04-20', '12:00:00', 5.5), 23.1765, 75.7885, 5.5, 'drik').yearStartJd, firstYear.yearStartJd);
  // the refusal names a year outside the span, never one rounded onto its edge
  try { M.tierGrahaRows(first - 1e-4, 'drik'); assert.fail('must refuse'); }
  catch (e) { assert.equal(e.code, 'TIER_OUT_OF_SPAN'); const y = Number(/year (-?[\d.]+) is outside/.exec(e.message)[1]); assert.ok(y < 1850, e.message); }
  // the year that starts in 2149 keeps its number and start; its end (after 2150.0) is refused
  const late = M.panchangExtended(last - 20.4, 23.1765, 75.7885, 5.5, 'drik');
  assert.equal(late.vikramYear, 2206); assert.equal(late.yearEndJd, null); assert.match(late.yearEndRefused, /EDGE RULE/);
  // the day whose next sunrise is after 2150.0 is refused whole
  assert.throws(() => M.panchangAtJd(last - 0.6, 5.5, 'drik', UJJAIN), (e) => e.code === 'TIER_OUT_OF_SPAN');
});

// ── Stage C, C4 (2026-10-09) ──────────────────────────────────────────────────────────────────────────────────────
test("(e) the saṃskāra tier's eclipses use samskara.js's model built from what the record corrects, as its places do (C4)", () => {
  const SK = require('./samskara.js');
  const corr = SST.correction('parameshvara'), deltas = SST.samskaraDeltas({ samskara: 'parameshvara' });
  assert.deepEqual(Object.keys(deltas), corr.corrects.map((b) => `${b}.epoch`));
  for (const b of corr.corrects) assert.equal(deltas[`${b}.epoch`], corr.shiftArcmin[b]);
  assert.equal(SST.samskaraDeltas({ samskara: null }), null);
  const model = SK.model(deltas, { epoch: corr.epochKali });
  for (const jd of JDS.filter((_, i) => i % 10 === 0)) {
    const t = textDays(jd), a = model.places(t), b = SST.places(t, { samskara: 'parameshvara' });
    for (const [x, y, k] of [[b.sun, a.sun, 'sun'], [b.moon, a.moon, 'moon'], [b.rahu, a.node, 'node'], [b.moonLatitude, a.latitude / 60, 'latitude']]) {
      assert.ok(Math.abs(wrap(x - y)) < 1e-12, `${k} at JD ${jd}: ${x} vs ${y}`);
    }
  }
  // A synthetic record (this test's only) that also corrects the Moon's apogee: the eclipses move with the places. The
  // lunar eclipse's middle (Samskara.lunarEclipse on the model) is the tier's own full moon (panchanga.js on the tier's
  // places) — with the fixed moon/node keys of the old code it was not.
  const real = PA.load({ registry: JSON.parse(read('corpus/parampara/registry.json')), samskara: JSON.parse(read('corpus/parampara/samskara.json')) });
  const rec = real.samskaraParameshvara(), jd = 2461280.65;                         // the lunar eclipse of 2026-08-28
  const middleAndFullMoon = () => {
    const E = SST.eclipsesNear(jd, UJJAIN, 16, { samskara: 'parameshvara' }).find((e) => e.kind === 'lunar');
    return { middle: E.middle, full: SST.calendar({ samskara: 'parameshvara' }).syzygyNear(E.middle - 2, 180, +1) };
  };
  const own = middleAndFullMoon();
  let moved;
  try {
    SST.useParampara({ samskaraParameshvara: () => ({ ...rec, corrects: [...rec.corrects, 'moonApogee'], moonApogeeArcmin: 30 }) });
    assert.equal(SST.samskaraDeltas({ samskara: 'parameshvara' })['moonApogee.epoch'], 30);
    moved = middleAndFullMoon();
  } finally { SST.useParampara(real); }
  assert.ok(Math.abs(own.middle - own.full) * 86400 < 1, `the record's own: middle ${own.middle} vs full moon ${own.full}`);
  assert.ok(Math.abs(moved.middle - moved.full) * 86400 < 1, `with the apogee: middle ${moved.middle} vs full moon ${moved.full}`);
  assert.ok(Math.abs(moved.middle - own.middle) * 86400 > 60, 'the apogee moved the eclipse');
  assert.deepEqual(middleAndFullMoon(), own, 'the record is restored');
});

test('(4) the EDGE RULE for the eclipse block: within about 17 days of a dṛk span edge the 14 adhikāras refuse the eclipses alone, named, and serve the rest (C4)', () => {
  const lat = 23.1765, lon = 75.7885;
  const [first, last] = require('./siddhanta-tier.js').spanJdUT();
  const a14 = (jd) => M.computeSuryaSiddhanta14Adhikaras(jd, lat, lon, M.canonicalGrahaModel(jd, { mode: 'drik' }), M.siderealAscendantDeg(jd, lat, lon, 'drik'), 5.5, 'drik');
  for (const jd of [first + 5.6, first + 16.4, last - 5.6, last - 16.5]) {
    const a = a14(jd), e4 = a.adhikara4_chandra_grahana, e5 = a.adhikara5_surya_grahana;
    for (const e of [e4.eclipses, e5.eclipses]) {
      assert.equal(e.refused, true); assert.equal(e.list, null);
      assert.match(e.refusal, /EDGE RULE/); assert.match(e.refusal, /is outside it and is refused/); assert.equal(e.error, null);
      const y = Number(/year (-?[\d.]+) is outside/.exec(e.refusal)[1]);
      assert.ok(jd < first + 100 ? y < 1850 : y > 2150, `the year named is outside, beyond the nearer edge: ${e.refusal}`);
    }
    assert.equal(e4.isLunarEclipsePossible, null); assert.equal(e4.lunarGrasa, null); assert.equal(e4.lunarPenumbralOnly, null); assert.equal(e5.isSolarEclipsePossible, null);
    // every other adhikāra is served
    assert.equal(a.tier, 'drik');
    assert.ok(Number.isFinite(a.adhikara1_madhyama.ahargana) && Number.isFinite(a.adhikara3_triprashna.altDeg) && Number.isFinite(a.adhikara6_chedyaka.sayanaSun));
    assert.equal(a.adhikara2_spashta.vels.length, 9); assert.ok(Number.isFinite(e4.eclipses.nearestNodeDeg));
    assert.equal(a.adhikara14_manadhyaya.nineManas.length, 9);
  }
  for (const jd of [first + 18.2, last - 18.2]) {
    const e4 = a14(jd).adhikara4_chandra_grahana;
    assert.equal(e4.eclipses.refused, false); assert.equal(e4.eclipses.refusal, null);
    assert.ok(Array.isArray(e4.eclipses.list)); assert.equal(typeof e4.isLunarEclipsePossible, 'boolean');
  }
  // tierEclipses: a window across an edge is the EDGE RULE's block refusal; a window wholly outside the plain refusal
  assert.throws(() => M.tierEclipses(first - 3, first + 30, lat, lon, 'drik'), (e) => e.code === 'TIER_OUT_OF_SPAN' && e.edgeRule === true && e.block === 'eclipses');
  assert.throws(() => M.tierEclipses(last - 30, last - 0.3, lat, lon, 'drik'), (e) => e.code === 'TIER_OUT_OF_SPAN' && e.edgeRule === true);
  assert.throws(() => M.tierEclipses(first - 300, first - 200, lat, lon, 'drik'), (e) => e.code === 'TIER_OUT_OF_SPAN' && e.edgeRule === undefined);
  // the text tiers have no such edge
  assert.ok(Array.isArray(M.tierEclipses(first - 16, first + 16, lat, lon, 'ss').list));
});

test('(4) a non-finite instant is an argument error on every dṛk entry, never the out-of-span refusal (siddhanta-tier.js throws TypeError; C4)', () => {
  const lat = 23.1765, lon = 75.7885, rows = M.sphutaGrahaModel(2461321.5, 'drik');
  const SD = require('./siddhanta-tier.js');
  for (const jd of [NaN, Infinity, -Infinity]) {
    const entries = [() => M.tierGrahaRows(jd, 'drik'), () => M.canonicalGrahaModel(jd, { mode: 'drik' }), () => M.tierAyanamsha(jd, 'drik'),
      () => M.panchangAtJd(jd, 5.5, 'drik', UJJAIN), () => M.panchangExtended(jd, lat, lon, 5.5, 'drik'), () => M.bhavaModel(jd, lat, lon, 'drik'),
      () => M.siderealAscendantDeg(jd, lat, lon, 'drik'), () => M.tierMeridian(jd, lat, lon, 'drik'), () => M.tierDay(jd, lat, lon, 5.5, 'drik'),
      () => M.solarRiseSet(jd, lat, lon, 5.5, 'drik'), () => M.lunarRiseSet(jd, lat, lon, 5.5, 'drik'), () => M.getSolarCoordinates(jd, 'drik'),
      () => M.getLunarCoordinates(jd, 'drik'), () => M.vimshottariTier(jd, jd, 'drik'), () => M.computePlanetaryVelocities(jd, { mode: 'drik' }),
      () => M.computeSuryaSiddhanta14Adhikaras(jd, lat, lon, rows, 0, 5.5, 'drik'), () => M.ayanamshaDeg(jd, 'drik'), () => M.tierEclipses(jd, 2461321.5, lat, lon, 'drik'),
      () => M.tierInSpan(jd, 'drik')];
    for (const [i, f] of entries.entries()) assert.throws(f, (e) => e && e.code !== 'TIER_OUT_OF_SPAN', `entry ${i} at ${jd} must be an argument error`);
    assert.throws(() => SD.inSpan(jd), TypeError); assert.throws(() => SD.grahas(jd), TypeError);
  }
  assert.throws(() => SD.grahas('2461321.5'), TypeError, 'a numeric string is not a Julian day');
});

// ── (5) ss-tier.js passes the sovereign gate's rules ──────────────────────────────────────────────────────────────
test('(5) ss-tier.js is gate-clean: requires only sovereign files (and the paramparā record), no library trigonometry, no forbidden name', () => {
  const FORBIDDEN = /\b(?:DE4\d\d|VSOP\d*|ELP\d*|Swiss|swisseph|Gaia|IERS|DrikTier)\b|finals\.all|DeltaT|astronomy-engine/;
  assert.equal(read('kala-dvara.test.js').match(/const FORBIDDEN = \/(.+)\/;/)[1], FORBIDDEN.source, "the gate's own list, no more and no fewer");
  const src = read('ss-tier.js');
  assert.equal(FORBIDDEN.test(src), false);
  assert.equal(FORBIDDEN.test(read('corpus/parampara/samskara.json')), false);
  assert.equal((src.match(/Math\.(?:sin|cos|tan|asin|acos|atan2|atan)\b/g) || []).length, 0);
  const SOVEREIGN = ['kala-dvara.js', 'sphuta.js', 'dhruva.js', 'ss-udaya.js', 'ss-graha.js', 'ss-chaya.js', 'ss-grahana.js', 'ss-ahargana.js', 'panchanga.js',
    'dasha.js', 'muhurta.js', 'utsava.js', 'parampara.js', 'samskara.js', 'corpus/parampara/registry.json', 'corpus/parampara/samskara.json'];
  const gate = read('kala-dvara.test.js');
  for (const f of SOVEREIGN.filter((x) => x.endsWith('.js'))) assert.ok(gate.includes(`'${f}'`), `${f} is in the gate's list`);
  const reqs = [...src.matchAll(/\brequire\s*\(\s*["']([^"']+)["']\s*\)/g)].map((m) => m[1].replace(/^\.\//, ''));
  assert.ok(reqs.length >= 12);
  for (const r of reqs) assert.ok(SOVEREIGN.includes(r), `ss-tier.js requires ${r}`);
  assert.equal(/\brequire\s*\(\s*[^"'\s)]/.test(src), false, 'no computed require');
  assert.equal(/\bimport\s*\(|\bfetch\s*\(|XMLHttpRequest|\bWebSocket\b/.test(src), false, 'reaches nothing outside');
});

// ── (6) deep time: every text-tier entry is finite and terminates ─────────────────────────────────────────────────
test('(6) the text tiers serve every 1,000 years from −50,000 to +50,000 (and the heavier panels every 5,000)', () => {
  const lat = 23.1765, lon = 75.7885;
  const finite = (x, what) => assert.ok(Number.isFinite(x), what);
  for (let y = -50000; y <= 50000; y += 1000) {
    const jd = M.civilToJd({ calendar: 'gregorian', year: y, month: 6, day: 15 }, '09:30:00', 5.5);
    for (const tier of TEXT_TIERS) {
      const rows = M.canonicalGrahaModel(jd, { mode: tier });
      rows.forEach((r) => finite(r.longitude, `${tier} ${r.key} at ${y}`));
      const ext = M.panchangExtended(jd, lat, lon, 5.5, tier);
      for (const k of ['surya', 'chandra', 'lagna', 'kaliYear', 'vikramYear', 'samvatsaraIndex', 'ishtaGhati']) finite(ext[k], `${tier} ${k} at ${y}`);
      assert.ok(ext.masaName && ext.varaName);
      assert.equal(M.jdToCivil(jd, 5.5).year, y); assert.equal(ext.isoDate, M.jdToCivil(jd, 5.5).iso);
      const b = M.bhavaModel(jd, lat, lon, tier); b.madhyas.slice(1).forEach((x) => finite(x, 'madhya'));
      const d = M.tierDay(jd, lat, lon, 5.5, tier); finite(d.sunriseJd, 'sunrise'); assert.ok(d.sunriseJd <= jd && jd < d.nextSunriseJd);
      finite(M.tierMeridian(jd, lat, lon, tier).madhyaLagnaSidereal, 'meridian');
      const v = M.vimshottariTier(jd, jd + 3652.5, tier); assert.ok(v.maha && v.antara);
      const scan = M.scanAuspiciousMuhurtas(jd, 3, 'business', lat, lon, 5.5, tier); assert.ok(Array.isArray(scan));
    }
  }
  for (let y = -50000; y <= 50000; y += 5000) {
    const jd = M.civilToJd({ calendar: 'gregorian', year: y, month: 3, day: 1 }, '14:00:00', 5.5);
    for (const tier of TEXT_TIERS) {
      const rows = M.sphutaGrahaModel(jd, tier), asc = M.siderealAscendantDeg(jd, lat, lon, tier);
      const a14 = M.computeSuryaSiddhanta14Adhikaras(jd, lat, lon, rows, asc, 5.5, tier);
      finite(a14.adhikara1_madhyama.ahargana, 'ahargana'); assert.equal(a14.adhikara4_chandra_grahana.eclipses.error, null, `eclipses at ${y}`);
      const sl = M.computeSpecialLagnas(jd, lat, lon, rows[0].longitude, rows[1].longitude, asc, 5.5, tier); finite(sl.ghatiLagna.deg, 'ghati lagna');
      const up = M.computeUpagrahas(rows[0].longitude, jd, lat, lon, 5.5, tier); finite(up.gulika.deg, 'gulika');
      const mr = M.lunarRiseSet(jd - 0.4, lat, lon, 5.5, tier); assert.ok(mr.jdRise === null || Number.isFinite(mr.jdRise));
      const k = M.keralaDrikSphuta(jd); assert.equal(k.surya.drik, null);
    }
  }
});

// ── (7) the same numbers in a browser-like build ──────────────────────────────────────────────────────────────────
test('(7) two fresh browser-like contexts give the same text tiers, as Node does', () => {
  // the saṃskāra tier's eclipses need samskara.js and the modules it reads (parahita-madhyama, katapayadi, ss-drishya, vedha-lekha)
  const FILES = ['katapayadi.js', 'kala-dvara.js', 'parahita-madhyama.js', 'sphuta.js', 'dhruva.js', 'ss-udaya.js', 'spanda-ganita.js', 'ss-graha.js', 'ss-chaya.js',
    'ss-grahana.js', 'ss-drishya.js', 'vedha-lekha.js', 'ss-ahargana.js', 'panchanga.js', 'dasha.js', 'muhurta.js', 'utsava.js', 'parampara.js', 'samskara.js', 'ss-tier.js',
    'vsop87-full.js', 'elp-moon.js', 'math-core.js'];
  const build = () => {
    const scope = { console }; scope.globalThis = scope;
    for (const f of FILES) {
      vm.runInNewContext(read(f), scope, { filename: f });
      if (f === 'ss-tier.js') scope.SSTier.useParampara(scope.Parampara.load({ registry: JSON.parse(read('corpus/parampara/registry.json')), samskara: JSON.parse(read('corpus/parampara/samskara.json')) }));
    }
    return scope.ShunyaMath;
  };
  const A = build(), B = build();
  for (const jd of [2461321.520833, -16000000.25, 19000000.75]) for (const tier of TEXT_TIERS) {
    const a = JSON.stringify(A.panchangExtended(jd, 23.1765, 75.7885, 5.5, tier)), b = JSON.stringify(B.panchangExtended(jd, 23.1765, 75.7885, 5.5, tier));
    assert.equal(a, b, `${tier} at ${jd}`);
    assert.equal(a, JSON.stringify(M.panchangExtended(jd, 23.1765, 75.7885, 5.5, tier)), `${tier} at ${jd}: node`);
  }
});

// ── (8)-(12) the day, the scan, the lagnas, the site, the month ───────────────────────────────────────────────────
test('(8) the muhūrta scan: any start within one civil date gives the same rows; each day has its own Abhijit (both text tiers, near and far)', () => {
  for (const tier of TEXT_TIERS) for (const date of ['2026-08-14', '-30000-04-01']) {
    const a = M.scanAuspiciousMuhurtas(M.gregorianToJulianDay(date, '00:00:01', 5.5), 12, 'business', 23.1765, 75.7885, 5.5, tier);
    const b = M.scanAuspiciousMuhurtas(M.gregorianToJulianDay(date, '23:59:00', 5.5), 12, 'business', 23.1765, 75.7885, 5.5, tier);
    assert.deepEqual(a, b, `${tier} ${date}`);
    assert.equal(new Set(a.map((w) => w.abhijit.startJd)).size, a.length);
    for (const w of a) {
      const N = M.tierDay(w.jd + 1e-6, 23.1765, 75.7885, 5.5, tier).N;
      const mu = SST.muhurtas(N, UJJAIN, { samskara: M.TIERS[tier].samskara });
      assert.deepEqual([w.abhijit.startJd, w.abhijit.endJd], [mu.abhijit.startJd, mu.abhijit.endJd]);
    }
  }
});

test('(9) the special lagnas move when the sunrise moves (two latitudes)', () => {
  const jd = M.gregorianToJulianDay('2026-06-21', '10:00:00', 5.5);
  for (const tier of TEXT_TIERS) {
    const a = M.computeSpecialLagnas(jd, 10, 75.7885, 66, 200, 120, 5.5, tier), b = M.computeSpecialLagnas(jd, 30, 75.7885, 66, 200, 120, 5.5, tier);
    assert.ok(a.sunriseJd > b.sunriseJd, 'the summer sunrise is earlier at 30° N');
    assert.ok(b.ishtaGhati > a.ishtaGhati);
    assert.notEqual(a.horaLagna.deg, b.horaLagna.deg);
    assert.equal(a.ishtaGhati, (jd - a.sunriseJd) * 60);
  }
});

test('(10) BIJA_ANCHOR_JD is a literal that equals 1800-01-01 00:00 UT', () => {
  assert.equal(M.BIJA_ANCHOR_JD, 2378496.5);
  assert.equal(M.civilToJd({ calendar: 'gregorian', year: 1800, month: 1, day: 1 }), 2378496.5);
  assert.equal(M.gregorianToJulianDay('1800-01-01'), 2378496.5);
  assert.equal(K.kaliDayFromCivil({ calendar: 'gregorian', year: 1800, month: 1, day: 1 }) + 588465.5, 2378496.5);
  assert.match(read('math-core.js'), /const BIJA_ANCHOR_JD = 2378496\.5;/);
});

test("(11) the vāra is each site's own: between Kolkata's and Ujjain's sunrises the two disagree; siteDefaulted only without a site", () => {
  const kolkata = { latitude: 22.5726, longitude: 88.3639 };
  for (const tier of TEXT_TIERS) {
    const dU = M.tierDay(M.gregorianToJulianDay('2026-10-08', '12:00:00', 5.5), UJJAIN.latitude, UJJAIN.longitude, 5.5, tier);
    const dK = M.tierDay(M.gregorianToJulianDay('2026-10-08', '12:00:00', 5.5), kolkata.latitude, kolkata.longitude, 5.5, tier);
    assert.ok(dK.sunriseJd < dU.sunriseJd - 0.02, 'Kolkata sees the Sun ~50 min before Ujjain');
    const jd = (dK.sunriseJd + dU.sunriseJd) / 2;
    const pU = M.panchangAtJd(jd, 5.5, tier, UJJAIN), pK = M.panchangAtJd(jd, 5.5, tier, kolkata);
    assert.equal(pK.varaName, 'गुरुवार'); assert.equal(pU.varaName, 'बुधवार');             // 2026-10-08 is a Thursday
    assert.equal(pU.civilVaraName, pK.civilVaraName);
    assert.equal(pU.siteDefaulted, false);
    assert.equal(M.panchangAtJd(jd, 5.5, tier).siteDefaulted, true);
    assert.deepEqual(M.panchangAtJd(jd, 5.5, tier).site, UJJAIN);
  }
});

test('(12) a new moon inside one civil day: the instants either side get their own months (interval cache, never keyed by day)', () => {
  for (const tier of TEXT_TIERS) {
    const m = SST.lunarMonth(2461321.520833, { samskara: M.TIERS[tier].samskara });
    const before = m.endJd - 60 / 86400, after = m.endJd + 60 / 86400;
    const N = (jd) => M.tierDay(jd, 23.1765, 75.7885, 5.5, tier).N;
    const a1 = M.panchangAtJd(before, 5.5, tier, UJJAIN), b1 = M.panchangAtJd(after, 5.5, tier, UJJAIN), a2 = M.panchangAtJd(before, 5.5, tier, UJJAIN);
    assert.notEqual(a1.masa.name, b1.masa.name, tier);
    assert.equal(a1.masa.name, a2.masa.name);
    assert.ok(Math.abs(b1.masa.startJd - m.endJd) < 1e-6, 'the next month starts at that new moon (found again by its own search: ≤ 0.1 s apart)');
    if (N(before) === N(after)) assert.equal(a1.day.N, b1.day.N, 'the same civil day, two months');
    if (tier === 'ss') { assert.equal(a1.masa.name, P.lunarMonth(textDays(before)).name); assert.equal(b1.masa.name, P.lunarMonth(textDays(after)).name); }
  }
});
