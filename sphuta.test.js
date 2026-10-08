'use strict';
/*
 * sphuta.test.js — the true Sun and Moon of the Sūrya-Siddhānta (sphuta.js) against the text's own numbers.
 * The sine table must be the one decoded from the verse words (corpus/surya-siddhanta/numbers.json); the epoch places,
 * the largest equations and the ayanāṃśa must follow from the verse integers by independent arithmetic.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
const S = require('./sphuta.js');
const reg = JSON.parse(fs.readFileSync(path.join(__dirname, 'corpus', 'surya-siddhanta', 'numbers.json'), 'utf8'));
const verse = (v) => reg.verses.find((x) => x.v === v).items.map((x) => x.n);
const YEAR_DAYS = 1577917828 / 4320000;

test('the sine table is the one decoded from SS 2.17-2.22, and R is 3438', () => {
  const sines = ['2.17', '2.18', '2.19', '2.20', '2.21', '2.22'].flatMap(verse);
  assert.deepEqual([...S.JYA], [0, ...sines]);
  assert.equal(S.R, 3438);
  assert.equal(S.JYA[24], S.R);
});

test('epicycles and the Moon\'s greatest latitude are the verse numbers (2.34-2.35, 1.68)', () => {
  const ep = verse('2.35');                       // even ends of Sun, Moon … then odd ends, per the register
  assert.equal(S.PARIDHI.sun[0], 14); assert.equal(S.PARIDHI.moon[0], 32);
  assert.equal(S.PARIDHI.sun[1], 13 + 40 / 60); assert.equal(S.PARIDHI.moon[1], 31 + 40 / 60);
  assert.ok(ep.length >= 10);
  assert.equal(S.MOON_MAX_LATITUDE_ARCMIN, 270);
});

test('at the Kali epoch the mean Sun and Moon are at Meṣa 0, the Moon\'s apogee at 90°, the node at 180°', () => {
  const m = S.madhyama(0n);
  assert.ok(Math.abs(m.sun) < 1e-9 || Math.abs(m.sun - 360) < 1e-9);
  assert.ok(Math.abs(m.moon) < 1e-9 || Math.abs(m.moon - 360) < 1e-9);
  // 452¾ yugas × revolutions, read as fractions of a turn, by plain integer arithmetic:
  const frac = (rev) => ((rev * 1811) % 4) / 4 * 360;
  assert.ok(Math.abs(m.moonApogee - frac(488203)) < 1e-9, `apogee ${m.moonApogee}`);
  assert.ok(Math.abs(m.node - (360 - frac(232238)) % 360) < 1e-9, `node ${m.node}`);
  assert.equal(frac(488203), 90); assert.equal(frac(232238), 180);
  // the Sun's apogee: 387 revolutions in a kalpa of 4,320,000,000 years, 1,955,880,000 years gone
  const sa = ((387 * 1955880000 / 4320000000) % 1) * 360;
  assert.ok(Math.abs(m.sunApogee - sa) < 1e-6, `sun apogee ${m.sunApogee} vs ${sa}`);
});

test('the BigInt mean places agree with a plain floating-point reading of the same integers', () => {
  for (const days of [1, 1000.25, 1872855.5, 1655645, 2000000.75]) {
    const m = S.madhyama(S.spandasOfDays(days));
    const f = (rev) => (((rev * days / 1577917828) % 1) + 1) % 1 * 360;
    for (const [k, rev] of [['sun', 4320000], ['moon', 57753336]]) {
      const d = Math.abs(((m[k] - f(rev) + 540) % 360) - 180);
      assert.ok(d < 1e-6, `${k} at ${days}: ${m[k]} vs ${f(rev)}`);
    }
  }
});

test('the largest equations are arc(R × odd-end epicycle ÷ 360): 2°10′31″ for the Sun, 5°2′46″ for the Moon', () => {
  const big = (p) => S.arcminOfJya(S.R * p / 360) / 60;
  let maxSun = 0, maxMoon = 0;
  for (let k = 0; k < 3600; k++) {
    const kd = k / 10;
    maxSun = Math.max(maxSun, Math.abs(S.mandaPhala(0, kd, S.PARIDHI.sun).degrees));
    maxMoon = Math.max(maxMoon, Math.abs(S.mandaPhala(0, kd, S.PARIDHI.moon).degrees));
  }
  assert.ok(Math.abs(maxSun - big(S.PARIDHI.sun[1])) < 2e-3, `${maxSun} vs ${big(S.PARIDHI.sun[1])}`);
  assert.ok(Math.abs(maxMoon - big(S.PARIDHI.moon[1])) < 2e-3, `${maxMoon} vs ${big(S.PARIDHI.moon[1])}`);
  assert.ok(Math.abs(maxSun - 2.1753) < 2e-3); assert.ok(Math.abs(maxMoon - 5.046) < 2e-3);
});

test('the ayanāṃśa is 0 at the Kali epoch and in Kali 3600, 27° at its greatest, 14°2′ in Kali 4536 (SS 3.9-3.10)', () => {
  const at = (years) => S.ayanamshaSS(S.spandasOfDays(years * YEAR_DAYS));
  assert.ok(Math.abs(at(0)) < 1e-9);
  assert.ok(Math.abs(at(3600)) < 1e-6);
  assert.ok(Math.abs(Math.abs(at(3600 + 1800)) - 27) < 1e-6);
  assert.ok(Math.abs(Math.abs(at(4536)) - 14.04) < 1e-6);
});

test('the Moon\'s latitude never exceeds 270′', () => {
  for (let d = 1872000; d < 1872400; d += 0.37) assert.ok(Math.abs(S.sphutaAtDays(d).moonLatitude) <= 4.5 + 1e-9);
});
