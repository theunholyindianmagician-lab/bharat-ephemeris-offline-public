#!/usr/bin/env node
'use strict';
/* scripts/calendar-100k.cjs — the Sūrya-Siddhānta's lunisolar calendar for every Kali year whose [start, end) meets the
 * proleptic Gregorian span −50000-01-01 … 50000-12-31 (Kali years −46,897 … 53,099), on the sovereign modules only:
 * kala-dvara.js, sphuta.js, panchanga.js, ss-graha.js, ss-ahargana.js (with dhruva.js and ss-udaya.js under panchanga), and
 * for the default tier ss-tier.js with parampara.js and the paramparā record.
 *
 * TIERS. The calendar is built for one named tier (--tier; see TIERS below). Owner decision 2026-10-08: the text tier's
 * PRIMARY DEFAULT is "Sūrya-Siddhānta + Parameśvara's saṃskāra" (tier "ss+parameshvara"; the saṃskāra corrects only what
 * the paramparā record names — today the Moon and the node); the plain Sūrya-Siddhānta (tier "ss") is the secondary,
 * labelled choice; the third choice, "Modern Bhāratīya (dṛk)", is not generated (it refuses outside 1850-2150). The default
 * tier's places are ss-tier.js's (SSTier.calendar: the text's model with the record's mean-place shifts, read through
 * parampara.js from corpus/parampara/samskara.json), the same code math-core.js and the pages use. Each tier has its own
 * manifest: corpus/calendar/manifest-100k-ss-parameshvara.json for the default, corpus/calendar/manifest-100k.json for "ss".
 *
 * The core of each year is SSAhargana.yearOfKali(k, Panchanga) — the function a page's year panel uses — so generator and
 * page share one implementation. Each year is one NDJSON line (keys in a fixed order); shards of 1,000 Kali years are
 * gzip files kali_<from>_<to>.ndjson.gz in --out, which must lie outside the repository. Every year is checked against
 * the invariants below; the run fails (exit 1) on any failure, exception, non-finite value, or a year that takes more
 * than 30 s. With --write-manifest it writes the tier's manifest (no absolute path in it).
 *
 * Usage: node scripts/calendar-100k.cjs [--tier ss+parameshvara] [--from-year -50000] [--to-year 50000] [--out DIR] [--workers N]
 *          [--days] [--write-manifest] [--verify]
 *   --tier ID        the calendar to build: "ss+parameshvara" (the default; "ss-parameshvara" and "ss parameshvara" are
 *                    accepted for it) or "ss" (the plain Sūrya-Siddhānta; "classical" is accepted for it)
 *   --out DIR        where the shards go (default: <os temp dir>/calendar-100k-out/<tier>); refused inside the repository
 *   --workers N      worker threads (default: the number of CPUs)
 *   --days           also one row per civil day (sunrise at Ujjayinī, vāra, the limbs at sunrise) in day_kali_*.ndjson.gz;
 *                    these use the library's trigonometry (sunrise), so their hashes are per Node version
 *   --write-manifest write the tier's manifest from this run (the full default span only)
 *   --verify         recompute three randomly chosen shards of the tier's manifest in memory and compare their hashes
 * See corpus/calendar/README.md for the record format and what each invariant means.
 */
const path = require('node:path');
const fs = require('node:fs');
const os = require('node:os');
const zlib = require('node:zlib');
const crypto = require('node:crypto');
const { Worker, isMainThread, parentPort, workerData } = require('node:worker_threads');
const K = require('../kala-dvara.js');
const P = require('../panchanga.js');
const G = require('../ss-graha.js');
const A = require('../ss-ahargana.js');
const SST = require('../ss-tier.js');

const ROOT = path.resolve(__dirname, '..');
const YUGA = 1577917828, SUN = 4320000;
const SAMVATSARA_INTERVAL = YUGA / (364220 * 12);                  // days between mean-Jupiter sign changes [theorem]
const ADHIKA_PER_YEAR = 1593336 / 4320000;                          // the text's adhimāsas a year, SS 1.37-1.39
const MODULES = ['kala-dvara.js', 'sphuta.js', 'dhruva.js', 'ss-udaya.js', 'panchanga.js', 'ss-graha.js', 'ss-ahargana.js', 'scripts/calendar-100k.cjs'];
const DAY_SITE = Object.freeze({ latitude: 23.1765, deshantara: 0 });  // Ujjayinī, on the prime meridian (--days only)
const SHARD = 1000;

