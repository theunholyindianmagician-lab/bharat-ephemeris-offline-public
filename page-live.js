/* page-live.js — (1) LegacyTier: the one tier helper every legacy page uses (index, panchang, museum, library, the
 * dashboard); (2) the live strip on pages that ask for it (<body data-page-live="strip">: library, the dashboard).
 *
 * THE TIERS (owner, 2026-10-08; the fourth 2026-10-09). Every page offers the choices of M.TIER_IDS, one code path each, through math-core's tier API:
 *   'ss+parameshvara' (the page default) · 'ss' (the plain Sūrya-Siddhānta) · 'drik' (Modern Bhāratīya: the owner's own
 *   series, 1850.0–2150.0, refused outside). The choice is the shared yantraState key 'tier' ('' = the page default),
 *   so a choice made on one page holds on every page. Every label shown here is read from M.TIERS — never re-typed —
 *   and no vendored foreign theory (VSOP87/ELP, Astronomy Engine) is called: those are referees in the tests only.
 */
(function (root) {
  "use strict";
  const M = root.ShunyaMath;
  if (!M || typeof M.panchangExtended !== "function" || !M.TIERS) return;

  // ── LegacyTier ──────────────────────────────────────────────────────────────────────────────────────────
  const doc = typeof document !== "undefined" ? document : null;
  const el = (tag, text, cls) => { const n = doc.createElement(tag); if (text !== undefined && text !== null) n.textContent = String(text); if (cls) n.className = cls; return n; };
  let linkProblem = null;
  // One yantraState per page: each M.yantraState() call makes a new state with its own cache and its own window
  // 'storage' listener, so the page keeps one (a choice made in another tab arrives through it).
  let ST = null;
  const st = () => ST || (ST = M.yantraState());

  /** The tier this page shows: the stored or linked choice, else the page default (M.pageTier). An unknown value in a
   *  crafted link is reported (problem()) and the default is shown; it is never stored (math-core R-15). */
  function current() {
    let raw = "";
    try { raw = st().get().tier; } catch (e) { raw = ""; }
    try { linkProblem = null; return M.pageTier(raw); }
    catch (e) { linkProblem = `गणना-तह '${raw}' अज्ञात — मूल चुनाव दिखाया गया / unknown tier '${raw}': the page default is shown`; return M.pageTier(""); }
  }
  const problem = () => linkProblem;
  function set(id) {
    const tier = M.resolveTier(id);
    st().set({ tier: tier === M.DEFAULT_TIER ? "" : tier });
    return tier;
  }
  const isRefusal = (e) => Boolean(e && e.code === "TIER_OUT_OF_SPAN");
  const T = (tier) => M.TIERS[M.resolveTier(tier)];
  /** "सूर्य-सिद्धान्त + परमेश्वर-संस्कार / Sūrya-Siddhānta + Parameśvara's saṃskāra" */
  const name = (tier) => `${T(tier).labelSa} / ${T(tier).label}`;
  /** A short tag for dense rows (the Devanāgarī label). */
  const short = (tier) => T(tier).labelSa;
  /** The measured agreement of the dṛk tier as the repository's tests state it (M.TIERS.drik), never computed here. */
  const measured = () => `${M.TIERS.drik.span.accuracyMeasured} (${M.TIERS.drik.span.years[0]}.0–${M.TIERS.drik.span.years[1]}.0)`;

  /** The tier's labels as [key, value] rows, every value from M.TIERS (and, for the ayanāṃśa, the value the tier applies
   *  at jd — the same function every frame of the tier uses). */
  function labels(tier, jd) {
    const id = M.resolveTier(tier), t = M.TIERS[id], rows = [];
    rows.push(["गणना-तह / tier", `${t.labelSa} / ${t.label}`]);
    rows.push(["इंजन / engine", t.engine]);
    if (t.reduction) rows.push(["संस्कार-क्रिया / reduction", t.reduction]);
    let ay = null;
    if (Number.isFinite(jd)) { try { ay = M.tierAyanamsha(jd, id); } catch (e) { if (!isRefusal(e)) throw e; } }
    rows.push(["अयनांश / ayanāṃśa", `${t.ayanamsha.name}${ay ? ` = ${ay.deg.toFixed(6)}°` : ""} — ${t.ayanamsha.source}`]);
    rows.push(["काल / time", t.time]);
    rows.push(["सूर्योदय / sunrise", t.sunrise]);
    if (t.moonrise) rows.push(["चन्द्रोदय / moonrise", t.moonrise]);
    rows.push(["दिन-सीमा / day boundary", t.dayBoundary]);
    rows.push(["करण-क्रम / karaṇa order", t.karanaOrder]);
    rows.push(["मास / month", t.month]);
    rows.push(["वर्षारम्भ / year start", t.yearStart]);
    rows.push(["संवत्सर / saṃvatsara", t.samvatsara]);
    rows.push(["अहर्गण / ahargaṇa", t.ahargana]);
    const s = t.span;
    rows.push(["सीमा / span", t.family === "drik"
      ? `${s.years[0]}.0–${s.years[1]}.0 (${s.yearRule}); ${s.basis}; बाहर अस्वीकृत / refused outside. Measured in the repository's tests: ${s.accuracyMeasured}`
      : `${s.years[0]}…+${s.years[1]} वर्ष / years — ${s.basis}`]);
    rows.push(["स्रोत / provenance", t.provenance]);
    if (t.samskara && root.SSTier && typeof root.SSTier.correction === "function") {
      try { const c = root.SSTier.correction(t.samskara); if (c && c.caption) rows.push(["संस्कार / saṃskāra (the record)", c.caption]); } catch (e) { /* the record is shown by the caller's error path */ }
    }
    return rows;
  }
  /** Fill a container with the tier's labels (a <details>, collapsed). textContent only. */
  function renderLabels(container, tier, jd, summaryText) {
    if (!container || !doc) return;
    const d = el("details"); d.className = "tier-labels"; d.dataset.tier = M.resolveTier(tier);
    d.appendChild(el("summary", summaryText || `गणना-तह के नियम / the tier's rules · ${short(tier)}`));
    const dl = el("dl"); dl.style.cssText = "margin:6px 0 0;font-size:.74rem;line-height:1.55;color:var(--soft,#b9c3c7);overflow-wrap:anywhere";
    for (const [k, v] of labels(tier, jd)) { const dt = el("dt", k); dt.style.cssText = "color:var(--gold,#EAC97B);font-weight:700;margin-top:4px"; dl.appendChild(dt); const dd = el("dd", v); dd.style.margin = "0 0 0 10px"; dl.appendChild(dd); }
    d.appendChild(dl);
    container.replaceChildren(d);
  }
  /** The refusal of the dṛk tier, said plainly, with the two text tiers offered as buttons. */
  function renderRefusal(container, err, onPick) {
    if (!container || !doc) return;
    const box = el("div"); box.className = "tier-refusal"; box.setAttribute("role", "status");
    box.style.cssText = "margin:8px 0;padding:10px 12px;border:1px solid rgba(232,149,91,.6);border-radius:8px;background:rgba(40,20,8,.55);color:#f3d2b5;font-size:.8rem;line-height:1.55";
    box.appendChild(el("b", `${M.TIERS.drik.labelSa} इस तिथि पर अस्वीकृत / refused for this date`));
    box.appendChild(el("div", err && err.message ? err.message : String(err)));
    box.appendChild(el("div", `यह तह केवल ${M.TIERS.drik.span.years[0]}.0–${M.TIERS.drik.span.years[1]}.0 में हमारी अपनी श्रेणी से गणित है; बाहर कोई विदेशी सिद्धान्त नहीं भरा जाता। पाठ-तह चुनें / choose a text tier:`));
    const row = el("div"); row.style.cssText = "display:flex;gap:8px;flex-wrap:wrap;margin-top:6px";
    for (const id of M.TIER_IDS.filter((x) => M.TIERS[x].family === "ss")) {
      const b = el("button", name(id)); b.type = "button"; b.dataset.tier = id; b.className = "btn-ghost2";
      b.style.cssText = "font-size:.74rem;padding:4px 10px;border-radius:999px;cursor:pointer";
      b.addEventListener("click", () => { set(id); if (typeof onPick === "function") onPick(id); });
      row.appendChild(b);
    }
    box.appendChild(row);
    container.replaceChildren(box);
    container.hidden = false;
  }
  /** Populate a <select> with the three choices (labels from M.TIERS), select the page's tier, and call onChange(id)
   *  after a choice (stored on the shared bus). Also follows a choice made in another tab. */
  function mountSelect(select, onChange) {
    if (!select || !doc) return null;
    select.replaceChildren(...M.TIER_IDS.map((id) => { const o = el("option", `${M.TIERS[id].labelSa} / ${M.TIERS[id].label}${M.TIERS[id].default ? " (मूल / default)" : ""}`); o.value = id; return o; }));
    select.value = current();
    if (!select.getAttribute("aria-label")) select.setAttribute("aria-label", "गणना-तह / tier");
    // One path for every change — this select, a refusal's text-tier button, another tab: the shared state's listener
    // syncs the select and recomputes once.
    let last = select.value, listening = false;
    try {
      st().on(() => { const now = current(); if (now !== last) { last = now; select.value = now; if (typeof onChange === "function") onChange(now); } });
      listening = true;
    } catch (e) { /* no listener: the change handler below recomputes itself */ }
    select.addEventListener("change", () => {
      const id = set(select.value);
      if (!listening && id !== last) { last = id; if (typeof onChange === "function") onChange(id); }
    });
    return select;
  }
  /** One signed date parser for a page's text inputs (inputmode='text'): "[-]YYYY…-MM-DD", astronomical years (0 = 1 BCE),
   *  proleptic Gregorian or Julian; the text tiers accept −50,000…+50,000 (SSTier.SPAN_YEARS / M.TIERS.ss.span). */
  function parseCivil(text, calendar) {
    const m = /^\s*([+-]?)(\d{1,6})-(\d{1,2})-(\d{1,2})\s*$/.exec(String(text == null ? "" : text));
    if (!m) throw new RangeError(`तिथि '${text}' — रूप [-]YYYY-MM-DD (खगोलीय वर्ष: 0 = 1 BCE) / date must be [-]YYYY-MM-DD (astronomical years)`);
    const year = (m[1] === "-" ? -1 : 1) * Number(m[2]), month = Number(m[3]), day = Number(m[4]);
    const span = M.TIERS.ss.span.years;
    if (year < span[0] || year > span[1]) throw new RangeError(`वर्ष ${year} पाठ-तह की सीमा ${span[0]}…+${span[1]} से बाहर / year ${year} is outside the text tiers' span ${span[0]}…+${span[1]}`);
    const cal = calendar === "julian" ? "julian" : "gregorian";
    return { calendar: cal, year, month, day };
  }
  /** "[-]YYYY-MM-DD" of a civil date (signed, at least four digits). */
  const isoOf = (c) => `${c.year < 0 ? "-" : ""}${String(Math.abs(c.year)).padStart(4, "0")}-${String(c.month).padStart(2, "0")}-${String(c.day).padStart(2, "0")}`;

  root.LegacyTier = Object.freeze({ current, set, problem, isRefusal, name, short, measured, labels, renderLabels, renderRefusal, mountSelect, parseCivil, isoOf });

  // ── the live strip (library, the dashboard) ─────────────────────────────────────────────────────────────
  if (!doc || !doc.body || doc.body.getAttribute("data-page-live") !== "strip") {
    if (doc && doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", () => { if (doc.body.getAttribute("data-page-live") === "strip") bootStrip(); });
    return;
  }
  bootStrip();

  function bootStrip() {
    if (doc.getElementById("page-live-strip") && doc.getElementById("page-live-strip").dataset.booted === "1") return;
    const TZ = 5.5, LAT = 23.1765, LON = 75.7885;
    let lastP = null;

    function state() {
      const now = Date.now(), jd = now / 86400000 + 2440587.5, tier = current();
      const civil = M.jdToCivil(jd, TZ, "gregorian");
      const hms = `${String(civil.hour).padStart(2, "0")}:${String(civil.minute).padStart(2, "0")}:${String(civil.second).padStart(2, "0")}`;
      return { date: civil.iso, time: hms, jd, tier, p: M.panchangExtended(jd, LAT, LON, TZ, tier) };
    }

    function ensureStrip() {
      let box = doc.getElementById("page-live-strip");
      if (box) return box;
      box = doc.createElement("div");
      box.id = "page-live-strip";
      box.setAttribute("aria-live", "polite");
      box.style.cssText = "position:relative;z-index:2;margin:8px auto 0;width:min(1280px,calc(100% - 24px));display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:8px;font:700 .72rem ui-monospace,monospace";
      const cells = [
        ["pls-civil", "CIVIL"], ["pls-tithi", "TITHI"], ["pls-nak", "NAKSHATRA"], ["pls-ghati", "GHATI · civil clock"],
        ["pls-ishta", "इष्ट · from sunrise"], ["pls-lagna", "LAGNA"], ["pls-seal", "SEAL"], ["pls-loc", "OBSERVER"],
      ];
      for (const [id, label] of cells) {
        const c = doc.createElement("div");
        c.style.cssText = "border:1px solid rgba(234,201,123,.22);background:rgba(8,13,25,.88);padding:8px 10px";
        const s = el("span", label); s.style.cssText = "display:block;color:#94a3ab;letter-spacing:.08em";
        const b = el("strong", "—"); b.id = id; b.style.color = "#f5d68b";
        c.append(s, b);
        box.appendChild(c);
      }
      const tierCell = doc.createElement("div");
      // a block of its own, full width, also where a page restyles the strip's cells as inline flex items (library, the
      // dashboard): the select and the labels stay inside the viewport at 390 px instead of running off to the right
      tierCell.style.cssText = "border:1px solid rgba(234,201,123,.22);background:rgba(8,13,25,.88);padding:8px 10px;grid-column:1/-1;display:block;flex:1 1 100%;min-width:0;max-width:100%;box-sizing:border-box;text-align:left";
      const lab = el("label", "गणना-तह / tier "); lab.style.cssText = "display:block;color:#94a3ab;letter-spacing:.06em";
      const sel = doc.createElement("select"); sel.id = "pls-tier"; sel.style.cssText = "display:block;width:100%;max-width:100%;margin-top:4px;font:600 .72rem ui-monospace,monospace";
      lab.appendChild(sel);
      const labelsBox = el("div"); labelsBox.id = "pls-tier-labels";
      const refusal = el("div"); refusal.id = "pls-refusal"; refusal.hidden = true;
      tierCell.append(lab, labelsBox, refusal);
      box.appendChild(tierCell);
      const nav = doc.querySelector(".bharat-nav");
      if (nav && nav.nextSibling) nav.parentNode.insertBefore(box, nav.nextSibling);
      else doc.body.insertBefore(box, doc.body.firstChild);
      return box;
    }

    const setText = (id, v) => { const n = doc.getElementById(id); if (n) n.textContent = v; };
    let lastLabelKey = "";

    function paint() {
      let s;
      try { s = state(); }
      catch (e) {
        if (!isRefusal(e)) throw e;
        renderRefusal(doc.getElementById("pls-refusal"), e, () => paint());
        for (const id of ["pls-tithi", "pls-nak", "pls-ishta", "pls-lagna", "pls-seal"]) setText(id, "—");
        lastP = null;
        // the refused tier's labels, and the refusal handed on: a page that shows the strip's values (the dashboard
        // HUD) clears them too, so no other tier's values stay beside the refusal
        const tier = current(), jd = Date.now() / 86400000 + 2440587.5, key = `${tier}|refused|${Math.floor(jd)}`;
        if (key !== lastLabelKey) { lastLabelKey = key; renderLabels(doc.getElementById("pls-tier-labels"), tier, jd); }
        const strip = doc.getElementById("page-live-strip"); if (strip) strip.dataset.tier = tier;
        if (typeof root.dispatchEvent === "function" && typeof root.CustomEvent === "function") root.dispatchEvent(new root.CustomEvent("page-live", { detail: { tier, jd, p: null, refused: e } }));
        return null;
      }
      const ref = doc.getElementById("pls-refusal"); if (ref) { ref.hidden = true; ref.replaceChildren(); }
      const p = s.p;
      lastP = p;
      setText("pls-civil", s.date + " · " + s.time);
      setText("pls-tithi", (p.paksha || "") + " " + (p.tithiName || "—") + (p.masaName ? " · " + p.masaName : ""));
      setText("pls-nak", (p.nakshatraName || "—") + " · " + (p.nakshatraPada || ""));
      setText("pls-ghati", p.ghati + " / 60 · " + p.vighati);
      setText("pls-ishta", p.ishta ? `${p.ishta.ghati} घटी ${p.ishta.pala} पल` : "—");
      const ishtaEl = doc.getElementById("pls-ishta"); if (ishtaEl) ishtaEl.title = p.ishta ? p.ishta.unit : "";
      setText("pls-lagna", Number(p.lagna).toFixed(2) + "° · " + (p.lagnaRashiSa || ""));
      setText("pls-seal", M.paniniHash(s.date + "|" + p.tithiIndex + "|" + p.nakshatraIndex, 8));
      const key = `${s.tier}|${Math.floor(s.jd)}`;
      if (key !== lastLabelKey) { lastLabelKey = key; renderLabels(doc.getElementById("pls-tier-labels"), s.tier, s.jd); }
      const strip = doc.getElementById("page-live-strip"); if (strip) strip.dataset.tier = s.tier;
      if (root.FieldGL && root.FieldGL.push) root.FieldGL.push({ ghati: p.ghati, vighati: p.vighati, tithi: p.tithiIndex, nak: p.nakshatraIndex, masa: p.sauraMasaIndex });
      if (typeof root.dispatchEvent === "function" && typeof root.CustomEvent === "function") root.dispatchEvent(new root.CustomEvent("page-live", { detail: { tier: s.tier, jd: s.jd, p } }));
      return p;
    }

    function tickClock() {
      const now = Date.now(), civil = M.jdToCivil(now / 86400000 + 2440587.5, TZ, "gregorian");
      setText("pls-civil", `${civil.iso} · ${String(civil.hour).padStart(2, "0")}:${String(civil.minute).padStart(2, "0")}:${String(civil.second).padStart(2, "0")}`);
      const ms = (now + TZ * 3600000) % 86400000;
      setText("pls-ghati", Math.floor(ms / 1440000) + " / 60 · " + Math.floor((ms % 1440000) / 24000));
    }

    const box = ensureStrip();
    box.dataset.booted = "1";
    mountSelect(doc.getElementById("pls-tier"), () => { lastLabelKey = ""; paint(); });
    if (problem()) setText("pls-loc", problem());
    // Fixed observer for every value on this strip — honest disclosure, set once.
    else setText("pls-loc", "उज्जयिनी " + LAT.toFixed(2) + "°N " + LON.toFixed(2) + "°E");
    paint();
    setInterval(paint, 1000);
    setInterval(tickClock, 250);
    root.PageLive = Object.freeze({ paint, last: () => lastP });
  }
})(typeof globalThis !== "undefined" ? globalThis : this);
