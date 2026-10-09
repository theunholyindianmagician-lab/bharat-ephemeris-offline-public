'use strict';
/*
 * yantra.test.js — the instruments (yantra.js): the Sūrya-Siddhānta's śaṅku, kapālaka and gola, and the instruments of
 * Jai Singh II's observatories, each built on the owner's latitude and the text's own Sun.
 *
 * The reference is the sphere: trigonometry appears in THIS FILE ONLY, to measure the module, never in it. The sphere's
 * latitude is the one the module's palabhā gives (tan φ = palabhā ÷ 12), its declination is 2.28's (sin δ = sin λ × 1397
 * ÷ 3438) of the module's own sāyana Sun, and its hour angle is the module's (the turn less the ascension), unless a test
 * says it measures that too. Each instrument's shadow is ray-traced here from its construction and compared with where
 * the module says to read it. Every number marked [measured] is printed as a diagnostic.
 *
 * NO OBSERVATION EXISTS YET. Every ledger record in this file is SYNTHETIC: made at run time from the text's forward model,
 * labelled `synthetic: true` with its generator, and never stored. Sizes are DEMO sizes: demo, not a measurement.
 * No modern ephemeris is computation, seed or referee.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
const Y = require('./yantra.js');
const L = require('./vedha-lekha.js');
const C = require('./ss-chaya.js');
const U = require('./ss-udaya.js');
const S = require('./sphuta.js');
const K = require('./kala-dvara.js');
const D = require('./ss-drishya.js');

const D2R = Math.PI / 180, R2D = 180 / Math.PI, R = 3438;
const EPS = Math.asin(1397 / 3438);                                    // the text's greatest declination, for the sphere
const mod = (a, m) => ((a % m) + m) % m;
const w180 = (a) => mod(a + 180, 360) - 180;
const day = (y, m, d) => K.kaliDayFromCivil({ calendar: 'gregorian', year: y, month: m, day: d });
const N0 = day(2026, 10, 7);
const LATS = [1, 10.85, 19, 23.18, 28, 35, 45, 55];
const DAYS = Array.from({ length: 24 }, (_, i) => N0 + i * 16);       // a year, every 16 days
const HOURS = [0.29, 0.34, 0.4, 0.46, 0.5, 0.54, 0.6, 0.66, 0.71];    // fractions of the civil day at the place
const cat = JSON.parse(fs.readFileSync(path.join(__dirname, 'corpus', 'surya-siddhanta', 'yogatara.json'), 'utf8'));
const STARS = D.starsOf(cat);
const STAR = Object.fromEntries(STARS.map((s) => [s.name, s]));

// ── the sphere ────────────────────────────────────────────────────────────────────────────────────
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const scl = (a, k) => [a[0] * k, a[1] * k, a[2] * k];
const nrm = (a) => scl(a, 1 / Math.sqrt(dot(a, a)));
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const V = (p) => [p.east, p.north, p.up];
const phiOf = (lat) => Math.atan(Y.placeOf({ latitude: lat }).palabha / 12);
const deltaOf = (lam) => Math.asin(Math.sin(EPS) * Math.sin(lam * D2R));
/** The unit vector (east, north, up) of a body of declination d at hour angle H (radians) at latitude phi. */
const bodyVec = (phi, d, H) => [-Math.cos(d) * Math.sin(H), Math.cos(phi) * Math.sin(d) - Math.sin(phi) * Math.cos(d) * Math.cos(H), Math.sin(phi) * Math.sin(d) + Math.cos(phi) * Math.cos(d) * Math.cos(H)];
const altOf = (s) => Math.asin(s[2]) * R2D;
const azOf = (s) => mod(Math.atan2(s[0], s[1]) * R2D, 360);
/** The Sun of the module at t, and the sphere's vector for it. */
function sky(lat, t) {
  const place = Y.placeOf({ latitude: lat, deshantara: 0 }), st = Y.sunAt(t, place), q = Y.quantitiesOf(st, place);
  const phi = phiOf(lat), d = deltaOf(st.lambda), H = st.natAsus / 60 * D2R;
  return { place, st, q, phi, d, H, s: bodyVec(phi, d, H) };
}
function* grid(lats = LATS, days = DAYS, hours = HOURS) {
  for (const lat of lats) for (const N of days) for (const h of hours) yield { lat, N, t: N + h, ...sky(lat, N + h) };
}
const maxOf = (m, k, v) => { m[k] = Math.max(m[k] || 0, Math.abs(v)); };
const fmt = (m) => Object.entries(m).map(([k, v]) => `${k} ${v.toExponential(2)}`).join(', ');

// ── the frame ─────────────────────────────────────────────────────────────────────────────────────
test('[FRAME] yantra.js is sovereign: the gate lists it, it requires only sovereign files, names no modern source, and has no trigonometry', () => {
  const gate = fs.readFileSync(path.join(__dirname, 'kala-dvara.test.js'), 'utf8');
  const FORBIDDEN = new RegExp(gate.match(/const FORBIDDEN = \/(.+)\/;/)[1]);
  const list = (name) => [...gate.match(new RegExp(`const ${name} = \\[([^\\]]+)\\]`))[1].matchAll(/'([^']+)'/g)].map((m) => m[1]);
  assert.ok(list('LAYERS').includes('yantra.js'), 'yantra.js is in the gate\'s LAYERS');
  const allowed = new Set([...list('ROOTS'), ...list('LAYERS')].map((f) => './' + f));
  const text = fs.readFileSync(path.join(__dirname, 'yantra.js'), 'utf8');
  assert.equal(FORBIDDEN.test(text), false, 'yantra.js mentions a forbidden source');
  assert.equal(/\bimport\s/.test(text), false);
  const reqs = [...text.matchAll(/\brequire\s*\(\s*["']([^"']+)["']\s*\)/g)].map((m) => m[1]);
  assert.deepEqual(reqs.sort(), ['./kala-dvara.js', './sphuta.js', './ss-chaya.js', './ss-grahana.js', './ss-udaya.js']);
  for (const r of reqs) assert.ok(allowed.has(r), r);
  assert.equal(/Math\.(?:sin|cos|tan|asin|acos|atan|atan2|hypot|PI)\b/.test(text), false, 'only the text\'s sine and its arc, and the mūla');
  const suites = fs.readFileSync(path.join(__dirname, 'scripts', 'test-all.cjs'), 'utf8');
  assert.ok(suites.includes("'yantra.test.js'"), 'in npm test');
  const html = fs.readFileSync(path.join(__dirname, 'vedha.html'), 'utf8');
  assert.ok(html.indexOf('src="yantra.js"') > 0 && html.indexOf('src="yantra.js"') < html.indexOf('src="vedha-lekha.js"'), 'vedha.html loads yantra.js before vedha-lekha.js');
  assert.ok(fs.readFileSync(path.join(__dirname, 'sw.js'), 'utf8').includes('"./yantra.js"'), 'cached offline');
});

// ── the catalogue ─────────────────────────────────────────────────────────────────────────────────
test('[text] the catalogue: every SS instrument is found in the edition\'s own verse, by its words; the rest are Jai Singh\'s, unverified', (t) => {
  const ed = fs.readFileSync(path.join(__dirname, 'editions', 'surya-siddhanta-full-edition.html'), 'utf8');
  const iast = (v) => {
    const [c, n] = v.split('.'), id = `id="v${c}-${String(n).padStart(2, '0')}"`, i = ed.indexOf(id);
    assert.ok(i > 0, `verse ${v} is in the edition`);
    const blk = ed.slice(i, ed.indexOf('</article>', i)), m = blk.match(/<div class="iast">([\s\S]*?)<\/div>/);
    return { text: m[1].replace(/<br>/g, ' ').normalize('NFC'), line: ed.slice(0, i).split('\n').length };
  };
  const lines = [];
  for (const e of Y.CATALOGUE) {
    assert.ok(e.deva && e.iast && e.measures && e.tag, e.key);
    for (const k of e.ledger) assert.ok(L.KINDS[k], `${e.key}: ledger kind ${k} exists in vedha-lekha.js`);
    if (e.source.startsWith('Sūrya')) {
      assert.ok(e.verses.length > 0 && Object.keys(e.words).length > 0, e.key);
      for (const [v, w] of Object.entries(e.words)) {
        const x = iast(v);
        assert.ok(x.text.includes(w.normalize('NFC')), `${e.key}: "${w}" in ${v}: ${x.text}`);
        lines.push(`${e.key} ${v}:${x.line}`);
      }
    } else {
      assert.match(e.tag, /\[unverified\]/, `${e.key}: Jai Singh's attribution is unverified here`);
      assert.equal(e.verses.length, 0, `${e.key}: no verse is quoted`);
      assert.match(e.source, /no verse of his works is available here/);
    }
  }
  // the instruments of 13.20-13.24 whose verses give no geometry are named only; the built ones have factories
  assert.deepEqual([...Y.NAMED_ONLY].sort(), ['cakra', 'chaya-yantra', 'dhanus', 'mayura-nara-vanara', 'nara-yantra', 'sasutra-renu-garbha', 'toya-yantra', 'yashti']);
  for (const k of Y.NAMED_ONLY) assert.throws(() => Y.instrument(k, {}), /named in the text but has no geometry/);
  for (const e of Y.CATALOGUE.filter((x) => x.built)) assert.equal(typeof Y[e.factory], 'function', e.key);
  assert.deepEqual([...Y.LEDGER_YANTRAS].sort(), ['dakshinottara-bhitti', 'digamsha', 'jaya-prakasha', 'kapala-yantra', 'nadivalaya', 'rama', 'rashivalaya', 'samrat', 'shashthamsha', 'unnatamsha']);
  assert.equal(Y.DEMO.note, 'demo, not a measurement');
  t.diagnostic(lines.join('; '));
});

