'use strict';
/*
 * ss-drishya.test.js — visibility by the Sūrya-Siddhānta (ss-drishya.js): heliacal rising and setting of planets and
 * junction stars (ch.9), the Moon on both horizons and its rising in the dark half (10.1, 10.5), the horns and the bright
 * part (10.6-10.15). Checked against the verse words, against the text's own identities, and against the sphere — the
 * sphere only measures how far the text's arithmetic is from it; the module never uses it.
 * Planets enter through a callback; the one used here is SYNTHETIC (the text's mean motions, 1.29-1.32, with the śīghra
 * epicycle of 2.36-2.37 only), built in this file to exercise the API — it is not ss-graha.js and not the sky.
 * Stars: corpus/surya-siddhanta/yogatara.json. Edition: editions/surya-siddhanta-full-edition.html.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
// This suite checks the text as written: its 24-entry sine table (withSine('table')). The engine's default sine is
// Mādhava's (owner, 2026-10-07); ss-madhava.test.js measures what that changes.
const Dr = require('./ss-drishya.js').withSine('table');
const U = require('./ss-udaya.js').withSine('table');
const P = require('./panchanga.js').withSine('table');
const Ut = require('./utsava.js').withSine('table');
const K = require('./kala-dvara.js');
const D = require('./dhruva.js');
const cat = JSON.parse(fs.readFileSync(path.join(__dirname, 'corpus', 'surya-siddhanta', 'yogatara.json'), 'utf8'));
const edition = fs.readFileSync(path.join(__dirname, 'editions', 'surya-siddhanta-full-edition.html'), 'utf8');
const D2R = Math.PI / 180, R2D = 180 / Math.PI;
const mod = (a, m) => ((a % m) + m) % m;
const w180 = (a) => mod(a + 180, 360) - 180;
const UJJAIN = { latitude: 23.18, deshantara: 0.05 };
const T2026 = K.kaliDayFromCivil({ calendar: 'gregorian', year: 2026, month: 1, day: 1 });
const T2027 = K.kaliDayFromCivil({ calendar: 'gregorian', year: 2027, month: 1, day: 1 });
const ymd = (N) => { const c = K.civilFromKaliDay(N, 'gregorian'); return `${c.year}-${String(c.month).padStart(2, '0')}-${String(c.day).padStart(2, '0')}`; };
const iast = (v) => {
  const m = edition.match(new RegExp(`id="v${v.replace('.', '-').replace(/-(\d)$/, '-0$1')}"[\\s\\S]*?<div class="iast">([\\s\\S]*?)</div>`));
  return m ? m[1].replace(/<br\s*\/?>/g, ' ') : '';
};
const STARS = Dr.starsOf(cat);
const SOLAR = Dr.solarDays(T2026 - 45, T2027 + 60, UJJAIN);           // one table of the text's sunrises and sunsets

// ── the sphere, for measurement only ─────────────────────────────────────────────────────────────
const phiOf = (lat) => lat * D2R;
const H0 = (phi, d) => { const c = -Math.tan(phi) * Math.tan(d * D2R); return c < -1 ? 180 : c > 1 ? 0 : Math.acos(c) * R2D; };
/** The sphere's kālāṃśa: the difference of the turn (degrees = kālāṃśa) between the Sun's and the body's rising (east)
 *  or setting (west), from equatorial places. */
function sphereKalamsa(eq, sunTrop, side, lat) {
  const phi = phiOf(lat), s = D.eclipticToEquatorial(sunTrop, 0);
  return side === 'east' ? w180((s.alpha - H0(phi, s.delta)) - (eq.alpha - H0(phi, eq.delta)))
    : w180((eq.alpha + H0(phi, eq.delta)) - (s.alpha + H0(phi, s.delta)));
}
const vecOf = (phi, H, d) => { H *= D2R; d *= D2R; return [-Math.cos(d) * Math.sin(H), Math.cos(phi) * Math.sin(d) - Math.sin(phi) * Math.cos(d) * Math.cos(H), Math.sin(phi) * Math.sin(d) + Math.cos(phi) * Math.cos(d) * Math.cos(H)]; };
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2], sub = (a, b) => a.map((x, i) => x - b[i]), sc = (a, k) => a.map((x) => x * k), unit = (a) => sc(a, 1 / Math.sqrt(dot(a, a)));
/** The sphere's horn tilt at the instant the Sun is on the horizon: the angle at the Moon between the way to the Sun and
 *  straight down, + when the Sun lies to the north of straight down (the Moon south of the Sun). */
function sphereHorns(t, rise, lat) {
  const phi = phiOf(lat), p = P.placesAt(t), A = P.ayanamshaAt(t);
  const s = D.eclipticToEquatorial(mod(p.sun + A, 360), 0), m = D.eclipticToEquatorial(mod(p.moon + A, 360), p.moonLatitude);
  const Hs = (rise ? -1 : 1) * H0(phi, s.delta), Hm = Hs - w180(m.alpha - s.alpha);
  const sv = vecOf(phi, Hs, s.delta), mv = vecOf(phi, Hm, m.delta);
  const toSun = unit(sub(sv, sc(mv, dot(sv, mv)))), up = unit(sub([0, 0, 1], sc(mv, mv[2]))), north = unit(sub(sub([0, 1, 0], sc(mv, mv[1])), sc(up, dot([0, 1, 0], up))));
  const cpsi = Math.cos(p.moonLatitude * D2R) * Math.cos((p.moon - p.sun) * D2R);
  return { tilt: Math.atan2(dot(toSun, north), -dot(toSun, up)) * R2D, altitude: Math.asin(mv[2]) * R2D, fraction: (1 - cpsi) / 2 };
}

