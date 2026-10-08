'use strict';
/*
 * muhurta.test.js — the day's divisions and the avoided windows (muhurta.js), each tied to the verse it cites.
 */
const assert = require('node:assert/strict');
const { test } = require('node:test');
const M = require('./muhurta.js');
const P = require('./panchanga.js');
const S = require('./sphuta.js');
const D = require('./dhruva.js');
const K = require('./kala-dvara.js');
const canon = require('./corpus/bphs/canon.json');
const verse = (c, n) => canon.chapters[String(c)].verses.find((v) => v.n === n).iast;
const UJJAYINI = { latitude: 23.18, deshantara: 0 };
const day = (y, m, d) => K.kaliDayFromCivil({ calendar: 'gregorian', year: y, month: m, day: d });
const mod = (a, m) => ((a % m) + m) % m;

test('thirty muhūrtas tile the civil day; the 8th of the day holds local noon', () => {
  const N = day(2026, 10, 7), mu = M.muhurtas(N, UJJAYINI);
  assert.equal(mu.list.length, 30);
  for (let i = 1; i < 30; i++) assert.ok(Math.abs(mu.list[i].start - mu.list[i - 1].end) < 1e-12);
  assert.equal(mu.list[0].start, P.sunrise(N, UJJAYINI));
  assert.ok(Math.abs(mu.list[29].end - P.sunrise(N + 1, UJJAYINI)) < 1e-12);
  const noon = (P.sunrise(N, UJJAYINI) + P.sunset(N, UJJAYINI)) / 2;
  assert.ok(mu.abhijit.start < noon && noon < mu.abhijit.end);
  assert.match(mu.division, /no local text/);
});

test('a nāḍī is a sixtieth of the star-wheel\'s turn (SS 1.11-1.12)', () => {
  assert.equal(M.NADI_DAYS, 1577917828 / (60 * 1582237828));
});

test('BPHS 92.2-92.4 name the junctions the code uses', () => {
  assert.match(verse(92, 2), /pūrṇānandākhyayostithyoḥ sandhau nāḍīcatuṣṭayam/);
  assert.match(verse(92, 3), /revatīdāsrayoḥ.*maghayoḥ.*śākramūlayoḥ/);
  assert.match(verse(92, 4), /mīnājayoḥ karkiharyorlagnayoralicāpayoḥ/);
  assert.match(verse(44, 17), /vipattārāpratyarīśā vadha/);
});

test('gaṇḍānta: the SS 11.21 window is the Moon from 116°40′ to 123°20′; the BPHS window is 4 nāḍīs each side of 120°', () => {
  // find a day whose sunrise-to-sunrise holds the Moon's crossing of 120°
  let N = day(2026, 1, 1), w;
  for (; N < day(2026, 3, 1); N++) {
    w = M.varjya(N, UJJAYINI).filter((x) => x.kind === 'nakṣatra-gaṇḍānta' && x.source.startsWith('BPHS 92.3'));
    if (w.length) break;
  }
  assert.ok(w.length, 'a nakṣatra gaṇḍānta in two months');
  const g = w[0];
  assert.ok([0, 120, 240].some((j) => Math.abs(mod(P.placesAt(g.junction).moon - j + 180, 360) - 180) < 1e-4));
  assert.ok(Math.abs((g.end - g.start) - 8 * M.NADI_DAYS) < 1e-9);
  const ss = M.varjya(N, UJJAYINI).concat(M.varjya(N - 1, UJJAYINI), M.varjya(N + 1, UJJAYINI)).find((x) => x.source === 'SS 11.21-11.22');
  assert.ok(ss);
  const mlo = P.placesAt(ss.start).moon, mhi = P.placesAt(ss.end).moon;
  assert.ok(Math.abs(mod(mhi - mlo, 360) - 400 / 60) < 1e-3, 'two pādas of 200′');
});

test('tārā: counted from the birth nakṣatra in nines; vipat, pratyari and vadha are the 3rd, 5th and 7th', () => {
  assert.equal(M.tara(10, 10).name, 'janma');
  assert.equal(M.tara(10, 12).name, 'vipat'); assert.ok(M.tara(10, 12).adverse);
  assert.equal(M.tara(27, 4).index, 5);
  assert.equal(M.tara(1, 19).index, 1);
  assert.deepEqual([1, 2, 3, 4, 5, 6, 7, 8, 9].filter((i) => M.tara(1, i).adverse), [3, 5, 7]);
});

