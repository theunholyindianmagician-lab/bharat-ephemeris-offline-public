// node scripts/validate-oos.cjs [--write] — the Kerala default measured OUT OF SAMPLE (the owner's audit point, 2026-10-12): never on the samples the fit used.
// Out-of-sample validation of the Kerala default (the owner's audit point): the fit grid is the whole span the dṛk tier serves, 1850-2150
// every 97 d from JD 2396773.5 (15 d in from each edge). (1) a frozen holdout grid interleaved between the fit samples (every 97 d from
// +48.5 d), (2) the first and last years of the span every 7 d (the edges, where an earlier narrower fit degraded), (3) actual tithi-end
// instants by root-finding on each tier (every tithi of 2026, 1850 and 2149), compared instant for instant, (4) the eclipses of 1900-2100 at
// Ujjain against the dṛk tier's, with the measured shadow and parallax scales applied (scripts/measure-eclipses.cjs); also the planets on
// the holdout grid. No temporal holdout exists any more: nothing the dṛk tier serves is outside the fit.
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
if (require.main === module) {
const out = { frame: 'arcminutes; Sun/Moon/Rāhu tropical (each tier its own ayanāṃśa), planets sidereal, Moon latitude; candidate minus the dṛk tier', fitGrid: 'JD 2396773.5 + 97 d × 1130 (1850-2150, the whole span the dṛk tier serves; was 1862-2138 at 4d0aec6 and 1900-2100 at fb59cb3 — the edges then held out degraded Venus and Saturn to 7-10′, which is why the fit now covers the span)', fitGridWas: 'JD 2401141.5 + 97 d × 1039 (1862-2138); the dṛk tier serves 1850-2150' };
out.holdoutInterleaved = { grid: 'JD 2396822 + 97 d × 1129 (1850-2150), midway between the fit samples', ...residuals(grid(2396822, 97, 1129), {}) };
out.edgeFirstYear = { grid: '1850 every 7 d (the span\'s first year, inside the fit now; the interleaved grid is the out-of-sample measure)', ...residuals(grid(2396758.5, 7, 52), {}) };
out.edgeLastYear = { grid: '2149 every 7 d (the span\'s last year, 18 d short of its end)', ...residuals(grid(2505950.5, 7, 52), {}) };
out.plainTierOnHoldout = { grid: 'the interleaved grid, the bare paramparā (measured: false)', ...residuals(grid(2396822, 97, 1129), { measured: false }) };
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
out.tithiEnds = [compareTithi(2461041.5, 365, '2026'), compareTithi(2396758.5, 365, '1850 (the span\'s first year)'), compareTithi(2505950.5, 364, '2149 (its last year, 18 d short of the end)')];
// eclipses: the Kerala default's eclipse search (the measured places on the saṃskāra model) against the dṛk tier's, 1900-2100, at Ujjain —
// lunar eclipses matched by middle instant within 0.1 d (times in minutes, magnitudes as such); solar ones where both tiers list them as seen at the site
function compareEclipses(fromJd, toJd) {
  const site = [23.18, 75.78], win = 3600, lists = { kerala: [], drik: [] };
  for (let a = fromJd; a < toJd; a += win) for (const t of ['kerala', 'drik']) lists[t].push(...M.tierEclipses(a, Math.min(a + win, toJd), site[0], site[1], t).list);
  const uniq = (L) => L.filter((e, i) => !L.slice(0, i).some((f) => f.kind === e.kind && Math.abs(f.middleJd - e.middleJd) < 0.01));
  const K = uniq(lists.kerala), D = uniq(lists.drik);
  const lunarD = D.filter((e) => e.kind === 'lunar' && !e.penumbral), lunarK = K.filter((e) => e.kind === 'lunar');
  const dt = [], dmag = [], unmatched = [];
  for (const d of lunarD) { const k = lunarK.find((x) => Math.abs(x.middleJd - d.middleJd) < 0.1); if (!k) { unmatched.push(d.middleJd); continue; } dt.push((k.middleJd - d.middleJd) * 1440); if (d.magnitude !== null && k.magnitude !== null) dmag.push(k.magnitude - d.magnitude); }
  const solarD = D.filter((e) => e.kind === 'solar' && e.seenAtSite), solarK = K.filter((e) => e.kind === 'solar');
  const st = [], sMissing = [];
  for (const d of solarD) { const k = solarK.find((x) => Math.abs(x.middleJd - d.middleJd) < 0.1); if (!k) { sMissing.push(d.middleJd); continue; } st.push((k.middleJd - d.middleJd) * 1440); }
  const keralaNotInDrik = solarK.filter((k) => !D.some((d) => d.kind === 'solar' && Math.abs(d.middleJd - k.middleJd) < 0.1)).length;
  const sm = ST.correction('kerala') && ST.label({ samskara: 'kerala' }).measured, scales = sm ? Object.fromEntries(ST.ECLIPSE_KEYS.map((k) => [k, sm[k] === undefined ? null : sm[k]])) : null;
  return { span: `${fromJd}-${toJd} at Ujjain`, scalesApplied: scales, lunar: { drikUmbral: lunarD.length, keralaListed: lunarK.length, matched: dt.length, keralaMinusDrikMiddleMinutes: stat(dt), magnitudeDifference: stat(dmag), unmatchedDrikMiddles: unmatched.slice(0, 10) },
    solar: { drikSeenAtSite: solarD.length, keralaListed: solarK.length, matched: st.length, keralaMinusDrikMiddleMinutes: st.length ? stat(st) : null, drikSeenNotInKerala: sMissing.slice(0, 20), keralaListedNotInDrik: keralaNotInDrik },
    note: 'the Kerala default\'s lunar magnitude is the text\'s shadow (SS 4.4-4.11) × (1 + shadowScale) on the measured places, the solar list the text\'s site rule (6.13) on the saṃskāra model with the ch.5 nati and lambana × their measured scales (scripts/measure-eclipses.cjs, measured on alternate eclipses with the rest held out); the dṛk solar list is the eclipses whose path reaches the site, seen or not' };
}
out.eclipses = compareEclipses(2415020.5, 2488069.5);
console.log(JSON.stringify(out, null, 1));
if (process.argv.includes('--write')) { require('fs').writeFileSync(path.join(ROOT, 'corpus', 'research', 'validate-oos.json'), JSON.stringify(out, null, 1) + '\n'); console.log('wrote corpus/research/validate-oos.json'); }
}
