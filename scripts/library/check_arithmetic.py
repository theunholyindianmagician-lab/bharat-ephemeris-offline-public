#!/usr/bin/env python3
"""check_arithmetic.py — evaluate every explicit numeric identity ("a × b ÷ c = d = e …") written inside the
गणित / उदाहरण blocks of a full edition and report the ones that do not hold to the precision shown.
Linear-time scanner (no nested regex quantifiers). Devanāgarī digits are read as digits.
  python3 scripts/library/check_arithmetic.py editions/surya-siddhanta-full-edition.html
"""
import re, sys, html as H, os
DIG = '०१२३४५६७८९'
def todigits(t): return ''.join(str(DIG.index(c)) if c in DIG else c for c in t)
def txt(x): return H.unescape(re.sub(r'<br\s*/?>', '\n', re.sub('<(?!br)[^>]+>', ' ', x)))
NUM = re.compile(r'\d[\d,]*(?:\.\d+)?')
def ev(seg):
    e = seg.replace('×', '*').replace('x', '*').replace('÷', '/').replace('−', '-').replace('⁄', '/').replace('^', '**').replace(',', '').strip()
    e = e.strip(' .;:')
    if not e or not re.fullmatch(r'[\d\.\s\*\/\+\-\(\)]+', e) or not re.search(r'\d', e): return None
    if e.count('(') != e.count(')'): return None
    try: return float(eval(e, {'__builtins__': {}}))
    except Exception: return None
def shown_ok(a, b, seg):
    m = NUM.findall(seg); shown = m[-1] if m else ''
    dec = len(shown.split('.')[1]) if '.' in shown else 0
    return abs(a - b) <= 0.5 * 10 ** -dec * 1.05 or (dec and abs(a - b) < 10 ** -dec * 1.05) or (b and abs(a - b) / abs(b) < 2e-3) or (a and abs(a - b) / abs(a) < 2e-3)
def check(path):
    s = open(path, encoding='utf-8').read(); n = 0; bad = []
    for a in re.finditer(r'<article class="verse"[^>]*>(.*?)</article>', s, re.S):
        vn = re.search(r'class="vnum"[^>]*>\s*([^<]+)<', a.group(1)); vn = vn.group(1).strip() if vn else '?'
        blocks = re.findall(r'<p>(?:<span class="lbl (?:math|ex)">.*?</span>|<strong>गणित[^<]*</strong>)(.*?)</p>', a.group(1), re.S)
        for blk in blocks:
            for line in todigits(txt(blk)).split('\n'):
                # split the line into equality chains on = ≈ ≃ ⇒ ; keep only chains whose segments are pure arithmetic
                for piece in re.split(r'[।;|]', line):
                    segs = re.split(r'\s*(?:=|≈|≃|⇒)\s*', piece)
                    if len(segs) < 2: continue
                    # trim each segment to its trailing/leading arithmetic run
                    vals = []
                    for i, sg in enumerate(segs):
                        m = re.search(r'[\d\(\)][\d\.,\s×x\*/÷+−\-⁄\^\(\)]*$', sg) if i == 0 else re.match(r'^[\-−]?[\d\(][\d\.,\s×x\*/÷+−\-⁄\^\(\)]*', sg)
                        v = ev(m.group(0)) if m else None
                        vals.append((sg, v, m.group(0) if m else ''))
                    good = [(sg, v, r) for sg, v, r in vals if v is not None]
                    if len(good) < 2: continue
                    if not any(re.search(r'[×x\*/÷+−\-⁄\^]', r.strip()[1:]) for _, _, r in good): continue
                    n += 1; ref = good[0][1]
                    for sg, v, r in good[1:]:
                        if not shown_ok(ref, v, r): bad.append((vn, piece.strip()[:130], round(ref, 6), round(v, 6))); break
    return n, bad
if __name__ == '__main__':
    for p in sys.argv[1:]:
        n, bad = check(p); print(f'{os.path.basename(p)}: identities checked {n}, not holding {len(bad)}')
        for x in bad: print('  ', x)
