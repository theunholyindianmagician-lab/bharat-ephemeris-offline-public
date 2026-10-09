#!/usr/bin/env node
/* scripts/parampara-samskara.cjs — what the ancestors' own eclipse readings say about the text (council KH-03), read
 * through the paramparā registry (corpus/parampara/registry.json).
 *
 * The observations the repository holds are the fifteen eclipse records of Parameśvara and Nīlakaṇṭha
 * (corpus/jyotirmimamsa/eclipses.json). Their readings, as structured rows, are corpus/jyotirmimamsa/readings.json, which
 * stays their single source; the registry names each record (class, observer, era, locus, quote, assumptions, σ rule,
 * status) and points into those rows. Each timed reading becomes an instant by the text's own clocks: a man's shadow in
 * padas through the śaṅku's shadow clock (vedha-lekha turnAsusFromShadow, SS 3.37-3.39), "at sunset" by the text's sunset.
 * Each solar eclipse's contacts become one grahana-surya equation and each "seen"/"not seen" one grahana-drishta
 * inequality (samskara.js), every row tagged source "parampara" with its locus, and the robust saṃskāra runs on them — a
 * paramparā fit of its own, at Parameśvara's era. The owner's ledger is optional and is pooled with it only on request.
 *
 *   node scripts/parampara-samskara.cjs              print the fit for man = 7 padas and the sensitivity to 6.5 and 7.5
 *   node scripts/parampara-samskara.cjs --json       the same as JSON
 *   node scripts/parampara-samskara.cjs --write      regenerate corpus/parampara/samskara.json (the offered correction,
 *                                                    its σ, sensitivity, leave-one-out and input digests); --check compares
 *   node scripts/parampara-samskara.cjs --stamp      write each registry record's sha256 (vedha-lekha.js canonical JSON)
 *   node scripts/parampara-samskara.cjs --etext-lines DIR    copy the quoted e-text lines (only those) into
 *                                                    corpus/parampara/etext-lines.json; --verify-etext DIR checks them
 * Nothing modern enters: no ephemeris, no clock, no catalogue; the towns are all taken at the village's palabhā.
 */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.join(__dirname, '..');
const SK = require(path.join(ROOT, 'samskara.js')), V = require(path.join(ROOT, 'vedha-lekha.js')), GH = require(path.join(ROOT, 'ss-grahana.js'));
const K = require(path.join(ROOT, 'kala-dvara.js'));
const S = require(path.join(ROOT, 'sphuta.js'));
const FILES = {
  registry: path.join(ROOT, 'corpus', 'parampara', 'registry.json'),
  samskara: path.join(ROOT, 'corpus', 'parampara', 'samskara.json'),
  graha: path.join(ROOT, 'corpus', 'parampara', 'graha.json'),
  etextLines: path.join(ROOT, 'corpus', 'parampara', 'etext-lines.json'),
  timeUnits: path.join(ROOT, 'corpus', 'sources', 'time-units.json'),
  readings: path.join(ROOT, 'corpus', 'jyotirmimamsa', 'readings.json'),
  eclipses: path.join(ROOT, 'corpus', 'jyotirmimamsa', 'eclipses.json'),
};
const readJSON = (f) => JSON.parse(fs.readFileSync(f, 'utf8'));
const REG = readJSON(FILES.registry), R = readJSON(FILES.readings);

// the village, in the registry's śāstra units: palabhā in aṅgula, deśāntara 20 vināḍī west = 2° of the turn
const VILLAGE = REG.sites.ashvatthagrama;
const SITE_IN = { name: "Parameśvara's village on the Nilā (JM p.36)", palabha: { angula: VILLAGE.palabha.angula, vyangula: VILLAGE.palabha.vyangula }, deshantara: -VILLAGE.deshantara.vinadi * 6 / 60 };
const ms = V.placeOf(SITE_IN, 12), site = { latitude: ms.latitude, deshantara: ms.deshantara, palabha: ms.palabha };
// The Sun is held: shadows fix it, and six contacts cannot tell a common shift of Sun, Moon and node (which moves the
// conjunction only through the anomalies) from a real one. The records see the elongation and the argument of latitude.
const EPOCH = 1652000, VIN = 3600, PARAMS = ['moon.epoch', 'node.epoch'], MAN = 7, SENSITIVITY = [7, 6.5, 7.5];
const LABEL = "Sūrya-Siddhānta + Parameśvara's saṃskāra", LABEL_SA = 'सूर्य-सिद्धान्त + परमेश्वर-संस्कार';
const PLAIN_LABEL = 'Sūrya-Siddhānta', PLAIN_LABEL_SA = 'सूर्य-सिद्धान्त';

