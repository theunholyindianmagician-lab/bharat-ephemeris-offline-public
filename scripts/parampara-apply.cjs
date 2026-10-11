#!/usr/bin/env node
/* scripts/parampara-apply.cjs — apply each paramparā record where it belongs, and measure what it does against the sky.
 *
 * The owner (2026-10-09): "whatever can be applied, apply it where it applies, and see what improves". The sky here is the
 * Modern Bhāratīya (dṛk) tier (siddhanta-tier.js: λ ≤ 0.9″ against DE440s in 1850-2150), compared in the TROPICAL frame
 * (nirayana + each model's own ayanāṃśa), which is the frame-free physical comparison; the sidereal frame is compared
 * separately against Citrā-pakṣa, the convention Indian pañcāṅgas share.
 *
 * Candidates (each a model of samskara.js or parahita-madhyama.js, never a number typed here):
 *   ss              the plain Sūrya-Siddhānta
 *   par             + Parameśvara's Moon and node (corpus/parampara/samskara.json) — the current default
 *   par+ayanPhase   + Parameśvara's 15° (registry PAR-ayanamsha-4536) as a libration-phase shift alone (the morning's default, superseded)
 *   par+ayanAmp     the same single record as an amplitude change alone
 *   par+ayan3       + the libration fitted to the paramparā's THREE determinations (Āryabhaṭa's zero, Nīlakaṇṭha, Parameśvara) on its phase and
 *                   greatest value, as corpus/parampara/samskara.json records it — THE DEFAULT TIER (owner: adopt every improvement the records support)
 *   par+keralaLin   + the Kerala linear ayanāṃśa: 14°26′ at Kali day 1,643,524 and 0.9′ a year (NIL-ayanamsha-rate)
 *   par+sunEpoch    + Parameśvara's epoch Sun (Meṣa 0°15′ at Kali 1,651,700, sunrise at Laṅkā; PAR-epoch-1651700)
 *   kerala          Āryabhaṭa's integers + the Śakābda rule + Parameśvara's fractions (parahita-madhyama.js) for the mean Sun,
 *                   Moon, apogee and node, the text's epicycles on them, the Kerala linear ayanāṃśa
 *   kerala+vakyaMoon the same with the Moon of candravakya.js (canon 'parahita': Mādhava's sine, the 31.5 epicycle [unverified])
 *
 *   node scripts/parampara-apply.cjs            2026 every 5 days, and 1900-2100 every 97 days
 *   node scripts/parampara-apply.cjs --write    the same, written to corpus/research/parampara-apply.json for ganita-shala.html
 */
'use strict';
const path = require('node:path');
const ROOT = path.join(__dirname, '..');
const M = require(path.join(ROOT, 'math-core.js'));
const S = require(path.join(ROOT, 'sphuta.js'));
const SK = require(path.join(ROOT, 'samskara.js'));
const PA = require(path.join(ROOT, 'parahita-madhyama.js'));
const Parampara = require(path.join(ROOT, 'parampara.js'));
const ST = require(path.join(ROOT, 'ss-tier.js'));
const REG = require(path.join(ROOT, 'corpus/parampara/registry.json'));
const SAM = require(path.join(ROOT, 'corpus/parampara/samskara.json'));

const SUNRISE = 0.25;   // Āryabhaṭa's day begins at sunrise at Laṅkā: a quarter day after the text's midnight [reading, as the registry's PAR-epoch assumption]
const LANKA = 75.7885 / 360, KALI_JD = 588465.5, YEAR = S.YUGA_DAYS ? Number(S.YUGA_DAYS) / 4320000 : 365.258756;
const mod = (a, m) => ((a % m) + m) % m;
const wrap = (d) => ((d % 360) + 540) % 360 - 180;
const tOf = (jd) => jd - KALI_JD + LANKA;
const rec = Parampara.load({ registry: REG, samskara: SAM }).samskaraParameshvara();
const base = { 'moon.epoch': rec.moonArcmin, 'node.epoch': rec.nodeArcmin };
if (rec.corrects.includes('moonApogee') && Number.isFinite(rec.moonApogeeArcmin)) base['moonApogee.epoch'] = rec.moonApogeeArcmin;

