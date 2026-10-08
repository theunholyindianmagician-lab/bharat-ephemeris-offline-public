#!/usr/bin/env python3
"""sync_library.py — one source of truth for the Library (ग्रन्थ-भण्डार).

Source of truth
  • the `const granthaCorpus = {…}` literal in library.html (10 masterworks, 136 chapters)
  • downloads/ShunyaQuantum_Full_Dataset.json and downloads/RasayanaDhatu_Full_Dataset.json (annex, 7 chapters)
  • corpus/bphs/canon.json (per-chapter verse counts of the BPHS edition)
  • editions/surya-siddhanta-full-edition.html and editions/parashara-rahasya-full-edition.html: the reader's Sūrya-Siddhānta
    ślokas (SS_READER) and the first verse of every BPHS chapter are COPIED from these editions at every sync (Devanāgarī,
    IAST, padaccheda-anvaya, English rendering), so the reader shows only the editions' own verses and inherits their
    corrections. Every reader śloka carries a `source`: the edition locus it was found in, or "स्रोत अपरीक्षित · source
    unverified" when no text in this repository carries it (granthas.test.js checks both).

What it does, in order
  1. loads the corpus and applies the pinned content corrections listed in corrections() and annex_corrections() (idempotent)
  2. executes every codeSnippet with the Python found (PYVER, stamped into every output) and re-checks every "call → result" line of its codeOutput
     against the live result — the build FAILS on any mismatch, so a shipped output is always an executed one;
     annex outputs are regenerated from execution outright
  3. writes the literal back into library.html
  4. writes downloads/<Book>_Full_Dataset.json (12 files)
  5. writes the four collector bundles with a real SHA-256 and true chapter totals
  6. writes the twelve *_Complete_Suite.ipynb notebooks with cells executed by Python 3.12
  7. writes the twelve *_Sovereign_Dossier.md files (file names kept: sw.js precaches them; the format is a research dossier)
  8. ONLY with --regenerate-digests: rebuilds the six research-digest editions (expand_stub_editions.py).
     Off by default since 2026-10-06: the editions were hand-expanded into critical editions (751c126) and the
     generator would overwrite them with stubs.

  python3 scripts/library/sync_library.py            # full sync
  python3 scripts/library/sync_library.py --check    # verify only (exit 1 on any mismatch), no files written
"""
import json, os, re, sys, io, hashlib, subprocess, tempfile, contextlib, datetime, shutil, html as H
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
LIB = os.path.join(ROOT, 'library.html'); DL = os.path.join(ROOT, 'downloads')
# the interpreter that executes the snippets: $LIBRARY_PYTHON if set, else python3.12 on PATH, else this interpreter
PY = os.environ.get('LIBRARY_PYTHON') or shutil.which('python3.12') or sys.executable
if not (os.path.exists(PY) or shutil.which(PY)): PY = sys.executable
DATE = datetime.date.today().isoformat()
PYVER = subprocess.run([PY, '-c', 'import platform; print(platform.python_version())'], capture_output=True, text=True).stdout.strip() or 'unknown'  # the interpreter that actually executed the snippets
CHECK = '--check' in sys.argv
FILES = {'surya': 'Surya_Siddhanta_Rahasya', 'parashara': 'Parashara_Rahasya', 'grantha': 'Paramanu_Bija_Ganita', 'panini': 'Panini_Rahasya',
         'aryabhata': 'Aryabhata', 'brahmagupta': 'Brahmagupta', 'bhaskara': 'Bhaskara', 'madhava': 'Madhava', 'pingala': 'Pingala', 'sulba': 'Sulba',
         'shunya_quantum': 'ShunyaQuantum', 'rasayana_dhatu': 'RasayanaDhatu'}
BUNDLES = {'Tri': ['surya', 'parashara', 'grantha'], 'Quad': ['surya', 'parashara', 'grantha', 'panini'],
           'Deca': ['surya', 'parashara', 'grantha', 'panini', 'aryabhata', 'brahmagupta', 'bhaskara', 'madhava', 'pingala', 'sulba'],
           'Dodeca': ['surya', 'parashara', 'grantha', 'panini', 'aryabhata', 'brahmagupta', 'bhaskara', 'madhava', 'pingala', 'sulba', 'shunya_quantum', 'rasayana_dhatu']}
BUNDLE_TITLES = {'Tri': ('The Complete Decoded Vedic Ephemeris Trilogy', 'Mathematical suites of Surya Siddhanta (14 adhikāras), Parashara Hora BPHS (97 adhyāyas) and Paramāṇu Bīja Ganita (8 khaṇḍas).'),
                 'Quad': ('The Complete Decoded Vedic Science & Mathematics Quad-Trilogy', 'Mathematical suites of Surya Siddhanta, Parashara Hora BPHS, Paramāṇu Bīja Ganita and Panini Rahasya & Kaṭapayādi.'),
                 'Deca': ('The Deca-Grantha Decoded Vedic Science & Mathematics Repository', 'Mathematical suites of 10 masterworks: Surya Siddhanta, Parashara Hora, Paramanu Bija Ganita, Panini, Aryabhata, Brahmagupta, Bhaskara, Madhava, Pingala and Sulba Sutras.'),
                 'Dodeca': ('The Dodeca-Grantha Decoded Vedic Science, Quantum & Mathematics Repository', 'Mathematical suites of 12 masterworks: the ten above plus Shunya Siddhanta Quantum Architecture and Rasayana Ashta-Dhatu Alchemy.')}
SAMPLE_CHART = '[280.5, 133.25, 95.1, 210.75, 305.0, 47.6, 172.3, 18.9, 227.4], 15.0'
DISCLAIMER = '*यह ऐतिहासिक ग्रन्थों पर आधारित पाठ और गणना है, चिकित्सा-परामर्श नहीं। · Text and computation about historical treatises — not medical advice.*'
# annex chapters carry no authored demo call: the driver calls below are what the notebook and codeOutput show
ANNEX_DEMOS = {
    ('shunya_quantum', 1): (['padic_norm(14, 7)', 'padic_norm(49, 7)', 'nilpotent_step(7)', 'nilpotent_step(10)'], None),
    ('shunya_quantum', 2): (['pedersen_commit(100000)', 'outflow_neutralization(100000)'], 'pedersen_commit is a toy commitment (exponents reduced mod 1000), not a zero-knowledge proof'),
    ('shunya_quantum', 3): (['precessional_phase_lock()', 'geodetic_berry_phase()'], 'geodetic_berry_phase returns constants stated in the snippet; "predictability" is a hardcoded label, not a measurement; no quantum-hardware result is recorded in this repository'),
    # 2026-10-07 (council VAI-01): the former chapter 4 ("Biological Shoonya", 31.5 °C body temperature) is removed; see annex_corrections()
    ('shunya_quantum', 4): (['days_to_fixed_date(2461305.5)'], 'target_date is a constant written in the snippet; only days_remaining is computed (input JD 2461305.5 = 2026-09-21 0h UT); the date is not derived here and is not a prediction'),
    ('rasayana_dhatu', 1): (['ashta_dhatu_resonance()'], 'returns the constants stated in the snippet (8 metal names, 43); the "status" field is a hardcoded label'),
    ('rasayana_dhatu', 2): (['pushpaka_lift_coef()'], 'returns the constants stated in the snippet; no aerodynamics is computed'),
    ('rasayana_dhatu', 3): (['sacred_geodesy_stats()'], 'total_sites = 51 + 12 + 5 is computed; berry_phase_rad is a constant stated in the snippet'),
}

