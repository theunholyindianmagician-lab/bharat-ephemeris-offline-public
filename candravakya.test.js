'use strict';
/*
 * candravakya.test.js — slice 9: the candravākya generator.
 *
 * WRITTEN FIRST, SEALED EITHER WAY. The block SEAL below was written before candravakya.js existed and before any
 * vākya was computed (2026-10-07). It fixes the two first-vākya values the tradition is said to give and every model
 * the comparison will be run on. Its SHA-256 is pinned in the first test: editing the expectation or the models after
 * the fact fails the suite. The comparison is then recorded whatever it comes to; no parameter is tuned to it.
 *
 * Tags: [text] printed in a source, place named · [theorem] exact arithmetic re-run here · [measured] a run of this
 * file · [reading] my reading · [snippet] seen only as a web-search snippet · [unverified] said, not checked here.
 */

// ── THE SEAL (written before the first computation) ──────────────────────────────────────────────────────────────────
const SEAL = Object.freeze({
  slice: 9,
  written: '2026-10-07',
  rule: 'expectation and models fixed before any vakya was computed; the day-1 comparison is recorded whatever it is; nothing is tuned to it',
  expect: [
    { who: 'Vararuci', word: 'gīrnaḥ śreyaḥ', precision: 'minutes', tag: '[snippet]', via: 'katapayadi.test.js [CV]' },
    { who: 'Mādhava', word: 'śīlaṃ rājñaḥ śriye', precision: 'seconds', tag: '[snippet]', via: 'katapayadi.test.js [CV]' },
  ],
  models: [
    { id: 'default', canon: 'aryabhata', sine: 'madhava', epicycle: '31.5/360 constant [unverified: attributed to Aryabhata by the research, design doc section 8]' },
    { id: 'aryabhata-table', canon: 'aryabhata', sine: 'table', epicycle: '31.5/360 constant [unverified]' },
    { id: 'parahita', canon: 'parahita', sine: 'madhava', epicycle: '31.5/360 constant [unverified]' },
    { id: 'surya', canon: 'surya', sine: 'table', epicycle: '32 even end, 31 2/3 odd end, varying (SS 2.34, 2.38) [text]' },
  ],
  start: 'the cycle starts with the mean Moon at its apogee (anomaly zero); vakya n = the true Moon advance after n civil days',
  rounding: 'to the nearest second (Madhava) and to the nearest minute (Vararuci)',
});
const SEAL_SHA256 = '9bf352e65d5682526d1d2c87e1f0bc5f98d4d056c34d842747f0946bd33f1183';   // pinned before the first vākya was computed
const TABLE_SHA256 = '02447adacfde95e2fa63fb650cd37110e511054fde8abbc7c0763ecca29aed5c';  // the default table as first generated (2026-10-07)

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
const C = require('./candravakya.js');
const KP = require('./katapayadi.js');
const S = require('./sphuta.js').withSine('table');                   // the SS canon here uses the SS table, as sphuta.js's table tier
const sha256 = (s) => crypto.createHash('sha256').update(s).digest('hex');
const R = 31.5 / 360, G = R / Math.sqrt(1 - R * R);          // the [unverified] Āryabhaṭa ratio, and the steepest slope of arcsin(R sin x)
const wrapArcmin = (x) => ((x + 10800) % 21600 + 21600) % 21600 - 10800;
const rat = (q) => Number(q[0]) / Number(q[1]);

