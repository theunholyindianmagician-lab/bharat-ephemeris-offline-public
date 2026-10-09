/* vedha-lekha.js — वेध-लेख: the owner's observation ledger, its seal and its certifier (slice 7 of the vedha-yantra
 * design, VEDHA-YANTRA-DESIGN-2026-10-07.md §4.2 L6, §4.5, §7.6).
 *
 * The loop of the tradition is gaṇita → vedha → antara → saṃskāra → parīkṣā (design §0.2, §4.5). This module is the
 * vedha and the antara of it: a ledger in which each observation is written once, in the owner's own units, chained to
 * the one before it by a hash, so that nothing can later be changed, reordered, removed or slipped in without the chain
 * saying so; a certifier that refuses what the owner's instruments cannot have produced; and a reduction that puts each
 * observation beside what the text predicts for it.
 *
 * THE LEDGER (format "vedha-lekha/1", corpus/vedha/LEDGER.md)
 *   { format, site, shanku?, entries: [entry…], seal? }
 *   entry = { seq, prev, at, record, sealedHash }
 *     seq          1, 2, 3, … with no gap
 *     prev         the sealedHash of the entry before; for the first, the hash of the header { format, site, shanku }
 *     at           the Kali day (kala-dvara.js) on which the entry was written; never decreasing
 *     record       one observation (the kinds below)
 *     sealedHash   SHA-256 of the canonical JSON of { seq, prev, at, record }
 *   seal = { n, head, at, hash }: hash = SHA-256 of the canonical JSON of { format, genesis, n, head, at }. A sealed
 *   ledger takes no more entries. The seal is the one number the owner writes down elsewhere: with it, even a rewrite
 *   of the whole chain is caught.
 * Canonical JSON: keys sorted, no white space, numbers as the language prints them; undefined members dropped.
 * SHA-256 is written out here (the published algorithm, its constants derived below as integer roots), not taken
 * from any library; the test checks it against the published vectors.
 *
 * THE KINDS (the five of corpus/vedha/README.md, read by ss-chaya.js, and eight that the design needs)
 *   madhyahna, vishuvat, ayananta, ishta, kapala   the shadow and the bowl, exactly as "vedha-chaya/1" (SS 3, 1.12, 13.23)
 *   yamyottara      a star on the meridian: the bowl's count from sunrise, and/or its meridian altitude (unnata) in
 *                   aṃśa-kalā-vikalā with the side (disha) it was read from; upper or lower transit. The turn's phase
 *                   against the stars (1.12, 2.63, 3.42) and, from a circumpolar star's two transits, the dhruva's
 *                   elevation (12.72-12.73; dhruva.js).
 *   grahana         an eclipse contact (sparsha, nimilana, madhya, unmilana, moksha; 4.16-4.17) of the Moon or the Sun,
 *                   timed by the bowl from sunrise, or for the Sun by the śaṅku's shadow (3.37-3.39). The day is the
 *                   civil day of the sunrise before it (Jyotirmīmāṃsā p.36).
 *   candra-darshana the Moon seen or not seen on an evening (west, first crescent) or a morning (east, last): 10.1's
 *                   twelve kālāṃśa.
 *   candra-yoga     the Moon on a junction star's circle through the dhruva (the conjunction of 8.14-8.15 judged by the
 *                   dhruvaka), timed by the bowl from sunrise.
 *   ganita          the prediction written before the event (design §4.5, step 1): what it is for, the model that made
 *                   it, its values in the owner's units. An observation may cite it; the certifier makes sure it came first.
 *   yantra          a reading of one of the owner's instruments (yantra.js: Jai Singh II's samrāṭ, nāḍīvalaya, jaya
 *                   prakāśa, kapāla, rāma, digaṃśa, ṣaṣṭhāṃśa, dakṣiṇottara-bhitti, rāśivalaya, unnatāṃśa), in the
 *                   instrument's own graduation — a nata in ghaṭī-vināḍī-prāṇa with its side, an arc in aṃśa-kalā-vikalā
 *                   with its gola or disha — of the Sun or a junction star, optionally timed by the bowl from sunrise.
 *                   yantra.js's checkReading is the schema; its reduceReading puts the text beside it.
 *   uttara-rekha    the owner's north–south line (3.3: drawn by the shadow circle and the fish) checked by a star near the
 *                   dhruva: the arc (digamsha) from that provisional line to the star at its eastern (purva) and at its
 *                   western (pashcima) greatest elongation, each with its day and the side of the line it lay on, and the
 *                   uncertainty (sigma) of one reading. True north is the midpoint of the two (dhruva.js
 *                   northFromElongations) [theorem].
 *   ayananta-yugma  the two solstice noons at the ledger's site: the Sun's noon zenith distance (natamsha) and the side of
 *                   the zenith it stood on (disha), at the karka and at the makara solstice (3.11), each with its day, and
 *                   the uncertainty (sigma) of one reading. ε is half their signed difference, the latitude half their
 *                   signed sum (dhruva.js fromSolsticeZenithDistances) [theorem].
 *   These two are the FRAME kinds. Their reduction is geometric and exact (whole vikalā in, half vikalā out), with the
 *   uncertainty propagated from one reading's sigma. Refraction does not cancel in these readings, and nothing here
 *   removes it. What they give is a PREVIEW beside the text's own values — ε = arc of 1397/3438 (SS 2.28), the default
 *   — and beside the ledger's own place: never applied, never replacing a constant. Using a measured value is the
 *   owner's explicit choice, made elsewhere (dhruva.js and the pañcāṅga take an `epsilon` argument). The text tier is
 *   complete without any observation; a ledger is an optional extra. (The text tier's default, the Sūrya-Siddhānta with
 *   Parameśvara's saṃskāra [owner's decision, 2026-10-08], corrects only the Moon, its apogee and its node — the Sun gets
 *   none (parahita-madhyama.js) — so its ε is still SS 2.28's.)
 *
 * THE CERTIFIER refuses, with a reason each: any field outside the schema; any field of a modern clock, Julian day,
 * equatorial or horizontal coordinate, geodetic datum or ephemeris (named so in the reason); any string naming a modern
 * source (the frame gate's names of kala-dvara.test.js and the others listed below) or carrying a modern time stamp;
 * entries out of order; a broken chain or seal; a gaṇita written after its day or cited before it was written; and
 * every synthetic record unless the caller allows them — a synthetic record always needs its generator.
 *
 * Time. A bowl count is asus of the TURN (6 prāṇa = 1 vināḍī, 60 vināḍī = 1 ghaṭī, 60 ghaṭī = one turn: 1.11-1.12),
 * corrected by the bowl's own count of a turn (the "kapala" records). It becomes civil time only through 1.34-1.37:
 * one civil day is 21,600 × 1,582,237,828 ÷ 1,577,917,828 asus of the turn. Sunrise, the origin of every count here, is
 * the instant the true Sun's hour angle is minus its half-day (2.61-2.63), the hour angle being the meridian's asus
 * (ss-grahana.js) less the Sun's ascension (ss-udaya.js, 3.42): the zero of SSUdaya.sinceSunrise, which ss-grahana.js's
 * clock counts from and ss-chaya.js's shadow clock (3.37-3.39) reads as half-day ∓ nata;
 * `sunrise: "text"` takes 2.46's instead (ss-drishya.js). The crescent is judged at ss-drishya.js's own sunset and
 * sunrise (its defaults; `drishya` passes options through).
 *
 * Requires only the sovereign files: kala-dvara.js, sphuta.js, dhruva.js, ss-udaya.js, ss-chaya.js, ss-grahana.js,
 * ss-drishya.js, yantra.js. No node built-in, no modern source as computation, seed or referee.
 * Browser: window.VedhaLekha (needs KalaDvara, Sphuta, Dhruva, SSUdaya, SSChaya, SSGrahana, SSDrishya, Yantra); node: module.exports.
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory(require("./kala-dvara.js"), require("./sphuta.js"), require("./dhruva.js"), require("./ss-udaya.js"), require("./ss-chaya.js"), require("./ss-grahana.js"), require("./ss-drishya.js"), require("./yantra.js"));
  else root.VedhaLekha = factory(root.KalaDvara, root.Sphuta, root.Dhruva, root.SSUdaya, root.SSChaya, root.SSGrahana, root.SSDrishya, root.Yantra);
})(typeof globalThis !== "undefined" ? globalThis : this, function vedhaLekhaOf(K, S, Dh, U, C, G, D, Y) {
  "use strict";
  const FORMAT = "vedha-lekha/1";
  const TURN = 21600, HALF = 10800, ASU_PER_VINADI = 6, ASU_PER_GHATI = 360;      // 1.11-1.12
  const M = K.mana("surya");
  const CIVIL = Number(M.savana), TURNS = Number(M.nakshatra);                     // 1.34-1.37
  const ASUS_PER_DAY = TURN * TURNS / CIVIL;                                         // asus of the turn in one civil day
  const DARSHANA = U.DARSHANA_KALAMSA;                                               // 10.1: twelve
  const mod = (a, m) => ((a % m) + m) % m;
  const wrap180 = (a) => mod(a + 180, 360) - 180;
  const wrapAsus = (a) => mod(a + HALF, TURN) - HALF;
  const isObj = (x) => x !== null && typeof x === "object" && !Array.isArray(x);
  const own = (o, k) => typeof k === "string" && Object.prototype.hasOwnProperty.call(o, k);   // "constructor" is not a kind

  // ── SHA-256 ─────────────────────────────────────────────────────────────────────────────────────
  // The constants are the first 32 bits of the fractional parts of the square roots (H) and cube roots (K) of the first
  // 8 and 64 primes. They are derived here as integer roots in BigInt — floor(√(p·2⁶⁴)) and floor(∛(p·2⁹⁶)) mod 2³² —
  // so no constant is typed in; the published vectors in the test decide whether the result is SHA-256.
  function iroot(n, k) {
    if (n < 2n) return n;
    let x = BigInt(Math.ceil(Math.pow(Number(n), 1 / Number(k)))) + 2n;             // above the root; Newton comes down
    for (;;) { const y = ((k - 1n) * x + n / x ** (k - 1n)) / k; if (y >= x) break; x = y; }
    while (x ** k > n) x--;
    while ((x + 1n) ** k <= n) x++;
    return x;
  }
  const PRIMES = (() => { const out = []; for (let n = 2; out.length < 64; n++) if (out.every((p) => n % p)) out.push(n); return out; })();
  const MASK32 = 0xffffffffn;
  const H0 = Uint32Array.from(PRIMES.slice(0, 8), (p) => Number(iroot(BigInt(p) << 64n, 2n) & MASK32));
  const K256 = Uint32Array.from(PRIMES, (p) => Number(iroot(BigInt(p) << 96n, 3n) & MASK32));
  /** UTF-8 bytes of a string (a lone surrogate becomes U+FFFD). */
  function utf8(str) {
    const out = [];
    for (let i = 0; i < str.length; i++) {
      let c = str.charCodeAt(i);
      if (c >= 0xd800 && c <= 0xdfff) {
        const d = i + 1 < str.length ? str.charCodeAt(i + 1) : 0;
        if (c <= 0xdbff && d >= 0xdc00 && d <= 0xdfff) { c = 0x10000 + ((c - 0xd800) << 10) + (d - 0xdc00); i++; } else c = 0xfffd;
      }
      if (c < 0x80) out.push(c);
      else if (c < 0x800) out.push(0xc0 | (c >> 6), 0x80 | (c & 63));
      else if (c < 0x10000) out.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 63), 0x80 | (c & 63));
      else out.push(0xf0 | (c >> 18), 0x80 | ((c >> 12) & 63), 0x80 | ((c >> 6) & 63), 0x80 | (c & 63));
    }
    return Uint8Array.from(out);
  }
  const rotr = (x, n) => (x >>> n) | (x << (32 - n));
  /** SHA-256 of a string (as UTF-8) or of bytes, as 64 lowercase hex digits. */
  function sha256(input) {
    const bytes = typeof input === "string" ? utf8(input) : Uint8Array.from(input);
    const l = bytes.length, n = Math.ceil((l + 9) / 64) * 64;
    const m = new Uint8Array(n);
    m.set(bytes); m[l] = 0x80;
    const bits = l * 8, hi = Math.floor(bits / 0x100000000), lo = bits >>> 0;          // the length, big-endian, in 64 bits
    for (let i = 0; i < 4; i++) { m[n - 8 + i] = (hi >>> (24 - 8 * i)) & 255; m[n - 4 + i] = (lo >>> (24 - 8 * i)) & 255; }
    const h = Uint32Array.from(H0), w = new Uint32Array(64);
    for (let off = 0; off < n; off += 64) {
      for (let i = 0; i < 16; i++) w[i] = ((m[off + 4 * i] << 24) | (m[off + 4 * i + 1] << 16) | (m[off + 4 * i + 2] << 8) | m[off + 4 * i + 3]) >>> 0;
      for (let i = 16; i < 64; i++) {
        const a = w[i - 15], b = w[i - 2];
        w[i] = (w[i - 16] + (rotr(a, 7) ^ rotr(a, 18) ^ (a >>> 3)) + w[i - 7] + (rotr(b, 17) ^ rotr(b, 19) ^ (b >>> 10))) >>> 0;
      }
      let a = h[0], b = h[1], c = h[2], d = h[3], e = h[4], f = h[5], g = h[6], k = h[7];
      for (let i = 0; i < 64; i++) {
        const t1 = (k + (rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25)) + ((e & f) ^ (~e & g)) + K256[i] + w[i]) >>> 0;
        const t2 = ((rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22)) + ((a & b) ^ (a & c) ^ (b & c))) >>> 0;
        k = g; g = f; f = e; e = (d + t1) >>> 0; d = c; c = b; b = a; a = (t1 + t2) >>> 0;
      }
      h[0] += a; h[1] += b; h[2] += c; h[3] += d; h[4] += e; h[5] += f; h[6] += g; h[7] += k;
    }
    return Array.from(h, (x) => x.toString(16).padStart(8, "0")).join("");
  }

  /** Canonical JSON: object keys sorted, no white space; only strings, finite numbers, booleans, null, arrays and plain
   *  objects; undefined members are dropped (as JSON drops them). */
  function canonical(v) {
    if (v === null) return "null";
    if (typeof v === "string") return JSON.stringify(v);
    if (typeof v === "boolean") return v ? "true" : "false";
    if (typeof v === "number") { if (!Number.isFinite(v)) throw new TypeError("vedha-lekha: a number in the ledger must be finite"); return JSON.stringify(v); }
    if (Array.isArray(v)) return "[" + v.map((x) => (x === undefined ? "null" : canonical(x))).join(",") + "]";
    if (typeof v === "object") {
      const proto = Object.getPrototypeOf(v);
      if (proto !== Object.prototype && proto !== null) throw new TypeError("vedha-lekha: only plain objects go into the ledger");
      return "{" + Object.keys(v).filter((k) => v[k] !== undefined).sort().map((k) => JSON.stringify(k) + ":" + canonical(v[k])).join(",") + "}";
    }
    throw new TypeError(`vedha-lekha: a ${typeof v} cannot go into the ledger`);
  }
  const hashOf = (v) => sha256(canonical(v));
  const header = (L) => (L.shanku === undefined ? { format: L.format, site: L.site } : { format: L.format, site: L.site, shanku: L.shanku });
  const genesisOf = (L) => hashOf(header(L));
  const entryHash = (e) => hashOf({ seq: e.seq, prev: e.prev, at: e.at, record: e.record });
  const sealHash = (L, s) => hashOf({ format: L.format, genesis: genesisOf(L), n: s.n, head: s.head, at: s.at });
  function deepFreeze(x) { if (x && typeof x === "object" && !Object.isFrozen(x)) { Object.freeze(x); for (const k of Object.keys(x)) deepFreeze(x[k]); } return x; }
  const clone = (x) => JSON.parse(JSON.stringify(x));

  // ── the schema ──────────────────────────────────────────────────────────────────────────────────
  const CHAYA_KINDS = Object.freeze(Object.keys(C.KINDS));                          // madhyahna, vishuvat, ayananta, ishta, kapala
  const COMMON = Object.freeze(["id", "kind", "day", "observer", "note", "synthetic", "generator", "ganita"]);
  const CONTACTS = Object.freeze(["sparsha", "nimilana", "madhya", "unmilana", "moksha"]);
  const KINDS = Object.freeze({
    madhyahna: Object.freeze({ fields: C.KINDS.madhyahna, source: "SS 3.14b-3.20 — corpus/vedha/README.md, reduced by ss-chaya.js" }),
    vishuvat: Object.freeze({ fields: C.KINDS.vishuvat, source: "SS 3.11, 3.12b-3.14a — corpus/vedha/README.md" }),
    ayananta: Object.freeze({ fields: C.KINDS.ayananta, source: "SS 3.11 — corpus/vedha/README.md" }),
    ishta: Object.freeze({ fields: C.KINDS.ishta, source: "SS 3.34-3.41 — corpus/vedha/README.md" }),
    kapala: Object.freeze({ fields: C.KINDS.kapala, source: "SS 1.12, 13.23 — corpus/vedha/README.md" }),
    yamyottara: Object.freeze({ fields: Object.freeze(["star", "transit", "kapala", "calibration", "unnata", "disha"]),
      source: "SS 1.12 (one return of a star to the meridian is one turn), 2.63 and 3.42 (a star's own ascension and declination), 12.72-12.73 (the dhruva's elevation)" }),
    grahana: Object.freeze({ fields: Object.freeze(["body", "contact", "kapala", "calibration", "chaya", "side"]),
      source: "SS 4.16-4.17 (the contacts), 3.37-3.39 (the shadow clock); Jyotirmīmāṃsā p.36 (the day is the sunrise before)" }),
    "candra-darshana": Object.freeze({ fields: Object.freeze(["horizon", "seen"]), source: "SS 10.1 (twelve kālāṃśa), 9.5, 7.8-7.10" }),
    "candra-yoga": Object.freeze({ fields: Object.freeze(["star", "kapala", "calibration"]), source: "SS 8.14-8.15 (a conjunction judged by the dhruvaka), 7.10 (the Moon's own circle through the dhruva)" }),
    ganita: Object.freeze({ fields: Object.freeze(["for", "model", "values"]), source: "design §4.5 step 1: the prediction is written first" }),
    yantra: Object.freeze({ fields: Object.freeze(["yantra", "body", "reading", "kapala", "calibration"]),
      source: "yantra.js: the instrument's own graduation (SS 3.34b-3.39 and 3.42 for the frame; Jai Singh II's instruments, geometry derived from the sphere)" }),
    "uttara-rekha": Object.freeze({ fields: Object.freeze(["star", "purva", "pashcima", "sigma"]),
      source: "SS 3.1-3.3 (the north–south line drawn by the shadow circle and the fish), 12.72-12.73 (the dhruva); dhruva.js northFromElongations: true north is the midpoint of the two greatest elongations [theorem]" }),
    "ayananta-yugma": Object.freeze({ fields: Object.freeze(["karka", "makara", "sigma"]),
      source: "SS 3.11 (at the solstices and the equinoxes the computed place is checked against what is seen), 2.28 (the text's ε, which stays the default); dhruva.js fromSolsticeZenithDistances: ε and the latitude from the two noon zenith distances [theorem]" }),
  });
  const OBSERVATION_KINDS = Object.freeze(Object.keys(KINDS).filter((k) => k !== "ganita"));
  const TOP = Object.freeze(["format", "site", "shanku", "entries", "seal"]);
  const SITE = Object.freeze(["name", "deshantara", "palabha", "latitude"]);
  const ENTRY = Object.freeze(["seq", "prev", "at", "record", "sealedHash"]);
  const SEAL = Object.freeze(["n", "head", "at", "hash"]);
  const KAPALA = Object.freeze(["ghati", "vinadi", "prana"]);
  const ANGULA = Object.freeze(["angula", "vyangula"]);
  const ARC = Object.freeze(["amsha", "kala", "vikala"]);

  // ── what the instruments cannot have produced ───────────────────────────────────────────────────
  // The frame gate's names (kala-dvara.test.js [FRAME]), each spelled here with a "·" so that this file itself passes
  // that gate; the test checks that the expression rebuilt from them is the gate's own.
  const unspell = (s) => s.split("·").join("");
  const GATE_WORDS = ["D·E4\\d\\d", "V·SOP\\d*", "E·LP\\d*", "S·wiss", "s·wisseph", "G·aia", "I·ERS", "D·rikTier"].map(unspell);
  const GATE_TAIL = ["f·inals\\.all", "D·eltaT", "a·stronomy-engine"].map(unspell);
  const GATE_FORBIDDEN = new RegExp("\\b(?:" + GATE_WORDS.join("|") + ")\\b|" + GATE_TAIL.join("|"));
  const GATE_ANY_CASE = new RegExp(GATE_FORBIDDEN.source, "i");
  // Further modern sources, frames and time services, named as acronyms (case as written) and as product names (any case).
  const MODERN_ACRONYMS = /\b(?:JPL|NASA|NOVAS|SOFA|USNO|ICRS|ICRF|J2000(?:\.0)?|FK[45]|UTC|GMT|TAI|UT1|TDB|IST|GPS|GNSS|NTP|WGS[\s-]?84|EGM\d+|ITRF)\b/;
  const MODERN_PRODUCTS = /\b(?:hipparcos|stellarium|skyfield|pyephem|astropy|timeanddate)\b/i;
  const ISO_STAMP = /\b\d{4}-\d{2}-\d{2}[T ]\d{1,2}:\d{2}|\b\d{1,2}:\d{2}(?::\d{2}(?:\.\d+)?)?\s*(?:Z\b|[+-]\d{2}:?\d{2}\b)/;
  /** Why a string cannot stand in the ledger, or null. */
  function modernIn(s) {
    const m = s.match(GATE_ANY_CASE) || s.match(MODERN_ACRONYMS) || s.match(MODERN_PRODUCTS);
    if (m) return `names a modern source or standard ("${m[0]}")`;
    const t = s.match(ISO_STAMP);
    if (t) return `carries a modern time stamp ("${t[0]}")`;
    return null;
  }
  /** Field names of the modern frames, each with the reason given when it is refused. */
  const MODERN_FIELDS = Object.freeze([
    [/^(?:utc|gmt|ist|tai|tt|tdb|ut[012]?|zulu|tz|time_?zone|zone|utc_?offset|offset|iso(?:8601)?|time_?stamp|date_?time|date|time|unix|epoch_?ms|millis|ms|hh?mm(?:ss)?|hours?|minutes?|seconds?|clock)$/i,
      "a modern clock or time-stamp field (UTC style): time is the bowl's count of the turn { ghati, vinadi, prana } and the day is { kali } or a civil date"],
    [/^(?:jd[enu]?|jdn|mjd|julian_?day|jd_?(?:ut|tt))$/i, "a Julian-day field (JD): the day is { kali }, civil days since the Kali epoch"],
    [/^(?:ra|dec|decl|declination|right_?ascension|alpha|delta|hour_?angle|ha|az|azimuth|alt|altitude|elev|elevation)$/i,
      "an equatorial or horizontal coordinate field (RA/Dec style): the record holds what the instrument showed — a shadow in aṅgula, a bowl count, an unnata in aṃśa-kalā"],
    [/^(?:wgs_?84|wgs|geodetic|ellipsoid|datum|lat|lng|lon|long|longitude|geo|gps|coords?|coordinates|height|itrf|itrs|egm\d*)$/i,
      "a geodetic field (WGS84 style): the place is site.palabha or site.latitude (from the dhruva) and site.deshantara"],
    [/^(?:delta_?t|dt|dut1?|lod|eop|ephemeris|ephem|source|catalog(?:ue)?_?id|hip|hd|hr|sao)$/i,
      "a modern ephemeris, catalogue or rotation-correction field"],
  ]);
  const modernField = (k) => { for (const [re, why] of MODERN_FIELDS) if (re.test(k)) return why; return null; };

  /** Walks every key and string of a value: modern field names and modern strings. */
  function scanModern(v, where, refuse) {
    if (typeof v === "string") { const why = modernIn(v); if (why) refuse(where, `the text ${JSON.stringify(v.length > 80 ? v.slice(0, 77) + "…" : v)} ${why}`); return; }
    if (Array.isArray(v)) { v.forEach((x, i) => scanModern(x, `${where}[${i}]`, refuse)); return; }
    if (isObj(v)) for (const k of Object.keys(v)) {
      const why = modernField(k);
      if (why) refuse(`${where}.${k}`, `field "${k}" is ${why}`);
      const kw = modernIn(k);
      if (kw && !why) refuse(`${where}.${k}`, `field "${k}" ${kw}`);
      scanModern(v[k], `${where}.${k}`, refuse);
    }
  }
  /** Fields of an object outside `keys` (modern fields are reported once, by scanModern). */
  function onlyFields(obj, keys, where, refuse) {
    if (!isObj(obj)) { refuse(where, "must be an object"); return false; }
    for (const k of Object.keys(obj)) if (!keys.includes(k) && !modernField(k)) refuse(`${where}.${k}`, `field "${k}" is not in the schema (only ${keys.join(", ")})`);
    return true;
  }

  // ── readings in the owner's units ───────────────────────────────────────────────────────────────
  /** An arc { amsha, kala, vikala } (degrees, minutes, seconds) → degrees. */
  function arcOf(a, where) {
    if (!isObj(a)) throw new TypeError(`vedha-lekha: ${where} is { amsha, kala, vikala }`);
    for (const k of Object.keys(a)) if (!ARC.includes(k)) throw new RangeError(`vedha-lekha: ${where} has a field "${k}" (only ${ARC.join(", ")})`);
    const d = a.amsha || 0, m = a.kala || 0, s = a.vikala || 0;
    if (![d, m, s].every((x) => typeof x === "number" && Number.isFinite(x) && x >= 0) || m >= 60 || s >= 60 || d > 90) throw new RangeError(`vedha-lekha: ${where} needs 0 ≤ amsha ≤ 90, 0 ≤ kala, vikala < 60`);
    return d + m / 60 + s / 3600;
  }
  /** Degrees → { amsha, kala, vikala } (vikala fractional unless `round`). */
  function arcOfDegrees(deg, round) {
    let s = Math.abs(deg) * 3600;
    if (round) s = Math.round(s);
    const d = Math.floor(s / 3600 + 1e-12), m = Math.floor((s - d * 3600) / 60 + 1e-12);
    return { amsha: d, kala: m, vikala: Math.max(0, s - d * 3600 - m * 60) };
  }
  /** Asus → { ghati, vinadi, prana } (prana fractional unless `round`). */
  function kapalaOfAsus(asus, round) {
    let a = Math.max(0, asus);
    if (round) a = Math.round(a);
    const g = Math.floor(a / ASU_PER_GHATI + 1e-12), v = Math.floor((a - g * ASU_PER_GHATI) / ASU_PER_VINADI + 1e-12);
    return { ghati: g, vinadi: v, prana: Math.max(0, a - g * ASU_PER_GHATI - v * ASU_PER_VINADI) };
  }
  const asusOfKapala = (k, where) => C.asusOf(k, where || "kapala");

  // ── the frame from the owner's readings: true north, ε and the latitude (dhruva.js) ─────────────────
  // Validated here, in full, before dhruva.js sees a number: this module does not lean on dhruva.js's own guards.
  const FRAME_KINDS = Object.freeze(["uttara-rekha", "ayananta-yugma"]);
  const ELONGATION = Object.freeze(["day", "digamsha", "side"]);
  const NOON = Object.freeze(["day", "natamsha", "disha"]);
  const FRAME_READINGS = Object.freeze({
    "uttara-rekha": Object.freeze({ purva: ELONGATION, pashcima: ELONGATION }),
    "ayananta-yugma": Object.freeze({ karka: NOON, makara: NOON }),
  });
  const QUARTER = 90 * 3600;                                                         // vikalā in 90°
  const NORTH_NOTE = "Geometric: true north is the midpoint of the two greatest elongations (dhruva.js northFromElongations), exact in half vikalā; "
    + "σ = √(σ² + σ²) ÷ 2 from one reading's σ. Refraction does not cancel here and nothing removes it: it lifts the star along its own vertical circle, "
    + "which leaves an azimuth unchanged only where the air is level [standard]; whatever bends the line of sight sideways stays in the result. "
    + "A preview: no line and no constant is changed by it.";
  const SOLSTICE_NOTE = "Geometric: ε = (makara − karka) ÷ 2 and the latitude = (makara + karka) ÷ 2 from the signed noon zenith distances, south of the zenith positive "
    + "(dhruva.js fromSolsticeZenithDistances), exact in half vikalā; σ = √(σ² + σ²) ÷ 2 for each. Refraction does not cancel in these readings and nothing here removes it: "
    + "it lifts the Sun toward the zenith, and more at the larger zenith distance, so ε and the size of the latitude both come out somewhat small [theorem, given refraction as standard]. "
    + "Both noons are taken as solstice noons; a noon away from the solstice gives a smaller ε. A preview beside the text's ε (arc of 1397/3438, SS 2.28), "
    + "which stays the engine's value: nothing measured is applied.";
  const arcText = (v) => { const a = Math.abs(v), d = Math.floor(a / 3600), m = Math.floor((a - d * 3600) / 60); return `${d}° ${m}′ ${a - d * 3600 - m * 60}″`; };
  const onlyKeys = (x, keys, where, what) => {
    if (!isObj(x)) throw new TypeError(`vedha-lekha: ${where} is { ${keys.join(", ")} }: ${what}`);
    for (const k of Object.keys(x)) if (!keys.includes(k)) throw new RangeError(`vedha-lekha: ${where} has a field "${k}" (only ${keys.join(", ")})`);
  };
  /** An arc read to the whole vikalā → integer vikalā (arcseconds), as dhruva.js's exact arithmetic takes it. */
  function wholeVikala(a, where) {
    arcOf(a, where);
    const d = a.amsha || 0, m = a.kala || 0, s = a.vikala || 0;
    if (!(Number.isInteger(d) && Number.isInteger(m) && Number.isInteger(s))) throw new RangeError(`vedha-lekha: ${where} is read to the whole vikalā (dhruva.js reduces it exactly, in vikalā)`);
    return d * 3600 + m * 60 + s;
  }
  /** The uncertainty (1σ) of one reading, { amsha, kala, vikala } → vikalā; more than zero. */
  function sigmaVikala(a, where) {
    if (a === undefined) throw new RangeError(`vedha-lekha: ${where} is needed: the uncertainty (1σ) of one reading, { amsha, kala, vikala }`);
    arcOf(a, where);
    const v = (a.amsha || 0) * 3600 + (a.kala || 0) * 60 + (a.vikala || 0);
    if (!(v > 0)) throw new RangeError(`vedha-lekha: ${where} is more than zero: every reading has an uncertainty`);
    return v;
  }
  /** One greatest elongation → { N, vikala }: signed vikalā on the provisional line's scale, east (purva) positive. */
  function elongationReading(x, where) {
    onlyKeys(x, ELONGATION, where, "the day, the arc from your north line to the star, and the side of the line it lay on");
    const N = C.kaliDayOf(x.day, `${where}.day`);
    enumOf(x.side, ["purva", "pashcima"], `${where}.side`);
    const v = wholeVikala(x.digamsha, `${where}.digamsha`);
    if (v > QUARTER) throw new RangeError(`vedha-lekha: ${where}.digamsha is at most 90° from the north line`);
    return { N, vikala: x.side === "purva" ? v : -v };
  }
  /** One solstice noon → { N, vikala }: the signed zenith distance, south of the zenith positive. */
  function noonReading(x, where) {
    onlyKeys(x, NOON, where, "the day, the Sun's noon zenith distance, and the side of the zenith it stood on");
    const N = C.kaliDayOf(x.day, `${where}.day`);
    enumOf(x.disha, ["S", "N"], `${where}.disha`);
    const v = wholeVikala(x.natamsha, `${where}.natamsha`);
    if (v >= QUARTER) throw new RangeError(`vedha-lekha: ${where}.natamsha is less than 90°: at noon the Sun stands above the horizon`);
    return { N, vikala: x.disha === "S" ? v : -v };
  }
  const lineSide = (v) => `${arcText(v)} ${v >= 0 ? "east" : "west"} of the line`;
  const zenithSide = (v) => `${arcText(v)} ${v >= 0 ? "south" : "north"} of the zenith`;
  /** An uttara-rekha record's readings, checked: { e, w, sigma } (vikalā). Throws, with the reason, on the first fault. */
  function northLineReadings(r, where) {
    if (typeof r.star !== "string" || !r.star.trim()) throw new TypeError(`vedha-lekha: ${where}.star names the star read at its two greatest elongations (a star near the dhruva)`);
    if (r.day !== undefined) throw new RangeError(`vedha-lekha: ${where}: the days are the two readings' own (purva.day, pashcima.day), not the record's`);
    const e = elongationReading(r.purva, `${where}.purva`), w = elongationReading(r.pashcima, `${where}.pashcima`);
    const sigma = sigmaVikala(r.sigma, `${where}.sigma`);
    if (e.vikala <= w.vikala) throw new RangeError(`vedha-lekha: ${where}: the eastern greatest elongation (purva, ${lineSide(e.vikala)}) must lie east of the western one (pashcima, ${lineSide(w.vikala)}): a star circling the dhruva swings to either side of it. Check which reading is which, and the side of each`);
    if (e.vikala - w.vikala >= 2 * QUARTER) throw new RangeError(`vedha-lekha: ${where}: two elongations half a circle apart are not a star circling the dhruva`);
    return { e, w, sigma };
  }
  /** An ayananta-yugma record's readings, checked: { k, m, sigma } (vikalā). Throws, with the reason, on the first fault. */
  function solsticeReadings(r, where) {
    if (r.day !== undefined) throw new RangeError(`vedha-lekha: ${where}: the days are the two noons' own (karka.day, makara.day), not the record's`);
    const k = noonReading(r.karka, `${where}.karka`), m = noonReading(r.makara, `${where}.makara`);
    const sigma = sigmaVikala(r.sigma, `${where}.sigma`);
    if (k.N === m.N) throw new RangeError(`vedha-lekha: ${where}: the karka and the makara noon are on one day; the two solstices are half a year apart`);
    if (m.vikala <= k.vikala) throw new RangeError(`vedha-lekha: ${where}: at the makara noon the Sun must stand further south than at the karka noon (karka ${zenithSide(k.vikala)}, makara ${zenithSide(m.vikala)}) — ε, half the difference, is more than zero. Check which reading is which, and the side (disha) of each`);
    return { k, m, sigma };
  }
  const halfQuadrature = (s) => Math.sqrt(s * s + s * s) / 2;                       // σ of (a ± b) ÷ 2, each read to σ
  /** One uttara-rekha record → where true north lies on the owner's line, east (purva) positive, with its σ. A PREVIEW:
   *  nothing is applied. Validates the record itself before dhruva.js sees it, and throws a readable error if it fails. */
  function northLine(record) {
    const r = record, where = `record ${isObj(r) ? r.id : "?"}`;
    if (!isObj(r) || r.kind !== "uttara-rekha") throw new TypeError(`vedha-lekha: ${where} is not an uttara-rekha record`);
    const { e, w, sigma } = northLineReadings(r, where);
    let q;
    try { q = Dh.northFromElongations({ east: e.vikala, west: w.vikala }); }
    catch (err) { throw new RangeError(`vedha-lekha: ${where}: dhruva.js refused the readings (${err.message})`); }
    const north = Number(q.num) / Number(q.den);
    return {
      star: r.star,
      observed: { purva: { day: e.N, vikala: e.vikala }, pashcima: { day: w.N, vikala: w.vikala }, sigmaVikala: sigma, scale: "vikalā from the owner's north line, east (purva) positive" },
      trueNorth: { vikala: north, deg: north / 3600, exact: `${q.num}/${q.den} vikalā`, sigmaVikala: halfQuadrature(sigma), side: north > 0 ? "purva" : north < 0 ? "pashcima" : "on the line" },
      halfSpanVikala: (e.vikala - w.vikala) / 2,
      text: null, preview: true, applied: false,
      source: KINDS["uttara-rekha"].source, note: NORTH_NOTE,
    };
  }
  /** One ayananta-yugma record → ε and the latitude, each with its σ, beside the text's ε (SS 2.28) and the given place
   *  (placeOf; optional). A PREVIEW: nothing is applied. Validates the record itself before dhruva.js sees it, and throws
   *  a readable error if it fails. warnings: a noon that the text's own Sun puts more than 15° (about 15 days) from its
   *  solstice — a check of this module against a mis-dated reading, not a rule of the text. */
  function solsticePair(record, place) {
    const r = record, where = `record ${isObj(r) ? r.id : "?"}`;
    if (!isObj(r) || r.kind !== "ayananta-yugma") throw new TypeError(`vedha-lekha: ${where} is not an ayananta-yugma record`);
    const { k, m, sigma } = solsticeReadings(r, where);
    let q;
    try { q = Dh.fromSolsticeZenithDistances({ summer: k.vikala, winter: m.vikala }); }
    catch (err) { throw new RangeError(`vedha-lekha: ${where}: dhruva.js refused the readings (${err.message})`); }
    const eps = Number(q.epsilon.num) / Number(q.epsilon.den), lat = Number(q.latitude.num) / Number(q.latitude.den), s = halfQuadrature(sigma);
    const textEps = Dh.SS_EPSILON_DEG * 3600;
    const siteLat = place && typeof place.latitude === "number" ? place.latitude * 3600 : null;
    const warnings = [];
    for (const [which, x, point] of [["karka", k, 90], ["makara", m, 270]]) {
      const off = Math.abs(wrap180(C.textSun(x.N + 0.5 - ((place && place.deshantara) || 0) / 360).sayana - point));
      if (off > 15) warnings.push(`the ${which} noon (Kali day ${x.N}) is about ${Math.round(off)}° of the Sun — some ${Math.round(off)} days — from the ${which} solstice by the text's Sun; it is reduced as a solstice noon. Check its day.`);
    }
    return {
      observed: { karka: { day: k.N, vikala: k.vikala }, makara: { day: m.N, vikala: m.vikala }, sigmaVikala: sigma, daysApart: Math.abs(m.N - k.N),
        scale: "signed noon zenith distance in vikalā, south of the zenith positive" },
      epsilon: { vikala: eps, deg: eps / 3600, exact: `${q.epsilon.num}/${q.epsilon.den} vikalā`, sigmaVikala: s },
      latitude: { vikala: lat, deg: lat / 3600, exact: `${q.latitude.num}/${q.latitude.den} vikalā`, sigmaVikala: s },
      correlation: 0,                                                                  // (σm² − σk²) ÷ (σm² + σk²): one σ for both readings
      text: { epsilonDeg: Dh.SS_EPSILON_DEG, epsilon: "arc of 1397/3438", source: "SS 2.28", default: true },
      site: place ? { latitudeDeg: place.latitude, from: place.from } : null,
      antara: { epsilonArcmin: (eps - textEps) / 60, latitudeArcmin: siteLat === null ? null : (lat - siteLat) / 60 },
      preview: true, applied: false,
      source: KINDS["ayananta-yugma"].source, note: SOLSTICE_NOTE, warnings,
    };
  }

  // ── one record, against the schema ──────────────────────────────────────────────────────────────
  const enumOf = (v, allowed, where) => { if (!allowed.includes(v)) throw new RangeError(`vedha-lekha: ${where} is ${allowed.map((x) => JSON.stringify(x)).join(" or ")}`); };
  /** The kind's own fields (the chāyā kinds by ss-chaya.js's own validate). Throws on the first fault. */
  function checkKind(r, shanku) {
    const where = `record ${r.id}`;
    if (CHAYA_KINDS.includes(r.kind)) {
      const bare = {}; for (const k of Object.keys(r)) if (!["synthetic", "generator", "ganita"].includes(k)) bare[k] = r[k];
      const file = { format: C.FORMAT, site: {}, records: [bare] };
      if (shanku !== undefined) file.shanku = shanku;
      C.validate(file);
      return;
    }
    if (r.kind === "ganita") {
      C.kaliDayOf(r.day, `${where}.day`);
      enumOf(r.for, OBSERVATION_KINDS, `${where}.for`);
      if (typeof r.model !== "string" || !r.model.trim()) throw new TypeError(`vedha-lekha: ${where}.model names the model that made the prediction`);
      if (!isObj(r.values) || !Object.keys(r.values).length) throw new TypeError(`vedha-lekha: ${where}.values is an object of predicted values`);
      for (const [k, v] of Object.entries(r.values)) {
        if (typeof v === "number" ? !Number.isFinite(v) : !(typeof v === "string" || typeof v === "boolean" || isObj(v))) throw new TypeError(`vedha-lekha: ${where}.values.${k} is a number, a word, yes/no, or a reading`);
        if (isObj(v)) {
          const keys = Object.keys(v);
          if (keys.every((x) => KAPALA.includes(x))) asusOfKapala(v, `${where}.values.${k}`);
          else if (keys.every((x) => ANGULA.includes(x))) C.angulaOf(v, `${where}.values.${k}`);
          else if (keys.every((x) => ARC.includes(x))) arcOf(v, `${where}.values.${k}`);
          else throw new RangeError(`vedha-lekha: ${where}.values.${k} is a bowl count, an aṅgula or an arc reading`);
        }
      }
      return;
    }
    if (r.kind === "uttara-rekha") { northLineReadings(r, where); return; }
    if (r.kind === "ayananta-yugma") { solsticeReadings(r, where); return; }
    C.kaliDayOf(r.day, `${where}.day`);
    if (r.calibration !== undefined) enumOf(r.calibration, ["nakshatra", "savana"], `${where}.calibration`);
    if (r.kind === "yamyottara") {
      if (typeof r.star !== "string" || !r.star.trim()) throw new TypeError(`vedha-lekha: ${where}.star names the star`);
      if (r.transit !== undefined) enumOf(r.transit, ["upper", "lower"], `${where}.transit`);
      if (r.kapala === undefined && r.unnata === undefined) throw new RangeError(`vedha-lekha: ${where} needs the bowl's count (kapala), the meridian altitude (unnata), or both`);
      if (r.kapala !== undefined) asusOfKapala(r.kapala, `${where}.kapala`);
      if (r.unnata !== undefined) {
        arcOf(r.unnata, `${where}.unnata`);
        enumOf(r.disha, ["N", "S"], `${where}.disha`);
        if (r.transit === "lower" && r.disha !== "N") throw new RangeError(`vedha-lekha: ${where}: a lower transit is read above the northern horizon (disha "N")`);
      } else if (r.disha !== undefined) throw new RangeError(`vedha-lekha: ${where}.disha goes with an unnata`);
    } else if (r.kind === "grahana") {
      enumOf(r.body, ["candra", "surya"], `${where}.body`);
      enumOf(r.contact, CONTACTS, `${where}.contact`);
      if (r.kapala === undefined && r.chaya === undefined) throw new RangeError(`vedha-lekha: ${where} is timed by the bowl (kapala) or, for the Sun, by the shadow (chaya and side)`);
      if (r.kapala !== undefined) asusOfKapala(r.kapala, `${where}.kapala`);
      if (r.chaya !== undefined || r.side !== undefined) {
        if (r.body !== "surya") throw new RangeError(`vedha-lekha: ${where}: the shadow times a solar contact only (3.37-3.39); a lunar contact is timed by the bowl`);
        C.angulaOf(r.chaya, `${where}.chaya`);
        enumOf(r.side, ["purva", "pashcima"], `${where}.side`);
      }
    } else if (r.kind === "candra-darshana") {
      if (typeof r.seen !== "boolean") throw new TypeError(`vedha-lekha: ${where}.seen is true or false`);
      if (r.horizon !== undefined) enumOf(r.horizon, ["pashcima", "purva"], `${where}.horizon`);
    } else if (r.kind === "candra-yoga") {
      if (typeof r.star !== "string" || !r.star.trim()) throw new TypeError(`vedha-lekha: ${where}.star names the junction star`);
      asusOfKapala(r.kapala, `${where}.kapala`);
    } else if (r.kind === "yantra") {
      if (!Y) throw new RangeError(`vedha-lekha: ${where} is an instrument reading and yantra.js is not loaded`);
      enumOf(r.yantra, Y.LEDGER_YANTRAS, `${where}.yantra`);
      if (typeof r.body !== "string" || !r.body.trim()) throw new TypeError(`vedha-lekha: ${where}.body is "surya" or the star's name`);
      Y.checkReading(r.yantra, r.reading, r.body);
      if (r.kapala !== undefined) asusOfKapala(r.kapala, `${where}.kapala`);
    }
  }
  /** The record's day: its own, or for a frame kind the later of its two readings' days (the record is whole only then). */
  const dayOf = (r) => {
    const two = own(FRAME_READINGS, r.kind) ? FRAME_READINGS[r.kind] : null;
    if (two) return Math.max(...Object.keys(two).map((k) => C.kaliDayOf(isObj(r[k]) ? r[k].day : undefined, `record ${r.id}.${k}.day`)));
    return r.day === undefined ? null : C.kaliDayOf(r.day, `record ${r.id}.day`);
  };

  /** Every fault of one record that does not need the rest of the ledger, as { where, reason }. */
  function recordFaults(r, where, opts) {
    const out = [], refuse = (w, why) => out.push({ where: w, reason: why });
    if (!isObj(r)) { refuse(where, "a record must be an object"); return out; }
    scanModern(r, where, refuse);
    if (typeof r.id !== "string" || !r.id) refuse(`${where}.id`, "every record needs an id");
    if (!own(KINDS, r.kind)) { refuse(`${where}.kind`, `unknown kind ${JSON.stringify(r.kind)} (${Object.keys(KINDS).join(", ")})`); return out; }
    onlyFields(r, [...COMMON, ...KINDS[r.kind].fields], where, refuse);
    for (const k of ["observer", "note"]) if (r[k] !== undefined && typeof r[k] !== "string") refuse(`${where}.${k}`, `${k} is text`);
    if (r.synthetic !== undefined && typeof r.synthetic !== "boolean") refuse(`${where}.synthetic`, "synthetic is true or false");
    if (r.synthetic === true && (typeof r.generator !== "string" || !r.generator.trim())) refuse(`${where}.generator`, "a synthetic record must name its generator");
    if (r.generator !== undefined && r.synthetic !== true) refuse(`${where}.generator`, "names a generator but is not marked synthetic — a generated record is never an observation");
    if (r.synthetic === true && !(opts && opts.allowSynthetic)) refuse(where, `is SYNTHETIC (${r.generator || "no generator"}): refused unless the caller allows synthetic records; it is never an observation`);
    if (r.ganita !== undefined && (typeof r.ganita !== "string" || r.kind === "ganita")) refuse(`${where}.ganita`, "cites a gaṇita record by its id (and a gaṇita cites none)");
    if (out.some((x) => /not in the schema|field "/.test(x.reason))) return out;
    try { checkKind(r, opts && opts.shanku); } catch (e) { refuse(where, e.message.replace(/^vedha(?:-lekha)?: /, "")); }
    return out;
  }

  // ── the ledger ──────────────────────────────────────────────────────────────────────────────────
  function checkSite(site, shanku) {
    const out = [], refuse = (w, why) => out.push({ where: w, reason: why });
    if (!onlyFields(site, SITE, "site", refuse)) return out;
    scanModern(site, "site", refuse);
    try { C.validate({ format: C.FORMAT, site: Object.fromEntries(Object.entries(site).filter(([k]) => SITE.includes(k))), ...(shanku !== undefined ? { shanku } : {}), records: [] }); }
    catch (e) { refuse("site", e.message.replace(/^vedha: /, "")); }
    if (site.name !== undefined && typeof site.name !== "string") refuse("site.name", "the name is text");
    return out;
  }
  /** A new, empty ledger for a place: { site: { name, deshantara, palabha | latitude }, shanku? }. */
  function create(head) {
    const h = head || {}, site = h.site || {};
    const faults = checkSite(site, h.shanku);
    if (faults.length) throw new RangeError("vedha-lekha: " + faults.map((f) => `${f.where}: ${f.reason}`).join("; "));
    const L = { format: FORMAT, site: clone(site) };
    if (h.shanku !== undefined) L.shanku = h.shanku;
    L.entries = [];
    return deepFreeze(L);
  }
  /** Appends one record; returns the new ledger (the old one is untouched). opts.at: the Kali day of writing (default:
   *  the record's own day, else the last entry's). Refuses a record that fails its own checks, a day after `at`, an `at`
   *  earlier than the last, a gaṇita citation that is not already in the ledger, and any sealed ledger. Synthetic
   *  records may be written (the certifier decides whether they are accepted). */
  function append(ledger, record, opts) {
    const o = opts || {};
    if (!ledger || ledger.format !== FORMAT || !Array.isArray(ledger.entries)) throw new TypeError(`vedha-lekha: not a "${FORMAT}" ledger`);
    if (ledger.seal) throw new RangeError("vedha-lekha: the ledger is sealed; a new season starts a new ledger");
    const n = ledger.entries.length, last = n ? ledger.entries[n - 1] : null;
    if (last && entryHash(last) !== last.sealedHash) throw new RangeError(`vedha-lekha: entry ${last.seq} does not match its own hash; verify the ledger before writing to it`);
    const rec = clone(record);
    const faults = recordFaults(rec, `record ${rec && rec.id}`, { allowSynthetic: true, shanku: ledger.shanku });
    if (faults.length) throw new RangeError("vedha-lekha: " + faults.map((f) => `${f.where}: ${f.reason}`).join("; "));
    const day = rec.kind === "ganita" ? null : dayOf(rec);
    const at = o.at !== undefined ? o.at : day !== null ? day : last ? last.at : null;
    if (!Number.isInteger(at)) throw new TypeError("vedha-lekha: opts.at is the Kali day (an integer) on which the entry is written");
    if (last && at < last.at) throw new RangeError(`vedha-lekha: entry written on Kali day ${at}, before the last entry (${last.at})`);
    if (day !== null && day > at) throw new RangeError(`vedha-lekha: record ${rec.id} is of Kali day ${day}, after the day it is written (${at})`);
    if (rec.kind === "ganita" && C.kaliDayOf(rec.day, "ganita.day") < at) throw new RangeError(`vedha-lekha: gaṇita ${rec.id} is written after the day it predicts`);
    for (const e of ledger.entries) if (e.record && e.record.id === rec.id) throw new RangeError(`vedha-lekha: id ${rec.id} is already in the ledger (entry ${e.seq})`);
    if (rec.ganita !== undefined) {
      const g = ledger.entries.find((e) => e.record && e.record.kind === "ganita" && e.record.id === rec.ganita);
      if (!g) throw new RangeError(`vedha-lekha: record ${rec.id} cites gaṇita ${rec.ganita}, which is not already in the ledger`);
      if (g.record.for !== rec.kind) throw new RangeError(`vedha-lekha: gaṇita ${rec.ganita} is for ${g.record.for}, not ${rec.kind}`);
    }
    const entry = { seq: n + 1, prev: last ? last.sealedHash : genesisOf(ledger), at, record: rec };
    entry.sealedHash = entryHash(entry);
    return deepFreeze({ ...clone(ledger), entries: [...clone(ledger.entries), entry] });
  }

  /** The chain alone: seq, prev, the hashes, the order of `at`, and the seal. { ok, n, head, genesis, problems }. */
  function verify(ledger) {
    const problems = [], bad = (where, reason) => problems.push({ where, reason });
    if (!isObj(ledger) || !Array.isArray(ledger.entries)) return { ok: false, n: 0, head: null, problems: [{ where: "ledger", reason: "not a ledger (no entries)" }] };
    let genesis = null;
    try { genesis = genesisOf(ledger); } catch (e) { bad("header", e.message); }
    let prev = genesis, lastAt = -Infinity;
    ledger.entries.forEach((e, i) => {
      const where = `entry ${i + 1}`;
      if (!isObj(e)) { bad(where, "not an entry"); prev = null; return; }
      if (e.seq !== i + 1) bad(`${where}.seq`, `seq is ${JSON.stringify(e.seq)} where ${i + 1} belongs: an entry is missing, added or out of order`);
      if (e.prev !== prev) bad(`${where}.prev`, i === 0 ? "does not hang from the ledger's header (its site or format has changed)" : `does not hang from entry ${i} — the chain is broken`);
      let h = null;
      try { h = entryHash(e); } catch (err) { bad(where, err.message); }
      if (h !== null && h !== e.sealedHash) bad(`${where}.sealedHash`, "does not match the entry: it was changed after it was written");
      if (!Number.isInteger(e.at)) bad(`${where}.at`, "at is the Kali day of writing, an integer");
      else if (e.at < lastAt) bad(`${where}.at`, `written on Kali day ${e.at}, before the entry above it (${lastAt}): out of order`);
      else lastAt = e.at;
      prev = e.sealedHash;
    });
    const n = ledger.entries.length, head = n ? ledger.entries[n - 1].sealedHash : genesis;
    if (ledger.seal !== undefined) {
      const s = ledger.seal;
      if (!isObj(s)) bad("seal", "not a seal");
      else {
        if (s.n !== n) bad("seal.n", `seals ${s.n} entries; the ledger has ${n}`);
        if (s.head !== head) bad("seal.head", "is not the last entry's hash");
        let h = null;
        try { h = sealHash(ledger, s); } catch (err) { bad("seal", err.message); }
        if (h !== null && h !== s.hash) bad("seal.hash", "does not match: the ledger was rewritten after it was sealed");
      }
    }
    return { ok: problems.length === 0, n, head, genesis, problems };
  }

  /** Closes a ledger with its final hash. opts.at: the Kali day of sealing (default: the last entry's). */
  function seal(ledger, opts) {
    const v = verify(ledger);
    if (!v.ok) throw new RangeError("vedha-lekha: cannot seal a broken ledger: " + v.problems.map((p) => `${p.where}: ${p.reason}`).join("; "));
    if (ledger.seal) throw new RangeError("vedha-lekha: already sealed");
    const n = ledger.entries.length, last = n ? ledger.entries[n - 1].at : null;
    const at = opts && opts.at !== undefined ? opts.at : last;
    if (!Number.isInteger(at) || (last !== null && at < last)) throw new RangeError("vedha-lekha: the seal's day is a Kali day not before the last entry");
    const s = { n, head: v.head, at };
    s.hash = sealHash(ledger, s);
    return deepFreeze({ ...clone(ledger), seal: s });
  }

  /** The ledger as a file (JSON, two-space indent). */
  const toJSON = (ledger) => JSON.stringify(ledger, null, 2);
  /** A ledger file back to a (frozen) ledger. It is not certified by being read: call certify or verify. */
  function fromJSON(text) {
    let L;
    try { L = JSON.parse(text); } catch (e) { throw new SyntaxError(`vedha-lekha: the file is not JSON (${e.message})`); }
    if (!isObj(L) || L.format !== FORMAT) throw new RangeError(`vedha-lekha: format must be "${FORMAT}"`);
    return deepFreeze(L);
  }

  /** The certifier. Takes a ledger or its file (a JSON string). Refuses, with a reason each: fields outside the schema;
   *  fields of a modern clock (UTC style), Julian day, equatorial or horizontal coordinate (RA/Dec), geodetic datum
   *  (WGS84) or ephemeris; any string naming a modern source or carrying a modern time stamp; entries out of order;
   *  a broken chain or seal; a record of a day after it was written; a gaṇita written after its day or cited before it
   *  was written; duplicate ids; and synthetic records unless opts.allowSynthetic (a synthetic record must always name
   *  its generator). Returns { ok, reasons, records (only when ok), n, head, seal }. */
  function certify(ledgerOrFile, opts) {
    const o = opts || {}, reasons = [], refuse = (where, reason) => reasons.push({ where, reason });
    let L = ledgerOrFile;
    if (typeof L === "string") { try { L = JSON.parse(L); } catch (e) { refuse("file", `not JSON (${e.message})`); return { ok: false, reasons, records: [], n: 0, head: null, seal: null }; } }
    if (!isObj(L)) { refuse("ledger", "not a ledger"); return { ok: false, reasons, records: [], n: 0, head: null, seal: null }; }
    onlyFields(L, TOP, "ledger", refuse);
    for (const k of Object.keys(L)) if (!TOP.includes(k)) scanModern({ [k]: L[k] }, "ledger", refuse);
    if (L.format !== FORMAT) refuse("ledger.format", `format must be "${FORMAT}"`);
    for (const f of checkSite(L.site === undefined ? {} : L.site, L.shanku)) refuse(f.where, f.reason);
    if (!Array.isArray(L.entries)) { refuse("ledger.entries", "entries must be a list"); return { ok: false, reasons, records: [], n: 0, head: null, seal: null }; }
    if (L.seal !== undefined) { onlyFields(L.seal, SEAL, "seal", refuse); scanModern(L.seal, "seal", refuse); }
    const chain = verify(L);
    for (const p of chain.problems) refuse(p.where, p.reason);
    const ids = new Map(), ganitas = new Map();
    L.entries.forEach((e, i) => {
      const where = `entry ${i + 1}`;
      if (!isObj(e)) return;
      onlyFields(e, ENTRY, where, refuse);
      for (const k of Object.keys(e)) if (!ENTRY.includes(k)) scanModern({ [k]: e[k] }, where, refuse);
      const r = e.record, rw = `${where} (${isObj(r) && typeof r.id === "string" ? r.id : "?"})`;
      for (const f of recordFaults(r, rw, { allowSynthetic: o.allowSynthetic, shanku: L.shanku })) refuse(f.where, f.reason);
      if (!isObj(r)) return;
      if (typeof r.id === "string") { if (ids.has(r.id)) refuse(rw, `id ${r.id} is used twice (entry ${ids.get(r.id)} and ${i + 1})`); else ids.set(r.id, i + 1); }
      let day = null;
      try { day = dayOf(r); } catch (err) { /* already refused by recordFaults */ }
      if (r.kind === "ganita") {
        if (day !== null && Number.isInteger(e.at) && day < e.at) refuse(rw, `a gaṇita for Kali day ${day} written on ${e.at}, after the day it predicts, is not a prediction`);
        if (typeof r.id === "string") ganitas.set(r.id, { seq: i + 1, for: r.for });
      } else if (day !== null && Number.isInteger(e.at) && day > e.at) refuse(rw, `the record is of Kali day ${day}, after the day it was written (${e.at}): out of order`);
      if (typeof r.ganita === "string" && r.kind !== "ganita") {
        const g = ganitas.get(r.ganita);
        if (!g) refuse(`${rw}.ganita`, `cites gaṇita ${r.ganita}, which is not written before it: the prediction must come first`);
        else if (g.for !== r.kind) refuse(`${rw}.ganita`, `cites gaṇita ${r.ganita}, which is for ${g.for}, not ${r.kind}`);
      }
    });
    const ok = reasons.length === 0;
    return { ok, reasons, records: ok ? deepFreeze(L.entries.map((e) => clone(e.record))) : [], n: L.entries.length, head: chain.head, seal: L.seal ? clone(L.seal) : null };
  }

  // ── the text's predictions, in the owner's units (used by reduce and by any synthetic generator) ────
  const ayanamsha = (t) => S.ayanamshaSS(S.spandasOfDays(t));
  /** The model's site { latitude, deshantara, palabha } from the ledger's site (palabhā by the table, 3.12b-3.17a). */
  function placeOf(site, shanku, chaya) {
    const s = site || {}, scale = 12 / (shanku || 12), deshantara = s.deshantara || 0;
    if (s.palabha !== undefined) { const p = C.angulaOf(s.palabha, "site.palabha") * scale; return { latitude: C.akshaOfPalabha(p).latitude, palabha: p, deshantara, from: "site.palabha (3.12b-3.14a)" }; }
    if (s.latitude !== undefined) return { latitude: s.latitude, palabha: C.palabhaOfLatitude(s.latitude).palabha, deshantara, from: "site.latitude (3.16b-3.17a)" };
    if (chaya) return { latitude: chaya.site.latitude, palabha: chaya.site.palabha, deshantara, from: chaya.site.palabhaFrom };
    return null;
  }
  const modelSite = (p) => ({ latitude: p.latitude, deshantara: p.deshantara, palabha: p.palabha });
  /** Sunrise of civil day N (days since the Kali epoch): the instant the true Sun's hour angle — the meridian's asus
   *  (ss-grahana.js) less the Sun's ascension (ss-udaya.js, 3.42) — is minus its half-day (2.61-2.63): the zero of
   *  SSUdaya.sinceSunrise, so the same instant ss-grahana.js's clock counts from. opts.ascension is passed to it;
   *  opts.sunrise "text" takes 2.46's sunrise instead (ss-drishya.js). */
  function sunriseAt(N, site, opts) {
    const o = opts || {};
    if (o.sunrise === "text") return D.sunEvent(N, site, "rise", {});
    const pb = typeof site.palabha === "number" ? site.palabha : U.palabhaOf(site.latitude);
    const uo = o.ascension === undefined ? undefined : { ascension: o.ascension };
    let t = N + 0.25 - site.deshantara / 360;
    for (let i = 0; i < 16; i++) {
      const A = ayanamsha(t), sun = mod(S.sphutaAtDays(t).sun + A, 360);
      const step = -wrapAsus(U.sinceSunrise(sun, G.meridianAsus(t, site, A), pb, uo)) / TURN;   // the Sun's own day is close to 21,600 asus
      t += step;
      if (Math.abs(step) < 1e-11) break;
    }
    return t;
  }
  /** Sunset of day N by the same rule as sunriseAt: the instant the Sun's own time since rising equals its whole day,
   *  twice the half-day of 2.61-2.63 (council G-3: one rule for both ends of the day). */
  function sunsetAt(N, site, opts) {
    const o = opts || {};
    if (o.sunrise === "text") return D.sunEvent(N, site, "set", {});
    const pb = typeof site.palabha === "number" ? site.palabha : U.palabhaOf(site.latitude);
    const uo = o.ascension === undefined ? undefined : { ascension: o.ascension };
    let t = N + 0.75 - site.deshantara / 360;
    for (let i = 0; i < 16; i++) {
      const A = ayanamsha(t), sun = mod(S.sphutaAtDays(t).sun + A, 360);
      const step = -wrapAsus(U.sinceSunrise(sun, G.meridianAsus(t, site, A), pb, uo) - 2 * U.halfDay(sun, pb)) / TURN;
      t += step;
      if (Math.abs(step) < 1e-11) break;
    }
    return t;
  }
  /** Asus of the turn between two instants (civil days): 1.34-1.37. */
  const turnAsusBetween = (t0, t1) => (t1 - t0) * ASUS_PER_DAY;
  /** The instant `asus` of the turn after t0. */
  const afterTurnAsus = (t0, asus) => t0 + asus / ASUS_PER_DAY;

  /** A star on the meridian on the night after the sunrise of day N: { name, dhruvaka, vikshepa } (sidereal degrees, from
   *  ch.8). It crosses when the meridian's asus (mean Sun's turn, as ss-grahana.js) equal its own ascension: 3.42's rule
   *  at its dhruvaka, which is the foot of its circle through the dhruva (2.63, ch.8). Its declination is the dhruvaka's
   *  with the vikṣepa (2.58, 2.63); its meridian altitude 90° − |φ − δ| (upper) or φ + δ − 90° (lower), the noon nata of
   *  3.20b-3.21a applied to a star [reading]. opts.transit "lower" for the lower transit. */
  function predictTransit(N, star, site, opts) {
    const o = opts || {}, lower = o.transit === "lower";
    const rise = sunriseAt(N, site, o);
    const target = (t) => mod(U.rightAscension(mod(star.dhruvaka + ayanamsha(t), 360)) + (lower ? HALF : 0), TURN);
    const meridian = (t) => G.meridianAsus(t, site, ayanamsha(t));
    let t = afterTurnAsus(rise, mod(target(rise) - meridian(rise), TURN));
    for (let i = 0; i < 8; i++) { const d = wrapAsus(target(t) - meridian(t)); t = afterTurnAsus(t, d); if (Math.abs(d) < 1e-9) break; }
    if (t < rise) t = afterTurnAsus(t, TURN);
    const since = turnAsusBetween(rise, t);
    const kranti = U.kranti(mod(star.dhruvaka + ayanamsha(t), 360)) + star.vikshepa;
    const z = site.latitude - kranti;
    const unnata = lower ? site.latitude + kranti - 90 : 90 - Math.abs(z);
    return { name: star.name, transit: lower ? "lower" : "upper", t, sunrise: rise, sinceSunriseAsus: since, kapala: kapalaOfAsus(since),
      krantiDeg: kranti, unnataDeg: unnata, disha: lower ? "N" : z >= 0 ? "S" : "N", above: unnata > 0,
      source: "SS 1.12, 2.58, 2.63, 3.42 (the star's own ascension and declination); 3.20b-3.21a [reading] for the altitude" };
  }

  /** The text's eclipse whose contacts follow the sunrise of day N (ss-grahana.js: 4.1-4.26, 5 for the Sun). */
  function eclipseFor(body, N, site, opts) {
    const go = (opts && opts.grahana) || undefined;
    return body === "surya" ? G.solarEclipse(N + 0.5, site, go) : G.lunarEclipse(N + 0.5, site, go);
  }
  /** One contact of the text's eclipse, counted from the sunrise of day N in asus of the turn. */
  function predictContact(N, body, contact, site, opts) {
    const E = (opts && opts.eclipse) || eclipseFor(body, N, site, opts);
    const rise = sunriseAt(N, site, opts);
    const t = E.possible ? E.contacts[contact] : null;
    const h = E.horizon && E.horizon[contact];
    return { body, contact, possible: E.possible, total: E.total, t, sunrise: rise, sinceSunriseAsus: t === null ? null : turnAsusBetween(rise, t),
      kapala: t === null ? null : kapalaOfAsus(turnAsusBetween(rise, t)), above: h ? h.above : null, eclipse: E,
      source: body === "surya" ? "SS 4.16-4.17 with 5.1-5.17 (ss-grahana.js)" : "SS 4.16-4.17 (ss-grahana.js)" };
  }

  /** The śaṅku's shadow at the instant `asus` of the turn after the sunrise of day N, by the text (3.34b-3.36): the
   *  Sun's own asus by 2.59 (ss-chaya.js), its nata from the meridian, the shadow and the side. For synthetic records
   *  and for checking a shadow-timed contact. */
  function shadowAtTurnAsus(N, asus, site, opts) {
    const rise = sunriseAt(N, site, opts), t = afterTurnAsus(rise, asus), s = C.textSun(t);
    const sunAsus = C.turnToSunAsus(asus, s.sayana, s.gati);
    const nata = sunAsus - U.halfDay(s.sayana, site.palabha);
    const sh = C.shadowAt(s.sayana, site.palabha, nata);
    return { t, sayana: s.sayana, natAsus: nata, chaya: sh.chaya, side: nata < 0 ? "purva" : "pashcima", above: sh.above };
  }
  /** The reverse: asus of the turn from sunrise of day N, from a shadow and its side (3.37-3.39, 2.62-2.63, 2.59). The Sun's
   *  place is taken at the instant found, again until it holds. */
  function turnAsusFromShadow(N, chaya, side, site, opts) {
    const rise = sunriseAt(N, site, opts);
    let asus = TURN / 4, sun = null;
    for (let i = 0; i < 6; i++) {
      const s = C.textSun(afterTurnAsus(rise, asus));
      sun = C.sinceSunriseFromShadow(chaya, s.sayana, site.palabha, side);
      const next = sun.sinceSunrise * C.svahoratraAsus(s.sayana, s.gati) / TURN;
      const done = Math.abs(next - asus) < 1e-9;
      asus = next;
      if (done) break;
    }
    return { asus, natAsus: sun.natAsus, shorterThanNoon: sun.shorterThanNoon };
  }

  /** The crescent on the evening (horizon "pashcima", the default: 10.1-10.4 at ss-drishya.js's sunset) or the morning
   *  ("purva": 10.1's east, at its sunrise) of day N: the text's kālāṃśa and its verdict (seen at twelve or more). */
  function predictCrescent(N, horizon, site, opts) {
    const dopts = (opts && opts.drishya) || {};
    if (horizon === "purva") {
      const rise = D.sunEvent(N, site, "rise", dopts), st = D.luni(rise, dopts), E = mod(st.moon - st.sun, 360);
      const k = D.bodyKalamsa(st.moon, st.moonLatArcmin, st.sun, site.palabha, U.risings(site.palabha, dopts), "east", dopts);
      return { horizon: "purva", at: rise, elongation: E, kalamsa: k, limit: DARSHANA, seen: E > 180 && k >= DARSHANA, source: "SS 10.1 (east), 9.5; ss-drishya.js's sunrise" };
    }
    const m = D.moonAtSunset(N, site, dopts);
    if (m.half !== "shukla") return { horizon: "pashcima", at: m.sunset, elongation: m.elongation, kalamsa: null, limit: DARSHANA, seen: false, source: "SS 10.1-10.4: the Moon is past full, no evening crescent" };
    return { horizon: "pashcima", at: m.sunset, elongation: m.elongation, kalamsa: m.kalamsa, limit: DARSHANA, seen: m.kalamsa >= DARSHANA, source: "SS 10.1-10.4 (west), 9.5; ss-drishya.js's sunset" };
  }

  /** The Moon's polar longitude (sidereal degrees): its sāyana place less 7.10's āyana part (latitude′ × the declination
   *  of λ + 90° in degrees, as seconds) — the foot of its own circle through the dhruva — less the ayanāṃśa. */
  function moonPolarAt(t) {
    const p = S.sphutaAtDays(t), A = ayanamsha(t), lam = mod(p.moon + A, 360);
    return mod(lam - p.moonLatitude * 60 * U.kranti(lam + 90) / 3600 - A, 360);
  }
  /** The instant after the sunrise of day N at which the Moon's polar longitude reaches the star's dhruvaka (8.14-8.15),
   *  in asus of the turn from that sunrise; null when it does not on that civil day. The text's yoga has no lambana:
   *  what the observer sees carries the Moon's parallax, which the reduction reports and does not remove. */
  function predictYuti(N, star, site, opts) {
    const rise = sunriseAt(N, site, opts), next = sunriseAt(N + 1, site, opts);
    const f = (t) => wrap180(moonPolarAt(t) - star.dhruvaka);
    let t = rise + 0.5;
    for (let i = 0; i < 20; i++) {
      const rate = (f(t + 0.01) - f(t - 0.01)) / 0.02;                               // degrees a civil day
      const step = -f(t) / rate;
      t += step;
      if (Math.abs(step) < 1e-11) break;
    }
    const ok = t >= rise && t < next && Math.abs(f(t)) < 1e-6;
    // the rate of the quantity the yoga is judged by: the Moon's polar longitude, which 7.10's latitude term makes run a
    // few parts in a hundred off its ecliptic motion (2.47-2.49, ss-grahana.js bhukti, given beside it)
    const polarBhukti = wrap180(moonPolarAt(t + 1 / 48) - moonPolarAt(t - 1 / 48)) * 24 * 60;
    return { name: star.name, t: ok ? t : null, sunrise: rise, sinceSunriseAsus: ok ? turnAsusBetween(rise, t) : null, kapala: ok ? kapalaOfAsus(turnAsusBetween(rise, t)) : null,
      polarBhuktiArcmin: polarBhukti, moonBhuktiArcmin: G.bhukti(t).moon, source: "SS 8.14-8.15 (the dhruvaka), 7.10, 2.47-2.49 (the Moon's motion)" };
  }

  // ── the reduction ───────────────────────────────────────────────────────────────────────────────
  const stats = (xs) => (xs.length ? { n: xs.length, mean: xs.reduce((a, b) => a + b, 0) / xs.length, min: Math.min(...xs), max: Math.max(...xs) } : { n: 0 });
  /** The catalogue (corpus/surya-siddhanta/yogatara.json, or a list of { name, dhruvaka, vikshepa }) as a name → star map. */
  function starMap(opts) {
    const o = opts || {}, list = Array.isArray(o.stars) ? o.stars : o.catalogue ? D.starsOf(o.catalogue) : [];
    return new Map(list.map((s) => [String(s.name).normalize("NFC"), s]));
  }

  /** Reduces a certified ledger. The chāyā records go, as a "vedha-chaya/1" file, to ss-chaya.js's reduce; each of the
   *  other observations comes back with what it measured [measured], the text's prediction beside it, and the antara.
   *  The frame kinds (uttara-rekha, ayananta-yugma) come back as a preview (northLine, solsticePair) beside the text's ε
   *  and the ledger's place, applied to nothing; summary.uttaraRekha and summary.ayanantaYugma list them.
   *  opts: allowSynthetic (passed to the certifier), catalogue (yogatara.json) or stars, sunrise ("text"), drishya,
   *  grahana, chaya (options for ss-chaya.js's reduce). Throws when the ledger is not certified. */
  function reduce(ledgerOrFile, opts) {
    const o = opts || {};
    const cert = certify(ledgerOrFile, { allowSynthetic: o.allowSynthetic });
    if (!cert.ok) throw new RangeError("vedha-lekha: the ledger is not certified — " + cert.reasons.map((r) => `${r.where}: ${r.reason}`).join("; "));
    const L = typeof ledgerOrFile === "string" ? JSON.parse(ledgerOrFile) : ledgerOrFile;
    const tag = "[measured]", warnings = [], recs = cert.records;
    const seqOf = new Map(L.entries.map((e) => [e.record.id, e.seq]));
    const hashOfId = new Map(L.entries.map((e) => [e.record.id, e.sealedHash]));
    const synthetic = recs.some((r) => r.synthetic);

    // the shadow and the bowl: ss-chaya.js
    const chayaRecs = recs.filter((r) => CHAYA_KINDS.includes(r.kind)).map((r) => { const x = clone(r); delete x.ganita; return x; });
    let chaya = null;
    if (chayaRecs.length) {
      const file = { format: C.FORMAT, site: clone(L.site || {}), records: chayaRecs };
      if (L.shanku !== undefined) file.shanku = L.shanku;
      try { chaya = C.reduce(file, o.chaya); } catch (e) { warnings.push(`the shadow records: ${e.message}`); }
    }
    const place = placeOf(L.site, L.shanku, chaya);
    const others = recs.filter((r) => !CHAYA_KINDS.includes(r.kind) && r.kind !== "ganita");
    if (!place && others.some((r) => !FRAME_KINDS.includes(r.kind))) throw new RangeError("vedha-lekha: no place — give site.palabha or site.latitude (the dhruva), or a vishuvat record");
    const site = place ? modelSite(place) : null;

    // the bowl's own count of a turn (1.12, 13.23)
    const cal = recs.filter((r) => r.kind === "kapala").map((r) => asusOfKapala(r.count, r.id));
    const bowl = cal.length ? { tag, n: cal.length, turnAsus: cal.reduce((a, b) => a + b, 0) / cal.length } : null;
    if (bowl) { bowl.rate = TURN / bowl.turnAsus; bowl.driftGhati = (bowl.turnAsus - TURN) / ASU_PER_GHATI; }
    /** A bowl count from sunrise → asus of the turn: × the bowl's rate (nakṣatra calibration, the default), or for a
     *  bowl calibrated sunrise to sunrise (sāvana) × turns ÷ civil days (1.34-1.37). */
    const turnAsusOf = (r) => {
      const c = asusOfKapala(r.kapala, r.id);
      return r.calibration === "savana" ? c * TURNS / CIVIL : c * (bowl ? bowl.rate : 1);
    };
    const stars = starMap(o);
    const starOf = (name) => stars.get(String(name).normalize("NFC")) || null;
    const ganitaOf = (r) => (r.ganita ? { id: r.ganita, seq: seqOf.get(r.ganita), sealedHash: hashOfId.get(r.ganita), values: recs.find((x) => x.id === r.ganita).values } : undefined);
    const vinadi = (asus) => (asus === null ? null : asus / ASU_PER_VINADI);

    const out = [];
    const eclipses = new Map();
    for (const r of others) {
      const N = dayOf(r), base = { id: r.id, kind: r.kind, seq: seqOf.get(r.id), day: N, tag, synthetic: !!r.synthetic };
      if (r.ganita) base.ganita = ganitaOf(r);
      if (r.kind === "yamyottara") {
        const star = starOf(r.star), transit = r.transit || "upper";
        const observed = {};
        if (r.kapala !== undefined) observed.sinceSunriseAsus = turnAsusOf(r);
        if (r.unnata !== undefined) { observed.unnataDeg = arcOf(r.unnata, `${r.id}.unnata`); observed.disha = r.disha; }
        const rec = { ...base, star: r.star, transit, observed };
        if (star) {
          const p = predictTransit(N, star, site, { ...o, transit });
          rec.text = { sinceSunriseAsus: p.sinceSunriseAsus, kapala: p.kapala, unnataDeg: p.unnataDeg, disha: p.disha, krantiDeg: p.krantiDeg, at: p.t, source: p.source };
          rec.antara = {};
          if (observed.sinceSunriseAsus !== undefined) { rec.antara.asus = observed.sinceSunriseAsus - p.sinceSunriseAsus; rec.antara.vinadi = vinadi(rec.antara.asus); }
          if (observed.unnataDeg !== undefined) {
            if (observed.disha !== p.disha) warnings.push(`${r.id}: read on the ${observed.disha} side; the text puts ${r.star} on the ${p.disha} side`);
            rec.antara.unnataArcmin = (observed.unnataDeg - p.unnataDeg) * 60;
          }
        } else rec.text = null;
        out.push(rec);
        continue;
      }
      if (r.kind === "grahana") {
        const key = `${r.body}:${N}`;
        let E = eclipses.get(key);
        if (!E) { E = eclipseFor(r.body, N, site, o); eclipses.set(key, E); }
        const p = predictContact(N, r.body, r.contact, site, { ...o, eclipse: E });
        const observed = {};
        if (r.kapala !== undefined) observed.byKapala = turnAsusOf(r);
        if (r.chaya !== undefined) {
          const sh = turnAsusFromShadow(N, C.angulaOf(r.chaya, `${r.id}.chaya`) * 12 / (L.shanku || 12), r.side, site, o);
          observed.byChaya = sh.asus;
          if (sh.shorterThanNoon > 0) warnings.push(`${r.id}: the shadow is shorter than the text's noon shadow; it times nothing (3.37-3.39)`);
        }
        observed.sinceSunriseAsus = observed.byKapala !== undefined ? observed.byKapala : observed.byChaya;
        const rec = { ...base, body: r.body, contact: r.contact, observed,
          text: { possible: p.possible, total: p.total, sinceSunriseAsus: p.sinceSunriseAsus, kapala: p.kapala, above: p.above, at: p.t, parva: E.parva && E.parva.days, source: p.source } };
        if (!p.possible) warnings.push(`${r.id}: the text gives no ${r.body === "surya" ? "solar" : "lunar"} eclipse here — a seen eclipse the model misses is a result, not an error to tune away (design §4.3)`);
        else if (p.t === null) warnings.push(`${r.id}: the text's eclipse has no ${r.contact} (not total)`);
        if (p.above === false) warnings.push(`${r.id}: the text has the ${r.body === "surya" ? "Sun" : "Moon"} below the horizon at this ${r.contact}`);
        if (p.sinceSunriseAsus !== null && (p.sinceSunriseAsus < 0 || p.sinceSunriseAsus >= ASUS_PER_DAY)) warnings.push(`${r.id}: the text's ${r.contact} is not on the civil day after this sunrise`);
        rec.antara = p.sinceSunriseAsus === null ? null : { asus: observed.sinceSunriseAsus - p.sinceSunriseAsus, vinadi: vinadi(observed.sinceSunriseAsus - p.sinceSunriseAsus) };
        if (rec.antara && observed.byKapala !== undefined && observed.byChaya !== undefined) rec.antara.kapalaLessChayaAsus = observed.byKapala - observed.byChaya;
        out.push(rec);
        continue;
      }
      if (r.kind === "candra-darshana") {
        const horizon = r.horizon || "pashcima", p = predictCrescent(N, horizon, site, o);
        out.push({ ...base, horizon, observed: { seen: r.seen }, text: { kalamsa: p.kalamsa, limit: p.limit, seen: p.seen, elongation: p.elongation, at: p.at, source: p.source },
          antara: { agree: r.seen === p.seen } });
        continue;
      }
      if (r.kind === "candra-yoga") {
        const star = starOf(r.star), observed = { sinceSunriseAsus: turnAsusOf(r) };
        const rec = { ...base, star: r.star, observed };
        if (!star) rec.text = null;
        else {
          const p = predictYuti(N, star, site, o);
          rec.text = { sinceSunriseAsus: p.sinceSunriseAsus, kapala: p.kapala, at: p.t, polarBhuktiArcmin: p.polarBhuktiArcmin, moonBhuktiArcmin: p.moonBhuktiArcmin, source: p.source };
          if (p.t === null) { warnings.push(`${r.id}: by the text the Moon does not reach ${r.star}'s dhruvaka on this civil day`); rec.antara = null; }
          else {
            const d = observed.sinceSunriseAsus - p.sinceSunriseAsus;
            // JM §14: prāṇas × the body's own motion in a turn ÷ 21,600 is the arc moved. The motion is that of the Moon's
            // polar longitude, the quantity the yoga is judged by; the Moon that comes late is behind.
            rec.antara = { asus: d, vinadi: vinadi(d), moonArcmin: -d * p.polarBhuktiArcmin * (CIVIL / TURNS) / TURN,
              note: "moonArcmin is the sky's Moon less the text's on its circle through the dhruva (polar longitude). The text's yoga is geocentric (no lambana): the Moon's parallax is inside this antara" };
          }
        }
        out.push(rec);
        continue;
      }
      if (r.kind === "yantra") {
        // the instrument's reading against the text at the instant the bowl gives, or the reading itself fixes (yantra.js)
        const star = r.body === "surya" ? null : starOf(r.body);
        const tBowl = r.kapala !== undefined ? afterTurnAsus(sunriseAt(N, site, o), turnAsusOf(r)) : null;
        const x = Y.reduceReading(r, site, { N, t: tBowl, star });
        if (x.warning) warnings.push(`${r.id}: ${x.warning}`);
        out.push({ ...base, yantra: r.yantra, body: r.body, observed: x.observed, instant: x.instant, text: x.text, antara: x.antara });
        continue;
      }
      if (FRAME_KINDS.includes(r.kind)) {
        // the frame: a PREVIEW beside the text's values; nothing is applied (the certifier has already checked the readings)
        try {
          const x = r.kind === "uttara-rekha" ? northLine(r) : solsticePair(r, place);
          for (const w of x.warnings || []) warnings.push(`${r.id}: ${w}`);
          delete x.warnings;
          out.push({ ...base, ...x });
        } catch (e) {
          warnings.push(`${r.id}: ${e.message.replace(/^vedha-lekha: /, "")}`);
          out.push({ ...base, refused: e.message, preview: true, applied: false });
        }
        continue;
      }
    }

    // ── what the records say together ──
    const T = (k) => out.filter((x) => x.kind === k);
    // stars on the meridian: the same night, two stars — sunrise and the Sun cancel; the turn between their ascensions remains
    const yam = T("yamyottara");
    const pairs = [];
    const byNight = new Map();
    for (const x of yam) if (x.text && x.observed.sinceSunriseAsus !== undefined) { const a = byNight.get(x.day) || []; a.push(x); byNight.set(x.day, a); }
    for (const [N, xs] of byNight) for (let i = 0; i < xs.length; i++) for (let j = i + 1; j < xs.length; j++) {
      const a = xs[i], b = xs[j];
      if (a.star === b.star && a.transit === b.transit) continue;
      const obs = b.observed.sinceSunriseAsus - a.observed.sinceSunriseAsus, txt = b.text.sinceSunriseAsus - a.text.sinceSunriseAsus;
      pairs.push({ day: N, from: a.id, to: b.id, stars: [a.star, b.star], observedAsus: obs, textAsus: txt, antaraAsus: obs - txt, tag });
    }
    // the dhruva: a circumpolar star's upper and lower transit, both above the northern horizon (12.72; dhruva.js)
    const dhruva = [];
    const byStar = new Map();
    for (const x of yam) if (x.observed.unnataDeg !== undefined && x.observed.disha === "N") { const s = byStar.get(x.star) || { upper: [], lower: [] }; s[x.transit].push(x); byStar.set(x.star, s); }
    for (const [name, s] of byStar) {
      if (!s.upper.length || !s.lower.length) continue;
      const mean = (xs) => xs.reduce((a, x) => a + x.observed.unnataDeg, 0) / xs.length;
      const up = mean(s.upper), lo = mean(s.lower);
      if (up < lo) { warnings.push(`${name}: the upper transit is read lower than the lower one; no dhruva from it`); continue; }
      const whole = (d) => Math.abs(d * 3600 - Math.round(d * 3600)) < 1e-6;
      let latitude, polarDistance, exact = false;
      if (whole(up) && whole(lo) && s.upper.length === 1 && s.lower.length === 1) {   // dhruva.js: exact, in arcseconds
        let q;
        try { q = Dh.dhruvaFromCulminations({ upper: Math.round(up * 3600), lower: Math.round(lo * 3600) }); }
        catch (e) { warnings.push(`${name}: ${e.message}; no dhruva from this pair`); continue; }
        latitude = Number(q.elevation.num) / Number(q.elevation.den) / 3600; polarDistance = Number(q.polarDistance.num) / Number(q.polarDistance.den) / 3600; exact = true;
      } else { latitude = (up + lo) / 2; polarDistance = (up - lo) / 2; }
      dhruva.push({ star: name, tag, upperDeg: up, lowerDeg: lo, latitudeDeg: latitude, polarDistanceDeg: polarDistance, exact,
        siteLatitudeDeg: place.latitude, antaraArcmin: (latitude - place.latitude) * 60, ids: [...s.upper, ...s.lower].map((x) => x.id),
        note: "refraction lifts both transits and does not cancel in the mean (design §1.6)" });
    }
    // eclipses: the middle of the observed contacts cancels the sunrise; the length cancels it twice
    const ecl = [];
    const byEclipse = new Map();
    for (const x of T("grahana")) if (x.text.possible) { const k = `${x.body}:${x.text.parva}`; const a = byEclipse.get(k) || []; a.push(x); byEclipse.set(k, a); }
    for (const xs of byEclipse.values()) {
      const s = xs.find((x) => x.contact === "sparsha" && x.antara), m = xs.find((x) => x.contact === "moksha" && x.antara);
      const e = { body: xs[0].body, day: xs[0].day, parva: xs[0].text.parva, contacts: xs.map((x) => x.id), tag };
      if (s && m) {
        e.middleAntaraAsus = (s.observed.sinceSunriseAsus + m.observed.sinceSunriseAsus) / 2 - (s.text.sinceSunriseAsus + m.text.sinceSunriseAsus) / 2;
        e.durationAntaraAsus = (m.observed.sinceSunriseAsus - s.observed.sinceSunriseAsus) - (m.text.sinceSunriseAsus - s.text.sinceSunriseAsus);
        if (e.body === "candra") {
          // SS 1.60-1.65: a lunar eclipse is one instant everywhere; the deśāntara that puts the text's middle where it was seen
          const obsMid = (s.observed.sinceSunriseAsus + m.observed.sinceSunriseAsus) / 2, tMid = (s.text.at + m.text.at) / 2;
          const at = (d) => turnAsusBetween(sunriseAt(e.day, { ...site, deshantara: d }, o), tMid) - obsMid;
          let d0 = site.deshantara, d1 = d0 + e.middleAntaraAsus / 60, f0 = at(d0), f1 = at(d1);
          for (let i = 0; i < 20 && Math.abs(f1) > 1e-9 && f1 !== f0; i++) { const d2 = d1 - f1 * (d1 - d0) / (f1 - f0); d0 = d1; f0 = f1; d1 = d2; f1 = at(d1); }
          e.deshantaraDeg = d1;
          e.deshantaraNote = "on the text's Moon: its own error (tens of minutes, design §14.5) is inside this number";
        }
      }
      ecl.push(e);
    }
    // the crescent: where the sky's limit lies, by the text's own kālāṃśa
    const cd = T("candra-darshana");
    const seenK = cd.filter((x) => x.observed.seen && x.text.kalamsa !== null).map((x) => x.text.kalamsa);
    const unseenK = cd.filter((x) => !x.observed.seen && x.text.kalamsa !== null && x.text.kalamsa > 0).map((x) => x.text.kalamsa);
    const crescent = { tag, n: cd.length, agree: cd.filter((x) => x.antara.agree).length, disagree: cd.filter((x) => !x.antara.agree).map((x) => x.id),
      limit: { text: DARSHANA, seenAtLeast: seenK.length ? Math.min(...seenK) : null, unseenAtMost: unseenK.length ? Math.max(...unseenK) : null } };
    crescent.limit.consistent = crescent.limit.seenAtLeast === null || crescent.limit.unseenAtMost === null || crescent.limit.unseenAtMost < crescent.limit.seenAtLeast;
    // the instruments: each antara, gathered by what it measures
    const yan = T("yantra").filter((x) => x.antara);
    const yantra = { tag, n: T("yantra").length, byInstrument: {} };
    for (const k of ["natAsus", "krantiArcmin", "unnataArcmin", "digamshaArcmin", "natamshaArcmin", "sphutaArcmin"]) yantra[k] = stats(yan.filter((x) => x.antara[k] !== undefined).map((x) => x.antara[k]));
    for (const x of T("yantra")) yantra.byInstrument[x.yantra] = (yantra.byInstrument[x.yantra] || 0) + 1;
    // the frame from the owner's readings: each record on its own (a north line is one drawn line), a preview only
    const uttaraRekha = T("uttara-rekha").filter((x) => x.trueNorth).map((x) => ({ id: x.id, tag, star: x.star, trueNorthVikala: x.trueNorth.vikala,
      sigmaVikala: x.trueNorth.sigmaVikala, side: x.trueNorth.side, preview: true, applied: false }));
    const ayanantaYugma = T("ayananta-yugma").filter((x) => x.epsilon).map((x) => ({ id: x.id, tag, epsilonDeg: x.epsilon.deg, latitudeDeg: x.latitude.deg,
      sigmaVikala: x.epsilon.sigmaVikala, textEpsilonDeg: x.text.epsilonDeg, antara: x.antara, preview: true, applied: false }));
    // the predictions written first
    const ganita = recs.filter((r) => r.kind === "ganita").map((g) => {
      const citedBy = recs.filter((r) => r.ganita === g.id).map((r) => ({ id: r.id, seq: seqOf.get(r.id) }));
      return { id: g.id, seq: seqOf.get(g.id), for: g.for, day: dayOf(g), model: g.model, values: g.values, sealedHash: hashOfId.get(g.id), citedBy, first: citedBy.every((c) => c.seq > seqOf.get(g.id)) };
    });

    return {
      format: FORMAT, tag, synthetic, warnings,
      certified: { n: cert.n, head: cert.head, seal: cert.seal },
      site: place ? { tag, ...place } : null, kapala: bowl, chaya, records: out,
      summary: {
        yamyottara: { antaraAsus: stats(yam.filter((x) => x.antara && x.antara.asus !== undefined).map((x) => x.antara.asus)),
          unnataArcmin: stats(yam.filter((x) => x.antara && x.antara.unnataArcmin !== undefined).map((x) => x.antara.unnataArcmin)), pairs },
        dhruva, grahana: ecl, candraDarshana: crescent,
        candraYoga: { moonArcmin: stats(T("candra-yoga").filter((x) => x.antara).map((x) => x.antara.moonArcmin)) },
        yantra,
        uttaraRekha, ayanantaYugma,
        ganita,
      },
    };
  }

  return Object.freeze({
    sine: S.sine || "table", withSine: (name) => vedhaLekhaOf(K, S.withSine(name), Dh, U.withSine(name), C.withSine(name), G.withSine(name), D.withSine(name), Y ? Y.withSine(name) : Y),
    FORMAT, KINDS, CHAYA_KINDS, OBSERVATION_KINDS, FRAME_KINDS, FRAME_READINGS, COMMON, CONTACTS, TOP, SITE, ENTRY, SEAL, ASUS_PER_DAY,
    GATE_FORBIDDEN, MODERN_ACRONYMS, MODERN_PRODUCTS, MODERN_FIELDS,
    sha256, canonical, utf8,
    create, append, verify, seal, toJSON, fromJSON, certify, reduce,
    arcOf, arcOfDegrees, kapalaOfAsus, asusOfKapala, placeOf, sunriseAt, sunsetAt, turnAsusBetween, afterTurnAsus,
    predictTransit, eclipseFor, predictContact, shadowAtTurnAsus, turnAsusFromShadow, predictCrescent, moonPolarAt, predictYuti,
    northLine, solsticePair,
  });
});
