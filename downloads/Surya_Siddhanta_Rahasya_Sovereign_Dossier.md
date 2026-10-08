# Surya Siddhanta Rahasya
## सूर्यसिद्धान्त रहस्यम् · Mathematical Astronomy (14 Adhikaras)
**Format:** Research Dossier
**Scope:** Astronomical Treatise · 14 Chapters
**Verification:** every Python snippet was executed with Python 3.12.3 on 2026-10-08 (scripts/library/sync_library.py); the recorded outputs below are checked against that run.

*यह ऐतिहासिक ग्रन्थों पर आधारित पाठ और गणना है, चिकित्सा-परामर्श नहीं। · Text and computation about historical treatises — not medical advice.*

---

## Chapter 1: मध्यमाधिकारः (Mean Motion & Mahayuga Calculus)
**Scope:** `Verses 1.1 – 1.70 (70 श्लोक in the edition) · shown here: 1.20, 1.37` | **Study Time:** `14 min study`

### Chapter Overview
Establishes the fundamental chronological coordinate system of Vedic astronomy. Decodes the 4,320,000-year Mahayuga, the exact solar civil days per cycle (1,577,917,828 days), Ahargana day-count summation, and mean planetary velocity vectors.

### Sanskrit Slokas & Anvaya

> **इत्थं युगसहस्रेण भूतसंहारकारकः ।  
> कल्पो ब्राह्मं अहः प्रोक्तं शर्वरी तस्य तावती ॥**
>
> *itthaṃ yugasahasreṇa bhūtasaṃhārakārakaḥ ।  
> kalpo brāhmaṃ ahaḥ proktaṃ śarvarī tasya tāvatī ।।*
>
> **Meter:** सूर्य-सिद्धान्त 1.20
>
> **Source:** editions/surya-siddhanta-full-edition.html#v1-20 — Devanāgarī, IAST, padaccheda-anvaya and English rendering as printed in the edition (सूर्य-सिद्धान्त 1.20)

#### Padaccheda & Anvaya:
- **इत्थम्**: इस प्रकार
- **युग-सहस्रेण**: एक हजार युगों से
- **भूत-संहार-कारकः**: भूतों/प्राणियों के संहार का हेतु
- **कल्पः**: कल्प
- **ब्राह्मम् अहः**: ब्रह्मा का दिन
- **प्रोक्तम्**: कहा गया
- **शर्वरी**: रात्रि
- **तस्य**: उसकी
- **तावती**: उतनी ही (समान माप की)

**Translation:** Thus a thousand yugas make the kalpa that brings about the dissolution of beings. That kalpa is called a day of Brahmā; his night is of equal length.

> **वसुद्व्यष्टाद्रिरूपाङ्कसप्ताद्रितिथयो युगे ।  
> चान्द्राः खाष्टखखव्योमखाग्निखर्तुनिशाकराः ॥**
>
> *vasudvyaṣṭādrirūpāṅkasaptādritithayo yuge ।  
> cāndrāḥ khāṣṭakhakhavyomakhāgnikhartuniśākarāḥ ।।*
>
> **Meter:** सूर्य-सिद्धान्त 1.37
>
> **Source:** editions/surya-siddhanta-full-edition.html#v1-37 — Devanāgarī, IAST, padaccheda-anvaya and English rendering as printed in the edition (सूर्य-सिद्धान्त 1.37)

#### Padaccheda & Anvaya:
- **वसुद्व्यष्टाद्रिरूपाङ्कसप्ताद्रितिथयः**: १,५७,७९,१७,८२८ सावन (वसु ८, द्वि २, अष्ट ८, अद्रि ७, रूप १, अङ्क ९, सप्त ७, अद्रि ७, तिथि १५)
- **युगे**: महायुग में
- **चान्द्राः**: चान्द्र दिन (तिथि-गण)
- **खाष्टखखव्योमखाग्निखर्तुनिशाकराः**: १,६०,३०,००,०८० (ख ०, अष्ट ८, ख ०, ख ०, व्योम ०, ख ०, अग्नि ३, ख ०, ऋतु ६, निशाकर १)

**Translation:** In a yuga there are 1,577,917,828 civil (sāvana) days and 1,603,000,080 lunar days (tithis). These two tallies are the backbone of the yuga calendar arithmetic.

### Mathematical Formulation
**Ahargana & Mean Planetary Longitude Equation**

$$
\bar{\lambda}_{\text{graha}} = \left( \frac{\text{Ahargaṇa} \times B_{\text{graha}}}{1577917828} \times 360^\circ \right) \pmod{360^\circ}
$$

*Exact rational multiplication before division eliminates 64-bit floating-point accumulation drift over 5,127+ years of Kaliyuga.*

### Python 3 Verification Suite
```python
def compute_madhyama(ahargana, bhagana, yuga_days=1577917828):
    mean_rev = (ahargana * bhagana) / yuga_days
    mean_deg = (mean_rev % 1.0) * 360.0
    return round(mean_deg, 6)
```

**Execution Result (Python 3.12.3, 2026-10-08):**
```
Input: Ahargana = 1,865,420 civil days since the Kaliyuga epoch
compute_madhyama(1865420, 4320000) → Sūrya mean longitude: 42.903923°
compute_madhyama(1865420, 57753336) → Chandra mean longitude: 70.821161°
(bhagaṇa per Mahāyuga: Sūrya 4,320,000 · Chandra 57,753,336)
Computed by executing this snippet (Python 3).
```

---

## Chapter 2: स्पष्टाधिकारः (True Longitude & Dual Epicyclic Calculus)
**Scope:** `Verses 2.1 – 2.69 (69 श्लोक in the edition) · shown here: 2.38` | **Study Time:** `16 min study`

### Chapter Overview
Rigorous non-Keplerian orbital perturbation calculus. Resolves true planetary positions through pulsating Manda (eccentricity) and Śīghra (synodic-anomaly) epicycles using variable circumference equations.

### Sanskrit Slokas & Anvaya

> **ओजयुग्मान्तरगुणा भुजज्या त्रिज्ययोद्धृता ।  
> युग्मे वृत्ते धनर्णं स्यादोजादूनाधिके स्फुटम् ।।**
>
> *ojayugmāntaraguṇā bhujajyā trijyayoddhṛtā ।  
> yugme vṛtte dhanarṇaṃ syādojādūnādhike sphuṭam ।।*
>
> **Meter:** सूर्य-सिद्धान्त 2.38
>
> **Source:** editions/surya-siddhanta-full-edition.html#v2-38 — Devanāgarī, IAST, padaccheda-anvaya and English rendering as printed in the edition (सूर्य-सिद्धान्त 2.38)

#### Padaccheda & Anvaya:
- **ओज-युग्म-अन्तर**: विषम–सम परिधि-भेद
- **गुणा**: (भुजज्या से) गुणित
- **भुजज्या**: केन्द्र की भुज-ज्या
- **त्रिज्या**: radius of base circle (प्रायः ३४३८′)
- **उद्धृता**: विभाजित
- **युग्मे वृत्ते**: सम-परिधि पक्ष में
- **धनर्णम्**: धन या ऋण
- **ओजात् ऊनाधिके**: ओज से न्यून/अधिक होने पर
- **स्फुटम्**: स्फुट (corrected) परिधि