// ── the sine tier and the frame ───────────────────────────────────────────────────────────────────
test('[measured] the angle of two legs by the text\'s sine and arc is the sphere\'s, to 0.005″; arc length by the radius in minutes', (t) => {
  let worst = 0;
  for (let a = 0; a < 360; a += 0.37) {
    const got = Y.angleOf(R * Math.sin(a * D2R), R * Math.cos(a * D2R));
    worst = Math.max(worst, Math.abs(w180(got - a)));
  }
  assert.ok(worst * 3600 < 0.006, `${(worst * 3600).toFixed(5)}″`);
  // ρ = 3437′44″48‴ is the radius in minutes to 3 parts in 10⁸: the arc length of a whole circle is 2πr to that
  const rhoRel = Y.arcLength(1, 21600) / (2 * Math.PI) - 1;
  assert.ok(Math.abs(rhoRel) < 4e-8, `${rhoRel}`);
  assert.equal(Y.withSine('table').RHO, 3438);
  for (const deg of [1, 30, 89, 179]) assert.ok(Math.abs(Y.chord(10, deg) - 20 * Math.sin(deg / 2 * D2R)) < 1e-6, `${deg}°`);
  t.diagnostic(`angleOf against atan2: ${(worst * 3600).toExponential(2)}″; ρ against 10,800 ÷ π: ${rhoRel.toExponential(2)} [measured]`);
});

test('[measured] the body in the horizon frame by 3.34b-3.36, 3.27b and 3.23b-3.24 is the sphere\'s; its śaṅku is ss-chaya.js\'s, and the inverse rotation returns it', (t) => {
  const m = {};
  for (const lat of [...LATS, 65, 75]) {
    const place = Y.placeOf({ latitude: lat }), phi = phiOf(lat);
    for (const dDeg of [-24, -11, 0, 7, 20, 23.9, 45, 70]) for (let H = -180; H < 180; H += 7.5) {
      const kj = Y.jya(dDeg), dj = Y.koti(dDeg), h = Y.horizonOf(kj, dj, H * 60, place), s = bodyVec(phi, dDeg * D2R, H * D2R);
      maxOf(m, 'components (R-units)', Math.max(Math.abs(h.up - R * s[2]), Math.abs(h.north - R * s[1]), Math.abs(h.east - R * s[0])));
      const aa = Y.altAzOf(h);
      maxOf(m, 'altitude (″)', (aa.unnataDeg - altOf(s)) * 3600);
      if (Math.hypot(s[0], s[1]) > 1e-3) maxOf(m, 'azimuth (″)', w180(aa.digamshaDeg - azOf(s)) * 3600 * Math.hypot(s[0], s[1]));   // on the sky: × cos(altitude)
      const back = Y.equatorialOfHorizon(h, place);
      maxOf(m, 'inverse δ (″)', (back.krantiDeg - dDeg) * 3600);
      if (Math.abs(dDeg) < 89) maxOf(m, 'inverse nata (asus)', w180(back.natAsus / 60 - H) * 60);
    }
    for (const lam of [10, 100, 200, 300]) for (const nat of [-4000, -1200, 0, 900, 3600]) {
      const kj = U.krantiJya(lam), sh = C.shadowAt(lam, place.palabha, nat).shanku;
      maxOf(m, 'śaṅku vs ss-chaya.shadowAt (R-units)', Y.horizonOf(kj, U.dyujya(kj), nat, place).up - sh);
    }
  }
  assert.ok(m['components (R-units)'] < 2e-4 && m['altitude (″)'] < 0.01 && m['azimuth (″)'] < 0.01, fmt(m));
  assert.ok(m['inverse δ (″)'] < 0.01 && m['inverse nata (asus)'] < 2e-4 && m['śaṅku vs ss-chaya.shadowAt (R-units)'] < 1e-8, fmt(m));
  t.diagnostic(`[measured] ${fmt(m)}`);
});

test('[measured] the hour angle from the turn: 3.42 at the point is the sphere\'s right ascension; 2.28 is its declination', (t) => {
  const m = {};
  for (let lam = 0; lam < 360; lam += 0.73) {
    const ra = mod(Math.atan2(Math.cos(EPS) * Math.sin(lam * D2R), Math.cos(lam * D2R)) * R2D * 60, 21600);
    maxOf(m, 'ascension (asus)', w180((U.rightAscension(lam) - ra) / 60) * 60);
    maxOf(m, 'declination (″)', (U.kranti(lam) - deltaOf(lam) * R2D) * 3600);
  }
  for (const { st } of grid([23.18], DAYS, [0.3, 0.5, 0.7])) {             // nata = the meridian's asus less the ascension
    assert.ok(Math.abs(w180((st.meridianAsus - st.raAsus - st.natAsus) / 60)) < 1e-9);
  }
  assert.ok(m['ascension (asus)'] < 1e-3 && m['declination (″)'] < 0.01, fmt(m));
  t.diagnostic(`[measured] ${fmt(m)}`);
});

