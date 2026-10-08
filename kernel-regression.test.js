/*
 * kernel-regression.test.js — freezes the 2026-08-17 kernel state.
 *
 *   Run:       node kernel-regression.test.js
 *   Companion: node e2e-offline.mjs        (offline round-trip of all 6 pages;
 *                                           requires serve.py on 127.0.0.1:8877)
 *
 * Locks in:
 *   (a) compareKernels — 9 well-formed rows, all deltas finite and < 60″,
 *       Rāhu/Ketu deltas exactly 0 (nodes carry no manda equation);
 *   (b) canonicalGrahaModel — 9 longitude anchors at JD 2461269.4375
 *       (2026-08-17 04:00 IST), hard-coded from the live kernel at authoring
 *       time so any future drift of the canonical model fails loudly;
 *   (c) Ketu = Rāhu + 180° (mod 360) exactly;
 *   (d) panchangExtended at Ujjain returns all five limbs non-null.
 */
"use strict";

const assert = require("node:assert/strict");
const M = require("./math-core.js");

let passed = 0;
let failed = 0;
function test(name, fn) {
  try {
    fn();
    passed += 1;
    console.log(`✓ ${name}`);
  } catch (error) {
    failed += 1;
    console.error(`✗ ${name}`);
    console.error(`  ${error && error.message ? error.message : error}`);
  }
}

/* Anchor instant: 2026-08-17 04:00:00 IST (+5.5) → JD 2461269.4375 */
const ANCHOR_JD = M.gregorianToJulianDay("2026-08-17", "04:00:00", 5.5);

/* Canonical-model longitude anchors, computed by the live kernel at authoring
   time (2026-08-17, math-core.js md5 5b70d7ad7572fda8688f1e1c19dac51a).
   Sidereal degrees, printed to 12 decimals; asserted to 1e-9. */
const LEGACY_ROUNDED_ANCHORS = Object.freeze({
  surya: 119.862926420812,
  candra: 173.777525906925,
  mangala: 69.433760674330,
  budha: 111.516226862023,
  guru: 106.145356279432,
  shukra: 167.286119445979,
  shani: 350.356111017182,
  rahu: 305.867113256745,
  ketu: 125.867113256745,
});

// 2026-09-07: the pre-existing subday BigInt implementation had already changed
// the old Moon anchor by 4.05e-9 degrees. These are numerical regression values,
// NOT observational accuracy evidence. Reproduced from pre-fix math-core SHA256
// 97112bf9b5cd850138d9ead474a809f7eedf0273829adbbe0e0a7b2971a405a4:
// mod360(ssSphutaAt(key, ANCHOR_JD - 2451545).sphuta +
//        bijaDeltaDeg(key, ANCHOR_JD, 'empirical-2026-08-29')).
// The old rounded values remain above for audit; no tolerance was widened.
// 2026-09-28 (Kāla-Yantra council gate 1+2): classical path ΔT re-routed to the observed
// IERS table (calculateDeltaT → observedDeltaTSeconds; the 32t²−20 parabola was +45 s at 2025)
// and Śukra apsisKalpa 635 → 535 (Sūrya-Siddhānta i.41-44). Anchors re-pinned from the
// same formula; still numerical regression values, not observational accuracy evidence.
// 2026-10-05 (AUDIT30 W5): removed the 0.0003·T² apsidalDrift placeholder from the chandra
// mandocca (now the closed 488,203-rev/mahāyuga bhagaṇa residue). Only candra moved, by
// +0.00100″ at this 2026 anchor (the placeholder was ~0.079″ at the apogee here, damped by
// the manda equation). candra re-pinned from the same formula; numerical regression pin,
// not accuracy evidence. All other eight anchors unchanged.
const CANONICAL_ANCHORS = Object.freeze({
  surya: 119.86240065735433,
  candra: 173.77049354272822,
  mangala: 69.4334005645494,
  budha: 111.51530066841423,
  guru: 106.14523304561624,
  shukra: 164.0931569841573,
  shani: 350.35614056129725,
  rahu: 305.8671423179045,
  ketu: 125.8671423179045,
});