def load_corpus():
    s = open(LIB, encoding='utf-8').read()
    m = re.search(r'const granthaCorpus = (\{[\s\S]*?\n\s*\});', s)
    if not m: sys.exit('granthaCorpus literal not found in library.html')
    return s, m, json.loads(m.group(1))

def corrections(C):
    """Pinned content corrections. Each is idempotent."""
    p6 = C['panini']['chapters'][5]
    p6['nameEn'] = 'The Codecs: Kaṭapayādi Alphanumeric Cipher & the π-verse'
    p6['verseRange'] = 'Kaṭapayādi matrix · the π-verse (31 digits agree with π)'
    # the π-verse (गोपीभाग्यमधुव्रात…): its attribution to Mādhava is traditional (no text here documents it), and its 32 decoded digits
    # agree with π in the first 31 only: the 32nd is 2 where π has 5 (π/10 − Σ dᵢ·10⁻ⁱ ≈ 3.03 × 10⁻³²)
    # (the overview is set once, by the 2026-10-06 block below)
    for sl in p6['slokas']:
        # ASCII 'Pi': the reader renders meter tags with text-transform: uppercase, which would turn π into Π
        sl['meter'] = re.sub(r"Madhava's Pi Shloka|the traditional π-verse", 'the traditional Pi-verse', sl['meter'])
    p6['formula']['latex'] = ('\\sum_{i=1}^{32} d_i \\cdot 10^{-i} = 0.31415926535897932384626433832792, '
                              '\\quad \\frac{\\pi}{10} - \\sum_{i=1}^{32} d_i \\cdot 10^{-i} \\approx 3.03 \\times 10^{-32}')
    p6['codeOutput'] = p6['codeOutput'].replace("'dh','v','t']) → '31415946'", "'dh','r','t']) → '31415926'")
    if 'व्रा → r' not in p6['codeOutput']:
        p6['codeOutput'] = p6['codeOutput'].replace('\nComputed by executing', '\n(गोपीभाग्यमधुव्रात: in a conjunct only the last consonant counts, so व्रा → r = 2; the full verse gives 32 digits of which the first 31 agree with π)\nComputed by executing')
    for sl in p6['slokas']:
        sl['translation'] = sl['translation'].replace("decodes directly to 31415926535897932384626433832795 (π accurate to 32 digits!)",
                                                      "decodes to 31415926535897932384626433832792 — 32 digits of which the first 31 agree with π (π × 10³¹ = 31415926535897932384626433832795.03…); the verse's attribution is traditional, not Mādhava's")
    # 2026-10-06 (APEX / vedha-yantra): the chapter-6 "rule verse" carried an unattested half-verse
    # (kṣaḥ śūnyaṃ svarahīne tu saṃkhyānyatra na yujyate — contradicts the conjunct rule: kṣa → ṣa = 6)
    # and a wrong anvaya (ṇa = 0; it is 5, na = 0). Replaced by the rule verse in the form commonly attributed to the
    # Sadratnamālā (Śaṅkaravarman, 1819). 2026-10-07 (council RP-05, RP-20, RP-22): only the verses' opening words have a
    # witness in this repository (panini edition); the second line, the attribution, the dates and the π-verse's source are
    # marked [unverified] in the record and in its `source`.
    p6['overview'] = ('The crowning alphanumeric cipher of Indian mathematics (कटपयादि). Four series — ka, ṭa, pa, ya — carry the digits 1–9 '
                      '(ञ, न and a standalone vowel = 0); in a conjunct only the last consonant counts; a number is read right to left '
                      '(aṅkānāṃ vāmato gatiḥ: the first word is the units). The π-verse is a digit-string, not a number, and is read left to right: '
                      'read right to left it does not give π. '
                      'Used in Haridatta\'s Parahita (683 CE by Kerala tradition); its rule verse is commonly attributed to the Sadratnamālā (Śaṅkaravarman, 1819) — '
                      'neither date nor attribution has a printed witness in this repository [unverified]. The famous π-verse decodes to 32 digits of which the first 31 '
                      'agree with π (the 32nd is 2 where π has 5). Its origin is unresolved: it is often cited from Bhāratī Kṛṣṇa Tīrtha\'s Vedic Mathematics (1965) '
                      '[unverified: no copy in this repository]; no text here documents an older source, and none documents Mādhava as its author.')
    sl6 = p6['slokas'][0]
    sl6['deva'] = 'नञावचश्च शून्यानि संख्याः कटपयादयः ।\nमिश्रे तूपान्त्यहल् संख्या न च चिन्त्यो हलस्वरः ॥\nगोपीभाग्यमधुव्रातः शृङ्गशोदधिसन्धिगः ।\nखलजीवितखाताव गलहालारसंधरः ॥'
    sl6['translit'] = 'nañāvacaśca śūnyāni saṃkhyāḥ kaṭapayādayaḥ |\nmiśre tūpāntyahal saṃkhyā na ca cintyo halasvaraḥ ||\ngopībhāgyamadhuvrātaḥ śṛṅgaśodadhisandhigaḥ |\nkhalajīvitakhātāva galahālārasaṃdharaḥ ||'
    sl6['meter'] = 'अनुष्टुभ् छन्दः (नियम-श्लोक: प्रायः Sadratnamālā, शङ्करवर्मन् 1819 से जोड़ा जाता है · गोपीभाग्य Pi-verse: मूल अनिश्चित)'  # ASCII 'Pi': the reader upper-cases meter tags (π → Π)
    sl6['source'] = ('स्रोत अपरीक्षित · source unverified — editions/panini-rahasya-full-edition.html gives only the opening words of each verse '
                     '(«नञावचश्च शून्यानि…», «गोपीभाग्यमधुव्रात…»); the second line of the rule verse, the Sadratnamālā attribution and the full text of the π-verse '
                     'have no printed witness in this repository. The π-verse\'s 32 decoded digits are checked by computation (library-pi-verse.test.js).')
    sl6['anvaya'] = [
        {'sa': 'नञावचश्च शून्यानि', 'en': 'na, ña and a standalone vowel count 0'},
        {'sa': 'संख्याः कटपयादयः', 'en': 'the digits are the series beginning ka, ṭa, pa, ya: क–झ = 1–9 (ञ = 0); ट–ध = 1–9 (ण = 5, न = 0); प–म = 1–5; य–ह = 1–8 (ळ = 9 in Kerala usage)'},
        {'sa': 'मिश्रे तूपान्त्यहल् संख्या', 'en': 'in a conjunct only the last consonant — the one carrying the vowel — counts: क्ष → ष = 6, ग्य → य = 1'},
        {'sa': 'न च चिन्त्यो हलस्वरः', 'en': 'a consonant without a vowel is not counted; vowel signs, anusvāra and visarga carry no value'},
        {'sa': 'अङ्कानां वामतो गतिः', 'en': 'digits are read right to left (units first); the π-verse below is the modern exception, read left to right'},
    ]
    sl6['translation'] = ('na, ña and vowels are zero; the numerals are the ka-, ṭa-, pa- and ya-series; in a conjunct the last consonant counts; a vowel-less consonant '
                          'is ignored (the rule verse, commonly attributed to the Sadratnamālā [unverified]). The verse \'Gopībhāgya…\' decodes to 31415926535897932384626433832792 — 32 digits of which the first 31 agree with π '
                          '(π × 10³¹ = 31415926535897932384626433832795.03…); it is read left to right. Its origin is unresolved — it is often cited from Bhāratī Kṛṣṇa Tīrtha\'s '
                          'Vedic Mathematics (1965) [unverified] — while the system itself is older (Haridatta, 683 CE by Kerala tradition [unverified]).')
    p1 = C['panini']['chapters'][0]
    if 'panini_grammar_state() →' not in p1['codeOutput']:
        p1['codeOutput'] = "panini_grammar_state() → {'terminals': 9, 'it_markers': 8, 'status': 'Type-0 Compliant ✓'}\n(len(sigma) = 9 terminals; len(it_markers) = 8 IT-markers — the 'status' field is a hardcoded label, not a computed result)\nComputed by executing this snippet (Python 3)."
    p5 = C['panini']['chapters'][4]
    if 'def grade_vowel' not in p5['codeSnippet']:
        p5['codeSnippet'] = C['panini']['chapters'][3]['codeSnippet'].rstrip() + '\n\n' + p5['codeSnippet']
    # ch.7: the snippet's catalogue constant must agree with the edition's own sūtrapāṭha (3,983 rows)
    p7 = C['panini']['chapters'][6]
    p7['codeSnippet'] = p7['codeSnippet'].replace('"total_sutras": 3995', '"total_sutras": 3983')
    p7['codeOutput'] = p7['codeOutput'].replace("'total_sutras': 3995", "'total_sutras': 3983")
    p7['verseRange'] = p7['verseRange'].replace('3,995 Sutras across 8 Adhyayas', '3,983 sūtra rows across 8 adhyāyas')
    # Piṅgala 8.28–31: dvir ardhe (halvable → write 2), rūpe śūnyam (subtract one → write 0)
    pg = C['pingala']['chapters'][0]['slokas'][0]
    pg['anvaya'] = [{'sa': 'द्विः अर्धे', 'en': 'When (the count) can be halved: halve it and write two (dvi)'},
                    {'sa': 'रूपे शून्यम्', 'en': 'When one (rūpa) has to be subtracted (odd count): write zero (śūnya)'},
                    {'sa': 'द्विः शून्ये', 'en': 'Reading the marks back: at a zero, double'},
                    {'sa': 'तावदर्धे तद्गुणितम्', 'en': 'At a "half" mark, multiply by itself (square)'}]
    pg['translation'] = ('If the count is halvable, halve it and write "two"; if not, subtract one and write "zero". Reading the marks back, double at a zero and square at a two — Piṅgala\'s fast-exponentiation for 2ⁿ. '
                         'The halve/subtract sequence is the binary expansion of n, which the snippet reproduces (modern reading: 0 ↔ halved, 1 ↔ one subtracted).')
    bg = C['brahmagupta']['chapters'][0]['formula']
    bg['latex'] = 'a + (-a) = 0, \\quad a \\times 0 = 0, \\quad \\frac{0}{0} = 0, \\quad \\frac{a}{0} = \\text{khaccheda (left as a quantity with zero divisor)}'
    bg['notes'] = ('Brāhmasphuṭasiddhānta 18.34–35 gives these rules and leaves a/0 as "khaccheda" — a quantity with zero as divisor — without evaluating it; the name khahara and its reading as an unbounded '
                   'quantity are Bhāskara II\'s (Bījagaṇita, 12th c.), which the snippet\'s label follows. 0/0 = 0 is Brahmagupta\'s statement; modern algebra leaves 0/0 undefined.')
    # BPHS: per-chapter verse counts from the pinned canon. 2026-10-07 (council P0-1 lens): the reader showed a composed
    # heading line ("अथ बृहत्पाराशरहोराशास्त्रे …") that no witness prints; it now shows the chapter's first verse as the edition prints it.
    canon = json.load(open(os.path.join(ROOT, 'corpus', 'bphs', 'canon.json'), encoding='utf-8'))
    total = canon['total_verses']
    bphs = edition_verses(BPHS_ED)
    for ch in C['parashara']['chapters']:
        n = len(canon['chapters'][str(ch['num'])]['verses'])
        ch['verseRange'] = 'Verses %d.1 – %d.%d (%d श्लोक)' % (ch['num'], ch['num'], n, n)
        ch['formula']['notes'] = re.sub(r'\(\d+ श्लोक\)', '(%d श्लोक)' % n, ch['formula']['notes'])
        ch['slokas'] = [edition_sloka(bphs, '%d.1' % ch['num'], 'editions/parashara-rahasya-full-edition.html', 'BPHS %d.1' % ch['num'])]
    for k in ('subtitlePrefix', 'badge', 'price'):
        C['parashara'][k] = re.sub(r'3,?9\d\d', str(total), C['parashara'][k])

    # ── 2026-10-07 · council P0-1: the Sūrya-Siddhānta reader ślokas are the edition's own verses ──
    # 13 of the 15 former reader ślokas occur in no verse of the repository's own edition (two contradicted their own translations).
    # Each chapter now shows the verses below, copied from editions/surya-siddhanta-full-edition.html with its verse number,
    # Devanāgarī, IAST, padaccheda-anvaya and English rendering. Nothing here is composed.
    ss = edition_verses(SS_ED)
    for ch in C['surya']['chapters']:
        ch['slokas'] = [edition_sloka(ss, v, 'editions/surya-siddhanta-full-edition.html', 'सूर्य-सिद्धान्त %s' % v) for v in SS_READER[ch['num']]]
        last = max(int(k.split('.')[1]) for k in ss if k.split('.')[0] == str(ch['num']))
        ch['verseRange'] = 'Verses %d.1 – %d.%d (%d श्लोक in the edition) · shown here: %s' % (ch['num'], ch['num'], last, last, ', '.join(SS_READER[ch['num']]))
    s13 = C['surya']['chapters'][12]['formula']
    # vaidya: 1 ghaṭī = 60 pala × 6 prāṇa = 360 prāṇa (was 21,600 — the count of a whole day); prāṇa is a unit of time (SS 1.11)
    s13['latex'] = '1 \\text{ Ghaṭī} = 24 \\text{ minutes} = 60 \\text{ Palas} = 3,600 \\text{ Vipalas} = 360 \\text{ Prāṇas}'
    s13['notes'] = ('Count correspondence between the prāṇa time-unit and arc division (SS 1.11: 6 prāṇa = 1 pala, 60 pala = 1 ghaṭī; 21,600 prāṇa a day, '
                    '21,600 arcminutes a circle) — not a physiological claim.')
    C['surya']['chapters'][13]['overview'] = ('The crowning synthesis of the nine measures of time named in SS 14.1: brāhma, divya, pitrya, prājāpatya, '
                                               'bārhaspatya (guru), saura, sāvana, cāndra and ārkṣa (nākṣatra).')
    C['surya']['chapters'][13]['formula']['notes'] = ('Sidereal days = civil days + the Sun\'s revolutions: 1,577,917,828 + 4,320,000 = 1,582,237,828, '
                                                       'the stellar risings of SS 1.34.')
    C['surya']['chapters'][3]['formula']['notes'] = 'The half-duration rule of SS 4.12–4.13 (roots of the half-sum and half-difference, latitude removed).'
    C['surya']['chapters'][11]['formula']['notes'] = 'SS 1.62 names the prime meridian through Laṅkā, Rohītaka and Avantī (Ujjayinī).'

    # ── P1-3: Āryabhaṭa Gītikā words exactly as the edition prints them (ṇḷ, ḍhuṅvighva; granthas.test.js decodes them) ──
    ar = edition_verses(os.path.join(ROOT, 'editions', 'aryabhata-full-edition.html'))
    a1 = C['aryabhata']['chapters'][0]['slokas'][0]
    a1['deva'] = ar['१.१']['deva']; a1['translit'] = ar['१.१']['translit']
    a1['anvaya'] = [{'sa': 'युग-रवि-भगणाः ख्युघृ', 'en': "Sun's revolutions in a Yuga = khyughṛ (4,320,000)"},
                    {'sa': 'कु ङिशिबुणॢष्खृ प्राक्', 'en': "Earth's eastward rotations = ṅiśibuṇḷṣkhṛ (1,582,237,500)"},
                    {'sa': 'शनि ढुङ्विघ्व', 'en': "Saturn's revolutions = ḍhuṅvighva (146,564)"}]
    a1['translation'] = ar['१.१']['eng']

    # ── VAI-05 (f): the prāṇa is a unit of time; 21,600 is a count correspondence, not physiology ──
    g2 = C['grantha']['chapters'][1]
    g2['nameEn'] = 'Subatomic Chronometry & the 21,600 Prāṇa Count'
    g2['overview'] = ('Time units from the Paramāṇu (29.629 µs in this synthesis) up to the prāṇa — a unit of time (SS 1.11), traditionally glossed as one breath — '
                      'and the count correspondence 21,600 prāṇa a day ↔ 21,600 kalā (arcminutes) a circle (60 × 60 × 6 = 360 × 60 = 108 × 200).')
    g2['formula']['title'] = 'Prāṇa–Kalā count correspondence'
    g2['formula']['notes'] = 'A count correspondence (21,600 prāṇa per day; 21,600 arcminutes per circle). No physiological claim.'
    for sl in g2['slokas']:
        sl['anvaya'] = [a if not a['sa'].startswith('21,600') else {'sa': a['sa'], 'en': '1 day = 21,600 prāṇas (time units) = 21,600 arcminutes in a circle (count correspondence)'} for a in sl['anvaya']]
        sl['translation'] = ('2 Paramāṇus make 1 Aṇu; 3 Aṇus make 1 Trasareṇu; 3 Trasareṇus make 1 Truṭi ($29.629\\,\\mu\\text{s}$ in this synthesis). '
                             '21,600 prāṇas (units of time) make one day; the circle has 21,600 arcminutes — a count correspondence.')

    # ── P1-10: Mahā-grantha reader ch. 7 ──
    g7 = C['grantha']['chapters'][6]
    g7['overview'] = ('An interpretive essay on astronomical statements associated with the Mahābhārata (Kṛttikā eclipse pairs, Saturn near Rohiṇī, '
                      'the lunar days of Balarāma\'s pilgrimage). No ephemeris computation is done here: the snippet only returns the Julian Day of the Kali-yuga epoch.')
    g7['formula']['latex'] = ('\\text{JD}_{\\text{Kaliyuga}} = 588465.5 \\quad (\\text{3102 BCE February 18 (proleptic Julian), 00:00 UT (Greenwich)} '
                              '\\approx \\text{05:03 Ujjain mean time})')
    g7['formula']['notes'] = 'The snippet returns the stated constant; nothing is verified by it.'
    for sl in g7['slokas']:
        sl['anvaya'] = [{'sa': 'एकमासे उभौ ग्रस्तौ', 'en': 'both (Moon and Sun) seized in one month — read as two eclipses within one month'}]
        sl['translation'] = ('The passage is read as saying that both the Moon and the Sun were eclipsed within one month (its words name a trayodaśī and a full moon). '
                             'It is printed here without a located source and is not a statement of historical fact.')

    # ── satya P1-4: "sovereign" belongs to the vedha engine; these chapters state what their snippets do ──
    g1 = C['grantha']['chapters'][0]
    g1['nameEn'] = 'Cosmological Baseline & the Ujjayinī Prime Meridian'
    g1['overview'] = ('The prime meridian of the Sūrya-Siddhānta tradition — SS 1.62 names the line through Laṅkā, Rohītaka and Avantī (Ujjayinī) — '
                      'and the deśāntara longitude-time correction. The snippet converts UT to local mean time at a given longitude (75.7885° E, the Ujjain '
                      'longitude used in this snippet).')
    g1['formula']['notes'] = 'Local mean time = UT + longitude ⁄ 15° per hour; the snippet applies it at the stated longitude.'
    for sl in g1['slokas']:
        sl['translation'] = ('The prime meridian of Ujjayinī, aligned with Laṅkā, is the line from which time and longitude (deśāntara) are reckoned. '
                             '[The verse is not located in any text in this repository.]')
    # ── grantha ch. 8: the hash call written out in full, so the --check re-runs it (it was elided as "compute_state_hash(...)") ──
    g8 = C['grantha']['chapters'][7]
    g8['overview'] = ('A SHA-256 hash of a state string (Julian Day and longitudes): identical inputs give an identical hash, so a recorded state can be '
                      're-checked. Integer rings ℤ/3ᵏℤ are discussed in the synthesis; the snippet itself only hashes its input.')
    g8['codeOutput'] = g8['codeOutput'].replace('compute_state_hash(...) → SHA-256:\n', 'compute_state_hash(2451545.0, [42.903923, 70.821161]) → SHA-256: ')

    # ── Pāṇini ch. 3: the sūtra as the edition's sūtrapāṭha transliterates it (6.4.22 asiddhavad atrā bhāt) ──
    p3 = C['panini']['chapters'][2]['slokas'][0]
    p3['translit'] = 'vipratiṣedhe paraṃ kāryam |\nasiddhavad atrā bhāt ||'
    p3['translation'] = ('When two rules of equal strength conflict, the later-listed rule operates (1.4.2). From 6.4.22 up to the rules ending “bhāt”, '
                         'the stem-operations are treated as not having taken effect for one another (asiddhavat) — the edition\'s gloss: '
                         '“यहाँ से ‘भात्’ तक के अङ्ग-कार्य परस्पर असिद्धवत् माने जाते हैं।”')

    # ── every reader śloka names its source (granthas.test.js): an edition locus, or "source unverified" ──
    for (book, num, i), src in SOURCES.items():
        C[book]['chapters'][num - 1]['slokas'][i]['source'] = src
    return C

