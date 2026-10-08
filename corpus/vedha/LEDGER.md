# वेध-लेख — the owner's observation ledger (format `vedha-lekha/1`)

`vedha-lekha.js` keeps the owner's observations as a ledger that can only grow, certifies it, and reduces it beside
what the Sūrya-Siddhānta predicts. It is the vedha and the antara of the loop *gaṇita → vedha → antara → saṃskāra →
parīkṣā* (VEDHA-YANTRA-DESIGN-2026-10-07.md §0.2, §4.5, slice 7). The shadow records keep the format of
[README.md](README.md) (`vedha-chaya/1`), which this file does not change; the ledger carries them and hands them to
`ss-chaya.js`.

There are **no observations here yet**. The test (`vedha-lekha.test.js`) builds a season of synthetic records from the
text's own forward model, seals it, certifies it and reduces it back; those records say `"synthetic": true` and name
their generator, and they live only in the test. A synthetic record must never be stored here as if it were an
observation, and the certifier refuses every one of them unless the caller asks for synthetic records by name.

## The file

```json
{
  "format": "vedha-lekha/1",
  "site": { "name": "<text>", "deshantara": <degrees east>, "palabha": <aṅgula> },
  "shanku": <height of the gnomon, if not 12>,
  "entries": [ <entry>, … ],
  "seal": { "n": …, "head": "…", "at": …, "hash": "…" }
}
```

`site` and `shanku` are as in README.md: `site.palabha` (aṅgula), or `site.latitude` (degrees, from the dhruva,
`dhruva.js`), and `site.deshantara` (degrees east of the Laṅkā–Ujjayinī meridian).

### An entry

| field | meaning |
|---|---|
| `seq` | 1, 2, 3, … with no gap |
| `prev` | the `sealedHash` of the entry before; for the first entry, the hash of the header `{ format, site, shanku }` — so the site cannot be changed afterwards either |
| `at` | the Kali day (civil days since the Kali epoch, `kala-dvara.js`) on which the entry was written; never smaller than the entry before |
| `record` | one record (below) |
| `sealedHash` | SHA-256 of the canonical JSON of `{ seq, prev, at, record }` |

### The seal

`seal(ledger)` closes a ledger: `n` (the number of entries), `head` (the last `sealedHash`), `at` (the Kali day of
sealing) and `hash` = SHA-256 of the canonical JSON of `{ format, genesis, n, head, at }`, where `genesis` is the hash of
the header. A sealed ledger takes no more entries; a new season starts a new ledger.

**Write the seal's `hash` down somewhere else** — in the notebook, or with the next observer. The chain catches a
changed, reordered, inserted or deleted entry; but someone who rewrites every hash after a change makes a chain that
holds. Only a seal kept apart catches that.

### Hashing

Canonical JSON: object keys sorted, no white space, numbers as JavaScript prints them, `undefined` members dropped;
only strings, finite numbers, true/false, null, lists and plain objects. SHA-256 is written out in `vedha-lekha.js`
itself (its constants derived as integer square and cube roots of the first primes), and is checked against the
published test vectors: the empty string, `abc`, the 448-bit and 896-bit messages, and a million `a`.

## The records

Every record has an `id` (unique in the ledger) and a `kind`, and may carry `observer` and `note` (text). A generated
record has `"synthetic": true` and a `generator` saying what made it; a `generator` without `synthetic` is refused too.
An observation may carry `ganita`: the id of a prediction written earlier in the same ledger (below).

### The five kinds of README.md

`madhyahna`, `vishuvat`, `ayananta`, `ishta`, `kapala` — exactly as in [README.md](README.md), checked by
`ss-chaya.js`'s own `validate` and reduced by its `reduce`. The `kapala` records (the bowl between two transits of one
star) also calibrate every bowl count of the kinds below.

### Time, for the kinds below

A bowl count `kapala` is `{ "ghati", "vinadi", "prana" }` **from sunrise**, the first sinking started at sunrise, in
nāḍīs of the turn (SS 1.11-1.12, 13.23): 6 prāṇa = 1 vināḍī, 60 vināḍī = 1 ghaṭī, 60 ghaṭī = one turn. With
`"calibration": "savana"` it is a bowl that sinks 60 times sunrise to sunrise; the default `"nakshatra"` is the bowl of
the `kapala` records. Sunrise is the instant the true Sun's hour angle is minus its half-day (2.61-2.63), the hour
angle being the meridian's asus less the Sun's own ascension (3.42 at its point, `ss-udaya.js`) — the sunrise
`ss-grahana.js`'s clock counts from and `ss-chaya.js`'s shadow clock reads as half-day ∓ nata. Counts here are asus of
the **turn**, as `ss-grahana.js`'s `clock().ghatiAfterSunrise` now counts too (its `sunGhatiAfterSunrise` is the Sun's
own asus, about 7 vināḍī less at 55 ghaṭī, and is not a bowl count). `vedha.html` writes these records for you. The `day` is `{ "kali": N }` or `{ "calendar", "year", "month", "day" }`; for a night event it is the civil day of
the sunrise before it (Jyotirmīmāṃsā p.36).

