'use strict';
/*
 * pn2-schwarzschild.test.js — the 2PN term of the owner's force law (dop853-nbody.js, block 3), derived and checked.
 *
 * The question (2026-10-07): the engine carried ±3(GM)²/(c⁴r⁴) as its 2PN term, with opposite signs in two copies, and
 * that expression is not an acceleration. Which sign is right, and what is the term?
 * The answer is not chosen; it is computed. A test body about a mass m (G = c = 1) in Schwarzschild spacetime written in
 * HARMONIC coordinates — the gauge of the EIH 1PN block that precedes it — has the metric
 *   g_tt = −(r − m)/(r + m),   g_ij = (1 + m/r)² δ_ij + ((r + m)/(r − m)) (m²/r²) n_i n_j,
 * and its coordinate acceleration follows exactly from the geodesic equation,
 *   d²xⁱ/dt² = −Γⁱ_αβ uᵅuᵝ + Γᵗ_αβ uᵅuᵝ vⁱ,   u = (1, v).
 * Expanding it in m/r gives
 *   a = −(m/r²)[(1 + A₁ + A₂) n̂ + (B₁ + B₂) v],  A₁ = v² − 4m/r,  B₁ = −4ṙ,  A₂ = 9(m/r)² − 2(m/r)ṙ²,  B₂ = 2(m/r)ṙ.
 * Here the Christoffels are taken numerically from the metric itself, so the test does not assume the series it checks.
 * The static part of A₂ is −9m³/r⁴: attraction. That is the sign the force law now carries.
 * No ephemeris enters: the metric is the only input.
 */
const assert = require('node:assert/strict');
const { test } = require('node:test');
const N = require('./dop853-nbody.js');

