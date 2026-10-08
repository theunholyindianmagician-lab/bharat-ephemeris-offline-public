#!/usr/bin/env node
/* scripts/parampara-samskara.cjs — what the ancestors' own eclipse readings say about the text (council KH-03).
 *
 * The observations the repository already holds are the fifteen eclipse records of Parameśvara and Nīlakaṇṭha
 * (corpus/jyotirmimamsa/eclipses.json). Their readings, as structured rows, are corpus/jyotirmimamsa/readings.json.
 * Each timed reading becomes an instant by the text's own clocks: a man's shadow in padas through the śaṅku's shadow
 * clock (vedha-lekha turnAsusFromShadow, SS 3.37-3.39), "at sunset" by the text's sunset. Each solar eclipse's contacts
 * become one grahana-surya equation and each "seen"/"not seen" one grahana-drishta inequality (samskara.js), and the
 * robust saṃskāra runs on them — as a paramparā fit of its own, at Parameśvara's era, never pooled with the owner's ledger.
 *
 *   node scripts/parampara-samskara.cjs           print the fit for man = 7 padas and the sensitivity to 6.5 and 7.5
 *   node scripts/parampara-samskara.cjs --json    the same as JSON
 * Nothing modern enters: no ephemeris, no clock, no catalogue; the towns are all taken at the village's palabhā.
 */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.join(__dirname, '..');
const SK = require(path.join(ROOT, 'samskara.js')), V = require(path.join(ROOT, 'vedha-lekha.js')), GH = require(path.join(ROOT, 'ss-grahana.js'));
const R = JSON.parse(fs.readFileSync(path.join(ROOT, 'corpus', 'jyotirmimamsa', 'readings.json'), 'utf8'));

const SITE_IN = { name: "Parameśvara's village on the Nilā (JM p.36)", palabha: { angula: 2, vyangula: 18 }, deshantara: -2 };
const ms = V.placeOf(SITE_IN, 12), site = { latitude: ms.latitude, deshantara: ms.deshantara, palabha: ms.palabha };
// The Sun is held: shadows fix it, and six contacts cannot tell a common shift of Sun, Moon and node (which moves the
// conjunction only through the anomalies) from a real one. The records see the elongation and the argument of latitude.
const EPOCH = 1652000, VIN = 3600, PARAMS = ['moon.epoch', 'node.epoch'];

