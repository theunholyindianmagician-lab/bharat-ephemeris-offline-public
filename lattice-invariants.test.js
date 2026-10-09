/* lattice-invariants.test.js — the spanda lattice as a TESTED property (Kāla-Yantra council
   2026-09-28, gate 4). Before this file there were 0 lattice assertions in 17 suites.
   Every assertion is exact (BigInt / strict equality) unless a comment says why a float is
   unavoidable — and then the band is one spanda, never wider. */
const { test } = require("node:test");
const assert = require("node:assert/strict");
const M = require("./math-core.js");

const SPD = 328050000000n;                       // spandas per ahorātra
const ARCSEC_PER_REV = 1296000n;                 // 360 × 3600
const SPANDA_PER_ARCSEC = 253125n;               // 3⁴·5⁵
const SPANDA_DEG = 1 / (253125 * 3600);          // one spanda of arc, in degrees (≈1.097e-9°)
const MAHAYUGA_SPANDAS = SPD * 1577917828n;      // = REV_DEN (math-core.js:1255)
const LANKA = 69062270625n;                      // Laṅkā midnight precedes Greenwich midnight by 75.7885/360 day, in spandas

function factorize(n) {                          // BigInt trial division — n is 2-3-5-smooth here
  const f = {}; let p = 2n;
  while (n > 1n) { while (n % p === 0n) { f[p] = (f[p] || 0) + 1; n /= p; } p += 1n; if (p > 1000n) break; }
  return f;
}
function lcg(seed) { let s = BigInt(seed); return () => { s = (s * 6364136223846793005n + 1442695040888963407n) % (1n << 64n); return s; }; }

test("ahorātra = 328,050,000,000 spandas = 2⁷·3⁸·5⁸ exactly", () => {
  assert.equal(M.spandaPerAhoratra(), SPD);
  assert.equal(SPD, 2n ** 7n * 3n ** 8n * 5n ** 8n);
  assert.deepEqual(factorize(SPD), { 2: 7, 3: 8, 5: 8 });
});

test("one arcsecond = 253,125 spandas = 3⁴·5⁵ with zero remainder", () => {
  assert.equal(SPD % ARCSEC_PER_REV, 0n);
  assert.equal(SPD / ARCSEC_PER_REV, SPANDA_PER_ARCSEC);
  assert.equal(SPANDA_PER_ARCSEC, 3n ** 4n * 5n ** 5n);
});

test("spandaSeconds: one spanda = 1/3,796,875 s exactly (rational, not float)", () => {
  const s = M.spandaSeconds();
  assert.equal(s.num, 86400n); assert.equal(s.den, SPD);
  assert.equal(s.den % s.num, 0n); assert.equal(s.den / s.num, 3796875n);
  // 1 spanda = 86400/328050000000 s = 263.3744856 ns. approxNs now carries the value in
  // NANOseconds (263.374485), matching its name; the picosecond defect (263374.485596,
  // 1000× too large) was fixed in math-core.js spandaSeconds (AUDIT30 D5-08). The rational
  // num/den above remains the exact truth; this float pin catches a silent relabel or regression.
  assert.equal(s.approxNs, 263.374485);
  assert.equal(Number(s.num) / Number(s.den), 2.6337448559670784e-7);
});

test("meanRawExact: residues on ℤ/REV_DEN return to zero at one mahāyuga (every graha, jointly)", () => {
  const keys = Object.keys(M.BHAGANAS);
  assert.ok(keys.length >= 8);
  for (const k of keys) {
    const at0 = M.meanRawExact(k, 0n);
    assert.equal(at0, k === "rahu" ? 180 : 0, `${k}: epoch residue`);
    assert.equal(M.meanRawExact(k, MAHAYUGA_SPANDAS), at0, `${k}: mahāyuga closure`);
    assert.equal(M.meanRawExact(k, 7n * MAHAYUGA_SPANDAS), at0, `${k}: 7-mahāyuga closure`);
    assert.equal(M.meanRawExact(k, -MAHAYUGA_SPANDAS), at0, `${k}: negative closure`);
  }
  // Ketu = Rāhu + 180° [theorem]: Rāhu is at 180° at the Kali epoch, so Ketu is at 0°. Until 2026-10-08 this line pinned
  // 180, a latent bug (meanRawExact returned Rāhu's value for Ketu); corrected, not widened.
  assert.equal(M.meanRawExact("rahu", 0n), 180);
  assert.equal(M.meanRawExact("ketu", 0n), 0);
  for (const S of [12345678901234n, -98765432109876n]) {
    const d = Math.abs(((M.meanRawExact("ketu", S) - M.meanRawExact("rahu", S) - 180) % 360 + 540) % 360 - 180);
    assert.ok(d < SPANDA_DEG, "Ketu = Rāhu + 180° at any instant");
  }
});

