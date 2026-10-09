# वेध-यन्त्र — the ancestors' geocentric engine: design and first three slices

**Date:** 2026-10-07, revised twice the same day after the owner's corrections: "spanda ka ek chakkar se time banta hai — fir saari time ki calculations correct ho jaati hain", and "dhruv tara ko dhruv maanke sab karenge fir se". §1 works out both: time from one turn (§1.1–1.4) and space from the turn's fixed point, the dhruva (§1.5–1.7). §10 lists what the earlier versions got wrong. Revised a third time for "festivals, muhurtas, prana sooksham dasha, nakshatras, sab complete karte hai perfection" and "books me bar bar mention kiya hua hai galat — sab kuch asli mathematics h — galtiya nahi repeat karni": the calendar layers are §11, the corrections to the books are §12. A fourth revision answers "n body derivation bhi ki thi maine, vo wala use karke dekho isme": §13. A sixth answers "amavasya or sabhi adhyay k main shloks fir se dekho — spanda and micro second ki accuracy milegi" and "108 ka logic miss hai": §14.
**Branch:** `claude/lucid-ramanujan-whn6dk`.
**Request (2026-10-06):** "jaise hamare poorvaj Geocentric time, space, sab kuch measure karte the, mujhe exact vahi engine banana hai. Bhul jao NASA, Swiss sab."
**Rule applied (RTA-SUTRA निषेध ४):** no quotation, verse, number or source is invented. Every claim carries one of these tags.

| Tag | Meaning |
|---|---|
| **[theorem]** | integer or exact-fraction arithmetic, re-runnable here |
| **[text]** | a number or sentence printed in a source, with the place named |
| **[measured]** | a command run in this session, output read |
| **[reading]** | my reading of code or of a Sanskrit line; not a translation |
| **[snippet]** | seen only as a web-search snippet; the page could not be opened from this container |
| **[unverified]** | said by a source or an agent, not checked here |

---

## 0. The verdict in one screen

1. **Time is made by one turn of the wheel, and the wheel turns about the dhruva.** The Sūrya-Siddhānta defines the 60-nāḍī ahorātra as one turn of the star-wheel and derives every other day, month and year from the count of turns and two revolution numbers (§1.1–1.4). It binds that wheel to the two dhruvas (12.73) and gives its stars in coordinates measured from the dhruva (ch.8). Time and space therefore share one axis, and both are now code and tests (§1.5–1.7).
2. **The engine is a loop on that wheel.** *Gaṇita → vedha → antara → saṃskāra → vākya → parīkṣā by the next observer.* The tradition says so in its own words [text: *Jyotirmīmāṃsā* pp.3 and 8].
3. **The calendar is built on the text's own wheel.** True Sun and Moon (SS ch.2, with its own sine table), the five limbs, the lunar month, sunrise and lagna on the turn, Vimśottarī to the prāṇa level, muhūrta and the avoided windows, saṅkrānti and festival days (§11). 29 suites pass [measured].
3b. **The books are corrected where the verses' own arithmetic proves them wrong**, and a test fails if a corrected slip reappears anywhere in the edition (§12).
3c. **The owner's complete n-body law, run from the text's states, turns the Moon's apogee and node at the text's own rates within 0.22% and 0.10%;** the text's apogee rate implies an orbit inclined 5.16°, at which the node agrees to 0.02%. The owner's tidal, J2 and figure derivations check out (§13).
3d. **Amāvāsyā is now computed exactly to the spanda of the turn** on the owner's 108-cell lattice, with a one-spanda certificate for each, and SS 4.8's own iteration lands on the same spanda. That is the text's model without error; the text's conjunctions differ from the owner's complete law by −28 to +38 minutes in 2026, so the spanda is the model's, not yet the sky's (§14).
4. **One result stands without any modern source.** Āryabhaṭa's integers plus the Śakābda rule with Parameśvara's two fractions give all four of his stated epoch values at ahargaṇa 16,51,700 to the nearest minute (§3.2).
5. **Where the engine is exact, it is exact now:** the chain of time, the wheel, the dhruva arithmetic. **Against the sky its distance is still unmeasured**, because no owner observation exists yet. The first star transits, the first pair of solstice shadows and the first eclipse will give the first numbers (§4.4).
6. **Corrections** to the request are in §2. Corrections to the research and to my own first version are in §5.4 and §10.

---

## 1. काल-चक्र और ध्रुव — time from one turn, space from its fixed point

### 1.1 What the text says
| Verse | Text [text, `editions/surya-siddhanta-full-edition.html`] | What it fixes |
|---|---|---|
| 1.11 (:363) | *ṣaḍbhiḥ prāṇair vināḍī syāt tat-ṣaṣṭyā nāḍikā smṛtā* | 6 prāṇa = 1 vināḍī; 60 vināḍī = 1 nāḍikā. The prāṇa is the first *measurable* (mūrta) unit. |
| 1.12 (:375) | *nāḍī-ṣaṣṭyā tu nākṣatram ahorātraṃ prakīrtitam* | 60 nāḍī = the **nākṣatra** ahorātra: one turn of the star-wheel. |
| 1.34 (:670) | *bhodayā bhagaṇaiḥ svaiḥ svair ūnāḥ sva-svodayā yuge* | Star-risings in a yuga 1,582,237,828; **a body's own risings = star-risings − its own revolutions.** |
| 1.35 (:682) | *śaśino māsāḥ sūryendu-bhagaṇāntaram … śeṣāḥ syur adhimāsakāḥ* | lunar months = Moon − Sun revolutions; adhimāsa = lunar − solar months |
| 1.36 (:694), 14.18 (:6300) | *udayād udayaṃ bhānoḥ … sāvana* | the civil (sāvana) day is sunrise to sunrise; tithikṣaya = tithis − civil days |
| 1.37–1.39 (:706–:741) | the printed yuga counts | civil days, tithis, adhimāsa, tithikṣaya, solar months; civil days = star-risings − Sun revolutions |
| 14.12 (:6226) | *aṃśais tu jñeyā dvādaśabhis tithiḥ* | a tithi is 12° of elongation: an angle, not a day |
| 14.19 (:6312) | *madhyamā graha-bhuktis tu sāvanenaiva gṛhyate* | mean motions are counted by the civil day |
| 13.23 (:6044) | *ṣaṣṭir majjaty ahorātre … kapālakam* | the kapāla sinks 60 times in an ahorātra, which by 1.12 is the nākṣatra one |

### 1.2 The chain
```
ONE TURN of the star-wheel = nākṣatra ahorātra (SS 1.12)
  = 60 nāḍī = 3,600 vināḍī = 21,600 prāṇa
  = 360° = 21,600′ = 1,296,000″
  = 328,050,000,000 spanda          → 1′ = 1 prāṇa = 15,187,500 · 1″ = 253,125 · 1 nāḍī = 6°   [theorem]
        │
        │  a body's own day = turns − its revolutions (SS 1.34)
        ├── Sun  → CIVIL day, sunrise to sunrise: 1,582,237,828 − 4,320,000 = 1,577,917,828  (1.39)
        │           └── mean motions are counted by it (14.19): the MADHYAMA WHEEL ℤ/(civil days × spandas),
        │               exact residues, returns to zero every yuga                        [theorem, tested]
        ├── Moon → the Moon's own risings: 1,582,237,828 − 57,753,336 = 1,524,484,492                [theorem]
        ├── Moon − Sun → lunar months 53,433,336 (1.35)
        │       × 30 → tithis 1,603,000,080 (1.37, 14.14); a tithi is 12° of elongation (14.12)
        │       − 12 × Sun → adhimāsa 1,593,336 (1.35, 1.38)
        │       tithis − civil days → tithikṣaya 25,082,252 (1.36, 1.38)
        └── 12 × Sun → solar months 51,840,000 (1.13, 1.39)
              year = civil days ÷ Sun revolutions = 365 d 15 gh 31 vi 31 pala 24                   [theorem]
              (Āryabhaṭa: 365 d 15 gh 31 vi 15 pala; in every year the wheel turns once more than the Sun rises)
```

**Every printed count of the yuga follows from three integers:** the turns of the wheel, the Sun's revolutions, the Moon's revolutions. `kala-dvara.test.js` decodes each printed number from the verse's own numeral words and checks it against this derivation: 1.29, 1.30, 1.34, 1.37 (both), 1.38 (both), 1.39. All eight agree [measured].

### 1.3 What follows from "time is the turn"
- **Deśāntara is a rotation.** 1 nāḍī = 6° of longitude, 1 vināḍī = 6′. Parameśvara's village is *nakha* = 20 vināḍī from the reference meridian, which is 2° [text: JM p.36; theorem; tested].
- **Rising times are arcs.** The laṅkodaya 1670, 1795 and 1935 asus of SS 3.44 are prāṇas, which are arc-minutes of the equator's turn. Lagna is therefore a position on the same wheel (slice 5).
- **Time becomes arc exactly.** JM §14's rule, prāṇas × a body's own daily motion ÷ 21,600, is exact because a prāṇa is one kalā of the turn [text p.36; tested].
- **The owner's clock is the sky.** One return of the same star to the meridian is one ahorātra by definition. A kapāla is calibrated by counting its sinkings between two transits of one star. No GPS, no UTC, no Sun, no refraction.
- **No ΔT is needed anywhere.** The clock is the rotation itself, so nothing is ever converted to or from a uniform atomic time. Whatever the Earth's rotation does over centuries shows up only as a slow drift of the mean places against observation. The tradition absorbed whatever drift it observed into the dhruva and the Śakābda rate (§3.2), and so does this engine.
- **Two wheels, one identity.** The kapāla counts nāḍīs of the turn; the ahargaṇa counts sunrises; mean motions run on sunrises. They are joined only by turns ÷ civil days = 1,582,237,828 ÷ 1,577,917,828. Reading a kapāla nāḍī as a civil nāḍī is wrong by 4.9 vināḍī at 30 ghaṭī, which is a whole eclipse-contact residual [theorem, tested]. My first version made exactly this mistake (§10).

### 1.4 How this relates to the lattice already in `math-core.js`
The council's lattice has 328,050,000,000 spandas per ahorātra and 1″ = 253,125 spandas [text: lattice-invariants.test.js; SARVABHAUMA-KALA-YANTRA-GATES]. In `math-core.js` the ahorātra of the ahargaṇa is the **civil** day (`:697`, `:720`). That is right for mean motions by SS 14.19. It means the identity 1″ = 253,125 spandas there describes the turn of the **mean Sun's** diurnal wheel, not the star-wheel. The star-wheel's turn is shorter by 4,320,000 ÷ 1,582,237,828 of a day. No served number in `math-core.js` is wrong because of this, since its ascendant (`:812`) uses a modern sidereal-time formula (`:781`, `:792`) rather than the lattice. The sovereign tier keeps the two wheels apart by name [reading].

### 1.5 The dhruva: the fixed point of the turn
| Verse | Text [text] | What it fixes |
|---|---|---|
| 12.73 (:5566) | *bhacakraṃ dhruvayor baddham … paryety ajasram* | the star-wheel is bound to the two dhruvas and turns without pause; the planets' orbits are bound to it |
| 12.72 (:5554) | *dhruvonnatir bhacakrasya natiḥ …* | the dhruva's elevation is the measure of where one stands |
| 12.43–12.44 | *dhruvatāre … nirakṣadeśasaṃsthānām ubhaye kṣitijāśraye* | at the equator both dhruvas lie on the horizon; at Meru the latitude is 90° |
| 13.4 | *daṇḍaṃ tanmadhyagam …* | the gola has a rod through its centre for the axis |
| 8.1 | *… bhogaliptāyutā dhruvāḥ* | each junction star's **dhruvaka**, a longitude measured on the circle from the dhruva |
| 8.12 | *golaṃ labdhvā parīkṣeta vikṣepaṃ dhruvakaṃ sphuṭam* | check both coordinates on the gola: the catalogue itself demands vedha |
| 8.15 | *eṣyo hīne gṛhe yogo dhruvakād adhike …* | a conjunction with a star is judged against its dhruvaka |
| 2.28 (:1453) | *paramāpakramajyā tu saptarandhraguṇendavaḥ* | the sine of the greatest declination: 1397 on R = 3438, so ε = 23°58.5′ |

So the axis of time and the axis of space are one: the meridian is the circle through the dhruva and the zenith, a star crosses it when its dhruvaka point does, and declination is ninety degrees less its distance from the dhruva. `dhruva.js` carries this frame [tested].

### 1.6 What is fixed, and what only looks fixed
- **The fixed thing is the dhruva point, the axis of the turn.** The star called Dhruva is near it, not on it: through a night it circles that point. You can see this yourself with a sighting tube and a plumb line. Its distance from the point is roughly two-thirds of a degree today [unverified: outside knowledge, to be measured]. Taking the star itself as the dhruva would put up to that much error into both latitude and north, more than any śaṅku error. So the engine **finds** the point from the star:
  - elevation of the dhruva = latitude = the mean of the star's two meridian altitudes, upper and lower [theorem, tested];
  - true north = the midpoint of the star's two greatest elongations [theorem, tested].
  Neither needs to know how far the star is from the point.
- **Over centuries the point itself moves among the stars.** That is the same motion the text calls ayana-calana, seen from the axis [unverified: outside knowledge]. So the ch.8 dhruvakas and vikṣepas belong to the epoch when they were measured. Ecliptic places carry across epochs. The engine converts the catalogue to ecliptic places once, and to the owner's sky with the owner's own measured ayanāṃśa.
- **Refraction** lifts a low star. At Parameśvara's latitude the dhruva stands only about 11° up, so both meridian altitudes are lifted by a few arc-minutes and the mean does not cancel it [unverified estimate]. The text has no refraction. The owner's first season must measure or bound it.

### 1.7 The errors this removes
| Error | With the dhruva fixed | Status |
|---|---|---|
| My earlier design read the ch.8 dhruvakas as ecliptic longitudes | They are polar. At the text's obliquity and a zero ayanāṃśa, Svātī's 199° is an ecliptic longitude of 182.7°, Abhijit's 266°40′ is 264.1°, Citrā's 180° is 180.8°. Stars with zero vikṣepa are unchanged. | fixed, tested |
| North only from the Sun's shadow (SS 3.1–3.4) | a second, star-based north from the dhruva; the two cross-check | built |
| Latitude only from the equinoctial noon shadow | a second latitude from the dhruva's elevation | built |
| The text's obliquity, 1397/3438, taken as the sky's | measured as half the difference of the two solstitial noon zenith distances. The Sun's limb bias is the same at both and cancels. The owner's value replaces the text's in every declination. | built, needs the owner's two noons |
| Ayanāṃśa from the trepidation formula | from timed transits of the ch.8 stars, which fix the turn's phase against the stars, together with the Sun's noon declination | designed, slice 5 |
| A conjunction judged by ecliptic longitude | judged by polar longitude, as 8.14–8.15 say; a planet off the ecliptic has a dhruvaka different from its longitude | built |

The ch.8 catalogue is in `corpus/surya-siddhanta/yogatara.json`. Every dhruvaka is re-derived in the test from the verse's own numeral words by the rule of 8.1, or from the positional rules of 8.4–8.5. Citrā lands at exactly 180° and Revatī at 359°50′ [measured].

---

## 2. Kaṭapayādi, corrected

### 2.1 The table (Sadratnamālā rule, as built in `katapayadi.js`)

| Digit | IAST | देवनागरी |
|:-:|---|---|
| 1 | ka · ṭa · pa · ya | क · ट · प · य |
| 2 | kha · ṭha · pha · ra | ख · ठ · फ · र |
| 3 | ga · ḍa · ba · la | ग · ड · ब · ल |
| 4 | gha · ḍha · bha · va | घ · ढ · भ · व |
| 5 | ṅa · ṇa · ma · śa | ङ · ण · म · श |
| 6 | ca · ta · ṣa | च · त · ष |
| 7 | cha · tha · sa | छ · थ · स |
| 8 | ja · da · ha | ज · द · ह |
| 9 | jha · dha · ḷa | झ · ध · ळ |
| 0 | ña · na · a vowel standing alone | ञ · न · अ आदि |

