/* drik-tier.js — REFEREE B (परीक्षक), not a tier · relabelled 2026-10-08 (owner decisions: three choices; DK-1, DK-2)
   Since 2026-10-08 the "Modern Bhāratīya (dṛk)" choice is served ONLY by siddhanta-tier.js (the owner's own series,
   1850.0–2150.0, refused outside). This file is kept as an independent referee for comparison rows and tests, and is
   never a page's source and never a fallback:
     • tropicalGrahas(jd): Astronomy Engine 2.1.19 (MIT, bundled as drik-engine.js — attribution, not derivation);
     • grahas(jd): VSOP87B + ELP/MPP02 (astronomia, MIT) through math-core drigCoordinates ("full" theories), or
       Astronomy Engine only if the loaded math-core has no drigCoordinates (math-core itself is required: the tier's
       ayanāṃśa needs its ΔT, and without it grahas() throws) — apparent, true ecliptic of date — minus the SAME ayanāṃśa the tier
       applies (Citrā-pakṣa true, SiddhantaTier.ayanamsha), so a referee row differs from the tier by the ephemeris
       only. Rāhu: the Meeus mean node (AA ch. 47) + Δψ; Ketu = Rāhu + 180°.
   It answers only where the tier itself answers (1850.0–2150.0): outside that span grahas() returns null, so it can
   never stand in for the tier. Named ayanāṃśas other than 'citra-paksha' throw (DK-2: one ayanāṃśa per tier).
   Works in browser (window.DrikTier; load after math-core.js, siddhanta-drik.js and siddhanta-tier.js) and node. */
(function (root) {
  "use strict";
  function getAstro() {
    if (root.Astronomy) return root.Astronomy;
    if (typeof require === "function") {
      try { return require("./drik-engine.js"); } catch (e) { /* local bundle */ }
    }
    return null;
  }
  function getTier() {
    if (root.SiddhantaTier) return root.SiddhantaTier;
    if (typeof require === "function") {
      try { return require("./siddhanta-tier.js"); } catch (e) { /* not present */ }
    }
    return null;
  }
  const mod360 = (d) => ((d % 360) + 360) % 360;

  function jdToTime(A, jd) {
    return A.MakeTime(new Date((jd - 2440587.5) * 86400000));
  }

  // मध्य-राहु (mean ascending node), tropical, mean equinox of date. Meeus AA ch.47 polynomial.
  function meanRahuTropical(jd) {
    const T = (jd - 2451545.0) / 36525;
    return mod360(125.0445479 - 1934.1362891 * T + 0.0020754 * T * T +
      T * T * T / 467441 - T * T * T * T / 60616000);
  }

  const PLANETS = { mangala: "Mars", budha: "Mercury", guru: "Jupiter", shukra: "Venus", shani: "Saturn" };

  /** Astronomy Engine's tropical longitudes (apparent Sun and Moon; planets geocentric with light-time, true ecliptic
   *  of date). A referee's raw output; no ayanāṃśa. */
  function tropicalGrahas(jd) {
    const A = getAstro();
    if (!A) return null;
    const t = jdToTime(A, jd);
    const out = {};
    out.surya = mod360(A.SunPosition(t).elon);
    out.candra = mod360(A.EclipticGeoMoon(t).lon);
    const rot = A.Rotation_EQJ_ECT(t);
    for (const [key, body] of Object.entries(PLANETS)) {
      const vec = A.GeoVector(A.Body[body], t, true);
      const e = A.RotateVector(rot, vec);
      out[key] = mod360(Math.atan2(e.y, e.x) * 180 / Math.PI);
    }
    out.rahu = meanRahuTropical(jd);
    out.ketu = mod360(out.rahu + 180);
    return out;
  }

  function rejectNamed(variant) {
    if (variant === undefined || variant === null || variant === "" || variant === "citra-paksha") return;
    throw new RangeError(`DrikTier (referee B) uses the dṛk tier's own ayanāṃśa, Citrā-pakṣa true (owner decision DK-2, 2026-10-08); "${variant}" is not accepted`);
  }

  /** Sidereal referee rows at jd (UT): { jd, ayanamshaDeg, frame:'citra-paksha', role:'referee', tier, surya … ketu }.
   *  null when the dṛk tier does not answer at jd (outside 1850.0–2150.0) or no referee theory is loaded. */
  function grahas(jd, ayanamshaVariant) {
    rejectNamed(ayanamshaVariant);
    const ST = getTier();
    if (!ST || typeof ST.ayanamsha !== "function") return null;
    const ay = ST.ayanamsha(jd);
    if (!ay) return null;
    const rahu = mod360(meanRahuTropical(jd) + ay.nutationDeg - ay.deg);
    const M = root.ShunyaMath;
    if (M && typeof M.drigCoordinates === "function") {
      const out = { jd, ayanamshaDeg: ay.deg, frame: "citra-paksha", role: "referee", tier: LABEL.refereeB };
      for (const k of ["surya", "candra", "mangala", "budha", "guru", "shukra", "shani"]) {
        const coords = M.drigCoordinates(k, jd, { planetaryTheory: "full", lunarTheory: "full" });
        out[k] = mod360(coords.longitude - ay.deg);
      }
      out.rahu = rahu; out.ketu = mod360(rahu + 180);
      return out;
    }
    const trop = tropicalGrahas(jd);
    if (!trop) return null;
    const out = { jd, ayanamshaDeg: ay.deg, frame: "citra-paksha", role: "referee", tier: LABEL.refereeAE };
    for (const k of ["surya", "candra", "mangala", "budha", "guru", "shukra", "shani"]) out[k] = mod360(trop[k] - ay.deg);
    out.rahu = rahu; out.ketu = mod360(rahu + 180);
    return out;
  }

  const LABEL = Object.freeze({
    role: "referee",
    refereeB: "referee B: VSOP87B + ELP/MPP02 (astronomia, MIT) via math-core drigCoordinates — a foreign theory used only to check the dṛk tier, never a page's source",
    refereeAE: "referee: Astronomy Engine 2.1.19 (MIT) — a foreign theory used only to check the dṛk tier, never a page's source",
    sa: "परीक्षक (बाह्य सिद्धान्त) — केवल तुलना हेतु",
  });

  root.DrikTier = {
    available: () => Boolean(getAstro()),
    tropicalGrahas,
    grahas,
    meanRahuTropical,
    role: "referee",
    LABEL,
    seal: "REFEREE (not served) · VSOP87B + ELP/MPP02 (astronomia, MIT) / astronomy-engine (MIT)",
  };
  if (typeof module === "object" && module.exports) {
    module.exports = root.DrikTier;
  }
})(typeof globalThis !== "undefined" ? globalThis : this);
