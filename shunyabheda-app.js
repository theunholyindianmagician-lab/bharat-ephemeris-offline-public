(function runShunyabhedaLab(M) {
  "use strict";

  if (!M) throw new Error("math-core.js did not load");

  window.toggleSectionCollapse = function(btn) {
    const panel = btn.closest(".panel");
    if (!panel) return;
    const isCollapsed = panel.classList.toggle("is-collapsed");
    btn.textContent = isCollapsed ? "+ Expand Section" : "— Minimize";
    btn.style.background = isCollapsed ? "var(--gold)" : "rgba(234, 201, 123, 0.12)";
    btn.style.color = isCollapsed ? "#03060e" : "var(--gold)";
  };

  window.toggleAllSections = function(expand) {
    document.querySelectorAll(".panel").forEach(panel => {
      const btn = panel.querySelector(".btn-panel-minimize");
      if (expand) {
        panel.classList.remove("is-collapsed");
        if (btn) {
          btn.textContent = "— Minimize";
          btn.style.background = "rgba(234, 201, 123, 0.12)";
          btn.style.color = "var(--gold)";
        }
      } else {
        panel.classList.add("is-collapsed");
        if (btn) {
          btn.textContent = "+ Expand Section";
          btn.style.background = "var(--gold)";
          btn.style.color = "#03060e";
        }
      }
    });
  };

  const $ = (id) => document.getElementById(id);

  // ── Shared देवनागरी graha-lookup (§C8) — one map for every lowercase-Latin key ──
  const GRAHA_DEV = Object.freeze({
    sun: "सूर्यः", moon: "चन्द्रः", mars: "मङ्गलः", mercury: "बुधः", jupiter: "गुरुः",
    venus: "शुक्रः", saturn: "शनिः", rahu: "राहुः", ketu: "केतुः",
    surya: "सूर्यः", candra: "चन्द्रः", mangala: "मङ्गलः", budha: "बुधः",
    guru: "गुरुः", shukra: "शुक्रः", shani: "शनिः",
  });
  const grahaDev = (k) => GRAHA_DEV[k] || k;

  // देवनागरी अंक-रूपान्तर (display only — value अपरिवर्तित)
  const DEV_DIGITS = { "0": "०", "1": "१", "2": "२", "3": "३", "4": "४", "5": "५", "6": "६", "7": "७", "8": "८", "9": "९" };
  const devNum = (s) => String(s).replace(/[0-9]/g, (d) => DEV_DIGITS[d]);

  // तिथि पञ्चक-वर्ग (classical five-fold tithi classes) — index (tithi-1) % 5
  const TITHI_PANCHAKA = Object.freeze(["नन्दा", "भद्रा", "जया", "रिक्ता", "पूर्णा"]);
  // त्याज्य (inauspicious) yogas per muhūrta-śāstra — display caution only (v1 score untouched)
  const TYAJYA_YOGAS = Object.freeze(["व्यतीपात", "वैधृति", "शूल", "परिघ", "गण्ड", "अतिगण्ड", "व्याघात"]);

  const controls = {
    date: $("date"),
    time: $("time"),
    timezone: $("timezone"),
    latitude: $("latitude"),
    longitude: $("longitude"),
    calendar: $("calendar"),
    tier: $("tier"),
  };

  /* ══════════════════════════════════════════════════════════════════════
     THE TIERS (owner, 2026-10-08; the fourth, the Kerala paramparā, 2026-10-09) — one choice drives every panel.
     The choices, their labels and their spans are math-core's (M.TIERS, M.TIER_IDS, M.resolveTier, M.pageTier); this
     page re-types none of them. A stored or linked tier the engine refuses is reported (not silently replaced).
     ══════════════════════════════════════════════════════════════════════ */
  const TEXT_SPAN = M.TIERS.ss.span.years;            // the span the text tiers are tested over (astronomical years)
  const CALENDARS = Object.freeze({ gregorian: "Gregorian (proleptic)", julian: "Julian (proleptic)" });
  let linkedTierText = null;                           // a tier from the link/storage that did not resolve (reported)
  let tierExplicit = false;                            // the visitor chose a tier (stored); otherwise '' = page default

  function populateTierSelect() {
    const select = controls.tier;
    if (!select) return;
    select.replaceChildren();
    for (const id of M.TIER_IDS) {
      const T = M.TIERS[id];
      const option = document.createElement("option");
      option.value = id;
      const span = T.family === "drik" ? `${T.span.years[0]}–${T.span.years[1]} only` : `${T.span.years[0]} … ${T.span.years[1]}`;
      option.textContent = `${T.labelSa} · ${T.label}${T.default ? " — default" : ""} (${span})`;
      select.appendChild(option);
    }
  }

  /** The chosen tier ('ss+parameshvara' | 'ss' | 'drik'), or a RangeError for a tier the engine does not know. */
  function selectedTier() {
    if (linkedTierText !== null) return M.resolveTier(linkedTierText);
    return M.resolveTier(controls.tier.value);
  }

  function tierTitle(tier) {
    const T = M.TIERS[tier];
    return `${T.labelSa} · ${T.label}`;
  }

  function engineDescription(tier) {
    return tierTitle(tier);
  }

  /* ── one signed date parser for every date on the page (Instrument, gochara, muhūrta start) ──
     YYYY-MM-DD with an astronomical year (0 = 1 BCE, −49000 = 49001 BCE), in the Instrument's calendar (proleptic
     Gregorian or Julian), checked by kala-dvara.js through M.civilToJd — no Date object, so years 0–99 and five-digit
     years are what they say. */
  const DATE_RE = /^\s*(-?\d{1,5})-(\d{1,2})-(\d{1,2})\s*$/;
  class InputError extends Error {}
  function selectedCalendar() {
    const c = controls.calendar ? controls.calendar.value : "gregorian";
    if (!Object.prototype.hasOwnProperty.call(CALENDARS, c)) throw new InputError(`Unknown calendar '${c}'`);
    return c;
  }
  function parseCivilDate(text, calendar, what) {
    const m = DATE_RE.exec(String(text == null ? "" : text));
    if (!m) throw new InputError(`${what}: write YYYY-MM-DD with an astronomical year (${TEXT_SPAN[0]} … ${TEXT_SPAN[1]}; 0 = 1 BCE), e.g. 2026-10-08 or -3101-01-23.`);
    const year = Number(m[1]) + 0, month = Number(m[2]), day = Number(m[3]);
    if (year < TEXT_SPAN[0] || year > TEXT_SPAN[1]) throw new InputError(`${what}: year ${year} is outside ${TEXT_SPAN[0]} … ${TEXT_SPAN[1]}, the span the text tiers are tested over.`);
    if (month < 1 || month > 12) throw new InputError(`${what}: month ${month} is not 1–12.`);
    const civil = { calendar, year, month, day };
    try { M.civilToJd(civil, "12:00:00", 0); }
    catch (error) { throw new InputError(`${what}: ${error.message} (${CALENDARS[calendar]}).`); }
    return civil;
  }
  const isoOf = (c) => `${c.year < 0 ? "-" : ""}${String(Math.abs(c.year)).padStart(4, "0")}-${String(c.month).padStart(2, "0")}-${String(c.day).padStart(2, "0")}`;
  /** "Gregorian 2026-10-08 = Julian 2026-09-25 · 2026 CE (astronomical year 2026)" — the other calendar and the BCE form. */
  function dateHelperText(civil) {
    const other = civil.calendar === "gregorian" ? "julian" : "gregorian";
    const o = M.jdToCivil(M.civilToJd(civil, "12:00:00", 0), 0, other);
    const era = civil.year <= 0 ? `${1 - civil.year} BCE` : `${civil.year} CE`;
    return `${CALENDARS[civil.calendar]} ${isoOf(civil)} = ${CALENDARS[other]} ${o.iso} · ${era} (astronomical year ${civil.year})`;
  }
  function setHelper(id, text, isError) {
    const el = $(id);
    if (!el) return;
    el.textContent = text || "";
    el.style.color = isError ? "var(--red)" : "";
  }
  /** A JD (UT) → the local civil date in the Instrument's calendar, signed ISO. */
  function fmtDate(jd, tz, calendar) {
    return M.julianDayToIsoDate(jd, tz, calendar);
  }
  function fmtDateTime(jd, tz, calendar) {
    if (!Number.isFinite(jd)) return "—";
    const c = M.jdToCivil(jd, tz, calendar);
    return `${c.iso} ${String(c.hour).padStart(2, "0")}:${String(c.minute).padStart(2, "0")}:${String(c.second).padStart(2, "0")}`;
  }
  function fmtClock(jd, tz) {
    if (!Number.isFinite(jd)) return "—";
    const c = M.jdToCivil(jd, tz, "gregorian");
    return `${String(c.hour).padStart(2, "0")}:${String(c.minute).padStart(2, "0")}:${String(c.second).padStart(2, "0")}`;
  }
  /** The instant "now" (the device clock) as a civil date and clock in the Instrument's zone and calendar. */
  function nowInZone(tz, calendar) {
    const jdNow = Date.now() / 86400000 + 2440587.5;
    const c = M.jdToCivil(jdNow, tz, calendar);
    return { date: c.iso, time: `${String(c.hour).padStart(2, "0")}:${String(c.minute).padStart(2, "0")}:${String(c.second).padStart(2, "0")}` };
  }
  const FEATURED_VARGAS = new Set(["D1", "D9", "D10", "D60"]);


  const VARGA_GRAHA_LABELS = {
    surya: "सू", candra: "च", mangala: "म", budha: "बु", guru: "गु",
    shukra: "शु", shani: "श", rahu: "रा", ketu: "के",
  };

  const VARGA_REGIONS = [
    { poly: "50,0 38,38 62,38", box: [41, 6, 18, 27] },
    { poly: "0,50 38,38 38,46", box: [5, 39.5, 28, 6] },
    { poly: "0,50 38,46 38,54", box: [5, 46, 28, 8] },
    { poly: "0,50 38,54 38,62", box: [5, 54.5, 28, 6] },
    { poly: "50,100 38,62 62,62", box: [41, 67, 18, 27] },
    { poly: "100,50 62,54 62,62", box: [67, 54.5, 28, 6] },
    { poly: "100,50 62,46 62,54", box: [67, 46, 28, 8] },
    { poly: "100,50 62,38 62,46", box: [67, 39.5, 28, 6] },
    { rect: [38, 38, 12, 12], box: [39, 38, 10, 12] },
    { rect: [50, 38, 12, 12], box: [51, 38, 10, 12] },
    { rect: [50, 50, 12, 12], box: [51, 50, 10, 12] },
    { rect: [38, 50, 12, 12], box: [39, 50, 10, 12] },
  ];

  /* ══════════════════════════════════════════════════════════════════════
     LOCAL COMPUTE STUDIO & SNIPPET STATE
     ══════════════════════════════════════════════════════════════════════ */
  let activeSnippetLang = "curl";

  function setSnippetLang(lang) {
    activeSnippetLang = lang;
    const langs = ["curl", "python", "nodejs", "go"];
    langs.forEach((l) => {
      const btn = $(`btn-${l}`);
      if (!btn) return;
      if (l === lang) {
        btn.style.background = "var(--gold)";
        btn.style.color = "#03060e";
        btn.style.border = "none";
        btn.style.fontWeight = "700";
      } else {
        btn.style.background = "transparent";
        btn.style.color = "var(--soft)";
        btn.style.border = "1px solid var(--line)";
        btn.style.fontWeight = "normal";
      }
    });
    updateCodeSnippet();
  }

  function getActiveApiParams() {
    let tier = "";
    try { tier = selectedTier(); } catch (error) { tier = String(linkedTierText || controls.tier.value); }
    const m = DATE_RE.exec(controls.date.value || "");
    return {
      date: controls.date.value || "",
      year: m ? Number(m[1]) + 0 : NaN, month: m ? Number(m[2]) : NaN, day: m ? Number(m[3]) : NaN,
      calendar: controls.calendar ? controls.calendar.value : "gregorian",
      time: controls.time.value || "12:00:00",
      tz: controls.timezone.value || "5.5",
      lat: controls.latitude.value || "23.1765",
      lon: controls.longitude.value || "75.7885",
      tier,
    };
  }

  function buildEndpointUrl() {
    const methodSelect = $("apiMethod");
    const method = methodSelect ? methodSelect.value : "sphuta";
    const p = getActiveApiParams();
    if (method === "panchang") return `ShunyaMath.panchangAtJd(jd, ${p.tz}, "${p.tier}", { latitude: ${p.lat}, longitude: ${p.lon} })`;
    if (method === "quant") return "ShunyaMath.computeAspects(planets)";
    return `ShunyaMath.canonicalGrahaModel(jd, { mode: "${p.tier}" })`;
  }

  function updateCodeSnippet() {
    const p = getActiveApiParams();
    const snippetEl = $("apiCodeSnippet");
    if (!snippetEl) return;
    const method = $("apiMethod") ? $("apiMethod").value : "sphuta";
    const calculation = method === "panchang"
      ? `const result = ShunyaMath.panchangAtJd(jd, ${p.tz}, "${p.tier}", { latitude: ${p.lat}, longitude: ${p.lon} });`
      : `const rows = ShunyaMath.canonicalGrahaModel(jd, { mode: "${p.tier}" });\nconst result = ${method === "quant" ? "ShunyaMath.computeAspects(rows)" : "rows"};`;
    // an unparsed date is said so in the snippet, never printed as NaN
    const civil = Number.isFinite(p.year) ? `{ calendar: "${p.calendar}", year: ${p.year}, month: ${p.month}, day: ${p.day} }` : "/* the Date field above is not a YYYY-MM-DD date */";
    const localJs = `const jd = ShunyaMath.civilToJd(${civil}, "${p.time}", ${p.tz});\n${calculation}\nconsole.log(result);`;
    let code = localJs;
    if (activeSnippetLang === "python") {
      code = `# Local engine is JavaScript in this page.\n# ShunyaMath.canonicalGrahaModel(jd)\n\n${localJs}`;
    } else if (activeSnippetLang === "nodejs") {
      code = `// Local ShunyaMath — no HTTP\n${localJs}`;
    } else if (activeSnippetLang === "go") {
      code = `// Local engine is JavaScript in this page.\n// ShunyaMath.canonicalGrahaModel(jd)\n\n${localJs}`;
    }
    const codeEl = snippetEl.querySelector("code") || snippetEl;
    codeEl.textContent = code;
  }

  function setEngineStatus(ok, message) {
    const el = $("apiEngineStatus");
    if (el) {
      el.textContent = ok ? "OK" : "ERROR";
      el.style.color = ok ? "var(--green)" : "var(--red)";
    }
    if (!ok) {
      const latEl = $("apiLatency");
      if (latEl) latEl.textContent = "—";
      const viewer = $("apiResponseViewer");
      if (viewer) {
        const codeEl = viewer.querySelector("code") || viewer;
        codeEl.textContent = JSON.stringify({
          status: "error",
          engine: "ShunyaMath local engine",
          error: message,
        }, null, 2);
      }
    }
  }

  // Real determinism check: compute the tier's model twice and compare the
  // serialized bytes. No hardcoded PASS — both branches are reachable.
  function computeBitwiseDeterminism(jd, tier) {
    if (typeof M.canonicalGrahaModel !== "function") return false;
    const runA = JSON.stringify(M.canonicalGrahaModel(jd, { mode: tier }));
    const runB = JSON.stringify(M.canonicalGrahaModel(jd, { mode: tier }));
    return runA === runB;
  }

  function runLiveApiQuery() {
    try {
      const urlInput = $("apiEndpointUrl");
      if (urlInput) urlInput.value = buildEndpointUrl();
      updateCodeSnippet();
      runLiveApiQueryCore();
      setEngineStatus(true, "");
    } catch (error) {
      setEngineStatus(false, error instanceof Error ? error.message : String(error));
    }
  }

  /** The labels of a tier, as the API studio returns them (read from M.TIERS). */
  function tierRulesPayload(tier) {
    const T = M.TIERS[tier];
    return { id: tier, label: T.label, label_sa: T.labelSa, engine: T.engine, sunrise: T.sunrise, day_boundary: T.dayBoundary,
      karana_order: T.karanaOrder, month: T.month, year_start: T.yearStart, samvatsara: T.samvatsara, ahargana: T.ahargana,
      dasha_year: { days: T.dashaYear.days, source: T.dashaYear.source }, span_years: T.span.years.slice(), span_basis: T.span.basis,
      accuracy_measured: T.span.accuracyMeasured || null, provenance: T.provenance };
  }

  function runLiveApiQueryCore() {
    const tStart = performance.now();
    const methodSelect = $("apiMethod");
    const method = methodSelect ? methodSelect.value : "sphuta";

    const ctx = readInstrument();
    const { timezone, latitude, longitude, tier, jd, site } = ctx;
    const ay = M.tierAyanamsha(jd, tier);
    const sayanaAscendant = M.sayanaAscendantDeg(jd, latitude, longitude, tier);
    const siderealAscendant = M.siderealAscendantDeg(jd, latitude, longitude, tier);
    const planets = canonicalGrahaRows(jd, tier);
    const velocities = M.computePlanetaryVelocities ? M.computePlanetaryVelocities(jd, { mode: tier }) : [];

    let payload = {};

    if (method === "sphuta") {
      const sphutaDict = {};
      planets.forEach((g) => {
        const vel = velocities.find((v) => v.key === g.key);
        if (!vel || !Number.isFinite(vel.speedDegDay)) {
          throw new Error(`Velocity data unavailable for ${g.en} — computePlanetaryVelocities export missing; refusing to substitute fake speeds.`);
        }
        const signIdx = M.signIndex(g.longitude);
        const within = M.mod360(g.longitude) - signIdx * 30;
        const nak = M.computeNakshatraDetails(g.longitude);

        sphutaDict[g.en] = {
          canonical_deg: Number(g.longitude.toFixed(6)),
          mean_deg: g.mean === null ? null : Number(M.mod360(g.mean).toFixed(6)),
          rashi: M.RASHIS[signIdx],
          rashi_deg: Number(within.toFixed(4)),
          nakshatra: nak.name,
          pada: nak.pada,
          speed_deg_day: Number(vel.speedDegDay.toFixed(6)),
          accel_deg_day2: Number((vel.accelDegDay2 ?? 0).toFixed(8)),
          vakri: Boolean(vel.isRetrograde),
          motion_state: vel.motionState || "direct",
        };
      });

      payload = {
        status: "success",
        endpoint: "/v1/sphuta",
        engine: "ShunyaMath local engine",
        epoch: {
          civil_date: isoOf(ctx.civil),
          calendar: ctx.calendar,
          civil_time: ctx.timeText,
          timezone_offset_hours: timezone,
          julian_day: Number(jd.toFixed(8)),
        },
        location: {
          latitude: latitude,
          longitude: longitude,
          ujjain_mean_time: M.ujjainMeanTime(ctx.timeText, timezone),
          local_mean_time: M.ujjainMeanTime(ctx.timeText, timezone, longitude),
        },
        ayanamsa: {
          name: ay.name,
          applied_deg: Number(ay.deg.toFixed(8)),
          rate_arcsec_yr: Number.isFinite(ay.rateArcsecPerYear) ? Number(ay.rateArcsecPerYear.toFixed(6)) : null,
          source: ay.source,
        },
        ascendant: {
          sayana_deg: Number(sayanaAscendant.toFixed(6)),
          sidereal_deg: Number(siderealAscendant.toFixed(6)),
          rashi: M.RASHIS[M.signIndex(siderealAscendant)],
          rashi_deg: Number((M.mod360(siderealAscendant) % 30).toFixed(4)),
        },
        sphuta: sphutaDict,
        mathematical_audit: {
          bitwise_determinism: computeBitwiseDeterminism(jd, tier) ? "PASS (two independent recomputes byte-identical)" : "FAIL (recomputes diverged)",
          panini_hash_of_inputs: M.paniniHash ? M.paniniHash(`SPHUTA:${jd.toFixed(6)}:${tier}`, 16) : null,
        },
      };
    } else if (method === "panchang") {
      const panchang = M.panchangAtJd(jd, timezone, tier, site);
      const moon = planets.find((g) => g.key === "candra");
      const sun = planets.find((g) => g.key === "surya");
      const lunar = M.mod360(moon.longitude - sun.longitude);
      const tithiProgress = ((lunar % 12) / 12) * 100;
      const masa = panchang.masa || {};

      payload = {
        status: "success",
        endpoint: "/v1/panchang",
        engine: "ShunyaMath local engine",
        julian_day: Number(jd.toFixed(8)),
        civil_calendar: {
          date: isoOf(ctx.civil),
          calendar: ctx.calendar,
          time: ctx.timeText,
          civil_weekday_sa: panchang.civilVaraName,
          civil_weekday_index: panchang.civilVaraIndex,
        },
        pancha_anga: {
          tithi: {
            index: panchang.tithiIndex + 1,
            name: panchang.tithiName,
            paksha: panchang.paksha,
            progress_pct: Number(tithiProgress.toFixed(2)),
            remaining_pct: Number((100 - tithiProgress).toFixed(2)),
          },
          vara: {
            index: panchang.varaIndex,
            name: panchang.varaName,
            rule: panchang.varaRule,
            from: "sunrise (SS 1.36, 14.18)",
            ruler: ["Surya", "Chandra", "Mangala", "Budha", "Guru", "Shukra", "Shani"][panchang.varaIndex],
          },
          nakshatra: {
            index: panchang.nakshatraIndex + 1,
            name: panchang.nakshatraName,
            pada: panchang.nakshatraPada,
            degree_in_nakshatra: Number(panchang.nakshatraWithinDeg.toFixed(4)),
          },
          yoga: {
            index: panchang.yogaIndex + 1,
            name: panchang.yogaName,
            lunar_solar_sum_deg: Number(M.mod360(moon.longitude + sun.longitude).toFixed(4)),
          },
          karana: {
            index: panchang.karanaIndex + 1,
            name: panchang.karanaName,
            type: panchang.karanaType,
            order: panchang.karanaOrder || M.TIERS[tier].karanaOrder,
            is_vishti_bhadra: String(panchang.karanaName || "").includes("विष्टि"),
          },
        },
        masa: {
          name: masa.name || null,
          name_sa: panchang.masaName,
          adhika: masa.adhika === true,
          kshaya: masa.kshaya === true,
          scheme: masa.scheme || "amānta",
          refused: masa.refused === true ? masa.reason : null,
          rule: masa.rule || M.TIERS[tier].month,
        },
        day: {
          sunrise_jd: panchang.day && panchang.day.sunriseJd,
          sunset_jd: panchang.day && panchang.day.sunsetJd,
          sunrise_rule: M.TIERS[tier].sunrise,
          polar: panchang.day ? panchang.day.polar : null,
        },
        vedic_metrology: {
          saura_masa: panchang.sauraMasaName,
          saura_masa_rule: panchang.sauraMasaRule,
          ahargana_kali: Number(panchang.ahargana.toFixed(4)),
          ahargana_rule: panchang.aharganaRule,
          clock: panchang.clock,
          ghati: panchang.ghati,
          vighati: panchang.vighati,
          prana: panchang.prana,
          vipala: panchang.vipala,
          vipala_ticks_day: panchang.vipalaTicks,
        },
        rules: panchang.rules,
      };
    } else if (method === "quant") {
      if (typeof M.computeAspects !== "function") {
        throw new Error("computeAspects export missing — refusing to fabricate volatility metrics.");
      }
      const aspects = M.computeAspects(planets);
      const rahu = planets.find((g) => g.key === "rahu");
      const stationingGrahas = velocities.filter((v) => v.isStationary).map((v) => ({
        graha: v.en,
        speed_deg_day: Number(v.speedDegDay.toFixed(6)),
        accel_deg_day2: Number(v.accelDegDay2.toFixed(8)),
        signal: "STATIONARY_REGIME_INFLECTION",
      }));

      payload = {
        status: "success",
        endpoint: "/v1/quant/aspects",
        engine: "ShunyaMath local engine",
        julian_day: Number(jd.toFixed(8)),
        harmonic_metrics_experimental: {
          composite_index: aspects.volatilityIndex,
          regime_label: aspects.marketRegime,
          active_aspects_count: aspects.activeAspects.length,
          planetary_stationing_inflections: stationingGrahas,
          note: "geometry computed; any market relation is an untested hypothesis (VYAKHYA)",
        },
        lunar_node: {
          rahu_longitude_deg: Number(rahu.longitude.toFixed(6)),
          node_rule: M.TIERS[tier].rahu || "the tier's own node (the text's Rāhu in the text tiers)",
        },
        active_harmonic_aspects: aspects.activeAspects.map((a) => ({
          pair: `${a.graha1} - ${a.graha2}`,
          aspect: a.aspect,
          symbol: a.symbol,
          target_deg: a.targetAngleDeg,
          actual_separation_deg: Number(a.actualSeparationDeg.toFixed(4)),
          orb_deg: Number(a.orbDeg.toFixed(4)),
          orb_arcmin: Number(a.orbArcMin.toFixed(2)),
          intensity_pct: a.intensityPct,
          nature: a.nature,
        })),
        planetary_velocity_derivatives: velocities.map((v) => ({
          graha: v.en,
          longitude_deg: Number(v.longitude.toFixed(6)),
          velocity_dtheta_dt_deg_day: Number(v.speedDegDay.toFixed(6)),
          acceleration_d2theta_dt2_deg_day2: Number(v.accelDegDay2.toFixed(8)),
          motion_state: v.motionState,
          is_retrograde: v.isRetrograde,
          is_stationary: v.isStationary,
        })),
      };
    } else if (method === "vargas") {
      const vargasMap = {};
      const targets = [
        { en: "Lagna", longitude: siderealAscendant },
        ...planets.map((g) => ({ en: g.en, longitude: g.longitude })),
      ];

      targets.forEach((t) => {
        if (typeof M.computeNadiAmsha !== "function") {
          throw new Error("computeNadiAmsha export missing — refusing to substitute placeholder nadi data.");
        }
        const nadi = M.computeNadiAmsha(t.longitude);
        const harmonicDivisions = {};
        M.VARGAS.forEach((v) => {
          harmonicDivisions[v.code] = M.RASHIS[M.computeVarga(t.longitude, v.code)];
        });

        vargasMap[t.en] = {
          canonical_longitude: Number(t.longitude.toFixed(6)),
          d150_nadi_amsha: {
            division: 150,
            amsha_index: nadi.nadiIndex,
            nadi_name: nadi.name,
            rashi: nadi.rashi,
            span_in_sign: nadi.spanLabel,
            division_width_arcmin: 12.0,
          },
          harmonic_matrix: harmonicDivisions,
        };
      });

      payload = {
        status: "success",
        endpoint: "/v1/vargas/d150",
        engine: "ShunyaMath local engine",
        julian_day: Number(jd.toFixed(8)),
        nadi_division_system: {
          total_zodiac_amshas: 1800,
          amshas_per_rashi: 150,
          arc_per_amsha_deg: 0.2,
          arc_per_amsha_arcmin: 12.0,
        },
        entities: vargasMap,
      };
    }

    payload.tier = tier;
    payload.tier_rules = tierRulesPayload(tier);
    if (!payload.ayanamsa) payload.ayanamsa = { name: ay.name, applied_deg: Number(ay.deg.toFixed(8)), source: ay.source };
    const tEnd = performance.now();
    const diffMicros = Math.round((tEnd - tStart) * 1000);
    const diffMs = ((tEnd - tStart)).toFixed(2);

    const latEl = $("apiLatency");
    if (latEl) latEl.textContent = `${diffMicros} µs (${diffMs} ms) measured`;

    const viewer = $("apiResponseViewer");
    if (viewer) {
      const codeEl = viewer.querySelector("code") || viewer;
      codeEl.textContent = JSON.stringify(payload, null, 2);
    }
  }

  /** A graha row by key; a missing row is an error, never a place at 0°. */
  function rowOf(rows, key) {
    const row = Array.isArray(rows) ? rows.find((r) => r && r.key === key) : null;
    if (!row || !Number.isFinite(row.longitude)) throw new Error(`the ${key} row is missing from the tier's rows`);
    return row;
  }

  function appendCell(row, text, className = "") {
    const cell = document.createElement("td");
    cell.textContent = text;
    if (className) cell.className = className;
    row.appendChild(cell);
  }

  function appendHeader(row, text, scope = "col") {
    const cell = document.createElement("th");
    cell.scope = scope;
    cell.textContent = text;
    row.appendChild(cell);
  }

  function formatDegrees(value, digits = 6) {
    return `${M.mod360(value).toFixed(digits)}°`;
  }

  function signLabel(longitude) {
    const index = M.signIndex(longitude);
    const within = M.mod360(longitude) - index * 30;
    return `${M.RASHIS[index]} ${within.toFixed(4)}°`;
  }

  /** The tier's nine rows. The text tiers carry their mean place; the dṛk tier has none (mean === null). */
  function canonicalGrahaRows(jd, tier) {
    const rows = M.canonicalGrahaModel(jd, { mode: tier });
    if (!Array.isArray(rows) || rows.length !== 9) throw new Error("The tier's graha model must return exactly nine rows.");
    return rows.map((row) => {
      const longitude = Number(row.longitude);
      const meanOk = row.mean === null || Number.isFinite(row.mean);
      if (!row.key || !meanOk || !Number.isFinite(longitude)) {
        throw new Error(`The tier's graha model returned an incomplete row (${row.key || "?"}).`);
      }
      return { ...row, longitude };
    });
  }

  function renderPlanets(planets) {
    const body = $("planet-body");
    if (!body) return;
    body.replaceChildren();
    for (const graha of planets) {
      const nak = M.computeNakshatraDetails(graha.longitude);
      const row = document.createElement("tr");
      appendHeader(row, `${graha.sa} · ${graha.en}`, "row");
      appendCell(row, graha.mean === null ? "—" : formatDegrees(graha.mean));
      appendCell(row, formatDegrees(graha.longitude), "accent");
      appendCell(row, signLabel(graha.longitude));
      appendCell(row, `${nak.number}. ${nak.name} (चरण ${nak.pada})`);
      appendCell(row, `${nak.lord}`);
      body.appendChild(row);
    }
  }

  function renderQuantSection(jd, planets, tier) {
    const velBody = $("quant-vel-body");
    const aspectsList = $("quant-aspects-list");
    const regBadge = $("quantRegimeBadge");
    const volIndexEl = $("quantVolIndex");

    if (!velBody) return;

    const velocities = M.computePlanetaryVelocities ? M.computePlanetaryVelocities(jd, { mode: tier }) : [];
    const aspects = typeof M.computeAspects === "function" ? M.computeAspects(planets) : null;

    velBody.replaceChildren();
    for (const graha of planets) {
      const vel = velocities.find((v) => v.key === graha.key);
      const row = document.createElement("tr");
      appendHeader(row, `${graha.sa} · ${graha.en}`, "row");
      appendCell(row, formatDegrees(graha.longitude));

      if (!vel || !Number.isFinite(vel.speedDegDay)) {
        // Honest failure state — never substitute fabricated speeds.
        appendCell(row, "unavailable");
        appendCell(row, "unavailable");
        appendCell(row, "unavailable");
        appendCell(row, "velocity export missing from math-core");
        velBody.appendChild(row);
        continue;
      }

      appendCell(row, `${vel.speedDegDay >= 0 ? "+" : ""}${vel.speedDegDay.toFixed(6)}°/d`, vel.isRetrograde ? "error" : "accent");
      appendCell(row, `${vel.accelDegDay2 >= 0 ? "+" : ""}${vel.accelDegDay2.toFixed(8)}°/d²`);

      let motionBadge = `<span class="badge badge-cyan">${vel.motionState.toUpperCase()}</span>`;
      if (vel.isRetrograde) motionBadge = `<span class="badge" style="background: rgba(255, 155, 155, 0.15); color: var(--red); border: 1px solid var(--red);">VAKRI (RETROGRADE)</span>`;
      else if (vel.isStationary) motionBadge = `<span class="badge badge-gold">STATIONARY INFLECTION</span>`;

      const motionCell = document.createElement("td");
      motionCell.innerHTML = motionBadge;
      row.appendChild(motionCell);

      // Neutral computed descriptor: report the actual |dθ/dt| magnitude only.
      const signalCell = document.createElement("td");
      const absSpeed = Math.abs(vel.speedDegDay).toFixed(4);
      signalCell.innerHTML = vel.isStationary
        ? `<b style="color: var(--gold);">Stationary: |dθ/dt| = ${absSpeed}°/day</b>`
        : `<span style="color: var(--soft);">|dθ/dt| = ${absSpeed}°/day (${vel.motionState})</span>`;
      row.appendChild(signalCell);

      velBody.appendChild(row);
    }

    if (!aspects) {
      // Honest failure state — no fabricated index or regime label.
      if (volIndexEl) volIndexEl.textContent = "unavailable";
      if (regBadge) {
        regBadge.textContent = "computeAspects export missing";
        regBadge.className = "badge";
        regBadge.style.cssText = "color: var(--red); border: 1px solid var(--red);";
      }
      if (aspectsList) {
        aspectsList.replaceChildren();
        aspectsList.innerHTML = `<div style="color: var(--red); font-size: 0.78rem;">Aspect data unavailable — computeAspects export missing from math-core.</div>`;
      }
      return;
    }

    if (volIndexEl) volIndexEl.textContent = `${aspects.volatilityIndex} / 100 (प्रयोगात्मक)`;
    if (regBadge) {
      regBadge.textContent = aspects.marketRegime;
      if (aspects.volatilityIndex >= 75) {
        regBadge.className = "badge";
        regBadge.style.cssText = "background: rgba(255, 155, 155, 0.2); color: var(--red); border: 1px solid var(--red);";
      } else if (aspects.volatilityIndex >= 45) {
        regBadge.className = "badge badge-gold";
      } else {
        regBadge.className = "badge badge-green";
      }
    }

    if (aspectsList) {
      aspectsList.replaceChildren();
      if (!aspects.activeAspects || aspects.activeAspects.length === 0) {
        aspectsList.innerHTML = `<div style="color: var(--soft); font-size: 0.78rem;">No intense major aspects within active orb bounds. Harmonic tranquility prevailing.</div>`;
      } else {
        aspects.activeAspects.forEach((a) => {
          const card = document.createElement("div");
          card.style.cssText = "background: var(--hero); border: 1px solid var(--line); border-radius: 4px; padding: 8px 10px; font-size: 0.76rem;";
          const isTense = a.nature.includes("Tense") || a.nature.includes("Dissonance") || a.aspect === "Square" || a.aspect === "Opposition";
          const color = isTense ? "var(--red)" : "var(--green)";
          card.innerHTML = `
            <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
              <strong style="color: var(--gold);">${a.graha1} ${a.symbol} ${a.graha2} (${a.aspect})</strong>
              <span style="color: ${color}; font-weight: 700;">${a.intensityPct}% intensity</span>
            </div>
            <div style="color: var(--soft); font-size: 0.72rem;">Orb: <b>${a.orbArcMin.toFixed(1)}'</b> (${a.actualSeparationDeg.toFixed(2)}° vs ${a.targetAngleDeg}°)</div>
            <div style="color: ${color}; font-size: 0.72rem; margin-top: 2px;">⚡ ${a.marketImpact} <span style="color: var(--soft);">(अ-प्रमाणित)</span></div>
          `;
          aspectsList.appendChild(card);
        });
      }
    }
  }

  function grahaName(key) {
    const g = M.GRAHAS.find((item) => item.key === key);
    return g ? g.sa : key;
  }

  function reconcileBhavaRows(model, planets) {
    const lagnaRashi = model.lagnaRashi;
    const grahas = planets.map((g) => {
      const bhava = M.bhavaIndexForLongitude(g.longitude, model.sandhis);
      const rawOffset = M.mod360(g.longitude - model.madhyas[bhava]);
      return {
        ...g,
        bhava,
        bhavaOffset: rawOffset > 180 ? rawOffset - 360 : rawOffset,
        wholeSignBhava: (M.signIndex(g.longitude) - lagnaRashi + 12) % 12 + 1,
      };
    });
    const bhavas = model.bhavas.map((bhava) => ({
      ...bhava,
      occupants: grahas.filter((g) => g.bhava === bhava.no).map((g) => g.key),
    }));
    return { ...model, bhavas, grahas };
  }

  function renderBhavas(model) {
    $("b-lagna").textContent = `${signLabel(model.lagna)} · ${M.RASHIS[model.lagnaRashi]}`;
    $("b-madhya10").textContent = `${formatDegrees(model.madhyas[10])} · madhya-lagna`;
    $("b-method").textContent = model.method;

    const body = $("bhavas-body");
    body.replaceChildren();
    for (const b of model.bhavas) {
      const nak = M.computeNakshatraDetails(b.madhya);
      const row = document.createElement("tr");
      appendHeader(row, `${b.no} · ${b.sa}`, "row");
      appendCell(row, `${b.karaka.sa} · ${b.karaka.en}`);
      appendCell(row, formatDegrees(b.madhya), "accent");
      appendCell(row, `${nak.name} (चरण ${nak.pada})`);
      appendCell(row, formatDegrees(b.sandhi));
      appendCell(row, `${b.spanDeg.toFixed(3)}°`);
      appendCell(row, b.rashi);
      appendCell(row, grahaName(b.lord));
      appendCell(row, b.occupants.length ? b.occupants.map(grahaName).join(" · ") : "—");
      body.appendChild(row);
    }

    const gbody = $("bhavas-graha-body");
    gbody.replaceChildren();
    for (const g of model.grahas) {
      const row = document.createElement("tr");
      appendHeader(row, `${g.sa} · ${g.en}`, "row");
      appendCell(row, formatDegrees(g.longitude));
      appendCell(row, `bhāva-${g.bhava}`, "accent");
      appendCell(row, `${g.bhavaOffset >= 0 ? "+" : ""}${g.bhavaOffset.toFixed(3)}°`);
      appendCell(row, `bhāva-${g.wholeSignBhava}`);
      gbody.appendChild(row);
    }
  }

  function computeVargaMatrix(ascendant, planets) {
    const sources = [
      { en: "Lagna", text: "ल", isLagna: true, longitude: ascendant },
      ...planets.map((graha) => ({
        en: graha.en,
        text: VARGA_GRAHA_LABELS[graha.key] || graha.sa,
        isLagna: false,
        longitude: graha.longitude,
      })),
    ];
    return M.VARGAS.map((varga) => ({
      varga,
      row: sources.map((source) => ({ ...source, sign: M.computeVarga(source.longitude, varga.code) })),
    }));
  }

  function renderVargas(matrix) {
    const head = $("varga-head");
    const body = $("varga-body");
    head.replaceChildren();
    body.replaceChildren();
    const headerRow = document.createElement("tr");
    appendHeader(headerRow, "Varga");
    for (const source of matrix[0].row) appendHeader(headerRow, source.en);
    head.appendChild(headerRow);
    for (const entry of matrix) {
      const row = document.createElement("tr");
      appendHeader(row, `${entry.varga.code} · ${entry.varga.name}`, "row");
      for (const source of entry.row) appendCell(row, M.RASHIS[source.sign]);
      body.appendChild(row);
    }
    // D144 row from VARGAS_EXTENDED — computed via the same computeVarga engine,
    // kept outside the canonical 16 (extension beyond Ṣoḍaśavarga).
    if (Array.isArray(M.VARGAS_EXTENDED)) {
      for (const varga of M.VARGAS_EXTENDED) {
        const row = document.createElement("tr");
        appendHeader(row, `${varga.code} · ${varga.name} — extension beyond Ṣoḍaśavarga`, "row");
        for (const source of matrix[0].row) appendCell(row, M.RASHIS[M.computeVarga(source.longitude, varga.code)], "accent");
        body.appendChild(row);
      }
    }
  }

  function occupantsMarkup(box, occupants) {
    const [x, y, w, h] = box;
    const fontSize = 4.25;
    const cellW = fontSize * 1.35;
    const gap = 0.35;
    const cols = Math.max(1, Math.floor((w + gap) / cellW));
    const rowH = fontSize + 1;
    const rows = Math.ceil(occupants.length / cols);
    const startY = y + (h - rows * rowH) / 2 + fontSize;
    return occupants.map((source, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      const inRow = Math.min(cols, occupants.length - row * cols);
      const blockW = inRow * cellW - gap;
      const cx = x + (w - blockW) / 2 + col * cellW + cellW / 2;
      const cy = startY + row * rowH;
      const color = source.color || (source.isLagna ? "#f0d47d" : "#a2e6b2");
      const key = String(source.key || source.en || "unknown").replace(/[^a-zA-Z0-9_-]/g, "_");
      const sign = Number.isInteger(source.sign) ? source.sign : -1;
      return `<text x="${cx.toFixed(2)}" y="${cy.toFixed(2)}" font-size="${fontSize}" fill="${color}" text-anchor="middle" font-weight="700" data-graha="${key}" data-sign-index="${sign}">${source.text}</text>`;
    }).join("");
  }

  function vargaChartSvg(varga, row) {
    const cells = Array.from({ length: 12 }, () => []);
    for (const source of row) cells[source.sign].push(source);
    const occupied = cells.map((sources, index) => sources.length ? `${M.RASHIS[index]}: ${sources.map((source) => source.en).join(", ")}` : "").filter(Boolean).join("; ");
    let svg = `<svg viewBox="0 0 100 100" role="img" aria-labelledby="chart-${varga.code}-title chart-${varga.code}-desc"><title id="chart-${varga.code}-title">${varga.code} ${varga.name} varga chart</title><desc id="chart-${varga.code}-desc">North-Indian fixed-sign figure computed from canonical corrected sphuṭa rows. ${occupied}</desc>`;
    for (let i = 0; i < 12; i++) {
      const region = VARGA_REGIONS[i];
      const fill = cells[i].length ? "#12323b" : "#081318";
      if (region.poly) svg += `<polygon points="${region.poly}" fill="${fill}" stroke="#3e606b" stroke-width="0.7"/>`;
      else svg += `<rect x="${region.rect[0]}" y="${region.rect[1]}" width="${region.rect[2]}" height="${region.rect[3]}" fill="${fill}" stroke="#3e606b" stroke-width="0.7"/>`;
      svg += `<text x="${region.box[0]}" y="${region.box[1] + 4.8}" font-size="4.4" fill="#b8ccd2" font-weight="700">${i + 1}</text>`;
    }
    svg += `<line x1="50" y1="38" x2="50" y2="62" stroke="#3e606b" stroke-width="0.7"/><line x1="38" y1="50" x2="62" y2="50" stroke="#3e606b" stroke-width="0.7"/>`;
    for (let i = 0; i < 12; i++) if (cells[i].length) svg += occupantsMarkup(VARGA_REGIONS[i].box, cells[i]);
    return `${svg}</svg>`;
  }

  function createVargaChart(entry) {
    const figure = document.createElement("figure");
    figure.className = "varga-chart";
    const title = document.createElement("h3");
    title.textContent = `${entry.varga.code} · ${entry.varga.name}`;
    const graphic = document.createElement("div");
    graphic.innerHTML = vargaChartSvg(entry.varga, entry.row);
    const caption = document.createElement("figcaption");
    caption.className = "chart-foot";
    const occupied = Array.from({ length: 12 }, (_, sign) => {
      const names = entry.row.filter((source) => source.sign === sign).map((source) => source.en);
      return names.length ? `${M.RASHIS[sign]}: ${names.join(", ")}` : "";
    }).filter(Boolean);
    caption.textContent = `${occupied.join(" · ")} · canonical sphuṭa input`;
    figure.append(title, graphic, caption);
    return figure;
  }

  function renderVargaCharts(matrix) {
    const complete = $("varga-charts");
    if (!complete) return;
    complete.replaceChildren();
    for (const entry of matrix) {
      complete.appendChild(createVargaChart(entry));
    }
  }

  /** Vimśottarī of the tier (math-core vimshottariTier: dasha.js by time, BPHS 46.16; the tier's year). */
  function renderDasha(moonLongitude, ctx) {
    const { jd, tier, timezone, calendar } = ctx;
    const result = M.vimshottariTier(jd, jd, tier);
    const state = result.birthState;
    const year = result.year;
    $("dasha-state").textContent = `Moon ${formatDegrees(moonLongitude)} (${tierTitle(tier)}) · nakṣatra ${state.nakshatraIndex + 1}/27 · ${state.lord} mahādaśā · ${state.balanceYears.toFixed(6)} years remaining at the selected instant — balance by ${state.method}`;
    $("dasha-maha").textContent = result.maha ? `${result.maha.lord}: ${fmtDate(result.maha.startJd, timezone, calendar)} → ${fmtDate(result.maha.endJd, timezone, calendar)}` : "not computed";
    $("dasha-antara").textContent = result.antara
      ? `${result.antara.lord}: ${fmtDate(result.antara.startJd, timezone, calendar)} → ${fmtDate(result.antara.endJd, timezone, calendar)}`
      : "No antardaśā resolved";
    const ruleEl = $("dasha-rule");
    if (ruleEl) ruleEl.textContent = `Daśā year of this tier: ${year.days} days — ${year.source}. Balance at birth by time (BPHS 46.16). Dates in the Instrument's calendar (${CALENDARS[calendar]}) and zone.`;

    // Mahādaśā breath ladder — 972×-lattice column via dashaBreathCount (SIDDHA).
    const breathBody = $("dasha-breath-body");
    if (breathBody) {
      breathBody.replaceChildren();
      if (typeof M.vimshottariBreathTable !== "function") {
        const tr = document.createElement("tr");
        appendCell(tr, "प्राण ladder unavailable — vimshottariBreathTable export missing.", "error");
        breathBody.appendChild(tr);
      } else {
        for (const row of M.vimshottariBreathTable()) {
          const tr = document.createElement("tr");
          const isActive = Boolean(result.maha) && row.lord === result.maha.lord;
          if (isActive) tr.style.background = "rgba(234, 201, 123, 0.06)";
          appendHeader(tr, isActive ? `${row.lord} · active` : row.lord, "row");
          appendCell(tr, devNum(row.years));
          // देवनागरी प्रदर्श of the same computed formula (digits/words transliterated, values untouched)
          const devFormula = devNum(String(row.formula).replace(/varsh/g, "वर्ष").replace(/prana/g, "प्राण").replace(/ x /g, " × "));
          appendCell(tr, devFormula, isActive ? "accent" : "");
          breathBody.appendChild(tr);
        }
      }
    }
  }

  // D=9 जन्म-जालक · Natal-ID — 27³ lattice address from the CURRENT computed
  // Sun/Moon/Lagna nakṣatra indices (KOSH). No fabricated fallback values.
  function renderNatalId(planets, siderealAscendant) {
    const cellEl = $("natal-cell");
    if (!cellEl) return;
    const zoneEl = $("natal-zone");
    const coordsEl = $("natal-coords");
    const indicesEl = $("natal-indices");
    const drEl = $("natal-digitroot");
    const sealEl = $("natal-seal");

    if (typeof M.computeNatalId !== "function") {
      cellEl.textContent = "unavailable — computeNatalId export missing";
      if (zoneEl) zoneEl.textContent = "—";
      if (coordsEl) coordsEl.textContent = "—";
      if (indicesEl) indicesEl.textContent = "—";
      if (drEl) drEl.textContent = "—";
      if (sealEl) sealEl.textContent = "—";
      return;
    }

    const sun = planets.find((g) => g.key === "surya");
    const moon = planets.find((g) => g.key === "candra");
    if (!sun || !moon) throw new Error("Natal-ID requires canonical Sun and Moon rows.");
    const sunNak = M.computeNakshatraDetails(sun.longitude).index;
    const moonNak = M.computeNakshatraDetails(moon.longitude).index;
    const lagnaNak = M.computeNakshatraDetails(siderealAscendant).index;
    const id = M.computeNatalId(sunNak, moonNak, lagnaNak);

    cellEl.textContent = `${id.cell.toLocaleString("en-IN")} / ${id.latticeCells.toLocaleString("en-IN")}`;
    if (zoneEl) zoneEl.innerHTML = `<span class="badge badge-gold">${id.zone}</span> · ${id.activeAxes}/9 axes active`;
    if (coordsEl) coordsEl.textContent = `(${id.coords.sun.join(",")}) · (${id.coords.moon.join(",")}) · (${id.coords.lagna.join(",")})`;
    if (indicesEl) indicesEl.textContent = `Sūrya ${sunNak} · Candra ${moonNak} · Lagna ${lagnaNak}`;
    if (drEl) drEl.textContent = `${id.digitRoot} · ${id.resonance ? "3-6-9 resonance ✓" : "no 3-6-9 resonance"}`;
    if (sealEl) sealEl.textContent = `(${id.seal}) 729·${sunNak} + 27·${moonNak} + ${lagnaNak} = ${id.cell}`;

    // Payload for the share-card — every field is the live computed value above.
    lastNatalShare = {
      cell: id.cell,
      latticeCells: id.latticeCells,
      zone: id.zone,
      activeAxes: id.activeAxes,
      digitRoot: id.digitRoot,
      seal: id.seal,
      sunNak, moonNak, lagnaNak,
      tierSa: planets[0] && planets[0].tier ? M.TIERS[planets[0].tier].labelSa : "",
    };
  }

  // ── Natal-ID share-card (canvas, black/gold) — all values computed live ──
  function natalShareText() {
    if (!lastNatalShare) return null;
    const n = lastNatalShare;
    return `मेरा वैदिक Natal-ID: cell ${n.cell}/${n.latticeCells} · अक्ष ${n.activeAxes}/9 · D=9 जालक${n.tierSa ? ` · तह: ${n.tierSa}` : ""} — तुम्हारा क्या है? offline.bharatephemeris.com`;
  }

  function drawNatalShareCard() {
    if (!lastNatalShare) return null;
    const n = lastNatalShare;
    const W = 1200, H = 630;
    const c = document.createElement("canvas");
    c.width = W; c.height = H;
    const ctx = c.getContext("2d");
    // dark-oracle background
    ctx.fillStyle = "#03060e";
    ctx.fillRect(0, 0, W, H);
    const grad = ctx.createRadialGradient(W / 2, 0, 60, W / 2, 0, H);
    grad.addColorStop(0, "rgba(234,201,123,0.14)");
    grad.addColorStop(1, "rgba(234,201,123,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = "rgba(234,201,123,0.55)";
    ctx.lineWidth = 3;
    ctx.strokeRect(24, 24, W - 48, H - 48);
    ctx.textAlign = "center";
    ctx.fillStyle = "#eac97b";
    ctx.font = "700 44px Georgia, 'Noto Serif Devanagari', serif";
    ctx.fillText("मेरा वैदिक Natal-ID · D=9 जन्म-जालक", W / 2, 120);
    ctx.font = "700 86px Georgia, serif";
    ctx.fillStyle = "#f0d47d";
    ctx.fillText(`cell ${n.cell} / ${n.latticeCells}`, W / 2, 250);
    ctx.font = "40px Georgia, serif";
    ctx.fillStyle = "#c8b06a";
    ctx.fillText(`${n.zone} क्षेत्र · अक्ष ${n.activeAxes}/9 · digit-root ${n.digitRoot}`, W / 2, 330);
    ctx.font = "32px monospace";
    ctx.fillStyle = "#8fa3ad";
    ctx.fillText(`729·${n.sunNak} + 27·${n.moonNak} + ${n.lagnaNak} = ${n.cell} (${n.seal})`, W / 2, 400);
    ctx.font = "700 36px Georgia, serif";
    ctx.fillStyle = "#eac97b";
    ctx.fillText("तुम्हारा क्या है? → offline.bharatephemeris.com", W / 2, 490);
    ctx.font = "26px Georgia, serif";
    ctx.fillStyle = "#7f8a91";
    ctx.fillText(`गणना घोषित है — भाग्य नहीं।${n.tierSa ? ` · तह: ${n.tierSa}` : ""} · computed offline in the browser`, W / 2, 560);
    return c;
  }

  function initNatalShareControls() {
    const shareBtn = $("natal-share-btn");
    const copyBtn = $("natal-copy-btn");
    const statusEl = $("natal-share-status");
    const say = (t) => { if (statusEl) { statusEl.textContent = t; setTimeout(() => { statusEl.textContent = ""; }, 4000); } };
    if (shareBtn && !shareBtn._hasListener) {
      shareBtn._hasListener = true;
      shareBtn.addEventListener("click", () => {
        const canvas = drawNatalShareCard();
        if (!canvas) { say("पहले compute चलाओ — share-card जीवित गणना से बनता है"); return; }
        canvas.toBlob((blob) => {
          if (!blob) { say("PNG बन नहीं सका"); return; }
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `natal-id-${lastNatalShare.cell}.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          say("PNG download हुआ ✓");
        }, "image/png");
      });
    }
    if (copyBtn && !copyBtn._hasListener) {
      copyBtn._hasListener = true;
      copyBtn.addEventListener("click", () => {
        const text = natalShareText();
        if (!text) { say("पहले compute चलाओ"); return; }
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(() => say("text कॉपी हुआ ✓"), () => say("clipboard अनुपलब्ध"));
        } else say("clipboard अनुपलब्ध");
      });
    }
  }

  /* आधुनिक भारतीय (दृक्): the measured agreement is stated as text from M.TIERS.drik (what the repository's tests
     measure); no referee (VSOP87, ELP/MPP02, Astronomy Engine) is computed in the browser — owner decision 2026-10-08. */
  function renderDrikAgreement() {
    const list = $("drik-agreement-list");
    if (!list) return;
    const T = M.TIERS.drik;
    const rows = [
      ["तह / tier", `${T.labelSa} · ${T.label}`],
      ["engine", T.engine],
      ["reduction", T.reduction],
      ["time (ΔT)", T.time],
      ["ayanāṃśa", `${T.ayanamsha.name} — ${T.ayanamsha.source}`],
      ["span", `${T.span.years[0]}.0–${T.span.years[1]}.0 (${T.span.yearRule || T.span.basis}); outside it this tier refuses, with no foreign substitute`],
      ["measured in the repository's tests", T.span.accuracyMeasured],
      ["provenance", T.provenance],
    ];
    list.replaceChildren();
    for (const [k, v] of rows) {
      if (!v) continue;
      const dt = document.createElement("dt"); dt.textContent = k;
      const dd = document.createElement("dd"); dd.textContent = v;
      list.append(dt, dd);
    }
  }

  /* The declared boundary: the three tiers as math-core records them. */
  function renderTierBoundaryList() {
    const list = $("tier-boundary-list");
    if (!list) return;
    list.replaceChildren();
    for (const id of M.TIER_IDS) {
      const T = M.TIERS[id];
      const dt = document.createElement("dt");
      dt.textContent = `${T.labelSa} · ${T.label}${T.default ? " (default)" : ""}`;
      const dd = document.createElement("dd");
      dd.textContent = `${T.engine} · ayanāṃśa: ${T.ayanamsha.name} · span ${T.span.years[0]} … ${T.span.years[1]} (${T.span.basis}) · ${T.provenance}`;
      list.append(dt, dd);
    }
  }

  // Kerala dṛk-saṃskāra overlay (Mādhava–Nīlakaṇṭha) — off by default per SANKALP BE-S03. math-core keralaDrikSphuta: the
  // base is the plain Sūrya-Siddhānta tier, the saṃskṛta value is base + its fitted correction (never the dṛk value), and
  // the dṛk column is the Modern Bhāratīya tier's own place (null outside 1850–2150). The fit's own RMS/max figures are
  // claims of a retired pipeline, shown as such beside the live residual against the dṛk tier.
  function renderKeralaDrik(jd) {
    const toggle = $("kerala-drik-toggle");
    const wrap = $("kerala-drik-wrap");
    const tbody = $("kerala-drik-tbody");
    if (!toggle || !wrap || !tbody) return;
    wrap.style.display = toggle.checked ? "" : "none";
    const lineageEl = $("kerala-drik-lineage");
    tbody.replaceChildren();
    if (lineageEl) lineageEl.textContent = "";
    if (!toggle.checked) return;

    const fail = (message) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td colspan="7" class="not-computed-note"></td>`;
      tr.firstChild.textContent = message;
      tbody.appendChild(tr);
      if (lineageEl) lineageEl.textContent = "";
    };
    if (typeof M.keralaDrikSphuta !== "function") { fail("not computed: keralaDrikSphuta is missing from math-core"); return; }
    if (jd == null) { fail("not computed: no valid instant"); return; }
    let k;
    try { k = M.keralaDrikSphuta(jd); } catch (error) { fail(`not computed: ${error.message}`); return; }
    const NAMES = { surya: "सूर्य", candra: "चन्द्र", mangala: "मङ्गल", budha: "बुध", shukra: "शुक्र", guru: "गुरु", shani: "शनि", rahu: "राहु", ketu: "केतु" };
    const fmtArcmin = (x) => (x === null || x === undefined || !Number.isFinite(x) ? "—" : `${x >= 0 ? "+" : ""}${x.toFixed(1)}′`);
    for (const key of ["surya", "candra", "mangala", "budha", "shukra", "guru", "shani", "rahu", "ketu"]) {
      const row = k[key];
      if (!row) continue;
      const tr = document.createElement("tr");
      appendHeader(tr, NAMES[key], "row");
      appendCell(tr, `${row.classical.toFixed(4)}°`);
      appendCell(tr, `${row.samskrita.toFixed(4)}°`, "accent");
      appendCell(tr, Number.isFinite(row.fitClaimRmsArcmin) ? `±${row.fitClaimRmsArcmin}′ rms / ${row.fitClaimMaxArcmin}′ max (claim)` : (row.note || "no fit claim"));
      appendCell(tr, row.drik === null || row.drik === undefined ? `not served (${M.TIERS.drik.span.years[0]}–${M.TIERS.drik.span.years[1]} only)` : `${row.drik.toFixed(4)}°`);
      appendCell(tr, fmtArcmin(row.deltaVsDrikArcmin));
      const holds = row.deltaVsDrikArcmin === null || row.deltaVsDrikArcmin === undefined || !Number.isFinite(row.fitClaimRmsArcmin)
        ? "—" : (k.claimFails.includes(key) ? "NO — the claim fails here" : "yes");
      appendCell(tr, holds, holds.startsWith("NO") ? "error" : "");
      tbody.appendChild(tr);
    }
    const badgeTr = document.createElement("tr");
    const span = k.fitSpan || [1900, 2100];
    badgeTr.innerHTML = `<th scope="row">fit span</th><td colspan="6"></td>`;
    badgeTr.lastChild.textContent = `${k.inFitSpan ? "inside" : "OUT OF"} the fit span ${span[0]}–${span[1]} · frame: ${k.fitFrame} · ${k.fitStatus}${k.claimFails.length ? ` · claims failing at this instant: ${k.claimFails.join(", ")}` : ""}`;
    if (!k.inFitSpan) badgeTr.lastChild.style.color = "var(--red)";
    tbody.appendChild(badgeTr);
    const noteTr = document.createElement("tr");
    noteTr.innerHTML = `<th scope="row">अगला पर्वत</th><td colspan="6" style="color: var(--soft);"></td>`;
    noteTr.lastChild.textContent = k.pending && k.pending.note ? k.pending.note : "—";
    tbody.appendChild(noteTr);
    if (lineageEl) lineageEl.textContent = `${k.lineage} · ${k.seal} · base: ${k.base} · dṛk column: ${k.drikColumn}`;
  }

  function renderCoordinateCodec(latitudeText, longitudeText) {
    const payload = M.encodeCoordinatePair(latitudeText, longitudeText);
    const decoded = M.decodeCoordinatePair(payload);
    $("codec-payload").value = payload;
    $("codec-decoded").textContent = `${decoded.latitude}, ${decoded.longitude}`;
  }

  function setFieldError(control, message) {
    if (!control) return;
    control.setAttribute("aria-invalid", String(Boolean(message)));
    const error = $(`${control.id}-error`);
    if (error) error.textContent = message || "";
  }

  function validateRequiredControl(control, message) {
    const valid = control.value.trim() !== "" && control.validity.valid;
    setFieldError(control, valid ? "" : message);
    return valid;
  }

  function parseBoundedControl(control, name, minimum, maximum, errors) {
    const value = Number(control.value);
    const valid = control.value.trim() !== "" && Number.isFinite(value) && value >= minimum && value <= maximum;
    const message = valid ? "" : `${name} must be between ${minimum} and ${maximum}.`;
    setFieldError(control, message);
    if (!valid) errors.push({ control, message });
    return value;
  }

  /** The Instrument as one checked object: { civil, calendar, timeText, timezone, latitude, longitude, site, tier, jd }.
   *  Throws (with .control) on the first bad field; the date goes through the page's one signed parser. */
  function readInstrument() {
    const errors = [];
    let calendar = "gregorian";
    try { calendar = selectedCalendar(); } catch (error) { errors.push({ control: controls.calendar, message: error.message }); }
    let civil = null;
    try {
      civil = parseCivilDate(controls.date.value, calendar, "Date");
      setFieldError(controls.date, "");
      setHelper("date-helper", dateHelperText(civil));
    } catch (error) {
      setFieldError(controls.date, error.message);
      setHelper("date-helper", "");
      errors.push({ control: controls.date, message: error.message });
    }
    if (!validateRequiredControl(controls.time, "Enter a valid local civil time.")) errors.push({ control: controls.time, message: "Enter a valid local civil time." });
    const timezone = parseBoundedControl(controls.timezone, "UTC offset", -14, 14, errors);
    const latitude = parseBoundedControl(controls.latitude, "Latitude", -89.999999, 89.999999, errors);
    const longitude = parseBoundedControl(controls.longitude, "Longitude", -180, 180, errors);
    if (errors.length) {
      const error = new InputError(`${errors.length} field${errors.length === 1 ? "" : "s"} require attention. ${errors[0].message}`);
      error.control = errors[0].control;
      throw error;
    }
    const tier = selectedTier();
    const timeText = controls.time.value.length === 5 ? `${controls.time.value}:00` : controls.time.value;
    const jd = M.civilToJd(civil, timeText, timezone);
    return { civil, calendar, timeText, timezone, latitude, longitude, site: { latitude, longitude }, tier, jd };
  }

  /** A panel computed on its own: an error inside it (a refusal near the dṛk span's edge, a bad transit date, …) is
   *  written into that panel as "not computed: …" and does not stop the rest of the page; nothing is silently swallowed. */
  const panelErrors = new Map();
  function panel(sectionId, fn) {
    try {
      const out = fn();
      panelErrors.delete(sectionId);
      return out;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      panelErrors.set(sectionId, { message, refused: Boolean(error && error.code === "TIER_OUT_OF_SPAN") });
      markPanelNotComputed(sectionId, `${error && error.code === "TIER_OUT_OF_SPAN" ? "refused" : "not computed"}: ${message}`);
      return null;
    }
  }
  function markPanelNotComputed(sectionId, text) {
    const section = $(sectionId);
    if (!section) return;
    clearContainer(section, text);
    const strip = ensureTierStrip(section);
    if (strip) setStripNotComputed(strip, text);
  }

  function renderShunyabhedaForensics(panchang, planets, siderealAscendant, bhava) {
    const pick = (key) => { const g = planets.find((x) => x.key === key); if (!g) throw new Error(`the ${key} row is missing`); return g; };
    const moon = pick("candra"), sun = pick("surya"), rahu = pick("rahu");

    // 1. Tithi-Dagdha — no fabricated fallback lists: unavailable is stated plainly. The tithi is the tier's own.
    const tithiNum = panchang.tithiIndex + 1;
    const dagdha = typeof M.computeTithiDagdha === "function" ? M.computeTithiDagdha(tithiNum) : null;

    const dagdhaEl = $("dagdhaTithiName");
    const dagdhaListEl = $("dagdhaRashisList");
    const dagdhaStatusEl = $("dagdhaPlanetsStatus");

    if (dagdhaEl) dagdhaEl.textContent = `Tithi ${tithiNum}: ${panchang.tithiName || `Tithi ${tithiNum}`}`;

    if (!dagdha) {
      if (dagdhaListEl) dagdhaListEl.textContent = "Dagdha data unavailable — computeTithiDagdha export missing.";
      if (dagdhaStatusEl) {
        dagdhaStatusEl.style.color = "var(--red)";
        dagdhaStatusEl.textContent = "Unavailable: refusing to display substitute void-sign lists.";
      }
    } else {
      if (dagdhaListEl) dagdhaListEl.textContent = dagdha.dagdhaRashis.length ? `Dagdha Void Signs: ${dagdha.dagdhaRashis.join(", ")}` : "No Dagdha (Sampurna Tithi)";

      const trappedPlanets = planets.filter((p) => {
        const s = M.RASHIS[M.signIndex(p.longitude)];
        return dagdha.dagdhaRashis.includes(s);
      });

      if (dagdhaStatusEl) {
        if (trappedPlanets.length > 0) {
          dagdhaStatusEl.style.color = "var(--red)";
          dagdhaStatusEl.textContent = `⚠️ Void Trapped Grahas: ${trappedPlanets.map((p) => `${p.sa} (${M.RASHIS[M.signIndex(p.longitude)]})`).join(", ")}`;
        } else {
          dagdhaStatusEl.style.color = "var(--green)";
          dagdhaStatusEl.textContent = `✓ No Grahas afflicted by Tithi-Dagdha void in radix.`;
        }
      }
    }

    // 2. Bhrigu Bindu — no hardcoded 68.75° fallback: unavailable is stated plainly.
    const bbLocEl = $("bbLocation");
    const bbNakEl = $("bbNakshatra");
    const bbHouseEl = $("bbHouseStatus");

    if (typeof M.computeBhriguBindu !== "function") {
      if (bbLocEl) bbLocEl.textContent = "Bhrigu Bindu unavailable — computeBhriguBindu export missing.";
      if (bbNakEl) bbNakEl.textContent = "Nakshatra: —";
      if (bbHouseEl) bbHouseEl.textContent = "No axis computed: refusing to display substitute coordinates.";
    } else {
      const bb = M.computeBhriguBindu(rahu.longitude, moon.longitude);
      if (bbLocEl) bbLocEl.textContent = `BB Axis: ${bb.rashi} ${formatDegrees(bb.rashiDeg)}`;
      if (bbNakEl) bbNakEl.textContent = `Nakshatra: ${bb.nakshatra} (Pada ${bb.pada}) · Abs: ${bb.longitude.toFixed(4)}°`;

      const ascSignIdx = M.signIndex(siderealAscendant);
      const bbHouse = ((bb.rashiIndex - ascSignIdx + 12) % 12) + 1;
      if (bbHouseEl) bbHouseEl.textContent = `Bhṛgu-bindu (Rāhu–Moon midpoint) falls in house ${bbHouse} from lagna (${bb.rashi}) — SHASTRA-SMRIT.`;
    }

    // 3. Indu Lagna — no fabricated ray-count fallback: unavailable is stated plainly.
    const induSignEl = $("induLagnaSign");
    const induRaysEl = $("induRaysMath");
    const induOccEl = $("induOccupantsStatus");

    if (typeof M.computeInduLagna !== "function") {
      if (induSignEl) induSignEl.textContent = "Indu Lagna unavailable — computeInduLagna export missing.";
      if (induRaysEl) induRaysEl.textContent = "9th Lords Ray Sum: —";
      if (induOccEl) induOccEl.textContent = "Unavailable: refusing to display substitute ray counts.";
    } else {
      const indu = M.computeInduLagna(siderealAscendant, moon.longitude);
      if (induSignEl) induSignEl.textContent = `Indu Lagna: ${indu.induLagnaRashi}`;
      if (induRaysEl) induRaysEl.textContent = `9th Lords Rays: Lagna (${indu.lagnaRays}) + Chandra (${indu.moonRays}) = ${indu.totalRays} rays`;

      const induPlanets = planets.filter((p) => M.RASHIS[M.signIndex(p.longitude)] === indu.induLagnaRashi);
      if (induOccEl) {
        if (induPlanets.length > 0) {
          induOccEl.textContent = `🌟 Wealth Occupants: ${induPlanets.map((p) => p.sa).join(", ")} residing in Indu Lagna.`;
        } else {
          induOccEl.textContent = `Indu Lagna unaspected in radix · Evaluated via 9th Lord resonance.`;
        }
      }
    }

    // 4. Chalit Outflow Shifts
    const chalitListEl = $("chalitShiftsList");
    const chalitBadgeEl = $("chalitShiftCountBadge");
    if (chalitListEl && bhava && bhava.grahas) {
      chalitListEl.innerHTML = "";
      const shifted = bhava.grahas.filter((g) => g.wholeSignBhava !== g.bhava);
      if (chalitBadgeEl) chalitBadgeEl.textContent = `${shifted.length} House Shifts Detected`;

      if (shifted.length === 0) {
        chalitListEl.innerHTML = `<div style="color:var(--green); grid-column: 1/-1;">✓ Zero Chalit shifts: All whole-sign house placements match the unequal quadrant cusps.</div>`;
      } else {
        shifted.forEach((g) => {
          const is12thOutflow = g.bhava === 12 && g.wholeSignBhava === 11;
          const card = document.createElement("div");
          card.style.background = is12thOutflow ? "rgba(255, 155, 155, 0.08)" : "rgba(255, 255, 255, 0.02)";
          card.style.border = `1px solid ${is12thOutflow ? "var(--red)" : "var(--line)"}`;
          card.style.borderRadius = "4px";
          card.style.padding = "8px 10px";
          const longVal = Number(g.longitude || 0).toFixed(2);
          const offsetVal = Number(g.bhavaOffset || 0).toFixed(2);
          card.innerHTML = `
            <div style="font-weight:700; color:${is12thOutflow ? "var(--red)" : "var(--gold)"};">${g.sa || g.key} (${g.en || ""}): H${g.wholeSignBhava} → H${g.bhava} Chalit</div>
            <div style="font-size:0.72rem; color:var(--soft); margin-top:2px;">
              λ = ${longVal}° · Madhya offset: ${offsetVal}°
              ${is12thOutflow ? '<br><strong style="color:var(--red);">⚠️ 12th-cusp shift — शास्त्र-वचन में व्यय-संकेत (SHASTRA-SMRIT)।</strong>' : ""}
            </div>
          `;
          chalitListEl.appendChild(card);
        });
      }
    }
  }

  // Global Export Handlers. An export that cannot be made (a bad input, a refused tier) says so on the status line; it
  // never throws out of the button's handler and never writes a file from older values.
  function guardExport(what, fn) {
    return function () {
      try { fn(); }
      catch (error) {
        const st = $("status");
        if (st) { st.textContent = `EXPORT NOT MADE (${what}) · ${error instanceof Error ? error.message : String(error)}`; st.className = "status fail"; }
      }
    };
  }
  window.exportComputationalJson = guardExport("JSON", function() {
    const ctx = readInstrument();
    const { timezone, latitude, longitude, tier, jd } = ctx;
    requireTierReady(tier);
    const planets = canonicalGrahaRows(jd, tier);
    const siderealAsc = M.siderealAscendantDeg(jd, latitude, longitude, tier);
    const bhava = M.bhavaModel(jd, latitude, longitude, tier);
    const ay = M.tierAyanamsha(jd, tier);
    const moon = planets.find((p) => p.key === "candra"), sun = planets.find((p) => p.key === "surya"), rahu = planets.find((p) => p.key === "rahu");

    const exportData = {
      generator: "ShunyaMath local engine",
      timestamp_utc: new Date().toISOString(),
      inputs: {
        date: isoOf(ctx.civil),
        calendar: ctx.calendar,
        time: ctx.timeText,
        timezone,
        latitude,
        longitude,
        tier,
        julian_day: jd,
      },
      tier_rules: tierRulesPayload(tier),
      ayanamsa: { name: ay.name, applied_deg: ay.deg, source: ay.source },
      ascendant: {
        sidereal_deg: siderealAsc,
        rashi: M.RASHIS[M.signIndex(siderealAsc)],
      },
      graha_longitudes: planets.map((p) => ({
        key: p.key,
        sa: p.sa,
        en: p.en,
        longitude_deg: p.longitude,
        mean_deg: p.mean,
        rashi: M.RASHIS[M.signIndex(p.longitude)],
        rashi_deg: M.mod360(p.longitude) % 30,
      })),
      bhavas_spans: bhava.bhavas,
      forensics: {
        tithi_dagdha: M.computeTithiDagdha ? M.computeTithiDagdha(Math.floor(M.mod360(moon.longitude - sun.longitude) / 12) + 1) : null,
        bhrigu_bindu: M.computeBhriguBindu ? M.computeBhriguBindu(rahu.longitude, moon.longitude) : null,
        indu_lagna: M.computeInduLagna ? M.computeInduLagna(siderealAsc, moon.longitude) : null,
      },
      verification_proof: {
        panini_hash_of_inputs: M.paniniHash ? M.paniniHash(`EXPORT:${jd}:${tier}`, 16) : null,
        bitwise_determinism: computeBitwiseDeterminism(jd, tier)
          ? "PASS (two independent recomputes byte-identical)"
          : "FAIL (recomputes diverged)",
      }
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Bharat_Ephemeris_Sphuta_${isoOf(ctx.civil)}_${ctx.timeText.replace(/:/g, "-")}_${tier.replace(/\+/g, "-")}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

  window.exportEphemerisCsv = guardExport("CSV", function() {
    const ctx = readInstrument();
    const { latitude, longitude, tier, jd } = ctx;
    requireTierReady(tier);
    const planets = canonicalGrahaRows(jd, tier);
    const siderealAsc = M.siderealAscendantDeg(jd, latitude, longitude, tier);
    const ay = M.tierAyanamsha(jd, tier);

    const velocities = M.computePlanetaryVelocities ? M.computePlanetaryVelocities(jd, { mode: tier }) : [];
    let csv = `# tier,${tier},${M.TIERS[tier].label}\n# ayanamsa,${ay.name},${ay.deg}\n# date,${isoOf(ctx.civil)},${ctx.calendar},${ctx.timeText},UTC${ctx.timezone >= 0 ? "+" : ""}${ctx.timezone}\n`;
    csv += "Graha,Sanskrit,Longitude_Deg,Rashi,Rashi_Deg,Speed_Deg_Day\n";
    csv += `Lagna,लग्न,${siderealAsc.toFixed(6)},${M.RASHIS[M.signIndex(siderealAsc)]},${(siderealAsc % 30).toFixed(4)},\n`;

    planets.forEach((p) => {
      const sIdx = M.signIndex(p.longitude);
      const within = (M.mod360(p.longitude) % 30).toFixed(4);
      const vel = velocities.find((v) => v.key === p.key);
      const speed = vel && Number.isFinite(vel.speedDegDay) ? vel.speedDegDay.toFixed(4) : "";
      csv += `${p.en},${p.sa},${p.longitude.toFixed(6)},${M.RASHIS[sIdx]},${within},${speed}\n`;
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Bharat_Ephemeris_${isoOf(ctx.civil)}_${tier.replace(/\+/g, "-")}_Positions.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

  // ══════════════════════════════════════════════════════════════════════
  // LIVE REAL-TIME GOCHARA (TRANSIT) & DUAL-MATRIX SYNTHESIS ENGINE
  // ══════════════════════════════════════════════════════════════════════
  const AUSPICIOUS_GOCHARA_HOUSES = Object.freeze({
    surya: [3, 6, 10, 11],
    candra: [1, 3, 6, 7, 10, 11],
    mangala: [3, 6, 11],
    budha: [2, 4, 6, 8, 10, 11],
    guru: [2, 5, 7, 9, 11],
    shukra: [1, 2, 3, 4, 5, 8, 9, 11, 12],
    shani: [3, 6, 11],
    rahu: [3, 6, 11],
    ketu: [3, 6, 11],
  });

  // VAI-06: one neutral template — the house count and whether the classical favourable set contains it; no health,
  // mind or money clause. The favourable sets above are the code's own table; their textual source is not named
  // here [unverified].
  const GOCHARA_GRAHA_LABEL = Object.freeze({
    surya: "सूर्य (Sūrya)", candra: "चन्द्र (Candra)", mangala: "मङ्गल (Maṅgala)", budha: "बुध (Budha)", guru: "गुरु (Guru)",
    shukra: "शुक्र (Śukra)", shani: "शनि (Śani)", rahu: "राहु (Rāhu)", ketu: "केतु (Ketu)",
  });
  function getGocharaReading(grahaKey, hMoon) {
    const set = AUSPICIOUS_GOCHARA_HOUSES[grahaKey] || [];
    const isGood = set.includes(hMoon);
    const sadeSati = grahaKey === "shani" && [12, 1, 2].includes(hMoon)
      ? " Houses 12/1/2 from the natal Moon are called sāḍhe-sātī in later tradition (SHASTRA-SMRIT)."
      : "";
    return `${GOCHARA_GRAHA_LABEL[grahaKey] || grahaKey} in house ${hMoon} from the natal Moon — ${isGood ? "in" : "outside"} the classical favourable gochara set (${set.join(", ")}; source [unverified]).${sadeSati} शास्त्र-वचन (SHASTRA-SMRIT) — फल नहीं, स्वास्थ्य-परामर्श नहीं।`;
  }

  function getAspectDescription(diffDeg) {
    if (diffDeg <= 6) return { name: "Yuti (Conjunction 0°)", icon: "☌", color: "var(--gold)" };
    if (diffDeg >= 174) return { name: "Pratiyuti (Opposition 180°)", icon: "☍", color: "var(--red)" };
    if (diffDeg >= 114 && diffDeg <= 126) return { name: "Trikona (Trine 120°)", icon: "△", color: "var(--green)" };
    if (diffDeg >= 84 && diffDeg <= 96) return { name: "Kendra (Square 90°)", icon: "□", color: "var(--cyan)" };
    if (diffDeg >= 56 && diffDeg <= 64) return { name: "Sextile (60°)", icon: "⚹", color: "var(--green)" };
    return { name: `Offset ${diffDeg.toFixed(1)}°`, icon: "∠", color: "var(--soft)" };
  }

  // The transit instant: the gochara date (the page's one signed parser, the Instrument's calendar) and civil time,
  // read in the Instrument's UTC offset. "Now" is the device clock converted into that offset — never the device's zone.
  let gocharaInitialized = false;
  function initGocharaInputs(ctx) {
    const dEl = $("gochara-date");
    const tEl = $("gochara-time");
    const syncBtn = $("gochara-sync-now");
    if (!dEl || !tEl) return;
    if ((!dEl.value || !tEl.value) && ctx) {
      const now = nowInZone(ctx.timezone, ctx.calendar);
      if (!dEl.value) dEl.value = now.date;
      if (!tEl.value) tEl.value = now.time;
    }
    if (!gocharaInitialized) {
      if (syncBtn) {
        syncBtn.addEventListener("click", () => {
          let tz = Number(controls.timezone.value), calendar = "gregorian";
          try { calendar = selectedCalendar(); } catch (error) { calendar = "gregorian"; }
          if (!Number.isFinite(tz) || Math.abs(tz) > 14) tz = 0;
          const now = nowInZone(tz, calendar);
          dEl.value = now.date;
          tEl.value = now.time;
          render();
        });
      }
      dEl.addEventListener("input", scheduleRender);
      dEl.addEventListener("change", render);
      tEl.addEventListener("input", scheduleRender);
      tEl.addEventListener("change", render);
      gocharaInitialized = true;
    }
  }

  /** The transit: { civil, timeText, jd } from the gochara inputs, or an InputError naming the field. */
  function readTransit(ctx) {
    initGocharaInputs(ctx);
    const dEl = $("gochara-date"), tEl = $("gochara-time");
    let civil;
    try { civil = parseCivilDate(dEl.value, ctx.calendar, "Transit date"); }
    catch (error) { setHelper("gochara-date-helper", error.message, true); throw error; }
    setHelper("gochara-date-helper", `${dateHelperText(civil)} · UTC${ctx.timezone >= 0 ? "+" : ""}${ctx.timezone}`);
    const timeText = /^\d{2}:\d{2}$/.test(tEl.value) ? `${tEl.value}:00` : tEl.value;
    if (!/^\d{2}:\d{2}:\d{2}$/.test(timeText)) throw new InputError("Transit time: enter a civil time (HH:MM[:SS]).");
    return { civil, timeText, jd: M.civilToJd(civil, timeText, ctx.timezone) };
  }

  function renderLiveGochara(ctx, natalPlanets, natalAscendant) {
    const { tier, latitude, longitude, timezone, calendar } = ctx;
    const natalJd = ctx.jd;
    const transit = readTransit(ctx);
    const tJd = transit.jd;
    const tPlanets = canonicalGrahaRows(tJd, tier);
    const tAsc = M.siderealAscendantDeg(tJd, latitude, longitude, tier);
    const transitResult = { ...transit, planets: tPlanets, ascendant: tAsc };

    const jdEl = $("gochara-jd-value");
    const lagnaEl = $("gochara-lagna-value");
    if (jdEl) jdEl.textContent = `${tJd.toFixed(6)} (${fmtDateTime(tJd, timezone, calendar)})`;
    if (lagnaEl) lagnaEl.textContent = `${M.RASHIS[M.signIndex(tAsc)]} ${formatDegrees(tAsc % 30, 2)}`;
    const indicator = $("gochara-live-indicator");
    if (indicator) indicator.textContent = `transit ${isoOf(transit.civil)} ${transit.timeText} · UTC${timezone >= 0 ? "+" : ""}${timezone}`;

    // 1. Radix D1 Kundali
    const radixContainer = $("chart-radix-container");
    if (radixContainer) {
      const radixRow = [{ key: "lagna", sa: "ल", en: "Lagna", isLagna: true, text: "ल", color: "#f0d47d", sign: M.signIndex(natalAscendant) }];
      natalPlanets.forEach((g) => {
        radixRow.push({ key: g.key, sa: g.sa, en: g.en, isLagna: false, text: g.sa.replace("ः", ""), color: "#f0d47d", sign: M.signIndex(g.longitude) });
      });
      radixContainer.innerHTML = vargaChartSvg({ code: "Janma", name: "Radix D1" }, radixRow);
    }

    // 2. Live Gochara D1 Kundali
    const gocharaContainer = $("chart-gochara-container");
    if (gocharaContainer) {
      const gocharaRow = [{ key: "lagna", sa: "ल", en: "Lagna", isLagna: true, text: "लᵗ", color: "#00e5ff", sign: M.signIndex(tAsc) }];
      tPlanets.forEach((g) => {
        gocharaRow.push({ key: g.key, sa: g.sa, en: g.en, isLagna: false, text: g.sa.replace("ः", "") + "ᵗ", color: "#00e5ff", sign: M.signIndex(g.longitude) });
      });
      gocharaContainer.innerHTML = vargaChartSvg({ code: "Gochara", name: "Live Transit D1" }, gocharaRow);
    }

    // 3. Composite Superimposed Kundali
    const compositeContainer = $("chart-composite-container");
    if (compositeContainer) {
      const compRow = [
        { key: "lagna", sa: "ल", en: "Lagna", isLagna: true, text: "ल", color: "#f0d47d", sign: M.signIndex(natalAscendant) },
        { key: "lagna_t", sa: "लᵗ", en: "Transit Lagna", isLagna: true, text: "लᵗ", color: "#00e5ff", sign: M.signIndex(tAsc) }
      ];
      natalPlanets.forEach((g) => {
        compRow.push({ key: g.key, sa: g.sa, en: g.en, isLagna: false, text: g.sa.replace("ः", ""), color: "#f0d47d", sign: M.signIndex(g.longitude) });
      });
      tPlanets.forEach((g) => {
        compRow.push({ key: g.key + "_t", sa: g.sa + "ᵗ", en: "Transit " + g.en, isLagna: false, text: g.sa.replace("ः", "") + "ᵗ", color: "#00e5ff", sign: M.signIndex(g.longitude) });
      });
      compositeContainer.innerHTML = vargaChartSvg({ code: "Composite", name: "Janma + Gochara Overlay" }, compRow);
    }

    // 4. Combined Diagnostic Matrix Table
    const tableBody = $("gochara-matrix-body");
    if (!tableBody) return;
    tableBody.replaceChildren();

    const natalMoon = rowOf(natalPlanets, "candra");
    const natalMoonSign = M.signIndex(natalMoon.longitude);
    const natalAscSign = M.signIndex(natalAscendant);

    tPlanets.forEach((tp) => {
      const np = rowOf(natalPlanets, tp.key);
      const nSign = M.signIndex(np.longitude);
      const tSign = M.signIndex(tp.longitude);

      const hLagna = ((tSign - natalAscSign + 12) % 12) + 1;
      const hMoon = ((tSign - natalMoonSign + 12) % 12) + 1;

      let angleDiff = Math.abs(M.mod360(tp.longitude - np.longitude));
      if (angleDiff > 180) angleDiff = 360 - angleDiff;

      const aspect = getAspectDescription(angleDiff);
      const isGood = (AUSPICIOUS_GOCHARA_HOUSES[tp.key] || []).includes(hMoon);
      // janma-gate: until the user actually enters a janma epoch in the
      // Instrument, natal == "now" and every self-separation is a meaningless
      // 0.00° conjunction — so the शास्त्र-संकेत column stays gated.
      const reading = janmaEntered
        ? getGocharaReading(tp.key, hMoon)
        : `<span style="color:var(--soft);">janma दर्ज करो — ऊपर Instrument में जन्म-दिनांक/समय भरो, तभी शास्त्र-संकेत दिखेंगे। (अभी natal = वर्तमान क्षण ही है, इसलिए तुलना निरर्थक है)</span>`;

      const row = document.createElement("tr");

      // Graha
      const cellGraha = document.createElement("th");
      cellGraha.scope = "row";
      cellGraha.style.whiteSpace = "nowrap";
      cellGraha.innerHTML = `<strong>${tp.sa}</strong> <span style="font-size:0.75rem; color:var(--soft);">${tp.en}</span>`;
      row.appendChild(cellGraha);

      // Janma Radix
      const cellRadix = document.createElement("td");
      cellRadix.style.fontFamily = "var(--mono)";
      cellRadix.innerHTML = `<span style="color:var(--gold); font-weight:700;">${M.RASHIS[nSign]}</span> ${(np.longitude % 30).toFixed(2)}°<br><span style="font-size:0.7rem; color:var(--soft);">H${((nSign - natalAscSign + 12) % 12) + 1} from Lagna</span>`;
      row.appendChild(cellRadix);

      // Live Gochara
      const cellTransit = document.createElement("td");
      cellTransit.style.fontFamily = "var(--mono)";
      cellTransit.innerHTML = `<span style="color:var(--cyan); font-weight:700;">${M.RASHIS[tSign]}</span> ${(tp.longitude % 30).toFixed(2)}°<br><span style="font-size:0.7rem; color:var(--soft);">Abs: ${tp.longitude.toFixed(2)}°</span>`;
      row.appendChild(cellTransit);

      // House reckoning
      const cellHouse = document.createElement("td");
      cellHouse.innerHTML = `<div><strong style="color:var(--gold);">H${hLagna}</strong> from Lagna</div><div style="font-size:0.76rem;"><strong style="color:var(--cyan);">H${hMoon}</strong> from Moon</div>`;
      row.appendChild(cellHouse);

      // Separation & Aspect
      const cellAspect = document.createElement("td");
      cellAspect.innerHTML = `<div style="font-family:var(--mono); color:${aspect.color}; font-weight:700;">${aspect.icon} ${aspect.name}</div><div style="font-size:0.72rem; color:var(--soft);">Δθ = ${angleDiff.toFixed(2)}°</div>`;
      row.appendChild(cellAspect);

      // Status
      const cellStatus = document.createElement("td");
      cellStatus.innerHTML = isGood
        ? `<span class="badge badge-green" style="font-size:0.7rem; padding:3px 6px;">शुभ-सूची में (SHASTRA-SMRIT)</span>`
        : `<span class="badge" style="font-size:0.7rem; padding:3px 6px;">शुभ-सूची के बाहर (SHASTRA-SMRIT)</span>`;
      row.appendChild(cellStatus);

      // शास्त्र-संकेत cell (janma-gated)
      const cellReading = document.createElement("td");
      cellReading.style.fontSize = "0.78rem";
      cellReading.style.lineHeight = "1.4";
      cellReading.innerHTML = reading;
      row.appendChild(cellReading);

      tableBody.appendChild(row);
    });

    // 5. Live Daśā Dual-Engine: Vimśottarī (the tier's, by time) & Yoginī (the tier's year). A failure is written into the
    //    panel ("not computed: …"), never swallowed.
    const notComputed = (ids, message) => { for (const id of ids) { const el = $(id); if (el) { el.textContent = `not computed: ${message}`; el.classList.add("not-computed-note"); } } };
    const computed = (ids) => { for (const id of ids) { const el = $(id); if (el) el.classList.remove("not-computed-note"); } };
    const vimsIds = ["live-vims-maha", "live-vims-antara", "live-vims-span"];
    try {
      if (tJd < natalJd) throw new RangeError(`the transit (${fmtDate(tJd, timezone, calendar)}) is before the birth instant (${fmtDate(natalJd, timezone, calendar)})`);
      const liveVims = M.vimshottariTier(natalJd, tJd, tier);
      computed(vimsIds);
      $("live-vims-maha").textContent = liveVims.maha ? `${liveVims.maha.lord} Mahādaśā` : "not computed: no mahādaśā at the transit";
      $("live-vims-antara").textContent = liveVims.antara ? `${liveVims.antara.lord} Antardaśā` : "not computed: no antardaśā at the transit";
      $("live-vims-span").textContent = liveVims.antara
        ? `Antardaśā span: ${fmtDate(liveVims.antara.startJd, timezone, calendar)} → ${fmtDate(liveVims.antara.endJd, timezone, calendar)} · year ${liveVims.year.days} d (${liveVims.year.source}) · balance by time (BPHS 46.16)`
        : "—";
    } catch (e) {
      notComputed(vimsIds, e.message);
    }

    const yoginiIds = ["live-yogini-maha", "live-yogini-antara", "live-yogini-span"];
    try {
      if (tJd < natalJd) throw new RangeError(`the transit (${fmtDate(tJd, timezone, calendar)}) is before the birth instant (${fmtDate(natalJd, timezone, calendar)})`);
      const yearDays = M.TIERS[tier].dashaYear.days;
      const liveYogini = M.yoginiAtJd(natalMoon.longitude, natalJd, tJd, { yearDays });
      computed(yoginiIds);
      $("live-yogini-maha").textContent = liveYogini.maha ? `${liveYogini.maha.meta.name} (${liveYogini.maha.meta.sa}) · Lord ${liveYogini.maha.meta.lordSa} [${liveYogini.maha.meta.deity}]` : "not computed: no period at the transit";
      $("live-yogini-antara").textContent = liveYogini.antara ? `${liveYogini.antara.meta.name} (${liveYogini.antara.meta.sa}) Sub-Period` : "—";
      $("live-yogini-span").textContent = liveYogini.maha
        ? `Cycle span: ${fmtDate(liveYogini.maha.startJd, timezone, calendar)} → ${fmtDate(liveYogini.maha.endJd, timezone, calendar)} · year ${yearDays} d (the tier's daśā year)`
        : "—";
    } catch (e) {
      notComputed(yoginiIds, e.message);
    }

    // 6. Jaimini 8-Chara Kāraka Hierarchy & Kārakāṃśa Matrix
    try {
      const jaimini = M.computeJaiminiCharaKarakas(natalPlanets);
      const kSignEl = $("jaimini-karakamsha-sign");
      if (kSignEl) kSignEl.textContent = `${jaimini.karakamshaLagna} (D9 of ${jaimini.atmaKaraka.sa})`;

      const jaiminiBody = $("jaimini-karakas-body");
      if (jaiminiBody) {
        jaiminiBody.replaceChildren();
        jaimini.karakas.forEach((k) => {
          const jRow = document.createElement("tr");

          // Karaka Badge
          const cKaraka = document.createElement("th");
          cKaraka.scope = "row";
          cKaraka.style.whiteSpace = "nowrap";
          const isAK = k.karaka.code === "AK";
          const isAmK = k.karaka.code === "AmK";
          const badgeColor = isAK ? "var(--gold)" : isAmK ? "var(--cyan)" : "var(--text)";
          cKaraka.innerHTML = `<span style="color:${badgeColor}; font-weight:700;">${k.karaka.code}</span> <span style="font-size:0.75rem; color:var(--soft);">(${k.karaka.sa})</span>`;
          jRow.appendChild(cKaraka);

          // Graha
          const cGraha = document.createElement("td");
          cGraha.innerHTML = `<strong>${k.sa}</strong> <span style="font-size:0.75rem; color:var(--soft);">${k.en}</span>`;
          jRow.appendChild(cGraha);

          // Degree in Sign
          const cDeg = document.createElement("td");
          cDeg.style.fontFamily = "var(--mono)";
          cDeg.innerHTML = `${k.withinDeg.toFixed(4)}° <span style="font-size:0.7rem; color:var(--soft);">(Eff: ${k.effectiveDeg.toFixed(2)}°)</span>`;
          jRow.appendChild(cDeg);

          // Rashi
          const cRashi = document.createElement("td");
          cRashi.style.fontFamily = "var(--mono)";
          cRashi.textContent = k.rashi;
          jRow.appendChild(cRashi);

          // Navamsha
          const cD9 = document.createElement("td");
          cD9.style.fontFamily = "var(--mono)";
          cD9.style.color = isAK ? "var(--gold-strong)" : "var(--text)";
          cD9.innerHTML = `<strong>${k.d9Sign}</strong>${isAK ? " 🌟 (KL)" : ""}`;
          jRow.appendChild(cD9);

          // Role & Signification
          const cRole = document.createElement("td");
          cRole.style.fontSize = "0.78rem";
          cRole.textContent = k.karaka.role;
          jRow.appendChild(cRole);

          // Live Transit Trigger
          const cTransit = document.createElement("td");
          cTransit.style.fontSize = "0.75rem";
          const directTransits = tPlanets.filter((tp) => M.signIndex(tp.longitude) === k.rashiIndex);
          if (directTransits.length > 0) {
            cTransit.innerHTML = `<span class="badge badge-gold" style="font-size:0.68rem; padding:2px 6px;">⚡ Direct Transit</span> ${directTransits.map(tp => tp.sa).join(", ")} in ${k.rashi}`;
          } else {
            cTransit.innerHTML = `<span style="color:var(--soft);">No conjunctions in ${k.rashi}</span>`;
          }
          jRow.appendChild(cTransit);

          jaiminiBody.appendChild(jRow);
        });
      }
    } catch (e) {
      const jaiminiBody = $("jaimini-karakas-body");
      if (jaiminiBody) {
        jaiminiBody.innerHTML = `<tr><td colspan="7" class="not-computed-note"></td></tr>`;
        jaiminiBody.querySelector("td").textContent = `not computed: ${e.message}`;
      }
      const kSignEl = $("jaimini-karakamsha-sign");
      if (kSignEl) kSignEl.textContent = "not computed";
    }

    // 7. Macro-transit cards — VAI-06 / P0-10: gated behind a janma entry like the table above; house counts and the
    // tradition's names only. No health, finance or "stance" advice.
    const tShani = rowOf(tPlanets, "shani");
    const tGuru = rowOf(tPlanets, "guru");
    const tRahu = rowOf(tPlanets, "rahu");

    const shaniHouseFromMoon = ((M.signIndex(tShani.longitude) - natalMoonSign + 12) % 12) + 1;
    const guruHouseFromMoon = ((M.signIndex(tGuru.longitude) - natalMoonSign + 12) % 12) + 1;
    const guruHouseFromLagna = ((M.signIndex(tGuru.longitude) - natalAscSign + 12) % 12) + 1;
    const rahuHouseFromLagna = ((M.signIndex(tRahu.longitude) - natalAscSign + 12) % 12) + 1;
    const TRAD = " शास्त्र-वचन (SHASTRA-SMRIT) — फल नहीं, सलाह नहीं।";
    const JANMA_PROMPT = "janma दर्ज करो — ऊपर Instrument में जन्म-दिनांक/समय भरो; तभी जन्म-चन्द्र से गोचर-गणना दिखेगी।";
    const cards = [
      ["macro-shani-title", "macro-shani-desc"], ["macro-guru-title", "macro-guru-desc"],
      ["macro-rahu-title", "macro-rahu-desc"], ["macro-strategy-title", "macro-strategy-desc"],
    ];
    if (!janmaEntered) {
      for (const [t, d] of cards) {
        if ($(t)) $(t).textContent = "—";
        if ($(d)) $(d).textContent = JANMA_PROMPT;
      }
      return transitResult;
    }

    // Shani card
    const shaniTitle = $("macro-shani-title");
    const shaniDesc = $("macro-shani-desc");
    if (shaniTitle && shaniDesc) {
      const inSet = [3, 6, 11].includes(shaniHouseFromMoon);
      shaniTitle.textContent = `Saturn in house ${shaniHouseFromMoon} from natal Moon (${M.RASHIS[M.signIndex(tShani.longitude)]})`;
      shaniDesc.textContent = [12, 1, 2].includes(shaniHouseFromMoon)
        ? `Houses 12/1/2 from the natal Moon (${M.RASHIS[natalMoonSign]}) are called sāḍhe-sātī in later tradition.` + TRAD
        : `House ${shaniHouseFromMoon} is ${inSet ? "in" : "outside"} the classical favourable set for Saturn (3, 6, 11).` + TRAD;
    }

    // Guru card
    const guruTitle = $("macro-guru-title");
    const guruDesc = $("macro-guru-desc");
    if (guruTitle && guruDesc) {
      const inSet = [2, 5, 7, 9, 11].includes(guruHouseFromMoon);
      guruTitle.textContent = `Jupiter in house ${guruHouseFromMoon} from natal Moon, H${guruHouseFromLagna} from Lagna (${M.RASHIS[M.signIndex(tGuru.longitude)]})`;
      guruDesc.textContent = `House ${guruHouseFromMoon} is ${inSet ? "in" : "outside"} the classical favourable set for Jupiter (2, 5, 7, 9, 11).` + TRAD;
    }

    // Rahu card
    const rahuTitle = $("macro-rahu-title");
    const rahuDesc = $("macro-rahu-desc");
    if (rahuTitle && rahuDesc) {
      rahuTitle.textContent = `Axis: ${M.RASHIS[M.signIndex(tRahu.longitude)]} / ${M.RASHIS[(M.signIndex(tRahu.longitude) + 6) % 12]} (H${rahuHouseFromLagna} from Lagna)`;
      rahuDesc.textContent = `The mean nodal axis falls in houses ${rahuHouseFromLagna} and ${((rahuHouseFromLagna + 5) % 12) + 1} from the natal Lagna.` + TRAD;
    }

    // Summary card (P0-10: was "Actionable Executive Protocol")
    const stratTitle = $("macro-strategy-title");
    const stratDesc = $("macro-strategy-desc");
    if (stratTitle && stratDesc) {
      const isGuruGood = [2, 5, 7, 9, 11].includes(guruHouseFromMoon);
      const isShaniGood = [3, 6, 11].includes(shaniHouseFromMoon);
      const n = (isGuruGood ? 1 : 0) + (isShaniGood ? 1 : 0);
      stratTitle.textContent = `परम्परा के अनुकूल-गोचर गिनती: ${n} / 2 (गुरु ${isGuruGood ? "हाँ" : "नहीं"} · शनि ${isShaniGood ? "हाँ" : "नहीं"})`;
      stratDesc.textContent = n === 2
        ? "गुरु और शनि दोनों का गोचर परम्परा में अनुकूल गिना जाता है (SHASTRA-SMRIT) — निवेश या व्यापार-निर्णय का आधार नहीं / Tradition counts both transits favourable (SHASTRA-SMRIT) — not a basis for investment or business decisions."
        : "परम्परा की गोचर-सूची की गिनती मात्र (SHASTRA-SMRIT) — निवेश, व्यापार या स्वास्थ्य-निर्णय का आधार नहीं / A count against the tradition's transit list (SHASTRA-SMRIT) — not a basis for investment, business or health decisions.";
    }
    return transitResult;
  }

  // The muhūrta start date follows the Instrument's date until the visitor edits it ("Instrument" re-links it). Whatever
  // triggers the scan (a render, the button, a change of category or horizon), it starts at local civil midnight of the
  // start date shown, so the same date always gives the same rows (PG-07).
  let muhurtaStartLinked = true;
  function renderMuhurtaScanner(ctx) {
    const categoryEl = $("muhurta-category");
    const horizonEl = $("muhurta-horizon");
    const startDateEl = $("muhurta-start-date");
    const resultsCountEl = $("muhurta-results-count");
    const resultsBody = $("muhurta-results-body");
    if (!resultsBody || !startDateEl) return;
    const { tier, latitude, longitude, timezone, calendar, site } = ctx;

    if (muhurtaStartLinked || !startDateEl.value.trim()) startDateEl.value = isoOf(ctx.civil);
    let startCivil;
    try { startCivil = parseCivilDate(startDateEl.value, calendar, "Muhūrta start date"); }
    catch (error) {
      setHelper("muhurta-start-date-helper", error.message, true);
      throw error;
    }
    setHelper("muhurta-start-date-helper", `${dateHelperText(startCivil)}${muhurtaStartLinked ? " · follows the Instrument's date" : ""}`);
    const startLabel = isoOf(startCivil);
    const category = categoryEl ? categoryEl.value : "business";
    const horizonDays = horizonEl ? parseInt(horizonEl.value, 10) : 30;
    const startJd = M.civilToJd(startCivil, "00:00:00", timezone);   // local civil midnight of the start date

    const windows = M.scanAuspiciousMuhurtas(startJd, horizonDays, category, latitude, longitude, timezone, tier);
    if (resultsCountEl) resultsCountEl.textContent = `${windows.length} Windows Ranked (from ${startLabel}, ${horizonDays} days)`;

    resultsBody.replaceChildren();
    if (windows.length === 0) {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td colspan="5" style="text-align:center; color:var(--soft); padding:16px;"></td>`;
      tr.firstChild.textContent = `No windows meeting the threshold in the ${horizonDays} days from ${startLabel}. Expand the horizon or select another archetype.`;
      resultsBody.appendChild(tr);
      return windows;
    }

    windows.forEach((win) => {
      const tr = document.createElement("tr");

      // पञ्चक-वर्ग re-classification (app layer, computed): the tithi at the day's sunrise from the same tier,
      // class = (tithi-in-paksha − 1) % 5.
      const winPan = M.panchangAtJd(win.jd, timezone, tier, site);
      const tithiInPaksha = (winPan.tithiIndex % 15) + 1;
      const tithiLabel = `${TITHI_PANCHAKA[(tithiInPaksha - 1) % 5]} तिथि · ${win.tithiName}`;

      // त्याज्य-योग caution (display layer; the v1 score does not include yoga-śuddhi)
      const isTyajyaYoga = TYAJYA_YOGAS.some((y) => (win.yogaName || "").includes(y));

      // Date (the civil date of that day's sunrise, in the Instrument's calendar) & Vāra (from sunrise)
      const tdDate = document.createElement("th");
      tdDate.scope = "row";
      tdDate.style.whiteSpace = "nowrap";
      tdDate.innerHTML = `<strong style="color:var(--gold); font-family:var(--mono);"></strong><br><span style="font-size:0.75rem; color:var(--soft);"></span>`;
      tdDate.querySelector("strong").textContent = fmtDate(win.jd, timezone, calendar);
      tdDate.querySelector("span").textContent = `${win.varaName} · sunrise ${fmtClock(win.jd, timezone)}`;
      tr.appendChild(tdDate);

      // Factors
      const tdFactors = document.createElement("td");
      tdFactors.innerHTML = `<div><strong>Tithi:</strong> ${tithiLabel}</div><div style="font-size:0.76rem;"><strong>Nakṣatra:</strong> ${win.nakshatraName}</div><div style="font-size:0.72rem; color:${isTyajyaYoga ? "var(--red)" : "var(--cyan)"};"><strong>Yoga:</strong> ${win.yogaName}${isTyajyaYoga ? " (त्याज्य)" : ""}</div>`;
      tr.appendChild(tdFactors);

      // Quality — badge demoted to caution styling when a त्याज्य yoga is present
      const tdScore = document.createElement("td");
      if (isTyajyaYoga) {
        tdScore.innerHTML = `<span class="badge" style="font-size:0.75rem; padding:4px 8px; font-weight:700; color:var(--red); border:1px solid var(--red); background:rgba(255,155,155,0.08);">${win.score}%* ${win.quality}</span><div style="font-size:0.66rem; color:var(--red); margin-top:2px;">* योग-शुद्धि v1 score में अगणित (PENDING)</div>`;
      } else {
        const badgeClass = win.score >= 90 ? "badge-gold" : win.score >= 75 ? "badge-green" : "badge-cyan";
        tdScore.innerHTML = `<span class="badge ${badgeClass}" style="font-size:0.75rem; padding:4px 8px; font-weight:700;">${win.score}% ${win.quality}</span>`;
      }
      tr.appendChild(tdScore);

      // Abhijit — the row's own (math-core: the tier's day and its muhūrtas), never recomputed with another sunrise rule.
      const tdWindow = document.createElement("td");
      tdWindow.style.fontSize = "0.78rem";
      tdWindow.style.lineHeight = "1.4";
      if (win.abhijit && Number.isFinite(win.abhijit.startJd) && Number.isFinite(win.abhijit.endJd)) {
        tdWindow.innerHTML = `<strong style="color:var(--gold-strong);"></strong><br><span style="font-size:0.7rem; color:var(--soft);"></span>`;
        tdWindow.querySelector("strong").textContent = `${fmtClock(win.abhijit.startJd, timezone).slice(0, 5)} – ${fmtClock(win.abhijit.endJd, timezone).slice(0, 5)}`;
        tdWindow.querySelector("span").textContent = `अभिजित — ${win.abhijit.source || "the 8th muhūrta of the day"}`;
      } else {
        tdWindow.innerHTML = `<span class="not-computed-note"></span>`;
        tdWindow.firstChild.textContent = `not computed: ${win.bestWindowTime || "no Abhijit for this day"}`;
      }
      tr.appendChild(tdWindow);

      // Positives & Strengths — tithi positive re-labelled with its true पञ्चक-वर्ग
      const tdStrengths = document.createElement("td");
      tdStrengths.style.fontSize = "0.75rem";
      tdStrengths.style.lineHeight = "1.4";
      const fixedPositives = win.positives.map((p) =>
        /Tithi/.test(p) ? p.replace(/^Pūrṇa\/Bhadra Tithi/, `${tithiLabel.split(" · ")[0]}`) : p
      );
      const posMarkup = fixedPositives.map(p => `<span style="color:var(--green);">✓</span> ${p}`).join("<br>");
      let cautMarkup = win.cautions.length > 0 ? "<br>" + win.cautions.map(c => `<span style="color:var(--red);">⚠️</span> ${c}`).join("<br>") : "";
      if (isTyajyaYoga) cautMarkup += `<br><span style="color:var(--red);">⚠️</span> त्याज्य योग (${win.yogaName}) — मुहूर्त-शास्त्र में वर्जित`;
      tdStrengths.innerHTML = posMarkup + cautMarkup + (win.rule ? `<br><span style="color:var(--dim); font-size:0.68rem;">${win.rule}</span>` : "");
      tr.appendChild(tdStrengths);

      resultsBody.appendChild(tr);
    });
    return windows;
  }

  /** The muhūrta panel on its own (its controls re-run only this panel, from the last good Instrument). */
  function rerunMuhurta() {
    if (!lastCtx) return;
    panel("muhurta-scanner", () => { renderMuhurtaScanner(lastCtx); refreshTierStrip("muhurta-scanner", lastCtx); });
    updateSectionHeadlines();
  }

  /** A failure inside one card of a panel: written into that card, never swallowed. */
  function cardNotComputed(el, error, colspan) {
    if (!el) return;
    const message = `not computed: ${error && error.message ? error.message : String(error)}`;
    if (el.tagName === "TBODY") {
      el.innerHTML = `<tr><td class="not-computed-note" colspan="${colspan || 1}"></td></tr>`;
      el.querySelector("td").textContent = message;
    } else {
      el.innerHTML = `<div class="not-computed-note" style="grid-column: 1 / -1;"></div>`;
      el.firstChild.textContent = message;
    }
  }

  function renderAshtakavargaAndYogas(planets, siderealAscendant, jd, latitude, longitude, transit, ctx) {
    // 1. Sarvashtakavarga Grid with the transit grahas of the gochara instant (the same instant as the gochara panel)
    const savGrid = $("sav-rashi-grid");
    if (savGrid) {
      try {
        const av = M.computeAshtakavarga(planets, siderealAscendant);
        const livePlanets = transit && Array.isArray(transit.planets) ? transit.planets : [];
        const liveLabel = transit ? `Gochara ${isoOf(transit.civil)} ${transit.timeText}` : "";

        savGrid.replaceChildren();
        av.rashis.forEach((r) => {
          const card = document.createElement("div");
          card.style.background = "var(--hero)";
          card.style.border = r.savBindus >= 30 ? "1px solid var(--gold)" : r.savBindus >= 28 ? "1px solid rgba(162, 230, 178, 0.4)" : "1px solid var(--line)";
          card.style.borderRadius = "var(--radius-sm)";
          card.style.padding = "10px";
          card.style.textAlign = "center";

          const transitingHere = livePlanets.filter((lp) => M.signIndex(lp.longitude) === r.index);
          const transitBadge = transitingHere.length > 0
            ? `<div style="font-size:0.68rem; color:var(--cyan); margin-top:4px; border-top:1px solid rgba(0,229,255,0.2); padding-top:2px;">⚡ ${liveLabel}: ${transitingHere.map(p => p.sa).join(", ")}</div>`
            : "";

          const badgeColor = r.savBindus >= 30 ? "var(--gold-strong)" : r.savBindus >= 28 ? "var(--green)" : "var(--soft)";
          card.innerHTML = `
            <div style="font-size:0.75rem; color:var(--soft); font-family:var(--mono);">${r.index + 1}. ${r.name}</div>
            <div style="font-size:1.35rem; font-weight:800; color:${badgeColor}; margin:4px 0;">${r.savBindus}</div>
            <div style="font-size:0.68rem; color:${badgeColor};">${r.status}</div>
            ${transitBadge}
          `;
          savGrid.appendChild(card);
        });
      } catch (e) { cardNotComputed(savGrid, e, 1); }
    }

    // 2. Classical Yogas Detected
    const yogasContainer = $("yogas-list-container");
    if (yogasContainer) {
      try {
        const yogas = M.computeClassicalYogas(planets, siderealAscendant);
        yogasContainer.replaceChildren();
        if (yogas.length === 0) {
          yogasContainer.innerHTML = `<div style="grid-column:1/-1; color:var(--soft); padding:12px;">Standard shastric configuration active; no extreme singular yoga thresholds met.</div>`;
        } else {
          yogas.forEach((y) => {
            const card = document.createElement("div");
            card.style.background = "var(--hero)";
            card.style.border = "1px solid var(--line)";
            card.style.borderRadius = "var(--radius-sm)";
            card.style.padding = "12px";

            const catBadge = y.category.includes("Pañca") ? "badge-gold" : y.category.includes("Rāja") ? "badge-cyan" : "badge-green";
            card.innerHTML = `
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                <strong style="color:var(--gold-strong); font-size:0.86rem;">${y.name}</strong>
                <span class="badge ${catBadge}" style="font-size:0.68rem;">${y.category}</span>
              </div>
              <div style="font-size:0.74rem; color:var(--cyan); margin-bottom:4px; font-family:var(--mono);">Grahas: ${y.graha}</div>
              <div style="font-size:0.76rem; color:var(--soft); line-height:1.4;">${y.desc} <span style="color:var(--dim); font-size:0.68rem;">(SHASTRA-SMRIT — शास्त्र-वचन, नियति नहीं)</span></div>
            `;
            yogasContainer.appendChild(card);
          });
        }
      } catch (e) { cardNotComputed(yogasContainer, e, 1); }
    }

    // 3. Ṣaḍbala Scorecard
    const shadbalaBody = $("shadbala-table-body");
    if (shadbalaBody) {
      try {
        const shadbala = M.computeShadbala(planets, siderealAscendant, jd, latitude, longitude);
        shadbalaBody.replaceChildren();
        shadbala.forEach((sb) => {
          const tr = document.createElement("tr");

          const thGraha = document.createElement("th");
          thGraha.scope = "row";
          thGraha.innerHTML = `<strong>${sb.sa}</strong> <span style="font-size:0.72rem; color:var(--soft);">${sb.en}</span>`;
          tr.appendChild(thGraha);

          const tdSthana = document.createElement("td");
          tdSthana.style.fontFamily = "var(--mono)";
          tdSthana.textContent = sb.sthanaBala.toFixed(1);
          tr.appendChild(tdSthana);

          const tdDig = document.createElement("td");
          tdDig.style.fontFamily = "var(--mono)";
          tdDig.textContent = sb.digBala.toFixed(1);
          tr.appendChild(tdDig);

          const tdKala = document.createElement("td");
          tdKala.style.fontFamily = "var(--mono)";
          tdKala.textContent = sb.kalaBala.toFixed(1);
          tr.appendChild(tdKala);

          const tdCheshta = document.createElement("td");
          tdCheshta.style.fontFamily = "var(--mono)";
          tdCheshta.textContent = sb.cheshtaBala.toFixed(1);
          tr.appendChild(tdCheshta);

          const tdNaisargika = document.createElement("td");
          tdNaisargika.style.fontFamily = "var(--mono)";
          tdNaisargika.textContent = sb.naisargikaBala.toFixed(1);
          tr.appendChild(tdNaisargika);

          const tdDrik = document.createElement("td");
          tdDrik.style.fontFamily = "var(--mono)";
          tdDrik.textContent = sb.drikBala.toFixed(1);
          tr.appendChild(tdDrik);

          const tdTotal = document.createElement("td");
          tdTotal.style.fontFamily = "var(--mono)";
          tdTotal.innerHTML = `<strong style="color:var(--gold);">${sb.totalRupas.toFixed(2)} Rūpas</strong> <span style="font-size:0.7rem; color:var(--soft);">(${sb.totalVirupas.toFixed(0)}v)</span>`;
          tr.appendChild(tdTotal);

          const tdReq = document.createElement("td");
          tdReq.style.fontFamily = "var(--mono)";
          tdReq.textContent = `${sb.reqRupas.toFixed(1)} R`;
          tr.appendChild(tdReq);

          const tdAdequacy = document.createElement("td");
          const isOk = sb.ratioPct >= 100;
          const badgeClass = isOk ? "badge-green" : "badge-gold";
          tdAdequacy.innerHTML = `<span class="badge ${badgeClass}" style="font-size:0.72rem; padding:2px 6px;">${Math.round(sb.ratioPct)}% ${isOk ? "✓ High Potency" : "Normal"}</span>`;
          tr.appendChild(tdAdequacy);

          shadbalaBody.appendChild(tr);
        });
      } catch (e) { cardNotComputed(shadbalaBody, e, 10); }
    }

    // 4. Pushkara & Mrityu Bhaga Table
    const pushkaraBody = $("pushkara-table-body");
    if (pushkaraBody) {
      try {
        const pmResults = M.computePushkaraAndMrityuBhaga(planets);
        pushkaraBody.replaceChildren();
        pmResults.forEach((pm) => {
          const tr = document.createElement("tr");

          const thGraha = document.createElement("th");
          thGraha.scope = "row";
          thGraha.innerHTML = `<strong>${pm.sa}</strong> <span style="font-size:0.72rem; color:var(--soft);">${pm.en}</span>`;
          tr.appendChild(thGraha);

          const tdLon = document.createElement("td");
          tdLon.style.fontFamily = "var(--mono)";
          tdLon.textContent = `${pm.rashi} (${pm.longitude.toFixed(2)}°)`;
          tr.appendChild(tdLon);

          const tdWithin = document.createElement("td");
          tdWithin.style.fontFamily = "var(--mono)";
          tdWithin.textContent = `${pm.withinDeg.toFixed(2)}°`;
          tr.appendChild(tdWithin);

          const tdNav = document.createElement("td");
          tdNav.innerHTML = pm.isPushkaraNav
            ? `<span class="badge badge-green" style="font-size:0.7rem; padding:2px 6px;">🌟 Active Amṛta Slot</span>`
            : `<span style="color:var(--soft); font-size:0.75rem;">Standard</span>`;
          tr.appendChild(tdNav);

          const tdBhaga = document.createElement("td");
          tdBhaga.innerHTML = pm.isPushkaraBhaga
            ? `<span class="badge badge-gold" style="font-size:0.7rem; padding:2px 6px;">👑 Exact Degree Peak</span>`
            : `<span style="color:var(--soft); font-size:0.75rem;">None</span>`;
          tr.appendChild(tdBhaga);

          const tdMb = document.createElement("td");
          tdMb.innerHTML = pm.isMrityuBhaga
            ? `<span class="badge" style="font-size:0.7rem; padding:2px 6px;">मृत्यु-भाग अंश (शास्त्र-सूची)</span>`
            : `<span style="color:var(--soft); font-size:0.75rem;">—</span>`;
          tr.appendChild(tdMb);

          const tdStatus = document.createElement("td");
          tdStatus.style.fontSize = "0.78rem";
          tdStatus.textContent = pm.status;
          tr.appendChild(tdStatus);

          pushkaraBody.appendChild(tr);
        });
      } catch (e) { cardNotComputed(pushkaraBody, e, 7); }
    }
  }

  function renderBphsAdvanced(ctx, planets, lagnaDeg) {
    if (typeof M.computeSpecialLagnas !== "function") throw new Error("computeSpecialLagnas is missing from math-core");
    const { jd, latitude: lat, longitude: lon, timezone: tz, tier } = ctx;

    const sun = rowOf(planets, "surya");
    const moon = rowOf(planets, "candra");
    const mars = rowOf(planets, "mangala");
    const merc = rowOf(planets, "budha");
    const jup = rowOf(planets, "guru");
    const ven = rowOf(planets, "shukra");
    const sat = rowOf(planets, "shani");

    const grahaPos = {
      sun: sun.longitude,
      moon: moon.longitude,
      mars: mars.longitude,
      mercury: merc.longitude,
      jupiter: jup.longitude,
      venus: ven.longitude,
      saturn: sat.longitude
    };

    // 1. Special Lagnas (from the tier's own sunrise of the civil day holding the instant) & Upagrahas
    const lagnas = M.computeSpecialLagnas(jd, lat, lon, sun.longitude, moon.longitude, lagnaDeg, tz, tier);
    const upagrahas = M.computeUpagrahas(sun.longitude, jd, lat, lon, tz, tier);

    const lagnasUpBody = $("bphs-lagnas-upagrahas-body");
    if (lagnasUpBody) {
      const sunriseNote = lagnas.error ? "" : ` · ishṭa ${lagnas.ishtaGhati.toFixed(3)} ghaṭī from the tier's sunrise ${fmtDateTime(lagnas.sunriseJd, tz, ctx.calendar)} (${lagnas.ishtaRule})`;
      const L = (key) => (lagnas.error ? { deg: null, note: lagnas.error } : lagnas[key]);
      const items = [
        { name: "भाव लग्न (Bhāva Lagna)", cat: "Special Lagna (Ch. 5)", row: L("bhavaLagna"), principle: "1 Rāśi per 5 Ghaṭīs (2 hrs) from Sunrise" + sunriseNote },
        { name: "होरा लग्न (Horā Lagna)", cat: "Special Lagna (Ch. 5)", row: L("horaLagna"), principle: "1 Rāśi per 2.5 Ghaṭīs (1 hr) from Sunrise" + sunriseNote },
        { name: "घटी लग्न (Ghaṭī Lagna)", cat: "Special Lagna (Ch. 5)", row: L("ghatiLagna"), principle: "1 Rāśi per 1 Ghaṭī (24 mins) from Sunrise" + sunriseNote },
        { name: "प्राणपद लग्न (Prāṇapada Lagna)", cat: "Special Lagna (Ch. 5)", row: L("pranapadaLagna"), principle: "1 Rāśi per 1 Vighaṭī from Sunrise" + sunriseNote },
        { name: "श्री लग्न (Śrī Lagna)", cat: "Special Lagna (Ch. 5)", row: L("sriLagna"), principle: "Lagna + Moon Nakṣatra progression * 360°" },
        { name: "इन्दु लग्न (Indu Lagna)", cat: "Special Lagna (Ch. 5)", row: L("induLagna"), principle: "9th Lord Kalā ray summation from Lagna & Moon — a rāśi (BPHS gives no degree)" },
        { name: "धूम (Dhūma)", cat: "Upagraha (Ch. 25)", row: upagrahas.dhuma, principle: "Sun + 133° 20' (Smoky Solar Node)" },
        { name: "व्यतीपात (Vyatīpāta)", cat: "Upagraha (Ch. 25)", row: upagrahas.vyatipata, principle: "360° - Dhūma" },
        { name: "परिवेष (Pariveṣa / Paridhi)", cat: "Upagraha (Ch. 25)", row: upagrahas.parivesha, principle: "Vyatīpāta + 180° (Halo Upagraha)" },
        { name: "इन्द्रचाप (Indracāpa / Koduṇḍa)", cat: "Upagraha (Ch. 25)", row: upagrahas.indrachapa, principle: "360° - Pariveṣa (Rainbow Node)" },
        { name: "उपकेतु (Upaketu / Śikhī)", cat: "Upagraha (Ch. 25)", row: upagrahas.upaketu, principle: "Indracāpa + 16° 40' (Cyclic Sun Return Invariant)" },
        { name: "गुलिक / मान्दि (Gulika / Māndi)", cat: "Kāla Upagraha (BPHS 3.66–70)", row: upagrahas.gulika, principle: upagrahas.gulika.deg == null ? upagrahas.gulika.note : `BPHS 3.66–70: ${upagrahas.gulika.isDay ? "दिन (सूर्योदय→सूर्यास्त)" : "रात्रि (सूर्यास्त→सूर्योदय)"} के 8 समान भाग, स्वामी वार-क्रम से (${upagrahas.gulika.isDay ? "वारेश से" : "वारेश से पाँचवें से"}), आठवाँ भाग निरीश; शनि-भाग के आरम्भ का लग्न (आरम्भ बनाम मध्य — परम्परा-भेद [unverified]; यहाँ आरम्भ) · तह का सूर्योदय/सूर्यास्त` }
      ];

      lagnasUpBody.innerHTML = items.map(item => {
        const row = item.row || {};
        if (row.deg == null && Number.isInteger(row.rashi)) {
          // a rāśi only (Indu lagna): no degree, no nakṣatra or pada
          return `<tr><td style="font-weight: 700; color: var(--gold);">${item.name}</td><td><span class="badge badge-gold">${item.cat}</span></td><td><span lang="sa" style="color:var(--gold);">${M.RASHI_SA[row.rashi]}</span> · ${M.RASHIS[row.rashi]} (rāśi only)</td><td>— (a rāśi has no nakṣatra)</td><td style="font-size: 0.78rem; color: var(--soft);">${item.principle}</td></tr>`;
        }
        if (row.deg == null) {
          const note = row.note ? String(row.note).replace(/^not computed:\s*/, "") : "";   // math-core's note may carry the prefix already
          return `<tr><td style="font-weight: 700; color: var(--gold);">${item.name}</td><td><span class="badge badge-cyan">${item.cat}</span></td><td colspan="2" class="not-computed-note">not computed${note ? `: ${note}` : ""}</td><td style="font-size: 0.78rem; color: var(--soft);">${item.principle}</td></tr>`;
        }
        const nak = M.computeNakshatraDetails(row.deg);
        const rIndex = Math.floor(M.mod360(row.deg) / 30);
        return `
          <tr>
            <td style="font-weight: 700; color: var(--gold);">${item.name}</td>
            <td><span class="badge ${item.cat.includes('Lagna') ? 'badge-gold' : 'badge-cyan'}">${item.cat}</span></td>
            <td>${formatDegrees(row.deg)} · <span lang="sa" style="color:var(--gold);">${M.RASHI_SA[rIndex]}</span></td>
            <td>${nak.number}. ${nak.name} (चरण ${nak.pada})</td>
            <td style="font-size: 0.78rem; color: var(--soft);">${item.principle}</td>
          </tr>
        `;
      }).join("");
    }

    // 2. Arudha Padas & Argala
    const padas = M.computeArudhaPadas(lagnaDeg, grahaPos);
    const argala = M.computeArgala(grahaPos, lagnaDeg);
    const arudhaBody = $("bphs-arudha-argala-body");
    if (arudhaBody) {
      const devJoin = (arr) => arr.map(grahaDev).join(", ");
      arudhaBody.innerHTML = padas.map((p, idx) => {
        const arg = argala[idx] || {};
        const p2 = (arg.primaryArgala && arg.primaryArgala['2nd'].length) ? `2nd: ${devJoin(arg.primaryArgala['2nd'])}` : '';
        const p4 = (arg.primaryArgala && arg.primaryArgala['4th'].length) ? `4th: ${devJoin(arg.primaryArgala['4th'])}` : '';
        const p11 = (arg.primaryArgala && arg.primaryArgala['11th'].length) ? `11th: ${devJoin(arg.primaryArgala['11th'])}` : '';
        const primStr = [p2, p4, p11].filter(Boolean).join(' · ') || '—';

        const o12 = (arg.obstruction && arg.obstruction['12th'].length) ? `12th: ${devJoin(arg.obstruction['12th'])}` : '';
        const o10 = (arg.obstruction && arg.obstruction['10th'].length) ? `10th: ${devJoin(arg.obstruction['10th'])}` : '';
        const o3 = (arg.obstruction && arg.obstruction['3rd'].length) ? `3rd: ${devJoin(arg.obstruction['3rd'])}` : '';
        const obstStr = [o12, o10, o3].filter(Boolean).join(' · ') || 'None';

        return `
          <tr>
            <td style="font-weight: 700;">भाव ${p.house}</td>
            <td><strong style="color: var(--cyan);">${p.nameSa}</strong> (${p.key})</td>
            <td><span lang="sa" style="color:var(--gold); font-weight:700;">${p.rashiSa}</span> (Sign ${p.rashiIndex + 1})</td>
            <td style="font-size: 0.78rem;">${primStr}</td>
            <td style="font-size: 0.78rem; color: var(--red);">${obstStr}</td>
            <td>
              <span class="badge ${arg.isUnobstructed ? 'badge-green' : 'badge-gold'}">
                ${arg.isUnobstructed ? '✓ Unobstructed (' + arg.argalaStrength + ')' : 'Net Balanced (0)'}
              </span>
            </td>
          </tr>
        `;
      }).join("");
    }

    // 3. Ashtakavarga Shodhana & Pinda Sadhana
    const av = M.computeAshtakavarga(planets, lagnaDeg);
    const shodh = M.computeAshtakavargaShodhana(av.sav, grahaPos);
    const shodhBody = $("bphs-shodhana-body");
    if (shodhBody) {
      shodhBody.innerHTML = `
        <tr>
          <td style="font-weight: 700; color: var(--soft);">1. Raw SAV Bindus (मूल बिन्दु)</td>
          ${shodh.rawBindus.map(b => `<td style="text-align:center;">${b}</td>`).join("")}
          <td style="font-weight: 700; color: var(--cyan); text-align:center;">337</td>
        </tr>
        <tr>
          <td style="font-weight: 700; color: var(--gold);">2. Trikona Shodhita (त्रिकोण शोधित)</td>
          ${shodh.trikonaShodhita.map(b => `<td style="text-align:center; font-weight:600; color:var(--gold);">${b}</td>`).join("")}
          <td style="font-weight: 700; color: var(--gold); text-align:center;">${shodh.trikonaShodhita.reduce((a,b)=>a+b, 0)}</td>
        </tr>
        <tr style="background: rgba(0, 229, 255, 0.04);">
          <td style="font-weight: 700; color: var(--cyan);">3. Ekādhipatya Shodhita (एकाधिपत्य शोधित)</td>
          ${shodh.ekadhipatyaShodhita.map(b => `<td style="text-align:center; font-weight:700; color:var(--cyan);">${b}</td>`).join("")}
          <td style="font-weight: 700; color: var(--cyan); text-align:center;">${shodh.ekadhipatyaShodhita.reduce((a,b)=>a+b, 0)}</td>
        </tr>
        <tr style="background: rgba(145, 221, 163, 0.08);">
          <td style="font-weight: 800; color: var(--green);">4. Pinda Sādhana (पिण्ड साधना)</td>
          <td colspan="6" style="font-size:0.8rem; color:var(--soft); padding:8px 12px;">
            <b>Rāśi Piṇḍa:</b> ${shodh.rasiPinda} &nbsp;·&nbsp; <b>Graha Piṇḍa:</b> ${shodh.grahaPinda}
          </td>
          <td colspan="6" style="font-size:0.88rem; font-weight:800; color:var(--green); text-align:right; padding:8px 12px;">
            Śodhya Piṇḍa (शोध्य पिण्ड) = ${shodh.shodhyaPinda}
          </td>
          <td style="font-weight: 800; color: var(--green); text-align:center;">${shodh.shodhyaPinda}</td>
        </tr>
      `;
    }

    // 4. Vedic Birth Doshas & Shanti Scanner
    const doshas = M.computeBirthDoshasAndShanti(jd, lat, lon, sun.longitude, moon.longitude, lagnaDeg, tz, tier);
    const doshaBox = $("bphs-dosha-container");
    const DOSHA_NOTE = `<div style="grid-column: 1 / -1; font-size: 0.74rem; color: var(--dim);">गणना घोषित है — भाग्य नहीं। ये BPHS अ. 84–96 के जन्म-क्षण-वर्गीकरण हैं (शास्त्र-वचन) — नियति, भय या आचरण-निर्देश नहीं।</div>`;
    if (doshaBox) {
      if (!janmaEntered) {
        doshaBox.innerHTML = `<div style="grid-column: 1 / -1; color: var(--soft); font-size: 0.82rem;">janma दर्ज करो — ऊपर Instrument में जन्म-दिनांक/समय भरो; तभी जन्म-क्षण के शास्त्रीय वर्गीकरण दिखेंगे।</div>`;
      } else if (doshas.length === 0) {
        doshaBox.innerHTML = `
          <div style="grid-column: 1 / -1; background: var(--hero); border: 1px solid var(--line); border-radius: var(--radius-sm); padding: 14px; color: var(--soft); font-size: 0.88rem;">
            इस जन्म-क्षण पर BPHS अ. 84–96 के वर्गीकरण लागू नहीं होते।
          </div>
        ` + DOSHA_NOTE;
      } else {
        doshaBox.innerHTML = DOSHA_NOTE + doshas.map(d => `
          <div style="background: var(--hero); border: 1px solid var(--line); border-radius: var(--radius-sm); padding: 12px 14px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
              <strong style="color: var(--gold); font-size: 0.88rem;">${d.nameSa}</strong>
            </div>
            <div style="font-size: 0.72rem; color: var(--cyan); font-family: var(--mono); margin-bottom: 6px;">${d.bphsChapter}</div>
            <div style="font-size: 0.76rem; color: var(--soft); line-height: 1.4;">${d.description}</div>
          </div>
        `).join("");
      }
    }
  }

  /* One eclipse row of any tier, in the page's words (the rows are math-core's, unchanged):
     text tiers — { kind, middleJd, total, magnitude (the grāsa, a fraction of the eclipsed disc), contactsJd { sparsha,
       madhya, moksha, nimilana, unmilana }, seenAtSite, method };
     dṛk — drik-grahana.js rows { kind, type, maxJdUT, magnitude (lunar: the umbral magnitude, NEGATIVE for a penumbral
       eclipse), penumbralMagnitude, contacts { P1 … P4 }, local { magnitude, contacts { C1 … C4 }, visible, … } }.
     A row that math-core has already normalised (the C4 row contract: middleJd, contacts { sparsha, madhya, moksha },
     magnitude, penumbral, penumbralMagnitude, grasa, seenAtSite, tier, source) is read as it is. A penumbral eclipse is
     shown as penumbral with its penumbral magnitude — never as a negative grāsa. */
  function eclipseView(e, fallbackMethod) {
    const kind = e.kind === "solar" ? "solar" : "lunar";
    const middleJd = Number.isFinite(e.middleJd) ? e.middleJd : Number.isFinite(e.maxJdUT) ? e.maxJdUT : null;
    const type = e.type || (e.total === true ? "total" : e.total === false ? "partial" : null);
    const penumbral = e.isPenumbral === true || e.penumbral === true || type === "penumbral";
    let magnitude;
    if (penumbral) {
      const pm = Number.isFinite(e.penumbralMagnitude) ? e.penumbralMagnitude : null;
      magnitude = `penumbral (उपच्छाया) — penumbral magnitude ${pm === null ? "—" : pm.toFixed(4)}; the umbra does not reach the Moon (no grāsa)`;
    } else if (kind === "solar" && e.local && Number.isFinite(e.local.magnitude)) {
      // the greatest eclipse's magnitude: the row's 'global' block (C4 rows, whose magnitude is the site's), else the
      // row's own magnitude when it is not the site's
      const atGreatest = e.global && Number.isFinite(e.global.magnitude) ? e.global.magnitude
        : Number.isFinite(e.magnitude) && e.magnitude !== e.local.magnitude ? e.magnitude : null;
      magnitude = `${e.local.magnitude.toFixed(4)} at this place (fraction of the Sun's diameter)${atGreatest !== null ? ` · ${atGreatest.toFixed(4)} at greatest eclipse` : ""}`;
    } else {
      const g = Number.isFinite(e.grasa) ? e.grasa : e.magnitude;
      magnitude = Number.isFinite(g) ? `${g.toFixed(4)}${kind === "lunar" && e.umbralMagnitude !== undefined ? " (umbral)" : " (grāsa: fraction of the disc)"}` : "—";
    }
    const contacts = [];
    const add = (label, jd) => { if (Number.isFinite(jd)) contacts.push([label, jd]); };
    if (e.contactsJd) for (const k of ["sparsha", "nimilana", "madhya", "unmilana", "moksha"]) add(k, e.contactsJd[k]);
    else if (kind === "solar" && e.local && e.local.contacts) for (const k of ["C1", "C2", "C3", "C4"]) add(k, e.local.contacts[k]);
    else if (e.contacts) for (const k of Object.keys(e.contacts)) add(k, e.contacts[k]);
    let place;
    const textRow = Boolean(e.contactsJd) || e.source === "text";          // the text's own visibility test, or the tier's
    if (e.seenAtSite === true) place = `seen at this place${textRow ? " (the text's test)" : ""}`;
    else if (e.seenAtSite === false) place = "not seen at this place (below the horizon)";
    else if (kind === "solar" && e.local) place = e.local.visible ? "visible here" : "the place is in it, with the Sun below the horizon";
    else if (kind === "lunar") place = "wherever the Moon is up";
    else place = "—";
    let typeText = type || (penumbral ? "penumbral" : "—");
    const globalType = (e.global && e.global.type) || type;                 // C4 rows: type = the site's, global.type = the eclipse's
    if (kind === "solar" && e.local && e.local.type && globalType && e.local.type !== globalType) typeText = `${globalType} (globally) · ${e.local.type} here`;
    return { kind, middleJd, type: typeText, penumbral, magnitude, contacts, place, method: e.method || fallbackMethod || "—" };
  }

  function renderEclipseRows(ss14, tz, calendar) {
    const body = $("ss-eclipse-body");
    const lunar = ss14.adhikara4_chandra_grahana.eclipses || { list: [] };
    const solar = ss14.adhikara5_surya_grahana.eclipses || { list: [] };
    // a block math-core could not serve: an error, or a refusal (the dṛk EDGE RULE near 1850.0 / 2150.0 refuses this block
    // alone, with list null) — said so, never shown as "no eclipse"
    const blocked = (b) => (b.error ? { refused: false, message: String(b.error) }
      : b.refused === true ? { refused: true, message: String(b.refusal || b.reason || b.method || "refused") } : null);
    const stop = blocked(lunar) || blocked(solar);
    const views = stop ? [] : [...(lunar.list || []).map((e) => eclipseView(e, lunar.method)), ...(solar.list || []).map((e) => eclipseView(e, solar.method))]
      .sort((a, b) => (a.middleJd || 0) - (b.middleJd || 0));
    if (body) {
      body.replaceChildren();
      if (stop) {
        const tr = document.createElement("tr");
        tr.innerHTML = `<td colspan="7" class="not-computed-note"></td>`;
        tr.firstChild.textContent = `${stop.refused ? "refused" : "not computed"}: ${stop.message}`;
        body.appendChild(tr);
      } else if (!views.length) {
        const tr = document.createElement("tr");
        tr.innerHTML = `<td colspan="7" style="color: var(--soft);"></td>`;
        const node = Number.isFinite(lunar.nearestNodeDeg) ? ` The Moon is ${lunar.nearestNodeDeg.toFixed(2)}° from the nearer node (Rāhu or Ketu) at the instant.` : "";
        tr.firstChild.textContent = `No eclipse within ±16 days of the instant at this place (${lunar.method}).${node}`;
        body.appendChild(tr);
      }
      for (const v of views) {
        const tr = document.createElement("tr");
        appendHeader(tr, v.kind === "lunar" ? "चन्द्र-ग्रहण · lunar" : "सूर्य-ग्रहण · solar", "row");
        appendCell(tr, v.type);
        appendCell(tr, Number.isFinite(v.middleJd) ? fmtDateTime(v.middleJd, tz, calendar) : "—", "accent");
        appendCell(tr, v.magnitude);
        appendCell(tr, v.contacts.length ? v.contacts.map(([k, jd]) => `${k} ${fmtClock(jd, tz)}`).join(" · ") : "—");
        appendCell(tr, v.place);
        appendCell(tr, v.method);
        body.appendChild(tr);
      }
    }
    return { views, nearestNodeDeg: lunar.nearestNodeDeg, method: lunar.method, error: stop ? stop.message : null, refused: Boolean(stop && stop.refused) };
  }

  function renderSuryaSiddhanta14Adhikaras(ctx, planets, lagnaDeg) {
    if (typeof M.computeSuryaSiddhanta14Adhikaras !== "function") throw new Error("computeSuryaSiddhanta14Adhikaras is missing from math-core");
    const { jd, latitude: lat, longitude: lon, timezone: tz, tier, calendar } = ctx;

    const ss14 = M.computeSuryaSiddhanta14Adhikaras(jd, lat, lon, planets, lagnaDeg, tz, tier);
    const ecl = renderEclipseRows(ss14, tz, calendar);
    const lunarViews = ecl.views.filter((v) => v.kind === "lunar"), solarViews = ecl.views.filter((v) => v.kind === "solar");
    const nodeText = Number.isFinite(ecl.nearestNodeDeg) ? ` · Moon ${ecl.nearestNodeDeg.toFixed(2)}° from the nearer node` : "";
    const eclipseWord = ecl.refused ? "refused" : "not computed";
    const eclipseMetric = (list, word) => (ecl.error ? `${eclipseWord}: ${ecl.error}`
      : list.length ? list.map((v) => `${word} ${v.type} · ${Number.isFinite(v.middleJd) ? fmtDateTime(v.middleJd, tz, calendar) : "—"} · ${v.magnitude}`).join(" | ")
        : `No ${word.toLowerCase()} eclipse within ±16 days${nodeText}`);

    // Heliacal rows arrive in fixed engine order [candra, mangala, budha, guru,
    // shukra, shani]; the rows carry the Devanagari name.
    const HELIACAL_ORDER = ["candra", "mangala", "budha", "guru", "shukra", "shani"];
    const heliacalName = (i) => grahaDev(HELIACAL_ORDER[i] || "");

    // Śaṅku: the noon shadow and the shadow at the instant, separately, with the method
    const tri = ss14.adhikara3_triprashna, sh = tri.shanku || {};
    let shankuText;
    if (sh.error) shankuText = `not computed: ${sh.error}`;
    else {
      const parts = [];
      if (sh.noon && Number.isFinite(sh.noon.chaya)) parts.push(`madhyāhna (noon) shadow ${sh.noon.chaya.toFixed(2)} aṅgula (${sh.noon.dir === "S" ? "pointing south" : "pointing north"})`);
      const at = sh.atInstant || {};
      if (Number.isFinite(at.chaya) && at.above !== false && !(Number.isFinite(at.altitudeDeg) && at.altitudeDeg <= 0)) parts.push(`at this instant ${at.chaya.toFixed(2)} aṅgula`);
      else parts.push("at this instant: the Sun is below the horizon (no shadow)");
      if (Number.isFinite(tri.palabha)) parts.push(`palabhā ${tri.palabha.toFixed(2)}`);
      shankuText = parts.join(" · ");
    }

    // 1. 14 Adhikaras Telemetry Table
    const ss14Body = $("ss-14adhikaras-body");
    if (ss14Body) {
      const a1 = ss14.adhikara1_madhyama;
      const rows = [
        { ch: "अध्याय १: मध्यमाधिकारः", domain: "Mean Motions & Mahāyuga Cycles", metric: `Ahargaṇa ${Math.floor(a1.ahargana)} days (${a1.aharganaRule}) · UMT ${a1.ujjainTime} · LMT here ${a1.localMeanTime}`, formula: "4,320,000 Solar Years = 1,577,917,828 Sāvana Days" },
        { ch: "अध्याय २: स्पष्टाधिकारः", domain: "Manda & Śīghra True Epicycles", metric: `9 graha places & velocities of this tier (${ss14.adhikara2_spashta.vels.length} tracks computed)`, formula: "Pulsating Variable Epicycles with Sine Quadrants (Jyā-Paridhi)" },
        { ch: "अध्याय ३: त्रिप्रश्नाधिकारः", domain: "Direction, Place & 12-Digit Shadow", metric: `Śaṅku: ${shankuText}`, formula: sh.method || "SS 3: the 12-aṅgula gnomon" },
        { ch: "अध्याय ४: चन्द्रग्रहणाधिकारः", domain: "Lunar Eclipse & Earth Shadow", metric: eclipseMetric(lunarViews, "Lunar"), formula: ecl.method || "—" },
        { ch: "अध्याय ५: सूर्यग्रहणाधिकारः", domain: "Solar Eclipse & Parallax (lambana, nati)", metric: eclipseMetric(solarViews, "Solar"), formula: `${ecl.method || "—"} · ${ss14.adhikara5_surya_grahana.parallaxProvenance}` },
        { ch: "अध्याय ६: छेद्यकाधिकारः", domain: "Geometric Eclipse Path Projection", metric: `Akṣa-Valana: ${ss14.adhikara6_chedyaka.akshaValana.toFixed(4)} · Ayana-Valana: ${ss14.adhikara6_chedyaka.ayanaValana.toFixed(4)} (sāyana Sun ${ss14.adhikara6_chedyaka.sayanaSun.toFixed(3)}°, ε ${ss14.adhikara6_chedyaka.obliquityDeg.toFixed(4)}°)`, formula: "Total Valana = Akṣa-Valana + Ayana-Valana Deflections" },
        { ch: "अध्याय ७: ग्रहयुत्यधिकारः", domain: "Planetary Conjunctions & Grahayuddha", metric: ss14.adhikara7_graha_yuti.wars.length ? `${ss14.adhikara7_graha_yuti.wars.length} Active Planetary Wars / Conjunctions` : "Zero Active Planetary War (All Tara separations > 1°)", formula: "4 War Classes: Bhedha, Ullekha, Anśuvimarda, Apasavya" },
        { ch: "अध्याय ८: भग्रहयुत्यधिकारः", domain: "27 Yogatārās & Rohiṇī-śakaṭa", metric: ss14.adhikara8_bha_graha_yuti.isRohiniShakata ? `⚠️ Rohiṇī-śakaṭa-bheda: ${ss14.adhikara8_bha_graha_yuti.shakataBheda.map((x) => x.graha).join(", ")}` : "No graha breaks Rohiṇī's cart", formula: ss14.adhikara8_bha_graha_yuti.rule },
        { ch: "अध्याय ९: उदयास्ताधिकारः", domain: "Heliacal Rising, Setting & Combustion", metric: `${ss14.adhikara9_udaya_asta.heliacalStatus.filter(h => h.isCombust).length} Grahas Combust (Asta) · ${ss14.adhikara9_udaya_asta.heliacalStatus.filter(h => !h.isCombust).length} Visible`, formula: "Planetary Visibility Arcs: Moon 12°, Mars 17°, Merc 14°, Jup 11°, Ven 10°, Sat 15°" },
        { ch: "अध्याय १०: शृङ्गोन्नत्यधिकारः", domain: "Lunar Horns Elevation & Crescent Width", metric: `Illuminated: ${(ss14.adhikara10_shringonnati.illuminatedFraction * 100).toFixed(1)}% · ${ss14.adhikara10_shringonnati.elevatedHorn}`, formula: "Crescent Width = Moon Diameter × (1 - cos(Elongation)) / 2" },
        { ch: "अध्याय ११: पाताधिकारः", domain: "Mahāpāta (Vyatīpāta & Vaidhṛti)", metric: ss14.adhikara11_pata.isVyatipataActive ? "⚠️ Active Vyatīpāta Mahāpāta" : ss14.adhikara11_pata.isVaidhritiActive ? "⚠️ Active Vaidhṛti Mahāpāta" : "No Active Mahāpāta Solar-Lunar Declination Clash", formula: "Vyatīpāta: Sun + Moon = 180° · Vaidhṛti: Sun + Moon = 360°" },
        { ch: "अध्याय १२: भूगोलाध्यायः", domain: "Cosmography & 4 Prime Meridian Cities", metric: "4 quadrant stations from Laṅkā on the Ujjayinī meridian (Ujjayinī, Yamakoṭi, Romaka, Siddhapura)", formula: "Earth Diameter = 1,600 Yojanas · Circumference = 5,059 Yojanas" },
        { ch: "अध्याय १३: ज्योतिषोपनिषदध्यायः", domain: "Armillary Sphere & 4 Classical Yantras", metric: "Readings for Ghaṭī, Śaṅku, Cakra, and Dhanur Yantras", formula: "Ghaṭī-Yantra: 60-Pala sinking copper bowl with calibrated orifice" },
        { ch: "अध्याय १४: मानाध्यायः", domain: "9 Classical Time Reckonings (Nava-Māna)", metric: "Brāhma, Daiva, Mānuṣa, Pitrya, Saura, Sāvana, Cāndra, Nākṣatra, Bārhaspatya", formula: "Unified Chronometry bridging Human Seconds to Cosmic Kalpas" }
      ];

      ss14Body.innerHTML = rows.map(r => `
        <tr>
          <td style="font-weight: 700; color: var(--gold);">${r.ch}</td>
          <td><span class="badge badge-cyan" style="font-size: 0.72rem;">${r.domain}</span></td>
          <td style="font-size: 0.8rem; font-weight: 600; white-space: normal;">${r.metric}</td>
          <td style="font-size: 0.76rem; color: var(--soft); white-space: normal;">${r.formula}</td>
        </tr>
      `).join("");
    }

    // 2. Grahana, War, Horn Status Cards
    const grStatus = $("ss-grahana-status");
    const grDesc = $("ss-grahana-desc");
    if (grStatus && grDesc) {
      const first = ecl.views[0];
      if (ecl.error) {
        grStatus.textContent = eclipseWord.toUpperCase();
        grStatus.style.color = "var(--red)";
        grDesc.textContent = `${eclipseWord}: ${ecl.error}`;
      } else if (first) {
        grStatus.textContent = `${first.kind === "lunar" ? "चन्द्र-ग्रहण · LUNAR" : "सूर्य-ग्रहण · SOLAR"} ECLIPSE (${first.type}) · ${Number.isFinite(first.middleJd) ? fmtDateTime(first.middleJd, tz, calendar) : "—"}`;
        grStatus.style.color = "var(--red)";
        grDesc.textContent = `${first.magnitude} · ${first.place} · ${first.method}${ecl.views.length > 1 ? ` · ${ecl.views.length} eclipses within ±16 days (table below)` : ""}`;
      } else {
        grStatus.textContent = "✓ NO ECLIPSE WITHIN ±16 DAYS";
        grStatus.style.color = "var(--gold-strong)";
        grDesc.textContent = `${ecl.method}${nodeText}.`;
      }
    }

    const yuddhaStatus = $("ss-yuddha-status");
    const yuddhaDesc = $("ss-yuddha-desc");
    if (yuddhaStatus && yuddhaDesc) {
      // Combust names by fixed heliacal order — देवनागरी lookup, empty → "None".
      const combustList = ss14.adhikara9_udaya_asta.heliacalStatus
        .map((h, i) => (h.isCombust ? heliacalName(i) : null))
        .filter(Boolean).join(", ") || "None";
      if (ss14.adhikara7_graha_yuti.wars.length > 0) {
        const w = ss14.adhikara7_graha_yuti.wars[0];
        yuddhaStatus.textContent = `⚠️ ACTIVE PLANETARY WAR: ${w.p1} vs ${w.p2}`;
        yuddhaStatus.style.color = "var(--red)";
        yuddhaDesc.textContent = `Separation: ${w.separationArcmin}′ (${w.warType}). Northern planet in latitude prevails. Combust: ${combustList}.`;
      } else {
        yuddhaStatus.textContent = "✓ ALL 5 STAR PLANETS CLEAR (> 1° Separation)";
        yuddhaStatus.style.color = "var(--cyan)";
        yuddhaDesc.textContent = `Zero planetary war collisions detected. Combust Grahas (Asta within visibility arc): ${combustList}.`;
      }
    }

    const shringStatus = $("ss-shringonnati-status");
    const shringDesc = $("ss-shringonnati-desc");
    if (shringStatus && shringDesc) {
      shringStatus.textContent = `🌙 ${(ss14.adhikara10_shringonnati.illuminatedFraction * 100).toFixed(1)}% ILLUMINATED (${ss14.adhikara10_shringonnati.elevatedHorn})`;
      shringStatus.style.color = "var(--green)";
      shringDesc.textContent = `Crescent Width: ${ss14.adhikara10_shringonnati.crescentWidthAngula.toFixed(2)} Aṅgulas. Mahāpāta Status: ${ss14.adhikara11_pata.isVyatipataActive ? '⚠️ Active Vyatīpāta' : ss14.adhikara11_pata.isVaidhritiActive ? '⚠️ Active Vaidhṛti' : '✓ Clear'}.`;
    }

    // 3. 4 Prime Meridian Cities & 4 Instruments Table
    const citiesYantrasBody = $("ss-cities-yantras-body");
    if (citiesYantrasBody) {
      const allItems = [
        ...ss14.adhikara12_bhugola.fourCities.map(c => ({ name: c.name, cat: "Prime Meridian Station (Ch. 12)", reading: `Longitude ${c.lonDeg.toFixed(4)}° (${c.offsetHours})`, func: c.role })),
        ...ss14.adhikara13_jyotishopanishad.instruments.map(y => ({ name: y.name, cat: "Astronomical Yantra (Ch. 13)", reading: y.reading, func: y.principle }))
      ];

      citiesYantrasBody.innerHTML = allItems.map(item => `
        <tr>
          <td style="font-weight: 700; color: var(--gold);">${item.name}</td>
          <td><span class="badge ${item.cat.includes('Station') ? 'badge-gold' : 'badge-green'}">${item.cat}</span></td>
          <td style="font-family: var(--mono); font-size: 0.8rem; color: var(--cyan);">${item.reading}</td>
          <td style="font-size: 0.78rem; color: var(--soft);">${item.func}</td>
        </tr>
      `).join("");
    }

    // 4. The 9 mānas, as math-core computes them for this tier (no fallback names; a missing value is said so)
    const manasGrid = $("ss-manas-grid");
    if (manasGrid) {
      manasGrid.replaceChildren();
      for (const m of ss14.adhikara14_manadhyaya.nineManas) {
        const value = m.activeUnit === undefined || m.activeUnit === null || /undefined|null|NaN/.test(String(m.activeUnit)) ? "not computed" : String(m.activeUnit);
        const card = document.createElement("div");
        card.style.cssText = "background: var(--hero); border: 1px solid var(--line); border-radius: var(--radius-sm); padding: 10px 12px;";
        card.innerHTML = `<div style="font-size: 0.72rem; color: var(--gold); font-weight: 700; font-family: var(--mono);"></div><div style="font-weight: 700; color: var(--cyan); font-size: 0.84rem; margin: 3px 0;"></div><div style="font-size: 0.72rem; color: var(--soft);"></div>`;
        card.children[0].textContent = m.name;
        card.children[1].textContent = value;
        if (value === "not computed") card.children[1].className = "not-computed-note";
        card.children[2].textContent = m.span;
        manasGrid.appendChild(card);
      }
    }
    return ss14;
  }

  function renderVedicMathMasterworks(jd) {
    if (typeof M.aryabhataPi !== "function") return;

    // 1. Aryabhata Kuttaka Solver
    window.solveKuttakaUI = function() {
      const a = parseInt($("kuttaka-a")?.value || "5", 10);
      const b = parseInt($("kuttaka-b")?.value || "7", 10);
      const c = parseInt($("kuttaka-c")?.value || "1", 10);
      const res = M.aryabhataKuttaka(a, b, c);
      const resEl = $("kuttaka-result");
      if (resEl) {
        if (res.solvable) {
          resEl.innerHTML = `Solution: <b>x = ${res.x}</b>, <b>y = ${res.y}</b> (${a}&middot;${res.x} &minus; ${b}&middot;${res.y} = ${c})`;
          resEl.style.color = "var(--cyan)";
        } else {
          resEl.textContent = `No integer solution (gcd(${a}, ${b}) = ${res.gcd} does not divide ${c})`;
          resEl.style.color = "var(--red)";
        }
      }
    }

    const kuttakaBtn = $("kuttaka-solve-btn");
    if (kuttakaBtn && !kuttakaBtn._hasListener) {
      kuttakaBtn._hasListener = true;
      kuttakaBtn.addEventListener("click", solveKuttakaUI);
    }

    // 2. Brahmagupta
    const quadRes = $("brahmagupta-quad-result");
    if (quadRes) {
      const area = M.brahmaguptaQuadrilateralArea(52, 25, 39, 60);
      quadRes.innerHTML = `&radic;[(s-a)(s-b)(s-c)(s-d)] = <b>${area.toFixed(2)} sq units</b> (Exact Integer)`;
    }

    // 3. Bhaskara II Chakravala
    window.solveChakravalaUI = function() {
      const nSelect = $("chakravala-n-select");
      const N = parseInt(nSelect ? nSelect.value : "61", 10);
      const res = M.bhaskaraChakravala(N);
      const chakRes = $("chakravala-result");
      if (chakRes) {
        chakRes.innerHTML = `N = ${N} &rarr; <b>x = ${res.x.toLocaleString()}</b> &middot; <b>y = ${res.y.toLocaleString()}</b> (${res.iterations} cycles)`;
      }
    }

    const chakravalaBtn = $("chakravala-solve-btn");
    if (chakravalaBtn && !chakravalaBtn._hasListener) {
      chakravalaBtn._hasListener = true;
      chakravalaBtn.addEventListener("click", solveChakravalaUI);
    }
    const nSelectEl = $("chakravala-n-select");
    if (nSelectEl && !nSelectEl._hasListener) {
      nSelectEl._hasListener = true;
      nSelectEl.addEventListener("change", solveChakravalaUI);
    }

    // 4. Madhava
    const madhavaSinEl = $("madhava-sine-result");
    if (madhavaSinEl) {
      const sin30 = M.madhavaSineSeries(Math.PI / 6, 6);
      madhavaSinEl.innerHTML = `sin(30&deg;) = <b>${sin30.madhavaSin.toFixed(8)}</b> (Error: ${sin30.difference.toExponential(2)})`;
    }

    const madhavaPiEl = $("madhava-pi-result");
    if (madhavaPiEl) {
      const piRes = M.madhavaPiSeries(15);
      const paridhi = piRes.bhutasamkhyaMnemonic;
      const paridhiLine = paridhi.verseSa.split("\n")[0].replace(/\s*।\s*$/, "");
      madhavaPiEl.innerHTML = `&pi; (series) = <b>${piRes.rapidConvergencePi.toFixed(12)}</b><br>` +
        `Paridhi-verse (bhūtasaṃkhyā, not kaṭapayādi): <i>${paridhiLine}</i> &rarr; ` +
        `${paridhi.circumference} &divide; ${paridhi.diameterWords.nava}&times;10<sup>${paridhi.diameterWords.nikharvaPowerOfTen}</sup> = ${paridhi.ratioDecimal}&hellip;`;
      madhavaPiEl.title = `Unverified: ${paridhi.unverified.join(" ")}`;
    }

    // 5. Pingala
    const pingalaMeruEl = $("pingala-meru-preview");
    if (pingalaMeruEl) {
      const meru = M.pingalaMeruPrastara(5);
      pingalaMeruEl.innerHTML = `Meru Rows (1..5): ` + meru.map(r => `[${r.join(", ")}]`).join(" &rarr; ");
    }

    const pingalaFibEl = $("pingala-fib-preview");
    if (pingalaFibEl) {
      const fib = M.pingalaMatrameru(10);
      pingalaFibEl.innerHTML = `Mātrāmeru: <b>${fib.join(", ")}</b>`;
    }

    // 6. Baudhayana
    const baudSqrtEl = $("baudhayana-sqrt2-result");
    if (baudSqrtEl) {
      const sqrt2 = M.baudhayanaSquareRoot2();
      baudSqrtEl.innerHTML = `&radic;2 &approx; 1 + 1/3 + 1/12 &minus; 1/408 = <b>${sqrt2.fraction} = ${sqrt2.rationalValue.toFixed(9)}</b>`;
    }

    // 7. Live Kernel Comparison Table (Float vs Aryabhata Rational Jya)
    if (jd != null && typeof M.compareKernels === "function") {
      const kernelComp = M.compareKernels(jd);
      const tbody = $("kernel-comparison-tbody");
      if (tbody) {
        tbody.innerHTML = kernelComp.comparison.map(row => `
          <tr>
            <td><strong>${row.graha}</strong></td>
            <td style="font-family: var(--mono); color: var(--gold);">${row.floatLong}</td>
            <td style="font-family: var(--mono); color: var(--cyan);">${row.rationalLong}</td>
            <td style="font-family: var(--mono); color: ${parseFloat(row.deltaArcsec) < 1.0 ? 'var(--green)' : 'var(--accent)'};">${row.deltaArcsec}</td>
            <td><span class="badge badge-green">${row.status}</span></td>
          </tr>
        `).join("");
      }
      const badge = $("kernel-drift-badge");
      if (badge) {
        badge.textContent = `Max Planetary Delta: ${kernelComp.maxDeltaArcsec}″ · computed live`;
      }
    }
  }

  function renderSsAudit() {
    const summary = $("ss-audit-summary");
    const list = $("ss-audit-list");
    if (!summary && !list) return;
    const groups = [
      ["ssAudit", M.ssAudit],
      ["ssSphutaAudit", M.ssSphutaAudit],
      ["ssSpaceAudit", M.ssSpaceAudit],
    ];
    const rows = [];
    let pass = 0;
    let fail = 0;
    let missing = 0;
    for (const [name, obj] of groups) {
      if (!obj || typeof obj !== "object") {
        missing += 1;
        rows.push({ name, key: "(missing)", ok: false });
        continue;
      }
      for (const [key, value] of Object.entries(obj)) {
        const ok = value === true;
        if (ok) pass += 1;
        else fail += 1;
        rows.push({ name, key, ok });
      }
    }
    if (summary) {
      summary.textContent = missing
        ? `${pass} pass · ${fail} fail · ${missing} audit object missing`
        : `${pass} pass · ${fail} fail`;
    }
    // Header gate readout — derived from the same real audit booleans.
    const gateEl = $("audit-gate-live");
    const total = pass + fail;
    if (gateEl) {
      gateEl.textContent = missing
        ? `Audit gates ${pass}/${total} PASS · ${missing} audit object missing`
        : `Audit gates ${pass}/${total} PASS`;
      gateEl.style.color = fail === 0 && missing === 0 ? "var(--green)" : "var(--red)";
    }
    // Hero sub-line — the gate count shown up top is this same live count.
    const heroGate = $("hero-gate-count");
    if (heroGate) {
      heroGate.textContent = `सू.सि. स्थिरांक-तालिका की ${total} आन्तरिक संगति-जाँच: ${pass}/${total} PASS${missing ? ` · ${missing} audit object missing` : ""}`;
      heroGate.style.color = fail === 0 && missing === 0 ? "var(--green)" : "var(--red)";
    }
    if (list) {
      list.innerHTML = rows.map((r) => {
        const color = r.ok ? "var(--green)" : "var(--red)";
        const label = r.ok ? "PASS" : "FAIL";
        return `<div style="border: 1px solid var(--line); border-radius: 4px; padding: 8px 10px; background: var(--hero);"><div style="color: var(--cyan);">${r.name}.${r.key}</div><div style="color: ${color}; font-weight: 700;">${label}</div></div>`;
      }).join("");
    }
  }

  // ── Toy Pedersen commitment (pedagogical, BigInt) ─────────────────────────
  // Commit → open → verify is genuinely executed each render; PASS/FAIL below
  // is the result of the actual comparison, never a hardcoded string.
  const PEDERSEN_P = 2305843009213693951n; // 2^61 − 1 Mersenne prime (toy modulus, NOT cryptographically secure)
  const PEDERSEN_G = 3n;
  const PEDERSEN_H = 7n;

  function modPowBig(base, exp, mod) {
    let result = 1n;
    let b = base % mod;
    let e = exp;
    while (e > 0n) {
      if (e & 1n) result = (result * b) % mod;
      b = (b * b) % mod;
      e >>= 1n;
    }
    return result;
  }

  function pedersenCommitBig(valueBig, blindingBig) {
    return (modPowBig(PEDERSEN_G, valueBig, PEDERSEN_P) * modPowBig(PEDERSEN_H, blindingBig, PEDERSEN_P)) % PEDERSEN_P;
  }

  function renderSovereignArchitectureSuite(jd, planets) {
    if (typeof M.padicNorm !== "function") return;

    // 1. P-Adic — genuine modular arithmetic; PASS/FAIL comes from the live check.
    const normRes = $("padic-norm-result");
    if (normRes) {
      const pNorm = M.padicNorm(14, 7);
      const ultra = M.verifyUltrametricInequality(14, 7, 21, 7);
      normRes.innerHTML = `|14|<sub>7</sub> = <b>${pNorm.toFixed(6)}</b> &middot; Ultrametric d(x,z) &le; max(d(x,y),d(y,z)): <b style="color:${ultra.isValid ? "var(--green)" : "var(--red)"};">${ultra.isValid ? "PASS" : "FAIL"}</b> (d(x,z)=${ultra.dXZ} vs max=${ultra.maxRHS})`;
    }
    const nilpRes = $("nilpotent-time-result");
    if (nilpRes) {
      const nilp = M.nilpotentTimeReversal(7, 7);
      nilpRes.innerHTML = nilp.isBinduReturned
        ? `Step 7 mod 7 = 0 &rarr; <b>|000&#10217; ground state reached</b> (modular arithmetic only — no hardware fidelity claimed)`
        : `Step 7 mod 7 &ne; 0 &rarr; <b style="color:var(--red);">transient state — ground NOT reached</b>`;
    }

    // 2. ONP split & toy Pedersen commit/open/verify over the real sphuta values
    window.solveONPUI = function() {
      const valInput = $("onp-inflow-input");
      const inflow = parseFloat(valInput?.value || "100000") || 100000;
      const onp = M.outflowNeutralizationProtocol(inflow);

      const onpRes = $("onp-result");
      if (onpRes) {
        onpRes.innerHTML = `उदाहरण: 40% split of &#8377;${onp.inflowAmount.toLocaleString()}: reserve <b>&#8377;${onp.reserveLockAmount.toLocaleString()}</b> &middot; operational &#8377;${onp.operationalCapital.toLocaleString()} (conceptual protocol — nothing is actually locked)`;
      }

      const zkRes = $("zk-commitment-result");
      if (zkRes) {
        if (!Array.isArray(planets) || planets.length === 0) {
          zkRes.textContent = "Commitment unavailable — no sphuṭa rows to commit to.";
          return;
        }
        // v = sum of the nine live canonical longitudes in micro-degrees (BigInt).
        const sphutaMicroDeg = planets.reduce((acc, g) => acc + BigInt(Math.round(M.mod360(g.longitude) * 1e6)), 0n);
        const blinding = BigInt(Math.round(Math.abs(inflow))) + 999983n;
        const commitment = pedersenCommitBig(sphutaMicroDeg, blinding);
        const reopened = pedersenCommitBig(sphutaMicroDeg, blinding);      // honest opening
        const tampered = pedersenCommitBig(sphutaMicroDeg + 1n, blinding); // must NOT verify
        const verified = reopened === commitment;
        const tamperRejected = tampered !== commitment;
        zkRes.innerHTML = `Toy Pedersen C(&Sigma; sphuṭa = ${sphutaMicroDeg} µ°): <b>0x${commitment.toString(16)}</b><br>open/verify: <b style="color:${verified ? "var(--green)" : "var(--red)"};">${verified ? "PASS" : "FAIL"}</b> &middot; tampered value (v+1) rejected: <b style="color:${tamperRejected ? "var(--green)" : "var(--red)"};">${tamperRejected ? "PASS" : "FAIL"}</b>`;
      }
    }

    const onpBtn = $("onp-calc-btn");
    if (onpBtn && !onpBtn._hasListener) {
      onpBtn._hasListener = true;
      onpBtn.addEventListener("click", solveONPUI);
    }
    window.solveONPUI();

    // 3. Precession ratio & spherical-triangle solid angle — both computed live.
    const quantRes = $("quantum-phase-result");
    if (quantRes) {
      const grahaLongs = Array.isArray(planets) && planets.length === 9 ? planets.map(p => p.longitude) : null;
      const qState = M.computeDensityMatrixAndEntropy(grahaLongs);
      const grRel = M.computeRelativisticCorrections(1.0, "Sun");
      const theta3 = M.computeJacobiTheta3(0.1);
      const pisano = M.computePisanoPeriod(9);

      quantRes.innerHTML = `
        <div style="font-family:var(--mono);font-size:0.8rem;line-height:1.6;color:var(--ink);">
          <div style="color:var(--dim);font-size:0.75rem;margin-bottom:8px;">
            ρ = |ψ⟩⟨ψ| over the ${qState.dimension} graha phases: a pure state by construction, so its entropy is 0 — a definition, not a finding.
          </div>
          <div style="color:var(--soft);margin-bottom:6px;">
            <b>General Relativity (Einstein-Schwarzschild):</b> Redshift <i>z</i> = ${grRel.gravitationalRedshiftZ.toExponential(4)} &middot; Shapiro Delay = ${grRel.shapiroTimeDelayMicroSec.toFixed(2)} &mu;s &middot; Mercury Precession = ${grRel.mercuryPerihelionPrecessionArcsecCentury}″/century
          </div>
          <div style="color:var(--dim);font-size:0.75rem;">
            <b>Advanced Math:</b> Jacobi &theta;<sub>3</sub>(0.1) = ${theta3.toFixed(6)} &middot; Pisano Period &pi;(9) = ${pisano} &middot; Landauer Limit = ${grRel.landauerBoundJoules.toExponential(3)} J/bit
          </div>
        </div>
      `;
    }
    const berryRes = $("geospatial-berry-result");
    if (berryRes) {
      // Solid angle of the spherical triangle Kamakhya–Kedarnath–Kanyakumari on the
      // unit sphere, computed from the coordinates via L'Huilier's theorem.
      const sites = [
        { name: "Kamakhya", lat: 26.1664, lon: 91.7086 },
        { name: "Kedarnath", lat: 30.7346, lon: 79.0669 },
        { name: "Kanyakumari", lat: 8.0883, lon: 77.5385 },
      ];
      const rad = (d) => (d * Math.PI) / 180;
      const angDist = (p, q) => Math.acos(
        Math.sin(rad(p.lat)) * Math.sin(rad(q.lat)) +
        Math.cos(rad(p.lat)) * Math.cos(rad(q.lat)) * Math.cos(rad(p.lon - q.lon))
      );
      const a = angDist(sites[1], sites[2]);
      const b = angDist(sites[0], sites[2]);
      const c = angDist(sites[0], sites[1]);
      const s = (a + b + c) / 2;
      const tanProduct = Math.tan(s / 2) * Math.tan((s - a) / 2) * Math.tan((s - b) / 2) * Math.tan((s - c) / 2);
      const solidAngleSr = 4 * Math.atan(Math.sqrt(Math.max(0, tanProduct)));
      berryRes.innerHTML = `गोल-क्षेत्रफल solid angle (उत्क्रमज्या-विधि · परिचय: L'Huilier; from the 3 site coordinates): <b>&Omega; = ${solidAngleSr.toFixed(6)} sr</b> &middot; गोल-परिक्रमा-फल (Berry analogue) &Omega;/2 = ${(solidAngleSr / 2).toFixed(6)} rad`;
    }

  }

  // ── Collapsed-by-default workbench: only Compute-locally + Findings open ──
  function applyDefaultCollapse() {
    toggleAllSections(false);
    for (const id of ["api-studio", "instrument", "findings", "quant-finance"]) {
      const panel = $(id);
      if (!panel) continue;
      panel.classList.remove("is-collapsed");
      const btn = panel.querySelector(".btn-panel-minimize");
      if (btn) {
        btn.textContent = "— Minimize";
        btn.style.background = "rgba(234, 201, 123, 0.12)";
        btn.style.color = "var(--gold)";
      }
    }
  }

  // ── Headline-अंक on section headers — every value read back from the live,
  //    already-computed DOM (no new arithmetic, no static claims) ──
  function updateSectionHeadlines() {
    const txt = (id) => { const el = $(id); const t = el ? el.textContent.trim() : ""; return t === "—" ? "" : t; };
    const kids = (id) => { const el = $(id); return el ? el.children.length : 0; };
    const rows = (id) => { const el = $(id); return el ? el.querySelectorAll("tr").length : 0; };
    const firstPart = (s, sep) => (s && s !== "…" ? s.split(sep)[0].trim() : "");
    const getters = {
      "quant-finance": () => { const v = txt("quantVolIndex"); return v && v !== "…" ? `सूचक ${v}` : ""; },
      "shunyabheda-forensics": () => txt("chalitShiftCountBadge"),
      "audit-benchmark": () => { const g = txt("audit-gate-live"); return g.startsWith("Audit gates") ? g.replace("Audit gates ", "") : ""; },
      "instrument": () => { const j = txt("jd-value"); return j && j !== "…" ? `JD ${j}` : ""; },
      "vargas": () => { const n = kids("varga-charts"); return n ? `${n} वर्ग-चक्र` : ""; },
      "bhavas": () => firstPart(txt("b-lagna"), "·"),
      "vimshottari": () => { const d = firstPart(txt("dasha-maha"), ":"); return d ? `महादशा ${d}` : ""; },
      "natal-id": () => { const c = txt("natal-cell"); return c && c !== "…" ? `cell ${c}` : ""; },
      "live-gochara": () => { const m = txt("live-vims-maha"); return m && m !== "…" && !m.startsWith("not computed") ? m : ""; },
      "muhurta-scanner": () => txt("muhurta-results-count"),
      "ashtakavarga-yogas": () => { const n = rows("shadbala-table-body"); return n ? `Ṣaḍbala — ${n} grahas` : ""; },
      "bphs-advanced": () => {
        const box = $("bphs-dosha-container");
        if (!box || !box.children.length) return "";
        if (/janma दर्ज करो/.test(box.textContent)) return "";
        return /लागू नहीं होते/.test(box.textContent) ? "वर्गीकरण लागू नहीं" : `${box.children.length - 1} शास्त्रीय वर्गीकरण`;
      },
      "surya-siddhanta-suite": () => { const n = rows("ss-14adhikaras-body"); return n ? `${n} अधिकार live` : ""; },
      "vedic-math-masterworks": () => { const b = txt("kernel-drift-badge"); return b && b !== "computing…" ? b.replace(" · computed live", "") : ""; },
    };
    for (const [id, getter] of Object.entries(getters)) {
      const section = $(id);
      if (!section) continue;
      let value = "";
      try { value = getter() || ""; } catch (e) { value = ""; }
      let span = section.querySelector(":scope .sec-headline");
      if (!span) {
        const host = section.querySelector(":scope > div:first-of-type") || section;
        span = document.createElement("span");
        span.className = "sec-headline";
        host.appendChild(span);
      }
      span.textContent = value;
      span.style.display = value ? "" : "none";
    }
  }

  // ── tier chip in the hero: the three choices (labels from M.TIERS); a click takes the visitor to the choice ──
  function initDrikTeaser() {
    const chip = $("drik-teaser-chip");
    if (!chip) return;
    chip.textContent = `तीन गणना-तह: ${M.TIER_IDS.map((id) => M.TIERS[id].labelSa).join(" · ")} — चुनो ↓`;
    if (chip._hasListener) return;
    chip._hasListener = true;
    chip.addEventListener("click", () => {
      const sec = $("instrument");
      if (sec) {
        sec.classList.remove("is-collapsed");
        const btn = sec.querySelector(".btn-panel-minimize");
        if (btn) {
          btn.textContent = "— Minimize";
          btn.style.background = "rgba(234, 201, 123, 0.12)";
          btn.style.color = "var(--gold)";
        }
      }
      if (controls.tier) {
        controls.tier.scrollIntoView({ behavior: "smooth", block: "center" });
        controls.tier.focus({ preventScroll: true });
      }
    });
  }

  // ── the Kerala overlay as text (copies the table exactly as shown) ──
  function initDrikProofCopy() {
    const btn = $("drik-proof-copy");
    const st = $("drik-proof-status");
    if (!btn || btn._hasListener) return;
    btn._hasListener = true;
    const say = (t) => { if (st) { st.textContent = t; setTimeout(() => { st.textContent = ""; }, 4000); } };
    btn.addEventListener("click", () => {
      const tbody = $("kerala-drik-tbody");
      if (!tbody || !tbody.children.length) { say("पहले overlay on करो"); return; }
      const lines = ["Graha | base SS° | संस्कृत° | fit claim | आधुनिक भारतीय (दृक्)° | संस्कृत−दृक्′ | claim holds"];
      tbody.querySelectorAll("tr").forEach((tr) => {
        const cells = Array.from(tr.querySelectorAll("th,td")).map((c) => c.textContent.trim());
        if (cells.length) lines.push(cells.join(" | "));
      });
      lines.push("Bharat Ephemeris · computed offline in this browser · offline.bharatephemeris.com");
      const text = lines.join("\n");
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => say("प्रमाण कॉपी हुआ ✓"), () => say("clipboard अनुपलब्ध"));
      } else say("clipboard अनुपलब्ध");
    });
  }

  function syncSharedState(ctx) {
    if (typeof M.yantraState !== "function") return;
    M.yantraState().set({
      date: ctx && ctx.civil ? isoOf(ctx.civil) : controls.date.value.trim(),   // the parsed date, zero-padded (the state keeps YYYY-MM-DD)
      time: controls.time.value,
      timezone: controls.timezone.value,
      latitude: controls.latitude.value,
      longitude: controls.longitude.value,
      calendar: controls.calendar.value,
      tier: tierExplicit ? controls.tier.value : "",
    });
  }

  let lastComputedJd = null;
  let lastCtx = null;                 // the last Instrument that computed (panels re-run from it)
  // janma-gate (Gochara honesty): flips true only on a real user edit of the
  // Instrument epoch — auto-initialised "now" is NOT a janma.
  let janmaEntered = false;
  let lastNatalShare = null; // last computed Natal-ID payload for the share-card

  /* ── the paramparā record (Parameśvara's saṃskāra): read once at load from corpus/parampara/ (same origin; the service
     worker keeps it for offline use) and given to ss-tier.js. Until it is in, the default tier waits; if it cannot be
     read, that tier says so and the other two still compute. No other network request is made. ── */
  const PARAMPARA_FILES = Object.freeze({ registry: "corpus/parampara/registry.json", samskara: "corpus/parampara/samskara.json" });
  const parampara = { state: "loading", error: null };
  async function loadParampara() {
    if (!window.SSTier || !window.Parampara) throw new Error("ss-tier.js and parampara.js must be loaded before the page");
    const get = async (url) => {
      const res = await fetch(url, { credentials: "same-origin" });
      if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
      return res.json();
    };
    const [registry, samskara] = await Promise.all([get(PARAMPARA_FILES.registry), get(PARAMPARA_FILES.samskara)]);
    window.SSTier.useParampara(window.Parampara.load({ registry, samskara }));
  }
  function requireTierReady(tier) {
    if (M.TIERS[tier].samskara !== "parameshvara") return;
    if (parampara.state === "ready") return;
    const error = new Error(parampara.state === "loading"
      ? `${tierTitle(tier)}: the paramparā record (${PARAMPARA_FILES.samskara}) is still loading`
      : `${tierTitle(tier)} needs the paramparā record (${PARAMPARA_FILES.registry}, ${PARAMPARA_FILES.samskara}), which could not be read here: ${parampara.error}. Choose another tier.`);
    error.code = parampara.state === "loading" ? "RECORD_LOADING" : "RECORD_UNAVAILABLE";
    throw error;
  }

  /* ── tier labels beside every computed block (all read from M.TIERS; the ayanāṃśa value is the one applied) ── */
  const COMPUTED_SECTIONS = Object.freeze(["api-studio", "quant-finance", "shunyabheda-forensics", "instrument", "findings", "vargas", "bhavas",
    "vimshottari", "natal-id", "live-gochara", "muhurta-scanner", "ashtakavarga-yogas", "bphs-advanced", "surya-siddhanta-suite",
    "sovereign-architecture-suite"]);
  function tierLabelRows(tier, ay) {
    const T = M.TIERS[tier];
    const rows = [
      ["tier", `${T.labelSa} · ${T.label}`],
      ["engine", T.engine],
      ["ayanāṃśa (applied)", `${T.ayanamsha.name}${ay ? ` = ${ay.deg.toFixed(6)}°` : ""} — ${T.ayanamsha.source}`],
      ["obliquity", T.obliquity],
      ["sunrise", T.sunrise],
      ["moonrise", T.moonrise],
      ["day boundary", T.dayBoundary],
      ["karaṇa order", T.karanaOrder],
      ["month", T.month],
      ["year start", T.yearStart],
      ["saṃvatsara", T.samvatsara],
      ["daśā year", `${T.dashaYear.days} days — ${T.dashaYear.source}`],
      ["ahargaṇa", T.ahargana],
      ["time", T.time],
      ["reduction", T.reduction],
      ["Rāhu", T.rahu],
      ["span", `${T.span.years[0]} … ${T.span.years[1]} — ${T.span.basis}${T.span.yearRule ? ` (${T.span.yearRule})` : ""}`],
      ["measured", T.span.accuracyMeasured],
      ["provenance", T.provenance],
    ];
    return rows.filter(([, v]) => typeof v === "string" && v.length);
  }
  function ensureTierStrip(section) {
    if (!section) return null;
    let strip = section.querySelector(":scope [data-tier-strip]");
    if (strip) return strip;
    strip = document.createElement("details");
    strip.className = "tier-strip";
    strip.setAttribute("data-tier-strip", "");
    strip.innerHTML = "<summary></summary><dl></dl>";
    const host = section.querySelector(":scope > .panel-body-collapsible") || section;
    host.insertBefore(strip, host.firstChild);
    return strip;
  }
  function setStripNotComputed(strip, text) {
    strip.classList.add("not-computed");
    strip.dataset.tier = "";
    strip.querySelector("summary").textContent = text;
    strip.querySelector("dl").replaceChildren();
  }
  function fillTierStrip(strip, tier, ay, note) {
    strip.classList.remove("not-computed");
    strip.dataset.tier = tier;
    const T = M.TIERS[tier];
    strip.querySelector("summary").textContent = `गणना-तह · tier: ${T.labelSa} · ${T.label} · ayanāṃśa ${T.ayanamsha.name}${ay ? ` ${ay.deg.toFixed(6)}°` : ""} (applied)${note ? ` — ${note}` : ""}`;
    const dl = strip.querySelector("dl");
    dl.replaceChildren();
    for (const [k, v] of tierLabelRows(tier, ay)) {
      const dt = document.createElement("dt"); dt.textContent = k;
      const dd = document.createElement("dd"); dd.textContent = v;
      dl.append(dt, dd);
    }
  }
  function refreshTierStrip(sectionId, ctx) {
    const section = $(sectionId);
    const strip = ensureTierStrip(section);
    if (!strip || !ctx) return;
    if (panelErrors.has(sectionId)) { const e = panelErrors.get(sectionId); setStripNotComputed(strip, `${e.refused ? "refused" : "not computed"}: ${e.message}`); return; }
    fillTierStrip(strip, ctx.tier, ctx.ay);
    // every table caption in the block names its tier too
    section.querySelectorAll("caption").forEach((cap) => {
      if (cap.closest("#vedic-math-masterworks")) return;
      let span = cap.querySelector(".cap-tier");
      if (!span) { span = document.createElement("span"); span.className = "cap-tier"; cap.appendChild(span); }
      span.textContent = ` · तह: ${M.TIERS[ctx.tier].labelSa} · ${ctx.ay.name} ${ctx.ay.deg.toFixed(4)}°`;
    });
  }
  function renderTierStrips(ctx) {
    for (const id of COMPUTED_SECTIONS) refreshTierStrip(id, ctx);
    // the masterworks block: the kernel audit is always the plain Sūrya-Siddhānta's manda equation; the Kerala overlay's
    // base is the plain text and its dṛk column the dṛk tier — each says so.
    const kernel = $("kernel-comparison-tbody");
    if (kernel) {
      const host = kernel.closest(".panel");
      let strip = host && host.querySelector(":scope > [data-tier-strip]");
      if (host && !strip) { strip = document.createElement("details"); strip.className = "tier-strip"; strip.setAttribute("data-tier-strip", ""); strip.innerHTML = "<summary></summary><dl></dl>"; host.insertBefore(strip, host.children[1] || null); }
      const tier = "ss";                     // M.compareKernels and keralaDrikSphuta's base are the plain text, by their contract
      let ssAy = null; try { ssAy = M.tierAyanamsha(ctx.jd, tier); } catch (e) { ssAy = null; }
      if (strip) fillTierStrip(strip, tier, ssAy, "this audit and the overlay's base always use the plain Sūrya-Siddhānta's manda equation, whatever tier is chosen above");
    }
  }

  /* ── clear every output (no stale value survives a failed input) ── */
  const OUTPUT_TEXT_IDS = Object.freeze(["jd-value", "umt-value", "lmt-value", "meridian-value", "ayana-value", "rate-value", "lagna-value",
    "lagna-nakshatra-value", "moon-nakshatra-value", "vara-value", "sunrise-value", "limbs-value", "masa-value", "ahargana-value",
    "b-lagna", "b-madhya10", "b-method", "dasha-state", "dasha-maha", "dasha-antara", "dasha-rule",
    "natal-cell", "natal-zone", "natal-coords", "natal-indices", "natal-digitroot", "natal-seal",
    "gochara-jd-value", "gochara-lagna-value", "live-vims-maha", "live-vims-antara", "live-vims-span", "live-yogini-maha", "live-yogini-antara", "live-yogini-span",
    "jaimini-karakamsha-sign", "macro-shani-title", "macro-shani-desc", "macro-guru-title", "macro-guru-desc", "macro-rahu-title", "macro-rahu-desc",
    "macro-strategy-title", "macro-strategy-desc", "dagdhaTithiName", "dagdhaRashisList", "dagdhaPlanetsStatus", "bbLocation", "bbNakshatra", "bbHouseStatus",
    "induLagnaSign", "induRaysMath", "induOccupantsStatus", "ss-grahana-status", "ss-grahana-desc", "ss-yuddha-status", "ss-yuddha-desc",
    "ss-shringonnati-status", "ss-shringonnati-desc", "muhurta-results-count", "quantRegimeBadge", "quantVolIndex", "chalitShiftCountBadge",
    "zk-commitment-result", "quantum-phase-result", "kernel-drift-badge"]);
  const OUTPUT_CONTAINER_IDS = Object.freeze(["varga-charts", "chart-radix-container", "chart-gochara-container", "chart-composite-container",
    "sav-rashi-grid", "yogas-list-container", "bphs-dosha-container", "ss-manas-grid", "chalitShiftsList", "quant-aspects-list"]);
  function clearContainer(root, reason) {
    // a caption's tier label belongs to the values it captioned: blank it with them (no stale tier or ayanāṃśa)
    root.querySelectorAll("caption .cap-tier").forEach((span) => { span.textContent = ""; });
    root.querySelectorAll("tbody[id]").forEach((tb) => {
      const table = tb.closest("table");
      const cols = table ? Math.max(1, table.querySelectorAll("thead th").length) : 1;
      tb.innerHTML = `<tr><td class="not-computed-note" colspan="${cols}"></td></tr>`;
      tb.querySelector("td").textContent = reason;
    });
    for (const id of OUTPUT_CONTAINER_IDS) {
      const el = $(id);
      if (el && root.contains(el)) { el.innerHTML = `<div class="not-computed-note" style="grid-column: 1 / -1;"></div>`; el.firstChild.textContent = reason; }
    }
    for (const id of OUTPUT_TEXT_IDS) {
      const el = $(id);
      if (el && root.contains(el)) el.textContent = "—";
    }
  }
  function clearOutputs(reason) {
    const main = $("main-content") || document.body;
    clearContainer(main, reason);
    const varga = $("varga-head"); if (varga) varga.replaceChildren();
    const apiViewer = $("apiResponseViewer");
    if (apiViewer) (apiViewer.querySelector("code") || apiViewer).textContent = JSON.stringify({ status: "not computed", reason }, null, 2);
    for (const id of COMPUTED_SECTIONS) {
      const strip = ensureTierStrip($(id));
      if (strip) setStripNotComputed(strip, reason);
    }
    lastComputedJd = null;
    lastCtx = null;
    lastNatalShare = null;
  }

  /* ── the refusal: the dṛk tier outside 1850–2150 (or a tier whose record is missing) says so plainly and offers the
     other choices; it is an expected answer, never a console error ── */
  function showRefusal(message, offerIds) {
    const box = $("tier-refusal"), text = $("tier-refusal-text"), actions = $("tier-refusal-actions");
    if (!box || !text || !actions) return;
    if (!message) { box.hidden = true; text.textContent = ""; actions.replaceChildren(); return; }
    box.hidden = false;
    text.textContent = message;
    actions.replaceChildren();
    for (const id of offerIds) {
      const b = document.createElement("button");
      b.type = "button";
      b.dataset.tier = id;
      b.textContent = `${M.TIERS[id].labelSa} · ${M.TIERS[id].label} चुनो`;
      b.addEventListener("click", () => {
        linkedTierText = null;
        controls.tier.value = id;
        tierExplicit = true;
        render();
      });
      actions.appendChild(b);
    }
  }

  function setText(id, text) { const el = $(id); if (el) el.textContent = text; }
  /** A metric: the value in the large figure, the rule it follows in small type beneath (the rule is M.TIERS' text). */
  function setMetric(id, value, rule) {
    const el = $(id);
    if (!el) return;
    el.textContent = value;
    if (rule) {
      const small = document.createElement("small");
      small.className = "metric-rule";
      small.textContent = rule;
      el.appendChild(small);
    }
  }

  /** The pañcāṅga line of the Instrument (math-core panchangExtended at the site, for the tier). */
  function renderInstrumentPanchanga(ctx) {
    const { jd, latitude, longitude, timezone, tier } = ctx;
    const pan = M.panchangExtended(jd, latitude, longitude, timezone, tier);
    setMetric("vara-value", `${pan.varaName} (from sunrise) · civil weekday ${pan.civilVaraName}`, pan.varaRule);
    if (pan.solar && Number.isFinite(pan.solar.jdRise)) {
      const abhijit = pan.abhijit ? ` · Abhijit ${pan.abhijit.windowText}` : "";
      const rahu = pan.rahu ? ` · Rāhu-kāla ${pan.rahu.windowText}` : "";
      setMetric("sunrise-value", `${pan.solar.riseTime} · ${pan.solar.setTime}${abhijit}${rahu}`,
        `${M.TIERS[tier].sunrise}${pan.abhijit && pan.abhijit.source ? ` · Abhijit: ${pan.abhijit.source}` : ""} · the civil day holding the instant (sunrise to sunrise)`);
    }
    else setMetric("sunrise-value", "no sunrise or sunset on this civil day (polar)", M.TIERS[tier].sunrise);
    setMetric("limbs-value", `${pan.paksha} ${pan.tithiName} (tithi ${pan.tithiIndex + 1}) · ${pan.nakshatraName} (pada ${pan.nakshatraPada}) · ${pan.yogaName} · ${pan.karanaName}`, `karaṇa order: ${pan.karanaOrder}`);
    const masa = pan.masa && pan.masa.refused ? `month refused: ${pan.masa.reason}` : `${pan.masaName} (amānta${pan.masa && pan.masa.kshaya ? ", kṣaya" : ""})`;
    const year = pan.yearRefused ? `year refused: ${pan.yearRefused}` : `Kali ${pan.kaliYear} · Vikrama ${pan.vikramYear} · Śaka ${pan.shakaYear}${pan.yearEndRefused ? " (year end refused)" : ""}`;
    const sv = pan.samvatsaraName ? `saṃvatsara ${pan.samvatsaraName}` : "saṃvatsara refused";
    setMetric("masa-value", `${masa} · ${year} · ${sv}`, `month: ${pan.masa && pan.masa.rule ? pan.masa.rule : M.TIERS[tier].month} · year start: ${pan.yearStartRule} · saṃvatsara: ${pan.samvatsara && pan.samvatsara.rule ? pan.samvatsara.rule : M.TIERS[tier].samvatsara}`);
    setMetric("ahargana-value", pan.ahargana.toFixed(4), pan.aharganaRule);
    return pan;
  }

  /** The line under the tier select names the SELECTED tier's ayanāṃśa and sunrise rule (M.TIERS), refused or not. */
  function showTierHelp() {
    const help = $("tier-help");
    if (!help) return;
    const t = selectedTierSafe();
    help.textContent = t ? `${M.TIERS[t].ayanamsha.name} · ${M.TIERS[t].sunrise}` : "";
  }

  function render() {
    const tRenderStart = performance.now();
    if (renderTimer) { clearTimeout(renderTimer); renderTimer = null; }
    showTierHelp();
    try {
      const ctx = readInstrument();
      const { timezone, latitude, longitude, tier, jd } = ctx;
      requireTierReady(tier);
      const T = M.TIERS[tier];
      const ay = M.tierAyanamsha(jd, tier);
      ctx.ay = ay;
      const siderealAscendant = M.siderealAscendantDeg(jd, latitude, longitude, tier);
      const sayanaAscendant = M.sayanaAscendantDeg(jd, latitude, longitude, tier);
      const meridian = M.tierMeridian(jd, latitude, longitude, tier);
      const planets = canonicalGrahaRows(jd, tier);
      const moon = rowOf(planets, "candra");
      const rawBhava = M.bhavaModel(jd, latitude, longitude, tier);
      const bhava = reconcileBhavaRows(rawBhava, planets);
      showRefusal(null);

      setText("jd-value", jd.toFixed(8));
      setText("umt-value", M.ujjainMeanTime(ctx.timeText, timezone));
      setText("lmt-value", `${M.ujjainMeanTime(ctx.timeText, timezone, longitude)} (${longitude.toFixed(4)}° E)`);
      setMetric("meridian-value", `RAMC ${formatDegrees(meridian.ramcDeg, 4)} · madhya-lagna ${signLabel(meridian.madhyaLagnaSidereal)}`, meridian.method);
      const ayEl = $("ayana-value");
      setMetric("ayana-value", `${ay.deg.toFixed(8)}° · ${ay.name}`, `${T.labelSa} · ${ay.source}`);
      ayEl.dataset.deg = String(ay.deg);
      if (Number.isFinite(ay.rateArcsecPerYear)) setMetric("rate-value", `${ay.rateArcsecPerYear >= 0 ? "+" : ""}${ay.rateArcsecPerYear.toFixed(6)}″/year`, ay.rateRule || ""); else setText("rate-value", "—");
      const lagnaEl = $("lagna-value");
      setMetric("lagna-value", `Sāyana ${formatDegrees(sayanaAscendant)} · Nirayana ${formatDegrees(siderealAscendant)} · ${signLabel(siderealAscendant)}`, `the tier's frame: ${ay.name}; sāyana − nirayana = the ayanāṃśa applied`);
      lagnaEl.dataset.sayana = String(sayanaAscendant);
      lagnaEl.dataset.nirayana = String(siderealAscendant);

      const lagnaNak = M.computeNakshatraDetails(siderealAscendant);
      const moonNak = M.computeNakshatraDetails(moon.longitude);
      const lagnaNakEl = $("lagna-nakshatra-value");
      const moonNakEl = $("moon-nakshatra-value");
      if (lagnaNakEl) lagnaNakEl.textContent = `${lagnaNak.number}. ${lagnaNak.name} (चरण ${lagnaNak.pada}) · Lord ${lagnaNak.lord}`;
      if (moonNakEl) moonNakEl.textContent = `${moonNak.number}. ${moonNak.name} (चरण ${moonNak.pada}) · Lord ${moonNak.lord}`;
      // pada-108 readout (SIDDHA): 108-quarter address + navāṃśa sign from pada108().
      if (typeof M.pada108 === "function") {
        const lagnaPada = M.pada108(siderealAscendant);
        const moonPada = M.pada108(moon.longitude);
        if (lagnaNakEl) lagnaNakEl.textContent += ` · पद-108: ${lagnaPada.quarter}/108 · नवांश ${lagnaPada.navamshaSign}`;
        if (moonNakEl) moonNakEl.textContent += ` · पद-108: ${moonPada.quarter}/108 · नवांश ${moonPada.navamshaSign}`;
      }
      lastComputedJd = jd;
      lastCtx = ctx;
      let pan = null, panError = null;
      try { pan = renderInstrumentPanchanga(ctx); }
      catch (error) {
        // the pañcāṅga line alone says "not computed" (or "refused" at the dṛk span's edge); the instant's other values stay
        panError = error;
        const word = error && error.code === "TIER_OUT_OF_SPAN" ? "refused" : "not computed";
        for (const id of ["vara-value", "sunrise-value", "limbs-value", "masa-value", "ahargana-value"]) setText(id, `${word}: ${error.message}`);
      }

      renderPlanets(planets);
      const vargaMatrix = computeVargaMatrix(siderealAscendant, planets);
      renderVargas(vargaMatrix);
      renderVargaCharts(vargaMatrix);
      renderBhavas(bhava);
      panel("vimshottari", () => renderDasha(moon.longitude, ctx));
      renderNatalId(planets, siderealAscendant);
      renderKeralaDrik(jd);
      renderCoordinateCodec(controls.latitude.value, controls.longitude.value);
      panel("quant-finance", () => renderQuantSection(jd, planets, tier));
      panel("shunyabheda-forensics", () => {
        if (!pan) { if (panError) throw panError; throw new Error("the pañcāṅga was not computed"); }
        renderShunyabhedaForensics(pan, planets, siderealAscendant, bhava);
      });
      const transit = panel("live-gochara", () => renderLiveGochara(ctx, planets, siderealAscendant));
      panel("ashtakavarga-yogas", () => renderAshtakavargaAndYogas(planets, siderealAscendant, jd, latitude, longitude, transit, ctx));
      panel("muhurta-scanner", () => renderMuhurtaScanner(ctx));
      panel("bphs-advanced", () => renderBphsAdvanced(ctx, planets, siderealAscendant));
      panel("surya-siddhanta-suite", () => renderSuryaSiddhanta14Adhikaras(ctx, planets, siderealAscendant));
      renderVedicMathMasterworks(jd);
      renderSsAudit();
      renderSovereignArchitectureSuite(jd, planets);
      renderTierStrips(ctx);
      syncSharedState(ctx);

      // Refresh the local compute studio
      runLiveApiQuery();

      // Header diagnostics — every figure below is computed at this instant.
      const secCountEl = $("section-count-live");
      if (secCountEl) {
        const sectionCount = document.querySelectorAll("main section").length;
        secCountEl.textContent = `${sectionCount} खण्ड (DOM-गणित)`;
      }
      updateSectionHeadlines();
      const detBadge = $("badge-determinism");
      if (detBadge) {
        const deterministic = computeBitwiseDeterminism(jd, tier);
        detBadge.textContent = deterministic ? "Bitwise determinism: PASS" : "Bitwise determinism: FAIL";
        detBadge.className = deterministic ? "badge badge-green" : "badge";
        if (!deterministic) {
          detBadge.style.color = "var(--red)";
          detBadge.style.borderColor = "var(--red)";
        }
      }
      const elapsed = performance.now() - tRenderStart;
      const latBadge = $("badge-latency");
      if (latBadge) latBadge.textContent = `Local compute: ${elapsed.toFixed(1)} ms measured`;
      document.body.dataset.renderMs = elapsed.toFixed(1);

      const notes = [...panelErrors.keys()];
      $("status").textContent = `COMPUTATION COMPLETE · ${engineDescription(tier)} · ayanāṃśa ${ay.name} ${ay.deg.toFixed(6)}° (applied)${notes.length ? ` · not computed in: ${notes.join(", ")}` : ""}`;
      $("status").className = "status complete";
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const refused = Boolean(error && error.code === "TIER_OUT_OF_SPAN");
      const recordMissing = Boolean(error && (error.code === "RECORD_UNAVAILABLE"));
      const waiting = Boolean(error && error.code === "RECORD_LOADING");
      const reason = `${refused ? "refused" : "not computed"}: ${message}`;
      clearOutputs(reason);
      if (refused) {
        const span = M.TIERS.drik.span.years;
        $("status").textContent = `REFUSED · ${M.TIERS.drik.labelSa} · ${M.TIERS.drik.label}: ${message}`;
        showRefusal(`${M.TIERS.drik.labelSa} (${M.TIERS.drik.label}) तह केवल ${span[0]}.0–${span[1]}.0 पर दी जाती है; इस दिनांक पर वह गणना नहीं करती (कोई विदेशी विकल्प नहीं)। सूर्य-सिद्धान्त की तहें ${M.TIERS.ss.span.years[0]} … ${M.TIERS.ss.span.years[1]} पर चलती हैं — एक चुनो: / This tier is served for ${span[0]}.0–${span[1]}.0 only and refuses this date. Choose a text tier:`,
          M.TIER_IDS.filter((id) => M.TIERS[id].family === "ss"));
      } else if (recordMissing) {
        $("status").textContent = `NOT COMPUTED · ${message}`;
        showRefusal(message, M.TIER_IDS.filter((id) => M.TIERS[id].samskara !== "parameshvara"));
      } else if (waiting) {
        $("status").textContent = `Loading the paramparā record for ${tierTitle(selectedTierSafe() || M.DEFAULT_TIER)} …`;
        showRefusal(null);
      } else {
        $("status").textContent = `INPUT OR COMPUTATION ERROR · ${message}`;
        // a linked or stored tier the engine does not know: the select shows the page default, so re-choosing it would
        // fire no change — offer every tier as a button instead
        if (linkedTierText !== null && selectedTierSafe() === null) showRefusal(`${message} — choose a tier:`, M.TIER_IDS);
        else showRefusal(null);
      }
      $("status").className = waiting ? "status" : "status fail";
      setEngineStatus(false, reason);
      // the studio's call and snippet follow the inputs as they now are (the selected tier, no NaN)
      const urlInput = $("apiEndpointUrl");
      if (urlInput) urlInput.value = buildEndpointUrl();
      updateCodeSnippet();
      const detBadge = $("badge-determinism");
      if (detBadge) { detBadge.textContent = "Bitwise determinism: not computed"; detBadge.className = "badge"; detBadge.style.color = ""; detBadge.style.borderColor = ""; }
      const latBadge = $("badge-latency");
      if (latBadge) latBadge.textContent = waiting ? "Local compute: waiting for the paramparā record" : "Local compute: not computed";
      if (error && error.control && document.activeElement === $("compute")) error.control.focus();
      updateSectionHeadlines();
    }
  }
  function selectedTierSafe() { try { return selectedTier(); } catch (error) { return null; } }

  // Typing in a text field re-computes after a pause (each keystroke would otherwise run every panel); a committed
  // change (Enter, leaving the field, a select) computes at once.
  let renderTimer = null;
  function scheduleRender() {
    if (renderTimer) clearTimeout(renderTimer);
    renderTimer = setTimeout(() => { renderTimer = null; render(); }, 350);
  }

  function applyInitialState() {
    const defaults = M.YANTRA_STATE_DEFAULTS || {};
    let state = defaults;
    if (typeof M.yantraState === "function") state = M.yantraState().get();
    for (const key of ["date", "time", "timezone", "latitude", "longitude"]) {
      if (state[key] != null && controls[key]) controls[key].value = String(state[key]);
    }
    if (state.calendar === "gregorian" || state.calendar === "julian") controls.calendar.value = state.calendar;
    const stored = state.tier == null ? "" : String(state.tier).trim();
    tierExplicit = stored !== "";
    try {
      controls.tier.value = M.pageTier(stored);
      linkedTierText = null;
    } catch (error) {
      // a linked or stored tier the engine does not know: this visit reports it (render shows the error) and the
      // select shows the page default; storage never keeps it (math-core yantraState R-15)
      linkedTierText = stored;
      controls.tier.value = M.pageTier("");
    }
  }

  // Event handlers
  const computeBtn = $("compute");
  if (computeBtn) computeBtn.addEventListener("click", render);

  // janma-gate: any user edit of the instrument epoch counts as entering janma.
  for (const key of ["date", "time", "timezone", "latitude", "longitude", "calendar"]) {
    const el = controls[key];
    if (el) {
      el.addEventListener("input", () => { janmaEntered = true; });
      el.addEventListener("change", () => { janmaEntered = true; });
    }
  }
  for (const [key, control] of Object.entries(controls)) {
    if (!control) continue;
    control.addEventListener("change", () => {
      if (key === "tier") { linkedTierText = null; tierExplicit = true; }
      render();
    });
    if (control.tagName !== "SELECT") control.addEventListener("input", () => {
      scheduleRender();
      const urlInput = $("apiEndpointUrl");
      if (urlInput) urlInput.value = buildEndpointUrl();
      updateCodeSnippet();
    });
  }

  const apiMethodEl = $("apiMethod");
  if (apiMethodEl) {
    apiMethodEl.addEventListener("change", () => {
      const urlInput = $("apiEndpointUrl");
      if (urlInput) urlInput.value = buildEndpointUrl();
      updateCodeSnippet();
      runLiveApiQuery();
    });
  }

  const btnRunLive = $("btnRunLiveApi");
  if (btnRunLive) btnRunLive.addEventListener("click", runLiveApiQuery);

  // Kerala dṛk-saṃskāra overlay toggle — re-renders from the last computed JD.
  const keralaToggleEl = $("kerala-drik-toggle");
  if (keralaToggleEl) keralaToggleEl.addEventListener("change", () => renderKeralaDrik(lastComputedJd));

  // Muhūrta scanner: every trigger runs the same scan from the start date shown (local civil midnight).
  const btnScanMuhurta = $("muhurta-scan-btn");
  if (btnScanMuhurta) btnScanMuhurta.addEventListener("click", rerunMuhurta);
  const btnMuhurtaToday = $("muhurta-sync-today");
  if (btnMuhurtaToday) {
    btnMuhurtaToday.addEventListener("click", () => {
      if (!lastCtx) return;
      muhurtaStartLinked = false;
      $("muhurta-start-date").value = nowInZone(lastCtx.timezone, lastCtx.calendar).date;
      rerunMuhurta();
    });
  }
  const btnMuhurtaInstrument = $("muhurta-sync-instrument");
  if (btnMuhurtaInstrument) btnMuhurtaInstrument.addEventListener("click", () => { muhurtaStartLinked = true; rerunMuhurta(); });
  const muhStartDateEl = $("muhurta-start-date");
  if (muhStartDateEl) {
    muhStartDateEl.addEventListener("input", () => { muhurtaStartLinked = false; });
    muhStartDateEl.addEventListener("change", () => { muhurtaStartLinked = false; rerunMuhurta(); });
  }
  const muhCategoryEl = $("muhurta-category");
  if (muhCategoryEl) muhCategoryEl.addEventListener("change", rerunMuhurta);
  const muhHorizonEl = $("muhurta-horizon");
  if (muhHorizonEl) muhHorizonEl.addEventListener("change", rerunMuhurta);

  $("codec-encode").addEventListener("click", () => {
    try {
      renderCoordinateCodec($("codec-latitude").value, $("codec-longitude").value);
      $("codec-error").textContent = "";
    } catch (error) {
      $("codec-error").textContent = error instanceof Error ? error.message : String(error);
    }
  });

  $("codec-decode").addEventListener("click", () => {
    try {
      const decoded = M.decodeCoordinatePair($("codec-payload").value);
      $("codec-decoded").textContent = `${decoded.latitude}, ${decoded.longitude}`;
      $("codec-error").textContent = "";
    } catch (error) {
      $("codec-error").textContent = error instanceof Error ? error.message : String(error);
    }
  });

  // Attach global functions for HTML onclick handlers
  globalThis.setSnippetLang = setSnippetLang;
  globalThis.runLiveApiQuery = runLiveApiQuery;

  populateTierSelect();
  applyInitialState();
  renderDrikAgreement();
  renderTierBoundaryList();
  $("codec-latitude").value = controls.latitude.value;
  $("codec-longitude").value = controls.longitude.value;
  try { setSnippetLang("curl"); }
  catch (error) { setEngineStatus(false, error instanceof Error ? error.message : String(error)); }
  initNatalShareControls();
  initDrikProofCopy();
  initDrikTeaser();
  render();                                   // the plain-text and dṛk tiers compute at once; the default waits for its record
  loadParampara().then(() => { parampara.state = "ready"; }, (error) => {
    parampara.state = "unavailable";
    parampara.error = error && error.message ? error.message : String(error);
  }).then(() => {
    const t = selectedTierSafe();
    if (t === null || M.TIERS[t].samskara === "parameshvara" || !lastCtx) render();
    document.body.dataset.parampara = parampara.state;
  });
  // First-paint discipline: everything collapsed except the compute studio and
  // findings (existing toggleAllSections machinery — user can reopen at will).
  applyDefaultCollapse();

  // View-mode panel counts and persistence
  window.setShunyabhedaViewMode = function(mode) {
    localStorage.setItem("shunyabheda_view_mode", mode);
    const panels = document.querySelectorAll("section.panel");
    panels.forEach((panel, idx) => {
      if (idx < mode) {
        panel.style.display = "";
      } else {
        panel.style.display = "none";
      }
    });

    const btns = {
      6: document.getElementById("view-btn-6"),
      12: document.getElementById("view-btn-12"),
      24: document.getElementById("view-btn-24")
    };

    Object.entries(btns).forEach(([k, btn]) => {
      if (btn) {
        const isPressed = Number(k) === Number(mode);
        btn.setAttribute("aria-pressed", isPressed ? "true" : "false");
      }
    });

    console.log("Active: 6 सुगम खण्ड · 12 अनुसन्धान खण्ड · 24 पूर्ण सम्पादित प्रमाण-खण्ड");
  };

  const savedViewMode = localStorage.getItem("shunyabheda_view_mode") || "24";
  window.setShunyabhedaViewMode(savedViewMode);
})(globalThis.ShunyaMath);
