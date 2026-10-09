/* siddhanta-panchanga-page.js — the page of siddhanta-panchanga.html: the pañcāṅga for a place and a day in the three
 * choices the owner set on 2026-10-08, one code path each:
 *   'ss+parameshvara' (the default) and 'ss' — the Sūrya-Siddhānta's sovereign modules bound to the tier by ss-tier.js
 *       (SSTier.calendar / utsava / muhurta / dasha with { samskara }), ss-ahargana.js for the year, ss-grahana.js (plain)
 *       or SSTier.eclipsesNear (the saṃskāra's model) for eclipses;
 *   'drik' — Modern Bhāratīya (dṛk): math-core.js's tier API (tierDay, skyLunarMonth, panchangExtended, lunarRiseSet,
 *       vimshottariTier, tierAyanamsha) and siddhanta-tier.js (table, sankrantisBetween, eclipses through drik-grahana.js),
 *       served 1850.0–2150.0 and refused outside it with math-core's TierSpanError.
 * Every label a block shows (engine, ayanāṃśa, sunrise rule, day, karaṇa order, month, saṃvatsara, span, provenance) is
 * read from ShunyaMath.TIERS, never typed here. This file reads forms, converts instants to the user's clock and writes
 * HTML; every number shown comes from those modules.
 *
 * Time: in the text's choices an instant t is days since the Kali epoch, midnight on the Laṅkā–Ujjayinī meridian; a site
 * is { latitude, deshantara }, deśāntara = longitude − the meridian's longitude (UJJAYINI_MERIDIAN_DEG). Clock time in a
 * zone = t − meridian ÷ 360 + offset ÷ 24 (days); its date by KalaDvara.civilFromKaliDay. The dṛk choice works in Julian
 * days (UT); the page carries them as t = jd − 588465.5 + meridian ÷ 360, so the same clock rule gives the zone's time.
 * Dates are read by one signed parser: YYYY-MM-DD with an astronomical year, proleptic Gregorian or Julian (kala-dvara.js).
 */
