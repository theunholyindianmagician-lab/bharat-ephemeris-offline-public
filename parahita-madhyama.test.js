'use strict';
/*
 * parahita-madhyama.test.js — Āryabhaṭa's integers, the Śakābda-saṃskāra and Parameśvara's fractions,
 * against numbers the TEXTS state. No modern ephemeris, no ΔT.
 *
 * Sources:
 *   [AB]  Āryabhaṭīya, Gītikāpāda 3: 4,320,000 Sun, 57,753,336 Moon, 1,582,237,500 rotations (editions/aryabhata-full-edition.html:67);
 *         apogee 488,219 and node 232,226 as printed in the standard editions (not in a local edition — certified by [PE] below).
 *   [JM]  Nīlakaṇṭha, Jyotirmīmāṃsā (Sarma 1977) p.11 (Śakābda-saṃskāra verse, Kaṭapayādi words), p.34 vv.87-92 and p.35 (Parameśvara's
 *         epoch at ahargaṇa 16,51,700 and his fractions 1/5, 1/12) — corpus/jyotirmimamsa/eclipses.json.
 *   [HD]  Haridatta's Parahita cycle: 576 years = 210,389 days, 'dhījagannūpura'; 7500 of them are a yuga.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
const P = require('./parahita-madhyama.js');
const KP = require('./katapayadi.js');
const corpus = JSON.parse(fs.readFileSync(path.join(__dirname, 'corpus', 'jyotirmimamsa', 'eclipses.json'), 'utf8'));
const v = (w) => Number(KP.decodeWord(w).value);

test('[AB][HD] civil days are rotations minus Sun revolutions; the 210,389-day cycle is 1/7500 of the yuga', () => {
  assert.equal(1582237500n - 4320000n, P.YUGA_DAYS);
  assert.equal(P.YUGA_DAYS, 1577917500n);
  assert.equal(KP.decodeWord('dhījagannūpura').value, 210389n);
  assert.equal(210389n * 7500n, P.YUGA_DAYS);
  assert.equal(KALI_START(), 1183438125n);                           // ¾ of the yuga, an integer number of days
});
function KALI_START() { return P.YUGA_DAYS * 3n / 4n; }

test('[AB] at the Kali start the Sun and Moon are at 0°, the apogee at Karkaṭa 0° (90°), the node at Tulā 0° (180°) — exactly, as a consequence of the integers', () => {
  for (const [b, deg] of [['sun', 0n], ['moon', 0n], ['apogee', 90n], ['node', 180n]]) {
    const x = P.meanArcsec(b, 0n);
    assert.equal(x.num % x.den, 0n, `${b}: an exact whole number of arcseconds`);
    assert.equal(x.num / x.den, deg * 3600n, b);
  }
  // the same rule as congruences: 3R ≡ 1 (mod 4) for the apogee, ≡ 2 for the node, ≡ 0 for Sun and Moon
  assert.equal((3n * P.REV.apogee) % 4n, 1n);
  assert.equal((3n * P.REV.node) % 4n, 2n);
  assert.equal((3n * P.REV.sun) % 4n, 0n);
  assert.equal((3n * P.REV.moon) % 4n, 0n);
});

test('[WHEEL] mean places are exact residues on the civil-day wheel and return to themselves after one yuga', () => {
  const Y = P.YUGA_DAYS * P.SPD;
  for (const b of ['sun', 'moon', 'apogee', 'node']) {
    for (const S of [0n, 1n, 1651700n * P.SPD + 123456789n, 999999999999999n]) {
      const a = P.meanArcsec(b, S), z = P.meanArcsec(b, S + Y), w = P.meanArcsec(b, S - 7n * Y);
      assert.equal(a.den, z.den); assert.equal(a.num, z.num, `${b}: +1 yuga`);
      assert.equal(a.num, w.num, `${b}: −7 yugas`);
    }
  }
  // the Sun and Moon also meet their Kali-start places every half yuga (even revolutions); the apogee (odd) only every yuga
  const half = P.YUGA_DAYS / 2n * P.SPD;
  assert.equal(P.meanArcsec('sun', half).num, P.meanArcsec('sun', 0n).num);
  assert.equal(P.meanArcsec('moon', half).num, P.meanArcsec('moon', 0n).num);
  assert.notEqual(P.meanArcsec('apogee', half).num, P.meanArcsec('apogee', 0n).num);
});

test('[RELATION] a Śakābda rate of r′ a year is 200·r revolutions a yuga; Parameśvara\'s three are not whole numbers — his bīja opens the wheel', () => {
  const f = (x) => Number(x.num * 1000000n / x.den) / 1e6;
  assert.equal(f(P.sakabdaRevPerYuga('moon')).toFixed(3), '16.941');      // 200 × 9/85 × 4/5
  assert.equal(f(P.sakabdaRevPerYuga('apogee')).toFixed(3), '97.015');    // 200 × 65/134
  assert.equal(f(P.sakabdaRevPerYuga('node')).toFixed(3), '74.479');      // 200 × 13/32 × 11/12
  assert.equal(f(P.sakabdaRevPerYuga('moon', { parameshvara: false })).toFixed(3), '21.176');
  assert.equal(P.sakabdaRevPerYuga('sun').num, 0n);
  for (const b of ['moon', 'apogee', 'node']) { const x = P.sakabdaRevPerYuga(b); assert.notEqual(x.num % x.den, 0n, `${b}: not a whole number of revolutions`); }
  // one revolution a yuga is 0.005′ = 0.3″ a year
  assert.equal(21600n * 60n * 10n / P.REV.sun, 3n);                        // ×10: 3 tenths of an arcsecond
});

test('[JM] every number of the Śakābda-saṃskāra verse is a Kaṭapayādi word, and the module holds exactly what the words decode to', () => {
  assert.equal(v('vāgbhāva'), 444);
  assert.equal(BigInt(v('vāgbhāva')), P.SAKA_ZERO);
  const moonApogeeNode = { mul: ['dhana', 'śata', 'laya'], div: ['manda', 'vailakṣya', 'rāga'] };
  assert.deepEqual(moonApogeeNode.mul.map(v), [9, 65, 13]);
  assert.deepEqual(moonApogeeNode.div.map(v), [85, 134, 32]);
  assert.deepEqual(['moon', 'apogee', 'node'].map((b) => [Number(P.SAKABDA[b].mul), Number(P.SAKABDA[b].div)]), [[9, 85], [65, 134], [13, 32]]);
  assert.deepEqual(['śobhā', 'nīrūḍha', 'saṃvid', 'gaṇaka', 'nara'].map(v), [45, 420, 47, 153, 20]);
  assert.equal(v('māgara'), 235);
  // and the corpus (Sarma's printed digits above the words) says the same
  const s = corpus.sakabda_samskara;
  assert.deepEqual(s.moon_apogee_node.multipliers, [9, 65, 13]);
  assert.deepEqual(s.moon_apogee_node.divisors, [85, 134, 32]);
  assert.deepEqual(s.planets.multipliers, [45, 420, 47, 153, 20]);
  assert.equal(s.planets.divisor, 235);
  assert.equal(s.zero_year_saka, 444);
});

// Parameśvara's four stated values at ahargaṇa 16,51,700, as total minutes of arc.
const stated = Object.fromEntries(Object.entries(corpus.parameshvara_epoch.values).map(([k, x]) => [k, (x.rashi_index * 30 + x.degrees) * 60 + x.minutes]));
const AT = BigInt(corpus.parameshvara_epoch.ahargana_printed) * P.SPD;
const minutesOf = (b, opts) => { const d = P.toDegMin(P.parahitaArcsec(b, AT, opts)); return d.degrees * 60 + d.minutes; };

test('[PE] Āryabhaṭa\'s integers + the Śakābda rule + Parameśvara\'s 1/5 and 1/12 reproduce his four stated epoch values at 16,51,700 to the nearest minute', () => {
  assert.equal(Number(P.sakabdaYears(AT).num) / Number(P.sakabdaYears(AT).den) > 899 && Number(P.sakabdaYears(AT).num) / Number(P.sakabdaYears(AT).den) < 899.01, true, 'Śaka 1343 elapsed: n = 899.0007 (his epoch is the Meṣa saṅkrānti)');
  let worst = 0;
  for (const b of ['sun', 'moon', 'apogee', 'node']) {
    const got = minutesOf(b), diff = got - stated[b];
    worst = Math.max(worst, Math.abs(diff));
    assert.equal(Math.round(got), stated[b], `${b}: computed ${got.toFixed(2)}′ vs stated ${stated[b]}′`);
  }
  assert.ok(worst < 0.5, `worst difference ${worst.toFixed(2)}′`);
});

test('[PE] negative controls: without the saṃskāra, or without his fractions, or with one integer changed, the reproduction fails — by a lot', () => {
  const noSamskara = (b) => { const d = P.toDegMin(P.meanArcsec(b, AT)); return d.degrees * 60 + d.minutes; };
  assert.ok(Math.abs(noSamskara('moon') - stated.moon) > 60, 'plain Āryabhaṭa Moon is more than a degree off (JM p.35: why a saṃskāra was needed)');
  assert.ok(Math.abs(noSamskara('apogee') - stated.apogee) > 400);
  assert.ok(Math.abs(noSamskara('node') - stated.node) > 300);
  assert.ok(Math.abs(minutesOf('moon', { parameshvara: false }) - stated.moon) > 15, 'the full Parahita minutes miss the Moon by ~19′ — the 1/5 is needed');
  assert.ok(Math.abs(minutesOf('node', { parameshvara: false }) - stated.node) > 25, 'and the node by ~30′ — the 1/12 is needed');
  const CD = P.YUGA_DAYS, A0 = CD * 3n / 4n, A = BigInt(corpus.parameshvara_epoch.ahargana_printed);
  for (const [b, R] of [['apogee', P.REV.apogee], ['node', P.REV.node], ['moon', P.REV.moon]]) {
    for (const dR of [-1n, 1n]) {
      const shifted = ((A0 + A) * (R + dR)) % CD;                      // fraction of a revolution, ×CD
      const base = ((A0 + A) * R) % CD;
      const degShift = Number(((shifted - base + CD) % CD) * 360n * 1000n / CD) / 1000;
      assert.ok(Math.min(degShift, 360 - degShift) > 89, `${b} ${dR > 0n ? '+' : ''}${dR}: moves the epoch place by ${degShift}° (a quarter circle: ¾ of a revolution)`);
    }
  }
});

test('[JM] the mean-syzygy gate: every solar record is nearer a mean new moon, every lunar record a mean full moon, all within 2 days — and the numbers are published, whatever they are', () => {
  const offs = [];
  for (const r of corpus.records) {
    const n = P.meanSyzygyOffsetDays(r.printed_number, 'new'), f = P.meanSyzygyOffsetDays(r.printed_number, 'full');
    const want = r.kind === 'solar' ? n : f, other = r.kind === 'solar' ? f : n;
    assert.ok(Math.abs(want) < Math.abs(other), `${r.id}: nearer the wrong syzygy`);
    assert.ok(Math.abs(want) <= 2, `${r.id}: ${want} d`);
    offs.push([r.id, want]);
  }
  const by = Object.fromEntries(offs);
  assert.equal(by['SDip-82'].toFixed(3), '1.834');                    // the largest; flagged in the corpus
  assert.equal(by['JM-Harihara'].toFixed(3), '-1.106');
  assert.equal(by['JM-Syanandurapura'].toFixed(3), '-0.672');
  assert.equal(by['SDip-72'].toFixed(3), '-0.193');
  // The Sun's and Moon's own equations can move a true syzygy from the mean by at most this many days on epicycles of 13.5/360 and 31.5/360
  // (sizes the research attributes to Āryabhaṭa; not checked here against a printed Āryabhaṭīya), so records further out than that are not
  // explained by the mean+epicycle model alone. How many there are is a result, not a tuning target:
  const maxEq = (Math.asin(13.5 / 360) + Math.asin(31.5 / 360)) * 180 / Math.PI;           // degrees
  const relMotion = Number(P.REV.moon - P.REV.sun) * 360 / Number(P.YUGA_DAYS);              // degrees per day
  const bound = maxEq / relMotion;
  assert.equal(bound.toFixed(3), '0.588');
  assert.equal(offs.filter(([, d]) => Math.abs(d) > bound).length, 6);
});

test('[JM] Nīlakaṇṭha\'s own two eclipses lie farther from the mean new moon than any epicycle can account for — the direction of his remark that the Gītikā integers fail there', () => {
  for (const id of ['JM-Syanandurapura', 'JM-Harihara']) {
    const r = corpus.records.find((x) => x.id === id);
    assert.ok(Math.abs(P.meanSyzygyOffsetDays(r.printed_number, 'new')) > 0.588, id);
  }
});
