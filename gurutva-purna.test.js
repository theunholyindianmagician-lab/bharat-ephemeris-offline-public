'use strict';
/*
 * gurutva-purna.test.js — the owner's complete force law (dop853-nbody.js evalRhs, all blocks), seeded from the text
 * (gurutva-purna.js), and the derivations inside that law checked on their own terms.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
const NB = require('./dop853-nbody.js');
const GP = require('./gurutva-purna.js');
const GPC = require('./gurutva-purna-candra.js');
const corpus = JSON.parse(fs.readFileSync(path.join(__dirname, 'corpus', 'gurutva', 'purna.json'), 'utf8'));
const AS = 180 / Math.PI * 3600, CY = 36525;

test('block 8: T = −ṅa/3 from Gauss (da/dt = 2T/n, n ∝ a^−3/2) gives back ṅ and a recession of 3.82 cm a year', () => {
  const a = 384400 / NB.AU_KM, n = Math.sqrt((NB.STANDARD_GM[3] + NB.STANDARD_GM[4]) / a ** 3);
  const adot = 2 * NB.T_TIDE_MOON / n;
  assert.ok(Math.abs(-1.5 * n * adot / a * AS * CY * CY - NB.NDOT_MOON_RAD_DAY2 * AS * CY * CY) < 1e-9);
  assert.ok(Math.abs(adot * NB.AU_KM * 1e5 * 365.25 - 3.82) < 0.01, 'cm per year');
});

test('blocks 4 and 7: the J2 formula is minus the gradient of its potential; the C22 term is the (2,2) potential\'s pull on its axis', () => {
  const gm = 1, J2 = 1e-3, R = 0.3, pole = [0.2, -0.3, Math.sqrt(0.87)], h = 1e-6;
  const P2 = (x) => { const r = Math.hypot(...x), s = (x[0] * pole[0] + x[1] * pole[1] + x[2] * pole[2]) / r; return gm * J2 * R * R / r ** 3 * (1.5 * s * s - 0.5); };
  const x = [0.7, 0.4, -0.5], num = [0, 1, 2].map((k) => { const p = x.slice(), m = x.slice(); p[k] += h; m[k] -= h; return -(P2(p) - P2(m)) / (2 * h); });
  const r = Math.hypot(...x), u = x.map((c) => c / r), s = u[0] * pole[0] + u[1] * pole[1] + u[2] * pole[2], f = -1.5 * gm * J2 * R * R / r ** 4;
  const own = [0, 1, 2].map((k) => f * ((1 - 5 * s * s) * u[k] + 2 * s * pole[k]));            // the formula in dop853-nbody.js j2Accel
  for (let k = 0; k < 3; k++) assert.ok(Math.abs(own[k] - num[k]) < 1e-9 * Math.hypot(...num));
  const C22 = 2e-5, d = 2;
  const P22 = (y) => { const rr = Math.hypot(...y), c = (y[0] ** 2 + y[1] ** 2) / rr ** 2, c2 = (y[0] ** 2 - y[1] ** 2) / (y[0] ** 2 + y[1] ** 2); return -3 * gm * R * R * C22 / rr ** 3 * c * c2; };
  const gx = -(P22([d + h, 0, 0]) - P22([d - h, 0, 0])) / (2 * h);
  assert.ok(Math.abs(gx - (-9 * gm * C22 * R * R / d ** 4)) < 1e-12);
});

test('the system seeded from the text: Kepler III from the text\'s periods puts the planets where they are; momentum is zero', () => {
  const s = GP.system(1872855, corpus.fitted.initialOsculating && { a: corpus.fitted.initialOsculating.aAU, e: corpus.fitted.initialOsculating.e,
    i: corpus.fitted.initialOsculating.iDeg * Math.PI / 180, node: corpus.fitted.initialOsculating.nodeDeg * Math.PI / 180,
    peri: corpus.fitted.initialOsculating.perigeeDeg * Math.PI / 180, L: corpus.fitted.initialOsculating.meanLongitudeDeg * Math.PI / 180 });
  const dist = (i) => Math.hypot(...s.pos[i].map((c, k) => c - s.pos[0][k]));
  const want = { mercury: [0.30, 0.47], venus: [0.71, 0.74], earth: [0.98, 1.02], mars: [1.38, 1.67], jupiter: [4.95, 5.46], saturn: [9.0, 10.1] };
  for (const [k, [lo, hi]] of Object.entries(want)) assert.ok(dist(GP.IDX[k]) > lo && dist(GP.IDX[k]) < hi, `${k} at ${dist(GP.IDX[k])} AU`);
  const P = [0, 1, 2].map((k) => s.gm.reduce((acc, g, i) => acc + g * s.vel[i][k], 0));
  assert.ok(Math.hypot(...P) < 1e-18);
});

test('20 years under the full law from the stored start: apogee and node near the text, the tide recovered, planets a small share', () => {
  const el = (() => { const o = corpus.fitted.initialOsculating, r = Math.PI / 180; return { a: o.aAU, e: o.e, i: o.iDeg * r, node: o.nodeDeg * r, peri: o.perigeeDeg * r, L: o.meanLongitudeDeg * r }; })();
  const full = GP.rates(GP.run(1872855, el, 20 * 365.25));
  assert.ok(Math.abs(full.apogeeRatio - 1) < 0.004, `apogee ${full.apogeePerYuga}`);
  assert.ok(Math.abs(full.nodeRatio - 1) < 0.002, `node ${full.nodePerYuga}`);
  const tide = GP.tidalCheck(1872855, el, 20);
  assert.ok(Math.abs(tide.ndotArcsecPerCy2 / tide.owner - 1) < 0.05, `ṅ recovered ${tide.ndotArcsecPerCy2}`);
  const bare = GP.rates(GP.run(1872855, el, 20 * 365.25, { planets: false }));
  assert.ok(Math.abs(full.arcsecPerYear.apogee - bare.arcsecPerYear.apogee) < 3, 'planets move the apogee by a few arcseconds a year at most');
});

test('the stored derivation: the text\'s apogee rate implies an inclination near 5.15°, at which the node agrees within 0.05%', () => {
  const imp = corpus.impliedByTheTextsApogeeRate;
  assert.ok(imp.meanInclinationDeg > 5.05 && imp.meanInclinationDeg < 5.25, `${imp.meanInclinationDeg}`);
  assert.ok(Math.abs(imp.apogeeRatio - 1) < 1e-5);
  assert.ok(Math.abs(imp.nodeRatio - 1) < 5e-4, `${imp.nodeRatio}`);
  assert.ok(Math.abs(corpus.tidalCheck.ndotRecoveredArcsecPerCy2 / corpus.tidalCheck.ndotInTheLawArcsecPerCy2 - 1) < 0.03);
});

test('the generated module is the corpus series, unedited, and the full law has the parallactic term the tidal limit lacks', () => {
  assert.deepEqual(GPC.LON.map((r) => [r.slice(0, 4), r[4], r[5]]), corpus.series.longitude.map((x) => [x.arg, x.sin, x.cos]));
  assert.deepEqual(GPC.LAT.map((r) => [r.slice(0, 4), r[4], r[5]]), corpus.series.latitude.map((x) => [x.arg, x.sin, x.cos]));
  const D = corpus.series.longitude.find((x) => x.name === 'D');
  assert.ok(Math.abs(D.sin) > 0.02, `parallactic ${D.sin}°`);
});
