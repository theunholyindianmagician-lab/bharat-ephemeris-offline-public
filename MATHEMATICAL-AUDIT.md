# Current audit addendum — 9 October 2026

The sections below retain an earlier audit and are historical, not a current selector specification. The current contract has three models: `ss+parameshvara` (default), `ss`, and modern `drik` (1850–2150). See README for dependencies and limits.

At PR #5 head `2de0c80`, all 57 registered suites passed; the separately executed three-choice UI suite passed 23 checks. A further contact-accessor probe nevertheless found absent inner solar contacts being returned as the middle time. The correction returns null for absent contacts, validates contact names, and uses vimarda and the correct signed side for inner contacts. A regression pins the partial-eclipse case and a non-eclipse case. The previously unregistered three-choice browser suite is now in the main runner (58 suites).

Outstanding mathematical limits include held chapter-5 parallax in corrected solar eclipses, approximate corrected-model perceptibility intervals, limited historical fit identifiability, and modern-series/reference dependence. Passing tests must not be promoted to perfect observational accuracy or global novelty.

---

# Mathematical Synthesis Audit

## Verdict

The previous integration report overstated completion. It mixed valid arithmetic, untested hypotheses, incomplete functions, static demonstration output and one syntax error. The current implementation separates exact reversible mathematics from model-dependent astronomy.

## Corrections Applied

1. **Metrology**

   Correct sequence: `1 day = 60 ghaḍīs = 3,600 palas = 216,000 vipalas = 21,600 prāṇas`.

   The equality between `21,600 prāṇas/day` and `21,600 arcminutes/circle` is a count correspondence. It is not a physical equality between time and angle.

2. **Ayanāṃśa synthesis**

   The shared-drift arithmetic is reproducible:

   ```text
   -16 rev/Mahāyuga = -4.7998849278 arcsec/year
   54 - 4.7998849278 = 49.2001150722 arcsec/year
   ```

   This proves the arithmetic, not that `49.2001″/year` is the unique or exact historical ayanāṃśa. The instrument therefore exposes it as a selectable hypothesis beside 54″, 50″ and the ±27° sinusoid.

3. **Bīja signs and units**

   The earlier values `(-30, +51, -61)` used the residual slope with the wrong sign. The corrected convention is:

   ```text
   Mars +30 · Jupiter -51 · Saturn +61 revolutions/Mahāyuga
   ```

   They are applied only as an anchored drift experiment about 1800 CE. They are not raw degree offsets.

4. **Triangle argument**

   Reconstructing three bījas from their pairwise differences and sum is an algebraic identity, not an independent geometric derivation. The earlier “112 exact great conjunctions” identification was also refuted by the recorded 600–3000 CE count. The UI no longer presents either as proof.

5. **Katapayadi**

   The old decoder assumed every value had two integer digits, lost longitude precision, and did not preserve signs reliably. The K1 payload now records axis, hemisphere and decimal precision explicitly. It is a reversible codec, not a hash and not compression.

6. **Vargas**

   The earlier completion claim was false: only D1, D9, D10 and D60 were rendered, while an injected D9 helper was unused. The pure core now implements all sixteen standard mappings and tests textbook boundary cases.

7. **Vimśottarī**

   The previous function ended after calculating a fraction and the displayed periods were hardcoded. The current engine computes nakṣatra lord, balance at the selected instant, mahādaśā and antardaśā dates.

8. **Time, location and lagna**

   The visible time and location controls were disconnected. Lagna was approximated as `Sun + 15°/hour`, which ignored longitude, latitude, obliquity and sidereal time. The current closed-form ascendant agrees with the independent Swiss fixtures used by the main engine to within 0.1°.

9. **Planetary output boundary**

   The old “Drik” column was a single hardcoded sky reused for every date, and the “zero error” result was manufactured by calibrating the model to that same date. It has been removed. The current table is explicitly an integer-bhagaṇa mean-longitude research model, not a true-position ephemeris.

10. **Offline/runtime integrity**

    The external font request and invalid escaped JavaScript token were removed. Browser verification now reports zero runtime errors and zero remote requests.

## Remaining Boundary

