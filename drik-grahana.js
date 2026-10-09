/* drik-grahana.js — ग्रहण in the "Modern Bhāratīya (dṛk)" tier · 2026-10-08 (owner decision DK-3: build ours now)
 *
 * Lunar and solar eclipses searched on the tier's own Sun and Moon: the owner's series (siddhanta-drik.js) reached only
 * through siddhanta-tier.js (its eclipse kernel: guarded raw vectors, the same light-time/aberration reduction as
 * SiddhantaTier.sun()/sunMoon(), and the embedded IAU 2006/2000B Earth orientation). No VSOP87, ELP, JPL file or
 * Astronomy Engine code runs here; Astronomy Engine's eclipse search is this module's referee in drik-bharatiya.test.js.
 *
 * GEOMETRY AND CONSTANTS (each a convention; the tag says where it comes from):
 *   Positions: apparent geocentric Sun (light-time + annual aberration) and Moon (its own light-time), true equator and
 *     equinox of date. The shadow axis is the ray from the Sun through the Earth (lunar) or the Moon (solar) as seen in
 *     the geocentric frame, i.e. through the apparent places — the Besselian-element convention of the Explanatory
 *     Supplement (1961, 1992) [standard; citations in this header are recalled, not checked against the texts —
 *     no copy is in this repository; the numbers are tested against Astronomy Engine in drik-bharatiya.test.js].
 *   AU = 149,597,870.7 km (IAU 2012 B2) [standard]; Earth: a = 6378.1366 km, 1/f = 298.25642 (IERS Conventions 2010,
 *     Table 1.1) [standard]; k = R_Moon / a = 0.2725076 (IAU 1982; the Moon's mean limb: lunar eclipses, the solar
 *     penumbral contacts and magnitudes) and 0.272281 for the solar umbral/antumbral contacts and the total/annular
 *     decision (the smaller value the NASA canons use for the umbra) [standard, recalled — not checked against a text here];
 *     the Sun's semi-diameter 959.63″ at 1 AU (Auwers; the Astronomical Almanac's value) [standard].
 *   Lunar: Danjon's rule — the Earth's radius enlarged by 1/85 for the atmosphere and reduced by 1/594 for its
 *     oblateness, so the shadow radii are ρ_u = (1 + 1/85 − 1/594)·π_M + π_S − s_S and ρ_p = (1 + 1/85 − 1/594)·π_M +
 *     π_S + s_S (the Five Millennium Canon rounds the factor to 1.01) [standard, recalled: Danjon 1951; Espenak & Meeus 2009].
 *     Magnitudes: umbral (ρ_u + s_M − γ)/(2 s_M), penumbral (ρ_p + s_M − γ)/(2 s_M), γ = the Moon's angular distance
 *     from the shadow axis (Meeus, Astronomical Algorithms ch. 54; the Canon's definitions) [standard, recalled]. Contacts:
 *     P1/P4 γ = ρ_p + s_M; U1/U4 γ = ρ_u + s_M; U2/U3 γ = ρ_u − s_M. Greatest eclipse: least γ.
 *   Solar, global: the shadow cones tangent to the Sun and the Moon (ES §8.3, Besselian elements): f1, f2 with
 *     sin f1 = (R_S + R_M)/|S − M|, sin f2 = (R_S − R_M′)/|S − M|; on the plane through the Earth's centre normal to the
 *     axis l1 = z tan f1 + R_M sec f1, l2 = z tan f2 − R_M′ sec f2 (z = the Moon's height above that plane).
 *     Greatest eclipse: the instant the axis passes closest to the Earth's centre (gamma, signed + when north) [standard].
 *     The Earth's flattening enters by scaling the polar coordinate by 1/(1 − f) (a sphere of radius a) — exact for
 *     the axis (central or not, the central-line ends), approximate for the cones (P1/P4, non-central umbra) [method].
 *     Type: central when the axis meets the ellipsoid at greatest eclipse; total there if the Moon's apparent radius
 *     (k = 0.272281) exceeds the Sun's at that point, else annular; 'hybrid' when total there but annular where the axis
 *     enters or leaves the Earth; non-central total/annular when only the umbra/antumbra touches; otherwise partial.
 *   Solar, local: topocentric discs (observer on the IERS ellipsoid, GAST from the embedded EO, UT1 = UTC):
 *     C1/C4 when the separation σ = s_S + s_M; C2/C3 when σ = |s_S − s_M′|; maximum at least σ. Magnitude = the
 *     fraction of the Sun's diameter covered, (s_S + s_M − σ)/(2 s_S), or s_M/s_S in the central phase; obscuration =
 *     the fraction of the Sun's disc area covered [standard definitions].
 *   Times: the search runs in TT (the series' argument); UT = TT − ΔT (SiddhantaTier.deltaTSeconds; a prediction after
 *     2027). Between seven exact series evaluations per eclipse the Sun and Moon are interpolated (Chebyshev, ±0.35 d;
 *     measured ≤ 4e-5″ against direct evaluation), and every value is then reduced exactly as SiddhantaTier.sunMoon().
 * SPAN: 1850.0–2150.0 TT (the series' rule). A request whose search window (its ends ± 0.6 d) leaves the span is
 *   refused with null (EDGE RULE: never filled from elsewhere).
 * Browser: window.DrikGrahana (load after siddhanta-drik.js, math-core.js and siddhanta-tier.js); node: module.exports.
 */
