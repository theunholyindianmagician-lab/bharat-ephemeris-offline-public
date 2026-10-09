// Triveni Sangam extension tests — run: node triveni.test.js
// Locks the 2026-08-17 Triveni Sangam extension layer of math-core.js.
"use strict";
const assert = require("node:assert");
require("./math-core.js");
const M = globalThis.ShunyaMath;

let passed = 0, total = 0;
function test(name, fn) {
  total += 1;
  try { fn(); passed += 1; console.log("✓ " + name); }
  catch (e) { console.error("✗ " + name + "\n  " + e.message); process.exitCode = 1; }
}

test("D=9 Natal-ID lattice arithmetic: (20,11,17) → 14894 DEEP", () => {
  const nid = M.computeNatalId(20, 11, 17);
  assert.equal(nid.cell, 14894);
  assert.equal(nid.zone, "DEEP");
  assert.equal(nid.latticeCells, 19683);
  // lattice corners
  assert.equal(M.computeNatalId(13, 13, 13).zone, "BINDU");  // Hasta triple = centre
  assert.equal(M.computeNatalId(0, 0, 0).cell, 0);
  assert.equal(M.computeNatalId(26, 26, 26).cell, 19682);
});

test("dasha-breath 972-lattice: Śukra 20y = 972×160000; every daśā divides by 972", () => {
  const v = M.dashaBreathCount(20);
  assert.equal(v.breaths, 155520000);
  assert.equal(v.factor972, 160000);
  assert.equal(v.ajapaMalasPerDay, 200);
  assert.equal(v.breathsPerNakshatra, 800);
  for (const row of M.vimshottariBreathTable()) {
    assert.ok(Number.isInteger(row.factor972), row.lord + " must divide by 972");
  }
  const totalYears = M.vimshottariBreathTable().reduce((s, r) => s + r.years, 0);
  assert.equal(totalYears, 120);
});

test("972-laya theorem: 972 | N·21600 ⟺ 9 | N (27✓ 28✗ 30✗ 35✗)", () => {
  assert.equal(M.isLaya972(27), true);
  assert.equal(M.isLaya972(28), false);
  assert.equal(M.isLaya972(30), false);
  assert.equal(M.isLaya972(35), false);
  for (let n = 1; n <= 120; n++) assert.equal(M.isLaya972(n), n % 9 === 0);
});

test("pada108 agrees with the D9 varga engine across the whole zodiac", () => {
  for (let d = 0.5; d < 360; d += 3.17) {
    const p = M.pada108(d);
    assert.ok(p.d9Check, "pada108 vs D9 mismatch at " + d);
    assert.ok(p.quarter >= 1 && p.quarter <= 108);
  }
});

test("dual-path day seal: nākṣatra breath 3.9890783 s ≡ exactly 1 kalā of rotation", () => {
  const dp = M.dualDayPaths();
  assert.ok(Math.abs(dp.nakshatra.breathS - 3.9890783) < 1e-6);
  assert.ok(Math.abs(dp.nakshatra.kalaPerBreath - 1.0) < 1e-7);
  assert.equal(dp.savana.breathS, 4);
  assert.ok(Math.abs(dp.suryaSiddhantaOwn.dayS - 86164.10120) < 1e-4);
  assert.ok(Math.abs(dp.divergencePctPerDay - 0.2738) < 1e-3);
});

