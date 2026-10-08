/* gurutva.js — गुरुत्व: the Moon by gravitation, with every number taken from the Sūrya-Siddhānta.
 *
 * The law: the LEADING TERM ONLY of the owner's n-body force law (block 1 of the Bhārat Sovereign Engine's
 * dop853-nbody.js), in its tidal limit — the Earth's pull on the Moon and the Sun's tide — integrated by the owner's
 * Gauss–Radau method (radau.js). This is the text-only tier: nothing but the text enters. The owner's COMPLETE law
 * (all eight blocks: full n-body with the planets, EIH, J2, the lunar figure, the tidal acceleration T = −ṅa/3) runs
 * in gurutva-purna.js with the law's own borrowed constants; against this file it moves the apogee and node by about
 * 5″ a year and adds the parallactic term (−2.1′), see corpus/gurutva/purna.json.
 * The numbers: nothing but the text. In the tidal limit the Sun acts on the Moon only through n′² (a′/R)³, and by
 * Kepler's third law n′² a′³ is the Sun's gravitational parameter — so the Sun's mass and distance are not needed,
 * only its mean motion and the shape of its orbit, both of which the text gives:
 *   n, n′          the Moon's and Sun's revolutions in a yuga (SS 1.29-1.30) over its civil days (1.37);
 *   e′             from the Sun's manda equation (2.34-2.39), its first harmonic = 2e′ − e′³/4;
 *   the Sun's apogee, and the Moon's mean place, apogee and node at the epoch (1.41-1.47 via sphuta.js);
 *   the Moon's equation and greatest latitude (2.34-2.39, 270′ of 1.68) — read as SYZYGY values, the places at
 *   which the text's Moon was fixed by eclipses: at a syzygy the evection subtracts from the equation of centre and
 *   the 2D−F term from the inclination, so the fit sets (sin M) − (sin 2D−M) to the text's equation and
 *   (sin F) − (sin 2D−F) to 4°30′ [reading].
 * What is NOT input, and comes out of Newton's law: how fast the apogee and the node turn, and every periodic term
 * the text does not have (evection, variation, annual equation, reduction to the ecliptic, and the latitude terms).
 * The apogee and node rates can then be set beside the text's 488,203 and 232,238 revolutions in a yuga (1.33).
 * Left out, and why: the parallactic inequality needs the ratio of the Moon's distance to the Sun's, and the text's
 * kakṣās are orbits of equal linear speed, not distances; the planets' pulls need masses the text does not give.
 * Frame: the text's sidereal ecliptic, fixed. Time: civil days since the Kali epoch.
 * Browser: window.Gurutva (needs Sphuta, Radau); node: module.exports.
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory(require("./sphuta.js").withSine("table"), require("./radau.js"));   // seeded from the text as written (its sine table)
  else root.Gurutva = factory(root.Sphuta.withSine("table"), root.Radau);
})(typeof globalThis !== "undefined" ? globalThis : this, function (S, Rd) {
  "use strict";
  const TAU = 2 * Math.PI, D2R = Math.PI / 180, R2D = 180 / Math.PI;
  const mod = (a, m) => ((a % m) + m) % m;
  const wrapPi = (a) => mod(a + Math.PI, TAU) - Math.PI;
  const YUGA = Number(S.YUGA_DAYS);
  const N_MOON = TAU * Number(S.REV.moon) / YUGA, N_SUN = TAU * Number(S.REV.sun) / YUGA;     // rad per civil day
  const TEXT_RATES = Object.freeze({ apogee: Number(S.REV.moonApogee), node: Number(S.REV.node), source: "SS 1.33 (revolutions in a yuga)" });

  /** First harmonic (degrees) of the text's manda equation as a function of the mean anomaly from perigee. */
  function firstHarmonic(pair) {
    let s = 0; const N = 7200;
    for (let k = 0; k < N; k++) { const M = (k + 0.5) / N * 360; s += S.mandaPhala(0, mod(180 - M, 360), pair).degrees * Math.sin(M * D2R); }
    return 2 * s / N;
  }
  const SUN_HARMONIC = firstHarmonic(S.PARIDHI.sun), MOON_HARMONIC = firstHarmonic(S.PARIDHI.moon);
  const E_SUN = (() => { const c = SUN_HARMONIC * D2R; let e = c / 2; for (let i = 0; i < 20; i++) e = (c + e * e * e / 4) / 2; return e; })();
  const LATITUDE = S.MOON_MAX_LATITUDE_ARCMIN / 60;
  const INPUTS = Object.freeze({ nMoon: N_MOON, nSun: N_SUN, eSun: E_SUN, sunHarmonicDeg: SUN_HARMONIC, moonHarmonicDeg: MOON_HARMONIC, latitudeDeg: LATITUDE,
    source: "SS 1.29-1.30, 1.37 (n, n′); 2.34-2.39 (equations); 1.68 (270′); epoch places from sphuta.js" });

  const madh = (t) => S.madhyama(S.spandasOfDays(t));

  // ── the force ─────────────────────────────────────────────────────────────────────────────────
  function sunModel(epoch, eSun = E_SUN) {
    const m = madh(epoch);
    const L0 = m.sun * D2R, peri = (m.sunApogee + 180) * D2R, e = eSun, q = Math.sqrt(1 - e * e);
    return (tRel) => {
      const M = L0 + N_SUN * tRel - peri;
      let E = M + e * Math.sin(M);
      for (let k = 0; k < 4; k++) E -= (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
      const r = 1 - e * Math.cos(E), nu = Math.atan2(q * Math.sin(E), Math.cos(E) - e), lon = peri + nu;
      return { ux: Math.cos(lon), uy: Math.sin(lon), k: N_SUN * N_SUN / (r * r * r), lon };
    };
  }
  /** Acceleration of the Moon about the Earth: −μ r/r³ + n′²(a′/R)³ [3(R̂·r)R̂ − r]. */
  function makeAccel(mu, sun) {
    return (x, v, t, out) => {
      const r2 = x[0] * x[0] + x[1] * x[1] + x[2] * x[2], r = Math.sqrt(r2), c = -mu / (r2 * r);
      const s = sun(t), d = s.ux * x[0] + s.uy * x[1];
      out[0] = c * x[0] + s.k * (3 * d * s.ux - x[0]);
      out[1] = c * x[1] + s.k * (3 * d * s.uy - x[1]);
      out[2] = c * x[2] - s.k * x[2];
    };
  }

  // ── elements ↔ state ──────────────────────────────────────────────────────────────────────────
  function toState(el, mu) {
    const M = el.L - el.peri, w = el.peri - el.node, e = el.e;
    let E = M + e * Math.sin(M); for (let k = 0; k < 30; k++) E -= (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
    const nu = Math.atan2(Math.sqrt(1 - e * e) * Math.sin(E), Math.cos(E) - e), r = el.a * (1 - e * Math.cos(E)), p = el.a * (1 - e * e), s = Math.sqrt(mu / p);
    const xo = r * Math.cos(nu), yo = r * Math.sin(nu), vxo = -s * Math.sin(nu), vyo = s * (e + Math.cos(nu));
    const cO = Math.cos(el.node), sO = Math.sin(el.node), ci = Math.cos(el.i), si = Math.sin(el.i), cw = Math.cos(w), sw = Math.sin(w);
    const P = [cO * cw - sO * sw * ci, sO * cw + cO * sw * ci, sw * si], Q = [-cO * sw - sO * cw * ci, -sO * sw + cO * cw * ci, cw * si];
    return { x: [0, 1, 2].map((k) => P[k] * xo + Q[k] * yo), v: [0, 1, 2].map((k) => P[k] * vxo + Q[k] * vyo) };
  }
  function osculating(x, v, mu) {
    const h = [x[1] * v[2] - x[2] * v[1], x[2] * v[0] - x[0] * v[2], x[0] * v[1] - x[1] * v[0]], hm = Math.hypot(...h), r = Math.hypot(x[0], x[1], x[2]);
    const node = Math.atan2(h[0], -h[1]), inc = Math.acos(h[2] / hm);
    const vxh = [v[1] * h[2] - v[2] * h[1], v[2] * h[0] - v[0] * h[2], v[0] * h[1] - v[1] * h[0]];
    const ev = [vxh[0] / mu - x[0] / r, vxh[1] / mu - x[1] / r, vxh[2] / mu - x[2] / r];
    const n = [Math.cos(node), Math.sin(node), 0], hh = h.map((c) => c / hm);
    const nxe = [n[1] * ev[2] - n[2] * ev[1], n[2] * ev[0] - n[0] * ev[2], n[0] * ev[1] - n[1] * ev[0]];
    const w = Math.atan2(nxe[0] * hh[0] + nxe[1] * hh[1] + nxe[2] * hh[2], n[0] * ev[0] + n[1] * ev[1]);
    return { node, inc, e: Math.hypot(...ev), peri: node + w, lon: Math.atan2(x[1], x[0]), lat: Math.asin(x[2] / r) };
  }

  // ── analysis ──────────────────────────────────────────────────────────────────────────────────
  const LON_ARGS = Object.freeze([[0, 1, 0, 0], [0, 2, 0, 0], [0, 3, 0, 0], [2, -1, 0, 0], [2, 0, 0, 0], [2, -2, 0, 0], [2, 1, 0, 0], [2, -3, 0, 0],
    [0, 0, 1, 0], [2, 0, -1, 0], [2, -1, -1, 0], [2, 0, 1, 0], [0, 1, -1, 0], [0, 1, 1, 0], [2, -1, 1, 0], [1, 0, 0, 0], [1, 1, 0, 0], [1, 0, 1, 0],
    [0, 0, 0, 2], [2, 0, 0, -2], [0, 1, 0, -2], [0, 1, 0, 2], [4, -1, 0, 0], [4, -2, 0, 0], [4, 0, 0, 0], [0, 0, 2, 0], [2, -2, -1, 0], [2, 1, -1, 0]]);
  const LAT_ARGS = Object.freeze([[0, 0, 0, 1], [0, 1, 0, 1], [0, 1, 0, -1], [2, 0, 0, -1], [2, -1, 0, 1], [2, -1, 0, -1], [2, 0, 0, 1], [0, 2, 0, 1],
    [0, 2, 0, -1], [2, 1, 0, -1], [2, -2, 0, -1], [2, 0, -1, -1], [0, 0, 1, 1], [0, 0, 1, -1], [0, 0, 0, 3], [2, -2, 0, 1]]);
  const NAME = (m) => { const s = []; ["D", "M", "M′", "F"].forEach((n, i) => { if (m[i]) s.push((m[i] < 0 ? "−" : s.length ? "+" : "") + (Math.abs(m[i]) > 1 ? Math.abs(m[i]) : "") + n); }); return s.join(""); };

  function solve(A, b) {               // Gaussian elimination with partial pivoting
    const n = b.length, M = A.map((r, i) => [...r, b[i]]);
    for (let c = 0; c < n; c++) {
      let p = c; for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
      [M[c], M[p]] = [M[p], M[c]];
      for (let r = c + 1; r < n; r++) { const f = M[r][c] / M[c][c]; if (f) for (let j = c; j <= n; j++) M[r][j] -= f * M[c][j]; }
    }
    const x = new Array(n).fill(0);
    for (let r = n - 1; r >= 0; r--) { let s = M[r][n]; for (let j = r + 1; j < n; j++) s -= M[r][j] * x[j]; x[r] = s / M[r][r]; }
    return x;
  }
  function lsq(rows, y) {
    const k = rows[0].length, A = Array.from({ length: k }, () => new Array(k).fill(0)), b = new Array(k).fill(0);
    for (let i = 0; i < rows.length; i++) { const r = rows[i]; for (let p = 0; p < k; p++) { b[p] += r[p] * y[i]; for (let q = p; q < k; q++) A[p][q] += r[p] * r[q]; } }
    for (let p = 0; p < k; p++) for (let q = 0; q < p; q++) A[p][q] = A[q][p];
    return solve(A, b);
  }
  const unwrap = (a) => { const out = [a[0]]; for (let i = 1; i < a.length; i++) out.push(out[i - 1] + wrapPi(a[i] - a[i - 1])); return out; };
  const linfit = (t, y) => { const c = lsq(t.map((x) => [1, x]), y); return { at0: c[0], rate: c[1] }; };

  /** Integrate a Moon from osculating elements at `epoch` for `days`, and reduce it to mean elements and series. */
  function run(el, mu, epoch, days, opts = {}) {
    const sun = sunModel(epoch, opts.eSun), st = toState(el, mu);
    const out = Rd.integrate(st.x, st.v, makeAccel(mu, sun), days, { epsilon: opts.epsilon || 1e-11, maxStep: 1, sample: opts.sample || 0.25 });
    const t = [], lon = [], lat = [], peri = [], node = [], inc = [], ecc = [], sunLon = [];
    for (const s of out.samples) {
      const o = osculating(s.x, s.v, mu);
      t.push(s.t); lon.push(o.lon); lat.push(o.lat); peri.push(o.peri); node.push(o.node); inc.push(o.inc); ecc.push(o.e); sunLon.push(sun(s.t).lon);
    }
    return { ...analyse(t, unwrap(lon), lat, unwrap(peri), unwrap(node), epoch), steps: out.steps, evaluations: out.evaluations, meanInc: inc.reduce((a, b) => a + b) / inc.length, meanEcc: ecc.reduce((a, b) => a + b) / ecc.length };
  }
  function analyse(t, lon, lat, peri, node, epoch, aopts = {}) {
    const Q = aopts.quadratic ? 1 : 0;                        // fit a quadratic in the mean longitude (a secular acceleration)
    const m0 = madh(epoch), Ls0 = m0.sun * D2R, perS = (m0.sunApogee + 180) * D2R;
    const P = linfit(t, peri), Nd = linfit(t, node);
    let L = linfit(t, lon), dPeri = 0, dNode = 0, lonC = null, latC = null, ndot = 0;
    const T = t[t.length - 1] || 1;
    for (let pass = 0; pass < 4; pass++) {
      const args = t.map((x) => { const lm = L.at0 + L.rate * x + 0.5 * ndot * x * x, ls = Ls0 + N_SUN * x;
        return [lm - ls, lm - (P.at0 + dPeri + P.rate * x), ls - perS, lm - (Nd.at0 + dNode + Nd.rate * x)]; });
      const rowsL = t.map((x, i) => { const r = Q ? [1, x / T, (x / T) * (x / T)] : [1, x / T]; for (const m of LON_ARGS) { const a = m[0] * args[i][0] + m[1] * args[i][1] + m[2] * args[i][2] + m[3] * args[i][3]; r.push(Math.sin(a), Math.cos(a)); } return r; });
      const cL = lsq(rowsL, lon);
      L = { at0: cL[0], rate: cL[1] / T }; if (Q) ndot = 2 * cL[2] / (T * T);
      lonC = LON_ARGS.map((m, k) => ({ arg: m, name: NAME(m), sin: cL[2 + Q + 2 * k] * R2D, cos: cL[3 + Q + 2 * k] * R2D }));
      const rowsB = t.map((x, i) => { const r = []; for (const m of LAT_ARGS) { const a = m[0] * args[i][0] + m[1] * args[i][1] + m[2] * args[i][2] + m[3] * args[i][3]; r.push(Math.sin(a), Math.cos(a)); } return r; });
      const cB = lsq(rowsB, lat);
      latC = LAT_ARGS.map((m, k) => ({ arg: m, name: NAME(m), sin: cB[2 * k] * R2D, cos: cB[2 * k + 1] * R2D }));
      dPeri += Math.atan2(-lonC[0].cos, lonC[0].sin);        // the M term must be a pure sine about the mean perigee
      dNode += Math.atan2(-latC[0].cos, latC[0].sin);        // the F term must be a pure sine about the mean node
    }
    const term = (list, m) => list.find((x) => x.arg.every((v, i) => v === m[i]));
    return {
      mean: { lambda0: L.at0, n: L.rate, ndot, perigee0: P.at0 + dPeri, perigeeRate: P.rate, node0: Nd.at0 + dNode, nodeRate: Nd.rate },
      lon: lonC, lat: latC,
      syzygyEquation: term(lonC, [0, 1, 0, 0]).sin - term(lonC, [2, -1, 0, 0]).sin,
      syzygyLatitude: term(latC, [0, 0, 0, 1]).sin - term(latC, [2, 0, 0, -1]).sin,
    };
  }

  /** Fit the Moon's starting state to the text, then integrate `years` and report what gravitation adds. */
  function derive(opts = {}) {
    const epoch = opts.epoch ?? 1872855;                       // 2026-10-07, Kali day
    const m = madh(epoch);
    const target = { lambda0: m.moon * D2R, perigee0: (m.moonApogee + 180) * D2R, node0: m.node * D2R, n: N_MOON, syz: opts.syzygyEquation ?? MOON_HARMONIC, lat: opts.syzygyLatitude ?? LATITUDE };
    const mu = N_MOON * N_MOON;
    let el = { a: 1, e: 0.055, i: 5.1 * D2R, node: target.node0, peri: target.perigee0, L: target.lambda0 };
    const fitDays = opts.fitDays || 3 * 365.25, iters = opts.iterations || 6, history = [];
    for (let k = 0; k < iters; k++) {
      const r = run(el, mu, epoch, fitDays, { sample: 0.25, eSun: opts.eSun });
      history.push({ n: r.mean.n, syz: r.syzygyEquation, lat: r.syzygyLatitude, dL: wrapPi(target.lambda0 - r.mean.lambda0) * R2D });
      el = { a: el.a * Math.pow(r.mean.n / target.n, 2 / 3), e: el.e * target.syz / r.syzygyEquation, i: el.i * target.lat / r.syzygyLatitude,
        node: el.node + wrapPi(target.node0 - r.mean.node0), peri: el.peri + wrapPi(target.perigee0 - r.mean.perigee0), L: el.L + wrapPi(target.lambda0 - r.mean.lambda0) };
    }
    const years = opts.years || 74.4, refine = opts.refine ?? 2;
    let fin = null;
    for (let k = 0; k <= refine; k++) {                        // refine on the full span, where the means are sharp
      fin = run(el, mu, epoch, years * 365.25, { sample: opts.sample || 0.5, eSun: opts.eSun });
      history.push({ n: fin.mean.n, syz: fin.syzygyEquation, lat: fin.syzygyLatitude, dL: wrapPi(target.lambda0 - fin.mean.lambda0) * R2D, span: years });
      if (k === refine) break;
      el = { a: el.a * Math.pow(fin.mean.n / target.n, 2 / 3), e: el.e * target.syz / fin.syzygyEquation, i: el.i * target.lat / fin.syzygyLatitude,
        node: el.node + wrapPi(target.node0 - fin.mean.node0), peri: el.peri + wrapPi(target.perigee0 - fin.mean.perigee0), L: el.L + wrapPi(target.lambda0 - fin.mean.lambda0) };
    }
    const perYuga = (rate) => rate * YUGA / TAU;
    return {
      epoch, inputs: INPUTS, initial: el, history,
      mean: fin.mean, meanEcc: fin.meanEcc, meanIncDeg: fin.meanInc * R2D,
      lon: fin.lon, lat: fin.lat, syzygyEquation: fin.syzygyEquation, syzygyLatitude: fin.syzygyLatitude,
      rates: {
        apogeePerYuga: perYuga(fin.mean.perigeeRate), nodePerYuga: -perYuga(fin.mean.nodeRate), text: TEXT_RATES,
        apogeeRatio: perYuga(fin.mean.perigeeRate) / TEXT_RATES.apogee, nodeRatio: -perYuga(fin.mean.nodeRate) / TEXT_RATES.node,
        moonPerYuga: perYuga(fin.mean.n),
      },
      span: { years, steps: fin.steps, evaluations: fin.evaluations },
    };
  }

  /** The inclination that the text's own apogee rate implies: the syzygy latitude for which the derived apogee turns
   *  488,203 times in a yuga (secant), and the node rate the same orbit then gives. */
  function impliedInclination(opts = {}) {
    const f = (lat) => { const d = derive({ years: 20, refine: 1, ...opts, syzygyLatitude: lat }); return { lat, d, g: d.rates.apogeeRatio - 1 }; };
    let a = f(LATITUDE), b = f(LATITUDE + 0.5);
    for (let k = 0; k < (opts.secantSteps || 3) && Math.abs(b.g) > 2e-6; k++) { const lat = b.lat - b.g * (b.lat - a.lat) / (b.g - a.g); a = b; b = f(lat); }
    return { syzygyLatitudeDeg: b.lat, meanInclinationDeg: b.d.meanIncDeg, apogeeRatio: b.d.rates.apogeeRatio, nodeRatio: b.d.rates.nodeRatio,
      apogeePerYuga: b.d.rates.apogeePerYuga, nodePerYuga: b.d.rates.nodePerYuga, span: "20 years from the epoch" };
  }

  return Object.freeze({ impliedInclination, INPUTS, TEXT_RATES, LON_ARGS, LAT_ARGS, sunModel, makeAccel, toState, osculating, run, analyse, derive, firstHarmonic, madh });
});