The verse: *nañāvacaśca śūnyāni saṃkhyāḥ kaṭapayādayaḥ | miśre tūpāntyahal saṃkhyā na ca cintyo halasvaraḥ ‖* [unverified: no printed witness in this repository — the Pāṇini edition (`editions/panini-rahasya-full-edition.html:1473`) gives only the opening words; the second line, the attribution to Śaṅkaravarman's *Sadratnamālā* and the verse number are unverified (council RP-05)].

- ña, na and a lone vowel are zero. A vowel sign, anusvāra or visarga adds nothing.
- In a conjunct only the last consonant counts. So kṣa is ṣa = 6, never 0.
- A consonant with no vowel is not counted.
- *aṅkānāṃ vāmato gatiḥ*: the first syllable is the units digit. This maxim is a separate dictum, not a line of the verse [snippet: an Indology-list post of 2003; wording and locus [unverified]].
- ḷa = 9 is tested: *tanvī vrīḷāniṣṭhā* = 2092′46″ and *mṛṇāḷināḷīkam* = 1909′55″ equal R·sin 37.5° and R·sin 33.75° to 0.05″ and 0.42″ with R = 3437′44″48‴. Read ḷ as la and the first word changes [measured].

### 2.2 What in the request was off

| In the request | Verdict | Evidence |
|---|---|---|
| The chart (1: ka kha ga gha ṅa; 2: ca cha ja jha ña; …; 6: ya; 7: ra; …) | **Wrong.** It lists the *varga number*, not the digit. 31 of its 34 consonants carry the wrong digit; only ka, ḍa and ma agree by accident. | [measured] The request's own worked decoding and its examples use the correct table, so only the chart was a slip. |
| *nanyvacaca nyni sakhy kaapaydaya …* and "na, nya, vowels = 0" | A vowel-dropped garble. The verse has **ñ** (ञ), not "nya". | verse above |
| "The π verse is 1000+ years old" | **Not supported.** Earliest known source is Bhāratī Kṛṣṇa Tīrtha, *Vedic Mathematics* (Motilal Banarsidass, 1965; the author died in 1960). | [text: `editions/panini-rahasya-full-edition.html:1474-1476`; kaal-sacred-discovery `references.bib` entry `tirthaji_1965`] |
| "31 digits of π" | **31 are right, 32 are written, the 32nd is wrong** (2 where π has 5). | [measured] |
| "Read it right to left and you get 3.1415…" | The verse already gives 3,1,4,1,5… in **writing order**. Applying *vāmato gatiḥ* to it gives 29723833462648323979853562951413, which is not π. | [measured] |
| `rogārtho` → 632 | The Viṣṇusahasranāma word is **rogārto** (ārta, afflicted). That gives 632; with *tho* it is 732. That 632 means "recite 632 times" is folklore I could not source. | [measured] |
| Jaya = 18, so 18 parvas, 18 days, 18 akṣauhiṇī | The decode is right. That the epic's eighteens are *because of* the word is a later observation. | [unverified] |
| Māyāmāḷavagauḷa = 15 | Right. The melakarta rule uses only the first two syllables. | [measured] |
| "Madhava and Haridatta used it from the 7th century" | Haridatta, yes: *Grahacāranibandhana*, 683 CE by Kerala tradition, not a dated colophon [snippet]. Mādhava is c.14th–15th century [unverified here]. | |
| "The π verse has no devotional meaning" | Bhāratī Kṛṣṇa Tīrtha presents it as a hymn in praise of Kṛṣṇa and Śaṅkara. Who composed it, and for what, is unknown. | [text via the π-verse skeptic; his book was not opened here] |

### 2.3 A defect found in the repository and fixed
`library.html` chapter 6 printed a half-verse (*kṣaḥ śūnyaṃ svarahīne tu …*) that no source attests, and an anvaya that read "ṇa = 0". Both are replaced, through `scripts/library/sync_library.py`, in `e29429b`. The older 10-letter codec in `math-core.js:431` and `:1168-1190` is still there and is not the full table.

---

## 3. What the ancestors' engine was, and two results from the texts

### 3.1 The loop, from the sources
- **JM p.3:** "testing must be done by everyone through the succession of disciples and grand-disciples" [text].
- **JM p.8:** the purpose of the śāstra is to give disciples the ability to test planetary motion; having made a karaṇa that agrees with observation they should put it into circulation; only karaṇas are practical and precise [text].
- **Parameśvara** observed eclipses for decades: 13 dated records from 1398 to 1432 (§3.3). He fixed new epoch values at ahargaṇa 16,51,700 = Saturday 29 March 1421 Julian [text vv.87-91; date by theorem], and found by observation that the precession had completed 15° in Kali 4536 [text p.44].
- **Nīlakaṇṭha** records his own failures. At Syānandūrapura on 16,81,472 (2 Oct 1502 Julian) a central eclipse occurred, yet Āryabhaṭa's revolutions give no eclipse there after lambana and nati. At Harihara on 16,86,847 (20 Jun 1517 Julian) the same [reading of JM pp.1-2].

### 3.2 Result A. Parameśvara's epoch, reproduced from the texts alone [theorem, tested]

Āryabhaṭa's integers on 1,577,917,500 civil days, the Śakābda rule, and Parameśvara's fractions (Moon less one fifth, Rāhu less one twelfth, apogee whole), at his epoch, 899.0007 years past Śaka 444:

| Body | Āryabhaṭa mean | Śakābda minutes taken | Result | Stated by Parameśvara | Difference |
|---|---|---|---|---|---|
| Sun | Meṣa 0°14.58′ | none | Meṣa 0°14.58′ | Meṣa 0°15′ | 0.42′ |
| Moon | Kumbha 5°21.9′ | 76.15′ (95.19′ × 4/5) | Kumbha 4°5.71′ | Kumbha 4°6′ | 0.29′ |
| Apogee | Karkaṭa 17°13.2′ | 436.08′ | Karkaṭa 9°57.16′ | Karkaṭa 9°57′ | 0.16′ |
| Node | Siṃha 29°29.4′ | 334.78′ (365.22′ × 11/12) | Siṃha 23°54.57′ | Siṃha 23°55′ | 0.43′ |

All four round to the stated minute. Without the saṃskāra the Moon is 1.26° off and the apogee 7.27°. Without his fractions the Moon is 19′ off and the node 30′. With one integer changed the place moves by a quarter circle. This also **certifies the apogee and node integers** 488,219 and 232,226, which are in no local edition [measured].

It shows how his numbers were built, not that they match the sky.

**A relation it exposes.** A Śakābda rate of r minutes a year is 200·r revolutions a yuga. Parameśvara's rates are 16.94 (Moon), 97.01 (apogee) and 74.48 (node) revolutions a yuga, and none is a whole number [theorem, tested]. So the paramparā's own bīja did **not** keep the madhyama wheel closed. A whole-number bīja would. That choice is the owner's (§7.9).

### 3.3 Result B. The fifteen dated eclipses against Āryabhaṭa's mean syzygy [theorem]

JM p.36 settles the day origin: the ahargaṇa of an eclipse is that of **the sunrise before it** (*grahaṇāt pūrvodaya-kālajo 'yam ahargaṇaḥ*) [text]. With Āryabhaṭa's sunrise epoch, each offset below is the distance in days from mean sunrise on the reference meridian to the nearest *mean* new moon (solar records) or full moon (lunar records). No epicycle and no saṃskāra are applied.

| Record | Ahargaṇa | Kind | Julian date | Offset (d) |
|---|---|---|---|---|
| SDip-77 | 16,43,524 | solar | 1398-11-09 | +0.53 |
| SDip-79 | 16,47,156 | solar | 1408-10-19 | **+0.79** |
| SDip-80 | 16,48,722 | solar | 1413-02-01 | −0.09 |
| SDip-72 | 16,52,000 | solar | 1422-01-23 | −0.19 |
| SDip-84 | 16,52,694 | lunar | 1423-12-18 | −0.22 |
| SDip-69 | 16,53,387 | solar | 1425-11-10 | **+0.74** |
| SDip-85b | 16,53,403 | lunar | 1425-11-26 | −0.49 |
| SDip-85a | 16,54,614 | lunar | 1429-03-21 | **−0.74** |
| SDip-70 | 16,55,130 | solar | 1430-08-19 | +0.05 |
| SDip-83 | 16,55,293 | lunar | 1431-01-29 | −0.53 |
| SDip-81 | 16,55,484 | solar | 1431-08-08 | +0.42 |
| SDip-82 | 16,55,645 | lunar | 1432-01-16 | **+1.83** |
| SDip-74 | 16,55,662 | solar | 1432-02-02 | −0.40 |
| JM-Syanandurapura | 16,81,472 | solar | 1502-10-02 | **−0.67** |
| JM-Harihara | 16,86,847 | solar | 1517-06-20 | **−1.11** |

On epicycles of 13.5/360 and 31.5/360, the Sun's and Moon's equations can move a true syzygy from the mean by at most 0.588 d [theorem on those sizes; the sizes are attributed to Āryabhaṭa by the research and not checked against a printed Āryabhaṭīya]. Six records lie beyond that bound, including both of Nīlakaṇṭha's own eclipses. That matches the direction of his remark that the Gītikā integers fail there. The local terms left are small: the village's deśāntara is 20 vināḍī (0.006 d), and the largest cara at its latitude is about 49 vināḍī (0.014 d). SDip-82 at +1.83 d is flagged in the corpus as unexplained. The count of six is a result, fixed in the test so that any later model must explain it [measured].

### 3.4 Three discrepancies carried as data, not repaired
1. Sarma's footnote gives A.D. **1503** for ahargaṇa 16,81,472; integer arithmetic gives 2 October **1502** Julian.
2. The text defines its common date as 8/7500 of a caturyuga on 1,577,917,500 days, which is **1,683,112**. Sarma prints **1,682,112**. Both are in the corpus.
3. SDip-81, 84 and 85b carry damaged e-text words, so their printed numbers are not re-derived from the verse. SDip-85a rests on Sarma's restoration. Ten of thirteen printed numbers are re-derived from the verses' own words [measured].

---

## 4. The design

### 4.1 Frame
Geocentric. Time is the turn of the star-wheel, read by the owner's own instruments. A modern ephemeris is never computation, never seed and never referee.

### 4.2 Layers (sovereign files import nothing; a test greps them for forbidden names)

| Layer | Content | Status |
|---|---|---|
| L0 स्मृति | Kaṭapayādi codec | **built** `katapayadi.js` |
| L1 काल-चक्र / काल-द्वार | the turn as clock; the SS chain of days, months and years for both canons; kapāla readings by calibration; time ↔ angle; Kali day ↔ date, vāra | **built** `kala-dvara.js` |
| L1b ध्रुव | the dhruva found from a circumpolar star (latitude, north); obliquity and latitude from the solstices; polar ↔ equatorial ↔ ecliptic; the ch.8 catalogue | **built** `dhruva.js`, `corpus/surya-siddhanta/yogatara.json` |
| L2 मध्यम | the civil-day wheel; Āryabhaṭa/Parahita integers; Śakābda-saṃskāra; Parameśvara's fractions; mean syzygy | **built** `parahita-madhyama.js`; planets blocked (§7.4) |
| L3 स्फुट | SS ch.2 true Sun and Moon: the text's own 24 sines (2.17-2.22), epicycles varying between the even and odd ends (2.38), one manda step (2.43), latitude 270′; SS ayanāṃśa (3.9-3.10) | **built** `sphuta.js` (Sun and Moon; the śīghra planets are not built) |
| L3b पञ्चाङ्ग | tithi, nakṣatra and pāda, yoga, karaṇa; lunar month, adhika and kṣaya; sunrise and sunset on the turn about the dhruva; lagna; ghaṭīs in nāḍīs of the turn | **built** `panchanga.js` |
| L3c दशा | Vimśottarī, five levels, exact rationals, BPHS 46.12-46.16, 51, 61-63 | **built** `dasha.js` |
| L3d मुहूर्त | 30 muhūrtas; SS 11 pātas by equal declination; gaṇḍānta (SS 11.21, BPHS 92); 17th yoga; riktā and Viṣṭi; tārā | **built** `muhurta.js` |
| L3e उत्सव | saṅkrānti with SS 14.11 puṇya; ṣaḍaśītimukha, pitṛ days, ayana and viṣuva (SS 14.3-14.9); kāla windows; 35 festival rules | **built** `utsava.js` (rules unverified) |
| L3f गुरुत्व | the owner's Gauss–Radau integrator (lifted unchanged); text-only tier: the Moon under the Earth's pull and the Sun's tide, every input from the text; complete tier: the owner's whole force law (all eight blocks, with the text's five planets), text-seeded, with the law's borrowed constants | **built** `radau.js`, `gurutva.js`, `gurutva-candra.js`; `gurutva-purna.js`, `gurutva-purna-candra.js`; `corpus/gurutva/` — every layer can run on either Moon |
| L3g स्पन्द-गणित | the text's Sun and Moon as exact fractions on the spanda lattice (N = 328,050,000,000); time in spandas of the turn; every limb an integer cell (30, 60, 27, 108); the first spanda of each limb's end by integer bisection; SS 4.8's iteration | **built** `spanda-ganita.js` |
| L3h अहर्गण | SS 1.48-1.52: the day-count from a lunisolar date by the text's quotients; the lords of day, month, year (12.78-79) and horā | **built** `ss-ahargana.js` |
| L3i उदय | rising-times, cara, lagna (3.42-3.50); each body's own horizon (2.58, 2.61-2.63); either sine | **built** `ss-udaya.js` |
| L3j ग्रह | the five planets on the SS wheel (1.29-1.44, 2.29-2.57), stations, conjunctions (7) | **built** `ss-graha.js` |
| L3k दृश्य | heliacal visibility (9), the crescent and its horns (10) | **built** `ss-drishya.js` |
| L4 त्रिप्रश्न | śaṅku, chāyā, palabhā; laṅkodaya in prāṇas; cara; the shadow problems (3.1-3.41) | **built** `ss-chaya.js` |
| L5 ग्रहण | contact times and grāsa (4-5); the chedyaka (6); deśāntara from a timed eclipse (SS 1.63-65) | **built** `ss-grahana.js`, `ss-parilekha.js` |
| L6 वेध-लेख | records in śāstra units: kapāla nāḍīs of the turn, aṅgula, padas; sealed prediction first | **built** `vedha-lekha.js`, `corpus/vedha/LEDGER.md` |
| L7 संस्कार | dhruva at a declared epoch; bīja in whole revolutions (wheel closed) or Śakābda form (wheel open) | **built** `samskara.js` |
| L8 वाक्य | 248-day candravākya table regenerated from L2-L3, stored as Kaṭapayādi words | **built** `candravakya.js` |
| L9 परीक्षा | held-out O−C in vināḍī, aṅgula, kalā; certificate from the owner's own records | designed, slices 7-10 |

### 4.3 Referees, in order of trust
1. **Class (i), the texts' own numbers:** the SS chain of §1 (all eight printed yuga counts, now tested), laṅkodaya 1670/1795/1935 (SS 3.44), the 12-5-13 shadow (SS 3.8), Mādhava's R and R-sines, Āryabhaṭa's 24 sine differences.
2. **Class (ii), dated Indian observations:** `corpus/jyotirmimamsa/eclipses.json`. Coarse (padas, "afternoon", nāḍikās), so they decide sign, go or no-go, and magnitude.
3. **Class (iii), the owner's own timed observations:** none exist today. Only this class can produce an accuracy number.
4. **Two hard gates from class (ii).** An engine on Āryabhaṭa's integers must say *no eclipse* at 16,81,472 and 16,86,847, as Nīlakaṇṭha computed; an engine with the corrected epoch must say *eclipse*. A failure is sealed, not tuned away.

### 4.4 Instruments

| Instrument | Source | What it reads | Limit |
|---|---|---|---|
| **The sky's rotation** | SS 1.12 | one return of a star to the meridian = one ahorātra | the clock itself; nothing to calibrate it against |
| **The dhruva**, through a sighting tube with a plumb line | SS 12.72–12.73, 13.4 | the Dhruva star's two meridian altitudes and its two greatest elongations | gives latitude and true north without the Sun; refraction remains (§1.6) |
| Kapāla, copper bowl with a hole, sinks 60 times per ahorātra | SS 13.23 with 1.12 | **nāḍīs of the turn** | Calibrate by counting sinkings between two transits of the same star; the count minus 60 is its drift. No published drift figure was found. |
| Śaṅku, 12 aṅgula, on a levelled slab | SS 3.1-3.4 | shadow to 1/8 aṅgula | 1.1′ at 10° altitude, 4.2′ at 20°, 9.0′ at 30°, 17.9′ at 45°, 26.9′ at 60°, 33.4′ at 75° [theorem]. The vyaṅgula (1/60 aṅgula) is attested in JM p.36: Parameśvara's village has an equinoctial shadow of *duṣkarā* = 2 aṅgula 18 vyaṅgula, which gives latitude 10°51′ [text; theorem]. |
| Gola with ucca and bīja built in | SS 13.14-13.20 | half-degree rings | floor 30′ |
| Eye, for contacts and conjunctions | SS 4.16-17, 7.18 | contact to about a vināḍī if trained | [unverified] |
| Yogatārā catalogue | SS ch.8 | 27 stars plus Abhijit, dhruvaka on a 10′ grid | Citrā at exactly 180°00′ [theorem]. The same stars serve as transit stars for the clock. |
| An owner-owned oscillator, as a rate only, re-zeroed on star transits | owner decision | | A GPS or NTP pulse is UTC, not the rotation [unverified: expert knowledge; the ITU and BIPM pages could not be opened], and is not accepted. |

Sunrise is the civil day's origin by the text, and it carries horizon refraction (about 34′) that the Sūrya-Siddhānta does not model. So sunrise is an event the engine predicts and logs, while the clock runs on star transits.

### 4.5 The correction loop, in the text's own order
1. **Write the prediction first**, in the owner's units, sealed with a hash of the model parameters (RTA-SUTRA अंग 7).
2. **Observe:** kapāla nāḍīs of the turn from a star transit, shadow in aṅgula, padas. No UTC, RA, Dec or WGS84 field is accepted. The civil count comes from the identity of §1.
3. **Antara:** the difference in vināḍī or aṅgula. Time becomes arc by JM §14's rule, exact on the turn.
4. **Saṃskāra in three tiers.** (a) Site, axis and ayana: latitude and north from the dhruva, cross-checked against the Sun's shadow; obliquity from the two solstitial noons; deśāntara from the first timed eclipse (SS 1.63-65), as an angle of the turn; ayanāṃśa from star transits and the equinox shadow (SS 3.11-12). (b) Dhruva: the **median** residual at a declared epoch, in whole kalā, as Parameśvara did. (c) Rate: after two epochs at least ten years apart, either a whole-number Δbhagaṇa (the wheel stays closed) or a Śakābda-form rate from a zero year (the paramparā's form; the wheel opens). One revolution a yuga is 0.3″ a year. No least squares in the default path.
5. **Parīkṣā:** only held-out events decide; a saṃskāra that does not shrink held-out O−C is withdrawn (RTA-SUTRA अंग 3, 8).
6. **Vākya:** the corrected model regenerates the 248-day candravākya table and the dhruvas as Kaṭapayādi words with the decimal beside each. No metrical composition.

### 4.6 What accuracy can be claimed

| Quantity | Claim today | How it becomes a number |
|---|---|---|
| The chain of time, mean motions | exact: integers and their identities [theorem] | n/a |
| Places in the sky | **none** | owner's O−C on held-out events |
| Tithi and nakṣatra end times, and so festival days near a boundary | the text's Moon has one equation; evection and variation together reach about 2°, which is up to several hours in a tithi's end [unverified: outside estimate]. A festival whose tithi ends near its kāla can move by a day. The 2028–29 kṣaya month rests on a saṅkrānti 19 minutes after the new moon [measured], so it is undecided. | the owner's timed Moon–star and eclipse records |
| Expected ceiling of a manda-only Moon | evection and variation are not in the Sūrya-Siddhānta, so quadrature errors of a degree or so are expected. This is an outside estimate, replaced by the owner's measurement. | Moon–yogatārā timings at quadrature |
| Eclipse contacts | resolution about a vināḍī; bias unknown | first eclipse season |
| Drift of the owned integers against the sky | not zero for any integer (APEX-AUDIT, DOCTRINE-RESTATEMENT); its size is what the dhruva and the rate absorb | the owner's dhruvas at two epochs |

---

## 5. What exists, what is missing, and corrections to the research

### 5.1 Exists (lines verified in this session)

| Item | Where |
|---|---|
| SS integers; Kali epoch | `math-core.js:343` (BHAGANAS), `:325` |
| Exact BigInt mean longitude on the civil-day wheel | `:720` (`meanRawExact`) |
| Civil door without ΔT | `:697` (`aharganaSpandasFromCivil({applyDeltaT:false})`) |
| Manda and śīghra equations (pure functions) | `:1386-1422` |
| Āryabhaṭa 24-jyā table | `:3890` |
| Kali-epoch identity gates, incl. civil days = star-risings − Sun | `:1546` (`ssAudit.civilDayIdentity`) |
| Timed-event residual pattern (t_model − t_obs)·ω | `bharat-sovereign-engine/src/observe/events.cjs:17-19` |
| Gauss–Newton skeleton (opt-in only) | `bharat-sovereign-engine/harnesses/refit-anchors.cjs:176-201` |
| The lattice suite | `lattice-invariants.test.js` |

### 5.2 Where modern data still enters the old code

| Point | Line | Kind |
|---|---|---|
| `calculateDeltaT` returns the observed IERS table | `math-core.js:1320`; table `:282-312` | runtime |
| Modern three-term Moon (1.274, 0.658, −0.185) | `:1444-1450`; its comment says "NOT a sourced Mañjula formula" | runtime |
| Adhikāra-3 stub with ε = 23.44° | `:3749-3757` | runtime |
| Bīja fitted against modern periods; "empirical" set fitted against the Drik tier | `:356-366` | seed |
| Dṛggaṇita v3 fitted table; Drik-tier substitution | `:4747`, `:4801` | seed, runtime |
| Modern obliquity, sidereal time, sunrise refraction 90°50′ | `:775`, `:781`, `:2416` | runtime |
| Ujjain 75.7885° against 75.7685° | `:332` against `:3411`, `:3842` | inconsistency |
| Observation validator demands Gaia RA/Dec and imports ΔT | `bharat-sovereign-engine/harnesses/obs-prep.cjs:20, :26-49` | referee |

Suites that compare against Swiss, VSOP or ELP stay as the product's regression net. They are not referees for this engine (§7.5).

### 5.3 Missing
Saṃskāra from owner data (the code is slice 8; the data is the owner's); the Parahita planetary integers; the texts behind the festival rules; a printed *Candravākyas* to test all 248 values; any owner observation.

### 5.4 Corrections to the research that fed this design
1. **ΔT cannot be bypassed by a flag on the true-place route.** Only `ssPlanetMeanAt` (`:1329`) and `ssMeanNodeAt` (`:1472`) take `deltaTApplied`. `ssMandoccaAt` (`:1355`) and `ssSighroccaAt` (`:1345`) always add ΔT, and `ssSphutaAt` (`:1423`) takes no options. Two architects said otherwise. Slice 4 recomposes the true places in a new sovereign file [reading].
2. **A GPS/NTP pulse** as the clock's rate was proposed and is not adopted: it is UTC, not the turn.
3. **"Integer bīja only, as the paramparā did"**, which one architect proposed, is wrong about the paramparā: Parameśvara's rates are fractional (§3.2). Whole-number bīja is a choice for keeping the wheel closed, not a tradition.
4. **The Jyotirmīmāṃsā text** lives only as an OCR e-text in this session's scratch directory. Its facts are in `corpus/jyotirmimamsa/eclipses.json`; the e-text is not redistributed.

---

## 6. Slices

| # | Slice | Test referee | Status |
|---|---|---|---|
| 1 | Kaṭapayādi codec; library verse fixed | the texts' own numbers | **done** `e29429b`, 11 tests |
| 2 | Time door: the turn as clock, the SS chain for both canons, kapāla by calibration, time ↔ angle; dates; JM corpus | all eight printed yuga counts decoded from their verses and re-derived from three integers; the year's sexagesimal length; 10 of 13 corpus numbers from verse words; frame grep gate | **done**, `kala-dvara.test.js`, 18 tests |
| 3 | Parahita kernel; the civil-day wheel; Parameśvara's epoch; mean-syzygy gate; Śakābda ↔ revolutions | his four values to the minute; negative controls; wheel closure; the Śakābda numbers decoded from their Kaṭapayādi words | **done**, `parahita-madhyama.test.js`, 9 tests |
| 3b | The dhruva frame; the ch.8 catalogue | latitude and north from a circumpolar star whatever its distance from the dhruva; obliquity from the solstices; every dhruvaka from its verse words; polar ↔ ecliptic round trips; Citrā's α and δ | **done**, `dhruva.test.js`, 8 tests |
| 4 | SS true Sun and Moon, ε = 24° | the sine table equals the verse decode; epoch places from the integers; largest equations = arc(R × odd end ÷ 360); ayanāṃśa 0 at Kali 0 and 3600, 14°2′ at 4536 | **done**, `sphuta.test.js`, 7 tests |
| 4b | Pañcāṅga | limb spans; karaṇa order; thirty years of months at the text's mean length and adhika rate; 14 of 15 recorded eclipses within a day of their syzygy, all by a node | **done**, `panchanga.test.js`, 7 tests |
| 4c | Vimśottarī to prāṇa | lords from the 46.12 syllables; years from the 46.15 words; 120 from "kha-arka" and "kha-sūrya"; children sum to parents exactly | **done**, `dasha.test.js`, 5 tests |
| 4d | Muhūrta | muhūrtas tile the day; the BPHS 92 words; gaṇḍānta spans; every pāta at equal declination; doubles and failures by the solstices; failures follow the node | **done**, `muhurta.test.js`, 7 tests |
| 4e | Utsava | 14.4-14.6 interlock; the puṇya identity; 14.7-14.9 classes; corrected verses stay corrected; each festival rule once a year, in its month and window | **done**, `utsava.test.js`, 6 tests |
| 4f | The SS numbers | ~95 numbers decoded from verse words; the sine table proves itself; the yuga counts from three integers; no corrected slip anywhere in the edition | **done**, `ss-numbers.test.js`, 6 tests |
| 4g | Gravitation from the text | Radau nodes are roots of P₇+P₈; a Kepler ellipse closes after 100 turns; the tide is the limit of the full pull; the derivation re-run gives the stored series; apogee and node within 0.3% and 0.15%; the implied inclination reproduces both rates | **done**, `gurutva.test.js`, 6 tests |
| 4h | The owner's complete law | T = −ṅa/3 and the recession; J2 and C22 against their potentials; the text-seeded planets by Kepler III; zero momentum; 20-year rates; ṅ recovered within 5%; the stored inclination result; generated module equals corpus | **done**, `gurutva-purna.test.js`, 6 tests |
| 4i | Spanda-exact limbs | the 108 lattice (cells 30, 60, 27, 108; 108² divides N, 108³ does not); the exact sine table; a yuga of turns returns every place; exact = float places to 1e-8°; every 2026 amāvāsyā and pūrṇimā certified to the spanda; SS 4.8 lands on the same spanda; the float pañcāṅga within 5 ms | **done**, `spanda-ganita.test.js`, 5 tests |
| 5 | Tripraśna and lagna on the turn | SS 3.8 (12, 5 → 13); Parameśvara's village at 10°51′ from 2 aṅgula 18 vyaṅgula; cara; round trip | **done**, `ss-chaya.test.js` (§16.1) |
| 6 | Grahaṇa | the two must-fail days; eclipse-possible for all 15; the JM worked eclipse at 16,43,524 | **done**, `ss-grahana.test.js` (§16.2) |
| 6b | Chedyaka (SS 6) | the compass rules of 6.4-6.9 are one turning of the frame; the fish meet at the circle's centre; the rods reach 4.22's grāsa; 6.20-6.22 = 4.12's vimardārdha | **done**, `ss-parilekha.test.js`, 10 tests |
| 6c | Ahargaṇa and lords (SS 1.48-1.52, 12.78-79) | creation + 714,402,296,627 days is a Friday; the two chapters' lords agree; three years of days recovered | **done**, `ss-ahargana.test.js`, 4 tests |
| 6d | Mādhava's sine in the SS modules | the coefficients are the Kaṭapayādi words; the radius cancels; the own-horizon lagna is the sphere's | **done**, `ss-madhava.test.js`, 5 tests |
| 7 | Vedha-lekha, ledger, certifier | refuses UTC, RA, Dec, WGS84 fields and any file naming a modern source | **done**, `vedha-lekha.test.js`, 13 tests (§17.6) |
| 8 | Saṃskāra | synthetic closed loop; identifiability freeze; both bīja forms | **done**, `samskara.test.js`, 14 tests (§17.8) |
| 9 | Candravākya generator | day-1 value against 12°03′ and 12°02′35″, written first, sealed either way | **done**, `candravakya.test.js`, 7 tests: 12°02′35″ to the second (§17.5) |
| 10 | The owner's first season | the owner's own O−C | needs sky time |
| 11 | Planets, Vākyakaraṇa tables | a row with no citation fails | **blocked** on a printed edition |

`npm test` runs all 48 suites (six of them labelled non-referee legacy). The two UI suites need `PLAYWRIGHT_CHROMIUM_EXECUTABLE=/opt/pw-browsers/chromium` in this container.

---

## 7. Decisions only the owner can make

1. **Relation to the product.** Recommended: keep the sovereign tier as its own file family and leave `math-core.js` untouched.
2. **Which integers.** Recommended: carry both canons. Āryabhaṭa/Parahita replays the Kerala records; the Sūrya-Siddhānta drives the SS tier. Every served number says which set produced it.
3. **The clock and the axis.** Recommended: the turn itself, read by a kapāla calibrated on star transits, with an owner-owned oscillator as a rate between transits; latitude and north from the dhruva, found as the centre of the Dhruva star's circle, never by assuming the star is the point.
4. **Vākya source.** Supply a printed *Candravākyas of Vararuci and Mādhava* (Sarma, 1991) or the *Vākyakaraṇa* (Madras, 1962), or accept regenerated vākyas only. The first-vākya values are [snippet].
5. **Legacy suites.** Decided ("do everything") and done: the six suites that compare with a modern ephemeris or product are labelled "non-referee (legacy)" in `scripts/test-all.cjs` and kept.
6. **Observing programme.** The first admissible record is one timed lunar-eclipse contact set, or one equinox noon shadow with a kapāla count. The recommended first season: the kapāla's drift between two transits of one star, a daily noon shadow, and every visible lunar eclipse.
7. **Kaṭapayādi table.** Please confirm the standard table above.
8. **Śaka-year convention.** The code uses the continuous year. At Parameśvara's epoch the integer year gives the same result.
9. **Bīja form.** A whole-number Δbhagaṇa keeps the madhyama wheel closed for ever. The Śakābda form reproduces the paramparā but opens the wheel. Recommended: whole numbers for the owner's own corrections, the Śakābda form only for replaying the Kerala records.
10. **Obliquity.** Kept (owner, 2026-10-07, §18.6): the text's 1397/3438 is the default until the owner's first pair of solstice noons. The measured value is then served, labelled as measured. It is the largest known quantity the engine cannot correct from inside: no local text gives a better value.
11. **KAAL's epicycles.** `kaal_surya_siddhanta_sphuta.py:58` carries Mars 72.5° (from the misprinted odd end 70), and the edition said its Sun mean was 13°40′ (the odd end). The verse words give 75°/72° (mean 73.5°) and 14°/13°40′ (mean 13°50′). That file is outside this repository; its correction is the owner's call.
12. **SS 11.19.** A second witness (the ebharatisampat e-text, Ebharati-5050) also reads "viṣuvatsannidhau", so this is the text and not a slip; the edition is not changed. The text's own computed pātas put every double and every failure within 33° of a solstice (§11.4). So "viṣuvat" here needs a reading that fits the model, or the verse states something the model does not do. The owner's call.
13. **The daśā year.** Default: the SS solar year (1,577,917,828 ÷ 4,320,000 days). BPHS does not say. Āryabhaṭa's year and a 360-day year are offered.
14. **Festival rules.** Supply the governing nibandha (for example the *Nirṇayasindhu* or *Dharmasindhu*) to turn the 35 rules from [unverified] into [text], or accept them as common practice.
15. **Month names.** Default: by saṅkrānti (Meṣa in the month → Caitra), the convention festivals use; SS 14.16's full-moon nakṣatra name is shown beside it (§11.2).
16. **Which Moon is the default.** Kept (§18.6). The text's Moon, now with Mādhava's sine, stays the default. The gravitational Moon of §13 is seeded from the same epoch, so it carries the text's epoch error too. The owner's quarter-moon timings decide between them (the robust saṃskāra of §18.5 reads them).
17. **The inclination.** Decided by the ancestors' own records (§18.3). The text's 270′ agrees with the 15 dated eclipses better than the 5.15° its rates imply: 270′ makes SDip-72, 74 and 84 *possible*, which 309′ does not, and no record favours 309′; the text's own 6.13 still judges 72 and 84 unseen (corrected after the council, KH-04). The 270′ is calibrated together with the text's discs and parallax, so it stays. 5.15° remains "implied by the text's rates", labelled.
18. **Borrowed constants in the complete tier.** The complete law needs constants the text does not give (gravitational parameters, J2, the lunar figure, ṅ, c). They are the owner's, from the engine; the sovereign gate does not cover `gurutva-purna*.js`. Recommended: keep the text-only tier as the sovereign one and label the complete tier as using borrowed constants, as here.
19. **The 2PN sign.** Resolved by derivation, not by choice (§15.1): neither old sign was right, because ±3(GM)²/(c⁴r⁴) is not an acceleration. This repository's force law now carries the harmonic-gauge 2PN term, an attraction of −9(GM)³/(c⁴r⁴) at rest. The engine repository's copy still has +3(GM)²/(c⁴r⁴); the owner ports the derived term there.
20. **Sunrise by the text or by the dhruva.** The text's sunrise applies the Sun's equation of centre (2.46) and the ascensional difference (2.61-2.62) and has no term for the obliquity part of the equation of time [reading]; the engine's default is the geometric sunrise on the turn about the dhruva, which includes it, and `sunriseMethod: "surya-siddhanta"` gives the text's. They differ by up to about ten minutes. Recommended: keep the geometric default, because the owner's own sunrise observation will see it.
21. **Lambana (ch.5).** Built (§16.2), with two choices left to the owner, §7.28-29.
22. **Venus's station (SS 2.53).** Decided ("do everything"). The transmitted word "guṇa-aṣṭa" gives 83°; the text's own śīghra model gives 167.3°, and 2.55's "seventh sign" agrees with 167°, not 83° (§15.4). Built as recommended: `ss-graha.js` carries 83 as the transmitted word and finds the stations where the place itself turns (decision 26).
23. **Which sine.** Decided (owner, 2026-10-07: "use everything that aligns with 100% accuracy"), §18.2. Mādhava's sine, carried to R = 3438, is now the default in every module. The text's 24-entry table is `withSine("table")`, and the suites that check the text's own arithmetic name it. Against the 15 recorded eclipses the two give the same verdict on every one. The exact sine makes the lagna rule the sphere's to 0.05″ and removes the table's double stations. SS 3.44's stated risings lie nearer the table, so the text tier keeps it.
24. **Which lagna.** Decided (§17.3, §18.2). The default is the text's own rule (3.42 at the point, 2.61-2.63) with Mādhava's sine: the sphere's ascendant to 0.05″, with no trigonometry. Kept by name: `"text"` (the table, within 0.29°), `"text-linear"` (3.46-3.48 as worded) and `"sphere"` (also chosen by any `epsilon`).
25. **Candra-darśana.** Decided: the text's 12 kālāṃśa (10.1), as built. Its horizon is each body's own (decision 30); the chapters' dṛkkarma (7.8-7.10) stays as `drk: "aksa"`. Later criteria (elongation and altitude at sunset, the lag) are not in the repository's texts and are not used.
26. **Which stations.** Decided by the owner ("do everything and better", 2026-10-07): both are built. The default is the place's own turning points, which reproduce 2.55 for all five planets; the 2.50-2.51 rule is `by: "text"`. §16.6.
27. **The horns' hypotenuse (10.7).** Decided: both are built. The default is the hypotenuse of the moment, which never puts the wrong horn up in 2026; the words' midday one is `karna: "madhyahna"`. §16.6.
28. **Eclipse 4.26 phala.** Decided: all three readings are built (`reading`). The default is the second witness's adhyardha.
29. **Solar contacts (5.14).** Decided: both are built. The default is "until fixed" (`contactLambana: "once"` for the other). The contact latitudes are now taken from the text's planets recomputed at each contact; 4.14's carry by the daily motions is `places: "motion"`.
30. **The horizon rule.** Decided, and bettered from inside the text. By default every body — star, planet, Moon — is placed on the horizon by its own declination and cara: 2.58, 2.61-2.63 (2.63 gives the stars their own day by their declination with latitude), with its right ascension by 3.42's rule at the point. That puts every junction star within 0.47 kālāṃśa of the sphere (the chapters' linear ākṣa rule: 16.8 for Agastya). The chapters' rule is kept by name: `drk: "aksa"`, and `starAyana`. §16.6.
31. **The ahargaṇa (1.48-1.50) is a mean count.** Decided (§18.4). A lunisolar date is now dated by `exactDay`, which finds the true civil day by the true calendar, adhika months included. The text's count (`ahargana`) and its weekday check (`byWeekday`) stay as written. Over 2024-2026 `exactDay` recovers every sampled day, including those where the text's count is a month off.
32. **The chedyaka's directions (6.9, 6.12).** Decided. 6.9 is construed by the theorem (§17.2). The default picture is the sky as seen (east on the left, north up); `view: "board"` gives the other.
33. **The sunrise clock.** Decided. The Sun is placed by its right ascension at its own point. With Mādhava's sine (the default now) that is exact: 0.00003 asus from the sphere. The linear placement stays as `ascension: "linear"`.
34. **The candravākya canon.** Decided: Āryabhaṭa's integers with Mādhava's sine, which gives day 1 = 12°02′35″, Mādhava's own value to the second. The epicycle 31.5/360 stays [unverified] until a printed Āryabhaṭīya is in hand.
35. **The ledger's strictness.** Decided: strict. A record names no modern clock or source; notes are written in the śāstra's units.
36. **Median or least squares by default.** Decided, and bettered (§18.5). The default is `robust`: the least-squares fit, with any record beyond 4σ set aside one at a time, worst first, and named. It uses every kind of record as the fit does. Like the median, one wild record cannot move it; tested, the clean fit comes back exactly. Kept by name: `method: "median"` (§4.5's first form) and `"lsq"`.
37. **What a Sun bīja keeps fixed.** Decided by the design's first principle, time from the turn (§18.5). The corrected chain keeps the star-risings, and a Sun bīja changes the civil days. `keep: "civil"` gives the other.
38. **The fit's scales and the freeze threshold.** Set, for the owner's sign-off. Each parameter's scale (the largest correction worth considering), the freeze at 1 scale unit, and the robust fit's 4σ are engineering choices, not text numbers. The 1-vināḍī contact precision used in the rehearsals is [unverified] until the owner's own bowl is calibrated.

---

## 8. Not verified, and the weakest links
- **Vākya values and cycles** (12°03′, 12°02′35″; 248, 3031 and 12,372 days) are [snippet]. Nine anomalistic months are 247.99 days [theorem]. 248/9 and 3031/110 are convergents of Āryabhaṭa's anomalistic month; 12,372/449 is not (it leaves −12.7′ of anomaly against 3031's −4.9′; it implies a month of 27.554566 d against Āryabhaṭa's 27.554602 d) [measured]. The vākya method's own error by the canon is ≤ 13.9′ over 24,744 days [measured].
- **Haridatta 683 CE** is Kerala tradition [snippet].
- **Apogee and node integers** are certified by the Parameśvara reproduction, not by a printed Gītikā in hand.
- **Parameśvara's 1/5 and 1/12** are as printed in JM p.35, quoting *Siddhāntadīpikā* p.322.
- **The Jyotirmīmāṃsā e-text is OCR-level** and partly emended by Sarma; three of fifteen numbers are not re-derived from their verses; glosses are mine.
- **The Dṛggaṇita (1431) parameters** were not retrieved.
- **The epicycle sizes 13.5/360 and 31.5/360** are attributed to Āryabhaṭa by the research, not checked here.
- **The dhruvaka as a polar longitude** is read from the term itself (the point cut by the circle from the dhruva). It is the standard reading of ch.8, but no printed scholarly edition was opened here.
- **The Dhruva star's distance from the point, the point's drift among the stars, and refraction near the horizon** are outside knowledge in §1.6, to be measured by the owner.
- **Every accuracy figure in §4.4 and §4.6 is an expectation** until the owner's records exist.
- **No local text** states: the 15 + 15 muhūrtas, Abhijit and Brāhma; which tithis are riktā, pūrṇā and nandā; the 27th yoga as Vaidhṛti; the names of the other 26 yogas, of the movable karaṇas after Bava and of the nine tārās; the five-fold day, pradoṣa and niśītha; any festival rule; the naming of lunar months by saṅkrānti. All are marked in the code.
- **Readings, not translations:** "saptadaśānta" (SS 11.20) as the whole 17th yoga; "nairantaryāt" (14.8) as the saṅkrānti right after each cardinal one; "four nāḍīs below and above" (BPHS 92) as that much on each side.

---

## 9. Doctrine, in the owner's लेखा-शब्द (proposal for the owner to accept or edit)

> **एक चक्कर से काल बनता है; मध्यम उसी चक्र का प्रमेय है; स्फुट संस्कार है; आकाश का निर्णय केवल अपना वेध करेगा — पहले भविष्यवाणी लिखो, फिर नापो, और जो चूके उसे भी सील करो।**

This joins the owner's correction to RTA-SUTRA अंग 3, 7 and 8 and to the AUDIT30 line "madhyama is a theorem, sphuta is a span certificate, the sky is unmeasured".

---

## 10. What the first version of this document got wrong

| First version said | Correct | Fixed in |
|---|---|---|
| A ghaṭī is 1/60 of the civil day | It is 1/60 of the turn (SS 1.12). The two differ by 4.9 vināḍī at 30 ghaṭī. | `kala-dvara.js`, `savanaSpandasAt` and its test |
| Calibrate the kapāla between two noons | Between two transits of one star. Noon-to-noon is the civil day, and the apparent noon also wanders through the year. | §4.4 |
| Use the observed noon as the day's origin | The civil day starts at sunrise (SS 1.36, 14.18); the clock runs on the turn | §4.4, §4.5 |
| The day origin of the eclipse ahargaṇas is unresolved and moves offsets by up to half a day | JM p.36: it is the sunrise before the eclipse. What is left (deśāntara, cara) is under 0.02 d. | §3.3 |
| Integer bīja only, as the paramparā did | Parameśvara's rates are fractional; whole numbers are a choice to keep the wheel closed | §3.2, §4.5, §7.9 |
| The vyaṅgula is a later unit, not attested | It is attested in JM p.36 (2 aṅgula 18 vyaṅgula) | §4.4 |
| The chain of days, months and years was not used at all | It is §1, built and tested | §1, `kala-dvara.js` |
| The ch.8 dhruvakas are ecliptic longitudes ("Citrā at exactly 180°" used as a longitude) | They are polar longitudes from the dhruva; Svātī differs from its ecliptic longitude by 16° | §1.5–1.7, `dhruva.js` |
| North and latitude come from the Sun's shadow | The dhruva gives both independently, found as the centre of the Dhruva star's circle | §1.6, `dhruva.js` |
| The text's obliquity is used as fixed | It is a default, replaced by the owner's two solstice noons | §1.7, §7.10 |

---

## 11. The calendar on the text's wheel (third revision)

### 11.1 Built
`sphuta.js` gives the Sūrya-Siddhānta's true Sun and Moon from its own integers, its own 24 sines and its own epicycles; nothing else enters. `panchanga.js`, `dasha.js`, `muhurta.js` and `utsava.js` stand on it and on the dhruva frame. The frame gate in `kala-dvara.test.js` now lets these four import only the sovereign files [measured].

Today at Ujjayinī (23°10′48″ N, on the prime meridian of the text) the engine gives: Budhavāra; kṛṣṇa Dvādaśī to 42 nāḍī 5 vināḍī of the turn after sunrise (41 ghaṭī 58 vināḍī of the civil day); the Moon in Maghā; Bhādrapada; ayanāṃśa 22°55′ [measured].

### 11.2 Findings
1. **SS 14.15-14.16 is the origin of the month names, not a rule that names a month.** By the full-moon nakṣatra, the month of 2 April 2026 (full moon in Hasta) is Phālguna, which makes two Phālgunas in a row with no adhika between them. Over 2000–2030 the two rules disagree in 60 of 371 months. Months are therefore named by saṅkrānti, and the SS name is shown beside it [measured].
2. **The adhika months of 2001–2026 come out Āśvina, Śrāvaṇa, Jyeṣṭha, Vaiśākha, Bhādrapada, Āṣāḍha, Jyeṣṭha, Āśvina, Śrāvaṇa, Jyeṣṭha** [measured]; the thirty-year count equals the text's rate within one.
3. **A ghaṭī is a sixtieth of the turn.** Sunrise to sunrise is 60.16 nāḍīs of the turn, not 60; times after sunrise are now given in both units [measured].
4. **With the text's true places, 14 of the 15 recorded eclipses fall within a day of their syzygy, and all 15 within 14° of a node.** SDip-82 stays 1.9 days off, as flagged [measured].
5. **BPHS 46.15's "navacandrāḥ" for Budha is a one-letter slip for "nagacandrāḥ".** The eight legible numbers sum to 103; the text's 120 (46.14) leaves 17 = naga-candra [theorem].

### 11.3 SS chapter 14: three verses, one computation
From Tulā 0°, every 86° of the Sun is a ṣaḍaśītimukha: 266°, 352°, 78°, 164°, which are Dhanu 26°, Mīna 22°, Mithuna 18° and Kanyā 14°, exactly as 14.5 prints. Four spans of 86 make 344, and the 16 left are the sixteen days of Kanyā that 14.6 gives to the pitṛs [theorem].

The puṇya time of 14.11 is the Sun's disc crossing the sign's boundary. By 4.2 the disc grows with the true motion, and 14.11 divides by the same motion, so the motion cancels. Every saṅkrānti's puṇya is 6500 × 1,577,917,828 ÷ (57,753,336 × 10,800) = 16.4436 nāḍī on each side, which is (65/108) × the Moon's sidereal month in days [theorem].

### 11.4 SS chapter 11: the pātas
At every computed pāta the Sun's and Moon's declinations agree to 10⁻⁴ degree, the Moon's latitude included (11.7). Over 1990–2025 (1,108 pātas) every double and every failure has the Sun within 33° of a solstice, and none of the 235 pātas near an equinox is double. The failures run around 1996 and 2015 and vanish in 2002–2010: the Moon's 18.6-year nodal cycle, reproduced by the text's own Moon [measured]. The local edition reads 11.19 as "near the equinox"; this is left for the owner (§7.12).

---

## 12. The books, corrected from their own arithmetic

Every correction below is forced by the verse words or by an identity the text itself states. Each verse block carries a dated note, and `ss-numbers.test.js` fails if the slip reappears anywhere in the edition outside those notes.

| Verse | Printed | The verse words give | Proof |
|---|---|---|---|
| 2.17 | 224 and 691, called variants | 225 and 671 | the words (tattva-aśvin; rūpa-bhūmidhara-ṛtu) and the versed sines 3213 and 2767 [theorem] |
| 2.20, 2.21 | 3179, a stray 3401, a difference of 77 | 3177; no 3401; difference 79 | units-first decode of 7-7-1-3; versed sine 261 = 3438 − 3177 [theorem] |
| 2.25 | a stray number fragment after the verse | removed | not part of the verse [text] |
| 2.27 | 3293, though its own note decoded 3213 | 3213 | versed sine = R minus the sine read backwards [theorem] |
| 2.35, 2.38, and seven other blocks | Mars odd end 70, mean 72.5; Sun mean 13°40′ | Mars 75°/72°, mean 73.5°; Sun 14°/13°40′, mean 13°50′ | "dvi-aga" = 2, 7 → 72; 13°40′ is the Sun's odd end [theorem] |
| 8.8 | the last word iṣavaḥ dropped and left to "a traditional table" | Uttarāṣāḍhā 5° south | the verse's own word [text] |
| 14.5 | "nimiṣa", meaning unsure | animiṣa, the fish: Mīna | 14.4's 86° steps land on Mīna 22° [theorem] |
| 14.11 | arkamāna = a sign of 1800′ | the Sun's disc, about 32′25″ | "māna" is the disc in 4.1-4.3 and 11.14; 1800′ would make the puṇya ±15 days [theorem] |

---

## 13. The owner's n-body law, given only the text's numbers (fourth and fifth revisions)

Fifth revision, after the owner's correction "tidal acceleration or baki sab bhi derive kiya hua tha — pahle check karke dhang se kam karo": the fourth revision had used only the leading term of the owner's law. This section now starts from an inventory of what the owner had already derived, checks it, and runs the complete law.

### 13.1 What the owner had already derived [reading of the owner's code, file:line]
| Derivation | Where |
|---|---|
| The force law, eight blocks: Newtonian n-body; EIH 1PN (Moyer 4-26), which carries the de Sitter precession; 2PN + solar Lense–Thirring; the Earth's J2 on the Moon about the pole; 2.5PN damping; the lunar figure J2m and C22m, the C22 term "derived by differentiating the (2,2) potential"; the tidal acceleration | `bharat-sovereign-engine/src/physics/dop853-nbody.js:6-18, 150-400` (copy in this repo: `dop853-nbody.js`) |
| The tidal acceleration from Gauss's equations: da/dt = 2T/n and n ∝ a^−3/2 give ṅ = −3T/a, so T = −ṅ·a/3, with ṅ = −25.858″/cy² from lunar laser ranging | `dop853-nbody.js:90-96`, block 8 at `:342-353` |
| The 15th-order Gauss–Radau integrator, its nodes the roots of P₇+P₈ | `ias15-gauss-radau.js`, lifted unchanged into `radau.js` |
| The revolutions of a yuga from the N-body, DE440-seeded: Moon 57,753,362.7; apogee 488,126.1; node 232,269.5 | `bharat-sovereign-engine/data/drik-siddhanta-series.json` (`bhaganas`) |
| Elsewhere (Sphuta, mangalkaalyantra, KAAL, the web repo): no first-principles derivation of ṅ (no Love number, Q or time lag); the Moon's secular quadratics are fitted; mangalkaalyantra measured ṅ = 26.191″/cy² from its Swiss truth file, 1.3% from LLR | `sphuta/engine-src/L1-jyoti/kerala/kerala-corrections.ts:441-480`; `mangalkaalyantra/engine.ts:2082-2101, 2624-2660` |
| Not found in any repository here: the ledger `SIDDHANTA-JNANA-KOSHA.md` and `GOLD-SWEEP-2-PHYSICS-MATH-2026-07-22.md`, which `RECOVERED-SIDDHIS-2026-09-25.md` cites by paths on the owner's machine | — |

### 13.2 Checked [theorem, measured]
- T = −ṅa/3 returns ṅ = −25.858″/cy² exactly and a recession of 3.820 cm a year.
- The J2 formula equals minus the gradient of its potential to 5×10⁻¹¹; the C22 term equals the (2,2) potential's pull on its axis exactly.
- In a live 74.4-year integration, block 8 alone moves the Moon's longitude by ½ṅt² with ṅ = −26.42″/cy², 2.2% more than the −25.858 put in. The derivation is exact for a circular, unperturbed orbit; what makes up the 2.2% (the Sun's perturbation, the eccentricity) is not separated here.
- The two copies of the force law differ in one place: the sign of the 2PN term (the engine adds it; this repository's copy subtracts it, after its commit `b8444c4` "2pn attraction sign"). The term is about 10⁻¹⁶ of the Sun's pull and changes nothing below; which sign is right is for the owner.

### 13.3 The error of the fourth revision
`gurutva.js` kept only block 1's leading term (the Sun's tide on the Moon) and called it "the owner's n-body law". It is now labelled as the text-only, tidal-limit tier, and the complete law runs in `gurutva-purna.js`.

### 13.4 Two tiers
| Tier | Law | Starting states | Constants |
|---|---|---|---|
| Text only (`gurutva.js`, `gurutva-candra.js`) | block 1 in the tidal limit | the text | none: the Sun acts through n′²(a′/R)³ = its tide, by Kepler III |
| Complete (`gurutva-purna.js`, `gurutva-purna-candra.js`) | all eight blocks; Sun, Earth, Moon and the text's five planets | the text: the Sun's orbit, the planets from 1.30-1.32, 1.41-1.44 (nodes westward), 2.35 and 1.68-1.70 (greatest latitudes read as heliocentric inclinations [reading]), the Moon fitted as before | the law's own: gravitational parameters, J2, lunar figure, ṅ, c, the AU; borrowed, as the owner's AUDIT30 D2 table already classifies them |

Kepler III from the text's periods puts the planets at 0.396, 0.723, 1.571, 5.31 and 9.36 AU at the epoch [measured].

### 13.5 Results [measured, 74.4 years from 2026-10-07]
| Revolutions in a yuga | Apogee | Node |
|---|---|---|
| The text (SS 1.33) | 488,203 | 232,238 |
| Text-only tier, the text's 4°30′ | 489,246 | 232,449 |
| Complete law, the text's 4°30′ | 489,268 | 232,469 |
| Complete law, the inclination the text's apogee rate implies (5.161°) | 488,203 | 232,291 |
| The owner's N-body, DE440-seeded | 488,126 | 232,270 |

Under the complete law, as under the tidal limit, the text's two rates agree with each other only if the orbit is inclined about 5.16°: then the node lands within 0.023% of the text.

Each block's share of the apogee and node motion (″ a year, complete law minus the law without it):
| | Apogee | Node |
|---|---|---|
| Blocks 2-8 together (relativity, J2, figure, tide) | +5.14 | −5.22 |
| Lunar figure alone | +0.19 | −0.11 |
| Tide | 0.00 | 0.00 |
| The five planets | −1.19 | +0.57 |

What the complete law adds to the text's Moon is the table of §13.6 plus one term the tidal limit cannot have: the parallactic inequality, **−0.0349° sin D** (−2.1′), and +0.0058° sin(D+M′). Every other term agrees with the tidal-limit series within 0.001°.

### 13.6 What gravitation adds to the text's Moon [measured, complete law]
| Term | Longitude | Term | Latitude |
|---|---|---|---|
| M (equation of centre) | 6.340° | F | 4.657° |
| 2M | 0.217° | M+F | 0.257° |
| 2D−M (evection) | 1.285° | M−F | 0.254° |
| 2D (variation) | 0.661° | 2D−F | 0.157° |
| M′ (annual) | −0.212° | | |
| D (parallactic) | −0.035° | | |
| 2F (reduction to the ecliptic) | −0.094° | | |

### 13.7 What it changes in the calendar [measured, complete law]
- At the quarters the gravitational Moon differs from the text's by up to 3.21°; new and full moons move by 18 minutes (median), at most 43.
- Tithi ends in the week of 7 October 2026 move by up to 114 minutes, near Ekādaśī.
- The 15 recorded eclipses stay where they were: 14 within a day, SDip-82 the exception.
- Of the 35 festival days of 2026, only Rāma Navamī moves (27 to 26 March).
- Which Moon is nearer the sky is not claimed (§7.16).

---

## 14. Amāvāsyā to the spanda, on the 108 lattice (sixth revision)

### 14.1 The main verses, read again for the instant of amāvāsyā
| Verse | Rule | In the engine |
|---|---|---|
| 1.11-1.12, 1.34-1.37 | sixty nāḍīs are one turn; days ÷ yuga-days = turns ÷ 1,582,237,828 | time counted in spandas of the turn (`spanda-ganita.js`) |
| 1.53-1.54, 1.67 | mean places from the civil-day count; nodes westward; the mean place at any moment by its motion | exact fractions |
| 1.57-1.58 | at the end of the Kṛta all mean planets at Meṣa 0, the Moon's apogee at Makara 0, its node at Tulā 0 | carried to the Kali epoch: apogee 90°, node 180°, as tested |
| 1.60-1.66 | deśāntara by the Earth's circumference at one's latitude; the weekday starts later in the east | `site.deshantara` |
| 2.17-2.22, 2.31-2.33 | the 24 sines; linear interpolation; the arc of a sine | exact fractions |
| 2.29-2.45 | the manda equation: kendra, epicycle between its two ends by the sine, arc, sign by the half; one manda step for Sun and Moon | exact fractions |
| 2.46, 2.59-2.63 | the Sun's equation of centre carried into time; the ascensional difference | sunrise: see §7.20 |
| 2.64-2.69 | nakṣatra 800′, tithi 720′, yoga, karaṇa; the nāḍīs left in a limb by its arc over the difference of daily motions | the limbs as integer cells of the lattice; the end found exactly, not by the one-step division |
| 4.7 | the end of amāvāsyā is Sun and Moon equal "in sign, degree, minute and so on"; of pūrṇimā, half a circle apart | the first spanda at which the equality is reached |
| 4.8 | reach it by repeated correction, with the node of that moment | `parvaByIteration`: lands on the same spanda |
| 5.1-5.10 | lambana for the visible conjunction of a solar eclipse, iterated until fixed (5.9) | not built (§7.21) |

### 14.2 The 108 lattice
The circle and the turn are one lattice of N = 328,050,000,000 spandas (2⁷·3⁸·5⁸). Every limb is an integer cell of it, as the owner's council found on 2026-09-28 [theorem, tested]:

| Limb | Cells | Spandas per cell | Also |
|---|---|---|---|
| tithi | 30 | 10,935,000,000 | two ghaṭīs of the turn |
| karaṇa | 60 | 5,467,500,000 | one ghaṭī of the turn |
| nakṣatra, yoga | 27 | 12,150,000,000 | |
| pāda | 108 | 3,037,500,000 | 200 prāṇas; 108 = 4 × 27 = 9 × 12 |

108² = 11,664 divides N; 108³ does not.

### 14.3 What is exact, and how it was checked [theorem, measured]
Every step of the text's true place is rational, so the Sun and Moon are exact fractions on the lattice, and the end of a limb is the first spanda of the turn at which its argument reaches the cell's edge — found by integer bisection. Each instant carries its own certificate: one spanda earlier the old tithi, at the spanda the new. SS 4.8's repeated correction, run separately, lands on the same spanda in about six steps. The floating-point pañcāṅga is within 5 ms of the exact spanda in 2026.

### 14.4 The amāvāsyās of 2026
Mean time at the text's prime meridian (Laṅkā–Ujjayinī), from mean midnight; the instant as spandas of the turn since the Kali epoch; the pāda (of 108) where Sun and Moon meet; and how many minutes later the owner's complete n-body law (§13) puts the same conjunction.

| Date | Time | Spandas of the turn since the Kali epoch | Pāda of the conjunction | Complete law − text (min) |
|---|---|---|---|---|
| 2026-01-19 | 00:37:55.926 | 615,986,303,998,889,607 | 83 (Uttarāṣāḍhā) | -18 |
| 2026-02-17 | 17:03:21.271 | 615,996,068,600,825,490 | 92 (Dhaniṣṭhā) | 4 |
| 2026-03-19 | 06:30:39.566 | 616,005,792,514,279,553 | 101 (Uttarabhādrapadā) | 30 |
| 2026-04-17 | 17:10:29.776 | 616,015,478,171,954,210 | 1 (Aśvinī) | 38 |
| 2026-05-17 | 01:39:22.878 | 616,025,133,915,502,666 | 10 (Kṛttikā) | 25 |
| 2026-06-15 | 08:46:04.971 | 616,034,770,885,367,470 | 18 (Mṛgaśiras) | 1 |
| 2026-07-14 | 15:29:12.999 | 616,044,402,471,501,149 | 27 (Punarvasu) | -20 |
| 2026-08-12 | 22:56:32.251 | 616,054,044,151,565,465 | 35 (Āśleṣā) | -28 |
| 2026-09-11 | 08:07:12.228 | 616,063,709,439,460,393 | 44 (Pūrvaphalgunī) | -21 |
| 2026-10-10 | 19:52:06.274 | 616,073,409,960,096,728 | 52 (Hasta) | -8 |
| 2026-11-09 | 10:41:36.219 | 616,083,152,649,670,781 | 61 (Viśākhā) | -2 |
| 2026-12-09 | 04:31:16.085 | 616,092,936,495,531,319 | 70 (Jyeṣṭhā) | -5 |
| 2027-01-08 | 00:19:03.388 | 616,102,747,325,182,034 | 79 (Pūrvāṣāḍhā) | -8 |

### 14.5 Precision is not accuracy
The spanda here is the precision of the text's own model: the model's amāvāsyā is known without error to 0.26 µs. Against the sky the model is far coarser. In 2026 its conjunctions sit −28 to +38 minutes from the owner's complete gravitational law. Re-reading the verses does not close that: the text's Moon has a single equation (2.43), and the evection and annual terms it lacks move the conjunction by tens of minutes (§13.6). Microsecond agreement with the sky would also need the turn itself, the Earth's rotation, known to a microsecond, and the length of the day wanders by a millisecond or two [unverified: outside knowledge]. The way the tradition closed the gap is the vedha loop of §4.5: observe, correct, and only then claim. The spanda lattice is the right ledger for that loop, because an observed instant can be written in it exactly.


---

## 15. The 2PN sign; Mādhava, Bhāskara and the small editions; the remaining SS chapters (seventh revision)

### 15.1 The 2PN sign, derived [theorem, measured]
The owner asked for the sign that matches our spanda. The question had no answer as posed: ±3(GM)²/(c⁴r⁴) is not an acceleration. It scales as length⁻²; an acceleration scales as length¹.

The answer comes from the metric. The test body is about a mass m (G = c = 1) in harmonic coordinates, the gauge of the force law's EIH block. Schwarzschild spacetime there is g_tt = −(r−m)/(r+m), g_ij = (1+m/r)²δ_ij + ((r+m)/(r−m))(m²/r²)n_in_j. The geodesic equation, with Christoffels taken numerically from that metric, gives the exact coordinate acceleration. Its expansion gives

  a_2PN = −(GM/c⁴r²)[(9(GM/r)² − 2(GM/r)ṙ²) n̂ + 2(GM/r) ṙ v].

The part at rest is −9(GM)³/(c⁴r⁴): an attraction.

`pn2-schwarzschild.test.js` checks four things:
- The error against the exact geodesic falls ×8 each time m/r halves (2.1e-6 of Newton at m/r = 0.005), against ×4 for 1PN.
- The static residual tends to −9m³/r⁴.
- The old expression fails the units test.
- Block 3 of `dop853-nbody.js` carries the derived term to 1e-9.

Spanda effect, over two years of the full law from 2026:

| Run | Change in conjunction times |
|---|---|
| tolerance 1e-9 vs 1e-10, everything else fixed | 5.6–8.7 spandas (the integrator's noise floor) |
| derived term on vs off, at 1e-10 | 4.8 spandas |
| derived term on vs off, at 1e-9 | 16.5 spandas |
| the old line vs the derived term | 83 spandas |

The derived term's effect sits inside the noise floor; an analytic estimate puts it under one spanda. The old line's 83 spandas came from an expression that was not physics. Tighter tolerances (1e-11, 1e-12) do not converge in this Radau, as before.

**Corrected 2026-10-07 (§18.7):** the two "on vs off" rows above difference two runs, so they measure the integrator's noise, not the term. Scaling each term by K and dividing the shift by K takes it above the noise. Measured that way over the same two years:
- the derived term moves the 25 conjunctions by 0.022 spandas on average and 0.042 at most (about 6 and 11 nanoseconds), the same for K = +10⁴ and −10⁴;
- the old line moves them by 22.9 on average and 44.2 at most (about 6 and 12 microseconds).

The engine repository's port measured the same orders by the same method.

The corpus was regenerated. The fitted osculating elements moved at most 1e-9 relatively, and the recovered ṅ went from −26.418 to −26.426″/cy². The engine repository's copy still has +3(GM)²/(c⁴r⁴); the owner ports it (§7.19).

### 15.2 Mādhava and Bhāskara [text, theorem, measured]
**Mādhava's sine.** The radius is 3437′44″48‴. The coefficients are nirviddhāṅganarendraruṅ 2220′39″40‴, sarvārthaśīlasthira 273′57″47‴, kavīśanicaya 16′05″41‴, tunnabala 33″06‴ and vidvān 44‴. All are decoded and checked in `katapayadi.test.js`.

They are exact to the third [theorem]: 5400′ − c₁ + c₂ − c₃ + c₄ − c₅ = 12,375,888‴, which is his radius. The sine of the quadrant is the radius exactly.

`spanda-ganita.withSine("madhava")` evaluates the polynomial in exact integers. Against the sine on his radius it is within 1e-6′. Its inverse is the first arc-spanda whose sine reaches the value; that is integer bisection, not a Mādhava rule.

On the 2026 amāvāsyās, Mādhava's sine moves the text's instants (mean time, Ujjayinī) by:

| Date | 01-19 | 02-17 | 03-19 | 04-17 | 05-17 | 06-15 | 07-14 | 08-12 | 09-11 | 10-10 | 11-09 | 12-09 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Mādhava − table (s) | +21.4 | +21.4 | +20.4 | +32.0 | +20.7 | +0.7 | −10.8 | −27.6 | −5.3 | −14.5 | −7.8 | −23.1 |

That is the SS table's own interpolation error, carried into time. Both are exact on the lattice: each has its own spanda, with its own certificate.

**The text's derivative.** SS 2.47-2.49 gives the true daily motion: the kendra's motion × the tabular sine-difference ÷ 225 × the epicycle ÷ 360, added from Karka and subtracted from Makara (`gati`). Within a 225′ step the tabular difference ÷ 225 is exactly the slope of the interpolated table [theorem, tested]. The rule leaves out only the epicycle's own variation and the arc's slope. As SS 4.8's rate it reaches the same spanda in 3-4 corrections instead of 4-6.

Bhāskara II's tātkālika gati is the same derivative taken with the koṭi (the cosine). With Mādhava's sine the engine uses the polynomial's own slope over one arc-spanda. Bhāskara's verse is not in the repository (the edition's "2.1" is now flagged unverified), so this is a [reading].

**What else of Kerala and Bhāskara the repositories hold** [reading of files]. Only these are attested in a text:
- Mādhava's radius, three of his R-sines and the vidvān coefficients;
- the Jyotirmīmāṃsā eclipses (`corpus/jyotirmimamsa/eclipses.json`);
- Āryabhaṭa's sine verse.

The lunar amplitudes, Karaṇa-kutūhala numbers, tātkālika and equation-of-time items in the sibling repositories are modern or unattested.

One error in this repository is left for the owner, because §7.1 keeps the product untouched [measured]: `math-core.js aryabhataSineTable()` rounds R·sin. It prints 1316, 1521, 2977, 3083 and 3176 at 22.5°, 26.25°, 60°, 63.75° and 67.5°, where the text's table, and the same file's `ARYABHATA_JYA_24`, have 1315, 1520, 2978, 3084 and 3177.

The review also reported two errors in sibling repositories, which we do not write to and have not re-checked here: a bīja table six times the quoted value, and a Mādhava end-correction "(n+1)/((2n+1)²+1)" that does not reproduce π.

### 15.3 The small editions [theorem, witness]
- **Āryabhaṭa, Gītikā 3.** His own letter-numerals (`katapayadi.js decodeAryabhata`: varga k…m = 1…25, avarga y…h = 30…100, vowel places a 1, i 100, u 100², …) decode the printed words. The Earth word gave 147,237,500 and the Saturn word 148,364. One letter each is wrong: ṇlṛ → ṇḷ, and a stray d in ḍhuṅvighva. Corrected, they give 1,582,237,500, which is the page's own anvaya, and 146,564, which is the dataset. The Sun, Moon, Jupiter and Mars words were already right.
- **Restored from the repository's own witnesses:**
  - Āryabhaṭa 3.9 nausthaḥ (the boat);
  - 4.37 sūryaṃ;
  - Mādhava's π verse (abhihate, triśarādi: 3, 5, … with śara = 5);
  - Brahmagupta 12.21 bhujona, without which the formula shown does not follow.
- **Flagged unverified:** Mādhava "1.2", Brahmagupta 18.30-32 and 18.64-65, Bhāskara "1.1" and "2.1". Their Sanskrit does not state the formula printed with them, and the repository holds differing copies.
- **Guard:** `granthas.test.js`. The source comments in `kala-dvara.js` and `parahita-madhyama.js` now cite the decoded words, not an edition line.

### 15.4 The remaining SS chapters [text, theorem]
Every verse of chapters 1, 2, 3, 4.14-26, 5.11-17, 6, 7, 9, 10, 12 and 13 was read against its words. Each correction below is in the edition with a dated note and is checked in `ss-chapters.test.js` or `ss-numbers.test.js`.

| Verse | Was | Is, and the evidence |
|---|---|---|
| 12.85, 12.81-12.90 | Moon's orbit 32,430 yojanas | 324,000: kha-traya is three zeros. The Moon's kalpa revolutions × 324,000 = 18,712,080,864,000,000, exactly the number of 12.90 (which had been printed 10× too large). That sky-orbit ÷ each body's kalpa revolutions gives every printed orbit. 324,000 ÷ 15 = 21,600, as 12.83 needs. |
| 12.89 | stars 25,980,012 | 259,890,012 (ravi = 12 fills two places) = 60 × the Sun's orbit exactly (12.80). |
| 3.42-3.45 | "tribha-dyukarṇārdha" = R/2 (Meṣa ≈ 887 asus); Tulā paired with Meṣa | the day-radius of three signs, 3141.4. From the text's 1397 this gives 1670.1, 1795.8, 1934.1, which is 3.44. aṣṭi = 16 gives 1670 directly. Tulā = Kanyā … Mīna = Meṣa. |
| 2.53-2.55 | Venus 83° "confirmed" | the word does give 83°, but the text's own śīghra model gives 167.3° (Mars 164.1, Mercury 146.3, Jupiter 123.8, Saturn 112.5 against 164, 144, 130, 115). 2.55's seventh sign needs κ near 150°–180°. The word is flagged and not changed (§7.22). |
| 3.9 | "thirty times" | thirty kṛtis = 600, which is what gives 3.10's 54″ a year (30 gives 2.7″). |
| 1.52 | remainder 0 = Sunday (Guru, Śani) | the rūpa makes remainder 1 = Sunday (Budha, Śukra). Checked by counting days 150 and 1440. |
| 2.29, 2.5 | kendra = planet − apex | apex − planet ("grahaṃ saṃśodhya mandoccāt"). |
| 3.35 | antyā = √(R² − krāntijyā²) | R ± carajyā (3.34). The worked example now reproduces sin φ sin δ + cos φ cos δ cos H. |
| 3.49-3.50 | a ghaṭī = 3,600 asus; Vṛṣa 1791 | 360 asus (1.11); 1795. |
| 3.11-3.12, 3.20 | karaṇa = observed; Sun's mean epicycle 13°40′ | karaṇāgata = computed, chāyārka = observed; 13°40′ is the odd end. |
| 4.26, 6.23, 7.13 | multiply by the phala; total eclipse black; diameters halved | divide (chindyāt); tawny when total; thirty increased by quarters, 30, 37½, 45, 52½, with Venus's 60 the next step. |
| 9.5, 9.11, 9.15, 10.1, 10.6 | kālāṃśa = degrees of arc; bhuktī = arcs; 9+7+3+8; 12° of elongation; sum when alike | rising-time ÷ 60; the two daily motions; 4+9+7+3+4; 12 kālāṃśa; the difference when alike. |
| 12.63, 12.65, 12.84, 13.15 | 2ε = 48° (line at 42°); bhūkarṇa a radius; caradala = A/2 | the declinations of two signs and one sign (lines at 69.37° and 78.28°); the Earth's diameter, with the remainder halved; the ascensional difference itself. |
| 2.15-2.16 | (note) | the literal recursion gives 1717 for the 8th sine and 3375 for the 24th. The table is not its literal output. |

All of these are now built (§16): the eclipse, the shadow chain with the ayanāṃśa from observation, heliacal rising, the horns, the planets.

### 15.5 Rising-times, lagna and the first crescent [text, measured]
`ss-udaya.js` (requires `sphuta.js` only, inside the sovereign gate) builds these from the text's own table and 1397:
- the day-radius and cara (2.60-2.63);
- the Laṅkā and local risings (3.42-3.45);
- the lagna by 3.46-3.48 and the madhya-lagna (3.49);
- the time between two points (3.50) and kālāṃśa (9.5);
- dṛkkarma at the horizon (7.8-7.10);
- the Moon's setting after sunset (10.2-10.4).

Every longitude is sāyana, as 3.10 requires. It is used in two places:
- `Panchanga.lagnaAt(t, site, { lagna: "text" })` gives the text's lagna; the sphere stays the default.
- `Utsava.candraDarshana(t1, t2, site)` gives the first crescent.

Measured:
- **Risings.** From 1397 with the table's day-radius (2.60) the Laṅkā risings are 1669.6, 1796.2 and 1934.2 asus; 3.44 states 1670, 1795, 1935.
- **Cara.** It agrees with the sphere's ascensional difference within 0.8 asus.
- **Lagna.** The text's lagna is within 0.38° of the sphere's at Laṅkā, 1.1° at Ujjayinī and 1.3° at Delhi. All of the difference is the text's linear interpolation within a sign.

Candra-darśana at Ujjayinī in 2026, by 10.1's 12 kālāṃśa:

| Amāvāsyā | First evening | Hours after the conjunction | Kālāṃśa that evening | Kālāṃśa on the evenings before | Moonset after sunset (ghaṭī) |
|---|---|---|---|---|---|
| 2026-01-19 | 2026-01-20 | 40.9 | 22.3 | 8.6 | 3.87 |
| 2026-02-17 | 2026-02-18 | 24.8 | 13.8 | 0.4 | 2.39 |
| 2026-03-19 | 2026-03-20 | 35.6 | 20.8 | 6.7 | 3.61 |
| 2026-04-17 | 2026-04-18 | 25.1 | 16.0 | 0.9 | 2.79 |
| 2026-05-17 | 2026-05-18 | 40.9 | 27.5 | 11.9 | 4.79 |
| 2026-06-15 | 2026-06-16 | 34.0 | 21.8 | 8.2 | 3.79 |
| 2026-07-14 | 2026-07-15 | 27.3 | 15.5 | 3.6 | 2.67 |
| 2026-08-12 | 2026-08-14 | 43.6 | 18.2 | 9.3 | 3.12 |
| 2026-09-11 | 2026-09-13 | 57.9 | 20.5 | 3.0, 11.8 | 3.51 |
| 2026-10-10 | 2026-10-12 | 45.7 | 15.5 | 6.0 | 2.66 |
| 2026-11-09 | 2026-11-11 | 54.5 | 21.9 | 0.1, 10.1 | 3.77 |
| 2026-12-09 | 2026-12-10 | 36.6 | 16.0 | 4.0 | 2.77 |

Kālāṃśa grow fastest on spring evenings and slowest in autumn, because the ecliptic is steep at sunset in spring and shallow in autumn. On 2026-05-17 the evening after the conjunction falls short by 0.1 kālāṃśa. Whether the owner sees that Moon will test the text's 12.

### 15.6 Decisions added
§7.22-25: Venus's station, which sine, which lagna, the crescent rule. §7.19 is resolved.


---

## 16. The rest of the text, built in parallel (eighth revision)
The owner asked, "start parallely with everything". Four slices were built side by side, each from the verse words, the text's sine table and its 1397. None uses a modern ephemeris, and none uses trigonometry in its computation path. The sphere appears only in the tests, to measure the distance. All four pass the sovereign gate.

### 16.1 Chāyā — the shadow chain and the vedha record (`ss-chaya.js`, SS 3.1-3.41; 19 tests)
**What the shadow gives.**
- Palabhā → akṣa- and lamba-jyā (3.12-3.14).
- The noon shadow → nata → latitude or declination → the Sun's sāyana place (3.14-3.19). The quadrant must be recorded.
- The true Sun → the mean Sun by asakṛd vāmam (3.20).
- The agrā, the prime-vertical and corner gnomons (3.21-3.34).
- The shadow at any hour, with antyā = R ± carajyā (3.34-3.36), and its inverse, the time from a shadow (3.37-3.39).
- The Sun from the agrā (3.40) and the circle through three marked tips (3.41).
- The ayanāṃśa from observation: chāyārka − karaṇāgata (3.11-3.12).

**The vedha record.** `corpus/vedha/README.md` sets the format "vedha-chaya/1". The record kinds are a noon shadow, the equinox day, the solstice day, a shadow at a kapāla time, and the bowl between two transits of a star. `reduce()` turns records into [measured] values. Coordinates of the modern kind (UTC, RA, WGS84, JD) are refused, and synthetic records are flagged.

**Measured**
- Latitude ↔ palabhā round-trips exactly. Duṣkarā, 2;18 aṅgulas, gives 10°51′ (Parameśvara's village).
- **Against the sphere:**

  | Quantity | Text vs sphere |
  |---|---|
  | Declination, from the noon shadow | within 1.9′ |
  | Sun, from the noon shadow, within 30° of an equinox | within 5.2′ |
  | Shadow at any hour, zenith distance, altitude below 60° | within 6.1′ |
  | Time from a shadow, 8 ghaṭī or more from noon | within 3 asus |
  | Time from a shadow, within 1 ghaṭī of noon | over 100 asus; unusable there |

  Below 3°45′ the text's versed sine is linear: 7 × arc ÷ 225.
- **What an observer can resolve:** one vyaṅgula of noon shadow at the equinox is 4.1′ of declination and 10′ of the Sun. At the solstice the noon shadow moves only 0.003 aṅgula a day, so the solstice day is poorly fixed by the shadow.
- **A synthetic test:** a sky 0.4° from the text is recovered within 0.11′ from 8 noon records.

### 16.2 Grahaṇa — eclipses (`ss-grahana.js`, SS 4, 5, 6.13; 19 tests)
**What is built.**
- Discs, sūcī and the shadow (4.1-4.6).
- The middle at the exact parva (4.7-4.8).
- Grāsa, sthityardha and vimardārdha, iterated at the contacts (4.9-4.15).
- Contacts (4.16-4.17), grāsa at a time and the time for a grāsa (4.18-4.23).
- Valana (4.24-4.26).
- For the Sun: lambana and nati iterated until fixed (5.1-5.13), and the contact lambanas (5.14-5.17).
- Visibility (6.13).

**Theorems**
- The greatest lambana is R² ÷ 1719² = exactly 4 ghaṭikās, with 5.7 read as the square (the second witness). The text's own Earth and orbits give 4.05.
- The three nati rules agree within 0.8%.
- The text cannot make an annular eclipse total.

**2026 at Ujjayinī, by the text (local mean time)**

| Date | Kind | Sparśa | Madhya | Mokṣa | At Ujjayinī |
|---|---|---|---|---|---|
| 2026-03-03 | lunar, total, 1.769 | 14:29:35 | 16:21:31 | 18:13:37 | seen: the Moon rises eclipsed |
| 2026-08-28 | lunar, total, 1.669 | 06:33:43 | 08:26:25 | 10:17:51 | not seen: the Moon has set |

There is no solar eclipse at Ujjayinī: on 19 March the apparent latitude misses by 5.2′.

**Against Nīlakaṇṭha's recorded eclipses** (corpus/jyotirmimamsa, at his village, palabhā 2;18) [measured]
- **Agreements:**
  - The three recorded non-eclipses come out as none at the village. (Corrected after the council, KH-04: the other half of SDip-69 and SDip-70, "seen at Gokarṇa", fails — the text gives 0.94′ of grāsa there, below 6.13's 3′, and none.)
  - Five solar eclipses fall on the recorded civil day.
  - One vimarda is seen before sunrise, as recorded.
  - One "release at sunset" comes out 0.79 ghaṭī before sunset.
- **Disagreements:**
  - SDip-72 was "clearly seen", but the text gives only 1.6′ of grāsa, below 6.13's limit; SDip-84 was "seen slightly eclipsed", but the text gives 1.2′ of a 51′ shadow, also below it (KH-04).
  - SDip-77's contact is 1.4 ghaṭī early against 'avama' = 5;40.
  - Nīlakaṇṭha's own two eclipses fall a civil day before their printed ahargaṇas, as the Āryabhaṭa mean syzygies did (§3.3). On the text's own day both releases are about 3 ghaṭī early.

### 16.3 Graha — the five planets (`ss-graha.js`, SS 1.29-1.44, 2.29-2.57, 7; 13 tests)
**What is built.**
- Mean places, with the apogees and nodes per kalpa counted from creation.
- The four operations (2.42-2.44) with the epicycles varying by 2.38.
- Latitudes (2.56-2.57).
- The true motion (2.47-2.51), stations and retrograde spans.
- Conjunctions with dṛkkarma, discs (7.13-7.14) and yuddha.

**Stations over ±60 years** (κ of the fourth operation, as 2.53's "caturtheṣu" says):

| | Mars | Mercury | Jupiter | Venus | Saturn |
|---|---|---|---|---|---|
| 2.53 | 164 | 144 | 130 | 83 | 115 |
| the place's own (mean) | 163.5 | 145.6 | 123.9 | 167.1 | 112.9 |
| 2.50-2.51 rule's zero (mean) | 157.7 | 139.4 | 120.3 | 161.7 | 110.8 |

- **2.55:** the place's stations fall in the 7th, 8th, 8th, 7th and 9th signs, Venus included. 83 would be the tenth.
- **The motion rule:** summed over a synodic period it falls short of the mean motion by 56.6° (Mars) and 70.9° (Venus). Its factor (K − R)/K is the epicycle's true rate only at κ = 0° and 180° [theorem].
- **Jupiter's 130** is reproduced by neither method.

**2026 retrograde spans, by the place:**

| Planet | Spans |
|---|---|
| Mercury | 02-28→03-22, 06-26→07-18, 10-19→11-11 |
| Jupiter | to 03-19; from 12-17 |
| Venus | 09-18→10-29 |
| Saturn | 07-16→12-05 |
| Mars | none |

There are 11 conjunctions in 2026; the closest is Mercury–Venus on 01-30, 3.0′ apart.

### 16.4 Dṛśya — visibility (`ss-drishya.js`, SS 9, 10.1-10.15; 16 tests)
**What is built.**
- The text's sunrise and sunset: the mean Sun's turn + bhujāntara (2.46) ± half-day with cara.
- Kālāṃśa as rising-time ÷ 60 (9.5).
- The planets' limits: Jupiter 11, Saturn 15, Mars 17, Venus 8/10, Mercury 12/14 (9.6-9.8).
- Days to an event (9.10-9.11), kṣetrāṃśa (9.16).
- The 27 nakṣatras and four other stars (9.12-9.18, from `yogatara.json`).
- The Moon's last morning and first evening (10.1).
- The dark-half moonrise (10.5).
- The horns (10.6-10.14) and the bright part (10.9, 10.15).

**Measured**
- **Sunrise:** the text's is within 10.4 minutes of the sphere's (the obliquity part, §7.20).
- **Kālāṃśa against the sphere:** within 0.63 at Ujjayinī for a body on the ecliptic, and within 1.47 at 5° of latitude.
- **Stars:**
  - Agastya at Ujjayinī is lost from 05-30 and first seen again on **09-04** (97 days).
  - Abhijit, Svātī, Dhaniṣṭhā and Brahmahṛdaya are never lost there, as 9.18 implies for northern stars.
  - Within 40° of the equator the dates are within 0-5 days of the sphere's. Agastya is off by about two weeks, because the linear ākṣa fails far from the equator.
- **The Moon, 2026:** unseen 1.55-3.54 days around each amāvāsyā. On 05-17 the text's own sunset gives 12.03 kālāṃśa, where the pañcāṅga's sunset gave 11.9: the borderline case of §15.5.
- **Horns:** with the hypotenuse of the moment the tilt is within 3.6° on average and the right horn is up every time; with the midday hypotenuse of the words it is not (§7.27).
- **10.9:** the linear phase differs from (1 − cos E)/2 by at most 0.105 of the disc.

### 16.5 The edition, again
The four slices read 3.1-3.41, 4-6, 1.29-2.57, 7 and 9-10 word by word. Every correction carries a dated note, and the old forms are now forbidden in `numbers.json`.

A second e-text of the Sanskrit was used as a witness: ebharatisampat, Maharishi University of Management collection, Ebharati-5050. It confirms उन्मण्डले, दिक्साम्ये, क्रान्तिः, षष्टि, तद्वर्गात्, दिक्समैः, जीवकुजार्कजाः, एकज्यावर्गतः and तिथ्यन्तात्.

| Kind | Verses |
|---|---|
| Arithmetic | 3.28-3.29 (R²/2 = 5,909,922 and on), 3.33 (8,864,883) |
| Numbers that change the computation | 4.13 and 4.14 "sixty", not "sixth"; 5.7, the square, which gives 4 ghaṭikās; 7.14, divide once (Venus 3.44′, not 3.5″) |
| Readings | 1.58: the slow apsides are not at zero at the Kṛta end; 2.49: the motion correction, not the manda equation; 2.53 caturtheṣu; 2.56-2.57: the nodes and the śīghrocca; 4.26: adhyardha; 7.8-7.9: the damaged words |
| Spellings | 1.70, 2.45, 2.46, 2.50, 2.52, 3.6, 3.26, 4.22, 4.25, 5.14, 7.16, 7.19-7.23, 9.1-9.3, 9.8, 9.18, 10.11, 10.13, 10.14, and the dik-sāmye family |

The renderings of 3.7, 3.11, 3.15-3.17, 3.20, 3.24, 3.32, 3.34, 3.41, 4.4, 5.1, 5.10, 9.4, 9.11, 9.16, 9.17, 10.1 and 10.8 are noted.


### 16.6 The owner's choices, all built, the better as default (ninth revision)
The owner answered the five open choices with "do everything and better". So every option is built, the better one is the default, and the other stays available by name. One of them was improved from inside the text.

**The horizon.** Ch. 9 and 7.8-7.10 put a body on the horizon by a linear dṛkkarma on the ecliptic. But the text also gives each body its own day:
- 2.58: the true declination is the ecliptic declination with the latitude.
- 2.61-2.63: the cara of that declination. 2.63 says this explicitly for the stars ("bhānām api svake").

So each body now rises and sets by its own right ascension ∓ (15 ghaṭīs + its own cara). The right ascension comes from 3.42's rule applied at the point itself, not interpolated within a sign. For a star, the ch.8 polar place is already the foot of its hour circle, and its declination is the dhruvaka's with its polar latitude.

Against the sphere [measured]:

| Kālāṃśa error (max) | Chapters' linear rule (`drk: "aksa"`) | Own declination and cara (default) |
|---|---|---|
| Body on the ecliptic, Ujjayinī | 0.63 | 0.50 |
| Body at ±5° latitude, Ujjayinī | 1.47 | 0.52 |
| Body at ±5° latitude, Delhi | 1.84 | 0.53 |
| The 31 stars at Ujjayinī, worst | 16.83 (Agastya) | 0.47 |
| Dark-half moonrise against the geometric (10.5) | 14.3 min | 12.0 min |

What changes in the calendar:
- **Agastya** at Ujjayinī is now lost from 2026-05-15 and first seen on **2026-09-17**. Both dates are within 2 days of the sphere's; the linear rule gave 05-30 and 09-04.
- **Every junction star's** dates are now within 2 days of the sphere's.
- **The Moon on 2026-05-17:** this evening, the borderline case of §15.5, now comes to 12.4 kālāṃśa, so the crescent is seen the evening after the conjunction (16.9 h). The other first evenings of §15.5 are unchanged.
- **Venus, once in 42 synthetic events:** a planet far off the ecliptic near the Sun (Venus at its inferior conjunction) can appear on the side 9.2-9.3 do not foretell. The linear rule hides this; the sky does not.

**Planet stations.** The default is the place's own turning points; the text's rule is `by: "text"`. For Mars, the 2026-2028 retrogression starts in the 7th sign from the śīghrocca, as 2.55 says. The 2.51 rule turns on other days.

**The horns.** The default is the hypotenuse of the moment, with the Moon's hour angle now taken from right ascensions at the point. The words' midday hypotenuse is `karna: "madhyahna"`. Over 68 crescents: mean tilt error 3.6°, and the wrong horn up 0 times, against 15.8° and 9 times.

**Eclipses.** The defaults are:
- 4.26 adhyardha (the second witness);
- 5.14 contacts until fixed;
- the Moon's latitude recomputed by the text at each contact (`places: "motion"` gives 4.14's carry by motions; 0.5 s apart).

Every alternative stays callable by name: `drk: "aksa"`, `starAyana`, `by: "text"`, `karna: "madhyahna"`, `reading`, `contactLambana: "once"` and `places: "motion"`.

---

## 17. The day-count, the drawing, the sine (tenth revision)
The owner said "go ahead and don't skip anything". Everything left open in §16 is built here. The work is checked by its own theorems and measured, and the texts were read again.

### 17.1 Ahargaṇa and the lords (`ss-ahargana.js`, SS 1.45-1.52, 12.78-79; 4 tests)
- **The count.** 1.48-1.50, by the text's integer quotients:
  - the years gone × 12, plus the months since Caitra śukla;
  - × 1,593,336 ÷ 51,840,000 adhimāsas;
  - × 30, plus the tithis;
  - × 25,082,252 ÷ 1,603,000,080 kṣaya-days, which are subtracted.

  The result is the civil days since creation, at midnight at Laṅkā.
- **The Friday theorem.** To the Kali epoch the count is 452¾ yugas, or 714,402,296,627 days. Creation is a Sunday (1.51 counts the lord from the Sun), and 714,402,296,627 ≡ 5 (mod 7). So the Kali epoch is a Friday, exactly as `kala-dvara.js` reckons it [theorem].
- **The two chapters agree.** 12.78 takes the day lords every fourth down the orbits (Saturn, Jupiter, Mars, Sun, Venus, Mercury, Moon); that is +1 weekday, since 24 horās are 3 orbit steps. It takes the year lords every third; that is +3, since 360 ≡ 3 (mod 7). 12.79 runs the month lords upward from the Moon; that is +2, since 30 ≡ 2. These are 1.51-1.52's remainders, so the two chapters give the same lords [theorem].
- **The horā.** Equal horās from sunrise are a reading; the text does not say equal or unequal. Unequal horās are offered.
- **Against the actual day, 2024-2026 [measured].** Exact on 760 of 1095 days and ±1 on 276. A month ahead (+29 or +30 days) on 59, all in Vaiśākha and adhika Jyeṣṭha of 2026: there the mean adhimāsa of 1.49 has already counted the year's adhika month, and the true one is still to come. The check by the known weekday (`byWeekday`; 1.51 read backwards [reading]) recovers all 1095 days.

### 17.2 The chedyaka (`ss-parilekha.js`, SS 6; 10 tests)
Ruler and cord only. The three circles of 6.2-6.3 are the 49 aṅgulas, the samāsa and the eclipsed body. The valana tips come from 6.4-6.5 and 6.9. The latitudes are laid at the samāsa circle (6.6, 6.8), and the contact points are on the eclipsed body's circle (6.7). The middle is 6.10-6.11. The two fish meet at the centre of the path (6.14-6.16), and the rods give a grāsa (6.17-6.19) and nimīlana and unmīlana (6.20-6.22). The colours are 6.23. The module also draws an SVG of the diagram.

Theorems [tested]:
- **One turning.** The compass rules of 6.4, 6.5, 6.8 and 6.9 are one turning of the frame by the valana: the ecliptic's east is (√(49² − v²), v)/49 and its north is (−v, √(49² − v²))/49, for both bodies and every side. This holds only with 6.9 construed "for the Moon; for the Sun the reverse". The edition's rendering ("for the Moon and the Sun reverse") breaks it, and is corrected.
- **The middle.** At the middle, the latitude tip of 6.10 is the eclipser's centre by the text's own koṭi and latitude (4.18-4.21), and what it covers is 4.10's channa.
- **The fish.** The two fish meet at the centre of the one circle through the three latitude tips.
- **The rods.** The rod of 6.17 reaches the path where 4.22-4.23 put that grāsa. The rod of 6.20 is 4.12's vimardārdha.

Measured. The latitude tips lie √(half-sum² + β²) from the centre. The eclipser touches at the half-sum, so the text's construction places the contacts slightly outside. The text's three-point arc stays within 0.92′ and 0.81′ of the path by the text's own quantities for the two lunar eclipses of 2026 at Ujjayinī, and within 0.12′ and 0.19′ for two solar eclipses at Parameśvara's village. The default path is "instants": the text's koṭi and latitude at every moment, turned by that moment's valana. The three-point arc is `path: "matsya"`.

### 17.3 Mādhava's sine in every SS module (`ss-madhava.test.js`; 5 tests)
`sphuta.js` now carries Mādhava's sine beside the table: the Kaṭapayādi coefficients, carried to the text's R = 3438, so that 1397 and every other R-sine keep their radius. `ss-udaya.js`, `ss-graha.js` and `ss-grahana.js` rebuild on it with `withSine("madhava")`. 2.48's tabular difference becomes the polynomial's derivative there.

- **The radius cancels [theorem, tested].** The Sun and Moon by Mādhava's sine on 3438 are `spanda-ganita.js`'s exact Mādhava places on 3437′44″48‴, to 2e-7°.
- **The own-horizon lagna is the sphere's [measured].** 3.42's rule at the point, with the cara of the point's own declination (2.61-2.63), equals the sphere's ascendant to 0.05″ at 0°, 23°, 35° and 50°, and the meridian point equally. With the table it is within 0.25°. So the whole of the text's lagna error was the 24-entry table, and none of it was the rule. The pañcāṅga's default lagna is now this rule with Mādhava's sine: the sphere's value from inside the tradition, with no trigonometry (decision 24).

| What moves (2026) | Table → Mādhava |
|---|---|
| the Sun | ≤ 4.8″ |
| the Moon | ≤ 14.8″ |
| the five planets (the śīghra steps carry the sine twice) | ≤ 2.6′ |
| the lunar eclipse of 3 March, middle and first contact | 12 s, 14 s |
| own-horizon lagna against the sphere | 0.25° → 0.05″ |
| the Sun's right ascension against the sphere | rms 3.6 asus → 0.00003 |

### 17.4 The sunrise clock
The asus since sunrise used to place the Sun by the Laṅkā risings in proportion within its sign (3.46's way). The eclipse clock's ghaṭīs come from these asus. The Sun is now placed by its right ascension at its own point. Against the sphere this is rms 3.6 asus instead of 12 (19 and 23 at worst; the table's kink near 90° sets the first). The proportion is kept as `ascension: "linear"`, and 3.46-3.48's lagna keeps it, so that at sunrise that lagna is the Sun (decision 33).

### 17.5 Candravākya (`candravakya.js`, slice 9; 7 tests)
The 248 vākyas are generated from the canon, as exact rationals. Each is stored as a Kaṭapayādi word, and every word round-trips in both scripts. The test sealed the two [snippet] values and four models before the module existed, and fixed the seal's SHA-256.

| Canon (sine) | Day 1 exact | To the second | To the minute |
|---|---|---|---|
| Āryabhaṭa (Mādhava), default | 12.0429774° | **12°02′35″** = Mādhava's | **12°03′** = Vararuci's |
| Āryabhaṭa (SS table) | 12.0432384° | 12°02′36″ | 12°03′ |
| Parahita | 12.0429720° | 12°02′35″ | 12°03′ |
| Sūrya-Siddhānta | 12.0279595° | 12°01′41″ (−54″) | 12°02′ |

- **Cycles.** 248 days are 9 anomalistic months to +6.7′. 248/9 and 3031/110 are convergents of the canon's anomalistic month; 12,372/449 is not (§8).
- **The method's own error.** Against the direct sphuṭa it is ≤ 0.33′ over one 248-day round. Over two great cycles it is ≤ 13.9′ (rms 3.6′); with the 248-day cycle alone it reaches 117′.
- **Bounds.** The half-cycle symmetry and the daily-motion bounds hold [theorem].
- **Readings.** The epicycle 31.5/360 is [unverified]. The rāśi digit's place past 30° is a [reading].

### 17.6 The ledger and its certifier (`vedha-lekha.js`, slice 7; 13 tests)
The owner's season goes in one hash-chained file (`vedha-lekha/1`, `corpus/vedha/LEDGER.md`).
- **The chain.** Each entry carries `sha256(canonical({seq, prev, at, record}))`. The first entry's `prev` is the hash of the header, so the site is chained too. A seal closes the file.
- **SHA-256 in plain JS.** The constants are derived as integer roots of the first primes, not typed in. It matches the five published vectors.
- **Tamper detection.** A changed field, a swap, a deletion, an insertion and a changed site each break the chain at that entry. A full rehash is caught only by the seal, so LEDGER.md tells the owner to keep the seal's hash elsewhere.

**What it holds.** Kinds: star transits (`yamyottara`), eclipse contacts (`grahana`, timed by the bowl or, for the Sun, by the shadow clock of 3.37-3.39), crescents (`candra-darshana`), the Moon on a junction star (`candra-yoga`, 8.14-8.15), and predictions written first (`ganita`). The shadow records of `vedha-chaya/1` pass through unchanged and are reduced by `ss-chaya.js` exactly as before.

**What the certifier refuses,** naming where and why:
- modern field names (clock stamps, Julian days, equatorial or horizontal coordinates, geodetic datums, ephemeris corrections) and any field outside the schema;
- any string naming a modern source or a modern time stamp;
- gaps, backward times and duplicate ids;
- a broken chain;
- a prediction written after its day;
- a synthetic record without its generator.

**What `reduce` gives,** each tagged [measured] beside the text's prediction:
- a transit's asus of the turn from sunrise;
- two stars' interval, which cancels the Sun;
- the dhruva's elevation from one star's upper and lower transits;
- eclipse middles and lengths, and the deśāntara that fits a lunar middle;
- crescent verdicts against 12 kālāṃśa, with the bracket in which the sky's limit lies;
- the Moon's error on its circle through the dhruva.

**A synthetic season, October 2026 to August 2027 at Ujjayinī** (69 records from the text's own model, including the text's eclipses of 21 February and 2 August 2027, found by `eclipsesBetween`):
- Sealed, written, read back, certified and reduced, it returns transits and contacts to about 1e-12.
- Noon shadows return to the table's precision.
- All 39 crescent verdicts agree.
- A bowl made to drift 22 asus a turn has its drift recovered exactly.
- A Moon put 6′ ahead comes back as 6.000′.
- A contact 3 vināḍī late and a crescent seen below 12 are reported, not repaired.

**A unit error found.** `ss-grahana.js`'s clock said "nāḍīs of the turn" but counted the Sun's own asus (its hour angle), which run about 59 asus a day slower: 5 vināḍī by 37 ghaṭīs, 7 by 55. It now counts the turn, which is what a kapāla set by the stars counts, and gives the Sun's count beside it (`sunGhatiAfterSunrise`) [theorem, tested].

**Left open.** The Moon–star prediction has no parallax: the ch.8 yoga is geocentric, so the parallax sits inside the antara. Also open: a record for the Dhruva star's greatest elongations; an observed grāsa; refraction.

The string scan is strict (decision 35).

### 17.8 Saṃskāra (`samskara.js`, slice 8; 14 tests)
The text's own numbers are corrected from the owner's own records, by bīja and dhruva only. Every observation goes through the text's forward model, and every correction changes one of the text's parameters.

**The two paths.**
- **Default (§4.5, `correct(observations)`):** the median path. For each body it takes the median residual (sky − text) at a declared epoch, in whole kalā, as Parameśvara did. A rate comes only from two epochs at least ten years apart, three records in each. It is given both as a whole Δbhagaṇa, which keeps the wheel closed, and in the Śakābda form with its zero year.
- **The second path (`method: "lsq"`, or `samskara`):** weighted least squares by Gauss-Newton, with an identifiability freeze. Jacobi rotations of the scaled normal matrix freeze what the data cannot see and say why: unseen, degenerate or weak.

**What each path reads.**
- Kinds the fit takes:
  - noon shadows;
  - shadow-Suns;
  - true or mean places of the Sun, Moon and planets;
  - Moon–junction-star timings (polar);
  - lunar eclipse contacts, with the inequality "an eclipse is possible";
  - pūrṇimās with no eclipse;
  - first crescents, as inequalities.
- Kinds the median path takes: the place records, shadows away from the solstices (inverted by 3.14b-3.19), and lunar eclipse middles as Moon − Sun (JM §14). It names every record it leaves to the fit.

**The owner's ledger.** `fromLedger(file, { catalogue })` reads a certified `vedha-lekha/1` ledger:
- shadows through `fromVedha`;
- each lunar eclipse's contacts as one `grahana`;
- evening crescents as `darshana` with `seen`;
- each Moon–junction-star timing as a polar `candra` at the star's dhruvaka (8.14-8.15).

Star transits set the site and the clock (tier a) and enter no motion. Solar contacts (which carry ch.5's parallax) and morning crescents are named as not used.

**Synthetic results [measured, `synthetic: true`].**
- **The main loop at Ujjayinī** (487 noon shadows over 12 years, 26 night eclipses over 40 years, 267 Moon–star timings): χ²/dof 0.99. Every moved parameter comes back within its σ: the Sun and Moon epochs to 0.04′ and 0.03′; the apogee, node and ayanāṃśa phase; the rates to 1.5-8 revolutions a yuga.
- **The whole-number refit** costs nothing the data can see (χ²/dof 0.987).
- **The median path** recovers moved dhruvas of +4 and −12 kalā exactly.
  - One Moon record 300′ off does not move the median at all; it moves the least-squares Moon by 1.66′. That is why §4.5 chose the median for the default.
  - Over 22 years it recovers a moved rate of 250 revolutions a yuga as a whole Δbhagaṇa of 248 (± 7.8), and the zero year where the moved rate undoes the moved epoch.
- **The freeze.** A week of noon shadows freezes the Moon, apogee and node as unseen; the ayanāṃśa's phase and amplitude as degenerate; the Sun's rate as weak. Twelve years of shadows still leave the apogee unseen; one season of eclipses fixes its rate.
- **The Parahita replay** on Āryabhaṭa's integers finds Parahita's rules (36/425, 65/134 and 143/384 minutes a year from Śaka 444) exactly. It reproduces §3.2's epoch shifts and shows the wheel opening. The whole-number form (−17, −97, +74) moves 275 years of places by under 0.5′.
- **Crescents.** A Moon moved 50′ breaks five first-evening constraints, and the fit restores all five. The feasible interval [38, 50]′ contains the truth and excludes the text.
- **The ledger.** A ledger whose bowl reads 2 vināḍī late comes back through `fromLedger` as contacts 12 asus of the turn late. The median path reads it as the Moon 0.4′ behind.

**Left open:** decisions 36-38.

### 17.7 The edition and the old code
- **SS 6.9.** The construal is corrected (§17.2) [theorem].
- **SS 6.12.** Its worked example said "facing north, east is on the left". It is "facing south". The verse's own sense is left as a reading (decision 32).
- **SS 6.23.** सधूंरं → सधूम्रं and कृष्णतांरं → कृष्णताम्रं, by the second e-text (Ebharati-5050).
- **SS 11.19.** The second e-text also reads "viṣuvatsannidhau". It is the text, not a slip, so the edition is unchanged (decision 12).
- **Āryabhaṭīya.** The Trivandrum 1931 text with Nīlakaṇṭha's commentary (Ebharati-5009) is a second witness. Its typography prints the ḷ-mātrā as ्लृ in ङिशिबुण्लृख्षृ; it confirms शनिढुङ्विघ्व.
- **`math-core.js`.** The Āryabhaṭa sine table was rounded R·sin. It is now the text's 24 sines. They differ at 22.5°, 26.25°, 60°, 63.75° and 67.5° (1316/1315, 1521/1520, 2977/2978, 3083/3084, 3176/3177).
- **Legacy suites.** Labelled non-referee (decision 5).

---

## 18. Every choice set for accuracy (eleventh revision)
The owner: "USE EVERYTHING THAT ALIGNS WITH OUR MOTIVE OF 100% accuracy and perfection". So every choice point is set to its most accurate option, where that can be established without a modern ephemeris. The referees are a theorem, the sphere where the geometry is exact, or the ancestors' own recorded eclipses. The text as written stays callable by name, and the suites that check its arithmetic name it. Three other sessions' fixes were checked and folded in where they belong to this repository.

### 18.1 The three other sessions
- **The π-verse and Mādhava's paridhi verse** (another session's pull request #4): merged into this branch (`15cfe09`).
  - Both branches had fixed the same chapter. This branch's rule-verse (नञावचश्च…) and provenance are kept, with #4's formula, card and guard test.
  - The meter label is ASCII, so the reader's upper-casing does not turn π into Π.
  - Its two unqueued follow-ups are done. The π-verse is read left to right, the exception to vāmato gatiḥ, and the edition paragraph is corrected. This branch's sync never overwrites the editions.
  - The paridhi verse's word values are checked against the Sūrya-Siddhānta's own word-numerals: six attested, two by synonym, three not in that corpus. Its integer gives π = 3.141592653592….
- **KAAL's epicycle means:** fixed and tested in KAAL (13/13; Mars 75°/72°, Sun 14°/13°40′, Venus śīghra 262/260, all from the verse words); that fix had not been pushed to KAAL when this was written.
  - It also found that KAAL's four-step procedure halves the epicycle where SS 2.43 halves the equation. This repository's `ss-graha.js` halves the equation (checked).
- **The derived 2PN term in the engine** (draft PR #1 in bharat-sovereign-engine): ported, tested (22/22), and Mercury's 10-year error went from 0.005″ to 0.004″. Its measuring method (scale the term, divide the shift) is now used here (§18.7).

### 18.2 The sine: Mādhava's, everywhere (decision 23)
Every module now defaults to Mādhava's sine, carried to R = 3438:
- `sphuta.js` and `spanda-ganita.js`;
- `ss-udaya.js`, `ss-graha.js`, `ss-grahana.js`, `ss-chaya.js`, `ss-drishya.js`;
- `panchanga.js`, `utsava.js`, `muhurta.js`, `dasha.js`;
- `vedha-lekha.js` and `samskara.js`.

Each has `withSine("table")` for the text as written. The 24 numbers of the table are the same in both tiers.

**Where the library's trigonometry is still used (corrected after the council audit, G-4).** "Everywhere" was too strong. These paths still call JavaScript's `Math.sin/cos/acos/atan2` instead of a sine tier:
- `panchanga.js` sunrise and sunset (the hour angle of the horizon), which every day boundary, festival window, muhūrta and daśā birth day rests on, and its `"sphere"` lagna (which is meant to be the sphere);
- `dhruva.js`, a root that imports nothing: the ecliptic–equatorial transforms;
- `utsava.js` moonrise and `muhurta.js` the pātas' declinations;
- the gravity tier (`gurutva.js`, `gurutva-candra.js`), whose vectors are physics, not the text.

The effect is below what anything reads [measured]: over 2026 at 0°, 10°, 23.18°, 35°, 50° and 60° N, the text's own rule with Mādhava's sine (`vedha-lekha.sunriseAt`/`sunsetAt`, 3.42 at the Sun's point with 2.61-2.63) and `panchanga.js`'s trigonometric sunrise and sunset differ by at most 0.0010 s. `kala-dvara.test.js` now pins these call sites, so no new trigonometry can enter a sovereign file unnoticed. Moving them onto the sine tier is open work.

What decided it [measured, `ss-madhava.test.js`]:
- **The ancestors' records.** The 15 recorded eclipses get the same verdict by both sines (eclipse or none, total or not, seen or not), with middles within a minute. The exact sine costs nothing the records can see.
- **The lagna rule.** 3.42 at the point with 2.61-2.63 is the sphere's lagna to 0.05″. With the table it is 0.25° off.
- **The planets' stations.** With the table, 13 of Mars's 112 stations in ±60 years stand and turn more than once; with the exact sine, none.
- **The Sun's right ascension** for the sunrise clock is exact (0.00003 asus).
- **The text tier stays a measurement.** SS 3.44's stated risings 1670, 1795, 1935 lie within 1.2 asus of what the table gives from 1397, and up to 2.3 from the exact sine. The authors' numbers are their table's, so the text tier keeps the table.

The gravity tier (§13) stays seeded from the text as written (its table). Its results are statements about the text's own numbers; its stored corpus regenerates byte-identical.

The exact engine's Mādhava arc is now found on a lattice 10,000 times finer than the arc-spanda. On the arc-spanda itself the Moon's place stood still for about 27 spandas, so "the first spanda past an edge" depended on how it was reached; now it does not. The float pañcāṅga's bisections stop at 86 µs (they stopped at 8.6 ms) and agree with the exact spanda within 0.2 ms.

### 18.3 The Moon's greatest latitude (decision 17)
The text's 270′ and the 5.15° (309′) its own rates imply through Newton's law were both run on the 15 recorded eclipses:
- 270′ gets SDip-72 (a contact reading here), SDip-74 ("slightly eclipsed, seen by the keen-sighted": magnitude 0.26) and SDip-84 ("the Moon was seen slightly eclipsed").
- 309′ gives no eclipse, or one too small to see, for all three, and no record favours it.
- Corrected after the council (KH-04): "gets" means *makes possible*. By the text's own 6.13 limit, SDip-72 (1.6′) and SDip-84 (1.2′) are still below what is seen, against "clearly seen" and "seen slightly eclipsed"; only SDip-74 is both possible and seen.

The text's latitude is calibrated together with its discs and parallax, so it stays [measured].

### 18.4 Dating a lunisolar date (decision 31)
`exactDay(date, panchanga)` finds the true civil day: the day at whose start the true month (adhika included) and the tithi are current, in the year of its nija Caitra. It tries the text's count's own offsets first. Over 2024-2026 it recovers every sampled day, including the months where 1.49's mean adhimāsa runs a month ahead. The text's count and its weekday check stay as written.

### 18.5 Saṃskāra (decisions 36-37)
- **The default is `robust`.** It is the least-squares fit, with any record beyond 4σ set aside one at a time, worst first, and named. It uses every kind of record (contacts, crescents, misses) and reports what the data cannot see. One record 300′ off is set aside, and the clean fit comes back to 1e-9; nothing is set aside from clean records. The median (§4.5's first form) and the plain fit stay by name.
- **The corrected chain of 1.34-1.39 keeps the star-risings,** because the turn is the clock. A Sun bīja changes the civil days; `keep: "civil"` gives the other.

### 18.6 Kept, with reasons
- **The obliquity, 1397/3438** (decision 10). This is the largest known quantity the engine cannot correct from inside: no local text gives a better value. The owner's first pair of solstice noons replaces it, labelled as measured.
- **The text's Moon as the default Moon** (decision 16). The gravitational Moon starts from the same epoch and carries its error. The owner's quarter-moon timings decide.
- **The ayanāṃśa of 3.9-3.10,** until the owner's star transits and equinox shadow give one (3.11-3.12).

### 18.7 The 2PN term, measured above the noise
Scaling the term by K = ±10⁴ and dividing:
- the derived 2PN term moves 2026-2028's 25 conjunctions by 0.022 spandas on average and 0.042 at most (6 and 11 ns);
- the old line, by K = 100, moves them by 22.9 and 44.2 spandas (6 and 12 µs).

§15.1 is corrected: its "on vs off" rows were the integrator's noise.

### 18.8 What 100% still needs
Everything the code can decide from inside is now set for accuracy. What is left is the sky:
- the Moon's and the Sun's places at the epoch;
- the obliquity;
- the ayanāṃśa;
- the observer's latitude and longitude.

The ledger (`vedha-lekha.js`) takes these, and the robust saṃskāra corrects the text's own numbers from them. No setting in the code substitutes for the owner's first season of observations (§7.6).

---

## 19. The observations begin: `vedha.html` (twelfth revision)
The owner: "Go ahead with observations". The sky is the owner's to observe: no code here sees it, and nothing here invents a reading. What was built is the instrument-side of the loop, so that the first night works.

**`vedha.html`, the observation companion** (offline, in the app's navigation and service-worker cache). It runs the sovereign engine itself (`sphuta.js` … `vedha-lekha.js`, Mādhava's sine) on the owner's device and sends nothing anywhere.
1. **The place.** An approximate latitude to start, which the Dhruva star's two meridian altitudes replace (12.72-12.73); the palabhā from the equinox noon shadow; the deśāntara east or west of the Ujjayinī meridian, which the first timed lunar eclipse measures; the śaṅku's length. A ledger's place is chained into it.
2. **The instruments, from the text:** the śaṅku and the directions (3.1-3.4, quoted); the units (1.11-1.12); the kapāla (13.23, quoted); and the first season of §7.6, step by step.
3. **The text's predictions for any day, in the owner's units:**
   - the noon shadow (aṅgula–vyaṅgula, north or south) for the owner's śaṅku;
   - each junction star crossing the meridian in the dark, as a bowl count from sunrise and an altitude;
   - the crescent evenings (kālāṃśa against 12);
   - the Moon on a junction star;
   - every eclipse of the next 400 days, contact by contact.

   One button writes them into the ledger **before** the day, and the ledger refuses a prediction written after its day.
4. **Recording** the six kinds of `LEDGER.md` in the śāstra's units, each optionally citing its prediction. The certifier's refusals (a modern clock time in a note, an unknown field, a day in the future) are shown as they come.
5. **The ledger** — kept in the published page's own store when it runs as a claude.ai artifact (one document per entry, a season per ledger, readable by its owner only, nothing ever deleted), otherwise in the browser:
   - its chain checked on every change;
   - the antara (observed − the text) by `reduce`;
   - export to a file, the owner's copy and the one that counts (through the page's downloads where it has them, else a copy box);
   - import, and the season's seal.

`scripts/vedha-ui.test.cjs` (in `npm test`) serves the page with every outside request blocked. It plans a day, starts a ledger, writes the predictions first, records a noon shadow and a star transit, and refuses a note carrying a clock time. The ledger it keeps and exports is certified by `vedha-lekha.js` byte for byte, and survives a reload with its place locked. It also covers the conjunction evening and the first crescent evenings. `vedha.html` is in the gate's forbidden-name scan.

**The first season, by the text, at Ujjayinī** (the page recomputes it for the owner's place):

| When | What | The text's prediction |
|---|---|---|
| every clear night | the bowl between two transits of one star; the meridian stars | the page lists each night's stars, bowl counts and altitudes |
| 2026-10-11, 10-12 after sunset | the first crescent | 5.4 kālāṃśa, not seen; 14.6, seen |
| every clear noon | the noon shadow | the page gives its length |
| about 2026-12-24 | the longest noon shadow (winter solstice) | the text's sāyana Sun reaches 270° that day |
| 2027-02-21 | lunar eclipse | magnitude 0.72, visible |
| about 2027-03-23 | the equinox noon shadow (the palabhā; the ayanāṃśa by 3.11-3.12) | the text's sāyana Sun reaches 0° |
| 2027-08-02 | solar eclipse | total at Ujjayinī by the text |

The solstice and equinox shadows measure the ayanāṃśa and the obliquity, the two largest corrections the engine cannot make alone. The crescent pair and the eclipses measure the Moon. The robust saṃskāra (§18.5) reads the exported ledger through `fromLedger`.

---

## 20. The instruments: `yantra.js` (thirteenth revision)

*Every claim carries its tag, as above.*

The owner: "sabhi astronomical instruments like Jantar Mantar and bowl, in sab ki bhi derivations or data tha apne pas"
("we had derivations and data for every instrument, Jantar Mantar and the bowl too").

What was found in the repository and its siblings [measured: grep across bharat-ephemeris-offline, sphuta,
bharat-ephemeris-web, kaal-sacred-discovery, bharat-sovereign-engine, vedic-ghadi and mangalkaalyantra]:
- **Derivations.** Only `sphuta/server.ts` `hGnomon` and `hEquinox` ("Digital Jantar Mantar"). They compute
  from a modern kernel (true obliquity, local sidereal time, `atan2`). Their geometry ideas were reused: hypotenuse =
  height ÷ sin φ, and the face lit = the sign of the declination. Their inputs were not used.
- **Data.** No dimension of any real instrument. The legacy `maha-grantha` edition says "Samrāṭ Yantra, 27 m tall"
  [unverified; not used]. Every size in `yantra.js` is the owner's parameter. `DEMO` sizes are labelled "demo, not a
  measurement".

### 20.1 The arithmetic

These rules hold for the whole module [theorem; enforced by `yantra.test.js` [FRAME]: no
`Math.sin/cos/tan/asin/acos/atan/atan2/hypot/PI` in `yantra.js`].

- **The sine.** Only `sphuta.js`'s R-sine on R = 3438: Mādhava's by default, the 24-entry table with
  `withSine("table")`. Also its arc (2.33) and the mūla.
- **Angles from two legs.** An angle is taken by bhuja–koṭi–karṇa: the arc of the smaller leg × R ÷ karṇa. So no arc
  is ever read where the sine is flat.
- **Lengths along arcs.** An arc of m minutes on a circle of radius r is r × m ÷ ρ. Here ρ is the radius measured in
  minutes of its own arc: Mādhava's 3437′44″48‴, or the table's 3438 (2.17-2.22: the 24th sine is the radius).
- **Chords.** A chord is 2r × jyā(half the arc) ÷ R.
- **No ratio of circumference to diameter is typed in anywhere.** Against 10,800 ÷ π, ρ is off by 3.03e-8
  (relative) [measured].
- **The body in the horizon frame (R-units) is the text's own quantities** [theorem: identical to the sphere; tested]:
  - up = the śaṅku of 3.34b-3.36. The cheda (antyā × dyujyā ÷ R) is written out as dyujyā + kṣitijyā.
  - north = agrājyā − śaṅkutala (3.27b; 3.23b-3.24).
  - east = dyujyā × jyā(nata) ÷ R.
  - The inverse is the same rotation by the latitude, through akṣajyā and lambajyā (3.13).
- **Agreement with the sphere [measured].** The components are within 1.1e-4 R-units, the altitude within 0.0066″, and
  the azimuth on the sky within 0.0061″. The śaṅku equals `ss-chaya.js`'s `shadowAt` to 4e-12 R-units. This holds at
  latitudes 1°–75°, declinations −24° to 70°, and every 7.5° of hour angle.
- **The forward model** [reading of the engine; same as `vedha-lekha.js`]:
  - the true Sun of `sphuta.js`, made sāyana by the text's ayanāṃśa (3.9-3.10);
  - the declination by 2.28 on 1397;
  - the hour angle as the turn, i.e. the meridian's asus (`ss-grahana.js`) less the right ascension (3.42 at the point).
- **The ascension and the declination against the sphere [measured].** Against atan2(cos ε sin λ, cos λ), the ascension
  is off by at most 3.4e-5 asus. Against asin(sin ε sin λ), the declination is off by at most 0.0026″.

### 20.2 The Sūrya-Siddhānta's instruments (chapter 13; line numbers in editions/surya-siddhanta-full-edition.html)

| Instrument | Verse [text] | Built? | What it measures | Ledger kind |
|---|---|---|---|---|
| śaṅku | 13.20 (:6099); its use is chapter 3 | yes: wraps `ss-chaya.js` | shadow length and tip; altitude; palabhā and latitude; declination | `madhyahna`, `vishuvat`, `ayananta`, `ishta` |
| kapālaka (the bowl) | 13.21 (:6111) names the kapāla; 13.23 (:6133): a copper vessel with a hole beneath sinks 60 times in an ahorātra | yes | nāḍīs of the turn (1.11-1.12) | `kapala` |
| gola-yantra | 13.3-13.17 (:5900-:6065) | yes | the Sun's longitude, declination and ascension on its rings; diurnal circle, cara, antyā | none: it models, it does not observe [reading of 13.16 "kālabhramaṇasādhanam"] |
| yaṣṭi, dhanus, cakra, chāyā-yantras | 13.20 (:6099) | **named only** | the verse gives no geometry | none |
| toya-yantra; mayūra, nara, vānara; the thread-and-sand vessels | 13.21 (:6111) | **named only** | the verse gives no geometry | none |
| nara-yantra | 13.24 (:6145): by day, under a clear Sun, "by the shadow-methods" | **named only** | the verse gives no geometry | none |

The test checks each verse number above by the instrument's own word in the edition's IAST (for example "dhanuś" and
"cakraiś" in 13.20) [measured]. A request to build a named-only instrument is refused with "named in the text but has no
geometry there".

**The śaṅku** [text 3.1-3.42 via `ss-chaya.js`; tested]
- **Readings.**
  - The noon shadow is `ss-chaya.js`'s `noonShadow`, scaled to the owner's gnomon.
  - A shadow gives the altitude (the arc of the legs gnomon : shadow; 3.8 with 2.33).
  - The equinox shadow gives the palabhā and the latitude (3.12b-3.14a).
  - A noon shadow with the text's declination gives the latitude (3.14b-3.17a).
  - A noon shadow at the place gives the declination (3.17b-3.18a).
- **Agreement [measured; 8 latitudes × 24 days × 9 hours].**
  - The instrument's noon shadow vs `noonShadow`: within 0.008″, as an angle at the gnomon.
  - The instrument's shadow vs 12 tan z of the sphere: within 0.0028″.
  - Latitude and declination read back from the noon shadow: within 0.0034″.
  - The altitude read from a shadow: within 0.0061″.
- **A finding in `ss-chaya.js`'s `shadowTip`, reported and not changed [measured].**
  - **Its bhuja (north part)** is exact (1e-10″).
  - **Its length goes through 3.37's dṛgjyā = √(R² − śaṅku²).** With Mādhava's sine, sin² + cos² = 1 holds only to about
    3e-8. So the length is within 0.04″ for z ≥ 5°, but up to 0.32″ (and 0.96″ at noon) within 5° of the zenith.
  - **Its east part is √(chāyā² − bhuja²)** (3.8 applied to those two). It is within 0.048″ more than 1 aṅgula from the
    meridian line. Inside that it degrades as 1/east, up to 19.6″ = 0.0066 aṅgula, which is under half a vyaṅgula.
  - **Consequence.** The instrument's own prediction takes the tip from the components, which have no such loss.
    `shadow()` keeps the text's route for comparison. Nothing a reader of the slab can see is affected.

**The bowl** [text 13.23, 1.11-1.12, 1.34-1.37; theorem; tested]
- **Calibration.** w whole sinkings plus a fraction f of a filling between two transits of one star (one turn) gives
  the bowl's unit, 21,600 ÷ (w + f) prāṇas of the turn. It is exact as a rational in BigInt when f is a ratio.
- **The test's measurements [measured].**
  - A true bowl sinks 60 times between two engine transits of Citrā, Revatī, Maghā and Śravaṇa, on three days and at
    three latitudes. The worst case is |count − 60| ≤ 4.4e-7: the ayanāṃśa's motion in a day.
  - `calibrate({ sinks: 60 })` gives exactly 360/1 prāṇas and 60/1 sinkings a turn.
  - A bowl that sinks 60½ times a turn gives exactly 43,200/121 prāṇas.
- **Converting a count.** A count becomes nāḍīs of the turn, and civil days by 1.34-1.37 (one turn = savana ÷ nakṣatra
  days, to 1e-15).

**The gola** [text 13.3-13.17; theorem; tested]
- **The rings.** 13.5 ("bhagaṇāṃśāṅgulaiḥ … dalitaiḥ", "the degrees of a revolution as aṅgulas, halved", as the
  edition renders it) gives rings of 180 aṅgulas: ½ aṅgula to a degree. The radius is 180 × ρ ÷ 21,600 = 28.648 aṅgulas
  [theorem; 3.0e-8 from 180 ÷ 2π, measured].
- **The diurnal circles (13.6-13.7).** Each stands |δ| ÷ 2 aṅgula from the equator along an hour ring. Its own radius
  is ring radius × dyujyā ÷ R (13.5 "svāhorātrārdhakarṇa"; 2.60).
- **Antyā and carajyā.** The antyā (13.14) = R + carajyā. The carajyā (13.15) = R tan φ tan δ. Measured against the
  sphere:
  - the half-day is within 1.3e-4 asus;
  - the carajyā is within 4.6e-5 R-units;
  - the diurnal radius is within 5.5e-7 aṅgula.
- **Turning with time.** `at(t)` turns the gola with the turn (13.16). The tuṅga and bīja of 13.17 are not modelled
  here; the bīja is `samskara.js`'s.

### 20.3 Jai Singh II's instruments

No verse of the Yantra-prakāra or the Samrāṭ-siddhānta is available here, so none is quoted. That these are his
instruments, and what each was for, is [unverified]. Each geometry below is [theorem], derived from the sphere. The test
ray-traces each instrument's shadow from its construction, for 8 latitudes × 24 days (a year) × 9 hours, and compares it
with where the module says to read it [measured].

| Instrument | Construction for latitude φ (owner's sizes) | Scale and its derivation | Measured against the ray-traced sphere |
|---|---|---|---|
| **Samrāṭ** | hypotenuse along the axis, rising north at φ. Since tan φ = palabhā ÷ 12, the gnomon *is* the equinoctial shadow triangle: base : height : hypotenuse = 12 : palabhā : akṣakarṇa (3.12b-3.13) [theorem]. Quadrants of radius r lie in the equator's plane through a centre on the hypotenuse | nata on the quadrants: arc r × H, chord 2r sin(H/2), from the lowest point; the east quadrant after noon. Declination on the hypotenuse at r × tan δ from the centre: the line from that point along the Sun meets the quadrant's rim [theorem] | quadrant point 2.4e-8 r; arc 4.2e-8 r; declination point 7.4e-9 r; the point's shadow lies on the rim to 2.7e-8 r; gnomon angle 2.3e-11″; graduation marks 4.8e-8 r |
| **Nāḍīvalaya** | a dial in the equator's plane, a pin on each face along the axis | the face lit is the gola (the sign of δ); the pin's shadow lies at the nata from the lowest radius; its length is pin × cot\|δ\| [theorem] | pin-shadow tip 3.9e-8 (relative); declination from the tip 0.0034″; **hour angle the same as the samrāṭ's to 6.9e-5 asus**, and the engine's and the sphere's to 6.9e-5 asus |
| **Jaya Prakāśa**, **Kapāla** | hemispherical bowl, rim level, cross-wires over the centre | the wires' shadow is the antipode C − r·s: depth r sin a, distance from the axis r cos a, bearing A + 180°. The pole's image is south of the axis at depth r sin φ. The equatorial set (hour lines, sign-end declination circles) and the horizontal set (altitude circles, azimuth lines) are tabulated as {east, north, depth} [theorem] | shadow point 3.9e-8 r; read back: nata 6.9e-5 asus, δ 0.0034″, altitude 0.0061″, azimuth 0.0058″ (on the sky); hour-line points 3.8e-8 r |
| **Rāma** | pillar of height h at the centre of a cylinder of radius ρ₀ | the pillar-top's shadow lies on the floor at h cot a while that is within ρ₀; otherwise on the wall at height h − ρ₀ tan a. The change is where tan a = h ÷ ρ₀. Azimuth is the bearing + 180° [theorem] | floor 3.1e-8; wall 6.8e-8 (of the radius); the change 0.0049″; continuous at the change to 4.8e-8 |
| **Digaṃśa** | circular wall of radius r round a pillar | azimuth from the north point through the east: arc r × A, chord 2r sin(A/2); the shadow mark at A + 180° | 0.0058″ on the sky; marks 3.4e-8 r |
| **Ṣaṣṭhāṃśa** | a 60° arc in the meridian, its centre a pinhole. Centred on the equinox noon (z = φ), so φ ± ε falls on it at every latitude tested | at noon the image stands at z = φ − δ from the point under the pinhole, on the side away from the Sun. So the arc can be labelled in declination too. The image's breadth b gives the Sun's diameter b × ρ ÷ r [theorem] | image vs φ − δ 0.0060″; declination label vs the sphere's δ 0.0099″; pinhole ray 3.7e-8 r |
| **Dakṣiṇottara-bhitti** | a meridian wall, two quadrants under a pin | at transit the pin's shadow is the altitude below the level, on the side away from the Sun. A star is sighted from the same mark [theorem] | noon altitude vs 90° − \|φ − δ\| 0.0060″; mark 2.4e-8 r |
| **Rāśivalaya** | twelve gnomons; gnomon k points along the ecliptic's pole (declination 90° − ε, ascension 45 ghaṭī) at the moment sign k's first point (sāyana 30k) is on the meridian; at low latitudes, along whichever pole is above the horizon | the moment is when the meridian's asus = the point's ascension (3.42). The quadrants then lie in the ecliptic. The shadow falls at the Sun's longitude less the nonagesimal (lagna − 90°, the own-horizon lagna of `ss-udaya.js`), on the west quadrant when the Sun is east of it [theorem] | moment vs the sphere's ascension 2.5e-5 asus; gnomon inclination 0.0063″, bearing 0.0063″; nonagesimal vs the sphere's highest ecliptic point 0.013″; shadow angle 2.3e-6°. Karka and Makara lie in the meridian at \|φ − ε\| and φ + ε |
| **Unnatāṃśa** | a vertical ring turning on a vertical axis | altitude from the level diameter: arc r × a, chord 2r sin(a/2) | 0.0061″; marks 4.8e-8 r |

**The table tier [measured].** The same frame on the text's 24 sines (`withSine("table")`), against the sphere, is off
by up to 2.6′ in altitude and 8.6′ in azimuth, at latitudes 10.85°-45° and declinations ±23°.

### 20.4 The ledger: a new kind, `yantra`

- **Readings that fit the existing kinds go there unchanged:**
  - the śaṅku's to `madhyahna` / `vishuvat` / `ayananta` / `ishta`;
  - the bowl's to `kapala`;
  - a star on the meridian wall or the altitude ring to `yamyottara` (its `unnata` and `disha`).
- **Everything else is a `yantra` record.** It holds `yantra`, `body` (`"surya"` or a junction star), `reading`,
  `kapala?` and `calibration?`. The reading is in the instrument's own graduation:
  - `nata` (ghaṭī-vināḍī-prāṇa) with `side`;
  - `kranti` with `gola`;
  - `unnata`;
  - `digamsha`;
  - `natamsha` with `disha`;
  - `rashi` with `sphuta`.
- **Changes to `vedha-lekha.js`.**
  - It requires `yantra.js`.
  - `checkKind` calls `Y.checkReading`.
  - `reduce` calls `Y.reduceReading`.
  - The summary gains `yantra`.
  - `corpus/vedha/LEDGER.md` documents the kind.
  - `samskara.js` `fromLedger` names a `yantra` record as "not yet a row of the fit".
  - `vedha.html` gains one `<script src="yantra.js">`, and `sw.js` caches the file (cache v21). The page's forms
    are unchanged.
- **The instant a reading is compared at.** In order:
  - the bowl's count from sunrise;
  - the meridian (the wall, the ṣaṣṭhāṃśa, a ring read with a disha);
  - the sign's culmination (the rāśivalaya);
  - the reading's own nata;
  - its altitude and side (3.37-3.39 for any body);
  - its azimuth.

  The quantity that fixed the instant has no antara of its own [reading: design choice].
- **What the certifier refuses** [measured]:
  - a modern coordinate inside a reading (`azimuth`, `dec`, `hour_angle`, refused by the existing modern-field scan);
  - an unknown instrument;
  - a half-read pair (`kranti` without `gola`);
  - a nata past 30 ghaṭī;
  - an empty body;
  - a clock time in a note.

**A synthetic season [measured, synthetic: made from the text's forward model, labelled, never stored].** 14 instrument
readings on one day at Ujjayinī were sealed, certified and reduced, along with a star on the meridian wall (as
`yamyottara`) and a śaṅku noon shadow (as `madhyahna`). The 14 readings are: samrāṭ ×3, nāḍīvalaya, jaya prakāśa (Sun,
and Citrā at night), kapāla (alt-az only), rāma, digaṃśa ×2, unnatāṃśa, ṣaṣṭhāṃśa, the wall, and the rāśivalaya.
- Every antara comes back as 0 to the tier's noise: nata 0, declination 0, altitude 0, zenith distance 2e-13′,
  longitude 0. The worst is the azimuth after an instant fixed by an altitude, 2.6e-4′.
- A samrāṭ reading made 2′ north and 30 asus west is measured back as 2.0000′ and 30.000 asus.

### 20.5 Tests

`yantra.test.js` has 18 tests, all passing [measured]. `vedha-lekha.test.js` gained one test for the new kind (15 tests with
§22's sunset test, all passing). `yantra.js` was added to the gate's `LAYERS` (`kala-dvara.test.js`, 19 tests with §22's
trigonometry pin, all passing) and to `scripts/test-all.cjs`.

### 20.6 Left open

- The geometry of the yaṣṭi, dhanus, cakra and the other named-only instruments. The verses do not give it; later texts
  are not in this repository [unverified].
- Physical dimensions of any real Jantar Mantar instrument [unverified]. The attribution of each instrument to Jai
  Singh II, and his own descriptions [unverified]: no text of his is here.
- Refraction: no instrument here models it (as in the rest of the engine).
- The Sun's semi-diameter: the shadow-edge reading of a real dial is not modelled. The ṣaṣṭhāṃśa's image breadth is
  the one place the diameter enters.
- The precision of `ss-chaya.js`'s `shadowTip` near the zenith and the meridian (§20.2). It is reported, not changed.
  Taking its tip from the components would remove the loss; that is the owner's decision.
- `vedha.html` has no form for `yantra` records yet: the ledger takes them through files or code.

## 21. The observations we already had: the ancestors' eclipses, through the text's own clocks (fourteenth revision)

The owner: "we already had observations, and festivals and tithis and main events are already observations".

### 21.1 What in the repositories is an observation [measured: the council's khagola review, every file of all seven repositories]
- **Observations of the sky (class a): the fifteen dated eclipses** of Parameśvara (13, 1398-1432) and Nīlakaṇṭha (2,
  1502 and 1517) in `corpus/jyotirmimamsa/eclipses.json`; **Parameśvara's observed ayanāṃśa** (15° complete in Kali 4536,
  same file); and, outside this repository, **Tycho's 1563 Jupiter-Saturn conjunction** quoted in a test of
  bharat-ephemeris-web. Nothing else in any repository is a sighting.
- **Festivals and tithis are not observations here.** Every festival or tithi dataset in the seven repositories was made
  by an engine: bharat-ephemeris-web's 1,717 festival dates (its "Bharat substrate" with terms fitted to modern
  ephemerides, Lahiri ayanāṃśa), printed almanac tables, or no stated source. A festival day people kept records *which
  almanac they followed* (class b), and every such almanac here was itself computed. A tithi is an angle (SS 14.12: 12° of
  elongation); nobody sees one end. What can be seen is a crescent, an eclipse, the Moon at a star — the ledger's kinds.
- **Festival days carry almost no information about the sky** [measured by the khagola review]: the engine reproduces 17
  of 19 festival days people kept, while missing the ancestors' eclipse contacts by up to 3 ghaṭikā; the deciding tithi
  boundary of the median festival day is 13 ghaṭī from the edge of its window.
- **Sphuta's "Digital Jantar Mantar"** computes instruments from a modern kernel: a simulation, not an observation (§20).

### 21.2 The saṃskāra could not use them; now it can [theorem, tested]
Until this revision `samskara.js` had no solar-eclipse equation and no "seen / not seen" one, so the robust fit took 0 of
the 15 records and changed nothing (council KH-03). It now has:
- **`grahana-surya`**: a solar eclipse's timed contacts at a site. The text's own eclipse (SS 4 with the ch.5 lambana and
  nati) gives the contacts at the text's values; under a correction the conjunction moves with Moon − Sun and the
  half-durations with the latitude, the discs and the rate, all carried on the model, while the parallax — a function of
  the Sun's place and the hour, which a correction of minutes moves to second order — is held at the text's value
  [reading]. With an inequality: the eclipse is possible here (4.11 with 5.12).
- **`grahana-drishta`**: an eclipse seen or not seen, untimed, as an inequality on SS 6.13's limit (a twelfth of the
  Moon; three minutes of the Sun).
- `fromLedger` now takes the owner's own solar contacts the same way.
- Closed loops [measured, `samskara.test.js`]: at the text's values the model gives `ss-grahana.js`'s contacts exactly
  (1e-9 d); a Moon moved 3′ and a node moved −30′ come back from solar contacts alone; at the text's values the sign of
  every seen/not-seen row is the text's own verdict, for every eclipse of 2026-2030.

### 21.3 The readings, as rows [text: eclipses.json's own glosses]
`corpus/jyotirmimamsa/readings.json` writes the glosses' readings as rows and names every assumption:
- a shadow "of n padas" is a man's shadow in his own feet, turned into the 12-aṅgula śaṅku's shadow as n × 12 ÷ 7
  [unverified convention: a man = 7 of his padas; no local text states it; 6.5 and 7.5 are reported too];
- the half of the day, where the record is silent, is the forenoon [reading]; the script prints each such row's residual
  if it were the afternoon: 15-25 ghaṭikā off in every case, far beyond any error of the text the timed records show (at most about 3), so the forenoon is taken;
- SDip-77's "release seen in the afternoon, the shadow at the beginning of 11 padas" is ambiguous ("at the beginning" may
  be the first contact) and is kept out of the timings (its "seen" stays);
- Syānandūrapura and Harihara (their towns would need modern geography; the text also puts both a day earlier, KH-05),
  SDip-82 (day unresolved in the source) and the Gokarṇa halves of SDip-69/70 are excluded; Nāvākṣetra (SDip-72) is taken at
  the village's palabhā [reading].
- The site is Parameśvara's village, palabhā 2;18 and deśāntara −2° (JM p.36), as `ss-grahana.test.js` builds it.

### 21.4 The result [recorded: `node scripts/parampara-samskara.cjs`; held by `parampara.test.js`]
Seven timed solar readings (six used: SDip-72, 74 ×2, 79, 80, 81) through the text's own clocks — the śaṅku's shadow
clock (3.37-3.39) and the text's sunset — and twelve seen/not-seen rows, fitted by the robust saṃskāra at Kali 16,52,000
(about A.D. 1423), the Sun held (shadows fix it; six contacts cannot tell a common shift of Sun, Moon and node from a real
one):

| man = | Moon (elongation) | node | Moon − node | χ²/dof | set aside |
|---|---|---|---|---|---|
| 7 padas | −8.37 ± 1.04′ | −73.5 ± 6.7′ | +65.2 ± 6.8′ | 2.3 | SDip-81 (4.3σ) |
| 6.5 | −6.78 ± 1.02′ | −76.5 ± 6.1′ | +69.7′ | 6.1 | — |
| 7.5 | −10.65 ± 1.06′ | −70.8 ± 8.5′ | +60.1′ | 2.5 | SDip-81 (4.7σ) |

**Parameśvara's own correction.** His published mean places at Kali 16,51,700 (JM p.34, the corpus's
`parameshvara_epoch`) differ from the text's at the same instant — sunrise at Laṅkā, where Āryabhaṭa's day begins
[reading] — by Sun +5.9′, Moon −2.1′, apogee −73.9′, node −63.3′ [measured]. In the combinations no sidereal zero can move:
**elongation −8.0′ against the fit's −8.4 ± 1.0′, and Moon − node +61.3′ against +65.2 ± 6.8′.** (At Laṅkā midnight, the
text's own day origin, the elongation would be +175′: the day origins differ by a quarter day, which is how the comparison
was found to need sunrise.)

So the engine, given only the readings Parameśvara recorded, finds the correction he made from them. The loop the
tradition describes — gaṇita, vedha, antara, saṃskāra (§0.2) — closes again on its own records, with no modern number
anywhere. It is a check of the method and of the reading of the records; it is not a measurement of today's sky: the
correction belongs to A.D. 1400s and carries no rate. Two seen/not-seen rows stay violated after the fit (SDip-69's "not
seen at the village" and SDip-74's "seen by the keen-sighted", the latter by 0.01′).

## 22. The council, and what launch needs (fifteenth revision)

The owner: "summon the full team of Rishi, astronomers, physicians, all time best astrologers and audit everything and
analyse collectively all work done and make the final engine ready for launch and public availability".

### 22.1 Who sat, and how
Eight review roles, each run as an independent reviewer that could change nothing and had to show its evidence for
every finding (a command and its output, or a file and line): **ṛṣi** (fidelity to the texts), **gaṇitajña** (the
mathematics), **jyotiṣī** (pañcāṅga, festivals, muhūrta, daśā), **khagola-vid** (astronomy, and what is an observation),
**vaidya** (health, fasting, fate: everything the public will read), **śilpī** (release engineering, offline, design),
**rakṣaka** (security, privacy, licences) and **satya-parīkṣaka** (every public claim). They are roles, not people: a
finding weighs what its evidence weighs. Their full reports stay outside the repository; what they changed is below,
commit by commit. Three builders worked beside them: the public pañcāṅga, `yantra.js` and its form, and two fixers for
the legacy pages and the library.

### 22.2 What they found
| Role | P0 | P1 | P2 | The heaviest finding |
|---|---|---|---|---|
| ṛṣi | 1 | 6 | 15 | the Pāṇini edition's Kaṭapayādi table gave त थ द ध = 1-4 |
| gaṇitajña | 0 | 3 | 12 | a grazing eclipse threw and emptied the 400-day table |
| jyotiṣī | 0 | 5 | 6 | a kṣaya-month year lost its festivals; a night saṅkrānti could land before itself |
| khagola-vid | 2 | 6 | 10 | an eclipsed Moon shown "up" in daylight; the saṃskāra could use none of the ancestors' records |
| vaidya | 4 | 7 | 7 | a download promising 31.5 °C body temperature and no ageing; a breath-hold card with no caution |
| śilpī | 2 | 8 | 14 | vedha.html unreadable in light mode; nothing kept internal files off a public host |
| rakṣaka | 2 | 12 | 9 | an imported ledger ran script in vedha.html, and again on every load |
| satya | 12 | 12 | — | 13 of 15 library "Sūrya-Siddhānta" verses were not the text's; modern-ephemeris numbers presented as the Sūrya-Siddhānta's |

Several P0s were found by more than one role (the "cure protocol" PDF by three; the "total" eclipse by two).

### 22.3 What was done (each with its test)
| Commit | What |
|---|---|
| `6eaca1a` | vedha.html certifies every imported or kept ledger and escapes every value (R-01; a crafted file is refused and runs nothing); the eclipse eye-safety note; the eclipse list labelled as the text's predictions with the ancestors' measure of its error; night solar eclipses not listed "here"; the horizon state of every contact (KH-01); the kṣaya month's rites, the night saṅkrānti's day, polar sites, moonrise within its day (JY-01, JY-02); the lagna-gaṇḍānta's real junction (JY-03); the blank "cure protocol" PDF removed from the tree |
| `b1d5122` | **siddhanta-panchanga.html**: the public pañcāṅga on the sovereign engine, in clock time for any place; month, festivals, eclipses, daśā |
| `efb2267` | grazing eclipses reported, not thrown (G-1; 0 crashes in 1900-2100, there were 30); the eclipse scan 3× faster and provably the same (G-2); one rule for sunrise and sunset (G-3); §18.2 corrected and the trigonometry pinned (G-4, G-5); vedha.html's light mode, nav and offline start (S-01, S-05, S-06) |
| `ca88fcc` | `scripts/build-site.cjs`: only what the site needs is published (S-02) |
| `3370816` | the saṃskāra takes solar contacts and seen/not-seen eclipses; the ancestors' readings give Parameśvara's correction (§21) |
| `33be98e`, `90dcb74` | **yantra.js** and its form in vedha.html (§20) |
| `f9f385f` | the legacy pages: every false claim relabelled or removed (P0-2 to P0-5, P0-9 to P0-11, KH-02, KH-08), live badges, the health line on every page, the breath card's caution, fear labels softened, the ṛtu by SS 14.9-14.10, Gulika by BPHS 3.66-3.70, payment inert until a click, no network after load, the design tokens repaired; `legacy-honesty.test.js` keeps the removed claims out |
| `62dc0a0` | share cards without the removed claims |
| `12ee60f` | the library and editions: the reader's Sūrya-Siddhānta verses copied from the edition with their numbers, nothing composed; every reader verse carries its source or "unverified"; the Kaṭapayādi table corrected; the 31.5 °C chapter and the "dreadful transition" verse gone; the IBM claims marked unverified; a child-welfare note at BPHS 93.2; private material removed from a public edition |
| `a79b7ca`, `ebd8ea6` | a Content-Security-Policy on all 18 pages (strict on the two sovereign pages); the last text fixes; old builders that would restore the removed verses now refuse to run |

### 22.4 Left for the owner
- **Launch.** Done: the site (`_site/`, built by `node scripts/build-site.cjs`) is live on its own subdomain,
  offline.bharatephemeris.com; the repository has a LICENSE; the public repository is a fresh snapshot of this tree,
  made by `scripts/export-public.cjs`.
- **Rights.** `corpus/bphs/sanskritdocuments.json` is the full sanskritdocuments.org BPHS transcription; the Parāśara
  edition prints 268 verses of seven chapters from it. Its terms are recorded in `corpus/bphs/README.md` only as "free
  for non-commercial use per the site's terms"; archiving them verbatim, with URL and date, is open. LICENSE describes
  it and the Wikisource text (R-12).
- **Content.** Whether to delete, not just mark, the IBM paragraphs of the Mahā-grantha edition; the annex prices; the
  unused `computeDecadeHingeStatus` and `computeQuantumAdvantageScaling`.
- **Engine.** Moving the pinned trigonometry onto the sine tier (§18.2); `ss-chaya.js`'s shadow tip near the zenith
  and the meridian (§20.6); rāhukāla, yamagaṇḍa and choghaḍiyā are not in the sovereign layer and are not invented.
- **The sky.** Accuracy against the sky is still measured only by the ancestors' fifteen records (§21) — the owner's
  own season is what will measure it now (§19).
- **Cautions.** The breath-hold, fasting, infant and eye-safety wordings are general guidance; a physician should
  review them.

## 23. The three choices (2026-10-08 → 2026-10-09)

The owner's decisions of 2026-10-08, after the ShunyaBheda map (seven ayanāṃśas on one page; two "Sūrya-Siddhānta" engines 2.8° apart in the Moon; rules differing page by page), superseded §18.6's two-tier arrangement. Every page now offers three choices, one code path each; the labels on every block come from `math-core.js` `TIERS`.

| id | name | what it is | span |
|---|---|---|---|
| `ss+parameshvara` (default) | सूर्य-सिद्धान्त + परमेश्वर-संस्कार | the text, with Parameśvara's correction from his own eclipse records applied to the Moon and the node (§21; `corpus/parampara/samskara.json`, read by `parampara.js`; no number typed in code) | −50,000 … +50,000 |
| `ss` | the plain Sūrya-Siddhānta | civil days from Laṅkā midnight (no ΔT), the text's ε (2.28) and ayanāṃśa (3.9-3.10) everywhere, vāra from sunrise, SS 2.67 karaṇas, SS 1.55 saṃvatsara (reading A), amānta month with adhika/kṣaya | −50,000 … +50,000 |
| `drik` | आधुनिक भारतीय (दृक्) | the series fitted to the owner's N-body (restarted from NASA-JPL DE440s states every 720 days), its reduction and Earth orientation, the precise Citrā-pakṣa ayanāṃśa (true), the owner's eclipse search (`drik-grahana.js`); refused outside its span, no foreign fallback | 1850.0 … 2150.0 |

`ss-tier.js` is the text tiers' adapter (gate-clean: only sovereign requires, no trigonometry); `math-core.js`'s classical path delegates to it and equals the sovereign modules bit for bit at 200 instants over ±50,000 years (`tier-unity.test.js`). The vendored VSOP87B + ELP/MPP02 and Astronomy Engine are referees in tests only and are no longer loaded or precached by any page.

### 23.1 Measured [measured, held by the suites]
- Dṛk tier: λ ≤ 0.9″ against DE440s (every 20 days, 5,476 epochs; not independent of JPL); 2026 end times within 0.83 s and sunrise within 2.3 s of the referees; eclipses 1900–2100: 457 lunar and 452 solar, one-to-one with Astronomy Engine, peaks within 9 s.
- 100,000-year calendars (`scripts/calendar-100k.cjs`, Kali −46,897 … 53,099): plain text 99,997 years, 1,236,845 months, 0 failures, adhika − kṣaya = 36,881 against the text's rate 36,881.67; the default tier 38,885 adhika, 2,004 kṣaya.
- The default tier against the sky in 2026 (every 5 days, tropical frame): Sun −101′ mean; Moon rms 130′ (max 289′); Moon − Sun mean +1′, rms 84′ (max 199′) — so a tithi end differs from the sky's by about 2.7 h rms. Parameśvara's correction moves the mean; the text's Moon has only the manda equation, and that scatter is the text's. The pages say which choice they show; the dṛk choice is one click away.

### 23.2 The paramparā as data (owner, 2026-10-08: observation is never mandatory)
`corpus/parampara/registry.json` (59 records: 20 observations, 12 determinations, 9 rules, 9 doctrines, 7 owner-statements, 2 instrument operations), each with its Sanskrit line, edition, page and locus; `corpus/sources/time-units.json` (every unit with the text that states its ratio; the engine's chain canonical; pala = 1/60 ghaṭī); `corpus/parampara/graha.json` (the BPHS naming layer). Only Parameśvara's determination is applied today; Lalla's and the Grahacāranibandhana bījas, Govindasvāmin's corrections and Śrīpati's rule are recorded, not applied — they belong to the Āryabhaṭa/Parahita canon (`parahita-madhyama.js`), so their honest use is a labelled Kerala-paramparā choice, an owner decision (§23.4).

### 23.3 Owner audit items adopted (2026-10-08, cross-checked in code)
A1 finite and physical-domain guards (`dhruva.js`, `panchanga.checkSite`); A2 one ε in the text tier (done by delegation); A3 the north-line and solstice-pair records in the vedha ledger, shown beside the text's values as a preview only.

### 23.4 Left for the owner
- Seal DRAFT BE-S13 (SANKALP-DRAFTS.md): the three choices supersede BE-S02's default frame.
- Ujjayinī's meridian: the site uses 75.7885°; TRUTH-AUDIT §3.4 has 75.7683°; Parameśvara quotes Āryabhaṭa's "1/15 of the circle north of Laṅkā" for its latitude (registry UJJAYINI-fifteenth).
- SS 1.55 saṃvatsara: reading A (remainder 0 = Vijaya) is the default; reading B is one index back.
- Which Caitra opens a year that ends with an adhika Caitra [unverified convention].
- A fourth choice from the Kerala paramparā (Parahita + the recorded bījas) — or the bījas offered as labelled saṃskāras.
- A research page for the owner's own derivations that no page shows today (the gurutva force-law tiers, the N-body anchor mode, the 2PN term, the libration, the Earth orientation from first principles, the candravākyas, the chedyaka drawing), each with its measured figure and status.
- Editions of the Gītā, the Chāndogya, the Navagraha Stotra and the Purāṇas (none in any repository): allow a source host in the environment's network settings, or upload them; the owner-statement records then become [text].

## 24. The fourth choice, Parameśvara's ayanāṃśa, and the 101′ (2026-10-09, later)

### 24.1 What the owner asked

"Put in the fourth, Kerala-paramparā choice too, and a research page with every derivation on it; against the sky in 2026 we were within a minute and within arcseconds — when did it become 101 minutes? Find the mistakes and fix them all. Whatever got this much corrected by applying only Parameśvara: apply the rest too, each where it applies, see what improves and improve it all; leave nothing wrong." The owner also sealed BE-S14 ("never deny evolution of knowledge") the same morning.

### 24.2 Measured: the paramparā's records applied one by one

`scripts/parampara-apply.cjs` applies each applicable record of `corpus/parampara/registry.json` as a model of `samskara.js` or `parahita-madhyama.js` (no number typed in the script) and scores it against the dṛk tier (`siddhanta-tier.js`, λ ≤ 0.9″ vs DE440s) in the tropical frame — each candidate with its own ayanāṃśa — over 2026 (every 5 days) and 1900–2100 (every 97 days). Candidate minus sky, arcminutes, mean · rms · max [measured]; the data is `corpus/research/parampara-apply.json`.

| candidate (2026) | Sun | Moon | Moon − Sun | ayanāṃśa − Citrā-pakṣa |
|---|---|---|---|---|
| `ss` the plain text | −100.6 · 101.3 · 117.8 | −91.4 · 123.9 · 279.5 | +9.2 · 84.0 · 189.5 | −79.3 |
| `par` + the record's Moon and node | −100.6 · 101.3 · 117.8 | −99.8 · 130.3 · 288.5 | **+0.8** · 83.7 · 198.6 | −79.3 |
| `par+ayanPhase` + his ayanāṃśa as a phase (**the default now**) | **−43.0** · 44.6 · 60.2 | −42.2 · 93.9 · 230.9 | +0.8 · 83.7 · 198.6 | −21.7 |
| `par+ayanAmp` the same record read as an amplitude (not adopted) | −6.6 · 13.6 · 23.8 | −5.8 · 84.1 · 194.5 | +0.8 · 83.7 · 198.6 | +14.7 |
| `par+keralaLin` + Nīlakaṇṭha's linear rule instead | −44.2 · 45.8 · 61.4 | −43.4 · 94.4 · 232.2 | +0.8 · 83.7 · 198.6 | −22.9 |
| `par+keralaLin+sunEpoch` + his epoch Sun as a shift (not adopted) | −38.3 · 40.1 · 55.6 | −43.4 · 94.4 · 232.2 | −5.1 · 83.9 · 204.3 | −22.9 |
| `kerala` Parahita + Dṛggaṇita means, the text's epicycles (**the fourth choice**) | −36.0 · 37.9 · 53.3 | −51.9 · 94.3 · 218.0 | −15.9 · **80.2** · 192.4 | −22.9 |
| `kerala+vakyaMoon` the same with candravakya.js's Moon | −36.0 · 37.9 · 53.3 | −51.9 · 95.2 · 219.9 | −15.9 · 81.2 · 194.3 | −22.9 |

1900–2100: `ss` Sun −98.4 · 99.2 · 123.6; `par+ayanPhase` Sun −40.8 · 42.7 · 66.0, ayanāṃśa −23.2 · 23.5 · 29.7; `par+ayanAmp` Sun −6.1 · 13.2 · 25.3, ayanāṃśa +11.5 · 13.6 · 23.8; `kerala` Sun −34.0 · 36.2 · 58.7, Moon −48.7 · 94.9 · 243.1, Moon − Sun −14.8 · 82.4 · 204.3.

Two mistakes of the measurement itself were found and fixed on the way: `parahita-madhyama.js` counts its Kali day from **sunrise** at Laṅkā (Āryabhaṭa's day), a quarter day after the text's midnight — read at midnight, the Parahita Moon missed Parameśvara's epoch by 3.29° (= 13.18°/day ÷ 4); read at sunrise it reproduces his four epoch places to 0.16–0.43′ [measured, tier-unity.test.js (13)]. And the `{ num, den }` arcseconds of `parahitaArcsec` must be reduced as a rational, not as `Number(num)/Number(den)` (which is exact only by luck).

### 24.3 What was adopted, and what was not

**Corrected the same afternoon (owner: "adopt every improvement; the evolution of knowledge is our primary motive").** The phase reading below was superseded. The paramparā has *three* determinations of the ayanāṃśa, not two: Āryabhaṭa's statement that it was zero in Kali 3600 (registry `ABH-no-ayanacalana-3600`), Nīlakaṇṭha's 14°26′ at Kali day 1,643,524 and Parameśvara's 15° in Kali 4536. Fitting the text's libration on both its parameters — its phase and its greatest value (27° + δ) — to the three by least squares (`scripts/parampara-samskara.cjs ayanamshaDetermination()`, a grid refined three times) gives **phase 0.001°, δ = +1.8613°** (greatest value 28.8613°, rate 57.72″ a year), residuals **0.0′, −0.5′, +0.5′** [measured]. The phase-only reading meets the two Kerala figures but breaks Āryabhaṭa's zero by 57.6′; the amplitude-only reading is within a minute of the joint fit. So the reading I had refused in the morning as "unattested" is the one the three texts jointly determine: Āryabhaṭa's zero stands and the swing is wider, which is exactly what his zero and Nīlakaṇṭha's figure imply between them (14.43° in 899.6 years = 57.8″ a year). The default tier now carries both parameters (`sphuta.js ayanamshaSS(spandas, phaseDeg, amplitudeDeltaDeg)`); the Kerala tier's linear rule is now the line through the same three records (0.9620′ a year, its zero at Kali 3600.0, residuals 0.0, −0.5, +0.5′), with Nīlakaṇṭha's stated 0.9′ kept as a cross-check. Effect in 2026: the default's ayanāṃśa 24.492° against Citrā-pakṣa's 24.233° (+15.5′; the morning's phase reading: −21.7′); the tropical Sun from −100.6′ (the text) to about −7′ mean (table: `par+ayan3`). What the records cannot settle — whether the libration's turn (now at 28.86°, about 2235 CE) is real — stays with the owner (24.7).

*The morning's account, kept as written:*

- **The default tier now carries Parameśvara's ayanāṃśa.** His determination — "पञ्चदशभागाः पूर्णा इति परीक्ष्य निर्णीतम्", 15° complete in Kali 4536 (registry `PAR-ayanamsha-4536`) — is applied as a change of the **phase** of the text's libration (SS 3.9-3.10): +57.6′ in his year, 3.2° of the libration angle (64 years: one turn of 600 a yuga is 7,200 years, so 1° is 20 years — the morning's text said 12, a unit slip the other session's audit caught). One record cannot tell a phase from an amplitude change [theorem]; Nīlakaṇṭha states the rate as 0.9′ a year, the text's own 54″ (`NIL-ayanamsha-rate`), so the amplitude stands and the zero moves [reading]. Cross-check: his 14°26′ at Kali day 1,643,524 is met within **+1.3′** (the text alone: −56.3′) [measured]. It is not fitted with the eclipses (they see the elongation and the argument of latitude, both sidereal): `scripts/parampara-samskara.cjs ayanamshaDetermination()` writes it into `samskara.json` (`ayanamsha`, `corrects: ["moon","node","ayanamsha"]`), `parampara.js` validates it, `ss-tier.js` applies it through `sphuta.js ayanamshaSS(spandas, phaseDeg)`. Effect in 2026: the tropical Sun from −100.6′ to −43.0′; the sidereal places, the tithi and the nakṣatra unchanged; sunrise, the lagna and the shadow move with the sāyana Sun (sunrise by under three minutes [measured]).
- **The amplitude reading was not adopted** (morning) although it lands nearer the sky in 2026 (−6.6′): "no text states a 28.85° amplitude or a 57.7″ rate" — wrong, see the correction above: three texts determine it jointly.
- **Parameśvara's epoch Sun is not a correction to the text**: read at sunrise, "Meṣa 0°15′" is Āryabhaṭa's mean Sun (0.243° there) to 0.4′ — a difference of canons (+5.9′ in 1421 between the two mean Suns), not an observation of the Sun. Applied as a shift it worsens the elongation (−5.1′). Not adopted.
- **The vākya Moon** (`candravakya.js`, canon `parahita`, the 31.5 epicycle [unverified]) differs from the text's epicycle on the same means by less than the scatter; the Kerala tier keeps the text's attested epicycles.
- **Nothing recorded touches the text's year or the Moon's one-term equation**: the Sun's −21′ sidereal (2026 mean) and the elongation's 84′ rms are the text's own; see 24.4.

### 24.4 Where the 101′ came from

The arcsecond figure belongs to the dṛk choice alone (λ ≤ 0.9″ against DE440s, 1850–2150, its label). The "one minute" is the elongation of the default choice, +0.8′ mean in 2026 after Parameśvara's Moon and node — the quantity his eclipses fix. The 101′ is the **text's tropical Sun**, and it decomposes exactly as sidereal + ayanāṃśa [theorem]:

- −79.3′ (2026) is the **ayanāṃśa**: the text's libration has its zero at Kali 3600 (499 CE, Āryabhaṭa's statement `ABH-no-ayanacalana-3600`) and moves at 54″ a year [text]; the Citrā-pakṣa convention has its zero near 285 CE and moves at the real 50.29″ [standard]. *(morning's reading, superseded — see 24.3)* Parameśvara's record moves the zero 64 years earlier and removes 57.6′ of it; the remaining −21.7′ is the rate. *(afternoon)* With the three determinations fitted, the zero stays Āryabhaṭa's and the rate is 57.7″; the ayanāṃśa then stands +15.5′ from Citrā-pakṣa in 2026 (its rate exceeds the real 50.3″ by 7.4″ a year, so the sign of the residual turns over the centuries: −0.1′ in 1900, +25′ in 2100 [measured, parampara-apply.json]).
- −21.3′ (2026 mean) is the **Sun's sidereal place**: the text's year is 365.258756 civil days (SS 1.37 with 14.10), the sky's 365.25636, so the mean Sun falls behind the stars by 0.1415′ a year [theorem from the two numbers] — 85′ since Parameśvara's epoch. No recorded rule corrects the Sun's year; the Kerala year (Āryabhaṭa's integers, 365.258681 d) differs from the text's by 6.5 s, and its mean Sun stands at −13′ sidereal in 2026 [measured].
- The **Moon's** scatter (84′ rms in the elongation, 2.75 h rms in a tithi's end) is the text's single manda equation; the tradition's second lunar inequality (Muñjāla, the Kerala dvitīya-sphuṭa) is in no local edition, so it is not built.

The research page (`ganita-shala.html`, section 2) computes this decomposition live for any instant, from the engine's own labels and rates.

### 24.5 The fourth choice: केरल-परम्परा (परहित + दृग्गणित)

`ss-tier.js` `{ samskara: 'kerala' }`, `math-core.js` `TIERS.kerala` (`TIER_IDS = ['ss+parameshvara', 'ss', 'kerala', 'drik']`; aliases `kerala`, `kerala-parampara`, `parahita`, `drgganita`):

- **Mean places**: the Sun, Moon, apogee and node of `parahita-madhyama.js` — Āryabhaṭa's integers over 1,577,917,500 civil days (Gītikā 3, the local edition), Haridatta's Śakābda-saṃskāra from Śaka 444, Parameśvara's fractions 4/5, 1, 11/12 — counted from sunrise at Laṅkā [reading: registry `PAR-epoch-1651700`; measured: his epoch reproduced to 0.43′]. Āryabhaṭa's Sun apogee 78° (`ABH-apsides-G9`) [text].
- **Equations**: the text's epicycles (SS 2.34-2.38) on those means [reading: no local edition attests Āryabhaṭa's]. The five star-planets, mean Jupiter (the saṃvatsara) and every rule are the text's, labelled (the Parahita planets' integers are in the registry, `PH-yugabhoga`; their epicycles are not).
- **Ayanāṃśa**: the line through the paramparā's three determinations (Āryabhaṭa's zero in Kali 3600, Nīlakaṇṭha's 14°26′, Parameśvara's 15°) by least squares, 0.9620′ a year [reading], residuals 0.0, −0.5, +0.5′ [measured]; Nīlakaṇṭha's stated 0.9′ a year is kept as a cross-check (as stated it misses Āryabhaṭa's zero by 56′). Whether the Kerala tradition's ayanāṃśa librates is for the owner (24.7).
- **One code path**: the tier's calendar is `Panchanga.withPlaces(places, name, ayanamshaFn)` — `panchanga.js build()` now takes the tier's ayanāṃśa — so sunrise, the day, the lagna, the meridian, the shadow, the muhūrtas, moonrise and the months follow the tier. `dayOf`, `dayEvents`, `lagna`, `meridian` and `shadow` in `ss-tier.js`, and `tierDay`'s cache key in `math-core.js`, are now per tier (they assumed the Sun was the text's in every text tier).
- **Eclipses**: `samskara.js model()` takes `opts.ayanamsha`; the Kerala model is the text's canon moved at Parameśvara's epoch by the difference of the canons' mean places and per yuga by the difference of their rates (`sunApogee.rev` added for the text's moving apogee against Āryabhaṭa's fixed one); it equals the exact places to 3.6 × 10⁻⁶° over ±50,000 years [measured, tier-unity.test.js (13)].
- **The 100,000-year calendar**: `scripts/calendar-100k.cjs --tier kerala` → `corpus/calendar/manifest-100k-kerala.json` (99,997 years, 0 failures, 872 s on 4 workers). Measured per tier (deep-time.test.js): the first year opens −50001-12-18 (the text's tiers −50001-12-20), the last 50000-05-26 (−05-24); 2026-27 has an adhika Jyeṣṭha in all three; 2028-29 ends with Phālguna in the Kerala calendar and with an adhika Caitra in the text's.

### 24.6 What changed on the pages

Every page offers the four choices (they are read from `M.TIER_IDS`); the legacy pages load `parahita-madhyama.js` before `ss-tier.js`; the sovereign pañcāṅga describes the fourth choice; `museum.html`'s Δ instrument compares three tiers; the service worker is v27. **The research page** `ganita-shala.html` (strict CSP, its own script `ganita-shala-page.js`): the four choices against the sky at any instant (re-computed to 0.1′ in `scripts/ganita-shala-ui.test.cjs`), the 101′ decomposition live, the paramparā table from `corpus/research/parampara-apply.json`, and the derivations ledger `corpus/research/derivations.json` — each entry with the text it starts from and the assertion its test makes, copied, not retyped.

### 24.8 सूक्ष्म-काल: the resolution the vargas demand (the owner's point of the afternoon)

The owner: the micro-charts of Bhṛgu and Parāśara — D-60, D-144, D-150 — presuppose readings of time at a micro level; that requirement had not been stated, so the engine's accuracy "was not complete"; the time loop is several loops, ℤ/27 (nakṣatra) and ℤ/9 (graha), and their links make the accuracy. Measured at Ujjain on 2026-10-09 (`sukshma-kala.js`, the research page §5): one ṣaṣṭyāṃśa (30′) is 90–137 s of clock for the lagna (its rate 0.22–0.33°/min through the day), 54 min for the Moon, 12.2 h for the Sun; one D-150 part (12′) is 36–55 s, 22 min, 4.9 h. Against that, the default text choice's Moon stands 94′ rms from the sky (3.1 ṣaṣṭyāṃśas, 7.8 nāḍyaṃśas), the ayanāṃśa choice alone moves every placement by 22–79′, and the Vimśottarī balance moves 2.7–9.1 days per 1′ of the Moon (Sūrya … Śukra). The dṛk choice (0.9″, lagna 2″) decides every placement off an edge today.

`sukshma-kala.js` (sovereign, no import, micro-arcsecond BigInt): the sixteen vargas of BPHS ch.6 as the local edition states them (and D-144, D-150 as [standard]), each index and margin exact, `assess` under a declared uncertainty, `resolution` in time for given rates, and the lattice ℤ/27 × ℤ/4 ≅ ℤ/108 ≅ 12 × 9 with the theorem that one pāda is one navāṃśa (3°20′ exactly: 12,000,000,000 µas), the 27 → 9 lord projection equal to dasha.js's, and the daśā days per minute of arc. `sukshma-kala.test.js` checks every rule against `computeVarga` on 6,000 longitudes and the exact boundaries. The rules were audited against the local edition's own "गणित / तकनीक" lines (a reader on a small model, 2026-10-09): thirteen agree verbatim; D-16's dual-sign start is a text variant in the edition ("usually Dhanu"), D-24's even signs are stated only as a reversed deity sequence with no sign output, D-27's sign offsets by element are not in the edition at all (it prints the arc as 1°1′20″, a slip for 1°6′40″), and for D-60 verse 6.40 takes the sixty *names* of even signs in reverse while the part's sign is counted forward in every text: those four carry a note in `SukshmaKala.VARGAS` and the first three are tagged [standard] rather than [text]. What it does not do: no division adds a measurement; it states what each choice can decide. The śāstras' micro-vargas presuppose a Moon and a lagna known to their parts; the sky choice meets that within its span, a text choice within its own model only — and the frame (the ayanāṃśa) is the first thing to settle for any micro-placement.

### 24.9 What the library holds (the owner's afternoon request: "Bhāskara, Līlāvatī, Piṅgala, Pāṇini … what is hidden in them")

Ten readers (on the small model, as the owner asked) read the ten editions for time structure, number and measurement, quoting lines; this repository re-checked each quoted line at its place (`corpus/research/library-sweep.json`: 196 findings, 136 found verbatim at their lines, the rest the readers' paraphrases or the editions' commentary, marked). The research page §6 shows all of it. What is hidden and worth acting on, in order of weight:

1. **The text's numbers already carry the owner's tower.** ν₃ — how many times 3 divides a count — puts every count the texts give the engine on a level k of (ℤ/3^k ℤ, 2, k) [theorem on the printed numbers, `sukshma-kala.test.js`]: the Sun's revolutions 4,320,000 = 2⁸·3³·5⁴, the yuga's and the kalpa's years, the day's 21,600 prāṇas, the 27 nakṣatras, the 108 cells and the Aṣṭottarī's 108 years all sit at **k = 3** — the owner's "Savitar gate" is the Sun's level in the text; the Moon's 57,753,336 at k = 1; the solar months at k = 4, the circle's arcseconds at k = 4, the spanda lattice at k = 8. And **both canons' day counts are units mod 3** (1,577,917,828 and the risings 1,582,237,828 carry no 3; Āryabhaṭa's 1,577,917,500 and 1,582,237,500 carry one 3 — 3 divides them once, not twice): a day count prime to 3 is invertible in every ℤ/3^k, which is why Āryabhaṭa's kuṭṭaka (Gaṇita 32, in the engine) always solves the ahargaṇa from residues. This is the exact form of what the owner called the link between the loops: the nakṣatra loop ℤ/27 is k = 3, the graha loop ℤ/9 is k = 2, the quotient is the Vimśottarī lord map, and the day's prāṇas, the Sun's bhagaṇa and the 108 cells share the level. Nothing here is a sky claim.
2. **Āryabhaṭa's ratios need no yuga length.** 1,582,237,500 : 4,320,000 = 210965/576 = 366.25868 rotations a year and 57,753,336 : 4,320,000 = 13.368828 lunations… are exact fractions within one yuga [theorem]; the engine uses the counts (kala-dvara.js) but the page did not say that the ratios are year-length-free constraints. Said now. (kala-dvara.js cites "Gītikā 3", the traditional numbering; the local edition labels the verse 1.1 — the source string now says both.)
3. **Bhāskara's tātkālikī gati** (the instantaneous daily motion from the koṭiphala, edition line 85) is not in the engine: samskara.js and utsava.js take the motion as a finite difference over a day. The edition's formula line reads "(koṭiphala × doḥphala-kalā) ÷ trijyā", which is not the standard reading (the anomaly's daily motion enters); the verse must be read before it is built. **Candidate, not built.**
4. **BPHS**: the Aṣṭottarī daśā (years 6, 15, 8, 17, 10, 19, 12, 21, sum 108), the nisarga āyus (sum 120), the sūkṣma-antardaśā rule (parent × child ÷ 120 at every level — dasha.js has it), the seven-unit time ladder assigned to the seven grahas, the Vimśopaka 20-point strength, the dignity table 60-45-30-15-8-4-2-0 (a 2⁻ᵏ series the printed sthāna-bala numerals depart from — an edition issue). Structural; none changes a position.
5. **Śulba 3.1**: the printed fourth triple 36, 12, 37 does not close (1440 ≠ 1369); 35, 12, 37 does; math-core lists [12, 35, 37]; the edition now carries the note under the verse (the Sanskrit left as printed, flagged, not emended). The √2 rule 577/408 (error 2.1 × 10⁻⁶) and the circle-from-square r = (a/6)(2 + √2) are used.
6. **Mādhava**: R = 3437′44″48‴ with 2πR = 21,600′ gives π ≈ 3.14159275 (9.5 × 10⁻⁸ above π) — used (spanda-ganita); the edition's "accurate to 12 decimal places" is flagged unverified there and stays so.
7. **Piṅgala** (halving/doubling/zero, 2ⁿ, mod 2 — partly in math-core's prastāra functions), **Pāṇini** (the calendar-unit stems: māsa, ardhamāsa, saṃvatsara, ṣaṇmāsa, nakṣatra as time-marker, pūrṇamāsī month naming — the last is the engine's full-moon month rule; the rest are grammar, not arithmetic), **Brahmagupta** (kuṭṭaka, vargaprakṛti, bhāvanā, zero — all used; the sign rules not), **Sūrya-Siddhānta** (every count used; the yoga-tārā latitudes in the corpus; 27 × 800′ = 30 × 720′ = 21,600′ = the day's prāṇas — one prāṇa of time is one minute of arc, kala-dvara's identity).
8. **Measurement candidates the readers found are not observations:** the Mahā-grantha's dated items (Rāma's birth configuration, Achar's Mahābhārata eclipse pair, the Kṛttikās "not deviating", Thuban as pole star, Konārka's alignment) are attributions in the edition's own commentary with no local source; they could only be tested against a sky the dṛk tier refuses (outside 1850–2150). Listed on the page as candidates with the readers' caveats, nothing adopted.

### 24.10 The ring tower in the text's numbers (the owner's "look at the math of the master meta-theorem again")

What the owner's (ℤ/3^k ℤ, 2, k) says, checked on the engine's own integers (`sukshma-kala.test.js`, all [theorem]):

- **The generator is right for every level.** 2 is a primitive root of ℤ/3 and 2² = 4 ≢ 1 (mod 9), so 2 is a primitive root of ℤ/3^k for every k: its orbit is the whole unit group, of size 2·3^(k−1) — 2, 6, 18, 54, 162 for k = 1…5, which are exactly the owner's "sovereign units" column (18 at k = 3, 162 at k = 5). The units of the nakṣatra ring ℤ/27 are one 18-cycle under doubling; the units of the graha ring ℤ/9 one 6-cycle.
- **The two loops and their link.** The nakṣatra loop is ℤ/27 (k = 3), the graha loop ℤ/9 (k = 2); the Vimśottarī lord map n ↦ n mod 9 is the ring quotient ℤ/27 → ℤ/9. Its kernel is {1, 10, 19} — Aśvinī, Maghā, Mūla, the three gaṇḍānta nakṣatras — and they share one lord (Ketu). The nakṣatras whose number is a multiple of 3 (Kṛttikā … Revatī) take the lords Sūrya, Rāhu, Budha and no others. The 108 cells (27 × 4 = 12 × 9) sit at k = 3 with the Sun.
- **Where the text's counts sit.** ν₃ gives each count its level: the Sun's revolutions 4,320,000 = 2⁸·3³·5⁴, the yuga's years, the day's 21,600 prāṇas, 27 and 108 at k = 3 — all ≡ 0 in ℤ/27: the Sun is the zero of the nakṣatra ring. The Moon's 57,753,336 at k = 1 (≡ 12 mod 27, ≡ 3 mod 9). The solar months and the circle's arcseconds at k = 4, the spanda lattice 328,050,000,000 at k = 8.
- **The day count is the identity.** The Sūrya-Siddhānta's civil days 1,577,917,828 and star-risings 1,582,237,828 are ≡ 1 both mod 27 and mod 9: a unit, and the unit 1 — one yuga advances every 27-fold and 9-fold cycle of days by exactly one step, and the kuṭṭaka on the day count always solves. Āryabhaṭa's 1,577,917,500 carries one 3 (≡ 24 mod 27); the apogee and node counts of both canons are units (ν₃ = 0).

What this does and does not do: it is the exact algebra of the printed numbers and the daśā rules, a structure the engine already runs (`sukshma-kala.js` LORDS, LATTICE); it changes no position and makes no sky claim. The owner's levels beyond k = 8 (k = 16, 20, 24, …) have no count in the texts to sit on; the texts stop at the spanda lattice.

### 24.7 Left for the owner

- Seal DRAFT BE-S13 as revised (four choices; the default's ayanāṃśa zero from `PAR-ayanamsha-4536`).
- Whether the Kerala ayanāṃśa should librate (the text's model with the Kerala zero) or stay linear as Nīlakaṇṭha words it.
- The Parahita planets: an edition attesting Āryabhaṭa's epicycles would let the Kerala tier carry its own five planets; until then they are the text's, labelled.
- The Moon's second inequality: not in any local edition; the owner's observing season (`vedha.html`) is the only way to measure it here.

## Appendix A. The three designs and the three judges

| Design | Fidelity lens | Honesty lens | Reachability lens | Sum |
|---|---|---|---|---|
| Śuddha-Saura (SS only; śaṅku, kapāla, gola) | 33 | 32 | 33 | **98** |
| Vedha-Yantra (SS core, GPS rate, Gauss–Newton refit) | 33 | 31 | 30 | **94** |
| Vākya-Dṛk (Parahita core, vākya storage, Parameśvara loop, SS as cross-check) | 34 | 34 | 31 | **99** |

The vākya design wins by one point. The reachability judge ranked the SS-only design first. The resolution here: the vākya design is the destination; the SS-only design supplies the build order and the text-method corrector; the refit design supplies the tests (closed loop, identifiability freeze, sealed ledger). None of the three designs stated the chain of §1 or used the dhruva frame.

## Appendix B. What the thirty skeptics changed

| Claim | Outcome |
|---|---|
| Table digits, per series | stand |
| kṣa = ṣa = 6 | stands; "kṣaḥ śūnyam" is a modern mnemonic, not the Sadratnamālā |
| anusvāra and visarga carry no value | not stated in the verse; forced by the texts' own numbers |
| *vāmato gatiḥ* | a separate maxim |
| The request's chart | wrong, 31 of 34 |
| π verse | 31 right digits, 32nd wrong, first printed 1965 |
| Haridatta | 683 CE is tradition |
| Śakābda rule | zero at Śaka 444; Parahita keeps Āryabhaṭa's integers in a 576-year, 210,389-day cycle |
| Parameśvara's ayanāṃśa | 15° at Kali 4536; the 14°26′ of the worked example is for 1398 |
| Nīlakaṇṭha's doctrine | composed after 1517; 1504 is the common computation date |
| Kapāla | one sinking is one nāḍī of the turn (SS 1.12), not of mean solar time |
| Śaṅku sensitivity | corrected to the table in §4.4 |
| Kapāla drift | no published figure |
| Common ahargaṇa | 16,82,112 printed, 16,83,112 by the text's definition |
| 15-eclipse mean syzygy check | recomputed; within 2 days; six exceed 0.588 d |

## Appendix C. The library pipeline (already fixed in PR #3)
`scripts/library/sync_library.py` step 8 regenerated six hand-expanded edition files and removed hundreds of lines from one. It now runs only with `--regenerate-digests`. The script's "Python 3.12" stamp now reports the real version. Both are in `04db876`.

## Reproduce
```
node --test katapayadi.test.js kala-dvara.test.js parahita-madhyama.test.js dhruva.test.js
node --test ss-numbers.test.js sphuta.test.js panchanga.test.js dasha.test.js muhurta.test.js utsava.test.js gurutva.test.js gurutva-purna.test.js spanda-ganita.test.js
node --test pn2-schwarzschild.test.js granthas.test.js ss-chapters.test.js ss-udaya.test.js
node --test ss-graha.test.js ss-chaya.test.js ss-grahana.test.js ss-drishya.test.js
node --test ss-ahargana.test.js ss-parilekha.test.js ss-madhava.test.js candravakya.test.js vedha-lekha.test.js samskara.test.js
node --test yantra.test.js parampara.test.js legacy-honesty.test.js
node scripts/parampara-samskara.cjs    # the ancestors' readings through the text's own clocks (§21)
node scripts/build-site.cjs --check    # the publish set (§22)
node scripts/derive-gurutva.cjs        # regenerates corpus/gurutva/candra.json and gurutva-candra.js, byte-identical
node scripts/derive-gurutva-purna.cjs  # the complete law: corpus/gurutva/purna.json and gurutva-purna-candra.js (about two minutes)
PLAYWRIGHT_CHROMIUM_EXECUTABLE=/opt/pw-browsers/chromium npm test
```
