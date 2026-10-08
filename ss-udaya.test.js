'use strict';
/*
 * ss-udaya.test.js — the Sūrya-Siddhānta's rising-times, lagna, kālāṃśa and first crescent (ss-udaya.js), checked against
 * the text's own statements, against its own internal identities, and against the sphere (only to measure how far the
 * text's arithmetic is from it — the sphere is not used to compute anything in the module).
 */
const assert = require('node:assert/strict');
const { test } = require('node:test');
// This suite checks the text as written: its 24-entry sine table (withSine('table')). The engine's default sine is
// Mādhava's (owner, 2026-10-07); ss-madhava.test.js measures what that changes.
const U = require('./ss-udaya.js').withSine('table');
const P = require('./panchanga.js');
const Ut = require('./utsava.js');
const K = require('./kala-dvara.js');
const D2R = Math.PI / 180, R2D = 180 / Math.PI;
const mod = (a, m) => ((a % m) + m) % m;
const EPS = Math.asin(1397 / 3438);                                         // the text's greatest declination, for the sphere comparisons
const UJJAIN = { latitude: 23.18, deshantara: 0.05 };

test('3.42-3.45: from 1397 the Laṅkā risings are 3.44\'s 1670, 1795, 1935 to within an asu; any place\'s twelve add to the turn', () => {
  const l = U.lankaRisings();
  [1670, 1795, 1935].forEach((v, i) => assert.ok(Math.abs(l[i] - v) < 1.5, `${v} vs ${l[i].toFixed(2)}`));
  assert.ok(Math.abs(l[0] + l[1] + l[2] - 5400) < 1e-9);
  for (const lat of [0, 12, 23.18, 28.6]) {
    const rs = U.risings(U.palabhaOf(lat));
    assert.ok(Math.abs(rs.reduce((a, b) => a + b) - 21600) < 1e-9, 'a turn is 21,600 asus');
    for (let i = 0; i < 6; i++) assert.equal(rs[i], rs[11 - i], '3.45: Tulā… Mīna are Meṣa… Kanyā reversed');
    if (lat > 0) assert.ok(rs[0] < l[0] && rs[5] > l[0], 'north of Laṅkā Meṣa rises faster and Kanyā slower');
  }
  assert.deepEqual(U.risings(0, { stated: true }).slice(0, 6), [1670, 1795, 1935, 1935, 1795, 1670]);
});

test('2.60-2.62: the cara by the table is the sphere\'s ascensional difference to within an asu', () => {
  for (const lat of [10, 23.18, 35]) {
    const pb = U.palabhaOf(lat);
    assert.ok(Math.abs(pb - 12 * Math.tan(lat * D2R)) < 0.01, 'palabhā = 12 tan φ by the table');
    for (let lam = 0; lam < 360; lam += 7.5) {
      const d = Math.asin(Math.sin(lam * D2R) * Math.sin(EPS));
      const exact = Math.asin(Math.tan(lat * D2R) * Math.tan(d)) * R2D * 60;
      assert.ok(Math.abs(U.caraAsus(lam, pb) - exact) < 1, `φ ${lat}, λ ${lam}`);
    }
  }
  assert.ok(Math.abs(U.halfDay(90, U.palabhaOf(23.18)) / 360 - 16.83) < 0.01, 'Ujjain\'s longest half-day ≈ 16.83 ghaṭīs: 15 + asin(tan φ tan ε) in asus');
});

test('3.46-3.50: the literal lagna equals the ascension rule; at sunrise the lagna is the Sun; 3.50 adds up', () => {
  const rs = U.risings(U.palabhaOf(23.18));
  for (const sun of [3, 47.5, 118, 181, 266.6, 359]) {
    assert.ok(Math.abs(mod(U.lagna(sun, 0, rs) - sun + 180, 360) - 180) < 1e-9, 'sunrise');
    for (const since of [100, 3000, 9000, 15000, 21000]) {
      const lit = U.lagna(sun, since, rs), asc = U.longitudeOfAscension(U.ascension(sun, rs) + since, rs);
      assert.ok(Math.abs(mod(lit - asc + 180, 360) - 180) < 1e-9);
      assert.ok(Math.abs(U.intervalAsus(sun, lit, rs) - since) < 1e-6, '3.50 gives back the asus');
    }
  }
});