// ── a SYNTHETIC planet for the callback: mean motions of 1.29-1.32, the śīghra epicycle (mean of 2.36-2.37's ends), no
//    manda, no latitude law — enough to exercise 9.2-9.11, not a planet of the sky ─────────────────────────────────────
const YUGA = 1577917828, REV = { sun: 4320000, mars: 2296832, jupiter: 364220, saturn: 146568, venus: 7022376, mercury: 17937060 };
const SHIGHRA = { mars: 233.5, jupiter: 71, saturn: 39.5, venus: 261, mercury: 132.5 };
const meanAt = (rev, t) => 360 * mod(rev * t / YUGA, 1);            // all the text's revolutions are 0 at the Kali epoch (452¾ yugas × 4 | R)
function synthetic(pl, t) {
  const s = meanAt(REV.sun, t) * D2R, r = SHIGHRA[pl] / 360;
  const [a, b] = pl === 'venus' || pl === 'mercury' ? [s, meanAt(REV[pl], t) * D2R] : [meanAt(REV[pl], t) * D2R, s];
  return mod(Math.atan2(Math.sin(a) + r * Math.sin(b), Math.cos(a) + r * Math.cos(b)) * R2D, 360);
}
const syntheticBody = (pl, latArcmin = 60) => (t) => ({ lambda: synthetic(pl, t), latArcmin, bhukti: w180(synthetic(pl, t + 0.5) - synthetic(pl, t - 0.5)) * 60 });

// ════════════════════════════════════════════════════════════════════════════════════════════════
test('[TEXT 9.5-9.16, 10.1, 10.7, 10.9] every number the module uses is a word of its verse in the edition', () => {
  const words = [
    ['9.5', 'ṣaṣṭibhājitāḥ', Dr.SIXTY, 60], ['9.5', 'ṣaḍbhayutayos', 6, 6],
    ['9.6', 'ekādaśāmarejyasya', Dr.PLANET_KALAMSA.jupiter.kalamsa, 11], ['9.6', 'tithisaṅkhyārkajasya', Dr.PLANET_KALAMSA.saturn.kalamsa, 15],
    ['9.6', 'daśa saptādhikās', Dr.PLANET_KALAMSA.mars.kalamsa, 10 + 7],
    ['9.7', 'aṣṭābhir', Dr.PLANET_KALAMSA.venus.vakri, 8], ['9.7', 'daśabhir', Dr.PLANET_KALAMSA.venus.shighra, 10],
    ['9.8', 'dvādaśabhiś', Dr.PLANET_KALAMSA.mercury.vakri, 12], ['9.8', 'caturdaśabhir', Dr.PLANET_KALAMSA.mercury.shighra, 14],
    ['9.11', 'aṣṭādaśaśatoddhṛte', Dr.SIGN_ARC, 18 * 100], ['9.16', 'aṣṭādaśaśatābhyastā', Dr.SIGN_ARC, 18 * 100],
    ['9.12', 'trayodaśabhir', Dr.STAR_GROUPS[0].kalamsa, 13], ['9.13', 'caturdaśāṃśakair', Dr.STAR_GROUPS[1].kalamsa, 14],
    ['9.14', 'pañcadaśabhir', Dr.STAR_GROUPS[2].kalamsa, 15], ['9.15', 'triḥsaptakāṃśakaiḥ', Dr.STAR_GROUPS[3].kalamsa, 3 * 7],
    ['9.15', 'saptadaśabhir', Dr.STAR_GROUPS[4].kalamsa, 17],
    ['10.1', 'dvādaśabhiḥ', Dr.MOON_KALAMSA, 12], ['10.1', 'dvādaśabhiḥ', Dr.PLANET_KALAMSA.moon.kalamsa, 12],
    ['10.7', 'rkaghnākṣajīvāyāṃ', Dr.GNOMON, 12],                     // tadā-arka-ghna: arka = 12 (the twelve suns), the gnomon
    ['10.9', 'navaśatoddhṛtāḥ', Dr.NAVASHATA, 9 * 100], ['10.9', 'dvādaśabhiḥ', 12, 12],
    ['10.5', 'bhagaṇārdhaṃ', 180, 360 / 2], ['10.15', 'ṣaḍbhayutaṃ', 6 * 30, 180],
  ];
  for (const [v, w, used, decoded] of words) {
    assert.ok(iast(v).includes(w), `${v}: the edition's IAST has "${w}"`);
    assert.equal(used, decoded, `${v} ${w}`);
  }
  // nava-śata and aṣṭādaśa-śata are the same construction; the check that fixes them: a full Moon is all twelve twelfths
  // (10,800′ ÷ 900 = 12), and a sign of 1800′ rising in its own asus turns asus into arc (9.11, 9.16).
  assert.equal(10800 / Dr.NAVASHATA, 12);
  assert.equal(Dr.SIGN_ARC, 30 * 60);
});

test('[TEXT 9.12-9.15] the 27 nakṣatras fall 4 + 9 + 7 + 3 + 4; the thirteen also hold Abhijit, Agastya, Mṛgavyādha, Brahmahṛdaya', () => {
  const the27 = Dr.NAKSHATRA_28.filter((n) => n !== 'Abhijit');
  assert.equal(the27.length, 27);
  const counts = Dr.STAR_GROUPS.map((g) => g.names.filter((n) => the27.includes(n)).length);
  assert.deepEqual(counts, [4, 9, 7, 3, 4]);
  assert.deepEqual(Dr.STAR_GROUPS.map((g) => g.kalamsa), [13, 14, 15, 21, 17]);
  assert.deepEqual(Dr.STAR_GROUPS[4].names, ['Śatabhiṣaj', 'Pūrvabhādrapadā', 'Uttarabhādrapadā', 'Revatī'], '9.15 śeṣāṇi: the rest');
  for (const n of the27) assert.equal(Dr.STAR_GROUPS.filter((g) => g.names.includes(n)).length, 1, `${n} in exactly one group`);
  assert.deepEqual(Dr.STAR_GROUPS[0].names.filter((n) => !the27.includes(n)), ['Agastya', 'Mṛgavyādha', 'Abhijit', 'Brahmahṛdaya']);
  // every name is the catalogue's; Hutabhuj and Prajāpati (8.11-8.12, 8.20) are given no kālāṃśa by 9.12-9.15
  const catNames = new Set([...cat.stars, ...cat.named_stars].map((s) => s.name));
  for (const g of Dr.STAR_GROUPS) for (const n of g.names) assert.ok(catNames.has(n), `${n} is in yogatara.json`);
  assert.deepEqual(cat.stars.map((s) => s.name), Dr.NAKSHATRA_28);
  assert.equal(Dr.STAR_KALAMSA.Hutabhuj, undefined);
  assert.equal(Dr.starPhenomena({ name: 'Hutabhuj', dhruvaka: 52, vikshepa: 8 }, T2026, T2026 + 2, UJJAIN).limit, null);
  // the dhruvakas re-derived by 8.1-8.5 (the list dhruva.test.js proves from the verse words)
  const dm = [8, 20, 37.5, 49.5, 63, 67 + 1 / 3, 93, 106, 109, 129, 144, 155, 170, 180, 199, 213, 224, 229, 241, 254, 260, 266 + 2 / 3, 280, 290, 320, 326, 337, 359 + 5 / 6];
  cat.stars.forEach((s, i) => assert.ok(Math.abs(Dr.dhruvakaOf(s) - dm[i]) < 1e-9, s.name));
  assert.equal(Dr.dhruvakaOf(cat.named_stars.find((s) => s.name === 'Agastya')), 90);
  assert.equal(Dr.dhruvakaOf(cat.named_stars.find((s) => s.name === 'Prajāpati')), null);
});

