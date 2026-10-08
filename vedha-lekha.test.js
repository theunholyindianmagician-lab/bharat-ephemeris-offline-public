'use strict';
/*
 * vedha-lekha.test.js — the observation ledger, its seal and its certifier (vedha-lekha.js, slice 7).
 *
 * SHA-256 is checked against its published test vectors (the empty string, "abc", the 448-bit and 896-bit messages and a
 * million "a"). The ledger is checked by building it, by breaking it every way an entry can be broken, and by asking the
 * certifier to refuse each kind of field and text the owner's instruments cannot have produced.
 *
 * NO OBSERVATION EXISTS YET. Every record in this file is SYNTHETIC: generated here, at run time, from the text's own
 * forward model (sphuta.js, ss-chaya.js, ss-grahana.js, ss-drishya.js through vedha-lekha.js's predict functions),
 * labelled `synthetic: true` with its generator, and never stored in corpus/vedha. Where a synthetic sky departs from the
 * text (a bowl that runs 22 asus fast in a turn, a Moon 6′ ahead), the departure is stated in the generator and the test
 * checks that the reduction measures it back. No modern source is computation, seed or referee.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
const L = require('./vedha-lekha.js');
const C = require('./ss-chaya.js');
const U = require('./ss-udaya.js');
const K = require('./kala-dvara.js');
const G = require('./ss-grahana.js');
const D = require('./ss-drishya.js');
const P = require('./panchanga.js');
const Dh = require('./dhruva.js');
const cat = JSON.parse(fs.readFileSync(path.join(__dirname, 'corpus', 'surya-siddhanta', 'yogatara.json'), 'utf8'));
const STARS = D.starsOf(cat);
const STAR = Object.fromEntries(STARS.map((s) => [s.name, s]));
const mod = (a, m) => ((a % m) + m) % m;
const day = (y, m, d) => K.kaliDayFromCivil({ calendar: 'gregorian', year: y, month: m, day: d });
const clone = (x) => JSON.parse(JSON.stringify(x));
const reasonsOf = (c) => c.reasons.map((r) => `${r.where}: ${r.reason}`).join('\n');

// ── SHA-256 ─────────────────────────────────────────────────────────────────────────────────────────
test('SHA-256 against its published test vectors; strings are hashed as UTF-8', () => {
  assert.equal(L.sha256(''), 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
  assert.equal(L.sha256('abc'), 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
  assert.equal(L.sha256('abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq'), '248d6a61d20638b8e5c026930c3e6039a33ce45964ff2167f6ecedd419db06c1');
  assert.equal(L.sha256('abcdefghbcdefghicdefghijdefghijkefghijklfghijklmghijklmnhijklmnoijklmnopjklmnopqklmnopqrlmnopqrsmnopqrstnopqrstu'),
    'cf5b16a778af8380036ce59e7b0492370b249b11e8f07a51afac45037afee9d1');
  assert.equal(L.sha256('a'.repeat(1000000)), 'cdc76e5c9914fb9281a1c7e284d73e67f1809a48a497200e046d39ccc7112cd0');
  // bytes and their string agree; ā is two bytes, 𝔸 four (a surrogate pair)
  assert.equal(L.sha256([0x61, 0x62, 0x63]), L.sha256('abc'));
  assert.deepEqual([...L.utf8('ā')], [0xc4, 0x81]);
  assert.deepEqual([...L.utf8('𝔸')], [0xf0, 0x9d, 0x94, 0xb8]);
  assert.equal(L.sha256('वेध'), L.sha256(L.utf8('वेध')));
});

test('canonical JSON: key order does not matter, no white space; nothing but plain data goes in', () => {
  assert.equal(L.canonical({ b: 1, a: [1, { d: 2, c: 'x' }], z: undefined }), '{"a":[1,{"c":"x","d":2}],"b":1}');
  assert.equal(L.canonical({ a: 1, b: 2 }), L.canonical({ b: 2, a: 1 }));
  assert.throws(() => L.canonical({ a: NaN }), /finite/);
  assert.throws(() => L.canonical({ a: 1n }), /bigint/);
  assert.throws(() => L.canonical({ when: new Date(0) }), /plain objects/);       // a clock object is not a reading
});

// ── a small ledger ──────────────────────────────────────────────────────────────────────────────────
const GEN_SMALL = 'vedha-lekha.test.js: hand-made shapes for the ledger tests (SYNTHETIC: no sky behind them)';
const SITE = { name: 'Ujjayinī (synthetic)', deshantara: 0, latitude: 23.18 };
function small() {
  let l = L.create({ site: SITE });
  const N = day(2026, 10, 12);
  l = L.append(l, { id: 'bowl-1', kind: 'kapala', star: 'Citrā', count: { ghati: 60, vinadi: 3, prana: 4 }, synthetic: true, generator: GEN_SMALL }, { at: N - 2 });
  l = L.append(l, { id: 'noon-1', kind: 'madhyahna', day: { kali: N - 1 }, chaya: { angula: 6, vyangula: 30 }, dir: 'N', ayana: 'dakshina', synthetic: true, generator: GEN_SMALL });
  l = L.append(l, { id: 'moon-1', kind: 'candra-darshana', day: { kali: N }, seen: true, synthetic: true, generator: GEN_SMALL });
  l = L.append(l, { id: 'star-1', kind: 'yamyottara', day: { kali: N }, star: 'Revatī', kapala: { ghati: 42, vinadi: 10 }, synthetic: true, generator: GEN_SMALL }, { at: N + 1 });
  return l;
}
// what a forger who recomputes every hash would write (and what an honest tool writes after a legitimate edit)
function rechain(ledger) {
  const x = clone(ledger);
  delete x.seal;
  let prev = L.sha256(L.canonical(x.shanku === undefined ? { format: x.format, site: x.site } : { format: x.format, site: x.site, shanku: x.shanku }));
  x.entries.forEach((e, i) => { e.seq = i + 1; e.prev = prev; e.sealedHash = L.sha256(L.canonical({ seq: e.seq, prev: e.prev, at: e.at, record: e.record })); prev = e.sealedHash; });
  return x;
}

test('append and verify: each entry hangs from the one before, the first from the header; the old ledger is untouched', () => {
  const l = small();
  const v = L.verify(l);
  assert.ok(v.ok, JSON.stringify(v.problems));
  assert.equal(v.n, 4);
  assert.deepEqual(l.entries.map((e) => e.seq), [1, 2, 3, 4]);
  assert.equal(l.entries[0].prev, L.sha256(L.canonical({ format: L.FORMAT, site: SITE })));
  for (let i = 1; i < 4; i++) assert.equal(l.entries[i].prev, l.entries[i - 1].sealedHash);
  for (const e of l.entries) assert.equal(e.sealedHash, L.sha256(L.canonical({ seq: e.seq, prev: e.prev, at: e.at, record: e.record })));
  assert.equal(v.head, l.entries[3].sealedHash);
  assert.deepEqual(l.entries.map((e) => e.at), [day(2026, 10, 10), day(2026, 10, 11), day(2026, 10, 12), day(2026, 10, 13)]);
  // append returns a new ledger; the old is frozen and unchanged
  const before = small(), after = L.append(before, { id: 'moon-2', kind: 'candra-darshana', day: { kali: day(2026, 10, 13) }, seen: false, synthetic: true, generator: GEN_SMALL });
  assert.equal(before.entries.length, 4);
  assert.equal(after.entries.length, 5);
  assert.ok(Object.isFrozen(before) && Object.isFrozen(before.entries[0].record));
  assert.throws(() => { 'use strict'; before.entries.push({}); }, TypeError);
  // the file round-trips to the same chain
  const back = L.fromJSON(L.toJSON(l));
  assert.equal(L.verify(back).head, v.head);
  assert.ok(Object.isFrozen(back));
  assert.throws(() => L.fromJSON('{"format":"vedha-chaya/1"}'), /format/);
  assert.throws(() => L.fromJSON('not json'), SyntaxError);
  // the ledger refuses at the door what the certifier would refuse
  assert.throws(() => L.append(l, { id: 'x', kind: 'candra-darshana', day: { kali: day(2026, 10, 20) }, seen: true }, { at: day(2026, 10, 19) }), /after the day it is written/);
  assert.throws(() => L.append(l, { id: 'x', kind: 'candra-darshana', day: { kali: day(2026, 10, 1) }, seen: true }, { at: day(2026, 10, 1) }), /before the last entry/);
  assert.throws(() => L.append(l, { id: 'star-1', kind: 'candra-darshana', day: { kali: day(2026, 10, 13) }, seen: true }), /already in the ledger/);
  assert.throws(() => L.append(l, { id: 'x', kind: 'candra-darshana', day: { kali: day(2026, 10, 13) }, seen: true, utc: '18:02' }), /UTC style/);
  assert.throws(() => L.append(l, { id: 'x', kind: 'candra-darshana', day: { kali: day(2026, 10, 13) }, seen: true, synthetic: true }), /generator/);
});

test('tamper: a changed field, a reordering, a deletion, an insertion, a changed site — each breaks the chain where it happened', () => {
  const l = small();
  const where = (x) => L.verify(x).problems.map((p) => p.where);
  // change one field of one record
  const a = clone(l); a.entries[1].record.chaya.vyangula = 31;
  assert.deepEqual(where(a), ['entry 2.sealedHash']);
  // … and recompute that entry's own hash: the next entry no longer hangs from it
  const a2 = clone(a); a2.entries[1].sealedHash = L.sha256(L.canonical({ seq: 2, prev: a2.entries[1].prev, at: a2.entries[1].at, record: a2.entries[1].record }));
  assert.deepEqual(where(a2), ['entry 3.prev']);
  // swap two entries
  const b = clone(l); [b.entries[1], b.entries[2]] = [b.entries[2], b.entries[1]];
  assert.ok(where(b).includes('entry 2.seq') && where(b).includes('entry 2.prev') && where(b).includes('entry 3.prev'), where(b).join());
  // delete one
  const c = clone(l); c.entries.splice(1, 1);
  assert.ok(where(c).includes('entry 2.seq') && where(c).includes('entry 2.prev'), where(c).join());
  // delete the last: the chain alone cannot see it — the seal can
  const sealed = L.seal(l);
  const d = clone(sealed); d.entries.pop();
  assert.ok(where(d).includes('seal.n') && where(d).includes('seal.head'), where(d).join());
  // insert a forged entry with a correct-looking hash
  const e = clone(l); const forged = { seq: 3, prev: e.entries[1].sealedHash, at: e.entries[1].at, record: { id: 'forged', kind: 'candra-darshana', day: { kali: day(2026, 10, 11) }, seen: true } };
  forged.sealedHash = L.sha256(L.canonical({ seq: forged.seq, prev: forged.prev, at: forged.at, record: forged.record }));
  e.entries.splice(2, 0, forged);
  assert.ok(where(e).includes('entry 4.seq') && where(e).includes('entry 4.prev'), where(e).join());
  // the site moved after the fact: the first entry no longer hangs from the header
  const f = clone(l); f.site.latitude = 23.5;
  assert.deepEqual(where(f), ['entry 1.prev']);
  // a forger who rewrites every hash makes a chain that holds — and the seal, kept apart, refuses it
  const g = rechain(a);
  assert.ok(L.verify(g).ok, 'without a seal a full rewrite is undetectable: keep the seal elsewhere');
  g.seal = clone(sealed.seal);
  assert.deepEqual(where(g), ['seal.head']);
  // the seal itself cannot be edited
  const h = clone(sealed); h.seal.at += 1;
  assert.deepEqual(where(h), ['seal.hash']);
  // a sealed ledger takes nothing more; a broken one cannot be sealed
  assert.throws(() => L.append(sealed, { id: 'late', kind: 'candra-darshana', day: { kali: day(2026, 10, 13) }, seen: true }), /sealed/);
  assert.throws(() => L.seal(a), /broken/);
  const z = clone(l); z.entries[3].record.kapala.vinadi = 11;                       // append re-hashes the last entry before writing
  assert.throws(() => L.append(z, { id: 'late', kind: 'candra-darshana', day: { kali: day(2026, 10, 13) }, seen: true }), /hash/);
});

// ── the certifier ───────────────────────────────────────────────────────────────────────────────────
test('certify: the modern fields are refused, each named for what it is', () => {
  const l = small();
  assert.ok(L.certify(l, { allowSynthetic: true }).ok, reasonsOf(L.certify(l, { allowSynthetic: true })));
  const refusedWith = (mutate, re) => {
    const x = clone(l); mutate(x); const c = L.certify(rechain(x), { allowSynthetic: true });
    assert.equal(c.ok, false); assert.deepEqual(c.records, []);
    assert.ok(c.reasons.some((r) => re.test(r.reason)), `${re}:\n${reasonsOf(c)}`);
    return c;
  };
  refusedWith((x) => { x.entries[2].record.utc = '2026-10-12 13:05'; }, /field "utc" is a modern clock .*UTC style/);
  refusedWith((x) => { x.entries[2].record.timestamp = 1791800000; }, /field "timestamp" is a modern clock/);
  refusedWith((x) => { x.entries[3].record.ra = 1.5; }, /field "ra" is an equatorial .*RA\/Dec/);
  refusedWith((x) => { x.entries[3].record.dec = -0.2; }, /field "dec" is an equatorial/);
  refusedWith((x) => { x.entries[3].record.altitude = 55; }, /field "altitude" is an equatorial or horizontal/);
  refusedWith((x) => { x.site.wgs84 = { lat: 23.18, lon: 75.78 }; }, /field "wgs84" is a geodetic field \(WGS84 style\)/);
  refusedWith((x) => { x.site.lon = 75.78; }, /field "lon" is a geodetic/);
  refusedWith((x) => { x.entries[2].record.day = { jd: 2461326.5 }; }, /field "jd" is a Julian-day field/);
  refusedWith((x) => { x.entries[2].record.day = { mjd: 61326 }; }, /field "mjd" is a Julian-day field/);
  refusedWith((x) => { x.deltaT = 69.2; }, /rotation-correction/);
  refusedWith((x) => { x.entries[3].record.source = 'hand'; }, /field "source" is a modern ephemeris/);
  // a field outside the schema that names nothing modern is refused all the same
  const c = refusedWith((x) => { x.entries[2].record.colour = 'silver'; }, /field "colour" is not in the schema/);
  assert.ok(c.reasons.every((r) => r.where && r.reason));
  refusedWith((x) => { x.entries[2].record.kind = 'transit'; }, /unknown kind/);
  refusedWith((x) => { x.entries[3].record.transit = 'culmination'; }, /"upper" or "lower"/);
});

test('certify: any string naming a modern source or carrying a modern time stamp is refused', () => {
  const l = small();
  const refusedText = (mutate, re) => {
    const x = clone(l); mutate(x); const c = L.certify(rechain(x), { allowSynthetic: true });
    assert.equal(c.ok, false); assert.ok(c.reasons.some((r) => re.test(r.reason)), `${re}:\n${reasonsOf(c)}`);
  };
  refusedText((x) => { x.entries[2].record.note = 'checked against JPL Horizons'; }, /names a modern source.*"JPL"/);
  refusedText((x) => { x.entries[2].record.note = 'checked against the swiss ephemeris'; }, /names a modern source.*"swiss"/);      // the gate's names, any case
  refusedText((x) => { x.entries[0].record.generator = 'Swiss Ephemeris, sweph'; }, /"Swiss"/);
  refusedText((x) => { x.entries[3].record.star = 'Gaia DR3 1234'; }, /"Gaia"/);
  refusedText((x) => { x.entries[3].record.observer = 'read off Stellarium'; }, /"Stellarium"/);
  refusedText((x) => { x.entries[2].record.note = 'clock set by GPS'; }, /"GPS"/);
  refusedText((x) => { x.entries[2].record.note = 'DE440 says otherwise'; }, /"DE440"/);
  refusedText((x) => { x.entries[2].record.note = 'seen at 2026-10-12T13:05:00Z'; }, /modern time stamp/);
  refusedText((x) => { x.entries[2].record.note = 'seen at 18:35 +05:30'; }, /modern time stamp/);
  refusedText((x) => { x.site.name = 'Ujjain, from WGS 84'; }, /"WGS 84"/);
  // the owner's own words pass: a horizon, a Kali day, a civil date, Sanskrit
  const ok = clone(l); ok.entries[2].record.note = 'seen low on the western horizon, Kali day 1872860, 12 October 2026: candra-darśana';
  assert.ok(L.certify(rechain(ok), { allowSynthetic: true }).ok);
});

test('certify: synthetic records, order, the chain and the prediction-first rule', () => {
  const l = small();
  // synthetic: refused unless allowed, and never without its generator
  const plain = L.certify(l);
  assert.equal(plain.ok, false);
  assert.equal(plain.reasons.filter((r) => /SYNTHETIC/.test(r.reason)).length, 4);
  const noGen = clone(l); delete noGen.entries[1].record.generator;
  assert.ok(L.certify(rechain(noGen), { allowSynthetic: true }).reasons.some((r) => /must name its generator/.test(r.reason)));
  const genOnly = clone(l); delete genOnly.entries[2].record.synthetic;
  assert.ok(L.certify(rechain(genOnly), { allowSynthetic: true }).reasons.some((r) => /not marked synthetic/.test(r.reason)));
  // out of order: written before an earlier entry, or of a day after it was written
  const early = clone(l); early.entries[2].at = early.entries[1].at - 1; early.entries[2].record.day = { kali: early.entries[2].at };
  assert.ok(L.certify(rechain(early), { allowSynthetic: true }).reasons.some((r) => /out of order/.test(r.reason)), reasonsOf(L.certify(rechain(early), { allowSynthetic: true })));
  const future = clone(l); future.entries[2].record.day = { kali: future.entries[2].at + 3 };
  assert.ok(L.certify(rechain(future), { allowSynthetic: true }).reasons.some((r) => /after the day it was written/.test(r.reason)));
  const twice = clone(l); twice.entries[2].record.id = 'noon-1';
  assert.ok(L.certify(rechain(twice), { allowSynthetic: true }).reasons.some((r) => /used twice/.test(r.reason)));
  // a broken chain
  const broken = clone(l); broken.entries[3].record.kapala.vinadi = 11;
  assert.ok(L.certify(broken, { allowSynthetic: true }).reasons.some((r) => /changed after it was written/.test(r.reason)));
  // the file itself, and what is not a file
  assert.ok(L.certify(L.toJSON(l), { allowSynthetic: true }).ok);
  assert.equal(L.certify('{ not json', { allowSynthetic: true }).reasons[0].where, 'file');
  // gaṇita: written first, for its kind, not after its day
  const N = day(2026, 10, 20);
  let g = L.append(l, { id: 'g-1', kind: 'ganita', day: { kali: N }, for: 'candra-darshana', model: 'ss-drishya.js moonAtSunset, 10.1', values: { kalamsa: 14.6, seen: true }, synthetic: true, generator: GEN_SMALL }, { at: day(2026, 10, 14) });
  g = L.append(g, { id: 'obs-1', kind: 'candra-darshana', day: { kali: N }, seen: true, ganita: 'g-1', synthetic: true, generator: GEN_SMALL });
  assert.ok(L.certify(g, { allowSynthetic: true }).ok, reasonsOf(L.certify(g, { allowSynthetic: true })));
  assert.throws(() => L.append(l, { id: 'obs-2', kind: 'candra-darshana', day: { kali: N }, seen: true, ganita: 'g-9' }), /not already in the ledger/);
  assert.throws(() => L.append(g, { id: 'obs-3', kind: 'yamyottara', day: { kali: N }, star: 'Revatī', kapala: { ghati: 40 }, ganita: 'g-1' }), /is for candra-darshana/);
  assert.throws(() => L.append(l, { id: 'g-late', kind: 'ganita', day: { kali: day(2026, 10, 1) }, for: 'grahana', model: 'm', values: { x: 1 } }, { at: day(2026, 10, 14) }), /after the day it predicts/);
  // the prediction moved after the observation: refused
  const swapped = clone(g); [swapped.entries[4], swapped.entries[5]] = [swapped.entries[5], swapped.entries[4]];
  swapped.entries[5].at = swapped.entries[4].at;                                     // both written on the day itself
  const sw = L.certify(rechain(swapped), { allowSynthetic: true });
  assert.ok(sw.reasons.length === 1 && /prediction must come first/.test(sw.reasons[0].reason), reasonsOf(sw));
  // values in the owner's units only
  const badVal = clone(g); badVal.entries[4].record.values = { when: { hours: 18 } };
  assert.ok(L.certify(rechain(badVal), { allowSynthetic: true }).reasons.some((r) => /field "hours" is a modern clock/.test(r.reason)));
});

test('LEDGER.md documents the format, every kind and every field; README.md keeps the five shadow kinds', () => {
  const doc = fs.readFileSync(path.join(__dirname, 'corpus', 'vedha', 'LEDGER.md'), 'utf8');
  assert.ok(doc.includes(L.FORMAT));
  for (const [kind, k] of Object.entries(L.KINDS)) {
    assert.ok(doc.includes('`' + kind + '`'), kind);
    if (!L.CHAYA_KINDS.includes(kind)) for (const f of k.fields) assert.ok(doc.includes('`' + f + '`'), `${kind}.${f}`);
  }
  for (const f of [...L.COMMON, ...L.ENTRY, ...L.SEAL, ...L.CONTACTS]) assert.ok(doc.includes('`' + f + '`'), f);
  const readme = fs.readFileSync(path.join(__dirname, 'corpus', 'vedha', 'README.md'), 'utf8');
  for (const kind of L.CHAYA_KINDS) assert.ok(readme.includes('`' + kind + '`'), kind);
});

// ── the forward model on the turn ───────────────────────────────────────────────────────────────────
const MS = (() => { const p = L.placeOf(SITE); return { latitude: p.latitude, deshantara: p.deshantara, palabha: p.palabha }; })();

test('the turn is the clock [theorem, measured]: a star returns to the meridian after 21,600 asus of the turn; two stars on one night are their ascensions apart', () => {
  const N = day(2026, 12, 15);
  for (const name of ['Revatī', 'Rohiṇī', 'Maghā']) {
    const a = L.predictTransit(N, STAR[name], MS), b = L.predictTransit(N + 1, STAR[name], MS);
    assert.ok(Math.abs(L.turnAsusBetween(a.t, b.t) - 21600) < 0.001, `${name}: ${L.turnAsusBetween(a.t, b.t) - 21600}`);   // the dhruvaka drifts with the ayanāṃśa only
    const lo = L.predictTransit(N, STAR[name], MS, { transit: 'lower' });
    assert.ok(Math.abs(mod(L.turnAsusBetween(a.t, lo.t), 21600) - 10800) < 0.001);
  }
  const r = L.predictTransit(N, STAR['Rohiṇī'], MS), m = L.predictTransit(N, STAR['Maghā'], MS);
  const A = S_ayan(r.t);
  const asc = (s) => U.rightAscension(mod(s.dhruvaka + A, 360));
  assert.ok(Math.abs(L.turnAsusBetween(r.t, m.t) - mod(asc(STAR['Maghā']) - asc(STAR['Rohiṇī']), 21600)) < 0.01);
  // one civil day is 21,600 × 1,582,237,828 ÷ 1,577,917,828 asus of the turn (1.34-1.37)
  const M = K.mana('surya');
  assert.equal(L.ASUS_PER_DAY, 21600 * Number(M.nakshatra) / Number(M.savana));
  // the dhruva: a star 40′ from the point, at 23.18°, gives the latitude back exactly (dhruva.js)
  const alt = Dh.meridianAltitudes(90 - 40 / 60, 23.18);
  const q = Dh.dhruvaFromCulminations({ upper: Math.round(alt.upper * 3600), lower: Math.round(alt.lower * 3600) });
  assert.equal(q.elevation.num / q.elevation.den, 83448n);
});
function S_ayan(t) { const S = require('./sphuta.js'); return S.ayanamshaSS(S.spandasOfDays(t)); }

// ── a SYNTHETIC season, from the text's own model ───────────────────────────────────────────────────
const GEN = 'vedha-lekha.test.js season(): the text\'s own forward model (sphuta, ss-chaya, ss-grahana, ss-drishya via vedha-lekha predict*); '
  + 'the bowl is made to count 60 ghaṭī 3 vināḍī 4 prāṇa a turn and the Moon of the yoga records is the text\'s + 6′ — SYNTHETIC, not an observation';
const BOWL = 21600 + 22;
const MOON_SHIFT = 6;
const sunriseDayOf = (t) => { let N = Math.floor(t); while (L.sunriseAt(N, MS) > t) N--; while (L.sunriseAt(N + 1, MS) <= t) N++; return N; };
const ayanaOf = (lam) => (mod(lam, 360) < 90 || mod(lam, 360) >= 270 ? 'uttara' : 'dakshina');

function season({ round } = {}) {
  const items = [];
  const add = (r, at) => items.push({ r: { ...r, synthetic: true, generator: GEN }, at, i: items.length });
  const count = (turnAsus) => L.kapalaOfAsus(turnAsus * BOWL / 21600, round);           // what this bowl shows
  const arc = (deg) => L.arcOfDegrees(deg, round);
  const q = (x) => (round ? Math.round(x * 60) / 60 : x);                                 // shadows to the vyaṅgula
  const start = day(2026, 10, 8);

  // the eclipses of the season, by the text (found, not typed)
  const lunar = G.eclipsesBetween(day(2027, 2, 1), day(2027, 3, 1), MS).find((e) => e.kind === 'lunar');
  const solar = G.eclipsesBetween(day(2027, 7, 25), day(2027, 8, 10), MS).find((e) => e.kind === 'solar');
  const NL = sunriseDayOf(lunar.contacts.sparsha), NS = sunriseDayOf(solar.contacts.sparsha);
  const pl = (c) => L.predictContact(NL, 'candra', c, MS), ps = (c) => L.predictContact(NS, 'surya', c, MS);
  // 1. the predictions, written first
  add({ id: 'ganita-candra', kind: 'ganita', day: { kali: NL }, for: 'grahana', model: 'vedha-lekha.js predictContact: ss-grahana.js lunarEclipse (defaults); sunrise by 3.42-3.43',
    values: { sparsha: L.kapalaOfAsus(pl('sparsha').sinceSunriseAsus, true), moksha: L.kapalaOfAsus(pl('moksha').sinceSunriseAsus, true) } }, start);
  add({ id: 'ganita-surya', kind: 'ganita', day: { kali: NS }, for: 'grahana', model: 'vedha-lekha.js predictContact: ss-grahana.js solarEclipse (defaults); sunrise by 3.42-3.43',
    values: { sparsha: L.kapalaOfAsus(ps('sparsha').sinceSunriseAsus, true), moksha: L.kapalaOfAsus(ps('moksha').sinceSunriseAsus, true) } }, start);
  // 2. the bowl between two transits of Citrā
  add({ id: 'bowl', kind: 'kapala', star: 'Citrā', count: L.kapalaOfAsus(BOWL) }, start + 1);
  // 3. noon shadows within 30° of the equinoxes (ss-chaya.js's forward model, the text's Sun and ayanāṃśa)
  for (const [y, m, d] of [[2026, 10, 10], [2026, 10, 20], [2027, 2, 25], [2027, 3, 10], [2027, 3, 25], [2027, 4, 10]]) {
    const N = day(y, m, d), s = C.textSun(N + 0.5), n = C.noonShadow(s.sayana, MS.palabha);
    add({ id: `noon-${y}-${m}-${d}`, kind: 'madhyahna', day: { kali: N }, chaya: q(n.chaya), dir: n.dir, ayana: ayanaOf(s.sayana) }, N);
  }
  // 4. a shadow at a bowl time, made as ss-chaya.test.js makes it
  {
    const N = day(2027, 3, 21), read = 3 * 360 + 20 * 6;
    let s = C.textSun(N + 0.5), H = C.turnToSunAsus(read, s.sayana, s.gati) - U.halfDay(s.sayana, MS.palabha);
    s = C.textSun(N + 0.5 + H / 21600); H = C.turnToSunAsus(read, s.sayana, s.gati) - U.halfDay(s.sayana, MS.palabha);
    const tip = C.shadowTip(s.sayana, MS.palabha, H);
    add({ id: 'ishta-2027-3-21', kind: 'ishta', day: { kali: N }, chaya: q(tip.chaya), kapala: count(read), side: 'purva', bhuja: { value: q(Math.abs(tip.north)), dir: tip.north >= 0 ? 'N' : 'S' } }, N);
  }
  // 5. stars on the meridian: three nights, the junction stars that cross in the dark
  const transits = [];
  for (const N of [day(2026, 10, 20), day(2026, 12, 15), day(2027, 2, 10)]) {
    const set = D.sunEvent(N, MS, 'set', {}), next = L.sunriseAt(N + 1, MS);
    const dark = STARS.slice(0, 28).map((s) => L.predictTransit(N, s, MS)).filter((p) => p.above && p.t > set + 0.05 && p.t < next - 0.05).slice(0, 3);
    for (const p of dark) {
      add({ id: `yam-${N}-${p.name}`, kind: 'yamyottara', day: { kali: N }, star: p.name, transit: 'upper', kapala: count(p.sinceSunriseAsus), unnata: arc(p.unnataDeg), disha: p.disha }, N + 1);
      transits.push(p);
    }
  }
  // the Dhruva star: a circumpolar star 0°40′ from the point (an ASSUMPTION of this generator, not a measured distance)
  {
    const N = day(2026, 12, 15), alt = Dh.meridianAltitudes(90 - 40 / 60, MS.latitude);
    add({ id: 'dhruva-upper', kind: 'yamyottara', day: { kali: N }, star: 'Dhruva', transit: 'upper', unnata: arc(alt.upper), disha: 'N' }, N + 1);
    add({ id: 'dhruva-lower', kind: 'yamyottara', day: { kali: N }, star: 'Dhruva', transit: 'lower', unnata: arc(alt.lower), disha: 'N' }, N + 1);
  }
  // 6. the lunar eclipse by the bowl; the solar one by the bowl (sparśa) and by the śaṅku's shadow (mokṣa)
  for (const c of ['sparsha', 'madhya', 'moksha']) add({ id: `candra-${c}`, kind: 'grahana', day: { kali: NL }, body: 'candra', contact: c, kapala: count(pl(c).sinceSunriseAsus), ganita: 'ganita-candra' }, NL + 1);
  add({ id: 'surya-sparsha', kind: 'grahana', day: { kali: NS }, body: 'surya', contact: 'sparsha', kapala: count(ps('sparsha').sinceSunriseAsus), ganita: 'ganita-surya' }, NS);
  const shM = L.shadowAtTurnAsus(NS, ps('moksha').sinceSunriseAsus, MS);
  add({ id: 'surya-moksha', kind: 'grahana', day: { kali: NS }, body: 'surya', contact: 'moksha', chaya: q(shM.chaya), side: shM.side, ganita: 'ganita-surya' }, NS);
  // 7. the crescent: for each amāvāsyā, the evenings to the first seen and the mornings back to the last seen
  const crescents = [];
  for (let conj = P.syzygyNear(start, 0, +1); conj < day(2027, 8, 1); conj = P.syzygyNear(conj + 25, 0, +1)) {
    const N0 = Math.floor(conj);
    for (let N = N0; N <= N0 + 4; N++) {
      const p = L.predictCrescent(N, 'pashcima', MS); if (p.at <= conj) continue;
      add({ id: `west-${N}`, kind: 'candra-darshana', day: { kali: N }, horizon: 'pashcima', seen: p.seen }, N); crescents.push(p);
      if (p.seen) break;
    }
    for (let N = N0 + 1; N >= N0 - 5; N--) {
      const p = L.predictCrescent(N, 'purva', MS); if (p.at >= conj) continue;
      add({ id: `east-${N}`, kind: 'candra-darshana', day: { kali: N }, horizon: 'purva', seen: p.seen }, N); crescents.push(p);
      if (p.seen) break;
    }
  }
  // 8. the Moon on a junction star's dhruvaka, at night; the sky's Moon is the text's + 6′, so it arrives early
  const yogas = [];
  for (let N = start; N < day(2026, 11, 8) && yogas.length < 4; N++) for (const s of STARS.slice(0, 28)) {
    const p = L.predictYuti(N, s, MS); if (p.t === null) continue;
    const set = D.sunEvent(N, MS, 'set', {}), next = L.sunriseAt(N + 1, MS);
    if (!(p.t > set && p.t < next)) continue;
    let t = p.t;
    const w = (a) => mod(a + 180, 360) - 180;
    for (let i = 0; i < 8; i++) { const f = w(L.moonPolarAt(t) + MOON_SHIFT / 60 - s.dhruvaka), rate = w(L.moonPolarAt(t + 0.01) - L.moonPolarAt(t - 0.01)) / 0.02; t -= f / rate; }
    add({ id: `yoga-${N}-${s.name}`, kind: 'candra-yoga', day: { kali: N }, star: s.name, kapala: count(L.turnAsusBetween(p.sunrise, t)) }, N + 1);
    yogas.push(p);
  }
  items.sort((a, b) => a.at - b.at || a.i - b.i);
  let ledger = L.create({ site: SITE });
  for (const { r, at } of items) ledger = L.append(ledger, r, { at });
  return { ledger: L.seal(ledger), n: items.length, lunar, solar, transits, crescents, yogas };
}

test('a SYNTHETIC season: generated from the text, sealed, written to a file, read back, certified and reduced back to the text [measured, synthetic]', () => {
  const S = season();
  const file = L.toJSON(S.ledger);
  const back = L.fromJSON(file);
  assert.ok(L.verify(back).ok);
  assert.equal(back.seal.hash, S.ledger.seal.hash);
  assert.equal(back.seal.n, S.n);
  // the certifier refuses every record of it as an observation, and accepts it as a synthetic season
  const plain = L.certify(file);
  assert.equal(plain.ok, false);
  assert.equal(plain.reasons.length, S.n);
  assert.ok(plain.reasons.every((r) => /SYNTHETIC/.test(r.reason)));
  assert.throws(() => L.reduce(file, { catalogue: cat }), /not certified/);
  const cert = L.certify(file, { allowSynthetic: true });
  assert.ok(cert.ok, reasonsOf(cert));
  assert.equal(cert.records.length, S.n);

  const out = L.reduce(file, { allowSynthetic: true, catalogue: cat });
  assert.equal(out.synthetic, true);
  assert.equal(out.certified.seal.hash, S.ledger.seal.hash);
  assert.deepEqual(out.warnings, []);
  for (const r of out.records) assert.ok(r.tag === '[measured]' && r.synthetic === true, r.id);
  // the bowl: 22 asus fast in a turn, found and taken out of every count
  assert.ok(Math.abs(out.kapala.driftGhati - 22 / 360) < 1e-12 && Math.abs(out.kapala.rate * BOWL - 21600) < 1e-9);

  // the shadow records went to ss-chaya.js unchanged: the same reduction as the vedha-chaya file of them
  const chayaFile = { format: C.FORMAT, site: SITE, records: S.ledger.entries.map((e) => e.record).filter((r) => L.CHAYA_KINDS.includes(r.kind)) };
  assert.deepEqual(out.chaya, C.reduce(chayaFile));
  for (const r of out.chaya.records.filter((x) => x.kind === 'madhyahna')) {
    assert.ok(Math.abs(r.krantiResidualArcmin) < 1.9, `${r.id}: declination ${r.krantiResidualArcmin.toFixed(2)}′`);    // the table: √(144 + s²) against 12R ÷ koṭijyā
    assert.ok(Math.abs(r.sunResidualArcmin) < 3.5 && Math.abs(r.ayanamsha - r.textAyanamsha) * 60 < 3.5, `${r.id}: Sun ${r.sunResidualArcmin.toFixed(2)}′`);
  }
  const ishta = out.chaya.records.find((x) => x.kind === 'ishta');
  assert.ok(Math.abs(ishta.timeResidualAsus) < 3 && Math.abs(ishta.ayanamsha - ishta.textAyanamsha) * 60 < 0.05, `${ishta.timeResidualAsus}`);

  // stars on the meridian: the bowl's count and the altitude come back to the text's
  const yam = out.records.filter((r) => r.kind === 'yamyottara' && r.text);
  assert.equal(yam.length, S.transits.length);
  assert.ok(yam.length >= 6);
  for (const r of yam) assert.ok(Math.abs(r.antara.asus) < 1e-6 && Math.abs(r.antara.unnataArcmin) < 1e-6, `${r.id}: ${r.antara.asus}, ${r.antara.unnataArcmin}`);
  assert.ok(out.summary.yamyottara.pairs.length >= 6 && out.summary.yamyottara.pairs.every((p) => Math.abs(p.antaraAsus) < 1e-6));
  // the Dhruva star: no place in the text, but its two transits give the dhruva's elevation exactly (12.72)
  assert.equal(out.records.find((r) => r.id === 'dhruva-upper').text, null);
  const dh = out.summary.dhruva.find((x) => x.star === 'Dhruva');
  assert.ok(dh.exact && Math.abs(dh.latitudeDeg - 23.18) < 1e-12 && Math.abs(dh.polarDistanceDeg * 60 - 40) < 1e-9 && Math.abs(dh.antaraArcmin) < 1e-9, JSON.stringify(dh));

  // the eclipses: each contact back to the text's; the middle and the length; the lunar one puts the place where it is
  const gr = out.records.filter((r) => r.kind === 'grahana');
  assert.equal(gr.length, 5);
  for (const r of gr) {
    assert.ok(r.text.possible && r.text.above === true, r.id);
    assert.ok(Math.abs(r.antara.asus) < 1e-6, `${r.id}: ${r.antara.asus}`);
    assert.equal(r.ganita.id, r.body === 'candra' ? 'ganita-candra' : 'ganita-surya');
    assert.ok(r.ganita.seq < r.seq);
  }
  assert.ok(gr.find((r) => r.id === 'surya-moksha').observed.byChaya !== undefined, 'the mokṣa is timed by the shadow');
  const lun = out.summary.grahana.find((e) => e.body === 'candra'), sol = out.summary.grahana.find((e) => e.body === 'surya');
  assert.ok(Math.abs(lun.middleAntaraAsus) < 1e-6 && Math.abs(lun.durationAntaraAsus) < 1e-6 && Math.abs(lun.deshantaraDeg) < 1e-6, JSON.stringify(lun));
  assert.ok(Math.abs(sol.middleAntaraAsus) < 1e-6 && sol.deshantaraDeg === undefined);
  assert.deepEqual(out.summary.ganita.map((g) => [g.id, g.first, g.citedBy.length]), [['ganita-candra', true, 3], ['ganita-surya', true, 2]]);

  // the crescent: every verdict agrees, and the records bracket the text's twelve kālāṃśa
  const cd = out.summary.candraDarshana;
  assert.equal(cd.n, S.crescents.length);
  assert.ok(cd.n >= 30 && cd.agree === cd.n && cd.disagree.length === 0, JSON.stringify(cd));
  assert.ok(cd.limit.consistent && cd.limit.unseenAtMost < 12 && cd.limit.seenAtLeast >= 12, JSON.stringify(cd.limit));

  // the Moon on a junction star: the 6′ the synthetic sky put in comes back (JM §14: prāṇas × motion ÷ 21,600)
  const yo = out.records.filter((r) => r.kind === 'candra-yoga');
  assert.equal(yo.length, 4);
  for (const r of yo) assert.ok(r.antara.asus < 0 && Math.abs(r.antara.moonArcmin - MOON_SHIFT) < 0.01, `${r.id}: ${r.antara.moonArcmin}′`);
  assert.ok(Math.abs(out.summary.candraYoga.moonArcmin.mean - MOON_SHIFT) < 0.01);
});

test('the same season read to the prāṇa, the vikalā and the vyaṅgula, as a careful observer would write it [measured, synthetic]', () => {
  const S = season({ round: true });
  const out = L.reduce(S.ledger, { allowSynthetic: true, catalogue: cat });
  const rate = out.kapala.rate;
  for (const r of out.records.filter((x) => x.kind === 'yamyottara' && x.text)) {
    assert.ok(Math.abs(r.antara.asus) <= 0.5 * rate + 1e-9, `${r.id}: ${r.antara.asus}`);                      // half a prāṇa of the bowl
    assert.ok(Math.abs(r.antara.unnataArcmin) <= 0.5 / 60 + 1e-9, `${r.id}: ${r.antara.unnataArcmin}`);       // half a vikalā
  }
  for (const r of out.records.filter((x) => x.kind === 'grahana' && x.observed.byKapala !== undefined)) assert.ok(Math.abs(r.antara.asus) <= 0.5 * rate + 1e-9, r.id);
  // a vyaṅgula of shadow at the mokṣa, the Sun low in the west: a few asus
  const m = out.records.find((x) => x.id === 'surya-moksha');
  assert.ok(Math.abs(m.antara.asus) < 3, `${m.antara.asus}`);
  for (const r of out.records.filter((x) => x.kind === 'candra-yoga')) assert.ok(Math.abs(r.antara.moonArcmin - MOON_SHIFT) < 0.03, `${r.antara.moonArcmin}`);
  const dh = out.summary.dhruva.find((x) => x.star === 'Dhruva');
  assert.ok(dh.exact && Math.abs(dh.antaraArcmin) < 1e-9);
});

test('a sky the text misses is reported, not repaired: an eclipse contact 3 vināḍī late, a crescent seen below 12 kālāṃśa [measured, synthetic]', () => {
  const N = day(2027, 2, 20), p = L.predictContact(N, 'candra', 'moksha', MS);
  const GEN_OFF = 'vedha-lekha.test.js: the text\'s mokṣa + 3 vināḍī, and the text\'s first evening a day early — SYNTHETIC';
  let l = L.create({ site: SITE });
  l = L.append(l, { id: 'late', kind: 'grahana', day: { kali: N }, body: 'candra', contact: 'moksha', kapala: L.kapalaOfAsus(p.sinceSunriseAsus + 18), synthetic: true, generator: GEN_OFF }, { at: N + 1 });
  // an evening the text calls unseen, recorded as seen
  let conj = P.syzygyNear(day(2026, 11, 1), 0, +1), Nu = Math.floor(conj), pu;
  for (; ; Nu++) { pu = L.predictCrescent(Nu, 'pashcima', MS); if (pu.at > conj && pu.kalamsa > 0 && !pu.seen) break; if (Nu > conj + 3) throw new Error('no unseen evening'); }
  l = L.append(l, { id: 'early', kind: 'candra-darshana', day: { kali: Nu }, seen: true, synthetic: true, generator: GEN_OFF }, { at: N + 1 });
  const out = L.reduce(l, { allowSynthetic: true, catalogue: cat });
  const late = out.records.find((r) => r.id === 'late');
  assert.ok(Math.abs(late.antara.vinadi - 3) < 1e-9, `${late.antara.vinadi}`);
  const cd = out.summary.candraDarshana;
  assert.deepEqual(cd.disagree, ['early']);
  assert.ok(cd.limit.seenAtLeast < 12, 'the sky would have shown a Moon the text\'s twelve calls lost');
  // the deśāntara a single contact cannot give; the pair can (see the season)
  assert.equal(out.summary.grahana[0].deshantaraDeg, undefined);
});

test('the kind "yantra": an instrument\'s reading in its own graduation is certified; a modern coordinate inside the reading, an unknown instrument or a half-read pair is refused [synthetic]', () => {
  const Y = require('./yantra.js');
  const GEN = 'vedha-lekha.test.js: yantra.js forward model (SYNTHETIC)';
  const N = day(2026, 10, 14), site = { latitude: 23.18, deshantara: 0, palabha: C.palabhaOfLatitude(23.18).palabha };
  const rise = L.sunriseAt(N, site), t0 = rise + 0.2, q = Y.quantitiesOf(Y.sunAt(t0, site), site);
  const rec = Y.record('samrat', { id: 'samrat-1', day: { kali: N }, reading: Y.readingOfQuantities('samrat', q), kapala: L.kapalaOfAsus(L.turnAsusBetween(rise, t0)), synthetic: true, generator: GEN });
  assert.deepEqual(L.KINDS.yantra.fields, ['yantra', 'body', 'reading', 'kapala', 'calibration']);
  let l = L.append(L.create({ site: SITE }), rec, { at: N });
  assert.ok(L.certify(l, { allowSynthetic: true }).ok);
  const red = L.reduce(l, { allowSynthetic: true });
  assert.ok(Math.abs(red.records[0].antara.natAsus) < 1e-4 && Math.abs(red.records[0].antara.krantiArcmin) < 1e-4, JSON.stringify(red.records[0].antara));
  assert.equal(red.summary.yantra.n, 1);
  const refuse = (mut, why) => {
    const r = clone(rec); mut(r);
    assert.throws(() => L.append(L.create({ site: SITE }), r, { at: N }), why);
  };
  refuse((r) => { r.reading.dec = 4.9; }, /declination|equatorial/);
  refuse((r) => { r.reading.hour_angle = 30; }, /equatorial/);
  refuse((r) => { r.yantra = 'astrolabe'; }, /yantra/);
  refuse((r) => { delete r.reading.gola; }, /go together/);
  refuse((r) => { r.reading.nata = { ghati: 31 }; }, /30 ghaṭī/);
  refuse((r) => { r.body = 7; }, /body/);
});

// ── the frame ───────────────────────────────────────────────────────────────────────────────────────
test('[FRAME] vedha-lekha.js is sovereign: the gate\'s own names, only sovereign requires, no node built-in, no trigonometry; LEDGER.md names no modern source', () => {
  const gate = fs.readFileSync(path.join(__dirname, 'kala-dvara.test.js'), 'utf8');
  const src = gate.match(/const FORBIDDEN = \/(.+)\/;/)[1];
  const FORBIDDEN = new RegExp(src);
  assert.equal(L.GATE_FORBIDDEN.source, FORBIDDEN.source, 'the certifier carries the gate\'s names, no more and no fewer');
  const list = (name) => [...gate.match(new RegExp(`const ${name} = \\[([^\\]]+)\\]`))[1].matchAll(/'([^']+)'/g)].map((m) => m[1]);
  const allowed = new Set([...list('ROOTS'), ...list('LAYERS')].map((f) => './' + f));
  const text = fs.readFileSync(path.join(__dirname, 'vedha-lekha.js'), 'utf8');
  assert.equal(FORBIDDEN.test(text), false, 'vedha-lekha.js mentions a forbidden source');
  assert.equal(/\bimport\s/.test(text), false);
  const reqs = [...text.matchAll(/\brequire\s*\(\s*["']([^"']+)["']\s*\)/g)].map((m) => m[1]);
  assert.deepEqual(reqs.sort(), ['./dhruva.js', './kala-dvara.js', './sphuta.js', './ss-chaya.js', './ss-drishya.js', './ss-grahana.js', './ss-udaya.js', './yantra.js']);
  for (const r of reqs) assert.ok(allowed.has(r), `${r} is not a sovereign file`);
  assert.equal(/\brequire\s*\(\s*["'](?!\.\/)/.test(text), false, 'no node built-in');
  assert.equal(/Math\.(?:sin|cos|tan|asin|acos|atan|atan2)\b/.test(text), false, 'the computation path uses the text\'s table');
  for (const f of ['corpus/vedha/LEDGER.md', 'corpus/vedha/README.md']) assert.equal(FORBIDDEN.test(fs.readFileSync(path.join(__dirname, f), 'utf8')), false, f);
  // the certifier's own names catch the gate's
  for (const word of ['VSOP87', 'ELP2000', 'DE431', 'swisseph', 'IERS', 'finals.all', 'astronomy-engine']) {
    const x = clone(small()); x.entries[2].record.note = `from ${word}`;
    assert.equal(L.certify(rechain(x), { allowSynthetic: true }).ok, false, word);
  }
});

test('sunrise and sunset by one rule: the day they bound is the pañcāṅga\'s to a second (council G-3)', () => {
  const P = require('./panchanga.js'), Kd = require('./kala-dvara.js');
  const site = { latitude: 23.18, deshantara: 0 };
  const N0 = Kd.kaliDayFromCivil({ calendar: 'gregorian', year: 2026, month: 1, day: 1 });
  for (let N = N0; N < N0 + 365; N += 7) {
    const d = (L.sunsetAt(N, site) - L.sunriseAt(N, site)) - (P.sunset(N, site) - P.sunrise(N, site));
    assert.ok(Math.abs(d) * 86400 < 1, `day ${N}: ${d * 86400} s`);
  }
});
