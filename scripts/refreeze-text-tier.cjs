#!/usr/bin/env node
'use strict';
/* scripts/refreeze-text-tier.cjs — the re-pins of 2026-10-08 (owner decision D2: math-core's classical path became the
 * text tier), derived directly from the sovereign modules and cross-checked against an independent path.
 *
 * WHAT IT DERIVES (printed; --write applies the fixture):
 *   1. test-fixtures/engine-mode-regressions.json "classical": 8 epochs × 9 longitudes of the plain Sūrya-Siddhānta,
 *      from sphuta.js (Sun, Moon, node; Ketu = node + 180) and ss-graha.js (the five planets) at the text's own day count
 *      t = jd − 588465.5 + 75.7885/360 (civil days from midnight at Laṅkā, SS 1.45-1.47; no ΔT).
 *   2. kernel-regression.test.js CANONICAL_ANCHORS: the same at JD 2461269.4375, + bijaDeltaDeg(key, jd,
 *      'empirical-2026-08-29') (the opt-in experiment).
 *   3. triveni.test.js: the empirical anchor of the Sun, and the BE-S09 gate's offsets at J2000.0 Ujjain.
 * Each value is also checked against math-core.js as it now is (the delegation must reproduce the modules bit for bit).
 *
 * THE INDEPENDENT PATH: after the delegation math-core equals the sovereign modules by construction, so it cannot check
 * them. The check is the old arithmetic: math-core.js of commit 68905b9 (and its vsop87-full.js / elp-moon.js, written to
 * a temporary directory by `git show`), whose ssSphutaAt computes the same text with Math.sin, a Greenwich-midnight
 * epoch, ΔT and a modern three-term Moon. It is fed t′ with t′ + ΔT(t′)/86400 = (jd − J2000) + 75.7885/360, which cancels
 * its ΔT and moves its epoch to Laṅkā; its three-term total is subtracted from its Moon. The script fails if any value
 * differs from the sovereign one by more than 2e-6° (measured ≤ 1.07e-6° over −2000…+4000 in the plan's critic run;
 * this script prints its own maximum). Without the git history (the public snapshot) it says the check was skipped.
 *
 * Usage: node scripts/refreeze-text-tier.cjs [--write] [--rev 68905b9]
 */
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const ROOT = path.resolve(__dirname, '..');
const S = require('../sphuta.js');
const G = require('../ss-graha.js');
const M = require('../math-core.js');

const KEYS = ['surya', 'candra', 'mangala', 'budha', 'guru', 'shukra', 'shani', 'rahu', 'ketu'];
const PLANET_EN = { mangala: 'mars', budha: 'mercury', guru: 'jupiter', shukra: 'venus', shani: 'saturn' };
const OLD_KEY = { surya: 'surya', candra: 'chandra', mangala: 'mangal', budha: 'budh', guru: 'guru', shukra: 'shukra', shani: 'shani', rahu: 'rahu', ketu: 'ketu' };
const TOL_DEG = 2e-6;
const daysOf = (jd) => (jd - 588465.5) + 75.7885 / 360;
const wrap = (d) => ((d % 360) + 540) % 360 - 180;

/** The plain text's nine longitudes at jd, straight from the sovereign modules. */
function sovereign(jd) {
  const t = daysOf(jd), p = S.sphutaAtDays(t), g = G.truePlaces(t);
  const out = { surya: p.sun, candra: p.moon, rahu: p.rahu, ketu: p.ketu };
  for (const [k, en] of Object.entries(PLANET_EN)) out[k] = g[en].longitude;
  return KEYS.map((k) => out[k]);
}

/** The independent path, or null when the history is not available. */
function independentPath(rev) {
  let dir;
  try {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), 'refreeze-text-tier-'));
    for (const f of ['math-core.js', 'vsop87-full.js', 'elp-moon.js']) {
      fs.writeFileSync(path.join(dir, f), execFileSync('git', ['show', `${rev}:${f}`], { cwd: ROOT, maxBuffer: 1 << 28 }));
    }
  } catch (e) {
    return { skipped: `the independent cross-check was skipped: ${rev} is not available here (${String(e.message || e).split('\n')[0]})` };
  }
  const OLD = require(path.join(dir, 'math-core.js'));
  return {
    rev,
    at(jd) {
      const tJ = jd - 2451545, target = tJ + 75.7885 / 360;
      let tp = target;
      for (let i = 0; i < 6; i++) tp = target - OLD.observedDeltaTSeconds(tp) / 86400;
      return KEYS.map((k) => {
        const d = OLD.ssSphutaAt(OLD_KEY[k], tp);
        const li = d.lunarInequalities && Number.isFinite(d.lunarInequalities.total) ? d.lunarInequalities.total : 0;
        return ((d.sphuta - li) % 360 + 360) % 360;
      });
    },
  };
}

