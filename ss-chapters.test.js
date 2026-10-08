'use strict';
/*
 * ss-chapters.test.js — what the Sūrya-Siddhānta's later chapters say, checked against the text's own numbers.
 * Every input here is a number the text states (corpus/surya-siddhanta/numbers.json, decoded from the verse words) or
 * the text's own sine table (sphuta.js). No ephemeris. Each test is one finding of the 2026-10-07 chapter review, and
 * the edition (editions/surya-siddhanta-full-edition.html) carries a dated correction note for each.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
// This suite checks the text as written: its 24-entry sine table (withSine('table')). The engine's default sine is
// Mādhava's (owner, 2026-10-07); ss-madhava.test.js measures what that changes.
const S = require('./sphuta.js').withSine('table');
const reg = JSON.parse(fs.readFileSync(path.join(__dirname, 'corpus', 'surya-siddhanta', 'numbers.json'), 'utf8'));
const item = (v, i) => reg.verses.find((x) => x.v === v).items[i].n;
const R = S.R, EPS_JYA = item('2.28', 0);                                  // 3438, 1397

test('12.81-12.90: the Moon\'s orbit is 324,000 (kha-traya = three zeros); the sky-orbit, every orbit and the stars follow', () => {
  const moonOrbit = BigInt(item('12.85', 0)), sky = BigInt(item('12.90', 0)), KALPA = 1000n;
  assert.equal(moonOrbit, 324000n);
  assert.equal(BigInt(item('1.30', 0)) * KALPA * moonOrbit, sky, '12.81: Moon\'s kalpa revolutions × its orbit = the number of 12.90');
  // 12.82: each orbit = sky ÷ kalpa revolutions; the printed orbits are those quotients rounded
  const orbits = [['1.29', 0, '12.86', 1], ['1.30', 1, '12.87', 0], ['1.33', 0, '12.87', 1], ['1.31', 1, '12.88', 0], ['1.33', 1, '12.88', 1], ['1.32', 1, '12.89', 0], ['1.32', 0, '12.86', 0]];
  for (const [rv, ri, ov, oi] of orbits) {
    const q = Number(sky * 1000n / (BigInt(item(rv, ri)) * KALPA)) / 1000;
    assert.ok(Math.abs(q - item(ov, oi)) <= 0.5, `${ov}: ${item(ov, oi)} vs ${q}`);
  }
  const mercury = Number(sky * 1000n / (BigInt(item('1.31', 0)) * KALPA)) / 1000;  // the text's own 1.2-yojana discrepancy
  assert.ok(Math.abs(mercury - item('12.85', 1)) < 1.5 && Math.abs(mercury - item('12.85', 1)) > 0.5);
  // 12.80: the stars' orbit = 60 × the Sun's, exactly — 259,890,012, not the 25,980,012 once printed
  assert.equal(sky * 60n % (BigInt(item('1.29', 0)) * KALPA), 0n);
  assert.equal(sky * 60n / (BigInt(item('1.29', 0)) * KALPA), BigInt(item('12.89', 1)));
  // 12.83: linear daily motion × Moon's orbit ÷ own orbit ÷ 15 = minutes; for the Moon it is its mean daily motion, because 324,000 ÷ 15 = 21,600
  assert.equal(moonOrbit / 15n, 21600n);
  const kalpaDays = BigInt(item('1.37', 0)) * KALPA;
  const lhs = Number(sky) / Number(kalpaDays) / 15, rhs = item('1.30', 0) * 21600 / item('1.37', 0);
  assert.ok(Math.abs(lhs - rhs) < 1e-9, `${lhs} = ${rhs} minutes a day`);
});

test('12.84: bhūkarṇa is the Earth\'s diameter (1.59); orbit × 1600 ÷ circumference − 1600, halved, is the height', () => {
  const C = 1600 * Math.sqrt(10), karna = item('12.85', 0) * 1600 / C;
  assert.ok(Math.abs((karna - 1600) / 2 - 50428.9) < 0.1);
  assert.ok(Math.abs(karna * Math.sqrt(10) - item('12.85', 0)) < 1e-6, 'the karṇa is the orbit\'s diameter on the text\'s circumference/diameter = √10');
});

test('3.42-3.44: the Laṅkā risings 1670, 1795, 1935 follow from the text\'s 1397 with the day-radius of three signs', () => {
  const D = (deg) => { const kj = S.jya(deg) * EPS_JYA / R; return Math.sqrt(R * R - kj * kj); };
  const arcs = [30, 60, 90].map((l) => S.arcminOfJya(Math.min(R, S.jya(l) * D(90) / D(l))));
  const risings = [arcs[0], arcs[1] - arcs[0], arcs[2] - arcs[1]];
  for (let i = 0; i < 3; i++) assert.ok(Math.abs(risings[i] - item('3.44', i)) < 1, `${item('3.44', i)} vs ${risings[i].toFixed(1)}`);
  assert.ok(Math.abs(risings.reduce((a, b) => a + b) - 5400) < 1e-9, 'a quarter of the turn');
  const halfR = S.arcminOfJya(S.jya(30) * (R / 2) / D(30));                   // the reading the edition once used
  assert.ok(Math.abs(halfR - 1670) > 700, `R/2 gives ${halfR.toFixed(0)}`);
});

test('3.9-3.10: thirty kṛtis = 600 librations a yuga, which is what makes 3.10\'s 54″ a year', () => {
  const rate = (n) => n * 4 * 27 * 3600 / item('1.29', 0);                    // arcseconds a year: 4 quarters of 27° per libration
  assert.equal(rate(30 * 20), 54);
  assert.equal(rate(30), 2.7);
});

test('1.52: (2N + 1) and (3N + 1) counted from Sunday = 1 are the weekdays on which month and year N + 1 begin', () => {
  for (let N = 0; N < 2000; N++) {
    assert.equal((30 * N) % 7, ((2 * N + 1) % 7 + 6) % 7, `month ${N}`);    // weekday from Sunday = 0 ↔ remainder from Sunday = 1
    assert.equal((360 * N) % 7, ((3 * N + 1) % 7 + 6) % 7, `year ${N}`);
  }
});

test('2.53-2.55: the text\'s own śīghra model puts the stations near 2.53 for four planets — and Venus near 167°, not 83°', () => {
  const sun = item('1.29', 0);
  const P = {   // [revolutions, superior?, śīghra epicycle even end, odd end (2.36-2.37), 2.53, 2.55's sign]
    mars: [item('1.30', 1), true, item('2.36', 0), item('2.37', 0), item('2.53', 0), 7],
    mercury: [item('1.31', 0), false, item('2.36', 1), item('2.37', 1), item('2.53', 1), 8],
    jupiter: [item('1.31', 1), true, item('2.36', 2), item('2.37', 2), item('2.53', 2), 8],
    venus: [item('1.32', 0), false, item('2.36', 3), item('2.37', 3), item('2.53', 3), 7],
    saturn: [item('1.32', 1), true, item('2.36', 4), item('2.37', 4), item('2.53', 4), 9],
  };
  // śīghra phala by the text (2.38-2.42): dorphala, koṭiphala on the varying epicycle, karṇa, arc of dorphala·R/karṇa
  const phala = (k, pe, po) => {
    const bj = S.jya(k), kj = S.jya(k + 90), p = pe - (pe - po) * Math.abs(bj) / R;
    const dp = bj * p / 360, K = Math.hypot(R + kj * p / 360, dp);
    return Math.sign(bj || 1) * S.arcminOfJya(Math.min(R, Math.abs(dp) * R / K)) / 60;
  };
  const sign = (k) => Math.floor((360 - k) / 30) + 1;                          // the planet's sign counted from its śīghrocca
  const station = {};
  for (const [name, [rev, sup, pe, po, text, house]] of Object.entries(P)) {
    const nMean = sup ? rev : sun, nKendra = sup ? sun - rev : rev - sun;     // mean motion of the planet, and of its kendra
    let prev = null;
    for (let k = 1; k < 180; k += 0.01) {
      const v = nMean + (phala(k + 0.005, pe, po) - phala(k - 0.005, pe, po)) / 0.01 * nKendra;
      if (prev !== null && prev > 0 && v <= 0) { station[name] = k; break; }
      prev = v;
    }
    assert.equal(sign(station[name]), house, `${name}: the model's station is in 2.55's sign`);
    if (name !== 'venus') assert.equal(sign(text), house, `${name}: 2.53's ${text}° is in 2.55's sign`);
  }
  assert.ok(Math.abs(station.mars - 164) < 1 && Math.abs(station.mercury - 144) < 3 && Math.abs(station.saturn - 115) < 3 && Math.abs(station.jupiter - 130) < 7);
  assert.ok(Math.abs(station.venus - 167) < 1.5, `Venus ${station.venus}`);
  assert.equal(item('2.53', 3), 83, 'the transmitted word guṇa-aṣṭa');
  assert.equal(sign(83), 10, '83° would put Venus in the tenth sign, against 2.55\'s seventh');
});

test('2.15-2.16: the literal recursion (second difference = sine ÷ 225) does not reproduce the 2.17-2.22 table', () => {
  const J = [225]; let d = 225;
  for (let n = 1; n < 24; n++) { d -= J[n - 1] / 225; J.push(J[n - 1] + d); }
  assert.equal(Math.round(J[6]), S.JYA[7]);                                   // the first seven agree
  assert.equal(Math.round(J[7]), 1717); assert.equal(S.JYA[8], 1719);
  assert.ok(Math.abs(J[23] - 3375) < 1 && S.JYA[24] === 3438, `the 24th is ${J[23].toFixed(1)}, 63′ short`);
});

test('12.63, 12.65: the declinations of two signs and of one sign put the lines at 69.4° and 78.3°, not 42°', () => {
  const C = 1600 * Math.sqrt(10);
  const lat = (signs) => { const d = S.arcminOfJya(S.jya(30 * signs) * EPS_JYA / R) / 60; return (C / 4 - C * d / 360) / C * 360; };
  assert.ok(Math.abs(lat(2) - 69.37) < 0.01 && Math.abs(lat(1) - 78.28) < 0.01);
});

test('7.13: thirty increased by quarters of thirty — 30, 37½, 45, 52½ — and the next step is Venus\'s 60', () => {
  const d = [0, 1, 2, 3, 4].map((k) => 30 + k * 30 / 4);
  assert.deepEqual(d, [30, 37.5, 45, 52.5, 60]);
});
