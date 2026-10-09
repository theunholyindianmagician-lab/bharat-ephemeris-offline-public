# corpus/parampara — the tradition's records as data

The owner, 2026-10-08: *"Do not make observation mandatory; India has observed for centuries — use those observations
as data (Āryabhaṭa, Bhāskara, the Kerala school, the Jantar Mantar, the instruments); add the Purāṇas and Upaniṣads from
which the time ladder and names were built."*

| file | format | what it holds | made by |
|---|---|---|---|
| `registry.json` | `parampara/1` | 59 records: dated observations, determinations, rules, doctrine and instrument operations of the tradition that a local text or e-text states, and the owner's attributions to texts that are not local | hand, from the verified research of 2026-10-08; `--stamp` writes each record's `sha256` |
| `samskara.json` | `parampara-samskara/1` | Parameśvara's saṃskāra: the correction the fit yields from the JM eclipse rows, its σ, the sensitivity to a man's height in padas, the leave-one-out test, and the label | `node scripts/parampara-samskara.cjs --write` (never by hand) |
| `graha.json` | `graha-names/1` | the grahas' naming layer from the BPHS: colours, deities, avatāras, iconography, mantra pratīkas, japa counts, time measures, seasons; the Navagraha Stotra as an owner-statement awaiting an edition | hand |
| `etext-lines.json` | `parampara-etext-lines/1` | only what the registries quote from the e-texts (never the e-texts), with each line's SHA-256 | `node scripts/parampara-samskara.cjs --etext-lines DIR` |
| `../sources/time-units.json` | `time-units/1` | every unit of time from the paramāṇu to Brahmā's life: the engine's ratio, each local attestation, the code's claimed loci, the owner's attributions, the other ladders and the conflicts | hand |

The fifteen eclipse records stay in `corpus/jyotirmimamsa/eclipses.json` and `readings.json`, which remain their single
source: each registry record of class `observation` points into them (`refs`), and the script refuses a row that no
record names, a pointer that resolves to no row, or a row named twice.

## The rules

* **Provenance.** Every record has a `source` named in `registry.sources`. A record that is not the owner's statement
  has a `locus` and at least one `quote`: the Sanskrit verbatim (`sa`) and the place it was read from (`from`):
  `etext:<file>:<line>` (an e-text kept outside the repository; the quoted lines are in `etext-lines.json`),
  `<repository file>:<line>`, or `corpus/bphs/<witness>.json#<chapter>.<verse>`. No modern translation is copied; where an
  edition's own figure is the datum it is marked as the editor's, and every restoration of the editor is listed under
  `editorial` with its footnote.
* **The owner's statements** (decision P2) are class `owner-statement`, source `owner`, status `awaiting edition`, tag
  `[owner-statement]`, never `[text]`. A locus is given only where a repository file gives one, and it says which file.
  No verse and no verse number is supplied; the record is upgraded to `[text]` when an edition is added to `corpus/`.
* **Tags** (`vocabulary.tags`): `[text]` stated by the source; `[reading]` this repository's reading of it; `[standard]`
  a convention no local text states; `[paramparā]` a historical record used as data; `[owner-statement]`; `[unverified]`;
  `[theorem]` exact arithmetic on the stated numbers; `[claim-only]` code or derived prose with no local source.
* **Status:** `row` (a row of a fit, or doctrine the engine follows), `gate` (a must-hold test elsewhere), `cross-check`,
  `excluded` (with `why`), `awaiting edition`.
* **Licence.** The Trivandrum editions of 1916 (Goladīpikā) and 1931 (Āryabhaṭīya with Nīlakaṇṭha's bhāṣya) are old
  public-domain editions: a quoted line of up to 300 characters is kept whole in `etext-lines.json`. The 1977
  Jyotirmīmāṃsā's apparatus (footnotes, restorations, English, printed figures) is the editor's: only the Sanskrit text
  and the numbers it states are taken, cited by page and line, and only the quoted excerpts are kept.
* **Digests.** Each record's `sha256` is SHA-256 of the canonical JSON of the record without that field
  (`vedha-lekha.js` `sha256` and `canonical`). After editing a record run `node scripts/parampara-samskara.cjs --stamp`.
* **Jantar Mantar.** No observational datum of Sawai Jai Singh's observatories (no obliquity, latitude, star place, table
  or instrument dimension) is in any repository or e-text; the registry records the gap (`JANTAR-MANTAR-gap`) and
  `yantra.js` builds the instruments' geometry from the sphere. No value is invented.

## Interface for Stage B

`parampara.js` (UMD: `window.Parampara` in the browser, `require('./parampara.js')` in Node; imports nothing, no
trigonometry, no network) loads the parsed files and refuses any that break the rules above:

```js
const P = Parampara.load({ registry, samskara, timeUnits, graha, etextLines });   // all but registry optional
// Node: require('./scripts/parampara-samskara.cjs').loadParampara() reads every file

P.samskaraParameshvara()
// → { epochKali, moonArcmin, nodeArcmin, sigma: { moon, node }, padas, records, label, source, … }
```

