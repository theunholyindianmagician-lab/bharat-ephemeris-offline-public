#!/usr/bin/env node
// node scripts/measure-eclipses.cjs [--write] [--from JD --to JD]
//
// The eclipse model's two unmeasured pieces, measured against the dṛk tier (the owner, 2026-10-13: "complete the circle"):
//   (1) the text's shadow (SS 4.4-4.5, tamas) — a scale shadowScale on it, from the lunar eclipses the two tiers share over
//       1900-2100 at Ujjain: the Kerala default's magnitude is linear in the scale at a fixed middle (channa = (moon + shadow)/2 − |β|),
//       so the least-squares scale is closed-form on the matched eclipses; the fit is checked on every other eclipse (holdout);
//   (2) the chapter-5 parallax — natiScale on the nati (5.10-5.12) and lambanaScale on the middle's lambana (5.8-5.9), from the solar
//       eclipses: for every new moon at which either tier sees an eclipse at the site, the Kerala model's covered fraction
//       (channa / grahya, clipped at 0) against the dṛk tier's local magnitude (0 where the site is outside the eclipse); a grid
//       over the two scales, then refined, the objective on alternate events with the rest as holdout.
// Writes the result into corpus/research/parampara-apply.json → measured.eclipses (the joint candidates carry its amplitudes through
// ss-tier measuredFromRecord). Everything here is measured; no number is typed.
const path = require('node:path'), fs = require('node:fs');
const ROOT = path.join(__dirname, '..');
const M = require(path.join(ROOT, 'math-core.js')), ST = require(path.join(ROOT, 'ss-tier.js')), SK = require(path.join(ROOT, 'samskara.js'));
const argv = process.argv.slice(2), opt = (k, d) => { const i = argv.indexOf(k); return i >= 0 ? Number(argv[i + 1]) : d; };
const FROM = opt('--from', 2415020.5), TO = opt('--to', 2488069.5), SITE = { latitude: 23.1765, longitude: 75.78 };
const stat = (a) => ({ n: a.length, mean: +(a.reduce((x, y) => x + y, 0) / Math.max(1, a.length)).toFixed(4), rms: +Math.sqrt(a.reduce((x, y) => x + y * y, 0) / Math.max(1, a.length)).toFixed(4), max: +(a.length ? Math.max(...a.map(Math.abs)) : 0).toFixed(4) });
const t0 = Date.now(), log = (...x) => console.error(`[${((Date.now() - t0) / 1000).toFixed(0)}s]`, ...x);

// the two tiers' eclipse lists over the span — the Kerala default WITHOUT the eclipse scales (what is measured here is the bare shadow and
// parallax; a rerun on a record that already carries them must not measure them against themselves)
const bare = Object.fromEntries(Object.entries(ST.measuredFromRecord(ST.measuredRecord(), ST.DEFAULT_CANDIDATE)).filter(([k]) => !ST.ECLIPSE_KEYS.includes(k)));
const T = { samskara: 'kerala', measured: bare };
const lists = { kerala: [], drik: [] };
const win = 3600;
for (let a = FROM; a < TO; a += win) { const b = Math.min(a + win, TO);
  lists.drik.push(...M.tierEclipses(a, b, SITE.latitude, SITE.longitude, 'drik').list);
  lists.kerala.push(...ST.eclipsesNear((a + b) / 2, SITE, (b - a) / 2 + 1, T).filter((E) => E.middleJd >= a && E.middleJd < b)); }
const uniq = (L) => L.filter((e, i) => !L.slice(0, i).some((f) => f.kind === e.kind && Math.abs(f.middleJd - e.middleJd) < 0.01));
const K = uniq(lists.kerala), D = uniq(lists.drik);
log(`lists: kerala ${K.length}, drik ${D.length}`);