const sha256 = (s) => crypto.createHash('sha256').update(s, 'utf8').digest('hex');
const r6 = (x) => Number(x.toFixed(6));
const pad = (n, w) => String(n).padStart(w, '0');
const ymd = (c) => `${c.year < 0 ? '-' : ''}${pad(Math.abs(c.year), 4)}-${pad(c.month, 2)}-${pad(c.day, 2)}`;
/** The civil date (at the Laṅkā–Ujjayinī meridian, midnight reckoning) of the Kali day holding t. */
const dateOf = (t, calendar = 'gregorian') => ymd(K.civilFromKaliDay(Math.floor(t), calendar));
const kaliDay = (year, month, day) => K.kaliDayFromCivil({ calendar: 'gregorian', year, month, day });

// ── the tiers ──────────────────────────────────────────────────────────────────────────────────────────────
const PARAMESHVARA = SST.correction('parameshvara');               // the paramparā record, through parampara.js (never typed here)
/** The calendars this generator builds, by tier id. `calendar` is the panchanga.js instance whose places make the new
 *  moons and saṅkrāntis (for the default, ss-tier.js's: Panchanga.withPlaces on the saṃskāra places; for "ss", panchanga.js
 *  itself); `manifest` is the tier's manifest file in corpus/calendar/; `modules` are the files, beyond MODULES, whose
 *  sha256 the manifest records. */
const TIERS = Object.freeze({
  'ss+parameshvara': Object.freeze({
    id: 'ss+parameshvara', calendar: SST.calendar({ samskara: 'parameshvara' }), manifest: 'manifest-100k-ss-parameshvara.json',
    label: PARAMESHVARA.label, labelSa: PARAMESHVARA.labelSa,
    role: "the text tier's primary default (owner decision 2026-10-08)",
    samskara: Object.freeze({ corrects: PARAMESHVARA.corrects, moonArcmin: PARAMESHVARA.moonArcmin, nodeArcmin: PARAMESHVARA.nodeArcmin,
      epochKali: PARAMESHVARA.epochKali, julian: PARAMESHVARA.julian, rule: PARAMESHVARA.rule, record: 'corpus/parampara/samskara.json (parampara.js samskaraParameshvara)' }),
    modules: Object.freeze(['ss-tier.js', 'parampara.js', 'corpus/parampara/samskara.json', 'corpus/parampara/registry.json']),
  }),
  ss: Object.freeze({
    id: 'ss', calendar: P, manifest: 'manifest-100k.json',
    label: 'Sūrya-Siddhānta (plain text)', labelSa: 'सूर्य-सिद्धान्त',
    role: "the text tier's secondary, labelled choice (owner decision 2026-10-08); the default is the Sūrya-Siddhānta with Parameśvara's saṃskāra",
    samskara: null, modules: Object.freeze([]),
  }),
});
const DEFAULT_TIER = 'ss+parameshvara';
const TIER_ALIASES = Object.freeze({ classical: 'ss', 'ss parameshvara': 'ss+parameshvara', 'ss-parameshvara': 'ss+parameshvara' });
const NOT_GENERATED = "The generator builds the two text tiers: 'ss+parameshvara' (the default: the Sūrya-Siddhānta with Parameśvara's saṃskāra) and 'ss' " +
  "(the plain Sūrya-Siddhānta). 'Modern Bhāratīya (dṛk)' ('drik') is not generated: it refuses outside 1850-2150. 'calibrated' was retired on 2026-10-08.";
/** What a tier's manifest says about itself, beside its label. */
const TIER_NOTE = Object.freeze({
  'ss+parameshvara': "Built for the text tier's primary default (owner decision 2026-10-08): the Sūrya-Siddhānta's model with Parameśvara's " +
    "saṃskāra, the mean-place shifts that corpus/parampara/samskara.json records (fitted to his recorded eclipses), carried at the text's own " +
    "rates. It corrects only what the record names (" + PARAMESHVARA.corrects.join(', ') + "); the Sun, the planets, mean Jupiter (the saṃvatsara) " +
    "and every rate are the text's. The plain Sūrya-Siddhānta's calendar is manifest-100k.json.",
  ss: "Built for the plain Sūrya-Siddhānta, the text tier's secondary, labelled choice. The text tier's default (owner decision " +
    "2026-10-08) is the Sūrya-Siddhānta with Parameśvara's saṃskāra, which corrects only the Moon and the node; since the Moon " +
    "makes the new moons that bound every month, that calendar differs from this one [reasoning]. Its 100,000-year calendar has " +
    "its own manifest, manifest-100k-ss-parameshvara.json; this file stays the plain text's.",
});
/** The tier record for an id (or alias); no id → the default tier ('ss+parameshvara'). Refuses an unknown tier. */
function tierOf(id) {
  if (id === undefined || id === null || id === '') id = DEFAULT_TIER;
  const key = typeof id === 'string' && Object.hasOwn(TIER_ALIASES, id) ? TIER_ALIASES[id] : id;
  const t = typeof key === 'string' && Object.hasOwn(TIERS, key) ? TIERS[key] : null;
  if (!t) throw new RangeError(`calendar-100k: tier "${id}" is not generated here. ${NOT_GENERATED}`);
  return t;
}
/** The tier's manifest, corpus/calendar/<file>. */
const manifestPath = (tier) => path.join(ROOT, 'corpus', 'calendar', tierOf(tier).manifest);

