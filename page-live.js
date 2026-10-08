(function (root) {
  "use strict";
  const M = root.ShunyaMath;
  if (!M || typeof M.panchangExtended !== "function") return;
  if (root.LiveBoard) return;

  const path = (typeof location !== "undefined" && location.pathname) || "";
  if (/museum\.html|panchang\.html|shunyabheda\.html/i.test(path)) return;

  const TZ = 5.5;
  const LAT = 23.1765;
  const LON = 75.7885;

  function state() {
    const utc = new Date(Date.now() + TZ * 3600000);
    const date = utc.toISOString().slice(0, 10);
    const time = utc.toISOString().slice(11, 19);
    const jd = M.gregorianToJulianDay(date, time, TZ);
    return { date: date, time: time, p: M.panchangExtended(jd, LAT, LON, TZ) };
  }

  function ensureStrip() {
    let el = document.getElementById("page-live-strip");
    if (el) return el;
    el = document.createElement("div");
    el.id = "page-live-strip";
    el.setAttribute("aria-live", "polite");
    el.style.cssText = "position:relative;z-index:2;margin:8px auto 0;width:min(1280px,calc(100% - 24px));display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:8px;font:700 .72rem ui-monospace,monospace";
    el.innerHTML = [
      ["pls-civil", "CIVIL"],
      ["pls-tithi", "TITHI"],
      ["pls-nak", "NAKSHATRA"],
      ["pls-ghati", "GHATI"],
      ["pls-lagna", "LAGNA"],
      ["pls-seal", "SEAL"],
      ["pls-loc", "OBSERVER"]
    ].map(function (row) {
      return "<div style='border:1px solid rgba(234,201,123,.22);background:rgba(8,13,25,.88);padding:8px 10px'><span style='display:block;color:#94a3ab;letter-spacing:.08em'>" + row[1] + "</span><strong id='" + row[0] + "' style='color:#f5d68b'>—</strong></div>";
    }).join("");
    const nav = document.querySelector(".bharat-nav");
    if (nav && nav.nextSibling) nav.parentNode.insertBefore(el, nav.nextSibling);
    else document.body.insertBefore(el, document.body.firstChild);
    return el;
  }

  function set(id, v) {
    const n = document.getElementById(id);
    if (n) n.textContent = v;
  }

  function paint() {
    const s = state();
    const p = s.p;
    set("pls-civil", s.date + " · " + s.time);
    set("pls-tithi", (p.paksha || "") + " " + (p.tithiName || "—"));
    set("pls-nak", (p.nakshatraName || "—") + " · " + (p.nakshatraPada || ""));
    set("pls-ghati", p.ghati + " / 60 · " + p.vighati);
    set("pls-lagna", Number(p.lagna).toFixed(2) + "° · " + (p.lagnaRashiSa || ""));
    set("pls-seal", M.paniniHash(s.date + "|" + p.tithiIndex + "|" + p.nakshatraIndex, 8));
    if (root.FieldGL && root.FieldGL.push) {
      root.FieldGL.push({
        ghati: p.ghati,
        vighati: p.vighati,
        tithi: p.tithiIndex,
        nak: p.nakshatraIndex,
        masa: p.sauraMasaIndex
      });
    }
    return p;
  }

  function tickClock() {
    const utc = new Date(Date.now() + TZ * 3600000);
    const ms = (Date.now() + TZ * 3600000) % 86400000;
    set("pls-civil", utc.toISOString().slice(0, 10) + " · " + utc.toISOString().slice(11, 19));
    set("pls-ghati", Math.floor(ms / 1440000) + " / 60 · " + Math.floor((ms % 1440000) / 24000));
  }

  function boot() {
    ensureStrip();
    // Fixed observer for every value on this strip — honest disclosure, set once.
    set("pls-loc", "उज्जयिनी " + LAT.toFixed(2) + "°N " + LON.toFixed(2) + "°E");
    paint();
    setInterval(paint, 1000);
    setInterval(tickClock, 250);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})(typeof globalThis !== "undefined" ? globalThis : this);