(function () {
  "use strict";
  const K = window.KalaDvara, ST = window.SSTier, A = window.SSAhargana, G = window.SSGrahana, GR = window.SSGraha, PA = window.Parampara;
  const MC = window.ShunyaMath, SD = window.SiddhantaTier, P0 = window.Panchanga;
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const mod = (a, m) => ((a % m) + m) % m;
  const pad2 = (n) => String(n).padStart(2, "0");
  const tick = () => new Promise((resolve) => setTimeout(resolve, 0));
  const now = () => (window.performance && performance.now ? performance.now() : Date.now());
  const safe = (fn, fallback) => { try { return fn(); } catch (e) { return fallback; } };
  const timings = (window.__siddhantaTimings = {});

  const STORE_KEY = "bharat.siddhanta-panchanga/1";
  const store = {
    get() { try { const s = localStorage.getItem(STORE_KEY); return s ? JSON.parse(s) : null; } catch (e) { return null; } },
    set(o) { try { localStorage.setItem(STORE_KEY, JSON.stringify(o)); } catch (e) { /* not kept: the page still works */ } },
  };
  /** The Laṅkā–Ujjayinī meridian in degrees east of Greenwich: the MODERN position of Ujjain (the value math-core.js
   *  uses, UJJAIN_LONGITUDE_DEG), not a figure from the text. The user may change it in the advanced field. */
  const UJJAYINI_MERIDIAN_DEG = 75.7885;
  const KALI_JD0 = ST.KALI_JD0;                        // JD (UT) of Greenwich midnight opening Kali day 0 (ss-tier.js)
  const TEXT_SPAN = ST.SPAN_YEARS;                     // the span the text tiers are tested over
  /** Approximate coordinates and standard UTC offsets; the page says so and asks for one's own. */
  const CITIES = Object.freeze([
    { id: "ujjain", dev: "उज्जयिनी", en: "Ujjain", lat: 23.1765, lon: UJJAYINI_MERIDIAN_DEG, off: 5.5 },
    { id: "delhi", dev: "दिल्ली", en: "Delhi", lat: 28.61, lon: 77.21, off: 5.5 },
    { id: "mumbai", dev: "मुम्बई", en: "Mumbai", lat: 19.08, lon: 72.88, off: 5.5 },
    { id: "kolkata", dev: "कोलकाता", en: "Kolkata", lat: 22.57, lon: 88.36, off: 5.5 },
    { id: "chennai", dev: "चेन्नई", en: "Chennai", lat: 13.08, lon: 80.27, off: 5.5 },
    { id: "bengaluru", dev: "बेंगलूरु", en: "Bengaluru", lat: 12.97, lon: 77.59, off: 5.5 },
    { id: "hyderabad", dev: "हैदराबाद", en: "Hyderabad", lat: 17.39, lon: 78.49, off: 5.5 },
    { id: "varanasi", dev: "वाराणसी", en: "Varanasi", lat: 25.32, lon: 83.01, off: 5.5 },
    { id: "ahmedabad", dev: "अहमदाबाद", en: "Ahmedabad", lat: 23.02, lon: 72.57, off: 5.5 },
    { id: "jaipur", dev: "जयपुर", en: "Jaipur", lat: 26.91, lon: 75.79, off: 5.5 },
    { id: "puri", dev: "पुरी", en: "Puri", lat: 19.81, lon: 85.83, off: 5.5 },
    { id: "thiruvananthapuram", dev: "तिरुवनन्तपुरम्", en: "Thiruvananthapuram", lat: 8.52, lon: 76.94, off: 5.5 },
    { id: "guwahati", dev: "गुवाहाटी", en: "Guwahati", lat: 26.14, lon: 91.74, off: 5.5 },
    { id: "srinagar", dev: "श्रीनगर", en: "Srinagar", lat: 34.08, lon: 74.8, off: 5.5 },
    { id: "kathmandu", dev: "काठमाण्डू", en: "Kathmandu", lat: 27.72, lon: 85.32, off: 5.75 },
    { id: "thimphu", dev: "थिम्फू", en: "Thimphu", lat: 27.47, lon: 89.64, off: 6 },
    { id: "dhaka", dev: "ढाका", en: "Dhaka", lat: 23.81, lon: 90.41, off: 6 },
    { id: "colombo", dev: "कोलम्बो", en: "Colombo", lat: 6.93, lon: 79.86, off: 5.5 },
  ]);
  const VARA_DEV = ["रवि", "सोम", "मंगल", "बुध", "गुरु", "शुक्र", "शनि"], VARA_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const MON_EN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const MON_EN_FULL = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const MON_DEV = ["जनवरी", "फ़रवरी", "मार्च", "अप्रैल", "मई", "जून", "जुलाई", "अगस्त", "सितम्बर", "अक्टूबर", "नवम्बर", "दिसम्बर"];
  const CALENDARS = Object.freeze({ gregorian: "Gregorian", julian: "Julian" });

  // ── the three choices ────────────────────────────────────────────────────────────────────────────────
  const TIERS = MC.TIERS, TIER_IDS = MC.TIER_IDS;
  const shared = MC.yantraState();                      // the choice is shared with the other pages ('tier' key)
  const isRefusal = (e) => !!(e && e.code === "TIER_OUT_OF_SPAN");
  /** A dṛk value, or the tier's own refusal when siddhanta-tier.js answers null (outside its span). */
  const drikOr = (v, jd, what) => { if (v === null || v === undefined) throw new MC.TierSpanError("drik", jd, what); return v; };

  /** The paramparā record for the default choice: corpus/parampara/registry.json and samskara.json, read once at load
   *  from this page's own origin (sw.js keeps them offline), handed to ss-tier.js through parampara.js. */
  const RECORD = Object.freeze({ registry: "corpus/parampara/registry.json", samskara: "corpus/parampara/samskara.json" });
  const record = { state: "loading", error: null };
  const recordReady = (async () => {
    try {
      const get = async (u) => { const r = await fetch(u); if (!r.ok) throw new Error(`${u}: ${r.status} ${r.statusText}`); return r.json(); };
      const [registry, samskara] = await Promise.all([get(RECORD.registry), get(RECORD.samskara)]);
      ST.useParampara(PA.load({ registry, samskara }));
      record.state = "ready";
    } catch (e) { record.state = "unavailable"; record.error = e && e.message ? e.message : String(e); }
    document.body.dataset.parampara = record.state;
  })();

  /** The engine of a choice. Text tiers: the sovereign modules bound to the tier's places by ss-tier.js (the plain text is
   *  the modules themselves). dṛk: math-core.js and siddhanta-tier.js, wrapped below. */
  const engines = new Map();
  function engineOf(id) {
    if (engines.has(id)) return engines.get(id);
    const T = TIERS[id];
    let E;
    if (T.family === "ss") {
      if (T.samskara && record.state !== "ready") {
        throw new Error(record.state === "loading" ? "the paramparā record is still being read; one moment"
          : `${T.label} needs the paramparā record (${RECORD.registry}, ${RECORD.samskara}), which could not be read here (${record.error}). Choose another computation.`);
      }
      const o = { samskara: T.samskara };
      E = { id, family: "ss", T, opts: o, P: ST.calendar(o), U: ST.utsava(o), MU: ST.muhurta(o), D: ST.dasha(o) };
      E.label = ST.label(o);
    } else E = { id, family: "drik", T, P: P0 };
    engines.set(id, E);
    return E;
  }
  let tier = TIER_IDS[0];
  let linkNote = "";
  try { tier = MC.pageTier(shared.get().tier); }
  catch (e) { tier = MC.pageTier(""); linkNote = `The link asked for the computation “${String(shared.get().tier)}”, which is not one of the choices; the default is shown and nothing was stored. `; }
  const tierTitle = (id) => `${TIERS[id].labelSa} · ${TIERS[id].label}`;

  // ── the place and the clock ───────────────────────────────────────────────────────────────────────
  const cityOf = (id) => CITIES.find((c) => c.id === id) || null;
  const nameOfCity = (c) => `${c.dev} · ${c.en}`;
  function readPlace() {
    const lat = Number($("lat").value), lon = Number($("lon").value), off = Number($("off").value);
    const mer = $("mer").value === "" ? UJJAYINI_MERIDIAN_DEG : Number($("mer").value);
    if ($("lat").value === "" || !Number.isFinite(lat) || lat < -90 || lat > 90) throw new Error("Give a latitude between −90 and 90.");
    if ($("lon").value === "" || !Number.isFinite(lon) || lon < -180 || lon > 180) throw new Error("Give a longitude between −180 and 180.");
    if ($("off").value === "" || !Number.isFinite(off) || off < -12 || off > 14) throw new Error("Give a UTC offset between −12 and +14 hours.");
    if (!Number.isFinite(mer) || mer < -180 || mer > 180) throw new Error("Give the Ujjayinī meridian in degrees east.");
    const c = cityOf($("city").value);
    return { lat, lon, off, mer, city: c ? c.id : "custom", name: c ? nameOfCity(c) : "your place" };
  }
  const siteOf = (pl) => ({ latitude: pl.lat, deshantara: pl.lon - pl.mer });
  const zoneLabel = (off) => { const s = off < 0 ? "−" : "+", a = Math.abs(off), h = Math.floor(a + 1e-9), m = Math.round((a - h) * 60); return `UTC${s}${pad2(h)}:${pad2(m)}`; };
  /** Engine instant → the zone's Kali day (its civil date) and its hour and minute. */
  function clockOf(t, pl) {
    const z = t - pl.mer / 360 + pl.off / 24;
    let N = Math.floor(z), min = Math.round((z - N) * 1440);
    if (min >= 1440) { N += 1; min -= 1440; }
    return { N, hh: Math.floor(min / 60), mm: min % 60 };
  }
  /** The zone's civil day and clock time → engine instant. */
  const instantOf = (N, hours, pl) => N + hours / 24 + pl.mer / 360 - pl.off / 24;
  /** A Julian day (UT) as the page's instant, and back (the dṛk choice). */
  const tOfJd = (jd, pl) => jd - KALI_JD0 + pl.mer / 360;
  const jdOfT = (t, pl) => t + KALI_JD0 - pl.mer / 360;
  /** Local civil midnight of the zone's day N, as a Julian day (UT). */
  const midnightJd = (N, pl) => N + KALI_JD0 - pl.off / 24;
  const cal = () => ($("calendar").value === "julian" ? "julian" : "gregorian");
  const kaliOf = (y, m, d) => K.kaliDayFromCivil({ calendar: cal(), year: y, month: m, day: d });
  const civil = (N) => K.civilFromKaliDay(N, cal());
  const yStr = (y) => (y < 0 ? `−${Math.abs(y)}` : String(y));
  const isoOfCivil = (c) => `${c.year < 0 ? "-" : ""}${String(Math.abs(c.year)).padStart(4, "0")}-${pad2(c.month)}-${pad2(c.day)}`;
  const isoOf = (N) => isoOfCivil(civil(N));
  const dayLabel = (N) => { const c = civil(N), v = K.varaOfKaliDay(N).index; return `${VARA_EN[v]} ${c.day} ${MON_EN[c.month - 1]}`; };
  const dateLabel = (N) => { const c = civil(N); return `${c.day} ${MON_EN[c.month - 1]} ${yStr(c.year)}`; };
  /** "HH:MM", with the day added when it is not the reference day. */
  function tStr(t, pl, refN) {
    if (t === null || t === undefined || !Number.isFinite(t)) return "—";
    const c = clockOf(t, pl);
    const day = refN === undefined || c.N === refN ? "" : ` <span class="nd">(${esc(dayLabel(c.N))})</span>`;
    return `<span class="t">${pad2(c.hh)}:${pad2(c.mm)}</span>${day}`;
  }
  /** Sexagesimal split of a count in ghaṭī: ghaṭī, vināḍī. */
  function ghStr(g) {
    if (g === null || g === undefined) return "";
    if (typeof g === "object") return `${g.ghati} घ ${pad2(g.vinadi)} वि`;
    if (!Number.isFinite(g)) return "";
    const neg = g < 0, a = Math.abs(g); let gh = Math.floor(a), vi = Math.round((a - gh) * 60);
    if (vi === 60) { gh += 1; vi = 0; }
    return `${neg ? "−" : ""}${gh} घ ${pad2(vi)} वि`;
  }
  const dms = (deg) => { const s = Math.round(Math.abs(deg) * 3600); return `${deg < 0 ? "−" : ""}${Math.floor(s / 3600)}° ${pad2(Math.floor(s / 60) % 60)}′ ${pad2(s % 60)}″`; };

  /** One signed date parser for every date on the page: YYYY-MM-DD, astronomical year (0 = 1 BCE), in the chosen calendar,
   *  checked by kala-dvara.js (no Date object, so years 0–99 and five-digit years are what they say). */
  const DATE_RE = /^\s*([-−]?\d{1,5})-(\d{1,2})-(\d{1,2})\s*$/;
  function parseDate(text, what) {
    const m = DATE_RE.exec(String(text == null ? "" : text));
    if (!m) throw new Error(`${what}: write YYYY-MM-DD with an astronomical year (0 = 1 BCE), for example 2026-10-08 or -3101-01-23.`);
    const year = Number(m[1].replace("−", "-")) + 0, month = Number(m[2]), day = Number(m[3]);
    if (year < TEXT_SPAN[0] || year > TEXT_SPAN[1]) throw new Error(`${what}: year ${yStr(year)} is outside ${yStr(TEXT_SPAN[0])} … ${TEXT_SPAN[1]}, the span the text's choices are tested over.`);
    if (month < 1 || month > 12) throw new Error(`${what}: month ${month} is not 1–12.`);
    let N;
    try { N = K.kaliDayFromCivil({ calendar: cal(), year, month, day }); }
    catch (e) { throw new Error(`${what}: ${yStr(year)}-${pad2(month)}-${pad2(day)} does not exist in the ${CALENDARS[cal()]} calendar.`); }
    return { year, month, day, N };
  }
  /** "Gregorian 2026-10-08 = Julian 2026-09-25 · 2026 CE" — the other calendar and the era. */
  function dateHelp(N) {
    const c = civil(N), other = cal() === "gregorian" ? "julian" : "gregorian", o = K.civilFromKaliDay(N, other);
    return `${CALENDARS[cal()]} ${isoOfCivil(c)} = ${CALENDARS[other]} ${isoOfCivil(o)} · ${c.year <= 0 ? `${1 - c.year} BCE` : `${c.year} CE`} (astronomical year ${yStr(c.year)}) · ${K.varaOfKaliDay(N).name} · Kali day ${N}`;
  }

  /** The status of an item, from the module's own source or status string. */
  function tagOf(src) {
    const s = String(src || "");
    const practice = /unverified|standard usage|no local text|common practice|\[standard|\[convention/i.test(s), cites = /\b(SS|BPHS)\b/.test(s);
    if (practice && (!cites || /^(standard usage|unverified|common practice)/i.test(s))) return `<span class="tag cp">प्रचलन · common practice, unverified</span>`;
    if (practice) return `<span class="tag mixed">पाठ + प्रचलन · text + practice</span>`;
    if (/\[reading/.test(s)) return `<span class="tag text">पाठ · text (a reading)</span>`;
    return `<span class="tag text">पाठ · text</span>`;
  }
  const srcLine = (s) => (s ? ` <span class="src">${esc(s)}</span>` : "");

  /** The labels of a choice, as math-core.js states them (M.TIERS), with the ayanāṃśa's value at jd where it is served. */
  function labelsHtml(id, jd, where) {
    const T = TIERS[id];
    let ay = null;
    if (Number.isFinite(jd)) { try { ay = MC.tierAyanamsha(jd, id); } catch (e) { ay = null; } }
    const rows = [["engine", T.engine]];
    if (T.reduction) rows.push(["reduction", T.reduction]);
    rows.push(["ayanāṃśa", `${T.ayanamsha.name}${ay ? ` = ${dms(ay.deg)} here` : ""} — ${T.ayanamsha.source}`]);
    rows.push(["obliquity", T.obliquity], ["time", T.time], ["sunrise", T.sunrise]);
    if (T.moonrise) rows.push(["moonrise", T.moonrise]);
    rows.push(["day", T.dayBoundary], ["karaṇa order", T.karanaOrder], ["month", T.month], ["year start", T.yearStart], ["saṃvatsara", T.samvatsara],
      ["daśā year", `${T.dashaYear.days} civil days — ${T.dashaYear.source}`], ["ahargaṇa", T.ahargana]);
    if (T.rahu) rows.push(["Rāhu", T.rahu]);
    rows.push(["span", `${yStr(T.span.years[0])} … ${T.span.years[1]} — ${T.span.basis}${T.span.yearRule ? ` (${T.span.yearRule})` : ""}${T.span.accuracyMeasured ? `; measured in the repository's tests: ${T.span.accuracyMeasured}` : ""}`],
      ["provenance", T.provenance]);
    return `<details class="tl" data-tier="${esc(id)}" data-where="${esc(where)}"><summary>गणना · computed by <b>${esc(tierTitle(id))}</b> — ayanāṃśa ${esc(T.ayanamsha.name)}${ay ? ` ${esc(dms(ay.deg))}` : ""}; ${esc(T.sunrise.split(";")[0])}</summary>`
      + `<dl>${rows.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join("")}</dl></details>`;
  }
  function setLabels(where, jd) { const el = $(`tl-${where}`); if (el) el.innerHTML = labelsHtml(tier, jd, where); }
  /** The dṛk choice's refusal, said plainly, with the two text choices offered. */
  function refusalHtml(e) {
    return `<div class="refusal" role="note" data-refused="drik"><b>${esc(TIERS.drik.labelSa)} · ${esc(TIERS.drik.label)}: not served here.</b> ${esc(e && e.message ? e.message : String(e))}`
      + `<br>${TIER_IDS.filter((id) => TIERS[id].family === "ss").map((id) => `<button type="button" class="use-tier" data-use-tier="${esc(id)}">${esc(tierTitle(id))} — use this</button>`).join("")}</div>`;
  }

  // ── the month's name, the limbs' names ──────────────────────────────────────────────────────────────
  /** The month's name in the chosen reckoning. Amānta is the tier's (named by saṅkrānti). Pūrṇimānta [common practice]:
   *  the dark half takes the name of the next amānta month; an adhika month stays adhika, new moon to new moon. */
  function monthIn(E, m, krishna, scheme) {
    if (scheme === "purnimanta" && krishna && !m.adhika && !m.refused) {
      const nx = monthAt(E, m.end + 0.5);
      if (!nx.refused) return { name: nx.name, adhika: false, kshaya: nx.kshaya, dropped: nx.kshayaDropped, converted: true };
    }
    return { name: m.name, adhika: m.adhika, kshaya: m.kshaya, dropped: m.kshayaDropped, converted: false, refused: m.refused };
  }
  const monthStr = (x) => (x.refused ? `<span class="muted">refused (the dṛk choice's span)</span>` : `${esc(x.name)}${x.adhika ? " · अधिक adhika" : ""}${x.kshaya ? ` · क्षय kṣaya (${esc(x.dropped)} dropped)` : ""}`);
  const tithiShort = (i) => { const n = P0.tithiName(i); return `${n.paksha === "śukla" ? "śu" : "kṛ"} ${n.name}`; };
  const tithiLong = (i) => { const n = P0.tithiName(i); return `${n.paksha} ${n.name}`; };
  /** The karaṇa k (1…60) in the dṛk choice's common order: Śakuni, Catuṣpada, Nāga, Kiṃstughna (M.TIERS.drik.karanaOrder);
   *  the movable seven and the names are panchanga.js's. */
  const drikKarana = (k) => (k === 59 ? P0.karanaName(60) : k === 60 ? P0.karanaName(59) : P0.karanaName(k));

  // ── the dṛk choice, through math-core.js and siddhanta-tier.js ───────────────────────────────────────
  /** The series' Sun and Moon on a window of Julian days (SiddhantaTier.table: the series at 6-hour nodes, interpolated),
   *  or the tier's refusal when any node is outside its span. */
  function drikTable(jd0, jd1) { return drikOr(SD.table(jd0, jd1, 0.25), jd0 < 2451545 ? jd0 : jd1, "the Sun and the Moon"); }
  const LIMB = Object.freeze({
    tithi: { f: (s) => s.elongation, unit: 12 },
    nakshatra: { f: (s) => s.moonSid, unit: 40 / 3 },
    yoga: { f: (s) => s.sunSid + s.moonSid, unit: 40 / 3 },
    karana: { f: (s) => s.elongation, unit: 6 },
  });
  const limbIndex = (s, key) => Math.floor(mod(LIMB[key].f(s), 360) / LIMB[key].unit) + 1;      // 1-based, as panchanga.js
  const limbsOf = (s) => ({ tithi: limbIndex(s, "tithi"), nakshatra: limbIndex(s, "nakshatra"), yoga: limbIndex(s, "yoga"), karana: limbIndex(s, "karana"),
    pada: Math.floor(mod(s.moonSid, 40 / 3) / (10 / 3)) + 1, sun: s.sunSid, moon: s.moonSid });
  /** The first instant after jd (≤ limit) at which the limb changes: a scan of 0.02 d, then bisection on the table. */
  function drikNextChange(at, jd, key, limit) {
    const i0 = limbIndex(at(jd), key), step = 0.02;
    for (let x = jd + step; x <= limit; x += step) {
      if (limbIndex(at(x), key) !== i0) {
        let lo = x - step, hi = x;
        for (let k = 0; k < 40; k++) { const mid = (lo + hi) / 2; if (limbIndex(at(mid), key) === i0) lo = mid; else hi = mid; }
        return hi;
      }
    }
    return null;
  }
  /** The dṛk civil day N at the place: math-core's tierDay at the zone's noon (sunrise to sunrise, the series' sunrise). */
  function drikDayOf(N, pl) {
    const d = MC.tierDay(midnightJd(N, pl) + 0.5, pl.lat, pl.lon, pl.off, "drik");
    return d;
  }
  /** The dṛk month holding jd (math-core skyLunarMonth), as the page's month object (t), or a refused one. */
  function drikMonth(jd, pl) {
    try {
      const m = MC.skyLunarMonth(jd);
      return { name: m.name, adhika: m.adhika, kshaya: m.kshaya, kshayaDropped: m.kshayaDropped, start: tOfJd(m.startJd, pl), end: tOfJd(m.endJd, pl), rule: m.rule };
    } catch (e) { if (!isRefusal(e)) throw e; return { refused: true, reason: e.message, rule: TIERS.drik.month }; }
  }
  /** The month holding instant t in a choice. */
  let curPl = null;
  function monthAt(E, t) {
    if (E.family === "ss") return E.P.lunarMonth(t);
    return drikMonth(jdOfT(t, curPl), curPl);
  }
  /** The dṛk day's pañcāṅga in the shape of panchanga.js's panchanga(N): limbs at the series' sunrise with their ends. */
  function drikPanchanga(N, pl) {
    const d = drikDayOf(N, pl);
    if (d.polar) return { N, polar: true };
    const rise = d.sunriseJd, next = d.nextSunriseJd, set = d.sunsetJd;
    const tb = drikTable(rise - 0.3, rise + 2.75), at = (jd) => tb.at(jd);
    const limit = Math.min(tb.jd1, rise + 2.7);
    const limb = (key, nameOf) => {
      const out = []; let x = rise;
      for (let i = 0; i < 4; i++) {
        const idx = limbIndex(at(x), key), end = drikNextChange(at, x, key, limit);
        out.push({ index: idx, ...nameOf(idx), end: end === null ? null : tOfJd(end, pl), endAfterSunrise: end === null ? null : (end - rise) * 60 });
        if (end === null || end >= next) break;
        x = end + 1e-6;
      }
      return out;
    };
    const L = limbsOf(at(rise));
    const RASHI = P0.RASHI;
    return {
      N: d.N, drik: true, vara: K.varaOfKaliDay(d.N).name, varaIndex: d.varaIndex,
      sunrise: tOfJd(rise, pl), sunset: tOfJd(set, pl), nextSunrise: tOfJd(next, pl), riseJd: rise,
      dayGhati: null, nightGhati: null, dayGhatiCivil: (set - rise) * 60, nightGhatiCivil: (next - set) * 60,
      tithi: limb("tithi", (i) => P0.tithiName(i)), nakshatra: limb("nakshatra", (i) => ({ name: P0.NAKSHATRA[i - 1] })),
      yoga: limb("yoga", (i) => ({ name: P0.YOGA[i - 1] })), karana: limb("karana", (i) => ({ name: drikKarana(i) })),
      sunRashi: RASHI[Math.floor(mod(L.sun, 360) / 30)], moonRashi: RASHI[Math.floor(mod(L.moon, 360) / 30)], pada: L.pada,
      month: drikMonth(rise, pl), ayanamsha: MC.tierAyanamsha(rise, "drik").deg, rule: d.rule,
    };
  }

  // ── state ─────────────────────────────────────────────────────────────────────────────────────────
  let gen = 0, eclGen = 0;
  const cache = { yearKey: null, year: null, yearMs: 0, yearShown: null, monthKey: null, eclKey: null, varshaKey: null };
  const say = (text, bad) => { const m = $("msg"); m.textContent = text; m.className = bad ? "bad" : "muted"; };
  const scheme = () => (document.querySelector('input[name="scheme"]:checked') || {}).value || "amanta";
  const selectedN = () => parseDate($("date").value, "The date").N;
  const deviceToday = () => { const d = new Date(); return K.kaliDayFromCivil({ calendar: "gregorian", year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate() }); };
  const timed = (key, el, t0, extra) => { const ms = Math.round(now() - t0); timings[key] = ms; if (el) $(el).textContent = `Computed on this device in ${ms} ms${extra || ""}.`; return ms; };

  /** The module's civil day whose sunrise falls on date N of the user's clock (they differ only for far-off zones). */
  function moduleDay(E, N, site, pl) {
    let Md = N;
    for (let i = 0; i < 2; i++) {
      const r = E.P.sunrise(Md, site); if (r === null) break;
      const c = clockOf(r, pl).N; if (c === N) break;
      Md += c < N ? 1 : -1;
    }
    return Md;
  }

  // ── २ the day ─────────────────────────────────────────────────────────────────────────────────────
  function computeDay(E, N, site, pl) {
    if (E.family === "drik") {
      const p = drikPanchanga(N, pl);
      if (p.polar) return { N, Md: N, polar: true };
      const mr = MC.lunarRiseSet(midnightJd(N, pl), pl.lat, pl.lon, pl.off, "drik");
      const ext = MC.panchangExtended(p.riseJd + 1e-6, pl.lat, pl.lon, pl.off, "drik");
      return { N, Md: N, p, moonriseDrik: mr, ext };
    }
    const Md = moduleDay(E, N, site, pl);
    const p = E.P.panchanga(Md, site);
    if (p.polar) return { N, Md, polar: true };
    // the saṃvatsara by SS 1.55 at sunrise (ss-graha.js), and the lunisolar year holding the sunrise (ss-ahargana.js
    // lunarYear on the tier's calendar module)
    return { N, Md, p, moonrise: safe(() => E.U.moonrise(Md, site), null), samvatsara: GR.samvatsara(p.sunrise), year: A.lunarYear(p.sunrise, E.P) };
  }
  function seqList(list, pl, N, nameOf, firstExtra) {
    return `<ul class="seq">${list.map((x, i) => `<li><b>${esc(nameOf(x))}</b>${i === 0 && firstExtra ? esc(firstExtra) : ""} — ${x.end === null ? "beyond the search" : `until ${tStr(x.end, pl, N)} <span class="gh">${ghStr(x.endAfterSunrise)}</span>`}</li>`).join("")}</ul>`;
  }
  /** utsava.moonrise searches 1.1 days from sunrise, so its answer can fall after the next sunrise: that is the next
   *  day's moonrise, and this day has none. */
  function moonriseHtml(m, nextRise, rise, pl, N, E) {
    if (m === null || m === undefined) return `<span class="muted">none between this sunrise and the next</span>`;
    if (m >= nextRise) return `<span class="muted">none between this sunrise and the next; the next is at</span> ${tStr(m, pl, N)}`;
    return `${tStr(m, pl, N)} <span class="gh">${ghStr((m - rise) / E.P.NADI_DAYS)}</span>`;
  }
  function renderToday(E, day, pl) {
    const out = $("today");
    if (day.polar) {
      out.dataset.polar = "1";
      out.innerHTML = `<div class="polar" role="note"><b>ध्रुवीय दिन · No sunrise or no sunset here today.</b> At latitude ${esc(pl.lat.toFixed(2))}° the Sun does not cross the horizon on ${esc(dateLabel(day.N))}: it stays above it or below it all day. The pañcāṅga's day runs from one sunrise to the next, so on this day there is none to give at this place. Choose another day or a place nearer the equator.</div>`;
      return;
    }
    delete out.dataset.polar;
    const { p, N } = day, rise = p.sunrise, sch = scheme(), drik = E.family === "drik";
    const krishna = p.tithi[0].paksha === "kṛṣṇa";
    const mo = monthIn(E, p.month, krishna, sch), v = K.varaOfKaliDay(N);
    const vara = day.Md === N ? p.vara : v.name;
    const ghUnit = drik ? "ghaṭī of the civil day (24 minutes)" : "nāḍī of the turn (SS 1.11-1.12)";
    let moonRow;
    if (drik) {
      const r = day.moonriseDrik;
      moonRow = `${r.jdRise === null ? `<span class="muted">none on this civil date</span>` : `${tStr(tOfJd(r.jdRise, pl), pl, N)} <span class="muted">on this civil date</span>`}${r.jdSet === null ? "" : ` · set ${tStr(tOfJd(r.jdSet, pl), pl, N)}`} <span class="src">${esc(r.rule)}</span>`;
    } else moonRow = moonriseHtml(day.moonrise, p.nextSunrise, rise, pl, N, E) + ` <span class="src">the Moon's centre, with no lambana (SS 5) and no refraction (utsava.js)</span>`;
    let monthRow;
    if (p.month.refused) monthRow = `<span class="muted">refused: ${esc(p.month.reason)}</span>`;
    else {
      monthRow = `<b>${monthStr(mo)}</b> <span class="muted">(${sch === "purnimanta" ? "pūrṇimānta" : "amānta"}, ${krishna ? "kṛṣṇa" : "śukla"} pakṣa)</span> ${tagOf(p.month.rule)}<br><span class="src">named by its saṅkrānti: ${esc(p.month.rule)}${mo.converted ? "; the pūrṇimānta dark half takes the next month's name [common practice]" : ""}.`;
      if (p.month.nameByFullMoonNakshatra) monthRow += ` By SS 14.15-14.16's full-moon nakṣatra (${esc(p.month.fullMoonNakshatra)}) it would be ${esc(p.month.nameByFullMoonNakshatra)}${p.month.agree ? ", the same" : ""}.`;
      monthRow += `</span>`;
    }
    let yearRow, samvRow;
    if (drik) {
      const x = day.ext;
      yearRow = x.yearRefused ? `<span class="muted">refused: ${esc(x.yearRefused)}</span>`
        : `Kali ${esc(x.kaliYear)} · Śaka ${esc(x.shakaYear)} · Vikrama ${esc(x.vikramYear)} <span class="src">years gone at the year's start (${esc(x.yearStartRule)})${x.yearEndRefused ? `; ${esc(x.yearEndRefused)}` : ""}</span>`;
      samvRow = x.samvatsara && x.samvatsara.nameIast ? `<b>${esc(x.samvatsara.nameIast)}</b> <span class="muted">${esc(x.samvatsara.name)}</span> <span class="src">${esc(x.samvatsara.rule)}</span>` : `<span class="muted">refused with the year</span>`;
    } else {
      const y = day.year, sv = day.samvatsara;
      yearRow = `Kali ${esc(y.k)} · Śaka ${esc(y.shakaGone)} · Vikrama ${esc(y.vikramaGone)} <span class="src">years gone at the year's start (${esc(y.yearStartRule)}; ss-ahargana.js)</span>`;
      samvRow = `<b>${esc(sv.name)}</b> <span class="muted">at sunrise</span> <span class="src">${esc(sv.source)}, reading ${esc(sv.reading)}: ${esc(TIERS[E.id].samvatsara)}</span>`;
    }
    const rows = [
      ["वार · vāra", `<b>${esc(vara)}</b> <span class="muted">${esc(VARA_DEV[v.index])} · ${esc(VARA_EN[v.index])}, ${esc(dateLabel(N))}</span> <span class="src">${esc(TIERS[E.id].dayBoundary)}</span>`],
      ["तिथि · tithi", seqList(p.tithi, pl, N, (x) => `${x.paksha} ${x.name}`)],
      ["नक्षत्र · nakṣatra", seqList(p.nakshatra, pl, N, (x) => x.name, ` (pada ${p.pada} at sunrise)`)],
      ["योग · yoga", seqList(p.yoga, pl, N, (x) => x.name)],
      ["करण · karaṇa", seqList(p.karana, pl, N, (x) => x.name) + `<span class="src">${esc(TIERS[E.id].karanaOrder)}</span>`],
      ["सूर्योदय · sunrise", `${tStr(rise, pl, N)} <span class="gh">0 घ 00 वि</span> <span class="src">${esc(TIERS[E.id].sunrise)}</span>`],
      ["सूर्यास्त · sunset", `${tStr(p.sunset, pl, N)} <span class="gh">${ghStr(drik ? p.dayGhatiCivil : p.dayGhati)}</span>`],
      ["चन्द्रोदय · moonrise", moonRow],
      ["मास · lunar month", monthRow],
      ["वर्ष · year", yearRow],
      ["संवत्सर · saṃvatsara", samvRow],
      ["सूर्य-राशि · Sun's rāśi", `${esc(p.sunRashi)} <span class="muted">at sunrise</span>`],
      ["चन्द्र-राशि · Moon's rāśi", `${esc(p.moonRashi)} <span class="muted">at sunrise</span>`],
      ["अयनांश · ayanāṃśa", `${esc(dms(p.ayanamsha))} <span class="src">${esc(TIERS[E.id].ayanamsha.name)} — ${esc(TIERS[E.id].ayanamsha.source)}</span>`],
      ["दिनमान · day", drik ? `${ghStr(p.dayGhatiCivil)} <span class="src">${esc(ghUnit)}</span>` : `${ghStr(p.dayGhati)} <span class="src">ghaṭī of the turn; ${esc(ghStr(p.dayGhatiCivil))} of the civil day</span>`],
      ["रात्रिमान · night", drik ? `${ghStr(p.nightGhatiCivil)} <span class="src">${esc(ghUnit)}</span>` : `${ghStr(p.nightGhati)} <span class="src">ghaṭī of the turn; ${esc(ghStr(p.nightGhatiCivil))} of the civil day</span>`],
    ];
    out.innerHTML = `<dl class="pan">${rows.map(([k, v2]) => `<dt>${k}</dt><dd>${v2}</dd>`).join("")}</dl>`
      + `<p class="src">Kali day ${esc(N)} (ahargaṇa from the Kali epoch: ${esc(TIERS[E.id].ahargana)}). Counts after sunrise in ${esc(ghUnit)}.${drik ? " Limb ends: the series' Sun and Moon at 6-hour nodes, interpolated (siddhanta-tier.js table)." : ""} Names: ${esc(P0.NAMES_SOURCE.standard_unverified)}.</p>`;
  }

  // ── ३ the parts of the day ──────────────────────────────────────────────────────────────────────────
  /** In three steps with a breath between them (varjya and the lagnas take a few hundred milliseconds). */
  async function computeKala(E, day, site, g) {
    if (day.polar) return null;
    if (E.family === "drik") return { drik: true, abhijit: day.ext.abhijit, solar: day.ext.solar };
    const k = { W: E.U.kalaWindows(day.Md, site, {}, { moon: true }), mu: E.MU.muhurtas(day.Md, site), rise: day.p.sunrise,
      lagnaMethod: safe(() => E.P.lagnaAt(day.p.sunrise, site).method, "") };
    await tick(); if (g !== gen) return k;
    k.vj = safe(() => E.MU.varjya(day.Md, site), null);
    await tick(); if (g !== gen) return k;
    k.lg = safe(() => E.MU.lagnas(day.Md, site), null);
    return k;
  }
  function renderKala(E, k, day, pl) {
    const out = $("kala-out");
    if (!k) { out.innerHTML = `<p class="polar">No sunrise or no sunset at this place today, so the day has no parts to divide.</p>`; return; }
    const N = day.N;
    if (k.drik) {
      const a = k.abhijit;
      out.innerHTML = `<p><b>अभिजित् · Abhijit</b>: ${a ? `${tStr(tOfJd(a.startJd, pl), pl, N)} – ${tStr(tOfJd(a.endJd, pl), pl, N)} ${tagOf(a.source)}${srcLine(a.source)}` : "—"}</p>`
        + `<p class="muted small">Not computed in this choice: the five-fold day (utsava.js), the thirty muhūrtas and the varjya windows (muhurta.js) and the rising signs (panchanga.js) are the Sūrya-Siddhānta's own divisions on the text's sunrise; the dṛk choice has no module of its own for them here. Choose one of the text's computations above to see them.</p>`;
      return;
    }
    if (!k.W) { out.innerHTML = `<p class="polar">No sunrise or no sunset at this place today, so the day has no parts to divide.</p>`; return; }
    const { W, mu, rise } = k;
    const ghAfter = (t) => (t - rise) / E.P.NADI_DAYS;
    const span = (w) => (w ? `${tStr(w[0], pl, N)} – ${tStr(w[1], pl, N)} <span class="gh">${ghStr(ghAfter(w[0]))} – ${ghStr(ghAfter(w[1]))}</span>` : `<span class="muted">—</span>`);
    const parts = [["प्रातः · prātaḥ", W.pratah], ["सङ्गव · saṅgava", W.sangava], ["मध्याह्न · madhyāhna", W.madhyahna], ["अपराह्ण · aparāhṇa", W.aparahna], ["सायाह्न · sāyāhna", W.sayahna]];
    const more = [["पूर्वाह्ण · pūrvāhṇa (first half of the day)", W.purvahna], ["अरुणोदय · aruṇodaya (four ghaṭī before sunrise)", W.arunodaya], ["प्रदोष · pradoṣa (first fifth of the night)", W.pradosha], ["निशीथ · niśītha (the night's eighth fifteenth)", W.nishitha]];
    let h = `<h3>पञ्चधा दिन · the five-fold day ${tagOf(W.status)}</h3><p class="src">${esc(W.status)} (utsava.js kalaWindows)</p>`
      + `<div class="scroll"><table><tbody>${parts.concat(more).map(([n, w]) => `<tr><th scope="row">${n}</th><td>${span(w)}</td></tr>`).join("")}`
      + `<tr><th scope="row">चन्द्रोदय · candrodaya</th><td>${moonriseHtml(W.candrodaya ? W.candrodaya[0] : null, W.next, rise, pl, N, E)}</td></tr></tbody></table></div>`;
    if (mu) {
      const chip = (x, label) => `<div class="chip${label ? " hi" : ""}">${x.index <= 15 ? x.index : x.index - 15}${x.part === "night" ? " ☾" : ""} · ${tStr(x.start, pl, N)}–${tStr(x.end, pl, N)}${label ? ` <b>${label}</b>` : ""}</div>`;
      h += `<h3>मुहूर्त · muhūrtas ${tagOf(mu.division)}</h3><p class="src">Fifteen equal parts of the day and fifteen of the night: ${esc(mu.division)} (muhurta.js). The engine numbers them; it does not name them.</p>`
        + `<p><b>अभिजित् · Abhijit</b> (the day's 8th): ${span([mu.abhijit.start, mu.abhijit.end])} ${tagOf(mu.abhijit.source)}<br><b>ब्राह्म · Brāhma</b> (the night's 14th): ${span([mu.brahma.start, mu.brahma.end])} ${tagOf(mu.brahma.source)}</p>`
        + `<details><summary>all thirty muhūrtas</summary><div class="chips">${mu.list.map((x) => chip(x, x.index === 8 ? "Abhijit" : x.index === 29 ? "Brāhma" : "")).join("")}</div><p class="src">☾ = of the night.</p></details>`;
    }
    if (k.vj) {
      h += `<h3>वर्ज्य · windows the texts say to avoid</h3>`
        + (k.vj.length ? `<ul class="flist">${k.vj.map((w) => `<li><b>${esc(w.kind)}</b> ${w.start === w.end ? `at ${tStr(w.start, pl, N)}` : `${tStr(w.start, pl, N)} – ${tStr(w.end, pl, N)}`} ${tagOf(w.source)}${srcLine(w.source + (w.note ? "; " + w.note : ""))}</li>`).join("")}</ul>`
          : `<p class="muted">None touches this day.</p>`)
        + `<p class="src">muhurta.js varjya: gaṇḍānta (SS 11.21-11.22; BPHS 92.2-92.4), Vyatīpāta and Vaidhṛti, riktā tithis, Viṣṭi, and the pātas of equal declination (SS 11.1-11.12).</p>`;
    }
    if (k.lg && k.lg.length) {
      h += `<details><summary>लग्न · the rising signs through the day</summary><div class="scroll"><table><thead><tr><th scope="col">लग्न · lagna</th><th scope="col">from</th><th scope="col">to</th></tr></thead><tbody>`
        + k.lg.map((L) => `<tr><td>${esc(L.rashi)}</td><td>${L.startsBeforeSunrise ? `<span class="muted">before sunrise</span>` : tStr(L.start, pl, N)}</td><td>${tStr(L.end, pl, N)}</td></tr>`).join("")
        + `</tbody></table></div><p class="src">${esc(k.lagnaMethod)} (panchanga.js lagnaAt).</p></details>`;
    }
    h += `<p class="muted small">Rāhukāla, yamagaṇḍa, gulika-kāla and choghaḍiyā are not shown: no module of the text's engine computes them, and the page does not invent them.</p>`;
    out.innerHTML = h;
  }

  // ── ५ the year: its months, adhika and kṣaya ────────────────────────────────────────────────────────
  /** The lunisolar year Kali k in a choice: text — ss-ahargana.js yearOfKali on the tier's calendar module; dṛk —
   *  math-core panchangExtended (the year's numbers, start, end and saṃvatsara) and skyLunarMonth for each month. */
  function computeVarsha(E, k, pl) {
    if (E.family === "ss") {
      const y = A.yearOfKali(k, E.P);
      const sv0 = GR.samvatsara(y.start), change = GR.samvatsaraChangeAfter(y.start);
      const sv1 = change < y.end ? GR.samvatsara(change + 1e-6) : null;
      return { family: "ss", k: y.k, shaka: y.shakaGone, vikrama: y.vikramaGone, start: y.start, end: y.end, mesha: y.mesha, rule: y.yearStartRule,
        months: y.months.map((m) => ({ name: m.name, adhika: m.adhika, kshaya: m.kshaya, kshayaDropped: m.kshayaDropped, start: m.start, end: m.end, fullMoonNakshatra: m.fullMoonNakshatra })),
        samvatsara: { name: sv0.name, source: sv0.source, reading: sv0.reading, at: "at the year's start", changeAt: sv1 ? change : null, next: sv1 ? sv1.name : null } };
    }
    const Y = k - 3101, jdMid = midnightJd(K.kaliDayFromCivil({ calendar: "gregorian", year: Y, month: 7, day: 1 }), pl) + 0.5;
    const x = MC.panchangExtended(jdMid, pl.lat, pl.lon, pl.off, "drik");
    if (x.yearRefused) throw new MC.TierSpanError("drik", jdMid - 200, "the year's start");
    const months = []; let jd = x.yearStartJd + 1, guard = 0;
    while ((x.yearEndJd === null || jd < x.yearEndJd) && guard++ < 14) {
      const m = drikMonth(jd, pl);
      if (m.refused) { months.push({ refused: true, reason: m.reason }); break; }
      months.push({ name: m.name, adhika: m.adhika, kshaya: m.kshaya, kshayaDropped: m.kshayaDropped, start: m.start, end: m.end });
      jd = jdOfT(m.end, pl) + 1;
    }
    return { family: "drik", k: x.kaliYear, shaka: x.shakaYear, vikrama: x.vikramYear, start: tOfJd(x.yearStartJd, pl), end: x.yearEndJd === null ? null : tOfJd(x.yearEndJd, pl),
      endRefused: x.yearEndRefused, rule: x.yearStartRule, months,
      samvatsara: { name: x.samvatsara.nameIast, source: x.samvatsara.source, reading: x.samvatsara.reading, at: "at the year's start, held for the year", changeAt: null, next: null } };
  }
  function renderVarsha(E, y, pl) {
    const adh = y.months.filter((m) => m.adhika), ksh = y.months.filter((m) => m.kshaya);
    const at = (t) => (t === null ? "—" : `${esc(dateLabel(clockOf(t, pl).N))} ${tStr(t, pl, clockOf(t, pl).N)}`);
    let h = `<p class="lead"><b>Kali ${esc(y.k)}</b> · Śaka ${esc(y.shaka)} · Vikrama ${esc(y.vikrama)} <span class="src">(years gone at the year's start)</span></p>`
      + `<p>From the new moon of ${at(y.start)} to ${y.end === null ? `<span class="muted">refused: ${esc(y.endRefused || "outside the span")}</span>` : at(y.end)}${y.end === null ? "" : ` (${esc((y.end - y.start).toFixed(2))} days)`}. <span class="src">${esc(y.rule)}</span></p>`
      + `<p>संवत्सर · saṃvatsara: <b>${esc(y.samvatsara.name)}</b> ${esc(y.samvatsara.at)}${y.samvatsara.changeAt !== null ? `; by SS 1.55 the name follows mean Jupiter at the instant, so it becomes <b>${esc(y.samvatsara.next)}</b> on ${at(y.samvatsara.changeAt)}` : ""}. <span class="src">${esc(TIERS[E.id].samvatsara)}</span></p>`
      + `<p id="varsha-count"><b>${y.months.filter((m) => !m.refused).length} months</b>: ${adh.length ? `${adh.length} adhika (${adh.map((m) => esc(m.name)).join(", ")})` : "no adhika month"}, ${ksh.length ? `${ksh.length} kṣaya (${ksh.map((m) => `${esc(m.name)}, ${esc(m.kshayaDropped)} dropped`).join("; ")})` : "no kṣaya month"}.</p>`;
    h += `<div class="scroll"><table id="varsha-table"><thead><tr><th scope="col">#</th><th scope="col">मास · month (amānta)</th><th scope="col">from (new moon)</th><th scope="col">to</th>${y.family === "ss" ? `<th scope="col">full-moon nakṣatra</th>` : ""}</tr></thead><tbody>`
      + y.months.map((m, i) => (m.refused ? `<tr><td>${i + 1}</td><td colspan="${y.family === "ss" ? 4 : 3}" class="muted">refused: ${esc(m.reason)}</td></tr>`
        : `<tr class="${m.adhika ? "adhika" : ""}${m.kshaya ? " kshaya" : ""}"><td>${i + 1}</td><td><b>${esc(m.name)}</b>${m.adhika ? ` <span class="tag cp">अधिक adhika</span>` : ""}${m.kshaya ? ` <span class="tag cp">क्षय kṣaya</span> <span class="src">${esc(m.kshayaDropped)} dropped</span>` : ""}</td><td>${at(m.start)}</td><td>${at(m.end)}</td>${y.family === "ss" ? `<td>${esc(m.fullMoonNakshatra || "")}</td>` : ""}</tr>`)).join("")
      + `</tbody></table></div><p class="src">${esc(TIERS[E.id].month)}. A month with no saṅkrānti is adhika and takes the next month's name; a month with two saṅkrāntis is kṣaya and the second's month is dropped.</p>`;
    $("varsha-out").innerHTML = h;
  }

  // ── ६ the year: festivals, saṅkrāntis, ayanas ───────────────────────────────────────────────────────
  function computeYear(E, Y, site, pl) {
    const t1 = kaliOf(Y, 1, 1), t2 = kaliOf(Y + 1, 1, 1);
    const inYear = (t) => civil(clockOf(t, pl).N).year === Y;
    if (E.family === "drik") {
      const j1 = midnightJd(t1, pl) - 2, j2 = midnightJd(t2, pl) + 2;
      const sk = drikOr(SD.sankrantisBetween(j1, j2), j1, "the saṅkrāntis").map((s) => ({ at: tOfJd(s.jd, pl), rashi: P0.RASHI[s.index], index: s.index }))
        .filter((s) => inYear(s.at));
      return { Y, drik: true, fest: [], failed: [], sk, cs: [] };
    }
    let fest = [], failed = [];
    try { fest = E.U.festivals(t1, t2, site); }
    catch (e) {
      // one rule that cannot be placed (a polar day in its window) must not hide the others: rule by rule
      fest = [];
      for (const r of E.U.RULES) {
        if (r.after) continue;
        const rules = [r, ...E.U.RULES.filter((x) => x.after === r.id)];
        try { fest.push(...E.U.festivals(t1, t2, site, { rules })); } catch (err) { failed.push({ name: r.name, error: err && err.message ? err.message : String(err) }); }
      }
      fest.sort((a, b) => a.N - b.N);
    }
    const sk = E.U.sankrantis(t1 - 2, t2 + 2).filter((s) => inYear(s.at));
    const cs = E.U.cardinalInSky(t1 - 2, t2 + 2).filter((s) => inYear(s.at));
    return { Y, fest, failed, sk, cs };
  }
  const CARDINAL = { 270: "उत्तरायण · uttarāyaṇa begins: the Sun turns north", 90: "दक्षिणायन · dakṣiṇāyana begins: the Sun turns south",
    0: "वसन्त विषुव · vasanta viṣuva: the Sun crosses the equator northward", 180: "शरद् विषुव · śarad viṣuva: the Sun crosses the equator southward" };
  const KALA_NAME = { sunrise: "at sunrise", purvahna: "in pūrvāhṇa", madhyahna: "in madhyāhna", aparahna: "in aparāhṇa", sayahna: "in sāyāhna",
    pradosha: "in pradoṣa", nishitha: "in niśītha", arunodaya: "in aruṇodaya", candrodaya: "at moonrise" };
  function renderYear(E, yd, pl) {
    const { fest, sk, cs } = yd;
    let h;
    if (yd.drik) {
      h = `<p class="muted" id="fest-none">Festivals are not computed in this choice: utsava.js's rules (which tithi, in which part of the day, which of two days) run on the text's calendar module, and the dṛk choice has no festival module of its own here. Choose one of the text's computations above to see them.</p>`
        + `<h3>संक्रान्ति · saṅkrāntis of ${esc(yStr(yd.Y))}</h3><p class="src">The series' sidereal Sun entering each rāśi (${esc(TIERS.drik.ayanamsha.name)}); siddhanta-tier.js sankrantisBetween. The puṇya time of SS 14.11 is the text's and is not given here.</p>`
        + `<div class="scroll"><table id="sk-table"><thead><tr><th scope="col">राशि · rāśi</th><th scope="col">saṅkrānti</th></tr></thead><tbody>`
        + sk.map((s) => { const c = clockOf(s.at, pl); return `<tr><td><b>${esc(s.rashi)}</b></td><td>${esc(dayLabel(c.N))}<br>${tStr(s.at, pl, c.N)}</td></tr>`; }).join("")
        + `</tbody></table></div>`;
      $("year").innerHTML = h;
      return;
    }
    h = `<h3>उत्सव · festivals of ${esc(yStr(yd.Y))}</h3><p class="src">Every rule (which tithi, in which part of the day, which of two days) is simplified common practice: “${esc(E.U.UNVERIFIED)}”. There is no Rohiṇī check for Janmāṣṭamī and no daśamī-vedha for Ekādaśī. The saṅkrānti days take the text's saṅkrānti and puṇya time. Dates are the civil day at this place.</p>`
      + `<p class="caution" id="fast-caution">व्रत/उपवास से पहले, विशेषकर मधुमेह, गर्भावस्था या दवा लेने पर, अपने चिकित्सक से परामर्श करें। · Before any fast — especially with diabetes, pregnancy or regular medication — consult your doctor.</p>`;
    h += fest.length ? `<ul class="flist" id="fest-list">${fest.map((f) => {
      const bits = [];
      if (f.tithi) bits.push(`${esc(f.month)} · ${esc(f.paksha)} ${esc(f.tithi)}${f.kala ? ` · ${esc(KALA_NAME[f.kala] || f.kala)}` : ""}`);
      if (f.sankranti !== undefined) bits.push(`saṅkrānti at ${tStr(f.sankranti, pl, f.N)} (${esc(f.kind)})`);
      if (f.fallback) bits.push("the tithi misses its window on every day; placed by the fallback rule");
      if (f.alternatives > 1) bits.push(`${f.alternatives} days qualify; chosen by “${esc((E.U.RULES.find((r) => r.id === f.id) || {}).prefer || "")}”`);
      if (f.free && f.free.length) bits.push(`free of Viṣṭi: ${f.free.map((w) => `${tStr(w[0], pl, f.N)}–${tStr(w[1], pl, f.N)}`).join(", ")}`);
      else if (f.free && f.afterAvoided) bits.push(`Viṣṭi covers the window; after it: from ${tStr(f.afterAvoided[0], pl, f.N)}`);
      if (f.note) bits.push(esc(f.note));
      return `<li data-id="${esc(f.id)}"><span class="fdate">${esc(dayLabel(f.N))}</span> <b>${esc(f.name)}</b> ${tagOf(f.status)}<br><span class="src">${bits.join(" · ")}</span></li>`;
    }).join("")}</ul>` : `<p class="muted">No festival could be placed at this place in ${esc(yStr(yd.Y))}.</p>`;
    if (yd.failed.length) h += `<p class="bad small">Not placed at this latitude (the module stopped on a day with no sunrise or sunset): ${yd.failed.map((x) => esc(x.name)).join(", ")}.</p>`;
    h += `<h3>संक्रान्ति · saṅkrāntis and their puṇyakāla ${tagOf("SS 14.11")}</h3><p class="src">The Sun's entry into each rāśi; the puṇya time is the Sun's disc crossing the boundary, half before and half after (SS 14.11 with 4.1-4.3).</p>`
      + `<div class="scroll"><table id="sk-table"><thead><tr><th scope="col">राशि · rāśi</th><th scope="col">saṅkrānti</th><th scope="col">puṇyakāla</th></tr></thead><tbody>`
      + sk.map((s) => { const c = clockOf(s.at, pl); return `<tr><td><b>${esc(s.rashi)}</b><br><span class="src">${esc(s.kind)} · ${esc(s.source)}</span></td><td>${esc(dayLabel(c.N))}<br>${tStr(s.at, pl, c.N)}</td><td>${tStr(s.punya.from, pl, c.N)} – ${tStr(s.punya.to, pl, c.N)}<br><span class="src">${esc(s.punya.halfNadis.toFixed(2))} nāḍī each side</span></td></tr>`; }).join("")
      + `</tbody></table></div>`;
    h += `<h3>आकाश में अयन और विषुव · the ayanas and viṣuvas in the sky ${tagOf("SS 3.9-3.12")}</h3><p class="src">The Sun's sāyana longitude at 270°, 90°, 0° and 180° with the text's ayanāṃśa. By the saṅkrānti (SS 14.9) the ayanas come about the ayanāṃśa's worth of days later.</p>`
      + `<ul class="flist">${cs.map((x) => { const c = clockOf(x.at, pl); return `<li><span class="fdate">${esc(dayLabel(c.N))}</span> ${tStr(x.at, pl, c.N)} <b>${esc(CARDINAL[x.sayana] || x.kind)}</b> <span class="src">sāyana ${esc(x.sayana)}° · ${esc(x.source)}</span></li>`; }).join("")}</ul>`;
    $("year").innerHTML = h;
  }

  // ── ४ the month grid, rendered a week at a time ──────────────────────────────────────────────────────
  function computeCell(E, ctx, N, site, pl, yd, sch) {
    const v = K.varaOfKaliDay(N), c = civil(N);
    let rise, next, L, Ln, Md = N;
    if (E.family === "drik") {
      const d = drikDayOf(N, pl);
      if (d.polar) return { N, Md, c, v, polar: true };
      rise = tOfJd(d.sunriseJd, pl); next = tOfJd(d.nextSunriseJd, pl);
      L = limbsOf(ctx.at(d.sunriseJd)); Ln = limbsOf(ctx.at(d.nextSunriseJd));
    } else {
      Md = moduleDay(E, N, site, pl);
      rise = E.P.sunrise(Md, site); next = E.P.sunrise(Md + 1, site);
      if (rise === null || next === null) return { N, Md, c, v, polar: true };
      L = E.P.limbsAt(rise); Ln = E.P.limbsAt(next);
    }
    const cell = { N, Md, c, v, polar: false };
    const gap = mod(Ln.tithi - L.tithi, 30);
    cell.tithi = L.tithi; cell.nak = P0.NAKSHATRA[L.nakshatra - 1];
    cell.skipped = []; for (let i = 1; i < gap; i++) cell.skipped.push(mod(L.tithi - 1 + i, 30) + 1);
    cell.vriddhi = gap === 0;
    const marks = [];
    const markOf = (i) => (i === 15 ? "पूर्णिमा · Pūrṇimā" : i === 30 ? "अमावास्या · Amāvāsyā" : i === 11 || i === 26 ? "एकादशी · Ekādaśī" : null);
    if (markOf(L.tithi)) marks.push(markOf(L.tithi));
    for (const i of cell.skipped) if (markOf(i)) marks.push(markOf(i) + " (kṣaya)");
    const startIdx = sch === "purnimanta" ? 16 : 1;
    if (L.tithi === startIdx || cell.skipped.includes(startIdx)) {
      const m = monthAt(E, L.tithi === startIdx ? rise + 1e-4 : next - 1e-4);
      marks.push(`मास · ${monthStr(monthIn(E, m, startIdx === 16, sch))} begins`);
    }
    cell.marks = marks;
    cell.fest = yd ? yd.fest.filter((f) => f.N === Md).map((f) => f.name) : [];
    cell.sk = yd ? yd.sk.filter((s) => clockOf(s.at, pl).N === N).map((s) => `${s.rashi} saṅkrānti ${pad2(clockOf(s.at, pl).hh)}:${pad2(clockOf(s.at, pl).mm)}`) : [];
    cell.cd = ctx.cdDays.has(Md);
    return cell;
  }
  function cellHtml(x, selN, todayN) {
    const cls = ["mday", x.N === todayN ? "today" : "", x.N === selN ? "sel" : "", x.polar ? "polar-day" : ""].filter(Boolean).join(" ");
    const wd = `<span class="wd">${esc(VARA_DEV[x.v.index])} · ${esc(VARA_EN[x.v.index])}</span>`;
    if (x.polar) return `<button type="button" class="${cls}" data-day="${x.c.day}" data-n="${x.N}" aria-label="${esc(`${dateLabel(x.N)}: no sunrise or no sunset`)}"><span class="dn">${x.c.day} ${wd}</span><span>no sunrise or sunset</span></button>`;
    const label = [dateLabel(x.N), tithiLong(x.tithi), x.nak, ...x.marks.map((m) => m.replace(/<[^>]+>/g, "")), ...x.fest, ...x.sk].join("; ");
    return `<button type="button" class="${cls}" data-day="${x.c.day}" data-n="${x.N}" aria-label="${esc(label)}">`
      + `<span class="dn">${x.c.day} ${wd}</span><span class="ti">${esc(tithiShort(x.tithi))}${x.vriddhi ? " (vṛddhi)" : ""}</span>`
      + (x.skipped.length ? `<span class="ti">kṣaya: ${esc(x.skipped.map(tithiShort).join(", "))}</span>` : "")
      + `<span class="nk">${esc(x.nak)}</span>`
      + x.marks.map((m) => `<span class="mk">${m}</span>`).join("")
      + (x.cd ? `<span class="mk">चन्द्र-दर्शन · first crescent</span>` : "")
      + x.sk.map((s) => `<span class="sk">${esc(s)}</span>`).join("")
      + x.fest.map((f) => `<span class="fx">${esc(f)}</span>`).join("") + `</button>`;
  }
  async function renderMonth(E, g, Y, Mo, site, pl, yd, selN) {
    const t0 = now(), first = kaliOf(Y, Mo, 1), dim = kaliOf(Mo === 12 ? Y + 1 : Y, Mo === 12 ? 1 : Mo + 1, 1) - first;
    const ctx = { cdDays: new Set(), at: null };
    if (E.family === "drik") {
      const tb = drikTable(midnightJd(first, pl) - 0.5, midnightJd(first + dim, pl) + 1.75);
      ctx.at = (jd) => tb.at(jd);
    } else for (const e of safe(() => E.U.candraDarshana(first - 3, first + dim + 1, site), [])) if (e.first) ctx.cdDays.add(e.first.N);
    const todayN = deviceToday(), lead = K.varaOfKaliDay(first).index;
    $("month").innerHTML = `<h3>${esc(MON_DEV[Mo - 1])} · ${esc(MON_EN_FULL[Mo - 1])} ${esc(yStr(Y))} <span class="src">(${esc(CALENDARS[cal()])})</span></h3>`
      + `<div class="mgrid" id="mgrid">${VARA_DEV.map((d, i) => `<div class="mhead" aria-hidden="true">${d} · ${VARA_EN[i]}</div>`).join("")}${"<div class=\"mblank\" aria-hidden=\"true\"></div>".repeat(lead)}</div>`
      + (E.family === "drik" ? `<p class="src">The dṛk choice marks no festival and no first crescent: those are the text's rules (utsava.js).</p>` : "");
    const grid = $("mgrid");
    for (let d = 0; d < dim; d += 7) {
      let html = "";
      for (let i = d; i < Math.min(d + 7, dim); i++) html += cellHtml(computeCell(E, ctx, first + i, site, pl, yd, scheme()), selN, todayN);
      grid.insertAdjacentHTML("beforeend", html);
      await tick();
      if (g !== gen) return false;
    }
    timed("month", "t-month", t0, `, a week at a time (${dim} days)`);
    return true;
  }

  // ── ७ eclipses, a fortnight at a time ───────────────────────────────────────────────────────────────
  const CONTACTS = [["sparsha", "स्पर्श · sparśa (first contact)"], ["nimilana", "निमीलन · nimīlana (totality begins)"], ["madhya", "मध्य · madhya (middle)"], ["unmilana", "उन्मीलन · unmīlana (totality ends)"], ["moksha", "मोक्ष · mokṣa (last contact)"]];
  /** The plain text's eclipse (ss-grahana.js, with the site's horizon and SS 6.13). */
  function eclipseHtml(E, pl) {
    const mid = clockOf(E.contacts.madhya, pl).N, lunar = E.kind === "lunar";
    const rows = CONTACTS.filter(([c]) => E.contacts[c] !== null && E.contacts[c] !== undefined).map(([c, label]) => {
      const t = E.contacts[c], ck = E.clock && E.clock[c], hz = E.horizon && E.horizon[c];
      return `<tr><th scope="row">${label}</th><td>${tStr(t, pl, mid)}</td><td><span class="gh">${ck ? ghStr(ck.ghatiAfterSunrise) : ""}</span></td><td>${hz ? (hz.above ? "yes" : "no") : "—"}</td></tr>`;
    }).join("");
    return `<div class="ecard" data-kind="${esc(E.kind)}" data-tier="ss"><h3>${lunar ? "चन्द्र-ग्रहण · lunar eclipse" : "सूर्य-ग्रहण · solar eclipse"} — ${esc(dayLabel(mid))} ${esc(yStr(civil(mid).year))}</h3>`
      + `<p>Magnitude <b>${esc(E.magnitude.toFixed(3))}</b> of the ${lunar ? "Moon's" : "Sun's"} diameter (${E.total ? "total, खग्रास" : "partial, खण्डग्रास"}). `
      + `${E.perceptible && E.perceptible.seen ? "Large enough to be seen" : "Too small to be seen"} (${esc(E.perceptible ? E.perceptible.rule : "6.13")}). `
      + `<b>At this place: ${E.seenAtSite ? `<span class="ok">visible</span>` : `<span class="bad">not visible</span>`}</b>${E.seenAtSite ? "" : (lunar ? " (the Moon is below the horizon)" : " (the Sun is below the horizon, or too little of it is covered here)")}.</p>`
      + `<div class="scroll"><table><thead><tr><th scope="col">contact</th><th scope="col">clock</th><th scope="col">from sunrise</th><th scope="col">${lunar ? "Moon" : "Sun"} up?</th></tr></thead><tbody>${rows}</tbody></table></div>`
      + `<p class="src">${tagOf("SS 4, 5, 6.13")} ss-grahana.js: ${lunar ? "the Moon in the Earth's shadow (SS 4)" : "the Moon over the Sun with lambana and nati (SS 4-5)"}; contacts by SS 4.14-4.17${lunar ? "" : " and 5.14-5.17"}; ghaṭīs from that day's sunrise in nāḍīs of the turn.</p></div>`;
  }
  /** Is the body up at t, by the tier's own rising and setting (panchanga.js sunrise and sunset; utsava.js moonrise and
   *  moonset: the Moon's centre, no parallax, no refraction)? null where the module gives no answer. */
  function upAt(Eng, kind, t, site) {
    const d = Eng.P.civilDayOf(t, site);
    if (d.polar) return null;
    if (kind === "solar") return d.sunrise <= t && t < d.sunset;
    const ev = [];
    for (const N of [d.N - 1, d.N, d.N + 1]) {
      const r = safe(() => Eng.U.moonrise(N, site), null), s = safe(() => Eng.U.moonset(N, site), null);
      if (r !== null) ev.push([r, true]); if (s !== null) ev.push([s, false]);
    }
    const before = ev.filter(([x]) => x <= t).sort((a, b) => b[0] - a[0]);
    return before.length ? before[0][1] : null;
  }
  /** An eclipse of the saṃskāra's model (ss-tier.js eclipsesNear: samskara.js's lunar and solar eclipse on the tier's places). */
  function samskaraEclipseHtml(Eng, E, site, pl) {
    const tOf = (jd) => (jd === null || jd === undefined ? null : ST.daysOfJd(jd));
    const mid = tOf(E.contactsJd.madhya), midN = clockOf(mid, pl).N, lunar = E.kind === "lunar";
    const ups = {};
    const rows = CONTACTS.filter(([c]) => E.contactsJd[c] !== null && E.contactsJd[c] !== undefined).map(([c, label]) => {
      const t = tOf(E.contactsJd[c]), up = upAt(Eng, E.kind, t, site); ups[c] = up;
      const rise = safe(() => Eng.P.civilDayOf(t, site).sunrise, null);
      return `<tr><th scope="row">${label}</th><td>${tStr(t, pl, midN)}</td><td><span class="gh">${rise === null ? "" : ghStr((t - rise) / Eng.P.NADI_DAYS)}</span></td><td>${up === null ? "—" : up ? "yes" : "no"}</td></tr>`;
    }).join("");
    const seen = Object.values(ups).some((x) => x === true);
    return `<div class="ecard" data-kind="${esc(E.kind)}" data-tier="ss+parameshvara"><h3>${lunar ? "चन्द्र-ग्रहण · lunar eclipse" : "सूर्य-ग्रहण · solar eclipse"} — ${esc(dayLabel(midN))} ${esc(yStr(civil(midN).year))}</h3>`
      + `<p>Magnitude <b>${esc(E.magnitude.toFixed(3))}</b> of the ${lunar ? "Moon's" : "Sun's"} diameter (${E.magnitude >= 1 ? "total, खग्रास" : "partial, खण्डग्रास"}). `
      + `<b>At this place: ${seen ? `<span class="ok">visible</span>` : `<span class="bad">not visible</span>`}</b> <span class="src">(the ${lunar ? "Moon" : "Sun"} above the horizon at a contact, by the tier's own rising and setting; SS 6.13's limit of what is seen is not applied here)</span>.</p>`
      + `<div class="scroll"><table><thead><tr><th scope="col">contact</th><th scope="col">clock</th><th scope="col">from sunrise</th><th scope="col">${lunar ? "Moon" : "Sun"} up?</th></tr></thead><tbody>${rows}</tbody></table></div>`
      + `<p class="src">${tagOf("SS 4, 5")} ${esc(E.method)}; ghaṭīs from that day's sunrise in nāḍīs of the turn.</p></div>`;
  }
  /** A dṛk eclipse (drik-grahana.js on the series, through siddhanta-tier.js), with its local circumstances. */
  function drikEclipseHtml(E, pl) {
    const lunar = E.kind === "lunar", loc = E.local || null;
    const mid = tOfJd(lunar ? E.maxJdUT : (loc && loc.maxJdUT) || E.maxJdUT, pl), midN = clockOf(mid, pl).N;
    const names = lunar ? [["P1", "penumbral contact begins"], ["U1", "umbral contact begins (sparśa)"], ["U2", "totality begins"], ["U3", "totality ends"], ["U4", "umbral contact ends (mokṣa)"], ["P4", "penumbral contact ends"]]
      : [["C1", "first contact here"], ["C2", "second contact"], ["C3", "third contact"], ["C4", "last contact here"]];
    const alt = loc ? (lunar ? loc.moonAltitudeDeg : loc.sunAltitudeDeg) : null;
    const src = lunar ? E.contacts : loc ? loc.contacts : {};
    const rows = names.filter(([c]) => src && src[c]).map(([c, label]) => `<tr><th scope="row">${esc(c)} · ${esc(label)}</th><td>${tStr(tOfJd(src[c].jdUT, pl), pl, midN)}</td><td>${alt && Number.isFinite(alt[c]) ? `${esc(alt[c].toFixed(1))}°` : "—"}</td></tr>`).join("");
    // a penumbral-only lunar eclipse: the umbra misses the Moon, so it has no grāsa; its umbral magnitude (negative) is
    // not shown as one, and the penumbral magnitude is given instead
    const penumbral = lunar && !(E.umbralMagnitude > 0);
    const magText = penumbral
      ? `Penumbral only: the Moon passes through the Earth's penumbra and misses the umbra, so there is no grāsa (no umbral magnitude). Penumbral magnitude <b>${esc(Number(E.penumbralMagnitude).toFixed(3))}</b>`
      : lunar ? `Umbral magnitude <b>${esc(Number(E.umbralMagnitude).toFixed(3))}</b>`
        : loc && loc.eclipsed ? `Magnitude here <b>${esc(Number(loc.magnitude).toFixed(3))}</b> (${esc(loc.type)} here)`
          : `Greatest magnitude (anywhere) <b>${esc(Number(E.magnitude).toFixed(3))}</b> — the shadow misses this place`;
    return `<div class="ecard" data-kind="${esc(E.kind)}" data-tier="drik"${penumbral ? ` data-penumbral="1"` : ""}><h3>${lunar ? "चन्द्र-ग्रहण · lunar eclipse" : "सूर्य-ग्रहण · solar eclipse"} (${esc(E.type)}) — ${esc(dayLabel(midN))} ${esc(yStr(civil(midN).year))}</h3>`
      + `<p>${magText}. `
      + `<b>At this place: ${loc && loc.visible ? `<span class="ok">visible</span>` : `<span class="bad">not visible</span>`}</b>${loc ? ` <span class="src">${esc(loc.rule)}</span>` : ""}.</p>`
      + (rows ? `<div class="scroll"><table><thead><tr><th scope="col">contact</th><th scope="col">clock</th><th scope="col">${lunar ? "Moon's" : "Sun's"} altitude</th></tr></thead><tbody>${rows}</tbody></table></div>` : "")
      + `<p class="src">${esc(E.convention || "")}; drik-grahana.js on the tier's own Sun and Moon (siddhanta-tier.js eclipses).</p></div>`;
  }
  async function runEclipses(Eng, N0, site, pl) {
    const g = ++eclGen, t0 = now(), span = 400;
    document.body.dataset.eclipses = "computing";
    const intro = { ss: "The text's eclipses at this place (SS chapters 4, 5 and 6.13), from the chosen day: ss-grahana.js.",
      "ss+parameshvara": "The text's eclipse rules (SS 4-5) on this choice's places: the Moon and the node moved by Parameśvara's saṃskāra (ss-tier.js, samskara.js).",
      drik: "Eclipses searched on the dṛk choice's own Sun and Moon (drik-grahana.js), with the circumstances at this place." }[Eng.id];
    $("ecl-intro").textContent = intro;
    $("ecl").innerHTML = `<p class="muted" id="ecl-progress">Searching…</p>`;
    const cards = []; let refused = null;
    try {
      if (Eng.id === "ss") {
        const out = [];
        for (let a = N0; a < N0 + span; a += 15) {
          out.push(...G.eclipsesBetween(a, Math.min(a + 15, N0 + span), site));
          if (g !== eclGen) return;
          const pr = $("ecl-progress"); if (pr) pr.textContent = `Searching the text's syzygies… ${Math.min(a + 15 - N0, span)} of ${span} days, ${out.length} so far.`;
          await tick(); if (g !== eclGen) return;
        }
        cards.push(...out.map((E) => eclipseHtml(E, pl)));
      } else if (Eng.id === "ss+parameshvara") {
        const seen = new Set(), out = [];
        for (let a = N0; a < N0 + span; a += 32) {
          const half = Math.min(32, N0 + span - a) / 2, centre = a + half;
          for (const E of ST.eclipsesNear(ST.jdOfDays(centre), site, half, Eng.opts)) {
            const tm = ST.daysOfJd(E.middleJd);
            if (tm < N0 || tm >= N0 + span) continue;
            const key = `${E.kind}|${Math.round(tm * 10)}`; if (seen.has(key)) continue; seen.add(key); out.push(E);
          }
          if (g !== eclGen) return;
          const pr = $("ecl-progress"); if (pr) pr.textContent = `Searching the saṃskāra's syzygies… ${Math.min(a + 32 - N0, span)} of ${span} days, ${out.length} so far.`;
          await tick(); if (g !== eclGen) return;
        }
        out.sort((a, b) => a.middleJd - b.middleJd);
        cards.push(...out.map((E) => samskaraEclipseHtml(Eng, E, site, pl)));
      } else {
        const j0 = midnightJd(N0, pl), out = [];
        for (let a = 0; a < span; a += 30) {
          const r = SD.eclipses(j0 + a, j0 + Math.min(a + 30, span), { latitude: pl.lat, longitude: pl.lon });
          if (r === null) { refused = new MC.TierSpanError("drik", j0 + a + 15, "the eclipse search"); break; }
          out.push(...r);
          if (g !== eclGen) return;
          const pr = $("ecl-progress"); if (pr) pr.textContent = `Searching the series… ${Math.min(a + 30, span)} of ${span} days, ${out.length} so far.`;
          await tick(); if (g !== eclGen) return;
        }
        out.sort((a, b) => a.maxJdUT - b.maxJdUT);
        cards.push(...out.map((E) => drikEclipseHtml(E, pl)));
      }
    } catch (e) {
      if (g !== eclGen) return;
      $("ecl").innerHTML = isRefusal(e) ? refusalHtml(e) : `<p class="bad">${esc(e && e.message ? e.message : e)}</p>`;
      document.body.dataset.eclipses = "done"; return;
    }
    if (g !== eclGen) return;
    let h = cards.length ? `<p class="muted">${cards.length} eclipse${cards.length === 1 ? "" : "s"} from ${esc(dateLabel(N0))} to ${esc(dateLabel(N0 + span))}, in the order they come.</p>` + cards.join("")
      : `<p class="muted">${refused ? "No eclipse before the span's end" : "No eclipse"} at this place between ${esc(dateLabel(N0))} and ${esc(dateLabel(N0 + span))} in this computation.</p>`;
    if (refused) h += refusalHtml(refused);
    $("ecl").innerHTML = h;
    timed("eclipses", "t-ecl", t0, `, a fortnight or a month at a time so that the page stays responsive`);
    document.body.dataset.eclipses = "done";
  }

  // ── ८ Vimśottarī daśā ────────────────────────────────────────────────────────────────────────────────
  const ratNum = (r) => Number(r.num) / Number(r.den);
  const SPD = Number(K.SPANDAS_PER_DAY);
  /** Days since the Kali epoch → spandas (BigInt), as dasha.js counts them. */
  const spandas = (x) => { const w = Math.floor(x); return BigInt(w) * K.SPANDAS_PER_DAY + BigInt(Math.round((x - w) * SPD)); };
  function computeDasha() {
    const Eng = engineOf(tier);
    const bd = parseDate($("b-date").value, "The birth date");
    const tm = /^(\d{1,2}):(\d{2})/.exec($("b-time").value || "");
    if (!tm) throw new Error("Give the birth time.");
    const off = Number($("b-off").value);
    if ($("b-off").value === "" || !Number.isFinite(off) || off < -12 || off > 14) throw new Error("Give the birth clock's UTC offset.");
    const pl = { off, mer: readPlace().mer };   // a clock time needs only its offset and the meridian
    const t0 = now(), hours = Number(tm[1]) + Number(tm[2]) / 60;
    let D, V, shift, nowSp, yearNote;
    if (Eng.family === "ss") {
      D = Eng.D;
      const tBirth = instantOf(bd.N, hours, pl);
      V = D.vimshottari(tBirth, { year: $("b-year").value, balance: $("b-bal").value });
      shift = pl.off * 15 - pl.mer;   // the deśāntara that turns the engine's count into the birth clock's
      nowSp = spandas(tOfJd(Date.now() / 86400000 + 2440587.5, pl));   // this moment, as an engine instant
      yearNote = `${(Number(V.year.num) / Number(V.year.den)).toFixed(6)} civil days — ${V.year.source}`;
    } else {
      // dṛk: math-core vimshottariTier gives the birth nakṣatra on the series' Moon (its entry and exit); the periods are
      // dasha.js's on that state with the tier's year (M.TIERS.drik.dashaYear), as math-core computes them.
      D = ST.dasha({ samskara: null });
      const jdBirth = bd.N + hours / 24 - off / 24 + KALI_JD0, jdNow = Date.now() / 86400000 + 2440587.5;
      const v = MC.vimshottariTier(jdBirth, jdNow, "drik");
      const Sp = (jd) => ST.spandasOfJd(jd), b = v.birthState;
      const elapsed = D.q(Sp(jdBirth) - Sp(b.nakshatraStartJd), Sp(b.nakshatraEndJd) - Sp(b.nakshatraStartJd));
      const yd = TIERS.drik.dashaYear, year = { num: BigInt(Math.round(yd.days * 100000)), den: 100000n, source: yd.source };
      const md = D.mahadashas(Sp(jdBirth), b.nakshatraIndex + 1, elapsed, { year, cycles: 1 });   // one cycle of 120 years, as the text's choices
      V = { ...md, birth: { nakshatraName: P0.NAKSHATRA[b.nakshatraIndex], elapsed, method: "time" }, year, mathCore: v };
      shift = off * 15 - ST.MERIDIAN_DEG;
      nowSp = Sp(jdNow);
      yearNote = `${yd.days} civil days — ${yd.source}`;
    }
    const dt = (r) => { const c = D.toCivil(r, shift, cal()); return `${c.day} ${MON_EN[c.month - 1]} ${yStr(c.year)}`; };
    const cur = D.chainAt(V, nowSp, 2);
    const isCur = (p) => cur.some((c) => c.level === p.level && D.cmp(c.start, p.start) === 0);
    const yr = (r) => ratNum(r).toFixed(2);
    const elapsed = ratNum(V.birth.elapsed);
    let h = `<p class="fate">गणना घोषित है — भाग्य नहीं · computation declared, not fate</p>`
      + labelsHtml(Eng.id, Eng.family === "drik" ? bd.N + hours / 24 - off / 24 + KALI_JD0 : ST.jdOfDays(instantOf(bd.N, hours, pl)), "dasha")
      + `<p>Birth instant ${esc(dateLabel(bd.N))} ${esc(pad2(tm[1]))}:${esc(tm[2])} (${esc(zoneLabel(off))}). The Moon in <b>${esc(V.birth.nakshatraName)}</b>, ${esc((elapsed * 100).toFixed(1))}% of it gone (${V.birth.method === "time" ? "by time, BPHS 46.16" : "by arc"}). `
      + `Daśā at birth: <b>${esc(D.LORDS[V.lordAtBirth])}</b>, balance ${esc(yr(V.balanceYears))} years.</p>`
      + `<p class="src">${tagOf("BPHS 46.12-46.16")} The year used: ${esc(yearNote)}. Lords and years: BPHS 46.12-46.15; antardaśā: 51.1-2 (dasha.js).${Eng.family === "drik" ? " The birth nakṣatra's entry and exit are the series' (math-core vimshottariTier)." : ""}</p>`
      + `<div class="scroll"><table class="dasha" id="dasha-table" data-tier="${esc(Eng.id)}"><caption>महादशा और अन्तर्दशा · mahādaśā and antardaśā (dates in the birth clock, ${esc(CALENDARS[cal()])})</caption><thead><tr><th scope="col">महादशा · mahādaśā</th><th scope="col">years</th><th scope="col">from</th><th scope="col">to</th></tr></thead><tbody>`;
    V.periods.forEach((p, i) => {
      const subs = D.subPeriods(p), open = isCur(p);
      h += `<tr class="maha${open ? " cur" : ""}"><td><b>${esc(p.name)}</b>${open ? ` <span class="tag text">now</span>` : ""}</td><td class="num">${esc(i === 0 ? `${yr(V.balanceYears)} of ${yr(p.years)}` : yr(p.years))}</td><td>${i === 0 ? `<span class="muted">${esc(dt(p.start))} (before birth)</span>` : esc(dt(p.start))}</td><td>${esc(dt(p.end))}</td></tr>`
        + `<tr><td colspan="4" class="sub"><details${open ? " open" : ""}><summary>अन्तर्दशा · antardaśās of ${esc(p.name)}</summary><table><thead><tr><th scope="col">antardaśā</th><th scope="col">years</th><th scope="col">from</th><th scope="col">to</th></tr></thead><tbody>`
        + subs.map((s) => `<tr class="antar${isCur(s) ? " cur" : ""}"><td>${esc(p.name)}–${esc(s.name)}</td><td class="num">${esc(yr(s.years))}</td><td>${esc(dt(s.start))}</td><td>${esc(dt(s.end))}</td></tr>`).join("")
        + `</tbody></table></details></td></tr>`;
    });
    h += `</tbody></table></div>`;
    $("dasha-out").innerHTML = h;
    timed("dasha", null, t0);
  }

  // ── the pipeline ─────────────────────────────────────────────────────────────────────────────────────
  function keep(pl) { store.set({ city: pl.city, lat: pl.lat, lon: pl.lon, off: pl.off, mer: pl.mer, scheme: scheme(), theme: theme.mode, calendar: cal() }); }
  async function showVarsha(Eng, k, pl, g) {
    const key = `${Eng.id}|${k}|${pl.lat}|${pl.lon}|${pl.off}|${pl.mer}|${cal()}`;
    if (cache.varshaKey === key) { document.body.dataset.varsha = "done"; return; }
    const t0 = now();
    try {
      if (Eng.family === "ss" && (k - 3101 < TEXT_SPAN[0] || k - 3101 > TEXT_SPAN[1])) throw new Error(`year ${yStr(k - 3101)} is outside ${yStr(TEXT_SPAN[0])} … ${TEXT_SPAN[1]}, the span the text's choices are tested over.`);
      const y = computeVarsha(Eng, k, pl);
      if (g !== undefined && g !== gen) return;
      renderVarsha(Eng, y, pl);
      setLabels("varsha", Eng.family === "drik" ? jdOfT(y.start, pl) : ST.jdOfDays(y.start));
      $("yr-in").value = yStr(k - 3101).replace("−", "-");
      cache.varshaKey = key;
      timed("varsha", "t-varsha", t0, ` (Kali ${k})`);
    } catch (e) {
      cache.varshaKey = null;
      $("t-varsha").textContent = "";
      setLabels("varsha", NaN);                              // the block names its choice, with no value from another year
      $("varsha-out").innerHTML = isRefusal(e) ? refusalHtml(e) : `<p class="bad">${esc(e && e.message ? e.message : String(e))}</p>`;
    }
    document.body.dataset.varsha = "done";
  }
  /** An input the page cannot read, or a choice it cannot serve: every block that showed a value is cleared (no value
   *  from the last day or place stays on the page), the labels still name the choice (with no value), and the reason is
   *  said once, at the top. */
  const DATE_HELP = $("date-help").textContent;
  function notComputed(why) {
    eclGen++;                                             // a running eclipse search stops writing
    const p = `<p class="bad not-computed">Not computed: ${esc(why)}</p>`;
    for (const id of ["today", "kala-out", "month", "varsha-out", "year", "ecl"]) $(id).innerHTML = p;
    delete $("today").dataset.polar;
    for (const id of ["t-today", "t-kala", "t-month", "t-varsha", "t-year", "t-ecl", "ecl-intro"]) $(id).textContent = "";
    for (const w of ["aaj", "kala", "masa", "varsha", "utsava", "grahana"]) setLabels(w, NaN);
    $("place-state").textContent = "";
    cache.yearKey = cache.monthKey = cache.eclKey = cache.yearShown = cache.varshaKey = null;
    say(why, true);
    document.body.dataset.eclipses = "done";
    document.body.dataset.varsha = "done";
    document.body.dataset.ready = "1";
  }
  async function run() {
    const g = ++gen;
    let pl, N, Eng;
    try { pl = readPlace(); N = selectedN(); }
    catch (e) { $("date-help").textContent = DATE_HELP; notComputed(e.message); return; }
    $("date-help").textContent = dateHelp(N);
    if (TIERS[tier].samskara && record.state === "loading") { say("Reading the paramparā record…"); await recordReady; if (g !== gen) return; }
    try { Eng = engineOf(tier); } catch (e) { notComputed(e.message); return; }
    say(linkNote);
    keep(pl);
    curPl = pl;
    document.body.dataset.ready = "0";
    document.body.dataset.tier = tier;
    const site = siteOf(pl), c = civil(N), sch = scheme();
    $("place-state").textContent = `${pl.name}: latitude ${pl.lat.toFixed(4)}°, longitude ${pl.lon.toFixed(4)}° E, deśāntara ${(pl.lon - pl.mer).toFixed(4)}° from the Ujjayinī meridian (${pl.mer}° E); clock ${zoneLabel(pl.off)}.`;
    const dayJd = midnightJd(N, pl) + 0.25;
    for (const w of ["aaj", "kala", "masa", "utsava", "grahana", "dasha"]) setLabels(w, dayJd);
    // each block computes on its own: the dṛk choice's refusal (TierSpanError) is said in the block that needs an instant
    // outside the span (EDGE RULE by block), and the other blocks stay served
    const refusedIn = (id, e) => { if (!isRefusal(e)) throw e; $(id).innerHTML = refusalHtml(e); return e; };
    try {
      let t0 = now(), day;
      try {
        day = computeDay(Eng, N, site, pl);
        renderToday(Eng, day, pl);
        if (!day.polar) setLabels("aaj", Eng.family === "drik" ? day.p.riseJd : ST.jdOfDays(day.p.sunrise));
      } catch (e) { day = { N, refused: refusedIn("today", e) }; delete $("today").dataset.polar; }
      timed("today", "t-today", t0);
      await tick(); if (g !== gen) return;

      t0 = now();
      if (day.refused) $("kala-out").innerHTML = refusalHtml(day.refused);
      else {
        const kala = await computeKala(Eng, day, site, g);
        if (g !== gen) return;
        renderKala(Eng, kala, day, pl);
      }
      timed("kala", "t-kala", t0);
      await tick(); if (g !== gen) return;

      const placeKey = `${Eng.id}|${pl.lat}|${pl.lon}|${pl.off}|${pl.mer}|${cal()}`;
      const yearKey = `${c.year}|${placeKey}`;
      let yearRefused = null;
      if (cache.yearKey !== yearKey) {
        t0 = now();
        cache.yearKey = null; cache.yearShown = null;
        try { cache.year = computeYear(Eng, c.year, site, pl); cache.yearKey = yearKey; }
        catch (e) { if (!isRefusal(e)) throw e; cache.year = null; yearRefused = e; }
        cache.yearMs = now() - t0;
        await tick(); if (g !== gen) return;
      }
      const monthKey = `${c.year}-${c.month}|${placeKey}|${sch}`;
      if (cache.monthKey !== monthKey) {
        cache.monthKey = null;
        let done = false;
        try { done = await renderMonth(Eng, g, c.year, c.month, site, pl, cache.year, N); }
        catch (e) { refusedIn("month", e); }
        if (g !== gen) return;
        if (done) cache.monthKey = monthKey;
      }
      $("month").querySelectorAll(".mday").forEach((b) => b.classList.toggle("sel", Number(b.dataset.n) === N));
      if (yearRefused) $("year").innerHTML = refusalHtml(yearRefused);
      else if (cache.year && cache.yearShown !== yearKey) {
        t0 = now();
        renderYear(Eng, cache.year, pl);
        cache.yearShown = yearKey;
        timed("year", "t-year", t0 - cache.yearMs, cache.year.drik ? ` (${cache.year.sk.length} saṅkrāntis)` : ` (${cache.year.fest.length} festivals, ${cache.year.sk.length} saṅkrāntis)`);
      }
      // the year panel: the year holding the chosen day's sunrise (or, where the day is not served, the year of its date)
      const kDay = day.refused || day.polar ? c.year + 3101 : Eng.family === "drik" ? day.ext.kaliYear : day.year.k;
      if (kDay !== null && kDay !== undefined) await showVarsha(Eng, kDay, pl, g);
      else $("varsha-out").innerHTML = refusalHtml(new MC.TierSpanError("drik", dayJd, "the year"));
      if (g !== gen) return;
      document.body.dataset.ready = "1";
      const eclKey = `${N}|${placeKey}`;
      if (cache.eclKey !== eclKey) { cache.eclKey = eclKey; runEclipses(Eng, N, site, pl); }
    } catch (e) {
      if (g === gen) notComputed("the engine stopped: " + (e && e.message ? e.message : String(e)));
    }
  }

  // ── the controls ─────────────────────────────────────────────────────────────────────────────────────
  const theme = {
    mode: "auto",
    apply(m) {
      this.mode = m;
      if (m === "auto") document.documentElement.removeAttribute("data-theme"); else document.documentElement.setAttribute("data-theme", m);
      $("theme").textContent = `रंग · theme: ${m}`;
    },
  };
  function fillCitySelect(sel, withCustom) {
    sel.innerHTML = CITIES.map((c) => `<option value="${esc(c.id)}">${esc(nameOfCity(c))}</option>`).join("") + (withCustom ? `<option value="custom">अन्य · your own coordinates</option>` : "");
  }
  function setPlaceFields(c) { $("lat").value = c.lat; $("lon").value = c.lon; $("off").value = c.off; }
  function setDate(N) { $("date").value = isoOf(N); run(); }
  function showTierNote() {
    const T = TIERS[tier];
    // the saṃskāra's own caption is read from the paramparā record (corpus/parampara/samskara.json), not typed here
    const caption = T.samskara && record.state === "ready" ? ST.label({ samskara: T.samskara }).caption : `${T.engine}.`;
    $("tier-note").textContent = `${caption} Served for ${yStr(T.span.years[0])} … ${T.span.years[1]} (${T.span.basis}).`.replace("..", ".");
    document.querySelectorAll('input[name="tier"]').forEach((r) => { r.checked = r.value === tier; });
    const yearsDrik = T.family === "drik";
    $("b-year").disabled = yearsDrik; $("b-bal").disabled = yearsDrik;
  }
  function chooseTier(id) {
    tier = MC.resolveTier(id);
    try { shared.set({ tier }); } catch (e) { /* not kept: the page still works */ }
    linkNote = "";
    cache.yearKey = cache.monthKey = cache.eclKey = cache.yearShown = cache.varshaKey = null;
    $("dasha-out").innerHTML = "";
    showTierNote();
    run();
  }

  $("tier-pick").innerHTML = TIER_IDS.map((id) => `<label><input type="radio" name="tier" value="${esc(id)}"> <span><b>${esc(TIERS[id].labelSa)}</b> · ${esc(TIERS[id].label)}${TIERS[id].default ? " <span class=\"muted\">(default)</span>" : ""}</span></label>`).join("");
  fillCitySelect($("city"), true);
  fillCitySelect($("b-city"), true);
  $("b-year").innerHTML = Object.keys(P0 && window.Dasha ? window.Dasha.YEAR : {}).map((k) => `<option value="${esc(k)}">${esc(k)}: ${esc((Number(window.Dasha.YEAR[k].num) / Number(window.Dasha.YEAR[k].den)).toFixed(4))} days</option>`).join("");

  const saved = store.get() || {};
  const c0 = cityOf(saved.city);
  if (c0) { $("city").value = c0.id; setPlaceFields(c0); }
  else if (Number.isFinite(saved.lat) && Number.isFinite(saved.lon) && Number.isFinite(saved.off)) { $("city").value = "custom"; $("lat").value = saved.lat; $("lon").value = saved.lon; $("off").value = saved.off; }
  else { $("city").value = "ujjain"; setPlaceFields(cityOf("ujjain")); }
  $("mer").value = Number.isFinite(saved.mer) ? saved.mer : UJJAYINI_MERIDIAN_DEG;
  if (saved.calendar === "julian") $("calendar").value = "julian";
  if (saved.scheme === "purnimanta") document.querySelector('input[name="scheme"][value="purnimanta"]').checked = true;
  theme.apply(saved.theme === "light" || saved.theme === "dark" ? saved.theme : "auto");
  $("date").value = isoOf(deviceToday());
  $("b-city").value = $("city").value; $("b-off").value = $("off").value;
  showTierNote();

  $("tier-pick").addEventListener("change", (ev) => { if (ev.target && ev.target.name === "tier") chooseTier(ev.target.value); });
  document.addEventListener("click", (ev) => { const b = ev.target.closest && ev.target.closest("[data-use-tier]"); if (b) chooseTier(b.dataset.useTier); });
  $("city").addEventListener("change", () => { const c = cityOf($("city").value); if (c) setPlaceFields(c); run(); });
  for (const id of ["lat", "lon", "off"]) $(id).addEventListener("change", () => {
    const c = cityOf($("city").value);
    if (c && !(Number($("lat").value) === c.lat && Number($("lon").value) === c.lon && Number($("off").value) === c.off)) $("city").value = "custom";
    run();
  });
  $("mer").addEventListener("change", () => { if ($("mer").value === "") $("mer").value = UJJAYINI_MERIDIAN_DEG; run(); });
  $("date").addEventListener("change", run);
  $("calendar").addEventListener("change", () => {
    // the same day in the other calendar
    const other = cal() === "gregorian" ? "julian" : "gregorian";
    const m = DATE_RE.exec($("date").value || "");
    if (m) { try { const N = K.kaliDayFromCivil({ calendar: other, year: Number(m[1].replace("−", "-")), month: Number(m[2]), day: Number(m[3]) }); $("date").value = isoOf(N); } catch (e) { /* the parser will say */ } }
    cache.yearKey = cache.monthKey = cache.yearShown = cache.varshaKey = null;
    run();
  });
  $("prev").addEventListener("click", () => { try { setDate(selectedN() - 1); } catch (e) { setDate(deviceToday()); } });
  $("next").addEventListener("click", () => { try { setDate(selectedN() + 1); } catch (e) { setDate(deviceToday()); } });
  $("today-btn").addEventListener("click", () => setDate(deviceToday()));
  document.querySelectorAll('input[name="scheme"]').forEach((r) => r.addEventListener("change", run));
  $("month").addEventListener("click", (ev) => { const b = ev.target.closest(".mday"); if (b && b.dataset.n) { setDate(Number(b.dataset.n)); $("aaj").scrollIntoView({ block: "start" }); } });
  $("theme").addEventListener("click", () => { theme.apply({ auto: "light", light: "dark", dark: "auto" }[theme.mode]); try { keep(readPlace()); } catch (e) { /* the place is being edited */ } });
  $("yr-form").addEventListener("submit", (ev) => {
    ev.preventDefault();
    const m = /^\s*([-−]?\d{1,5})\s*$/.exec($("yr-in").value || "");
    if (!m) { cache.varshaKey = null; $("t-varsha").textContent = ""; setLabels("varsha", NaN); $("varsha-out").innerHTML = `<p class="bad">Write a year as a whole number (astronomical: 0 = 1 BCE, −1 = 2 BCE).</p>`; document.body.dataset.varsha = "done"; return; }
    let pl, Eng;
    try { pl = readPlace(); Eng = engineOf(tier); } catch (e) { notComputed(e.message); return; }
    curPl = pl;
    document.body.dataset.varsha = "computing";
    showVarsha(Eng, Number(m[1].replace("−", "-")) + 3101, pl);
  });
  $("yr-day").addEventListener("click", () => { cache.varshaKey = null; run(); });
  if (!("geolocation" in navigator)) $("geo").hidden = true;
  $("geo").addEventListener("click", () => {
    say("Asking this device for its position…");
    navigator.geolocation.getCurrentPosition((pos) => {
      $("city").value = "custom";
      $("lat").value = pos.coords.latitude.toFixed(4); $("lon").value = pos.coords.longitude.toFixed(4);
      $("off").value = -new Date().getTimezoneOffset() / 60;
      run();
    }, (err) => say("The position was not given: " + (err && err.message ? err.message : "refused") + ". Enter the latitude and longitude yourself.", true), { timeout: 15000, maximumAge: 600000 });
  });
  $("b-city").addEventListener("change", () => { const c = cityOf($("b-city").value); if (c) $("b-off").value = c.off; });
  $("b-off").addEventListener("change", () => { const c = cityOf($("b-city").value); if (c && Number($("b-off").value) !== c.off) $("b-city").value = "custom"; });
  $("dasha-form").addEventListener("submit", (ev) => {
    ev.preventDefault();
    try { computeDasha(); say(""); }
    catch (e) {
      // no daśā from the last birth stays on the page
      $("dasha-out").innerHTML = isRefusal(e) ? refusalHtml(e) : `<p class="bad not-computed">Not computed: ${esc(e && e.message ? e.message : String(e))}</p>`;
      if (!isRefusal(e)) say(e && e.message ? e.message : String(e), true);
    }
  });

  if ("serviceWorker" in navigator && location.protocol !== "file:") navigator.serviceWorker.register("sw.js").catch(() => { /* offline cache is optional */ });
  recordReady.then(showTierNote);
  run();
})();
