/* vedha-page.js — the page logic of vedha.html, kept out of the HTML so the page runs under a strict Content-Security-Policy
 * (script-src 'self': no inline script, no inline handler; council R-08). The engine is in the sovereign modules it loads.
 *
 * THE MOON'S PREDICTIONS IN THREE CHOICES (owner, 2026-10-08). The Sun, the stars, the noon shadow and the instruments are
 * the text's in every choice (the saṃskāra moves only the Moon and the node). The crescent, the Moon on a junction star
 * and the eclipses follow the choice, one code path each:
 *   'ss+parameshvara' (the default) and 'ss': the text's rules on the tier's places — ss-drishya.js bound to the tier's
 *       calendar (SSTier.calendar/utsava) for the crescent (SS 10.1-10.4), vedha-lekha.js's rule for the Moon on a
 *       junction star (SS 8.14-8.15, 7.10) on SSTier.places, and the eclipses by ss-grahana.js (plain) or
 *       SSTier.eclipsesNear (the saṃskāra's model, samskara.js);
 *   'drik' (Modern Bhāratīya): the eclipses only, by drik-grahana.js on the series (siddhanta-tier.js), 1850–2150 and
 *       refused outside; the text's crescent rule and the junction stars' places are the text's, so the dṛk choice does
 *       not compute those two here and says so.
 * The labels come from ShunyaMath.TIERS. The antara (observed − the text) is vedha-lekha.js's reduction against the plain
 * text in every choice. */