test('[THEOREM 9.2-9.3, 9.7-9.8] the phenomenon by greater/less and slow/fast; Venus\'s pairs of 9.7 are the retrograde and the direct pair', () => {
  for (const pl of ['mars', 'jupiter', 'saturn']) {
    assert.deepEqual(Dr.pending(pl, false, true), { side: 'west', kind: 'asta', verse: '9.2' });
    assert.deepEqual(Dr.pending(pl, false, false), { side: 'east', kind: 'udaya', verse: '9.2' });
  }
  for (const pl of ['venus', 'mercury']) {
    assert.deepEqual(Dr.pending(pl, true, true), { side: 'west', kind: 'asta', verse: '9.2' }, 'śukrajñau vakriṇau tathā');
    assert.deepEqual(Dr.pending(pl, true, false), { side: 'east', kind: 'udaya', verse: '9.2' });
    assert.deepEqual(Dr.pending(pl, false, false), { side: 'east', kind: 'asta', verse: '9.3' });
    assert.deepEqual(Dr.pending(pl, false, true), { side: 'west', kind: 'udaya', verse: '9.3' });
  }
  assert.deepEqual(Dr.pending('moon', false, true), { side: 'west', kind: 'udaya', verse: '9.3' });
  // 9.7 by phenomenon: west setting and east rising 8 (mahattayā), east setting and west rising 10 (alpatvāt) — the
  // phenomena 9.2-9.3 give in retrograde and in direct motion, so the limit by motion is the limit by phenomenon
  for (const retro of [true, false]) for (const greater of [true, false]) {
    const p = Dr.pending('venus', retro, greater);
    const by97 = (p.side === 'west' && p.kind === 'asta') || (p.side === 'east' && p.kind === 'udaya') ? 8 : 10;
    assert.equal(Dr.planetLimit('venus', retro), by97);
  }
  assert.equal(Dr.planetLimit('mercury', true), 12); assert.equal(Dr.planetLimit('mercury', false), 14);
  assert.equal(Dr.planetLimit('jupiter', true), 11); assert.equal(Dr.planetLimit('saturn', false), 15); assert.equal(Dr.planetLimit('mars', false), 17);
  assert.equal(Dr.planetLimit('moon', false), 12);
  assert.throws(() => Dr.planetLimit('rahu', false), RangeError);
});

test('[TEXT 9.5, 9.10, 9.11, 9.16] kālāṃśa, kālagati, the days to go, kṣetrāṃśa: the text\'s identities', () => {
  const lanka = U.risings(0, { stated: true }), rs = U.risings(U.palabhaOf(23.18));
  // 9.11 with the edition's own example: the Sun's 59′ in Meṣa at Laṅkā (1670 asus) → 54.74 asus a day
  assert.ok(Math.abs(Dr.kalagati(59, 10, lanka, 'east') - 59 * 1670 / 1800) < 1e-12);
  assert.ok(Math.abs(Dr.kalagati(59, 10, lanka, 'east') - 54.74) < 0.005);
  // the west uses the sign six signs on (9.5): at Ujjayinī Meṣa rises fast and sets slow
  assert.ok(Dr.kalagati(59, 10, rs, 'west') > Dr.kalagati(59, 10, rs, 'east'));
  assert.equal(Dr.kalagati(59, 10, rs, 'west'), 59 * rs[6] / 1800);
  // 9.5 equals ss-udaya's kālāṃśa where both are positive
  for (const [pt, sun] of [[5, 20], [100, 117], [250, 262]]) {
    assert.ok(Math.abs(Dr.kalamsa(pt, sun, rs, 'east') - U.kalamsa(pt, sun, rs)) < 1e-9);
    assert.ok(Math.abs(Dr.kalamsa(sun + 9, sun, rs, 'west') - U.kalamsa(sun + 180, sun + 189, rs)) < 1e-9);
  }
  // 9.10-9.11: within one sign the kālāṃśa is linear in the days, so the text's rule is exact there
  const sun0 = 3, body0 = 14, sb = 59.1, bb = 4.8, L = 11;            // both stay in Meṣa for the days needed
  const kAt = (d) => Dr.kalamsa(body0 + bb * d / 60, sun0 + sb * d / 60, rs, 'west');
  const k0 = kAt(0), r = Dr.daysToLimit(k0, L, Dr.kalagati(sb, sun0, rs, 'west'), Dr.kalagati(bb, body0, rs, 'west'), 'west');
  assert.ok(r.days > 0 && r.days < 10, `${r.days}`);
  assert.ok(Math.abs(kAt(r.days) - L) < 1e-9, '9.10 lands exactly on the limit within a sign');
  // retrograde: the kālagatis add ("bhukti-yogena")
  const rr = Dr.daysToLimit(5, 8, Dr.kalagati(59, 100, rs, 'east'), Dr.kalagati(-30, 95, rs, 'east'), 'east');
  assert.ok(Math.abs(rr.rateAsus - (59 * rs[3] + 30 * rs[3]) / 1800) < 1e-12, 'sum of the two kālagatis');
  // 9.16: within a sign, kālāṃśa ≥ L exactly when the arc ≥ kṣetrāṃśa (L × 1800 ÷ that sign's rising)
  for (let arc = 0.5; arc < 20; arc += 0.25) {
    const sun = 59.5, pt = sun - arc, k = Dr.kalamsa(pt, sun, rs, 'east');      // both in Vṛṣa
    assert.equal(k >= 13, arc >= Dr.kshetramsa(13, pt, rs, 'east') - 1e-12, `arc ${arc}`);
  }
  assert.ok(Math.abs(Dr.kshetramsa(13, 10, lanka, 'east') - 13 * 1800 / 1670) < 1e-12, '13 kālāṃśa in Meṣa at Laṅkā = 14.01°');
});