**Translation:** Multiply the odd–even epicycle difference by the bhuja-jyā and divide by the trijyā; applied with the proper sign to the even-circle base (according as the true circle is less or greater than the odd-end value), this yields the sphuṭa (corrected) epicycle.

### Mathematical Formulation
**Variable Epicyclic Circumference & True Longitude (4-Samskara)**

$$
p(\theta) = p_{\text{even}} + (p_{\text{odd}} - p_{\text{even}})|\sin\theta|, \quad \Delta\theta_{\text{manda}} = \arcsin\left(\frac{p(\theta) \sin\theta}{360^\circ}\right)
$$

*Pulsating epicycle models orbital eccentricity variation seamlessly without numerical integration.*

### Python 3 Verification Suite
```python
import math
def manda_correction(kendra_deg, p_even, p_odd):
    rad = math.radians(kendra_deg)
    p = p_even + (p_odd - p_even) * abs(math.sin(rad))
    sin_corr = (p * math.sin(rad)) / 360.0
    return math.degrees(math.asin(sin_corr))
```

**Execution Result (Python 3.12.3, 2026-10-08):**
```
Input: Mangala manda kendra = 45.0°; epicycle circumference 72° (even) / 75° (odd)
pulsating epicycle p(45°) = 74.121320°
manda_correction(45.0, 72.0, 75.0) → +8.371332°
Computed by executing this snippet (Python 3).
```

---

## Chapter 3: त्रिप्रश्नाधिकारः (Direction, Place & Time (Gnomon Geometry))
**Scope:** `Verses 3.1 – 3.51 (51 श्लोक in the edition) · shown here: 3.1, 3.2` | **Study Time:** `15 min study`

### Chapter Overview
Trigonometric resolution of the 3 fundamental astronomical questions (Dik/Direction, Desha/Longitude, and Kala/Time) using the 12-digit Shankuyantra (gnomon), solar declination (Kranti), and equinoctial shadow (Palabha).

### Sanskrit Slokas & Anvaya

> **शिलातले अम्बुसंशुद्धे वज्रलेपे अपि वा समे ।  
> तत्र शङ्क्वङ्गुलैरिष्टैः समं मण्डलं आलिखेत् ।।**
>
> *śilātale ambusaṃśuddhe vajralepe api vā same ।  
> tatra śaṅkvaṅgulairiṣṭaiḥ samaṃ maṇḍalaṃ ālikhet ।।*
>
> **Meter:** सूर्य-सिद्धान्त 3.1
>
> **Source:** editions/surya-siddhanta-full-edition.html#v3-01 — Devanāgarī, IAST, padaccheda-anvaya and English rendering as printed in the edition (सूर्य-सिद्धान्त 3.1)

#### Padaccheda & Anvaya:
- **शिलातल**: पत्थर का समतल आधार
- **अम्बुसंशुद्ध**: जल से साफ़ किया हुआ
- **वज्रलेप**: कठोर/वज्र-सा लेप (चिकना प्लास्टर)
- **सम**: एकसमान, झुकाव-रहित
- **शङ्क्वङ्गुल**: शङ्कु की अङ्गुल-माप
- **इष्ट**: अभीष्ट/निर्धारित
- **मण्डल**: वृत्त
- **आलिखेत्**: खींचे

**Translation:** On a stone surface cleaned with water—or even one finished with a hard vajra-plaster coating—made perfectly level, draw a circle whose radius equals the chosen number of aṅgulas of the gnomon.

> **तन्मध्ये स्थापयेच्छङ्कुं कल्पनाद्वादशाङ्गुलम् ।  
> तच्छायाग्रं स्पृशेद्यत्र वृत्ते पूर्वापरार्धयोः ।।**
>
> *tanmadhye sthāpayecchaṅkuṃ kalpanādvādaśāṅgulam ।  
> tacchāyāgraṃ spṛśedyatra vṛtte pūrvāparārdhayoḥ ।।*
>
> **Meter:** सूर्य-सिद्धान्त 3.2
>
> **Source:** editions/surya-siddhanta-full-edition.html#v3-02 — Devanāgarī, IAST, padaccheda-anvaya and English rendering as printed in the edition (सूर्य-सिद्धान्त 3.2)

#### Padaccheda & Anvaya:
- **तन्मध्ये**: उस वृत्त के केन्द्र में
- **स्थापयेत्**: स्थापित करे
- **शङ्कु**: ऊर्ध्व-दण्ड/gnomon
- **कल्पना**: माना हुआ/परिकल्पित
- **द्वादशाङ्गुल**: १२ अङ्गुल
- **छायाग्र**: छाया का अग्र-बिन्दु
- **स्पृशेत्**: स्पर्श करे
- **वृत्त**: वृत्त-परिधि
- **पूर्वापरार्ध**: पूर्व और पश्चिम के अर्धभाग

**Translation:** At the circle’s centre set a gnomon taken as twelve aṅgulas high. Note the points where the tip of its shadow meets the circumference in the eastern and western halves (of the day).

### Mathematical Formulation
**Ascensional Difference & Gnomon Equation**

$$
\sin(\Delta t_{\text{char}}) = \tan(\phi) \tan(\delta), \quad \text{Palabhā} = 12 \tan(\phi)
$$

*Determines local sunrise, daytime length (Dinamana), and the exact local sidereal ascendant (Lagna).*

### Python 3 Verification Suite
```python
import math
def calculate_chara(lat_deg, dec_deg):
    sin_chara = math.tan(math.radians(lat_deg)) * math.tan(math.radians(dec_deg))
    sin_chara = max(-1.0, min(1.0, sin_chara))
    return math.degrees(math.asin(sin_chara)) * 4.0 # in minutes of time
```

**Execution Result (Python 3.12.3, 2026-10-08):**
```
Input: latitude 23.1765° N (Ujjain), solar declination +17.5°
calculate_chara(23.1765, 17.5) → +31.0308 minutes of time
(ascensional difference, chara)
Computed by executing this snippet (Python 3).
```

---

## Chapter 4: चन्द्रग्रहणाधिकारः (Lunar Eclipse Calculus & Shadow Cone Geometry)
**Scope:** `Verses 4.1 – 4.26 (26 श्लोक in the edition) · shown here: 4.12` | **Study Time:** `12 min study`

### Chapter Overview
Mathematical mechanics of lunar eclipses. Derives the apparent diameters of the Sun, Moon, and Earth's shadow cone (Bhamandala), contact times (Sparsha and Moksha), and totality duration (Sthityardha).

### Sanskrit Slokas & Anvaya

