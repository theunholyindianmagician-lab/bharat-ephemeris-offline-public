'use strict';
/*
 * parampara.test.js — the ancestors' recorded eclipse readings (corpus/jyotirmimamsa/readings.json, from eclipses.json's
 * glosses), taken through the text's own clocks and fitted by the robust saṃskāra (scripts/parampara-samskara.cjs), give
 * the same correction Parameśvara published as his epoch (JM p.34): the loop the tradition ran, closed again on its own
 * records, with no modern number anywhere. [recorded]
 *
 * And the paramparā as data (owner, 2026-10-08): the registry (corpus/parampara/registry.json) and its provenance rules,
 * every quote against the line it was read from, the time-unit registry (corpus/sources/time-units.json) with every
 * textual ratio re-derived from its words, the graha layer (corpus/parampara/graha.json), and Parameśvara's saṃskāra
 * (parampara.js samskaraParameshvara) pinned to the values re-measured by the fit and to its leave-one-out test.
 * PARAMPARA_ETEXT_DIR=<dir holding jm/*.md> also re-reads each quoted e-text line from the e-texts themselves.
 */
const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const SK = require('./samskara.js');
const P = require('./scripts/parampara-samskara.cjs');
const PP = require('./parampara.js');
const K = require('./kala-dvara.js');
const KP = require('./katapayadi.js');
const V = require('./vedha-lekha.js');

const ROOT = __dirname;
const readJSON = (f) => JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'));
const REG = readJSON('corpus/parampara/registry.json');
const TU = readJSON('corpus/sources/time-units.json');
const GR = readJSON('corpus/parampara/graha.json');
const EL = readJSON('corpus/parampara/etext-lines.json');
const SAMSKARA_TEXT = fs.readFileSync(path.join(ROOT, 'corpus/parampara/samskara.json'), 'utf8');
const nfc = (s) => String(s).normalize('NFC');

test('[recorded] the readings, fitted on the text\'s model, give Parameśvara\'s own epoch correction: the elongation and the Moon − node agree within their σ', () => {
  // Parameśvara − the text's mean places at the same instant, sunrise at Laṅkā on Kali 16,51,700 (Āryabhaṭa's day begins at
  // sunrise [reading]); only differences of places are compared, which no choice of sidereal zero can move
  const par = { sun: 15 / 60, moon: 10 * 30 + 4 + 6 / 60, node: 4 * 30 + 23 + 55 / 60 };
  const w = (x) => ((x + 540) % 360) - 180, m = SK.model({}, { epoch: 1651700 }).mean(1651700.25);
  const elong = (w(par.moon - m.moon) - w(par.sun - m.sun)) * 60, argLat = (w(par.moon - m.moon) - w(par.node - m.node)) * 60;
  assert.ok(Math.abs(elong + 8.0) < 0.1 && Math.abs(argLat - 61.3) < 0.1, `Parameśvara: elongation ${elong.toFixed(2)}′, Moon − node ${argLat.toFixed(2)}′`);
  const f = P.fit(7), mo = f.params['moon.epoch'], no = f.params['node.epoch'];
  assert.equal(mo.status, 'fitted'); assert.equal(no.status, 'fitted');
  // the Sun is held, so the Moon's correction is the elongation's
  assert.ok(Math.abs(mo.delta - elong) < 2 * mo.sigma, `elongation: fit ${mo.delta} ± ${mo.sigma}′, Parameśvara ${elong.toFixed(1)}′`);
  const fitArg = mo.delta - no.delta, sArg = Math.hypot(mo.sigma, no.sigma);
  assert.ok(Math.abs(fitArg - argLat) < 2 * sArg, `Moon − node: fit ${fitArg.toFixed(1)} ± ${sArg.toFixed(1)}′, Parameśvara ${argLat.toFixed(1)}′`);
  assert.ok(f.observations >= 15 && f.rows >= 18);
});

// ── the registry ─────────────────────────────────────────────────────────────────────────────────────────