test("anchor instant resolves to JD 2461269.4375", () => {
  assert.equal(ANCHOR_JD, 2461269.4375);
});

test("compareKernels returns 9 well-formed rows (finite floats, deltas < 60″)", () => {
  const report = M.compareKernels(ANCHOR_JD);
  assert.equal(report.comparison.length, 9);
  for (const row of report.comparison) {
    assert.equal(typeof row.graha, "string");
    assert.ok(row.graha.length > 0, "graha name must be non-empty");
    const floatLong = parseFloat(row.floatLong);
    const rationalLong = parseFloat(row.rationalLong);
    const deltaArcsec = parseFloat(row.deltaArcsec);
    assert.ok(Number.isFinite(floatLong), `${row.graha}: floatLong is not finite (${row.floatLong})`);
    assert.ok(Number.isFinite(rationalLong), `${row.graha}: rationalLong is not finite (${row.rationalLong})`);
    assert.ok(Number.isFinite(deltaArcsec), `${row.graha}: deltaArcsec is not finite (${row.deltaArcsec})`);
    assert.ok(deltaArcsec < 60, `${row.graha}: delta ${deltaArcsec}″ exceeds 60″`);
  }
});

test("compareKernels: Rāhu and Ketu deltas are exactly 0 (nodes have no manda phala)", () => {
  const report = M.compareKernels(ANCHOR_JD);
  const rahuRow = report.comparison.find((row) => row.graha.includes("राहु"));
  const ketuRow = report.comparison.find((row) => row.graha.includes("केतु"));
  assert.ok(rahuRow, "Rāhu row missing from comparison");
  assert.ok(ketuRow, "Ketu row missing from comparison");
  assert.equal(parseFloat(rahuRow.deltaArcsec), 0);
  assert.equal(parseFloat(ketuRow.deltaArcsec), 0);
});

test("canonicalGrahaModel exactly matches the audited subday arithmetic anchors", () => {
  const model = M.canonicalGrahaModel(ANCHOR_JD, { applyBija: true, bijaModel: "empirical-2026-08-29" });
  assert.equal(model.length, 9);
  for (const graha of model) {
    const expected = CANONICAL_ANCHORS[graha.key];
    assert.ok(expected !== undefined, `unexpected graha key: ${graha.key}`);
    assert.ok(Number.isFinite(graha.longitude), `${graha.key}: longitude is not finite`);
    assert.equal(graha.longitude, expected, `${graha.key}: changed numerical regression`);
  }
});

test("Ketu = Rāhu + 180° (mod 360) exactly", () => {
  const model = M.canonicalGrahaModel(ANCHOR_JD, { applyBija: true, bijaModel: "empirical-2026-08-29" });
  const rahu = model.find((graha) => graha.key === "rahu");
  const ketu = model.find((graha) => graha.key === "ketu");
  assert.ok(rahu && ketu, "rahu/ketu rows missing from canonical model");
  assert.ok(Math.abs(ketu.longitude - M.mod360(rahu.longitude + 180)) < 1e-12);
});

test("panchangExtended at Ujjain yields all five limbs non-null", () => {
  // Defaults are the canonical Ujjain coordinates: 23.1765° N, 75.7885° E, +5.5 h.
  const panchang = M.panchangExtended(ANCHOR_JD, 23.1765, 75.7885, 5.5);
  const limbs = {
    vara: panchang.varaName,
    tithi: panchang.tithiName,
    nakshatra: panchang.nakshatraName,
    yoga: panchang.yogaName,
    karana: panchang.karanaName,
  };
  for (const [limb, value] of Object.entries(limbs)) {
    assert.ok(value !== null && value !== undefined, `${limb} is null/undefined`);
    assert.equal(typeof value, "string");
    assert.ok(value.length > 0, `${limb} is empty`);
  }
});

console.log(`\n${passed}/${passed + failed} kernel regression checks passed`);
if (failed > 0) process.exit(1);
