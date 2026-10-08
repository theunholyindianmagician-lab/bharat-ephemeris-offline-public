/* katapayadi.js — the Kaṭapayādi (कटपयादि) number cipher, dependency-free, exact (BigInt).
 *
 * Rules (the rule verse commonly attributed to the Sadratnamālā [unverified: no printed witness in this repository; the
 *   Pāṇini edition gives only the opening words]: नञावचश्च शून्यानि संख्याः कटपयादयः । मिश्रे तूपान्त्यहल् संख्या न च चिन्त्यो हलस्वरः ॥):
 *   • क-वर्ग from क=1 … झ=9, ञ=0;  ट-वर्ग ट=1 … ध=9, न=0;  प-वर्ग प=1 … म=5;
 *     य=1 र=2 ल=3 व=4 श=5 ष=6 स=7 ह=8 (ळ=9 in the southern lists).
 *   • न, ञ and a standalone vowel count 0.  A vowel sign, anusvāra, visarga, candrabindu carry no value.
 *   • In a conjunct (मिश्र) only the LAST consonant (उपान्त्य-हल्) counts: क्ष → ष = 6, ग्य → य = 1.
 *   • Numbers are read अङ्कानां वामतो गतिः — the FIRST written syllable is the units digit
 *     (decodeWord → `value`).  `digitsWritten` is the plain left-to-right string for verses that are
 *     meant to be read in writing order (the π verse).
 * Works on Devanagari and on IAST romanisation.  Browser: window.Katapayadi; node: module.exports.
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.Katapayadi = factory();
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";
  const DEVA = Object.freeze({
    "क": 1, "ख": 2, "ग": 3, "घ": 4, "ङ": 5, "च": 6, "छ": 7, "ज": 8, "झ": 9, "ञ": 0,
    "ट": 1, "ठ": 2, "ड": 3, "ढ": 4, "ण": 5, "त": 6, "थ": 7, "द": 8, "ध": 9, "न": 0,
    "प": 1, "फ": 2, "ब": 3, "भ": 4, "म": 5,
    "य": 1, "र": 2, "ल": 3, "व": 4, "श": 5, "ष": 6, "स": 7, "ह": 8, "ळ": 9,
  });
  const IAST = Object.freeze({
    k: 1, kh: 2, g: 3, gh: 4, "ṅ": 5, c: 6, ch: 7, j: 8, jh: 9, "ñ": 0,
    "ṭ": 1, "ṭh": 2, "ḍ": 3, "ḍh": 4, "ṇ": 5, t: 6, th: 7, d: 8, dh: 9, n: 0,
    p: 1, ph: 2, b: 3, bh: 4, m: 5,
    y: 1, r: 2, l: 3, v: 4, "ś": 5, "ṣ": 6, s: 7, h: 8, "ḷ": 9,
  });
  // One canonical consonant per digit for encoding (the first of each varga row; 0 = न).
  const CANON_DEVA = Object.freeze(["न", "क", "ख", "ग", "घ", "ङ", "च", "छ", "ज", "झ"]);
  const CANON_IAST = Object.freeze(["na", "ka", "kha", "ga", "gha", "ṅa", "ca", "cha", "ja", "jha"]);

  const VIRAMA = "्";
  const DEVA_VOWELS = new Set("अआइईउऊऋॠऌॡएऐओऔ");
  const DEVA_SIGNS = new Set("ािीुूृॄॢॣेैोौंःँऽ");
  const IAST_CONS = Object.keys(IAST).sort((a, b) => b.length - a.length);
  const IAST_VOWELS = ["ai", "au", "ā", "ī", "ū", "ṛ", "ṝ", "ḹ", "a", "i", "u", "e", "o"];
  const IAST_MARKS = new Set(["ṃ", "ṁ", "ḥ", "'"]);
  const nfc = (s) => String(s).normalize("NFC");

  /** Devanagari text → [{syllable, digit}] in written order. Non-letters are skipped. */
  function syllablesDevanagari(text) {
    const s = nfc(text), out = [];
    let i = 0;
    while (i < s.length) {
      const ch = s[i];
      if (DEVA[ch] !== undefined) {
        const start = i; let last = ch; i += 1;
        while (i + 1 < s.length && s[i] === VIRAMA && DEVA[s[i + 1]] !== undefined) { last = s[i + 1]; i += 2; }
        if (s[i] === VIRAMA) { i += 1; continue; }        // हलन्त: a consonant without a vowel is not counted (na ca cintyo halasvaraḥ)
        while (i < s.length && DEVA_SIGNS.has(s[i])) i += 1;
        out.push({ syllable: s.slice(start, i), digit: DEVA[last] });
      } else if (DEVA_VOWELS.has(ch)) {
        const start = i; i += 1;
        while (i < s.length && DEVA_SIGNS.has(s[i])) i += 1;
        out.push({ syllable: s.slice(start, i), digit: 0 });
      } else i += 1;
    }
    return out;
  }

  /** IAST text → [{syllable, digit}] in written order. Case-insensitive; a trailing virama-less consonant counts. */
  function syllablesIAST(text) {
    const s = nfc(text).toLowerCase(), out = [];
    let i = 0;
    const consAt = (k) => IAST_CONS.find((c) => s.startsWith(c, k)) || null;
    const vowelAt = (k) => IAST_VOWELS.find((v) => s.startsWith(v, k)) || null;
    while (i < s.length) {
      const c0 = consAt(i);
      if (c0) {
        const start = i; let last = c0;
        for (let c = c0; c; c = consAt(i)) { last = c; i += c.length; }
        const v = vowelAt(i);
        if (!v) continue;                                 // vowel-less consonant (e.g. final -m, -n, -ṅ): not counted
        i += v.length;
        while (i < s.length && IAST_MARKS.has(s[i])) i += 1;
        out.push({ syllable: s.slice(start, i), digit: IAST[last] });
      } else {
        const v = vowelAt(i);
        if (v) { const start = i; i += v.length; while (i < s.length && IAST_MARKS.has(s[i])) i += 1; out.push({ syllable: s.slice(start, i), digit: 0 }); }
        else i += 1;
      }
    }
    return out;
  }

  function isDevanagari(text) { return /[ऀ-ॿ]/.test(nfc(text)); }
  function syllables(text) { return isDevanagari(text) ? syllablesDevanagari(text) : syllablesIAST(text); }

  /** Decode a word/phrase. value = अङ्कानां वामतो गतिः (first syllable = units), as BigInt. */
  function decodeWord(text) {
    const syl = syllables(text);
    const digitsWritten = syl.map((x) => String(x.digit)).join("");
    let value = 0n, place = 1n;
    for (const x of syl) { value += BigInt(x.digit) * place; place *= 10n; }
    return { syllables: syl, digitsWritten, digitsVamato: digitsWritten.split("").reverse().join(""), value };
  }

  /** Encode a non-negative integer as a canonical word (first syllable = units). */
  function encodeInteger(value, script = "devanagari") {
    let n = typeof value === "bigint" ? value : BigInt(value);
    if (n < 0n) throw new Error("Kaṭapayādi encodes non-negative integers only");
    const canon = script === "iast" ? CANON_IAST : CANON_DEVA;
    if (n === 0n) return canon[0];
    let word = "";
    while (n > 0n) { word += canon[Number(n % 10n)]; n /= 10n; }
    return word;
  }

  /** The 72-melakarta rule: the first two consonants of the rāga name, read वामतो गतिः. */
  function melakartaNumber(ragaName) {
    const syl = syllables(ragaName).filter((x) => x.digit !== undefined).slice(0, 2);
    if (syl.length < 2) throw new Error("need two syllables");
    return syl[1].digit * 10 + syl[0].digit;
  }

  // ── Āryabhaṭa's letter-numerals (Āryabhaṭīya, Gītikā 2), a different codec from Kaṭapayādi ─────────────────────
  // Varga consonants k…m are 1…25, avarga y…h are 30…100; the vowel of the syllable multiplies every consonant of it by
  // a power of 100: a 1, i 100, u 100², ṛ 100³, ḷ 100⁴, e 100⁵, ai 100⁶, o 100⁷, au 100⁸ (long = short). The rule as
  // this library states it: editions/panini-rahasya-full-edition.html (आर्यभट-सङ्केत).
  const AB_CONS = Object.freeze({ k: 1, kh: 2, g: 3, gh: 4, "ṅ": 5, c: 6, ch: 7, j: 8, jh: 9, "ñ": 10, "ṭ": 11, "ṭh": 12, "ḍ": 13, "ḍh": 14, "ṇ": 15,
    t: 16, th: 17, d: 18, dh: 19, n: 20, p: 21, ph: 22, b: 23, bh: 24, m: 25, y: 30, r: 40, l: 50, v: 60, "ś": 70, "ṣ": 80, s: 90, h: 100 });
  const AB_VOW = Object.freeze({ a: 0, "ā": 0, i: 1, "ī": 1, u: 2, "ū": 2, "ṛ": 3, "ṝ": 3, "ḷ": 4, "ḹ": 4, e: 5, ai: 6, o: 7, au: 8 });
  /** Decode one word of Āryabhaṭa's letter-numerals written in IAST (BigInt). Throws on a letter outside the code. */
  function decodeAryabhata(word) {
    const w = nfc(word).toLowerCase().replace(/[\s,|.\-]/g, "");
    let i = 0, total = 0n, cluster = [];
    const take = (list) => { for (const x of list) if (w.startsWith(x, i)) { i += x.length; return x; } return null; };
    const consKeys = Object.keys(AB_CONS).sort((a, b) => b.length - a.length), vowKeys = Object.keys(AB_VOW).sort((a, b) => b.length - a.length);
    while (i < w.length) {
      const v = take(vowKeys);
      if (v !== null) {
        if (!cluster.length) throw new RangeError(`aryabhata: a vowel without a consonant in "${word}"`);
        const place = 100n ** BigInt(AB_VOW[v]);
        for (const c of cluster) total += BigInt(AB_CONS[c]) * place;
        cluster = []; continue;
      }
      const c = take(consKeys);
      if (c === null) throw new RangeError(`aryabhata: "${w[i]}" is not in the code ("${word}")`);
      cluster.push(c);
    }
    if (cluster.length) throw new RangeError(`aryabhata: consonants without a vowel at the end of "${word}"`);
    return total;
  }

  return Object.freeze({ DEVA, IAST, CANON_DEVA, CANON_IAST, syllables, syllablesDevanagari, syllablesIAST, decodeWord, encodeInteger, melakartaNumber, isDevanagari, decodeAryabhata });
});