// ── the ayanāṃśa records ──────────────────────────────────────────────────────────────────────
const PAR_AY = REG.records.find((r) => r.id === 'PAR-ayanamsha-4536'), NIL_AY = REG.records.find((r) => r.id === 'NIL-ayanamsha-rate');
const kaliDayOfYear = (y) => y * YEAR;                                    // Kali years elapsed → civil days (the text's year)
const tAy = kaliDayOfYear(PAR_AY.value.kaliYearsElapsed) + 0.5;
function solve(param, lo, hi) {                                          // the delta of one ayanāṃśa parameter that gives 15° at Kali 4536
  for (let i = 0; i < 60; i++) { const mid = (lo + hi) / 2, v = SK.model({ ...base, [param]: mid }, { epoch: rec.epochKali }).ayanamsha(tAy); if (v < PAR_AY.value.ayanamshaDegrees) lo = mid; else hi = mid; }
  return (lo + hi) / 2;
}
const phase = solve('ayanamsha.phase', -20, 20), amp = solve('ayanamsha.amplitude', -10, 10);
const nilDeg = (() => { const [d, m] = NIL_AY.value.ayanamshaAtTheEclipse.split('°'); return Number(d) + Number(m.replace('′', '')) / 60; })();
const keralaLinear = (t) => nilDeg + 0.9 / 60 * (t - NIL_AY.era.kaliDay) / YEAR;   // 14°26′ + 0.9′ a year [reading, as the record]

