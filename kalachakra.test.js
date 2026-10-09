/* kalachakra.test.js — the Kālacakra daśā of Parāśara 46.52–46.100 on the 108-cell lattice: the text's own identities as tests. */
const test = require('node:test');
const assert = require('node:assert/strict');
const K = require('./kalachakra.js');
const SK = require('./sukshma-kala.js');
const P = require('./panchanga.js');

const TYPES = ['ashvini', 'bharani', 'rohini', 'mrigashira'];
const rev = (a) => [...a].reverse();

test('46.84: the sign years come from the lords — Meṣa 7, Vṛṣa 16, Mithuna 9, Karka 21, Siṃha 5, Kanyā 9, Tulā 16, Vṛścika 7, Dhanu 10, Makara 4, Kumbha 4, Mīna 10 (118 over the twelve)', () => {
  assert.deepEqual(K.SIGN_YEARS, [7, 16, 9, 21, 5, 9, 16, 7, 10, 4, 4, 10]);
  assert.equal(K.SIGN_YEARS.reduce((a, b) => a + b, 0), 118);
  assert.deepEqual(Object.values(K.LORD_YEARS), [5, 21, 7, 9, 10, 16, 4]); assert.equal(Object.values(K.LORD_YEARS).reduce((a, b) => a + b, 0), 72);
});

test('the sixteen chains: nine signs each, and the apasavya chains are the savya chains reversed with the pāda reversed (Rohiṇī ↔ Bharaṇī, Mṛgaśira ↔ Aśvinī) — the structure 46.71 and 46.94 state', () => {
  for (const t of TYPES) { assert.equal(K.CHAINS[t].length, 4); for (const c of K.CHAINS[t]) { assert.equal(c.length, 9); for (const s of c) assert.ok(s >= 1 && s <= 12); } }
  for (let p = 0; p < 4; p++) { assert.deepEqual(K.CHAINS.rohini[p], rev(K.CHAINS.bharani[3 - p]), `Rohiṇī pāda ${p + 1}`); assert.deepEqual(K.CHAINS.mrigashira[p], rev(K.CHAINS.ashvini[3 - p]), `Mṛgaśira pāda ${p + 1}`); }
});

test('46.89 read units first (85, 83, 86): every chain\'s year-sum equals the paramāyus of its aṃśaka\'s trine — savya by 46.88, apasavya by the viloma count of 46.94', () => {
  const t = K.table();
  assert.equal(t.length, 16);
  for (const c of t) { assert.equal(c.sum, c.paramayus, `${c.type} pāda ${c.pada}: sum ${c.sum} vs ${c.paramayus}`); assert.ok(c.sumMatchesParamayus); }
  assert.deepEqual(t.filter((c) => c.type === 'ashvini').map((c) => c.sum), [100, 85, 83, 86]);
  assert.deepEqual(t.filter((c) => c.type === 'rohini').map((c) => c.sum), [86, 83, 85, 100]);
  // the edition's own reading 28, 38, 68 matches no chain
  for (const c of t) assert.ok(![28, 38, 68].includes(c.sum));
  assert.deepEqual(K.PARAMAYUS, [100, 85, 83, 86]);
});

test('deha and jīva as the verses name them (savya: first and last; apasavya: last and first)', () => {
  const S = K.SIGNS, exp = {
    ashvini: [['Meṣa', 'Dhanu'], ['Makara', 'Mithuna'], ['Vṛṣa', 'Mithuna'], ['Karka', 'Mīna']],               // 46.60, 46.61, 46.62, 46.64
    bharani: [['Vṛścika', 'Mīna'], ['Kumbha', 'Kanyā'], ['Tulā', 'Kanyā'], ['Karka', 'Dhanu']],                  // 46.66 [reading], 46.67, 46.68, 46.69
    rohini: [['Karka', 'Dhanu'], ['Tulā', 'Kanyā'], ['Kumbha', 'Kanyā'], ['Vṛścika', 'Mīna']],                  // 46.73, 46.74, 46.75, 46.76
    mrigashira: [['Karka', 'Mīna'], ['Vṛṣa', 'Mithuna'], ['Makara', 'Mithuna'], ['Meṣa', 'Dhanu']],            // 46.78, 46.79, 46.80, 46.81
  };
  for (const c of K.table()) { const [d, j] = exp[c.type][c.pada - 1]; assert.equal(S[c.deha - 1], d, `${c.type} ${c.pada} deha`); assert.equal(S[c.jiva - 1], j, `${c.type} ${c.pada} jīva`); }
});

