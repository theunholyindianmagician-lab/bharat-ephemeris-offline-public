'use strict';
/*
 * samskara.test.js — saṃskāra, the correction of the text's own numbers from observation, as a SYNTHETIC closed loop.
 * Every observation here is synthetic: made by the text's own forward model (samskara.js synthesize, or
 * parahita-madhyama.js for the Parahita places) with a known change of the text's parameters and, where said, noise at
 * the instruments' resolution — and labelled synthetic, with its generator. No observation is invented; no modern
 * ephemeris enters as computation, seed or referee. The loop: move the text, observe the moved text, correct the
 * unmoved text from those observations, and check that the move comes back within the noise.
 *   Instrument resolutions used: the vyaṅgula (1/60 aṅgula) of the noon shadow [text: JM p.36, duṣkarā], ≈ 10′ of the Sun
 *   at Ujjayinī's equinox [measured: ss-chaya.test.js]; a kapāla read to the prāṇa with a vināḍī of contact error
 *   [unverified: the vināḍī is an assumption, §4.4]; Moon–star timings to two vināḍī [assumption].
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
const SK = require('./samskara.js');
const S = require('./sphuta.js');
const PM = require('./parahita-madhyama.js');
const GR = require('./ss-graha.js');
const GH = require('./ss-grahana.js');
const C = require('./ss-chaya.js');
const D = require('./ss-drishya.js');
const K = require('./kala-dvara.js');
const KP = require('./katapayadi.js');
const numbers = JSON.parse(fs.readFileSync(path.join(__dirname, 'corpus', 'surya-siddhanta', 'numbers.json'), 'utf8'));

const mod = (a, m) => ((a % m) + m) % m;
const w180 = (a) => mod(a + 180, 360) - 180;
const bhuta = (values) => Number(values.map((v) => String(v).split('').reverse().join('')).join('').split('').reverse().join(''));   // first word = units
const dayOf = (y, m, d) => K.kaliDayFromCivil({ calendar: 'gregorian', year: y, month: m, day: d });
const T0 = dayOf(2026, 1, 1);
const UJJ = { name: 'Ujjayinī (synthetic site)', latitude: 23.18, deshantara: 0 };   // the latitude ss-chaya.test.js uses
const ratEq = (a, b) => a.num * b.den === b.num * a.den;
const pull = (p, truth) => (p.delta - truth) / p.sigma;

// ── the main synthetic loop: Sun, Moon, apogee, node and the ayanāṃśa ─────────────────────────────────
const TRUE = { 'sun.epoch': 4, 'sun.rev': 600, 'moon.epoch': -12, 'moon.rev': 250, 'moonApogee.epoch': 90, 'moonApogee.rev': 3000,
  'node.epoch': 20, 'node.rev': -400, 'ayanamsha.phase': 0.5 };
const STARS = [{ name: 'Citrā', lambda: 180 }, { name: 'Revatī', lambda: 359 + 50 / 60 }];   // SS ch.8 dhruvakas, zero vikṣepa
const memo = {};
function loop(noisy) {
  if (memo[noisy]) return memo[noisy];
  const days = [];
  for (let N = T0 - 6 * 365; N < T0 + 6 * 365; N += 9) days.push(N);
  const obs = SK.synthesize({ epoch: T0, deltas: TRUE, seed: 7,
    shadows: { site: UJJ, days, sigmaVyangula: noisy ? 0.5 : 0, round: noisy },
    eclipses: { from: T0 - 20 * 365, to: T0 + 20 * 365, sigmaVinadi: noisy ? 1 : 0, site: UJJ, nightOnly: true, read: noisy ? undefined : false },
    moonStars: { from: T0 - 6 * 365, to: T0 + 6 * 365, stars: STARS, sigmaVinadi: noisy ? 2 : 0 } });
  if (!noisy) for (const o of obs) { if (o.kind === 'chaya') o.sigmaVyangula = 1; if (o.kind === 'grahana') o.sigmaVinadi = 1; if (o.kind === 'candra') o.sigmaVinadi = 2; }
  const fit = SK.samskara(obs, { epoch: T0, params: Object.keys(TRUE) });
  return (memo[noisy] = { obs, fit });
}

test('[theorem] Jacobi rotations diagonalize a symmetric matrix: A = V Λ Vᵀ, V orthonormal, the eigenvalues ascending', () => {
  const rnd = SK.prng(42), n = 7;
  const B = Array.from({ length: n }, () => Array.from({ length: n }, () => rnd.uni() - 0.5));
  const A = B.map((r, i) => r.map((_, j) => B[i].reduce((s, _x, k) => s + B[i][k] * B[j][k], 0)));   // BBᵀ: symmetric, ≥ 0
  A[0] = A[0].map((v) => v * 1e6); A.forEach((r) => { r[0] *= 1e6; });                                 // badly graded on purpose
  const E = SK.jacobiEigen(A);
  for (let i = 1; i < n; i++) assert.ok(E.values[i] >= E.values[i - 1]);
  let rec = 0, orth = 0;
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
    const a = E.values.reduce((s, l, k) => s + l * E.vectors[k][i] * E.vectors[k][j], 0);
    rec = Math.max(rec, Math.abs(a - A[i][j]) / Math.max(1, Math.abs(A[i][j])));
    const d = E.vectors[i].reduce((s, v, k) => s + v * E.vectors[j][k], 0);
    orth = Math.max(orth, Math.abs(d - (i === j ? 1 : 0)));
  }
  assert.ok(rec < 1e-9 && orth < 1e-12, `reconstruction ${rec}, orthogonality ${orth}`);
  const two = SK.jacobiEigen([[2, 1], [1, 2]]);
  assert.ok(Math.abs(two.values[0] - 1) < 1e-15 && Math.abs(two.values[1] - 3) < 1e-15);
});

test('[theorem, measured] at the text\'s values the model IS sphuta.js, ss-graha.js and parahita-madhyama.js; its eclipse is ss-grahana\'s; its crescents are ss-drishya\'s', () => {
  const M = SK.model({}, { epoch: T0 });
  let e = 0, pl = 0, ay = 0;
  for (let i = 0; i < 120; i++) {
    const t = T0 - 40000 + i * 667.3, p = M.places(t), q = S.sphutaAtDays(t);
    e = Math.max(e, Math.abs(w180(p.sun - q.sun)), Math.abs(w180(p.moon - q.moon)), Math.abs(w180(p.node - q.rahu)), Math.abs(p.latitude / 60 - q.moonLatitude));
    ay = Math.max(ay, Math.abs(M.ayanamsha(t) - S.ayanamshaSS(S.spandasOfDays(t))));
    for (const n of GR.NAMES) pl = Math.max(pl, Math.abs(w180(M.planet(n, t) - GR.truePlace(t, n).longitude)));
  }
  assert.ok(e < 1e-9 && ay === 0 && pl < 1e-9, `Sun/Moon/node ${e}°, ayanāṃśa ${ay}°, planets ${pl}°`);
  // Āryabhaṭa's canon: the mean places are parahita-madhyama.js's exact residues
  const MA = SK.model({}, { canon: 'aryabhata', epoch: 1651700 });
  for (const b of SK.BODIES) {
    const ref = PM.meanArcsec(b === 'moonApogee' ? 'apogee' : b, 1651700n * PM.SPD);
    assert.ok(Math.abs(w180(MA.mean(1651700)[b] - Number(ref.num) / Number(ref.den) / 3600)) < 1e-9, b);
  }
  assert.throws(() => MA.places(1651700), /mean places only/);
  // the eclipse: the same middle as ss-grahana (spanda-ganita's exact pūrṇimā); contacts within a tenth of a vināḍī (the
  // motions here are a day's difference of places, there the text's 2.47-2.49 — 0.1′ apart in the discs)
  for (const near of [T0 + 61, T0 + 239]) {
    const E = SK.lunarEclipse(M, near), G = GH.lunarEclipse(near, null);
    assert.ok(Math.abs(E.middle - G.middle) * 86400 < 0.01 && Math.abs(E.latitude - G.latitude) < 1e-9);
    assert.ok(Math.abs(E.sparsha - G.contacts.sparsha) * 3600 < 0.1 && Math.abs(E.moksha - G.contacts.moksha) * 3600 < 0.1);
  }
  // the crescent: SS 10.1 on the text's sunset gives the same first evenings as ss-drishya.js lunarVisibility
  const vis = D.lunarVisibility(T0, T0 + 365, UJJ).filter((v) => v.firstEvening).map((v) => v.firstEvening.N);
  const mine = SK.synthesize({ epoch: T0, crescents: { site: UJJ, from: T0 + 1, to: T0 + 365 } }).map((o) => o.N);
  assert.deepEqual(mine.filter((N) => N >= vis[0] && N <= vis.at(-1)), vis);
  // a noon shadow of the model is ss-chaya's of the text's sāyana Sun
  const t = T0 + 80.5, n = C.noonShadow(mod(S.sphutaAtDays(t).sun + S.ayanamshaSS(S.spandasOfDays(t)), 360), C.palabhaOfLatitude(23.18).palabha);
  assert.ok(Math.abs(C.noonShadow(M.sayanaSun(t), C.palabhaOfLatitude(23.18).palabha).chaya - n.chaya) < 1e-12);
});

test('[synthetic] the closed loop without noise: nine moved parameters come back, from shadows, eclipse contacts and Moon–star timings', () => {
  const { obs, fit } = loop(false);
  assert.equal(fit.tag, '[synthetic]');
  assert.ok(obs.filter((o) => o.kind === 'grahana').length >= 20 && obs.filter((o) => o.kind === 'chaya').length > 400 && obs.filter((o) => o.kind === 'candra').length > 200);
  assert.equal(fit.frozen.length, 0, 'everything is seen');
  for (const [n, truth] of Object.entries(TRUE)) {
    const p = fit.params[n];
    assert.equal(p.status, 'fitted');
    assert.ok(Math.abs(pull(p, truth)) < 0.05, `${n}: ${p.delta} against ${truth} (σ ${p.sigma})`);
  }
  const b = fit.residuals.before.rms, a = fit.residuals.after.rms;
  assert.ok(b['vināḍī'].rms > 50 && b.arcmin.rms > 5 && b['vyaṅgula'].rms > 1, JSON.stringify(b));
  assert.ok(a['vināḍī'].rms < 0.01 && a.arcmin.rms < 0.001 && a['vyaṅgula'].rms < 1e-4, JSON.stringify(a));
  // the epochs at Kali 0: the same straight line carried back
  const p = fit.params['moon.epoch'];
  assert.ok(Math.abs(p.deltaAtKali0 - (p.delta - fit.params['moon.rev'].delta * T0 / Number(S.YUGA_DAYS) * 21600)) < 1e-9);
});

test('[synthetic] at the instruments\' resolution — shadows to the vyaṅgula, contacts on a kapāla to the prāṇa ± 1 vināḍī, Moon–star ± 2 vināḍī — the move returns within 3.5σ, χ²/dof ≈ 1', () => {
  const { obs, fit } = loop(true);
  const sh = obs.find((o) => o.kind === 'chaya'), ec = obs.find((o) => o.kind === 'grahana');
  assert.ok(Number.isInteger(sh.chaya.vyangula) && sh.synthetic && /synthetic, not an observation/.test(sh.generator));
  assert.ok(Number.isInteger(ec.sparsha.kali) && Number.isInteger(ec.sparsha.kapala.prana) && ec.sparsha.calibration);
  const report = [];
  for (const [n, truth] of Object.entries(TRUE)) {
    const p = fit.params[n];
    report.push(`${n} ${truth} → ${p.delta.toFixed(3)} ± ${p.sigma.toPrecision(3)}`);
    assert.ok(Math.abs(pull(p, truth)) < 3.5, report.at(-1));
  }
  assert.ok(fit.chi2PerDof > 0.8 && fit.chi2PerDof < 1.25, `χ²/dof ${fit.chi2PerDof}`);
  // the uncertainties are those of the instruments: a few hundredths of a minute for the epochs of Sun and Moon
  assert.ok(fit.params['moon.epoch'].sigma < 0.1 && fit.params['sun.epoch'].sigma < 0.1 && fit.params['moon.rev'].sigma < 5, report.join('; '));
  const a = fit.residuals.after.rms;
  assert.ok(a['vyaṅgula'].rms < 0.8 && a['vināḍī'].rms < 1.3 && a.arcmin.rms < 0.7, JSON.stringify(a));
  assert.ok(fit.residuals.before.rms['vināḍī'].rms > 100 * a['vināḍī'].rms);
});

test('[synthetic] the identifiability freeze: a week of noon shadows sees only the sāyana Sun — the Moon, apogee and node unseen, the ayanāṃśa\'s phase and amplitude one dial, the rates too weak', () => {
  const days = [];
  for (let N = dayOf(2026, 3, 1); N < dayOf(2026, 3, 8); N++) days.push(N);
  const moved = { 'sun.epoch': 4, 'ayanamsha.phase': 0.5 };
  const obs = SK.synthesize({ epoch: T0, deltas: moved, seed: 3, shadows: { site: UJJ, days, sigmaVyangula: 0.5 } });
  const all = ['sun.epoch', 'sun.rev', 'moon.epoch', 'moon.rev', 'moonApogee.epoch', 'moonApogee.rev', 'node.epoch', 'node.rev',
    'ayanamsha.phase', 'ayanamsha.amplitude', 'ayanamsha.rate', 'sun.paridhi.even', 'sun.paridhi.odd'];
  const fit = SK.samskara(obs, { epoch: T0, params: all });
  const why = Object.fromEntries(fit.frozen.map((f) => [f.param, f]));
  for (const n of ['moon.epoch', 'moon.rev', 'moonApogee.epoch', 'moonApogee.rev', 'node.epoch', 'node.rev']) {
    assert.equal(why[n].reason, 'unseen', n);
    assert.match(why[n].why, /no observation/);
  }
  assert.equal(fit.free.length, 1, `one combination is seen: ${fit.free}`);
  assert.ok(['weak', 'degenerate'].includes(why['sun.rev'].reason) && ['weak', 'degenerate'].includes(why['ayanamsha.rate'].reason));
  const shared = fit.frozen.filter((f) => f.reason === 'degenerate');
  assert.ok(shared.some((f) => f.direction.some((c) => c.param === 'ayanamsha.phase') && f.direction.some((c) => c.param === 'ayanamsha.amplitude')), 'phase and amplitude move the ayanāṃśa alike');
  for (const f of fit.frozen) assert.equal(fit.params[f.param].delta, 0, `${f.param} is held at the text's value`);
  assert.ok(fit.spectrum.condition > 1e12, `the normal matrix is singular before the freeze (condition ${fit.spectrum.condition})`);
  // what is seen is the sāyana Sun: the one free dial reproduces the moved sky within the shadows' resolution
  const Mt = SK.model(moved, { epoch: T0 }), Mf = SK.model(fit.deltas, { epoch: T0 });
  const t = days[3] + 0.5, d = Math.abs(w180(Mf.sayanaSun(t) - Mt.sayanaSun(t))) * 60;
  assert.ok(d < 8, `sāyana Sun within ${d.toFixed(2)}′ (moved by ${(Math.abs(w180(Mt.sayanaSun(t) - SK.model({}, { epoch: T0 }).sayanaSun(t))) * 60).toFixed(1)}′)`);
  assert.ok(fit.residuals.after.rms['vyaṅgula'].rms < 1 && fit.residuals.before.rms['vyaṅgula'].rms > 1);
  // twelve years of shadows still cannot see the Moon's apogee; two eclipses in a season see the Moon's place, not the rates
  const years = [];
  for (let N = T0 - 6 * 365; N < T0 + 6 * 365; N += 30) years.push(N);
  const fy = SK.samskara(SK.synthesize({ epoch: T0, deltas: moved, seed: 3, shadows: { site: UJJ, days: years, sigmaVyangula: 0.5 } }), { epoch: T0, params: ['sun.epoch', 'moonApogee.epoch', 'moonApogee.rev'], bija: false });
  assert.deepEqual(fy.frozen.map((f) => [f.param, f.reason]), [['moonApogee.epoch', 'unseen'], ['moonApogee.rev', 'unseen']]);
  const season = SK.synthesize({ epoch: T0, deltas: { 'moon.epoch': -10 }, seed: 5, eclipses: { from: T0, to: T0 + 400, sigmaVinadi: 1 } });
  const fs2 = SK.samskara(season, { epoch: T0, params: ['moon.epoch', 'moon.rev', 'moonApogee.rev', 'node.epoch', 'node.rev'], bija: false });
  const fz = fs2.frozen.map((f) => f.param);
  assert.ok(fz.includes('moonApogee.rev') && fz.includes('node.rev') && fs2.free.includes('moon.epoch'), JSON.stringify(fs2.frozen.map((f) => [f.param, f.reason])));
  assert.ok(Math.abs(fs2.params['moon.epoch'].delta + 10) < 3.5 * fs2.params['moon.epoch'].sigma);
});

test('[synthetic, theorem] the whole-number bīja (§7.9, recommended): integer revolutions, the wheel closed exactly, the chain of SS 1.34-1.39 integral; Kaṭapayādi and the verses\' own bhūtasaṅkhyā words', () => {
  const { fit } = loop(true);
  const W = fit.bija.whole;
  assert.equal(fit.bija.recommended, 'whole');
  const Y = S.YUGA_DAYS * S.SPD;
  for (const [body, x] of Object.entries(W.bodies)) {
    assert.equal(typeof x.corrected, 'bigint');
    assert.equal(x.deltaWhole, BigInt(Math.round(x.deltaFitted)));
    assert.equal(x.corrected, S.REV[body] + x.deltaWhole);
    for (const Sp of [0n, BigInt(T0) * S.SPD + 123456789n, 999999999999999n]) {
      const a = SK.wholeMeanArcsec('surya', body, x.corrected, x.dhruvaArcsec, Sp), b = SK.wholeMeanArcsec('surya', body, x.corrected, x.dhruvaArcsec, Sp + 7n * Y);
      assert.ok(ratEq(a, b), `${body}: after seven yugas the corrected place returns exactly`);
    }
    // the exact form is the re-fitted model (the dhruva rounded to a whole vikalā: within half a second)
    const Mr = SK.model(W.refit.deltas, { epoch: T0 });
    for (const t of [T0 - 3000, T0, T0 + 5000]) {
      const ex = SK.wholeMeanArcsec('surya', body, x.corrected, x.dhruvaArcsec, BigInt(t) * S.SPD);
      const d = Math.abs(w180(Number(ex.num) / Number(ex.den) / 3600 - Mr.mean(t)[body])) * 3600;
      assert.ok(d < 0.51, `${body} at ${t}: ${d.toFixed(3)}″`);
    }
    assert.ok(x.memory.revolutions.checked && KP.decodeWord(x.memory.revolutions.devanagari).value === x.corrected);
    assert.ok(x.memory.dhruvaVikala.checked);
    assert.ok(!x.determined && /dhruva absorbs/.test(x.why), `${body}: twelve to forty years leave the integer to the dhruva (σ ${x.sigma.toFixed(2)})`);
  }
  // the chain: every count an integer, and the identities hold; with nothing changed it is kala-dvara.js's own
  const c = W.chain;
  for (const v of Object.values(c)) assert.equal(typeof v, 'bigint');
  assert.equal(c.risings - c.sun, c.civilDays);
  assert.equal(c.tithi - c.civilDays, c.tithiksaya);
  assert.equal(c.lunarMonths, c.moon - c.sun);
  const m = K.mana('surya'), c0 = SK.chainOf(SK.CANONS.surya, S.REV.sun, S.REV.moon);
  assert.deepEqual([c0.risings, c0.lunarMonths, c0.adhimasa, c0.tithi, c0.tithiksaya], [m.nakshatra, m.candraMasa, m.adhimasa, m.tithi, m.tithiksaya]);
  // unchanged integers and no dhruva give the text's own places exactly
  const t = BigInt(T0) * S.SPD, md = S.madhyama(t);
  for (const b of SK.BODIES) { const x = SK.wholeMeanArcsec('surya', b, S.REV[b], 0n, t); assert.ok(Math.abs(w180(Number(x.num) / Number(x.den) / 3600 - md[b])) < 1e-9, b); }
  // holding the rates at whole numbers costs nothing the data can see
  assert.ok(Math.abs(W.refit.chi2PerDof - fit.chi2PerDof) < 0.05 * fit.chi2PerDof, `${W.refit.chi2PerDof} against ${fit.chi2PerDof}`);
  // the memory layer: Kaṭapayādi (katapayadi.js), and bhūtasaṅkhyā from the Sūrya-Siddhānta's own numeral words
  const lex = SK.lexiconFromVerses(numbers);
  for (let d = 0; d <= 9; d++) assert.ok(lex[d].length > 0, `the verses give a word for ${d}`);
  for (const [body, x] of Object.entries(W.bodies)) {
    const w = SK.bhutasankhya(x.corrected, lex);
    assert.equal(bhuta(w.values), Number(x.corrected), `${body}: ${w.words}`);
    for (const word of w.words.split('-')) assert.ok(numbers.verses.some((v) => v.items.some((it) => it.words.split('-').includes(word))), `${word} is a word of the verses`);
  }
  assert.equal(SK.bhutasankhya(4320000n, lex).values.join(','), '0,0,0,0,2,3,4');
});

test('[synthetic, theorem] the Śakābda form reproduces parahita-madhyama.js: from the Parahita places on Āryabhaṭa\'s integers the solver finds 9/85·4/5, 65/134 and 13/32·11/12 from Śaka 444 — and the wheel opens', () => {
  const GEN = 'parahita-madhyama.js parahitaArcsec (Āryabhaṭa\'s integers + the Śakābda rule + Parameśvara\'s fractions) — synthetic, not an observation';
  const obs = [];
  for (let A = 1600000; A <= 1700000; A += 2500) for (const b of SK.BODIES) {
    const x = PM.parahitaArcsec(b === 'moonApogee' ? 'apogee' : b, BigInt(A) * PM.SPD);
    obs.push({ id: `${b}-${A}`, kind: 'madhyama', body: b, t: A, lambda: Number(x.num * 1000000000000n / x.den) / 1e12 / 3600, sigma: 0.001, synthetic: true, generator: GEN });
  }
  const AT = 1651700;                                                                       // Parameśvara's epoch [text JM p.34]
  const fit = SK.samskara(obs, { canon: 'aryabhata', epoch: AT });
  assert.equal(fit.frozen.length, 0);
  const sak = fit.bija.sakabda;
  assert.ok(sak.sun.none, 'the Sun gets none');
  const want = { moon: ['moon', 36n, 425n], moonApogee: ['apogee', 65n, 134n], node: ['node', 143n, 384n] };
  for (const [b, [pmb, mul, div]] of Object.entries(want)) {
    const f = sak[b], r = PM.SAKABDA[pmb];
    assert.deepEqual([f.mul, f.div], [mul, div], b);
    assert.equal(f.mul * r.div * r.fraction[1], f.div * r.mul * r.fraction[0], `${b}: the verse's numbers with Parameśvara's fraction`);
    assert.equal(f.zeroYear, 444n, `${b}: zero at Śaka 444 (vāgbhāva)`);
    const form = { canon: 'aryabhata', mul: f.mul, div: f.div, zeroYear: f.zeroYear };
    for (const Sp of [0n, BigInt(AT) * PM.SPD, BigInt(AT) * PM.SPD + 98765432101n, 2000000n * PM.SPD]) {
      assert.ok(ratEq(SK.sakabdaMinutes(form, Sp), PM.sakabdaMinutes(pmb, Sp)), `${b}: the minutes, exactly`);
      assert.ok(ratEq(SK.sakabdaArcsec(form, b, Sp), PM.parahitaArcsec(pmb, Sp)), `${b}: the place, exactly`);
    }
    const rpy = PM.sakabdaRevPerYuga(pmb);
    assert.ok(ratEq({ num: f.revPerYuga.num < 0n ? -f.revPerYuga.num : f.revPerYuga.num, den: f.revPerYuga.den }, rpy), `${b}: ${f.revPerYuga.num}/${f.revPerYuga.den} a yuga`);
    // the wheel opens: after one yuga the correction is not a whole number of revolutions
    const Y = PM.YUGA_DAYS * PM.SPD, a = SK.sakabdaMinutes(form, 0n), z = SK.sakabdaMinutes(form, Y);
    const diff = { num: z.num * a.den - a.num * z.den, den: z.den * a.den };
    assert.notEqual(diff.num % (21600n * diff.den), 0n);
    assert.ok(/open/.test(f.wheel) && f.memory.mul.checked && f.memory.div.checked);
  }
  // the dhruva at his epoch is the Śakābda minutes he took [text, §3.2: 76.15′, 436.08′, 334.78′]
  assert.ok(Math.abs(fit.params['moon.epoch'].delta + 76.15) < 0.01 && Math.abs(fit.params['moonApogee.epoch'].delta + 436.08) < 0.01 && Math.abs(fit.params['node.epoch'].delta + 334.78) < 0.01);
  // the same data in the whole-number form: −17, −97 and +74 (the node counted westward); the data resolve the fractions
  const W = fit.bija.whole.bodies;
  assert.deepEqual([W.moon.deltaWhole, W.moonApogee.deltaWhole, W.node.deltaWhole], [-17n, -97n, 74n]);
  assert.ok(W.moon.fractionSeen && W.node.fractionSeen && !W.moon.determined);
  assert.ok(fit.bija.whole.refit.residuals.arcmin.max < 0.5, `closing the wheel moves the 275 years of places by ≤ ${fit.bija.whole.refit.residuals.arcmin.max.toFixed(3)}′`);
  assert.equal(W.moon.corrected, 57753336n - 17n);
});

test('[synthetic] inequalities: first crescents (SS 10.1) and pūrṇimās without an eclipse (SS 4.11) bound what they cannot measure', () => {
  // the Moon's place moved by 50′: the text then misdates some first evenings at Ujjayinī
  const obs = SK.synthesize({ epoch: T0, deltas: { 'moon.epoch': 50 }, crescents: { site: UJJ, from: T0 - 3 * 365, to: T0 + 3 * 365 } });
  assert.ok(obs.length > 70 && obs.every((o) => o.kind === 'darshana' && o.synthetic));
  const fit = SK.samskara(obs, { epoch: T0, params: ['moon.epoch'] });
  assert.ok(fit.residuals.before.inequalities.violated > 0, 'the text misses some first evenings');
  assert.equal(fit.residuals.after.inequalities.violated, 0);
  const p = fit.params['moon.epoch'];
  assert.ok(p.sigma === null && /inequalities only/.test(p.bounded));
  const iv = SK.feasibleIntervals(obs, 'moon.epoch', { from: -120, to: 120, step: 2, epoch: T0 });
  assert.equal(iv.length, 1);
  assert.ok(iv[0].lo <= 50 && iv[0].hi >= 50 && iv[0].lo > 0, `feasible ${iv[0].lo}…${iv[0].hi}′ holds the truth, not the text`);
  assert.ok(p.delta >= iv[0].lo - 2 && p.delta <= iv[0].hi, `${p.delta}`);
  // eclipses with their near misses: the node moved by 2°; the text sees an eclipse where none was
  const ec = SK.synthesize({ epoch: T0, deltas: { 'node.epoch': 120, 'moon.epoch': -10 }, seed: 5, eclipses: { from: T0 - 10 * 365, to: T0 + 10 * 365, sigmaVinadi: 1, misses: 40 } });
  assert.ok(ec.some((o) => o.kind === 'grahana-abhava'));
  const fe = SK.samskara(ec, { epoch: T0, params: ['node.epoch', 'moon.epoch', 'sun.epoch'] });
  assert.ok(fe.residuals.before.inequalities.violated > 0 && fe.residuals.after.inequalities.violated === 0);
  assert.ok(Math.abs(pull(fe.params['node.epoch'], 120)) < 3.5 && Math.abs(pull(fe.params['moon.epoch'], -10)) < 3.5);
});

test('[synthetic] one moment per record, as a ledger writes them: single contacts, the middle alone, single evenings, the Moon on a star\'s circle through the dhruva', () => {
  const moved = { 'moon.epoch': -12, 'node.epoch': 20 };
  const paired = SK.synthesize({ epoch: T0, deltas: moved, seed: 9, eclipses: { from: T0 - 8 * 365, to: T0 + 8 * 365, sigmaVinadi: 1, read: false } });
  const split = paired.flatMap((o) => [{ ...o, id: `${o.id}-s`, moksha: undefined }, { ...o, id: `${o.id}-m`, sparsha: undefined }])
    .map((o) => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined)));
  const P = ['moon.epoch', 'node.epoch'];
  const fp = SK.samskara(paired, { epoch: T0, params: P, bija: false }), fsp = SK.samskara(split, { epoch: T0, params: P, bija: false });
  for (const n of P) assert.ok(Math.abs(fp.params[n].delta - fsp.params[n].delta) < 1e-6 && Math.abs(pull(fp.params[n], moved[n])) < 3.5, n);
  // the middle alone carries Moon − Sun; the two places come apart only through the equations of centre (the slope of
  // each equation moves the two columns by a few per cent), so they are nearly one dial: correlated beyond 0.99
  const Mt = SK.model(moved, { epoch: T0 });
  const mid = paired.map((o) => ({ id: `${o.id}-madhya`, kind: 'grahana', madhya: SK.lunarEclipse(Mt, o.sparsha).middle, sigmaVinadi: 1, synthetic: true, generator: o.generator }));
  const fm = SK.samskara(mid, { epoch: T0, params: ['moon.epoch', 'sun.epoch'], bija: false });
  const cv = fm.covariance.matrix, corr = cv[0][1] / Math.sqrt(cv[0][0] * cv[1][1]), sDiff = Math.sqrt(cv[0][0] + cv[1][1] - 2 * cv[0][1]);
  assert.ok(corr > 0.99 && sDiff < 0.1 * Math.sqrt(cv[0][0]), `correlation ${corr.toFixed(4)}; σ(Moon − Sun) ${sDiff.toFixed(3)}′ against σ(Moon) ${Math.sqrt(cv[0][0]).toFixed(3)}′`);
  assert.ok(Math.abs(fm.deltas['moon.epoch'] - fm.deltas['sun.epoch'] - moved['moon.epoch']) < 0.01, 'the elongation comes back');
  // the first evening as two single evenings (seen on N, not seen on N − 1) is the same constraint
  const first = SK.synthesize({ epoch: T0, deltas: { 'moon.epoch': 50 }, crescents: { site: UJJ, from: T0 - 2 * 365, to: T0 + 2 * 365 } });
  const single = first.flatMap((o) => [{ ...o, id: `${o.id}-y`, seen: true }, { ...o, id: `${o.id}-n`, N: o.N - 1, seen: false }]);
  const f1 = SK.samskara(first, { epoch: T0, params: ['moon.epoch'], bija: false }), f2 = SK.samskara(single, { epoch: T0, params: ['moon.epoch'], bija: false });
  assert.ok(f2.residuals.after.inequalities.violated === 0 && Math.abs(f1.deltas['moon.epoch'] - f2.deltas['moon.epoch']) < 1e-6);
  // a Moon–star conjunction judged by the dhruvaka (SS 8.14-8.15): the polar place; read as an ecliptic place it misleads
  const pol = [], Mm = SK.model({ 'moon.epoch': moved['moon.epoch'] }, { epoch: T0 });
  for (let i = 0; i < 40; i++) {
    const t = T0 - 600 + i * 31.3, p = Mm.places(t), A = Mm.ayanamsha(t);
    const polar = mod(p.moon - p.latitude * require('./ss-udaya.js').kranti(p.moon + A + 90) / 3600, 360);
    pol.push({ id: `yoga-${i}`, kind: 'candra', polar: true, t, lambda: polar, sigma: 0.5, synthetic: true, generator: 'samskara.test.js: the moved model\'s polar Moon — synthetic, not an observation' });
  }
  const fpol = SK.samskara(pol, { epoch: T0, params: ['moon.epoch'], bija: false });
  assert.ok(Math.abs(fpol.params['moon.epoch'].delta - moved['moon.epoch']) < 1e-6);
  const fecl = SK.samskara(pol.map((o) => { const { polar, ...rest } = o; return rest; }), { epoch: T0, params: ['moon.epoch'], bija: false });
  assert.ok(fecl.chi2PerDof > 100, `ecliptic reading of polar places: χ²/dof ${fecl.chi2PerDof.toFixed(0)}`);
});

test('[synthetic] the five planets: Jupiter\'s and Saturn\'s revolutions and places from fourteen years of longitudes (± 3′)', () => {
  const moved = { 'jupiter.rev': 40, 'jupiter.epoch': -25, 'saturn.rev': -30, 'saturn.epoch': 15 };
  const days = [];
  for (let N = T0 - 7 * 365; N < T0 + 7 * 365; N += 30) days.push(N);
  const obs = SK.synthesize({ epoch: T0, deltas: moved, seed: 12, planets: { names: ['jupiter', 'saturn'], days, sigmaArcmin: 3 } });
  const fit = SK.samskara(obs, { epoch: T0, params: Object.keys(moved) });
  for (const [n, truth] of Object.entries(moved)) assert.ok(Math.abs(pull(fit.params[n], truth)) < 3.5, `${n}: ${fit.params[n].delta} ± ${fit.params[n].sigma}`);
  assert.ok(fit.chi2PerDof > 0.7 && fit.chi2PerDof < 1.3);
  assert.equal(fit.bija.whole.bodies.jupiter.corrected, GR.PLANETS.jupiter.rev + fit.bija.whole.bodies.jupiter.deltaWhole);
  // Mercury's .rev is its śīghrocca's (SS 1.29): moving it moves Mercury, never Mars
  const M0 = SK.model({}, { epoch: T0 }), M1 = SK.model({ 'mercury.rev': 1000 }, { epoch: T0 });
  assert.ok(Math.abs(w180(M1.planet('mercury', T0 + 900) - M0.planet('mercury', T0 + 900))) > 1e-3 && M1.planet('mars', T0 + 900) === M0.planet('mars', T0 + 900));
});

test('[FRAME] samskara.js is sovereign: it requires only the sovereign files, names no modern source, has no trigonometry; records must be the owner\'s units, and synthetic ones say so', () => {
  const text = fs.readFileSync(path.join(__dirname, 'samskara.js'), 'utf8');
  const FORBIDDEN = /\b(?:DE4\d\d|VSOP\d*|ELP\d*|Swiss|swisseph|Gaia|IERS|DrikTier)\b|finals\.all|DeltaT|astronomy-engine/;
  assert.equal(FORBIDDEN.test(text), false);
  assert.equal(/\bimport\s/.test(text), false);
  const ROOTS = ['katapayadi.js', 'kala-dvara.js', 'parahita-madhyama.js', 'dhruva.js', 'sphuta.js', 'radau.js'];
  const LAYERS = ['panchanga.js', 'dasha.js', 'muhurta.js', 'utsava.js', 'gurutva.js', 'gurutva-candra.js', 'spanda-ganita.js', 'ss-udaya.js', 'ss-graha.js', 'ss-chaya.js', 'ss-grahana.js', 'ss-drishya.js', 'vedha-lekha.js'];
  const allowed = new Set([...ROOTS, ...LAYERS].map((f) => './' + f));
  const reqs = [...text.matchAll(/\brequire\s*\(\s*["']([^"']+)["']\s*\)/g)].map((m) => m[1]);
  assert.ok(reqs.length > 0 && reqs.every((r) => allowed.has(r)), reqs.join(', '));
  assert.equal(/Math\.(?:sin|cos|tan|asin|acos|atan|atan2)\b/.test(text), false, 'the text\'s sine table, and Jacobi without angles');
  // records: only the owner's fields; a synthetic record must name its generator; a mix is reported as synthetic
  const ok = SK.synthesize({ epoch: T0, deltas: { 'sun.epoch': 2 }, seed: 1, shadows: { site: UJJ, days: [T0, T0 + 30, T0 + 60] } });
  assert.equal(SK.samskara(ok, { epoch: T0, params: ['sun.epoch'], bija: false }).tag, '[synthetic]');
  const bad = (mutate) => { const r = JSON.parse(JSON.stringify(ok)); mutate(r); return () => SK.samskara(r, { epoch: T0, params: ['sun.epoch'] }); };
  assert.throws(bad((r) => { r[0].utc = '2026-01-01T06:30:00Z'; }), /field "utc"/);
  assert.throws(bad((r) => { r[0].ra = 1; }), /field "ra"/);
  assert.throws(bad((r) => { r[1].jd = 2461000.5; }), /field "jd"/);
  assert.throws(bad((r) => { delete r[0].generator; }), /synthetic and must say/);
  assert.throws(bad((r) => { r[1].id = r[0].id; }), /twice/);
  assert.throws(bad((r) => { r[0].kind = 'gps'; }), /unknown kind/);
  assert.throws(() => SK.samskara(ok, { epoch: T0, params: ['sun.epoch', 'moon.wobble'] }), /unknown parameter/);
  assert.throws(() => SK.samskara(ok, { canon: 'aryabhata', epoch: T0 }), /madhyama observations only/);
  // the owner's shadow file (ss-chaya.js, vedha-chaya/1) enters as the same noon-shadow equations
  const file = { format: C.FORMAT, site: { name: 'Ujjayinī (synthetic)', deshantara: 0, latitude: 23.18 }, records: ok.map((o) => ({ id: o.id, kind: 'madhyahna', day: o.day, chaya: o.chaya, dir: o.dir, ayana: o.ayana, synthetic: true, generator: o.generator })) };
  const fromFile = SK.fromVedha(file);
  const a = SK.samskara(fromFile, { epoch: T0, params: ['sun.epoch'], bija: false }), b = SK.samskara(ok, { epoch: T0, params: ['sun.epoch'], bija: false });
  assert.ok(Math.abs(a.params['sun.epoch'].delta - b.params['sun.epoch'].delta) < 1e-6 && a.tag === '[synthetic]');
  // a kapāla reading of the turn is read through kala-dvara.js: 30 ghaṭīs of the turn are less than half a civil day
  const half = SK.daysOf({ kali: T0, kapala: { ghati: 30 }, calibration: 'nakshatra' }, 'x');
  assert.ok(Math.abs((half - T0) - 0.5 * 1577917828 / 1582237828) < 5e-10, 'to the float spacing of a Kali day near 1.87 million (2.3e-10 d)');
});

// ── the default path (design §4.5) and the owner's ledger ────────────────────────────────────────────
const V = require('./vedha-lekha.js');
const CAT = JSON.parse(fs.readFileSync(path.join(__dirname, 'corpus', 'surya-siddhanta', 'yogatara.json'), 'utf8'));
const DSTARS = D.starsOf(CAT);
const FOUR = DSTARS.filter((s) => ['Citrā', 'Revatī', 'Maghā', 'Rohiṇī'].includes(s.name)).map((s) => ({ name: s.name, lambda: s.dhruvaka }));

test('[measured §4.5] the default path: the median residual of each body, in whole kalā, at the epoch — the moved dhruvas come back; one wild record does not move it, and moves the least-squares fit', () => {
  const obs = SK.synthesize({ epoch: T0, deltas: { 'sun.epoch': 4, 'moon.epoch': -12 }, seed: 7,
    shadows: { site: UJJ, days: Array.from({ length: 60 }, (_, i) => T0 - 400 + i * 13), sigmaVyangula: 0.5, round: true },
    moonStars: { from: T0 - 2 * 365, to: T0 + 2 * 365, stars: FOUR, sigmaVinadi: 2 },
    eclipses: { from: T0 - 6 * 365, to: T0 + 6 * 365, sigmaVinadi: 1, site: UJJ, nightOnly: true } });
  const r = SK.correct(obs, { method: 'median', epoch: T0 });
  assert.equal(r.method, 'median'); assert.equal(r.tag, '[synthetic]');
  assert.equal(r.bodies.moon.dhruvaKala, -12);
  assert.ok(Math.abs(r.bodies.sun.medianArcmin - 4) < 3 * r.bodies.sun.sigmaArcmin, `Sun ${r.bodies.sun.medianArcmin} ± ${r.bodies.sun.sigmaArcmin}: noon shadows read to the vyaṅgula`);
  assert.ok(r.unused.every((u) => /solstice|inequality|one contact/.test(u.why)));
  assert.equal(r.bodies.moon.rate.determined, false, 'four years: no rate (§4.5 wants ten)');
  // one record 300′ off
  const wild = obs.map((o) => (o.kind === 'candra' && o.id === obs.find((x) => x.kind === 'candra').id ? { ...o, lambda: o.lambda + 5 } : o));
  const a = SK.correct(wild, { method: 'median', epoch: T0 }).bodies.moon.medianArcmin, b = r.bodies.moon.medianArcmin;
  const p = ['sun.epoch', 'moon.epoch'], f0 = SK.correct(obs, { method: 'lsq', epoch: T0, params: p, bija: false }), f1 = SK.correct(wild, { method: 'lsq', epoch: T0, params: p, bija: false });
  const d = (f) => f.params['moon.epoch'].delta;
  assert.ok(Math.abs(a - b) < 0.05, `median moved ${a - b}′`);
  assert.ok(Math.abs(d(f1) - d(f0)) > 10 * Math.abs(a - b), `least squares moved ${d(f1) - d(f0)}′`);
  assert.throws(() => SK.correct(obs, { method: 'mean' }), RangeError);
});

test('[measured §4.5] a rate only from two epochs at least ten years apart: the Moon\'s Δbhagaṇa comes back as a whole number of revolutions, with its Śakābda form and zero year', () => {
  const obs = SK.synthesize({ epoch: T0, deltas: { 'moon.rev': 250, 'moon.epoch': -12 }, seed: 11,
    moonStars: { from: T0 - 11 * 365, to: T0 + 11 * 365, stars: FOUR, sigmaVinadi: 2 } });
  const m = SK.dhruvaMedian(obs, { epoch: T0 }).bodies.moon;
  assert.equal(m.dhruvaKala, -12);
  assert.ok(m.rate.wholeBhaganaDelta > 220 && m.rate.wholeBhaganaDelta < 280, `${m.rate.revolutionsPerYuga}`);
  assert.ok(Number.isInteger(m.rate.wholeBhaganaDelta) && m.rate.closesWheel);
  const perYear = m.rate.sakabda.minutesSubtractedPerYear;
  assert.ok(perYear.div > 0 && Math.abs(-perYear.mul / perYear.div - m.rate.arcminPerDay * Number(S.YUGA_DAYS) / 4320000) < 3 * m.rate.sigmaArcminPerDay * Number(S.YUGA_DAYS) / 4320000 + 1e-9);
  const rateTrue = 250 * 21600 / Number(S.YUGA_DAYS);                               // arcmin a day
  assert.ok(Math.abs(m.rate.sakabda.zeroKaliDay - (T0 + 12 / rateTrue)) < 2 * 365, `zero day ${m.rate.sakabda.zeroKaliDay - T0} after the epoch; −12′ is undone by the moved rate after ${12 / rateTrue} days`);
});

test('[the owner\'s ledger] fromLedger: a certified vedha-lekha/1 file becomes saṃskāra observations — the lunar contacts one grahana, the evening crescent a darshana, the Moon on a junction star a polar candra at its dhruvaka; transits and solar contacts are named as not used', () => {
  const GEN = 'samskara.test.js: a ledger made from the text\'s own predictions, the bowl read 2 vināḍī late (SYNTHETIC)';
  const site = { latitude: 23.18, deshantara: 0 }, MS = (() => { const p = V.placeOf(site); return { latitude: p.latitude, deshantara: p.deshantara, palabha: p.palabha }; })();
  const lunar = GH.eclipsesBetween(dayOf(2027, 2, 1), dayOf(2027, 3, 1), MS).find((e) => e.kind === 'lunar');
  let NL = Math.floor(lunar.contacts.sparsha); while (V.sunriseAt(NL, MS) > lunar.contacts.sparsha) NL--;
  const late = 12;                                                                   // 2 vināḍī = 12 asus of the turn
  let l = V.create({ site });
  const yuti = (() => { for (let N = dayOf(2026, 11, 1); ; N++) { for (const s of DSTARS.slice(0, 27)) { const p = V.predictYuti(N, s, MS); if (p.t !== null) return { N, s, p }; } } })();
  l = V.append(l, { id: 'yoga', kind: 'candra-yoga', day: { kali: yuti.N }, star: yuti.s.name, kapala: V.kapalaOfAsus(yuti.p.sinceSunriseAsus + late), synthetic: true, generator: GEN }, { at: yuti.N + 1 });
  l = V.append(l, { id: 'star', kind: 'yamyottara', day: { kali: yuti.N }, star: 'Citrā', kapala: { ghati: 40 }, synthetic: true, generator: GEN }, { at: yuti.N + 1 });
  for (const c of ['sparsha', 'madhya', 'moksha']) {
    const p = V.predictContact(NL, 'candra', c, MS);
    l = V.append(l, { id: `c-${c}`, kind: 'grahana', day: { kali: NL }, body: 'candra', contact: c, kapala: V.kapalaOfAsus(p.sinceSunriseAsus + late), synthetic: true, generator: GEN }, { at: NL + 1 });
  }
  l = V.append(l, { id: 'cres', kind: 'candra-darshana', day: { kali: NL + 16 }, seen: true, synthetic: true, generator: GEN }, { at: NL + 17 });
  assert.throws(() => SK.fromLedger(l, { catalogue: CAT }), /not certified/, 'synthetic records need allowSynthetic');
  const r = SK.fromLedger(V.seal(l), { catalogue: CAT, allowSynthetic: true });
  assert.equal(r.tag, '[synthetic]');
  const by = Object.fromEntries(r.observations.map((o) => [o.kind, o]));
  const days = 12 * Number(K.mana('surya').savana) / Number(K.mana('surya').nakshatra) / 21600;
  for (const c of ['sparsha', 'madhya', 'moksha']) assert.ok(Math.abs(by.grahana[c] - (V.predictContact(NL, 'candra', c, MS).t + days)) < 1e-9, c);
  assert.ok(by.candra.polar && by.candra.lambda === yuti.s.dhruvaka && Math.abs(by.candra.t - (yuti.p.t + days)) < 1e-9);
  assert.deepEqual([by.darshana.N, by.darshana.seen], [NL + 16, true]);
  assert.deepEqual(r.skipped.map((x) => x.id), ['star']);
  // the median path reads the late bowl as a Moon behind the text's: 2 vināḍī × its motion, about 0.4′
  const m = SK.correct(r.observations, { method: 'median', epoch: NL });
  assert.ok(m.bodies.moon.medianArcmin < -0.25 && m.bodies.moon.medianArcmin > -0.6, `${m.bodies.moon.medianArcmin}`);
});

test('[decision 37] the corrected chain keeps the star-risings (the turn is the clock): a Sun bīja changes the civil days; "civil" keeps the days and moves the risings; with the text\'s revolutions both are the text\'s chain', () => {
  const m = K.mana('surya'), C = SK.CANONS.surya;
  for (const keep of ['risings', 'civil']) {
    const c0 = SK.chainOf(C, S.REV.sun, S.REV.moon, keep);
    assert.deepEqual([c0.civilDays, c0.risings, c0.tithiksaya], [m.savana, m.nakshatra, m.tithiksaya], keep);
  }
  const r = SK.chainOf(C, S.REV.sun + 7n, S.REV.moon), c = SK.chainOf(C, S.REV.sun + 7n, S.REV.moon, 'civil');
  assert.equal(r.keep, 'risings'); assert.equal(r.risings, m.nakshatra); assert.equal(r.civilDays, m.savana - 7n);
  assert.equal(c.civilDays, m.savana); assert.equal(c.risings, m.nakshatra + 7n);
  for (const x of [r, c]) { assert.equal(x.risings - x.sun, x.civilDays); assert.equal(x.tithi - x.civilDays, x.tithiksaya); }
  assert.throws(() => SK.chainOf(C, S.REV.sun, S.REV.moon, 'both'), RangeError);
});

test('[decision 36] the default correction is robust: every record used as the fit uses it, and one wild record set aside and named — the clean fit comes back', () => {
  const obs = SK.synthesize({ epoch: T0, deltas: { 'sun.epoch': 4, 'moon.epoch': -12 }, seed: 7,
    moonStars: { from: T0 - 2 * 365, to: T0 + 2 * 365, stars: FOUR, sigmaVinadi: 2 },
    eclipses: { from: T0 - 6 * 365, to: T0 + 6 * 365, sigmaVinadi: 1, site: UJJ, nightOnly: true } });
  const id = obs.find((x) => x.kind === 'candra').id, wild = obs.map((o) => (o.id === id ? { ...o, lambda: o.lambda + 5 } : o));
  const p = ['sun.epoch', 'moon.epoch'];
  const clean = SK.correct(obs.filter((o) => o.id !== id), { method: 'lsq', epoch: T0, params: p, bija: false });   // the same records, the wild one left out
  const r = SK.correct(wild, { epoch: T0, params: p, bija: false });
  assert.equal(r.method, 'robust');
  assert.deepEqual(r.rejected.map((x) => x.id), [id], 'the wild record, and only it');
  assert.ok(r.rejected[0].normalized > 50);
  const d = r.params['moon.epoch'].delta - clean.params['moon.epoch'].delta;
  assert.ok(Math.abs(d) < 1e-9, `the clean fit comes back (${d})`);
  assert.ok(Math.abs(r.params['moon.epoch'].delta + 12) < 3 * r.params['moon.epoch'].sigma);
  assert.equal(SK.correct(obs, { epoch: T0, params: p, bija: false }).rejected.length, 0, 'nothing set aside from clean records');
});

test('[synthetic, council KH-03] solar contacts enter the fit: at the text\'s values the model gives ss-grahana\'s contacts, and a moved Moon and node come back from them', () => {
  const site = { latitude: 23.18, deshantara: 0 };
  const sols = GH.eclipsesBetween(dayOf(2026, 1, 1), dayOf(2040, 1, 1), site).filter((e) => e.kind === 'solar' && e.contacts.sparsha !== null && e.contacts.moksha !== null);
  assert.ok(sols.length >= 5, `${sols.length} solar eclipses`);
  const X0 = SK.solarEclipseOnModel(SK.model({}, { epoch: T0 }), sols[0].middle, site);
  for (const c of ['sparsha', 'madhya', 'moksha']) assert.ok(Math.abs(X0.at(c) - sols[0].contacts[c]) < 1e-9, c);
  const moved = { 'moon.epoch': 3, 'node.epoch': -30 }, Mt = SK.model(moved, { epoch: T0 });
  const GEN = 'samskara.test.js: the text\'s solar eclipses on a moved model (SYNTHETIC)';
  const obs = sols.map((E) => { const X = SK.solarEclipseOnModel(Mt, E.middle, site);
    return { id: `s-${Math.round(E.middle)}`, kind: 'grahana-surya', site, near: E.middle, sparsha: X.at('sparsha'), moksha: X.at('moksha'), sigmaVinadi: 1, synthetic: true, generator: GEN }; });
  const f = SK.samskara(obs, { epoch: T0, params: ['moon.epoch', 'node.epoch'], bija: false });
  for (const n of Object.keys(moved)) assert.ok(Math.abs(f.params[n].delta - moved[n]) < 0.05 * Math.abs(moved[n]) + 0.05, `${n}: ${f.params[n].delta} against ${moved[n]}`);
});

test('[council KH-03] an eclipse seen or not seen, untimed, is an inequality on 6.13\'s limit; at the text\'s values its sign is the text\'s own verdict', () => {
  const site = { latitude: 23.18, deshantara: 0 };
  const list = GH.eclipsesBetween(dayOf(2026, 1, 1), dayOf(2031, 1, 1), site);
  for (const E of list) {
    const body = E.kind === 'lunar' ? 'candra' : 'surya';
    for (const seen of [true, false]) {
      const o = { id: `d-${Math.round(E.middle)}-${seen}`, kind: 'grahana-drishta', body, near: E.middle, seen, ...(body === 'surya' ? { site } : {}) };
      const f = SK.samskara([o], { epoch: T0, params: ['node.epoch'], bija: false, freezeAbove: Infinity });
      const v = f.residuals.before.inequalities.violated;
      assert.equal(v === 0, seen === E.perceptible.seen, `${E.kind} ${E.middle.toFixed(2)} seen=${seen}: the text says ${E.perceptible.seen}`);
    }
  }
});