> **ग्राह्यग्राहकसंयोगवियोगौ दलितौ पृथक् ।  
> विक्षेपवर्गहीनाभ्यां तद्वर्गाभ्यां उभे पदे ।।**
>
> *grāhyagrāhakasaṃyogaviyogau dalitau pṛthak ।  
> vikṣepavargahīnābhyāṃ tadvargābhyāṃ ubhe pade ।।*
>
> **Meter:** सूर्य-सिद्धान्त 4.12
>
> **Source:** editions/surya-siddhanta-full-edition.html#v4-12 — Devanāgarī, IAST, padaccheda-anvaya and English rendering as printed in the edition (सूर्य-सिद्धान्त 4.12)

#### Padaccheda & Anvaya:
- **ग्राह्य-ग्राहक**: आच्छाद्य और आच्छादक
- **संयोग**: योग
- **वियोग**: अन्तर
- **दलितौ**: आधे किए हुए
- **पृथक्**: अलग-अलग
- **विक्षेप-वर्ग-हीनाभ्याम्**: विक्षेप-वर्ग से रहित
- **तद्-वर्गाभ्याम्**: उन (दलित योग/वियोग) के वर्गों से
- **उभे पदे**: दोनों पद (मूल/√)

**Translation:** Halve, separately, the sum and the difference of the eclipsed and eclipsing diameters. From those two squares, each diminished by the square of the latitude, extract both roots — the two “padas.”

### Mathematical Formulation
**Earth Shadow Diameter & Half-Duration**

$$
D_{\text{shadow}} = \left( D_\odot - \frac{D_\odot - D_\oplus}{D_{\text{dist}}} \right) \times \frac{R_\text{moon}}{R_\odot}, \quad t_{\text{half}} = \sqrt{\left(\frac{D_m + D_s}{2}\right)^2 - \beta^2}
$$

*The half-duration rule of SS 4.12–4.13 (roots of the half-sum and half-difference, latitude removed).*

### Python 3 Verification Suite
```python
import math
def lunar_eclipse_half_duration(dia_moon, dia_shadow, lat_moon):
    sum_radii = (dia_moon + dia_shadow) / 2.0
    if lat_moon >= sum_radii: return 0.0 # No eclipse
    return math.sqrt(sum_radii**2 - lat_moon**2)
```

**Execution Result (Python 3.12.3, 2026-10-08):**
```
Input: Moon diameter 31.5′, shadow diameter 82.4′, Moon latitude 12.2′
lunar_eclipse_half_duration(31.5, 82.4, 12.2) → 55.6279 arcminutes
(half-duration arc along the Moon's path)
Computed by executing this snippet (Python 3).
```

---

## Chapter 5: सूर्यग्रहणाधिकारः (Solar Eclipse & Topocentric Parallax (Lambana))
**Scope:** `Verses 5.1 – 5.17 (17 श्लोक in the edition) · shown here: 5.8` | **Study Time:** `15 min study`

### Chapter Overview
Topocentric parallax calculus in longitude (Lambana) and latitude (Nati). Explains why solar eclipses are strictly localized phenomena differing fundamentally from lunar eclipses.

### Sanskrit Slokas & Anvaya

> **मध्यलग्नार्कविश्लेषज्या छेदेन विभाजिता ।  
> रवीन्द्वोर्लम्बनं ज्ञेयं प्राक्पश्चाद्घटिकादिकम् ।।**
>
> *madhyalagnārkaviśleṣajyā chedena vibhājitā ।  
> ravīndvorlambanaṃ jñeyaṃ prākpaścādghaṭikādikam ।।*
>
> **Meter:** सूर्य-सिद्धान्त 5.8
>
> **Source:** editions/surya-siddhanta-full-edition.html#v5-08 — Devanāgarī, IAST, padaccheda-anvaya and English rendering as printed in the edition (सूर्य-सिद्धान्त 5.8)

#### Padaccheda & Anvaya:
- **मध्यलग्न-अर्क-विश्लेष-ज्या**: मध्यलग्न और सूर्य के अन्तर की ज्या
- **छेदेन विभाजिता**: छेद से भाजित
- **रवि-इन्द्वोः**: सूर्य और चन्द्र का
- **लम्बनं**: लम्बन (देशान्तरीय/दृष्टि-लंब-सा दृष्टिदोष)
- **ज्ञेयं**: जानना चाहिए
- **प्राक्-पश्चात्**: पूर्व या पश्चिम
- **घटिका-आदिकम्**: घटी आदि (काल-माप) में

**Translation:** The sine of the difference between the madhyalagna (meridian ecliptic point) and the Sun, divided by the cheda, is the lambana of the Sun and the Moon. Take it as eastward or westward, and express it in ghaṭikā and the finer time units.

### Mathematical Formulation
**Topocentric Parallax in Longitude & Latitude**

$$
D=\sqrt{M^2-(MU/R)^2},\quad G=\sqrt{R^2-D^2},\quad L=\operatorname{jyā}(\lambda_{madhya}-\lambda_\odot)/C;\quad N\approx D/70\approx49D/R
$$

*Source-bounded summary of 5.3–5.12. The former 4×sin/48×sin shortcut and 5.1–5.40 metadata were generated errors and are retired.*

### Python 3 Verification Suite
```python
# SS 5.5-5.8 and 5.11 as in the formula above, with the text's sine: its 24 R-sines on R = 3438, read by linear interpolation
JYA = [0, 225, 449, 671, 890, 1105, 1315, 1520, 1719, 1910, 2093, 2267, 2431, 2585, 2728, 2859,
       2978, 3084, 3177, 3256, 3321, 3372, 3409, 3431, 3438]
R = 3438

def jya(deg):
    d = deg % 360
    b, s = (d, 1) if d < 90 else (180 - d, 1) if d < 180 else (d - 180, -1) if d < 270 else (360 - d, -1)
    m = b * 60                                    # arcminutes
    i = min(int(m // 225), 23)
    return s * (JYA[i] + (m - 225 * i) * (JYA[i + 1] - JYA[i]) / 225)

def lambana_nati(natamsa_deg, udayajya, madhya_minus_sun_deg):
    M = jya(natamsa_deg)                          # madhyajyā
    D = (M * M - (M * udayajya / R) ** 2) ** 0.5  # dṛkkṣepa
    G = (R * R - D * D) ** 0.5                    # dṛggati
    C = JYA[8] ** 2 / G                           # cheda: jyā(one sign)² ÷ dṛggati (reading 'ekajyā-varga')
    L = jya(madhya_minus_sun_deg) / C             # lambana, in ghaṭikā
    return {'drkkshepa': round(D, 2), 'drggati': round(G, 2), 'cheda': round(C, 2), 'lambana_ghatika': round(L, 3),
            'nati_arcmin_by_70': round(D / 70, 2), 'nati_arcmin_by_49': round(49 * D / R, 2)}
```