// ── the span and the npm-test sample ───────────────────────────────────────────────────────────────────────
/** The Kali years whose [start, end) meets proleptic Gregorian fromYear-01-01 … toYear-12-31 (Laṅkā-meridian days),
 *  by the tier's calendar. */
function rangeOf(tier, fromYear = -50000, toYear = 50000) {
  const C = tierOf(tier).calendar;
  const lo = kaliDay(fromYear, 1, 1), hi = kaliDay(toYear, 12, 31) + 1;
  const kaliFrom = A.lunarYear(lo, C).k;
  let kaliTo = A.lunarYear(hi - 1e-6, C).k;
  if (A.yearOfKali(kaliTo + 1, C).start < hi) kaliTo += 1;
  return { kaliFrom, kaliTo, gregorianFrom: ymd({ year: fromYear, month: 1, day: 1 }), gregorianTo: ymd({ year: toYear, month: 12, day: 31 }) };
}
/** The deterministic sample deep-time.test.js runs: the Kali years gone at 1 July of every 1,000th Gregorian year from
 *  −50,000 to +50,000, of −4713, −4712 (JDN 0), −3101 (the Kali epoch), −26068 and 19866 (Kali days ∓2^23), 0, 1582, 2026,
 *  2028 (a year that ends with an adhika Caitra) and 50000, and the two ends of the span. */
function sampleKs(range) {
  const years = [];
  for (let y = -50000; y <= 50000; y += 1000) years.push(y);
  years.push(-4713, -4712, -3101, -26068, 19866, 0, 1582, 2026, 2028, 50000);
  const ks = new Set(years.map((y) => Math.floor(SUN * kaliDay(y, 7, 1) / YUGA)));
  ks.add(range.kaliFrom); ks.add(range.kaliTo);
  return [...ks].filter((k) => k >= range.kaliFrom && k <= range.kaliTo).sort((a, b) => a - b);
}

// ── one year ───────────────────────────────────────────────────────────────────────────────────────────────
/** The year record of Kali year k by the tier's calendar: { k, tier, y (yearOfKali, unrounded), samv: { atStart,
 *  changes }, line (rounded), text }. The saṃvatsara is mean Jupiter's (SS 1.55), which no tier here corrects. */
function buildYear(k, tier) {
  const T = tierOf(tier);
  const y = A.yearOfKali(k, T.calendar);
  const s0 = G.samvatsara(y.start);
  const changes = [];
  for (let c = G.samvatsaraChangeAfter(y.start); c < y.end; c = G.samvatsaraChangeAfter(c + 1e-3)) {
    const s = G.samvatsara(c + 1e-3);
    changes.push({ t: c, name: s.name, prabhavaIndex: s.prabhavaIndex });
  }
  const adhika = y.months.filter((m) => m.adhika).length, kshaya = y.months.filter((m) => m.kshaya).length;
  const line = {
    k, shaka: k - A.KALI_SHAKA, vikrama: k - A.KALI_VIKRAMA, yearStartRule: y.yearStartRule,
    start: { t: r6(y.start), gregorian: dateOf(y.start), julian: dateOf(y.start, 'julian'), vara: K.varaOfKaliDay(Math.floor(y.start)).name },
    end: { t: r6(y.end) },
    mesha: { t: r6(y.mesha), gregorian: dateOf(y.mesha) },
    samvatsara: { atStart: { name: s0.name, prabhavaIndex: s0.prabhavaIndex, vijayaIndex: s0.vijayaIndex }, changes: changes.map((c) => ({ t: r6(c.t), name: c.name })), reading: s0.reading },
    yearLord: A.lordsOfKaliDay(Math.floor(y.start)).year,
    months: y.months.map((m) => ({ name: m.name, adhika: m.adhika, kshaya: m.kshaya, kshayaDropped: m.kshayaDropped, start: r6(m.start), gregorian: dateOf(m.start),
      end: r6(m.end), fullMoonNakshatra: m.fullMoonNakshatra, marginMinutes: Number(m.marginMinutes.toFixed(3)) })),
    sankrantis: y.sankrantis.map((s) => ({ rashi: s.rashi, t: r6(s.at), gregorian: dateOf(s.at) })),
    counts: { months: y.months.length, adhika, kshaya },
  };
  return { k, tier: T.id, y, samv: { atStart: s0, changes }, line, text: JSON.stringify(line) };
}