test('the text\'s lagna against the sphere: within 0.4° at Laṅkā and 1.1° at Ujjayinī — its linear interpolation within a sign', () => {
  const worst = (lat) => {
    const pb = U.palabhaOf(lat), phi = lat * D2R; let mx = 0, mxMC = 0;
    for (let r = 0; r < 360; r += 0.5) {
      const ramc = r * D2R;
      const asc = mod(Math.atan2(Math.cos(ramc), -(Math.sin(ramc) * Math.cos(EPS) + Math.tan(phi) * Math.sin(EPS))) * R2D, 360);
      const mc = mod(Math.atan2(Math.sin(ramc), Math.cos(ramc) * Math.cos(EPS)) * R2D, 360);
      for (const sun of [15, 100, 200, 290]) mx = Math.max(mx, Math.abs(mod(U.lagnaFromMeridian(sun, r * 60, pb) - asc + 180, 360) - 180));
      mxMC = Math.max(mxMC, Math.abs(mod(U.madhyaLagna(r * 60) - mc + 180, 360) - 180));
    }
    return [mx, mxMC];
  };
  const [l0, m0] = worst(0), [l23] = worst(23.18);
  assert.ok(l0 < 0.4 && m0 < 0.4 && l23 < 1.1, `Laṅkā ${l0.toFixed(3)}°, MC ${m0.toFixed(3)}°, Ujjayinī ${l23.toFixed(3)}°`);
  assert.ok(l23 > 0.5, 'and the difference is real, not rounding');
  // through the pañcāṅga: the same instant, both methods
  const t = K.kaliDayFromCivil({ calendar: 'gregorian', year: 2026, month: 4, day: 10 }) + 0.3;
  const a = P.lagnaAt(t, UJJAIN), b = P.lagnaAt(t, UJJAIN, { lagna: 'text-linear' }), c = P.lagnaAt(t, UJJAIN, { lagna: 'text' });
  assert.equal(b.method, 'SS 3.42-3.48');
  assert.ok(Math.abs(mod(a.longitude - b.longitude + 180, 360) - 180) < 1.1);
  assert.equal(c.method, 'SS 3.42 at the point with 2.61-2.63');
  assert.ok(Math.abs(mod(a.longitude - c.longitude + 180, 360) - 180) < 0.3);
});

test('the text\'s lagna by each point\'s own rising (3.42 at the point, 2.61-2.63): within 0.3° of the sphere at every latitude — the table\'s own limit — where 3.46-3.48\'s proportion reaches 1.7° at 35°', () => {
  for (const lat of [0, 12, 23.18, 28.6, 35]) {
    const pb = U.palabhaOf(lat), phi = lat * D2R; let own = 0, lin = 0, mc = 0;
    for (let r = 0; r < 360; r += 1) {
      const ramc = r * D2R;
      const asc = mod(Math.atan2(Math.cos(ramc), -(Math.sin(ramc) * Math.cos(EPS) + Math.tan(phi) * Math.sin(EPS))) * R2D, 360);
      const m = mod(Math.atan2(Math.sin(ramc), Math.cos(ramc) * Math.cos(EPS)) * R2D, 360);
      own = Math.max(own, Math.abs(mod(U.lagnaOwn(r * 60, pb) - asc + 180, 360) - 180));
      lin = Math.max(lin, Math.abs(mod(U.lagnaFromMeridian(100, r * 60, pb) - asc + 180, 360) - 180));
      mc = Math.max(mc, Math.abs(mod(U.madhyaLagnaOwn(r * 60) - m + 180, 360) - 180));
    }
    assert.ok(own < 0.3 && mc < 0.3, `φ ${lat}: own ${own.toFixed(3)}, MC ${mc.toFixed(3)}`);
    if (lat >= 23) assert.ok(lin > 3 * own, `φ ${lat}: linear ${lin.toFixed(3)}`);
  }
});

