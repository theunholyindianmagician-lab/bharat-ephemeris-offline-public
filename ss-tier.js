/* ss-tier.js — the text tier, as one adapter: a Julian day (UT) in, the Sūrya-Siddhānta's own quantities out, computed
 * only by the sovereign modules. math-core.js's text tiers ('ss+parameshvara', 'ss') call nothing else.
 *
 * TIME. The text counts civil days from midnight at Laṅkā at the start of the Kali-yuga (SS 1.45-1.47). Laṅkā is on the
 * Ujjayinī meridian, 75.7885° east of Greenwich, so its midnight comes 75.7885/360 of a day before Greenwich's:
 *     t = jd − 588465.5 + 75.7885/360          (no clock correction of any kind: the text's day is the civil day)
 * The text's obliquity is the arc of 1397 on R = 3438 (SS 2.28; Dhruva.SS_EPSILON_DEG) and its ayanāṃśa is SS 3.9-3.10
 * (Sphuta.ayanamshaSS); both are used everywhere in this tier (lagna, madhya-lagna, sunrise, moonrise, the shadow).
 *
 * THE TEXT TIERS (owner, 2026-10-08; the fourth 2026-10-09). Every function takes opts.samskara, the tier's variant:
 *   'parameshvara' (the default, the page default): the text's model with Parameśvara's saṃskāra — the mean places that
 *       the paramparā record names (corpus/parampara/samskara.json, read through parampara.js samskaraParameshvara(),
 *       never typed here) moved by its arcminutes; the record moves them at its epoch and carries them at the text's own
 *       rates, so the shift is the same at every instant [theorem: no rate is changed]. Today the record corrects the
 *       Moon and the node, and the ayanāṃśa's zero: Parameśvara's own determination (15° complete in Kali 4536) as a
 *       phase of the text's libration (sphuta.js ayanamshaSS(spandas, phaseDeg)); the Moon's apogee would move only if
 *       the record named it. The Sun and the five star-planets are the text's.
 *   'kerala': the Kerala paramparā (Parahita + Dṛggaṇita) on the same geocentric model — the mean Sun, Moon, apogee and
 *       node of parahita-madhyama.js (Āryabhaṭa's integers, Haridatta's Śakābda-saṃskāra, Parameśvara's fractions),
 *       counted from sunrise at Laṅkā as Āryabhaṭa's day is [reading; measured: his epoch Moon reproduced to 0.3′];
 *       Āryabhaṭa's Sun apogee 78° (registry ABH-apsides-G9); the text's epicycles on those means [reading: no local
 *       edition attests Āryabhaṭa's]; the ayanāṃśa by Nīlakaṇṭha's linear rule (registry NIL-ayanamsha-rate). The five
 *       star-planets are the text's: their Parahita integers are in the registry (PH-yugabhoga), their epicycles are not.
 *   null: the plain Sūrya-Siddhānta, exactly the text.
 * Everything a tier's places or ayanāṃśa touch — sunrise and the day, tithi, nakṣatra, yoga, karaṇa, the months and
 * the year, lagna, the shadow, daśā, moonrise, the eclipses — follows the tier (one code path each: the tier's calendar
 * is Panchanga.withPlaces on its places and its ayanāṃśa).
 *
 * THE PARAMPARĀ RECORD. In Node it is read from corpus/parampara/ on first use. In a browser the page loads the two JSON
 * files and calls SSTier.useParampara(Parampara.load({ registry, samskara })) before asking for the saṃskāra tier.
 *
 * Browser: window.SSTier (needs KalaDvara, Sphuta, Dhruva, SSUdaya, SSGraha, SSChaya, SSGrahana, SSAhargana, Panchanga,
 * Dasha, Muhurta, Utsava, Parampara; ParahitaMadhyama for the Kerala tier; Samskara for the corrected tiers' eclipses);
 * node: module.exports.
 * Exact arithmetic where the modules have it; no library trigonometry here.
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory(require("./kala-dvara.js"), require("./sphuta.js"), require("./dhruva.js"), require("./ss-udaya.js"), require("./ss-graha.js"),
      require("./ss-chaya.js"), require("./ss-grahana.js"), require("./ss-ahargana.js"), require("./panchanga.js"), require("./dasha.js"), require("./muhurta.js"),
      require("./utsava.js"), require("./parampara.js"),
      () => ({ registry: require("./corpus/parampara/registry.json"), samskara: require("./corpus/parampara/samskara.json") }),
      () => require("./samskara.js"), () => require("./parahita-madhyama.js"));
  } else {
    root.SSTier = factory(root.KalaDvara, root.Sphuta, root.Dhruva, root.SSUdaya, root.SSGraha, root.SSChaya, root.SSGrahana, root.SSAhargana, root.Panchanga,
      root.Dasha, root.Muhurta, root.Utsava, root.Parampara, null, () => root.Samskara || null, () => root.ParahitaMadhyama || null);
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function ssTierOf(K, S, D, U, G, C, GH, A, P, DA, MU, UT, PA, nodeCorpus, samskaraModule, parahitaModule) {
  "use strict";
  const need = { KalaDvara: K, Sphuta: S, Dhruva: D, SSUdaya: U, SSGraha: G, SSChaya: C, SSGrahana: GH, SSAhargana: A, Panchanga: P, Dasha: DA, Muhurta: MU, Utsava: UT };
  for (const [name, mod] of Object.entries(need)) if (!mod) throw new Error(`ss-tier: ${name} must be loaded before ss-tier.js`);

  const MERIDIAN_DEG = 75.7885;                     // Laṅkā–Ujjayinī, degrees east of Greenwich (the site's one meridian)
  const KALI_JD0 = 588465.5;                         // JD (UT) of Greenwich midnight opening Kali day 0
  const LANKA_OFFSET = MERIDIAN_DEG / 360;           // Laṅkā midnight precedes Greenwich midnight by this part of a day
  const SPAN_YEARS = Object.freeze([-50000, 50000]); // the span the text tier is tested over (deep-time.test.js, tier-unity.test.js)
  const EPSILON_DEG = D.SS_EPSILON_DEG;              // SS 2.28: arc of 1397 on R = 3438
  const SPD = S.SPD;
  const SAMSKARAS = Object.freeze(["parameshvara", "kerala", null]);
  const DEFAULT_SAMSKARA = "parameshvara";           // owner, 2026-10-08 (decision a): the text tier's primary default
  const SUNRISE_DAY = 0.25;                          // Āryabhaṭa's day begins at sunrise at Laṅkā: a quarter day after the text's midnight [reading: registry PAR-epoch-1651700]
  const TEXT_AYANAMSHA_RATE_ARCSEC = 600 * 360 / 4320000 * 0.3 * 3600;   // 54″ a year [theorem: 600 turns a yuga × 360° ÷ 4,320,000 years × 0.3]
  const wrap = (d) => mod(d + 180, 360) - 180;
  const mod = (a, m) => ((a % m) + m) % m;
  const fin = (x, what) => { if (typeof x !== "number" || !Number.isFinite(x)) throw new TypeError(`ss-tier: ${what} must be a finite number`); return x; };

  // ── time and place ─────────────────────────────────────────────────────────────────────────────────────
  /** Civil days since midnight at Laṅkā at the Kali epoch (SS 1.45-1.47) of a Julian day in UT. */
  const daysOfJd = (jd) => (fin(jd, "the Julian day") - KALI_JD0) + LANKA_OFFSET;
  /** The Julian day (UT) of a day count t. */
  const jdOfDays = (t) => (fin(t, "the day count") - LANKA_OFFSET) + KALI_JD0;
  const jdOrNull = (t) => (t === null || t === undefined ? null : jdOfDays(t));
  /** { latitude, longitude (east +) } → the text's site { latitude, deshantara = longitude − 75.7885 } (palabha kept). */
  function siteOf(site) {
    if (!site || typeof site !== "object") throw new TypeError("ss-tier: a site is { latitude, longitude } in degrees (east +)");
    if (typeof site.deshantara === "number" && site.longitude === undefined) return site;
    const latitude = fin(site.latitude, "the latitude"), longitude = fin(site.longitude, "the longitude");
    const out = { latitude, deshantara: longitude - MERIDIAN_DEG };
    if (typeof site.palabha === "number") out.palabha = site.palabha;
    return out;
  }
  /** The civil spandas (BigInt) of a day count. */
  const spandasOf = (t) => S.spandasOfDays(t);
  /** The civil spandas since midnight at Laṅkā at the Kali epoch of a Julian day (UT): one civil day = 328,050,000,000. */
  const spandasOfJd = (jd) => S.spandasOfDays(daysOfJd(jd));
  /** The text's mean places at a day count (no saṃskāra): Sphuta.madhyama + SSGraha.meanPlaces. */
  function meanAtDays(t) {
    const m = S.madhyama(S.spandasOfDays(fin(t, "the day count")));
    return { t, sun: m.sun, moon: m.moon, moonApogee: m.moonApogee, node: m.node, sunApogee: m.sunApogee, planets: G.meanPlaces(t) };
  }
  /** A rational number of spandas { num, den } → days (float), exact up to the last division. */
  function daysOfSpandas(r) {
    const q = r.num / r.den, rem = r.num % r.den;
    return Number(q / SPD) + (Number(q % SPD) + Number(rem) / Number(r.den)) / Number(SPD);
  }

  // ── the saṃskāra ──────────────────────────────────────────────────────────────────────────────────────
  let paramparaLoaded = null;
  const correctionCache = new Map();
  /** Give the tier a loaded paramparā record (Parampara.load({ registry, samskara })): the browser's way. */
  function useParampara(loaded) {
    if (!loaded || typeof loaded.samskaraParameshvara !== "function") throw new TypeError("ss-tier: useParampara takes Parampara.load({ registry, samskara })");
    paramparaLoaded = loaded; correctionCache.clear(); tiers.clear();
    return loaded;
  }
  function parampara() {
    if (paramparaLoaded) return paramparaLoaded;
    if (PA && nodeCorpus) return (paramparaLoaded = PA.load(nodeCorpus()));
    throw new Error("ss-tier: Parameśvara's saṃskāra needs the paramparā record — load corpus/parampara/registry.json and samskara.json and call " +
      "SSTier.useParampara(Parampara.load({ registry, samskara })) first");
  }
  const BODY_FIELDS = Object.freeze({ moon: "moonArcmin", node: "nodeArcmin", moonApogee: "moonApogeeArcmin" });
  const resolveSamskara = (name) => {
    const s = name === undefined ? DEFAULT_SAMSKARA : name;
    if (!SAMSKARAS.includes(s)) throw new RangeError(`ss-tier: the tier's variant (opts.samskara) is 'parameshvara' (the default), 'kerala' or null (the plain text), not ${JSON.stringify(name)}`);
    return s;
  };
  function parahita() {
    const PM = parahitaModule ? parahitaModule() : null;
    if (!PM || typeof PM.parahitaArcsec !== "function") throw new Error("ss-tier: the Kerala tier needs parahita-madhyama.js loaded (window.ParahitaMadhyama)");
    return PM;
  }
  const textAyanamsha = (t) => S.ayanamshaSS(S.spandasOfDays(t));
  /** The libration's rate at t: 54″ a year × (27 + δ)/27 for a greatest value 27 + δ, signed by the change over a day. */
  const librationRate = (ayanamshaAt, amplitudeDeltaDeg = 0) => (t) => (ayanamshaAt(t + 0.5) >= ayanamshaAt(t - 0.5) ? 1 : -1) * TEXT_AYANAMSHA_RATE_ARCSEC * (27 + amplitudeDeltaDeg) / 27;
  /** The correction a tier applies: null for the plain text; else a frozen record { name, tierId, corrects, mean(t) →
   *  { sun, moon, moonApogee, node, sunApogee }, ayanamshaAt(t), ayanamshaRule, ayanamshaRateArcsecPerYear(t), modelDeltas,
   *  modelEpoch, modelAyanamsha (samskara.js model inputs for the eclipse search), label, labelSa, caption, epochKali, source,
   *  … }: 'parameshvara' from the paramparā record (shiftDeg/shiftArcmin of the Moon, node, apogee; ayanamshaPhaseDeg),
   *  'kerala' from parahita-madhyama.js and the registry (see keralaCorrection). */
  function correction(name) {
    const s = resolveSamskara(name);
    if (s === null) return null;
    if (correctionCache.has(s)) return correctionCache.get(s);
    const out = s === "kerala" ? keralaCorrection() : parameshvaraCorrection();
    correctionCache.set(s, out);
    return out;
  }
  function parameshvaraCorrection() {
    const rec = parampara().samskaraParameshvara();
    if (rec.offered !== true) throw new RangeError("ss-tier: the paramparā record does not offer Parameśvara's saṃskāra (its leave-one-out test does not improve on the plain text)");
    if (!Array.isArray(rec.corrects) || !rec.corrects.length) throw new RangeError("ss-tier: the saṃskāra record names nothing it corrects");
    const shiftDeg = { moon: 0, node: 0, moonApogee: 0 }, shiftArcmin = { moon: 0, node: 0, moonApogee: 0 };
    let ayanamshaPhaseDeg = 0, ayanamshaAmplitudeDeg = 0;
    for (const body of rec.corrects) {
      if (body === "ayanamsha") {
        for (const k of ["ayanamshaPhaseDeg", "ayanamshaAmplitudeDeg"]) if (typeof rec[k] !== "number" || !Number.isFinite(rec[k])) throw new RangeError(`ss-tier: the saṃskāra record corrects the ayanāṃśa but gives no ${k}`);
        ayanamshaPhaseDeg = rec.ayanamshaPhaseDeg; ayanamshaAmplitudeDeg = rec.ayanamshaAmplitudeDeg; continue;
      }
      const field = BODY_FIELDS[body];
      if (!field || typeof rec[field] !== "number" || !Number.isFinite(rec[field])) throw new RangeError(`ss-tier: the saṃskāra record corrects "${body}" but gives no ${field || "arcminutes"} for it`);
      shiftArcmin[body] = rec[field]; shiftDeg[body] = rec[field] / 60;
    }
    const modelDeltas = {};
    for (const body of rec.corrects) if (body !== "ayanamsha") modelDeltas[`${body}.epoch`] = shiftArcmin[body];
    if (rec.corrects.includes("ayanamsha")) { modelDeltas["ayanamsha.phase"] = ayanamshaPhaseDeg; modelDeltas["ayanamsha.amplitude"] = ayanamshaAmplitudeDeg; }
    const mean = (t) => {
      const m0 = S.madhyama(S.spandasOfDays(t));
      return { sun: m0.sun, moon: mod(m0.moon + shiftDeg.moon, 360), moonApogee: mod(m0.moonApogee + shiftDeg.moonApogee, 360), node: mod(m0.node + shiftDeg.node, 360), sunApogee: m0.sunApogee };
    };
    const ayanamshaAt = (t) => S.ayanamshaSS(S.spandasOfDays(t), ayanamshaPhaseDeg, ayanamshaAmplitudeDeg);
    return Object.freeze({ name: "parameshvara", tierId: "ss+parameshvara", calendarName: "sūrya-siddhānta + parameśvara-saṃskāra",
      shiftDeg: Object.freeze(shiftDeg), shiftArcmin: Object.freeze(shiftArcmin), corrects: Object.freeze(rec.corrects.slice()), label: rec.label, labelSa: rec.labelSa,
      caption: rec.caption, epochKali: rec.epochKali, julian: rec.julian, sigma: rec.sigma, moonArcmin: rec.moonArcmin, nodeArcmin: rec.nodeArcmin,
      ayanamshaPhaseDeg, ayanamshaAmplitudeDeg, ayanamsha: rec.ayanamsha, mean, ayanamshaAt, ayanamshaRateArcsecPerYear: librationRate(ayanamshaAt, ayanamshaAmplitudeDeg),
      ayanamshaRule: rec.corrects.includes("ayanamsha")
        ? `SS 3.9-3.10, the text's libration, fitted to the paramparā's three determinations (${rec.ayanamsha.records.map((r) => `${r.who}: ${r.stated}, residual ${r.residualArcmin}′`).join("; ")}): phase ${ayanamshaPhaseDeg}° of the libration angle, greatest value ${27 + ayanamshaAmplitudeDeg}° (the text's 27°), ±${rec.ayanamsha.rateArcsecPerYear}″ a year (the text's 54″) [paramparā]`
        : "SS 3.9-3.10, the text's libration: ±54″ a year",
      modelDeltas: Object.freeze(modelDeltas), modelEpoch: rec.epochKali, modelAyanamsha: null,
      default: rec.default === true, records: rec.records, rule: "the record's mean-place shifts at its epoch, carried at the text's own rates: the same shift at every instant [theorem]; the ayanāṃśa's zero moved by the record's phase",
      source: rec.source });
  }
  /** The Kerala paramparā (Parahita + Dṛggaṇita) as one correction record — see the header. Every number is read from
   *  parahita-madhyama.js or the registry; the samskara.js model for the eclipse search is the text's canon moved, at
   *  Parameśvara's epoch, by the difference of the two canons' mean places and, per yuga, by the difference of their rates
   *  (both linear in t, so the model is exact [theorem]; checked against the exact places in tier-unity.test.js). */
  function keralaCorrection() {
    const PM = parahita(), reg = parampara();
    const need = { "NIL-ayanamsha-rate": null, "PAR-ayanamsha-4536": null, "ABH-apsides-G9": null, "PAR-epoch-1651700": null, "PAR-fractions": null };
    for (const id of Object.keys(need)) { need[id] = reg.record(id); if (!need[id]) throw new RangeError(`ss-tier: the Kerala tier needs registry record ${id}`); }
    const nil = need["NIL-ayanamsha-rate"], par = need["PAR-ayanamsha-4536"], aps = need["ABH-apsides-G9"], ep = need["PAR-epoch-1651700"];
    const m = /^(\d+)°(\d+)′$/.exec(String(nil.value.ayanamshaAtTheEclipse));
    if (!m || typeof nil.value.rateArcminPerYear !== "number" || !Number.isInteger(nil.era.kaliDay)) throw new RangeError("ss-tier: NIL-ayanamsha-rate must give the ayanāṃśa as D°M′, its Kali day and rateArcminPerYear");
    if (!aps.value || typeof aps.value.mandoccaDegrees.sun !== "number") throw new RangeError("ss-tier: ABH-apsides-G9 must give the Sun's mandocca");
    const nilDeg = Number(m[1]) + Number(m[2]) / 60, nilDay = nil.era.kaliDay;
    const yearDays = Number(PM.YUGA_DAYS) / 4320000;                                      // Āryabhaṭa's year in civil days (Gītikā 3)
    // the ayanāṃśa: a line through the paramparā's three determinations (least squares) — Āryabhaṭa's zero in Kali 3600,
    // Nīlakaṇṭha's figure at his day, Parameśvara's 15° in Kali 4536; its slope is the rate the records imply, beside the
    // rule Nīlakaṇṭha states (0.9′ a year) which is kept as a cross-check
    const abh = reg.record("ABH-no-ayanacalana-3600");
    if (!abh || typeof abh.value.ayanamshaAtKali3600 !== "number" || !Number.isInteger(abh.era.kaliYear)) throw new RangeError("ss-tier: ABH-no-ayanacalana-3600 must give the ayanāṃśa and its Kali year");
    const pts = [[abh.era.kaliYear * yearDays, abh.value.ayanamshaAtKali3600], [nilDay, nilDeg], [par.value.kaliYearsElapsed * yearDays, par.value.ayanamshaDegrees]];
    const n = pts.length, sx = pts.reduce((s, q) => s + q[0], 0), sy = pts.reduce((s, q) => s + q[1], 0), sxx = pts.reduce((s, q) => s + q[0] * q[0], 0), sxy = pts.reduce((s, q) => s + q[0] * q[1], 0);
    const slope = (n * sxy - sx * sy) / (n * sxx - sx * sx), intercept = (sy - slope * sx) / n;   // degrees per civil day
    const ratePerYear = slope * yearDays;                                                 // degrees a year
    const lineResidualsArcmin = pts.map(([t, v]) => (intercept + slope * t - v) * 60);
    const sunApogee = aps.value.mandoccaDegrees.sun;
    const degOf = (r) => Number((r.num * 9007199254740992n) / r.den) / 9007199254740992 / 3600;
    const mean = (t) => {
      const Sp = S.spandasOfDays(t - SUNRISE_DAY), g = (b) => degOf(PM.parahitaArcsec(b, Sp, { parameshvara: true }));
      return { sun: g("sun"), moon: g("moon"), moonApogee: g("apogee"), node: g("node"), sunApogee };
    };
    const ayanamshaAt = (t) => intercept + slope * t;
    // the model's deltas: the difference of the canons at the epoch (arcmin) and its slope over a century (revolutions a yuga)
    const epochKali = ep.era.kaliDay, t0 = epochKali + SUNRISE_DAY, DT = 36525, YS = Number(S.YUGA_DAYS);
    const s0 = S.madhyama(S.spandasOfDays(t0)), s1 = S.madhyama(S.spandasOfDays(t0 + DT)), k0 = mean(t0), k1 = mean(t0 + DT);
    const modelDeltas = {}, shiftArcmin = {};
    for (const b of ["sun", "moon", "moonApogee", "node"]) {
      const d0 = wrap(k0[b] - s0[b]), d1 = wrap(k1[b] - s1[b]);
      shiftArcmin[b] = d0 * 60; modelDeltas[`${b}.epoch`] = d0 * 60;
      const slopeRevPerYuga = wrap(d1 - d0) / 360 * YS / DT;
      modelDeltas[`${b}.rev`] = b === "node" ? -slopeRevPerYuga : slopeRevPerYuga;        // samskara.js counts the node's revolutions retrograde
    }
    modelDeltas["sunApogee.epoch"] = wrap(sunApogee - s0.sunApogee) * 60;
    modelDeltas["sunApogee.rev"] = -wrap(s1.sunApogee - s0.sunApogee) / 360 * YS / DT;    // the text's apogee moves (SS 1.41); Āryabhaṭa's stands
    const epochPlaces = { sun: ep.value.sun, moon: ep.value.moon, apogee: ep.value.apogee, node: ep.value.node };
    return Object.freeze({ name: "kerala", tierId: "kerala", calendarName: "kerala-paramparā (parahita + dṛggaṇita)",
      label: "Kerala paramparā (Parahita + Dṛggaṇita)", labelSa: "केरल-परम्परा (परहित + दृग्गणित)",
      caption: `The mean Sun, Moon, apogee and node of the Parahita karaṇa (Āryabhaṭa's integers over ${PM.YUGA_DAYS.toLocaleString("en-US")} civil days, the Śakābda-saṃskāra from Śaka ${PM.SAKA_ZERO}) ` +
        `with Parameśvara's fractions (Jyotirmīmāṃsā: ${need["PAR-fractions"].value.moon}, node ${need["PAR-fractions"].value.node}, apogee ${need["PAR-fractions"].value.apogee}), counted from sunrise at Laṅkā; ` +
        `his epoch places at Kali day ${epochKali} (${ep.era.julian} Julian: Sun ${epochPlaces.sun}, Moon ${epochPlaces.moon}, apogee ${epochPlaces.apogee}, node ${epochPlaces.node}) are reproduced ` +
        `to the minute. Āryabhaṭa's Sun apogee ${sunApogee}°; the text's epicycles (SS 2.34-2.38) on these means [reading]; the ayanāṃśa a line through the paramparā's three determinations ` +
        `(Āryabhaṭa's zero in Kali ${abh.era.kaliYear}, Nīlakaṇṭha's ${nil.value.ayanamshaAtTheEclipse} at Kali day ${nilDay}, Parameśvara's ${par.value.ayanamshaDegrees}° in Kali ${par.value.kaliYearsElapsed}): ${(ratePerYear * 60).toFixed(4)}′ a year [reading]. The five star-planets, mean Jupiter and the rest are the text's.`,
      corrects: Object.freeze(["sun", "moon", "moonApogee", "node", "ayanamsha"]), shiftArcmin: Object.freeze(shiftArcmin),
      epochKali, julian: ep.era.julian, epochPlaces: Object.freeze(epochPlaces), sunApogeeDeg: sunApogee, sunriseDay: SUNRISE_DAY, yearDays,
      mean, ayanamshaAt, ayanamshaRateArcsecPerYear: () => ratePerYear * 3600, ayanamshaLine: Object.freeze({ intercept, slope, ratePerYear, residualsArcmin: Object.freeze(lineResidualsArcmin), statedRateArcminPerYear: nil.value.rateArcminPerYear }),
      ayanamshaRule: `linear through the paramparā's three determinations — Āryabhaṭa's ${abh.value.ayanamshaAtKali3600}° in Kali ${abh.era.kaliYear} (${abh.id}), Nīlakaṇṭha's ${nil.value.ayanamshaAtTheEclipse} at Kali day ${nilDay} (${nil.id}), Parameśvara's ${par.value.ayanamshaDegrees}° in Kali ${par.value.kaliYearsElapsed} (${par.id}) — ` +
        `by least squares: ${(ratePerYear * 60).toFixed(4)}′ a year, residuals ${lineResidualsArcmin.map((x) => x.toFixed(1) + '′').join(', ')} [reading]; Nīlakaṇṭha's stated rule, ${nil.value.rateArcminPerYear}′ a year, is the text's 54″ and is kept as a cross-check`,
      modelDeltas: Object.freeze(modelDeltas), modelEpoch: epochKali, modelAyanamsha: ayanamshaAt,
      default: false, records: Object.freeze([...Object.keys(need), abh.id]), sigma: null, moonArcmin: null, nodeArcmin: null,
      rule: "the Parahita + Dṛggaṇita mean places themselves (exact, parahita-madhyama.js), the text's equations on them; the ayanāṃśa linear [reading]",
      source: { means: "parahita-madhyama.js (Āryabhaṭīya Gītikā 3 in the local edition; the Śakābda rule and Parameśvara's fractions from the Jyotirmīmāṃsā)", registry: "corpus/parampara/registry.json: " + Object.keys(need).join(", "),
        planets: "the text's (ss-graha.js): the Parahita integers for them are in the registry (PH-yugabhoga), their epicycles are not attested locally" } });
  }
  /** A tier's true places at day count t, in the shape of Sphuta.sphutaAtDays, from its mean places: the text's equations
   *  (SS 2.29-2.45, 2.57) on them. The plain text is Sphuta.sphutaAtDays itself. */
  function placesOf(meanFn) {
    return function places(t) {
      const m = meanFn(t);
      const sunEq = S.mandaPhala(m.sun, m.sunApogee, S.PARIDHI.sun);                 // 2.29-2.45, as sphuta.js
      const moonEq = S.mandaPhala(m.moon, m.moonApogee, S.PARIDHI.moon);
      const sun = mod(m.sun + sunEq.degrees, 360), moon = mod(m.moon + moonEq.degrees, 360);
      const moonLatitude = S.jya(moon - m.node) * S.MOON_MAX_LATITUDE_ARCMIN / S.R / 60;   // 2.57, degrees
      return { sun, moon, rahu: m.node, ketu: mod(m.node + 180, 360), moonLatitude, mean: m, equations: { sun: sunEq, moon: moonEq } };
    };
  }

  // ── one tier: the modules bound to its places ────────────────────────────────────────────────────────
  const tiers = new Map();
  function tierOf(name) {
    const s = resolveSamskara(name);
    if (tiers.has(s)) return tiers.get(s);
    const corr = correction(s);
    const places = corr ? placesOf(corr.mean) : S.sphutaAtDays;
    const ayanamsha = corr ? corr.ayanamshaAt : textAyanamsha;
    const cal = corr ? P.withPlaces(places, corr.calendarName, ayanamsha) : P;
    const T = { samskara: s, correction: corr, places, ayanamsha, calendar: cal, months: [], years: [],
      dasha: corr ? DA.withPanchanga(cal) : DA, muhurta: corr ? MU.withPanchanga(cal) : MU, utsava: corr ? UT.withPanchanga(cal) : UT,
      model: null, last: { t: NaN, g: null } };
    tiers.set(s, T);
    return T;
  }
  const optsOf = (opts) => (opts && typeof opts === "object" ? opts : {});
  const T_ = (opts) => tierOf(optsOf(opts).samskara);

  // ── grahas ─────────────────────────────────────────────────────────────────────────────────────────────
  const PLANET_KEYS = Object.freeze({ mars: "mangala", mercury: "budha", jupiter: "guru", venus: "shukra", saturn: "shani" });
  /** Every graha at jd: sidereal degrees from the text's Meṣa 0, the latitudes (degrees, north +), the mean places, the
   *  Sun's and Moon's equations, and SSGraha.truePlaces in full. The last call is memoised per tier. */
  function grahas(jd, opts) {
    const T = T_(opts), t = daysOfJd(jd);
    if (T.last.t === t) return T.last.g;
    const p = T.places(t), planets = G.truePlaces(t), means = G.meanPlaces(t);
    const out = { t, jd, samskara: T.samskara, surya: p.sun, candra: p.moon };
    const latitudeDeg = { candra: p.moonLatitude };
    const mean = { surya: p.mean.sun, candra: p.mean.moon, candraApogee: p.mean.moonApogee, suryaApogee: p.mean.sunApogee, rahu: p.mean.node };
    for (const [en, key] of Object.entries(PLANET_KEYS)) {
      out[key] = planets[en].longitude;
      latitudeDeg[key] = planets[en].latitude / 60;
      mean[key] = { mean: means[en].mean, sighrocca: means[en].sighrocca, mandocca: means[en].mandocca, node: means[en].node };
    }
    out.rahu = p.rahu; out.ketu = p.ketu;
    out.latitudeDeg = latitudeDeg; out.mean = mean; out.sun = p.equations.sun; out.moon = p.equations.moon; out.planets = planets;
    T.last = { t, g: Object.freeze(out) };
    return T.last.g;
  }
  /** Sun and Moon only (for the limbs). */
  function sunMoon(jd, opts) {
    const t = daysOfJd(jd), p = T_(opts).places(t);
    return { t, sun: p.sun, moon: p.moon, elongation: mod(p.moon - p.sun, 360), rahu: p.rahu, moonLatitude: p.moonLatitude, meanSun: p.mean.sun };
  }

  // ── ayanāṃśa ───────────────────────────────────────────────────────────────────────────────────────────
  /** The tier's ayanāṃśa at jd, degrees: SS 3.9-3.10 for the plain text; the libration with Parameśvara's phase for the
   *  default; Nīlakaṇṭha's linear rule for the Kerala tier (see correction()). */
  const ayanamshaDeg = (jd, opts) => T_(opts).ayanamsha(daysOfJd(jd));
  /** Its rate, arcseconds a (sidereal) year: ±54″ by the libration's direction over a day for the text and the default
   *  [theorem: 600 turns a yuga × 360° ÷ 4,320,000 years × 0.3]; the record's 0.9′ a year for the Kerala tier. */
  function ayanamshaRateArcsecPerYear(jd, opts) {
    const T = T_(opts), t = daysOfJd(jd);
    return T.correction ? T.correction.ayanamshaRateArcsecPerYear(t) : librationRate(textAyanamsha)(t);
  }
  /** The rule the tier's ayanāṃśa follows, in words (for the pages' labels). */
  const ayanamshaRule = (opts) => { const T = T_(opts); return T.correction ? T.correction.ayanamshaRule : "SS 3.9-3.10, the text's libration: 600 turns a yuga, three-tenths of the bhuja; ±54″ a year"; };

  // ── the limbs, the day, the lagna ──────────────────────────────────────────────────────────────────────
  /** Panchanga.limbsAt at jd (tithi 1-30, nakṣatra 1-27, pada, yoga 1-27, karaṇa 1-60) with the text's names (IAST). */
  function limbsAt(jd, opts) {
    const T = T_(opts), L = T.calendar.limbsAt(daysOfJd(jd));
    const tn = T.calendar.tithiName(L.tithi);
    return { ...L, tithiName: tn, nakshatraName: P.NAKSHATRA[L.nakshatra - 1], yogaName: P.YOGA[L.yoga - 1], karanaName: P.karanaName(L.karana),
      karanaOrder: "SS 2.67 (Śakuni, Nāga, Catuṣpada, Kiṃstughna)" };
  }
  /** The civil day holding jd at the site (SS 14.18: sunrise to sunrise), in JDs: { N, sunriseJd, sunsetJd, nextSunriseJd,
   *  vara: { index, name }, polar, rule } — on the tier's calendar: its Sun and its ayanāṃśa make its sunrise. */
  function dayOf(jd, site, opts) {
    const st = siteOf(site), d = T_(opts).calendar.civilDayOf(daysOfJd(jd), st, optsOf(opts).panchanga);
    return { N: d.N, sunriseJd: jdOrNull(d.sunrise), sunsetJd: jdOrNull(d.sunset), nextSunriseJd: jdOrNull(d.nextSunrise), vara: d.vara, polar: d.polar, rule: d.rule,
      sunrise: d.sunrise, sunset: d.sunset, nextSunrise: d.nextSunrise };
  }
  /** Sunrise, sunset and the next sunrise of civil day N at the site (JDs; null where the Sun does not cross). */
  function dayEvents(N, site, opts) {
    const st = siteOf(site), o = optsOf(opts).panchanga, cal = T_(opts).calendar;
    const rise = cal.sunrise(N, st, o), set = cal.sunset(N, st, o), next = cal.sunrise(N + 1, st, o);
    return { N, sunriseJd: jdOrNull(rise), sunsetJd: jdOrNull(set), nextSunriseJd: jdOrNull(next), vara: K.varaOfKaliDay(N), polar: rise === null || set === null || next === null };
  }
  /** Panchanga.lagnaAt at jd (sidereal, the text's frame: SS ε and SS 3.9-3.10). */
  const lagna = (jd, site, opts) => T_(opts).calendar.lagnaAt(daysOfJd(jd), siteOf(site), optsOf(opts).panchanga);
  /** Panchanga.meridianAt at jd: { ramcDeg (sāyana), madhyaLagna: { longitude (sidereal), rashi, index }, method }. */
  const meridian = (jd, site, opts) => T_(opts).calendar.meridianAt(daysOfJd(jd), siteOf(site), optsOf(opts).panchanga);

  // ── months, years, saṃvatsara ──────────────────────────────────────────────────────────────────────────
  const hit = (list, t) => list.find((x) => x.start <= t && t < x.end) || null;
  const keep = (list, x, n) => { list.unshift(x); if (list.length > n) list.length = n; return x; };
  /** The amānta month holding jd (Panchanga.lunarMonth on the tier's places) + startJd, endJd, fullMoonJd. Cached by
   *  interval: two instants of one civil day either side of a new moon get their own months. */
  function lunarMonth(jd, opts) {
    const T = T_(opts), t = daysOfJd(jd);
    const c = hit(T.months, t);
    if (c) return c;
    const m = T.calendar.lunarMonth(t);
    return keep(T.months, Object.freeze({ ...m, startJd: jdOfDays(m.start), endJd: jdOfDays(m.end), fullMoonJd: jdOfDays(m.fullMoon), samskara: T.samskara }), 24);
  }
  /** The lunisolar year holding jd (SSAhargana.lunarYear on the tier's calendar) + startJd, endJd, meshaJd. */
  function lunarYear(jd, opts) {
    const T = T_(opts), t = daysOfJd(jd);
    const c = hit(T.years, t);
    if (c) return c;
    const y = A.lunarYear(t, T.calendar);
    return keep(T.years, Object.freeze({ ...y, startJd: jdOfDays(y.start), endJd: jdOfDays(y.end), meshaJd: jdOfDays(y.mesha), samskara: T.samskara,
      months: y.months.map((m) => ({ ...m, startJd: jdOfDays(m.start), endJd: jdOfDays(m.end) })) }), 6);
  }
  /** SS 1.55 (SSGraha.samvatsara) at jd: mean Jupiter, which no saṃskāra moves. opts.zero picks the reading (0 = A). */
  const samvatsara = (jd, opts) => G.samvatsara(daysOfJd(jd), optsOf(opts).zero === undefined ? {} : { zero: optsOf(opts).zero });

  // ── daśā ───────────────────────────────────────────────────────────────────────────────────────────────
  const periodJd = (p) => ({ level: p.level, lord: p.lord, name: p.name, startJd: jdOfDays(daysOfSpandas(p.start)), endJd: jdOfDays(daysOfSpandas(p.end)) });
  /** Vimśottarī from a birth instant: the birth nakṣatra by the tier's Moon, the elapsed part by time (BPHS 46.16, dasha.js),
   *  the text's solar year (dasha.js YEAR "saura-surya"), and the chain running at atJd down to `depth` levels. */
  function vimshottari(birthJd, atJd = birthJd, depth = 2, opts) {
    const T = T_(opts), tb = daysOfJd(birthJd), ta = daysOfJd(atJd);
    const o = optsOf(opts), yearDays = 1577917828 / 4320000;
    const cycles = Math.max(1, Math.ceil((ta - tb) / (120 * yearDays)) + 1);
    const v = T.dasha.vimshottari(tb, { balance: "time", cycles, year: o.year });
    const chain = T.dasha.chainAt(v, spandasOf(ta), Math.max(1, Math.min(5, depth)));
    return { birth: { nakshatra: v.birth.nakshatra, nakshatraName: v.birth.nakshatraName, elapsed: v.birth.elapsed, method: v.birth.method,
      nakshatraStartJd: jdOrNull(v.birth.nakshatraStart), nakshatraEndJd: jdOrNull(v.birth.nakshatraEnd) },
      lordAtBirth: v.lordAtBirth, lordAtBirthName: DA.LORDS[v.lordAtBirth], balanceYears: v.balanceYears,
      periods: v.periods.map(periodJd), chain: chain.map(periodJd), year: v.year, samskara: T.samskara };
  }

  // ── muhūrtas, the Moon's rising, the shadow ────────────────────────────────────────────────────────────
  /** Fifteen muhūrtas of the day and fifteen of the night of civil day N (muhurta.js), in JDs; Abhijit is the 8th of the
   *  day [standard usage, unverified: muhurta.js says so]. null in a polar day. */
  function muhurtas(N, site, opts) {
    const r = T_(opts).muhurta.muhurtas(N, siteOf(site), optsOf(opts).panchanga);
    if (!r) return null;
    const j = (x) => ({ index: x.index, part: x.part, startJd: jdOfDays(x.start), endJd: jdOfDays(x.end) });
    return { list: r.list.map(j), abhijit: { ...j(r.abhijit), source: r.abhijit.source }, brahma: { ...j(r.brahma), source: r.brahma.source }, division: r.division };
  }
  /** Moonrise and moonset in civil day N (utsava.js: the Moon's centre on the horizon, no parallax, no refraction). */
  function moonEvents(N, site, opts) {
    const U_ = T_(opts).utsava, st = siteOf(site), o = optsOf(opts).panchanga || {};
    return { riseJd: jdOrNull(U_.moonrise(N, st, o)), setJd: jdOrNull(U_.moonset(N, st, o)), rule: "the Moon's centre on the horizon; no parallax (SS ch.5 not applied), no refraction (utsava.js)" };
  }
  /** The gnomon's shadow at jd (ss-chaya.js): the noon shadow of the sāyana Sun (SS 3.20b-3.22a) and the shadow at the
   *  Sun's hour angle at jd (3.34b-3.36); the sāyana Sun is the text's Sun + SS 3.9-3.10. { error } where the text's chain
   *  does not reach (a southern place, SS 3.14; the Sun below the horizon at noon). */
  function shadow(jd, site, opts) {
    const T = T_(opts), st = siteOf(site), t = daysOfJd(jd);
    if (st.latitude < 0) return { error: "SS 3.14 states the chain for northern places; not computed for a southern latitude" };
    const p = T.places(t), A_ = T.ayanamsha(t), sayanaSun = mod(p.sun + A_, 360);
    const palabha = typeof st.palabha === "number" ? st.palabha : C.palabhaOfLatitude(st.latitude).palabha;
    const H = T.calendar.sunHourAngle(t, st).H;                                         // degrees, west +; 1′ = one asu
    try {
      return { sayanaSun, ayanamsha: A_, palabha, hourAngleDeg: H, noon: C.noonShadow(sayanaSun, palabha), atInstant: C.shadowAt(sayanaSun, palabha, H * 60),
        method: "SS 3.20b-3.22a (noon), 3.34b-3.36 (at the hour angle); the tier's Sun and ayanāṃśa, the text's ε", samskara: T.samskara };
    } catch (e) { return { error: String(e && e.message || e) }; }
  }

  // ── eclipses ───────────────────────────────────────────────────────────────────────────────────────────
  const CONTACTS = ["sparsha", "madhya", "moksha", "nimilana", "unmilana"];
  /** The eclipsed body against the text's horizon at day count t, read as ss-grahana.js reads an eclipse's contacts:
   *  the Laṅkā risings (SS 3.42-3.43) for the hour angle, the Moon's latitude joined to its declination (2.58), the
   *  half-day by 2.60-2.63. lamSid: the body's sidereal longitude; betaArcmin: the Moon's latitude (lunar only). */
  function horizonAt(kind, t, lamSid, betaArcmin, st, T) {
    const A = T.ayanamsha(t), lam = mod(lamSid + A, 360);
    const ha = mod(GH.meridianAsus(t, st, A) - U.ascension(lam, U.risings(0)) + 10800, 21600) - 10800;
    const kj = kind === "lunar" ? S.jya(U.kranti(lam) + betaArcmin / 60) : U.krantiJya(lam);
    const palabha = typeof st.palabha === "number" ? st.palabha : U.palabhaOf(st.latitude);
    const halfDay = U.QUARTER + U.caraOfKrantiJya(kj, palabha);
    return { hourAngleAsus: ha, halfDayAsus: halfDay, above: Math.abs(ha) < halfDay };
  }
  /** The eclipsed body above the text's horizon at the middle, on the tier's own places. */
  function aboveAtMiddle(T, kind, middle, st) {
    const p = T.places(middle);
    return horizonAt(kind, middle, kind === "lunar" ? p.moon : p.sun, p.moonLatitude * 60, st, T).above;
  }
  function plainEclipse(E, T, st) {
    const contactsJd = {};
    for (const c of CONTACTS) contactsJd[c] = E.contacts && E.contacts[c] !== null && E.contacts[c] !== undefined ? jdOfDays(E.contacts[c]) : null;
    return { kind: E.kind, middleJd: jdOfDays(E.middle), possible: E.possible, total: !!E.total, magnitude: E.magnitude, channa: E.channa, contactsJd, middle: E.middle,
      latitude: E.latitude, grahyaDisc: E.grahyaDisc, grahakaDisc: E.grahakaDisc, seenAtSite: E.seenAtSite, aboveAtMiddle: aboveAtMiddle(T, E.kind, E.middle, st),
      grazing: !!E.grazing, method: E.kind === "lunar" ? "SS 4 (ss-grahana.js)" : "SS 4 with 5 (ss-grahana.js)",
      seenRule: "SS 6.13 (a twelfth of the Moon / three minutes of the Sun) with the eclipsed body above the text's horizon at some instant of the perceptible part (ss-grahana.js)" };
  }
  /** Lunar and solar eclipses within ±spanDays of jd at the site. Plain text: ss-grahana.js eclipsesBetween. Saṃskāra:
   *  the same parvas on the saṃskāra model of samskara.js (the code the fit itself uses), built from what the record
   *  corrects (its 'corrects', exactly as placesWith moves the places): the lunar eclipse by Samskara.lunarEclipse, the
   *  solar by Samskara.solarEclipseOnModel (the text's ch.5 parallax held at the text's value, as samskara.js states).
   *  Every row: { kind, middleJd, middle, possible, total, magnitude (the covered part ÷ the eclipsed disc, ≥ 0), channa
   *  (arcminutes), contactsJd { sparsha, madhya, moksha, nimilana, unmilana } (JD UT, null where none), latitude,
   *  seenAtSite (SS 6.13 and the text's horizon, see seenRule), aboveAtMiddle (the eclipsed body above the text's horizon
   *  at the middle), method }. */
  function eclipsesNear(jd, site, spanDays = 16, opts) {
    const T = T_(opts), st = siteOf(site), t = daysOfJd(jd);
    if (!T.correction) return GH.eclipsesBetween(t - spanDays, t + spanDays, st).map((E) => plainEclipse(E, T, st));
    const SK = samskaraModule ? samskaraModule() : null;
    if (!SK) throw new Error("ss-tier: the saṃskāra tier's eclipses need samskara.js (and its modules) loaded");
    const M = modelOf(T, SK), out = [];
    // seen at the site as ss-grahana.js says it for the plain text (6.13's threshold, the body above the text's horizon),
    // over the contacts' span: the perceptible span of 6.13 is not re-derived on the saṃskāra model
    const seenOver = (kind, a, b, beyond) => {
      if (!(beyond && a !== null && b !== null)) return false;
      for (let i = 0; i <= 48; i++) { const x = a + (b - a) * i / 48, p = T.places(x); if (horizonAt(kind, x, kind === "lunar" ? p.moon : p.sun, p.moonLatitude * 60, st, T).above) return true; }
      return false;
    };
    const seenRule = "SS 6.13's threshold reached at the middle, with the eclipsed body above the text's horizon at some instant between sparśa and mokṣa (on the saṃskāra model)";
    for (const [target, kind] of [[180, "lunar"], [0, "solar"]]) {
      for (let x = T.calendar.syzygyNear(t - spanDays, target, +1); x !== null && x < t + spanDays; x = T.calendar.syzygyNear(x + 1, target, +1)) {
        if (kind === "lunar") {
          const E = SK.lunarEclipse(M, x);
          const channa = E.halfSum - Math.abs(E.latitude), threshold = E.discs.moon / GH.TEXT.moonSeenPart;   // 4.11, 6.13
          out.push({ kind, middleJd: jdOfDays(E.middle), middle: E.middle, possible: E.possible, total: E.magnitude >= 1, magnitude: E.magnitude, channa, latitude: E.latitude,
            contactsJd: { sparsha: jdOrNull(E.sparsha), madhya: jdOfDays(E.middle), moksha: jdOrNull(E.moksha), nimilana: null, unmilana: null },
            seenAtSite: E.possible ? seenOver(kind, E.sparsha, E.moksha, channa > threshold) : false, aboveAtMiddle: aboveAtMiddle(T, kind, E.middle, st), seenRule,
            method: "SS 4 on the saṃskāra model (samskara.js lunarEclipse)" });
        } else {
          let E;
          try { E = SK.solarEclipseOnModel(M, x, st); } catch (e) { continue; }          // the text gives no solar parva here
          const at = (c) => { try { const v = E.at(c); return Number.isFinite(v) ? v : null; } catch (e) { return null; } };
          const sp = at("sparsha"), mo = at("moksha"), sparsha = jdOrNull(sp), moksha = jdOrNull(mo);
          const possible = E.channa > 0 && sparsha !== null && moksha !== null;          // the model's eclipse, with the text's contacts to carry
          out.push({ kind, middleJd: jdOfDays(E.middle), middle: E.middle, possible, total: E.channa >= E.grahya, magnitude: E.channa / E.grahya, channa: E.channa, latitude: E.latitude,
            contactsJd: { sparsha, madhya: jdOfDays(E.middle), moksha, nimilana: jdOrNull(at("nimilana")), unmilana: jdOrNull(at("unmilana")) },
            seenAtSite: possible ? seenOver(kind, sp, mo, E.channa > GH.TEXT.sunUnseenArcmin) : false, aboveAtMiddle: aboveAtMiddle(T, kind, E.middle, st), seenRule,
            method: "SS 4 with 5 on the saṃskāra model (samskara.js solarEclipseOnModel; the ch.5 parallax held at the text's value)" });
        }
      }
    }
    return out.filter((E) => E.possible).sort((a, b) => a.middle - b.middle);
  }
  /** The samskara.js model that carries a corrected tier's places into the eclipse search (built once per tier): the
   *  correction's modelDeltas about its epoch, with its own ayanāṃśa rule where it has one (the Kerala tier). */
  function modelOf(T, SK) {
    if (!T.model) {
      const c = T.correction;
      T.model = SK.model(c.modelDeltas, c.modelAyanamsha ? { epoch: c.modelEpoch, ayanamsha: c.modelAyanamsha } : { epoch: c.modelEpoch });
    }
    return T.model;
  }
  /** samskara.js model deltas of a tier's correction (its modelDeltas): for 'parameshvara' each body the record corrects
   *  moved at its epoch by the record's arcminutes ('<body>.epoch') and the libration's phase ('ayanamsha.phase'); for
   *  'kerala' the difference of the canons at the epoch and per yuga. */
  const samskaraDeltas = (corr) => ({ ...corr.modelDeltas });

  /** The labels a page shows for a text tier. */
  function label(opts) {
    const T = T_(opts);
    return T.correction ? { id: T.correction.tierId, label: T.correction.label, labelSa: T.correction.labelSa, caption: T.correction.caption }
      : { id: "ss", label: "Sūrya-Siddhānta", labelSa: "सूर्य-सिद्धान्त", caption: "the text exactly as it stands" };
  }

  return Object.freeze({
    MERIDIAN_DEG, KALI_JD0, LANKA_OFFSET, SPAN_YEARS, EPSILON_DEG, SAMSKARAS, DEFAULT_SAMSKARA, SUNRISE_DAY,
    daysOfJd, jdOfDays, spandasOfJd, meanAtDays, siteOf, useParampara, correction, label,
    calendar: (opts) => T_(opts).calendar, places: (t, opts) => T_(opts).places(t), ayanamshaAt: (t, opts) => T_(opts).ayanamsha(t), dasha: (opts) => T_(opts).dasha, utsava: (opts) => T_(opts).utsava, muhurta: (opts) => T_(opts).muhurta,
    model: (opts) => { const T = T_(opts); if (!T.correction) return null; const SK = samskaraModule ? samskaraModule() : null; if (!SK) throw new Error("ss-tier: the model needs samskara.js loaded"); return modelOf(T, SK); },
    grahas, sunMoon, ayanamshaDeg, ayanamshaRateArcsecPerYear, ayanamshaRule, limbsAt, dayOf, dayEvents, lagna, meridian, lunarMonth, lunarYear, samvatsara,
    vimshottari, muhurtas, moonEvents, shadow, eclipsesNear,
    samskaraDeltas: (opts) => { const T = T_(opts); return T.correction ? samskaraDeltas(T.correction) : null; },
  });
});