// ── the seal ─────────────────────────────────────────────────────────────────────────────────────────────────────────
test('[SEAL] day 1 against 12°03′ and 12°02′35″: the expectation was written first; the comparison is recorded whatever it is', (t) => {
  assert.equal(sha256(JSON.stringify(SEAL)), SEAL_SHA256, 'the seal was edited after the fact');
  // the module's parameters are the sealed ones
  const want = { aryabhata: ['madhava', [31.5, 31.5]], parahita: ['madhava', [31.5, 31.5]], surya: ['table', [32, 31 + 2 / 3]] };
  for (const mdl of SEAL.models) {
    const d = C.generate({ canon: mdl.canon, sine: mdl.sine, count: 1 }).model;
    assert.equal(d.sine, mdl.sine, mdl.id);
    d.epicycle.forEach((e, i) => assert.ok(Math.abs(e - want[mdl.canon][1][i]) < 1e-9, `${mdl.id}: epicycle`));
    if (mdl.id !== 'aryabhata-table') assert.equal(C.CANONS[mdl.canon].sine, want[mdl.canon][0], `${mdl.id}: default sine`);
  }
  // the expectations, read from the words as the [CV] test reads them (vāmato gatiḥ) — [snippet]
  const expected = SEAL.expect.map((e) => ({ ...e, place: C.decodeVakya(e.word, { precision: e.precision }) }));
  assert.equal(expected[0].place.dms, '12°03′');
  assert.equal(expected[1].place.dms, '12°02′35″');
  const record = [];
  for (const mdl of SEAL.models) {
    for (const e of expected) {
      const v = C.vakya(1, { canon: mdl.canon, sine: mdl.sine, precision: e.precision });
      const unit = e.precision === 'seconds' ? '″' : '′';
      record.push({
        model: mdl.id, who: e.who, expected: e.place.dms, got: v.dms, diff: `${Number(v.units - e.place.units)}${unit}`,
        exactDiffArcsec: (v.degrees * 3600 - Number(e.place.arcsec)).toFixed(2), exact: v.degrees.toFixed(7),
      });
    }
  }
  t.diagnostic('day-1 vākya (sealed 2026-10-07, before computing):\n' + record.map((r) =>
    `  ${r.model.padEnd(16)} vs ${r.who.padEnd(9)} expected ${r.expected.padEnd(10)} got ${r.got.padEnd(10)} rounded diff ${r.diff.padStart(4)}  exact ${r.exact}° (${r.exactDiffArcsec}″ from it)`).join('\n'));
  // recorded, whatever it is
  assert.equal(record.length, 8);
  for (const r of record) assert.ok(Number.isFinite(Number(r.exactDiffArcsec)), `${r.model}/${r.who}`);
  // the outcome, frozen as first measured (2026-10-07): a later change of model must explain any change here
  assert.deepEqual(record.map((r) => `${r.model}/${r.who}: ${r.got} ${r.diff}`), [
    'default/Vararuci: 12°03′ 0′', 'default/Mādhava: 12°02′35″ 0″',
    'aryabhata-table/Vararuci: 12°03′ 0′', 'aryabhata-table/Mādhava: 12°02′36″ 1″',
    'parahita/Vararuci: 12°03′ 0′', 'parahita/Mādhava: 12°02′35″ 0″',
    'surya/Vararuci: 12°02′ -1′', 'surya/Mādhava: 12°01′41″ -54″',
  ]);
  assert.equal(record[1].exactDiffArcsec, '-0.28');           // the default's exact day-1 value lies 0.28″ below 12°02′35″
});

// ── the canon ────────────────────────────────────────────────────────────────────────────────────────────────────────
test('[CANON] the rates are the canon\'s own integers; the SS true Moon equals sphuta.js; Āryabhaṭa\'s largest equation is arc(R·31.5/360)', () => {
  const ab = C.model(), ss = C.model({ canon: 'surya' });
  assert.deepEqual(ab.anomalisticRevPerYuga, [57753336n - 488219n, 1n]);              // 57,265,117 [theorem]
  assert.deepEqual(ss.anomalisticRevPerYuga, [57753336n - 488203n, 1n]);              // 57,265,133 [theorem]
  assert.equal(ab.moonPerDay[0] * 1577917500n, ab.moonPerDay[1] * 57753336n * 21600n);   // arcminutes a day, exact
  assert.equal(ab.anomalyPerDay[0] * 1577917500n, ab.anomalyPerDay[1] * 57265117n * 21600n);
  // independent implementations agree: this module's SS Moon and sphuta.js (float) on the same days
  const K = C.kaliDayOf({ calendar: 'gregorian', year: 2026, month: 10, day: 7 });
  for (const d of [0, 1, 1000, 1651700, K, K + 12345]) {
    assert.ok(Math.abs(C.trueMoon(d, { canon: 'surya' }).degrees - S.sphutaAtDays(d).moon) < 1e-9, `day ${d}`);
  }
  // Āryabhaṭa at the Kali start: mean Moon 0°, apogee 90° (parahita-madhyama.test.js), so the kendra is 90° and the
  // equation its largest, arc(R × 31.5/360) = arcsin(7/80) [theorem on the unverified epicycle]; Mādhava's sine gives it to the third
  const k0 = C.trueMoon(0);
  assert.deepEqual(k0.mean, [0n, 1n]);
  assert.ok(Math.abs(k0.degrees - Math.asin(7 / 80) * 180 / Math.PI) < 0.01 / 3600);
  assert.equal(C.vakya(0).dms, '0°00′00″');
});

