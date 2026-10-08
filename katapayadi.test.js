'use strict';
/*
 * katapayadi.test.js — every fixture is a Kaṭapayādi word from a TEXT, with its stated value, or a
 * mathematical identity the decoded value must satisfy. No modern ephemeris, no Swiss, no JPL.
 *
 * Sources (file:line are this repo; URLs were readable only as search snippets through this session's proxy):
 *   [SRM] the rule verse "nañāvacaśca śūnyāni…", commonly attributed to the Sadratnamālā (Śaṅkaravarman, 1819) — [unverified: no printed
 *         witness in this repository; editions/panini-rahasya-full-edition.html gives only the opening words and hedges the attribution].
 *         The table below is checked as the letter-digit map katapayadi.js implements, and against the edition's printed table.
 *   [JM]  Nīlakaṇṭha Somayājī, Jyotirmīmāṃsā (ed. K. V. Sarma, VVRI Hoshiarpur 1977), pp. 1–2, 11, 31–36 (§1, §14):
 *         the Kaṭapayādi ahargaṇas of his own eclipses, the Śakābda constants, the worked eclipse example.
 *   [MJ]  Mādhava's 24 Rsines (Nīlakaṇṭha's Āryabhaṭīya-bhāṣya; Yuktidīpikā) and the "vidvān…" R-sine series (Karaṇapaddhati ch. 6).
 *   [CV]  Candravākyas: Vararuci's "gīrnaḥ śreyaḥ" = 12°03′, Mādhava's "śīlaṃ rājñaḥ śriye" = 12°02′35″ (J. Astrophys. Astr. 46 (2025) art. 4; Sarma 1956/1973).
 *   [MK]  72-melakarta rule (first two syllables, vāmato gatiḥ).
 *   [BKT] "gopībhāgya madhuvrātaḥ…": often cited from Bhāratī Kṛṣṇa Tīrtha, Vedic Mathematics (Motilal Banarsidass, 1965) — [unverified: no
 *         copy in this repository; the verse's origin is unresolved]. Its 32 digits are checked by decoding, not by the citation.
 */
const assert = require('node:assert/strict');
const { test } = require('node:test');
const K = require('./katapayadi.js');
const PI = '314159265358979323846264338327950288419716939937510';
const v = (w) => K.decodeWord(w).value;

test('[SRM] table: each series carries 1..9,0 in order; zero = ña, na, standalone vowel', () => {
  const rows = [['क', 'ख', 'ग', 'घ', 'ङ', 'च', 'छ', 'ज', 'झ', 'ञ'], ['ट', 'ठ', 'ड', 'ढ', 'ण', 'त', 'थ', 'द', 'ध', 'न'], ['प', 'फ', 'ब', 'भ', 'म'], ['य', 'र', 'ल', 'व', 'श', 'ष', 'स', 'ह', 'ळ']];
  for (const row of rows) row.forEach((c, i) => assert.equal(K.DEVA[c], (i + 1) % 10, c));
  assert.equal(K.DEVA['न'], 0); assert.equal(K.DEVA['ञ'], 0); assert.equal(K.DEVA['ण'], 5);
  assert.deepEqual(K.syllables('अ').map((x) => x.digit), [0]);
});

test('[RP-03] the Pāṇini edition\'s printed Kaṭapayādi table: every letter sits under the digit katapayadi.js gives it', () => {
  const fs = require('node:fs'), path = require('node:path');
  const ed = fs.readFileSync(path.join(__dirname, 'editions', 'panini-rahasya-full-edition.html'), 'utf8');
  const m = ed.match(/<table class='mdtable' id='katapayadi-table'>([\s\S]*?)<\/table>/);
  assert.ok(m, 'the table is present');
  const rows = [...m[1].matchAll(/<tr>([\s\S]*?)<\/tr>/g)].map((r) => [...r[1].matchAll(/<td>([^<]*)<\/td>/g)].map((c) => c[1].trim())).filter((r) => r.length);
  assert.equal(rows.length, 10, 'ten digit rows');
  let pairs = 0;
  for (const [digit, ...letters] of rows) {
    for (const cell of letters) {
      const letter = cell.replace(/[()]/g, '');
      if (letter === '—') continue;
      assert.equal(K.DEVA[letter], Number(digit), `${letter} under ${digit}`); pairs++;
    }
  }
  assert.equal(pairs, 34, 'all 34 letters of the four series (with ळ)');
  assert.ok(!ed.includes('<th>त-वर्ग</th>'), 'no separate ta-series column (ta–dha are 6–9 of the ṭa-series)');
});

