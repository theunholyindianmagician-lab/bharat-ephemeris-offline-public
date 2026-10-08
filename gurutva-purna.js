/* gurutva-purna.js — the owner's COMPLETE n-body force law, with every starting state taken from the Sūrya-Siddhānta.
 *
 * The law is the owner's, unchanged: dop853-nbody.js `evalRhs` (Bhārat Sovereign Engine) —
 *   1 Newtonian n-body (the Sun's full differential pull, so the parallactic inequality too, and the planets);
 *   2 EIH first post-Newtonian terms (Moyer 4-26), which carry the geodetic (de Sitter) precession of the lunar orbit;
 *   3 2PN Schwarzschild + solar Lense–Thirring;  4 the Earth's J2 on the Moon about the Earth's pole;
 *   6 2.5PN damping;  7 the lunar figure, J2m and C22m (C22 by differentiating the (2,2) potential);
 *   8 the tidal acceleration T = −ṅ·a/3 along the Moon's velocity (Gauss: da/dt = 2T/n, n ∝ a^−3/2 ⇒ ṅ = −3T/a).
 * Integrated by the owner's Gauss–Radau method (radau.js).
 *
 * Seeded from the text (sovereign): the Sun's (Earth–Moon barycentre's) orbit from its revolutions, apogee and equation;
 * the five planets from their revolutions (outer: the mean planet; Mercury and Venus: the śīghrocca, SS 1.30-1.32), apsides
 * and nodes per kalpa (1.41-1.44, nodes westward), manda epicycles (2.35, first harmonic = 2e − e³/4) and greatest
 * latitudes (1.68-1.70: Mars 90′, Mercury 120′, Jupiter 60′, Venus 120′, Saturn 120′, read as heliocentric inclinations
 * [reading]); the Moon fitted to the text exactly as in gurutva.js; the equinox placed by the text's ayanāṃśa (3.9-3.10).
 * Borrowed (the constants of the owner's force law, which the text does not give; the owner's AUDIT30 D2 table calls
 * them BORROWED): the gravitational parameters, the Earth's J2 and radius, the lunar figure, ṅ, c, the AU in km. Their
 * values are read from dop853-nbody.js, not restated here. Distances follow from the text's periods by Kepler III.
 * Not in the text and so absent: Uranus, Neptune, Pluto. Time: civil days since the Kali epoch, as the text counts them.
 * This file is OUTSIDE the sovereign set of kala-dvara.test.js because it loads the owner's force file and its constants.
 */
'use strict';
const NB = require('./dop853-nbody.js');
const S = require('./sphuta.js').withSine('table');                       // seeded from the text as written (its sine table)
const Rd = require('./radau.js');
const G = require('./gurutva.js');

const TAU = 2 * Math.PI, D2R = Math.PI / 180, R2D = 180 / Math.PI;
const mod = (a, m) => ((a % m) + m) % m, wrapPi = (a) => mod(a + Math.PI, TAU) - Math.PI;
const YUGA = Number(S.YUGA_DAYS), KALPA_YEARS = 4320000000, YEARS_GONE_AT_KALI = 1955880000;
const OBL = 84381.406 / 3600 * D2R;                       // the owner's force law places its lunar pole with this obliquity
const IDX = Object.freeze({ sun: 0, mercury: 1, venus: 2, earth: 3, moon: 4, mars: 5, jupiter: 6, saturn: 7 });
const GM = NB.STANDARD_GM.slice(0, 8);

// The text's five planets: revolutions in a yuga of the heliocentric mean (SS 1.30-1.32), apsis and node revolutions per kalpa
// (1.41-1.44), manda epicycle ends (2.35), greatest latitude in minutes (1.68-1.70).
const PLANETS = Object.freeze({
  mars: { rev: 2296832, apsis: 204, node: 214, manda: [75, 72], lat: 90 },
  mercury: { rev: 17937060, apsis: 368, node: 488, manda: [30, 28], lat: 120 },
  jupiter: { rev: 364220, apsis: 900, node: 174, manda: [33, 32], lat: 60 },
  venus: { rev: 7022376, apsis: 535, node: 903, manda: [12, 11], lat: 120 },
  saturn: { rev: 146568, apsis: 39, node: 662, manda: [49, 48], lat: 120 },
});