| field | value (re-measured 2026-10-08) | meaning |
|---|---|---|
| `epochKali` | 1652000 (`julian` "1422-01-23", `vara` śukravāra) | the epoch of the correction, a Kali civil day (integer arithmetic, kala-dvara.js) |
| `moonArcmin` | −8.37 | the Moon's mean place minus the text's, in minutes of arc, at the epoch |
| `nodeArcmin` | −73.54 | the same for the node (Rāhu) |
| `sigma` | `{ moon: 1.04, node: 6.72 }` | one standard error of each, arcmin |
| `padas` | 7 | a man's height in his own padas, the reading of the shadow records `[unverified]`; `sensitivity` gives 6.5 and 7.5 |
| `records` | the registry ids of the rows used | SDip-69 … SDip-85b; `setAside` names any the robust fit set aside (SDip-81 at 4.3σ) |
| `label` | "Sūrya-Siddhānta + Parameśvara's saṃskāra" (`labelSa` सूर्य-सिद्धान्त + परमेश्वर-संस्कार) | the choice's exact wording |
| `default` | `true` | owner, 2026-10-08 (decision a): the primary default of the text tier |
| `choices` | `[{ id: "ss+parameshvara", default: true }, { id: "ss", label: "Sūrya-Siddhānta", default: false }]` | the plain text is the secondary labelled choice, exactly the text |
| `corrects` | `["moon", "node", "ayanamsha"]` | nothing else is moved: the Sun, the apogee and every rate stay the text's |
| `ayanamsha` / `ayanamshaPhaseDeg` / `ayanamshaAmplitudeDeg` | `{ records: [ABH-no-ayanacalana-3600 (0° in Kali 3600), NIL-ayanamsha-rate (14°26′), PAR-ayanamsha-4536 (15°)], phaseDeg: 0.001, amplitudeDeg: 1.8613, amplitudeTotalDeg: 28.8613, rateArcsecPerYear: 57.72, residuals 0, −0.5, +0.5′, alternatives: { phaseOnly, amplitudeOnly }, statedRate, … }` | 2026-10-09 (revised the same afternoon): the text's libration fitted by least squares to the paramparā's three determinations on its phase and its greatest value; Āryabhaṭa's zero stands and the swing widens; not fitted with the eclipses (they do not see the ayanāṃśa); the single-record readings kept beside it |
| `leaveOneOut` | mean \|text − record\| 1.08 → 0.67 ghaṭikā; 5 of 6 contacts improve | each timed eclipse held out whole and predicted by the rest |
| `source` | registry → readings.json → `scripts/parampara-samskara.cjs` → `samskara.json`, with input digests | where every number comes from |

How Stage B applies it: the text's model with `moon.epoch` and `node.epoch` moved by `moonArcmin` and `nodeArcmin` at
`epochKali` and carried at the text's own rates, and the libration's phase moved by `ayanamshaPhaseDeg` — exactly `samskara.js`
`model({ "moon.epoch": moonArcmin, "node.epoch": nodeArcmin, "ayanamsha.phase": ayanamshaPhaseDeg }, { epoch: epochKali })`
(`ss-tier.js` applies the phase through `sphuta.js ayanamshaSS(spandas, phaseDeg)`). The record is generated, never typed: `parampara.test.js` re-runs the
fit and fails if `samskara.json` differs by a byte; in Node, `P.samskaraParameshvara({ fit: require('./scripts/parampara-samskara.cjs').result })`
computes it afresh. The correction stays the default only while its leave-one-out test improves on the plain text
(`offered` and `default` are both that test).

The third choice, "Modern Bhāratīya (dṛk)" (owner, 2026-10-08, decision b), is built from the owner's own dṛk derivations
by another stage and is not part of this corpus. The fourth, "Kerala paramparā (Parahita + Dṛggaṇita)" (owner, 2026-10-09), reads
this registry's `NIL-ayanamsha-rate`, `PAR-ayanamsha-4536`, `ABH-apsides-G9`, `PAR-epoch-1651700` and `PAR-fractions` through
`P.record(id)` in `ss-tier.js keralaCorrection()`, with the mean places of `parahita-madhyama.js`.

Other accessors: `P.records({ class, observer, status, tag, source })`, `P.record(id)`, `P.sites`, `P.timeUnits.unit(id)`,
`P.timeUnits.spandasOf(id)`, `P.timeUnits.canonical | ladders | conflicts`, `P.graha.layer(name)`, `P.graha.of(graha)`.

## Scripts

```
node scripts/parampara-samskara.cjs              the fit for 7 padas and its sensitivity to 6.5 and 7.5
node scripts/parampara-samskara.cjs --write      regenerate samskara.json; --check says whether it is current
node scripts/parampara-samskara.cjs --stamp      write every registry record's sha256
node scripts/parampara-samskara.cjs --etext-lines DIR    copy the quoted e-text lines (DIR holds jm/mulam.md, jm/abh2.md,
                                                         jm/goladipika.md); --verify-etext DIR checks them
```

`parampara.test.js` checks all of it; with `PARAMPARA_ETEXT_DIR=DIR` it also re-reads each quoted line from the e-texts.
