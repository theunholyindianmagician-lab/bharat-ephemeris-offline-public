'use strict';
// The kaṭapayādi π-verse (गोपीभाग्यमधुव्रात…, Pāṇini Rahasya ch. 6): its 32 decoded digits agree with π in the
// first 31 only, and its attribution to Mādhava is traditional. π is computed here with Machin's formula in exact
// BigInt arithmetic; no stored digit string or floating-point constant is the referee.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const read = (f) => fs.readFileSync(path.join(__dirname, f), 'utf-8');
function libraryCorpus() {
  const m = read('library.html').match(/const granthaCorpus = (\{[\s\S]*?\n\s*\});/);
  assert.ok(m, 'granthaCorpus literal found in library.html');
  return JSON.parse(m[1]);
}

const KATAPAYADI = {
  'क': 1, 'ख': 2, 'ग': 3, 'घ': 4, 'ङ': 5, 'च': 6, 'छ': 7, 'ज': 8, 'झ': 9, 'ञ': 0,
  'ट': 1, 'ठ': 2, 'ड': 3, 'ढ': 4, 'ण': 5, 'त': 6, 'थ': 7, 'द': 8, 'ध': 9, 'न': 0,
  'प': 1, 'फ': 2, 'ब': 3, 'भ': 4, 'म': 5,
  'य': 1, 'र': 2, 'ल': 3, 'व': 4, 'श': 5, 'ष': 6, 'स': 7, 'ह': 8,
};
const VIRAMA = '्';
const INDEPENDENT_VOWEL = /[ऄ-औ]/;
// In a conjunct only the last consonant counts; vowel signs, anusvāra and visarga add nothing; a bare vowel is 0.
function decodeKatapayadi(text) {
  const chars = [...text];
  let digits = '';
  chars.forEach((c, i) => {
    if (c in KATAPAYADI) { if (chars[i + 1] !== VIRAMA) digits += KATAPAYADI[c]; }
    else if (INDEPENDENT_VOWEL.test(c)) digits += '0';
  });
  return digits;
}

// Machin: π = 16·arctan(1/5) − 4·arctan(1/239), fixed point with 20 guard digits; returns the first n digits.
function piDigits(n) {
  const S = 10n ** BigInt(n + 20);
  const arctanInv = (x) => {
    let sum = 0n, term = S / x, k = 0n;
    const x2 = x * x;
    while (term !== 0n) { sum += (k % 2n === 0n ? term : -term) / (2n * k + 1n); term /= x2; k++; }
    return sum;
  };
  return (16n * arctanInv(5n) - 4n * arctanInv(239n)).toString().slice(0, n);
}

// stale forms only: "32 digits of which the first 31 agree" is the correct wording and must not match
const STALE = /Madhava'?s (Pi|π|verse)|Mādhava'?s (Pi|π|verse)|Sangamagrama'?s verse|exact 32|32-digit (Pi|π)|accurate to 32/i;

test('the π-verse decodes to 32 digits, of which exactly the first 31 agree with π', () => {
  const ch = libraryCorpus().panini.chapters[5];
  const verse = ch.slokas[0].deva.split('\n').slice(2).join(' ');
  assert.ok(verse.startsWith('गोपीभाग्य'), 'lines 3-4 of the śloka are the π-verse');
  const decoded = decodeKatapayadi(verse);
  assert.equal(decoded, '31415926535897932384626433832792');
  const pi = piDigits(40);
  assert.ok(pi.startsWith('3141592653'), 'Machin series sanity');
  let agree = 0;
  while (decoded[agree] === pi[agree]) agree++;
  assert.equal(agree, 31);
  assert.notEqual(decoded[31], pi[31]);
  assert.ok(ch.verseRange.includes('31 digits agree with π'));
  // the formula states the verse's own sum, not π/10, as the 32-digit value
  assert.ok(ch.formula.latex.includes('= 0.' + decoded), ch.formula.latex);
  assert.ok(!ch.formula.latex.includes('0.' + pi.slice(0, 32)), ch.formula.latex);
});

test('no Mādhava attribution or 32-correct-digit claim survives on the π-verse', () => {
  const C = libraryCorpus();
  const ch = C.panini.chapters[5];
  const fields = [ch.nameEn, ch.shortTitle, ch.verseRange, ch.overview, ch.formula.latex, ch.formula.notes, ch.codeOutput,
    ...ch.slokas.flatMap((s) => [s.meter, s.translation])].join('\n');
  assert.ok(!STALE.test(fields), fields.match(STALE)?.[0]);

  // generated copies carry the same chapter (scripts/library/sync_library.py)
  assert.deepEqual(JSON.parse(read('downloads/Panini_Rahasya_Full_Dataset.json')).chapters[5], ch);
  for (const name of ['Quad', 'Deca', 'Dodeca']) {
    const bundle = JSON.parse(read(`downloads/Complete_${name}_Grantha_Collector_Bundle.json`));
    assert.deepEqual(bundle.corpora.panini.chapters[5], ch, `${name} bundle`);
  }
  // the dossier and notebook render the record's own text, and never the old π/10 = 32-digit formula
  const oldLatex = '0.' + piDigits(32);
  const notebookText = JSON.parse(read('downloads/Panini_Rahasya_Complete_Suite.ipynb')).cells
    .map((c) => (Array.isArray(c.source) ? c.source.join('') : c.source)).join('\n');
  const rendered = { 'downloads/Panini_Rahasya_Sovereign_Dossier.md': read('downloads/Panini_Rahasya_Sovereign_Dossier.md'),
    'downloads/Panini_Rahasya_Complete_Suite.ipynb': notebookText };
  for (const [f, text] of Object.entries(rendered)) {
    assert.ok(!STALE.test(text), `${f}: ${text.match(STALE)?.[0]}`);
    for (const field of [ch.overview, ch.slokas[0].meter, ch.formula.latex]) assert.ok(text.includes(field), `${f} lacks: ${field}`);
    assert.ok(!text.includes(oldLatex), `${f} still equates π/10 with the 32-digit sum`);
  }
  // the reader upper-cases meter tags; a Greek π there would render as Π
  assert.ok(!/[\u0370-\u03FF]/.test(ch.slokas[0].meter), ch.slokas[0].meter);

  // hand-maintained pages
  assert.ok(!/Madhava's Pi|32-Digit π/.test(read('library.html')), 'library card');
  const edition = read('editions/panini-rahasya-full-edition.html');
  for (const stale of ['π×10³¹ अंक', 'π×१०³¹ अंक', 'π×10³¹ के अंक', 'π के ३२ अंक']) {
    assert.ok(!edition.includes(stale), `edition still says ${stale}`);
  }
});
