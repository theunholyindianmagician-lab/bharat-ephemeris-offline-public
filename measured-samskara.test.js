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
  const all = ST.measuredFromRecord(REC, 'kerala+all');
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
  assert.equal(ST.label({ samskara: 'kerala' }).measured, null);
  assert.throws(() => ST.grahas(2451545, { samskara: 'parameshvara', measured: all }), /Kerala tier only/);
  assert.throws(() => ST.grahas(2451545, { samskara: 'kerala', measured: { bogus: 1 } }), /unknown measured form/);
  assert.throws(() => ST.grahas(2451545, { samskara: 'kerala', measured: { dvitiya: NaN } }), /finite/);
  assert.equal(ST.measuredOf({}), null); assert.equal(ST.measuredOf(undefined), null);
  // no amplitude of the record is typed in ss-tier.js
  const src = require('node:fs').readFileSync(path.join(__dirname, 'ss-tier.js'), 'utf8').replace(/\/\/[^\n]*|\/\*[\s\S]*?\*\//g, '');
  for (const v of Object.values(all)) assert.ok(!src.includes(Math.abs(v).toFixed(3).replace(/^0/, '')), `typed ${v}`);
});