// ── Parameśvara's epoch Sun ───────────────────────────────────────────────────────────────────
const PAR_EP = REG.records.find((r) => r.id === 'PAR-epoch-1651700');
const rashiDeg = (s) => { const m = s.match(/^(\S+)\s+(\d+)°(\d+)′/); const R = ['Meṣa', 'Vṛṣa', 'Mithuna', 'Karkaṭa', 'Siṃha', 'Kanyā', 'Tulā', 'Vṛścika', 'Dhanus', 'Makara', 'Kumbha', 'Mīna']; return R.indexOf(m[1]) * 30 + Number(m[2]) + Number(m[3]) / 60; };
const tEp = PAR_EP.era.kaliDay + SUNRISE;                                 // sunrise at Laṅkā (the registry's own assumption), in the text's midnight count
const sunEpochArcmin = wrap(rashiDeg(PAR_EP.value.sun) - S.sphutaAtDays(tEp).mean.sun) * 60;
const SPD = Number(PA.SPD);
const spandasOfDays = (t) => { const a = t - SUNRISE; return BigInt(Math.floor(a)) * PA.SPD + BigInt(Math.round((a - Math.floor(a)) * SPD)); };   // parahita-madhyama counts spandas from that sunrise
const degOf = (x) => Number(x.num * 1000000n / x.den) / 1e6 / 3600;                                           // {num, den} arcseconds → degrees
const parahitaMean = (b, t) => degOf(PA.parahitaArcsec(b, spandasOfDays(t), { parameshvara: true }));
const CV = require(path.join(ROOT, 'candravakya.js'));
const KER = ST.correction('kerala');
/** The Kerala tier's pieces at a JD: the Parahita means, the text's two equations, the true Sun and Moon (sidereal) and the ayanāṃśa. */
function keralaParts(jd) {
  const t = tOf(jd), ayan = KER.ayanamshaAt(t);
  const m = KER.mean(t);                                                     // the tier's own means (Parahita Sun, Moon, apogee, node; the record's Sun apogee) — the candidate IS the tier
  const sunEq = S.mandaPhala(m.sun, m.sunApogee, S.PARIDHI.sun).degrees, moonEq = S.mandaPhala(m.moon, m.moonApogee, S.PARIDHI.moon).degrees;
  return { t, ayan, mean: m, sunEq, moonEq, sun: mod(m.sun + sunEq, 360), moon: mod(m.moon + moonEq, 360) };
}
// ── what the sibling Kerala-corrections file (SSEA / sphuta / web) adds to the Moon, as forms whose amplitudes are MEASURED here ──
// The forms: Munjāla's second correction (Laghumānasa c. 930 CE, the first Indian second inequality — the owner's Moon dossier §3,
// citing Duke; the modern evection has the same argument), the variation and the annual equation (no Indian source — the same
// dossier), and a scale on each manda epicycle (the text's 14° and 32° against the sky). Nothing is typed from the sibling: every
// amplitude is a least-squares fit of the Kerala tier's residual against the dṛk tier over the long span, and is reported as such.
const sinD = (x) => S.jya(x) / S.R;                                              // the text's own sine, as the tier evaluates the forms
const TERMS = {
  dvitiya:   { of: (k) => sinD(2 * (k.mean.moon - k.mean.sun) - (k.mean.moon - k.mean.moonApogee)), body: 'moon', form: 'sin(2(λ☾ − λ☉) − (λ☾ − apogee))', provenance: "Munjāla, Laghumānasa c. 930 CE — the first attested Indian second inequality (the owner's Moon dossier §3, after Duke); not in this library's editions [paramparā, unverified here]; the argument is the evection's" },
  variation: { of: (k) => sinD(2 * (k.mean.moon - k.mean.sun)), body: 'moon', form: 'sin(2(λ☾ − λ☉))', provenance: 'no Indian source (Tycho) — the owner\'s Moon dossier §3 [standard]' },
  annual:    { of: (k) => sinD(k.mean.sun - k.mean.sunApogee), body: 'moon', form: 'sin(λ☉ − apogee☉)', provenance: 'no Indian source (al-Zarqālluh, Tycho) — the owner\'s Moon dossier §3 [standard]' },
  moonManda: { of: (k) => k.moonEq, body: 'moon', form: '× the Moon\'s own manda-phala (a scale on the 32° epicycle)', provenance: 'SS 2.34-2.39 form; the scale measured [measured]' },
  sunManda:  { of: (k) => k.sunEq, body: 'sun', form: '× the Sun\'s own manda-phala (a scale on the 14° epicycle)', provenance: 'SS 2.34-2.39 form; the scale measured [measured]' },
};
/** Least squares of the Kerala tier's residual (tropical, candidate minus dṛk, in degrees) on a constant plus the named terms, over a span. */
function fitTerms(names, body, from, step, n) {
  const cols = names.length + 1, A = Array.from({ length: cols }, () => new Array(cols).fill(0)), b = new Array(cols).fill(0);
  for (let i = 0; i < n; i++) {
    const jd = from + i * step, k = keralaParts(jd), sk = sky(jd);
    const r = wrap((body === 'moon' ? k.moon + k.ayan : k.sun + k.ayan) - (body === 'moon' ? sk.moon : sk.sun));   // the residual the terms must cancel: fitted amplitudes carry the opposite sign
    const x = [1, ...names.map((nm) => TERMS[nm].of(k))];
    for (let p = 0; p < cols; p++) { b[p] += -r * x[p]; for (let q = 0; q < cols; q++) A[p][q] += x[p] * x[q]; }
  }
  for (let p = 0; p < cols; p++) { let piv = p; for (let q = p + 1; q < cols; q++) if (Math.abs(A[q][p]) > Math.abs(A[piv][p])) piv = q; [A[p], A[piv]] = [A[piv], A[p]]; [b[p], b[piv]] = [b[piv], b[p]];
    for (let q = 0; q < cols; q++) if (q !== p) { const f = A[q][p] / A[p][p]; for (let r2 = p; r2 < cols; r2++) A[q][r2] -= f * A[p][r2]; b[q] -= f * b[p]; } }
  const sol = b.map((v, p) => v / A[p][p]);
  return { constantDeg: sol[0], amplitudes: Object.fromEntries(names.map((nm, i) => [nm, sol[i + 1]])) };
}
const FIT_SPAN = 1;                                                                           // fitted on the long span; scored on both
const fitted = (names, body) => fitTerms(names, body, SPANS_FIT[0], SPANS_FIT[1], SPANS_FIT[2]);
const SPANS_FIT = [2415020.5, 97, 753];
/** The Kerala tier's places with given amplitudes of the forms (degrees for the three sines, scales for the two manda terms): the one
 *  formula the tier's `measured` option must reproduce (ss-tier.js placesOf). */
