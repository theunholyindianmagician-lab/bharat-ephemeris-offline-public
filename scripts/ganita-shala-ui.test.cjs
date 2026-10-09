'use strict';
// ganita-shala.html, the research page (2026-10-09): served from this checkout with every request outside the local server
// blocked and counted as a failure. Checked: the loading contract and the strict CSP (no inline script, no foreign theory,
// no outside URL); the four choices against the sky at one instant, each row re-computed here in node through the same
// tier API (M.tierGrahaRows, M.tierAyanamsha, M.sayanaAscendantDeg) to 0.1′; the identity sidereal + ayanāṃśa = tropical
// in the 101′ table; the reasons built from M.TIERS (the two year lengths named); the paramparā table rendering every row
// of corpus/research/parampara-apply.json; the ledger rendering every entry of corpus/research/derivations.json; the dṛk
// refusal for 1800; the nav on every page; sw.js precache; 390 px without horizontal overflow.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { chromium } = require('playwright');
const M = require('../math-core.js');
const root = path.resolve(__dirname, '..');
const wrap = (d) => ((d % 360) + 540) % 360 - 180;
const UJJAIN = { lat: 23.1765, lon: 75.7885 };
const num = (s) => Number(String(s).replace('′', '').replace('°', '').replace('−', '-'));

