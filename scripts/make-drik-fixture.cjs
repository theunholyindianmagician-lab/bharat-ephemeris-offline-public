#!/usr/bin/env node
'use strict';
/* make-drik-fixture.cjs — writes test-fixtures/drik-de440-geometric.json, the dense referee for the
 * "Modern Bhāratīya (dṛk)" tier (drik-bharatiya.test.js [A-dense]).
 *
 * SOURCE: bharat-sovereign-engine data/de440-reference.json — NASA-JPL DE440s (de440s.bsp) sampled with jplephem (MIT)
 *   by that repository's harnesses/de440-reference.py: barycentric ICRF geometric states every 20 days, 1850-02 … 2149-12,
 *   jd = TDB. DE440s is a work of the U.S. Government (NASA-JPL), public domain (17 USC §105); no Swiss-Ephemeris data.
 * WHAT IS KEPT: every 5th epoch (every 100 days, the epochs inside the series' span 1850.0–2150.0) and, for the Sun, the
 *   Moon and the five planets, the GEOMETRIC GEOCENTRIC direction in ICRF (J2000 equator) as right ascension and
 *   declination in degrees, rounded to 1e-9° (3.6e-6″). Mars … Saturn are system barycentres, as in the source.
 *   No light-time, deflection or aberration: the test compares the series' own geometric vectors, so the check is the
 *   fit itself; the frame rotation (ICRF → the series' ecliptic-of-date frame) is done in the test with the tier's EO.
 * HONESTY: this referee is independent of the series' code, fit and reduction, not of its initial conditions (the
 *   owner's N-body is restarted from DE440s states every 720 days): "agreement with DE440", never "independent of JPL".
 *
 * usage: node scripts/make-drik-fixture.cjs [path/to/de440-reference.json]
 *   default source: ../bharat-sovereign-engine/data/de440-reference.json beside this repository (or $DE440_REFERENCE).
 */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const root = path.resolve(__dirname, '..');
const src = process.argv[2] || process.env.DE440_REFERENCE
  || path.resolve(root, '..', 'bharat-sovereign-engine', 'data', 'de440-reference.json');
const out = path.join(root, 'test-fixtures', 'drik-de440-geometric.json');
const STRIDE = 5;                                     // 5 × 20 d = every 100 days
const BODIES = { surya: 'sun', candra: 'moon', budha: 'mercury', shukra: 'venus', mangala: 'mars', guru: 'jupiter', shani: 'saturn' };
const J2000 = 2451545.0;
const inSpan = (jd) => { const y = 2000 + (jd - J2000) / 365.25; return y >= 1850 && y <= 2150; };   // the series' rule (TT ≈ TDB)

const raw = fs.readFileSync(src);
const REF = JSON.parse(raw);
const r9 = (x) => Math.round(x * 1e9) / 1e9;
const radec = (v) => {
  const ra = ((Math.atan2(v[1], v[0]) * 180 / Math.PI) + 360) % 360;
  const dec = Math.atan2(v[2], Math.hypot(v[0], v[1])) * 180 / Math.PI;
  return [r9(ra), r9(dec)];
};
const rows = [];
for (let i = 0; i < REF.jd.length; i += STRIDE) {
  const jd = REF.jd[i];
  if (!inSpan(jd)) continue;
  const E = REF.pos.earth[i];
  const row = { jdTDB: jd };
  for (const [k, b] of Object.entries(BODIES)) {
    const P = REF.pos[b][i];
    row[k] = radec([P[0] - E[0], P[1] - E[1], P[2] - E[2]]);
  }
  rows.push(row);
}
const fixture = {
  provenance: {
    source: REF.meta.source,
    sourceFile: 'bharat-sovereign-engine data/de440-reference.json (harnesses/de440-reference.py)',
    sourceSha256: crypto.createHash('sha256').update(raw).digest('hex'),
    kernelSha256: REF.meta.kernel_sha256,
    licence: 'NASA-JPL DE440s: U.S. Government work, public domain (17 USC §105); sampled with jplephem (MIT). No Swiss-Ephemeris data.',
    generator: 'scripts/make-drik-fixture.cjs',
    content: 'geometric geocentric direction (body − Earth, barycentric ICRF states) as [RA, Dec] in degrees, ICRF/J2000 equator, rounded to 1e-9°; every 100 days inside 1850.0–2150.0; Mars…Saturn are system barycentres',
    time: 'jdTDB (the DE440 argument); |TDB − TT| ≤ 1.7 ms, below 0.001″ for the Moon',
    honesty: 'independent of the series code, fit and reduction; NOT of its initial conditions (the N-body is restarted from DE440s states every 720 days)',
  },
  bodies: Object.keys(BODIES),
  rows,
};
fs.writeFileSync(out, JSON.stringify(fixture) + '\n');
console.log(`wrote ${path.relative(root, out)}: ${rows.length} epochs × ${Object.keys(BODIES).length} bodies (${fs.statSync(out).size} bytes) from ${src}`);