// ── the table ────────────────────────────────────────────────────────────────────────────────────────────────────────
test('[VAKYA] 248 vākyas from the apogee: daily motions within the equation\'s slope, Mādhava\'s path = arcsin geometry, the half-cycle symmetry', (t) => {
  const tab = C.generate(), V = tab.vakyas, M = C.model();
  assert.equal(V.length, 249);
  const m = rat(M.moonPerDay), a = rat(M.anomalyPerDay);                                // arcminutes per day
  for (let n = 1; n <= 248; n++) {
    const step = (V[n].degrees - V[n - 1].degrees + 360) % 360 * 60;
    assert.ok(step >= m - G * a - 1e-6 && step <= m + G * a + 1e-6, `day ${n}: ${step}′`);
  }
  // Mādhava's sine is the circle's sine to his third: the exact path equals arcsin geometry within 0.01″
  for (let n = 0; n <= 248; n++) {
    const geo = ((m * n - Math.asin(R * Math.sin(a * n / 60 * Math.PI / 180)) * 180 / Math.PI * 60) % 21600 + 21600) % 21600;
    assert.ok(Math.abs(wrapArcmin(geo - V[n].degrees * 60)) * 60 < 0.01, `day ${n}`);
  }
  // V(n) + V(248−n) − V(248) = α·R(1 − cos) with α the 248-day leftover anomaly: bounded by 2·G·α [theorem]
  const alpha = C.closure(248).residualArcmin;
  let worst = 0;
  for (let n = 0; n <= 248; n++) worst = Math.max(worst, Math.abs(wrapArcmin((V[n].degrees + V[248 - n].degrees - V[248].degrees) * 60)));
  assert.ok(worst <= 2 * G * Math.abs(alpha) + 1e-6, `${worst}′`);
  assert.equal(worst.toFixed(3), '1.177');
  // the table, frozen
  assert.equal(sha256(V.map((v) => String(v.integer)).join(',')), TABLE_SHA256);
  const show = [1, 2, 3, 7, 14, 27, 28, 55, 124, 247, 248];
  t.diagnostic('default (aryabhata, madhava, 31.5/360 [unverified]): ' + show.map((n) => `${n}: ${V[n].dms}`).join(' · '));
  assert.deepEqual(show.map((n) => V[n].dms), ['12°02′35″', '24°08′39″', '36°21′33″', '87°12′59″', '184°43′24″', '356°23′38″',
    '8°25′47″', '4°49′28″', '193°52′22″', '15°41′00″', '27°43′34″']);
  // the Sūrya-Siddhānta's table, for comparison (its epicycle varies between the ends, 2.38)
  const SV = C.generate({ canon: 'surya' }).vakyas;
  t.diagnostic('surya (table, 32°/31°40′): ' + show.map((n) => `${n}: ${SV[n].dms}`).join(' · '));
  assert.equal(SV[1].dms, '12°01′41″');
  assert.equal(SV[248].dms, '27°43′31″');
});

test('[WORD] every vākya is a Kaṭapayādi word read vāmato gatiḥ and decodes back; the words carry the number, not the authors\' sentences', () => {
  for (const precision of ['seconds', 'minutes']) {
    for (const v of C.generate({ precision }).vakyas) {
      assert.ok(v.roundTrip, `${precision} ${v.n}`);
      assert.equal(KP.decodeWord(v.word).value, v.integer);
      assert.equal(KP.decodeWord(v.wordDeva).value, v.integer);
      assert.equal(C.decodeVakya(v.word, { precision }).dms, v.dms, `${precision} ${v.n}`);
      assert.match(v.word, /^(?:kha|gha|cha|jha|na|ka|ga|ṅa|ca|ja)+$/, 'one canonical consonant per digit');
    }
  }
  // day 1 by the default model: the generated word has Mādhava's digits in his order, but it is not his sentence
  const d1 = C.vakya(1);
  assert.equal(d1.integer, 120235n);
  assert.equal(d1.word, 'ṅagakhanakhaka');
  assert.equal(KP.decodeWord(d1.word).digitsWritten, KP.decodeWord('śīlaṃ rājñaḥ śriye').digitsWritten);   // 5 3 2 0 2 1
  assert.notEqual(d1.word, 'śīlaṃ rājñaḥ śriye');
  assert.equal(C.vakya(1, { precision: 'minutes' }).integer, KP.decodeWord('gīrnaḥ śreyaḥ').value);         // 1203
  // a vākya past the first rāśi: rāśi, degrees, minutes, seconds [reading]
  const v124 = C.vakya(124);
  assert.equal(v124.integer, 6135222n);                                                                      // 6 rāśi 13°52′22″
  assert.equal(C.decodeVakya(v124.word).dms, '193°52′22″');
  assert.equal(C.vakya(124, { layout: 'amsa' }).integer, 1935222n);
  assert.match(C.NOTE, /NOT the traditional vākyas/);
  assert.throws(() => C.decodeVakya(KP.encodeInteger(450000n, 'iast')), /45 degrees in a rāśi/);   // 0 rāśi 45°: not a place
  assert.throws(() => C.decodeVakya(KP.encodeInteger(127000n, 'iast')), /not a place/);            // 70 minutes
});