/** The per-year invariants (1, 3-9 of corpus/calendar/README.md) on the unrounded values; [] when all hold. */
function checkYear(b) {
  const { k, y } = b, bad = [];
  const fin = (x, what) => { if (typeof x !== 'number' || !Number.isFinite(x)) bad.push(`(9) ${what} is not finite`); };
  fin(y.start, 'start'); fin(y.end, 'end'); fin(y.mesha, 'mesha');
  for (const m of y.months) { fin(m.start, 'month start'); fin(m.end, 'month end'); fin(m.fullMoon, 'full moon'); fin(m.marginMinutes, 'margin'); }
  for (const s of y.sankrantis) fin(s.at, 'saṅkrānti');
  if (bad.length) return bad;
  // (1) the count of years
  if (Math.round(SUN * y.start / YUGA) !== k) bad.push(`(1) start counts ${Math.round(SUN * y.start / YUGA)} Kali years`);
  // (3) twelve saṅkrāntis in rāśi order, strictly increasing, inside the year
  if (y.sankrantis.length !== 12) bad.push(`(3) ${y.sankrantis.length} saṅkrāntis`);
  y.sankrantis.forEach((s, i) => {
    if (s.index !== i) bad.push(`(3) saṅkrānti ${i} is ${s.rashi}`);
    if (!(s.at >= y.start && s.at < y.end)) bad.push(`(3) ${s.rashi} outside the year`);
    if (i && !(s.at > y.sankrantis[i - 1].at)) bad.push(`(3) ${s.rashi} not after the one before`);
  });
  // (4) 12 or 13 contiguous months, from the nija Caitra
  const M = y.months;
  if (M.length !== 12 && M.length !== 13) bad.push(`(4) ${M.length} months`);
  if (M[0].start !== y.start || M[M.length - 1].end !== y.end) bad.push('(4) the months do not span the year');
  if (M[0].name !== 'Caitra' || M[0].adhika) bad.push(`(4) the year opens with ${M[0].adhika ? 'adhika ' : ''}${M[0].name}`);
  for (let i = 1; i < M.length; i++) if (M[i].start !== M[i - 1].end) bad.push(`(4) gap before month ${i}`);
  // (5) adhika ⇔ no saṅkrānti; kṣaya ⇔ two or more; the names follow Caitra … Phālguna with exactly the repeat or skip the
  // flags imply; an adhika month takes the next month's name, so a final adhika month is Caitra
  let e = 0;
  M.forEach((m, i) => {
    const inside = y.sankrantis.filter((s) => s.at >= m.start && s.at < m.end).length;
    if (m.adhika !== (inside === 0)) bad.push(`(5) month ${i} ${m.name}: adhika ${m.adhika} with ${inside} saṅkrāntis`);
    if (m.kshaya !== (inside >= 2)) bad.push(`(5) month ${i} ${m.name}: kṣaya ${m.kshaya} with ${inside} saṅkrāntis`);
    if (m.name !== P.MONTH[e % 12]) bad.push(`(5) month ${i} is ${m.name}, expected ${P.MONTH[e % 12]}`);
    if (m.adhika) { if (e === 12 && i !== M.length - 1) bad.push('(5) an adhika Caitra that does not end the year'); return; }
    e += 1;
    if (m.kshaya) { if (m.kshayaDropped !== P.MONTH[e % 12]) bad.push(`(5) month ${i} drops ${m.kshayaDropped}, expected ${P.MONTH[e % 12]}`); e += 1; }
  });
  if (e !== 12) bad.push(`(5) the names cover ${e} months, not 12`);
  // (6) month lengths
  for (const m of M) { const L = m.end - m.start; if (!(L > 29 && L < 30)) bad.push(`(6) a month of ${L} days`); }
  // (7) every date converts back in both calendars, and the vāra steps with the day
  const N0 = Math.floor(y.start), v0 = K.varaOfKaliDay(N0).index;
  for (const t of [y.start, y.mesha, ...M.map((m) => m.start), ...y.sankrantis.map((s) => s.at)]) {
    const N = Math.floor(t);
    for (const calendar of ['gregorian', 'julian']) if (K.kaliDayFromCivil({ calendar, ...K.civilFromKaliDay(N, calendar) }) !== N) bad.push(`(7) ${calendar} round trip at ${N}`);
    if ((((K.varaOfKaliDay(N).index - v0 - (N - N0)) % 7) + 7) % 7 !== 0) bad.push(`(7) vāra at ${N}`);
  }
  // (8) the saṃvatsara steps by one at each mean-Jupiter sign change, the changes one interval apart
  let idx = b.samv.atStart.prabhavaIndex, last = null;
  for (const c of b.samv.changes) {
    if (c.prabhavaIndex !== (idx + 1) % 60) bad.push(`(8) the saṃvatsara jumps from ${idx} to ${c.prabhavaIndex}`);
    if (last !== null && Math.abs(c.t - last - SAMVATSARA_INTERVAL) > 1e-6) bad.push(`(8) changes ${c.t - last} days apart`);
    if (!(c.t > y.start && c.t < y.end)) bad.push('(8) a change outside the year');
    idx = c.prabhavaIndex; last = c.t;
  }
  return bad;
}
/** The year's two edges, for the checks between consecutive years (in a shard, and between shards). */
const headOf = (b) => ({ k: b.k, start: b.y.start, firstSankranti: b.y.sankrantis[0].at, samvatsaraAtStart: b.samv.atStart.prabhavaIndex,
  firstChange: b.samv.changes.length ? b.samv.changes[0].t : null });