// ── the Sūrya-Siddhānta's instruments ──────────────────────────────────────────────────────────────
test('śaṅku: the instrument\'s noon shadow is ss-chaya.js\'s noonShadow; its tip any hour is ss-chaya.js\'s shadowTip; a shadow reads back to the altitude, the palabhā and the latitude', (t) => {
  const m = {}, g = 12;
  const angle = (dc, c) => dc * g / (g * g + c * c) * R2D * 3600;           // a shadow's error as an angle at the gnomon (″)
  for (const lat of LATS) {
    const sh = Y.shanku({ site: { latitude: lat }, height: g }), big = Y.shanku({ site: { latitude: lat }, height: 30 }), place = Y.placeOf({ latitude: lat });
    for (const N of DAYS) {
      const noonT = Y.instantOfNata(N, 0, place), x = sky(lat, noonT);
      if (!x.q.above) continue;
      const own = sh.positionOf(x.q), n = C.noonShadow(x.st.lambda, sh.construction.palabha);
      maxOf(m, 'noon: the instrument vs ss-chaya.noonShadow (″)', angle(own.chaya - n.chaya, n.chaya));
      assert.equal(own.north >= 0 ? 'N' : 'S', n.dir);
      const c30 = n.chaya * 30 / 12;
      maxOf(m, 'gnomon of 30 aṅgula: scaled (″)', (big.positionOf(x.q).chaya - c30) * 30 / (900 + c30 * c30) * R2D * 3600);
      maxOf(m, 'noon(λ) wraps noonShadow (aṅgula)', sh.noon(x.st.lambda).chaya - n.chaya);
      // ss-chaya.js's two routes against each other: shadowTip goes through 3.37's dṛgjyā = √(R² − śaṅku²), which near the
      // zenith takes a root of a small difference; noonShadow takes the nata's own sine
      const tip = sh.shadow(noonT), z = Math.abs(x.q.natamshaDeg);
      maxOf(m, z >= 5 ? 'shadowTip vs noonShadow, z ≥ 5° (″)' : 'shadowTip vs noonShadow, z < 5° (″)', angle(tip.chaya - n.chaya, n.chaya));
      // the noon shadow read back: the latitude with the text's declination (3.14b-3.17a); the declination (3.17b-3.18a)
      maxOf(m, 'latitude from the noon shadow (″)', (sh.readNoon(own.chaya, n.dir, { t: noonT }).latitude - lat) * 3600);
      maxOf(m, 'declination from the noon shadow (″)', (sh.readKranti(own.chaya, n.dir).krantiDeg - U.kranti(x.st.lambda)) * 3600);
      for (const h of HOURS) {
        const y = sky(lat, N + h);
        if (!y.q.above || y.s[2] < 0.05) continue;
        const tp = sh.shadow(N + h), gen = sh.positionOf(y.q), zz = Math.acos(y.s[2]);
        // shadowTip: the length by 3.37's dṛgjyā, the bhuja by 3.23b-3.24, the east by 3.8 on those two, √(chāyā² − bhuja²)
        const k = g / (g * g + gen.chaya * gen.chaya) * R2D * 3600;
        maxOf(m, zz * R2D >= 5 ? 'any hour: shadowTip length vs the instrument, z ≥ 5° (″)' : 'any hour: shadowTip length vs the instrument, z < 5° (″)', (tp.chaya - gen.chaya) * k);
        maxOf(m, 'any hour: shadowTip bhuja vs the instrument (″)', (tp.north - gen.north) * k);
        if (Math.abs(gen.east) >= 1) maxOf(m, 'any hour: shadowTip east, ≥ 1 aṅgula off the meridian line (″)', (tp.east - gen.east) * k);
        else { maxOf(m, 'any hour: shadowTip east, within 1 aṅgula of the meridian line (″)', (tp.east - gen.east) * k); maxOf(m, 'the same, in aṅgula', tp.east - gen.east); }
        maxOf(m, 'the instrument vs 12 tan z of the sphere (″)', angle(gen.chaya - 12 * Math.tan(zz), gen.chaya));
        maxOf(m, 'altitude read from the shadow (″)', (sh.readShadow(gen.chaya).unnataDeg - altOf(y.s)) * 3600);
      }
    }
    const eq = sh.readEquinox(sh.construction.palabha);                       // the equinox shadow is the palabhā (3.12b-3.14a)
    maxOf(m, 'latitude from the palabhā (″)', (eq.latitude - lat) * 3600);
  }
  for (const k of ['noon: the instrument vs ss-chaya.noonShadow (″)', 'the instrument vs 12 tan z of the sphere (″)',
    'latitude from the noon shadow (″)', 'declination from the noon shadow (″)', 'altitude read from the shadow (″)']) assert.ok(m[k] < 0.02, `${k}: ${fmt(m)}`);
  for (const k of ['shadowTip vs noonShadow, z ≥ 5° (″)', 'any hour: shadowTip length vs the instrument, z ≥ 5° (″)', 'any hour: shadowTip east, ≥ 1 aṅgula off the meridian line (″)']) assert.ok(m[k] < 0.1, `${k}: ${fmt(m)}`);
  assert.ok(m['any hour: shadowTip bhuja vs the instrument (″)'] < 1e-6, fmt(m));
  // within an aṅgula of the meridian line the east part, a root of a small difference, loses up to ~20″, which is under
  // half a vyaṅgula on the slab: less than a reader of the slab can see
  assert.ok((m['any hour: shadowTip east, within 1 aṅgula of the meridian line (″)'] || 0) < 25 && (m['the same, in aṅgula'] || 0) < 1 / 60, fmt(m));
  // near the zenith the text's own 3.37 route loses up to about a second of arc on this sine; the instrument does not
  for (const k of ['shadowTip vs noonShadow, z < 5° (″)', 'any hour: shadowTip length vs the instrument, z < 5° (″)']) assert.ok((m[k] || 0) < 1.5, `${k}: ${fmt(m)}`);
  assert.ok(m['gnomon of 30 aṅgula: scaled (″)'] < 0.02 && m['noon(λ) wraps noonShadow (aṅgula)'] < 1e-12 && m['latitude from the palabhā (″)'] < 1e-6, fmt(m));
  // graduation: the noon shadows of the sign ends grow from the summer solstice to the winter one
  const gr = Y.shanku({ site: { latitude: 23.18 } }).graduation();
  const noonS = (lam) => gr.signEnds.find((x) => x.lambda === lam).noon;
  assert.ok(noonS(90).chaya < noonS(60).chaya && noonS(60).chaya < noonS(30).chaya && noonS(30).chaya < noonS(0).chaya && noonS(0).chaya < noonS(330).chaya && noonS(330).chaya < noonS(300).chaya && noonS(300).chaya < noonS(270).chaya);
  t.diagnostic(`[measured] ${fmt(m)}`);
});

test('kapālaka (13.23): a true bowl sinks 60 times between two transits of one star; the calibration recovers 60 sinks a turn, and any bowl\'s unit exactly', (t) => {
  const bowl = Y.kapalaka(), out = [];
  assert.equal(bowl.NOMINAL_SINKS, 60);
  assert.equal(K.SPANDAS_PER_GHATI * 60n, K.SPANDAS_PER_DAY, 'a sinking is a nāḍī: 60 to the turn (1.11-1.12)');
  for (const name of ['Citrā', 'Revatī', 'Maghā', 'Śravaṇa']) for (const N of [N0, N0 + 100, N0 + 200]) for (const lat of [10.85, 23.18, 45]) {
    const tr = bowl.transits(N, STAR[name], { latitude: lat, deshantara: 0 });
    const sinks = bowl.sinksBetween(tr.t1, tr.t2, 360);
    out.push(Math.abs(sinks - 60));
    assert.ok(Math.abs(sinks - 60) < 1e-5, `${name} ${N} ${lat}: ${sinks}`);
  }
  // the count of a true bowl, written as the owner counts it, calibrates to exactly 360 prāṇas and 60 sinkings a turn
  const c60 = bowl.calibrate({ sinks: 60 });
  assert.deepEqual(c60.unitPranas, { num: 360n, den: 1n });
  assert.deepEqual(c60.sinksPerTurnExact, { num: 60n, den: 1n });
  assert.equal(c60.true, true);
  assert.equal(c60.driftNadi, 0);
  // a bowl whose hole is a little wide: unit 21,600 ÷ 60.5 prāṇas — it sinks 60 times and half a filling in a turn
  const fast = { num: 43200n, den: 121n };
  const sinks = bowl.sinksBetween(0, Y.TURN / Y.ASUS_PER_DAY, Number(fast.num) / Number(fast.den));
  assert.ok(Math.abs(sinks - 60.5) < 1e-9);
  const cf = bowl.calibrate({ sinks: 60, fraction: { num: 1, den: 2 } });
  assert.deepEqual(cf.unitPranas, fast);
  assert.deepEqual(cf.sinksPerTurnExact, { num: 121n, den: 2n });
  assert.equal(cf.driftNadi, 0.5);
  // a count of that bowl → nāḍīs of the turn: 30 of its sinkings are 30 × 21,600 ÷ 60.5 prāṇas of the turn
  const tc = bowl.turnOfCount({ sinks: 30 }, cf.unitPranas);
  assert.ok(Math.abs(tc.asus - 30 * 21600 / 60.5) < 1e-9 && Math.abs(tc.civilDays * Y.ASUS_PER_DAY - tc.asus) < 1e-9);
  // a true bowl's nominal count is the turn's own: { ghati, vinadi, prana } in, the same out
  const k = bowl.turnOfCount({ ghati: 17, vinadi: 23, prana: 4 });
  assert.deepEqual(k.kapala, { ghati: 17, vinadi: 23, prana: 4 });
  // the turn in civil days is 1.34-1.37's ratio: one turn of the stars is savana ÷ nakṣatra days
  const m = K.mana('surya');
  assert.ok(Math.abs(Y.TURN / Y.ASUS_PER_DAY - Number(m.savana) / Number(m.nakshatra)) < 1e-15);
  // the ledger record is the README's kapala kind
  const rec = bowl.record({ id: 'bowl', star: 'Citrā', count: { ghati: 60 }, synthetic: true, generator: 'yantra.test.js (SYNTHETIC)' });
  assert.deepEqual(Object.keys(rec).sort(), ['count', 'generator', 'id', 'kind', 'star', 'synthetic']);
  assert.ok(C.validate({ format: C.FORMAT, site: { latitude: 23.18 }, records: [rec] }));
  t.diagnostic(`[measured] a true bowl between two transits: |sinks − 60| ≤ ${Math.max(...out).toExponential(2)} (the ayanāṃśa's motion in a day)`);
});

