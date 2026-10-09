/* kalachakra.js — कालचक्र-दशा, Parāśara 46.52–46.100 as the local edition carries it, on the 108-cell lattice (27 nakṣatras × 4 pādas).
 *
 * Text (editions/parashara-rahasya-full-edition.html, verse lines in the edition; corpus/bphs/canon.json carries the same verses):
 *   46.54–55   a twelve-cell wheel with the signs from Meṣa; 46.71: in apasavya the signs are written reversed (vyasta)
 *   46.56      the triad from Aśvinī is savya, the triad from Rohiṇī apasavya — the triads alternate: odd triads savya, even apasavya
 *   46.57–58   ten savya stars follow Aśvinī (the first and third of each savya triad); 46.65: five follow Bharaṇī (the second)
 *   46.71      Rohiṇī, Maghā, Viśākhā, Śravaṇa (the first of each apasavya triad) follow Rohiṇī
 *   46.77      the octad Mṛgaśira, Ārdrā, Pūrva-phalgunī, Uttara-phalgunī, Anurādhā, Jyeṣṭhā, Dhaniṣṭhā, Śatabhiṣā "like Cāndra"
 *              (Mṛgaśira, Soma's star) — the second AND third of each apasavya triad; the standard printed tables put the third
 *              with Rohiṇī instead: TYPE_RULE carries both, the text's reading is the default
 *   46.60–64   Aśvinī's four pādas, nine signs each; 46.66–69 Bharaṇī's; 46.73–76 Rohiṇī's; 46.78–81 Mṛgaśira's — by word-numerals
 *   46.84      years by the lord: Sūrya 5, Candra 21, Maṅgala 7, Budha 9, Guru 10, Śukra 16, Śani 4; a sign's daśā is its lord's years
 *   46.88      the aṃśaka A = 4 × ((past nakṣatras) mod 3) + the pāda — the 108-cell index taken mod 12
 *   46.85, 89  the nine signs' years from the aṃśaka are the āyus: Meṣa 100, Vṛṣa akṣa-aṣṭau 85, Mithuna tri-gajāḥ 83,
 *              Karka aṅga-gajāḥ 86, the same in their trines (word-numerals read units first, "aṅkānāṃ vāmato gatiḥ")
 *   46.92–93   bhukta = (the Moon's arc gone in the pāda × the pāda's years) ÷ 200′; bhogya = the rest
 *   46.94–95   savya: the first aṃśa is deha, the last jīva, counted from deha; apasavya: reversed (viloma), counted from jīva
 *   46.96–100  three motions: maṇḍūkī (Kanyā–Karka, Siṃha–Mithuna), markaṭī (Karka–Siṃha), siṃhāvalokana (Mīna–Vṛścika,
 *              Dhanu–Meṣa) — named on the chain's steps; the phala verses (46.101–111) are not built
 *
 * What the text fixes and what is read (see READINGS): the sixteen chains come in reversed pairs — Rohiṇī's pāda p is Bharaṇī's
 * pāda 5−p reversed, Mṛgaśira's pāda p is Aśvinī's pāda 5−p reversed — and every chain's year-sum equals the 46.89 paramāyus of
 * the trine of its aṃśaka (savya: A; apasavya: A counted viloma, 4r + 5 − p). Those two identities decide the compounds the
 * edition left open (46.61's interior, 46.62's close, 46.66's direction, 46.74's first word) and refute the edition's own
 * right-to-left misreading of 46.89 (28, 38, 68). Everything here is [text] or [reading]; the antardaśā rule and the
 * continuation past the nine signs are [standard], not in these verses, and are so tagged on their outputs.
 *
 * Browser: window.Kalachakra (needs window.Panchanga, window.Dasha); node: module.exports.
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory(require("./panchanga.js"), require("./dasha.js"));
  else root.Kalachakra = factory(root.Panchanga, root.Dasha);
})(typeof globalThis !== "undefined" ? globalThis : this, function kalachakraOf(P, D) {
  "use strict";
  const SPD = 328050000000n;
  const SIGNS = Object.freeze(["Meṣa", "Vṛṣa", "Mithuna", "Karka", "Siṃha", "Kanyā", "Tulā", "Vṛścika", "Dhanu", "Makara", "Kumbha", "Mīna"]);
  const SIGN_LORD = Object.freeze(["Maṅgala", "Śukra", "Budha", "Candra", "Sūrya", "Budha", "Śukra", "Maṅgala", "Guru", "Śani", "Śani", "Guru"]);
  const LORD_YEARS = Object.freeze({ "Sūrya": 5, "Candra": 21, "Maṅgala": 7, "Budha": 9, "Guru": 10, "Śukra": 16, "Śani": 4 });   // 46.84
  const SIGN_YEARS = Object.freeze(SIGN_LORD.map((l) => LORD_YEARS[l]));                                                                 // [7,16,9,21,5,9,16,7,10,4,4,10]
  const PARAMAYUS = Object.freeze([100, 85, 83, 86]);                                                                                   // 46.89, by the trine of the aṃśaka (Meṣa, Vṛṣa, Mithuna, Karka)
  const PADA_ARCMIN = 200, NAKSHATRA_ARCMIN = 800;
  const NAKSHATRAS = P.NAKSHATRA;

  /** The sixteen chains, signs 1…12, listed in the counting order of 46.95 (savya from deha, apasavya from jīva). */
  const CHAINS = Object.freeze({
    ashvini:    Object.freeze([[1, 2, 3, 4, 5, 6, 7, 8, 9], [10, 11, 12, 8, 7, 6, 4, 5, 3], [2, 1, 12, 11, 10, 9, 1, 2, 3], [4, 5, 6, 7, 8, 9, 10, 11, 12]]),
    bharani:    Object.freeze([[8, 7, 6, 4, 5, 3, 2, 1, 12], [11, 10, 9, 1, 2, 3, 4, 5, 6], [7, 8, 9, 10, 11, 12, 8, 7, 6], [4, 5, 3, 2, 1, 12, 11, 10, 9]]),
    rohini:     Object.freeze([[9, 10, 11, 12, 1, 2, 3, 5, 4], [6, 7, 8, 12, 11, 10, 9, 8, 7], [6, 5, 4, 3, 2, 1, 9, 10, 11], [12, 1, 2, 3, 5, 4, 6, 7, 8]]),
    mrigashira: Object.freeze([[12, 11, 10, 9, 8, 7, 6, 5, 4], [3, 2, 1, 9, 10, 11, 12, 1, 2], [3, 5, 4, 6, 7, 8, 12, 11, 10], [9, 8, 7, 6, 5, 4, 3, 2, 1]]),
  });
  const VERSES = Object.freeze({ ashvini: ["46.60", "46.61", "46.62", "46.63-64"], bharani: ["46.66", "46.67", "46.68", "46.69"], rohini: ["46.73", "46.74", "46.75", "46.76"], mrigashira: ["46.78", "46.79", "46.80", "46.81"] });
  const GROUP = Object.freeze({ ashvini: "savya", bharani: "savya", rohini: "apasavya", mrigashira: "apasavya" });
  const READINGS = Object.freeze([
    { verse: "46.61", what: "the verse names deha Mṛga (Makara) and jīva Mithuna and says 'in order up to Mithuna'; the interior is Mṛgaśira's pāda 3 (46.80) reversed: Makara, Kumbha, Mīna, Vṛścika, Tulā, Kanyā, Karka, Siṃha, Mithuna; sum 85 = the aṃśaka Vṛṣa's paramāyus", tag: "reading" },
    { verse: "46.62", what: "the compound gives 2, 1, 12, 11, 10, 9; the close to the jīva Mithuna is Meṣa, Vṛṣa, Mithuna — Mṛgaśira's pāda 2 (46.79) reversed; sum 83", tag: "reading" },
    { verse: "46.63", what: "the printed compound (kvakṣirāmarkṣa…) does not decode; 46.64 states the chain: the nine signs from Karka, deha Karka, jīva Mīna; sum 86", tag: "text (46.64)" },
    { verse: "46.66", what: "the compound read left to right, as 46.67–69 are: Vṛścika, Tulā, Kanyā, Karka, Siṃha, Mithuna, Vṛṣa, Meṣa, Mīna — deha Vṛścika, jīva Mīna ('the deha–jīva line [ends at] Mīna'); it is Rohiṇī's pāda 4 (46.76) reversed; sum 100. The standard printed tables start this chain at Mīna with Karka before Siṃha", tag: "reading" },
    { verse: "46.74", what: "the printed first word aṅka (9) breaks deha Tulā–jīva Kanyā and the sum; aṅga (6) restores both: Kanyā, Tulā, Vṛścika, Mīna, Kumbha, Makara, Dhanu, Vṛścika, Tulā = Bharaṇī's pāda 3 (46.68) reversed; sum 83", tag: "reading (one letter)" },
    { verse: "46.77", what: "the octad 'like Cāndra' puts the second and third stars of each apasavya triad with Mṛgaśira; the standard tables put the third with Rohiṇī — TYPE_RULE 'standard'", tag: "reading" },
    { verse: "46.89", what: "akṣa-aṣṭau, tri-gajāḥ, aṅga-gajāḥ read units first (aṅkānāṃ vāmato gatiḥ): 85, 83, 86 — every chain's sum confirms; the edition's 28, 38, 68 read them the other way and then reports a 3-year mismatch at 46.80", tag: "reading" },
    { verse: "46.94", what: "the aṃśaka that keys the paramāyus in apasavya is counted viloma: 4r + (5 − p); with 46.88 as printed the sums would not match", tag: "reading" },
  ]);
  /** The three motions on a step between two signs (46.99–100), by the unordered pair; every other step of every chain is one sign. */
  const MOTIONS = Object.freeze([
    { pair: [6, 4], name: "maṇḍūkī", verse: "46.99" }, { pair: [5, 3], name: "maṇḍūkī", verse: "46.99" },
    { pair: [4, 5], name: "markaṭī", verse: "46.99" },
    { pair: [12, 8], name: "siṃhāvalokana", verse: "46.100" }, { pair: [9, 1], name: "siṃhāvalokana", verse: "46.100" },
  ]);
  /** The motion named on the pair {a, b} (either direction), or null for a plain one-sign step. The Karka–Siṃha pair is one sign
   *  apart: 46.98 calls the markaṭī "going backward", and in the chains that step reverses direction only beside a frog-jump
   *  (…Kanyā → Karka → Siṃha → Mithuna… and its reverse); stepsOf labels it there and nowhere else. */
  function motionOf(a, b) {
    const m = MOTIONS.find((x) => (x.pair[0] === a && x.pair[1] === b) || (x.pair[0] === b && x.pair[1] === a));
    if (m) return m.name;
    const d = ((b - a) % 12 + 12) % 12;
    if (d === 1 || d === 11) return null;
    throw new RangeError(`kalachakra: the step ${SIGNS[a - 1]} → ${SIGNS[b - 1]} is neither one sign nor a named motion`);
  }
  function stepsOf(signs) {
    const steps = signs.slice(1).map((b, i) => ({ from: signs[i], to: b, motion: motionOf(signs[i], b) }));
    for (let i = 0; i < steps.length; i++) if (steps[i].motion === "markaṭī") {
      const beside = (steps[i - 1] && steps[i - 1].motion === "maṇḍūkī") || (steps[i + 1] && steps[i + 1].motion === "maṇḍūkī");
      if (!beside) steps[i].motion = null;                                      // a plain forward or backward run through Karka and Siṃha
    }
    return steps;
  }

  const fin = (x, what) => { if (typeof x !== "number" || !Number.isFinite(x)) throw new TypeError(`kalachakra: ${what} must be a finite number`); return x; };
  const mod = (a, n) => ((a % n) + n) % n;

  /** The 108-cell index of a sidereal longitude (degrees): cell = 4n + (p − 1), nakṣatra n = 0…26, pāda p = 1…4. */
  function cellOf(lonDeg) {
    const lam = mod(fin(lonDeg, "the longitude"), 360);
    const arcmin = lam * 60;
    const cell = Math.min(107, Math.floor(arcmin / PADA_ARCMIN));
    return { cell, nakshatra: Math.floor(cell / 4), pada: cell % 4 + 1, goneArcmin: arcmin - cell * PADA_ARCMIN };
  }
  /** Which chain a nakṣatra (0-based) and pāda take, and the aṃśaka that keys its years. opts.types: 'text' (46.77) or 'standard'. */
  function TYPE_RULE(nakshatra0, types = "text") {
    const n = fin(nakshatra0, "the nakṣatra"); if (!Number.isInteger(n) || n < 0 || n > 26) throw new RangeError("kalachakra: nakṣatra is 0…26");
    const triad = Math.floor(n / 3), r = n % 3, savya = triad % 2 === 0;
    let type;
    if (savya) type = r === 1 ? "bharani" : "ashvini";
    else if (types === "standard") type = r === 1 ? "mrigashira" : "rohini";
    else if (types === "text") type = r === 0 ? "rohini" : "mrigashira";
    else throw new RangeError('kalachakra: types is "text" or "standard"');
    return { triad, r, savya, group: savya ? "savya" : "apasavya", type };
  }
  /** The chain of a nakṣatra (0…26) and pāda (1…4): the nine signs, their years, the paramāyus and its check, deha and jīva, the motions. */
  function chainOf(nakshatra0, pada, opts) {
    const p = fin(pada, "the pāda"); if (!Number.isInteger(p) || p < 1 || p > 4) throw new RangeError("kalachakra: pāda is 1…4");
    const t = TYPE_RULE(nakshatra0, opts && opts.types);
    const signs = CHAINS[t.type][p - 1];
    const amshaka = 4 * t.r + p;                                   // 46.88 as printed
    const amshakaViloma = 4 * t.r + (5 - p);                       // 46.94: apasavya counts the pādas reversed
    const key = t.savya ? amshaka : amshakaViloma;
    const paramayus = PARAMAYUS[(key - 1) % 4];
    const years = signs.map((s) => SIGN_YEARS[s - 1]);
    const sum = years.reduce((a, b) => a + b, 0);
    const steps = stepsOf(signs);
    return Object.freeze({ nakshatra: nakshatra0, nakshatraName: NAKSHATRAS[nakshatra0], pada: p, cell: 4 * nakshatra0 + p - 1, ...t, verse: VERSES[t.type][p - 1],
      signs, names: signs.map((s) => SIGNS[s - 1]), lords: signs.map((s) => SIGN_LORD[s - 1]), years, sum, amshaka, amshakaViloma, paramayus, sumMatchesParamayus: sum === paramayus,
      deha: t.savya ? signs[0] : signs[8], jiva: t.savya ? signs[8] : signs[0], steps, motions: steps.filter((s) => s.motion) });
  }
  /** All sixteen chains with their checks. */
  function table(opts) {
    const out = [];
    for (const type of Object.keys(CHAINS)) {
      const n0 = { ashvini: 0, bharani: 1, rohini: 3, mrigashira: 4 }[type];
      for (let p = 1; p <= 4; p++) out.push(chainOf(n0, p, opts));
    }
    return out;
  }

  // ── the daśā from a birth ──────────────────────────────────────────────────────────────────────────────────────────
  const { q, add, sub, mul, cmp } = D;
  const yearsToSpandas = (years, year) => mul(years, q(year.num * SPD, year.den));
  const yearOf = (opts) => D.YEAR[(opts && opts.year) || "saura-surya"] || (opts && opts.year);
  const S = (x) => { const w = Math.floor(x); return BigInt(w) * SPD + BigInt(Math.round((x - w) * Number(SPD))); };

  /** The nine periods of one chain from an instant at which `gone` of its paramāyus (rational years) is already elapsed; the
   *  signs whose years lie inside `gone` are marked elapsed and the running one carries its balance. */
  function periodsOf(chain, startSpandas, gone, year, label) {
    let start = sub(q(startSpandas, 1n), yearsToSpandas(gone, year));          // the chain began before the instant
    const out = []; let acc = q(0n, 1n);
    for (let i = 0; i < 9; i++) {
      const y = q(BigInt(chain.years[i]), 1n), len = yearsToSpandas(y, year), end = add(start, len), accEnd = add(acc, y);
      const elapsed = cmp(accEnd, gone) <= 0, running = !elapsed && cmp(acc, gone) <= 0;
      out.push({ level: 0, sign: chain.signs[i], name: chain.names[i], lord: chain.lords[i], years: y, start, end, elapsed, running, balanceYears: running ? sub(accEnd, gone) : null,
        motionBefore: i ? chain.steps[i - 1].motion : null, chain: label, path: [chain.cell, i] });
      start = end; acc = accEnd;
    }
    return out;
  }
  /** Kālacakra mahādaśās from a birth instant (days since the Kali epoch). The Moon's sidereal longitude from the pañcāṅga
   *  (the text tier) gives the cell; 46.93 gives the elapsed years; opts.cycles (default 1) adds the following pādas' chains
   *  [standard continuation, not in the verses]; opts.types 'text' | 'standard' (46.77); opts.year as dasha.js. */
  function dasha(tDays, opts) {
    const L = P.limbsAt(fin(tDays, "the birth instant"));
    return fromMoon(L.moon, S(tDays), { ...opts, limbs: L });
  }
  function fromMoon(moonSidereal, birthSpandas, opts) {
    const year = yearOf(opts), c = cellOf(moonSidereal), chain = chainOf(c.nakshatra, c.pada, opts);
    const goneMicro = BigInt(Math.round(c.goneArcmin * 1e6));                   // the arc gone in the pāda, in micro-arcminutes
    const gone = q(goneMicro * BigInt(chain.paramayus), BigInt(PADA_ARCMIN) * 1000000n);   // 46.93: × the pāda's years ÷ 200′
    const periods = periodsOf(chain, birthSpandas, gone, year, "birth pāda");
    const next = [];
    let start = periods[8].end, cell = c.cell;
    for (let k = 1; k < ((opts && opts.cycles) || 1); k++) {
      cell = (cell + 1) % 108; const ch = chainOf(Math.floor(cell / 4), cell % 4 + 1, opts);
      const ps = periodsOf(ch, start.num / start.den, q(0n, 1n), year, `pāda +${k} [standard continuation]`);
      // periodsOf takes a BigInt start; rebuild exactly from the rational end
      let s = start; for (const p of ps) { const len = sub(p.end, p.start); p.start = s; p.end = add(s, len); s = p.end; }
      next.push({ chain: ch, periods: ps }); start = s;
    }
    return { birth: { moonSidereal, cell: c, nakshatra: c.nakshatra + 1, nakshatraName: NAKSHATRAS[c.nakshatra], pada: c.pada, goneArcmin: c.goneArcmin, limbs: opts && opts.limbs },
      chain, goneYears: gone, balanceYears: sub(q(BigInt(chain.paramayus), 1n), gone), periods, next, year, types: (opts && opts.types) || "text" };
  }
  /** Sub-periods of a period: the nine signs of its own chain in order, each (period × sign-years ÷ the chain's sum) [standard, not in 46.52–100]. */
  function subPeriods(period, chain) {
    const span = sub(period.end, period.start), out = []; let start = period.start;
    for (let i = 0; i < 9; i++) {
      const len = mul(span, q(BigInt(chain.years[i]), BigInt(chain.sum)));
      out.push({ level: period.level + 1, sign: chain.signs[i], name: chain.names[i], lord: chain.lords[i], years: mul(period.years, q(BigInt(chain.years[i]), BigInt(chain.sum))), start, end: add(start, len), path: [...period.path, i], tag: "standard" });
      start = add(start, len);
    }
    return out;
  }
  const runningAt = (dasha, instant) => { const t = typeof instant === "bigint" ? q(instant, 1n) : instant; return [...dasha.periods, ...dasha.next.flatMap((n) => n.periods)].find((p) => cmp(p.start, t) <= 0 && cmp(t, p.end) < 0) || null; };

  return Object.freeze({ SIGNS, SIGN_LORD, LORD_YEARS, SIGN_YEARS, PARAMAYUS, CHAINS, VERSES, GROUP, READINGS, MOTIONS, PADA_ARCMIN, NAKSHATRA_ARCMIN, cellOf, TYPE_RULE, chainOf, table, dasha, fromMoon, subPeriods, runningAt, toCivil: D.toCivil, motionOf });
});
