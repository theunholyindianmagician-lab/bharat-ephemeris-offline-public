'use strict';
/*
 * ss-parilekha.test.js — SS chapter 6, the chedyaka: the text's compass rules, the fish construction, the rods, the
 * colours, and how far the text's three-point arc is from the eclipser's path by the text's own quantities.
 */
const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const Pl = require('./ss-parilekha.js');
const Gr = require('./ss-grahana.js');
const K = require('./kala-dvara.js');

const UJJAIN = { latitude: 23.18, deshantara: 0.05 };
const kali = (y, m, d) => K.kaliDayFromCivil({ calendar: 'gregorian', year: y, month: m, day: d });
const len = (p) => Math.sqrt(p.x * p.x + p.y * p.y);
const dist = (a, b) => len({ x: a.x - b.x, y: a.y - b.y });
const edition = fs.readFileSync(path.join(__dirname, 'editions', 'surya-siddhanta-full-edition.html'), 'utf8');
const cases = () => [Gr.lunarEclipse(kali(2026, 3, 3), UJJAIN), Gr.lunarEclipse(kali(2026, 8, 28), UJJAIN),
  Gr.solarEclipse(1643524 + 0.5, { latitude: 10.8, deshantara: -2 }), Gr.solarEclipse(1648722 + 0.5, { latitude: 10.8, deshantara: -2 })];

test('[text 6.2-6.3] three circles: 49 aṅgulas for the valana, the half-sum, the half of the eclipsed', () => {
  assert.match(edition, /सप्तवर्गाङ्गुलेनादौ मण्डलं वलनाश्रितम्/);
  assert.equal(Pl.TEXT.valanaCircle, 7 * 7);
  for (const E of cases()) {
    const D = Pl.parilekha(E);
    assert.ok(Math.abs(D.circles.samasa * D.phala - E.halfSum) < 1e-12);
    assert.ok(Math.abs(D.circles.grahya * 2 * D.phala - E.grahyaDisc) < 1e-12);
    assert.ok(Math.abs(D.grahakaRadius * 2 * D.phala - E.grahakaDisc) < 1e-12);
  }
});

test('[THEOREM 6.4-6.9] the compass rules are one turning of the frame: with the valana v (north +) the ecliptic\'s east is (√(49²−v²), v)/49 and its north (−v, √(49²−v²))/49, for both bodies and every side; the other parse of 6.9 breaks it', () => {
  const foot = (v) => Math.sqrt(49 * 49 - v * v);
  let other = 0;
  for (const kind of ['lunar', 'solar']) {
    const lunar = kind === 'lunar';
    for (let v = -45; v <= 45; v += 2.5) {
      const e = { x: foot(v) / 49, y: v / 49 }, n = { x: -v / 49, y: foot(v) / 49 };
      // 6.4-6.5: the eclipser comes from the east for the Moon (the shadow overtaken), from the west for the Sun
      const sp = Pl.contactTip(kind, 'sparsha', v), mo = Pl.contactTip(kind, 'moksha', v);
      const s = lunar ? 1 : -1;
      assert.ok(dist(sp, { x: 49 * s * e.x, y: 49 * s * e.y }) < 1e-12, `${kind} sparśa v=${v}`);
      assert.ok(dist(mo, { x: -49 * s * e.x, y: -49 * s * e.y }) < 1e-12, `${kind} mokṣa v=${v}`);
      // 6.6, 6.8: the north side of either cord is the frame's north
      for (const tip of [sp, mo]) assert.ok(dist(Pl.northOfCord(tip), n) < 1e-12);
      for (const beta of [-30, -4, 4, 30]) {
        const b = lunar ? -beta : beta;                                         // 6.8
        const tip = Pl.middleTip(kind, v, beta), M = { x: tip.x * Math.abs(b) / 49, y: tip.y * Math.abs(b) / 49 };
        if (v !== 0) assert.ok(dist(M, { x: b * n.x, y: b * n.y }) < 1e-12, `${kind} middle v=${v} β=${beta}`);
        // the other parse: "for the Moon and the Sun reversed" taken as the Sun eastward when they agree
        const agree = (v > 0) === (beta > 0), eastOther = lunar ? !agree : agree;
        const tipO = { x: (eastOther ? 1 : -1) * Math.abs(v), y: (b >= 0 ? 1 : -1) * foot(v) };
        if (v !== 0 && dist({ x: tipO.x * Math.abs(b) / 49, y: tipO.y * Math.abs(b) / 49 }, { x: b * n.x, y: b * n.y }) > 1e-9) other++;
      }
    }
  }
  assert.ok(other > 100, 'the reversed parse of 6.9 does not give one frame');
});

