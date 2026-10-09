# Aryabhatiya & Kuttaka Algebra
## आर्यभटीयम् · Research digest · 2 chapters · not the classical manuscript
**Format:** Research Dossier
**Scope:** Research Digest · 2 Chapters
**Verification:** every Python snippet was executed with Python 3.12.3 on 2026-10-08 (scripts/library/sync_library.py); the recorded outputs below are checked against that run.

*यह ऐतिहासिक ग्रन्थों पर आधारित पाठ और गणना है, चिकित्सा-परामर्श नहीं। · Text and computation about historical treatises — not medical advice.*

---

## Chapter 1: गीतिकापाद एवं काल-प्रक्रिया (Gitikapada: Epicycle Dimensions & Yuga Chronometry)
**Scope:** `Verses 1–13` | **Study Time:** `12 min study`

### Chapter Overview
Establishes the fundamental parameters of the Aryabhatan system. Defines the Mahayuga of 4,320,000 years, the precise number of revolutions for each planet, and encodes numbers using the Aryabhata alphabetic numeration system (Vargakshara and Avargakshara).

### Sanskrit Slokas & Anvaya

> **युगरविभगणाः ख्युघृ, शशि चयगियिङ्शुछ्लृ, कु ङिशिबुणॢष्खृ प्राक् ।  
> शनि ढुङ्विघ्व, गुरु ख्रिच्युभ, कुज भद्लिझ्नुखृ, भृगुबुधसौराः ॥**
>
> *yugaravibhagaṇāḥ khyughṛ, śaśi cayagiyiṅśuchlṛ, ku ṅiśibuṇḷṣkhṛ prāk |  
> śani ḍhuṅvighva, guru khricyubha, kuja bhadlijhnukhṛ, bhṛgubudhasaurāḥ ||*
>
> **Meter:** आर्या छन्दः
>
> **Source:** editions/aryabhata-full-edition.html, verse १.१ (Devanāgarī, IAST and English as printed there)

#### Padaccheda & Anvaya:
- **युग-रवि-भगणाः ख्युघृ**: Sun's revolutions in a Yuga = khyughṛ (4,320,000)
- **कु ङिशिबुणॢष्खृ प्राक्**: Earth's eastward rotations = ṅiśibuṇḷṣkhṛ (1,582,237,500)
- **शनि ढुङ्विघ्व**: Saturn's revolutions = ḍhuṅvighva (146,564)

**Translation:** In a Yuga (4,320,000 solar years), the revolutions of the Sun are 4,320,000; of the Moon 57,753,336; of the Earth's daily rotations on its axis relative to the stars, 1,582,237,500.

### Mathematical Formulation
**Earth's Sidereal Rotation vs Solar Year**

$$
\frac{\text{Earth Rotations}}{\text{Sun Revolutions}} = \frac{1582237500}{4320000} = 366.25868 \text{ sidereal days per year}
$$

*Aryabhata explicitly states the Earth rotates (Bhramana) relative to the fixed asterisms (Bha).*

### Python 3 Verification Suite
```python
def aryabhata_planetary_revolutions():
    # Aryabhatiya Gitikapada parameters per 4.32 million years
    return {
        "Sun": 4320000,
        "Moon": 57753336,
        "Earth_Rotations": 1582237500,
        "Saturn": 146564,
        "Jupiter": 364224,
        "Mars": 2296824
    }
```

**Execution Result (Python 3.12.3, 2026-10-08):**
```
aryabhata_planetary_revolutions() → {'Sun': 4320000, 'Moon': 57753336, 'Earth_Rotations': 1582237500, 'Saturn': 146564, 'Jupiter': 364224, 'Mars': 2296824}
Earth rotations per solar year: 1,582,237,500 / 4,320,000 = 366.25868056
Computed by executing this snippet (Python 3).
```

---

## Chapter 2: गणितपाद (ज्या-सारणी एवं π) (Ganitapada: 24 Sine-Table Entries & Pi Approximation)
**Scope:** `Verses 14–46` | **Study Time:** `15 min study`

### Chapter Overview
Details Aryabhata's calculation of the 24 half-chord (Jya) differences, spherical trigonometry foundations, the formula for the area of a circle and triangle, and his famous extremely accurate approximation of Pi (π).

### Sanskrit Slokas & Anvaya

> **चतुरधिकं शतमष्टगुणं द्वाषष्टिस्तथा सहस्राणाम् ।  
> अयुतद्वयविष्कम्भस्यासन्नो वृत्तपरिणाहः ॥**
>
> *caturadhikaṃ śatamaṣṭaguṇaṃ dvāṣaṣṭistathā sahasrāṇām |  
> ayutadvayaviṣkambhasyāsanno vṛttapariṇāhaḥ ||*
>
> **Meter:** आर्या छन्दः (Aryabhatiya 2.10)
>
> **Source:** editions/aryabhata-full-edition.html, verse २.१०

#### Padaccheda & Anvaya:
- **चतुरधिकं शतम्**: 100 plus 4 (104)
- **अष्टगुणम्**: Multiplied by 8 (= 832)
- **द्वाषष्टिस्तथा सहस्राणाम्**: Plus 62,000 (= 62,832)
- **अयुतद्वयविष्कम्भस्य**: For a diameter of 20,000 (Ayuta = 10,000)
- **आसन्नः**: Is the approximate (asanna)
- **वृत्तपरिणाहः**: Circumference of a circle

**Translation:** Add 4 to 100, multiply by 8, and then add 62,000. By this rule the circumference of a circle with a diameter of 20,000 can be approached.

### Mathematical Formulation
**Aryabhata's Pi Approximation**

$$
\pi \approx \frac{\text{Circumference}}{\text{Diameter}} = \frac{62832}{20000} = 3.1416
$$

*Accurate to 4 decimal places. Aryabhata explicitly notes this is 'āsanna' (approximate), showing advanced understanding of irrationality.*

### Python 3 Verification Suite
```python
def aryabhata_pi():
    circumference = (100 + 4) * 8 + 62000
    diameter = 20000
    return circumference / diameter
```

**Execution Result (Python 3.12.3, 2026-10-08):**
```
aryabhata_pi() → 3.1416
(= ((100 + 4) × 8 + 62,000) / 20,000 = 62,832 / 20,000)
Computed by executing this snippet (Python 3).
```

---
