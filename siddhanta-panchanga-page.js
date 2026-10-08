/* siddhanta-panchanga-page.js — the page of siddhanta-panchanga.html: the Sūrya-Siddhānta's pañcāṅga for a place and a
 * day, computed on the device by the sovereign engine (panchanga.js, utsava.js, muhurta.js, dasha.js, ss-grahana.js and
 * their roots). This file only reads forms, converts the engine's instants to the user's clock and writes HTML; every
 * number shown comes from those modules.
 *
 * Time: an engine instant t is days since the Kali epoch, midnight on the Laṅkā–Ujjayinī meridian; a site is
 * { latitude, deshantara }, deśāntara = longitude − the meridian's longitude (UJJAYINI_MERIDIAN_DEG). Clock time in a zone
 * = t − meridian ÷ 360 + offset ÷ 24 (days); its date by KalaDvara.civilFromKaliDay. The civil day is a turn of the Earth,
 * so no other correction enters.
 */
(function () {
  "use strict";
  const K = window.KalaDvara, P = window.Panchanga, U = window.Utsava, M = window.Muhurta, D = window.Dasha, G = window.SSGrahana;
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
  const kaliOf = (y, m, d) => K.kaliDayFromCivil({ calendar: "gregorian", year: y, month: m, day: d });
  const civil = (N) => K.civilFromKaliDay(N, "gregorian");
  const isoOf = (N) => { const c = civil(N); return `${c.year}-${pad2(c.month)}-${pad2(c.day)}`; };
  const parseIso = (v) => { const m = /^(-?\d+)-(\d{2})-(\d{2})$/.exec(v || ""); return m ? { y: Number(m[1]), m: Number(m[2]), d: Number(m[3]) } : null; };
  const dayLabel = (N) => { const c = civil(N), v = K.varaOfKaliDay(N).index; return `${VARA_EN[v]} ${c.day} ${MON_EN[c.month - 1]}`; };
  const dateLabel = (N) => { const c = civil(N); return `${c.day} ${MON_EN[c.month - 1]} ${c.year}`; };
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
  /** Ghaṭīs of the turn after the day's sunrise, by the engine's own nāḍī (P.NADI_DAYS). */
  const ghAfter = (t, rise) => (t - rise) / P.NADI_DAYS;
  const dms = (deg) => { const s = Math.round(Math.abs(deg) * 3600); return `${deg < 0 ? "−" : ""}${Math.floor(s / 3600)}° ${pad2(Math.floor(s / 60) % 60)}′ ${pad2(s % 60)}″`; };

  /** The status of an item, from the module's own source or status string. */
  function tagOf(src) {
    const s = String(src || "");
    const practice = /unverified|standard usage|no local text|common practice|\[standard/i.test(s), cites = /\b(SS|BPHS)\b/.test(s);
    if (practice && (!cites || /^(standard usage|unverified|common practice)/i.test(s))) return `<span class="tag cp">प्रचलन · common practice, unverified</span>`;
    if (practice) return `<span class="tag mixed">पाठ + प्रचलन · text + practice</span>`;
    if (/\[reading/.test(s)) return `<span class="tag text">पाठ · text (a reading)</span>`;
    return `<span class="tag text">पाठ · text</span>`;
  }
  const srcLine = (s) => (s ? ` <span class="src">${esc(s)}</span>` : "");

  /** The module's civil day whose sunrise falls on date N of the user's clock (they differ only for far-off zones). */
  function moduleDay(N, site, pl) {
    let Md = N;
    for (let i = 0; i < 2; i++) {
      const r = P.sunrise(Md, site); if (r === null) break;
      const c = clockOf(r, pl).N; if (c === N) break;
      Md += c < N ? 1 : -1;
    }
    return Md;
  }
  /** The month's name in the chosen reckoning. Amānta is the module's (named by saṅkrānti). Pūrṇimānta [common practice]:
   *  the dark half takes the name of the next amānta month; an adhika month stays adhika, new moon to new moon. */
  function monthIn(m, krishna, scheme) {
    if (scheme === "purnimanta" && krishna && !m.adhika) {
      const nx = P.lunarMonth(m.end + 0.5);
      return { name: nx.name, adhika: false, kshaya: nx.kshaya, dropped: nx.kshayaDropped, converted: true };
    }
    return { name: m.name, adhika: m.adhika, kshaya: m.kshaya, dropped: m.kshayaDropped, converted: false };
  }
  const monthStr = (x) => `${esc(x.name)}${x.adhika ? " · अधिक adhika" : ""}${x.kshaya ? ` · क्षय kṣaya (${esc(x.dropped)} dropped)` : ""}`;
  const tithiShort = (i) => { const n = P.tithiName(i); return `${n.paksha === "śukla" ? "śu" : "kṛ"} ${n.name}`; };
  const tithiLong = (i) => { const n = P.tithiName(i); return `${n.paksha} ${n.name}`; };

  // ── state ─────────────────────────────────────────────────────────────────────────────────────────
  let gen = 0, eclGen = 0;
  const cache = { yearKey: null, year: null, yearMs: 0, yearShown: null, monthKey: null, eclKey: null };
  const say = (text, bad) => { const m = $("msg"); m.textContent = text; m.className = bad ? "bad" : "muted"; };
  const scheme = () => (document.querySelector('input[name="scheme"]:checked') || {}).value || "amanta";
  const selectedN = () => { const d = parseIso($("date").value); if (!d) throw new Error("Choose a date."); return kaliOf(d.y, d.m, d.d); };
  const deviceToday = () => { const d = new Date(); return kaliOf(d.getFullYear(), d.getMonth() + 1, d.getDate()); };
  const timed = (key, el, t0, extra) => { const ms = Math.round(now() - t0); timings[key] = ms; if (el) $(el).textContent = `Computed on this device in ${ms} ms${extra || ""}.`; return ms; };

  // ── २ the day ─────────────────────────────────────────────────────────────────────────────────────
  function computeDay(N, site, pl) {
    const Md = moduleDay(N, site, pl);
    const p = P.panchanga(Md, site);
    if (p.polar) return { N, Md, polar: true };
    return { N, Md, p, moonrise: safe(() => U.moonrise(Md, site), null) };
  }
  function seqList(list, pl, N, rise, nameOf, firstExtra) {
    return `<ul class="seq">${list.map((x, i) => `<li><b>${esc(nameOf(x))}</b>${i === 0 && firstExtra ? esc(firstExtra) : ""} — ${x.end === null ? "beyond the search" : `until ${tStr(x.end, pl, N)} <span class="gh">${ghStr(x.endAfterSunrise)}</span>`}</li>`).join("")}</ul>`;
  }
  /** utsava.moonrise searches 1.1 days from sunrise, so its answer can fall after the next sunrise: that is the next
   *  day's moonrise, and this day has none. */
  function moonriseHtml(m, nextRise, rise, pl, N) {
    if (m === null || m === undefined) return `<span class="muted">none between this sunrise and the next</span>`;
    if (m >= nextRise) return `<span class="muted">none between this sunrise and the next; the next is at</span> ${tStr(m, pl, N)}`;
    return `${tStr(m, pl, N)} <span class="gh">${ghStr(ghAfter(m, rise))}</span>`;
  }
  function renderToday(day, pl) {
    const out = $("today");
    if (day.polar) {
      out.dataset.polar = "1";
      out.innerHTML = `<div class="polar" role="note"><b>ध्रुवीय दिन · No sunrise or no sunset here today.</b> At latitude ${esc(pl.lat.toFixed(2))}° the Sun does not cross the horizon on ${esc(dateLabel(day.N))}: it stays above it or below it all day. The pañcāṅga's day runs from one sunrise to the next, so on this day there is none to give at this place. Choose another day or a place nearer the equator.</div>`;
      return;
    }
    delete out.dataset.polar;
    const { p, N } = day, rise = p.sunrise, sch = scheme();
    const krishna = p.tithi[0].paksha === "kṛṣṇa";
    const mo = monthIn(p.month, krishna, sch), v = K.varaOfKaliDay(N);
    const vara = day.Md === N ? p.vara : v.name;
    const rows = [
      ["वार · vāra", `<b>${esc(vara)}</b> <span class="muted">${esc(VARA_DEV[v.index])} · ${esc(VARA_EN[v.index])}, ${esc(dateLabel(N))}</span>`],
      ["तिथि · tithi", seqList(p.tithi, pl, N, rise, (x) => `${x.paksha} ${x.name}`)],
      ["नक्षत्र · nakṣatra", seqList(p.nakshatra, pl, N, rise, (x) => x.name, ` (pada ${p.pada} at sunrise)`)],
      ["योग · yoga", seqList(p.yoga, pl, N, rise, (x) => x.name)],
      ["करण · karaṇa", seqList(p.karana, pl, N, rise, (x) => x.name)],
      ["सूर्योदय · sunrise", `${tStr(rise, pl, N)} <span class="gh">0 घ 00 वि</span>`],
      ["सूर्यास्त · sunset", `${tStr(p.sunset, pl, N)} <span class="gh">${ghStr(p.dayGhati)}</span>`],
      ["चन्द्रोदय · moonrise", moonriseHtml(day.moonrise, p.nextSunrise, rise, pl, N) + ` <span class="src">the Moon's centre, with no lambana (SS 5) and no refraction (utsava.js)</span>`],
      ["मास · lunar month", `<b>${monthStr(mo)}</b> <span class="muted">(${sch === "purnimanta" ? "pūrṇimānta" : "amānta"}, ${krishna ? "kṛṣṇa" : "śukla"} pakṣa)</span> ${tagOf(p.month.rule)}<br><span class="src">named by its saṅkrānti: ${esc(p.month.rule)}${mo.converted ? "; the pūrṇimānta dark half takes the next month's name [common practice]" : ""}. By SS 14.15-14.16's full-moon nakṣatra (${esc(p.month.fullMoonNakshatra)}) it would be ${esc(p.month.nameByFullMoonNakshatra)}${p.month.agree ? ", the same" : ""}.</span>`],
      ["सूर्य-राशि · Sun's rāśi", `${esc(p.sunRashi)} <span class="muted">at sunrise</span>`],
      ["चन्द्र-राशि · Moon's rāśi", `${esc(p.moonRashi)} <span class="muted">at sunrise</span>`],
      ["अयनांश · ayanāṃśa", `${esc(dms(p.ayanamsha))} <span class="src">the Sūrya-Siddhānta's own (SS 3.9-3.10)</span>`],
      ["दिनमान · day", `${ghStr(p.dayGhati)} <span class="src">ghaṭī of the turn; ${esc(ghStr(p.dayGhatiCivil))} of the civil day</span>`],
      ["रात्रिमान · night", `${ghStr(p.nightGhati)} <span class="src">ghaṭī of the turn; ${esc(ghStr(p.nightGhatiCivil))} of the civil day</span>`],
    ];
    out.innerHTML = `<dl class="pan">${rows.map(([k, v2]) => `<dt>${k}</dt><dd>${v2}</dd>`).join("")}</dl>`
      + `<p class="src">Kali day ${esc(p.N)} (ahargaṇa from the Kali epoch). Sunrise and sunset are the Sun's centre on the horizon, without refraction (the text has none). Names: ${esc(P.NAMES_SOURCE.standard_unverified)}.</p>`;
  }

  // ── ३ the parts of the day ──────────────────────────────────────────────────────────────────────────
  /** In three steps with a breath between them (varjya and the lagnas take a few hundred milliseconds). */
  async function computeKala(day, site, g) {
    if (day.polar) return null;
    const k = { W: U.kalaWindows(day.Md, site, {}, { moon: true }), mu: M.muhurtas(day.Md, site), rise: day.p.sunrise,
      lagnaMethod: safe(() => P.lagnaAt(day.p.sunrise, site).method, "") };
    await tick(); if (g !== gen) return k;
    k.vj = safe(() => M.varjya(day.Md, site), null);
    await tick(); if (g !== gen) return k;
    k.lg = safe(() => M.lagnas(day.Md, site), null);
    return k;
  }
  function renderKala(k, day, pl) {
    const out = $("kala-out");
    if (!k || !k.W) { out.innerHTML = `<p class="polar">No sunrise or no sunset at this place today, so the day has no parts to divide.</p>`; return; }
    const { W, mu, rise } = k, N = day.N;
    const span = (w) => (w ? `${tStr(w[0], pl, N)} – ${tStr(w[1], pl, N)} <span class="gh">${ghStr(ghAfter(w[0], rise))} – ${ghStr(ghAfter(w[1], rise))}</span>` : `<span class="muted">—</span>`);
    const parts = [["प्रातः · prātaḥ", W.pratah], ["सङ्गव · saṅgava", W.sangava], ["मध्याह्न · madhyāhna", W.madhyahna], ["अपराह्ण · aparāhṇa", W.aparahna], ["सायाह्न · sāyāhna", W.sayahna]];
    const more = [["पूर्वाह्ण · pūrvāhṇa (first half of the day)", W.purvahna], ["अरुणोदय · aruṇodaya (four ghaṭī before sunrise)", W.arunodaya], ["प्रदोष · pradoṣa (first fifth of the night)", W.pradosha], ["निशीथ · niśītha (the night's eighth fifteenth)", W.nishitha]];
    let h = `<h3>पञ्चधा दिन · the five-fold day ${tagOf(W.status)}</h3><p class="src">${esc(W.status)} (utsava.js kalaWindows)</p>`
      + `<div class="scroll"><table><tbody>${parts.concat(more).map(([n, w]) => `<tr><th scope="row">${n}</th><td>${span(w)}</td></tr>`).join("")}`
      + `<tr><th scope="row">चन्द्रोदय · candrodaya</th><td>${moonriseHtml(W.candrodaya ? W.candrodaya[0] : null, W.next, rise, pl, N)}</td></tr></tbody></table></div>`;
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
    h += `<p class="muted small">Rāhukāla, yamagaṇḍa, gulika-kāla and choghaḍiyā are not shown: no module of this engine computes them, and the page does not invent them.</p>`;
    out.innerHTML = h;
  }

  // ── ५ the year: festivals, saṅkrāntis, ayanas ───────────────────────────────────────────────────────
  function computeYear(Y, site, pl) {
    const t1 = kaliOf(Y, 1, 1), t2 = kaliOf(Y + 1, 1, 1);
    let fest = [], failed = [];
    try { fest = U.festivals(t1, t2, site); }
    catch (e) {
      // one rule that cannot be placed (a polar day in its window) must not hide the others: rule by rule
      fest = [];
      for (const r of U.RULES) {
        if (r.after) continue;
        const rules = [r, ...U.RULES.filter((x) => x.after === r.id)];
        try { fest.push(...U.festivals(t1, t2, site, { rules })); } catch (err) { failed.push({ name: r.name, error: err && err.message ? err.message : String(err) }); }
      }
      fest.sort((a, b) => a.N - b.N);
    }
    const inYear = (t) => civil(clockOf(t, pl).N).year === Y;
    const sk = U.sankrantis(t1 - 2, t2 + 2).filter((s) => inYear(s.at));
    const cs = U.cardinalInSky(t1 - 2, t2 + 2).filter((s) => inYear(s.at));
    return { Y, fest, failed, sk, cs };
  }
  const CARDINAL = { 270: "उत्तरायण · uttarāyaṇa begins: the Sun turns north", 90: "दक्षिणायन · dakṣiṇāyana begins: the Sun turns south",
    0: "वसन्त विषुव · vasanta viṣuva: the Sun crosses the equator northward", 180: "शरद् विषुव · śarad viṣuva: the Sun crosses the equator southward" };
  const KALA_NAME = { sunrise: "at sunrise", purvahna: "in pūrvāhṇa", madhyahna: "in madhyāhna", aparahna: "in aparāhṇa", sayahna: "in sāyāhna",
    pradosha: "in pradoṣa", nishitha: "in niśītha", arunodaya: "in aruṇodaya", candrodaya: "at moonrise" };
  function renderYear(yd, pl) {
    const { fest, sk, cs } = yd;
    let h = `<h3>उत्सव · festivals of ${esc(yd.Y)}</h3><p class="src">Every rule (which tithi, in which part of the day, which of two days) is simplified common practice: “${esc(U.UNVERIFIED)}”. There is no Rohiṇī check for Janmāṣṭamī and no daśamī-vedha for Ekādaśī. The saṅkrānti days take the text's saṅkrānti and puṇya time. Dates are the civil day at this place.</p>`
      + `<p class="caution" id="fast-caution">व्रत/उपवास से पहले, विशेषकर मधुमेह, गर्भावस्था या दवा लेने पर, अपने चिकित्सक से परामर्श करें। · Before any fast — especially with diabetes, pregnancy or regular medication — consult your doctor.</p>`;
    h += fest.length ? `<ul class="flist" id="fest-list">${fest.map((f) => {
      const bits = [];
      if (f.tithi) bits.push(`${esc(f.month)} · ${esc(f.paksha)} ${esc(f.tithi)}${f.kala ? ` · ${esc(KALA_NAME[f.kala] || f.kala)}` : ""}`);
      if (f.sankranti !== undefined) bits.push(`saṅkrānti at ${tStr(f.sankranti, pl, f.N)} (${esc(f.kind)})`);
      if (f.fallback) bits.push("the tithi misses its window on every day; placed by the fallback rule");
      if (f.alternatives > 1) bits.push(`${f.alternatives} days qualify; chosen by “${esc((U.RULES.find((r) => r.id === f.id) || {}).prefer || "")}”`);
      if (f.free && f.free.length) bits.push(`free of Viṣṭi: ${f.free.map((w) => `${tStr(w[0], pl, f.N)}–${tStr(w[1], pl, f.N)}`).join(", ")}`);
      else if (f.free && f.afterAvoided) bits.push(`Viṣṭi covers the window; after it: from ${tStr(f.afterAvoided[0], pl, f.N)}`);
      if (f.note) bits.push(esc(f.note));
      return `<li data-id="${esc(f.id)}"><span class="fdate">${esc(dayLabel(f.N))}</span> <b>${esc(f.name)}</b> ${tagOf(f.status)}<br><span class="src">${bits.join(" · ")}</span></li>`;
    }).join("")}</ul>` : `<p class="muted">No festival could be placed at this place in ${esc(yd.Y)}.</p>`;
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
  function computeCell(N, site, pl, yd, cdDays, sch) {
    const Md = moduleDay(N, site, pl), v = K.varaOfKaliDay(N), c = civil(N);
    const rise = P.sunrise(Md, site), next = P.sunrise(Md + 1, site);
    const cell = { N, Md, c, v, polar: rise === null || next === null };
    if (cell.polar) return cell;
    const L = P.limbsAt(rise), Ln = P.limbsAt(next), gap = mod(Ln.tithi - L.tithi, 30);
    cell.tithi = L.tithi; cell.nak = P.NAKSHATRA[L.nakshatra - 1];
    cell.skipped = []; for (let i = 1; i < gap; i++) cell.skipped.push(mod(L.tithi - 1 + i, 30) + 1);
    cell.vriddhi = gap === 0;
    const marks = [];
    const markOf = (i) => (i === 15 ? "पूर्णिमा · Pūrṇimā" : i === 30 ? "अमावास्या · Amāvāsyā" : i === 11 || i === 26 ? "एकादशी · Ekādaśī" : null);
    if (markOf(L.tithi)) marks.push(markOf(L.tithi));
    for (const i of cell.skipped) if (markOf(i)) marks.push(markOf(i) + " (kṣaya)");
    const startIdx = sch === "purnimanta" ? 16 : 1;
    if (L.tithi === startIdx || cell.skipped.includes(startIdx)) {
      const m = P.lunarMonth(L.tithi === startIdx ? rise + 1e-4 : next - 1e-4);
      marks.push(`मास · ${monthStr(monthIn(m, startIdx === 16, sch))} begins`);
    }
    cell.marks = marks;
    cell.fest = yd ? yd.fest.filter((f) => f.N === Md).map((f) => f.name) : [];
    cell.sk = yd ? yd.sk.filter((s) => clockOf(s.at, pl).N === N).map((s) => `${s.rashi} saṅkrānti ${pad2(clockOf(s.at, pl).hh)}:${pad2(clockOf(s.at, pl).mm)}`) : [];
    cell.cd = cdDays.has(Md);
    return cell;
  }
  function cellHtml(x, selN, todayN) {
    const cls = ["mday", x.N === todayN ? "today" : "", x.N === selN ? "sel" : "", x.polar ? "polar-day" : ""].filter(Boolean).join(" ");
    const wd = `<span class="wd">${esc(VARA_DEV[x.v.index])} · ${esc(VARA_EN[x.v.index])}</span>`;
    if (x.polar) return `<button type="button" class="${cls}" data-day="${x.c.day}" data-n="${x.N}" aria-label="${esc(`${dateLabel(x.N)}: no sunrise or no sunset`)}"><span class="dn">${x.c.day} ${wd}</span><span>no sunrise or sunset</span></button>`;
    const label = [dateLabel(x.N), tithiLong(x.tithi), x.nak, ...x.marks, ...x.fest, ...x.sk].join("; ");
    return `<button type="button" class="${cls}" data-day="${x.c.day}" data-n="${x.N}" aria-label="${esc(label)}">`
      + `<span class="dn">${x.c.day} ${wd}</span><span class="ti">${esc(tithiShort(x.tithi))}${x.vriddhi ? " (vṛddhi)" : ""}</span>`
      + (x.skipped.length ? `<span class="ti">kṣaya: ${esc(x.skipped.map(tithiShort).join(", "))}</span>` : "")
      + `<span class="nk">${esc(x.nak)}</span>`
      + x.marks.map((m) => `<span class="mk">${m}</span>`).join("")
      + (x.cd ? `<span class="mk">चन्द्र-दर्शन · first crescent</span>` : "")
      + x.sk.map((s) => `<span class="sk">${esc(s)}</span>`).join("")
      + x.fest.map((f) => `<span class="fx">${esc(f)}</span>`).join("") + `</button>`;
  }
  async function renderMonth(g, Y, Mo, site, pl, yd, selN) {
    const t0 = now(), first = kaliOf(Y, Mo, 1), dim = kaliOf(Mo === 12 ? Y + 1 : Y, Mo === 12 ? 1 : Mo + 1, 1) - first;
    const cdDays = new Set();
    for (const e of safe(() => U.candraDarshana(first - 3, first + dim + 1, site), [])) if (e.first) cdDays.add(e.first.N);
    const todayN = deviceToday(), lead = K.varaOfKaliDay(first).index;
    $("month").innerHTML = `<h3>${esc(MON_DEV[Mo - 1])} · ${esc(MON_EN_FULL[Mo - 1])} ${esc(Y)}</h3>`
      + `<div class="mgrid" id="mgrid">${VARA_DEV.map((d, i) => `<div class="mhead" aria-hidden="true">${d} · ${VARA_EN[i]}</div>`).join("")}${"<div class=\"mblank\" aria-hidden=\"true\"></div>".repeat(lead)}</div>`;
    const grid = $("mgrid");
    for (let d = 0; d < dim; d += 7) {
      let html = "";
      for (let i = d; i < Math.min(d + 7, dim); i++) html += cellHtml(computeCell(first + i, site, pl, yd, cdDays, scheme()), selN, todayN);
      grid.insertAdjacentHTML("beforeend", html);
      await tick();
      if (g !== gen) return false;
    }
    timed("month", "t-month", t0, `, a week at a time (${dim} days)`);
    return true;
  }

  // ── ६ eclipses, a fortnight at a time ───────────────────────────────────────────────────────────────
  const CONTACTS = [["sparsha", "स्पर्श · sparśa (first contact)"], ["nimilana", "निमीलन · nimīlana (totality begins)"], ["madhya", "मध्य · madhya (middle)"], ["unmilana", "उन्मीलन · unmīlana (totality ends)"], ["moksha", "मोक्ष · mokṣa (last contact)"]];
  function eclipseHtml(E, pl) {
    const mid = clockOf(E.contacts.madhya, pl).N, lunar = E.kind === "lunar";
    const rows = CONTACTS.filter(([c]) => E.contacts[c] !== null && E.contacts[c] !== undefined).map(([c, label]) => {
      const t = E.contacts[c], ck = E.clock && E.clock[c], hz = E.horizon && E.horizon[c];
      return `<tr><th scope="row">${label}</th><td>${tStr(t, pl, mid)}</td><td><span class="gh">${ck ? ghStr(ck.ghatiAfterSunrise) : ""}</span></td><td>${hz ? (hz.above ? "yes" : "no") : "—"}</td></tr>`;
    }).join("");
    return `<div class="ecard" data-kind="${esc(E.kind)}"><h3>${lunar ? "चन्द्र-ग्रहण · lunar eclipse" : "सूर्य-ग्रहण · solar eclipse"} — ${esc(dayLabel(mid))} ${esc(civil(mid).year)}</h3>`
      + `<p>Magnitude <b>${esc(E.magnitude.toFixed(3))}</b> of the ${lunar ? "Moon's" : "Sun's"} diameter (${E.total ? "total, खग्रास" : "partial, खण्डग्रास"}). `
      + `${E.perceptible && E.perceptible.seen ? "Large enough to be seen" : "Too small to be seen"} (${esc(E.perceptible ? E.perceptible.rule : "6.13")}). `
      + `<b>At this place: ${E.seenAtSite ? `<span class="ok">visible</span>` : `<span class="bad">not visible</span>`}</b>${E.seenAtSite ? "" : (lunar ? " (the Moon is below the horizon)" : " (the Sun is below the horizon, or too little of it is covered here)")}.</p>`
      + `<div class="scroll"><table><thead><tr><th scope="col">contact</th><th scope="col">clock</th><th scope="col">from sunrise</th><th scope="col">${lunar ? "Moon" : "Sun"} up?</th></tr></thead><tbody>${rows}</tbody></table></div>`
      + `<p class="src">${tagOf("SS 4, 5, 6.13")} ss-grahana.js: ${lunar ? "the Moon in the Earth's shadow (SS 4)" : "the Moon over the Sun with lambana and nati (SS 4-5)"}; contacts by SS 4.14-4.17${lunar ? "" : " and 5.14-5.17"}; ghaṭīs from that day's sunrise in nāḍīs of the turn.</p></div>`;
  }
  async function runEclipses(N0, site, pl) {
    const g = ++eclGen, t0 = now(), out = [], span = 400, step = 15;
    document.body.dataset.eclipses = "computing";
    $("ecl").innerHTML = `<p class="muted" id="ecl-progress">Searching the text's syzygies…</p>`;
    for (let a = N0; a < N0 + span; a += step) {
      try { out.push(...G.eclipsesBetween(a, Math.min(a + step, N0 + span), site)); }
      catch (e) { if (g === eclGen) { $("ecl").innerHTML = `<p class="bad">${esc(e && e.message ? e.message : e)}</p>`; document.body.dataset.eclipses = "done"; } return; }
      if (g !== eclGen) return;
      const pr = $("ecl-progress"); if (pr) pr.textContent = `Searching the text's syzygies… ${Math.min(a + step - N0, span)} of ${span} days, ${out.length} eclipse${out.length === 1 ? "" : "s"} so far.`;
      await tick();
      if (g !== eclGen) return;
    }
    $("ecl").innerHTML = out.length ? `<p class="muted">${out.length} eclipse${out.length === 1 ? "" : "s"} from ${esc(dateLabel(N0))} to ${esc(dateLabel(N0 + span))}, in the order they come.</p>` + out.map((E) => eclipseHtml(E, pl)).join("")
      : `<p class="muted">The text gives no eclipse at this place between ${esc(dateLabel(N0))} and ${esc(dateLabel(N0 + span))}.</p>`;
    timed("eclipses", "t-ecl", t0, `, a fortnight at a time so that the page stays responsive`);
    document.body.dataset.eclipses = "done";
  }

  // ── ७ Vimśottarī daśā ────────────────────────────────────────────────────────────────────────────────
  const SPD = Number(K.SPANDAS_PER_DAY);
  const spandas = (x) => { const w = Math.floor(x); return BigInt(w) * K.SPANDAS_PER_DAY + BigInt(Math.round((x - w) * SPD)); };
  const ratNum = (r) => Number(r.num) / Number(r.den);
  function computeDasha() {
    const bd = parseIso($("b-date").value);
    if (!bd) throw new Error("Give the birth date.");
    const tm = /^(\d{1,2}):(\d{2})/.exec($("b-time").value || "");
    if (!tm) throw new Error("Give the birth time.");
    const off = Number($("b-off").value);
    if ($("b-off").value === "" || !Number.isFinite(off) || off < -12 || off > 14) throw new Error("Give the birth clock's UTC offset.");
    const pl = { off, mer: readPlace().mer };   // a clock time needs only its offset and the meridian
    const t0 = now();
    const tBirth = instantOf(kaliOf(bd.y, bd.m, bd.d), Number(tm[1]) + Number(tm[2]) / 60, pl);
    const V = D.vimshottari(tBirth, { year: $("b-year").value, balance: $("b-bal").value });
    const shift = pl.off * 15 - pl.mer;   // the deśāntara that turns the engine's count into the birth clock's
    const dt = (r) => { const c = D.toCivil(r, shift); return `${c.day} ${MON_EN[c.month - 1]} ${c.year}`; };
    const nowT = Date.now() / 86400000 + 2440587.5 - (K.KALI_JDN - 0.5) + pl.mer / 360;   // this moment, as an engine instant
    const cur = D.chainAt(V, spandas(nowT), 2);
    const isCur = (p) => cur.some((c) => c.level === p.level && D.cmp(c.start, p.start) === 0);
    const yr = (r) => ratNum(r).toFixed(2);
    const elapsed = ratNum(V.birth.elapsed);
    let h = `<p class="fate">गणना घोषित है — भाग्य नहीं · computation declared, not fate</p>`
      + `<p>Birth instant ${esc(dateLabel(kaliOf(bd.y, bd.m, bd.d)))} ${esc(pad2(tm[1]))}:${esc(tm[2])} (${esc(zoneLabel(off))}). The Moon in <b>${esc(V.birth.nakshatraName)}</b>, ${esc((elapsed * 100).toFixed(1))}% of it gone (${V.birth.method === "time" ? "by time, BPHS 46.16" : "by arc"}). `
      + `Daśā at birth: <b>${esc(D.LORDS[V.lordAtBirth])}</b>, balance ${esc(yr(V.balanceYears))} years.</p>`
      + `<p class="src">${tagOf("BPHS 46.12-46.16")} The year used: ${esc((Number(V.year.num) / Number(V.year.den)).toFixed(6))} civil days — ${esc(V.year.source)}. Lords and years: BPHS 46.12-46.15; antardaśā: 51.1-2 (dasha.js).</p>`
      + `<div class="scroll"><table class="dasha" id="dasha-table"><caption>महादशा और अन्तर्दशा · mahādaśā and antardaśā (dates in the birth clock)</caption><thead><tr><th scope="col">महादशा · mahādaśā</th><th scope="col">years</th><th scope="col">from</th><th scope="col">to</th></tr></thead><tbody>`;
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
  function keep(pl) { store.set({ city: pl.city, lat: pl.lat, lon: pl.lon, off: pl.off, mer: pl.mer, scheme: scheme(), theme: theme.mode }); }
  async function run() {
    const g = ++gen;
    let pl, N;
    try { pl = readPlace(); N = selectedN(); } catch (e) { say(e.message, true); return; }
    say("");
    keep(pl);
    document.body.dataset.ready = "0";
    const site = siteOf(pl), c = civil(N), sch = scheme();
    $("place-state").textContent = `${pl.name}: latitude ${pl.lat.toFixed(4)}°, longitude ${pl.lon.toFixed(4)}° E, deśāntara ${(pl.lon - pl.mer).toFixed(4)}° from the Ujjayinī meridian (${pl.mer}° E); clock ${zoneLabel(pl.off)}.`;
    try {
      let t0 = now();
      const day = computeDay(N, site, pl);
      renderToday(day, pl);
      timed("today", "t-today", t0);
      await tick(); if (g !== gen) return;

      t0 = now();
      const kala = await computeKala(day, site, g);
      if (g !== gen) return;
      renderKala(kala, day, pl);
      timed("kala", "t-kala", t0);
      await tick(); if (g !== gen) return;

      const placeKey = `${pl.lat}|${pl.lon}|${pl.off}|${pl.mer}`;
      const yearKey = `${c.year}|${placeKey}`;
      if (cache.yearKey !== yearKey) {
        t0 = now();
        cache.yearKey = null; cache.year = computeYear(c.year, site, pl); cache.yearKey = yearKey; cache.yearMs = now() - t0;
        await tick(); if (g !== gen) return;
      }
      const monthKey = `${c.year}-${c.month}|${placeKey}|${sch}`;
      if (cache.monthKey !== monthKey) {
        cache.monthKey = null;
        const done = await renderMonth(g, c.year, c.month, site, pl, cache.year, N);
        if (!done) return;
        cache.monthKey = monthKey;
      }
      $("month").querySelectorAll(".mday").forEach((b) => b.classList.toggle("sel", Number(b.dataset.n) === N));
      if (cache.yearShown !== yearKey) {
        t0 = now();
        renderYear(cache.year, pl);
        cache.yearShown = yearKey;
        timed("year", "t-year", t0 - cache.yearMs, ` (${cache.year.fest.length} festivals, ${cache.year.sk.length} saṅkrāntis)`);
      }
      document.body.dataset.ready = "1";
      const eclKey = `${N}|${placeKey}`;
      if (cache.eclKey !== eclKey) { cache.eclKey = eclKey; runEclipses(N, site, pl); }
    } catch (e) {
      say("The engine stopped: " + (e && e.message ? e.message : String(e)), true);
      document.body.dataset.ready = "1";
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

  fillCitySelect($("city"), true);
  fillCitySelect($("b-city"), true);
  $("b-year").innerHTML = Object.keys(D.YEAR).map((k) => `<option value="${esc(k)}">${esc(k)}: ${esc((Number(D.YEAR[k].num) / Number(D.YEAR[k].den)).toFixed(4))} days</option>`).join("");

  const saved = store.get() || {};
  const c0 = cityOf(saved.city);
  if (c0) { $("city").value = c0.id; setPlaceFields(c0); }
  else if (Number.isFinite(saved.lat) && Number.isFinite(saved.lon) && Number.isFinite(saved.off)) { $("city").value = "custom"; $("lat").value = saved.lat; $("lon").value = saved.lon; $("off").value = saved.off; }
  else { $("city").value = "ujjain"; setPlaceFields(cityOf("ujjain")); }
  $("mer").value = Number.isFinite(saved.mer) ? saved.mer : UJJAYINI_MERIDIAN_DEG;
  if (saved.scheme === "purnimanta") document.querySelector('input[name="scheme"][value="purnimanta"]').checked = true;
  theme.apply(saved.theme === "light" || saved.theme === "dark" ? saved.theme : "auto");
  $("date").value = isoOf(deviceToday());
  $("b-city").value = $("city").value; $("b-off").value = $("off").value;

  $("city").addEventListener("change", () => { const c = cityOf($("city").value); if (c) setPlaceFields(c); run(); });
  for (const id of ["lat", "lon", "off"]) $(id).addEventListener("change", () => {
    const c = cityOf($("city").value);
    if (c && !(Number($("lat").value) === c.lat && Number($("lon").value) === c.lon && Number($("off").value) === c.off)) $("city").value = "custom";
    run();
  });
  $("mer").addEventListener("change", () => { if ($("mer").value === "") $("mer").value = UJJAYINI_MERIDIAN_DEG; run(); });
  $("date").addEventListener("change", run);
  $("prev").addEventListener("click", () => { try { setDate(selectedN() - 1); } catch (e) { setDate(deviceToday()); } });
  $("next").addEventListener("click", () => { try { setDate(selectedN() + 1); } catch (e) { setDate(deviceToday()); } });
  $("today-btn").addEventListener("click", () => setDate(deviceToday()));
  document.querySelectorAll('input[name="scheme"]').forEach((r) => r.addEventListener("change", run));
  $("month").addEventListener("click", (ev) => { const b = ev.target.closest(".mday"); if (b && b.dataset.n) { setDate(Number(b.dataset.n)); $("aaj").scrollIntoView({ block: "start" }); } });
  $("theme").addEventListener("click", () => { theme.apply({ auto: "light", light: "dark", dark: "auto" }[theme.mode]); try { keep(readPlace()); } catch (e) { /* the place is being edited */ } });
  if (!("geolocation" in navigator)) $("geo").hidden = true;
  $("geo").addEventListener("click", () => {
    say("Asking this device for its position…");
    navigator.geolocation.getCurrentPosition((pos) => {
      $("city").value = "custom";
      $("lat").value = pos.coords.latitude.toFixed(4); $("lon").value = pos.coords.longitude.toFixed(4);
      const d = parseIso($("date").value), when = d ? new Date(d.y, d.m - 1, d.d, 12) : new Date();
      $("off").value = -when.getTimezoneOffset() / 60;
      run();
    }, (err) => say("The position was not given: " + (err && err.message ? err.message : "refused") + ". Enter the latitude and longitude yourself.", true), { timeout: 15000, maximumAge: 600000 });
  });
  $("b-city").addEventListener("change", () => { const c = cityOf($("b-city").value); if (c) $("b-off").value = c.off; });
  $("b-off").addEventListener("change", () => { const c = cityOf($("b-city").value); if (c && Number($("b-off").value) !== c.off) $("b-city").value = "custom"; });
  $("dasha-form").addEventListener("submit", (ev) => {
    ev.preventDefault();
    try { computeDasha(); say(""); } catch (e) { say(e && e.message ? e.message : String(e), true); }
  });

  if ("serviceWorker" in navigator && location.protocol !== "file:") navigator.serviceWorker.register("sw.js").catch(() => { /* offline cache is optional */ });
  run();
})();
