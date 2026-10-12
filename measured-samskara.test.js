/* measured-samskara.test.js — the measured forms of the sibling Kerala-corrections file on the Kerala tier: the record's
 * amplitudes are physical (they agree with the known values the forms describe), the wiring reproduces the measurement
 * script's candidate exactly, and nothing is typed. */
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const ST = require('./ss-tier.js');
const REC = require('./corpus/research/parampara-apply.json');

test('the record: five candidates fitted on 1900-2100 with provenance per form; the amplitudes agree with the values the forms are known to have (the measurement is physical, not a tuning)', () => {
  const m = REC.measured; assert.ok(m && m.terms && m.candidates); assert.match(m.fittedOn, /1900-2100/);
  for (const k of ['dvitiya', 'variation', 'annual', 'moonManda', 'sunManda']) { assert.ok(m.terms[k].form); assert.ok(m.terms[k].provenance.length > 30); }
  assert.match(m.terms.dvitiya.provenance, /Munjāla/); assert.match(m.terms.variation.provenance, /no Indian source/); assert.match(m.terms.annual.provenance, /no Indian source/);
  const all = ST.measuredFromRecord(REC, 'kerala+all'); assert.ok(all.planets, 'kerala+all carries the planets\' bīja');
  assert.ok(Math.abs(Math.abs(all.dvitiya) - 1.274) < 0.05, `evection ${all.dvitiya}`);                 // the modern evection amplitude 1.274°
  assert.ok(Math.abs(all.variation - 0.658) < 0.03, `variation ${all.variation}`);                    // 0.658°
  assert.ok(Math.abs(all.annual - 0.186) < 0.02, `annual ${all.annual}`);                             // 0.186°
  assert.ok(all.moonManda > 0.18 && all.moonManda < 0.30, `Moon epicycle scale ${all.moonManda}`);   // the text's 32° against the sky's 6.29° greatest equation
  assert.ok(all.sunManda < -0.08 && all.sunManda > -0.18, `Sun epicycle scale ${all.sunManda}`);     // the text's 14° against the sky's 1.915°
  const one = ST.measuredFromRecord(REC, 'kerala+dvitiya'); assert.deepEqual(Object.keys(one), ['dvitiya']); assert.ok(Math.abs(one.dvitiya - all.dvitiya) < 0.002);
  assert.throws(() => ST.measuredFromRecord(REC, 'nope'), /no candidate/);
});

