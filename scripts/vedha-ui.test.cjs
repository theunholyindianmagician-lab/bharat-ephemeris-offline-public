'use strict';
// vedha.html, the observation companion: served from this checkout with every outside request blocked, it plans a day at
// a place, starts a ledger, writes the day's predictions first, records a noon shadow and a star transit against them,
// reduces the ledger, exports it, and keeps it across a reload. The ledger it writes is certified by vedha-lekha.js.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { chromium } = require('playwright');
const V = require('../vedha-lekha.js');
const K = require('../kala-dvara.js');
const root = path.resolve(__dirname, '..');
(async () => {
  const server = http.createServer((req, res) => {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const file = path.resolve(root, '.' + pathname);
    if (!file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
    const type = { '.js': 'text/javascript', '.css': 'text/css', '.html': 'text/html', '.json': 'application/json', '.svg': 'image/svg+xml' }[path.extname(file)];
    fs.readFile(file, (error, data) => { if (error) res.writeHead(404).end(); else { res.setHeader('Content-Type', type || 'application/octet-stream'); res.end(data); } });
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  let browser;
  try {
    browser = await chromium.launch({ headless: true, executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || undefined });
    const context = await browser.newContext({ acceptDownloads: true });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.route('**/*', (route) => (new URL(route.request().url()).hostname === '127.0.0.1' ? route.continue() : route.abort()));
    const base = `http://127.0.0.1:${server.address().port}`;
    await page.goto(base + '/vedha.html');
    await page.waitForFunction(() => document.body.dataset.ready === '1', null, { timeout: 120000 });
    console.log('PASS loads offline with the sovereign modules and the star catalogue');

    // a day ahead, so that its predictions can be written before it
    const d = new Date(); d.setDate(d.getDate() + 1);
    const tomorrow = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    await page.fill('#site-name', 'Ujjayinī test'); await page.fill('#site-lat', '23.18'); await page.fill('#site-desh', '0');
    await page.click('#btn-plan');
    await page.fill('#day', tomorrow); await page.click('#btn-predict');
    const pred = await page.locator('#pred').textContent();
    assert.match(pred, /Noon shadow/); assert.match(pred, /घ/);
    assert.match(await page.locator('#ecl').textContent(), /contact|no eclipse/);
    // the conjunction evening and the first crescent evenings by the text (2026-10-10 to 10-12 at this place)
    for (const [day, re] of [['2026-10-10', /not yet past the Sun|not seen/], ['2026-10-11', /not seen/], ['2026-10-12', /the text says seen/]]) {
      await page.fill('#day', day); await page.click('#btn-predict');
      assert.match(await page.locator('#pred').textContent(), re, day);
    }
    await page.fill('#day', tomorrow); await page.click('#btn-predict');
    console.log('PASS predicts the noon shadow, tonight\'s meridian stars, the crescent evenings and the year\'s eclipses');

    await page.click('#btn-start');
    assert.match(await page.locator('#chain').textContent(), /0 entries · chain whole/);
    await page.click('#btn-seal');
    assert.match(await page.locator('#msg').textContent(), /written into the ledger before the night/);
    const nPred = await page.evaluate(() => JSON.parse(localStorage.getItem('bharat.vedha-lekha/1')).entries.length);
    assert.ok(nPred >= 1);
    console.log(`PASS writes ${nPred} predictions first`);

    // a noon shadow today, citing nothing; a star transit today
    await page.selectOption('#rec-kind', 'madhyahna');
    await page.fill('[data-f="ca"]', '7'); await page.fill('[data-f="cv"]', '12'); await page.selectOption('[data-f="dir"]', 'N');
    await page.click('#btn-record');
    assert.match(await page.locator('#msg').textContent(), /Written: madhyahna-/);
    await page.selectOption('#rec-kind', 'yamyottara');
    await page.fill('[data-f="kg"]', '40'); await page.fill('[data-f="kv"]', '5'); await page.fill('[data-f="ua"]', '60');
    await page.click('#btn-record');
    assert.match(await page.locator('#msg').textContent(), /Written: yamyottara-/);
    // a modern clock in a note is refused, and nothing is written
    await page.selectOption('#rec-kind', 'candra-darshana');
    await page.fill('#rec-note', 'seen at 18:45 IST');
    await page.click('#btn-record');
    assert.match(await page.locator('#msg').textContent(), /vedha-lekha/);
    await page.fill('#rec-note', '');
    await page.click('#btn-reduce');
    assert.match(await page.locator('#antara').textContent(), /observed − the text/);
    console.log('PASS records, refuses a modern clock in a note, and gives the antara');

    // the ledger kept on the device is the one vedha-lekha.js certifies
    const kept = await page.evaluate(() => localStorage.getItem('bharat.vedha-lekha/1'));
    const L = V.fromJSON(kept);
    assert.equal(L.entries.length, nPred + 2);
    const cert = V.certify(L);
    assert.ok(cert.ok, JSON.stringify(cert.reasons));
    assert.equal(L.site.name, 'Ujjayinī test');
    assert.ok(L.entries.every((e) => e.at === K.kaliDayFromCivil({ calendar: 'gregorian', year: new Date().getFullYear(), month: new Date().getMonth() + 1, day: new Date().getDate() })));
    const [download] = await Promise.all([page.waitForEvent('download'), page.click('#btn-export')]);
    const file = await download.path();
    assert.equal(fs.readFileSync(file, 'utf8'), kept);
    console.log('PASS the kept and exported ledger is certified by vedha-lekha.js, byte for byte the same');

    await page.reload();
    await page.waitForFunction(() => document.body.dataset.ready === '1', null, { timeout: 120000 });
    assert.match(await page.locator('#chain').textContent(), new RegExp(`${nPred + 2} entries · chain whole`));
    assert.equal(await page.locator('#site-lat').isDisabled(), true, 'the ledger keeps its place');
    console.log('PASS the ledger survives a reload; its place is locked');

    // a crafted ledger whose chain is whole but whose fields carry markup is refused, and no script runs (council R-01)
    const os = require('os');
    const crafted = { format: 'vedha-lekha/1', site: { name: 'PoC', latitude: 28.6, deshantara: 0 }, shanku: '12<img src=x onerror="window.__xss=1">', entries: [] };
    assert.equal(V.verify(crafted).ok, true, 'the chain alone would pass it');
    const craftedFile = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'vedha-')), 'crafted.json');
    fs.writeFileSync(craftedFile, JSON.stringify(crafted));
    await page.setInputFiles('#file-import', craftedFile);
    await page.waitForFunction(() => /refused/.test(document.getElementById('msg').textContent), null, { timeout: 20000 });
    await page.click('#btn-predict');
    await page.reload();
    await page.waitForFunction(() => document.body.dataset.ready === '1', null, { timeout: 120000 });
    assert.equal(await page.evaluate(() => window.__xss), undefined);
    assert.match(await page.locator('#chain').textContent(), new RegExp(`${nPred + 2} entries · chain whole`), 'the kept ledger is untouched');
    console.log('PASS a crafted ledger is refused by the certifier and runs no script');

    // the instruments (yantra.js): tick the samrāṭ and the jaya prakāśa, predict today at 10 ghaṭī from sunrise, and write
    // both readings into the ledger as the page shows them — SYNTHETIC: they are the text's own prediction, read back
    const now = new Date(), todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    await page.check('#yantra-pick input[data-yantra="samrat"]');
    await page.check('#yantra-pick input[data-yantra="jaya-prakasha"]');
    await page.fill('#yantra-kg', '10'); await page.fill('#yantra-kv', '0');
    await page.fill('#day', todayStr); await page.click('#btn-predict');
    const preds = await page.$$eval('#pred-yantra tr[data-reading]', (rows) => rows.map((r) => ({ key: r.dataset.yantra, reading: JSON.parse(r.dataset.reading), kapala: r.dataset.kapala ? JSON.parse(r.dataset.kapala) : null, text: r.textContent })));
    assert.deepEqual(preds.map((p) => p.key).sort(), ['jaya-prakasha', 'samrat']);
    assert.match(preds.find((p) => p.key === 'samrat').text, /सम्राट् यन्त्र · samrāṭ yantra.*nata .* घ .* वि .* प्रा .*krānti/);
    const arcIn = async (name, a) => { await page.fill(`[data-f="${name}-a"]`, String(a.amsha)); await page.fill(`[data-f="${name}-k"]`, String(a.kala)); await page.fill(`[data-f="${name}-v"]`, String(a.vikala)); };
    for (const key of ['samrat', 'jaya-prakasha']) {
      const p = preds.find((x) => x.key === key), rd = p.reading;
      await page.selectOption('#rec-kind', 'yantra');
      await page.fill('#rec-day', todayStr);
      await page.selectOption('[data-f="yantra"]', key);
      await page.selectOption('[data-f="body"]', 'surya');
      await page.fill('[data-f="nata-g"]', String(rd.nata.ghati)); await page.fill('[data-f="nata-v"]', String(rd.nata.vinadi)); await page.fill('[data-f="nata-p"]', String(rd.nata.prana));
      await page.selectOption('[data-f="side"]', rd.side);
      await arcIn('kranti', rd.kranti); await page.selectOption('[data-f="gola"]', rd.gola);
      if (rd.unnata) { await arcIn('unnata', rd.unnata); await arcIn('digamsha', rd.digamsha); }
      await page.fill('[data-f="kg"]', String(p.kapala.ghati)); await page.fill('[data-f="kv"]', String(p.kapala.vinadi)); await page.fill('[data-f="kp"]', String(p.kapala.prana));
      await page.click('#btn-record');
      assert.match(await page.locator('#msg').textContent(), /Written: yantra-/, key);
    }
    const keptY = V.fromJSON(await page.evaluate(() => localStorage.getItem('bharat.vedha-lekha/1')));
    assert.equal(keptY.entries.length, nPred + 4);
    const certY = V.certify(keptY);
    assert.ok(certY.ok, JSON.stringify(certY.reasons));
    const redY = V.reduce(keptY);
    const yRecs = redY.records.filter((r) => r.kind === 'yantra');
    assert.deepEqual(yRecs.map((r) => r.yantra).sort(), ['jaya-prakasha', 'samrat']);
    for (const r of yRecs) {
      assert.match(r.instant.from, /bowl/);
      // read to the tenth of a prāṇa and the vikalā, as the page shows them: the antara is that rounding and nothing else
      assert.ok(Math.abs(r.antara.natAsus) <= 0.06 && Math.abs(r.antara.krantiArcmin) <= 0.01, `${r.yantra}: ${JSON.stringify(r.antara)}`);
      for (const k of ['unnataArcmin', 'digamshaArcmin']) if (r.antara[k] !== undefined) assert.ok(Math.abs(r.antara[k]) <= 0.01, `${r.yantra}.${k}: ${r.antara[k]}`);
    }
    assert.ok(yRecs.find((r) => r.yantra === 'jaya-prakasha').antara.unnataArcmin !== undefined, 'the jaya prakāśa reads the altitude and azimuth too');
    await page.click('#btn-reduce');
    assert.match(await page.locator('#antara').textContent(), /yantra · सम्राट् यन्त्र · samrāṭ yantra.*nata [+-]0\.\d asus/);
    // a half-read pair is refused by yantra.js before the ledger sees it, and nothing is written
    await page.selectOption('#rec-kind', 'yantra');
    await page.selectOption('[data-f="yantra"]', 'samrat');
    await page.fill('[data-f="kranti-a"]', '5');
    await page.click('#btn-record');
    assert.match(await page.locator('#msg').textContent(), /yantra: a samrat reading needs nata and side/);
    assert.equal(V.fromJSON(await page.evaluate(() => localStorage.getItem('bharat.vedha-lekha/1'))).entries.length, nPred + 4);
    console.log('PASS records a samrāṭ and a jaya prakāśa reading from the predicted values; certified; antara ≈ 0 ['
      + yRecs.map((r) => `${r.yantra}: ${Object.entries(r.antara).filter(([, v]) => typeof v === 'number').map(([k, v]) => `${k} ${v.toFixed(4)}`).join(', ')}`).join('; ') + ']');
    assert.deepEqual(errors, []);
    console.log('PASS no page errors with every outside request blocked');
  } finally {
    if (browser) await browser.close();
    server.close();
  }
})().catch((e) => { console.error(e); process.exit(1); });
