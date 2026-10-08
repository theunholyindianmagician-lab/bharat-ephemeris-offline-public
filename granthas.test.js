'use strict';
/*
 * granthas.test.js — the small editions must agree with their own mathematics.
 *
 * Āryabhaṭa wrote his yuga revolutions in his own letter-numerals (Gītikā 3): varga consonants k…m = 1…25, avarga
 * y…h = 30…100, each vowel a place of 100 (a 1, i 100, u 100², ṛ 100³, ḷ 100⁴, …). The edition's IAST is decoded word
 * by word here and must give the numbers the same page states in its anvaya, the numbers the dataset records, and the
 * numbers kala-dvara.js computes with. Two misprints (ṇlṛ for ṇḷ, a stray d in ḍhuṅvighva) were found this way on
 * 2026-10-07; this test keeps them from coming back. The other corrected verses must keep the witness readings that
 * make their formulas follow (madhava 1.1 triśarādi, brahmagupta 12.21 bhujona, aryabhata 3.9 nausthaḥ).
 */
const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const K = require('./katapayadi.js');
const KD = require('./kala-dvara.js');

const read = (f) => fs.readFileSync(path.join(__dirname, 'editions', f), 'utf8');
const verse = (html, vnum) => {
  const i = html.indexOf(`<div class="vnum">${vnum}`);
  assert.ok(i >= 0, `verse ${vnum} present`);
  return html.slice(i, html.indexOf('</article>', i));
};
const iastOf = (block) => block.match(/<div class="iast">([\s\S]*?)<\/div>/)[1].replace(/<br\/?>/g, ' ');

test('decoder: the place rule on single syllables and a known word', () => {
  assert.equal(K.decodeAryabhata('ka'), 1n);
  assert.equal(K.decodeAryabhata('ki'), 100n);
  assert.equal(K.decodeAryabhata('ya'), 30n);
  assert.equal(K.decodeAryabhata('hḷ'), 100n * 100n ** 4n);
  assert.equal(K.decodeAryabhata('khyughṛ'), 4320000n);                // kh 2 + y 30 → u: 32×100²; gh 4 → ṛ: 4×100³
  assert.equal(K.decodeAryabhata('kṣa'), 81n);                          // a cluster adds: k 1 + ṣ 80, on the vowel's place
  assert.throws(() => K.decodeAryabhata('qa'));                         // a letter outside his code
});

test('Āryabhaṭa Gītikā 3: every revolution word in the edition decodes to the stated number', () => {
  const html = read('aryabhata-full-edition.html');
  const iast = iastOf(verse(html, '१.१'));
  const words = { khyughṛ: 4320000n, cayagiyiṅśuchlṛ: 57753336n, 'ṅiśibuṇḷṣkhṛ': 1582237500n, 'ḍhuṅvighva': 146564n, khricyubha: 364224n, bhadlijhnukhṛ: 2296824n };
  for (const [w, n] of Object.entries(words)) {
    assert.ok(iast.includes(w), `edition IAST carries ${w}`);
    assert.equal(K.decodeAryabhata(w), n, w);
  }
  assert.ok(!iast.includes('ṇlṛ') && !iast.includes('ḍhuṅdvighva'), 'the misprints are gone');
  assert.ok(html.includes('1,582,237,500'), 'the anvaya states the rotations');
});

test('Āryabhaṭa: the engine computes with the decoded numbers; civil days = rotations − solar revolutions', () => {
  const A = KD.CANON.aryabhata;
  assert.equal(A.risings, K.decodeAryabhata('ṅiśibuṇḷṣkhṛ'));
  assert.equal(A.sun, K.decodeAryabhata('khyughṛ'));
  assert.equal(A.moon, K.decodeAryabhata('cayagiyiṅśuchlṛ'));
  assert.equal(K.decodeAryabhata('ṅiśibuṇḷṣkhṛ') - K.decodeAryabhata('khyughṛ'), 1577917500n);
});

