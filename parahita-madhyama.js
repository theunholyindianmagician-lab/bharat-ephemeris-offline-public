/* parahita-madhyama.js — मध्यम of the Parahita karaṇa: Āryabhaṭa's integer mean motions, the
 * Śakābda-saṃskāra, and Parameśvara's two fractions. Exact rational arithmetic (BigInt); no float on the
 * path; no imports; nothing from any modern source.
 *
 * Parameters and where each is attested:
 *   • 4,320,000 Sun, 57,753,336 Moon revolutions in a yuga, and 1,582,237,500 rotations —
 *     Āryabhaṭīya, Gītikāpāda 3: the words khyughṛ, cayagiyiṅśuchlṛ, ṅiśibuṇḷṣkhṛ, decoded by Āryabhaṭa's own
 *     letter-numerals (katapayadi.js decodeAryabhata; granthas.test.js). Civil days = rotations − Sun
 *     revolutions = 1,577,917,500 [theorem on those two printed numbers].
 *   • 488,219 apogee, 232,226 node (retrograde) — Gītikāpāda 3 as printed in the standard editions, NOT in any
 *     local edition. They are certified here only by parahita-madhyama.test.js: the Kali start lies at ¾ of the yuga,
 *     so a wrong integer moves the place at Parameśvara's epoch by about a quarter circle (¾ of a revolution), and his
 *     stated apogee and node (to the minute) could not be reproduced.
 *   • Kali start = ¾ of the yuga elapsed: Sun 0°, Moon 0°, apogee 90° (Karkaṭa 0), node 180° (Tulā 0)
 *     [consequence of the integers; checked in the test].
 *   • Śakābda-saṃskāra (Jyotirmīmāṃsā p.11, from the Parahita system via Sundararāja): from the Śaka year subtract 444 (vāgbhāva),
 *     multiply by 9 / 65 / 13 (dhana / śata / laya), divide by 85 / 134 / 32 (manda / vailakṣya / rāga): minutes,
 *     SUBTRACTED from the Moon, its apogee and its node. Every number is a Kaṭapayādi word of that verse; the test decodes them.
 *   • Parameśvara (JM p.35): the Moon's minutes diminished by one fifth, the node's by one twelfth, the apogee's whole.
 *   • Mean motions are counted by the CIVIL day (SS 14.19), so the wheel here is ℤ / (1,577,917,500 civil days × 328,050,000,000
 *     spandas): every mean place is an exact residue and returns to itself after one yuga. The civil day itself is derived from the
 *     turns of the star-wheel (kala-dvara.js, SS 1.34/1.39).
 *   • A Śakābda rate of r minutes a year is 200·r revolutions a yuga (4,320,000 years × r ÷ 21,600). Parameśvara's rates are
 *     16.94 (Moon), 97.01 (apogee) and 74.48 (node) revolutions a yuga — not whole numbers, so the tradition's own bīja opened the
 *     wheel; a whole-number bīja keeps it closed. sakabdaRevPerYuga() gives the exact rational.
 * Planets other than Sun and Moon are not here: their integers are not attested in any local source.
 * Browser: window.ParahitaMadhyama; node: module.exports.
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.ParahitaMadhyama = factory();
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";
  const YUGA_DAYS = 1577917500n;
  const SPD = 328050000000n;                                   // spandas per ahorātra (lattice-invariants.test.js)
  const ARCSEC = 1296000n;                                     // 360 × 3600
  const REV = Object.freeze({ sun: 4320000n, moon: 57753336n, apogee: 488219n, node: 232226n });
  const RETROGRADE = Object.freeze({ sun: false, moon: false, apogee: false, node: true });
  const KALI_START_ELAPSED = YUGA_DAYS * 3n / 4n;              // 1,183,438,125 days: an integer
  const SAKA_KALI_OFFSET = 3179n;                              // Śaka year (elapsed) = Kali year (elapsed) − 3179
  const SAKA_ZERO = 444n;
  const SAKABDA = Object.freeze({
    moon:   { mul: 9n,  div: 85n,  fraction: [4n, 5n] },        // taken less one fifth
    apogee: { mul: 65n, div: 134n, fraction: [1n, 1n] },        // taken whole
    node:   { mul: 13n, div: 32n,  fraction: [11n, 12n] },      // taken less one twelfth
  });

  const mod = (x, m) => ((x % m) + m) % m;
  const bodyOf = (b) => { if (!(b in REV)) throw new RangeError(`parahita-madhyama: unknown body "${b}"`); return b; };

  /** Mean longitude at `spandas` since the Kali epoch, as an exact rational number of arcseconds in [0, 1,296,000). */
  function meanArcsec(body, spandas) {
    bodyOf(body);
    const S = typeof spandas === "bigint" ? spandas : BigInt(spandas);
    const den = YUGA_DAYS * SPD;
    const t = KALI_START_ELAPSED * SPD + S;                    // spandas since the start of the yuga
    const num = RETROGRADE[body] ? mod(-(t * REV[body]), den) : mod(t * REV[body], den);
    return { num: num * ARCSEC, den };
  }
  /** Kali years elapsed minus 3179 minus 444: the n of the Śakābda rule, as an exact rational. */
  function sakabdaYears(spandas) {
    const S = typeof spandas === "bigint" ? spandas : BigInt(spandas);
    return { num: S * REV.sun - (SAKA_KALI_OFFSET + SAKA_ZERO) * YUGA_DAYS * SPD, den: YUGA_DAYS * SPD };
  }
  /** Śakābda minutes to SUBTRACT (exact rational); `parameshvara` applies his 1/5 and 1/12. The Sun gets none. */
  function sakabdaMinutes(body, spandas, { parameshvara = true } = {}) {
    bodyOf(body);
    if (!SAKABDA[body]) return { num: 0n, den: 1n };
    const r = SAKABDA[body], n = sakabdaYears(spandas);
    const f = parameshvara ? r.fraction : [1n, 1n];
    return { num: n.num * r.mul * f[0], den: n.den * r.div * f[1] };
  }
  /** The Śakābda rate of a body as revolutions per yuga (exact rational): 200 × mul / div, times Parameśvara's fraction. */
  function sakabdaRevPerYuga(body, { parameshvara = true } = {}) {
    bodyOf(body);
    if (!SAKABDA[body]) return { num: 0n, den: 1n };
    const r = SAKABDA[body], f = parameshvara ? r.fraction : [1n, 1n];
    return { num: r.mul * f[0] * REV.sun, den: r.div * f[1] * 21600n };
  }
  /** The Parahita place after the Śakābda-saṃskāra: exact rational arcseconds in [0, 1,296,000). */
  function parahitaArcsec(body, spandas, opts) {
    const m = meanArcsec(body, spandas), c = sakabdaMinutes(body, spandas, opts);
    // minutes → arcseconds ×60; common denominator
    const den = m.den * c.den;
    return { num: mod(m.num * c.den - c.num * 60n * m.den, ARCSEC * den), den };
  }
  /** Arcseconds (rational) → { degrees, minutes (float, fractional) } for display and for minute-level comparison. */
  function toDegMin({ num, den }) {
    const micro = (num * 1000000n) / den;                      // millionths of an arcsecond
    const totalMin = Number(micro) / 60e6;
    const degrees = Math.floor(totalMin / 60);
    return { degrees, minutes: totalMin - degrees * 60 };
  }
  /** Offset, in days, from `ahargana` (a whole Kali day's start) to the nearest MEAN syzygy of the given kind ('new' | 'full'). Exact, then floated. */
  function meanSyzygyOffsetDays(ahargana, kind) {
    const A = typeof ahargana === "bigint" ? ahargana : BigInt(ahargana);
    const rate = REV.moon - REV.sun;                           // elongation revolutions per yuga
    const den = YUGA_DAYS;
    const D = mod((KALI_START_ELAPSED + A) * rate, den);       // elongation, in units of 1/den revolution
    const target = kind === "full" ? den / 2n : 0n;
    let d = mod(target - D, den);
    if (d > den / 2n) d -= den;
    return Number((d * 1000000n * YUGA_DAYS) / (den * rate)) / 1e6;   // × synodic month (YUGA_DAYS/rate)
  }

  return Object.freeze({ YUGA_DAYS, SPD, REV, RETROGRADE, SAKABDA, SAKA_ZERO, SAKA_KALI_OFFSET, meanArcsec, sakabdaYears, sakabdaMinutes, sakabdaRevPerYuga, parahitaArcsec, toDegMin, meanSyzygyOffsetDays });
});
