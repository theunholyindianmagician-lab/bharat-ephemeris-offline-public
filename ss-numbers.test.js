'use strict';
/*
 * ss-numbers.test.js — the Sūrya-Siddhānta's numbers are the verses' own words. Every number in its numeric verses is
 * re-decoded here (bhūtasaṅkhyā, first word = units), checked against the text's own internal proofs, and checked
 * against what the edition prints — so a number once misprinted and then called a "variant" cannot come back.
 * Register: corpus/surya-siddhanta/numbers.json. Edition: editions/surya-siddhanta-full-edition.html.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
const reg = JSON.parse(fs.readFileSync(path.join(__dirname, 'corpus', 'surya-siddhanta', 'numbers.json'), 'utf8'));
const edition = fs.readFileSync(path.join(__dirname, 'editions', 'surya-siddhanta-full-edition.html'), 'utf8');
const bhuta = (values) => Number(values.map((v) => String(v).split('').reverse().join('')).join('').split('').reverse().join(''));
const item = (v, i) => reg.verses.find((x) => x.v === v).items[i].n;
const DEVA = { '०': '0', '१': '1', '२': '2', '३': '3', '४': '4', '५': '5', '६': '6', '७': '7', '८': '8', '९': '9' };
function block(v) {
  const id = 'v' + v.replace('.', '-').replace(/-(\d)$/, '-0$1');
  const m = edition.match(new RegExp(`<article class="verse" id="${id}">([\\s\\S]*?)</article>`));
  assert.ok(m, `edition has verse ${v}`);
  return m[1].replace(/[०-९]/g, (d) => DEVA[d]).replace(/(\d),(?=\d)/g, '$1');   // Devanagari digits → ASCII, digit grouping removed
}

test('every registered number is the decode of its own verse words', () => {
  let n = 0;
  for (const v of reg.verses) for (const it of v.items) {
    assert.equal(it.words.split('-').length, it.values.length, `${v.v} ${it.what}: one value per word`);
    assert.equal(bhuta(it.values), it.n, `${v.v} ${it.what}: ${it.words}`);
    n++;
  }
  assert.ok(n >= 90, `${n} numbers registered`);
});

test('the text proves its own sine tables: each versed sine is R minus the sine read backwards (2.17-2.27)', () => {
  const sine = [], vers = [];
  for (const v of ['2.17', '2.18', '2.19', '2.20', '2.21', '2.22']) sine.push(...reg.verses.find((x) => x.v === v).items.map((x) => x.n));
  for (const v of ['2.23', '2.24', '2.25', '2.26', '2.27']) vers.push(...reg.verses.find((x) => x.v === v).items.map((x) => x.n));
  assert.equal(sine.length, 24); assert.equal(vers.length, 24);
  const R = sine[23];
  assert.equal(R, 3438);
  for (let k = 1; k <= 24; k++) assert.equal(vers[k - 1], R - (k < 24 ? sine[23 - k] : 0), `versed sine ${k}`);
  for (let k = 1; k <= 24; k++) assert.ok(Math.abs(sine[k - 1] - R * Math.sin(k * 3.75 * Math.PI / 180)) < 1, `sine ${k} is R·sin(${k}×3°45′) to the unit`);
  for (let k = 2; k <= 24; k++) assert.ok(sine[k - 1] - sine[k - 2] <= (k > 2 ? sine[k - 2] - sine[k - 3 >= 0 ? k - 3 : 0] : 225), `differences shrink at ${k}`);
});

test('the text proves its own calendar: the yuga counts follow from three integers (1.34-1.39)', () => {
  const sun = item('1.29', 0), moon = item('1.30', 0), risings = item('1.34', 0);
  assert.equal(item('1.37', 0), risings - sun);
  assert.equal(item('1.39', 0), 12 * sun);
  assert.equal(item('1.38', 0), (moon - sun) - 12 * sun);
  assert.equal(item('1.37', 1), 30 * (moon - sun));
  assert.equal(item('1.38', 1), 30 * (moon - sun) - (risings - sun));
  assert.equal(item('1.47', 0) + 1296000 + 864000, 1955880000, 'Kṛta end + Tretā + Dvāpara = the Kali start');
});

test('the epicycles: every odd end is below its even end, and Mars\'s odd end is 72 (dvi-aga), not 70', () => {
  const m = reg.verses.find((x) => x.v === '2.35').items.map((x) => x.n);
  for (let i = 0; i < 5; i++) assert.ok(m[i + 5] < m[i], `manda pair ${i}`);
  assert.equal(m[5], 72);
});

test('the edition prints every registered number in its verse block, and none of the slips it once called variants', () => {
  const missing = [], present = [];
  for (const v of reg.verses) {
    const b = block(v.v);
    const bNoFix = b.replace(/<p><span class="lbl decode fix">[\s\S]*?<\/p>/g, '');   // the correction notes may name what was wrong
    for (const it of v.items) if (!new RegExp(`(^|[^0-9.])${it.n}([^0-9]|$)`).test(b)) missing.push(`${v.v} ${it.what} = ${it.n}`);
    for (const bad of v.forbidden || []) {
      const re = new RegExp(`(^|[^0-9.])${bad.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![0-9]|\\.[0-9])`);
      if (re.test(bNoFix)) present.push(`${v.v} prints ${bad}`);
    }
  }
  assert.deepEqual(present, [], 'slips still printed');
  assert.deepEqual(missing, [], 'numbers the edition does not print in their verse');
});

test('no slip once corrected comes back anywhere in the edition (register: edition_forbidden)', () => {
  const body = edition
    .replace(/<p><span class="lbl decode fix">[\s\S]*?<\/p>/g, '')                       // correction notes may name the slip
    .replace(/\((?:Correction|सुधार) 2026-10-07:[^)]*\)/g, '');
  const found = [];
  for (const { text, why } of reg.edition_forbidden) {
    const re = new RegExp(`(^|[^0-9.])${text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![0-9])`);
    if (re.test(body)) found.push(`${text} — ${why}`);
  }
  assert.deepEqual(found, []);
});
