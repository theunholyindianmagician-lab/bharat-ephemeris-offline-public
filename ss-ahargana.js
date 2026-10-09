/* ss-ahargana.js — अहर्गण and the lords: the Sūrya-Siddhānta's own day-count from a lunisolar date, and the lords of
 * the day, month, year and horā, by the text's integers.
 *
 *   1.45-1.47  from creation to the end of the Kṛta 1,953,720,000 years; to the Kali epoch 452¾ yugas of motion,
 *              1,955,880,000 years = 714,402,296,627 civil days (452¾ × 1,577,917,828) [theorem].
 *   1.48       the years gone (gatakālābda) × 12, plus the months gone since Madhu-śukla (Caitra śukla), "kept apart".
 *   1.49       those months × the yuga's adhimāsas ÷ its solar months = adhimāsas gone (the quotient); add them, make
 *              days (× 30) and add the tithis gone.
 *   1.50       those days, "kept in two places", × the yuga's kṣaya-days ÷ its lunar days = kṣaya gone; subtract: the civil
 *              day-count at midnight at Laṅkā (ārdharātrika).
 *   1.51       ÷ 7: the remainder from the Sun (Sunday = 0) is the lord of the day.
 *   1.52       the count ÷ 30 and ÷ 360 (months and years of civil days) × 2 and × 3, + 1 (rūpa), ÷ 7: the remainders,
 *              counted from the Sun as 1, are the lords of the month and the year.
 *   12.78-79   the orbit order downward from Saturn: Saturn, Jupiter, Mars, Sun, Venus, Mercury, Moon. Day lords are every
 *              fourth, year lords every third, from Saturn down; month lords run upward from the Moon; horā lords
 *              downward from Saturn, one a horā.
 * Theorems tested: creation (Sunday, 1.51) + 714,402,296,627 days falls on a Friday — the Kali epoch's weekday; 12.78's
 * "every fourth" is +1 weekday (24 horās ≡ 3 orbit steps), "every third" is +3 (360 ≡ 3 mod 7), 12.79's "upward from
 * the Moon" is +2 (30 ≡ 2 mod 7): the two chapters give the same lords.
 * The yuga numbers are the text's (1.29-1.39, corpus/surya-siddhanta/numbers.json); kala-dvara.js gives the same.
 * The lunisolar year (yearOfKali, lunarYear): from the nija Caitra new moon to the next, by the true calendar
 * (panchanga.js, passed in) — amānta months named by their saṅkrāntis (14.10; the naming rule is standard practice, no
 * local text), Kali years gone at the start, Śaka = Kali − 3179 and Vikrama = Kali − 3044 [standard]; which Caitra opens
 * the year when there are two is [unverified convention]. The 100,000-year calendar (scripts/calendar-100k.cjs) is built
 * on yearOfKali.
 * Browser: window.SSAhargana (needs KalaDvara); node: module.exports.
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory(require("./kala-dvara.js"));
  else root.SSAhargana = factory(root.KalaDvara);
})(typeof globalThis !== "undefined" ? globalThis : this, function (K) {
  "use strict";
  const M = K.mana("surya");                                   // the yuga's counts, from the three integers (1.29-1.39)
  const SOLAR_MONTHS = BigInt(M.sauraMasa);                     // 51,840,000 = 12 × 4,320,000
  const ADHIMASA = BigInt(M.adhimasa);                         // 1,593,336
  const LUNAR_DAYS = BigInt(M.tithi);                           // 1,603,000,080 = 30 × (57,753,336 − 4,320,000)
  const KSHAYA = BigInt(M.tithiksaya);                          // 25,082,252
  const YUGA_DAYS = BigInt(M.savana);                          // 1,577,917,828
  const YEARS_TO_KALI = 1955880000n;                           // 1.45-1.47
  const DAYS_TO_KALI = YUGA_DAYS * 1811n / 4n;                 // 452¾ yugas: 714,402,296,627
  if (YUGA_DAYS * 1811n % 4n !== 0n) throw new Error("ss-ahargana: 452¾ yugas are not whole days");
  const WEEKDAY = Object.freeze(["Sūrya", "Candra", "Maṅgala", "Budha", "Guru", "Śukra", "Śani"]);          // from Sunday
  const ORBIT_DOWN = Object.freeze(["Śani", "Guru", "Maṅgala", "Sūrya", "Śukra", "Budha", "Candra"]);       // 12.78
  const big = (x) => (typeof x === "bigint" ? x : BigInt(x));
  const mod = (a, m) => ((a % m) + m) % m;

  /** 1.48-1.50: the civil days since creation, at midnight at Laṅkā, from the years gone since creation, the lunar months
   *  gone since Caitra śukla, and the tithis gone in the current month. Every division keeps the quotient ("labdha"). */
  function ahargana({ yearsSinceCreation, monthsSinceCaitra, tithisGone }) {
    const months = big(yearsSinceCreation) * 12n + big(monthsSinceCaitra);            // 1.48
    const adhimasaGone = months * ADHIMASA / SOLAR_MONTHS;                              // 1.49
    const lunarDays = (months + adhimasaGone) * 30n + big(tithisGone);
    const kshayaGone = lunarDays * KSHAYA / LUNAR_DAYS;                                 // 1.50
    const days = lunarDays - kshayaGone;
    return { days, months, adhimasaGone, lunarDays, kshayaGone, kaliDay: days - DAYS_TO_KALI };
  }
  /** The text's count is a mean count: the tithis are true, the kṣaya and adhimāsa quotients mean. A reckoner checks it
   *  by the weekday (1.51 read backwards) [reading: the standard practice; the text gives the lord, not the check]:
   *  the day within ±span of the count, `monthShift` months on (−1 when the mean adhimāsa of 1.49 has already counted
   *  the year's adhika month and the true one is still to come), whose weekday is the one known. */
  function byWeekday(kaliDay, weekdayIndex, opts = {}) {
    const base = big(kaliDay) + 30n * BigInt(opts.monthShift || 0), span = opts.span || 1;
    const cands = [];
    for (let k = -span; k <= span; k++) { const N = base + BigInt(k); if (Number(mod(N + DAYS_TO_KALI, 7n)) === weekdayIndex) cands.push(N); }
    return cands.length === 1 ? cands[0] : null;
  }
  /** The same from Kali years gone (years since the Kali epoch). */
  const aharganaFromKali = (o) => ahargana({ ...o, yearsSinceCreation: YEARS_TO_KALI + big(o.kaliYearsGone) });

  /** The exact civil day (Kali day number) of a lunisolar date, by the true calendar `P` (panchanga.js, passed in): the day
   *  at whose start (midnight at Laṅkā, as 1.50 counts) the given true month (name, adhika or not) and tithi are current,
   *  in the year whose nija Caitra began `kaliYearsGone` years after the Kali epoch. The text's count (1.48-1.50) is the
   *  first guess; its own offsets (0, ±1, a month either way) are tried first, then ±40 days. Owner, 2026-10-07: the
   *  default way to date a lunisolar date; `ahargana` stays the text's rule as written. Returns { kaliDay, textCount,
   *  offset, candidates } — candidates has two days when one tithi spans two midnights, none when the tithi is skipped. */
  function exactDay(date, P) {
    if (!P || typeof P.lunarMonth !== "function" || typeof P.limbsAt !== "function") throw new TypeError("ss-ahargana: exactDay needs the calendar (panchanga.js)");
    const mIdx = typeof date.month === "string" ? P.MONTH.indexOf(date.month) : date.monthsSinceCaitra;
    if (!(mIdx >= 0 && mIdx < 12)) throw new RangeError("ss-ahargana: month is a name of P.MONTH or monthsSinceCaitra 0-11");
    const tithi = date.tithi !== undefined ? date.tithi : date.tithisGone + 1, adhika = !!date.adhika;
    const text = aharganaFromKali({ kaliYearsGone: date.kaliYearsGone, monthsSinceCaitra: mIdx, tithisGone: tithi - 1 });
    const N0 = Number(text.kaliDay), revs = (x) => 4320000 * x / Number(YUGA_DAYS);
    const caitraOf = (m) => { let mm = m; for (let g = 0; g < 14 && !(mm.name === "Caitra" && !mm.adhika); g++) mm = P.lunarMonth(mm.start - 1); return mm; };
    const fits = (N) => {
      const t = N + 1e-4, m = P.lunarMonth(t);
      if (m.name !== P.MONTH[mIdx] || !!m.adhika !== adhika || P.limbsAt(t).tithi !== tithi) return false;
      return Math.round(revs(caitraOf(m).start)) === Number(date.kaliYearsGone);
    };
    const order = [0, 1, -1, 2, -2, 29, 30, -29, -30, 31, -31, 28, -28, 32, -32];
    let found = order.map((k) => N0 + k).filter(fits);
    if (!found.length) for (let k = -40; k <= 40; k++) if (!order.includes(k) && fits(N0 + k)) found.push(N0 + k);
    found = [...new Set(found)].sort((x, y) => x - y);
    const kaliDay = found.length ? found[0] : null;
    return { kaliDay, textCount: N0, offset: kaliDay === null ? null : kaliDay - N0, candidates: found };
  }

  /** 1.51-1.52: the lords from a day-count since creation (BigInt or number). */
  function lords(daysSinceCreation) {
    const d = big(daysSinceCreation);
    const day = Number(mod(d, 7n));                                                    // 0 = Sunday
    const nMonth = d / 30n, nYear = d / 360n;
    const month = Number(mod(2n * nMonth + 1n, 7n)), year = Number(mod(3n * nYear + 1n, 7n));   // remainder 1 = Sunday
    return { day: WEEKDAY[day], month: WEEKDAY[mod(month - 1, 7)], year: WEEKDAY[mod(year - 1, 7)], dayIndex: day,
      monthsGone: nMonth, yearsGone: nYear, source: "SS 1.51-1.52" };
  }
  /** The lords for a day counted from the Kali epoch (kala-dvara's day numbers). */
  const lordsOfKaliDay = (N) => lords(big(N) + DAYS_TO_KALI);

  /** 12.78-79 sequences, each as the next lord's step from the current one. */
  const orbitIndex = (name) => ORBIT_DOWN.indexOf(name);
  const nextDayLord = (name) => ORBIT_DOWN[mod(orbitIndex(name) + 3, 7)];     // "every fourth" counting the current one
  const nextYearLord = (name) => ORBIT_DOWN[mod(orbitIndex(name) + 2, 7)];    // "every third"
  const nextMonthLord = (name) => ORBIT_DOWN[mod(orbitIndex(name) - 1, 7)];   // upward from the Moon
  /** 12.79: the lord of horā h (0 = the first, at sunrise) of a day whose lord is `dayLord`: downward one a horā. */
  const horaLord = (dayLord, h) => ORBIT_DOWN[mod(orbitIndex(dayLord) + h, 7)];
  /** The horā running at t (days since the Kali epoch) on civil day N, given that day's sunrise and the next: equal horās
   *  of the ahorātra (24 from sunrise) [reading — the text does not say equal or unequal], or "unequal": twelve of the
   *  day and twelve of the night (needs opts.sunset) [unverified]. */
  function horaAt(t, N, sunrise, nextSunrise, opts = {}) {
    const dl = lordsOfKaliDay(N).day;
    let h;
    if (opts.unequal) {
      const set = opts.sunset; if (typeof set !== "number") throw new TypeError("ss-ahargana: unequal horās need the sunset");
      h = t < set ? Math.floor((t - sunrise) / ((set - sunrise) / 12)) : 12 + Math.floor((t - set) / ((nextSunrise - set) / 12));
    } else h = Math.floor((t - sunrise) / ((nextSunrise - sunrise) / 24));
    return { hora: h + 1, lord: horaLord(dl, h), dayLord: dl, rule: opts.unequal ? "unequal [unverified]" : "equal, 24 from sunrise [reading]" };
  }

  // ── the lunisolar year by the true calendar ─────────────────────────────────────────────────────────────
  const KALI_SHAKA = 3179, KALI_VIKRAMA = 3044;                 // Kali years gone − 3179 = Śaka, − 3044 = Vikrama [standard]
  const YEAR_START_RULE = "nija Caitra new moon (the amānta month holding the Meṣa saṅkrānti); an adhika Caitra closes the previous year [unverified convention: no local text says which Caitra opens the year]";
  const YUGA_N = Number(YUGA_DAYS), SUN_N = 4320000;
  const needCalendar = (P) => {
    for (const f of ["sankrantisBetween", "syzygyNear", "nameMonth", "limbsAt"]) if (!P || typeof P[f] !== "function") throw new TypeError("ss-ahargana: the year needs the calendar (panchanga.js)");
  };
  /** The Meṣa saṅkrānti nearest the mean one of Kali year k (k mean years after the epoch, 14.10) and the new moon before
   *  it: the start of the month that holds it, Caitra. */
  function caitraStart(k, P) {
    const guess = k * YUGA_N / SUN_N;
    const sk = P.sankrantisBetween(guess - 20, guess + 20).find((x) => x.index === 0);
    if (!sk) throw new Error(`ss-ahargana: no Meṣa saṅkrānti near Kali year ${k}`);
    const start = P.syzygyNear(sk.at, 0, -1);
    if (start === null) throw new Error(`ss-ahargana: no new moon before the Meṣa saṅkrānti of Kali year ${k}`);
    return { mesha: sk.at, start };
  }
  /** The lunisolar year whose nija Caitra begins k Kali years gone (k = Kali years gone at the year's start), by the true
   *  calendar P (panchanga.js, passed in, as exactDay takes it): { k, shakaGone, vikramaGone, start, end, mesha,
   *  yearStartRule, months, sankrantis }. Months are amānta, new moon to new moon, each named by P.nameMonth from the
   *  saṅkrāntis inside it (adhika, kṣaya); a 13th month is an adhika one, and a year may end with an adhika Caitra.
   *  months[i]: { name, adhika, kshaya, kshayaDropped, start, end, fullMoon, fullMoonNakshatra, nameByFullMoonNakshatra
   *  (SS 14.15-14.16, beside the name), marginMinutes (the nearest saṅkrānti to either end of the month: how near the
   *  naming is to changing) }. sankrantis: the twelve of the year, Meṣa first. Times: days since the Kali epoch at
   *  Laṅkā midnight. Check: Math.round(4,320,000 × start ÷ 1,577,917,828) === k, the count exactDay uses. */
  function yearOfKali(k, P) {
    if (!Number.isInteger(k)) throw new TypeError("ss-ahargana: Kali years gone must be an integer");
    needCalendar(P);
    const a = caitraStart(k, P), b = caitraStart(k + 1, P);
    const start = a.start, end = b.start;
    if (Math.round(SUN_N * start / YUGA_N) !== k) throw new Error(`ss-ahargana: the year found does not count ${k} Kali years`);
    const moons = [start];
    for (let x = start; ;) {
      const n = P.syzygyNear(x + 0.01, 0, +1);
      if (n === null) throw new Error(`ss-ahargana: lost the new moon after ${x}`);
      if (n >= end - 1e-6) break;
      moons.push(n); x = n;
    }
    moons.push(end);
    const sank = P.sankrantisBetween(start - 32, end + 40);
    const months = [];
    for (let i = 0; i + 1 < moons.length; i++) {
      const m0 = moons[i], m1 = moons[i + 1];
      const inside = sank.filter((s) => s.at >= m0 && s.at < m1).map((s) => s.index);
      const next = sank.find((s) => s.at >= m1);
      const nm = P.nameMonth(inside, next ? next.index : undefined);
      const fullMoon = P.syzygyNear(m0 + 1, 180, +1), nak = P.limbsAt(fullMoon).nakshatra;
      let margin = Infinity;
      for (const s of sank) margin = Math.min(margin, Math.abs(s.at - m0), Math.abs(s.at - m1));
      months.push({ name: nm.name, adhika: nm.adhika, kshaya: nm.kshaya, kshayaDropped: nm.kshayaDropped, start: m0, end: m1, fullMoon,
        fullMoonNakshatra: P.NAKSHATRA ? P.NAKSHATRA[nak - 1] : nak, nameByFullMoonNakshatra: P.MONTH_OF_FULLMOON_NAKSHATRA ? P.MONTH_OF_FULLMOON_NAKSHATRA[nak] : null,
        marginMinutes: margin * 1440 });
    }
    return { k, shakaGone: k - KALI_SHAKA, vikramaGone: k - KALI_VIKRAMA, start, end, mesha: a.mesha, yearStartRule: YEAR_START_RULE, months,
      sankrantis: sank.filter((s) => s.at >= start && s.at < end).map((s) => ({ at: s.at, rashi: s.rashi, index: s.index })) };
  }
  /** The year of yearOfKali that holds the instant t (start ≤ t < end). */
  function lunarYear(t, P) {
    if (typeof t !== "number" || !Number.isFinite(t)) throw new TypeError("ss-ahargana: lunarYear needs a finite instant t");
    let k = Math.floor(SUN_N * t / YUGA_N);
    for (let i = 0; i < 4; i++) {
      const y = yearOfKali(k, P);
      if (t < y.start) k -= 1; else if (t >= y.end) k += 1; else return y;
    }
    throw new Error(`ss-ahargana: no year holds ${t}`);
  }

  return Object.freeze({ SOLAR_MONTHS, ADHIMASA, LUNAR_DAYS, KSHAYA, YUGA_DAYS, YEARS_TO_KALI, DAYS_TO_KALI, WEEKDAY, ORBIT_DOWN, KALI_SHAKA, KALI_VIKRAMA, YEAR_START_RULE,
    ahargana, aharganaFromKali, exactDay, byWeekday, lords, lordsOfKaliDay, nextDayLord, nextYearLord, nextMonthLord, horaLord, horaAt, yearOfKali, lunarYear });
});
