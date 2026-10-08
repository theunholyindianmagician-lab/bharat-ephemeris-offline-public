/* vedha-page.js — the page logic of vedha.html, kept out of the HTML so the page runs under a strict Content-Security-Policy
 * (script-src 'self': no inline script, no inline handler; council R-08). The engine is in the sovereign modules it loads. */
(function () {
  "use strict";
  const K = window.KalaDvara, C = window.SSChaya, G = window.SSGrahana, P = window.Panchanga, Dr = window.SSDrishya, V = window.VedhaLekha;
  const Y = window.Yantra;
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

  let ledger = null, stars = [], plan = null, lastPred = null;

  // ── days: the device's calendar date only (the clock of record is the bowl) ─────────────────────────
  const kaliOfDate = (v) => { const [y, m, d] = v.split("-").map(Number); return K.kaliDayFromCivil({ calendar: "gregorian", year: y, month: m, day: d }); };
  const dateOfKali = (N) => { const c = K.civilFromKaliDay(N, "gregorian"); return `${c.year}-${String(c.month).padStart(2, "0")}-${String(c.day).padStart(2, "0")}`; };
  const todayKali = () => { const d = new Date(); return K.kaliDayFromCivil({ calendar: "gregorian", year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate() }); };

  // ── units ───────────────────────────────────────────────────────────────────────────────────────────
  const kapStr = (asus) => { const c = V.kapalaOfAsus(asus, true); return `${c.ghati} घ ${c.vinadi} वि ${c.prana} प्रा`; };
  const hoursStr = (asus) => { const h = asus / V.ASUS_PER_DAY * 24, hh = Math.floor(h), mm = Math.round((h - hh) * 60); return `≈ ${hh}h ${String(mm).padStart(2, "0")}m after sunrise`; };
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
  function predictDay(N) {
    const ms = plan.model, rise = V.sunriseAt(N, ms), next = V.sunriseAt(N + 1, ms), set = V.sunsetAt(N, ms);   // one rule for both ends
    const sun = C.textSun(N + 0.5 - ms.deshantara / 360), noon = C.noonShadow(sun.sayana, ms.palabha);
    const transits = stars.slice(0, 28).map((st) => V.predictTransit(N, st, ms)).filter((p) => p.above && p.t > set + 0.04 && p.t < next - 0.04).sort((a, b) => a.t - b.t);
    const L = P.limbsAt(rise), tithi = P.tithiName(L.tithi);
    const crescent = L.tithi >= 29 || L.tithi <= 3 ? V.predictCrescent(N, "pashcima", ms) : null;
    const yoga = stars.slice(0, 28).map((st) => V.predictYuti(N, st, ms)).filter((p) => p.t !== null);
    return { N, rise, setAsus: V.turnAsusBetween(rise, set), noon: { chaya: noon.chaya, dir: noon.dir, ayana: ayanaOf(sun.sayana) }, transits, tithi, nakshatra: P.NAKSHATRA[L.nakshatra - 1], crescent, yoga };
  }
  function showPrediction(p) {
    const rows = [];
    rows.push(`<p>Kali day ${p.N}: ${esc(p.tithi.paksha)} ${esc(p.tithi.name)}, nakṣatra ${esc(p.nakshatra)} at sunrise. Sunset at ${kapStr(p.setAsus)} (${hoursStr(p.setAsus)}).</p>`);
    rows.push(`<p><b>Noon shadow</b> of a ${esc(plan.shanku)}-aṅgula śaṅku: ${angStr(p.noon.chaya * plan.shanku / 12)} toward the ${p.noon.dir === "N" ? "north" : "south"} (ayana ${p.noon.ayana}).</p>`);
    if (p.transits.length) {
      rows.push(`<table><thead><tr><th>star on the meridian tonight</th><th>bowl from sunrise</th><th></th><th>altitude</th></tr></thead><tbody>`
        + p.transits.map((t) => `<tr><td>${esc(t.name)}</td><td>${kapStr(t.sinceSunriseAsus)}</td><td class="muted">${hoursStr(t.sinceSunriseAsus)}</td><td>${arcStr(t.unnataDeg)} ${t.disha === "N" ? "north" : "south"}</td></tr>`).join("") + `</tbody></table>`);
    } else rows.push(`<p class="muted">No junction star crosses the meridian in the dark tonight.</p>`);
    if (p.crescent) rows.push(typeof p.crescent.kalamsa === "number"
      ? `<p><b>The crescent</b> this evening: ${p.crescent.kalamsa.toFixed(2)} kālāṃśa against the text's 12 — the text says <b>${p.crescent.seen ? "seen" : "not seen"}</b>. Look for it after sunset either way, and record what you see.</p>`
      : `<p><b>The crescent</b>: the Moon is not yet past the Sun this evening (SS 10.1-10.4) — no evening crescent by the text.</p>`);
    if (p.yoga.length) rows.push(`<p><b>The Moon on a junction star</b>: ${p.yoga.map((y) => `${esc(y.name)} at ${kapStr(y.sinceSunriseAsus)} (${hoursStr(y.sinceSunriseAsus)})`).join("; ")}.</p>`);
    $("pred").innerHTML = rows.join("");
  }
  function showEclipses() {
    const ms = plan.model, N0 = Number(kaliOfDate($("day").value) || todayKali());
    let list = [];
    try { list = G.eclipsesBetween(N0, N0 + 400, ms); } catch (e) { $("ecl").innerHTML = `<p class="bad">${esc(e.message)}</p>`; return; }
    // a solar eclipse with the Sun below the horizon at every contact is not an eclipse "at this place" (council KH-07)
    list = list.filter((E) => E.kind === "lunar" || !E.horizon || Object.values(E.horizon).some((h) => h && h.above));
    if (!list.length) { $("ecl").innerHTML = `<p class="muted">The text gives no eclipse at this place in the next 400 days.</p>`; return; }
    $("ecl").innerHTML = `<table><thead><tr><th>kind</th><th>contact</th><th>civil day (sunrise before)</th><th>bowl from that sunrise</th><th></th><th>body up?</th></tr></thead><tbody>`
      + list.flatMap((E) => contactsOf(E, ms).map((c) => `<tr><td>${E.kind === "lunar" ? "चन्द्र" : "सूर्य"} ${E.total ? "(total, by the text)" : `(grāsa ${E.magnitude.toFixed(2)} of the diameter, by the text)`}${E.perceptible && E.perceptible.seen === false ? ` <span class="muted">— below SS 6.13's limit of what is seen</span>` : ""}</td><td>${c.c}</td><td>${dateOfKali(c.N)}</td><td>${kapStr(c.p.sinceSunriseAsus)}</td><td class="muted">${hoursStr(c.p.sinceSunriseAsus)}</td><td>${c.p.above === true ? "yes" : c.p.above === false ? "no" : "—"}</td></tr>`)).join("") + `</tbody></table>`;
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
    const day = { kali: p.N }, recs = [];
    recs.push({ id: `ganita-madhyahna-${p.N}`, kind: "ganita", day, for: "madhyahna", model, values: { chaya: angulaOfNum(p.noon.chaya * plan.shanku / 12), dir: p.noon.dir, shanku: plan.shanku } });
    p.transits.forEach((t, i) => recs.push({ id: `ganita-yamyottara-${p.N}-${i + 1}`, kind: "ganita", day, for: "yamyottara", model, values: { star: t.name, kapala: V.kapalaOfAsus(t.sinceSunriseAsus, true), unnata: V.arcOfDegrees(t.unnataDeg, true), disha: t.disha } }));
    if (p.crescent) recs.push({ id: `ganita-candra-darshana-${p.N}`, kind: "ganita", day, for: "candra-darshana", model, values: typeof p.crescent.kalamsa === "number" ? { seen: p.crescent.seen, kalamsa: Math.round(p.crescent.kalamsa * 100) / 100 } : { seen: false } });
    p.yoga.forEach((y, i) => recs.push({ id: `ganita-candra-yoga-${p.N}-${i + 1}`, kind: "ganita", day, for: "candra-yoga", model, values: { star: y.name, kapala: V.kapalaOfAsus(y.sinceSunriseAsus, true) } }));
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
    if (k === "yantra") { const sel = $("rec-fields").querySelector('[data-f="yantra"]'); sel.addEventListener("change", () => { $("yantra-fields").innerHTML = yantraReadingHTML(sel.value); }); }
    const sel = $("rec-ganita");
    sel.innerHTML = `<option value="">—</option>` + (ledger ? ledger.entries.filter((e) => e.record.kind === "ganita" && e.record.for === k).map((e) => `<option value="${esc(e.record.id)}">${esc(e.record.id)}</option>`).join("") : "");
  }
  const f = (name) => { const el = $("rec-fields").querySelector(`[data-f="${name}"]`); return el ? el.value : ""; };
  const num = (name) => (f(name) === "" ? 0 : Number(f(name)));
  function recordFromForm() {
    const kind = $("rec-kind").value, N = kaliOfDate($("rec-day").value);
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
      + ledger.entries.slice().reverse().map((e) => `<tr><td>${esc(e.seq)}</td><td>${esc(e.at)}</td><td>${esc(e.record.kind)}${e.record.kind === "ganita" ? " → " + esc(e.record.for) : ""}</td><td>${esc(e.record.id)}</td><td>${e.record.day ? (e.record.day.kali !== undefined ? dateOfKali(e.record.day.kali) : "") : ""}</td></tr>`).join("") + `</tbody></table>`;
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
      let what = "";
      if (a && a.vinadi !== undefined) what = `${a.vinadi >= 0 ? "+" : ""}${a.vinadi.toFixed(2)} vināḍī (the sky ${a.vinadi >= 0 ? "late" : "early"})`;
      if (a && a.unnataArcmin !== undefined) what += ` · altitude ${a.unnataArcmin >= 0 ? "+" : ""}${a.unnataArcmin.toFixed(1)}′`;
      if (a && a.moonArcmin !== undefined) what += ` · the Moon ${a.moonArcmin.toFixed(2)}′`;
      if (a && a.agree !== undefined) what = a.agree ? "agrees with the text" : "differs from the text";
      return `<tr><td>${esc(r.id)}</td><td>${esc(r.kind)}</td><td>${what || "—"}</td></tr>`;
    });
    const ch = red.chaya && red.chaya.records ? red.chaya.records.filter((x) => x.kind === "madhyahna").map((x) => `<tr><td>${esc(x.id)}</td><td>madhyāhna</td><td>${typeof x.sunResidualArcmin === "number" ? `the shadow-Sun ${x.sunResidualArcmin >= 0 ? "+" : ""}${x.sunResidualArcmin.toFixed(1)}′, declination ${x.krantiResidualArcmin >= 0 ? "+" : ""}${x.krantiResidualArcmin.toFixed(1)}′` : "reduced"}</td></tr>`) : [];
    $("antara").innerHTML = `<h3>Antara [measured]</h3><table><thead><tr><th>record</th><th>kind</th><th>observed − the text</th></tr></thead><tbody>${rows.concat(ch).join("") || "<tr><td colspan=3 class=muted>no observations yet</td></tr>"}</tbody></table>`
      + (red.warnings.length ? `<p class="muted">${red.warnings.map(esc).join("<br>")}</p>` : "");
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

  function refresh() {
    lastPred = predictDay(kaliOfDate($("day").value));
    showPrediction(lastPred);
    showYantraPrediction(lastPred.N);
    showEclipses();
  }
  $("yantra-pick").addEventListener("change", guard(() => {
    myYantras = [...$("yantra-pick").querySelectorAll("input[data-yantra]")].filter((x) => x.checked).map((x) => x.dataset.yantra);
    store.set(YANTRA_KEY, JSON.stringify(myYantras));
    if (lastPred) showYantraPrediction(lastPred.N);
  }));
  for (const id of ["yantra-kg", "yantra-kv"]) $(id).addEventListener("change", guard(() => { if (lastPred) showYantraPrediction(lastPred.N); }));

  // ── start ───────────────────────────────────────────────────────────────────────────────────────────
  const today = dateOfKali(todayKali());
  $("day").value = today; $("rec-day").value = today;
  fetch("corpus/surya-siddhanta/yogatara.json").then((r) => r.json()).then(async (cat) => {
    stars = Dr.starsOf(cat);
    await Keep.init();
    try { await load(); } catch (e) { say(e.message, true); }
    showYantraPick();
    showLedger(); showFields(); refresh();
    document.body.dataset.ready = "1";
  }).catch((e) => { say("The star catalogue could not be read: " + e.message, true); document.body.dataset.ready = "error"; });
})();
if("serviceWorker" in navigator && location.protocol !== "file:") navigator.serviceWorker.register("sw.js").catch(function(){});
