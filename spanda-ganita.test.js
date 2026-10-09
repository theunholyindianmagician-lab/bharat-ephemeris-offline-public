'use strict';
/*
 * spanda-ganita.test.js — the text's Sun and Moon and every limb exact on the spanda lattice (spanda-ganita.js), with
 * time in spandas of the star-wheel's turn. Each amāvāsyā and pūrṇimā carries its own certificate: one spanda before,
 * the old tithi; at the spanda, the new.
 */
const assert = require('node:assert/strict');
const { test } = require('node:test');
const SG = require('./spanda-ganita.js');
const S = require('./sphuta.js');
const P = require('./panchanga.js');
const K = require('./kala-dvara.js');
const N = SG.N;

test('the 108 logic: every limb is an exact integer cell of the lattice; pāda = 200 prāṇas, karaṇa = 1 ghaṭī, tithi = 2', () => {
  const cell = (c) => { assert.equal(N % c, 0n, `${c} divides N`); return N / c; };
  assert.equal(cell(30n), 10935000000n); assert.equal(cell(60n), 5467500000n); assert.equal(cell(27n), 12150000000n);
  assert.equal(cell(108n), 3037500000n); assert.equal(cell(12n), 27337500000n);
  assert.equal(cell(108n), 200n * 15187500n, 'a pāda of arc is 200 prāṇas of the turn');
  assert.equal(cell(60n), K.SPANDAS_PER_GHATI, 'a karaṇa of arc is a ghaṭī of the turn');
  assert.equal(N % (108n * 108n), 0n, '108² = 11,664 divides the lattice');
  assert.notEqual(N % (108n ** 3n), 0n, '108³ does not');
  assert.equal(108n, 4n * 27n); assert.equal(108n, 9n * 12n);
});

test('the sine table is exact: the table at every node, and the arc of a sine is its arc', () => {
  for (let i = 0; i <= 24; i++) assert.deepEqual(SG.jyaQ(SG.Q(225n * BigInt(i))), SG.Q(BigInt(S.JYA[i])));
  for (const m of [SG.Q(1n), SG.Q(4441n, 3n), SG.Q(2700n), SG.Q(53999n, 10n)]) assert.deepEqual(SG.arcQ(SG.jyaQ(m)), m);
});

test('time is the turn: a yuga of turns returns every mean place; the exact places are the float places', () => {
  const yugaTurns = 1582237828n * SG.SPT;
  for (const rev of [4320000n, 57753336n]) assert.deepEqual(SG.meanArcmin(rev, 12345678901234n), SG.meanArcmin(rev, 12345678901234n + yugaTurns));
  for (const d of [1872855.3, 1655645.7, 1000.123, 2000000.9]) {
    const tau = SG.tauOfDays(d), days = SG.toNum(SG.daysOfTau(tau)), f = S.sphutaAtDays(days), e = SG.places(tau);
    assert.ok(Math.abs(((SG.toNum(e.sun) / 60 - f.sun + 540) % 360) - 180) < 1e-8);
    assert.ok(Math.abs(((SG.toNum(e.moon) / 60 - f.moon + 540) % 360) - 180) < 1e-8);
  }
});

test('every amāvāsyā and pūrṇimā of 2026, to the spanda, with its certificate; SS 4.8\'s iteration lands on the same spanda', () => {
  const t0 = K.kaliDayFromCivil({ calendar: 'gregorian', year: 2026, month: 1, day: 1 });
  let t = t0, n = 0, maxMs = 0;
  while (t < t0 + 365) {
    const fl = P.syzygyNear(t, 0, +1);
    for (const [idx, near] of [[30, fl], [15, P.syzygyNear(fl + 1, 180, +1)]]) {
      const tau = SG.tithiEnd(idx, near);
      assert.equal(SG.limbs(tau - 1n).tithi, idx, 'one spanda before: the old tithi');
      assert.equal(SG.limbs(tau).tithi, idx % 30 + 1, 'at the spanda: the new');
      maxMs = Math.max(maxMs, Math.abs(SG.toNum(SG.daysOfTau(tau)) - near) * 86400e3);
      if (idx === 30) {
        const it = SG.parvaByIteration(30, near - 0.4);
        assert.equal(it.tau, tau, 'SS 4.8 by repeated correction');
        const L = SG.limbs(tau);
        assert.ok(Math.abs(L.pada - L.sunPada) <= 1, 'Sun and Moon in the same pāda at conjunction');
      }
      n++;
    }
    t = fl + 20;
  }
  assert.ok(n >= 24);
  assert.ok(maxMs < 0.2, `the float pañcāṅga is within ${maxMs.toFixed(3)} ms of the exact spanda`);
});