test('gola (13.3-13.17): 180 aṅgulas a ring is half an aṅgula a degree; the diurnal circles at their declinations, of their own radii; the rings read the Sun back', (t) => {
  const m = {};
  for (const lat of LATS) {
    const g = Y.gola({ site: { latitude: lat } }), phi = phiOf(lat);
    assert.equal(g.construction.angulaPerDegree, 0.5);
    maxOf(m, 'radius vs 180 ÷ 2π (relative)', g.construction.radius / (180 / (2 * Math.PI)) - 1);
    assert.ok(Math.abs(g.construction.eclipticInclinationDeg - EPS * R2D) < 1e-6);
    for (let lam = 0; lam < 360; lam += 15) {
      const d = g.diurnal(lam), dl = deltaOf(lam);
      maxOf(m, 'diurnal radius vs r cos δ', d.radius - g.construction.radius * Math.cos(dl));
      maxOf(m, 'from the equator vs δ ÷ 2 (aṅgula)', d.fromEquator - dl * R2D / 2);
      if (Math.abs(Math.tan(phi) * Math.tan(dl)) < 1) {
        maxOf(m, 'half-day vs the sphere (asus)', d.halfDayAsus - (90 + Math.asin(Math.tan(phi) * Math.tan(dl)) * R2D) * 60);
        maxOf(m, 'caradalajyā vs R tan φ tan δ', d.caradalajya - R * Math.tan(phi) * Math.tan(dl));
        maxOf(m, 'antyā = R + carajyā', d.antya - R - d.caradalajya);
      }
      const rr = g.ringsOf(lam), back = g.read(rr);
      maxOf(m, 'rings → λ, δ, ascension (round trip)', Math.max(Math.abs(back.lambda - lam), Math.abs(back.krantiDeg - U.kranti(lam)), Math.abs(back.raAsus - U.rightAscension(lam))));
    }
    const at = g.at(N0 + 0.6);
    assert.ok(Math.abs(at.sunFromMeridian - Y.sunAt(N0 + 0.6, { latitude: lat }).natAsus / 60 / 2) < 1e-12, '13.16: the Sun\'s hour ring stands its nata from the meridian');
  }
  assert.ok(m['radius vs 180 ÷ 2π (relative)'] < 4e-8 && m['diurnal radius vs r cos δ'] < 1e-6 && m['from the equator vs δ ÷ 2 (aṅgula)'] < 1e-6, fmt(m));
  assert.ok(m['half-day vs the sphere (asus)'] < 1e-3 && m['caradalajyā vs R tan φ tan δ'] < 1e-3 && m['antyā = R + carajyā'] < 1e-9 && m['rings → λ, δ, ascension (round trip)'] < 1e-9, fmt(m));
  const gr = Y.gola({ site: { latitude: 23.18 } }).graduation();
  assert.deepEqual(gr.eclipticSigns.map((x) => x.at), [0, 15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165]);
  t.diagnostic(`[measured] ${fmt(m)}`);
});

// ── Jai Singh II's instruments ────────────────────────────────────────────────────────────────────
const AX = (phi) => [0, Math.cos(phi), Math.sin(phi)], BOT = (phi) => [0, Math.sin(phi), -Math.cos(phi)], E = [1, 0, 0];

test('samrāṭ: the gnomon is the equinoctial shadow triangle; the hypotenuse\'s shadow and the declination point are the ray-traced sphere\'s; the graduation lands on it', (t) => {
  const m = {};
  for (const lat of LATS.filter((x) => x >= 10)) {
    const phi = phiOf(lat), r = 25, sm = Y.samrat({ site: { latitude: lat }, hypotenuse: 100, radius: r, centre: 80 });
    const c = sm.construction;
    maxOf(m, 'gnomon angle (″)', (Math.atan2(c.height, c.base) - phi) * R2D * 3600);
    maxOf(m, 'base : height : hypotenuse = 12 : palabhā : akṣakarṇa', Math.abs(c.base / c.height - 12 / Y.placeOf({ latitude: lat }).palabha) + Math.abs(Math.hypot(c.base, c.height) - c.hypotenuse));
    const Cc = V(c.centre);
    for (const x of grid([lat])) {
      if (!x.q.above) continue;
      const p = sm.positionOf(x.q), a = AX(phi);
      const se = sub(x.s, scl(a, dot(x.s, a))), dir = nrm(scl(se, -1));        // the edge's shadow in the quadrants' plane
      maxOf(m, 'quadrant point vs the ray (r)', Math.sqrt(dot(sub(V(p.point), add(Cc, scl(dir, r))), sub(V(p.point), add(Cc, scl(dir, r))))) / r);
      const ang = Math.atan2(dot(cross(BOT(phi), dir), a), dot(BOT(phi), dir));    // from the lowest point, positive toward the east
      maxOf(m, 'arc from noon vs the ray (r)', (p.arcFromNoon - r * Math.abs(ang)) / r);
      assert.equal(p.quadrant, Math.sign(dot(dir, E)) >= 0 ? 'east' : 'west');
      // the declination point: the line from G along the Sun meets the rim of the quadrant: g = r tan δ
      const dS = Math.asin(dot(x.s, a));
      maxOf(m, 'hypotenuse point vs r tan δ (r)', (p.hypotenuseFromCentre - r * Math.tan(dS)) / r);
      const G = add(Cc, scl(a, p.hypotenuseFromCentre)), tHit = p.hypotenuseFromCentre / Math.sin(dS || 1e-30), P = sub(G, scl(x.s, tHit));
      if (Math.abs(dS) > 0.01) maxOf(m, 'its shadow lies on the rim (r)', Math.abs(Math.sqrt(dot(sub(P, Cc), sub(P, Cc))) - r) / r);
      // round trips: position → quantities, reading → quantities → reading
      const back = sm.quantitiesOfPosition(p);
      maxOf(m, 'position → nata (asus)', back.natAsus - x.q.natAsus);
      maxOf(m, 'position → δ (″)', (back.krantiDeg - x.q.krantiDeg) * 3600);
      const rd = sm.predict(x.t).reading, qr = Y.quantitiesOfReading('samrat', rd);
      maxOf(m, 'reading → nata (asus)', qr.natAsus - x.q.natAsus);
      const again = Y.quantitiesOfReading('samrat', Y.readingOfQuantities('samrat', { ...x.q, natAsus: qr.natAsus, krantiDeg: qr.krantiDeg }));
      maxOf(m, 'reading → quantities → reading (asus, ″)', Math.max(Math.abs(again.natAsus - qr.natAsus), Math.abs(again.krantiDeg - qr.krantiDeg) * 3600));
    }
    const gr = sm.graduation();
    for (let i = 1; i < gr.hours.length; i++) assert.ok(gr.hours[i].arcFromNoon > gr.hours[i - 1].arcFromNoon && gr.hours[i].chordFromNoon > gr.hours[i - 1].chordFromNoon);
    for (const h of gr.hours) { maxOf(m, 'hour marks vs r × H (r)', (h.arcFromNoon - r * h.ghati * 6 * D2R) / r); maxOf(m, 'hour chords vs 2r sin(H/2) (r)', (h.chordFromNoon - 2 * r * Math.sin(h.ghati * 3 * D2R)) / r); }
    for (let i = 1; i < gr.kranti.length; i++) assert.ok(gr.kranti[i].fromCentre > gr.kranti[i - 1].fromCentre);
    for (const k of gr.kranti) maxOf(m, 'declination marks vs r tan δ (r)', (k.fromCentre - r * Math.tan(k.krantiDeg * D2R)) / r);
    assert.equal(gr.hours[gr.hours.length - 1].ghati, 15);
  }
  for (const k of ['gnomon angle (″)', 'base : height : hypotenuse = 12 : palabhā : akṣakarṇa']) assert.ok(m[k] < 1e-6, fmt(m));
  for (const k of ['quadrant point vs the ray (r)', 'arc from noon vs the ray (r)', 'hypotenuse point vs r tan δ (r)', 'its shadow lies on the rim (r)', 'hour marks vs r × H (r)', 'hour chords vs 2r sin(H/2) (r)', 'declination marks vs r tan δ (r)']) assert.ok(m[k] < 1e-6, `${k}: ${fmt(m)}`);
  assert.ok(m['position → nata (asus)'] < 1e-6 && m['position → δ (″)'] < 0.01 && m['reading → nata (asus)'] < 1e-9 && m['reading → quantities → reading (asus, ″)'] < 1e-9, fmt(m));
  assert.equal(Y.samrat({ site: { latitude: 23.18 }, ...Y.DEMO.samrat }).construction.fits.quadrantAboveGround, true);
  t.diagnostic(`[measured] ${fmt(m)}`);
});

