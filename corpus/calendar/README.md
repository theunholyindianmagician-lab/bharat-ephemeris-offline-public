# The 100,000-year calendar of the Sūrya-Siddhānta

`scripts/calendar-100k.cjs` computes a lunisolar calendar for every Kali year whose span meets the proleptic Gregorian
dates −50000-01-01 … 50000-12-31. That is Kali years **−46,897 … 53,099, 99,997 years**. It uses the sovereign modules
only: `kala-dvara.js`, `sphuta.js`, `panchanga.js`, `ss-graha.js` and `ss-ahargana.js`, with `dhruva.js` and
`ss-udaya.js` under `panchanga.js`, and for the default tier `ss-tier.js` with `parampara.js` and the paramparā record
(`corpus/parampara/samskara.json`). No modern ephemeris, no ΔT and no library trigonometry enter a year record. The third
choice, Modern Bhāratīya (dṛk), is not generated, because it refuses dates outside 1850.0 … 2150.0.

Each year comes from `SSAhargana.yearOfKali(k, Panchanga)`, the same function a page's year panel calls, so the generator
and the page share one implementation. This directory holds only the manifest. The year records (the shards) are written
outside the repository and are not committed. The manifest records their hashes.

## Which calendar: the tier

The generator builds the calendar of one named tier, given with `--tier`. The owner's decision of 2026-10-08 sets the
choices:

| choice | tier | generated here |
|---|---|---|
| **Sūrya-Siddhānta + Parameśvara's saṃskāra**: the default. The saṃskāra moves only what the paramparā record names (today the Moon and the node). | `ss+parameshvara` (`ss-parameshvara` and `ss parameshvara` are accepted; the default of `--tier`) | **yes: `manifest-100k-ss-parameshvara.json`** |
| Sūrya-Siddhānta (plain text): the secondary, labelled choice | `ss` (`classical` is accepted for it) | **yes: `manifest-100k.json`** |
| **Kerala paramparā (Parahita + Dṛggaṇita)**: the third text choice (owner, 2026-10-09). The mean Sun, Moon, apogee and node of parahita-madhyama.js with Parameśvara's fractions, the text's equations on them; the planets the text's. | `kerala` (`kerala-parampara`, `parahita`, `drgganita` accepted) | **yes: `manifest-100k-kerala.json`** |
| Modern Bhāratīya (dṛk), from the owner's own dṛk derivations | `drik` | no (it refuses outside 1850.0 … 2150.0) |

**`manifest-100k-ss-parameshvara.json` is the default tier's calendar** (`"tier": "ss+parameshvara"`). Its places are
`ss-tier.js`'s (`SSTier.calendar({ samskara: 'parameshvara' })`, the same code `math-core.js` and the pages use): the
text's model with the record's mean-place shifts at its epoch, carried at the text's own rates, so the shift is the same
at every instant [theorem: no rate is changed]. The record is read through `parampara.js` and is never typed in the
generator; the manifest copies it (`samskara`) and the sha256 of `ss-tier.js`, `parampara.js` and the two record files.
The Sun, the planets, mean Jupiter (the saṃvatsara) and every rate are the text's, so the saṅkrāntis are the same in both
calendars and the new moons are later by the Moon's shift over the elongation rate (16.4–16.6 minutes for the record's
present Moon shift [measured on the 109 sampled years, deep-time.test.js]); now and then that moves a month's name or the year's start.

**`manifest-100k.json` is the plain Sūrya-Siddhānta's calendar** (`"tier": "ss"`), the secondary choice.

