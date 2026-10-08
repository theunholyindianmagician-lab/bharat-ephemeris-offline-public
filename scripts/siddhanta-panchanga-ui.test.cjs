'use strict';
// siddhanta-panchanga.html, the public pañcāṅga on the sovereign engine: served from this checkout with every request
// outside the local server blocked and counted as a failure. The page's numbers are checked against the same modules run
// here in node (panchanga.js, utsava.js, dasha.js, ss-grahana.js) with the page's clock rule: clock = t − meridian ÷ 360 +
// offset ÷ 24. Two cities' days, a month grid, the festivals of 2026, the eclipses, a daśā table, a polar day, no page
// errors, no horizontal overflow at 390 px, both colour themes, and the place remembered across a reload.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { chromium } = require('playwright');
const P = require('../panchanga.js');
const U = require('../utsava.js');
const D = require('../dasha.js');
const G = require('../ss-grahana.js');
const K = require('../kala-dvara.js');
const root = path.resolve(__dirname, '..');
const MER = 75.7885;   // the page's UJJAYINI_MERIDIAN_DEG, the modern position of Ujjain (math-core.js UJJAIN_LONGITUDE_DEG)
const pad2 = (n) => String(n).padStart(2, '0');
const kali = (y, m, d) => K.kaliDayFromCivil({ calendar: 'gregorian', year: y, month: m, day: d });
const clock = (t, off) => { const z = t - MER / 360 + off / 24; let N = Math.floor(z), min = Math.round((z - N) * 1440); if (min >= 1440) { N += 1; min -= 1440; } return { N, hm: `${pad2(Math.floor(min / 60))}:${pad2(min % 60)}` }; };
const site = (lat, lon) => ({ latitude: lat, deshantara: lon - MER });
const tithiShort = (i) => { const n = P.tithiName(i); return `${n.paksha === 'śukla' ? 'śu' : 'kṛ'} ${n.name}`; };
const VARA_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], MON_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const dayLabel = (N) => { const c = K.civilFromKaliDay(N, 'gregorian'); return `${VARA_EN[K.varaOfKaliDay(N).index]} ${c.day} ${MON_EN[c.month - 1]}`; };

