# Bharat Ephemeris Offline

A dependency-free, eight-page browser product for exploring classical Indian astronomical models and their mathematical boundaries. Everything computes locally; after the first visit the site works offline.

Two engines live side by side:

1. **The legacy pages** (`index`, `museum`, `library`, `panchang`, `shunyabheda`, `shoonya_sovereign_dashboard`) run on `math-core.js` (ShunyaMath). Where a page shows positions it has up to three tiers: the classical Sūrya-Siddhānta path (ShunyaMath), the **dṛk tier** (`drik-tier.js`: VSOP87B + ELP/MPP02 coefficients from astronomia, MIT; astronomy-engine as fallback — a modern ephemeris), and the **सिद्धान्त-दृक् tier** (a series fitted to a JPL-DE440-started N-body, 1850–2150 only; see below).
2. **The sovereign engine** (the owner's chosen direction): geocentric, the Sūrya-Siddhānta on its own wheel, no modern ephemeris as computation, seed or referee. Root modules import nothing (`katapayadi.js`, `kala-dvara.js`, `parahita-madhyama.js`, `dhruva.js`, `sphuta.js`, `radau.js`); layers require only roots and layers (`panchanga.js`, `dasha.js`, `muhurta.js`, `utsava.js`, `ss-*.js`, `vedha-lekha.js`, `samskara.js`, …). Design and claims: `VEDHA-YANTRA-DESIGN-2026-10-07.md`.

## Product Pages, and which tier each one displays

| page | what it is | tier displayed |
|---|---|---|
| `index.html` | Home Observatory: orrery disc, ghati clock, gateway cards | dṛk tier when it loads (chip "गणना-तह: दृक्"), classical SS path on hover; classical SS if the dṛk tier is absent |
| `panchang.html` | Panchang: ghati instrument, five limbs, dataset exporter | **dṛk tier** by default for the five limbs and the Sun/Moon sphuṭa; the classical SS limbs in the "शास्त्रीय पथ" comparison row |
| `museum.html` | Museum: full-screen visual journey, relation lab, self-testing equation gates | the page's own classical SS lattice for motion; the dṛk tier only in a labelled comparison panel |
| `library.html` | Library: ten editions with executable code panels | live strip from ShunyaMath (classical SS) |
| `shunyabheda.html` | Research Engine (ENGINE): synthesis and audit instrument | classical SS (`engineMode` classical/calibrated) in the Instrument; classical, सिद्धान्त-दृक् and dṛk tiers side by side in the comparison panels |
| `shoonya_sovereign_dashboard.html` | Dashboard: observatory HUD | dṛk tier when it loads (chip "गणना-तह: दृक्"), else classical SS |
| `siddhanta-panchanga.html` | सिद्धान्त-पञ्चाङ्ग: the pañcāṅga, festivals, eclipses and daśā | **sovereign SS engine only** (`panchanga.js`, `utsava.js`, `muhurta.js`, `dasha.js`, …) |
| `vedha.html` | Vedha: the observation companion (śaṅku, kapāla, ledger) | **sovereign SS engine only**: the text's predictions, to be tested against your own observations |

Each page's primary navigation links the others. These are the only product pages. Historical Python injectors and standalone experiment files are development artifacts, not additional product surfaces.

## Run

From this directory, the preferred server is the bundled one:

```bash
python3 serve.py
```

It binds `http://127.0.0.1:8877/`, forces `charset=utf-8` Content-Types on HTML/JS/CSS/JSON/Markdown (the editions need this), and sends `Cache-Control: no-store` so you always see fresh files during development.

A plain static server also works:

```bash
python3 -m http.server 9000
```

Open any page, e.g.:

- `http://127.0.0.1:8877/index.html`
- `http://127.0.0.1:8877/panchang.html`
- `http://127.0.0.1:8877/shunyabheda.html`

Serving over HTTP is preferred to opening files directly because browser security rules can differ for `file://` URLs, and the service worker requires an HTTP origin.

## Offline / PWA

`sw.js` (cache name: the `CACHE` constant at the top of `sw.js`; bump it on every shipped change) is registered by the product pages. On install it precaches the product pages plus the shared JS/CSS, `icon.svg` and `manifest.webmanifest`; after activation it lazily warms the ten library editions in the background (deliberately outside `waitUntil`, so page fetches are never blocked behind that download). HTML/JS/CSS/manifest requests are network-first with cache fallback; other assets are cache-first. After one online visit the pages and the editions work with no network; of the `downloads/` files only those listed in `sw.js` `DOWNLOADS` are precached, the others need a connection the first time. `manifest.webmanifest` is linked from every page; `icon.svg` is referenced by the manifest (and precached by the service worker), not linked directly from the pages.

## Test

No package installation or build step is required.

```bash
npm test                       # scripts/test-all.cjs: every suite it lists (50 at this commit), in order (exit 1 on the first failure)
node math-core.test.js         # the legacy ShunyaMath checks
node sprint-upgrades.test.js   # 22 sprint tests
node --check math-core.js
node --check shunyabheda-app.js
for f in live-board.js page-live.js field-gl.js global-ui.js access-enhance.js sw.js; do node --check "$f"; done
```

The pure-node suites need nothing installed. The browser suites of `npm test` (`scripts/engine-mode-ui.test.cjs`, `scripts/vedha-ui.test.cjs`, `scripts/siddhanta-panchanga-ui.test.cjs`) and the release gate (`npm run verify:release`, see `RELEASE-VERIFICATION.md`) drive the pages in headless Chromium through Playwright: run `npm ci` and `npx playwright install chromium` once, or point `PLAYWRIGHT_CHROMIUM_EXECUTABLE` at an existing Chromium binary. No test file may hard-code a machine path (the suite is expected to pass on a fresh checkout). Passing tests do not establish universal astronomical accuracy.

## Computational Boundary

- **Panchang displays the dṛk tier** (VSOP87/ELP, a modern ephemeris) for its five limbs and the Sun/Moon sphuṭa whenever `drik-tier.js` loads, which is the default. The classical Sūrya-Siddhānta `sphuta` path (manda four-step correction, `panchangExtended` in `math-core.js`) is computed alongside and shown in the "शास्त्रीय पथ" comparison row. Do not describe the panchang's displayed numbers as the Sūrya-Siddhānta's. For the text's own pañcāṅga use `siddhanta-panchanga.html` (sovereign engine).
- **Accuracy, stated narrowly:** on the dṛk tier the seven bodies Sun–Saturn agree with JPL DE440 within 1′ (in fact ≤ 0.6″ over 180 epochs 1850–2148, `full-vsop.test.js`; tropical longitude). Rāhu/Ketu are the *mean* node, up to ~2° from the true node. This is agreement with a modern ephemeris, not a measurement against the sky.
- Research Engine planet rows are an integer-bhagana mean-longitude research model. Accurate true positions require additional corrections, frame conventions and independent reference validation.
- Museum visualizes the shared model and its relationships; visual presentation is not independent astronomical validation.
- The ṛtu shown on the panchang follows SS 14.9–10 as the repository's edition prints it: two nirayaṇa saura months each, counted from the Makara saṅkrānti with śiśira first (Mīna+Meṣa = Vasanta … Kanyā+Tulā = Śarad).

The panchang's `vara` is still derived from the local civil date (IST by default), not from a location-specific sunrise-day boundary.

See `MATHEMATICAL-AUDIT.md` for corrected claims, model assumptions and remaining limitations.

## 2026-08-17 honesty pass

A full de-fabrication pass was applied to the whole site:

- All 136 `codeOutput` blocks in `library.html` are now generated by really executing their Python snippets (each ends "Computed by executing this snippet (Python 3)."); decorative JPL / Invariant-Match / Zero-Drift stamps were removed and the hero stats corrected to the actual counts (e.g. 138 Reader Ślokas).
- Decorative "zero error" / SLA-style badges were replaced by computed checks: the engine's determinism badge is a real double-recompute byte-comparison, the Panchang badge is set only from an actual run-twice self-check, the museum's bija card hashes the live state with `crypto.subtle` SHA-256, and section counts are read from the DOM.
- The home orrery now places grahas by the computed kaksha law a/a⊕ = (B☉/B)^(2/3) from the bhagana constants, with the √-compressed display radius disclosed in the caption as a projection, not a spatial map.
- One latent `math-core.js` bug was fixed: `aryabhataRationalKernel` passed a graha key string instead of the `SS.mandaParidhi` paridhi pair to `ssRectifiedParidhi` (NaN, previously masked by a static table). Canonical model outputs are regression-proven byte-identical before/after the fix (file md5 chain: `b8f8a112468d262e6cadf6f3332990aa` → `5b70d7ad7572fda8688f1e1c19dac51a` → `4010d6e97e7fe77778fcae6ac5f99e7d` after a follow-up key-spelling/epoch correction in the same function); 65/65 + 22/22 + 6/6 node tests pass.

## सिद्धान्त-दृक् tier (2026-09-22, engine v2.4.2)

The third tier on the ENGINE page. **It is not the Sūrya-Siddhānta's own numbers:** it is a series arranged in the Sūrya-Siddhānta's order and fitted to a modern N-body started from JPL DE440 states (the bīja anchors), valid only 1850–2150. Structure — bīja-corrected bhagaṇas, the madhyama carrying its
own long-period inequalities (Jupiter–Saturn great inequality, Saturn's Jupiter terms, the Moon's planetary terms
enter every argument), manda harmonics of the kendra, mutual (anyonya) terms with their sidebands, exact śīghra
geometry, dṛk-saṃskāra, ayana — with every coefficient fitted to that N-body (BHARAT-SOVEREIGN-ENGINE
`harnesses/fit-siddhanta-series.cjs`, two-stage fit on the mean ecliptic of date: the apamaṇḍala rotation of
2026-08-04 applied as a derived transformation, so the Earth has no fitted latitude line). It ships as
`siddhanta-drik.js` (generated by that engine's `scripts/build-browser-siddhanta.cjs`; frames = IAU 2006 precession +
IAU 2000B nutation as vector rotations; every jyā by Mādhava's series) and the adapter `siddhanta-tier.js`
(`window.SiddhantaTier.grahas(jd, variant)`, same shape as `DrikTier`). The ENGINE page shows the three tiers side by
side (`#siddhanta-drik-panel`), the fitted bhagaṇas against the text's, the lunar-month figures, and the certificate
lines straight from the bundle's `certification` block. Outside the certified span (1850–2150) the tier refuses.

| graha | in-sample vs the N-body it was fitted to, 1850–2150, 15654 epochs: λ max / rms | β max / rms | vs Swiss Ephemeris (DE431-derived files), 1000 random epochs: λ max | β max | withheld-interval fit inside 1865–1875, 1995–2015: λ max |
|---|---|---|---|---|---|
| Sūrya (Sun) | 0.164″ / 0.034″ | 0.083″ / 0.019″ | 0.139″ | 0.073″ | **110″** |
| Candra (Moon) | 0.885″ / 0.214″ | 0.570″ / 0.073″ | 0.595″ | 0.497″ | **13″** |
| Budha (Mercury) | 0.240″ / 0.043″ | 0.179″ / 0.025″ | 0.172″ | 0.176″ | — |
| Śukra (Venus) | 0.683″ / 0.069″ | 0.265″ / 0.043″ | 0.464″ | 0.238″ | — |
| Maṅgala (Mars) | 0.897″ / 0.127″ | 0.354″ / 0.047″ | 0.789″ | 0.261″ | — |
| Guru (Jupiter) | 0.780″ / 0.206″ | 0.707″ / 0.195″ | 0.731″ | 0.682″ | — |
| Śani (Saturn) | 0.802″ / 0.141″ | 0.214″ / 0.070″ | 0.581″ | 0.200″ | — |

Apparent geocentric tropical longitudes and latitudes of date, from `test/certify-siddhanta.cjs` (gates at λ ≤ 1″, β ≤ 1″ on the MAXIMUM error: in-sample PASS · Swiss PASS · held-out FAIL). 12901 terms in all; frame `ecliptic-of-date-sidereal`. All seven grahas are ≤ 1″ in both longitude and latitude **in-sample** against the N-body it was fitted to, and against the Swiss Ephemeris over 1850–2150; the Swiss files are DE431-derived, i.e. from the same JPL family that seeds the N-body, so they are not an independent check. The withheld-interval test fails (Sun 110″, Moon 13″). Two structural choices earn the last two bodies: (1) Jupiter's distance is fitted without the mean-longitude correction (`linearAngles`) — the great inequality is a correction to the angular position, not the radial distance, and carrying it in the distance channel left a 24″-equivalent error at the 1976 Jupiter–Saturn conjunction; (2) Mars's distance carries a minimum-norm consolidation of the long-period Mars–Earth–Jupiter terms with their secular (t, t²) drift (`harnesses/consolidate-residual.cjs`) — a global ridge solve captures the perihelic-opposition terms that the greedy per-pass fitter could only fit as cancelling giants. Maṅgala's distance error at perihelic opposition drops from 1.5″-equiv to 0.3″-equiv and its geocentric longitude from 2.25″ to 0.90″.

**In-sample means in-sample**: the series was fitted on every daily reference sample of 1800–2200 (`heldOut: 0`); the first columns measure how well it reproduces the reference it was fitted to. The Swiss columns are a second (JPL-family, so not independent) ephemeris at random (non-grid) epochs. The withheld-interval column is a SEPARATE two-stage fit with the years 1865–1875, 1995–2015 withheld from every fit step, evaluated inside those years — it **fails** (Sun 110″, Moon 12″): the basis is redundant enough that the fit is unconstrained where there is no data, so the series is an interpolating representation of the reference over its fitted span, not a predictive dynamical theory; the evaluator refuses dates outside 1850–2150. Rāhu = mean pāta (differs from the true node by up to 7121″ by design). Lunar month 29.530588708 d · sidereal year 365.2563820 d · anomalistic month 27.5545501 d · draconic month 27.2122208 d.


## Maintained Files

- `global.css` - shared tokens, accessibility rules and navigation shell.
- `math-core.js` - pure calculations without DOM dependencies (the ShunyaMath core, loaded by the six legacy pages).
- `shunyabheda-app.js` - Research Engine browser rendering.
- `live-board.js` - home observatory orrery disc and ghati clock.
- `page-live.js` - live strips on library and dashboard pages.
- `field-gl.js` - WebGL background field (home, panchang, dashboard).
- `global-ui.js` - shared UI behaviors (library, panchang, engine, dashboard).
- `access-enhance.js` - accessibility enhancements.
- `siddhanta-drik.js` (generated, do not hand-edit), `siddhanta-tier.js` - the सिद्धान्त-दृक् tier and its adapter.
- `sw.js` - service worker (offline cache: its `CACHE` constant).
- `drik-engine.js`, `drik-tier.js`, `vsop87-full.js`, `elp-moon.js` - the dṛk tier (modern ephemeris; MIT notices in `*-LICENSE.txt`).
- `payment.js` - waitlist (mailto) CTAs; every payment-button ID is empty, and an outside script could load only after a visitor's click on a configured button.
- The sovereign engine's modules (`katapayadi.js` … `samskara.js`, see the top of this file) and its pages `vedha.html`, `siddhanta-panchanga.html` (+ `siddhanta-panchanga-page.js`).
- `manifest.webmanifest`, `icon.svg` - PWA manifest (linked from every page) and its icon (referenced by the manifest).
- `serve.py` - preferred local server (127.0.0.1:8877, UTF-8 content types).
- `math-core.test.js`, `sprint-upgrades.test.js` - executable regression checks (node).
- `sprint-upgrades.js` - node-tested upgrade module; not currently loaded by any product page.
- `index.html`, `museum.html`, `library.html`, `panchang.html`, `shunyabheda.html`, `shoonya_sovereign_dashboard.html` - the six legacy product pages; `siddhanta-panchanga.html`, `vedha.html` - the two sovereign-engine pages.
- `MATHEMATICAL-AUDIT.md` - audit record and explicit model boundaries.

Files such as `code_*.py`, `append_charts.py` and `upgrade_hash.py` are historical one-shot injectors. Do not run them against the current pages; they contain superseded implementation fragments.
