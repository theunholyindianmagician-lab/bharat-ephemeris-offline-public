'use strict';
// sukshma-kala.js — the resolution the vargas demand: exact indices and margins checked against math-core's computeVarga
// on random longitudes and on the exact boundaries; the 108-lattice identities (pāda ↔ navāṃśa, the 27 → 9 lord
// projection against dasha.js); the time equivalents; the gate (no import, no trigonometry).
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const SK = require('./sukshma-kala.js');
const M = require('./math-core.js');
const DA = require('./dasha.js');

let x = 20261009;
const rnd = () => ((x = (x * 1103515245 + 12345) % 2147483648) / 2147483648);

test('the sixteen vargas of BPHS ch.6 and the two standard higher divisions, each with its rule tag; part widths exact', () => {
  assert.deepEqual(SK.VARGAS.map((v) => v.code), ['D1', 'D2', 'D3', 'D4', 'D7', 'D9', 'D10', 'D12', 'D16', 'D20', 'D24', 'D27', 'D30', 'D40', 'D45', 'D60', 'D144', 'D150']);
  assert.deepEqual(SK.VARGAS.filter((v) => v.rule === 'standard').map((v) => v.code), ['D16', 'D24', 'D27', 'D144', 'D150'], 'where the edition is silent or variant (notes on each)');
  for (const c of ['D16', 'D24', 'D27', 'D60', 'D144', 'D150']) assert.ok(SK.VARGAS.find((v) => v.code === c).note, `${c} carries its note`);
  assert.equal(SK.partWidth('D60').arcsec, 1800); assert.equal(SK.partWidth('D150').arcsec, 720); assert.equal(SK.partWidth('D144').arcsec, 750);
  assert.equal(SK.partWidth('D9').arcsec, 12000); assert.equal(SK.partWidth('D27').exact, true); assert.equal(SK.partWidth('D7').exact, false);   // 108e9 µas ÷ 27 = 4e9 exactly; ÷ 7 is not
  assert.equal(SK.partWidth('D30').unequal, true);
  assert.throws(() => SK.index(10, 'D5'), /unknown varga/);
});

test('every rule equals math-core computeVarga on 6,000 random longitudes and at every exact part boundary (D-144 included)', () => {
  const codes = SK.VARGAS.map((v) => v.code).filter((c) => c !== 'D150');
  for (let i = 0; i < 6000; i++) {
    const lon = rnd() * 360;
    for (const c of codes) assert.equal(SK.index(lon, c), M.computeVarga(lon, c), `${c} at ${lon}`);
  }
  for (const c of codes) {
    const v = SK.VARGAS.find((q) => q.code === c);
    if (v.unequal) continue;
    for (let s = 0; s < 12; s++) for (let p = 0; p <= v.n; p++) {
      const lon = s * 30 + p * 30 / v.n;                                   // the boundary itself belongs to the upper part (floor)
      if (lon >= 360) continue;
      const m = SK.margin(lon, c), w = SK.partWidth(c);
      if (w.exact) { assert.equal(m.marginMicro, 0n, `${c}: a boundary has zero margin`); assert.equal(SK.index(lon, c), M.computeVarga(lon, c), `${c} boundary ${lon}`); }
      else assert.ok(m.marginMicro <= 1n, `${c}: an inexact boundary is within the one-µas rounding of the float`);
    }
  }
  // the triṃśāṃśa's unequal arcs: 5/5/8/7/5 in odd signs, 5/7/8/5/5 in even signs (the edges have zero margin)
  for (const [sign, edges] of [[0, [5, 10, 18, 25]], [1, [5, 12, 20, 25]]]) for (const e of edges) assert.equal(SK.margin(sign * 30 + e, 'D30').marginMicro, 0n);
  assert.equal(SK.margin(2.5, 'D30').marginArcsec, 9000); assert.equal(SK.margin(30 + 16, 'D30').marginArcsec, 4 * 3600);
});

test('margins are exact: the ṣaṣṭyāṃśa of 10°20′ Kanyā (the edition\'s worked example) is the 21st part, Vṛṣabha, 10′ from its upper edge', () => {
  const lon = 150 + 10 + 20 / 60;
  const m = SK.margin(lon, 'D60');
  assert.equal(m.part, 20); assert.equal(SK.index(lon, 'D60'), 1);              // (Kanyā 5 + 20) mod 12 = Vṛṣabha
  assert.equal(m.marginArcsec, 600); assert.equal(m.upperDeg, 160.5); assert.equal(m.lowerDeg, 160);
  const a = SK.assess(lon, 'D60', 599); assert.equal(a.decided, true); assert.equal(SK.assess(lon, 'D60', 600).decided, false);
  assert.ok(Math.abs(SK.assess(lon, 'D60', 5640).partsSpanned - 5640 / 1800) < 1e-12, 'a 94′ budget spans 3.13 ṣaṣṭyāṃśas');
});