test('the dataset copy agrees with the decode (Saturn 146,564, rotations 1,582,237,500)', () => {
  const ds = fs.readFileSync(path.join(__dirname, 'downloads', 'Aryabhata_Full_Dataset.json'), 'utf8');
  assert.match(ds, /'Earth_Rotations': 1582237500, 'Saturn': 146564/);
});

test('witness readings that make the formulas follow are kept', () => {
  assert.ok(iastOf(verse(read('aryabhata-full-edition.html'), '३.९')).includes('anulomagatirnausthaḥ'));
  const m = iastOf(verse(read('madhava-full-edition.html'), '१.१'));
  assert.ok(m.includes('vyāsasāgarābhihate') && m.includes('triśarādiviṣama'));       // 3, 5, … : śara = 5
  const b = iastOf(verse(read('brahmagupta-full-edition.html'), '१२.२१'));
  assert.ok(b.includes('bhujayogārdhacatuṣṭayabhujonaghātāt'));                       // (s−a)(s−b)(s−c)(s−d)
});

test('verses whose Sanskrit does not state the formula shown carry an "unverified" flag', () => {
  const flags = [['madhava-full-edition.html', '१.२'], ['brahmagupta-full-edition.html', '१८.३०-३२'], ['brahmagupta-full-edition.html', '१८.६४-६५'], ['bhaskara-full-edition.html', '१.१'], ['bhaskara-full-edition.html', '२.१']];
  for (const [f, v] of flags) assert.match(verse(read(f), v), /अप्रमाणित: [^<]*Unverified/, `${f} ${v}`);
});

test('[text] Mādhava\'s paridhi verse (bhūtasaṃkhyā, math-core.js): its word values against the Sūrya-Siddhānta\'s own verse words — six attested with these values, two by synonym, three not in the corpus; the circumference integer and π from them', () => {
  const src = fs.readFileSync(path.join(__dirname, 'math-core.js'), 'utf8');
  const block = src.slice(src.indexOf('const MADHAVA_PARIDHI_VERSE'), src.indexOf('diameterWords:', src.indexOf('const MADHAVA_PARIDHI_VERSE')));
  const words = [...block.matchAll(/iast: "([^"]+)", value: (\d+)/g)].map((m) => ({ w: m[1], v: Number(m[2]) }));
  assert.equal(words.length, 11);
  const numbers = JSON.parse(fs.readFileSync(path.join(__dirname, 'corpus', 'surya-siddhanta', 'numbers.json'), 'utf8'));
  const lex = require('./samskara.js').lexiconFromVerses(numbers);                 // digit → the SS's own words for it
  const valueIn = (w) => lex.flatMap((list, d) => (list.includes(w) ? [d] : []));
  const attested = { netra: 2, gaja: 8, hutāśana: 3, guṇa: 3, veda: 4 };
  for (const [w, v] of Object.entries(attested)) assert.ok(valueIn(w).includes(v), `${w} = ${v} in the SS's words`);
  assert.ok(valueIn('nava').includes(9));
  for (const { w, v } of words) if (attested[w] !== undefined) assert.equal(v, attested[w], w);
  for (const syn of ['sarpa', 'bhujaṅga', 'kuñjara']) assert.ok(valueIn(syn).includes(8), `${syn} = 8: ahi and vāraṇa by synonym`);
  for (const w of ['vibudha', 'bha', 'bāhavaḥ']) assert.deepEqual(valueIn(w), [], `${w}: not in the SS corpus`);
  const C = BigInt(words.map((x) => String(x.v)).reverse().join(''));                // aṅkānāṃ vāmato gatiḥ
  assert.equal(C, 2827433388233n);
  const q = C * 10n ** 12n / (9n * 10n ** 11n);                                        // 3.141592653592…
  assert.equal(q, 3141592653592n);
});

