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

const out = fs.mkdtempSync(path.join(os.tmpdir(), 'site-'));
execFileSync(process.execPath, [path.join(__dirname, 'build-site.cjs'), '--out', out], { stdio: 'pipe' });
for (const p of B.PAGES) {
  assert.ok(fs.existsSync(path.join(out, p)), p);
  for (const r of B.localRefs(fs.readFileSync(path.join(out, p), 'utf8'))) assert.ok(fs.existsSync(path.join(out, r)), `${p} → ${r}`);
}
assert.equal(fs.existsSync(path.join(out, '.git')) || fs.existsSync(path.join(out, 'AI_Archive_2026_09_16')) || fs.existsSync(path.join(out, 'gtm')), false);
fs.rmSync(out, { recursive: true, force: true });
console.log('PASS the built site resolves every page reference and holds no internal folder');
