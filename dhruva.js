/* dhruva.js — ध्रुव, the fixed point of the sovereign (vedha-yantra) engine.
 *
 * The Sūrya-Siddhānta's sky: "bhacakraṃ dhruvayor baddham … paryety ajasram" — the star-wheel is bound to the two
 * dhruvas and turns without pause, the planets' orbits bound to it (SS 12.73). The elevation of the dhruva is the measure
 * of where one stands (12.72; 12.43-44). The gola has a rod through its centre for the axis (13.4). The junction stars
 * of ch.8 are given as DHRUVAKA and VIKṢEPA: the dhruvaka is the point of the ecliptic cut by the circle drawn from the
 * dhruva through the star, the vikṣepa the arc of that circle from the ecliptic to the star — and 8.12 orders both to be
 * checked on the gola. So the whole space frame hangs from the dhruva, as the time frame hangs from its turn (kala-dvara.js).
 *
 * What is fixed is the dhruva POINT, the axis of the turn. A star near it is not exactly on it: it circles the point once
 * a turn. So this module finds the dhruva from observations instead of assuming a star sits on it:
 *   • latitude = the dhruva's elevation = the mean of a circumpolar star's upper and lower meridian altitudes;
 *   • true north = the midpoint of its two greatest elongations;
 *   • obliquity and latitude from the two solstitial noon zenith distances.
 * These are exact (rational arcseconds). The sphere geometry (polar ↔ equatorial ↔ ecliptic) is trigonometric and
 * floating-point: it is sphuṭa-layer arithmetic, a certificate within its tolerance, not a theorem.
 *
 * Obliquity: SS 2.28 gives the sine of the greatest declination as 1397 on R = 3438. That is the default; an owner's
 * measured value replaces it through the `epsilon` argument. No imports, nothing from any modern source.
 * Browser: window.Dhruva; node: module.exports.
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.Dhruva = factory();
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";
  const D2R = Math.PI / 180, R2D = 180 / Math.PI;
  const SS_PARAMAPAKRAMA_JYA = 1397, SS_RADIUS = 3438;
  const SS_EPSILON_DEG = Math.asin(SS_PARAMAPAKRAMA_JYA / SS_RADIUS) * R2D;   // 23.976…°
  const norm = (x) => ((x % 360) + 360) % 360;

  const big = (x, what) => {
    if (typeof x === "bigint") return x;
    if (!Number.isInteger(x)) throw new TypeError(`dhruva: ${what} must be an integer number of arcseconds`);   // also refuses NaN and ±Infinity
    return BigInt(x);
  };
  const QUARTER = 324000n, HALF = 648000n;                      // 90° and 180° in arcseconds

  // ── exact: the dhruva from observation ─────────────────────────────────────────────────────────
  /** A circumpolar star's meridian altitudes above the north horizon at upper and lower transit (integer arcseconds) →
   *  the dhruva's elevation (= latitude, SS 12.72) and the star's distance from the dhruva. Exact rationals {num, den}.
   *  Both altitudes are read from the north point of the horizon, as this convention says: a star whose upper transit
   *  passes south of the zenith reads more than 90° there (100° = 80° above the south point), so `upper` may exceed 90°.
   *  Physical domain, refused otherwise (RangeError): 0 < lower ≤ upper — the lower transit above the horizon, or the
   *  star is not circumpolar — and elevation (upper + lower)/2 ≤ 90°; the polar distance (upper − lower)/2 is then ≥ 0. */
  function dhruvaFromCulminations({ upper, lower }) {
    const u = big(upper, "upper altitude"), l = big(lower, "lower altitude");
    if (l > u) throw new RangeError("dhruva: the upper transit is the higher one");
    if (l <= 0n) throw new RangeError("dhruva: the lower transit must be above the north horizon (lower > 0): a star that reaches the horizon is not circumpolar");
    if (u + l > HALF) throw new RangeError("dhruva: these altitudes put the dhruva more than 90° above the horizon; no place has that latitude");
    return { elevation: { num: u + l, den: 2n }, polarDistance: { num: u - l, den: 2n } };
  }
  /** Azimuths of a circumpolar star at its eastern and western greatest elongation, read from a provisional north line
   *  (east positive, integer arcseconds) → where true north lies on that scale. Exact rational, for any integers (the
   *  scale is the observer's own); finite integers only (TypeError otherwise). */
  function northFromElongations({ east, west }) {
    return { num: big(east, "east azimuth") + big(west, "west azimuth"), den: 2n };
  }
  /** Signed noon zenith distances of the Sun (south of the zenith positive, integer arcseconds) at the two solstices →
   *  obliquity and latitude. Exact rationals. Works where the summer Sun passes north of the zenith (latitude < obliquity).
   *  Physical domain, refused otherwise (RangeError): 0° < ε < 90° (the winter reading the larger) and |latitude| ≤ 90°. */
  function fromSolsticeZenithDistances({ summer, winter }) {
    const s = big(summer, "summer zenith distance"), w = big(winter, "winter zenith distance");
    if (w - s <= 0n) throw new RangeError("dhruva: the winter zenith distance must exceed the summer one (the obliquity is positive)");
    if (w - s >= HALF) throw new RangeError("dhruva: these zenith distances give an obliquity of 90° or more");
    if (w + s > HALF || w + s < -HALF) throw new RangeError("dhruva: these zenith distances give a latitude beyond 90°");
    return { epsilon: { num: w - s, den: 2n }, latitude: { num: w + s, den: 2n } };
  }

  // ── sphere geometry about the dhruva (degrees; sāyana longitudes) ──────────────────────────────
  // Inputs must be finite numbers (TypeError), latitudes and declinations within ±90° and ε (if given) inside (0°, 90°)
  // (RangeError); inside that domain the arithmetic is unchanged.
  const fin = (x, what) => {
    if (typeof x !== "number" || !Number.isFinite(x)) throw new TypeError(`dhruva: ${what} must be a finite number of degrees, got ${x}`);
    return x;
  };
  const upTo90 = (x, what) => {
    fin(x, what);
    if (x < -90 || x > 90) throw new RangeError(`dhruva: ${what} ${x}° is outside [−90°, 90°]`);
    return x;
  };
  const eps = (e) => {
    if (e === undefined) return SS_EPSILON_DEG * D2R;
    fin(e, "the obliquity ε");
    if (!(e > 0 && e < 90)) throw new RangeError(`dhruva: the obliquity ε ${e}° is outside (0°, 90°)`);
    return e * D2R;
  };
  /** Ecliptic (λ, β) → equatorial (α, δ). */
  function eclipticToEquatorial(lambda, beta, epsilon) {
    fin(lambda, "λ"); upTo90(beta, "β");
    const e = eps(epsilon), l = lambda * D2R, b = beta * D2R;
    const sd = Math.sin(b) * Math.cos(e) + Math.cos(b) * Math.sin(e) * Math.sin(l);
    const a = Math.atan2(Math.sin(l) * Math.cos(e) - Math.tan(b) * Math.sin(e), Math.cos(l));
    return { alpha: norm(a * R2D), delta: Math.asin(Math.max(-1, Math.min(1, sd))) * R2D };
  }
  /** Equatorial (α, δ) → ecliptic (λ, β). */
  function equatorialToEcliptic(alpha, delta, epsilon) {
    fin(alpha, "α"); upTo90(delta, "δ");
    const e = eps(epsilon), a = alpha * D2R, d = delta * D2R;
    const sb = Math.sin(d) * Math.cos(e) - Math.cos(d) * Math.sin(e) * Math.sin(a);
    const l = Math.atan2(Math.sin(a) * Math.cos(e) + Math.tan(d) * Math.sin(e), Math.cos(a));
    return { lambda: norm(l * R2D), beta: Math.asin(Math.max(-1, Math.min(1, sb))) * R2D };
  }
  /** Polar (dhruvaka λp, vikṣepa bp) → equatorial. The star and its dhruvaka point share the circle through the dhruva,
   *  so they share α; along that circle arcs add, so δ = δ(point) + vikṣepa. */
  function polarToEquatorial(dhruvaka, vikshepa, epsilon) {
    fin(dhruvaka, "the dhruvaka"); fin(vikshepa, "the vikṣepa");
    const e = eps(epsilon), lp = dhruvaka * D2R;
    const alpha = norm(Math.atan2(Math.sin(lp) * Math.cos(e), Math.cos(lp)) * R2D);
    const deltaPoint = Math.asin(Math.sin(e) * Math.sin(lp)) * R2D;
    const delta = deltaPoint + vikshepa;
    if (Math.abs(delta) > 90) throw new RangeError("dhruva: this vikṣepa would carry the star past the dhruva");
    return { alpha, delta };
  }
  /** Equatorial → polar (dhruvaka, vikṣepa): the ecliptic point with the same α, and the arc from it along the circle. */
  function equatorialToPolar(alpha, delta, epsilon) {
    fin(alpha, "α"); upTo90(delta, "δ");
    const e = eps(epsilon), a = alpha * D2R;
    const dhruvaka = norm(Math.atan2(Math.sin(a), Math.cos(a) * Math.cos(e)) * R2D);
    const deltaPoint = Math.asin(Math.sin(e) * Math.sin(dhruvaka * D2R)) * R2D;
    return { dhruvaka, vikshepa: delta - deltaPoint };
  }
  /** Ecliptic → polar: what SS 8.14-8.15 need to compare a planet with a star's dhruvaka. */
  function eclipticToPolar(lambda, beta, epsilon) { const q = eclipticToEquatorial(lambda, beta, epsilon); return equatorialToPolar(q.alpha, q.delta, epsilon); }
  /** Polar → ecliptic: a star's ecliptic place, which (unlike its polar place) does not depend on where the dhruva points. */
  function polarToEcliptic(dhruvaka, vikshepa, epsilon) { const q = polarToEquatorial(dhruvaka, vikshepa, epsilon); return equatorialToEcliptic(q.alpha, q.delta, epsilon); }
  /** Meridian altitudes of a body of declination δ at latitude φ: upper transit (measured from the horizon on the side it
   *  culminates) and lower transit (above the north horizon; negative = below). δ and φ within ±90°. */
  function meridianAltitudes(delta, latitude) {
    upTo90(delta, "δ"); upTo90(latitude, "the latitude φ");
    return { upper: 90 - Math.abs(latitude - delta), lower: latitude + delta - 90 };
  }

  return Object.freeze({
    SS_PARAMAPAKRAMA_JYA, SS_RADIUS, SS_EPSILON_DEG,
    dhruvaFromCulminations, northFromElongations, fromSolsticeZenithDistances,
    eclipticToEquatorial, equatorialToEcliptic, polarToEquatorial, equatorialToPolar, eclipticToPolar, polarToEcliptic, meridianAltitudes,
  });
});