test('[MEASURED] the text\'s sunrise (2.46 bhujāntara + 2.61-2.63 cara) is within 10.5 minutes of the sphere\'s; by the Laṅkā right ascension within 2', () => {
  let worst = 0, worstAsc = 0;
  for (let N = T2026; N < T2027; N += 3) for (const kind of ['rise', 'set']) {
    const sphere = (kind === 'rise' ? P.sunrise : P.sunset)(N, UJJAIN);
    worst = Math.max(worst, Math.abs(Dr.sunEvent(N, UJJAIN, kind) - sphere) * 1440);
    worstAsc = Math.max(worstAsc, Math.abs(Dr.sunEvent(N, UJJAIN, kind, { sunrise: 'ascension' }) - sphere) * 1440);
  }
  assert.ok(worst < 10.5 && worst > 5, `${worst.toFixed(2)} min: the obliquity part of the day's inequality, which the text omits (§7.20)`);
  assert.ok(worstAsc < 2, `${worstAsc.toFixed(2)} min`);
});

test('[MEASURED] the text\'s kālāṃśa (risings + 7.8-7.10) against the sphere for a body 8°-20° from the Sun: ≤ 0.7 on the ecliptic and ≤ 1.5 at |β| = 5° at Ujjayinī', () => {
  const worst = (lat, beta) => {
    const pb = U.palabhaOf(lat), rs = U.risings(pb); let mx = 0;
    for (let sun = 0; sun < 360; sun += 3) for (const off of [8, 12, 16, 20]) for (const side of ['east', 'west']) {
      const lam = mod(sun + (side === 'east' ? -off : off), 360);
      const k = Dr.kalamsa(U.drkkarma(lam, beta * 60, pb, side).lambda, sun, rs, side);
      mx = Math.max(mx, Math.abs(k - sphereKalamsa(D.eclipticToEquatorial(lam, beta), sun, side, lat)));
    }
    return mx;
  };
  const r = { lanka0: worst(0, 0), lanka5: worst(0, 5), uj0: worst(23.18, 0), uj2: worst(23.18, 2), uj5: worst(23.18, -5) };
  assert.ok(r.lanka0 < 0.4 && r.lanka5 < 0.6 && r.uj0 < 0.7 && r.uj2 < 0.9 && r.uj5 < 1.5, JSON.stringify(r));
});

test('[SYNTHETIC CALLBACK 9.2-9.11, drk "aksa"] five planets by the chapter\'s literal horizon rule at Ujjayinī: every change foretold by 9.2-9.3, at 9.6-9.8\'s limits, and 9.10\'s estimate inside the day', (t) => {
  const t1 = T2026 - 200, t2 = T2027 + 200, solar = Dr.solarDays(t1, t2, UJJAIN);
  const lines = [];
  for (const pl of ['mars', 'jupiter', 'saturn', 'venus', 'mercury']) {
    const r = Dr.planetPhenomena(syntheticBody(pl), t1, t2, UJJAIN, { planet: pl, solar, drk: 'aksa' });
    assert.ok(r.events.length >= 2, `${pl}: ${r.events.length}`);
    for (const e of r.events) {
      assert.ok(e.foretold, `${pl} ${e.side} ${e.kind} ${ymd(e.N)} foretold by ${e.rule}`);
      assert.equal(e.limit, Dr.planetLimit(pl, e.retrograde));
      if (e.kind === 'udaya') assert.ok(e.kalamsa >= e.limit && e.before.kalamsa < e.limit);
      else assert.ok(e.kalamsa < e.limit && e.before.kalamsa >= e.limit);
      assert.ok(e.estimateDays > 0 && e.estimateDays <= 1.0001, `${pl} ${ymd(e.N)}: 9.10 from the day before says ${e.estimateDays.toFixed(2)} days`);
      if (pl === 'venus') assert.equal(e.limit, (e.side === 'west') === (e.kind === 'asta') ? 8 : 10, '9.7 by phenomenon');
    }
    // the sequence of an outer planet: set in the west, then rise in the east, alternately
    if (['mars', 'jupiter', 'saturn'].includes(pl)) r.events.forEach((e, i) => i && assert.notEqual(e.side, r.events[i - 1].side));
    lines.push(`${pl}: ` + r.events.filter((e) => e.N >= T2026 && e.N < T2027).map((e) => `${e.side} ${e.kind} ${ymd(e.N)} (${e.kalamsa.toFixed(1)}/${e.limit})`).join('; '));
  }
  t.diagnostic('SYNTHETIC planets (mean motion + śīghra only), Ujjayinī 2026 — exercise of the API, not the sky:\n' + lines.join('\n'));
  // "relative" motion (slow = slower than the Sun) [reading] agrees here as well
  const m = Dr.planetPhenomena(syntheticBody('mercury'), t1, t2, UJJAIN, { planet: 'mercury', solar, motion: 'relative', drk: 'aksa' });
  assert.ok(m.events.every((e) => e.foretold));
});

test('[SYNTHETIC CALLBACK, default drk "own"] by each body\'s own declination and cara: the limits hold, 9.10\'s estimate (own kālagati) lands within the day, and 9.2-9.3 foretell nearly every change — the exceptions are a planet far off the ecliptic near the Sun, seen on the side its longitude alone would not give', (t) => {
  const t1 = T2026 - 200, t2 = T2027 + 200, solar = Dr.solarDays(t1, t2, UJJAIN);
  let all = 0, foretold = 0; const odd = [];
  for (const pl of ['mars', 'jupiter', 'saturn', 'venus', 'mercury']) {
    const r = Dr.planetPhenomena(syntheticBody(pl), t1, t2, UJJAIN, { planet: pl, solar });
    assert.equal(r.drk, 'own');
    for (const e of r.events) {
      all++; if (e.foretold) foretold++; else odd.push(`${pl} ${e.side} ${e.kind} ${ymd(e.N)}`);
      if (e.kind === 'udaya') assert.ok(e.kalamsa >= e.limit && e.before.kalamsa < e.limit);
      else assert.ok(e.kalamsa < e.limit && e.before.kalamsa >= e.limit);
      if (e.foretold) assert.ok(e.estimateDays > 0 && e.estimateDays <= 1.1, `${pl} ${ymd(e.N)}: 9.10 says ${e.estimateDays.toFixed(3)} days`);
    }
    if (['mars', 'jupiter', 'saturn'].includes(pl)) r.events.forEach((e, i) => i && assert.notEqual(e.side, r.events[i - 1].side));
  }
  assert.ok(foretold / all > 0.9, `${foretold}/${all}`);
  t.diagnostic(`own horizon: ${foretold} of ${all} changes foretold by 9.2-9.3; the rest: ${odd.join('; ') || 'none'}`);
});