// ── (1) the shadow ──
const lunarD = D.filter((e) => e.kind === 'lunar' && !e.penumbral), lunarK = K.filter((e) => e.kind === 'lunar');
const pairs = [];
for (const d of lunarD) { const k = lunarK.find((x) => Math.abs(x.middleJd - d.middleJd) < 0.1); if (!k || !(k.magnitude > 0) || d.magnitude === null) continue;
  const grahya = k.channa / k.magnitude, halfSum = k.channa + Math.abs(k.latitude), shadow = 2 * halfSum - grahya;   // the row's channa, latitude (arcmin) and magnitude give the discs back
  pairs.push({ jd: d.middleJd, magK: k.magnitude, magD: d.magnitude, w: shadow / (2 * grahya) }); }
const fitL = pairs.filter((_, i) => i % 2 === 0), holdL = pairs.filter((_, i) => i % 2 === 1);
const scaleOf = (P) => P.reduce((s, p) => s + p.w * (p.magD - p.magK), 0) / P.reduce((s, p) => s + p.w * p.w, 0);   // least squares: magK + s·w ≈ magD
const shadowScale = scaleOf(fitL), resL = (P, s) => P.map((p) => p.magK + s * p.w - p.magD);
const shadow = { scale: shadowScale, matched: pairs.length, fittedOn: fitL.length, holdoutOn: holdL.length,
  before: stat(resL(fitL, 0)), after: stat(resL(fitL, shadowScale)), holdout: { before: stat(resL(holdL, 0)), after: stat(resL(holdL, shadowScale)) }, allShadowScale: scaleOf(pairs),
  method: 'the Kerala default\'s lunar magnitude (SS 4.10-4.11 on the measured places) against the dṛk umbral magnitude at the eclipses both list (middles within 0.1 d); channa = (moon + shadow·(1 + s))/2 − |β| is linear in s at the middle, so s is the closed-form least-squares scale on every other matched eclipse (even index), the odd ones held out',
  unit: 'magnitude (the covered part ÷ the Moon\'s disc); scale dimensionless on the text\'s tamas (4.4-4.5)' };
log(`shadow: scale ${shadowScale.toFixed(4)}, magnitude rms ${shadow.before.rms} → ${shadow.after.rms} (holdout ${shadow.holdout.before.rms} → ${shadow.holdout.after.rms})`);

// ── (2) the parallax ──
const cal = ST.calendar(T), base = ST.model(T), site = ST.siteOf(SITE), daysOf = ST.daysOfJd;
if (base.parallaxScale || base.discsFrom) throw new Error('measure-eclipses: the model must carry no eclipse scale while they are measured');
const solarD = D.filter((e) => e.kind === 'solar'), solarK = K.filter((e) => e.kind === 'solar');
const events = [];
for (const e of [...solarD, ...solarK]) { if (events.some((x) => Math.abs(x.jd - e.middleJd) < 0.5)) continue;
  const d = solarD.find((x) => Math.abs(x.middleJd - e.middleJd) < 0.5);
  events.push({ jd: e.middleJd, magD: d && d.magnitude !== null ? d.magnitude : 0, near: cal.syzygyNear(daysOf(e.middleJd) - 3, 0, +1) }); }
