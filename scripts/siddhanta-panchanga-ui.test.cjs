'use strict';
// siddhanta-panchanga.html, the public pañcāṅga in the owner's three choices (2026-10-08): served from this checkout with
// every request outside the local server blocked and counted as a failure. The page's numbers are checked against the same
// modules run here in node with the page's clock rule (clock = t − meridian ÷ 360 + offset ÷ 24):
//   'ss+parameshvara' (the default) — ss-tier.js's calendar/utsava/dasha with Parameśvara's saṃskāra and SSTier.eclipsesNear;
//   'ss' — panchanga.js, utsava.js, dasha.js and ss-grahana.js themselves;
//   'drik' — math-core's tier API and siddhanta-tier.js (tierDay, skyLunarMonth, vimshottariTier, eclipses), and its
//            refusal outside 1850–2150 with the two text choices offered.
// Also: every block's labels are M.TIERS's; the year panel at ±49,000 years (ss-ahargana.js yearOfKali) with its adhika
// and kṣaya months; the loading contract and the strict CSP; no foreign theory and no outside URL; the shared choice
// across a reload and a bad ?tier= link; a polar day; 390 px in both themes; and nothing on the page says observation is
// required.
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
const A = require('../ss-ahargana.js');
const GR = require('../ss-graha.js');
const ST = require('../ss-tier.js');
const M = require('../math-core.js');
const SD = require('../siddhanta-tier.js');
const root = path.resolve(__dirname, '..');
const MER = 75.7885;   // the page's UJJAYINI_MERIDIAN_DEG, the modern position of Ujjain (math-core.js UJJAIN_LONGITUDE_DEG)
const KJD = 588465.5;
const pad2 = (n) => String(n).padStart(2, '0');
const kali = (y, m, d) => K.kaliDayFromCivil({ calendar: 'gregorian', year: y, month: m, day: d });
const clock = (t, off) => { const z = t - MER / 360 + off / 24; let N = Math.floor(z), min = Math.round((z - N) * 1440); if (min >= 1440) { N += 1; min -= 1440; } return { N, hm: `${pad2(Math.floor(min / 60))}:${pad2(min % 60)}` }; };
const clockJd = (jd, off) => clock(jd - KJD + MER / 360, off);
const site = (lat, lon) => ({ latitude: lat, deshantara: lon - MER });
const tithiShort = (i) => { const n = P.tithiName(i); return `${n.paksha === 'śukla' ? 'śu' : 'kṛ'} ${n.name}`; };
const VARA_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], MON_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const yStr = (y) => (y < 0 ? `−${Math.abs(y)}` : String(y));
const dayLabel = (N) => { const c = K.civilFromKaliDay(N, 'gregorian'); return `${VARA_EN[K.varaOfKaliDay(N).index]} ${c.day} ${MON_EN[c.month - 1]}`; };
const dateLabel = (N) => { const c = K.civilFromKaliDay(N, 'gregorian'); return `${c.day} ${MON_EN[c.month - 1]} ${yStr(c.year)}`; };
const SAM = { samskara: 'parameshvara' }, P1 = ST.calendar(SAM), U1 = ST.utsava(SAM), D1 = ST.dasha(SAM);
const TIERS = M.TIERS;