**Execution Result (Python 3.12.3, 2026-10-08):**
```
Input (illustrative values, not an observed eclipse): natāṃśa 30°, udayajyā 1500, madhya-lagna − Sun 20°
lambana_nati(30, 1500, 20) → {'drkkshepa': 1546.76, 'drggati': 3070.4, 'cheda': 962.4, 'lambana_ghatika': 1.221, 'nati_arcmin_by_70': 22.1, 'nati_arcmin_by_49': 22.05}
(madhyajyā = jyā 30° = 1719; lambana 1.221 ghaṭikā; nati about 22′ by either rule of 5.11)
Computed by executing this snippet (Python 3).
```

---

## Chapter 6: छेद्यकाधिकारः (Graphical Eclipse Projections & Vector Diagrams)
**Scope:** `Verses 6.1 – 6.24 (24 श्लोक in the edition) · shown here: 6.11` | **Study Time:** `10 min study`

### Chapter Overview
Orthographic and stereographic geometric projection methods for drawing eclipse phase diagrams on flat wooden boards and parchment.

### Sanskrit Slokas & Anvaya

> **विक्षेपाग्राल्लिखेद्वृत्तं ग्राहकार्धेन तेन यत् ।  
> ग्राह्यवृत्तं समाक्रान्तं तद्ग्रस्तं तमसा भवेत् ।।**
>
> *vikṣepāgrāllikhedvṛttaṃ grāhakārdhena tena yat ।  
> grāhyavṛttaṃ samākrāntaṃ tadgrastaṃ tamasā bhavet ।।*
>
> **Meter:** सूर्य-सिद्धान्त 6.11
>
> **Source:** editions/surya-siddhanta-full-edition.html#v6-11 — Devanāgarī, IAST, padaccheda-anvaya and English rendering as printed in the edition (सूर्य-सिद्धान्त 6.11)

#### Padaccheda & Anvaya:
- **विक्षेप-अग्रात्**: विक्षेप के अग्र-बिन्दु से
- **लिखेत् वृत्तं**: वृत्त लिखे
- **ग्राहक-अर्धेन**: ग्राहक (ग्रहण-कर्ता) के अर्ध-व्यास से
- **तेन यत्**: उससे जो
- **ग्राह्य-वृत्तं**: ग्राह्य (ग्रहण-पात्र) का वृत्त
- **समाक्रान्तं**: आक्रान्त/ढका हुआ
- **तत् ग्रस्तं**: वही ग्रस्त
- **तमसा**: तम/अन्धकार से
- **भवेत्**: होता है

**Translation:** From the tip of the vikṣepa draw a circle with radius equal to half the eclipsing body’s diameter. Whatever of the eclipsed body’s circle that circle covers is what is seized by darkness — the geometric definition of the eclipsed portion on the board.

### Mathematical Formulation
**Geometric Obscuration Segment**

$$
\text{Grasa} = \frac{(D_1 + D_2)/2 - \sqrt{\Delta\lambda^2 + \Delta\beta^2}}{D_1}
$$

*Determines the magnitude of eclipse and visual crescent curvature.*

### Python 3 Verification Suite
```python
def eclipse_magnitude(d_sun, d_moon, sep_arcmin):
    overlap = (d_sun + d_moon)/2.0 - sep_arcmin
    return max(0.0, overlap / d_sun)
```

**Execution Result (Python 3.12.3, 2026-10-08):**
```
Input: Sun diameter 32.0′, Moon diameter 31.4′, centre separation 10.2′
eclipse_magnitude(32.0, 31.4, 10.2) → 0.671875 (67.19% of the solar diameter covered)
Computed by executing this snippet (Python 3).
```

---

## Chapter 7: ग्रहयुत्यधिकारः (Planetary Conjunctions & Orbital Crossings)
**Scope:** `Verses 7.1 – 7.24 (24 श्लोक in the edition) · shown here: 7.18, 7.19` | **Study Time:** `11 min study`

### Chapter Overview
Calculates geocentric planetary conjunctions (Bhedha, Ullekha, Anshuvimarda, Apasavya), occultations, and mutual distance vectors.

### Sanskrit Slokas & Anvaya

> **स्वशङ्कुमूर्धगौ व्योम्नि ग्रहौ दृक्तुल्यतां इतौ ।  
> उल्लेखं तारकास्पर्शाद्भेदे भेदः प्रकीर्त्यते ।।**
>
> *svaśaṅkumūrdhagau vyomni grahau dṛktulyatāṃ itau ।  
> ullekhaṃ tārakāsparśādbhede bhedaḥ prakīrtyate ।।*
>
> **Meter:** सूर्य-सिद्धान्त 7.18
>
> **Source:** editions/surya-siddhanta-full-edition.html#v7-18 — Devanāgarī, IAST, padaccheda-anvaya and English rendering as printed in the edition (सूर्य-सिद्धान्त 7.18)

#### Padaccheda & Anvaya:
- **स्वशङ्कुमूर्धगौ**: अपने-अपने शङ्कु-शिखर पर
- **व्योम्नि**: आकाश में
- **ग्रहौ**: दोनों ग्रह
- **दृक्तुल्यताम् इतौ**: दृष्टि-समता को प्राप्त
- **उल्लेखम्**: उल्लेख (स्पर्श/रेखा-स्पर्श)
- **तारकास्पर्शात्**: तारा-स्पर्श से
- **भेदे**: भेद/पृथकता में
- **भेदः**: भेद (पृथक्-दर्शन)
- **प्रकीर्त्यते**: कहा जाता है

**Translation:** The two planets, having attained equality of vision in the sky, are shown at the tops of their respective gnomons. Contact with a star is called ullekha; when they are distinct from each other, the state is named bheda.

> **युद्धं अंशुविमर्दाख्यं अंशुयोगे परस्परम् ।  
> अंशादूने अपसव्याख्यं युद्धं एको अत्र चेदणुः ।।**
>
> *yuddhaṃ aṃśuvimardākhyaṃ aṃśuyoge parasparam ।  
> aṃśādūne apasavyākhyaṃ yuddhaṃ eko atra cedaṇuḥ ।।*
>
> **Meter:** सूर्य-सिद्धान्त 7.19
>
> **Source:** editions/surya-siddhanta-full-edition.html#v7-19 — Devanāgarī, IAST, padaccheda-anvaya and English rendering as printed in the edition (सूर्य-सिद्धान्त 7.19)

#### Padaccheda & Anvaya:
- **युद्धम्**: ग्रह-युद्ध
- **अंशुविमर्दाख्यम्**: अंशु-विमर्द नामक
- **अंशुयोगे परस्परम्**: परस्पर किरणों/अंशों के योग में
- **अंशाद् ऊने**: एक अंश से कम (विच्छेद) पर
- **अपसव्याख्यम्**: अपसव्य नामक
- **युद्धम्**: युद्ध
- **एकः अत्र चेत् अणुः**: यदि इनमें एक सूक्ष्म/अणु हो

**Translation:** Mutual pressing of the rays is the combat named aṃśu-vimarda. When the separation is less than one degree, the combat is called apasavya; and if one of the two is minute (aṇu), that condition belongs here as well.

### Mathematical Formulation
**Mutual Angular Distance & Relative Velocity**

