'use strict';
const { spawnSync } = require('node:child_process');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const suites = ['precision.test.mjs', 'math-core.test.js', 'lattice-invariants.test.js', 'kernel-regression.test.js', 'triveni.test.js',
  'engine-mode.test.js', 'full-vsop.test.js', 'elp-moon.test.js', 'dop853-nbody.test.js', 'ias15.test.js',
  'lunar-euler-libration.test.js', 'eop-first-principles.test.js',
  'katapayadi.test.js', 'kala-dvara.test.js', 'parahita-madhyama.test.js', 'dhruva.test.js',
  'ss-numbers.test.js', 'sphuta.test.js', 'panchanga.test.js', 'dasha.test.js', 'muhurta.test.js', 'utsava.test.js', 'gurutva.test.js', 'gurutva-purna.test.js', 'spanda-ganita.test.js', 'pn2-schwarzschild.test.js', 'granthas.test.js', 'ss-chapters.test.js', 'ss-udaya.test.js', 'ss-graha.test.js', 'ss-chaya.test.js', 'ss-grahana.test.js', 'ss-drishya.test.js', 'vedha-lekha.test.js', 'samskara.test.js', 'ss-ahargana.test.js', 'ss-parilekha.test.js', 'ss-madhava.test.js', 'candravakya.test.js', 'yantra.test.js',
  'metric-time-integrator.test.js', 'variational-stm-solver.test.js',
  'sovereign-master-physics.test.js',
  'sprint-upgrades.test.js', 'library-nav-enhancer.test.js', 'library-pi-verse.test.js',
  'independent-ui-regression.test.js', 'legacy-honesty.test.js', 'scripts/engine-mode-ui.test.cjs', 'scripts/vedha-ui.test.cjs',
  'scripts/siddhanta-panchanga-ui.test.cjs', 'scripts/build-site.test.cjs', 'parampara.test.js', 'scripts/csp.test.cjs'];
// Decision §7.5 of VEDHA-YANTRA-DESIGN-2026-10-07.md (owner, 2026-10-07: "do everything"): suites that compare with a
// modern ephemeris or product (VSOP/ELP/DE, IERS, Swiss) are kept, labelled non-referee — they test the legacy product
// tier, never the sovereign text tier, which no modern source may seed or judge.
const LEGACY = new Set(['math-core.test.js', 'kernel-regression.test.js', 'triveni.test.js', 'engine-mode.test.js', 'full-vsop.test.js', 'elp-moon.test.js']);
for (const suite of suites) {
  console.log(`\nRunning ${suite}${LEGACY.has(suite) ? '  [non-referee (legacy): compares with a modern ephemeris or product]' : ''}`);
  const result = spawnSync(process.execPath, [suite], { cwd: root, stdio: 'inherit' });
  if (result.error || result.status !== 0) {
    if (result.error) console.error(result.error);
    process.exit(result.status || 1);
  }
}
console.log(`\nAll ${suites.length} suites passed (${LEGACY.size} of them non-referee legacy suites).`);