**`manifest-100k-kerala.json` is the Kerala paramparā's calendar** (`"tier": "kerala"`, 2026-10-09): `SSTier.calendar({ samskara: 'kerala' })`,
the Parahita + Dṛggaṇita mean places (exact, `parahita-madhyama.js`, counted from sunrise at Laṅkā) with the text's equations. Its Sun
differs from the text's, so its saṅkrāntis move, and its Moon, so its new moons; mean Jupiter and every rule are the text's. Measured on the
109 sampled years: the first year opens −50001-12-18, the last 50000-05-26 (the text's tiers: −12-20 and −05-24); 2028-29 ends with
Phālguna, not an adhika Caitra. The manifest records the sha256 of `ss-tier.js`, `parahita-madhyama.js`, `parampara.js` and the registry.

Any other tier is refused with an explanation; `calibrated` was retired on 2026-10-08.

## Running it

```
node scripts/calendar-100k.cjs --workers 4 --write-manifest --out <a directory outside the repository>   # the default tier
node scripts/calendar-100k.cjs --tier ss --workers 4 --write-manifest --out <another directory>          # the plain text
node scripts/calendar-100k.cjs --tier ss --verify       # recompute 3 random shards in memory, compare with the manifest
node scripts/calendar-100k.cjs --tier ss --from-year 1900 --to-year 2100 --out <dir>   # part of the span, no manifest
```

- `--tier ID`: `ss+parameshvara` (the default) or `ss` (see above).
- `--out DIR`: where the shards go. The default is `calendar-100k-out/<tier>` in the system's temporary directory. A
  directory inside the repository is refused, so the shards cannot be committed by accident.
- `--workers N`: the number of worker threads. The default is the number of CPUs.
- `--days`: also writes one row per civil day (`day_kali_<from>_<to>.ndjson.gz`). Each row holds the sunrise at Ujjayinī
  (latitude 23.1765°, on the prime meridian), the vāra, and tithi, nakṣatra, yoga and karaṇa at sunrise. Off by default.
  Sunrise uses the library's trigonometry, so these hashes are valid for one Node version only (see Determinism).
- `--write-manifest`: writes the tier's manifest (`manifest-100k-ss-parameshvara.json` for the default,
  `manifest-100k.json` for `ss`, in `corpus/calendar/`), for the full span only. The manifest records the tier, basenames only and no absolute path.
- The run exits with status 1 on any failed invariant, exception or non-finite value, or when a year takes more than 30 s
  (a watchdog on the worker threads).

## The records

The shards are gzip files of NDJSON, `kali_<from>_<to>.ndjson.gz`, each holding up to 1,000 Kali years. They are aligned to
multiples of 1,000, so there are 101 shards. Each line is one year, with the keys in this order:

| key | meaning |
|---|---|
| `k` | Kali years gone at the year's start (the nija Caitra new moon) |
| `shaka`, `vikrama` | k − 3179 and k − 3044 [standard] |
| `yearStartRule` | which new moon opens the year (see Conventions) |
| `start` | `{ t, gregorian, julian, vara }` for the nija Caitra new moon |
| `end` | `{ t }`, the next year's start |
| `mesha` | `{ t, gregorian }` for the Meṣa saṅkrānti (SS 14.10) |
| `samvatsara` | `{ atStart: { name, prabhavaIndex, vijayaIndex }, changes: [{ t, name }], reading: "A" }` by SS 1.55 |
| `yearLord` | the SS 1.52 lord of the 360-day year current on the start's Kali day |
| `months` | `[{ name, adhika, kshaya, kshayaDropped, start, gregorian, end, fullMoonNakshatra, marginMinutes }]`, 12 or 13 |
| `sankrantis` | `[{ rashi, t, gregorian }]`, the year's twelve, Meṣa first |
| `counts` | `{ months, adhika, kshaya }` |

- `t` is in civil days since the Kali epoch, counted from midnight at Laṅkā (SS 1.45-1.47). It is rounded to 1e-6 day
  (0.09 s) with `toFixed` in the file. The invariants are checked on the unrounded values.
- `gregorian` and `julian` are the civil dates of the Kali day that holds the instant. The day is reckoned from midnight
  at the Laṅkā–Ujjayinī meridian, in proleptic calendars with astronomical year numbers (0 = 1 BCE, −50000 = 50001 BCE).
- `vara` is that Kali day's weekday, by the midnight count of SS 1.50-1.51. The sunrise vāra of a place is a page's
  matter (`Panchanga.civilDayOf`).
- `marginMinutes` is the distance, in minutes, from the month's start or end to the nearest saṅkrānti. It shows how
  close the month's name is to changing: Kali 5129 (2028-29) has a kṣaya month that rests on a saṅkrānti 19 minutes
  after the new moon.

## Invariants (each year, then between years)

1. `Math.round(4,320,000 × start ÷ 1,577,917,828) === k`, and k steps by 1 from one line to the next.
2. Each year starts exactly where the previous one ends (`start(k+1) === end(k)`, the same double).
3. There are 12 saṅkrāntis in rāśi order, Meṣa … Mīna, strictly increasing, all in [start, end).
4. There are 12 or 13 contiguous months. The first is the nija Caitra (not adhika).
5. A month is adhika exactly when it holds no saṅkrānti, and kṣaya exactly when it holds two or more. The names run
   Caitra … Phālguna, with exactly the repeat or skip that the flags imply. An adhika month takes the next month's name.
   So a year may end with an adhika Caitra after Phālguna, and that is the only adhika month allowed to end a year.
   Kali 5129 (2028-29) and 5064 (1963-64) end this way.