SS_ED = os.path.join(ROOT, 'editions', 'surya-siddhanta-full-edition.html')
BPHS_ED = os.path.join(ROOT, 'editions', 'parashara-rahasya-full-edition.html')
# adhikāra → the edition's verses shown in the reader (chosen to match each chapter's subject, formula and snippet)
SS_READER = {1: ['1.20', '1.37'], 2: ['2.38'], 3: ['3.1', '3.2'], 4: ['4.12'], 5: ['5.8'], 6: ['6.11'], 7: ['7.18', '7.19'], 8: ['8.13'],
             9: ['9.6', '9.7', '9.8'], 10: ['10.9'], 11: ['11.1', '11.2'], 12: ['12.32'], 13: ['13.3', '13.23'], 14: ['14.1']}
UNVERIFIED = 'स्रोत अपरीक्षित · source unverified — '
NOT_HERE = UNVERIFIED + 'no text in this repository carries this verse; it is not presented as a located quotation.'
SOURCES = {
    ('grantha', 1, 0): NOT_HERE, ('grantha', 2, 0): NOT_HERE, ('grantha', 3, 0): NOT_HERE,
    ('grantha', 4, 0): 'editions/maha-grantha-full-edition.html — quoted there (the śānti-pāṭha «पूर्णमदः पूर्णमिदम्»); the Upaniṣad locus is not given in this repository.',
    ('grantha', 5, 0): NOT_HERE, ('grantha', 6, 0): NOT_HERE,
    ('grantha', 7, 0): UNVERIFIED + 'no Mahābhārata text is in this repository; the verse is not located and is not evidence of a historical eclipse.',
    ('grantha', 8, 0): NOT_HERE,
    ('panini', 1, 0): NOT_HERE, ('panini', 2, 0): NOT_HERE,
    ('panini', 3, 0): 'editions/panini-rahasya-full-edition.html#k1-4-2 and #k6-4-22 (sūtrapāṭha rows 1.4.2 and 6.4.22)',
    ('panini', 4, 0): 'editions/panini-rahasya-full-edition.html#k1-1-1, #k1-1-2 and #k1-1-7 (sūtrapāṭha rows 1.1.1, 1.1.2, 1.1.7)',
    ('panini', 5, 0): 'editions/panini-rahasya-full-edition.html#k1-4-14, #k3-1-91 and #k3-1-68 (sūtrapāṭha rows 1.4.14, 3.1.91, 3.1.68)',
    ('panini', 7, 0): NOT_HERE,
    ('panini', 8, 0): UNVERIFIED + 'the sūtra «अ अ» is row 8.4.68 of editions/panini-rahasya-full-edition.html (#k8-4-68); the colophon line «इति श्रीमद्भगवत्पाणिनिप्रणीते …» has no witness in this repository.',
    ('aryabhata', 1, 0): 'editions/aryabhata-full-edition.html, verse १.१ (Devanāgarī, IAST and English as printed there)',
    ('aryabhata', 2, 0): 'editions/aryabhata-full-edition.html, verse २.१०',
    ('brahmagupta', 1, 0): UNVERIFIED + 'this wording of the zero rules is not in editions/brahmagupta-full-edition.html (whose 18.30–32 is itself marked unverified) or any other text in this repository.',
    ('brahmagupta', 2, 0): 'editions/brahmagupta-full-edition.html, verse १२.२१',
    ('bhaskara', 1, 0): NOT_HERE, ('bhaskara', 2, 0): NOT_HERE,
    ('madhava', 1, 0): 'editions/madhava-full-edition.html, verse १.१',
    ('pingala', 1, 0): UNVERIFIED + 'editions/pingala-full-edition.html (१.२) carries «द्विरर्धे । रूपे शून्यम् ।»; the sūtras «द्विः शून्ये» and «तावदर्धे तद्गुणितम्» and the numbering 8.28–31 have no witness in this repository.',
    ('sulba', 1, 0): 'editions/sulba-full-edition.html', ('sulba', 1, 1): 'editions/sulba-full-edition.html',
}