function metric(x, m) {
  const r = Math.hypot(x[1], x[2], x[3]), n = [x[1] / r, x[2] / r, x[3] / r];
  const a = (1 + m / r) ** 2, b = ((r + m) / (r - m)) * (m * m) / (r * r);
  const g = [[-(r - m) / (r + m), 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) g[i + 1][j + 1] = (i === j ? a : 0) + b * n[i] * n[j];
  return g;
}
function inv4(M) {
  const A = M.map((row, i) => [...row, ...[0, 1, 2, 3].map((j) => (i === j ? 1 : 0))]);
  for (let c = 0; c < 4; c++) {
    let p = c; for (let r = c + 1; r < 4; r++) if (Math.abs(A[r][c]) > Math.abs(A[p][c])) p = r;
    [A[c], A[p]] = [A[p], A[c]];
    const d = A[c][c]; for (let j = 0; j < 8; j++) A[c][j] /= d;
    for (let r = 0; r < 4; r++) if (r !== c) { const f = A[r][c]; for (let j = 0; j < 8; j++) A[r][j] -= f * A[c][j]; }
  }
  return A.map((row) => row.slice(4));
}
/** Exact coordinate acceleration of a test body, from the geodesic equation (Γ by central differences; static metric). */
function exactAccel(pos, vel, m) {
  const x = [0, ...pos], h = 1e-6 * Math.hypot(...pos), dg = [null];
  for (let k = 1; k < 4; k++) {
    const p = x.slice(), q = x.slice(); p[k] += h; q[k] -= h;
    const gp = metric(p, m), gq = metric(q, m);
    dg.push(gp.map((row, i) => row.map((v, j) => (v - gq[i][j]) / (2 * h))));
  }
  const d = (k, i, j) => (k === 0 ? 0 : dg[k][i][j]);
  const gi = inv4(metric(x, m)), u = [1, ...vel];
  const quad = (l) => {
    let s = 0;
    for (let a = 0; a < 4; a++) for (let b = 0; b < 4; b++) {
      let G = 0; for (let k = 0; k < 4; k++) G += gi[l][k] * (d(a, k, b) + d(b, k, a) - d(k, a, b));
      s += 0.5 * G * u[a] * u[b];
    }
    return s;
  };
  const qt = quad(0);
  return [1, 2, 3].map((i) => -quad(i) + qt * vel[i - 1]);
}
/** The PN series to a given order (0 Newton, 1, 2). */
function series(pos, vel, m, order) {
  const r = Math.hypot(...pos), n = pos.map((c) => c / r), v2 = vel.reduce((s, c) => s + c * c, 0);
  const rd = (pos[0] * vel[0] + pos[1] * vel[1] + pos[2] * vel[2]) / r, mr = m / r;
  let A = 0, B = 0;
  if (order >= 1) { A += v2 - 4 * mr; B += -4 * rd; }
  if (order >= 2) { A += 9 * mr * mr - 2 * mr * rd * rd; B += 2 * mr * rd; }
  return [0, 1, 2].map((k) => -(m / (r * r)) * ((1 + A) * n[k] + B * vel[k]));
}
const norm = (a) => Math.hypot(...a);
const diff = (a, b) => a.map((c, k) => c - b[k]);
// one orbit configuration, scaled to m/r = eps; moving radially and tangentially so every term is exercised
function config(eps) {
  const m = 1, r = m / eps, pos = [r * 0.6, -r * 0.7, r * Math.sqrt(1 - 0.85)];
  const vc = Math.sqrt(m / r);
  return { m, r, pos, vel: [0.3 * vc, 0.8 * vc, -0.4 * vc] };
}

test('the series converges to the exact geodesic: 1PN error ∝ (m/r)², 2PN error ∝ (m/r)³', () => {
  const errs = [0.02, 0.01, 0.005].map((eps) => {
    const { m, pos, vel } = config(eps), ex = exactAccel(pos, vel, m), aN = norm(series(pos, vel, m, 0));
    return [1, 2].map((o) => norm(diff(series(pos, vel, m, o), ex)) / aN);
  });
  for (let i = 0; i + 1 < errs.length; i++) {
    const r1 = errs[i][0] / errs[i + 1][0], r2 = errs[i][1] / errs[i + 1][1];
    assert.ok(r1 > 3.5 && r1 < 4.5, `1PN error falls ×4 when m/r halves (got ${r1})`);
    assert.ok(r2 > 7 && r2 < 9, `2PN error falls ×8 when m/r halves (got ${r2})`);
    assert.ok(errs[i][1] < errs[i][0] / 20, '2PN is much closer than 1PN');
  }
  assert.ok(errs[2][1] < 3e-6, `2PN error at m/r = 0.005 is ${errs[2][1]}`);
});

test('the static 2PN term is −9m³/r⁴ toward the mass (attraction), not ±3m²/r⁴', () => {
  for (const eps of [0.004, 0.002, 0.001]) {
    const { m, r, pos } = config(eps), rest = [0, 0, 0];
    const res = diff(exactAccel(pos, rest, m), series(pos, rest, m, 1));      // what Newton + 1PN leave
    const radial = res.reduce((s, c, k) => s + c * pos[k], 0) / r;             // + outward, − inward
    const expect = -9 * m ** 3 / r ** 4;
    assert.ok(radial < 0, 'inward');
    assert.ok(Math.abs(radial / expect - 1) < 8 * eps, `m/r ${eps}: residual ${radial} vs −9m³/r⁴ ${expect}`);
  }
});

test('the old expression 3(GM)²/(c⁴r⁴) is not an acceleration; the derived term is', () => {
  // change the unit of length by λ (AU → km): an acceleration scales as λ; GM as λ³, c as λ, r as λ.
  const gm = N.STANDARD_GM[0], c = 299792458 * 86400 / (N.AU_KM * 1000), r = 0.4, lam = N.AU_KM;
  const old = (G, C, R) => 3 * G * G / (C ** 4 * R ** 4);
  const derived = (G, C, R) => 9 * G ** 3 / (C ** 4 * R ** 4);
  const power = (f) => Math.log(f(gm * lam ** 3, c * lam, r * lam) / f(gm, c, r)) / Math.log(lam);
  assert.ok(Math.abs(power(derived) - 1) < 1e-9, 'derived term scales as length¹: an acceleration');
  assert.ok(Math.abs(power(old) + 2) < 1e-9, 'old term scales as length⁻²: not an acceleration');
});

test('the force law (block 3) carries exactly this term, and with it matches the exact geodesic to 2PN order', () => {
  const C = 299792458 * 86400 / (N.AU_KM * 1000), C2 = C * C;
  for (const eps of [0.01, 0.005]) {
    // a heavy "Sun" at rest at the origin and a massless body at 1 AU with m/r = eps; t = 0 (no solar mass loss)
    const r = 1, M = eps * r * C2;                                            // GM in AU³/day² so that GM/(c²r) = eps
    const pos = [0.6, -0.7, Math.sqrt(1 - 0.85)], vc = Math.sqrt(M / r), vel = [0.3 * vc, 0.8 * vc, -0.4 * vc];
    const y = new Float64Array([0, 0, 0, ...pos, 0, 0, 0, ...vel]), dydt = new Float64Array(12);
    N.evalRhs(y, new Float64Array([M, 0]), dydt, { t: 0 });
    const law = Array.from(dydt.subarray(9, 12));
    // the same in geometric units: m = GM/c², velocities over c, accelerations × c²
    const m = M / C2, vg = vel.map((v) => v / C);
    const toPhys = (a) => a.map((x) => x * C2);
    const aN = norm(toPhys(series(pos, vg, m, 0)));
    const pn1 = toPhys(series(pos, vg, m, 1)), pn2 = toPhys(series(pos, vg, m, 2)), exact = toPhys(exactAccel(pos, vg, m));
    // the law minus the 1PN series is the 2PN term (+ the Sun's Lense–Thirring, ~1e-15 of a_N here)
    const term = diff(pn2, pn1), lawTerm = diff(law, pn1);
    assert.ok(norm(diff(lawTerm, term)) < 1e-9 * norm(term), `block 3 = the derived 2PN term (m/r ${eps})`);
    assert.ok(norm(diff(law, exact)) / aN < 2e-4 * (eps / 0.02) ** 3 * 1.5, `law vs exact geodesic at m/r ${eps}`);
  }
});