// ── the cycles ───────────────────────────────────────────────────────────────────────────────────────────────────────
test('[CYCLE] 248 days ≈ 9 anomalistic months [theorem from the canon]; 3031 and 12,372 days [snippet] measured against the canon', (t) => {
  const c248 = C.closure(248);
  assert.equal(c248.months, 9);
  assert.equal(c248.revolutions[0] * 1577917500n, c248.revolutions[1] * 248n * 57265117n, 'exact rational');
  assert.equal(rat(c248.revolutions) - 9 > 0, true);
  assert.equal((9 * c248.monthDays).toFixed(2), '247.99');                                // design doc §8 [theorem]
  assert.equal(c248.residualArcmin.toFixed(3), '6.728');                                 // 491,516/1,577,917,500 rev
  const c3031 = C.closure(3031), c12372 = C.closure(12372);
  assert.equal(c3031.months, 110); assert.equal(c12372.months, 449);
  assert.equal(c3031.residualArcmin.toFixed(3), '-4.865');
  assert.equal(c12372.residualArcmin.toFixed(3), '-12.730');
  assert.equal(12372, 4 * 3031 + 248);
  // 248/9 and 3031/110 are convergents of the canon's anomalistic month; 12,372/449 is not, and the canon has better closures
  const cv = C.convergents();
  assert.deepEqual(cv.terms.slice(0, 7), [27, 1, 1, 4, 12, 1, 2]);
  const pairs = cv.convergents.map((x) => `${x.days}/${x.months}`);
  assert.ok(pairs.includes('248/9') && pairs.includes('3031/110'));
  assert.ok(!pairs.includes('12372/449'));
  assert.ok(Math.abs(c12372.residualArcmin) > Math.abs(c3031.residualArcmin), 'by the canon 12,372 closes worse than 3031');
  const better = cv.convergents.filter((x) => x.days > 3031 && x.days < 12372 && Math.abs(x.residualArcmin) < Math.abs(c3031.residualArcmin));
  assert.deepEqual(better.map((x) => x.days), [3279, 9589]);
  // the month each cycle implies, against the canon's own
  assert.equal(c3031.monthDays.toFixed(6), '27.554602');
  assert.equal(c12372.impliedMonthDays.toFixed(6), '27.554566');
  assert.equal(c3031.impliedMonthDays.toFixed(6), '27.554545');
  // the Sūrya-Siddhānta: the same convergents, nearly the same residuals
  const sv = C.convergents({ canon: 'surya' });
  assert.deepEqual(sv.terms.slice(0, 7), [27, 1, 1, 4, 12, 1, 2]);
  const ss = [248, 3031, 12372].map((n) => C.closure(n, { canon: 'surya' }).residualArcmin.toFixed(3));
  assert.deepEqual(ss, ['6.742', '-4.695', '-12.037']);
  t.diagnostic(`anomaly left over (arcmin) — aryabhata: 248 ${c248.residualArcmin.toFixed(3)}, 3031 ${c3031.residualArcmin.toFixed(3)}, 12372 ${c12372.residualArcmin.toFixed(3)}; surya: ${ss.join(', ')}; convergents ${pairs.join(' ')}`);
});

