# Bharat Ephemeris Offline

Free public browser tools for exploring Indian astronomical texts, observing the sky, and comparing explicit mathematical models. Calculations run locally. The service worker supports subsequent offline use; verify the release cache before distributing an offline copy.

## The three current choices

| ID | Model | Computation and boundary |
|---|---|---|
| `ss+parameshvara` | Sūrya-Siddhānta with Parameśvara saṃskāra — default | Text equations with observation-derived Moon and node epoch corrections. The correction record, assumptions and rejected observations remain inspectable in `corpus/parampara/`. |
| `ss` | Plain Sūrya-Siddhānta | The text's own constants, sine geometry, time convention and ayanāṃśa; no modern ephemeris seeds this path. |
| `drik` | Modern Bhāratīya dṛk | A locally implemented physical calculation and fitted series with DE440s initial conditions, modern reference frames and ΔT assumptions. Supported interval: 1850–2150; out-of-range requests are rejected. |

`math-core.js` selects these models and `ss-tier.js` binds the two text models. `siddhanta-tier.js` supplies the current modern model. Historical VSOP/ELP modules remain for development and legacy regression checks; they are not the current three-choice selector's modern backend.

The home observatory, Panchang, museum, research engine and dashboard expose the three choices. The library presents text and executable examples. `siddhanta-panchanga.html` and `vedha.html` remain dedicated text/observation instruments: do not infer that every instrument switches all three models.

## What the evidence establishes

The models are distinct and their conventions are explicit. A text-faithful result and an observed-sky result measure different things. Neither source fidelity nor passing software tests establishes perfect physical accuracy at every epoch.

The Parameśvara correction adjusts Moon and node epochs, not every planetary parameter. Its historical fit contains interpretation uncertainty and does not improve every observation. Solar-eclipse correction currently holds chapter-5 parallax at the text model's value. Corrected-model visibility uses a middle-time perceptibility threshold and a horizon scan over contacts; it is an approximation to a fully resolved perceptible interval. These limits must accompany precision claims.

Modern benchmark agreement is reference- and date-dependent. The fitted series shares DE440s ancestry with its comparison data; agreement is not wholly independent validation. ΔT predictions, UTC/UT1 assumptions and fixed horizon/refraction conventions limit event-time claims. Modern dṛk must not be described as computation derived exclusively from Vedic numerical constants.

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


## Validation

`npm test` runs 58 registered suites, stopping on the first failure. Six suites are labelled legacy non-referee checks. The three-choice browser suite is now included. Browser checks require Playwright Chromium; see `package.json` and `RELEASE-VERIFICATION.md`. An additional transit oracle test exists at `scripts/transit-e2e.test.mjs` and requires the local server; it is not counted in the registered suite total.

On 9 October 2026, the unmodified PR #5 head `2de0c80` passed all 57 then-registered suites and all 23 separately run three-choice browser checks. The contact-accessor regression was subsequently fixed and checked separately; those baseline results are not a claim that the modified tree reran the entire suite.

## Source and release records

`SANKALP.md` records owner decisions and seals; preserve it append-only. `VEDHA-YANTRA-DESIGN-2026-10-07.md`, `corpus/parampara/`, the executable tests and `MATHEMATICAL-AUDIT.md` provide evidence and limitations. The public exporter is `scripts/export-public.cjs`; scan exported content before publishing. No claim of global priority or universal perfection is established by this repository.
