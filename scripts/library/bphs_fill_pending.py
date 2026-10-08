#!/usr/bin/env python3
"""bphs_fill_pending.py — supply the treatment (पदच्छेद-अन्वय · भावार्थ · English · गणित · उदाहरण · डिकोड) for
every verse of editions/parashara-rahasya-full-edition.html that carries the "commentary pending" block.

  --list            write corpus/bphs/pending-verses.md (chapter, id, witness, Devanāgarī) — the worklist
  --grok            generate treatments with the book's Grok pipeline (same prompt as tribev2/bphs-book/bdriver.py:
                    style-prompt.md + dossier.md, batches of 7) into corpus/bphs/treatments/; needs `grok login`,
                    $BPHS_PIPELINE_DIR (the directory holding style-prompt.md and dossier.md) and the grok CLI
                    ($GROK_BIN, or `grok` on PATH)
  --inject          read corpus/bphs/treatments/*.md ("#### VERSE c.n" sections, the pipeline's markdown format),
                    validate (every pending verse present, the four mandatory labels, no preamble/refusal, no
                    working-note or agent-report phrase), convert
                    with the assembler's markdown rules (tribev2/bphs-book/bassemble.py) and replace the pending
                    blocks; update chapter notices and the preface count. Idempotent.

Treatments live in corpus/bphs/treatments/ and are part of the repository (provenance of every commentary).
"""
import re, os, sys, json, glob, html, subprocess, time, shutil
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
ED = os.path.join(ROOT, 'editions', 'parashara-rahasya-full-edition.html')
CB = os.path.join(ROOT, 'corpus', 'bphs'); TR = os.path.join(CB, 'treatments'); os.makedirs(TR, exist_ok=True)
PIPE = os.environ.get('BPHS_PIPELINE_DIR')   # the bphs-book pipeline directory; needed only by --grok
DATE = '2026-09-21'
CANON = json.load(open(os.path.join(CB, 'canon.json'), encoding='utf-8'))['chapters']

def pending():
    s = open(ED, encoding='utf-8').read(); out = []
    for m in re.finditer(r'<article class="verse" id="v(\d+)-(\d+)">(.*?)</article>', s, re.S):
        if 'class="lbl pending"' in m.group(3):
            c, n = int(m.group(1)), int(m.group(2))
            v = next(x for x in CANON[str(c)]['verses'] if x['n'] == n)
            out.append({'ch': c, 'n': n, 'sa': v['sa'], 'source': v['source']})
    return s, out

# ---- markdown → HTML, identical to tribev2/bphs-book/bassemble.py ----
LBL = {"पदच्छेद-अन्वय (शब्दार्थ):": "pada", "हिन्दी भावार्थ:": "bhav", "English rendering:": "eng",
       "गणित / तकनीक (The Mathematics / Technique):": "math", "गणित / The Mathematics:": "math",
       "उदाहरण (worked example):": "ex", "हमारा डिकोड (Our Decode):": "decode"}
def latex_fix(t):
    t = re.sub(r"\$([^$]+)\$", r"\1", t)
    t = t.replace(r"\times", "×").replace(r"\cdot", "·").replace(r"\sqrt", "√").replace(r"\div", "÷")
    t = re.sub(r"\\frac\{([^{}]+)\}\{([^{}]+)\}", r"(\1)/(\2)", t)
    t = re.sub(r"\^\{([^{}]+)\}", r"<sup>\1</sup>", t); t = re.sub(r"_\{([^{}]+)\}", r"<sub>\1</sub>", t)
    t = re.sub(r"\^(\w)", r"<sup>\1</sup>", t)
    return t
def inline(t):
    t = html.escape(t, quote=False)
    t = re.sub(r"\*\*([^*]+)\*\*", r"<strong>\1</strong>", t); t = re.sub(r"\*([^*\n]+)\*", r"<em>\1</em>", t)
    t = t.replace("\n", "<br>")
    for lbl, cls in LBL.items():
        esc = f"<strong>{lbl}</strong>"
        if t.startswith(esc): t = f'<span class="lbl {cls}">{lbl[:-1]}</span>' + t[len(esc):]
    return t
