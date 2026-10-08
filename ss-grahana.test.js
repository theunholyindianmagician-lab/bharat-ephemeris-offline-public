'use strict';
/*
 * ss-grahana.test.js — the Sūrya-Siddhānta's eclipses (ss-grahana.js, SS 4, 5 and 6.13) checked against the verse words,
 * against the text's own identities, by round trips, and — as the ancestors' own vedha — against the eclipses Parameśvara
 * and Nīlakaṇṭha recorded (corpus/jyotirmimamsa/eclipses.json, Jyotirmīmāṃsā ed. K. V. Sarma). No modern ephemeris is a
 * referee here; Math.sin and the sphere appear only where a test measures something, never in the module.
 */
const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('fs');
const path = require('path');
// This suite checks the text as written: its 24-entry sine table (withSine('table')). The engine's default sine is
// Mādhava's (owner, 2026-10-07); ss-madhava.test.js measures what that changes.
const Gr = require('./ss-grahana.js').withSine('table');
const S = require('./sphuta.js').withSine('table');
const G = require('./spanda-ganita.js').withSine('table');
const U = require('./ss-udaya.js').withSine('table');
const K = require('./kala-dvara.js');
const KP = require('./katapayadi.js');
const corpus = JSON.parse(fs.readFileSync(path.join(__dirname, 'corpus', 'jyotirmimamsa', 'eclipses.json'), 'utf8'));
const numbers = JSON.parse(fs.readFileSync(path.join(__dirname, 'corpus', 'surya-siddhanta', 'numbers.json'), 'utf8'));
const edition = fs.readFileSync(path.join(__dirname, 'editions', 'surya-siddhanta-full-edition.html'), 'utf8');

const R = S.R;
const UJJAIN = { latitude: 23.18, deshantara: 0.05 };
const kali = (y, m, d) => K.kaliDayFromCivil({ calendar: 'gregorian', year: y, month: m, day: d });
const iast = (ch, v) => {
  const m = edition.match(new RegExp(`id="v${ch}-${String(v).padStart(2, '0')}"[\\s\\S]*?<div class="iast">([\\s\\S]*?)</div>`));
  assert.ok(m, `verse ${ch}.${v} in the edition`);
  return m[1].replace(/<br>/g, ' ').replace(/\s+/g, ' ');
};
/** Parameśvara's village on the Nilā (JM p.36): palabhā 'duṣkarā' = 2;18 aṅgulas; deśāntara 'nakha' = 20 vināḍī, "tac ca
 *  dhanam … laṅkātaḥ pratīcyām … aśītyadhikaśatāṃśe" — added to the local time, the meridian 1/180 of the circle west of Laṅkā. */
function village() {
  const pb = Number(KP.decodeWord('duṣkarā').value);                         // 218 → 2 aṅgula 18 vyaṅgula
  const palabha = Math.floor(pb / 100) + (pb % 100) / 60;
  const vinadi = Number(KP.decodeWord('nakha').value);                       // 20; a vināḍī is 6′ of the turn (1.11-1.12)
  const akshajya = R * palabha / Math.sqrt(144 + palabha * palabha);          // 3.13-3.14
  return { latitude: S.arcminOfJya(akshajya) / 60, deshantara: -vinadi * 6 / 60, palabha };
}
/** The text's sunrise of Kali day N at a site (days): the instant the Sun's asus since rising (3.46) are zero. */
function sunriseOf(N, site) {
  let t = N + 0.25 - site.deshantara / 360;
  for (let i = 0; i < 8; i++) { const g = Gr.clock(t, site).ghatiAfterSunrise; t -= (g > 30 ? g - 60 : g) / 60 * Gr.TURN_DAYS; }
  return t;
}

// ── the words ──────────────────────────────────────────────────────────────────────────────────────