test('nāḍīvalaya: the lit face is the gola; the pin\'s shadow is the ray-traced sphere\'s; it and the samrāṭ read one hour angle', (t) => {
  const m = {};
  for (const lat of LATS.filter((x) => x >= 5)) {
    const phi = phiOf(lat), a = AX(phi), r = 30, pin = 6;
    const nv = Y.nadivalaya({ site: { latitude: lat }, radius: r, pin }), sm = Y.samrat({ site: { latitude: lat }, hypotenuse: 100, radius: 25, centre: 80 });
    for (const x of grid([lat])) {
      if (!x.q.above) continue;
      const p = nv.positionOf(x.q), sd = dot(x.s, a);
      assert.equal(p.face, sd >= 0 ? 'uttara' : 'dakshina', 'the face the Sun lights');
      if (Math.abs(sd) > 0.01) {
        const tip = scl(a, Math.sign(sd) * pin), hit = sub(tip, scl(x.s, Math.sign(sd) * pin / sd));      // T − t s on the plane
        const down = dot(hit, BOT(phi)), east = dot(hit, E);
        maxOf(m, 'pin shadow tip vs the ray (relative)', Math.hypot(p.tip.down - down, p.tip.east - east) / Math.hypot(down, east));
        const back = nv.quantitiesOfPosition({ ...p.tip, face: p.face });
        maxOf(m, 'tip → δ (″)', (back.krantiDeg - x.q.krantiDeg) * 3600);
      }
      const fromNadi = nv.quantitiesOfPosition({ down: p.rim.down, east: p.rim.east }).natAsus;
      const fromSamrat = sm.quantitiesOfPosition(sm.positionOf(x.q)).natAsus;
      maxOf(m, 'nāḍīvalaya vs samrāṭ hour angle (asus)', fromNadi - fromSamrat);
      maxOf(m, 'nāḍīvalaya vs the engine (asus)', fromNadi - x.q.natAsus);
      maxOf(m, 'nāḍīvalaya vs the sphere\'s hour angle (asus)', w180(fromNadi / 60 - Math.atan2(-x.s[0], dot(x.s, [0, -Math.sin(phi), Math.cos(phi)])) * R2D) * 60);
      const rd = nv.predict(x.t).reading;
      assert.equal(rd.gola, x.q.gola);
      maxOf(m, 'reading → nata (asus)', Y.quantitiesOfReading('nadivalaya', rd).natAsus - x.q.natAsus);
    }
    const gr = nv.graduation();
    for (const h of gr.hourLines) maxOf(m, 'hour lines vs the sphere (r)', Math.hypot(h.rim.down - r * Math.cos(h.ghati * 6 * D2R), h.rim.east - r * Math.sin(h.ghati * 6 * D2R)) / r);
    for (let i = 1; i < gr.shadowLengthOfDeclination.length; i++) assert.ok(gr.shadowLengthOfDeclination[i].length < gr.shadowLengthOfDeclination[i - 1].length);
  }
  assert.ok(m['pin shadow tip vs the ray (relative)'] < 1e-6 && m['tip → δ (″)'] < 0.01, fmt(m));
  assert.ok(m['nāḍīvalaya vs samrāṭ hour angle (asus)'] < 1e-4 && m['nāḍīvalaya vs the engine (asus)'] < 1e-4 && m['nāḍīvalaya vs the sphere\'s hour angle (asus)'] < 1e-3, fmt(m));
  assert.ok(m['reading → nata (asus)'] < 1e-9 && m['hour lines vs the sphere (r)'] < 1e-6, fmt(m));
  t.diagnostic(`[measured] ${fmt(m)}`);
});

test('jaya prakāśa and kapāla: the wires\' shadow is the antipode on the bowl; read back, it gives the hour angle and declination and the altitude and azimuth', (t) => {
  const m = {};
  for (const [key, make] of [['jaya-prakasha', Y.jayaPrakasha], ['kapala-yantra', Y.kapalaYantra]]) for (const lat of LATS) {
    const r = 20, bowl = make({ site: { latitude: lat }, radius: r }), phi = phiOf(lat);
    maxOf(m, 'pole image vs the sphere (r)', Math.hypot(bowl.construction.poleImage.north + r * Math.cos(phi), bowl.construction.poleImage.depth - r * Math.sin(phi)) / r);
    for (const x of grid([lat])) {
      const p = bowl.positionOf(x.q);
      if (!x.q.above) { assert.equal(p, null); continue; }
      const ref = scl(x.s, -r);                                                   // C − r s, C at the rim's centre
      maxOf(m, 'shadow point vs the antipode (r)', Math.hypot(p.east - ref[0], p.north - ref[1], -p.depth - ref[2]) / r);
      const back = bowl.quantitiesOfPosition(p);
      maxOf(m, 'point → nata (asus)', back.natAsus - x.q.natAsus);
      maxOf(m, 'point → δ (″)', (back.krantiDeg - x.q.krantiDeg) * 3600);
      maxOf(m, 'point → altitude vs the sphere (″)', (back.unnataDeg - altOf(x.s)) * 3600);
      if (Math.hypot(x.s[0], x.s[1]) > 1e-3) maxOf(m, 'point → azimuth vs the sphere (″)', w180(back.digamshaDeg - azOf(x.s)) * 3600 * Math.hypot(x.s[0], x.s[1]));
      const qr = Y.quantitiesOfReading(key, bowl.predict(x.t).reading);
      maxOf(m, 'reading → quantities', Math.max(Math.abs(qr.natAsus - x.q.natAsus), Math.abs(qr.krantiDeg - x.q.krantiDeg) * 3600, Math.abs(qr.unnataDeg - x.q.unnataDeg) * 3600, Math.abs(w180(qr.digamshaDeg - x.q.digamshaDeg)) * 3600));
    }
    const gr = bowl.graduation();
    for (let i = 1; i < gr.altitudeCircles.length; i++) assert.ok(gr.altitudeCircles[i].depth > gr.altitudeCircles[i - 1].depth && gr.altitudeCircles[i].arcFromBottom < gr.altitudeCircles[i - 1].arcFromBottom);
    for (const pt of gr.hourLines.find((h) => h.ghati === 0).points) maxOf(m, 'the noon hour line lies in the meridian (r)', pt.point.east / r);
    for (const h of gr.hourLines) for (const pt of h.points) maxOf(m, 'hour-line points vs the sphere (r)', Math.hypot(...sub([pt.point.east, pt.point.north, -pt.point.depth], scl(bodyVec(phi, pt.krantiDeg * D2R, h.ghati * 6 * D2R), -r))) / r);
  }
  assert.ok(m['pole image vs the sphere (r)'] < 1e-9 && m['shadow point vs the antipode (r)'] < 1e-6 && m['hour-line points vs the sphere (r)'] < 1e-6 && m['the noon hour line lies in the meridian (r)'] < 1e-12, fmt(m));
  assert.ok(m['point → nata (asus)'] < 2e-4 && m['point → δ (″)'] < 0.01 && m['point → altitude vs the sphere (″)'] < 0.01 && m['point → azimuth vs the sphere (″)'] < 0.01 && m['reading → quantities'] < 1e-6, fmt(m));
  t.diagnostic(`[measured] ${fmt(m)}`);
});

test('rāma yantra: the pillar-top\'s shadow on the floor or the wall is the ray-traced sphere\'s; the graduation is continuous at the change of surface', (t) => {
  const m = {};
  for (const lat of LATS) for (const [hp, Rc] of [[20, 20], [15, 25], [30, 12]]) {
    const ry = Y.ramaYantra({ site: { latitude: lat }, pillar: hp, radius: Rc });
    for (const x of grid([lat])) {
      if (!x.q.above || x.s[2] < 1e-3) continue;
      const p = ry.positionOf(x.q), T = [0, 0, hp];
      const tFloor = hp / x.s[2], floorHit = sub(T, scl(x.s, tFloor)), rho = Math.hypot(floorHit[0], floorHit[1]);
      if (rho <= Rc) {
        assert.equal(p.on, 'floor');
        maxOf(m, 'floor point vs the ray', Math.hypot(p.east - floorHit[0], p.north - floorHit[1]) / Rc);
      } else {
        const tw = Rc / Math.hypot(x.s[0], x.s[1]), wallHit = sub(T, scl(x.s, tw));
        assert.ok(p.on === 'wall' || p.on === 'above the wall');
        maxOf(m, 'wall point vs the ray', Math.hypot(p.east - wallHit[0], p.north - wallHit[1], p.height - wallHit[2]) / Rc);
      }
      const back = ry.quantitiesOfPosition(p);
      maxOf(m, 'position → altitude (″)', (back.unnataDeg - altOf(x.s)) * 3600);
      if (Math.hypot(x.s[0], x.s[1]) > 1e-3) maxOf(m, 'position → azimuth (″)', w180(back.digamshaDeg - azOf(x.s)) * 3600 * Math.hypot(x.s[0], x.s[1]));
    }
    const c = ry.construction, gr = ry.graduation();
    maxOf(m, 'change of surface at tan a = pillar ÷ radius (″)', (c.floorToWallAltitudeDeg - Math.atan(hp / Rc) * R2D) * 3600);
    for (let i = 1; i < gr.floorCircles.length; i++) assert.ok(gr.floorCircles[i].rho < gr.floorCircles[i - 1].rho, 'floor circles shrink as the altitude grows');
    for (let i = 1; i < gr.wallMarks.length; i++) assert.ok(gr.wallMarks[i].height < gr.wallMarks[i - 1].height, 'wall marks fall as the altitude grows');
    maxOf(m, 'continuity at the change (floor ρ = radius, wall height 0)', Math.max(Math.abs(gr.floorCircles[0].rho - Rc), Math.abs(gr.wallMarks[gr.wallMarks.length - 1].height)) / Rc);
    for (const f of gr.floorCircles) maxOf(m, 'floor circles vs h cot a', (f.rho - hp / Math.tan(f.unnataDeg * D2R)) / Rc);
  }
  for (const k of ['floor point vs the ray', 'wall point vs the ray', 'continuity at the change (floor ρ = radius, wall height 0)', 'floor circles vs h cot a']) assert.ok(m[k] < 1e-6, `${k}: ${fmt(m)}`);
  assert.ok(m['position → altitude (″)'] < 0.01 && m['position → azimuth (″)'] < 0.01 && m['change of surface at tan a = pillar ÷ radius (″)'] < 0.01, fmt(m));
  t.diagnostic(`[measured] ${fmt(m)}`);
});

