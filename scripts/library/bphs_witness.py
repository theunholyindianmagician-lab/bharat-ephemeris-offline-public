#!/usr/bin/env python3
"""bphs_witness.py — parse the two independent witnesses of the Bṛhat Parāśara Horā Śāstra text
and compare them chapter by chapter.

  witness A: Sanskrit Wikisource wikitext (fetched 2026-08-11 by tribev2/bphs-book/fetch_bphs.py)
  witness B: sanskritdocuments.org par0110 … par9197 HTML pages (fetched 2026-09-21)

Outputs (all under corpus/bphs/):
  wikisource.json          {chapter: {title, verses:[{n, sa}]}}   — chapter-title lines are NOT verses,
                           <ref>/URL junk stripped, first occurrence of a verse number wins
  sanskritdocuments.json   same shape
  witness-report.json      per chapter: counts in both witnesses, verses agreeing (similarity ≥ 0.8),
                           and the verdict used by bphs_canon.py

Usage: python3 scripts/library/bphs_witness.py [--wiki DIR] [--sd DIR]
  --wiki defaults to $BPHS_WIKI_SOURCE, else scratch/lib-audit/wiki (adhyaya-*.wiki.txt); --sd to scratch/lib-audit/sd
"""
import re, glob, json, os, sys, html as H, difflib
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, 'corpus', 'bphs')
args = sys.argv[1:]
def opt(k, d): return args[args.index(k) + 1] if k in args else d
WIKI = opt('--wiki', os.environ.get('BPHS_WIKI_SOURCE') or os.path.join(ROOT, 'scratch', 'lib-audit', 'wiki'))
SD = opt('--sd', os.path.join(ROOT, 'scratch', 'lib-audit', 'sd'))
DIG = '०१२३४५६७८९'
def toint(s): return int(''.join(str(DIG.index(c)) if c in DIG else c for c in s))
MARK = re.compile(r"(?:॥|\|\|)\s*([०-९\d]+)\s*(?:॥|\|\|)")

def parse_wiki(path):
    t = open(path, encoding='utf-8').read()
    t = re.sub(r"<!--.*?-->", "", t, flags=re.S); t = re.sub(r"\{\{header.*?\}\}", "", t, flags=re.S)
    t = re.sub(r"<ref[^>]*>.*?</ref>", "", t, flags=re.S); t = re.sub(r"<ref[^>]*/?>", "", t)
    t = re.sub(r"\[https?://\S+[^\]]*\]", "", t); t = re.sub(r"https?://\S+", "", t); t = re.sub(r"thumb\|\d+px\|", "", t)
    t = re.sub(r"<span[^>]*>", "", t); t = t.replace("</span>", "")
    for x in ["<poem>", "</poem>", "<pre>", "</pre>", '<div class="verse">', "</div>"]: t = t.replace(x, "")
    t = re.sub(r"<div[^>]*>", "", t); t = re.sub(r"\[\[([^\]|]*\|)?([^\]]*)\]\]", r"\2", t); t = re.sub(r"<br\s*/?>", "\n", t)
    pos = 0; verses = []; title = None
    for m in MARK.finditer(t):
        body = t[pos:m.start()].strip().strip("।|॥ \n"); pos = m.end(); n = toint(m.group(1))
        body = re.sub(r"[ \t]+", " ", body); body = re.sub(r"\n{2,}", "\n", body).strip()
        lines = [l.strip() for l in body.split('\n') if l.strip()]; last = lines[-1] if lines else ''
        # a chapter-title line: 'अथ …अध्यायः' (sandhi forms अथा…/अथै…/अथो… included) or chapter 1's bare title; never a line with a danda
        istitle = ('ध्याय' in last or 'ध्यय' in last) and '।' not in last and len(lines) <= 2 and (last.startswith('अथ') or last == 'सृष्टिक्रमकथनाध्यायः')
        if istitle:
            title = last
            if len(lines) == 2: verses.append({'n': None, 'sa': lines[0]})      # e.g. the maṅgala before the title of ch.1
            continue
        verses.append({'n': n, 'sa': body})
    seen = {}
    for v in verses:
        if v['n'] is None: continue
        seen.setdefault(v['n'], v)
    return {'title': title, 'verses': [seen[k] for k in sorted(seen)]}