test('[text] every number the module uses is in the verse words: 4.1, 1.59, 4.3, 4.18, 4.25, 5.7, 5.10, 5.11, 6.2, 6.13', () => {
  const has = (ch, v, ...words) => { const s = iast(ch, v); for (const w of words) assert.ok(s.includes(w), `${ch}.${v}: "${w}"`); };
  has(4, 1, 'sārdhāni ṣaṭsahasrāṇi', 'sahāśītyā catuśśatam');                  // six thousand and a half; four hundred with eighty
  assert.equal(Gr.TEXT.sunYojana, 6000 + 1000 / 2); assert.equal(Gr.TEXT.moonYojana, 400 + 80);
  has(1, 59, 'śatānyaṣṭau', 'dviguṇāni');                                      // eight hundreds, doubled
  assert.equal(Gr.TEXT.earthYojana, 800 * 2);
  has(4, 3, 'tithyāptā'); has(5, 10, 'tithighnatrijyayā'); has(4, 18, 'ṣaṣṭyāptāḥ');
  assert.equal(Gr.TEXT.tithi, 15); assert.equal(Gr.TEXT.sashti, 60);
  has(4, 25, 'saptatyaṅgula'); has(5, 11, 'saptatihṛtād', 'saptasaptaka'); has(6, 2, 'saptavargāṅgulen');
  assert.equal(Gr.TEXT.saptati, 70); assert.equal(Gr.TEXT.saptaSaptaka, 7 * 7);
  has(5, 7, 'ekajyā'); assert.equal(Gr.TEXT.ekajya, 1719); assert.equal(2 * S.JYA[8], R, 'the R-sine of one sign is half the radius');
  has(6, 13, 'dvādaśāṃśo', 'liptātrayaṃ'); assert.equal(Gr.TEXT.moonSeenPart, 12); assert.equal(Gr.TEXT.sunUnseenArcmin, 3);
  has(1, 68, 'bhacakraliptāśītyaṃśaṃ'); assert.equal(Gr.TEXT.moonGreatestLatitude, 21600 / 80);
  // the register: 4.1 and 4.3 in numbers.json "plain"; 12.85-12.86 orbits in "verses"; 2.28's 1397
  const plain = (v, n) => assert.ok(numbers.plain.some((e) => e.v === v && e.n === n), `${v} ${n}`);
  plain('4.1', 6500); plain('4.1', 480); plain('4.3', 15);
  const reg = (v, n) => assert.ok(numbers.verses.find((e) => e.v === v).items.some((i) => i.n === n), `${v} ${n}`);
  reg('12.85', Gr.TEXT.moonOrbit); reg('12.86', Gr.TEXT.sunOrbit); reg('2.28', U.PARAMA);
});

// ── 4.1-4.5 ────────────────────────────────────────────────────────────────────────────────────────

test('[theorem] 4.2b and 4.3a carry the Sun to the Moon\'s orbit alike: Sun ÷ Moon revolutions = Moon\'s ÷ Sun\'s orbit (12.85-12.86); 324,000 ÷ 15 = 21,600', () => {
  const byRev = 4320000 / 57753336, byOrbit = Gr.TEXT.moonOrbit / Gr.TEXT.sunOrbit;
  assert.ok(Math.abs(byRev / byOrbit - 1) < 1e-7, `${byRev} ${byOrbit}`);
  assert.equal(Gr.TEXT.moonOrbit / Gr.TEXT.tithi, 21600, 'tithyāptā: fifteen yojanas of the Moon\'s orbit are one minute');
  for (let i = 0; i < 50; i++) {
    const t = kali(2026, 1, 1) + i * 7.3;
    assert.ok(Math.abs(Gr.discs(t).sun - Gr.discs(t, { via: 'kaksha' }).sun) < 1e-5);
  }
});

test('[theorem] the mean discs: Moon 32′, Sun 6500·4,320,000/57,753,336/15 = 32′24.8″, shadow (1600 − 4900·480/6500)/15 = 82′32.6″', () => {
  const mean = { sun: Gr.MEAN.sun, moon: Gr.MEAN.moon, node: Gr.MEAN.node, rate: Gr.MEAN.moon - Gr.MEAN.sun };
  const d = Gr.discsFrom(mean);
  assert.ok(Math.abs(d.moon - 32) < 1e-12);
  assert.ok(Math.abs(d.sun - 6500 * 4320000 / 57753336 / 15) < 1e-12 && Math.abs(d.sun * 60 - (32 * 60 + 24.8)) < 0.1);
  assert.ok(Math.abs(d.shadow - (1600 - 4900 * 480 / 6500) / 15) < 1e-12 && Math.abs(d.shadow * 60 - (82 * 60 + 32.6)) < 0.1);
  assert.ok(Math.abs(d.yojana.suci - 1600) < 1e-9, 'the sūcī is the Earth\'s diameter when the Moon moves at its mean rate');
});

test('[measured] the discs by 2.47-2.49\'s true motions agree with utsava.js (4.1-4.3 with a day\'s difference of places) within 0.1′', () => {
  const Ut = require('./utsava.js');
  let mxM = 0, mxS = 0;
  for (let i = 0; i < 200; i++) {
    const t = kali(2026, 1, 1) + i * 3.7, d = Gr.discs(t);
    mxM = Math.max(mxM, Math.abs(d.moon - Ut.moonDisc(t))); mxS = Math.max(mxS, Math.abs(d.sun - Ut.sunDisc(t)));
    assert.ok(d.moon > 28.5 && d.moon < 35.5 && d.sun > 31 && d.sun < 34 && d.shadow > 70 && d.shadow < 95);
  }
  assert.ok(mxM < 0.1 && mxS < 0.06, `${mxM} ${mxS}`);
});

