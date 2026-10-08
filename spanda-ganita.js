/* spanda-ganita.js — स्पन्द-गणित: the Sūrya-Siddhānta's Sun and Moon, and every limb of the pañcāṅga, EXACT on the
 * spanda lattice, with time counted in spandas of the star-wheel's turn.
 *
 * Time. SS 1.11-1.12: sixty nāḍīs are one turn of the star-wheel; 1.34-1.37: in a yuga the wheel turns 1,582,237,828
 * times while 1,577,917,828 civil days pass. So days ÷ yuga-days = turns ÷ yuga-turns, and a body's mean place is
 * frac(R·(1811/4 + τ/1,582,237,828)) with τ the turns since the Kali epoch — time IS the turn. τ is counted here in
 * spandas of the turn: 328,050,000,000 to a turn (2⁷·3⁸·5⁸), a BigInt.
 *
 * Space. The circle is the same lattice: N = 328,050,000,000 arc-spandas; 1′ = 15,187,500, 1″ = 253,125. Every
 * limb is an exact integer partition of N (the owner's council, 2026-09-28): tithi N/30 = 10,935,000,000 (= 2 ghaṭīs
 * of the turn), karaṇa N/60 = 5,467,500,000 (= 1 ghaṭī), nakṣatra and yoga N/27 = 12,150,000,000, pāda N/108 =
 * 3,037,500,000 (= 200 prāṇas). 108 = 4 × 27 = 9 × 12 joins nakṣatra and rāśi; N is divisible by 108² = 11,664 but
 * not by 108³.
 *
 * The true place is rational at every step of the text: the mean place from integers (1.53-1.54, 1.57-1.58); the sine
 * by the 24-entry table and linear interpolation (2.17-2.22, 2.31-2.32); the epicycle varying with it (2.38); the arc
 * by inverse interpolation (2.33); the sign by the kendra (2.45). So the places here are exact fractions, and the end
 * of a limb is the FIRST spanda of the turn at which the place reaches the cell's edge, found by integer bisection —
 * exact, with nothing rounded. SS 4.7 defines the end of amāvāsyā as Sun and Moon equal "in sign, degree, minute and
 * so on"; 4.8 reaches it by repeated correction, which `parvaByIteration` also does and which lands on the same spanda.
 * This is the text's own model computed without error; how close the model is to the sky is a separate question.
 *
 * Two sines (withSine): "madhava" (the default since 2026-10-07) is Mādhava's sine (Kerala, 14th c.), as
 * Nīlakaṇṭha's school records it in Kaṭapayādi words (katapayadi.test.js decodes and checks every one): radius
 * 3437′44″48‴, and Rsin x = x − (x/q)³[c₁ − (x/q)²[c₂ − (x/q)²[c₃ − (x/q)²[c₄ − (x/q)² c₅]]]] with q = 5400′ and
 * c₁ … c₅ = nirviddhāṅganarendraruṅ 2220′39″40‴, sarvārthaśīlasthira 273′57″47‴, kavīśanicaya 16′05″41‴,
 * tunnabala 33″06‴, vidvān 44‴. It is a polynomial with rational coefficients, so it stays exact. Its arc (the inverse)
 * is not a Mādhava rule: here it is the first arc-spanda whose Mādhava sine reaches the value, by integer bisection.
 * "table" is the SS table above, the text as written. The epicycles, the paridhi rule 2.38 and the sign rule 2.45 are
 * the text's in both.
 *
 * True daily motion (SS 2.47-2.49): the motion of the kendra × the tabular sine-difference ÷ 225 × the epicycle ÷ 360,
 * added from Karka, subtracted from Makara. Within a 225′ step the tabular difference ÷ 225 IS the derivative of the
 * table's interpolated sine [theorem]; the rule leaves out only the epicycle's own variation (2.38) and the slope of the
 * arc (2.33), so the 4.8 iteration with it is nearly Newton's method on the text's own model. `gati` computes it;
 * parvaByIteration uses it when asked ({ rate: "text" }). Mādhava's quadrant is exact to the third: 5400′ − c₁ + c₂ −
 * c₃ + c₄ − c₅ = 12,375,888‴ = 3437′44″48‴, his radius [theorem; tested].
 * Browser: window.SpandaGanita (needs Sphuta); node: module.exports.
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory(require("./sphuta.js"));
  else root.SpandaGanita = factory(root.Sphuta);
})(typeof globalThis !== "undefined" ? globalThis : this, function (S) {
  "use strict";
  function build(tier) {
  const SPT = 328050000000n;                      // spandas in one turn (time) — and arc-spandas in the circle (space)
  const N = SPT;
  const RISINGS = 1582237828n, YUGA = S.YUGA_DAYS, SUN_REVS = 4320000n;
  const ARCMIN = 21600n, SP_PER_ARCMIN = N / ARCMIN;                     // 15,187,500
  const R = BigInt(S.R), JYA = S.JYA.map(BigInt);
  const REV = Object.freeze({ sun: 4320000n, moon: 57753336n, moonApogee: 488203n, node: 232238n });
  const KALPA_YEARS = 4320000000n, YEARS_GONE = 1955880000n, SUN_APOGEE_KALPA = 387n;
  const PAIR = Object.freeze({ sun: [[14n, 1n], [41n, 3n]], moon: [[32n, 1n], [95n, 3n]] });      // 2.34: 14°/13°40′, 32°/31°40′

  // ── exact rationals [n, d], d > 0 ─────────────────────────────────────────────────────────────
  const gcd = (a, b) => { a = a < 0n ? -a : a; b = b < 0n ? -b : b; while (b) [a, b] = [b, a % b]; return a; };
  const Q = (n, d = 1n) => { if (d < 0n) { n = -n; d = -d; } const g = gcd(n, d) || 1n; return [n / g, d / g]; };
  const add = (a, b) => Q(a[0] * b[1] + b[0] * a[1], a[1] * b[1]);
  const sub = (a, b) => Q(a[0] * b[1] - b[0] * a[1], a[1] * b[1]);
  const mul = (a, b) => Q(a[0] * b[0], a[1] * b[1]);
  const div = (a, b) => Q(a[0] * b[1], a[1] * b[0]);
  const cmp = (a, b) => { const x = a[0] * b[1] - b[0] * a[1]; return x < 0n ? -1 : x > 0n ? 1 : 0; };
  const floor = (a) => { const q = a[0] / a[1]; return a[0] < 0n && q * a[1] !== a[0] ? q - 1n : q; };
  const modQ = (a, m) => { const k = floor(div(a, Q(m))); return sub(a, Q(k * m)); };
  const toNum = (a) => Number(a[0] * 1000000000000n / a[1]) / 1e12;

  // ── mean places, in arcminutes, at τ spandas of the turn since the Kali epoch ───────────────────
  /** frac(R·(1811/4 + τ/(RISINGS·SPT))) × 21600, exact. */
  function meanArcmin(rev, tau, westward) {
    const den = 4n * RISINGS * SPT;
    let num = (rev * (1811n * RISINGS * SPT + 4n * tau)) % den; if (num < 0n) num += den;
    if (westward && num !== 0n) num = den - num;
    return Q(num * ARCMIN, den);
  }
  /** The Sun's apogee: 387 turns in a kalpa (1.41), with 1,955,880,000 years gone at the Kali epoch (1.47). */
  function sunApogeeArcmin(tau) {
    // years = YEARS_GONE + days·4,320,000/YUGA, and days/YUGA = τ/(RISINGS·SPT)
    const den = KALPA_YEARS * RISINGS * SPT;
    let num = (SUN_APOGEE_KALPA * (YEARS_GONE * RISINGS * SPT + SUN_REVS * tau)) % den; if (num < 0n) num += den;
    return Q(num * ARCMIN, den);
  }

  // ── the text's sine table, exact ─────────────────────────────────────────────────────────────
  if (tier !== "table" && tier !== "madhava") throw new RangeError('spanda-ganita: the sine is "table" or "madhava"');
  /** 2.31-2.32: R-sine of an arc of 0…5400′. */
  function jyaQ(m) {
    let i = floor(div(m, Q(225n))); if (i > 23n) i = 23n;
    const k = Number(i);
    return add(Q(JYA[k]), div(mul(sub(m, Q(225n * i)), Q(JYA[k + 1] - JYA[k])), Q(225n)));
  }
  /** 2.33: arc in minutes of an R-sine 0…3438. */
  function arcQ(y) {
    let k = 0; while (k < 23 && cmp(Q(JYA[k + 1]), y) <= 0) k++;
    return add(Q(225n * BigInt(k)), div(mul(sub(y, Q(JYA[k])), Q(225n)), Q(JYA[k + 1] - JYA[k])));
  }

  // ── Mādhava's sine, exact ────────────────────────────────────────────────────────────────────
  const MADHAVA_R = Q(3437n * 3600n + 44n * 60n + 48n, 3600n);         // 3437′44″48‴, in arcminutes
  const MADHAVA_C = [[2220n, 39n, 40n], [273n, 57n, 47n], [16n, 5n, 41n], [0n, 33n, 6n], [0n, 0n, 44n]]
    .map(([m, s2, t]) => m * 3600n + s2 * 60n + t);                    // c₁ … c₅ in thirds (‴) of arc
  /** Rsin of an arc m (arcminutes, rational, 0…5400) by Mādhava's polynomial; returned unreduced (num, den > 0). */
  function madhavaRaw(m) {
    const X = m[0], B = m[1] * 5400n, X2 = X * X, B2 = B * B;           // x/q = X/B
    let n = MADHAVA_C[4], Bp = 1n;                                      // S₅ = c₅/3600
    for (let k = 3; k >= 0; k--) { Bp *= B2; n = MADHAVA_C[k] * Bp - X2 * n; }   // S_k = (c_k·B^(2(5−k)) − X²·N_{k+1}) / (3600·B^(2(5−k)))
    const den = 3600n * Bp * B2 * B * m[1];                             // 3600·B¹¹·b, with Bp = B⁸
    return [X * 3600n * Bp * B2 * B - X2 * X * n * m[1], den];          // x − (X/B)³·N₁/(3600·B⁸)
  }
  const madhavaJya = (m) => Q(...madhavaRaw(m));
  /** The arc (arcminutes) of a Mādhava sine y: the first point of a lattice 10,000 times finer than the arc-spanda's whose
   *  sine reaches y. An arc-spanda (1/15,187,500 of a minute) is what the Moon moves in about 27 spandas of time, so on it
   *  the equation stepped and the elongation stood still for tens of spandas; at 1/10,000 of it every spanda of time moves
   *  the Moon by hundreds of steps and the Sun by tens, and the first spanda past an edge is one spanda, however reached. */
  const ARC_FINE = SP_PER_ARCMIN * 10000n;
  function madhavaArc(y) {
    let lo = 0n, hi = 5400n * ARC_FINE;
    if (cmp(madhavaRaw(Q(0n)), y) >= 0) return Q(0n);
    while (hi - lo > 1n) { const mid = (lo + hi) / 2n; if (cmp(madhavaRaw(Q(mid, ARC_FINE)), y) >= 0) hi = mid; else lo = mid; }
    return Q(hi, ARC_FINE);
  }
  const SINE = tier === "madhava" ? { jya: madhavaJya, arc: madhavaArc, R: MADHAVA_R } : { jya: jyaQ, arc: arcQ, R: Q(R) };

  /** The bhuja (0…5400′) of an arc in arcminutes, 2.29-2.30. */
  function bhujaQ(kendra) {
    const k = floor(kendra);
    return k < 5400n ? kendra : k < 10800n ? sub(Q(10800n), kendra) : k < 16200n ? sub(kendra, Q(10800n)) : sub(Q(21600n), kendra);
  }
  /** 2.29-2.45 for the Sun or Moon: the manda equation in arcminutes, signed. */
  function mandaQ(mean, mandocca, pair) {
    const kendra = modQ(sub(mandocca, mean), ARCMIN);                    // 2.29
    const bj = SINE.jya(bhujaQ(kendra));                                // |sine of the kendra|
    const p = sub(Q(...pair[0]), div(mul(sub(Q(...pair[0]), Q(...pair[1])), bj), SINE.R));   // 2.38
    const phala = SINE.arc(div(mul(bj, p), Q(360n)));                   // 2.39, 2.33
    return floor(kendra) < 10800n ? phala : sub(Q(0n), phala);          // 2.45
  }
  /** True Sun and Moon (arcminutes, exact) at τ spandas of the turn. */
  function places(tau) {
    const sunM = meanArcmin(REV.sun, tau), moonM = meanArcmin(REV.moon, tau);
    const sun = modQ(add(sunM, mandaQ(sunM, sunApogeeArcmin(tau), PAIR.sun)), ARCMIN);
    const moon = modQ(add(moonM, mandaQ(moonM, meanArcmin(REV.moonApogee, tau), PAIR.moon)), ARCMIN);
    return { sun, moon };
  }

  // ── the lattice ───────────────────────────────────────────────────────────────────────────────
  const CELLS = Object.freeze({ tithi: 30n, karana: 60n, nakshatra: 27n, yoga: 27n, pada: 108n, rashi: 12n });
  /** Arc in arcminutes → arc-spandas (exact rational). */
  const toSp = (a) => mul(a, Q(SP_PER_ARCMIN));
  function argOf(kind, p) {
    if (kind === "tithi" || kind === "karana") return modQ(sub(p.moon, p.sun), ARCMIN);
    if (kind === "yoga") return modQ(add(p.moon, p.sun), ARCMIN);
    return p.moon;                                                       // nakṣatra, pāda, rāśi of the Moon
  }
  /** Every limb at τ, as integer cells of N (1-based). */
  function limbs(tau) {
    const p = places(tau), out = {};
    for (const [k, c] of Object.entries(CELLS)) out[k] = Number(floor(div(mul(toSp(argOf(k, p)), Q(c)), Q(N)))) + 1;
    out.sunPada = Number(floor(div(mul(toSp(p.sun), Q(108n)), Q(N)))) + 1;
    return out;
  }
  /** Signed distance (arcminutes) of a limb's argument past the edge `edge` (arcminutes), in (−10800, 10800]. */
  function past(kind, tau, edge) { return sub(modQ(add(sub(argOf(kind, places(tau)), edge), Q(10800n)), ARCMIN), Q(10800n)); }
  /** The FIRST spanda of the turn at which the limb's argument reaches `edge`, given lo before it and hi after. */
  function firstAtEdge(kind, edge, lo, hi) {
    if (!(cmp(past(kind, lo, edge), Q(0n)) < 0 && cmp(past(kind, hi, edge), Q(0n)) >= 0)) throw new RangeError("spanda-ganita: the edge is not bracketed");
    while (hi - lo > 1n) { const m = (lo + hi) / 2n; if (cmp(past(kind, m, edge), Q(0n)) < 0) lo = m; else hi = m; }
    return hi;
  }

  // ── time ──────────────────────────────────────────────────────────────────────────────────────
  /** Turn-spandas from civil days since the Kali epoch (a float, for bracketing), and back (exact rational of days). */
  const tauOfDays = (days) => BigInt(Math.round(days * Number(RISINGS) / Number(YUGA) * Number(SPT)));
  const daysOfTau = (tau) => Q(tau * YUGA, RISINGS * SPT);
  /** Split a turn-spanda count: whole turns since the epoch, then the pāda of the turn (1…108, 200 prāṇas each) and
   *  ghaṭī / vināḍī / prāṇa / spanda within the turn. */
  function turnClock(tau) {
    const turn = tau / SPT, w = tau % SPT;
    const pada = w / (SPT / 108n), gh = w / 5467500000n, r1 = w % 5467500000n, vi = r1 / 91125000n, r2 = r1 % 91125000n, pr = r2 / 15187500n, sp = r2 % 15187500n;
    return { turn, padaOfTurn: Number(pada) + 1, ghati: Number(gh), vinadi: Number(vi), prana: Number(pr), spanda: Number(sp) };
  }

  /** End of the tithi `index` (1…30) nearest civil day `nearDays`: the first spanda of the turn at which it ends. */
  function tithiEnd(index, nearDays, windowDays = 1.5) {
    const edge = Q(BigInt(index % 30) * 720n);
    // bracket: walk in steps of a sixth of a day across the window, find where the argument passes the edge
    const step = SPT / 6n; let a = tauOfDays(nearDays - windowDays), pa = past("tithi", a, edge);
    for (let b = a + step; b <= tauOfDays(nearDays + windowDays); b += step) {
      const pb = past("tithi", b, edge);
      if (cmp(pa, Q(0n)) < 0 && cmp(pb, Q(0n)) >= 0 && cmp(sub(pb, pa), Q(5400n)) < 0) return firstAtEdge("tithi", edge, a, b);
      a = b; pa = pb;
    }
    return null;
  }
  const amavasya = (nearDays) => tithiEnd(30, nearDays);
  const purnima = (nearDays) => tithiEnd(15, nearDays);

  /** SS 2.47-2.49: true motions of the Sun and Moon, in arcminutes per turn of the star-wheel. The kendra's motion
   *  × the tabular sine-difference of its step (bhogya-khaṇḍa) ÷ 225 × the epicycle ÷ 360, added from Karka (kendra
   *  90°…270°), subtracted from Makara. With the Mādhava sine the slope is the polynomial's own derivative. */
  function gati(tau) {
    const perTurn = (rev) => Q(rev * ARCMIN, RISINGS);                 // mean motion: R·21600′ in a yuga of RISINGS turns
    const apSun = Q(SUN_APOGEE_KALPA * SUN_REVS * ARCMIN, KALPA_YEARS * RISINGS);
    const one = (rev, apRate, mean, ucca, pair) => {
      const kendra = modQ(sub(ucca, mean), ARCMIN), bh = bhujaQ(kendra), kRate = sub(apRate, perTurn(rev));
      let slope;                                                        // d(jyā)/d(arc) at the bhuja
      if (tier === "madhava") {
        const h = Q(1n, SP_PER_ARCMIN);                                 // one arc-spanda: a chord slope, exact
        slope = div(sub(SINE.jya(add(bh, h)), SINE.jya(bh)), h);
      } else {
        let i = floor(div(bh, Q(225n))); if (i > 23n) i = 23n;
        slope = Q(JYA[Number(i) + 1] - JYA[Number(i)], 225n);           // 2.48: dorjyāntara ÷ 225
      }
      const bj = SINE.jya(bh), p = sub(Q(...pair[0]), div(mul(sub(Q(...pair[0]), Q(...pair[1])), bj), SINE.R));
      const mag = mul(mul(slope, p), div(kRate[0] < 0n ? sub(Q(0n), kRate) : kRate, Q(360n)));   // 2.49: × paridhi ÷ 360
      const k = floor(kendra), fromKarka = k >= 5400n && k < 16200n;
      return add(perTurn(rev), fromKarka ? mag : sub(Q(0n), mag));
    };
    const sunM = meanArcmin(REV.sun, tau), moonM = meanArcmin(REV.moon, tau);
    return {
      sun: one(REV.sun, apSun, sunM, sunApogeeArcmin(tau), PAIR.sun),
      moon: one(REV.moon, perTurn(REV.moonApogee), moonM, meanArcmin(REV.moonApogee, tau), PAIR.moon),
    };
  }

  /** SS 4.8: from a first estimate, correct the time by the remaining elongation over the rate of elongation, again and
   *  again, until the correction is under a spanda; then the integer spanda reached. The rate is the elongation gained
   *  over the next turn (default) or the text's true motions of 2.47-2.49 ({ rate: "text" }). */
  function parvaByIteration(index, startDays, opts) {
    const edge = Q(BigInt(index % 30) * 720n), textRate = opts && opts.rate === "text";
    let tau = tauOfDays(startDays), steps = 0;
    for (; steps < 20; steps++) {
      const d0 = past("tithi", tau, edge);
      let rate;                                                           // arcminutes of elongation in one turn
      if (textRate) { const g = gati(tau); rate = sub(g.moon, g.sun); }
      else rate = sub(past("tithi", tau + SPT, edge), d0);
      const dt = floor(div(mul(sub(Q(0n), d0), Q(SPT)), rate));
      tau += dt;
      if (dt >= -1n && dt <= 1n) break;
    }
    while (cmp(past("tithi", tau, edge), Q(0n)) < 0) tau += 1n;          // settle on the first spanda at or past the edge
    while (cmp(past("tithi", tau - 1n, edge), Q(0n)) >= 0) tau -= 1n;
    return { tau, steps };
  }

  return Object.freeze({ SPT, N, CELLS, Q, add, sub, mul, div, cmp, floor, toNum, meanArcmin, sunApogeeArcmin, jyaQ, arcQ, mandaQ, places,
    limbs, past, firstAtEdge, tauOfDays, daysOfTau, turnClock, tithiEnd, amavasya, purnima, parvaByIteration, gati,
    sine: tier, MADHAVA_R, MADHAVA_C, madhavaJya, madhavaArc, withSine: build });
  }
  return build("madhava");                                            // the default sine: Mādhava's (owner, 2026-10-07)
});
