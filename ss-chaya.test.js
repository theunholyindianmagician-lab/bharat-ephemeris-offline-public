'use strict';
/*
 * ss-chaya.test.js — the Sūrya-Siddhānta's shadow chain (ss-chaya.js, SS 3.1-3.41) and the vedha record. Checked against
 * the text's own words and numbers (the register, the edition), against its own identities, by round trips, and against
 * the sphere — the sphere only to measure how far the text's arithmetic is from it ([measured]); the module computes
 * nothing with it. Every vedha record here is SYNTHETIC: made by the module's own forward model, labelled so, and reduced
 * back. No observation is invented.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
// This suite checks the text as written: its 24-entry sine table (withSine('table')). The engine's default sine is
// Mādhava's (owner, 2026-10-07); ss-madhava.test.js measures what that changes.
const C = require('./ss-chaya.js').withSine('table');
const U = require('./ss-udaya.js').withSine('table');
const S = require('./sphuta.js').withSine('table');
const K = require('./kala-dvara.js');
const KP = require('./katapayadi.js');
const reg = JSON.parse(fs.readFileSync(path.join(__dirname, 'corpus', 'surya-siddhanta', 'numbers.json'), 'utf8'));
const D2R = Math.PI / 180, R2D = 180 / Math.PI;
const EPS = Math.asin(1397 / 3438);                                          // the text's greatest declination, for the sphere
const R = 3438;
const mod = (a, m) => ((a % m) + m) % m;
const w180 = (a) => mod(a + 180, 360) - 180;
const UJJAIN = 23.18;
const P_UJJ = C.palabhaOfLatitude(UJJAIN).palabha;
const ayanaOf = (lam) => (mod(lam, 360) < 90 || mod(lam, 360) >= 270 ? 'uttara' : 'dakshina');
const sphere = (lat, lam) => {                                                // φ from the same palabhā, δ from 1397
  const phi = Math.atan(C.palabhaOfLatitude(lat).palabha / 12), d = Math.asin(Math.sin(EPS) * Math.sin(lam * D2R));
  return { phi, d, sinAlt: (H) => Math.sin(phi) * Math.sin(d) + Math.cos(phi) * Math.cos(d) * Math.cos(H / 60 * D2R) };
};

test('3.8: 12 and 5 give 13 and back [text]; Parameśvara\'s duṣkarā = 2 aṅgula 18 vyaṅgula gives 10°51′ by 3.12-3.14 [text, theorem]', () => {
  assert.equal(C.karna(5), 13);
  assert.equal(C.chayaOfKarna(13), 5);
  assert.equal(C.shankuOfKarna(13, 5), 12);
  const v = Number(KP.decodeWord('duṣkarā').value);                          // kaṭapayādi, digits read from the right
  assert.equal(v, 218);
  const palabha = C.angulaOf({ angula: Math.floor(v / 100), vyangula: v % 100 }, 'duṣkarā');
  const a = C.akshaOfPalabha(palabha);
  assert.equal(Math.round(a.akshaArcmin), 10 * 60 + 51, `${a.akshaArcmin.toFixed(2)}′`);
  assert.ok(Math.abs(a.aksakarna - Math.sqrt(144 + palabha * palabha)) < 1e-12 && Math.abs(a.aksajya * a.aksakarna - R * palabha) < 1e-9);
});

test('3.12-3.17: palabhā ↔ latitude by the table round-trips; the two arcs of 3.14 do not add to 90° on the table [measured]', () => {
  let rt = 0, sum = 0, at = 0, vsUdaya = 0;
  for (let lat = 6; lat <= 36; lat += 0.05) {
    const p = C.palabhaOfLatitude(lat), a = C.akshaOfPalabha(p.palabha);
    rt = Math.max(rt, Math.abs(a.akshaArcmin - lat * 60));
    assert.ok(Math.abs(a.lambajya - p.lambajya) < 1e-9 && Math.abs(a.aksakarna - p.aksakarna) < 1e-9, '3.13 and 3.16b-3.17a are inverse');
    const e = Math.abs(a.akshaArcmin + a.lambaArcmin - 5400);
    if (e > sum) { sum = e; at = lat; }
    vsUdaya = Math.max(vsUdaya, Math.abs(p.palabha - U.palabhaOf(lat)));
  }
  assert.ok(rt < 1e-9, `latitude → palabhā → latitude ${rt}`);
  // the arc of a sine near R lies in the table's last step (3431 → 3438 over 225′), so arc(lambajyā) is poor at low latitudes
  assert.ok(sum > 13 && sum < 14.5 && at < 6.1, `akṣa + lamba − 90° up to ${sum.toFixed(2)}′ at ${at.toFixed(2)}°`);
  // 3.16b-3.17a (lambajyā = √(R² − akṣajyā²)) against ss-udaya's palabhaOf (koṭijyā from the table)
  assert.ok(vsUdaya < 0.011, `${vsUdaya.toFixed(4)} aṅgula`);
  assert.throws(() => C.akshaOfPalabha(-1), RangeError);
});

test('2.23-2.27: the versed sines of 3.35-3.39 are the verse numbers; small arcs are linear on the table [text, measured]', () => {
  const vers = [];
  for (const v of ['2.23', '2.24', '2.25', '2.26', '2.27']) vers.push(...reg.verses.find((x) => x.v === v).items.map((x) => x.n));
  assert.equal(vers.length, 24);
  for (let k = 1; k <= 24; k++) {
    assert.ok(Math.abs(C.utkramajya(225 * k) - vers[k - 1]) < 1e-9, `versed sine ${k} = ${vers[k - 1]}`);
    assert.ok(Math.abs(C.arcOfUtkramajya(vers[k - 1]) - 225 * k) < 1e-9);
  }
  for (let m = 0; m <= 10800; m += 37) assert.ok(Math.abs(C.arcOfUtkramajya(C.utkramajya(m)) - m) < 1e-9);
  assert.equal(C.utkramajya(10800), 2 * R);
  // under 3°45′ the text's versed sine is 7 × arc ÷ 225: one ghaṭī of nata (6°… here 60′) is 1.87 where the sphere has 0.52
  assert.ok(Math.abs(C.utkramajya(60) - 7 * 60 / 225) < 1e-12 && Math.abs(R * (1 - Math.cos(1 * D2R)) - 0.524) < 0.001);
});

test('3.15-3.20: the text\'s "sum when unlike, difference when alike" is signed arithmetic, in its three uses at Ujjayinī [text]', () => {
  const cases = [[85, 'summer: Sun north of the zenith'], [20, 'spring'], [250, 'winter']];
  for (const [lam, what] of cases) {
    const n = C.noonShadow(lam, P_UJJ), z = Math.abs(n.nataArcmin), d = Math.abs(n.krantiArcmin), phi = C.akshaOfPalabha(P_UJJ).akshaArcmin;
    const nataName = n.nataArcmin > 0 ? 'N' : 'S', krantiName = n.krantiArcmin > 0 ? 'N' : 'S', akshaName = 'S';      // 3.14: always south
    // 3.20b-3.21a: latitude and declination, the sum when alike, the difference otherwise → the nata
    assert.ok(Math.abs((akshaName === krantiName ? phi + d : Math.abs(phi - d)) - z) < 1e-9, `${what}: 3.20b`);
    // 3.15b-3.16a: nata and declination, added when unlike, differenced when alike → the latitude
    const L = C.latitudeFromNoon(n.chaya, n.dir, n.krantiArcmin, { karna: n.karna });
    assert.ok(Math.abs((nataName !== krantiName ? z + d : Math.abs(z - d)) - L.latitudeArcmin) < 1e-9, `${what}: 3.16a`);
    assert.ok(Math.abs(L.latitudeArcmin - phi) < 1e-9);
    // 3.17b-3.18a: latitude and nata, the difference when alike, the sum when unlike → the declination
    const k = C.krantiFromNoon(n.chaya, n.dir, P_UJJ, { karna: n.karna });
    assert.ok(Math.abs((akshaName === nataName ? Math.abs(phi - z) : phi + z) - Math.abs(k.krantiArcmin)) < 1e-9, `${what}: 3.17b`);
    // 3.15a: the nata is named opposite to the shadow
    assert.equal(nataName === 'N', n.dir === 'S');
  }
  assert.equal(C.noonShadow(85, P_UJJ).dir, 'S', 'at Ujjayinī the summer noon shadow falls south (φ 23°11′ < 23°59′)');
});

test('3.14b-3.19: noon shadow → declination → the Sun; round trip and the sphere [measured]; the quadrant is not in the shadow', () => {
  const report = [];
  for (const lat of [10.85, UJJAIN, 28.6]) {
    const p = C.palabhaOfLatitude(lat).palabha, sp = (lam) => sphere(lat, lam);
    let rtD = 0, rtL = 0, exact = 0, spD = 0, spL = 0;
    for (let lam = 0; lam < 360; lam += 0.25) {
      const n = C.noonShadow(lam, p), ay = ayanaOf(lam);
      const r = C.chayarka(n.chaya, n.dir, p, { ayana: ay });                       // the hypotenuse by 3.8, as an observer has it
      const rk = C.chayarka(n.chaya, n.dir, p, { ayana: ay, karna: n.karna });     // the hypotenuse of 3.21-3.22a
      const nearEq = Math.abs(w180(lam)) <= 30 || Math.abs(w180(lam - 180)) <= 30;
      rtD = Math.max(rtD, Math.abs(r.krantiArcmin - n.krantiArcmin));
      if (nearEq) rtL = Math.max(rtL, Math.abs(w180(r.lambda - lam)) * 60);
      exact = Math.max(exact, Math.abs(w180(rk.lambda - lam)));
      const { phi, d } = sp(lam), z = phi - d, s = C.chayarka(12 * Math.tan(Math.abs(z)), z > 0 ? 'N' : 'S', p, { ayana: ay });
      spD = Math.max(spD, Math.abs(s.krantiArcmin - d * R2D * 60));
      if (nearEq) spL = Math.max(spL, Math.abs(w180(s.lambda - lam)) * 60);
      assert.ok(Math.abs(mod(r.candidates[0] + r.candidates[1], 360) - 180) < 1e-9, 'the two candidates are λ and 180° − λ');
    }
    report.push(`φ ${lat}: round trip δ ${rtD.toFixed(2)}′, λ ${rtL.toFixed(2)}′; sphere δ ${spD.toFixed(2)}′, λ ${spL.toFixed(2)}′`);
    assert.ok(exact < 1e-8, 'with the forward hypotenuse the chain inverts exactly');
    assert.ok(rtD < 1.9 && spD < 2.0, report.at(-1));                              // √(144 + s²) is not 12R ÷ koṭijyā on the table
    assert.ok(rtL < 3.5 && spL < 5.3, report.at(-1));                               // within 30° of an equinox
  }
  // 3.19: λ and 180° − λ cast the same noon shadow; the ayana (or a nearby Sun) chooses
  const a = C.noonShadow(40, P_UJJ), b = C.noonShadow(140, P_UJJ);
  assert.ok(Math.abs(a.chaya - b.chaya) < 1e-9);
  const both = C.chayarka(a.chaya, a.dir, P_UJJ, { quadrant: 0 }).candidates;
  assert.ok(Math.abs(both[0] - 40) < 0.1 && Math.abs(both[1] - 140) < 0.1);
  assert.ok(Math.abs(C.chayarka(a.chaya, a.dir, P_UJJ, { ayana: 'dakshina' }).lambda - 140) < 0.1);
  assert.ok(Math.abs(C.chayarka(a.chaya, a.dir, P_UJJ, { near: 130 }).lambda - 140) < 0.1);
  assert.throws(() => C.chayarka(a.chaya, a.dir, P_UJJ), RangeError);
  const winter = C.noonShadow(300, P_UJJ);
  assert.equal(C.chayarka(winter.chaya, winter.dir, P_UJJ, { ayana: 'uttara' }).quadrant, 3, 'south and going north: Makara…Mīna');
});

test('the shadow\'s resolution at Ujjayinī [measured]: 1/8 aṅgula is 30′ of declination and 75′ of the Sun at the equinox; the solstice hides', () => {
  const at = (lam, ds) => { const n = C.noonShadow(lam, P_UJJ), q = C.chayarka(n.chaya, n.dir, P_UJJ, { ayana: ayanaOf(lam) });
    const e = C.chayarka(n.chaya + ds, n.dir, P_UJJ, { quadrant: q.quadrant }); return [Math.abs(e.krantiArcmin - q.krantiArcmin), Math.abs(w180(e.lambda - q.lambda)) * 60]; };
  const [d8, l8] = at(0, 1 / 8), [d1, l1] = at(0, 1 / 60);
  assert.ok(Math.abs(d8 - 30.4) < 0.5 && Math.abs(l8 - 74.7) < 1, `1/8 aṅgula: δ ${d8.toFixed(1)}′, λ ${l8.toFixed(1)}′`);
  assert.ok(Math.abs(d1 - 4.07) < 0.1 && Math.abs(l1 - 10.0) < 0.3, `1 vyaṅgula: δ ${d1.toFixed(2)}′, λ ${l1.toFixed(1)}′`);
  const s0 = C.noonShadow(90, P_UJJ).chaya, day = 57.2 / 60;                     // the Sun's motion near the summer solstice
  const after = (n) => Math.abs(C.noonShadow(90 + n * day, P_UJJ).chaya - s0);
  assert.ok(after(1) < 0.004 && after(7) < 0.04 && after(15) > 0.125, `${after(1).toFixed(4)}, ${after(7).toFixed(3)}, ${after(15).toFixed(3)} aṅgula`);
  assert.ok(Math.abs(C.noonShadow(0.985, P_UJJ).chaya - C.noonShadow(0, P_UJJ).chaya) > 0.09, 'at the equinox the noon shadow moves 0.1 aṅgula a day');
});

test('3.20a: the mean Sun by the reversed manda, again and again — exact inverse of 2.29-2.45; the edition\'s example [text, theorem]', () => {
  let err = 0, steps = 0, steps1 = 0;
  for (let T = 0; T < 360; T += 0.5) for (const apo of [77.2, 0, 200]) {
    const r = C.meanFromTrue(T, apo);
    err = Math.max(err, Math.abs(w180(r.mean + S.mandaPhala(r.mean, apo, S.PARIDHI.sun).degrees - T)));
    steps = Math.max(steps, r.steps);
    steps1 = Math.max(steps1, C.meanFromTrue(T, apo, { tol: 1 / 3600 }).steps);
  }
  assert.ok(err < 1e-9 && steps <= 9 && steps1 <= 4, `${err}, ${steps} steps (${steps1} to 1″)`);
  // 3.20's worked example: true 40°, mandocca 78° → kendra 38° (2.29: mandocca − planet), additive (2.45) → mean 38.607°
  const ex = C.meanFromTrue(40, 78);
  assert.ok(Math.abs(ex.mean - 38.607) < 0.001 && ex.phala > 0, `${ex.mean.toFixed(4)}° by the table`);
  // the epicycle is 14° at the even ends and 13°40′ at the odd (2.34-2.38)
  assert.deepEqual(S.PARIDHI.sun, [14, 13 + 40 / 60]);
  // and the mean Sun of sphuta.js comes back from its true Sun
  const t = K.kaliDayFromCivil({ calendar: 'gregorian', year: 2026, month: 10, day: 7 }) + 0.5, p = S.sphutaAtDays(t);
  assert.ok(Math.abs(w180(C.meanFromTrue(p.sun, p.mean.sunApogee).mean - p.mean.sun)) < 1e-9);
});

test('3.11-3.12a: chāyārka − karaṇāgata is the circle\'s motion — east when the computed Sun is less [text]', () => {
  assert.deepEqual(C.ayanamshaFromShadow(30.5, 30), { ayanamsha: 0.5, moved: 'east' });
  assert.deepEqual(C.ayanamshaFromShadow(29.75, 30), { ayanamsha: -0.25, moved: 'west' });
  assert.ok(Math.abs(C.ayanamshaFromShadow(1, 359).ayanamsha - 2) < 1e-12, 'across Meṣa 0');
  // a sky whose ayanāṃśa is the text's + 0.4°: the shadow-Sun minus the text's Sun recovers it, near the equinoxes to 2.5′
  for (const [y, m, d] of [[2026, 3, 14], [2026, 3, 27], [2026, 9, 18], [2026, 9, 30]]) {
    const t = K.kaliDayFromCivil({ calendar: 'gregorian', year: y, month: m, day: d }) + 0.5, s = C.textSun(t);
    const lam = mod(s.sayana + 0.4, 360), n = C.noonShadow(lam, P_UJJ);
    const obs = C.ayanamshaFromShadow(C.chayarka(n.chaya, n.dir, P_UJJ, { ayana: ayanaOf(lam) }).lambda, s.karanagata);
    assert.ok(Math.abs(obs.ayanamsha - s.ayanamsha - 0.4) * 60 < 2.5, `${y}-${m}-${d}: ${((obs.ayanamsha - s.ayanamsha - 0.4) * 60).toFixed(2)}′`);
    assert.equal(obs.moved, 'east');
  }
});

test('3.21-3.28: the agrā two ways each; at noon the bhuja is the shadow; on the equinox the tip runs on the line of 3.7 [theorem, measured]', () => {
  let noonBh = 0;
  for (let lam = 0; lam < 360; lam += 1) {
    const g = C.agra(lam, P_UJJ), n = C.noonShadow(lam, P_UJJ);
    assert.ok(Math.abs(g.agrajya - g.agrajyaB) < 1e-9, '3.27b = 3.22b with the śaṅku as 12');
    assert.ok(Math.abs(g.angula - g.angulaViaNoon) < 1e-9, '3.28a = 3.22b-3.23a with the noon śaṅku-sine and the noon hypotenuse');
    noonBh = Math.max(noonBh, Math.abs(Math.abs(g.bhuja) - n.chaya));
    for (const H of [-4000, -1500, 900, 3000]) {
      const tip = C.shadowTip(lam, P_UJJ, H);
      if (tip) assert.ok(Math.abs(Math.hypot(tip.east, tip.north) - tip.chaya) < 1e-9 && (H < 0) === (tip.east < 0));
    }
  }
  assert.ok(noonBh < 0.02, `3.25a: |noon bhuja| − noon shadow ≤ ${noonBh.toFixed(4)} aṅgula (the table)`);
  for (const H of [-5000, -2000, -300, 700, 4000]) assert.ok(Math.abs(C.shadowTip(0, P_UJJ, H).north - P_UJJ) < 1e-12, 'δ = 0: the bhuja is the palabhā all day');
});

test('3.25b-3.27a: the prime-vertical hypotenuse three ways; the sphere within 0.1% [theorem, measured]', () => {
  let n = 0, rel = 0;
  for (let lam = 0; lam < 360; lam += 1) {
    const pv = C.samamandala(lam, P_UJJ), { phi, d } = sphere(UJJAIN, lam);
    if (!(d > 0 && d < phi)) { assert.equal(pv, null, `λ ${lam}: no crossing above the horizon`); continue; }
    if (!pv) continue;                                                              // the table's declination at the very edge
    n++;
    assert.ok(Math.abs(pv.byLamba - pv.byAksha) < 1e-9 && Math.abs(pv.byLamba - pv.byNoon) < 1e-9);
    rel = Math.max(rel, Math.abs(pv.karna - 12 * Math.sin(phi) / Math.sin(d)) / (12 * Math.sin(phi) / Math.sin(d)));
  }
  assert.ok(n > 140 && rel < 0.001, `${n} days, ${rel.toExponential(2)}`);
});

test('3.28b-3.34a: the corner gnomon puts the text\'s own tip at exactly 45°; the sphere within 1.2′; the edition\'s arithmetic [theorem, measured]', () => {
  let alt = 0, az = 0, north = 0, south = 0;
  for (const lat of [10.85, UJJAIN, 28.6]) {
    const p = C.palabhaOfLatitude(lat).palabha;
    for (let lam = 0; lam < 360; lam += 1) {
      const k = C.konaShanku(lam, p);
      if (!k) continue;
      k.corners === 'north' ? north++ : south++;
      const bh = C.agra(lam, p, k.karna).bhuja, ew = Math.sqrt(Math.max(0, k.chaya * k.chaya - bh * bh));
      az = Math.max(az, Math.abs(Math.abs(bh) - ew));
      assert.equal(k.corners, bh < 0 ? 'north' : 'south', 'the shadow points away from the Sun');
      const { phi, d } = sphere(lat, lam), a = Math.sin(d) / Math.cos(phi), t = Math.tan(phi);
      const A = 1 + 2 * t * t, B = -4 * a * t, Cc = 2 * a * a - 1, q = Math.sqrt(B * B - 4 * A * Cc);
      const us = [(-B + q) / (2 * A), (-B - q) / (2 * A)].filter((u) => u > 0);
      const u = us.reduce((x, y) => (Math.abs(y * R - k.shanku) < Math.abs(x * R - k.shanku) ? y : x));
      alt = Math.max(alt, Math.abs(Math.asin(Math.min(1, k.shanku / R)) - Math.asin(u)) * R2D * 60);
    }
  }
  assert.ok(az < 1e-9 && alt < 1.2 && north > 0 && south > 0, `|bhuja| − |koṭi| ${az}; altitude ${alt.toFixed(2)}′; ${north} north, ${south} south`);
  // the edition's 3.28-3.29 and 3.33 examples, recomputed
  assert.equal(R * R / 2, 5909922);
  assert.equal(R * R / 2 - 1037 * 1037, 4834553);
  assert.equal((R * R / 2 - 1037 * 1037) * 12, 58014636);
  assert.equal((R * R / 2 - 1037 * 1037) * 144, 696175632);
  assert.equal(R * R - 1719 * 1719, 8864883);
  assert.ok(Math.abs(Math.sqrt(8864883) - 2977.4) < 0.05);
});

test('3.34b-3.36 against the sphere [measured]: the śaṅku within 3.4 of R sin h; near the zenith √(R² − śaṅku²) magnifies it', () => {
  const band = {};
  let shanku = 0, noonPair = 0;
  for (const lat of [0, 10.85, UJJAIN, 28.6]) {
    const p = C.palabhaOfLatitude(lat).palabha;
    for (let lam = 0; lam < 360; lam += 3) {
      const sp = sphere(lat, lam);
      noonPair = Math.max(noonPair, Math.abs(C.noonShadow(lam, p).chaya - C.shadowAt(lam, p, 0).chaya));
      for (let H = -10800; H <= 10800; H += 60) {
        const sh = sp.sinAlt(H), s = C.shadowAt(lam, p, H);
        if (sh <= Math.sin(5 * D2R) || !s.above) continue;
        shanku = Math.max(shanku, Math.abs(s.shanku - R * sh));
        const h = Math.asin(sh) * R2D, key = h < 60 ? '<60' : h < 75 ? '60-75' : '>75';
        band[key] = Math.max(band[key] || 0, Math.abs(Math.atan(s.chaya / 12) * R2D - (90 - h)) * 60);
      }
    }
  }
  assert.ok(shanku < 3.4, `śaṅku ${shanku.toFixed(2)}`);
  assert.ok(band['<60'] < 6.2 && band['60-75'] < 12 && band['>75'] > 30 && band['>75'] < 82, JSON.stringify(band));
  assert.ok(noonPair > 0.15 && noonPair < 0.26, `noon by 3.35-3.36 against noon by 3.20b-3.22a: ${noonPair.toFixed(3)} aṅgula`);
  // 3.35's worked example (corrected 2026-10-07): φ 30°, δ 20°, H 30° → śaṅku 0.8758 R. By the table, with 3.34's antyā:
  const p30 = C.palabhaOfLatitude(30).palabha;
  const lam20 = C.sunFromKrantijya(S.jya(20), { quadrant: 0 }).lambda;
  const s = C.shadowAt(lam20, p30, 1800);
  assert.ok(Math.abs(s.shanku / R - 0.8758) < 0.0012, `${(s.shanku / R).toFixed(4)}`);
  assert.ok(Math.abs(s.antya - R - s.carajya) < 1e-9);
  // the old reading antyā = √(R² − krāntijyā²) gives another śaṅku entirely
  const old = (Math.sqrt(R * R - s.krantijya * s.krantijya) - s.utkramajya) * s.dyujya / R * s.lambajya / R;
  assert.ok(Math.abs(old - s.shanku) > 150, `${old.toFixed(0)} against ${s.shanku.toFixed(0)}`);
});

test('3.37-3.39: the time from a shadow — the exact inverse of 3.34-3.36; against the sphere, sharpest far from noon [measured]', () => {
  let rt = 0;
  const band = {};
  for (const lat of [10.85, UJJAIN, 28.6]) {
    const p = C.palabhaOfLatitude(lat).palabha;
    for (let lam = 0; lam < 360; lam += 2) {
      const sp = sphere(lat, lam);
      for (let H = 60; H <= 10800; H += 30) {
        const sh = sp.sinAlt(H);
        if (sh <= Math.sin(5 * D2R)) continue;
        const s = C.shadowAt(lam, p, H);
        if (s.above && H >= 180) rt = Math.max(rt, Math.abs(C.nataFromShadow(s.chaya, lam, p).natAsus - H));
        const g = H / 360, key = g < 1 ? '0-1' : g < 2 ? '1-2' : g < 4 ? '2-4' : g < 8 ? '4-8' : '8-15';
        const inv = C.nataFromShadow(12 * Math.sqrt(1 - sh * sh) / sh, lam, p);
        band[key] = Math.max(band[key] || 0, Math.abs(inv.natAsus - H));
      }
    }
  }
  assert.ok(rt < 1e-6, `round trip ${rt}`);
  assert.ok(band['8-15'] < 3.1 && band['4-8'] < 6.8 && band['2-4'] < 15.6 && band['1-2'] < 33.2 && band['0-1'] > 100, JSON.stringify(band));
  // the half-day frames it: at sunrise-side shadows the asus since sunrise are the half-day less the nata
  const lam = 30, s = C.shadowAt(lam, P_UJJ, -2000), f = C.sinceSunriseFromShadow(s.chaya, lam, P_UJJ, 'purva');
  assert.ok(Math.abs(f.sinceSunrise - (U.halfDay(lam, P_UJJ) - 2000)) < 1e-6);
  assert.ok(C.nataFromShadow(0.01, 30, P_UJJ).shorterThanNoon > 0, 'a shadow shorter than the noon one is flagged, not timed');
});

test('3.40-3.41a: the Sun from any shadow\'s agrā inverts exactly; 2.59 turns a count of the turn into the Sun\'s asus [theorem]', () => {
  for (const lam of [10, 75, 130, 200, 260, 330]) for (const H of [-3500, -1200, 800, 2600]) {
    const tip = C.shadowTip(lam, P_UJJ, H);
    if (!tip) continue;
    const sun = C.sunFromAgra(P_UJJ - tip.north, tip.chaya, P_UJJ, { ayana: ayanaOf(lam) });
    assert.ok(Math.abs(w180(sun.lambda - lam)) < 1e-6, `λ ${lam}, H ${H}: ${sun.lambda}`);
  }
  // 2.59 over a year: the Sun's own day, in asus of the turn, averages what the yuga's counts give (1.34-1.37)
  const m = K.mana('surya'), yugaDay = 21600 * Number(m.nakshatra) / Number(m.savana);
  const t0 = K.kaliDayFromCivil({ calendar: 'gregorian', year: 2026, month: 1, day: 1 });
  let sum = 0, n = 0;
  for (let t = t0; t < t0 + 365; t += 1) { const s = C.textSun(t); sum += C.svahoratraAsus(s.sayana, s.gati); n++; }
  assert.ok(Math.abs(sum / n - yugaDay) < 0.05, `2.59 averages ${(sum / n).toFixed(2)} asus; the yuga ${yugaDay.toFixed(2)}`);
  assert.ok(Math.abs(C.turnToSunAsus(21600, 0, 59.136) - 21600 * 21600 / (21600 + 59.136 * 1670 / 1800)) < 1e-9);
});

test('3.1-3.3 and 3.41b-3.42a: the east-west line turns up to 5′ near an equinox; the three-tip circle is not the path [measured]', () => {
  const sk = (lam, r) => C.pracyaparaSkew(lam, P_UJJ, r, 59.14);
  assert.ok(Math.abs(sk(0, 24).turnArcmin + 5.06) < 0.05 && Math.abs(sk(180, 24).turnArcmin - 5.06) < 0.05, `${sk(0, 24).turnArcmin.toFixed(2)}′`);
  assert.ok(Math.abs(sk(90, 12).turnArcmin) < 1e-9 && Math.abs(sk(270, 24).turnArcmin) < 1e-9, 'true at the solstices');
  assert.equal(sk(270, 12), null, 'Ujjayinī\'s winter noon shadow (12.95) never shrinks to a 12-aṅgula circle');
  const lam = 30, a = C.shadowTip(lam, P_UJJ, -2400), b = C.shadowTip(lam, P_UJJ, 0), c = C.shadowTip(lam, P_UJJ, 2400);
  const circ = C.bhabhrama(a, b, c);
  for (const q of [a, b, c]) assert.ok(Math.abs(Math.hypot(q.east - circ.east, q.north - circ.north) - circ.radius) < 1e-9);
  let dev = 0;
  for (let H = -3600; H <= 3600; H += 60) { const q = C.shadowTip(lam, P_UJJ, H); dev = Math.max(dev, Math.abs(Math.hypot(q.east - circ.east, q.north - circ.north) - circ.radius)); }
  assert.ok(dev > 0.5 && dev < 0.6, `${dev.toFixed(3)} aṅgula within 10 ghaṭī of noon`);
  assert.equal(C.bhabhrama(C.shadowTip(0, P_UJJ, -2400), C.shadowTip(0, P_UJJ, 0), C.shadowTip(0, P_UJJ, 2400)), null, 'on the equinox the three tips are on one line (3.7)');
});

// ── the vedha record: synthetic records from the module's own forward model ──────────────────────────
const GEN = 'ss-chaya.test.js: the text Sun + its ayanāṃśa + SHIFT, through noonShadow / shadowAt (synthetic, not an observation)';
const SHIFT = 0.4;
const dayOf = (y, m, d) => K.kaliDayFromCivil({ calendar: 'gregorian', year: y, month: m, day: d });
const toKapala = (asus) => { const g = Math.floor(asus / 360), v = Math.floor((asus - g * 360) / 6); return { ghati: g, vinadi: v, prana: asus - g * 360 - v * 6 }; };
function syntheticFile({ round } = {}) {
  const q = (x) => (round ? Math.round(x * 60) / 60 : x);                          // to the vyaṅgula, if asked
  const records = [];
  for (const [y, m, d] of [[2026, 2, 20], [2026, 3, 10], [2026, 3, 20], [2026, 4, 5], [2026, 9, 15], [2026, 9, 25], [2026, 10, 7], [2026, 11, 1]]) {
    const N = dayOf(y, m, d), s = C.textSun(N + 0.5), lam = mod(s.sayana + SHIFT, 360), n = C.noonShadow(lam, P_UJJ);
    records.push({ id: `noon-${y}-${m}-${d}`, kind: 'madhyahna', day: { kali: N }, chaya: q(n.chaya), dir: n.dir, ayana: ayanaOf(lam), synthetic: true, generator: GEN });
  }
  const bowlTurn = 21600 + 22;                                                      // a bowl that counts 60 ghaṭī 3 vināḍī 4 prāṇa a turn
  records.push({ id: 'bowl', kind: 'kapala', star: 'Citrā', count: toKapala(bowlTurn), synthetic: true, generator: GEN });
  for (const [y, m, d, read, side] of [[2026, 3, 21, 3 * 360 + 20 * 6, 'purva'], [2026, 6, 1, 22 * 360, 'pashcima'], [2026, 12, 1, 5 * 360, 'purva']]) {
    const N = dayOf(y, m, d), t0 = N + 0.5;
    let s = C.textSun(t0), lam = mod(s.sayana + SHIFT, 360);
    let H = C.turnToSunAsus(read, lam, s.gati) - U.halfDay(lam, P_UJJ);
    s = C.textSun(t0 + H / 21600); lam = mod(s.sayana + SHIFT, 360);
    H = C.turnToSunAsus(read, lam, s.gati) - U.halfDay(lam, P_UJJ);
    const tip = C.shadowTip(lam, P_UJJ, H);
    records.push({ id: `ishta-${y}-${m}-${d}`, kind: 'ishta', day: { calendar: 'gregorian', year: y, month: m, day: d }, chaya: q(tip.chaya),
      kapala: toKapala(read * bowlTurn / 21600), side, bhuja: { value: q(Math.abs(tip.north)), dir: tip.north >= 0 ? 'N' : 'S' }, synthetic: true, generator: GEN });
  }
  return { format: C.FORMAT, site: { name: 'Ujjayinī (synthetic)', deshantara: 0, latitude: UJJAIN }, records };
}

test('vedha: synthetic noon, kapāla and timed shadows reduce back to their latitude, ayanāṃśa and clock [measured, synthetic]', () => {
  const file = syntheticFile(), out = C.reduce(file);
  assert.equal(out.synthetic, true);
  for (const r of out.records) assert.ok(r.tag === '[measured]' && r.synthetic === true, r.id);
  assert.ok(Math.abs(out.site.latitude - UJJAIN) < 1e-9 && out.site.palabhaFrom.startsWith('site.latitude'));
  assert.ok(Math.abs(out.kapala.driftGhati - 22 / 360) < 1e-12 && Math.abs(out.kapala.rate * (21600 + 22) - 21600) < 1e-9);
  const noon = out.records.filter((r) => r.kind === 'madhyahna');
  for (const r of noon) {
    assert.ok(Math.abs(r.ayanamsha - r.textAyanamsha - SHIFT) * 60 < 2.2, `${r.id}: ${((r.ayanamsha - r.textAyanamsha - SHIFT) * 60).toFixed(2)}′`);
    assert.ok(Math.abs(r.sunResidualArcmin - SHIFT * 60) < 2.2 && r.moved === 'east' && r.quadrantFrom.startsWith('the record'));
    assert.ok(Math.abs(r.latitudeWithTextKranti - UJJAIN) > 0.01, 'with the text\'s declination the noon shadow misplaces the site — the shift shows');
  }
  assert.ok(Math.abs(out.summary.ayanamsha.mean - noon[0].textAyanamsha - SHIFT) * 60 < 1.5);
  const ishta = out.records.filter((r) => r.kind === 'ishta');
  for (const r of ishta) {
    assert.ok(Math.abs(r.ayanamsha - r.textAyanamsha - SHIFT) * 60 < 0.05, `${r.id}: the agrā's Sun ${((r.ayanamsha - r.textAyanamsha - SHIFT) * 60).toFixed(3)}′`);
    assert.ok(Math.abs(r.timeResidualAsus) < 3, `${r.id}: timed with the text's ayanāṃśa, ${r.timeResidualAsus.toFixed(2)} asus`);
  }
  // with the shadow's own ayanāṃśa the clock and the shadow agree
  const obs = C.reduce(file, { ayanamsha: 'observed' });
  assert.equal(typeof obs.summary.ayanamshaUsedForIshta, 'number');
  for (const r of obs.records.filter((x) => x.kind === 'ishta')) assert.ok(Math.abs(r.timeResidualAsus) < 0.1, `${r.timeResidualAsus}`);
  const exactA = C.reduce(file, { ayanamsha: C.textSun(dayOf(2026, 3, 21) + 0.3).ayanamsha + SHIFT });
  for (const r of exactA.records.filter((x) => x.kind === 'ishta')) assert.ok(Math.abs(r.timeResidualAsus) < 0.1, `${r.timeResidualAsus}`);   // one number for the year: 3.10 moves 54″ a year
  // a gnomon ten times taller (3.1: any gnomon-aṅgulas): its shadows are rescaled to twelve and say the same
  const tall = JSON.parse(JSON.stringify(file));
  tall.shanku = 120;
  for (const r of tall.records) { if (r.chaya !== undefined) r.chaya *= 10; if (r.bhuja) r.bhuja.value *= 10; }
  assert.ok(Math.abs(C.reduce(tall).summary.ayanamsha.mean - out.summary.ayanamsha.mean) < 1e-9);
  // read to the vyaṅgula, as a careful observer would: the ayanāṃśa holds to a few minutes
  const rounded = C.reduce(syntheticFile({ round: true }));
  for (const r of rounded.records.filter((x) => x.kind === 'madhyahna')) assert.ok(Math.abs(r.ayanamsha - r.textAyanamsha - SHIFT) * 60 < 8, `${r.id}`);
});

test('vedha: the equinox and solstice days (3.11), and a place from the equinox shadow alone (3.12b-3.14a) [measured, synthetic]', () => {
  const N = dayOf(2026, 3, 20), s = C.textSun(N + 0.5), lam = mod(s.sayana + SHIFT, 360), n = C.noonShadow(lam, P_UJJ);
  const eqShadow = C.noonShadow(0, P_UJJ).chaya;                                   // the shadow of the equinox itself
  const file = { format: C.FORMAT, site: { deshantara: 0 }, records: [
    { id: 'vishuvat', kind: 'vishuvat', day: { kali: N }, chaya: eqShadow, dir: 'N', which: 'mesha', synthetic: true, generator: GEN },
    { id: 'noon', kind: 'madhyahna', day: { kali: N }, chaya: n.chaya, dir: n.dir, ayana: 'uttara', synthetic: true, generator: GEN },
    { id: 'karka', kind: 'ayananta', day: { kali: dayOf(2026, 6, 21) }, which: 'karka', synthetic: true, generator: GEN },
  ] };
  const out = C.reduce(file);
  assert.ok(out.site.palabha === eqShadow && out.site.palabhaFrom.includes('equinox'));
  // the shadow came from 3.21-3.22a (koṭijyā by the table), the place goes back by 3.13-3.14a: 3′ apart on the table
  assert.ok(Math.abs(out.site.latitude - UJJAIN) * 60 < 3 && Math.abs(out.site.latitudeArcmin - C.akshaOfPalabha(eqShadow).akshaArcmin) < 1e-12, `${out.site.latitude}`);
  const v = out.records.find((r) => r.id === 'vishuvat');
  assert.ok(Math.abs(v.byDay.chayarka) < 1e-12 && Math.abs(v.byDay.ayanamsha - w180(-v.karanagata)) < 1e-12);
  const k = out.records.find((r) => r.id === 'karka');
  assert.ok(k.chayarka === 90 && Math.abs(k.ayanamsha - w180(90 - k.karanagata)) < 1e-12 && /solstice day/.test(k.resolution));
  const noon = out.records.find((r) => r.id === 'noon');
  assert.ok(Math.abs(noon.ayanamsha - noon.textAyanamsha - SHIFT) * 60 < 2.2);
});

test('vedha: the file takes only the owner\'s units — other fields, unknown kinds and unsigned synthetic records are refused', () => {
  const ok = syntheticFile();
  assert.equal(C.validate(ok), true);
  const bad = (mutate) => { const f = JSON.parse(JSON.stringify(ok)); mutate(f); return () => C.validate(f); };
  assert.throws(bad((f) => { f.utc = '2026-03-20T06:30:00Z'; }), /field "utc"/);
  assert.throws(bad((f) => { f.records[0].ra = 1; f.records[0].dec = 2; }), /field "ra"/);
  assert.throws(bad((f) => { f.site.wgs84 = [1, 2]; }), /field "wgs84"/);
  assert.throws(bad((f) => { f.records[0].day = { jd: 2461000 }; }), /field "jd"/);
  assert.throws(bad((f) => { f.records[0].kind = 'transit'; }), /unknown kind/);
  assert.throws(bad((f) => { delete f.records[0].generator; }), /synthetic/);
  assert.throws(bad((f) => { f.records[1].id = f.records[0].id; }), /twice/);
  assert.throws(bad((f) => { f.records[0].dir = 'E'; }), /"N" or "S"/);
  assert.throws(bad((f) => { f.records[0].chaya = { angula: 2, vyangula: 75 }; }), /vyangula/);
  assert.throws(bad((f) => { f.format = 'vedha/0'; }), /format/);
  assert.throws(bad((f) => { f.site.latitude = -12; }), /northern/);
  assert.throws(bad((f) => { f.shanku = 0; }), /gnomon/);
  assert.throws(() => C.reduce({ format: C.FORMAT, site: {}, records: [] }), /no place/);
  // the README documents every kind and field the module takes
  const readme = fs.readFileSync(path.join(__dirname, 'corpus', 'vedha', 'README.md'), 'utf8');
  assert.ok(readme.includes(C.FORMAT));
  for (const [kind, fields] of Object.entries(C.KINDS)) {
    assert.ok(readme.includes('`' + kind + '`'), kind);
    for (const f of fields) assert.ok(readme.includes('`' + f + '`'), `${kind}.${f}`);
  }
});

test('[FRAME] ss-chaya.js is sovereign: it requires only the sovereign files, names no modern source, and has no trigonometry', () => {
  const text = fs.readFileSync(path.join(__dirname, 'ss-chaya.js'), 'utf8');
  const FORBIDDEN = /\b(?:DE4\d\d|VSOP\d*|ELP\d*|Swiss|swisseph|Gaia|IERS|DrikTier)\b|finals\.all|DeltaT|astronomy-engine/;
  assert.equal(FORBIDDEN.test(text), false);
  assert.equal(/\bimport\s/.test(text), false);
  const reqs = [...text.matchAll(/\brequire\s*\(\s*["']([^"']+)["']\s*\)/g)].map((m) => m[1]);
  assert.deepEqual(reqs.sort(), ['./kala-dvara.js', './sphuta.js', './ss-udaya.js']);
  assert.equal(/Math\.(?:sin|cos|tan|asin|acos|atan|atan2)\b/.test(text), false, 'the computation path uses the table');
  const readme = fs.readFileSync(path.join(__dirname, 'corpus', 'vedha', 'README.md'), 'utf8');
  assert.equal(FORBIDDEN.test(readme), false);
});