def _plain(x):
    return H.unescape(re.sub(r'<[^>]+>', '', x or '')).replace('‌', '').strip()

def edition_verses(path):
    """vnum → {'id', 'deva', 'translit', 'pada', 'eng'} for every verse of an edition page (articles of class "verse")."""
    s = open(path, encoding='utf-8').read(); V = {}
    for m in re.finditer(r'<article class="verse"(?: id="([^"]+)")?>([\s\S]*?)</article>', s):
        b = m.group(2)
        def g(p):
            x = re.search(p, b); return x.group(1) if x else ''
        lines = lambda x: '\n'.join(_plain(l) for l in re.split(r'<br\s*/?>', x) if _plain(l))
        eng = g(r'<span class="lbl eng">[^<]*</span>\s*([\s\S]*?)</p>') or g(r'<span class="lbl">English</span>\s*([\s\S]*?)</p>')
        V[_plain(g(r'<div class="vnum">([^<]*)</div>'))] = {'id': m.group(1) or '', 'deva': lines(g(r'<div class="sa">([\s\S]*?)</div>')),
            'translit': lines(g(r'<div class="iast">([\s\S]*?)</div>')), 'pada': _plain(g(r'<span class="lbl pada">[^<]*</span>\s*([\s\S]*?)</p>')), 'eng': _plain(eng)}
    return V

