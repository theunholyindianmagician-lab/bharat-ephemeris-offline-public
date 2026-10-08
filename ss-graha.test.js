'use strict';
/*
 * ss-graha.test.js — the five star-planets of the Sūrya-Siddhānta (ss-graha.js) checked against the text's own words and
 * its own identities. Inputs: the verse words (editions/surya-siddhanta-full-edition.html), the decoded register
 * (corpus/surya-siddhanta/numbers.json) and the text's sine table (sphuta.js). No ephemeris and no referee: where a
 * number is [measured] it is the text's model measured against itself; Math.sin/atan2 appear here only to measure the
 * table's distance from the sphere. The 2026 tables are printed, not compared with anything.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
// This suite checks the text as written: its 24-entry sine table (withSine('table')). The engine's default sine is
// Mādhava's (owner, 2026-10-07); ss-madhava.test.js measures what that changes.
const G = require('./ss-graha.js').withSine('table');
const S = require('./sphuta.js').withSine('table');
const U = require('./ss-udaya.js').withSine('table');
const K = require('./kala-dvara.js');

const reg = JSON.parse(fs.readFileSync(path.join(__dirname, 'corpus', 'surya-siddhanta', 'numbers.json'), 'utf8'));
const items = (v) => reg.verses.find((x) => x.v === v).items;
const item = (v, i) => items(v)[i].n;
const edition = fs.readFileSync(path.join(__dirname, 'editions', 'surya-siddhanta-full-edition.html'), 'utf8');
const iast = (v) => { const m = edition.match(new RegExp(`id="v${v.replace('.', '-').replace(/-(\d)$/, '-0$1')}"[\\s\\S]*?<div class="iast">([\\s\\S]*?)</div>`)); return m ? m[1].replace(/<br>/g, ' ') : ''; };
const mod = (a, m) => ((a % m) + m) % m;
const wrap = (d) => mod(d + 180, 360) - 180;
const YUGA = S.YUGA_DAYS;
const T2026 = K.kaliDayFromCivil({ calendar: 'gregorian', year: 2026, month: 1, day: 1 });
const date = (t) => { const c = K.civilFromKaliDay(Math.floor(t), 'gregorian'); return `${c.year}-${String(c.month).padStart(2, '0')}-${String(c.day).padStart(2, '0')}`; };
const stat = (a) => ({ min: Math.min(...a), mean: a.reduce((x, y) => x + y, 0) / a.length, max: Math.max(...a) });
const f1 = (x) => x.toFixed(1);

test('the numbers are the verse words: 1.30-1.32, 1.41-1.44, 2.35-2.37, 2.53 from the register; 1.70 and 7.13 decoded here', () => {
  const P = G.PLANETS;
  assert.equal(P.mars.rev, BigInt(item('1.30', 1))); assert.equal(P.mercury.rev, BigInt(item('1.31', 0)));
  assert.equal(P.jupiter.rev, BigInt(item('1.31', 1))); assert.equal(P.venus.rev, BigInt(item('1.32', 0)));
  assert.equal(P.saturn.rev, BigInt(item('1.32', 1)));
  assert.match(iast('1.29'), /yuge sūryajñaśukrāṇāṃ khacatuṣkaradārṇavāḥ/, '1.29: Sun, Mercury, Venus share 4,320,000 …');
  assert.match(iast('1.29'), /kujārkiguruśīghrāṇāṃ/, '… and so do the śīghras of Mars, Saturn, Jupiter');
  const ap = [...items('1.41').slice(1), ...items('1.42')].map((x) => x.n), nd = [...items('1.43'), ...items('1.44')].map((x) => x.n);
  assert.deepEqual(G.NAMES.map((n) => Number(P[n].mandocca)), ap);
  assert.deepEqual(G.NAMES.map((n) => Number(P[n].node)), nd);
  assert.match(iast('1.42'), /pātānāṃ atha vāmataḥ/, 'nodes westward');
  const ev = items('2.35'), sg0 = items('2.36'), sg1 = items('2.37');
  G.NAMES.forEach((n, i) => {
    assert.deepEqual(P[n].manda, [ev[i].n, ev[i + 5].n], `${n} manda even/odd`);
    assert.deepEqual(P[n].sighra, [sg0[i].n, sg1[i].n], `${n} śīghra even/odd`);
    assert.equal(P[n].station, item('2.53', i), `${n} 2.53`);
  });
  // 1.70: "trighana-randhra-arka-rasa-arka-arkā daśāhatāḥ", Moon onward in weekday order; 1.69 says the same by ratios
  assert.match(iast('1.70'), /trighanarandhrārkarasārkārkā daśāhatāḥ/);
  const W = { trighana: 3 ** 3, randhra: 9, arka: 12, rasa: 6 };
  const lat = ['trighana', 'randhra', 'arka', 'rasa', 'arka', 'arka'].map((w) => W[w] * 10);
  assert.equal(lat[0], 21600 / 80, '1.68: the Moon\'s 270′ = one-eightieth of the circle');
  assert.deepEqual(lat.slice(1), G.NAMES.map((n) => P[n].lat));
  assert.deepEqual([3, 4, 2, 4, 4].map((k) => k * lat[0] / 9), lat.slice(1), '1.69: a ninth, ×3 Mars, ×4 Mercury, ×2 Jupiter, ×4 Venus and Saturn');
  // 7.13: thirty increased by half of half for Mars, Saturn, Mercury, Jupiter; Venus sixty
  assert.match(iast('7.13'), /kujārkijñāmarejyānāṃ triṃśadardhārdhavardhitāḥ/);
  assert.match(iast('7.13'), /bhṛgoḥ ṣaṣṭirudāhṛtā/);
  const order = ['mars', 'saturn', 'mercury', 'jupiter'];
  order.forEach((n, k) => assert.equal(P[n].viskambha, 30 + k * (30 / 2 / 2)));
  assert.equal(P.venus.viskambha, 60);
  assert.equal(324000 / 21600, G.MOON_ORBIT_YOJANA_PER_ARCMIN, '7.14 "tithi" = 15 yojanas to a minute on the Moon\'s orbit (12.85, 12.83)');
});

test('[theorem] mean places: Meṣa 0 at the Kali epoch and at the end of the Kṛta; a yuga closes the yuga bodies, a kalpa closes all', () => {
  for (const d of [0n, -YUGA / 2n]) {                                       // 1.57: Kṛta end = Kali − (Tretā + Dvāpara) = half a yuga
    const m = G.meanPlaces(d);
    for (const n of G.NAMES) { assert.equal(m[n].mean, 0); assert.equal(m[n].sighrocca, 0); }
  }
  // 1.58 + 1.47: the slow uccas and nodes are NOT at Meṣa 0 at the Kṛta end; from creation they are (years = 0)
  const krta = G.meanPlaces(-YUGA / 2n);
  assert.ok(Math.abs(krta.mars.mandocca - 93.24) < 1e-9 && Math.abs(krta.saturn.mandocca - 229.59) < 1e-9 && Math.abs(krta.jupiter.mandocca - 9) < 1e-9);
  const creation = G.meanPlaces(-(1811n * YUGA) / 4n);                       // 452¾ yugas before Kali
  assert.equal((1811n * YUGA) % 4n, 0n);
  for (const n of G.NAMES) for (const k of ['mean', 'sighrocca', 'mandocca', 'node']) assert.ok(creation[n][k] < 1e-9 || creation[n][k] > 360 - 1e-9, `${n}.${k} at creation`);
  const t = 1872576n, a = G.meanPlaces(t), y = G.meanPlaces(t + YUGA), k = G.meanPlaces(t + 1000n * YUGA);
  for (const n of G.NAMES) {
    assert.equal(y[n].mean, a[n].mean); assert.equal(y[n].sighrocca, a[n].sighrocca);
    assert.notEqual(y[n].mandocca, a[n].mandocca, 'a per-kalpa body moves rev/1000 in a yuga');
    assert.deepEqual(k[n], a[n], `${n}: a kalpa closes every body`);
  }
  // the float day count agrees with the BigInt day count, and the nodes run backwards (1.54)
  const b = G.meanPlaces(1872576.0);
  for (const n of G.NAMES) assert.equal(b[n].mean, a[n].mean);
  const c = G.meanPlaces(1872576 + 3650.25);
  for (const n of G.NAMES) {
    const mo = G.motions(n);
    assert.ok(Math.abs(wrap(c[n].mean - b[n].mean) - wrap(mo.mean * 3650.25 / 60)) < 1e-7);
    assert.ok(wrap(c[n].node - b[n].node) < 0 && mo.node < 0);
  }
  assert.ok(Math.abs(G.motions('mars').mean - 2296832 * 21600 / 1577917828) < 1e-12);
});

test('[theorem] synodic periods from the revolution numbers: a whole number of cycles in a yuga, and the śīghra kendra returns', () => {
  const out = [];
  for (const n of G.NAMES) {
    const p = G.PLANETS[n], cycles = p.inner ? p.rev - 4320000n : 4320000n - p.rev;
    assert.ok(Math.abs(G.synodicDays(n) - Number(YUGA) / Number(cycles)) < 1e-9);
    const t = 1872576.3, m0 = G.meanPlaces(t)[n], m1 = G.meanPlaces(t + G.synodicDays(n))[n];
    assert.ok(Math.abs(wrap((m1.sighrocca - m1.mean) - (m0.sighrocca - m0.mean))) < 1e-6, `${n}: kendra after one synodic period`);
    out.push(`${n} ${G.synodicDays(n).toFixed(3)} d (${cycles} in a yuga)`);
  }
  console.log('synodic periods (yuga ÷ |śīghrocca − planet| revolutions): ' + out.join('; '));
});

test('[theorem] the two equations: 2.38 epicycles, 2.40 karṇa, 2.45 signs, mirror symmetry; and the table\'s distance from the sphere', () => {
  // the manda rule is sphuta.js's own for the Sun
  for (const k of [0, 17, 93.7, 181, 250, 359.9]) assert.ok(Math.abs(G.manda(k, S.PARIDHI.sun).degrees - S.mandaPhala(0, k, S.PARIDHI.sun).degrees) < 1e-12);
  const rows = [];
  for (const n of G.NAMES) {
    const p = G.PLANETS[n];
    for (const pair of [p.manda, p.sighra]) {
      assert.equal(G.paridhiAt(0, pair), pair[0]); assert.equal(G.paridhiAt(180, pair), pair[0]);     // even ends
      assert.equal(G.paridhiAt(90, pair), pair[1]); assert.equal(G.paridhiAt(270, pair), pair[1]);    // odd ends
    }
    const s0 = G.sighra(0, p.sighra), s180 = G.sighra(180, p.sighra);
    assert.ok(s0.degrees === 0 && s180.degrees === 0);
    assert.ok(Math.abs(s0.karna - (G.R + G.R * p.sighra[0] / 360)) < 1e-9 && Math.abs(s180.karna - (G.R - G.R * p.sighra[0] / 360)) < 1e-9);
    for (let k = 0.5; k < 360; k += 7.25) {
      const s = G.sighra(k, p.sighra), m = G.manda(k, p.manda), sm = G.sighra(360 - k, p.sighra), mm = G.manda(360 - k, p.manda);
      assert.equal(Math.sign(s.degrees), k < 180 ? 1 : -1, '2.45: additive from Meṣa');
      assert.equal(Math.sign(m.degrees), k < 180 ? 1 : -1);
      assert.ok(Math.abs(s.degrees + sm.degrees) < 1e-12 && Math.abs(m.degrees + mm.degrees) < 1e-12 && Math.abs(s.karna - sm.karna) < 1e-9);
      assert.equal(s.kotiphala > 0, k < 90 || k > 270, '2.40: the koṭiphala is added to R from Makara, taken away from Karka');
      assert.ok(Math.abs(s.karna ** 2 - ((G.R + s.kotiphala) ** 2 + s.bhujaphala ** 2)) < 1e-6, '2.41');
    }
    // the table against the sphere (the same epicycle): measured, not corrected
    let ms = 0, mm = 0;
    for (let k = 0; k < 360; k += 0.25) {
      const s = G.sighra(k, p.sighra), r = s.paridhi / 360, x = k * Math.PI / 180;
      ms = Math.max(ms, Math.abs(s.degrees - Math.atan2(r * Math.sin(x), 1 + r * Math.cos(x)) * 180 / Math.PI) * 60);
      const m = G.manda(k, p.manda);
      mm = Math.max(mm, Math.abs(m.degrees - Math.asin(m.paridhi / 360 * Math.sin(x)) * 180 / Math.PI) * 60);
    }
    assert.ok(ms < 3 && mm < 0.7, `${n}: śīghra ${ms.toFixed(2)}′, manda ${mm.toFixed(2)}′`);
    rows.push(`${n} śīghra ≤ ${ms.toFixed(2)}′, manda ≤ ${mm.toFixed(2)}′`);
  }
  console.log('[measured] the table\'s equations against the sphere\'s for the same epicycles: ' + rows.join('; '));
});

test('[theorem] the four operations of 2.43-2.44 reproduce themselves: zero kendras, mirror images, the order of the steps', () => {
  for (const n of G.NAMES) {
    // all at one point: no equation anywhere
    const z = G.fourSteps(n, { mean: 40, sighrocca: 40, mandocca: 40, node: 10 });
    assert.ok(Math.abs(z.longitude - 40) < 1e-12 && z.steps.every((s) => Math.abs(s - 40) < 1e-12));
    // śīghrocca opposite and mandocca on the planet: the sines vanish, the place is the mean
    const o = G.fourSteps(n, { mean: 40, sighrocca: 220, mandocca: 40, node: 10 });
    assert.ok(Math.abs(o.longitude - 40) < 1e-12);
    // mirror: reflect every mean place; the true place and the latitude reflect exactly (the table is odd)
    for (const m of [{ mean: 12.3, sighrocca: 101.7, mandocca: 250.2, node: 33 }, { mean: 300, sighrocca: 140, mandocca: 130, node: 200 }]) {
      const a = G.fourSteps(n, m), b = G.fourSteps(n, { mean: -m.mean, sighrocca: -m.sighrocca, mandocca: -m.mandocca, node: -m.node });
      assert.ok(Math.abs(wrap(a.longitude + b.longitude)) < 1e-9 && Math.abs(a.latitude + b.latitude) < 1e-9, `${n} mirror`);
      // the steps, in the text's order
      const e = a.equations;
      assert.ok(Math.abs(wrap(a.steps[0] - m.mean - e.sighra1.degrees / 2)) < 1e-12, '1: half śīghra on the mean');
      assert.ok(Math.abs(wrap(e.manda2.kendra - (m.mandocca - a.steps[0]))) < 1e-9 && Math.abs(wrap(a.steps[1] - a.steps[0] - e.manda2.degrees / 2)) < 1e-12, '2: half manda from that place');
      assert.ok(Math.abs(wrap(e.manda3.kendra - (m.mandocca - a.steps[1]))) < 1e-9 && Math.abs(wrap(a.steps[2] - m.mean - e.manda3.degrees)) < 1e-12, '3: full manda on the MEAN');
      assert.ok(Math.abs(wrap(e.sighra4.kendra - (m.sighrocca - a.steps[2]))) < 1e-9 && Math.abs(wrap(a.longitude - a.steps[2] - e.sighra4.degrees)) < 1e-12, '4: full śīghra');
      // 2.4: the ucca ahead within half a circle draws the planet forward
      assert.equal(wrap(a.longitude - a.steps[2]) > 0, e.sighra4.kendra < 180);
    }
  }
});

test('[theorem] 2.56-2.57: the node takes the planet\'s śīghra equation (Mars, Jupiter, Saturn) or the third equation reversed (Mercury, Venus)', () => {
  for (let t = 1872000; t < 1872000 + 2000; t += 37.3) {
    const m = G.meanPlaces(t), p = G.truePlaces(t);
    for (const n of G.NAMES) {
      const x = p[n], inner = G.PLANETS[n].inner;
      // so the argument of latitude is the manda-true planet − node for the outer, śīghrocca + third equation − node for the inner
      const want = inner ? m[n].sighrocca + x.equations.manda3.degrees - m[n].node : x.mandaTrue - m[n].node;
      assert.ok(Math.abs(wrap(x.latitudeArgument - want)) < 1e-9, `${n} argument`);
      assert.ok(Math.abs(x.latitude - S.jya(x.latitudeArgument) * G.PLANETS[n].lat / x.karna) < 1e-12);
      assert.equal(x.latitude > 0, x.latitudeArgument > 0 && x.latitudeArgument < 180, '2.7: past the node by less than half a circle → north');
    }
  }
});

test('2.46 bhujāntara is a shift of the instant by the Sun\'s equation; 2.47-2.51 motion against the place\'s own [measured]', () => {
  const t = T2026 + 100.3, e = G.sunEquation(t);
  const a = G.truePlace(t, 'mercury', { bhujantara: true }), b = G.truePlace(t + e * 60 / 21600, 'mercury');
  assert.equal(a.longitude, b.longitude);
  assert.ok(Math.abs(wrap(a.longitude - G.truePlace(t, 'mercury').longitude)) * 60 < Math.abs(e) * 60 * 250 / 21600 + 1e-9, 'motion × equation ÷ 21,600');
  // [theorem] at śīghra kendra 0° and 180° the rule's factor (K − R)/K is the epicycle's exact rate dφ/dσ
  for (const p of [0.1, 0.65, 0.73]) {
    for (const s of [0, 180]) {
      const phi = (x) => Math.atan2(p * Math.sin(x), 1 + p * Math.cos(x)), h = 1e-6, x = s * Math.PI / 180;
      const rate = (phi(x + h) - phi(x - h)) / (2 * h), Kr = s === 0 ? 1 + p : 1 - p;
      assert.ok(Math.abs(rate - (Kr - 1) / Kr) < 1e-8);
    }
  }
  const rows = [];
  for (const n of G.NAMES) {
    const syn = G.synodicDays(n);
    // the largest difference and the agreement in sign, over 20 synodic periods
    let maxd = 0, agree = 0, tot = 0;
    for (let t0 = T2026; t0 < T2026 + syn * 20; t0 += 0.5) {
      const v = G.trueMotion(t0, n).motion, w = G.placeMotion(t0, n);
      maxd = Math.max(maxd, Math.abs(v - w)); agree += (v < 0) === (w < 0) ? 1 : 0; tot++;
    }
    assert.ok(agree / tot > 0.95);
    // over 120 years: the rule's motion, summed, against the place's displacement (mean motion + change of the equations)
    const span = 365.25 * 120, mo = G.motions(n);
    let ruleDeg = 0;
    for (let t0 = T2026; t0 < T2026 + span; t0 += 1) ruleDeg += (G.trueMotion(t0, n).motion + G.trueMotion(t0 + 1, n).motion) / 2 / 60;
    const eq = (t0) => wrap(G.truePlace(t0, n).longitude - G.meanPlaces(t0)[n].mean);
    const placeDeg = mo.mean * span / 60 + eq(T2026 + span) - eq(T2026);
    const lossPerCycle = (placeDeg - ruleDeg) / (span / syn);
    assert.ok(lossPerCycle > 1, `${n}: the 2.51 rule loses ${lossPerCycle.toFixed(2)}° a synodic period`);
    rows.push(`${n}: |rule − place| ≤ ${maxd.toFixed(1)}′/day; same sign ${(100 * agree / tot).toFixed(1)}% of the time; summed over 120 years the rule runs ${(ruleDeg * 60 / span).toFixed(2)}′/day `
      + `against the place's ${(placeDeg * 60 / span).toFixed(2)} (mean ${mo.mean.toFixed(2)}), ${lossPerCycle.toFixed(1)}° short each synodic period`);
  }
  console.log('[measured] 2.50-2.51\'s true motion against the four-step place\'s own motion, 20 synodic periods from 2026:\n  ' + rows.join('\n  '));
});

test('2.51-2.55: stations of the text\'s model against 2.53 and 2.55 — by the motion rule and by the place itself [measured]', () => {
  const lines = [], res = {};
  for (const by of ['text', 'place']) {
    res[by] = {};
    for (const n of G.NAMES) {
      const span = n === 'mercury' ? 365.25 * 40 : 365.25 * 120;
      const st = G.stations(n, T2026 - span / 2, T2026 + span / 2, { by });
      const v = st.filter((s) => s.kind === 'vakra'), m = st.filter((s) => s.kind === 'margi');
      const expected = span / G.synodicDays(n);
      assert.ok(Math.abs(v.length - expected) <= 1.01 && Math.abs(m.length - expected) <= 1.01, `${by} ${n}: one station of each kind a synodic period (${v.length} vs ${expected.toFixed(1)})`);
      for (let i = 1; i < st.length; i++) assert.notEqual(st[i].kind, st[i - 1].kind, 'stations alternate');
      const spans = G.retrogradeSpans(n, T2026 - span / 2, T2026 + span / 2, { by }).filter((s) => !s.openStart && !s.openEnd);
      const kv = stat(v.map((s) => s.kendra)), km = stat(m.map((s) => s.kendra));
      const sym = stat(spans.map((s) => s.kendraStart + s.kendraEnd - 360));
      const houses = {}; v.forEach((s) => { houses[s.house] = (houses[s.house] || 0) + 1; });
      res[by][n] = { kv, km, sym, houses, arc: stat(spans.map((s) => s.arc)), days: stat(spans.map((s) => s.days)), karc: stat(spans.map((s) => s.kendraEnd - s.kendraStart)), merged: st.merged, count: v.length };
      lines.push(`${by.padEnd(5)} ${n.padEnd(8)} vakra κ ${f1(kv.min)}–${f1(kv.max)} (mean ${f1(kv.mean)}) vs 2.53 ${G.PLANETS[n].station}; mārgī κ mean ${f1(km.mean)} (2.54: ${360 - G.PLANETS[n].station}); `
        + `κ-arc ${f1(res[by][n].karc.mean)}°; arc of longitude ${f1(res[by][n].arc.min)}–${f1(res[by][n].arc.max)}°; ${f1(res[by][n].days.min)}–${f1(res[by][n].days.max)} days; signs ${JSON.stringify(houses)} (2.55: ${G.PLANETS[n].house}); ${v.length} stations, ${st.merged} jitter pairs merged`);
    }
  }
  console.log('[measured] stations, κ = the fourth operation\'s śīghra kendra (2.53 "caturtheṣu"), ±60 years from 2026 (Mercury ±20):\n  ' + lines.join('\n  '));
  const P = res.place, T = res.text;
  // the place's own stations: 2.53's numbers for Mars, Mercury, Saturn; Jupiter 6° short; Venus at 167°, never near 83°
  for (const n of ['mars', 'mercury', 'saturn']) assert.ok(Math.abs(P[n].kv.mean - G.PLANETS[n].station) < 2.5, n);
  assert.ok(G.PLANETS.jupiter.station - P.jupiter.kv.mean > 5 && G.PLANETS.jupiter.station - P.jupiter.kv.mean < 7);
  assert.ok(Math.abs(P.venus.kv.mean - 167) < 1 && P.venus.kv.min - 83 > 80, `Venus ${P.venus.kv.mean}`);
  // 2.55: every station of the place falls in the text's sign, Venus in the seventh with Mars; 83° would be the tenth
  for (const n of G.NAMES) assert.deepEqual(Object.keys(P[n].houses), [String(G.PLANETS[n].house)], `${n}: 2.55`);
  assert.equal(G.houseFromSighrocca(83), 10);
  for (const n of ['mars', 'mercury', 'jupiter', 'saturn']) assert.equal(G.houseFromSighrocca(G.PLANETS[n].station), G.PLANETS[n].house, `2.53's ${n} is in 2.55's sign`);
  // 2.54: retrogression ends near 360° − κ of its start
  for (const n of G.NAMES) assert.ok(Math.abs(P[n].sym.min) < 4 && Math.abs(P[n].sym.max) < 4 && Math.abs(T[n].sym.mean) < 0.5, `${n}: 2.54`);
  // the zero of 2.51's motion comes earlier in κ than the place's station, for every planet, and splits Mars and Jupiter across two signs
  for (const n of G.NAMES) assert.ok(T[n].kv.mean < P[n].kv.mean - 1.5, `${n}: rule ${T[n].kv.mean} < place ${P[n].kv.mean}`);
  assert.ok(Object.keys(T.mars.houses).length === 2 && Object.keys(T.jupiter.houses).length === 2);
  assert.ok(P.mars.merged > 0, 'the table\'s kinks make Mars\'s place stand and turn more than once at some stations');
});

test('[measured] latitudes and discs over sixty years: within greatest latitude × R ÷ least karṇa; 7.14 divides once', () => {
  const rows = [];
  for (const n of G.NAMES) {
    let maxLat = 0, kmin = Infinity, dmin = Infinity, dmax = 0;
    for (let t = T2026 - 365.25 * 30; t < T2026 + 365.25 * 30; t += 1.7) {
      const p = G.truePlace(t, n), d = G.diameter(n, p);
      maxLat = Math.max(maxLat, Math.abs(p.latitude)); kmin = Math.min(kmin, p.karna);
      dmin = Math.min(dmin, d.arcmin); dmax = Math.max(dmax, d.arcmin);
    }
    const bound = G.PLANETS[n].lat * G.R / kmin;
    assert.ok(maxLat <= bound + 1e-9 && maxLat > 0.95 * bound, `${n}: ${maxLat} of ${bound}`);
    assert.ok(Math.abs(G.diameter(n, { equations: { manda3: { karna: G.R }, sighra4: { karna: G.R } } }).arcmin - G.PLANETS[n].viskambha / 15) < 1e-12, 'at the mean distance: viṣkambha ÷ 15');
    assert.ok(dmin > 1 && dmax < 7, `${n}: ${dmin}–${dmax}′`);
    rows.push(`${n} |β| ≤ ${f1(maxLat)}′ (1.70: ${G.PLANETS[n].lat}′), disc ${dmin.toFixed(2)}–${dmax.toFixed(2)}′ (mean ${(G.PLANETS[n].viskambha / 15).toFixed(1)}′)`);
  }
  console.log('[measured] ' + rows.join('; '));
  // the edition's reading of 7.14 divides a second time by "own karṇa": its own worked example (Venus, K₃ + K₄ = 8000, K = 3500)
  const once = 60 * 2 * 3438 / 8000 / 15, twice = once / 3500;
  assert.ok(Math.abs(once - 3.438) < 1e-9, 'one division: 3.44′');
  assert.ok(twice < 0.001, `two divisions: ${twice.toFixed(6)}′, i.e. ${(twice * 60).toFixed(3)}″ — a planet a thousandth of a minute across`);
  assert.match(iast('7.14'), /sphuṭāḥ svakarṇāstithyāptā/, '"svakarṇāḥ" is nominative with "sphuṭāḥ"; only "-āptāḥ" divides');
  assert.match(iast('4.3'), /viṣkambhaścandrakakṣāyāṃ tithyāptā mānaliptikā/, '4.3: on the Moon\'s orbit, ÷ 15 = minutes, with nothing between');
});

test('7.2-7.6: the verses\' past/future and difference/sum rules are the signed interval −Δλ ÷ (vA − vB) [theorem]', () => {
  for (const [la, lb] of [[10, 9], [9, 10], [359.5, 0.2], [0.2, 359.5]]) {
    for (const [va, vb] of [[60, 30], [30, 60], [-10, 40], [40, -10], [-10, -3], [-3, -10]]) {
      const r = G.yutiInterval(la, va, lb, vb), signed = -wrap(la - lb) * 60 / (va - vb);
      assert.ok(Math.abs(r.days - signed) < 1e-12, `${la},${va} ${lb},${vb}`);
      assert.equal(r.past, signed < 0);
      assert.equal(r.divisor, (va < 0) === (vb < 0) ? 'difference' : 'sum');
      assert.ok(Math.abs(wrap(r.lamA - r.lamB)) < 1e-12, '7.6: equal minutes');
    }
  }
  assert.equal(G.yutiInterval(10, 5, 11, 5), null, 'equal motions never meet');
  // over ten years, the text's repeated 7.4 finds the same conjunctions as halving a bracket, and settles on most of them
  const t1 = T2026, t2 = T2026 + 3652.5, cs = G.conjunctions(t1, t2), found = [];
  const L = (t) => Object.fromEntries(G.NAMES.map((n) => [n, G.truePlace(t, n).longitude]));
  let la = L(t1);
  for (let t = t1; t < t2; t += 0.5) {
    const lb = L(t + 0.5);
    for (let i = 0; i < 5; i++) for (let j = i + 1; j < 5; j++) {
      const a = G.NAMES[i], b = G.NAMES[j], da = wrap(la[a] - la[b]), db = wrap(lb[a] - lb[b]);
      if (Math.abs(da) < 60 && Math.abs(db) < 60 && (da > 0) !== (db > 0)) found.push({ a, b, lo: t, hi: t + 0.5 });
    }
    la = lb;
  }
  assert.equal(cs.length, found.length);
  for (const f of found) assert.ok(cs.some((c) => c.a === f.a && c.b === f.b && c.t >= f.lo - 1e-6 && c.t <= f.hi + 1e-6), `${f.a}–${f.b} near ${date(f.lo)}`);
  const byText = cs.filter((c) => c.method === '7.4').length;
  assert.ok(byText / cs.length > 0.95, `${byText} of ${cs.length} by 7.4`);
  console.log(`[measured] 2026-2036: ${cs.length} conjunctions among the five; ${byText} settle by 7.4 repeated, ${cs.length - byText} (slow pairs near a station) need the bracket halved`);
});

test('2026: the five planets\' SS places, retrograde spans and conjunctions (text output, no referee)', () => {
  const dates = [[1, 1], [4, 1], [7, 1], [10, 7]].map(([m, d]) => K.kaliDayFromCivil({ calendar: 'gregorian', year: 2026, month: m, day: d }));
  const out = ['SS true places at midnight at Laṅkā (sidereal from the text\'s Meṣa 0°; latitude in minutes; motion by 2.51 in minutes a day):'];
  for (const t of dates) {
    const p = G.truePlaces(t);
    out.push(`  ${date(t)}  ` + G.NAMES.map((n) => {
      const mo = G.trueMotion(t, n).motion;
      assert.ok(p[n].longitude >= 0 && p[n].longitude < 360 && Math.abs(p[n].latitude) < 450);
      return `${n} ${p[n].longitude.toFixed(2)}° ${p[n].latitude >= 0 ? '+' : ''}${p[n].latitude.toFixed(0)}′ ${mo >= 0 ? '+' : ''}${mo.toFixed(1)}`;
    }).join(' | '));
  }
  out.push('Retrograde spans touching 2026 (the place\'s own stations; in brackets the zero of 2.51\'s motion):');
  for (const n of G.NAMES) {
    const a = G.retrogradeSpans(n, T2026 - 200, T2026 + 365 + 200, { by: 'place' }).filter((s) => s.end > T2026 && s.start < T2026 + 365);
    const b = G.retrogradeSpans(n, T2026 - 200, T2026 + 365 + 200).filter((s) => s.end > T2026 && s.start < T2026 + 365);
    for (const s of a) assert.ok(s.days > 15 && s.days < 160 && s.arc > 5 && s.arc < 20);
    out.push(`  ${n.padEnd(8)} ` + (a.map((s) => `${date(s.start)} → ${date(s.end)} (${s.days.toFixed(0)} d, ${s.arc.toFixed(1)}° back, κ ${f1(s.kendraStart)}→${f1(s.kendraEnd)})`).join('; ') || 'none')
      + `  [${b.map((s) => `${date(s.start)} → ${date(s.end)}`).join('; ') || 'none'}]`);
  }
  const cs = G.conjunctions(T2026, T2026 + 365);
  out.push('Conjunctions in longitude (7.2-7.6), latitude separation (7.12; + when the first is north), discs (7.14), kind (7.18-7.20):');
  for (const c of cs) {
    assert.ok(Math.abs(wrap(c.stateA.longitude - c.stateB.longitude)) < 1e-4);
    assert.ok(Math.abs(Math.abs(c.separation) - (Math.sign(c.latitudeA) === Math.sign(c.latitudeB) ? Math.abs(Math.abs(c.latitudeA) - Math.abs(c.latitudeB)) : Math.abs(c.latitudeA) + Math.abs(c.latitudeB))) < 1e-9, '7.12');
    const y = G.yuddha(c);
    const r = (y.diameters[c.a] + y.diameters[c.b]) / 2;
    assert.equal(y.kind, Math.abs(c.separation) < r ? (Math.abs(c.separation) <= Math.abs(y.diameters[c.a] - y.diameters[c.b]) / 2 ? 'bheda' : 'ullekha') : Math.abs(c.separation) < 60 ? 'yuddha' : 'samāgama');
    out.push(`  ${date(c.t)} ${String(((c.t % 1) * 24).toFixed(1)).padStart(4)}h  ${c.a}–${c.b} at ${c.longitude.toFixed(2)}°, separation ${c.separation.toFixed(1)}′, discs ${y.diameters[c.a].toFixed(2)}′/${y.diameters[c.b].toFixed(2)}′ → ${y.kind}${y.victor ? `, victor ${y.victor}` : ''}`);
  }
  assert.ok(cs.length >= 6 && cs.length <= 20);
  console.log(out.join('\n'));
});

test('7.23 with the Moon; 7.7-7.10 dṛkkarma at an hour angle reduces to ss-udaya\'s at the horizon and vanishes on the meridian', () => {
  const cm = G.conjunctions(T2026, T2026 + 59.06, { bodies: ['moon', ...G.NAMES] }).filter((c) => c.a === 'moon');
  assert.ok(cm.length >= 9 && cm.length <= 11, `${cm.length}: each planet about twice in two months`);
  for (const c of cm) assert.equal(G.yuddha(c).kind, 'samāgama');
  const pb = U.palabhaOf(23.18);
  for (const [lam, beta] of [[100, 240], [10, -90], [250, 60]]) {
    const A = 23, trop = lam + A;
    const kr = U.kranti(trop) * 60 + beta, kj = Math.sign(kr) * S.jyaOfArcmin(Math.abs(kr));
    const hd = 5400 + Math.sign(kj) * S.arcminOfJya(Math.min(S.R, Math.abs(kj * pb / 12 * S.R / U.dyujya(kj))));
    const w = G.drkkarma(lam, beta, pb, hd, A), e = G.drkkarma(lam, beta, pb, -hd, A), m = G.drkkarma(lam, beta, pb, 0, A);
    const uw = U.drkkarma(trop, beta, pb, 'west'), ue = U.drkkarma(trop, beta, pb, 'east');
    assert.ok(Math.abs(w.aksaArcmin - uw.aksaArcmin) < 1e-9 && Math.abs(e.aksaArcmin - ue.aksaArcmin) < 1e-9 && Math.abs(w.ayanaArcmin - uw.ayanaArcmin) < 1e-9);
    assert.equal(m.aksaArcmin === 0 || Object.is(m.aksaArcmin, -0), true, 'nata 0: no ākṣa');
    const half = G.drkkarma(lam, beta, pb, hd / 2, A);
    assert.ok(Math.abs(half.aksaArcmin - uw.aksaArcmin / 2) < 1e-9, '7.8: in proportion to the hour angle over the half-day');
  }
  const ujj = { palabha: pb, desantaraDays: 0 };
  for (const c of G.conjunctions(T2026, T2026 + 365)) {
    const d = G.yutiDrk(c, ujj);
    assert.ok(Number.isFinite(d.t) && Math.abs(d.shiftDays) < 5, `${c.a}–${c.b}: one 7.4 step of ${d.shiftDays} days`);
    for (const [x, beta] of [[d.drkA, c.latitudeA], [d.drkB, c.latitudeB]]) assert.ok(Math.abs(Math.abs(x.aksaArcmin) - Math.abs(beta) * pb / 12 * x.nataAsus / x.halfDayAsus) < 1e-9);
  }
});

test('[FRAME] ss-graha.js requires only sovereign files, names no modern source, and uses no spherical trigonometry', () => {
  const FORBIDDEN = /\b(?:DE4\d\d|VSOP\d*|ELP\d*|Swiss|swisseph|Gaia|IERS|DrikTier)\b|finals\.all|DeltaT|astronomy-engine/;
  const src = fs.readFileSync(path.join(__dirname, 'ss-graha.js'), 'utf8');
  assert.equal(FORBIDDEN.test(src), false);
  const reqs = [...src.matchAll(/\brequire\s*\(\s*["']([^"']+)["']\s*\)/g)].map((m) => m[1]);
  assert.deepEqual(reqs, ['./sphuta.js', './ss-udaya.js']);
  assert.equal(/\bimport\s/.test(src), false);
  assert.equal(/Math\.(?:sin|cos|tan|asin|acos|atan2?|hypot|PI)\b/.test(src), false, 'only the table, and 2.41\'s square root');
});

test('the owner\'s choice (2026-10-07): stations by the place\'s own turning points by default; the 2.50-2.51 rule by name', () => {
  const t1 = 1872855, t2 = t1 + 800;
  const d = G.stations('mars', t1, t2), p = G.stations('mars', t1, t2, { by: 'place' }), r = G.stations('mars', t1, t2, { by: 'text' });
  assert.deepEqual(d.map((x) => x.t), p.map((x) => x.t));
  assert.ok(r.length === p.length && r.every((x, i) => Math.abs(x.t - p[i].t) > 0.5), 'the rule turns on other days');
  for (const s of p.filter((x) => x.kind === 'vakra')) assert.equal(G.houseFromSighrocca(s.kendra), 7, '2.55: Mars turns retrograde in the seventh');
});
