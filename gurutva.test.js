'use strict';
/*
 * gurutva.test.js — the Moon by gravitation from the Sūrya-Siddhānta's numbers alone (gurutva.js, radau.js,
 * gurutva-candra.js, corpus/gurutva/candra.json). The integrator proves itself on mathematics; the derivation is
 * re-run here and must give the stored series; the apogee and node rates are predictions set beside the text's.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
const Rd = require('./radau.js');
const G = require('./gurutva.js');
const GC = require('./gurutva-candra.js');
const P = require('./panchanga.js');
const S = require('./sphuta.js');
const K = require('./kala-dvara.js');
const corpus = JSON.parse(fs.readFileSync(path.join(__dirname, 'corpus', 'gurutva', 'candra.json'), 'utf8'));
const mod = (a, m) => ((a % m) + m) % m, w180 = (a) => mod(a + 180, 360) - 180;

test('the Radau nodes are the roots of P7 + P8, and the integrator closes a Kepler ellipse after 100 turns', () => {
  const leg = (n, x) => { let p0 = 1, p1 = x; for (let k = 2; k <= n; k++) { const p2 = ((2 * k - 1) * x * p1 - (k - 1) * p0) / k; p0 = p1; p1 = p2; } return p1; };
  assert.equal(Rd.H.length, 8); assert.equal(Rd.H[0], 0);
  for (const h of Rd.H.slice(1)) assert.ok(Math.abs(leg(7, 2 * h - 1) + leg(8, 2 * h - 1)) < 1e-13);
  const acc = (x, v, t, o) => { const r = Math.hypot(x[0], x[1], x[2]), k = -1 / (r * r * r); o[0] = k * x[0]; o[1] = k * x[1]; o[2] = k * x[2]; };
  const e = 0.3, T = 2 * Math.PI * 100;
  const s = Rd.integrate([1 - e, 0, 0], [0, Math.sqrt((1 + e) / (1 - e)), 0], acc, T, { epsilon: 1e-10, maxStep: 0.5 }).samples.at(-1);
  assert.ok(Math.abs(s.x[0] - (1 - e)) < 1e-10 && Math.abs(s.x[1]) < 1e-10);
});

test('the tidal force is the limit of the Sun\'s full differential pull, with μ′ = n′²a′³ (Kepler III)', () => {
  const sun = G.sunModel(1872855), acc = G.makeAccel(0, sun), out = new Float64Array(3), n2 = G.INPUTS.nSun ** 2;
  const s = sun(0), A = 1e4, mu = n2 * A ** 3;                       // the Sun's mean distance A in units of the Moon's
  const Rm0 = A * Math.cbrt(n2 / s.k), Rv = [s.ux * Rm0, s.uy * Rm0, 0];   // its distance now, from (a′/R)³ = k/n′²
  const x = [0.6, -0.7, 0.1];
  acc(x, [0, 0, 0], 0, out);
  const d = [Rv[0] - x[0], Rv[1] - x[1], Rv[2] - x[2]], dm = Math.hypot(...d), Rm = Math.hypot(...Rv);
  const exact = [0, 1, 2].map((k) => mu * (d[k] / dm ** 3 - Rv[k] / Rm ** 3));
  for (let k = 0; k < 3; k++) assert.ok(Math.abs(out[k] - exact[k]) < 1e-3 * Math.hypot(...exact), `component ${k}`);
});

test('from the text alone, Newton turns the apogee and the node at the text\'s rates within 0.3% and 0.15%', () => {
  const d = G.derive({ years: 18.6, refine: 1 });
  assert.ok(Math.abs(d.syzygyEquation - G.INPUTS.moonHarmonicDeg) < 0.02, `syzygy equation ${d.syzygyEquation}`);
  assert.ok(Math.abs(d.syzygyLatitude - 4.5) < 0.005, `syzygy latitude ${d.syzygyLatitude}`);
  assert.ok(Math.abs(d.rates.moonPerYuga / 57753336 - 1) < 2e-5, `mean motion ${d.rates.moonPerYuga}`);
  assert.ok(Math.abs(corpus.rates.moonPerYuga / 57753336 - 1) < 1e-6, 'the stored 74-year derivation holds the text\'s mean motion');
  assert.ok(Math.abs(d.rates.apogeeRatio - 1) < 0.003, `apogee ${d.rates.apogeePerYuga}`);
  assert.ok(Math.abs(d.rates.nodeRatio - 1) < 0.0015, `node ${d.rates.nodePerYuga}`);
  const D = d.lon.find((x) => x.name === 'D');
  assert.ok(Math.hypot(D.sin, D.cos) < 0.002, 'no parallactic term in the tidal limit');
  for (const x of corpus.series.longitude.concat(corpus.series.latitude)) if (Math.abs(x.sin) > 0.05) {
    const y = d.lon.concat(d.lat).find((z) => z.name === x.name && (corpus.series.longitude.includes(x) ? d.lon.includes(z) : d.lat.includes(z)));
    assert.ok(Math.abs(y.sin - x.sin) < 0.012, `${x.name}: ${y.sin} vs stored ${x.sin}`);
  }
});

test('the text\'s own apogee rate implies an inclination of 5.15°, and the same orbit then turns the node within 0.05%', () => {
  const imp = corpus.impliedByTheTextsApogeeRate;
  assert.ok(imp.meanInclinationDeg > 5.1 && imp.meanInclinationDeg < 5.2);
  const d = G.derive({ years: 20, refine: 1, syzygyLatitude: imp.syzygyLatitudeDeg });
  assert.ok(Math.abs(d.rates.apogeeRatio - 1) < 2e-5, `apogee ${d.rates.apogeeRatio}`);
  assert.ok(Math.abs(d.rates.nodeRatio - 1) < 5e-4, `node ${d.rates.nodeRatio}`);
});

test('the generated module is the corpus series, unedited', () => {
  assert.deepEqual(GC.LON.map((r) => [r.slice(0, 4), r[4], r[5]]), corpus.series.longitude.map((x) => [x.arg, x.sin, x.cos]));
  assert.deepEqual(GC.LAT.map((r) => [r.slice(0, 4), r[4], r[5]]), corpus.series.latitude.map((x) => [x.arg, x.sin, x.cos]));
  assert.deepEqual(GC.RATES, corpus.rates);
});

test('in the pañcāṅga the gravitational Moon keeps the syzygies and moves the quarters', () => {
  const PG = P.withPlaces(GC.placesAt, 'gurutva');
  assert.equal(PG.moonModel, 'gurutva'); assert.equal(P.moonModel, 'sūrya-siddhānta');
  const t1 = K.kaliDayFromCivil({ calendar: 'gregorian', year: 2026, month: 1, day: 1 });
  let maxQuarter = 0, t = t1;
  for (let k = 0; k < 24; k++) {
    const a = P.syzygyNear(t, (k % 2) * 180, +1), g = PG.syzygyNear(a - 1, (k % 2) * 180, +1);
    assert.ok(Math.abs(g - a) < 1 / 24, `syzygy ${k} moves ${((g - a) * 1440).toFixed(0)} min`);
    const q = P.syzygyNear(a, (k % 2) * 180 + 90, +1);
    maxQuarter = Math.max(maxQuarter, Math.abs(w180(GC.placesAt(q).moon - S.sphutaAtDays(q).moon)));
    t = a + 5;
  }
  assert.ok(maxQuarter > 1.5, `at the quarters the Moons differ by up to ${maxQuarter.toFixed(2)}°`);
});