/** The 2026 table of the junction stars at a site by the text, with the sphere's dates beside it (same limits). */
function starTable(site, opts = {}) {
  const solar = site === UJJAIN ? SOLAR : Dr.solarDays(T2026 - 45, T2027 + 60, site);
  return STARS.filter((s) => s.kalamsa).map((s) => {
    const r = Dr.starPhenomena(s, T2026 - 45, T2027 + 60, site, { solar, keepDays: true, ...opts });
    const sphereDays = r.days.map((d) => {
      const out = { N: d.N };
      for (const side of ['east', 'west']) {
        const sd = solar.find((x) => x.N === d.N)[side];
        out[side] = sphereKalamsa(D.polarToEquatorial(mod(s.dhruvaka + sd.A, 360), s.vikshepa), sd.sun, side, site.latitude);
      }
      return out;
    });
    const sphereEvent = (side, kind) => { for (let i = 1; i < sphereDays.length; i++) { const a = sphereDays[i - 1][side], b = sphereDays[i][side]; if ((a >= s.kalamsa) !== (b >= s.kalamsa) && Math.abs(a) < 60 && Math.abs(b) < 60 && (b >= s.kalamsa) === (kind === 'udaya') && sphereDays[i].N >= T2026 && sphereDays[i].N < T2027) return sphereDays[i].N; } return null; };
    const in26 = (e) => e.N >= T2026 && e.N < T2027;
    const setting = r.events.find((e) => e.side === 'west' && e.kind === 'asta' && in26(e)) || null;
    const rising = r.events.find((e) => e.side === 'east' && e.kind === 'udaya' && in26(e)) || null;
    const nextRising = setting && r.events.find((e) => e.side === 'east' && e.kind === 'udaya' && e.N > setting.N);
    let dk = 0; r.days.forEach((d, i) => { for (const side of ['east', 'west']) if (Math.abs(d[side].kalamsa) < 40) dk = Math.max(dk, Math.abs(d[side].kalamsa - sphereDays[i][side])); });
    const decl = U.kranti(s.dhruvaka + 22.9) + s.vikshepa;              // the star's declination on the text's own frame, 2026
    return { name: s.name, limit: s.kalamsa, vikshepa: s.vikshepa, decl, r, setting, rising, lost: nextRising ? nextRising.N - setting.N : null,
      neverLost: r.days.filter((d) => d.N >= T2026 && d.N < T2027).every((d) => !d.lost), maxDk: dk,
      sphereSetting: sphereEvent('west', 'asta'), sphereRising: sphereEvent('east', 'udaya') };
  });
}

test('[TEXT 9.12-9.17, drk "aksa", MEASURED] the junction stars at Ujjayinī in 2026 by the chapter\'s literal ākṣa rule: they set in the west and rise in the east, never the reverse; dates and the sphere beside them', (t) => {
  const rows = starTable(UJJAIN, { drk: 'aksa' });
  assert.equal(rows.length, 31, '28 junction stars + Agastya, Mṛgavyādha, Brahmahṛdaya');
  const lines = [];
  for (const x of rows) {
    for (const e of x.r.events) assert.ok(e.foretold, `${x.name}: ${e.side} ${e.kind} — 9.17 says rising east, setting west`);
    for (const e of x.r.events) assert.ok(e.estimateDays > 0 && e.estimateDays <= 1.0001, `${x.name}: 9.17 estimate ${e.estimateDays}`);
    assert.ok(x.setting && x.rising, `${x.name}: one heliacal setting and one rising in 2026`);
    assert.equal(x.r.events.filter((e) => e.N >= T2026 && e.N < T2027 && e.side === 'west').length, 1);
    if (!x.neverLost) assert.ok(x.lost > 0 && x.lost < 100, `${x.name}: lost ${x.lost} days`);
    if (Math.abs(x.decl) < 40) {                                         // the ākṣa is a first-order rule: it holds where the star is not far from the equator
      assert.ok(x.maxDk < 4.5, `${x.name}: |text − sphere| ${x.maxDk.toFixed(2)} kālāṃśa`);
      for (const [a, b] of [[x.setting.N, x.sphereSetting], [x.rising.N, x.sphereRising]]) if (b !== null) assert.ok(Math.abs(a - b) <= 5, `${x.name}: ${ymd(a)} vs sphere ${ymd(b)}`);
    }
    lines.push(`${x.name.padEnd(17)} ${String(x.limit).padStart(2)}  sets(W) ${ymd(x.setting.N)}  rises(E) ${ymd(x.rising.N)}  ${x.neverLost ? 'never lost' : 'lost ' + String(x.lost).padStart(2) + ' d'}`
      + `  | sphere Δ ${x.sphereSetting === null ? '–' : x.sphereSetting - x.setting.N} / ${x.sphereRising === null ? '–' : x.sphereRising - x.rising.N} d, max |Δk| ${x.maxDk.toFixed(1)}`);
  }
  t.diagnostic('Junction stars, Ujjayinī (23.18° N, deśāntara 0.05), 2026, text (sunrise/sunset by the text, ākṣa dṛkkarma on the dhruvaka):\n' + lines.join('\n'));
  const by = Object.fromEntries(rows.map((x) => [x.name, x]));
  // Agastya's heliacal rising (prāg-udaya) falls in the first days of September; Mṛgavyādha rises in early August
  assert.equal(ymd(by.Agastya.rising.N), '2026-09-04');
  assert.equal(ymd(by['Mṛgavyādha'].rising.N), '2026-08-06');
  assert.equal(ymd(by['Mṛgavyādha'].setting.N), '2026-06-06');
  // far from the equator the ākṣa line departs from the sphere: Agastya (−56°) and Brahmahṛdaya (+49°) by 11-17 kālāṃśa
  assert.ok(by.Agastya.maxDk > 10 && by['Brahmahṛdaya'].maxDk > 10);
});