const eFromHarmonic = (cDeg) => { const c = cDeg * D2R; let e = c / 2; for (let i = 0; i < 20; i++) e = (c + e * e * e / 4) / 2; return e; };
/** Heliocentric mean longitude (deg) of a body with R revolutions a yuga, at Kali day t: frac(R·(1811/4 + t/yuga)); R·1811/4 is whole for all five. */
const meanLon = (R, t) => { const w = Math.floor(t); const k = (BigInt(R) * BigInt(w)) % S.YUGA_DAYS; return mod((Number(k) + R * (t - w)) / YUGA * 360, 360); };
/** Apsis or node (deg) from revolutions per kalpa; nodes move westward (1.44). */
const perKalpa = (rev, t, westward) => { const yrs = YEARS_GONE_AT_KALI + t / (YUGA / 4320000); const f = mod(rev * (yrs / KALPA_YEARS), 1) * 360; return westward ? mod(-f, 360) : f; };

/** Text ecliptic (sidereal) → the owner's equatorial frame: add the text's ayanāṃśa, then tilt by OBL about the equinox. */
function frame(ayanamshaDeg) {
  const a = ayanamshaDeg * D2R, ca = Math.cos(a), sa = Math.sin(a), ce = Math.cos(OBL), se = Math.sin(OBL);
  const toEq = (v) => { const x = v[0] * ca - v[1] * sa, y = v[0] * sa + v[1] * ca, z = v[2]; return [x, y * ce - z * se, y * se + z * ce]; };
  const toEcl = (v) => { const x = v[0], y = v[1] * ce + v[2] * se, z = -v[1] * se + v[2] * ce; return [x * ca + y * sa, -x * sa + y * ca, z]; };
  return { toEq, toEcl };
}

/** The whole text-seeded system at Kali day `epoch`, with the Moon's osculating geocentric elements `moonEl` (radians, a in AU). */
function system(epoch, moonEl, opts = {}) {
  const m = S.madhyama(S.spandasOfDays(epoch)), A = S.ayanamshaSS(S.spandasOfDays(epoch)), F = frame(A);
  const pos = Array.from({ length: 8 }, () => [0, 0, 0]), vel = Array.from({ length: 8 }, () => [0, 0, 0]);
  const gm = GM.slice();
  // Earth–Moon barycentre: the Sun's geocentric orbit reversed. n′ from 1.29/1.37, e′ from the Sun's equation, apogee from 1.41.
  const muS = gm[0] + gm[3] + gm[4], nS = TAU * 4320000 / YUGA, aS = Math.cbrt(muS / (nS * nS));
  const sunGeo = G.toState({ a: aS, e: G.INPUTS.eSun, i: 0, node: 0, peri: (m.sunApogee + 180) * D2R, L: m.sun * D2R }, muS);
  const emb = { x: sunGeo.x.map((c) => -c), v: sunGeo.v.map((c) => -c) };
  // Moon about the Earth
  const muEM = gm[3] + gm[4], moon = G.toState(moonEl, muEM), f = gm[4] / muEM;
  const earthR = emb.x.map((c, k) => c - f * moon.x[k]), earthV = emb.v.map((c, k) => c - f * moon.v[k]);
  pos[3] = earthR; vel[3] = earthV; pos[4] = earthR.map((c, k) => c + moon.x[k]); vel[4] = earthV.map((c, k) => c + moon.v[k]);
  // planets
  for (const [name, p] of Object.entries(PLANETS)) {
    const i = IDX[name];
    const n = TAU * p.rev / YUGA, mu = gm[0] + gm[i], a = Math.cbrt(mu / (n * n));
    const e = eFromHarmonic(G.firstHarmonic(p.manda));
    const st = G.toState({ a, e, i: p.lat / 60 * D2R, node: perKalpa(p.node, epoch, true) * D2R, peri: (perKalpa(p.apsis, epoch, false) + 180) * D2R, L: meanLon(p.rev, epoch) * D2R }, mu);
    pos[i] = st.x; vel[i] = st.v;
    if (opts.planets === false) gm[i] = 0;              // kept on their orbits, without mass
  }
  // every state above is heliocentric (the Sun at rest at the origin); shift ALL bodies so the centre of mass is at rest
  // at the origin — this keeps each heliocentric state exactly as the text set it
  let M = 0; const P = [0, 0, 0], C = [0, 0, 0];
  for (let i = 0; i < 8; i++) { M += gm[i]; for (let k = 0; k < 3; k++) { P[k] += gm[i] * vel[i][k]; C[k] += gm[i] * pos[i][k]; } }
  for (let i = 0; i < 8; i++) for (let k = 0; k < 3; k++) { pos[i][k] -= C[k] / M; vel[i][k] -= P[k] / M; }
  return { pos: pos.map(F.toEq), vel: vel.map(F.toEq), gm, frame: F, ayanamsha: A };
}