6. Every month lasts between 29 and 30 days.
7. Every start, month and saṅkrānti date converts back in both calendars (kala-dvara.js), and the vāra steps with the Kali
   day (Δvāra ≡ ΔN mod 7).
8. The saṃvatsara index moves on by exactly one (mod 60) at each mean-Jupiter sign change. The changes are 1,577,917,828 ÷
   (364,220 × 12) = 361.0267 days apart [theorem]. The name carries over from one year to the next.
9. No value is NaN or infinite, no year throws, and no year hangs.

Global check: Σadhika − Σkṣaya over the span is compared with the text's mean rate of 1,593,336 ÷ 4,320,000 adhimāsas a
year (SS 1.37-1.39). A difference of more than 2 months fails the run. The manifest also records the smallest and
largest month length and saṅkrānti interval.

## Conventions, with their status

- **Year start** [unverified convention]: the new moon that begins the amānta month holding the Meṣa saṅkrānti (the nija
  Caitra). When two months are named Caitra, the adhika one closes the previous year. No local text says which Caitra
  opens the year.
- **Month names** [standard rule; no local text]: the month that holds the Meṣa saṅkrānti is Caitra, and so on. A month
  with no saṅkrānti is adhika and takes the next month's name. A month with two is kṣaya, and the second name is
  dropped. SS 14.15-14.16 names months by the full-moon nakṣatra; that nakṣatra is recorded beside each month
  (`fullMoonNakshatra`) and is not used for the name.
- **Saṃvatsara** [reading A of SS 1.55]: (12 × mean Jupiter's revolutions since creation + its signs gone) mod 60, with
  remainder 0 = Vijaya. The other 59 names are the standard list, Prabhava first [standard]. Reading B (remainder 1 =
  Vijaya) is one name earlier and is available as `SSGraha.samvatsara(days, { zero: 1 })`. `samvatsaraSkips` in the
  manifest counts the years that hold two changes; in those years one name is current at no year start.

## Why Caitra drifts against the Gregorian calendar

The text's year is sidereal: 1,577,917,828 ÷ 4,320,000 = 365.2587565 days. The Gregorian year is 365.2425 days. The text's
year is longer by about one day in 61.5 years, or about 2.1 years over the whole span, so the Meṣa saṅkrānti and the
Caitra new moon move later through the Gregorian year. The year that holds −50000-01-01 starts on −50001-12-20. The last
year of the span starts in May 50000 [measured]. This is how the text's calendar behaves, not an error.

## Determinism and verification

- A shard's `sha256` is taken over the uncompressed UTF-8 text: the year lines joined by `\n`, with a final `\n`. gzip
  output can differ between zlib versions without changing the hash.
- `--verify` recomputes three randomly chosen shards in memory and compares their hashes with the manifest. This shows
  that reruns are reproducible on one Node version.
- The year records use only +, −, ×, ÷, `Math.floor`, `Math.ceil`, `Math.round`, `Math.abs`, `Math.min`, `Math.max`,
  BigInt and `toFixed`. The text's sine is computed by those operations (Mādhava's polynomial, the default, or the SS
  table). This was measured by wrapping every `Math` function while five years were built and checked (Kali −46,897,
  0, 5127, 5129 and 53,099). The only other call was one `Math.asin`, made once when `dhruva.js` loads, for the text's
  obliquity constant. The year records do not use that constant (it serves sunrise and the lagna). ECMAScript
  specifies every one of these operations exactly, so the hashes should be identical on other engines [reasoning].
  **This has not been measured.** The manifest records the Node version, the sine and the sha256 of each module.
- `deep-time.test.js` rebuilds 109 sampled years of each tier with the generator's own `buildYear` and `checkYear`. It
  checks that each year line hashes to `sampleHashes[k]` in that tier's manifest. This ties the test to the full runs,
  and it fails if any module change alters a year. It is part of `npm test`.

## Measured

The run that wrote each manifest recorded its runtime, its worker count and the cost per year (`runtimeSeconds`,
`workers`, `msPerYearPerWorker`). It also recorded the counts of months, adhika, kṣaya and 13-month years, and the
extreme month lengths and saṅkrānti intervals. See the manifest for those numbers; they are not repeated here, so they
cannot drift from it.
