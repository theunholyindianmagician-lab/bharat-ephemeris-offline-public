/* ss-parilekha.js — छेद्यक / परिलेख: the eclipse drawn, Sūrya-Siddhānta chapter 6, from the eclipse that ss-grahana.js
 * computes (chapters 4-5). Ruler and cord only: the points are found by the text's own steps, with square roots and
 * the four operations; no trigonometry. The SVG is a picture of those points.
 *
 *   6.2       a circle of seven-squared (49) aṅgulas, for the valana                                 TEXT.valanaCircle
 *   6.3       the samāsa circle, half the sum of the measures; the third circle, half the eclipsed     circles
 *   6.4       the Moon is seized on the east and released on the west; the Sun the reverse
 *   6.5       the Moon's valana of seizing in its own direction, of release reversed; the Sun's the reverse   contactTip
 *   6.6       from the valana's tip a cord to the centre; where it meets the samāsa circle the two latitudes
 *             (of seizing and of release) are laid off
 *   6.7       from the latitude's tip a cord to the centre: where it meets the eclipsed body's circle, seizing
 *             and release are shown                                                                   touch
 *   6.8       the Sun's latitudes always in their own direction, the Moon's reversed; so also the middle
 *   6.9       the middle's valana eastward when it and the latitude agree, westward when they differ, for the Moon;
 *             for the Sun the reverse                                                                  middleTip
 *   6.10      from that tip a cord to the centre; along it the latitude laid off toward the valana
 *   6.11      from the latitude's tip a circle of half the eclipser: what it covers of the eclipsed is seized
 *   6.12      drawing on the ground or a board, the directions reversed for the eastern and western kapālas
 *             [reading: this edition takes it as a mirror of east and west; see `view`]
 *   6.13      a twelfth of the Moon is seen, three minutes of the Sun are not (ss-grahana.js `perceptible`)
 *   6.14-6.16 the three latitude tips; between them two fish (matsya); where the two cords from the fish meet, an arc
 *             through the three points: the eclipser's path                                           matsya
 *   6.17-6.19 a rod of (half-sum − the grāsa wanted) from the centre to the path, on the side of seizing or release;
 *             there a circle of half the eclipser                                                      grasaPoint
 *   6.20-6.22 a rod of half the difference of the measures: nimīlana on the side of seizing, unmīlana of release
 *   6.23      less than half: smoky; more than half: black; while releasing: dark copper; whole: tawny     varna
 *
 * The plane: the eclipsed body's centre at the origin; x east, y north, in aṅgulas (4.26, the phala at the middle) or
 * in minutes when the eclipsed body is down at the middle. Two paths are kept: "instants" (default) — the eclipser's
 * centre at every moment from 4.18-4.21's koṭi and latitude, turned by 4.24-4.25's valana of that moment — and
 * "matsya", the text's three-point arc (6.14-6.16). The test measures how far apart they are.
 * Browser: window.SSParilekha (needs SSGrahana); node: module.exports.
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory(require("./ss-grahana.js"));
  else root.SSParilekha = factory(root.SSGrahana);
})(typeof globalThis !== "undefined" ? globalThis : this, function (H) {
  "use strict";
  const TEXT = Object.freeze({
    valanaCircle: 49,                                           // 6.2 sapta-varga aṅgula
    colours: Object.freeze({ sadhumra: "less than half (ardhād ūne)", krishna: "more than half (ardhādhike)",
      krishnatamra: "while releasing (vimuñcataḥ)", kapila: "whole (sakala-grahe)" }),   // 6.23
  });
  const V = TEXT.valanaCircle;
  const PATHS = Object.freeze(["instants", "matsya"]);
  const pt = (x, y) => ({ x, y });
  const add = (a, b) => pt(a.x + b.x, a.y + b.y), sub = (a, b) => pt(a.x - b.x, a.y - b.y), mul = (a, k) => pt(a.x * k, a.y * k);
  const len = (a) => Math.sqrt(a.x * a.x + a.y * a.y);
  const foot = (v) => Math.sqrt(Math.max(0, V * V - v * v));   // the other leg on the 49 circle

  // ── 6.4-6.9: where the valanas are laid ─────────────────────────────────────────────────────────────
  /** 6.4-6.5: the valana's tip on the 49 circle for seizing ("sparsha") or release ("moksha"), v signed aṅgulas (north +). */
  function contactTip(kind, side, v) {
    const lunar = kind === "lunar";
    const atEast = lunar ? side === "sparsha" : side === "moksha";             // 6.4
    const ownWay = lunar ? side === "sparsha" : side === "moksha";             // 6.5: yathādiśam / viparyastam; the Sun reversed
    const north = ownWay ? v : -v;
    return pt((atEast ? 1 : -1) * foot(v), north);
  }
  /** 6.9: the middle's valana tip: from the north or south point as the diagram latitude points (6.8), turned east when the
   *  valana and the latitude agree for the Moon (west for the Sun), the other way when they differ. beta is the computed
   *  latitude (minutes, north +): the Moon's own for a lunar eclipse, the Moon's apparent one for a solar. */
  function middleTip(kind, v, beta) {
    const lunar = kind === "lunar", b = lunar ? -beta : beta;                  // 6.8
    const agree = v === 0 || beta === 0 || (v > 0) === (beta > 0);
    const east = lunar ? agree : !agree;                                       // 6.9
    return pt((east ? 1 : -1) * Math.abs(v), (b >= 0 ? 1 : -1) * foot(v));
  }
  /** The north side of a cord from the centre to `tip`: the perpendicular whose y is positive (6.6, 6.8). */
  function northOfCord(tip) {
    const d = mul(tip, 1 / len(tip));
    return d.x >= 0 ? pt(-d.y, d.x) : pt(d.y, -d.x);
  }

  // ── 6.15: two fish and the meeting of their cords ─────────────────────────────────────────────────────
  /** The circle through A, B, C: the cords drawn from mouth to tail of the fish on AB and on BC (each the perpendicular
   *  at a midpoint) meet at its centre. null when the three are in a line (the path is then straight). */
  function matsya(A, B, C) {
    const m1 = mul(add(A, B), 0.5), d1 = pt(-(B.y - A.y), B.x - A.x);
    const m2 = mul(add(B, C), 0.5), d2 = pt(-(C.y - B.y), C.x - B.x);
    const det = d1.x * (-d2.y) - d1.y * (-d2.x);
    const scale = Math.max(len(sub(A, B)), len(sub(B, C)), 1e-12);
    if (Math.abs(det) < 1e-12 * scale * scale) return null;
    const r = sub(m2, m1), s = (r.x * (-d2.y) - r.y * (-d2.x)) / det;
    const centre = add(m1, mul(d1, s));
    return { centre, radius: len(sub(A, centre)), fish: [{ mouth: m1, along: d1 }, { mouth: m2, along: d2 }] };
  }
  /** Points at distance L from the origin on the circle (U, rho), or on the line through P with direction D. */
  function meetCircle(L, U, rho) {
    const d = len(U);
    if (!(d > 0)) return [];
    const a = (L * L - rho * rho + d * d) / (2 * d), h2 = L * L - a * a;
    if (h2 < 0) return [];
    const h = Math.sqrt(h2), base = mul(U, a / d), perp = pt(-U.y / d, U.x / d);
    return h === 0 ? [base] : [add(base, mul(perp, h)), sub(base, mul(perp, h))];
  }
  function meetLine(L, P, D) {
    const dd = D.x * D.x + D.y * D.y, pd = P.x * D.x + P.y * D.y, c = P.x * P.x + P.y * P.y - L * L;
    const disc = pd * pd - dd * c;
    if (disc < 0) return [];
    const r = Math.sqrt(disc);
    return [add(P, mul(D, (-pd + r) / dd)), add(P, mul(D, (-pd - r) / dd))];
  }

  // ── 6.23 ─────────────────────────────────────────────────────────────────────────────────────────────
  /** 6.23: the colour of the seized part from the fraction seized and whether it is being released. The order (whole
   *  first, then releasing, then the half rule) is a reading; the verse names no body (the tradition: the Moon). */
  function varna(fraction, releasing) {
    if (fraction >= 1) return "kapila";
    if (releasing) return "krishnatamra";
    return fraction < 0.5 ? "sadhumra" : "krishna";
  }

  // ── the diagram ──────────────────────────────────────────────────────────────────────────────────────
  /** The chedyaka of an eclipse E from ss-grahana.js. opts.units "angula" (default, 4.26 at the middle; minutes when the
   *  eclipsed body is down then) or "kala"; opts.reading: 4.26's reading; opts.samples: points on the instants path. */
  function parilekha(E, opts) {
    const o = opts || {}, lunar = E.kind === "lunar";
    const ang = o.units === "kala" ? null : H.angulaAt(E, E.middle, { reading: o.reading });
    const phala = ang ? ang.phala : 1, units = ang ? "angula" : "kala", u = (x) => x / phala;
    const rg = u(E.grahyaDisc) / 2, rk = u(E.grahakaDisc) / 2, samasa = u(E.halfSum);
    const D = { kind: E.kind, units, phala, possible: E.possible, total: E.total,
      circles: { valana: V, samasa, grahya: rg }, grahakaRadius: rk, middle: E.middle, contacts: E.contacts };

    // the eclipser's centre at a moment, from the text's own quantities (4.18-4.21, 4.24-4.25)
    const frameAt = (t) => { const v = H.valanaAt(E, t).angula, a = foot(v); return { v, e: pt(a / V, v / V), n: pt(-v / V, a / V) }; };
    const instant = (t) => {
      const g = H.grasaAt(E, t), f = frameAt(t), before = t <= E.middle;
      const along = (lunar ? (before ? 1 : -1) : (before ? -1 : 1)) * u(g.koti);     // 6.4: the shadow east of the Moon at first
      const lat = (lunar ? -1 : 1) * u(g.kshepa);                                     // 6.8
      return add(mul(f.e, along), mul(f.n, lat));
    };

    // 6.9-6.11: the middle
    const vm = H.valanaAt(E, E.middle), betaM = E.latitude;
    const tipM = middleTip(E.kind, vm.angula, betaM);
    const M = mul(tipM, Math.abs(u(betaM)) / len(tipM));                             // 6.10
    D.valana = { madhya: { degrees: vm.degrees, angula: vm.angula, tip: tipM } };
    D.vikshepa = { madhya: { minutes: betaM, tip: M } };
    D.madhya = { centre: M, distance: len(M), grasa: samasa - len(M), fraction: (samasa - len(M)) / (2 * rg) };
    D.varna = varna(D.madhya.fraction, false);
    if (!E.possible) { D.path = null; return D; }

    // 6.5-6.7: seizing and release
    D.touch = {};
    for (const side of ["sparsha", "moksha"]) {
      const t = E.contacts[side], vl = H.valanaAt(E, t), beta = H.grasaAt(E, t).kshepa;
      const tip = contactTip(E.kind, side, vl.angula);
      const P = mul(tip, samasa / len(tip));                                         // 6.6
      const W = add(P, mul(northOfCord(tip), (lunar ? -1 : 1) * u(beta)));            // 6.6, 6.8
      D.valana[side] = { degrees: vl.degrees, angula: vl.angula, tip };
      D.vikshepa[side] = { minutes: beta, onSamasa: P, tip: W };
      D.touch[side] = mul(W, rg / len(W));                                            // 6.7
    }

    // 6.14-6.16: the text's path; and the path of the instants
    const Ws = D.vikshepa.sparsha.tip, Wm = D.vikshepa.moksha.tip;
    const arc = matsya(Ws, M, Wm);
    const n = Math.max(8, o.samples || 96), t0 = E.contacts.sparsha, t1 = E.contacts.moksha, pts = [];
    for (let i = 0; i <= n; i++) { const t = t0 + (t1 - t0) * i / n; pts.push({ t, ...instant(t) }); }
    D.path = { default: "instants", instants: pts, matsya: arc ? { ...arc, from: Ws, through: M, to: Wm } : { straight: true, from: Ws, through: M, to: Wm } };
    D.instant = instant;
    D.instantContacts = { sparsha: instant(t0), madhya: instant(E.middle), moksha: instant(t1) };

    // 6.17-6.22: points on the path
    D.nimilana = E.total && rk > rg ? grasaPoint(D, E, null, "sparsha", { distance: rk - rg }) : null;
    D.unmilana = E.total && rk > rg ? grasaPoint(D, E, null, "moksha", { distance: rk - rg }) : null;
    Object.defineProperty(D, "_E", { value: E, enumerable: false });
    return D;
  }

  /** 6.17-6.19: the eclipser's centre when `g` (in the diagram's units) is seized, on the side of seizing ("sparsha") or
   *  of release ("moksha"): the point of the path at distance half-sum − g from the centre. opts.path: "instants"
   *  (default; the moment by 4.22-4.23) or "matsya" (the three-point arc); opts.distance overrides the rod (6.20). */
  function grasaPoint(D, E, g, side, opts) {
    const o = opts || {}, path = o.path || "instants";
    if (!PATHS.includes(path)) throw new RangeError("ss-parilekha: path is one of " + PATHS.join(", "));
    const Ex = E || D._E;
    if (!D.path) return null;
    const L = typeof o.distance === "number" ? o.distance : D.circles.samasa - g;   // 6.17 avaśiṣṭa
    if (!(L >= 0)) return null;
    let centre = null, at = null;
    if (path === "instants") {
      const r = H.timeForGrasa(Ex, (D.circles.samasa - L) * D.phala, side);         // 4.22-4.23 in minutes
      if (!r) return null;
      at = r.at; centre = D.instant(at);
    } else {
      const m = D.path.matsya, W = side === "moksha" ? m.to : m.from;
      const cands = m.straight ? meetLine(L, m.from, sub(m.to, m.from)) : meetCircle(L, m.centre, m.radius);
      if (!cands.length) return null;
      centre = cands.reduce((best, c) => (len(sub(c, W)) < len(sub(best, W)) ? c : best));
    }
    return { side, path, at, centre, rod: L, radius: D.grahakaRadius };
  }

  // ── the picture ──────────────────────────────────────────────────────────────────────────────────────
  const COLOUR = { sadhumra: "#7a6a64", krishna: "#1d1b1a", krishnatamra: "#5b2a1c", kapila: "#a8743f" };
  const f2 = (x) => (Math.round(x * 100) / 100).toFixed(2);
  /** An SVG of the diagram. opts.view "sky" (default: east on the left, north up, as one looks up; this edition's reading
   *  of 6.12) or "board" (east on the right); opts.path: which path to draw strong (the other faint); opts.title. */
  function svg(D, opts) {
    const o = opts || {}, sky = (o.view || "sky") === "sky", strong = o.path || "instants";
    const X = (p) => f2(sky ? -p.x : p.x), Y = (p) => f2(-p.y);
    let ext = Math.max(V, D.circles.samasa + D.grahakaRadius);
    if (D.path) for (const p of D.path.instants) ext = Math.max(ext, len(p) + D.grahakaRadius);
    ext *= 1.18;
    const out = [];
    const line = (a, b, cls) => out.push(`<line x1="${X(a)}" y1="${Y(a)}" x2="${X(b)}" y2="${Y(b)}" class="${cls}"/>`);
    const circle = (c, r, cls, extra) => out.push(`<circle cx="${X(c)}" cy="${Y(c)}" r="${f2(r)}" class="${cls}"${extra || ""}/>`);
    const label = (p, s, cls) => out.push(`<text x="${X(p)}" y="${Y(p)}" class="${cls || "lbl"}">${s}</text>`);
    const O = pt(0, 0), fs = f2(ext / 26);
    out.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${f2(-ext)} ${f2(-ext)} ${f2(2 * ext)} ${f2(2 * ext)}" role="img" aria-label="chedyaka">`);
    out.push(`<style>.ax{stroke:#888;stroke-width:${f2(ext / 400)}}.c49{fill:none;stroke:#999;stroke-dasharray:${f2(ext / 80)};stroke-width:${f2(ext / 400)}}` +
      `.sam{fill:none;stroke:#557;stroke-width:${f2(ext / 400)}}.gr{fill:${D.kind === "lunar" ? "#e8e4d4" : "#f5c242"};stroke:#333;stroke-width:${f2(ext / 300)}}` +
      `.cord{stroke:#b55;stroke-width:${f2(ext / 500)}}.ec{fill:none;stroke:#222;stroke-width:${f2(ext / 400)};stroke-dasharray:${f2(ext / 120)}}` +
      `.ps{fill:none;stroke:#2a6;stroke-width:${f2(ext / 220)}}.pw{fill:none;stroke:#2a6;stroke-opacity:.45;stroke-width:${f2(ext / 500)};stroke-dasharray:${f2(ext / 100)}}` +
      `.pt{fill:#b55}.lbl{font:${fs}px sans-serif;fill:#333}.ttl{font:bold ${fs}px sans-serif;fill:#222}</style>`);
    out.push(`<defs><clipPath id="grahya"><circle cx="0" cy="0" r="${f2(D.circles.grahya)}"/></clipPath></defs>`);
    // 6.2-6.4: circles and directions
    circle(O, V, "c49"); circle(O, D.circles.samasa, "sam"); line(pt(-ext, 0), pt(ext, 0), "ax"); line(pt(0, -ext), pt(0, ext), "ax");
    label(pt(ext * 0.9, 0), "पूर्व E"); label(pt(-ext * 0.97, 0), "पश्चिम W"); label(pt(0, ext * 0.94), "उत्तर N"); label(pt(0, -ext * 0.97), "दक्षिण S");
    circle(O, D.circles.grahya, "gr");
    // 6.11 / 6.19: the seized part at the middle, coloured by 6.23
    const Mc = D.path ? D.instantContacts.madhya : D.madhya.centre;
    out.push(`<g clip-path="url(#grahya)"><circle cx="${X(Mc)}" cy="${Y(Mc)}" r="${f2(D.grahakaRadius)}" fill="${COLOUR[D.varna]}" fill-opacity="0.85"/></g>`);
    circle(Mc, D.grahakaRadius, "ec");
    line(O, D.valana.madhya.tip, "cord"); out.push(`<circle cx="${X(D.vikshepa.madhya.tip)}" cy="${Y(D.vikshepa.madhya.tip)}" r="${f2(ext / 120)}" class="pt"/>`);
    label(add(D.vikshepa.madhya.tip, pt(0, ext / 40)), "मध्य");
    if (D.path) {
      for (const side of ["sparsha", "moksha"]) {
        line(O, D.valana[side].tip, "cord");
        const W = D.vikshepa[side].tip;
        out.push(`<circle cx="${X(W)}" cy="${Y(W)}" r="${f2(ext / 120)}" class="pt"/>`);
        out.push(`<circle cx="${X(D.touch[side])}" cy="${Y(D.touch[side])}" r="${f2(ext / 160)}" fill="#333"/>`);
        label(add(W, pt(0, ext / 40)), side === "sparsha" ? "स्पर्श" : "मोक्ष");
        circle(D.instantContacts[side], D.grahakaRadius, "ec");
      }
      const poly = D.path.instants.map((p) => `${X(p)},${Y(p)}`).join(" ");
      out.push(`<polyline points="${poly}" class="${strong === "instants" ? "ps" : "pw"}"/>`);
      const m = D.path.matsya, cls = strong === "matsya" ? "ps" : "pw";
      if (m.straight) line(m.from, m.to, cls);
      else {
        const s = pt(+X(m.from), +Y(m.from)), mi = pt(+X(m.through), +Y(m.through)), e = pt(+X(m.to), +Y(m.to)), c = pt(+X(m.centre), +Y(m.centre));
        const cross = (a, b, q) => (b.x - a.x) * (q.y - a.y) - (b.y - a.y) * (q.x - a.x);
        const sweep = cross(s, mi, e) > 0 ? 1 : 0, large = (cross(s, e, c) > 0) === (cross(s, e, mi) > 0) ? 1 : 0;
        out.push(`<path d="M ${f2(s.x)} ${f2(s.y)} A ${f2(m.radius)} ${f2(m.radius)} 0 ${large} ${sweep} ${f2(e.x)} ${f2(e.y)}" class="${cls}"/>`);
      }
    }
    const ttl = o.title || `${D.kind === "lunar" ? "चन्द्रग्रहण" : "सूर्यग्रहण"} · ${D.units === "angula" ? "aṅgula" : "kalā"} · ${(D.madhya.fraction * 100).toFixed(1)}%`;
    out.push(`<text x="${f2(-ext * 0.97)}" y="${f2(-ext * 0.9)}" class="ttl">${ttl.replace(/[<&>]/g, "")}</text>`);
    out.push("</svg>");
    return out.join("");
  }

  return Object.freeze({ TEXT, PATHS, contactTip, middleTip, northOfCord, matsya, varna, parilekha, grasaPoint, svg });
});
