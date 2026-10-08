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

test('[SS 12.72-12.73] the dhruva\'s elevation is the mean of a circumpolar star\'s two meridian altitudes — whatever the star\'s distance from it', () => {
  for (const phi of [0, 39060, 83448, 360000]) {                     // 0°, 10°51′, 23°10′48″, 100° (any integer arcseconds)
    for (const p of [0, 2340, 2399, 36000, 123457]) {               // the star's distance from the dhruva: unknown to the observer
      const r = D.dhruvaFromCulminations({ upper: phi + p, lower: phi - p });
      assert.equal(r.elevation.num, BigInt(2 * phi)); assert.equal(r.elevation.den, 2n);
      assert.equal(r.polarDistance.num, BigInt(2 * p));
    }
  }
  // SS 12.43-12.44: at the equator the two dhruvas lie on the horizon — elevation 0
  assert.equal(D.dhruvaFromCulminations({ upper: 2340, lower: -2340 }).elevation.num, 0n);
  assert.throws(() => D.dhruvaFromCulminations({ upper: 1, lower: 2 }), RangeError);
  assert.throws(() => D.dhruvaFromCulminations({ upper: 1.5, lower: 0 }), TypeError);
});

test('[EXACT] true north is the midpoint of the two greatest elongations; a mis-set north line is found, not assumed', () => {
  const c = 437;                                                    // the provisional line is 7′17″ off — unknown to the observer
  const half = 2400;                                                // the star's elongation either side of true north
  const r = D.northFromElongations({ east: half - c, west: -half - c });
  assert.equal(r.num, BigInt(-2 * c)); assert.equal(r.den, 2n);    // true north sits at −c on the provisional scale
});

test('[EXACT] obliquity and latitude from the two solstitial noon zenith distances, also where the summer Sun passes north of the zenith', () => {
  for (const [phi, eps] of [[39060, 86313], [83448, 86313], [100000, 84000], [0, 86400]]) {
    const r = D.fromSolsticeZenithDistances({ summer: phi - eps, winter: phi + eps });
    assert.equal(r.epsilon.num, BigInt(2 * eps)); assert.equal(r.latitude.num, BigInt(2 * phi));
  }
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
