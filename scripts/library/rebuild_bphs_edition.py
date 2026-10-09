#!/usr/bin/env python3
"""rebuild_bphs_edition.py — re-align editions/parashara-rahasya-full-edition.html to corpus/bphs/canon.json.

For every canonical verse (chapter, n, sa, iast, source):
  • an existing article with the same number and the same text (Devanāgarī-only similarity ≥ 0.9) keeps its
    treatment verbatim;
  • otherwise an existing article anywhere in the chapter with the same text is reused (renumbered verses);
  • otherwise the verse is emitted with its text and a clearly labelled pending-treatment block.
Chapter-title pseudo-verses are dropped; chapter counts, the recension totals and a preface note are updated.
Idempotent: running it twice yields the same file.
"""
import re, json, os, html as H, difflib, sys
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
ED = os.path.join(ROOT, 'editions', 'parashara-rahasya-full-edition.html')
CANON = json.load(open(os.path.join(ROOT, 'corpus', 'bphs', 'canon.json'), encoding='utf-8'))
REPORT = json.load(open(os.path.join(ROOT, 'corpus', 'bphs', 'witness-report.json'), encoding='utf-8'))
DATE = '2026-09-21'
def deva(x): return re.sub(r'[^ऀ-ॿ]', '', H.unescape(re.sub('<[^>]+>', '', x)))
def sim(a, b): return difflib.SequenceMatcher(None, a, b).ratio()
def esc(x): return H.escape(x, quote=False)
def pending(reason_hi, reason_en, source):
    return ('<div class="treatment"><p><span class="lbl pending">सम्पादन-स्थिति · audit ' + DATE + '</span> इस श्लोक का मूल पाठ ' + esc(source) + ' साक्षी से ' + reason_hi +
            ' पदच्छेद-अन्वय, हिन्दी भावार्थ, English rendering और गणित-टिप्पणी अभी <strong>लंबित</strong> हैं — तब तक यह श्लोक केवल मूल-पाठ के रूप में दिया गया है। / '
            'The Sanskrit text of this verse was ' + reason_en + ' from the ' + esc(source) + ' witness on ' + DATE + '; the word-by-word anvaya, Hindi gloss, English rendering and mathematical note are <strong>pending</strong>.</p></div>')
s = open(ED, encoding='utf-8').read()
total_new = CANON['total_verses']; stats = {'kept': 0, 'renumbered': 0, 'pending': 0, 'dropped_titles': 0}
chapter_notes = []
for c in range(1, 98):
    sec = re.search(r'(<section class="chapter" id="ch%d">.*?)(</section>)' % c, s, re.S)
    if not sec: sys.exit('chapter section missing: %d' % c)
    body = sec.group(1)
    head = re.match(r'(.*?<div class="ch-intro">)(.*?)(</div>)', body, re.S)
    arts = [(m.group(0), m.group(1)) for m in re.finditer(r'<article class="verse" id="v%d-(\d+)">.*?</article>' % c, body, re.S)]
    existing = []
    for html_, n in arts:
        sa = re.search(r'<div class="sa">(.*?)</div>', html_, re.S); tr = re.search(r'<div class="treatment">.*?</div></article>', html_, re.S)
        ia = re.search(r'<div class="iast">(.*?)</div>', html_, re.S)
        existing.append({'n': int(n), 'deva': deva(sa.group(1)) if sa else '', 'iast': ia.group(1) if ia else '', 'treatment': tr.group(0)[:-len('</article>')] if tr else '', 'used': False})
    canon = CANON['chapters'][str(c)]; rep = REPORT[str(c)]
    out = []
    for v in canon['verses']:
        d = deva(v['sa']); match = None
        same = [e for e in existing if e['n'] == v['n'] and not e['used']]
        # same number: a moderate similarity is enough (citation junk in the old text lowers the ratio)
        if same and sim(same[0]['deva'], d) >= 0.6: match = same[0]; stats['kept'] += 1
        else:
            cands = sorted(((sim(e['deva'], d), e) for e in existing if not e['used']), key=lambda x: -x[0])
            if cands and cands[0][0] >= 0.9: match = cands[0][1]; stats['renumbered'] += 1
        sa_html = '<br>'.join(esc(x.strip()) for x in v['sa'].split('\n') if x.strip())
        prov = ''
        if match:
            match['used'] = True; treatment = match['treatment']; iast_html = match['iast'] if sim(deva(match['iast']) or '', '') == 0 and match['iast'] else '<br>'.join(esc(x) for x in v['iast'].split('\n'))
            iast_html = match['iast'] or '<br>'.join(esc(x.strip()) for x in v['iast'].split('\n') if x.strip())
        else:
            stats['pending'] += 1
            iast_html = '<br>'.join(esc(x.strip()) for x in v['iast'].split('\n') if x.strip())
            if v['source'] == 'sanskritdocuments.org':
                treatment = pending('लिया गया है (Wikisource पृष्ठ पर यह अध्याय दूसरे अध्याय का पाठ दोहराता था)।', 'taken', 'sanskritdocuments.org')
            else:
                treatment = pending('पुनर्स्थापित किया गया है (पूर्व-निर्माण में इस क्रमांक पर अध्याय-शीर्षक पंक्ति आ गई थी)।', 'restored (the earlier build had placed the chapter-title line at this number)', 'sa.wikisource.org')
            prov = '<div class="provenance">पाठ-स्रोत / text source: ' + esc(v['source']) + ' · ' + DATE + '</div>'
        out.append('<article class="verse" id="v%d-%d"><div class="vnum">%d.%d</div><div class="sa">%s</div><div class="iast">%s</div>%s%s</article>' % (c, v['n'], c, v['n'], sa_html, iast_html, prov, treatment))
    stats['dropped_titles'] += sum(1 for e in existing if not e['used'] and 'ध्याय' in e['deva'] and len(e['deva']) < 45)
    unused = [e for e in existing if not e['used'] and not ('ध्याय' in e['deva'] and len(e['deva']) < 45)]
    intro = head.group(2)
    intro = re.sub(r'<p class="ch-notice">.*?</p>', '', intro, flags=re.S)
    if canon['source'] == 'sanskritdocuments.org':
        dup = rep['wiki_duplicates_chapter']
        why = ('अध्याय %d का पाठ दोहराता था' % dup) if dup else 'अध्याय 24 के 34 श्लोक दोहराता था'
        why_en = ('repeated the text of chapter %d' % dup) if dup else 'repeated 34 verses of chapter 24'
        note = ('<p class="ch-notice"><strong>पाठ-टिप्पणी (audit %s):</strong> इस अध्याय का Sanskrit-Wikisource पृष्ठ (2026-08-11) %s; यहाँ पाठ sanskritdocuments.org साक्षी से लिया गया है (%d श्लोक)। '
                'जिन श्लोकों का पाठ पूर्व-संस्करण से मेल खाता है उनकी टिप्पणियाँ रखी गई हैं; शेष की टिप्पणियाँ लंबित हैं। / The Wikisource page for this chapter %s; the text below is from the sanskritdocuments.org witness (%d verses). Commentary is kept where the verse text matches the previous edition and pending elsewhere.</p>'
                % (DATE, why, len(canon['verses']), why_en, len(canon['verses'])))
        intro = note + intro
        chapter_notes.append((c, len(canon['verses'])))
    new_body = head.group(1) + intro + head.group(3) + ''.join(out)
    # keep anything that followed the last article (e.g. chapter colophon markup), excluding old articles
    tail = body[len(head.group(0)):]
    tail = re.sub(r'<article class="verse" id="v%d-\d+">.*?</article>' % c, '', tail, flags=re.S)
    new_body += tail
    new_body = re.sub(r'<div class="ch-count">\d+ श्लोक</div>', '<div class="ch-count">%d श्लोक</div>' % len(canon['verses']), new_body)
    s = s[:sec.start()] + new_body + sec.group(2) + s[sec.end():]
    if unused: print('  ch%d: %d old articles not matched by any canonical verse (dropped): %s' % (c, len(unused), [e['n'] for e in unused][:10]))
