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

// ── the lunisolar year (2026-10-08, owner decision D3: amānta months with adhika/kṣaya; years from the nija Caitra) ─────
const ymd = (t) => { const c = K.civilFromKaliDay(Math.floor(t), 'gregorian'); return `${c.year}-${String(c.month).padStart(2, '0')}-${String(c.day).padStart(2, '0')}`; };
const label = (m) => (m.adhika ? 'adhika ' : '') + m.name + (m.kshaya ? ` (kṣaya, ${m.kshayaDropped} dropped)` : '');
function checkYear(y) {
  assert.equal(Math.round(4320000 * y.start / 1577917828), y.k, 'the count exactDay uses');
  assert.ok(y.months.length === 12 || y.months.length === 13, `${y.k}: ${y.months.length} months`);
  assert.equal(y.months[0].start, y.start); assert.equal(y.months.at(-1).end, y.end);
  assert.equal(y.months[0].name, 'Caitra'); assert.equal(y.months[0].adhika, false, 'the year opens with the nija Caitra');
  for (let i = 1; i < y.months.length; i++) assert.equal(y.months[i].start, y.months[i - 1].end, 'contiguous');
  for (const m of y.months) {
    assert.ok(m.end - m.start > 29 && m.end - m.start < 30, `${y.k} ${m.name}: ${m.end - m.start}`);
    assert.ok(m.fullMoon > m.start && m.fullMoon < m.end); assert.equal(typeof m.fullMoonNakshatra, 'string');
    assert.ok(Number.isFinite(m.marginMinutes) && m.marginMinutes >= 0);
    const inside = y.sankrantis.filter((s) => s.at >= m.start && s.at < m.end).length;
    assert.equal(m.adhika, inside === 0, `${y.k} ${label(m)}: adhika ⇔ no saṅkrānti`);
    assert.equal(m.kshaya, inside >= 2, `${y.k} ${label(m)}: kṣaya ⇔ two`);
  }
  assert.equal(y.sankrantis.length, 12);
  y.sankrantis.forEach((s, i) => { assert.equal(s.index, i); assert.ok(s.at >= y.start && s.at < y.end); if (i) assert.ok(s.at > y.sankrantis[i - 1].at); });
  assert.equal(y.shakaGone, y.k - 3179); assert.equal(y.vikramaGone, y.k - 3044);
  assert.match(y.yearStartRule, /nija Caitra/); assert.match(y.yearStartRule, /unverified convention/);
}

test('[measured] Kali year 5127 (2026-27): from the nija Caitra new moon of 19 March 2026, thirteen months with adhika Jyeṣṭha from 17 May; Śaka 1948, Vikrama 2083', () => {
  const y = A.yearOfKali(5127, P);
  checkYear(y);
  assert.equal(ymd(y.start), '2026-03-19'); assert.equal(ymd(y.end), '2027-04-07');
  assert.equal(y.shakaGone, 1948); assert.equal(y.vikramaGone, 2083);
  assert.equal(A.KALI_SHAKA, 3179); assert.equal(A.KALI_VIKRAMA, 3044);
  assert.deepEqual(y.months.map(label), ['Caitra', 'Vaiśākha', 'adhika Jyeṣṭha', 'Jyeṣṭha', 'Āṣāḍha', 'Śrāvaṇa', 'Bhādrapada', 'Āśvina', 'Kārttika', 'Mārgaśīrṣa', 'Pauṣa', 'Māgha', 'Phālguna']);
  assert.equal(ymd(y.months[2].start), '2026-05-17');
  assert.ok(y.mesha > y.start && y.mesha < y.months[0].end, 'the Meṣa saṅkrānti falls in the first month');
  // the same months as lunarMonth gives day by day
  for (const m of y.months) { const l = P.lunarMonth(m.start + 1); assert.equal(l.name, m.name); assert.equal(l.adhika, m.adhika); assert.equal(l.kshaya, m.kshaya); }
});

test('[measured] Kali year 5129 (2028-29): adhika Kārttika, a kṣaya Mārgaśīrṣa dropping Pauṣa, and a final adhika Caitra that closes the year (the convention, labelled)', () => {
  const y = A.yearOfKali(5129, P);
  checkYear(y);
  assert.equal(y.months.length, 13);
  assert.deepEqual(y.months.map(label), ['Caitra', 'Vaiśākha', 'Jyeṣṭha', 'Āṣāḍha', 'Śrāvaṇa', 'Bhādrapada', 'Āśvina', 'adhika Kārttika', 'Kārttika',
    'Mārgaśīrṣa (kṣaya, Pauṣa dropped)', 'Māgha', 'Phālguna', 'adhika Caitra']);
  assert.equal(ymd(y.months[7].start), '2028-10-18'); assert.equal(ymd(y.months[9].start), '2028-12-16'); assert.equal(ymd(y.months[12].start), '2029-03-15');
  assert.ok(y.months[9].marginMinutes < 30, `the kṣaya rests on a saṅkrānti ${y.months[9].marginMinutes.toFixed(0)} minutes from the new moon`);
  const next = A.yearOfKali(5130, P);
  assert.equal(next.start, y.end, 'the next year starts where this one ends'); checkYear(next);
});

test('lunarYear(t) is the year holding t; consecutive years tile the time line, 1990-2010', () => {
  let y = A.lunarYear(K.kaliDayFromCivil({ calendar: 'gregorian', year: 1990, month: 6, day: 1 }), P);
  for (let i = 0; i < 20; i++) {
    checkYear(y);
    for (const t of [y.start, y.start + 100.3, y.end - 1e-3]) assert.equal(A.lunarYear(t, P).k, y.k);
    const n = A.yearOfKali(y.k + 1, P);
    assert.equal(n.start, y.end); y = n;
  }
  assert.throws(() => A.yearOfKali(5127.5, P), TypeError);
  assert.throws(() => A.yearOfKali(5127, {}), TypeError);
  assert.throws(() => A.lunarYear(NaN, P), TypeError);
});