test('[SRM] rules: vowel signs, anusvāra, visarga carry nothing; conjunct → last consonant; vowel-less final consonant ignored', () => {
  assert.deepEqual(K.syllables('कं कः का कि').map((x) => x.digit), [1, 1, 1, 1]);
  assert.equal(K.syllables('क्ष')[0].digit, 6);          // kṣa → ṣa (NOT zero)
  assert.equal(K.syllables('ग्य')[0].digit, 1);          // gya → ya
  assert.equal(K.syllables('kṣa')[0].digit, 6);
  assert.equal(v('vidvān'), 44n);                        // final n without vowel is not counted [MJ]
  assert.equal(v('विद्वान्'), 44n);
});

test('[JM] Nīlakaṇṭha writes Kali-ahargaṇas as Kaṭapayādi words (Jyotirmīmāṃsā pp. 1–2, 31)', () => {
  assert.equal(v("hrāsavṛddhyādito'rkaḥ"), 1681472n);   // his total solar eclipse at Syānandūrapura (Trivandrum)
  assert.equal(v('saṃbhuñjītāhistapanam'), 1686847n);   // his total solar eclipse at Harihara
  assert.equal(v("grāhyo'ntyagrahānte'rkaḥ"), 1682112n); // the common date for comparing the siddhāntas
  assert.equal(v('ह्रासवृद्ध्यादितोऽर्कः'), 1681472n);
  assert.equal(v('संभुञ्जीताहिस्तपनम्'), 1686847n);
});

test('[JM] Śakābda-saṃskāra constants and the §14 worked example are Kaṭapayādi words', () => {
  assert.equal(v('vāgbhāva'), 444n);                     // Śaka 444, the epoch of the correction
  assert.equal(v('māgara'), 235n);                       // the divisor
  assert.equal(v('nakha'), 20n);                         // deśāntara 20 vināḍī at Aśvatthagrāma
  assert.equal(v('duṣkarā'), 218n);                      // equinoctial shadow 2 aṅgula 18 vyaṅgula
  assert.equal(v('avama'), 540n);                        // day-fraction 5 ghaṭī 40 vighaṭī
  assert.equal(v('haṃsa'), 78n);                         // bhujāphala 78′
  assert.equal(v('jāgati rathī'), 72638n);               // kālalagna 7s 26°38′
  assert.equal(v('manye vanasthaḥ'), 70415n);            // mean Moon 7s 04°15′
  assert.equal(v('madhyaṃ sūkṣmaṃ hyarkaḥ'), 115715n);   // mean Sun …11°57′15″
  assert.equal(v('tantradhī rājā'), 82926n);             // node 8s 29°26′ (the edition's print differs — recorded in APEX notes)
  assert.equal(v('tantraṃ vedyam'), 1426n);              // ayanāṃśa 14°26′
});

test('[MJ] Mādhava: R = 3437′44″48‴ and the first Rsine 224′50″22‴ are Kaṭapayādi words that satisfy R·sin θ', () => {
  const R = v('devo viśvasthalī bhṛguḥ');                // 3437′44″48‴ → digits 34374448
  const s1 = v('śreṣṭhaṃ nāma variṣṭhānāṃ');            // 0224′50″22‴ → 02245022
  assert.equal(R, 34374448n); assert.equal(s1, 2245022n);
  const toMin = (n) => { const d = String(n).padStart(8, '0'); return +d.slice(0, 4) + d.slice(4, 6) / 60 + d.slice(6, 8) / 3600; };
  assert.ok(Math.abs(toMin(R) - 21600 / (2 * Math.PI)) < 1 / 3600, 'R = 21600/2π to the third');
  assert.ok(Math.abs(toMin(s1) - toMin(R) * Math.sin(3.75 * Math.PI / 180)) < 1 / 3600, 'Rsin 3.75° to the third');
});

test('[MJ] ḷa = 9: two Mādhava Rsines are words with ḷ, and they equal R·sin θ only if ḷ = 9', () => {
  const R = 3437 + 44 / 60 + 48 / 3600;                          // arcminutes
  const arcmin = (n) => Math.floor(Number(n) / 100) + (Number(n) % 100) / 60;
  const a = v('tanvī vrīḷāniṣṭhā'), b = v('mṛṇāḷināḷīkam');      // 2092′46″ at 37.5°, 1909′55″ at 33.75°
  assert.equal(a, 209246n); assert.equal(b, 190955n);
  assert.ok(Math.abs(arcmin(a) - R * Math.sin(37.5 * Math.PI / 180)) < 1 / 60, 'Rsin 37.5° to the second');
  assert.ok(Math.abs(arcmin(b) - R * Math.sin(33.75 * Math.PI / 180)) < 1 / 60, 'Rsin 33.75° to the second');
  assert.notEqual(v('tanvī vrīlāniṣṭhā'), a, 'read with la = 3 the first word is a different number');
  assert.equal(K.decodeWord('ळ').value, 9n);
  assert.equal(K.decodeWord('तन्वी व्रीळानिष्ठा').value, a, 'Devanagari spelling decodes identically');
});