def parse_sd(files):
    chapters = {}; cur = None; buf = []; expected = 1
    for f in files:
        s = open(f, encoding='utf-8', errors='replace').read()
        body = re.sub(r'<script.*?</script>|<style.*?</style>', '', s, flags=re.S)
        t = H.unescape(re.sub(r'<br\s*/?>|</p>|</div>|</h\d>', '\n', body)); t = re.sub('<[^>]+>', '', t)
        for l in [x.strip() for x in t.split('\n') if x.strip()]:
            m = re.search(r'॥\s*([०-९\d]+)\s*॥\s*$', l)
            if m and len(l) < 70 and '।' not in l and toint(m.group(1)) == expected and ('ध्य' in l or 'कथ' in l or l.startswith('अथ')):
                cur = expected; expected += 1; chapters[cur] = {'title': l[:m.start()].strip(), 'verses': []}; buf = []; continue
            if cur is None: continue
            if m:
                buf.append(l[:m.start()].strip().rstrip('।').strip()); chapters[cur]['verses'].append({'n': toint(m.group(1)), 'sa': '\n'.join(x for x in buf if x)}); buf = []
            else: buf.append(l)
    return chapters

def norm(x): return re.sub(r'[\s।॥\-‌‍ऽ]', '', x)

def main():
    os.makedirs(OUT, exist_ok=True)
    wiki_files = sorted(glob.glob(os.path.join(WIKI, 'adhyaya-*.wiki.txt'))); sd_files = glob.glob(os.path.join(SD, 'par*.html'))
    if not wiki_files or not sd_files:   # never overwrite the corpus with an empty witness
        sys.exit('no witness files: --wiki %s (adhyaya-*.wiki.txt) and --sd %s (par*.html) must both exist' % (WIKI, SD))
    wiki = {}
    for f in wiki_files:
        ch = int(re.search(r'adhyaya-(\d+)', f).group(1)); wiki[ch] = parse_wiki(f)
    sd = parse_sd(sorted(sd_files, key=lambda p: int(re.search(r'par(\d\d)', p).group(1))))
    json.dump({str(k): v for k, v in sorted(wiki.items())}, open(os.path.join(OUT, 'wikisource.json'), 'w'), ensure_ascii=False, indent=1)
    json.dump({str(k): v for k, v in sorted(sd.items())}, open(os.path.join(OUT, 'sanskritdocuments.json'), 'w'), ensure_ascii=False, indent=1)
    report = {}
    # duplicate detection inside Wikisource: chapter c whose verses largely repeat another chapter
    wnorm = {c: [norm(v['sa']) for v in w['verses']] for c, w in wiki.items()}
    for c in range(1, 98):
        wv = wiki.get(c, {'verses': []})['verses']; sv = sd.get(c, {'verses': []})['verses']
        sdn = [norm(v['sa']) for v in sv]
        agree = 0; sims = []
        for v in wv:
            a = norm(v['sa']); best = max((difflib.SequenceMatcher(None, a, b).ratio() for b in sdn), default=0.0); sims.append(round(best, 3))
            if best >= 0.8: agree += 1
        dup_of = None
        for d in range(1, 98):
            if d == c or not wnorm.get(d): continue
            hits = sum(1 for a in wnorm[c] if a in wnorm[d])
            if wv and hits >= max(3, 0.5 * len(wv)): dup_of = d; break
        report[c] = {'wiki': len(wv), 'sd': len(sv), 'agree': agree, 'wiki_duplicates_chapter': dup_of, 'sims': sims,
                     'wiki_title': wiki.get(c, {}).get('title'), 'sd_title': sd.get(c, {}).get('title')}
    json.dump(report, open(os.path.join(OUT, 'witness-report.json'), 'w'), ensure_ascii=False, indent=1)
    tw = sum(r['wiki'] for r in report.values()); ts = sum(r['sd'] for r in report.values())
    print(f'wikisource: 97 chapters, {tw} verses (titles excluded) | sanskritdocuments: {len(sd)} chapters, {ts} verses')
    print('ch | wiki | sd | agree | note')
    for c, r in report.items():
        note = []
        if r['wiki_duplicates_chapter']: note.append(f"wiki text repeats ch {r['wiki_duplicates_chapter']}")
        if r['sd'] == 0: note.append('sd missing')
        elif r['wiki'] != r['sd']: note.append('count differs')
        if r['sd'] and r['agree'] < r['wiki']: note.append(f"{r['wiki'] - r['agree']} wiki verses without sd match")
        if note: print(f"{c:>2} | {r['wiki']:>3} | {r['sd']:>3} | {r['agree']:>3} | {'; '.join(note)}")
if __name__ == '__main__': main()
