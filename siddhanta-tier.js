/* सिद्धान्त-दृक् tier adapter · 2026-09-21
   The Sūrya-Siddhānta structure (madhyama → manda → śīghra-karṇa → anyonya → dṛk-saṃskāra → ayana) with
   bīja-corrected bhagaṇas and arc-second coefficients fitted to the author's own N-body (BHARAT-SOVEREIGN-ENGINE).
   Substrate: siddhanta-drik.js (generated; no VSOP/ELP/JPL at run time). Frame: tropical of date (IAU 2006/2000B
   vector rotations) → sidereal via ShunyaMath ayanāṃśa. Rāhu = मध्य-पात (fitted node line) + Δψ; Ketu = Rāhu + 180°.
   Time: jd (UT) → TT with ShunyaMath.observedDeltaTSeconds (IERS table), else Espenak–Meeus. Works in browser and node. */
(function (root) {
  "use strict";
  function getSD() {
    if (root.SiddhantaDrik) return root.SiddhantaDrik;
    if (typeof require === "function") { try { return require("./siddhanta-drik.js"); } catch (e) { /* not built */ } }
    return null;
  }
  const mod360 = (d) => ((d % 360) + 360) % 360;
  function deltaTSeconds(jdUT) {
    const M = root.ShunyaMath;
    if (M && typeof M.observedDeltaTSeconds === "function") return M.observedDeltaTSeconds(jdUT - 2451545.0);
    const y = 2000 + (jdUT - 2451545.0) / 365.25, t = y - 2000;             // Espenak–Meeus 2005–2050 form (fallback only)
    return 62.92 + 0.32217 * t + 0.005589 * t * t;
  }
  const KEYS = { surya: "surya", candra: "chandra", chandra: "chandra", mangala: "mangala", budha: "budha", guru: "guru", shukra: "shukra", shani: "shani", rahu: "rahu", ketu: "ketu" };
  /** Apparent tropical longitudes of date, degrees (keys as the site uses them: surya, candra, …). */
  function tropicalGrahas(jd, opts) {
    const SD = getSD(); if (!SD) return null;
    const jdTT = (opts && opts.timeScale === "TT") ? jd : jd + deltaTSeconds(jd) / 86400;
    if (!SD.core.inCertifiedSpan(jdTT)) return null;         // certified 1850–2150 only: outside, the series diverge — refuse rather than mislead
    const g = SD.grahaOfDate(jdTT);
    const out = { jdTT, deltaTSeconds: (jdTT - jd) * 86400 };
    for (const [site, engine] of Object.entries(KEYS)) if (g[engine] !== undefined) out[site] = mod360(g[engine]);
    out._lat = {}; for (const [site, engine] of Object.entries(KEYS)) if (g._lat[engine] !== undefined) out._lat[site] = g._lat[engine];
    out._dist = {}; for (const [site, engine] of Object.entries(KEYS)) if (g._dist[engine] !== undefined) out._dist[site] = g._dist[engine];
    return out;
  }
  /** Sidereal longitudes (tropical − ayanāṃśa), like DrikTier.grahas. */
  function grahas(jd, ayanamshaVariant, opts) {
    const trop = tropicalGrahas(jd, opts); if (!trop) return null;
    const M = root.ShunyaMath, variant = ayanamshaVariant || "spica_lahiri";
    const ay = M && typeof M.ayanamshaDeg === "function" ? M.ayanamshaDeg(jd, variant) : 0;
    const out = { jd, jdTT: trop.jdTT, ayanamshaDeg: ay, frame: variant, tier: "सिद्धान्त-दृक् (SS structure · own N-body coefficients)", _lat: trop._lat, _dist: trop._dist };
    for (const k of ["surya", "candra", "mangala", "budha", "guru", "shukra", "shani", "rahu", "ketu"]) if (trop[k] !== undefined) out[k] = mod360(trop[k] - ay);
    return out;
  }
  function series() { const SD = getSD(); return SD ? SD.series : null; }
  root.SiddhantaTier = {
    available: () => Boolean(getSD()),
    certifiedSpan: () => { const SD = getSD(); return SD ? SD.core.CERTIFIED.slice() : null; },
    inSpan: (jd) => { const SD = getSD(); return Boolean(SD) && SD.core.inCertifiedSpan(jd + deltaTSeconds(jd) / 86400); },
    tropicalGrahas, grahas, deltaTSeconds, series,
    bhaganas: () => { const S = series(); return S ? S.bhaganas : null; },
    certification: () => { const S = series(); return S ? (S.certification || null) : null; },
    seal: "SIDDHA (own N-body → Sūrya-Siddhānta structure) · substrate: BHARAT-SOVEREIGN-ENGINE",
  };
  if (typeof module === "object" && module.exports) module.exports = root.SiddhantaTier;
})(typeof globalThis !== "undefined" ? globalThis : this);
