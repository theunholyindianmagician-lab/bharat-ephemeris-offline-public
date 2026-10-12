/* mcra.test.js — the Mādhava-Chebyshev rational approximator of the owner's SSEA engine (src/math/chebyshev.ts) and the
 * web substrate: the tail of a Chebyshev series whose coefficients fall geometrically, c_n = c_{N+1} β^(n−N−1) for n > N,
 * sums in closed form to c_{N+1} (T_{N+1}(x) − β T_N(x)) / (1 − 2βx + β²). Proof: with t = β, Σ_{k≥0} t^k T_{m+k}(x) is the
 * generating function of the Chebyshev polynomials shifted by m, and the three-term recurrence T_{k+1} = 2x T_k − T_{k−1}
 * gives (1 − 2tx + t²) Σ_{k≥0} t^k T_{m+k} = T_m − t T_{m−1} [theorem; |β| < 1 for convergence]. The identity is exact; the
 * approximator's accuracy on a real series is only as good as the geometric assumption on its tail. */
const test = require('node:test');
const assert = require('node:assert/strict');

function T(n, x) { if (n === 0) return 1; if (n === 1) return x; let a = 1, b = x, c; for (let i = 2; i <= n; i++) { c = 2 * x * b - a; a = b; b = c; } return b; }
const tail = (cN1, beta, N, x) => cN1 * (T(N + 1, x) - beta * T(N, x)) / (1 - 2 * beta * x + beta * beta);

test('the MCRA tail identity holds to machine precision for every |β| < 1 and x in [−1, 1]: the geometric Chebyshev tail has the closed form of the SSEA chebyshev.ts', () => {
  let worst = 0, n = 0;
  for (const beta of [0.05, 0.3, 0.5, 0.8, 0.95, -0.2, -0.6, -0.9]) for (let x = -1; x <= 1.0001; x += 0.125) for (const N of [0, 3, 6, 11]) {
    const cN1 = 0.37; let direct = 0; for (let k = 0; k < 2000; k++) direct += cN1 * Math.pow(beta, k) * T(N + 1 + k, x);
    const d = Math.abs(direct - tail(cN1, beta, N, x)); worst = Math.max(worst, d); n++;
  }
  assert.ok(worst < 1e-11, `worst ${worst}`); assert.ok(n > 400);
});

test('the identity is the generating function of the Chebyshev polynomials: Σ t^k T_k(x) = (1 − t x) / (1 − 2 t x + t²), the m = 0 case', () => {
  for (const t of [0.1, 0.5, -0.7]) for (const x of [-1, -0.3, 0.6, 1]) { let s = 0; for (let k = 0; k < 2000; k++) s += Math.pow(t, k) * T(k, x); assert.ok(Math.abs(s - (1 - t * x) / (1 - 2 * t * x + t * t)) < 1e-12); }
});

test('what it does and does not do: on a series whose tail is NOT geometric (the tail of an exponential\'s Chebyshev series, c_n = 2 I_n(1), falling faster than any geometric), the rational tail is only an estimate', () => {
  // Chebyshev coefficients of e^x on [−1, 1]: c_n = 2·I_n(1) (n ≥ 1), c_0 = I_0(1); the coefficients fall like 1/(2^n n!), faster than geometric
  const I = (n) => { let s = 0; for (let k = 0; k < 40; k++) { let f = 1; for (let j = 1; j <= k; j++) f *= j; let g = 1; for (let j = 1; j <= k + n; j++) g *= j; s += Math.pow(0.5, 2 * k + n) / (f * g); } return s; };
  const c = [I(0), ...Array.from({ length: 14 }, (_, i) => 2 * I(i + 1))];
  const N = 3, x = 0.7; let partial = 0; for (let k = 0; k <= N; k++) partial += c[k] * T(k, x);
  const beta = c[N + 2] / c[N + 1], mcra = partial + tail(c[N + 1], beta, N, x), exact = Math.exp(x), plain = partial;
  assert.ok(Math.abs(mcra - exact) < Math.abs(plain - exact), 'the rational tail improves on truncation');
  assert.ok(Math.abs(mcra - exact) > 1e-9, 'but it is not exact when the tail is not geometric');
});