test('[TEXT 2.58, 2.61-2.63, ch.8, MEASURED; default] the junction stars by their own declination and cara: every star within 0.5 kālāṃśa of the sphere, every date within 2 days of it — Agastya included', (t) => {
  const rows = starTable(UJJAIN);
  const lines = [];
  for (const x of rows) {
    assert.equal(x.r.drk, 'own');
    assert.ok(x.maxDk < 0.5, `${x.name}: |text − sphere| ${x.maxDk.toFixed(2)} kālāṃśa`);
    for (const e of x.r.events) assert.ok(e.foretold && e.estimateDays > 0 && e.estimateDays <= 1.1, `${x.name} ${e.side} ${e.kind}: ${e.estimateDays}`);
    for (const [a, b] of [[x.setting && x.setting.N, x.sphereSetting], [x.rising && x.rising.N, x.sphereRising]]) if (a != null && b !== null) assert.ok(Math.abs(a - b) <= 2, `${x.name}: ${ymd(a)} vs sphere ${ymd(b)}`);
    lines.push(`${x.name.padEnd(17)} ${String(x.limit).padStart(2)}  sets(W) ${x.setting ? ymd(x.setting.N) : '—'}  rises(E) ${x.rising ? ymd(x.rising.N) : '—'}  ${x.neverLost ? 'never lost' : 'lost ' + String(x.lost).padStart(3) + ' d'}  max |Δk| ${x.maxDk.toFixed(2)}`);
  }
  t.diagnostic('Junction stars, Ujjayinī 2026, by their own declination and cara:\n' + lines.join('\n'));
});

test('[READING 7.10-7.11, 9.17] the dhruvaka already carries the āyana part: adding it again (literal "pūrvavat") moves high-latitude stars away from the sphere', () => {
  const a = Object.fromEntries(starTable(UJJAIN, { drk: 'aksa' }).map((x) => [x.name, x.maxDk]));
  const b = Object.fromEntries(starTable(UJJAIN, { starAyana: true }).map((x) => [x.name, x.maxDk]));
  for (const n of ['Svātī', 'Abhijit', 'Dhaniṣṭhā', 'Pūrvabhādrapadā', 'Uttarabhādrapadā', 'Śravaṇa']) assert.ok(b[n] > a[n] + 2, `${n}: ākṣa only ${a[n].toFixed(2)}, with āyana ${b[n].toFixed(2)}`);
  for (const n of ['Puṣya', 'Maghā', 'Revatī']) assert.ok(Math.abs(a[n] - b[n]) < 1e-9, `${n}: zero vikṣepa, no dṛkkarma either way`);
});

test('[TEXT 9.18, MEASURED] the six northern stars at Ujjayinī by the text: Abhijit, Brahmahṛdaya, Svātī, Dhaniṣṭhā never lost; Śravaṇa lost one morning, Uttarabhādrapadā sixteen', (t) => {
  const six = STARS.filter((s) => Dr.NEVER_LOST.includes(s.name));
  assert.equal(six.length, 6);
  const at = (site, o = { drk: 'aksa' }) => Object.fromEntries(Dr.starsPhenomena(six, T2026, T2027, site, o).map((r) => [r.name, r]));
  const u = at(UJJAIN);
  for (const n of ['Abhijit', 'Brahmahṛdaya', 'Svātī', 'Dhaniṣṭhā']) assert.ok(u[n].neverLost, n);
  assert.equal(u['Śravaṇa'].lostDays, 1);
  assert.equal(u['Uttarabhādrapadā'].lostDays, 16);
  // the latitude from which each is never lost by the text's arithmetic (whole degrees)
  const from = {};
  for (let lat = 10; lat <= 45; lat++) { const r = at({ latitude: lat, deshantara: 0 }); for (const n of Dr.NEVER_LOST) if (!(n in from) && r[n].neverLost) from[n] = lat; }
  assert.deepEqual(from, { Abhijit: 12, 'Svātī': 20, 'Dhaniṣṭhā': 22, 'Brahmahṛdaya': 22, 'Śravaṇa': 25, 'Uttarabhādrapadā': 40 });
  t.diagnostic('9.18 holds by the ākṣa rule from latitude: ' + JSON.stringify(from));
  const own = at(UJJAIN, {});
  t.diagnostic('by their own declination and cara at Ujjayinī: ' + Object.values(own).map((r) => `${r.name} ${r.neverLost ? 'never lost' : 'lost ' + r.lostDays}`).join(', '));
  for (const n of ['Abhijit', 'Brahmahṛdaya']) assert.ok(own[n].neverLost, n);
});

test('[TEXT 10.1] both horizons in 2026 at Ujjayinī: the last morning (east) and the first evening (west), on the text\'s sunrise and sunset', (t) => {
  const lv = Dr.lunarVisibility(T2026, T2027, UJJAIN);
  const sphere = Ut.candraDarshana(T2026, T2027, UJJAIN);                  // the same 10.1-10.4 on the pañcāṅga's sunset
  assert.equal(lv.length, 12);
  const lines = [];
  let differ = 0;
  for (const r of lv) {
    assert.ok(r.lastMorning && r.firstEvening, ymd(Math.floor(r.amavasya)));
    assert.ok(r.lastMorning.kalamsa >= 12 && r.lastMorning.sunrise < r.amavasya && r.firstEvening.sunset > r.amavasya);
    assert.ok(r.unseenDays > 1 && r.unseenDays < 4, `unseen ${r.unseenDays}`);
    const s = sphere.find((x) => Math.abs(x.amavasya - r.amavasya) < 1);
    if (s.first.N !== r.firstEvening.N) { differ++; assert.ok(Math.abs(r.firstEvening.kalamsa - 12) < 0.2, 'only where the evening is within a hair of 12'); }
    lines.push(`${ymd(Math.floor(r.amavasya + UJJAIN.deshantara / 360))}  last morning ${ymd(r.lastMorning.N)} (${r.lastMorning.kalamsa.toFixed(1)}, ${r.lastMorning.hoursBeforeConjunction.toFixed(1)} h before)  first evening ${ymd(r.firstEvening.N)} (${r.firstEvening.kalamsa.toFixed(1)}, ${r.firstEvening.hoursAfterConjunction.toFixed(1)} h after)  unseen ${r.unseenDays.toFixed(2)} d`);
  }
  assert.ok(differ <= 1, `${differ}`);
  t.diagnostic('Moon, Ujjayinī 2026, 12 kālāṃśa both sides (text sunrise/sunset):\n' + lines.join('\n'));
  // the Moon through the planet machinery (9.3: fast — less sets in the east, greater rises in the west) gives the same days
  const moonBody = (tt) => { const p = P.placesAt(tt); return { lambda: p.moon, latArcmin: p.moonLatitude * 60, bhukti: w180(P.placesAt(tt + 0.5).moon - P.placesAt(tt - 0.5).moon) * 60 }; };
  const ph = Dr.planetPhenomena(moonBody, T2026, T2027, UJJAIN, { planet: 'moon', solar: SOLAR });
  for (const r of lv) {
    const east = ph.events.find((e) => e.side === 'east' && e.kind === 'asta' && Math.abs(e.N - r.lastMorning.N - 1) < 0.5);
    const west = ph.events.find((e) => e.side === 'west' && e.kind === 'udaya' && e.N === r.firstEvening.N);
    if (r.lastMorning.N >= T2026) assert.ok(east && east.foretold && east.rule === '9.3', `east after ${ymd(r.lastMorning.N)}`);
    assert.ok(west && west.foretold, `west ${ymd(r.firstEvening.N)}`);
  }
});