$$
\Delta\theta = \sqrt{(\lambda_1 - \lambda_2)^2 \cos^2\beta + (\beta_1 - \beta_2)^2}, \quad t_{\text{conj}} = \frac{\Delta\lambda}{\dot{\lambda}_1 - \dot{\lambda}_2}
$$

*Determines exact collision and conjunction epochs.*

### Python 3 Verification Suite
```python
def planetary_conjunction_time(l1, l2, v1, v2):
    return (l2 - l1) / (v1 - v2) # in days
```

**Execution Result (Python 3.12.3, 2026-10-08):**
```
Input: Jupiter λ = 102.14° moving 0.083°/day; Saturn λ = 105.78° moving 0.033°/day
planetary_conjunction_time(102.14, 105.78, 0.083, 0.033) → 72.8 days
Computed by executing this snippet (Python 3).
```

---

## Chapter 8: भग्रहयुत्यधिकारः (Junction Stars (Yogatara) & Asterism Conjunctions)
**Scope:** `Verses 8.1 – 8.21 (21 श्लोक in the edition) · shown here: 8.13` | **Study Time:** `12 min study`

### Chapter Overview
Catalogues the canonical polar longitudes (Dhruvaka) and polar latitudes (Vikshepa) of the 27 junction stars (Yogataras) defining the sidereal ecliptic lattice.

### Sanskrit Slokas & Anvaya

> **वृषे सप्तदशे भागे यस्य याम्यो अंशकद्वयात् ।  
> विक्षेपो अभ्यधिको भिन्द्याद्रोहिण्याः शकतं तु सः ।।**
>
> *vṛṣe saptadaśe bhāge yasya yāmyo aṃśakadvayāt ।  
> vikṣepo abhyadhiko bhindyādrohiṇyāḥ śakataṃ tu saḥ ।।*
>
> **Meter:** सूर्य-सिद्धान्त 8.13
>
> **Source:** editions/surya-siddhanta-full-edition.html#v8-13 — Devanāgarī, IAST, padaccheda-anvaya and English rendering as printed in the edition (सूर्य-सिद्धान्त 8.13)

#### Padaccheda & Anvaya:
- **वृषे सप्तदशे भागे**: वृष के सत्रहवें अंश में
- **यस्य**: जिसका
- **याम्यः**: दक्षिणी
- **अंशकद्वयात्**: दो अंश से
- **विक्षेपः अभ्यधिकः**: विक्षेप अधिक
- **भिन्द्यात्**: भेद/विदीर्ण करे
- **रोहिण्याः शकटम्**: रोहिणी का शकट (गाड़ी)
- **सः**: वही (ग्रह/स्थिति)

**Translation:** That body which stands in the seventeenth degree of Taurus, with southern latitude greater than two degrees, is said to split Rohiṇī’s cart. The verse states a geometric gate: longitude window plus a latitude threshold.

### Mathematical Formulation
**Polar to Ecliptic Transformation**

$$
\sin\delta = \sin\beta \cos\epsilon + \cos\beta \sin\epsilon \sin\lambda, \quad \alpha = \arctan\left(\frac{\sin\lambda \cos\epsilon - \tan\beta \sin\epsilon}{\cos\lambda}\right)
$$

*Preserves sidereal anchor coordinates against axial precession.*

### Python 3 Verification Suite
```python
YOGATARAS = {'Ashwini': (11.6, 10.0), 'Rohini': (49.5, -4.5), 'Chitra': (180.0, -1.8)}
def is_yogatara_occulted(moon_lon, moon_lat, star_lon, star_lat):
    dist = ((moon_lon - star_lon)**2 + (moon_lat - star_lat)**2)**0.5
    return dist < 0.5
```

**Execution Result (Python 3.12.3, 2026-10-08):**
```
Input: Moon (49.3°, −4.3°); Rohini yogatārā Aldebaran (49.5°, −4.5°)
angular distance = 0.2828° (occultation threshold in snippet: 0.5°)
is_yogatara_occulted(49.3, -4.3, 49.5, -4.5) → True
Computed by executing this snippet (Python 3).
```

---

## Chapter 9: उदयास्ताधिकारः (Heliacal Risings & Settings (Kala-Bhaga))
**Scope:** `Verses 9.1 – 9.18 (18 श्लोक in the edition) · shown here: 9.6, 9.7, 9.8` | **Study Time:** `11 min study`

### Chapter Overview
Determines the exact visibility threshold angles (Kalabhaga) for planets appearing from or disappearing into the Sun's blinding disk.

### Sanskrit Slokas & Anvaya

> **एकादशामरेज्यस्य तिथिसङ्ख्यार्कजस्य च ।  
> अस्तांशा भूमिपुत्रस्य दश सप्ताधिकास्ततः ।।**
>
> *ekādaśāmarejyasya tithisaṅkhyārkajasya ca ।  
> astāṃśā bhūmiputrasya daśa saptādhikāstataḥ ।।*
>
> **Meter:** सूर्य-सिद्धान्त 9.6
>
> **Source:** editions/surya-siddhanta-full-edition.html#v9-06 — Devanāgarī, IAST, padaccheda-anvaya and English rendering as printed in the edition (सूर्य-सिद्धान्त 9.6)

#### Padaccheda & Anvaya:
- **एकादश**: ग्यारह (अंश)
- **अमर-इज्यस्य**: अमर-इज्य = बृहस्पति के
- **तिथि-सङ्ख्या**: तिथि-संख्या = पंद्रह
- **आर्कजस्य**: अर्कज = शनि के
- **च**: और
- **अस्तांशाः**: अस्त-अंश (दृश्यता/अस्त की सीमा-डिग्री)
- **भूमि-पुत्रस्य**: भूमि-पुत्र = मंगल के
- **दश सप्त-अधिकाः**: दस से सात अधिक = सत्रह
- **ततः**: उससे/तदनन्तर

**Translation:** The heliacal limit-degrees (astāṃśa) are: Jupiter 11°, Saturn 15° (tithi-count), Mars 17° (ten plus seven). These are fixed visibility thresholds for the three outer planets, not rates or periods.

> **पश्चादस्तमयो अष्टाभिरुदयः प्राङ्महत्तया ।  
> प्रागस्तं उदयः पश्चादल्पत्वाद्दशभिर्भृगोः ।।**
>
> *paścādastamayo aṣṭābhirudayaḥ prāṅmahattayā ।  
> prāgastaṃ udayaḥ paścādalpatvāddaśabhirbhṛgoḥ ।।*
>
> **Meter:** सूर्य-सिद्धान्त 9.7
>
> **Source:** editions/surya-siddhanta-full-edition.html#v9-07 — Devanāgarī, IAST, padaccheda-anvaya and English rendering as printed in the edition (सूर्य-सिद्धान्त 9.7)