function measuredPlaces(jd, amplitudes) {
  const k = keralaParts(jd); let dm = 0, ds = 0;
  for (const [nm, a] of Object.entries(amplitudes)) { if (!TERMS[nm]) throw new RangeError(`unknown form ${nm}`); if (TERMS[nm].body === 'moon') dm += a * TERMS[nm].of(k); else ds += a * TERMS[nm].of(k); }
  const sun = mod(k.sun + ds, 360), moon = mod(k.moon + dm, 360);
  return { sun: sun + k.ayan, moon: moon + k.ayan, ayan: k.ayan, sid: { sun, moon } };
}
const withTerms = (moonNames, sunNames) => {                                 // the fits run on first use (a test that only needs the formula never pays for them)
  let fm, fs, done = false;
  const fit = () => { if (!done) { fm = moonNames.length ? fitted(moonNames, 'moon') : null; fs = sunNames.length ? fitted(sunNames, 'sun') : null; done = true; } return { moon: fm, sun: fs, moonTerms: moonNames, sunTerms: sunNames }; };
  const fn = (jd) => { const f = fit(); return measuredPlaces(jd, { ...(f.moon ? f.moon.amplitudes : {}), ...(f.sun ? f.sun.amplitudes : {}) }); };
  Object.defineProperty(fn, 'fit', { get: fit, enumerable: true });
  return fn;
};
const MEASURED = {
  'kerala+dvitiya': withTerms(['dvitiya'], []),
  'kerala+dvitiya+var': withTerms(['dvitiya', 'variation'], []),
  'kerala+dvitiya+var+annual': withTerms(['dvitiya', 'variation', 'annual'], []),
  'kerala+manda': withTerms(['moonManda'], ['sunManda']),
  'kerala+all': withTerms(['dvitiya', 'variation', 'annual', 'moonManda'], ['sunManda']),
};
const keralaMoon = (t) => { const a0 = t - SUNRISE, d = Math.floor(a0), a = CV.trueMoon(d, { canon: 'parahita' }).degrees, b = CV.trueMoon(d + 1, { canon: 'parahita' }).degrees; return a + wrap(b - a) * (a0 - d); };   // Mādhava's sine, Āryabhaṭa's 31.5 epicycle [unverified]; linear within the day
const aryaSunAtEpoch = parahitaMean('sun', tEp);
const aryaMoonAtEpoch = parahitaMean('moon', tEp), ssMoonAtEpoch = S.sphutaAtDays(tEp).mean.moon;

