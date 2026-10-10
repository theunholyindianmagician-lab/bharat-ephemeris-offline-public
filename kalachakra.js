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
  const MICRO = 3600000000n, CIRCLE = 360n * MICRO, PADA = CIRCLE / 108n;   // micro-arcseconds: a pāda is 12,000,000,000 µas exactly, as in sukshma-kala.js
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
  /** Deha and jīva as each verse names them (signs 1…12), the hard checks of audit(); 46.66 names only "jhaṣa" for the line and is not a hard check. */
  const DEHA_JIVA = Object.freeze({
    ashvini: [{ deha: 1, jiva: 9 }, { deha: 10, jiva: 3 }, { deha: 2, jiva: 3 }, { deha: 4, jiva: 12 }],
    bharani: [{ deha: 8, jiva: 12, attested: false, note: "46.66 names only jhaṣa (Mīna) for the deha–jīva line" }, { deha: 11, jiva: 6 }, { deha: 7, jiva: 6 }, { deha: 4, jiva: 9 }],
    rohini: [{ deha: 4, jiva: 9 }, { deha: 7, jiva: 6 }, { deha: 11, jiva: 6 }, { deha: 8, jiva: 12 }],
    mrigashira: [{ deha: 4, jiva: 12 }, { deha: 2, jiva: 3 }, { deha: 10, jiva: 3 }, { deha: 1, jiva: 9 }],
  });
  /** Each reading with its evidence and its status: what the verse's own letters attest, and what is forced by the identities
   *  that hold on the undisputed chains (the reversal pairs 46.60↔46.81, 46.64↔46.78, 46.67↔46.75, 46.69↔46.73, and the
   *  sums 100, 85, 83, 86 on the twelve chains the edition decoded without emendation). audit() runs the alternatives. */
  const READINGS = Object.freeze([
    { verse: "46.61", what: "the verse names deha Mṛga (Makara) and jīva Mithuna and says 'in order up to Mithuna'; the interior is Mṛgaśira's pāda 3 (46.80) reversed: Makara, Kumbha, Mīna, Vṛścika, Tulā, Kanyā, Karka, Siṃha, Mithuna; sum 85 = the aṃśaka Vṛṣa's paramāyus", tag: "reading",
      evidence: "46.80's own letters (tri-bāṇa-abdhi-rasa-aga-aṣṭa-sūrya-īśa-daśa = 3, 5, 4, 6, 7, 8, 12, 11, 10) reversed; the verse's deha and jīva stand at its two ends; the sum 85", status: "forced by the reversal pattern and the sum; not spelled in 46.61's own letters" },
    { verse: "46.62", what: "the compound gives 2, 1, 12, 11, 10, 9; the close to the jīva Mithuna is Meṣa, Vṛṣa, Mithuna — Mṛgaśira's pāda 2 (46.79) reversed; sum 83", tag: "reading",
      evidence: "46.79's letters (tri-dvi-eka-aṅka-diś-īśa-arka-candra-akṣi = 3, 2, 1, 9, 10, 11, 12, 1, 2) reversed agree with the six the compound gives and supply the three to the jīva; the sum 83", status: "forced by the reversal pattern and the sum; the verse spells six of nine" },
    { verse: "46.63", what: "the printed compound (kvakṣirāmarkṣa…) does not decode; 46.64 states the chain: the nine signs from Karka, deha Karka, jīva Mīna; sum 86", tag: "text (46.64)",
      evidence: "46.64's words karkādi-nava-rāśi-pāḥ; 46.78's letters reversed agree; the sum 86", status: "text" },
    { verse: "46.66", what: "the compound read left to right, as 46.67–69 are: Vṛścika, Tulā, Kanyā, Karka, Siṃha, Mithuna, Vṛṣa, Meṣa, Mīna — deha Vṛścika, jīva Mīna ('the deha–jīva line [ends at] Mīna'); it is Rohiṇī's pāda 4 (46.76) reversed; sum 100. The standard printed tables start this chain at Mīna with Karka before Siṃha", tag: "reading",
      evidence: "the sum is 100 in either direction, so only the pair decides: 46.76's letters (sūrya-indu-dvi-guṇa-iṣu-abdhi-tarka-śaila-aṣṭa = 12, 1, 2, 3, 5, 4, 6, 7, 8) are exactly this compound read left to right and reversed; the standard order would need 46.76 to read abdhi-iṣu", status: "forced by the reversal pattern alone; the verse's deha–jīva words are ambiguous (audit '46.66-standard-tables')" },
    { verse: "46.74", what: "the printed first word aṅka (9) breaks deha Tulā–jīva Kanyā and the sum; aṅga (6) restores both: Kanyā, Tulā, Vṛścika, Mīna, Kumbha, Makara, Dhanu, Vṛścika, Tulā = Bharaṇī's pāda 3 (46.68) reversed; sum 83", tag: "reading (one letter)",
      evidence: "as printed the chain sums to 84, starts on Dhanu where the verse puts the jīva Kanyā, is not 46.68 reversed, and takes a step Dhanu → Tulā that is no motion of 46.96–100; with aṅga all four hold (audit '46.74-as-printed')", status: "forced by four independent checks; one letter" },
    { verse: "46.77", what: "the octad 'like Cāndra' puts the second and third stars of each apasavya triad with Mṛgaśira; the standard tables put the third with Rohiṇī — TYPE_RULE 'standard'", tag: "reading",
      evidence: "the verse's plain words; no sum or pair distinguishes the two assignments (both types give 86, 83, 85, 100)", status: "text as printed, differs from the standard tables; undecidable from the numbers" },
    { verse: "46.89", what: "akṣa-aṣṭau, tri-gajāḥ, aṅga-gajāḥ read units first (aṅkānāṃ vāmato gatiḥ): 85, 83, 86 — every chain's sum confirms; the edition's 28, 38, 68 read them the other way and then reports a 3-year mismatch at 46.80", tag: "reading",
      evidence: "the twelve chains the edition itself decoded without emendation sum to 100, 85, 83 or 86 and never to 28, 38 or 68 (audit '46.89-as-edition' fails all sixteen)", status: "proven on the undisputed chains" },
    { verse: "46.94", what: "the aṃśaka that keys the paramāyus in apasavya is counted viloma: 4r + (5 − p); with 46.88 as printed the sums would not match", tag: "reading",
      evidence: "Rohiṇī's and Mṛgaśira's undisputed chains sum to 86, 83, 85, 100 for pādas 1…4 — 46.89's order reversed", status: "forced by the sums" },
  ]);
  /** The alternatives an audit can run: the adopted readings, and each contested one the other way. */
  const VARIANTS = Object.freeze({
    text: { label: "the readings adopted", chains: CHAINS, paramayus: PARAMAYUS },
    "46.74-as-printed": { label: "46.74 with the printed aṅka (9) as its first word", chains: { ...CHAINS, rohini: [CHAINS.rohini[0], [9, 7, 8, 12, 11, 10, 9, 8, 7], CHAINS.rohini[2], CHAINS.rohini[3]] }, paramayus: PARAMAYUS },
    "46.66-standard-tables": { label: "46.66 as the standard printed tables (Mīna first, Karka before Siṃha)", chains: { ...CHAINS, bharani: [[12, 1, 2, 3, 4, 5, 6, 7, 8], ...CHAINS.bharani.slice(1)] }, paramayus: PARAMAYUS },
    "46.89-as-edition": { label: "46.89 as the edition read it (100, 28, 38, 68)", chains: CHAINS, paramayus: [100, 28, 38, 68] },
  });
  /** Every hard check on a variant's chains: the sum against the paramāyus, deha and jīva against the verse (where attested), the
   *  reversal pair, and the steps. Returns the counts and the failures, so each reading's proof is runnable. */
  function audit(name = "text") {
    const v = VARIANTS[name]; if (!v) throw new RangeError(`kalachakra: unknown variant "${name}" (${Object.keys(VARIANTS).join(", ")})`);
    const checks = [], fail = (type, p, check, detail) => checks.push({ type, pada: p + 1, check, ok: false, detail }), pass = (type, p, check) => checks.push({ type, pada: p + 1, check, ok: true });
    for (const type of Object.keys(v.chains)) for (let p = 0; p < 4; p++) {
      const signs = v.chains[type][p], savya = GROUP[type] === "savya", r = { ashvini: 0, bharani: 1, rohini: 0, mrigashira: 1 }[type];
      const key = savya ? 4 * r + p + 1 : 4 * r + 4 - p, want = v.paramayus[(key - 1) % 4], sum = signs.reduce((a, s) => a + SIGN_YEARS[s - 1], 0);
      sum === want ? pass(type, p, "sum = paramāyus") : fail(type, p, "sum = paramāyus", `${sum} ≠ ${want}`);
      const dj = DEHA_JIVA[type][p]; if (dj.attested !== false) { const d = savya ? signs[0] : signs[8], j = savya ? signs[8] : signs[0]; (d === dj.deha && j === dj.jiva) ? pass(type, p, "deha, jīva as the verse") : fail(type, p, "deha, jīva as the verse", `${SIGNS[d - 1]}, ${SIGNS[j - 1]} for ${SIGNS[dj.deha - 1]}, ${SIGNS[dj.jiva - 1]}`); }
      const pair = { rohini: ["bharani", 3 - p], mrigashira: ["ashvini", 3 - p], bharani: ["rohini", 3 - p], ashvini: ["mrigashira", 3 - p] }[type];
      const other = v.chains[pair[0]][pair[1]]; signs.every((s, i) => s === other[8 - i]) ? pass(type, p, "reversal pair") : fail(type, p, "reversal pair", `not ${pair[0]} pāda ${pair[1] + 1} reversed`);
      try { stepsOf(signs); pass(type, p, "steps"); } catch (e) { fail(type, p, "steps", e.message); }
    }
    return { variant: name, label: v.label, total: checks.length, passed: checks.filter((c) => c.ok).length, failures: checks.filter((c) => !c.ok), checks };
  }
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

  /** The 108-cell index of a sidereal longitude (degrees): cell = 4n + (p − 1), nakṣatra n = 0…26, pāda p = 1…4. The longitude
   *  is rounded ONCE, to a micro-arcsecond, and the cell and the arc gone in it are the quotient and remainder of that one
   *  integer by the pāda — so the arc gone is always less than a pāda and never disagrees with the cell (the second review found
   *  the earlier float floor and a separate rounding of the arc could put the arc at a full pāda with no sign running). */
  function cellOf(lonDeg) {
    const micro = ((BigInt(Math.round(fin(lonDeg, "the longitude") * 3.6e9)) % CIRCLE) + CIRCLE) % CIRCLE;
    const cell = Number(micro / PADA), goneMicro = micro % PADA;
    return { cell, nakshatra: Math.floor(cell / 4), pada: cell % 4 + 1, micro, goneMicro, goneArcmin: Number(goneMicro) / 6e7 };
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
  const yearOf = (opts) => D.yearOf(opts);                                     // dasha.js validates: a name in YEAR, or a positive rational of civil days
  const cyclesOf = (opts) => { const c = opts && opts.cycles !== undefined ? opts.cycles : 1; if (!Number.isInteger(c) || c < 1 || c > 108) throw new RangeError("kalachakra: cycles is an integer 1…108 (one chain per pāda)"); return c; };
  const rationalOf = (x, what) => {
    if (typeof x === "bigint") return q(x, 1n);
    if (x && typeof x.num === "bigint" && typeof x.den === "bigint" && x.den !== 0n) return q(x.num, x.den);
    throw new TypeError(`kalachakra: ${what} must be a BigInt or { num, den } of spandas`);
  };
  const S = (x) => { const w = Math.floor(x); return BigInt(w) * SPD + BigInt(Math.round((x - w) * Number(SPD))); };

  /** The nine periods of one chain from an instant (rational spandas) at which `gone` of its paramāyus (rational years) is
   *  already elapsed; the signs whose years lie inside `gone` are marked elapsed and the running one carries its balance.
   *  With 0 ≤ gone < paramāyus exactly one sign is running [theorem: the nine spans partition the paramāyus]. */
  function periodsOf(chain, startR, gone, year, label) {
    let start = sub(startR, yearsToSpandas(gone, year));                        // the chain began before the instant
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
    const year = yearOf(opts), cycles = cyclesOf(opts), birth = rationalOf(birthSpandas, "the birth instant");
    const c = cellOf(moonSidereal), chain = chainOf(c.nakshatra, c.pada, opts);
    const gone = q(c.goneMicro * BigInt(chain.paramayus), PADA);                 // 46.93: the arc gone in the pāda × the pāda's years ÷ the pāda — exact, and < paramāyus
    const periods = periodsOf(chain, birth, gone, year, "birth pāda");
    const next = [];
    let start = periods[8].end, cell = c.cell;
    for (let k = 1; k < cycles; k++) {
      cell = (cell + 1) % 108; const ch = chainOf(Math.floor(cell / 4), cell % 4 + 1, opts);
      const ps = periodsOf(ch, start, q(0n, 1n), year, `pāda +${k} [standard continuation]`);
      next.push({ chain: ch, periods: ps }); start = ps[8].end;
    }
    return { birth: { moonSidereal, cell: c, nakshatra: c.nakshatra + 1, nakshatraName: NAKSHATRAS[c.nakshatra], pada: c.pada, goneArcmin: c.goneArcmin, spandas: birth, limbs: opts && opts.limbs },
      chain, goneYears: gone, balanceYears: sub(q(BigInt(chain.paramayus), 1n), gone), periods, next, year, types: (opts && opts.types) || "text" };
  }
  /** Sub-periods of a period: the nine signs of its own chain in order, each (period × sign-years ÷ the chain's sum) [standard, not in
   *  46.52–100]. The second argument is the period's chain, or the daśā result it came from (the chain is then found by the period's cell). */
  function subPeriods(period, ctx) {
    if (!period || !Array.isArray(period.path)) throw new TypeError("kalachakra: subPeriods needs a period of dasha()/fromMoon()");
    const chain = ctx && Array.isArray(ctx.signs) ? ctx : chainOf(Math.floor(period.path[0] / 4), period.path[0] % 4 + 1, { types: ctx && ctx.types });
    if (chain.cell !== period.path[0]) throw new RangeError("kalachakra: the chain given is not the period's own");
    const span = sub(period.end, period.start), out = []; let start = period.start;
    for (let i = 0; i < 9; i++) {
      const len = mul(span, q(BigInt(chain.years[i]), BigInt(chain.sum)));
      out.push({ level: period.level + 1, sign: chain.signs[i], name: chain.names[i], lord: chain.lords[i], years: mul(period.years, q(BigInt(chain.years[i]), BigInt(chain.sum))), start, end: add(start, len), path: [...period.path, i], tag: "standard" });
      start = add(start, len);
    }
    return out;
  }
  const runningAt = (dasha, instant) => { const t = typeof instant === "bigint" ? q(instant, 1n) : instant; return [...dasha.periods, ...dasha.next.flatMap((n) => n.periods)].find((p) => cmp(p.start, t) <= 0 && cmp(t, p.end) < 0) || null; };

  return Object.freeze({ SIGNS, SIGN_LORD, LORD_YEARS, SIGN_YEARS, PARAMAYUS, CHAINS, VERSES, GROUP, DEHA_JIVA, READINGS, VARIANTS, MOTIONS, PADA_ARCMIN, NAKSHATRA_ARCMIN, PADA_MICRO: PADA, cellOf, TYPE_RULE, chainOf, table, audit, dasha, fromMoon, subPeriods, runningAt, toCivil: D.toCivil, motionOf });
});