test('[TEXT 10.5, MEASURED] the dark half: moonrise after sunset by the Sun + half a revolution, iterated; within 15 minutes of the geometric moonrise', () => {
  let worst = 0, worstAsc = 0, n = 0;
  for (let N = T2026; N < T2027; N++) {
    const m = Dr.moonAtSunset(N, UJJAIN);
    if (m.half === 'shukla') { assert.ok(m.moonset > m.sunset || (m.elongation < 15 && m.kalamsa < 0), `${ymd(N)} E ${m.elongation}`); continue; }   // just after the conjunction a southern Moon can set first
    assert.ok(m.steps < 30 && (m.moonrise >= m.sunset || (m.beforeSunset && m.elongation < 182)), `${ymd(N)} E ${m.elongation}`);
    if (m.elongation < 185 || m.elongation > 300) continue;             // rises well within the night
    const g = Ut.moonrise(N, UJJAIN); if (g === null) continue;
    worst = Math.max(worst, Math.abs(m.moonrise - g) * 1440); n++;
    const ma = Dr.moonAtSunset(N, UJJAIN, { sunrise: 'ascension' });
    worstAsc = Math.max(worstAsc, Math.abs(ma.moonrise - g) * 1440);
  }
  assert.ok(n > 100);
  assert.ok(worst < 15 && worstAsc < worst, `${worst.toFixed(1)} min (text sunset), ${worstAsc.toFixed(1)} min (sunset by the right ascension)`);
  // at opposition the Moon rises with the Sun's setting: 10.5's asus are near zero just after full moon
  const pb = U.palabhaOf(23.18);
  const r = Dr.moonriseAfterSunset({ sun: 100, moon: 280.5, moonLatArcmin: 0, sunBhukti: 57.3, moonBhukti: 790, palabha: pb });
  assert.ok(r.moonriseAfterSunsetAsus > 0 && r.moonriseAfterSunsetAsus < 120 && r.moonriseAfterSunsetAsus > r.firstAsus, JSON.stringify(r));
});

test('[TEXT 10.6-10.8] the figure: declinations alike → difference, else sum; bāhu = (12·akṣajyā ∓ jyā × karṇa) ÷ lambajyā; śruti² = bāhu² + 12²', () => {
  const pb = U.palabhaOf(23.18), ax = Dr.aksha(pb);
  assert.ok(Math.abs(ax.akshajya ** 2 + ax.lambajya ** 2 - 3438 ** 2) < 1e-6, '3.13-3.14 from the palabhā');
  assert.ok(Math.abs(12 * ax.akshajya / ax.lambajya - pb) < 1e-12);
  // the edition's own example of 10.6: δ☉ +12, δ☽ +18 → 6; δ☉ +12, δ☽ −5 → 17 (sun at λ with that declination; Moon by latitude)
  const lamOf = (d) => Math.asin(Math.sin(d * D2R) / Math.sin(D.SS_EPSILON_DEG * D2R)) * R2D;   // only to place the inputs
  for (const [ds, dm, want] of [[12, 18, 6], [12, -5, -17]]) {
    const sun = lamOf(ds), moon = sun + 20, lat = (dm - U.kranti(moon)) * 60;
    const f = Dr.shringonnati({ sun, moon, moonLatArcmin: lat, palabha: pb });
    assert.ok(Math.abs(f.declination.difference - want) < 0.05, `${ds}, ${dm}: ${f.declination.difference}`);
    assert.ok(Math.abs(f.jya - Math.sign(want) * 3438 * Math.sin(Math.abs(want) * D2R)) < 1.5);
    assert.ok(Math.abs(f.remainder - (12 * ax.akshajya - f.jya * f.karna)) < 1e-9);
    assert.ok(Math.abs(f.bahu * ax.lambajya - f.remainder) < 1e-9 && Math.abs(f.shruti ** 2 - f.bahu ** 2 - 144) < 1e-9);
  }
  // 3.34-3.36: the text's śaṅku against the sphere's sin(altitude)
  let mx = 0;
  for (const d of [-23, -10, 0, 12, 24]) for (let H = 0; H < 110; H += 5) {
    const exact = 3438 * (Math.sin(23.18 * D2R) * Math.sin(d * D2R) + Math.cos(23.18 * D2R) * Math.cos(d * D2R) * Math.cos(H * D2R));
    mx = Math.max(mx, Math.abs(Dr.shanku(d, H * 60, pb) - exact));
  }
  assert.ok(mx < 6, `${mx.toFixed(2)} of 3438`);
  // the noon karṇa: zenith distance φ − δ
  assert.ok(Math.abs(Dr.madhyahnaKarna(23.18, pb) - 12) < 0.01, 'a body at the zenith casts (almost) no shadow: karṇa = gnomon');
  assert.ok(Math.abs(Dr.madhyahnaKarna(0, pb) - 12 / Math.cos(23.18 * D2R)) < 0.02, 'on the equator: 12 ÷ cos φ');
});