Accurate true longitudes require manda, śīghra, latitude, node, light-time/frame conventions and independent reference validation. Keeping the current core small means it must remain labelled as a mean-longitude synthesis instrument. Promoting it to a production ephemeris requires a separate, measured calculation layer rather than stronger wording.

## Bhāva Layer (2026-08-09)

Whole-sign bhāva (`rāśi offset from lagna`) is kept only as a reference system. The advanced reckoning is the classical bhāva-madhya layer:

1. **Anchors** — 1st bhāva-madhya = lagna; 10th = madhya-lagna (MC, closed form from RAMC/obliquity, verified `RA(MC) ≡ LST` to 1e-9°); 4th = IC; 7th = asta-lagna.
2. **Quadrant trisection** — each of the four arcs lagna→IC, IC→DSC, DSC→MC, MC→lagna is trisected; the trisection points are the madhyas of the two intervening bhāvas.
3. **Sandhis** — a bhāva spans between the midpoints of the arcs to its neighbouring madhyas. Houses are unequal (kendras measure exactly 30°, intermediates contract/expand), never a sign-average.
4. **Placement** — all nine grahas are assigned by exact nirayana longitude against the sandhi lattice, with signed offset from each cusp; whole-sign bhāva remains alongside for comparison.
5. **Tables** — classical rāśi-lords, bhāva names and kārakas (Tanu…Vyaya) exported.

Invariants sealed in `math-core.test.js`: sandhi arcs sum to exactly 360°, every madhya owns its house, lagna is always in bhāva 1, all kendras measure 30°.

## Ayanāṃśa decomposition + zero-year falsification + bīja frame-choice (2026-08-10)

### 1 · Subtrahend decomposition (verified arithmetic)

```
−16 rev/Mahāyuga debt  =  −16·360·3600·365.25 / (4,320,000·365.25)   =  −4.8″/yr  =  −24/5  (exact)
engine shared debt      =  −4.7998849278″/yr   (tail 0.000115 = Sūrya-Siddhānta day-count 1,577,917,828
                                                replaces the 365.25 conversion denominator)
effective rate          =  54 − 4.8            =  49.2  =  54×41/45  =  246/5  (rational core)
engine effective        =  49.2001150722″/yr   (rational core + day-count tail)
```

The computed value is **kept unchanged** — `ARYABHATA_ZERO_JD` (499 CE) is a calibration invariant of the instrument (`ayanamshaDeg` returns 0 there for every variant). The rational decomposition is a documentation fact, not a new constant.

### 2 · Zero-year falsification of the 49.2″/yr hypothesis

Rate gap vs Lahiri ≈ 1.09″/yr = **0.30°/millennium** — over ±2 centuries the 49.2″/yr hypothesis is empirically indistinguishable from Lahiri if the zero-year is chosen correctly.

| Zero-year | 1700–2100 behaviour | Spica residual |
|---|---|---|
| Z = 285 CE (classical) | 0.33°→0.45° behind Lahiri, growing | 0.31°–0.44° ≠ 0 — measurable fail |
| Z = 253.8 CE (solved: ΔZ = 31.2 yr) | within ±0.10° across the window | ≈ 0 today |

**Framing decision:** the hypothesis is presented primarily through its **residual-zero zero-year (Z ≈ 253.8 CE)** — the value that puts Spica ≈ 0° today and keeps the hypothesis inside a ±0.10° band over 1700–2100. **Āryabhaṭa (499 CE, the −16 rev shared-debt derivation) is a secondary historical mention**, not the primary claim. Only a long baseline (Hipparchus-era records or future epochs) can discriminate the rate itself. Note the linear model is itself a limitation: precession is non-linear (≈5029.1″/cy + ≈2.22″/cy² acceleration), so both "period 26,341 yr" and "25,772 yr" are linear fictions.

### 3 · Bīja frame-choice (verified; no code change)

The fitted bīja **+30, −51, +61 are planet−Sun relative-rate corrections** (Sun-anchored frame), not absolute rates. Verified against SS-canon absolute deficits (vs modern sidereal periods, day-count 1,577,917,828):

