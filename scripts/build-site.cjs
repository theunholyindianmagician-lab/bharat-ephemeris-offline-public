#!/usr/bin/env node
/* scripts/build-site.cjs — the publish step: copy only what the public site needs into _site/.
 *
 * Serving the repository root as-is would publish .git/, the internal reports, the AI archive, the sales playbooks,
 * the Python injectors and node_modules (council S-02). The site is instead the union of:
 *   - the product pages (PAGES) and every local file they reference by src= or href=;
 *   - every URL in sw.js's precache lists (CORE, DOWNLOADS, EDITIONS), which must therefore all exist;
 *   - the editions, the downloads and the share images, and the licence notices of the vendored code (EXTRA).
 * Anything matching DENY is refused, so a slip in a list fails the build instead of publishing an internal file.
 *
 *   node scripts/build-site.cjs            build _site/ (replaced)
 *   node scripts/build-site.cjs --check    verify only, copy nothing
 *   node scripts/build-site.cjs --out DIR  build into DIR
 * Exit 1 with the reasons on any missing or denied file.
 */
'use strict';
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const PAGES = ['index.html', 'panchang.html', 'siddhanta-panchanga.html', 'museum.html', 'library.html', 'shunyabheda.html',
  'shoonya_sovereign_dashboard.html', 'vedha.html'];
const DIRS = ['editions', 'downloads', 'og'];
const EXTRA = ['sw.js', 'manifest.webmanifest', 'icon.svg', 'LICENSE', 'vsop87-full-LICENSE.txt', 'elp-moon-LICENSE.txt'];
const DENY = [/^\./, /(^|\/)\.git(\/|$)/, /^AI_Archive/, /^gtm\//, /^node_modules\//, /^scripts\//, /^test-fixtures\//, /^\.claude\//,
  /\.py$/, /\.patch$/, /\.zip$/, /\.test\.(?:js|cjs|mjs)$/, /\.(?:cpp|sh|command)$/, /^[^/]+\.md$/, /\.pdf$/, /(^|\/)serve\.py$/];

function localRefs(html) {
  const out = new Set();
  for (const m of html.matchAll(/\b(?:src|href)\s*=\s*"([^"]+)"/g)) {
    let u = m[1].trim();
    if (!u || /^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(u) || /\$\{/.test(u)) continue;   // http:, mailto:, data:, //host, #anchor, a template
    u = u.replace(/[?#].*$/, '').replace(/^\.\//, '').replace(/^\//, '');
    if (u) out.add(decodeURI(u));
  }
  return out;
}
function precacheList() {
  const sw = fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8'), out = new Set();
  for (const name of ['CORE', 'DOWNLOADS', 'EDITIONS']) {
    const m = sw.match(new RegExp(`const ${name} = \\[([\\s\\S]*?)\\];`));
    if (!m) continue;
    for (const s of m[1].matchAll(/"([^"]+)"/g)) { const u = s[1].replace(/^\.\//, ''); if (u && u !== '/') out.add(u); }
  }
  return out;
}

function plan() {
  const files = new Set([...PAGES, ...EXTRA]), problems = [];
  for (const p of PAGES) {
    if (!fs.existsSync(path.join(ROOT, p))) { problems.push(`missing page ${p}`); continue; }
    for (const r of localRefs(fs.readFileSync(path.join(ROOT, p), 'utf8'))) files.add(r);
  }
  for (const u of precacheList()) files.add(u);
  for (const d of DIRS) for (const f of fs.readdirSync(path.join(ROOT, d))) {
    const rel = `${d}/${f}`;
    if (fs.statSync(path.join(ROOT, rel)).isFile() && !DENY.some((re) => re.test(rel))) files.add(rel);
  }
  for (const f of [...files]) if (f.endsWith('/') || f === '') files.delete(f);
  // the editions link to each other and to pages; their references must resolve too
  for (const f of [...files]) if (/^editions\/.+\.html$/.test(f) && fs.existsSync(path.join(ROOT, f)))
    for (const r of localRefs(fs.readFileSync(path.join(ROOT, f), 'utf8'))) files.add(path.posix.normalize(path.posix.join('editions', r)));
  for (const f of files) {
    if (DENY.some((re) => re.test(f))) problems.push(`denied: ${f}`);
    else if (!fs.existsSync(path.join(ROOT, f)) || !fs.statSync(path.join(ROOT, f)).isFile()) problems.push(`missing: ${f}`);
  }
  return { files: [...files].sort(), problems };
}

if (require.main === module) {
  const args = process.argv.slice(2), check = args.includes('--check');
  const out = args.includes('--out') ? path.resolve(args[args.indexOf('--out') + 1]) : path.join(ROOT, '_site');
  const { files, problems } = plan();
  if (problems.length) { console.error(problems.join('\n')); console.error(`build-site: ${problems.length} problem(s); nothing published`); process.exit(1); }
  if (!check) {
    fs.rmSync(out, { recursive: true, force: true });
    for (const f of files) { fs.mkdirSync(path.dirname(path.join(out, f)), { recursive: true }); fs.copyFileSync(path.join(ROOT, f), path.join(out, f)); }
  }
  const bytes = files.reduce((n, f) => n + fs.statSync(path.join(ROOT, f)).size, 0);
  console.log(`build-site: ${files.length} files, ${(bytes / 1048576).toFixed(1)} MB${check ? ' (checked; nothing copied)' : ` → ${path.relative(ROOT, out) || out}`}`);
}
module.exports = { plan, localRefs, precacheList, PAGES, DENY };
