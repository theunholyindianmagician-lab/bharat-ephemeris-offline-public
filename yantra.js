/* yantra.js — यन्त्र: the instruments, on the owner's latitude and the text's own Sun.
 *
 * Every instrument here is a factory: give it the owner's place (site = { latitude | palabha, deshantara }) and the
 * owner's own sizes, and it returns (1) its construction for that latitude, (2) its graduation — where each mark goes,
 * in the instrument's own length unit, (3) the reading the text predicts for a Kali day and time, and (4) the inverse:
 * a reading back to the hour angle (ghaṭī and asus), the declination, the altitude and the azimuth, ready for the ledger.
 *
 * THE ARITHMETIC. Only the text's tiers: sphuta.js's R-sine on R = 3438 (Mādhava's by default, the 24-entry table by
 * withSine("table")), its arc (2.33), and the mūla (square root). No spherical trigonometry of the language is called.
 *   - An angle from two legs is the text's bhuja-koṭi-karṇa: the arc of the smaller leg × R ÷ the karṇa (2.33), so that no
 *     arc is ever read where the sine is flat.
 *   - An arc's length on a circle of radius r is r × (minutes) ÷ ρ, where ρ is the radius measured in minutes of its own
 *     arc: Mādhava's 3437′44″48‴ with his sine, the text's 3438 with its table (2.17-2.22: the 24th sine is the radius).
 *     A chord is 2r × jyā(half the arc) ÷ R. No value of the circumference-to-diameter ratio is typed in anywhere.
 *   - The body's direction in the horizon frame (R-units) is the text's own quantities: the śaṅku of 3.34b-3.36 (with
 *     antyā × dyujyā ÷ R written out as dyujyā + kṣitijyā), north = agrājyā − śaṅkutala (3.27b, 3.23b-3.24), and east =
 *     dyujyā × jyā(nata) ÷ R. The inverse is the same rotation by the latitude, through akṣajyā and lambajyā (3.13).
 *
 * THE SKY (the forward model). The Sun is sphuta.js's true Sun, sāyana by the text's ayanāṃśa (3.9-3.10); its declination
 * is 2.28's krānti rule on 1397 (ss-udaya.js); its hour angle is the turn: the meridian's asus (the mean Sun's turn,
 * ss-grahana.js) less the Sun's right ascension by 3.42 at its own point (ss-udaya.js). A junction star (ch.8) is its
 * dhruvaka with the ayanāṃśa (its polar longitude) and its declination with the vikṣepa (2.58, 2.63), as vedha-lekha.js.
 * Time t is the engine's: days since the Kali epoch, midnight at Laṅkā. The place is northern (3.14: the akṣa is south).
 *
 * THE SŪRYA-SIDDHĀNTA'S INSTRUMENTS (chapter 13, the edition's numbering, editions/surya-siddhanta-full-edition.html):
 *   śaṅku        13.20 names it; its whole use is chapter 3 — wrapped from ss-chaya.js                 [text]
 *   kapālaka     13.23: a copper vessel with a hole beneath sinks sixty times in an ahorātra (13.21 names the
 *                kapāla among the time-instruments); one sinking is one nāḍī of the TURN (1.11-1.12)    [text]
 *   gola-yantra  13.3-13.17: the sphere on its axis (13.4), rings of 180 aṅgulas — the degrees as aṅgulas, halved
 *                (13.5) — the diurnal circles at their declinations, halved (13.6-13.7), the ecliptic (13.10-13.12),
 *                the antyā (13.14), the cara (13.15), turned by a flow as the instrument of time's turning (13.16),
 *                with tuṅga and bīja (13.17)                                                             [text; reading]
 *   named only   yaṣṭi, dhanus, cakra, the chāyā-yantras (13.20); toya-yantra, mayūra, nara, vānara, the thread-and-
 *                sand vessels (13.21); nara-yantra (13.24). The verses name them and give no geometry, so none is built.
 *
 * JAI SINGH II'S OBSERVATORIES. No verse of the Yantra-prakāra or the Samrāṭ-siddhānta is available in this repository,
 * so none is quoted; that these are his instruments, and what each was for, is [unverified] here. The geometry of each
 * is derived from the sphere [theorem] and tested against it. No dimension of any real instrument at Jaipur, Delhi or
 * Ujjain is known here: every size is the owner's parameter (DEMO's sizes are "demo, not a measurement").
 *   samrat               gnomon whose hypotenuse lies along the axis; its triangle IS the equinoctial shadow triangle
 *                        12 : palabhā : akṣakarṇa (3.12b-3.13); quadrants in the equator's plane graduated in nata;
 *                        the declination on the hypotenuse at r × tan δ from the quadrants' centre
 *   nadivalaya           a dial in the equator's plane, a pin on each face: the face lit is the gola (the sign of δ),
 *                        the pin's shadow turns with the hour angle
 *   jaya-prakasha        a hemispherical bowl, cross-wires at the rim: the wires' shadow is the sky inverted
 *   kapala-yantra        the same hemisphere [reading]
 *   rama                 a cylinder with a central pillar: altitude on the floor or the wall, azimuth by bearing
 *   digamsha             a circular wall round a pillar: azimuth
 *   shashthamsha         a sixty-degree arc in the meridian under a pinhole: the noon zenith distance and, the
 *                        latitude known, the declination
 *   dakshinottara-bhitti a meridian wall with quadrants under a pin: the meridian altitude
 *   rashivalaya          twelve gnomons, each along the ecliptic's pole at the moment its sign's first point is on the
 *                        meridian: that moment, and the Sun's longitude read straight off its quadrant
 *   unnatamsha           a vertical ring turning on a vertical axis: the altitude
 *
 * THE LEDGER. A reading is written in the instrument's own graduation (a nata in ghaṭī-vināḍī-prāṇa, an arc in
 * aṃśa-kalā-vikalā), never as a modern coordinate. The śaṅku feeds madhyahna / vishuvat / ayananta / ishta, the bowl
 * feeds kapala, a star on the meridian read on the wall or the ring feeds yamyottara (vedha-lekha.js's kinds); every
 * other reading feeds the kind "yantra", which vedha-lekha.js certifies with checkReading and reduces with reduceReading.
 *
 * Requires sphuta.js, kala-dvara.js, ss-udaya.js, ss-chaya.js, ss-grahana.js — the sovereign files only.
 * Browser: window.Yantra (needs Sphuta, KalaDvara, SSUdaya, SSChaya, SSGrahana); node: module.exports.
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory(require("./sphuta.js"), require("./kala-dvara.js"), require("./ss-udaya.js"), require("./ss-chaya.js"), require("./ss-grahana.js"));
  else root.Yantra = factory(root.Sphuta, root.KalaDvara, root.SSUdaya, root.SSChaya, root.SSGrahana);
})(typeof globalThis !== "undefined" ? globalThis : this, function yantraOf(S, K, U, C, G) {
  "use strict";
  const R = S.R, PARAMA = U.PARAMA;                                              // 2.17-2.22, 2.28
  const TURN = 21600, HALF = 10800, QUARTER = 5400, ASU_PER_GHATI = 360, ASU_PER_VINADI = 6, SHANKU = 12;   // 1.11-1.12, 3.2
  /** The radius in minutes of its own arc: Mādhava's 3437′44″48‴ with his sine, the text's 3438 with its table. */
  const RHO = S.sine === "madhava" ? S.MADHAVA_R : R;
  const MANA = K.mana("surya");
  const CIVIL = Number(MANA.savana), TURNS = Number(MANA.nakshatra);
  const ASUS_PER_DAY = TURN * TURNS / CIVIL;                                     // asus of the turn in a civil day (1.34-1.37)
  const ECLIPTIC_POLE_RA = 16200;                                                // 45 ghaṭī: the ecliptic's north pole is on the solstitial colure
  const mod = (a, m) => ((a % m) + m) % m;
  const wrap180 = (a) => mod(a + 180, 360) - 180;
  const wrapAsus = (a) => mod(a + HALF, TURN) - HALF;
  const root2 = (x) => Math.sqrt(Math.max(0, x));                                // mūla
  const isObj = (x) => x !== null && typeof x === "object" && !Array.isArray(x);
  const fin = (x) => typeof x === "number" && Number.isFinite(x);

  // ── the sine tier ──────────────────────────────────────────────────────────────────────────────────
  /** Signed R-sine of an arc in degrees (sphuta.js: Mādhava's, or the table with withSine("table")). */
  const jya = (deg) => S.jya(deg);
  /** The koṭijyā: the R-sine of the complement (the R-cosine). */
  const koti = (deg) => S.jya(90 - deg);
  /** The arc (degrees, 0…90) whose sine is to its cosine as the leg y to the leg x (both ≥ 0): bhuja, koṭi, karṇa = √(y² + x²);
   *  the smaller leg × R ÷ karṇa is taken to its arc (2.33), and the other arc is 90° less it. */
  function arcOfLegs(y, x) {
    const a = Math.abs(y), b = Math.abs(x), k = root2(a * a + b * b);
    if (k === 0) return 0;
    return a <= b ? S.arcminOfJya(Math.min(R, a * R / k)) / 60 : 90 - S.arcminOfJya(Math.min(R, b * R / k)) / 60;
  }
  /** The angle (degrees, 0 ≤ … < 360) of a direction from its component along the zero direction (x) and along the 90°
   *  direction (y), placed by quadrant as 2.29-2.30 place a bhuja. */
  function angleOf(y, x) {
    const b = arcOfLegs(y, x);
    if (x >= 0) return y >= 0 ? b : mod(360 - b, 360);
    return y >= 0 ? 180 - b : 180 + b;
  }
  /** A signed arc in (−90°, 90°): the sign of y, the arc of the legs. */
  const signedArc = (y, x) => (y < 0 ? -1 : 1) * arcOfLegs(y, x);
  /** Length along a circle of radius r of an arc of `arcmin` minutes: r × arcmin ÷ ρ. */
  const arcLength = (r, arcmin) => r * arcmin / RHO;
  /** The minutes of arc that a length along a circle of radius r spans. */
  const arcminOfLength = (r, len) => len * RHO / r;
  /** The chord of an arc of `deg` degrees on radius r: 2r × jyā(deg ÷ 2) ÷ R (signed with the arc). */
  const chord = (r, deg) => 2 * r * jya(deg / 2) / R;
  /** r × tan(deg) by the sine and its koṭi. */
  const tanLength = (r, deg) => r * jya(deg) / koti(deg);

  // ── units: the owner's ─────────────────────────────────────────────────────────────────────────────
  /** Asus → { ghati, vinadi, prana } (prana fractional unless `round`). */
  function kapalaOfAsus(asus, round) {
    let a = Math.max(0, Math.abs(asus));
    if (round) a = Math.round(a);
    const g = Math.floor(a / ASU_PER_GHATI + 1e-12), v = Math.floor((a - g * ASU_PER_GHATI) / ASU_PER_VINADI + 1e-12);
    return { ghati: g, vinadi: v, prana: Math.max(0, a - g * ASU_PER_GHATI - v * ASU_PER_VINADI) };
  }
  /** Degrees → { amsha, kala, vikala } of its magnitude (vikala fractional unless `round`). */
  function arcOfDegrees(deg, round) {
    let s = Math.abs(deg) * 3600;
    if (round) s = Math.round(s);
    const d = Math.floor(s / 3600 + 1e-12), m = Math.floor((s - d * 3600) / 60 + 1e-12);
    return { amsha: d, kala: m, vikala: Math.max(0, s - d * 3600 - m * 60) };
  }
  const ARC = Object.freeze(["amsha", "kala", "vikala"]);
  /** { amsha, kala, vikala } → degrees, refused outside 0 ≤ … ≤ max (or < max when `open`). */
  function degreesOfArc(a, where, max, open) {
    if (!isObj(a)) throw new TypeError(`yantra: ${where} is { amsha, kala, vikala }`);
    for (const k of Object.keys(a)) if (!ARC.includes(k)) throw new RangeError(`yantra: ${where} has a field "${k}" (only ${ARC.join(", ")})`);
    const d = a.amsha || 0, m = a.kala || 0, s = a.vikala || 0;
    if (![d, m, s].every((x) => fin(x) && x >= 0) || m >= 60 || s >= 60) throw new RangeError(`yantra: ${where} needs amsha ≥ 0 and 0 ≤ kala, vikala < 60`);
    const deg = d + m / 60 + s / 3600;
    if (open ? !(deg < max) : !(deg <= max)) throw new RangeError(`yantra: ${where} must be ${open ? "less than" : "at most"} ${max}°`);
    return deg;
  }
  /** A nata { ghati, vinadi, prana } → asus (at most half a turn). */
  function asusOfNata(k, where) {
    const a = C.asusOf(k, where);
    if (!(a <= HALF)) throw new RangeError(`yantra: ${where} is at most 30 ghaṭī from the meridian`);
    return a;
  }

  // ── the place ──────────────────────────────────────────────────────────────────────────────────────
  /** The owner's place: { latitude (degrees, northern) | palabha (aṅgula), deshantara (degrees east of Ujjayinī's meridian) }.
   *  The palabhā by 3.16b-3.17a from a latitude; akṣajyā and lambajyā from the palabhā over the equinoctial hypotenuse (3.13). */
  function placeOf(site) {
    if (!isObj(site)) throw new TypeError("yantra: site is { latitude | palabha, deshantara }");
    const deshantara = site.deshantara === undefined ? 0 : site.deshantara;
    if (!fin(deshantara) || Math.abs(deshantara) > 180) throw new RangeError("yantra: site.deshantara is degrees east, −180…180");
    let palabha;
    if (typeof site.palabha === "number") palabha = site.palabha;
    else if (typeof site.latitude === "number") palabha = C.palabhaOfLatitude(site.latitude).palabha;
    else throw new RangeError("yantra: the place needs site.latitude or site.palabha");
    const a = C.akshaOfPalabha(palabha);
    const latitude = arcOfLegs(a.aksajya, a.lambajya);
    if (!(latitude < 80)) throw new RangeError("yantra: a place below 80° of latitude");
    return Object.freeze({ palabha, aksajya: a.aksajya, lambajya: a.lambajya, aksakarna: a.aksakarna, latitude, deshantara,
      site: Object.freeze({ latitude, palabha, deshantara }) });
  }
  const placeOrSite = (x) => (x && typeof x.lambajya === "number" && typeof x.aksajya === "number" ? x : placeOf(x));

  // ── the sky: the text's Sun and stars, and the frame ───────────────────────────────────────────────
  const ayanamshaAt = (t, o) => (o && typeof o.ayanamsha === "number" ? o.ayanamsha : S.ayanamshaSS(S.spandasOfDays(t)));
  /** The text's Sun at t: its sāyana place (sphuta.js, 3.9-3.10), the sine of its declination (2.28) and its day-radius
   *  (2.60), its right ascension (3.42 at its point), the meridian's asus (the turn, ss-grahana.js) and its hour angle,
   *  nata = meridian − ascension (asus, west +). opts.ayanamsha: degrees in place of the text's. */
  function sunAt(t, site, opts) {
    const place = placeOrSite(site), A = ayanamshaAt(t, opts), p = S.sphutaAtDays(t), lam = mod(p.sun + A, 360);
    const kj = U.krantiJya(lam), dj = U.dyujya(kj), ra = U.rightAscension(lam), mer = G.meridianAsus(t, place, A);
    return { body: "surya", t, ayanamsha: A, lambda: lam, sidereal: p.sun, kj, dj, krantiDeg: U.kranti(lam), raAsus: ra, meridianAsus: mer, natAsus: wrapAsus(mer - ra) };
  }
  function checkStar(star) {
    if (!isObj(star) || typeof star.name !== "string" || !fin(star.dhruvaka) || !fin(star.vikshepa)) throw new TypeError("yantra: a star is { name, dhruvaka, vikshepa } (degrees, ch.8)");
  }
  /** A junction star at t: its polar longitude (dhruvaka + ayanāṃśa), its declination = the polar longitude's with the
   *  vikṣepa (2.58, 2.63), its right ascension (3.42 at its dhruvaka) and its hour angle — as vedha-lekha.js predicts a transit. */
  function starAt(t, star, site, opts) {
    checkStar(star);
    const place = placeOrSite(site), A = ayanamshaAt(t, opts), polar = mod(star.dhruvaka + A, 360);
    const krantiDeg = U.kranti(polar) + star.vikshepa;
    const kj = jya(krantiDeg), dj = koti(krantiDeg), ra = U.rightAscension(polar), mer = G.meridianAsus(t, place, A);
    return { body: star.name, t, ayanamsha: A, lambda: polar, kj, dj, krantiDeg, raAsus: ra, meridianAsus: mer, natAsus: wrapAsus(mer - ra) };
  }
  const stateAt = (t, place, o) => (o && o.star ? starAt(t, o.star, place, o) : sunAt(t, place, o));

  /** A body's direction in the horizon frame, in R-units, from the sine of its declination kj, its day-radius dj and its
   *  nata (asus, west +). up = the śaṅku of 3.34b-3.36 = (kṣitijyā + dyujyā × koṭijyā(nata) ÷ R) × lambajyā ÷ R (the
   *  cheda written out; kṣitijyā 2.61); north = agrājyā − śaṅkutala = kj × R ÷ lambajyā − śaṅku × palabhā ÷ 12 (3.27b,
   *  3.23b-3.24 in R-units); east = −dyujyā × jyā(nata) ÷ R, the body's distance from the meridian plane. */
  function horizonOf(kj, dj, natAsus, site) {
    const place = placeOrSite(site), H = natAsus / 60;
    const kshiti = kj * place.palabha / SHANKU;
    const cheda = kshiti + dj * koti(H) / R;
    const up = cheda * place.lambajya / R;
    const north = kj * R / place.lambajya - up * place.palabha / SHANKU;
    const east = -dj * jya(H) / R;
    return { up, north, east };
  }
  /** The horizon direction (R-units) of an altitude and an azimuth (degrees from the north point through the east). */
  function horizonOfAltAz(unnataDeg, digamshaDeg) {
    const up = jya(unnataDeg), hz = koti(unnataDeg);
    return { up, north: hz * koti(digamshaDeg) / R, east: hz * jya(digamshaDeg) / R };
  }
  /** Altitude (−90…90) and azimuth (0…360 from north through east) of a horizon direction. */
  function altAzOf(h) {
    const horiz = root2(h.north * h.north + h.east * h.east);
    return { unnataDeg: signedArc(h.up, horiz), digamshaDeg: angleOf(h.east, h.north) };
  }
  /** The rotation back by the latitude: R sin δ = (north × lambajyā + up × akṣajyā) ÷ R; R cos δ cos H = (up × lambajyā −
   *  north × akṣajyā) ÷ R; R cos δ sin H = −east. Returns the declination (degrees) and the nata (asus, west +). */
  function equatorialOfHorizon(h, site) {
    const place = placeOrSite(site);
    const axial = (h.north * place.lambajya + h.up * place.aksajya) / R;
    const mer = (h.up * place.lambajya - h.north * place.aksajya) / R;
    const west = -h.east, dj = root2(mer * mer + west * west);
    return { krantiDeg: signedArc(axial, dj), natAsus: wrap180(angleOf(west, mer)) * 60, kj: axial, dj };
  }
  /** Everything an instrument can read of a body in state `st`: the nata, the declination and its gola, the altitude, the
   *  azimuth, the zenith distance and the side of the zenith (disha: the horizon the altitude is read from). */
  function quantitiesOf(st, site) {
    const place = placeOrSite(site), h = horizonOf(st.kj, st.dj, st.natAsus, place), aa = altAzOf(h);
    return { body: st.body, t: st.t, natAsus: st.natAsus, krantiDeg: st.krantiDeg, gola: st.kj >= 0 ? "uttara" : "dakshina",
      unnataDeg: aa.unnataDeg, digamshaDeg: aa.digamshaDeg, natamshaDeg: 90 - aa.unnataDeg, disha: h.north > 0 ? "N" : "S",
      above: h.up > 0, horizon: h, kj: st.kj, dj: st.dj, sphutaDeg: st.lambda };
  }

  // ── instants ───────────────────────────────────────────────────────────────────────────────────────
  /** The instant on civil day N at which the body's nata is `natAsus`: for the Sun, near the text's local noon of day N
   *  (N + ½ − deśāntara ÷ 360); for a star, in the turn that begins six hours after local midnight. */
  function instantOfNata(N, natAsus, site, opts) {
    const place = placeOrSite(site), o = opts || {}, sun = !o.star, at = (t) => stateAt(t, place, o).natAsus;
    const rate = sun ? TURN : ASUS_PER_DAY;
    let t;
    if (sun) t = N + 0.5 - place.deshantara / 360 + natAsus / TURN;
    else { const t0 = N + 0.25 - place.deshantara / 360; t = t0 + mod(natAsus - at(t0), TURN) / ASUS_PER_DAY; }
    for (let i = 0; i < 40; i++) { const d = wrapAsus(natAsus - at(t)); t += d / rate; if (Math.abs(d) < 1e-9) break; }
    return t;
  }
  /** The instant, in the turn that begins six hours after local midnight of day N, at which the meridian's asus are `asus`. */
  function instantOfMeridian(N, asus, site, opts) {
    const place = placeOrSite(site), mer = (t) => G.meridianAsus(t, place, ayanamshaAt(t, opts));
    const t0 = N + 0.25 - place.deshantara / 360;
    let t = t0 + mod(asus - mer(t0), TURN) / ASUS_PER_DAY;
    for (let i = 0; i < 40; i++) { const d = wrapAsus(asus - mer(t)); t += d / ASUS_PER_DAY; if (Math.abs(d) < 1e-9) break; }
    return t;
  }
  /** 3.37-3.39 for any body: the nata (asus, 0…10,800) at which a body of declination-sine kj and day-radius dj stands at
   *  the śaṅku `up` (the R-sine of its altitude): cheda = śaṅku × R ÷ lambajyā; unnatajyā = cheda × R ÷ dyujyā; less the
   *  carajyā = kṣitijyā × R ÷ dyujyā (2.61) it is the koṭijyā of the nata (R − (antyā − unnatajyā)). null when never reached. */
  function nataOfShanku(up, kj, dj, site) {
    const place = placeOrSite(site);
    const cheda = up * R / place.lambajya, kshiti = kj * place.palabha / SHANKU;
    const c = (cheda - kshiti) * R / dj;
    if (!(Math.abs(c) <= R * (1 + 1e-12))) return null;
    return angleOf(root2(R * R - c * c), Math.max(-R, Math.min(R, c))) * 60;
  }
  /** The instant on day N at which the body stands at altitude `unnataDeg` on the given side of the meridian ("purva",
   *  east, before its transit; "pashcima", west). null when it does not reach that altitude. */
  function instantOfUnnata(N, unnataDeg, side, site, opts) {
    if (side !== "purva" && side !== "pashcima") throw new RangeError('yantra: side is "purva" or "pashcima"');
    const place = placeOrSite(site), o = opts || {}, sign = side === "purva" ? -1 : 1, up = jya(unnataDeg);
    let t = instantOfNata(N, 0, place, o);
    for (let i = 0; i < 20; i++) {
      const st = stateAt(t, place, o), n = nataOfShanku(up, st.kj, st.dj, place);
      if (n === null) return null;
      const next = instantOfNata(N, sign * n, place, o);
      const done = Math.abs(next - t) < 1e-12;
      t = next;
      if (done) break;
    }
    return t;
  }
  /** The instant on day N at which the body stands at azimuth `digamshaDeg`: east of the meridian (0° < A < 180°) before
   *  its transit, west after; the nata found by halving on that side, the body's place renewed at each instant found. */
  function instantOfDigamsha(N, digamshaDeg, site, opts) {
    const place = placeOrSite(site), o = opts || {}, sign = mod(digamshaDeg, 360) < 180 ? -1 : 1;
    let t = instantOfNata(N, 0, place, o);
    for (let i = 0; i < 20; i++) {
      const st = stateAt(t, place, o);
      const f = (n) => wrap180(altAzOf(horizonOf(st.kj, st.dj, sign * n, place)).digamshaDeg - digamshaDeg);
      let lo = null, hi = null, prev = f(1e-9), prevN = 1e-9;
      for (let n = 60; n <= HALF; n += 60) {                     // scan the half-turn for the crossing, then halve
        const v = f(n);
        if (Math.sign(v) !== Math.sign(prev) && Math.abs(v - prev) < 180) { lo = prevN; hi = n; break; }
        prev = v; prevN = n;
      }
      if (lo === null) return null;
      const flo = f(lo);
      for (let k = 0; k < 80; k++) { const m = (lo + hi) / 2, v = f(m); if (Math.sign(v) === Math.sign(flo)) lo = m; else hi = m; }
      const next = instantOfNata(N, sign * (lo + hi) / 2, place, o);
      const done = Math.abs(next - t) < 1e-12;
      t = next;
      if (done) break;
    }
    return t;
  }

  // ── the catalogue ──────────────────────────────────────────────────────────────────────────────────
  const SS = "Sūrya-Siddhānta (editions/surya-siddhanta-full-edition.html)";
  const JAI = "the observatories of Sawai Jai Singh II (Jaipur, Delhi, Ujjain, Varanasi, Mathura); no verse of his works is available here";
  const entry = (o) => Object.freeze({ ...o, ledger: Object.freeze(o.ledger.slice()), verses: Object.freeze((o.verses || []).slice()), words: Object.freeze({ ...(o.words || {}) }) });
  const CATALOGUE = Object.freeze([
    entry({ key: "shanku", deva: "शङ्कु", iast: "śaṅku", built: true, factory: "shanku", source: SS, verses: ["13.20"], words: { "13.20": "śaṅku" }, tag: "[text]",
      measures: "the Sun's shadow on a levelled slab: its length and tip in aṅgula; the altitude, the noon nata, the palabhā and the latitude, the declination and the Sun (chapter 3, ss-chaya.js)",
      ledger: ["madhyahna", "vishuvat", "ayananta", "ishta"] }),
    entry({ key: "kapalaka", deva: "कपालक", iast: "kapālaka", built: true, factory: "kapalaka", source: SS, verses: ["13.21", "13.23"], words: { "13.21": "kapāl", "13.23": "kapālakam" }, tag: "[text]",
      measures: "nāḍīs of the turn: sinks sixty times in an ahorātra (13.23; 1.11-1.12); calibrated by its sinkings between two transits of one star",
      ledger: ["kapala"] }),
    entry({ key: "gola", deva: "गोलयन्त्र", iast: "golayantra", built: true, factory: "gola", source: SS, verses: ["13.3", "13.4", "13.5", "13.6", "13.12", "13.14", "13.15", "13.16", "13.17"],
      words: { "13.17": "golayantraṃ", "13.5": "bhagaṇāṃśāṅgulaiḥ", "13.6": "dalitairdakṣiṇottaraiḥ", "13.14": "sāntyābhidhīyate", "13.15": "caradalajyā", "13.16": "kālabhramaṇasādhanam" }, tag: "[text]; [reading] of how the rings are read",
      measures: "a model of the sphere set to the latitude and turned with the turn: the Sun's longitude, declination and ascension on its rings, its diurnal circle, cara and antyā",
      ledger: [] }),
    ...[["yashti", "यष्टि", "yaṣṭi", "13.20", "yaṣṭi", "a staff"], ["dhanus", "धनुस्", "dhanus", "13.20", "dhanuś", "a bow"], ["cakra", "चक्र", "cakra", "13.20", "cakraiś", "a circle"],
      ["chaya-yantra", "छायायन्त्र", "chāyāyantra", "13.20", "chāyāyantrair", "shadow-instruments \"of many kinds\" (anekadhā)"],
      ["toya-yantra", "तोययन्त्र", "toyayantra", "13.21", "toyayantra", "a water-instrument"],
      ["mayura-nara-vanara", "मयूर-नर-वानर", "mayūra-nara-vānara", "13.21", "mayūranaravānaraiḥ", "peacock, man and monkey devices"],
      ["sasutra-renu-garbha", "ससूत्ररेणुगर्भ", "sasūtra-reṇu-garbha", "13.21", "sasūtrareṇugarbhaiś", "vessels holding thread and sand"],
      ["nara-yantra", "नरयन्त्र", "narayantra", "13.24", "narayantraṃ", "the nara-yantra, by day under a clear Sun, \"by the shadow-methods\""]]
      .map(([key, deva, iast, v, w, what]) => entry({ key, deva, iast, built: false, factory: null, source: SS, verses: [v], words: { [v]: w }, tag: "[text] named only",
        measures: `${what}: named among the instruments for time (13.19-13.24); the verse gives no geometry, so none is built`, ledger: [] })),
    entry({ key: "samrat", deva: "सम्राट् यन्त्र", iast: "samrāṭ yantra", built: true, factory: "samrat", source: JAI, tag: "[unverified] attribution; [theorem] geometry",
      measures: "the hour angle (nata) on quadrants in the equator's plane; the declination on the hypotenuse, which lies along the axis", ledger: ["yantra"] }),
    entry({ key: "nadivalaya", deva: "नाडीवलय", iast: "nāḍīvalaya", built: true, factory: "nadivalaya", source: JAI, tag: "[unverified] attribution; [theorem] geometry",
      measures: "the hour angle by the pin's shadow on a dial in the equator's plane; the face lit is the gola, the sign of the declination", ledger: ["yantra"] }),
    entry({ key: "jaya-prakasha", deva: "जयप्रकाश", iast: "jaya prakāśa", built: true, factory: "jayaPrakasha", source: JAI, tag: "[unverified] attribution; [theorem] geometry",
      measures: "a hemispherical bowl under cross-wires: the hour angle and declination, and the altitude and azimuth, of the wires' shadow", ledger: ["yantra"] }),
    entry({ key: "kapala-yantra", deva: "कपाल यन्त्र", iast: "kapāla yantra", built: true, factory: "kapalaYantra", source: JAI, tag: "[unverified] attribution; [reading]: the hemisphere of the Jaya Prakāśa",
      measures: "a hemispherical bowl as the Jaya Prakāśa (the same scales); not the water bowl of SS 13.23, which is the kapālaka", ledger: ["yantra"] }),
    entry({ key: "rama", deva: "राम यन्त्र", iast: "rāma yantra", built: true, factory: "ramaYantra", source: JAI, tag: "[unverified] attribution; [theorem] geometry",
      measures: "a cylinder round a central pillar: the altitude by the pillar-top's shadow on the floor or the wall, the azimuth by its bearing", ledger: ["yantra"] }),
    entry({ key: "digamsha", deva: "दिगंश यन्त्र", iast: "digaṃśa yantra", built: true, factory: "digamshaYantra", source: JAI, tag: "[unverified] attribution; [theorem] geometry",
      measures: "the azimuth, on a circular wall round a pillar", ledger: ["yantra"] }),
    entry({ key: "shashthamsha", deva: "षष्ठांश यन्त्र", iast: "ṣaṣṭhāṃśa yantra", built: true, factory: "shashthamshaYantra", source: JAI, tag: "[unverified] attribution; [theorem] geometry",
      measures: "a sixty-degree arc in the meridian under a pinhole: the Sun's noon zenith distance and, with the latitude, its declination; the image's breadth gives the Sun's diameter", ledger: ["yantra"] }),
    entry({ key: "dakshinottara-bhitti", deva: "दक्षिणोत्तर भित्ति", iast: "dakṣiṇottara-bhitti", built: true, factory: "dakshinottaraBhitti", source: JAI, tag: "[unverified] attribution; [theorem] geometry",
      measures: "a wall in the meridian, quadrants under a pin: the meridian altitude of the Sun (a shadow) or of a star (a sighting)", ledger: ["yantra", "yamyottara"] }),
    entry({ key: "rashivalaya", deva: "राशिवलय", iast: "rāśivalaya", built: true, factory: "rashivalaya", source: JAI, tag: "[unverified] attribution; [theorem] geometry",
      measures: "twelve gnomons, one for each sign: the moment its first point is on the meridian, and the Sun's longitude read off its quadrant then", ledger: ["yantra"] }),
    entry({ key: "unnatamsha", deva: "उन्नतांश यन्त्र", iast: "unnatāṃśa yantra", built: true, factory: "unnatamshaYantra", source: JAI, tag: "[unverified] attribution; [theorem] geometry",
      measures: "a vertical ring turning on a vertical axis: the altitude", ledger: ["yantra", "yamyottara"] }),
  ]);
  const CAT = Object.freeze(Object.fromEntries(CATALOGUE.map((e) => [e.key, e])));
  /** The instruments whose readings go into the ledger as kind "yantra". */
  const LEDGER_YANTRAS = Object.freeze(CATALOGUE.filter((e) => e.ledger.includes("yantra")).map((e) => e.key));
  const NAMED_ONLY = Object.freeze(CATALOGUE.filter((e) => !e.built).map((e) => e.key));
  /** Sizes for examples and tests only: demo, not a measurement of any real instrument. Lengths in any one unit. */
  const DEMO = Object.freeze({ note: "demo, not a measurement",
    shanku: Object.freeze({ height: 12 }), gola: Object.freeze({ circumference: 180 }),
    samrat: Object.freeze({ hypotenuse: 100, radius: 25, centre: 80 }), nadivalaya: Object.freeze({ radius: 30, pin: 6 }),
    "jaya-prakasha": Object.freeze({ radius: 20 }), "kapala-yantra": Object.freeze({ radius: 10 }),
    rama: Object.freeze({ pillar: 20, radius: 20 }), digamsha: Object.freeze({ radius: 20 }),
    shashthamsha: Object.freeze({ radius: 40 }), "dakshinottara-bhitti": Object.freeze({ radius: 30 }),
    rashivalaya: Object.freeze({ hypotenuse: 40, radius: 15 }), unnatamsha: Object.freeze({ radius: 20 }) });

  // ── what every instrument shares ───────────────────────────────────────────────────────────────────
  const positive = (x, what) => { if (!(fin(x) && x > 0)) throw new RangeError(`yantra: ${what} is a length > 0 in the owner's unit`); return x; };
  const sideOf = (natAsus) => (natAsus < 0 ? "purva" : "pashcima");
  const golaSign = (g) => { if (g !== "uttara" && g !== "dakshina") throw new RangeError('yantra: gola is "uttara" (north) or "dakshina"'); return g === "uttara" ? 1 : -1; };
  const sideSign = (s) => { if (s !== "purva" && s !== "pashcima") throw new RangeError('yantra: side is "purva" (east of the meridian) or "pashcima"'); return s === "purva" ? -1 : 1; };
  const dishaSign = (d) => { if (d !== "N" && d !== "S") throw new RangeError('yantra: disha is "N" or "S" (the horizon the altitude is read from)'); return d === "S" ? 1 : -1; };
  /** The reading labels of a set of quantities, in the owner's units. */
  const label = {
    nata: (q) => ({ nata: kapalaOfAsus(q.natAsus), side: sideOf(q.natAsus) }),
    kranti: (q) => ({ kranti: arcOfDegrees(q.krantiDeg), gola: q.gola }),
    unnata: (q) => ({ unnata: arcOfDegrees(q.unnataDeg) }),
    digamsha: (q) => ({ digamsha: arcOfDegrees(mod(q.digamshaDeg, 360)) }),
  };
  /** An instrument: its static parts, and predict(t, opts) → { quantities, position, reading } at t (opts.star for a star). */
  function finish(key, place, parts) {
    const e = CAT[key];
    const self = { key, deva: e.deva, iast: e.iast, ledger: e.ledger, tag: e.tag, site: place.site, sine: S.sine, ...parts,
      quantitiesAt: (t, opts) => quantitiesOf(stateAt(t, place, opts), place) };
    if (parts.positionOf && parts.readingOf) self.predict = (t, opts) => { const q = self.quantitiesAt(t, opts); return { t, body: q.body, quantities: q, position: parts.positionOf(q), reading: parts.readingOf(q) }; };
    return Object.freeze(self);
  }
  const range = (a, b, step) => { const out = []; for (let x = a; x <= b + 1e-9; x += step) out.push(Math.round(x * 1e9) / 1e9); return out; };
  /** The declinations of the sign ends (13.6-13.7): Meṣa…Mithuna's, the same reversed for Karka…Kanyā, southern for Tulā on. */
  const signEndDeclinations = () => [0, 30, 60, 90].map((l) => U.kranti(l)).flatMap((d) => (d === 0 ? [0] : [d, -d])).sort((a, b) => a - b);

  // ══ the Sūrya-Siddhānta's ════════════════════════════════════════════════════════════════════════
  /** शङ्कु — the gnomon of chapter 3 (13.20 names it), of height `height` (aṅgula; 12 by 3.2), wrapped from ss-chaya.js. */
  function shanku(opts) {
    const o = opts || {}, place = placeOf(o.site), g = o.height === undefined ? SHANKU : positive(o.height, "height"), k = g / SHANKU;
    const construction = { height: g, palabha: place.palabha * k, aksakarna: place.aksakarna * k, latitude: place.latitude,
      equinoctialLine: `an east-west line ${(place.palabha * k).toFixed(4)} north of the foot: the tips of the equinox day's shadows (3.6-3.7)`,
      source: "SS 3.1-3.7, 3.12b-3.13" };
    /** The shadow at instant t (the Sun only): length, hypotenuse and tip (north, east) in this gnomon's aṅgula, by
     *  3.34b-3.36 and 3.23b-3.24 (ss-chaya.js shadowAt, shadowTip). null below the horizon. */
    function shadow(t, opts2) {
      const st = sunAt(t, place, opts2), tip = C.shadowTip(st.lambda, place.palabha, st.natAsus);
      if (!tip) return null;
      return { t, lambda: st.lambda, natAsus: st.natAsus, chaya: tip.chaya * k, karna: tip.karna * k, north: tip.north * k, east: tip.east * k, shanku: tip.shanku };
    }
    /** The noon shadow of the Sun at sāyana λ by 3.20b-3.22a (ss-chaya.js noonShadow), in this gnomon's aṅgula. */
    function noon(lam) { const n = C.noonShadow(lam, place.palabha); return { lambda: lam, chaya: n.chaya * k, karna: n.karna * k, dir: n.dir, nataArcmin: n.nataArcmin, krantiArcmin: n.krantiArcmin }; }
    const positionOf = (q) => {
      if (!q.above) return null;
      const h = q.horizon;
      return { chaya: g * root2(h.north * h.north + h.east * h.east) / h.up, north: -g * h.north / h.up, east: -g * h.east / h.up };
    };
    return finish("shanku", place, { construction, shadow, noon, positionOf,
      readingOf: (q) => { const p = positionOf(q); return p ? { chaya: p.chaya, dir: p.north >= 0 ? "N" : "S" } : null; },
      /** Graduation of the slab: the noon shadow of each sign end (13.6's declinations), and the tip every ghaṭī on the
       *  sign-end paths (the bhā-bhrama of 3.41b-3.42a). */
      graduation(gopts) {
        const step = (gopts && gopts.ghati) || 1, out = [];
        for (const lam of [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330]) {
          const n = (() => { try { return noon(lam); } catch (e) { return null; } })();
          const path = [];
          const st = { kj: U.krantiJya(lam), dj: U.dyujya(U.krantiJya(lam)) };
          for (let gh = -30; gh <= 30 + 1e-9; gh += step) {
            const h = horizonOf(st.kj, st.dj, gh * ASU_PER_GHATI, place);
            if (h.up > 0) path.push({ ghati: gh, north: -g * h.north / h.up, east: -g * h.east / h.up });
          }
          out.push({ lambda: lam, krantiDeg: U.kranti(lam), noon: n && { chaya: n.chaya, dir: n.dir }, path });
        }
        return { unit: "aṅgula of this gnomon", signEnds: out };
      },
      /** A shadow (aṅgula of this gnomon) → the altitude: the arc of the legs (gnomon, shadow), 3.8 with 2.33. */
      readShadow: (chaya) => { const a = arcOfLegs(g, positive(chaya, "chaya")); return { unnataDeg: a, natamshaDeg: 90 - a, karna: root2(g * g + chaya * chaya) }; },
      /** The equinox day's noon shadow → the palabhā and the latitude (3.12b-3.14a). */
      readEquinox: (chaya) => { const a = C.akshaOfPalabha(chaya / k); return { palabha: a.palabha, latitude: a.latitude, aksajya: a.aksajya, lambajya: a.lambajya, source: "SS 3.12b-3.14a" }; },
      /** A noon shadow and the Sun's declination (degrees; or the text's Sun at t) → the latitude and the palabhā (3.14b-3.17a). */
      readNoon(chaya, dir, decl) {
        const kr = typeof decl === "number" ? decl * 60 : U.kranti(sunAt(decl.t, place).lambda) * 60;
        const r = C.latitudeFromNoon(chaya / k, dir, kr);
        return { nataArcmin: r.nataArcmin, latitude: r.latitudeArcmin / 60, palabha: r.palabha, krantiArcmin: kr, source: "SS 3.14b-3.17a" };
      },
      /** A noon shadow at this place → the Sun's declination (3.17b-3.18a). */
      readKranti: (chaya, dir) => { const r = C.krantiFromNoon(chaya / k, dir, place.palabha); return { krantiDeg: r.krantiArcmin / 60, nataArcmin: r.nataArcmin, source: "SS 3.17b-3.18a" }; },
      /** Ledger records of the kinds of corpus/vedha/README.md (aṅgula of the ledger's own śaṅku). */
      record: {
        madhyahna: (m) => ({ id: m.id, kind: "madhyahna", day: m.day, chaya: m.chaya, dir: m.dir, ...(m.ayana ? { ayana: m.ayana } : {}), ...meta(m) }),
        vishuvat: (m) => ({ id: m.id, kind: "vishuvat", day: m.day, chaya: m.chaya, dir: m.dir, which: m.which, ...meta(m) }),
        ishta: (m) => ({ id: m.id, kind: "ishta", day: m.day, chaya: m.chaya, kapala: m.kapala, side: m.side, ...(m.bhuja ? { bhuja: m.bhuja } : {}), ...(m.calibration ? { calibration: m.calibration } : {}), ...meta(m) }),
      } });
  }
  const meta = (m) => { const out = {}; for (const k of ["observer", "note", "synthetic", "generator", "ganita"]) if (m[k] !== undefined) out[k] = m[k]; return out; };

  /** कपालक — the bowl of 13.23: a copper vessel with a hole beneath, set in clean water, sinks sixty times in an ahorātra.
   *  An ahorātra of the turn is 60 nāḍī (1.12), 21,600 prāṇa (1.11): one sinking of a true bowl is 360 prāṇa, 6° of the turn. */
  function kapalaka() {
    const unitOf = (sinks, fraction) => {
      if (!Number.isInteger(sinks) || sinks < 1) throw new RangeError("yantra: sinks is the whole number of sinkings between the two transits");
      if (fraction === undefined || fraction === 0) return { num: 21600n, den: BigInt(sinks), exact: true };
      if (isObj(fraction)) {
        const fn = BigInt(fraction.num), fd = BigInt(fraction.den);
        if (!(fd > 0n && fn >= 0n && fn < fd)) throw new RangeError("yantra: fraction { num, den } with 0 ≤ num < den");
        return { num: 21600n * fd, den: BigInt(sinks) * fd + fn, exact: true };
      }
      if (!(fin(fraction) && fraction >= 0 && fraction < 1)) throw new RangeError("yantra: fraction is 0 ≤ f < 1 of one filling");
      return { value: 21600 / (sinks + fraction), exact: false };
    };
    const gcd = (a, b) => { while (b) [a, b] = [b, a % b]; return a < 0n ? -a : a; };
    return Object.freeze({ key: "kapalaka", deva: CAT.kapalaka.deva, iast: CAT.kapalaka.iast, ledger: CAT.kapalaka.ledger, tag: CAT.kapalaka.tag,
      NOMINAL_SINKS: 60, TURN_PRANAS: TURN, ASUS_PER_DAY, source: "SS 13.23 (sixty sinkings), 1.11-1.12 (the turn's units), 1.34-1.37 (turn and civil day)",
      /** Calibration (1.12 with 13.23): `sinks` whole sinkings and `fraction` of a filling between two transits of one star
       *  (one turn) → the bowl's unit in prāṇas of the turn (exact when the fraction is a { num, den }), its sinkings in a
       *  turn, and its drift: the nāḍīs it counts in a turn less 60. */
      calibrate({ sinks, fraction }) {
        const u = unitOf(sinks, fraction);
        if (u.exact) {
          const d = gcd(u.num, u.den), num = u.num / d, den = u.den / d;
          const perTurn = { num: 21600n * den / gcd(21600n * den, num), den: num / gcd(21600n * den, num) };   // 21,600 ÷ the unit, exact
          const n = Number(perTurn.num) / Number(perTurn.den);
          return { unitPranas: { num, den }, unit: Number(num) / Number(den), sinksPerTurnExact: perTurn, sinksPerTurn: n, driftNadi: n - 60, true: num === 360n && den === 1n };
        }
        return { unitPranas: null, unit: u.value, sinksPerTurn: sinks + fraction, driftNadi: sinks + fraction - 60, true: sinks + fraction === 60 };
      },
      /** A count of this bowl (its sinkings and a fraction, or its nominal { ghati, vinadi, prana }) → prāṇas (asus) of the
       *  turn, its { ghati, vinadi, prana } of the turn, and civil days (1.34-1.37). `unit`: prāṇas a sinking (360 if true). */
      turnOfCount(count, unit) {
        const u = unit === undefined ? 360 : (isObj(unit) ? Number(unit.num) / Number(unit.den) : unit);
        const nominal = isObj(count) && count.sinks !== undefined ? (count.sinks + (count.fraction || 0)) * ASU_PER_GHATI : C.asusOf(count, "count");
        const asus = nominal * u / ASU_PER_GHATI;
        return { asus, nadi: asus / ASU_PER_GHATI, kapala: kapalaOfAsus(asus), civilDays: asus / ASUS_PER_DAY };
      },
      /** How many times a bowl of `unit` prāṇas sinks between two instants (civil days): the turn between them ÷ the unit. */
      sinksBetween: (t0, t1, unit) => (t1 - t0) * ASUS_PER_DAY / (unit === undefined ? 360 : unit),
      /** Two successive transits of a star over the meridian, by the engine (its nata 0), and the turn between them. */
      transits(N, star, site) {
        const place = placeOrSite(site), t1 = instantOfNata(N, 0, place, { star });
        let t2 = t1 + TURN / ASUS_PER_DAY;
        for (let i = 0; i < 40; i++) { const d = wrapAsus(-starAt(t2, star, place).natAsus); t2 += d / ASUS_PER_DAY; if (Math.abs(d) < 1e-10) break; }
        return { t1, t2, civilDays: t2 - t1, turnAsus: (t2 - t1) * ASUS_PER_DAY };
      },
      /** The ledger record (kind "kapala", corpus/vedha/README.md): the star and the count of one turn, { ghati, vinadi, prana }. */
      record: (m) => ({ id: m.id, kind: "kapala", star: m.star, count: m.count, ...meta(m) }) });
  }

  /** गोलयन्त्र — the sphere of 13.3-13.17, set to the latitude. Rings of `circumference` aṅgulas (180 by 13.5: the degrees of
   *  a revolution as aṅgulas, halved), so half an aṅgula to a degree along every great ring; the diurnal circles at their
   *  declinations, halved, north and south (13.6-13.7), each of its own radius (svāhorātrārdhakarṇa, 13.5); the ecliptic
   *  (krānti, 13.12) at the greatest declination; the antyā (13.14) and the caradalajyā, the interval between the
   *  equinoctial horizon and the horizon (13.15); the whole turned by a flow, the instrument of time's turning (13.16). */
  function gola(opts) {
    const o = opts || {}, place = placeOf(o.site), circ = o.circumference === undefined ? 180 : positive(o.circumference, "circumference");
    const perDeg = circ / 360, radius = circ * RHO / TURN;                     // an arc of ρ minutes is one radius
    const eps = S.arcminOfJya(PARAMA) / 60;
    /** The Sun's diurnal circle at sāyana λ on this gola: its declination's distance from the equator along an hour ring
     *  (13.6), its radius (13.5; 2.60's dyujyā on the ring's radius), the cara and half-day (2.61-2.63), the antyā = R +
     *  carajyā (3.34b; 13.14) and the carajyā (13.15) as lengths on that circle. */
    function diurnal(lam) {
      const kj = U.krantiJya(lam), dj = U.dyujya(kj), cara = U.caraAsus(lam, place.palabha);
      const carajya = (kj * place.palabha / SHANKU) * R / dj;
      const r = radius * dj / R;
      return { lambda: lam, krantiDeg: U.kranti(lam), fromEquator: U.kranti(lam) * perDeg, radius: r, caraAsus: cara, halfDayAsus: QUARTER + cara,
        antya: R + carajya, antyaLength: (R + carajya) * r / R, caradalajya: carajya, caradalaLength: carajya * r / R };
    }
    /** The rings' reading of the Sun at sāyana λ: along the ecliptic from Meṣa 0, the declination along an hour ring from the
     *  equator, the ascension (3.42 at the point; the Laṅkā risings of 13.14) along the equator from Meṣa 0's hour ring. */
    function ringsOf(lam) {
      const ra = U.rightAscension(lam);
      return { lambda: lam, ecliptic: mod(lam, 360) * perDeg, kranti: U.kranti(lam) * perDeg, ascension: ra / 60 * perDeg, raAsus: ra, diurnal: diurnal(lam) };
    }
    const positionOf = (q) => ({ ecliptic: mod(q.sphutaDeg, 360) * perDeg, kranti: q.krantiDeg * perDeg, nata: q.natAsus / 60 * perDeg });
    return finish("gola", place, {
      construction: { circumference: circ, angulaPerDegree: perDeg, radius, axisElevationDeg: place.latitude, eclipticInclinationDeg: eps,
        diurnalCircles: [30, 60, 90, 210, 240, 270].map(diurnal), source: "SS 13.3-13.17 [text]; radius = circumference × ρ ÷ 21,600 [theorem]" },
      diurnal, ringsOf, positionOf,
      readingOf: (q) => ({ ecliptic: mod(q.sphutaDeg, 360) * perDeg, kranti: q.krantiDeg * perDeg, nata: q.natAsus / 60 * perDeg }),
      /** The gola turned with the turn at instant t (13.16): Meṣa 0's hour ring stands the meridian's asus west of the
       *  meridian; the Sun's hour ring stands its nata (aṅgula along the equator, west +). */
      at(t, opts2) { const st = sunAt(t, place, opts2); return { t, meridianAsus: st.meridianAsus, meshaFromMeridian: st.meridianAsus / 60 * perDeg, sunFromMeridian: st.natAsus / 60 * perDeg, rings: ringsOf(st.lambda) }; },
      /** Lengths on the rings back to the quantities: λ from the ecliptic ring, δ from the hour ring, the ascension (asus). */
      read: (len) => ({ lambda: len.ecliptic === undefined ? undefined : len.ecliptic / perDeg, krantiDeg: len.kranti === undefined ? undefined : len.kranti / perDeg,
        raAsus: len.ascension === undefined ? undefined : len.ascension / perDeg * 60, natAsus: len.nata === undefined ? undefined : len.nata / perDeg * 60 }),
      graduation: () => ({ unit: "aṅgula", perDegree: perDeg, eclipticSigns: range(0, 330, 30).map((l) => ({ lambda: l, at: l * perDeg })),
        diurnalCircles: [30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330, 0].map((l) => { const d = diurnal(l); return { lambda: l, krantiDeg: d.krantiDeg, fromEquator: d.fromEquator, radius: d.radius }; }) }) });
  }

  // ══ Jai Singh II's ════════════════════════════════════════════════════════════════════════════════
  /** Points of the instrument relative to a centre, as { east, north, up } in the owner's unit. */
  const vec = (e, n, u) => ({ east: e, north: n, up: u });

  /** सम्राट् — the gnomon along the axis. Sizes: one of hypotenuse | height | base; radius of the quadrants; centre = the
   *  quadrants' centre's distance along the hypotenuse from its lower (south) end (default: the middle). [theorem] The
   *  hypotenuse is parallel to the axis, so it rises northward at the latitude; tan φ = palabhā ÷ 12, so the gnomon is the
   *  equinoctial shadow triangle — base : height : hypotenuse = 12 : palabhā : akṣakarṇa (3.12b-3.13). The quadrants lie in
   *  the equator's plane through the centre; the hypotenuse's shadow falls on them at the nata from their lowest point, on
   *  the east quadrant after noon; the point of the hypotenuse whose shadow touches the quadrant's rim is r × tan δ from
   *  the centre, toward the upper end for a northern declination. */
  function samrat(opts) {
    const o = opts || {}, place = placeOf(o.site), r = positive(o.radius, "radius");
    const q12 = SHANKU / place.aksakarna, qp = place.palabha / place.aksakarna;    // cos φ, sin φ as the triangle's ratios
    let L;
    if (o.hypotenuse !== undefined) L = positive(o.hypotenuse, "hypotenuse");
    else if (o.height !== undefined) L = positive(o.height, "height") / qp;
    else if (o.base !== undefined) L = positive(o.base, "base") / q12;
    else throw new RangeError("yantra: the samrāṭ needs its hypotenuse, height or base");
    const c = o.centre === undefined ? L / 2 : positive(o.centre, "centre");
    const tanEps = PARAMA / U.dyujya(PARAMA);
    const centre = vec(0, c * q12, c * qp);
    const bottom = vec(0, r * qp, -r * q12);                                    // the quadrant's lowest point, from the centre
    const construction = { latitude: place.latitude, gnomonAngleDeg: place.latitude, hypotenuse: L, height: L * qp, base: L * q12,
      triangle: "base : height : hypotenuse = 12 : palabhā : akṣakarṇa (3.12b-3.13)", centreAlongHypotenuse: c, centre, radius: r,
      quadrantLowestPoint: vec(0, centre.north + bottom.north, centre.up + bottom.up),
      declinationScaleReach: r * tanEps,
      fits: { quadrantAboveGround: centre.up + bottom.up >= 0, declinationScaleOnGnomon: c - r * tanEps >= 0 && c + r * tanEps <= L },
      source: "[theorem]: the axis rises at the latitude (3.12b-3.14a; the dhruva, 12.72)" };
    const pointAt = (natAsus) => { const H = natAsus / 60, cs = koti(H) / R, sn = jya(H) / R;
      return vec(centre.east + r * sn, centre.north + bottom.north * cs, centre.up + bottom.up * cs); };
    const positionOf = (q) => ({ quadrant: q.natAsus >= 0 ? "east" : "west", onQuadrant: Math.abs(q.natAsus) <= QUARTER,
      arcFromNoon: arcLength(r, Math.abs(q.natAsus)), chordFromNoon: Math.abs(chord(r, q.natAsus / 60)), point: pointAt(q.natAsus),
      hypotenuseFromCentre: r * q.kj / q.dj, hypotenuseFromLowerEnd: c + r * q.kj / q.dj });
    return finish("samrat", place, { construction, pointAt, positionOf,
      readingOf: (q) => ({ ...label.nata(q), ...label.kranti(q) }),
      /** A position on the instrument → the quantities: { quadrant, arcFromNoon } → nata; { hypotenuseFromCentre } → δ. */
      quantitiesOfPosition: (p) => ({ ...(p.arcFromNoon !== undefined ? { natAsus: (p.quadrant === "west" ? -1 : 1) * arcminOfLength(r, p.arcFromNoon) } : {}),
        ...(p.hypotenuseFromCentre !== undefined ? { krantiDeg: signedArc(p.hypotenuseFromCentre, r) } : {}) }),
      /** Marks: every `ghati` (default 1) on each quadrant, 0 to 15 ghaṭī; the declination every degree to ±24° and at the
       *  sign ends, along the hypotenuse from the centre. */
      graduation(gopts) {
        const step = (gopts && gopts.ghati) || 1;
        const hours = range(0, 15, step).map((gh) => ({ ghati: gh, natAsus: gh * ASU_PER_GHATI, arcFromNoon: arcLength(r, gh * ASU_PER_GHATI), chordFromNoon: chord(r, gh * 6),
          east: pointAt(gh * ASU_PER_GHATI), west: pointAt(-gh * ASU_PER_GHATI) }));
        const kr = [...new Set([...range(-24, 24, 1), ...signEndDeclinations()])].sort((a, b) => a - b)
          .map((d) => ({ krantiDeg: d, fromCentre: tanLength(r, d), fromLowerEnd: c + tanLength(r, d) }));
        return { unit: "the owner's", hours, kranti: kr };
      } });
  }

  /** नाडीवलय — a dial of radius r in the equator's plane, a pin of length `pin` on each face at the centre, along the axis.
   *  [theorem] The north face (uttara) looks at the north pole and is lit while the declination is north, the south face
   *  (dakṣiṇa) while it is south. The pin's shadow on the lit face lies at the nata from the dial's lowest radius, toward
   *  the east edge after noon; its length is pin × koṭijyā(δ) ÷ jyā(|δ|). */
  function nadivalaya(opts) {
    const o = opts || {}, place = placeOf(o.site), r = positive(o.radius, "radius"), p = positive(o.pin, "pin");
    const construction = { latitude: place.latitude, planeTiltDeg: 90 - place.latitude, axisElevationDeg: place.latitude, radius: r, pin: p,
      lowestPointFromCentre: vec(0, r * place.palabha / place.aksakarna, -r * SHANKU / place.aksakarna),
      faces: { uttara: "faces the north pole; lit while the declination is north", dakshina: "faces the south pole; lit while it is south" },
      source: "[theorem]: the dial's plane is the equator's" };
    /** The shadow on the dial: the face, the direction (components toward the lowest point and toward the east edge, R-units),
     *  the rim mark, the tip of the pin's shadow (in the owner's unit, as { down, east } on the face) and its length. */
    const positionOf = (q) => {
      const H = q.natAsus / 60, dn = koti(H), ea = jya(H), len = Math.abs(q.kj) > 0 ? p * q.dj / Math.abs(q.kj) : Infinity;
      return { face: q.gola, angleFromLowestDeg: H, rimArcFromLowest: arcLength(r, q.natAsus), rim: { down: r * dn / R, east: r * ea / R },
        shadowLength: len, tip: fin(len) ? { down: len * dn / R, east: len * ea / R } : null, onDial: fin(len) && len <= r };
    };
    return finish("nadivalaya", place, { construction, positionOf,
      readingOf: (q) => ({ ...label.nata(q), gola: q.gola }),
      /** The tip of the shadow { down, east } (or any point on the shadow line) and the face → the nata, the gola, and with
       *  the pin's length the declination: tan |δ| = pin ÷ the shadow's length. */
      quantitiesOfPosition: (pos) => {
        const out = { natAsus: wrap180(angleOf(pos.east, pos.down)) * 60 };
        if (pos.face) { out.gola = pos.face; if (pos.down !== undefined) { const len = root2(pos.down * pos.down + pos.east * pos.east); out.krantiDeg = golaSign(pos.face) * arcOfLegs(p, len); } }
        return out;
      },
      graduation(gopts) {
        const step = (gopts && gopts.ghati) || 1;
        return { unit: "the owner's",
          hourLines: range(-30, 30, step).map((gh) => ({ ghati: gh, angleFromLowestDeg: gh * 6, rim: { down: r * koti(gh * 6) / R, east: r * jya(gh * 6) / R }, rimArcFromLowest: arcLength(r, gh * ASU_PER_GHATI) })),
          shadowLengthOfDeclination: range(1, 24, 1).map((d) => ({ krantiDeg: d, length: p * koti(d) / jya(d) })) };
      } });
  }

  /** The hemispherical bowl (Jaya Prakāśa; Kapāla): radius r, rim level, cross-wires meeting over its centre. [theorem]
   *  The wires' crossing throws its shadow at the point of the bowl opposite the body: depth r × jyā(altitude) ÷ R below the
   *  rim, r × koṭijyā(altitude) ÷ R from the axis, bearing azimuth + 180°; the bowl is the sky inverted, its lowest point
   *  the zenith's image, the pole's image south of the axis at depth r × akṣajyā ÷ R. */
  function hemisphere(key, opts) {
    const o = opts || {}, place = placeOf(o.site), r = positive(o.radius, "radius");
    const construction = { latitude: place.latitude, radius: r, rim: "level, at the horizon; the wires north-south and east-west",
      poleImage: { east: 0, north: -r * place.lambajya / R, depth: r * place.aksajya / R },
      source: "[theorem]: the shadow of the centre is the antipode of the body on the sphere of the bowl" };
    const pointOfHorizon = (h) => (h.up > 0 ? { east: -r * h.east / R, north: -r * h.north / R, depth: r * h.up / R } : null);
    const positionOf = (q) => {
      const P = pointOfHorizon(q.horizon);
      if (!P) return null;
      return { ...P, bearingDeg: mod(q.digamshaDeg + 180, 360), arcFromBottom: arcLength(r, (90 - q.unnataDeg) * 60), fromAxis: r * koti(q.unnataDeg) / R };
    };
    const quantitiesOfPosition = (P) => {
      const h = { up: P.depth * R / r, north: -P.north * R / r, east: -P.east * R / r };
      const aa = altAzOf(h), eq = equatorialOfHorizon(h, place);
      return { unnataDeg: aa.unnataDeg, digamshaDeg: aa.digamshaDeg, natAsus: eq.natAsus, krantiDeg: eq.krantiDeg, gola: eq.kj >= 0 ? "uttara" : "dakshina" };
    };
    return finish(key, place, { construction, positionOf, quantitiesOfPosition, pointOfHorizon,
      readingOf: (q) => ({ ...label.nata(q), ...label.kranti(q), ...label.unnata(q), ...label.digamsha(q) }),
      /** Marks on the bowl: altitude circles and azimuth lines (the horizontal set); hour lines (each ghaṭī) through the
       *  sign-end declination circles (the equatorial set) — each as { east, north, depth } from the rim's centre. */
      graduation(gopts) {
        const g = gopts || {}, step = g.ghati || 1, altStep = g.unnata || 5, azStep = g.digamsha || 10;
        const kr = signEndDeclinations();
        return { unit: "the owner's",
          altitudeCircles: range(0, 90, altStep).map((a) => ({ unnataDeg: a, depth: r * jya(a) / R, fromAxis: r * koti(a) / R, arcFromBottom: arcLength(r, (90 - a) * 60) })),
          azimuthLines: range(0, 360 - azStep, azStep).map((A) => ({ digamshaDeg: A, bearingDeg: mod(A + 180, 360) })),
          hourLines: range(-15, 15, step).map((gh) => ({ ghati: gh, points: kr.map((d) => ({ krantiDeg: d, point: pointOfHorizon(horizonOf(jya(d), koti(d), gh * ASU_PER_GHATI, place)) })).filter((x) => x.point) })),
          krantiCircles: kr.map((d) => ({ krantiDeg: d })) };
      } });
  }
  /** जयप्रकाश — the hemispherical bowl under cross-wires. */
  const jayaPrakasha = (opts) => hemisphere("jaya-prakasha", opts);
  /** कपाल यन्त्र — the same hemisphere [reading]. */
  const kapalaYantra = (opts) => hemisphere("kapala-yantra", opts);

  /** राम यन्त्र — a pillar of height `pillar` at the centre of an open cylinder of radius `radius`, its wall of height `wall`
   *  (default: the pillar's). [theorem] The pillar-top's shadow lies at bearing azimuth + 180°, on the floor at pillar ×
   *  koṭijyā(a) ÷ jyā(a) from the foot while that is within the radius, else on the wall at height pillar − radius ×
   *  jyā(a) ÷ koṭijyā(a); the change is at the altitude whose tangent is pillar ÷ radius. */
  function ramaYantra(opts) {
    const o = opts || {}, place = placeOf(o.site), hp = positive(o.pillar, "pillar"), Rc = positive(o.radius, "radius");
    const hw = o.wall === undefined ? hp : positive(o.wall, "wall");
    const change = arcOfLegs(hp, Rc), lowest = hw >= hp ? 0 : arcOfLegs(hp - hw, Rc);
    const construction = { latitude: place.latitude, pillar: hp, radius: Rc, wall: hw, floorToWallAltitudeDeg: change, lowestAltitudeOnWallDeg: lowest,
      source: "[theorem]: the shadow of the pillar's top" };
    const positionOf = (q) => {
      const h = q.horizon;
      if (!(h.up > 0)) return null;
      const horiz = root2(h.north * h.north + h.east * h.east), bearing = mod(q.digamshaDeg + 180, 360);
      const rho = horiz === 0 ? 0 : hp * horiz / h.up;
      if (rho <= Rc) return { on: "floor", rho, bearingDeg: bearing, east: horiz === 0 ? 0 : -rho * h.east / horiz, north: horiz === 0 ? 0 : -rho * h.north / horiz };
      const y = hp - Rc * h.up / horiz;
      return { on: y <= hw ? "wall" : "above the wall", height: y, bearingDeg: bearing, alongWallFromNorth: arcLength(Rc, bearing * 60), east: -Rc * h.east / horiz, north: -Rc * h.north / horiz };
    };
    return finish("rama", place, { construction, positionOf,
      readingOf: (q) => ({ ...label.unnata(q), ...label.digamsha(q) }),
      quantitiesOfPosition: (p) => {
        const alt = p.on === "floor" ? arcOfLegs(hp, p.rho) : signedArc(hp - p.height, Rc);
        return { unnataDeg: alt, digamshaDeg: mod(p.bearingDeg - 180, 360) };
      },
      graduation(gopts) {
        const g = gopts || {}, step = g.unnata || 1, azStep = g.digamsha || 5;
        const alts = [...new Set([...range(0, 90, step), change])].sort((a, b) => a - b);
        return { unit: "the owner's",
          floorCircles: alts.filter((a) => a >= change && a > 0).map((a) => ({ unnataDeg: a, rho: hp * koti(a) / jya(a) })),
          wallMarks: alts.filter((a) => a <= change && a >= lowest).map((a) => ({ unnataDeg: a, height: hp - Rc * jya(a) / koti(a) })),
          azimuthLines: range(0, 360 - azStep, azStep).map((A) => ({ digamshaDeg: A, bearingDeg: mod(A + 180, 360), alongWallFromNorth: arcLength(Rc, mod(A + 180, 360) * 60) })) };
      } });
  }

  /** दिगंश यन्त्र — a pillar at the centre of a circular wall of radius `radius`, its top graduated in azimuth from the north
   *  point through the east. [theorem] A body is sighted at its azimuth's mark; the pillar's shadow falls at azimuth + 180°. */
  function digamshaYantra(opts) {
    const o = opts || {}, place = placeOf(o.site), Rw = positive(o.radius, "radius");
    const markOf = (A) => ({ digamshaDeg: A, arcFromNorth: arcLength(Rw, mod(A, 360) * 60), chordFromNorth: Math.abs(chord(Rw, mod(A, 360))), east: Rw * jya(A) / R, north: Rw * koti(A) / R });
    const positionOf = (q) => ({ sighted: markOf(q.digamshaDeg), shadow: markOf(mod(q.digamshaDeg + 180, 360)) });
    return finish("digamsha", place, { construction: { latitude: place.latitude, radius: Rw, zero: "the north point; azimuth increases through the east", source: "[theorem]" },
      markOf, positionOf, readingOf: (q) => label.digamsha(q),
      quantitiesOfPosition: (p) => ({ digamshaDeg: p.arcFromNorth !== undefined ? arcminOfLength(Rw, p.arcFromNorth) / 60 : angleOf(p.east, p.north) }),
      graduation: (gopts) => ({ unit: "the owner's", marks: range(0, 359, (gopts && gopts.digamsha) || 1).map(markOf) }) });
  }

  /** षष्ठांश यन्त्र — a sixty-degree arc of radius `radius` in the meridian under a pinhole at its centre. [theorem] At noon
   *  the Sun's image falls on the arc at its zenith distance from the point under the pinhole, on the side away from the
   *  Sun; at noon the zenith distance is φ − δ, so the arc can be labelled in declination as well. The arc is centred on
   *  the equinox's noon (zenith distance φ) unless `centreDeg` says otherwise; it holds the year when φ ± ε lie on it. The
   *  image's breadth b gives the Sun's diameter b × ρ ÷ r minutes. */
  function shashthamshaYantra(opts) {
    const o = opts || {}, place = placeOf(o.site), r = positive(o.radius, "radius"), phi = place.latitude;
    const z0 = o.centreDeg === undefined ? phi : o.centreDeg, eps = S.arcminOfJya(PARAMA) / 60;
    const signedZ = (q) => (q.disha === "S" ? 1 : -1) * q.natamshaDeg;
    const markOf = (z) => ({ natamshaSignedDeg: z, krantiDeg: phi - z, arcFromUnder: arcLength(r, z * 60), north: r * jya(z) / R, depth: r * koti(z) / R });
    const positionOf = (q) => ({ ...markOf(signedZ(q)), onArc: Math.abs(signedZ(q) - z0) <= 30, offMeridianAsus: q.natAsus });
    return finish("shashthamsha", place, {
      construction: { latitude: phi, radius: r, spanDeg: 60, fromDeg: z0 - 30, toDeg: z0 + 30, holdsTheYear: phi - eps >= z0 - 30 && phi + eps <= z0 + 30,
        source: "[theorem]: a pinhole image at the centre of the arc" },
      markOf, positionOf,
      readingOf: (q) => ({ natamsha: arcOfDegrees(q.natamshaDeg), disha: q.disha }),
      quantitiesOfPosition: (p) => { const z = p.arcFromUnder !== undefined ? arcminOfLength(r, p.arcFromUnder) / 60 : signedArc(p.north, p.depth); return { natamshaSignedDeg: z, krantiDeg: phi - z }; },
      /** The Sun's diameter (minutes) from the breadth of its image on the arc. */
      discArcmin: (breadth) => arcminOfLength(r, positive(breadth, "breadth")),
      graduation: (gopts) => ({ unit: "the owner's", marks: range(z0 - 30, z0 + 30, (gopts && gopts.amsha) || 1).map(markOf),
        signEnds: signEndDeclinations().map((d) => markOf(phi - d)) }) });
  }

  /** दक्षिणोत्तर भित्ति — a wall in the meridian; a pin perpendicular to it at the centre of two quadrants of radius
   *  `radius` below it, one each side. [theorem] At transit the Sun's shadow of the pin falls on the quadrant on the side
   *  away from it, the altitude below the pin's horizontal; a star is sighted from the same mark through the pin. */
  function dakshinottaraBhitti(opts) {
    const o = opts || {}, place = placeOf(o.site), r = positive(o.radius, "radius");
    const markOf = (a, quadrant) => ({ unnataDeg: a, quadrant, arcFromLevel: arcLength(r, a * 60), arcFromPlumb: arcLength(r, (90 - a) * 60), out: r * koti(a) / R, depth: r * jya(a) / R });
    const positionOf = (q) => ({ ...markOf(q.unnataDeg, q.disha === "S" ? "uttara" : "dakshina"), offMeridianAsus: q.natAsus });
    return finish("dakshinottara-bhitti", place, { construction: { latitude: place.latitude, radius: r, quadrants: "uttara (north of the pin) reads a body south of the zenith; dakshina the reverse", source: "[theorem]" },
      markOf, positionOf,
      readingOf: (q) => ({ ...label.unnata(q), disha: q.disha }),
      quantitiesOfPosition: (p) => ({ unnataDeg: p.arcFromLevel !== undefined ? arcminOfLength(r, p.arcFromLevel) / 60 : arcOfLegs(p.depth, p.out), disha: p.quadrant === "uttara" ? "S" : "N" }),
      graduation: (gopts) => ({ unit: "the owner's", marks: range(0, 90, (gopts && gopts.amsha) || 1).map((a) => markOf(a, "either")) }),
      /** A star on the meridian read on the wall → the existing ledger kind yamyottara (vedha-lekha.js). */
      recordStar: (m) => ({ id: m.id, kind: "yamyottara", day: m.day, star: m.star, transit: "upper", unnata: m.unnata, disha: m.disha, ...(m.kapala ? { kapala: m.kapala } : {}), ...meta(m) }) });
  }

  /** राशिवलय — twelve gnomons with quadrants of radius `radius`. [theorem] The k-th is set along the ecliptic's pole at the
   *  moment sign k's first point (sāyana 30k°) is on the meridian — when the meridian's asus equal that point's right
   *  ascension (3.42 at the point); then its quadrants lie in the ecliptic's plane and the shadow of its edge falls at the
   *  Sun's distance in longitude from the ecliptic's highest point, the nonagesimal (vitribha, lagna − 90°; the lagna by
   *  each point's own horizon, ss-udaya.js), on the west quadrant when the Sun is east of it. The pole is at declination
   *  90° − ε on the solstitial colure (ascension 45 ghaṭī). */
  function rashivalaya(opts) {
    const o = opts || {}, place = placeOf(o.site), r = positive(o.radius, "radius"), L = o.hypotenuse === undefined ? null : positive(o.hypotenuse, "hypotenuse");
    const RASHI = ["Meṣa", "Vṛṣabha", "Mithuna", "Karka", "Siṃha", "Kanyā", "Tulā", "Vṛścika", "Dhanu", "Makara", "Kumbha", "Mīna"];
    const poleKj = U.dyujya(PARAMA), poleDj = PARAMA;                             // R sin(90° − ε), R cos(90° − ε)
    function sign(k) {
      if (!(Number.isInteger(k) && k >= 0 && k < 12)) throw new RangeError("yantra: rashi is 0 (Meṣa) … 11 (Mīna)");
      const lam = 30 * k, mer = U.rightAscension(lam);
      const h = horizonOf(poleKj, poleDj, wrapAsus(mer - ECLIPTIC_POLE_RA), place);
      const below = h.up < 0, hh = below ? { up: -h.up, north: -h.north, east: -h.east } : h;   // the line of the gnomon points to whichever pole is up
      const aa = altAzOf(hh), lagna = U.lagnaOwn(mer, place.palabha), vitribha = mod(lagna - 90, 360);
      return { rashi: k, name: RASHI[k], lambda: lam, meridianAsus: mer, meridianKapala: kapalaOfAsus(mer),
        gnomon: { inclinationDeg: aa.unnataDeg, bearingDeg: aa.digamshaDeg, pointsTo: below ? "the ecliptic's south pole (the north one is below the horizon)" : "the ecliptic's north pole",
          ...(L ? { height: L * jya(aa.unnataDeg) / R, base: L * koti(aa.unnataDeg) / R } : {}) },
        lagna, vitribha };
    }
    const SIGNS = Object.freeze(range(0, 11, 1).map(sign));
    /** The shadow on sign k's quadrant of a body of sāyana longitude λ (on the ecliptic) at that sign's moment. */
    const positionOfLambda = (k, lam) => { const d = wrap180(lam - SIGNS[k].vitribha); return { quadrant: d > 0 ? "west" : "east", angleDeg: Math.abs(d), arcFromLowest: arcLength(r, Math.abs(d) * 60), onQuadrant: Math.abs(d) <= 90 }; };
    return finish("rashivalaya", place, {
      construction: { latitude: place.latitude, radius: r, hypotenuse: L, signs: SIGNS, source: "[theorem]: a samrāṭ set to the ecliptic at each sign's culmination" },
      signs: SIGNS, positionOfLambda,
      /** The instant on day N at which sign k's first point is on the meridian (the turn that begins six hours after local
       *  midnight), and the Sun's reading on that sign's instrument then. */
      predictMoment(N, k, opts2) {
        const s = SIGNS[k], t = instantOfMeridian(N, s.meridianAsus, place, opts2), q = quantitiesOf(sunAt(t, place, opts2), place);
        return { t, rashi: k, quantities: q, position: positionOfLambda(k, q.sphutaDeg), reading: { rashi: k, sphuta: arcOfDegrees(mod(q.sphutaDeg, 360)) }, above: q.above };
      },
      readingOf: (q, k) => ({ rashi: k, sphuta: arcOfDegrees(mod(q.sphutaDeg, 360)) }),
      quantitiesOfPosition: (k, p) => ({ sphutaDeg: mod(SIGNS[k].vitribha + (p.quadrant === "west" ? 1 : -1) * arcminOfLength(r, p.arcFromLowest) / 60, 360) }),
      graduation: (gopts) => ({ unit: "the owner's", signs: SIGNS.map((s) => ({ rashi: s.rashi, name: s.name, marks: range(-90, 90, (gopts && gopts.amsha) || 1)
        .map((d) => ({ sphutaDeg: mod(s.vitribha + d, 360), quadrant: d > 0 ? "west" : "east", arcFromLowest: arcLength(r, Math.abs(d) * 60) })) })) }) });
  }

  /** उन्नतांश यन्त्र — a ring of radius `radius` in a vertical plane that turns on a vertical axis, a sight pivoted at its
   *  centre. [theorem] The altitude is read from the ring's level diameter: arc r × a, chord 2r jyā(a ÷ 2) ÷ R. */
  function unnatamshaYantra(opts) {
    const o = opts || {}, place = placeOf(o.site), r = positive(o.radius, "radius");
    const markOf = (a) => ({ unnataDeg: a, arcFromLevel: arcLength(r, a * 60), chordFromLevel: Math.abs(chord(r, a)), out: r * koti(a) / R, up: r * jya(a) / R });
    return finish("unnatamsha", place, { construction: { latitude: place.latitude, radius: r, source: "[theorem]" }, markOf,
      positionOf: (q) => ({ ...markOf(q.unnataDeg), ringTurnedToDeg: q.digamshaDeg }),
      readingOf: (q) => ({ ...label.unnata(q), side: sideOf(q.natAsus) }),
      quantitiesOfPosition: (p) => ({ unnataDeg: p.arcFromLevel !== undefined ? arcminOfLength(r, p.arcFromLevel) / 60 : signedArc(p.up, p.out) }),
      graduation: (gopts) => ({ unit: "the owner's", marks: range(0, 90, (gopts && gopts.amsha) || 1).map(markOf) }),
      recordStar: (m) => ({ id: m.id, kind: "yamyottara", day: m.day, star: m.star, transit: "upper", unnata: m.unnata, disha: m.disha, ...(m.kapala ? { kapala: m.kapala } : {}), ...meta(m) }) });
  }

  const FACTORIES = Object.freeze({ shanku, kapalaka, gola, samrat, nadivalaya, "jaya-prakasha": jayaPrakasha, "kapala-yantra": kapalaYantra, rama: ramaYantra,
    digamsha: digamshaYantra, shashthamsha: shashthamshaYantra, "dakshinottara-bhitti": dakshinottaraBhitti, rashivalaya, unnatamsha: unnatamshaYantra });
  /** An instrument by its catalogue key, with the owner's site and sizes. */
  function instrument(key, opts) {
    const f = FACTORIES[key];
    if (!f) throw new RangeError(`yantra: "${key}" is ${CAT[key] ? "named in the text but has no geometry there" : "not in the catalogue"}`);
    return f(opts);
  }

  // ══ the ledger: kind "yantra" ════════════════════════════════════════════════════════════════════
  // Each instrument's reading: the fields it may carry, in groups that go together, and the groups it must carry.
  const READING = Object.freeze({
    samrat: { groups: [["nata", "side"], ["kranti", "gola"]], required: [0] },
    nadivalaya: { groups: [["nata", "side"], ["gola"]], required: [0, 1] },
    "jaya-prakasha": { groups: [["nata", "side"], ["kranti", "gola"], ["unnata", "digamsha"]], atLeastOne: true },
    "kapala-yantra": { groups: [["nata", "side"], ["kranti", "gola"], ["unnata", "digamsha"]], atLeastOne: true },
    rama: { groups: [["unnata", "digamsha"]], required: [0] },
    digamsha: { groups: [["digamsha"]], required: [0] },
    shashthamsha: { groups: [["natamsha", "disha"]], required: [0] },
    "dakshinottara-bhitti": { groups: [["unnata", "disha"]], required: [0] },
    rashivalaya: { groups: [["rashi", "sphuta"]], required: [0] },
    unnatamsha: { groups: [["unnata"], ["side"], ["disha"]], required: [0], exclusive: [1, 2] },
  });
  const FIELD = {
    nata: (v, w) => asusOfNata(v, w), side: (v) => sideSign(v), gola: (v) => golaSign(v), disha: (v) => dishaSign(v),
    kranti: (v, w) => degreesOfArc(v, w, 90), unnata: (v, w) => degreesOfArc(v, w, 90), natamsha: (v, w) => degreesOfArc(v, w, 90),
    digamsha: (v, w) => degreesOfArc(v, w, 360, true), sphuta: (v, w) => degreesOfArc(v, w, 360, true),
    rashi: (v, w) => { if (!(Number.isInteger(v) && v >= 0 && v < 12)) throw new RangeError(`yantra: ${w} is 0 (Meṣa) … 11 (Mīna)`); return v; },
  };
  /** Checks a "yantra" record's instrument, body and reading (its own graduation's fields only). Throws on the first fault. */
  function checkReading(key, reading, body) {
    const spec = READING[key];
    if (!spec) throw new RangeError(`yantra: "${key}" is not an instrument whose reading is a "yantra" record (${LEDGER_YANTRAS.join(", ")})`);
    if (body !== undefined && (typeof body !== "string" || !body.trim())) throw new TypeError("yantra: body is \"surya\" or the star's name");
    if (key === "rashivalaya" && body !== undefined && body !== "surya") throw new RangeError("yantra: the rāśivalaya reads the Sun");
    if (key === "shashthamsha" && body !== undefined && body !== "surya") throw new RangeError("yantra: the ṣaṣṭhāṃśa reads the Sun's image");
    if (key === "nadivalaya" && body !== undefined && body !== "surya") throw new RangeError("yantra: the nāḍīvalaya reads the Sun's shadow");
    if (!isObj(reading)) throw new TypeError("yantra: reading is an object of the instrument's own graduation");
    const allowed = spec.groups.flat();
    for (const k of Object.keys(reading)) if (!allowed.includes(k)) throw new RangeError(`yantra: the ${key} reading has a field "${k}" (only ${allowed.join(", ")})`);
    const present = spec.groups.map((grp) => {
      const has = grp.filter((f) => reading[f] !== undefined);
      if (has.length && has.length < grp.length) throw new RangeError(`yantra: ${grp.join(" and ")} go together in a ${key} reading`);
      return has.length === grp.length;
    });
    for (const i of spec.required || []) if (!present[i]) throw new RangeError(`yantra: a ${key} reading needs ${spec.groups[i].join(" and ")}`);
    if (spec.atLeastOne && !present.some(Boolean)) throw new RangeError(`yantra: a ${key} reading needs ${spec.groups.map((g) => g.join(" and ")).join(", or ")}`);
    if (spec.exclusive && spec.exclusive.every((i) => present[i])) throw new RangeError(`yantra: a ${key} reading has a side (a time) or a disha (the meridian), not both`);
    for (const [k, v] of Object.entries(reading)) FIELD[k](v, `reading.${k}`);
    return true;
  }
  /** A reading → the quantities it states (nata asus west +, declination, altitude, azimuth, signed zenith distance, longitude). */
  function quantitiesOfReading(key, reading) {
    checkReading(key, reading);
    const q = {}, w = (k) => `reading.${k}`;
    if (reading.nata !== undefined) q.natAsus = sideSign(reading.side) * asusOfNata(reading.nata, w("nata"));
    if (reading.kranti !== undefined) q.krantiDeg = golaSign(reading.gola) * degreesOfArc(reading.kranti, w("kranti"), 90);
    else if (reading.gola !== undefined) q.gola = reading.gola;
    if (reading.kranti !== undefined) q.gola = reading.gola;
    if (reading.unnata !== undefined) q.unnataDeg = degreesOfArc(reading.unnata, w("unnata"), 90);
    if (reading.digamsha !== undefined) q.digamshaDeg = degreesOfArc(reading.digamsha, w("digamsha"), 360, true);
    if (reading.natamsha !== undefined) q.natamshaSignedDeg = dishaSign(reading.disha) * degreesOfArc(reading.natamsha, w("natamsha"), 90);
    if (reading.disha !== undefined) q.disha = reading.disha;
    if (reading.side !== undefined && reading.nata === undefined) q.side = reading.side;
    if (reading.sphuta !== undefined) { q.sphutaDeg = degreesOfArc(reading.sphuta, w("sphuta"), 360, true); q.rashi = reading.rashi; }
    return q;
  }
  /** The reading of a set of predicted quantities as instrument `key` shows it (the labels a "yantra" record carries). */
  function readingOfQuantities(key, q, extra) {
    switch (key) {
      case "samrat": return { ...label.nata(q), ...label.kranti(q) };
      case "nadivalaya": return { ...label.nata(q), gola: q.gola };
      case "jaya-prakasha": case "kapala-yantra": return { ...label.nata(q), ...label.kranti(q), ...label.unnata(q), ...label.digamsha(q) };
      case "rama": return { ...label.unnata(q), ...label.digamsha(q) };
      case "digamsha": return label.digamsha(q);
      case "shashthamsha": return { natamsha: arcOfDegrees(q.natamshaDeg), disha: q.disha };
      case "dakshinottara-bhitti": return { ...label.unnata(q), disha: q.disha };
      case "rashivalaya": return { rashi: extra && extra.rashi, sphuta: arcOfDegrees(mod(q.sphutaDeg, 360)) };
      case "unnatamsha": return extra && extra.meridian ? { ...label.unnata(q), disha: q.disha } : { ...label.unnata(q), side: sideOf(q.natAsus) };
      default: throw new RangeError(`yantra: "${key}" has no "yantra" reading`);
    }
  }
  /** A ledger record of kind "yantra" (vedha-lekha.js): { id, day, body ("surya" or a star's name), reading, kapala?,
   *  calibration?, observer?, note?, synthetic?, generator?, ganita? }. The reading is checked first. */
  function record(key, m) {
    const body = m.body === undefined ? "surya" : m.body;
    checkReading(key, m.reading, body);
    const r = { id: m.id, kind: "yantra", day: m.day, yantra: key, body, reading: JSON.parse(JSON.stringify(m.reading)) };
    if (m.kapala !== undefined) r.kapala = m.kapala;
    if (m.calibration !== undefined) r.calibration = m.calibration;
    return { ...r, ...meta(m) };
  }

  /** Reduces one "yantra" record: what it measured [measured], the instant it is compared at, the text's quantities there,
   *  and the antara (observed − the text). ctx: { N (its civil day), t (the instant by the bowl, when it carries a kapala),
   *  star (the catalogue entry, when the body is a star) }. The instant, in order: the bowl's count; the meridian for the
   *  wall and the arc (and a ring read with a disha); the sign's culmination for the rāśivalaya; the reading's own nata;
   *  its altitude and side (3.37-3.39); its azimuth. The quantity that fixed the instant has no antara of its own. */
  function reduceReading(r, site, ctx) {
    const c = ctx || {}, place = placeOrSite(site), key = r.yantra;
    const obs = quantitiesOfReading(key, r.reading);
    const sun = r.body === undefined || r.body === "surya";
    if (!sun && !c.star) return { observed: obs, instant: null, text: null, antara: null, warning: `no catalogue place for the star "${r.body}": its reading is kept, not compared` };
    const o = sun ? {} : { star: c.star };
    let t = null, from = null, fixedBy = null;
    if (typeof c.t === "number") { t = c.t; from = "the bowl's count from sunrise (kapala)"; }
    else if (key === "dakshinottara-bhitti" || key === "shashthamsha" || (key === "unnatamsha" && obs.disha !== undefined)) { t = instantOfNata(c.N, 0, place, o); from = "the meridian (nata 0)"; }
    else if (key === "rashivalaya") { t = instantOfMeridian(c.N, U.rightAscension(30 * obs.rashi), place); from = `the moment the first point of sign ${obs.rashi} is on the meridian`; }
    else if (obs.natAsus !== undefined) { t = instantOfNata(c.N, obs.natAsus, place, o); from = "the reading's own nata"; fixedBy = "natAsus"; }
    else if (obs.unnataDeg !== undefined && (obs.side !== undefined || obs.digamshaDeg !== undefined)) {
      const side = obs.side || (mod(obs.digamshaDeg, 360) < 180 ? "purva" : "pashcima");
      t = instantOfUnnata(c.N, obs.unnataDeg, side, place, o); from = `the reading's altitude, ${side} (3.37-3.39)`; fixedBy = "unnataDeg";
    } else if (obs.digamshaDeg !== undefined) { t = instantOfDigamsha(c.N, obs.digamshaDeg, place, o); from = "the reading's azimuth"; fixedBy = "digamshaDeg"; }
    if (t === null) return { observed: obs, instant: null, text: null, antara: null, warning: "nothing in this reading fixes its instant: add the bowl's count (kapala)" };
    const q = quantitiesOf(stateAt(t, place, o), place);
    const text = {}, antara = {};
    const zSigned = (q.disha === "S" ? 1 : -1) * q.natamshaDeg;
    if (obs.natAsus !== undefined) { text.natAsus = q.natAsus; if (fixedBy !== "natAsus") antara.natAsus = wrapAsus(obs.natAsus - q.natAsus); }
    if (obs.krantiDeg !== undefined) { text.krantiDeg = q.krantiDeg; antara.krantiArcmin = (obs.krantiDeg - q.krantiDeg) * 60; }
    if (obs.gola !== undefined && obs.krantiDeg === undefined) { text.gola = q.gola; antara.golaAgree = obs.gola === q.gola; }
    if (obs.unnataDeg !== undefined) { text.unnataDeg = q.unnataDeg; if (fixedBy !== "unnataDeg") antara.unnataArcmin = (obs.unnataDeg - q.unnataDeg) * 60; }
    if (obs.disha !== undefined) { text.disha = q.disha; antara.dishaAgree = obs.disha === q.disha; }
    if (obs.digamshaDeg !== undefined) { text.digamshaDeg = q.digamshaDeg; if (fixedBy !== "digamshaDeg") antara.digamshaArcmin = wrap180(obs.digamshaDeg - q.digamshaDeg) * 60; }
    if (obs.natamshaSignedDeg !== undefined) { text.natamshaSignedDeg = zSigned; antara.natamshaArcmin = (obs.natamshaSignedDeg - zSigned) * 60; text.krantiDeg = q.krantiDeg; }
    if (obs.sphutaDeg !== undefined) { text.sphutaDeg = q.sphutaDeg; antara.sphutaArcmin = wrap180(obs.sphutaDeg - q.sphutaDeg) * 60; }
    if (antara.natAsus !== undefined) antara.natVinadi = antara.natAsus / ASU_PER_VINADI;
    const warning = !q.above ? `the text has the ${sun ? "Sun" : r.body} below the horizon at this instant` : null;
    return { observed: obs, instant: { t, from, fixedBy }, text, antara, warning };
  }

  return Object.freeze({
    sine: S.sine || "table", withSine: (name) => yantraOf(S.withSine(name), K, U.withSine(name), C.withSine(name), G.withSine(name)),
    R, RHO, PARAMA, TURN, ASUS_PER_DAY, SHANKU, ECLIPTIC_POLE_RA,
    CATALOGUE, LEDGER_YANTRAS, NAMED_ONLY, DEMO, READING,
    jya, koti, arcOfLegs, angleOf, signedArc, arcLength, arcminOfLength, chord, tanLength,
    kapalaOfAsus, arcOfDegrees, degreesOfArc,
    placeOf, sunAt, starAt, horizonOf, horizonOfAltAz, altAzOf, equatorialOfHorizon, quantitiesOf,
    instantOfNata, instantOfMeridian, instantOfUnnata, instantOfDigamsha, nataOfShanku,
    shanku, kapalaka, gola, samrat, nadivalaya, jayaPrakasha, kapalaYantra, ramaYantra, digamshaYantra, shashthamshaYantra, dakshinottaraBhitti, rashivalaya, unnatamshaYantra,
    instrument, checkReading, quantitiesOfReading, readingOfQuantities, record, reduceReading,
  });
});