/** Integrate the system for `days`; return the geocentric Moon's samples in the text's frame, reduced like gurutva.js. */
function run(epoch, moonEl, days, opts = {}) {
  const sys = system(epoch, moonEl, opts), n = 8, dim = 3 * n;
  const x0 = new Float64Array(dim), v0 = new Float64Array(dim);
  for (let i = 0; i < n; i++) { x0.set(sys.pos[i], 3 * i); v0.set(sys.vel[i], 3 * i); }
  const y = new Float64Array(2 * dim), dy = new Float64Array(2 * dim);
  const force = { relativistic: opts.relativistic !== false, lunarFigure: opts.lunarFigure !== false, lunarTide: opts.lunarTide !== false, t: 0 };
  const accel = (xx, vv, t, out) => { y.set(xx, 0); y.set(vv, dim); force.t = t; NB.evalRhs(y, sys.gm, dy, force); for (let i = 0; i < dim; i++) out[i] = dy[dim + i]; };
  // the owner's engine integrates with ε = 1e-9; 1e-10 here, with the step capped at 2 days
  const res = Rd.integrate(x0, v0, accel, days, { epsilon: opts.epsilon || 1e-10, maxStep: 2, sample: opts.sample || 1 });
  const muEM = sys.gm[3] + sys.gm[4];
  const t = [], lon = [], lat = [], peri = [], node = [], inc = [], ecc = [], sunLon = [];
  for (const s of res.samples) {
    const r = sys.frame.toEcl([s.x[12] - s.x[9], s.x[13] - s.x[10], s.x[14] - s.x[11]]), v = sys.frame.toEcl([s.v[12] - s.v[9], s.v[13] - s.v[10], s.v[14] - s.v[11]]);
    const o = G.osculating(r, v, muEM);
    const sg = sys.frame.toEcl([s.x[0] - s.x[9], s.x[1] - s.x[10], s.x[2] - s.x[11]]);
    t.push(s.t); lon.push(o.lon); lat.push(o.lat); peri.push(o.peri); node.push(o.node); inc.push(o.inc); ecc.push(o.e); sunLon.push(Math.atan2(sg[1], sg[0]));
  }
  const unwrap = (a) => { const out = [a[0]]; for (let i = 1; i < a.length; i++) out.push(out[i - 1] + wrapPi(a[i] - a[i - 1])); return out; };
  const U = unwrap(lon);
  return { ...G.analyse(t, U, lat, unwrap(peri), unwrap(node), epoch, { quadratic: opts.quadratic }), t, lonUnwrapped: U, sunLon: unwrap(sunLon),
    steps: res.steps, evaluations: res.evaluations, meanInc: inc.reduce((a, b) => a + b) / inc.length, meanEcc: ecc.reduce((a, b) => a + b) / ecc.length };
}