test('[THEOREM 6.10-6.11 = 4.20] at the middle the text\'s latitude tip is the eclipser\'s centre by the text\'s own quantities; what it covers is the channa', () => {
  for (const E of cases()) {
    const D = Pl.parilekha(E);
    assert.ok(Math.abs(D.madhya.distance * D.phala - Math.abs(E.latitude)) < 1e-9);
    assert.ok(Math.abs(D.madhya.grasa * D.phala - E.channa) < 1e-9);
    if (D.path) assert.ok(dist(D.vikshepa.madhya.tip, D.instantContacts.madhya) < 1e-6);
  }
});

test('[THEOREM 6.15-6.16] the two fish meet at the centre of the one circle through the three latitude tips', () => {
  const tri = [[{ x: 3, y: 1 }, { x: 0, y: -2 }, { x: -4, y: 2 }], [{ x: 55, y: -14 }, { x: 0, y: -0.4 }, { x: -55, y: 4 }]];
  for (const [A, B, C] of tri) {
    const m = Pl.matsya(A, B, C);
    for (const P of [A, B, C]) assert.ok(Math.abs(dist(P, m.centre) - m.radius) < 1e-9 * m.radius);
  }
  assert.equal(Pl.matsya({ x: 0, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 2 }), null, 'in a line: a straight path');
});

test('[THEOREM 6.17-6.22] the rod of half-sum − grāsa reaches the path where that grāsa is (4.22-4.23 on the instants path); nimīlana and unmīlana at half the difference', () => {
  for (const E of cases().filter((x) => x.possible)) {
    const D = Pl.parilekha(E);
    for (const side of ['sparsha', 'moksha']) {
      const g = 0.4 * D.madhya.grasa;
      const a = Pl.grasaPoint(D, E, g, side), b = Pl.grasaPoint(D, E, g, side, { path: 'matsya' });
      assert.ok(Math.abs(len(a.centre) - (D.circles.samasa - g)) < 1e-6, `instants ${side}`);
      assert.ok(Math.abs(len(b.centre) - (D.circles.samasa - g)) < 1e-9, `matsya ${side}`);
      assert.ok((side === 'sparsha') === (a.at < E.middle));
    }
    if (D.nimilana) {
      assert.ok(Math.abs(len(D.nimilana.centre) - (D.grahakaRadius - D.circles.grahya)) < 1e-6);
      assert.ok(Math.abs(D.nimilana.at - E.contacts.nimilana) < 1e-6 && Math.abs(D.unmilana.at - E.contacts.unmilana) < 1e-6, '6.20-6.22 = 4.12\'s vimardārdha');
    }
  }
});

test('[MEASURED 6.6-6.7, 6.14-6.16] the text\'s construction against the path by the text\'s own quantities: the latitude tips lie √(half-sum² + β²) from the centre where the eclipser touches at the half-sum; the three-point arc stays within a minute of the path', (t) => {
  const rows = [];
  for (const E of cases().filter((x) => x.possible)) {
    const D = Pl.parilekha(E), m = D.path.matsya;
    let gap = 0;
    for (const p of D.path.instants) gap = Math.max(gap, Math.abs(dist(p, m.centre) - m.radius));
    for (const side of ['sparsha', 'moksha']) {
      const W = D.vikshepa[side].tip, beta = D.vikshepa[side].minutes / D.phala;
      assert.ok(Math.abs(len(W) - Math.sqrt(D.circles.samasa ** 2 + beta ** 2)) < 1e-9, '6.6: laid at the samāsa circle, at right angles');
      assert.ok(Math.abs(len(D.instantContacts[side]) - D.circles.samasa) < 1e-6, 'the instants path touches at the half-sum');
      assert.ok(Math.abs(len(D.touch[side]) - D.circles.grahya) < 1e-12, '6.7 on the eclipsed body\'s circle');
    }
    const gapMin = gap * D.phala;
    assert.ok(gapMin < 1.0, `arc gap ${gapMin}′`);
    rows.push(`${E.kind} ${D.units}: arc vs instants ≤ ${gapMin.toFixed(2)}′`);
  }
  t.diagnostic(rows.join('; '));
});

