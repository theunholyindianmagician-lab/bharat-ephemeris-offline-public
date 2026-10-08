/* candravakya.js — चन्द्रवाक्य, the Moon's vākyas regenerated from a canon's own numbers (slice 9 of the vedha-yantra engine).
 *
 * THE METHOD. Start the count on a day when the mean Moon stands at its apogee (anomaly zero). After n civil days its
 * true place has advanced by
 *        V(n) = m·n + manda-phala(kendra = −a·n)                                                     (mod 360°)
 * where m is the Moon's mean daily motion, a its anomalistic daily motion (Moon − apogee), and the manda-phala is the
 * canon's one equation: arc( R-sine(bhuja of the kendra) × epicycle ÷ 360 ), added while the kendra (apogee − Moon) is
 * in its first half-circle and subtracted in the second (SS 2.29-2.45 [text]; the same form for Āryabhaṭa [reading]).
 * V(1) … V(248) are the 248 vākyas: 248 days are nearly nine anomalistic months, so the anomaly — and with it the
 * table — almost returns to its start [theorem from the canon, `closure`]. The tradition's 248-day cycle and its first
 * vākyas 12°03′ (Vararuci, "gīrnaḥ śreyaḥ") and 12°02′35″ (Mādhava, "śīlaṃ rājñaḥ śriye"), and the longer cycles of
 * 3031 and 12,372 days, are known here only as [snippet]s (design doc §8). Nothing in this file is fitted to them.
 *
 * THE CANONS (opts.canon):
 *   "aryabhata" (default) — Āryabhaṭīya, Gītikā 3: Moon 57,753,336 revolutions in 1,577,917,500 civil days [text, decoded
 *       in granthas.test.js and parahita-madhyama.test.js]; apogee 488,219 [certified only through Parameśvara's epoch,
 *       parahita-madhyama.js]. Mean places from parahita-madhyama.js. Epicycle 31.5/360 at both ends, the size the
 *       research attributes to Āryabhaṭa [unverified: not checked against a printed Āryabhaṭīya; design doc §8]; no local
 *       edition gives Āryabhaṭa's epicycles, so pass `epicycle` to replace it.
 *   "parahita" — the same integers with the Śakābda-saṃskāra and Parameśvara's 1/5 (Jyotirmīmāṃsā pp.11, 35 [text]): the
 *       places are parahitaArcsec, the daily rates are the integers less sakabdaRevPerYuga. Same epicycle [unverified].
 *   "surya" — Sūrya-Siddhānta: 1,577,917,828 civil days (1.37), Moon 57,753,336, apogee 488,203 (1.33), 452¾ yugas gone
 *       at the Kali start (1.45-1.47); epicycle 32° at the even ends and 31°40′ at the odd, varying with the R-sine
 *       (2.34, 2.38) [text]. Its true Moon agrees with sphuta.js (tested).
 * THE SINE (opts.sine): "table" = the Sūrya-Siddhānta's 24 R-sines on R = 3438 with linear interpolation (2.17-2.22,
 *   2.31-2.33 [text]); "madhava" = Mādhava's sine polynomial on R = 3437′44″48‴, exact (spanda-ganita.js; every
 *   coefficient a Kaṭapayādi word decoded in katapayadi.test.js). Default: "madhava" for the two Kerala canons (the
 *   vākyas are Kerala and Mādhava wrote the seconds), "table" for "surya". Every step is exact rational arithmetic
 *   (BigInt); Mādhava's arc is the first arc-spanda (1/15,187,500′) whose sine reaches the value.
 *
 * THE WORDS. Each vākya, rounded to the second (Mādhava) or to the minute (Vararuci, opts.precision), is written as an
 *   integer — rāśi, then degrees, minutes (and seconds) as two digits each [reading: the [CV] words fix only the
 *   degree-minute(-second) layout of vākya 1, where the rāśi is 0; the place of the rāśi digit in later vākyas is not
 *   checked here] — and that integer is encoded with katapayadi.js encodeInteger, whose first syllable is the units
 *   digit: read अङ्कानां वामतो गतिः, as Mādhava's "śīlaṃ rājñaḥ śriye" = 120235 is. decodeWord gives it back exactly.
 *   THESE ARE NOT THE TRADITIONAL VĀKYAS. The authors chose meaningful Sanskrit sentences; this generator writes one
 *   valid digit-encoding per value (the first consonant of each varga row), which carries the number and nothing else.
 *
 * USE (vakyaMoon). A khaṇḍa is a whole day near anomaly zero; its dhruva is the canon's true Moon on that day. Days
 *   since the khaṇḍa are divided by the cycles (default 12,372, 3031, 248), each whole cycle adding its own dhruva — the
 *   true advance over that many days from the apogee, rounded like a vākya — and the remainder (< 248) picks the vākya.
 *   `compare` sets that beside the canon's true Moon computed directly: the difference is the method's own error
 *   [measured], from the khaṇḍa's leftover anomaly, the cycles' imperfect closure, and the rounding of the table.
 *   ("Dhruva" here is the tradition's word for a stored position at an epoch, not the pole of dhruva.js.)
 * Day origin: whole civil days since the Kali epoch as the canon modules count them; whether the vākyas belong to sunrise
 *   (the Kerala reckoning [unverified]) or to that origin is left to the caller. No modern source, no imports beyond the
 *   sovereign files. Browser: window.Candravakya (needs Katapayadi, ParahitaMadhyama, Sphuta, SpandaGanita, KalaDvara);
 *   node: module.exports.
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory(require("./katapayadi.js"), require("./parahita-madhyama.js"), require("./sphuta.js"), require("./spanda-ganita.js"), require("./kala-dvara.js"));
  } else root.Candravakya = factory(root.Katapayadi, root.ParahitaMadhyama, root.Sphuta, root.SpandaGanita, root.KalaDvara);
})(typeof globalThis !== "undefined" ? globalThis : this, function (K, P, S, SG, KD) {
  "use strict";
  const { Q, add, sub, mul, div, cmp, floor } = SG;
  const ARCMIN = 21600n, HALF = 10800n, QUAD = 5400n, ARCSEC = 1296000n;
  const neg = (a) => Q(-a[0], a[1]);
  const modQ = (a, m) => sub(a, Q(floor(div(a, Q(m))) * m));
  const ratQ = (x) => Q(x.num, x.den);                                     // {num, den} → [n, d]
  const toFloat = (a) => Number((a[0] * 1000000000000n) / a[1]) / 1e12;
  const bigInt = (x, what) => {
    if (typeof x === "bigint") return x;
    if (!Number.isInteger(x)) throw new TypeError(`candravakya: ${what} must be an integer`);
    return BigInt(x);
  };
  /** A number of degrees (31.5), a [num, den] pair of BigInts, or a rational [n, d] → exact rational. */
  function ratOf(x) {
    if (Array.isArray(x) && typeof x[0] === "bigint") return Q(x[0], x[1] === undefined ? 1n : x[1]);
    if (typeof x === "number" && Number.isFinite(x)) {
      const s = String(x);
      if (/e/i.test(s)) throw new RangeError("candravakya: give the epicycle as a plain decimal or a [num, den] pair");
      const [w, f = ""] = s.split(".");
      return Q(BigInt(w + f), 10n ** BigInt(f.length));
    }
    throw new TypeError("candravakya: an epicycle is a number of degrees or a [num, den] pair of BigInts");
  }

  // ── the canons ────────────────────────────────────────────────────────────────────────────────────────────────────
  const SAKA = (b) => ratQ(P.sakabdaRevPerYuga(b));
  const CANONS = Object.freeze({
    aryabhata: Object.freeze({
      name: "aryabhata", yugaDays: P.YUGA_DAYS, moon: Q(P.REV.moon), apogee: Q(P.REV.apogee),
      epicycle: Object.freeze([Q(63n, 2n), Q(63n, 2n)]), sine: "madhava",
      mean: (body, d) => { const x = P.meanArcsec(body, d * P.SPD); return Q(x.num, x.den * 60n); },
      tags: Object.freeze({
        integers: "[text] Āryabhaṭīya Gītikā 3 (Moon 57,753,336; civil days 1,577,917,500); apogee 488,219 certified by Parameśvara's epoch (parahita-madhyama.test.js)",
        epicycle: "[unverified] 31.5/360 at both ends, attributed to Āryabhaṭa by the research (design doc §8); no local edition gives it",
      }),
    }),
    parahita: Object.freeze({
      name: "parahita", yugaDays: P.YUGA_DAYS, moon: sub(Q(P.REV.moon), SAKA("moon")), apogee: sub(Q(P.REV.apogee), SAKA("apogee")),
      epicycle: Object.freeze([Q(63n, 2n), Q(63n, 2n)]), sine: "madhava",
      mean: (body, d) => { const x = P.parahitaArcsec(body, d * P.SPD); return Q(x.num, x.den * 60n); },
      tags: Object.freeze({
        integers: "[text] Āryabhaṭa's integers with the Śakābda-saṃskāra (JM p.11) and Parameśvara's 1/5 (JM p.35)",
        epicycle: "[unverified] 31.5/360 at both ends (as for aryabhata)",
      }),
    }),
    surya: Object.freeze({
      name: "surya", yugaDays: S.YUGA_DAYS, moon: Q(S.REV.moon), apogee: Q(S.REV.moonApogee),
      epicycle: Object.freeze([Q(32n), Q(95n, 3n)]), sine: "table",
      mean: (body, d) => {                                                     // frac(R·(1811/4 + d/D)) × 21600′
        const R = body === "moon" ? S.REV.moon : S.REV.moonApogee, D = S.YUGA_DAYS, den = 4n * D;
        let num = (R * (1811n * D + 4n * d)) % den; if (num < 0n) num += den;
        return Q(num * ARCMIN, den);
      },
      tags: Object.freeze({
        integers: "[text] Sūrya-Siddhānta 1.33, 1.37, 1.45-1.47 (sphuta.js)",
        epicycle: "[text] SS 2.34: 32° at the even ends, 31°40′ at the odd; 2.38: varying with the R-sine",
      }),
    }),
  });
  const SINES = Object.freeze({
    table: Object.freeze({ jya: SG.jyaQ, arc: SG.arcQ, R: Q(BigInt(S.R)), tag: "[text] SS 2.17-2.22 table, interpolated (2.31-2.33)" }),
    madhava: Object.freeze({ jya: SG.madhavaJya, arc: SG.madhavaArc, R: SG.MADHAVA_R, tag: "[text] Mādhava's sine polynomial, R = 3437′44″48‴ (katapayadi.test.js [MJ])" }),
  });

  /** The bhuja (0…5400′) of an arc in arcminutes (SS 2.29-2.30). */
  function bhujaQ(k) {
    const f = floor(k);
    return f < QUAD ? k : f < HALF ? sub(Q(HALF), k) : f < 16200n ? sub(k, Q(HALF)) : sub(Q(ARCMIN), k);
  }

  // ── the model ─────────────────────────────────────────────────────────────────────────────────────────────────────
  const models = new Map();
  /** Resolve options → the model: rates in arcminutes per civil day (exact), the epicycle, the sine, the rounding. */
  function model(opts = {}) {
    const canonName = opts.canon || "aryabhata";
    const c = CANONS[canonName];
    if (!c) throw new RangeError(`candravakya: unknown canon "${canonName}" (aryabhata, parahita, surya)`);
    const sineName = opts.sine || c.sine;
    const sine = SINES[sineName];
    if (!sine) throw new RangeError(`candravakya: unknown sine "${sineName}" (table, madhava)`);
    const precision = opts.precision || "seconds";
    if (precision !== "seconds" && precision !== "minutes") throw new RangeError('candravakya: precision is "seconds" or "minutes"');
    const layout = opts.layout || "rasi";
    if (layout !== "rasi" && layout !== "amsa") throw new RangeError('candravakya: layout is "rasi" or "amsa"');
    let epicycle = c.epicycle, epicycleTag = c.tags.epicycle;
    if (opts.epicycle !== undefined) {
      const e = Array.isArray(opts.epicycle) && typeof opts.epicycle[0] !== "bigint" ? opts.epicycle : [opts.epicycle, opts.epicycle];
      epicycle = [ratOf(e[0]), ratOf(e[1])];
      epicycleTag = "supplied by the caller";
    }
    const key = [canonName, sineName, precision, layout, epicycle.map((x) => x.join("/")).join(",")].join("|");
    if (models.has(key)) return models.get(key);
    const perDay = (rev) => div(mul(rev, Q(ARCMIN)), Q(c.yugaDays));         // arcminutes per civil day
    const m = perDay(c.moon), ap = perDay(c.apogee);
    const M = Object.freeze({
      key, canon: c, canonName, sineName, sine, precision, layout, epicycle, epicycleTag,
      moonPerDay: m, apogeePerDay: ap, anomalyPerDay: sub(m, ap),
      anomalisticRevPerYuga: sub(c.moon, c.apogee),
    });
    models.set(key, M);
    return M;
  }

  /** The manda-phala in arcminutes, signed, for a kendra (apogee − Moon) in arcminutes (SS 2.29-2.45). */
  function mandaPhala(kendra, M) {
    const k = modQ(kendra, ARCMIN), bj = M.sine.jya(bhujaQ(k)), [even, odd] = M.epicycle;
    const p = sub(even, div(mul(sub(even, odd), bj), M.sine.R));             // 2.38 (constant when even = odd)
    const phala = M.sine.arc(div(mul(bj, p), Q(360n)));                       // 2.39, arc by 2.33 or Mādhava
    return floor(k) < HALF ? phala : neg(phala);                             // 2.45
  }

  /** The true advance of the Moon after n civil days from the apogee, exact, in arcminutes [0, 21600). */
  function advance(n, opts) {
    const M = opts && opts.key ? opts : model(opts);
    const N = Q(bigInt(n, "the day count"));
    return modQ(add(mul(M.moonPerDay, N), mandaPhala(neg(mul(M.anomalyPerDay, N)), M)), ARCMIN);
  }

  // ── rounding and the words ───────────────────────────────────────────────────────────────────────────────────────
  /** Exact arcminutes → whole seconds (or minutes) of arc, rounded half up, on the circle. */
  function roundArc(arcmin, precision) {
    const unit = precision === "seconds" ? 60n : 1n, full = ARCMIN * unit;
    const x = floor(add(mul(arcmin, Q(unit)), Q(1n, 2n)));
    return ((x % full) + full) % full;
  }
  /** Whole units (seconds or minutes) → { rasi, deg (within the rāśi), amsa (total degrees), min, sec } and the integer. */
  function split(units, precision, layout) {
    const u = BigInt(units), perDeg = precision === "seconds" ? 3600n : 60n;
    const amsa = u / perDeg, rest = u % perDeg;
    const min = precision === "seconds" ? rest / 60n : rest, sec = precision === "seconds" ? rest % 60n : null;
    const rasi = amsa / 30n, deg = amsa % 30n;
    const head = layout === "rasi" ? rasi * 100n + deg : amsa;
    const integer = precision === "seconds" ? (head * 100n + min) * 100n + sec : head * 100n + min;
    return { rasi: Number(rasi), deg: Number(deg), amsa: Number(amsa), min: Number(min), sec: sec === null ? null : Number(sec), integer };
  }
  const pad = (x) => String(x).padStart(2, "0");
  function dmsOf(s) { return `${s.amsa}°${pad(s.min)}′` + (s.sec === null ? "" : `${pad(s.sec)}″`); }
  /** Read a vākya word (the tradition's or this generator's) as a place: vāmato gatiḥ, then the layout. */
  function decodeVakya(word, { precision = "seconds", layout = "rasi" } = {}) {
    const v = K.decodeWord(word).value;
    let rest = v;
    const sec = precision === "seconds" ? rest % 100n : null; if (precision === "seconds") rest /= 100n;
    const min = rest % 100n; rest /= 100n;
    let amsa;
    if (layout === "rasi") { const deg = rest % 100n, rasi = rest / 100n; if (deg >= 30n) throw new RangeError(`candravakya: "${word}" has ${deg} degrees in a rāśi`); amsa = rasi * 30n + deg; }
    else amsa = rest;
    if (min >= 60n || (sec !== null && sec >= 60n)) throw new RangeError(`candravakya: "${word}" is not a place in ${precision}`);
    const units = precision === "seconds" ? amsa * 3600n + min * 60n + sec : amsa * 60n + min;
    const s = split(units, precision, layout);
    return { value: v, units, arcsec: precision === "seconds" ? units : units * 60n, ...s, dms: dmsOf(s) };
  }

  /** One vākya: exact advance, rounded place, integer, word in both scripts, and the round trip. */
  function vakya(n, opts) {
    const M = opts && opts.key ? opts : model(opts);
    const exact = advance(n, M), units = roundArc(exact, M.precision), s = split(units, M.precision, M.layout);
    const word = K.encodeInteger(s.integer, "iast"), wordDeva = K.encodeInteger(s.integer, "devanagari");
    const back = K.decodeWord(word).value, backDeva = K.decodeWord(wordDeva).value;
    return Object.freeze({
      n: Number(n), arcmin: exact, degrees: toFloat(exact) / 60, units, arcsec: M.precision === "seconds" ? units : units * 60n,
      rasi: s.rasi, deg: s.deg, amsa: s.amsa, min: s.min, sec: s.sec, dms: dmsOf(s),
      integer: s.integer, word, wordDeva, roundTrip: back === s.integer && backDeva === s.integer,
    });
  }

  const NOTE = "Generated digit-encodings (first consonant of each varga row, units first): valid Kaṭapayādi for the value, "
    + "NOT the traditional vākyas, whose authors chose meaningful Sanskrit sentences.";
  const tables = new Map();
  /** The table: day 0 (the cycle start, 0) and vākyas 1 … count (default 248). Cached per model. */
  function generate(opts = {}) {
    const M = model(opts), count = opts.count === undefined ? 248 : opts.count;
    const key = M.key + "#" + count;
    if (tables.has(key)) return tables.get(key);
    const vakyas = [];
    for (let n = 0; n <= count; n++) vakyas.push(vakya(n, M));
    const out = Object.freeze({ model: describe(M), vakyas: Object.freeze(vakyas), note: NOTE });
    tables.set(key, out);
    return out;
  }
  function describe(M) {
    return Object.freeze({
      canon: M.canonName, sine: M.sineName, precision: M.precision, layout: M.layout,
      epicycle: M.epicycle.map(toFloat), epicycleTag: M.epicycleTag, integersTag: M.canon.tags.integers, sineTag: M.sine.tag,
      moonPerDayArcmin: toFloat(M.moonPerDay), anomalyPerDayArcmin: toFloat(M.anomalyPerDay),
    });
  }

  // ── the cycles ────────────────────────────────────────────────────────────────────────────────────────────────────
  /** How nearly N days close the anomaly, by the canon's own integers (exact): whole anomalistic months, and what is left
   *  over as an arc of anomaly and as days. */
  function closure(N, opts) {
    const M = opts && opts.key ? opts : model(opts);
    const n = bigInt(N, "the cycle length");
    const revs = div(mul(Q(n), M.anomalisticRevPerYuga), Q(M.canon.yugaDays)); // anomalistic revolutions in N days
    const months = floor(add(revs, Q(1n, 2n)));
    const left = sub(revs, Q(months));
    return Object.freeze({
      days: Number(n), months: Number(months), revolutions: revs,
      residualArcmin: toFloat(mul(left, Q(ARCMIN))),
      residualDays: toFloat(div(mul(left, Q(M.canon.yugaDays)), M.anomalisticRevPerYuga)),
      monthDays: toFloat(div(Q(M.canon.yugaDays), M.anomalisticRevPerYuga)),
      impliedMonthDays: months > 0n ? Number(n) / Number(months) : null,
    });
  }
  /** Convergents p/q of the canon's anomalistic month in days (q months ≈ p days), from its continued fraction. */
  function convergents(opts, count = 8) {
    const M = opts && opts.key ? opts : model(opts);
    const r = div(Q(M.canon.yugaDays), M.anomalisticRevPerYuga);
    let [a, b] = r; const terms = [];
    while (b !== 0n && terms.length < count) { terms.push(a / b); [a, b] = [b, a % b]; }
    const out = []; let [p0, q0, p1, q1] = [1n, 0n, terms[0], 1n];
    out.push({ days: Number(p1), months: Number(q1) });
    for (let i = 1; i < terms.length; i++) {
      const p = terms[i] * p1 + p0, q = terms[i] * q1 + q0;
      out.push({ days: Number(p), months: Number(q) });
      [p0, q0, p1, q1] = [p1, q1, p, q];
    }
    return Object.freeze({ terms: terms.map(Number), convergents: out.map((x) => Object.freeze({ ...x, residualArcmin: closure(x.days, M).residualArcmin })) });
  }

  // ── the Moon on a day, directly and the vākya way ────────────────────────────────────────────────────────────────
  /** The canon's true Moon on Kali day d, computed directly (exact arcminutes), with the mean places and the anomaly. */
  function trueMoon(kaliDay, opts) {
    const M = opts && opts.key ? opts : model(opts);
    const d = bigInt(kaliDay, "the Kali day");
    const mean = M.canon.mean("moon", d), apogee = M.canon.mean("apogee", d);
    const kendra = modQ(sub(apogee, mean), ARCMIN), phala = mandaPhala(kendra, M);
    const moon = modQ(add(mean, phala), ARCMIN);
    const anomaly = modQ(add(sub(mean, apogee), Q(HALF)), ARCMIN);          // shifted by half a circle …
    const signedAnomaly = sub(anomaly, Q(HALF));                              // … to (−180°, 180°]
    return Object.freeze({ kaliDay: Number(d), arcmin: moon, degrees: toFloat(moon) / 60, mean, apogee, phala, anomalyArcmin: toFloat(signedAnomaly) });
  }
  /** The whole day in [fromDay, toDay] on which the mean anomaly is nearest zero: a khaṇḍa for the vākya count. */
  function findKhanda(fromDay, toDay, opts) {
    const M = opts && opts.key ? opts : model(opts);
    let best = null;
    for (let d = bigInt(fromDay, "fromDay"); d <= bigInt(toDay, "toDay"); d++) {
      const mean = M.canon.mean("moon", d), apogee = M.canon.mean("apogee", d);
      const a = sub(modQ(add(sub(mean, apogee), Q(HALF)), ARCMIN), Q(HALF));
      const abs = a[0] < 0n ? neg(a) : a;
      if (best === null || cmp(abs, best.abs) < 0) best = { day: d, abs, anomaly: a };
    }
    if (!best) throw new RangeError("candravakya: an empty range has no khaṇḍa");
    return Object.freeze({ kaliDay: Number(best.day), anomalyArcmin: toFloat(best.anomaly) });
  }
  const dhruvas = new Map();
  /** The Moon on Kali day d by the vākyas: the khaṇḍa's dhruva + whole cycles × their dhruvas + the vākya of the rest. */
  function vakyaMoon(kaliDay, opts = {}) {
    const M = model(opts);
    if (opts.khanda === undefined) throw new TypeError("candravakya: vakyaMoon needs a khaṇḍa (a Kali day near anomaly zero; see findKhanda)");
    const cycles = (opts.cycles || [12372, 3031, 248]).map((x) => bigInt(x, "a cycle")).sort((x, y) => (x > y ? -1 : x < y ? 1 : 0));
    const k0 = bigInt(opts.khanda, "the khaṇḍa"), d = bigInt(kaliDay, "the Kali day");
    if (d < k0) throw new RangeError("candravakya: the vākya count runs forward from its khaṇḍa");
    const table = generate({ ...opts, count: Number(cycles[cycles.length - 1]) - 1 }).vakyas;
    const full = M.precision === "seconds" ? ARCSEC : ARCMIN;
    const k = trueMoon(k0, M), khandaDhruva = roundArc(k.arcmin, M.precision);
    let left = d - k0, units = khandaDhruva;
    const decomposition = [];
    for (const L of cycles) {
      const q = left / L; left -= q * L;
      const dk = M.key + "@" + L;
      if (!dhruvas.has(dk)) dhruvas.set(dk, vakya(L, M));
      const dhruva = dhruvas.get(dk);
      units += q * dhruva.units;
      decomposition.push(Object.freeze({ cycle: Number(L), count: Number(q), dhruva: dhruva.dms }));
    }
    const v = table[Number(left)];
    units = (units + v.units) % full;
    const s = split(units, M.precision, M.layout);
    return Object.freeze({
      kaliDay: Number(d), khanda: Number(k0), khandaDhruva: split(khandaDhruva, M.precision, M.layout), khandaAnomalyArcmin: k.anomalyArcmin,
      decomposition: Object.freeze(decomposition), vakyaIndex: Number(left), cycleStart: Number(d - left), vakya: v.dms,
      units, degrees: Number(units) / (M.precision === "seconds" ? 3600 : 60), dms: dmsOf(s),
    });
  }
  /** The vākya way against the canon's own true Moon on the same day: the method's error, in arcminutes, signed. */
  function compare(kaliDay, opts = {}) {
    const M = model(opts), v = vakyaMoon(kaliDay, opts), t = trueMoon(kaliDay, M);
    let diff = v.degrees * 60 - toFloat(t.arcmin);
    diff = ((diff + 10800) % 21600 + 21600) % 21600 - 10800;
    return Object.freeze({ kaliDay: v.kaliDay, vakya: v, direct: t.degrees, errorArcmin: diff });
  }
  /** Civil date → Kali day (kala-dvara.js). */
  const kaliDayOf = (date) => KD.kaliDayFromCivil(date);

  return Object.freeze({
    CANONS, SINES, NOTE, model, mandaPhala, advance, vakya, generate, decodeVakya, closure, convergents,
    trueMoon, findKhanda, vakyaMoon, compare, kaliDayOf, roundArc, split,
  });
});