test("meanRawExact, fed the text's own spanda count, equals the served mean places (sphuta.js / ss-graha.js) for all eight bodies — an independent BigInt path", () => {
  const S = require("./sphuta.js"), G = require("./ss-graha.js");
  const near = (a, b) => Math.abs(((a - b) % 360 + 540) % 360 - 180);
  for (const jd of [588465.5, 1721425.5, 2451545, 2461321.520833, 2816787.5, -16000000, 21000000]) {
    const sp = M.jdToAharganaSpandas(jd), m = S.madhyama(sp), t = M.ssDaysOfJd(jd), g = G.meanPlaces(t);
    const served = { surya: m.sun, candra: m.moon, rahu: m.node, mangala: g.mars.mean, budha: g.mercury.sighrocca, guru: g.jupiter.mean, shukra: g.venus.sighrocca, shani: g.saturn.mean };
    for (const [k, v] of Object.entries(served)) assert.ok(near(M.meanRawExact(k, sp), v) < 1e-12, `${k} at JD ${jd}: ${M.meanRawExact(k, sp)} vs ${v}`);
    assert.ok(near(M.meanRawExact("ketu", sp), S.madhyama(sp).node + 180) < 1e-12);
  }
});

test("meanRawExact: half-mahāyuga joint return holds exactly for every even bhagaṇa", () => {
  const half = MAHAYUGA_SPANDAS / 2n;
  for (const [k, revs] of Object.entries(M.BHAGANAS)) {
    const eq = M.meanRawExact(k, half) === M.meanRawExact(k, 0n);
    assert.equal(eq, BigInt(revs) % 2n === 0n, `${k}: bhagaṇa ${revs} parity vs half-mahāyuga return`);
  }
});

test("meanRawExact: additive homomorphism ℤ → ℤ/REV_DEN (float exit bounded by one spanda)", () => {
  // The exported value is a float (intDeg + fracDeg); the integer residue is exact inside.
  // A double near 360° has ulp ≈ 5.7e-14°, i.e. 5e-5 spanda — so one spanda is the honest band.
  const rnd = lcg(108);
  for (const k of Object.keys(M.BHAGANAS)) {
    for (let i = 0; i < 40; i++) {
      const a = rnd() % MAHAYUGA_SPANDAS, b = rnd() % MAHAYUGA_SPANDAS;
      const lhs = M.meanRawExact(k, a + b);
      const off = k === "rahu" ? 180 : 0;                  // constant term must not double
      const rhs = (M.meanRawExact(k, a) + M.meanRawExact(k, b) - off + 720) % 360;
      const d = Math.abs(((lhs - rhs + 540) % 360) - 180);
      assert.ok(d < SPANDA_DEG, `${k}: |Δ| = ${d}° exceeds one spanda`);
    }
  }
});

