'use strict';
/*
 * dhruva.test.js — the dhruva as the fixed point: latitude, north and obliquity from observation, the sphere about the
 * dhruva, and the Sūrya-Siddhānta's ch.8 star catalogue in its own polar coordinates. No modern ephemeris, no star catalogue
 * but the text's.
 *
 * Sources (editions/surya-siddhanta-full-edition.html): 2.28 (:1453) sine of the greatest declination 1397 on R = 3438;
 * 8.1-8.12 (:3723-) dhruvaka and vikṣepa of the junction stars, and "golaṃ labdhvā parīkṣeta vikṣepaṃ dhruvakaṃ sphuṭam";
 * 8.15 conjunction tested against the dhruvaka; 12.43-12.44 the dhruvas on the horizon at the equator; 12.72 (:5554) the
 * dhruva's elevation; 12.73 (:5566) the star-wheel bound to the two dhruvas; 13.4 the gola's axis rod.
 * Catalogue: corpus/surya-siddhanta/yogatara.json.
 * [ALGEBRA]/[EXACT] tests check the exact arithmetic; [PHYSICAL DOMAIN] tests check that what no observation can give is
 * refused (owner audit A1, 2026-10-08), and that inside the domain every result is 68905b9's, bit for bit.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
const D = require('./dhruva.js');
const cat = JSON.parse(fs.readFileSync(path.join(__dirname, 'corpus', 'surya-siddhanta', 'yogatara.json'), 'utf8'));
const bhuta = (values) => Number([...values.map((v) => String(v).split('').reverse().join(''))].join('').split('').reverse().join(''));
const near = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`);
const angNear = (a, b, tol, msg) => { const d = ((a - b) % 360 + 540) % 360 - 180; assert.ok(Math.abs(d) <= tol, `${msg}: ${a} vs ${b}`); };

// ── [ALGEBRA] exact arithmetic, on any integers where the function's doc says so ─────────────────────
// Since the owner's audit item A1 (2026-10-08) the three observation functions are split in two: the arithmetic is exact
// (these tests), and the inputs must describe something an observer can see (the [PHYSICAL DOMAIN] tests further down).

test('[SS 12.72-12.73] the dhruva\'s elevation is the mean of a circumpolar star\'s two meridian altitudes — whatever the star\'s distance from it', () => {
  // Every case here is physical: 0 < lower ≤ upper and an elevation of at most 90°. Altitudes are read from the north point
  // of the horizon (dhruva.js); the arithmetic is exact for every such integer pair.
  let n = 0;
  for (const phi of [2, 39060, 83448, 216000, 324000]) {             // 2″, 10°51′, 23°10′48″, 60°, 90° (integer arcseconds)
    for (const p of [0, 1, 2340, 2399, 36000, 123457, 200000]) {     // the star's distance from the dhruva: unknown to the observer
      if (!(p < phi)) continue;                                     // circumpolar only if its lower transit stays above the horizon
      const r = D.dhruvaFromCulminations({ upper: phi + p, lower: phi - p });
      assert.equal(r.elevation.num, BigInt(2 * phi)); assert.equal(r.elevation.den, 2n);
      assert.equal(r.polarDistance.num, BigInt(2 * p)); assert.equal(r.polarDistance.den, 2n);
      n++;
    }
  }
  assert.equal(n, 26);
  // the upper reading may pass 90°: at 60° a star 40° from the dhruva culminates 10° south of the zenith, 100° from the north point
  const s = D.dhruvaFromCulminations({ upper: 360000, lower: 72000 });
  assert.equal(s.elevation.num / s.elevation.den, 216000n); assert.equal(s.polarDistance.num / s.polarDistance.den, 144000n);
  // BigInt readings are taken as they are
  assert.equal(D.dhruvaFromCulminations({ upper: 83448n + 7n, lower: 83448n - 7n }).elevation.num, 166896n);
  assert.throws(() => D.dhruvaFromCulminations({ upper: 1, lower: 2 }), RangeError);
  assert.throws(() => D.dhruvaFromCulminations({ upper: 1.5, lower: 0 }), TypeError);
});

test('[EXACT] true north is the midpoint of the two greatest elongations; a mis-set north line is found, not assumed', () => {
  const c = 437;                                                    // the provisional line is 7′17″ off — unknown to the observer
  const half = 2400;                                                // the star's elongation either side of true north
  const r = D.northFromElongations({ east: half - c, west: -half - c });
  assert.equal(r.num, BigInt(-2 * c)); assert.equal(r.den, 2n);    // true north sits at −c on the provisional scale
  // [ALGEBRA] the scale is the observer's own, so any integers are exact (dhruva.js says so), BigInt included
  for (const [e, w] of [[0, 0], [-1, 1], [1296000, -1296000], [7, 8], [-9e15, 9e15 - 1]]) {
    assert.equal(D.northFromElongations({ east: e, west: w }).num, BigInt(e) + BigInt(w));
  }
  assert.equal(D.northFromElongations({ east: 10n ** 30n, west: 1n }).num, 10n ** 30n + 1n);
});

test('[EXACT] obliquity and latitude from the two solstitial noon zenith distances, also where the summer Sun passes north of the zenith', () => {
  for (const [phi, eps] of [[39060, 86313], [83448, 86313], [100000, 84000], [0, 86400], [-120000, 86313], [324000 - 86313, 86313]]) {
    const r = D.fromSolsticeZenithDistances({ summer: phi - eps, winter: phi + eps });
    assert.equal(r.epsilon.num, BigInt(2 * eps)); assert.equal(r.latitude.num, BigInt(2 * phi));
  }
});

// ── [PHYSICAL DOMAIN] what no observation can give is refused (owner audit A1, 2026-10-08) ─────────────
test('[PHYSICAL DOMAIN] the culmination method refuses what no circumpolar star gives: a latitude above 90°, a lower transit at or below the horizon, a reversed pair', () => {
  // Relabelled from the [SS 12.72-12.73] test above, which until 2026-10-08 fed φ = 100° (360,000″) as an algebra input and
  // got a "latitude" of 100° back. No place has it: such readings are now refused, as is the audit's 105°/95°.
  for (const p of [0, 2340, 2399, 36000, 123457]) assert.throws(() => D.dhruvaFromCulminations({ upper: 360000 + p, lower: 360000 - p }), RangeError, `100°, p ${p}`);
  assert.throws(() => D.dhruvaFromCulminations({ upper: 105 * 3600, lower: 95 * 3600 }), RangeError, '105°/95° is a latitude of 100°');
  assert.throws(() => D.dhruvaFromCulminations({ upper: 324001, lower: 324000 }), RangeError, 'just over 90°');
  assert.doesNotThrow(() => D.dhruvaFromCulminations({ upper: 324000, lower: 324000 }), 'exactly 90°: the pole');
  // SS 12.43-12.44: at the equator the two dhruvas lie on the horizon, so no star is circumpolar there. The pair this test
  // used to read as "elevation 0" has its lower transit 39′ below the horizon: it is now refused. The smallest case the
  // method takes is the star 1″ from the dhruva at an elevation of 2″ (the [SS 12.72-12.73] test).
  assert.throws(() => D.dhruvaFromCulminations({ upper: 2340, lower: -2340 }), RangeError, 'the equator: no circumpolar star');
  assert.throws(() => D.dhruvaFromCulminations({ upper: 0, lower: 0 }), RangeError, 'the dhruva itself on the horizon');
  for (const phi of [39060, 83448]) {
    assert.throws(() => D.dhruvaFromCulminations({ upper: 2 * phi, lower: 0 }), RangeError, 'a star that grazes the horizon');
    assert.throws(() => D.dhruvaFromCulminations({ upper: phi + 123457, lower: phi - 123457 }), RangeError, 'a star that sets');
  }
  assert.throws(() => D.dhruvaFromCulminations({ upper: 1000, lower: 2000 }), RangeError, 'reversed pair');
  for (const bad of [NaN, Infinity, -Infinity, '83448', null, undefined, 1.5]) {
    assert.throws(() => D.dhruvaFromCulminations({ upper: bad, lower: 1 }), TypeError, `upper ${bad}`);
    assert.throws(() => D.dhruvaFromCulminations({ upper: 90000, lower: bad }), TypeError, `lower ${bad}`);
    assert.throws(() => D.northFromElongations({ east: bad, west: 0 }), TypeError, `east ${bad}`);
    assert.throws(() => D.northFromElongations({ east: 0, west: bad }), TypeError, `west ${bad}`);
    assert.throws(() => D.fromSolsticeZenithDistances({ summer: bad, winter: 0 }), TypeError, `summer ${bad}`);
  }
});

test('[PHYSICAL DOMAIN] the solstice pair refuses an obliquity outside (0°, 90°) and a latitude beyond ±90° — a reversed pair no longer returns a negative ε', () => {
  const phi = 83448, eps = 86313;
  assert.throws(() => D.fromSolsticeZenithDistances({ summer: phi + eps, winter: phi - eps }), RangeError, 'reversed pair (was ε = −23°58′33″)');
  assert.throws(() => D.fromSolsticeZenithDistances({ summer: phi, winter: phi }), RangeError, 'ε = 0');
  assert.throws(() => D.fromSolsticeZenithDistances({ summer: -324000, winter: 324000 }), RangeError, 'ε = 90°');
  assert.doesNotThrow(() => D.fromSolsticeZenithDistances({ summer: -323999, winter: 323999 }), 'ε just under 90°');
  assert.throws(() => D.fromSolsticeZenithDistances({ summer: 327600 - eps, winter: 327600 + eps }), RangeError, 'latitude 91°');
  assert.throws(() => D.fromSolsticeZenithDistances({ summer: -327600 - eps, winter: -327600 + eps }), RangeError, 'latitude −91°');
  const pole = D.fromSolsticeZenithDistances({ summer: 324000 - eps, winter: 324000 + eps });
  assert.equal(pole.latitude.num, 648000n, 'exactly 90° is a place');
});

test('[SS 2.28] the text\'s obliquity: sine 1397 on R 3438, decoded from "sapta-randhra-guṇa-indavaḥ"', () => {
  assert.equal(bhuta([7, 9, 3, 1]), D.SS_PARAMAPAKRAMA_JYA);
  assert.equal(D.SS_RADIUS, 3438);
  near(D.SS_EPSILON_DEG, 23.9752, 1e-4, 'ε from the text');
});

test('[SS 8.1-8.9] every dhruvaka is re-derived from the verse\'s figure words by the rule of 8.1, or placed by the rules of 8.4-8.5', () => {
  const mins = {};
  const start = (bhoga) => (bhoga - 1) * 800;
  for (const s of cat.stars) {
    let m;
    if (s.figure !== undefined) {
      assert.equal(bhuta(s.figure_values), s.figure, `${s.name}: ${s.figure_words}`);
      m = start(s.bhoga) + s.figure * 10;
    } else if (s.rule.kind === 'middle-of-bhoga') m = start(s.rule.of) + 400;
    else if (s.rule.kind === 'end-of-bhoga') m = start(s.rule.of) + 800;
    else if (s.rule.kind === 'padas-into-bhoga') m = start(s.rule.of) + s.rule.padas * 200;
    mins[s.name] = m;
  }
  const dm = (deg, min = 0) => deg * 60 + min;
  assert.deepEqual(
    cat.stars.map((s) => mins[s.name]),
    [dm(8), dm(20), dm(37, 30), dm(49, 30), dm(63), dm(67, 20), dm(93), dm(106), dm(109), dm(129), dm(144), dm(155), dm(170), dm(180),
      dm(199), dm(213), dm(224), dm(229), dm(241), dm(254), dm(260), dm(266, 40), dm(280), dm(290), dm(320), dm(326), dm(337), dm(359, 50)]);
  assert.equal(mins['Citrā'], 10800, 'Citrā at exactly 180°');
  assert.equal(mins['Revatī'], 21590, 'Revatī at 359°50′');
  for (let i = 1; i < cat.stars.length; i++) assert.ok(mins[cat.stars[i].name] > mins[cat.stars[i - 1].name], 'in order round the circle');
  assert.equal(cat.stars.length, 28);
  assert.equal(cat.stars.filter((s) => s.vikshepa > 0).length, 12);  // north
  assert.equal(cat.stars.filter((s) => s.vikshepa < 0).length, 13);  // south
  assert.equal(cat.stars.filter((s) => s.vikshepa === 0).length, 3);  // Puṣya, Maghā, Revatī
  assert.equal(Math.max(...cat.stars.map((s) => Math.abs(s.vikshepa))), 60, 'Abhijit, the polar extreme of the belt (8.8)');
});

test('[SPHERE] polar, equatorial and ecliptic places round-trip; the dhruvaka equals the ecliptic longitude only on the ecliptic and on the solstitial colure', () => {
  for (let lp = 0; lp < 360; lp += 7.5) {
    for (const bp of [-80, -37, -2, 0, 5, 30, 60]) {
      const deltaPoint = Math.asin(Math.sin(D.SS_EPSILON_DEG * Math.PI / 180) * Math.sin(lp * Math.PI / 180)) * 180 / Math.PI;
      if (Math.abs(deltaPoint + bp) > 90) { assert.throws(() => D.polarToEquatorial(lp, bp), RangeError, 'past the dhruva'); continue; }
      const q = D.polarToEquatorial(lp, bp);
      const back = D.equatorialToPolar(q.alpha, q.delta);
      angNear(back.dhruvaka, lp, 1e-9, `polar round trip λp ${lp}`); near(back.vikshepa, bp, 1e-9, 'vikṣepa round trip');
      const e = D.polarToEcliptic(lp, bp);
      const p2 = D.eclipticToPolar(e.lambda, e.beta);
      angNear(p2.dhruvaka, lp, 1e-9, 'via ecliptic'); near(p2.vikshepa, bp, 1e-9, 'via ecliptic');
      if (bp === 0) { angNear(e.lambda, lp, 1e-9, 'on the ecliptic λ = λp'); near(e.beta, 0, 1e-9, 'β = 0'); }
    }
  }
  for (const [lp, bp] of [[90, -80], [90, 37], [90, 60], [270, -60], [270, 37], [270, 60]]) {   // the circle through the dhruva and a solstice also passes through the ecliptic's pole
    const e = D.polarToEcliptic(lp, bp);
    angNear(e.lambda, lp, 1e-9, `colure λ`); near(e.beta, bp, 1e-9, 'colure β');
  }
});

test('[SS 8.12, 8.15] the dhruvaka is NOT the ecliptic longitude: Svātī moves 16°, Abhijit 2.6°, Citrā 0.8° — the zero-latitude stars not at all', () => {
  const byName = Object.fromEntries(cat.stars.map((s) => [s.name, s]));
  const lp = (s) => { const m = s.figure !== undefined ? (s.bhoga - 1) * 800 + s.figure * 10 : null; return m / 60; };
  const svati = D.polarToEcliptic(lp(byName['Svātī']), 37);
  near(svati.lambda, 182.7177, 1e-3, 'Svātī ecliptic longitude'); near(svati.beta, 33.6947, 1e-3, 'Svātī ecliptic latitude');
  const abhijit = D.polarToEcliptic(266 + 40 / 60, 60);
  near(abhijit.lambda, 264.1032, 1e-3, 'Abhijit');
  const citra = D.polarToEcliptic(180, -2);
  near(citra.lambda, 180.8130, 1e-3, 'Citrā');
  for (const n of ['Puṣya', 'Maghā', 'Revatī']) {
    const s = byName[n]; const e = D.polarToEcliptic(lp(s), 0);
    angNear(e.lambda, lp(s), 1e-9, `${n}: zero vikṣepa, dhruvaka = longitude`);
  }
  // 8.15: a planet is compared with a star by POLAR longitude — a planet on Svātī's circle through the dhruva, at latitude 2°N,
  // has a dhruvaka of 199° although its ecliptic longitude is not 199°:
  const q = D.polarToEquatorial(199, 2), e = D.equatorialToEcliptic(q.alpha, q.delta);
  angNear(D.eclipticToPolar(e.lambda, e.beta).dhruvaka, 199, 1e-9, 'same circle, same dhruvaka');
  assert.ok(Math.abs(e.lambda - 199) > 0.5, 'but a different ecliptic longitude');
});

test('[SS 8.1 + 12.73] at a zero ayanāṃśa Citrā crosses the meridian with the autumn equinox, and her declination is her vikṣepa', () => {
  const q = D.polarToEquatorial(180, -2);
  angNear(q.alpha, 180, 1e-12, 'α(Citrā)'); near(q.delta, -2, 1e-12, 'δ(Citrā)');
  // a star's transit is the transit of its dhruvaka point: same α for any vikṣepa
  for (const bp of [-80, 0, 37, 60]) angNear(D.polarToEquatorial(199, bp).alpha, D.polarToEquatorial(199, 0).alpha, 1e-12, 'one circle, one transit');
  const m = D.meridianAltitudes(q.delta, 10 + 51 / 60);
  near(m.upper, 90 - 12.85, 1e-9, 'Citrā\'s noon-line altitude at Parameśvara\'s village (10°51′)');
});

// The sphere as dhruva.js computed it at commit 68905b9, copied verbatim, before the A1 guards: the reference for bit identity.
const OLD = (() => {
  const D2R = Math.PI / 180, R2D = 180 / Math.PI, norm = (x) => ((x % 360) + 360) % 360;
  const eps = (e) => (e === undefined ? D.SS_EPSILON_DEG : e) * D2R;
  function eclipticToEquatorial(lambda, beta, epsilon) {
    const e = eps(epsilon), l = lambda * D2R, b = beta * D2R;
    const sd = Math.sin(b) * Math.cos(e) + Math.cos(b) * Math.sin(e) * Math.sin(l);
    const a = Math.atan2(Math.sin(l) * Math.cos(e) - Math.tan(b) * Math.sin(e), Math.cos(l));
    return { alpha: norm(a * R2D), delta: Math.asin(Math.max(-1, Math.min(1, sd))) * R2D };
  }
  function equatorialToEcliptic(alpha, delta, epsilon) {
    const e = eps(epsilon), a = alpha * D2R, d = delta * D2R;
    const sb = Math.sin(d) * Math.cos(e) - Math.cos(d) * Math.sin(e) * Math.sin(a);
    const l = Math.atan2(Math.sin(a) * Math.cos(e) + Math.tan(d) * Math.sin(e), Math.cos(a));
    return { lambda: norm(l * R2D), beta: Math.asin(Math.max(-1, Math.min(1, sb))) * R2D };
  }
  function polarToEquatorial(dhruvaka, vikshepa, epsilon) {
    const e = eps(epsilon), lp = dhruvaka * D2R;
    const alpha = norm(Math.atan2(Math.sin(lp) * Math.cos(e), Math.cos(lp)) * R2D);
    const deltaPoint = Math.asin(Math.sin(e) * Math.sin(lp)) * R2D;
    const delta = deltaPoint + vikshepa;
    if (Math.abs(delta) > 90) throw new RangeError('past the dhruva');
    return { alpha, delta };
  }
  function equatorialToPolar(alpha, delta, epsilon) {
    const e = eps(epsilon), a = alpha * D2R;
    const dhruvaka = norm(Math.atan2(Math.sin(a), Math.cos(a) * Math.cos(e)) * R2D);
    const deltaPoint = Math.asin(Math.sin(e) * Math.sin(dhruvaka * D2R)) * R2D;
    return { dhruvaka, vikshepa: delta - deltaPoint };
  }
  const meridianAltitudes = (delta, latitude) => ({ upper: 90 - Math.abs(latitude - delta), lower: latitude + delta - 90 });
  return { eclipticToEquatorial, equatorialToEcliptic, polarToEquatorial, equatorialToPolar, meridianAltitudes };
})();

test('[PHYSICAL DOMAIN] the sphere refuses non-finite inputs, latitudes and declinations beyond ±90° and an obliquity outside (0°, 90°); inside the domain every result is 68905b9\'s, bit for bit', () => {
  // bit identity on a grid, with the text's ε and with owner-measured ones
  let n = 0;
  for (const e of [undefined, 23.5, 23.44, 0.001, 89.999]) {
    for (let x = -725; x <= 725; x += 13.7) {
      for (const y of [-90, -89.99, -61.3, -23.97, -2, 0, 1e-9, 5.15, 37, 60, 89.5, 90]) {
        assert.deepStrictEqual(D.eclipticToEquatorial(x, y, e), OLD.eclipticToEquatorial(x, y, e));
        assert.deepStrictEqual(D.equatorialToEcliptic(x, y, e), OLD.equatorialToEcliptic(x, y, e));
        assert.deepStrictEqual(D.equatorialToPolar(x, y, e), OLD.equatorialToPolar(x, y, e));
        let old = null; try { old = OLD.polarToEquatorial(x, y, e); } catch { /* past the dhruva: both refuse */ }
        if (old === null) assert.throws(() => D.polarToEquatorial(x, y, e), RangeError); else assert.deepStrictEqual(D.polarToEquatorial(x, y, e), old);
        n += 4;
      }
    }
  }
  for (let d = -90; d <= 90; d += 7.3) for (let p = -90; p <= 90; p += 11.1) { assert.deepStrictEqual(D.meridianAltitudes(d, p), OLD.meridianAltitudes(d, p)); n++; }
  assert.ok(n > 20000, `${n} comparisons`);
  // refusals
  const fns = [['eclipticToEquatorial', 2], ['equatorialToEcliptic', 2], ['polarToEquatorial', 2], ['equatorialToPolar', 2], ['eclipticToPolar', 2], ['polarToEcliptic', 2], ['meridianAltitudes', 2]];
  for (const [f, k] of fns) {
    for (const bad of [NaN, Infinity, -Infinity, undefined, null, '10', 10n]) {
      for (let i = 0; i < k; i++) { const args = [10, 20]; args[i] = bad; assert.throws(() => D[f](...args), TypeError, `${f} argument ${i} = ${String(bad)}`); }
    }
  }
  for (const f of ['eclipticToEquatorial', 'equatorialToEcliptic', 'polarToEquatorial', 'equatorialToPolar', 'eclipticToPolar', 'polarToEcliptic']) {
    for (const e of [0, 90, -1, 100, -23.5]) assert.throws(() => D[f](10, 20, e), RangeError, `${f} ε ${e}`);
    for (const e of [NaN, Infinity, null, '23.5']) assert.throws(() => D[f](10, 20, e), TypeError, `${f} ε ${String(e)}`);
  }
  for (const f of ['eclipticToEquatorial', 'equatorialToEcliptic', 'equatorialToPolar', 'eclipticToPolar']) {
    assert.throws(() => D[f](10, 90.0001), RangeError, `${f}: latitude/declination past 90°`);
    assert.throws(() => D[f](10, -91), RangeError, `${f}: −91°`);
  }
  assert.throws(() => D.meridianAltitudes(10, 100), RangeError, 'a latitude of 100°');
  assert.throws(() => D.meridianAltitudes(-95, 23), RangeError, 'a declination of −95°');
  assert.throws(() => D.polarToEquatorial(90, 80), RangeError, 'past the dhruva (unchanged)');
});
