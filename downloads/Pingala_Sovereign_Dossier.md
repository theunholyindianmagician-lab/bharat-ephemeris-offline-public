# Chandas Shastra & Binary Mathematics
## छन्दःशास्त्रम् · Meru Prastāra & Binary Sequences (Pingala)
**Format:** Research Dossier
**Scope:** Research Digest · 1 Chapter
**Verification:** every Python snippet was executed with Python 3.12.3 on 2026-10-08 (scripts/library/sync_library.py); the recorded outputs below are checked against that run.

*यह ऐतिहासिक ग्रन्थों पर आधारित पाठ और गणना है, चिकित्सा-परामर्श नहीं। · Text and computation about historical treatises — not medical advice.*

---

## Chapter 1: द्विक-गणित एवं मेरु-प्रस्तार (Binary Sequences, Pascal's Triangle & Fibonacci (Matrameru))
**Scope:** `Chandas Shastra Adhyaya 8` | **Study Time:** `15 min study`

### Chapter Overview
Pingala (c. 3rd century BCE) developed a binary number system (Laghu/Guru) to compute all possible poetic meters. His algorithms (Prastara, Nashta, Uddishta) represent early combinatorics, Pascal's Triangle (Meru), and Fibonacci numbers.

### Sanskrit Slokas & Anvaya

> **द्विरर्धे ।  
> रूपे शून्यम् ।  
> द्विः शून्ये ।  
> तावदर्धे तद्गुणितम् ॥**
>
> *dvir ardhe |  
> rūpe śūnyam |  
> dviḥ śūnye |  
> tāvad ardhe tadguṇitam ||*
>
> **Meter:** सूत्र शैली (Pingala 8.28-31)
>
> **Source:** स्रोत अपरीक्षित · source unverified — editions/pingala-full-edition.html (१.२) carries «द्विरर्धे । रूपे शून्यम् ।»; the sūtras «द्विः शून्ये» and «तावदर्धे तद्गुणितम्» and the numbering 8.28–31 have no witness in this repository.

#### Padaccheda & Anvaya:
- **द्विः अर्धे**: When (the count) can be halved: halve it and write two (dvi)
- **रूपे शून्यम्**: When one (rūpa) has to be subtracted (odd count): write zero (śūnya)
- **द्विः शून्ये**: Reading the marks back: at a zero, double
- **तावदर्धे तद्गुणितम्**: At a "half" mark, multiply by itself (square)

**Translation:** If the count is halvable, halve it and write "two"; if not, subtract one and write "zero". Reading the marks back, double at a zero and square at a two — Piṅgala's fast-exponentiation for 2ⁿ. The halve/subtract sequence is the binary expansion of n, which the snippet reproduces (modern reading: 0 ↔ halved, 1 ↔ one subtracted).

### Mathematical Formulation
**Pingala's Binary Conversion Algorithm (Nashta)**

$$
2^n = \sum_{k=0}^{n} \binom{n}{k}, \quad F_n = F_{n-1} + F_{n-2} \text{ (Mātrāmeru)}
$$

*Combinatorics of Laghu (0/1) and Guru (1/2) beats forming the exact binary sequence and Fibonacci series.*

### Python 3 Verification Suite
```python
def pingala_binary(n):
    # Converts decimal to binary string (Pingala's method reversed)
    if n == 0: return ""
    if n % 2 == 0:
        return pingala_binary(n // 2) + "0"
    else:
        return pingala_binary((n - 1) // 2) + "1" 
```

**Execution Result (Python 3.12.3, 2026-10-08):**
```
pingala_binary(13) → '1101'
Computed by executing this snippet (Python 3).
```

---