// ── 4.10-4.13 ──────────────────────────────────────────────────────────────────────────────────────

test('[theorem] 4.10-4.13: total ⇔ the vimarda pada is real ⇔ |β| ≤ (eclipser − eclipsed)/2; no eclipse ⇔ |β| ≥ the half-sum', () => {
  for (let i = 0; i < 2000; i++) {
    const a = 29 + (i % 7), b = 30 + ((i * 13) % 60), beta = ((i * 37) % 200) - 100, rate = 700 + (i % 120);
    const s = Gr.sambhava(a, b, beta), h = Gr.ardhas(a, b, beta, rate);
    assert.equal(s.total, b > a && Math.abs(beta) <= (b - a) / 2);
    assert.equal(s.total, h.vimarda > 0 || (b > a && Math.abs(beta) === (b - a) / 2));
    assert.equal(s.possible, Math.abs(beta) < (a + b) / 2);
    assert.equal(s.possible, h.sthiti > 0);
    if (s.total) assert.ok(h.vimarda < h.sthiti);
    assert.ok(Math.abs(h.sthiti - h.sthitiPada * 60 / rate) < 1e-12);
  }
});

// ── chapter 5 ──────────────────────────────────────────────────────────────────────────────────────

test('[theorem] 5.7-5.8 read "ekajyā-varga": the greatest lambana is R² ÷ 1719² = 4 ghaṭikās — what the text\'s own Earth, orbits and motions give (4.05)', () => {
  assert.equal((R * R) / (Gr.TEXT.ekajya ** 2), 4);
  // 1.59 Earth 1600 yojanas: its radius 800 seen on each orbit (12.85-12.86; 15 yojanas a minute on the Moon's, 4.3)
  const moonPx = 800 / (Gr.TEXT.moonOrbit / 21600), sunPx = 800 / (Gr.TEXT.sunOrbit / 21600);
  const ghati = (moonPx - sunPx) / (Gr.MEAN.moon - Gr.MEAN.sun) * 60;
  assert.ok(Math.abs(ghati - 4.05) < 0.01, `${ghati}`);
  // the e-text's "ekajyārdha-gata" read as 1719 (not squared) gives no ghaṭikās at all
  assert.ok(R * R / Gr.TEXT.ekajya > 6000);
  // a nati is the lambana's arc: 4 ghaṭikās of the mean elongation = 5.10's greatest nati; 5.11's two forms within 0.8 %
  const n510 = R * (Gr.MEAN.moon - Gr.MEAN.sun) / (15 * R), n511 = R / 70, n511b = R * 49 / R;
  assert.ok(Math.abs(n510 - 4 * (Gr.MEAN.moon - Gr.MEAN.sun) / 60) < 1e-12);
  assert.ok(Math.abs(n510 - 48.76) < 0.01 && Math.abs(n511 - 49.11) < 0.01 && n511b === 49);
  assert.ok(Math.abs(n511 / n510 - 1) < 0.008 && Math.abs(n511b / n510 - 1) < 0.005);
  assert.ok(Math.abs(moonPx - sunPx - n510) < 0.6, 'the text\'s parallax geometry and 5.10 agree within 0.6′');
});

test('[theorem] 5.15-5.17 as worded (magnitudes, kapālas, "viparyaya", "lambanaikatā") = contact − middle on the sparśa side, middle − contact on the mokṣa side', () => {
  let n = 0;
  for (let i = -40; i <= 40; i++) for (let j = -40; j <= 40; j++) {
    const Lc = i / 10, Lm = j / 10;
    if (Lc === 0 || Lm === 0) continue;
    // same kapāla: any; different kapālas only in the order time runs (east before west)
    const sameK = (Lc > 0) === (Lm > 0);
    if (sameK || (Lc > 0 && Lm < 0)) { assert.ok(Math.abs(Gr.harijantara(Lc, Lm, -1) - (Lc - Lm)) < 1e-12, `sparśa ${Lc} ${Lm}`); n++; }
    if (sameK || (Lm > 0 && Lc < 0)) { assert.ok(Math.abs(Gr.harijantara(Lc, Lm, +1) - (Lm - Lc)) < 1e-12, `mokṣa ${Lc} ${Lm}`); n++; }
  }
  assert.ok(n > 9000);
});