function main(argv) {
  const write = argv.includes('--write');
  const revAt = argv.indexOf('--rev'), rev = revAt >= 0 ? argv[revAt + 1] : '68905b9';
  const fixturePath = path.join(ROOT, 'test-fixtures', 'engine-mode-regressions.json');
  const fixture = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));
  const old = fixture.classicalPreD2 || fixture.classical;
  const ind = independentPath(rev);
  let maxDiff = 0, worst = null;
  const check = (jd, values, label) => {
    if (!ind || ind.skipped) return;
    const ref = ind.at(jd);
    values.forEach((v, i) => {
      const d = Math.abs(wrap(v - ref[i]));
      if (d > maxDiff) { maxDiff = d; worst = `${label} ${KEYS[i]} at JD ${jd}`; }
    });
  };
  const mathCoreSame = (jd, values) => M.sphutaGrahaModel(jd, 'ss').map((r) => r.longitude).every((v, i) => v === values[i]);

  // 1. the fixture
  const classical = old.map((row) => {
    const longitudes = sovereign(row.jd);
    check(row.jd, longitudes, 'fixture');
    if (!mathCoreSame(row.jd, longitudes)) throw new Error(`math-core's 'ss' rows differ from the sovereign modules at JD ${row.jd}`);
    return { jd: row.jd, longitudes };
  });

  // 2. the kernel anchors (empirical bīja, an opt-in experiment)
  const ANCHOR_JD = 2461269.4375;
  const base = sovereign(ANCHOR_JD);
  check(ANCHOR_JD, base, 'kernel anchor');
  const anchors = Object.fromEntries(KEYS.map((k, i) => [k, M.mod360(base[i] + M.bijaDeltaDeg(k, ANCHOR_JD, 'empirical-2026-08-29'))]));
  const viaCore = M.canonicalGrahaModel(ANCHOR_JD, { applyBija: true, bijaModel: 'empirical-2026-08-29' });
  for (const row of viaCore) if (row.longitude !== anchors[row.key]) throw new Error(`math-core's bīja row ${row.key} differs from the derivation`);

  // 3. triveni: the empirical Sun anchor and the BE-S09 gate at J2000.0 Ujjain (offsets against the frozen dṛk REF)
  const J2000_UT = 2451545.0 - 63.829 / 86400, REF = { sun: 256.5072, moon: 199.4539, lagna: 72.2015 };
  const gate = sovereign(J2000_UT);
  check(J2000_UT, gate, 'BE-S09');
  const lagna = M.siderealAscendantDeg(J2000_UT, 23.1765, 75.7885, 'ss');
  const offsets = { sun: wrap(gate[0] - REF.sun), moon: wrap(gate[1] - REF.moon), lagna: wrap(lagna - REF.lagna) };

  const report = {
    fixtureClassical: classical,
    kernelAnchors: anchors,
    triveniEmpiricalSun: anchors.surya,
    beS09: { jdUT: J2000_UT, sun: gate[0], moon: gate[1], lagna, offsetsDeg: offsets, lagnaNakshatraIndex: Math.floor(lagna / (360 / 27)) },
    independent: ind && ind.skipped ? ind.skipped : { rev, maxAbsDiffDeg: maxDiff, worst, toleranceDeg: TOL_DEG },
  };
  console.log(JSON.stringify(report, (k, v) => (typeof v === 'number' ? v : v), 1));
  if (ind && !ind.skipped && maxDiff > TOL_DEG) { console.error(`independent path differs by ${maxDiff}° (> ${TOL_DEG}°) at ${worst}`); process.exit(1); }

  if (write) {
    if (!fixture.classicalPreD2) fixture.classicalPreD2 = fixture.classical;
    fixture.classical = classical;
    fixture.provenance.classicalRepinnedD2 = `2026-10-08 (owner D2): 'classical' is now the text tier ('ss'): the Sūrya-Siddhānta's own day count (midnight at Laṅkā, no ΔT), ` +
      `no modern lunar terms, Mādhava's sine; values from the sovereign modules (sphuta.js, ss-graha.js) by scripts/refreeze-text-tier.cjs; ` +
      (ind && !ind.skipped ? `independent-path (math-core.js of ${rev}, ΔT cancelled, epoch moved to Laṅkā, three-term total removed) max |Δ| = ${maxDiff.toExponential(3)}°.`
        : 'independent cross-check skipped (no history).') + ' The pre-D2 values are kept under classicalPreD2. Numerical regression, not accuracy evidence.';
    fs.writeFileSync(fixturePath, JSON.stringify(fixture, null, 1) + '\n');
    console.log(`wrote ${path.relative(ROOT, fixturePath)}`);
  }
}

if (require.main === module) main(process.argv.slice(2));
module.exports = { sovereign, independentPath, daysOf, KEYS };