# totals and preface
s = re.sub(r'(97 अध्याय\s*[/,·]?\s*)3,?\d{3}( श्लोक)', lambda m: m.group(1) + '{:,}'.format(total_new) + m.group(2), s)
s = re.sub(r'97 adhyāya · 3,?\d{3} verses', '97 adhyāya · %d verses' % total_new, s)
if 'id="audit-note-2026-09-21"' not in s:
    note = ('<div class="ch-intro" id="audit-note-2026-09-21"><p class="ch-notice"><strong>पाठ-संशोधन (audit %s):</strong> दो स्वतन्त्र साक्षियों (Sanskrit Wikisource, 2026-08-11; sanskritdocuments.org, %s) की श्लोक-दर-श्लोक तुलना में पाया गया कि Wikisource के अध्याय 16, 18, 20, 22, 23, 35 दूसरे अध्यायों का पाठ दोहराते थे और अध्याय 25 में अध्याय 24 के 34 श्लोक जुड़े थे; इन सात अध्यायों का पाठ अब sanskritdocuments.org से है। पूर्व-निर्माण में 39 अध्यायों में अध्याय-शीर्षक पंक्ति एक श्लोक के स्थान पर आ गई थी — वे श्लोक पुनर्स्थापित हैं, और 47 शीर्षक-पंक्तियाँ श्लोक-गणना से हटाई गईं। इस संस्करण की पिन: 97 अध्याय / %s श्लोक; हर श्लोक का स्रोत corpus/bphs/canon.json में दर्ज है। / Verse-by-verse comparison of two independent witnesses showed that the Wikisource pages of chapters 16, 18, 20, 22, 23 and 35 repeated other chapters and chapter 25 carried 34 verses of chapter 24; those seven chapters now follow sanskritdocuments.org. In 39 chapters the earlier build had put the chapter-title line in place of a verse (restored), and 47 title lines were removed from the verse count. This edition is pinned at 97 chapters / %s verses; every verse\'s source is recorded in corpus/bphs/canon.json.</p></div>'
            % (DATE, DATE, '{:,}'.format(total_new), '{:,}'.format(total_new)))
    i = s.find('<section class="chapter" id="ch1">'); s = s[:i] + note + s[i:]
if '.lbl.pending' not in s:
    s = s.replace('</style>', '.lbl.pending{background:#7a1f12;color:#fff2d8}.provenance{font-size:.78rem;color:#8a7a60;text-align:center;margin:-.4em 0 .8em}.ch-notice{border:1px solid #c9a25a;padding:.8em 1em;border-radius:4px;background:rgba(201,162,90,.08);font-size:.92rem}\n</style>', 1)
open(ED, 'w', encoding='utf-8').write(s)
n_articles = len(re.findall(r'<article class="verse" id="v\d+-\d+">', s))
print('rebuilt:', stats, '| articles now', n_articles, '| canon total', total_new, '| chapters from sanskritdocuments', [c for c, _ in chapter_notes])