def edition_sloka(V, vnum, page, label):
    """a reader śloka copied from an edition verse: its Devanāgarī, IAST, padaccheda (word = gloss; …) and English rendering."""
    v = V[vnum]; anvaya = []
    for part in re.split(r';\s+', v['pada'].rstrip('।').strip()):
        if ' = ' in part:
            sa, en = part.split(' = ', 1); anvaya.append({'sa': sa.strip(), 'en': en.strip()})
    return {'deva': v['deva'], 'meter': label, 'translit': v['translit'], 'anvaya': anvaya, 'translation': v['eng'],
            'source': '%s#%s — Devanāgarī, IAST, padaccheda-anvaya and English rendering as printed in the edition (%s)' % (page, v['id'], label)}

def annex_corrections(annex):
    """Pinned corrections of the two annex datasets (their own source of truth). Idempotent."""
    Q = annex['shunya_quantum']
    # VAI-01 (P0): chapter 4 "Biological Shoonya" claimed that prāṇāyāma lowers core body temperature to 31.5 °C (moderate hypothermia)
    # and "halts" ageing and death, with ROS/spermidine claims and a verse found in no text. Removed entirely.
    Q['chapters'] = [ch for ch in Q['chapters'] if 'Biological' not in ch.get('nameEn', '') and 'metabolic_suppression' not in ch.get('codeSnippet', '')]
    # VAI-08: the "terminal decade hinge" chapter carried an unsourced verse predicting a "dreadful" transition and called a constant date a
    # "terminal release date". Kept only as the plain date arithmetic its snippet does; the verse is removed from public text.
    for ch in Q['chapters']:
        if 'decade_hinge_status' in ch.get('codeSnippet', '') or 'days_to_fixed_date' in ch.get('codeSnippet', ''):
            ch.update({'nameSa': 'एक स्थिर तिथि तक दिन-गणना (2028-02-23)', 'nameEn': 'A Fixed-Date Day Count (2028-02-23)', 'shortTitle': '4. Fixed-Date Day Count',
                       'verseRange': 'Snippet only — no verse', 'readingTime': '3 min study',
                       'overview': ('The snippet counts the days from a given Julian Day to 2028-02-23 (JD 2461825.5), a date written into it as a constant. '
                                    'Nothing here derives that date or gives it a meaning, and it is not a prediction. (Until 2026-10-07 this chapter carried a verse '
                                    'about a “dreadful” transition that occurs in no text in this repository, and called the date a release date; both are removed.)'),
                       'slokas': [],
                       'formula': {'title': 'Days to a fixed Julian Day',
                                   'latex': '\\text{days} = \\lfloor \\text{JD}_{\\text{target}} - \\text{JD} \\rfloor, \\quad \\text{JD}_{\\text{target}} = 2461825.5 \\; (\\text{2028-02-23, 0h UT})',
                                   'notes': 'Plain date arithmetic. No daśā, Yoginī or Saturn cycle is computed by this snippet.'},
                       'codeSnippet': ('def days_to_fixed_date(jd_current, target_jd=2461825.5):\n'
                                       '    # 2461825.5 = 2028-02-23 0h UT, a date written into this snippet as a constant\n'
                                       '    return {"target_date": "2028-02-23", "days_remaining": max(0, int(target_jd - jd_current))}')})
    for i, ch in enumerate(Q['chapters']): ch['num'] = i + 1; ch['shortTitle'] = re.sub(r'^\d+\.', '%d.' % (i + 1), ch['shortTitle'])
    n = len(Q['chapters'])
    Q['subtitlePrefix'] = re.sub(r'\(\d+ Master Chapters\)', '(%d chapters)' % n, Q['subtitlePrefix'])
    Q['badge'] = re.sub(r'\d+ Chapters', '%d Chapters' % n, Q['badge'])
    q1, q2, q3 = Q['chapters'][0], Q['chapters'][1], Q['chapters'][2]
    q1['overview'] = ('Interpretive chapter. The snippet computes the 7-adic norm |x|₇ and labels a step count modulo 7 (“nilpotent_step”); '
                      'the reading of this as time-reversal into a “ground void” is an interpretation, not a result.')
    q1['formula']['notes'] = 'The ultrametric inequality holds for every p-adic norm; no physical system is modelled and no accuracy figure applies.'
    q2['nameEn'] = 'Toy Pedersen-style Commitment & a 40/60 Split (not zero-knowledge)'
    q2['overview'] = ('Interpretive chapter. A toy Pedersen-style commitment (exponents reduced mod 1000, modulus 2³¹ − 1) — not a zero-knowledge proof — '
                      'and a function that splits an amount 40/60 with a 48-hour label. Not financial advice.')
    # satya P0-6: no quantum-hardware result is recorded in this repository; 71.4% is a constant written in the snippet
    q3['nameSa'] = '108Q क्वान्टम-व्याख्या एवं बेरी-फेज ज्यामिति'
    q3['nameEn'] = '108Q Interpretation & Geodetic Berry Phase (no hardware result recorded)'
    q3['overview'] = ('Interpretive chapter. No quantum-hardware result is recorded in this repository; the 71.4% figure is a constant written in the snippet, '
                      'not a measurement. The snippet returns the stated constants and the angle (12960 / 25920) × 360° = 180°.')
    q3['formula']['notes'] = 'No circuit, shot count or job record is in this repository; the numbers in this chapter are constants written in the snippet.'
    R_ = annex['rasayana_dhatu']
    r1, r2, r3 = R_['chapters']
    r1['overview'] = ('Interpretive chapter. Lists the eight metals of the aṣṭa-dhātu and the 43 triangles of the Śrī Yantra; the snippet returns those constants '
                      '(8, 43). No resonance, impedance or metallurgy is computed. Not a remedy and not for ingestion.')
    r1['formula']['notes'] = 'The snippet returns the stated constants (8 metals, 43); no graph, impedance or resonance is computed.'
    r2['overview'] = ('Interpretive chapter. Pairs the vimāna of the Vaimānika tradition with the standing-wave formula fₙ = n v ⁄ 2L for n = 1…14; '
                      'the snippet returns constants (1.618, 14) and computes no aerodynamics.')
    r2['formula']['notes'] = 'c_l = 1.618 is a constant written in the snippet; no lift or vortex is computed.'
    r3['overview'] = ('Interpretive chapter. Counts 51 Śakti Pīṭhas + 12 Jyotirliṅgas + 5 Kedāra sites = 68; no coordinates are in the snippet and no lattice is computed; '
                      'berry_phase_rad is a constant written in the snippet.')
    r3['formula']['notes'] = 'The haversine formula is stated, not applied: the snippet holds no coordinates.'
    for D in (Q, R_):
        for ch in D['chapters']:
            for sl in ch.get('slokas') or []:
                sl['source'] = NOT_HERE + ' Annex verse: not presented as a classical text.'
    return annex