/** Fit the Moon's starting state to the text under the full law (same targets and update rules as gurutva.derive). */
function derive(opts = {}) {
  const epoch = opts.epoch ?? 1872855, m = G.madh(epoch), force = opts.force || {};
  const target = { lambda0: m.moon * D2R, perigee0: (m.moonApogee + 180) * D2R, node0: m.node * D2R, n: G.INPUTS.nMoon,
    syz: opts.syzygyEquation ?? G.INPUTS.moonHarmonicDeg, lat: opts.syzygyLatitude ?? G.INPUTS.latitudeDeg };
  const muEM = GM[3] + GM[4];
  let el = opts.start || { a: Math.cbrt(muEM / (target.n * target.n)), e: 0.0556, i: 4.68 * D2R, node: target.node0, peri: target.perigee0, L: target.lambda0 };
  const history = [];
  const step = (r) => ({ a: el.a * Math.pow(r.mean.n / target.n, 2 / 3), e: el.e * target.syz / r.syzygyEquation, i: el.i * target.lat / r.syzygyLatitude,
    node: el.node + wrapPi(target.node0 - r.mean.node0), peri: el.peri + wrapPi(target.perigee0 - r.mean.perigee0), L: el.L + wrapPi(target.lambda0 - r.mean.lambda0) });
  for (let k = 0; k < (opts.iterations ?? 6); k++) { const r = run(epoch, el, opts.fitDays || 3 * 365.25, force); history.push({ span: 3, n: r.mean.n / target.n - 1, syz: r.syzygyEquation, lat: r.syzygyLatitude }); el = step(r); }
  const years = opts.years || 74.4, refine = opts.refine ?? 2;
  let fin = null, elFin = el;
  for (let k = 0; k <= refine; k++) {
    fin = run(epoch, el, years * 365.25, force); elFin = el;
    history.push({ span: years, n: fin.mean.n / target.n - 1, syz: fin.syzygyEquation, lat: fin.syzygyLatitude });
    if (k < refine) el = step(fin);
  }
  return { epoch, initial: elFin, fin, history, rates: rates(fin), years };
}
const perYuga = (rate) => rate * YUGA / TAU;
function rates(r) {
  return { moonPerYuga: perYuga(r.mean.n), apogeePerYuga: perYuga(r.mean.perigeeRate), nodePerYuga: -perYuga(r.mean.nodeRate),
    apogeeRatio: perYuga(r.mean.perigeeRate) / Number(S.REV.moonApogee), nodeRatio: -perYuga(r.mean.nodeRate) / Number(S.REV.node),
    arcsecPerYear: { apogee: r.mean.perigeeRate * R2D * 3600 * 365.25, node: r.mean.nodeRate * R2D * 3600 * 365.25 } };
}
/** Each block's share: rerun the same starting state with blocks switched off. */
function variants(epoch, el, years) {
  const out = {};
  for (const [name, f] of [["full", {}], ["no tide (block 8)", { lunarTide: false }], ["no lunar figure (block 7)", { lunarFigure: false }],
    ["Newton only (blocks 2-8 off)", { relativistic: false }], ["no planets", { planets: false }]]) out[name] = rates(run(epoch, el, years * 365.25, f));
  return out;
}
/** The tidal block in a live integration: the same start with block 8 on and off; the difference in longitude is ½ṅt². */
function tidalCheck(epoch, el, years) {
  const on = run(epoch, el, years * 365.25, {}), off = run(epoch, el, years * 365.25, { lunarTide: false });
  const T = years * 365.25, rows = on.t.map((x) => [1, x / T, (x / T) ** 2]), d = on.lonUnwrapped.map((v, i) => v - off.lonUnwrapped[i]);
  const k = 3, A = Array.from({ length: k }, () => new Array(k).fill(0)), b = new Array(k).fill(0);
  rows.forEach((r, i) => { for (let p = 0; p < k; p++) { b[p] += r[p] * d[i]; for (let q = 0; q < k; q++) A[p][q] += r[p] * r[q]; } });
  for (let c = 0; c < k; c++) for (let r = c + 1; r < k; r++) { const f = A[r][c] / A[c][c]; for (let j = c; j < k; j++) A[r][j] -= f * A[c][j]; b[r] -= f * b[c]; }
  const x = [0, 0, 0]; for (let r = k - 1; r >= 0; r--) { let s2 = b[r]; for (let j = r + 1; j < k; j++) s2 -= A[r][j] * x[j]; x[r] = s2 / A[r][r]; }
  const ndot = 2 * x[2] / (T * T) * R2D * 3600 * 36525 * 36525;           // ″/cy²
  return { ndotArcsecPerCy2: ndot, owner: NB.NDOT_MOON_RAD_DAY2 * R2D * 3600 * 36525 * 36525, years };
}
/** The inclination the text's apogee rate implies under the full law (secant on the syzygy latitude). */
function impliedInclination(opts = {}) {
  const f = (lat) => { const d = derive({ years: 20, refine: 1, ...opts, syzygyLatitude: lat }); return { lat, d, g: d.rates.apogeeRatio - 1 }; };
  let a = f(G.INPUTS.latitudeDeg), b = f(G.INPUTS.latitudeDeg + 0.5);
  for (let k = 0; k < 3 && Math.abs(b.g) > 2e-6; k++) { const lat = b.lat - b.g * (b.lat - a.lat) / (b.g - a.g); a = b; b = f(lat); }
  return { syzygyLatitudeDeg: b.lat, meanInclinationDeg: b.d.fin.meanInc * R2D, ...b.d.rates };
}

module.exports = { IDX, PLANETS, GM, OBL, system, run, derive, rates, variants, tidalCheck, impliedInclination, meanLon, perKalpa, frame, eFromHarmonic };