test('the 108-lattice: pāda ↔ navāṃśa for every cell and 3,000 random longitudes; the lords are dasha.js\'s; the years sum to 120', () => {
  assert.equal(SK.LATTICE.cells, 108); assert.equal(SK.LATTICE.padaArcmin, 200); assert.equal(SK.LATTICE.totalYears, 120);
  assert.equal(Number(SK.LATTICE.padaMicro), 12000000000);
  for (let k = 0; k < 108; k++) {
    const lon = k * 360 / 108 + 1.2345;                                        // inside cell k
    const c = SK.cell(lon);
    assert.equal(c.k, k); assert.equal(c.nakshatra, Math.floor(k / 4) + 1); assert.equal(c.pada, (k % 4) + 1); assert.equal(c.rashi, Math.floor(k / 9)); assert.equal(c.navamsha, k % 9);
    assert.equal(c.navamsha, SK.margin(lon, 'D9').part, 'the navāṃśa part within the sign is k mod 9 [theorem]');
    assert.equal(c.lordIndex, (c.nakshatra - 1) % 9);
    assert.equal(c.lord, DA.LORDS[DA.lordOfNakshatra(c.nakshatra)], `the lord of nakṣatra ${c.nakshatra} as dasha.js (BPHS 46.12-46.13)`);
  }
  for (let i = 0; i < 3000; i++) { const lon = rnd() * 360, c = SK.cell(lon); assert.equal(c.navamsha, SK.margin(lon, 'D9').part); assert.equal(c.navamshaSign, M.computeVarga(lon, 'D9')); }
  assert.deepEqual(SK.LORDS, ['Ketu', 'Śukra', 'Sūrya', 'Candra', 'Maṅgala', 'Rāhu', 'Guru', 'Śani', 'Budha']);
  // one minute of arc of the Moon at birth is years × the year ÷ 800 days of daśā (46.16): Śukra 9.13 d, Sūrya 2.74 d with the text's year
  assert.ok(Math.abs(SK.dashaDaysPerArcmin('Śukra') - 20 * (1577917828 / 4320000) / 800) < 1e-12);
  assert.ok(Math.abs(SK.dashaDaysPerArcmin('Sūrya') - 2.74) < 0.01);
});

test('the time a part is worth, for given rates: D-60 at a lagna moving 0.25°/min is 120 s, the Moon at 13.2° a day 54.5 min; D-150 is 48 s and 21.8 min', () => {
  const r = { lagnaDegPerMin: 0.25, moonDegPerDay: 13.2, sunDegPerDay: 0.9856 };
  const d60 = SK.resolution('D60', r), d150 = SK.resolution('D150', r), d30 = SK.resolution('D30', r);
  assert.equal(d60.partArcmin, 30); assert.ok(Math.abs(d60.lagnaSeconds - 120) < 1e-9); assert.ok(Math.abs(d60.moonMinutes - 54.545) < 0.01); assert.ok(Math.abs(d60.sunHours - 12.175) < 0.01);
  assert.equal(d150.partArcmin, 12); assert.ok(Math.abs(d150.lagnaSeconds - 48) < 1e-9); assert.ok(Math.abs(d150.moonMinutes - 21.818) < 0.01);
  assert.equal(d30.partDeg, 5); assert.equal(d30.unequal, true);
  assert.equal(SK.resolution('D9', {}).lagnaSeconds, undefined, 'no rate, no time');
});

test('chart(): every body in every varga under its own budget; a zero budget decides everything off a boundary', () => {
  const ch = SK.chart({ lagna: 158.6091, sun: 170.8734, moon: 150.7797 }, ['D9', 'D60', 'D150'], { lagna: 2, sun: 0.9, moon: 5634 });
  assert.deepEqual(Object.keys(ch), ['lagna', 'sun', 'moon']); assert.deepEqual(Object.keys(ch.moon), ['D9', 'D60', 'D150']);
  assert.equal(ch.sun.D60.budgetArcsec, 0.9); assert.equal(typeof ch.lagna.D150.decided, 'boolean');
  assert.equal(ch.moon.D60.decided, false, "a 94′ Moon budget leaves the ṣaṣṭyāṃśa undecided");
  assert.equal(SK.chart({ a: 10.1 }, ['D60']).a.D60.decided, true);
});

