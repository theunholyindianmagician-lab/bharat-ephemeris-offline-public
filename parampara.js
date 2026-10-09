/* parampara.js — परम्परा: the tradition's own records as data, and the correction they yield.
 *
 * The owner, 2026-10-08: "Do not make observation mandatory; India has observed for centuries — use those observations as
 * data." This module loads and checks the paramparā registry (corpus/parampara/registry.json, format "parampara/1"), the
 * time-unit registry (corpus/sources/time-units.json, "time-units/1"), the graha naming layer (corpus/parampara/graha.json,
 * "graha-names/1"), the e-text lines they quote (corpus/parampara/etext-lines.json) and the generated saṃskāra record
 * (corpus/parampara/samskara.json, "parampara-samskara/1"), and exposes them:
 *
 *   const P = Parampara.load({ registry, samskara, timeUnits, graha, etextLines })   // the parsed JSON files; all but
 *                                                                                      // registry are optional
 *   P.records({ class, observer, status, tag, source })    the registry's records, filtered (each frozen)
 *   P.record(id), P.sources, P.sites
 *   P.timeUnits.unit(id), P.timeUnits.units, P.timeUnits.spandasOf(id), P.timeUnits.canonical, .ladders, .conflicts
 *   P.graha.layer(name), P.graha.of(graha)
 *   P.samskaraParameshvara(opts) → { epochKali, julian, moonArcmin, nodeArcmin, sigma: { moon, node }, padas, records,
 *        label, labelSa, default, choices, corrects, leaveOneOut, sensitivity, tag, caption, source }
 *
 * THE SAṂSKĀRA. samskaraParameshvara() is not a table of numbers kept here: it reads the record that the fit code writes
 * (scripts/parampara-samskara.cjs --write, which runs samskara.js's robust fit on the JM rows named by the registry), and
 * parampara.test.js re-runs that fit and fails if the record differs by a byte. In Node a caller may pass the fit itself,
 * samskaraParameshvara({ fit }), fit being the script's exported result function, and get the same answer computed
 * afresh. Owner, 2026-10-08 (decision a): this correction is the primary default of the text tier, labelled
 * "Sūrya-Siddhānta + Parameśvara's saṃskāra"; the plain Sūrya-Siddhānta is the secondary labelled choice; the saṃskāra
 * moves only the Moon and the node.
 *
 * THE RULES the loader enforces (a registry that breaks one does not load): every record has a source named in
 * registry.sources; a record that is not the owner's statement has a locus and at least one verbatim quote with the file
 * and line it was read from; a record of class owner-statement has source "owner", status "awaiting edition", the tag
 * [owner-statement] and no [text] tag — no record exists without a source or that explicit class; classes, statuses and
 * tags are from the registry's own vocabulary; an excluded, gate or cross-check record says why.
 *
 * Exact arithmetic only (BigInt rationals); no trigonometry, no clock, no network; imports nothing.
 * Browser: window.Parampara; node: module.exports.
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.Parampara = factory();
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const FORMATS = Object.freeze({
    registry: "parampara/1", samskara: "parampara-samskara/1", timeUnits: "time-units/1",
    graha: "graha-names/1", etextLines: "parampara-etext-lines/1",
  });
  // a quote is read from: an e-text kept outside the repository (etext:<file>:<line>), a repository file and line, or a
  // BPHS verse in one of the two witnesses (corpus/bphs/<witness>.json#<chapter>.<verse>)
  const FROM = Object.freeze({
    etext: /^etext:([^:]+):(\d+)$/,
    file: /^((?:[\w.-]+\/)*[\w.-]+\.(?:html|js|cjs|json|md)):(\d+)$/,
    verse: /^corpus\/bphs\/(canon|sanskritdocuments|wikisource)\.json#(\d+)\.(\d+)$/,
  });
  const NEEDS_WHY = Object.freeze(["excluded", "gate", "cross-check"]);
  const isStr = (s) => typeof s === "string" && s.length > 0;
  const deepFreeze = (o) => { if (o && typeof o === "object" && !Object.isFrozen(o)) { Object.freeze(o); for (const v of Object.values(o)) deepFreeze(v); } return o; };
  const clone = (o) => JSON.parse(JSON.stringify(o));

  /** Which kind of place a 'from' names: { kind: "etext"|"file"|"verse", … } or null. */
  function parseFrom(from) {
    if (typeof from !== "string") return null;
    let m;
    if ((m = FROM.etext.exec(from))) return { kind: "etext", file: m[1], line: Number(m[2]) };
    if ((m = FROM.verse.exec(from))) return { kind: "verse", witness: m[1], chapter: Number(m[2]), verse: Number(m[3]) };
    if ((m = FROM.file.exec(from))) return { kind: "file", file: m[1], line: Number(m[2]) };
    return null;
  }

  // ── exact rationals (for the time-unit ratios) ─────────────────────────────────────────────────────────
  const gcd = (a, b) => { a = a < 0n ? -a : a; b = b < 0n ? -b : b; while (b) [a, b] = [b, a % b]; return a; };
  function rat(n, d = 1n) { n = BigInt(n); d = BigInt(d); if (d === 0n) throw new RangeError("parampara: a zero denominator"); if (d < 0n) { n = -n; d = -d; } const g = gcd(n, d) || 1n; return { n: n / g, d: d / g }; }
  /** A number or "n/d" string → a rational. */
  function ratOf(v) {
    if (typeof v === "number") { if (!Number.isInteger(v)) throw new RangeError(`parampara: ${v} is not an integer (write fractions as "n/d")`); return rat(v); }
    if (typeof v === "string") { const m = /^(\d+)\/(\d+)$/.exec(v); if (m) return rat(m[1], m[2]); if (/^\d+$/.test(v)) return rat(v); }
    throw new RangeError(`parampara: not a number: ${JSON.stringify(v)}`);
  }
  const ratMul = (a, b) => rat(a.n * b.n, a.d * b.d);
  const ratAdd = (a, b) => rat(a.n * b.d + b.n * a.d, a.d * b.d);
  const ratEq = (a, b) => a.n === b.n && a.d === b.d;
  const ratStr = (a) => (a.d === 1n ? String(a.n) : `${a.n}/${a.d}`);

  /** bhūtasaṅkhyā: the words' values, first word the units; a word worth more than 9 gives its digits as written
   *  (tithi 15 then viśva 13 → 1315). */
  function bhutasankhya(values) {
    if (!Array.isArray(values) || !values.length || values.some((v) => !Number.isInteger(v) || v < 0)) throw new RangeError("parampara: bhūtasaṅkhyā needs whole word values");
    return Number(values.slice().reverse().map(String).join(""));
  }
  /** An expression over number words (time-units.json 'expr') → a rational: a stem; {"×": [...]} product; {"+": [...]}
   *  sum; {"bh": [...]} bhūtasaṅkhyā of the stems, first the units. */
  function evalExpr(expr, words) {
    if (typeof expr === "string") {
      if (!Object.prototype.hasOwnProperty.call(words, expr)) throw new RangeError(`parampara: the number word "${expr}" is not in numberWords`);
      return ratOf(words[expr]);
    }
    if (expr && Array.isArray(expr["×"])) return expr["×"].map((e) => evalExpr(e, words)).reduce(ratMul, rat(1));
    if (expr && Array.isArray(expr["+"])) return expr["+"].map((e) => evalExpr(e, words)).reduce(ratAdd, rat(0));
    if (expr && Array.isArray(expr.bh)) return rat(bhutasankhya(expr.bh.map((e) => { const r = evalExpr(e, words); if (r.d !== 1n) throw new RangeError("parampara: a bhūtasaṅkhyā word must be whole"); return Number(r.n); })));
    throw new RangeError(`parampara: not an expression: ${JSON.stringify(expr)}`);
  }

  // ── validation ─────────────────────────────────────────────────────────────────────────────────────────
  function checkQuotes(quote, where, errors) {
    if (!Array.isArray(quote)) { errors.push(`${where}: quote must be a list`); return; }
    quote.forEach((q, i) => {
      if (!q || !isStr(q.sa)) errors.push(`${where}.quote[${i}]: no Sanskrit`);
      if (!q || !parseFrom(q.from)) errors.push(`${where}.quote[${i}]: 'from' must be etext:<file>:<line>, <file>:<line> or corpus/bphs/<witness>.json#c.v (it is ${q && JSON.stringify(q.from)})`);
    });
  }
  /** The registry's shape and provenance rules (see the header). Returns the list of errors (empty when it holds). */
  function validateRegistry(reg) {
    const errors = [];
    if (!reg || reg.format !== FORMATS.registry) return [`registry: format must be "${FORMATS.registry}"`];
    const voc = reg.vocabulary || {};
    const classes = new Set(voc.classes || []), statuses = new Set(voc.statuses || []), tags = new Set(voc.tags || []);
    for (const k of ["observation", "determination", "rule", "doctrine", "instrument-operation", "owner-statement"]) if (!classes.has(k)) errors.push(`vocabulary: class ${k} missing`);
    const sources = reg.sources || {};
    for (const [id, s] of Object.entries(sources)) if (!s || !isStr(s.edition)) errors.push(`sources.${id}: no edition`);
    if (!Array.isArray(reg.records) || !reg.records.length) errors.push("registry: no records");
    const seen = new Set();
    for (const r of reg.records || []) {
      const w = `record ${r && r.id}`;
      if (!r || !isStr(r.id)) { errors.push("a record without an id"); continue; }
      if (seen.has(r.id)) errors.push(`${w}: duplicate id`);
      seen.add(r.id);
      if (!classes.has(r.class)) errors.push(`${w}: class "${r.class}" not in the vocabulary`);
      if (!statuses.has(r.status)) errors.push(`${w}: status "${r.status}" not in the vocabulary`);
      if (!Array.isArray(r.tags) || !r.tags.length) errors.push(`${w}: no tags`);
      for (const t of r.tags || []) if (!tags.has(t)) errors.push(`${w}: tag ${t} not in the vocabulary`);
      if (!isStr(r.observer)) errors.push(`${w}: no observer`);
      if (!isStr(r.source) || !sources[r.source]) errors.push(`${w}: source "${r.source}" is not in registry.sources`);
      if (!r.era || typeof r.era !== "object") errors.push(`${w}: no era`);
      if (r.class === "owner-statement") {
        if (r.source !== "owner") errors.push(`${w}: an owner-statement's source is "owner"`);
        if (r.status !== "awaiting edition") errors.push(`${w}: an owner-statement awaits an edition`);
        if (!(r.tags || []).includes("[owner-statement]")) errors.push(`${w}: an owner-statement is tagged [owner-statement]`);
        if ((r.tags || []).includes("[text]")) errors.push(`${w}: an owner-statement cannot be [text]`);
        if (Array.isArray(r.quote) && r.quote.length) checkQuotes(r.quote, w, errors);
      } else {
        if (r.source === "owner") errors.push(`${w}: only an owner-statement may have the owner as its source`);
        if (!isStr(r.locus)) errors.push(`${w}: no locus`);
        if (!Array.isArray(r.quote) || !r.quote.length) errors.push(`${w}: no quote (a record that is not the owner's statement quotes its source)`);
        else checkQuotes(r.quote, w, errors);
        if (r.status === "awaiting edition") errors.push(`${w}: only an owner-statement awaits an edition`);
      }
      if (NEEDS_WHY.includes(r.status) && !isStr(r.why)) errors.push(`${w}: status ${r.status} needs a why`);
      for (const a of r.assumptions || []) if (!a || !isStr(a.text) || !tags.has(a.tag)) errors.push(`${w}: an assumption needs text and a vocabulary tag`);
      if (r.sigma !== null && r.sigma !== undefined && (typeof r.sigma !== "object" || !isStr(r.sigma.rule))) errors.push(`${w}: a sigma states its rule`);
      // the year as kala-dvara.js gives it (astronomical, unpadded): 1422, 496, 0 or −3101 (the Kali epoch) all hold
      if (r.era && r.era.kaliDay !== undefined && !(Number.isInteger(r.era.kaliDay) && /^-?\d{1,6}-\d{2}-\d{2}$/.test(r.era.julian || ""))) errors.push(`${w}: a Kali day carries its Julian date`);
      if (typeof r.sha256 !== "string" || !(r.sha256 === "" || /^[0-9a-f]{64}$/.test(r.sha256))) errors.push(`${w}: sha256 must be 64 hex digits`);
    }
    for (const [k, v] of Object.entries((reg.sites && reg.sites.ashvatthagrama) || {})) if (v && typeof v === "object" && v.from !== undefined && !parseFrom(v.from)) errors.push(`sites.ashvatthagrama.${k}: bad 'from'`);
    return errors;
  }

  /** The time-unit registry: its chain multiplies out, every attestation is tagged and placed, each stated ratio is
   *  derived from its number words, and each unit's spandas follow from the unit it is measured by. */
  function validateTimeUnits(tu) {
    const errors = [];
    if (!tu || tu.format !== FORMATS.timeUnits) return [`time-units: format must be "${FORMATS.timeUnits}"`];
    const c = tu.canonical || {};
    const prod = (c.chain || []).reduce((p, [, k]) => p * BigInt(k), 1n);
    if (prod !== BigInt(c.spandasPerAhoratra || 0)) errors.push(`canonical: the chain multiplies to ${prod}, not ${c.spandasPerAhoratra}`);
    if (BigInt(c.spandasPerAhoratra || 0) !== 100n * BigInt(c.paramanuPerAhoratra || 0)) errors.push("canonical: spandas per ahorātra must be 100 × paramāṇu");
    const words = (tu.numberWords && tu.numberWords.values) || {};
    const ids = new Set();
    const TAGS = new Set(["[text]", "[reading]", "[standard]", "[claim-only]", "[owner-statement]", "[theorem]"]);
    for (const u of tu.units || []) {
      if (!isStr(u.id) || ids.has(u.id)) errors.push(`unit ${u.id}: missing or duplicate id`);
      ids.add(u.id);
      for (const [i, a] of (u.attestations || []).entries()) {
        const w = `unit ${u.id} attestation ${i}`;
        if (!TAGS.has(a.tag)) errors.push(`${w}: tag ${a.tag}`);
        if (!isStr(a.source) || !(tu.sources || {})[a.source]) errors.push(`${w}: source "${a.source}" not in sources`);
        if (a.tag === "[owner-statement]" && !(a.source === "owner" && isStr(a.record) && a.status === "awaiting edition")) errors.push(`${w}: an owner-statement names its registry record and awaits an edition`);
        if (a.tag === "[text]" && (["owner", "code", "other-repos"].includes(a.source) || !Array.isArray(a.quote) || !a.quote.length)) errors.push(`${w}: [text] needs a local source and a quote`);
        if (a.quote) checkQuotes(a.quote, w, errors);
        if (a.from !== undefined && !parseFrom(a.from)) errors.push(`${w}: bad 'from'`);
        if (a.source === "other-repos" && !isStr(a.at)) errors.push(`${w}: another repository's file is named in 'at'`);
        if (a.states) {
          try {
            const got = evalExpr(a.expr, words);
            if (!ratEq(got, ratOf(a.states.equals))) errors.push(`${w}: the words give ${ratStr(got)}, the entry says ${a.states.equals}`);
          } catch (e) { errors.push(`${w}: ${e.message}`); }
          const text = (a.quote || []).map((q) => q.sa).join(" ");
          if (!Array.isArray(a.forms) || !a.forms.length) errors.push(`${w}: a stated ratio names the words it is read from`);
          for (const f of a.forms || []) if (!text.includes(f)) errors.push(`${w}: "${f}" is not in the quote`);
        }
      }
    }
    // spandas: a unit measured by a unit on the lattice is on the lattice by the same ratio
    const byId = new Map((tu.units || []).map((u) => [u.id, u]));
    const chainUnits = new Map(); { let s = 1n; for (const [u, k] of c.chain || []) { chainUnits.set(u, s); s *= BigInt(k); } }
    for (const u of tu.units || []) {
      if (u.spandas === undefined || !u.size || typeof u.size !== "object") continue;
      const of = byId.get(u.size.of);
      const base = of && of.spandas !== undefined ? rat(of.spandas) : null;
      if (base) { const want = ratMul(ratOf(u.size.equals), base); if (!ratEq(want, rat(u.spandas))) errors.push(`unit ${u.id}: ${ratStr(want)} spandas by its size, ${u.spandas} recorded`); }
      if (chainUnits.has(u.id) && BigInt(u.spandas) !== chainUnits.get(u.id)) errors.push(`unit ${u.id}: the chain gives ${chainUnits.get(u.id)} spandas`);
    }
    for (const x of tu.conflicts || []) if (!isStr(x.id) || !isStr(x.what) || !isStr(x.resolution)) errors.push(`conflict ${x.id}: needs what and resolution`);
    for (const u of tu.units || []) for (const k of u.conflicts || []) if (!(tu.conflicts || []).some((x) => x.id === k)) errors.push(`unit ${u.id}: conflict ${k} is not listed`);
    return errors;
  }

  /** The graha layer: each layer quotes its verses, and each japa count is the bhūtasaṅkhyā of its words × 1000. */
  function validateGraha(g) {
    const errors = [];
    if (!g || g.format !== FORMATS.graha) return [`graha: format must be "${FORMATS.graha}"`];
    const known = new Set(g.grahas || []);
    for (const [name, L] of Object.entries(g.layers || {})) {
      if (!isStr(L.locus) || !isStr(L.tag)) errors.push(`layer ${name}: locus and tag`);
      if (!Array.isArray(L.quote) || !L.quote.length) errors.push(`layer ${name}: no quote`); else checkQuotes(L.quote, `layer ${name}`, errors);
      for (const k of Object.keys(L.values || {})) if (!known.has(k)) errors.push(`layer ${name}: unknown graha ${k}`);
    }
    const J = g.layers && g.layers.japa;
    if (J) {
      const text = J.quote.map((q) => q.sa).join(" ");
      for (const n of J.numerals || []) {
        if (bhutasankhya(n.values) !== n.count) errors.push(`japa ${n.graha}: ${n.values} decode to ${bhutasankhya(n.values)}, not ${n.count}`);
        if (!text.includes(n.form)) errors.push(`japa ${n.graha}: "${n.form}" is not in the verse`);
        if (J.values[n.graha] !== n.count * J.multiplier) errors.push(`japa ${n.graha}: ${J.values[n.graha]} is not ${n.count} × ${J.multiplier}`);
      }
    }
    const S = g.navagrahaStotra;
    if (!S || S.class !== "owner-statement" || S.status !== "awaiting edition") errors.push("navagrahaStotra: an owner-statement awaiting edition");
    return errors;
  }

  function validateSamskara(s) {
    const errors = [];
    if (!s || s.format !== FORMATS.samskara) return [`samskara: format must be "${FORMATS.samskara}"`];
    if (!Array.isArray(s.fits) || !s.fits.length) errors.push("samskara: no fits");
    else for (const p of ["moon.epoch", "node.epoch"]) if (!s.fits[0].params || !s.fits[0].params[p] || s.fits[0].params[p].status !== "fitted") errors.push(`samskara: ${p} not fitted`);
    if (!s.offered || !isStr(s.offered.label)) errors.push("samskara: no label");
    if (!Number.isInteger(s.epochKali)) errors.push("samskara: no epoch");
    return errors;
  }

  // ── the saṃskāra ───────────────────────────────────────────────────────────────────────────────────────
  const recordOfRow = (id) => String(id).replace(/-(timed|seen)$/, "");
  function samskaraFrom(s, reg) {
    const main = s.fits[0], mo = main.params["moon.epoch"], no = main.params["node.epoch"];
    const used = [...new Set(main.used.map(recordOfRow))];
    const known = new Set(reg.records.map((r) => r.id));
    for (const id of used) if (!known.has(id)) throw new RangeError(`parampara: the saṃskāra used ${id}, which the registry does not name`);
    return deepFreeze({
      epochKali: s.epochKali, julian: s.julian, vara: s.vara,
      moonArcmin: mo.delta, nodeArcmin: no.delta, sigma: { moon: mo.sigma, node: no.sigma },
      padas: main.man_padas, records: used, rows: main.rows, setAside: main.rejected.map((r) => ({ id: r.id, sigma: r.normalized })),
      chi2PerDof: main.chi2PerDof, tag: s.tag,
      label: s.offered.label, labelSa: s.offered.labelSa, caption: s.offered.caption,
      default: s.offered.default === true, offered: s.offered.offered === true, corrects: s.offered.corrects, choices: s.offered.choices, rule: s.offered.rule,
      held: s.held,
      leaveOneOut: { meanTextGhati: s.leaveOneOut.meanTextGhati, meanCorrectedGhati: s.leaveOneOut.meanCorrectedGhati, improved: s.leaveOneOut.improved, n: s.leaveOneOut.n,
        withoutSetAside: s.leaveOneOut.withoutSetAside, rows: s.leaveOneOut.rows },
      sensitivity: s.fits.map((f) => ({ padas: f.man_padas, moonArcmin: f.params["moon.epoch"].delta, nodeArcmin: f.params["node.epoch"].delta, chi2PerDof: f.chi2PerDof })),
      source: {
        records: "corpus/parampara/registry.json → corpus/jyotirmimamsa/readings.json (Parameśvara's eclipses, Siddhāntadīpikā vv.69-85, JM pp.33-34)",
        fit: "scripts/parampara-samskara.cjs (samskara.js robust least squares, the Sun held)", file: "corpus/parampara/samskara.json",
        generatedBy: s.generatedBy, inputs: s.inputs, site: s.site,
      },
    });
  }

  /** Load the parsed corpus files. Throws if the registry (or any other file given) breaks its rules. */
  function load(data) {
    if (!data || !data.registry) throw new RangeError("parampara: load({ registry, … }) needs the registry");
    const reg = deepFreeze(clone(data.registry));
    const fail = (what, errs) => { if (errs.length) throw new RangeError(`parampara: the ${what} does not hold:\n  ` + errs.slice(0, 20).join("\n  ") + (errs.length > 20 ? `\n  … ${errs.length - 20} more` : "")); };
    fail("registry", validateRegistry(reg));
    const tu = data.timeUnits ? deepFreeze(clone(data.timeUnits)) : null;
    if (tu) fail("time-unit registry", validateTimeUnits(tu));
    const gr = data.graha ? deepFreeze(clone(data.graha)) : null;
    if (gr) fail("graha layer", validateGraha(gr));
    const sk = data.samskara ? deepFreeze(clone(data.samskara)) : null;
    if (sk) fail("saṃskāra record", validateSamskara(sk));
    const et = data.etextLines ? deepFreeze(clone(data.etextLines)) : null;
    if (et && et.format !== FORMATS.etextLines) fail("e-text lines", [`format must be "${FORMATS.etextLines}"`]);

    const byId = new Map(reg.records.map((r) => [r.id, r]));
    function records(q = {}) {
      return reg.records.filter((r) => (q.class === undefined || r.class === q.class) && (q.status === undefined || r.status === q.status)
        && (q.source === undefined || r.source === q.source) && (q.tag === undefined || r.tags.includes(q.tag))
        && (q.observer === undefined || r.observer.toLowerCase().includes(String(q.observer).toLowerCase())));
    }
    const timeUnits = tu && Object.freeze({
      units: tu.units, canonical: tu.canonical, ladders: tu.ladders, conflicts: tu.conflicts, sources: tu.sources, numberWords: tu.numberWords,
      unit: (id) => tu.units.find((u) => u.id === id) || null,
      spandasOf: (id) => { const u = tu.units.find((x) => x.id === id); return u && u.spandas !== undefined ? u.spandas : null; },
    });
    const graha = gr && Object.freeze({
      grahas: gr.grahas, layers: gr.layers, navagrahaStotra: gr.navagrahaStotra,
      layer: (name) => gr.layers[name] || null,
      of: (g) => Object.fromEntries(Object.entries(gr.layers).filter(([, L]) => L.values && L.values[g] !== undefined).map(([n, L]) => [n, L.values[g]])),
    });
    let cached = null;
    /** Parameśvara's saṃskāra (see the header). opts.fit: a function returning the samskara record afresh (Node). */
    function samskaraParameshvara(opts = {}) {
      if (typeof opts.fit === "function") {
        const fresh = opts.fit();
        const errs = validateSamskara(fresh);
        if (errs.length) throw new RangeError("parampara: the fit returned a bad record: " + errs.join("; "));
        return samskaraFrom(fresh, reg);
      }
      if (!sk) throw new RangeError("parampara: load({ samskara }) to read the saṃskāra");
      return cached || (cached = samskaraFrom(sk, reg));
    }
    return Object.freeze({
      format: reg.format, sources: reg.sources, sites: reg.sites, vocabulary: reg.vocabulary,
      records, record: (id) => byId.get(id) || null,
      timeUnits, graha, etextLines: et, samskaraParameshvara,
    });
  }

  return Object.freeze({ FORMATS, load, validateRegistry, validateTimeUnits, validateGraha, validateSamskara, parseFrom, evalExpr, bhutasankhya, ratOf, ratStr });
});
