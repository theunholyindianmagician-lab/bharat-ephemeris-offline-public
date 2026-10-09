# Sulba Sutras & Vedic Geometry
## शुल्बसूत्राणि · Baudhāyana & Āpastamba Geometry
**Format:** Research Dossier
**Scope:** Research Digest · 1 Chapter
**Verification:** every Python snippet was executed with Python 3.12.3 on 2026-10-08 (scripts/library/sync_library.py); the recorded outputs below are checked against that run.

*यह ऐतिहासिक ग्रन्थों पर आधारित पाठ और गणना है, चिकित्सा-परामर्श नहीं। · Text and computation about historical treatises — not medical advice.*

---

## Chapter 1: बौधायन-शुल्बसूत्र एवं समकोण-त्रिभुज (Baudhayana: The Pythagorean Theorem & Square Root of 2)
**Scope:** `Baudhayana Sulba Sutra` | **Study Time:** `12 min study`

### Chapter Overview
Contains the earliest explicit statement of the Pythagorean theorem for the diagonal of a rectangle, and highly precise rational approximations for √2 used in Vedic altar construction.

### Sanskrit Slokas & Anvaya

> **दीर्घचतुरस्रस्याक्ष्णया रज्जु: पार्श्वमानी तिर्यग्मानी च यत् पृथग्भूते कुरुतस्तदुभयं करोति ॥**
>
> *dīrghacaturasrasyākṣṇayā rajjuḥ pārśvamānī tiryagmānī ca yat pṛthagbhūte kurutastadubhayaṃ karoti ||*
>
> **Meter:** सूत्र शैली
>
> **Source:** editions/sulba-full-edition.html

#### Padaccheda & Anvaya:
- **दीर्घचतुरस्रस्य**: Of a rectangle
- **अक्ष्णया रज्जु:**: The diagonal rope
- **पार्श्वमानी तिर्यग्मानी च**: The flank and horizontal sides
- **तदुभयं करोति**: Produces both areas combined

**Translation:** The diagonal rope of a rectangle produces both which the flank and the horizontal side produce separately. (c² = a² + b²)

> **समस्य द्विकरणी। प्रमाणं तृतीयेन वर्धयेत्तच्च चतुर्थेनात्मचतुस्त्रिंशोनेन सविशेषः।**
>
> *samasya dvikaraṇī. pramāṇaṃ tṛtīyena vardhayettacca caturthenātmacatustriṃśonena saviśeṣaḥ.*
>
> **Meter:** सूत्र शैली
>
> **Source:** editions/sulba-full-edition.html

#### Padaccheda & Anvaya:

**Translation:** The measure (diagonal of a square) is increased by its third, and this third by its fourth, diminished by the thirty-fourth part of that fourth. (Approximation of √2)

### Mathematical Formulation
**Baudhayana's Approximation for Root 2**

$$
\sqrt{2} \approx 1 + \frac{1}{3} + \frac{1}{3 \cdot 4} - \frac{1}{3 \cdot 4 \cdot 34} = \frac{577}{408} \approx 1.4142156\dots
$$

*Accurate to 5 decimal places. Used to construct perfectly scaled Agnicayana altars.*

### Python 3 Verification Suite
```python
def baudhayana_sqrt_2():
    return 1 + (1/3) + (1/(3*4)) - (1/(3*4*34))
```

**Execution Result (Python 3.12.3, 2026-10-08):**
```
baudhayana_sqrt_2() → 1.4142156862745097
(in exact rational arithmetic, 1 + 1/3 + 1/(3·4) − 1/(3·4·34) = 577/408)
Computed by executing this snippet (Python 3).
```

---
