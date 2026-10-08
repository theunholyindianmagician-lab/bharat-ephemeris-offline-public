# वेध — the owner's shadow record (format `vedha-chaya/1`)

This folder holds the owner's own observations with the śaṅku (gnomon) and the kapāla (water-clock), and nothing else.
`ss-chaya.js` reads them (`SSChaya.validate(file)`, `SSChaya.reduce(file, opts)`) and turns them into what the
Sūrya-Siddhānta's chapter 3 says a shadow tells: the palabhā and the latitude, the Sun's declination, the shadow-Sun
(chāyārka), the observed ayanāṃśa (3.11-3.12), the mean Sun (3.20), and the clock's agreement with the shadow (3.37-3.39).
Every derived number carries the tag `[measured]`.

There are **no observations here yet**. The test (`ss-chaya.test.js`) makes synthetic records from the module's own
forward model and reduces them back; those records say `"synthetic": true` and name their generator, and they live only
in the test. A synthetic record must never be stored here as if it were an observation.

The whole season's record — star transits, eclipse contacts, crescents, the Moon on a junction star, and the
predictions written first — goes in the sealed ledger of [LEDGER.md](LEDGER.md) (format `vedha-lekha/1`, `vedha-lekha.js`),
which carries these shadow records unchanged.

## Units — the owner's, and only the owner's