const tailOf = (b, carriedChange) => ({ k: b.k, end: b.y.end, lastSankranti: b.y.sankrantis[11].at,
  samvatsaraAtEnd: b.samv.changes.length ? b.samv.changes[b.samv.changes.length - 1].prabhavaIndex : b.samv.atStart.prabhavaIndex,
  lastChange: b.samv.changes.length ? b.samv.changes[b.samv.changes.length - 1].t : carriedChange });
/** The invariants between consecutive years: k steps by one (1), the next starts where this ends, exactly (2), the
 *  saṃvatsara carries over (8) and the next change is one interval after the last (8). */
function checkSequence(tail, head) {
  const bad = [];
  if (head.k !== tail.k + 1) bad.push(`(1) Kali year ${head.k} follows ${tail.k}`);
  if (head.start !== tail.end) bad.push(`(2) year ${head.k} starts at ${head.start}, year ${tail.k} ends at ${tail.end}`);
  if (head.samvatsaraAtStart !== tail.samvatsaraAtEnd) bad.push(`(8) the saṃvatsara changes between years ${tail.k} and ${head.k}`);
  if (head.firstChange !== null && tail.lastChange !== null && Math.abs(head.firstChange - tail.lastChange - SAMVATSARA_INTERVAL) > 1e-6) bad.push(`(8) changes ${head.firstChange - tail.lastChange} days apart across years ${tail.k}/${head.k}`);
  return bad;
}

// ── statistics ─────────────────────────────────────────────────────────────────────────────────────────────
const newStats = () => ({ years: 0, months: 0, adhika: 0, kshaya: 0, years13: 0, finalAdhikaCaitra: 0, samvatsaraSkips: 0,
  monthMin: Infinity, monthMax: -Infinity, sankMin: Infinity, sankMax: -Infinity, marginMin: Infinity });
function addYear(st, b, prevLastSank) {
  const y = b.y;
  st.years++; st.months += y.months.length;
  for (const m of y.months) { st.adhika += m.adhika; st.kshaya += m.kshaya; const L = m.end - m.start; st.monthMin = Math.min(st.monthMin, L); st.monthMax = Math.max(st.monthMax, L); st.marginMin = Math.min(st.marginMin, m.marginMinutes); }
  if (y.months.length === 13) st.years13++;
  if (y.months[y.months.length - 1].adhika) st.finalAdhikaCaitra++;
  if (b.samv.changes.length >= 2) st.samvatsaraSkips++;
  const s = y.sankrantis.map((x) => x.at);
  if (prevLastSank !== null) s.unshift(prevLastSank);
  for (let i = 1; i < s.length; i++) { const d = s[i] - s[i - 1]; st.sankMin = Math.min(st.sankMin, d); st.sankMax = Math.max(st.sankMax, d); }
}
function mergeStats(a, b) {
  const o = { ...a };
  for (const k of ['years', 'months', 'adhika', 'kshaya', 'years13', 'finalAdhikaCaitra', 'samvatsaraSkips']) o[k] = a[k] + b[k];
  for (const k of ['monthMin', 'sankMin', 'marginMin']) o[k] = Math.min(a[k], b[k]);
  for (const k of ['monthMax', 'sankMax']) o[k] = Math.max(a[k], b[k]);
  return o;
}

// ── one shard ──────────────────────────────────────────────────────────────────────────────────────────────
function dayRows(b) {
  const rows = [], C = tierOf(b.tier).calendar;
  for (let N = Math.floor(b.y.start); N < Math.floor(b.y.end); N++) {
    const r = C.sunrise(N, DAY_SITE);
    if (r === null) { rows.push(JSON.stringify({ N, gregorian: ymd(K.civilFromKaliDay(N, 'gregorian')), polar: true })); continue; }
    const L = C.limbsAt(r);
    rows.push(JSON.stringify({ N, gregorian: ymd(K.civilFromKaliDay(N, 'gregorian')), vara: K.varaOfKaliDay(N).name, sunrise: r6(r),
      tithi: L.tithi, nakshatra: L.nakshatra, yoga: L.yoga, karana: L.karana }));
  }
  return rows;
}
/** Kali years from … to of opts.tier, as one shard: its text, hash, statistics, failures and edges. `tick` is called after
 *  each year. */