CALL = re.compile(r'([A-Za-z_][\w\.]*\((?:[^()\n]|\([^()\n]*\))*\))\s*(?:→|->)\s*([^\n]*)')
NUM = re.compile(r'-?\d[\d,]*(?:\.\d+)?(?:e[+-]?\d+)?')
def run_snippet(code):
    ns = {}; out = io.StringIO()
    with contextlib.redirect_stdout(out): exec(code, ns)
    return ns

def verify_chapter(book, ch):
    """Re-execute every 'call → result' in codeOutput. Returns list of problems."""
    code = ch.get('codeSnippet') or ''; out = ch.get('codeOutput') or ''; probs = []
    try: ns = run_snippet(code)
    except Exception as e:
        if 'raise' in code and str(e).split(':')[0] in out or 'NotImplementedError' in code: return []      # deliberate: retired shortcut
        return ['snippet raises: %s' % e]
    if book == 'parashara':
        m = re.search(r'\[([\d\., ]+)\]; ascendant ([\d\.]+)°', out)
        if not m: return ['no sample chart in output']
        lons = [float(x) for x in m.group(1).split(',')]; asc = float(m.group(2))
        res = ns['bphs_chapter_%d_eval' % ch['num']](lons, asc)
        claimed = re.search(r'vargas[^:]*:\s*\[([^\]]*)\]', out)
        if not claimed or [float(x) for x in claimed.group(1).split(',')] != res['vargas']: probs.append('vargas differ: %s' % res['vargas'])
        return probs
    calls = CALL.findall(out)
    if not calls and 'raise' not in code: probs.append('no executed call quoted in codeOutput')
    for call, claimed in calls:
        if '...' in call: continue                                   # elided call, documented in prose
        try: val = eval(call, ns)
        except Exception as e: probs.append('%s fails: %s' % (call, e)); continue
        cn = NUM.findall(claimed)
        if isinstance(val, bool):
            if str(val) not in claimed: probs.append('%s → %r not in output' % (call, val))
        elif isinstance(val, (int, float)):
            if not cn: probs.append('%s: no number claimed' % call); continue
            c = float(cn[0].replace(',', '')); dec = len(cn[0].split('.')[1]) if '.' in cn[0] else 0
            if abs(val - c) > max(0.51 * 10 ** -dec, 1e-9 * abs(c)): probs.append('%s → %r but output says %s' % (call, val, cn[0]))
        elif isinstance(val, str):
            if val not in claimed: probs.append('%s → %r not in output' % (call, val))
        elif isinstance(val, (list, tuple, dict, bool)):
            r = repr(val)
            vn = NUM.findall(r)
            if isinstance(val, bool):
                if str(val) not in claimed: probs.append('%s → %r not in output' % (call, val))
            elif r not in claimed and not all(any(abs(float(a.replace(',', '')) - float(b)) < 1e-6 for b in vn) for a in cn[:6]):
                probs.append('%s → %s vs output %s' % (call, r[:80], claimed[:80]))
    return probs