test('[paramparā] the registry holds its own rules: shape, vocabulary, a source for every record, a quote for every record that is not the owner\'s statement', () => {
  assert.deepEqual(PP.validateRegistry(REG), []);
  const L = P.loadParampara();
  assert.equal(L.records().length, REG.records.length);
  for (const c of REG.vocabulary.classes) assert.ok(L.records({ class: c }).length > 0, `no record of class ${c}`);
  // the rules bite: a record without a source, a non-owner record without a quote, an owner-statement claiming [text]
  const broken = (edit) => { const r = JSON.parse(JSON.stringify(REG)); edit(r); return PP.validateRegistry(r); };
  assert.ok(broken((r) => { delete r.records[0].source; }).some((e) => /source/.test(e)));
  assert.ok(broken((r) => { r.records[0].quote = []; }).some((e) => /no quote/.test(e)));
  assert.ok(broken((r) => { const o = r.records.find((x) => x.class === 'owner-statement'); o.tags.push('[text]'); }).some((e) => /cannot be \[text\]/.test(e)));
  // and do not bite valid dates: a Kali day before A.D. 1000, or the Kali epoch itself, carries kala-dvara.js's unpadded year
  for (const d of [0, 1314000]) {
    const c = K.civilFromKaliDay(d, 'julian'), julian = `${c.year}-${String(c.month).padStart(2, '0')}-${String(c.day).padStart(2, '0')}`;
    assert.deepEqual(broken((r) => { r.records.find((x) => x.id === 'SDip-72').era = { kaliDay: d, julian }; }), [], julian);
  }
  assert.ok(broken((r) => { r.records.find((x) => x.id === 'SDip-72').era = { kaliDay: 1652000, julian: '23 Jan 1422' }; }).some((e) => /Julian date/.test(e)));
  assert.ok(broken((r) => { r.records[0].class = 'legend'; }).some((e) => /class/.test(e)));
  assert.ok(broken((r) => { r.records.find((x) => x.status === 'excluded').why = ''; }).some((e) => /needs a why/.test(e)));
  assert.throws(() => PP.load({ registry: { ...REG, records: [...REG.records, { ...REG.records[0] }] } }), /duplicate id/);
  // the owner's statements: no [text], awaiting edition, no quote and no verse number of their own
  for (const r of L.records({ class: 'owner-statement' })) {
    assert.equal(r.status, 'awaiting edition', r.id); assert.equal(r.source, 'owner', r.id);
    assert.deepEqual(r.quote, [], `${r.id} quotes nothing`);
    if (r.locus !== null) assert.match(r.locus, /the locus (the code|a derived file) gives/, `${r.id}: a locus only where a repository file gives one`);
  }
  for (const id of ['OWNER-gita-units', 'OWNER-chandogya-units', 'OWNER-navagraha-units', 'OWNER-bhagavata-ladder', 'OWNER-vishnupurana-yuga', 'JANTAR-MANTAR-gap']) assert.ok(L.record(id), id);
  // Nīlakaṇṭha's own timings are gates of ss-grahana.test.js, not rows; the readings' every row is named by one record
  for (const id of ['JM-Syanandurapura', 'JM-Harihara']) { assert.equal(L.record(id).status, 'gate'); assert.deepEqual(L.record(id).refs.readings, []); }
  const { timed, seen } = P.registryRows();
  const R = readJSON('corpus/jyotirmimamsa/readings.json');
  assert.equal(timed.length, R.timed.length); assert.equal(seen.length, R.seen.length);
  const E = readJSON('corpus/jyotirmimamsa/eclipses.json');
  for (const rec of E.records) assert.ok(L.record(rec.id), `eclipses.json ${rec.id} has a registry record`);
});

test('[paramparā] each record\'s sha256 is the digest of its canonical JSON (vedha-lekha.js), and each Kali day\'s Julian date is integer arithmetic', () => {
  for (const r of REG.records) assert.equal(r.sha256, P.recordDigest(r), `${r.id}: run node scripts/parampara-samskara.cjs --stamp`);
  for (const r of REG.records) {
    if (!r.era || r.era.kaliDay === undefined) continue;
    const c = K.civilFromKaliDay(r.era.kaliDay, 'julian');
    assert.equal(r.era.julian, `${c.year}-${String(c.month).padStart(2, '0')}-${String(c.day).padStart(2, '0')}`, r.id);
  }
  // Kali 16,52,000 (the saṃskāra's epoch, SDip-72) is 23 January 1422, Julian, a Friday
  assert.deepEqual(K.civilFromKaliDay(1652000, 'julian'), { year: 1422, month: 1, day: 23 });
  assert.equal(K.varaOfKaliDay(1652000).name, 'śukravāra');
  assert.equal(REG.records.find((r) => r.id === 'SDip-72').era.julian, '1422-01-23');
});

/** Every object with a 'from' in a JSON tree, with the path to it. */
function froms(tree, at = '') {
  const out = [];
  const walk = (o, p) => {
    if (Array.isArray(o)) return o.forEach((x, i) => walk(x, `${p}[${i}]`));
    if (!o || typeof o !== 'object') return;
    if (typeof o.from === 'string') out.push({ from: o.from, sa: typeof o.sa === 'string' ? o.sa : null, at: p });
    for (const [k, v] of Object.entries(o)) if (k !== 'from') walk(v, `${p}.${k}`);
  };
  walk(tree, at);
  return out;
}
const fileLines = new Map(), witnesses = new Map();
function lineOf(file, n) {
  if (!fileLines.has(file)) fileLines.set(file, fs.readFileSync(path.join(ROOT, file), 'utf8').split('\n'));
  return fileLines.get(file)[n - 1];
}
function verseOf(w, c, v) {
  if (!witnesses.has(w)) { const j = readJSON(`corpus/bphs/${w}.json`); witnesses.set(w, w === 'canon' ? j.chapters : j); }
  const ch = witnesses.get(w)[String(c)];
  const x = ch && ch.verses.find((y) => y.n === v);
  return x ? x.sa : undefined;
}

