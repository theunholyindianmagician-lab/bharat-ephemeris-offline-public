'use strict';
/*
 * kala-dvara.test.js — the time door of the sovereign engine, and the class-(ii) referee corpus that rests on it.
 * Every expected value is integer arithmetic, a calendar fact, a Sūrya-Siddhānta unit, or a number printed in a text.
 * No modern ephemeris, no ΔT, no Swiss, no JPL.
 *
 * Sources:
 *   [SS]  Sūrya-Siddhānta (editions/surya-siddhanta-full-edition.html): 1.11 (:363) 6 prāṇa = 1 vināḍī, 60 vināḍī = 1 nāḍikā;
 *         1.12 (:375) 60 nāḍī = the NĀKṢATRA ahorātra, one turn of the star-wheel; 1.29-1.30 (:596-) Sun and Moon revolutions;
 *         1.34 (:670) star-risings, and a body's own risings = star-risings − its revolutions; 1.35-1.39 (:682-:741) lunar months,
 *         adhimāsa, civil days, tithis, tithikṣaya, solar months; 13.23 (:6044) the kapāla sinks 60 times in an ahorātra; 14.19 (:6312)
 *         mean motions by the civil day. The lattice 328,050,000,000 spandas per ahorātra is lattice-invariants.test.js.
 *   [JM]  p.36: Parameśvara's village has deśāntara 'nakha' = 20 vināḍī; the time→arc rule (prāṇas × own motion ÷ 21,600).
 *   [CAL] Kali epoch = Friday 18 Feb 3102 BCE Julian = proleptic Gregorian 23 Jan 3101 BCE (lattice-invariants.test.js:160);
 *         Julian 1582-10-05 = Gregorian 1582-10-15; 1 Jan 2025 is a Wednesday.
 *   [JM]  corpus/jyotirmimamsa/eclipses.json — Nīlakaṇṭha's Jyotirmīmāṃsā (ed. K. V. Sarma, 1977) quoting Parameśvara's eclipse list.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
const K = require('./kala-dvara.js');
const KP = require('./katapayadi.js');
const corpus = JSON.parse(fs.readFileSync(path.join(__dirname, 'corpus', 'jyotirmimamsa', 'eclipses.json'), 'utf8'));

const bhuta = (values) => Number([...values.map((v) => String(v).split('').reverse().join(''))].join('').split('').reverse().join(''));   // bhūtasaṅkhyā, first word = units
const jul = (y, m, d) => K.kaliDayFromCivil({ calendar: 'julian', year: y, month: m, day: d });
const gre = (y, m, d) => K.kaliDayFromCivil({ calendar: 'gregorian', year: y, month: m, day: d });

test('[CAL] Kali day 0 is Friday, 18 Feb 3102 BCE Julian, 23 Jan 3101 BCE Gregorian; JDN 588466', () => {
  assert.equal(K.KALI_JDN, 588466);
  assert.deepEqual(K.civilFromKaliDay(0, 'julian'), { year: -3101, month: 2, day: 18 });
  assert.deepEqual(K.civilFromKaliDay(0, 'gregorian'), { year: -3101, month: 1, day: 23 });
  assert.equal(K.varaOfKaliDay(0).name, 'śukravāra');
  assert.equal(jul(-3101, 2, 18), 0);
  assert.equal(gre(-3101, 1, 23), 0);
});

test('[CAL] the calendar seam and a modern anchor', () => {
  assert.equal(jul(1582, 10, 5), gre(1582, 10, 15));
  assert.equal(jul(1582, 10, 4) + 1, jul(1582, 10, 5));
  assert.equal(gre(2025, 1, 1), 1872211);
  assert.deepEqual(K.civilFromKaliDay(1872211, 'gregorian'), { year: 2025, month: 1, day: 1 });
  assert.equal(K.varaOfKaliDay(1872211).name, 'budhavāra');
});

test('[CAL] both calendars invert exactly over 2.2 million days and never skip or repeat a day', () => {
  let prev = null;
  for (let n = 0; n < 2200000; n += 7) {
    for (const calendar of ['julian', 'gregorian']) {
      const c = K.civilFromKaliDay(n, calendar);
      assert.equal(K.kaliDayFromCivil({ calendar, ...c }), n, `${calendar} ${JSON.stringify(c)}`);
    }
    const w = K.varaOfKaliDay(n).index;
    if (prev !== null) assert.equal(w, (prev + 7) % 7);
    prev = w;
  }
  let d = K.civilFromKaliDay(2000000, 'julian');
  for (let n = 2000001; n < 2000800; n++) {                       // two years, day by day: each date strictly follows the last
    const e = K.civilFromKaliDay(n, 'julian');
    const advanced = (e.year === d.year && e.month === d.month && e.day === d.day + 1)
      || (e.year === d.year && e.month === d.month + 1 && e.day === 1)
      || (e.year === d.year + 1 && e.month === 1 && e.day === 1);
    assert.ok(advanced, `${JSON.stringify(d)} → ${JSON.stringify(e)}`);
    d = e;
  }
});

test('[CAL] dates that do not exist are refused, not silently rolled over', () => {
  assert.doesNotThrow(() => jul(1900, 2, 29));                    // 1900 is a Julian leap year …
  assert.throws(() => gre(1900, 2, 29), RangeError);              // … and not a Gregorian one
  assert.throws(() => K.kaliDayFromCivil({ calendar: 'gregorian', year: 2025, month: 4, day: 31 }), RangeError);
  assert.throws(() => K.kaliDayFromCivil({ calendar: 'gregorian', year: 2025, month: 13, day: 1 }), RangeError);
  assert.throws(() => K.kaliDayFromCivil({ calendar: 'gregorian', year: 2025.5, month: 1, day: 1 }), TypeError);
  assert.throws(() => K.kaliDayFromCivil({ calendar: 'hijri', year: 2025, month: 1, day: 1 }), RangeError);
});

test('[SS] ghaṭī / vināḍī / prāṇa on the spanda lattice, exact', () => {
  assert.equal(K.SPANDAS_PER_DAY, 328050000000n);
  assert.equal(K.SPANDAS_PER_GHATI, 5467500000n);
  assert.equal(K.SPANDAS_PER_VINADI, 91125000n);
  assert.equal(K.SPANDAS_PER_PRANA, 15187500n);
  assert.equal(K.SPANDAS_PER_PRANA * 6n, K.SPANDAS_PER_VINADI);
  assert.equal(K.SPANDAS_PER_VINADI * 60n, K.SPANDAS_PER_GHATI);
  assert.equal(K.SPANDAS_PER_GHATI * 60n, K.SPANDAS_PER_DAY);
  assert.equal(K.kapalaToSpandas({ ghati: 60 }), K.SPANDAS_PER_DAY);
  assert.equal(K.kapalaToSpandas({ ghati: 15, vinadi: 30, prana: 4, spanda: 7 }), 15n * 5467500000n + 30n * 91125000n + 4n * 15187500n + 7n);
});

test('[SS] kapāla reading round-trips for every spanda class, and one ahorātra is the limit', () => {
  for (const s of [0n, 1n, 15187499n, 15187500n, 91124999n, 91125000n, 5467499999n, 5467500000n, 328049999999n]) {
    const k = K.spandasToKapala(s);
    assert.ok(k.ghati < 60n && k.vinadi < 60n && k.prana < 6n && k.spanda < 15187500n);
    assert.equal(K.kapalaToSpandas(k), s);
  }
  assert.throws(() => K.spandasToKapala(K.SPANDAS_PER_DAY), RangeError);
  assert.throws(() => K.spandasToKapala(-1n), RangeError);
});

// ── the chain of time: one turn of the wheel, and everything derived from it ───────────────────────
test('[SS 1.11-1.12] time is the angle of the turn: a prāṇa is one kalā, a vināḍī six, a nāḍī six degrees, the ahorātra 360°', () => {
  assert.equal(K.SPANDAS_PER_ARCSEC, 253125n);                              // 3⁴·5⁵
  assert.equal(K.SPANDAS_PER_ARCSEC * K.ARCSEC_PER_TURN, K.SPANDAS_PER_DAY);
  assert.equal(K.SPANDAS_PER_PRANA, 60n * K.SPANDAS_PER_ARCSEC);            // 1 prāṇa = 1′
  assert.equal(K.SPANDAS_PER_VINADI, 360n * K.SPANDAS_PER_ARCSEC);          // 1 vināḍī = 6′
  assert.equal(K.SPANDAS_PER_GHATI, 21600n * K.SPANDAS_PER_ARCSEC);         // 1 nāḍī = 6°
  assert.equal(21600n * K.SPANDAS_PER_PRANA, K.SPANDAS_PER_DAY);            // 21,600 prāṇa = 21,600 kalā = one turn
  const a = K.arcsecOfTurn(K.kapalaToSpandas({ ghati: 1 }));
  assert.equal(a.num / a.den, 21600n);
  assert.equal(K.turnSpandasFromArcsec(1), 253125n);
});

test('[SS 1.29-1.39] every printed count of the yuga is decoded from the verse\'s own words — and every one follows from three integers', () => {
  // each printed number from its numeral words (bhūtasaṅkhyā; 'khacatuṣka' = four khas, rada = 32, tithi = 15)
  const printed = {
    sun:        bhuta([0, 0, 0, 0, 32, 4]),                  // 1.29 kha-catuṣka-rada-arṇava
    moon:       bhuta([6, 3, 3, 3, 5, 7, 7, 5]),             // 1.30 rasa-agni-tri-tri-iṣu-sapta-bhūdhara-mārgaṇa
    risings:    bhuta([8, 2, 8, 7, 3, 2, 2, 8, 5, 1]),       // 1.34 aṣṭa-akṣi-vasu-adri-tri-dvi-dvi-aṣṭa-śara-indu
    savana:     bhuta([8, 2, 8, 7, 1, 9, 7, 7, 15]),         // 1.37 vasu-dvi-aṣṭa-adri-rūpa-aṅka-sapta-adri-tithi
    tithi:      bhuta([0, 8, 0, 0, 0, 0, 3, 0, 6, 1]),       // 1.37 kha-aṣṭa-kha-kha-vyoma-kha-agni-kha-ṛtu-niśākara
    adhimasa:   bhuta([6, 3, 3, 3, 9, 15]),                  // 1.38 ṣaṭ-vahni-tri-hutāśa-aṅka-tithi
    tithiksaya: bhuta([2, 5, 2, 2, 8, 0, 5, 2]),             // 1.38 yama-artha-aśvi-dvi-aṣṭa-vyoma-śara-aśvin
    sauraMasa:  bhuta([0, 0, 0, 0, 4, 8, 1, 5]),             // 1.39 kha-catuṣka-samudra-aṣṭa-ku-pañca
  };
  assert.deepEqual(printed, { sun: 4320000, moon: 57753336, risings: 1582237828, savana: 1577917828, tithi: 1603000080, adhimasa: 1593336, tithiksaya: 25082252, sauraMasa: 51840000 });
  const m = K.mana('surya');                                   // derived only from risings, Sun and Moon
  assert.equal(Number(m.nakshatra), printed.risings);
  assert.equal(Number(m.savana), printed.savana, '1.39: civil days = star-risings − Sun revolutions');
  assert.equal(Number(m.sauraMasa), printed.sauraMasa);
  assert.equal(Number(m.candraMasa), 53433336, '1.35: lunar months = Moon − Sun revolutions');
  assert.equal(Number(m.adhimasa), printed.adhimasa, '1.35: adhimāsa = lunar − solar months');
  assert.equal(Number(m.tithi), printed.tithi, '14.14: thirty tithis a lunar month');
  assert.equal(Number(m.tithiksaya), printed.tithiksaya, '1.36: tithikṣaya = tithis − civil days');
});

test('[SS 1.34] a body\'s own risings are the star-risings less its revolutions: the Sun\'s are the civil days; the Moon rises 1,524,484,492 times', () => {
  const m = K.mana('surya');
  assert.equal(K.udayaCount('surya', m.sun), m.savana);
  assert.equal(K.udayaCount('surya', 57753336n), 1524484492n);
  assert.equal(m.nakshatra - m.savana, m.sun, 'in a year the wheel turns exactly once more than the Sun rises');
});

test('[THEOREM] the year in civil days, sexagesimal: SS 365 d 15 gh 31 vi 31 pala 24; Āryabhaṭa 365 d 15 gh 31 vi 15 pala', () => {
  const sexa = (num, den, places) => { const out = [num / den]; let r = num % den; for (let i = 0; i < places; i++) { r *= 60n; out.push(r / den); r %= den; } return out.map(Number); };
  const ss = K.mana('surya'), ab = K.mana('aryabhata');
  assert.deepEqual(sexa(ss.savana, ss.sun, 4), [365, 15, 31, 31, 24]);
  assert.deepEqual(sexa(ab.savana, ab.sun, 4), [365, 15, 31, 15, 0]);
  assert.equal(ab.savana, 1577917500n);
  assert.equal(ab.tithiksaya, 25082580n);
});

test('[SS 1.12 + 13.23] the kapāla counts nāḍīs of the TURN; read as civil nāḍīs it is wrong by about 4.9 vināḍī at 30 ghaṭī', () => {
  const m = K.mana('surya');
  const full = K.savanaSpandasAt(0, { ghati: 60 });                 // one turn, in civil spandas
  assert.equal(full.num, K.SPANDAS_PER_DAY * m.savana);
  assert.equal(full.den, m.nakshatra);
  assert.ok(full.num < K.SPANDAS_PER_DAY * full.den, 'one turn is shorter than one civil day');
  const asCivil = K.savanaSpandasAt(0, { ghati: 30 }, { calibration: 'savana' });
  const asTurn = K.savanaSpandasAt(0, { ghati: 30 });
  const deficitVinadi = Number((asCivil.num * asTurn.den - asTurn.num) * 1000n / (asTurn.den * K.SPANDAS_PER_VINADI)) / 1000;
  assert.equal(deficitVinadi.toFixed(2), '4.91');                   // 30 ghaṭī × 4,320,000 / 1,582,237,828, in vināḍī
  const yugaOfTurns = K.savanaFromNakshatra(m.nakshatra * K.SPANDAS_PER_DAY);   // a yuga of turns is exactly a yuga of civil days
  assert.equal(yugaOfTurns.num % yugaOfTurns.den, 0n);
  assert.equal(yugaOfTurns.num / yugaOfTurns.den, m.savana * K.SPANDAS_PER_DAY);
  const yugaOfDays = K.nakshatraFromSavana(m.savana * K.SPANDAS_PER_DAY);
  assert.equal(yugaOfDays.num / yugaOfDays.den, m.nakshatra * K.SPANDAS_PER_DAY);
  assert.equal(K.savanaSpandasAt(1, { ghati: 30 }, { calibration: 'savana' }).num, 328050000000n + 164025000000n);
  assert.throws(() => K.savanaSpandasAt(0, {}, { calibration: 'utc' }), RangeError);
});

test('[JM p.36] deśāntara is a rotation: Parameśvara\'s "nakha" = 20 vināḍī = 2° of the turn; the time→arc rule is exact', () => {
  assert.equal(KP.decodeWord('nakha').value, 20n);
  const a = K.arcsecOfTurn(K.kapalaToSpandas({ vinadi: 20 }));
  assert.equal(a.num % a.den, 0n);
  assert.equal(a.num / a.den, 7200n);                                // 2° = 7,200″
  const oneTurn = K.arcFromPranas(21600, 790);                       // a whole turn of prāṇas moves a body by its own daily motion
  assert.equal(oneTurn.num / oneTurn.den, 790n);
  const r = K.arcFromPranas(540, 790);                               // 540 prāṇas (= 1½ nāḍī) at 790′ a day
  assert.equal(r.num * 40n, 790n * r.den);                           // = 790/40 = 19.75′
});

test('[CROSS-CHECK] this module agrees with the repository\'s existing civil door, day for day (the only place math-core is loaded)', () => {
  const M = require('./math-core.js');
  for (const [y, m, d] of [[2025, 1, 1], [2000, 1, 1], [1900, 3, 1], [1582, 10, 15], [1600, 2, 29], [-3101, 1, 23], [2100, 12, 31]]) {
    const viaCore = M.aharganaSpandasFromCivil({ year: y, month: m, day: d, applyDeltaT: false }) / K.SPANDAS_PER_DAY;
    assert.equal(BigInt(gre(y, m, d)), viaCore, `${y}-${m}-${d}`);
  }
});

// ── the class-(ii) referee corpus ───────────────────────────────────────────────────────────────

test('[JM] every ahargaṇa Sarma prints is re-derived from the verse\'s own numeral words (units first)', () => {
  let checked = 0, unchecked = 0;
  for (const r of corpus.records) {
    if (r.katapayadi) continue;                                   // coded as a Kaṭapayādi word; checked in the next test
    if (r.words === null) { unchecked++; assert.ok(r.flag, `${r.id}: an unchecked record must say why`); continue; }
    assert.equal(r.words.split('-').length, r.word_values.length, `${r.id}: word count`);
    assert.equal(bhuta(r.word_values), r.printed_number, `${r.id}: ${r.words}`);
    checked++;
  }
  assert.equal(checked, 10);
  assert.equal(unchecked, 3);
  const e = corpus.parameshvara_epoch;
  assert.equal(e.ahargana_words.split('-').length, e.ahargana_word_values.length);
  assert.equal(bhuta(e.ahargana_word_values), e.ahargana_printed);
});

test('[JM] the Kaṭapayādi ahargaṇas decode to the printed numbers (the codec of katapayadi.js, not an editor\'s figure)', () => {
  for (const r of [...corpus.records.filter((x) => x.katapayadi), corpus.common_date]) {
    assert.equal(KP.decodeWord(r.katapayadi).value, BigInt(r.printed_number), r.katapayadi);
  }
});

test('[JM] civil dates of the records are integer arithmetic on the Kali day — and the editor\'s A.D. 1503 for the Trivandrum eclipse is not (it is 1502)', () => {
  const julianOf = (n) => { const c = K.civilFromKaliDay(n, 'julian'); return `${c.year}-${String(c.month).padStart(2, '0')}-${String(c.day).padStart(2, '0')}`; };
  const byId = Object.fromEntries(corpus.records.map((r) => [r.id, r]));
  assert.equal(julianOf(byId['SDip-77'].printed_number), '1398-11-09');
  assert.equal(K.varaOfKaliDay(byId['SDip-77'].printed_number).name, 'śanivāra');
  assert.equal(julianOf(byId['JM-Syanandurapura'].printed_number), '1502-10-02');
  assert.equal(julianOf(byId['JM-Harihara'].printed_number), '1517-06-20');
  assert.equal(julianOf(corpus.parameshvara_epoch.ahargana_printed), '1421-03-29');
  assert.equal(julianOf(corpus.common_date.printed_number), '1504-07-03');
  assert.equal(julianOf(1683112), '1507-03-30');                  // the day the text's own definition gives, 1000 days later
  assert.equal(1683112 - corpus.common_date.printed_number, 1000);
  // 8/7500 of a caturyuga of 1,577,917,500 days, and 8 × 210,389 (dhījagannūpura): the text's own definition of its common date
  assert.equal(1577917500n * 8n / 7500n, 1683112n);
  assert.equal(8n * KP.decodeWord('dhījagannūpura').value, 1683112n);
  for (const r of corpus.records) {                               // all fifteen lie between 1398 and 1517 — the lives of the authors
    const y = K.civilFromKaliDay(r.printed_number, 'julian').year;
    assert.ok(y >= 1398 && y <= 1517, `${r.id}: ${y}`);
  }
});

test('[JM] Parameśvara\'s four epoch values are inside their rāśi and in the order the text gives', () => {
  const v = corpus.parameshvara_epoch.values;
  for (const k of Object.keys(v)) {
    assert.ok(v[k].degrees >= 0 && v[k].degrees < 30 && v[k].minutes >= 0 && v[k].minutes < 60, k);
    assert.ok(v[k].rashi_index >= 0 && v[k].rashi_index < 12, k);
  }
  assert.equal(v.moon.rashi_index * 30, 300);                      // Kumbha begins at 300°
  assert.equal(v.apogee.rashi_index * 30, 90);                     // Karkaṭa begins at 90°
});

// ── the frame, as a gate ────────────────────────────────────────────────────────────────────────
test('[FRAME] the sovereign files and corpus name no modern ephemeris, no ΔT table, no IERS product, and import only each other', () => {
  const FORBIDDEN = /\b(?:DE4\d\d|VSOP\d*|ELP\d*|Swiss|swisseph|Gaia|IERS|DrikTier)\b|finals\.all|DeltaT|astronomy-engine/;
  const ROOTS = ['katapayadi.js', 'kala-dvara.js', 'parahita-madhyama.js', 'dhruva.js', 'sphuta.js', 'radau.js'];   // import nothing at all
  const LAYERS = ['panchanga.js', 'dasha.js', 'muhurta.js', 'utsava.js', 'gurutva.js', 'gurutva-candra.js', 'spanda-ganita.js', 'ss-udaya.js', 'ss-graha.js', 'ss-chaya.js', 'ss-grahana.js', 'ss-drishya.js', 'ss-ahargana.js', 'ss-parilekha.js', 'candravakya.js', 'vedha-lekha.js', 'samskara.js', 'yantra.js'];       // import only the sovereign files
  for (const f of [...ROOTS, ...LAYERS, 'corpus/jyotirmimamsa/eclipses.json', 'corpus/jyotirmimamsa/readings.json', 'scripts/parampara-samskara.cjs', 'corpus/surya-siddhanta/yogatara.json', 'corpus/surya-siddhanta/numbers.json',
    'corpus/gurutva/candra.json', 'scripts/derive-gurutva.cjs', 'corpus/vedha/README.md', 'corpus/vedha/LEDGER.md', 'vedha.html', 'vedha-page.js',
    'siddhanta-panchanga.html', 'siddhanta-panchanga-page.js']) {
    const text = fs.readFileSync(path.join(__dirname, f), 'utf8');
    assert.equal(FORBIDDEN.test(text), false, `${f} mentions a forbidden source`);
  }
  for (const f of ROOTS) {
    assert.equal(/\brequire\s*\(|\bimport\s/.test(fs.readFileSync(path.join(__dirname, f), 'utf8')), false, `${f} must have no imports`);
  }
  const allowed = new Set([...ROOTS, ...LAYERS].map((f) => './' + f));
  for (const f of LAYERS) {
    const text = fs.readFileSync(path.join(__dirname, f), 'utf8');
    assert.equal(/\bimport\s/.test(text), false, `${f} uses no import statement`);
    const reqs = [...text.matchAll(/\brequire\s*\(\s*["']([^"']+)["']\s*\)/g)].map((m) => m[1]);
    assert.ok(reqs.length > 0, `${f} requires its layers`);
    for (const r of reqs) assert.ok(allowed.has(r), `${f} requires ${r}, which is not a sovereign file`);
  }
});

test('the trigonometry left in the sovereign files is pinned, and no module reaches outside by a dynamic require, import() or fetch (council G-4, G-5)', () => {
  // Design §18.2: these are the only paths that still use the library's trigonometry; the effect on sunrise is ≤ 0.001 s.
  const PINNED = { 'dhruva.js': 39, 'panchanga.js': 12, 'muhurta.js': 3, 'utsava.js': 5, 'gurutva.js': 40, 'gurutva-candra.js': 2 };
  const files = fs.readdirSync(__dirname).filter((f) => /\.js$/.test(f) && !/\.test\.js$/.test(f));
  const sovereign = ['katapayadi.js', 'kala-dvara.js', 'parahita-madhyama.js', 'dhruva.js', 'sphuta.js', 'radau.js', 'panchanga.js', 'dasha.js', 'muhurta.js', 'utsava.js',
    'gurutva.js', 'gurutva-candra.js', 'spanda-ganita.js', 'ss-udaya.js', 'ss-graha.js', 'ss-chaya.js', 'ss-grahana.js', 'ss-drishya.js', 'ss-ahargana.js', 'ss-parilekha.js',
    'candravakya.js', 'vedha-lekha.js', 'samskara.js', 'yantra.js'].filter((f) => files.includes(f));
  for (const f of sovereign) {
    const text = fs.readFileSync(path.join(__dirname, f), 'utf8');
    const n = (text.match(/Math\.(?:sin|cos|tan|asin|acos|atan2|atan)\b/g) || []).length;
    assert.equal(n, PINNED[f] || 0, `${f}: ${n} trigonometric calls (pinned ${PINNED[f] || 0}); use the sine tier (sphuta.js) instead`);
    assert.equal(/\brequire\s*\(\s*[^"'\s)]/.test(text), false, `${f}: a require of a computed name`);
    assert.equal(/\bimport\s*\(|\bfetch\s*\(|XMLHttpRequest|\bWebSocket\b/.test(text), false, `${f}: reaches outside`);
    assert.equal(/\b(?:vsop\d*|elp\d*|swisseph|de4\d\d)\b/i.test(text.replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, '')), false, `${f}: names a modern ephemeris in code`);
  }
});