test("jdToAharganaSpandas: BigInt door, monotone, one civil day = SPD exactly (the text's day count: no ΔT, 2026-10-08)", () => {
  const rnd = lcg(9);
  let prev = -1n, jd = 2000000;
  for (let i = 0; i < 300; i++) {
    jd += Number(rnd() % 100000n) / 100 + 0.001;          // strictly increasing UT
    const a = M.jdToAharganaSpandas(jd);
    assert.equal(typeof a, "bigint");
    assert.ok(a > prev, "ahargaṇa must be monotone in JD"); prev = a;
  }
  // Before 2026-10-08 a whole day was SPD ± the ΔT drift (the door added ΔT); the text's own count has none, so every
  // whole-day step is exactly SPD [theorem; measured at these instants]. A tightening, not a widening.
  for (const jd0 of [588465.5, 1721425.5, 2451545.5, 2461321.520833, 2488069.5]) {
    assert.equal(M.jdToAharganaSpandas(jd0 + 1) - M.jdToAharganaSpandas(jd0), SPD, `JD ${jd0}`);
  }
  // the door is the text tier's own (ss-tier.js → sphuta.js), with the Laṅkā origin: midnight at Laṅkā is day 0
  assert.equal(M.jdToAharganaSpandas(588465.5), 69062270625n, "Greenwich midnight of Kali day 0 is 75.7885/360 day after Laṅkā's");
  // Door width: a double JD near 2.45e6 has ulp 4.66e-10 day = 152.8 spandas. Pinned as the
  // known entry float (council gate 6 = BigInt civil entry); NOT a tolerance on the lattice.
  const ulpDay = 2451545.5 - (2451545.5 - Number.EPSILON * 2451545.5);
  assert.ok(ulpDay * 328050000000 < 160);
});

const D30_SEG = { even: [0, 5, 10, 18, 25, 30], odd: [0, 5, 12, 20, 25, 30] };
function cellsOf(v) {                                       // [start,end) cells of one rāśi, degrees
  if (v.code === "D30") return null;
  const n = v.divisor, out = [];
  for (let j = 0; j < n; j++) out.push([j * 30 / n, (j + 1) * 30 / n]);
  return out;
}

test("vargas tile the zodiac: constant inside every cell, parity at ±1 spanda across every edge, all 12 rāśis hit", () => {
  const vargas = [...M.VARGAS, ...M.VARGAS_EXTENDED.filter(x => !M.VARGAS.some(v => v.code === x.code))];
  assert.ok(vargas.length >= 16);
  for (const v of vargas) {
    const hits = new Set(); let edges = 0;
    for (let r = 0; r < 12; r++) {
      const segs = v.code === "D30"
        ? (r % 2 === 0 ? D30_SEG.even : D30_SEG.odd).slice(0, -1).map((s, i, a) => [s, (i + 1 < a.length ? a[i + 1] : 30)])
        : cellsOf(v);
      let prevInterior = null;
      for (const [s0, s1] of segs) {
        const lo = r * 30 + s0, hi = r * 30 + s1;
        const mid = M.computeVarga((lo + hi) / 2, v.code);
        assert.ok(Number.isInteger(mid) && mid >= 0 && mid < 12, `${v.code}: cell value ${mid}`);
        for (const f of [0.1, 0.5, 0.9]) assert.equal(M.computeVarga(lo + f * (hi - lo), v.code), mid, `${v.code} r${r} [${s0},${s1}) not constant`);
        // edge parity: one spanda inside the left cell belongs to it, one spanda inside the right cell to it
        assert.equal(M.computeVarga(hi - SPANDA_DEG, v.code), mid, `${v.code}: ${hi}° − 1 spanda left parity`);
        if (prevInterior !== null) assert.equal(M.computeVarga(lo + SPANDA_DEG, v.code), mid, `${v.code}: ${lo}° + 1 spanda right parity`);
        prevInterior = mid; hits.add(mid); edges++;
      }
    }
    // Horā reaches only Karka/Siṃha (Moon/Sun), Triṃśāṃśa only the ten non-luminary rāśis — classical, not defects.
    const reach = v.code === "D2" ? 2 : v.code === "D30" ? 10 : 12;
    assert.equal(hits.size, reach, `${v.code}: ${hits.size} rāśis reached, expected ${reach}`);
    assert.equal(edges, v.code === "D30" ? 60 : 12 * v.divisor, `${v.code}: cell count`);
  }
});

