'use strict';
/*
 * ss-madhava.test.js — Mādhava's sine (Kerala, the Kaṭapayādi coefficients) in place of the SS table, carried to the
 * text's R = 3438: what it is, that the radius does not matter, and what it changes. The sphere (Math.sin) appears here
 * only to measure.
 */
const assert = require('node:assert/strict');
const { test } = require('node:test');
const S = require('./sphuta.js').withSine('table');                   // the text's table; SM below is the engine's
const G = require('./spanda-ganita.js');
const U = require('./ss-udaya.js').withSine('table');
const Gh = require('./ss-graha.js').withSine('table');
const Gr = require('./ss-grahana.js').withSine('table');
const K = require('./kala-dvara.js');

const SM = S.withSine('madhava'), UM = U.withSine('madhava'), GhM = Gh.withSine('madhava'), GrM = Gr.withSine('madhava');
const D2R = Math.PI / 180, R2D = 180 / Math.PI, mod = (a, m) => ((a % m) + m) % m, w180 = (a) => mod(a + 180, 360) - 180;
const EPS = Math.asin(1397 / 3438);
const kali = (y, m, d) => K.kaliDayFromCivil({ calendar: 'gregorian', year: y, month: m, day: d });

test('[text, theorem] the coefficients are the Kaṭapayādi words spanda-ganita holds exactly; the quadrant reaches the radius; on R = 3438 the polynomial is the sine to 6e-5', () => {
  const thirds = SM.MADHAVA_C.map((c) => Math.round(c * 3600));
  assert.deepEqual(thirds.map(BigInt), G.MADHAVA_C);
  assert.equal(Math.round(SM.MADHAVA_R * 3600), 12375888);
  assert.ok(Math.abs(SM.jyaOfArcmin(5400) - 3438) < 1e-9);
  let e = 0, tbl = 0;
  for (let m = 0; m <= 5400; m += 0.5) {
    e = Math.max(e, Math.abs(SM.jyaOfArcmin(m) - 3438 * Math.sin(m / 60 * D2R)));
    tbl = Math.max(tbl, Math.abs(S.jyaOfArcmin(m) - SM.jyaOfArcmin(m)));
  }
  assert.ok(e < 6e-5, `${e}`);
  assert.ok(tbl > 1.6 && tbl < 1.75, `the table's own kinks: ${tbl}`);
  for (let x = 0; x <= 3438; x += 1.3) assert.ok(Math.abs(SM.jyaOfArcmin(SM.arcminOfJya(x)) - x) < 1e-9);
  for (let m = 0; m < 5400; m += 7) assert.ok(Math.abs(S.sineSlope(m) * 225 - (S.JYA[Math.min(Math.floor(m / 225), 23) + 1] - S.JYA[Math.min(Math.floor(m / 225), 23)])) < 1e-12, '2.48 unchanged');
  assert.equal(S.sine, 'table'); assert.equal(SM.sine, 'madhava'); assert.equal(require('./sphuta.js').sine, 'madhava', 'the engine\'s default');
  assert.throws(() => S.withSine('aryabhata'), RangeError);
});

test('[THEOREM] the radius cancels: the true Sun and Moon by Mādhava\'s sine on R = 3438 are spanda-ganita\'s exact Mādhava places on 3437′44″48‴', () => {
  const GM = G.withSine('madhava');
  for (const days of [0.25, 1000000.5, 1871500.7, 1872000.3]) {
    const p = GM.places(G.tauOfDays(days)), q = SM.sphutaAtDays(days);
    assert.ok(Math.abs(w180(G.toNum(p.sun) / 60 - q.sun)) < 2e-7, `sun ${days}`);
    assert.ok(Math.abs(w180(G.toNum(p.moon) / 60 - q.moon)) < 2e-7, `moon ${days}`);
  }
});

test('[MEASURED] what the smooth sine changes: Sun and Moon by seconds, the planets by a few minutes (the śīghra steps carry the sine twice), the lagna by the 3.42 rule much nearer the sphere', (t) => {
  let sun = 0, moon = 0, pl = 0;
  const t0 = kali(2026, 1, 1);
  for (let d = 0; d < 366; d += 3) {
    const a = S.sphutaAtDays(t0 + d), b = SM.sphutaAtDays(t0 + d);
    sun = Math.max(sun, Math.abs(w180(a.sun - b.sun))); moon = Math.max(moon, Math.abs(w180(a.moon - b.moon)));
    const A = Gh.truePlaces(t0 + d), B = GhM.truePlaces(t0 + d);
    for (const n of Gh.NAMES) pl = Math.max(pl, Math.abs(w180(A[n].longitude - B[n].longitude)));
  }
  assert.ok(sun * 3600 < 10 && moon * 3600 < 30, `Sun ${sun * 3600}″, Moon ${moon * 3600}″`);
  assert.ok(pl * 60 < 4, `planets ${pl * 60}′`);
  const rows = [];
  for (const lat of [0, 23.18, 35]) {
    const phi = lat * D2R, pbT = U.palabhaOf(lat), pbM = UM.palabhaOf(lat);
    let eT = 0, eM = 0;
    for (let r = 0; r < 360; r += 1) {
      const ramc = r * D2R;
      const asc = mod(Math.atan2(Math.cos(ramc), -(Math.sin(ramc) * Math.cos(EPS) + Math.tan(phi) * Math.sin(EPS))) * R2D, 360);
      eT = Math.max(eT, Math.abs(w180(U.lagnaOwn(r * 60, pbT) - asc)));
      eM = Math.max(eM, Math.abs(w180(UM.lagnaOwn(r * 60, pbM) - asc)));
    }
    assert.ok(eM < eT / 5 && eM < 0.05, `φ ${lat}: table ${eT}, Mādhava ${eM}`);
    rows.push(`φ ${lat}: lagna table ${eT.toFixed(3)}°, Mādhava ${eM.toFixed(4)}°`);
  }
  t.diagnostic(`Sun ≤ ${(sun * 3600).toFixed(2)}″, Moon ≤ ${(moon * 3600).toFixed(2)}″, planets ≤ ${(pl * 60).toFixed(2)}′ (2026); ${rows.join('; ')}`);
});