// ── use: the Moon on a day, the vākya way, against the canon's own true Moon ─────────────────────────────────────────
test('[USE] khaṇḍa + cycle dhruvas + vākya against the direct sphuṭa: the method\'s own error, measured, and why', (t) => {
  const K = C.kaliDayOf({ calendar: 'gregorian', year: 2026, month: 10, day: 7 });
  const kh = C.findKhanda(K - 3031, K);                                                   // the day of least anomaly in the 3031 days before
  assert.equal(kh.kaliDay, 1871543);
  assert.equal(kh.anomalyArcmin.toFixed(2), '-1.80');
  // one worked day
  const w = C.vakyaMoon(K, { khanda: kh.kaliDay });
  assert.equal(w.kaliDay - w.khanda, 1312);
  assert.deepEqual(w.decomposition.map((x) => x.count), [0, 0, 5]);
  assert.equal(w.vakyaIndex, 72);
  // first 248 days: only the khaṇḍa's own leftover anomaly and the rounding
  let first = 0;
  for (let d = kh.kaliDay; d < kh.kaliDay + 248; d++) first = Math.max(first, Math.abs(C.compare(d, { khanda: kh.kaliDay }).errorArcmin));
  assert.ok(first <= 2 * G * Math.abs(kh.anomalyArcmin) + 0.05, `${first}′`);
  // two great cycles (24,744 days), every seventh day
  const sweep = (opts) => {
    let max = 0, at = 0, sum = 0, n = 0, slack = 0;
    for (let d = kh.kaliDay; d < kh.kaliDay + 2 * 12372; d += 7) {
      const c = C.compare(d, { khanda: kh.kaliDay, ...opts }), e = Math.abs(c.errorArcmin);
      const alphaStart = C.trueMoon(c.vakya.cycleStart, opts).anomalyArcmin;              // the anomaly the table assumed was zero
      slack = Math.max(slack, e - 2 * G * Math.abs(alphaStart));
      sum += e * e; n += 1; if (e > max) { max = e; at = d - kh.kaliDay; }
    }
    return { max, at, rms: Math.sqrt(sum / n), slack };
  };
  const full = sweep({}), only248 = sweep({ cycles: [248] });
  t.diagnostic(`vākya Moon − direct sphuṭa (aryabhata, khaṇḍa Kali ${kh.kaliDay}, α₀ ${kh.anomalyArcmin.toFixed(2)}′): first 248 days max ${first.toFixed(2)}′; `
    + `12372/3031/248 over two great cycles max ${full.max.toFixed(2)}′ (day +${full.at}) rms ${full.rms.toFixed(2)}′; 248 alone max ${only248.max.toFixed(2)}′ rms ${only248.rms.toFixed(2)}′`);
  assert.equal(first.toFixed(2), '0.33');
  assert.equal(full.max.toFixed(2), '13.86'); assert.equal(full.at, 3017); assert.equal(full.rms.toFixed(2), '3.62');
  // the law: |error| ≤ 2·G·|anomaly at the cycle start| (+ rounding and second order) — the error is the cycle start's leftover anomaly
  assert.ok(full.slack < 0.05, `${full.slack}′`);
  // controls: the 248-day cycle alone lets the anomaly run away; a khaṇḍa far from the apogee is wrong from the first day
  assert.ok(only248.max > 100, `${only248.max}′`);
  const bad = 1871515, badAlpha = C.trueMoon(bad).anomalyArcmin;
  assert.ok(Math.abs(badAlpha) > 300, `${badAlpha}′`);
  let badMax = 0;
  for (let d = bad; d < bad + 248; d++) badMax = Math.max(badMax, Math.abs(C.compare(d, { khanda: bad }).errorArcmin));
  assert.ok(badMax > 60 && badMax <= 2 * G * Math.abs(badAlpha) + 1, `${badMax}′`);
  assert.throws(() => C.vakyaMoon(kh.kaliDay - 1, { khanda: kh.kaliDay }), /forward/);
  assert.throws(() => C.vakyaMoon(K), /khaṇḍa/);
});

// ── the frame ────────────────────────────────────────────────────────────────────────────────────────────────────────
test('[FRAME] candravakya.js names no modern source and requires only the sovereign files', () => {
  const FORBIDDEN = /\b(?:DE4\d\d|VSOP\d*|ELP\d*|Swiss|swisseph|Gaia|IERS|DrikTier)\b|finals\.all|DeltaT|astronomy-engine/;
  const ROOTS = ['katapayadi.js', 'kala-dvara.js', 'parahita-madhyama.js', 'dhruva.js', 'sphuta.js', 'radau.js'];
  const LAYERS = ['panchanga.js', 'dasha.js', 'muhurta.js', 'utsava.js', 'gurutva.js', 'gurutva-candra.js', 'spanda-ganita.js', 'ss-udaya.js', 'ss-graha.js', 'ss-chaya.js', 'ss-grahana.js', 'ss-drishya.js'];
  const allowed = new Set([...ROOTS, ...LAYERS].map((f) => './' + f));
  const text = fs.readFileSync(path.join(__dirname, 'candravakya.js'), 'utf8');
  assert.equal(FORBIDDEN.test(text), false, 'candravakya.js mentions a forbidden source');
  assert.equal(/\bimport\s/.test(text), false);
  const reqs = [...text.matchAll(/\brequire\s*\(\s*["']([^"']+)["']\s*\)/g)].map((m) => m[1]);
  assert.deepEqual(reqs, ['./katapayadi.js', './parahita-madhyama.js', './sphuta.js', './spanda-ganita.js', './kala-dvara.js']);
  for (const r of reqs) assert.ok(allowed.has(r), r);
});
