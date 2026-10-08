/* sphuta.js — स्फुट, the true Sun and Moon of the Sūrya-Siddhānta, on its own wheel and with its own sine table.
 *
 * Mean places (madhyama) are exact residues on the SS wheel: revolutions R in a yuga of 1,577,917,828 civil days
 * (SS 1.29-1.37), counted from midnight at Laṅkā at the start of the Kali-yuga, when 452¾ yugas of planetary motion had
 * elapsed since creation (1.45-1.47: 1,953,720,000 years to the end of the Kṛta, + Tretā + Dvāpara = 1,955,880,000).
 * So every place is frac(R × (1811/4 + days/1,577,917,828)), in BigInt; the Sun's apogee moves 387 revolutions in a kalpa
 * of 1000 yugas (1.41), the Moon's 488,203 in a yuga, its node 232,238 backwards (1.33).
 *
 * True places (sphuṭa) follow ch.2 literally:
 *   2.17-2.22  the 24 sines at 225′ steps on R = 3438 (decoded from the verses' numeral words in the test);
 *   2.29-2.30  kendra = mandocca − planet; its bhuja and koṭi by quadrant;      2.31-2.33 interpolation, and the arc of a sine;
 *   2.34-2.38  manda epicycle 14° (Sun) and 32° (Moon) at the even ends, 13°40′ and 31°40′ at the odd ends, varying with the bhuja;
 *   2.39       manda equation = arc( bhujajyā × epicycle ÷ 360 );   2.43 one manda operation for Sun and Moon;
 *   2.45       added when the kendra is in Meṣa…Kanyā, subtracted from Tulā on;
 *   2.57, 1.68 the Moon's latitude = sine(Moon − node) × 270′ ÷ R;
 *   3.9-3.10   ayanāṃśa: 600 librations a yuga; three-tenths of the bhuja of that arc, in degrees.
 * Only this tier's arithmetic is reproduced here; the Moon has the text's single equation and no second one. That is the
 * text's Moon, not the sky's: its distance from the sky is what the owner's vedha will measure. No imports.
 * The sine (owner's decision, 2026-10-07, "use everything that aligns with 100% accuracy"): by default Mādhava's sine,
 * carried to R = 3438, which is the sine to 6e-5 of an R-unit; the text's 24-entry table with linear interpolation, as
 * written, is withSine("table") — the 24 numbers themselves (JYA) are the same in both. Against the ancestors' 15 recorded
 * eclipses the two give the same verdict on every one (ss-madhava.test.js). `sineSlope` is 2.48's tabular difference ÷ 225
 * with the table, the polynomial's derivative with Mādhava's.
 * Browser: window.Sphuta; node: module.exports.
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.Sphuta = factory();
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";
  return build("madhava");
  function build(SINE_NAME) {
  const SPD = 328050000000n;                     // spandas per civil day
  const YUGA_DAYS = 1577917828n;                 // SS 1.37
  const Q_NUM = 1811n, Q_DEN = 4n;               // 452¾ yugas elapsed at the Kali start (1.45-1.47)
  const REV = Object.freeze({ sun: 4320000n, moon: 57753336n, moonApogee: 488203n, node: 232238n });
  const SUN_APOGEE_PER_KALPA = 387n, KALPA_YUGAS = 1000n;                   // 1.41, 1.40
  const AYANA_LIBRATIONS = 600n;                                            // 3.9: thirty score in a yuga
  const R = 3438;
  // 2.17-2.22 — the 24 jyārdha-piṇḍas (the test decodes each from its verse words)
  const JYA = Object.freeze([0, 225, 449, 671, 890, 1105, 1315, 1520, 1719, 1910, 2093, 2267, 2431, 2585, 2728, 2859,
    2978, 3084, 3177, 3256, 3321, 3372, 3409, 3431, 3438]);
  const PARIDHI = Object.freeze({ sun: [14, 13 + 40 / 60], moon: [32, 31 + 40 / 60] });                 // 2.34-2.35
  const MOON_MAX_LATITUDE_ARCMIN = 21600 / 80;                                                            // 1.68 = 270′

  const big = (x) => (typeof x === "bigint" ? x : BigInt(x));
  const mod = (a, m) => ((a % m) + m) % m;
  /** Civil spandas since the Kali epoch (midnight at Laṅkā) from a day count that may be fractional. */
  function spandasOfDays(days) {
    if (typeof days === "bigint") return days * SPD;
    const whole = Math.floor(days);
    return BigInt(whole) * SPD + BigInt(Math.round((days - whole) * Number(SPD)));
  }
  /** Fraction of a revolution of a body moving R revolutions per yuga (×perYugaDen), exact: {num, den}, 0 ≤ num < den. */
  function revFraction(revNum, revDen, S, retrograde) {
    const den = Q_DEN * YUGA_DAYS * SPD * revDen;
    const t = Q_NUM * YUGA_DAYS * SPD + Q_DEN * big(S);                       // ×(Q_DEN·YUGA_DAYS·SPD): elapsed yugas
    const num = mod((retrograde ? -1n : 1n) * revNum * t, den);
    return { num, den };
  }
  const toDeg = ({ num, den }) => Number((num * 9007199254740992n) / den) / 9007199254740992 * 360;

  /** Mean places in degrees (sidereal, from the text's Meṣa 0) at civil spandas S since the Kali epoch. */
  function madhyama(S) {
    const s = big(S);
    return {
      sun: toDeg(revFraction(REV.sun, 1n, s, false)),
      moon: toDeg(revFraction(REV.moon, 1n, s, false)),
      moonApogee: toDeg(revFraction(REV.moonApogee, 1n, s, false)),
      node: toDeg(revFraction(REV.node, 1n, s, true)),
      sunApogee: toDeg(revFraction(SUN_APOGEE_PER_KALPA, KALPA_YUGAS, s, false)),
    };
  }

  // ── the sine table, as the text uses it ──────────────────────────────────────────────────────────
  /** 2.31-2.32: R-sine of an arc of 0…5400 minutes by the table and linear interpolation. */
  function tableJya(m) {
    const i = Math.min(Math.floor(m / 225), 23);
    return JYA[i] + (m - 225 * i) * (JYA[i + 1] - JYA[i]) / 225;
  }
  /** 2.33: arc in minutes of an R-sine 0…3438. */
  function tableArc(x) {
    let i = 0;
    while (i < 23 && JYA[i + 1] <= x) i++;
    return 225 * i + (x - JYA[i]) * 225 / (JYA[i + 1] - JYA[i]);
  }
  /** 2.48: the sine's rate (R-sine per minute) at an arc: the tabular difference of its 225′ step ÷ 225. */
  const tableSlope = (m) => { const i = Math.min(Math.floor(m / 225), 23); return (JYA[i + 1] - JYA[i]) / 225; };

  // ── Mādhava's sine, on the text's radius ─────────────────────────────────────────────────────────
  // Rsin x = x − (x/q)³[c₁ − (x/q)²[c₂ − (x/q)²[c₃ − (x/q)²[c₄ − (x/q)² c₅]]]], q = 5400′, radius 3437′44″48‴; the
  // coefficients are the Kaṭapayādi words nirviddhāṅganarendraruṅ, sarvārthaśīlasthira, kavīśanicaya, tunnabala, vidvān
  // (katapayadi.test.js decodes them; spanda-ganita.js holds the same as exact rationals). Here it is carried to the text's
  // R = 3438, so that 1397 (2.28) and every other R-sine of the text keep their radius; a sine → ratio → arc chain does
  // not see the scale. Its arc is the polynomial's inverse (Newton's step on the polynomial, kept inside a bracket).
  const MADHAVA_R = 3437 + 44 / 60 + 48 / 3600;
  const MADHAVA_C = Object.freeze([2220 + 39 / 60 + 40 / 3600, 273 + 57 / 60 + 47 / 3600, 16 + 5 / 60 + 41 / 3600, 33 / 60 + 6 / 3600, 44 / 3600]);
  const MS = R / MADHAVA_R;
  function madhavaJya(m) {
    const u = m / 5400, u2 = u * u, c = MADHAVA_C;
    return (m - u2 * u * (c[0] - u2 * (c[1] - u2 * (c[2] - u2 * (c[3] - u2 * c[4]))))) * MS;
  }
  function madhavaSlope(m) {
    const u = m / 5400, u2 = u * u, c = MADHAVA_C;
    return (1 - u2 * (3 * c[0] - u2 * (5 * c[1] - u2 * (7 * c[2] - u2 * (9 * c[3] - u2 * 11 * c[4])))) / 5400) * MS;
  }
  function madhavaArc(x) {
    let lo = 0, hi = 5400, m = tableArc(x);
    for (let k = 0; k < 100; k++) {
      const f = madhavaJya(m) - x;
      if (f === 0) break;
      if (f > 0) hi = m; else lo = m;
      const d = madhavaSlope(m);
      let next = d > 0 ? m - f / d : (lo + hi) / 2;
      if (!(next > lo && next < hi)) next = (lo + hi) / 2;
      if (Math.abs(next - m) < 1e-11) { m = next; break; }
      m = next;
    }
    return m;
  }
  const SINES = Object.freeze(["table", "madhava"]);
  if (!SINES.includes(SINE_NAME)) throw new RangeError("sphuta: the sine is one of " + SINES.join(", "));
  const MADHAVA = SINE_NAME === "madhava";
  /** R-sine of an arc of 0…5400 minutes: the table (2.31-2.32), or Mādhava's on R = 3438. */
  function jyaOfArcmin(m) {
    if (!(m >= 0 && m <= 5400)) throw new RangeError("sphuta: jyā is tabulated for 0…90°");
    return MADHAVA ? madhavaJya(m) : tableJya(m);
  }
  /** The arc in minutes of an R-sine 0…3438 (2.33). */
  function arcminOfJya(x) {
    if (!(x >= 0 && x <= R)) throw new RangeError("sphuta: an R-sine lies in 0…3438");
    return MADHAVA ? (x >= R ? 5400 : madhavaArc(x)) : tableArc(x);
  }
  /** The sine's rate at an arc of 0…5400 minutes (R-sine per minute): 2.48's tabular step, or the polynomial's derivative. */
  function sineSlope(m) { return MADHAVA ? madhavaSlope(m) : tableSlope(m); }
  /** 2.29-2.30: the bhuja of an arc (degrees) and the sign of its sine. */
  function bhuja(deg) {
    const d = mod(deg, 360);
    if (d < 90) return { bhuja: d, sign: 1 };
    if (d < 180) return { bhuja: 180 - d, sign: 1 };
    if (d < 270) return { bhuja: d - 180, sign: -1 };
    return { bhuja: 360 - d, sign: -1 };
  }
  /** Signed R-sine of any arc in degrees, by the table. */
  function jya(deg) { const b = bhuja(deg); return b.sign * jyaOfArcmin(b.bhuja * 60); }

  /** 2.29-2.45: the manda equation in degrees for a mean place and its mandocca, with the text's epicycle pair. */
  function mandaPhala(mean, mandocca, pair) {
    const kendra = mod(mandocca - mean, 360);                                  // 2.29
    const bj = Math.abs(jya(kendra));
    const paridhi = pair[0] - (pair[0] - pair[1]) * bj / R;                    // 2.38
    const phalaArcmin = arcminOfJya(bj * paridhi / 360);                      // 2.39 (+ 2.33)
    const sign = kendra < 180 ? 1 : -1;                                        // 2.45
    return { kendra, paridhi, degrees: sign * phalaArcmin / 60 };
  }

  /** True Sun, true Moon, the node, the Moon's latitude, and the mean places, at civil spandas S since the Kali epoch. */
  function sphuta(S) {
    const m = madhyama(S);
    const sunEq = mandaPhala(m.sun, m.sunApogee, PARIDHI.sun);
    const moonEq = mandaPhala(m.moon, m.moonApogee, PARIDHI.moon);
    const sun = mod(m.sun + sunEq.degrees, 360);
    const moon = mod(m.moon + moonEq.degrees, 360);
    const latitude = jya(moon - m.node) * MOON_MAX_LATITUDE_ARCMIN / R / 60;   // 2.57, degrees
    return { sun, moon, rahu: m.node, ketu: mod(m.node + 180, 360), moonLatitude: latitude, mean: m, equations: { sun: sunEq, moon: moonEq } };
  }
  function sphutaAtDays(days) { return sphuta(spandasOfDays(days)); }

  /** 3.9-3.10: the text's ayanāṃśa in degrees. The arc runs 600 times round in a yuga and is zero at the Kali start
   *  (271,650 whole turns since creation); the ayanāṃśa is three-tenths of its bhuja. The sign is the reading that makes
   *  the present half-cycle (from Kali 3600 = 499 CE) positive, as Parameśvara's observed 15° in Kali 4536 implies. */
  function ayanamshaSS(S) {
    const f = revFraction(AYANA_LIBRATIONS, 1n, big(S), false);
    const theta = toDeg(f);
    const b = bhuja(theta);
    return -b.sign * 0.3 * b.bhuja;
  }

  return Object.freeze({ SPD, YUGA_DAYS, REV, JYA, PARIDHI, MOON_MAX_LATITUDE_ARCMIN, R, spandasOfDays, madhyama, jyaOfArcmin, arcminOfJya, bhuja, jya, mandaPhala, sphuta, sphutaAtDays, ayanamshaSS,
    sine: SINE_NAME, SINES, MADHAVA_R, MADHAVA_C, sineSlope, withSine: build });
  }
});