| Planet | SS-canon absolute deficit | − Sun (+28.3) | relative prediction | fitted | Δ |
|---|---:|---:|---:|---:|---:|
| Mars | +59.0 | | +30.7 | +30 | +0.7 |
| Jupiter | −22.6 | | −50.9 | −51 | +0.1 |
| Saturn | +89.3 | | +61.0 | +61 | −0.0 |

(Deficit = Mahāyuga-days / modern sidereal period − canonical revs; Mars sidereal 686.979852 d, Jupiter 4332.589 d, Saturn 10759.22 d, Sun 365.256363 d.)

The fit's effective Sun-reference was the SS year — confirming `math-core.js`'s day-count **1,577,917,828** (Sūrya Siddhānta), distinct from vedic-ghadi's **1,577,917,500** (Āryabhaṭa). Only two coherent frames exist:

- **Option i (current, Sun-anchored):** Sun 0, planets {+30, −51, +61}. Synodic/retrograde geometry correct; all absolute longitudes share the 8.49″/yr drift. **Kept.**
- **Option ii (absolute frame, full re-fit — NOT applied):** SS-canon Sun +28, Moon +27, Mars +59, Jupiter −23, Saturn +89, Budha-ś +124, Śukra-ś −70 (Budha/Śukra from Rahu-yantra fits, ±; sovereign-frame re-fit pending).

A hybrid `{surya: 27, …}` is **rejected**: it would shift every planet−Sun elongation by −27 revs and un-correct exactly the synodic geometry the oracle validated. The `BIJA_REV_PER_MAHAYUGA` deepEqual test stays pinned to Option i.

**Bonus (verified synodic frame):** ancient elongation count 57,753,336 − 4,320,000 = 53,433,336 revs/Mahāyuga. SS canon (1,577,917,828 days): deficit −0.1 revs = −0.0047 s/synodic-month (near-perfect); Āryabhaṭa canon (1,577,917,500): deficit −11.2 revs = −0.535 s/synodic-month. The canon choice hits the tithi engine hardest.

## Addendum — 2026-08-17 honesty & integrity pass

### 1 · Library `codeOutput` regeneration

**What was wrong:** the 136 `"codeOutput"` blocks embedded in `library.html` were static demonstration text — plausible-looking numbers that had never been produced by the Python snippets shown beside them. The page also carried decorative "JPL", "Invariant-Match" and "Zero-Drift" stamps with no computation behind them, and hero stats inflated beyond the actual content.

**Method and counts:** every one of the 136 snippets was actually executed (Python 3) and its real output written back into the corresponding `codeOutput` block; each block now ends with the provenance line "Computed by executing this snippet (Python 3)." (136 occurrences, matching the 136 `"codeOutput"` keys — both counts re-verified by grep). The JPL / Invariant-Match / Zero-Drift stamps are gone (0 remaining occurrences), and the hero stats now state the measured counts (e.g. **138 Reader Ślokas**, not "4,500+").

### 2 · Badge and claims de-fabrication (engine / panchang / museum)

- **shunyabheda (engine):** the "bitwise determinism" badge is now a real check — `computeBitwiseDeterminism` in `shunyabheda-app.js` runs `canonicalGrahaModel` twice for the same JD and string-compares the JSON; the badge reads "PASS (two independent recomputes byte-identical)" only when they match. The section count is read from the DOM (`document.querySelectorAll("main section").length`), the Pedersen commitment is genuinely committed, opened and verified over the live sphuṭa values (BigInt, explicitly labelled a toy modulus, with a tamper-rejection check on v+1), and the quantum/SaaS/VIX material is reworded as pedagogical demonstration and hypothesis language.
- **panchang:** the SLA/certificate/stamp fabrications were reworded honestly. The `determinismBadge` text is set only from an actual self-check: the page runs its own `panchangExtended` computation twice for the same instant and string-compares the results ("Deterministic Local Compute · verified" on match, a red FAIL state on divergence — no unverified claim is rendered).
- **museum:** the bīja gyān card's fake SHA-256 was replaced by a live `crypto.subtle` SHA-256 computed in-browser over the current state (ahargaṇa ∥ 9-graha sphuṭa vector, 8 decimals). The vacuous Pisano gate was replaced by a real iterated Fibonacci-period assertion inside `runEquationSelfTests` (period = 8·3^(k−1) with period/ord = 4, computed by actually iterating the Fibonacci recurrence mod 3^k for k = 1…5); all **37** self-test gates in that suite still pass (count re-verified in the source today).
- **home orrery:** graha ring radii now come from the computed kakṣā law a/a⊕ = (B☉/B)^(2/3) using the engine's bhagaṇa constants, √-compressed for display so Śani fits the disc — and the caption discloses exactly that: "a projection, not a spatial map".

