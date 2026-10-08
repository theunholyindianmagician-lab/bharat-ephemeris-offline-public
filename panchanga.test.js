'use strict';
/*
 * panchanga.test.js — the five limbs, the lunar month and sunrise on the Sūrya-Siddhānta's own wheel (panchanga.js).
 * The referees are the text's own counts (SS 1.34-1.40, 2.64-2.68) and the dated Indian eclipse records of the
 * Jyotirmīmāṃsā corpus — not a modern ephemeris.
 */
const assert = require('node:assert/strict');
const { test } = require('node:test');
const P = require('./panchanga.js');
const K = require('./kala-dvara.js');
const eclipses = require('./corpus/jyotirmimamsa/eclipses.json');
const UJJAYINI = { latitude: 23 + 10 / 60 + 48 / 3600, deshantara: 0 };
const N2026 = K.kaliDayFromCivil({ calendar: 'gregorian', year: 2026, month: 1, day: 1 });
const mod = (a, m) => ((a % m) + m) % m;

test('each limb is its span of the circle: tithi 12°, nakṣatra and yoga 800′, karaṇa 6°, pāda 200′ (SS 2.64-2.68)', () => {
  for (let t = N2026; t < N2026 + 60; t += 0.731) {
    const L = P.limbsAt(t);
    assert.equal(L.tithi, Math.floor(mod(L.moon - L.sun, 360) / 12) + 1);
    assert.equal(L.nakshatra, Math.floor(L.moon / (800 / 60)) + 1);
    assert.equal(L.pada, Math.floor(mod(L.moon, 800 / 60) / (200 / 60)) + 1);
    assert.equal(L.yoga, Math.floor(mod(L.sun + L.moon, 360) / (800 / 60)) + 1);
    assert.equal(L.karana, Math.floor(mod(L.moon - L.sun, 360) / 6) + 1);
  }
});

test('karaṇas: Kiṃstughna first, Bava…Viṣṭi eight times, then Śakuni, Nāga, Catuṣpada (SS 2.67 order)', () => {
  const names = Array.from({ length: 60 }, (_, i) => P.karanaName(i + 1));
  assert.equal(names[0], 'Kiṃstughna');
  assert.deepEqual(names.slice(57), ['Śakuni', 'Nāga', 'Catuṣpada']);
  for (let i = 1; i <= 56; i++) assert.equal(names[i], P.KARANA_MOVABLE[(i - 1) % 7]);
  assert.equal(names.filter((n) => n === 'Viṣṭi').length, 8);
});

test('thirty years of lunar months: the mean length is the text\'s (1.37 ÷ 1.38), and adhika months come at its rate', () => {
  let t = K.kaliDayFromCivil({ calendar: 'gregorian', year: 2000, month: 1, day: 10 });
  const end = K.kaliDayFromCivil({ calendar: 'gregorian', year: 2030, month: 1, day: 10 });
  const first = P.lunarMonth(t).start; let n = 0, adhika = 0, last, prevName = null;
  const ORDER = P.MONTH;
  while (t < end) {
    const m = P.lunarMonth(t);
    assert.ok(m.end - m.start > 29.1 && m.end - m.start < 30.0, `month length ${m.end - m.start}`);
    if (m.adhika) adhika++;
    else if (prevName) assert.ok(m.name === ORDER[(ORDER.indexOf(prevName) + 1) % 12] || m.kshaya || m.name === prevName, `${prevName} → ${m.name}`);
    if (!m.adhika) prevName = m.kshaya ? m.kshayaDropped : m.name;
    n++; last = m.end; t = m.end + 1;
  }
  const meanText = 1577917828 / 53433336;
  assert.ok(Math.abs((last - first) / n - meanText) < 0.002, `mean month ${(last - first) / n} vs ${meanText}`);
  const expected = 30 * 1593336 / 4320000;                       // adhimāsas per year, SS 1.38-1.39
  assert.ok(Math.abs(adhika - expected) <= 1.5, `${adhika} adhika vs ${expected.toFixed(2)}`);
});

test('the month of 2 April 2026: Caitra by its saṅkrānti, Phālguna by SS 14.16\'s full-moon nakṣatra (Hasta)', () => {
  const m = P.lunarMonth(K.kaliDayFromCivil({ calendar: 'gregorian', year: 2026, month: 4, day: 2 }));
  assert.equal(m.name, 'Caitra');
  assert.equal(m.fullMoonNakshatra, 'Hasta');
  assert.equal(m.nameByFullMoonNakshatra, 'Phālguna');
  assert.equal(m.agree, false);
  const j = P.lunarMonth(K.kaliDayFromCivil({ calendar: 'gregorian', year: 2026, month: 6, day: 1 }));
  assert.equal(j.adhika, true); assert.equal(j.name, 'Jyeṣṭha');
});

test('every recorded eclipse sits by a node at the right syzygy; SDip-82 stays the corpus\'s flagged exception', () => {
  const far = [];
  for (const r of eclipses.records) {
    const target = r.kind === 'solar' ? 0 : 180;
    const at = P.syzygyNear(r.printed_number - 2, target, +1);
    const p = P.placesAt(at);
    const d = mod(p.moon - p.rahu, 180), node = Math.min(d, 180 - d);
    assert.ok(node < 14, `${r.id}: Moon ${node.toFixed(2)}° from the node`);
    if (Math.abs(at - r.printed_number) > 1) far.push(r.id);
  }
  assert.deepEqual(far, ['SDip-82']);
  assert.ok(eclipses.records.find((r) => r.id === 'SDip-82').flag);
});

test('sunrise on the turn about the dhruva: at Laṅkā day and night are 30 civil ghaṭīs; sunrise to sunrise is 60.16 nāḍīs of the turn, give or take the drift of sunrise', () => {
  for (let N = N2026; N < N2026 + 365; N += 37) {
    const p = P.panchanga(N, { latitude: 0, deshantara: 0 });
    assert.ok(Math.abs(p.dayGhatiCivil - 30) < 0.06, `day ${p.dayGhatiCivil}`);
    const q = P.panchanga(N, UJJAYINI);
    assert.ok(Math.abs(q.dayGhati + q.nightGhati - 60 * 1582237828 / 1577917828) < 0.1, `turn nāḍīs ${q.dayGhati + q.nightGhati}`);
  }
  assert.equal(P.NADI_DAYS, 1577917828 / (60 * 1582237828));
});

test('7 October 2026 at Ujjayinī: Budhavāra, kṛṣṇa Dvādaśī into Trayodaśī, Moon in Maghā, month Bhādrapada', () => {
  const p = P.panchanga(K.kaliDayFromCivil({ calendar: 'gregorian', year: 2026, month: 10, day: 7 }), UJJAYINI);
  assert.equal(p.vara, 'budhavāra');
  assert.equal(p.tithi[0].name, 'Dvādaśī'); assert.equal(p.tithi[0].paksha, 'kṛṣṇa');
  assert.equal(p.tithi[1].name, 'Trayodaśī');
  assert.equal(p.nakshatra[0].name, 'Maghā');
  assert.equal(p.month.name, 'Bhādrapada');
  assert.equal(p.tithi[0].endAfterSunrise.unit, 'nāḍī of the turn (SS 1.11-1.12)');
});