test('[text 5.1] no lambana when the Sun is at the madhya-lagna; no nati where akṣa equals the meridian point\'s northern declination', () => {
  const day = kali(2026, 5, 17);
  const f = (t) => { const p = Gr.parallaxAt(t, UJJAIN); return ((p.sunTrop - p.madhyaLagna + 540) % 360) - 180; };
  let lo = day + 0.3, hi = day + 0.7;                                           // morning: Sun east of the meridian; afternoon: west
  assert.ok(f(lo) > 0 && f(hi) < 0);
  for (let i = 0; i < 60; i++) { const m = (lo + hi) / 2; if (f(m) > 0) lo = m; else hi = m; }
  assert.ok(Math.abs(Gr.lambanaAt(lo, UJJAIN)) < 1e-6);
  const p = Gr.parallaxAt(day + 0.5, UJJAIN);
  assert.ok(p.mlKranti > 0);
  const lat = p.mlKranti, site = { latitude: lat, deshantara: UJJAIN.deshantara, palabha: 12 * S.jya(lat) / S.jya(90 - lat) };
  const q = Gr.parallaxAt(day + 0.5, site);
  assert.ok(Math.abs(q.natamsa) < 0.02 && Math.abs(q.nati['5.10']) < 0.02, `${q.natamsa} ${q.nati['5.10']}`);
  assert.equal(Gr.siteOf(UJJAIN).akshamsa > 0, true, '3.14: akṣa counted south');
});

// ── the middle, the contacts, the grāsa ────────────────────────────────────────────────────────────

test('[text 4.7-4.8, 4.16, 5.9] the lunar middle is spanda-ganita\'s exact pūrṇimā; the solar middle is the fixed point t = parva − lambana(t)', () => {
  const E = Gr.lunarEclipse(kali(2026, 3, 3), UJJAIN);
  assert.equal(E.parva.tau, G.purnima(kali(2026, 3, 3)));
  assert.equal(E.middle, G.toNum(G.daysOfTau(E.parva.tau)));
  const V = village();
  const s = Gr.solarEclipse(1643524 + 0.5, V);                                   // SDip-77
  assert.equal(s.parva.tau, G.amavasya(1643524 + 0.5));
  assert.ok(Math.abs(s.middle - (s.parva.days - s.lambana.middle / 60)) < 1e-8, 'fixed to a millisecond');
  assert.ok(s.lambana.steps < 60);
  assert.ok(Math.abs(Gr.lambanaAt(s.middle, V) - s.lambana.middle) < 0.002, 'the 4.14 shortcut for the Sun vs its place recomputed');
});

test('[theorem 4.14-4.20] at the contacts the grāsa is zero, at the middle it is 4.10\'s channa; the iteration converges', () => {
  const cases = [Gr.lunarEclipse(kali(2026, 3, 3), UJJAIN), Gr.lunarEclipse(kali(2026, 8, 28), UJJAIN),
    Gr.solarEclipse(1643524 + 0.5, village()), Gr.solarEclipse(1647156 + 0.5, village())];
  for (const E of cases) {
    assert.ok(E.possible);
    for (const k of ['sparsha', 'moksha']) {
      assert.ok(E.sthityardha[k].steps < 200);
      assert.ok(Math.abs(Gr.grasaAt(E, E.contacts[k]).grasa) < 1e-6, `${E.kind} ${k}`);
    }
    assert.ok(Math.abs(Gr.grasaAt(E, E.middle).grasa - E.channa) < 1e-9);
    assert.ok(E.contacts.sparsha < E.middle && E.middle < E.contacts.moksha);
    if (E.total) {
      assert.ok(E.contacts.sparsha < E.contacts.nimilana && E.contacts.unmilana < E.contacts.moksha);
      for (const k of ['nimilana', 'unmilana']) assert.ok(Math.abs(Gr.grasaAt(E, E.contacts[k]).grasa - E.grahyaDisc) < 1e-6, k);
    }
    if (E.kind === 'solar') for (const k of ['sparsha', 'moksha']) assert.ok(E.sthityardha[k].sphuta > E.sthityardha[k].madhya, 'lambana lengthens both halves');
  }
});

