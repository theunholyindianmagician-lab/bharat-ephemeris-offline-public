/* kala-dvara.js — काल-द्वार, the time door of the sovereign (vedha-yantra) engine.
 *
 * THE CHAIN OF TIME, as the Sūrya-Siddhānta states it:
 *   1.11  6 prāṇa = 1 vināḍī;  60 vināḍī = 1 nāḍikā (ghaṭī).
 *   1.12  60 nāḍī = the NĀKṢATRA ahorātra — one turn of the star-wheel (bhacakra).
 *         So 21,600 prāṇa = 21,600 kalā = 360°: a prāṇa is the time of one arc-minute of that turn.
 *         TIME IS THE ANGLE THE WHEEL HAS TURNED. On the spanda lattice (328,050,000,000 per turn)
 *         1″ of the turn = 253,125 spandas, 1 prāṇa = 1′ = 15,187,500, 1 nāḍī = 6°.
 *   THE LATTICE AND ITS SOURCES (corpus/sources/time-units.json, "canonical"; owner decision P1, 2026-10-08):
 *         only SS 1.11-1.12 is the text here — 6 prāṇa, 60 vināḍī, 60 nāḍī to the turn — and it reaches down to the
 *         prāṇa and no further (SS 1.11 names the truṭi but gives it no ratio). Below the prāṇa the lattice is the
 *         engine's chain (math-core.js SUBDAY_CHAIN): its twelve steps paramāṇu → ahorātra carry the label
 *         'Bhāgavata 3.11' in code only, a claim awaiting an edition [claim-only; no Bhāgavata text is in any
 *         repository]; the thirteenth factor, 100 spandas to a paramāṇu, is an engine choice [claim-only; no located
 *         source] that makes 1″ of the turn a whole number of cells. This file divides the lattice only by SS 1.11-1.12.
 *         Names: 'pala' = 1/60 ghaṭī (= vināḍī), vipala = 1/60 pala [standard; no local text] (time-units.json, P1).
 *   1.34  In a yuga the stars rise 1,582,237,828 times; a body's own risings are that count less its
 *         own revolutions.
 *   1.39  So the Sun's own risings — the civil (sāvana) days, sunrise to sunrise (1.36, 14.18) — are the
 *         star-risings less the Sun's 4,320,000 revolutions: 1,577,917,828.
 *   1.35  Lunar months = Moon revolutions − Sun revolutions; adhimāsa = lunar months − solar months.
 *   14.14 30 tithis a lunar month;  1.36  tithikṣaya = tithis − civil days.
 *   14.19 Mean daily motions are counted by the civil day.
 * Every count of every kind of day, month and year therefore follows exactly from three integers: the turns
 * of the wheel, and the Sun's and the Moon's revolutions. This module carries both canons that the Kerala
 * records need: the Sūrya-Siddhānta's, and Āryabhaṭa's (rotations 1,582,237,500, Gītikāpāda 3).
 *
 * The kapāla bowl sinks 60 times in an ahorātra (SS 13.23), and the ahorātra of 60 nāḍī is the nākṣatra one
 * (1.12): a bowl is calibrated on two transits of the same star, and its readings are nāḍīs of the TURN.
 * They become civil time only through the identity above, never by assuming the two days are equal.
 *
 * Also: civil date (Julian or Gregorian, proleptic) ↔ Kali-ahargaṇa (civil days since Friday 18 Feb 3102
 * BCE Julian, JD 588465.5 at 0h); vāra. No imports, no floating point, no Earth-rotation correction: the
 * clock IS the rotation, so nothing has to be converted to or from it.
 * Both calendars are proleptic, with astronomical year numbers (0 = 1 BCE, −3101 = 3102 BCE, −50000 = 50001 BCE),
 * and hold for every integer year: below JDN 0 a date is carried up by whole cycles (146,097 days = 400 Gregorian
 * years; 1,461 days = 4 Julian years) and carried back. Tested over −50,000 … +50,000 years, against round trips and
 * independently against sums of year lengths (kala-dvara.test.js).
 * Browser: window.KalaDvara; node: module.exports.
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.KalaDvara = factory();
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const KALI_JDN = 588466;                         // JDN of Kali day 0 (civil day beginning at JD 588465.5)
  const SPANDAS_PER_DAY = 328050000000n;           // 2⁷·3⁸·5⁸ in one ahorātra (one turn, or one civil day — the caller says which)
  const PRANA_PER_VINADI = 6n, VINADI_PER_GHATI = 60n, GHATI_PER_DAY = 60n;
  const SPANDAS_PER_GHATI = SPANDAS_PER_DAY / GHATI_PER_DAY;               // 5,467,500,000  = 6° of the turn
  const SPANDAS_PER_VINADI = SPANDAS_PER_GHATI / VINADI_PER_GHATI;         //    91,125,000  = 6′
  const SPANDAS_PER_PRANA = SPANDAS_PER_VINADI / PRANA_PER_VINADI;         //    15,187,500  = 1′
  const ARCSEC_PER_TURN = 1296000n;
  const SPANDAS_PER_ARCSEC = SPANDAS_PER_DAY / ARCSEC_PER_TURN;            //       253,125  = 1″
  const VARA = Object.freeze(["ravivāra", "somavāra", "maṅgalavāra", "budhavāra", "guruvāra", "śukravāra", "śanivāra"]);

  // ── the three integers of each canon ────────────────────────────────────────────────────────────
  const CANON = Object.freeze({
    surya: Object.freeze({ risings: 1582237828n, sun: 4320000n, moon: 57753336n, source: "Sūrya-Siddhānta 1.29, 1.30, 1.34" }),
    aryabhata: Object.freeze({ risings: 1582237500n, sun: 4320000n, moon: 57753336n, source: "Āryabhaṭīya, Gītikā 3: khyughṛ, cayagiyiṅśuchlṛ, ṅiśibuṇḷṣkhṛ (decoded by katapayadi.js decodeAryabhata)" }),
  });
  const canonOf = (name) => { const c = CANON[name]; if (!c) throw new RangeError(`kala-dvara: unknown canon "${name}"`); return c; };

  /** Every time-count of a yuga, derived from the canon's three integers by the text's own rules. */
  function mana(canonName = "surya") {
    const c = canonOf(canonName);
    const nakshatra = c.risings;                    // star-risings = turns of the wheel           (1.34)
    const savana = c.risings - c.sun;               // the Sun's own risings = civil days           (1.34, 1.39)
    const sauraMasa = 12n * c.sun;                  // twelve saṅkrāntis in a revolution            (1.13)
    const candraMasa = c.moon - c.sun;              // lunar months                                 (1.35)
    const adhimasa = candraMasa - sauraMasa;        // intercalary months                           (1.35)
    const tithi = 30n * candraMasa;                 // lunar days                                   (14.14)
    const tithiksaya = tithi - savana;              // omitted tithis                               (1.36)
    return Object.freeze({ nakshatra, savana, sauraMasa, candraMasa, adhimasa, tithi, tithiksaya, sun: c.sun, moon: c.moon });
  }
  /** A body's own risings in a yuga: the star-risings less its own revolutions (SS 1.34). */
  function udayaCount(canonName, revolutions) { return canonOf(canonName).risings - big(revolutions, "revolutions"); }

  // ── clocks: the turn of the wheel and the civil day ─────────────────────────────────────────────
  /** Spandas of the turn → spandas of the civil day (exact rational): × savana / nakshatra. */
  function savanaFromNakshatra(spandas, canonName = "surya") {
    const m = mana(canonName);
    return { num: big(spandas, "spandas") * m.savana, den: m.nakshatra };
  }
  /** Spandas of the civil day → spandas of the turn (exact rational): × nakshatra / savana. */
  function nakshatraFromSavana(spandas, canonName = "surya") {
    const m = mana(canonName);
    return { num: big(spandas, "spandas") * m.nakshatra, den: m.savana };
  }
  /** Time is angle: spandas of the turn → arcseconds the wheel has turned (exact rational, not reduced mod a turn). */
  function arcsecOfTurn(spandas) { return { num: big(spandas, "spandas"), den: SPANDAS_PER_ARCSEC }; }
  /** Angle → spandas of the turn (deśāntara, hour angle, rising times in prāṇa): 1″ = 253,125 spandas. */
  function turnSpandasFromArcsec(arcsec) { return big(arcsec, "arcsec") * SPANDAS_PER_ARCSEC; }
  /** Jyotirmīmāṃsā §14 (p.36): elapsed prāṇas × a body's own daily motion ÷ 21,600 = the arc it moved in that time.
   *  Exact, because a prāṇa is one kalā of the turn. Arguments are integers (prāṇas, arc-minutes); result is a rational in arc-minutes. */
  function arcFromPranas(pranas, dailyMotionArcmin) {
    return { num: big(pranas, "prāṇas") * big(dailyMotionArcmin, "daily motion"), den: 21600n };
  }

  /** Civil spandas since the Kali epoch for a kapāla reading taken on Kali day `kaliDay`, counted from that day's origin.
   *  `calibration`: "nakshatra" (the bowl sinks 60 times per turn — SS 1.12 with 13.23; the default) or "savana". Exact rational. */
  function savanaSpandasAt(kaliDay, reading, { calibration = "nakshatra", canon = "surya" } = {}) {
    if (!isInt(kaliDay)) throw new TypeError("kala-dvara: Kali day must be an integer");
    const day = BigInt(kaliDay) * SPANDAS_PER_DAY;
    const r = kapalaToSpandas(reading);
    if (calibration === "savana") return { num: day + r, den: 1n };
    if (calibration !== "nakshatra") throw new RangeError(`kala-dvara: calibration must be "nakshatra" or "savana"`);
    const m = mana(canon);
    return { num: day * m.nakshatra + r * m.savana, den: m.nakshatra };
  }

  // ── calendar ────────────────────────────────────────────────────────────────────────────────────
  const fl = Math.floor;
  const isInt = (x) => Number.isInteger(x);
  function big(x, what) {
    if (typeof x === "bigint") return x;
    if (!isInt(x)) throw new TypeError(`kala-dvara: ${what} must be an integer`);
    return BigInt(x);
  }

  function jdnFromCivil(calendar, y, m, d) {
    for (const [k, v] of Object.entries({ year: y, month: m, day: d })) {
      if (!isInt(v)) throw new TypeError(`kala-dvara: ${k} must be an integer, got ${v}`);
    }
    if (m < 1 || m > 12 || d < 1 || d > 31) throw new RangeError(`kala-dvara: invalid month/day ${m}/${d}`);
    if (calendar !== "julian" && calendar !== "gregorian") throw new RangeError(`kala-dvara: calendar must be "julian" or "gregorian"`);
    const a = fl((14 - m) / 12), yy = y + 4800 - a, mm = m + 12 * a - 3;
    const base = d + fl((153 * mm + 2) / 5) + 365 * yy + fl(yy / 4);
    const jdn = calendar === "julian" ? base - 32083 : base - fl(yy / 100) + fl(yy / 400) - 32045;   // floor division: every integer year
    const back = civilFromJdn(calendar, jdn);                       // reject 30 Feb, 31 Apr, 29 Feb in a common year
    if (back.year !== y || back.month !== m || back.day !== d) throw new RangeError(`kala-dvara: ${y}-${m}-${d} does not exist in the ${calendar} calendar`);
    return jdn;
  }

  const JDN_LIMIT = 2 ** 50;                       // |4·JDN| and every intermediate below stay exact integers in a double
  function civilFromJdn(calendar, jdn) {
    if (!isInt(jdn)) throw new RangeError("kala-dvara: JDN must be an integer");
    if (calendar !== "julian" && calendar !== "gregorian") throw new RangeError(`kala-dvara: calendar must be "julian" or "gregorian"`);
    if (Math.abs(jdn) > JDN_LIMIT) throw new RangeError("kala-dvara: JDN beyond ±2^50 is not exactly representable here");
    if (jdn < 0) {                                  // whole cycles: 146,097 days = 400 Gregorian years; 1,461 days = 4 Julian years
      const P = calendar === "gregorian" ? 146097 : 1461, Y = calendar === "gregorian" ? 400 : 4, k = Math.ceil(-jdn / P);
      const c = civilFromJdn(calendar, jdn + k * P);
      return { year: c.year - k * Y, month: c.month, day: c.day };
    }
    let f = jdn + 1401;
    if (calendar === "gregorian") f += fl((fl((4 * jdn + 274277) / 146097) * 3) / 4) - 38;
    else if (calendar !== "julian") throw new RangeError(`kala-dvara: calendar must be "julian" or "gregorian"`);
    const e = 4 * f + 3, g = fl((e % 1461) / 4), h = 5 * g + 2;
    const day = fl((h % 153) / 5) + 1;
    const month = ((fl(h / 153) + 2) % 12) + 1;
    const year = fl(e / 1461) - 4716 + fl((12 + 2 - month) / 12);
    return { year, month, day };
  }

  /** Whole civil days elapsed from the Kali epoch to the civil day `year-month-day` (0 = Friday 18 Feb 3102 BCE Julian). */
  function kaliDayFromCivil({ calendar, year, month, day }) { return jdnFromCivil(calendar, year, month, day) - KALI_JDN; }
  /** Civil date of a Kali day, in the requested calendar (astronomical years: 1 BCE = 0, 3102 BCE = −3101). */
  function civilFromKaliDay(n, calendar) {
    if (!isInt(n)) throw new TypeError("kala-dvara: Kali day must be an integer");
    return civilFromJdn(calendar, KALI_JDN + n);
  }
  /** vāra of a Kali day: index 0 = ravivāra (Sunday) … 6 = śanivāra. */
  function varaOfKaliDay(n) {
    if (!isInt(n)) throw new TypeError("kala-dvara: Kali day must be an integer");
    const i = (((KALI_JDN + n + 1) % 7) + 7) % 7;
    return { index: i, name: VARA[i] };
  }

  /** {ghaṭī, vināḍī, prāṇa, spanda} → spandas of whichever ahorātra the reading is counted in. */
  function kapalaToSpandas({ ghati = 0, vinadi = 0, prana = 0, spanda = 0 } = {}) {
    return big(ghati, "ghaṭī") * SPANDAS_PER_GHATI + big(vinadi, "vināḍī") * SPANDAS_PER_VINADI
      + big(prana, "prāṇa") * SPANDAS_PER_PRANA + big(spanda, "spanda");
  }
  /** Spandas within one ahorātra (0 ≤ s < 328,050,000,000) → {ghaṭī, vināḍī, prāṇa, spanda}. */
  function spandasToKapala(s) {
    const x = big(s, "spandas");
    if (x < 0n || x >= SPANDAS_PER_DAY) throw new RangeError("kala-dvara: a kapāla reading lies within one ahorātra");
    return {
      ghati: x / SPANDAS_PER_GHATI,
      vinadi: (x % SPANDAS_PER_GHATI) / SPANDAS_PER_VINADI,
      prana: (x % SPANDAS_PER_VINADI) / SPANDAS_PER_PRANA,
      spanda: x % SPANDAS_PER_PRANA,
    };
  }

  return Object.freeze({
    KALI_JDN, SPANDAS_PER_DAY, SPANDAS_PER_GHATI, SPANDAS_PER_VINADI, SPANDAS_PER_PRANA, SPANDAS_PER_ARCSEC, ARCSEC_PER_TURN, VARA, CANON,
    mana, udayaCount, savanaFromNakshatra, nakshatraFromSavana, arcsecOfTurn, turnSpandasFromArcsec, arcFromPranas, savanaSpandasAt,
    kaliDayFromCivil, civilFromKaliDay, varaOfKaliDay, kapalaToSpandas, spandasToKapala,
  });
});