test('digaṃśa, unnatāṃśa: the azimuth and the altitude are the sphere\'s; their marks are monotone and land on it', (t) => {
  const m = {};
  for (const lat of LATS) {
    const dg = Y.digamshaYantra({ site: { latitude: lat }, radius: 20 }), un = Y.unnatamshaYantra({ site: { latitude: lat }, radius: 20 });
    for (const x of grid([lat])) {
      if (!x.q.above) continue;
      if (Math.hypot(x.s[0], x.s[1]) > 1e-3) {
        const p = dg.positionOf(x.q);
        const cosAlt = Math.hypot(x.s[0], x.s[1]);                               // an azimuth's error on the sky
        maxOf(m, 'digaṃśa vs the sphere (″)', w180(dg.quantitiesOfPosition(p.sighted).digamshaDeg - azOf(x.s)) * 3600 * cosAlt);
        maxOf(m, 'digaṃśa: the shadow mark opposite (″)', w180(dg.quantitiesOfPosition(p.shadow).digamshaDeg - azOf(x.s) - 180) * 3600 * cosAlt);
      }
      maxOf(m, 'unnatāṃśa vs the sphere (″)', (un.quantitiesOfPosition(un.positionOf(x.q)).unnataDeg - altOf(x.s)) * 3600);
      const rd = un.predict(x.t).reading;
      assert.equal(rd.side, x.q.natAsus < 0 ? 'purva' : 'pashcima');
    }
    const marks = dg.graduation().marks;
    for (let i = 1; i < marks.length; i++) assert.ok(marks[i].arcFromNorth > marks[i - 1].arcFromNorth);
    for (const mk of marks) maxOf(m, 'digaṃśa marks vs 2r sin(A/2)', (mk.chordFromNorth - 40 * Math.abs(Math.sin(mk.digamshaDeg / 2 * D2R))) / 20);
    const um = un.graduation().marks;
    for (let i = 1; i < um.length; i++) assert.ok(um[i].arcFromLevel > um[i - 1].arcFromLevel && um[i].up > um[i - 1].up);
    for (const mk of um) maxOf(m, 'unnatāṃśa marks vs r × a', (mk.arcFromLevel - 20 * mk.unnataDeg * D2R) / 20);
  }
  for (const k of ['digaṃśa vs the sphere (″)', 'digaṃśa: the shadow mark opposite (″)', 'unnatāṃśa vs the sphere (″)']) assert.ok(m[k] < 0.01, `${k}: ${fmt(m)}`);
  assert.ok(m['digaṃśa marks vs 2r sin(A/2)'] < 1e-6 && m['unnatāṃśa marks vs r × a'] < 1e-6, fmt(m));
  t.diagnostic(`[measured] ${fmt(m)}`);
});

test('ṣaṣṭhāṃśa and the meridian wall: at the text\'s noon the image and the shadow stand at the sphere\'s zenith distance φ − δ; the arc holds the year', (t) => {
  const m = {};
  for (const lat of LATS) {
    const phi = phiOf(lat), place = Y.placeOf({ latitude: lat });
    const sh = Y.shashthamshaYantra({ site: { latitude: lat }, radius: 40 }), bh = Y.dakshinottaraBhitti({ site: { latitude: lat }, radius: 30 });
    assert.equal(sh.construction.holdsTheYear, true, `${lat}: 60° hold φ ± ε`);
    for (const N of DAYS) {
      const tn = Y.instantOfNata(N, 0, place), x = sky(lat, tn);
      const zS = (phi - x.d) * R2D;                                               // signed: + when the Sun is south of the zenith
      const p = sh.positionOf(x.q);
      maxOf(m, 'ṣaṣṭhāṃśa image vs φ − δ (″)', (p.natamshaSignedDeg - zS) * 3600);
      maxOf(m, 'its declination label vs the sphere\'s δ (″)', (p.krantiDeg - x.d * R2D) * 3600);
      maxOf(m, 'image point vs the pinhole ray (r)', Math.hypot(p.north - 40 * Math.sin(zS * D2R), p.depth - 40 * Math.cos(zS * D2R)) / 40);
      assert.equal(p.onArc, true);
      const back = sh.quantitiesOfPosition(p);
      maxOf(m, 'position → zenith distance (″)', (back.natamshaSignedDeg - p.natamshaSignedDeg) * 3600);
      const b = bh.positionOf(x.q);
      maxOf(m, 'wall: noon altitude vs 90° − |φ − δ| (″)', (b.unnataDeg - (90 - Math.abs(zS))) * 3600);
      assert.equal(b.quadrant, zS > 0 ? 'uttara' : 'dakshina', 'the shadow falls on the side away from the Sun');
      maxOf(m, 'wall mark vs the sphere (r)', Math.hypot(b.out - 30 * Math.cos(b.unnataDeg * D2R), b.depth - 30 * Math.sin(b.unnataDeg * D2R)) / 30);
      assert.equal(bh.quantitiesOfPosition(b).disha, x.q.disha);
    }
    const gm = sh.graduation().marks;
    for (let i = 1; i < gm.length; i++) assert.ok(gm[i].arcFromUnder > gm[i - 1].arcFromUnder && gm[i].krantiDeg < gm[i - 1].krantiDeg);
  }
  // the Sun's diameter from the breadth of its image: b × (21,600 ÷ 2π) ÷ r minutes
  const sh = Y.shashthamshaYantra({ site: { latitude: 23.18 }, radius: 40 });
  assert.ok(Math.abs(sh.discArcmin(0.37) / (0.37 / 40 * R2D * 60) - 1) < 4e-8);
  for (const k of ['ṣaṣṭhāṃśa image vs φ − δ (″)', 'its declination label vs the sphere\'s δ (″)', 'wall: noon altitude vs 90° − |φ − δ| (″)']) assert.ok(m[k] < 0.01, `${k}: ${fmt(m)}`);
  assert.ok(m['image point vs the pinhole ray (r)'] < 1e-6 && m['position → zenith distance (″)'] < 1e-6 && m['wall mark vs the sphere (r)'] < 1e-6, fmt(m));
  t.diagnostic(`[measured] ${fmt(m)}`);
});