test('[theorem 4.18-4.23] round trip: the time for a grāsa (4.22-4.23) gives back that grāsa (4.18-4.21, with 4.19 for the Sun)', () => {
  const cases = [Gr.lunarEclipse(kali(2026, 3, 3), UJJAIN), Gr.solarEclipse(1643524 + 0.5, village()), Gr.solarEclipse(1648722 + 0.5, village())];
  for (const E of cases) for (const side of ['sparsha', 'moksha']) {
    for (const f of [0, 0.05, 0.25, 0.5, 0.75, 0.95]) {
      const g = f * E.channa, r = Gr.timeForGrasa(E, g, side);
      assert.ok(r, `${E.kind} ${side} ${f}`);
      assert.ok(Math.abs(Gr.grasaAt(E, r.at).grasa - g) < 1e-5, `${E.kind} ${side} ${f}`);
      assert.equal(r.at < E.middle, side === 'sparsha');
    }
    assert.ok(Math.abs(Gr.timeForGrasa(E, 0, side).at - E.contacts[side]) < 1e-9);
    assert.equal(Gr.timeForGrasa(E, E.channa + 0.5, side), null, 'more than the middle\'s grāsa is never reached');
  }
});

test('[measured] 4.14\'s shortcut (places carried by the motions, the node "anyathā") vs the text\'s planets recomputed at each contact', () => {
  for (const n of [kali(2026, 3, 3), kali(2026, 8, 28)]) {
    const A = Gr.lunarEclipse(n, UJJAIN), B = Gr.lunarEclipse(n, UJJAIN, { places: 'recompute' });
    for (const k of ['sparsha', 'moksha', 'nimilana', 'unmilana']) assert.ok(Math.abs(A.contacts[k] - B.contacts[k]) * 86400 < 0.5, k);
  }
});

// ── 4.24-4.26, 6.13 ───────────────────────────────────────────────────────────────────────────────

test('[text 4.24-4.25] valana: ākṣa north in the eastern kapāla and south in the western, nothing at Laṅkā; jyā ÷ 70 aṅgulas', () => {
  const E = Gr.lunarEclipse(kali(2026, 3, 3), UJJAIN);
  for (const k of ['sparsha', 'madhya', 'moksha']) {
    const v = E.valana[k];
    assert.equal(v.aksha > 0, v.kapala === 'east');
    assert.ok(Math.abs(v.degrees - (v.aksha + v.ayana)) < 1e-12 && Math.abs(v.angula - S.jya(v.degrees) / 70) < 1e-12);
    assert.ok(Math.abs(v.angula) <= R / 70);
  }
  const L = Gr.lunarEclipse(kali(2026, 3, 3), { latitude: 0, deshantara: 0 });
  assert.ok(Math.abs(L.valana.madhya.aksha) < 1e-12 && Math.abs(L.valana.madhya.degrees - L.valana.madhya.ayana) < 1e-12, 'at Laṅkā only the āyana');
  assert.ok(R / 70 > 49 && R / 70 < 49.2, '6.2: the valana circle of seven-squared aṅgulas holds jyā ÷ 70');
});

test('[reading 4.26] aṅgulas = minutes DIVIDED by the phala; only the 1½ reading keeps 6.2\'s samāsa circle inside the 49-aṅgula valana circle', () => {
  const V = village(), list = [];
  for (const N of [1655645, 1654614, 1653403, 1652694]) { const E = Gr.lunarEclipse(N + 0.5, V); if (E.possible) list.push(E); }
  list.push(Gr.lunarEclipse(kali(2026, 3, 3), UJJAIN));
  assert.ok(list.length >= 3);
  for (const E of list) {
    // at the horizon the phala is 1½, ½ or 1; at the meridian 2½, 1½ or 2
    assert.ok(E.halfSum / 1.5 < 49, 'adhyardha: inside at the horizon');
    assert.ok(E.halfSum / 0.5 > 49 && E.halfSum / 1 > 49, 'the other two readings put the samāsa circle outside 49 at the horizon');
  }
  const E = Gr.solarEclipse(1643524 + 0.5, V);                                     // SDip-77, Sun well up
  for (const reading of Object.keys(Gr.ANGULA_READINGS)) {
    const a = Gr.angulaAt(E, E.middle, { reading });
    assert.ok(a.phala > 0 && Math.abs(a.grahya * a.phala - E.grahyaDisc) < 1e-12, 'chindyāt: the minutes are divided');
  }
  assert.equal(Gr.angulaAt(Gr.lunarEclipse(kali(2026, 8, 28), UJJAIN), Gr.lunarEclipse(kali(2026, 8, 28), UJJAIN).middle), null, 'below the horizon: no aṅgulas');
});

