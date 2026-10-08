'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { chromium } = require('playwright');
const M = require('../math-core.js');
const root = path.resolve(__dirname, '..');
(async () => {
  const server = http.createServer((req, res) => {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const file = path.resolve(root, '.' + pathname);
    if (!file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
    const type = { '.js': 'text/javascript', '.css': 'text/css', '.html': 'text/html', '.json': 'application/json' }[path.extname(file)];
    fs.readFile(file, (error, data) => { if (error) res.writeHead(404).end(); else { res.setHeader('Content-Type', type || 'application/octet-stream'); res.end(data); } });
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  let browser;
  try {
    browser = await chromium.launch({ headless: true, executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || undefined });
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    // Prove the served application works without external network resources.
    await page.route('**/*', route => new URL(route.request().url()).hostname === '127.0.0.1' ? route.continue() : route.abort());
    const base = `http://127.0.0.1:${server.address().port}`;
    await page.goto(base + '/shunyabheda.html?date=2026-09-07&time=12:00:00&timezone=2&latitude=42.62&longitude=25.39&engineMode=classical');
    await page.waitForFunction(() => document.querySelector('#status').textContent.includes('COMPUTATION COMPLETE'));
    assert.equal(await page.locator('#date').inputValue(), '2026-09-07');
    assert.equal(await page.locator('#timezone').inputValue(), '2');
    assert.deepEqual(await page.locator('#engine-mode option').evaluateAll(xs => xs.map(x => x.value)), ['classical', 'calibrated']);
    const jd = M.gregorianToJulianDay('2026-09-07', '12:00:00', 2);
    const table = {};
    for (const mode of ['classical', 'calibrated']) {
      await page.locator('#engine-mode').selectOption(mode);
      await page.locator('#compute').click();
      assert.match(await page.locator('#status').textContent(), /COMPUTATION COMPLETE/);
      await page.locator('#apiMethod').selectOption('sphuta');
      await page.locator('#btnRunLiveApi').click();
      const payload = JSON.parse(await page.locator('#apiResponseViewer').textContent());
      assert.equal(payload.engine_mode, mode);
      for (const g of M.canonicalGrahaModel(jd, { mode })) assert.equal(payload.sphuta[g.en].canonical_deg, Number(g.longitude.toFixed(6)));
      for (const g of M.computePlanetaryVelocities(jd, { mode })) assert.equal(payload.sphuta[g.en].speed_deg_day, Number(g.speedDegDay.toFixed(6)));
      table[mode] = await page.locator('#planet-body').textContent();
      await page.locator('#apiMethod').selectOption('panchang');
      const panPayload = JSON.parse(await page.locator('#apiResponseViewer').textContent());
      const pan = M.panchangAtJd(jd, 2, mode);
      assert.equal(panPayload.engine_mode, mode);
      assert.equal(panPayload.pancha_anga.tithi.index, pan.tithiIndex + 1);
      assert.equal(panPayload.pancha_anga.nakshatra.index, pan.nakshatraIndex + 1);
      assert.equal(panPayload.pancha_anga.yoga.index, pan.yogaIndex + 1);
      console.log(`PASS ${mode}: real planet table, API longitudes/speeds and Panchanga`);
    }
    assert.notEqual(table.classical, table.calibrated);
    // The URL no longer supplies values: all controls must come from persisted state.
    await page.goto(base + '/shunyabheda.html');
    await page.waitForFunction(() => document.querySelector('#status').textContent.includes('COMPUTATION COMPLETE'));
    assert.equal(await page.locator('#engine-mode').inputValue(), 'calibrated');
    assert.equal(await page.locator('#timezone').inputValue(), '2');
    assert.equal(await page.locator('#date').inputValue(), '2026-09-07');
    console.log('PASS persisted mode, date and timezone survive reload');
    await page.goto(base + '/shunyabheda.html?engineMode=not-a-mode');
    assert.match(await page.locator('#status').textContent(), /ERROR/);
    console.log('PASS invalid mode is reported instead of falling back');
    assert.deepEqual(errors, []);
    console.log('PASS no browser exceptions with external requests blocked');
  } finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