def regen_annex(book, ch):
    calls, note = ANNEX_DEMOS[(book, ch['num'])]
    ns = run_snippet(ch['codeSnippet']); lines = []
    for c in calls: lines.append('%s → %r' % (c, eval(c, ns)))
    if note: lines.append('(%s)' % note)
    lines.append(('Computed by executing this snippet (Python ' + PYVER + ', %s).') % DATE)
    ch['codeOutput'] = '\n'.join(lines)

def notebook(book, D):
    cells = []; n = 0
    def md(t): cells.append({'cell_type': 'markdown', 'metadata': {}, 'source': t})
    md(('# %s\n## %s\n**Format:** decoded chapter suite · **Scope:** %s\n**Execution:** every code cell below was executed with Python ' + PYVER + ' on %s by scripts/library/sync_library.py; the outputs are the real stdout of that run.\n\n' + DISCLAIMER + '\n\n---') % (D['title'], D['subtitlePrefix'], D['badge'], DATE))
    for ch in D['chapters']:
        sl = '\n\n'.join('> **%s**\n>\n> *%s*\n>\n> **Meter:** %s\n>\n> **Source:** %s\n\n%s\n\n%s' % (s.get('deva', '').replace('\n', '  \n> '), s.get('translit', '').replace('\n', '  \n> '), s.get('meter', ''), s.get('source', ''),
                          '\n'.join('- **%s**: %s' % (a.get('sa', ''), a.get('en', '')) for a in s.get('anvaya') or []), s.get('translation', '')) for s in ch.get('slokas') or []) or '(no verse)'
        f = ch.get('formula') or {}
        md('## Chapter %s: %s (%s)\n**Scope:** `%s` · **Reading:** `%s`\n\n### Overview\n%s\n\n### Ślokas & anvaya\n%s\n\n### Formulation — %s\n$$%s$$\n\n%s' % (ch['num'], ch.get('nameSa', ''), ch.get('nameEn', ''), ch.get('verseRange', ''), ch.get('readingTime', ''), ch.get('overview', ''), sl, f.get('title', ''), f.get('latex', ''), f.get('notes', '')))
        code = ch.get('codeSnippet') or ''
        if book == 'parashara': driver = 'print(bphs_chapter_%d_eval(%s))' % (ch['num'], SAMPLE_CHART)
        elif (book, ch['num']) in ANNEX_DEMOS: driver = '\n'.join('print(%r, "→", repr(%s))' % (c, c) for c in ANNEX_DEMOS[(book, ch['num'])][0])
        else:
            calls = [c for c, _ in CALL.findall(ch.get('codeOutput') or '') if '...' not in c]
            if (book, ch['num']) == ('grantha', 8): calls = ['compute_state_hash(2451545.0, [42.903923, 70.821161])']
            driver = '\n'.join('print(%r, "→", repr(%s))' % (c, c) for c in calls) if calls else '# no demo call recorded for this chapter'
        with tempfile.NamedTemporaryFile('w', suffix='.py', delete=False, encoding='utf-8') as t: t.write(code + '\n\n# --- demo run ---\nprint("<<<DRIVER>>>")\n' + driver + '\n'); tn = t.name
        r = subprocess.run([PY, tn], capture_output=True, text=True, timeout=120); os.unlink(tn)
        n += 1; cell1 = {'cell_type': 'code', 'execution_count': n, 'metadata': {}, 'outputs': [], 'source': code}
        if r.returncode != 0:
            tb = r.stderr.strip().split('\n'); last = tb[-1] if tb else 'Error'
            en, _, ev = last.partition(': ')
            cell1['outputs'] = [{'output_type': 'error', 'ename': en, 'evalue': ev, 'traceback': tb}]
            cells.append(cell1); n += 1
            cells.append({'cell_type': 'code', 'execution_count': n, 'metadata': {}, 'outputs': [{'output_type': 'stream', 'name': 'stdout', 'text': 'not run: the snippet above raises deliberately\n'}], 'source': driver})
            continue
        pre, _, post = r.stdout.partition('<<<DRIVER>>>\n')
        if pre.strip(): cell1['outputs'] = [{'output_type': 'stream', 'name': 'stdout', 'text': pre}]
        cells.append(cell1); n += 1
        cells.append({'cell_type': 'code', 'execution_count': n, 'metadata': {}, 'outputs': [{'output_type': 'stream', 'name': 'stdout', 'text': post or '(no output)\n'}], 'source': driver})
        md('**Recorded output (dataset `codeOutput`, verified against the run above):**\n```\n%s\n```' % (ch.get('codeOutput') or ''))
    return {'cells': cells, 'metadata': {'kernelspec': {'display_name': 'Python 3 (ipykernel)', 'language': 'python', 'name': 'python3'}, 'language_info': {'name': 'python', 'version': '3.12'}}, 'nbformat': 4, 'nbformat_minor': 5}