def md_to_html(md):
    md = latex_fix(md); md = re.sub(r"\n(?=\*\*[^*])", "\n\n", md); out = []
    for b in re.split(r"\n\s*\n", md.strip()):
        b = b.strip()
        if not b: continue
        if all(re.match(r"^(?:- |• |\* (?!\*))", l.strip()) for l in b.splitlines()):
            out.append("<ul>" + "".join(f"<li>{inline(l.strip()[2:].strip())}</li>" for l in b.splitlines()) + "</ul>")
        else: out.append(f"<p>{inline(b)}</p>")
    return "\n".join(out)

MANDATORY = ["**पदच्छेद-अन्वय (शब्दार्थ):**", "**हिन्दी भावार्थ:**", "**English rendering:**", "**गणित / "]
# working notes and agent-report text that must never reach the edition (each phrase is written so this line does not match itself)
SCRATCH = re.compile(r"let me (?:redo|recompute|output)|i need to clean[ ]up|task complete\.|batch[ ]complete:|rendered[ ]per style-prompt"
                     r"|CLAUDE\.md|OPERATORS[-]BOOTED|CLAUDE[-]VRAT", re.I)
def load_treatments():
    tr = {}
    for f in sorted(glob.glob(os.path.join(TR, '*.md'))):
        parts = re.split(r"^#{2,4}\s*VERSE\s+([0-9]+\.[0-9]+)\s*$", open(f, encoding='utf-8').read(), flags=re.M)
        for i in range(1, len(parts), 2):
            vid, body = parts[i], parts[i + 1].strip()
            if vid not in tr or len(body) > len(tr[vid]): tr[vid] = body
    return tr
def validate(vid, body):
    probs = [l for l in MANDATORY if l not in body]
    if re.search(r"\b(I cannot|I can't|As an AI|I'm sorry)\b", body): probs.append('refusal/preamble')
    m = SCRATCH.search(body)
    if m: probs.append('working-note phrase (%s)' % m.group(0))
    if len(body) < 300: probs.append('too short (%d chars)' % len(body))
    if '$' in body: probs.append('LaTeX $ present')
    return ['%s: %s' % (vid, p) for p in probs]

def cmd_list():
    _, P = pending()
    L = ['# Pending BPHS verses — worklist (%s)' % DATE, '', 'Treatment format: tribev2/bphs-book/style-prompt.md (sections: पदच्छेद-अन्वय · हिन्दी भावार्थ · English rendering · गणित/तकनीक · उदाहरण (if computation) · हमारा डिकोड (only if genuine)). "We" claims only from dossier.md.', '']
    cur = None
    for v in P:
        if v['ch'] != cur:
            cur = v['ch']; L += ['', '## Adhyāya %d · %s (%d pending; witness %s)' % (cur, CANON[str(cur)]['title'] or '', sum(1 for x in P if x['ch'] == cur), v['source']), '']
        L += ['[VERSE %d.%d]' % (v['ch'], v['n']), v['sa'], '']
    open(os.path.join(CB, 'pending-verses.md'), 'w', encoding='utf-8').write('\n'.join(L))
    print('pending:', len(P), 'verses →', os.path.join(CB, 'pending-verses.md'))