events.sort((a, b) => a.jd - b.jd);
log(`solar events: ${events.length} (dṛk at the site ${solarD.length}, kerala listed ${solarK.length})`);
const magK = (ev, nati, lambana) => { try { const E = SK.solarEclipseOnModel({ ...base, parallaxScale: { nati, lambana } }, ev.near, site); return Math.max(0, E.channa / E.grahya); } catch (e) { return 0; } };
const fitS = events.filter((_, i) => i % 2 === 0), holdS = events.filter((_, i) => i % 2 === 1);
const resS = (set, nati, lambana) => set.map((ev) => magK(ev, nati, lambana) - ev.magD);
const objective = (nati, lambana) => { const r = resS(fitS, nati, lambana); return r.reduce((s, x) => s + x * x, 0) / r.length; };
let best = { nati: 0, lambana: 0, f: objective(0, 0) }; const f0 = best.f;
for (let n = -1; n <= 2.0001; n += 0.1) for (let l = -1; l <= 1.0001; l += 0.1) { const f = objective(n, l); if (f < best.f) best = { nati: n, lambana: l, f }; }
log(`parallax grid: nati ${best.nati.toFixed(2)}, lambana ${best.lambana.toFixed(2)}, objective ${f0.toExponential(3)} → ${best.f.toExponential(3)}`);
for (const step of [0.02, 0.005]) { const c = { ...best }; for (let n = c.nati - 5 * step; n <= c.nati + 5 * step + 1e-9; n += step) for (let l = c.lambana - 5 * step; l <= c.lambana + 5 * step + 1e-9; l += step) { const f = objective(n, l); if (f < best.f) best = { nati: n, lambana: l, f }; } }
const natiScale = +best.nati.toFixed(4), lambanaScale = +best.lambana.toFixed(4);
const seenCount = (set, nati, lambana) => ({ drikAtSite: set.filter((e) => e.magD > 0).length, keralaListed: set.filter((e) => magK(e, nati, lambana) > 0).length, both: set.filter((e) => e.magD > 0 && magK(e, nati, lambana) > 0).length });
const parallax = { natiScale, lambanaScale, events: events.length, fittedOn: fitS.length, holdoutOn: holdS.length,
  before: stat(resS(fitS, 0, 0)), after: stat(resS(fitS, natiScale, lambanaScale)), holdout: { before: stat(resS(holdS, 0, 0)), after: stat(resS(holdS, natiScale, lambanaScale)) },
  agreement: { before: seenCount(events, 0, 0), after: seenCount(events, natiScale, lambanaScale) },
  method: 'at every new moon of the span where either tier has a solar eclipse at Ujjain, the Kerala model\'s covered fraction (samskara.js solarOnModel: channa ÷ grahya, clipped at 0) against the dṛk tier\'s local magnitude (0 where the site is outside the eclipse); the text\'s nati (5.10-5.12) × (1 + natiScale) and the middle\'s lambana (5.8-5.9) × (1 + lambanaScale) chosen on a grid (0.1, then 0.02 and 0.005 about the best) to minimise the mean square on every other event, the rest held out',
  unit: 'magnitude (the covered part ÷ the Sun\'s disc); scales dimensionless on the text\'s nati and lambana' };
log(`parallax: nati ${natiScale}, lambana ${lambanaScale}; rms ${parallax.before.rms} → ${parallax.after.rms} (holdout ${parallax.holdout.before.rms} → ${parallax.holdout.after.rms}); both-seen ${parallax.agreement.before.both} → ${parallax.agreement.after.both} of ${solarD.length}`);

const out = { generatedBy: 'scripts/measure-eclipses.cjs (the text\'s shadow and the chapter-5 parallax measured against the dṛk tier\'s eclipses at Ujjain)', span: `JD ${FROM}-${TO} (1900-2100) at Ujjain ${SITE.latitude}°N ${SITE.longitude}°E`,
  amplitudes: { shadowScale: +shadowScale.toFixed(5), natiScale, lambanaScale }, shadow, parallax,
  note: 'measured on the Kerala default\'s places without these scales (what is measured is the bare shadow and parallax); the joint candidates carry the three amplitudes (ss-tier measuredFromRecord); the validation (scripts/validate-oos.cjs) re-counts the eclipses with them applied' };
console.log(JSON.stringify(out, null, 1));
if (argv.includes('--write')) {
  const p = path.join(ROOT, 'corpus', 'research', 'parampara-apply.json'), rec = JSON.parse(fs.readFileSync(p, 'utf8'));
  rec.measured.eclipses = out; fs.writeFileSync(p, JSON.stringify(rec, null, 1) + '\n'); console.error('wrote corpus/research/parampara-apply.json → measured.eclipses');
}