function runShard(from, to, opts = {}) {
  const tier = tierOf(opts.tier).id;
  const lines = [], days = [], failures = [];
  const sampled = new Set(opts.sampleKs || []), samples = {};
  let st = newStats(), prev = null, carried = null, head = null, firstChange = null;
  for (let k = from; k <= to; k++) {
    const b = buildYear(k, tier);
    for (const f of checkYear(b)) failures.push(`Kali ${k}: ${f}`);
    if (prev) for (const f of checkSequence(tailOf(prev, carried), headOf(b))) failures.push(`Kali ${k}: ${f}`);
    addYear(st, b, prev ? prev.y.sankrantis[11].at : null);
    if (firstChange === null && b.samv.changes.length) firstChange = b.samv.changes[0].t;
    lines.push(b.text);
    if (sampled.has(k)) samples[k] = sha256(b.text);
    if (opts.days) days.push(...dayRows(b));
    if (!head) head = headOf(b);
    carried = tailOf(b, carried).lastChange; prev = b;
    if (opts.tick) opts.tick(k);
  }
  const text = lines.join('\n') + '\n', file = `kali_${from}_${to}.ndjson.gz`;
  const out = { tier, kaliFrom: from, kaliTo: to, file, sha256: sha256(text), lines: lines.length, stats: st, failures, samples,
    head: { ...head, firstChange }, tail: tailOf(prev, carried) };
  if (opts.outDir) fs.writeFileSync(path.join(opts.outDir, file), zlib.gzipSync(Buffer.from(text, 'utf8'), { level: 9 }));
  if (opts.days) {
    const dtext = days.join('\n') + '\n', dfile = `day_kali_${from}_${to}.ndjson.gz`;
    out.dayShard = { file: dfile, sha256: sha256(dtext), lines: days.length };
    if (opts.outDir) fs.writeFileSync(path.join(opts.outDir, dfile), zlib.gzipSync(Buffer.from(dtext, 'utf8'), { level: 9 }));
  }
  return out;
}
/** Shards of up to 1,000 Kali years, aligned to multiples of 1,000. */
function shardsOf(range) {
  const out = [];
  for (let a = range.kaliFrom; a <= range.kaliTo;) { const b = Math.min(range.kaliTo, (Math.floor(a / SHARD) + 1) * SHARD - 1); out.push([a, b]); a = b + 1; }
  return out;
}

// ── the CLI ────────────────────────────────────────────────────────────────────────────────────────────────
function parseArgs(argv) {
  const o = { tier: DEFAULT_TIER, fromYear: -50000, toYear: 50000, out: null, workers: os.cpus().length || 1, days: false, writeManifest: false, verify: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i], next = () => { if (i + 1 >= argv.length) throw new Error(`${a} needs a value`); return argv[++i]; };
    if (a === '--tier') o.tier = next();
    else if (a === '--from-year') o.fromYear = Number(next());
    else if (a === '--to-year') o.toYear = Number(next());
    else if (a === '--out') o.out = path.resolve(next());
    else if (a === '--workers') o.workers = Number(next());
    else if (a === '--days') o.days = true;
    else if (a === '--write-manifest') o.writeManifest = true;
    else if (a === '--verify') o.verify = true;
    else throw new Error(`unknown option ${a}`);
  }
  o.tier = tierOf(o.tier).id;                                        // refuses an unknown tier
  if (o.out === null) o.out = path.join(os.tmpdir(), 'calendar-100k-out', o.tier.replace(/[^a-z0-9-]/gi, '-'));
  for (const k of ['fromYear', 'toYear']) if (!Number.isInteger(o[k]) || o[k] < -50000 || o[k] > 50000) throw new Error('years are integers in −50000 … 50000 (the tested span)');
  if (o.fromYear > o.toYear) throw new Error('--from-year is after --to-year');
  if (!Number.isInteger(o.workers) || o.workers < 1) throw new Error('--workers is a positive integer');
  const rel = path.relative(ROOT, o.out);
  if (!rel.startsWith('..') && !path.isAbsolute(rel)) throw new Error('--out must lie outside the repository: the shards are not committed');
  return o;
}

function verify(tier) {
  const man = JSON.parse(fs.readFileSync(manifestPath(tier), 'utf8'));
  if (man.tier !== tier) throw new Error(`${tierOf(tier).manifest} records tier ${man.tier}, not ${tier}`);
  const picks = new Set();
  while (picks.size < Math.min(3, man.shards.length)) picks.add(crypto.randomInt(man.shards.length));
  let ok = true;
  for (const i of picks) {
    const s = man.shards[i], t0 = Date.now(), r = runShard(s.kaliFrom, s.kaliTo, { tier });
    const same = r.sha256 === s.sha256 && r.lines === s.lines && r.failures.length === 0;
    console.log(`${same ? 'same' : 'DIFFERENT'}  ${s.file}  ${r.sha256}  (${((Date.now() - t0) / 1000).toFixed(1)} s)`);
    ok = ok && same;
  }
  if (man.node !== process.version) console.log(`note: the manifest was made with node ${man.node}; this is ${process.version}`);
  return ok;
}