test('7.8-7.10 at the horizon: a northern latitude sets later (west +) and rises earlier (east −); āyana by the declination of λ + 90°', () => {
  const pb = U.palabhaOf(23.18);
  const w = U.drkkarma(100, 240, pb, 'west'), e = U.drkkarma(100, 240, pb, 'east');
  assert.ok(w.aksaArcmin > 0 && e.aksaArcmin < 0 && Math.abs(w.aksaArcmin + e.aksaArcmin) < 1e-12);
  assert.ok(Math.abs(w.aksaArcmin - 240 * pb / 12) < 1e-12);
  // λ = 0: λ + 90° is Karka, declination north; a northern latitude is "alike" → subtract (7.10)
  assert.ok(U.drkkarma(0, 240, pb, 'west').ayanaArcmin < 0 && U.drkkarma(180, 240, pb, 'west').ayanaArcmin > 0);
  assert.ok(Math.abs(U.drkkarma(0, 240, pb, 'west').ayanaArcmin + 240 * 24 / 60) < 0.2, '240′ × 24° = 5760″ = 96′');
});

test('10.1-10.4: candra-darśana in 2026 at Ujjayinī — after each amāvāsyā, a first evening with ≥ 12 kālāṃśa, within three', () => {
  const t0 = K.kaliDayFromCivil({ calendar: 'gregorian', year: 2026, month: 1, day: 1 });
  const all = Ut.candraDarshana(t0, t0 + 365, UJJAIN);
  assert.ok(all.length >= 12);
  for (const c of all) {
    assert.ok(c.first, `a first evening after ${c.amavasya}`);
    assert.ok(c.first.kalamsa >= 12 && c.first.hoursAfterConjunction > 0 && c.first.hoursAfterConjunction < 72);
    const before = c.evenings.filter((e) => !e.visible);
    for (const b of before) assert.ok(b.kalamsa < 12);
    for (let i = 1; i < c.evenings.length; i++) {
      const g = c.evenings[i].kalamsa - c.evenings[i - 1].kalamsa;
      assert.ok(g > 7 && g < 17, `kālāṃśa grows by a day\'s elongation in rising-time: ${g.toFixed(2)}`);
    }
    // 10.4: the Moon sets after the Sun by the iterated asus — a little more than the first estimate (the Moon runs ahead)
    assert.ok(c.first.moonset > c.first.sunset && c.first.moonsetAfterSunsetGhati * 6 >= c.first.kalamsa);
  }
  const hours = all.map((c) => c.first.hoursAfterConjunction);
  assert.ok(Math.min(...hours) > 15 && Math.max(...hours) < 60, `first sighting ${Math.min(...hours).toFixed(1)}–${Math.max(...hours).toFixed(1)} h after the conjunction`);
});