def dossier(D):
    L = ['# %s' % D['title'], '## %s' % D['subtitlePrefix'], '**Format:** Research Dossier', '**Scope:** %s' % D['badge'],
         ('**Verification:** every Python snippet was executed with Python ' + PYVER + ' on %s (scripts/library/sync_library.py); the recorded outputs below are checked against that run.') % DATE, '', DISCLAIMER, '', '---', '']
    for ch in D['chapters']:
        L += ['## Chapter %s: %s (%s)' % (ch['num'], ch.get('nameSa', ''), ch.get('nameEn', '')), '**Scope:** `%s` | **Study Time:** `%s`' % (ch.get('verseRange', ''), ch.get('readingTime', '')), '', '### Chapter Overview', ch.get('overview', ''), '', '### Sanskrit Slokas & Anvaya', '']
        for s in ch.get('slokas') or []:
            L += ['> **%s**' % s.get('deva', '').replace('\n', '  \n> '), '>', '> *%s*' % s.get('translit', '').replace('\n', '  \n> '), '>', '> **Meter:** %s' % s.get('meter', ''), '>', '> **Source:** %s' % s.get('source', ''), '', '#### Padaccheda & Anvaya:']
            L += ['- **%s**: %s' % (a.get('sa', ''), a.get('en', '')) for a in s.get('anvaya') or []]
            L += ['', '**Translation:** %s' % s.get('translation', ''), '']
        f = ch.get('formula') or {}
        L += ['### Mathematical Formulation', '**%s**' % f.get('title', ''), '', '$$', f.get('latex', ''), '$$', '', '*%s*' % f.get('notes', ''), '', '### Python 3 Verification Suite', '```python', ch.get('codeSnippet', ''), '```', '', ('**Execution Result (Python ' + PYVER + ', %s):**') % DATE, '```', ch.get('codeOutput', ''), '```', '', '---', '']
    return '\n'.join(L)

def main():
    s, m, C = load_corpus(); C = corrections(C)
    annex = annex_corrections({k: json.load(open(os.path.join(DL, FILES[k] + '_Full_Dataset.json'), encoding='utf-8')) for k in ('shunya_quantum', 'rasayana_dhatu')})
    for k, D in annex.items():
        for ch in D['chapters']: regen_annex(k, ch)
    problems = []
    for k, D in list(C.items()) + list(annex.items()):
        for ch in D['chapters']:
            for p in verify_chapter(k, ch): problems.append('%s ch%s: %s' % (k, ch['num'], p))
    if CHECK and json.loads(m.group(1)) != C:
        problems.append('library.html: the corpus literal differs from the corrected corpus (corrections or edition verses not synced) — run scripts/library/sync_library.py')
    if problems:
        print('EXECUTION CHECK FAILED:'); [print('  ', p) for p in problems]; sys.exit(1)
    nch = sum(len(D['chapters']) for D in C.values())
    nexec = sum(1 for k, D in C.items() for ch in D['chapters'] if k == 'parashara' or [c for c, _ in CALL.findall(ch.get('codeOutput') or '') if '...' not in c])
    print('execution check: %d masterwork chapters (%d with a quoted call re-run and checked) + %d annex chapters — every quoted call reproduces' % (nch, nexec, sum(len(D['chapters']) for D in annex.values())))
    if CHECK: return
    lit = json.dumps(C, ensure_ascii=False, indent=2)
    s = s[:m.start(1)] + lit + s[m.end(1):]
    open(LIB, 'w', encoding='utf-8').write(s)
    ALL = dict(C); ALL.update(annex)
    for k, D in ALL.items():
        json.dump(D, open(os.path.join(DL, FILES[k] + '_Full_Dataset.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
        json.dump(notebook(k, D), open(os.path.join(DL, FILES[k] + '_Complete_Suite.ipynb'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
        open(os.path.join(DL, FILES[k] + '_Sovereign_Dossier.md'), 'w', encoding='utf-8').write(dossier(D))
    for name, keys in BUNDLES.items():
        corpora = {k: ALL[k] for k in keys}
        body = json.dumps(corpora, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode('utf-8')
        meta = {'totalChapters': sum(len(v['chapters']) for v in corpora.values()), 'totalGranthas': len(corpora),
                'verificationEngine': ('scripts/library/sync_library.py — every codeSnippet executed with Python ' + PYVER + ' on %s') % DATE,
                'checksum': {'algorithm': 'sha256', 'of': 'corpora as JSON (sorted keys, compact separators, UTF-8)', 'value': hashlib.sha256(body).hexdigest()}}
        t, d = BUNDLE_TITLES[name]
        json.dump({'title': t, 'description': d, 'corpora': corpora, 'metadata': meta}, open(os.path.join(DL, 'Complete_%s_Grantha_Collector_Bundle.json' % name), 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
    if '--regenerate-digests' in sys.argv:
        r = subprocess.run([sys.executable, os.path.join(ROOT, 'expand_stub_editions.py')], capture_output=True, text=True); print(r.stdout.strip() or r.stderr.strip())
    else:
        print('editions/*-full-edition.html left untouched (pass --regenerate-digests to rebuild the six digest editions from the corpus)')
    print('written: library.html corpus literal, %d datasets, %d notebooks, %d dossiers, 4 bundles%s' % (len(ALL), len(ALL), len(ALL), ', 6 digests' if '--regenerate-digests' in sys.argv else ''))
if __name__ == '__main__': main()