/** The readings rows, each with the registry record that names it. Every row of readings.json is named by exactly one
 *  registry record of class observation, and every pointer of the registry resolves (the single-source rule). */
function registryRows(reg = REG, readings = R) {
  const recs = reg.records.filter((r) => r.refs && Array.isArray(r.refs.readings));
  const named = new Map();
  const key = (section, id, contact) => `${section}|${id}|${contact || ''}`;
  for (const rec of recs) {
    if (rec.class !== 'observation') throw new RangeError(`registry ${rec.id}: only observations point into readings.json`);
    for (const p of rec.refs.readings) {
      if (p.id !== rec.refs.eclipses) throw new RangeError(`registry ${rec.id}: a pointer to another record's row (${p.id})`);
      const k = key(p.section, p.id, p.section === 'timed' ? p.contact : '');
      if (named.has(k)) throw new RangeError(`readings row ${k} is named twice (${named.get(k).id}, ${rec.id})`);
      named.set(k, rec);
    }
  }
  const timed = readings.timed.map((row) => {
    const rec = named.get(key('timed', row.id, row.contact));
    if (!rec) throw new RangeError(`readings timed row ${row.id} ${row.contact} is named by no registry record`);
    named.delete(key('timed', row.id, row.contact));
    return { row, rec };
  });
  const seen = readings.seen.map((row) => {
    const rec = named.get(key('seen', row.id));
    if (!rec) throw new RangeError(`readings seen row ${row.id} is named by no registry record`);
    named.delete(key('seen', row.id));
    return { row, rec };
  });
  if (named.size) throw new RangeError(`registry pointers that resolve to no readings row: ${[...named.keys()].join(', ')}`);
  for (const { rec } of [...timed, ...seen]) if (rec.status !== 'row') throw new RangeError(`registry ${rec.id}: a record with rows must have status "row" (it is "${rec.status}")`);
  return { timed, seen };
}