test('the turn\'s own clock: 108 pādas of the turn, 60 ghaṭīs, and the spanda', () => {
  const c = SG.turnClock(SG.SPT * 7n + 3037500000n * 33n + 5467500000n * 0n + 12345n);
  assert.equal(c.turn, 7n); assert.equal(c.padaOfTurn, 34);
  const d = SG.turnClock(SG.SPT - 1n);
  assert.equal(d.padaOfTurn, 108); assert.equal(d.ghati, 59); assert.equal(d.vinadi, 59); assert.equal(d.prana, 5); assert.equal(d.spanda, 15187499);
});

test('Mādhava\'s sine: the five Kaṭapayādi coefficients give the quadrant\'s sine EXACTLY equal to his radius, to the third', () => {
  const M = SG.withSine('madhava');
  const [c1, c2, c3, c4, c5] = M.MADHAVA_C;
  assert.equal(5400n * 3600n - c1 + c2 - c3 + c4 - c5, 12375888n);           // in thirds (‴)
  assert.equal(3437n * 3600n + 44n * 60n + 48n, 12375888n);                   // 3437′44″48‴
  assert.deepEqual(M.madhavaJya(M.Q(5400n)), M.MADHAVA_R);
  assert.deepEqual(M.madhavaJya(M.Q(0n)), M.Q(0n));
  // against the sine itself on his radius: the series' truncation and the coefficients' thirds, < 1/10000 of a minute
  const R = 12375888 / 3600;
  for (let d = 0; d <= 90; d += 3.75) {
    const v = M.toNum(M.madhavaJya(M.Q(BigInt(Math.round(d * 60 * 1e6)), 1000000n)));
    assert.ok(Math.abs(v - R * Math.sin(d * Math.PI / 180)) < 1e-4, `${d}°: ${v}`);
  }
  // the arc on the lattice inverts it: at a lattice arc, the first arc-spanda reaching its sine is that arc
  for (const m of [1n, 225n * 15187500n + 7n, 1800n * 15187500n, 5399n * 15187500n]) assert.deepEqual(M.madhavaArc(M.madhavaJya(M.Q(m, 15187500n))), M.Q(m, 15187500n));
});

test('2026 with Mādhava\'s sine: exact to the spanda, within half a minute of the table, and 2.47-2.49\'s rate converges faster', () => {
  const M = SG.withSine('madhava'), T = SG.withSine('table');                  // the engine's sine and the text's table, by name
  const t0 = K.kaliDayFromCivil({ calendar: 'gregorian', year: 2026, month: 1, day: 1 });
  const secPerTau = SG.toNum(SG.daysOfTau(1000000000000n)) / 1e12 * 86400;
  let t = t0, n = 0, maxSec = 0;
  while (t < t0 + 365) {
    const fl = P.syzygyNear(t, 0, +1);
    const a = T.tithiEnd(30, fl), b = M.tithiEnd(30, fl);
    assert.equal(M.limbs(b - 1n).tithi, 30); assert.equal(M.limbs(b).tithi, 1);
    maxSec = Math.max(maxSec, Math.abs(Number(b - a)) * secPerTau);
    const d = T.parvaByIteration(30, fl - 0.4), x = T.parvaByIteration(30, fl - 0.4, { rate: 'text' });
    assert.equal(x.tau, a, 'the text\'s rate lands on the same spanda');
    assert.ok(x.steps <= d.steps && x.steps <= 4, `steps: text ${x.steps}, difference ${d.steps}`);
    assert.equal(M.parvaByIteration(30, fl - 0.4, { rate: 'text' }).tau, b);
    n++; t = fl + 20;
  }
  assert.ok(n >= 12);
  assert.ok(maxSec > 5 && maxSec < 40, `the two sines differ by up to ${maxSec.toFixed(1)} s`);
});

test('SS 2.48: within a step the tabular difference ÷ 225 is the exact slope of the interpolated sine; 2.49\'s signs', () => {
  for (const m of [100n, 1000n, 3000n, 5300n]) {
    const i = m / 225n, h = SG.Q(1n, 1000n);
    const slope = SG.div(SG.sub(SG.jyaQ(SG.add(SG.Q(m), h)), SG.jyaQ(SG.Q(m))), h);
    assert.deepEqual(slope, SG.Q(BigInt(S.JYA[Number(i) + 1] - S.JYA[Number(i)]), 225n));
  }
  // the Moon's true motion swings about its mean by the epicycle: fastest near perigee, slowest near apogee
  const mean = 57753336 * 21600 / 1582237828;
  const g = []; for (let k = 0; k < 30; k++) g.push(SG.toNum(SG.gati(2000000000000000000n + BigInt(k) * 328050000000n).moon));
  assert.ok(Math.min(...g) < mean && Math.max(...g) > mean);
  assert.ok(Math.max(...g) - Math.min(...g) > 100 && Math.max(...g) - Math.min(...g) < 220, 'about 2 × 32/360 × 790′ × the kendra rate');
});