// ── candidates: tropical Sun and Moon at jd ───────────────────────────────────────────────────
function textLike(model, ayan) {
  return (jd) => { const t = tOf(jd), p = model ? model.places(t) : S.sphutaAtDays(t), a = ayan ? ayan(t) : (model ? model.ayanamsha(t) : S.ayanamshaSS(S.spandasOfDays(t)));
    return { sun: p.sun + a, moon: p.moon + a, ayan: a, sid: { sun: p.sun, moon: p.moon } }; };
}
const mk = (deltas) => SK.model(deltas, { epoch: rec.epochKali });
const CANDIDATES = {
  'ss': textLike(null),
  'par': textLike(mk(base)),
  'par+ayanPhase': textLike(mk({ ...base, 'ayanamsha.phase': phase })),
  'par+ayanAmp': textLike(mk({ ...base, 'ayanamsha.amplitude': amp })),
  'par+ayan3': textLike(mk({ ...base, 'ayanamsha.phase': rec.ayanamshaPhaseDeg, 'ayanamsha.amplitude': rec.ayanamshaAmplitudeDeg })),
  'par+keralaLin': textLike(mk(base), keralaLinear),
  'par+keralaLin+sunEpoch': textLike(mk({ ...base, 'sun.epoch': sunEpochArcmin }), keralaLinear),
  'kerala': (jd) => { const k = keralaParts(jd); return { sun: k.sun + k.ayan, moon: k.moon + k.ayan, ayan: k.ayan, sid: { sun: k.sun, moon: k.moon } }; },   // Parahita means with the text's epicycles; the line through the three determinations
  'kerala+vakyaMoon': (jd) => { const t = tOf(jd), a = KER.ayanamshaAt(t), m = parahitaMean('sun', t), sunApogee = S.madhyama(S.spandasOfDays(t)).sunApogee;
    const sun = mod(m + S.mandaPhala(m, sunApogee, S.PARIDHI.sun).degrees, 360), moon = keralaMoon(t);
    return { sun: sun + a, moon: moon + a, ayan: a, sid: { sun, moon } }; },
  ...MEASURED,
};
function sky(jd) { const rows = M.tierGrahaRows(jd, 'drik'), a = M.tierAyanamsha(jd, 'drik').deg, s = rows.find((r) => r.key === 'surya').longitude, m = rows.find((r) => r.key === 'candra').longitude; return { sun: s + a, moon: m + a, ayan: a, sid: { sun: s, moon: m } }; }
function score(name, from, step, n) {
  const d = { sun: [], moon: [], el: [], ay: [] };
  for (let i = 0; i < n; i++) { const jd = from + i * step, k = sky(jd), c = CANDIDATES[name](jd);
    d.sun.push(wrap(c.sun - k.sun) * 60); d.moon.push(wrap(c.moon - k.moon) * 60); d.el.push(wrap((c.moon - c.sun) - (k.moon - k.sun)) * 60); d.ay.push((c.ayan - k.ayan) * 60); }
  const st = (a) => { const mean = a.reduce((x, y) => x + y) / a.length, rms = Math.sqrt(a.reduce((x, y) => x + y * y, 0) / a.length); return { mean, rms, max: Math.max(...a.map(Math.abs)) }; };
  return { sun: st(d.sun), moon: st(d.moon), el: st(d.el), ay: st(d.ay) };
}
const SPANS = [['2026, every 5 days', 2461041.5, 5, 73], ['1900-2100, every 97 days', 2415020.5, 97, 753]];
/** The whole measurement as data (the page shows it with this provenance). */
function result() {
  const spans = SPANS.map(([title, from, step, n]) => ({ title, fromJd: from, stepDays: step, samples: n, rows: Object.keys(CANDIDATES).map((name) => ({ name, ...score(name, from, step, n) })) }));
  return { generatedBy: 'node scripts/parampara-apply.cjs --write', frame: 'candidate minus the Modern Bhāratīya (dṛk) tier in the tropical frame (each candidate with its own ayanāṃśa); the ayanāṃśa column is candidate minus Citrā-pakṣa', unit: 'arcminutes',
    record: { moonArcmin: rec.moonArcmin, nodeArcmin: rec.nodeArcmin, epochKali: rec.epochKali }, phaseDeg: phase, amplitudeDeg: amp, keralaLinear2026: keralaLinear(tOf(2461322.5)), citra2026: M.tierAyanamsha(2461322.5, 'drik').deg,
    sunEpochArcmin, aryaSunAtEpoch, parameshvaraMoonDeg: rashiDeg(PAR_EP.value.moon), parahitaMoonAtEpoch: aryaMoonAtEpoch, textMoonAtEpoch: ssMoonAtEpoch,
    measured: { fittedOn: '1900-2100, every 97 days (753 samples); the 2026 span lies inside it', method: 'least squares of the Kerala tier\'s tropical residual against the dṛk tier on a constant plus the terms; the constant (the ayanāṃśa\'s business) is not applied',
      terms: Object.fromEntries(Object.entries(TERMS).map(([k, v]) => [k, { form: v.form, body: v.body, provenance: v.provenance }])),
      candidates: Object.fromEntries(Object.entries(MEASURED).map(([k, fn]) => [k, { moonTerms: fn.fit.moonTerms, sunTerms: fn.fit.sunTerms, moonFit: fn.fit.moon, sunFit: fn.fit.sun }])) },
    candidates: { ss: 'the plain Sūrya-Siddhānta', par: "+ Parameśvara's Moon and node (the record)", 'par+ayanPhase': "+ Parameśvara's 15° as a phase shift alone (the morning's default of 2026-10-09; it breaks Āryabhaṭa's zero by 57.6′: superseded)", 'par+ayanAmp': "+ the same single record as an amplitude change alone (within a minute of the three-record fit)", 'par+ayan3': "+ the libration fitted to the paramparā's three determinations — Āryabhaṭa's zero in Kali 3600, Nīlakaṇṭha's 14°26′, Parameśvara's 15° — on its phase and greatest value: THE DEFAULT TIER (adopted; residuals 0, −0.5, +0.5′)", 'par+keralaLin': "+ Nīlakaṇṭha's stated linear rule (14°26′ + 0.9′ a year) instead: it misses Āryabhaṭa's zero by 56′, kept as a cross-check", 'par+keralaLin+sunEpoch': "+ Parameśvara's epoch Sun as a shift of the text's (a canon difference, not a correction: not adopted)", kerala: "the Kerala tier: Parahita + Dṛggaṇita means, the text's epicycles, the line through the three determinations", 'kerala+vakyaMoon': 'the same with the Moon of candravakya.js (Mādhava\'s sine, the 31.5 epicycle [unverified])',
      'kerala+dvitiya': "the Kerala tier + Munjāla's second correction (the evection's argument), amplitude measured [paramparā form, measured amplitude]", 'kerala+dvitiya+var': '+ the variation (no Indian source) [standard form, measured amplitude]', 'kerala+dvitiya+var+annual': '+ the annual equation (no Indian source) [standard form, measured amplitude]',
      'kerala+manda': "the Kerala tier with a measured scale on each of the text's manda epicycles (14° Sun, 32° Moon) [measured]", 'kerala+all': 'all five measured forms together — what the sibling Kerala-corrections file (SSEA / sphuta / web) would do here, with every amplitude fitted, none typed [measured]' },
    spans };
}
if (require.main === module) {
  if (process.argv.includes('--write')) {
    const fs = require('node:fs'), out = path.join(ROOT, 'corpus', 'research', 'parampara-apply.json');
    fs.mkdirSync(path.dirname(out), { recursive: true }); fs.writeFileSync(out, JSON.stringify(result(), null, 1) + '\n'); console.log(`wrote ${path.relative(ROOT, out)}`); process.exit(0);
  }
  console.log(`record: Moon ${rec.moonArcmin}′, node ${rec.nodeArcmin}′ at Kali ${rec.epochKali}; ayanāṃśa phase for 15° at Kali 4536: ${phase.toFixed(4)}° (amplitude ${amp.toFixed(4)}°)`);
  console.log(`Kerala linear ayanāṃśa: ${nilDeg.toFixed(4)}° at Kali day ${NIL_AY.era.kaliDay} + 0.9′/yr → 2026: ${keralaLinear(tOf(2461322.5)).toFixed(4)}°; Citrā-pakṣa 2026: ${M.tierAyanamsha(2461322.5, 'drik').deg.toFixed(4)}°`);
  console.log(`Parameśvara's epoch Sun ${PAR_EP.value.sun} vs the text's mean Sun at Laṅkā sunrise: ${sunEpochArcmin.toFixed(2)}′; Āryabhaṭa's mean Sun there: ${Number.isFinite(aryaSunAtEpoch) ? aryaSunAtEpoch.toFixed(4) + '°' : 'n/a'} (the text's: ${S.sphutaAtDays(tEp).mean.sun.toFixed(4)}°); his Moon ${PAR_EP.value.moon} = ${rashiDeg(PAR_EP.value.moon).toFixed(4)}°, Parahita ${aryaMoonAtEpoch.toFixed(4)}°, the text's ${ssMoonAtEpoch.toFixed(4)}°`);
  const f = (x) => `${x.mean >= 0 ? '+' : ''}${x.mean.toFixed(1)}′ rms ${x.rms.toFixed(1)}′ max ${x.max.toFixed(1)}′`;
  for (const [title, from, step, n] of SPANS) {
    console.log(`\n${title} — candidate minus the sky (tropical); ayanāṃśa minus Citrā-pakṣa`);
    for (const name of Object.keys(CANDIDATES)) { const s = score(name, from, step, n); console.log(`  ${name.padEnd(24)} Sun ${f(s.sun).padEnd(34)} Moon ${f(s.moon).padEnd(34)} Moon−Sun ${f(s.el).padEnd(34)} → tithi end ${(s.el.rms / 731.4 * 24).toFixed(2)} h rms | ayan ${f(s.ay)}`); }
  }
}
module.exports = { CANDIDATES, SPANS, score, sky, phase, amp, keralaLinear, sunEpochArcmin, result, keralaParts, measuredPlaces, TERMS };
