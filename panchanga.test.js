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

test('[P1] a count after sunrise is { ghati, vinadi, vipala }: the vināḍī is 1/60 ghaṭī (the pala of BPHS 5.8) and the vipala 1/60 vināḍī; no field is named pala', () => {
  let n = 0;
  for (let N = N2026; N < N2026 + 120; N += 7) {
    const p = P.panchanga(N, UJJAYINI);
    for (const key of ['tithi', 'nakshatra', 'yoga', 'karana']) {
      for (const x of p[key]) {
        if (x.end === null) continue;
        const e = x.endAfterSunrise;
        for (const [c, g] of [[e, (x.end - p.sunrise) / P.NADI_DAYS], [e.civil, (x.end - p.sunrise) * 60]]) {
          assert.deepEqual(Object.keys(c).filter((k) => ['ghati', 'vinadi', 'vipala', 'pala'].includes(k)), ['ghati', 'vinadi', 'vipala']);
          assert.ok(Number.isInteger(c.vinadi) && c.vinadi >= 0 && c.vinadi < 60 && Number.isInteger(c.vipala) && c.vipala >= 0 && c.vipala < 60);
          assert.ok(Math.abs(c.ghati + c.vinadi / 60 + c.vipala / 3600 - g) <= 0.5 / 3600 + 1e-9, `${key} ${N}: ${JSON.stringify(c)} vs ${g}`);
          n++;
        }
      }
    }
  }
  assert.ok(n > 300, `${n} counts`);
});

// ── the shared rules (2026-10-08): one month-naming rule, one meridian, one civil day ──────────────────
const MER = 75.7885;
const tIST = (y, m, d, h) => K.kaliDayFromCivil({ calendar: 'gregorian', year: y, month: m, day: d }) + (h - 5.5) / 24 + MER / 360;
const istOf = (t) => { const x = t - MER / 360 + 5.5 / 24, N = Math.floor(x), s = Math.round((x - N) * 86400); const c = K.civilFromKaliDay(N, 'gregorian');
  return `${c.year}-${String(c.month).padStart(2, '0')}-${String(c.day).padStart(2, '0')} ${String(Math.floor(s / 3600)).padStart(2, '0')}:${String(Math.floor(s / 60) % 60).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`; };

test('nameMonth is the one naming rule: it reproduces 68905b9\'s inline rule and lunarMonth for every month 2000-2030, and refuses what is not a month', () => {
  // 68905b9's lunarMonth named the month inline; that rule, verbatim, is the reference
  const oldRule = (sank, next) => (sank.length === 0 ? { name: P.MONTH[next], adhika: true } : { name: P.MONTH[sank[0]], adhika: false });
  let t = K.kaliDayFromCivil({ calendar: 'gregorian', year: 2000, month: 1, day: 10 }), n = 0, adhika = 0, kshaya = 0;
  const end = K.kaliDayFromCivil({ calendar: 'gregorian', year: 2030, month: 12, day: 31 });
  while (t < end) {
    const m = P.lunarMonth(t), idx = m.sankrantis.map((s) => s.index);
    const next = idx.length === 0 ? P.sankrantisBetween(m.end, m.end + 33)[0].index : undefined;
    const r = P.nameMonth(idx, next), o = oldRule(idx, next);
    assert.deepEqual(r, { name: m.name, adhika: m.adhika, kshaya: m.kshaya, kshayaDropped: m.kshayaDropped });
    assert.equal(r.name, o.name); assert.equal(r.adhika, o.adhika);
    assert.equal(r.kshaya, idx.length > 1); assert.equal(r.kshayaDropped, idx.length > 1 ? P.MONTH[idx[1]] : null);
    adhika += r.adhika; kshaya += r.kshaya; n++; t = m.end + 1;
  }
  assert.ok(n > 380 && adhika >= 10 && kshaya >= 1, `${n} months, ${adhika} adhika, ${kshaya} kṣaya`);
  assert.deepEqual(P.nameMonth([0]), { name: 'Caitra', adhika: false, kshaya: false, kshayaDropped: null });
  assert.deepEqual(P.nameMonth([], 2), { name: 'Jyeṣṭha', adhika: true, kshaya: false, kshayaDropped: null });
  assert.deepEqual(P.nameMonth([8, 9]), { name: 'Mārgaśīrṣa', adhika: false, kshaya: true, kshayaDropped: 'Pauṣa' });
  for (const bad of [[[]], [[], 12], [[12]], [[0, 1, 2]], [[0.5]], ['Meṣa']]) assert.throws(() => P.nameMonth(...bad), RangeError, JSON.stringify(bad));
});

