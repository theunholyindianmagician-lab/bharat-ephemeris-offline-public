# corpus/bphs — the verse text the Parāśara edition is pinned to

Built by `scripts/library/bphs_witness.py` → `bphs_canon.py` → `rebuild_bphs_edition.py` (audit of 2026-09-21).

| file | content |
|---|---|
| `wikisource.json` | Sanskrit Wikisource *बृहत्पाराशरहोराशास्त्रम्* (wikitext fetched 2026-08-11 by `tribev2/bphs-book/fetch_bphs.py`), parsed with chapter-title lines excluded and `<ref>`/URL junk stripped |
| `sanskritdocuments.json` | sanskritdocuments.org `doc_z_misc_sociology_astrology/par0110 … par9197` (fetched 2026-09-21), an independent witness; free for non-commercial use per the site's terms |
| `witness-report.json` | per chapter: verse counts in both witnesses, verses agreeing (similarity ≥ 0.8), and which Wikisource pages repeat another chapter |
| `treatments/*.md` | the commentaries supplied on 2026-09-21 for the 218 verses whose text was restored or replaced ("#### VERSE c.n" sections in the pipeline's markdown format: पदच्छेद-अन्वय · हिन्दी भावार्थ · English rendering · गणित/तकनीक · उदाहरण · हमारा डिकोड), written under `tribev2/bphs-book/style-prompt.md` + `dossier.md` rules; injected by `scripts/library/bphs_fill_pending.py --inject` |
| `canon.json` | the pinned text: Wikisource base; chapters **16, 18, 20, 22, 23, 35** (Wikisource page repeats another chapter) and **25** (padded with 34 verses of chapter 24) from sanskritdocuments.org. 97 chapters, **3,943 verses**, provenance per verse |

Findings that drove this: the earlier build (3,985 "verses") counted 80 chapter-title lines as verses, and in 39 chapters the title line had displaced the real verse of the same number; seven chapters carried another chapter's text because the Wikisource pages do. The rebuilt edition keeps every commentary whose verse text is unchanged (3,725) and the 218 verses whose text was restored or replaced received new commentary on 2026-09-21 (`treatments/`). To regenerate those with the book's Grok pipeline instead: `grok login --device-code`, then `BPHS_PIPELINE_DIR=<the pipeline directory> python3 scripts/library/bphs_fill_pending.py --grok` (it writes into `treatments/`), then `--inject`.

## Sources and terms

- **Sanskrit Wikisource** (sa.wikisource.org, *बृहत्पाराशरहोराशास्त्रम्*, wikitext fetched 2026-08-11): `wikisource.json` (97 chapters, 3,943 verses) and the 3,675 verses that `canon.json` and the edition take from it. Any copyrightable contribution of Wikisource's editors in this text is licensed under CC BY-SA 4.0 (https://creativecommons.org/licenses/by-sa/4.0/). Changes made: `<ref>` notes and URLs stripped, chapter-title lines removed from the verse sequence, and the result merged with a second witness (sanskritdocuments.org, chapter by chapter, `canon.json`). The repository's all-rights-reserved notice (LICENSE) does not reach this text.
- **sanskritdocuments.org** (`doc_z_misc_sociology_astrology/par0110 … par9197`, fetched 2026-09-21): `sanskritdocuments.json` is the site's full transcription (97 chapters, 3,932 verses), kept here in full as the second witness; the edition prints 268 verses of 7 chapters (16, 18, 20, 22, 23, 25, 35) from it. It is redistributed under the terms as stated by the source; this repository records them only as "free for non-commercial use per the site's terms" (table above).