test('[text 6.13] a twelfth of the Moon is seen, three minutes of the Sun are not: the perceptible span begins and ends at that grāsa', () => {
  const E = Gr.lunarEclipse(kali(2026, 3, 3), UJJAIN);
  assert.ok(Math.abs(E.perceptible.threshold - E.grahyaDisc / 12) < 1e-12 && E.perceptible.seen);
  for (const k of ['from', 'to']) assert.ok(Math.abs(Gr.grasaAt(E, E.perceptible[k]).grasa - E.perceptible.threshold) < 1e-5);
  assert.ok(E.contacts.sparsha < E.perceptible.from && E.perceptible.to < E.contacts.moksha);
  const s = Gr.solarEclipse(1652000 + 0.5, village());                             // SDip-72: the text's grāsa is under 3′
  assert.ok(s.possible && s.channa < 3 && s.perceptible.threshold === 3 && !s.perceptible.seen && !s.seenAtSite);
});

test('[theorem 1.11-1.12] the clock counts nāḍīs of the turn (what a kapāla set by the stars counts); the Sun\'s own asus run slower by its motion in right ascension', () => {
  const t = kali(2026, 3, 3) + 0.4, c = Gr.clock(t, UJJAIN);
  assert.ok(Math.abs(Gr.clock(c.sunrise, UJJAIN).sunGhatiAfterSunrise % 60) < 1e-6 || Math.abs(Gr.clock(c.sunrise, UJJAIN).sunGhatiAfterSunrise - 60) < 1e-6, 'the clock\'s sunrise is the Sun\'s rising');
  const turn = (t - c.sunrise) * (21600 + Gr.MEAN.sun) + 60 * (S.ayanamshaSS(S.spandasOfDays(t)) - S.ayanamshaSS(S.spandasOfDays(c.sunrise)));
  assert.ok(Math.abs(c.ghatiAfterSunrise * 360 - turn) < 1e-9);
  const lag = (c.ghatiAfterSunrise - c.sunGhatiAfterSunrise) * 360 / (t - c.sunrise);   // asus a day
  assert.ok(lag > 45 && lag < 75, `${lag} asus a day`);
});

// ── 2026 at Ujjayinī ───────────────────────────────────────────────────────────────────────────────

test('[measured] 2026 at Ujjayinī: the text gives two lunar eclipses, both total — 3 March (rising eclipsed) and 28 August (Moon down) — and no solar eclipse', (t) => {
  const all = Gr.eclipsesBetween(kali(2026, 1, 1), kali(2027, 1, 1), UJJAIN, { all: true });
  const ecl = all.filter((E) => E.possible);
  assert.deepEqual(ecl.map((E) => [E.kind, E.clock.madhya.date, E.total]), [['lunar', '2026-03-03', true], ['lunar', '2026-08-28', true]]);
  const solar = all.filter((E) => E.kind === 'solar');
  assert.deepEqual(solar.map((E) => E.clock.madhya.date), ['2026-02-17', '2026-03-19', '2026-08-12', '2026-09-11'], 'the four amāvāsyās the screen tries');
  assert.ok(solar.every((E) => !E.possible));
  const [m, a] = ecl;
  assert.equal(m.clock.madhya.lmt, '16:21:31'); assert.equal(a.clock.madhya.lmt, '08:26:25');
  assert.ok(m.seenAtSite && !m.horizon.madhya.above && m.horizon.moksha.above);
  assert.ok(!a.seenAtSite && !a.horizon.sparsha.above && !a.horizon.moksha.above);
  const row = (E) => ['sparsha', 'nimilana', 'madhya', 'unmilana', 'moksha'].map((k) => `${k} ${E.clock[k].lmt}`).join(', ');
  for (const E of ecl) t.diagnostic(`${E.clock.madhya.date} lunar, magnitude ${E.magnitude.toFixed(3)}: ${row(E)} (LMT Ujjayinī)`);
  for (const E of solar) t.diagnostic(`${E.clock.madhya.date} solar: apparent latitude ${E.latitude.toFixed(1)}′ vs half-sum ${E.halfSum.toFixed(1)}′ — none`);
});

// ── the ancestors' own record ──────────────────────────────────────────────────────────────────────

