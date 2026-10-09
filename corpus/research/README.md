# corpus/research — the research page's data

Two generated files, read by `ganita-shala.html` (गणित-शाला) and precached by `sw.js`; neither is typed by hand.

- **`parampara-apply.json`** — `node scripts/parampara-apply.cjs --write`. Every applicable record of `corpus/parampara/registry.json` applied as a model of `samskara.js` or `parahita-madhyama.js` and scored against the Modern Bhāratīya (dṛk) tier in the tropical frame over 2026 (every 5 days) and 1900–2100 (every 97 days): candidate minus sky, arcminutes (mean, rms, max) for the Sun, the Moon, the elongation and the ayanāṃśa against Citrā-pakṣa. The candidates and what was adopted are named in the file (design doc §24.2–24.3).
- **`derivations.json`** — the derivations ledger: one entry per derivation of the engine with the text it starts from, its method, and the figures its tests assert, each figure copied from the named file and kept only when found there verbatim (or, for a data file, its values found in it); `figuresNotFoundVerbatim` would list any that were not. Thirty-one entries were extracted by one reader per derivation (2026-10-09), five of the same day were written by hand from their tests; `notYetInLedger` lists what the design document describes that no entry covers yet.

Both carry their `generatedBy`. A figure on the page is never retyped from memory: it is this data or a live computation.