(async () => {
  // the offline cache lists the page and every script it loads, and each of them exists
  const html = fs.readFileSync(path.join(root, 'siddhanta-panchanga.html'), 'utf8');
  const sw = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
  const scripts = [...html.matchAll(/<script src="([^"]+)"/g)].map((m) => m[1]);
  assert.ok(scripts.includes('panchanga.js') && scripts.includes('dasha.js') && scripts.includes('siddhanta-panchanga-page.js'));
  for (const f of ['siddhanta-panchanga.html', ...scripts]) {
    assert.ok(sw.includes(`"./${f}"`), `sw.js precaches ${f}`);
    assert.ok(fs.existsSync(path.join(root, f)), `${f} exists`);
  }
  assert.doesNotMatch(html, /\son[a-z]+\s*=/i, 'no inline event handlers');
  // the share tags must carry absolute URLs (og:url, og:image, twitter:image); nothing else may name an outside host
  assert.doesNotMatch(html.replace(/<meta (?:property="og:(?:url|image)"|name="twitter:image") content="https:\/\/offline\.bharatephemeris\.com\/[^"]*">/g, ''), /https?:\/\//, 'no outside URL in the page');
  for (const f of ['index.html', 'panchang.html', 'museum.html', 'library.html', 'shunyabheda.html', 'shoonya_sovereign_dashboard.html', 'siddhanta-panchanga.html']) {
    const page = fs.readFileSync(path.join(root, f), 'utf8'), nav = page.slice(page.indexOf('class="bharat-nav"'), page.indexOf('</nav>', page.indexOf('class="bharat-nav"')));
    assert.match(nav, /href="siddhanta-panchanga\.html"[^>]*>सिद्धान्त-पञ्चाङ्ग</, `${f}: the nav links the page`);
    assert.match(nav, /href="vedha\.html"/, `${f}: the nav links vedha.html`);
  }
  console.log('PASS the page, its scripts and the nav are wired (sw.js precache, every product page\'s nav, no inline handlers, no outside URL)');

  const server = http.createServer((req, res) => {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const file = path.resolve(root, '.' + pathname);
    if (!file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
    const type = { '.js': 'text/javascript', '.css': 'text/css', '.html': 'text/html', '.json': 'application/json', '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json' }[path.extname(file)];
    fs.readFile(file, (error, data) => { if (error) res.writeHead(404).end(); else { res.setHeader('Content-Type', type || 'application/octet-stream'); res.end(data); } });
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  const outside = [], errors = [];
  let browser;
  const open = async (opts) => {
    const context = await browser.newContext({ serviceWorkers: 'block', ...opts });
    await context.route('**/*', (route) => {
      const u = new URL(route.request().url());
      if (u.hostname === '127.0.0.1' && u.port === String(server.address().port)) return route.continue();
      outside.push(u.href); return route.abort();
    });
    const page = await context.newPage();
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
    return { context, page };
  };
  const ready = (page) => page.waitForFunction(() => document.body.dataset.ready === '1', null, { timeout: 120000 });
  const eclipsesDone = (page) => page.waitForFunction(() => document.body.dataset.eclipses === 'done', null, { timeout: 180000 });
  const setPlace = async (page, city, lat, lon, off) => {
    if (city) await page.selectOption('#city', city);
    else await page.evaluate(([a, b, c]) => { document.getElementById('city').value = 'custom'; document.getElementById('lat').value = a; document.getElementById('lon').value = b; document.getElementById('off').value = c; document.getElementById('off').dispatchEvent(new Event('change')); }, [lat, lon, off]);
    await ready(page);
  };
  const setDate = async (page, iso) => { await page.evaluate((v) => { const d = document.getElementById('date'); d.value = v; d.dispatchEvent(new Event('change')); }, iso); await ready(page); };
  const overflow = (page) => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  try {
    browser = await chromium.launch({ headless: true, executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || undefined });
    const { context, page } = await open({ viewport: { width: 1280, height: 900 }, colorScheme: 'dark' });
    const t0 = Date.now();
    await page.goto(base + '/siddhanta-panchanga.html');
    await ready(page);
    console.log(`PASS loads offline in ${Date.now() - t0} ms with the default place (Ujjayinī) and today's date`);
    const iso = await page.inputValue('#date');
    const d0 = new Date();
    assert.equal(iso, `${d0.getFullYear()}-${pad2(d0.getMonth() + 1)}-${pad2(d0.getDate())}`, 'the date defaults to the device\'s');
    const [Y, Mo, Dd] = iso.split('-').map(Number), N = kali(Y, Mo, Dd);
    assert.equal(await page.inputValue('#city'), 'ujjain');
    assert.equal(await page.evaluate(() => getComputedStyle(document.body).backgroundColor), 'rgb(13, 18, 32)', 'dark theme');

    // the eclipses of the next 400 days at Ujjayinī, as ss-grahana.js gives them
    await eclipsesDone(page);
    const ecl = G.eclipsesBetween(N, N + 400, site(23.1765, MER));
    const cards = await page.locator('#ecl .ecard').count();
    assert.equal(cards, ecl.length, 'one card per eclipse');
    if (ecl.length) {
      const text = await page.locator('#ecl').textContent();
      for (const E of ecl) {
        assert.ok(text.includes(E.magnitude.toFixed(3)), `magnitude ${E.magnitude.toFixed(3)}`);
        assert.ok(text.includes(clock(E.contacts.madhya, 5.5).hm), 'the middle in the clock');
      }
      assert.match(text, /At this place: (visible|not visible)/);
      if (ecl.some((E) => E.kind === 'solar')) assert.match(await page.locator('#grahana').textContent(), /certified solar filter/);
      assert.match(text, /sparśa/);
    } else assert.match(await page.locator('#ecl').textContent(), /no eclipse/);
    console.log(`PASS the eclipse section: ${ecl.length} eclipse(s) in 400 days at Ujjayinī, magnitudes, middles and visibility as ss-grahana.js gives them`);

    // today's pañcāṅga for two cities, against the engine and the clock rule run here
    for (const [city, lat, lon] of [['delhi', 28.61, 77.21], ['chennai', 13.08, 80.27]]) {
      await setPlace(page, city);
      const p = P.panchanga(N, site(lat, lon));
      const text = await page.locator('#today').textContent();
      assert.ok(text.includes(p.vara), `${city}: vāra ${p.vara}`);
      assert.ok(text.includes(`${p.tithi[0].paksha} ${p.tithi[0].name}`), `${city}: tithi`);
      assert.ok(text.includes(clock(p.tithi[0].end, 5.5).hm), `${city}: tithi end ${clock(p.tithi[0].end, 5.5).hm}`);
      assert.ok(text.includes(p.nakshatra[0].name) && text.includes(`pada ${p.pada}`), `${city}: nakṣatra and pada`);
      assert.ok(text.includes(p.yoga[0].name) && text.includes(p.karana[0].name), `${city}: yoga and karaṇa`);
      assert.ok(text.includes(clock(p.sunrise, 5.5).hm) && text.includes(clock(p.sunset, 5.5).hm), `${city}: sunrise ${clock(p.sunrise, 5.5).hm}, sunset`);
      assert.ok(text.includes(p.month.name) && text.includes(p.sunRashi) && text.includes(p.moonRashi), `${city}: month and rāśis`);
      assert.match(text, /ayanāṃśa/); assert.match(text, /दिनमान/);
      const m = U.moonrise(N, site(lat, lon));
      if (m !== null) assert.ok(text.includes(clock(m, 5.5).hm), `${city}: moonrise`);
      console.log(`PASS ${city}: ${p.vara}, ${p.tithi[0].paksha} ${p.tithi[0].name} to ${clock(p.tithi[0].end, 5.5).hm}, ${p.nakshatra[0].name}, sunrise ${clock(p.sunrise, 5.5).hm} — as panchanga.js gives them`);
    }
    assert.match(await page.locator('#kala-out').textContent(), /Abhijit[\s\S]*common practice/);

    // the month grid: every civil day of the month, its tithi at sunrise as panchanga.js gives it
    const dim = (Mo === 12 ? kali(Y + 1, 1, 1) : kali(Y, Mo + 1, 1)) - kali(Y, Mo, 1);
    assert.equal(await page.locator('#month .mday').count(), dim, `${dim} days in the grid`);
    for (const day of [1, dim]) {
      const n = kali(Y, Mo, day), s = site(13.08, 80.27), L = P.limbsAt(P.sunrise(n, s));
      const cell = await page.locator(`#month .mday[data-day="${day}"]`).textContent();
      assert.ok(cell.includes(tithiShort(L.tithi)) && cell.includes(P.NAKSHATRA[L.nakshatra - 1]), `day ${day}: ${tithiShort(L.tithi)}`);
    }
    await setDate(page, '2026-02-10');
    assert.equal(await page.locator('#month .mday').count(), 28, 'February 2026 has 28 days');
    await page.locator('#month .mday[data-day="15"]').click();
    await ready(page);
    assert.equal(await page.inputValue('#date'), '2026-02-15', 'choosing a day in the grid opens it');
    console.log(`PASS the month grid has every day (${dim}, then 28 for February 2026), tithi and nakṣatra at sunrise as panchanga.js gives them`);

    // the festivals of 2026 (at Chennai), as utsava.js gives them
    const fest = U.festivals(kali(2026, 1, 1), kali(2027, 1, 1), site(13.08, 80.27));
    const items = page.locator('#fest-list > li');
    assert.ok(fest.length > 30);
    assert.equal(await items.count(), fest.length, 'every festival listed');
    const dip = fest.find((f) => f.id === 'dipavali');
    assert.match(await page.locator('#fest-list > li[data-id="dipavali"]').textContent(), new RegExp(dayLabel(dip.N)));
    assert.match(await page.locator('#year').textContent(), /common practice, unverified/);
    assert.equal(await page.locator('#sk-table tbody tr').count(), 12, 'twelve saṅkrāntis');
    const yt = await page.locator('#year').textContent();
    assert.ok(yt.includes('uttarāyaṇa begins') && yt.includes('dakṣiṇāyana begins') && yt.includes('viṣuva'), 'the ayanas and viṣuvas in the sky');
    assert.ok(yt.includes('consult your doctor'), 'the fasting caution');
    console.log(`PASS the festivals of 2026: ${fest.length}, Dīpāvalī on ${dayLabel(dip.N)}, each with its status; 12 saṅkrāntis with puṇyakāla; the ayanas in the sky`);

    // the daśā
    await page.fill('#b-date', '1990-05-17'); await page.fill('#b-time', '06:30');
    await page.selectOption('#b-city', 'ujjain');
    await page.click('#b-go');
    await page.waitForSelector('#dasha-table');
    const V = D.vimshottari(kali(1990, 5, 17) + 6.5 / 24 + MER / 360 - 5.5 / 24);
    const dt = await page.locator('#dasha-out').textContent();
    assert.match(dt, /गणना घोषित है — भाग्य नहीं · computation declared, not fate/);
    assert.ok(dt.includes(V.birth.nakshatraName) && dt.includes(D.LORDS[V.lordAtBirth]), 'birth nakṣatra and lord');
    assert.ok(dt.includes(V.year.source), 'the year used, from dasha.js');
    assert.equal(await page.locator('#dasha-table tr.maha').count(), 9);
    assert.equal(await page.locator('#dasha-table tr.antar').count(), 81);
    const end0 = D.toCivil(V.periods[0].end, 5.5 * 15 - MER);
    assert.ok(dt.includes(`${end0.day} ${MON_EN[end0.month - 1]} ${end0.year}`), 'the first mahādaśā ends as dasha.js says');
    console.log(`PASS the daśā table: born in ${V.birth.nakshatraName}, ${D.LORDS[V.lordAtBirth]} at birth, 9 mahādaśās and 81 antardaśās, the year from dasha.js`);

    // a polar day
    await setDate(page, '2026-06-21');
    await setPlace(page, null, 78.22, 15.65, 1);
    assert.equal(await page.locator('#today').getAttribute('data-polar'), '1');
    assert.match(await page.locator('#today').textContent(), /No sunrise or no sunset/);
    assert.match(await page.locator('#kala-out').textContent(), /No sunrise or no sunset/);
    assert.equal(await page.locator('#month .mday.polar-day').count(), 30, 'June at 78° N: no day has a sunrise');
    assert.ok(await page.locator('#fest-list > li').count() > 0 || /No festival/.test(await page.locator('#year').textContent()));
    await eclipsesDone(page);
    console.log('PASS a polar site shows the message, not a crash (day, kāla, month and year)');

    // the place is remembered
    await setPlace(page, 'kolkata');
    await page.reload(); await ready(page);
    assert.equal(await page.inputValue('#city'), 'kolkata');
    assert.equal(await page.inputValue('#lat'), '22.57');
    console.log('PASS the place is remembered across a reload');
    await context.close();

    // 390 px, light theme
    const small = await open({ viewport: { width: 390, height: 844 }, colorScheme: 'light' });
    await small.page.goto(base + '/siddhanta-panchanga.html');
    await ready(small.page);
    assert.equal(await small.page.evaluate(() => getComputedStyle(document.body).backgroundColor), 'rgb(243, 245, 247)', 'light theme');
    assert.ok(await overflow(small.page) <= 0, 'no horizontal overflow at 390 px');
    await small.page.fill('#b-date', '1990-05-17'); await small.page.click('#b-go'); await small.page.waitForSelector('#dasha-table');
    await small.page.locator('#dasha-table details').first().evaluate((d) => { d.open = true; });
    await small.page.locator('#kala-out details').first().evaluate((d) => { d.open = true; });
    await eclipsesDone(small.page);
    assert.ok(await overflow(small.page) <= 0, 'no horizontal overflow at 390 px with the daśā, the muhūrtas and the eclipses open');
    await small.page.click('#theme');
    assert.equal(await small.page.evaluate(() => document.documentElement.getAttribute('data-theme')), 'light');
    await small.page.click('#theme');
    assert.equal(await small.page.evaluate(() => getComputedStyle(document.body).backgroundColor), 'rgb(13, 18, 32)', 'the dark theme by choice');
    const timings = await small.page.evaluate(() => window.__siddhantaTimings);
    console.log(`PASS 390 px: no horizontal overflow, light and dark themes; timings on this machine (ms): ${JSON.stringify(timings)}`);
    await small.context.close();

    assert.deepEqual(outside, [], 'no request left the local server');
    assert.deepEqual(errors, []);
    console.log('PASS no page errors, and no request outside the local server');
  } finally {
    if (browser) await browser.close();
    server.close();
  }
})().catch((e) => { console.error(e); process.exit(1); });
