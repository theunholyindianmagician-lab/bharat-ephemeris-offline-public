'use strict';
/* csp.test.cjs — every product page carries a Content-Security-Policy and runs under it with no violation and no page
 * error (council R-08). The pages that read the owner's files (vedha.html) and the public sovereign pañcāṅga run under the
 * strict policy: no inline script at all. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '..');
const STRICT = ['vedha.html', 'siddhanta-panchanga.html'];
const PAGES = ['index.html', 'panchang.html', 'siddhanta-panchanga.html', 'museum.html', 'library.html', 'shunyabheda.html', 'shoonya_sovereign_dashboard.html', 'vedha.html',
  ...fs.readdirSync(path.join(__dirname, '..', 'editions')).filter((f) => f.endsWith('.html')).sort().map((f) => `editions/${f}`)];
(async () => {
  for (const p of PAGES) {
    const html = fs.readFileSync(path.join(root, p), 'utf8');
    const m = html.match(/<meta http-equiv="Content-Security-Policy" content="([^"]+)">/);
    assert.ok(m, `${p} has a CSP`);
    assert.match(m[1], /object-src 'none'/); assert.match(m[1], /base-uri 'none'/);
    if (STRICT.includes(p)) {
      assert.match(m[1], /script-src 'self';/, `${p}: script-src 'self' only`);
      assert.equal(/<script>(?!\s*<\/script>)/.test(html) || /\son[a-z]+\s*=/.test(html.replace(/<script[\s\S]*?<\/script>/g, '')), false, `${p}: no inline script or handler`);
    }
  }
  console.log(`PASS ${PAGES.length} pages carry a CSP; the strict ones have no inline script`);
  const server = http.createServer((req, res) => {
    const file = path.resolve(root, '.' + decodeURIComponent(new URL(req.url, 'http://localhost').pathname));
    if (!file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
    const type = { '.js': 'text/javascript', '.css': 'text/css', '.html': 'text/html; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.webmanifest': 'application/manifest+json' }[path.extname(file)];
    fs.readFile(file, (error, data) => { if (error) res.writeHead(404).end(); else { res.setHeader('Content-Type', type || 'application/octet-stream'); res.end(data); } });
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  let browser;
  try {
    browser = await chromium.launch({ headless: true, executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || undefined });
    const base = `http://127.0.0.1:${server.address().port}`;
    for (const p of PAGES) {
      const context = await browser.newContext(), page = await context.newPage(), errors = [];
      page.on('pageerror', (e) => errors.push(e.message));
      await page.addInitScript(() => { window.__csp = []; document.addEventListener('securitypolicyviolation', (e) => window.__csp.push(`${e.violatedDirective} ${e.blockedURI}`)); });
      await page.route('**/*', (route) => (new URL(route.request().url()).hostname === '127.0.0.1' ? route.continue() : route.abort()));
      await page.goto(`${base}/${p}`, { waitUntil: 'load', timeout: 120000 });
      if (p === 'vedha.html') await page.waitForFunction(() => document.body.dataset.ready === '1', null, { timeout: 120000 });
      await page.waitForTimeout(2500);
      const v = await page.evaluate(() => window.__csp);
      assert.deepEqual(v, [], `${p}: CSP violations`);
      assert.deepEqual(errors, [], `${p}: page errors`);
      await context.close();
    }
    console.log(`PASS every page runs under its policy: no violation, no page error`);
  } finally {
    if (browser) await browser.close();
    server.close();
  }
})().catch((e) => { console.error(e); process.exit(1); });