test("Drik-anchor honesty gate (BE-S09) at J2000.0, Ujjain: lagna nakṣatra exact, Sun < 1°, Moon < 3.5° (the text tier since 2026-10-08)", () => {
  // Re-anchored 2026-10-08 on a neutral public instant, fixed before any result was computed:
  // J2000.0 = 2000-01-01 12:00 TT = JD 2451545.0 TT, at Ujjain (23.1765 N, 75.7885 E).
  // The engine's functions take JD in UT and drigCoordinates converts UT→TT with the observed ΔT table,
  // so the instant is passed as UT1 = TT − ΔT with ΔT(2000.0) = 63.829 s (that table's 2000 value):
  // 2000-01-01 11:58:56.171 UT1, which the engine maps back to TT = JD 2451545.0 exactly.
  // References (frozen in REF) were computed with this repository's own dṛk tier, not taken from any
  // external API, and are independent of the native frame under test (other theory, other ayanāṃśa):
  //   Sun, Moon: DrikTier.grahas(jd), i.e. math-core drigCoordinates with the "full" planetary and lunar
  //     theories (VSOP87B, ELP/MPP02), apparent longitude on the true ecliptic of date, minus the
  //     spica_lahiri (Lahiri) ayanāṃśa; the old gate's reference was Lahiri too.
  //   Lagna: atan2(cos θ, −(sin θ cos ε + tan φ sin ε)) with θ = Astronomy.SiderealTime (GAST) × 15 + east
  //     longitude and ε = Astronomy.e_tilt().tobl (true obliquity), both from drik-engine.js (the dṛk
  //     tier's astronomy-engine substrate), minus the same spica_lahiri ayanāṃśa.
  // Native frame under test, as before: canonicalGrahaModel (classical sphuṭa) and siderealAscendantDeg
  // (GMST, mean obliquity, default classical frame). Tolerances are the old gate's: Sun < 1°,
  // Moon < 3.5°, lagna nakṣatra exact.
  // MEASURED 2026-10-08, before D2 (native − dṛk): Sun −0.45°, Moon −5.56°, lagna +3.35°; the Moon did not meet 3.5°.
  // RE-MEASURED 2026-10-08 after D2 (the native frame is now the text tier 'ss' — the Sūrya-Siddhānta's own day count,
  // no ΔT, no modern lunar terms; the lagna by Panchanga.lagnaAt in the text's frame), at the same instant, no other
  // instant tried: Sun −0.238°, Moon −1.197°, lagna +0.105° (Ārdrā) — scripts/refreeze-text-tier.cjs, cross-checked
  // against 68905b9's arithmetic (≤ 1.07e-6°). All three pass the old tolerances, so the Moon's 3.5° is an active
  // assertion again (a strengthening), and the measured offset stays pinned so any change shows.
  // The REF provenance is now checked against the referee itself (math-core drigCoordinates, full VSOP87B/ELP theories,
  // minus the named linear Lahiri) — the computation drik-tier.js made when REF was frozen — so that a change of
  // drik-tier.js (it now serves the Modern Bhāratīya tier) cannot move the references.
  const A = require("./drik-engine.js");
  const jd = 2451545.0 - 63.829 / 86400;
  const LAT = 23.1765, LON = 75.7885;
  const REF = { sun: 256.5072, moon: 199.4539, lagna: 72.2015 };
  const signed = (d) => ((d % 360) + 540) % 360 - 180;
  const wrap = (d) => Math.abs(signed(d));
  // provenance: the referee still yields the frozen references
  const lahiri = M.ayanamshaDeg(jd, "spica_lahiri");
  const refOf = (k) => M.mod360(M.drigCoordinates(k, jd, { planetaryTheory: "full", lunarTheory: "full" }).longitude - lahiri);
  const t = A.MakeTime(new Date((jd - 2440587.5) * 86400000));
  const th = (A.SiderealTime(t) * 15 + LON) * Math.PI / 180;
  const eps = A.e_tilt(t).tobl * Math.PI / 180, phi = LAT * Math.PI / 180;
  const lagnaRef = Math.atan2(Math.cos(th), -(Math.sin(th) * Math.cos(eps) + Math.tan(phi) * Math.sin(eps))) * 180 / Math.PI - lahiri;
  assert.ok(wrap(refOf("surya") - REF.sun) < 1e-3, `referee Sun ${refOf("surya")} moved from REF`);
  assert.ok(wrap(refOf("candra") - REF.moon) < 1e-3, `referee Moon ${refOf("candra")} moved from REF`);
  assert.ok(wrap(lagnaRef - REF.lagna) < 1e-3, `referee lagna ${lagnaRef} moved from REF`);
  // the gate, on the text tier (the API default 'ss')
  const g = M.canonicalGrahaModel(jd);
  const sun = g.find((p) => p.key === "surya").longitude;
  const moon = g.find((p) => p.key === "candra").longitude;
  const asc = M.siderealAscendantDeg(jd, LAT, LON);
  assert.equal(M.computeNakshatraDetails(REF.lagna).index, 5);
  assert.equal(M.computeNakshatraDetails(asc).index, 5, "Lagna nakshatra must be exact (Ārdrā)");
  assert.ok(wrap(sun - REF.sun) < 1.0, `Sun offset ${wrap(sun - REF.sun).toFixed(2)}° must stay < 1°`);
  const moonOff = signed(moon - REF.moon);
  assert.ok(Math.abs(moonOff) < 3.5, `Moon offset ${moonOff.toFixed(3)}° must stay < 3.5°`);
  assert.ok(Math.abs(moonOff - -1.197) < 0.01, `Moon offset ${moonOff.toFixed(3)}° changed from the measured −1.197°`);
  assert.ok(Math.abs(signed(sun - REF.sun) - -0.238) < 0.01, "Sun offset changed from the measured −0.238°");
  assert.ok(Math.abs(signed(asc - REF.lagna) - 0.105) < 0.01, "lagna offset changed from the measured +0.105°");
  // AY-16: the frame applied is the frame shown — in each text tier the sāyana lagna and Sun are the sidereal ones plus
  // exactly the tier's ayanāṃśa (SS 3.9-3.10), not only the same nakṣatra
  for (const tier of ["ss", "ss+parameshvara"]) {
    const A_ = M.tierAyanamsha(jd, tier).deg;
    assert.ok(Math.abs(M.sayanaAscendantDeg(jd, LAT, LON, tier) - M.siderealAscendantDeg(jd, LAT, LON, tier) - A_) < 1e-9, tier);
    const s = M.getSolarCoordinates(jd, tier);
    assert.ok(Math.abs(signed(s.tropical - s.sidereal - A_)) < 1e-9, tier);
    assert.equal(M.coordinateFrameOffsetDeg(jd, tier), A_);
  }
});

