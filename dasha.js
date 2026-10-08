/* dasha.js — विंशोत्तरी दशा to five levels (mahā, antar, pratyantar, sūkṣma, prāṇa), exact, as Parāśara computes it.
 *
 * Text (corpus/bphs/canon.json, Bṛhat Parāśara Horā Śāstra):
 *   46.12  from Kṛttikā, three rounds, the lords in order: Sūrya, Candra, Kuja, Rāhu, Guru, Śani, Budha, Ketu, Śukra ("ā caṃ ku rā gu śa bu ke śu");
 *   46.13  count from Kṛttikā to the birth nakṣatra; the remainder by nine gives the lord whose daśā runs at birth;
 *   46.14  the full life is 120 years;
 *   46.15  years: 6, 10, 7, 18, 16, 19, 17, 7, 20. (The e-text repeats "navacandrāḥ" (19) where Budha's 17 belongs; the text's own
 *          total of 120 in 46.14 fixes it: the eight legible numbers sum to 103.)
 *   46.16  the elapsed part of the birth daśā = its years × bhayāta ÷ bhabhoga (time gone in the birth nakṣatra over its whole span);
 *          the rest is the balance (bhogya);
 *   51.1-2 antardaśā = daśā × the sub-lord's own years ÷ 120, the daśā lord's own first, then in order;
 *   61.1, 62.1 ("kha-arka" = 120), 63.1 ("kha-sūrya" = 120): the same rule for pratyantar, sūkṣma and prāṇa.
 * BPHS does not say how long a daśā year is. The default is the text's year — twelve solar months (Sūrya-Siddhānta 14.10),
 * 1,577,917,828 ÷ 4,320,000 civil days — and the owner may choose another (see YEAR).
 * Every period is an exact rational number of spandas; at every level the children add up to the parent exactly.
 * Browser: window.Dasha (needs window.Panchanga, window.KalaDvara); node: module.exports.
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory(require("./panchanga.js"), require("./kala-dvara.js"));
  else root.Dasha = factory(root.Panchanga, root.KalaDvara);
})(typeof globalThis !== "undefined" ? globalThis : this, function dashaOf(P, K) {
  "use strict";
  function build(P) {
  const SPD = 328050000000n;
  const LORDS = Object.freeze(["Sūrya", "Candra", "Maṅgala", "Rāhu", "Guru", "Śani", "Budha", "Ketu", "Śukra"]);
  const YEARS = Object.freeze([6n, 10n, 7n, 18n, 16n, 19n, 17n, 7n, 20n]);
  const TOTAL = 120n;
  const LEVELS = Object.freeze(["mahādaśā", "antardaśā", "pratyantardaśā", "sūkṣmadaśā", "prāṇadaśā"]);
  /** Year length in civil days, as an exact rational. */
  const YEAR = Object.freeze({
    "saura-surya": { num: 1577917828n, den: 4320000n, source: "SS 14.10 with 1.37: twelve solar months; 365 d 15 gh 31 vi 31 pala 24" },
    "saura-aryabhata": { num: 1577917500n, den: 4320000n, source: "Āryabhaṭa's day-count; 365 d 15 gh 31 vi 15 pala" },
    "savana-360": { num: 360n, den: 1n, source: "a year of 360 civil days" },
  });

  const gcd = (a, b) => { a = a < 0n ? -a : a; b = b < 0n ? -b : b; while (b) [a, b] = [b, a % b]; return a; };
  const q = (num, den) => { if (den < 0n) { num = -num; den = -den; } const g = gcd(num, den) || 1n; return { num: num / g, den: den / g }; };
  const add = (a, b) => q(a.num * b.den + b.num * a.den, a.den * b.den);
  const sub = (a, b) => q(a.num * b.den - b.num * a.den, a.den * b.den);
  const mul = (a, b) => q(a.num * b.num, a.den * b.den);
  const cmp = (a, b) => { const d = a.num * b.den - b.num * a.den; return d < 0n ? -1 : d > 0n ? 1 : 0; };

  /** 46.12-46.13: the lord (0…8) of a nakṣatra (1 = Aśvinī … 27 = Revatī). */
  function lordOfNakshatra(n) {
    if (!(Number.isInteger(n) && n >= 1 && n <= 27)) throw new RangeError("dasha: nakṣatra is 1…27");
    const count = ((n - 3 + 27) % 27) + 1;                 // Kṛttikā = 1
    return (count % 9 + 8) % 9;                            // remainder 1 → Sūrya … remainder 0 → Śukra
  }
  function yearOf(opts) {
    const y = opts && opts.year;
    if (!y) return YEAR["saura-surya"];
    if (typeof y === "string") { if (!YEAR[y]) throw new RangeError(`dasha: unknown year "${y}"`); return YEAR[y]; }
    if (typeof y.num === "bigint" && typeof y.den === "bigint") return y;
    throw new TypeError("dasha: year must be a name in YEAR or { num, den } civil days (BigInt)");
  }
  /** Years (rational) → spandas (rational). */
  const yearsToSpandas = (years, year) => mul(years, q(year.num * SPD, year.den));

  /** Mahādaśās from a birth instant (spandas, BigInt), the birth nakṣatra (1…27) and the elapsed fraction of it ({num, den}). */
  function mahadashas(birthSpandas, nakshatra, elapsed, opts) {
    const year = yearOf(opts);
    const L0 = lordOfNakshatra(nakshatra);
    const gone = mul(q(YEARS[L0], 1n), elapsed);                                  // 46.16: elapsed part of the birth daśā
    let start = sub(q(birthSpandas, 1n), yearsToSpandas(gone, year));             // the daśā began before birth
    const out = [];
    for (let i = 0; i < 9 * ((opts && opts.cycles) || 1); i++) {
      const L = (L0 + i) % 9;
      const len = yearsToSpandas(q(YEARS[L], 1n), year);
      out.push({ level: 0, lord: L, name: LORDS[L], years: q(YEARS[L], 1n), start, end: add(start, len), path: [L] });
      start = add(start, len);
    }
    return { lordAtBirth: L0, balanceYears: sub(q(YEARS[L0], 1n), gone), periods: out, year };
  }
  /** 51.1-2, 61.1, 62.1, 63.1: the nine sub-periods of a period, the period's own lord first. */
  function subPeriods(period) {
    if (period.level >= 4) throw new RangeError("dasha: prāṇadaśā is the fifth and last level");
    const span = sub(period.end, period.start);
    const out = []; let start = period.start;
    for (let i = 0; i < 9; i++) {
      const L = (period.lord + i) % 9;
      const len = mul(span, q(YEARS[L], TOTAL));
      out.push({ level: period.level + 1, lord: L, name: LORDS[L], years: mul(period.years, q(YEARS[L], TOTAL)), start, end: add(start, len), path: [...period.path, L] });
      start = add(start, len);
    }
    return out;
  }
  /** The chain of periods (down to `depth` levels, max 5) running at an instant (spandas, BigInt or {num, den}). */
  function chainAt(md, instant, depth = 5) {
    const t = typeof instant === "bigint" ? q(instant, 1n) : instant;
    let list = md.periods, chain = [];
    for (let lvl = 0; lvl < depth; lvl++) {
      const p = list.find((x) => cmp(x.start, t) <= 0 && cmp(t, x.end) < 0);
      if (!p) break;
      chain.push(p);
      if (lvl < depth - 1 && lvl < 4) list = subPeriods(p);
    }
    return chain;
  }

  /** Birth state from a birth instant (days since the Kali epoch): the Moon's nakṣatra and the elapsed part of it, by time
   *  (bhayāta ÷ bhabhoga, 46.16 — the default) or by arc (the Moon's distance into the nakṣatra over 800′). */
  function birthState(tDays, opts) {
    const L = P.limbsAt(tDays);
    const method = (opts && opts.balance) || "time";
    const S = (x) => { const w = Math.floor(x); return BigInt(w) * SPD + BigInt(Math.round((x - w) * Number(SPD))); };
    let elapsed, start = null, end = null;
    if (method === "time") {
      start = P.prevChange(tDays, "nakshatra"); end = P.nextChange(tDays, "nakshatra");
      elapsed = q(S(tDays) - S(start), S(end) - S(start));
    } else if (method === "arc") {
      const into = ((L.moon % (800 / 60)) + 800 / 60) % (800 / 60);
      elapsed = q(BigInt(Math.round(into * 60 * 1e6)), 800n * 1000000n);
    } else throw new RangeError('dasha: balance is "time" or "arc"');
    return { nakshatra: L.nakshatra, nakshatraName: P.NAKSHATRA[L.nakshatra - 1], elapsed, method, nakshatraStart: start, nakshatraEnd: end, birthSpandas: S(tDays) };
  }
  /** Vimśottarī from a birth instant (days since the Kali epoch). */
  function vimshottari(tDays, opts) {
    const b = birthState(tDays, opts);
    return { birth: b, ...mahadashas(b.birthSpandas, b.nakshatra, b.elapsed, opts) };
  }
  /** A rational spanda count → civil date and local mean time at a site (deśāntara in degrees). */
  function toCivil(r, deshantara = 0, calendar = "gregorian") {
    const local = add(r, q(BigInt(Math.round(deshantara * 1e6)) * SPD, 360000000n));
    const whole = local.num / local.den - (local.num % local.den < 0n ? 1n : 0n);
    const day = whole / SPD - (whole % SPD < 0n ? 1n : 0n);
    const within = Number(whole - day * SPD) / Number(SPD) * 24;
    const h = Math.floor(within), m = Math.floor((within - h) * 60), s = Math.floor(((within - h) * 60 - m) * 60);
    return { ...K.civilFromKaliDay(Number(day), calendar), time: `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}` };
  }

  return Object.freeze({ panchanga: P, withPanchanga: (p) => build(p), withSine: (name) => dashaOf(P.withSine(name), K), LORDS, YEARS, TOTAL, LEVELS, YEAR, lordOfNakshatra, mahadashas, subPeriods, chainAt, birthState, vimshottari, toCivil, q, add, sub, mul, cmp });
  }
  return build(P);
});
