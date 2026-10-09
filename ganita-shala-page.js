/* ganita-shala-page.js — the research page (गणित-शाला): every derivation with its measured figure, the four choices
 * against the sky on any day, the text's Sun explained, and the paramparā's records applied one by one.
 *
 * WHAT IS COMPUTED HERE. Section 1 and 2 are computed live on this device through math-core's tier API: every text
 * choice (M.TIER_IDS of family 'ss') against the dṛk choice at the instant the visitor picks — the places by
 * M.tierGrahaRows, the ayanāṃśa by M.tierAyanamsha, the lagna by M.sayanaAscendantDeg; the dṛk refusal outside its span
 * is shown as the engine states it. Section 2's reasons are built from the engine's own labels and rates (M.TIERS,
 * M.tierAyanamsha), never typed. Sections 3 and 4 render two data files of the repository: corpus/research/
 * parampara-apply.json (scripts/parampara-apply.cjs) and corpus/research/derivations.json (the ledger compiled from the
 * tests' own assertions). Strict CSP: this file is the page's only script; nothing inline; textContent everywhere. */
(function () {
  "use strict";
  const M = globalThis.ShunyaMath, ST = globalThis.SSTier, PA = globalThis.Parampara, SK = globalThis.SukshmaKala;
  const $ = (id) => document.getElementById(id);
  const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text !== undefined && text !== null) e.textContent = String(text); return e; };
  const wrap = (d) => ((d % 360) + 540) % 360 - 180;
  const signed = (x, digits = 1) => (x >= 0 ? "+" : "−") + Math.abs(x).toFixed(digits);
  const UJJAIN = { lat: 23.1765, lon: 75.7885 };
  const status = (s, cls) => { const p = $("status"); p.textContent = s; p.className = cls || "muted"; };
  if (!M || !ST || !PA || typeof M.tierGrahaRows !== "function") { status("the engine did not load (math-core.js, ss-tier.js, parampara.js)", "refusal"); return; }

  // ── theme (the same three states as the other sovereign pages; stored on this device only) ─────────────────────────
  (function theme() {
    const btn = $("theme"), KEY = "ganita-shala-theme";
    const apply = (v) => { if (v === "light" || v === "dark") document.documentElement.dataset.theme = v; else delete document.documentElement.dataset.theme; btn.textContent = `रंग · theme: ${v || "auto"}`; };
    let cur = null; try { cur = localStorage.getItem(KEY); } catch (e) { cur = null; }
    apply(cur);
    btn.addEventListener("click", () => { cur = cur === null ? "dark" : cur === "dark" ? "light" : null; try { if (cur) localStorage.setItem(KEY, cur); else localStorage.removeItem(KEY); } catch (e) { /* no storage */ } apply(cur); });
  })();

  // ── the paramparā record (the default and the Kerala choice read it) ────────────────────────────────────────────────
  const get = async (u) => { const r = await fetch(u); if (!r.ok) throw new Error(`${u}: ${r.status} ${r.statusText}`); return r.json(); };
  async function loadRecord() {
    const [registry, samskara] = await Promise.all([get("corpus/parampara/registry.json"), get("corpus/parampara/samskara.json")]);
    ST.useParampara(PA.load({ registry, samskara }));
  }

  // ── section 1: the four choices against the sky ─────────────────────────────────────────────────────────────────────
  const TEXT_TIERS = M.TIER_IDS.filter((id) => M.TIERS[id].family === "ss");
  const SKY = M.TIER_IDS.find((id) => M.TIERS[id].family === "drik");
  const isRefusal = (e) => e && (e.code === "TIER_OUT_OF_SPAN" || e instanceof M.TierSpanError);
  const row = (rows, key) => { const r = rows.find((x) => x.key === key); if (!r) throw new Error(`no ${key} row`); return r.longitude; };
  function jdOfInputs() {
    const d = $("date").value, t = $("time").value || "12:00", tz = Number($("tz").value);
    if (!d || !Number.isFinite(tz)) return null;
    return M.gregorianToJulianDay(d, t.length === 5 ? `${t}:00` : t, tz);
  }
  function skyAt(jd) {
    const rows = M.tierGrahaRows(jd, SKY), ay = M.tierAyanamsha(jd, SKY);
    return { sun: row(rows, "surya"), moon: row(rows, "candra"), ayan: ay.deg, lagnaTrop: M.sayanaAscendantDeg(jd, UJJAIN.lat, UJJAIN.lon, SKY) };
  }
  function tierAt(jd, id) {
    const rows = M.tierGrahaRows(jd, id), ay = M.tierAyanamsha(jd, id);
    return { sun: row(rows, "surya"), moon: row(rows, "candra"), ayan: ay.deg, ayName: ay.name, lagnaTrop: M.sayanaAscendantDeg(jd, UJJAIN.lat, UJJAIN.lon, id) };
  }
  /** The comparison of one text choice with the sky at jd, all in arcminutes. */
  function compare(jd, id, sky) {
    const t = tierAt(jd, id);
    return { id, ayan: t.ayan, ayName: t.ayName,
      dAyan: (t.ayan - sky.ayan) * 60, sunSid: wrap(t.sun - sky.sun) * 60, sunTrop: wrap(t.sun + t.ayan - sky.sun - sky.ayan) * 60,
      moonSid: wrap(t.moon - sky.moon) * 60, moonTrop: wrap(t.moon + t.ayan - sky.moon - sky.ayan) * 60,
      elong: wrap((t.moon - t.sun) - (sky.moon - sky.sun)) * 60, lagnaTrop: wrap(t.lagnaTrop - sky.lagnaTrop) * 60 };
  }
  function renderSky(jd) {
    const body = $("sky-table").querySelector("tbody"); body.textContent = "";
    const note = $("sky-note");
    document.body.dataset.sky = "computing";
    let sky;
    try { sky = skyAt(jd); } catch (e) {
      if (!isRefusal(e)) throw e;
      const tr = el("tr"); const td = el("td", "refusal", `${M.TIERS[SKY].labelSa} · ${M.TIERS[SKY].label}: not served at this instant — ${e.message}`); td.colSpan = 9; tr.appendChild(td); body.appendChild(tr);
      note.textContent = `The sky choice is served ${M.TIERS[SKY].span.years[0]}.0–${M.TIERS[SKY].span.years[1]}.0 (${M.TIERS[SKY].span.yearRule}) and refused outside; pick a date inside it to compare.`;
      $("hisab-out").textContent = ""; renderWhy(jd, null);
      document.body.dataset.sky = "refused"; return;
    }
    const cmp = TEXT_TIERS.map((id) => compare(jd, id, sky));
    for (const c of cmp) {
      const tr = el("tr"); tr.dataset.tier = c.id;
      tr.appendChild(el("td", null, `${M.TIERS[c.id].labelSa} · ${M.TIERS[c.id].label}`));
      tr.appendChild(el("td", "num", `${c.ayan.toFixed(4)}°`));
      for (const v of [c.dAyan, c.sunSid, c.sunTrop, c.moonSid, c.moonTrop, c.elong, c.lagnaTrop]) tr.appendChild(el("td", "num", `${signed(v)}′`));
      body.appendChild(tr);
    }
    const skyTr = el("tr"); skyTr.dataset.tier = SKY;
    skyTr.appendChild(el("td", "muted", `${M.TIERS[SKY].labelSa} · ${M.TIERS[SKY].label} (the sky here)`));
    skyTr.appendChild(el("td", "num muted", `${sky.ayan.toFixed(4)}°`));
    for (let i = 0; i < 7; i++) skyTr.appendChild(el("td", "muted", "0"));
    body.appendChild(skyTr);
    note.textContent = `JD ${jd.toFixed(5)} (UT). Sky: ${M.TIERS[SKY].engine} ${M.TIERS[SKY].span.accuracyMeasured}. Sidereal columns are against the sky's ${M.TIERS[SKY].ayanamsha.name} frame; tropical columns add each choice's own ayanāṃśa.`;
    renderHisab(jd, cmp, sky);
    try { renderSukshma(jd, cmp, sky); } catch (e) { $("sukshma-dasha").textContent = `the micro-time table could not be computed: ${e && e.message ? e.message : e}`; $("sukshma-dasha").className = "refusal"; }
    document.body.dataset.sky = "done";
  }

  // ── section 2: where the text's Sun stands, and why ──────────────────────────────────────────────────────────────────
  function renderHisab(jd, cmp, sky) {
    const out = $("hisab-out"); out.textContent = "";
    const p = el("p", null, "For each text choice at this instant: the Sun's distance from the sky in the tropical frame is its distance in the sidereal frame plus the difference of the two ayanāṃśas. The parts:");
    out.appendChild(p);
    const tbl = el("table"); tbl.id = "hisab-table";
    const thead = el("thead"), hr = el("tr"); for (const h of ["choice", "Sun sidereal (vs Citrā-pakṣa)", "+ ayanāṃśa − Citrā-pakṣa", "= Sun tropical"]) hr.appendChild(el("th", null, h)); thead.appendChild(hr); tbl.appendChild(thead);
    const tb = el("tbody");
    for (const c of cmp) {
      const tr = el("tr"); tr.dataset.tier = c.id;
      tr.appendChild(el("td", null, `${M.TIERS[c.id].labelSa} · ${M.TIERS[c.id].label}`));
      tr.appendChild(el("td", "num", `${signed(c.sunSid)}′`)); tr.appendChild(el("td", "num", `${signed(c.dAyan)}′`)); tr.appendChild(el("td", "num", `${signed(c.sunTrop)}′`));
      tb.appendChild(tr);
    }
    tbl.appendChild(tb); const wrapDiv = el("div", "tbl"); wrapDiv.appendChild(tbl); out.appendChild(wrapDiv);
    renderWhy(jd, sky);
  }
  function renderWhy(jd, sky) {
    const ul = $("hisab-why"); ul.textContent = "";
    const li = (t) => ul.appendChild(el("li", null, t));
    const ssYear = M.TIERS.ss.dashaYear.days, skyYear = M.TIERS[SKY].dashaYear.days;
    const driftArcminPerYear = (ssYear - skyYear) * 360 / skyYear * 60;
    li(`The year. The text's sidereal year is ${ssYear.toFixed(6)} civil days (${M.TIERS.ss.dashaYear.source}); the sky choice's is ${skyYear} (${M.TIERS[SKY].dashaYear.source}). The text's mean Sun therefore falls behind the stars by ${driftArcminPerYear.toFixed(4)}′ a year [theorem from the two numbers]: a century is ${(driftArcminPerYear * 100).toFixed(1)}′. No recorded rule of the paramparā changes the Sun's year; the Kerala choice's year (Āryabhaṭa's integers) differs from the text's by ${((M.TIERS.kerala ? 1577917500 / 4320000 - ssYear : 0) * 86400).toFixed(1)} seconds.`);
    let ayText = "";
    try {
      const a0 = M.tierAyanamsha(jd, "ss"), a1 = M.tierAyanamsha(jd, "ss+parameshvara"), ak = M.TIERS.kerala ? M.tierAyanamsha(jd, "kerala") : null;
      ayText = `The ayanāṃśa. The text's libration (${a0.name}: ${a0.source}) moves at ${Math.abs(a0.rateArcsecPerYear)}″ a year and stands at ${a0.deg.toFixed(4)}° at this instant. The default choice applies the libration fitted to the paramparā's three determinations: ${a1.rateRule} — ${a1.deg.toFixed(4)}° here.` +
        (ak ? ` The Kerala choice's rule: ${ak.rateRule} — ${ak.deg.toFixed(4)}°.` : "");
      if (sky) { const as = M.tierAyanamsha(jd, SKY); ayText += ` The sky's ${as.name} is ${as.deg.toFixed(4)}° and moves at ${Number.isFinite(as.rateArcsecPerYear) ? as.rateArcsecPerYear.toFixed(2) : "—"}″ a year [standard convention, as its label states], so the text's 54″ gains on it by ${(Math.abs(a0.rateArcsecPerYear) - as.rateArcsecPerYear).toFixed(2)}″ a year, and its zero (the libration's start) lies where the text puts it, not where the Citrā-pakṣa convention does.`; }
    } catch (e) { ayText = `The ayanāṃśa rows could not be computed here: ${e.message}`; }
    li(ayText);
    li(`The Moon. The text's Moon has one equation, the manda of SS 2.29-2.45 on the epicycle of 2.34-2.38; Parameśvara's saṃskāra moves its mean place and the node's by the record's arcminutes (${M.TIERS["ss+parameshvara"].provenance}). What remains in the elongation is the text's one-term Moon; section 3 measures it, and no record in the registry corrects it.`);
    li(`What is adopted. The default choice carries the record's Moon, node and ayanāṃśa zero; the Kerala choice carries the Parahita + Dṛggaṇita means and Nīlakaṇṭha's linear ayanāṃśa; the plain text carries nothing. Section 3 shows what each record did, and what was not adopted and why.`);
  }

  // ── section 5: the resolution the vargas demand ──────────────────────────────────────────────────────────────────────
  const VARGA_CODES = ["D9", "D12", "D27", "D60", "D144", "D150"];
  const SIGN_SA = ["मेष", "वृषभ", "मिथुन", "कर्क", "सिंह", "कन्या", "तुला", "वृश्चिक", "धनु", "मकर", "कुम्भ", "मीन"];
  let applyData = null;                                                     // corpus/research/parampara-apply.json, once read
  const APPLY_ROW = { "ss+parameshvara": "par+ayan3", ss: "ss", kerala: "kerala" };
  /** The measured uncertainty (arcseconds) of a choice's Sun, Moon and lagna: the sky choice from its labels; a text choice
   *  from its measured rms against the sky in 2026 (section 3); null where no figure exists. */
  function budgetsOf(id) {
    if (M.TIERS[id].family === "drik") {
      const s = /λ ≤ ([0-9.]+)″/.exec(M.TIERS[id].span.accuracyMeasured), l = /within ([0-9.]+)″/.exec(M.TIERS[id].span.lagnaMeasured || "");
      return s ? { sun: Number(s[1]), moon: Number(s[1]), lagna: l ? Number(l[1]) : Number(s[1]), source: `${M.TIERS[id].span.accuracyMeasured}; ${M.TIERS[id].span.lagnaMeasured || ""}` } : null;
    }
    const row = applyData && applyData.spans[0].rows.find((r) => r.name === APPLY_ROW[id]);
    return row ? { sun: row.sun.rms * 60, moon: row.moon.rms * 60, lagna: row.sun.rms * 60, source: `rms against the sky over ${applyData.spans[0].title} (candidate ${row.name}); the lagna taken at the Sun's figure` } : null;
  }
  function renderSukshma(jd, cmp, sky) {
    if (!SK) throw new Error("sukshma-kala.js is not loaded");
    const res = $("sukshma-res").querySelector("tbody"), ch = $("sukshma-chart").querySelector("tbody"); res.textContent = ""; ch.textContent = "";
    const ids = [...TEXT_TIERS, SKY];
    const lagnaRate = (id) => Math.abs(wrap(M.sayanaAscendantDeg(jd + 1 / 1440, UJJAIN.lat, UJJAIN.lon, id) - M.sayanaAscendantDeg(jd, UJJAIN.lat, UJJAIN.lon, id)));
    const dayRate = (id) => { const a = M.tierGrahaRows(jd, id), b = M.tierGrahaRows(jd + 1, id); return { moon: Math.abs(wrap(row(b, "candra") - row(a, "candra"))), sun: Math.abs(wrap(row(b, "surya") - row(a, "surya"))) }; };
    const skyRates = { lagnaDegPerMin: lagnaRate(SKY), ...(() => { const d = dayRate(SKY); return { moonDegPerDay: d.moon, sunDegPerDay: d.sun }; })() };
    const budgets = Object.fromEntries(ids.map((id) => [id, budgetsOf(id)]));
    for (const code of ["D9", "D12", "D27", "D30", "D60", "D144", "D150"]) {
      const r = SK.resolution(code, skyRates), tr = el("tr"); tr.dataset.varga = code;
      tr.appendChild(el("td", null, `${r.nameSa} · ${r.name} (${code})${r.rule === "standard" ? " [standard]" : ""}`));
      tr.appendChild(el("td", "num", r.unequal ? "5°–8° (unequal)" : `${r.partArcmin}′`));
      tr.appendChild(el("td", "num", `${r.lagnaSeconds.toFixed(0)} s`)); tr.appendChild(el("td", "num", `${r.moonMinutes.toFixed(1)} min`)); tr.appendChild(el("td", "num", `${r.sunHours.toFixed(2)} h`));
      tr.appendChild(el("td", "num", ids.map((id) => { const b = budgets[id]; return `${M.TIERS[id].labelSa}: ${b ? (r.unequal ? "—" : (b.moon / (r.partArcmin * 60)).toFixed(2)) : "no figure"}`; }).join(" · ")));
      res.appendChild(tr);
    }
    for (const id of ids) {
      const t = tierAt(jd, id), lagna = M.siderealAscendantDeg(jd, UJJAIN.lat, UJJAIN.lon, id), b = budgets[id];
      for (const [key, lon, label] of [["lagna", lagna, "लग्न · lagna (Ujjain)"], ["sun", t.sun, "सूर्य · Sun"], ["moon", t.moon, "चन्द्र · Moon"]]) {
        const tr = el("tr"); tr.dataset.tier = id; tr.dataset.body = key;
        tr.appendChild(el("td", null, `${M.TIERS[id].labelSa} · ${label}`));
        for (const code of VARGA_CODES) {
          const a = SK.assess(lon, code, b ? b[key] : 0);
          const td = el("td", "num", `${SIGN_SA[a.index]} (${(a.marginArcsec / 60).toFixed(1)}′)`); td.className = "num " + (b ? (a.decided ? "ok" : "refusal") : "muted"); td.title = b ? (a.decided ? "decided under the choice's measured uncertainty" : "undecided: the edge lies within the choice's measured uncertainty") : "no measured uncertainty for this choice";
          td.dataset.decided = b ? String(a.decided) : "unknown"; tr.appendChild(td);
        }
        ch.appendChild(tr);
      }
    }
    const d = TEXT_TIERS[0], c = SK.cell(tierAt(jd, d).moon), bd = budgets[d];
    const sources = ids.map((id) => `${M.TIERS[id].labelSa}: ${budgets[id] ? budgets[id].source : "no measured figure"}`).join(" · ");
    $("sukshma-dasha").textContent = `Daśā: in the ${M.TIERS[d].label} choice the Moon stands in ${c.nakshatra}. nakṣatra, pāda ${c.pada} (cell ${c.k} of 108; navāṃśa ${c.navamsha + 1} = pāda identity), lord ${c.lord}; one minute of arc of the Moon is ${SK.dashaDaysPerArcmin(c.lord).toFixed(2)} days of its daśā, so this choice's Moon uncertainty of ${bd ? (bd.moon / 60).toFixed(1) : "—"}′ is ${bd ? (SK.dashaDaysPerArcmin(c.lord) * bd.moon / 60).toFixed(0) : "—"} days of daśā at birth. Uncertainties used — ${sources}.`;
    document.body.dataset.sukshma = "done";
  }

  // ── section 3: the paramparā's records applied ───────────────────────────────────────────────────────────────────────
  function renderParampara(data) {
    const out = $("parampara-out"); out.textContent = "";
    const intro = el("p", "src", `${data.generatedBy}. Frame: ${data.frame}. The record: Moon ${data.record.moonArcmin}′, node ${data.record.nodeArcmin}′ at Kali day ${data.record.epochKali}; the libration's phase for Parameśvara's 15°: ${data.phaseDeg.toFixed(4)}° of its angle (as an amplitude change it would be ${data.amplitudeDeg.toFixed(4)}°). Kerala linear ayanāṃśa in 2026: ${data.keralaLinear2026.toFixed(4)}°; Citrā-pakṣa: ${data.citra2026.toFixed(4)}°. Parameśvara's epoch Moon ${data.parameshvaraMoonDeg.toFixed(4)}°: the Parahita means give ${data.parahitaMoonAtEpoch.toFixed(4)}°, the text ${data.textMoonAtEpoch.toFixed(4)}°.`);
    out.appendChild(intro);
    const f = (x) => `${signed(x.mean)} · ${x.rms.toFixed(1)} · ${x.max.toFixed(1)}`;
    for (const span of data.spans) {
      out.appendChild(el("h3", null, span.title));
      const tbl = el("table"); tbl.className = "parampara-span";
      const thead = el("thead"), hr = el("tr"); for (const h of ["candidate", "Sun", "Moon", "Moon − Sun", "tithi end (h rms)", "ayanāṃśa − Citrā-pakṣa"]) hr.appendChild(el("th", null, h)); thead.appendChild(hr); tbl.appendChild(thead);
      const tb = el("tbody");
      for (const r of span.rows) {
        const tr = el("tr"); tr.dataset.candidate = r.name;
        const td = el("td"); td.appendChild(el("b", null, r.name)); td.appendChild(el("div", "src", data.candidates[r.name] || "")); tr.appendChild(td);
        tr.appendChild(el("td", "num", f(r.sun))); tr.appendChild(el("td", "num", f(r.moon))); tr.appendChild(el("td", "num", f(r.el)));
        tr.appendChild(el("td", "num", (r.el.rms / 731.4 * 24).toFixed(2))); tr.appendChild(el("td", "num", f(r.ay)));
        tb.appendChild(tr);
      }
      tbl.appendChild(tb); const d = el("div", "tbl"); d.appendChild(tbl); out.appendChild(d);
    }
    out.appendChild(el("p", "muted", "Reading the table: with the libration fitted to the paramparā's three determinations (Āryabhaṭa's zero in Kali 3600, Nīlakaṇṭha's 14°26′, Parameśvara's 15°) the Sun's tropical distance falls from about 100′ to under 10′ in 2026, and the elongation (which makes the tithi) is centred within a minute of arc by Parameśvara's Moon and node; its scatter is the text's one-term Moon. The phase-only reading of the morning (par+ayanPhase) met the two Kerala figures but broke Āryabhaṭa's zero by 57.6′, so it was superseded the same day. The Kerala choice's Sun stands nearer the stars than the text's; its tithi-end scatter is a little smaller."));
  }

  // ── section 4: the derivations ledger ────────────────────────────────────────────────────────────────────────────────
  function renderLedger(data) {
    const out = $("ledger-out"), nav = $("ledger-nav"); out.textContent = ""; nav.textContent = "";
    const entries = Array.isArray(data.entries) ? data.entries : [];
    if (data.generatedBy) out.appendChild(el("p", "src", `${data.generatedBy}${data.date ? ` · ${data.date}` : ""}; ${entries.length} entries.`));
    for (const e of entries) {
      const a = el("a", null, e.titleSa || e.title); a.href = `#d-${e.id}`; nav.appendChild(a);
      const card = el("article", "card"); card.id = `d-${e.id}`; card.dataset.entry = e.id;
      card.appendChild(el("h3", null, `${e.titleSa ? e.titleSa + " · " : ""}${e.title}`));
      const tags = el("div", "tags"); for (const t of e.tags || []) tags.appendChild(el("span", "tag", `[${t}]`)); card.appendChild(tags);
      card.appendChild(el("p", null, e.derives));
      if (Array.isArray(e.fromText) && e.fromText.length) { const ul = el("ul"); for (const x of e.fromText) ul.appendChild(el("li", null, x)); const d = el("details"); d.appendChild(el("summary", null, "from the text")); d.appendChild(ul); card.appendChild(d); }
      if (e.method) card.appendChild(el("p", "muted", `Method: ${e.method}`));
      if (Array.isArray(e.figures) && e.figures.length) {
        const h = el("p", null, "Measured in the tests:"); card.appendChild(h);
        for (const fg of e.figures) { const d = el("div", "fig"); d.appendChild(el("div", null, `${fg.claim} — ${fg.where}`)); d.appendChild(el("code", null, fg.verbatim)); card.appendChild(d); }
      } else card.appendChild(el("p", "muted", "The tests state no figure for this entry; see caveats."));
      if (e.caveats) card.appendChild(el("p", "src", `Not claimed: ${e.caveats}`));
      if (Array.isArray(e.sourceFiles) && e.sourceFiles.length) card.appendChild(el("p", "src", `Files: ${e.sourceFiles.join(", ")}`));
      out.appendChild(card);
    }
    const miss = data.notYetInLedger && Array.isArray(data.notYetInLedger.items) ? data.notYetInLedger.items : [];
    if (miss.length) {
      const d = el("details"); d.id = "ledger-missing"; d.appendChild(el("summary", null, `${data.notYetInLedger.note} (${miss.length})`));
      const ul = el("ul"); for (const m of miss) ul.appendChild(el("li", null, `${m.name} — ${m.section}${m.files && m.files.length ? ` (${m.files.join(", ")})` : ""}: ${m.derives}`)); d.appendChild(ul); out.appendChild(d);
    }
    document.body.dataset.ledger = String(entries.length);
  }

  // ── section 6: the library, and the ring tower in the text's numbers ─────────────────────────────────────────────
  function renderTower() {
    const K = globalThis.KalaDvara, S = globalThis.Sphuta, PM = globalThis.ParahitaMadhyama;
    if (!SK || !K || !S) return;
    const m = K.mana("surya"), a = K.mana("aryabhata");
    const rows = SK.valuationTable([
      { name: "Sun revolutions a yuga (SS 1.29)", value: m.sun }, { name: "years a yuga (SS 1.15-1.21)", value: 4320000n }, { name: "the day's prāṇas (SS 1.11-1.12)", value: 21600n },
      { name: "27 nakṣatras", value: 27n }, { name: "108 cells (27 × 4 = 12 × 9)", value: 108n }, { name: "Aṣṭottarī years (BPHS)", value: 108n },
      { name: "Moon revolutions (SS 1.30)", value: m.moon }, { name: "tithis a yuga (SS 1.37)", value: m.tithi }, { name: "solar months (SS 1.39)", value: m.sauraMasa },
      { name: "star-risings (SS 1.34)", value: m.nakshatra }, { name: "civil days (SS 1.37)", value: m.savana }, { name: "Āryabhaṭa's rotations (Gītikā)", value: a.nakshatra }, { name: "Āryabhaṭa's civil days", value: a.savana },
      { name: "Moon apogee revolutions (SS 1.33)", value: S.REV.moonApogee }, { name: "node revolutions (SS 1.33)", value: S.REV.node }, ...(PM ? [{ name: "Parahita node revolutions", value: PM.REV.node }] : []),
      { name: "arcseconds in the circle", value: 1296000n }, { name: "nakṣatra bhoga (′)", value: 800n }, { name: "tithi bhoga (′)", value: 720n }, { name: "9 lords", value: 9n }, { name: "Vimśottarī years", value: 120n },
      { name: "R = 3438 (SS 2.15-2.22)", value: 3438n }, { name: "Mādhava's R in thirds", value: 12375888n }, { name: "libration turns a yuga (SS 3.9)", value: 600n }, { name: "spandas a day (the lattice)", value: S.SPD },
    ]);
    const tb = $("tower-table").querySelector("tbody"); tb.textContent = "";
    for (const r of rows) { const tr = el("tr"); tr.dataset.nu3 = String(r.nu3); tr.appendChild(el("td", null, r.name)); tr.appendChild(el("td", "num", r.value)); tr.appendChild(el("td", "num", String(r.nu3))); tr.appendChild(el("td", "num", r.threeFreePart)); tr.appendChild(el("td", null, r.unitMod3 ? "yes" : "no")); tb.appendChild(tr); }
    $("tower-note").textContent = SK.TOWER_NOTE;
  }
  function renderGranthas(data) {
    const out = $("granthas-out"); out.textContent = "";
    out.appendChild(el("p", "src", `${data.generatedBy}. ${data.rule}`));
    for (const r of data.reads || []) {
      const card = el("article", "card"); card.dataset.edition = r.edition;
      const c = r.counts || {};
      card.appendChild(el("h3", null, `${r.edition.replace("editions/", "").replace("-full-edition.html", "")} — ${c.findings || 0} findings (${c.verse || 0} verse, ${c.commentary || 0} commentary; ${c.verseFound || 0} found at their lines), ${c.notUsed || 0} not used by the engine, ${c.candidates || 0} measurement candidates`));
      if (Array.isArray(r.chaptersSeen) && r.chaptersSeen.length) card.appendChild(el("p", "src", `Chapters seen: ${r.chaptersSeen.join("; ")}`));
      const tbl = el("table"); const th = el("thead"), hr = el("tr"); for (const h of ["topic", "the line", "kind", "number", "structure", "engine"]) hr.appendChild(el("th", null, h)); th.appendChild(hr); tbl.appendChild(th);
      const tb = el("tbody");
      for (const f of r.findings || []) {
        const tr = el("tr"); tr.dataset.kind = f.kind; tr.dataset.found = String(!!f.verseFound);
        const t1 = el("td"); t1.appendChild(el("b", null, f.topic)); t1.appendChild(el("div", "src", f.what)); tr.appendChild(t1);
        const t2 = el("td"); t2.appendChild(el("code", null, f.verse)); t2.appendChild(el("div", "src", `line ${f.line}${f.verseFound ? "" : " — not found at that line as quoted"}`)); tr.appendChild(t2);
        tr.appendChild(el("td", f.kind === "verse" ? "ok" : "muted", f.kind)); tr.appendChild(el("td", "num", f.number || "—")); tr.appendChild(el("td", null, f.structure || "—")); tr.appendChild(el("td", "src", f.engineUse || "—"));
        tb.appendChild(tr);
      }
      tbl.appendChild(tb); const d = el("div", "tbl"); d.appendChild(tbl); card.appendChild(d);
      if (Array.isArray(r.measurementCandidates) && r.measurementCandidates.length) { const det = el("details"); det.appendChild(el("summary", null, `measurement candidates (${r.measurementCandidates.length})`)); const ul = el("ul"); for (const m of r.measurementCandidates) ul.appendChild(el("li", null, `${m.what} (line ${m.line}) — ${m.why}`)); det.appendChild(ul); card.appendChild(det); }
      if (Array.isArray(r.notFound) && r.notFound.length) card.appendChild(el("p", "src", `Searched and not found: ${r.notFound.join("; ")}`));
      out.appendChild(card);
    }
    document.body.dataset.granthas = String((data.reads || []).length);
  }

  function renderGenerator(data) {
    if (!SK) return;
    $("gen-note").textContent = SK.GENERATOR_NOTE;
    const tb = $("gen-orbits").querySelector("tbody"); tb.textContent = "";
    for (const [M, label] of [[9, "ℤ/9 (lords)"], [27, "ℤ/27 (nakṣatras)"]]) for (const c of SK.generatorOrbits(M)) {
      const tr = el("tr"); tr.dataset.ring = String(M); tr.dataset.length = String(c.length);
      tr.appendChild(el("td", null, label)); tr.appendChild(el("td", "num", c.join(" → ") + " → " + c[0])); tr.appendChild(el("td", "num", String(c.length)));
      tr.appendChild(el("td", null, M === 9 ? c.map((i) => SK.LORDS[i]).join(" → ") : `${c.length} of the 27`)); tb.appendChild(tr);
    }
    const out = $("gen-search"); out.textContent = "";
    if (!data) return;
    const t = data.totals || {}, sc = data.sequenceCheck || {};
    out.appendChild(el("p", null, `Search for a basis (corpus/research/generator-2-search.json): ${t.scopes} scopes read, ${t.findings} quoted findings (${t.verseFound} found at their lines), ${t.claims} positive claim(s) of a doubling rule on an index, ${t.surviving} surviving three refuters; ${sc.parsed} stated lord orders tested, ${sc.textDoubling} text orders are doubling orbits (${sc.doubling} doubling sequences in all, the rest this repository's own derived orbits), ${sc.additive} are x ↦ x + 1.`));
    out.appendChild(el("p", "src", data.conclusion || ""));
    for (const s of data.scopes || []) for (const c of s.claims || []) {
      const d = el("details"); d.appendChild(el("summary", null, `${c.file} line ${c.line} — ${c.operation} on ${c.appliedTo} — ${c.survives ? "not refuted" : "refuted"} (${(c.votes || []).filter((v) => v && v.refuted).length} of ${(c.votes || []).length} refuters)`));
      d.appendChild(el("p", null, c.quote)); d.appendChild(el("p", "src", c.summary)); for (const v of c.votes || []) if (v) d.appendChild(el("p", "src", `refuter: ${v.refuted ? "refuted" : "stands"} — ${v.reason}`)); out.appendChild(d);
    }
    document.body.dataset.generator = String(t.claims == null ? 0 : t.claims);
  }

  // ── boot ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
  function defaultInputs() {
    const now = new Date(), tz = 5.5, local = new Date(now.getTime() + tz * 3600000);
    const pad = (n) => String(n).padStart(2, "0");
    $("date").value = `${local.getUTCFullYear()}-${pad(local.getUTCMonth() + 1)}-${pad(local.getUTCDate())}`;
    $("time").value = `${pad(local.getUTCHours())}:${pad(local.getUTCMinutes())}`;
    $("tz").value = String(tz);
    const q = new URLSearchParams(location.search);
    if (q.get("date")) $("date").value = q.get("date");
    if (q.get("time")) $("time").value = q.get("time");
    if (q.get("tz") && Number.isFinite(Number(q.get("tz")))) $("tz").value = q.get("tz");
  }
  function compute() {
    const jd = jdOfInputs();
    if (jd === null) { status("pick a date, a time and an offset", "refusal"); return; }
    try { renderSky(jd); status(`computed on this device for JD ${jd.toFixed(5)}`, "muted"); }
    catch (e) { status(`not computed: ${e && e.message ? e.message : e}`, "refusal"); document.body.dataset.sky = "error"; }
  }
  (async () => {
    defaultInputs();
    try { await loadRecord(); document.body.dataset.parampara = "ready"; }
    catch (e) { document.body.dataset.parampara = "unavailable"; status(`the paramparā record could not be read here (${e.message}); the corrected choices cannot be shown`, "refusal"); }
    $("sky-label").textContent = `${M.TIERS[SKY].labelSa} · ${M.TIERS[SKY].label}`;
    $("go").addEventListener("click", compute);
    for (const id of ["date", "time", "tz"]) $(id).addEventListener("change", compute);
    if (document.body.dataset.parampara === "ready") compute();
    try { applyData = await get("corpus/research/parampara-apply.json"); renderParampara(applyData); document.body.dataset.paramparaApply = "done"; if (document.body.dataset.sky === "done") compute(); }
    catch (e) { $("parampara-out").appendChild(el("p", "refusal", `corpus/research/parampara-apply.json could not be read: ${e.message}`)); document.body.dataset.paramparaApply = "missing"; }
    try { renderLedger(await get("corpus/research/derivations.json")); }
    catch (e) { $("ledger-out").appendChild(el("p", "refusal", `corpus/research/derivations.json could not be read: ${e.message}`)); document.body.dataset.ledger = "missing"; }
    try { renderTower(); } catch (e) { $("tower-note").textContent = `the tower table could not be computed: ${e.message}`; }
    try { renderGranthas(await get("corpus/research/library-sweep.json")); }
    catch (e) { $("granthas-out").appendChild(el("p", "refusal", `corpus/research/library-sweep.json could not be read: ${e.message}`)); document.body.dataset.granthas = "missing"; }
    try { renderGenerator(await get("corpus/research/generator-2-search.json")); }
    catch (e) { try { renderGenerator(null); } catch (_) { /* the orbits need the module */ } $("gen-search").appendChild(el("p", "refusal", `corpus/research/generator-2-search.json could not be read: ${e.message}`)); document.body.dataset.generator = "missing"; }
    document.body.dataset.ready = "1";
  })();
})();