test('each body\'s own horizon (2.58, 2.61-2.63, 3.42 at the point): within 0.55 kālāṃśa of the sphere at any latitude of the body up to 5°, where 7.8-7.10\'s linear dṛkkarma reaches 1.8', () => {
  // 3.42 at the point agrees with the stated sign-end risings, and the right ascension runs the full turn
  const l = U.lankaRisings();
  assert.ok(Math.abs(U.rightAscension(30) - l[0]) < 1e-9 && Math.abs(U.rightAscension(60) - l[0] - l[1]) < 1e-9 && U.rightAscension(90) === 5400);
  for (let lam = 0; lam < 360; lam += 1) assert.ok(U.rightAscension(lam + 1) > U.rightAscension(lam) || lam === 359);
  // rising and setting are a half-day either side of the meridian: their difference is twice the half-day
  const pb = U.palabhaOf(23.18);
  assert.ok(Math.abs(mod(U.horizonAsus(90, U.kranti(90), pb, 'west') - U.horizonAsus(90, U.kranti(90), pb, 'east'), 21600) - 2 * U.halfDay(90, pb)) < 1e-6);
  const H0 = (phi, d) => Math.acos(Math.max(-1, Math.min(1, -Math.tan(phi) * Math.tan(d)))) * R2D;
  const eq = (lam, beta) => {                                               // the sphere, for measurement only
    const l = lam * D2R, b = beta * D2R;
    return { a: mod(Math.atan2(Math.sin(l) * Math.cos(EPS) - Math.tan(b) * Math.sin(EPS), Math.cos(l)) * R2D, 360), d: Math.asin(Math.sin(b) * Math.cos(EPS) + Math.cos(b) * Math.sin(EPS) * Math.sin(l)) };
  };
  for (const lat of [0, 23.18, 28.6]) {
    const p = U.palabhaOf(lat), phi = lat * D2R, rs = U.risings(p); let own = 0, aksa = 0;
    for (const beta of [0, 2, -5, 5]) for (let sun = 0; sun < 360; sun += 3) for (const off of [8, 12, 16, 20]) for (const side of ['east', 'west']) {
      const lam = mod(sun + (side === 'east' ? -off : off), 360), s = eq(sun, 0), b = eq(lam, beta);
      const sph = side === 'east' ? (((s.a - H0(phi, s.d)) - (b.a - H0(phi, b.d)) + 540) % 360) - 180 : (((b.a + H0(phi, b.d)) - (s.a + H0(phi, s.d)) + 540) % 360) - 180;
      own = Math.max(own, Math.abs(U.kalamsaOwn(U.bodyHorizonAsus(lam, beta * 60, p, side), sun, p, side) - sph));
      const dk = U.drkkarma(lam, beta * 60, p, side).lambda, a = side === 'east' ? U.ascension(sun, rs) - U.ascension(dk, rs) : U.ascension(dk + 180, rs) - U.ascension(sun + 180, rs);
      aksa = Math.max(aksa, Math.abs((((a % 21600) + 32400) % 21600 - 10800) / 60 - sph));
    }
    assert.ok(own < 0.55, `φ ${lat}: own ${own.toFixed(2)}`);
    if (lat > 20) assert.ok(aksa > own + 0.5, `φ ${lat}: ākṣa ${aksa.toFixed(2)} vs own ${own.toFixed(2)}`);
  }
  // the old rule is still there, by name
  const st = { sun: 230, moon: 245, moonLatArcmin: 200, sunBhukti: 60, moonBhukti: 790, palabha: pb };
  assert.equal(U.moonAfterSunset(st).drk, 'own'); assert.equal(U.moonAfterSunset(st, { drk: 'aksa' }).drk, 'aksa');
});

test('[MEASURED] the Sun\'s right ascension for the sunrise clock against the sphere: 3.42 at its own point rms 3.6 asus (19 at worst, the table\'s kink near 90°), the Laṅkā risings in proportion within a sign rms 12 (23 at worst); with Mādhava\'s sine the own point is exact — own point the default, the proportion kept as "linear"', () => {
  const UM = U.withSine('madhava');
  let own = 0, lin = 0, mad = 0, so = 0, sl = 0, n = 0;
  for (let l = 0; l < 360; l += 0.25) {
    const ra = mod(Math.atan2(Math.sin(l * D2R) * Math.cos(EPS), Math.cos(l * D2R)) * R2D, 360) * 60;
    const d = (v) => Math.abs(mod(v - ra + 10800, 21600) - 10800);
    const a = d(U.rightAscension(l)), b = d(U.ascension(l, U.risings(0)));
    own = Math.max(own, a); lin = Math.max(lin, b); mad = Math.max(mad, d(UM.rightAscension(l))); so += a * a; sl += b * b; n++;
  }
  assert.ok(Math.sqrt(so / n) < 4 && Math.sqrt(sl / n) > 11 && own < lin && lin < 25, `own ${own} rms ${Math.sqrt(so / n)}, linear ${lin} rms ${Math.sqrt(sl / n)}`);
  assert.ok(mad < 1e-3, `Mādhava ${mad}`);
  const a = U.sinceSunrise(45, 3000, 5), b = U.sinceSunrise(45, 3000, 5, { ascension: 'linear' });
  assert.ok(Math.abs(a - (3000 - U.rightAscension(45) + U.halfDay(45, 5))) < 1e-9 && Math.abs(b - (3000 - U.ascension(45, U.risings(0)) + U.halfDay(45, 5))) < 1e-9);
  assert.ok(Math.abs(U.lagnaFromMeridian(45, U.ascension(45, U.risings(0)) - U.halfDay(45, 5), 5) - 45) < 1e-9, '3.46-3.48 keeps its own Sun: at sunrise the lagna is the Sun');
});