test('[text] every quote stands verbatim in the line it names — the repository file, the BPHS witness, or the e-text line kept in etext-lines.json', () => {
  const dir = process.env.PARAMPARA_ETEXT_DIR || null;
  let n = 0;
  for (const [name, tree] of [['registry', REG], ['time-units', TU], ['graha', GR]]) {
    for (const q of froms(tree, name)) {
      const f = PP.parseFrom(q.from);
      assert.ok(f, `${q.at}: a 'from' that names no place: ${q.from}`);
      if (f.kind === 'file') {
        const line = lineOf(f.file, f.line);
        assert.ok(line !== undefined, `${q.at}: ${q.from} does not exist`);
        if (q.sa) assert.ok(nfc(line).includes(nfc(q.sa)), `${q.at}: ${q.from} does not contain «${q.sa}»`);
      } else if (f.kind === 'verse') {
        const sa = verseOf(f.witness, f.chapter, f.verse);
        assert.ok(sa !== undefined, `${q.at}: ${q.from} does not exist`);
        if (q.sa) assert.ok(nfc(sa).includes(nfc(q.sa)), `${q.at}: ${q.from} does not contain «${q.sa}»`);
      } else {
        const file = EL.files[`etext:${f.file}`], kept = file && file.lines[String(f.line)];
        assert.ok(kept, `${q.at}: ${q.from} is not kept in etext-lines.json`);
        if (q.sa) assert.ok(kept.text !== undefined ? nfc(kept.text).includes(nfc(q.sa)) : kept.excerpts.includes(q.sa), `${q.at}: ${q.from} «${q.sa}»`);
        if (dir) {
          const line = fs.readFileSync(path.join(dir, f.file), 'utf8').split('\n')[f.line - 1];
          assert.equal(V.sha256(line), kept.sha256, `${q.from}: the e-text line changed`);
          if (q.sa) assert.ok(nfc(line).includes(nfc(q.sa)), `${q.from} does not contain «${q.sa}»`);
        }
      }
      n += 1;
    }
  }
  assert.ok(n > 250, `${n} quotes checked`);
  // the 1977 edition's apparatus is the editor's: from its e-text only the quoted excerpts are kept, never a whole line
  for (const [id, file] of Object.entries(EL.files)) {
    const src = Object.values(REG.sources).find((s) => s.file === id);
    assert.ok(src, `${id} is a registry source`);
    if (!/^an old public-domain edition/.test(src.licence || '')) for (const [line, x] of Object.entries(file.lines)) assert.equal(x.text, undefined, `${id}:${line} is kept whole`);
    for (const x of Object.values(file.lines)) assert.match(x.sha256, /^[0-9a-f]{64}$/);
  }
  // and nothing is kept that nobody quotes
  const wanted = P.etextQuotes();
  for (const [id, file] of Object.entries(EL.files)) assert.deepEqual(Object.keys(file.lines).sort(), Object.keys(wanted[id]).sort(), id);
});

test('[theorem] the registry\'s numerals decode: Kaṭapayādi words through katapayadi.js, bhūtasaṅkhyā words units first', () => {
  let n = 0;
  for (const r of REG.records) for (const x of r.numerals || []) {
    if (x.form === 'katapayadi') { assert.equal(String(KP.decodeWord(x.word).value), String(x.value), `${r.id}: ${x.word}`); n += 1; }
    else if (x.form === 'bhutasankhya') { assert.equal(PP.bhutasankhya(x.values), x.value, `${r.id}: ${x.words}`); n += 1; }
  }
  for (const v of Object.values(REG.sites.ashvatthagrama)) {
    if (!v || !v.form) continue;
    const got = v.form === 'katapayadi' ? Number(KP.decodeWord(v.words).value) : PP.bhutasankhya(v.values);
    assert.equal(got, v.vinadi ?? v.value ?? v.angula * 100 + v.vyangula, v.words);
  }
  assert.ok(n >= 40, `${n} numerals`);
  // the Grahacāranibandhana bīja re-expressed per year gives Parahita's node fraction 13/32 as 95, not the printed 96
  assert.equal(Math.round(235 * 13 / 32), 95); assert.equal(Math.round(235 * 9 / 85), 25); assert.equal(Math.round(235 * 65 / 134), 114);
  // Parameśvara's ayanāṃśa and Nīlakaṇṭha's rate: 15° − 34′ = 'tantraṃ vedyam' 14°26′ (the text's numbers). At 0.9′ a year the
  // 34′ is 37.8 years, but the worked eclipse (Kali day 16,43,524) is 4499.62 Kali years elapsed, 36.38 years before Kali 4536:
  // 32.7′ (33.3′ by whole years) — the text's 34′ is about a minute more, and no whole year count is supplied for it
  assert.equal(15 * 60 - 34, 14 * 60 + 26);
  const yrs = 1643524 * 4320000 / 1577917828;
  assert.equal(Math.floor(yrs), 4499);
  assert.ok(Math.abs(0.9 * (4536 - yrs) - 32.7) < 0.05 && Math.abs(0.9 * (4536 - Math.floor(yrs)) - 33.3) < 1e-9, `${yrs} years`);
  assert.match(REG.records.find((r) => r.id === 'NIL-ayanamsha-rate').why, /4499\.62 Kali years elapsed/);
});

