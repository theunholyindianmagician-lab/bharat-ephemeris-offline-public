/* panchanga.js — पञ्चाङ्ग of the sovereign engine: sunrise and sunset on the turn about the dhruva, the five limbs with
 * their end times, the lunar month named by the text's rule, saṅkrānti, and the rising sign.
 *
 * Text (editions/surya-siddhanta-full-edition.html):
 *   2.64  a nakṣatra is 800′, a tithi 720′;  2.65 yoga = (Sun + Moon) ÷ 800′;  2.66 tithi = (Moon − Sun) ÷ 720′;
 *   2.67-2.69 karaṇa = half a tithi: four fixed ones (Śakuni, Nāga, Catuṣpada, Kiṃstughna, in the verse's order) from the
 *         second half of the dark fourteenth, then seven movable ones from Bava, each eight times a month;
 *   2.58-2.63 declination and the day-half through cara;  3.10 declination, shadow and cara from the place corrected by the ayanāṃśa;
 *   14.10 the year is twelve solar months from Meṣa;  14.15-14.16 lunar months are named by the nakṣatra at the full moon:
 *         from Kārttika, two nakṣatras each starting at Kṛttikā, three for the fifth (Phālguna), the eleventh (Bhādrapada)
 *         and the twelfth (Āśvina);  14.18 the civil day is sunrise to sunrise.
 * End times are found by bisection on the true places (to a few milliseconds), where the text divides the remaining arc by
 * the daily motions (2.65-2.66) — the same quantity, without the linear approximation.
 * Sunrise is the instant the Sun's centre meets the horizon (the text has no refraction; pass `dip` in arc-minutes to
 * include one). Method "dhruva" finds it on the turn, using the true Sun's right ascension; method "surya-siddhanta"
 * uses the true longitude instead, which is what the text's bhujāntara (2.46) does and drops the part of the day's
 * inequality that comes from the obliquity.
 * Times are days since the Kali epoch, midnight at Laṅkā (the SS ahargaṇa); a site is { latitude, deshantara } in degrees,
 * deśāntara east of the Laṅkā–Ujjayinī meridian positive. Names other than the text's are marked in NAMES_SOURCE.
 * Lagna (default "madhava"): each point's own rising, 3.42 at the point and the cara of its declination (2.61-2.63),
 * with Mādhava's sine on R = 3438 — the sphere's ascendant to 0.05″ with the text's obliquity, and no trigonometry
 * (ss-madhava.test.js); { lagna: "text" } the same rule by the SS table (within 0.29°); { lagna: "text-linear" } 3.46-3.48
 * as worded, in proportion within a sign (within 1.1° at Ujjayinī); { lagna: "sphere" } (or any opts.epsilon) the
 * sphere's formula.
 * Browser: window.Panchanga (needs window.Sphuta, window.Dhruva, window.KalaDvara; window.SSUdaya for the text's lagna);
 * node: module.exports.
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory(require("./sphuta.js"), require("./dhruva.js"), require("./kala-dvara.js"), require("./ss-udaya.js"));
  else root.Panchanga = factory(root.Sphuta, root.Dhruva, root.KalaDvara, root.SSUdaya);
})(typeof globalThis !== "undefined" ? globalThis : this, function panchangaOf(S, D, K, U) {
  "use strict";
  function build(placesFn, model) {
  const D2R = Math.PI / 180, R2D = 180 / Math.PI;
  const mod = (a, m) => ((a % m) + m) % m;
  const wrap180 = (a) => mod(a + 180, 360) - 180;

  const NAKSHATRA = Object.freeze(["Aśvinī", "Bharaṇī", "Kṛttikā", "Rohiṇī", "Mṛgaśiras", "Ārdrā", "Punarvasu", "Puṣya", "Āśleṣā", "Maghā",
    "Pūrvaphalgunī", "Uttaraphalgunī", "Hasta", "Citrā", "Svātī", "Viśākhā", "Anurādhā", "Jyeṣṭhā", "Mūla", "Pūrvāṣāḍhā", "Uttarāṣāḍhā",
    "Śravaṇa", "Dhaniṣṭhā", "Śatabhiṣaj", "Pūrvabhādrapadā", "Uttarabhādrapadā", "Revatī"]);
  const TITHI = Object.freeze(["Pratipad", "Dvitīyā", "Tṛtīyā", "Caturthī", "Pañcamī", "Ṣaṣṭhī", "Saptamī", "Aṣṭamī", "Navamī", "Daśamī",
    "Ekādaśī", "Dvādaśī", "Trayodaśī", "Caturdaśī"]);
  const YOGA = Object.freeze(["Viṣkambha", "Prīti", "Āyuṣmān", "Saubhāgya", "Śobhana", "Atigaṇḍa", "Sukarman", "Dhṛti", "Śūla", "Gaṇḍa",
    "Vṛddhi", "Dhruva", "Vyāghāta", "Harṣaṇa", "Vajra", "Siddhi", "Vyatīpāta", "Varīyas", "Parigha", "Śiva", "Siddha", "Sādhya", "Śubha",
    "Śukla", "Brahman", "Aindra", "Vaidhṛti"]);
  const KARANA_MOVABLE = Object.freeze(["Bava", "Bālava", "Kaulava", "Taitila", "Gara", "Vaṇij", "Viṣṭi"]);
  const KARANA_FIXED = Object.freeze(["Śakuni", "Nāga", "Catuṣpada", "Kiṃstughna"]);        // SS 2.67, in the verse's order
  const RASHI = Object.freeze(["Meṣa", "Vṛṣa", "Mithuna", "Karka", "Siṃha", "Kanyā", "Tulā", "Vṛścika", "Dhanu", "Makara", "Kumbha", "Mīna"]);
  const MONTH = Object.freeze(["Caitra", "Vaiśākha", "Jyeṣṭha", "Āṣāḍha", "Śrāvaṇa", "Bhādrapada", "Āśvina", "Kārttika", "Mārgaśīrṣa",
    "Pauṣa", "Māgha", "Phālguna"]);
  // SS 14.16: full-moon nakṣatra (1 = Aśvinī) → month. Pairs from Kṛttikā for Kārttika; three for Phālguna, Bhādrapada, Āśvina.
  const MONTH_OF_FULLMOON_NAKSHATRA = Object.freeze({
    3: "Kārttika", 4: "Kārttika", 5: "Mārgaśīrṣa", 6: "Mārgaśīrṣa", 7: "Pauṣa", 8: "Pauṣa", 9: "Māgha", 10: "Māgha",
    11: "Phālguna", 12: "Phālguna", 13: "Phālguna", 14: "Caitra", 15: "Caitra", 16: "Vaiśākha", 17: "Vaiśākha", 18: "Jyeṣṭha", 19: "Jyeṣṭha",
    20: "Āṣāḍha", 21: "Āṣāḍha", 22: "Śrāvaṇa", 23: "Śrāvaṇa", 24: "Bhādrapada", 25: "Bhādrapada", 26: "Bhādrapada", 27: "Āśvina", 1: "Āśvina", 2: "Āśvina",
  });
  const NAMES_SOURCE = Object.freeze({
    text: "nakṣatra spans (2.64), tithi spans (2.66), karaṇa scheme and the four fixed karaṇa names and Bava (2.67-2.68), month naming (14.15-14.16), rāśi order from Meṣa (14.10), Vyatīpāta as the 17th yoga (11.20)",
    standard_unverified: "the other 26 yoga names, the six movable karaṇa names after Bava, and the tithi names are the standard lists; no local text states them",
    order_flag: "SS 2.67 lists the fixed karaṇas as Śakuni, Nāga, then 'third Catuṣpada', then Kiṃstughna; the later common order puts Catuṣpada before Nāga [unverified]",
  });

  /** One nāḍī = 1/60 of the star-wheel's turn, in civil days: savana / (60 x nakshatra days of the yuga), SS 1.11-1.12, 1.34-1.37. */
  const NADI_DAYS = (() => { const m = K.mana("surya"); return Number(m.savana) / (60 * Number(m.nakshatra)); })();

  // ── places ──────────────────────────────────────────────────────────────────────────────────────
  function placesAt(t) { return placesFn(t); }
  function ayanamshaAt(t, opts) { return opts && typeof opts.ayanamsha === "number" ? opts.ayanamsha : S.ayanamshaSS(S.spandasOfDays(t)); }
  const epsOf = (opts) => (opts && typeof opts.epsilon === "number" ? opts.epsilon : D.SS_EPSILON_DEG);

  /** Hour angle of the true Sun (degrees, 0 at the meridian, increasing westward) at the site. */
  function sunHourAngle(t, site, opts) {
    const p = placesAt(t);
    const A = ayanamshaAt(t, opts), e = epsOf(opts);
    const localFrac = mod(t + site.deshantara / 360, 1);
    const hMean = 360 * localFrac - 180;
    const alphaMean = p.mean.sun + A;
    const alphaTrue = opts && opts.sunriseMethod === "surya-siddhanta" ? p.sun + A : D.eclipticToEquatorial(p.sun + A, 0, e).alpha;
    const delta = D.eclipticToEquatorial(p.sun + A, 0, e).delta;
    return { H: hMean + wrap180(alphaMean - alphaTrue), delta };
  }
  /** Sunrise ("rise") or sunset ("set") of civil day N at the site, in days since the Kali epoch. null if the Sun does not cross. */
  function sunEvent(N, site, kind, opts) {
    checkSite(site);
    let t = N + (kind === "rise" ? 0.25 : 0.75) - site.deshantara / 360;
    const phi = site.latitude * D2R, dip = ((site.dip || 0) / 60) * D2R;
    for (let i = 0; i < 8; i++) {
      const { H, delta } = sunHourAngle(t, site, opts);
      const d = delta * D2R;
      const c = (Math.sin(-dip) - Math.sin(phi) * Math.sin(d)) / (Math.cos(phi) * Math.cos(d));
      if (c < -1 || c > 1) return null;
      const H0 = Math.acos(c) * R2D;
      const target = kind === "rise" ? -H0 : H0;
      const step = wrap180(target - H) / 360;
      t += step;
      if (Math.abs(step) < 1e-10) break;
    }
    return t;
  }
  const sunrise = (N, site, opts) => sunEvent(N, site, "rise", opts);
  const sunset = (N, site, opts) => sunEvent(N, site, "set", opts);

  // ── the five limbs ──────────────────────────────────────────────────────────────────────────────
  function limbsAt(t) {
    const p = placesAt(t);
    const elong = mod(p.moon - p.sun, 360);
    const tithi = Math.floor(elong / 12) + 1;                                   // 1..30
    const nak = Math.floor(p.moon / (800 / 60)) + 1;                            // 1..27
    const pada = Math.floor(mod(p.moon, 800 / 60) / (200 / 60)) + 1;            // 1..4
    const yoga = Math.floor(mod(p.sun + p.moon, 360) / (800 / 60)) + 1;        // 1..27
    const karana = Math.floor(elong / 6) + 1;                                   // 1..60
    return { tithi, nakshatra: nak, pada, yoga, karana, sun: p.sun, moon: p.moon, rahu: p.rahu, moonLatitude: p.moonLatitude, elongation: elong };
  }
  function tithiName(i) { const paksha = i <= 15 ? "śukla" : "kṛṣṇa"; const n = i <= 15 ? i : i - 15; return { paksha, number: n, name: n === 15 ? (paksha === "śukla" ? "Pūrṇimā" : "Amāvāsyā") : TITHI[n - 1] }; }
  function karanaName(k) {
    if (k === 1) return "Kiṃstughna";
    if (k >= 58) return KARANA_FIXED[k - 58];                                   // 58 Śakuni, 59 Nāga, 60 Catuṣpada (verse order)
    return KARANA_MOVABLE[(k - 2) % 7];
  }
  /** First instant after t0 at which limb `key` changes, by bracketing then bisection (to ~10 ms). */
  function nextChange(t0, key, maxDays = 3) {
    const v0 = limbsAt(t0)[key];
    let a = t0, b = t0, step = 1 / 24;
    for (;;) { b = a + step; if (limbsAt(b)[key] !== v0) break; a = b; if (b - t0 > maxDays) return null; }
    while (b - a > 1e-9) { const m = (a + b) / 2; if (m <= a || m >= b) break; if (limbsAt(m)[key] === v0) a = m; else b = m; }
    return b;
  }
  /** Previous instant before t0 at which limb `key` changed. */
  function prevChange(t0, key, maxDays = 3) {
    const v0 = limbsAt(t0)[key];
    let a = t0, b = t0, step = 1 / 24;
    for (;;) { a = b - step; if (limbsAt(a)[key] !== v0) break; b = a; if (t0 - a > maxDays) return null; }
    while (b - a > 1e-9) { const m = (a + b) / 2; if (m <= a || m >= b) break; if (limbsAt(m)[key] === v0) b = m; else a = m; }
    return b;
  }

  /** Instant (near t, within ±searchDays) when the elongation equals `target` degrees (0 new moon, 180 full moon). */
  function syzygyNear(t, target, direction) {
    const f = (x) => wrap180(limbsAt(x).elongation - target);
    let a = t, step = direction > 0 ? 0.5 : -0.5;
    let fa = f(a);
    for (let i = 0; i < 80; i++) {
      const b = a + step, fb = f(b);
      if (direction > 0 ? (fa < 0 && fb >= 0) : (fa >= 0 && fb < 0)) {
        let lo = Math.min(a, b), hi = Math.max(a, b);
        while (hi - lo > 1e-9) { const m = (lo + hi) / 2; if (m <= lo || m >= hi) break; if (f(m) < 0) lo = m; else hi = m; }
        return hi;
      }
      a = b; fa = fb;
    }
    return null;
  }
  /** The Sun's sign changes (saṅkrānti) between t1 and t2. */
  function sankrantisBetween(t1, t2) {
    const out = [];
    const sign = (t) => Math.floor(placesAt(t).sun / 30);
    let a = t1, s = sign(a);
    while (a < t2) {
      const b = Math.min(a + 1, t2), sb = sign(b);
      if (sb !== s) {
        let lo = a, hi = b;
        while (hi - lo > 1e-9) { const m = (lo + hi) / 2; if (m <= lo || m >= hi) break; if (sign(m) === s) lo = m; else hi = m; }
        out.push({ at: hi, rashi: RASHI[sb], index: sb });
        s = sb;
      }
      a = b;
    }
    return out;
  }
  /** The name of an amānta month from the saṅkrāntis inside it (rāśi indices, 0 = Meṣa … 11, in time order) and, when it
   *  holds none, the rāśi index of the next saṅkrānti after it: the month holding the Meṣa saṅkrānti is Caitra, and so
   *  on; none → adhika, named after the next month; two → kṣaya, the second name dropped [standard rule; no local text
   *  states it]. The one rule that lunarMonth and the year builder (ss-ahargana.js yearOfKali) both use. */
  function nameMonth(sankrantiIndices, nextSankrantiIndex) {
    const isIdx = (i) => Number.isInteger(i) && i >= 0 && i < 12;
    if (!Array.isArray(sankrantiIndices) || sankrantiIndices.length > 2 || !sankrantiIndices.every(isIdx)) throw new RangeError("panchanga: nameMonth takes the rāśi indices (0-11) of the month's saṅkrāntis, at most two");
    if (sankrantiIndices.length === 0) {
      if (!isIdx(nextSankrantiIndex)) throw new RangeError("panchanga: a month with no saṅkrānti is named from the next one; give its rāśi index (0-11)");
      return { name: MONTH[nextSankrantiIndex], adhika: true, kshaya: false, kshayaDropped: null };
    }
    const k = sankrantiIndices.length > 1;
    return { name: MONTH[sankrantiIndices[0]], adhika: false, kshaya: k, kshayaDropped: k ? MONTH[sankrantiIndices[1]] : null };
  }
  /** The amānta lunar month containing t: from the new moon before it to the next.
   *  Name: the month in which the Sun enters Meṣa is Caitra, and so on; a month with no saṅkrānti is adhika and takes the
   *  name of the month after it; a month with two is kṣaya and the second name is dropped [standard rule; no local text
   *  states it]. SS 14.15-14.16 is where the names come from (the Moon's nakṣatra at the full moon); it does not name a
   *  given month — in 2026 the full moon of 2 April falls in Hasta, which would make two Phālgunas in a row with no adhika
   *  between them. Its name is returned beside the month's, with `agree`. */
  function lunarMonth(t) {
    const start = syzygyNear(t, 0, -1), end = syzygyNear(t + 0.01, 0, +1);
    const full = syzygyNear(start + 1, 180, +1);
    const nakAtFull = limbsAt(full).nakshatra;
    const sank = sankrantisBetween(start, end);
    const { name, adhika, kshaya, kshayaDropped } = nameMonth(sank.map((x) => x.index), sank.length === 0 ? sankrantisBetween(end, end + 33)[0].index : undefined);
    const byNakshatra = MONTH_OF_FULLMOON_NAKSHATRA[nakAtFull];
    return { name, adhika, kshaya, kshayaDropped,
      rule: "saṅkrānti in the month: Meṣa → Caitra … ; none → adhika, named after the next [standard; no local text]",
      start, end, fullMoon: full, fullMoonNakshatra: NAKSHATRA[nakAtFull - 1],
      nameByFullMoonNakshatra: byNakshatra, nakshatraRule: "SS 14.15-14.16 (origin of the names)", agree: byNakshatra === name,
      sankrantis: sank };
  }

  const LAGNAS = Object.freeze(["madhava", "text", "text-linear", "sphere"]);
  let UMcache = null, UTcache = null;
  const UM = () => UMcache || (UMcache = U.withSine("madhava"));
  const UT = () => UTcache || (UTcache = U.withSine("table"));          // "text" and "text-linear": the text as written, its table
  /** The places, the ayanāṃśa and the sāyana right ascension of the meridian (degrees) at t, on the turn: the mean Sun's
   *  right ascension carried by the local hour (12 h at local midnight). */
  function meridianParts(t, site, opts) {
    const p = placesAt(t), A = ayanamshaAt(t, opts);
    const localFrac = mod(t + site.deshantara / 360, 1);
    return { p, A, ramcDeg: mod(p.mean.sun + A + 360 * localFrac - 180, 360) };
  }
  /** { A: the ayanāṃśa (degrees), ramcDeg: the sāyana right ascension of the meridian on the turn } — one meridian for
   *  lagnaAt and meridianAt. */
  function ramcOf(t, site, opts) { checkSite(site); const q = meridianParts(t, site, opts); return { A: q.A, ramcDeg: q.ramcDeg }; }
  function lagnaHow(opts) {
    const how = (opts && opts.lagna) || (opts && typeof opts.epsilon === "number" ? "sphere" : (U ? "madhava" : "sphere"));
    if (!LAGNAS.includes(how)) throw new RangeError("panchanga: lagna is one of " + LAGNAS.join(", "));
    return how;
  }
  /** Sidereal rising sign (lagna) at t: the ecliptic point on the eastern horizon, found on the turn about the dhruva —
   *  by SS 3.42 at the point with 2.61-2.63 (Mādhava's sine by default, the table with "text"), by 3.42-3.48 as worded
   *  ("text-linear"), or by the sphere ("sphere", or any opts.epsilon); site.palabha if the owner measured it, else from
   *  the latitude by the same sine. */
  function lagnaAt(t, site, opts) {
    checkSite(site);
    const { p, A, ramcDeg } = meridianParts(t, site, opts);
    const e = epsOf(opts) * D2R, phi = site.latitude * D2R, ramc = ramcDeg * D2R;   // ramc: right ascension of the meridian
    let asc;
    const how = lagnaHow(opts);
    if (how !== "sphere") {
      if (!U) throw new Error("panchanga: the text's lagna needs ss-udaya.js");
      const UU = how === "madhava" ? UM() : UT();
      const pb = typeof site.palabha === "number" ? site.palabha : UU.palabhaOf(site.latitude);
      asc = how === "text-linear" ? UU.lagnaFromMeridian(mod(p.sun + A, 360), ramcDeg * 60, pb, opts) : UU.lagnaOwn(ramcDeg * 60, pb);
    } else asc = Math.atan2(Math.cos(ramc), -(Math.sin(ramc) * Math.cos(e) + Math.tan(phi) * Math.sin(e))) * R2D;
    const sid = mod(asc - A, 360);
    const method = { madhava: "SS 3.42 at the point with 2.61-2.63, Mādhava's sine", text: "SS 3.42 at the point with 2.61-2.63", "text-linear": "SS 3.42-3.48", sphere: "sphere" }[how];
    return { longitude: sid, rashi: RASHI[Math.floor(sid / 30)], index: Math.floor(sid / 30), method };
  }
  /** The madhya-lagna at t: the ecliptic point on the meridian (SS 3.49), by 3.42 at the point — the sidereal λ whose
   *  right ascension is the meridian's (ramcOf). Mādhava's sine by default; the text's table with { lagna: "text" } or
   *  "text-linear". { lagna: "sphere" } (or any opts.epsilon) also takes Mādhava's sine: the point on the meridian needs
   *  no horizon, and this module adds no library trigonometry for it — the method says so. */
  function meridianAt(t, site, opts) {
    checkSite(site);
    if (!U) throw new Error("panchanga: the madhya-lagna needs ss-udaya.js");
    const how = lagnaHow(opts);
    const { A, ramcDeg } = meridianParts(t, site, opts);
    const UU = how === "text" || how === "text-linear" ? UT() : UM();
    const lon = mod(UU.madhyaLagnaOwn(ramcDeg * 60) - A, 360);
    const method = { madhava: "SS 3.49 by 3.42 at the point, Mādhava's sine", text: "SS 3.49 by 3.42 at the point, the SS table",
      "text-linear": "SS 3.49 by 3.42 at the point, the SS table", sphere: "SS 3.49 by 3.42 at the point, Mādhava's sine (sphere asked; no library trigonometry here)" }[how];
    return { ramcDeg, madhyaLagna: { longitude: lon, rashi: RASHI[Math.floor(lon / 30)], index: Math.floor(lon / 30) }, method };
  }

  /** The civil day holding the instant t at the site (SS 14.18, 1.36: sunrise to sunrise): { N, sunrise, sunset,
   *  nextSunrise, vara, polar, rule } with sunrise(N) ≤ t < sunrise(N + 1); the vāra is Kali day N's (1.51), so it
   *  changes at sunrise, not at midnight. Where the Sun does not rise or set (polar), N is the local civil date
   *  floor(t + deśāntara/360), the three times are null and polar is true. */
  function civilDayOf(t, site, opts) {
    checkSite(site);
    if (typeof t !== "number" || !Number.isFinite(t)) throw new TypeError("panchanga: civilDayOf needs a finite instant t (days since the Kali epoch)");
    const N0 = Math.floor(t + site.deshantara / 360), r = sunrise(N0, site, opts);
    const N = r !== null && t < r ? N0 - 1 : N0;
    const rise = sunrise(N, site, opts), set = sunset(N, site, opts), next = sunrise(N + 1, site, opts);
    const rule = "SS 14.18, 1.36: the civil day runs from sunrise to sunrise; vāra by 1.51";
    if (rise === null || set === null || next === null) return { N: N0, sunrise: null, sunset: null, nextSunrise: null, vara: K.varaOfKaliDay(N0), polar: true, rule: rule + "; polar: the local civil date" };
    return { N, sunrise: rise, sunset: set, nextSunrise: next, vara: K.varaOfKaliDay(N), polar: false, rule };
  }

  /** The full pañcāṅga of civil day N (sunrise to the next sunrise) at the site. */
  function panchanga(N, site, opts) {
    const rise = sunrise(N, site, opts), set = sunset(N, site, opts), nextRise = sunrise(N + 1, site, opts);
    if (rise === null || set === null || nextRise === null) return { N, polar: true };
    const at = limbsAt(rise);
    // Ghaṭī after sunrise in nāḍīs of the star-wheel's turn (SS 1.11-1.12: sixty nāḍīs make the nākṣatra ahorātra); the
    // count in sixtieths of the civil day, which printed pañcāṅgas commonly use, is given beside it. The three places are
    // { ghati, vinadi, vipala }: the vināḍī is 1/60 ghaṭī (= the pala of BPHS 5.8) and the vipala 1/60 of it (owner
    // decision P1, 2026-10-08, corpus/sources/time-units.json: 'pala' = 1/60 ghaṭī; vipala = 1/60 pala [standard; no local
    // text]). Until P1 this third place was named 'pala'; its value is unchanged.
    const sexa = (g) => { const gh = Math.floor(g); const vi = (g - gh) * 60; const vp = Math.round((vi - Math.floor(vi)) * 60);
      return vp === 60 ? { ghati: gh, vinadi: Math.floor(vi) + 1, vipala: 0 } : { ghati: gh, vinadi: Math.floor(vi), vipala: vp }; };
    const ghatiAfterRise = (x) => ({ ...sexa((x - rise) / NADI_DAYS), unit: "nāḍī of the turn (SS 1.11-1.12)", civil: sexa((x - rise) * 60) });
    const limb = (key, nameOf) => {
      const out = []; let x = rise;
      for (let i = 0; i < 4; i++) {
        const idx = limbsAt(x)[key]; const end = nextChange(x, key);
        out.push({ index: idx, ...nameOf(idx), end, endAfterSunrise: end === null ? null : ghatiAfterRise(end) });
        if (end === null || end >= nextRise) break;
        x = end + 1e-6;
      }
      return out;
    };
    const civil = K.civilFromKaliDay(N, "gregorian"), julian = K.civilFromKaliDay(N, "julian");
    return {
      N, gregorian: civil, julian, vara: K.varaOfKaliDay(N).name,
      sunrise: rise, sunset: set, nextSunrise: nextRise, dayGhati: (set - rise) / NADI_DAYS, nightGhati: (nextRise - set) / NADI_DAYS,
      dayGhatiCivil: (set - rise) * 60, nightGhatiCivil: (nextRise - set) * 60, ghatiUnit: "nāḍī of the turn (SS 1.11-1.12)",
      tithi: limb("tithi", (i) => tithiName(i)),
      nakshatra: limb("nakshatra", (i) => ({ name: NAKSHATRA[i - 1] })),
      yoga: limb("yoga", (i) => ({ name: YOGA[i - 1] })),
      karana: limb("karana", (i) => ({ name: karanaName(i) })),
      sunRashi: RASHI[Math.floor(at.sun / 30)], moonRashi: RASHI[Math.floor(at.moon / 30)], pada: at.pada,
      month: lunarMonth(rise), ayanamsha: ayanamshaAt(rise, opts), sun: at.sun, moon: at.moon,
    };
  }

  function checkSite(site) {
    if (!site || typeof site.latitude !== "number" || typeof site.deshantara !== "number") throw new TypeError("panchanga: site needs { latitude, deshantara } in degrees");
    if (!Number.isFinite(site.latitude) || !Number.isFinite(site.deshantara)) throw new TypeError("panchanga: the site's latitude and deśāntara must be finite numbers");
    if (site.latitude < -90 || site.latitude > 90) throw new RangeError(`panchanga: latitude ${site.latitude}° is not in [−90°, 90°]`);
    if (site.deshantara <= -360 || site.deshantara >= 360) throw new RangeError(`panchanga: deśāntara ${site.deshantara}° is not within one turn (−360°, 360°) of the Laṅkā–Ujjayinī meridian`);   // longitude − 75.79°: San Francisco is −198°
  }

  return Object.freeze({ ayanamshaAt, moonModel: model, withPlaces: (fn, name) => build(fn, name || "custom"),
    sine: S.sine || "table", withSine: (name) => panchangaOf(S.withSine(name), D, K, U && U.withSine(name)), NADI_DAYS, NAKSHATRA, TITHI, YOGA, KARANA_MOVABLE, KARANA_FIXED, RASHI, MONTH, MONTH_OF_FULLMOON_NAKSHATRA, NAMES_SOURCE,
    placesAt, sunHourAngle, sunEvent, sunrise, sunset, limbsAt, tithiName, karanaName, nextChange, prevChange, syzygyNear, sankrantisBetween, nameMonth, lunarMonth,
    ramcOf, lagnaAt, meridianAt, civilDayOf, panchanga });
  }
  return build(S.sphutaAtDays, "sūrya-siddhānta");
});
