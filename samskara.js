/* samskara.js — संस्कार: correcting the text's OWN numbers from recorded observations, the way the tradition did — the
 * paramparā's own records first (the dated eclipses of Parameśvara and Nīlakaṇṭha, corpus/parampara/registry.json →
 * corpus/jyotirmimamsa/readings.json), the owner's own when he gives them — by bīja (a small change to a revolution
 * number) and dhruva (a new mean place at a declared epoch) — and never by borrowing a number. Every observation enters
 * through the text's own forward model; every correction is a change to one of the text's own parameters; nothing is
 * computed, seeded or refereed by any modern ephemeris or table.
 *
 * THE PARAMETERS (each switchable by name; the fit moves only those named in opts.params):
 *   <body>.rev          revolutions in a yuga: sun 4,320,000, moon 57,753,336, moonApogee 488,203, node 232,238 (westward)
 *                       [text: SS 1.29-1.33 via sphuta.js]; or Āryabhaṭa's 488,219 / 232,226 [parahita-madhyama.js] with
 *                       canon "aryabhata". A change δn is counted from the declared epoch: Δλ = δn × (t − epoch) ÷ civil days
 *                       of the yuga × 360°, so it does not jump the Kali-0 place (with 1811/4 yugas elapsed a whole revolution
 *                       counted from creation turns the Kali-0 place by ¾ of a circle; the whole-number form below restores it).
 *   <body>.epoch        the mean place at the declared epoch, arcminutes (the dhruva; reported at Kali 0 too). Also sunApogee.epoch.
 *   sun|moon.paridhi.even|odd   the manda epicycles at the even and odd ends, 14 / 13°40′ and 32 / 31°40′ [SS 2.34-2.38].
 *   moon.latitude       the greatest latitude, 270′ [SS 1.68].
 *   ayanamsha.phase | .amplitude | .rate   the libration arc's phase (0 at Kali 0), the greatest ayanāṃśa (27° = ³⁄₁₀ of 90°)
 *                       and the librations in a yuga (600) [SS 3.9-3.10 via sphuta.js].
 *   <planet>.rev | .epoch | .mandocca.epoch | .manda.even|odd | .sighra.even|odd   the five star-planets [ss-graha.js]
 *                       (for Mercury and Venus .rev is the śīghrocca's, the mean planet being the mean Sun, SS 1.29).
 *
 * THE OBSERVATION EQUATIONS (residual = observed − the text's prediction, each in the instrument's own unit):
 *   chaya         a noon shadow, aṅgula/vyaṅgula: the text's noon shadow of its sāyana Sun (SS 3.20b-3.22a, ss-chaya.js),
 *                 signed north +; σ in vyaṅgula. The shadow is compared, not inverted: near a solstice it hardly moves, and
 *                 the equation says so by itself.
 *   surya-sayana  a shadow-Sun already reduced (ss-chaya.js reduce → chāyārka): sāyana true Sun, arcmin.
 *   surya, candra the sidereal true Sun or Moon, arcmin (candra: a Moon–yogatārā timing; σ may be given in vināḍī of time;
 *                 polar: true compares the Moon's place on its circle through the dhruva, as SS 8.14-8.15 judge a conjunction).
 *   grahana       a lunar eclipse, any of its sparśa, madhya and mokṣa timed: each moment (SS 4.7-4.17 on the model's own
 *                 places: middle at the true opposition, discs 4.1-4.5 and half-durations 4.12-4.13 from ss-grahana.js, the
 *                 latitude recomputed at the contact) − observed, in vināḍī; plus the inequality "an eclipse is possible" (4.11).
 *                 The middle carries Moon − Sun; the half-duration carries the latitude, so the node.
 *   grahana-abhava  a pūrṇimā with no eclipse seen: |latitude| ≥ the half-sum (4.11), an inequality.
 *   darshana      the first evening the crescent was seen, day N: kālāṃśa(N) ≥ 12 and kālāṃśa(N − 1) < 12 (SS 10.1, 9.5,
 *                 each body on its own horizon as ss-udaya.js/ss-drishya.js; the text's sunset): two inequalities; or one
 *                 evening with seen: true | false, one inequality.
 *   graha         a planet's sidereal longitude, arcmin (the four operations of SS 2.43-2.45, ss-graha.js).
 *   madhyama      a mean place (a karaṇa's dhruva, or the mean Sun of SS 3.20a), arcmin — the only kind the "aryabhata"
 *                 canon takes, since its true places need epicycles no local edition attests.
 *   ayanamsha     an ayanāṃśa found from star transits, arcmin.
 * Partial derivatives are central differences on the text's own model; the time-to-contact root finding is inside them.
 * Inequalities enter as one-sided rows (active only while violated), the exterior form of a constraint.
 *
 * THE SOLVER: weighted least squares by Gauss-Newton, in coordinates scaled by each parameter's SCALE (the largest
 * correction worth considering — an engineering choice, not a text number; opts.scales overrides). THE IDENTIFIABILITY
 * FREEZE, before the first step: a parameter that no row depends on is frozen ("unseen"); then the scaled normal matrix
 * (JᵀWJ) is decomposed by Jacobi rotations (no library), and while its weakest direction is determined worse than one
 * scale unit (σ > opts.freezeAbove, default 1) or its condition exceeds opts.conditionMax (1e12), the parameter carrying
 * the largest share of that direction is frozen — held at the text's value — as "degenerate" when others share the
 * direction (the data see only a combination) or "weak" when it stands alone. Every frozen parameter is reported with
 * its direction, its σ and the reason in words. Uncertainties are the formal σ from the stated instrument resolutions.
 *
 * THE TWO BĪJA FORMS (the owner's decision §7.9 recommends (a) for his own corrections, (b) only for replaying):
 *   (a) whole-number Δbhagaṇa: each fitted δn is rounded to an integer, the epochs are re-fitted with the rates held there,
 *       and the corrected place is frac(R′·(Q + days ÷ Y)) + D with R′ = R + ΔR an integer and D a whole number of vikalās —
 *       an exact residue that returns to itself after a yuga: the madhyama wheel stays closed, and so does the whole chain of
 *       SS 1.34-1.39 (risings, lunar months, adhimāsa, tithis, tithikṣaya stay integers).
 *   (b) the Śakābda form, as parahita-madhyama.js represents the Parahita rule: minutes SUBTRACTED = (mul ÷ div) × (Śaka
 *       years − zero year), with mul/div the simplest fraction within the rate's σ. It reproduces the paramparā's rule
 *       exactly when the data are the paramparā's places, and it opens the wheel unless 200·mul/div is a whole number.
 * THE MEMORY LAYER: the corrected integers as Kaṭapayādi words (katapayadi.js encodeInteger, decoded back as a check), and
 * as bhūtasaṅkhyā words from a lexicon the caller builds from the text's own verse words (lexiconFromVerses), so no word
 * here is invented.
 *
 * Tags, from each record's `source` (owner 2026-10-08: "use those observations as data"): a result is "[synthetic]"
 * whenever any record says synthetic (and every synthetic record must name its generator); "[paramparā]" when every record
 * is a historical one (source "parampara": the ancestors' recorded sightings, each with its locus); "[measured]" only when
 * every record is the owner's (source "owner", or no source — the ledger's records); "[paramparā+measured]" when both are
 * pooled, which happens only on request (opts.pool: true) — by default the two are never mixed. The model fitted is the
 * text's, not the sky's: the corrections describe how the recorded sky differs from the text within the text's own form
 * of motion.
 * THE DEFAULT PATH (owner, 2026-10-07: "use everything that aligns with 100% accuracy"): `correct(observations)` runs
 * `robust` — the least-squares fit, with any record beyond 4σ set aside one at a time and named — which uses every record
 * as the fit does and, like the median, is not moved by one wild record. `method: "median"` runs `dhruvaMedian` —
 * the median residual of each body at a declared epoch, in whole kalā, as Parameśvara corrected his dhruvas; and a rate
 * only from two epochs at least ten years apart, as a whole-number Δbhagaṇa or a Śakābda rate from a zero year. The
 * least-squares fit above is `correct(observations, { method: "lsq" })` (or `samskara`). A median does not move for one
 * wild record; the fit uses every kind of record (contacts, crescents, misses) and reports what the data cannot see.
 * THE OWNER'S LEDGER: `fromLedger(file, { catalogue })` reads a certified vedha-lekha/1 ledger (vedha-lekha.js reduce):
 * the shadows through `fromVedha`, each lunar eclipse's contacts as one `grahana`, each evening crescent as `darshana`
 * with `seen`, and each Moon–junction-star timing as a polar `candra` at the star's dhruvaka (8.14-8.15). Star transits
 * set the site and the clock (tier a) and enter no motion; morning crescents are listed as not used. Each solar eclipse's
 * contacts enter as one `grahana-surya` (council KH-03): the text's own ch.5 parallax held, the conjunction and the latitude
 * carried on the model; and `grahana-drishta` takes an eclipse seen or not seen, untimed, against 6.13's limit.
 * Browser: window.Samskara (needs Sphuta, ParahitaMadhyama, Katapayadi, KalaDvara, SSUdaya, SSChaya, SSGraha, SSGrahana,
 * SSDrishya, VedhaLekha); node: module.exports.
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory(require("./sphuta.js"), require("./parahita-madhyama.js"), require("./katapayadi.js"), require("./kala-dvara.js"), require("./ss-udaya.js"), require("./ss-chaya.js"), require("./ss-graha.js"), require("./ss-grahana.js"), require("./ss-drishya.js"), require("./vedha-lekha.js"));
  else root.Samskara = factory(root.Sphuta, root.ParahitaMadhyama, root.Katapayadi, root.KalaDvara, root.SSUdaya, root.SSChaya, root.SSGraha, root.SSGrahana, root.SSDrishya, root.VedhaLekha);
})(typeof globalThis !== "undefined" ? globalThis : this, function samskaraOf(S, PM, KP, K, U, C, GR, GH, D, V) {
  "use strict";
  const SPD = S.SPD, R = S.R, SPD_N = Number(S.SPD);
  const VINADI_PER_DAY = 3600;                                          // 60 nāḍī × 60 vināḍī (SS 1.11)
  const mod = (a, m) => ((a % m) + m) % m;
  const wrapArcmin = (a) => mod(a + 10800, 21600) - 10800;
  const bmod = (a, m) => ((a % m) + m) % m;
  const big = (x) => (typeof x === "bigint" ? x : BigInt(x));
  const TWO53 = 9007199254740992n;
  const fracDeg = (num, den) => Number((num * TWO53) / den) / 9007199254740992 * 360;

  // ── exact rationals {num, den} ─────────────────────────────────────────────────────────────────────
  const gcdB = (a, b) => { a = a < 0n ? -a : a; b = b < 0n ? -b : b; while (b) [a, b] = [b, a % b]; return a; };
  const rat = (num, den = 1n) => { num = big(num); den = big(den); if (den < 0n) { num = -num; den = -den; } const g = gcdB(num, den) || 1n; return { num: num / g, den: den / g }; };
  const toRat = (x) => (typeof x === "bigint" ? rat(x) : typeof x === "number" ? (Number.isInteger(x) ? rat(BigInt(x)) : (() => { throw new TypeError("samskara: an exact value must be an integer or {num, den}"); })()) : rat(x.num, x.den));
  const ratNum = ({ num, den }) => { const q = num / den, r = num - q * den; return Number(q) + Number((r * 1000000000000000n) / den) / 1e15; };
  const ratEq = (a, b) => a.num * b.den === b.num * a.den;

  // ── the two canons ─────────────────────────────────────────────────────────────────────────────────
  const CANONS = Object.freeze({
    surya: Object.freeze({ name: "surya", Y: S.YUGA_DAYS, qNum: 1811n, qDen: 4n, trueplaces: true,
      rev: Object.freeze({ sun: S.REV.sun, moon: S.REV.moon, moonApogee: S.REV.moonApogee, node: S.REV.node }),
      source: "Sūrya-Siddhānta 1.29-1.37, 1.45-1.47 (sphuta.js): frac(R·(1811/4 + days/1,577,917,828))" }),
    aryabhata: Object.freeze({ name: "aryabhata", Y: PM.YUGA_DAYS, qNum: 3n, qDen: 4n, trueplaces: false,
      rev: Object.freeze({ sun: PM.REV.sun, moon: PM.REV.moon, moonApogee: PM.REV.apogee, node: PM.REV.node }),
      source: "Āryabhaṭīya, Gītikāpāda 3 (parahita-madhyama.js): frac(R·(3/4 + days/1,577,917,500)); mean places only" }),
  });
  const BODIES = Object.freeze(["sun", "moon", "moonApogee", "node"]);
  const RETRO = Object.freeze({ node: true });
  const PM_NAME = Object.freeze({ sun: "sun", moon: "moon", moonApogee: "apogee", node: "node" });
  const SAKA_KALI = 3179;                                               // Śaka elapsed = Kali elapsed − 3179 (parahita-madhyama.js)
  const canonOf = (name) => { const c = CANONS[name || "surya"]; if (!c) throw new RangeError(`samskara: unknown canon "${name}"`); return c; };

  // ── the parameter catalogue ────────────────────────────────────────────────────────────────────────
  const PARAMS = {};
  const def = (name, spec) => { PARAMS[name] = Object.freeze({ name, ...spec }); };
  for (const b of BODIES) {
    const fast = b === "sun" || b === "moon";
    def(`${b}.rev`, { kind: "rev", body: b, unit: "revolutions a yuga", scale: fast ? 100 : 1000, step: fast ? 1 : 10 });
    def(`${b}.epoch`, { kind: "epoch", body: b, unit: "arcmin", scale: fast ? 60 : 600, step: fast ? 0.05 : 0.5 });
  }
  def("sunApogee.epoch", { kind: "epoch", body: "sunApogee", unit: "arcmin", scale: 600, step: 0.5 });
  for (const b of ["sun", "moon"]) for (const end of ["even", "odd"]) def(`${b}.paridhi.${end}`, { kind: "paridhi", body: b, end, unit: "degrees of the epicycle", scale: 1, step: 0.01 });
  def("moon.latitude", { kind: "latitude", body: "moon", unit: "arcmin", scale: 30, step: 0.1 });
  def("ayanamsha.phase", { kind: "ayanamsha", unit: "degrees of the libration arc", scale: 2, step: 0.01 });
  def("ayanamsha.amplitude", { kind: "ayanamsha", unit: "degrees (the greatest ayanāṃśa)", scale: 2, step: 0.01 });
  def("ayanamsha.rate", { kind: "ayanamsha", unit: "librations a yuga", scale: 10, step: 0.1 });
  for (const p of GR.NAMES) {
    def(`${p}.rev`, { kind: "rev", body: p, planet: true, unit: "revolutions a yuga", scale: 100, step: 1 });
    def(`${p}.epoch`, { kind: "epoch", body: p, planet: true, unit: "arcmin", scale: 60, step: 0.05 });
    def(`${p}.mandocca.epoch`, { kind: "epoch", body: `${p}.mandocca`, planet: true, unit: "arcmin", scale: 600, step: 0.5 });
    for (const op of ["manda", "sighra"]) for (const end of ["even", "odd"]) def(`${p}.${op}.${end}`, { kind: "paridhi", body: p, op, end, planet: true, unit: "degrees of the epicycle", scale: 2, step: 0.01 });
  }
  Object.freeze(PARAMS);
  const DEFAULT_PARAMS = Object.freeze({
    surya: Object.freeze(["sun.epoch", "sun.rev", "moon.epoch", "moon.rev", "moonApogee.epoch", "moonApogee.rev", "node.epoch", "node.rev", "ayanamsha.phase"]),
    aryabhata: Object.freeze(["sun.epoch", "sun.rev", "moon.epoch", "moon.rev", "moonApogee.epoch", "moonApogee.rev", "node.epoch", "node.rev"]),
  });
  /** The text's value of a parameter (the epochs: its mean place at day `t`, degrees). */
  function textValue(name, canon, t, ctx) {
    const s = PARAMS[name];
    if (s.kind === "rev") return s.planet ? Number(GR.PLANETS[s.body].rev) : Number(canon.rev[s.body]);
    if (s.kind === "epoch") {
      if (s.planet) { const m = GR.meanPlaces(t)[name.split(".")[0]]; return s.body.endsWith("mandocca") ? m.mandocca : (GR.PLANETS[s.body].inner ? m.sighrocca : m.mean); }
      return ctx.base(t)[s.body];
    }
    if (s.kind === "paridhi") {
      if (s.planet) return GR.PLANETS[s.body][s.op][s.end === "even" ? 0 : 1];
      return S.PARIDHI[s.body][s.end === "even" ? 0 : 1];
    }
    if (s.kind === "latitude") return S.MOON_MAX_LATITUDE_ARCMIN;
    if (name === "ayanamsha.phase") return 0;
    if (name === "ayanamsha.amplitude") return 27;
    if (name === "ayanamsha.rate") return 600;
    return 0;
  }

  // ── the forward model: the text's own places with the parameters moved ─────────────────────────────
  /** Exact mean places of the canon at day t (cached; the BigInt residues of sphuta.js / parahita-madhyama.js). */
  function baseOf(canon) {
    const cache = new Map();
    const den600 = 4n * canon.Y * SPD;
    return function base(t) {
      let b = cache.get(t);
      if (b) return b;
      const Sp = S.spandasOfDays(t);
      if (canon.name === "surya") {
        const m = S.madhyama(Sp);
        const theta = fracDeg(bmod(600n * (1811n * canon.Y * SPD + 4n * Sp), den600), den600);   // 3.9: 600 librations a yuga
        b = { sun: m.sun, moon: m.moon, moonApogee: m.moonApogee, node: m.node, sunApogee: m.sunApogee, theta };
      } else {
        b = {};
        for (const k of BODIES) b[k] = ratNum(PM.meanArcsec(PM_NAME[k], Sp)) / 3600;
      }
      if (cache.size > 200000) cache.clear();
      cache.set(t, b);
      return b;
    };
  }
  function planetBaseOf() {
    const cache = new Map();
    return (t) => { let b = cache.get(t); if (!b) { b = GR.meanPlaces(t); if (cache.size > 100000) cache.clear(); cache.set(t, b); } return b; };
  }
  /** Four operations of SS 2.43-2.44 (ss-graha.js fourSteps) with the epicycle pairs given. */
  function fourStepsWith(m, mandaPair, sighraPair) {
    const s1 = GR.sighra(m.sighrocca - m.mean, sighraPair);
    const p1 = mod(m.mean + s1.degrees / 2, 360);
    const m2 = GR.manda(m.mandocca - p1, mandaPair);
    const p2 = mod(p1 + m2.degrees / 2, 360);
    const m3 = GR.manda(m.mandocca - p2, mandaPair);
    const p3 = mod(m.mean + m3.degrees, 360);
    const s4 = GR.sighra(m.sighrocca - p3, sighraPair);
    return mod(p3 + s4.degrees, 360);
  }
  /** The model at parameter changes x ({ name: δ }). ctx = { canon, epoch, base, planetBase }. */
  function buildModel(ctx, x) {
    const c = ctx.canon, Yn = Number(c.Y), tRef = ctx.epoch, base = ctx.base, perDay = 360 / Yn;
    const d = (k) => x[k] || 0;
    const L = {};
    for (const b of BODIES) L[b] = { e: d(`${b}.epoch`) / 60, n: (RETRO[b] ? -1 : 1) * d(`${b}.rev`) * perDay };
    const sunApogeeE = d("sunApogee.epoch") / 60;
    const pairSun = [S.PARIDHI.sun[0] + d("sun.paridhi.even"), S.PARIDHI.sun[1] + d("sun.paridhi.odd")];
    const pairMoon = [S.PARIDHI.moon[0] + d("moon.paridhi.even"), S.PARIDHI.moon[1] + d("moon.paridhi.odd")];
    const incl = S.MOON_MAX_LATITUDE_ARCMIN + d("moon.latitude");
    const ay = { phase: d("ayanamsha.phase"), amp: 27 + d("ayanamsha.amplitude"), rate: d("ayanamsha.rate") * perDay };
    const needTrue = () => { if (!c.trueplaces) throw new RangeError(`samskara: the "${c.name}" canon has mean places only (use madhyama observations)`); };
    function mean(t) {
      const b = base(t), tau = t - tRef, out = {};
      for (const k of BODIES) out[k] = mod(b[k] + L[k].e + L[k].n * tau, 360);
      if (b.sunApogee !== undefined) out.sunApogee = mod(b.sunApogee + sunApogeeE, 360);
      return out;
    }
    /** True Sun and Moon (sidereal degrees), the node, and the Moon's latitude (arcmin): SS 2.29-2.45, 2.57. */
    function places(t) {
      needTrue();
      const m = mean(t);
      const sun = mod(m.sun + S.mandaPhala(m.sun, m.sunApogee, pairSun).degrees, 360);
      const moon = mod(m.moon + S.mandaPhala(m.moon, m.moonApogee, pairMoon).degrees, 360);
      return { sun, moon, node: m.node, latitude: S.jya(moon - m.node) * incl / R, mean: m };
    }
    /** SS 3.9-3.10 with the libration's phase, amplitude and rate moved. */
    function ayanamsha(t) {
      needTrue();
      const b = S.bhuja(base(t).theta + ay.phase + ay.rate * (t - tRef));
      return -b.sign * ay.amp / 90 * b.bhuja;
    }
    const sayanaSun = (t) => mod(places(t).sun + ayanamsha(t), 360);
    /** True daily motion, arcmin a civil day, by the places half a day either side (as utsava.js and ss-drishya.js do). */
    function motion(t, body) { const a = places(t - 0.5), b = places(t + 0.5); return wrapArcmin((b[body] - a[body]) * 60); }
    function planet(name, t) {
      needTrue();
      const p = GR.PLANETS[name];
      if (!p) throw new RangeError(`samskara: unknown planet "${name}"`);
      const bm = ctx.planetBase(t)[name], tau = t - tRef;
      const sunShift = L.sun.e + L.sun.n * tau, own = d(`${name}.epoch`) / 60 + d(`${name}.rev`) * perDay * tau;
      const m = { mean: mod(bm.mean + (p.inner ? sunShift : own), 360), sighrocca: mod(bm.sighrocca + (p.inner ? own : sunShift), 360),
        mandocca: mod(bm.mandocca + d(`${name}.mandocca.epoch`) / 60, 360) };
      return fourStepsWith(m, [p.manda[0] + d(`${name}.manda.even`), p.manda[1] + d(`${name}.manda.odd`)],
        [p.sighra[0] + d(`${name}.sighra.even`), p.sighra[1] + d(`${name}.sighra.odd`)]);
    }
    return { x, ctx, mean, places, ayanamsha, sayanaSun, motion, planet };
  }
  function contextOf(canonName, epoch) {
    const canon = canonOf(canonName);
    if (!Number.isFinite(epoch)) throw new TypeError("samskara: the epoch is a Kali day");
    return { canon, epoch, base: baseOf(canon), planetBase: planetBaseOf() };
  }
  /** The model at the text's values moved by `deltas`, about a declared epoch (Kali day). */
  function model(deltas, opts = {}) { return buildModel(contextOf(opts.canon, opts.epoch ?? 0), deltas || {}); }

  // ── events on the model: opposition, conjunction, the lunar eclipse, the crescent ───────────────────
  /** The instant near t0 at which Moon − Sun = target degrees (Newton on the model's own places). */
  function syzygy(M, t0, target) {
    let t = t0;
    for (let i = 0; i < 40; i++) {
      const p = M.places(t), h = 1e-4, q = M.places(t + h);
      const f = wrapArcmin((p.moon - p.sun - target) * 60), f2 = wrapArcmin((q.moon - q.sun - target) * 60);
      const step = -f * h / (f2 - f);
      t += Math.max(-3, Math.min(3, step));
      if (Math.abs(step) < 1e-11) break;
    }
    return t;
  }
  /** The instant near t0 at which the Moon's sidereal longitude is `lambda`. */
  function moonAt(M, lambda, t0) {
    let t = t0;
    for (let i = 0; i < 40; i++) {
      const h = 1e-4, f = wrapArcmin((M.places(t).moon - lambda) * 60), f2 = wrapArcmin((M.places(t + h).moon - lambda) * 60);
      const step = -f * h / (f2 - f);
      t += Math.max(-3, Math.min(3, step));
      if (Math.abs(step) < 1e-11) break;
    }
    return t;
  }
  /** The text's lunar eclipse (SS 4) on the model: middle at the true opposition near t0 (4.7-4.8, 4.16), discs from the
   *  model's true motions (4.1-4.5, ss-grahana discsFrom), possibility (4.11), half-durations with the latitude at each
   *  contact recomputed until fixed (4.12-4.15, ss-grahana ardhas). Times in days since the Kali epoch. */
  function lunarEclipse(M, t0) {
    const tm = syzygy(M, t0, 180);
    const b = { sun: M.motion(tm, "sun"), moon: M.motion(tm, "moon") };
    const discs = GH.discsFrom(b), grahya = discs.moon, grahaka = discs.shadow, rate = b.moon - b.sun;
    const beta = M.places(tm).latitude, halfSum = (grahya + grahaka) / 2;
    const E = { middle: tm, latitude: beta, halfSum, discs: { moon: grahya, shadow: grahaka }, rate, possible: Math.abs(beta) < halfSum,
      magnitude: (halfSum - Math.abs(beta)) / grahya, sparsha: null, moksha: null };
    if (!E.possible) return E;
    const contact = (side) => {
      let n = GH.ardhas(grahya, grahaka, beta, rate).sthiti;
      for (let i = 0; i < 200; i++) {
        const nn = GH.ardhas(grahya, grahaka, M.places(tm + side * n / 60).latitude, rate).sthiti;
        if (!(nn > 0)) return tm;
        if (Math.abs(nn - n) < 1e-12) { n = nn; break; }
        n = nn;
      }
      return tm + side * n / 60;
    };
    E.sparsha = contact(-1); E.moksha = contact(+1);
    return E;
  }
  const palabhaOfSite = (site) => (typeof site.palabha === "number" ? site.palabha : C.palabhaOfLatitude(site.latitude).palabha);
  /** SS 10.1 with 9.5, each body on its own horizon (ss-udaya.js, the default of ss-drishya.js): the signed kālāṃśa of the
   *  Moon after the Sun at the western horizon at instant t (a sunset), on the model's places and ayanāṃśa. */
  function kalamsaWest(M, t, palabha) {
    const p = M.places(t), A = M.ayanamsha(t), sun = mod(p.sun + A, 360), moon = mod(p.moon + A, 360);
    const x = U.bodyHorizonAsus(moon, p.latitude, palabha, "west") - U.horizonAsus(sun, U.kranti(sun), palabha, "west");
    return wrapArcmin(x) / U.KALAMSA;
  }
  /** The text's sunset of civil day N at the site (ss-drishya.js sunEvent): the observer's own sunset, held fixed. */
  const sunsetOf = (N, site) => D.sunEvent(N, site, "set");

  // ── the solar eclipse on the model (SS 4 with 5) ──────────────────────────────────────────────────────
  // The text's own solar eclipse at the site (ss-grahana.js: the parva, the lambana iterated by 5.9, the nati of 5.10-5.12)
  // gives the contacts at the text's values. Under a correction the conjunction moves with Moon − Sun and the half-durations
  // with the Moon's latitude (the node), the discs and the rate; those are carried on the model, and the parallax of ch.5
  // — a function of the Sun's place and the hour, which a correction of minutes moves by a second-order amount — is held at
  // the text's value [reading]. Times in days since the Kali epoch.
  const textModels = new WeakMap();
  const textModelOf = (M) => { let M0 = textModels.get(M.ctx); if (!M0) { M0 = buildModel(M.ctx, {}); textModels.set(M.ctx, M0); } return M0; };
  function solarOnModel(M, E0) {
    const k0 = E0._k, nati = (t) => k0.trueLat(t) - k0.latFn(t);             // 5.10-5.12 at the text's values, held
    const M0 = textModelOf(M);
    const c0 = syzygy(M0, E0.parva.days, 0), shift = syzygy(M, c0, 0) - c0;  // the conjunction on each model (4.8)
    const tm = E0.middle + shift;
    const geom = (MM, t) => {
      const b = { sun: MM.motion(t, "sun"), moon: MM.motion(t, "moon") }, d = GH.discsFrom(b);
      const beta = MM.places(t).latitude - nati(t - (MM === M0 ? 0 : shift));
      return { beta, halfSum: (d.sun + d.moon) / 2, sthiti: GH.ardhas(d.sun, d.moon, beta, b.moon - b.sun).sthiti, grahya: d.sun };
    };
    const at = (c) => {
      if (c === "madhya" || E0.contacts[c] === null || E0.contacts[c] === undefined) return E0.middle + shift;
      const s = c === "sparsha" ? -1 : 1, t0 = E0.contacts[c], g0 = geom(M0, t0), g = geom(M, t0 + shift);
      const d = (g.sthiti > 0 ? g.sthiti : 0) - (g0.sthiti > 0 ? g0.sthiti : 0);     // nāḍīs
      return t0 + shift + s * d / 60;
    };
    const g = geom(M, tm);
    return { middle: tm, shift, at, channa: g.halfSum - Math.abs(g.beta), halfSum: g.halfSum, latitude: g.beta, grahya: g.grahya };
  }
  const solarText = new Map();
  function textSolar(near, site, id) {
    const key = `${near}|${site.latitude}|${site.deshantara}|${site.palabha}`;
    if (!solarText.has(key)) solarText.set(key, GH.solarEclipse(near, site));
    const E0 = solarText.get(key);
    if (!E0 || !E0._k) throw new RangeError(`samskara: ${id}: the text gives no solar parva near this time`);
    return E0;
  }

  // ── observations → equations ────────────────────────────────────────────────────────────────────────
  const COMMON = ["id", "kind", "synthetic", "generator", "observer", "note", "source", "locus"];
  // where a record comes from: the paramparā's recorded sightings (with a locus in a text) or the owner's own ledger
  const SOURCES = Object.freeze(["parampara", "owner"]);
  const sourceOf = (o) => (o && o.source !== undefined ? o.source : "owner");
  /** The tag of a set of records (see the header): synthetic overrides; then paramparā, owner, or both pooled. */
  function tagOf(observations) {
    if (observations.some((o) => o.synthetic)) return "[synthetic]";
    const s = new Set(observations.map(sourceOf));
    return s.size === 2 ? "[paramparā+measured]" : s.has("parampara") ? "[paramparā]" : "[measured]";
  }
  /** The paramparā's records and the owner's are fitted together only when the caller asks (opts.pool: true). */
  function checkSources(observations, opts) {
    for (const o of observations) {
      if (!o || o.source === undefined) continue;
      if (!SOURCES.includes(o.source)) throw new RangeError(`samskara: ${o.id}.source is "parampara" or "owner"`);
      if (o.source === "parampara" && !(typeof o.locus === "string" && o.locus)) throw new RangeError(`samskara: ${o.id} is a paramparā record and must name its locus in a text`);
    }
    if (new Set(observations.map(sourceOf)).size === 2 && opts.pool !== true) throw new RangeError("samskara: the paramparā's records and the owner's are pooled only on request (opts.pool: true); by default each is fitted on its own");
  }
  const FIELDS = Object.freeze({
    chaya: ["t", "day", "site", "palabha", "chaya", "dir", "ayana", "sigmaVyangula"],
    "surya-sayana": ["t", "lambda", "sigma"],
    surya: ["t", "lambda", "sigma"],
    candra: ["t", "lambda", "sigma", "sigmaVinadi", "star", "polar"],
    graha: ["planet", "t", "lambda", "sigma"],
    madhyama: ["body", "t", "lambda", "sigma"],
    ayanamsha: ["t", "value", "sigma"],
    grahana: ["sparsha", "madhya", "moksha", "sigmaVinadi"],
    "grahana-surya": ["site", "sparsha", "madhya", "moksha", "near", "sigmaVinadi"],
    "grahana-drishta": ["body", "near", "site", "seen", "sigma"],
    "grahana-abhava": ["near", "sigma"],
    darshana: ["N", "site", "seen", "sigmaKalamsa"],
  });
  const only = (o, keys, where) => {
    for (const k of Object.keys(o)) if (!keys.includes(k)) throw new RangeError(`samskara: ${where} has a field "${k}" this kind does not take (only ${keys.join(", ")})`);
  };
  /** A time: days since the Kali epoch, or { kali, kapala: {ghati, vinadi, prana}, calibration } read by kala-dvara.js
   *  (a kapāla counts nāḍīs of the turn unless calibration is "savana"; counted from the Kali day's origin). */
  function daysOf(v, where, canonName) {
    if (typeof v === "number" && Number.isFinite(v)) return v;
    if (v && typeof v === "object" && v.kali !== undefined) {
      only(v, ["kali", "kapala", "calibration"], where);
      if (!Number.isInteger(v.kali)) throw new TypeError(`samskara: ${where}.kali must be an integer`);
      const r = K.savanaSpandasAt(v.kali, v.kapala || {}, { calibration: v.calibration || "nakshatra", canon: canonName === "aryabhata" ? "aryabhata" : "surya" });
      const frac = r.num - BigInt(v.kali) * SPD * r.den;
      return v.kali + ratNum(rat(frac, r.den * SPD));
    }
    throw new TypeError(`samskara: ${where} is days since the Kali epoch or { kali, kapala, calibration }`);
  }
  const shadowAngula = (v, where) => C.angulaOf(v, where);
  const signedShadow = (chaya, dir) => (dir === "N" ? 1 : dir === "S" ? -1 : (() => { throw new RangeError('samskara: a shadow points "N" or "S"'); })()) * chaya;

  /** One observation → { id, kind, t, rows: [{ what, unit, observed, sigma, arc, ineq, margin }], predict(M) → values }. */
  function equationOf(o, canon, ctxTimes) {
    if (!o || typeof o !== "object") throw new TypeError("samskara: an observation is an object");
    if (typeof o.id !== "string" || !o.id) throw new TypeError("samskara: every observation needs an id");
    if (!FIELDS[o.kind]) throw new RangeError(`samskara: ${o.id} has an unknown kind "${o.kind}" (${Object.keys(FIELDS).join(", ")})`);
    only(o, [...COMMON, ...FIELDS[o.kind]], o.id);
    if (o.synthetic !== undefined && typeof o.synthetic !== "boolean") throw new TypeError(`samskara: ${o.id}.synthetic is true or false`);
    if (o.synthetic && !o.generator) throw new RangeError(`samskara: ${o.id} is synthetic and must say what generated it`);
    if (!canon.trueplaces && o.kind !== "madhyama") throw new RangeError(`samskara: the "${canon.name}" canon takes madhyama observations only (${o.id})`);
    const base = { id: o.id, kind: o.kind, synthetic: !!o.synthetic };
    const arcRow = (what, observedDeg, sigma) => ({ what, unit: "arcmin", observed: observedDeg * 60, sigma, arc: true });
    const need = (v, what) => { if (!(typeof v === "number" && Number.isFinite(v))) throw new TypeError(`samskara: ${o.id} needs ${what}`); return v; };
    const sigmaOf = (dflt) => { const s = o.sigma ?? dflt; if (!(s > 0)) throw new RangeError(`samskara: ${o.id}.sigma must be > 0`); return s; };
    switch (o.kind) {
      case "chaya": {
        const site = o.site || {};
        const palabha = o.palabha !== undefined ? shadowAngula(o.palabha, `${o.id}.palabha`) : palabhaOfSite(site);
        const t = o.t !== undefined ? daysOf(o.t, `${o.id}.t`, canon.name)
          : (o.day && Number.isInteger(o.day.kali) ? o.day.kali : K.kaliDayFromCivil(o.day)) + 0.5 - (site.deshantara || 0) / 360;   // local mean noon
        const sig = o.sigmaVyangula ?? 1;
        const obs = signedShadow(shadowAngula(o.chaya, `${o.id}.chaya`), o.dir) * 60;
        return { ...base, t, palabha, rows: [{ what: "noon shadow (SS 3.20b-3.22a)", unit: "vyaṅgula", observed: obs, sigma: sig }],
          predict: (M) => { const n = C.noonShadow(M.sayanaSun(t), palabha); return [(n.dir === "N" ? 1 : -1) * n.chaya * 60]; } };
      }
      case "surya-sayana": {
        const t = daysOf(o.t, `${o.id}.t`, canon.name);
        return { ...base, t, rows: [arcRow("sāyana Sun (chāyārka)", need(o.lambda, "lambda"), sigmaOf(10))], predict: (M) => [M.sayanaSun(t) * 60] };
      }
      case "surya": {
        const t = daysOf(o.t, `${o.id}.t`, canon.name);
        return { ...base, t, rows: [arcRow("true Sun", need(o.lambda, "lambda"), sigmaOf(1))], predict: (M) => [M.places(t).sun * 60] };
      }
      case "candra": {
        const t = daysOf(o.t, `${o.id}.t`, canon.name);
        let sig = o.sigma;
        if (sig === undefined && o.sigmaVinadi !== undefined) sig = o.sigmaVinadi / VINADI_PER_DAY * Math.abs(ctxTimes.textMotion(t, "moon"));
        // polar: the Moon's place on its circle through the dhruva (a conjunction judged by the dhruvaka, SS 8.14-8.15): the
        // āyana part of 7.10 as ss-udaya.js bodyHorizonAsus applies it, latitude′ × the declination of (sāyana λ + 90°) ÷ 3600
        const at = (M) => { const p = M.places(t); return o.polar ? mod(p.moon - p.latitude * U.kranti(p.moon + M.ayanamsha(t) + 90) / 3600, 360) : p.moon; };
        return { ...base, t, rows: [arcRow(`${o.polar ? "polar" : "true"} Moon${o.star ? ` at ${o.star}` : ""}`, need(o.lambda, "lambda"), sig ?? 1)], predict: (M) => [at(M) * 60] };
      }
      case "graha": {
        const t = daysOf(o.t, `${o.id}.t`, canon.name);
        if (!GR.PLANETS[o.planet]) throw new RangeError(`samskara: ${o.id} names no planet of the text`);
        return { ...base, t, planet: o.planet, rows: [arcRow(`true ${o.planet}`, need(o.lambda, "lambda"), sigmaOf(5))], predict: (M) => [M.planet(o.planet, t) * 60] };
      }
      case "madhyama": {
        const t = daysOf(o.t, `${o.id}.t`, canon.name);
        if (!BODIES.includes(o.body)) throw new RangeError(`samskara: ${o.id}.body is one of ${BODIES.join(", ")}`);
        return { ...base, t, rows: [arcRow(`mean ${o.body}`, need(o.lambda, "lambda"), sigmaOf(1))], predict: (M) => [M.mean(t)[o.body] * 60] };
      }
      case "ayanamsha": {
        const t = daysOf(o.t, `${o.id}.t`, canon.name);
        return { ...base, t, rows: [arcRow("ayanāṃśa", need(o.value, "value"), sigmaOf(5))], predict: (M) => [M.ayanamsha(t) * 60] };
      }
      case "grahana": {
        // any of the three timed moments; each is a row: the text's moment − the observed, in vināḍī (residual = −that)
        const got = ["sparsha", "madhya", "moksha"].filter((k) => o[k] !== undefined).map((k) => [k, daysOf(o[k], `${o.id}.${k}`, canon.name)]);
        if (!got.length) throw new TypeError(`samskara: ${o.id} times none of sparsha, madhya, moksha`);
        const T = Object.fromEntries(got);
        if (T.sparsha !== undefined && T.moksha !== undefined && !(T.moksha > T.sparsha)) throw new RangeError(`samskara: ${o.id}: mokṣa must follow sparśa`);
        const sig = o.sigmaVinadi ?? 1, near = got.reduce((s, [, v]) => s + v, 0) / got.length;
        const NAME = { sparsha: "sparśa (SS 4.16)", madhya: "madhya (SS 4.16)", moksha: "mokṣa (SS 4.16)" };
        return { ...base, t: near, rows: [
          ...got.map(([k]) => ({ what: NAME[k], unit: "vināḍī", observed: 0, sigma: sig })),
          { what: "eclipse possible: half-sum − |latitude| (SS 4.11)", unit: "arcmin", sigma: 1, ineq: true, margin: 0.01 },
        ], predict: (M) => {
          const E = lunarEclipse(M, near), at = { sparsha: E.possible ? E.sparsha : E.middle, madhya: E.middle, moksha: E.possible ? E.moksha : E.middle };
          return [...got.map(([k, v]) => (at[k] - v) * VINADI_PER_DAY), E.halfSum - Math.abs(E.latitude)];
        } };
      }
      case "grahana-surya": {
        // a solar eclipse's timed contacts at a site: the text's moment on the model − the observed, in vināḍī, plus the
        // inequality "an eclipse is possible here" (4.11 with the nati of 5.12)
        const site = o.site;
        if (!site || typeof site.deshantara !== "number" || (typeof site.latitude !== "number" && site.palabha === undefined)) throw new TypeError(`samskara: ${o.id}.site needs { latitude or palabha, deshantara }`);
        const st = { latitude: site.latitude ?? 0, deshantara: site.deshantara, palabha: site.palabha !== undefined ? shadowAngula(site.palabha, `${o.id}.site.palabha`) : undefined };
        if (st.palabha === undefined) delete st.palabha;
        const got = ["sparsha", "madhya", "moksha"].filter((k) => o[k] !== undefined).map((k) => [k, daysOf(o[k], `${o.id}.${k}`, canon.name)]);
        if (!got.length) throw new TypeError(`samskara: ${o.id} times none of sparsha, madhya, moksha`);
        const near = o.near !== undefined ? daysOf(o.near, `${o.id}.near`, canon.name) : got.reduce((x, [, v]) => x + v, 0) / got.length;
        const E0 = textSolar(near, st, o.id);
        if (!E0.possible) throw new RangeError(`samskara: ${o.id}: the text gives no solar eclipse at this site; a seen eclipse the model misses is a result, not a row`);
        const sig = o.sigmaVinadi ?? 6;
        const NAME = { sparsha: "sparśa (SS 4.16, 5)", madhya: "madhya (SS 5.9)", moksha: "mokṣa (SS 4.16, 5)" };
        return { ...base, t: near, rows: [
          ...got.map(([k]) => ({ what: NAME[k], unit: "vināḍī", observed: 0, sigma: sig })),
          { what: "eclipse possible here: half-sum − |latitude − nati| (SS 4.11, 5.12)", unit: "arcmin", sigma: 1, ineq: true, margin: 0.01 },
        ], predict: (M) => { const X = solarOnModel(M, E0); return [...got.map(([k, v]) => (X.at(k) - v) * VINADI_PER_DAY), X.channa]; } };
      }
      case "grahana-drishta": {
        // an eclipse seen, or not seen, untimed: SS 6.13's limit as an inequality — a twelfth of the Moon; three minutes of the Sun
        if (o.body !== "candra" && o.body !== "surya") throw new RangeError(`samskara: ${o.id}.body is "candra" or "surya"`);
        if (typeof o.seen !== "boolean") throw new TypeError(`samskara: ${o.id}.seen is true or false`);
        const near = daysOf(o.near, `${o.id}.near`, canon.name), sg = sigmaOf(1), sign = o.seen ? 1 : -1;
        const what = `${o.seen ? "seen" : "not seen"}: ${o.seen ? "" : "−("}obscuration − the 6.13 limit${o.seen ? "" : ")"}`;
        if (o.body === "candra") return { ...base, t: near, rows: [{ what: `${what} (SS 4, 6.13: a twelfth of the Moon)`, unit: "arcmin", sigma: sg, ineq: true, margin: 0.01 }],
          predict: (M) => { const E = lunarEclipse(M, near); return [sign * (E.halfSum - Math.abs(E.latitude) - E.discs.moon / GH.TEXT.moonSeenPart)]; } };
        const site = o.site;
        if (!site || typeof site.deshantara !== "number") throw new TypeError(`samskara: ${o.id}.site needs { latitude or palabha, deshantara }`);
        const st = { latitude: site.latitude ?? 0, deshantara: site.deshantara, ...(site.palabha !== undefined ? { palabha: shadowAngula(site.palabha, `${o.id}.site.palabha`) } : {}) };
        const E0 = textSolar(near, st, o.id);
        return { ...base, t: near, rows: [{ what: `${what} (SS 4-5, 6.13: three minutes of the Sun)`, unit: "arcmin", sigma: sg, ineq: true, margin: 0.01 }],
          predict: (M) => { const X = solarOnModel(M, E0); return [sign * (X.channa - GH.TEXT.sunUnseenArcmin)]; } };
      }
      case "grahana-abhava": {
        const near = daysOf(o.near, `${o.id}.near`, canon.name);
        return { ...base, t: near, rows: [{ what: "no eclipse: |latitude| − half-sum (SS 4.11)", unit: "arcmin", sigma: sigmaOf(1), ineq: true, margin: 0.01 }],
          predict: (M) => { const E = lunarEclipse(M, near); return [Math.abs(E.latitude) - E.halfSum]; } };
      }
      case "darshana": {
        if (!Number.isInteger(o.N)) throw new TypeError(`samskara: ${o.id}.N is the civil day (Kali) of the first evening`);
        const site = o.site;
        if (!site || typeof site.latitude !== "number" || typeof site.deshantara !== "number") throw new TypeError(`samskara: ${o.id}.site needs { latitude, deshantara }`);
        const pb = palabhaOfSite(site), s1 = sunsetOf(o.N, site), sig = o.sigmaKalamsa ?? 0.5;
        if (o.seen !== undefined) {                                                 // one evening, seen or not (a ledger's record)
          if (typeof o.seen !== "boolean") throw new TypeError(`samskara: ${o.id}.seen is true or false`);
          return { ...base, t: s1, rows: [{ what: o.seen ? "seen: kālāṃśa − 12 (SS 10.1)" : "not seen: 12 − kālāṃśa (SS 10.1)", unit: "kālāṃśa", sigma: sig, ineq: true, margin: 0.02 * sig }],
            predict: (M) => [(o.seen ? 1 : -1) * (kalamsaWest(M, s1, pb) - U.DARSHANA_KALAMSA)] };
        }
        const s0 = sunsetOf(o.N - 1, site);                                         // the first evening: seen on N, not on N − 1
        return { ...base, t: s1, rows: [
          { what: "seen this evening: kālāṃśa − 12 (SS 10.1)", unit: "kālāṃśa", sigma: sig, ineq: true, margin: 0.02 * sig },
          { what: "not seen the evening before: 12 − kālāṃśa", unit: "kālāṃśa", sigma: sig, ineq: true, margin: 0.02 * sig },
        ], predict: (M) => [kalamsaWest(M, s1, pb) - U.DARSHANA_KALAMSA, U.DARSHANA_KALAMSA - kalamsaWest(M, s0, pb)] };
      }
    }
    throw new RangeError(`samskara: ${o.id}: kind ${o.kind}`);
  }

  // ── linear algebra: Jacobi's rotations for a symmetric matrix ────────────────────────────────────────
  /** Eigen-decomposition of a real symmetric matrix by cyclic Jacobi rotations (no library, no trigonometry: the rotation
   *  is t = sgn θ ÷ (|θ| + √(θ² + 1)), c = 1/√(t² + 1), s = t·c). Returns eigenvalues ascending with unit eigenvectors. */
  function jacobiEigen(A) {
    const n = A.length, a = A.map((r) => r.slice()), V = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)));
    let total = 0;
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) total += a[i][j] * a[i][j];
    let sweeps = 0;
    for (; sweeps < 100; sweeps++) {
      let off = 0;
      for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) off += a[i][j] * a[i][j];
      if (off <= 1e-32 * total || off === 0) break;
      for (let p = 0; p < n - 1; p++) for (let q = p + 1; q < n; q++) {
        const apq = a[p][q];
        if (apq === 0) continue;
        const theta = (a[q][q] - a[p][p]) / (2 * apq);
        const t = (theta >= 0 ? 1 : -1) / (Math.abs(theta) + Math.sqrt(theta * theta + 1));
        const c = 1 / Math.sqrt(t * t + 1), s = t * c;
        for (let k = 0; k < n; k++) { const kp = a[k][p], kq = a[k][q]; a[k][p] = c * kp - s * kq; a[k][q] = s * kp + c * kq; }
        for (let k = 0; k < n; k++) { const pk = a[p][k], qk = a[q][k]; a[p][k] = c * pk - s * qk; a[q][k] = s * pk + c * qk; }
        for (let k = 0; k < n; k++) { const vp = V[k][p], vq = V[k][q]; V[k][p] = c * vp - s * vq; V[k][q] = s * vp + c * vq; }
      }
    }
    const order = Array.from({ length: n }, (_, i) => i).sort((i, j) => a[i][i] - a[j][j]);
    return { values: order.map((i) => a[i][i]), vectors: order.map((i) => V.map((row) => row[i])), sweeps };
  }
  const normalOf = (cols) => cols.map((ci) => cols.map((cj) => { let s = 0; for (let k = 0; k < ci.length; k++) s += ci[k] * cj[k]; return s; }));

  // ── the fit ─────────────────────────────────────────────────────────────────────────────────────────
  function flatten(eqs) {
    const rows = [];
    eqs.forEach((e, i) => e.rows.forEach((r, j) => rows.push({ ...r, eq: i, j, id: e.id, kind: e.kind })));
    return rows;
  }
  function predictAll(eqs, M) { const out = []; for (const e of eqs) for (const v of e.predict(M)) out.push(v); return out; }
  /** Normalized residuals: equalities (observed − predicted)/σ; an inequality only while violated, (margin − g)/σ. */
  function residualsOf(rows, pred) {
    return rows.map((r, i) => {
      if (r.ineq) { const g = pred[i]; return g < (r.margin || 0) ? ((r.margin || 0) - g) / r.sigma : 0; }
      const d = r.arc ? wrapArcmin(r.observed - pred[i]) : r.observed - pred[i];
      return d / r.sigma;
    });
  }
  const isActive = (row, pred) => !row.ineq || pred < (row.margin || 0);
  function jacobianCols(eqs, rows, ctx, x, free, scales) {
    return free.map((name) => {
      const h = PARAMS[name].step, xp = { ...x, [name]: (x[name] || 0) + h }, xm = { ...x, [name]: (x[name] || 0) - h };
      const pp = predictAll(eqs, buildModel(ctx, xp)), pm = predictAll(eqs, buildModel(ctx, xm));
      return rows.map((r, i) => (r.arc ? wrapArcmin(pp[i] - pm[i]) : pp[i] - pm[i]) / (2 * h) * scales[name] / r.sigma);
    });
  }
  const chi2Of = (res) => res.reduce((s, r) => s + r * r, 0);

  /** The identifiability freeze on the scaled Jacobian columns (rows that carry information only). */
  function freezeAnalysis(names, cols, scales, opts) {
    const freezeAbove = opts.freezeAbove ?? 1, conditionMax = opts.conditionMax ?? 1e12;
    const frozen = [], free = [];
    const norms = cols.map((c) => Math.sqrt(c.reduce((s, v) => s + v * v, 0)));
    const maxNorm = Math.max(0, ...norms);
    names.forEach((n, i) => {
      if ((opts.freeze || []).includes(n)) frozen.push({ param: n, reason: "declared", why: "held at the text's value by the caller" });
      else if (!(norms[i] > 1e-12 * Math.max(1, maxNorm))) frozen.push({ param: n, reason: "unseen", why: "no observation in this set depends on it: every row's derivative is zero", sigma: Infinity });
      else free.push(n);
    });
    const colOf = (n) => cols[names.indexOf(n)];
    const initial = free.length ? jacobiEigen(normalOf(free.map(colOf))) : { values: [], vectors: [] };
    const spectrum = { params: free.slice(), eigenvalues: initial.values.slice(), condition: initial.values.length ? initial.values.at(-1) / Math.max(initial.values[0], 1e-300) : null };
    while (free.length) {
      const E = jacobiEigen(normalOf(free.map(colOf)));
      const lmin = E.values[0], lmax = E.values.at(-1), sigmaDir = lmin > 0 ? 1 / Math.sqrt(lmin) : Infinity;
      if (lmin > 0 && sigmaDir <= freezeAbove && lmax / lmin <= conditionMax) break;
      const v = E.vectors[0], amax = Math.max(...v.map(Math.abs));
      let k = v.findIndex((c) => Math.abs(c) === amax);
      const prefer = opts.freezeFirst || [];
      for (const p of prefer) { const i = free.indexOf(p); if (i >= 0 && Math.abs(v[i]) >= 0.5 * amax) { k = i; break; } }
      const share = free.map((n, i) => ({ param: n, component: v[i] })).filter((c) => Math.abs(c.component) >= 0.1 * amax);
      const name = free[k], s = scales[name], sigmaParam = sigmaDir * s;
      const combo = share.map((c) => `${c.component >= 0 ? "+" : "−"}${Math.abs(c.component).toFixed(3)}·${c.param}/${scales[c.param]}`).join(" ");
      const how = Number.isFinite(sigmaDir) ? `they determine nothing better than ±${sigmaDir.toPrecision(3)} scale units` : "they determine nothing at all (the direction is singular)";
      const why = share.length > 1
        ? `the data see only combinations of ${share.map((c) => c.param).join(", ")}: along ${combo} ${how}; ${name} is held at the text's value`
        : Number.isFinite(sigmaParam) ? `seen, but determined only to ±${sigmaParam.toPrecision(3)} ${PARAMS[name].unit} against its scale ${s}` : "seen, but its direction is singular";
      frozen.push({ param: name, reason: share.length > 1 ? "degenerate" : "weak", why, sigma: sigmaParam, eigenvalue: lmin, condition: lmax / Math.max(lmin, 1e-300), direction: share });
      free.splice(k, 1);
    }
    return { free, frozen, spectrum };
  }

  /** Observation records → equations, after checking each (fields, synthetic → generator, canon). */
  function equationsOf(observations, canon) {
    if (!Array.isArray(observations) || !observations.length) throw new TypeError("samskara: give a list of observations");
    const ids = new Set();
    const textCtx = canon.trueplaces ? contextOf(canon.name, 0) : null, textM = textCtx ? buildModel(textCtx, {}) : null;
    const helpers = { textMotion: (t, body) => textM.motion(t, body) };
    return observations.map((o) => {
      if (o && ids.has(o.id)) throw new RangeError(`samskara: id ${o.id} is used twice`);
      if (o) ids.add(o.id);
      return equationOf(o, canon, helpers);
    });
  }
  function summarize(rows, pred, res) {
    const by = {};
    const list = rows.map((r, i) => {
      const value = r.ineq ? pred[i] : (r.arc ? wrapArcmin(r.observed - pred[i]) : r.observed - pred[i]);
      if (!r.ineq) { const u = (by[r.unit] ||= { n: 0, ss: 0, max: 0 }); u.n++; u.ss += value * value; u.max = Math.max(u.max, Math.abs(value)); }
      return { id: r.id, kind: r.kind, what: r.what, unit: r.unit, value, sigma: r.sigma, normalized: res[i], inequality: !!r.ineq, violated: r.ineq ? pred[i] < 0 : undefined };
    });
    const rms = {};
    for (const [u, v] of Object.entries(by)) rms[u] = { n: v.n, rms: Math.sqrt(v.ss / v.n), max: v.max };
    const ineq = list.filter((r) => r.inequality);
    return { rows: list, rms, chi2: chi2Of(res), inequalities: { n: ineq.length, violated: ineq.filter((r) => r.violated).length } };
  }

  /** Saṃskāra: fit the named parameters of the text to the observations. See the header for the rules.
   *  opts: canon ("surya" | "aryabhata"), params (names), epoch (Kali day; default the observations' mean day, rounded),
   *  fixed ({ name: δ } held, not fitted), freeze (names held at the text), freezeFirst (preference when a direction is
   *  shared), scales ({ name: scale }), freezeAbove (1), conditionMax (1e12), maxIter (20), bija (true: both forms). */
  function samskara(observations, opts = {}) {
    const canon = canonOf(opts.canon);
    if (Array.isArray(observations)) checkSources(observations, opts);
    const eqs = equationsOf(observations, canon);
    const times = eqs.map((e) => e.t).filter(Number.isFinite);
    const epoch = opts.epoch ?? Math.round(times.reduce((a, b) => a + b, 0) / times.length);
    const ctx = contextOf(canon.name, epoch);
    const params = (opts.params || DEFAULT_PARAMS[canon.name]).slice();
    const fixed = { ...(opts.fixed || {}) };
    for (const n of [...params, ...Object.keys(fixed)]) if (!PARAMS[n]) throw new RangeError(`samskara: unknown parameter "${n}"`);
    if (!canon.trueplaces) for (const n of params) if (!["rev", "epoch"].includes(PARAMS[n].kind) || PARAMS[n].planet || n === "sunApogee.epoch") throw new RangeError(`samskara: the "${canon.name}" canon fits mean motions and epochs only (${n})`);
    const scales = {};
    for (const n of params) scales[n] = (opts.scales && opts.scales[n]) || PARAMS[n].scale;
    const names = params.filter((n) => !(n in fixed));
    const rows = flatten(eqs);
    const synthetic = observations.some((o) => o.synthetic);

    // before: the text (with any fixed changes)
    let x = { ...fixed };
    const pred0 = predictAll(eqs, buildModel(ctx, x)), res0 = residualsOf(rows, pred0);
    const before = summarize(rows, pred0, res0);

    // the freeze, on the rows that carry information at the start
    const info = rows.map((r, i) => isActive(r, pred0[i]));
    const cols0 = jacobianCols(eqs, rows, ctx, x, names, scales).map((c) => c.map((v, i) => (info[i] ? v : 0)));
    const F = freezeAnalysis(names, cols0, scales, opts);
    const free = F.free;

    // Gauss-Newton in the free subspace, with step halving
    let iter = 0, chi2 = chi2Of(res0), pred = pred0, res = res0;
    for (; iter < (opts.maxIter ?? 20) && free.length; iter++) {
      const cols = jacobianCols(eqs, rows, ctx, x, free, scales).map((c) => c.map((v, i) => (isActive(rows[i], pred[i]) ? v : 0)));
      const E = jacobiEigen(normalOf(cols));
      const g = cols.map((c) => c.reduce((s, v, i) => s + v * res[i], 0));
      const step = new Array(free.length).fill(0);
      E.values.forEach((lam, k) => {
        if (!(lam > E.values.at(-1) * 1e-15)) return;
        const v = E.vectors[k], coef = v.reduce((s, vi, i) => s + vi * g[i], 0) / lam;
        for (let i = 0; i < free.length; i++) step[i] += coef * v[i];
      });
      let alpha = 1, accepted = false, xn, predn, resn, chi2n;
      for (let h = 0; h < 12; h++, alpha /= 2) {
        xn = { ...x };
        free.forEach((n, i) => { xn[n] = (x[n] || 0) + alpha * step[i] * scales[n]; });
        predn = predictAll(eqs, buildModel(ctx, xn)); resn = residualsOf(rows, predn); chi2n = chi2Of(resn);
        if (chi2n <= chi2 * (1 + 1e-12) + 1e-18) { accepted = true; break; }
      }
      if (!accepted) break;
      x = xn; pred = predn; res = resn;
      const moved = Math.max(...step.map((s) => Math.abs(alpha * s)));
      const done = moved < 1e-10 || chi2 - chi2n < 1e-12 * Math.max(1, chi2);
      chi2 = chi2n;
      if (done) { iter++; break; }
    }
    const after = summarize(rows, pred, res);

    // uncertainties at the solution, from the equality rows and the active inequalities
    const colsF = free.length ? jacobianCols(eqs, rows, ctx, x, free, scales).map((c) => c.map((v, i) => (isActive(rows[i], pred[i]) ? v : 0))) : [];
    const cov = free.map(() => free.map(() => 0));
    const informed = colsF.map((c) => c.some((v) => v !== 0));                     // false: only inequalities, none active
    if (free.length) {
      const E = jacobiEigen(normalOf(colsF)), top = Math.max(0, ...E.values);
      E.values.forEach((lam, k) => {
        if (!(lam > top * 1e-15)) return;
        const v = E.vectors[k];
        for (let i = 0; i < free.length; i++) for (let j = 0; j < free.length; j++) cov[i][j] += v[i] * v[j] / lam * scales[free[i]] * scales[free[j]];
      });
    }
    const nEq = rows.filter((r) => !r.ineq).length, dof = nEq - free.length;
    const out = {
      tag: tagOf(observations), synthetic, canon: canon.name, canonSource: canon.source, epoch,
      observations: observations.length, rows: rows.length, iterations: iter, chi2: after.chi2, dof, chi2PerDof: dof > 0 ? after.chi2 / dof : null,
      params: {}, free: free.slice(), frozen: F.frozen, spectrum: F.spectrum, residuals: { before, after },
      covariance: { params: free.slice(), matrix: cov }, deltas: { ...x },
    };
    for (const n of params) {
      const s = PARAMS[n], i = free.indexOf(n), text = textValue(n, canon, epoch, ctx);
      const delta = x[n] || 0, sigma = i >= 0 ? (informed[i] ? Math.sqrt(cov[i][i]) : null) : 0;
      const status = n in fixed ? "fixed" : i >= 0 ? "fitted" : "frozen";
      const entry = { param: n, unit: s.unit, text, delta, sigma, status, scale: scales[n] };
      if (sigma === null) entry.bounded = "by inequalities only, all satisfied at the solution: see feasibleIntervals()";
      if (s.kind === "epoch") { entry.corrected = mod(text + delta / 60, 360); entry.unitOfText = "degrees: the mean place at the epoch"; }
      else entry.corrected = text + delta;
      if (s.kind === "epoch" && !s.planet && BODIES.includes(s.body)) {
        const nd = (x[`${s.body}.rev`] || 0) * (RETRO[s.body] ? -1 : 1);
        entry.deltaAtKali0 = delta - nd * epoch / Number(canon.Y) * 21600;           // arcmin: the same line carried to Kali 0
      }
      out.params[n] = entry;
    }
    if (opts.bija !== false) out.bija = bijaForms(observations, opts, out, ctx);
    return out;
  }

  // ── the two bīja forms ────────────────────────────────────────────────────────────────────────────
  /** Simplest rational p/q (smallest q) in [lo, hi] — the Stern-Brocot descent; [BigInt p, BigInt q]. */
  function simplestBetween(lo, hi, depth = 0) {
    if (lo > hi) [lo, hi] = [hi, lo];
    if (lo <= 0 && hi >= 0) return [0n, 1n];
    if (hi < 0) { const [p, q] = simplestBetween(-hi, -lo, depth); return [-p, q]; }
    const fl = Math.floor(lo);
    if (fl === lo || depth > 60) return [BigInt(Math.round(lo)), 1n];
    if (fl + 1 <= hi) return [BigInt(fl + 1), 1n];
    const [p, q] = simplestBetween(1 / (hi - fl), 1 / (lo - fl), depth + 1);
    return [BigInt(fl) * p + q, p];
  }
  /** The corrected mean place in the whole-number form, EXACT: frac(±R′·(Q + spandas ÷ (Y·SPD))) turned to arcseconds, plus
   *  the dhruva D (whole arcseconds, or {num, den}); a rational {num, den} in [0, 1,296,000). Retrograde for the node. */
  function wholeMeanArcsec(canonName, body, revCorrected, dhruvaArcsec, spandas) {
    const c = canonOf(canonName), Sp = big(spandas), den = c.qDen * c.Y * SPD, Dr = toRat(dhruvaArcsec ?? 0n);
    const num = bmod((RETRO[body] ? -1n : 1n) * big(revCorrected) * (c.qNum * c.Y * SPD + c.qDen * Sp), den);
    return rat(bmod(num * 1296000n * Dr.den + Dr.num * den, 1296000n * den * Dr.den), den * Dr.den);
  }
  /** The Śakābda form, EXACT, in parahita-madhyama.js's convention: minutes to SUBTRACT = (mul ÷ div) × (Śaka years elapsed
   *  − zeroYear), Śaka years = spandas × Sun revolutions ÷ (Y·SPD) − 3179. Returns {num, den}. */
  function sakabdaMinutes(form, spandas) {
    const c = canonOf(form.canon), Z = toRat(form.zeroYear), Sp = big(spandas);
    const n = Sp * c.rev.sun * Z.den - (BigInt(SAKA_KALI) * Z.den + Z.num) * c.Y * SPD, d = c.Y * SPD * Z.den;
    return rat(n * big(form.mul), d * big(form.div));
  }
  /** The place under a Śakābda form: the canon's own mean place less the minutes, exact arcseconds in [0, 1,296,000). */
  function sakabdaArcsec(form, body, spandas) {
    const c = canonOf(form.canon), rev = c.rev[body] ?? (c.name === "surya" && GR.PLANETS[body] ? GR.PLANETS[body].rev : undefined);
    if (rev === undefined) throw new RangeError(`samskara: no revolution number for "${body}" in the ${c.name} canon`);
    const m = wholeMeanArcsec(form.canon, body, rev, 0n, spandas), k = sakabdaMinutes(form, spandas);
    return rat(bmod(m.num * k.den - k.num * 60n * m.den, 1296000n * m.den * k.den), m.den * k.den);
  }
  /** The chain of SS 1.34-1.39 from the corrected integers, on the canon's civil days: every count stays an integer. */
  /** SS 1.34-1.39's chain for corrected Sun and Moon revolutions. keep "risings" (default, owner 2026-10-07): the turn is the
   *  clock, so the star-risings of the yuga stay the text's and a Sun bīja changes the civil days (risings − Sun); keep
   *  "civil": the civil days stay and the risings change. With the text's own revolutions both are the text's chain. */
  function chainOf(canon, sunRev, moonRev, keep = "risings") {
    if (keep !== "risings" && keep !== "civil") throw new RangeError('samskara: the chain keeps "risings" or "civil"');
    const sun = big(sunRev), moon = big(moonRev);
    const risings = keep === "civil" ? canon.Y + sun : canon.Y + canon.rev.sun, Y = risings - sun;
    const lunar = moon - sun, adhimasa = lunar - 12n * sun, tithi = 30n * lunar;
    return Object.defineProperty({ civilDays: Y, risings, sun, moon, lunarMonths: lunar, adhimasa, tithi, tithiksaya: tithi - Y }, "keep", { value: keep });
  }
  /** A non-negative integer as a Kaṭapayādi word (first syllable the units, katapayadi.js), with its decoding checked. */
  function katapayadiOf(n) {
    const v = big(n);
    if (v < 0n) return null;
    const deva = KP.encodeInteger(v), iast = KP.encodeInteger(v, "iast");
    return { value: v, devanagari: deva, iast, decodesTo: KP.decodeWord(deva).value, checked: KP.decodeWord(deva).value === v && KP.decodeWord(iast).value === v };
  }
  /** A digit → words lexicon from the text's own numeral words (corpus/surya-siddhanta/numbers.json, passed in): every
   *  hyphen-separated word whose value is a single digit, most frequent first. Nothing is added that the verses lack. */
  function lexiconFromVerses(numbers) {
    const count = Array.from({ length: 10 }, () => new Map());
    for (const v of (numbers && numbers.verses) || []) for (const it of v.items || []) {
      if (!it.words || !Array.isArray(it.values)) continue;
      const words = String(it.words).split("-");
      if (words.length !== it.values.length) continue;
      words.forEach((w, i) => { const d = it.values[i]; if (Number.isInteger(d) && d >= 0 && d <= 9 && w) count[d].set(w, (count[d].get(w) || 0) + 1); });
    }
    return count.map((m) => [...m.entries()].sort((a, b) => b[1] - a[1]).map(([w]) => w));
  }
  /** bhūtasaṅkhyā: an integer as word-numerals, first word the units (as the verses are read); null if a digit has no word. */
  function bhutasankhya(n, lexicon) {
    const digits = big(n).toString().split("").reverse().map(Number);
    if (big(n) < 0n || digits.some((d) => !lexicon[d] || !lexicon[d].length)) return null;
    return { words: digits.map((d) => lexicon[d][0]).join("-"), values: digits };
  }

  function bijaForms(observations, opts, fit, ctx) {
    const canon = ctx.canon, revs = Object.keys(fit.params).filter((n) => PARAMS[n].kind === "rev" && fit.params[n].status === "fitted");
    const rsun = Number(canon.rev.sun), Yn = Number(canon.Y), epoch = fit.epoch;
    const out = { recommended: "whole", note: "§7.9: whole numbers for the owner's own corrections; the Śakābda form only for replaying the records", whole: null, sakabda: {} };
    if (!revs.length) return out;
    // (a) whole numbers: round, then re-fit the epochs with the rates held at the integers
    const ints = {};
    for (const n of revs) ints[n] = Math.round(fit.params[n].delta);
    const refit = samskara(observations, { ...opts, epoch, fixed: { ...(opts.fixed || {}), ...ints }, freeze: [...(opts.freeze || []), ...fit.frozen.map((f) => f.param)], bija: false });
    const bodies = {};
    for (const n of revs) {
      const s = PARAMS[n], body = s.body, dR = BigInt(ints[n]), text = s.planet ? GR.PLANETS[body].rev : canon.rev[body];
      const eName = `${body}.epoch`, de = (refit.params[eName] && refit.params[eName].delta) || (refit.deltas[eName] || 0);
      // D = Δε − s·ΔR·(Q + epoch/Y)·360°, in whole vikalās (the creation-counted form's dhruva)
      const sgn = RETRO[body] ? -1n : 1n;
      const shift = rat(sgn * dR * (canon.qNum * canon.Y + canon.qDen * BigInt(epoch)), canon.qDen * canon.Y);   // revolutions
      const shiftFrac = rat(bmod(shift.num, shift.den), shift.den);
      const Darcsec = BigInt(Math.round(mod(de * 60 - ratNum(shiftFrac) * 1296000, 1296000))) % 1296000n;
      const sigmaN = fit.params[n].sigma ?? Infinity, frac = fit.params[n].delta - ints[n];
      const fractionSeen = Math.abs(frac) > 3 * sigmaN + 1e-9;
      const why = fractionSeen
        ? `the data resolve a fraction (${frac.toFixed(3)} ± ${sigmaN.toPrecision(2)} revolutions a yuga) that no integer holds: the whole-number form drifts from the data by ${(Math.abs(frac) * 0.3).toPrecision(3)}″ a year away from the epoch, which a later dhruva absorbs`
        : sigmaN < 0.5 ? "the data fix the integer (σ < ½ revolution a yuga)"
          : `the data allow ±${sigmaN.toPrecision(3)} revolutions a yuga: the nearest integer is taken and the dhruva absorbs the rest`;
      bodies[body] = { param: n, text, deltaFitted: fit.params[n].delta, sigma: sigmaN, deltaWhole: dR, corrected: text + dR,
        determined: sigmaN < 0.5 && !fractionSeen, fractionSeen, why,
        epochDelta: de, dhruvaArcsec: Darcsec, memory: { revolutions: katapayadiOf(text + dR), dhruvaVikala: katapayadiOf(Darcsec) } };
    }
    const R2 = (b) => (bodies[b] ? bodies[b].corrected : canon.rev[b]);
    out.whole = { canon: canon.name, epoch, bodies, chain: chainOf(canon, R2("sun"), R2("moon"), opts.keep || "risings"), refit: { chi2: refit.chi2, dof: refit.dof, chi2PerDof: refit.chi2PerDof, residuals: refit.residuals.after.rms, inequalities: refit.residuals.after.inequalities, deltas: refit.deltas },
      closed: true, rule: "corrected mean = frac(R′·(Q + days ÷ Y)) + D: R′ an integer, D whole vikalās — wholeMeanArcsec() gives it exactly; after Y·SPD spandas it returns to itself" };
    // (b) the Śakābda form from the free fit: Δλ = Δε + r·(years − years at the epoch), r = ±δn·21600/Rsun minutes a year
    const yEpoch = epoch * rsun / Yn - SAKA_KALI;
    for (const n of revs) {
      const s = PARAMS[n], body = s.body, sgn = RETRO[body] ? -1 : 1;
      const dn = fit.params[n].delta, sn = fit.params[n].sigma, eName = `${body}.epoch`;
      const de = fit.deltas[eName] || 0;
      const r = sgn * dn * 21600 / rsun, sr = sn * 21600 / rsun, subtract = -r;
      const iN = fit.covariance.params.indexOf(n), iE = fit.covariance.params.indexOf(eName);
      let zero = null, sZ = null;
      if (Math.abs(r) > 0) {
        zero = yEpoch - de / r;
        if (iN >= 0 && iE >= 0) {
          const cv = fit.covariance.matrix, dZde = -1 / r, dZdn = de / (r * r) * sgn * 21600 / rsun;
          sZ = Math.sqrt(Math.max(0, dZde * dZde * cv[iE][iE] + dZdn * dZdn * cv[iN][iN] + 2 * dZde * dZdn * cv[iE][iN]));
        }
      }
      const tolR = Math.max(sr, Math.abs(subtract) * 1e-12, 1e-15);
      const [mul, div] = simplestBetween(subtract - tolR, subtract + tolR);
      if (mul === 0n) {
        out.sakabda[body] = { param: n, ratePerYear: r, subtractPerYear: subtract, sigma: sr, mul, div, zeroYear: null, none: true,
          rule: "none: within its σ the data ask no Śakābda correction for this body (as the Parahita rule gives the Sun none)" };
        continue;
      }
      let zeroYear = null;
      if (zero !== null) {
        const tolZ = Math.max(sZ ?? 0, 1e-9 * Math.max(1, Math.abs(zero)));
        const [zn, zd] = simplestBetween(zero - tolZ, zero + tolZ);
        zeroYear = zd === 1n ? zn : { num: zn, den: zd };
      }
      const revPerYuga = rat(mul * canon.rev.sun * (RETRO[body] ? 1n : -1n), div * 21600n);   // the revolutions a yuga it implies (200 × rate)
      out.sakabda[body] = { param: n, ratePerYear: r, subtractPerYear: subtract, sigma: sr, mul, div, zeroYear, zeroYearFitted: zero, sigmaZeroYear: sZ,
        revPerYuga, wheel: revPerYuga.den === 1n ? "closed (the rate is a whole number of revolutions a yuga)" : "open: after a yuga the correction is not a whole number of revolutions",
        memory: { mul: katapayadiOf(mul < 0n ? -mul : mul), div: katapayadiOf(div) },
        rule: "minutes to SUBTRACT = (mul ÷ div) × (Śaka years elapsed − zeroYear), as parahita-madhyama.js sakabdaMinutes; sakabdaMinutes() gives it exactly" };
    }
    return out;
  }

  // ── what a feasible region looks like when the data are inequalities ─────────────────────────────────
  /** Scan one parameter (others at `deltas`) and return the intervals where every inequality row holds. */
  function feasibleIntervals(observations, name, { from, to, step, deltas = {}, canon, epoch } = {}) {
    if (!PARAMS[name]) throw new RangeError(`samskara: unknown parameter "${name}"`);
    const c = canonOf(canon), eqs = equationsOf(observations, c);
    const ep = epoch ?? Math.round(eqs.reduce((a, e) => a + e.t, 0) / eqs.length), ctx = contextOf(c.name, ep), rows = flatten(eqs);
    const out = [];
    let open = null;
    for (let v = from; v <= to + 1e-12; v += step) {
      const pred = predictAll(eqs, buildModel(ctx, { ...deltas, [name]: v }));
      const ok = rows.every((r, i) => !r.ineq || pred[i] >= 0);
      if (ok && open === null) open = v;
      if (!ok && open !== null) { out.push({ lo: open, hi: v - step }); open = null; }
    }
    if (open !== null) out.push({ lo: open, hi: to });
    return out;
  }

  // ── the owner's ledger → observations (vedha-lekha.js) ──────────────────────────────────────────────
  /** A certified vedha-lekha/1 ledger → saṃskāra observations, and what was not used and why. opts: catalogue (the
   *  yogatara corpus, for the stars' dhruvakas) or stars; allowSynthetic; sigmaVinadi (contacts, 1), sigmaYogaVinadi (2);
   *  anything else is passed to vedha-lekha.js reduce. */
  function fromLedger(ledgerOrFile, opts = {}) {
    const Lf = typeof ledgerOrFile === "string" ? JSON.parse(ledgerOrFile) : ledgerOrFile;
    const red = V.reduce(Lf, opts);                                                  // throws unless certified
    const src = new Map(Lf.entries.map((e) => [e.record.id, e.record]));
    const stars = new Map((Array.isArray(opts.stars) ? opts.stars : opts.catalogue ? D.starsOf(opts.catalogue) : []).map((x) => [String(x.name).normalize("NFC"), x]));
    const mana = K.mana("surya"), daysPerAsu = Number(mana.savana) / Number(mana.nakshatra) / 21600;   // an asu of the turn, in civil days (1.34-1.37)
    const lab = (o, r) => { if (r && r.synthetic) { o.synthetic = true; o.generator = r.generator; } return o; };
    const out = [], skipped = [];
    const chayaRecs = Lf.entries.map((e) => e.record).filter((r) => V.CHAYA_KINDS.includes(r.kind) && r.kind !== "kapala")
      .map((r) => { const x = JSON.parse(JSON.stringify(r)); delete x.ganita; return x; });
    if (chayaRecs.some((r) => r.kind === "madhyahna")) {
      const file = { format: C.FORMAT, site: JSON.parse(JSON.stringify(Lf.site || {})), records: chayaRecs };
      if (Lf.shanku !== undefined) file.shanku = Lf.shanku;
      out.push(...fromVedha(file, { sigmaVyangula: opts.sigmaVyangula ?? 1 }));
    }
    for (const r of chayaRecs) if (r.kind !== "madhyahna") skipped.push({ id: r.id, why: `${r.kind}: reduced by ss-chaya.js for the site and the clock (tier a), not a parameter of the motion` });
    for (const e of Lf.entries) if ((V.FRAME_KINDS || ["uttara-rekha", "ayananta-yugma"]).includes(e.record.kind))
      skipped.push({ id: e.record.id, why: `${e.record.kind}: a frame record (true north, or ε and the latitude from the solstice noons), reduced by vedha-lekha.js and shown beside the text's values; not a parameter of the motion` });
    const ecl = new Map();
    for (const x of red.records) {
      const r = src.get(x.id);
      if (x.kind === "yamyottara") { skipped.push({ id: x.id, why: "a star transit sets the site and the clock (tier a), not the motion" }); continue; }
      if (x.kind === "yantra") { skipped.push({ id: x.id, why: `an instrument reading (${x.yantra}): reduced beside the text by yantra.js; not yet a row of the fit` }); continue; }
      if (x.kind === "grahana") {
        if (!["sparsha", "madhya", "moksha"].includes(x.contact)) { skipped.push({ id: x.id, why: `${x.contact}: the fit takes sparśa, madhya and mokṣa` }); continue; }
        if (!x.antara || x.text.at === null) { skipped.push({ id: x.id, why: "the text gives no such contact here; a seen eclipse the model misses is a result, not a row" }); continue; }
        const solar = x.body !== "candra", key = `${solar ? "s" : "c"}${x.text.parva}`;
        const o = ecl.get(key) || lab(solar
          ? { id: `ledger-grahana-surya-${x.day}`, kind: "grahana-surya", sigmaVinadi: opts.sigmaSolarVinadi ?? 6,
            site: { latitude: red.site.latitude, deshantara: red.site.deshantara, ...(typeof red.site.palabha === "number" ? { palabha: red.site.palabha } : {}) } }
          : { id: `ledger-grahana-${x.day}`, kind: "grahana", sigmaVinadi: opts.sigmaVinadi ?? 1 }, r);
        o[x.contact] = x.text.at + x.antara.asus * daysPerAsu;
        ecl.set(key, o);
        continue;
      }
      if (x.kind === "candra-darshana") {
        if (x.horizon !== "pashcima") { skipped.push({ id: x.id, why: "a morning crescent: the fit's crescent is the evening one (SS 10.1)" }); continue; }
        out.push(lab({ id: x.id, kind: "darshana", N: x.day, site: { latitude: red.site.latitude, deshantara: red.site.deshantara }, seen: x.observed.seen }, r));
        continue;
      }
      if (x.kind === "candra-yoga") {
        const star = stars.get(String(x.star).normalize("NFC"));
        if (!star || !x.antara) { skipped.push({ id: x.id, why: star ? "the text's Moon does not reach the star on this day" : "no catalogue entry for the star" }); continue; }
        out.push(lab({ id: x.id, kind: "candra", t: x.text.at + x.antara.asus * daysPerAsu, lambda: star.dhruvaka, polar: true, star: x.star, sigmaVinadi: opts.sigmaYogaVinadi ?? 2 }, r));
        continue;
      }
    }
    out.push(...ecl.values());
    return { observations: out, skipped, site: red.site, warnings: red.warnings, tag: red.synthetic ? "[synthetic]" : "[measured]" };
  }

  // ── the default path: the median dhruva, and a rate from two epochs (design §4.5) ─────────────────────
  const median = (a) => { const b = a.slice().sort((x, y) => x - y), n = b.length; return n % 2 ? b[(n - 1) / 2] : (b[n / 2 - 1] + b[n / 2]) / 2; };
  /** The median path. Each record gives a residual (the sky − the text) in arcminutes of one body: a true or mean Sun,
   *  Moon or planet, an ayanāṃśa; a noon shadow inverted to the shadow-Sun (3.14b-3.19; not within 15° of a solstice,
   *  where the shadow hardly moves); a lunar eclipse's middle (or the mean of its sparśa and mokṣa) as Moon − Sun, by the
   *  motions (JM §14). The true-place residual is taken as the mean place's, as Parameśvara applied it [reading].
   *  The dhruva is the median, in whole kalā, at opts.epoch (default: the records' middle). A rate needs two epochs at
   *  least ten years apart (opts.epochs [[from, to], [from, to]], or the records split at their middle time): then
   *  Δbhagaṇa = the medians' slope × the yuga's civil days ÷ 21,600, whole (form a), and the Śakābda form (b). */
  function dhruvaMedian(observations, opts = {}) {
    if (Array.isArray(observations)) checkSources(observations, opts);
    const canon = canonOf(opts.canon), eqs = equationsOf(observations, canon);
    const times = eqs.map((e) => e.t).filter(Number.isFinite);
    const epoch = opts.epoch ?? Math.round(median(times));
    const M = buildModel(contextOf(canon.name, epoch), {});
    const res = [], unused = [];
    const put = (body, t, r, id, how) => res.push({ body, t, r, id, how });
    eqs.forEach((e, i) => {
      const o = observations[i];
      switch (e.kind) {
        case "surya": case "candra": case "graha": case "madhyama": case "ayanamsha": {
          const body = e.kind === "surya" ? "sun" : e.kind === "candra" ? "moon" : e.kind === "graha" ? o.planet : e.kind === "madhyama" ? o.body : "ayanamsha";
          put(body, e.t, wrapArcmin(e.rows[0].observed - e.predict(M)[0]), e.id, e.kind);
          return;
        }
        case "surya-sayana": put("sun", e.t, wrapArcmin(e.rows[0].observed - e.predict(M)[0]), e.id, "shadow-Sun (the text's ayanāṃśa inside)"); return;
        case "chaya": {
          const text = M.sayanaSun(e.t), nearSolstice = Math.abs(mod(text, 180) - 90) < 15;
          if (nearSolstice) { unused.push({ id: e.id, why: "within 15° of a solstice the noon shadow hardly moves (3.17-3.19): the least-squares path weighs it" }); return; }
          const sh = e.rows[0].observed / 60, cr = C.chayarka(Math.abs(sh), sh >= 0 ? "N" : "S", e.palabha, { near: text });
          put("sun", e.t, wrapArcmin((cr.lambda - text) * 60), e.id, "noon shadow → chāyārka (the text's ayanāṃśa inside)");
          return;
        }
        case "grahana": {
          const p = e.predict(M), names = ["sparsha", "madhya", "moksha"].filter((k) => o[k] !== undefined), at = {};
          names.forEach((k, j) => { at[k] = p[j] / VINADI_PER_DAY; });                 // text − observed, days
          const d = at.madhya !== undefined ? at.madhya : at.sparsha !== undefined && at.moksha !== undefined ? (at.sparsha + at.moksha) / 2 : null;
          if (d === null) { unused.push({ id: e.id, why: "one contact alone carries the latitude as much as the place: the least-squares path weighs it" }); return; }
          const rel = M.motion(e.t, "moon") - M.motion(e.t, "sun");                   // arcmin a day
          put("elongation", e.t, d * rel, e.id, "lunar eclipse middle → Moon − Sun (JM §14)");
          return;
        }
        default: unused.push({ id: e.id, why: `${e.kind}: an inequality; the least-squares path uses it` });
      }
    });
    const Y = Number(canon.Y), yearDays = Y / 4320000;
    const by = (b) => res.filter((x) => x.body === b);
    const sunMed = by("sun").length ? median(by("sun").map((x) => x.r)) : 0;
    for (const x of by("elongation")) put("moon", x.t, x.r + sunMed, x.id, x.how + (by("sun").length ? ", + the Sun's median" : ", the text's Sun assumed"));
    const bodies = {};
    for (const b of [...new Set(res.map((x) => x.body))].filter((b) => b !== "elongation")) {
      const list = by(b), r = list.map((x) => x.r), m = median(r), mad = median(r.map((v) => Math.abs(v - m)));
      const sigma = 1.2533 * 1.4826 * mad / Math.sqrt(r.length);                    // the median's own σ, from the spread
      const entry = { n: r.length, medianArcmin: m, dhruvaKala: Math.round(m), sigmaArcmin: sigma, epoch, records: list.map((x) => x.id) };
      const spans = opts.epochs || (() => { const ts = list.map((x) => x.t).sort((a, c) => a - c), mid = median(ts); return [[ts[0], mid], [mid, ts[ts.length - 1] + 1e-9]]; })();
      const g = spans.map(([a, c]) => list.filter((x) => x.t >= a && x.t < c));
      const T = g.map((x) => (x.length ? x.reduce((s2, y) => s2 + y.t, 0) / x.length : NaN));
      if (g.every((x) => x.length >= 3) && T[1] - T[0] >= 10 * yearDays) {
        const mm = g.map((x) => median(x.map((y) => y.r))), sg = g.map((x, k) => 1.2533 * 1.4826 * median(x.map((y) => Math.abs(y.r - mm[k]))) / Math.sqrt(x.length));
        const rate = (mm[1] - mm[0]) / (T[1] - T[0]), rateSigma = Math.sqrt(sg[0] ** 2 + sg[1] ** 2) / (T[1] - T[0]);   // arcmin a day
        const perYuga = rate * Y / 21600, whole = Math.round(perYuga);
        const perYear = rate * yearDays, sy = rateSigma * yearDays;                   // arcmin a year, sky − text
        const [mul, div] = simplestBetween(-(perYear + sy), -(perYear - sy));          // minutes SUBTRACTED a year (Parahita's sense)
        const zeroDay = T[0] - mm[0] / rate;
        entry.rate = { epochs: T, medians: mm, arcminPerDay: rate, sigmaArcminPerDay: rateSigma, revolutionsPerYuga: perYuga,
          wholeBhaganaDelta: whole, closesWheel: true,
          sakabda: { minutesSubtractedPerYear: { mul: Number(mul), div: Number(div) }, zeroKaliDay: zeroDay, zeroSakaYear: zeroDay / yearDays - 3179 } };
      } else entry.rate = { determined: false, why: "a rate needs two epochs at least ten years apart, with three records in each (design §4.5)" };
      bodies[b] = entry;
    }
    return { method: "median", tag: tagOf(observations), canon: canon.name, epoch, bodies, unused,
      note: "the dhruva is the median residual in whole kalā (sky − text) at the epoch; the true-place residual is applied to the mean place [reading]" };
  }
  /** The robust fit: the least-squares fit, then the one record whose residual is worst beyond opts.reject σ (4) is set
   *  aside and the fit run again, until no record is beyond it; every record set aside is reported with its residual and
   *  round. One at a time, worst first, because a gross error can drag good records out with it. The bīja forms are
   *  made from the final fit. */
  function robust(observations, opts = {}) {
    const k = opts.reject ?? 4, rejected = [];
    let kept = observations.slice(), fit = null;
    for (let round = 1; round <= (opts.maxRejectRounds ?? 20); round++) {
      fit = samskara(kept, { ...opts, bija: false });
      const worst = new Map();
      for (const r of fit.residuals.after.rows) if (!r.inequality) worst.set(r.id, Math.max(worst.get(r.id) || 0, Math.abs(r.normalized)));
      const beyond = [...worst].filter(([, v]) => v > k).sort((x, y) => y[1] - x[1]);
      if (!beyond.length) break;
      rejected.push({ id: beyond[0][0], normalized: beyond[0][1], round });
      kept = kept.filter((o) => o.id !== beyond[0][0]);
      fit = null;
    }
    if (!fit || opts.bija !== false) fit = samskara(kept, opts);
    return { ...fit, method: "robust", rejected, kept: kept.length,
      rule: `least squares; a record beyond ${k}σ after the fit is set aside, one at a time, worst first, and the fit run again` };
  }
  /** The correction loop's step 4 (design §4.5). method "robust" (default, owner 2026-10-07: every record used, a wild one
   *  set aside and named), "median" (the median dhruva and the ten-year rate, §4.5's first form) or "lsq" (the fit alone). */
  function correct(observations, opts = {}) {
    const m = opts.method || "robust";
    if (m === "robust") return robust(observations, opts);
    if (m === "median") return dhruvaMedian(observations, opts);
    if (m === "lsq") return samskara(observations, opts);
    throw new RangeError('samskara: method is "robust", "median" or "lsq"');
  }

  // ── the owner's shadow file, and synthetic records for rehearsing the loop ───────────────────────────
  /** A vedha-chaya/1 file (ss-chaya.js validate/reduce) → chaya observations: each noon shadow with the file's place. */
  function fromVedha(file, { sigmaVyangula = 1 } = {}) {
    const red = C.reduce(file);
    return red.records.filter((r) => r.kind === "madhyahna").map((r) => {
      const src = file.records.find((x) => x.id === r.id);
      const o = { id: r.id, kind: "chaya", t: r.t, palabha: red.site.palabha, chaya: r.chaya, dir: r.dir, sigmaVyangula };
      if (src.ayana) o.ayana = src.ayana;
      if (src.synthetic) { o.synthetic = true; o.generator = src.generator; }
      return o;
    });
  }
  /** A seeded generator (mulberry32) with normal deviates by Marsaglia's polar method. */
  function prng(seed) {
    let a = seed >>> 0;
    const uni = () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
    const normal = () => { for (;;) { const u = 2 * uni() - 1, v = 2 * uni() - 1, s = u * u + v * v; if (s > 0 && s < 1) return u * Math.sqrt(-2 * Math.log(s) / s); } };
    return { uni, normal };
  }
  /** Synthetic records from the text's model with the parameters moved by `deltas` — labelled synthetic, with their generator.
   *  spec: { epoch, deltas, seed, canon, label,
   *    shadows: { site, days: [Kali days], sigmaVyangula, round: true },          noon shadows read to the vyaṅgula
   *    eclipses: { from, to, sigmaVinadi, site, nightOnly, read, misses },          lunar eclipse contacts on a kapāla of the turn,
   *                                         read to the prāṇa (read: false keeps exact days); misses: also the pūrṇimās within
   *                                         that many arcmin (true: 60′) of an eclipse where none occurs (grahana-abhava)
   *    moonStars: { from, to, stars: [{ name, lambda }], sigmaVinadi, minElongation },   the Moon reaching a junction star
   *    crescents: { site, from, to },                                               first evenings (SS 10.1)
   *    planets: { names, days, sigmaArcmin } }                                      planet longitudes */
  function synthesize(spec) {
    const ctx = contextOf(spec.canon, spec.epoch), M = buildModel(ctx, spec.deltas || {}), rnd = prng(spec.seed ?? 1);
    const generator = spec.label || `samskara.synthesize: the text's model moved by ${JSON.stringify(spec.deltas || {})} about Kali day ${spec.epoch}, seed ${spec.seed ?? 1} — synthetic, not an observation`;
    const out = [], tag = { synthetic: true, generator };
    if (spec.shadows) {
      const sh = spec.shadows, pb = palabhaOfSite(sh.site), sv = sh.sigmaVyangula ?? 0;
      for (const N of sh.days) {
        const t = N + 0.5 - (sh.site.deshantara || 0) / 360, lam = M.sayanaSun(t), n = C.noonShadow(lam, pb);
        let s = (n.dir === "N" ? 1 : -1) * n.chaya + sv / 60 * rnd.normal();
        if (sh.round !== false) s = Math.round(s * 60) / 60;
        const ayana = mod(lam, 360) < 90 || mod(lam, 360) >= 270 ? "uttara" : "dakshina";
        const a = Math.abs(s), ang = Math.floor(a + 1e-12), vy = Math.round((a - ang) * 60);
        const chaya = sh.round === false ? a : vy === 60 ? { angula: ang + 1, vyangula: 0 } : { angula: ang, vyangula: vy };
        out.push({ id: `chaya-${N}`, kind: "chaya", day: { kali: N }, site: sh.site, chaya,
          dir: s >= 0 ? "N" : "S", ayana, sigmaVyangula: Math.sqrt(sv * sv + (sh.round !== false ? 1 / 12 : 0)) || 1, ...tag });
      }
    }
    if (spec.eclipses) {
      const ec = spec.eclipses, sv = ec.sigmaVinadi ?? 0;
      const night = (t) => { if (!ec.nightOnly) return true; const N = Math.floor(t + ec.site.deshantara / 360); return t > D.sunEvent(N, ec.site, "set") || t < D.sunEvent(N, ec.site, "rise"); };
      const m = K.mana("surya"), nak = m.nakshatra, sav = m.savana;
      const reading = (t) => {
        if (ec.read === false) return t;                                            // days, unrounded (for the exact loop)
        const kali = Math.floor(t), turn = (t - kali) * SPD_N * Number(nak) / Number(sav);
        const r = BigInt(Math.round(turn / Number(K.SPANDAS_PER_PRANA))) * K.SPANDAS_PER_PRANA;      // read to the prāṇa
        if (r >= SPD) return { kali, kapala: K.spandasToKapala(BigInt(Math.round((t - kali) * SPD_N / Number(K.SPANDAS_PER_PRANA))) * K.SPANDAS_PER_PRANA), calibration: "savana" };
        const k = K.spandasToKapala(r);
        return { kali, kapala: { ghati: Number(k.ghati), vinadi: Number(k.vinadi), prana: Number(k.prana) }, calibration: "nakshatra" };
      };
      for (let t = syzygy(M, ec.from, 180); t < ec.to; t = syzygy(M, t + 29.53, 180)) {
        const E = lunarEclipse(M, t);
        if (!E.possible) {                                                          // a near miss: no eclipse seen at this pūrṇimā
          if (ec.misses && Math.abs(E.latitude) - E.halfSum < (ec.misses === true ? 60 : ec.misses) && night(E.middle))
            out.push({ id: `abhava-${Math.round(E.middle)}`, kind: "grahana-abhava", near: E.middle, ...tag });
          continue;
        }
        if (!(E.moksha > E.sparsha) || !night(E.sparsha) || !night(E.moksha)) continue;
        const a = E.sparsha + sv / VINADI_PER_DAY * rnd.normal(), b = E.moksha + sv / VINADI_PER_DAY * rnd.normal();
        const kp = (r) => (typeof r === "number" ? r : typeof r.kapala.ghati === "bigint" ? { ...r, kapala: { ghati: Number(r.kapala.ghati), vinadi: Number(r.kapala.vinadi), prana: Number(r.kapala.prana) } } : r);
        const quant = ec.read === false ? 0 : 1 / 432;                              // a reading to the prāṇa: (1/6 vināḍī)²/12
        out.push({ id: `grahana-${Math.round(E.middle)}`, kind: "grahana", sparsha: kp(reading(a)), moksha: kp(reading(b)), sigmaVinadi: Math.sqrt(sv * sv + quant) || 1, ...tag });
      }
    }
    if (spec.moonStars) {
      const ms = spec.moonStars, sv = ms.sigmaVinadi ?? 0, minE = ms.minElongation ?? 30;
      for (const star of ms.stars) {
        let t = ms.from;
        for (let guard = 0; guard < 10000; guard++) {
          const lead = mod(star.lambda - M.places(t).moon, 360) / 13.2;
          t = moonAt(M, star.lambda, t + lead);
          if (t >= ms.to) break;
          const p = M.places(t), e = mod(p.moon - p.sun, 360);
          if (Math.min(e, 360 - e) >= minE) {
            const tObs = t + sv / VINADI_PER_DAY * rnd.normal();
            out.push({ id: `candra-${star.name}-${Math.round(t)}`, kind: "candra", star: star.name, t: tObs, lambda: star.lambda, sigmaVinadi: sv || 1, ...tag });
          }
          t += 20;
        }
      }
    }
    if (spec.crescents) {
      const cr = spec.crescents, pb = palabhaOfSite(cr.site);
      for (let conj = syzygy(M, cr.from, 0); conj < cr.to; conj = syzygy(M, conj + 29.53, 0)) {
        for (let N = Math.floor(conj + cr.site.deshantara / 360) - 1; N <= Math.floor(conj) + 5; N++) {
          const set = sunsetOf(N, cr.site);
          if (set <= conj) continue;
          if (kalamsaWest(M, set, pb) >= U.DARSHANA_KALAMSA) { out.push({ id: `darshana-${N}`, kind: "darshana", N, site: cr.site, ...tag }); break; }
        }
      }
    }
    if (spec.planets) {
      const pl = spec.planets, sv = pl.sigmaArcmin ?? 0;
      for (const name of pl.names) for (const t of pl.days) {
        out.push({ id: `graha-${name}-${t}`, kind: "graha", planet: name, t, lambda: mod(M.planet(name, t) + sv / 60 * rnd.normal(), 360), sigma: sv || 1, ...tag });
      }
    }
    return out;
  }

  return Object.freeze({ solarEclipseOnModel: (M, near, site) => solarOnModel(M, textSolar(near, site, "solarEclipseOnModel")),
    sine: S.sine || "table", withSine: (name) => samskaraOf(S.withSine(name), PM, KP, K, U.withSine(name), C.withSine(name), GR.withSine(name), GH.withSine(name), D.withSine(name), V.withSine(name)),
    CANONS, PARAMS, DEFAULT_PARAMS, KINDS: Object.freeze(Object.keys(FIELDS)), BODIES,
    model, contextOf, buildModel, lunarEclipse, syzygy, moonAt, kalamsaWest, sunsetOf,
    equationsOf, jacobiEigen, samskara, feasibleIntervals,
    wholeMeanArcsec, sakabdaMinutes, sakabdaArcsec, chainOf, simplestBetween, ratEq,
    katapayadiOf, lexiconFromVerses, bhutasankhya,
    fromVedha, synthesize, prng, daysOf, fromLedger, dhruvaMedian, robust, correct,
    SOURCES, tagOf,
  });
});