test("geodesy: berryPhase computed from coords; Ujjain–Kashi haversine sane", () => {
  const bp = M.sacredGeospatialBerryPhase();
  assert.ok(Math.abs(bp.sphericalExcessRad - 0.040479) < 1e-4); // legacy constant was the real excess
  assert.ok(bp.areaKm2 > 1.5e6 && bp.areaKm2 < 1.8e6);
  const d = M.haversineKm(23.1765, 75.7885, 25.3109, 83.0107); // Ujjain → Kashi
  assert.ok(d > 700 && d < 800, "Ujjain-Kashi ≈ 740 km, got " + d.toFixed(1));
});

test("moonrise: Ujjain 2026-08-17 (śukla caturthī) — the dṛk tier sets ≈2h after sunset on its +7′ horizon; the text tier's own Moon sets 2.93 h after its sunset", () => {
  const mid = M.gregorianToJulianDay("2026-08-17", "00:00:00", 5.5);
  // a statement about the sky: the dṛk tier (siddhanta-tier.js riseSet, the Moon's centre on a net +7′ horizon, KH-13)
  const mr = M.lunarRiseSet(mid, 23.1765, 75.7885, 5.5, "drik");
  assert.ok(!mr.circumpolar && !mr.neverRises);
  assert.ok(mr.riseLocal && mr.setLocal);
  assert.equal(mr.horizonAltitudeDeg, 7 / 60);
  const setH = Number(mr.setLocal.slice(0, 2)) + Number(mr.setLocal.slice(3, 5)) / 60;
  assert.ok(setH > 19.5 && setH < 22.5, "moonset " + mr.setLocal + " should be ~2h after 18:54 sunset");
  // the text tier (utsava.js: the Moon's centre, no parallax or refraction, in the civil day from sunrise) — measured
  // 2026-10-08: moonset 21:51:33 IST, 2.933 h after the text's sunset 18:55:32
  const ss = M.lunarRiseSet(mid, 23.1765, 75.7885, 5.5, "ss"), sun = M.solarRiseSet(mid, 23.1765, 75.7885, 5.5, "ss");
  assert.equal(ss.horizonAltitudeDeg, 0);
  assert.equal(ss.setLocal, "21:51:33");
  assert.ok(Math.abs((ss.jdSet - sun.jdSet) * 24 - 2.933) < 0.001);
});

