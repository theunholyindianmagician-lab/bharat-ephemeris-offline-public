/* ss-graha.js — ग्रह: the five star-planets of the Sūrya-Siddhānta — mean places, the four-step true place, true daily
 * motion, stations and retrogression, latitudes, and the conjunctions of chapter 7 — by the text's own arithmetic: its
 * revolution numbers, its epicycles, and its 24-entry sine table on R = 3438 with linear interpolation (sphuta.js).
 *
 *   1.29-1.32   revolutions in a yuga (eastward): Mars 2,296,832; Jupiter 364,220; Saturn 146,568; Mercury's śīghra
 *               17,937,060; Venus's śīghra 7,022,376; and 4,320,000 for "sūrya-jña-śukrāṇām" and for "kuja-ārki-guru-
 *               śīghrāṇām" — the mean Mercury and Venus are the mean Sun, and the mean Sun is the śīghrocca of Mars,
 *               Jupiter and Saturn.
 *   1.41-1.44   per kalpa (1000 yugas, 1.40): mandoccas eastward ("prāggateḥ") Mars 204, Mercury 368, Jupiter 900, Venus
 *               535, Saturn 39; nodes westward ("pātānām atha vāmataḥ") Mars 214, Mercury 488, Jupiter 174, Venus 903,
 *               Saturn 662.
 *   1.45-1.47   1,953,720,000 years from creation to the end of the Kṛta; + Tretā + Dvāpara = 1,955,880,000 at the Kali
 *               epoch, which is 452¾ yugas: a yuga body is frac(R·(1811/4 + days/1,577,917,828)), exact in BigInt.
 *   1.53-1.54   mean place = days × revolutions ÷ civil days; uccas forward; nodes the same way, taken from the circle.
 *   1.55        Jupiter's revolutions gone × 12, with the (current) signs, cleared of sixties: the years "from Vijaya" — the
 *               sixty-year cycle from mean Jupiter since creation, exact in BigInt (samvatsara) [reading A: signs gone,
 *               remainder 0 = Vijaya; reading B: remainder 1 = Vijaya]. The text names only Vijaya; the other 59 names are
 *               the standard list [standard].
 *   1.57-1.58   at the end of the Kṛta every mean planet is at Meṣa 0 (and at the Kali epoch too, since 4 divides every R).
 *   1.68-1.70   greatest latitudes "trighana-randhra-arka-rasa-arka-arka, daśa-hatāḥ", Moon onward in weekday order: Moon 270′,
 *               Mars 90′, Mercury 120′, Jupiter 60′, Venus 120′, Saturn 120′ (1.69: 270′ ÷ 9 = 30′; ×2 Jupiter, ×3 Mars,
 *               ×4 Mercury, Venus, Saturn).
 *   2.29-2.30   kendra = ucca − planet ("grahaṃ saṃśodhya mandoccāt tathā śīghrāt"); bhuja and koṭi by quadrant.
 *   2.34-2.38   epicycles at the even ends (kendra 0°, 180°) and the odd ends (90°, 270°): manda 75/72, 30/28, 33/32, 12/11,
 *               49/48; śīghra 235/232, 133/132, 70/72, 262/260, 39/40 (Mars, Mercury, Jupiter, Venus, Saturn); between the
 *               ends the epicycle moves from the even value toward the odd by the bhujajyā ÷ R (2.38).
 *   2.39        manda equation = arc(bhujajyā × epicycle ÷ 360). Its koṭiphala gives a manda karṇa, used only in 7.14.
 *   2.40-2.42   śīghra: koṭiphala = koṭijyā × epicycle ÷ 360, added to R from Makara (kendra 270°…90°), taken from R from
 *               Karka; karṇa = √((R ± koṭiphala)² + bhujaphala²); equation = arc(bhujaphala × R ÷ karṇa).
 *   2.43-2.44   for Mars and the others, four operations: half the śīghra equation on the mean planet; half the manda
 *               equation (from that place) on it; the full manda equation (from that place) on the MEAN planet; the full
 *               śīghra equation (from that place) on it. The text names no other order for Mercury and Venus: "bhaumādīnām".
 *   2.45        both equations are added when the kendra is in Meṣa…Kanyā, subtracted from Tulā on.
 *   2.46        bhujāntara: motion × the Sun's equation ÷ 21,600, applied as the Sun's — here a time-shift of every mean place
 *               by the Sun's equation (minutes ÷ 21,600 of a day); optional, off by default as in sphuta.js [reading].
 *   2.47-2.49   manda motion: the kendra's motion × tabular sine-difference ÷ 225 × epicycle ÷ 360, added from Karka,
 *               subtracted from Makara.
 *   2.50-2.51   true motion: (śīghrocca's motion − manda motion) × (karṇa − R) ÷ karṇa, added to the manda motion when the
 *               karṇa exceeds R, subtracted when less; when the subtraction exceeds the motion, the remainder is retrograde.
 *   2.53-2.55   the texts' station kendras 164, 144, 130, 83 (the word guṇa-aṣṭa), 115; retrogression ends at 360° − κ; the
 *               planet then stands in the 7th, 8th, 8th, 7th, 9th sign from its śīghrocca. These are compared, not imposed.
 *   2.56-2.57   the node of Mars, Jupiter, Saturn takes the (final) śīghra equation as the planet does; of Mercury and Venus
 *               the third (manda) equation, reversed ("vāmam"); latitude = jyā(planet − node′) — for Mercury and Venus
 *               jyā(śīghrocca − node′) — × greatest latitude ÷ the last (śīghra) karṇa.
 *   7.1-7.6     conjunction of two planets: which is past and which to come (7.2-7.3); the longitude difference over the
 *               difference of the daily motions, or over their sum when one is retrograde (7.4); added or subtracted
 *               (7.5); repeated until the minutes are equal (7.6), as 4.8 repeats the syzygy [reading: 7.6 states one step];
 *               where two slow planets near a station keep it from settling (~2% of cases), the bracket is halved instead.
 *   7.7-7.10    dṛkkarma at an hour angle: ākṣa = latitude′ × palabhā ÷ 12 × nata ÷ own half-day (7.8, read
 *               "viṣuvacchāyayābhyastād" for the damaged "…chāyayāmyastad"); northern latitude east −, west +, southern the
 *               reverse (7.9, read "kṣayaḥ" for the damaged "kṣamaḥ"); āyana = latitude′ × declination° of (λ + 90°), in
 *               seconds, + when unlike, − when alike (7.10).
 *   7.12        the two latitudes at that instant: alike, their difference; unlike, their sum — the separation.
 *   7.13-7.14   diameters on the Moon's orbit, "thirty increased by half of half": Mars 30, Saturn 37½, Mercury 45, Jupiter
 *               52½ yojanas, Venus 60; × 2R ÷ (third karṇa + fourth karṇa) = the corrected diameters, ÷ 15 = minutes. The
 *               word "svakarṇāḥ" is nominative, describing those corrected diameters, not a second division [reading].
 *   7.18-7.23   at the conjunction: discs touching — ullekha, overlapping — bheda; under a degree — yuddha (apasavya when one
 *               is faint); over a degree — samāgama when both are bright; the northern one wins, Venus mostly wins.
 * Floats on the text's table (the mean places are exact residues in BigInt, then floated); no spherical trigonometry;
 * the only root taken is 2.41's "mūlam". Every longitude is sidereal from the text's Meṣa 0°; the ayanāṃśa (3.9-3.10)
 * enters only where the text needs a declination (7.8-7.10). How close this is to the sky is for the owner's vedha.
 * withSine("madhava"): the same with Mādhava's sine (sphuta.js, on R = 3438) in place of the table; measured in
 * ss-madhava.test.js. The default is the text's table.
 * Browser: window.SSGraha (needs Sphuta, SSUdaya); node: module.exports.
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory(require("./sphuta.js"), require("./ss-udaya.js"));
  else root.SSGraha = factory(root.Sphuta, root.SSUdaya);
})(typeof globalThis !== "undefined" ? globalThis : this, function ssGraha(S, U) {
  "use strict";
  const R = S.R, SPD = S.SPD, YUGA = S.YUGA_DAYS;
  const YUGA_N = Number(YUGA);
  const SUN_REV = 4320000n, KALPA_YEARS = 4320000000n, YEARS_GONE = 1955880000n;          // 1.29; 1.40; 1.45-1.47
  const Q_NUM = 1811n, Q_DEN = 4n;                                                          // 452¾ yugas at the Kali epoch
  const NAMES = Object.freeze(["mars", "mercury", "jupiter", "venus", "saturn"]);          // "kujādi", the text's order
  const PLANETS = Object.freeze({
    //        1.30-1.32        inner: mean = Sun   1.41-1.42   1.43-1.44   2.35       2.36-2.37    1.70  2.53  2.55  7.13
    mars:    Object.freeze({ rev: 2296832n, inner: false, mandocca: 204n, node: 214n, manda: [75, 72], sighra: [235, 232], lat: 90, station: 164, house: 7, viskambha: 30 }),
    mercury: Object.freeze({ rev: 17937060n, inner: true, mandocca: 368n, node: 488n, manda: [30, 28], sighra: [133, 132], lat: 120, station: 144, house: 8, viskambha: 45 }),
    jupiter: Object.freeze({ rev: 364220n, inner: false, mandocca: 900n, node: 174n, manda: [33, 32], sighra: [70, 72], lat: 60, station: 130, house: 8, viskambha: 52.5 }),
    venus:   Object.freeze({ rev: 7022376n, inner: true, mandocca: 535n, node: 903n, manda: [12, 11], sighra: [262, 260], lat: 120, station: 83, house: 7, viskambha: 60 }),
    saturn:  Object.freeze({ rev: 146568n, inner: false, mandocca: 39n, node: 662n, manda: [49, 48], sighra: [39, 40], lat: 120, station: 115, house: 9, viskambha: 37.5 }),
  });
  const MOON_ORBIT_YOJANA_PER_ARCMIN = 15;                                                 // 7.14 "tithi"; 324,000 ÷ 21,600 (12.83)
  const ARCMIN = 21600;

  const mod = (a, m) => ((a % m) + m) % m;
  const wrap180 = (d) => mod(d + 180, 360) - 180;
  const planetOf = (name) => { const p = PLANETS[name]; if (!p) throw new RangeError(`ss-graha: unknown planet "${name}"`); return p; };
  const TWO53 = 9007199254740992n;
  const fracDeg = (num, den) => Number((num * TWO53) / den) / 9007199254740992 * 360;

  // ── mean places (1.53-1.54), exact residues ──────────────────────────────────────────────────────────────
  /** Degrees of a body with `rev` revolutions a yuga, at civil spandas Sp since the Kali epoch. */
  function yugaDeg(rev, Sp) {
    const den = Q_DEN * YUGA * SPD;
    return fracDeg(mod(rev * (Q_NUM * YUGA * SPD + Q_DEN * Sp), den), den);
  }
  /** Degrees of a body with `rev` revolutions a kalpa (1.41-1.44), counted from creation (1,955,880,000 years at Kali). */
  function kalpaDeg(rev, Sp, westward) {
    const den = KALPA_YEARS * YUGA * SPD;
    const d = fracDeg(mod(rev * (YEARS_GONE * YUGA * SPD + SUN_REV * Sp), den), den);
    return westward ? mod(360 - d, 360) : d;                                               // 1.54: "cakrād viśodhitāḥ"
  }
  /** Mean daily motions in minutes a civil day. */
  const perDay = (rev) => Number(rev) * ARCMIN / YUGA_N;
  const perDayKalpa = (rev) => Number(rev) * ARCMIN * 4320000 / 4320000000 / YUGA_N;
  function motions(name) {
    const p = planetOf(name), sun = perDay(SUN_REV), own = perDay(p.rev);
    return {
      mean: p.inner ? sun : own,                     // the mean planet (1.29: Mercury's and Venus's is the Sun's)
      sighrocca: p.inner ? own : sun,                // its śīghrocca
      mandocca: perDayKalpa(p.mandocca),
      node: -perDayKalpa(p.node),
    };
  }

  /** Mean places in degrees at `days` (civil days since midnight at Laṅkā at the Kali epoch; a number or BigInt). */
  function meanPlaces(days) {
    const Sp = S.spandasOfDays(days), sun = yugaDeg(SUN_REV, Sp), out = { sun };
    for (const n of NAMES) {
      const p = PLANETS[n], own = yugaDeg(p.rev, Sp);
      out[n] = { mean: p.inner ? sun : own, sighrocca: p.inner ? own : sun, mandocca: kalpaDeg(p.mandocca, Sp, false), node: kalpaDeg(p.node, Sp, true) };
    }
    return out;
  }

  // ── the two equations, by the table ──────────────────────────────────────────────────────────────────────
  /** 2.38: the epicycle at a kendra, from its even-end and odd-end values. */
  const paridhiAt = (kendra, pair) => pair[0] - (pair[0] - pair[1]) * Math.abs(S.jya(kendra)) / R;
  /** Signed koṭijyā of a kendra (2.30), + from Makara (270°…90°), − from Karka (2.40). */
  const kotiJya = (kendra) => S.jya(mod(kendra, 360) + 90);
  /** 2.39 (+ 2.45): the manda equation in degrees for a kendra (ucca − planet), with its karṇa (used by 7.14 only). */
  function manda(kendra, pair) {
    const k = mod(kendra, 360), bj = Math.abs(S.jya(k)), p = paridhiAt(k, pair);
    const bhujaphala = bj * p / 360, kotiphala = kotiJya(k) * p / 360;
    const arc = S.arcminOfJya(Math.min(R, bhujaphala));
    return { kendra: k, paridhi: p, bhujaphala, kotiphala, karna: Math.sqrt((R + kotiphala) ** 2 + bhujaphala ** 2), degrees: (k < 180 ? 1 : -1) * arc / 60 };
  }
  /** 2.38-2.42 (+ 2.45): the śīghra equation in degrees for a kendra (śīghrocca − planet), with its karṇa. */
  function sighra(kendra, pair) {
    const k = mod(kendra, 360), bj = Math.abs(S.jya(k)), p = paridhiAt(k, pair);
    const bhujaphala = bj * p / 360, kotiphala = kotiJya(k) * p / 360;                       // 2.39, 2.40
    const karna = Math.sqrt((R + kotiphala) ** 2 + bhujaphala ** 2);                          // 2.41
    const arc = S.arcminOfJya(Math.min(R, bhujaphala * R / karna));                           // 2.41-2.42
    return { kendra: k, paridhi: p, bhujaphala, kotiphala, karna, degrees: (k < 180 ? 1 : -1) * arc / 60 };
  }

  /** 2.43-2.44, 2.56-2.57: the four operations for one planet from its mean places m (one entry of meanPlaces). */
  function fourSteps(name, m) {
    const p = planetOf(name);
    const s1 = sighra(m.sighrocca - m.mean, p.sighra);                     // 1: śīghra, from the mean planet
    const p1 = mod(m.mean + s1.degrees / 2, 360);                          //    half of it, on the mean
    const m2 = manda(m.mandocca - p1, p.manda);                            // 2: manda, from that place
    const p2 = mod(p1 + m2.degrees / 2, 360);                              //    half of it, on that place
    const m3 = manda(m.mandocca - p2, p.manda);                            // 3: manda, from that place
    const p3 = mod(m.mean + m3.degrees, 360);                              //    the whole, on the MEAN planet
    const s4 = sighra(m.sighrocca - p3, p.sighra);                         // 4: śīghra, from the manda-true place
    const longitude = mod(p3 + s4.degrees, 360);                           //    the whole, on it
    // 2.56: the node's correction; 2.57: the argument and the latitude, ÷ the last karṇa
    const nodeCorr = p.inner ? -m3.degrees : s4.degrees;
    const node = mod(m.node + nodeCorr, 360);
    const argument = mod((p.inner ? m.sighrocca : longitude) - node, 360);
    const latitude = S.jya(argument) * p.lat / s4.karna;                   // minutes, north +
    return { longitude, latitude, mandaTrue: p3, steps: [p1, p2, p3, longitude], equations: { sighra1: s1, manda2: m2, manda3: m3, sighra4: s4 },
      sighraKendra: s4.kendra, karna: s4.karna, node, latitudeArgument: argument };
  }

  /** The Sun's equation (degrees) at `days`, for 2.46. */
  const sunEquation = (days) => S.sphutaAtDays(days).equations.sun.degrees;
  /** 2.46: the instant the planet's places are taken at — `days`, or shifted by the Sun's equation (bhujāntara). */
  const instantOf = (days, opts) => (opts && opts.bhujantara ? Number(days) + sunEquation(days) * 60 / ARCMIN : days);

  /** The true place of one planet: longitude (deg, sidereal), latitude (arcmin, north +), and every step. */
  function truePlace(days, name, opts) {
    const t = instantOf(days, opts);
    return Object.assign({ name, days: Number(days) }, fourSteps(name, meanPlaces(t)[name]));
  }
  /** True places of all five at `days`: { mars: {longitude, latitude, …}, … }. */
  function truePlaces(days, opts) {
    const t = instantOf(days, opts), m = meanPlaces(t), out = {};
    for (const n of NAMES) out[n] = Object.assign({ name: n, days: Number(days) }, fourSteps(n, m[n]));
    return out;
  }

  // ── true daily motion (2.47-2.51) ────────────────────────────────────────────────────────────────────────
  /** 2.48: the tabular sine-difference of the 225′ step holding the bhuja of a kendra (with Mādhava's sine, 225 × its
   *  derivative there). */
  function dorjyantara(kendra) {
    return S.sineSlope(S.bhuja(kendra).bhuja * 60) * 225;
  }
  /** 2.47-2.49: the manda-corrected motion from a mean motion `n` (minutes a day), the kendra's motion `nk`, a kendra
   *  and its epicycle: n ± |nk| × difference ÷ 225 × epicycle ÷ 360, + from Karka, − from Makara. */
  function mandaMotion(n, nk, kendra, paridhi) {
    const corr = Math.abs(nk) * dorjyantara(kendra) / 225 * paridhi / 360;
    const k = mod(kendra, 360);
    return n + (k >= 90 && k < 270 ? corr : -corr);
  }
  /** 2.47-2.51: true daily motion of a planet at `days`, minutes a day; negative = retrograde (vakra). */
  function trueMotion(days, name, opts) {
    const st = truePlace(days, name, opts), mo = motions(name), m3 = st.equations.manda3;
    const vm = mandaMotion(mo.mean, mo.mean - mo.mandocca, m3.kendra, m3.paridhi);         // 2.47-2.49 [reading: kendra's motion]
    const K = st.karna;
    const corr = (mo.sighrocca - vm) * Math.abs(K - R) / K;                                 // 2.50-2.51
    const v = K > R ? vm + corr : vm - corr;
    return { motion: v, retrograde: v < 0, manda: vm, mean: mo.mean, sighrocca: mo.sighrocca, karna: K, sighraKendra: st.sighraKendra, place: st };
  }
  /** The motion of the four-step place itself (central difference over ±h days), minutes a day [measured]. */
  function placeMotion(days, name, h) {
    const d = h || 1 / 64;
    return wrap180(truePlace(Number(days) + d, name).longitude - truePlace(Number(days) - d, name).longitude) * 60 / (2 * d);
  }

  // ── stations and retrogression (2.51-2.55) ───────────────────────────────────────────────────────────────
  /** Sign of the speed at t, by the text's rule (default) or by the place's own motion ({ by: "place" }). */
  const speedOf = (t, name, by) => (by === "place" ? placeMotion(t, name) : trueMotion(t, name).motion);
  /** 2.55: the sign counted from the śīghrocca in which a planet of śīghra-kendra κ stands: (360° − κ) ÷ 30, + 1. */
  const houseFromSighrocca = (kappa) => Math.floor(mod(360 - kappa, 360) / 30) + 1;
  /** Stations between t1 and t2 (days): { t, kind: "vakra" (turns retrograde) | "margi" (turns direct), kendra (2.53's
   *  "caturtheṣu kendrāṃśaiḥ": the fourth operation's śīghra kendra), house (2.55), longitude }. `by`: "place" (the
   *  four-step place's own motion, default: its turning points fall in 2.55's signs for all five) or "text" (the motion
   *  rule of 2.47-2.51, whose zero comes several degrees earlier and which does not sum to the mean motion). The table's piecewise-linear sine puts
   *  small jumps in either motion, so near a station it can cross zero three times within a day or two: crossings closer
   *  than `merge` days (default 5) are dropped in pairs, keeping the last; `merged` counts the pairs dropped. */
  function stations(name, t1, t2, opts) {
    const by = (opts && opts.by) || "place", step = (opts && opts.step) || 1, merge = opts && opts.merge !== undefined ? opts.merge : 5;
    let raw = [];
    let a = t1, va = speedOf(a, name, by);
    for (let b = t1 + step; b <= t2 + 1e-9; b += step) {
      const vb = speedOf(b, name, by);
      if ((va > 0) !== (vb > 0)) {
        let lo = a, hi = b, vlo = va;
        for (let i = 0; i < 60 && hi - lo > 1e-7; i++) { const mid = (lo + hi) / 2, vm = speedOf(mid, name, by); if ((vm > 0) === (vlo > 0)) { lo = mid; vlo = vm; } else hi = mid; }
        raw.push({ t: (lo + hi) / 2, kind: va > 0 ? "vakra" : "margi" });
      }
      a = b; va = vb;
    }
    let merged = 0;
    for (let i = 0; i + 1 < raw.length;) {
      if (raw[i + 1].t - raw[i].t < merge) { raw.splice(i, 2); merged++; if (i > 0) i--; } else i++;
    }
    const out = raw.map(({ t, kind }) => {
      const st = truePlace(t, name);
      return { t, kind, kendra: st.sighraKendra, house: houseFromSighrocca(st.sighraKendra), fromSighrocca: mod(st.longitude - meanPlaces(t)[name].sighrocca, 360), longitude: st.longitude };
    });
    Object.defineProperty(out, "merged", { value: merged });
    return out;
  }
  /** Retrograde spans between t1 and t2: from each "vakra" station to the next "margi" — start, end, days, the
   *  kendra at each end (2.53-2.54), the arc of longitude gone backwards, the houses (2.55). Spans cut by t1 or t2 are
   *  marked open. */
  function retrogradeSpans(name, t1, t2, opts) {
    const st = stations(name, t1, t2, opts), out = [];
    const startsRetro = st.length ? st[0].kind === "margi" : speedOf(t1, name, (opts && opts.by) || "place") < 0;
    let open = startsRetro ? { t: t1, kendra: truePlace(t1, name).sighraKendra, longitude: truePlace(t1, name).longitude, open: true } : null;
    for (const s of st) {
      if (s.kind === "vakra") open = s;
      else if (open) {
        out.push({ start: open.t, end: s.t, days: s.t - open.t, kendraStart: open.kendra, kendraEnd: s.kendra, arc: wrap180(open.longitude - s.longitude),
          lonStart: open.longitude, lonEnd: s.longitude, houseStart: houseFromSighrocca(open.kendra), openStart: !!open.open, openEnd: false });
        open = null;
      }
    }
    if (open) {
      const e = truePlace(t2, name);
      out.push({ start: open.t, end: t2, days: t2 - open.t, kendraStart: open.kendra, kendraEnd: e.sighraKendra, arc: wrap180(open.longitude - e.longitude),
        lonStart: open.longitude, lonEnd: e.longitude, houseStart: houseFromSighrocca(open.kendra), openStart: !!open.open, openEnd: true });
    }
    return out;
  }
  /** Synodic period in days from the revolution numbers alone: a yuga ÷ |śīghrocca revolutions − planet's|. */
  const synodicDays = (name) => { const p = planetOf(name); return YUGA_N / Math.abs(Number(p.inner ? p.rev - SUN_REV : SUN_REV - p.rev)); };

  // ── the Moon, for 7.23 (sphuta.js's place; its motion by 2.47-2.49) ──────────────────────────────────────────
  function moonState(days) {
    const s = S.sphutaAtDays(days), eq = s.equations.moon;
    const n = perDay(S.REV.moon), na = perDay(S.REV.moonApogee);
    return { longitude: s.moon, latitude: s.moonLatitude * 60, motion: mandaMotion(n, n - na, eq.kendra, eq.paridhi) };
  }
  /** Longitude (deg), latitude (arcmin) and true motion (arcmin/day) of a body: a planet or "moon". */
  function bodyState(days, name) {
    if (name === "moon") return moonState(days);
    const m = trueMotion(days, name);
    return { longitude: m.place.longitude, latitude: m.place.latitude, motion: m.motion, place: m.place };
  }

  // ── conjunction (7.2-7.6, 7.12) ──────────────────────────────────────────────────────────────────────────
  /** 7.2-7.5 literally: two longitudes (deg) and daily motions (arcmin/day, negative = retrograde). Returns the days to
   *  the conjunction (negative when it is past), whether it is past, and the divisor used ("difference" | "sum"). */
  function yutiInterval(lamA, vA, lamB, vB) {
    const d = wrap180(lamA - lamB) * 60;                                    // grahāntara-kalāḥ, A ahead when > 0
    const retroA = vA < 0, retroB = vB < 0;
    let past, divisor, rate;
    if (retroA === retroB) {                                               // 7.2 (both direct) and its reverse (both retrograde)
      const fasterAhead = (Math.abs(vA) > Math.abs(vB)) === (d > 0);
      past = retroA ? !fasterAhead : fasterAhead;
      divisor = "difference"; rate = Math.abs(Math.abs(vA) - Math.abs(vB));    // 7.4 bhuktyantara
    } else {                                                               // 7.3: one direct, one retrograde
      const directAhead = retroB ? d > 0 : d < 0;
      past = directAhead;
      divisor = "sum"; rate = Math.abs(vA) + Math.abs(vB);                 // 7.4 bhuktiyoga
    }
    if (rate === 0) return null;
    const days = Math.abs(d) / rate * (past ? -1 : 1);                     // 7.5-7.6: subtract when past, add when to come
    return { days, past, divisor, lamA: mod(lamA + vA * days / 60, 360), lamB: mod(lamB + vB * days / 60, 360) };
  }
  /** The conjunction in longitude of bodies a and b near `t0`: 7.2-7.6 repeated until the step is under 1e-7 day. With a
   *  bracket [lo, hi] holding one change of sign of the longitude difference, a run of 7.4 that fails to settle inside it
   *  (two slow planets near a station, whose motions nearly match) is replaced by halving the bracket: `method` says which. */
  function yutiNear(a, b, t0, bracket) {
    const record = (t, steps, method) => {
      const A = bodyState(t, a), B = bodyState(t, b);
      return { t, a, b, longitude: A.longitude, latitudeA: A.latitude, latitudeB: B.latitude, separation: A.latitude - B.latitude,
        motionA: A.motion, motionB: B.motion, steps, method, stateA: A, stateB: B };
    };
    let t = t0, steps = 0, ok = true;
    for (; steps < 60; steps++) {
      const A = bodyState(t, a), B = bodyState(t, b);
      const r = yutiInterval(A.longitude, A.motion, B.longitude, B.motion);
      if (!r || Math.abs(r.days) > 40) { ok = false; break; }
      t += r.days;
      if (Math.abs(r.days) < 1e-7) break;
    }
    const inside = !bracket || (t >= bracket[0] - 1e-6 && t <= bracket[1] + 1e-6);
    if (ok && inside && Math.abs(wrap180(bodyState(t, a).longitude - bodyState(t, b).longitude)) < 1e-4) return record(t, steps, "7.4");
    if (!bracket) return null;
    const diff = (x) => wrap180((a === "moon" ? S.sphutaAtDays(x).moon : truePlace(x, a).longitude) - (b === "moon" ? S.sphutaAtDays(x).moon : truePlace(x, b).longitude));
    let [lo, hi] = bracket; const sLo = diff(lo) > 0;
    for (let i = 0; i < 60 && hi - lo > 1e-8; i++) { const mid = (lo + hi) / 2; if ((diff(mid) > 0) === sLo) lo = mid; else hi = mid; }
    return record((lo + hi) / 2, steps, "bisection");
  }
  /** Every conjunction in longitude between t1 and t2 among `bodies` (default the five; add "moon" for 7.23). */
  function conjunctions(t1, t2, opts) {
    const bodies = (opts && opts.bodies) || NAMES, step = (opts && opts.step) || (bodies.includes("moon") ? 0.25 : 1), out = [];
    const lon = (t) => Object.fromEntries(bodies.map((n) => [n, n === "moon" ? S.sphutaAtDays(t).moon : truePlace(t, n).longitude]));
    let la = lon(t1);
    for (let t = t1; t < t2; t += step) {
      const tb = Math.min(t + step, t2), lb = lon(tb);
      for (let i = 0; i < bodies.length; i++) for (let j = i + 1; j < bodies.length; j++) {
        const x = bodies[i], y = bodies[j], da = wrap180(la[x] - la[y]), db = wrap180(lb[x] - lb[y]);
        if (Math.abs(da) < 60 && Math.abs(db) < 60 && (da > 0) !== (db > 0)) {
          const c = yutiNear(x, y, t + (tb - t) * Math.abs(da) / (Math.abs(da) + Math.abs(db)), [t, tb]);
          if (c) out.push(Object.assign(c, { name: x === "moon" || y === "moon" ? "samāgama" : "yuddha-samāgama" }));
        }
      }
      la = lb;
    }
    return out.sort((p, q) => p.t - q.t);
  }

  // ── chapter 7: discs and the kinds of meeting ────────────────────────────────────────────────────────────
  /** 7.13-7.14: the apparent diameter in minutes: viṣkambha × 2R ÷ (manda karṇa + śīghra karṇa) ÷ 15. */
  function diameter(name, place) {
    const p = planetOf(name), K3 = place.equations.manda3.karna, K4 = place.equations.sighra4.karna;
    const sphuta = p.viskambha * 2 * R / (K3 + K4);                        // yojanas on the Moon's orbit, corrected
    return { yojana: sphuta, arcmin: sphuta / MOON_ORBIT_YOJANA_PER_ARCMIN, mean: p.viskambha / MOON_ORBIT_YOJANA_PER_ARCMIN };
  }
  /** 7.18-7.23: what the text calls a conjunction of two star-planets, from its separation (7.12) and discs (7.14). */
  function yuddha(c) {
    if (c.a === "moon" || c.b === "moon") return { kind: "samāgama", reason: "7.1, 7.23: with the Moon" };
    const dA = diameter(c.a, c.stateA.place).arcmin, dB = diameter(c.b, c.stateB.place).arcmin;
    const sep = Math.abs(c.separation), rSum = (dA + dB) / 2, rDiff = Math.abs(dA - dB) / 2;
    let kind;
    if (sep <= rDiff) kind = "bheda";                                       // 7.18: one disc passes over the other [reading]
    else if (sep < rSum) kind = "ullekha";                                  // 7.18: the discs touch [reading]
    else if (sep < 60) kind = "yuddha";                                     // 7.19: under a degree (apasavya when one is faint)
    else kind = "samāgama";                                                 // 7.20: over a degree, both bright
    const north = c.separation > 0 ? c.a : c.separation < 0 ? c.b : null;   // 7.21
    return { kind, separationArcmin: sep, diameters: { [c.a]: dA, [c.b]: dB }, north, victor: kind === "samāgama" ? null : (c.a === "venus" || c.b === "venus" ? "venus" : north),
      note: "7.21: the northern, bright, large one wins; 7.23: Venus mostly wins; brightness is not computed" };
  }

  // ── dṛkkarma at an hour angle (7.7-7.10) ─────────────────────────────────────────────────────────────────
  /** Cara (asus) of a declination given by its signed R-sine, at a palabhā (2.61-2.62). */
  function caraOfKrantiJya(kj, palabha) {
    const cj = (kj * palabha / 12) * R / U.dyujya(kj);
    return Math.sign(cj) * S.arcminOfJya(Math.min(R, Math.abs(cj)));
  }
  /** 7.8-7.10: the dṛkkarma of a body at sidereal λ (deg) with latitude (arcmin, north +), at a place of palabhā,
   *  at hour angle `hourAngleAsus` (west +), with the ayanāṃśa (deg) for the declinations. The half-day is the body's
   *  own, from its true declination (2.58: latitude added when alike). Returns the corrected sidereal λ and the parts. */
  function drkkarma(lamSid, latArcmin, palabha, hourAngleAsus, ayanamsha) {
    const trop = mod(lamSid + ayanamsha, 360);
    const dec = U.kranti(trop) * 60 + latArcmin;                            // 2.58, minutes
    const kj = Math.sign(dec) * S.jyaOfArcmin(Math.min(5400, Math.abs(dec)));
    const halfDay = 5400 + caraOfKrantiJya(kj, palabha);                    // asus
    const nata = Math.abs(mod(hourAngleAsus + 10800, 21600) - 10800);
    const west = mod(hourAngleAsus, 21600) < 10800;
    const aksa = (west ? 1 : -1) * latArcmin * palabha / 12 * nata / halfDay;   // 7.8-7.9
    const ayana = -latArcmin * U.kranti(trop + 90) / 60;                    // 7.10
    return { lambda: mod(lamSid + (aksa + ayana) / 60, 360), aksaArcmin: aksa, ayanaArcmin: ayana, nataAsus: nata, halfDayAsus: halfDay, west };
  }
  /** The meridian's Laṅkā-ascension (asus) at `days` for a place `desantaraDays` east of the prime meridian: the true
   *  Sun's ascension + its hour angle, taking the day count as reckoned from midnight and the true Sun lagging the mean
   *  by its equation [reading; no obliquity term, as in the text]. */
  function meridianAsus(days, desantaraDays) {
    const s = S.sphutaAtDays(days), A = S.ayanamshaSS(S.spandasOfDays(days));
    const local = Number(days) + (desantaraDays || 0);
    const sunHA = (mod(local, 1) - 0.5) * 21600 - s.equations.sun.degrees * 60;
    return mod(U.ascension(mod(s.sun + A, 360), U.risings(0)) + sunHA, 21600);
  }
  /** 7.7-7.12: the conjunction c (from conjunctions/yutiNear) as seen at a place { palabha, desantaraDays }: each body's
   *  dṛkkarma at its own hour angle, one 7.4 step to equal corrected longitudes, and the latitudes at that instant. */
  function yutiDrk(c, site) {
    const A = S.ayanamshaSS(S.spandasOfDays(c.t)), mer = meridianAsus(c.t, site.desantaraDays);
    const ha = (lam) => mod(mer - U.ascension(mod(lam + A, 360), U.risings(0)) + 10800, 21600) - 10800;
    const dA = drkkarma(c.stateA.longitude, c.stateA.latitude, site.palabha, ha(c.stateA.longitude), A);
    const dB = drkkarma(c.stateB.longitude, c.stateB.latitude, site.palabha, ha(c.stateB.longitude), A);
    const r = yutiInterval(dA.lambda, c.motionA, dB.lambda, c.motionB);
    const t = c.t + (r ? r.days : 0), sa = bodyState(t, c.a), sb = bodyState(t, c.b);
    return { t, drkA: dA, drkB: dB, latitudeA: sa.latitude, latitudeB: sb.latitude, separation: sa.latitude - sb.latitude, shiftDays: r ? r.days : 0 };
  }

  // ── 1.55: the sixty-year cycle from mean Jupiter ─────────────────────────────────────────────────────────
  /** The sixty names, Prabhava first: the standard list [standard]; the text (1.55) names only Vijaya, as the first of
   *  its count. The same list, in Devanāgarī, as math-core.js SAMVATSARA_NAMES. */
  const SAMVATSARA = Object.freeze(["Prabhava", "Vibhava", "Śukla", "Pramoda", "Prajāpati", "Aṅgirā", "Śrīmukha", "Bhāva", "Yuvā",
    "Dhātā", "Īśvara", "Bahudhānya", "Pramāthī", "Vikrama", "Vṛṣaprajā", "Citrabhānu", "Subhānu", "Tāraṇa", "Pārthiva", "Vyaya",
    "Sarvajit", "Sarvadhārī", "Virodhī", "Vikṛti", "Khara", "Nandana", "Vijaya", "Jaya", "Manmatha", "Durmukha", "Hemalamba",
    "Vilambī", "Vikārī", "Śārvarī", "Plava", "Śubhakṛt", "Śobhakṛt", "Krodhī", "Viśvāvasu", "Parābhava", "Plavaṅga", "Kīlaka",
    "Saumya", "Sādhāraṇa", "Virodhakṛt", "Paridhāvī", "Pramādī", "Ānanda", "Rākṣasa", "Nala", "Piṅgala", "Kālayukta",
    "Siddhārthī", "Raudra", "Durmati", "Dundubhī", "Rudhirodgārī", "Raktākṣa", "Krodhana", "Kṣaya"]);
  const VIJAYA = 26;                                                                        // Vijaya's place in that list
  const JUP_REV = PLANETS.jupiter.rev;                                                     // 364,220 a yuga (1.31)
  const floorDiv = (a, b) => { const q = a / b; return a % b !== 0n && (a < 0n) !== (b < 0n) ? q - 1n : q; };
  /** Mean Jupiter's revolutions since creation at civil spandas Sp since the Kali epoch, as the exact fraction num/den:
   *  364,220 × (1,955,880,000 years + Sp of civil time) ÷ (4,320,000 years of a yuga) (1.45-1.47, 1.53). */
  const jupiterRevolutions = (Sp) => ({ num: JUP_REV * (YEARS_GONE * YUGA * SPD + SUN_REV * Sp), den: SUN_REV * YUGA * SPD });
  /** SS 1.55: "dvādaśaghnā guroryātā bhagaṇā vartamānakaiḥ rāśibhiḥ sahitāḥ śuddhāḥ ṣaṣṭyā syurvijayādayaḥ" — Jupiter's
   *  revolutions gone × 12, with the signs, cleared of sixties: the years from Vijaya. Exact (BigInt) from mean Jupiter
   *  since creation (1.45-1.47). Reading "A" (default, opts.zero 0) [reading]: the signs gone in the current revolution
   *  are added, and remainder 0 is Vijaya, the current year of a cycle that begins at creation; reading "B" (opts.zero 1)
   *  counts the current sign as one, so remainder 1 is Vijaya. `days`: civil days since the Kali epoch at Laṅkā midnight. */
  function samvatsara(days, opts = {}) {
    const zero = opts.zero === undefined ? 0 : opts.zero;
    if (zero !== 0 && zero !== 1) throw new RangeError("ss-graha: samvatsara opts.zero is 0 (reading A) or 1 (reading B)");
    if (typeof days !== "bigint" && !(typeof days === "number" && Number.isFinite(days))) throw new TypeError("ss-graha: samvatsara needs a finite day count");
    const { num, den } = jupiterRevolutions(S.spandasOfDays(days));
    const revolutionsGone = floorDiv(num, den);
    const signsGone = Number((num - revolutionsGone * den) * 12n / den);
    const remainder = Number(((12n * revolutionsGone + BigInt(signsGone)) % 60n + 60n) % 60n);
    const vijayaIndex = zero === 0 ? remainder : (remainder + 59) % 60;
    const prabhavaIndex = (vijayaIndex + VIJAYA) % 60;
    return { revolutionsGone, signsGone, remainder, vijayaIndex, prabhavaIndex, name: SAMVATSARA[prabhavaIndex], reading: zero === 0 ? "A" : "B",
      source: "SS 1.55", rule: "(12 × mean Jupiter's revolutions gone since creation + its signs gone) mod 60, counted from Vijaya; " +
        (zero === 0 ? "remainder 0 = Vijaya [reading A]" : "remainder 1 = Vijaya [reading B]") + "; names after Vijaya: the standard list [standard]" };
  }
  /** The next instant after `days` at which mean Jupiter enters a sign — where the 1.55 name changes — in civil days since
   *  the Kali epoch; closed form, the changes falling 1,577,917,828 ÷ (364,220 × 12) = 361.0267 days apart [theorem]. */
  function samvatsaraChangeAfter(days) {
    if (typeof days !== "bigint" && !(typeof days === "number" && Number.isFinite(days))) throw new TypeError("ss-graha: samvatsaraChangeAfter needs a finite day count");
    const { num, den } = jupiterRevolutions(S.spandasOfDays(days));
    const m = floorDiv(12n * num, den) + 1n;                                               // the next whole sign since creation
    // 12 × 364,220 × (YEARS_GONE × YUGA + 4,320,000 × d) = m × 4,320,000 × YUGA  →  d = YUGA (m × 4,320,000 − 12 × 364,220 × YEARS_GONE) ÷ (12 × 364,220 × 4,320,000)
    const dn = YUGA * (m * SUN_REV - 12n * JUP_REV * YEARS_GONE), dd = 12n * JUP_REV * SUN_REV;
    const whole = floorDiv(dn, dd);
    return Number(whole) + Number((dn - whole * dd) * TWO53 / dd) / 9007199254740992;
  }

  return Object.freeze({ R, NAMES, PLANETS, YEARS_GONE, KALPA_YEARS, MOON_ORBIT_YOJANA_PER_ARCMIN, SAMVATSARA,
    yugaDeg, kalpaDeg, meanPlaces, motions, synodicDays, paridhiAt, manda, sighra, fourSteps, truePlace, truePlaces, sunEquation,
    dorjyantara, mandaMotion, trueMotion, placeMotion, houseFromSighrocca, stations, retrogradeSpans,
    moonState, bodyState, yutiInterval, yutiNear, conjunctions, diameter, yuddha, drkkarma, meridianAsus, yutiDrk, samvatsara, samvatsaraChangeAfter,
    sine: S.sine || "table", withSine: (name) => ssGraha(S.withSine(name), U.withSine(name)) });
});