test('[theorem] the Parahita yuga-bhoga vākyas decode to Āryabhaṭa\'s revolutions modulo 7500 (the node with the printed 52″), read in the verse\'s own order from the Moon', () => {
  const rec = REG.records.find((r) => r.id === 'PH-yugabhoga');
  assert.equal(Number(KP.decodeWord('धीजगन्नूपुरं').value), 210389);
  assert.equal(210389 * 7500, 1577917500);                          // Āryabhaṭa's civil days in the mahāyuga
  const THIRDS_PER_TURN = 12 * 30 * 60 * 60 * 60;
  assert.equal(THIRDS_PER_TURN / 7500, 10368);
  const thirdsOf = (digits) => { const s = digits.padStart(9, '0'); const t = +s.slice(-2), se = +s.slice(-4, -2), m = +s.slice(-6, -4), d = +s.slice(-8, -6), r = +s.slice(0, -8); return { r, d, m, se, t, thirds: (((r * 30 + d) * 60 + m) * 60 + se) * 60 + t }; };
  const decoded = {};
  for (const v of rec.vakyas) decoded[v.body] = thirdsOf(String(KP.decodeWord(v.word).value));
  for (const v of rec.vakyas.filter((x) => x.rev !== null && x.body !== 'node')) assert.equal(decoded[v.body].thirds, (v.rev % 7500) * 10368, v.body);
  assert.deepEqual(rec.vakyas.map((v) => v.body).slice(0, 2), ['moon', 'mars']);       // śītaraśmi-mukhyānām: the list begins with the Moon
  assert.equal(rec.vakyas[rec.vakyas.length - 1].body, 'node');                          // pātāntānām: and ends with the node
  // the node decodes 72″ (one syllable off); with the edition's printed 52″ it is the node's residue 7226 exactly
  const nd = decoded.node; assert.equal(nd.se, 72);
  assert.equal(((((nd.r * 30 + nd.d) * 60 + nd.m) * 60 + 52) * 60 + nd.t), (232226 % 7500) * 10368);
  // Venus decodes 3s25° against the printed 3s24°, whose thirds are a whole residue (2388); Mercury's is whole (4520)
  const ve = decoded.venusSighra; assert.equal(ve.d, 25);
  assert.equal(((((ve.r * 30 + 24) * 60 + ve.m) * 60 + ve.se) * 60 + ve.t) / 10368, 2388);
  assert.equal(decoded.mercurySighra.thirds / 10368, 4520);
  // the edition's English labels run one body ahead of the verse (its first label is 'Sun')
  assert.ok(rec.checks.some((c) => /Shifted labels/.test(c.what)));
});

test('[theorem] Parameśvara\'s village: 18 yojanas west on the parallel of akṣajyā 647 is 20 vināḍī of the turn, and its palabhā is \'duṣkarā\' 2;18', () => {
  const S = REG.sites.ashvatthagrama, R = 3438;
  assert.equal(S.yojanasWest.value, 18); assert.equal(S.aksajya.value, 647); assert.equal(S.earthCircumferenceYojanas.value, 3299);
  const lamba = Math.sqrt(R * R - 647 * 647);                       // the lambajyā (Goladīpikā's rule for the parallel)
  const parallel = 3299 * lamba / R;
  assert.ok(Math.abs(parallel - 3240.06) < 0.01, `parallel ${parallel}`);
  const vinadi = 18 / parallel * 3600;
  assert.ok(Math.abs(vinadi - 20) < 0.005, `${vinadi} vināḍī`);
  assert.equal(S.deshantara.vinadi, 20);
  assert.equal(Number(KP.decodeWord('नख').value), 20);
  const palabha = 12 * 647 / lamba;                                 // aṅgula of the 12-aṅgula gnomon's equinoctial shadow
  assert.ok(Math.abs(palabha * 60 - (2 * 60 + 18)) < 0.1, `${palabha} aṅgula`);
  assert.equal(Number(KP.decodeWord('दुष्करा').value), 218);
  // the fit's site is the registry's village: 20 vināḍī = 2° west
  assert.equal(P.site.deshantara, -2);
});

// ── the time units ───────────────────────────────────────────────────────────────────────────────────────

