'use strict';
/*
 * utsava.test.js — saṅkrānti, ṣaḍaśītimukha, ayana and festival days (utsava.js). The SS parts are checked against the
 * verse numbers (corpus/surya-siddhanta/numbers.json, "plain"); the festival rules are common practice and are tested
 * only for being applied consistently, never against a printed calendar.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
const U = require('./utsava.js');
const P = require('./panchanga.js');
const K = require('./kala-dvara.js');
const reg = JSON.parse(fs.readFileSync(path.join(__dirname, 'corpus', 'surya-siddhanta', 'numbers.json'), 'utf8'));
const edition = fs.readFileSync(path.join(__dirname, 'editions', 'surya-siddhanta-full-edition.html'), 'utf8');
const plain = (v, what) => reg.plain.find((x) => x.v === v && x.what.startsWith(what)).n;
const UJJAYINI = { latitude: 23.18, deshantara: 0 };
const day = (y, m, d) => K.kaliDayFromCivil({ calendar: 'gregorian', year: y, month: m, day: d });
const block = (id) => edition.match(new RegExp(`<article class="verse" id="${id}">([\\s\\S]*?)</article>`))[1];

test('SS 14.4-14.6 are one computation: Tulā 0° + k × 86° gives 14.5\'s four degrees, and 4 × 86 + 16 = 360', () => {
  const step = plain('14.4', 'span'), count = plain('14.4', 'number');
  const want = reg.plain.filter((x) => x.v === '14.5').map((x) => x.rashi * 30 + x.n);
  const got = Array.from({ length: count }, (_, k) => (180 + step * (k + 1)) % 360);
  assert.deepEqual(got, want);
  assert.equal(count * step + plain('14.6', 'remaining'), 360);
  assert.deepEqual(U.SHADASHITI.map((x) => x.longitude), want);
});

test('SS 4.1-4.3 and 14.11: the Sun\'s disc is 32′25″ and every saṅkrānti\'s puṇya is 16.4436 nāḍī each side', () => {
  const mean = plain('4.1', "Sun's disc") * (4320000 / 57753336) / plain('4.3', 'divisor');
  assert.ok(Math.abs(mean - 32.4137) < 1e-3);
  const exact = 6500 * 1577917828 / (57753336 * 10800);           // the true motion cancels between 4.2 and 14.11
  const s = U.sankrantis(day(2026, 1, 1), day(2027, 1, 1));
  assert.equal(s.length, 12);
  for (const x of s) {
    assert.ok(Math.abs(x.punya.halfNadis - exact) < 1e-6, `${x.rashi}: ${x.punya.halfNadis}`);
    assert.ok(Math.abs(x.punya.to - x.at - (x.at - x.punya.from)) < 1e-9);
  }
  assert.ok(s.some((x) => Math.abs(x.punya.discArcmin - mean) > 0.3), 'the disc itself does vary with the true motion');
});

test('SS 14.7-14.9: viṣuva at Meṣa and Tulā, ayana at Makara and Karka; the sky\'s solstice comes earlier by the ayanāṃśa', () => {
  const s = U.sankrantis(day(2026, 1, 1), day(2027, 1, 1));
  const kind = (r) => s.find((x) => x.rashi === r).kind;
  assert.equal(kind('Meṣa'), 'viṣuva'); assert.equal(kind('Tulā'), 'viṣuva');
  assert.match(kind('Makara'), /uttarāyaṇa/); assert.match(kind('Karka'), /dakṣiṇāyana/);
  const sky = U.cardinalInSky(day(2026, 1, 1), day(2027, 1, 1)).find((x) => x.sayana === 270);
  const mk = U.sankrantis(day(2026, 6, 1), day(2027, 6, 1)).find((x) => x.rashi === 'Makara');
  assert.ok(mk.at - sky.at > 20 && mk.at - sky.at < 26, `${(mk.at - sky.at).toFixed(1)} days`);
});

test('SS 14.6: the pitṛ days run from Kanyā 14° to Tulā 0°, sixteen days of the Sun', () => {
  const [w] = U.pitrDays(day(2026, 9, 1), day(2026, 11, 1));
  assert.ok(Math.abs(P.placesAt(w.from).sun - 164) < 1e-5 && Math.abs(P.placesAt(w.to).sun - 180) < 1e-5);
  assert.ok(w.to - w.from > 15.5 && w.to - w.from < 17.5);
});

test('the corrected verses stay corrected: 14.5 reads animiṣa, 14.11 takes the disc and not a sign of 1800′', () => {
  const b5 = block('v14-05'), b11 = block('v14-11').replace(/<p><span class="lbl decode fix">[\s\S]*?<\/p>/g, '');
  assert.match(b5, /द्वाविंशेऽनिमिषस्य/);
  assert.doesNotMatch(b5.replace(/<p><span class="lbl decode fix">[\s\S]*?<\/p>/g, ''), /text: nimiṣa/);
  assert.doesNotMatch(b11, /1800′/);
  assert.match(b11, /32′ 24\.8″/);
});

test('2026 at Ujjayinī: each rule falls once, in its month, with its tithi in its window unless flagged', () => {
  const t1 = day(2026, 1, 1), t2 = day(2027, 1, 1);
  const fs_ = U.festivals(t1, t2, UJJAYINI);
  const ids = fs_.map((f) => f.id);
  for (const r of U.RULES) assert.equal(ids.filter((x) => x === r.id).length, 1, r.id);
  for (const f of fs_) {
    assert.match(f.status, /unverified/);
    if (!f.tithi || f.fallback) continue;
    const idx = (f.paksha === 'kṛṣṇa' ? 15 : 0) + f.tithi;
    const at = f.kala === 'sunrise' || f.kala === 'candrodaya' ? f.window[0] : (Math.max(f.window[0], f.tithiSpan.start) + Math.min(f.window[1], f.tithiSpan.end)) / 2;
    assert.equal(P.limbsAt(at).tithi, idx, `${f.id}: tithi ${idx} in its ${f.kala}`);
    const m = P.lunarMonth(at);
    assert.equal(m.adhika, false, `${f.id} is not in an adhika month`);
    assert.ok(f.month.startsWith(m.name), `${f.id}: ${m.name}`);
  }
  const by = (id) => fs_.find((f) => f.id === id).N;
  assert.equal(by('holi'), by('holika-dahana') + 1);
  assert.ok(by('ghatasthapana') < by('durga-ashtami') && by('durga-ashtami') < by('vijaya-dashami'));
  assert.ok(by('dhanteras') < by('dipavali') && by('dipavali') < by('bhratri-dvitiya'));
});

test('a kṣaya month keeps the rites of the month it drops (council JY-01): 1983 has Māgha\'s festivals, 2085 Mārgaśīrṣa\'s', () => {
  const ymd = (N) => { const c = K.civilFromKaliDay(N, 'gregorian'); return `${c.year}-${String(c.month).padStart(2, '0')}-${String(c.day).padStart(2, '0')}`; };
  const cases = [[day(1982, 12, 1), day(1983, 3, 31), ['vasanta-pancami', 'mahashivaratri'], 'Māgha'], [day(2085, 10, 1), day(2086, 1, 31), ['gita-jayanti'], 'Mārgaśīrṣa']];
  for (const [t1, t2, ids, dropped] of cases) {
    const f = U.festivals(t1, t2, UJJAYINI);
    for (const id of ids) {
      const hit = f.filter((x) => x.id === id);
      assert.equal(hit.length, 1, `${id} occurs once in ${ymd(t1)}..${ymd(t2)}`);
      assert.match(hit[0].note, new RegExp(`kṣaya māsa: .* also holds the rites of ${dropped}`));
      assert.equal(P.limbsAt(hit[0].fallback ? hit[0].tithiSpan.start + 1e-6 : (Math.max(hit[0].window[0], hit[0].tithiSpan.start) + Math.min(hit[0].window[1], hit[0].tithiSpan.end)) / 2).tithi,
        (hit[0].paksha === 'kṛṣṇa' ? 15 : 0) + hit[0].tithi);
    }
  }
});

test('a saṅkrānti whose puṇya time is all night goes to the day whose daylight is nearer, never a day before it (council JY-02)', () => {
  const DELHI = { latitude: 28.6139, deshantara: 77.2090 - 75.7885 }, SRINAGAR = { latitude: 34.0837, deshantara: 74.7973 - 75.7885 };
  let night = 0;
  for (const site of [DELHI, SRINAGAR]) for (let y = 1900; y < 2100; y++) {
    const x = U.festivals(day(y, 1, 5), day(y, 1, 25), site, { rules: U.RULES.filter((r) => r.solar === 9) })[0];
    const W = U.kalaWindows(x.N, site, {});
    if (x.punya.to > W.rise && x.punya.from < W.set) continue;            // daylight holds some of the puṇya time
    night++;
    const gap = (N) => { const w = U.kalaWindows(N, site, {}); return x.sankranti < w.rise ? w.rise - x.sankranti : x.sankranti > w.set ? x.sankranti - w.set : 0; };
    assert.ok(gap(x.N) <= gap(x.N - 1) && gap(x.N) <= gap(x.N + 1), `${y}: the nearer daylight`);
    assert.ok(W.next > x.sankranti, `${y}: the chosen day does not end before the saṅkrānti`);
  }
  assert.ok(night >= 4, `night saṅkrāntis exercised: ${night}`);
});

test('a polar site loses no year: festivals no day can hold are listed as unplaced, never thrown (page-builder report)', () => {
  for (const latitude of [65, 78.22]) {
    const f = U.festivals(day(2026, 1, 1), day(2027, 1, 1), { latitude, deshantara: 25 - 75.7885 });
    assert.ok(Array.isArray(f.unplaced));
    assert.ok(f.unplaced.length > 0, `${latitude}°: some rule has no window`);
    for (const u of f.unplaced) assert.match(u.reason, /no civil day near the tithi/);
    assert.equal(f.filter((x) => f.unplaced.some((u) => u.id === x.id && u.month === x.month.split(' ')[0])).length, 0);
  }
  assert.deepEqual(U.festivals(day(2026, 1, 1), day(2027, 1, 1), UJJAYINI).unplaced, []);
});

test('moonrise is 68905b9\'s, bit for bit, at 60 days from JDN 0 to Kali day 8,388,000 (moonEvent refactor and bisection guard change nothing in range)', () => {
  const fx = require('./test-fixtures/panchanga-days-68905b9.json');
  for (const d of fx.days) assert.deepStrictEqual(U.moonrise(d.N, fx.site), d.moonrise, `moonrise ${d.N}`);
  assert.ok(fx.days.filter((d) => d.moonrise !== null).length >= 55);
});

test('moonset: the Moon\'s centre crossing the horizon downward in the civil day (no parallax, no refraction); at Ujjayinī on 17 August 2026 it comes 176 minutes after sunset [measured]', () => {
  const S = require('./sphuta.js'), D = require('./dhruva.js'), D2R = Math.PI / 180;
  const altSine = (t, site) => {                                    // the same horizon test, written out here
    const p = P.placesAt(t), A = S.ayanamshaSS(S.spandasOfDays(t)), q = D.eclipticToEquatorial(p.moon + A, p.moonLatitude);
    const H = (360 * ((((t + site.deshantara / 360) % 1) + 1) % 1) - 180 + p.mean.sun + A - q.alpha) * D2R, phi = site.latitude * D2R, d = q.delta * D2R;
    return Math.sin(phi) * Math.sin(d) + Math.cos(phi) * Math.cos(d) * Math.cos(H);
  };
  let none = 0;
  for (let i = 0; i < 30; i++) {
    const N = day(2026, 1, 1) + 12 * i + 3, m = U.moonset(N, UJJAYINI), r0 = P.sunrise(N, UJJAYINI), r1 = P.sunrise(N + 1, UJJAYINI);
    if (m === null) { none++; continue; }
    assert.ok(Number.isFinite(m) && m > r0 && m < r1, `day ${N}: within its civil day`);
    assert.ok(altSine(m - 1e-4, UJJAYINI) > 0 && altSine(m + 1e-4, UJJAYINI) < 0, `day ${N}: the Moon goes down through the horizon`);
    const r = U.moonrise(N, UJJAYINI);
    if (r !== null) assert.ok(altSine(r - 1e-4, UJJAYINI) < 0 && altSine(r + 1e-4, UJJAYINI) > 0, `day ${N}: and rises up through it`);
  }
  assert.ok(none <= 2, `sampled days without a moonset: ${none}`);
  const N = day(2026, 8, 17), late = (U.moonset(N, UJJAYINI) - P.sunset(N, UJJAYINI)) * 1440;
  assert.ok(Math.abs(late - 176.0) < 0.5, `moonset − sunset ${late.toFixed(2)} min`);
  assert.equal(U.moonEvent(N, UJJAYINI, 'set'), U.moonset(N, UJJAYINI)); assert.equal(U.moonEvent(N, UJJAYINI, 'rise'), U.moonrise(N, UJJAYINI));
  assert.throws(() => U.moonEvent(N, UJJAYINI, 'transit'), RangeError);
});

test('moonrise belongs to its civil day: between this sunrise and the next, or none', () => {
  let none = 0;
  for (let N = day(2026, 1, 1); N < day(2027, 1, 1); N++) {
    const m = U.moonrise(N, UJJAYINI), r0 = P.sunrise(N, UJJAYINI), r1 = P.sunrise(N + 1, UJJAYINI);
    if (m === null) { none++; continue; }
    assert.ok(m > r0 && m < r1, `day ${N}`);
  }
  assert.ok(none >= 5 && none <= 20, `days without a moonrise: ${none}`);
});