test('civilDayOf: the civil day runs sunrise to sunrise (SS 14.18) — at Ujjayinī on 8 October 2026, 06:00 IST is still budhavāra and 06:30 is guruvāra', () => {
  const U0 = { latitude: 23.1765, deshantara: 0 };
  const a = P.civilDayOf(tIST(2026, 10, 8, 6), U0), b = P.civilDayOf(tIST(2026, 10, 8, 6.5), U0);
  assert.equal(a.vara.name, 'budhavāra'); assert.equal(istOf(a.sunrise), '2026-10-07 06:22:23');            // [measured]
  assert.equal(b.vara.name, 'guruvāra'); assert.equal(istOf(b.sunrise), '2026-10-08 06:22:46');             // [measured]
  assert.equal(b.N, a.N + 1); assert.deepEqual(K.civilFromKaliDay(b.N, 'gregorian'), { year: 2026, month: 10, day: 8 });
  assert.equal(a.nextSunrise, b.sunrise); assert.equal(a.polar, false); assert.match(a.rule, /SS 14\.18/);
  // every instant lies in its day, at Ujjayinī and away from the meridian
  for (const site of [U0, { latitude: 28.61, deshantara: 77.21 - MER }, { latitude: -33.9, deshantara: 18.4 - MER }, { latitude: 51.5, deshantara: -MER }]) {
    for (let t = N2026 + 0.013; t < N2026 + 400; t += 0.917) {
      const d = P.civilDayOf(t, site);
      assert.ok(d.sunrise <= t && t < d.nextSunrise, `${t}`);
      assert.equal(d.sunrise, P.sunrise(d.N, site)); assert.equal(d.vara.index, K.varaOfKaliDay(d.N).index);
    }
  }
  // polar: the local civil date, no times
  const POLAR = { latitude: 78.22, deshantara: 15.6 - MER }, t = tIST(2026, 6, 21, 12);
  const p = P.civilDayOf(t, POLAR);
  assert.equal(p.polar, true); assert.equal(p.sunrise, null); assert.equal(p.N, Math.floor(t + POLAR.deshantara / 360));
  assert.throws(() => P.civilDayOf(NaN, U0), TypeError);
});