test('[MEASURED 10.6-10.14] the horns at Ujjayinī in 2026: with the karṇa of the moment the tilt follows the sphere; with the words\' midday karṇa it does not', (t) => {
  const st = { n: 0, dT: 0, dM: 0, maxT: 0, wrongT: 0, wrongM: 0 };
  for (let N = T2026; N < T2027; N++) {
    const h = Dr.hornsOn(N, UJJAIN); if (!h) continue;
    if (!(h.elongation <= 40 || h.elongation >= 320)) continue;          // crescents: where the horns are drawn
    const dark = h.elongation > 180, sp = sphereHorns(dark ? P.sunrise(N, UJJAIN) : P.sunset(N, UJJAIN), dark, 23.18);
    if (sp.altitude < 2) continue;
    const tt = Math.sign(h.tatkala.bahu) * h.tatkala.tiltDeg, tm = Math.sign(h.madhyahna.bahu) * h.madhyahna.tiltDeg;
    st.n++; st.dT += Math.abs(tt - sp.tilt); st.dM += Math.abs(tm - sp.tilt); st.maxT = Math.max(st.maxT, Math.abs(tt - sp.tilt));
    if (Math.abs(sp.tilt) > 3) { if (Math.sign(tt) !== Math.sign(sp.tilt)) st.wrongT++; if (Math.sign(tm) !== Math.sign(sp.tilt)) st.wrongM++; }
    assert.ok(Math.abs(Math.asin(h.moonShanku / 3438) * R2D - sp.altitude) < 1, 'the text\'s śaṅku is the Moon\'s altitude');
  }
  assert.ok(st.n > 60);
  assert.ok(st.dT / st.n < 5 && st.wrongT === 0 && st.maxT < 20, `tatkāla: mean ${(st.dT / st.n).toFixed(2)}°, max ${st.maxT.toFixed(1)}°, wrong horn ${st.wrongT}`);
  assert.ok(st.dM / st.n > 10 && st.wrongM >= 5, `madhyāhna: mean ${(st.dM / st.n).toFixed(2)}°, wrong horn ${st.wrongM} of ${st.n}`);
  t.diagnostic(`horn tilt vs sphere, ${st.n} crescents (E ≤ 40° evening, ≥ 320° morning): tatkāla mean ${(st.dT / st.n).toFixed(1)}° max ${st.maxT.toFixed(1)}° wrong side ${st.wrongT}; madhyāhna mean ${(st.dM / st.n).toFixed(1)}° wrong side ${st.wrongM}`);
  // one lunation, day by day (text output)
  const lines = [];
  for (let N = K.kaliDayFromCivil({ calendar: 'gregorian', year: 2026, month: 9, day: 11 }); N < K.kaliDayFromCivil({ calendar: 'gregorian', year: 2026, month: 10, day: 10 }); N++) {
    const h = Dr.hornsOn(N, UJJAIN); if (!h) continue;
    const dark = h.elongation > 180, sp = sphereHorns(dark ? P.sunrise(N, UJJAIN) : P.sunset(N, UJJAIN), dark, 23.18);
    lines.push(`${ymd(N)} ${h.moment.padEnd(7)} E ${h.elongation.toFixed(1).padStart(5)}°  bright ${h.illumination.suklaTwelfths.toFixed(2).padStart(5)}/12 (sphere ${(12 * sp.fraction).toFixed(2).padStart(5)})  bāhu ${h.tatkala.bahu.toFixed(2).padStart(6)}  tilt ${h.tatkala.tiltDeg.toFixed(1).padStart(4)}° ${h.tatkala.elevatedHorn} horn up (sphere ${Math.abs(sp.tilt).toFixed(1)}°; midday karṇa ${h.madhyahna.tiltDeg.toFixed(1)}° ${h.madhyahna.elevatedHorn})`);
  }
  t.diagnostic('lunation of 2026-09-11, Ujjayinī:\n' + lines.join('\n'));
});

test('[MEASURED 10.9, 10.15] the bright part is linear in the elongation; against (1 − cos E)/2 the most is 0.105 of the disc at E = 39.5° (and 140.5°)', () => {
  let mx = 0, at = 0;
  for (let E = 0; E <= 360; E += 0.1) {
    const f = Dr.illumination(0, E), g = (1 - Math.cos(E * D2R)) / 2;
    if (Math.abs(f.fraction - g) > mx) { mx = Math.abs(f.fraction - g); at = E; }
    assert.ok(Math.abs(f.suklaTwelfths + f.asitaTwelfths - 12) < 1e-9);
  }
  assert.ok(Math.abs(mx - (Math.asin(2 / Math.PI) / Math.PI - (1 - Math.sqrt(1 - 4 / Math.PI ** 2)) / 2)) < 1e-3, `${mx}`);
  assert.ok([39.5, 140.5, 219.5, 320.5].some((e) => Math.abs(at - e) < 0.15), `${at}`);
  for (const E of [0, 90, 180, 270]) assert.ok(Math.abs(Dr.illumination(10, 10 + E).fraction - (1 - Math.cos(E * D2R)) / 2) < 1e-12, `${E}`);
  assert.equal(Dr.illumination(40, 250).asitaTwelfths, 30 * 60 / 900, '10.15 with the edition\'s example: 250 − (40 + 180) = 30° → 2 twelfths dark');
  assert.equal(Dr.illumination(0, 90, { bimbaAngula: 15 }).suklaAngula, 7.5, '× the disc in aṅgulas ÷ 12');
});

test('[FRAME] ss-drishya.js names no modern source, requires only sovereign files, and draws no sine or arc from the sphere', () => {
  const text = fs.readFileSync(path.join(__dirname, 'ss-drishya.js'), 'utf8');
  assert.equal(/\b(?:DE4\d\d|VSOP\d*|ELP\d*|Swiss|swisseph|Gaia|IERS|DrikTier)\b|finals\.all|DeltaT|astronomy-engine/.test(text), false);
  const allowed = new Set(['./katapayadi.js', './kala-dvara.js', './parahita-madhyama.js', './dhruva.js', './sphuta.js', './radau.js',
    './panchanga.js', './dasha.js', './muhurta.js', './utsava.js', './gurutva.js', './gurutva-candra.js', './spanda-ganita.js', './ss-udaya.js']);
  const reqs = [...text.matchAll(/\brequire\s*\(\s*["']([^"']+)["']\s*\)/g)].map((m) => m[1]);
  assert.ok(reqs.length > 0);
  for (const r of reqs) assert.ok(allowed.has(r), r);
  assert.equal(/\bimport\s/.test(text), false);
  assert.equal(/Math\.(?:sin|cos|tan|asin|acos|atan2?)\b/.test(text), false, 'the text\'s table, not the sphere');
});
