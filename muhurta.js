/* muhurta.js — मुहूर्त: the day's divisions and the windows the texts tell us to avoid, each with its source.
 *
 * Sourced in the local texts:
 *   SS 11.1-11.2, 11.6-11.12  the two pātas: when the Sun's and Moon's declinations are equal with their (sāyana) longitudes
 *                             summing to half a circle (Vyatīpāta) or a whole circle (Vaidhṛta); the Moon's declination is
 *                             taken with her latitude (11.7). This module finds the middle instant (11.12); the duration
 *                             needs the discs' measures (11.14, ch.4), not built yet.
 *   SS 11.19                  the equality can happen twice, and in the reverse case not at all — so every equal-declination
 *                             instant near the longitude condition is reported, or its absence. The local edition reads
 *                             "viṣuvat-sannidhau", near the equinox. Computed (1990-2025, 1108 pātas): every double and every
 *                             failure has the sāyana Sun within 33° of a SOLSTICE, where both declination curves are flat; none
 *                             of the 235 pātas within 20° of an equinox is double. The failures come in runs around 1996 and
 *                             2015 and none in 2002-2010 — the Moon's 18.6-year nodal cycle (her greatest declination then
 *                             stays below the Sun's). Flagged for the owner [reading conflict; another witness of 11.19 is needed].
 *   SS 11.20                  the sum of Sun and Moon divided by a nakṣatra's span: "saptadaśānta" is a third Vyatīpāta.
 *                             Read here as the whole 17th yoga [reading; the word can also mean only its end].
 *   SS 11.21-11.22            gaṇḍānta: the last pāda of Āśleṣā, Jyeṣṭhā and Revatī and the first pāda of the next — avoided in all works.
 *   BPHS 92.1-92.4            gaṇḍānta of tithi (pūrṇā → nandā junctions), of nakṣatra (the same three junctions) and of lagna
 *                             (Mīna–Meṣa, Karka–Siṃha, Vṛścika–Dhanu): "four nāḍīs, below and above" for the first two, "a ghaṭī"
 *                             for the lagna. Read here as that much on EACH side [reading; pass `nadis` to change it].
 *                             92.3 names the junctions Revatī–Aśvinī, Āśleṣā–Maghā, Jyeṣṭhā–Mūla. 92.2 names the junction of
 *                             the pūrṇā and nandā tithis; WHICH tithis those are (5, 10, 15 and 1, 6, 11) is not in a local text.
 *   BPHS 89.3                 riktā tithis and Viṣṭi to be avoided (for śānti).
 *   BPHS 44.17                names the vipat, pratyari and vadha tārās (the 3rd, 5th and 7th of the nine-fold count).
 * Not in any local text (marked so, not cited): the division of day and night into fifteen muhūrtas each, Abhijit as the
 * 8th of the day, Brāhma as the 14th of the night, which tithis are riktā (4, 9, 14), pūrṇā and nandā, the 27th yoga
 * as Vaidhṛti, and the full names of the nine tārās.
 * Nāḍī and ghaṭī here are of the star-wheel's turn (NADI_DAYS), as the chain of time requires.
 * Browser: window.Muhurta (needs window.Panchanga, window.Sphuta, window.Dhruva); node: module.exports.
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory(require("./panchanga.js"), require("./sphuta.js"), require("./dhruva.js"), require("./kala-dvara.js"));
  else root.Muhurta = factory(root.Panchanga, root.Sphuta, root.Dhruva, root.KalaDvara);
})(typeof globalThis !== "undefined" ? globalThis : this, function muhurtaOf(P, S, D, K) {
  "use strict";
  function build(P) {
  const mod = (a, m) => ((a % m) + m) % m;
  const wrap180 = (a) => mod(a + 180, 360) - 180;
  const D2R = Math.PI / 180, R2D = 180 / Math.PI;
  const UNVERIFIED = "standard usage; no local text states it";
  /** A nāḍī is 1/60 of one turn of the star-wheel (SS 1.11-1.12), not of the civil day: in civil days it is
   *  (1/60) x savana / nakshatra days of the yuga (SS 1.34-1.37). */
  const M_ = K.mana("surya");
  const NADI_DAYS = Number(M_.savana) / (60 * Number(M_.nakshatra));

  /** Fifteen equal muhūrtas of the day (sunrise→sunset) and fifteen of the night (sunset→next sunrise). */
  function muhurtas(N, site, opts) {
    const rise = P.sunrise(N, site, opts), set = P.sunset(N, site, opts), next = P.sunrise(N + 1, site, opts);
    if (rise === null || set === null || next === null) return null;
    const out = [];
    for (let i = 0; i < 15; i++) out.push({ index: i + 1, part: "day", start: rise + (set - rise) * i / 15, end: rise + (set - rise) * (i + 1) / 15 });
    for (let i = 0; i < 15; i++) out.push({ index: i + 16, part: "night", start: set + (next - set) * i / 15, end: set + (next - set) * (i + 1) / 15 });
    return { list: out, abhijit: { ...out[7], source: UNVERIFIED }, brahma: { ...out[28], source: UNVERIFIED }, division: UNVERIFIED };
  }

  /** Instant near t when f(t) = 0, f monotone increasing through 0 in angle (degrees). */
  function rootNear(f, t, span = 1.5, step = 0.05) {
    let a = t - span, fa = f(a);
    for (let x = a + step; x <= t + span; x += step) {
      const fx = f(x);
      if (fa < 0 && fx >= 0 && fx - fa < 90) { let lo = x - step, hi = x; while (hi - lo > 1e-9) { const m = (lo + hi) / 2; if (m <= lo || m >= hi) break; if (f(m) < 0) lo = m; else hi = m; } return hi; }
      a = x; fa = fx;
    }
    return null;
  }
  /** Windows in [t1, t2) during which a limb of panchanga.limbsAt takes one of `values`. */
  function limbWindows(t1, t2, key, values) {
    const out = []; let x = t1;
    while (x < t2) {
      const v = P.limbsAt(x)[key], end = P.nextChange(x, key) ?? t2;
      if (values.includes(v)) out.push({ start: x, end: Math.min(end, t2), value: v });
      x = end + 1e-7;
    }
    return out;
  }

  /** An empty list marked `polar`: the Sun does not rise or set that civil day, so it has no sunrise-to-sunrise windows. */
  const polar = (list) => Object.defineProperty(list, "polar", { value: true, enumerable: false });
  /** Exclusion windows touching civil day N at the site, each with its source. */
  function varjya(N, site, opts = {}) {
    const rise = P.sunrise(N, site, opts), next = P.sunrise(N + 1, site, opts);
    if (rise === null || next === null) return polar([]);
    const nadis = opts.nadis || { tithi: 4, nakshatra: 4, lagna: 1 };
    const out = [];
    // SS 11.21-11.22: the pāda junctions (Moon within the last pāda before / first pāda after 120°, 240°, 360°)
    for (const j of [120, 240, 0]) {
      const lo = mod(j - 200 / 60, 360), hi = mod(j + 200 / 60, 360);
      const enter = rootNear((t) => wrap180(P.placesAt(t).moon - lo), (rise + next) / 2, 1.2);
      const leave = rootNear((t) => wrap180(P.placesAt(t).moon - hi), (rise + next) / 2, 1.2);
      if (enter !== null && leave !== null && leave > enter && enter < next && leave > rise)
        out.push({ kind: "gaṇḍānta (bha-sandhi)", start: enter, end: leave, junction: j, source: "SS 11.21-11.22" });
    }
    // BPHS 92.2-92.4: nāḍī windows around tithi, nakṣatra and lagna junctions
    for (const t of [rise, (rise + next) / 2]) {
      for (const k of [60, 120, 180, 240, 300, 0]) {                                           // ends of tithis 5, 10, 15, 20, 25, 30
        const at = rootNear((x) => wrap180(P.limbsAt(x).elongation - k), t, 0.6);
        if (at !== null && at > rise - 0.2 && at < next + 0.2) out.push({ kind: "tithi-gaṇḍānta", start: at - nadis.tithi * NADI_DAYS, end: at + nadis.tithi * NADI_DAYS, junction: at, source: "BPHS 92.2 [reading: on each side; pūrṇā/nandā: " + UNVERIFIED + "]" });
      }
      for (const k of [120, 240, 0]) {
        const at = rootNear((x) => wrap180(P.placesAt(x).moon - k), t, 0.6);
        if (at !== null && at > rise - 0.2 && at < next + 0.2) out.push({ kind: "nakṣatra-gaṇḍānta", start: at - nadis.nakshatra * NADI_DAYS, end: at + nadis.nakshatra * NADI_DAYS, junction: at, source: "BPHS 92.3 [reading: on each side]" });
      }
    }
    for (const L of lagnas(N, site, opts)) if ([0, 4, 8].includes(L.index)) {
      // the sunrise lagna's `start` is sunrise, not its junction: find the junction before sunrise
      const at = L.startsBeforeSunrise ? lagnaJunctionBefore(L.start, L.index, site, opts) : L.start;
      const w = [at - nadis.lagna * NADI_DAYS, at + nadis.lagna * NADI_DAYS];
      if (w[1] > rise && w[0] < next) out.push({ kind: "lagna-gaṇḍānta", start: w[0], end: w[1], junction: at, source: "BPHS 92.4 [reading: on each side]" });
    }
    // SS 11.20 and the 27th yoga
    for (const w of limbWindows(rise, next, "yoga", [17])) out.push({ kind: "Vyatīpāta (17th yoga)", ...w, source: "SS 11.20 [reading: the whole yoga]" });
    for (const w of limbWindows(rise, next, "yoga", [27])) out.push({ kind: "Vaidhṛti (27th yoga)", ...w, source: UNVERIFIED + " (SS 11.1 names the Vaidhṛta pāta, not this yoga)" });
    // BPHS 89.3
    for (const w of limbWindows(rise, next, "tithi", [4, 9, 14, 19, 24, 29])) out.push({ kind: "riktā tithi", ...w, source: "BPHS 89.3 (which tithis are riktā: " + UNVERIFIED + ")" });
    for (const w of limbWindows(rise, next, "karana", karanaIndicesOf("Viṣṭi"))) out.push({ kind: "Viṣṭi (Bhadrā)", ...w, source: "BPHS 89.3" });
    // SS 11.1-11.12: the pātas of equal declination
    for (const p of patas(rise, next, opts)) out.push(p);
    // de-duplicate identical windows
    const seen = new Set();
    return out.filter((w) => { const k = w.kind + Math.round(w.start * 1e5); if (seen.has(k)) return false; seen.add(k); return true; }).sort((a, b) => a.start - b.start);
  }
  function karanaIndicesOf(name) { const out = []; for (let k = 1; k <= 60; k++) if (P.karanaName(k) === name) out.push(k); return out; }

  /** SS 11.1-11.12, 11.19: middle instants of the Vyatīpāta and Vaidhṛta pātas whose middle falls in [t1, t2).
   *  Vaidhṛta (11.1): same ayana, sāyana longitudes summing to a circle, declinations equal (opposite signs).
   *  Vyatīpāta (11.2): opposite ayanas, sum half a circle, declinations equal (same sign). Either ayana condition follows
   *  from the sum. The Moon's declination is corrected by her latitude (11.7). From the instant the longitude condition
   *  holds, every instant of equal declination within 3 days either side is reported (11.19: twice, or none). */
  function patas(t1, t2, opts = {}) {
    const out = [];
    const eps = typeof opts.epsilon === "number" ? opts.epsilon : D.SS_EPSILON_DEG;
    const A = (t) => (typeof opts.ayanamsha === "number" ? opts.ayanamsha : S.ayanamshaSS(S.spandasOfDays(t)));
    const decl = (t) => {
      const p = P.placesAt(t), a = A(t);
      const ds = D.eclipticToEquatorial(p.sun + a, 0, eps).delta;
      const dm = Math.asin(Math.sin(eps * D2R) * Math.sin((p.moon + a) * D2R)) * R2D + p.moonLatitude;
      return { ds, dm, sum: mod(p.sun + p.moon + 2 * a, 360) };
    };
    for (const [name, target, g] of [["Vyatīpāta (pāta)", 180, (d) => d.dm - d.ds], ["Vaidhṛta (pāta)", 0, (d) => d.dm + d.ds]]) {
      const conditions = [];
      let y0 = t1 - 3, f0 = wrap180(decl(y0).sum - target);
      for (let y = y0 + 0.25; y <= t2 + 3 + 1e-9; y += 0.25) {
        const fy = wrap180(decl(y).sum - target);
        if (f0 < 0 && fy >= 0 && fy - f0 < 90) { let lo = y - 0.25, hi = y; while (hi - lo > 1e-9) { const m = (lo + hi) / 2; if (m <= lo || m >= hi) break; if (wrap180(decl(m).sum - target) < 0) lo = m; else hi = m; } conditions.push(hi); }
        f0 = fy;
      }
      for (const tSum of conditions) {
        const roots = [];
        let x0 = tSum - 3, g0 = g(decl(x0));
        for (let x = x0 + 0.02; x <= tSum + 3 + 1e-9; x += 0.02) {
          const gx = g(decl(x));
          if (Math.sign(gx) !== Math.sign(g0)) {
            let lo = x - 0.02, hi = x; const s0 = Math.sign(g0);
            while (hi - lo > 1e-9) { const m = (lo + hi) / 2; if (m <= lo || m >= hi) break; if (Math.sign(g(decl(m))) === s0) lo = m; else hi = m; }
            roots.push(hi);
          }
          g0 = gx;
        }
        if (roots.length === 0) {
          if (tSum >= t1 && tSum < t2) out.push({ kind: name, start: tSum, end: tSum, middle: null, longitudeCondition: tSum, note: "declinations do not become equal near the longitude condition: no pāta", source: "SS 11.19" });
          continue;
        }
        for (const r of roots) if (r >= t1 && r < t2)
          out.push({ kind: name, start: r, end: r, middle: r, longitudeCondition: tSum, count: roots.length, note: "middle instant; the duration (11.14) needs the discs' measures" + (roots.length > 1 ? "; occurs " + roots.length + " times (11.19)" : ""), source: roots.length > 1 ? "SS 11.1-11.12, 11.19" : "SS 11.1-11.12" });
      }
    }
    const seen = new Set();
    return out.filter((w) => { const k = w.kind + Math.round(w.start * 1e4); if (seen.has(k)) return false; seen.add(k); return true; });
  }

  /** The instant before t at which the rising sign became `index` (searching back at most a day). */
  function lagnaJunctionBefore(t, index, site, opts) {
    let a = t; while (a > t - 1 && P.lagnaAt(a, site, opts).index === index) a -= 1 / 96;
    let lo = a, hi = a + 1 / 96;
    while (hi - lo > 1e-9) { const m = (lo + hi) / 2; if (m <= lo || m >= hi) break; if (P.lagnaAt(m, site, opts).index === index) hi = m; else lo = m; }
    return hi;
  }

  /** The rising signs through civil day N (sunrise to next sunrise): start and end of each. */
  function lagnas(N, site, opts) {
    const rise = P.sunrise(N, site, opts), next = P.sunrise(N + 1, site, opts);
    if (rise === null || next === null) return polar([]);
    const out = []; let x = rise, cur = P.lagnaAt(x, site, opts).index;
    while (x < next) {
      let b = x + 1 / 96; while (b < next && P.lagnaAt(b, site, opts).index === cur) b += 1 / 96;
      if (b >= next) { out.push({ index: cur, rashi: P.RASHI[cur], start: x, end: next }); break; }
      let lo = b - 1 / 96, hi = b;
      while (hi - lo > 1e-9) { const m = (lo + hi) / 2; if (m <= lo || m >= hi) break; if (P.lagnaAt(m, site, opts).index === cur) lo = m; else hi = m; }
      out.push({ index: cur, rashi: P.RASHI[cur], start: x, end: hi });
      x = hi; cur = P.lagnaAt(x + 1e-6, site, opts).index;
    }
    return out.map((L, i) => (i === 0 ? { ...L, startsBeforeSunrise: true } : L));
  }

  const TARA = Object.freeze(["janma", "sampat", "vipat", "kṣema", "pratyari", "sādhaka", "vadha", "mitra", "ati-mitra"]);
  /** Tārā of the day's nakṣatra counted from the birth nakṣatra (both 1…27): 1…9; vipat, pratyari, vadha (3, 5, 7) are the
   *  ones BPHS 44.17 names. Names of all nine: the edition's commentary on BPHS, not a verse. */
  function tara(janma, day) {
    const c = mod(day - janma, 27) + 1, i = ((c - 1) % 9) + 1;
    return { index: i, name: TARA[i - 1], adverse: [3, 5, 7].includes(i), source: "BPHS 44.17 (vipat, pratyari, vadha)" };
  }

  return Object.freeze({ panchanga: P, withPanchanga: (p) => build(p), withSine: (name) => muhurtaOf(P.withSine(name), S.withSine(name), D, K), muhurtas, varjya, patas, lagnas, tara, TARA, limbWindows, NADI_DAYS });
  }
  return build(P);
});
