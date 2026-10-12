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
  moonManda2: { of: (k) => sinD(2 * (k.mean.moon - k.mean.moonApogee)), body: 'moon', form: 'sin 2(λ☾ − apogee☾)', provenance: 'the second harmonic of the equation of centre (the ellipse\'s e² term, 0.214° in the sky) — no Indian source; the epicycle cannot give it [standard form, measured amplitude]' },
  reduction:  { of: (k) => sinD(2 * (k.mean.moon - k.mean.node)), body: 'moon', form: 'sin 2(λ☾ − node)', provenance: 'the reduction of the orbit\'s longitude to the ecliptic (−0.114° sin 2F in the sky) — no Indian source [standard form, measured amplitude]' },
  moonD:      { of: (k) => sinD(k.mean.moon - k.mean.sun), body: 'moon', form: 'sin(λ☾ − λ☉)', provenance: 'the parallactic inequality (−0.035° sin D in the sky) — no Indian source [standard form, measured amplitude]' },
  moon2D2g:   { of: (k) => sinD(2 * (k.mean.moon - k.mean.sun) - 2 * (k.mean.moon - k.mean.moonApogee)), body: 'moon', form: 'sin(2D − 2g)', provenance: 'the sky\'s 0.059° term — no Indian source [standard form, measured amplitude]' },
  moon2Dg:    { of: (k) => sinD(2 * (k.mean.moon - k.mean.sun) + (k.mean.moon - k.mean.moonApogee)), body: 'moon', form: 'sin(2D + g)', provenance: 'the sky\'s 0.053° term — no Indian source [standard form, measured amplitude]' },
  moon2Dgp:   { of: (k) => sinD(2 * (k.mean.moon - k.mean.sun) - (k.mean.sun - k.mean.sunApogee)), body: 'moon', form: 'sin(2D − g′)', provenance: 'the sky\'s 0.046° term — no Indian source [standard form, measured amplitude]' },
  moonGgp:    { of: (k) => sinD((k.mean.moon - k.mean.moonApogee) - (k.mean.sun - k.mean.sunApogee)), body: 'moon', form: 'sin(g − g′)', provenance: 'the sky\'s 0.041° term — no Indian source [standard form, measured amplitude]' },
  sunManda2:  { of: (k) => sinD(2 * (k.mean.sun - k.mean.sunApogee)), body: 'sun', form: 'sin 2(λ☉ − apogee☉)', provenance: 'the second harmonic of the Sun\'s equation of centre (0.020° in the sky) — no Indian source [standard form, measured amplitude]' },
  moonLatScale:  { of: (k) => 0, body: 'moonLat', form: '× the text\'s latitude (2.57: 270′ × jya(λ☾ − node)) — a scale', provenance: 'SS 2.57 form; the scale measured (the sky\'s inclination 5.145° against the text\'s 4.5°) [measured]' },
  moonLat2DmF:   { of: (k) => 0, body: 'moonLat', form: 'sin(2D − F)', provenance: 'the Moon\'s latitude series (0.173° in the sky) — no Indian source [standard form, measured amplitude]' },
  moonLatGpF:    { of: (k) => 0, body: 'moonLat', form: 'sin(g + F)', provenance: 'the Moon\'s latitude series — no Indian source [standard form, measured amplitude]' },
  moonLatGmF:    { of: (k) => 0, body: 'moonLat', form: 'sin(g − F)', provenance: 'the Moon\'s latitude series — no Indian source [standard form, measured amplitude]' },
  moonLat2DpF:   { of: (k) => 0, body: 'moonLat', form: 'sin(2D + F)', provenance: 'the Moon\'s latitude series — no Indian source [standard form, measured amplitude]' },
  moonLat2DmGmF: { of: (k) => 0, body: 'moonLat', form: 'sin(2D − g − F)', provenance: 'the Moon\'s latitude series — no Indian source [standard form, measured amplitude]' },
  moonLat2DmGpF: { of: (k) => 0, body: 'moonLat', form: 'sin(2D − g + F)', provenance: 'the Moon\'s latitude series — no Indian source [standard form, measured amplitude]' },
  nodeTrue2SF:   { of: (k) => 0, body: 'node', form: 'sin 2(λ☉ − node)', provenance: 'the true node\'s principal term (1.498° in the sky, with the 0.123° sin 2D term folded in at a crossing) — the uploaded SSEA engine carried it as a 20th-century reconstruction; measured here at the dṛk Moon\'s latitude crossings [standard form, measured amplitude]' },
  nodeTrueG:     { of: (k) => 0, body: 'node', form: 'sin g', provenance: 'the true node\'s series — no Indian source [standard form, measured at the crossings]' },
  nodeTrueGp:    { of: (k) => 0, body: 'node', form: 'sin g′', provenance: 'the true node\'s series (0.150° in the sky) — no Indian source [standard form, measured at the crossings]' },
  nodeTrue2G:    { of: (k) => 0, body: 'node', form: 'sin 2g', provenance: 'the true node\'s series — no Indian source [standard form, measured at the crossings]' },
  nodeTrue2SFmG: { of: (k) => 0, body: 'node', form: 'sin(2(λ☉ − node) − g)', provenance: 'the true node\'s series — no Indian source [standard form, measured at the crossings]' },
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
  amplitudes = Object.fromEntries(Object.entries(amplitudes).filter(([k]) => k !== 'planets'));   // the planets' bīja is applied in ss-tier through fourSteps, not here
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
// ── the five star-planets: a bīja (epoch + rate, linear in centuries) on the Kerala tier's true planet against the dṛk tier ──
// The form is the paramparā's bīja-saṃskāra (Govindasvāmin, Bhāskara II's Karaṇa-kutūhala: a linear-in-years seed on the mean
// motion); the uploaded SSEA engine carries such a table with reconstructed verses [unverified]. Nothing is taken from it: the
// amplitudes are measured here, on the TRUE longitude of each planet (so the śīghra's own errors remain), and reported only.
const PLANETS = ['mangala', 'budha', 'guru', 'shukra', 'shani'];
function planetBija(from, step, n) {
  const out = {};
  for (const key of PLANETS) {
    let S0 = 0, ST = 0, STT = 0, SR = 0, SRT = 0; const res = [];
    for (let i = 0; i < n; i++) { const jd = from + i * step, T = (jd - 2451545) / 36525;
      const k = M.tierGrahaRows(jd, 'kerala').find((r) => r.key === key).longitude, d = M.tierGrahaRows(jd, 'drik').find((r) => r.key === key).longitude;
      const r = wrap(k - d); res.push([T, r]); S0 += 1; ST += T; STT += T * T; SR += r; SRT += r * T; }
    const det = S0 * STT - ST * ST, epoch = (SR * STT - ST * SRT) / det, rate = (S0 * SRT - ST * SR) / det;   // least squares r ≈ epoch + rate·T
    const st = (a) => ({ mean: a.reduce((x, y) => x + y, 0) / a.length * 60, rms: Math.sqrt(a.reduce((x, y) => x + y * y, 0) / a.length) * 60, max: Math.max(...a.map(Math.abs)) * 60 });
    out[key] = { before: st(res.map(([, r]) => r)), after: st(res.map(([T, r]) => r - epoch - rate * T)), epochDeg: -epoch, ratePerCentury: -rate, form: 'λ + (epoch + rate·T), T in Julian centuries from J2000, on the true longitude', provenance: 'bīja-saṃskāra form [paramparā]; the numbers measured here against the dṛk tier [measured]' };
  }
  return out;
}
// ── the joint measurement: every form and bīja fitted THROUGH THE TIER'S OWN ARITHMETIC (ss-tier placesOf, planetWithBija) ──
// Levenberg–Marquardt with a numerical Jacobian; a trial step the text's tables refuse (an R-sine beyond R) is a rejected step.
function lm(residualsOf, p0, iters = 40) {
  const safe = (q) => { try { return residualsOf(q); } catch (e) { return null; } };
  let p = p0.slice(), lam = 1e-3, r0 = safe(p); if (!r0) throw new Error('the start is outside the tables'); let cost = r0.reduce((a, v) => a + v * v, 0);
  for (let it = 0; it < iters; it++) {
    const n = r0.length, k = p.length, J = [];
    for (let j = 0; j < k; j++) { const q = p.slice(); q[j] += 1e-4; const r1 = safe(q); if (!r1) return p; J.push(r1.map((v, i) => (v - r0[i]) / 1e-4)); }
    const A0 = Array.from({ length: k }, () => new Array(k).fill(0)), b0 = new Array(k).fill(0);
    for (let a = 0; a < k; a++) { for (let c = 0; c < k; c++) for (let i = 0; i < n; i++) A0[a][c] += J[a][i] * J[c][i]; for (let i = 0; i < n; i++) b0[a] -= J[a][i] * r0[i]; }
    let improved = false;
    for (let tries = 0; tries < 12 && !improved; tries++) {
      const A = A0.map((row, a) => row.map((v, c) => (a === c ? v * (1 + lam) + 1e-12 : v))), b = b0.slice();
      for (let a = 0; a < k; a++) { let piv = a; for (let c = a + 1; c < k; c++) if (Math.abs(A[c][a]) > Math.abs(A[piv][a])) piv = c; [A[a], A[piv]] = [A[piv], A[a]]; [b[a], b[piv]] = [b[piv], b[a]];
        for (let c = 0; c < k; c++) if (c !== a) { const f = A[c][a] / A[a][a]; for (let d = a; d < k; d++) A[c][d] -= f * A[a][d]; b[c] -= f * b[a]; } }
      const step = b.map((v, a) => v / A[a][a]), q = p.map((v, a) => v + step[a]), r1 = q.every(Number.isFinite) ? safe(q) : null;
      if (r1) { const c1 = r1.reduce((a, v) => a + v * v, 0); if (c1 < cost) { const done = Math.max(...step.map(Math.abs)) < 1e-8 || cost - c1 < 1e-12 * cost; p = q; r0 = r1; cost = c1; lam = Math.max(lam / 3, 1e-9); improved = true; if (done) return p; continue; } }
      lam *= 10;
    }
    if (!improved) break;
  }
  return p;
}
/** Fit the first few parameters, then widen: the stages are prefixes of the parameter list; the rest start at zero. */
function staged(f, k, stages) { let p = []; for (const st of [...stages.filter((x) => x < k), k]) { const g = (q) => f([...q, ...new Array(k - q.length).fill(0)]); p = lm(g, [...p, ...new Array(st - p.length).fill(0)]); } return p; }
const PLANET_PARAMS = { text: ['mean.epochDeg', 'mean.ratePerCentury', 'sighrocca.epochDeg', 'sighrocca.ratePerCentury', 'mandocca.epochDeg', 'mandocca.ratePerCentury', 'mandaScale', 'sighraScale', 'manda2', 'radialOwn', 'radialSun'],
  nilakantha: ['mean.epochDeg', 'mean.ratePerCentury', 'sighrocca.epochDeg', 'sighrocca.ratePerCentury', 'mandocca.epochDeg', 'mandocca.ratePerCentury', 'sighraScale', 'series[0]', 'series[1]', 'series[2]', 'radial[0]', 'radial[1]', 'radialSun'],
  latitude: ['latScale', 'node.epochDeg', 'node.ratePerCentury', 'lat2'] };