test('the wiring: the Kerala tier with the measured forms reproduces the measurement script\'s candidate to the micro-arcsecond, and the plain tiers are untouched', () => {
  const A = require('./scripts/parampara-apply.cjs');
  const all = ST.measuredFromRecord(REC, 'kerala+all');
  const d = (a, b) => Math.abs(((a - b + 540) % 360) - 180);
  for (const jd of [2451545.0, 2461041.5, 2415020.5, 2470000.25]) {
    const c = A.measuredPlaces(jd, all), p = ST.grahas(jd, { samskara: 'kerala', measured: all });          // the script's formula with the record's amplitudes, no refit
    assert.ok(d(p.surya, c.sid.sun) < 1e-6, `Sun at ${jd}: ${p.surya} vs ${c.sid.sun}`); assert.ok(d(p.candra, c.sid.moon) < 1e-6, `Moon at ${jd}: ${p.candra} vs ${c.sid.moon}`);
    const plain = ST.grahas(jd, { samskara: 'kerala', measured: false }), k = A.measuredPlaces(jd, {});
    assert.ok(d(plain.surya, k.sid.sun) < 1e-6 && d(plain.candra, k.sid.moon) < 1e-6, `plain at ${jd}`);
    assert.ok(d(p.candra, plain.candra) > 0.001 || d(p.surya, plain.surya) > 0.001);                            // the forms do move the places
  }
  const L = ST.label({ samskara: 'kerala', measured: all }); assert.match(L.label, /measured forms/); assert.equal(L.id, 'kerala'); assert.deepEqual(L.measured, all);
  for (const g of ['mangala', 'budha', 'guru', 'shukra', 'shani']) assert.ok(Math.abs(((ST.grahas(2451545, { samskara: 'kerala', measured: all })[g] - ST.grahas(2451545, { samskara: 'kerala', measured: false })[g] + 540) % 360) - 180) > 0.01, `${g} moves`);
  assert.equal(ST.label({ samskara: 'kerala', measured: false }).measured, null); assert.ok(ST.label({ samskara: 'kerala' }).measuredDefault && /joint measurement/.test(ST.label({ samskara: 'kerala' }).label), 'the default is the joint candidate');
  assert.throws(() => ST.grahas(2451545, { samskara: 'parameshvara', measured: all }), /Kerala tier only/);
  assert.throws(() => ST.grahas(2451545, { samskara: 'kerala', measured: { bogus: 1 } }), /unknown measured form/);
  assert.throws(() => ST.grahas(2451545, { samskara: 'kerala', measured: { dvitiya: NaN } }), /finite/);
  assert.equal(ST.measuredOf({}), null); assert.equal(ST.measuredOf(undefined), null);
  // no amplitude of the record is typed in ss-tier.js
  const src = require('node:fs').readFileSync(path.join(__dirname, 'ss-tier.js'), 'utf8').replace(/\/\/[^\n]*|\/\*[\s\S]*?\*\//g, '');
  const nums = []; (function walk(o) { for (const v of Object.values(o)) { if (typeof v === 'number') nums.push(v); else if (v && typeof v === 'object') walk(v); } })(all);
  for (const v of nums) assert.ok(!src.includes(Math.abs(v).toFixed(3).replace(/^0/, '')), `typed ${v}`);
});

test('the planets\' bīja on the means (the paramparā\'s form through the text\'s four steps): the tier reproduces the measurement script\'s formula to 1e-6°, Venus and Jupiter gain more than tenfold, the plain tier is untouched', () => {
  const A = require('./scripts/parampara-apply.cjs'), G = require('./ss-graha.js');
  const all = ST.measuredFromRecord(REC, 'kerala+all'); assert.ok(all.planets && Object.keys(all.planets).length === 5);
  for (const g of Object.keys(all.planets)) for (const k of ['mandaScale', 'sighraScale', 'manda2']) assert.equal(typeof all.planets[g][k], 'number');
  const EN = { mangala: 'mars', budha: 'mercury', guru: 'jupiter', shukra: 'venus', shani: 'saturn' }, d = (a, b) => Math.abs(((a - b + 540) % 360) - 180);
  for (const jd of [2451545.0, 2461041.5, 2415020.5, 2470000.25]) {
    const t = jd - 588465.5 + 75.7885 / 360, T = (jd - 2451545) / 36525, g = ST.grahas(jd, { samskara: 'kerala', measured: all }), plain = ST.grahas(jd, { samskara: 'kerala', measured: false });
    for (const [key, en] of Object.entries(EN)) { const b = all.planets[key], p = [b.mean.epochDeg, b.mean.ratePerCentury, b.sighrocca.epochDeg, b.sighrocca.ratePerCentury, b.mandocca.epochDeg, b.mandocca.ratePerCentury];
      const sixOnly = { ...all.planets[key], form: 'text', mandaScale: 0, sighraScale: 0, manda2: 0, radialOwn: 0, radialSun: 0 };
      assert.ok(d(ST.planetWithBija(en, G.meanPlaces(t)[en], sixOnly, jd).longitude, A.planetOnShiftedMeans(en, t, T, p)) < 1e-6, `${key} at ${jd}: the six-parameter bīja is the script's formula`);
      const sunG = { lambda: g.surya, anomaly: g.mean.surya - g.mean.suryaApogee };
      assert.ok(d(g[key], ST.planetWithBija(en, G.meanPlaces(t)[en], all.planets[key], jd, sunG).longitude) < 1e-9, `${key} through grahas`);
      assert.ok(d(ST.planetWithBija(en, G.meanPlaces(t)[en], { mean: {}, sighrocca: {}, mandocca: {} }, jd).longitude, G.truePlaces(t)[en].longitude) < 1e-9, `${key}: a zero bīja is the text`);
      assert.ok(d(plain[key], G.truePlaces(t)[en].longitude) < 1e-9); }
  }
  const b = REC.measured.planets.bodies; assert.ok(b.shukra.after.rms * 30 < b.shukra.before.rms && b.guru.after.rms * 40 < b.guru.before.rms && b.shani.after.rms * 40 < b.shani.before.rms, 'Venus, Jupiter, Saturn within 11′'); assert.ok(b.budha.after.rms < b.budha.before.rms && b.mangala.after.rms * 3 < b.mangala.before.rms);
  for (const g of Object.keys(b)) assert.ok(b[g].after.rms <= Math.min(b[g].afterText.rms, b[g].afterNilakantha.rms) + 1e-9 && b[g].afterText.rms <= b[g].afterScales.rms + 1e-9 && b[g].afterScales.rms <= b[g].afterBija.rms + 1e-9 && b[g].afterBija.rms <= b[g].afterMeansOnly.rms + 1e-9, `${g}: each stage keeps the gain`);
  assert.ok(b.budha.after.rms < 8 && b.mangala.after.rms < 12 && b.shukra.after.rms < 8 && b.guru.after.rms < 8 && b.shani.after.rms < 8, 'every star-planet within 12′ rms over 1900-2100: ' + Object.entries(b).map(([k, v]) => `${k} ${v.after.rms.toFixed(1)}`).join(', '));
  assert.throws(() => ST.grahas(2451545, { samskara: 'kerala', measured: { planets: { pluto: {} } } }), /unknown graha/);
  assert.throws(() => ST.grahas(2451545, { samskara: 'kerala', measured: { planets: { guru: { mean: { epochDeg: NaN } } } } }), /finite/);
});

test('the joint candidate (kerala+all+bija): the record\'s scores are what the tier itself gives on the same samples; the amplitudes are the sky\'s own series term by term; the bīja are small', () => {
  const c = REC.measured.candidates['kerala+all+bija']; assert.ok(c && c.bija && c.planets === true);
  const m = ST.measuredFromRecord(REC, 'kerala+all+bija'); assert.ok(m.planets && m.sunMean && m.moonApogee && m.node);
  const a = c.moonFit.amplitudes;
  assert.ok(Math.abs(Math.abs(a.dvitiya) - 1.274) < 0.01 && Math.abs(a.variation - 0.658) < 0.01 && Math.abs(a.annual - 0.186) < 0.01, 'evection, variation, annual');
  assert.ok(Math.abs(a.moonManda2 - 0.2136) < 0.01, `second harmonic ${a.moonManda2} (the sky: 0.2136°)`); assert.ok(Math.abs(a.reduction + 0.1143) < 0.01, `reduction ${a.reduction} (the sky: −0.1143°)`);
  for (const k of ['sunMean', 'moonMean', 'node']) assert.ok(Math.abs(c.bija[k].epochDeg) < 0.5 && Math.abs(c.bija[k].ratePerCentury) < 0.5, `${k} bīja small`);
  assert.ok(c.score.after.sun.rms < 1.2 && c.score.after.moon.rms < 6 && c.score.after.rahu.rms < 0.5, JSON.stringify(c.score.after));
  // the tier reproduces the record's scores on the record's own grid (the measurement is of the tier, not of a copy)
  const M = require('./math-core.js'), KER = ST.correction('kerala'), tOf = (jd) => jd - 588465.5 + 75.7885 / 360, wrap = (x) => ((x + 540) % 360) - 180;
  const r = { sun: [], moon: [], rahu: [] };
  for (let i = 0; i < 753; i++) { const jd = 2415020.5 + i * 97, rows = M.tierGrahaRows(jd, 'drik'), ayD = M.tierAyanamsha(jd, 'drik').deg, g = ST.grahas(jd, { samskara: 'kerala', measured: m }), ayK = KER.ayanamshaAt(tOf(jd));
    for (const [k, key] of [['sun', 'surya'], ['moon', 'candra'], ['rahu', 'rahu']]) r[k].push(wrap(g[key] + ayK - rows.find((x) => x.key === key).longitude - ayD)); }
  for (const k of ['sun', 'moon', 'rahu']) { const rms = Math.sqrt(r[k].reduce((x, y) => x + y * y, 0) / r[k].length) * 60; assert.ok(Math.abs(rms - c.score.after[k].rms) < 0.02, `${k}: tier ${rms} vs record ${c.score.after[k].rms}`); }
  // the plain candidate is untouched by the new keys
  const plain = ST.measuredFromRecord(REC, 'kerala+all'); assert.equal(plain.moonManda2, undefined); assert.equal(plain.sunMean, undefined);
  // the default tier IS the joint candidate; measured:false is the bare paramparā; the eclipse model runs on the measured places
  const g0 = ST.grahas(2461041.5, { samskara: 'kerala' }), g1 = ST.grahas(2461041.5, { samskara: 'kerala', measured: m }), g2 = ST.grahas(2461041.5, { samskara: 'kerala', measured: false });
  for (const k of ['surya', 'candra', 'rahu', 'budha', 'shani']) { assert.equal(g0[k], g1[k], `${k}: the default is the joint candidate`); assert.notEqual(g0[k], g2[k], `${k}: measured:false is the plain tier`); }
  const model = ST.model({ samskara: 'kerala' }), t = 1870000.3, q = ST.places(t, { samskara: 'kerala' }); assert.ok(Math.abs(model.places(t).moon - q.moon) < 1e-12 && Math.abs(model.places(t).sun - q.sun) < 1e-12, 'the eclipse model carries the measured places');
  assert.equal(ST.DEFAULT_CANDIDATE, 'kerala+all+bija'); assert.ok(c.isDefault === true);
  assert.throws(() => ST.grahas(2451545, { samskara: 'kerala', measured: { sunMean: { epochDeg: 'x' } } }), /finite/);
  assert.throws(() => ST.grahas(2451545, { samskara: 'kerala', measured: { node: 3 } }), /epochDeg, ratePerCentury/);
});

test('a bīja is epoch-bound: its rate is held at ±5 Julian centuries from J2000 (continuous), so the 100,000-year calendar never sees a linear extrapolation', () => {
  const G = require('./ss-graha.js'); assert.equal(ST.BIJA_SPAN_CENTURIES, 5);
  const means = G.meanPlaces(1870000).jupiter, bija = { form: 'text', mean: { epochDeg: 0, ratePerCentury: 1 }, sighrocca: { epochDeg: 0, ratePerCentury: 0 }, mandocca: { epochDeg: 0, ratePerCentury: 0 }, mandaScale: 0, sighraScale: 0, manda2: 0, radialOwn: 0, radialSun: 0, series: [0, 0, 0], radial: [0, 0] };
  const at = (T) => ST.planetWithBija('jupiter', means, bija, 2451545 + T * 36525).measuredMeans.mean;
  assert.equal(at(5), at(50)); assert.equal(at(-5), at(-500)); assert.notEqual(at(4), at(5)); assert.ok(Math.abs(((at(5) - at(4) + 540) % 360) - 180 - 1) < 1e-9, 'one degree a century inside the span');
  const d = (a, b) => Math.abs(((a - b + 540) % 360) - 180);
  const far = 2451545 + 400 * 36525, g = ST.grahas(far, { samskara: 'kerala' }), h = ST.grahas(far, { samskara: 'kerala', measured: false });
  for (const k of ['surya', 'candra', 'rahu', 'budha', 'shani']) assert.ok(d(g[k], h[k]) < 30, `${k} at +400 centuries: the measured tier stays within 30° of the bare paramparā (${d(g[k], h[k]).toFixed(2)}°)`);
});

test('the latitudes and the true node: the planets\' latitudes on the heliocentric argument with the node\'s bīja, the Moon\'s latitude with the sky\'s inclination, the true node at the latitude crossings — measured, and the plain tier keeps the text\'s', () => {
  const c = REC.measured.candidates['kerala+all+bija'], b = REC.measured.planets.bodies;
  for (const g of Object.keys(b)) { assert.ok(b[g].latitudeFit.after.rms < b[g].latitudeFit.text.rms / 3, `${g}: latitude ${b[g].latitudeFit.text.rms.toFixed(1)}′ → ${b[g].latitudeFit.after.rms.toFixed(1)}′`); assert.ok(b[g].latitudeFit.after.rms < 10); }
  assert.ok(Math.abs(c.latFit.amplitudes.moonLatScale - (5.145 / 4.5 - 1)) < 0.02, `the Moon's latitude scale ${c.latFit.amplitudes.moonLatScale} (the sky's 5.145° over the text's 4.5°)`);
  assert.ok(c.latFit.after.rms < 1.5 && c.latFit.before.rms > 20, `Moon latitude ${c.latFit.before.rms} → ${c.latFit.after.rms}`);
  assert.ok(c.nodeFit.crossings > 700 && c.nodeFit.after.rms < 20 && c.nodeFit.before.rms > 60, `true node ${c.nodeFit.before.rms} → ${c.nodeFit.after.rms}`);
  assert.ok(Math.abs(c.nodeFit.amplitudes.nodeTrue2SF - 1.62) < 0.1, `the principal term ${c.nodeFit.amplitudes.nodeTrue2SF} (the sky's 1.498° + 0.123° folded)`);
  const jd = 2461041.5, g = ST.grahas(jd, { samskara: 'kerala' }), h = ST.grahas(jd, { samskara: 'kerala', measured: false }), G = require('./ss-graha.js');
  assert.notEqual(g.rahuTrue, g.rahu); assert.equal(h.rahuTrue, h.rahu); assert.equal(h.ketuTrue, h.ketu); assert.ok(Math.abs(((g.ketuTrue - g.rahuTrue + 360) % 360) - 180) < 1e-9, 'Ketu opposite the true Rāhu');
  assert.notEqual(g.latitudeDeg.candra, h.latitudeDeg.candra); assert.ok(Math.abs(h.latitudeDeg.guru * 60 - G.truePlaces(jd - 588465.5 + 75.7885 / 360).jupiter.latitude) < 1e-9, 'the plain tier keeps the text\'s latitude');
  const m = ST.measuredFromRecord(REC, 'kerala+all+bija'); assert.ok(m.moonLatScale !== undefined && m.nodeTrue2SF !== undefined && m.planets.guru.node && typeof m.planets.guru.latScale === 'number');
});

test('the dṛk tier\'s own true node by the crossing method: the latitude is zero at the crossings it finds, the node is the Moon\'s longitude there, it agrees with the Kerala tier\'s measured true node to the record\'s rms, and the API serves all tiers', () => {
  const D = require('./siddhanta-tier.js'), M = require('./math-core.js'), d = (a, b) => Math.abs(((a - b + 540) % 360) - 180);
  const diffs = [];
  for (const jd of [2451545.0, 2461041.5, 2415020.5, 2470000.25, 2440000.5, 2455000.0]) {
    const n = D.trueNode(jd); assert.ok(n && n.crossings.length === 2 && n.crossings[0].jd < jd && n.crossings[1].jd > jd && n.crossings[1].jd - n.crossings[0].jd < 15, `crossings bracket ${jd}`);
    for (const c of n.crossings) { const m = D.sunMoon(c.jd); assert.ok(Math.abs(m.moonLat) < 1e-6, `latitude zero at the crossing (${m.moonLat})`); assert.ok(d(c.node, c.kind === 'ascending' ? m.moonSid : m.moonSid + 180) < 1e-9); }
    assert.ok(n.crossings[0].kind !== n.crossings[1].kind, 'one ascending, one descending'); assert.ok(d(n.descending, n.ascending + 180) < 1e-9);
    const k = M.tierTrueNode(jd, 'kerala'), s = M.tierTrueNode(jd, 'drik'); assert.equal(s.rahu, n.ascending); diffs.push(d(k.rahu, s.rahu) * 60);
    assert.ok(d(k.rahu, k.mean) > 0.01 || jd === 2451545.0, 'the Kerala true node moves off the mean');
  }
  assert.ok(Math.max(...diffs) < 45, `Kerala vs dṛk true node within 45′ at six dates (${diffs.map((x) => x.toFixed(1)).join(', ')})`);
  const t = M.tierTrueNode(2461041.5, 'ss'); assert.equal(t.rahu, t.mean); assert.match(t.method, /mean node/);
  assert.throws(() => M.tierTrueNode(2300000, 'drik'), /served for 1850/, 'outside the span the dṛk true node is refused, as every dṛk call is (DK-1)');
});

test('the registry carries the Tantrasaṅgraha: source TS held privately (the scan is not here), five text records quoting this session\'s transcriptions line for line, the owner-statement retired, stamped', () => {
  const R = require('./corpus/parampara/registry.json'), fs = require('fs');
  assert.ok(R.sources.TS && /PRIVATELY/.test(R.sources.TS.fileKind) && R.sources.TS.file === 'corpus/sources/tantrasangraha-transcriptions.md');
  assert.ok(!R.records.find((r) => r.id === 'NIL-tantrasangraha-planets'), 'the owner-statement is replaced by the text');
  const ts = R.records.filter((r) => r.source === 'TS'); assert.deepEqual(ts.map((r) => r.id), ['TS-1-40-mandocca', 'TS-2-60-four-operations', 'TS-2-68b-74-budha-shukra', 'TS-2-75-76-shukra-visesha', 'TS-YD-1003-vikshepa']);
  const file = fs.readFileSync('corpus/sources/tantrasangraha-transcriptions.md', 'utf8').split('\n');
  for (const r of ts) { assert.match(r.sha256, /^[0-9a-f]{64}$/); assert.ok(r.quote.length >= 1); assert.ok(r.tags.includes('[reading]') && r.tags.includes('[text]'));
    for (const q of r.quote) { const m = /^(.*):(\d+)$/.exec(q.from); assert.equal(m[1], 'corpus/sources/tantrasangraha-transcriptions.md'); assert.equal(file[+m[2] - 1], q.sa, `${r.id}: the quoted line stands at ${q.from}`); } }
  assert.equal(R.records.find((r) => r.id === 'TS-1-40-mandocca').value.mandoccaDegrees.sun, 78, "the Sun's apogee of the Kerala tier is the one Nīlakaṇṭha states");
  assert.ok(!fs.existsSync('editions/tantrasangraha-sarma-1977.pdf') && !fs.existsSync('corpus/sources/tantrasangraha-sarma-1977.pdf'), 'the private scan is not in the repository');
  const PA = require('./parampara.js'); assert.doesNotThrow(() => PA.load({ registry: R, samskara: require('./corpus/parampara/samskara.json') }));
});

test('the generic measured terms: the Moon\'s on [D, g, g′, F] and each planet\'s on the six mean longitudes, kept by the scan, fitted through the tier; the gains are in the record and the tier reproduces them; bad terms are refused', () => {
  const c = REC.measured.candidates['kerala+all+bija'], b = REC.measured.planets.bodies;
  assert.ok(c.moonTermsFit && c.moonTermsFit.terms.length >= 3 && c.moonTermsFit.after.rms < 1.0 && c.moonTermsFit.after.rms < c.moonTermsFit.before.rms, `Moon terms ${c.moonTermsFit.before.rms} → ${c.moonTermsFit.after.rms}`);
  assert.ok(c.score.after.moon.rms < 1.0 && c.score.after.el.rms < 1.2, `Moon ${c.score.after.moon.rms}, elongation ${c.score.after.el.rms}`);
  for (const g of Object.keys(b)) { assert.ok(b[g].termsFit && b[g].after.rms <= b[g].afterNoTerms.rms + 1e-9, `${g}: terms keep the gain`); assert.deepEqual(b[g].termBasis, ['mercury', 'venus', 'sun', 'mars', 'jupiter', 'saturn']); }
  assert.ok(b.budha.after.rms < 3.6 && b.shukra.after.rms < 3 && b.shani.after.rms < 2.5 && b.mangala.after.rms < 5 && b.guru.after.rms < 4, Object.entries(b).map(([k, v]) => `${k} ${v.after.rms.toFixed(2)}`).join(', '));
  const m = ST.measuredFromRecord(REC, 'kerala+all+bija'); assert.ok(m.moonTerms.length === c.moonTermsFit.terms.length && m.planets.shani.terms.length === b.shani.terms.length);
  // the tier reproduces the record's Moon score on the record's grid with the terms
  const M = require('./math-core.js'), KER = ST.correction('kerala'), tOf = (jd) => jd - 588465.5 + 75.7885 / 360, wrap = (x) => ((x + 540) % 360) - 180, r = [];
  for (let i = 0; i < 753; i += 3) { const jd = 2415020.5 + i * 97, rows = M.tierGrahaRows(jd, 'drik'), ayD = M.tierAyanamsha(jd, 'drik').deg, g = ST.grahas(jd, { samskara: 'kerala' }); r.push(wrap(g.candra + KER.ayanamshaAt(tOf(jd)) - rows.find((x) => x.key === 'candra').longitude - ayD)); }
  const rms = Math.sqrt(r.reduce((x, y) => x + y * y, 0) / r.length) * 60; assert.ok(rms < 1.2, `the default tier's Moon on a third of the grid: ${rms.toFixed(2)}′`);
  assert.throws(() => ST.grahas(2451545, { samskara: 'kerala', measured: { moonTerms: [{ k: [1, 0, 0], sin: 1 }] } }), /4 integers/);
  assert.throws(() => ST.grahas(2451545, { samskara: 'kerala', measured: { planets: { guru: { terms: [{ k: [1, 0, 0, 0, 0, 0.5], sin: 1 }] } } } }), /6 integers/);
  assert.throws(() => ST.grahas(2451545, { samskara: 'kerala', measured: { moonTerms: { k: [1, 0, 0, 0] } } }), /array/);
});

test('out of sample (the owner\'s audit point): every measured term was kept only if it also lowered the residual on the holdout grid midway between the fit samples; the holdout rms of every body is within 1.5× its in-sample rms, and the record carries both', () => {
  const c = REC.measured.candidates['kerala+all+bija'], b = REC.measured.planets.bodies;
  assert.ok(c.holdout && c.holdout.after && c.moonTermsFit.holdout, 'holdout scores recorded');
  for (const k of ['sun', 'moon', 'el', 'rahu']) assert.ok(c.holdout.after[k].rms < Math.max(1.5 * c.score.after[k].rms, c.score.after[k].rms + 0.1), `${k}: holdout ${c.holdout.after[k].rms} vs in-sample ${c.score.after[k].rms}`);
  for (const g of Object.keys(b)) { const h = b[g].termsFit.holdout; assert.ok(h.after.rms <= h.before.rms + 1e-9, `${g}: the terms do not worsen the holdout`); assert.ok(h.after.rms < 1.5 * b[g].after.rms + 0.3, `${g}: holdout ${h.after.rms.toFixed(2)} vs in-sample ${b[g].after.rms.toFixed(2)}`); }
  assert.ok(b.shani.termsFit.holdout.after.rms < 3, `Saturn out of sample ${b.shani.termsFit.holdout.after.rms.toFixed(2)}′ (it was 10′ before the holdout rule)`);
  const V = require('./corpus/research/validate-oos.json'); assert.ok(V.tithiEnds.length === 3 && V.tithiEnds.every((t) => t.matched > 350 && t.keralaDefaultMinusDrikMinutes.rms < 3), 'tithi ends by root-finding within 3 min rms in 1880, 2026 and 2120');
  for (const k of ['holdoutInterleaved', 'holdoutBefore', 'holdoutAfter']) { assert.ok(V[k].sun.rms < 1 && V[k].moon.rms < 1.2 && V[k].rahu.rms < 0.5, `${k}`); for (const g of ['mangala', 'budha', 'guru', 'shukra', 'shani']) assert.ok(V[k][g].rms < 12, `${k} ${g} ${V[k][g].rms}`); }
});
