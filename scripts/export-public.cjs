#!/usr/bin/env node
/* scripts/export-public.cjs — the files of the public repository, as one fresh snapshot with no history.
 *
 * The public repository receives the files as a single commit with no history, so material that stays private
 * cannot reach the public through it.
 *
 * The snapshot is every tracked file except DENY, written to _public/ (ignored by git). Every text file is then scanned
 * for private or home-relative paths, e-mail addresses other than the product's public contact, token-shaped strings
 * and working-note phrases; REWRITE turns container paths under /home/user into readable '<repo>/<path>' references,
 * and any other hit stops the export with the file and line.
 *
 *   node scripts/export-public.cjs            write _public/ (replaced)
 *   node scripts/export-public.cjs --check    scan only
 */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const ROOT = path.join(__dirname, '..');
const KEEP_MD = new Set(['README.md', 'RELEASE-VERIFICATION.md', 'VEDHA-YANTRA-DESIGN-2026-10-07.md', 'MATHEMATICAL-AUDIT.md']);
const DENY = [
  /^AI_Archive/,                       // material that stays private
  /^gtm\//,                            // material that stays private
  /^\.claude\//, /^node_modules\//,
  /^scripts\/apex-audit\//,            // material that stays private
  /^[^/]+\.py$/,                       // material that stays private; serve.py is allowed below
  /^[^/]+\.md$/,                       // material that stays private; KEEP_MD are allowed below
  /^release-verification-report\.json$/, // generated locally (see RELEASE-VERIFICATION.md); not published
  /\.patch$/, /\.zip$/, /\.pdf$/,
  /^test_astro\.html$/,
];
const ALLOW = (f) => f === 'serve.py' || KEEP_MD.has(f);
// a container path under /home/user becomes '<repo>/<path>', a readable reference
const REWRITE = [[/\/home\/user\/([A-Za-z0-9][A-Za-z0-9_-]*)\//g, '$1/']];
// the product's public contact, and the address inside astronomy-engine's MIT notice (attribution the licence requires)
const PUBLIC_EMAILS = new Set(['api@bharatephemeris.com', 'noreply@anthropic.com', 'cosinekitty@gmail.com']);
const SCANS = [
  ['a private path', /\/Users\/[A-Za-z]|\/home\/[a-z]+\//],
  ['an e-mail address', /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g],
  ['a token-shaped string', /\b(?:ghp_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|sk-[A-Za-z0-9]{20,}|AKIA[0-9A-Z]{16}|rzp_(?:live|test)_[A-Za-z0-9]{8,}|xox[bap]-[A-Za-z0-9-]{10,})|-----BEGIN [A-Z ]*PRIVATE KEY-----/],
  ['a Claude session link', /claude\.ai\/code\/session_/],
  // ~/ followed by a letter or a dot: a path into someone's home directory
  ['a home-relative path', /(?<![\w~\/.-])~\/[A-Za-z.]/],
  // AI working notes and agent-report phrases; each phrase is written so that this line does not match itself
  ['a working-note phrase', /let me (?:redo|recompute|output)|i need to clean[ ]up|task complete\.|batch[ ]complete:|rendered[ ]per style-prompt|CLAUDE\.md|OPERATORS[-]BOOTED|CLAUDE[-]VRAT/i],
];
const TEXT = /\.(?:js|cjs|mjs|json|html|css|md|txt|svg|webmanifest|ipynb|py|cpp|yml|yaml)$|^LICENSE$|^\.gitignore$/;

function files() {
  return execFileSync('git', ['ls-files', '-z'], { cwd: ROOT }).toString('utf8').split('\0').filter(Boolean)
    .filter((f) => ALLOW(f) || !DENY.some((re) => re.test(f)))
    .filter((f) => fs.existsSync(path.join(ROOT, f)));
}
function scan(f, text) {
  const hits = [];
  text.split('\n').forEach((line, i) => {
    for (const [what, re] of SCANS) {
      if (what === 'an e-mail address') { for (const m of line.matchAll(re)) if (!PUBLIC_EMAILS.has(m[0].toLowerCase()) && !/\.(?:png|svg|js|css|json)$/i.test(m[0])) hits.push(`${f}:${i + 1}: ${what} (${m[0]})`); }
      else if (re.test(line)) hits.push(`${f}:${i + 1}: ${what}`);
    }
  });
  return hits;
}

if (require.main === module) {
  const check = process.argv.includes('--check'), out = path.join(ROOT, '_public');
  const list = files(), problems = [];
  if (!check) fs.rmSync(out, { recursive: true, force: true });
  let bytes = 0;
  for (const f of list) {
    const src = path.join(ROOT, f);
    let buf = fs.readFileSync(src);
    if (TEXT.test(path.basename(f)) || TEXT.test(f)) {
      let text = buf.toString('utf8');
      for (const [re, to] of REWRITE) text = text.replace(re, to);
      problems.push(...scan(f, text));
      buf = Buffer.from(text, 'utf8');
    }
    bytes += buf.length;
    if (!check) { fs.mkdirSync(path.dirname(path.join(out, f)), { recursive: true }); fs.writeFileSync(path.join(out, f), buf); }
  }
  if (problems.length) {
    console.error(problems.join('\n'));
    console.error(`export-public: ${problems.length} finding(s); ${check ? 'nothing written' : '_public/ is not safe to publish'}`);
    if (!check) fs.rmSync(out, { recursive: true, force: true });
    process.exit(1);
  }
  console.log(`export-public: ${list.length} files, ${(bytes / 1048576).toFixed(1)} MB${check ? ' (scanned; nothing written)' : ' → _public/'}; no private path, e-mail or token found`);
}
module.exports = { files, scan, DENY, KEEP_MD };
