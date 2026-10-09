"""Deterministic Devanāgarī → IAST transliteration (used for verses restored from the witnesses)."""
import re
V = {'अ':'a','आ':'ā','इ':'i','ई':'ī','उ':'u','ऊ':'ū','ऋ':'ṛ','ॠ':'ṝ','ऌ':'ḷ','ए':'e','ऐ':'ai','ओ':'o','औ':'au'}
M = {'ा':'ā','ि':'i','ी':'ī','ु':'u','ू':'ū','ृ':'ṛ','ॄ':'ṝ','ॢ':'ḷ','े':'e','ै':'ai','ो':'o','ौ':'au'}
C = {'क':'k','ख':'kh','ग':'g','घ':'gh','ङ':'ṅ','च':'c','छ':'ch','ज':'j','झ':'jh','ञ':'ñ','ट':'ṭ','ठ':'ṭh','ड':'ḍ','ढ':'ḍh','ण':'ṇ',
     'त':'t','थ':'th','द':'d','ध':'dh','न':'n','प':'p','फ':'ph','ब':'b','भ':'bh','म':'m','य':'y','र':'r','ल':'l','व':'v','श':'ś','ष':'ṣ','स':'s','ह':'h','ळ':'ḷ'}
DIG = {'०':'0','१':'1','२':'2','३':'3','४':'4','५':'5','६':'6','७':'7','८':'8','९':'9'}
def dev2iast(t):
    out = []; i = 0; n = len(t)
    while i < n:
        ch = t[i]
        if ch in C:
            out.append(C[ch]); j = i + 1
            if j < n and t[j] == '़': j += 1
            if j < n and t[j] in M: out.append(M[t[j]]); i = j + 1; continue
            if j < n and t[j] == '्': i = j + 1; continue
            out.append('a'); i = j; continue
        if ch in V: out.append(V[ch])
        elif ch == 'ं': out.append('ṃ')
        elif ch == 'ः': out.append('ḥ')
        elif ch == 'ँ': out.append('m̐')
        elif ch == 'ऽ': out.append("'")
        elif ch == '।': out.append('|')
        elif ch == '॥': out.append('||')
        elif ch in DIG: out.append(DIG[ch])
        elif ch in '‌‍': pass
        else: out.append(ch)
        i += 1
    return ''.join(out)