### `yamyottara` — a star on the meridian (SS 1.12, 2.58, 2.63, 3.42; 12.72-12.73)

| field | | meaning |
|---|---|---|
| `day` | required | the civil day of the sunrise before the transit |
| `star` | required | its name; a junction star of ch.8 (`corpus/surya-siddhanta/yogatara.json`) gets the text's prediction |
| `transit` | optional | `"upper"` (default) or `"lower"` (a circumpolar star below the dhruva) |
| `kapala` | one of these two | the bowl's count from sunrise at the moment the star crossed the plumb-line |
| `unnata` | one of these two | its meridian altitude `{ "amsha", "kala", "vikala" }` (degrees, minutes, seconds of arc), as the instrument read it |
| `disha` | with `unnata` | `"N"` or `"S"`: the horizon the altitude is read from; a lower transit is always `"N"` |
| `calibration` | optional | `"nakshatra"` (default) or `"savana"` |

One return of a star to the meridian is one turn (1.12): the test checks that the text's model gives 21,600 asus of the
turn between two transits of one star, to a thousandth of an asu.

### `grahana` — an eclipse contact (SS 4.16-4.17; 3.37-3.39)

| field | | meaning |
|---|---|---|
| `day` | required | the civil day of the sunrise before the contact |
| `body` | required | `"candra"` (the Moon) or `"surya"` (the Sun) |
| `contact` | required | `sparsha` (first contact), `nimilana` (totality begins), `madhya` (the middle), `unmilana` (totality ends), `moksha` (last contact), as words: `"sparsha"` … |
| `kapala` | one of these | the bowl's count from sunrise |
| `chaya`, `side` | one of these, Sun only | the śaṅku's shadow (aṅgula) at the contact and `"purva"` (forenoon) or `"pashcima"`: the shadow clock of 3.37-3.39 |
| `calibration` | optional | as above |

### `candra-darshana` — the crescent seen or not (SS 10.1, 9.5, 7.8-7.10)

| field | | meaning |
|---|---|---|
| `day` | required | the civil day of the evening (or morning) |
| `horizon` | optional | `"pashcima"` (default: the first crescent in the west after sunset) or `"purva"` (the last, in the east before sunrise) |
| `seen` | required | `true` or `false` |

Record the evenings on which the Moon was looked for and **not** seen as well: only the pair tells where the sky's limit
lies.

### `candra-yoga` — the Moon on a junction star (SS 8.14-8.15, 7.10)

| field | | meaning |
|---|---|---|
| `day` | required | the civil day of the sunrise before |
| `star` | required | the junction star |
| `kapala` | required | the bowl's count from sunrise when the Moon's centre stood on the star's circle through the dhruva |
| `calibration` | optional | as above |

### `ganita` — the prediction, written first (design §4.5, step 1)

| field | | meaning |
|---|---|---|
| `day` | required | the day it predicts; never before the day it is written (`at`) |
| `for` | required | the kind of observation it predicts |
| `model` | required | text naming the model and its options |
| `values` | required | the predicted values: numbers, words, true/false, or readings in the owner's units (a bowl count, an aṅgula, an arc) |

An observation with `ganita` must come after that prediction in the ledger, and be of the kind it is `for`.

### `yantra` — a reading of one of the owner's instruments (`yantra.js`)

The śaṅku's readings are the shadow kinds above, the bowl's are `kapala`, and a star read on the meridian wall or the
altitude ring is a `yamyottara` with its `unnata` and `disha`. Every other instrument reading is a `yantra` record, written
in the instrument's own graduation, never as a modern coordinate.

| field | | meaning |
|---|---|---|
| `day` | required | the civil day (of the sunrise before, for a night reading) |
| `yantra` | required | the instrument: `samrat`, `nadivalaya`, `jaya-prakasha`, `kapala-yantra`, `rama`, `digamsha`, `shashthamsha`, `dakshinottara-bhitti`, `rashivalaya`, `unnatamsha` |
| `body` | required | `"surya"`, or a junction star's name (it then gets the text's place from the catalogue) |
| `reading` | required | what the graduation showed (below) |
| `kapala` | optional | the bowl's count from sunrise at the reading: the instant the text is compared at |
| `calibration` | optional | as above |