function instantOf(r, man, side) {
  if (r.at === 'sunset') return { t: V.sunsetAt(r.N, ms), sigmaVinadi: r.sigmaVinadi ?? 15 };
  const at = (padas) => V.afterTurnAsus(V.sunriseAt(r.N, ms), V.turnAsusFromShadow(r.N, padas * 12 / man, side || r.side, ms).asus);
  const t = at(r.padas), half = Math.abs(at(r.padas + 0.5) - at(r.padas - 0.5)) / 2 * VIN;          // a reading to ½ pada
  const alt = r.padas_alt !== undefined ? Math.abs(at(r.padas_alt) - t) / 2 * VIN : 0;              // two observers
  return { t, sigmaVinadi: Math.max(6, Math.hypot(half, alt)) };
}
/** The paramparā's records as saṃskāra observations (source "parampara", each with its locus). */
function observations(man = MAN) {
  const { timed, seen } = registryRows();
  const out = [], textNone = [], solar = new Map();
  for (const { row: r, rec } of timed) {
    if (r.ambiguous) { textNone.push({ id: r.id, contact: r.contact, why: 'ambiguous reading: not a timed row' }); continue; }
    const near = r.N + 0.5, E0 = GH.solarEclipse(near, site);
    if (!E0.possible || E0.contacts[r.contact] === null) { textNone.push({ id: r.id, contact: r.contact, why: 'the text gives no such contact at the village: a result, not a row' }); continue; }
    const x = instantOf(r, man), o = solar.get(r.id) || { id: `${r.id}-timed`, kind: 'grahana-surya', site, near, observer: rec.observer, source: 'parampara', locus: rec.locus, sigmaVinadi: 0 };
    o[r.contact] = x.t; o.sigmaVinadi = Math.max(o.sigmaVinadi, x.sigmaVinadi);
    solar.set(r.id, o);
  }
  out.push(...solar.values());
  for (const { row: r, rec } of seen) out.push({ id: `${r.id}-seen`, kind: 'grahana-drishta', body: r.body, near: r.N + 0.5, seen: r.seen, ...(r.body === 'surya' ? { site } : {}), observer: rec.observer, source: 'parampara', locus: rec.locus });
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
const round2 = (x) => (x === null ? null : +x.toFixed(2));
/** The paramparā fit. opts.ledger (a certified vedha-lekha/1 ledger) adds the owner's records — only with opts.pool: true. */
function fit(man = MAN, opts = {}) {
  const { out, textNone } = observations(man);
  const obs = out.slice();
  if (opts.ledger) {
    if (opts.pool !== true) throw new RangeError("parampara-samskara: the owner's ledger is pooled with the paramparā's records only on request (pool: true)");
    obs.push(...SK.fromLedger(opts.ledger, opts.ledgerOptions || {}).observations.map((o) => ({ ...o, source: 'owner' })));
  }
  const f = SK.correct(obs, { epoch: EPOCH, params: PARAMS, bija: false, pool: opts.pool === true });
  const params = Object.fromEntries(Object.entries(f.params).map(([n, p]) => [n, { delta: round2(p.delta), sigma: round2(p.sigma), status: p.status, unit: p.unit }]));
  const viol = (s) => s.inequalities.violated;
  return { man_padas: man, tag: f.tag, rows: f.rows, observations: obs.length, textNone, params, frozen: f.frozen.map((z) => ({ param: z.param, reason: z.reason })),
    rejected: f.rejected.map((z) => ({ id: z.id, normalized: round2(z.normalized), round: z.round })), chi2PerDof: round2(f.chi2PerDof),
    inequalitiesViolated: { before: viol(f.residuals.before), after: viol(f.residuals.after) }, used: obs.map((o) => o.id) };
}

/** Leave-one-out (parīkṣā, design §4.5 step 5): each timed eclipse is held out WHOLE — its contacts and its "seen" row —
 *  the fit is run on the rest, and the held-out contacts are predicted by the text and by the held-out correction. */
function leaveOneOut(man = MAN, full = null) {
  const { out } = observations(man);
  const base = full || fit(man);
  const set = new Set(base.rejected.map((r) => r.id));
  const rows = [];
  for (const h of out.filter((o) => o.kind === 'grahana-surya')) {
    const eclipse = h.id.replace(/-timed$/, '');
    const kept = out.filter((o) => o.id.replace(/-(timed|seen)$/, '') !== eclipse);
    const f = SK.correct(kept, { epoch: EPOCH, params: PARAMS, bija: false });
    const d = { 'moon.epoch': f.params['moon.epoch'].delta, 'node.epoch': f.params['node.epoch'].delta };
    const at = (deltas) => SK.solarEclipseOnModel(SK.model(deltas, { epoch: EPOCH }), h.near, h.site);
    const X0 = at({}), X1 = at(d);
    for (const k of ['sparsha', 'madhya', 'moksha']) {
      if (h[k] === undefined) continue;
      rows.push({ eclipse, contact: k, textGhati: round2((X0.at(k) - h[k]) * VIN / 60), correctedGhati: round2((X1.at(k) - h[k]) * VIN / 60),
        heldOutFit: { moonArcmin: round2(d['moon.epoch']), nodeArcmin: round2(d['node.epoch']) }, setAsideInFullFit: set.has(h.id) });
    }
  }
  const mean = (a) => round2(a.reduce((s, x) => s + Math.abs(x), 0) / a.length);
  const kept = rows.filter((r) => !r.setAsideInFullFit);
  return {
    rule: 'each timed eclipse held out whole (its contacts and its seen row); the robust fit on the rest; text − record and held-out corrected − record, in ghaṭikā',
    rows, meanTextGhati: mean(rows.map((r) => r.textGhati)), meanCorrectedGhati: mean(rows.map((r) => r.correctedGhati)),
    withoutSetAside: { meanTextGhati: mean(kept.map((r) => r.textGhati)), meanCorrectedGhati: mean(kept.map((r) => r.correctedGhati)), n: kept.length },
    improved: rows.filter((r) => Math.abs(r.correctedGhati) < Math.abs(r.textGhati)).length, n: rows.length,
  };
}

const julianOf = (n) => { const c = K.civilFromKaliDay(n, 'julian'); return `${c.year}-${String(c.month).padStart(2, '0')}-${String(c.day).padStart(2, '0')}`; };
/** The digests of exactly what the fit reads: the readings, the eclipse corpus, and the registry's rows and site. */
function inputDigests() {
  const rows = REG.records.filter((r) => r.refs && Array.isArray(r.refs.readings)).map((r) => ({ id: r.id, observer: r.observer, locus: r.locus, status: r.status, refs: r.refs }));
  return { readings: V.sha256(fs.readFileSync(FILES.readings, 'utf8')), eclipses: V.sha256(fs.readFileSync(FILES.eclipses, 'utf8')),
    registryRows: V.sha256(V.canonical({ rows, site: REG.sites.ashvatthagrama })) };
}
/** The ayanāṃśa from the paramparā's THREE determinations (2026-10-09, revised the same day): Āryabhaṭa's zero in Kali 3600
 *  (registry ABH-no-ayanacalana-3600), Nīlakaṇṭha's 14°26′ at Kali day 1,643,524 (NIL-ayanamsha-rate) and Parameśvara's 15°
 *  complete in Kali 4536 ("परीक्ष्य निर्णीतम्", PAR-ayanamsha-4536). The text's libration (SS 3.9-3.10) has two parameters here,
 *  its phase and its greatest value (27° + δ): both are fitted to the three records by least squares (sphuta.js
 *  ayanamshaSS(spandas, phaseDeg, amplitudeDeltaDeg)). One record cannot tell a phase from an amplitude change [theorem];
 *  three can: the fit keeps Āryabhaṭa's zero and widens the swing, so the rate grows from 54″ to about 57.7″ a year, which is
 *  what Āryabhaṭa's zero and Nīlakaṇṭha's figure already imply between them. The single-record readings (phase only,
 *  amplitude only) are kept beside it. Not part of the eclipse fit: the eclipses see the elongation and the argument of
 *  latitude, both sidereal, never the ayanāṃśa. */
function ayanamshaDetermination() {
  const rec = (id) => { const r = REG.records.find((x) => x.id === id); if (!r) throw new RangeError(`registry: ${id} is needed for the ayanāṃśa`); return r; };
  const abh = rec('ABH-no-ayanacalana-3600'), nil = rec('NIL-ayanamsha-rate'), par = rec('PAR-ayanamsha-4536');
  const yearDays = Number(S.YUGA_DAYS) / 4320000;                              // the text's year (SS 1.37), civil days
  const r4 = (x) => Math.round(x * 1e4) / 1e4, r1 = (x) => Math.round(x * 10) / 10, r2 = (x) => Math.round(x * 100) / 100;
  const m = /^(\d+)°(\d+)′$/.exec(nil.value.ayanamshaAtTheEclipse), nilDeg = Number(m[1]) + Number(m[2]) / 60;
  const records = [
    { id: abh.id, who: 'Āryabhaṭa', kaliDay: r4(abh.era.kaliYear * yearDays), deg: abh.value.ayanamshaAtKali3600, stated: `${abh.value.ayanamshaAtKali3600}° in Kali ${abh.era.kaliYear} (${abh.era.ad} CE)`,
      instant: "the start of Kali year 3600 elapsed, by the text's year [reading]", quote: abh.quote && abh.quote[0] ? abh.quote[0].sa : '' },
    { id: nil.id, who: 'Nīlakaṇṭha', kaliDay: nil.era.kaliDay, deg: r4(nilDeg), stated: `${nil.value.ayanamshaAtTheEclipse} at Kali day ${nil.era.kaliDay} (${nil.era.julian} Julian)`, instant: 'the worked eclipse', quote: nil.quote[0].sa },
    { id: par.id, who: 'Parameśvara', kaliDay: r4(par.value.kaliYearsElapsed * yearDays), deg: par.value.ayanamshaDegrees, stated: `${par.value.ayanamshaDegrees}° complete in Kali ${par.value.kaliYearsElapsed} (${par.era.ad} CE)`,
      instant: "the start of the year after 4536 elapsed, by the text's year [reading]; 'pūrṇāḥ' may make 15° a lower bound", quote: par.quote[1].sa },
  ];
  const at = (p, a, t) => SK.model({ 'ayanamsha.phase': p, 'ayanamsha.amplitude': a }, { epoch: EPOCH }).ayanamsha(t);
  const resid = (p, a) => records.map((r) => (at(p, a, r.kaliDay) - r.deg) * 60);
  const ss = (p, a) => resid(p, a).reduce((x, y) => x + y * y, 0);
  // least squares on the two parameters: a coarse grid, then three refinements (deterministic; the model is piecewise linear in both)
  let best = { p: 0, a: 0, ss: ss(0, 0) };
  for (let p = -6; p <= 6.0001; p += 0.05) for (let a = -3; a <= 4.0001; a += 0.02) { const v = ss(p, a); if (v < best.ss) best = { p, a, ss: v }; }
  for (const step of [0.005, 0.0005, 0.00005]) {
    let b = best;
    for (let p = best.p - 12 * step; p <= best.p + 12 * step + 1e-12; p += step) for (let a = best.a - 12 * step; a <= best.a + 12 * step + 1e-12; a += step) { const v = ss(p, a); if (v < b.ss) b = { p, a, ss: v }; }
    best = b;
  }
  const phaseDeg = r4(best.p), amplitudeDeg = r4(best.a), residuals = resid(phaseDeg, amplitudeDeg).map(r1);
  const bisect = (f, lo, hi) => { for (let i = 0; i < 60; i++) { const mid = (lo + hi) / 2; if (f(mid) < 0) lo = mid; else hi = mid; } return (lo + hi) / 2; };
  const tPar = records[2].kaliDay, phaseOnly = r4(bisect((p) => at(p, 0, tPar) - par.value.ayanamshaDegrees, -45, 45)), ampOnly = r4(bisect((a) => at(0, a, tPar) - par.value.ayanamshaDegrees, -20, 20));
  const textRate = 600 * 360 / 4320000 * 0.3 * 3600;                           // 54″ a year [theorem]
  return {
    records: records.map((r, i) => ({ ...r, textDeg: r4(at(0, 0, r.kaliDay)), textResidualArcmin: r1((at(0, 0, r.kaliDay) - r.deg) * 60), modelDeg: r4(at(phaseDeg, amplitudeDeg, r.kaliDay)), residualArcmin: residuals[i] })),
    phaseDeg, amplitudeDeg, amplitudeTotalDeg: r4(27 + amplitudeDeg), rateArcsecPerYear: r2(textRate * (27 + amplitudeDeg) / 27),
    unit: "phaseDeg in degrees of the libration angle (SS 3.9: 600 turns a yuga, so one turn is 7,200 years and one degree is 20 years); amplitudeDeg added to the text's 27°; applied as sphuta.js ayanamshaSS(spandas, phaseDeg, amplitudeDeg)",
    method: 'least squares of the three records on the two parameters (a grid of 0.05° × 0.02° refined three times to 0.00005°), the residuals in arcminutes',
    reading: "three determinations fix both parameters: Āryabhaṭa's zero in Kali 3600 stands (the phase stays at zero) and the libration's greatest value grows, so its rate grows with it; a single record could not tell the two apart [theorem], and the phase reading alone would break Āryabhaṭa's zero by about an hour of arc",
    alternatives: {
      phaseOnly: { phaseDeg: phaseOnly, residualsArcmin: resid(phaseOnly, 0).map(r1), note: "Parameśvara's record as a phase alone (the default of the morning of 2026-10-09): breaks Āryabhaṭa's zero" },
      amplitudeOnly: { amplitudeDeg: ampOnly, residualsArcmin: resid(0, ampOnly).map(r1), note: "Parameśvara's record as an amplitude alone: within a minute of the joint fit" },
    },
    statedRate: { record: nil.id, rateArcminPerYear: nil.value.rateArcminPerYear, rate: nil.value.rate, fittedArcminPerYear: r4(textRate * (27 + amplitudeDeg) / 27 / 60),
      note: "Nīlakaṇṭha's rule 'the years less a tenth, as minutes' (0.9′ a year) is the text's 54″; his own figure against Āryabhaṭa's zero implies the fitted rate [theorem]" },
    notFitted: 'not part of the eclipse fit: the eclipses see the elongation and the argument of latitude, both sidereal, never the ayanāṃśa',
    tag: '[paramparā]',
  };
}
/** The whole generated record: corpus/parampara/samskara.json. */
function result() {
  const fits = SENSITIVITY.map((m) => fit(m)), main = fits[0], loo = leaveOneOut(MAN, main), ay = ayanamshaDetermination();
  const mo = main.params['moon.epoch'], no = main.params['node.epoch'];
  const caption = `The text's own model, with the Moon's and the node's mean places moved by ${mo.delta} ± ${mo.sigma}′ and ${no.delta} ± ${no.sigma}′ ` +
    `at Kali day ${EPOCH} (${julianOf(EPOCH)} Julian) and carried at the text's own rates; fitted by this engine to Parameśvara's recorded eclipses ` +
    `(Siddhāntadīpikā vv.69-85, quoted in the Jyotirmīmāṃsā pp.33-34), a man's height taken as ${MAN} of his own padas [unverified], the Sun held. ` +
    `Held out one eclipse at a time, the mean error of the timed contacts goes from ${loo.meanTextGhati} to ${loo.meanCorrectedGhati} ghaṭikā. ` +
    `The ayanāṃśa is the text's libration fitted to the paramparā's three determinations (Āryabhaṭa's zero in Kali 3600, Nīlakaṇṭha's 14°26′, Parameśvara's 15°): ` +
    `phase ${ay.phaseDeg}°, greatest value ${ay.amplitudeTotalDeg}° (the text's 27°), ${ay.rateArcsecPerYear}″ a year; residuals ${ay.records.map((r) => `${r.who} ${r.residualArcmin}′`).join(', ')}. ` +
    'Only the Moon, the node and the ayanāṃśa are moved; every other number is the text\'s. The default of the text tier; the plain Sūrya-Siddhānta is one labelled choice away.';
  const improved = loo.meanCorrectedGhati < loo.meanTextGhati;
  return {
    format: 'parampara-samskara/1',
    generatedBy: 'node scripts/parampara-samskara.cjs --write (a rerun must reproduce this file byte for byte: parampara.test.js)',
    tag: main.tag, inputs: inputDigests(),
    epochKali: EPOCH, julian: julianOf(EPOCH), vara: K.varaOfKaliDay(EPOCH).name,
    site: { registry: 'sites.ashvatthagrama', palabha: SITE_IN.palabha, deshantaraVinadi: VILLAGE.deshantara.vinadi, deshantaraDegrees: SITE_IN.deshantara },
    params: PARAMS, held: { 'sun.epoch': 'shadows fix it; six contacts cannot separate a common shift of Sun, Moon and node', rates: 'one epoch: no rate is identifiable', 'moonApogee.epoch': 'unseen by these records' },
    fits, leaveOneOut: loo, ayanamsha: ay,
    offered: { label: LABEL, labelSa: LABEL_SA, caption, corrects: ['moon', 'node', 'ayanamsha'], offered: improved, default: improved,
      rule: "owner, 2026-10-08 (decision a): Parameśvara's saṃskāra is the primary default of the text tier; the plain Sūrya-Siddhānta is the " +
        "secondary labelled choice, exactly the text; the saṃskāra corrects only the Moon, the node and the ayanāṃśa (owner, 2026-10-09: " +
        "apply what the paramparā recorded where it applies, and adopt every improvement the records support). It is the default only while its " +
        'leave-one-out test improves on the plain text (offered and default are both that test).',
      choices: [
        { id: 'ss+parameshvara', label: LABEL, labelSa: LABEL_SA, default: improved },
        { id: 'ss', label: PLAIN_LABEL, labelSa: PLAIN_LABEL_SA, default: !improved, what: 'the text exactly as it stands' },
      ] },
  };
}
const resultText = (r = result()) => JSON.stringify(r, null, 1) + '\n';

// ── registry digests and the e-text lines ─────────────────────────────────────────────────────────────
function recordDigest(rec) { const x = { ...rec }; delete x.sha256; return V.sha256(V.canonical(x)); }
function stamp() {
  const text = fs.readFileSync(FILES.registry, 'utf8'), reg = JSON.parse(text), digests = reg.records.map(recordDigest);
  let i = 0;
  const out = text.replace(/"sha256": "(?:[0-9a-f]{64})?"/g, () => `"sha256": "${digests[i++]}"`);
  if (i !== digests.length) throw new RangeError(`stamp: ${i} sha256 fields for ${digests.length} records`);
  fs.writeFileSync(FILES.registry, out);
  return digests.length;
}
/** Every e-text line the registry, the time-unit registry and the graha layer cite — each object with a 'from' of the form
 *  etext:<file>:<line>, with its 'sa' when it quotes one: { 'etext:<file>': { 'line': Set of quoted strings } }. */
function etextQuotes() {
  const want = {};
  const add = (from, sa) => {
    const m = /^(etext:[^:]+):(\d+)$/.exec(from || '');
    if (!m) return;
    ((want[m[1]] ||= {})[m[2]] ||= new Set()).add(typeof sa === 'string' ? sa : '');
  };
  const walk = (o) => {
    if (Array.isArray(o)) { o.forEach(walk); return; }
    if (!o || typeof o !== 'object') return;
    if (typeof o.from === 'string') add(o.from, o.sa);
    for (const [k, v] of Object.entries(o)) if (k !== 'from') walk(v);
  };
  walk(REG);
  for (const f of [FILES.timeUnits, FILES.graha]) if (fs.existsSync(f)) walk(readJSON(f));
  return want;
}
const MAX_LINE = 300;   // a longer line (prose) is kept only as the quoted excerpts, with the whole line's digest
/** Whole lines are copied only from the old public-domain editions (registry sources whose licence says so); from the
 *  1977 Jyotirmīmāṃsā, whose apparatus is the editor's, only the quoted Sanskrit is kept, with the line's length and digest. */
function wholeLinesAllowed(id) {
  const src = Object.values(REG.sources).find((s) => s.file === id);
  return !!(src && /^an old public-domain edition/.test(src.licence || ''));
}
function etextLines(dir) {
  const files = {};
  for (const [id, lines] of Object.entries(etextQuotes()).sort()) {
    const rel = id.slice('etext:'.length), text = fs.readFileSync(path.join(dir, rel), 'utf8'), all = text.split('\n');
    const whole = wholeLinesAllowed(id), entry = { sha256: V.sha256(text), copy: whole ? 'whole lines up to ' + MAX_LINE + ' characters' : 'the quoted excerpts only', lines: {} };
    for (const n of Object.keys(lines).map(Number).sort((a, b) => a - b)) {
      const line = all[n - 1];
      if (line === undefined) throw new RangeError(`${id}:${n} does not exist`);
      const qs = [...lines[String(n)]].filter(Boolean);
      for (const q of qs) if (!line.normalize('NFC').includes(q.normalize('NFC'))) throw new RangeError(`${id}:${n} does not contain the quote: ${q}`);
      entry.lines[n] = whole && line.length <= MAX_LINE ? { text: line, sha256: V.sha256(line) } : { excerpts: qs.sort(), length: line.length, sha256: V.sha256(line) };
    }
    files[id] = entry;
  }
  return { format: 'parampara-etext-lines/1',
    what: 'Only what the registries quote from the e-texts, copied as data (the e-texts themselves are not redistributed). From the ' +
      'old public-domain editions (Trivandrum 1916, 1931) a quoted line of up to ' + MAX_LINE + ' characters is kept whole; a longer line, ' +
      'and every line of the 1977 Jyotirmīmāṃsā (whose apparatus is the editor\'s), is kept as the quoted excerpts only, with the whole ' +
      'line\'s length and SHA-256. Each file carries the SHA-256 of the whole e-text it was read from.',
    files };
}

/** Node convenience: parampara.js loaded with every corpus file. */
function loadParampara() {
  const P = require(path.join(ROOT, 'parampara.js'));
  return P.load({ registry: REG, readings: R, eclipses: readJSON(FILES.eclipses), samskara: readJSON(FILES.samskara), timeUnits: readJSON(FILES.timeUnits),
    graha: readJSON(FILES.graha), etextLines: readJSON(FILES.etextLines) });
}

if (require.main === module) {
  const arg = process.argv.slice(2), dirAfter = (flag) => { const i = arg.indexOf(flag); return i >= 0 ? arg[i + 1] : null; };
  if (arg.includes('--stamp')) { console.log(`stamped ${stamp()} records`); process.exit(0); }
  if (arg.includes('--etext-lines')) { fs.writeFileSync(FILES.etextLines, JSON.stringify(etextLines(dirAfter('--etext-lines')), null, 1) + '\n'); console.log(`wrote ${path.relative(ROOT, FILES.etextLines)}`); process.exit(0); }
  if (arg.includes('--verify-etext')) {
    const now = JSON.stringify(etextLines(dirAfter('--verify-etext'))), stored = JSON.stringify(readJSON(FILES.etextLines));
    console.log(now === stored ? 'etext-lines.json matches the e-texts' : 'etext-lines.json does NOT match the e-texts'); process.exit(now === stored ? 0 : 1);
  }
  if (arg.includes('--write') || arg.includes('--check')) {
    const text = resultText();
    if (arg.includes('--write')) { fs.writeFileSync(FILES.samskara, text); console.log(`wrote ${path.relative(ROOT, FILES.samskara)}`); process.exit(0); }
    const same = fs.existsSync(FILES.samskara) && fs.readFileSync(FILES.samskara, 'utf8') === text;
    console.log(same ? 'samskara.json is current' : 'samskara.json is STALE: run --write'); process.exit(same ? 0 : 1);
  }
  const res = { tag: "[paramparā]: the ancestors' readings (Jyotirmīmāṃsā), through the registry; a paramparā fit at Kali " + EPOCH + ' (' + julianOf(EPOCH) + " Julian), not pooled with the owner's ledger",
    site, residuals: residualTable(), fits: SENSITIVITY.map((m) => fit(m)) };
  if (arg.includes('--json')) { console.log(JSON.stringify(res, null, 2)); process.exit(0); }
  console.log(res.tag);
  console.log('\nThe text against each timed reading (text − record, ghaṭikā; negative = the text early):');
  for (const r of res.residuals) console.log(`  ${r.id.padEnd(9)} ${r.contact.padEnd(8)} ${r.reading.padEnd(18)} ${r.residualGhati === null ? 'the text gives no such contact' : String(r.residualGhati).padStart(6)}${r.ifAfternoonGhati !== undefined ? `   (if afternoon: ${r.ifAfternoonGhati})` : ''}`);
  for (const f of res.fits) {
    console.log(`\nman = ${f.man_padas} padas: ${f.observations} records, ${f.rows} rows; ${f.tag}; χ²/dof ${f.chi2PerDof}; inequalities violated ${f.inequalitiesViolated.before} → ${f.inequalitiesViolated.after}`);
    for (const [n, p] of Object.entries(f.params)) console.log(`  ${n.padEnd(14)} ${p.status.padEnd(7)} ${p.delta} ± ${p.sigma ?? '—'} ${p.unit}`);
    if (f.frozen.length) console.log('  frozen: ' + f.frozen.map((z) => `${z.param} (${z.reason})`).join('; '));
    if (f.rejected.length) console.log('  set aside: ' + f.rejected.map((z) => `${z.id} (${z.normalized}σ)`).join(', '));
    if (f.textNone.length) console.log('  not rows: ' + f.textNone.map((z) => `${z.id} ${z.contact} (${z.why})`).join('; '));
  }
}
module.exports = { observations, fit, leaveOneOut, residualTable, registryRows, result, resultText, ayanamshaDetermination, inputDigests, recordDigest, stamp, etextQuotes, etextLines, loadParampara,
  site, EPOCH, MAN, LABEL, LABEL_SA, PLAIN_LABEL, PLAIN_LABEL_SA, FILES };
