# Brahmasphuta Siddhanta & Bhavana
## ब्राह्मस्फुटसिद्धान्तः · Zero Mathematics & Cyclic Quadrilaterals
**Format:** Research Dossier
**Scope:** Research Digest · 2 Chapters
**Verification:** every Python snippet was executed with Python 3.12.3 on 2026-10-08 (scripts/library/sync_library.py); the recorded outputs below are checked against that run.

*यह ऐतिहासिक ग्रन्थों पर आधारित पाठ और गणना है, चिकित्सा-परामर्श नहीं। · Text and computation about historical treatises — not medical advice.*

---

## Chapter 1: शून्य-प्रक्रिया एवं बीजगणित (Zero Mathematics (Śūnya): Arithmetics of Nothingness)
**Scope:** `Chapter 18` | **Study Time:** `10 min study`

### Chapter Overview
Brahmagupta is the first mathematician to formally define the arithmetic rules of zero (Śūnya) and negative numbers (Ṛṇa). This chapter lays down the foundations of integer arithmetic over the entire number line.

### Sanskrit Slokas & Anvaya

> **धनयोर्धनमृणमृणयोर्धनर्ष्णयोरन्तरं समैक्यं खम् ।  
> ऋणमृणधनयोर्घातो धनमृणयोर्धनवधो धनं भवति ॥  
> खगुणो धनमृणमथवा स्वं भवति खखण्डितं खं खम् ।**
>
> *dhanayordhanamṛṇamṛṇayordhanarṣṇayorantaraṃ samaikyaṃ kham |  
> ṛṇamṛṇadhanayorghāto dhanamṛṇayordhanavadho dhanaṃ bhavati ||  
> khaguṇo dhanamṛṇamathavā svaṃ bhavati khakhaṇḍitaṃ khaṃ kham |*
>
> **Meter:** आर्या छन्दः
>
> **Source:** स्रोत अपरीक्षित · source unverified — this wording of the zero rules is not in editions/brahmagupta-full-edition.html (whose 18.30–32 is itself marked unverified) or any other text in this repository.

#### Padaccheda & Anvaya:
- **सम-ऐक्यं खम्**: The sum of equal positive and negative is zero (Kham)
- **ख-गुणो धनम् ऋणम्**: Zero times a positive or negative is zero
- **ख-खण्डितं खं खम्**: Zero divided by zero is zero (0/0 = 0)

**Translation:** The sum of positive and negative is their difference; if they are equal it is zero. The product of a positive and a negative is negative. A positive or negative multiplied by zero becomes zero. Zero divided by zero is zero.

### Mathematical Formulation
**Brahmagupta's Laws of Zero**

$$
a + (-a) = 0, \quad a \times 0 = 0, \quad \frac{0}{0} = 0, \quad \frac{a}{0} = \text{khaccheda (left as a quantity with zero divisor)}
$$

*Brāhmasphuṭasiddhānta 18.34–35 gives these rules and leaves a/0 as "khaccheda" — a quantity with zero as divisor — without evaluating it; the name khahara and its reading as an unbounded quantity are Bhāskara II's (Bījagaṇita, 12th c.), which the snippet's label follows. 0/0 = 0 is Brahmagupta's statement; modern algebra leaves 0/0 undefined.*

### Python 3 Verification Suite
```python
class BrahmaguptaZero:
    @staticmethod
    def add(a, b): return a + b
    @staticmethod
    def mul(a, b): return a * 0 if b == 0 else a * b
    @staticmethod
    def div(a, b): return "Khahara (Infinity)" if b == 0 and a != 0 else 0
```

**Execution Result (Python 3.12.3, 2026-10-08):**
```
BrahmaguptaZero.div(5, 0) → 'Khahara (Infinity)'
BrahmaguptaZero.div(0, 0) → 0
BrahmaguptaZero.mul(7, 0) → 0
Computed by executing this snippet (Python 3).
```

---

## Chapter 2: वर्गप्रकृति एवं चक्रीय चतुर्भुज (Vargaprakriti & Cyclic Quadrilateral Geometry)
**Scope:** `Chapter 12 & 18` | **Study Time:** `18 min study`

### Chapter Overview
Contains Brahmagupta's formula for the area of a cyclic quadrilateral (generalizing Heron's formula) and his powerful Bhāvanā composition law for solving second-order Diophantine equations (Pell's equation: Nx² + 1 = y²).

### Sanskrit Slokas & Anvaya

> **स्थूलफलं त्रिचतुर्भुजबाहुप्रतिबाहुयोगदलघातः ।  
> भुजयोगार्धचतुष्टयभुजोनघातात् पदं सूक्ष्मम् ॥**
>
> *sthūlaphalaṃ tricaturbhujabāhupratibāhuyogadalaghātaḥ |  
> bhujayogārdhacatuṣṭayabhujonaghātāt padaṃ sūkṣmam ||*
>
> **Meter:** आर्या छन्दः
>
> **Source:** editions/brahmagupta-full-edition.html, verse १२.२१

#### Padaccheda & Anvaya:
- **भुजयोगार्धचतुष्टय**: Four half-sums of the sides (Semiperimeter s)
- **भुजोन-घातात्**: Product of s diminished by each side
- **पदं सूक्ष्मम्**: The square root (padam) is the exact area

**Translation:** The exact area (of a cyclic quadrilateral) is the square root of the product of four sets of half the sum of the sides diminished by each side.

### Mathematical Formulation
**Brahmagupta's Cyclic Quadrilateral Area**

$$
K = \sqrt{(s-a)(s-b)(s-c)(s-d)}, \quad s = \frac{a+b+c+d}{2}
$$

*Reduces to Heron's formula for triangles when d=0.*

### Python 3 Verification Suite
```python
import math
def brahmagupta_cyclic_area(a, b, c, d):
    s = (a + b + c + d) / 2
    return math.sqrt((s - a) * (s - b) * (s - c) * (s - d))
```

**Execution Result (Python 3.12.3, 2026-10-08):**
```
Input: cyclic quadrilateral with sides 3, 4, 5, 6 (semiperimeter s = 9)
brahmagupta_cyclic_area(3, 4, 5, 6) → 18.973666
Computed by executing this snippet (Python 3).
```

---