test('[MJ] the "vidvān" R-sine power-series coefficients decode and equal R·(π/2)^(2k+1)/(2k+1)!', () => {
  const words = ['vidvān', 'tunnabalaḥ', 'kavīśanicayaḥ', 'sarvārthaśīlasthiraḥ', 'nirviddhāṅganarendraruṅ'];
  const expect = [44n, 3306n, 160541n, 2735747n, 22203940n];
  const R = 21600 / (2 * Math.PI);
  const toMin = (n) => { const d = String(n).padStart(8, '0'); return +d.slice(0, 4) + d.slice(4, 6) / 60 + d.slice(6, 8) / 3600; };
  const fact = (n) => (n <= 1 ? 1 : n * fact(n - 1));
  words.forEach((w, i) => {
    assert.equal(v(w), expect[i], w);
    const k = 5 - i;                                     // vidvān is the k=5 term, nirviddhāṅga… the k=1 term
    assert.ok(Math.abs(toMin(expect[i]) - R * Math.pow(Math.PI / 2, 2 * k + 1) / fact(2 * k + 1)) < 1 / 3600, w);
  });
});

test('[CV] candravākya 1: Vararuci "gīrnaḥ śreyaḥ" = 12°03′; Mādhava "śīlaṃ rājñaḥ śriye" = 12°02′35″; retroflex ṇ would break it', () => {
  assert.equal(v('gīrnaḥ śreyaḥ'), 1203n);
  assert.equal(v('गीर्नःश्रेयः'), 1203n);
  assert.equal(v('śīlaṃ rājñaḥ śriye'), 120235n);
  assert.equal(v('शीलं राज्ञः श्रिये'), 120235n);
  assert.equal(v('gīrṇaḥ śreyaḥ'), 1253n);               // spelling matters: ṇ = 5
});

test('[MK] 72-melakarta rule', () => {
  assert.equal(K.melakartaNumber('mayamālavagauḷa'), 15);
  assert.equal(K.melakartaNumber('मायामालवगौळ'), 15);
  assert.equal(K.melakartaNumber('kanakāṅgi'), 1);
  assert.equal(K.melakartaNumber('dhīraśaṅkarābharaṇa'), 29);
  assert.equal(K.melakartaNumber('mecakalyāṇi'), 65);
  assert.equal(v('jaya'), 18n);                          // Mahābhārata "Jaya" → 18 (popular example, consistent)
});

test('[BKT] the π-verse: 32 digits read LEFT TO RIGHT (not vāmato gatiḥ); 31 agree with π, the 32nd does not', () => {
  const deva = 'गोपीभाग्य मधुव्रातः शृङ्गशोदधि सन्धिगः । खलजीवितखाताव गलहाला रसंधरः ॥';
  const iast = 'gopībhāgya madhuvrātaḥ śṛṅgaśodadhi sandhigaḥ | khalajīvitakhātāva galahālā rasaṃdharaḥ ||';
  for (const text of [deva, iast]) {
    const d = K.decodeWord(text).digitsWritten;
    assert.equal(d, '31415926535897932384626433832792');
    assert.equal(d.slice(0, 31), PI.slice(0, 31));
    assert.notEqual(d[31], PI[31]);                      // verse 2, π 5(0288…)
    assert.notEqual(K.decodeWord(text).digitsVamato.slice(0, 5), '31415');
  }
  // the common misspelling श्रुंग (śruṃga) for शृङ्ग changes digit 9 from 5 to 2
  assert.equal(K.decodeWord('गोपीभाग्य मधुव्रातः श्रुंगशोदधि सन्धिगः खलजीवितखाताव गलहाला रसंधरः').digitsWritten.slice(0, 10), '3141592623');
});

test('encodeInteger ↔ decodeWord round-trips (BigInt, both scripts)', () => {
  for (const n of [0n, 7n, 10n, 444n, 1681472n, 4320000n, 57753336n, 1577917828n, 328050000000n, 123456789012345678901234567890n]) {
    for (const script of ['devanagari', 'iast']) assert.equal(K.decodeWord(K.encodeInteger(n, script)).value, n, `${n} ${script}`);
  }
  assert.throws(() => K.encodeInteger(-1n));
});