test('46.96–100: every step of every chain is one sign, or one of the three named motions on exactly the pairs the text names', () => {
  const seen = new Set();
  for (const c of K.table()) for (const s of c.steps) { const d = ((s.to - s.from) % 12 + 12) % 12; if (d === 1 || d === 11) assert.ok(s.motion === null || s.motion === 'markaṭī'); if (s.motion === 'markaṭī') seen.add('4-5'); if (d !== 1 && d !== 11) { assert.ok(s.motion, `${c.type} ${c.pada} ${s.from}→${s.to}`); seen.add([s.from, s.to].sort((a, b) => a - b).join('-')); } }
  assert.deepEqual([...seen].sort(), ['1-9', '3-5', '4-5', '4-6', '8-12']);          // Dhanu–Meṣa, Siṃha–Mithuna, Karka–Siṃha, Kanyā–Karka, Mīna–Vṛścika
  assert.equal(K.motionOf(6, 4), 'maṇḍūkī'); assert.equal(K.motionOf(4, 5), 'markaṭī'); assert.equal(K.motionOf(12, 8), 'siṃhāvalokana'); assert.equal(K.motionOf(1, 2), null);
  // markaṭī is labelled only beside a frog-jump: in Meṣa…Dhanu the step Karka → Siṃha is plain; in …Kanyā, Karka, Siṃha, Mithuna it is the monkey's backward step
  assert.equal(K.chainOf(0, 1).steps[3].motion, null); assert.deepEqual(K.chainOf(0, 2).steps.slice(5).map((s) => s.motion), ['maṇḍūkī', 'markaṭī', 'maṇḍūkī']); assert.deepEqual(K.chainOf(3, 1).steps.slice(5).map((s) => s.motion), [null, 'maṇḍūkī', 'markaṭī']);
  assert.throws(() => K.motionOf(1, 7), /neither/);
});

test('the groups: odd triads savya (15 stars: ten like Aśvinī, five like Bharaṇī), even triads apasavya (12: four like Rohiṇī, the octad like Mṛgaśira by 46.77; the standard tables give eight and four)', () => {
  const text = [...Array(27).keys()].map((n) => K.TYPE_RULE(n)), std = [...Array(27).keys()].map((n) => K.TYPE_RULE(n, 'standard'));
  assert.equal(text.filter((t) => t.savya).length, 15); assert.equal(text.filter((t) => !t.savya).length, 12);
  assert.equal(text.filter((t) => t.type === 'ashvini').length, 10); assert.equal(text.filter((t) => t.type === 'bharani').length, 5);
  assert.equal(text.filter((t) => t.type === 'rohini').length, 4); assert.equal(text.filter((t) => t.type === 'mrigashira').length, 8);
  assert.equal(std.filter((t) => t.type === 'rohini').length, 8); assert.equal(std.filter((t) => t.type === 'mrigashira').length, 4);
  for (const n of [0, 6, 12, 18, 24, 2, 8, 14, 20, 26]) assert.equal(text[n].type, 'ashvini');                        // 46.57-58's ten
  for (const n of [1, 7, 13, 19, 25]) assert.equal(text[n].type, 'bharani');                                           // 46.65's five
  for (const n of [3, 9, 15, 21]) assert.equal(text[n].type, 'rohini');                                                // 46.71's four
  for (const n of [4, 5, 10, 11, 16, 17, 22, 23]) assert.equal(text[n].type, 'mrigashira');                            // 46.77's octad
  assert.throws(() => K.TYPE_RULE(27), /0…26/); assert.throws(() => K.TYPE_RULE(3, 'other'), /text.*standard/);
});