(function () {
  "use strict";
  const K = window.KalaDvara, C = window.SSChaya, G = window.SSGrahana, P = window.Panchanga, Dr = window.SSDrishya, V = window.VedhaLekha;
  const Y = window.Yantra, S = window.Sphuta, UD = window.SSUdaya, ST = window.SSTier, PA = window.Parampara, MC = window.ShunyaMath, SD = window.SiddhantaTier;
  const LEDGER_KEY = "bharat.vedha-lekha/1", SITE_KEY = "bharat.vedha-site/1";
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const mod = (a, m) => ((a % m) + m) % m;
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); return true; } catch (e) { return false; } },
    del(k) { try { localStorage.removeItem(k); } catch (e) { /* nothing kept */ } },
  };
  const say = (text, bad) => { const m = $("msg"); m.textContent = text; m.className = bad ? "bad" : "ok"; };
  /** A confirmation inside the page (no browser dialog): resolves true or false. */
  function ask(text) {
    return new Promise((resolve) => {
      const box = $("confirm"); $("confirm-text").textContent = text; box.hidden = false; $("confirm-yes").focus();
      const done = (v) => { box.hidden = true; $("confirm-yes").onclick = $("confirm-no").onclick = null; resolve(v); };
      $("confirm-yes").onclick = () => done(true); $("confirm-no").onclick = () => done(false);
    });
  }
  /** Where the ledger is kept: in the published page's own store (one document per entry, a season per ledger, readable
   *  by its owner only), or in this browser. Every write keeps the whole chain; nothing is ever deleted from the store. */
  const Keep = {
    db: null, season: null,
    async init() {
      try { if (window.claude && typeof window.claude.use === "function") this.db = await window.claude.use("db"); } catch (e) { this.db = null; }
      $("keep-state").textContent = this.db ? "The ledger is kept in this page's own store, which only the page's owner can read or write; anyone else opening it can see the predictions but cannot keep a ledger here. Export a copy after each night as well."
        : "The ledger is kept in this browser only. Export it after each night: clearing the browser's data erases it.";
    },
    pad: (n) => String(n).padStart(6, "0"),
    async load() {
      if (!this.db) return store.get(LEDGER_KEY);
      const cur = await this.db.doc("meta/current").get();
      if (!cur.exists) return null;
      this.season = cur.data().season;
      const head = await this.db.doc("seasons/" + this.season).get();
      if (!head.exists) return null;
      const h = head.data(), entries = [];
      let last = 0;
      for (;;) {
        const snap = await this.db.collection("seasons/" + this.season + "/entries").where("seq", ">", last).orderBy("seq").limit(500).get();
        snap.docs.forEach((d) => entries.push(d.data().entry));
        if (snap.size < 500) break;
        last = entries[entries.length - 1].seq;
      }
      const L = { format: h.format, site: h.site };
      if (h.shanku !== undefined) L.shanku = h.shanku;
      L.entries = entries;
      if (h.seal) L.seal = h.seal;
      return JSON.stringify(L);
    },
    async start(L) {
      if (!this.db) { if (!store.set(LEDGER_KEY, V.toJSON(L))) say("This browser would not keep the ledger: export it now.", true); return; }
      this.season = "s" + Date.now().toString(36);
      const head = { format: L.format, site: L.site };
      if (L.shanku !== undefined) head.shanku = L.shanku;
      await this.db.doc("seasons/" + this.season).set(head);
      for (const e of L.entries) await this.db.doc(`seasons/${this.season}/entries/${this.pad(e.seq)}`).set({ seq: e.seq, entry: e });
      if (L.seal) await this.db.doc("seasons/" + this.season).update({ seal: L.seal });
      await this.db.doc("meta/current").set({ season: this.season });
    },
    async added(L, from) {
      if (!this.db) { if (!store.set(LEDGER_KEY, V.toJSON(L))) say("This browser would not keep the ledger: export it now.", true); return; }
      for (const e of L.entries.slice(from)) {
        const ref = this.db.doc(`seasons/${this.season}/entries/${this.pad(e.seq)}`);
        const there = await ref.get();
        if (there.exists && there.data().entry.sealedHash !== e.sealedHash) throw new Error("Another device wrote this entry first. Reload the page and write it again.");
        await ref.set({ seq: e.seq, entry: e });
      }
    },
    async sealed(L) { if (!this.db) { store.set(LEDGER_KEY, V.toJSON(L)); return; } await this.db.doc("seasons/" + this.season).update({ seal: L.seal }); },
    async forget() { if (!this.db) { store.del(LEDGER_KEY); return; } await this.db.doc("meta/current").delete(); this.season = null; },
  };

  // ── the Moon's three choices ────────────────────────────────────────────────────────────────────────
  const TIERS = MC.TIERS, TIER_IDS = MC.TIER_IDS, shared = MC.yantraState();
  const isRefusal = (e) => !!(e && e.code === "TIER_OUT_OF_SPAN");
  const tierTitle = (id) => `${TIERS[id].labelSa} · ${TIERS[id].label}`;
  let moonTier, linkNote = "";
  try { moonTier = MC.pageTier(shared.get().tier); }
  catch (e) { moonTier = MC.pageTier(""); linkNote = `The link asked for the computation “${String(shared.get().tier)}”, which is not one of the choices; the default is used and nothing was stored.`; }
  /** The paramparā record for the default choice (corpus/parampara/*.json, read once from this page's own origin). */
  const record = { state: "loading", error: null };
  async function loadRecord() {
    try {
      const get = async (u) => { const r = await fetch(u); if (!r.ok) throw new Error(`${u}: ${r.status} ${r.statusText}`); return r.json(); };
      const [registry, samskara] = await Promise.all([get("corpus/parampara/registry.json"), get("corpus/parampara/samskara.json")]);
      ST.useParampara(PA.load({ registry, samskara }));
      record.state = "ready";
    } catch (e) { record.state = "unavailable"; record.error = e && e.message ? e.message : String(e); }
    document.body.dataset.parampara = record.state;
  }
  const engines = new Map();
  /** The Moon's engine of a choice: the text's modules bound to the tier's places, or the dṛk series. */
  function moonEngine(id) {
    if (engines.has(id)) return engines.get(id);
    const T = TIERS[id];
    let E;
    if (T.family === "ss") {
      if (T.samskara && record.state !== "ready") throw new Error(`${T.label} needs the paramparā record (corpus/parampara/registry.json and samskara.json), which could not be read here${record.error ? ` (${record.error})` : ""}. Choose another computation.`);
      const o = { samskara: T.samskara }, cal = ST.calendar(o), ut = ST.utsava(o);
      E = { id, family: "ss", T, opts: o, P: cal, U: ut, Dr: Dr.withPanchanga(cal, ut), places: (t) => ST.places(t, o), label: ST.label(o) };
    } else E = { id, family: "drik", T };
    engines.set(id, E);
    return E;
  }
  /** The labels of a choice, as math-core.js states them (M.TIERS). */
  function labelsHtml(id, jd) {
    const T = TIERS[id];
    let ay = null;
    if (Number.isFinite(jd)) { try { ay = MC.tierAyanamsha(jd, id); } catch (e) { ay = null; } }
    const rows = [["engine", T.engine]];
    if (T.reduction) rows.push(["reduction", T.reduction]);
    rows.push(["ayanāṃśa", `${T.ayanamsha.name}${ay ? ` = ${ay.deg.toFixed(4)}°` : ""} — ${T.ayanamsha.source}`], ["time", T.time], ["sunrise", T.sunrise]);
    if (T.moonrise) rows.push(["moonrise", T.moonrise]);
    rows.push(["day", T.dayBoundary], ["month", T.month], ["span", `${T.span.years[0]} … ${T.span.years[1]} — ${T.span.basis}${T.span.accuracyMeasured ? `; measured in the repository's tests: ${T.span.accuracyMeasured}` : ""}`], ["provenance", T.provenance]);
    return `<details class="tl" data-tier="${esc(id)}"><summary>the Moon's predictions: <b>${esc(tierTitle(id))}</b> — ayanāṃśa ${esc(T.ayanamsha.name)}</summary><dl>${rows.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join("")}</dl></details>`;
  }
  function refusalHtml(e) {
    return `<div class="refusal" role="note" data-refused="drik"><b>${esc(TIERS.drik.labelSa)} · ${esc(TIERS.drik.label)}: not served here.</b> ${esc(e && e.message ? e.message : String(e))}`
      + `<br>${TIER_IDS.filter((id) => TIERS[id].family === "ss").map((id) => `<button type="button" data-use-tier="${esc(id)}">${esc(tierTitle(id))} — use this</button>`).join("")}</div>`;
  }
  const ECL_CAVEAT = Object.freeze({
    // the figures are the ones ss-grahana.test.js asserts ('[measured] Parameśvara's and Nīlakaṇṭha's recorded eclipses')
    ss: "These are the plain Sūrya-Siddhānta's predictions, to be tested — not a forecast. The repository's tests set this model against the ancestors' own eclipse records (Jyotirmīmāṃsā, 1398–1517; ss-grahana.test.js), and it does not reproduce all of them: for SDip-82 its eclipse comes in the evening after the next sunrise, and it puts Nīlakaṇṭha's two eclipses on the civil day before the one recorded. If you watch, record what you see — including nothing.",
    "ss+parameshvara": "These are the text's eclipse rules on the saṃskāra's places — the Moon and the node moved as the paramparā's record says (corpus/parampara/samskara.json) — to be tested, not a forecast. If you watch, record what you see — including nothing.",
    drik: "These are the eclipses of the dṛk choice's own series (drik-grahana.js), served for 1850–2150. If you watch, record what you see — including nothing.",
  });
  function showMoonTier() {
    const T = TIERS[moonTier];
    document.querySelectorAll('input[name="moon-tier"]').forEach((r) => { r.checked = r.value === moonTier; });
    let note = T.family === "drik"
      ? `${T.engine} Served for ${T.span.years[0]}–${T.span.years[1]}. In this choice the page gives the eclipses; the crescent (SS 10.1's twelve kālāṃśa) and the Moon on a junction star (the stars' places of SS chapter 8) are the text's rules and places, and are not computed for the dṛk Moon here.`
      : T.samskara && record.state === "ready" ? ST.label({ samskara: T.samskara }).caption : `${T.engine}.`;
    if (linkNote) note = `${linkNote} ${note}`;
    $("moon-tier-note").textContent = note;
    $("ecl-tier").textContent = `(${tierTitle(moonTier)})`;
    $("ecl-caveat").textContent = ECL_CAVEAT[moonTier];
  }

  let ledger = null, stars = [], plan = null, lastPred = null;

  // ── days: the device's calendar date only (the clock of record is the bowl) ─────────────────────────
  // One signed parser for every date on the page: YYYY-MM-DD with an astronomical year (0 = 1 BCE), in the calendar chosen
  // in section ३ (proleptic Gregorian or Julian), checked by kala-dvara.js — no Date object, so years 0–99 and five-digit
  // years are what they say. The text's computations are tested over −50,000 … +50,000 (ss-tier.js SPAN_YEARS).
  const DATE_RE = /^\s*([-−]?\d{1,5})-(\d{1,2})-(\d{1,2})\s*$/, SPAN = ST.SPAN_YEARS;
  const cal = () => ($("calendar") && $("calendar").value === "julian" ? "julian" : "gregorian");
  const CAL_NAME = { gregorian: "Gregorian", julian: "Julian" };
  function kaliOfDate(v, what) {
    const w = what || "The civil day", m = DATE_RE.exec(String(v == null ? "" : v));
    if (!m) throw new Error(`${w}: write YYYY-MM-DD with an astronomical year (0 = 1 BCE), for example 2026-10-08 or -3101-01-23.`);
    const year = Number(m[1].replace("−", "-")) + 0, month = Number(m[2]), day = Number(m[3]);
    if (year < SPAN[0] || year > SPAN[1]) throw new Error(`${w}: year ${year} is outside ${SPAN[0]} … ${SPAN[1]}, the span the text's computations are tested over.`);
    if (month < 1 || month > 12) throw new Error(`${w}: month ${month} is not 1–12.`);
    try { return K.kaliDayFromCivil({ calendar: cal(), year, month, day }); }
    catch (e) { throw new Error(`${w}: ${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")} does not exist in the ${CAL_NAME[cal()]} calendar.`); }
  }
  const dateOfKali = (N) => { const c = K.civilFromKaliDay(N, cal()); return `${c.year < 0 ? "-" : ""}${String(Math.abs(c.year)).padStart(4, "0")}-${String(c.month).padStart(2, "0")}-${String(c.day).padStart(2, "0")}`; };
  const todayKali = () => { const d = new Date(); return K.kaliDayFromCivil({ calendar: "gregorian", year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate() }); };

  // ── units ───────────────────────────────────────────────────────────────────────────────────────────
  const kapStr = (asus) => { const c = V.kapalaOfAsus(asus, true); return `${c.ghati} घ ${c.vinadi} वि ${c.prana} प्रा`; };
  // rounded to the whole minute first, so that 20 h 59.6 m reads 21h 00m, not 20h 60m
  const hoursStr = (asus) => { const m = Math.round(asus / V.ASUS_PER_DAY * 1440), hh = Math.floor(m / 60), mm = m % 60; return `≈ ${hh}h ${String(mm).padStart(2, "0")}m after sunrise`; };
  const arcStr = (deg) => { const a = V.arcOfDegrees(deg, true); return `${a.amsha}° ${a.kala}′ ${Math.round(a.vikala)}″`; };
  const angulaOfNum = (x) => { let a = Math.floor(x + 1e-9), v = Math.round((x - a) * 60); if (v === 60) { a++; v = 0; } return { angula: a, vyangula: v }; };
  const angStr = (x) => { const r = angulaOfNum(x); return `${r.angula} अं ${r.vyangula} व्यं`; };
  const ayanaOf = (lam) => (mod(lam, 360) < 90 || mod(lam, 360) >= 270 ? "uttara" : "dakshina");

  // ── the place ───────────────────────────────────────────────────────────────────────────────────────
  function siteFromForm() {
    const site = { name: $("site-name").value.trim() || "मेरा स्थान", deshantara: Number($("site-desh").value) || 0 };
    const pa = $("site-pb-a").value, lat = Number($("site-lat").value);
    if (pa !== "") site.palabha = { angula: Number(pa), vyangula: Number($("site-pb-v").value || 0) };
    else if (Number.isFinite(lat) && $("site-lat").value !== "") site.latitude = lat;
    else throw new Error("Give the latitude or the palabhā.");
    const shanku = Number($("site-shanku").value) || 12;
    return { site, shanku };
  }
  function modelOf(site, shanku) { const p = V.placeOf(site, shanku); return { latitude: p.latitude, deshantara: p.deshantara, palabha: p.palabha }; }
  function fillSiteForm(site, shanku) {
    $("site-name").value = site.name || "";
    $("site-desh").value = site.deshantara || 0;
    if (site.palabha !== undefined) { const pb = typeof site.palabha === "number" ? angulaOfNum(site.palabha) : site.palabha; $("site-pb-a").value = pb.angula || 0; $("site-pb-v").value = pb.vyangula || 0; $("site-lat").value = ""; }
    else { $("site-lat").value = site.latitude; $("site-pb-a").value = ""; $("site-pb-v").value = ""; }
    $("site-shanku").value = shanku || 12;
  }
  function setPlan(site, shanku) {
    plan = { site, shanku, model: modelOf(site, shanku) };
    $("site-state").textContent = `${ledger ? "The ledger's place" : "Planning place"}: ${site.name} — latitude ${plan.model.latitude.toFixed(3)}°, palabhā ${angStr(plan.model.palabha)}, deśāntara ${plan.model.deshantara}°, śaṅku ${shanku} aṅgula.`;
    for (const id of ["site-name", "site-lat", "site-pb-a", "site-pb-v", "site-desh", "site-shanku"]) $(id).disabled = !!ledger;
    $("btn-start").disabled = !!ledger; $("btn-plan").disabled = !!ledger;
  }

  // ── the ledger, kept on this device ─────────────────────────────────────────────────────────────────
  async function load() {
    const t = await Keep.load();
    if (t) {
      // a kept ledger is trusted no more than an imported one: the certifier checks every field, not only the chain
      const c = V.certify(t);
      if (!c.ok) { say("The kept ledger is refused: " + c.reasons.slice(0, 3).map((r) => r.where + " " + r.reason).join("; "), true); ledger = null; }
      else { try { ledger = V.fromJSON(t); } catch (e) { say("The kept ledger could not be read: " + e.message, true); ledger = null; } }
    }
    if (ledger) { setPlan(ledger.site, ledger.shanku); fillSiteForm(ledger.site, ledger.shanku); return; }
    const s = store.get(SITE_KEY);
    if (s) { try { const o = JSON.parse(s); fillSiteForm(o.site, o.shanku); setPlan(o.site, o.shanku); return; } catch (e) { /* plan anew */ } }
    const f = siteFromForm(); setPlan(f.site, f.shanku);
  }
  async function append(record) {
    if (!ledger) throw new Error("Start the season's ledger first (section १).");
    const next = V.append(ledger, record, { at: todayKali() });
    await Keep.added(next, ledger.entries.length);
    ledger = next; showLedger();
  }

  // ── predictions for a day ───────────────────────────────────────────────────────────────────────────
  // ── the Moon in the chosen computation ─────────────────────────────────────────────────────────────
  const wrap180 = (x) => { const y = mod(x + 180, 360) - 180; return y === -180 ? 180 : y; };
  const ayanamshaText = (t) => S.ayanamshaSS(S.spandasOfDays(t));
  /** The Moon's polar longitude (SS 7.10, 8.14-8.15) on a choice's places: its sāyana place less the āyana part of 7.10,
   *  less the ayanāṃśa — vedha-lekha.js's moonPolarAt, with the places of the choice. */
  function moonPolarOn(places, t) {
    const p = places(t), A = ayanamshaText(t), lam = mod(p.moon + A, 360);
    return mod(lam - p.moonLatitude * 60 * UD.kranti(lam + 90) / 3600 - A, 360);
  }
  /** The Moon on a junction star after the sunrise of day N (vedha-lekha.js predictYuti's rule on the choice's places). */
  function yutiOn(places, N, star, site) {
    const rise = V.sunriseAt(N, site), next = V.sunriseAt(N + 1, site);
    const f = (t) => wrap180(moonPolarOn(places, t) - star.dhruvaka);
    let t = rise + 0.5;
    for (let i = 0; i < 20; i++) {
      const rate = (f(t + 0.01) - f(t - 0.01)) / 0.02, step = -f(t) / rate;
      t += step;
      if (Math.abs(step) < 1e-11) break;
    }
    const ok = t >= rise && t < next && Math.abs(f(t)) < 1e-6;
    return { name: star.name, t: ok ? t : null, sinceSunriseAsus: ok ? V.turnAsusBetween(rise, t) : null };
  }
  /** The evening crescent of day N by SS 10.1-10.4 (ss-drishya.js at its sunset, bound to the choice's calendar), as
   *  vedha-lekha.js predictCrescent gives it for the plain text. */
  function crescentOn(E, N, site) {
    const m = E.Dr.moonAtSunset(N, site, {});
    if (m.half !== "shukla") return { kalamsa: null, seen: false, limit: UD.DARSHANA_KALAMSA };
    return { kalamsa: m.kalamsa, seen: m.kalamsa >= UD.DARSHANA_KALAMSA, limit: UD.DARSHANA_KALAMSA };
  }
  /** The tithi and nakṣatra at the dṛk choice's own sunrise of the day (math-core tierDay; the series' Sun and Moon). */
  function drikLimbs(N, ms) {
    const lon = ST.MERIDIAN_DEG + ms.deshantara, tz = lon / 15;   // the place's mean time: it only picks the civil date
    const d = MC.tierDay(N + ST.KALI_JD0 - tz / 24 + 0.5, ms.latitude, lon, tz, "drik");
    if (d.polar) return { polar: true };
    const s = SD.sunMoon(d.sunriseJd);
    if (!s) throw new MC.TierSpanError("drik", d.sunriseJd, "the Moon");
    return { tithi: Math.floor(mod(s.elongation, 360) / 12) + 1, nakshatra: Math.floor(mod(s.moonSid, 360) / (40 / 3)) + 1 };
  }
  function predictDay(N) {
    const ms = plan.model, rise = V.sunriseAt(N, ms), next = V.sunriseAt(N + 1, ms), set = V.sunsetAt(N, ms);   // one rule for both ends
    const sun = C.textSun(N + 0.5 - ms.deshantara / 360), noon = C.noonShadow(sun.sayana, ms.palabha);
    const transits = stars.slice(0, 28).map((st) => V.predictTransit(N, st, ms)).filter((p) => p.above && p.t > set + 0.04 && p.t < next - 0.04).sort((a, b) => a.t - b.t);
    const out = { N, rise, setAsus: V.turnAsusBetween(rise, set), noon: { chaya: noon.chaya, dir: noon.dir, ayana: ayanaOf(sun.sayana) }, transits, moonTier };
    const E = moonEngine(moonTier);
    if (E.family === "ss") {
      const L = E.P.limbsAt(rise);
      out.tithi = P.tithiName(L.tithi); out.nakshatra = P.NAKSHATRA[L.nakshatra - 1];
      out.crescent = L.tithi >= 29 || L.tithi <= 3 ? crescentOn(E, N, ms) : null;
      out.yoga = stars.slice(0, 28).map((st) => yutiOn(E.places, N, st, ms)).filter((p) => p.t !== null);
    } else {
      out.crescent = null; out.yoga = [];
      try { const L = drikLimbs(N, ms); if (!L.polar) { out.tithi = P.tithiName(L.tithi); out.nakshatra = P.NAKSHATRA[L.nakshatra - 1]; out.drikLimbs = true; } }
      catch (e) { if (!isRefusal(e)) throw e; out.moonRefused = e; }
    }
    return out;
  }
  function showPrediction(p) {
    const rows = [];
    $("tl-ganita").innerHTML = labelsHtml(p.moonTier, ST.jdOfDays(p.rise));
    const limbs = p.tithi ? `${esc(p.tithi.paksha)} ${esc(p.tithi.name)}, nakṣatra ${esc(p.nakshatra)} at ${p.drikLimbs ? "the dṛk choice's own sunrise" : "sunrise"} <span class="muted">(${esc(tierTitle(p.moonTier))})</span>` : `<span class="muted">the Moon's tithi and nakṣatra: not given (${p.moonRefused ? "outside the dṛk choice's span" : "no sunrise"})</span>`;
    rows.push(`<p>Kali day ${p.N}: ${limbs}. Sunset at ${kapStr(p.setAsus)} (${hoursStr(p.setAsus)}) <span class="muted">(the text's Sun)</span>.</p>`);
    if (p.moonRefused) rows.push(refusalHtml(p.moonRefused));
    rows.push(`<p><b>Noon shadow</b> of a ${esc(plan.shanku)}-aṅgula śaṅku: ${angStr(p.noon.chaya * plan.shanku / 12)} toward the ${p.noon.dir === "N" ? "north" : "south"} (ayana ${p.noon.ayana}).</p>`);
    if (p.transits.length) {
      rows.push(`<table><thead><tr><th>star on the meridian tonight</th><th>bowl from sunrise</th><th></th><th>altitude</th></tr></thead><tbody>`
        + p.transits.map((t) => `<tr><td>${esc(t.name)}</td><td>${kapStr(t.sinceSunriseAsus)}</td><td class="muted">${hoursStr(t.sinceSunriseAsus)}</td><td>${arcStr(t.unnataDeg)} ${t.disha === "N" ? "north" : "south"}</td></tr>`).join("") + `</tbody></table>`);
    } else rows.push(`<p class="muted">No junction star crosses the meridian in the dark tonight.</p>`);
    if (p.crescent) rows.push(typeof p.crescent.kalamsa === "number"
      ? `<p><b>The crescent</b> this evening: ${p.crescent.kalamsa.toFixed(2)} kālāṃśa against the text's 12 — the text says <b>${p.crescent.seen ? "seen" : "not seen"}</b> <span class="muted">(${esc(tierTitle(p.moonTier))})</span>. If you look for it after sunset, record what you see.</p>`
      : `<p><b>The crescent</b>: the Moon is not yet past the Sun this evening (SS 10.1-10.4) — no evening crescent by the text <span class="muted">(${esc(tierTitle(p.moonTier))})</span>.</p>`);
    if (p.yoga.length) rows.push(`<p><b>The Moon on a junction star</b> <span class="muted">(${esc(tierTitle(p.moonTier))})</span>: ${p.yoga.map((y) => `${esc(y.name)} at ${kapStr(y.sinceSunriseAsus)} (${hoursStr(y.sinceSunriseAsus)})`).join("; ")}.</p>`);
    if (TIERS[p.moonTier].family === "drik") rows.push(`<p class="muted" id="drik-moon-note">The crescent and the Moon on a junction star are not computed in the ${esc(tierTitle(p.moonTier))} choice: the crescent's twelve kālāṃśa (SS 10.1) and the junction stars' places (SS chapter 8) are the text's own, and this repository has no dṛk counterpart for them. The eclipses below are the dṛk choice's.</p>`);
    $("pred").innerHTML = rows.join("");
  }
  /** Is the body up at t, by the choice's own rising and setting (panchanga.js sunrise and sunset; utsava.js moonrise and
   *  moonset: the Moon's centre, no parallax, no refraction)? null where the module gives no answer. */
  function upAt(E, kind, t, site) {
    const d = E.P.civilDayOf(t, site);
    if (d.polar) return null;
    if (kind === "solar") return d.sunrise <= t && t < d.sunset;
    const ev = [];
    for (const n of [d.N - 1, d.N, d.N + 1]) {
      let r = null, s = null;
      try { r = E.U.moonrise(n, site); } catch (e) { r = null; }
      try { s = E.U.moonset(n, site); } catch (e) { s = null; }
      if (r !== null) ev.push([r, true]);
      if (s !== null) ev.push([s, false]);
    }
    const before = ev.filter(([x]) => x <= t).sort((a, b) => b[0] - a[0]);
    return before.length ? before[0][1] : null;
  }
  /** The civil day whose sunrise (the text's, vedha-lekha.js) comes before t. */
  function dayBefore(t, ms) { let N = Math.floor(t); while (V.sunriseAt(N, ms) > t) N--; while (V.sunriseAt(N + 1, ms) <= t) N++; return N; }
  function showEclipses() {
    const ms = plan.model, N0 = kaliOfDate($("day").value);
    const head = `<table><thead><tr><th>kind</th><th>contact</th><th>civil day (sunrise before)</th><th>bowl from that sunrise</th><th></th><th>body up?</th></tr></thead><tbody>`;
    let E0;
    try { E0 = moonEngine(moonTier); } catch (e) { $("ecl").innerHTML = `<p class="bad">${esc(e.message)}</p>`; return; }
    if (E0.id === "ss") {
      let list = [];
      try { list = G.eclipsesBetween(N0, N0 + 400, ms); } catch (e) { $("ecl").innerHTML = `<p class="bad">${esc(e.message)}</p>`; return; }
      // a solar eclipse with the Sun below the horizon at every contact is not an eclipse "at this place" (council KH-07)
      list = list.filter((E) => E.kind === "lunar" || !E.horizon || Object.values(E.horizon).some((h) => h && h.above));
      if (!list.length) { $("ecl").innerHTML = `<p class="muted">The text gives no eclipse at this place in the next 400 days.</p>`; return; }
      $("ecl").innerHTML = head
        + list.flatMap((E) => contactsOf(E, ms).map((c) => `<tr data-tier="ss"><td>${E.kind === "lunar" ? "चन्द्र" : "सूर्य"} ${E.total ? "(total, by the text)" : `(grāsa ${E.magnitude.toFixed(2)} of the diameter, by the text)`}${E.perceptible && E.perceptible.seen === false ? ` <span class="muted">— below SS 6.13's limit of what is seen</span>` : ""}</td><td>${c.c}</td><td>${dateOfKali(c.N)}</td><td>${kapStr(c.p.sinceSunriseAsus)}</td><td class="muted">${hoursStr(c.p.sinceSunriseAsus)}</td><td>${c.p.above === true ? "yes" : c.p.above === false ? "no" : "—"}</td></tr>`)).join("") + `</tbody></table>`;
      return;
    }
    if (E0.family === "ss") {
      // the saṃskāra's model: ss-tier.js eclipsesNear (samskara.js's lunar and solar eclipse on the tier's places), a month at a time
      const seen = new Set(), list = [];
      try {
        for (let a = N0; a < N0 + 400; a += 32) {
          const half = Math.min(32, N0 + 400 - a) / 2;
          for (const E of ST.eclipsesNear(ST.jdOfDays(a + half), ms, half, E0.opts)) {
            const tm = ST.daysOfJd(E.middleJd), key = `${E.kind}|${Math.round(tm * 10)}`;
            if (tm < N0 || tm >= N0 + 400 || seen.has(key)) continue;
            seen.add(key); list.push(E);
          }
        }
      } catch (e) { $("ecl").innerHTML = `<p class="bad">${esc(e.message)}</p>`; return; }
      list.sort((a, b) => a.middleJd - b.middleJd);
      const rows = list.map((E) => ({ E, cs: V.CONTACTS.filter((c) => E.contactsJd[c] !== null && E.contactsJd[c] !== undefined).map((c) => { const t = ST.daysOfJd(E.contactsJd[c]), N = dayBefore(t, ms); return { c, t, N, asus: V.turnAsusBetween(V.sunriseAt(N, ms), t), up: upAt(E0, E.kind, t, ms) }; }) }))
        .filter((x) => x.E.kind === "lunar" || x.cs.some((c) => c.up === true));
      if (!rows.length) { $("ecl").innerHTML = `<p class="muted">This choice gives no eclipse at this place in the next 400 days.</p>`; return; }
      $("ecl").innerHTML = head + rows.flatMap(({ E, cs }) => cs.map((c) => `<tr data-tier="ss+parameshvara"><td>${E.kind === "lunar" ? "चन्द्र" : "सूर्य"} (grāsa ${E.magnitude.toFixed(2)} of the diameter, ${esc(tierTitle(E0.id))})</td><td>${c.c}</td><td>${dateOfKali(c.N)}</td><td>${kapStr(c.asus)}</td><td class="muted">${hoursStr(c.asus)}</td><td>${c.up === true ? "yes" : c.up === false ? "no" : "—"}</td></tr>`)).join("") + `</tbody></table>`
        + `<p class="muted">${esc(list[0] ? list[0].method : "")}; "body up?" by this choice's own rising and setting (utsava.js, panchanga.js); SS 6.13's limit of what is seen is not applied here.</p>`;
      return;
    }
    // dṛk: drik-grahana.js on the series (siddhanta-tier.js), a month at a time; refused outside 1850–2150
    const lon = ST.MERIDIAN_DEG + ms.deshantara, tz = lon / 15, j0 = N0 + ST.KALI_JD0 - tz / 24, out = [];
    let refused = null;
    for (let a = 0; a < 400; a += 30) {
      const r = SD.eclipses(j0 + a, j0 + Math.min(a + 30, 400), { latitude: ms.latitude, longitude: lon });
      if (r === null) { refused = new MC.TierSpanError("drik", j0 + a + 15, "the eclipse search"); break; }
      out.push(...r);
    }
    out.sort((a, b) => a.maxJdUT - b.maxJdUT);
    const rows = [], penumbral = [];
    for (const E of out) {
      const lunar = E.kind === "lunar", loc = E.local || {}, src = lunar ? E.contacts : loc.contacts || {};
      if (!lunar && !loc.eclipsed) continue;                          // the shadow misses this place
      // a penumbral-only lunar eclipse has no umbral contact and no grāsa: it is named below, never with a negative grāsa
      if (lunar && !(E.umbralMagnitude > 0)) {
        let day = "—";
        try { day = dateOfKali(MC.tierDay(E.maxJdUT, ms.latitude, lon, tz, "drik").N); } catch (e) { if (!isRefusal(e)) throw e; }
        penumbral.push(`${day} (penumbral magnitude ${Number(E.penumbralMagnitude).toFixed(2)}; the Moon ${loc.visible ? "above" : "below"} the horizon here)`);
        continue;
      }
      const alt = lunar ? loc.moonAltitudeDeg : loc.sunAltitudeDeg;
      for (const c of lunar ? ["U1", "U2", "U3", "U4"] : ["C1", "C2", "C3", "C4"]) {
        if (!src[c]) continue;
        let d;
        try { d = MC.tierDay(src[c].jdUT, ms.latitude, lon, tz, "drik"); } catch (e) { if (!isRefusal(e)) throw e; continue; }
        const since = d.polar ? null : (src[c].jdUT - d.sunriseJd) * V.ASUS_PER_DAY;
        rows.push(`<tr data-tier="drik"><td>${lunar ? `चन्द्र (${esc(E.type)}, umbral magnitude ${Number(E.umbralMagnitude).toFixed(2)})` : `सूर्य (${esc(E.type)} eclipse; here ${esc(loc.type)}, magnitude ${Number(loc.magnitude).toFixed(2)})`}</td><td>${esc(c)}</td><td>${dateOfKali(d.N)}</td><td>${since === null ? "—" : kapStr(since)}</td><td class="muted">${since === null ? "" : hoursStr(since)}</td><td>${alt && Number.isFinite(alt[c]) ? `${alt[c] > 0 ? "yes" : "no"} (${alt[c].toFixed(1)}°)` : "—"}</td></tr>`);
      }
    }
    $("ecl").innerHTML = (rows.length ? head + rows.join("") + `</tbody></table><p class="muted">Counted from the dṛk choice's own sunrise (${esc(TIERS.drik.sunrise)}), in asus of the civil day; the altitude is the series' at the contact. ${esc(out[0] ? out[0].convention || "" : "")}</p>`
      : `<p class="muted">This choice gives no ${penumbral.length ? "umbral or solar " : ""}eclipse at this place ${refused ? "before its span ends" : "in the next 400 days"}.</p>`)
      + (penumbral.length ? `<p class="muted" id="ecl-penumbral">Penumbral only — the Moon passes through the Earth's penumbra and misses the umbra, so there is no grāsa and no umbral contact to time: ${penumbral.map(esc).join("; ")}.</p>` : "")
      + (refused ? refusalHtml(refused) : "");
  }
  function contactsOf(E, ms) {
    const body = E.kind === "lunar" ? "candra" : "surya";
    return V.CONTACTS.filter((c) => E.contacts[c] !== null && E.contacts[c] !== undefined).map((c) => {
      const t = E.contacts[c]; let N = Math.floor(t); while (V.sunriseAt(N, ms) > t) N--; while (V.sunriseAt(N + 1, ms) <= t) N++;
      return { c, N, body, p: V.predictContact(N, body, c, ms) };
    });
  }
  async function sealPredictions() {
    if (!lastPred) throw new Error("Predict a day first.");
    const p = lastPred, at = todayKali();
    if (p.N < at) throw new Error("A prediction is written on or before its day; that day has passed.");
    const model = "the Sūrya-Siddhānta's model with Mādhava's sine (sphuta.js, ss-chaya.js, vedha-lekha.js predict*)";
    // the Moon's predictions name their choice; the saṃskāra's get their own ids, so both can stand in one ledger
    const moonModel = p.moonTier === "ss" ? model : `${TIERS[p.moonTier].label}: the text's rules on the Moon and the node moved by the paramparā's saṃskāra (ss-tier.js, corpus/parampara/samskara.json)`;
    const moonId = (id) => (p.moonTier === "ss" ? id : `${id}-parameshvara`);
    const day = { kali: p.N }, recs = [];
    recs.push({ id: `ganita-madhyahna-${p.N}`, kind: "ganita", day, for: "madhyahna", model, values: { chaya: angulaOfNum(p.noon.chaya * plan.shanku / 12), dir: p.noon.dir, shanku: plan.shanku } });
    p.transits.forEach((t, i) => recs.push({ id: `ganita-yamyottara-${p.N}-${i + 1}`, kind: "ganita", day, for: "yamyottara", model, values: { star: t.name, kapala: V.kapalaOfAsus(t.sinceSunriseAsus, true), unnata: V.arcOfDegrees(t.unnataDeg, true), disha: t.disha } }));
    if (p.crescent) recs.push({ id: moonId(`ganita-candra-darshana-${p.N}`), kind: "ganita", day, for: "candra-darshana", model: moonModel, values: typeof p.crescent.kalamsa === "number" ? { seen: p.crescent.seen, kalamsa: Math.round(p.crescent.kalamsa * 100) / 100 } : { seen: false } });
    p.yoga.forEach((y, i) => recs.push({ id: moonId(`ganita-candra-yoga-${p.N}-${i + 1}`), kind: "ganita", day, for: "candra-yoga", model: moonModel, values: { star: y.name, kapala: V.kapalaOfAsus(y.sinceSunriseAsus, true) } }));
    let n = 0, next = ledger;
    for (const r of recs) { if (next.entries.some((e) => e.record.id === r.id)) continue; next = V.append(next, r, { at }); n++; }
    await Keep.added(next, ledger.entries.length);
    ledger = next; showLedger();
    return n;
  }

  // ── recording ───────────────────────────────────────────────────────────────────────────────────────
  const KAP = `<label>bowl from sunrise: ghaṭī <input data-f="kg" type="number" min="0" step="1"></label><label>vināḍī <input data-f="kv" type="number" min="0" max="59" step="1"></label><label>prāṇa <input data-f="kp" type="number" min="0" max="5.99" step="0.1"></label>`;
  const STAR = () => `<label>star <select data-f="star">${stars.slice(0, 28).map((s) => `<option>${esc(s.name)}</option>`).join("")}<option>Dhruva</option></select></label>`;
  const FIELDS = {
    madhyahna: () => `<label>shadow aṅgula <input data-f="ca" type="number" min="0" step="1"></label><label>vyaṅgula <input data-f="cv" type="number" min="0" max="59" step="1"></label><label>points <select data-f="dir"><option value="N">north</option><option value="S">south</option></select></label><label>ayana <select data-f="ayana"><option value="">by the text</option><option value="uttara">uttara</option><option value="dakshina">dakṣiṇa</option></select></label>`,
    kapala: () => `${STAR()}<label>sinkings between its two transits: ghaṭī <input data-f="kg" type="number" min="0" step="1"></label><label>vināḍī <input data-f="kv" type="number" min="0" max="59" step="1"></label><label>prāṇa <input data-f="kp" type="number" min="0" max="5.99" step="0.1"></label>`,
    yamyottara: () => `${STAR()}<label>transit <select data-f="transit"><option value="upper">upper</option><option value="lower">lower</option></select></label>${KAP}<label>altitude ° <input data-f="ua" type="number" min="0" max="90" step="1"></label><label>′ <input data-f="uk" type="number" min="0" max="59" step="1"></label><label>from <select data-f="disha"><option value="">—</option><option value="S">south</option><option value="N">north</option></select></label>`,
    grahana: () => `<label>body <select data-f="body"><option value="candra">Moon</option><option value="surya">Sun</option></select></label><label>contact <select data-f="contact">${V.CONTACTS.map((c) => `<option>${c}</option>`).join("")}</select></label>${KAP}`,
    "candra-darshana": () => `<label>horizon <select data-f="horizon"><option value="pashcima">west, after sunset</option><option value="purva">east, before sunrise</option></select></label><label>seen? <select data-f="seen"><option value="true">seen</option><option value="false">not seen</option></select></label>`,
    "candra-yoga": () => `${STAR()}${KAP}`,
  };

  // ── an instrument's reading (yantra.js): only the fields of that instrument's own graduation ─────────
  const YANTRA_KEY = "bharat.vedha-yantra/1";
  const SUN_ONLY = new Set(["nadivalaya", "shashthamsha", "rashivalaya"]);
  const MEASURED = new Set(["nata", "kranti", "unnata", "digamsha", "natamsha", "sphuta"]);
  const RASHI = ["Meṣa", "Vṛṣabha", "Mithuna", "Karka", "Siṃha", "Kanyā", "Tulā", "Vṛścika", "Dhanu", "Makara", "Kumbha", "Mīna"];
  const yName = (key) => { const e = Y.CATALOGUE.find((x) => x.key === key); return e ? `${e.deva} · ${e.iast}` : key; };
  const choice = (n, label, opts, blank) => `<label>${esc(label)} <select data-f="${esc(n)}">${blank ? '<option value="">—</option>' : ""}${opts.map(([v, t]) => `<option value="${esc(v)}">${esc(t)}</option>`).join("")}</select></label>`;
  const arcInputs = (n, label, max) => `<label>${esc(label)} ° <input data-f="${n}-a" type="number" min="0" max="${max}" step="1"></label><label>′ <input data-f="${n}-k" type="number" min="0" max="59" step="1"></label><label>″ <input data-f="${n}-v" type="number" min="0" max="59.9" step="0.1"></label>`;
  const READING_FIELD = {
    nata: () => `<label>nata from the meridian: ghaṭī <input data-f="nata-g" type="number" min="0" max="30" step="1"></label><label>vināḍī <input data-f="nata-v" type="number" min="0" max="59" step="1"></label><label>prāṇa <input data-f="nata-p" type="number" min="0" max="5.9" step="0.1"></label>`,
    side: (blank) => choice("side", "side", [["purva", "pūrva — east of the meridian"], ["pashcima", "paścima — west of it"]], blank),
    kranti: () => arcInputs("kranti", "krānti", 90),
    gola: (blank) => choice("gola", "gola", [["uttara", "uttara — north"], ["dakshina", "dakṣiṇa — south"]], blank),
    unnata: () => arcInputs("unnata", "unnata (altitude)", 90),
    digamsha: () => arcInputs("digamsha", "digaṃśa (from north through east)", 359),
    natamsha: () => arcInputs("natamsha", "natāṃśa (zenith distance)", 90),
    disha: (blank) => choice("disha", "read from the", [["S", "south horizon"], ["N", "north horizon"]], blank),
    rashi: () => choice("rashi", "the instrument of the sign", RASHI.map((n, i) => [String(i), n]), false),
    sphuta: () => arcInputs("sphuta", "the Sun's longitude read", 359),
  };
  /** The body and the reading fields of instrument `key`: its READING schema's groups; a choice that stands alone in an
   *  optional group may be left blank. */
  function yantraReadingHTML(key) {
    const spec = Y.READING[key], req = new Set(spec.required || []);
    const parts = spec.groups.map((grp, i) => grp.map((x) => READING_FIELD[x](!grp.some((y) => MEASURED.has(y)) && !req.has(i))).join("")).join("");
    const bodies = [["surya", "सूर्य · the Sun"], ...(SUN_ONLY.has(key) ? [] : stars.slice(0, 28).map((s) => [s.name, s.name]))];
    return choice("body", "body", bodies, false) + parts;
  }
  FIELDS.yantra = () => `${choice("yantra", "instrument", Y.LEDGER_YANTRAS.map((k) => [k, yName(k)]), false)}<div id="yantra-fields" class="row">${yantraReadingHTML(Y.LEDGER_YANTRAS[0])}</div>${KAP}<span class="muted">The bowl count is optional: without it the reading's own nata, altitude or the meridian fixes the instant.</span>`;

  // ── the frame kinds (vedha-lekha.js, dhruva.js): read to the whole vikalā; reduced as a PREVIEW, never applied ──────
  const Dh = window.Dhruva;
  const TEXT_EPS_VK = Dh.SS_EPSILON_DEG * 3600;                                   // SS 2.28: arc of 1397/3438, in vikalā
  /** vikalā → d° m′ s″ (s to `dp` decimals; the frame's results are exact in half vikalā). Rounded before it is split,
   *  so that a value just short of a whole kalā (a latitude from the palabhā) reads 0″ of the next, never 60″. */
  const vkStr = (v, dp) => {
    const q = dp ? 10 ** dp : 2, a = Math.round(Math.abs(v) * q) / q;
    const d = Math.floor(a / 3600), m = Math.floor((a - d * 3600) / 60), s = a - d * 3600 - m * 60;
    return `${d}° ${m}′ ${dp ? s.toFixed(dp) : String(s)}″`;
  };
  const signedVk = (v, dp) => `${v < 0 ? "−" : "+"}${vkStr(v, dp)}`;
  const latVk = (v, dp) => `${vkStr(v, dp)} ${v >= 0 ? "north" : "south"}`;
  const sigStr = (v) => `± ${v.toFixed(1)}″`;
  const northStr = (t) => (t.side === "on the line" ? "on your line" : `${vkStr(t.vikala)} ${t.side === "purva" ? "east (pūrva)" : "west (paścima)"} of your line`);
  const wholeArc = (n, label, max) => `<label>${esc(label)} ° <input data-f="${n}-a" type="number" min="0" max="${max}" step="1"></label><label>′ <input data-f="${n}-k" type="number" min="0" max="59" step="1"></label><label>″ <input data-f="${n}-v" type="number" min="0" max="59" step="1"></label>`;
  const SIGMA_IN = () => `<fieldset class="row"><legend>the uncertainty (1σ) of one reading</legend>${wholeArc("s", "σ", 10)}</fieldset>`;
  FIELDS["uttara-rekha"] = () => `<label>star (one close to the Dhruva) <input data-f="star" value="Dhruva" maxlength="40"></label>`
    + `<fieldset class="row"><legend>at its greatest elongation east (pūrva)</legend><label>civil day (of the sunrise before) <input data-f="e-day" class="date" type="text" inputmode="text" autocomplete="off" placeholder="YYYY-MM-DD"></label>${wholeArc("e", "arc from your line", 90)}${choice("e-side", "it lay", [["purva", "east of your line"], ["pashcima", "west of your line"]], false)}</fieldset>`
    + `<fieldset class="row"><legend>at its greatest elongation west (paścima)</legend><label>civil day (of the sunrise before) <input data-f="w-day" class="date" type="text" inputmode="text" autocomplete="off" placeholder="YYYY-MM-DD"></label>${wholeArc("w", "arc from your line", 90)}${choice("w-side", "it lay", [["pashcima", "west of your line"], ["purva", "east of your line"]], false)}</fieldset>`
    + SIGMA_IN()
    + `<p class="muted">True north is the midpoint of the two (dhruva.js). It is shown as a preview beside your line: nothing is applied.</p>`;
  FIELDS["ayananta-yugma"] = () => `<fieldset class="row"><legend>the karka noon (the Sun at its furthest north)</legend><label>civil day <input data-f="k-day" class="date" type="text" inputmode="text" autocomplete="off" placeholder="YYYY-MM-DD"></label>${wholeArc("k", "natāṃśa (zenith distance)", 89)}${choice("k-disha", "the Sun stood", [["S", "south of the zenith"], ["N", "north of the zenith"]], false)}</fieldset>`
    + `<fieldset class="row"><legend>the makara noon (the Sun at its furthest south)</legend><label>civil day <input data-f="m-day" class="date" type="text" inputmode="text" autocomplete="off" placeholder="YYYY-MM-DD"></label>${wholeArc("m", "natāṃśa (zenith distance)", 89)}${choice("m-disha", "the Sun stood", [["S", "south of the zenith"], ["N", "north of the zenith"]], false)}</fieldset>`
    + SIGMA_IN()
    + `<p class="muted" id="text-epsilon">The text's ε, in use: arc of 1397/3438 = ${vkStr(TEXT_EPS_VK, 2)} (SS 2.28). Your two noons are shown beside it as a preview, and the latitude they give beside this ledger's place: nothing measured is applied.</p>`;
  /** The two days of a frame record (its readings'), or the record's own day. */
  function dayCell(rec) {
    const two = Object.prototype.hasOwnProperty.call(V.FRAME_READINGS, rec.kind) ? V.FRAME_READINGS[rec.kind] : null;
    const one = (d) => (d && d.kali !== undefined ? dateOfKali(d.kali) : "");
    return two ? Object.keys(two).map((k) => one(rec[k] && rec[k].day)).join(" · ") : one(rec.day);
  }
  /** The reading as the form holds it: a group goes in when its measured field is filled (or, a choice alone, chosen). */
  function yantraReadingFromForm(key) {
    const rd = {}, entered = (x) => (x === "nata" ? ["nata-g", "nata-v", "nata-p"] : [x + "-a", x + "-k", x + "-v"]).some((n) => f(n) !== "");
    for (const grp of Y.READING[key].groups) {
      const measured = grp.filter((x) => MEASURED.has(x));
      if (measured.length ? !measured.some(entered) : !grp.every((x) => f(x) !== "")) continue;
      for (const x of grp) {
        if (x === "nata") rd.nata = { ghati: num("nata-g"), vinadi: num("nata-v"), prana: num("nata-p") };
        else if (MEASURED.has(x)) rd[x] = { amsha: num(x + "-a"), kala: num(x + "-k"), vikala: num(x + "-v") };
        else if (x === "rashi") rd.rashi = Number(f("rashi"));
        else rd[x] = f(x);
      }
    }
    return rd;
  }
  let myYantras = (() => { try { const a = JSON.parse(store.get(YANTRA_KEY) || "[]"); return Array.isArray(a) ? a.filter((k) => Y.LEDGER_YANTRAS.includes(k)) : []; } catch (e) { return []; } })();
  function showYantraPick() {
    $("yantra-pick").innerHTML = Y.LEDGER_YANTRAS.map((k) => `<label><input type="checkbox" data-yantra="${esc(k)}"${myYantras.includes(k) ? " checked" : ""}> ${esc(yName(k))}</label>`).join("");
  }
  /** A predicted reading rounded as the owner reads it: the prāṇa to a tenth, the arc to the vikalā. */
  function roundedReading(key, q, extra) {
    const rd = Y.readingOfQuantities(key, q, extra), arc = (deg) => Y.arcOfDegrees(deg, true);
    const turn = (a) => (a.amsha >= 360 ? { amsha: a.amsha - 360, kala: a.kala, vikala: a.vikala } : a);
    if (rd.nata) { const k = Y.kapalaOfAsus(Math.round(Math.abs(q.natAsus) * 10) / 10); rd.nata = { ghati: k.ghati, vinadi: k.vinadi, prana: Math.round(k.prana * 10) / 10 }; }
    if (rd.kranti) rd.kranti = arc(q.krantiDeg);
    if (rd.unnata) rd.unnata = arc(q.unnataDeg);
    if (rd.digamsha) rd.digamsha = turn(arc(mod(q.digamshaDeg, 360)));
    if (rd.natamsha) rd.natamsha = arc(q.natamshaDeg);
    if (rd.sphuta) rd.sphuta = turn(arc(mod(q.sphutaDeg, 360)));
    return rd;
  }
  const arcTxt = (a) => `${a.amsha}° ${a.kala}′ ${a.vikala}″`;
  function readingTxt(rd) {
    const out = [];
    if (rd.nata) out.push(`nata ${rd.nata.ghati} घ ${rd.nata.vinadi} वि ${rd.nata.prana} प्रा ${rd.side === "purva" ? "pūrva (east)" : "paścima (west)"}`);
    if (rd.kranti) out.push(`krānti ${arcTxt(rd.kranti)} ${rd.gola === "uttara" ? "uttara" : "dakṣiṇa"}`);
    else if (rd.gola) out.push(`the ${rd.gola === "uttara" ? "uttara (north)" : "dakṣiṇa (south)"} face lit`);
    if (rd.unnata) out.push(`unnata ${arcTxt(rd.unnata)}${rd.disha ? ` from the ${rd.disha === "S" ? "south" : "north"}` : rd.side && !rd.nata ? ` ${rd.side === "purva" ? "pūrva" : "paścima"}` : ""}`);
    if (rd.digamsha) out.push(`digaṃśa ${arcTxt(rd.digamsha)}`);
    if (rd.natamsha) out.push(`natāṃśa ${arcTxt(rd.natamsha)}, the Sun ${rd.disha === "S" ? "south" : "north"} of the zenith`);
    if (rd.sphuta) out.push(`on ${RASHI[rd.rashi]}'s instrument, the Sun at ${arcTxt(rd.sphuta)}`);
    return out.join(" · ");
  }
  /** Each of the owner's instruments on day N: the reading the text predicts, and when. */
  function yantraPredictions(N) {
    const ms = plan.model, rise = V.sunriseAt(N, ms);
    const kg = Math.max(0, Number($("yantra-kg").value) || 0), kv = Math.max(0, Number($("yantra-kv").value) || 0);
    const tAt = V.afterTurnAsus(rise, kg * 360 + kv * 6);
    return myYantras.map((key) => {
      const inst = Y.instrument(key, { site: ms, ...Y.DEMO[key] });
      let t, q, extra = {}, when, kapala = null;
      if (key === "dakshinottara-bhitti" || key === "shashthamsha") { t = Y.instantOfNata(N, 0, ms); q = inst.quantitiesAt(t); when = "the text's noon"; }
      else if (key === "rashivalaya") {
        const up = inst.signs.map((s) => inst.predictMoment(N, s.rashi)).filter((p) => p.above).sort((a, b) => a.t - b.t);
        if (!up.length) return { key, none: "no sign's first point culminates with the Sun up" };
        const pm = up.find((p) => p.t >= tAt) || up[0];
        t = pm.t; q = pm.quantities; extra = { rashi: pm.rashi }; when = `${RASHI[pm.rashi]}'s first point on the meridian`;
      } else { t = tAt; q = inst.predict(t).quantities; when = "the bowl count above"; kapala = { ghati: kg, vinadi: kv, prana: 0 }; }
      if (!q.above) return { key, none: `the Sun is below the horizon at ${when}` };
      return { key, when, bowl: V.turnAsusBetween(rise, t), kapala, reading: roundedReading(key, q, extra) };
    });
  }
  function showYantraPrediction(N) {
    if (!myYantras.length) { $("pred-yantra").innerHTML = `<p class="muted">No instrument ticked.</p>`; return; }
    const rows = yantraPredictions(N).map((p) => (p.none
      ? `<tr data-yantra="${esc(p.key)}"><td>${esc(yName(p.key))}</td><td colspan="2" class="muted">${esc(p.none)}</td></tr>`
      : `<tr data-yantra="${esc(p.key)}" data-reading="${esc(JSON.stringify(p.reading))}"${p.kapala ? ` data-kapala="${esc(JSON.stringify(p.kapala))}"` : ""}><td>${esc(yName(p.key))}</td><td>${esc(p.when)}: ${esc(kapStr(p.bowl))} <span class="muted">${esc(hoursStr(p.bowl))}</span></td><td>${esc(readingTxt(p.reading))}</td></tr>`));
    $("pred-yantra").innerHTML = `<table><thead><tr><th>instrument</th><th>when (bowl from sunrise)</th><th>the text's reading</th></tr></thead><tbody>${rows.join("")}</tbody></table>`;
  }

  function showFields() {
    const k = $("rec-kind").value;
    $("rec-fields").innerHTML = FIELDS[k]();
    $("rec-day-label").hidden = V.FRAME_KINDS.includes(k);                        // a frame record carries its readings' own days
    if (k === "yantra") { const sel = $("rec-fields").querySelector('[data-f="yantra"]'); sel.addEventListener("change", () => { $("yantra-fields").innerHTML = yantraReadingHTML(sel.value); }); }
    const sel = $("rec-ganita");
    sel.innerHTML = `<option value="">—</option>` + (ledger ? ledger.entries.filter((e) => e.record.kind === "ganita" && e.record.for === k).map((e) => `<option value="${esc(e.record.id)}">${esc(e.record.id)}</option>`).join("") : "");
  }
  const f = (name) => { const el = $("rec-fields").querySelector(`[data-f="${name}"]`); return el ? el.value : ""; };
  const num = (name) => (f(name) === "" ? 0 : Number(f(name)));
  function recordFromForm() {
    const kind = $("rec-kind").value, N = V.FRAME_KINDS.includes(kind) ? null : kaliOfDate($("rec-day").value, "The record's civil day");   // a frame record has its readings' days
    let r = { id: `${kind}-${N}-${(ledger ? ledger.entries.length : 0) + 1}`, kind, day: { kali: N } };
    const kap = () => ({ ghati: num("kg"), vinadi: num("kv"), prana: num("kp") });
    if (kind === "madhyahna") { r.chaya = { angula: num("ca"), vyangula: num("cv") }; r.dir = f("dir"); r.ayana = f("ayana") || ayanaOf(C.textSun(N + 0.5).sayana); }
    if (kind === "kapala") { r.star = f("star"); r.count = kap(); delete r.day; }
    if (kind === "yamyottara") {
      r.star = f("star"); r.transit = f("transit");
      if (f("kg") !== "" || f("kv") !== "") r.kapala = kap();
      if (f("ua") !== "") { r.unnata = { amsha: num("ua"), kala: num("uk") }; r.disha = r.transit === "lower" ? "N" : f("disha") || "S"; }
    }
    if (kind === "grahana") { r.body = f("body"); r.contact = f("contact"); r.kapala = kap(); }
    if (kind === "candra-darshana") { r.horizon = f("horizon"); r.seen = f("seen") === "true"; }
    if (kind === "candra-yoga") { r.star = f("star"); r.kapala = kap(); }
    if (kind === "yantra") {                                      // yantra.js checks the reading against its instrument first
      const key = f("yantra"), m = { id: r.id, day: r.day, body: f("body"), reading: yantraReadingFromForm(key) };
      if (f("kg") !== "" || f("kv") !== "" || f("kp") !== "") m.kapala = kap();
      r = Y.record(key, m);
    }
    if (V.FRAME_KINDS.includes(kind)) {                         // vedha-lekha.js checks every reading before dhruva.js sees it
      const filled = (p) => [p + "-a", p + "-k", p + "-v"].some((n) => f(n) !== "");
      const arcF = (p, what) => { if (what && !filled(p)) throw new Error(`Give ${what} (a reading of 0 is typed as 0).`); return { amsha: num(p + "-a"), kala: num(p + "-k"), vikala: num(p + "-v") }; };
      const dayF = (n, what) => { if (!f(n)) throw new Error(`Give the civil day of ${what}.`); return { kali: kaliOfDate(f(n), `The civil day of ${what}`) }; };
      delete r.day;
      if (kind === "uttara-rekha") {
        r.star = f("star").trim();
        r.purva = { day: dayF("e-day", "the eastern elongation"), digamsha: arcF("e", "the arc from your line at the eastern elongation"), side: f("e-side") };
        r.pashcima = { day: dayF("w-day", "the western elongation"), digamsha: arcF("w", "the arc from your line at the western elongation"), side: f("w-side") };
      } else {
        r.karka = { day: dayF("k-day", "the karka noon"), natamsha: arcF("k", "the Sun's zenith distance at the karka noon"), disha: f("k-disha") };
        r.makara = { day: dayF("m-day", "the makara noon"), natamsha: arcF("m", "the Sun's zenith distance at the makara noon"), disha: f("m-disha") };
      }
      if (filled("s")) r.sigma = arcF("s");
      const [a, b] = Object.keys(V.FRAME_READINGS[kind]).map((k) => r[k].day.kali);
      r.id = `${kind}-${Math.max(a, b)}-${(ledger ? ledger.entries.length : 0) + 1}`;
    }
    const g = $("rec-ganita").value; if (g) r.ganita = g;
    const note = $("rec-note").value.trim(); if (note) r.note = note;
    return r;
  }

  // ── the ledger, shown ───────────────────────────────────────────────────────────────────────────────
  function showLedger() {
    if (!ledger) { $("chain").textContent = "No ledger yet."; $("entries").innerHTML = ""; return; }
    const v = V.verify(ledger);
    $("chain").innerHTML = `${ledger.entries.length} entries · chain <span class="${v.ok ? "ok" : "bad"}">${v.ok ? "whole" : "BROKEN: " + esc(v.problems.map((p) => p.where + " " + p.reason).join("; "))}</span>${ledger.seal ? " · <b>sealed</b>" : ""} · head <code>${esc(String(v.head).slice(0, 16))}…</code>`;
    $("entries").innerHTML = `<table><thead><tr><th>#</th><th>written (Kali day)</th><th>kind</th><th>id</th><th>day</th></tr></thead><tbody>`
      + ledger.entries.slice().reverse().map((e) => `<tr><td>${esc(e.seq)}</td><td>${esc(e.at)}</td><td>${esc(e.record.kind)}${e.record.kind === "ganita" ? " → " + esc(e.record.for) : ""}</td><td>${esc(e.record.id)}</td><td>${esc(dayCell(e.record))}</td></tr>`).join("") + `</tbody></table>`;
    showFields();
  }
  function showAntara() {
    const red = V.reduce(ledger, { stars });
    const rows = red.records.map((r) => {
      const a = r.antara;
      if (r.kind === "yantra") {                                  // an instrument: each quantity it read, observed − the text
        const sg = (x, d) => `${x >= 0 ? "+" : ""}${x.toFixed(d)}`, parts = [];
        if (a) {
          if (a.natAsus !== undefined) parts.push(`nata ${sg(a.natAsus, 1)} asus`);
          for (const [k, name] of [["krantiArcmin", "krānti"], ["unnataArcmin", "unnata"], ["digamshaArcmin", "digaṃśa"], ["natamshaArcmin", "natāṃśa"], ["sphutaArcmin", "the Sun's longitude"]]) if (a[k] !== undefined) parts.push(`${name} ${sg(a[k], 2)}′`);
          if (a.golaAgree !== undefined) parts.push(a.golaAgree ? "the face agrees" : "the face differs");
          if (a.dishaAgree !== undefined) parts.push(a.dishaAgree ? "the side agrees" : "the side differs");
        }
        return `<tr><td>${esc(r.id)}</td><td>yantra · ${esc(yName(r.yantra))}</td><td>${esc(parts.join(" · ") || "—")}${r.instant ? ` <span class="muted">(at ${esc(r.instant.from)})</span>` : ""}</td></tr>`;
      }
      if (V.FRAME_KINDS.includes(r.kind)) {                       // the frame: a preview, set out in full below the table
        const what = r.refused ? `not reduced: ${r.refused}`
          : r.kind === "uttara-rekha" ? `true north lies ${northStr(r.trueNorth)} ${sigStr(r.trueNorth.sigmaVikala)} — preview, not applied`
          : `ε ${vkStr(r.epsilon.vikala)} ${sigStr(r.epsilon.sigmaVikala)} · latitude ${latVk(r.latitude.vikala)} ${sigStr(r.latitude.sigmaVikala)} — preview, not applied`;
        return `<tr><td>${esc(r.id)}</td><td>${esc(r.kind)}</td><td>${esc(what)}</td></tr>`;
      }
      let what = "";
      if (a && a.vinadi !== undefined) what = `${a.vinadi >= 0 ? "+" : ""}${a.vinadi.toFixed(2)} vināḍī (the sky ${a.vinadi >= 0 ? "late" : "early"})`;
      if (a && a.unnataArcmin !== undefined) what += ` · altitude ${a.unnataArcmin >= 0 ? "+" : ""}${a.unnataArcmin.toFixed(1)}′`;
      if (a && a.moonArcmin !== undefined) what += ` · the Moon ${a.moonArcmin.toFixed(2)}′`;
      if (a && a.agree !== undefined) what = a.agree ? "agrees with the text" : "differs from the text";
      return `<tr><td>${esc(r.id)}</td><td>${esc(r.kind)}</td><td>${what || "—"}</td></tr>`;
    });
    const ch = red.chaya && red.chaya.records ? red.chaya.records.filter((x) => x.kind === "madhyahna").map((x) => `<tr><td>${esc(x.id)}</td><td>madhyāhna</td><td>${typeof x.sunResidualArcmin === "number" ? `the shadow-Sun ${x.sunResidualArcmin >= 0 ? "+" : ""}${x.sunResidualArcmin.toFixed(1)}′, declination ${x.krantiResidualArcmin >= 0 ? "+" : ""}${x.krantiResidualArcmin.toFixed(1)}′` : "reduced"}</td></tr>`) : [];
    $("antara").innerHTML = `<h3>Antara [measured]</h3><p class="muted" id="antara-note">Observed − the plain Sūrya-Siddhānta (vedha-lekha.js's reduction), whichever choice made the predictions above.</p><table><thead><tr><th>record</th><th>kind</th><th>observed − the text</th></tr></thead><tbody>${rows.concat(ch).join("") || "<tr><td colspan=3 class=muted>no observations yet</td></tr>"}</tbody></table>`
      + framePreview(red)
      + (red.warnings.length ? `<p class="muted">${red.warnings.map(esc).join("<br>")}</p>` : "");
  }
  /** The frame records beside the text's own values (ε = arc of 1397/3438, SS 2.28) and the ledger's place: a PREVIEW.
   *  Nothing here is applied: the engine keeps the text's ε and the ledger keeps its place. */
  function framePreview(red) {
    const frame = red.records.filter((r) => V.FRAME_KINDS.includes(r.kind) && !r.refused);
    if (!frame.length) return "";
    const HEAD = ["quantity", "from your readings [measured]", "the value in use", "yours − the value in use"];
    // each cell is already escaped; data-label names the column when a phone stacks the row
    const row = (...cells) => `<tr>${cells.map((c, i) => `<td${i ? ` data-label="${HEAD[i]}"` : ""}>${c}</td>`).join("")}</tr>`;
    const tr = [];
    for (const r of frame) {
      if (r.kind === "uttara-rekha") {
        tr.push(row(`true north <span class="muted">(${esc(r.id)}, ${esc(r.star)})</span>`, `${esc(northStr(r.trueNorth))} ${sigStr(r.trueNorth.sigmaVikala)}`,
          `<span class="muted">— the text gives no value for a line you drew</span>`, "—"));
        continue;
      }
      tr.push(row(`ε, the greatest declination <span class="muted">(${esc(r.id)})</span>`, `${vkStr(r.epsilon.vikala)} ${sigStr(r.epsilon.sigmaVikala)}`,
        `arc of 1397/3438 = ${vkStr(TEXT_EPS_VK, 2)} <span class="muted">(SS 2.28: the default, in use)</span>`, signedVk(r.epsilon.vikala - TEXT_EPS_VK, 2)));
      const site = r.site ? r.site.latitudeDeg * 3600 : null;
      tr.push(row(`latitude <span class="muted">(${esc(r.id)})</span>`, `${latVk(r.latitude.vikala)} ${sigStr(r.latitude.sigmaVikala)}`,
        site === null ? "—" : `${latVk(site, 2)} <span class="muted">(the ledger's place, as you gave it)</span>`, site === null ? "—" : signedVk(r.latitude.vikala - site, 2)));
    }
    return `<div id="frame-preview"><h3>Preview — measured, not applied</h3><table><thead><tr>${HEAD.map((h) => `<th>${h}</th>`).join("")}</tr></thead><tbody>${tr.join("")}</tbody></table>`
      + `<p class="muted" id="frame-note">Preview only. The engine keeps the text's ε (SS 2.28) and this ledger keeps the place it was started with: nothing measured is applied or replaces a constant. Using a measured value is your own explicit choice, made elsewhere (the sphere and pañcāṅga functions take an ε you pass to them). `
      + `The reduction is geometric (dhruva.js), exact in half vikalā, with σ carried from one reading's σ. Refraction does not cancel in these readings and nothing here removes it: it lifts the Sun more at the larger noon zenith distance, so ε and the size of the latitude come out a little small; and it acts along the vertical, so it leaves an azimuth unchanged only where the air is level.</p></div>`;
  }

  // ── wiring ──────────────────────────────────────────────────────────────────────────────────────────
  const guard = (fn) => () => { Promise.resolve().then(fn).catch((e) => say(e && e.message ? e.message : String(e), true)); };
  $("btn-plan").onclick = guard(() => { const s = siteFromForm(); setPlan(s.site, s.shanku); store.set(SITE_KEY, JSON.stringify(s)); say("Planning with this place."); refresh(); });
  $("btn-start").onclick = guard(async () => {
    if (ledger) throw new Error("A ledger is already kept here; export it and start a new one.");
    const s = siteFromForm(), L = V.create({ site: s.site, shanku: s.shanku });
    await Keep.start(L); ledger = L; setPlan(s.site, s.shanku); showLedger();
    say("The season's ledger is started. Its place is chained into it.");
  });
  $("btn-predict").onclick = guard(() => refresh());
  $("btn-seal").onclick = guard(async () => { const n = await sealPredictions(); say(`${n} prediction${n === 1 ? "" : "s"} written into the ledger before the night.`); });
  $("rec-kind").onchange = showFields;
  $("btn-record").onclick = guard(async () => { const r = recordFromForm(); await append(r); say(`Written: ${r.id}. Export the ledger tonight.`); $("rec-note").value = ""; });
  $("btn-reduce").onclick = guard(() => { if (!ledger) throw new Error("No ledger yet."); showAntara(); });
  $("btn-export").onclick = guard(async () => {
    if (!ledger) throw new Error("No ledger yet.");
    const text = V.toJSON(ledger), name = `vedha-lekha-kali-${ledger.entries.length ? ledger.entries[ledger.entries.length - 1].at : todayKali()}.json`;
    let dl = null;
    try { if (window.claude && typeof window.claude.use === "function") dl = await window.claude.use("downloads"); } catch (e) { dl = null; }
    if (dl) {
      try { await dl.save({ filename: name, data: text }); say("Ledger saved. Keep the file with your instruments."); return; }
      catch (e) { if (e && e.code === "declined") { say("Not saved."); return; } }
    } else if (!window.claude) {
      const blob = new Blob([text], { type: "application/json" }), a = document.createElement("a");
      a.href = URL.createObjectURL(blob); a.download = name;
      document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 0);
      say("Ledger exported."); return;
    }
    $("export-text").value = text; $("export-box").hidden = false; say("Copy the ledger below and keep it as a file.");
  });
  $("btn-copy").onclick = guard(async () => {
    const t = $("export-text");
    try { await navigator.clipboard.writeText(t.value); say("Copied."); } catch (e) { t.focus(); t.select(); say("Selected: copy it with your keyboard."); }
  });
  $("file-import").onchange = (ev) => {
    const file = ev.target.files && ev.target.files[0]; if (!file) return;
    file.text().then(async (t) => {
      // the certifier, not the chain alone: the chain's hash is unkeyed, so only a field-by-field check keeps markup out
      const c = V.certify(t);
      if (!c.ok) throw new Error("This ledger is refused: " + c.reasons.slice(0, 3).map((r) => r.where + " " + r.reason).join("; "));
      const L = V.fromJSON(t);
      if (ledger && !(await ask("Keep this file as the current ledger? The one kept now stays in the store as an earlier season; export it first if this browser keeps it."))) return;
      await Keep.start(L); ledger = L; setPlan(L.site, L.shanku); fillSiteForm(L.site, L.shanku); showLedger(); say("Ledger imported; its chain is whole.");
    }).catch((e) => say(e.message, true));
  };
  $("btn-seal-season").onclick = guard(async () => {
    if (!ledger) throw new Error("No ledger yet.");
    if (!(await ask("Seal the season? A sealed ledger takes no more entries."))) return;
    const L = V.seal(ledger, { at: todayKali() }); await Keep.sealed(L); ledger = L; showLedger();
    say("Sealed. Keep its hash somewhere else as well: " + ledger.seal.hash);
  });
  $("btn-new").onclick = guard(async () => {
    if (ledger && !(await ask("Start a new ledger? Export this one first."))) return;
    await Keep.forget(); ledger = null; const s = siteFromForm(); setPlan(s.site, s.shanku); showLedger(); say("No ledger kept now.");
  });

  /** A day the page cannot read or predict: the last day's predictions are cleared (and cannot be written into the
   *  ledger), the labels still name the choice, and the reason is said in the block and at the top. */
  const DAY_HELP = $("day-help").textContent;
  function notPredicted(why) {
    lastPred = null;
    const p = `<p class="bad not-computed">Not predicted: ${esc(why)}</p>`;
    for (const id of ["pred", "pred-yantra", "ecl"]) $(id).innerHTML = p;
    $("tl-ganita").innerHTML = labelsHtml(moonTier, NaN);
    $("day-help").textContent = DAY_HELP;
  }
  function refresh() {
    try {
      const N = kaliOfDate($("day").value);
      $("day-help").textContent = dayHelp(N);
      lastPred = predictDay(N);
      showPrediction(lastPred);
      showYantraPrediction(lastPred.N);
      showEclipses();
    } catch (e) { notPredicted(e && e.message ? e.message : String(e)); throw e; }
  }
  $("yantra-pick").addEventListener("change", guard(() => {
    myYantras = [...$("yantra-pick").querySelectorAll("input[data-yantra]")].filter((x) => x.checked).map((x) => x.dataset.yantra);
    store.set(YANTRA_KEY, JSON.stringify(myYantras));
    if (lastPred) showYantraPrediction(lastPred.N);
  }));
  for (const id of ["yantra-kg", "yantra-kv"]) $(id).addEventListener("change", guard(() => { if (lastPred) showYantraPrediction(lastPred.N); }));

  /** "Gregorian 2026-10-08 = Julian 2026-09-25 · 2026 CE (astronomical year 2026) · Kali day …" */
  function dayHelp(N) {
    const other = cal() === "gregorian" ? "julian" : "gregorian", o = K.civilFromKaliDay(N, other), c = K.civilFromKaliDay(N, cal());
    const iso = (x) => `${x.year < 0 ? "-" : ""}${String(Math.abs(x.year)).padStart(4, "0")}-${String(x.month).padStart(2, "0")}-${String(x.day).padStart(2, "0")}`;
    return `${CAL_NAME[cal()]} ${iso(c)} = ${CAL_NAME[other]} ${iso(o)} · ${c.year <= 0 ? `${1 - c.year} BCE` : `${c.year} CE`} (astronomical year ${c.year}) · ${K.varaOfKaliDay(N).name} · Kali day ${N}`;
  }
  $("calendar").addEventListener("change", () => {
    // the same days, written in the other calendar
    const other = cal() === "gregorian" ? "julian" : "gregorian";
    for (const id of ["day", "rec-day"]) {
      const m = DATE_RE.exec($(id).value || "");
      if (m) { try { $(id).value = dateOfKali(K.kaliDayFromCivil({ calendar: other, year: Number(m[1].replace("−", "-")), month: Number(m[2]), day: Number(m[3]) })); } catch (e) { /* the parser will say */ } }
    }
    if (plan && stars.length) guard(() => refresh())();
  });

  // ── start ───────────────────────────────────────────────────────────────────────────────────────────
  const today = dateOfKali(todayKali());
  $("day").value = today; $("rec-day").value = today;
  $("moon-tier").innerHTML = TIER_IDS.map((id) => `<label><input type="radio" name="moon-tier" value="${esc(id)}"> <span><b>${esc(TIERS[id].labelSa)}</b> · ${esc(TIERS[id].label)}${TIERS[id].default ? ` <span class="muted">(default)</span>` : ""}</span></label>`).join("");
  showMoonTier();
  function chooseMoonTier(id) {
    moonTier = MC.resolveTier(id); linkNote = "";
    try { shared.set({ tier: moonTier }); } catch (e) { /* not kept: the page still works */ }
    showMoonTier();
    if (plan && stars.length) guard(() => refresh())();
  }
  $("moon-tier").addEventListener("change", (ev) => { if (ev.target && ev.target.name === "moon-tier") chooseMoonTier(ev.target.value); });
  document.addEventListener("click", (ev) => { const b = ev.target.closest && ev.target.closest("[data-use-tier]"); if (b) chooseMoonTier(b.dataset.useTier); });
  Promise.all([fetch("corpus/surya-siddhanta/yogatara.json").then((r) => r.json()), loadRecord()]).then(async ([cat]) => {
    showMoonTier();
    stars = Dr.starsOf(cat);
    await Keep.init();
    try { await load(); } catch (e) { say(e.message, true); }
    showYantraPick();
    showLedger(); showFields();
    // a day that cannot be predicted (the paramparā record unread for the default choice, say) is said, and the page
    // stays usable: the other choices, the ledger and the records do not depend on it
    try { refresh(); } catch (e) { say(e && e.message ? e.message : String(e), true); }
    document.body.dataset.ready = "1";
  }).catch((e) => { say("The star catalogue could not be read: " + e.message, true); document.body.dataset.ready = "error"; });
})();
if("serviceWorker" in navigator && location.protocol !== "file:") navigator.serviceWorker.register("sw.js").catch(function(){});