#### Padaccheda & Anvaya:
- **पश्चात् अस्तमयः**: पश्चिम-अस्त
- **अष्टाभिः**: आठ (अंशों) से
- **उदयः प्राक्**: पूर्व-उदय
- **महत्तया**: महत्ता/बृहत्-प्रकाश के कारण
- **प्राक् अस्तम्**: पूर्व-अस्त
- **उदयः पश्चात्**: पश्चिम-उदय
- **अल्पत्वात्**: अल्पता (क्षुद्र-प्रकाश) के कारण
- **दशभिः**: दस से
- **भृगोः**: भृगु = शुक्र का

**Translation:** For Venus: western setting and eastern rising by 8° when “great” (brighter phase); eastern setting and western rising by 10° when “small” (fainter phase). Two thresholds track phase-dependent brilliance.

> **एवं बुधो द्वादशभिश्चतुर्दशभिरंशकैः ।  
> वक्री शीघ्रगतिश्चार्कात्करोत्यस्तमयोदयौ ।।**
>
> *evaṃ budho dvādaśabhiścaturdaśabhiraṃśakaiḥ ।  
> vakrī śīghragatiścārkātkarotyastamayodayau ।।*
>
> **Meter:** सूर्य-सिद्धान्त 9.8
>
> **Source:** editions/surya-siddhanta-full-edition.html#v9-08 — Devanāgarī, IAST, padaccheda-anvaya and English rendering as printed in the edition (सूर्य-सिद्धान्त 9.8)

#### Padaccheda & Anvaya:
- **एवम्**: इसी प्रकार
- **बुधः**: बुध
- **द्वादशभिः**: बारह से
- **चतुर्दशभिः**: चौदह से
- **अंशकैः**: अंशों द्वारा
- **वक्री**: वक्र-गति में
- **शीघ्र-गतिः च**: और शीघ्र-गति में
- **आर्कात्**: सूर्य से (सापेक्ष)
- **करोति**: करता है
- **अस्तमय-उदयौ**: अस्त और उदय

**Translation:** So Mercury effects setting and rising relative to the Sun by 12° when retrograde and by 14° when in swift (śīghra) motion. The pair of limits closes the fixed-threshold list begun for the outer planets and Venus.

### Mathematical Formulation
**Arc of Combustion (Asta) & Heliacal Rising**

$$
|\lambda_{\text{graha}} - \lambda_\odot| \ge \Theta_{\text{kala}}, \quad \text{Condition for Heliacal Visibility}
$$

*Fundamental for Vedic muhurta and civic almanac visibility flags.*

### Python 3 Verification Suite
```python
KALABHAGA = {'Jupiter': 11.0, 'Venus': 8.0, 'Mars': 17.0, 'Saturn': 15.0}
def is_combust(planet_lon, sun_lon, planet_name):
    diff = abs(planet_lon - sun_lon) % 360.0
    if diff > 180.0: diff = 360.0 - diff
    return diff < KALABHAGA.get(planet_name, 14.0)
```

**Execution Result (Python 3.12.3, 2026-10-08):**
```
Input: Sun λ = 112.4°, Jupiter λ = 118.2° (Jupiter kālabhāga limit: 11°)
separation = 5.8°
is_combust(118.2, 112.4, 'Jupiter') → True
Computed by executing this snippet (Python 3).
```

---

## Chapter 10: शृङ्गोन्नत्यधिकारः (Lunar Horn Elevation & Crescent Phase Geometry)
**Scope:** `Verses 10.1 – 10.15 (15 श्लोक in the edition) · shown here: 10.9` | **Study Time:** `9 min study`

### Chapter Overview
Trigonometric derivation of the illuminated lunar phase angle, crescent width (Shukla-Paksha phase), and the tilt/elevation of the northern and southern horns of the Moon.

### Sanskrit Slokas & Anvaya

> **सूर्योनशीतगोर्लिप्ताः शुक्लं नवशतोद्धृताः ।  
> चन्द्रबिम्बाङ्गुलाभ्यस्तं हृतं द्वादशभिः स्फुटम् ।।**
>
> *sūryonaśītagorliptāḥ śuklaṃ navaśatoddhṛtāḥ ।  
> candrabimbāṅgulābhyastaṃ hṛtaṃ dvādaśabhiḥ sphuṭam ।।*
>
> **Meter:** सूर्य-सिद्धान्त 10.9
>
> **Source:** editions/surya-siddhanta-full-edition.html#v10-09 — Devanāgarī, IAST, padaccheda-anvaya and English rendering as printed in the edition (सूर्य-सिद्धान्त 10.9)

#### Padaccheda & Anvaya:
- **सूर्योन**: सूर्य से रहित / सूर्य-घटित (चन्द्र − सूर्य)
- **शीतगोः**: चन्द्रमा की
- **लिप्ताः**: कलाएँ (arcminutes)
- **शुक्लं**: शुक्ल-भाग (प्रकाशित अंश)
- **नवशत**: ९००
- **उद्धृताः**: विभाजित
- **चन्द्रबिम्ब-अङ्गुला**: चन्द्र-बिम्ब की अङ्गुल-माप
- **अभ्यस्तं**: गुणा
- **द्वादशभिः**: १२ से
- **स्फुटम्**: शुद्ध / तात्कालिक प्रकाशित मान

**Translation:** Take the minutes of arc of the Moon diminished by the Sun (the elongation). Divided by nine hundred they yield the “white” measure—the illuminated portion in a twelve-part scale. That quantity, multiplied by the Moon’s disk in aṅgulas and divided by twelve, is the true illuminated measure for the moment.

### Mathematical Formulation
**Crescent Phase Width & Horn Angle**

$$
W_{\text{crescent}} = \frac{D_{\text{moon}}}{2} (1 - \cos(\lambda_m - \lambda_s)), \quad \tan\theta_{\text{tilt}} = \frac{\Delta\delta}{\Delta\alpha \cos\delta_m}
$$

*Provides the visual phase appearance of the new Moon.*

### Python 3 Verification Suite
```python
import math
def crescent_width(elongation_deg, moon_diam=31.5):
    return (moon_diam / 2.0) * (1.0 - math.cos(math.radians(elongation_deg)))
```

**Execution Result (Python 3.12.3, 2026-10-08):**
```
Input: elongation 36.0° (≈ tithi 3), Moon diameter 31.5′
crescent_width(36.0) → 3.0080 arcminutes
Computed by executing this snippet (Python 3).
```

---

## Chapter 11: पाताधिकारः (Planetary Orbital Nodes & Vyatipata Phenomena)
**Scope:** `Verses 11.1 – 11.23 (23 श्लोक in the edition) · shown here: 11.1, 11.2` | **Study Time:** `11 min study`

### Chapter Overview
Mathematical analysis of celestial declination equality (Vaidhruta and Vyatipata), when the Sun and Moon share identical declinations on opposite sides of the celestial equator.

### Sanskrit Slokas & Anvaya

