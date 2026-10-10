'use strict';
/*
 * dasha.test.js — Vimśottarī to the prāṇa level (dasha.js), with every number taken from the BPHS verse words.
 */
const assert = require('node:assert/strict');
const { test } = require('node:test');
const Dh = require('./dasha.js');
const K = require('./kala-dvara.js');
const canon = require('./corpus/bphs/canon.json');
const verse = (c, n) => canon.chapters[String(c)].verses.find((v) => v.n === n).iast;
// bhūtasaṅkhyā, first word = units; a word worth more than 9 contributes its digits reversed
const bhuta = (values) => Number(values.map((v) => String(v).split('').reverse().join('')).join('').split('').reverse().join(''));
const WORD = { ṣaṭ: 6, daśa: 10, aśva: 7, gaja: 8, indu: 1, nṛpa: 16, nava: 9, candra: 1, naga: 7, nakha: 20, kha: 0, arka: 12, sūrya: 12 };

test('46.12: the order of the lords is the verse\'s syllables ā-caṃ-ku-rā-gu-śa-bu-ke-śu, from Kṛttikā', () => {
  assert.match(verse(46, 12), /ācaṃkurāguśabukeśu/);
  assert.match(verse(46, 12), /kṛttikātaḥ/);
  assert.deepEqual([...Dh.LORDS], ['Sūrya', 'Candra', 'Maṅgala', 'Rāhu', 'Guru', 'Śani', 'Budha', 'Ketu', 'Śukra']);
  assert.equal(Dh.lordOfNakshatra(3), 0);      // Kṛttikā → Sūrya
  assert.equal(Dh.lordOfNakshatra(1), 7);      // Aśvinī → Ketu
  assert.equal(Dh.lordOfNakshatra(27), 6);     // Revatī → Budha
  for (let n = 1; n <= 27; n++) assert.equal(Dh.lordOfNakshatra(n), Dh.lordOfNakshatra(((n + 8) % 27) + 1));
});

test('46.15: the years are the verse words; the slip "navacandrāḥ" for Budha is forced to 17 by 46.14\'s total of 120', () => {
  const v = verse(46, 15);
  for (const w of ['ṣaḍ daśā', "'śvā", 'gajendavaḥ', 'nṛpālā', 'navacandrā', 'nagā', 'nakhāḥ']) assert.ok(v.includes(w), w);
  const legible = [6, 10, 7, bhuta([WORD.gaja, WORD.indu]), WORD.nṛpa, bhuta([WORD.nava, WORD.candra]), 7, 20];
  assert.deepEqual(legible, [6, 10, 7, 18, 16, 19, 7, 20]);
  assert.match(verse(46, 14), /viṃśottaraśataṃ/);                       // 120
  const budha = 120 - legible.reduce((a, b) => a + b, 0);
  assert.equal(budha, 17);
  assert.equal(bhuta([WORD.naga, WORD.candra]), 17, 'naga-candra, one letter from nava-candra');
  assert.deepEqual(Dh.YEARS.map(Number), [6, 10, 7, 18, 16, 19, 17, 7, 20]);
  assert.equal(Dh.YEARS.reduce((a, b) => a + b, 0n), Dh.TOTAL);
});

test('51.1, 61.1, 62.1, 63.1: every sub-level divides by the whole of 120 ("sarva-yoga", "kha-arka", "kha-sūrya")', () => {
  assert.match(verse(51, 1), /sarvāyuryogabhājitāḥ/);
  assert.match(verse(62, 1), /khārk/);
  assert.match(verse(63, 1), /khasūryai/);
  assert.equal(bhuta([WORD.kha, WORD.arka]), 120);
  assert.equal(bhuta([WORD.kha, WORD.sūrya]), 120);
});

test('five levels, exact: every level\'s nine children add up to the parent to the spanda', () => {
  const md = Dh.mahadashas(0n, 3, Dh.q(1n, 3n));
  const total = Dh.sub(md.periods[8].end, md.periods[0].start);
  assert.equal(Dh.cmp(total, Dh.mul(Dh.q(120n, 1n), Dh.q(1577917828n * 328050000000n, 4320000n))), 0);
  const walk = (p, depth) => {
    if (p.level === 4) return;
    const kids = Dh.subPeriods(p);
    assert.equal(kids[0].lord, p.lord, 'own lord first (51.2)');
    assert.equal(Dh.cmp(kids[0].start, p.start), 0);
    assert.equal(Dh.cmp(kids[8].end, p.end), 0);
    for (let i = 1; i < 9; i++) assert.equal(Dh.cmp(kids[i].start, kids[i - 1].end), 0);
    if (depth > 0) walk(kids[(p.level * 4) % 9], depth - 1);
  };
  walk(md.periods[2], 4);
  assert.throws(() => Dh.subPeriods({ level: 4 }), /fifth and last/);
});

test('46.16: the balance is the lord\'s years × the part of the nakṣatra still to run', () => {
  const md = Dh.mahadashas(0n, 15, Dh.q(1n, 4n));              // Svātī → Rāhu, a quarter gone
  assert.equal(md.lordAtBirth, 3);
  assert.equal(Dh.cmp(md.balanceYears, Dh.q(27n, 2n)), 0);      // 18 × 3/4
  const b = Dh.vimshottari(K.kaliDayFromCivil({ calendar: 'gregorian', year: 2000, month: 1, day: 1 }) + 0.5);
  assert.equal(b.birth.nakshatraName, 'Svātī');
  const chain = Dh.chainAt(b, b.birth.birthSpandas + 1n);
  assert.equal(chain.length, 5);
  assert.equal(chain[0].name, 'Rāhu');
});

test('the year is validated once, in yearOf: a name in YEAR, or a positive rational of civil days — a zero denominator, a zero or negative length and an unknown name are refused', () => {
  const t = K.kaliDayFromCivil({ calendar: 'gregorian', year: 2000, month: 1, day: 1 }) + 0.5;
  for (const year of [{ num: 1n, den: 0n }, { num: -360n, den: 1n }, { num: 0n, den: 1n }, { num: 360n, den: -1n }]) assert.throws(() => Dh.vimshottari(t, { year }), /year/);
  assert.throws(() => Dh.vimshottari(t, { year: 'bogus' }), /unknown year/); assert.throws(() => Dh.vimshottari(t, { year: { num: 360, den: 1 } }), /year must be/);
  assert.deepEqual(Dh.yearOf({ year: { num: -720n, den: -2n } }), { num: 360n, den: 1n }); assert.deepEqual(Dh.yearOf({}), Dh.YEAR['saura-surya']); assert.deepEqual(Dh.yearOf({ year: 'savana-360' }), Dh.YEAR['savana-360']);
});