test('[text] every textual time ratio is re-derived from the words of its own quote, and the registry of units holds', () => {
  assert.deepEqual(PP.validateTimeUnits(TU), []);
  let derived = 0;
  for (const u of TU.units) for (const a of u.attestations) {
    if (!a.states) continue;
    const got = PP.evalExpr(a.expr, TU.numberWords.values);
    assert.equal(PP.ratStr(got), PP.ratStr(PP.ratOf(a.states.equals)), `${u.id} ${a.locus}`);
    const text = a.quote.map((q) => q.sa).join(' ');
    for (const f of a.forms) assert.ok(text.includes(f), `${u.id} ${a.locus}: ${f}`);
    if (a.tag === '[text]') derived += 1;
  }
  assert.ok(derived >= 20, `${derived} ratios derived`);
  // the bhūtasaṅkhyā words used are the SS's own register where it has them (numbers.json)
  const N = readJSON('corpus/surya-siddhanta/numbers.json'), reg = new Map();
  for (const v of N.verses) for (const it of v.items || []) { if (!it.words || !it.values) continue; const w = it.words.split('-'); if (w.length === it.values.length) w.forEach((x, i) => reg.set(x, it.values[i])); }
  assert.equal(reg.get('sāgara'), TU.numberWords.values['sāgara']);
  // SS 1.15 in solar years: dvi-tri-sāgara (432) × ayuta; SS 1.18-1.20: 14 × (71 + 0.4) + 0.4 = 1000 yugas
  assert.equal(PP.bhutasankhya([2, 3, 4]) * 10000, 4320000);
  assert.equal(14 * (71 * 10 + 4) + 4, 1000 * 10);
  assert.equal(71 * 4320000 + 1728000, TU.units.find((u) => u.id === 'manvantara').size.equals);
  // Brahmā: 8,640,000,000 years a day and night; × 360 a year; × 100 a life (the Mahā-grantha's 100× slip is corrected)
  const by = (id) => TU.units.find((u) => u.id === id);
  assert.equal(by('brahma-ahoratra').years, 2 * 1000 * 4320000);
  assert.equal(by('brahma-varsha').years, 360 * by('brahma-ahoratra').years);
  assert.equal(by('brahma-ayus').years, 100 * by('brahma-varsha').years);
  const mg = fs.readFileSync(path.join(ROOT, 'editions/maha-grantha-full-edition.html'), 'utf8');
  assert.match(mg, /\| 1 Brahmā's year \(360 days\) \| 3,110,400,000,000 = 360 × 8,640,000,000 \|/);
  assert.match(mg, /\| Brahmā year 3\.1104×10\^12 \|/);
  assert.doesNotMatch(mg.replace(/<p><strong>सुधार · correction \(2026-10-08\):<\/strong>.*?<\/p>/g, ''), /31,104,000,000,000,000|3\.1104 × 10\^16|3\.1104×10\^16/);
  // the SS edition's caption: 12,000 divine years = 43,20,000 solar years
  const ss = fs.readFileSync(path.join(ROOT, 'editions/surya-siddhanta-full-edition.html'), 'utf8');
  assert.match(ss, /12,000 divine years = 43,20,000 solar years \(SS 1\.15\)/);
  assert.doesNotMatch(ss.replace(/<span class="lbl decode fix">सुधार · correction \(2026-10-08\)<\/span>[^<]*/g, ''), /43,20,000 divine years/);
});

test('[P1] the canonical chain: 3,280,500,000 paramāṇu and 328,050,000,000 spandas to the ahorātra, whole at the prāṇa of SS 1.11-1.12, and kala-dvara.js\'s lattice', () => {
  const c = TU.canonical;
  // cited by its symbol, never by a line (a line moves whenever math-core.js grows above it): the file declares the
  // name, its declaration holds each pair, and the exported value is the registry's chain pair for pair
  assert.equal(c.symbol, 'math-core.js SUBDAY_CHAIN');
  assert.equal(c.from, undefined, 'no line citation');
  const coreSrc = fs.readFileSync(path.join(ROOT, 'math-core.js'), 'utf8');
  const decl = /\bconst SUBDAY_CHAIN = Object\.freeze\(\[([\s\S]*?)\]\);/.exec(coreSrc);
  assert.ok(decl, 'math-core.js declares SUBDAY_CHAIN');
  for (const [u, k] of c.chain) assert.ok(decl[1].includes(`['${u}', ${k}]`), `math-core.js SUBDAY_CHAIN has [${u}, ${k}]`);
  assert.deepEqual(require('./math-core.js').SUBDAY_CHAIN.map(([u, k]) => [u, k]), c.chain);
  // every code citation by symbol names a declaration that exists; math-core.js is cited by line nowhere
  const symbols = [];
  const walkSymbols = (o) => { if (Array.isArray(o)) return o.forEach(walkSymbols); if (!o || typeof o !== 'object') return;
    if (typeof o.symbol === 'string') symbols.push(o.symbol); Object.values(o).forEach(walkSymbols); };
  walkSymbols(TU);
  assert.ok(symbols.length >= 15, `${symbols.length} symbol citations`);
  for (const s of symbols) {
    const m = /^([\w./-]+\.(?:js|cjs)) ([A-Za-z_$][\w$]*)$/.exec(s);
    assert.ok(m, `a symbol citation is '<file> <NAME>': ${s}`);
    assert.match(fs.readFileSync(path.join(ROOT, m[1]), 'utf8'), new RegExp(`\\b(?:const|let|var|function)\\s+${m[2]}\\b`), `${m[1]} declares ${m[2]}`);
  }
  assert.doesNotMatch(JSON.stringify(TU), /math-core\.js:\d/, 'no line citation of math-core.js');
  assert.ok(/\bconst SPANDAS_PER_DAY\b/.test(fs.readFileSync(path.join(ROOT, 'kala-dvara.js'), 'utf8')), 'kala-dvara.js SPANDAS_PER_DAY (cited in the notes) exists');
  const prod = c.chain.reduce((p, [, k]) => p * BigInt(k), 1n);
  assert.equal(prod, 328050000000n);
  assert.equal(prod / 100n, 3280500000n);
  assert.equal(BigInt(c.paramanuPerAhoratra), 3280500000n);
  assert.equal(prod, 2n ** 7n * 3n ** 8n * 5n ** 8n);
  assert.equal(prod, K.SPANDAS_PER_DAY);
  // SS 1.11-1.12: 6 prāṇa a vināḍī, 60 vināḍī a nāḍikā, 60 nāḍī an ahorātra — the chain's 60 nāḍikā agree, and the prāṇa is whole
  const pranaPerDay = 6n * 60n * 60n;
  assert.equal(prod % pranaPerDay, 0n);
  assert.equal(prod / pranaPerDay, K.SPANDAS_PER_PRANA);
  assert.equal(3280500000n % pranaPerDay, 0n); assert.equal(3280500000n / pranaPerDay, 151875n);
  const chainNadika = c.chain.slice(0, c.chain.findIndex(([u]) => u === 'nadika')).reduce((p, [, k]) => p * BigInt(k), 1n);
  assert.equal(chainNadika * 60n, prod, 'the chain\'s nāḍikā is 1/60 of the ahorātra');
  assert.equal(BigInt(TU.units.find((u) => u.id === 'nadika').spandas), K.SPANDAS_PER_GHATI);
  // 1″ of the turn: 10125/4 paramāṇu, so the ×100 spanda (×4 would do) makes it whole
  assert.equal(3280500000n * 4n % 1296000n, 0n); assert.notEqual(3280500000n % 1296000n, 0n);
  assert.equal(prod / 1296000n, K.SPANDAS_PER_ARCSEC);
  assert.equal(c.label.status, 'awaiting edition'); assert.equal(c.label.tag, '[claim-only]');
  // the other ladders are listed as alternative readings, each with its day-count
  const L = Object.fromEntries(TU.ladders.map((x) => [x.id, x]));
  assert.equal(L.canonical.nimeshaPerAhoratra, Number(prod / BigInt(TU.units.find((u) => u.id === 'nimesha').spandas)));
  assert.equal(L.sphuta.paramanuPerAhoratra, 21600 * 15 * 100 * 3 * 12); assert.equal(L.sphuta.nimeshaPerAhoratra, 21600 * 15);
  assert.equal(L['maha-grantha'].nimeshaPerAhoratra, 15 * 30 * 30 * 30);
  assert.equal(L['kaal-maha-sphota'].nimeshaPerAhoratra, 18 * 30 * 15 * 60);
});

test('[P1] pala = 1/60 ghaṭī = vināḍī everywhere, vipala = 1/60 pala, and the text\'s ghaṭī is of the turn', () => {
  const by = (id) => TU.units.find((u) => u.id === id);
  assert.ok(by('vinadi').aliases.some((a) => /^pala\b/.test(a)), 'pala is the vināḍī');
  assert.equal(by('vinadi').spandas * 60, by('nadika').spandas);
  assert.equal(by('vipala').spandas * 60, by('vinadi').spandas);
  assert.equal(by('vipala').spandas * 10, by('prana').spandas);
  assert.equal(by('ahoratra').spandas / by('vipala').spandas, 216000);
  assert.equal(by('gurvakshara').spandas, by('vipala').spandas);              // Āryabhaṭa's long syllable, the same size
  // BPHS 5.8: a rāśi (30°) in each ghaṭī and the degrees half the palas ('palārdha-pramita') → 60 pala in a ghaṭī
  const a = by('vinadi').attestations.find((x) => x.locus === 'BPHS 5.8');
  assert.ok(a.quote[0].sa.includes('पलार्धप्रमितांशकाः')); assert.equal(30 * 2, 60);
  const pala = TU.conflicts.find((x) => x.id === 'pala');
  assert.match(pala.resolution, /pala = 1\/60 ghaṭī = vināḍī everywhere/);
  for (const id of ['vipala', 'muhurta', 'prahara', 'rtu-start', 'kala-time', 'nimesha-values', 'manvantara-72']) assert.ok(TU.conflicts.some((x) => x.id === id), id);
  // the owner's attributions are carried as owner-statements awaiting an edition
  for (const id of ['spanda', 'vinadi', 'vipala', 'nadika']) assert.ok(by(id).attestations.some((x) => x.tag === '[owner-statement]' && x.record === 'OWNER-gita-units' && x.status === 'awaiting edition'), id);
});

// ── the graha layer ──────────────────────────────────────────────────────────────────────────────────────

test('[text] the BPHS graha layer: japa counts decode units first × 1000 (Ketu 17,000), the time measures of 3.33, the stotra awaiting an edition', () => {
  assert.deepEqual(PP.validateGraha(GR), []);
  const J = GR.layers.japa;
  assert.deepEqual(J.numerals.map((n) => PP.bhutasankhya(n.values) * J.multiplier), [7000, 11000, 10000, 9000, 19000, 16000, 23000, 18000, 17000]);
  assert.equal(J.values.ketu, 17000);
  // the words with these values in the SS's own register; nanda, nṛpa and pakṣa are not in it (marked [standard])
  const N = readJSON('corpus/surya-siddhanta/numbers.json'), reg = new Map();
  for (const v of N.verses) for (const it of v.items || []) { if (!it.words || !it.values) continue; const w = it.words.split('-'); if (w.length === it.values.length) w.forEach((x, i) => reg.set(x, it.values[i])); }
  for (const n of J.numerals) n.words.forEach((w, i) => { if (reg.has(w)) assert.equal(reg.get(w), n.values[i], w); else assert.ok(['nanda', 'nṛpa', 'pakṣa'].includes(w), `${w} is neither in the register nor marked`); });
  // both BPHS witnesses read 84.19 the same
  assert.equal(verseOf('canon', 84, 19), verseOf('sanskritdocuments', 84, 19));
  assert.deepEqual(GR.layers.timeMeasure.values, { surya: 'ayana', candra: 'kṣaṇa', mangala: 'vāra', budha: 'ṛtu', guru: 'māsa', shukra: 'pakṣa', shani: 'samā' });
  assert.equal(GR.navagrahaStotra.status, 'awaiting edition'); assert.equal(GR.navagrahaStotra.record, 'OWNER-navagraha-units');
  const L = P.loadParampara();
  assert.equal(L.graha.of('ketu').japa, 17000);
  assert.equal(L.graha.of('surya').timeMeasure, 'ayana');
});

// ── the saṃskāra ─────────────────────────────────────────────────────────────────────────────────────────

test('[paramparā] samskaraParameshvara: the fit re-run reproduces samskara.json byte for byte, pinned at Moon −8.37 ± 1.04′ and node −73.54 ± 6.72′ (Kali 16,52,000, 7 padas), and the held-out test improves on the plain text', () => {
  const fresh = P.result();
  assert.equal(P.resultText(fresh), SAMSKARA_TEXT, 'corpus/parampara/samskara.json is stale: node scripts/parampara-samskara.cjs --write');
  const L = P.loadParampara();
  const s = L.samskaraParameshvara(), live = L.samskaraParameshvara({ fit: () => fresh });
  assert.deepEqual(JSON.parse(JSON.stringify(live)), JSON.parse(JSON.stringify(s)));
  // the interface for Stage B
  for (const k of ['epochKali', 'moonArcmin', 'nodeArcmin', 'sigma', 'padas', 'records', 'label', 'source']) assert.ok(s[k] !== undefined, k);
  assert.equal(s.epochKali, 1652000); assert.equal(s.julian, '1422-01-23'); assert.equal(s.padas, 7);
  assert.equal(s.moonArcmin, -8.37); assert.equal(s.sigma.moon, 1.04);
  assert.equal(s.nodeArcmin, -73.54); assert.equal(s.sigma.node, 6.72);
  assert.deepEqual(s.setAside, [{ id: 'SDip-81-timed', sigma: 4.33 }]);
  assert.equal(s.tag, '[paramparā]');
  assert.deepEqual(s.sensitivity.map((x) => [x.padas, x.moonArcmin, x.nodeArcmin]), [[7, -8.37, -73.54], [6.5, -6.78, -76.52], [7.5, -10.65, -70.78]]);
  // the rows are the registry's records, and Nīlakaṇṭha's gates are not among them
  for (const id of s.records) assert.equal(L.record(id).status, 'row', id);
  assert.ok(!s.records.includes('JM-Syanandurapura') && !s.records.includes('SDip-82'));
  // leave-one-out (parīkṣā): each timed eclipse held out whole; the held-out correction beats the plain text
  assert.equal(s.leaveOneOut.meanTextGhati, 1.08); assert.equal(s.leaveOneOut.meanCorrectedGhati, 0.67);
  assert.ok(s.leaveOneOut.meanCorrectedGhati < s.leaveOneOut.meanTextGhati);
  assert.equal(s.leaveOneOut.improved, 5); assert.equal(s.leaveOneOut.n, 6);
  assert.ok(s.leaveOneOut.withoutSetAside.meanCorrectedGhati < s.leaveOneOut.withoutSetAside.meanTextGhati);
  // decision (a), owner 2026-10-08: the default of the text tier; the plain text the secondary choice; only Moon and node
  assert.equal(s.label, "Sūrya-Siddhānta + Parameśvara's saṃskāra");
  assert.equal(s.labelSa, 'सूर्य-सिद्धान्त + परमेश्वर-संस्कार');
  assert.equal(s.default, true); assert.equal(s.offered, true);
  assert.deepEqual(s.choices.map((c) => [c.id, c.label, c.default]), [['ss+parameshvara', "Sūrya-Siddhānta + Parameśvara's saṃskāra", true], ['ss', 'Sūrya-Siddhānta', false]]);
  assert.deepEqual(s.corrects, ['moon', 'node', 'ayanamsha']);
  assert.deepEqual(fresh.params, ['moon.epoch', 'node.epoch']);
  // 2026-10-09 (owner: apply what the paramparā recorded where it applies, adopt every improvement the records support): the
  // text's libration fitted to the three determinations — Āryabhaṭa's zero (Kali 3600), Nīlakaṇṭha's 14°26′ (Kali day 1,643,524),
  // Parameśvara's 15° (Kali 4536) — on its phase and its greatest value; not fitted with the eclipses. Pinned: phase 0.001°,
  // +1.8613° on the 27°, 57.72″ a year; residuals 0, −0.5, +0.5′; the phase-only reading of the morning breaks Āryabhaṭa's zero by 57.6′
  assert.equal(s.ayanamshaPhaseDeg, 0.001); assert.equal(s.ayanamshaAmplitudeDeg, 1.8613); assert.equal(s.ayanamsha.amplitudeTotalDeg, 28.8613); assert.equal(s.ayanamsha.rateArcsecPerYear, 57.72);
  assert.deepEqual(s.ayanamsha.records.map((r) => [r.id, r.who, r.residualArcmin, r.textResidualArcmin]),
    [['ABH-no-ayanacalana-3600', 'Āryabhaṭa', 0, 0], ['NIL-ayanamsha-rate', 'Nīlakaṇṭha', -0.5, -56.3], ['PAR-ayanamsha-4536', 'Parameśvara', 0.5, -57.6]]);
  assert.equal(s.ayanamsha.alternatives.phaseOnly.phaseDeg, 3.2); assert.deepEqual(s.ayanamsha.alternatives.phaseOnly.residualsArcmin, [57.6, 1.3, 0]);
  assert.deepEqual(s.ayanamsha.alternatives.amplitudeOnly.residualsArcmin, [0, -1, 0]);
  assert.match(s.caption, /three determinations/);
  assert.match(s.caption, /-8\.37 ± 1\.04′ and -73\.54 ± 6\.72′ at Kali day 1652000 \(1422-01-23 Julian\)/);
  // the inputs the record was made from are the files in the repository now
  assert.deepEqual(fresh.inputs, P.inputDigests());
});

test('[paramparā] samskara.js tags the ancestors\' records [paramparā], keeps [measured] for the owner\'s, and pools the two only on request', () => {
  const { out } = P.observations(7);
  assert.ok(out.every((o) => o.source === 'parampara' && typeof o.locus === 'string' && o.locus));
  assert.equal(SK.tagOf(out), '[paramparā]');
  const ownerCopy = { ...out.find((o) => o.kind === 'grahana-surya'), id: 'owner-copy', source: 'owner', locus: undefined, observer: 'the owner' };
  delete ownerCopy.locus;
  assert.equal(SK.tagOf([ownerCopy]), '[measured]');
  assert.equal(SK.tagOf([...out, ownerCopy]), '[paramparā+measured]');
  assert.equal(SK.tagOf([{ ...ownerCopy, synthetic: true, generator: 'test' }]), '[synthetic]');
  const opts = { epoch: 1652000, params: ['moon.epoch', 'node.epoch'], bija: false };
  assert.throws(() => SK.correct([...out, ownerCopy], opts), /pooled only on request/);
  assert.throws(() => SK.correct([{ ...out[0], locus: '' }], opts), /must name its locus/);
  assert.equal(SK.correct([...out, ownerCopy], { ...opts, pool: true }).tag, '[paramparā+measured]');
  assert.throws(() => P.fit(7, { ledger: {}, pool: false }), /only on request/);
});

test('[FRAME] parampara.js is sovereign: no trigonometry, no import, no network; it and its corpus name no modern ephemeris', () => {
  const src = fs.readFileSync(path.join(ROOT, 'parampara.js'), 'utf8');
  assert.equal((src.match(/Math\.(?:sin|cos|tan|asin|acos|atan2|atan)\b/g) || []).length, 0);
  assert.equal(/\brequire\s*\(|\bimport\s|\bimport\s*\(|\bfetch\s*\(|XMLHttpRequest|\bWebSocket\b/.test(src), false);
  const FORBIDDEN = /\b(?:DE4\d\d|VSOP\d*|ELP\d*|Swiss|swisseph|Gaia|IERS|DrikTier)\b|finals\.all|DeltaT|astronomy-engine|Horizons\b|\bJPL\b/;
  for (const f of ['parampara.js', 'corpus/parampara/registry.json', 'corpus/parampara/samskara.json', 'corpus/parampara/graha.json',
    'corpus/parampara/etext-lines.json', 'corpus/parampara/README.md', 'corpus/sources/time-units.json', 'scripts/parampara-samskara.cjs']) {
    assert.equal(FORBIDDEN.test(fs.readFileSync(path.join(ROOT, f), 'utf8')), false, `${f} mentions a forbidden source`);
  }
});
