/* utsava.js — उत्सव: saṅkrānti, ayana and the festival days.
 *
 * Sourced in the Sūrya-Siddhānta (local edition, checked against the verse words):
 *   14.3        the solar measure gives the ṣaḍaśītimukhas, the ayanas, the viṣuvas and the saṅkrānti's puṇya time.
 *   14.4-14.6   from Tulā 0°, every 86 solar days (degrees of the Sun) is a ṣaḍaśītimukha: Dhanu 26°, Mīna 22°, Mithuna 18°,
 *               Kanyā 14°; 4 × 86 = 344, and the 16 left of the circle are Kanyā 14°-30°, the pitṛ days (14.6).
 *   14.7, 14.9  the two viṣuvas (Meṣa, Tulā) and the two ayanas: uttarāyaṇa from the Makara saṅkrānti, dakṣiṇāyana from Karka.
 *   14.8        the saṅkrānti right after each of those four is a viṣṇupadī [reading of "nairantaryāt": Vṛṣa, Siṃha, Vṛścika, Kumbha].
 *   14.11       puṇya time: the Sun's disc in minutes × 60 ÷ its daily motion = nāḍīs; half before the saṅkrānti, half after.
 *   4.1-4.3     the disc: 6500 yojanas × true/mean motion, carried to the Moon's orbit by the ratio of revolutions, ÷ 15 → minutes.
 *               The true motion cancels between 4.2 and 14.11: every saṅkrānti's puṇya time is the same, half of it
 *               6500 × civil days ÷ (Moon revolutions × 10800) = (65/108) × the Moon's sidereal month in days = 16.444 nāḍī.
 * The ayana by the saṅkrānti (14.9 as worded) and the ayana in the sky (the Sun's declination turning, sāyana 270°/90° with the
 * SS ayanāṃśa of 3.9-3.12) are both given; they now differ by the ayanāṃśa, about 23 days.
 *
 * NOT in any local text — every festival rule below, the five-fold day (prātaḥ, saṅgava, madhyāhna, aparāhṇa, sāyāhna),
 * pradoṣa, niśītha, aruṇodaya, the choice between two days, and the month naming by saṅkrānti. They are common practice
 * as printed pañcāṅgas apply it; each carries status "unverified" until the governing nibandha is in the repository.
 * Candra-darśana (SS 10.1-10.4, with 9.5 and 7.8-7.10): the first evening after amāvāsyā on which Sun and Moon set at least
 * 12 kālāṃśa apart — the text's rule — with the Moon's setting after sunset; ss-udaya.js does the arithmetic.
 * Browser: window.Utsava (needs Panchanga, Sphuta, Dhruva, KalaDvara, SSUdaya); node: module.exports.
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory(require("./panchanga.js"), require("./sphuta.js"), require("./dhruva.js"), require("./kala-dvara.js"), require("./ss-udaya.js"));
  else root.Utsava = factory(root.Panchanga, root.Sphuta, root.Dhruva, root.KalaDvara, root.SSUdaya);
})(typeof globalThis !== "undefined" ? globalThis : this, function utsavaOf(P, S, D, K, U) {
  "use strict";
  function build(P) {
  const mod = (a, m) => ((a % m) + m) % m;
  const wrap180 = (a) => mod(a + 180, 360) - 180;
  const D2R = Math.PI / 180, R2D = 180 / Math.PI;
  const UNVERIFIED = "unverified: common practice; the governing text is not in the repository";
  const M_ = K.mana("surya");
  const SUN_REV = Number(M_.sun), MOON_REV = Number(M_.moon), CIVIL = Number(M_.savana);
  const MEAN_SUN = 21600 * SUN_REV / CIVIL;                    // minutes of arc per civil day (59′ 8.2″)
  const MEAN_MOON = 21600 * MOON_REV / CIVIL;
  const DISC = Object.freeze({ sunYojana: 6500, moonYojana: 480, divisor: 15, source: "SS 4.1-4.3" });

  // ── SS 4.1-4.3 and 14.11 ─────────────────────────────────────────────────────────────────────────
  const bhukti = (t, body) => mod(P.placesAt(t + 0.5)[body] - P.placesAt(t - 0.5)[body], 360) * 60;   // minutes per day
  /** The Sun's disc in minutes of arc: 6500 × true/mean motion × Sun revolutions ÷ Moon revolutions ÷ 15 (SS 4.1-4.3). */
  function sunDisc(t) { return DISC.sunYojana * (bhukti(t, "sun") / MEAN_SUN) * (SUN_REV / MOON_REV) / DISC.divisor; }
  /** The Moon's disc in minutes of arc: 480 × true/mean motion ÷ 15 (SS 4.1-4.3). */
  function moonDisc(t) { return DISC.moonYojana * (bhukti(t, "moon") / MEAN_MOON) / DISC.divisor; }
  /** SS 14.11: the puṇya time of a saṅkrānti at t — the disc's crossing of the boundary, half before and half after. */
  function punyakala(t) {
    const disc = sunDisc(t), b = bhukti(t, "sun");
    const nadis = disc * 60 / b, half = nadis / 2 / 60;          // nāḍīs of the day the motion is counted in; half in days
    return { from: t - half, to: t + half, nadis, halfNadis: nadis / 2, discArcmin: disc, bhuktiArcmin: b, source: "SS 14.11 with 4.1-4.3" };
  }

  // ── saṅkrānti, ṣaḍaśītimukha, ayana ────────────────────────────────────────────────────────────────
  const CLASS = Object.freeze({
    0: { kind: "viṣuva", source: "SS 14.7" }, 6: { kind: "viṣuva", source: "SS 14.7" },
    9: { kind: "ayana (uttarāyaṇa begins)", source: "SS 14.9" }, 3: { kind: "ayana (dakṣiṇāyana begins)", source: "SS 14.9" },
    1: { kind: "viṣṇupadī", source: "SS 14.8 [reading]" }, 4: { kind: "viṣṇupadī", source: "SS 14.8 [reading]" },
    7: { kind: "viṣṇupadī", source: "SS 14.8 [reading]" }, 10: { kind: "viṣṇupadī", source: "SS 14.8 [reading]" },
  });
  /** Every saṅkrānti in [t1, t2) with its class and its puṇya time. */
  function sankrantis(t1, t2) {
    return P.sankrantisBetween(t1, t2).map((s) => ({ ...s, ...(CLASS[s.index] || { kind: "saṅkrānti", source: "SS 14.8" }), punya: punyakala(s.at) }));
  }
  /** Instant in [t1, t2) when the Sun's sidereal longitude reaches L (degrees); all of them. */
  function sunReaches(L, t1, t2) {
    const out = []; const f = (t) => wrap180(P.placesAt(t).sun - L);
    let a = t1, fa = f(a);
    for (let b = t1 + 1; a < t2; b += 1) {
      const fb = f(b);
      if (fa < 0 && fb >= 0 && fb - fa < 90) { let lo = a, hi = b; while (hi - lo > 1e-9) { const m = (lo + hi) / 2; if (m <= lo || m >= hi) break; if (f(m) < 0) lo = m; else hi = m; } if (hi < t2) out.push(hi); }
      a = b; fa = fb;
    }
    return out;
  }
  /** SS 14.4-14.5: the four ṣaḍaśītimukhas, Tulā 0° + k × 86°, k = 1…4. */
  const SHADASHITI = Object.freeze([1, 2, 3, 4].map((k) => { const L = mod(180 + 86 * k, 360); return { k, longitude: L, rashi: P.RASHI[Math.floor(L / 30)], degree: L % 30 }; }));
  function shadashitimukhas(t1, t2) {
    const out = [];
    for (const s of SHADASHITI) for (const at of sunReaches(s.longitude, t1, t2)) out.push({ ...s, at, source: "SS 14.4-14.5" });
    return out.sort((a, b) => a.at - b.at);
  }
  /** SS 14.6: the pitṛ days, the Sun from Kanyā 14° to Tulā 0°. */
  function pitrDays(t1, t2) {
    const out = [];
    for (const from of sunReaches(164, t1 - 20, t2)) { const to = sunReaches(180, from, from + 20)[0]; if (to > t1) out.push({ from, to, source: "SS 14.6" }); }
    return out;
  }
  /** The ayanas and viṣuvas in the sky: the Sun's sāyana longitude at 270°, 90°, 0°, 180° (SS 3.9-3.12 ayanāṃśa). */
  function cardinalInSky(t1, t2, opts = {}) {
    const A = (t) => (typeof opts.ayanamsha === "number" ? opts.ayanamsha : S.ayanamshaSS(S.spandasOfDays(t)));
    const out = [];
    for (const [L, kind] of [[270, "uttarāyaṇa begins (the Sun turns north; north of the tropic the noon shadow is at its longest)"], [90, "dakṣiṇāyana begins (the Sun turns south; north of the tropic the noon shadow is at its shortest)"], [0, "vasanta viṣuva"], [180, "śarad viṣuva"]]) {
      const f = (t) => wrap180(P.placesAt(t).sun + A(t) - L);
      let a = t1, fa = f(a);
      for (let b = t1 + 1; a < t2; b += 1) { const fb = f(b); if (fa < 0 && fb >= 0 && fb - fa < 90) { let lo = a, hi = b; while (hi - lo > 1e-9) { const m = (lo + hi) / 2; if (m <= lo || m >= hi) break; if (f(m) < 0) lo = m; else hi = m; } if (hi < t2) out.push({ at: hi, sayana: L, kind, source: "SS 3.9-3.12 (ayanāṃśa), dhruva frame" }); } a = b; fa = fb; }
    }
    return out.sort((a, b) => a.at - b.at);
  }

  // ── the day's kāla windows [unverified] ─────────────────────────────────────────────────────────
  function kalaWindows(N, site, opts, want = {}) {
    const rise = P.sunrise(N, site, opts), set = P.sunset(N, site, opts), next = P.sunrise(N + 1, site, opts);
    if (rise === null || set === null || next === null) return null;
    const day = set - rise, night = next - set, f = day / 5;
    return {
      rise, set, next,
      sunrise: [rise, rise], pratah: [rise, rise + f], sangava: [rise + f, rise + 2 * f], madhyahna: [rise + 2 * f, rise + 3 * f],
      aparahna: [rise + 3 * f, rise + 4 * f], sayahna: [rise + 4 * f, set], purvahna: [rise, rise + day / 2],
      pradosha: [set, set + night / 5], nishitha: [set + night * 7 / 15, set + night * 8 / 15],
      arunodaya: [rise - 4 * P.NADI_DAYS, rise],
      candrodaya: want.moon ? (() => { const m = moonrise(N, site, opts); return m === null ? null : [m, m]; })() : undefined,
      status: UNVERIFIED,
    };
  }
  /** Rising ("rise") or setting ("set") of the Moon's centre between sunrise of day N and the next sunrise (null if it
   *  does not happen in that civil day): geometric, no parallax (SS ch.5 lambana not applied), no refraction. The first
   *  crossing of the horizon upward (rise) or downward (set) in the day. */
  function moonEvent(N, site, kind, opts = {}) {
    if (kind !== "rise" && kind !== "set") throw new RangeError('utsava: the Moon\'s event is "rise" or "set"');
    const up = kind === "rise";
    const rise = P.sunrise(N, site, opts); if (rise === null) return null;
    const next = P.sunrise(N + 1, site, opts), until = next === null ? rise + 1.1 : next;
    const phi = site.latitude * D2R, eps = typeof opts.epsilon === "number" ? opts.epsilon : D.SS_EPSILON_DEG;
    const alt = (t) => {
      const p = P.placesAt(t), A = typeof opts.ayanamsha === "number" ? opts.ayanamsha : S.ayanamshaSS(S.spandasOfDays(t));
      const q = D.eclipticToEquatorial(p.moon + A, p.moonLatitude, eps);
      const H = (360 * mod(t + site.deshantara / 360, 1) - 180 + p.mean.sun + A - q.alpha) * D2R, d = q.delta * D2R;
      return Math.sin(phi) * Math.sin(d) + Math.cos(phi) * Math.cos(d) * Math.cos(H);
    };
    let a = rise, fa = alt(a);
    for (let b = rise + 1 / 96; a < until; b += 1 / 96) {
      const fb = alt(b);
      if (up ? fa < 0 && fb >= 0 : fa >= 0 && fb < 0) {
        let lo = a, hi = b;
        while (hi - lo > 1e-9) { const m = (lo + hi) / 2; if (m <= lo || m >= hi) break; if (up ? alt(m) < 0 : alt(m) >= 0) lo = m; else hi = m; }
        return hi < until ? hi : null;
      }
      a = b; fa = fb;
    }
    return null;
  }
  /** Moonrise in civil day N (sunrise to the next sunrise), or null. */
  const moonrise = (N, site, opts = {}) => moonEvent(N, site, "rise", opts);
  /** Moonset in civil day N (sunrise to the next sunrise), or null. */
  const moonset = (N, site, opts = {}) => moonEvent(N, site, "set", opts);

  /** SS 10.1-10.4: candra-darśana after each amāvāsyā in [t1, t2) — the first evening the Moon is seen (≥ 12 kālāṃśa
   *  between the settings of Sun and Moon, the Moon's place carried by 7.8-7.10 to the ecliptic point setting with it),
   *  its moonset after sunset by 10.3-10.4, and the kālāṃśa of each evening tried. Positions are the pañcāṅga's own
   *  (sidereal) made tropical with its ayanāṃśa (3.10); the evening is the pañcāṅga's sunset. */
  function candraDarshana(t1, t2, site, opts = {}) {
    if (!U) throw new Error("utsava: candra-darśana needs ss-udaya.js");
    const pb = typeof site.palabha === "number" ? site.palabha : U.palabhaOf(site.latitude), out = [];
    let conj = P.syzygyNear(t1, 0, +1);
    while (conj !== null && conj < t2) {
      const evenings = [];
      for (let N = Math.floor(conj + site.deshantara / 360) - 1; N <= Math.floor(conj) + 5 && evenings.length < 4; N++) {
        const set = P.sunset(N, site, opts); if (set === null || set <= conj) continue;
        const p = P.placesAt(set), A = P.ayanamshaAt(set, opts);
        const r = U.moonAfterSunset({ sun: mod(p.sun + A, 360), moon: mod(p.moon + A, 360), moonLatArcmin: p.moonLatitude * 60,
          sunBhukti: bhukti(set, "sun"), moonBhukti: bhukti(set, "moon"), palabha: pb }, opts);
        evenings.push({ N, sunset: set, hoursAfterConjunction: (set - conj) * 24, kalamsa: r.kalamsa, visible: r.visible,
          moonset: set + r.moonsetAfterSunsetAsus / U.GHATI * P.NADI_DAYS, moonsetAfterSunsetGhati: r.moonsetAfterSunsetGhati });
        if (r.visible) break;
      }
      const first = evenings.find((e) => e.visible) || null;
      out.push({ amavasya: conj, first, N: first && first.N, civil: first && K.civilFromKaliDay(first.N, "gregorian"), evenings,
        source: "SS 10.1-10.4 (12 kālāṃśa), 9.5, 7.8-7.10 at the horizon; positions and sunset: the pañcāṅga's" });
      conj = P.syzygyNear(conj + 25, 0, +1);
    }
    return out;
  }

  // ── festival rules [unverified] ─────────────────────────────────────────────────────────────────
  // month: amānta month name; tithi: 1-15 in the pakṣa; kala: which window must hold the tithi; prefer: when two days
  // qualify ("first", "second" or "more" = the larger share of the window); avoid: karaṇas whose time is cut out.
  const S_ = "śukla", K_ = "kṛṣṇa";
  const RULES = Object.freeze([
    { id: "vasanta-pancami", name: "Vasanta Pañcamī", month: "Māgha", paksha: S_, tithi: 5, kala: "purvahna", prefer: "more" },
    { id: "mahashivaratri", name: "Mahāśivarātri", month: "Māgha", paksha: K_, tithi: 14, kala: "nishitha", prefer: "more", purnimanta: "Phālguna" },
    { id: "holika-dahana", name: "Holikā Dahana", month: "Phālguna", paksha: S_, tithi: 15, kala: "pradosha", prefer: "second", avoid: ["Viṣṭi"] },
    { id: "holi", name: "Holī (Vasantotsava)", after: "holika-dahana", days: 1 },
    { id: "ugadi", name: "Caitra Navarātri begins · Ugādi · Guḍī Pāḍavā", month: "Caitra", paksha: S_, tithi: 1, kala: "sunrise", prefer: "first" },
    { id: "rama-navami", name: "Rāma Navamī", month: "Caitra", paksha: S_, tithi: 9, kala: "madhyahna", prefer: "more" },
    { id: "hanuman-jayanti", name: "Hanumān Jayantī (Caitra pūrṇimā)", month: "Caitra", paksha: S_, tithi: 15, kala: "sunrise", prefer: "first" },
    { id: "akshaya-tritiya", name: "Akṣaya Tṛtīyā", month: "Vaiśākha", paksha: S_, tithi: 3, kala: "purvahna", prefer: "more" },
    { id: "ratha-yatra", name: "Ratha Yātrā", month: "Āṣāḍha", paksha: S_, tithi: 2, kala: "sunrise", prefer: "first" },
    { id: "devashayani-ekadashi", name: "Devaśayanī Ekādaśī", month: "Āṣāḍha", paksha: S_, tithi: 11, kala: "sunrise", prefer: "first", note: "simplified: the daśamī-viddha rules are not applied" },
    { id: "guru-purnima", name: "Guru Pūrṇimā", month: "Āṣāḍha", paksha: S_, tithi: 15, kala: "sunrise", prefer: "first" },
    { id: "naga-pancami", name: "Nāga Pañcamī", month: "Śrāvaṇa", paksha: S_, tithi: 5, kala: "purvahna", prefer: "more" },
    { id: "raksha-bandhana", name: "Rakṣā Bandhana", month: "Śrāvaṇa", paksha: S_, tithi: 15, kala: "aparahna", prefer: "more", avoid: ["Viṣṭi"] },
    { id: "janmashtami", name: "Kṛṣṇa Janmāṣṭamī", month: "Śrāvaṇa", paksha: K_, tithi: 8, kala: "nishitha", prefer: "more", purnimanta: "Bhādrapada" },
    { id: "ganesha-caturthi", name: "Gaṇeśa Caturthī", month: "Bhādrapada", paksha: S_, tithi: 4, kala: "madhyahna", prefer: "more" },
    { id: "ananta-caturdashi", name: "Ananta Caturdaśī", month: "Bhādrapada", paksha: S_, tithi: 14, kala: "sunrise", prefer: "first" },
    { id: "ghatasthapana", name: "Śāradīya Navarātri begins (Ghaṭasthāpana)", month: "Āśvina", paksha: S_, tithi: 1, kala: "sunrise", prefer: "first" },
    { id: "durga-ashtami", name: "Durgā Aṣṭamī", month: "Āśvina", paksha: S_, tithi: 8, kala: "sunrise", prefer: "first" },
    { id: "maha-navami", name: "Mahā Navamī", month: "Āśvina", paksha: S_, tithi: 9, kala: "sunrise", prefer: "first" },
    { id: "vijaya-dashami", name: "Vijayā Daśamī", month: "Āśvina", paksha: S_, tithi: 10, kala: "aparahna", prefer: "more" },
    { id: "sharad-purnima", name: "Śarad Pūrṇimā", month: "Āśvina", paksha: S_, tithi: 15, kala: "nishitha", prefer: "more" },
    { id: "karva-cauth", name: "Karvā Cauth", month: "Āśvina", paksha: K_, tithi: 4, kala: "candrodaya", prefer: "more", purnimanta: "Kārttika" },
    { id: "dhanteras", name: "Dhanatrayodaśī", month: "Āśvina", paksha: K_, tithi: 13, kala: "pradosha", prefer: "more", purnimanta: "Kārttika" },
    { id: "naraka-caturdashi", name: "Naraka Caturdaśī", month: "Āśvina", paksha: K_, tithi: 14, kala: "arunodaya", prefer: "more", purnimanta: "Kārttika" },
    { id: "dipavali", name: "Dīpāvalī (Lakṣmī Pūjā)", month: "Āśvina", paksha: K_, tithi: 15, kala: "pradosha", prefer: "more", purnimanta: "Kārttika" },
    { id: "govardhana", name: "Govardhana Pūjā · Annakūṭa", month: "Kārttika", paksha: S_, tithi: 1, kala: "sunrise", prefer: "first" },
    { id: "bhratri-dvitiya", name: "Bhrātṛ Dvitīyā", month: "Kārttika", paksha: S_, tithi: 2, kala: "aparahna", prefer: "more" },
    { id: "chhath", name: "Sūrya Ṣaṣṭhī (Chaṭh)", month: "Kārttika", paksha: S_, tithi: 6, kala: "sayahna", prefer: "more" },
    { id: "prabodhini-ekadashi", name: "Prabodhinī Ekādaśī", month: "Kārttika", paksha: S_, tithi: 11, kala: "sunrise", prefer: "first", note: "simplified: the daśamī-viddha rules are not applied" },
    { id: "kartika-purnima", name: "Kārttika Pūrṇimā", month: "Kārttika", paksha: S_, tithi: 15, kala: "sunrise", prefer: "first" },
    { id: "gita-jayanti", name: "Gītā Jayantī", month: "Mārgaśīrṣa", paksha: S_, tithi: 11, kala: "sunrise", prefer: "first" },
    { id: "makara-sankranti", name: "Makara Saṅkrānti", solar: 9 },
    { id: "mesha-sankranti", name: "Meṣa Saṅkrānti (solar new year)", solar: 0 },
    { id: "karka-sankranti", name: "Karka Saṅkrānti", solar: 3 },
    { id: "tula-sankranti", name: "Tulā Saṅkrānti", solar: 6 },
  ].map(Object.freeze));

  /** The span of tithi `idx` (1…30) in the month that starts at the new moon `monthStart`. */
  function tithiSpan(monthStart, idx) {
    const start = idx === 1 ? monthStart : P.syzygyNear(monthStart + (idx - 1) * 0.984 - 1.5, (idx - 1) * 12, +1);
    const end = P.syzygyNear(start + 0.01, (idx * 12) % 360, +1);
    return { start, end };
  }
  const overlap = (a, b) => Math.max(0, Math.min(a[1], b[1]) - Math.max(a[0], b[0]));
  function viṣṭiSpans(t1, t2) {
    const out = []; let x = t1;
    while (x < t2) { const k = P.limbsAt(x).karana, end = P.nextChange(x, "karana") ?? t2; if (P.karanaName(k) === "Viṣṭi") out.push([x, end]); x = end + 1e-7; }
    return out;
  }
  /** The civil day on which a tithi-rule falls, its window, and the part of the window free of the avoided karaṇa. */
  function dayOfRule(rule, monthStart, site, opts) {
    const idx = (rule.paksha === K_ ? 15 : 0) + rule.tithi;
    const span = tithiSpan(monthStart, idx);
    const first = Math.floor(span.start + site.deshantara / 360) - 1, last = Math.floor(span.end + site.deshantara / 360) + 1;
    const cands = [];
    for (let N = first; N <= last; N++) {
      const W = kalaWindows(N, site, opts, { moon: rule.kala === "candrodaya" }); if (!W) continue;
      const w = W[rule.kala]; if (!w) continue;
      const share = rule.kala === "sunrise" || rule.kala === "candrodaya" ? (span.start <= w[0] && w[0] < span.end ? 1 : 0) : overlap(w, [span.start, span.end]) / (w[1] - w[0]);
      cands.push({ N, window: w, share, rise: W.rise, next: W.next, atSunrise: span.start <= W.rise && W.rise < span.end });
    }
    if (!cands.length) return null;      // no civil day near the tithi has the rule's kāla window (a polar day, or no moonrise)
    let hits = cands.filter((c) => c.share > 0), pick, fallback = false;
    if (hits.length === 1) pick = hits[0];
    else if (hits.length > 1) pick = rule.prefer === "second" ? hits[1] : rule.prefer === "more" ? hits.reduce((a, b) => (b.share > a.share + 1e-9 ? b : a)) : hits[0];
    else {   // the tithi misses the window on every day: the day whose sunrise holds it, else the day it begins [unverified]
      pick = cands.find((c) => c.atSunrise) || cands.find((c) => c.rise <= span.start && span.start < c.next) || cands[0]; fallback = true;
    }
    const res = { N: pick.N, window: pick.window, share: pick.share, tithiSpan: span, fallback, alternatives: hits.length };
    if (rule.avoid) {
      const bad = viṣṭiSpans(span.start - 1, span.end + 1);
      const inWin = [Math.max(pick.window[0], span.start), Math.min(pick.window[1], span.end)];
      let free = inWin[1] > inWin[0] ? [inWin] : [];
      for (const [b0, b1] of bad) free = free.flatMap(([f0, f1]) => (b1 <= f0 || b0 >= f1 ? [[f0, f1]] : [[f0, b0], [b1, f1]].filter(([x, y]) => y - x > 1e-6)));
      res.free = free;
      if (!free.length) { const after = bad.find(([b0, b1]) => b1 > inWin[0] && b1 < span.end); res.afterAvoided = after ? [after[1], span.end] : null; }
    }
    return res;
  }

  /** Festivals between t1 and t2 (Kali days) at the site. Each result names its rule, day and window; status unverified. */
  function festivals(t1, t2, site, opts = {}) {
    const rules = opts.rules || RULES, out = [], unplaced = [];
    let t = P.syzygyNear(t1, 0, -1);
    while (t < t2) {
      const m = P.lunarMonth(t + 0.5);
      // a kṣaya month carries the rites of the month it drops as well [unverified: common practice]
      if (!m.adhika) for (const r of rules) if (r.month === m.name || (m.kshaya && r.month === m.kshayaDropped)) {
        const d = dayOfRule(r, m.start, site, opts);
        if (d === null) { unplaced.push({ id: r.id, name: r.name, month: m.name, reason: `no civil day near the tithi has the ${r.kala} window at this place` }); continue; }
        const note = r.month === m.name ? r.note : [r.note, "kṣaya māsa: " + m.name + " also holds the rites of " + m.kshayaDropped + " [" + UNVERIFIED + "]"].filter(Boolean).join("; ");
        if (d.N >= Math.floor(t1) && d.N < t2) out.push({ id: r.id, name: r.name, N: d.N, civil: K.civilFromKaliDay(d.N, "gregorian"), month: m.name + (r.purnimanta ? " (pūrṇimānta " + r.purnimanta + ")" : ""), paksha: r.paksha, tithi: r.tithi, kala: r.kala, ...d, note, status: UNVERIFIED });
      }
      t = m.end + 0.01;
    }
    for (const r of rules) if (typeof r.solar === "number") for (const s of sankrantis(t1 - 2, t2 + 2)) if (s.index === r.solar) {
      // the civil day whose daylight holds the most of the 14.11 puṇya time; when the whole puṇya time falls in the night,
      // the day whose daylight lies nearest the saṅkrānti (before local midnight: that evening's day; after: the next morning's)
      // [which day: unverified]
      let best = null;
      for (let N = Math.floor(s.at) - 1; N <= Math.floor(s.at) + 1; N++) {
        const W = kalaWindows(N, site, opts); if (!W) continue;
        const sh = overlap([W.rise, W.set], [s.punya.from, s.punya.to]);
        const gap = s.at < W.rise ? W.rise - s.at : s.at > W.set ? s.at - W.set : 0;
        if (!best || sh > best.sh + 1e-12 || (best.sh === 0 && sh === 0 && gap < best.gap)) best = { N, sh, gap };
      }
      if (best && best.N >= Math.floor(t1) && best.N < t2) out.push({ id: r.id, name: r.name, N: best.N, civil: K.civilFromKaliDay(best.N, "gregorian"), sankranti: s.at, punya: s.punya, kind: s.kind, source: s.source + "; puṇya SS 14.11", status: "the saṅkrānti and its puṇya time: SS; the choice of day: " + UNVERIFIED });
    }
    for (const r of rules) if (r.after) for (const f of out.filter((x) => x.id === r.after)) out.push({ id: r.id, name: r.name, N: f.N + r.days, civil: K.civilFromKaliDay(f.N + r.days, "gregorian"), status: UNVERIFIED });
    // rules no day could hold (polar day or night, no moonrise) are listed, not thrown: one rule must not lose the year
    return Object.defineProperty(out.sort((a, b) => a.N - b.N), "unplaced", { value: unplaced, enumerable: false });
  }

  return Object.freeze({ panchanga: P, withPanchanga: (p) => build(p), withSine: (name) => utsavaOf(P.withSine(name), S.withSine(name), D, K, U && U.withSine(name)), DISC, MEAN_SUN, SHADASHITI, RULES, UNVERIFIED, sunDisc, moonDisc, punyakala, sankrantis, sunReaches,
    shadashitimukhas, pitrDays, cardinalInSky, kalaWindows, moonEvent, moonrise, moonset, tithiSpan, dayOfRule, festivals, candraDarshana });
  }
  return build(P);
});