> **एकायनगतौ स्यातां सूर्यचन्द्रमसौ यदा ।  
> तद्युतौ मण्डले क्रान्त्योस्तुल्यत्वे वैधृताभिधः ।।**
>
> *ekāyanagatau syātāṃ sūryacandramasau yadā ।  
> tadyutau maṇḍale krāntyostulyatve vaidhṛtābhidhaḥ ।।*
>
> **Meter:** सूर्य-सिद्धान्त 11.1
>
> **Source:** editions/surya-siddhanta-full-edition.html#v11-01 — Devanāgarī, IAST, padaccheda-anvaya and English rendering as printed in the edition (सूर्य-सिद्धान्त 11.1)

#### Padaccheda & Anvaya:
- **एकायन-गतौ**: एक ही अयन में स्थित
- **सूर्य-चन्द्रमसौ**: सूर्य और चन्द्रमा
- **तद्-युतौ**: उनकी युति/संयोग-अवस्था में
- **मण्डले**: राशि-मण्डल (भचक्र) में
- **क्रान्त्योः तुल्यत्वे**: दोनों की क्रान्तियों (विषुवत्-अयन-झुकाव) के समान होने पर
- **वैधृत-अभिधः**: वैधृत नामक योग कहलाता है

**Translation:** When the Sun and Moon lie in the same ayan, and in the circle their conjunction is such that their declinations become equal, that condition is named Vaidhṛta. The verse fixes two co-requisites: shared ayan and equal krānti.

> **विपरीतायनगतौ चन्द्रार्कौ क्रान्तिलिप्तिका ।  
> समास्तदा व्यतीपातो भगणार्धे तयोर्युतौ ।।**
>
> *viparītāyanagatau candrārkau krāntiliptikā ।  
> samāstadā vyatīpāto bhagaṇārdhe tayoryutau ।।*
>
> **Meter:** सूर्य-सिद्धान्त 11.2
>
> **Source:** editions/surya-siddhanta-full-edition.html#v11-02 — Devanāgarī, IAST, padaccheda-anvaya and English rendering as printed in the edition (सूर्य-सिद्धान्त 11.2)

#### Padaccheda & Anvaya:
- **विपरीत-अयन-गतौ**: विपरीत अयनों में स्थित
- **चन्द्र-अर्कौ**: चन्द्रमा और सूर्य
- **क्रान्ति-लिप्तिकाः समाः**: क्रान्ति की कलाएँ समान
- **तदा**: तब
- **व्यतीपातः**: व्यतीपात
- **भगण-अर्धे**: भगण के आधे पर (180°)
- **तयोः युतौ**: दोनों की युति/योग-अवस्था में

**Translation:** When Moon and Sun are in opposite ayans, their declination-minutes are equal, and their conjunction (sum-yuti) stands at half a revolution, that is Vyatīpāta. The half-bhagaṇa fixes the 180° sum against Vaidhṛta’s full-circle meeting.

### Mathematical Formulation
**Declination Equivalence Equation**

$$
\delta_\odot(\lambda_\odot) = \pm \delta_m(\lambda_m, \beta_m), \quad \text{Condition for Mahāpāta}
$$

*Critical for high-precision institutional astrological and almanac calculations.*

### Python 3 Verification Suite
```python
def check_vyatipata(sun_dec, moon_dec, tolerance=0.1):
    return abs(abs(sun_dec) - abs(moon_dec)) < tolerance
```

**Execution Result (Python 3.12.3, 2026-10-08):**
```
Input: Sun declination +18.42°, Moon declination −18.39° (tolerance 0.1°)
declination-magnitude difference = 0.0300°
check_vyatipata(18.42, -18.39) → True
Computed by executing this snippet (Python 3).
```

---

## Chapter 12: भूगोलाध्यायः (Cosmography, Terrestrial Sphere & Prime Meridian)
**Scope:** `Verses 12.1 – 12.90 (90 श्लोक in the edition) · shown here: 12.32` | **Study Time:** `18 min study`

### Chapter Overview
Comprehensive geography and cosmography. Establishes the spherical Earth (Bhugola), prime meridian through Ujjayini (75.7885° E), Lanka equatorial zero-point, Meru polar axis, and antipodal coordinates.

### Sanskrit Slokas & Anvaya

> **मध्ये समन्तादण्डस्य भूगोलो व्योम्नि तिष्ठति ।  
> बिभ्रानः परमां शक्तिं ब्रह्मणो धारणात्मकाम् ।।**
>
> *madhye samantādaṇḍasya bhūgolo vyomni tiṣṭhati ।  
> bibhrānaḥ paramāṃ śaktiṃ brahmaṇo dhāraṇātmakām ।।*
>
> **Meter:** सूर्य-सिद्धान्त 12.32
>
> **Source:** editions/surya-siddhanta-full-edition.html#v12-32 — Devanāgarī, IAST, padaccheda-anvaya and English rendering as printed in the edition (सूर्य-सिद्धान्त 12.32)

#### Padaccheda & Anvaya:
- **मध्ये**: मध्य में
- **समन्तात्**: चारों ओर से
- **अण्डस्य**: अंड/ब्रह्माण्ड का
- **भू-गोलः**: पृथ्वी-गोलक
- **व्योम्नि**: आकाश में
- **तिष्ठति**: स्थित है
- **बिभ्राणः**: धारण किये हुए
- **परमाम् शक्तिम्**: परम शक्ति
- **ब्रह्मणः**: ब्रह्म की
- **धारणा-आत्मकाम्**: धारण/स्थापन-स्वरूप

**Translation:** At the centre of the cosmic egg, on every side, the earth-globe stands in the sky, bearing Brahman’s supreme power whose very nature is to uphold and sustain.

### Mathematical Formulation
**Deshantara Longitudinal Time Difference**

$$
\Delta t = \frac{\lambda_{\text{local}} - 75.7885^\circ}{360^\circ} \times 24 \text{ hrs}, \quad C_{\text{earth}} = 4,967 \text{ Yojanas}
$$

*SS 1.62 names the prime meridian through Laṅkā, Rohītaka and Avantī (Ujjayinī).*

### Python 3 Verification Suite
```python
def deshantara_time_correction(lon_deg, ujjain_lon=75.7885):
    return (lon_deg - ujjain_lon) * 4.0 # in minutes of time
```

**Execution Result (Python 3.12.3, 2026-10-08):**
```
Input: Kāśī longitude 83.0107° E (baseline: Ujjain 75.7885° E)
deshantara_time_correction(83.0107) → +28.8888 minutes of time
Computed by executing this snippet (Python 3).
```

---

## Chapter 13: ज्योतिषोपनिषदध्यायः (Armillary Sphere & Observational Instruments)
**Scope:** `Verses 13.1 – 13.25 (25 श्लोक in the edition) · shown here: 13.3, 13.23` | **Study Time:** `12 min study`

### Chapter Overview
Mechanical engineering blueprints for constructing the Golayantra (armillary sphere), Kapalayantra (clepsydra/water clock), and self-rotating astronomical automatons.

### Sanskrit Slokas & Anvaya

