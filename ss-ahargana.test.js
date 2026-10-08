'use strict';
/*
 * ss-ahargana.test.js — SS 1.48-1.52 and 12.78-79: the day-count from a lunisolar date, and the lords. The yuga numbers
 * are the text's; the lunisolar dates come from the pañcāṅga (panchanga.js, the text's own Sun and Moon); the actual day
 * number and weekday from kala-dvara.js.
 */
const assert = require('node:assert/strict');
const { test } = require('node:test');
const A = require('./ss-ahargana.js');
const K = require('./kala-dvara.js');
const P = require('./panchanga.js');

test('[THEOREM 1.45-1.51] creation is a Sunday; 452¾ yugas = 714,402,296,627 days later the Kali epoch is a Friday, as kala-dvara reckons it', () => {
  assert.equal(A.DAYS_TO_KALI, 714402296627n);
  assert.equal(A.lordsOfKaliDay(0).day, 'Śukra');
  assert.equal(K.varaOfKaliDay(0).index, 5);
  for (const N of [0, 1, 6, 100, 1872855, 1873000]) assert.equal(A.lordsOfKaliDay(N).dayIndex, K.varaOfKaliDay(N).index, `day ${N}`);
});

test('[THEOREM 1.51-1.52 = 12.78-79] the two chapters give the same lords: every fourth down the orbits = +1 weekday, every third = +3 (360 ≡ 3), upward from the Moon = +2 (30 ≡ 2); horā lords cycle so that 24 horās later the next day\'s lord is first', () => {
  for (let d = 0n; d < 2000n; d++) {
    const a = A.lords(d), b = A.lords(d + 1n);
    assert.equal(b.day, A.nextDayLord(a.day));
    if ((d + 1n) % 30n === 0n) assert.equal(A.lords(d + 1n).month, A.nextMonthLord(A.lords(d).month));
    if ((d + 1n) % 360n === 0n) assert.equal(A.lords(d + 1n).year, A.nextYearLord(A.lords(d).year));
    assert.equal(A.horaLord(a.day, 24), b.day, '24 horās later');
    assert.equal(A.horaLord(a.day, 0), a.day, 'the first horā is the day lord\'s');
  }
  assert.deepEqual([...A.ORBIT_DOWN], ['Śani', 'Guru', 'Maṅgala', 'Sūrya', 'Śukra', 'Budha', 'Candra']);
  // 1.52's example in the edition, as corrected: N months 5 → Budha, N years 4 → Śukra
  assert.equal(A.lords(150n).month, 'Budha'); assert.equal(A.lords(1440n).year, 'Śukra');
});

test('[MEASURED 1.48-1.50] the text\'s day-count from the lunisolar date, 2024-2026: the exact day on most days, ±1 on the rest (the weekday then fixes it), and a month ahead only where the mean adhimāsa precedes the true adhika month (Vaiśākha and adhika Jyeṣṭha 2026)', (t) => {
  const revs = (x) => 4320000 * x / 1577917828;
  const t0 = K.kaliDayFromCivil({ calendar: 'gregorian', year: 2024, month: 1, day: 1 });
  const hist = {}; let fixed = 0, n = 0; const monthOff = new Set();
  const caitraOf = new Map();                                   // the nija Caitra that opens the year of each month
  for (let N = t0; N < t0 + 3 * 365; N++) {
    const tt = N + 0.0001, m = P.lunarMonth(tt);
    if (!caitraOf.has(m.start)) { let mm = m, g = 0; while (!(mm.name === 'Caitra' && !mm.adhika)) { mm = P.lunarMonth(mm.start - 1); if (++g > 14) throw new Error('no Caitra'); } caitraOf.set(m.start, mm); }
    const caitra = caitraOf.get(m.start);
    const r = A.aharganaFromKali({ kaliYearsGone: Math.round(revs(caitra.start)), monthsSinceCaitra: P.MONTH.indexOf(m.name), tithisGone: P.limbsAt(tt).tithi - 1 });
    const d = Number(r.kaliDay) - N; hist[d] = (hist[d] || 0) + 1; n++;
    const w = K.varaOfKaliDay(N).index;
    const c = Math.abs(d) <= 1 ? A.byWeekday(r.kaliDay, w) : A.byWeekday(r.kaliDay, w, { monthShift: -1 });
    if (c !== null && Number(c) === N) fixed++;
    if (Math.abs(d) > 1) { const cv = K.civilFromKaliDay(N, 'gregorian'); monthOff.add(`${cv.year} ${m.name}${m.adhika ? ' (adhika)' : ''}`); }
  }
  assert.ok(hist[0] / n > 0.65, JSON.stringify(hist));
  assert.ok(Object.keys(hist).every((k) => Math.abs(k) <= 1 || k === '29' || k === '30'), JSON.stringify(hist));
  assert.deepEqual([...monthOff].sort(), ['2026 Jyeṣṭha (adhika)', '2026 Vaiśākha']);
  assert.equal(fixed, n, 'with the weekday (and the month shift where the mean adhimāsa is ahead) every day is recovered');
  t.diagnostic(`1.48-1.50 against the actual day, ${n} days: ${JSON.stringify(hist)}; after the weekday check: ${fixed}/${n}`);
});

test('[READING 12.79] the horā at a moment: equal horās of the day from sunrise by default; unequal on request', () => {
  const site = { latitude: 23.18, deshantara: 0.05 }, N = K.kaliDayFromCivil({ calendar: 'gregorian', year: 2026, month: 10, day: 7 });
  const rise = P.sunrise(N, site), next = P.sunrise(N + 1, site), set = P.sunset(N, site);
  const h0 = A.horaAt(rise + 1e-6, N, rise, next), h1 = A.horaAt(rise + (next - rise) / 24 + 1e-6, N, rise, next);
  assert.equal(h0.hora, 1); assert.equal(h0.lord, h0.dayLord); assert.equal(h1.lord, A.horaLord(h0.dayLord, 1));
  assert.equal(h0.dayLord, 'Budha', '2026-10-07 is a Wednesday');
  const u = A.horaAt(set + 1e-6, N, rise, next, { unequal: true, sunset: set });
  assert.equal(u.hora, 13);
});

test('[decision 31] exactDay: the true civil day of a lunisolar date by the true calendar — every sampled day of 2024-2026 recovered, the adhika Jyeṣṭha of 2026 included, where 1.49\'s mean count runs a month ahead', () => {
  const revs = (x) => 4320000 * x / 1577917828;
  const t0 = K.kaliDayFromCivil({ calendar: 'gregorian', year: 2024, month: 1, day: 1 });
  const caitraOf = (m) => { let mm = m; while (!(mm.name === 'Caitra' && !mm.adhika)) mm = P.lunarMonth(mm.start - 1); return mm; };
  let n = 0, monthOff = 0;
  for (let N = t0; N < t0 + 3 * 365; N += 5) {
    const t = N + 1e-4, m = P.lunarMonth(t);
    const date = { kaliYearsGone: Math.round(revs(caitraOf(m).start)), month: m.name, adhika: !!m.adhika, tithi: P.limbsAt(t).tithi };
    const r = A.exactDay(date, P);
    assert.ok(r.candidates.includes(N), `${N}: ${JSON.stringify(r)}`);
    if (Math.abs(r.textCount - N) > 1) monthOff++;
    n++;
  }
  assert.ok(n > 200 && monthOff > 5, `${monthOff} of ${n} where the text's count is a month off`);
  assert.throws(() => A.exactDay({ kaliYearsGone: 5127, month: 'Caitra', tithi: 1 }), TypeError);
});
