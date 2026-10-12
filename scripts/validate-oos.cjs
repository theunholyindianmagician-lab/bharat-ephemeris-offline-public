// node scripts/validate-oos.cjs [--write] — the Kerala default measured OUT OF SAMPLE (the owner's audit point, 2026-10-12): never on the samples the fit used.
// Out-of-sample validation of the Kerala default (the owner's audit point): the fit used 1900-2100 every 97 d from JD 2415020.5.
// (1) a frozen holdout grid interleaved between the fit samples (every 97 d from +48.5 d), (2) temporal holdouts outside the fit span
// but inside the dṛk tier's span (1850-1900, 2100-2150), (3) actual tithi-end instants by root-finding on each tier (every tithi of 2026
// and of 1880 and 2120), compared instant for instant; also the planets on the holdout grid.
const path = require('path'), ROOT = path.join(__dirname, '..');
const M = require(path.join(ROOT, 'math-core.js')), ST = require(path.join(ROOT, 'ss-tier.js'));
const mod = (a, m) => ((a % m) + m) % m, wrap = (d) => mod(d + 180, 360) - 180, tOf = (jd) => jd - 588465.5 + 75.7885 / 360;
const stat = (a) => ({ n: a.length, mean: +(a.reduce((x, y) => x + y, 0) / a.length).toFixed(3), rms: +Math.sqrt(a.reduce((x, y) => x + y * y, 0) / a.length).toFixed(3), max: +Math.max(...a.map(Math.abs)).toFixed(2) });
const KER = ST.correction('kerala');
function residuals(jds, opts) {
  const r = { sun: [], moon: [], el: [], rahu: [], mangala: [], budha: [], guru: [], shukra: [], shani: [], moonLat: [] };
  for (const jd of jds) { const rows = M.tierGrahaRows(jd, 'drik'), ayD = M.tierAyanamsha(jd, 'drik').deg, g = ST.grahas(jd, { samskara: 'kerala', ...opts }), ayK = KER.ayanamshaAt(tOf(jd)), R = Object.fromEntries(rows.map((x) => [x.key, x]));
    r.sun.push(wrap(g.surya + ayK - R.surya.longitude - ayD) * 60); r.moon.push(wrap(g.candra + ayK - R.candra.longitude - ayD) * 60); r.el.push(wrap((g.candra - g.surya) - (R.candra.longitude - R.surya.longitude)) * 60);
    r.rahu.push(wrap(g.rahu + ayK - R.rahu.longitude - ayD) * 60); r.moonLat.push((g.latitudeDeg.candra - R.candra.latitudeDeg) * 60);
    for (const k of ['mangala', 'budha', 'guru', 'shukra', 'shani']) r[k].push(wrap(g[k] - R[k].longitude) * 60); }
  return Object.fromEntries(Object.entries(r).map(([k, v]) => [k, stat(v)]));
}
const grid = (from, step, n) => Array.from({ length: n }, (_, i) => from + i * step);
const out = { frame: 'arcminutes; Sun/Moon/Rāhu tropical (each tier its own ayanāṃśa), planets sidereal, Moon latitude; candidate minus the dṛk tier', fitGrid: 'JD 2415020.5 + 97 d × 753 (1900-2100)' };
out.holdoutInterleaved = { grid: 'JD 2415069 + 97 d × 752 (1900-2100), midway between the fit samples', ...residuals(grid(2415069, 97, 752), {}) };
out.holdoutBefore = { grid: '1850-1900 every 29 d', ...residuals(grid(2396758.5, 29, 630), {}) };
out.holdoutAfter = { grid: '2100-2150 every 29 d', ...residuals(grid(2488069.5, 29, 630), {}) };
out.plainTierOnHoldout = { grid: 'the interleaved grid, the bare paramparā (measured: false)', ...residuals(grid(2415069, 97, 752), { measured: false }) };
// tithi ends: root-find the instant the elongation crosses each multiple of 12° on each tier, by bisection on a 1 h scan
function tithiEnds(fromJd, days, elongOf) {
  const ends = []; let prev = elongOf(fromJd), t = fromJd;
  for (let h = 1; h <= days * 24; h++) { const jd = fromJd + h / 24, e = elongOf(jd);
    if (Math.floor(e / 12) !== Math.floor(prev / 12) && !(prev > 350 && e < 10)) { let lo = jd - 1 / 24, hi = jd, k = Math.floor(e / 12) * 12; if (k === 0) k = 360;
      for (let i = 0; i < 30; i++) { const m = (lo + hi) / 2; const em = elongOf(m); (em < k && !(k === 360 && em < 10)) || (k === 360 && em > 350) ? (lo = m) : (hi = m); }
      ends.push({ k: k % 360, jd: (lo + hi) / 2 }); }
    prev = e; }
  return ends;
}
function compareTithi(fromJd, days, label) {
  const dr = tithiEnds(fromJd, days, (jd) => { const r = M.tierGrahaRows(jd, 'drik'); return mod(r.find((x) => x.key === 'candra').longitude - r.find((x) => x.key === 'surya').longitude, 360); });
  const kr = tithiEnds(fromJd, days, (jd) => { const g = ST.grahas(jd, { samskara: 'kerala' }); return mod(g.candra - g.surya, 360); });
  const pl = tithiEnds(fromJd, days, (jd) => { const g = ST.grahas(jd, { samskara: 'kerala', measured: false }); return mod(g.candra - g.surya, 360); });
  const pair = (a, b) => { const d = []; for (const x of a) { const y = b.find((z) => z.k === x.k && Math.abs(z.jd - x.jd) < 2); if (y) d.push((y.jd - x.jd) * 1440); } return d; };
  const dk = pair(dr, kr), dp = pair(dr, pl);
  return { label, tithiEndsFound: dr.length, matched: dk.length, keralaDefaultMinusDrikMinutes: stat(dk), plainParamparaMinusDrikMinutes: stat(dp) };
}
out.tithiEnds = [compareTithi(2461041.5, 365, '2026 (inside the fit span)'), compareTithi(2407650.5, 365, '1880 (before it)'), compareTithi(2495280.5, 365, '2120 (after it)')];
console.log(JSON.stringify(out, null, 1));
if (process.argv.includes('--write')) { require('fs').writeFileSync(path.join(ROOT, 'corpus', 'research', 'validate-oos.json'), JSON.stringify(out, null, 1) + '\n'); console.log('wrote corpus/research/validate-oos.json'); }