> **भूभगोलस्य रचनां कुर्यादाश्चर्यकारिणीम् ।  
> अभीष्टं पृथिवीगोलं कारयित्वा तु दारवम् ॥**
>
> *bhūbhagolasya racanāṃ kuryādāścaryakāriṇīm ।  
> abhīṣṭaṃ pṛthivīgolaṃ kārayitvā tu dāravam ।।*
>
> **Meter:** सूर्य-सिद्धान्त 13.3
>
> **Source:** editions/surya-siddhanta-full-edition.html#v13-03 — Devanāgarī, IAST, padaccheda-anvaya and English rendering as printed in the edition (सूर्य-सिद्धान्त 13.3)

#### Padaccheda & Anvaya:
- **भू-भ-गोलस्य**: पृथ्वी और खगोल (भूगोल+भगोल) की
- **रचनां**: रचना/प्रतिमा
- **कुर्यात्**: बनाए
- **आश्चर्य-कारिणीम्**: आश्चर्य उत्पन्न करने वाली
- **अभीष्टं**: इच्छित माप का
- **पृथिवी-गोलं**: पृथ्वी-गोलक
- **कारयित्वा**: बनवा कर
- **तु दारवम्**: काष्ठ-निर्मित

**Translation:** One should construct a wonder-working model of the earth-and-sky sphere. First fashion a wooden terrestrial globe of the desired size; on that solid body the whole armillary apparatus will rest.

> **ताम्रपात्रं अधश्छिद्रं न्यस्तं कुण्डे अमलाम्भसि ।  
> षष्टिर्मज्जत्यहोरात्रे स्फुटं यन्त्रं कपालकम् ॥**
>
> *tāmrapātraṃ adhaśchidraṃ nyastaṃ kuṇḍe amalāmbhasi ।  
> ṣaṣṭirmajjatyahorātre sphuṭaṃ yantraṃ kapālakam ।।*
>
> **Meter:** सूर्य-सिद्धान्त 13.23
>
> **Source:** editions/surya-siddhanta-full-edition.html#v13-23 — Devanāgarī, IAST, padaccheda-anvaya and English rendering as printed in the edition (सूर्य-सिद्धान्त 13.23)

#### Padaccheda & Anvaya:
- **ताम्र-पात्रम्**: ताँबे का पात्र
- **अधः-छिद्रम्**: नीचे छिद्र वाला
- **न्यस्तम्**: रखा हुआ
- **कुण्डे**: कुंड/हौद में
- **अमल-अम्भसि**: निर्मल जल में
- **षष्टिः**: साठ
- **मज्जति**: डूबता है
- **अहोरात्रे**: एक अहोरात्र (दिन+रात) में
- **स्फुटम्**: स्पष्ट/यथार्थ
- **यन्त्रम् कपालकम्**: कपालक यन्त्र

**Translation:** A copper vessel with a hole beneath, set in a basin of pure water, sinks sixty times in a day-and-night — that is the accurate kapāla instrument.

### Mathematical Formulation
**Clepsydra Inflow/Outflow Timing Calibration**

$$
1 \text{ Ghaṭī} = 24 \text{ minutes} = 60 \text{ Palas} = 3,600 \text{ Vipalas} = 360 \text{ Prāṇas}
$$

*Count correspondence between the prāṇa time-unit and arc division (SS 1.11: 6 prāṇa = 1 pala, 60 pala = 1 ghaṭī; 21,600 prāṇa a day, 21,600 arcminutes a circle) — not a physiological claim.*

### Python 3 Verification Suite
```python
def time_to_ghati(hours, minutes, seconds):
    total_sec = hours * 3600 + minutes * 60 + seconds
    return total_sec / 1440.0 # 1 ghati = 1440 seconds
```

**Execution Result (Python 3.12.3, 2026-10-08):**
```
Input: 12:00:00 elapsed from midnight (per this snippet's convention)
time_to_ghati(12, 0, 0) → 30.00 ghati (1 ghati = 1,440 seconds)
Computed by executing this snippet (Python 3).
```

---

## Chapter 14: मानाध्यायः (Reckoning of Time & Eras (Nine Mana Scales))
**Scope:** `Verses 14.1 – 14.27 (27 श्लोक in the edition) · shown here: 14.1` | **Study Time:** `14 min study`

### Chapter Overview
The crowning synthesis of the nine measures of time named in SS 14.1: brāhma, divya, pitrya, prājāpatya, bārhaspatya (guru), saura, sāvana, cāndra and ārkṣa (nākṣatra).

### Sanskrit Slokas & Anvaya

> **ब्राह्मं दिव्यं तथा पित्र्यं प्राजापत्यं गुरोस्तथा ।  
> सौरं च सावनं चान्द्रं आर्क्षं मानानि वै नव ।।**
>
> *brāhmaṃ divyaṃ tathā pitryaṃ prājāpatyaṃ gurostathā ।  
> sauraṃ ca sāvanaṃ cāndraṃ ārkṣaṃ mānāni vai nava ।।*
>
> **Meter:** सूर्य-सिद्धान्त 14.1
>
> **Source:** editions/surya-siddhanta-full-edition.html#v14-01 — Devanāgarī, IAST, padaccheda-anvaya and English rendering as printed in the edition (सूर्य-सिद्धान्त 14.1)

#### Padaccheda & Anvaya:
- **ब्राह्मं**: ब्रह्मा-मान
- **दिव्यं**: देव/दिव्य-मान
- **पित्र्यं**: पितृ-मान
- **प्राजापत्यं**: प्रजापति-मान
- **गुरोः**: गुरु/बृहस्पति-मान
- **सौरं**: सूर्य-मान
- **सावनं**: सावन/नागरिक-दिन-मान
- **चान्द्रं**: चन्द्र-मान
- **आर्क्षं**: नक्षत्र/तारकीय-मान
- **मानानि वै नव**: ये नौ ही काल-माप हैं

**Translation:** There are nine measures of time: those of Brahmā, of the gods, of the pitṛs, of Prajāpati, of the preceptor (Jupiter), the solar, the civil (sāvana), the lunar, and the sidereal (ārkṣa). The verse simply names the full set before distinguishing which of them govern ordinary reckoning.

### Mathematical Formulation
**Ratio of Sidereal to Solar Civil Revolutions**

$$
\frac{\text{Sidereal Days}}{\text{Civil Days}} = \frac{1577917828 + 4320000}{1577917828} = 1.0027379093
$$

*Sidereal days = civil days + the Sun's revolutions: 1,577,917,828 + 4,320,000 = 1,582,237,828, the stellar risings of SS 1.34.*

### Python 3 Verification Suite
```python
def sidereal_day_seconds(civil_sec=86400.0, yuga_days=1577917828, yuga_years=4320000):
    ratio = yuga_days / (yuga_days + yuga_years)
    return civil_sec * ratio
```

**Execution Result (Python 3.12.3, 2026-10-08):**
```
sidereal_day_seconds() → 86164.1012 seconds ≈ 23h 56m 4.10s
(from the ratio 1,577,917,828 / (1,577,917,828 + 4,320,000) applied to 86,400 s)
Computed by executing this snippet (Python 3).
```

---
