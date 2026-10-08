/* ss-drishya.js — दृश्य: when a body is seen. The heliacal rising and setting of the planets and the junction stars
 * (Sūrya-Siddhānta ch.9), the Moon's last morning and its rising in the dark half (10.1, 10.5), and the elevation of the
 * Moon's horns with its bright part (10.6-10.15) — by the text's own arithmetic: its rising-times, its sine table on
 * R = 3438, its 1397, its dṛkkarma. No spherical trigonometry on this path.
 *
 *   9.2         Jupiter, Mars, Saturn — and Venus and Mercury when retrograde — set in the west when greater than the Sun,
 *               rise in the east when less ("sūryād abhyadhikāḥ paścād astaṃ … ūnāḥ prāg udayaṃ … śukrajñau vakriṇau tathā").
 *   9.3         the fast movers, Moon, Mercury, Venus, set in the east when less than the Sun, rise in the west when greater.
 *   9.4         the places are taken at sunset for the west and at sunrise for the east; then the dṛkkarma of the planet.
 *   9.5         kālāṃśa = the asus between the two lagnas ÷ 60 (ṣaṣṭi-bhājitāḥ); in the west both are advanced six signs.
 *   7.8-7.10    dṛkkarma at the horizon (ss-udaya.js): ākṣa = latitude′ × palabhā ÷ 12, and āyana. For a junction star the
 *               dhruvaka already lies on the star's circle through the dhruva — the place the āyana part makes for a planet
 *               (7.11 names "nakṣatra-graha-yoga" as its use; 8.15) — so a star takes the ākṣa part only [reading;
 *               `starAyana: true` applies both, as "dṛkkarma pūrvavat" (9.17) read literally].
 *   9.6         the kālāṃśa of setting: Jupiter 11 (ekādaśa), Saturn 15 (tithi-saṅkhyā), Mars 17 (daśa saptādhikāḥ).
 *   9.7         Venus: setting in the west and rising in the east by 8 (aṣṭābhiḥ, "mahattayā"); setting in the east and
 *               rising in the west by 10 (daśabhiḥ, "alpatvāt"). By 9.2-9.3 the first pair happens while retrograde.
 *   9.8         Mercury: 12 (dvādaśabhiḥ) when retrograde (vakrī), 14 (caturdaśabhiḥ) when fast (śīghragatiḥ).
 *   9.9         with more kālāṃśa than these a body is seen; with fewer it is lost in the Sun's light.
 *   9.10        days to go (or gone) = the kalās of the difference of the kālāṃśas ÷ the difference of the motions — their
 *               sum ("bhukti-yogena") for a retrograde body.
 *   9.11        the motions there are kālagatis: each daily motion × the rising asus of its lagna's sign ÷ 1800
 *               (aṣṭādaśa-śata, the minutes of a sign); "bhuktī" is the dual — the two daily motions.
 *   9.12-9.15   the stars' kālāṃśas: 13 (trayodaśa) Svātī, Agastya, Mṛgavyādha, Citrā, Jyeṣṭhā, Punarvasu, Abhijit,
 *               Brahmahṛdaya; 14 (caturdaśa) Hasta, Śravaṇa, both Phālgunīs, Śraviṣṭhā, Rohiṇī, Maghā, Viśākhā, Aśvinī;
 *               15 (pañcadaśa) Kṛttikā, Maitra, Mūla, Sārpa, Raudra, both Āṣāḍhās; 21 (triḥ-saptaka, "saukṣmyāt")
 *               Bharaṇī, Tiṣya, Saumya; 17 (saptadaśa) the rest. Of the 27 nakṣatras: 4 + 9 + 7 + 3 + 4.
 *   9.16        kṣetrāṃśa = dṛśyāṃśa × 1800 ÷ the rising asus of its own sign — the same limit as an arc of the ecliptic.
 *   9.17        stars rise in the east and set in the west; dṛkkarma as before; the days by the Sun's motion alone.
 *   9.18        Abhijit, Brahmahṛdaya, Svātī, Vaiṣṇava (Śravaṇa), Vāsava (Dhaniṣṭhā), Ahirbudhnya (Uttarabhādrapadā),
 *               being northern, are not lost in the Sun's rays — at a place where their ākṣa shift exceeds the limit
 *               (measured in the test).
 *   10.1        the Moon by the same rule with 12: seen in the west, lost in the east. The west is Utsava.candraDarshana;
 *               here the east (the last morning), and both on the text's own sunset and sunrise.
 *   10.5        in the dark half, the Sun advanced half a revolution: the asus from it to the Moon are the Moon's rising
 *               after sunset, iterated as 10.3-10.4.
 *   10.6        the declinations of Sun and Moon (the Moon's with its latitude, 2.58): their difference when on one side,
 *               their sum otherwise; its sine is north or south as the Moon lies from the Sun.
 *   10.7        × the hypotenuse of the Moon's midday shadow ("madhyāhna-indu-prabhā-karṇa"); north: taken from
 *               12 × akṣajyā (arka-ghna), south: added to it. The words' midday karṇa is the default; the figure's
 *               geometry needs the karṇa of the moment, 12 R ÷ śaṅku by 3.34-3.36 (`karna: "tatkala"` [reading]) —
 *               the test measures both against the sphere.
 *   10.8        the remainder ÷ lambajyā is the bāhu in its own direction; the koṭi is the gnomon (12); √(bāhu² + koṭi²)
 *               is the śruti (karṇa).
 *   10.9        (Moon − Sun) in minutes ÷ 900 (nava-śata) = the bright part, in twelfths of the disc; × the disc in
 *               aṅgulas ÷ 12 = the bright part in aṅgulas.
 *   10.10-10.14 the figure: Sun-point, bāhu, koṭi westward, karṇa to the Moon; the horns on the line across the karṇa;
 *               with the koṭi upright, the horn on the side away from the bāhu stands higher. Its tilt from level is the
 *               arc whose sine is bāhu × R ÷ śruti (2.33 on the table).
 *   10.15       in the dark half the dark part is Moon − (Sun + six signs) the same way; the bāhu is laid to the left
 *               hand ("vāmaṃ bhujaṃ") and the western part of the disc is dark — read here as the waning Moon in the east
 *               before sunrise, where north lies on the left of one facing east [reading].
 * Sunrise and sunset are the text's: the mean Sun's turn with the bhujāntara (2.46) and the cara (2.61-2.63) — or, with
 * `sunrise: "ascension"`, the true Sun's right ascension by the Laṅkā risings (3.42-3.43). Every longitude used with a
 * rising-time is sāyana (3.10). Time = days since the Kali epoch; site = { latitude, deshantara } (+ palabha).
 * Planets come from a callback (no planet module is required here); the Sun and Moon from the pañcāṅga's places.
 * Browser: window.SSDrishya (needs Sphuta, SSUdaya, Panchanga, Utsava, KalaDvara); node: module.exports.
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory(require("./sphuta.js"), require("./ss-udaya.js"), require("./panchanga.js"), require("./utsava.js"), require("./kala-dvara.js"));
  else root.SSDrishya = factory(root.Sphuta, root.SSUdaya, root.Panchanga, root.Utsava, root.KalaDvara);
})(typeof globalThis !== "undefined" ? globalThis : this, function ssDrishyaOf(S, U, P0, Ut0, K) {
  "use strict";
  const R = S.R, TURN = U.TURN, HALF_TURN = TURN / 2, GHATI = U.GHATI;
  const SIXTY = U.KALAMSA;                     // 9.5 ṣaṣṭi-bhājitāḥ
  const SIGN_ARC = 1800;                       // 9.11, 9.16 aṣṭādaśa-śata: the minutes of arc in a sign
  const NAVASHATA = 900;                       // 10.9 nava-śata
  const GNOMON = 12;                           // 10.7 arka-ghna, 10.8 koṭiḥ śaṅkuḥ: the gnomon of twelve aṅgulas
  const MOON_KALAMSA = U.DARSHANA_KALAMSA;     // 10.1 dvādaśabhiḥ
  const mod = (a, m) => ((a % m) + m) % m;
  const wrap180 = (a) => mod(a + 180, 360) - 180;

  // ── the numbers of 9.6-9.8, 9.12-9.15, 10.1 ──────────────────────────────────────────────────────
  const PLANET_KALAMSA = Object.freeze({
    jupiter: Object.freeze({ kalamsa: 11, verse: "9.6", words: "ekādaśa amarejyasya" }),
    saturn: Object.freeze({ kalamsa: 15, verse: "9.6", words: "tithi-saṅkhyā arkajasya (tithi = 15)" }),
    mars: Object.freeze({ kalamsa: 17, verse: "9.6", words: "bhūmiputrasya daśa sapta-adhikāḥ (10 + 7)" }),
    venus: Object.freeze({ vakri: 8, shighra: 10, verse: "9.7", words: "paścād astamayo 'ṣṭābhir udayaḥ prāṅ mahattayā; prāg astam udayaḥ paścād alpatvād daśabhir bhṛgoḥ" }),
    mercury: Object.freeze({ vakri: 12, shighra: 14, verse: "9.8", words: "budho dvādaśabhiś caturdaśabhir aṃśakaiḥ vakrī śīghragatiś ca" }),
    moon: Object.freeze({ kalamsa: 12, verse: "10.1", words: "bhāgair dvādaśabhiḥ" }),
  });
  const SLOW = new Set(["mars", "jupiter", "saturn"]);
  /** 9.6-9.8, 10.1: the kālāṃśa limit of a body in its present motion. For Venus 9.7 names the phenomena (west setting and
   *  east rising 8; east setting and west rising 10); by 9.2-9.3 those are the retrograde and the direct pair. */
  function planetLimit(planet, retrograde, limits) {
    const L = limits || PLANET_KALAMSA[planet];
    if (!L) throw new RangeError(`ss-drishya: no kālāṃśa for "${planet}"`);
    if (typeof L === "number") return L;
    if (typeof L.kalamsa === "number") return L.kalamsa;
    return retrograde ? L.vakri : L.shighra;
  }

  // The 28 junction stars in the order of ch.8 (corpus/surya-siddhanta/yogatara.json), Abhijit between Uttarāṣāḍhā and Śravaṇa.
  const NAKSHATRA_28 = Object.freeze(["Aśvinī", "Bharaṇī", "Kṛttikā", "Rohiṇī", "Mṛgaśiras", "Ārdrā", "Punarvasu", "Puṣya", "Āśleṣā", "Maghā",
    "Pūrvaphalgunī", "Uttaraphalgunī", "Hasta", "Citrā", "Svātī", "Viśākhā", "Anurādhā", "Jyeṣṭhā", "Mūla", "Pūrvāṣāḍhā", "Uttarāṣāḍhā",
    "Abhijit", "Śravaṇa", "Dhaniṣṭhā", "Śatabhiṣaj", "Pūrvabhādrapadā", "Uttarabhādrapadā", "Revatī"]);
  const NAMED = [
    { kalamsa: 13, verse: "9.12", words: "trayodaśabhir aṃśakaiḥ",
      read: "svāti, agastya, mṛgavyādha, citrā, jyeṣṭhā, punarvasu, abhijit, brahmahṛdaya",
      names: ["Svātī", "Agastya", "Mṛgavyādha", "Citrā", "Jyeṣṭhā", "Punarvasu", "Abhijit", "Brahmahṛdaya"] },
    { kalamsa: 14, verse: "9.13", words: "caturdaśāṃśakair dṛśyāḥ",
      read: "hasta, śravaṇa, phālgunyaḥ (both), śraviṣṭhā (Dhaniṣṭhā), rohiṇī, maghāḥ, viśākhā, āśvini-daivatam (Aśvinī)",
      names: ["Hasta", "Śravaṇa", "Pūrvaphalgunī", "Uttaraphalgunī", "Dhaniṣṭhā", "Rohiṇī", "Maghā", "Viśākhā", "Aśvinī"] },
    { kalamsa: 15, verse: "9.14", words: "dṛśyante pañcadaśabhiḥ",
      read: "kṛttikā, maitra (Anurādhā, Mitra's), mūla, sārpa (Āśleṣā, the serpents'), raudra-ṛkṣa (Ārdrā, Rudra's), āṣāḍhā-dvitaya",
      names: ["Kṛttikā", "Anurādhā", "Mūla", "Āśleṣā", "Ārdrā", "Pūrvāṣāḍhā", "Uttarāṣāḍhā"] },
    { kalamsa: 21, verse: "9.15", words: "saukṣmyāt triḥ-saptaka-aṃśakaiḥ (3 × 7)",
      read: "bharaṇī, tiṣya (Puṣya), saumya (Mṛgaśiras, Soma's)",
      names: ["Bharaṇī", "Puṣya", "Mṛgaśiras"] },
  ];
  const namedSet = new Set(NAMED.flatMap((g) => g.names));
  const STAR_GROUPS = Object.freeze([...NAMED, { kalamsa: 17, verse: "9.15", words: "śeṣāṇi saptadaśabhiḥ … bhāni", read: "the remaining nakṣatras",
    names: NAKSHATRA_28.filter((n) => !namedSet.has(n)) }].map((g) => Object.freeze({ ...g, names: Object.freeze(g.names.slice()) })));
  const STAR_KALAMSA = Object.freeze(Object.fromEntries(STAR_GROUPS.flatMap((g) => g.names.map((n) => [n, g.kalamsa]))));
  /** 9.18: the six named as never lost in the Sun's rays (vaiṣṇava = Śravaṇa, vāsava = Dhaniṣṭhā, ahirbudhnya =
   *  Uttarabhādrapadā, by their deities [reading]). */
  const NEVER_LOST = Object.freeze(["Abhijit", "Brahmahṛdaya", "Svātī", "Śravaṇa", "Dhaniṣṭhā", "Uttarabhādrapadā"]);

  /** A yogatara.json entry → its dhruvaka in degrees (sidereal, the text's Meṣa 0): 8.1 for a figure, 8.4-8.5 by rule,
   *  or a named star's degree (8.10-8.12). null where the catalogue gives none. */
  function dhruvakaOf(e) {
    if (typeof e.dhruvaka_deg === "number") return e.dhruvaka_deg;
    if (typeof e.figure === "number") return ((e.bhoga - 1) * 800 + e.figure * 10) / 60;
    if (!e.rule) return null;
    const start = (e.rule.of - 1) * 800;
    if (e.rule.kind === "middle-of-bhoga") return (start + 400) / 60;
    if (e.rule.kind === "end-of-bhoga") return (start + 800) / 60;
    if (e.rule.kind === "padas-into-bhoga") return (start + e.rule.padas * 200) / 60;
    return null;
  }
  /** The catalogue (yogatara.json) → [{ name, dhruvaka, vikshepa, kalamsa }] for every star with a place and a kālāṃśa. */
  function starsOf(cat) {
    return [...cat.stars, ...(cat.named_stars || [])].map((e) => ({ name: e.name, dhruvaka: dhruvakaOf(e), vikshepa: e.vikshepa, kalamsa: STAR_KALAMSA[e.name] ?? null }))
      .filter((s) => s.dhruvaka !== null && typeof s.vikshepa === "number");
  }

  // ── the arithmetic of 9.5, 9.10, 9.11, 9.16 ─────────────────────────────────────────────────────────
  const signOf = (lam) => Math.min(11, Math.floor(mod(lam, 360) / 30));
  const signedAsus = (a) => { const x = mod(a, TURN); return x > HALF_TURN ? x - TURN : x; };
  /** 9.5: the signed kālāṃśa of a point from the Sun on one horizon. East: asus from the point's rising to the Sun's
   *  (positive when it rises first). West: from the Sun's setting to the point's, both advanced six signs (positive when
   *  it sets after). `rs`: the twelve risings at the place (3.44-3.45). */
  function kalamsa(point, sun, rs, side) {
    const a = side === "east" ? U.ascension(sun, rs) - U.ascension(point, rs) : U.ascension(point + 180, rs) - U.ascension(sun + 180, rs);
    return signedAsus(a) / SIXTY;
  }
  /** 9.11: kālagati — a daily motion (minutes of arc a day) × the rising asus of the sign of its lagna ÷ 1800: asus a day.
   *  The lagna in the west is the point + six signs (9.5). */
  const kalagati = (bhuktiArcmin, point, rs, side) => bhuktiArcmin * rs[signOf(side === "west" ? point + 180 : point)] / SIGN_ARC;
  /** 9.10: days until (positive, gamya) or since (negative, gata) the kālāṃśa `k` reaches `limit`: the difference in
   *  kalās ÷ the difference of the two kālagatis — the sum when the body is retrograde, its kālagati being negative. */
  function daysToLimit(k, limit, kgSun, kgBody, side) {
    const rate = side === "east" ? kgSun - kgBody : kgBody - kgSun;                 // asus a day by which 60 × k grows
    return { days: (limit - k) * SIXTY / rate, rateAsus: rate };
  }
  /** 9.16: kṣetrāṃśa — the dṛśyāṃśa (kālāṃśa) × 1800 ÷ the rising asus of its own sign: the limit as degrees of the ecliptic. */
  const kshetramsa = (kal, point, rs, side) => kal * SIGN_ARC / rs[signOf(side === "west" ? point + 180 : point)];
  /** 7.8-7.9 at the horizon, ākṣa part only: a junction star's dhruvaka (sāyana) carried to the ecliptic point that rises
   *  (east) or sets (west) with it; with `starAyana` the āyana part of 7.10 is added as for a planet. */
  function starDrk(lamTrop, vikDeg, pb, side, opts) {
    if (opts && opts.starAyana) return U.drkkarma(lamTrop, vikDeg * 60, pb, side).lambda;
    return mod(lamTrop + (side === "west" ? 1 : -1) * vikDeg * 60 * pb / 12 / 60, 360);
  }
  /** The default horizon rule (opts.drk): "own" — each body's own declination and cara, its right ascension by 3.42's
   *  rule at the point (2.58, 2.61-2.63; 2.63 gives the stars their own day) — or "aksa", 9.5 with 7.8-7.10 as the
   *  chapters word it (linear dṛkkarma, risings proportional within a sign). Against the sphere the first is within 0.53
   *  kālāṃśa at |β| = 5° and 0.37 for every junction star at Ujjayinī; the second 1.8 and 16.8 (Agastya). */
  const ownDrk = (opts) => !(opts && (opts.drk === "aksa" || opts.starAyana));
  function bodyKalamsa(lam, latArcmin, sun, pb, rs, side, opts) {
    if (ownDrk(opts)) return U.kalamsaOwn(U.bodyHorizonAsus(lam, latArcmin, pb, side), sun, pb, side);
    return kalamsa(U.drkkarma(lam, latArcmin, pb, side).lambda, sun, rs, side);
  }
  /** 9.11 in the own-horizon rule: a daily motion × the rate at which the body's horizon time moves with its longitude
   *  (asus per minute of arc, taken over ±1′) — the same quantity 9.11's "rising asus of the sign ÷ 1800" approximates. */
  function kalagatiOwn(bhuktiArcmin, horizonOf) {
    let d = horizonOf(1 / 60) - horizonOf(-1 / 60); if (d > TURN / 2) d -= TURN; if (d < -TURN / 2) d += TURN;
    return bhuktiArcmin * d / 2;
  }
  const sunHorizon = (sun, pb, side) => (dl) => U.horizonAsus(sun + dl, U.kranti(sun + dl), pb, side);
  function starKalamsa(dhTrop, vikDeg, sun, pb, rs, side, opts) {
    if (ownDrk(opts)) return U.kalamsaOwn(U.starHorizonAsus(dhTrop, vikDeg, pb, side), sun, pb, side);
    return kalamsa(starDrk(dhTrop, vikDeg, pb, side, opts), sun, rs, side);
  }

  /** 9.2-9.3: the phenomenon a body is heading for. Slow (Jupiter, Mars, Saturn; Venus and Mercury retrograde; stars, 9.17):
   *  greater than the Sun → setting in the west, less → rising in the east. Fast (Moon; Venus and Mercury direct): less →
   *  setting in the east, greater → rising in the west. `motion: "relative"` calls slow whatever moves slower than the Sun
   *  [reading]. */
  function pending(planet, retrograde, greater, slowerThanSun, opts) {
    const slow = planet === "star" || SLOW.has(planet) || (opts && opts.motion === "relative" ? slowerThanSun : (planet === "venus" || planet === "mercury") && retrograde);
    if (slow) return greater ? { side: "west", kind: "asta", verse: "9.2" } : { side: "east", kind: "udaya", verse: "9.2" };
    return greater ? { side: "west", kind: "udaya", verse: "9.3" } : { side: "east", kind: "asta", verse: "9.3" };
  }
  const PHENOMENON = Object.freeze({
    east: Object.freeze({ udaya: "prāg-udaya — first seen in the east before sunrise", asta: "prāg-asta — last seen in the east" }),
    west: Object.freeze({ udaya: "paścād-udaya — first seen in the west after sunset", asta: "paścād-asta — last seen in the west" }),
  });

  // ── the figure of 10.6-10.15 ──────────────────────────────────────────────────────────────────────
  /** 3.13-3.14: akṣajyā and lambajyā from the palabhā, over the equinoctial hypotenuse √(144 + palabhā²). */
  function aksha(pb) { const k = Math.sqrt(GNOMON * GNOMON + pb * pb); return { karna: k, akshajya: R * pb / k, lambajya: R * GNOMON / k }; }
  const signedJya = (deg) => Math.sign(deg) * S.jyaOfArcmin(Math.min(5400, Math.abs(deg) * 60));
  const arcOf = (x) => S.arcminOfJya(Math.min(R, Math.abs(x))) / 60;
  /** 3.34-3.36: the śaṅku (R-sine of the altitude) of a body of declination δ° at hour angle `nataAsus` from the meridian:
   *  antyā = R + carajyā; less the versed sine of the hour angle; × dyujyā ÷ R × lambajyā ÷ R. */
  function shanku(deltaDeg, nataAsus, pb) {
    const { lambajya } = aksha(pb), kj = signedJya(deltaDeg), dj = U.dyujya(kj);
    const antya = R + kj * pb / 12 * R / dj;                                                       // 2.61, 3.34
    const n = Math.abs(nataAsus) / 60;
    const utkrama = n <= 90 ? R - S.jyaOfArcmin((90 - n) * 60) : R + S.jyaOfArcmin(Math.min(5400, (n - 90) * 60));
    return (antya - utkrama) * dj / R * lambajya / R;                                              // 3.35-3.36
  }
  /** The hypotenuse of the shadow of the 12-aṅgula gnomon for a śaṅku: 12 R ÷ śaṅku (3.36 "chāyākarṇau pūrvavat"). */
  const karnaOfShanku = (sh) => (sh > 0 ? GNOMON * R / sh : null);
  /** The Moon's midday shadow hypotenuse: zenith distance at the meridian = akṣa − declination (3.17), its śaṅku the sine
   *  of the complement. */
  function madhyahnaKarna(deltaDeg, pb) {
    const phi = arcOf(aksha(pb).akshajya) * Math.sign(pb);
    return karnaOfShanku(S.jyaOfArcmin(Math.min(5400, Math.max(0, 90 - Math.abs(phi - deltaDeg)) * 60)));
  }
  /** 10.6-10.8, 10.10-10.14, 10.15. `st`: sun, moon (tropical degrees), moonLatArcmin, palabha; karna "madhyahna" (the
   *  words of 10.7, default) or "tatkala" (the Moon's shadow at the moment [reading]; needs moonNataAsus). The figure is
   *  the Sun on the horizon and the Moon above it: in the bright half at sunset in the west; in the dark half at sunrise
   *  in the east, where the bāhu is laid to the left hand (north lies on the left facing east: "vāmaṃ bhujaṃ") and the
   *  western part of the disc is the dark one [reading of 10.15]. bāhu > 0 is southward: the Moon south of the Sun, and
   *  then the northern horn stands higher. */
  function shringonnati(st, opts = {}) {
    const { sun, moon, moonLatArcmin = 0, palabha } = st;
    const dark = st.half ? st.half === "krishna" : mod(moon - sun, 360) > 180;
    const ref = sun;
    const dRef = U.kranti(ref), dMoon = U.kranti(moon) + moonLatArcmin / 60;                       // 2.28; 2.58
    const diff = dMoon - dRef;                                                                     // 10.6: alike → difference, else sum
    const jya = signedJya(diff);                                                                   // north + : the Moon north of the Sun
    // default: the hypotenuse of the moment (the figure's geometry; never the wrong horn in 2026) — "madhyahna" is the
    // words of 10.7; without an hour angle the midday one is the only one there is
    const rule = opts.karna === "madhyahna" || typeof st.moonNataAsus !== "number" ? "madhyahna" : "tatkala";
    const karna = rule === "tatkala" ? karnaOfShanku(shanku(dMoon, st.moonNataAsus, palabha)) : madhyahnaKarna(dMoon, palabha);
    if (karna === null) return null;
    const { akshajya, lambajya } = aksha(palabha);
    const remainder = GNOMON * akshajya - jya * karna;                                             // 10.7
    const bahu = remainder / lambajya, koti = GNOMON, shruti = Math.sqrt(bahu * bahu + koti * koti); // 10.8
    const tilt = arcOf(Math.abs(bahu) * R / shruti);                                               // 10.14 by 2.33
    return { half: dark ? "krishna" : "shukla", reference: ref, declination: { reference: dRef, moon: dMoon, difference: diff }, jya, karna, karnaRule: rule,
      remainder, bahu, bahuDirection: bahu > 0 ? "south" : bahu < 0 ? "north" : null, koti, shruti, tiltDeg: tilt,
      elevatedHorn: bahu > 0 ? "north" : bahu < 0 ? "south" : "level", laidTo: dark ? "vāma — the left hand, facing east (10.15)" : "sva-dik — its own direction, facing west (10.8)",
      source: "SS 10.6-10.8, 10.10-10.14" + (dark ? ", 10.15" : "") };
  }
  /** 10.9, 10.15: the bright part in twelfths of the disc — (Moon − Sun)′ ÷ 900 in the bright half; in the dark half the
   *  dark part is (Moon − (Sun + 180°))′ ÷ 900. × the disc in aṅgulas ÷ 12 when `bimbaAngula` is given. Linear in the
   *  elongation, by the words. */
  function illumination(sun, moon, opts = {}) {
    const E = mod(moon - sun, 360), b = opts.bimbaAngula;
    if (E <= 180) { const sukla = E * 60 / NAVASHATA; return { half: "shukla", elongation: E, suklaTwelfths: sukla, asitaTwelfths: 12 - sukla, fraction: sukla / 12, suklaAngula: typeof b === "number" ? sukla * b / 12 : null, source: "SS 10.9" }; }
    const asita = mod(moon - (sun + 180), 360) * 60 / NAVASHATA;
    return { half: "krishna", elongation: E, suklaTwelfths: 12 - asita, asitaTwelfths: asita, fraction: (12 - asita) / 12, asitaAngula: typeof b === "number" ? asita * b / 12 : null, source: "SS 10.15 with 10.9" };
  }

  function build(P, Ut) {
  const placesOf = (t) => P.placesAt(t);
  const ayanOf = (t, opts) => P.ayanamshaAt(t, opts);
  const palabhaOfSite = (site) => (typeof site.palabha === "number" ? site.palabha : U.palabhaOf(site.latitude));
  const bhukti = (t, body) => wrap180(placesOf(t + 0.5)[body] - placesOf(t - 0.5)[body]) * 60;           // minutes a day
  const civil = (N) => K.civilFromKaliDay(N, "gregorian");
  const checkSite = (site) => { if (!site || typeof site.latitude !== "number" || typeof site.deshantara !== "number") throw new TypeError("ss-drishya: site needs { latitude, deshantara }"); };

  /** The text's sunrise ("rise") or sunset ("set") of civil day N: the true Sun's hour angle — the mean Sun's turn from
   *  midnight at the place, with the bhujāntara (mean − true, 2.46) — equal to minus or plus its half-day (2.61-2.63).
   *  `sunrise: "ascension"` uses the true Sun's right ascension by the Laṅkā risings (3.42-3.43) instead. A function
   *  `opts.sunEvent(N, site, kind)` replaces both. */
  function sunEvent(N, site, kind, opts = {}) {
    if (typeof opts.sunEvent === "function") return opts.sunEvent(N, site, kind, opts);
    checkSite(site);
    const pb = palabhaOfSite(site), lanka = opts.sunrise === "ascension" ? U.risings(0, opts) : null;
    let t = N + (kind === "rise" ? 0.25 : 0.75) - site.deshantara / 360;
    for (let i = 0; i < 12; i++) {
      const p = placesOf(t), A = ayanOf(t, opts), sun = mod(p.sun + A, 360);
      const shift = lanka ? wrap180(p.mean.sun + A - U.ascension(sun, lanka) / 60) : wrap180(p.mean.sun - p.sun);
      const H = 360 * mod(t + site.deshantara / 360, 1) - 180 + shift;
      const half = U.halfDay(sun, pb) / 60;
      const step = wrap180((kind === "rise" ? -half : half) - H) / 360;
      t += step;
      if (Math.abs(step) < 1e-10) break;
    }
    return t;
  }
  /** Sunrise and sunset of day N with the Sun's sāyana place and motion at each (9.4). */
  function solarDay(N, site, opts = {}) {
    const out = { N };
    for (const [side, kind] of [["east", "rise"], ["west", "set"]]) {
      const t = sunEvent(N, site, kind, opts), A = ayanOf(t, opts), p = placesOf(t);
      out[side] = { t, A, sun: mod(p.sun + A, 360), sunBhukti: bhukti(t, "sun") };
    }
    return out;
  }
  const solarDays = (t1, t2, site, opts) => { const out = []; for (let N = Math.floor(t1); N < t2; N++) out.push(solarDay(N, site, opts)); return out; };

  /** Visibility of a planet (9.2-9.11) on each morning and evening in [t1, t2), and the days its state changes.
   *  bodyAt(t) → { lambda (sidereal degrees), latArcmin (north +), bhukti (minutes a day, negative when retrograde),
   *  retrograde? }. opts.planet: "mars" | "jupiter" | "saturn" | "venus" | "mercury" | "moon" (or opts.limits). Each event:
   *  side, kind (udaya | asta), the first morning/evening in the new state, its kālāṃśa and limit, the 9.10 estimate
   *  made from the morning/evening before, and whether 9.2-9.3 foretold that phenomenon. */
  function planetPhenomena(bodyAt, t1, t2, site, opts = {}) {
    checkSite(site);
    const planet = opts.planet, pb = palabhaOfSite(site), rs = U.risings(pb, opts), near = opts.near || 60;
    const solar = opts.solar || solarDays(t1, t2, site, opts);
    const days = solar.filter((d) => d.N >= Math.floor(t1) && d.N < t2).map((sd) => {
      const day = { N: sd.N };
      for (const side of ["east", "west"]) {
        const s = sd[side], g = bodyAt(s.t), lam = mod(g.lambda + s.A, 360), lat = g.latArcmin || 0;
        const retro = typeof g.retrograde === "boolean" ? g.retrograde : g.bhukti < 0;
        const drk = U.drkkarma(lam, lat, pb, side).lambda;                                       // 9.4, 7.8-7.10 (for 9.10-9.11)
        const k = bodyKalamsa(lam, lat, s.sun, pb, rs, side, opts), limit = planetLimit(planet, retro, opts.limits);
        const own = ownDrk(opts);
        const kgSun = own ? kalagatiOwn(s.sunBhukti, sunHorizon(s.sun, pb, side)) : kalagati(s.sunBhukti, s.sun, rs, side);
        const kgBody = own ? kalagatiOwn(g.bhukti, (dl) => U.bodyHorizonAsus(lam + dl, lat, pb, side)) : kalagati(g.bhukti, drk, rs, side);
        const greater = wrap180(lam - s.sun) > 0;
        day[side] = { t: s.t, lambda: lam, drk, kalamsa: k, limit, visible: k >= limit, retrograde: retro, greater,
          pending: pending(planet, retro, greater, g.bhukti < s.sunBhukti, opts), kalagati: { sun: kgSun, body: kgBody }, ...daysToLimit(k, limit, kgSun, kgBody, side) };
      }
      return day;
    });
    const events = [];
    for (const side of ["east", "west"]) for (let i = 1; i < days.length; i++) {
      const a = days[i - 1][side], b = days[i][side];
      if (a.visible === b.visible || Math.abs(a.kalamsa) > near || Math.abs(b.kalamsa) > near) continue;
      const kind = b.visible ? "udaya" : "asta", seen = b.visible ? b : a;                    // 9.2-9.3 read on the day it is seen
      events.push({ planet, side, kind, phenomenon: PHENOMENON[side][kind], N: days[i].N, civil: civil(days[i].N), at: b.t, kalamsa: b.kalamsa, limit: b.limit,
        before: { N: days[i - 1].N, kalamsa: a.kalamsa, limit: a.limit }, estimate: a.t + a.days, estimateDays: a.days, retrograde: b.retrograde,
        foretold: seen.pending.side === side && seen.pending.kind === kind, rule: seen.pending.verse });
    }
    events.sort((x, y) => x.at - y.at);
    return { planet, events, days, drk: ownDrk(opts) ? "own" : "aksa", source: "SS 9.2-9.11; horizon " + (ownDrk(opts) ? "by each body's own declination and cara (2.58, 2.61-2.63, 3.42)" : "by 7.8-7.10 and 3.42-3.45") };
  }

  /** A junction star (9.12-9.18): { name, dhruvaka (sidereal degrees), vikshepa (degrees, north +), kalamsa? }. Each
   *  morning and evening in [t1, t2): its kālāṃśa from the Sun with the ākṣa dṛkkarma; the heliacal setting in the west
   *  (first evening with fewer kālāṃśa than the limit) and rising in the east (first morning with as many); the 9.17
   *  estimate (Sun's kālagati only) from the day before; and whether it was seen every day (9.18). */
  function starPhenomena(star, t1, t2, site, opts = {}) {
    checkSite(site);
    const L = typeof star.kalamsa === "number" ? star.kalamsa : STAR_KALAMSA[star.name];
    if (typeof L !== "number") return { name: star.name, limit: null, events: [], note: "9.12-9.15 give this star no kālāṃśa" };
    const pb = palabhaOfSite(site), rs = U.risings(pb, opts), solar = opts.solar || solarDays(t1, t2, site, opts);
    const days = solar.filter((d) => d.N >= Math.floor(t1) && d.N < t2).map((sd) => {
      const day = { N: sd.N };
      for (const side of ["east", "west"]) {
        const s = sd[side], dh = mod(star.dhruvaka + s.A, 360), drk = starDrk(dh, star.vikshepa, pb, side, opts);
        const k = starKalamsa(dh, star.vikshepa, s.sun, pb, rs, side, opts);
        const kgSun = ownDrk(opts) ? kalagatiOwn(s.sunBhukti, sunHorizon(s.sun, pb, side)) : kalagati(s.sunBhukti, s.sun, rs, side);
        day[side] = { t: s.t, drk, kalamsa: k, visible: k >= L, kshetramsa: kshetramsa(L, drk, rs, side), ...daysToLimit(k, L, kgSun, 0, side) };
      }
      // lost (9.9): short of the limit on both horizons while near the Sun; far from it a star is up at night either way
      day.lost = !day.east.visible && !day.west.visible && Math.min(Math.abs(day.east.kalamsa), Math.abs(day.west.kalamsa)) < 90;
      return day;
    });
    const events = [];
    for (const side of ["east", "west"]) for (let i = 1; i < days.length; i++) {
      const a = days[i - 1][side], b = days[i][side];
      if (a.visible === b.visible || Math.abs(a.kalamsa) > 60 || Math.abs(b.kalamsa) > 60) continue;
      const kind = b.visible ? "udaya" : "asta";
      events.push({ name: star.name, side, kind, phenomenon: PHENOMENON[side][kind], N: days[i].N, civil: civil(days[i].N), at: b.t, kalamsa: b.kalamsa,
        before: { N: days[i - 1].N, kalamsa: a.kalamsa }, estimate: a.t + a.days, estimateDays: a.days,
        foretold: (side === "west" && kind === "asta") || (side === "east" && kind === "udaya"), rule: "9.17" });
    }
    events.sort((x, y) => x.at - y.at);
    return { name: star.name, limit: L, dhruvaka: star.dhruvaka, vikshepa: star.vikshepa, events,
      setting: events.find((e) => e.side === "west" && e.kind === "asta") || null, rising: events.find((e) => e.side === "east" && e.kind === "udaya") || null,
      neverLost: days.every((d) => !d.lost), lostDays: days.filter((d) => d.lost).length, days: opts.keepDays ? days : undefined, drk: ownDrk(opts) ? "own" : "aksa",
      source: "SS 9.12-9.17; horizon " + (ownDrk(opts) ? "by the star's own declination and cara (ch.8 polar place, 2.58, 2.61-2.63)" : "by 7.8-7.9 (ākṣa)" + (opts.starAyana ? " and 7.10" : "")) };
  }
  /** Every star of a list over [t1, t2) with one table of sunrises and sunsets. */
  function starsPhenomena(stars, t1, t2, site, opts = {}) {
    const solar = opts.solar || solarDays(t1, t2, site, opts);
    return stars.map((s) => starPhenomena(s, t1, t2, site, { ...opts, solar }));
  }

  // ── the Moon: 10.1 (east), 10.4/10.5, the horns ─────────────────────────────────────────────────────
  /** The Moon's sāyana place, latitude and both motions at t. */
  function luni(t, opts) {
    const p = placesOf(t), A = ayanOf(t, opts);
    return { sun: mod(p.sun + A, 360), moon: mod(p.moon + A, 360), moonLatArcmin: p.moonLatitude * 60, sunBhukti: bhukti(t, "sun"), moonBhukti: bhukti(t, "moon") };
  }
  /** 10.5: in the dark half, the asus from sunset to moonrise — from the Sun + half a revolution (the point rising at
   *  sunset) to the Moon's eastern dṛk-place — both advanced by their motions for those asus and recomputed until they
   *  stop changing (as 10.3-10.4). Within a degree or so of opposition the Moon's dṛk-place can lie behind that point:
   *  the asus are then negative, the Moon having risen just before sunset. */
  function moonriseAfterSunset(st, opts) {
    const { sun, moon, moonLatArcmin, sunBhukti, moonBhukti, palabha } = st, rs = U.risings(palabha, opts);
    const nearOpposition = mod(moon - sun, 360) < 270;          // then more than half a turn means "behind", not "next morning"
    const own = ownDrk(opts);
    const at = (s, m) => {
      const x = own ? mod(U.bodyHorizonAsus(m, moonLatArcmin, palabha, "east") - U.horizonAsus(s, U.kranti(s), palabha, "west"), TURN)
        : U.intervalAsus(s + 180, U.drkkarma(m, moonLatArcmin, palabha, "east").lambda, rs);
      return nearOpposition && x > HALF_TURN ? x - TURN : x;
    };
    const first = at(sun, moon);
    let asus = first, steps = 0;
    for (; steps < 30; steps++) {
      const n = asus / GHATI, next = at(sun + sunBhukti * n / 3600, moon + moonBhukti * n / 3600);
      if (Math.abs(next - asus) < 1e-9) { asus = next; break; }
      asus = next;
    }
    return { firstAsus: first, moonriseAfterSunsetAsus: asus, moonriseAfterSunsetGhati: asus / GHATI, steps };
  }
  /** The Moon at the text's sunset of day N: in the bright half its setting after sunset (10.2-10.4), in the dark half its
   *  rising after sunset (10.5). Times in days since the Kali epoch. */
  function moonAtSunset(N, site, opts = {}) {
    const set = sunEvent(N, site, "set", opts), st = { ...luni(set, opts), palabha: palabhaOfSite(site) };
    const E = mod(st.moon - st.sun, 360);
    if (E <= 180) { const r = U.moonAfterSunset(st, opts); return { N, sunset: set, half: "shukla", elongation: E, moonset: set + r.moonsetAfterSunsetAsus / GHATI * P.NADI_DAYS, ghati: r.moonsetAfterSunsetGhati, kalamsa: r.kalamsa, source: "SS 10.2-10.4" }; }
    const r = moonriseAfterSunset(st, opts);
    return { N, sunset: set, half: "krishna", elongation: E, moonrise: set + r.moonriseAfterSunsetAsus / GHATI * P.NADI_DAYS, ghati: r.moonriseAfterSunsetGhati,
      beforeSunset: r.moonriseAfterSunsetAsus < 0, steps: r.steps, source: "SS 10.5" };
  }
  /** 10.1, east ("prāg yāty adṛśyatām"): before each amāvāsyā in [t1, t2), the last morning on which the Moon rises at
   *  least 12 kālāṃśa before the Sun, with the mornings tried. */
  function lastMorningCrescent(t1, t2, site, opts = {}) {
    checkSite(site);
    const pb = palabhaOfSite(site), rs = U.risings(pb, opts), out = [];
    let conj = P.syzygyNear(t1, 0, +1);
    while (conj !== null && conj < t2) {
      const mornings = [];
      for (let N = Math.floor(conj + site.deshantara / 360) + 1; N >= Math.floor(conj) - 6 && mornings.length < 5; N--) {
        const rise = sunEvent(N, site, "rise", opts); if (rise >= conj) continue;
        const st = luni(rise, opts), k = bodyKalamsa(st.moon, st.moonLatArcmin, st.sun, pb, rs, "east", opts);
        mornings.push({ N, sunrise: rise, hoursBeforeConjunction: (conj - rise) * 24, kalamsa: k, visible: k >= MOON_KALAMSA });
        if (k >= MOON_KALAMSA) break;
      }
      const last = mornings.find((m) => m.visible) || null;
      out.push({ amavasya: conj, last, N: last && last.N, civil: last && civil(last.N), mornings, source: "SS 10.1 (12 kālāṃśa, east), 9.5, 7.8-7.10; the text's sunrise" });
      conj = P.syzygyNear(conj + 25, 0, +1);
    }
    return out;
  }
  /** Utsava.candraDarshana (10.1-10.4, west) run on the text's sunset, beside the last morning (10.1, east): for each
   *  amāvāsyā, the nights the Moon is unseen. */
  function lunarVisibility(t1, t2, site, opts = {}) {
    const UtText = Ut.withPanchanga(Object.freeze(Object.assign({}, P, { sunset: (N, s, o) => sunEvent(N, s, "set", o), sunrise: (N, s, o) => sunEvent(N, s, "rise", o) })));
    const west = UtText.candraDarshana(t1, t2, site, opts), east = lastMorningCrescent(t1, t2, site, opts);
    return east.map((e) => {
      const w = west.find((x) => Math.abs(x.amavasya - e.amavasya) < 1) || null;
      const first = w && w.first;
      return { amavasya: e.amavasya, lastMorning: e.last, firstEvening: first, lastCivil: e.civil, firstCivil: w && w.civil,
        unseenDays: e.last && first ? first.sunset - e.last.sunrise : null, source: "SS 10.1 both horizons" };
    });
  }
  /** The horns and the bright part on day N: in the bright half at the text's sunset (the Moon in the west), in the dark
   *  half at the text's sunrise (the Moon in the east). The Moon's hour angle for the "tatkala" karṇa: the Sun's (± its
   *  half-day) less the difference of right ascensions by the Laṅkā risings of the Sun and of the Moon's polar place
   *  (7.10's āyana part). */
  function hornsOn(N, site, opts = {}) {
    const pb = palabhaOfSite(site), lanka = U.risings(0, opts);
    let t = sunEvent(N, site, "set", opts), st = luni(t, opts);
    let dark = mod(st.moon - st.sun, 360) > 180;
    if (dark) { t = sunEvent(N, site, "rise", opts); st = luni(t, opts); dark = mod(st.moon - st.sun, 360) > 180; if (!dark) return null; }
    const dMoon = U.kranti(st.moon) + st.moonLatArcmin / 60;
    const sunNata = (dark ? -1 : 1) * U.halfDay(st.sun, pb);                                     // asus, west +
    const polar = st.moon + U.drkkarma(st.moon, st.moonLatArcmin, pb, "west").ayanaArcmin / 60;
    const moonNataAsus = opts.ascension === "risings" ? sunNata - signedAsus(U.ascension(polar, lanka) - U.ascension(st.sun, lanka))
      : sunNata - signedAsus(U.rightAscension(polar) - U.rightAscension(st.sun));             // 3.42 at the point
    const horns = opts.karna === "madhyahna" ? "madhyahna" : "tatkala";
    const base = { ...st, palabha: pb, moonNataAsus, half: dark ? "krishna" : "shukla" };
    return { N, civil: civil(N), at: t, moment: dark ? "sunrise" : "sunset", elongation: mod(st.moon - st.sun, 360), moonNataAsus,
      moonShanku: shanku(dMoon, moonNataAsus, pb), madhyahna: shringonnati(base, { karna: "madhyahna" }), tatkala: shringonnati(base, { karna: "tatkala" }),
      horns: shringonnati(base, { karna: horns }),
      illumination: illumination(st.sun, st.moon, opts) };
  }

  return Object.freeze({ panchanga: P, withPanchanga: (p, ut) => build(p, ut || Ut0.withPanchanga(p)),
    sine: S.sine || "table", withSine: (name) => ssDrishyaOf(S.withSine(name), U.withSine(name), P0.withSine(name), Ut0.withSine(name), K),
    R, SIXTY, SIGN_ARC, NAVASHATA, GNOMON, MOON_KALAMSA, PLANET_KALAMSA, NAKSHATRA_28, STAR_GROUPS, STAR_KALAMSA, NEVER_LOST, PHENOMENON,
    planetLimit, dhruvakaOf, starsOf, signOf, kalamsa, bodyKalamsa, starKalamsa, kalagati, daysToLimit, kshetramsa, starDrk, pending, aksha, shanku, madhyahnaKarna,
    shringonnati, illumination, sunEvent, solarDay, solarDays, planetPhenomena, starPhenomena, starsPhenomena, luni, moonriseAfterSunset,
    moonAtSunset, lastMorningCrescent, lunarVisibility, hornsOn });
  }
  return build(P0, Ut0);
});