/* ───────────────────────── council fixes, 2026-10-07 ─────────────────────────
 * The library reader and the downloads must show only verses this repository can witness. Every reader śloka carries a
 * `source`: an edition locus whose text carries every pāda, or "स्रोत अपरीक्षित · source unverified". The Sūrya-Siddhānta
 * ślokas must BE the edition's verses (council satya P0-1: 13 of 15 were not). The corrected edition readings must not come
 * back outside the dated correction notes (ṛṣi-pāṭha RP-01, RP-02, RP-06), and Devanāgarī and IAST must agree (RP-07).
 */
const root = (f) => fs.readFileSync(path.join(__dirname, f), 'utf8');
const unesc = (s) => s.replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
const deva = (s) => unesc(s).normalize('NFC').replace(/[^\u0900-\u097F]|[\u0964\u0965\u093D\u0966-\u096F]/g, '');
const iastN = (s) => unesc(s).normalize('NFC').toLowerCase().replace(/[^a-zāīūṛṝḷḹṃṁḥṅñṭḍṇśṣ]/g, '');
const plain = (s) => unesc(s.replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim();
const libraryCorpus = () => JSON.parse(root('library.html').match(/const granthaCorpus = (\{[\s\S]*?\n\s*\});/)[1]);
const ssVerses = () => [...read('surya-siddhanta-full-edition.html').matchAll(/<article class="verse" id="(v\d+-\d+)">([\s\S]*?)<\/article>/g)].map((m) => ({
  id: m[1], vnum: m[2].match(/<div class="vnum">([^<]*)<\/div>/)[1], sa: m[2].match(/<div class="sa">([\s\S]*?)<\/div>/)[1].replace(/<br>/g, ' '),
  iast: m[2].match(/<div class="iast">([\s\S]*?)<\/div>/)[1].replace(/<br>/g, ' '), eng: plain((m[2].match(/<span class="lbl eng">[^<]*<\/span>([\s\S]*?)<\/p>/) || [, ''])[1]) }));
const BUNDLES = ['Tri', 'Quad', 'Deca', 'Dodeca'].map((n) => [`downloads/Complete_${n}_Grantha_Collector_Bundle.json`, JSON.parse(root(`downloads/Complete_${n}_Grantha_Collector_Bundle.json`)).corpora]);

test('[satya P0-1] every Sūrya-Siddhānta śloka of the reader, the dataset and the bundles is a verse of the repository\'s own edition', () => {
  const byId = new Map(ssVerses().map((v) => [v.id, v]));
  assert.equal(byId.size, 500);
  const check = (D, where) => {
    let n = 0;
    for (const ch of D.chapters) for (const sl of ch.slokas) {
      n++;
      const m = /editions\/surya-siddhanta-full-edition\.html#(v\d+-\d+)/.exec(sl.source || '');
      assert.ok(m, `${where} ch${ch.num}: the source names an edition verse`);
      const v = byId.get(m[1]);
      assert.ok(v, `${where} ch${ch.num}: ${m[1]} exists`);
      assert.equal(v.vnum.split('.')[0], String(ch.num), `${where} ch${ch.num}: the verse belongs to that adhikāra`);
      assert.equal(deva(sl.deva), deva(v.sa), `${where} ch${ch.num} SS ${v.vnum}: Devanāgarī as printed`);
      assert.equal(iastN(sl.translit), iastN(v.iast), `${where} ch${ch.num} SS ${v.vnum}: IAST as printed`);
      assert.ok(sl.meter.includes(v.vnum), `${where} ch${ch.num}: the verse number is shown`);
      assert.equal(sl.translation.replace(/\s+/g, ' '), v.eng, `${where} ch${ch.num} SS ${v.vnum}: the edition's English rendering`);
    }
    assert.ok(n >= 14, where);
  };
  check(libraryCorpus().surya, 'library.html');
  check(JSON.parse(root('downloads/Surya_Siddhanta_Rahasya_Full_Dataset.json')), 'downloads dataset');
  for (const [f, c] of BUNDLES) check(c.surya, f);
  // the dossier and notebook render the same verses, not the old ones
  for (const f of ['downloads/Surya_Siddhanta_Rahasya_Sovereign_Dossier.md', 'downloads/Surya_Siddhanta_Rahasya_Complete_Suite.ipynb']) {
    const t = root(f);
    for (const old of ['षट्त्रिंशत् कोटयो वर्षाः', 'कालांशा द्वादश ज्ञेया', 'गोलं बद्ध्वा परीक्षेत']) assert.ok(!t.includes(old), `${f} still shows a verse the edition does not have: ${old}`);
  }
});

test('[satya P1-3] the reader and the downloads carry the corrected Gītikā words, and they decode to the stated numbers', () => {
  const words = { khyughṛ: 4320000n, cayagiyiṅśuchlṛ: 57753336n, 'ṅiśibuṇḷṣkhṛ': 1582237500n, 'ḍhuṅvighva': 146564n, khricyubha: 364224n, bhadlijhnukhṛ: 2296824n };
  const sources = [['library.html', libraryCorpus().aryabhata], ['downloads/Aryabhata_Full_Dataset.json', JSON.parse(root('downloads/Aryabhata_Full_Dataset.json'))],
    ...BUNDLES.filter(([, c]) => c.aryabhata).map(([f, c]) => [f, c.aryabhata])];
  assert.equal(sources.length, 4);
  for (const [where, D] of sources) {
    const sl = D.chapters[0].slokas[0];
    for (const [w, n] of Object.entries(words)) {
      assert.ok(sl.translit.includes(w), `${where}: carries ${w}`);
      assert.equal(K.decodeAryabhata(w), n, w);
    }
    assert.ok(!sl.translit.includes('ṇlṛ') && !sl.translit.includes('ḍhuṅdvighva') && !sl.deva.includes('ढुङ्द्विघ्व'), `${where}: the misprints are gone`);
  }
  for (const f of ['downloads/Aryabhata_Sovereign_Dossier.md', 'downloads/Aryabhata_Complete_Suite.ipynb']) {
    const t = root(f);
    assert.ok(t.includes('ṅiśibuṇḷṣkhṛ') && !t.includes('ṇlṛ') && !t.includes('ḍhuṅdvighva'), f);
  }
});

test('every reader śloka (library, datasets, annexes) names its source; a named edition carries every pāda; the rest say "source unverified"', () => {
  const corpora = { ...libraryCorpus() };
  for (const [k, f] of [['shunya_quantum', 'ShunyaQuantum'], ['rasayana_dhatu', 'RasayanaDhatu']]) corpora[k] = JSON.parse(root(`downloads/${f}_Full_Dataset.json`));
  const cache = {};
  const text = (f) => cache[f] || (cache[f] = (() => { const t = unesc(root(f).replace(/<[^>]+>/g, ' ')); return { d: deva(t), i: iastN(t) }; })());
  let located = 0, unverified = 0;
  for (const [book, D] of Object.entries(corpora)) for (const ch of D.chapters) for (const sl of ch.slokas || []) {
    assert.ok(typeof sl.source === 'string' && sl.source.length > 10, `${book} ch${ch.num}: source`);
    if (/unverified/.test(sl.source)) { assert.match(sl.source, /स्रोत अपरीक्षित/); unverified++; continue; }
    const f = /^(editions\/[a-z-]+\.html)/.exec(sl.source);
    assert.ok(f, `${book} ch${ch.num}: the source names an edition file`);
    const E = text(f[1]);
    const dl = sl.deva.split(/[\n।॥|]+/).filter((x) => deva(x));
    const il = sl.translit.split(/[\n।॥|]+/).filter((x) => iastN(x));
    dl.forEach((p, j) => assert.ok(E.d.includes(deva(p)) || (il[j] && iastN(il[j]).length > 3 && E.i.includes(iastN(il[j]))), `${book} ch${ch.num}: pāda “${p.trim()}” is in ${f[1]}`));
    located++;
  }
  assert.ok(located >= 120 && unverified >= 20, `${located} located, ${unverified} unverified`);
  // the dataset copies carry the same sources
  for (const [k, f] of Object.entries({ grantha: 'Paramanu_Bija_Ganita', panini: 'Panini_Rahasya', bhaskara: 'Bhaskara', parashara: 'Parashara_Rahasya' })) {
    assert.deepEqual(JSON.parse(root(`downloads/${f}_Full_Dataset.json`)).chapters.map((c) => c.slokas.map((s) => s.source)), corpora[k].chapters.map((c) => c.slokas.map((s) => s.source)), f);
  }
});

test('[ṛṣi-pāṭha RP-05] the Kaṭapayādi rule verse\'s second line and its attribution are marked unverified wherever they appear', () => {
  const records = [['library.html', libraryCorpus().panini], ['downloads/Panini_Rahasya_Full_Dataset.json', JSON.parse(root('downloads/Panini_Rahasya_Full_Dataset.json'))],
    ...BUNDLES.filter(([, c]) => c.panini).map(([f, c]) => [f, c.panini])];
  let seen = 0;
  for (const [where, D] of records) for (const ch of D.chapters) for (const sl of ch.slokas) {
    if (/tūpāntyahal|तूपान्त्यहल्/.test(sl.translit + sl.deva)) { seen++; assert.match(sl.source || '', /unverified/, `${where} ch${ch.num}`); }
  }
  assert.equal(seen, records.length);
  const t = root('downloads/Panini_Rahasya_Sovereign_Dossier.md'), i = t.indexOf('तूपान्त्यहल्');
  assert.ok(i > 0 && /unverified/.test(t.slice(i, i + 1500)), 'dossier: the Source line follows the verse');
});

const tr = (s) => {                                   // Devanāgarī → IAST, the edition's conventions (ṃ for anusvāra, ' for avagraha)
  const C = { 'क': 'k', 'ख': 'kh', 'ग': 'g', 'घ': 'gh', 'ङ': 'ṅ', 'च': 'c', 'छ': 'ch', 'ज': 'j', 'झ': 'jh', 'ञ': 'ñ', 'ट': 'ṭ', 'ठ': 'ṭh', 'ड': 'ḍ', 'ढ': 'ḍh', 'ण': 'ṇ', 'त': 't', 'थ': 'th', 'द': 'd', 'ध': 'dh', 'न': 'n', 'प': 'p', 'फ': 'ph', 'ब': 'b', 'भ': 'bh', 'म': 'm', 'य': 'y', 'र': 'r', 'ल': 'l', 'व': 'v', 'श': 'ś', 'ष': 'ṣ', 'स': 's', 'ह': 'h', 'ळ': 'ḷ' };
  const V = { 'अ': 'a', 'आ': 'ā', 'इ': 'i', 'ई': 'ī', 'उ': 'u', 'ऊ': 'ū', 'ऋ': 'ṛ', 'ॠ': 'ṝ', 'ऌ': 'ḷ', 'ए': 'e', 'ऐ': 'ai', 'ओ': 'o', 'औ': 'au' };
  const M = { 'ा': 'ā', 'ि': 'i', 'ी': 'ī', 'ु': 'u', 'ू': 'ū', 'ृ': 'ṛ', 'ॄ': 'ṝ', 'ॢ': 'ḷ', 'े': 'e', 'ै': 'ai', 'ो': 'o', 'ौ': 'au' };
  const t = s.normalize('NFC'); let out = '';
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (C[c]) { out += C[c]; const n = t[i + 1]; if (n === '्') i++; else if (M[n]) { out += M[n]; i++; } else out += 'a'; }
    else if (V[c]) out += V[c];
    else if (c === 'ं') out += 'ṃ';
    else if (c === 'ः') out += 'ḥ';
    else if (c === 'ऽ') out += "'";
    else out += c;
  }
  return out;
};
const lettersOnly = (s) => unesc(s).normalize('NFC').toLowerCase().replace(/<br>/g, ' ').replace(/[\s|।॥/'’]/g, '');

test('[ṛṣi-pāṭha RP-07] the Sūrya-Siddhānta edition\'s Devanāgarī and IAST agree letter for letter in all 500 verses', () => {
  const bad = ssVerses().filter((v) => lettersOnly(tr(v.sa)) !== lettersOnly(v.iast)).map((v) => v.vnum);
  assert.deepEqual(bad, []);
});

test('[ṛṣi-pāṭha RP-01, RP-02, RP-06] corrected readings do not come back outside the dated correction notes', () => {
  const ed = read('surya-siddhanta-full-edition.html').replace(/<p><span class="lbl decode fix">[\s\S]*?<\/p>/g, '');
  const OLD = ['तांरपात्रं', 'tāṃrapātraṃ', 'छेच्केद्', '।। checked', 'अस्त्मयोदयौ', 'कृष्ततनु',                               // RP-01, RP-02, RP-07
    'अर्ध-व्यास √(R² − क्रान्तिज्या²)', 'षष्ठ्या = ६० से', 'षष्ठि-भाजिताः', 'उसमें फल का गुणन करें', 'एकज्या-अर्ध-गतः छेदः',      // RP-06: 3.35, 4.13, 4.14, 4.26, 5.7
    'छेद एकज्या का आधा है', 'half the <em>ekajyā</em>', 'cheda = ekajyā ⁄ 2', 'cheda = <em>R</em> ⁄ 2', 'cheda = <em>R</em>/2',
    'इन्दोः भानोः = चन्द्र और सूर्य के लिए', 'सूर्य-चन्द्र पर दिशा-विपर्यय करें', 'कृष्णता-अरुणम्', 'में कृष्णता प्रमुख कही गई',       // 6.9, 6.23
    'सूर्य से बारह अंश आगे बढ़ जाने पर', 'तो उन्हें जोड़ो, भिन्न दिशा में हों तो घटाओ', 'भू-कर्ण (पृथ्वी-त्रिज्या', 'करण (प्रेक्षण या सिद्ध करण)', // 10.1, 10.6, 12.84, 3.11
    'breath-unit', 'measure in respirations'];                                                                           // VAI-17
  for (const s of OLD) assert.ok(!ed.includes(s), `the edition still says: ${s}`);
  assert.ok(iastOf(verse(read('surya-siddhanta-full-edition.html'), '13.23')).startsWith('tāmrapātraṃ'));
});

test('[ṛṣi-pāṭha RP-04, rakṣaka R-04, satya P0-6] the Mahā-grantha edition: no false Kaṭapayādi claim, no private paths or codes, no unqualified hardware claim', () => {
  const mg = read('maha-grantha-full-edition.html');
  for (const bad of ['कटपयादि-संख्या-system', '0+5=5', 'पर सत्यापित Sacred-Trinity', 'machine-verified across']) {
    assert.ok(!mg.includes(bad), `maha-grantha still contains: ${bad}`);
  }
  // private material is guarded by its shape, never by spelling the value out (this file is published)
  assert.doesNotMatch(mg, /endorsement/i, 'an arXiv endorsement note');
  assert.doesNotMatch(mg, /~\/[A-Za-z.]/, 'a home-folder path');
  for (const line of mg.split('\n')) {
    if (/ibm_(kingston|marrakesh|fez)|Heron r2/.test(line) && line.trim().endsWith('</p>')) assert.match(line, /unverified/, line.slice(0, 140));
  }
  assert.match(mg, /id="edition-notice"[\s\S]{0,400}not medical advice[\s\S]{0,600}no job ID, result file or count data/);
  for (const f of fs.readdirSync(path.join(__dirname, 'downloads'))) {
    assert.doesNotMatch(root('downloads/' + f), /hardware benchmarks executed|पर सत्यापित Sacred-Trinity/, f);
  }
});

test('[post-launch audit INT-1, INT-2, INT-3, INT-8] no edition carries drafting scratch, agent reports or AI-operator credits', () => {
  // each phrase is split by a one-letter class so that this file does not itself carry the phrases export-public.cjs bans
  const SCRATCH = /\b(?:le[t] me (?:redo|recompute|output|use)|i nee[d] to clean up)\b|\bwait\s*[-—:,]|— er,|\?\s*skip\.|refined example[s]|better classic[s]|task complet[e]\.|batch complet[e]:|rendered (?:above|per style-promp[t])/i;
  const CREDIT = /\b(?:claud[e]|anthropi[c]|chatgp[t]|antigravit[y]|opena[i])\b|CLAUDE[.]md|CLAUDE-VRA[T]|OPERATORS-BOOTE[D]|MASTER-TRACKE[R]|KAAL-DISCIPLINE[.]md|ZENODO_TOKE[N]|tool-call ledge[r]/i;
  for (const f of fs.readdirSync(path.join(__dirname, 'editions')).filter((f) => f.endsWith('.html'))) {
    read(f).split('\n').forEach((line, i) => {
      assert.doesNotMatch(line, SCRATCH, `${f}:${i + 1}`);
      assert.doesNotMatch(line, CREDIT, `${f}:${i + 1}`);
    });
  }
});

test('[vaidya VAI-01, VAI-05, VAI-08, VAI-10, VAI-12] health and fear text is gone from the library and the downloads; the prāṇa is a unit of time', () => {
  const texts = { 'library.html': root('library.html') };
  for (const f of fs.readdirSync(path.join(__dirname, 'downloads'))) texts['downloads/' + f] = root('downloads/' + f);
  for (const [f, t] of Object.entries(texts)) {
    assert.doesNotMatch(t, /जरा-मृत्यु|halts cellular decay|ROS\) oxidation|Spermidine|metabolic_suppression|Hinge|hinge|दारुणा|terminal release|21,600 Breaths|human respiration cycle|respiration chronometry/, f);
  }
  const lib = texts['library.html'];
  assert.doesNotMatch(lib, /धातु-द्वार|सुश्रुत|KOSH-verified|Breath-Kośa|श्वास-कोष|सिद्ध अध्याय|No invented citations|कोई नकली citation नहीं|THE SOVEREIGN LIBRARY/);
  assert.match(lib, /चिकित्सा-परामर्श नहीं/); assert.match(lib, /not medical advice/); assert.match(lib, /class="breath-caution"/);
  const q = JSON.parse(texts['downloads/ShunyaQuantum_Full_Dataset.json']);
  assert.deepEqual(q.chapters.map((c) => c.num), [1, 2, 3, 4], 'ShunyaQuantum: the 31.5 °C chapter is removed');
  assert.match(q.chapters[2].overview, /No quantum-hardware result is recorded in this repository; the 71\.4% figure is a constant written in the snippet/);
  for (const f of fs.readdirSync(path.join(__dirname, 'downloads')).filter((x) => x.endsWith('_Sovereign_Dossier.md'))) assert.match(texts['downloads/' + f], /not medical advice/, f);
  const s13 = libraryCorpus().surya.chapters[12].formula.latex;
  assert.match(s13, /360 \\text\{ Prāṇas\}/, '1 ghaṭī = 60 pala × 6 prāṇa = 360 prāṇa');
  assert.ok(!s13.includes('21,600'));
});

test('[vaidya VAI-07, VAI-13] BPHS 93.2 says plainly, in Hindi and English, that it must not be followed; the lifespan, death and fasting chapters carry a health note', () => {
  const b = read('parashara-rahasya-full-edition.html');
  const v = verse(b, '93.2');
  for (const s of ['आचरण-निर्देश नहीं', 'बाल-चिकित्सक', 'must not be followed', 'paediatrician']) assert.ok(v.includes(s), s);
  for (const c of [9, 10, 19, 43, 44, 83, 93]) {
    const i = b.indexOf(`<section class="chapter" id="ch${c}">`);
    assert.ok(b.slice(i, b.indexOf('<article', i)).includes('class="health-note"'), `ch${c}`);
  }
  assert.match(b, /यह एक ऐतिहासिक ग्रन्थ है, चिकित्सा-परामर्श नहीं। · This is a historical text, not medical advice\./);
});