The `reading` holds only these, each instrument the ones it reads (yantra.js `READING`):
`nata` (`{ ghati, vinadi, prana }` from the meridian) with `side` (`"purva"` east of the meridian, `"pashcima"` west);
`kranti` (`{ amsha, kala, vikala }`) with `gola` (`"uttara"` north, `"dakshina"` south); `gola` alone for the
nāḍīvalaya (the face that is lit); `unnata` (the altitude); `digamsha` (the azimuth from the north point through the
east, below 360°); `natamsha` (the zenith distance) with `disha` (`"N"` or `"S"`, the horizon it is read from); `rashi`
(0 Meṣa … 11 Mīna) with `sphuta` (the Sun's sāyana longitude off that sign's quadrant). Without a bowl count the instant
is the meridian (the wall, the ṣaṣṭhāṃśa, a ring read with a `disha`), the sign's culmination (the rāśivalaya), or the
reading's own nata, altitude and side, or azimuth; the quantity that fixes the instant then has no antara of its own.
`reduce` gives each reading's quantities, the text's beside them at that instant, and the antara (asus; kalā).

## What the certifier refuses

`certify(ledger or file, { allowSynthetic })` returns `{ ok, reasons, records }`, the records only when nothing is
refused. Each reason says where and why. It refuses:

- any field outside the schema above (and outside README.md's for the shadow kinds);
- a field of a modern clock or time stamp (UTC style: `utc`, `timestamp`, `date`, `hours`, …), a Julian day (`jd`,
  `mjd`, …), an equatorial or horizontal coordinate (RA/Dec style: `ra`, `dec`, `azimuth`, `altitude`, …), a geodetic
  datum (WGS84 style: `wgs84`, `lat`, `lon`, `height`, …), or an ephemeris or rotation correction — each named for what
  it is, wherever it stands in the file;
- any text that names a modern source or standard — the names the frame gate of `kala-dvara.test.js` forbids, in any
  case, and the acronyms and product names listed in `vedha-lekha.js` (`MODERN_ACRONYMS`, `MODERN_PRODUCTS`) — or carries a
  modern time stamp (a date with a clock time, or a clock time with a zone);
- an entry out of order: `seq` with a gap, `at` going back, or a record of a day after the day it was written;
- a broken chain: an entry that does not match its hash, does not hang from the one before, or a first entry that does
  not hang from the header; a seal that does not match;
- a `ganita` written after the day it predicts, or cited by an observation written before it;
- the same `id` twice;
- every synthetic record unless `allowSynthetic` is given, and a synthetic record without its `generator` always.

## What `reduce` gives

`reduce(ledger, { allowSynthetic, catalogue })` certifies first and throws if anything is refused. Every derived number
is `[measured]`, with the text's prediction beside it and the antara (observed − text).

| Kind | Measured | The text's | Antara |
|---|---|---|---|
| shadow kinds | `ss-chaya.js`'s reduction, unchanged | — | — |
| `kapala` | the bowl's rate and drift; every bowl count below is corrected by it | 60 ghaṭī a turn | drift in ghaṭī |
| `yamyottara` | asus of the turn from sunrise; the altitude | the star's own ascension against the meridian (3.42 at its dhruvaka) and its declination (2.58, 2.63) | asus, vināḍī; altitude in kalā |
| two stars, one night | the interval between their transits — sunrise and the Sun cancel | the difference of their ascensions | asus |
| one star, both transits | the dhruva's elevation and the star's distance from it (`dhruva.js`, exact in vikalā) | the site's latitude | kalā |
| `grahana` | asus of the turn from sunrise, by the bowl or by the shadow | `ss-grahana.js`'s contact | asus, vināḍī; with both contacts, the middle and the length |
| a lunar eclipse, both contacts | the deśāntara that puts the text's middle where it was seen (SS 1.60-1.65) | `site.deshantara` | degrees (the text's own lunar error is inside it) |
| `candra-darshana` | seen or not | the kālāṃśa at the text's sunset (or sunrise) and its verdict at twelve | agree or not; the kālāṃśa the sky's limit lies between |
| `candra-yoga` | asus of the turn from sunrise | the instant the text's Moon reaches the dhruvaka | asus, vināḍī, and the Moon's place in kalā by Jyotirmīmāṃsā §14 (prāṇas × the Moon's motion in a turn ÷ 21,600) |
| `yantra` | the reading's nata, declination, altitude, azimuth, zenith distance or longitude | the text's Sun (or star) at the instant the bowl or the reading fixes (`yantra.js`) | asus; kalā; the gola and disha agree or not |
| `ganita` | — | the sealed values, with the entries that cite them | written first or not |

Two things the reduction reports and does not remove:
- the text's yoga of ch.8 has no lambana, so the Moon's parallax is inside a `candra-yoga` antara;
- a bowl started at the first gleam starts early by the refraction and the half-disc (README.md, "unverified: outside
  estimate"); every count from sunrise carries that until the owner measures it — the pair of stars on one night, the
  middle of an eclipse and the bowl's own calibration are free of it.