test('rāśivalaya: each sign\'s moment is its first point\'s ascension; each gnomon points to the ecliptic\'s pole then; the Sun\'s shadow reads its longitude', (t) => {
  const m = {};
  const eclVec = (lam, phi, mer) => {                                         // an ecliptic point (sāyana) when the meridian's ascension is `mer` (asus)
    const d = deltaOf(lam), ra = Math.atan2(Math.cos(EPS) * Math.sin(lam * D2R), Math.cos(lam * D2R));
    return bodyVec(phi, d, mer / 60 * D2R - ra);
  };
  for (const lat of LATS) {
    const phi = phiOf(lat), r = 15, rv = Y.rashivalaya({ site: { latitude: lat }, radius: r, hypotenuse: 40 });
    for (const s of rv.signs) {
      const raK = mod(Math.atan2(Math.cos(EPS) * Math.sin(s.lambda * D2R), Math.cos(s.lambda * D2R)) * R2D * 60, 21600);
      maxOf(m, 'moment: meridian = the first point\'s ascension (asus)', w180((s.meridianAsus - raK) / 60) * 60);
      let pole = bodyVec(phi, Math.PI / 2 - EPS, (s.meridianAsus - 16200) / 60 * D2R);
      if (pole[2] < 0) pole = scl(pole, -1);
      maxOf(m, 'gnomon inclination vs the ecliptic pole (″)', (s.gnomon.inclinationDeg - altOf(pole)) * 3600);
      if (Math.hypot(pole[0], pole[1]) > 1e-6) maxOf(m, 'gnomon bearing vs the ecliptic pole (″)', w180(s.gnomon.bearingDeg - azOf(pole)) * 3600);
      // the nonagesimal: the ecliptic's highest point
      let best = 0, bestAlt = -2;
      for (let l = 0; l < 360; l += 0.25) { const a = eclVec(l, phi, s.meridianAsus)[2]; if (a > bestAlt) { bestAlt = a; best = l; } }
      let lo = best - 0.25, hi = best + 0.25;
      for (let i = 0; i < 100; i++) { const a = lo + (hi - lo) / 3, b = hi - (hi - lo) / 3; if (eclVec(a, phi, s.meridianAsus)[2] < eclVec(b, phi, s.meridianAsus)[2]) lo = a; else hi = b; }
      maxOf(m, 'nonagesimal vs the sphere\'s highest ecliptic point (″)', w180(s.vitribha - (lo + hi) / 2) * 3600);
      // the Sun's shadow at the moment, on the quadrants in the ecliptic's plane, from their lowest point
      for (const N of [N0, N0 + 91, N0 + 182, N0 + 273]) {
        const pm = rv.predictMoment(N, s.rashi);
        if (!pm.above) continue;
        const sv = eclVec(pm.quantities.sphutaDeg, phi, Y.sunAt(pm.t, { latitude: lat }).meridianAsus);
        const p = pole, low = nrm(sub([0, 0, -1], scl(p, dot([0, 0, -1], p)))), dir = nrm(scl(sub(sv, scl(p, dot(sv, p))), -1));
        const ang = Math.acos(Math.max(-1, Math.min(1, dot(low, dir)))) * R2D;
        maxOf(m, 'shadow angle vs the ray-traced sphere (°)', pm.position.angleDeg - ang);
        // east and west of the gnomon's own vertical plane: the horizontal perpendicular to it, with its east component positive
        const A = s.gnomon.bearingDeg * D2R, side = scl([Math.cos(A), -Math.sin(A), 0], Math.sign(Math.cos(A)) || 1);
        if (ang > 1e-3) assert.equal(pm.position.quadrant, dot(dir, side) < 0 ? 'west' : 'east', `${lat} ${s.name} ${N}`);
        const back = rv.quantitiesOfPosition(s.rashi, pm.position);
        maxOf(m, 'position → the Sun\'s longitude (″)', w180(back.sphutaDeg - pm.quantities.sphutaDeg) * 3600);
        maxOf(m, 'moment: the meridian at the instant (asus)', w180((Y.sunAt(pm.t, { latitude: lat }).meridianAsus - s.meridianAsus) / 60) * 60);
      }
    }
    // Karka and Makara: the gnomon lies in the meridian, at φ − ε (the south pole, if that is negative) and φ + ε
    const ka = rv.signs[3].gnomon, ma = rv.signs[9].gnomon, e = EPS * R2D;
    assert.ok(Math.abs(ma.inclinationDeg - (phiOf(lat) * R2D + e)) < 1e-5 && Math.abs(w180(ma.bearingDeg)) < 1e-5, `${lat} Makara`);
    assert.ok(Math.abs(ka.inclinationDeg - Math.abs(phiOf(lat) * R2D - e)) < 1e-5, `${lat} Karka`);
    for (const g of rv.graduation().signs) for (let i = 1; i < g.marks.length; i++) assert.ok(w180(g.marks[i].sphutaDeg - g.marks[i - 1].sphutaDeg) > 0);
  }
  // t near Kali day 1.87 million is a double whose last bit is ~5e-6 asus of the turn: that is the instant's own resolution
  assert.ok(m['moment: meridian = the first point\'s ascension (asus)'] < 1e-3 && m['moment: the meridian at the instant (asus)'] < 1e-5, fmt(m));
  assert.ok(m['gnomon inclination vs the ecliptic pole (″)'] < 0.01 && m['gnomon bearing vs the ecliptic pole (″)'] < 0.05, fmt(m));
  assert.ok(m['nonagesimal vs the sphere\'s highest ecliptic point (″)'] < 0.5 && m['shadow angle vs the ray-traced sphere (°)'] < 1e-4 && m['position → the Sun\'s longitude (″)'] < 1e-6, fmt(m));
  t.diagnostic(`[measured] ${fmt(m)}`);
});