test('gate: the module imports nothing, calls no trigonometry and names no modern ephemeris; the longitude guard', () => {
  const src = fs.readFileSync(path.join(__dirname, 'sukshma-kala.js'), 'utf8');
  assert.equal(/\brequire\s*\(/.test(src), false); assert.equal((src.match(/Math\.(?:sin|cos|tan|asin|acos|atan2|atan)\b/g) || []).length, 0);
  assert.equal(/\b(?:vsop\d*|elp\d*|swisseph|de4\d\d)\b/i.test(src.replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, '')), false);
  assert.throws(() => SK.index(NaN, 'D9'), /finite/); assert.throws(() => SK.assess(10, 'D9', -1), /nonnegative/);
  assert.equal(SK.index(-1, 'D1'), 11); assert.equal(SK.index(360, 'D1'), 0);
});

test('the ring tower in the text\'s numbers: ν₃ of every count the texts give the engine — the Sun, the years, the day\'s prāṇas, 27 and 108 sit at k = 3; both canons\' day counts are units', () => {
  const K = require('./kala-dvara.js'), S = require('./sphuta.js'), PM = require('./parahita-madhyama.js');
  const m = K.mana('surya'), a = K.mana('aryabhata');
  assert.equal(SK.nu3(27), 3); assert.equal(SK.nu3(108n), 3); assert.equal(SK.nu3(9), 2); assert.equal(SK.nu3(-54), 3); assert.equal(SK.nu3(7), 0);
  assert.throws(() => SK.nu3(0), /not finite/);
  const t = Object.fromEntries(SK.valuationTable([
    { name: 'sun', value: m.sun }, { name: 'moon', value: m.moon }, { name: 'risings', value: m.nakshatra }, { name: 'savana', value: m.savana }, { name: 'tithi', value: m.tithi },
    { name: 'sauraMasa', value: m.sauraMasa }, { name: 'aryaRisings', value: a.nakshatra }, { name: 'aryaSavana', value: a.savana }, { name: 'spd', value: S.SPD }, { name: 'pranas', value: 21600n },
    { name: 'arcsec', value: 1296000n }, { name: 'nakshatraBhoga', value: 800n }, { name: 'tithiBhoga', value: 720n }, { name: 'cells', value: 108n }, { name: 'nakshatras', value: 27n },
    { name: 'lords', value: 9n }, { name: 'vimshottari', value: 120n }, { name: 'ashtottari', value: 108n }, { name: 'R', value: 3438n }, { name: 'madhavaR', value: 12375888n },
    { name: 'librations', value: 600n }, { name: 'yugaYears', value: 4320000n }, { name: 'moonApogee', value: S.REV.moonApogee }, { name: 'node', value: S.REV.node }, { name: 'parahitaNode', value: PM.REV.node },
  ]).map((r) => [r.name, r]));
  // k = 3, the owner's "Savitar gate", is the Sun's level in the text: 4,320,000 = 2^8·3^3·5^4
  for (const n of ['sun', 'yugaYears', 'pranas', 'cells', 'nakshatras', 'ashtottari']) assert.equal(t[n].nu3, 3, n);
  assert.equal(t.sun.threeFreePart, '160000');
  // the clock counts are units mod 3 (both canons): the kuṭṭaka on a day count always solves [theorem]
  for (const n of ['savana', 'risings', 'aryaRisings', 'aryaSavana']) assert.equal(t[n].unitMod3, n === 'savana' || n === 'risings', n);
  assert.equal(t.savana.nu3, 0); assert.equal(t.risings.nu3, 0); assert.equal(t.aryaSavana.nu3, 1); assert.equal(t.aryaRisings.nu3, 1);
  // the Moon's counts carry one 3; the apogee and node counts of both canons carry none; the spanda lattice carries 3^8
  assert.equal(t.moon.nu3, 1); assert.equal(t.moonApogee.nu3, 0); assert.equal(t.node.nu3, 0); assert.equal(t.parahitaNode.nu3, 0); assert.equal(t.spd.nu3, 8);
  assert.equal(t.arcsec.nu3, 4); assert.equal(t.tithi.nu3, 2); assert.equal(t.sauraMasa.nu3, 4); assert.equal(t.lords.nu3, 2); assert.equal(t.vimshottari.nu3, 1); assert.equal(t.R.nu3, 2);
  assert.match(SK.TOWER_NOTE, /units/);
});
