/* radau.js — the owner's 15th-order Gauss–Radau integrator, lifted out of the Bhārat Sovereign Engine
 * (bharat-sovereign-engine/src/physics/ias15-gauss-radau.js) WITHOUT its force model or any data.
 *
 * Everything in it is derived, not copied: the 8 substep nodes are x = −1 and the seven roots of P_7(x) + P_8(x)
 * (Legendre), found by Newton on the three-term recurrence and mapped by h = (x+1)/2; within a step the acceleration
 * is a degree-7 polynomial in τ, integrated exactly; the coefficients come by fixed-point iteration on the node
 * accelerations (Newton divided differences → monomials through a matrix built by polynomial multiplication);
 * step control ε = max|b_6| / max|a|; compensated summation; the b_k re-expanded for the next step by the
 * binomial identity. The algorithm is the owner's, line for line; only the force is now a parameter.
 *
 * integrate(x0, v0, accel, tEnd, { epsilon, dt0, maxStep, minStep, sample }) → { samples: [{t, x, v}], steps, evaluations }
 *   accel(x, v, t, out) writes the acceleration into out (Float64Array of the same length as x).
 *   sample: the interval at which the state is recorded (the step is shortened to land on it).
 * No imports. Browser: window.Radau; node: module.exports.
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.Radau = factory();
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";
  function legendrePair(n, x) {
    let p0 = 1, p1 = x;
    if (n === 0) return [1, 0];
    for (let k = 2; k <= n; k++) { const p2 = ((2 * k - 1) * x * p1 - (k - 1) * p0) / k; p0 = p1; p1 = p2; }
    return [p1, n * (x * p1 - p0) / (x * x - 1)];
  }
  function radauNodes() {
    const f = (x) => legendrePair(7, x)[0] + legendrePair(8, x)[0];
    const df = (x) => legendrePair(7, x)[1] + legendrePair(8, x)[1];
    const roots = []; const N = 4000; let xa = -0.999, fa = f(xa);
    for (let i = 1; i <= N; i++) {
      const xb = -0.999 + 1.998 * i / N, fb = f(xb);
      if (fa * fb < 0) { let x = 0.5 * (xa + xb); for (let it = 0; it < 60; it++) { const d = f(x) / df(x); x -= d; if (Math.abs(d) < 1e-17) break; } roots.push(x); }
      xa = xb; fa = fb;
    }
    if (roots.length !== 7) throw new Error("radau: node search failed");
    return [0, ...roots.map((x) => (x + 1) / 2)];
  }
  const H = radauNodes();
  const R = H.map((hi, i) => H.map((hj, j) => (j < i ? 1 / (hi - hj) : 0)));
  const C = (() => {
    const M = Array.from({ length: 7 }, () => new Array(7).fill(0)); let poly = [0, 1];
    for (let m = 1; m <= 7; m++) {
      for (let k = 0; k < 7; k++) M[k][m - 1] = poly[k + 1] || 0;
      const next = new Array(poly.length + 1).fill(0);
      for (let i = 0; i < poly.length; i++) { next[i + 1] += poly[i]; next[i] -= H[m] * poly[i]; }
      poly = next;
    }
    return M;
  })();
  const D = (() => {
    const n = C.length, A = C.map((r, i) => [...r, ...Array.from({ length: n }, (_, j) => (i === j ? 1 : 0))]);
    for (let c = 0; c < n; c++) {
      let p = c; for (let r = c + 1; r < n; r++) if (Math.abs(A[r][c]) > Math.abs(A[p][c])) p = r;
      [A[c], A[p]] = [A[p], A[c]];
      const d = A[c][c]; for (let j = 0; j < 2 * n; j++) A[c][j] /= d;
      for (let r = 0; r < n; r++) { if (r === c) continue; const f = A[r][c]; for (let j = 0; j < 2 * n; j++) A[r][j] -= f * A[c][j]; }
    }
    return A.map((r) => r.slice(n));
  })();
  const BINOM = Array.from({ length: 9 }, (_, n) => Array.from({ length: 9 }, (_, k) => { if (k > n) return 0; let b = 1; for (let i = 1; i <= k; i++) b = b * (n - i + 1) / i; return b; }));

  function integrate(x0, v0, accel, tEnd, options = {}) {
    const dim = x0.length;
    const eps = options.epsilon || 1e-9, maxStep = options.maxStep || 5, minStep = options.minStep || 1e-6;
    const sampleEvery = options.sample || tEnd;
    const x = Float64Array.from(x0), v = Float64Array.from(v0), csx = new Float64Array(dim), csv = new Float64Array(dim);
    const a0 = new Float64Array(dim), aT = new Float64Array(dim), xT = new Float64Array(dim), vT = new Float64Array(dim), gOld = new Float64Array(dim);
    const b = Array.from({ length: 7 }, () => new Float64Array(dim)), g = Array.from({ length: 7 }, () => new Float64Array(dim));
    let nEval = 0, nSteps = 0;
    const f = (xx, vv, tt, out) => { accel(xx, vv, tt, out); nEval++; };
    const samples = [{ t: 0, x: Float64Array.from(x), v: Float64Array.from(v) }];
    let t = 0, nextSample = Math.min(sampleEvery, tEnd), dt = options.dt0 || 0.1, firstStep = true;
    f(x, v, t, a0);
    while (t < tEnd - 1e-12) {
      let h = Math.min(dt, maxStep, nextSample - t);
      for (let m = 0; m < 7; m++) g[m].fill(0);
      if (!firstStep) for (let m = 0; m < 7; m++) for (let i = 0; i < dim; i++) { let s = 0; for (let k = 0; k < 7; k++) s += D[m][k] * b[k][i]; g[m][i] = s; }
      let accepted = false, ratio = 1.5;
      while (!accepted) {
        let dbPrev = Infinity;
        for (let iter = 0; iter < 12; iter++) {
          let dbMax = 0;
          for (let nd = 1; nd <= 7; nd++) {
            const tau = H[nd], h2 = h * h;
            for (let i = 0; i < dim; i++) {
              let sx = 0, sv = 0, tk = tau;
              for (let k = 0; k < 7; k++) { sx += b[k][i] * tk / ((k + 2) * (k + 3)); sv += b[k][i] * tk / (k + 2); tk *= tau; }
              xT[i] = x[i] + h * tau * v[i] + h2 * tau * tau * (0.5 * a0[i] + sx);
              vT[i] = v[i] + h * tau * (a0[i] + sv);
            }
            f(xT, vT, t + h * tau, aT);
            for (let i = 0; i < dim; i++) {
              let gg = (aT[i] - a0[i]) * R[nd][0];
              for (let j = 1; j < nd; j++) gg = (gg - g[j - 1][i]) * R[nd][j];
              gOld[i] = g[nd - 1][i]; g[nd - 1][i] = gg;
            }
            const m = nd - 1;
            for (let i = 0; i < dim; i++) {
              const dg = g[m][i] - gOld[i]; if (dg === 0) continue;
              for (let k = 0; k < 7; k++) { const dbk = C[k][m] * dg; b[k][i] += dbk; if (Math.abs(dbk) > dbMax) dbMax = Math.abs(dbk); }
            }
          }
          let aMax = 0; for (let i = 0; i < dim; i++) aMax = Math.max(aMax, Math.abs(a0[i]));
          if (dbMax < 1e-16 * aMax || (iter >= 1 && dbMax >= dbPrev)) break;
          dbPrev = dbMax;
        }
        let b6Max = 0, aMax = 0;
        for (let i = 0; i < dim; i++) { b6Max = Math.max(b6Max, Math.abs(b[6][i])); aMax = Math.max(aMax, Math.abs(a0[i])); }
        const err = aMax > 0 ? b6Max / aMax : 0;
        ratio = err > 0 ? Math.pow(eps / err, 1 / 7) : 1.5;
        if (err > eps && h > minStep) { h = Math.max(minStep, h * Math.max(0.2, Math.min(0.9, ratio))); continue; }
        accepted = true;
        const h2 = h * h;
        for (let i = 0; i < dim; i++) {
          let sx = 0, sv = 0; for (let k = 0; k < 7; k++) { sx += b[k][i] / ((k + 2) * (k + 3)); sv += b[k][i] / (k + 2); }
          const dx = h * v[i] + h2 * (0.5 * a0[i] + sx), dv = h * (a0[i] + sv);
          let yy = dx - csx[i], tt = x[i] + yy; csx[i] = (tt - x[i]) - yy; x[i] = tt;
          yy = dv - csv[i]; tt = v[i] + yy; csv[i] = (tt - v[i]) - yy; v[i] = tt;
        }
        t += h; nSteps++;
        f(x, v, t, a0);
        if (Math.abs(t - nextSample) < 1e-9) { t = nextSample; samples.push({ t, x: Float64Array.from(x), v: Float64Array.from(v) }); nextSample = Math.min(nextSample + sampleEvery, tEnd); }
        const hNew = Math.min(maxStep, h * Math.min(3.0, Math.max(0.2, ratio * 0.95))), q = hNew / h;
        const bNew = Array.from({ length: 7 }, () => new Float64Array(dim));
        for (let i = 0; i < dim; i++) for (let m = 1; m <= 7; m++) { let s = 0; const qm = Math.pow(q, m); for (let j = m - 1; j < 7; j++) s += b[j][i] * BINOM[j + 1][m] * qm; bNew[m - 1][i] = s; }
        for (let k = 0; k < 7; k++) b[k].set(bNew[k]);
        dt = hNew; firstStep = false;
      }
    }
    return { samples, steps: nSteps, evaluations: nEval };
  }
  return Object.freeze({ integrate, radauNodes, H });
});