(async () => {
  const html = fs.readFileSync(path.join(root, 'ganita-shala.html'), 'utf8');
  const js = fs.readFileSync(path.join(root, 'ganita-shala-page.js'), 'utf8');
  const sw = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
  const scripts = [...html.matchAll(/<script src="([^"]+)"/g)].map((m) => m[1]);
  const at = (f) => { const i = scripts.indexOf(f); assert.ok(i >= 0, `the page loads ${f}`); return i; };
  for (const f of ['katapayadi.js', 'kala-dvara.js', 'parahita-madhyama.js', 'sphuta.js', 'dhruva.js', 'ss-udaya.js', 'spanda-ganita.js', 'ss-graha.js', 'ss-chaya.js', 'ss-grahana.js',
    'ss-ahargana.js', 'panchanga.js', 'utsava.js', 'ss-drishya.js', 'dasha.js', 'muhurta.js', 'yantra.js', 'vedha-lekha.js', 'samskara.js', 'parampara.js']) assert.ok(at(f) < at('ss-tier.js'), `${f} before ss-tier.js`);
  assert.ok(at('ss-tier.js') < at('math-core.js') && at('math-core.js') < at('siddhanta-drik.js') && at('siddhanta-drik.js') < at('siddhanta-tier.js') && at('siddhanta-tier.js') < at('drik-grahana.js'), 'the loading contract');
  assert.equal(scripts[scripts.length - 1], 'ganita-shala-page.js');
  for (const f of ['vsop87-full.js', 'elp-moon.js', 'drik-engine.js', 'drik-tier.js', 'precision-ephemeris.js']) assert.ok(!scripts.includes(f), `no foreign theory on the page: ${f}`);
  assert.doesNotMatch(js, /\b(?:DrikTier|drigCoordinates|drigGeoJ2000|Astronomy\.|KaalPrecisionEphemeris|ShunyaVsop87|ShunyaElp|keralaDrikSphuta)\b/, 'the page script calls no foreign theory');
  for (const id of Object.keys(M.TIERS)) for (const k of ['engine', 'provenance']) assert.ok(!js.includes(M.TIERS[id][k]) && !html.includes(M.TIERS[id][k]), `the ${id} ${k} label is read from M.TIERS, not typed`);
  assert.ok(!js.includes(M.TIERS.drik.span.accuracyMeasured) && !html.includes(M.TIERS.drik.span.accuracyMeasured), 'the measured figure is M.TIERS.drik\'s, not typed');
  const csp = html.match(/<meta http-equiv="Content-Security-Policy" content="([^"]+)">/);
  assert.ok(csp, 'a CSP'); assert.match(csp[1], /default-src 'none'/); assert.match(csp[1], /script-src 'self';/); assert.match(csp[1], /connect-src 'self'/);
  assert.equal(/<script>(?!\s*<\/script>)/.test(html) || /<script(?![^>]*\bsrc=)[^>]*>/.test(html), false, 'no inline script');
  assert.doesNotMatch(html, /\son[a-z]+\s*=/i, 'no inline event handlers');
  assert.doesNotMatch(html.replace(/<meta (?:property="og:(?:url|image)"|name="twitter:image") content="https:\/\/offline\.bharatephemeris\.com\/[^"]*">/g, ''), /https?:\/\//, 'no outside URL in the page');
  assert.doesNotMatch(js, /https?:\/\//, 'no outside URL in the page script');
  for (const f of ['ganita-shala.html', 'ganita-shala-page.js', 'corpus/parampara/registry.json', 'corpus/parampara/samskara.json', 'corpus/research/parampara-apply.json', 'corpus/research/derivations.json', 'corpus/research/library-sweep.json', 'corpus/research/generator-2-search.json']) {
    assert.ok(sw.includes(`"./${f}"`), `sw.js precaches ${f}`);
    assert.ok(html.includes(`"${f}"`) || scripts.includes(f) || f.endsWith('.html'), `the page references ${f} (the build publishes what a page references)`);
  }
  for (const f of ['index.html', 'panchang.html', 'museum.html', 'library.html', 'shunyabheda.html', 'shoonya_sovereign_dashboard.html', 'siddhanta-panchanga.html', 'vedha.html', 'ganita-shala.html']) {
    const page = fs.readFileSync(path.join(root, f), 'utf8'), nav = page.slice(page.indexOf('class="bharat-nav"'), page.indexOf('</nav>', page.indexOf('class="bharat-nav"')));
    assert.match(nav, /href="ganita-shala\.html"[^>]*>गणित-शाला</, `${f}: the nav links the research page`);
  }
  assert.match(fs.readFileSync(path.join(root, 'scripts', 'build-site.cjs'), 'utf8'), /'ganita-shala\.html'/, 'build-site publishes the page');
  assert.match(fs.readFileSync(path.join(root, 'scripts', 'csp.test.cjs'), 'utf8'), /'ganita-shala\.html'/, 'csp.test checks the page');
  console.log('PASS the files: the loading contract, the strict CSP, no foreign theory, labels not typed, no outside URL, sw.js precache, the nav, the publish lists');

  const server = http.createServer((req, res) => {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const file = path.resolve(root, '.' + pathname);
    if (!file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
    const type = { '.js': 'text/javascript', '.css': 'text/css', '.html': 'text/html', '.json': 'application/json', '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json' }[path.extname(file)];
    fs.readFile(file, (error, data) => { if (error) res.writeHead(404).end(); else { res.setHeader('Content-Type', type || 'application/octet-stream'); res.end(data); } });
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const outside = [], errors = [];
  const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || undefined });
  const open = async (opts) => {
    const context = await browser.newContext({ serviceWorkers: 'block', ...opts });
    await context.route('**/*', (r) => { const u = new URL(r.request().url()); if (u.hostname === '127.0.0.1' && u.port === String(server.address().port)) return r.continue(); outside.push(u.href); return r.abort(); });
    const page = await context.newPage();
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
    await page.addInitScript(() => { document.addEventListener('securitypolicyviolation', (e) => { window.__csp = (window.__csp || []).concat(`${e.violatedDirective} ${e.blockedURI}`); }); });
    return { context, page };
  };
  const base = `http://127.0.0.1:${server.address().port}`;
  const ready = (page) => page.waitForFunction(() => document.body.dataset.ready === '1' && ['done', 'refused', 'error'].includes(document.body.dataset.sky), null, { timeout: 300000 });
  try {
    // ── the four choices against the sky at 2026-10-09 06:00 IST, each row re-computed here ──────────────────────────
    const { context, page } = await open({ viewport: { width: 1200, height: 900 } });
    await page.goto(`${base}/ganita-shala.html?date=2026-10-09&time=06:00&tz=5.5`); await ready(page);
    const jd = M.gregorianToJulianDay('2026-10-09', '06:00:00', 5.5);
    const ds = await page.evaluate(() => ({ ...document.body.dataset }));
    assert.equal(ds.parampara, 'ready'); assert.equal(ds.sky, 'done');
    const rows = await page.$$eval('#sky-table tbody tr', (trs) => trs.map((tr) => ({ tier: tr.dataset.tier, cells: [...tr.children].map((td) => td.textContent) })));
    const text = M.TIER_IDS.filter((id) => M.TIERS[id].family === 'ss');
    assert.deepEqual(rows.map((r) => r.tier), [...text, 'drik'], 'one row per text choice, then the sky');
    const skyRows = M.tierGrahaRows(jd, 'drik'), sky = { sun: skyRows.find((r) => r.key === 'surya').longitude, moon: skyRows.find((r) => r.key === 'candra').longitude, ayan: M.tierAyanamsha(jd, 'drik').deg, lagna: M.sayanaAscendantDeg(jd, UJJAIN.lat, UJJAIN.lon, 'drik') };
    for (const r of rows.slice(0, text.length)) {
      const t = M.tierGrahaRows(jd, r.tier), sun = t.find((x) => x.key === 'surya').longitude, moon = t.find((x) => x.key === 'candra').longitude, ay = M.tierAyanamsha(jd, r.tier).deg;
      const want = [(ay - sky.ayan) * 60, wrap(sun - sky.sun) * 60, wrap(sun + ay - sky.sun - sky.ayan) * 60, wrap(moon - sky.moon) * 60, wrap(moon + ay - sky.moon - sky.ayan) * 60,
        wrap((moon - sun) - (sky.moon - sky.sun)) * 60, wrap(M.sayanaAscendantDeg(jd, UJJAIN.lat, UJJAIN.lon, r.tier) - sky.lagna) * 60];
      assert.ok(r.cells[0].includes(M.TIERS[r.tier].labelSa) && r.cells[0].includes(M.TIERS[r.tier].label), r.cells[0]);
      assert.ok(Math.abs(num(r.cells[1]) - ay) < 1e-4, `${r.tier} ayanāṃśa ${r.cells[1]} vs ${ay}`);
      want.forEach((w, i) => assert.ok(Math.abs(num(r.cells[2 + i]) - w) <= 0.1, `${r.tier} column ${2 + i}: ${r.cells[2 + i]} vs ${w.toFixed(2)}`));
    }
    // the default's tropical Sun is nearer the sky than the plain text's by the ayanāṃśa record; the Kerala Sun is its own [measured today]
    const by = Object.fromEntries(rows.map((r) => [r.tier, r.cells.map(num)]));
    assert.ok(Math.abs(by['ss+parameshvara'][4]) < Math.abs(by.ss[4]), 'the default stands nearer the sky in the tropical frame than the plain text');
    assert.equal(by['ss+parameshvara'][3], by.ss[3], 'the Sun is the text\'s in both Sūrya-Siddhānta choices (sidereal column equal)');
    assert.notEqual(by.kerala[3], by.ss[3], 'the Kerala Sun differs from the text\'s');
    // the 101′ table: sidereal + (ayanāṃśa − Citrā-pakṣa) = tropical, per row (to the rounding)
    const hisab = await page.$$eval('#hisab-table tbody tr', (trs) => trs.map((tr) => ({ tier: tr.dataset.tier, cells: [...tr.children].map((td) => td.textContent) })));
    assert.deepEqual(hisab.map((h) => h.tier), text);
    for (const h of hisab) assert.ok(Math.abs(num(h.cells[1]) + num(h.cells[2]) - num(h.cells[3])) <= 0.15, `${h.tier}: ${h.cells.slice(1).join(' ')}`);
    const why = await page.$$eval('#hisab-why li', (lis) => lis.map((li) => li.textContent));
    assert.ok(why.length >= 4);
    assert.ok(why[0].includes(M.TIERS.ss.dashaYear.days.toFixed(6)) && why[0].includes(String(M.TIERS.drik.dashaYear.days)), 'the two year lengths come from M.TIERS');
    assert.ok(why[1].includes(M.tierAyanamsha(jd, 'ss+parameshvara').rateRule.slice(0, 40)), 'the default\'s ayanāṃśa rule is the engine\'s');
    // section 5: the resolution the vargas demand — seven varga rows with the time a part is worth, twelve placement rows (4 choices × lagna, Sun, Moon)
    await page.waitForFunction(() => document.body.dataset.sukshma === 'done', null, { timeout: 120000 });
    const resRows = await page.$$eval('#sukshma-res tbody tr', (trs) => trs.map((tr) => ({ varga: tr.dataset.varga, cells: [...tr.children].map((td) => td.textContent) })));
    assert.deepEqual(resRows.map((r) => r.varga), ['D9', 'D12', 'D27', 'D30', 'D60', 'D144', 'D150']);
    const d60 = resRows.find((r) => r.varga === 'D60'), d150 = resRows.find((r) => r.varga === 'D150');
    assert.equal(d60.cells[1], '30′'); assert.equal(d150.cells[1], '12′');
    assert.ok(/^\d+ s$/.test(d60.cells[2]) && Number(d60.cells[2].replace(' s', '')) > 60 && Number(d60.cells[2].replace(' s', '')) < 200, `D-60 lagna seconds ${d60.cells[2]}`);
    assert.ok(/^\d+\.\d min$/.test(d60.cells[3]) && Math.abs(Number(d60.cells[3].replace(' min', '')) - 54.5) < 5, `D-60 Moon minutes ${d60.cells[3]}`);
    for (const id of [...text, 'drik']) assert.ok(d60.cells[5].includes(M.TIERS[id].labelSa), `parts spanned names ${id}`);
    const chartRows = await page.$$eval('#sukshma-chart tbody tr', (trs) => trs.map((tr) => ({ tier: tr.dataset.tier, body: tr.dataset.body, decided: [...tr.children].slice(1).map((td) => td.dataset.decided) })));
    assert.equal(chartRows.length, 4 * 3);
    assert.deepEqual([...new Set(chartRows.map((r) => r.tier))], [...text, 'drik']);
    for (const r of chartRows) { assert.equal(r.decided.length, 6); for (const d of r.decided) assert.ok(['true', 'false'].includes(d), `${r.tier} ${r.body}: ${d}`); }
    // the sky choice's arcsecond budget decides every placement off an edge; a text choice's Moon leaves the ṣaṣṭyāṃśa and finer undecided far more often
    const drikDecided = chartRows.filter((r) => r.tier === 'drik').flatMap((r) => r.decided).filter((d) => d === 'true').length;
    const textMoonFine = chartRows.filter((r) => r.tier !== 'drik' && r.body === 'moon').flatMap((r) => r.decided.slice(3)).filter((d) => d === 'false').length;
    assert.ok(drikDecided >= 16, `dṛk decided ${drikDecided} of 18`); assert.ok(textMoonFine >= 5, `text Moon undecided in D-60/144/150: ${textMoonFine} of 9`);
    const dasha = await page.locator('#sukshma-dasha').textContent();
    assert.match(dasha, /pāda [1-4] \(cell \d+ of 108; navāṃśa [1-9] = pāda identity\), lord (Ketu|Śukra|Sūrya|Candra|Maṅgala|Rāhu|Guru|Śani|Budha)/);
    assert.match(dasha, /one minute of arc of the Moon is \d+\.\d+ days of its daśā/);
    // the paramparā table: every row of the data file, its candidates named
    const apply = JSON.parse(fs.readFileSync(path.join(root, 'corpus', 'research', 'parampara-apply.json'), 'utf8'));
    const spans = await page.$$eval('#parampara-out table.parampara-span', (ts) => ts.map((t) => [...t.querySelectorAll('tbody tr')].map((tr) => tr.dataset.candidate)));
    assert.deepEqual(spans, apply.spans.map((s) => s.rows.map((r) => r.name)), 'one row per candidate per span');
    const pText = await page.locator('#parampara-out').textContent();
    for (const name of Object.keys(apply.candidates)) assert.ok(pText.includes(apply.candidates[name].slice(0, 30)), `candidate ${name} described`);
    assert.ok(pText.includes(`${apply.record.moonArcmin}′`) && pText.includes(`${apply.record.nodeArcmin}′`), 'the record\'s numbers come from the data file');
    // the ledger: every entry of the data file, or its absence named
    const ledgerFile = path.join(root, 'corpus', 'research', 'derivations.json');
    if (fs.existsSync(ledgerFile)) {
      const ledger = JSON.parse(fs.readFileSync(ledgerFile, 'utf8'));
      const ids = await page.$$eval('#ledger-out article.card', (as) => as.map((a) => a.dataset.entry));
      assert.deepEqual(ids, ledger.entries.map((e) => e.id), 'one card per ledger entry, in order');
      assert.equal((await page.evaluate(() => document.body.dataset.ledger)), String(ledger.entries.length));
      const first = ledger.entries.find((e) => e.figures && e.figures.length);
      if (first) assert.ok((await page.locator(`#d-${first.id}`).textContent()).includes(first.figures[0].verbatim.slice(0, 40)), 'a figure is quoted verbatim');
    } else assert.equal((await page.evaluate(() => document.body.dataset.ledger)), 'missing');
    // section 6: the library sweep, one card per edition with its findings; the tower table from the loaded modules
    const sweep = JSON.parse(fs.readFileSync(path.join(root, 'corpus', 'research', 'library-sweep.json'), 'utf8'));
    await page.waitForFunction((n) => document.body.dataset.granthas === String(n), sweep.reads.length, { timeout: 120000 });
    const cards = await page.$$eval('#granthas-out article.card', (as) => as.map((a) => ({ edition: a.dataset.edition, rows: a.querySelectorAll('tbody tr').length, verse: a.querySelectorAll('tbody tr[data-kind="verse"]').length })));
    assert.deepEqual(cards.map((c) => c.edition), sweep.reads.map((r) => r.edition));
    cards.forEach((c, i) => { assert.equal(c.rows, sweep.reads[i].findings.length, c.edition); assert.equal(c.verse, sweep.reads[i].findings.filter((f) => f.kind === 'verse').length); });
    // the generator 2, structure only: the doubling cycles from the module, and the search record
    const gen = JSON.parse(fs.readFileSync(path.join(root, 'corpus', 'research', 'generator-2-search.json'), 'utf8'));
    await page.waitForFunction((n) => document.body.dataset.generator === String(n), gen.totals.claims, { timeout: 120000 });
    const orbits = await page.$$eval('#gen-orbits tbody tr', (trs) => trs.map((tr) => ({ ring: tr.dataset.ring, length: tr.dataset.length, lords: tr.children[3].textContent })));
    assert.deepEqual(orbits.map((o) => `${o.ring}:${o.length}`), ['9:1', '9:6', '9:2', '27:1', '27:18', '27:6', '27:2']);
    assert.equal(orbits[1].lords, 'Śukra → Sūrya → Maṅgala → Budha → Śani → Rāhu'); assert.equal(orbits[2].lords, 'Candra → Guru');
    assert.equal(gen.sequenceCheck.textDoubling, 0); assert.ok((gen.sequenceCheck.doublingItems || []).every((d) => d.startsWith('this repository'))); assert.equal(await page.$$eval('#gen-search details', (ds) => ds.length), gen.totals.claims);
    assert.match(await page.$eval('#gen-note', (p) => p.textContent), /structure/);
    const tower = await page.$$eval('#tower-table tbody tr', (trs) => trs.map((tr) => ({ nu3: tr.dataset.nu3, cells: [...tr.children].map((td) => td.textContent) })));
    assert.ok(tower.length >= 20); assert.equal(tower[0].cells[1], '4320000'); assert.equal(tower[0].nu3, '3');
    const savana = tower.find((r) => r.cells[0].startsWith('civil days')); assert.equal(savana.nu3, '0'); assert.equal(savana.cells[4], 'yes');
    assert.equal(await page.evaluate(() => (window.__csp || []).length), 0, 'no CSP violation');
    await context.close();
    // ── 1800: the sky choice refuses, the page says so with the engine's words, the reasons stay ──────────────────────
    const p2 = await open({ viewport: { width: 390, height: 800 } });
    await p2.page.goto(`${base}/ganita-shala.html?date=1800-05-05&time=06:00&tz=5.5`); await ready(p2.page);
    assert.equal(await p2.page.evaluate(() => document.body.dataset.sky), 'refused');
    const refusal = await p2.page.locator('#sky-table tbody td.refusal').textContent();
    assert.ok(refusal.includes(M.TIERS.drik.labelSa) && /1850\.0–2150\.0/.test(refusal), refusal);
    assert.equal(await p2.page.$$eval('#hisab-table tbody tr', (trs) => trs.length), 0, 'no decomposition without the sky');
    assert.equal(await p2.page.$$eval('#sukshma-chart tbody tr', (trs) => trs.length), 0, 'no placement table without the sky');
    assert.ok((await p2.page.$$eval('#hisab-why li', (lis) => lis.length)) >= 4, 'the reasons do not need the sky');
    assert.equal(await p2.page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth), 0, 'no horizontal overflow at 390 px');
    await p2.context.close();
    const real = errors.filter((e) => !/derivations\.json|404/.test(e) || fs.existsSync(ledgerFile));
    assert.deepEqual(real, [], 'no page error'); assert.deepEqual(outside, [], 'no request left the local server');
    console.log('PASS the page: the four choices against the sky re-computed to 0.1′, the 101′ identity, the reasons from M.TIERS, the vargas\' resolution and placements, the paramparā table, the ledger, the 1800 refusal, 390 px');
  } finally { await browser.close(); server.close(); }
})().catch((e) => { console.error(e); process.exit(1); });