### 3 · `aryabhataRationalKernel` paridhi-pair bug (the one sealed-file edit)

**Root cause:** `aryabhataRationalKernel` passed the graha **key string** (e.g. `"guru"`) to `ssRectifiedParidhi`, which expects the `SS.mandaParidhi` **[even, odd] paridhi pair**. Arithmetic on a string yields NaN, so the rational-kernel column had been NaN forever — masked by a fake static output table, which is why it survived until this audit.

**Fix semantics:** the kernel now looks up `SS.mandaParidhi[ssKey(p.key)]`, rectifies the paridhi on the actual kendra, and computes the **same manda phala two ways on identical kendra/paridhi**: the float path uses the exact sine, the rational path uses Āryabhaṭa's 24-row integer jyā table (R = 3438, interpolated in 225′ steps, rounded to integer jyā). The reported rational longitude is `mean − floatCorr + rationalCorr`; the delta column is the honest |float − rational| difference of the two methods. Rāhu/Ketu carry no manda equation, so both corrections are 0 by construction.

**Follow-up correction (same session):** the first fix still under-corrected — `SS.mandaParidhi[p.key]` was looked up with canonical key spellings (`candra`/`mangala`/`budha`) while the paridhi table uses `chandra`/`mangal`/`budh`, so those three grahas silently got no manda pair (delta exactly 0); and `ssMandoccaAt` was being passed a full JD where it expects days-since-J2000. Both corrected: the pair lookup now goes through `ssKey()` and the mandocca epoch argument is `jd − j2000JD`.

**Observed deltas (real, date-dependent, after the full fix):** at JD 2461269.4375 — Sūrya 2.10″, Chandra 3.47″, Maṅgala 7.17″, Budha 4.20″, Guru 8.00″, Śukra 0.12″, Śani 7.48″, nodes exactly 0 (no manda equation). A coarse scan over JD 2440587.5–2470000 (step 137 d) shows a maximum of ≈26.1″ (Maṅgala); all sampled values remain sub-arcminute, consistent with the 24-row jyā-table quantization.

### 4 · Regression proof

The canonical model outputs (the sealed fixture surface) are **byte-identical** before and after the kernel fix — only the previously-NaN rational column changed. File integrity: `math-core.js` md5 chain — `b8f8a112468d262e6cadf6f3332990aa` (pre-fix) → `5b70d7ad7572fda8688f1e1c19dac51a` (pair-argument fix) → `4010d6e97e7fe77778fcae6ac5f99e7d` (key-spelling + mandocca-epoch follow-up). Both suites re-run today: **65/65** mathematical checks (`math-core.test.js`) and **22** sprint tests (`sprint-upgrades.test.js`) pass; `node --check` is clean on every shipped JS file.

### 5 · Service worker / PWA activation

`sw.js` (cache `bharat-ephemeris-s8-v1`) is registered on all six product pages (registration snippet verified present in each). Install precaches 17 core entries (the six pages, root, seven shared JS files, `global.css`, `icon.svg`, `manifest.webmanifest`); activation prunes old caches and lazily warms the ten library editions **outside** `waitUntil` so fetch handling is never blocked behind that multi-MB download. HTML/JS/CSS/webmanifest are network-first with `ignoreSearch` cache fallback and an explicit 503 "offline · not cached" response; everything else is cache-first. True offline reload of all six pages was verified in a real Chromium browser. A real `icon.svg` and corrected `manifest.webmanifest` are linked from every page.