test('SS 11.1-11.2, 11.19: at every pāta the declinations are equal; doubles and failures sit near the solstices, and the failures follow the node', () => {
  const t1 = day(1990, 1, 1), t2 = day(2026, 1, 1);
  const ps = M.patas(t1, t2);
  const eps = D.SS_EPSILON_DEG, R2D = 180 / Math.PI, D2R = Math.PI / 180;
  const fromSolstice = (t) => { const q = P.placesAt(t), a = S.ayanamshaSS(S.spandasOfDays(t)); const s = mod(q.sun + a, 360); return Math.min(Math.abs(s - 90), Math.abs(s - 270)); };
  let doubles = 0; const failYears = {};
  for (const p of ps) {
    if (p.middle === null) {
      assert.ok(fromSolstice(p.longitudeCondition) < 35, 'a failed pāta lies near a solstice');
      const y = K.civilFromKaliDay(Math.floor(p.longitudeCondition), 'gregorian').year; failYears[y] = (failYears[y] || 0) + 1;
      continue;
    }
    const q = P.placesAt(p.middle), a = S.ayanamshaSS(S.spandasOfDays(p.middle));
    const ds = D.eclipticToEquatorial(q.sun + a, 0, eps).delta;
    const dm = Math.asin(Math.sin(eps * D2R) * Math.sin((q.moon + a) * D2R)) * R2D + q.moonLatitude;
    const g = p.kind.startsWith('Vyatīpāta') ? dm - ds : dm + ds;
    assert.ok(Math.abs(g) < 1e-4, `${p.kind}: ${g}`);
    if (p.count > 1) { doubles++; assert.ok(fromSolstice(p.middle) < 35, 'a double pāta lies near a solstice'); }
  }
  assert.ok(doubles > 100);
  for (let y = 2002; y <= 2010; y++) assert.equal(failYears[y] || 0, 0, `no failure in ${y}, near the major standstill`);
  assert.ok((failYears[1996] || 0) >= 8 && (failYears[2015] || 0) >= 8, 'failures crowd the minor standstills');
});

test('the lagnas of a day run from sunrise to the next sunrise without a gap', () => {
  const N = day(2026, 10, 7), L = M.lagnas(N, UJJAYINI);
  assert.ok(L.length >= 12 && L.length <= 13);
  for (let i = 1; i < L.length; i++) assert.ok(Math.abs(L[i].start - L[i - 1].end) < 1e-9);
  for (let i = 1; i < L.length; i++) assert.equal(L[i].index, (L[i - 1].index + 1) % 12);
});

test('every lagna-gaṇḍānta window is centred on a real change of sign, also when the sunrise lagna is Meṣa, Siṃha or Dhanu (council JY-03)', () => {
  let n = 0, early = 0;
  for (let N = day(2026, 1, 1); N < day(2027, 1, 1); N += 5) {
    for (const w of M.varjya(N, UJJAYINI).filter((x) => x.kind === 'lagna-gaṇḍānta')) {
      const before = P.lagnaAt(w.junction - 1e-6, UJJAYINI).index, after = P.lagnaAt(w.junction + 1e-6, UJJAYINI).index;
      assert.notEqual(before, after, `junction at ${w.junction}`);
      assert.ok([0, 4, 8].includes(after));
      n++; if (w.junction < P.sunrise(N, UJJAYINI)) early++;
    }
  }
  assert.ok(n > 60 && early > 0, `windows ${n}, junctions before sunrise ${early}`);
});

test('a polar day has no windows and says so', () => {
  const N = day(2026, 6, 21), POLAR = { latitude: 78.22, deshantara: 15.6 - 75.7885 };
  assert.equal(P.sunrise(N, POLAR), null);
  for (const list of [M.varjya(N, POLAR), M.lagnas(N, POLAR)]) { assert.deepEqual(list, []); assert.equal(list.polar, true); }
  assert.equal(M.muhurtas(N, POLAR), null);
});
