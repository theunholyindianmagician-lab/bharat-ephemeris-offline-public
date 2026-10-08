/* ss-chaya.js — छाया: the Sūrya-Siddhānta's shadow chain (chapter 3, tripraśna — direction, place and time) by the text's
 * own arithmetic — the 24 sines on R = 3438 with linear interpolation (2.17-2.22), the versed sines that are those sines
 * read backwards (2.23-2.27), the greatest declination's sine 1397 (2.28) — and the vedha record that reduces the owner's
 * own shadows. No spherical trigonometry: every arc comes from the table, every root is the text's mūla or pada.
 *
 *   3.1-3.4     a levelled slab, a circle, the gnomon at its centre; the tips of the forenoon and afternoon shadows on the
 *               circle are west and east; the fish-figure gives north-south, then east-west and the corners.
 *               `pracyaparaSkew`: how far that line is turned when the declination moves between the two marks.
 *   3.5-3.7     the shadow is read in aṅgulas; an east-west line through the tip of the equinoctial shadow; a shadow tip's
 *               distance from that line is the agrā.
 *   3.8         karṇa = √(śaṅku² + chāyā²); chāyā = √(karṇa² − śaṅku²); the śaṅku by the reverse.
 *   3.11-3.12a  the true Sun agrees with sight at the solstice and the two equinoxes; when the computed Sun (karaṇāgata) is
 *               less than the shadow-Sun (chāyārka) the circle has moved east by the difference; west when it is more.
 *   3.12b-3.14a the equinoctial noon shadow, on the north-south line, is the palabhā; R × śaṅku and R × palabhā ÷ the
 *               equinoctial hypotenuse are the lambajyā and the akṣajyā; their arcs, co-latitude and latitude, "always south".
 *   3.14b-3.15a noon: R × the shadow ÷ its own hypotenuse, as an arc, is the nata — north when the shadow is south, south when
 *               it is north ("dakṣiṇe bhuje uttarāḥ, uttare yāmyāḥ").
 *   3.15b-3.16a nata and the Sun's declination, added when unlike, differenced when alike, are the latitude.
 *   3.16b-3.17a akṣajyā from the latitude; lambajyā = √(R² − akṣajyā²); palabhā = 12 × akṣajyā ÷ lambajyā.
 *   3.17b-3.18a latitude and nata, the difference when alike, the sum when unlike: the declination; its sine × R ÷ 1397,
 *   3.18b-3.19  as an arc, is the Sun from Meṣa; from Karka take it from 180°, from Tulā add 180°, from Makara take it from
 *               360°: the true (sāyana) Sun at noon. The quadrant is the observer's to know (the season), not the shadow's.
 *   3.20a       its manda equation applied in reverse, again and again ("asakṛd vāmam"): the mean Sun.
 *   3.20b-3.22a latitude and declination, the sum when alike, the difference otherwise: the noon nata; its sine and cosine
 *               (koṭijyā) give the noon shadow 12 × sine ÷ koṭijyā and hypotenuse 12 × R ÷ koṭijyā.
 *   3.22b-3.25a the Sun's agrā = krāntijyā × the equinoctial hypotenuse ÷ the śaṅku-sine; × any hypotenuse ÷ the noon one is
 *               that shadow's own; with the palabhā it gives the bhuja, the tip's distance from the east-west line; at noon
 *               the bhuja is the shadow.
 *   3.25b-3.27a on the prime vertical: lambajyā × palabhā ÷ krāntijyā = akṣajyā × 12 ÷ krāntijyā is the hypotenuse; when the
 *               declination is north and less than the latitude, so is the noon hypotenuse × palabhā ÷ the noon agrā.
 *   3.27b-3.28a agrājyā = krāntijyā × R ÷ lambajyā; × a hypotenuse ÷ R is the agrā in aṅgulas.
 *   3.28b-3.34a the corner gnomon: karaṇī = (R²/2 − agrājyā²) × 12 × 12 ÷ (palabhā² + 12²/2); phala = 12 × palabhā ×
 *               agrājyā ÷ the same; śaṅku = √(phala² + karaṇī) ∓ phala (south, north); dṛgjyā = √(R² − śaṅku²); shadow and
 *               hypotenuse = 12 × dṛgjyā and 12 × R, each ÷ the śaṅku.
 *   3.34b-3.36  any hour: antyā = R + carajyā for a northern declination, R − carajyā for a southern one (NOT √(R² − krāntijyā²));
 *               cheda = (antyā − utkramajyā of the nata) × dyujyā ÷ R; śaṅku = cheda × lambajyā ÷ R; shadow as before.
 *   3.37-3.39   the reverse: dṛgjyā = R × shadow ÷ hypotenuse; śaṅku = √(R² − dṛgjyā²); cheda = śaṅku × R ÷ lambajyā;
 *               unnatajyā = cheda × R ÷ dyujyā; antyā − unnatajyā is a versed sine whose arc is the nata in asus.
 *   3.40-3.41a any shadow: krāntijyā = lambajyā × agrā ÷ hypotenuse (both in aṅgulas); × R ÷ 1397 → the Sun by quadrant.
 *   3.41b-3.42a three tips (forenoon, noon, afternoon), two fish-figures, a thread through the three: the shadow's path
 *               (bhā-bhrama) — a circle by construction; its distance from the path is measured in the test.
 *   2.59        the Sun's own day = 21,600 asus of the turn + its daily motion × the rising of its sign ÷ 1800: how a kapāla
 *               count of the turn becomes asus of the Sun's hour angle.
 * Signs: arcs north of the zenith or of the equator are positive. A northern place only (3.14: the akṣa is "always south").
 * Longitudes are sāyana (3.10: declination, shadow and half-day come from the place corrected by the ayanāṃśa); the
 * karaṇāgata Sun of 3.11 is sphuta.js's sidereal Sun. The text's arithmetic is not the sphere's: the test measures how far.
 * Requires sphuta.js (the table, the Sun), ss-udaya.js (2.28, 2.60-2.63, 3.44) and kala-dvara.js (days, the yuga's counts).
 * Browser: window.SSChaya (needs Sphuta, SSUdaya, KalaDvara); node: module.exports.
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory(require("./sphuta.js"), require("./ss-udaya.js"), require("./kala-dvara.js"));
  else root.SSChaya = factory(root.Sphuta, root.SSUdaya, root.KalaDvara);
})(typeof globalThis !== "undefined" ? globalThis : this, function ssChayaOf(S, U, K) {
  "use strict";
  const R = S.R, PARAMA = U.PARAMA, SHANKU = 12, QUARTER = 5400, TURN = 21600, HALF = 10800;      // 3.2: twelve aṅgulas
  const ASU_PER_GHATI = 360, ASU_PER_VINADI = 6;                                                 // 1.11
  const mod = (a, m) => ((a % m) + m) % m;
  const wrap180 = (a) => mod(a + 180, 360) - 180;
  const arcOf = (x) => S.arcminOfJya(Math.min(R, Math.abs(x)));                                 // 2.33, minutes of |x|
  const signedArc = (x) => (x < 0 ? -1 : 1) * arcOf(x);
  const jyaMin = (m) => S.jya(m / 60);                                                           // signed sine of an arc in minutes
  const root2 = (x) => Math.sqrt(Math.max(0, x));                                                // mūla / pada

  // ── 2.23-2.27: the versed sines ──────────────────────────────────────────────────────────────
  /** 2.23-2.27: the utkramajyā of an arc of 0…10,800′. The text's versed sines are R minus its sines read backwards
   *  (ss-numbers.test.js proves it from the words), so interpolating them is R − jyā(90° − x); past 90° it is R + jyā(x − 90°). */
  function utkramajya(m) {
    if (!(m >= 0 && m <= HALF)) throw new RangeError("ss-chaya: a versed sine is taken of 0…180°");
    return m <= QUARTER ? R - S.jyaOfArcmin(QUARTER - m) : R + S.jyaOfArcmin(m - QUARTER);
  }
  /** 3.39 "utkramajyābhiḥ": the arc in minutes (0…10,800) of a versed sine 0…2R. */
  function arcOfUtkramajya(v) {
    const x = Math.min(2 * R, Math.max(0, v));
    return x <= R ? QUARTER - S.arcminOfJya(R - x) : QUARTER + S.arcminOfJya(x - R);
  }

  // ── 3.8: gnomon, shadow, hypotenuse ──────────────────────────────────────────────────────────
  /** 3.8: karṇa = √(śaṅku² + chāyā²). */
  const karna = (chaya, shanku = SHANKU) => Math.sqrt(shanku * shanku + chaya * chaya);
  /** 3.8: chāyā = √(karṇa² − śaṅku²). */
  const chayaOfKarna = (k, shanku = SHANKU) => root2(k * k - shanku * shanku);
  /** 3.8 "śaṅkur viparyayāt": śaṅku = √(karṇa² − chāyā²). */
  const shankuOfKarna = (k, chaya) => root2(k * k - chaya * chaya);

  // ── 3.12b-3.17a: the place ───────────────────────────────────────────────────────────────────
  /** 3.12b-3.14a: from the palabhā (aṅgulas of the 12-aṅgula gnomon): the equinoctial hypotenuse (3.8), lambajyā =
   *  R × 12 ÷ it, akṣajyā = R × palabhā ÷ it, and their arcs (minutes): co-latitude and latitude. */
  function akshaOfPalabha(palabha) {
    if (!(palabha >= 0 && Number.isFinite(palabha))) throw new RangeError("ss-chaya: a northern place has a palabhā ≥ 0 (3.14: the akṣa is always south)");
    const aksakarna = karna(palabha);
    const lambajya = R * SHANKU / aksakarna, aksajya = R * palabha / aksakarna;
    const akshaArcmin = arcOf(aksajya), lambaArcmin = arcOf(lambajya);
    return { palabha, aksakarna, aksajya, lambajya, akshaArcmin, lambaArcmin, latitude: akshaArcmin / 60 };
  }
  /** 3.16b-3.17a: from the latitude (degrees): akṣajyā by the table, lambajyā = √(R² − akṣajyā²), palabhā = 12 × akṣajyā ÷
   *  lambajyā, and the equinoctial hypotenuse 12 × R ÷ lambajyā (3.13 read backwards). */
  function palabhaOfLatitude(latitude) {
    if (!(latitude >= 0 && latitude < 90)) throw new RangeError("ss-chaya: a northern latitude, 0 ≤ φ < 90°");
    const aksajya = S.jya(latitude), lambajya = Math.sqrt(R * R - aksajya * aksajya);
    return { latitude, aksajya, lambajya, palabha: SHANKU * aksajya / lambajya, aksakarna: SHANKU * R / lambajya };
  }

  // ── 3.14b-3.19: the noon shadow read backwards ─────────────────────────────────────────────────
  const dirSign = (dir) => { if (dir !== "N" && dir !== "S") throw new RangeError('ss-chaya: a shadow points "N" or "S"'); return dir === "N" ? 1 : -1; };
  /** 3.14b-3.15a: the noon nata (signed minutes, north +) from the noon shadow and where it points. The hypotenuse is the
   *  shadow's own (3.8) unless `opts.karna` gives it. North when the shadow is south, south when it is north. */
  function nataOfNoonShadow(chaya, dir, opts) {
    const k = (opts && opts.karna) || karna(chaya);
    const natajya = R * chaya / k;
    const m = arcOf(natajya);
    return { karna: k, natajya, nataArcmin: -dirSign(dir) * m };
  }
  /** 3.15b-3.16a: the latitude (minutes) from a noon shadow and the Sun's declination (signed minutes). The text adds
   *  them when unlike and differences them when alike; signed, the akṣa (south, so −φ) = nata − declination. */
  function latitudeFromNoon(chaya, dir, krantiArcmin, opts) {
    const n = nataOfNoonShadow(chaya, dir, opts);
    const latitudeArcmin = krantiArcmin - n.nataArcmin;
    if (!(latitudeArcmin >= 0)) throw new RangeError("ss-chaya: this shadow and declination put the place south of the equator");
    return { ...n, krantiArcmin, latitudeArcmin, ...palabhaOfLatitude(latitudeArcmin / 60) };
  }
  /** 3.17b-3.18a: the Sun's declination (signed minutes) from the noon shadow at a place of the given palabhā: latitude
   *  (south) and nata, the difference when alike, the sum when unlike; signed, declination = nata + latitude. */
  function krantiFromNoon(chaya, dir, palabha, opts) {
    const a = akshaOfPalabha(palabha), n = nataOfNoonShadow(chaya, dir, opts);
    const krantiArcmin = n.nataArcmin + a.akshaArcmin;
    return { ...n, akshaArcmin: a.akshaArcmin, krantiArcmin, krantijya: jyaMin(krantiArcmin) };
  }
  /** 3.18b: the Sun's arc from Meṣa in the first quadrant (degrees, 0…90) from its declination's sine: arc(|krāntijyā| × R ÷
   *  1397). A sine past 1397 (an observation beyond the greatest declination) is held at 90° and flagged. */
  function bhujaOfKrantijya(krantijya) {
    const x = Math.abs(krantijya) * R / PARAMA;
    return { degrees: arcOf(x) / 60, beyondParama: x > R };
  }
  /** 3.19: the quadrant from the declination's direction and the ayana (whether the Sun is going north, "uttara", or south,
   *  "dakshina"): 0 Meṣa…Mithuna, 1 Karka…Kanyā, 2 Tulā…Dhanu, 3 Makara…Mīna. */
  function quadrantOf(krantiSign, ayana) {
    if (ayana !== "uttara" && ayana !== "dakshina") throw new RangeError('ss-chaya: ayana is "uttara" or "dakshina"');
    if (krantiSign >= 0) return ayana === "uttara" ? 0 : 1;
    return ayana === "dakshina" ? 2 : 3;
  }
  /** 3.19: the first-quadrant arc placed in its quadrant: as it is; from 180°; plus 180°; from 360°. */
  const inQuadrant = (b, q) => mod([b, 180 - b, 180 + b, 360 - b][q], 360);
  /** The Sun (sāyana degrees) from its declination's sine, by 3.18b-3.19. opts: quadrant (0-3), or ayana, or near (a
   *  longitude: the nearer of the two candidates with this declination). Returns both candidates: the shadow alone
   *  cannot tell λ from 180° − λ. */
  function sunFromKrantijya(krantijya, opts) {
    const o = opts || {}, b = bhujaOfKrantijya(krantijya), north = krantijya >= 0;
    const candidates = north ? [inQuadrant(b.degrees, 0), inQuadrant(b.degrees, 1)] : [inQuadrant(b.degrees, 2), inQuadrant(b.degrees, 3)];
    let q;
    if (o.quadrant !== undefined) q = o.quadrant;
    else if (o.ayana !== undefined) q = quadrantOf(north ? 1 : -1, o.ayana);
    else if (o.near !== undefined) {
      const d = candidates.map((c) => Math.abs(wrap180(c - o.near)));
      q = (north ? 0 : 2) + (d[1] < d[0] ? 1 : 0);
    } else throw new RangeError("ss-chaya: 3.19 needs the quadrant: give quadrant, ayana or near");
    return { lambda: inQuadrant(b.degrees, q), quadrant: q, bhuja: b.degrees, beyondParama: b.beyondParama, candidates };
  }
  /** 3.14b-3.19: the chāyārka — the true sāyana Sun at noon from the noon shadow at a place of the given palabhā. */
  function chayarka(chaya, dir, palabha, opts) {
    const k = krantiFromNoon(chaya, dir, palabha, opts);
    return { ...k, ...sunFromKrantijya(k.krantijya, opts) };
  }

  // ── 3.20a: the mean Sun from the true ──────────────────────────────────────────────────────────
  /** 3.20a: the mean Sun (sidereal degrees) from the true sidereal Sun: the manda equation of 2.29-2.45 (kendra = mandocca −
   *  planet, the epicycle 14° at the even ends and 13°40′ at the odd, varying by 2.38) taken in reverse and again, until it
   *  stops changing. `mandocca` in degrees (sphuta.js: mean.sunApogee). */
  function meanFromTrue(trueSid, mandocca, opts) {
    const pair = (opts && opts.pair) || S.PARIDHI.sun, tol = (opts && opts.tol) || 1e-11;
    let mean = mod(trueSid, 360), phala = 0, steps = 0;
    while (steps < 60) {
      phala = S.mandaPhala(mean, mandocca, pair).degrees;
      const next = mod(trueSid - phala, 360);
      steps++;
      const moved = Math.abs(wrap180(next - mean));
      mean = next;
      if (moved < tol) break;
    }
    return { mean, phala, steps };
  }

  // ── 3.20b-3.28a: the noon shadow, the agrā and the prime vertical, forward ─────────────────────
  /** 3.20b-3.22a: the noon shadow of the Sun at sāyana λ: the declination by 2.28 on the table; nata = latitude (south) and
   *  declination combined; chāyā = 12 × jyā(nata) ÷ koṭijyā, karṇa = 12 × R ÷ koṭijyā; the shadow points away from the Sun. */
  function noonShadow(lam, palabha) {
    const a = akshaOfPalabha(palabha);
    const krantijya = U.krantiJya(lam), krantiArcmin = signedArc(krantijya);
    const nataArcmin = krantiArcmin - a.akshaArcmin, z = Math.abs(nataArcmin);
    if (z >= QUARTER) throw new RangeError("ss-chaya: the Sun is not above the horizon at noon here");
    const bahujya = S.jyaOfArcmin(z), kotijya = S.jyaOfArcmin(QUARTER - z);
    return { krantijya, krantiArcmin, nataArcmin, bahujya, kotijya, chaya: SHANKU * bahujya / kotijya, karna: SHANKU * R / kotijya, dir: nataArcmin > 0 ? "S" : "N" };
  }
  /** 3.22b-3.25a and 3.27b-3.28a: the agrā. agrājyā = krāntijyā × R ÷ lambajyā (3.27b; 3.22b with the śaṅku read as 12 gives
   *  the same as krāntijyā × the equinoctial hypotenuse ÷ 12). 3.22b-3.23a read with the noon śaṅku-sine: the noon agrā in
   *  aṅgulas = krāntijyā × the equinoctial hypotenuse ÷ the noon koṭijyā, and any shadow's own = that × its hypotenuse ÷ the
   *  noon hypotenuse; 3.28a: agrājyā × hypotenuse ÷ R. The bhuja (north +) = palabhā − agrā (3.23b-3.24): the tip's distance
   *  from the east-west line through the gnomon. `karna` defaults to the noon hypotenuse (3.25a: then the bhuja is the shadow). */
  function agra(lam, palabha, karnaIshta) {
    const a = akshaOfPalabha(palabha), noon = noonShadow(lam, palabha), kj = noon.krantijya;
    const agrajya = kj * R / a.lambajya;
    const agrajyaB = kj * a.aksakarna / SHANKU;
    const madhyagra = kj * a.aksakarna / noon.kotijya;
    const k = karnaIshta === undefined ? noon.karna : karnaIshta;
    const angula = agrajya * k / R;
    return { krantijya: kj, agrajya, agrajyaB, madhyagra, noonKarna: noon.karna, karna: k, angula, angulaViaNoon: madhyagra * k / noon.karna, bhuja: palabha - angula };
  }
  /** 3.25b-3.27a: the hypotenuse when the Sun is on the prime vertical, three ways; null unless the declination is north and
   *  less than the latitude ("saumyākṣonā krāntiḥ"), the only case in which the Sun crosses it above the horizon. */
  function samamandala(lam, palabha) {
    const a = akshaOfPalabha(palabha), noon = noonShadow(lam, palabha), kj = noon.krantijya;
    if (!(kj > 0 && noon.krantiArcmin < a.akshaArcmin)) return null;
    const byLamba = a.lambajya * palabha / kj, byAksha = a.aksajya * SHANKU / kj;
    const madhyagra = agra(lam, palabha).madhyagra, byNoon = noon.karna * palabha / madhyagra;
    const k = byLamba;
    return { karna: k, byLamba, byAksha, byNoon, chaya: chayaOfKarna(k), shanku: R * SHANKU / k };
  }

  // ── 3.28b-3.34a: the corner gnomon ─────────────────────────────────────────────────────────────
  /** 3.28b-3.34a: the Sun in an intermediate direction. karaṇī = (R²/2 − agrājyā²) × 12 × 12 ÷ (12²/2 + palabhā²); phala =
   *  12 × palabhā × agrājyā ÷ the same; the śaṅku (a sine, R-units) = √(phala² + karaṇī) less the phala for a southern
   *  declination, plus it for a northern; dṛgjyā = √(R² − śaṅku²); shadow and hypotenuse 12 × dṛgjyā, 12 × R, ÷ śaṅku.
   *  `corners` says which pair it falls in (3.32): the Sun's north component agrājyā − palabhā × śaṅku ÷ 12. */
  function konaShanku(lam, palabha) {
    const a = akshaOfPalabha(palabha), kj = U.krantiJya(lam), ag = kj * R / a.lambajya;
    const divisor = SHANKU * SHANKU / 2 + palabha * palabha;
    const karani = (R * R / 2 - ag * ag) * SHANKU * SHANKU / divisor;
    const phala = SHANKU * palabha * Math.abs(ag) / divisor;
    const disc = phala * phala + karani;
    if (disc < 0) return null;
    const shanku = Math.sqrt(disc) + (ag >= 0 ? phala : -phala);
    if (!(shanku > 0)) return null;
    const drgjya = root2(R * R - shanku * shanku);
    return { krantijya: kj, agrajya: ag, divisor, karani, phala, shanku, drgjya, chaya: SHANKU * drgjya / shanku, karna: SHANKU * R / shanku,
      corners: ag - palabha * shanku / SHANKU > 0 ? "north" : "south" };
  }

  // ── 3.34b-3.39: any hour, and back ─────────────────────────────────────────────────────────────
  /** 2.60-2.61, 3.34b: the krāntijyā, dyujyā, carajyā (signed: north +) and antyā = R + carajyā of the Sun at sāyana λ. */
  function dina(lam, palabha) {
    const krantijya = U.krantiJya(lam), dyujya = U.dyujya(krantijya);
    const carajya = (krantijya * palabha / SHANKU) * R / dyujya;
    return { krantijya, dyujya, carajya, antya: R + carajya };
  }
  /** 3.34b-3.36: the śaṅku and shadow when the Sun is `natAsus` from the meridian (east −, west +; asus of the Sun's own
   *  day, 1′ of its hour angle each). cheda = (antyā − utkramajyā(nata)) × dyujyā ÷ R; śaṅku = cheda × lambajyā ÷ R. Below
   *  the horizon the śaṅku is ≤ 0 and the shadow is Infinity. */
  function shadowAt(lam, palabha, natAsus) {
    const a = akshaOfPalabha(palabha), d = dina(lam, palabha), n = Math.abs(natAsus);
    const vers = utkramajya(Math.min(n, HALF));
    const cheda = (d.antya - vers) * d.dyujya / R;
    const shanku = cheda * a.lambajya / R;
    const drgjya = root2(R * R - shanku * shanku);
    const up = shanku > 0;
    return { ...d, lambajya: a.lambajya, natAsus, utkramajya: vers, cheda, shanku, drgjya, above: up,
      chaya: up ? SHANKU * drgjya / shanku : Infinity, karna: up ? SHANKU * R / shanku : Infinity };
  }
  /** The tip of that shadow on the slab, in aṅgulas from the gnomon's foot: north = the bhuja (3.23b-3.24, with the agrā of
   *  3.28a); east = the rest of the shadow by 3.8's rule, pointing west in the forenoon and east in the afternoon. */
  function shadowTip(lam, palabha, natAsus) {
    const s = shadowAt(lam, palabha, natAsus);
    if (!s.above) return null;
    const north = agra(lam, palabha, s.karna).bhuja;
    const ew = root2(s.chaya * s.chaya - north * north);
    return { ...s, north, east: natAsus < 0 ? -ew : ew };
  }
  /** 3.37-3.39: the nata (asus from the meridian) from a shadow measured at a place of the given palabhā on a day the Sun
   *  is at sāyana λ: dṛgjyā = R × shadow ÷ hypotenuse; śaṅku = √(R² − dṛgjyā²); cheda = śaṅku × R ÷ lambajyā; unnatajyā =
   *  cheda × R ÷ dyujyā; the arc of the versed sine antyā − unnatajyā is the nata. A shadow shorter than this arithmetic's
   *  noon shadow (an observation near noon, or a declination that is off) gives nata 0 and `shorterThanNoon` (R-units). */
  function nataFromShadow(chaya, lam, palabha, opts) {
    const a = akshaOfPalabha(palabha), d = dina(lam, palabha);
    const k = (opts && opts.karna) || karna(chaya);
    const drgjya = R * chaya / k, shanku = root2(R * R - drgjya * drgjya);
    const cheda = shanku * R / a.lambajya, unnatajya = cheda * R / d.dyujya;
    const vers = d.antya - unnatajya;
    const natAsus = arcOfUtkramajya(vers);
    return { ...d, karna: k, drgjya, shanku, cheda, unnatajya, utkramajya: vers, natAsus, natGhati: natAsus / ASU_PER_GHATI,
      shorterThanNoon: vers < 0 ? -vers : 0 };
  }
  /** The asus of the Sun's own day from its rising to a measured shadow: the half-day (2.62-2.63) less the nata in the
   *  forenoon ("purva"), plus it in the afternoon ("pashcima"). */
  function sinceSunriseFromShadow(chaya, lam, palabha, side) {
    if (side !== "purva" && side !== "pashcima") throw new RangeError('ss-chaya: side is "purva" (forenoon) or "pashcima"');
    const n = nataFromShadow(chaya, lam, palabha), half = U.halfDay(lam, palabha);
    return { ...n, halfDay: half, sinceSunrise: side === "purva" ? half - n.natAsus : half + n.natAsus };
  }

  // ── 3.40-3.42a: the Sun from any shadow; the shadow's path ─────────────────────────────────────
  /** 3.40-3.41a: the Sun from any shadow: krāntijyā = lambajyā × agrā ÷ hypotenuse (aṅgulas); × R ÷ 1397 → the arc, placed
   *  by quadrant (3.19; `opts` as for sunFromKrantijya). The agrā (north +) is the tip's distance from the east-west line
   *  through the equinoctial shadow's tip: palabhā − bhuja, with the bhuja measured north + from the gnomon's line (3.23-3.24). */
  function sunFromAgra(agraAngula, chaya, palabha, opts) {
    const a = akshaOfPalabha(palabha), k = (opts && opts.karna) || karna(chaya);
    const krantijya = a.lambajya * agraAngula / k;
    return { karna: k, krantijya, krantiArcmin: signedArc(krantijya), ...sunFromKrantijya(krantijya, opts) };
  }
  /** 3.41b-3.42a: the circle through three marked tips {east, north} by two fish-figures: the perpendicular bisectors of the
   *  two chords meet at the centre; the thread from it through the three is the bhā-bhrama. */
  function bhabhrama(p1, p2, p3) {
    const a1 = p2.east - p1.east, b1 = p2.north - p1.north, c1 = (p2.east * p2.east - p1.east * p1.east + p2.north * p2.north - p1.north * p1.north) / 2;
    const a2 = p3.east - p2.east, b2 = p3.north - p2.north, c2 = (p3.east * p3.east - p2.east * p2.east + p3.north * p3.north - p2.north * p2.north) / 2;
    const det = a1 * b2 - a2 * b1;
    if (Math.abs(det) < 1e-12) return null;                                         // three tips on a line: the equinox (3.7)
    const east = (c1 * b2 - c2 * b1) / det, north = (a1 * c2 - a2 * c1) / det;
    return { east, north, radius: Math.hypot(p1.east - east, p1.north - north) };
  }
  /** 3.1-3.3: the east-west line from the two tips that meet a circle of radius r aṅgulas, the Sun at sāyana λ at noon and
   *  moving `motion` minutes a day. Each mark's time comes from 3.37-3.39, its tip from shadowTip; between the marks the
   *  declination moves, the two bhujas differ and the line is turned. Returns the tips and the turn in minutes (+ when the
   *  east end lies north of true east); null when the noon shadow is already longer than r (the tip never meets the circle). */
  function pracyaparaSkew(lam, palabha, r, motion) {
    const first = nataFromShadow(r, lam, palabha);
    if (first.shorterThanNoon > 0 || first.natAsus === 0) return null;
    const n0 = first.natAsus;
    const tip = (sign) => {
      let l = lam + sign * motion * n0 / TURN / 60, n = n0;
      for (let i = 0; i < 3; i++) { n = nataFromShadow(r, l, palabha).natAsus; l = lam + sign * motion * n / TURN / 60; }
      return shadowTip(l, palabha, sign * n);
    };
    const w = tip(-1), e = tip(1);
    const dn = e.north - w.north, chord = Math.hypot(e.east - w.east, dn);
    return { west: { east: w.east, north: w.north }, east: { east: e.east, north: e.north }, turnArcmin: signedArc(R * dn / chord) };
  }

  // ── 2.59, 3.11-3.12a: the clock and the ayanāṃśa ───────────────────────────────────────────────
  /** 2.59: the Sun's own day in asus of the turn: 21,600 + its daily motion (minutes) × the Laṅkā rising of its sign ÷ 1800
   *  (3.44's stated 1670, 1795, 1935; `{ stated: false }` for those computed from 1397). Laṅkā's, because the nata is
   *  counted from the meridian [reading]. */
  function svahoratraAsus(lam, gati, opts) {
    const rs = U.risings(0, { stated: !(opts && opts.stated === false) });
    return TURN + gati * rs[Math.min(11, Math.floor(mod(lam, 360) / 30))] / 1800;
  }
  /** Asus of the turn (a kapāla calibrated on a star, kala-dvara.js) → asus of the Sun's hour angle, by 2.59. */
  const turnToSunAsus = (asus, lam, gati, opts) => asus * TURN / svahoratraAsus(lam, gati, opts);
  /** 3.11-3.12a: the observed ayanāṃśa = chāyārka − karaṇāgata (degrees): the circle has moved east by it when the
   *  computed Sun is less than the shadow-Sun, west when more. */
  function ayanamshaFromShadow(chayarkaDeg, karanagataDeg) {
    const d = wrap180(chayarkaDeg - karanagataDeg);
    return { ayanamsha: d, moved: d > 0 ? "east" : d < 0 ? "west" : "none" };
  }

  // ── the vedha record ───────────────────────────────────────────────────────────────────────────
  const FORMAT = "vedha-chaya/1";
  const COMMON = ["id", "kind", "day", "observer", "note", "synthetic", "generator"];
  const KINDS = Object.freeze({
    madhyahna: ["chaya", "dir", "ayana"],                       // the noon shadow (3.14b-3.20)
    vishuvat: ["chaya", "dir", "which"],                        // the equinox day's noon shadow (3.11, 3.12b-3.14a)
    ayananta: ["which", "chaya", "dir"],                        // the solstice day (3.11)
    ishta: ["chaya", "kapala", "side", "bhuja", "calibration"], // a shadow at a kapāla time from sunrise (3.37-3.41a)
    kapala: ["star", "count"],                                  // the bowl between two transits of one star (1.12, 13.23)
  });
  const TOP = ["format", "site", "shanku", "records"];
  const SITE = ["name", "deshantara", "palabha", "latitude"];
  const DAY = ["kali", "calendar", "year", "month", "day"];
  const KAPALA = ["ghati", "vinadi", "prana"];
  const VALUE = ["angula", "vyangula"];
  const BHUJA = ["value", "dir"];
  const only = (obj, keys, where) => {
    if (obj === null || typeof obj !== "object" || Array.isArray(obj)) throw new TypeError(`vedha: ${where} must be an object`);
    for (const k of Object.keys(obj)) if (!keys.includes(k)) throw new RangeError(`vedha: ${where} has a field "${k}" this format does not take (only ${keys.join(", ")})`);
  };
  /** An aṅgula reading: a number, or { angula, vyangula } with 60 vyaṅgula to the aṅgula (JM p.36, "duṣkarā"). */
  function angulaOf(v, where) {
    if (typeof v === "number") { if (!(v >= 0 && Number.isFinite(v))) throw new RangeError(`vedha: ${where} must be ≥ 0 aṅgula`); return v; }
    only(v, VALUE, where);
    const a = v.angula || 0, b = v.vyangula || 0;
    if (!(a >= 0 && b >= 0 && b < 60)) throw new RangeError(`vedha: ${where} needs angula ≥ 0 and 0 ≤ vyangula < 60`);
    return a + b / 60;
  }
  /** A kapāla count { ghati, vinadi, prana } → asus (1 ghaṭī = 60 vināḍī = 360 prāṇa, SS 1.11). */
  function asusOf(c, where) {
    only(c, KAPALA, where);
    const g = c.ghati || 0, v = c.vinadi || 0, p = c.prana || 0;
    if (![g, v, p].every((x) => Number.isFinite(x) && x >= 0)) throw new RangeError(`vedha: ${where} must be non-negative`);
    return g * ASU_PER_GHATI + v * ASU_PER_VINADI + p;
  }
  /** The civil day: { kali } (days since the Kali epoch) or { calendar, year, month, day } (kala-dvara.js). */
  function kaliDayOf(d, where) {
    only(d, DAY, where);
    if (d.kali !== undefined) { if (!Number.isInteger(d.kali)) throw new TypeError(`vedha: ${where}.kali must be an integer`); return d.kali; }
    return K.kaliDayFromCivil({ calendar: d.calendar, year: d.year, month: d.month, day: d.day });
  }
  /** Checks a whole file's shape: only the fields named in corpus/vedha/README.md, in the owner's units. Throws on the first fault. */
  function validate(file) {
    only(file, TOP, "the file");
    if (file.format !== FORMAT) throw new RangeError(`vedha: format must be "${FORMAT}"`);
    const site = file.site || {};
    only(site, SITE, "site");
    if (site.latitude !== undefined && !(typeof site.latitude === "number" && site.latitude >= 0 && site.latitude < 90)) throw new RangeError("vedha: site.latitude is northern degrees, 0 ≤ φ < 90");
    if (site.deshantara !== undefined && !(typeof site.deshantara === "number" && Math.abs(site.deshantara) <= 180)) throw new RangeError("vedha: site.deshantara is degrees, east +");
    if (site.palabha !== undefined) angulaOf(site.palabha, "site.palabha");
    if (file.shanku !== undefined && !(typeof file.shanku === "number" && file.shanku > 0)) throw new RangeError("vedha: shanku is the gnomon's height, > 0");
    if (!Array.isArray(file.records)) throw new TypeError("vedha: records must be a list");
    const ids = new Set();
    for (const r of file.records) {
      const where = `record ${r && r.id}`;
      if (!r || typeof r.id !== "string" || !r.id) throw new TypeError("vedha: every record needs an id");
      if (ids.has(r.id)) throw new RangeError(`vedha: id ${r.id} is used twice`);
      ids.add(r.id);
      if (!KINDS[r.kind]) throw new RangeError(`vedha: ${where} has an unknown kind "${r.kind}" (${Object.keys(KINDS).join(", ")})`);
      only(r, [...COMMON, ...KINDS[r.kind]], where);
      if (r.synthetic !== undefined && typeof r.synthetic !== "boolean") throw new TypeError(`vedha: ${where}.synthetic is true or false`);
      if (r.synthetic && !r.generator) throw new RangeError(`vedha: ${where} is synthetic and must say what generated it`);
      if (r.kind !== "kapala") kaliDayOf(r.day, `${where}.day`);
      if (["madhyahna", "vishuvat", "ishta"].includes(r.kind)) angulaOf(r.chaya, `${where}.chaya`);
      if (["madhyahna", "vishuvat"].includes(r.kind)) dirSign(r.dir);
      if (r.kind === "madhyahna" && r.ayana !== undefined && r.ayana !== "uttara" && r.ayana !== "dakshina") throw new RangeError(`vedha: ${where}.ayana is "uttara" or "dakshina"`);
      if (r.kind === "vishuvat" && r.which !== "mesha" && r.which !== "tula") throw new RangeError(`vedha: ${where}.which is "mesha" or "tula"`);
      if (r.kind === "ayananta" && r.which !== "karka" && r.which !== "makara") throw new RangeError(`vedha: ${where}.which is "karka" or "makara"`);
      if (r.kind === "ayananta" && r.chaya !== undefined) { angulaOf(r.chaya, `${where}.chaya`); dirSign(r.dir); }
      if (r.kind === "ishta") {
        asusOf(r.kapala, `${where}.kapala`);
        if (r.side !== "purva" && r.side !== "pashcima") throw new RangeError(`vedha: ${where}.side is "purva" or "pashcima"`);
        if (r.calibration !== undefined && r.calibration !== "nakshatra" && r.calibration !== "savana") throw new RangeError(`vedha: ${where}.calibration is "nakshatra" or "savana"`);
        if (r.bhuja !== undefined) { only(r.bhuja, BHUJA, `${where}.bhuja`); angulaOf(r.bhuja.value, `${where}.bhuja.value`); dirSign(r.bhuja.dir); }
      }
      if (r.kind === "kapala") { if (typeof r.star !== "string" || !r.star) throw new TypeError(`vedha: ${where}.star names the star`); asusOf(r.count, `${where}.count`); }
    }
    return true;
  }

  const stats = (xs) => (xs.length ? { n: xs.length, mean: xs.reduce((a, b) => a + b, 0) / xs.length, min: Math.min(...xs), max: Math.max(...xs) } : { n: 0 });
  /** The text's Sun at Kali day t: karaṇāgata (sidereal), its mean and mandocca, the text's ayanāṃśa (3.9-3.10), and the
   *  daily motion in minutes (true place a day apart). */
  function textSun(t) {
    const p = S.sphutaAtDays(t), A = S.ayanamshaSS(S.spandasOfDays(t));
    const gati = wrap180(S.sphutaAtDays(t + 0.5).sun - S.sphutaAtDays(t - 0.5).sun) * 60;
    return { karanagata: p.sun, mean: p.mean.sun, mandocca: p.mean.sunApogee, ayanamsha: A, sayana: mod(p.sun + A, 360), gati };
  }

  /** Reduces a vedha file (corpus/vedha/README.md) to what the shadows say, every derived number tagged [measured].
   *  opts.ayanamsha: for the declination an "ishta" shadow is timed with — "text" (3.9-3.10, the default), "observed" (the
   *  mean of this file's noon ayanāṃśas) or a number of degrees. Noon is the local mean noon of the record's day, Kali day
   *  + ½ − deśāntara ÷ 360 (the equation of time, ≤ 16 minutes, moves the Sun ≤ 0.7′ and is not applied). */
  function reduce(file, opts) {
    validate(file);
    const o = opts || {}, site = file.site || {}, g = file.shanku || SHANKU, scale = SHANKU / g;
    const deshantara = site.deshantara || 0, out = [], warnings = [];
    const recs = file.records, synthetic = recs.some((r) => r.synthetic);
    const tag = "[measured]";
    const noonOf = (r) => kaliDayOf(r.day, r.id) + 0.5 - deshantara / 360;
    const sh = (v, where) => angulaOf(v, where) * scale;

    // the place: the owner's own palabhā or latitude (the dhruva), else the equinox shadows (3.12b-3.14a)
    const eq = recs.filter((r) => r.kind === "vishuvat").map((r) => sh(r.chaya, r.id) * (r.dir === "N" ? 1 : -1));
    let palabha, palabhaFrom;
    if (site.palabha !== undefined) { palabha = angulaOf(site.palabha, "site.palabha") * scale; palabhaFrom = "site.palabha"; }
    else if (site.latitude !== undefined) { palabha = palabhaOfLatitude(site.latitude).palabha; palabhaFrom = "site.latitude (3.16b-3.17a)"; }
    else if (eq.length) { palabha = eq.reduce((a, b) => a + b, 0) / eq.length; palabhaFrom = `the mean of ${eq.length} equinox noon shadow(s) (3.12b-3.13a)`; }
    else throw new RangeError("vedha: no place — give site.palabha or site.latitude (the dhruva), or a vishuvat record");
    const place = akshaOfPalabha(palabha);

    // the bowl: sinkings between two transits of one star; 60 ghaṭīs if true (1.12, 13.23)
    const cal = recs.filter((r) => r.kind === "kapala").map((r) => asusOf(r.count, r.id));
    const kapala = cal.length ? { tag, n: cal.length, turnAsus: cal.reduce((a, b) => a + b, 0) / cal.length } : null;
    if (kapala) { kapala.rate = TURN / kapala.turnAsus; kapala.driftGhati = (kapala.turnAsus - TURN) / ASU_PER_GHATI; }

    const base = (r, t) => ({ id: r.id, kind: r.kind, tag, synthetic: !!r.synthetic, t, ...(() => { const s = textSun(t); return { karanagata: s.karanagata, textAyanamsha: s.ayanamsha, textSayana: s.sayana, textMean: s.mean, mandocca: s.mandocca, gati: s.gati }; })() });
    const fromSun = (b, lam) => {                                                     // 3.11-3.12a and 3.20a from a shadow-Sun
      const ay = ayanamshaFromShadow(lam, b.karanagata);
      const mean = meanFromTrue(lam - b.textAyanamsha, b.mandocca);
      return { chayarka: lam, ayanamsha: ay.ayanamsha, moved: ay.moved, sunResidualArcmin: wrap180(lam - b.textSayana) * 60,
        meanFromShadow: mean.mean, meanResidualArcmin: wrap180(mean.mean - b.textMean) * 60, reverseMandaSteps: mean.steps };
    };
    for (const r of recs) {
      if (r.kind === "kapala") { out.push({ id: r.id, kind: r.kind, tag, synthetic: !!r.synthetic, turnAsus: asusOf(r.count, r.id), driftGhati: (asusOf(r.count, r.id) - TURN) / ASU_PER_GHATI }); continue; }
      const t0 = noonOf(r);
      if (r.kind === "ayananta") {                                                    // 3.11: at the solstice the Sun is at Karka 0 or Makara 0
        const b = base(r, t0);
        out.push({ ...b, ...fromSun(b, r.which === "karka" ? 90 : 270), resolution: "the solstice day only: the noon shadow barely moves for days around it" });
        continue;
      }
      if (r.kind === "madhyahna" || r.kind === "vishuvat") {
        const b = base(r, t0), chaya = sh(r.chaya, r.id);
        const rec = { ...b, chaya, dir: r.dir };
        if (r.kind === "vishuvat") {                                                  // 3.11 at the equinox: Meṣa 0 or Tulā 0, to the day
          rec.palabha = chaya * (r.dir === "N" ? 1 : -1);
          rec.byDay = fromSun(b, r.which === "mesha" ? 0 : 180);
        }
        if (r.kind === "madhyahna" || palabhaFrom.startsWith("site")) {
          const textKranti = signedArc(U.krantiJya(b.textSayana));
          const ayana = r.kind === "vishuvat" ? (r.which === "mesha" ? "uttara" : "dakshina") : r.ayana;
          const sun = chayarka(chaya, r.dir, palabha, ayana ? { ayana } : { near: b.textSayana });
          if (sun.beyondParama) warnings.push(`${r.id}: the shadow gives a declination past 1397 — held at the solstice`);
          const step = chayarka(chaya + 0.125, r.dir, palabha, { quadrant: sun.quadrant });
          Object.assign(rec, { krantiArcmin: sun.krantiArcmin, textKrantiArcmin: textKranti, krantiResidualArcmin: sun.krantiArcmin - textKranti,
            quadrant: sun.quadrant, quadrantFrom: ayana ? "the record's ayana (3.19)" : "the nearer to the text's sāyana Sun (no ayana in the record)",
            candidates: sun.candidates, ...fromSun(b, sun.lambda),
            latitudeWithTextKranti: (() => { try { return latitudeFromNoon(chaya, r.dir, textKranti).latitudeArcmin / 60; } catch (e) { warnings.push(`${r.id}: ${e.message}`); return null; } })(),
            perEighthAngula: { krantiArcmin: Math.abs(step.krantiArcmin - sun.krantiArcmin), lambdaArcmin: Math.abs(wrap180(step.lambda - sun.lambda)) * 60 } });
        }
        out.push(rec);
        continue;
      }
      // ishta: a shadow at a kapāla time from sunrise (3.37-3.39), and the Sun from its agrā when the bhuja is measured (3.40-3.41a)
      const chaya = sh(r.chaya, r.id), reading = asusOf(r.kapala, r.id);
      let b = base(r, t0);
      const ayanamshaFor = (bb) => (typeof o.ayanamsha === "number" ? o.ayanamsha : bb.textAyanamsha);
      let lam = mod(b.karanagata + ayanamshaFor(b), 360);
      const sunAsus = (l, gt) => (r.calibration === "savana" ? reading : turnToSunAsus(reading * (kapala ? kapala.rate : 1), l, gt));
      const H = sunAsus(lam, b.gati) - U.halfDay(lam, palabha);                      // the Sun's hour angle by the bowl, asus
      b = base(r, t0 + H / TURN);
      lam = mod(b.karanagata + ayanamshaFor(b), 360);
      const fromKapala = sunAsus(lam, b.gati);
      const fromShadow = sinceSunriseFromShadow(chaya, lam, palabha, r.side);
      const rec = { ...b, chaya, side: r.side, sayanaUsed: lam, natAsus: fromShadow.natAsus, halfDay: fromShadow.halfDay,
        sinceSunriseByKapala: fromKapala, sinceSunriseByShadow: fromShadow.sinceSunrise,
        timeResidualAsus: fromKapala - fromShadow.sinceSunrise, timeResidualVinadi: (fromKapala - fromShadow.sinceSunrise) / ASU_PER_VINADI };
      if (r.bhuja !== undefined) {
        const bh = sh(r.bhuja.value, r.id) * (r.bhuja.dir === "N" ? 1 : -1);
        const sun = sunFromAgra(palabha - bh, chaya, palabha, { near: b.textSayana });
        Object.assign(rec, { bhuja: bh, agraAngula: palabha - bh, krantiArcmin: sun.krantiArcmin, quadrant: sun.quadrant, ...fromSun(b, sun.lambda) });
      }
      out.push(rec);
    }
    if (o.ayanamsha === "observed") {
      const obs = out.filter((x) => x.kind === "madhyahna" && x.ayanamsha !== undefined).map((x) => x.ayanamsha);
      if (!obs.length) throw new RangeError("vedha: ayanamsha \"observed\" needs madhyahna records");
      const A = obs.reduce((a, b) => a + b, 0) / obs.length;
      return reduce(file, { ...o, ayanamsha: A });
    }
    const pick = (k, key) => out.filter((x) => x.kind === k && x[key] !== undefined).map((x) => x[key]);
    return {
      format: FORMAT, tag, synthetic, warnings,
      site: { tag, palabha, palabhaFrom, latitude: place.latitude, latitudeArcmin: place.akshaArcmin, aksajya: place.aksajya, lambajya: place.lambajya, aksakarna: place.aksakarna, deshantara },
      kapala, records: out,
      summary: {
        ayanamsha: stats(pick("madhyahna", "ayanamsha")),
        sunResidualArcmin: stats(pick("madhyahna", "sunResidualArcmin")),
        krantiResidualArcmin: stats(pick("madhyahna", "krantiResidualArcmin")),
        timeResidualAsus: stats(pick("ishta", "timeResidualAsus")),
        ayanamshaUsedForIshta: typeof o.ayanamsha === "number" ? o.ayanamsha : "text (3.9-3.10)",
      },
    };
  }

  return Object.freeze({
    sine: S.sine || "table", withSine: (name) => ssChayaOf(S.withSine(name), U.withSine(name), K),
    R, PARAMA, SHANKU, FORMAT, KINDS,
    utkramajya, arcOfUtkramajya, karna, chayaOfKarna, shankuOfKarna, akshaOfPalabha, palabhaOfLatitude,
    nataOfNoonShadow, latitudeFromNoon, krantiFromNoon, bhujaOfKrantijya, quadrantOf, sunFromKrantijya, chayarka, meanFromTrue,
    noonShadow, agra, samamandala, konaShanku, dina, shadowAt, shadowTip, nataFromShadow, sinceSunriseFromShadow,
    sunFromAgra, bhabhrama, pracyaparaSkew, svahoratraAsus, turnToSunAsus, ayanamshaFromShadow,
    angulaOf, asusOf, kaliDayOf, validate, textSun, reduce,
  });
});