test('46.88 on the lattice: A = 4r + p is the 108-cell index mod 12, plus one; the text\'s worked example (Maghā, third pāda) gives 3; sukshma-kala\'s cell agrees', () => {
  for (let n = 0; n < 27; n++) for (let p = 1; p <= 4; p++) { const c = K.chainOf(n, p); assert.equal(c.cell, 4 * n + p - 1); assert.equal(c.amshaka, (c.cell % 12) + 1); assert.equal(c.amshaka + c.amshakaViloma, 8 * c.r + 5); }
  const magha = K.chainOf(9, 3); assert.equal(magha.amshaka, 3); assert.equal(magha.group, 'apasavya'); assert.equal(magha.type, 'rohini'); assert.equal(magha.amshakaViloma, 2); assert.equal(magha.paramayus, 85);
  for (const lon of [0, 3.3333, 93.7, 123.45, 359.99]) { const c = K.cellOf(lon); const s = SK.cell(lon); assert.equal(c.cell, s.k); assert.equal(c.nakshatra + 1, s.nakshatra); /* sukshma-kala counts the nakṣatra one-based */ assert.equal(c.pada, s.pada); assert.ok(c.goneArcmin >= 0 && c.goneArcmin < 200); }
  assert.equal(K.cellOf(360).cell, 0); assert.equal(K.cellOf(-0.001).cell, 107);
});

test('the daśā from a birth: 46.93\'s bhukta from the arc gone in the pāda, the balance in the running sign, the nine signs end to end, sub-periods summing exactly, and the continuation tagged', () => {
  const t = 1865000.3;                                                           // a Kali day in 1998 CE
  const d = K.dasha(t, { cycles: 2 });
  const L = P.limbsAt(t); assert.equal(d.birth.nakshatra, L.nakshatra); assert.equal(d.birth.pada, L.pada);
  assert.equal(d.periods.length, 9); assert.equal(d.next.length, 1); assert.equal(d.next[0].periods.length, 9);
  const tot = d.periods.reduce((a, p) => a + Number(p.years.num) / Number(p.years.den), 0); assert.equal(tot, d.chain.paramayus);
  const gone = Number(d.goneYears.num) / Number(d.goneYears.den), bal = Number(d.balanceYears.num) / Number(d.balanceYears.den);
  assert.ok(Math.abs(gone + bal - d.chain.paramayus) < 1e-9); assert.ok(Math.abs(gone / d.chain.paramayus - d.birth.goneArcmin / 200) < 1e-6);   // the arc is rounded to a micro-arcminute
  const running = d.periods.filter((p) => p.running); assert.equal(running.length, 1); assert.ok(d.periods.indexOf(running[0]) === d.periods.filter((p) => p.elapsed).length);
  for (let i = 1; i < 9; i++) assert.deepEqual(d.periods[i].start, d.periods[i - 1].end);
  assert.deepEqual(d.next[0].periods[0].start, d.periods[8].end); assert.match(d.next[0].periods[0].chain, /standard continuation/);
  const birth = { num: BigInt(Math.floor(t)) * 328050000000n + BigInt(Math.round((t - Math.floor(t)) * 328050000000)), den: 1n };
  assert.equal(K.runningAt(d, birth), running[0]);
  const sub = K.subPeriods(running[0], d.chain); assert.equal(sub.length, 9); assert.deepEqual(sub[0].start, running[0].start); assert.deepEqual(sub[8].end, running[0].end); assert.ok(sub.every((s) => s.tag === 'standard'));
  const civ = K.toCivil(running[0].start); assert.ok(civ.year >= 1900 && civ.year <= 2000);
  // the standard type rule changes only an apasavya third star's chain
  const alt = K.dasha(t, { types: 'standard' }); if (d.chain.group === 'apasavya' && d.chain.r === 2) assert.notEqual(alt.chain.type, d.chain.type); else assert.equal(alt.chain.type, d.chain.type);
});

test('the readings are recorded with their verses, and nothing of the phala verses is built', () => {
  assert.ok(K.READINGS.length >= 8); for (const r of K.READINGS) { assert.match(r.verse, /^46\.\d+$/); assert.ok(r.what.length > 40); assert.ok(r.tag); }
  assert.ok(!Object.keys(K).some((k) => /phala|result|effect/i.test(k)));
});