(async () => {
  // ── the files: the loading contract, the strict CSP, no foreign theory, no outside URL, the offline cache, the nav ──────
  const html = fs.readFileSync(path.join(root, 'siddhanta-panchanga.html'), 'utf8');
  const js = fs.readFileSync(path.join(root, 'siddhanta-panchanga-page.js'), 'utf8');
  const sw = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
  const scripts = [...html.matchAll(/<script src="([^"]+)"/g)].map((m) => m[1]);
  const at = (f) => { const i = scripts.indexOf(f); assert.ok(i >= 0, `the page loads ${f}`); return i; };
  for (const f of ['katapayadi.js', 'kala-dvara.js', 'parahita-madhyama.js', 'sphuta.js', 'dhruva.js', 'ss-udaya.js', 'spanda-ganita.js', 'ss-graha.js', 'ss-chaya.js', 'ss-grahana.js',
    'ss-ahargana.js', 'panchanga.js', 'utsava.js', 'ss-drishya.js', 'dasha.js', 'muhurta.js', 'yantra.js', 'vedha-lekha.js', 'samskara.js', 'parampara.js']) assert.ok(at(f) < at('ss-tier.js'), `${f} before ss-tier.js`);
  assert.ok(at('ss-tier.js') < at('math-core.js') && at('math-core.js') < at('siddhanta-drik.js') && at('siddhanta-drik.js') < at('siddhanta-tier.js') && at('siddhanta-tier.js') < at('drik-grahana.js') && at('drik-grahana.js') < at('siddhanta-panchanga-page.js'),
    'the loading contract: sovereign modules, parampara.js, ss-tier.js, math-core.js, then the dṛk trio, then the page');
  assert.equal(scripts[scripts.length - 1], 'siddhanta-panchanga-page.js');
  for (const f of ['vsop87-full.js', 'elp-moon.js', 'drik-engine.js', 'drik-tier.js', 'precision-ephemeris.js']) assert.ok(!scripts.includes(f), `no foreign theory on the page: ${f}`);
  assert.doesNotMatch(js, /\b(?:DrikTier|drigCoordinates|drigGeoJ2000|Astronomy\.|KaalPrecisionEphemeris|ShunyaVsop87|ShunyaElp|keralaDrikSphuta)\b/, 'the page script calls no foreign theory');
  for (const id of Object.keys(TIERS)) for (const k of ['engine', 'provenance']) assert.ok(!js.includes(TIERS[id][k]) && !html.includes(TIERS[id][k]), `the ${id} ${k} label is read from M.TIERS, not typed`);
  assert.ok(!js.includes(TIERS.drik.span.accuracyMeasured) && !html.includes(TIERS.drik.span.accuracyMeasured), 'the measured figures are M.TIERS.drik\'s, not typed');
  const csp = html.match(/<meta http-equiv="Content-Security-Policy" content="([^"]+)">/);
  assert.ok(csp, 'a CSP');
  assert.match(csp[1], /default-src 'none'/); assert.match(csp[1], /script-src 'self';/); assert.match(csp[1], /connect-src 'self'/);
  assert.doesNotMatch(csp[1], /script-src[^;]*unsafe/, 'no unsafe script source');
  assert.equal(/<script>(?!\s*<\/script>)/.test(html) || /<script(?![^>]*\bsrc=)[^>]*>/.test(html), false, 'no inline script');
  assert.doesNotMatch(html, /\son[a-z]+\s*=/i, 'no inline event handlers');
  // the share tags must carry absolute URLs (og:url, og:image, twitter:image); nothing else may name an outside host
  assert.doesNotMatch(html.replace(/<meta (?:property="og:(?:url|image)"|name="twitter:image") content="https:\/\/offline\.bharatephemeris\.com\/[^"]*">/g, ''), /https?:\/\//, 'no outside URL in the page');
  assert.doesNotMatch(js, /https?:\/\//, 'no outside URL in the page script');
  for (const f of ['siddhanta-panchanga.html', ...scripts, 'corpus/parampara/registry.json', 'corpus/parampara/samskara.json']) {
    assert.ok(sw.includes(`"./${f}"`), `sw.js precaches ${f}`);
    assert.ok(fs.existsSync(path.join(root, f)), `${f} exists`);
  }
  for (const f of ['index.html', 'panchang.html', 'museum.html', 'library.html', 'shunyabheda.html', 'shoonya_sovereign_dashboard.html', 'siddhanta-panchanga.html']) {
    const page = fs.readFileSync(path.join(root, f), 'utf8'), nav = page.slice(page.indexOf('class="bharat-nav"'), page.indexOf('</nav>', page.indexOf('class="bharat-nav"')));
    assert.match(nav, /href="siddhanta-panchanga\.html"[^>]*>सिद्धान्त-पञ्चाङ्ग</, `${f}: the nav links the page`);
    assert.match(nav, /href="vedha\.html"/, `${f}: the nav links vedha.html`);
  }
  console.log('PASS the files: the loading contract in order, the strict CSP, no inline script, no foreign theory, labels not typed, no outside URL, sw.js precache, the nav');

  const server = http.createServer((req, res) => {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const file = path.resolve(root, '.' + pathname);
    if (!file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
    const type = { '.js': 'text/javascript', '.css': 'text/css', '.html': 'text/html', '.json': 'application/json', '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json' }[path.extname(file)];
    fs.readFile(file, (error, data) => { if (error) res.writeHead(404).end(); else { res.setHeader('Content-Type', type || 'application/octet-stream'); res.end(data); } });
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  const outside = [], errors = [], violations = [];
  let browser;
  const open = async (opts, route) => {
    const context = await browser.newContext({ serviceWorkers: 'block', ...opts });
    await context.route('**/*', (r) => {
      const u = new URL(r.request().url());
      if (u.hostname === '127.0.0.1' && u.port === String(server.address().port)) return route ? route(r, u) : r.continue();
      outside.push(u.href); return r.abort();
    });
    const page = await context.newPage();
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
    await page.addInitScript(() => { document.addEventListener('securitypolicyviolation', (e) => { window.__csp = (window.__csp || []).concat(`${e.violatedDirective} ${e.blockedURI}`); }); });
    return { context, page };
  };
  const ready = (page) => page.waitForFunction(() => document.body.dataset.ready === '1', null, { timeout: 300000 });
  const eclipsesDone = (page) => page.waitForFunction(() => document.body.dataset.eclipses === 'done', null, { timeout: 300000 });
  const setPlace = async (page, city, lat, lon, off) => {
    if (city) await page.selectOption('#city', city);
    else await page.evaluate(([a, b, c]) => { document.getElementById('city').value = 'custom'; document.getElementById('lat').value = a; document.getElementById('lon').value = b; document.getElementById('off').value = c; document.getElementById('off').dispatchEvent(new Event('change')); }, [lat, lon, off]);
    await ready(page);
  };
  const setDate = async (page, iso) => { await page.evaluate((v) => { const d = document.getElementById('date'); d.value = v; d.dispatchEvent(new Event('change')); }, iso); await ready(page); };
  const setTier = async (page, id) => {
    await page.check(`#tier-pick input[name="tier"][value="${id}"]`);
    await page.waitForFunction((t) => document.body.dataset.tier === t && document.body.dataset.ready === '1', id, { timeout: 300000 });
  };
  const showYear = async (page, y) => {
    await page.evaluate(() => { document.body.dataset.varsha = 'computing'; });
    await page.fill('#yr-in', String(y)); await page.click('#yr-go');
    await page.waitForFunction(() => document.body.dataset.varsha === 'done', null, { timeout: 120000 });
  };
  const text = async (page, sel) => (await page.locator(sel).textContent()).replace(/\s+/g, ' ');
  const overflow = (page) => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  /** Every block's labels are its choice's, as M.TIERS states them. */
  const labelsOf = async (page, id) => {
    const T = TIERS[id];
    for (const w of ['aaj', 'kala', 'masa', 'varsha', 'utsava', 'grahana']) {
      const el = page.locator(`#tl-${w} details.tl[data-tier="${id}"]`);
      assert.equal(await el.count(), 1, `#tl-${w} carries the ${id} labels`);
      const t = await el.textContent();
      for (const k of ['label', 'labelSa', 'engine', 'sunrise', 'dayBoundary', 'karanaOrder', 'month', 'yearStart', 'samvatsara', 'provenance', 'ahargana']) assert.ok(t.includes(T[k]), `#tl-${w}: ${id}.${k}`);
      assert.ok(t.includes(T.ayanamsha.name) && t.includes(T.ayanamsha.source) && t.includes(T.span.basis), `#tl-${w}: ${id} ayanāṃśa and span`);
      if (T.span.accuracyMeasured) assert.ok(t.includes(T.span.accuracyMeasured), `#tl-${w}: ${id} measured figures`);
    }
  };
  try {
    browser = await chromium.launch({ headless: true, executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || undefined });
    const { context, page } = await open({ viewport: { width: 1280, height: 900 }, colorScheme: 'dark' });
    const t0 = Date.now();
    await page.goto(base + '/siddhanta-panchanga.html');
    await ready(page);
    console.log(`PASS loads offline in ${Date.now() - t0} ms with the default place (Ujjayinī), today's date and the default choice`);

    // ── the three choices; the default ───────────────────────────────────────────────────────────────────────────────
    assert.deepEqual(await page.$$eval('#tier-pick input[name="tier"]', (xs) => xs.map((x) => x.value)), M.TIER_IDS);
    const pickText = await text(page, '#tier-pick');
    for (const id of M.TIER_IDS) assert.ok(pickText.includes(TIERS[id].labelSa) && pickText.includes(TIERS[id].label), `the choice ${id} named by M.TIERS`);
    assert.equal(await page.inputValue('#tier-pick input[name="tier"]:checked'), 'ss+parameshvara', 'the default is Sūrya-Siddhānta + Parameśvara\'s saṃskāra');
    assert.equal(await page.evaluate(() => document.body.dataset.tier), 'ss+parameshvara');
    assert.equal(await page.evaluate(() => document.body.dataset.parampara), 'ready', 'the paramparā record is read');
    assert.ok((await text(page, '#tier-note')).includes(ST.label(SAM).caption), 'the saṃskāra\'s caption is the record\'s');
    const iso = await page.inputValue('#date');
    const d0 = new Date();
    assert.equal(iso, `${d0.getFullYear()}-${pad2(d0.getMonth() + 1)}-${pad2(d0.getDate())}`, 'the date defaults to the device\'s');
    assert.equal(await page.getAttribute('#date', 'inputmode'), 'text', 'the date is typed (signed years), not a date picker');
    const [Y, Mo, Dd] = iso.split('-').map(Number), N = kali(Y, Mo, Dd);
    assert.equal(await page.inputValue('#city'), 'ujjain');
    assert.equal(await page.evaluate(() => getComputedStyle(document.body).backgroundColor), 'rgb(13, 18, 32)', 'dark theme');
    await labelsOf(page, 'ss+parameshvara');
    console.log('PASS three choices named from M.TIERS; the default is Sūrya-Siddhānta + Parameśvara\'s saṃskāra, its record read on the page, every block labelled from M.TIERS');

    // the default choice's day at Ujjayinī, as ss-tier.js's calendar gives it
    {
      const s = site(23.1765, MER), p = P1.panchanga(N, s), t = await text(page, '#today');
      assert.ok(t.includes(p.vara) && t.includes(`${p.tithi[0].paksha} ${p.tithi[0].name}`) && t.includes(clock(p.tithi[0].end, 5.5).hm), 'vāra, tithi and its end');
      assert.ok(t.includes(p.nakshatra[0].name) && t.includes(`pada ${p.pada}`) && t.includes(p.yoga[0].name) && t.includes(p.karana[0].name), 'nakṣatra, yoga, karaṇa');
      assert.ok(t.includes(clock(p.sunrise, 5.5).hm) && t.includes(p.month.name) && t.includes(GR.samvatsara(p.sunrise).name), 'sunrise, month and saṃvatsara');
      const y = A.lunarYear(p.sunrise, P1);
      assert.ok(t.includes(`Kali ${y.k} · Śaka ${y.shakaGone} · Vikrama ${y.vikramaGone}`), 'the year numbers (ss-ahargana.js)');
      const m = U1.moonrise(N, s);
      if (m !== null && m < p.nextSunrise) assert.ok(t.includes(clock(m, 5.5).hm), 'moonrise');
      // the saṃskāra moves the Moon: the tithi's end differs from the plain text's
      const q = P.panchanga(N, s);
      assert.notEqual(p.tithi[0].end, q.tithi[0].end, 'the saṃskāra\'s Moon is not the plain text\'s');
      console.log(`PASS the default choice at Ujjayinī: ${p.vara}, ${p.tithi[0].paksha} ${p.tithi[0].name} to ${clock(p.tithi[0].end, 5.5).hm} (plain text ${clock(q.tithi[0].end, 5.5).hm}), ${GR.samvatsara(p.sunrise).name} — as ss-tier.js's calendar gives it`);
    }
    // the default choice's eclipses: SSTier.eclipsesNear on the saṃskāra's model, a month at a time as the page asks
    await eclipsesDone(page);
    {
      const s = site(23.1765, MER), seen = new Set(), list = [];
      for (let a = N; a < N + 400; a += 32) {
        const half = Math.min(32, N + 400 - a) / 2;
        for (const E of ST.eclipsesNear(ST.jdOfDays(a + half), s, half, SAM)) { const tm = ST.daysOfJd(E.middleJd), key = `${E.kind}|${Math.round(tm * 10)}`; if (tm >= N && tm < N + 400 && !seen.has(key)) { seen.add(key); list.push(E); } }
      }
      assert.equal(await page.locator('#ecl .ecard[data-tier="ss+parameshvara"]').count(), list.length, 'one card per eclipse of the saṃskāra');
      const t = await text(page, '#ecl');
      for (const E of list) assert.ok(t.includes(E.magnitude.toFixed(3)) && t.includes(clock(ST.daysOfJd(E.contactsJd.madhya), 5.5).hm), `magnitude ${E.magnitude.toFixed(3)} and middle`);
      assert.match(await text(page, '#ecl-intro'), /saṃskāra/);
      console.log(`PASS the default choice's eclipses: ${list.length} in 400 days at Ujjayinī, as SSTier.eclipsesNear gives them`);
    }

    // ── the year panel: adhika and kṣaya months, any year on demand, ±49,000 years ──────────────────────────────────────
    const yearCount = (y) => { const adh = y.months.filter((m) => m.adhika), ksh = y.months.filter((m) => m.kshaya);
      return `${y.months.length} months: ${adh.length ? `${adh.length} adhika (${adh.map((m) => m.name).join(', ')})` : 'no adhika month'}, ${ksh.length ? `${ksh.length} kṣaya (${ksh.map((m) => `${m.name}, ${m.kshayaDropped} dropped`).join('; ')})` : 'no kṣaya month'}.`; };
    for (const yr of [2028, 1982, -49000, 49000]) {
      await showYear(page, yr);
      const y = A.yearOfKali(yr + 3101, P1), t = await text(page, '#varsha-out');
      assert.ok(t.includes(`Kali ${y.k} · Śaka ${y.shakaGone} · Vikrama ${y.vikramaGone}`), `${yr}: the year's numbers`);
      assert.equal(await text(page, '#varsha-count'), yearCount(y), `${yr}: the adhika and kṣaya months as ss-ahargana.js gives them`);
      assert.equal(await page.locator('#varsha-table tbody tr').count(), y.months.length);
      assert.deepEqual(await page.$$eval('#varsha-table tbody tr td:nth-child(2) b', (xs) => xs.map((x) => x.textContent)), y.months.map((m) => m.name));
      assert.ok(t.includes(dateLabel(clock(y.start, 5.5).N)), `${yr}: the year's first new moon`);
      assert.ok(t.includes(GR.samvatsara(y.start).name), `${yr}: the saṃvatsara at its start (SS 1.55)`);
      if (yr === 2028) assert.ok(y.months.some((m) => m.kshaya) && y.months.filter((m) => m.adhika).length === 2, '2028: a kṣaya month and two adhika months (the test\'s own premise)');
      console.log(`PASS the year ${yStr(yr)} on demand: ${yearCount(y)}`);
    }
    await showYear(page, 60000);
    assert.match(await text(page, '#varsha-out'), /outside −50000 … 50000/);
    await page.click('#yr-day'); await ready(page);

    // a day at ±49,000 years in the default choice
    for (const [y, iso2] of [[-49000, '-49000-06-01'], [49000, '49000-06-01']]) {
      await setDate(page, iso2);
      const n = kali(y, 6, 1), s = site(23.1765, MER), p = P1.panchanga(n, s), t = await text(page, '#today');
      assert.ok(t.includes(p.vara) && t.includes(`${p.tithi[0].paksha} ${p.tithi[0].name}`) && t.includes(clock(p.tithi[0].end, 5.5).hm) && t.includes(p.nakshatra[0].name) && t.includes(p.month.name), `${iso2}: the day as ss-tier.js gives it`);
      assert.ok((await text(page, '#date-help')).includes(`astronomical year ${yStr(y)}`));
      const yy = A.lunarYear(p.sunrise, P1);
      assert.equal(await text(page, '#varsha-count'), yearCount(yy), `${iso2}: the year holding the day`);
      await eclipsesDone(page);
      console.log(`PASS ${iso2}: ${p.vara}, ${p.tithi[0].paksha} ${p.tithi[0].name}, month ${p.month.name}; its year Kali ${yy.k} (${yy.months.length} months)`);
    }
    // the calendar reform: Julian 1582-10-04 is followed by Gregorian 1582-10-15, and one parser reads both
    await page.selectOption('#calendar', 'julian'); await ready(page);
    await setDate(page, '1582-10-04');
    assert.match(await text(page, '#date-help'), /Julian 1582-10-04 = Gregorian 1582-10-14/);
    await page.click('#next'); await ready(page);
    assert.equal(await page.inputValue('#date'), '1582-10-05');
    assert.match(await text(page, '#date-help'), /Julian 1582-10-05 = Gregorian 1582-10-15/);
    await page.selectOption('#calendar', 'gregorian'); await ready(page);
    assert.equal(await page.inputValue('#date'), '1582-10-15', 'the same day, written in the other calendar');
    {
      const p = P1.panchanga(kali(1582, 10, 15), site(23.1765, MER)), t = await text(page, '#today');
      assert.ok(t.includes(p.vara) && t.includes(`${p.tithi[0].paksha} ${p.tithi[0].name}`) && t.includes(clock(p.tithi[0].end, 5.5).hm), '1582-10-15: the day as ss-tier.js gives it');
      console.log(`PASS the calendar reform: Julian 1582-10-04 → (next day) Julian 1582-10-05 = Gregorian 1582-10-15, ${p.vara}, ${p.tithi[0].paksha} ${p.tithi[0].name}`);
    }
    // an input the page cannot read: every block is cleared, nothing from the last day stays, the reason is said; a good
    // input brings the values back
    await setDate(page, iso);
    {
      const before = await text(page, '#today');
      const blocks = ['today', 'kala-out', 'month', 'varsha-out', 'year', 'ecl'];
      for (const [bad, re, how] of [['2026-02-30', /does not exist in the Gregorian calendar/, 'date'], ['2026-13-01', /month 13 is not 1–12/, 'date'], ['60000-01-01', /outside −50000 … 50000/, 'date'], ['95', /latitude between −90 and 90/, 'lat']]) {
        if (how === 'date') await setDate(page, bad);
        else await page.evaluate((v) => { const l = document.getElementById('lat'); l.value = v; l.dispatchEvent(new Event('change')); }, bad);
        await ready(page);
        assert.match(await text(page, '#msg'), re, `${bad}: the reason`);
        for (const id of blocks) assert.equal(await page.locator(`#${id} .not-computed`).count(), 1, `${bad}: #${id} cleared`);
        assert.ok(!(await text(page, '#today')).includes(before.slice(0, 40)), `${bad}: nothing from the last day stays`);
        assert.equal(await page.locator('#month .mday').count(), 0, `${bad}: no month grid`);
        assert.equal(await page.locator('#tl-aaj details.tl[data-tier="ss+parameshvara"]').count(), 1, `${bad}: the block still names its choice`);
        assert.doesNotMatch(await text(page, '#tl-aaj'), / here/, `${bad}: with no ayanāṃśa value from the last day`);
        if (how === 'lat') { await page.selectOption('#city', 'ujjain'); await ready(page); }
      }
      await setDate(page, iso);
      assert.equal(await page.locator('#today .not-computed').count(), 0);
      assert.equal(await text(page, '#today'), before, 'a good input brings the same values back');
      await eclipsesDone(page);
      // the daśā: a bad birth date clears the last daśā
      await page.fill('#b-date', '1990-05-17'); await page.click('#b-go'); await page.waitForSelector('#dasha-table');
      await page.fill('#b-date', '1990-02-31'); await page.click('#b-go');
      await page.waitForSelector('#dasha-out .not-computed');
      assert.equal(await page.locator('#dasha-table').count(), 0, 'no daśā from the last birth stays');
      console.log('PASS an unreadable date, month, year or latitude clears every block and says why (no value from the last day stays); a good input brings the values back; a bad birth date clears the daśā');
    }
    await setDate(page, iso);

    // ── the plain Sūrya-Siddhānta ─────────────────────────────────────────────────────────────────────────────────────
    await setTier(page, 'ss');
    await labelsOf(page, 'ss');
    await eclipsesDone(page);
    {
      const ecl = G.eclipsesBetween(N, N + 400, site(23.1765, MER));
      assert.equal(await page.locator('#ecl .ecard[data-tier="ss"]').count(), ecl.length, 'one card per eclipse');
      const t = await text(page, '#ecl');
      for (const E of ecl) assert.ok(t.includes(E.magnitude.toFixed(3)) && t.includes(clock(E.contacts.madhya, 5.5).hm), `magnitude ${E.magnitude.toFixed(3)} and middle`);
      if (ecl.length) { assert.match(t, /At this place: (visible|not visible)/); assert.match(t, /sparśa/); }
      if (ecl.some((E) => E.kind === 'solar')) assert.match(await text(page, '#grahana'), /certified solar filter/);
      console.log(`PASS the plain text's eclipses: ${ecl.length} in 400 days at Ujjayinī, as ss-grahana.js gives them`);
    }
    for (const [city, lat, lon] of [['delhi', 28.61, 77.21], ['chennai', 13.08, 80.27]]) {
      await setPlace(page, city);
      const p = P.panchanga(N, site(lat, lon)), t = await text(page, '#today');
      assert.ok(t.includes(p.vara) && t.includes(`${p.tithi[0].paksha} ${p.tithi[0].name}`) && t.includes(clock(p.tithi[0].end, 5.5).hm), `${city}: vāra and tithi`);
      assert.ok(t.includes(p.nakshatra[0].name) && t.includes(`pada ${p.pada}`) && t.includes(p.yoga[0].name) && t.includes(p.karana[0].name), `${city}: nakṣatra, yoga, karaṇa`);
      assert.ok(t.includes(clock(p.sunrise, 5.5).hm) && t.includes(clock(p.sunset, 5.5).hm), `${city}: sunrise and sunset`);
      assert.ok(t.includes(p.month.name) && t.includes(p.sunRashi) && t.includes(p.moonRashi), `${city}: month and rāśis`);
      assert.match(t, /ayanāṃśa/); assert.match(t, /दिनमान/);
      const m = U.moonrise(N, site(lat, lon));
      if (m !== null && m < p.nextSunrise) assert.ok(t.includes(clock(m, 5.5).hm), `${city}: moonrise`);
      console.log(`PASS plain text, ${city}: ${p.vara}, ${p.tithi[0].paksha} ${p.tithi[0].name} to ${clock(p.tithi[0].end, 5.5).hm}, ${p.nakshatra[0].name}, sunrise ${clock(p.sunrise, 5.5).hm} — as panchanga.js gives them`);
    }
    assert.match(await text(page, '#kala-out'), /Abhijit.*common practice/);
    // the month grid
    const dim = (Mo === 12 ? kali(Y + 1, 1, 1) : kali(Y, Mo + 1, 1)) - kali(Y, Mo, 1);
    assert.equal(await page.locator('#month .mday').count(), dim, `${dim} days in the grid`);
    for (const day of [1, dim]) {
      const n = kali(Y, Mo, day), L = P.limbsAt(P.sunrise(n, site(13.08, 80.27)));
      const cell = await page.locator(`#month .mday[data-day="${day}"]`).textContent();
      assert.ok(cell.includes(tithiShort(L.tithi)) && cell.includes(P.NAKSHATRA[L.nakshatra - 1]), `day ${day}: ${tithiShort(L.tithi)}`);
    }
    await setDate(page, '2026-02-10');
    assert.equal(await page.locator('#month .mday').count(), 28, 'February 2026 has 28 days');
    await page.locator('#month .mday[data-day="15"]').click();
    await ready(page);
    assert.equal(await page.inputValue('#date'), '2026-02-15', 'choosing a day in the grid opens it');
    console.log(`PASS plain text: the month grid has every day (${dim}, then 28 for February 2026), tithi and nakṣatra at sunrise as panchanga.js gives them`);
    // the festivals of 2026 at Chennai
    const fest = U.festivals(kali(2026, 1, 1), kali(2027, 1, 1), site(13.08, 80.27));
    assert.ok(fest.length > 30);
    assert.equal(await page.locator('#fest-list > li').count(), fest.length, 'every festival listed');
    const dip = fest.find((f) => f.id === 'dipavali');
    assert.match(await text(page, '#fest-list > li[data-id="dipavali"]'), new RegExp(dayLabel(dip.N)));
    const yt = await text(page, '#year');
    assert.match(yt, /common practice, unverified/);
    assert.equal(await page.locator('#sk-table tbody tr').count(), 12, 'twelve saṅkrāntis');
    assert.ok(yt.includes('uttarāyaṇa begins') && yt.includes('dakṣiṇāyana begins') && yt.includes('viṣuva') && yt.includes('consult your doctor'), 'the ayanas, the viṣuvas and the fasting caution');
    console.log(`PASS plain text: the festivals of 2026, ${fest.length}, Dīpāvalī on ${dayLabel(dip.N)}; 12 saṅkrāntis with puṇyakāla; the ayanas in the sky`);
    // the daśā, plain and with the saṃskāra
    for (const [id, DD] of [['ss', D], ['ss+parameshvara', D1]]) {
      await setTier(page, id);
      await page.fill('#b-date', '1990-05-17'); await page.fill('#b-time', '06:30');
      await page.selectOption('#b-city', 'ujjain');
      await page.click('#b-go');
      await page.waitForSelector(`#dasha-table[data-tier="${id}"]`);
      const V = DD.vimshottari(kali(1990, 5, 17) + 6.5 / 24 + MER / 360 - 5.5 / 24);
      const dt = await text(page, '#dasha-out');
      assert.match(dt, /गणना घोषित है — भाग्य नहीं · computation declared, not fate/);
      assert.ok(dt.includes(V.birth.nakshatraName) && dt.includes(D.LORDS[V.lordAtBirth]) && dt.includes(V.year.source), `${id}: birth nakṣatra, lord and year`);
      assert.equal(await page.locator('#dasha-table tr.maha').count(), 9);
      assert.equal(await page.locator('#dasha-table tr.antar').count(), 81);
      const end0 = DD.toCivil(V.periods[0].end, 5.5 * 15 - MER);
      assert.ok(dt.includes(`${end0.day} ${MON_EN[end0.month - 1]} ${end0.year}`), `${id}: the first mahādaśā ends as dasha.js says`);
      assert.equal(await page.locator(`#dasha-out details.tl[data-tier="${id}"]`).count(), 1, `${id}: the daśā carries its labels`);
      console.log(`PASS the daśā (${id}): born in ${V.birth.nakshatraName}, ${D.LORDS[V.lordAtBirth]} at birth, 9 mahādaśās and 81 antardaśās`);
    }

    // ── Modern Bhāratīya (dṛk) ────────────────────────────────────────────────────────────────────────────────────────
    await setPlace(page, 'ujjain');
    await setDate(page, '2026-10-08');
    await setTier(page, 'drik');
    await labelsOf(page, 'drik');
    {
      const n = kali(2026, 10, 8), mid = n + KJD - 5.5 / 24;
      const d = M.tierDay(mid + 0.5, 23.1765, MER, 5.5, 'drik'), s = SD.sunMoon(d.sunriseJd);
      const ti = Math.floor(((s.elongation % 360) + 360) % 360 / 12) + 1, nk = Math.floor(s.moonSid / (40 / 3)) + 1;
      const t = await text(page, '#today');
      assert.ok(t.includes(K.varaOfKaliDay(d.N).name) && t.includes(clockJd(d.sunriseJd, 5.5).hm) && t.includes(clockJd(d.sunsetJd, 5.5).hm), 'dṛk: vāra, sunrise and sunset (math-core tierDay)');
      assert.ok(t.includes(`${P.tithiName(ti).paksha} ${P.tithiName(ti).name}`) && t.includes(P.NAKSHATRA[nk - 1]), 'dṛk: tithi and nakṣatra at the series\' sunrise');
      const m = M.skyLunarMonth(d.sunriseJd);
      assert.ok(t.includes(m.name) && t.includes(TIERS.drik.karanaOrder) && t.includes(TIERS.drik.ayanamsha.name), 'dṛk: the month (skyLunarMonth), the karaṇa order and the ayanāṃśa by M.TIERS');
      const mr = M.lunarRiseSet(mid, 23.1765, MER, 5.5, 'drik');
      if (mr.jdRise !== null) assert.ok(t.includes(clockJd(mr.jdRise, 5.5).hm), 'dṛk: moonrise (+7′)');
      const x = M.panchangExtended(d.sunriseJd + 1e-6, 23.1765, MER, 5.5, 'drik');
      assert.ok(t.includes(`Kali ${x.kaliYear} · Śaka ${x.shakaYear} · Vikrama ${x.vikramYear}`) && t.includes(x.samvatsara.nameIast), 'dṛk: the year and the saṃvatsara (panchangExtended)');
      assert.match(await text(page, '#kala-out'), /Abhijit.*Not computed in this choice/);
      assert.match(await text(page, '#year'), /Festivals are not computed in this choice/);
      assert.equal(await page.locator('#sk-table tbody tr').count(), SD.sankrantisBetween(kali(2026, 1, 1) + KJD - 5.5 / 24 - 2, kali(2027, 1, 1) + KJD - 5.5 / 24 + 2)
        .filter((q) => K.civilFromKaliDay(clockJd(q.jd, 5.5).N, 'gregorian').year === 2026).length, 'dṛk: the saṅkrāntis of 2026');
      assert.equal(await page.locator('#month .mday').count(), 31);
      const c8 = await page.locator('#month .mday[data-day="8"]').textContent();
      assert.ok(c8.includes(tithiShort(ti)) && c8.includes(P.NAKSHATRA[nk - 1]), 'dṛk: the grid\'s 8th');
      console.log(`PASS dṛk, Ujjayinī 2026-10-08: ${K.varaOfKaliDay(d.N).name}, sunrise ${clockJd(d.sunriseJd, 5.5).hm}, ${P.tithiName(ti).paksha} ${P.tithiName(ti).name}, ${P.NAKSHATRA[nk - 1]}, ${m.name}, ${x.samvatsara.nameIast} — math-core's tier API and siddhanta-tier.js`);
      await eclipsesDone(page);
      const ecl = SD.eclipses(mid, mid + 400, { latitude: 23.1765, longitude: MER });
      assert.equal(await page.locator('#ecl .ecard[data-tier="drik"]').count(), ecl.length, 'dṛk: one card per eclipse of drik-grahana.js');
      // a penumbral-only lunar eclipse: no grāsa, its penumbral magnitude, never a negative magnitude
      const pen = ecl.filter((E) => E.kind === 'lunar' && !(E.umbralMagnitude > 0));
      assert.ok(pen.length >= 1, 'the window holds a penumbral eclipse (2027-02-20), the test\'s own premise');
      assert.equal(await page.locator('#ecl .ecard[data-tier="drik"][data-penumbral="1"]').count(), pen.length);
      const et = await text(page, '#ecl');
      for (const E of pen) assert.ok(et.includes(`Penumbral magnitude ${E.penumbralMagnitude.toFixed(3)}`), `penumbral magnitude ${E.penumbralMagnitude.toFixed(3)}`);
      assert.doesNotMatch(et, /magnitude (?:here |\(anywhere\) )?[−-]\d/i, 'no negative magnitude on the page');
      assert.match(et, /no grāsa/);
      console.log(`PASS dṛk eclipses: ${ecl.length} in 400 days (drik-grahana.js through siddhanta-tier.js); ${pen.length} penumbral, shown with no grāsa and their penumbral magnitude`);
      await showYear(page, 2026);
      const months = await page.$$eval('#varsha-table tbody tr td:nth-child(2) b', (xs) => xs.map((q) => q.textContent));
      assert.deepEqual(months.slice(0, 3), [M.skyLunarMonth(x.yearStartJd + 1).name, M.skyLunarMonth(M.skyLunarMonth(x.yearStartJd + 1).endJd + 1).name, M.skyLunarMonth(M.skyLunarMonth(M.skyLunarMonth(x.yearStartJd + 1).endJd + 1).endJd + 1).name], 'dṛk: the year\'s months by skyLunarMonth');
      await showYear(page, 2200);
      assert.equal(await page.locator('#varsha-out .refusal[data-refused="drik"]').count(), 1, 'dṛk: the year 2200 is refused');
      await page.click('#yr-day'); await ready(page);
      // the daśā in the dṛk choice: math-core vimshottariTier's birth state, dasha.js's periods with the tier's year
      await page.fill('#b-date', '1990-05-17'); await page.fill('#b-time', '06:30'); await page.selectOption('#b-city', 'ujjain');
      await page.click('#b-go'); await page.waitForSelector('#dasha-table[data-tier="drik"]');
      const jb = kali(1990, 5, 17) + KJD + 6.5 / 24 - 5.5 / 24, v = M.vimshottariTier(jb, Date.now() / 86400000 + 2440587.5, 'drik');
      const dt = await text(page, '#dasha-out');
      assert.ok(dt.includes(P.NAKSHATRA[v.birthState.nakshatraIndex]) && dt.includes(v.birthState.lord) && dt.includes(TIERS.drik.dashaYear.source), 'dṛk daśā: birth nakṣatra, lord, year');
      const e0 = K.civilFromKaliDay(Math.floor(v.periods[0].endJd - KJD + 5.5 / 24), 'gregorian');
      assert.ok(dt.includes(`${e0.day} ${MON_EN[e0.month - 1]} ${e0.year}`), 'dṛk daśā: the first mahādaśā ends as math-core says');
      assert.equal(await page.locator('#dasha-table tr.maha').count(), 9);
      console.log(`PASS dṛk daśā: ${P.NAKSHATRA[v.birthState.nakshatraIndex]}, ${v.birthState.lord}, first mahādaśā to ${e0.day} ${MON_EN[e0.month - 1]} ${e0.year}`);
    }
    // the refusal outside 1850–2150, said plainly, with the text choices offered
    await setDate(page, '1700-03-01');
    for (const id of ['today', 'kala-out', 'month', 'varsha-out', 'year']) {
      const r = page.locator(`#${id} .refusal[data-refused="drik"]`);
      assert.equal(await r.count(), 1, `#${id}: refused`);
      const t = await r.textContent();
      assert.match(t, /1850\.0–2150\.0/); assert.match(t, /refused/);
      assert.equal(await r.locator('[data-use-tier]').count(), M.TIER_IDS.filter((t) => TIERS[t].family === 'ss').length, `#${id}: the text choices offered`);
    }
    await eclipsesDone(page);
    assert.equal(await page.locator('#ecl .refusal[data-refused="drik"]').count(), 1, '#ecl: refused');
    assert.equal(await page.locator('#tl-aaj details.tl[data-tier="drik"]').count(), 1, 'the refused blocks still name the choice');
    await page.locator('#today [data-use-tier="ss+parameshvara"]').click();
    await page.waitForFunction(() => document.body.dataset.tier === 'ss+parameshvara' && document.body.dataset.ready === '1', null, { timeout: 120000 });
    {
      const p = P1.panchanga(kali(1700, 3, 1), site(23.1765, MER));
      assert.ok((await text(page, '#today')).includes(`${p.tithi[0].paksha} ${p.tithi[0].name}`), 'the text choice serves 1700');
    }
    console.log('PASS dṛk refuses 1700-03-01 in every block with M.TierSpanError\'s message and offers the two text choices; one click serves the day in the default choice');

    // the choice is shared (yantraState 'tier') and survives a reload; a polar day; the place is remembered
    await setTier(page, 'drik');
    await page.reload(); await ready(page);
    assert.equal(await page.inputValue('#tier-pick input[name="tier"]:checked'), 'drik', 'the choice survives a reload');
    assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('bharat-ephemeris-yantra-state-v1')).tier), 'drik', 'kept in the shared key');
    await setTier(page, 'ss');
    await setDate(page, '2026-06-21');
    await setPlace(page, null, 78.22, 15.65, 1);
    assert.equal(await page.locator('#today').getAttribute('data-polar'), '1');
    assert.match(await text(page, '#today'), /No sunrise or no sunset/);
    assert.match(await text(page, '#kala-out'), /No sunrise or no sunset/);
    assert.equal(await page.locator('#month .mday.polar-day').count(), 30, 'June at 78° N: no day has a sunrise');
    await eclipsesDone(page);
    await setPlace(page, 'kolkata');
    await page.reload(); await ready(page);
    assert.equal(await page.inputValue('#city'), 'kolkata');
    assert.equal(await page.inputValue('#lat'), '22.57');
    console.log('PASS the choice is shared across a reload; a polar site shows the message; the place is remembered');
    // nothing on the page says observation is required
    const sentences = (await page.locator('main').innerText()).split(/(?<=[.!?।])\s+/);
    for (const s of sentences) if (/observ|measur|record|ledger|vedha/i.test(s)) assert.doesNotMatch(s, /\b(?:required|requires?|mandatory|necessary|must observe|needs? (?:your |an |the )?observations?)\b/i, s);
    assert.match(await text(page, '#parichaya'), /observations are optional/i);
    assert.deepEqual(await page.evaluate(() => window.__csp || []), [], 'no CSP violation');
    await context.close();

    // a link with a bad choice: seen on that visit, the default shown, nothing stored
    {
      const bad = await open({ viewport: { width: 1280, height: 900 } });
      await bad.page.goto(base + '/siddhanta-panchanga.html?tier=bogus');
      await ready(bad.page);
      assert.equal(await bad.page.evaluate(() => document.body.dataset.tier), 'ss+parameshvara');
      assert.match(await text(bad.page, '#msg'), /not one of the choices/);
      assert.equal(await bad.page.evaluate(() => JSON.parse(localStorage.getItem('bharat-ephemeris-yantra-state-v1') || '{}').tier || ''), '', 'the bad choice is not stored');
      await bad.context.close();
    }
    // the paramparā record unreadable: the default choice says so; the others still serve
    {
      // served, but not the record (a 404 would also log a console error, which this test counts)
      const nr = await open({ viewport: { width: 1280, height: 900 } }, (r, u) => (/corpus\/parampara\//.test(u.pathname) ? r.fulfill({ status: 200, contentType: 'application/json', body: 'not the record' }) : r.continue()));
      await nr.page.goto(base + '/siddhanta-panchanga.html');
      await ready(nr.page);
      assert.equal(await nr.page.evaluate(() => document.body.dataset.parampara), 'unavailable');
      assert.match(await text(nr.page, '#msg'), /needs the paramparā record/);
      await nr.page.check('#tier-pick input[value="ss"]');
      await nr.page.waitForFunction(() => document.body.dataset.tier === 'ss' && document.body.dataset.ready === '1', null, { timeout: 120000 });
      assert.ok((await text(nr.page, '#today')).includes(P.panchanga(N, site(23.1765, MER)).vara));
      await nr.context.close();
    }
    console.log('PASS a bad ?tier= link shows the default and stores nothing; without the paramparā record the default choice says so and the plain text still serves');

    // 390 px, light theme, the default choice
    const small = await open({ viewport: { width: 390, height: 844 }, colorScheme: 'light' });
    await small.page.goto(base + '/siddhanta-panchanga.html');
    await ready(small.page);
    assert.equal(await small.page.evaluate(() => getComputedStyle(document.body).backgroundColor), 'rgb(243, 245, 247)', 'light theme');
    assert.ok(await overflow(small.page) <= 0, 'no horizontal overflow at 390 px');
    await small.page.fill('#b-date', '1990-05-17'); await small.page.click('#b-go'); await small.page.waitForSelector('#dasha-table');
    await small.page.locator('#dasha-table details').first().evaluate((d) => { d.open = true; });
    await small.page.locator('#kala-out details').first().evaluate((d) => { d.open = true; });
    await small.page.locator('details.tl').first().evaluate((d) => { d.open = true; });
    await eclipsesDone(small.page);
    assert.ok(await overflow(small.page) <= 0, 'no horizontal overflow at 390 px with the daśā, the muhūrtas, the labels and the eclipses open');
    await small.page.click('#theme');
    assert.equal(await small.page.evaluate(() => document.documentElement.getAttribute('data-theme')), 'light');
    await small.page.click('#theme');
    assert.equal(await small.page.evaluate(() => getComputedStyle(document.body).backgroundColor), 'rgb(13, 18, 32)', 'the dark theme by choice');
    const timings = await small.page.evaluate(() => window.__siddhantaTimings);
    console.log(`PASS 390 px: no horizontal overflow, light and dark themes; timings on this machine (ms): ${JSON.stringify(timings)}`);
    await small.context.close();

    assert.deepEqual(outside, [], 'no request left the local server');
    assert.deepEqual(errors, []);
    console.log('PASS no page errors, no CSP violation, and no request outside the local server');
  } finally {
    if (browser) await browser.close();
    server.close();
  }
})().catch((e) => { console.error(e); process.exit(1); });