function instantOf(r, man, side) {
  if (r.at === 'sunset') return { t: V.sunsetAt(r.N, ms), sigmaVinadi: r.sigmaVinadi ?? 15 };
  const at = (padas) => V.afterTurnAsus(V.sunriseAt(r.N, ms), V.turnAsusFromShadow(r.N, padas * 12 / man, side || r.side, ms).asus);
  const t = at(r.padas), half = Math.abs(at(r.padas + 0.5) - at(r.padas - 0.5)) / 2 * VIN;          // a reading to ½ pada
  const alt = r.padas_alt !== undefined ? Math.abs(at(r.padas_alt) - t) / 2 * VIN : 0;              // two observers
  return { t, sigmaVinadi: Math.max(6, Math.hypot(half, alt)) };
}
function observations(man) {
  const out = [], textNone = [], solar = new Map();
  for (const r of R.timed) {
    if (r.ambiguous) { textNone.push({ id: r.id, contact: r.contact, why: 'ambiguous reading: not a timed row' }); continue; }
    const near = r.N + 0.5, E0 = GH.solarEclipse(near, site);
    if (!E0.possible || E0.contacts[r.contact] === null) { textNone.push({ id: r.id, contact: r.contact, why: 'the text gives no such contact at the village: a result, not a row' }); continue; }
    const x = instantOf(r, man), o = solar.get(r.id) || { id: `${r.id}-timed`, kind: 'grahana-surya', site, near, observer: r.id.startsWith('JM') ? 'Nīlakaṇṭha' : 'Parameśvara', sigmaVinadi: 0 };
    o[r.contact] = x.t; o.sigmaVinadi = Math.max(o.sigmaVinadi, x.sigmaVinadi);
    solar.set(r.id, o);
  }
  out.push(...solar.values());
  for (const r of R.seen) out.push({ id: `${r.id}-seen`, kind: 'grahana-drishta', body: r.body, near: r.N + 0.5, seen: r.seen, ...(r.body === 'surya' ? { site } : {}), observer: 'Parameśvara' });
  return { out, textNone };
}
function residualTable() {
  // the text against each timed reading, in ghaṭikā, both halves of the day where the record does not say
  return R.timed.map((r) => {
    const E0 = GH.solarEclipse(r.N + 0.5, site), tt = E0.possible ? E0.contacts[r.contact] : null;
    const row = { id: r.id, contact: r.contact, reading: r.at === 'sunset' ? 'at sunset' : `${r.padas} padas, ${r.side}`, textPossible: E0.possible };
    if (tt === null || tt === undefined) return { ...row, residualGhati: null };
    row.residualGhati = +((tt - instantOf(r, 7).t) * 60).toFixed(2);
    if (r.side_from === 'reading') row.ifAfternoonGhati = +((tt - instantOf(r, 7, 'pashcima').t) * 60).toFixed(2);
    return row;
  });
}
function fit(man) {
  const { out, textNone } = observations(man);
  const f = SK.correct(out, { epoch: EPOCH, params: PARAMS, bija: false });
  const params = Object.fromEntries(Object.entries(f.params).map(([n, p]) => [n, { delta: +p.delta.toFixed(2), sigma: p.sigma === null ? null : +p.sigma.toFixed(2), status: p.status, unit: p.unit }]));
  const viol = (s) => s.inequalities.violated;
  return { man_padas: man, rows: f.rows, observations: out.length, textNone, params, frozen: f.frozen.map((z) => ({ param: z.param, reason: z.reason })),
    rejected: f.rejected, chi2PerDof: f.chi2PerDof === null ? null : +f.chi2PerDof.toFixed(2),
    inequalitiesViolated: { before: viol(f.residuals.before), after: viol(f.residuals.after) } };
}

if (require.main === module) {
  const res = { tag: '[recorded]: the ancestors\' readings (Jyotirmīmāṃsā); a paramparā fit at Kali ' + EPOCH + ', not pooled with the owner\'s ledger',
    site, residuals: residualTable(), fits: [7, 6.5, 7.5].map(fit) };
  if (process.argv.includes('--json')) { console.log(JSON.stringify(res, null, 2)); process.exit(0); }
  console.log(res.tag);
  console.log('\nThe text against each timed reading (text − record, ghaṭikā; negative = the text early):');
  for (const r of res.residuals) console.log(`  ${r.id.padEnd(9)} ${r.contact.padEnd(8)} ${r.reading.padEnd(18)} ${r.residualGhati === null ? 'the text gives no such contact' : String(r.residualGhati).padStart(6)}${r.ifAfternoonGhati !== undefined ? `   (if afternoon: ${r.ifAfternoonGhati})` : ''}`);
  for (const f of res.fits) {
    console.log(`\nman = ${f.man_padas} padas: ${f.observations} records, ${f.rows} rows; χ²/dof ${f.chi2PerDof}; inequalities violated ${f.inequalitiesViolated.before} → ${f.inequalitiesViolated.after}`);
    for (const [n, p] of Object.entries(f.params)) console.log(`  ${n.padEnd(14)} ${p.status.padEnd(7)} ${p.delta} ± ${p.sigma ?? '—'} ${p.unit}`);
    if (f.frozen.length) console.log('  frozen: ' + f.frozen.map((z) => `${z.param} (${z.reason})`).join('; '));
    if (f.rejected.length) console.log('  set aside: ' + f.rejected.map((z) => `${z.id} (${z.normalized.toFixed(1)}σ)`).join(', '));
    if (f.textNone.length) console.log('  not rows: ' + f.textNone.map((z) => `${z.id} ${z.contact} (${z.why})`).join('; '));
  }
}
module.exports = { observations, fit, residualTable, site, EPOCH };