async function main(argv) {
  const o = parseArgs(argv);
  if (o.verify) { const ok = verify(o.tier); console.log(ok ? 'verify: the recomputed shards match the manifest' : 'verify: MISMATCH'); process.exit(ok ? 0 : 1); }
  const t0 = Date.now();
  const T = tierOf(o.tier), MANIFEST = manifestPath(T.id);
  const range = rangeOf(T.id, o.fromYear, o.toYear), samples = sampleKs(range), shards = shardsOf(range);
  if (o.writeManifest && (o.fromYear !== -50000 || o.toYear !== 50000)) throw new Error('--write-manifest records the full span only');
  fs.mkdirSync(o.out, { recursive: true });
  console.log(`tier ${T.id}: ${T.label}, ${T.role}`);
  console.log(`Kali years ${range.kaliFrom} … ${range.kaliTo} (${range.gregorianFrom} … ${range.gregorianTo}): ${shards.length} shards, ${o.workers} workers → ${o.out}`);
  const results = new Array(shards.length);
  let next = 0, done = 0, fatal = null;
  await new Promise((resolve) => {
    const pool = [];
    const finish = () => { clearInterval(dog); for (const w of pool) w.worker.terminate(); resolve(); };
    const dog = setInterval(() => {
      for (const w of pool) if (w.busy !== null && Date.now() - w.last > 30000) { fatal = `a year did not finish in 30 s (worker on shard ${shards[w.busy][0]}…${shards[w.busy][1]}, last year ${w.lastK})`; finish(); return; }
    }, 2000);
    const give = (w) => {
      if (fatal) return;
      if (next >= shards.length) { w.busy = null; if (pool.every((x) => x.busy === null)) finish(); return; }
      const i = next++; w.busy = i; w.last = Date.now();
      w.worker.postMessage({ i, from: shards[i][0], to: shards[i][1] });
    };
    for (let n = 0; n < Math.min(o.workers, shards.length); n++) {
      const worker = new Worker(__filename, { workerData: { role: 'calendar-worker', tier: T.id, outDir: o.out, days: o.days, sampleKs: samples } });
      const w = { worker, busy: null, last: Date.now(), lastK: null };
      worker.on('message', (m) => {
        if (m.type === 'tick') { w.last = Date.now(); w.lastK = m.k; return; }
        if (m.type === 'error') { results[m.i] = { failed: true, error: m.error, kaliFrom: shards[m.i][0], kaliTo: shards[m.i][1] }; }
        else results[m.i] = m.result;
        done++;
        process.stdout.write(`\r${done}/${shards.length} shards  ${((Date.now() - t0) / 1000).toFixed(0)} s   `);
        give(w);
      });
      worker.on('error', (e) => { fatal = `worker error: ${e && e.stack || e}`; finish(); });
      pool.push(w);
      give(w);
    }
  });
  process.stdout.write('\n');
  const runtimeSeconds = Number(((Date.now() - t0) / 1000).toFixed(1));
  if (fatal) { console.error(fatal); process.exit(1); }
  // join the shards
  const failures = [];
  let st = newStats();
  const sampleHashes = {};
  for (let i = 0; i < results.length; i++) {
    const r = results[i];
    if (!r || r.failed) { failures.push(`shard ${shards[i][0]}…${shards[i][1]}: ${r ? r.error : 'no result'}`); continue; }
    failures.push(...r.failures);
    st = mergeStats(st, r.stats);
    Object.assign(sampleHashes, r.samples);
    if (i > 0 && results[i - 1] && !results[i - 1].failed) {
      const prev = results[i - 1];
      for (const f of checkSequence(prev.tail, r.head)) failures.push(`between shards: ${f}`);
      const d = r.head.firstSankranti - prev.tail.lastSankranti; st.sankMin = Math.min(st.sankMin, d); st.sankMax = Math.max(st.sankMax, d);
    }
  }
  const expected = st.years * ADHIKA_PER_YEAR, net = st.adhika - st.kshaya;
  if (Math.abs(net - expected) > 2) failures.push(`(global) adhika − kṣaya = ${net}, the text's rate gives ${expected.toFixed(2)}`);
  if (st.years !== range.kaliTo - range.kaliFrom + 1) failures.push(`(global) ${st.years} years for the span ${range.kaliFrom} … ${range.kaliTo}`);
  for (const k of samples) if (!sampleHashes[k]) failures.push(`(global) no hash for sampled year ${k}`);
  const summary = { tier: T.id, years: st.years, months: st.months, adhika: st.adhika, kshaya: st.kshaya, adhikaMinusKshaya: net, expectedByTextRate: Number(expected.toFixed(3)),
    years13: st.years13, finalAdhikaCaitra: st.finalAdhikaCaitra, samvatsaraSkips: st.samvatsaraSkips,
    monthLengthDays: { min: Number(st.monthMin.toFixed(6)), max: Number(st.monthMax.toFixed(6)) },
    sankrantiIntervalDays: { min: Number(st.sankMin.toFixed(6)), max: Number(st.sankMax.toFixed(6)) }, minMarginMinutes: Number(st.marginMin.toFixed(3)),
    failures: failures.length, runtimeSeconds, workers: o.workers };
  console.log(JSON.stringify(summary, null, 1));
  if (failures.length) { console.error(failures.slice(0, 40).join('\n')); }
  if (o.writeManifest && !failures.length) {
    const moduleSha256 = {};
    for (const f of [...MODULES, ...T.modules]) moduleSha256[f] = sha256(fs.readFileSync(path.join(ROOT, f), 'utf8'));
    const manifest = {
      generator: 'scripts/calendar-100k.cjs: the Sūrya-Siddhānta on the sovereign modules (kala-dvara, sphuta, panchanga, ss-graha, ss-ahargana' +
        (T.samskara ? '; the saṃskāra places of ss-tier.js, read through parampara.js' : '') + '); see corpus/calendar/README.md',
      tier: T.id, tierLabel: T.label, tierLabelSa: T.labelSa, tierRole: T.role, tierNote: TIER_NOTE[T.id], ...(T.samskara ? { samskara: T.samskara } : {}),
      moduleSha256, node: process.version, sine: T.calendar.sine, reading: 'A (SS 1.55: remainder 0 = Vijaya)',
      dateBasis: 'civil dates of the Kali day holding the instant: midnight reckoning at the Laṅkā–Ujjayinī meridian; proleptic calendars, astronomical years',
      range, years: st.years, months: st.months, adhika: st.adhika, kshaya: st.kshaya, adhikaMinusKshaya: net, expectedByTextRate: summary.expectedByTextRate,
      years13: st.years13, finalAdhikaCaitra: st.finalAdhikaCaitra, monthLengthDays: summary.monthLengthDays, sankrantiIntervalDays: summary.sankrantiIntervalDays,
      minMarginMinutes: summary.minMarginMinutes, samvatsaraSkips: st.samvatsaraSkips,
      samvatsaraSkipsMeaning: 'Kali years holding two mean-Jupiter sign changes, so one saṃvatsara name is current at no year start',
      yearStartRule: A.YEAR_START_RULE, failures: failures.length,
      shards: results.map((r) => ({ kaliFrom: r.kaliFrom, kaliTo: r.kaliTo, file: r.file, sha256: r.sha256, lines: r.lines, ...(r.dayShard ? { dayShard: r.dayShard } : {}) })),
      sampleHashes: Object.fromEntries(samples.map((k) => [k, sampleHashes[k]])),
      hashOf: 'sha256 of the uncompressed UTF-8 text: a shard is its year lines joined by \\n with a final \\n; a sample is one year line without the \\n',
      runtimeSeconds, workers: o.workers, msPerYearPerWorker: Number((runtimeSeconds * 1000 * o.workers / st.years).toFixed(2)),
    };
    const text = JSON.stringify(manifest, null, 1) + '\n';
    if (/(?:^|["\s(])(?:\/home\/|\/tmp\/|\/root\/|\/Users\/|[A-Za-z]:\\)/.test(text)) throw new Error('the manifest would carry an absolute path');
    fs.mkdirSync(path.dirname(MANIFEST), { recursive: true });
    fs.writeFileSync(MANIFEST, text);
    console.log(`wrote ${path.relative(ROOT, MANIFEST)}`);
  }
  process.exit(failures.length ? 1 : 0);
}

if (!isMainThread && workerData && workerData.role === 'calendar-worker') {
  parentPort.on('message', (task) => {
    try {
      const result = runShard(task.from, task.to, { tier: workerData.tier, outDir: workerData.outDir, days: workerData.days, sampleKs: workerData.sampleKs, tick: (k) => parentPort.postMessage({ type: 'tick', k }) });
      parentPort.postMessage({ type: 'done', i: task.i, result });
    } catch (e) {
      parentPort.postMessage({ type: 'error', i: task.i, error: String(e && e.stack || e) });
    }
  });
} else if (require.main === module) {
  main(process.argv.slice(2)).catch((e) => { console.error(e && e.stack || e); process.exit(1); });
}

module.exports = { TIERS, DEFAULT_TIER, TIER_NOTE, tierOf, manifestPath, rangeOf, sampleKs, buildYear, checkYear, checkSequence, headOf, tailOf, runShard, shardsOf, sha256, SAMVATSARA_INTERVAL, ADHIKA_PER_YEAR };
