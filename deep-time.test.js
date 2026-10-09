'use strict';
/*
 * deep-time.test.js — the text tiers over ±50,000 years: the 100,000-year calendar's invariants on a deterministic sample of
 * its years, run with the generator's own code (scripts/calendar-100k.cjs: buildYear, checkYear — the same
 * SSAhargana.yearOfKali a page's year panel uses), the pañcāṅga of each sampled year's first day, and the time door's round
 * trips there. When a tier's manifest exists, each sampled year line must hash to the value the full run recorded, which
 * ties this test to that run.
 * Tiers (owner decision 2026-10-08): both text tiers are sampled — 'ss+parameshvara', the default (the Sūrya-Siddhānta with
 * Parameśvara's saṃskāra: the paramparā record's mean-place shifts of the Moon and the node, read through parampara.js;
 * corpus/calendar/manifest-100k-ss-parameshvara.json), and 'ss', the plain text (corpus/calendar/manifest-100k.json).
 * 'Modern Bhāratīya (dṛk)' is not generated: it refuses outside 1850-2150.
 * Referees: the text's own integers and identities (SS 1.37-1.39, 1.55, 14.10), calendar arithmetic, and, between the two
 * tiers, the record's Moon shift; no modern ephemeris.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
const C = require('./scripts/calendar-100k.cjs');
const A = require('./ss-ahargana.js');
const P = require('./panchanga.js');
const K = require('./kala-dvara.js');
const SST = require('./ss-tier.js');
const UJJAYINI = { latitude: 23.1765, deshantara: 0 };
const TIERS = ['ss+parameshvara', 'ss'];

const built = new Map();
const year = (k, tier) => { const key = `${tier}|${k}`; if (!built.has(key)) built.set(key, C.buildYear(k, tier)); return built.get(key); };

test('the tiers are named: "ss+parameshvara" is the default ("ss-parameshvara", "ss parameshvara" accepted), "ss" the plain text ("classical" accepted); others are refused with the reason', () => {
  assert.deepEqual(Object.keys(C.TIERS), ['ss+parameshvara', 'ss']);
  assert.equal(C.DEFAULT_TIER, 'ss+parameshvara');
  assert.equal(C.tierOf('ss').calendar, P); assert.equal(C.tierOf('classical').id, 'ss');
  for (const alias of [undefined, '', 'ss-parameshvara', 'ss parameshvara']) assert.equal(C.tierOf(alias).id, 'ss+parameshvara', String(alias));
  assert.equal(C.tierOf('ss+parameshvara').calendar, SST.calendar({ samskara: 'parameshvara' }), "ss-tier.js's calendar, the one math-core and the pages use");
  assert.equal(path.relative(__dirname, C.manifestPath('ss')), path.join('corpus', 'calendar', 'manifest-100k.json'));
  assert.equal(path.relative(__dirname, C.manifestPath('ss+parameshvara')), path.join('corpus', 'calendar', 'manifest-100k-ss-parameshvara.json'));
  for (const bad of ['drik', 'toString', '__proto__', 'calibrated', 'modern']) {
    assert.throws(() => C.tierOf(bad), (e) => e instanceof RangeError && /not generated/.test(e.message) && /1850-2150/.test(e.message) && /retired/.test(e.message), String(bad));
  }
  // the default tier's saṃskāra is the record's, read through parampara.js — never typed in the generator
  const corr = SST.correction('parameshvara'), T = C.TIERS['ss+parameshvara'];
  assert.deepEqual([T.samskara.moonArcmin, T.samskara.nodeArcmin, T.samskara.epochKali], [corr.moonArcmin, corr.nodeArcmin, corr.epochKali]);
  assert.deepEqual([...T.samskara.corrects], [...corr.corrects]);
  assert.equal(T.label, corr.label);
  const src = fs.readFileSync(path.join(__dirname, 'scripts', 'calendar-100k.cjs'), 'utf8');
  for (const v of [corr.moonArcmin, corr.nodeArcmin, corr.epochKali]) assert.equal(src.includes(String(v)), false, `the generator types ${v}`);
  assert.equal(year(5127).tier, 'ss+parameshvara', 'buildYear without a tier builds the default');
});

for (const TIER of TIERS) {
  const range = C.rangeOf(TIER);
  const samples = C.sampleKs(range);

  test(`[${TIER}] the span: every Kali year whose [start, end) meets proleptic Gregorian −50000-01-01 … 50000-12-31 is −46,897 … 53,099 (99,997 years)`, () => {
    assert.equal(range.kaliFrom, -46897); assert.equal(range.kaliTo, 53099);
    assert.equal(range.gregorianFrom, '-50000-01-01'); assert.equal(range.gregorianTo, '50000-12-31');
    const lo = K.kaliDayFromCivil({ calendar: 'gregorian', year: -50000, month: 1, day: 1 }), hi = K.kaliDayFromCivil({ calendar: 'gregorian', year: 50000, month: 12, day: 31 }) + 1;
    const first = year(range.kaliFrom, TIER), last = year(range.kaliTo, TIER);
    assert.ok(first.y.start <= lo && first.y.end > lo, 'the first year holds −50000-01-01');
    assert.ok(last.y.start < hi && last.y.end >= hi, 'the last year holds 50000-12-31');
    assert.equal(first.line.start.gregorian, '-50001-12-20'); assert.equal(A.yearOfKali(range.kaliTo + 1, C.TIERS[TIER].calendar).start >= hi, true);
    // the text's sidereal year drifts against the Gregorian one, about a day in 61.5 years: Caitra opens in December at the
    // start of the span and in May at its end [measured, both tiers]
    assert.equal(last.line.start.gregorian, '50000-05-24');
  });

  test(`[${TIER}] the invariants hold on ${samples.length} sampled years (every 1,000th Gregorian year, JDN 0, the Kali epoch, ±2^23 Kali days, 2026, 2028, the span's ends)`, { timeout: 180000 }, () => {
    assert.equal(samples.length, 109, '101 thousand-year marks, 8 more years, the span\'s ends coincide with two of the marks');
    for (const k of [range.kaliFrom, range.kaliTo, 5127, 5129]) assert.ok(samples.includes(k), `${k} is sampled`);
    let adhika = 0, kshaya = 0, n13 = 0, finalAdhika = 0;
    for (const k of samples) {
      const b = year(k, TIER);
      assert.equal(b.tier, TIER);
      assert.deepEqual(C.checkYear(b), [], `Kali ${k}`);
      adhika += b.line.counts.adhika; kshaya += b.line.counts.kshaya; n13 += b.line.counts.months === 13; finalAdhika += b.y.months.at(-1).adhika;
      assert.equal(JSON.parse(b.text).k, k);
    }
    // the year after each end of the span and after 2028-29 starts exactly where it ends (invariant 2), and the saṃvatsara carries over
    for (const k of [range.kaliFrom, 5129, range.kaliTo - 1]) {
      const a = year(k, TIER), b = year(k + 1, TIER);
      assert.deepEqual(C.checkSequence(C.tailOf(a, null), C.headOf(b)), [], `${k} → ${k + 1}`);
    }
    assert.equal(year(5129, TIER).y.months.at(-1).name, 'Caitra'); assert.equal(year(5129, TIER).y.months.at(-1).adhika, true, '2028-29 ends with an adhika Caitra');
    // 2026-27 has an adhika Jyeṣṭha in both tiers [measured]
    assert.deepEqual(year(5127, TIER).y.months.filter((m) => m.adhika).map((m) => m.name), ['Jyeṣṭha']);
    assert.ok(Math.abs(adhika - kshaya - samples.length * C.ADHIKA_PER_YEAR) < 0.15 * samples.length, `adhika ${adhika} − kṣaya ${kshaya} on ${samples.length} years`);
    assert.ok(n13 > 0.3 * samples.length && n13 < 0.45 * samples.length && finalAdhika >= 1);
  });

  test(`[${TIER}] each sampled year's first day: the pañcāṅga at Ujjayinī ends, its vāra steps with the Kali day, its month is the year's, and the date converts back in both calendars`, { timeout: 180000 }, () => {
    const PT = C.TIERS[TIER].calendar;
    const N0 = Math.floor(year(samples[0], TIER).y.start), v0 = K.varaOfKaliDay(N0).index;
    for (const k of samples) {
      const b = year(k, TIER), N = Math.floor(b.y.start) + 1;               // the first civil day whose sunrise is inside the year
      const p = PT.panchanga(N, UJJAYINI);
      assert.ok(p.sunrise < p.sunset && p.sunset < p.nextSunrise && p.sunrise > b.y.start, `Kali ${k}: day order`);
      assert.equal(p.vara, K.varaOfKaliDay(N).name);
      assert.equal(((K.varaOfKaliDay(N).index - v0 - (N - N0)) % 7 + 7) % 7, 0, `Kali ${k}: vāra continuity`);
      for (const key of ['tithi', 'nakshatra', 'yoga', 'karana']) assert.ok(p[key].length >= 1 && p[key].every((x) => Number.isInteger(x.index)), `Kali ${k} ${key}`);
      const m = b.y.months.find((x) => x.start <= p.sunrise && p.sunrise < x.end);
      assert.equal(p.month.name, m.name, `Kali ${k}: lunarMonth and yearOfKali name the month alike`); assert.equal(p.month.adhika, m.adhika);
      for (const calendar of ['gregorian', 'julian']) assert.equal(K.kaliDayFromCivil({ calendar, ...K.civilFromKaliDay(N, calendar) }), N);
    }
  });

  test(`[${TIER}] the full run: when its manifest exists, every sampled year line hashes to the value it recorded, and the manifest carries no absolute path`, { timeout: 180000 }, (t) => {
    const file = C.manifestPath(TIER);
    if (!fs.existsSync(file)) { t.skip(`no manifest yet: run node scripts/calendar-100k.cjs --tier ${TIER} --write-manifest`); return; }
    const text = fs.readFileSync(file, 'utf8'), man = JSON.parse(text);
    assert.doesNotMatch(text, /(?:^|["\s(])(?:\/home\/|\/tmp\/|\/root\/|\/Users\/|[A-Za-z]:\\)/, 'no absolute path');
    // the manifest says which calendar it is
    assert.equal(man.tier, TIER); assert.equal(man.tierLabel, C.TIERS[TIER].label); assert.equal(man.tierNote, C.TIER_NOTE[TIER]);
    if (TIER === 'ss') { assert.match(man.tierNote, /manifest-100k-ss-parameshvara\.json/); assert.equal(man.samskara, undefined); }
    else {
      const corr = SST.correction('parameshvara');
      assert.deepEqual([man.samskara.moonArcmin, man.samskara.nodeArcmin, man.samskara.epochKali], [corr.moonArcmin, corr.nodeArcmin, corr.epochKali]);
      for (const f of ['ss-tier.js', 'parampara.js', 'corpus/parampara/samskara.json', 'corpus/parampara/registry.json']) assert.match(man.moduleSha256[f], /^[0-9a-f]{64}$/, f);
    }
    assert.deepEqual(man.range, range);
    assert.equal(man.years, 99997); assert.equal(man.failures, 0);
    assert.equal(man.shards.reduce((s, x) => s + x.lines, 0), man.years);
    for (const s of man.shards) assert.equal(path.basename(s.file), s.file, 'shard names only');
    assert.ok(Math.abs(man.adhikaMinusKshaya - man.expectedByTextRate) <= 2, 'adhika − kṣaya at the text\'s rate');
    assert.deepEqual(Object.keys(man.sampleHashes).map(Number).sort((a, b) => a - b), samples);
    for (const k of samples) assert.equal(C.sha256(year(k, TIER).text), man.sampleHashes[k], `Kali ${k}: the year line is the one the full run wrote (node ${man.node} there, ${process.version} here)`);
  });
}

test("the two tiers differ as the record says: the saṃskāra's Moon is behind the text's, so its new moons come later by the shift over the elongation rate", { timeout: 180000 }, () => {
  const corr = SST.correction('parameshvara');
  assert.ok(corr.moonArcmin < 0, 'the record moves the Moon back');
  const lo = -corr.moonArcmin / 60 / 15 * 1440, hi = -corr.moonArcmin / 60 / 10 * 1440;   // minutes; the elongation runs 10-15° a day
  const samples = C.sampleKs(C.rangeOf('ss'));
  let same = 0;
  for (const k of samples) {
    const a = year(k, 'ss').y, b = year(k, 'ss+parameshvara').y, d = (b.start - a.start) * 1440;
    if (Math.abs(d) > 1440) continue;                                  // a different nija Caitra (the shift moved a saṅkrānti across a new moon)
    same++;
    assert.ok(d > lo && d < hi, `Kali ${k}: the year starts ${d.toFixed(2)} min later (expected ${lo.toFixed(1)}–${hi.toFixed(1)})`);
    assert.equal(b.mesha, a.mesha, "the saṅkrāntis are the Sun's, which no saṃskāra moves");
  }
  assert.ok(same >= samples.length - 3, `${same} of ${samples.length} sampled years open at the same new moon in both tiers`);
});
