'use strict';
/* build-site.test.cjs — the publish set (scripts/build-site.cjs): every page and every precached URL is in it and exists,
 * and nothing internal is (council S-02). */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const B = require('./build-site.cjs');

const { files, problems } = B.plan();
assert.deepEqual(problems, []);
for (const p of B.PAGES) assert.ok(files.includes(p), p);
for (const u of B.precacheList()) assert.ok(files.includes(u), `precached ${u}`);
for (const f of files) assert.equal(/^(?:\.|AI_Archive|gtm\/|node_modules\/|scripts\/)|\.py$|\.patch$|\.zip$|\.pdf$|^[^/]+\.md$/.test(f), false, `internal file ${f}`);
for (const re of B.DENY) assert.equal(files.some((f) => re.test(f)), false, String(re));
console.log(`PASS the publish set: ${files.length} files, every page and precached URL present, nothing internal`);

// The three tiers (2026-10-08): what the pages now load is published; the internal paramparā sources are not.
for (const f of ['parampara.js', 'parampara-record.js', 'ss-tier.js', 'ss-graha.js', 'ss-ahargana.js', 'siddhanta-drik.js', 'siddhanta-tier.js', 'drik-grahana.js',
  'corpus/parampara/registry.json', 'corpus/parampara/samskara.json']) assert.ok(files.includes(f), `published: ${f}`);
for (const f of ['corpus/parampara/README.md', 'corpus/parampara/etext-lines.json', 'corpus/parampara/graha.json', 'scripts/legacy-tier-ui.test.cjs', 'legacy-honesty.test.js',
  'test_astro.html']) assert.equal(files.includes(f), false, `not published: ${f}`);
assert.equal(files.some((f) => /\.md$/.test(f) && !/^downloads\/[^/]+_Sovereign_Dossier\.md$/.test(f)), false, 'no Markdown but the library\'s downloadable dossiers');
console.log('PASS the tier modules and the paramparā record are published; the paramparā sources and the tests are not');

const out = fs.mkdtempSync(path.join(os.tmpdir(), 'site-'));
execFileSync(process.execPath, [path.join(__dirname, 'build-site.cjs'), '--out', out], { stdio: 'pipe' });
for (const p of B.PAGES) {
  assert.ok(fs.existsSync(path.join(out, p)), p);
  for (const r of B.localRefs(fs.readFileSync(path.join(out, p), 'utf8'))) assert.ok(fs.existsSync(path.join(out, r)), `${p} → ${r}`);
}
assert.equal(fs.existsSync(path.join(out, '.git')) || fs.existsSync(path.join(out, 'AI_Archive_2026_09_16')) || fs.existsSync(path.join(out, 'gtm')), false);
fs.rmSync(out, { recursive: true, force: true });
console.log('PASS the built site resolves every page reference and holds no internal folder');
