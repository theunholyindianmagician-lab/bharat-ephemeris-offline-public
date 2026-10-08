/* ss-udaya.js — उदय: the Sūrya-Siddhānta's rising-times, lagna, the time between two points, kālāṃśa, and the Moon's first
 * evening (candra-darśana), by the text's own arithmetic — the sine table and the greatest declination 1397 — not by
 * spherical trigonometry.
 *
 *   2.28        the R-sine of the greatest declination is 1397.
 *   2.60        the day-radius (dyujyā) = R − the versed sine of the declination: on the table, jyā(90° − δ).
 *   2.61        kṣitijyā = krāntijyā × palabhā ÷ 12; carajyā = kṣitijyā × R ÷ dyujyā; its arc in minutes is the cara in asus (2.62).
 *   2.62-2.63   half-day = 15 ghaṭīs (5400 asus) + cara when the declination is northern, − when southern.
 *   3.42-3.43   the Laṅkā risings of the first three signs: the arcs of jyā(30°·k) × dyujyā(90°) ÷ dyujyā(30°·k), differenced.
 *               With 1397 they are 1670, 1795, 1934-1935 — 3.44 states 1670, 1795, 1935 (`stated: true` uses those).
 *   3.44-3.45   at a place: Meṣa…Mithuna less the cara-khaṇḍas; Karka…Kanyā the same three reversed, plus them; Tulā…Mīna the
 *               six in reverse order.
 *   3.46-3.48   lagna: from the Sun at the instant and the asus since sunrise, take away the Sun's bhogya, then whole signs; the
 *               remainder × 30 ÷ the rising of the sign reached gives its degrees.
 *   3.49        madhya-lagna: the meridian's asus from Meṣa 0° turned into an arc by the Laṅkā risings.
 *   3.50        the time between two points of the ecliptic: bhogya + whole signs + bhukta.
 *   9.5         kālāṃśa = those asus ÷ 60; for the western horizon both points are advanced by six signs.
 *   7.8-7.10    dṛkkarma, at the horizon (nata = half-day, so 7.8's factor is 1): ākṣa = latitude′ × palabhā ÷ 12, for a northern
 *               latitude subtracted in the east and added in the west (7.9); āyana = latitude′ × the declination in degrees of
 *               (λ + 90°), in seconds, added when latitude and that declination point opposite ways, subtracted when alike.
 *   10.1-10.4   the Moon is seen in the west once Sun and Moon are 12 kālāṃśa apart "as before" (720 asus); in the bright half
 *               the Moon sets that many asus after the Sun, found by advancing both by their daily motions and recomputing
 *               until the asus stop changing.
 * Every longitude here is tropical (sāyana): 3.10 — "from the planet corrected by the ayanāṃśa follow declination, shadow,
 * half-day and the rest". Rising times are asus of the star-wheel's turn (21,600 to a turn; a ghaṭī is 360).
 * The text interpolates linearly within a sign (3.46, 3.48); that is the text's lagna, not the sphere's. How far it is from
 * the sphere is measured in ss-udaya.test.js. Requires sphuta.js (the table) only.
 * withSine("madhava"): the same with sphuta.js's Mādhava sine on R = 3438 in place of the table.
 * Browser: window.SSUdaya (needs Sphuta); node: module.exports.
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory(require("./sphuta.js"));
  else root.SSUdaya = factory(root.Sphuta);
})(typeof globalThis !== "undefined" ? globalThis : this, function ssUdaya(S) {
  "use strict";
  const R = S.R, PARAMA = 1397;                                   // 2.28
  const TURN = 21600, QUARTER = 5400, GHATI = 360, KALAMSA = 60, DARSHANA_KALAMSA = 12;
  const mod = (a, m) => ((a % m) + m) % m;
  const arcOf = (x) => S.arcminOfJya(Math.min(R, Math.abs(x)));    // 2.33, minutes

  /** 2.28: signed R-sine of the declination of a tropical longitude (north +). */
  const krantiJya = (lam) => S.jya(lam) * PARAMA / R;
  /** Declination in degrees by the table, signed. */
  const kranti = (lam) => { const k = krantiJya(lam); return Math.sign(k) * arcOf(k) / 60; };
  /** 2.60: the day-radius for a declination given by its R-sine: R − versine = jyā(90° − δ). */
  const dyujya = (kj) => S.jyaOfArcmin(QUARTER - arcOf(kj));
  /** The palabhā (equinoctial noon shadow of the 12-aṅgula gnomon) of a latitude in degrees, by the table (3.13-3.14 reversed). */
  const palabhaOf = (lat) => 12 * S.jya(lat) / S.jya(90 - lat);
  /** 2.61-2.62: the cara in asus of a declination given by its signed R-sine. */
  function caraOfKrantiJya(kj, palabha) {
    const cj = (kj * palabha / 12) * R / dyujya(kj);
    return Math.sign(cj) * arcOf(cj);
  }
  /** 2.61-2.62: the cara of a tropical longitude in asus; positive when the day is longer than 30 ghaṭīs at a northern place. */
  const caraAsus = (lam, palabha) => caraOfKrantiJya(krantiJya(lam), palabha);
  /** 2.62-2.63: half-day and half-night of a body at a tropical longitude, in asus. */
  const halfDay = (lam, palabha) => QUARTER + caraAsus(lam, palabha);

  /** 3.42-3.43: the Laṅkā risings of Meṣa, Vṛṣa, Mithuna in asus, from 1397 (or 3.44's stated 1670, 1795, 1935). */
  function lankaRisings(opts) {
    if (opts && opts.stated) return [1670, 1795, 1935];
    const D90 = dyujya(PARAMA);
    const arcs = [30, 60, 90].map((l) => arcOf(S.jya(l) * D90 / dyujya(krantiJya(l))));
    return [arcs[0], arcs[1] - arcs[0], arcs[2] - arcs[1]];
  }
  /** 3.44-3.45: the twelve risings at a place of the given palabhā (0 at Laṅkā), Meṣa first, in asus; they add to 21,600. */
  function risings(palabha, opts) {
    const [a, b, c] = lankaRisings(opts);
    const k = [30, 60, 90].map((l) => caraAsus(l, palabha || 0));
    const c1 = k[0], c2 = k[1] - k[0], c3 = k[2] - k[1];
    const six = [a - c1, b - c2, c - c3, c + c3, b + c2, a + c1];
    return [...six, ...six.slice().reverse()];
  }
  /** Asus from tropical Meṣa 0° to λ by risings `rs`, in proportion within a sign (3.46). */
  function ascension(lam, rs) {
    const l = mod(lam, 360), i = Math.min(11, Math.floor(l / 30));
    let s = 0; for (let k = 0; k < i; k++) s += rs[k];
    return s + (l - 30 * i) * rs[i] / 30;
  }
  /** The tropical longitude whose ascension by `rs` is `asus`. */
  function longitudeOfAscension(asus, rs) {
    let a = mod(asus, TURN), i = 0;
    while (i < 11 && a >= rs[i]) { a -= rs[i]; i++; }
    return 30 * i + a * 30 / rs[i];
  }
  /** 3.50: asus from λ1 forward to λ2 — bhogya of λ1's sign + whole signs + bhukta of λ2's. */
  const intervalAsus = (l1, l2, rs) => mod(ascension(l2, rs) - ascension(l1, rs), TURN);
  /** 9.5: kālāṃśa between two points (east: as given; west: pass both advanced by 180°). */
  const kalamsa = (l1, l2, rs) => intervalAsus(l1, l2, rs) / KALAMSA;

  /** 3.46-3.48, literally: the lagna (tropical) from the Sun (tropical) at the instant and the asus since sunrise. */
  function lagna(sunTrop, sinceSunriseAsus, rs) {
    const l = mod(sunTrop, 360); let i = Math.min(11, Math.floor(l / 30));
    const bhogya = (30 * (i + 1) - l) * rs[i] / 30;                               // 3.46
    let rest = mod(sinceSunriseAsus, TURN);
    if (rest < bhogya) return mod(l + rest * 30 / rs[i], 360);
    rest -= bhogya; i = (i + 1) % 12;
    while (rest >= rs[i]) { rest -= rs[i]; i = (i + 1) % 12; }                    // 3.47
    return 30 * i + rest * 30 / rs[i];                                             // 3.48
  }
  /** The asus since the Sun rose, from the meridian: the Sun's hour angle (meridian − Sun) + its half-day. The Sun's
   *  right ascension by 3.42 at its own point (default), or with opts.ascension "linear" by the Laṅkā risings in
   *  proportion within the sign (3.46's way). */
  function sinceSunrise(sunTrop, meridianAsus, palabha, opts) {
    const ra = opts && opts.ascension === "linear" ? ascension(sunTrop, risings(0, opts)) : rightAscension(sunTrop);
    return mod(meridianAsus - ra + halfDay(sunTrop, palabha), TURN);
  }
  /** The lagna from the meridian's asus (its right ascension × 60): 3.46-3.48 after `sinceSunrise`, the Sun placed the
   *  same linear way so that at sunrise the lagna is the Sun. */
  const lagnaFromMeridian = (sunTrop, meridianAsus, palabha, opts) =>
    lagna(sunTrop, sinceSunrise(sunTrop, meridianAsus, palabha, { ...opts, ascension: "linear" }), risings(palabha, opts));
  /** 3.49: the madhya-lagna (tropical) from the meridian's asus. */
  const madhyaLagna = (meridianAsus, opts) => longitudeOfAscension(meridianAsus, risings(0, opts));

  // ── a body's own horizon, from its own declination (2.58, 2.61-2.63; 2.63: "bhānām api svake") ──────────
  /** 3.42's rule taken at the point itself, not interpolated within a sign: the right ascension (asus from Meṣa 0°) of a
   *  tropical longitude — the arc of jyā(bhuja) × dyujyā(90°) ÷ dyujyā(bhuja), placed by quadrant [reading: 3.42 applies
   *  it at the sign ends; nothing in the rule is particular to them]. */
  function rightAscension(lam) {
    const l = mod(lam, 360), b = S.bhuja(l).bhuja;
    const a = arcOf(S.jya(b) * dyujya(PARAMA) / dyujya(krantiJya(b)));
    return l < 90 ? a : l < 180 ? 10800 - a : l < 270 ? 10800 + a : TURN - a;
  }
  /** Asus of the turn at which a body rises (east) or sets (west), on the frame where the meridian of Meṣa 0° is 0: its
   *  right ascension ∓ its own half-day, 15 ghaṭīs + the cara of its OWN declination (2.62-2.63). `polarLam`: the
   *  tropical foot of its hour circle on the ecliptic;
   *  `declDeg`: its declination in degrees, north +. The text gives a star its own day by its declination with its
   *  latitude (2.63) — this is that, used for the horizon instead of the linear ākṣa dṛkkarma of 7.8. */
  function horizonAsus(polarLam, declDeg, palabha, side) {
    const kj = Math.sign(declDeg) * S.jyaOfArcmin(Math.min(QUARTER, Math.abs(declDeg) * 60));
    const c = caraOfKrantiJya(kj, palabha);
    return mod(rightAscension(polarLam) + (side === "west" ? QUARTER + c : -(QUARTER + c)), TURN);
  }
  /** A body with ecliptic latitude: the foot of its hour circle by 7.10's āyana part, its true declination by 2.58 (the
   *  ecliptic declination with the latitude: summed when alike, the difference otherwise). */
  function bodyHorizonAsus(lam, latArcmin, palabha, side) {
    const polar = mod(lam - latArcmin * kranti(lam + 90) / 3600, 360);           // 7.10, in degrees
    return horizonAsus(polar, kranti(lam) + latArcmin / 60, palabha, side);      // 2.58
  }
  /** A junction star by its polar coordinates (ch.8): the dhruvaka is already the foot of its hour circle, and its
   *  declination is the dhruvaka's with the polar latitude (2.58, 2.63). */
  const starHorizonAsus = (dhruvakaTrop, vikDeg, palabha, side) => horizonAsus(dhruvakaTrop, kranti(dhruvakaTrop) + vikDeg, palabha, side);
  /** 9.5 by the bodies' own horizons: signed kālāṃśa of a body from the Sun (east: + when it rises first; west: + when it
   *  sets after). */
  function kalamsaOwn(bodyAsus, sunTrop, palabha, side) {
    const sunAsus = horizonAsus(sunTrop, kranti(sunTrop), palabha, side);
    const d = mod(side === "east" ? sunAsus - bodyAsus : bodyAsus - sunAsus, TURN);
    return (d > TURN / 2 ? d - TURN : d) / KALAMSA;
  }

  /** Solve f(λ) ≡ target (mod a turn) for a monotonic f of the tropical longitude: 1° scan, then bisection. */
  function invertMonotonic(f, target) {
    const g = (l) => { const d = mod(f(l) - target, TURN); return d > TURN / 2 ? d - TURN : d; };
    let a = 0, ga = g(0);
    for (let b = 1; b <= 360; b += 1) {
      const gb = g(b);
      if (ga < 0 && gb >= 0 && gb - ga < TURN / 4) { for (let i = 0; i < 60; i++) { const m = (a + b) / 2; if (g(m) < 0) a = m; else b = m; } return mod((a + b) / 2, 360); }
      a = b; ga = gb;
    }
    return null;
  }
  /** The lagna by each point's own horizon: the tropical λ whose own rising — its right ascension less its half-day
   *  (3.42 at the point, 2.61-2.63) — is the meridian's asus less nothing: RA(λ) − 15 ghaṭīs − cara(δ(λ)) = meridian.
   *  The same geometry as 3.46-3.48 without their proportion within a sign. */
  const lagnaOwn = (meridianAsus, palabha) => invertMonotonic((l) => horizonAsus(l, kranti(l), palabha, "east"), meridianAsus);
  /** The madhya-lagna by 3.42 at the point: the λ whose right ascension is the meridian's asus. */
  const madhyaLagnaOwn = (meridianAsus) => invertMonotonic(rightAscension, meridianAsus);

  /** 7.8-7.10 at the horizon: the longitude (tropical, degrees) of the ecliptic point that rises or sets with a body of
   *  latitude `latArcmin` (north +) at λ. Returns the corrected longitude and both parts in arcminutes. */
  function drkkarma(lam, latArcmin, palabha, side) {
    if (side !== "east" && side !== "west") throw new RangeError('ss-udaya: side is "east" or "west"');
    const aksa = (side === "west" ? 1 : -1) * latArcmin * palabha / 12;          // 7.8 with nata = half-day; 7.9
    const ayana = -latArcmin * kranti(lam + 90) / 60;                            // 7.10: seconds → minutes; alike → subtract
    return { lambda: mod(lam + (aksa + ayana) / 60, 360), aksaArcmin: aksa, ayanaArcmin: ayana };
  }

  /** 10.1-10.4: at sunset after a conjunction — Sun and Moon tropical (degrees), the Moon's latitude (arcmin, north +), the
   *  daily motions (arcmin a day), the palabhā. Returns the asus from sunset to moonset (iterated), the kālāṃśa, and whether
   *  the Moon is seen (≥ 12 kālāṃśa). */
  function moonAfterSunset(st, opts) {
    const { sun, moon, moonLatArcmin, sunBhukti, moonBhukti, palabha } = st;
    const own = !(opts && opts.drk === "aksa");                                   // default: each body's own horizon
    const rs = risings(palabha, opts);
    // signed: a Moon setting before the Sun (south of it, just after the conjunction) is a negative gap, not most of a turn
    const gap = (s, m) => {
      const x = own ? mod(bodyHorizonAsus(m, moonLatArcmin, palabha, "west") - horizonAsus(s, kranti(s), palabha, "west"), TURN)
        : intervalAsus(s + 180, drkkarma(m, moonLatArcmin, palabha, "west").lambda + 180, rs);
      return mod(m - s, 360) < 90 && x > TURN / 2 ? x - TURN : x;                 // only near the conjunction can it be "before"
    };
    const first = gap(sun, moon);
    let asus = first, steps = 0;
    for (; steps < 30; steps++) {                                                  // 10.3-10.4
      const nadika = asus / GHATI;
      const s = sun + sunBhukti * nadika / 60 / 60, m = moon + moonBhukti * nadika / 60 / 60;
      const next = gap(s, m);
      if (Math.abs(next - asus) < 1e-9) { asus = next; break; }
      asus = next;
    }
    const k = first / KALAMSA;
    return { kalamsa: k, visible: k >= DARSHANA_KALAMSA, moonsetAfterSunsetAsus: asus, moonsetAfterSunsetGhati: asus / GHATI, steps, drk: own ? "own" : "aksa" };
  }

  return Object.freeze({ R, PARAMA, TURN, QUARTER, GHATI, KALAMSA, DARSHANA_KALAMSA, krantiJya, kranti, dyujya, palabhaOf, caraAsus, halfDay,
    lankaRisings, risings, ascension, longitudeOfAscension, intervalAsus, kalamsa, lagna, sinceSunrise, lagnaFromMeridian, madhyaLagna,
    drkkarma, moonAfterSunset, lagnaOwn, madhyaLagnaOwn, caraOfKrantiJya, rightAscension, horizonAsus, bodyHorizonAsus, starHorizonAsus, kalamsaOwn,
    sine: S.sine || "table", withSine: (name) => ssUdaya(S.withSine(name)) });
});