const latitudeOf = (q) => ({ latScale: q[0] || 0, node: { epochDeg: q[1] || 0, ratePerCentury: q[2] || 0 }, lat2: q[3] || 0 });
const bijaPart = (p) => ({ mean: { epochDeg: p[0], ratePerCentury: p[1] }, sighrocca: { epochDeg: p[2], ratePerCentury: p[3] }, mandocca: { epochDeg: p[4] || 0, ratePerCentury: p[5] || 0 } });
const planetBijaOf = (p, form = 'text') => (form === 'nilakantha'
  ? { ...bijaPart(p), form, sighraScale: p[6] || 0, series: [p[7] || 0, p[8] || 0, p[9] || 0], radial: [p[10] || 0, p[11] || 0], radialSun: p[12] || 0 }
  : { ...bijaPart(p), form, mandaScale: p[6] || 0, sighraScale: p[7] || 0, manda2: p[8] || 0, radialOwn: p[9] || 0, radialSun: p[10] || 0 });
const bijaPair = (e, r) => ({ epochDeg: e, ratePerCentury: r });
function jointMeasured(from, step, n) {
  const samples = []; for (let i = 0; i < n; i++) { const jd = from + i * step, t = tOf(jd), rows = M.tierGrahaRows(jd, 'drik'), ayD = M.tierAyanamsha(jd, 'drik').deg;
    samples.push({ jd, t, T: (jd - 2451545) / 36525, ayK: KER.ayanamshaAt(t), sky: Object.fromEntries(rows.map((r) => [r.key, r.longitude + ayD])), skySid: Object.fromEntries(rows.map((r) => [r.key, r.longitude])), skyLat: Object.fromEntries(rows.map((r) => [r.key, r.latitudeDeg])) }); }
  const at = (meas) => { const pl = ST.placesOf(KER.mean, ST.measuredOf(meas)); return samples.map((s) => ({ s, p: pl(s.t) })); };
  const resOf = (meas, body, key) => at(meas).map(({ s, p }) => wrap(p[body] + s.ayK - s.sky[key]));
  const start = MEASURED['kerala+all'].fit;                                                  // the linear amplitudes seed the joint fit
  const a0 = { ...start.moon.amplitudes, ...start.sun.amplitudes };
  // the node: a linear bīja on the tropical Rāhu (the Kerala tier's node against the dṛk mean node)
  const nodeP = lm((q) => resOf({ node: bijaPair(q[0], q[1]) }, 'rahu', 'rahu'), [0, 0]);
  // the Sun: its mean and apogee bīja with the epicycle scale
  const sunOf = (q) => ({ sunMean: bijaPair(q[0], q[1]), sunApogee: bijaPair(q[2], q[3]), sunManda: q[4], sunManda2: q[5] || 0 });
  const sunP = staged((q) => resOf(sunOf(q), 'sun', 'surya'), 6, [2, 4, 5]);
  // the Moon: its mean and apogee bīja, the five forms, the two new terms — with the Sun's and the node's bīja held
  const moonOf = (q) => ({ ...sunOf(sunP), node: bijaPair(nodeP[0], nodeP[1]), moonMean: bijaPair(q[0], q[1]), moonApogee: bijaPair(q[2], q[3]), moonManda: q[4], dvitiya: q[5], variation: q[6], annual: q[7], moonManda2: q[8], reduction: q[9], moonD: q[10] || 0, moon2D2g: q[11] || 0, moon2Dg: q[12] || 0, moon2Dgp: q[13] || 0, moonGgp: q[14] || 0 });
  const moonP = (() => { const f = (q) => resOf(moonOf(q), 'moon', 'candra'); const p10 = lm(f, [0, 0, 0, 0, a0.moonManda, a0.dvitiya, a0.variation, a0.annual, 0, 0]); return lm(f, [...p10, 0, 0, 0, 0, 0]); })();   // the ten first, then the five small terms
  const full = moonOf(moonP);
  const sunAt = ST.placesOf(KER.mean, ST.measuredOf(full));                                                   // the tier's true Sun for the planets
  const score = (meas) => { const r = at(meas); const st = (a) => ({ mean: a.reduce((x, y) => x + y, 0) / a.length * 60, rms: Math.sqrt(a.reduce((x, y) => x + y * y, 0) / a.length) * 60, max: Math.max(...a.map(Math.abs)) * 60 });
    return { sun: st(r.map(({ s, p }) => wrap(p.sun + s.ayK - s.sky.surya))), moon: st(r.map(({ s, p }) => wrap(p.moon + s.ayK - s.sky.candra))), el: st(r.map(({ s, p }) => wrap((p.moon - p.sun) - (s.sky.candra - s.sky.surya)))), rahu: st(r.map(({ s, p }) => wrap(p.rahu + s.ayK - s.sky.rahu))) }; };
  // the planets: nine parameters each through the tier's measured four steps, staged 4 → 6 → 8 → 9
  const G = require(path.join(ROOT, 'ss-graha.js')), bodies = {};
  for (const [key, en] of Object.entries(PLANET_EN)) {
    const sky = samples.map((s) => s.skySid[key]);
    const sunOfSample = (s) => { const q = sunAt(s.t); return { lambda: q.sun, anomaly: q.mean.sun - q.mean.sunApogee }; };
    const suns = samples.map(sunOfSample);
    const f = (form) => (q) => samples.map((s, i) => wrap(ST.planetWithBija(en, G.meanPlaces(s.t)[en], planetBijaOf(q, form), s.jd, suns[i]).longitude - sky[i]));
    const st = (a) => ({ mean: a.reduce((x, y) => x + y, 0) / a.length * 60, rms: Math.sqrt(a.reduce((x, y) => x + y * y, 0) / a.length) * 60, max: Math.max(...a.map(Math.abs)) * 60 });
    // the text's form: the bīja (4 → 6), the scales (8), the second harmonic (9), the radial variation (10, 11)
    const ft = f('text'), p4 = staged(ft, 4, []), p6 = staged(ft, 6, [4]), p8 = lm(ft, [...p6, 0, 0]), p9 = lm(ft, [...p8, 0]), p11 = lm(ft, [...lm(ft, [...p9, 0]), 0]);
    // Nīlakaṇṭha's placement: the bīja (4 → 6), the śīghra scale and the first series term (8), the series (10), the radial variation (12, 13)
    const fn = f('nilakantha'), n8 = staged(fn, 8, [4, 6]), n10 = lm(fn, [...n8, 0, 0]), n12 = lm(fn, [...n10, 0, 0]), n13 = lm(fn, [...n12, 0]);
    const text = { stages: { before: st(ft(new Array(11).fill(0))), afterMeansOnly: st(ft(p4)), afterBija: st(ft(p6)), afterScales: st(ft(p8)), afterManda2: st(ft(p9)), after: st(ft(p11)) }, ...planetBijaOf(p11, 'text') };
    const nila = { stages: { before: st(fn(new Array(13).fill(0))), afterBija: st(fn(n8)), afterSeries: st(fn(n10)), afterRadial: st(fn(n12)), after: st(fn(n13)) }, ...planetBijaOf(n13, 'nilakantha') };
    const chosen = nila.stages.after.rms < text.stages.after.rms ? nila : text, chosenP = chosen === nila ? n13 : p11;
    const lat = samples.map((s, i) => { const d = M.tierGrahaRows(s.jd, 'drik').find((r) => r.key === key).latitudeDeg; return ST.planetWithBija(en, G.meanPlaces(s.t)[en], planetBijaOf(chosenP, chosen.form), s.jd, suns[i]).latitude / 60 - d; });
    // the latitude: on the chosen form, the text's 2.56-2.57 on the heliocentric argument with the node's bīja, a scale, the distances, + a second harmonic
    const fl = (q) => samples.map((s, i) => ST.planetWithBija(en, G.meanPlaces(s.t)[en], { ...planetBijaOf(chosenP, chosen.form), ...latitudeOf(q) }, s.jd, suns[i]).latitude / 60 - s.skyLat[key]);
    const latText = samples.map((s, i) => G.truePlaces(s.t)[en].latitude / 60 - s.skyLat[key]);
    const l3 = lm(fl, [0, 0, 0]), l4 = lm(fl, [...l3, 0]), latP = latitudeOf(l4);
    const { stages, ...params } = chosen;
    bodies[key] = { ...latP, latitudeFit: { text: st(latText), helioArgument: st(fl([0, 0, 0, 0])), after: st(fl(l4)), params: PLANET_PARAMS.latitude.map((k, i) => [k, l4[i]]), note: 'the text\'s latitude (2.56-2.57) against the dṛk latitude; then the measured form: the heliocentric argument (helio − node) for every graha, the node with a bīja, the text\'s greatest latitude scaled, × the planet\'s distance ÷ the śīghra karṇa, + a second harmonic [measured]' }, before: text.stages.before, afterMeansOnly: text.stages.afterMeansOnly, afterBija: text.stages.afterBija, afterScales: text.stages.afterScales, afterText: text.stages.after, afterNilakantha: nila.stages.after, after: stages.after, ...params,
      forms: { text: { stages: text.stages, params: PLANET_PARAMS.text.map((k, i) => [k, p11[i]]) }, nilakantha: { stages: nila.stages, params: PLANET_PARAMS.nilakantha.map((k, i) => [k, n13[i]]) } },
      latitude: { ...st(fl(l4)), note: 'the measured latitude (see latitudeFit) minus the dṛk latitude' },
      formNote: chosen.form === 'nilakantha'
        ? 'Nīlakaṇṭha\'s placement (Tantrasaṅgraha, 1500 — not in this library\'s editions [paramparā, unverified here]): the manda on the planet\'s own heliocentric mean as a measured series in its anomaly (sin μ, sin 2μ, sin 3μ), the text\'s śīghra from the tier\'s true Sun, the epicycle\'s size varying with the planet\'s distance (cos ν, cos 2ν) and the Earth\'s (cos g′); the means shifted by (epoch + rate·T) [measured]'
        : 'the text\'s four steps (ss-graha fourSteps) on means shifted by (epoch + rate·T) for the mean, the śīghrocca and the mandocca; each epicycle × (1 + scale); + manda2·sin 2(mandocca − place) at the third step; the śīghra epicycle varying with the planet\'s distance (cos anomaly) and the Earth\'s (cos g′) [measured]',
      provenance: 'bīja-saṃskāra on the means and revised epicycles [paramparā forms — the Kerala school revised both]; the series and the radial variation are the ellipse\'s, no Indian source for the numbers [standard form]; every number measured against the dṛk tier [measured]' };
  }
  const MOON_TERMS = ['dvitiya', 'variation', 'annual', 'moonManda', 'moonManda2', 'reduction', 'moonD', 'moon2D2g', 'moon2Dg', 'moon2Dgp', 'moonGgp'], SUN_TERMS = ['sunManda', 'sunManda2'];
  // the Moon's latitude: through the tier's places, a scale on 2.57 and the next terms, against the dṛk latitude
  const LAT_TERMS = ['moonLatScale', 'moonLat2DmF', 'moonLatGpF', 'moonLatGmF', 'moonLat2DpF', 'moonLat2DmGmF', 'moonLat2DmGpF'];
  const latOf = (q) => ({ ...full, ...Object.fromEntries(LAT_TERMS.map((k, i) => [k, q[i] || 0])) });
  const latRes = (q) => at(latOf(q)).map(({ s, p }) => p.moonLatitude - s.skyLat.candra);
  const latQ = lm(latRes, [...lm(latRes, [...lm(latRes, [0]), 0, 0, 0]), 0, 0, 0]);
  const stLat = (a) => ({ mean: a.reduce((x, y) => x + y, 0) / a.length * 60, rms: Math.sqrt(a.reduce((x, y) => x + y * y, 0) / a.length) * 60, max: Math.max(...a.map(Math.abs)) * 60 });
  // the true node: where the dṛk Moon's latitude crosses zero (bisected to 1e-6 d from each sample), the node is the Moon's longitude there
  // (+180° at a descending crossing); the forms on the tier's mean node fitted at those instants. sin 2F and sin 2D are not separable
  // from sin 2(λ☉ − node) at a crossing (F = 0 there) and are folded into it.
  const moonAt = (jd) => { const r = M.tierGrahaRows(jd, 'drik').find((x) => x.key === 'candra'); return { lon: r.longitude, lat: r.latitudeDeg }; };
  const crossings = [];
  for (const s of samples) { let a = moonAt(s.jd).lat; for (let d = 1; d <= 15; d++) { const b = moonAt(s.jd + d).lat; if (Math.sign(a) !== Math.sign(b)) { let lo = s.jd + d - 1, hi = s.jd + d, fl = a;
    for (let k = 0; k < 40; k++) { const mid = (lo + hi) / 2, fm = moonAt(mid).lat; if (Math.sign(fm) === Math.sign(fl)) { lo = mid; fl = fm; } else hi = mid; }
    const jd = (lo + hi) / 2, lon = moonAt(jd).lon; crossings.push({ jd, t: tOf(jd), node: b > a ? lon : mod(lon + 180, 360) }); break; } a = b; } }
  const NODE_TERMS = ['nodeTrue2SF', 'nodeTrueG', 'nodeTrueGp', 'nodeTrue2G', 'nodeTrue2SFmG'];
  const nodeOf = (q) => ({ ...latOf(latQ), ...Object.fromEntries(NODE_TERMS.map((k, i) => [k, q[i] || 0])) });
  const nodeRes = (q) => { const pl = ST.placesOf(KER.mean, ST.measuredOf(nodeOf(q))); return crossings.map((c) => wrap(pl(c.t).rahuTrue - c.node)); };
  const nodeQ = lm(nodeRes, [...lm(nodeRes, [...lm(nodeRes, [0]), 0, 0]), 0, 0]);
  const fullAll = nodeOf(nodeQ);
  return { candidate: { moonTerms: MOON_TERMS, sunTerms: SUN_TERMS, latTerms: LAT_TERMS, nodeTerms: NODE_TERMS, moonFit: { amplitudes: Object.fromEntries(MOON_TERMS.map((k) => [k, full[k]])) }, sunFit: { amplitudes: Object.fromEntries(SUN_TERMS.map((k) => [k, full[k]])) },
    latFit: { amplitudes: Object.fromEntries(LAT_TERMS.map((k) => [k, fullAll[k]])), before: stLat(latRes([])), after: stLat(latRes(latQ)), note: 'the Moon\'s latitude against the dṛk latitude, 1900-2100 (arcmin)' },
    nodeFit: { amplitudes: Object.fromEntries(NODE_TERMS.map((k) => [k, fullAll[k]])), crossings: crossings.length, before: stLat(nodeRes([])), after: stLat(nodeRes(nodeQ)), note: 'the tier\'s Rāhu (mean node; before) and its true node (the mean with the forms; after) against the node read at the dṛk Moon\'s latitude crossings (arcmin)' },
    bija: { sunMean: full.sunMean, sunApogee: full.sunApogee, moonMean: full.moonMean, moonApogee: full.moonApogee, node: full.node }, planets: true,
    method: 'Levenberg–Marquardt through ss-tier placesOf on the tropical residual against the dṛk tier: the node first (linear bīja on Rāhu), then the Sun (mean and apogee bīja, epicycle scale, second harmonic), then the Moon (mean and apogee bīja, the five forms, the second manda harmonic, the reduction, then the five small terms) with the Sun and node held; the planets through ss-tier planetWithBija in both forms, the better kept per graha', isDefault: true,
    score: { before: score(a0), after: score(full) } }, bodies };
}
// ── the bīja done as the paramparā does it: on the MEANS, through the text's own four-step model ──────────────────────
// For each star-planet the mean (the planet's own for Mars, Jupiter, Saturn; the Sun's for Mercury, Venus) and the śīghrocca
// (the planet's own heliocentric longitude for Mercury, Venus; the Sun's for the outer three) each get an epoch shift and a
// rate (degrees, degrees per Julian century from J2000); the text's four steps run on the shifted means (ss-graha fourSteps).
// Gauss–Newton with a numerical Jacobian on the dṛk residual over the long span.
const G = require(path.join(ROOT, 'ss-graha.js'));
const PLANET_EN = { mangala: 'mars', budha: 'mercury', guru: 'jupiter', shukra: 'venus', shani: 'saturn' };
function planetOnShiftedMeans(en, t, T, p) {
  const m = G.meanPlaces(t)[en];
  return G.fourSteps(en, { ...m, mean: mod(m.mean + p[0] + p[1] * T, 360), sighrocca: mod(m.sighrocca + p[2] + p[3] * T, 360), mandocca: mod(m.mandocca + (p[4] || 0) + (p[5] || 0) * T, 360) }).longitude;
}
function gaussNewton(residualsOf, p0, iters = 8) {
  let p = p0.slice();
  for (let it = 0; it < iters; it++) {
    const r0 = residualsOf(p), n = r0.length, k = p.length, J = [];
    for (let j = 0; j < k; j++) { const q = p.slice(); q[j] += 1e-4; const r1 = residualsOf(q); J.push(r1.map((v, i) => (v - r0[i]) / 1e-4)); }
    const A = Array.from({ length: k }, () => new Array(k).fill(0)), b = new Array(k).fill(0);
    for (let a = 0; a < k; a++) { for (let c = 0; c < k; c++) for (let i = 0; i < n; i++) A[a][c] += J[a][i] * J[c][i]; for (let i = 0; i < n; i++) b[a] -= J[a][i] * r0[i]; }
    for (let a = 0; a < k; a++) { let piv = a; for (let c = a + 1; c < k; c++) if (Math.abs(A[c][a]) > Math.abs(A[piv][a])) piv = c; [A[a], A[piv]] = [A[piv], A[a]]; [b[a], b[piv]] = [b[piv], b[a]];
      for (let c = 0; c < k; c++) if (c !== a) { const f = A[c][a] / A[a][a]; for (let d = a; d < k; d++) A[c][d] -= f * A[a][d]; b[c] -= f * b[a]; } }
    const step = b.map((v, a) => v / A[a][a]); p = p.map((v, a) => v + step[a]);
    if (Math.max(...step.map(Math.abs)) < 1e-7) break;
  }
  return p;
}
const stat = (a) => ({ mean: a.reduce((x, y) => x + y, 0) / a.length * 60, rms: Math.sqrt(a.reduce((x, y) => x + y * y, 0) / a.length) * 60, max: Math.max(...a.map(Math.abs)) * 60 });
function planetBijaMeans(from, step, n) {
  const samples = []; for (let i = 0; i < n; i++) { const jd = from + i * step; samples.push({ jd, t: tOf(jd), T: (jd - 2451545) / 36525, drik: M.tierGrahaRows(jd, 'drik') }); }
  const out = {};
  for (const [key, en] of Object.entries(PLANET_EN)) {
    const sky = samples.map((s) => s.drik.find((r) => r.key === key).longitude);
    const res = (p) => samples.map((s, i) => wrap(planetOnShiftedMeans(en, s.t, s.T, p) - sky[i]));
    const p4 = gaussNewton(res, [0, 0, 0, 0]), p = gaussNewton(res, [...p4, 0, 0]);
    out[key] = { before: stat(res([0, 0, 0, 0])), afterMeansOnly: stat(res(p4)), after: stat(res(p)), mean: { epochDeg: p[0], ratePerCentury: p[1] }, sighrocca: { epochDeg: p[2], ratePerCentury: p[3] }, mandocca: { epochDeg: p[4], ratePerCentury: p[5] },
      form: 'the text\'s four steps on means shifted by (epoch + rate·T) for the mean and for the śīghrocca, T in Julian centuries from J2000', provenance: 'bīja-saṃskāra on the means [paramparā form]; the numbers measured against the dṛk tier [measured]' };
  }
  return out;
}
/** The whole measurement as data (the page shows it with this provenance). */
function result() {
  const joint = jointMeasured(SPANS_FIT[0], SPANS_FIT[1], SPANS_FIT[2]);
  CANDIDATES['kerala+all+bija'] = (jd) => { const t = tOf(jd), a = KER.ayanamshaAt(t), p = ST.placesOf(KER.mean, ST.measuredOf({ ...joint.candidate.moonFit.amplitudes, ...joint.candidate.sunFit.amplitudes, ...joint.candidate.bija }))(t); return { sun: p.sun + a, moon: p.moon + a, ayan: a, sid: { sun: p.sun, moon: p.moon } }; };
  const spans = SPANS.map(([title, from, step, n]) => ({ title, fromJd: from, stepDays: step, samples: n, rows: Object.keys(CANDIDATES).map((name) => ({ name, ...score(name, from, step, n) })) }));
  return { generatedBy: 'node scripts/parampara-apply.cjs --write', frame: 'candidate minus the Modern Bhāratīya (dṛk) tier in the tropical frame (each candidate with its own ayanāṃśa); the ayanāṃśa column is candidate minus Citrā-pakṣa', unit: 'arcminutes',
    record: { moonArcmin: rec.moonArcmin, nodeArcmin: rec.nodeArcmin, epochKali: rec.epochKali }, phaseDeg: phase, amplitudeDeg: amp, keralaLinear2026: keralaLinear(tOf(2461322.5)), citra2026: M.tierAyanamsha(2461322.5, 'drik').deg,
    sunEpochArcmin, aryaSunAtEpoch, parameshvaraMoonDeg: rashiDeg(PAR_EP.value.moon), parahitaMoonAtEpoch: aryaMoonAtEpoch, textMoonAtEpoch: ssMoonAtEpoch,
    measured: { fittedOn: '1900-2100, every 97 days (753 samples); the 2026 span lies inside it', method: 'least squares of the Kerala tier\'s tropical residual against the dṛk tier on a constant plus the terms; the constant (the ayanāṃśa\'s business) is not applied',
      terms: Object.fromEntries(Object.entries(TERMS).map(([k, v]) => [k, { form: v.form, body: v.body, provenance: v.provenance }])),
      candidates: { ...Object.fromEntries(Object.entries(MEASURED).map(([k, fn]) => [k, { moonTerms: fn.fit.moonTerms, sunTerms: fn.fit.sunTerms, moonFit: fn.fit.moon, sunFit: fn.fit.sun, planets: k === 'kerala+all' }])), 'kerala+all+bija': joint.candidate },
      planets: { fittedOn: '1900-2100, every 97 days (753 samples)', unit: 'arcminutes (mean, rms, max); epoch in degrees, rate in degrees per Julian century; scales and radial terms dimensionless; manda2 and the series in degrees', parameters: PLANET_PARAMS, method: 'Levenberg–Marquardt on the dṛk residual through ss-tier planetWithBija, in two forms per graha, staged — the text\'s four steps: the mean and śīghrocca bīja (4), + the mandocca bīja (6), + the two epicycle scales (8), + the second manda harmonic (9), + the radial variation (11); Nīlakaṇṭha\'s placement: the bīja (6), + the śīghra scale and the first series term (8), + the series (10), + the radial variation (13); the better form kept per graha (`form`)', bodies: joint.bodies, meansOnlyGaussNewton: planetBijaMeans(SPANS_FIT[0], SPANS_FIT[1], SPANS_FIT[2]), trueLongitudeFit: planetBija(SPANS_FIT[0], SPANS_FIT[1], SPANS_FIT[2]) } },
    candidates: { ss: 'the plain Sūrya-Siddhānta', par: "+ Parameśvara's Moon and node (the record)", 'par+ayanPhase': "+ Parameśvara's 15° as a phase shift alone (the morning's default of 2026-10-09; it breaks Āryabhaṭa's zero by 57.6′: superseded)", 'par+ayanAmp': "+ the same single record as an amplitude change alone (within a minute of the three-record fit)", 'par+ayan3': "+ the libration fitted to the paramparā's three determinations — Āryabhaṭa's zero in Kali 3600, Nīlakaṇṭha's 14°26′, Parameśvara's 15° — on its phase and greatest value: THE DEFAULT TIER (adopted; residuals 0, −0.5, +0.5′)", 'par+keralaLin': "+ Nīlakaṇṭha's stated linear rule (14°26′ + 0.9′ a year) instead: it misses Āryabhaṭa's zero by 56′, kept as a cross-check", 'par+keralaLin+sunEpoch': "+ Parameśvara's epoch Sun as a shift of the text's (a canon difference, not a correction: not adopted)", kerala: "the Kerala tier: Parahita + Dṛggaṇita means, the text's epicycles, the line through the three determinations", 'kerala+vakyaMoon': 'the same with the Moon of candravakya.js (Mādhava\'s sine, the 31.5 epicycle [unverified])',
      'kerala+dvitiya': "the Kerala tier + Munjāla's second correction (the evection's argument), amplitude measured [paramparā form, measured amplitude]", 'kerala+dvitiya+var': '+ the variation (no Indian source) [standard form, measured amplitude]', 'kerala+dvitiya+var+annual': '+ the annual equation (no Indian source) [standard form, measured amplitude]',
      'kerala+manda': "the Kerala tier with a measured scale on each of the text's manda epicycles (14° Sun, 32° Moon) [measured]", 'kerala+all': 'all five measured forms together — what the sibling Kerala-corrections file (SSEA / sphuta / web) would do here, with every amplitude fitted, none typed [measured]',
      'kerala+all+bija': 'the joint measurement: a bīja (epoch + rate) on the Sun\'s, the Moon\'s, the apogees\' and the node\'s means, the five forms, the Moon\'s second manda harmonic and the reduction to the ecliptic, and the five planets with bīja, epicycle scales and second harmonic — all fitted through the tier\'s own arithmetic [paramparā and standard forms, every number measured]' },
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
module.exports = { CANDIDATES, SPANS, score, sky, phase, amp, keralaLinear, sunEpochArcmin, result, keralaParts, measuredPlaces, TERMS, planetBija, planetBijaMeans, planetOnShiftedMeans, gaussNewton, lm, staged, jointMeasured, planetBijaOf, PLANET_PARAMS };
