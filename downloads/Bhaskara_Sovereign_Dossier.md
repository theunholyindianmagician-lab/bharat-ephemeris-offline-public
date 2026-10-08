# Lilavati, Bijaganita & Chakravala
## सिद्धान्तशिरोमणिः · Siddhanta Shiromani (Bhaskara II)
**Format:** Research Dossier
**Scope:** Research Digest · 2 Chapters
**Verification:** every Python snippet was executed with Python 3.12.3 on 2026-10-08 (scripts/library/sync_library.py); the recorded outputs below are checked against that run.

*यह ऐतिहासिक ग्रन्थों पर आधारित पाठ और गणना है, चिकित्सा-परामर्श नहीं। · Text and computation about historical treatises — not medical advice.*

---

## Chapter 1: चक्रवाल-प्रक्रिया (बीजगणित) (Chakravala: Cyclic Algorithm for Diophantine Equations)
**Scope:** `Bijaganita` | **Study Time:** `20 min study`

### Chapter Overview
The pinnacle of ancient Indian algebra: Bhaskaracharya's cyclic (Chakravala) method to solve Nx² + 1 = y². It surpasses Fermat and Euler's methods discovered 600 years later, finding minimal integer solutions via continuous cyclic substitution.

### Sanskrit Slokas & Anvaya

> **ह्रस्वज्येष्ठक्षेपकान् न्यस्य तेषामुपान्तिमाभ्यां... (चक्रवाल-सूत्रम्)**
>
> *hrasvajyeṣṭhakṣepakān nyasya teṣāmupāntimābhyāṃ...*
>
> **Meter:** उपजाति छन्दः
>
> **Source:** स्रोत अपरीक्षित · source unverified — no text in this repository carries this verse; it is not presented as a located quotation.

#### Padaccheda & Anvaya:
- **ह्रस्व-ज्येष्ठ**: The minor (x) and major (y) roots
- **क्षेपकान्**: The interpolator/additive (k)

**Translation:** Setting down the minor root, major root, and interpolator, apply the cyclic composition by minimizing the new interpolator to find exact integral roots.

### Mathematical Formulation
**Chakravala Cyclic Invariant**

$$
N\left(\frac{mx+y}{k}\right)^2 + 1 = \left(\frac{my+Nx}{k}\right)^2, \quad k' = \frac{m^2 - N}{k}
$$

*Select integer 'm' such that (mx+y)/k is integer, and |m²-N| is minimized.*

### Python 3 Verification Suite
```python
def chakravala_step(N, x, y, k):
    # Solves Nx^2 + k = y^2 cyclically
    m = int(N**0.5)
    while (m * x + y) % k != 0:
        m += 1
    new_k = (m * m - N) // k
    new_x = (m * x + y) // abs(k)
    new_y = (m * y + N * x) // abs(k)
    return new_x, new_y, new_k
```

**Execution Result (Python 3.12.3, 2026-10-08):**
```
Input: N = 61, seed (x, y, k) = (1, 8, 3), since 61·1² + 3 = 8²
chakravala_step(61, 1, 8, 3) → (x, y, k) = (5, 39, -4)
check: 61·5² + (-4) = 1521 = 39² is True
Computed by executing this snippet (Python 3).
```

---

## Chapter 2: गोलाध्याय एवं तात्कालिक-गति (Goladhyaya: Instantaneous Motion & Differential Calculus)
**Scope:** `Siddhanta Shiromani (Gola)` | **Study Time:** `15 min study`

### Chapter Overview
Bhaskaracharya develops the concept of 'Tatkalika Gati' (instantaneous motion). He formulates the exact differential of the sine function to calculate planetary velocity variations.

### Sanskrit Slokas & Anvaya

> **बिम्बार्धस्य कोटिज्यागुणस्त्रिज्याभक्तः फलं स्यात् तात्कालिकी गतिः ।**
>
> *bimbārdhasya koṭijyāguṇastrijyābhaktaḥ phalaṃ syāt tātkālikī gatiḥ |*
>
> **Meter:** आर्या छन्दः
>
> **Source:** स्रोत अपरीक्षित · source unverified — no text in this repository carries this verse; it is not presented as a located quotation.

#### Padaccheda & Anvaya:
- **कोटिज्या-गुणः**: Multiplied by the Cosine (Koṭijyā)
- **तात्कालिकी गतिः**: Instantaneous velocity (Differential)

**Translation:** The differential (instantaneous motion) of a sine is proportional to its cosine multiplied by the difference in angle.

### Mathematical Formulation
**Bhaskara's Sine Differential**

$$
\delta(\sin \theta) = \cos \theta \cdot \delta \theta
$$

*Formulated centuries before Newton and Leibniz as 'Tātkālikī Gati' (instantaneous velocity).*

### Python 3 Verification Suite
```python
import math
def bhaskara_differential_sine(theta_deg, delta_theta_deg):
    R = 3438 # Standard radius in minutes
    # d(R sin(x)) = R cos(x) dx
    dx_rad = math.radians(delta_theta_deg)
    return R * math.cos(math.radians(theta_deg)) * dx_rad
```

**Execution Result (Python 3.12.3, 2026-10-08):**
```
Input: θ = 60.0°, Δθ = 1.0°, R = 3438′
bhaskara_differential_sine(60.0, 1.0) → 30.0022 arcminutes
Computed by executing this snippet (Python 3).
```

---