test("दृग्गणित-संस्कार overlay: samskrita is base + its own correction (never the referee's value); its errors are measured, not claimed", () => {
  // 2026-10-08 (plan refreeze (c)): the old test passed only because samskrita WAS the dṛk referee's value whenever
  // DrikTier was loaded. That false claim is withdrawn: samskrita is now always base + the fitted correction, the base
  // is the text tier, and the overlay's errors at this instant are pinned as measured against the referee (VSOP87B/ELP
  // full theories minus the named linear Lahiri, the frame the overlay was fitted in). Measured 2026-10-08, arcmin:
  // Sun 11.80, Moon 177.22, Mars 27.33, Mercury −8.19, Venus 1676.85, Jupiter 7.15, Saturn −0.81 — the fit (made on the
  // retired classical pipeline) does not hold on the text tier; fitStatus says so.
  const jd = M.gregorianToJulianDay("2026-08-17", "04:00:00", 5.5);
  const k = M.keralaDrikSphuta(jd);
  const signed = (d) => ((d % 360) + 540) % 360 - 180;
  const lahiri = M.ayanamshaDeg(jd, "spica_lahiri");
  const ref = (g) => M.mod360(M.drigCoordinates(g, jd, { planetaryTheory: "full", lunarTheory: "full" }).longitude - lahiri);
  const MEASURED = { surya: 11.80, candra: 177.22, mangala: 27.33, budha: -8.19, shukra: 1676.85, guru: 7.15, shani: -0.81 };
  for (const g of Object.keys(MEASURED)) {
    assert.ok(Math.abs(signed(k[g].samskrita - ref(g)) * 60 - MEASURED[g]) < 0.01, `${g}: overlay error ${(signed(k[g].samskrita - ref(g)) * 60).toFixed(2)}′`);
    assert.ok(Math.abs(signed(k[g].samskrita - k[g].classical) * 60 - k[g].deltaArcmin) < 1e-9);
    assert.equal(k[g].fitStatus, k.fitStatus);
    assert.ok(Number.isFinite(k[g].fitClaimRmsArcmin) && k[g].rmsArcmin === undefined, "the RMS is a claim of the fit, named so");
    if (k[g].drik !== null) assert.ok(Math.abs(signed(k[g].samskrita - k[g].drik) * 60 - k[g].deltaVsDrikArcmin) < 1e-9);
  }
  assert.match(k.fitStatus, /not re-validated/);
  assert.equal(k.fitFrame, "Lahiri (as fitted)");
  assert.deepEqual(k.fitSpan, [1900, 2100]); assert.equal(k.inFitSpan, true);
  // claimFails lists exactly the grahas whose live error against the dṛk column exceeds 3 × the claimed RMS
  const expected = Object.keys(MEASURED).filter((g) => k[g].deltaVsDrikArcmin !== null && Math.abs(k[g].deltaVsDrikArcmin) > 3 * k[g].fitClaimRmsArcmin);
  assert.deepEqual(k.claimFails, expected);
  assert.ok(k.claimFails.includes("surya") && k.claimFails.includes("candra") && k.claimFails.includes("shukra"));
  assert.ok(/Nīlakaṇṭha|next mountain/.test(k.pending.note), "next mountain declared");
  // The historical BE-S09 anchor was captured from the now-explicit empirical fit. Re-pinned 2026-10-08 (D2: the text
  // tier, scripts/refreeze-text-tier.cjs); was 119.86240065735433 (2026-09-28).
  const gg = M.canonicalGrahaModel(jd, { applyBija: true, bijaModel: "empirical-2026-08-29" });
  assert.ok(Math.abs(gg[0].longitude - 120.06344647404876) < 1e-9);
});

test("D144 extended varga + deep-time mean row honesty label", () => {
  assert.equal(M.VARGAS.length, 16); // canonical Ṣoḍaśavarga stays 16
  assert.equal(M.VARGAS_EXTENDED[0].code, "D144");
  for (const d of [0, 15, 100, 359.9]) {
    const v = M.computeVarga(d, "D144");
    assert.ok(v >= 0 && v < 12);
  }
  const row = M.deepTimeRow(1872803);
  assert.ok(row.model.includes("mean-only"));
  assert.ok(row.tithiIndex >= 0 && row.tithiIndex < 30);
});

console.log(`\n${passed}/${total} triveni checks passed`);
if (passed !== total) process.exit(1);