test('meridianAt: the madhya-lagna\'s own right ascension (SS 3.42 at the point) is the meridian\'s, and lagnaAt stands on the same meridian (ramcOf)', () => {
  const U = require('./ss-udaya.js');
  const sines = { madhava: U.withSine('madhava'), text: U.withSine('table') };
  let worst = 0;
  for (let t = N2026; t < N2026 + 365; t += 0.731) {
    for (const how of ['madhava', 'text', 'text-linear', 'sphere']) {
      const m = P.meridianAt(t, UJJAYINI, { lagna: how }), r = P.ramcOf(t, UJJAYINI, { lagna: how });
      assert.equal(m.ramcDeg, r.ramcDeg);
      const UU = how === 'text' || how === 'text-linear' ? sines.text : sines.madhava;
      const d = Math.abs(mod(UU.rightAscension(mod(m.madhyaLagna.longitude + r.A, 360)) - r.ramcDeg * 60 + 10800, 21600) - 10800);
      worst = Math.max(worst, d);
      assert.equal(m.madhyaLagna.index, Math.floor(m.madhyaLagna.longitude / 30)); assert.equal(m.madhyaLagna.rashi, P.RASHI[m.madhyaLagna.index]);
    }
  }
  assert.ok(worst < 1e-6, `|RA(madhya-lagna) − RAMC| ≤ ${worst} asus`);
  assert.match(P.meridianAt(N2026, UJJAYINI, { lagna: 'sphere' }).method, /Mādhava's sine \(sphere asked/);
  // ramcOf is the meridian lagnaAt uses: the sphere's ascendant from ramcOf's meridian is lagnaAt's "sphere" lagna, bit for bit
  const D2R = Math.PI / 180, e = require('./dhruva.js').SS_EPSILON_DEG * D2R, phi = UJJAYINI.latitude * D2R;
  for (let t = N2026 + 0.1; t < N2026 + 3; t += 0.137) {
    const { A, ramcDeg } = P.ramcOf(t, UJJAYINI), ramc = ramcDeg * D2R;
    const asc = Math.atan2(Math.cos(ramc), -(Math.sin(ramc) * Math.cos(e) + Math.tan(phi) * Math.sin(e))) * (180 / Math.PI);
    assert.equal(P.lagnaAt(t, UJJAYINI, { lagna: 'sphere' }).longitude, mod(asc - A, 360));
    assert.equal(A, P.ayanamshaAt(t));
  }
});

test('in-range bit identity with commit 68905b9: panchanga(N), lagnaAt by all four methods and lunarMonth at 60 days from JDN 0 to Kali day 8,388,000 (test-fixtures/panchanga-days-68905b9.json)', () => {
  const fx = require('./test-fixtures/panchanga-days-68905b9.json');
  const J = (x) => JSON.parse(JSON.stringify(x));
  // The fixture is 68905b9's output as it was. Decision P1 (2026-10-08) renamed the third sexagesimal place of a count
  // after sunrise from 'pala' to 'vipala' (it is 1/60 vināḍī); only the name changed, so the old name is read as the new.
  const renamed = (x) => {
    if (Array.isArray(x)) return x.map(renamed);
    if (!x || typeof x !== 'object') return x;
    const out = {};
    for (const [k, v] of Object.entries(x)) out[k === 'pala' && 'vinadi' in x ? 'vipala' : k] = renamed(v);
    return out;
  };
  assert.equal(fx.days.length, 60); assert.match(fx.provenance, /68905b9/);
  for (const d of fx.days) {
    const pan = P.panchanga(d.N, fx.site);
    assert.deepStrictEqual(J(pan), renamed(d.panchanga), `panchanga ${d.N}`);
    for (const how of ['madhava', 'text', 'text-linear', 'sphere']) assert.deepStrictEqual(J(P.lagnaAt(pan.sunrise, fx.site, { lagna: how })), d.lagnaAt[how], `lagnaAt ${how} ${d.N}`);
    assert.deepStrictEqual(J(P.lunarMonth(pan.sunrise + 0.5)), d.lunarMonth, `lunarMonth ${d.N}`);
  }
});

test('deep time: panchanga(N), the month, the civil day and the meridian end quickly at Kali day 8,388,700 (past 2^23) and at ±49,999 years', () => {
  const at = (y) => K.kaliDayFromCivil({ calendar: 'gregorian', year: y, month: 6, day: 1 });
  for (const N of [8388700, -8388700, at(49999), at(-49999)]) {
    const t0 = Date.now();
    const p = P.panchanga(N, UJJAYINI);
    assert.ok(p.sunrise < p.sunset && p.sunset < p.nextSunrise, `${N}: day order`);
    assert.equal(p.vara, K.varaOfKaliDay(N).name);
    for (const key of ['tithi', 'nakshatra', 'yoga', 'karana']) for (const x of p[key]) assert.ok(x.end === null || Number.isFinite(x.end), `${N} ${key}`);
    const m = P.lunarMonth(p.sunrise);
    assert.ok(m.start <= p.sunrise && p.sunrise < m.end && m.end - m.start > 29 && m.end - m.start < 30, `${N}: month`);
    const d = P.civilDayOf(p.sunrise + 0.2, UJJAYINI);
    assert.equal(d.N, N); assert.equal(d.sunrise, p.sunrise);
    assert.ok(Number.isFinite(P.meridianAt(p.sunrise, UJJAYINI).madhyaLagna.longitude));
    assert.ok(Date.now() - t0 < 2000, `${N}: ${Date.now() - t0} ms`);
  }
});

test('a site is a place: latitude in [−90°, 90°] and deśāntara within one turn of the Laṅkā–Ujjayinī meridian, finite (owner audit A1) — NaN, 360 and 90.5° no longer pass', () => {
  const N = N2026 + 100;
  for (const site of [{ latitude: NaN, deshantara: 0 }, { latitude: 23, deshantara: NaN }, { latitude: Infinity, deshantara: 0 }, { latitude: 23, deshantara: -Infinity }]) {
    assert.throws(() => P.sunrise(N, site), TypeError, JSON.stringify(site));
    assert.throws(() => P.lagnaAt(N + 0.3, site), TypeError);
  }
  for (const site of [{ latitude: 23, deshantara: 360 }, { latitude: 23, deshantara: -360 }, { latitude: 90.5, deshantara: 0 }, { latitude: -91, deshantara: 0 }]) {
    assert.throws(() => P.sunrise(N, site), RangeError, JSON.stringify(site));
    assert.throws(() => P.panchanga(N, site), RangeError);
    assert.throws(() => P.meridianAt(N, site), RangeError);
    assert.throws(() => P.civilDayOf(N + 0.5, site), RangeError);
  }
  assert.throws(() => P.sunrise(N, { latitude: '23', deshantara: 0 }), TypeError);
  // deśāntara = longitude − 75.79°, so every real site lies in about [−255.8°, +104.2°]: San Francisco −198.2°, Honolulu −233.6°
  for (const site of [{ latitude: 90, deshantara: 180 }, { latitude: -90, deshantara: -180 }, { latitude: 0, deshantara: 0 }, { latitude: 37.77, deshantara: -198.21 }, { latitude: 21.31, deshantara: -233.65 }]) assert.doesNotThrow(() => P.sunrise(N, site));
});