test('[measured] Parameśvara\'s and Nīlakaṇṭha\'s recorded eclipses (JM) against the text\'s eclipse at the village on the Nilā', (t) => {
  const V = village(), rec = Object.fromEntries(corpus.records.map((r) => [r.id, r]));
  assert.ok(Math.abs(V.latitude - 10.85) < 0.01 && V.deshantara === -2);
  const run = (id) => {
    const r = rec[id], N = r.printed_number;
    const E = r.kind === 'lunar' ? Gr.lunarEclipse(N + 0.5, V) : Gr.solarEclipse(N + 0.5, V);
    const rise = sunriseOf(N, V), next = sunriseOf(N + 1, V);
    return { r, N, E, dayOffset: (E.middle - rise), inDay: E.middle >= rise && E.middle < next };
  };
  const out = {};
  for (const id of Object.keys(rec)) out[id] = run(id);
  // "not seen here": the text gives no eclipse at the village
  assert.ok(!out['SDip-69'].E.possible && !out['SDip-70'].E.possible);
  // "no eclipse of the Moon was seen"
  assert.ok(!out['SDip-83'].E.possible);
  // the solar eclipses seen at or near the Nilā: an eclipse the same civil day (sunrise to sunrise)
  for (const id of ['SDip-72', 'SDip-74', 'SDip-77', 'SDip-79', 'SDip-80']) assert.ok(out[id].E.possible && out[id].inDay, id);
  // SDip-85a, "the vimarda was seen": total, the Moon up, in the small hours of the printed day
  const a = out['SDip-85a'].E;
  assert.ok(a.total && a.horizon.madhya.above && out['SDip-85a'].dayOffset < 0 && out['SDip-85a'].dayOffset > -0.2);
  // SDip-82 stays unexplained: the text's eclipse is the evening after the next sunrise
  assert.ok(out['SDip-82'].E.possible && out['SDip-82'].dayOffset > 1.5);
  // Nīlakaṇṭha's two: the text puts each on the civil day BEFORE the printed ahargaṇa
  for (const id of ['JM-Syanandurapura', 'JM-Harihara']) assert.ok(out[id].E.possible && out[id].dayOffset < -0.5 && out[id].dayOffset > -1, id);
  // timings the records state in ghaṭikās
  const mo = (id) => out[id].E.clock.moksha;
  assert.ok(Math.abs(mo('SDip-79').ghatiBeforeSunset) < 1, 'SDip-79: release at sunset — the text within a ghaṭikā');
  const sy = mo('JM-Syanandurapura').ghatiBeforeSunset, hh = mo('JM-Harihara').ghatiAfterSunrise;
  assert.ok(sy > 6.5 && sy < 8, `Syānandūrapura: 4 ghaṭikās from release to sunset recorded; the text ${sy.toFixed(2)}`);
  assert.ok(hh > 11 && hh < 13, `Harihara: release after 15 and a fraction ghaṭikās recorded; the text ${hh.toFixed(2)}`);
  // JM p.36 works SDip-77: the 11-pada shadow at contact read by the chāyā-vākyas as 'avama' = 5;40 nāḍikās of the day
  const av = Number(KP.decodeWord('avama').value);
  const dyugata = Math.floor(av / 100) + (av % 100) / 60, sp = out['SDip-77'].E.clock.sparsha.ghatiAfterSunrise;
  assert.ok(Math.abs(dyugata - 5 - 40 / 60) < 1e-12 && sp > 3.8 && sp < 4.8, `SDip-77 contact: recorded ${dyugata.toFixed(2)}, the text ${sp.toFixed(2)}`);
  for (const [id, o] of Object.entries(out)) {
    const E = o.E, c = E.clock || {};
    t.diagnostic(`${id} ${o.r.kind} N=${o.N}: ${E.possible ? `grāsa ${E.channa.toFixed(1)}′ (${E.magnitude.toFixed(2)})${E.total ? ' total' : ''}, middle ${c.madhya.julian} J ${c.madhya.lmt}, ${o.dayOffset.toFixed(3)} d from that day's sunrise; sparśa ${c.sparsha.ghatiAfterSunrise.toFixed(2)} gh after sunrise, mokṣa ${c.moksha.ghatiAfterSunrise.toFixed(2)} gh after / ${c.moksha.ghatiBeforeSunset.toFixed(2)} before sunset; seen ${E.seenAtSite}` : `no eclipse (latitude ${E.latitude.toFixed(1)}′, half-sum ${E.halfSum.toFixed(1)}′)`}`);
  }
});

test('[measured] the readings that move the solar contacts: 5.14 once or until fixed; 5.10 or 5.11\'s natis', (t) => {
  const V = village();
  let worst = 0;
  for (const N of [1643524, 1647156, 1648722, 1652000, 1655662, 1681472, 1686847]) {
    const A = Gr.solarEclipse(N + 0.5, V), B = Gr.solarEclipse(N + 0.5, V, { contactLambana: 'once' });
    if (!A.possible) continue;
    assert.equal(A.middle, B.middle, '5.9 does not depend on 5.14');
    const d = Math.max(Math.abs(A.contacts.sparsha - B.contacts.sparsha), Math.abs(A.contacts.moksha - B.contacts.moksha)) * 1440;
    worst = Math.max(worst, d);
    for (const rule of Gr.NATI_RULES) assert.ok(Math.abs(Gr.solarEclipse(N + 0.5, V, { nati: rule }).channa - A.channa) < 0.3, rule);
  }
  assert.ok(worst > 1 && worst < 30, `${worst}`);
  t.diagnostic(`5.14 "once" against "until fixed": contacts differ by up to ${worst.toFixed(1)} minutes`);
});

// ── the gate ───────────────────────────────────────────────────────────────────────────────────────

test('[FRAME] ss-grahana.js requires only sovereign files, names no modern source and uses no spherical trigonometry', () => {
  const text = fs.readFileSync(path.join(__dirname, 'ss-grahana.js'), 'utf8');
  const FORBIDDEN = /\b(?:DE4\d\d|VSOP\d*|ELP\d*|Swiss|swisseph|Gaia|IERS|DrikTier)\b|finals\.all|DeltaT|astronomy-engine/;
  assert.equal(FORBIDDEN.test(text), false);
  assert.equal(/\bimport\s/.test(text), false);
  assert.equal(/Math\.(?:sin|cos|tan|asin|acos|atan2?)\b/.test(text), false, 'the table, not the sphere');
  const allowed = new Set(['katapayadi.js', 'kala-dvara.js', 'parahita-madhyama.js', 'dhruva.js', 'sphuta.js', 'radau.js', 'panchanga.js', 'dasha.js',
    'muhurta.js', 'utsava.js', 'gurutva.js', 'gurutva-candra.js', 'spanda-ganita.js', 'ss-udaya.js'].map((f) => './' + f));
  const reqs = [...text.matchAll(/\brequire\s*\(\s*["']([^"']+)["']\s*\)/g)].map((m) => m[1]);
  assert.ok(reqs.length > 0);
  for (const r of reqs) assert.ok(allowed.has(r), r);
});

test('every contact of an eclipse carries its horizon state, and an eclipsed Moon is never "up" in broad daylight (council KH-01)', () => {
  const GD = require('./ss-grahana.js'), P = require('./panchanga.js');
  const sites = [UJJAIN, { latitude: 28.6139, deshantara: 1.4205 }, { latitude: 51.5, deshantara: -75.9 }];
  let checked = 0;
  for (const site of sites) {
    for (const E of GD.eclipsesBetween(kali(2026, 1, 1), kali(2031, 1, 1), site)) {
      for (const [c, t] of Object.entries(E.contacts)) {
        if (t === null) continue;
        assert.ok(E.horizon[c] && typeof E.horizon[c].above === 'boolean', `${E.kind} ${c}: horizon state present`);
        if (E.kind !== 'lunar') continue;
        let N = Math.floor(t) - 1; while (P.sunrise(N + 1, site) !== null && P.sunrise(N + 1, site) <= t) N++;
        const rise = P.sunrise(N, site), set = P.sunset(N, site);
        if (rise !== null && set !== null && t > rise + 0.02 && t < set - 0.02) { assert.equal(E.horizon[c].above, false, `${c} at ${t} is in daylight`); checked++; }
      }
    }
  }
  assert.ok(checked > 0, 'some lunar contacts fall in daylight');
});

test('a grazing eclipse is reported, not thrown: the 400-day tables of Khartoum, Accra and Lagos and the 1928-1941 lunar cases (council G-1)', () => {
  const GD = require('./ss-grahana.js');
  const N0 = kali(2026, 10, 7);
  for (const [lat, lon] of [[15.6, 32.5], [5.6, -0.19], [6.5, 3.4]]) {
    const site = { latitude: lat, deshantara: +(lon - 75.77).toFixed(2) };
    assert.doesNotThrow(() => GD.eclipsesBetween(N0, N0 + 400, site));
  }
  for (const [y, m, d] of [[1928, 6, 18], [1934, 8, 10], [1941, 3, 28]]) {
    const list = GD.eclipsesBetween(kali(y, m, d) - 3, kali(y, m, d) + 3, UJJAIN, { all: true });
    for (const E of list) if (E.grazing) { assert.equal(E.possible, false); assert.match(E.note, /4\.16-4\.17/); }
  }
});

test('the float screen drops no eclipse: the screened list equals the exact one over four years at two sites (council G-2)', () => {
  const GD = require('./ss-grahana.js');
  for (const site of [UJJAIN, { latitude: 51.5, deshantara: -75.8 }]) {
    const a = kali(2026, 1, 1), b = kali(2030, 1, 1);
    const fast = GD.eclipsesBetween(a, b, site).map((e) => e.kind + e.middle.toFixed(6));
    const exact = GD.eclipsesBetween(a, b, site, { all: true }).filter((e) => e.possible).map((e) => e.kind + e.middle.toFixed(6));
    assert.deepEqual(fast, exact);
    assert.ok(fast.length >= 8);
  }
});
