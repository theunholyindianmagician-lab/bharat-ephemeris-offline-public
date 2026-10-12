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
    const plain = ST.grahas(jd, { samskara: 'kerala' }), k = A.measuredPlaces(jd, {});
    assert.ok(d(plain.surya, k.sid.sun) < 1e-6 && d(plain.candra, k.sid.moon) < 1e-6, `plain at ${jd}`);
    assert.ok(d(p.candra, plain.candra) > 0.001 || d(p.surya, plain.surya) > 0.001);                            // the forms do move the places
  }
  const L = ST.label({ samskara: 'kerala', measured: all }); assert.match(L.label, /measured forms/); assert.equal(L.id, 'kerala'); assert.deepEqual(L.measured, all);
  for (const g of ['mangala', 'budha', 'guru', 'shukra', 'shani']) assert.ok(Math.abs(((ST.grahas(2451545, { samskara: 'kerala', measured: all })[g] - ST.grahas(2451545, { samskara: 'kerala' })[g] + 540) % 360) - 180) > 0.01, `${g} moves`);
  assert.equal(ST.label({ samskara: 'kerala' }).measured, null);
  assert.throws(() => ST.grahas(2451545, { samskara: 'parameshvara', measured: all }), /Kerala tier only/);
  assert.throws(() => ST.grahas(2451545, { samskara: 'kerala', measured: { bogus: 1 } }), /unknown measured form/);
  assert.throws(() => ST.grahas(2451545, { samskara: 'kerala', measured: { dvitiya: NaN } }), /finite/);
  assert.equal(ST.measuredOf({}), null); assert.equal(ST.measuredOf(undefined), null);
  // no amplitude of the record is typed in ss-tier.js
  const src = require('node:fs').readFileSync(path.join(__dirname, 'ss-tier.js'), 'utf8').replace(/\/\/[^\n]*|\/\*[\s\S]*?\*\//g, '');
  const nums = []; (function walk(o) { for (const v of Object.values(o)) typeof v === 'number' ? nums.push(v) : walk(v); })(all);
  for (const v of nums) assert.ok(!src.includes(Math.abs(v).toFixed(3).replace(/^0/, '')), `typed ${v}`);
});

test('the planets\' bīja on the means (the paramparā\'s form through the text\'s four steps): the tier reproduces the measurement script\'s formula to 1e-6°, Venus and Jupiter gain more than tenfold, the plain tier is untouched', () => {
  const A = require('./scripts/parampara-apply.cjs'), G = require('./ss-graha.js');
  const all = ST.measuredFromRecord(REC, 'kerala+all'); assert.ok(all.planets && Object.keys(all.planets).length === 5);
  for (const g of Object.keys(all.planets)) for (const k of ['mandaScale', 'sighraScale', 'manda2']) assert.equal(typeof all.planets[g][k], 'number');
  const EN = { mangala: 'mars', budha: 'mercury', guru: 'jupiter', shukra: 'venus', shani: 'saturn' }, d = (a, b) => Math.abs(((a - b + 540) % 360) - 180);
  for (const jd of [2451545.0, 2461041.5, 2415020.5, 2470000.25]) {
    const t = jd - 588465.5 + 75.7885 / 360, T = (jd - 2451545) / 36525, g = ST.grahas(jd, { samskara: 'kerala', measured: all }), plain = ST.grahas(jd, { samskara: 'kerala' });
    for (const [key, en] of Object.entries(EN)) { const b = all.planets[key], p = [b.mean.epochDeg, b.mean.ratePerCentury, b.sighrocca.epochDeg, b.sighrocca.ratePerCentury, b.mandocca.epochDeg, b.mandocca.ratePerCentury];
      const sixOnly = { ...all.planets[key], mandaScale: 0, sighraScale: 0, manda2: 0 };
      assert.ok(d(ST.planetWithBija(en, G.meanPlaces(t)[en], sixOnly, jd).longitude, A.planetOnShiftedMeans(en, t, T, p)) < 1e-6, `${key} at ${jd}: the six-parameter bīja is the script's formula`);
      assert.ok(d(g[key], ST.planetWithBija(en, G.meanPlaces(t)[en], all.planets[key], jd).longitude) < 1e-9, `${key} through grahas`);
      assert.ok(d(ST.planetWithBija(en, G.meanPlaces(t)[en], { mean: {}, sighrocca: {}, mandocca: {} }, jd).longitude, G.truePlaces(t)[en].longitude) < 1e-9, `${key}: a zero bīja is the text`);
      assert.ok(d(plain[key], G.truePlaces(t)[en].longitude) < 1e-9); }
  }
  const b = REC.measured.planets.bodies; assert.ok(b.shukra.after.rms * 30 < b.shukra.before.rms && b.guru.after.rms * 40 < b.guru.before.rms && b.shani.after.rms * 40 < b.shani.before.rms, 'Venus, Jupiter, Saturn within 11′'); assert.ok(b.budha.after.rms < b.budha.before.rms && b.mangala.after.rms * 3 < b.mangala.before.rms);
  for (const g of Object.keys(b)) assert.ok(b[g].after.rms <= b[g].afterScales.rms + 1e-9 && b[g].afterScales.rms <= b[g].afterBija.rms + 1e-9 && b[g].afterBija.rms <= b[g].afterMeansOnly.rms + 1e-9, `${g}: each stage keeps the gain`);
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
  assert.throws(() => ST.grahas(2451545, { samskara: 'kerala', measured: { sunMean: { epochDeg: 'x' } } }), /finite/);
  assert.throws(() => ST.grahas(2451545, { samskara: 'kerala', measured: { node: 3 } }), /epochDeg, ratePerCentury/);
});