test('[MEASURED] eclipses: the middle moves by seconds of time, the contacts by under a minute', (t) => {
  const site = { latitude: 23.18, deshantara: 0.05 };
  const a = Gr.lunarEclipse(kali(2026, 3, 3), site), b = GrM.lunarEclipse(kali(2026, 3, 3), site);
  assert.equal(GrM.sine, 'madhava');
  const dm = Math.abs(a.middle - b.middle) * 86400, ds = Math.abs(a.contacts.sparsha - b.contacts.sparsha) * 86400;
  assert.ok(dm < 60 && ds < 60, `middle ${dm} s, sparśa ${ds} s`);
  assert.ok(a.total && b.total);
  t.diagnostic(`lunar eclipse 2026-03-03: middle ${dm.toFixed(1)} s, sparśa ${ds.toFixed(1)} s apart`);
});

test('[MEASURED] the pañcāṅga\'s lagna by default is the text\'s own rule with Mādhava\'s sine: the sphere\'s, with no trigonometry, to a hundredth of an arcsecond', () => {
  const P = require('./panchanga.js'), site = { latitude: 23.18, deshantara: 0.05 }, t0 = kali(2026, 10, 7);
  let e = 0;
  for (let k = 0; k < 96; k++) {
    const t = t0 + k / 96, a = P.lagnaAt(t, site), b = P.lagnaAt(t, site, { lagna: 'sphere' });
    assert.equal(a.method, "SS 3.42 at the point with 2.61-2.63, Mādhava's sine");
    e = Math.max(e, Math.abs(w180(a.longitude - b.longitude)));
  }
  assert.ok(e * 3600 < 0.1, `${e * 3600}″`);
  assert.equal(P.lagnaAt(t0, site, { epsilon: 23.5 }).method, 'sphere', 'another obliquity asks for the sphere');
  assert.throws(() => P.lagnaAt(t0, site, { lagna: 'chalit' }), RangeError);
});

test('[MEASURED] SS 3.44\'s stated risings 1670, 1795, 1935 lie nearer what the TABLE gives from 1397 (within 1.2 asus) than the exact sine (up to 2.3 off)', () => {
  const t = U.lankaRisings(), m = UM.lankaRisings(), stated = [1670, 1795, 1935];
  const dt = stated.map((v, i) => Math.abs(t[i] - v)), dm = stated.map((v, i) => Math.abs(m[i] - v));
  assert.ok(Math.max(...dt) < 1.2, `table ${t.map((x) => x.toFixed(2))}`);
  assert.ok(Math.max(...dm) > 2 && dm.reduce((a, c) => a + c) > dt.reduce((a, c) => a + c), `Mādhava ${m.map((x) => x.toFixed(2))}`);
  assert.ok(Math.abs(m[0] + m[1] + m[2] - 5400) < 1e-6 && Math.abs(t[0] + t[1] + t[2] - 5400) < 1e-6, 'a quadrant either way');
});

test('[MEASURED] the planets\' stations: the table\'s kinks make Mars\'s place stand and turn more than once at some stations; with Mādhava\'s sine never', () => {
  const T = K.kaliDayFromCivil({ calendar: 'gregorian', year: 2026, month: 1, day: 1 });
  const a = Gh.stations('mars', T - 365.25 * 60, T + 365.25 * 60, { by: 'place' }), b = GhM.stations('mars', T - 365.25 * 60, T + 365.25 * 60, { by: 'place' });
  assert.ok(a.merged > 5, `table: ${a.merged} stations merged`);
  assert.equal(b.merged, 0, 'Mādhava: every station a single turn');
  assert.equal(a.length, b.length);
});

test('[MEASURED] the ancestors\' 15 recorded eclipses (JM): the same verdict by both sines — eclipse or none, seen or not — and middles within a minute', () => {
  const fs = require('node:fs'), path = require('node:path'), KP = require('./katapayadi.js');
  const corpus = JSON.parse(fs.readFileSync(path.join(__dirname, 'corpus', 'jyotirmimamsa', 'eclipses.json'), 'utf8'));
  const pb = Number(KP.decodeWord('duṣkarā').value), palabha = Math.floor(pb / 100) + (pb % 100) / 60;
  const V = { latitude: S.arcminOfJya(S.R * palabha / Math.sqrt(144 + palabha * palabha)) / 60, deshantara: -Number(KP.decodeWord('nakha').value) * 6 / 60, palabha };
  let worst = 0;
  for (const r of corpus.records) {
    const run = (G) => (r.kind === 'lunar' ? G.lunarEclipse(r.printed_number + 0.5, V) : G.solarEclipse(r.printed_number + 0.5, V));
    const a = run(Gr), b = run(GrM);
    assert.equal(a.possible, b.possible, r.id);
    if (!a.possible) continue;
    assert.equal(a.total, b.total, r.id); assert.equal(a.seenAtSite, b.seenAtSite, r.id);
    worst = Math.max(worst, Math.abs(a.middle - b.middle) * 86400);
  }
  assert.ok(worst < 60, `${worst} s`);
});
