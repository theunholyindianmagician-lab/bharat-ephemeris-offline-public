/* sukshma-kala.js — सूक्ष्म-काल: the resolution the divisional charts (vargas) demand of time, with exact division
 * arithmetic, and the lattice that links the nakṣatra loop (ℤ/27) to the graha loop (ℤ/9).
 *
 * WHY. A varga D-n divides each sign of 30° into n parts; a placement is decided only when the body's longitude is
 * farther from the nearest part boundary than the uncertainty of that longitude. The finest parts are small: one
 * ṣaṣṭyāṃśa (D-60) is 30′, one nāḍyaṃśa (D-150) is 12′. The lagna moves about a degree in four minutes of clock, the
 * Moon 13° in a day, so the same parts are a minute or a few seconds of birth time for the lagna and tens of minutes for
 * the Moon. This file states those numbers for any varga and any rate, computes every index and margin exactly, and
 * gives the lattice identities. It judges nothing about a chart; it measures what a tier's declared uncertainty leaves
 * decided. The uncertainties themselves are the tiers' measured figures (the research page passes them in).
 *
 * THE RULES. The sixteen vargas of Bṛhat Parāśara Horā Śāstra ch.6 as the local edition states them (editions/
 * parashara-rahasya-full-edition.html, the "गणित / तकनीक" lines) and as math-core.js computeVarga has long computed
 * them: equal arcs of 30°/n counted from a sign that depends on the sign's parity or triplicity, the triṃśāṃśa's
 * unequal arcs (odd signs 5/5/8/7/5, even 5/7/8/5/5), the horā's halves. D-144 (the dvādaśāṃśa's dvādaśāṃśa) and D-150
 * (the nāḍyaṃśa of the nāḍī texts) are not among the edition's sixteen: counted from the sign itself [standard].
 * sukshma-kala.test.js checks every rule against computeVarga on random longitudes and the exact boundaries.
 *
 * ARITHMETIC. Longitudes come in as degrees (float, the tiers' output); they are rounded once to micro-arcseconds
 * (BigInt) and every division, index and margin is exact after that. Nothing here is trigonometric; nothing is imported.
 *
 * THE LATTICE. 27 nakṣatras × 4 pādas = 108 = 12 rāśis × 9 navāṃśas, and one pāda = one navāṃśa = 3°20′ exactly, so the
 * pāda index k ∈ ℤ/108 of a longitude gives both its nakṣatra (⌊k/4⌋) and its navāṃśa within the sign (k mod 9)
 * [theorem]. The Vimśottarī lord of a nakṣatra is its index mod 9 in the order Ketu, Śukra, Sūrya, Candra, Maṅgala, Rāhu,
 * Guru, Śani, Budha from Aśvinī (BPHS 46.12-46.13, dasha.js), the 27 → 9 projection; the balance at birth is the part of
 * the nakṣatra gone (46.16), so one minute of arc of the Moon is years × 365.26 ÷ 800 days of daśā. These are counting
 * identities: they carry no information about the sky. The accuracy of the loop is the accuracy of the Moon, the lagna
 * and the frame that feed it.
 *
 * Browser: window.SukshmaKala; node: module.exports.
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.SukshmaKala = factory();
})(typeof globalThis !== "undefined" ? globalThis : this, function sukshmaKalaOf() {
  "use strict";
  const MICRO = 3600000000n;                       // micro-arcseconds in a degree
  const SIGN = 30n * MICRO, CIRCLE = 12n * SIGN, PADA = CIRCLE / 108n;   // 3°20′ = 12,000,000,000 µas exactly
  const mod = (a, m) => ((a % m) + m) % m;
  const fin = (x, what) => { if (typeof x !== "number" || !Number.isFinite(x)) throw new TypeError(`sukshma-kala: ${what} must be a finite number`); return x; };
  /** A longitude in degrees → micro-arcseconds in [0, CIRCLE), rounded once. */
  const microOf = (lonDeg) => mod(BigInt(Math.round(fin(lonDeg, "the longitude") * 3.6e9)), CIRCLE);
  const degOf = (micro) => Number(micro) / 3.6e9;
  const arcsecOf = (micro) => Number(micro) / 1e6;

  // the sixteen as the local edition states them: 13 rules verbatim; D-16's dual start, D-24's even signs and D-27's sign
  // offsets are where the edition is silent or variant, so those carry rule "standard" and a note (audited 2026-10-09)
  const VARGAS = Object.freeze([
    { code: "D1", n: 1, name: "Rāśi", nameSa: "राशि", rule: "text" },
    { code: "D2", n: 2, name: "Horā", nameSa: "होरा", rule: "text" },
    { code: "D3", n: 3, name: "Dreṣkāṇa", nameSa: "द्रेष्काण", rule: "text" },
    { code: "D4", n: 4, name: "Caturthāṃśa", nameSa: "चतुर्थांश", rule: "text" },
    { code: "D7", n: 7, name: "Saptāṃśa", nameSa: "सप्तांश", rule: "text" },
    { code: "D9", n: 9, name: "Navāṃśa", nameSa: "नवांश", rule: "text" },
    { code: "D10", n: 10, name: "Daśāṃśa", nameSa: "दशांश", rule: "text" },
    { code: "D12", n: 12, name: "Dvādaśāṃśa", nameSa: "द्वादशांश", rule: "text" },
    { code: "D16", n: 16, name: "Ṣoḍaśāṃśa", nameSa: "षोडशांश", rule: "standard", note: "movable signs from Meṣa and fixed from Siṃha as the edition states (6.16); for dual signs the edition reads 'aśvi-pāṭha' and says the counting tradition usually takes Dhanu, a text variant: Dhanu is used here [standard]" },
    { code: "D20", n: 20, name: "Viṃśāṃśa", nameSa: "विंशांश", rule: "text" },
    { code: "D24", n: 24, name: "Caturviṃśāṃśa", nameSa: "चतुर्विंशांश", rule: "standard", note: "odd signs from Siṃha forward as the edition states (6.22); for even signs it starts at Karka and says the deity sequence runs in reverse (6.23) and gives no sign output: the sign is counted forward from Karka here, the common rule [standard]" },
    { code: "D27", n: 27, name: "Saptaviṃśāṃśa", nameSa: "सप्तविंशांश", rule: "standard", note: "the edition (6.24-6.26) gives the 27 nakṣatra deities from Meṣa in order and no sign output; the sign start by the sign's element (Meṣa, Karka, Tulā, Makara) is the common rule, not the edition's [standard]; the edition prints the arc as 1°1′20″, an arithmetic slip for 30°/27 = 1°6′40″" },
    { code: "D30", n: 30, name: "Triṃśāṃśa", nameSa: "त्रिंशांश", rule: "text", unequal: true },
    { code: "D40", n: 40, name: "Khavedāṃśa", nameSa: "खवेदांश", rule: "text" },
    { code: "D45", n: 45, name: "Akṣavedāṃśa", nameSa: "अक्षवेदांश", rule: "text" },
    { code: "D60", n: 60, name: "Ṣaṣṭyāṃśa", nameSa: "षष्ट्यंश", rule: "text", note: "N = ⌊2λ⌋ + 1 counted from the sign itself (6.33, the edition's worked example); for even signs verse 6.40 takes the sixty NAMES in reverse order (vyatyaya) — the sign of the part is counted forward here for every sign, the common rule; the names are not computed [reading]" },
    { code: "D144", n: 144, name: "Dvādaśa-dvādaśāṃśa", nameSa: "द्वादश-द्वादशांश", rule: "standard", note: "the dvādaśāṃśa's dvādaśāṃśa, counted from the sign itself; not among the sixteen of the local edition" },
    { code: "D150", n: 150, name: "Nāḍyaṃśa", nameSa: "नाड्यंश", rule: "standard", note: "the nāḍī texts' division; no local edition; counted from the sign itself" },
  ].map(Object.freeze));
  const BY_CODE = Object.freeze(Object.fromEntries(VARGAS.map((v) => [v.code, v])));
  const vargaOf = (code) => { const v = BY_CODE[code]; if (!v) throw new RangeError(`sukshma-kala: unknown varga "${code}"`); return v; };
  /** The width of one part, exact: { micro (BigInt µas), arcsec, deg }. The triṃśāṃśa has unequal parts (5°…8°). */
  function partWidth(code) {
    const v = vargaOf(code);
    if (v.unequal) return { micro: null, arcsec: null, deg: null, unequal: true, arcsDeg: [5, 5, 8, 7, 5] };
    const num = SIGN, den = BigInt(v.n);
    return { micro: num / den, exact: num % den === 0n, arcsec: Number(num) / Number(den) / 1e6, deg: 30 / v.n, unequal: false };
  }
  /** The part (0 … n−1) a longitude-within-sign (µas) falls in. */
  const partOf = (within, n) => Number((within * BigInt(n)) / SIGN);
  // the triṃśāṃśa's edges in µas, odd signs then even signs (SS: BPHS 6.26-6.28 as computeVarga)
  const T30_ODD = [0n, 5n, 10n, 18n, 25n, 30n].map((d) => d * MICRO), T30_EVEN = [0n, 5n, 12n, 20n, 25n, 30n].map((d) => d * MICRO);
  const T30_ODD_SIGNS = [0, 10, 8, 2, 6], T30_EVEN_SIGNS = [1, 5, 11, 9, 7];
  /** The varga sign (0 = Meṣa … 11 = Mīna) of a longitude, by the rules of BPHS ch.6 as computeVarga states them. */
  function index(lonDeg, code) {
    const v = vargaOf(code), micro = microOf(lonDeg), r = Number(micro / SIGN), within = micro % SIGN, odd = r % 2 === 0;
    const p = v.unequal ? null : partOf(within, v.n);
    switch (code) {
      case "D1": return r;
      case "D2": return odd ? (within < 15n * MICRO ? 4 : 3) : (within < 15n * MICRO ? 3 : 4);
      case "D3": return (r + [0, 4, 8][p]) % 12;
      case "D4": return (r + 3 * p) % 12;
      case "D7": return ((odd ? r : r + 6) + p) % 12;
      case "D9": return ((r % 3 === 0 ? r : r % 3 === 1 ? r + 8 : r + 4) + p) % 12;
      case "D10": return ((odd ? r : r + 8) + p) % 12;
      case "D12": case "D60": case "D144": case "D150": return (r + p) % 12;
      case "D16": case "D45": return ([0, 4, 8][r % 3] + p) % 12;
      case "D20": return ([0, 8, 4][r % 3] + p) % 12;
      case "D24": return ((odd ? 4 : 3) + p) % 12;
      case "D27": return ([0, 3, 6, 9][r % 4] + p) % 12;
      case "D30": { const E = odd ? T30_ODD : T30_EVEN, S = odd ? T30_ODD_SIGNS : T30_EVEN_SIGNS; for (let i = 0; i < 5; i++) if (within < E[i + 1]) return S[i]; return S[4]; }
      case "D40": return ((odd ? 0 : 6) + p) % 12;
      default: throw new RangeError(`sukshma-kala: no rule for ${code}`);
    }
  }
  /** The part index within the sign (0 … n−1; the triṃśāṃśa's 0 … 4) and the distance to the nearest boundary of
   *  the source division, exact in µas: { part, marginMicro, marginArcsec, lowerMicro, upperMicro }. */
  function margin(lonDeg, code) {
    const v = vargaOf(code), micro = microOf(lonDeg), r = Number(micro / SIGN), within = micro % SIGN, odd = r % 2 === 0;
    let lower, upper, part;
    if (code === "D2") { part = within < 15n * MICRO ? 0 : 1; lower = part === 0 ? 0n : 15n * MICRO; upper = part === 0 ? 15n * MICRO : SIGN; }
    else if (v.unequal) { const E = odd ? T30_ODD : T30_EVEN; part = 0; while (part < 4 && within >= E[part + 1]) part++; lower = E[part]; upper = E[part + 1]; }
    else { part = partOf(within, v.n); lower = (SIGN * BigInt(part)) / BigInt(v.n); upper = (SIGN * BigInt(part + 1)) / BigInt(v.n); }
    const m = within - lower < upper - within ? within - lower : upper - within;
    return { code, sign: r, part, marginMicro: m, marginArcsec: arcsecOf(m), lowerMicro: lower, upperMicro: upper, lowerDeg: r * 30 + degOf(lower), upperDeg: r * 30 + degOf(upper) };
  }
  /** What a varga's part is in time, for given rates: the lagna's seconds of clock (deg a minute), the Moon's minutes
   *  and the Sun's hours (deg a day). For the triṃśāṃśa the smallest part (5°) is used. */
  function resolution(code, rates) {
    const v = vargaOf(code), w = partWidth(code), partDeg = v.unequal ? 5 : w.deg;
    const out = { code, name: v.name, nameSa: v.nameSa, rule: v.rule, partDeg, partArcmin: partDeg * 60, unequal: !!v.unequal };
    if (rates && Number.isFinite(rates.lagnaDegPerMin) && rates.lagnaDegPerMin > 0) out.lagnaSeconds = partDeg / rates.lagnaDegPerMin * 60;
    if (rates && Number.isFinite(rates.moonDegPerDay) && rates.moonDegPerDay > 0) out.moonMinutes = partDeg / rates.moonDegPerDay * 1440;
    if (rates && Number.isFinite(rates.sunDegPerDay) && rates.sunDegPerDay > 0) out.sunHours = partDeg / rates.sunDegPerDay * 24;
    return out;
  }
  /** A placement under a declared uncertainty (arcseconds): decided when the margin exceeds it. */
  function assess(lonDeg, code, budgetArcsec) {
    const m = margin(lonDeg, code), b = fin(budgetArcsec, "the budget");
    if (b < 0) throw new RangeError("sukshma-kala: the budget is nonnegative arcseconds");
    return { ...m, index: index(lonDeg, code), budgetArcsec: b, decided: m.marginArcsec > b, partsSpanned: (() => { const w = partWidth(code); return w.unequal ? null : b / w.arcsec; })() };
  }
  /** Every body of `positions` ({ key: lonDeg }) in every varga of `codes`, each under its body's budget ({ key: arcsec }). */
  function chart(positions, codes, budgets = {}) {
    const out = {};
    for (const [key, lon] of Object.entries(positions)) {
      out[key] = {};
      for (const code of codes) out[key][code] = assess(lon, code, Number.isFinite(budgets[key]) ? budgets[key] : 0);
    }
    return out;
  }

  // ── the lattice: ℤ/27 × ℤ/4 ≅ ℤ/108 ≅ 12 × 9; the 27 → 9 projection of the Vimśottarī lords ──────────────────────
  const LORDS = Object.freeze(["Ketu", "Śukra", "Sūrya", "Candra", "Maṅgala", "Rāhu", "Guru", "Śani", "Budha"]);   // from Aśvinī (BPHS 46.12-46.13)
  const LORD_YEARS = Object.freeze([7, 20, 6, 10, 7, 18, 16, 19, 17]);
  const NAKSHATRA_ARCMIN = 800;                                                  // 13°20′
  /** The cell of a longitude on the 108-lattice: k = ⌊λ / 3°20′⌋, its nakṣatra (1…27), pāda (1…4), rāśi (0…11), navāṃśa
   *  within the sign (0…8) — and the theorem that the navāṃśa index equals k mod 9 (checked in the test). */
  function cell(lonDeg) {
    const micro = microOf(lonDeg), k = Number(micro / PADA), rem = micro % PADA;
    const nakshatra = Math.floor(k / 4) + 1, pada = (k % 4) + 1, rashi = Math.floor(k / 9), navamsha = k % 9;
    return { k, nakshatra, pada, rashi, navamsha, navamshaSign: index(lonDeg, "D9"), lord: LORDS[(nakshatra - 1) % 9], lordIndex: (nakshatra - 1) % 9,
      fractionOfPada: Number(rem) / Number(PADA), fractionOfNakshatra: (Number(micro - BigInt(nakshatra - 1) * 4n * PADA)) / Number(4n * PADA) };
  }
  /** Days of Vimśottarī daśā per minute of arc of the Moon at birth, for a lord (name or index) and a year length in days. */
  function dashaDaysPerArcmin(lord, yearDays = 1577917828 / 4320000) {
    const i = typeof lord === "number" ? lord : LORDS.indexOf(lord);
    if (!(i >= 0 && i < 9)) throw new RangeError(`sukshma-kala: unknown lord ${lord}`);
    return LORD_YEARS[i] * fin(yearDays, "the year") / NAKSHATRA_ARCMIN;
  }
  const LATTICE = Object.freeze({ nakshatras: 27, padas: 4, cells: 108, rashis: 12, navamshas: 9, padaMicro: PADA, padaArcmin: 200, lords: LORDS, lordYears: LORD_YEARS, totalYears: LORD_YEARS.reduce((a, b) => a + b, 0),
    identities: ["27 × 4 = 108 = 12 × 9", "one pāda = one navāṃśa = 3°20′ exactly, so navāṃśa-in-sign = k mod 9 and nakṣatra = ⌊k/4⌋ + 1 for the same k [theorem]", "the lord of nakṣatra n is LORDS[(n − 1) mod 9]: the 27 → 9 projection", "the nine lords' years sum to 120"] });

  // ── the ring tower in the text's numbers: ν₃, the 3-adic valuation of a count ──────────────────────────────────────
  /** ν₃(n): how many times 3 divides the integer n (BigInt or integer); the level k at which n lies in the owner's tower
   *  (ℤ/3^k ℤ, 2, k). ν₃ = 0 means n is a unit mod 3^k for every k (invertible); the kuṭṭaka on such a count always solves. */
  function nu3(n) {
    let v = typeof n === "bigint" ? n : BigInt(fin(n, "the count"));
    if (v === 0n) throw new RangeError("sukshma-kala: ν₃(0) is not finite");
    if (v < 0n) v = -v;
    let k = 0; while (v % 3n === 0n) { v /= 3n; k++; }
    return k;
  }
  /** A table of counts [{ name, value, source }] → the same with ν₃, the 3-free part and whether the count is a unit mod 3. */
  function valuationTable(entries) {
    return entries.map((e) => { const v = typeof e.value === "bigint" ? e.value : BigInt(e.value); const k = nu3(v); return { ...e, value: v.toString(), nu3: k, threeFreePart: (v / (3n ** BigInt(k))).toString(), unitMod3: k === 0 }; });
  }
  /** The cycles of x ↦ g·x on ℤ/modulus (g = 2 by default): structure only — no daśā or transit rule is derived from it.
   *  On ℤ/9 the cycle lengths are 1, 6, 2 and on ℤ/27 they are 1, 18, 6, 2 [theorem]; so no order that runs through all 9 lords
   *  or all 27 nakṣatras in one cycle (the Vimśottarī order, the nakṣatra succession) is a doubling orbit: those are the orbits of x ↦ x + 1. */
  function generatorOrbits(modulus, g = 2) {
    const M = fin(modulus, "the modulus"), G = fin(g, "the generator");
    if (!Number.isInteger(M) || M < 2 || !Number.isInteger(G)) throw new RangeError("sukshma-kala: generatorOrbits needs an integer modulus ≥ 2 and an integer generator");
    const seen = new Set(), out = [];
    for (let s = 0; s < M; s++) {
      if (seen.has(s)) continue;
      const cycle = []; let x = s;
      do { cycle.push(x); seen.add(x); x = ((G * x) % M + M) % M; } while (x !== s && !seen.has(x));
      if (x !== s) throw new RangeError(`sukshma-kala: x ↦ ${G}·x is not a permutation of ℤ/${M} (${G} shares a factor with ${M})`);
      out.push(cycle);
    }
    return out;
  }
  const GENERATOR_NOTE = "2 is a primitive root of every ℤ/3^k (its orbit is all the units, 2·3^(k−1) of them), so the generator of the tower is right; but x ↦ 2x on ℤ/9 has cycles of lengths 1, 6, 2 and on ℤ/27 of lengths 1, 18, 6, 2, never 8, 9 or 27, and on ℤ/8 or ℤ/12 it is not a permutation. Every daśā and transit order the texts give is one cycle through all its members — the orbit of x ↦ x + 1. The doubling action is kept as structure; no rule is built on it [theorem].";
  const TOWER_NOTE = "ν₃ of a count is the level k of (ℤ/3^k ℤ, 2, k) at which it sits: a count with ν₃ = 0 is a unit of every ℤ/3^k and the kuṭṭaka on it always solves; a count with ν₃ = k lies in the nilpotent ideal (3)^k. The text's civil days (both canons' day counts) are units; the Sun's revolutions, the yuga's years, the day's prāṇas, the 27 nakṣatras and the 108 cells all sit at k = 3 [theorem on the printed numbers].";

  return Object.freeze({ VARGAS, LATTICE, LORDS, LORD_YEARS, TOWER_NOTE, GENERATOR_NOTE, microOf, partWidth, index, margin, resolution, assess, chart, cell, dashaDaysPerArcmin, nu3, valuationTable, generatorOrbits });
});