test('[text 6.23] the colours: under half smoky, over half black, releasing dark copper, whole tawny', () => {
  assert.equal(Pl.varna(0.3, false), 'sadhumra'); assert.equal(Pl.varna(0.7, false), 'krishna');
  assert.equal(Pl.varna(0.7, true), 'krishnatamra'); assert.equal(Pl.varna(1.2, false), 'kapila');
  const D = Pl.parilekha(Gr.lunarEclipse(kali(2026, 3, 3), UJJAIN));
  assert.equal(D.varna, 'kapila', 'total');
  assert.match(edition, /अर्धादूने सधूम्रं स्यात्/); assert.match(edition, /विमुञ्चतः कृष्णताम्रं/);
});

test('[units 4.26] aṅgulas when the eclipsed body is up at the middle, minutes when it is down; "kala" on request', () => {
  const up = Pl.parilekha(Gr.solarEclipse(1643524 + 0.5, { latitude: 10.8, deshantara: -2 }));
  assert.equal(up.units, 'angula'); assert.ok(up.phala > 1.5 && up.phala <= 2.5);
  assert.ok(up.circles.samasa < Pl.TEXT.valanaCircle, 'the samāsa circle inside the 49');
  const down = Pl.parilekha(Gr.lunarEclipse(kali(2026, 8, 28), UJJAIN));
  assert.equal(down.units, 'kala'); assert.equal(down.phala, 1);
  assert.equal(Pl.parilekha(Gr.solarEclipse(1643524 + 0.5, { latitude: 10.8, deshantara: -2 }), { units: 'kala' }).units, 'kala');
});

test('[picture] the SVG: one svg, the three circles, both paths, numbers only; the sky view is the board view mirrored east–west (6.12 as this edition reads it)', () => {
  const D = Pl.parilekha(Gr.lunarEclipse(kali(2026, 3, 3), UJJAIN));
  const sky = Pl.svg(D), board = Pl.svg(D, { view: 'board' });
  for (const s of [sky, board]) {
    assert.ok(s.startsWith('<svg') && s.endsWith('</svg>'));
    assert.ok(!/NaN|undefined|Infinity/.test(s));
    assert.ok((s.match(/<circle /g) || []).length >= 8);
    assert.ok(/<polyline /.test(s) && /<path d="M /.test(s));
  }
  const px = (s) => Number(s.match(/<polyline points="([-\d.]+),/)[1]);
  assert.ok(Math.abs(px(sky) + px(board)) < 0.02, 'x mirrored');
  const none = Pl.parilekha(Gr.lunarEclipse(kali(2026, 3, 3), UJJAIN));
  assert.ok(none.possible);
});

test('[FRAME] ss-parilekha.js is sovereign: it requires only ss-grahana.js, names no modern source, and has no trigonometry', () => {
  const text = fs.readFileSync(path.join(__dirname, 'ss-parilekha.js'), 'utf8');
  assert.equal(/\b(?:DE4\d\d|VSOP\d*|ELP\d*|Swiss|swisseph|Gaia|IERS|DrikTier)\b|finals\.all|DeltaT|astronomy-engine/.test(text), false);
  const reqs = [...text.matchAll(/\brequire\s*\(\s*["']([^"']+)["']\s*\)/g)].map((m) => m[1]);
  assert.deepEqual(reqs, ['./ss-grahana.js']);
  assert.equal(/Math\.(?:sin|cos|tan|asin|acos|atan|atan2|hypot)\b/.test(text), false);
});
