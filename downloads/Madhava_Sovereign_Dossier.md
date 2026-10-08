# Madhava Calculus & Infinite Series
## युक्तिभाषा · Kerala School of Mathematics (Yuktibhāṣā)
**Format:** Research Dossier
**Scope:** Research Digest · 1 Chapter
**Verification:** every Python snippet was executed with Python 3.12.3 on 2026-10-08 (scripts/library/sync_library.py); the recorded outputs below are checked against that run.

*यह ऐतिहासिक ग्रन्थों पर आधारित पाठ और गणना है, चिकित्सा-परामर्श नहीं। · Text and computation about historical treatises — not medical advice.*

---

## Chapter 1: माधव-ज्या-प्रक्रिया एवं अनन्त श्रेणियाँ (Madhava-Leibniz Series & Sine/Cosine Expansions)
**Scope:** `Tantrasangraha / Yuktibhasha` | **Study Time:** `22 min study`

### Chapter Overview
Madhava of Sangamagrama (14th century) discovered the infinite Taylor-Maclaurin series for Sine, Cosine, and Arctangent (Pi) three centuries before European calculus.

### Sanskrit Slokas & Anvaya

> **व्यासे वारिधिनिहते रूपहृते व्याससागराभिहते ।  
> त्रिशरादिविषमसंख्याभक्तमृणं स्वं पृथक्क्रमात् कुर्यात् ॥**
>
> *vyāse vāridhinihate rūpahṛte vyāsasāgarābhihate |  
> triśarādiviṣamasaṃkhyābhaktamṛṇaṃ svaṃ pṛthakkramāt kuryāt ||*
>
> **Meter:** आर्या छन्दः
>
> **Source:** editions/madhava-full-edition.html, verse १.१

#### Padaccheda & Anvaya:
- **वारिधि-निहते**: Multiplied by 4 (oceans)
- **विषम-संख्या-भक्तम्**: Divided by odd numbers (3, 5, 7...)
- **ऋणं स्वं**: Minus and Plus (Alternating signs)

**Translation:** Multiply the diameter by 4 and divide it by 1. Then decrease and increase it alternately by the diameter multiplied by 4 and divided by the successive odd numbers 3, 5, 7, etc.

### Mathematical Formulation
**Madhava's Infinite Series for Pi (Arctangent)**

$$
\frac{\pi}{4} = 1 - \frac{1}{3} + \frac{1}{5} - \frac{1}{7} + \frac{1}{9} - \dots
$$

*Known in the West as the Gregory-Leibniz series, discovered by Madhava circa 1350 CE.*

### Python 3 Verification Suite
```python
def madhava_pi_series(terms):
    pi_fourth = 0
    sign = 1
    for n in range(terms):
        denominator = 2 * n + 1
        pi_fourth += sign * (1 / denominator)
        sign *= -1
    return pi_fourth * 4
```

**Execution Result (Python 3.12.3, 2026-10-08):**
```
madhava_pi_series(100000) → 3.1415826536
(100,000 alternating terms of the Mādhava series for π/4, multiplied by 4)
Computed by executing this snippet (Python 3).
```

---