test("2-3-5-smooth vargas are exact sub-lattices of the spanda grid (cell width is an integer number of spandas)", () => {
  const RASI_SPANDAS = 30n * 3600n * SPANDA_PER_ARCSEC;    // spandas of arc in one rāśi
  for (const v of [...M.VARGAS, ...M.VARGAS_EXTENDED]) {
    if (v.code === "D30") continue;
    const f = factorize(BigInt(v.divisor));
    const smooth = Object.keys(f).every(p => ["2", "3", "5"].includes(p));
    const exact = RASI_SPANDAS % BigInt(v.divisor) === 0n;
    assert.equal(exact, smooth, `${v.code}: divisor ${v.divisor} smooth=${smooth} but integer-spanda cell=${exact}`);
    if (!smooth) assert.ok(v.divisor % 7 === 0, `${v.code}: the only non-lattice divisors are the sevens (D7, D14…)`); // ℚ-only cells
  }
});

test("civil door (gate 6): aharganaSpandasFromCivil is exact BigInt — 1 s = 3,796,875 spandas, 1 ghaṭikā = 1440·that, 1 day = SPD, zones cancel", () => {
  const c = (o) => M.aharganaSpandasFromCivil({ year: 2000, month: 1, day: 1, applyDeltaT: false, ...o });
  const t0 = c({ hour: 12 });
  assert.equal(typeof t0, "bigint");
  // JD 2451545.0 − 588465.5 = 1,863,079.5 days from Greenwich midnight, + the Laṅkā offset (the default meridian since
  // 2026-10-08): 328,050,000,000 × 75.7885 ÷ 360 = 69,062,270,625 spandas exactly [theorem]
  assert.equal(LANKA, 328050000000n * 757885n / 3600000n);
  assert.equal(328050000000n * 757885n % 3600000n, 0n);
  assert.equal(t0, 1863079n * SPD + SPD / 2n + LANKA);
  assert.equal(c({ hour: 12, meridian: "greenwich" }), 1863079n * SPD + SPD / 2n);
  assert.equal(M.aharganaSpandasFromCivil({ year: 2000, month: 1, day: 1, hour: 12 }), t0, "applyDeltaT: false is the default");
  assert.equal(c({ hour: 12, second: 1 }) - t0, 3796875n);
  assert.equal(c({ hour: 12, minute: 24 }) - t0, 1440n * 3796875n);  // one ghaṭikā/nāḍikā
  assert.equal(c({ hour: 12, nanosecond: 64000 }) - t0, 243n);       // 64 µs = 243 spandas, the finest exact civil step
  assert.equal(M.aharganaSpandasFromCivil({ year: 2000, month: 1, day: 2, hour: 12, applyDeltaT: false }) - t0, SPD);
  assert.equal(c({ hour: 5, minute: 30, timezoneMinutes: 330 }), c({ hour: 0 }));   // 05:30 IST ≡ 00:00 UT
  assert.equal(c({ hour: 0, timezoneMinutes: -60 }), c({ hour: 1 }));                // −01:00 zone
  // Gregorian rule matches the float path day-for-day across leap/century boundaries (Meeus, proleptic)
  for (const [y, mo, d] of [[1600, 2, 29], [1700, 3, 1], [1900, 2, 28], [2100, 1, 1], [-3101, 1, 23], [1582, 10, 15], [100, 1, 1]]) {
    const iso = `${y < 0 ? "-" : ""}${String(Math.abs(y)).padStart(4, "0")}-${String(mo).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const viaFloat = M.gregorianToJulianDay(iso); // since 2026-10-08 the date parser is kala-dvara.js's, valid for years < 100 too
    const days = M.aharganaSpandasFromCivil({ year: y, month: mo, day: d, applyDeltaT: false }) / SPD;   // the Laṅkā offset is < a day
    assert.equal(days, BigInt(Math.round(viaFloat - M.KALI_EPOCH_JD)), `${iso}: day count vs gregorianToJulianDay`);
    if (y === -3101) assert.equal(days, 0n, "Kali epoch = proleptic-Gregorian 23 Jan 3101 BCE, day 0");
  }
});

test("civil door vs double-JD door: they agree to within the double's own ulp (< 160 spandas), no ΔT on either and the Laṅkā origin on both", () => {
  // not asserted ===: 75.7885/360 is not exact in binary, so the double door rounds where the BigInt door does not
  for (const [jd, civ] of [[2451545.0, { year: 2000, month: 1, day: 1, hour: 12 }], [2460677.0, { year: 2025, month: 1, day: 1, hour: 12 }], [2299160.5, { year: 1582, month: 10, day: 15 }]]) {
    const a = M.jdToAharganaSpandas(jd), b = M.aharganaSpandasFromCivil(civ);
    const d = a > b ? a - b : b - a;
    assert.ok(d < 160n, `JD ${jd}: doors differ by ${d} spandas`);
  }
});

test("Moon apogee (chandra mandocca) is a closed bhagaṇa residue — returns to epoch at every mahāyuga, no unbounded term (AUDIT30 W5)", () => {
  // The chandra mandocca is SS.bhagana.chandraMandocca = 488,203 rev/mahāyuga, anchored
  // +90° at the Kali epoch — a closed residue on ℤ/REV_DEN exactly like every graha mean.
  // Before the fix, ssMandoccaAt added `0.0003·T²` (an unbounded linear-time parabola, ~2811″
  // at the Kali epoch, 0 at J2000) that broke circular closure. This test guards its removal.
  assert.equal(M.SS.bhagana.chandraMandocca, 488203);
  const B = M.SS.bhagana.chandraMandocca;
  const YUGA = M.SS.yugaDays;                               // 1,577,917,828 integer days = one mahāyuga
  const norm = (a) => { a %= 360; return a < 0 ? a + 360 : a; };

  // (1) exact closure: the pure residue returns to its epoch value at ±1, ±5 and 7 mahāyuga
  //     (BigInt residue; integer day-count ⇒ no float rounding), like the meanRawExact graha test.
  const base = M.ssPhaseFromKali(0, B, 90);
  for (const n of [1n, 7n, -1n, 5n, -5n]) {
    const v = M.ssPhaseFromKali(Number(n) * YUGA, B, 90);
    assert.equal(v, base, `chandra mandocca: ${n}-mahāyuga closure`);
  }

  // (2) no unbounded additive term on the served path: ssMandoccaAt("chandra", t) is the closed
  //     bhagaṇa residue of the ΔT-adjusted time (norm(90 + ssMeanLongitude(t+ΔT, B))) to within one
  //     spanda (the float-exit band used throughout this file; the residue is exact in BigInt). If
  //     any secular/polynomial term were re-added it would differ by thousands of spandas. Sampled
  //     across ±5 mahāyuga incl. the Kali epoch; the apogee stays in [0,360) (bounded) at every sample.
  //     (The only non-residue input left is ΔT itself — a separate, documented deep-time concern,
  //     AUDIT30 §3 term 7 / D1-08 — not the apogee model this fix governs.)
  // (2026-10-08) The served path is the text tier's: no ΔT; the epoch is midnight at Laṅkā, 75.7885/360 day before
  // Greenwich midnight — so the residue is taken at t + 75.7885/360 (was t + ΔT/86400), still within one spanda.
  for (const t of [0, -36525, -182625, -547875, -1863079.5, 5 * YUGA, -5 * YUGA, 123456.7]) {
    const served = M.ssMandoccaAt("chandra", t);
    const expected = norm(90 + M.ssMeanLongitude(t + 75.7885 / 360, B));
    const d = Math.abs(((served - expected + 540) % 360) - 180);
    assert.ok(d < SPANDA_DEG, `chandra mandocca is a pure residue at t=${t} (|Δ| = ${d}° = ${(d * 253125 * 3600).toFixed(3)} spandas)`);
    assert.ok(served >= 0 && served < 360, `chandra mandocca bounded in [0,360) at t=${t}`);
  }

  // (3) J2000 is preserved: the removed placeholder was 0 at T=0, so the served apogee there is
  //     unchanged — modern output does not move (this change IS the fix for deep time only).
  const j2000Served = M.ssMandoccaAt("chandra", 0);
  const j2000Expect = norm(90 + M.ssMeanLongitude(75.7885 / 360, B));
  assert.ok(Math.abs(((j2000Served - j2000Expect + 540) % 360) - 180) < SPANDA_DEG);
});
