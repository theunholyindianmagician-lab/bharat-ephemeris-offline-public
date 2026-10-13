#!/usr/bin/env node
// node scripts/validate-dense.cjs — the dense check of the Kerala default against the dṛk tier (2026-10-13). Every 7 days from
// 1850.0 to 2150.0 (the span the dṛk tier serves): residuals in arcminutes, candidate minus dṛk, Sun/Moon/Rāhu with each tier's own
// ayanāṃśa (the Kerala one and the dṛk one), the planets sidereal on both. Writes corpus/research/validate-dense.json.
// The 97-day fit grid and its midpoint holdout are not on this grid except by coincidence, so this is the independent measure.
const path = require('node:path'), fs = require('node:fs');
const ROOT = path.join(__dirname, '..');
const ST = require(path.join(ROOT, 'ss-tier.js')), M = require(path.join(ROOT, 'math-core.js'));
const KER = ST.correction('kerala');
const wrap = (d) => ((d % 360) + 540) % 360 - 180;
const tOf = (jd) => jd - 588465.5 + 75.7885 / 360;
const KEYS = ['mangala', 'budha', 'guru', 'shukra', 'shani'], COLS = ['sun', 'moon', 'rahu', ...KEYS];
const JD0 = 2396758.5, JD1 = 2451545 + 150 * 365.25, STEP = 7;
const rows = [];
for (let jd = JD0; jd < JD1; jd += STEP) {
  let R, g;
  try { R = M.tierGrahaRows(jd, 'drik'); g = ST.grahas(jd, { samskara: 'kerala' }); } catch (e) { continue; }
  const get = (k) => R.find((x) => x.key === k).longitude, ayD = M.tierAyanamsha(jd, 'drik').deg, ayK = KER.ayanamshaAt(tOf(jd));
  const r = { jd, y: 2000 + (jd - 2451545) / 365.25 };
  r.sun = wrap(g.surya + ayK - get('surya') - ayD) * 60;
  r.moon = wrap(g.candra + ayK - get('candra') - ayD) * 60;
  r.rahu = wrap(g.rahu + ayK - get('rahu') - ayD) * 60;
  for (const k of KEYS) r[k] = wrap(g[k] - get(k)) * 60;
  rows.push(r);
}
const stat = (a) => (a.length ? { n: a.length, mean: +(a.reduce((x, y) => x + y, 0) / a.length).toFixed(2), rms: +Math.sqrt(a.reduce((x, y) => x + y * y, 0) / a.length).toFixed(2), max: +Math.max(...a.map(Math.abs)).toFixed(1) } : null);
const out = {
  generatedBy: 'scripts/validate-dense.cjs', span: `JD ${JD0} to ${JD1.toFixed(1)} (1850.0–2150.0) every ${STEP} d`, instants: rows.length,
  frame: 'arcminutes, candidate (Kerala default, joint measurement) minus the dṛk tier; Sun, Moon and Rāhu with each tier\'s own ayanāṃśa, planets sidereal on both',
  wholeSpan: Object.fromEntries(COLS.map((c) => [c, stat(rows.map((r) => r[c]))])),
  byHalfCentury: Object.fromEntries([1850, 1900, 1950, 2000, 2050, 2100].map((b) => { const s = rows.filter((r) => r.y >= b && r.y < b + 50); return [`${b}-${b + 50}`, Object.fromEntries(COLS.map((c) => [c, stat(s.map((r) => r[c]))]))]; })),
  venusWorst: rows.map((r) => ({ jd: r.jd, shukra: +r.shukra.toFixed(1) })).sort((a, b) => Math.abs(b.shukra) - Math.abs(a.shukra)).slice(0, 5),
  note: 'measured against the dṛk tier, which is the reference here and not the sky itself; the sky reference is the NASA-JPL DE440s fixture in test-fixtures/drik-de440-geometric.json, not yet used for this comparison',
};
if (require.main === module) {
  fs.writeFileSync(path.join(ROOT, 'corpus', 'research', 'validate-dense.json'), JSON.stringify(out, null, 1) + '\n');
  console.log(JSON.stringify(out.wholeSpan));
  console.log('wrote corpus/research/validate-dense.json');
}
module.exports = { rows, stat, COLS };