def cmd_grok():
    GROK = os.environ.get('GROK_BIN') or shutil.which('grok')
    if not PIPE or not os.path.isdir(PIPE): sys.exit('--grok needs BPHS_PIPELINE_DIR: the directory holding style-prompt.md and dossier.md')
    if not GROK: sys.exit('--grok needs the grok CLI: set GROK_BIN or put grok on PATH')
    STYLE = open(os.path.join(PIPE, 'style-prompt.md'), encoding='utf-8').read(); DOSSIER = open(os.path.join(PIPE, 'dossier.md'), encoding='utf-8').read()
    SYS = ("You are a bilingual book-writing engine. You write the requested document content directly, completely, and in full in one response. "
           "You never write plans, acknowledgments, preambles, or closing remarks — only the deliverable content. You have NO tools and NO files to consult: everything needed is in the prompt; write immediately.")
    _, P = pending(); tr = load_treatments(); todo = [v for v in P if '%d.%d' % (v['ch'], v['n']) not in tr]
    print('to generate:', len(todo))
    by = {}
    for v in todo: by.setdefault(v['ch'], []).append(v)
    for ch, vs in by.items():
        for i in range(0, len(vs), 7):
            batch = vs[i:i + 7]; tag = 'ch%02d-pending-b%02d' % (ch, i // 7)
            p = [STYLE, "\n\n# DECODE DOSSIER (only source of 'we' claims)\n", DOSSIER,
                 "\n\n# BATCH — Adhyāya %d: treat ALL %d verses, in order. Text witness: %s.\n" % (ch, len(batch), batch[0]['source'])]
            for v in batch: p.append('\n[VERSE %d.%d]\n%s\n' % (v['ch'], v['n'], v['sa']))
            p.append("\nIds exactly: %s\nCRITICAL: begin directly with '#### VERSE %d.%d'." % (', '.join('%d.%d' % (v['ch'], v['n']) for v in batch), batch[0]['ch'], batch[0]['n']))
            pf = os.path.join(TR, '.prompt-%s.md' % tag); open(pf, 'w', encoding='utf-8').write(''.join(p))
            for att in range(2):
                r = subprocess.run([GROK, '--prompt-file', pf, '--max-turns', '1', '--disable-web-search', '--no-plan', '--no-subagents', '--no-memory', '--system-prompt-override', SYS], capture_output=True, text=True, timeout=900, cwd=TR)
                text = r.stdout.strip()
                if all('#### VERSE %d.%d' % (v['ch'], v['n']) in text for v in batch):
                    open(os.path.join(TR, tag + '.md'), 'w', encoding='utf-8').write(text); print('OK', tag); break
                print('  retry', tag, (r.stderr or '')[:120])
            os.unlink(pf)

def cmd_inject():
    s, P = pending(); tr = load_treatments(); probs = []
    for v in P:
        vid = '%d.%d' % (v['ch'], v['n'])
        if vid not in tr: probs.append('%s: no treatment' % vid); continue
        probs += validate(vid, tr[vid])
    if probs:
        print('NOT INJECTED — %d problems:' % len(probs)); [print('  ', p) for p in probs[:40]]; sys.exit(1)
    n = 0
    for v in P:
        vid = '%d.%d' % (v['ch'], v['n'])
        art = re.search(r'(<article class="verse" id="v%d-%d">.*?)(<div class="treatment"><p><span class="lbl pending">.*?</p></div>)(</article>)' % (v['ch'], v['n']), s, re.S)
        if not art: continue
        new = '<div class="treatment">' + md_to_html(tr[vid]) + '</div>'
        s = s[:art.start(2)] + new + s[art.end(2):]; n += 1
    # chapter notices + preface: commentary no longer pending
    s = s.replace('जिन श्लोकों का पाठ पूर्व-संस्करण से मेल खाता है उनकी टिप्पणियाँ रखी गई हैं; शेष की टिप्पणियाँ लंबित हैं। / ',
                  'जिन श्लोकों का पाठ पूर्व-संस्करण से मेल खाता है उनकी टिप्पणियाँ रखी गई हैं; शेष श्लोकों की टिप्पणियाँ %s के सम्पादकीय पास में उसी शैली-नियम (पदच्छेद · भावार्थ · English · गणित · उदाहरण · डिकोड) से लिखी गईं। / ' % DATE)
    s = s.replace('Commentary is kept where the verse text matches the previous edition and pending elsewhere.',
                  'Commentary is kept where the verse text matches the previous edition; the remaining verses were treated in the editorial pass of %s under the same style rules.' % DATE)
    s = re.sub(r'(इस संस्करण की पिन: 97 अध्याय / [\d,]+ श्लोक;)', r'\1 पुनर्स्थापित/प्रतिस्थापित श्लोकों की टिप्पणियाँ ' + DATE + ' के सम्पादकीय पास में जोड़ी गईं;', s) if 'सम्पादकीय पास में जोड़ी गईं' not in s else s
    s = re.sub(r'(This edition is pinned at 97 chapters / [\d,]+ verses;)', r'\1 commentary for the restored/replaced verses was added in the editorial pass of ' + DATE + ';', s) if 'commentary for the restored/replaced verses was added' not in s else s
    open(ED, 'w', encoding='utf-8').write(s)
    left = len(re.findall(r'class="lbl pending"', s))
    print('injected %d treatments; pending blocks left: %d' % (n, left))

if __name__ == '__main__':
    a = sys.argv[1:] or ['--list']
    {'--list': cmd_list, '--grok': cmd_grok, '--inject': cmd_inject}[a[0]]()