| Quantity | Unit | Source |
|---|---|---|
| shadow, palabhā, bhuja | aṅgula of the 12-aṅgula gnomon: a number, or `{ "angula": 2, "vyangula": 18 }` with 60 vyaṅgula to the aṅgula | SS 3.2 (twelve by convention, *kalpanāt*); the vyaṅgula is attested in Jyotirmīmāṃsā p.36 (Parameśvara's *duṣkarā* = 2 aṅgula 18 vyaṅgula) |
| a gnomon of another height | top-level `"shanku"`: its height in the same units as the shadows; shadows are rescaled to 12 | SS 3.1 (*śaṅkvaṅgulair iṣṭaiḥ*) |
| time | the kapāla's count `{ "ghati", "vinadi", "prana" }`: 6 prāṇa (asu) = 1 vināḍī, 60 vināḍī = 1 ghaṭī | SS 1.11; the bowl sinks 60 times a turn of the star-wheel (1.12, 13.23) |
| the day | `{ "kali": N }` (civil days since the Kali epoch) or `{ "calendar": "gregorian" \| "julian", "year", "month", "day" }` | `kala-dvara.js` |
| the place | `site.palabha` (aṅgula), or `site.latitude` (degrees, from the dhruva, `dhruva.js`), and `site.deshantara` (degrees east of the Laṅkā–Ujjayinī meridian) | SS 3.12-3.17; deśāntara from a timed lunar eclipse, 1.60-1.65 |

No other field is accepted: a clock time of any modern standard, an equatorial coordinate, a satellite position, a
geodetic datum, or a value taken from any modern table is refused by `validate`, because the file takes only the fields
listed below. The record holds what the instrument showed, not what something else computed.

## The file

```json
{
  "format": "vedha-chaya/1",
  "site": { "name": "<text>", "deshantara": <degrees>, "palabha": <aṅgula> },
  "shanku": <height of the gnomon, if not 12>,
  "records": [ <record>, … ]
}
```

`site` needs one of `palabha` or `latitude`, or else at least one `vishuvat` record (below) from which the palabhā is taken.
Every record has an `id` (unique), a `kind`, and may carry `observer` and `note`. A generated record has
`"synthetic": true` and a `generator` saying what made it.

### `madhyahna` — the noon shadow (SS 3.14-3.20)

| field | | meaning |
|---|---|---|
| `day` | required | the civil day |
| `chaya` | required | the shadow when it lies on the north-south line (3.25: at noon the bhuja is the shadow) |
| `dir` | required | `"N"` or `"S"`: where the shadow points |
| `ayana` | optional | `"uttara"` if the noon Sun is moving north (noon shadows shortening at a place north of the tropic), `"dakshina"` if south. 3.19 needs it: the shadow gives the declination, and the declination alone cannot tell λ from 180° − λ. Without it, `reduce` takes the candidate nearer the text's own Sun and says so. |

### `vishuvat` — the equinox day's noon shadow (SS 3.11, 3.12-3.14)

The day on which the tip of the shadow runs along one straight east-west line all day (3.7: the line *viṣuvadbhāgragā*;
the circle through three tips of `bhabhrama` becomes a line). Fields: `day`, `chaya`, `dir`, and `which`: `"mesha"`
(the vernal equinox) or `"tula"` (the autumnal).

### `ayananta` — the solstice day (SS 3.11)

Fields: `day`, `which`: `"karka"` (the noon shadow at its shortest, the Sun turning south) or `"makara"`; `chaya`, `dir`
optional. The noon shadow hardly moves around a solstice (at Ujjayinī by this arithmetic 0.003 aṅgula after one day,
0.04 after seven), so the day is better taken as the midpoint of two days with equal noon shadows a few weeks apart
— that bisection is the owner's own reduction, not a rule of chapter 3 [reading].

### `ishta` — a shadow at a time counted by the kapāla from sunrise (SS 3.34-3.41)

| field | | meaning |
|---|---|---|
| `day` | required | the civil day |
| `chaya` | required | the whole shadow, gnomon's foot to tip |
| `kapala` | required | the bowl's count from sunrise (the first sinking started at sunrise) |
| `side` | required | `"purva"` (forenoon, the shadow pointing west) or `"pashcima"` |
| `bhuja` | optional | `{ "value": <aṅgula>, "dir": "N" \| "S" }`: the tip's distance from the east-west line through the gnomon's foot (3.23-3.24). With it the Sun follows from this shadow alone (3.40-3.41). |
| `calibration` | optional | `"nakshatra"` (default: the bowl sinks 60 times between two transits of one star, so it counts the turn) or `"savana"` (60 times sunrise to sunrise) |

### `kapala` — the bowl against the sky (SS 1.12, 13.23)

Fields: `star` (its name) and `count`: the sinkings between two successive meridian transits of that star. A true bowl
counts 60 ghaṭī; the difference is its drift, and `reduce` corrects every `ishta` count by it.

## What `reduce` gives, and from which verse

| Output | Rule |
|---|---|
| `site.palabha`, `latitude`, `aksajya`, `lambajya`, `aksakarna` | 3.12b-3.14a (the palabhā, its hypotenuse, the two sines and their arcs) or 3.16b-3.17a (from a latitude) |
| per noon record: `krantiArcmin` and its residual against the text's declination | 3.14b-3.15a (nata), 3.17b-3.18a (declination) |
| `chayarka`, `quadrant`, `candidates` | 3.18b-3.19 |
| `ayanamsha`, `moved` | 3.11-3.12a: chāyārka − karaṇāgata; east when the computed Sun is the smaller |
| `sunResidualArcmin` | the shadow-Sun against the text's sāyana Sun (karaṇāgata + the ayanāṃśa of 3.9-3.10) |
| `meanFromShadow`, `meanResidualArcmin` | 3.20a: the reversed manda equation, repeated, from the shadow-Sun less the text's ayanāṃśa |
| `latitudeWithTextKranti` | 3.15b-3.16a: the latitude this noon shadow gives with the text's declination (a check, never used to find the ayanāṃśa — that would be circular) |
| `perEighthAngula` | how far λ and the declination move for 1/8 aṅgula of shadow on that day |
| `byDay` (vishuvat), `ayananta` records | 3.11: on the equinox and solstice days the Sun is at Meṣa 0, Tulā 0, Karka 0, Makara 0 — to the day |
| per `ishta` record: `natAsus`, `sinceSunriseByShadow`, `sinceSunriseByKapala`, `timeResidualAsus`, `timeResidualVinadi` | 3.37-3.39 (the nata from the shadow), 2.62-2.63 (the half-day), 2.59 (a count of the turn into asus of the Sun's own day) |
| with a `bhuja`: `agraAngula`, `chayarka`, `ayanamsha` | 3.40-3.41a |
| `kapala.rate`, `kapala.driftGhati` | the bowl's count of one turn |

Noon is taken as the local mean noon of the record's day (Kali day + ½ − deśāntara ÷ 360); the text's arithmetic has no
equation of time there, and the Sun moves under 0.7′ in the minutes it would add.

## What the arithmetic can resolve (measured in `ss-chaya.test.js`, Ujjayinī, 23°10′48″)

- At the equinox noon, 1/8 aṅgula of shadow is 30′ of declination and 75′ of the Sun; one vyaṅgula is 4′ and 10′. Near
  the solstices the shadow fixes the declination as well but not λ. The observed ayanāṃśa is best taken from many noon
  shadows around the equinoxes (3.11: *ayane viṣuvaddvaye*), with the largest gnomon the slab allows.
- The shadow-clock (3.37-3.39) is sharpest far from noon: against the sphere the text's table gives the time within about
  3 asus 8 ghaṭī or more from noon, 7 asus at 4-8, 15 at 2-4, 33 at 1-2 ghaṭī, and is useless within a ghaṭī of noon.
- The east-west line of 3.1-3.3 is turned by up to about 5′ near an equinox, because the declination moves between the
  forenoon and afternoon marks; drawn near a solstice it is true.
- The text's sunrise (2.62-2.63) is the Sun's centre on the horizon, with no refraction. A bowl started at the first gleam
  starts early by the refraction and the half-disc (the design note's "about 34′" plus about 16′), roughly 50 asus at
  Ujjayinī [unverified: outside estimate]; `timeResidualAsus` will carry that until the owner measures it.
