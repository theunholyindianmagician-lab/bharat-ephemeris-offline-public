#!/usr/bin/env python3
"""bphs_canon.py — build corpus/bphs/canon.json: the verse text this edition is pinned to.

Rule (from corpus/bphs/witness-report.json): Sanskrit Wikisource is the base text; a chapter whose Wikisource
page repeats another chapter's verses (16, 18, 20, 22, 23, 35) or is padded with another chapter's verses (25)
is taken from the sanskritdocuments.org witness instead. Chapter-title lines are never verses. Each verse
records its provenance so the edition can say exactly where every line came from.
"""
import json, os, re, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from iast import dev2iast
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
D = os.path.join(ROOT, 'corpus', 'bphs')
wiki = json.load(open(os.path.join(D, 'wikisource.json'), encoding='utf-8'))
sd = json.load(open(os.path.join(D, 'sanskritdocuments.json'), encoding='utf-8'))
rep = json.load(open(os.path.join(D, 'witness-report.json'), encoding='utf-8'))
canon = {}; total = 0; from_sd = []
for c in range(1, 98):
    r = rep[str(c)]
    use_sd = bool(r['wiki_duplicates_chapter']) and r['agree'] == 0          # Wikisource page is another chapter's text
    if c == 25 and r['wiki'] > r['sd'] and r['agree'] == r['sd']: use_sd = True   # padded with ch.24 verses
    src = sd if use_sd else wiki
    if use_sd: from_sd.append(c)
    verses = [{'n': v['n'], 'sa': v['sa'].replace('\n', ' । ') if False else v['sa'], 'iast': dev2iast(v['sa']),
               'source': 'sanskritdocuments.org' if use_sd else 'sa.wikisource.org'} for v in src[str(c)]['verses']]
    canon[str(c)] = {'title': (wiki[str(c)].get('title') or sd[str(c)].get('title')), 'source': 'sanskritdocuments.org' if use_sd else 'sa.wikisource.org', 'verses': verses}
    total += len(verses)
json.dump({'built': '2026-09-21', 'rule': 'Wikisource base; chapters whose Wikisource page repeats/pads another chapter taken from sanskritdocuments.org',
           'chapters_from_sanskritdocuments': from_sd, 'total_verses': total, 'chapters': canon},
          open(os.path.join(D, 'canon.json'), 'w'), ensure_ascii=False, indent=1)
print('canon: 97 chapters,', total, 'verses; chapters from sanskritdocuments:', from_sd)
print('per-chapter counts:', {c: len(canon[str(c)]['verses']) for c in range(1, 98)})