(function (root) {
  "use strict";
  const J2000 = 2451545.0, DEG = Math.PI / 180, ARCSEC = DEG / 3600;
  const AU_KM = 149597870.7;
  const EARTH_A_KM = 6378.1366, EARTH_F = 1 / 298.25642, EARTH_E2 = EARTH_F * (2 - EARTH_F), ONE_MINUS_F = 1 - EARTH_F;
  const EARTH_B_KM = EARTH_A_KM * ONE_MINUS_F;
  const K_MEAN = 0.2725076, K_UMBRA = 0.272281;
  const SUN_SD_1AU_ARCSEC = 959.63, SUN_R_KM = AU_KM * Math.sin(SUN_SD_1AU_ARCSEC * ARCSEC);
  const DANJON = 1 + 1 / 85 - 1 / 594;
  const MOON_R_KM = K_MEAN * EARTH_A_KM, MOON_R_UMBRA_KM = K_UMBRA * EARTH_A_KM;
  const NODES = 7, HALF_WINDOW = 0.35, SEARCH_HALF = 0.3, EDGE_MARGIN = 0.6, PRUNE_LAT_DEG = 1.8;
  /** The shadow conventions (all km). The tier's are the defaults; opts.conventions may replace any of them, which only
   *  the referee tests do (to separate a convention difference from an ephemeris difference). Lunar shadow radii:
   *  ρ = lunarParallaxFactor·π_M + lunarSunParallaxFactor·π_S ∓ s_S, π from the equatorial radius a. */
  const OWN_CONVENTIONS = Object.freeze({ name: "own: Danjon; k = 0.2725076 / 0.272281; Sun 959.63″ at 1 AU",
    sunRadiusKm: SUN_R_KM, moonRadiusKm: MOON_R_KM, moonUmbraRadiusKm: MOON_R_UMBRA_KM,
    lunarParallaxFactor: DANJON, lunarSunParallaxFactor: 1,
    penumbraEarthSphereKm: null });   // null: the IERS ellipsoid; a number: a sphere of that radius for the global penumbra test
  const SUN_HORIZON_DEG = -50 / 60, MOON_HORIZON_DEG = 7 / 60;

  function getST() {
    if (root.SiddhantaTier) return root.SiddhantaTier;
    if (typeof require === "function") { try { return require("./siddhanta-tier.js"); } catch (e) { /* not present */ } }
    return null;
  }
  const OUT = Object.freeze({ outOfSpan: true });
  const n360 = (x) => ((x % 360) + 360) % 360;
  const wrap180 = (x) => { const y = n360(x); return y > 180 ? y - 360 : y; };
  const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]], add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
  const scl = (a, s) => [a[0] * s, a[1] * s, a[2] * s], dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const nrm = (a) => Math.hypot(a[0], a[1], a[2]), unit = (a) => scl(a, 1 / nrm(a));
  const angle = (a, b) => Math.atan2(nrm(cross(a, b)), dot(a, b));
  const dilate = (v) => [v[0], v[1], v[2] / ONE_MINUS_F], undilate = (v) => [v[0], v[1], v[2] * ONE_MINUS_F];

  /** Fraction of disc 1 (radius r1) covered by disc 2 (radius r2) at centre distance d (planar; small angles). */
  function overlapFraction(r1, r2, d) {
    if (d >= r1 + r2) return 0;
    if (d <= Math.abs(r1 - r2)) return r2 >= r1 ? 1 : (r2 * r2) / (r1 * r1);
    const c1 = Math.max(-1, Math.min(1, (d * d + r1 * r1 - r2 * r2) / (2 * d * r1)));
    const c2 = Math.max(-1, Math.min(1, (d * d + r2 * r2 - r1 * r1) / (2 * d * r2)));
    const k = Math.max(0, (-d + r1 + r2) * (d + r1 - r2) * (d - r1 + r2) * (d + r1 + r2));
    return (r1 * r1 * Math.acos(c1) + r2 * r2 * Math.acos(c2) - 0.5 * Math.sqrt(k)) / (Math.PI * r1 * r1);
  }

  // ── Chebyshev interpolant of the raw series vectors (E, M) and the frame angles over [a, b] ────────────────────────
  //    (or, for a referee test only, of another source's apparent equatorial Sun and Moon: opts.vectorSource)
  function buildWindow(K, centreTT, src) {
    const a = centreTT - HALF_WINDOW, b = centreTT + HALF_WINDOW, N = NODES, fs = [];
    for (let k = 0; k < N; k++) {
      const x = Math.cos(Math.PI * (k + 0.5) / N), jd = a + (b - a) * (x + 1) / 2;
      if (src) { const v = src(jd); fs.push([...v.sun, v.sunDistAU, ...v.moon, v.moonDistAU]); continue; }
      const r = K.rawTT(jd); if (r === null) throw OUT;
      const fr = K.frameTT(jd);
      fs.push([r.E[0], r.E[1], r.E[2], r.M[0], r.M[1], r.M[2], fr.pA, fr.dpsi, fr.eps]);
    }
    const dim = fs[0].length, c = [];
    for (let j = 0; j < N; j++) {
      const cj = new Array(dim).fill(0);
      for (let k = 0; k < N; k++) { const w = Math.cos(Math.PI * j * (k + 0.5) / N); for (let d = 0; d < dim; d++) cj[d] += fs[k][d] * w; }
      for (let d = 0; d < dim; d++) cj[d] *= 2 / N;
      c.push(cj);
    }
    const at = (jd) => {
      if (!(jd >= a - 1e-9 && jd <= b + 1e-9)) throw new Error("drik-grahana: interpolant queried outside its window");
      const x = (2 * jd - a - b) / (b - a), out = new Array(dim);
      for (let d = 0; d < dim; d++) { let b1 = 0, b2 = 0; for (let j = N - 1; j >= 1; j--) { const tmp = 2 * x * b1 - b2 + c[j][d]; b2 = b1; b1 = tmp; } out[d] = x * b1 - b2 + c[0][d] / 2; }
      return out;
    };
    const vec = (body, t) => { const v = at(t + J2000); return body === "E" ? [v[0], v[1], v[2]] : [v[3], v[4], v[5]]; };
    const cache = new Map();
    /** Geocentric apparent Sun and Moon (true equator of date), km, at jdTT. */
    const state = (jdTT) => {
      let s = cache.get(jdTT); if (s) return s;
      const v = at(jdTT);
      const q = src ? { sun: unit([v[0], v[1], v[2]]), sunDistAU: v[3], moon: unit([v[4], v[5], v[6]]), moonDistAU: v[7] }
        : K.apparentEquatorialWith(vec, jdTT, { pA: v[6], dpsi: v[7], eps: v[8] });
      s = { jdTT, us: q.sun, um: q.moon, dS: q.sunDistAU * AU_KM, dM: q.moonDistAU * AU_KM };
      s.S = scl(s.us, s.dS); s.M = scl(s.um, s.dM);
      if (cache.size > 4096) cache.clear();
      cache.set(jdTT, s); return s;
    };
    return { a, b, state, source: src ? "referee" : "own" };
  }

  // ── one-dimensional searches on the interpolant ──────────────────────────────────────────────────────────────────
  /** Global minimum of f on [a, b]: a 48-point scan, then golden section on the best bracket, to 1e-9 d. */
  function minimise(f, a, b) {
    const n = 48; let best = 0, fb = Infinity; const xs = [], ys = [];
    for (let i = 0; i <= n; i++) { const x = a + (b - a) * i / n, y = f(x); xs.push(x); ys.push(y); if (y < fb) { fb = y; best = i; } }
    let lo = xs[Math.max(0, best - 1)], hi = xs[Math.min(n, best + 1)];
    const g = (Math.sqrt(5) - 1) / 2;
    let x1 = hi - g * (hi - lo), x2 = lo + g * (hi - lo), f1 = f(x1), f2 = f(x2);
    for (let k = 0; k < 200 && hi - lo > 1e-9; k++) {
      if (f1 < f2) { hi = x2; x2 = x1; f2 = f1; x1 = hi - g * (hi - lo); f1 = f(x1); }
      else { lo = x1; x1 = x2; f1 = f2; x2 = lo + g * (hi - lo); f2 = f(x2); }
    }
    const x = (lo + hi) / 2;
    return { x, f: f(x) };
  }
  /** The root of f between x0 (f < 0) and x1 (f > 0) by bisection with a secant step, to 1e-9 d; null if f does not
   *  change sign. */
  function findRoot(f, x0, x1) {
    let a = x0, b = x1, fa = f(a), fb = f(b);
    if (!(fa < 0 && fb > 0)) return null;
    for (let k = 0; k < 200 && Math.abs(b - a) > 1e-9; k++) {
      let m = a - fa * (b - a) / (fb - fa);
      if (!(m > Math.min(a, b) && m < Math.max(a, b)) || k % 3 === 2) m = (a + b) / 2;
      const fm = f(m);
      if (fm < 0) { a = m; fa = fm; } else { b = m; fb = fm; }
    }
    return (a + b) / 2;
  }

  // ── lunar eclipses ───────────────────────────────────────────────────────────────────────────────────────────────
  function lunarGeometry(s, C) {
    const axis = scl(s.us, -1), gam = angle(s.um, axis);
    const piM = Math.asin(EARTH_A_KM / s.dM), piS = Math.asin(EARTH_A_KM / s.dS), sS = Math.asin(C.sunRadiusKm / s.dS), sM = Math.asin(C.moonRadiusKm / s.dM);
    const e = C.lunarParallaxFactor * piM + C.lunarSunParallaxFactor * piS;
    return { gam, piM, piS, sS, sM, ru: e - sS, rp: e + sS, axis, rKm: s.dM * Math.sin(gam) };
  }
  function lunarAt(W, cTT, C) {
    const lo = cTT - SEARCH_HALF, hi = cTT + SEARCH_HALF;
    const g = (t) => lunarGeometry(W.state(t), C);
    // greatest eclipse: the Moon's centre nearest the shadow axis (linear distance, as Meeus ch. 54 and the Canon's gamma)
    const mx = minimise((t) => g(t).rKm, lo, hi), t0 = mx.x, G = g(t0);
    const penMag = (G.rp + G.sM - G.gam) / (2 * G.sM), umbMag = (G.ru + G.sM - G.gam) / (2 * G.sM);
    if (!(penMag > 0)) return null;
    const type = umbMag >= 1 ? "total" : (umbMag > 0 ? "partial" : "penumbral");
    // f = R − γ is > 0 inside a phase and < 0 outside it; findRoot() wants f(x0) < 0 < f(x1)
    const pair = (fR) => {
      const f = (t) => { const q = g(t); return fR(q) - q.gam; };
      if (!(f(t0) > 0)) return [null, null];
      return [findRoot(f, lo, t0), findRoot((t) => -f(t), t0, hi)];
    };
    const [P1, P4] = pair((q) => q.rp + q.sM);
    const [U1, U4] = umbMag > 0 ? pair((q) => q.ru + q.sM) : [null, null];
    const [U2, U3] = umbMag >= 1 ? pair((q) => q.ru - q.sM) : [null, null];
    if (P1 === null || P4 === null) throw new Error("drik-grahana: lunar contacts not bracketed inside the window");
    const s0 = W.state(t0);
    // signed gamma: + when the Moon passes north of the axis (true equator of date), in Earth equatorial radii
    const north = unit(sub([0, 0, 1], scl(G.axis, G.axis[2])));
    const off = sub(s0.um, scl(G.axis, dot(s0.um, G.axis)));
    const gammaER = Math.sign(dot(off, north) || 1) * G.rKm / EARTH_A_KM;
    return { t0, type, penMag, umbMag, obscuration: umbMag >= 1 ? 1 : (umbMag > 0 ? overlapFraction(G.sM, G.ru, G.gam) : 0), gammaER,
      contacts: { P1, U1, U2, U3, U4, P4 }, radii: { penumbraDeg: G.rp / DEG, umbraDeg: G.ru / DEG, moonDeg: G.sM / DEG } };
  }

  // ── solar eclipses ───────────────────────────────────────────────────────────────────────────────────────────────
  function solarGeometry(s, C) {
    const SM = sub(s.S, s.M), dSM = nrm(SM), g = scl(SM, 1 / dSM);
    const z = dot(s.M, g), foot = sub(s.M, scl(g, z));                // the axis' nearest point to the Earth's centre
    const sf1 = (C.sunRadiusKm + C.moonRadiusKm) / dSM, sf2 = (C.sunRadiusKm - C.moonUmbraRadiusKm) / dSM;
    const cf1 = Math.sqrt(1 - sf1 * sf1), cf2 = Math.sqrt(1 - sf2 * sf2);
    const l1 = z * sf1 / cf1 + C.moonRadiusKm / cf1, l2 = z * sf2 / cf2 - C.moonUmbraRadiusKm / cf2;
    // the same axis with the polar coordinate scaled by 1/(1 − f): the Earth becomes a sphere of radius a (exact for
    // whether and where the axis meets the ellipsoid)
    const Md = dilate(s.M), gd = dilate(g), gdu = unit(gd), footD = sub(Md, scl(gdu, dot(Md, gdu)));
    // the Earth's outline seen along the axis: its extent toward the axis is the ellipsoid's support function h(n),
    // n = the unit vector from the centre toward the axis (in the plane normal to it)
    const gammaKm = nrm(foot), n = scl(foot, 1 / gammaKm);
    const h = Math.sqrt(EARTH_A_KM * EARTH_A_KM * (1 - n[2] * n[2]) + EARTH_B_KM * EARTH_B_KM * n[2] * n[2]);
    return { g, z, foot, gammaKm, n, h, l1, l2, Md, gdu, footD, dD: nrm(footD) };
  }
  /** The ellipsoid's support point in direction n (the limb point nearest the axis when the axis misses the Earth). */
  function supportPoint(n, h) { return [EARTH_A_KM * EARTH_A_KM * n[0] / h, EARTH_A_KM * EARTH_A_KM * n[1] / h, EARTH_B_KM * EARTH_B_KM * n[2] / h]; }
  /** The near-side intersection of the axis with the ellipsoid (geocentric km) or null. */
  function axisSurfacePoint(G) {
    const b = dot(G.Md, G.gdu), c = dot(G.Md, G.Md) - EARTH_A_KM * EARTH_A_KM, disc = b * b - c;
    if (disc < 0) return null;
    const lam = b - Math.sqrt(disc);                                      // from the Moon toward the Earth along −g
    return undilate(sub(G.Md, scl(G.gdu, lam)));
  }
  function geodeticOf(P, gastDeg) {
    const rho = Math.hypot(P[0], P[1]);
    return { latitude: Math.atan2(P[2], ONE_MINUS_F * ONE_MINUS_F * rho) / DEG, longitude: wrap180(Math.atan2(P[1], P[0]) / DEG - gastDeg) };
  }
  function observerKm(latDeg, lonEastDeg, heightKm, gastDeg) {
    const phi = latDeg * DEG, th = (gastDeg + lonEastDeg) * DEG, sp = Math.sin(phi), cp = Math.cos(phi);
    const N = EARTH_A_KM / Math.sqrt(1 - EARTH_E2 * sp * sp);
    const O = [(N + heightKm) * cp * Math.cos(th), (N + heightKm) * cp * Math.sin(th), (N * (1 - EARTH_E2) + heightKm) * sp];
    return { O, up: [cp * Math.cos(th), cp * Math.sin(th), sp] };
  }
  /** Topocentric disc geometry at an observer position O (km); mKm = the observer's distance from the shadow axis. */
  function topo(s, O, C) {
    const S = sub(s.S, O), M = sub(s.M, O), dS = nrm(S), dM = nrm(M);
    const g = unit(sub(s.S, s.M)), OM = scl(M, -1), mKm = nrm(sub(OM, scl(g, dot(OM, g))));
    return { sigma: angle(S, M), sS: Math.asin(C.sunRadiusKm / dS), sM: Math.asin(C.moonRadiusKm / dM), sMu: Math.asin(C.moonUmbraRadiusKm / dM), mKm };
  }
  const magnitudeOf = (q) => (q.sigma <= Math.abs(q.sS - q.sM) ? q.sM / q.sS : (q.sS + q.sM - q.sigma) / (2 * q.sS));
  const obscurationOf = (q) => overlapFraction(q.sS, q.sM, q.sigma);

  function solarAt(W, cTT, gastAt, C) {
    const lo = cTT - SEARCH_HALF, hi = cTT + SEARCH_HALF;
    const g = (t) => solarGeometry(W.state(t), C);
    const mx = minimise((t) => g(t).gammaKm, lo, hi), t0 = mx.x, G = g(t0);
    // penumbra on the Earth at some instant: least (dilated distance − a − l1) < 0
    // the penumbra reaches the Earth when the axis is nearer than the Earth's outline plus the penumbral radius
    const pen = C.penumbraEarthSphereKm ? (t) => { const q = g(t); return q.gammaKm - C.penumbraEarthSphereKm - q.l1; }
      : (t) => { const q = g(t); return q.gammaKm - q.h - q.l1; };
    const pm = minimise(pen, lo, hi);
    if (!(pm.f < 0)) return null;
    const s0 = W.state(t0), gast0 = gastAt(t0);
    const P = axisSurfacePoint(G), central = P !== null;
    let type, typeAtGreatest, point, q0;
    if (central) {
      q0 = topo(s0, P, C); point = geodeticOf(P, gast0);
      typeAtGreatest = q0.sMu > q0.sS ? "total" : "annular"; type = typeAtGreatest;
    } else {
      const Pl = supportPoint(G.n, G.h);                                   // the limb point nearest the axis
      q0 = topo(s0, Pl, C); point = geodeticOf(Pl, gast0);
      typeAtGreatest = "partial";
      type = G.gammaKm - G.h < Math.abs(G.l2) ? (G.l2 < 0 ? "total" : "annular") : "partial";
    }
    // the central line: the axis enters and leaves the Earth (dilated distance = a)
    let centralStart = null, centralEnd = null;
    if (central) {
      const f = (t) => g(t).dD - EARTH_A_KM;
      centralStart = findRoot((t) => -f(t), lo, t0); centralEnd = findRoot((t) => f(t), t0, hi);
      if (typeAtGreatest === "total") {
        for (const te of [centralStart, centralEnd]) {
          if (te === null) continue;
          const Ge = g(te), Pe = undilate(scl(unit(Ge.footD), EARTH_A_KM)), qe = topo(W.state(te), Pe, C);
          if (qe.sMu < qe.sS) type = "hybrid";
        }
      }
    }
    const P1 = findRoot((t) => -pen(t), lo, pm.x), P4 = findRoot((t) => pen(t), pm.x, hi);
    if (P1 === null || P4 === null) throw new Error("drik-grahana: solar penumbral contacts not bracketed inside the window");
    const north = unit(sub([0, 0, 1], scl(G.g, G.g[2])));
    const gammaER = Math.sign(dot(G.foot, north) || 1) * G.gammaKm / EARTH_A_KM;
    return { t0, type, typeAtGreatest, central, gammaER, axisDistanceKm: G.gammaKm, greatest: point,
      magnitude: magnitudeOf(q0), obscuration: obscurationOf(q0), contacts: { P1, P4, centralStart, centralEnd } };
  }
  function localSolar(W, cTT, site, gastAt, C) {
    const lo = cTT - SEARCH_HALF, hi = cTT + SEARCH_HALF, h = (site.height || 0) / 1000;
    const q = (t) => topo(W.state(t), observerKm(site.latitude, site.longitude, h, gastAt(t)).O, C);
    const outer = (t) => { const x = q(t); return x.sigma - (x.sS + x.sM); };
    // the eclipse reaches the site when the discs overlap at some instant (least σ − (s_S + s_M) < 0)
    const ov = minimise(outer, lo, hi);
    if (!(ov.f < 0)) return { eclipsed: false };
    // maximum: the observer nearest the shadow axis (ES local circumstances: least m)
    const mx = minimise((t) => q(t).mKm, lo, hi), tm = outer(mx.x) < 0 ? mx.x : ov.x, qm = q(tm);
    // outer = σ − (s_S + s_M) is > 0 outside the eclipse and < 0 inside; findRoot() wants f(x0) < 0 < f(x1)
    const C1 = findRoot((t) => -outer(t), lo, tm), C4 = findRoot((t) => outer(t), tm, hi);
    let C2 = null, C3 = null, type = "partial";
    if (qm.sigma < Math.abs(qm.sS - qm.sMu)) {
      const inner = (t) => { const x = q(t); return x.sigma - Math.abs(x.sS - x.sMu); };
      C2 = findRoot((t) => -inner(t), lo, tm); C3 = findRoot((t) => inner(t), tm, hi);
      type = qm.sMu > qm.sS ? "total" : "annular";
    }
    const altAt = (t) => { const o = observerKm(site.latitude, site.longitude, h, gastAt(t)); const s = W.state(t);
      return Math.asin(Math.max(-1, Math.min(1, dot(unit(sub(s.S, o.O)), o.up)))) / DEG; };
    return { eclipsed: true, type, t0: tm, magnitude: magnitudeOf(qm), obscuration: obscurationOf(qm), C1, C2, C3, C4, altAt };
  }

  // ── the search ───────────────────────────────────────────────────────────────────────────────────────────────────
  /** Geometric syzygies (elongation 0 or 180, light-time and aberration ignored: a search aid only) in [t0, t1] TT
   *  (t0, t1 inside the span, whose last instant is endTT). */
  function syzygies(K, t0, t1, endTT) {
    const probe = (t) => {
      const r = K.rawTT(t); if (r === null) throw OUT;
      const E = r.E, M = r.M;
      return { elong: n360(Math.atan2(M[1], M[0]) / DEG - Math.atan2(-E[1], -E[0]) / DEG), lat: Math.asin(M[2] / nrm(M)) / DEG };
    };
    const out = [];
    const RATE = 12.190749;                                                // mean synodic rate, deg/day
    const p0 = probe(t0);
    let target = p0.elong < 180 ? 180 : 360, x = t0 + (target - p0.elong) / RATE;
    // an estimate or iterate past the span's end is decided at the end itself: the elongation has not reached the target
    // there → this syzygy falls after the span, so after t1, and is not needed (the search ends; nothing outside is asked
    // for); reached → the syzygy lies inside and the secant resumes from the end
    const insideOrDone = () => {
      if (!(x > endTT)) return true;
      const fe = wrap180(probe(endTT).elong - target);
      if (!(fe >= 0 && fe < 90)) return false;
      x = endTT; return true;
    };
    search: for (let guard = 0; guard < 100000; guard++) {
      if (!insideOrDone()) break;
      // secant on the geometric elongation, to 1e-4° (≈ 0.7 s): a window centre, not a reported value
      let q = probe(x), f = wrap180(q.elong - target), xp = null, fp = null;
      for (let k = 0; k < 10 && Math.abs(f) > 1e-4; k++) {
        let rate = RATE;
        if (xp !== null && Math.abs(x - xp) > 1e-9) { const r = (f - fp) / (x - xp); if (r > 5 && r < 20) rate = r; }
        xp = x; fp = f; x -= f / rate;
        if (!insideOrDone()) break search;
        q = probe(x); f = wrap180(q.elong - target);
      }
      if (x > t1) break;
      if (x >= t0) out.push({ jdTT: x, kind: target === 180 ? "lunar" : "solar", moonLat: q.lat });
      target = target === 180 ? 360 : 180; x += 180 / RATE;                // the next syzygy is about half a lunation on
    }
    return out;
  }
  /** A finite Julian day, or TypeError (null is kept for "outside the span"). */
  function requireFinite(x, entry, what) {
    if (typeof x !== "number" || !Number.isFinite(x)) throw new TypeError(`DrikGrahana.${entry}: ${what} must be a finite number (got ${typeof x === "number" ? x : typeof x})`);
    return x;
  }
  /** The tier's one ayanāṃśa (no eclipse quantity depends on it): any name other than 'citra-paksha' is refused. */
  function rejectNamedAyanamsha(o) {
    const name = typeof o === "string" ? o : (o && typeof o === "object" ? o.ayanamsha : undefined);
    if (name === undefined || name === null || name === "" || name === "citra-paksha") return;
    throw new RangeError(`DrikGrahana: the dṛk tier's ayanāṃśa is Citrā-pakṣa (true) only (owner decision DK-2); "${name}" is not accepted here`);
  }
  function checkSite(site) {
    if (site === undefined || site === null) return null;
    const lat = site.latitude, lon = site.longitude;
    if (typeof lat !== "number" || !Number.isFinite(lat) || Math.abs(lat) > 90) throw new RangeError("DrikGrahana: site.latitude must be a finite number of degrees in [−90, 90]");
    if (typeof lon !== "number" || !Number.isFinite(lon) || Math.abs(lon) > 360) throw new RangeError("DrikGrahana: site.longitude (east +) must be a finite number of degrees");
    return { latitude: lat, longitude: lon, height: Number.isFinite(site.height) ? site.height : 0 };
  }

  /** Eclipses whose greatest phase falls in [fromJdUT, toJdUT] (UT Julian days), oldest first.
   *  site (optional): { latitude, longitude (east +), height (m) } adds `local` to each row.
   *  opts: { kinds: ['lunar', 'solar'] (default both) }. Referee tests only (no page passes them): conventions (see
   *  OWN_CONVENTIONS) and vectorSource(jdTT) → { sun, sunDistAU, moon, moonDistAU } (apparent unit vectors, true equator
   *  of date) to run this geometry on another ephemeris; rows computed that way carry source: 'referee'.
   *  Returns null when the search window (fromJdUT − 0.6 d … toJdUT + 0.6 d) leaves 1850.0–2150.0 TT, or when an eclipse
   *  candidate in it needs its ±0.35-d interpolation window beyond an edge (only for a window ending within ≈ 1 d of it).
   *  A Julian day that is not a finite number throws TypeError; opts.ayanamsha other than 'citra-paksha' RangeError. */
  function eclipses(fromJdUT, toJdUT, site, opts) {
    const ST = getST();
    if (!ST || !ST.eclipseKernel) throw new Error("DrikGrahana: siddhanta-tier.js (with its eclipse kernel) must be loaded first");
    requireFinite(fromJdUT, "eclipses", "the first Julian day"); requireFinite(toJdUT, "eclipses", "the last Julian day");
    rejectNamedAyanamsha(opts);
    if (toJdUT < fromJdUT) throw new RangeError("DrikGrahana.eclipses: toJdUT must not precede fromJdUT");
    const S = checkSite(site), o = opts || {}, C = Object.freeze(Object.assign({}, OWN_CONVENTIONS, o.conventions || {}));
    const kinds = new Set(o.kinds || ["lunar", "solar"]);
    const K = ST.eclipseKernel;
    const t0 = ST.jdTTofUT(fromJdUT), t1 = ST.jdTTofUT(toJdUT);
    if (!ST.inSpanTT(t0 - EDGE_MARGIN) || !ST.inSpanTT(t1 + EDGE_MARGIN)) return null;
    try {
      const rows = [];
      const endTT = J2000 + (ST.span()[1] - 2000) * 365.25;                // the series rule's last instant (y = 2150.0)
      for (const z of syzygies(K, t0 - EDGE_MARGIN, t1 + EDGE_MARGIN, endTT)) {
        if (!kinds.has(z.kind) || Math.abs(z.moonLat) > PRUNE_LAT_DEG) continue;
        const W = buildWindow(K, z.jdTT, o.vectorSource);
        const dT = ST.deltaTSeconds(ST.utOfTT(z.jdTT)) / 86400;            // ΔT varies < 1e-3 s over a window
        const gastAt = (jdTT) => K.gastDegTT(jdTT - dT, jdTT);
        const row = z.kind === "lunar" ? lunarRow(ST, W, z.jdTT, S, gastAt, dT, C) : solarRow(ST, W, z.jdTT, S, gastAt, dT, C);
        if (row && row.maxJdUT >= fromJdUT && row.maxJdUT <= toJdUT) rows.push(row);
      }
      return rows;
    } catch (e) { if (e === OUT) return null; throw e; }
  }
  /** The eclipse geometry at one instant, straight from the series (no interpolant): lunar { gammaDeg, umbraDeg,
   *  penumbraDeg, moonDeg, umbralMagnitude, penumbralMagnitude }, solar { axisDistanceKm, l1Km, l2Km, outlineKm }, and
   *  with a site, local { separationDeg, sunDeg, moonDeg, moonUmbraDeg, magnitude, obscuration, axisDistanceKm,
   *  sunAltitudeDeg }. jdUT (UT; opts.timeScale 'TT' for TT). null outside the span; TypeError when jd is not a finite
   *  number; opts.ayanamsha other than 'citra-paksha' RangeError. */
  function geometryAt(jd, site, opts) {
    const ST = getST(); if (!ST || !ST.eclipseKernel) throw new Error("DrikGrahana: siddhanta-tier.js must be loaded first");
    requireFinite(jd, "geometryAt", "the Julian day"); rejectNamedAyanamsha(opts);
    const o = opts || {}, C = Object.freeze(Object.assign({}, OWN_CONVENTIONS, o.conventions || {})), S = checkSite(site);
    const jdTT = o.timeScale === "TT" ? jd : ST.jdTTofUT(jd);
    const v = ST.eclipseKernel.sunMoonVectorsTT(jdTT); if (!v) return null;
    const st = { jdTT, us: v.sun, um: v.moon, dS: v.sunDistAU * AU_KM, dM: v.moonDistAU * AU_KM };
    st.S = scl(st.us, st.dS); st.M = scl(st.um, st.dM);
    const L = lunarGeometry(st, C), G = solarGeometry(st, C);
    const out = { jdTT, jdUT: jdTT - ST.deltaTSeconds(ST.utOfTT(jdTT)) / 86400,
      lunar: { gammaDeg: L.gam / DEG, umbraDeg: L.ru / DEG, penumbraDeg: L.rp / DEG, moonDeg: L.sM / DEG, axisDistanceKm: L.rKm,
        umbralMagnitude: (L.ru + L.sM - L.gam) / (2 * L.sM), penumbralMagnitude: (L.rp + L.sM - L.gam) / (2 * L.sM) },
      solar: { axisDistanceKm: G.gammaKm, l1Km: G.l1, l2Km: G.l2, outlineKm: G.h } };
    if (S) {
      const gast = ST.eclipseKernel.gastDegTT(out.jdUT, jdTT), ob = observerKm(S.latitude, S.longitude, S.height / 1000, gast), q = topo(st, ob.O, C);
      out.local = { separationDeg: q.sigma / DEG, sunDeg: q.sS / DEG, moonDeg: q.sM / DEG, moonUmbraDeg: q.sMu / DEG, magnitude: magnitudeOf(q),
        obscuration: obscurationOf(q), axisDistanceKm: q.mKm,
        sunAltitudeDeg: Math.asin(Math.max(-1, Math.min(1, dot(unit(sub(st.S, ob.O)), ob.up)))) / DEG,
        moonGeocentricAltitudeDeg: Math.asin(Math.max(-1, Math.min(1, dot(st.um, ob.up)))) / DEG };
    }
    return out;
  }
  function placesAt(ST, jdUT) {
    const m = ST.sunMoon(jdUT); if (!m) throw OUT;
    return { sunSiderealDeg: m.sunSid, moonSiderealDeg: m.moonSid, moonLatitudeDeg: m.moonLat };
  }
  function lunarRow(ST, W, cTT, site, gastAt, dT, C) {
    const L = lunarAt(W, cTT, C); if (!L) return null;
    const ut = (x) => (x === null ? null : { jdTT: x, jdUT: x - dT });
    const c = L.contacts, maxJdUT = L.t0 - dT;
    // magnitude = the umbral magnitude (negative for a penumbral eclipse; penumbralMagnitude is then the one that counts)
    const row = { kind: "lunar", type: L.type, maxJdUT, maxJdTT: L.t0, deltaTSeconds: dT * 86400,
      magnitude: L.umbMag, umbralMagnitude: L.umbMag, penumbralMagnitude: L.penMag, obscuration: L.obscuration, gamma: L.gammaER,
      contacts: { P1: ut(c.P1), U1: ut(c.U1), U2: ut(c.U2), U3: ut(c.U3), U4: ut(c.U4), P4: ut(c.P4) },
      semiDurationMinutes: { penumbral: (c.P4 - c.P1) / 2 * 1440, partial: c.U1 !== null ? (c.U4 - c.U1) / 2 * 1440 : 0, total: c.U2 !== null ? (c.U3 - c.U2) / 2 * 1440 : 0 },
      radiiDeg: L.radii, convention: C.name, ...placesAt(ST, maxJdUT), source: W.source };
    if (site) {
      const alt = (t) => { const s = W.state(t), o = observerKm(site.latitude, site.longitude, 0, gastAt(t));
        return Math.asin(Math.max(-1, Math.min(1, dot(s.um, o.up)))) / DEG; };
      const at = {}; for (const k of ["P1", "U1", "U2", "U3", "U4", "P4"]) at[k] = c[k] === null ? null : alt(c[k]);
      at.max = alt(L.t0);
      let visible = false; for (let i = 0; i <= 48 && !visible; i++) visible = alt(c.P1 + (c.P4 - c.P1) * i / 48) > MOON_HORIZON_DEG;
      row.local = { site: { latitude: site.latitude, longitude: site.longitude }, moonAltitudeDeg: at, visible,
        rule: "geocentric altitude of the Moon's centre; visible when above the net +7′ horizon (the tier's moonrise convention) at some instant between P1 and P4" };
    }
    return row;
  }
  function solarRow(ST, W, cTT, site, gastAt, dT, C) {
    const G = solarAt(W, cTT, gastAt, C); if (!G) return null;
    const ut = (x) => (x === null ? null : { jdTT: x, jdUT: x - dT });
    const maxJdUT = G.t0 - dT;
    const row = { kind: "solar", type: G.type, typeAtGreatest: G.typeAtGreatest, central: G.central, maxJdUT, maxJdTT: G.t0, deltaTSeconds: dT * 86400,
      magnitude: G.magnitude, obscuration: G.obscuration, gamma: G.gammaER, axisDistanceKm: G.axisDistanceKm, greatest: G.greatest,
      contacts: { P1: ut(G.contacts.P1), P4: ut(G.contacts.P4), centralStart: ut(G.contacts.centralStart), centralEnd: ut(G.contacts.centralEnd) },
      convention: C.name, ...placesAt(ST, maxJdUT), source: W.source };
    if (site) {
      const L = localSolar(W, cTT, site, gastAt, C);
      if (!L.eclipsed) row.local = { site: { latitude: site.latitude, longitude: site.longitude }, eclipsed: false, visible: false };
      else {
        const alt = {}; for (const k of ["C1", "C2", "C3", "C4"]) alt[k] = L[k] === null ? null : L.altAt(L[k]); alt.max = L.altAt(L.t0);
        let visible = false;
        if (L.C1 !== null && L.C4 !== null) for (let i = 0; i <= 48 && !visible; i++) visible = L.altAt(L.C1 + (L.C4 - L.C1) * i / 48) > SUN_HORIZON_DEG;
        row.local = { site: { latitude: site.latitude, longitude: site.longitude }, eclipsed: true, type: L.type,
          maxJdUT: L.t0 - dT, maxJdTT: L.t0, magnitude: L.magnitude, obscuration: L.obscuration,
          contacts: { C1: ut(L.C1), C2: ut(L.C2), C3: ut(L.C3), C4: ut(L.C4) }, sunAltitudeDeg: alt, visible,
          rule: "topocentric discs on the IERS 2010 ellipsoid; visible when the Sun's upper limb is above the 34′-refraction horizon (centre above −50′) at some instant between C1 and C4" };
      }
    }
    return row;
  }

  const api = { eclipses, geometryAt, overlapFraction,
    OWN_CONVENTIONS, CONSTANTS: Object.freeze({ AU_KM, EARTH_A_KM, EARTH_INV_F: 298.25642, K_MEAN, K_UMBRA, SUN_SD_1AU_ARCSEC, SUN_R_KM, DANJON, NODES, HALF_WINDOW, PRUNE_LAT_DEG }),
    label: "Eclipses searched on the Modern Bhāratīya (dṛk) tier's own Sun and Moon: lunar with Danjon's shadow, solar by the shadow cones on the IERS 2010 ellipsoid (Explanatory Supplement conventions).",
    source: "own" };
  root.DrikGrahana = api;
  if (typeof module === "object" && module.exports) module.exports = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