// ── the readings and the ledger ───────────────────────────────────────────────────────────────────
test('readings: the schema of each instrument; reading → quantities → reading round-trips; a modern field is refused', () => {
  const lat = 23.18, x = sky(lat, N0 + 0.43);
  for (const key of Y.LEDGER_YANTRAS) {
    const rd = Y.readingOfQuantities(key, x.q, { rashi: 6, meridian: false });
    assert.ok(Y.checkReading(key, rd, 'surya'), key);
    const q = Y.quantitiesOfReading(key, rd);
    if (q.natAsus !== undefined) assert.ok(Math.abs(q.natAsus - x.q.natAsus) < 1e-9, key);
    if (q.krantiDeg !== undefined) assert.ok(Math.abs(q.krantiDeg - x.q.krantiDeg) < 1e-12, key);
    if (q.unnataDeg !== undefined) assert.ok(Math.abs(q.unnataDeg - x.q.unnataDeg) < 1e-12, key);
    if (q.digamshaDeg !== undefined) assert.ok(Math.abs(q.digamshaDeg - x.q.digamshaDeg) < 1e-12, key);
    assert.deepEqual(Y.readingOfQuantities(key, { ...x.q, ...q }, { rashi: 6 }), rd, `${key}: reading → quantities → reading`);
  }
  assert.throws(() => Y.checkReading('samrat', { kranti: { amsha: 4 }, gola: 'uttara' }), /needs nata and side/);
  assert.throws(() => Y.checkReading('samrat', { nata: { ghati: 3 }, side: 'purva', kranti: { amsha: 4 } }), /go together/);
  assert.throws(() => Y.checkReading('rama', { unnata: { amsha: 30 }, digamsha: { amsha: 120 }, azimuth: 120 }), /field "azimuth"/);
  assert.throws(() => Y.checkReading('digamsha', { digamsha: { amsha: 360 } }), /less than 360/);
  assert.throws(() => Y.checkReading('nadivalaya', { nata: { ghati: 31 }, side: 'purva', gola: 'uttara' }), /30 ghaṭī/);
  assert.throws(() => Y.checkReading('unnatamsha', { unnata: { amsha: 30 }, side: 'purva', disha: 'S' }), /not both/);
  assert.throws(() => Y.checkReading('gola', {}), /not an instrument whose reading/);
  assert.throws(() => Y.checkReading('rashivalaya', { rashi: 12, sphuta: { amsha: 10 } }), /Mīna/);
  assert.throws(() => Y.checkReading('shashthamsha', { natamsha: { amsha: 10 }, disha: 'S' }, 'Citrā'), /Sun's image/);
});

test('the ledger: every instrument\'s reading, made from the text, is certified and reduced back to the text; a reading off by 2′ or 30 asus is measured back [measured, synthetic]', (t) => {
  const GEN = 'yantra.test.js: the text\'s forward model (yantra.js predict) — SYNTHETIC, no sky behind it';
  const SITE = { name: 'Ujjayinī (synthetic)', deshantara: 0, latitude: 23.18 };
  const site = { latitude: 23.18, deshantara: 0, palabha: C.palabhaOfLatitude(23.18).palabha };
  const N = N0 + 3, rise = L.sunriseAt(N, site), sy = (tt) => sky(23.18, tt);
  const bowlAt = (tt) => L.kapalaOfAsus(L.turnAsusBetween(rise, tt));
  const recs = [];
  const add = (key, m) => recs.push(Y.record(key, { ...m, day: { kali: N }, synthetic: true, generator: GEN }));
  const tA = rise + 0.15, tB = rise + 0.33, qA = sy(tA).q, qB = sy(tB).q;
  add('samrat', { id: 'samrat-bowl', reading: Y.readingOfQuantities('samrat', qA), kapala: bowlAt(tA) });
  add('samrat', { id: 'samrat-self', reading: Y.readingOfQuantities('samrat', qB) });
  add('nadivalaya', { id: 'nadi', reading: Y.readingOfQuantities('nadivalaya', qB), kapala: bowlAt(tB) });
  add('jaya-prakasha', { id: 'jp', reading: Y.readingOfQuantities('jaya-prakasha', qA), kapala: bowlAt(tA) });
  add('kapala-yantra', { id: 'kapala-altaz', reading: { unnata: Y.arcOfDegrees(qB.unnataDeg), digamsha: Y.arcOfDegrees(qB.digamshaDeg) } });
  add('rama', { id: 'rama', reading: Y.readingOfQuantities('rama', qA), kapala: bowlAt(tA) });
  add('digamsha', { id: 'dig-self', reading: Y.readingOfQuantities('digamsha', qB) });
  add('digamsha', { id: 'dig-bowl', reading: Y.readingOfQuantities('digamsha', qA), kapala: bowlAt(tA) });
  add('unnatamsha', { id: 'unnata-bowl', reading: Y.readingOfQuantities('unnatamsha', qB), kapala: bowlAt(tB) });
  const noon = Y.instantOfNata(N, 0, Y.placeOf(site)), qN = sy(noon).q;
  add('shashthamsha', { id: 'shashtha', reading: Y.readingOfQuantities('shashthamsha', qN) });
  add('dakshinottara-bhitti', { id: 'bhitti-sun', reading: Y.readingOfQuantities('dakshinottara-bhitti', qN) });
  const rv = Y.rashivalaya({ site, radius: 15 }), k = [...Array(12).keys()].find((i) => rv.predictMoment(N, i).above);
  add('rashivalaya', { id: 'rashi', reading: rv.predictMoment(N, k).reading });
  // a star at night on the bowl: the jaya prakāśa's equatorial scales
  const tS = rise + 0.62, qS = Y.quantitiesOf(Y.starAt(tS, STAR['Citrā'], site), site);
  recs.push(Y.record('jaya-prakasha', { id: 'jp-citra', day: { kali: N }, body: 'Citrā', reading: { nata: Y.kapalaOfAsus(qS.natAsus), side: qS.natAsus < 0 ? 'purva' : 'pashcima', kranti: Y.arcOfDegrees(qS.krantiDeg), gola: qS.gola }, kapala: bowlAt(tS), synthetic: true, generator: GEN }));
  // off by a known amount: the samrāṭ's declination 2′ north, and its nata 30 asus west, against the bowl
  const off = Y.readingOfQuantities('samrat', { ...qA, krantiDeg: qA.krantiDeg + 2 / 60, natAsus: qA.natAsus + 30 });
  add('samrat', { id: 'samrat-off', reading: off, kapala: bowlAt(tA) });
  // a star on the meridian wall goes in as yamyottara; the śaṅku's noon shadow as madhyahna
  const tr = Y.instantOfNata(N, 0, Y.placeOf(site), { star: STAR['Citrā'] }), qT = Y.quantitiesOf(Y.starAt(tr, STAR['Citrā'], site), site);
  const bh = Y.dakshinottaraBhitti({ site, radius: 30 });
  recs.push(bh.recordStar({ id: 'bhitti-citra', day: { kali: N }, star: 'Citrā', unnata: Y.arcOfDegrees(qT.unnataDeg), disha: qT.disha, synthetic: true, generator: GEN }));
  const sk = Y.shanku({ site });
  recs.push(sk.record.madhyahna({ id: 'shanku-noon', day: { kali: N }, chaya: sk.noon(qN.sphutaDeg).chaya, dir: sk.noon(qN.sphutaDeg).dir, synthetic: true, generator: GEN }));

  let ledger = L.create({ site: SITE });
  for (const r of recs) ledger = L.append(ledger, r, { at: N + 1 });
  ledger = L.seal(ledger);
  assert.equal(L.certify(ledger).ok, false, 'synthetic records are refused unless allowed');
  const cert = L.certify(L.toJSON(ledger), { allowSynthetic: true });
  assert.ok(cert.ok, cert.reasons.map((x) => `${x.where}: ${x.reason}`).join('\n'));
  const red = L.reduce(L.toJSON(ledger), { allowSynthetic: true, catalogue: cat });
  const by = Object.fromEntries(red.records.map((x) => [x.id, x]));
  const m = {};
  for (const x of red.records.filter((r) => r.kind === 'yantra' && r.id !== 'samrat-off')) {
    assert.ok(x.antara, `${x.id}: ${JSON.stringify(x)}`);
    for (const [kk, v] of Object.entries(x.antara)) {
      if (typeof v === 'boolean') { assert.equal(v, true, `${x.id}.${kk}`); continue; }
      maxOf(m, kk, v);
    }
  }
  // to the sine tier's own noise (≤ 0.06″): the azimuth after an instant fixed by an altitude carries it twice
  assert.ok((m.natAsus || 0) < 1e-4 && (m.krantiArcmin || 0) < 1e-5 && (m.unnataArcmin || 0) < 1e-3 && (m.digamshaArcmin || 0) < 1e-3 && (m.natamshaArcmin || 0) < 1e-4 && (m.sphutaArcmin || 0) < 1e-4, fmt(m));
  assert.equal(by['samrat-self'].instant.fixedBy, 'natAsus');
  assert.equal(by['samrat-self'].antara.natAsus, undefined, 'the nata that fixed the instant has no antara of its own');
  assert.equal(by['kapala-altaz'].instant.fixedBy, 'unnataDeg');
  assert.equal(by['dig-self'].instant.fixedBy, 'digamshaDeg');
  assert.match(by.shashtha.instant.from, /meridian/);
  assert.match(by.rashi.instant.from, /on the meridian/);
  assert.equal(by['jp-citra'].body, 'Citrā');
  assert.ok(Math.abs(by['samrat-off'].antara.krantiArcmin - 2) < 1e-4 && Math.abs(by['samrat-off'].antara.natAsus - 30) < 1e-4, JSON.stringify(by['samrat-off'].antara));
  assert.ok(Math.abs(by['bhitti-citra'].antara.unnataArcmin) < 1e-3, 'the wall\'s star is a yamyottara, reduced as before');
  assert.equal(red.summary.yantra.n, 14);
  assert.equal(red.summary.yantra.byInstrument.samrat, 3);
  // the certifier refuses what the instruments cannot have produced
  const bad = (mut) => { const r = JSON.parse(JSON.stringify(recs[0])); mut(r); let l = L.create({ site: SITE }); l = { ...l, entries: [] };
    const e = { seq: 1, prev: L.sha256(L.canonical({ format: l.format, site: l.site })), at: N + 1, record: r }; e.sealedHash = L.sha256(L.canonical({ seq: e.seq, prev: e.prev, at: e.at, record: e.record }));
    return L.certify({ ...l, entries: [e] }, { allowSynthetic: true }); };
  assert.equal(bad(() => {}).ok, true);
  for (const [mut, why] of [[(r) => { r.reading.azimuth = 120; }, /azimuth/], [(r) => { r.yantra = 'gola'; }, /yantra/], [(r) => { delete r.reading.side; }, /go together|needs nata/],
    [(r) => { r.reading.extra = 1; }, /field "extra"/], [(r) => { r.body = ''; }, /body/], [(r) => { r.reading.nata.ghati = 40; }, /30 ghaṭī/], [(r) => { r.note = 'read at 14:05 UTC'; }, /modern/]]) {
    const c = bad(mut);
    assert.equal(c.ok, false);
    assert.match(c.reasons.map((x) => x.reason).join(' '), why);
  }
  t.diagnostic(`[measured, synthetic] antara of ${red.summary.yantra.n} instrument readings made from the text: ${fmt(m)}`);
});

test('the table tier: the same instruments on the text\'s 24 sines, measured against the sphere [measured]', (t) => {
  const Yt = Y.withSine('table');
  assert.equal(Yt.sine, 'table');
  const m = {};
  for (const lat of [10.85, 23.18, 35, 45]) {
    const place = Yt.placeOf({ latitude: lat }), phi = Math.atan(place.palabha / 12);
    for (const dDeg of [-23, -10, 0, 12, 23]) for (let H = -90; H <= 90; H += 7.5) {
      const h = Yt.horizonOf(Yt.jya(dDeg), Yt.koti(dDeg), H * 60, place), s = bodyVec(phi, dDeg * D2R, H * D2R);
      if (s[2] <= 0) continue;
      const aa = Yt.altAzOf(h);
      maxOf(m, 'altitude (′)', (aa.unnataDeg - altOf(s)) * 60);
      if (Math.hypot(s[0], s[1]) > 1e-2) maxOf(m, 'azimuth (′)', w180(aa.digamshaDeg - azOf(s)) * 60);
    }
  }
  assert.ok(m['altitude (′)'] < 3 && m['azimuth (′)'] < 10, fmt(m));
  t.diagnostic(`[measured] the 24-sine table tier against the sphere: ${fmt(m)}`);
});
