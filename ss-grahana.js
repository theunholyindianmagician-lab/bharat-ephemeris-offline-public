/* ss-grahana.js — ग्रहण: the lunar and solar eclipse of the Sūrya-Siddhānta (chapters 4, 5 and 6.13), by the text's own
 * arithmetic — its 24-entry sine table on R = 3438 with linear interpolation (sphuta.js), the greatest declination's
 * R-sine 1397 (2.28), its rising-times (ss-udaya.js) and its numbers. No spherical trigonometry is used anywhere here;
 * the square roots are the text's own (mūla, pada).
 *
 * Numbers [text]: 6500 and 480 yojanas (4.1 sārdhāni ṣaṭ-sahasrāṇi; saha-aśītyā catuḥ-śatam); the Earth 1600 (1.59 śatāny
 * aṣṭau dvi-guṇāni); tithi = 15 (4.3, 5.10); sixty (4.13 ṣaṣṭyā, 4.14, 4.18); 270′ the Moon's greatest latitude (1.68,
 * one-eightieth of the circle's minutes); orbits 324,000 and 4,331,500 (12.85-12.86, for 4.3's alternative);
 * seventy (4.25, 5.11 saptati); seven sevens = 49 (5.11 sapta-saptaka); jyā of one sign = 1719 (5.7); a twelfth of the
 * Moon and three minutes of the Sun (6.13).
 *
 *   4.1-4.3   discs: yojanas × true ÷ mean daily motion (4.2a); the Sun's carried to the Moon's orbit × Sun ÷ Moon
 *             revolutions (4.2b) or × Moon's orbit ÷ Sun's orbit (4.3a); ÷ 15 → minutes (4.3b).            `discs`
 *   4.4-4.5   sūcī = 1600 × the Moon's true ÷ mean motion; tamas = sūcī − (the Sun's true diameter − 1600) × 480 ÷ 6500;
 *             ÷ 15 → the shadow in minutes ["śravaṇa" in 4.4 read as the Sun's true diameter: reading].   `discs`
 *   4.6-4.8   the parva: Sun and Moon equal (amāvāsyā) or six signs apart (pūrṇimā) to the minute, reached by repeated
 *             correction, the node of that moment — spanda-ganita's exact first spanda of the turn.     `parvaNear`
 *   2.57,1.68 the Moon's latitude = jyā(Moon − node) × 270 ÷ R.                                          `moonLatitude`
 *   4.9-4.11  eclipsed and eclipser (Sun–Moon; Moon–shadow); channa = half the sum of the discs − the latitude; total
 *             when it exceeds the eclipsed; no eclipse when the latitude exceeds the half-sum.           `channa`, `sambhava`
 *   4.12-4.13 the two padas √(half-sum² − latitude²), √(half-difference² − latitude²); × 60 ÷ the difference of the
 *             daily motions → sthityardha and vimardārdha in nāḍīs.                                       `ardhas`
 *   4.14-4.15 the motions × those nāḍīs ÷ 60 taken off for the first contact and added for the last (the node the
 *             other way, "anyathā"); the latitude there; the half-durations again, until fixed.         `lunarEclipse`
 *   4.16-4.17 middle at the end of the true tithi; sparśa = middle − sthityardha, mokṣa = + ; nimīlana, unmīlana by the
 *             vimardārdha when total.
 *   4.18-4.21 the grāsa at a time: (sthityardha − nāḍīs since sparśa) × motion difference ÷ 60 = koṭi; the latitude the
 *             bhuja; their root the śravas; half-sum − śravas = grāsa; after the middle count back from mokṣa (4.21);
 *             in a solar eclipse the koṭi × mean ÷ true sthityardha (4.19).                                `grasaAt`
 *   4.22-4.23 the inverse: half-sum − grāsa = śravas; √(śravas² − latitude²) = koṭi; × true ÷ mean sthityardha for the
 *             Sun; × 60 ÷ motion difference → nāḍīs from the middle.                                    `timeForGrasa`
 *   4.24-4.25 valana: arc(jyā nata × jyā akṣa ÷ R), north in the eastern kapāla, south in the western; with the
 *             declination of the eclipsed + 3 signs, summed when alike, differenced when not; jyā ÷ 70 → aṅgulas. `valanaAt`
 *   4.26      the aṅgula: by the phala DIVIDE (chindyāt) the latitude and the measures. The phala is a reading (see
 *             ANGULA_READINGS): this edition has "dinamadhyārdhaṃ", a second e-text "dinamadhyardhaṃ" (= adhyardha, 1½).
 *   5.1-5.2   no lambana when the Sun is at the madhya-lagna; no nati when akṣa and the northern declination of the
 *             meridian point agree ("harija" = lambana here, as 5.14 and 5.16 use it).
 *   5.3       udayajyā = jyā(lagna by one's own risings) × 1397 ÷ lambajyā.                              `parallaxAt`
 *   5.4-5.6   madhya-lagna by the Laṅkā risings; natāṃśa = akṣa (always south, 3.14) and its declination, summed when
 *             alike, differenced otherwise; madhyajyā; phala = (madhyajyā × udayajyā ÷ R)²; dṛkkṣepa = √(madhyajyā² −
 *             phala); dṛggati = √(R² − dṛkkṣepa²).
 *   5.7-5.8   (asphuṭa: the natāṃśa's sine and cosine); cheda = jyā(1 sign)² ÷ dṛggati [reading "ekajyā-varga", as the
 *             second e-text reads; this edition's "ekajyārdha-gata" gives no ghaṭikās]; lambana = jyā(madhya-lagna ~ Sun)
 *             ÷ cheda, ghaṭikās, east or west.
 *   5.9       Sun beyond the madhya-lagna: subtract from the tithi-end; short of it: add; again and again until fixed.
 *   5.10-5.11 nati = dṛkkṣepa × (the mean motions' difference) ÷ (15 R); or dṛkkṣepa ÷ 70; or × 49 ÷ R.
 *   5.12-5.13 nati south or north as the madhyajyā; with the Moon's latitude summed when alike, differenced otherwise;
 *             with that latitude everything of chapter 4.                                                `solarEclipse`
 *   5.14-5.17 the lambana again at the tithi-end ∓ sthityardha; its difference from the middle's (harijāntara) added to
 *             the half-duration in the normal case of each kapāla (east: sparśa's greater, mokṣa's smaller; west: the
 *             reverse), subtracted where it is the other way; when the kapālas differ, the two lambanas joined and added;
 *             the vimardārdha likewise.                                                                    `harijantara`
 *   6.13      a twelfth of the Moon eclipsed is seen; three minutes of the Sun are not.                    `perceptible`
 *
 * Every longitude is the text's (sidereal) one; declinations, risings and lagnas use it made sāyana by the ayanāṃśa (3.10).
 * Time is days since the Kali epoch (midnight at Laṅkā); a site is { latitude, deshantara } in degrees (deśāntara east +,
 * optional palabha); the meridian is placed from mean time as panchanga.js does. Motions are arcminutes per civil day,
 * so the text's nāḍīs here are sixtieths of the civil day; the clock "ghaṭī after sunrise" is in nāḍīs of the turn
 * (3.46-3.48). This is the text's eclipse, not the sky's: how far it is from the sky is for the vedha to say.
 * withSine("madhava"): the same with Mādhava's sine (sphuta.js, on R = 3438) in place of the table; measured in
 * ss-madhava.test.js. The default is the text's table.
 * Browser: window.SSGrahana (needs Sphuta, SpandaGanita, SSUdaya, KalaDvara); node: module.exports.
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory(require("./sphuta.js"), require("./spanda-ganita.js"), require("./ss-udaya.js"), require("./kala-dvara.js"));
  else root.SSGrahana = factory(root.Sphuta, root.SpandaGanita, root.SSUdaya, root.KalaDvara);
})(typeof globalThis !== "undefined" ? globalThis : this, function ssGrahana(S, G, U, K) {
  "use strict";
  const R = S.R, PARAMA = U.PARAMA;                              // 3438; 1397 (2.28)
  const M = K.mana("surya");
  const SUN_REV = Number(M.sun), MOON_REV = Number(M.moon), CIVIL = Number(M.savana), TURNS = Number(M.nakshatra);
  const NODE_REV = Number(S.REV.node);
  const TURN_DAYS = CIVIL / TURNS;                               // civil days in one turn of the star-wheel (1.34-1.37)
  const TEXT = Object.freeze({
    sunYojana: 6500, moonYojana: 480,                            // 4.1
    earthYojana: 1600,                                           // 1.59: eight hundred, doubled
    tithi: 15,                                                   // 4.3 tithyāptā; 5.10 tithighna
    sashti: 60,                                                  // 4.13, 4.14, 4.18
    moonOrbit: 324000, sunOrbit: 4331500,                        // 12.85, 12.86 (4.3's kakṣā)
    moonGreatestLatitude: S.MOON_MAX_LATITUDE_ARCMIN,            // 1.68: 21600 ÷ 80 = 270′
    saptati: 70,                                                 // 4.25, 5.11
    saptaSaptaka: 49,                                            // 5.11: seven sevens
    ekajya: S.JYA[8],                                            // 5.7: the R-sine of one sign, 1719 (= R ÷ 2)
    moonSeenPart: 12,                                            // 6.13: a twelfth part of the Moon is seen
    sunUnseenArcmin: 3,                                          // 6.13: three minutes of the Sun are not
  });
  /** Mean daily motions, arcminutes per civil day, from the revolutions (1.29-1.37). */
  const MEAN = Object.freeze({ sun: 21600 * SUN_REV / CIVIL, moon: 21600 * MOON_REV / CIVIL, node: 21600 * NODE_REV / CIVIL });
  const NATI_RULES = Object.freeze(["5.10", "5.11", "5.11b"]);
  const ANGULA_READINGS = Object.freeze({
    adhyardha: "phala = 1½ + unnata ÷ half-day ('dinam adhyardhaṃ', the second e-text's 'dinamadhyardhaṃ'; keeps the samāsa circle inside 6.2's 49 aṅgulas)",
    dinamadhyardha: "phala = (half of the half-day + unnata) ÷ half-day ('dina-madhya-ardha', this edition's spelling)",
    dinardha: "phala = (half-day + unnata) ÷ half-day (the edition's गणित line)",
  });
  const mod = (a, m) => ((a % m) + m) % m;
  const wrap180 = (a) => mod(a + 180, 360) - 180;
  const arcOf = (x) => S.arcminOfJya(Math.min(R, Math.abs(x)));  // 2.33, minutes, of |x|

  // ── 4.1-4.5: the discs and the shadow ─────────────────────────────────────────────────────────────
  /** 2.47-2.49: true daily motions (arcmin per civil day) at τ spandas of the turn; the node has only its mean motion. */
  function bhuktiAtTau(tau) {
    const g = G.gati(tau);
    const sun = G.toNum(g.sun) / TURN_DAYS, moon = G.toNum(g.moon) / TURN_DAYS;
    return { sun, moon, node: MEAN.node, rate: moon - sun };
  }
  /** True daily motions at days t since the Kali epoch. */
  const bhukti = (t) => bhuktiAtTau(G.tauOfDays(t));
  /** 4.1-4.5 from the true motions b: discs of Sun and Moon and the Earth's shadow at the Moon, in arcminutes.
   *  opts.via: "bhagana" (4.2b, default) or "kaksha" (4.3a) to carry the Sun's diameter to the Moon's orbit. */
  function discsFrom(b, opts) {
    const sunYoj = TEXT.sunYojana * b.sun / MEAN.sun;                                  // 4.2a
    const moonYoj = TEXT.moonYojana * b.moon / MEAN.moon;                              // 4.2a
    const sunAtMoon = opts && opts.via === "kaksha" ? sunYoj * TEXT.moonOrbit / TEXT.sunOrbit   // 4.3a
      : sunYoj * SUN_REV / MOON_REV;                                                   // 4.2b
    const suci = TEXT.earthYojana * b.moon / MEAN.moon;                                // 4.4
    const tamas = suci - (sunYoj - TEXT.earthYojana) * TEXT.moonYojana / TEXT.sunYojana;   // 4.4b-4.5
    return { sun: sunAtMoon / TEXT.tithi, moon: moonYoj / TEXT.tithi, shadow: tamas / TEXT.tithi,   // 4.3b, 4.5 "pūrvavat"
      yojana: { sun: sunYoj, moon: moonYoj, sunAtMoonOrbit: sunAtMoon, suci, tamas } };
  }
  const discs = (t, opts) => discsFrom(bhukti(t), opts);

  /** 2.57 with 1.68: the Moon's latitude in arcminutes (north +) from the Moon and its node (degrees). */
  const moonLatitude = (moon, node) => S.jya(moon - node) * TEXT.moonGreatestLatitude / R;

  // ── 4.10-4.13 ─────────────────────────────────────────────────────────────────────────────────────
  /** 4.10: the part covered = half the sum of the eclipsed's and the eclipser's measures − the latitude. */
  const channa = (grahya, grahaka, beta) => (grahya + grahaka) / 2 - Math.abs(beta);
  /** 4.11: an eclipse is possible when the latitude is below the half-sum; total when the covered part reaches the eclipsed. */
  function sambhava(grahya, grahaka, beta) {
    const c = channa(grahya, grahaka, beta);
    return { channa: c, possible: c > 0, total: c >= grahya };
  }
  /** 4.12-4.13: the two padas and the half-durations in nāḍīs (sixtieths of the day the motions are counted in). The
   *  vimardārdha exists only in a total eclipse (4.17), which is exactly when its pada is real [theorem]. */
  function ardhas(grahya, grahaka, beta, rate) {
    const s = (grahya + grahaka) / 2, d = (grahaka - grahya) / 2, b2 = beta * beta;
    const ps = s * s - b2, pd = d * d - b2;
    const sthitiPada = ps > 0 ? Math.sqrt(ps) : 0, vimardaPada = d > 0 && pd >= 0 ? Math.sqrt(pd) : 0;
    return { sthitiPada, vimardaPada, sthiti: sthitiPada * TEXT.sashti / rate, vimarda: vimardaPada * TEXT.sashti / rate };
  }

  // ── the parva (4.6-4.8) ───────────────────────────────────────────────────────────────────────────
  const MEAN_ELONG_DEG = (MEAN.moon - MEAN.sun) / 60;
  /** The pūrṇimā ("purnima", 15) or amāvāsyā ("amavasya", 30) nearest civil day `nearDays`: spanda-ganita's exact first
   *  spanda of the turn at which Sun and Moon are equal (or half a circle apart) — SS 4.7; 4.8 reaches the same spanda. */
  function parvaNear(nearDays, kind) {
    const index = kind === "purnima" || kind === 15 ? 15 : kind === "amavasya" || kind === 30 ? 30 : null;
    if (index === null) throw new RangeError('ss-grahana: the parva is "purnima" or "amavasya"');
    const target = index === 15 ? 180 : 0;
    let t = nearDays;
    for (let i = 0; i < 4; i++) { const p = S.sphutaAtDays(t); t -= wrap180(p.moon - p.sun - target) / MEAN_ELONG_DEG; }
    const tau = G.tithiEnd(index, t, 1.5);
    if (tau === null) throw new Error("ss-grahana: parva not bracketed");
    return { kind: index === 15 ? "purnima" : "amavasya", index, tau, days: G.toNum(G.daysOfTau(tau)) };
  }

  // ── the site and the meridian ─────────────────────────────────────────────────────────────────────
  /** 3.13-3.14: akṣajyā and lambajyā from the palabhā and its hypotenuse; their arcs are "always south". */
  function siteOf(site) {
    if (!site || typeof site.latitude !== "number" || typeof site.deshantara !== "number") throw new TypeError("ss-grahana: site needs { latitude, deshantara } in degrees");
    const palabha = typeof site.palabha === "number" ? site.palabha : U.palabhaOf(site.latitude);
    const akshakarna = Math.sqrt(144 + palabha * palabha);                            // 3.13 viṣuvat-karṇa
    const akshajya = R * palabha / akshakarna, lambajya = R * 12 / akshakarna;           // 3.13-3.14
    const akshamsa = Math.sign(akshajya) * arcOf(akshajya) / 60;                        // degrees, south + for a northern place
    return Object.freeze({ latitude: site.latitude, deshantara: site.deshantara, palabha, akshakarna, akshajya, lambajya, akshamsa });
  }
  const LANKA = siteOf({ latitude: 0, deshantara: 0 });
  /** Asus of the meridian (its right ascension × 60) at t: mean Sun (sāyana) + its hour angle from mean time, as panchanga.js. */
  function meridianAsus(t, site, A) {
    const meanSun = S.madhyama(S.spandasOfDays(t)).sun;
    return mod((meanSun + A) * 60 + 21600 * mod(t + site.deshantara / 360, 1) - 10800, 21600);
  }
  const ayanamsha = (t) => S.ayanamshaSS(S.spandasOfDays(t));
  /** 2.60-2.63 for a krānti-jyā: the half-day in asus at a palabhā. */
  function halfDayOfKj(kj, palabha) {
    const cj = (kj * palabha / 12) * R / U.dyujya(kj);
    return U.QUARTER + Math.sign(cj) * arcOf(cj);
  }

  // ── chapter 5: lambana and nati ───────────────────────────────────────────────────────────────────
  /** 5.3-5.11 at days t for the site, with the true Sun's sidereal longitude `sunSid` (degrees).
   *  opts.asphuta: 5.7a's approximate dṛkkṣepa and dṛggati (the natāṃśa's sine and cosine). opts.stated: 3.44's risings. */
  function parallax(t, st, sunSid, opts) {
    const uo = opts && opts.stated ? { stated: true } : undefined;
    const A = ayanamsha(t), sunT = mod(sunSid + A, 360), mer = meridianAsus(t, st, A);
    const lagna = U.lagnaFromMeridian(sunT, mer, st.palabha, uo);                      // 5.3: one's own risings (3.46-3.48)
    const madhyaLagna = U.madhyaLagna(mer, uo);                                       // 5.4: the Laṅkā risings (3.49)
    let udayajya = S.jya(lagna) * PARAMA / st.lambajya;                               // 5.3
    if (Math.abs(udayajya) > R) udayajya = Math.sign(udayajya) * R;
    const mlKranti = U.kranti(madhyaLagna);                                           // 2.28, degrees north +
    const natamsa = st.akshamsa - mlKranti;                                           // 5.4: akṣa south (3.14); alike sum, else difference
    const madhyajya = S.jya(natamsa);                                                 // 5.5, south +
    let drkkshepa, drggati;
    if (opts && opts.asphuta) { drkkshepa = madhyajya; drggati = S.jya(90 - Math.abs(natamsa)); }   // 5.7a
    else {
      const phala = (madhyajya * udayajya / R) ** 2;                                  // 5.5
      drkkshepa = Math.sign(madhyajya) * Math.sqrt(Math.max(0, madhyajya * madhyajya - phala));   // 5.6
      drggati = Math.sqrt(R * R - drkkshepa * drkkshepa);                             // 5.6
    }
    const cheda = TEXT.ekajya * TEXT.ekajya / drggati;                                // 5.7b [reading: ekajyā-varga]
    const vislesha = wrap180(sunT - madhyaLagna);                                     // + : the Sun beyond the madhya-lagna (east)
    const lambana = S.jya(vislesha) / cheda;                                          // 5.8, ghaṭikās; + → subtract (5.9)
    const nati = {                                                                    // arcminutes, south + (5.12: as the madhyajyā)
      "5.10": drkkshepa * (MEAN.moon - MEAN.sun) / (TEXT.tithi * R),
      "5.11": drkkshepa / TEXT.saptati,
      "5.11b": drkkshepa * TEXT.saptaSaptaka / R,
    };
    return { t, ayanamsha: A, sunTrop: sunT, meridianAsus: mer, lagna, madhyaLagna, udayajya, mlKranti, natamsa, madhyajya,
      drkkshepa, drggati, cheda, lambana, kapala: vislesha > 0 ? "east" : "west", nati };
  }
  /** 5.3-5.11 at t for a site, with the true Sun of sphuta.js at t. */
  function parallaxAt(t, site, opts) { return parallax(t, siteOf(site), S.sphutaAtDays(t).sun, opts); }
  const lambanaAt = (t, site, opts) => parallaxAt(t, site, opts).lambana;
  const natiAt = (t, site, opts) => parallaxAt(t, site, opts).nati[(opts && opts.nati) || "5.10"];

  /** 5.15-5.17 as worded: the harijāntara (ghaṭikās) to apply to the half-duration of `side` (−1 sparśa, +1 mokṣa), from
   *  the contact's lambana Lc and the middle's Lm (signed, + east). One kapāla: the difference of the magnitudes, added in
   *  the normal case (east: sparśa's greater, mokṣa's smaller; west: the reverse), subtracted otherwise; two kapālas: the
   *  two joined and added. */
  function harijantara(Lc, Lm, side) {
    const east = (x) => x > 0, a = Math.abs(Lc), m = Math.abs(Lm);
    if (east(Lc) !== east(Lm)) return a + m;                                          // 5.17 lambanaikatā
    const normal = side < 0 ? (east(Lm) ? a >= m : a <= m) : (east(Lm) ? a <= m : a >= m);   // 5.15
    return normal ? Math.abs(a - m) : -Math.abs(a - m);                               // 5.16
  }

  // ── the contacts (4.14-4.17 with 5.14-5.17) ───────────────────────────────────────────────────────
  /** One side of the eclipse: the half-duration `kind` ("sthiti" or "vimarda") recomputed with the latitude at the
   *  contact again and again (4.14-4.15) and, for the Sun, the harijāntara (5.14-5.17). mode "fixed": the lambana and
   *  latitude are taken at the apparent contact until nothing changes [reading of "prāgvat … punaḥ"]; "once": 5.14 as
   *  a single step at the tithi-end ∓ the mean half-duration. */
  function contactSide(kind, side, k) {
    const half = (beta) => ardhas(k.grahya, k.grahaka, beta, k.rate)[kind];
    let nMean = half(k.latFn(k.tm));
    if (!(nMean > 0)) return null;
    let nApp = nMean, har = 0, beta = k.latFn(k.tm), steps = 0;
    const once = k.mode === "once" || !k.lamFn;
    for (; steps < 200; steps++) {
      const tc = k.tm + side * (once ? nMean : nApp) / 60;
      beta = k.latFn(tc);
      const nm = half(beta);
      if (!(nm > 0)) return null;
      const dm = Math.abs(nm - nMean);
      nMean = nm;
      if (once) { if (dm < 1e-9) break; continue; }
      har = harijantara(k.lamFn(tc), k.Lm, side);
      const next = nMean + har;
      const dn = Math.abs(next - nApp);
      nApp = next;
      if (dn < 1e-9 && dm < 1e-9) break;
    }
    if (k.lamFn && once) { har = harijantara(k.lamFn(k.tm + side * nMean / 60), k.Lm, side); nApp = nMean + har; }
    else if (!k.lamFn) nApp = nMean;
    return { madhya: nMean, sphuta: nApp, harijantara: har, latitude: beta, at: k.tm + side * nApp / 60, steps };
  }

  // ── the eclipse ───────────────────────────────────────────────────────────────────────────────────
  function baseOf(parva, opts) {
    const p = S.sphutaAtDays(parva.days), b = bhuktiAtTau(parva.tau);
    return { t0: parva.days, sun: p.sun, moon: p.moon, node: p.rahu, bhukti: b, discs: discsFrom(b, opts) };
  }
  // 4.14: places at another moment by the motions; 4.8, 4.15: the node the other way ("anyathā"), being westward (1.33)
  const sunAt = (B, t) => B.sun + B.bhukti.sun * (t - B.t0) / 60;
  const moonAt = (B, t) => B.moon + B.bhukti.moon * (t - B.t0) / 60;
  const nodeAt = (B, t) => B.node - B.bhukti.node * (t - B.t0) / 60;
  function latFnOf(B, opts) {
    // default: the text's planets recomputed at the moment; "motion" = 4.14 as worded (carried by the daily motions) — 0.5 s apart
    if (!(opts && opts.places === "motion")) return (t) => S.sphutaAtDays(t).moonLatitude * 60;
    return (t) => moonLatitude(moonAt(B, t), nodeAt(B, t));
  }

  /** The eclipse's state of the eclipsed body at t: sāyana longitude, hour angle (asus, west +), half-day and unnata. */
  function bodyState(E, t) {
    const k = E._k, st = k.site, A = ayanamsha(t);
    const lunar = E.kind === "lunar";
    const lam = mod((lunar ? moonAt(k.base, t) : sunAt(k.base, t)) + A, 360);
    const mer = meridianAsus(t, st, A);
    const ha = mod(mer - U.ascension(lam, U.risings(0, k.uo)) + 10800, 21600) - 10800;   // 3.42-3.43: the Laṅkā risings
    const beta = lunar ? k.trueLat(t) : 0;
    const kj = lunar ? S.jya(U.kranti(lam) + beta / 60) : U.krantiJya(lam);           // 2.58: the Moon's latitude joins its declination
    const halfDay = halfDayOfKj(kj, st.palabha);                                      // 2.60-2.63
    return { lambdaTrop: lam, hourAngleAsus: ha, halfDayAsus: halfDay, unnataAsus: halfDay - Math.abs(ha), above: Math.abs(ha) < halfDay };
  }
  /** The clock at the site: civil date and local mean time; the ghaṭīs since sunrise and to sunset in nāḍīs of the turn
   *  (1.11-1.12, what a kapāla calibrated on the stars counts), and in the Sun's own asus (its hour angle, 2.59-2.62),
   *  which run about 59 asus a day slower. */
  function clock(t, site) {
    const st = site ? siteOf(site) : LANKA;
    const local = t + st.deshantara / 360, day = Math.floor(local);
    let s = Math.round((local - day) * 86400), d = day;
    if (s >= 86400) { s -= 86400; d += 1; }
    const p2 = (x) => String(x).padStart(2, "0"), ymd = (g) => `${g.year}-${p2(g.month)}-${p2(g.day)}`;
    const pb = st.palabha || 0;
    // the Sun's own asus since it rose (its hour angle + half-day) and to its setting, at a moment
    const sunAt = (x) => { const A = ayanamsha(x), sunT = mod(S.sphutaAtDays(x).sun + A, 360), since = U.sinceSunrise(sunT, meridianAsus(x, st, A), pb);
      return { since, toSet: 2 * U.halfDay(sunT, pb) - since }; };
    const now = sunAt(t), w = (x) => mod(x + 10800, 21600) - 10800;
    // the instants of that sunrise and sunset: the Sun's asus run 21,600 to the civil day
    let rise = t - now.since / 21600, set = t + now.toSet / 21600;
    for (let i = 0; i < 6; i++) { rise -= w(sunAt(rise).since) / 21600; set += w(sunAt(set).toSet) / 21600; }
    // asus of the turn between two instants: the meridian runs 21,600 + the mean Sun's minutes to the civil day (1.11-1.12)
    const turnAsus = (a, b) => (b - a) * (21600 + MEAN.sun) + 60 * (ayanamsha(b) - ayanamsha(a));
    return { days: t, kaliDay: d, date: ymd(K.civilFromKaliDay(d, "gregorian")), julian: ymd(K.civilFromKaliDay(d, "julian")),
      lmt: `${p2(Math.floor(s / 3600))}:${p2(Math.floor(s / 60) % 60)}:${p2(s % 60)}`, hours: (local - day) * 24,
      sunrise: rise, sunset: set,
      ghatiAfterSunrise: turnAsus(rise, t) / U.GHATI, ghatiBeforeSunset: turnAsus(t, set) / U.GHATI,      // nāḍīs of the turn
      sunGhatiAfterSunrise: now.since / U.GHATI, sunGhatiBeforeSunset: now.toSet / U.GHATI };            // the Sun's own asus
  }

  function finish(E, k) {
    Object.defineProperty(E, "_k", { value: k, enumerable: false });
    E.clock = { madhya: clock(k.tm, k.siteInput) };
    if (!E.possible) return E;
    const sp = contactSide("sthiti", -1, k), mo = contactSide("sthiti", +1, k);
    if (!sp || !mo) {
      // a grazing eclipse: at the contact's own latitude (4.16-4.17, recomputed) the half-sum no longer exceeds it, and the
      // text's eclipse vanishes on iteration. Reported as not possible, with the reason (council G-1).
      E.possible = false; E.grazing = true;
      E.contacts = { sparsha: null, madhya: k.tm, moksha: null, nimilana: null, unmilana: null };
      E.note = "4.16-4.17: at the contact's own latitude the half-sum no longer exceeds it; the text's eclipse vanishes on iteration";
      return E;
    }
    E.sthityardha = { sparsha: sp, moksha: mo };
    E.contacts = { sparsha: sp ? sp.at : null, madhya: k.tm, moksha: mo ? mo.at : null, nimilana: null, unmilana: null };
    if (E.total) {
      const ni = contactSide("vimarda", -1, k), un = contactSide("vimarda", +1, k);
      E.vimardardha = { nimilana: ni, unmilana: un };
      E.contacts.nimilana = ni ? ni.at : null; E.contacts.unmilana = un ? un.at : null;
    } else E.vimardardha = null;
    // 6.13: the perceptible part
    const thr = E.kind === "lunar" ? E.grahyaDisc / TEXT.moonSeenPart : TEXT.sunUnseenArcmin;
    const pf = E.channa > thr ? timeForGrasa(E, thr, "sparsha") : null, pm = E.channa > thr ? timeForGrasa(E, thr, "moksha") : null;
    const seen = pf !== null && pm !== null;            // the threshold must be reached on both sides at its own latitude
    E.perceptible = { threshold: thr, rule: E.kind === "lunar" ? "6.13: a twelfth of the Moon is seen" : "6.13: three minutes of the Sun are not seen",
      seen, from: seen ? pf.at : null, to: seen ? pm.at : null };
    for (const [name, t] of Object.entries(E.contacts)) if (t !== null) E.clock[name] = clock(t, k.siteInput);
    if (k.siteGiven) {
      const at = (t) => (t === null ? null : bodyState(E, t));
      // every contact the eclipse has, nimīlana and unmīlana included (a missing one read as "up" in vedha.html)
      E.horizon = Object.fromEntries(Object.entries(E.contacts).map(([c, t]) => [c, at(t)]));
      // seen at the site: some instant of the perceptible span with the eclipsed body above the horizon
      let seenAtSite = false;
      if (seen) {
        const a = E.perceptible.from, b = E.perceptible.to;
        for (let i = 0; i <= 240 && !seenAtSite; i++) { const t = a + (b - a) * i / 240; if (bodyState(E, t).above) seenAtSite = true; }
      }
      E.seenAtSite = seenAtSite;
      E.valana = { sparsha: E.contacts.sparsha === null ? null : valanaAt(E, E.contacts.sparsha), madhya: valanaAt(E, k.tm),
        moksha: E.contacts.moksha === null ? null : valanaAt(E, E.contacts.moksha) };
      E.angula = angulaAt(E, k.tm);
    }
    return E;
  }

  function context(site, opts) {
    const o = opts || {};
    const natiRule = o.nati || "5.10";
    if (!NATI_RULES.includes(natiRule)) throw new RangeError(`ss-grahana: nati rule is one of ${NATI_RULES.join(", ")}`);
    return { site: site ? siteOf(site) : LANKA, siteGiven: !!site, siteInput: site, uo: o.stated ? { stated: true } : undefined,
      mode: o.contactLambana === "once" ? "once" : "fixed", natiRule, opts: o };
  }

  /** The lunar eclipse at the pūrṇimā nearest `nearDays` (SS 4). A site adds the horizon, the valana and the aṅgulas. */
  function lunarEclipse(nearDays, site, opts) {
    const c = context(site, opts), parva = parvaNear(nearDays, "purnima"), B = baseOf(parva, c.opts);
    const latFn = latFnOf(B, c.opts), grahya = B.discs.moon, grahaka = B.discs.shadow;   // 4.9: the Moon enters the shadow
    const beta = latFn(parva.days), sb = sambhava(grahya, grahaka, beta);
    const E = { kind: "lunar", parva: { kind: parva.kind, tau: parva.tau, days: parva.days }, middle: parva.days, grahya: "moon",
      discs: { sun: B.discs.sun, moon: B.discs.moon, shadow: B.discs.shadow }, grahyaDisc: grahya, grahakaDisc: grahaka,
      halfSum: (grahya + grahaka) / 2, bhukti: B.bhukti, latitude: beta, channa: sb.channa, magnitude: sb.channa / grahya,
      possible: sb.possible, total: sb.total };
    const k = { ...c, base: B, latFn, trueLat: latFn, lamFn: null, tm: parva.days, grahya, grahaka, rate: B.bhukti.rate };
    return finish(E, k);
  }

  /** The solar eclipse at the amāvāsyā nearest `nearDays` for a site (SS 4 with 5). opts.nati: "5.10" (default), "5.11"
   *  (÷ 70) or "5.11b" (× 49 ÷ R); opts.contactLambana: "fixed" (default) or "once"; opts.asphuta: 5.7a. */
  function solarEclipse(nearDays, site, opts) {
    if (!site) throw new TypeError("ss-grahana: a solar eclipse needs a site");
    const c = context(site, opts), parva = parvaNear(nearDays, "amavasya"), B = baseOf(parva, c.opts);
    const trueLat = latFnOf(B, c.opts);
    const P = (t) => parallax(t, c.site, sunAt(B, t), c.opts);
    let tm = parva.days, p = P(tm), steps = 0;                                       // 5.9: from the tithi-end, again and again
    for (; steps < 200; steps++) {
      const next = parva.days - p.lambana / 60;
      const done = Math.abs(next - tm) < 1e-9;
      tm = next; p = P(tm);
      if (done) break;
    }
    const natiOf = (q) => q.nati[c.natiRule];
    const latFn = (t) => trueLat(t) - natiOf(P(t));                                  // 5.12: a southern nati lessens a northern latitude
    const grahya = B.discs.sun, grahaka = B.discs.moon;                              // 4.9: the Moon covers the Sun
    const beta = latFn(tm), sb = sambhava(grahya, grahaka, beta);
    const E = { kind: "solar", parva: { kind: parva.kind, tau: parva.tau, days: parva.days }, middle: tm, grahya: "sun",
      discs: { sun: B.discs.sun, moon: B.discs.moon, shadow: B.discs.shadow }, grahyaDisc: grahya, grahakaDisc: grahaka,
      halfSum: (grahya + grahaka) / 2, bhukti: B.bhukti,
      lambana: { middle: p.lambana, kapala: p.kapala, steps, parallax: p }, nati: natiOf(p), natiRule: c.natiRule,
      trueLatitude: trueLat(tm), latitude: beta, channa: sb.channa, magnitude: sb.channa / grahya, possible: sb.possible, total: sb.total };
    const k = { ...c, base: B, latFn, trueLat, lamFn: (t) => P(t).lambana, Lm: p.lambana, tm, grahya, grahaka, rate: B.bhukti.rate };
    return finish(E, k);
  }

  // ── 4.18-4.23: the grāsa at a time, and the time of a grāsa ──────────────────────────────────────
  /** 4.18-4.21 (4.19 for the Sun): the grāsa (arcminutes) of an eclipse at days t. */
  function grasaAt(E, t) {
    if (!E.possible) return null;
    const k = E._k, before = t <= E.middle, side = before ? E.sthityardha.sparsha : E.sthityardha.moksha;
    if (!side) return null;
    const ishta = before ? (t - E.contacts.sparsha) * 60 : (E.contacts.moksha - t) * 60;    // nāḍīs after sparśa / before mokṣa
    let koti = (side.sphuta - ishta) * k.rate / TEXT.sashti;                          // 4.18, 4.21
    if (E.kind === "solar") koti = koti * side.madhya / side.sphuta;                  // 4.19
    const kshepa = k.latFn(t);                                                        // the latitude of that moment (the bhuja)
    const sravas = Math.sqrt(koti * koti + kshepa * kshepa);                          // 4.20
    const grasa = E.halfSum - sravas;                                                 // 4.20
    return { grasa, koti, kshepa, sravas, fraction: grasa / E.grahyaDisc, eclipsed: grasa > 0, side: before ? "sparsha" : "moksha" };
  }
  /** 4.22-4.23: the instant on `side` ("sparsha" before the middle, "moksha" after) at which the grāsa is `g` arcminutes.
   *  The latitude is that of the instant found, recomputed until fixed. null if the grāsa is never reached. */
  function timeForGrasa(E, g, side) {
    if (!E.possible) return null;
    const k = E._k, s = side === "moksha" ? 1 : -1, half = side === "moksha" ? E.sthityardha.moksha : E.sthityardha.sparsha;
    const sravas = E.halfSum - g;                                                     // 4.22
    let t = E.middle, nadi = 0, koti = 0, steps = 0;
    for (; steps < 200; steps++) {
      const kshepa = k.latFn(t), d = sravas * sravas - kshepa * kshepa;
      if (d < 0) return null;
      koti = Math.sqrt(d);                                                            // 4.22: padam
      const kotiT = E.kind === "solar" ? koti * half.sphuta / half.madhya : koti;     // 4.23: × true ÷ mean sthityardha
      nadi = kotiT * TEXT.sashti / k.rate;                                            // 4.23: "sthitivat"
      const next = E.middle + s * nadi / 60;
      const done = Math.abs(next - t) < 1e-10;
      t = next;
      if (done) break;
    }
    return { at: t, nadiFromMiddle: nadi, nadiFromContact: half.sphuta - nadi, koti, steps };
  }

  // ── 4.24-4.26: valana and aṅgulas ─────────────────────────────────────────────────────────────────
  /** 4.24-4.25: the valana of the eclipsed body at t — ākṣa and āyana in degrees (north +), their join, and jyā ÷ 70 aṅgulas. */
  function valanaAt(E, t) {
    const b = bodyState(E, t), st = E._k.site;
    const nata = Math.abs(b.hourAngleAsus) / 60;                                      // degrees of the turn from the meridian
    const kapala = b.hourAngleAsus < 0 ? "east" : "west";
    const akshaMag = arcOf(S.jya(nata) * st.akshajya / R) / 60;                       // 4.24
    const aksha = (kapala === "east" ? 1 : -1) * Math.sign(st.akshajya || 1) * akshaMag;   // north in the east, south in the west
    const ayana = U.kranti(b.lambdaTrop + 90);                                        // 4.25: the eclipsed + three signs
    const degrees = aksha + ayana;                                                    // alike: sum; unlike: difference
    return { kapala, nataDeg: nata, aksha, ayana, degrees, angula: S.jya(degrees) / TEXT.saptati, direction: degrees >= 0 ? "north" : "south" };
  }
  /** 4.26: the eclipse's measures in aṅgulas at t, the minutes DIVIDED by the phala (chindyāt). null below the horizon.
   *  opts.reading: "adhyardha" (default), "dinamadhyardha" or "dinardha" (ANGULA_READINGS). */
  function angulaAt(E, t, opts) {
    const reading = (opts && opts.reading) || "adhyardha";
    if (!(reading in ANGULA_READINGS)) throw new RangeError("ss-grahana: unknown aṅgula reading");
    if (!E.possible) return null;
    const b = bodyState(E, t);
    if (!b.above) return null;
    const u = b.unnataAsus / b.halfDayAsus;
    const phala = reading === "adhyardha" ? 1.5 + u : reading === "dinamadhyardha" ? 0.5 + u : 1 + u;
    const g = grasaAt(E, t), a = (x) => x / phala;
    if (!g) return null;
    return { reading, phala, unnataGhati: b.unnataAsus / U.GHATI, grahya: a(E.grahyaDisc), grahaka: a(E.grahakaDisc), kshepa: a(g.kshepa), grasa: a(g.grasa) };
  }

  // ── every eclipse in an interval ──────────────────────────────────────────────────────────────────
  /** Every lunar and solar eclipse the text gives in [t1, t2) for the site, in order. A solar parva is tried when the
   *  Moon's latitude is within the half-sum and the greatest nati (R ÷ 70); opts.all keeps the parvas with no eclipse. */
  const SCREEN_ARCMIN = 150;
  function eclipsesBetween(t1, t2, site, opts) {
    siteOf(site);
    const out = [];
    let t = t1;
    for (let guard = 0; guard < 10000 && t < t2; guard++) {
      const p = S.sphutaAtDays(t), e = mod(p.moon - p.sun, 360);
      const target = e < 180 ? 180 : 360;
      // screen with the float places first (council G-2): a syzygy whose Moon is more than SCREEN_ARCMIN from the node's
      // circle can be no eclipse of either kind (the widest test below is the half-sum + R/70, about 81′), so the exact
      // parva (a BigInt solve, ~50 ms) is spent only on the few that can be
      if (!(opts && opts.all)) {
        let tf = t + (target - e) / MEAN_ELONG_DEG;
        for (let i = 0; i < 4; i++) { const q = S.sphutaAtDays(tf); tf -= wrap180(q.moon - q.sun - (target % 360)) / MEAN_ELONG_DEG; }
        if (tf >= t2) break;
        if (Math.abs(S.sphutaAtDays(tf).moonLatitude * 60) > SCREEN_ARCMIN) { t = tf + 1; continue; }
      }
      const parva = parvaNear(t + (target - e) / MEAN_ELONG_DEG, target === 180 ? "purnima" : "amavasya");
      if (parva.days >= t2) break;
      if (parva.days >= t1) {
        let E = null;
        if (parva.kind === "purnima") E = lunarEclipse(parva.days, site, opts);
        else {
          const q = S.sphutaAtDays(parva.days), b = bhukti(parva.days), d = discsFrom(b, opts);
          if (Math.abs(q.moonLatitude * 60) < (d.sun + d.moon) / 2 + R / TEXT.saptati) E = solarEclipse(parva.days, site, opts);
        }
        if (E && (E.possible || (opts && opts.all))) out.push(E);
      }
      t = parva.days + 1;
    }
    return out;
  }

  return Object.freeze({ TEXT, MEAN, NATI_RULES, ANGULA_READINGS, TURN_DAYS,
    bhukti, bhuktiAtTau, discs, discsFrom, moonLatitude, channa, sambhava, ardhas, parvaNear, siteOf, meridianAsus,
    parallaxAt, lambanaAt, natiAt, harijantara, lunarEclipse, solarEclipse, grasaAt, timeForGrasa, valanaAt, angulaAt,
    eclipsesBetween, clock, sine: S.sine || "table", withSine: (name) => ssGrahana(S.withSine(name), G.withSine(name), U.withSine(name), K) });
});
