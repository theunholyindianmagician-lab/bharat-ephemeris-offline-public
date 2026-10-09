'use strict';
// vedha.html, the observation companion: served from this checkout with every outside request blocked, it offers the
// owner's three choices for the Moon's predictions (the crescent, the Moon on a junction star, the eclipses) — the default
// Sūrya-Siddhānta + Parameśvara's saṃskāra, the plain text, and Modern Bhāratīya (dṛk) with its refusal outside
// 1850–2150 — each checked against the modules run here in node, with the labels of M.TIERS; it predicts at ±49,000 years;
// it plans a day at a place, starts a ledger, writes the day's predictions first, records a noon shadow and a star transit
// against them, reduces the ledger, exports it, and keeps it across a reload. The ledger it writes is certified by
// vedha-lekha.js. Observation is optional, and nothing on the page says otherwise.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { chromium } = require('playwright');
const V = require('../vedha-lekha.js');
const K = require('../kala-dvara.js');
const P = require('../panchanga.js');
const S = require('../sphuta.js');
const UD = require('../ss-udaya.js');
const Dr = require('../ss-drishya.js');
const G = require('../ss-grahana.js');
const ST = require('../ss-tier.js');
const M = require('../math-core.js');
const SD = require('../siddhanta-tier.js');
const root = path.resolve(__dirname, '..');
const TIERS = M.TIERS, SAM = { samskara: 'parameshvara' };
const kaliOf = (iso) => { const m = /^(-?\d+)-(\d{2})-(\d{2})$/.exec(iso); return K.kaliDayFromCivil({ calendar: 'gregorian', year: Number(m[1]), month: Number(m[2]), day: Number(m[3]) }); };
const kapStr = (asus) => { const c = V.kapalaOfAsus(asus, true); return `${c.ghati} घ ${c.vinadi} वि ${c.prana} प्रा`; };
const mod = (a, m) => ((a % m) + m) % m;
const wrap180 = (x) => { const y = mod(x + 180, 360) - 180; return y === -180 ? 180 : y; };
const STARS = Dr.starsOf(require('../corpus/surya-siddhanta/yogatara.json')).slice(0, 28);
// The test's own Moon-on-a-junction-star, written out here (SS 8.14-8.15, 7.10 on a choice's places; Newton as vedha-lekha.js)
function yuti(places, N, star, ms) {
  const polar = (t) => { const p = places(t), A = S.ayanamshaSS(S.spandasOfDays(t)), lam = mod(p.moon + A, 360); return mod(lam - p.moonLatitude * 60 * UD.kranti(lam + 90) / 3600 - A, 360); };
  const rise = V.sunriseAt(N, ms), next = V.sunriseAt(N + 1, ms), f = (t) => wrap180(polar(t) - star.dhruvaka);
  let t = rise + 0.5;
  for (let i = 0; i < 20; i++) { const step = -f(t) / ((f(t + 0.01) - f(t - 0.01)) / 0.02); t += step; if (Math.abs(step) < 1e-11) break; }
  return t >= rise && t < next && Math.abs(f(t)) < 1e-6 ? V.turnAsusBetween(rise, t) : null;
}

(async () => {
  // ── the files: the loading contract, the strict CSP, no foreign theory, labels not typed, no outside URL, the cache ──
  const html = fs.readFileSync(path.join(root, 'vedha.html'), 'utf8');
  const js = fs.readFileSync(path.join(root, 'vedha-page.js'), 'utf8');
  const sw = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
  const scripts = [...html.matchAll(/<script src="([^"]+)"/g)].map((m) => m[1]);
  const at = (f) => { const i = scripts.indexOf(f); assert.ok(i >= 0, `the page loads ${f}`); return i; };
  for (const f of ['katapayadi.js', 'kala-dvara.js', 'parahita-madhyama.js', 'sphuta.js', 'dhruva.js', 'ss-udaya.js', 'spanda-ganita.js', 'ss-graha.js', 'ss-chaya.js', 'ss-grahana.js',
    'ss-ahargana.js', 'panchanga.js', 'utsava.js', 'ss-drishya.js', 'dasha.js', 'muhurta.js', 'yantra.js', 'vedha-lekha.js', 'samskara.js', 'parampara.js']) assert.ok(at(f) < at('ss-tier.js'), `${f} before ss-tier.js`);
  assert.ok(at('yantra.js') < at('vedha-lekha.js'));
  assert.ok(at('ss-tier.js') < at('math-core.js') && at('math-core.js') < at('siddhanta-drik.js') && at('siddhanta-drik.js') < at('siddhanta-tier.js') && at('siddhanta-tier.js') < at('drik-grahana.js') && at('drik-grahana.js') < at('vedha-page.js'), 'the loading contract');
  for (const f of ['vsop87-full.js', 'elp-moon.js', 'drik-engine.js', 'drik-tier.js', 'precision-ephemeris.js']) assert.ok(!scripts.includes(f), `no foreign theory on the page: ${f}`);
  assert.doesNotMatch(js, /\b(?:DrikTier|drigCoordinates|drigGeoJ2000|Astronomy\.|KaalPrecisionEphemeris|ShunyaVsop87|ShunyaElp)\b/, 'the page script calls no foreign theory');
  for (const id of Object.keys(TIERS)) for (const k of ['engine', 'provenance']) assert.ok(!js.includes(TIERS[id][k]) && !html.includes(TIERS[id][k]), `the ${id} ${k} label is read from M.TIERS, not typed`);
  const csp = html.match(/<meta http-equiv="Content-Security-Policy" content="([^"]+)">/);
  assert.ok(csp); assert.match(csp[1], /default-src 'none'/); assert.match(csp[1], /script-src 'self';/); assert.doesNotMatch(csp[1], /script-src[^;]*unsafe/);
  assert.equal(/<script>(?!\s*<\/script>)/.test(html) || /<script(?![^>]*\bsrc=)[^>]*>/.test(html), false, 'no inline script');
  assert.doesNotMatch(html, /\son[a-z]+\s*=/i, 'no inline event handlers');
  assert.doesNotMatch(html.replace(/<meta (?:property="og:(?:url|image)"|name="twitter:image") content="https:\/\/offline\.bharatephemeris\.com\/[^"]*">/g, ''), /https?:\/\//, 'no outside URL in the page');
  assert.doesNotMatch(js, /https?:\/\//, 'no outside URL in the page script');
  for (const f of ['vedha.html', ...scripts, 'corpus/parampara/registry.json', 'corpus/parampara/samskara.json', 'corpus/surya-siddhanta/yogatara.json']) {
    assert.ok(sw.includes(`"./${f}"`), `sw.js precaches ${f}`);
    assert.ok(fs.existsSync(path.join(root, f)), `${f} exists`);
  }
  console.log('PASS the files: the loading contract in order, the strict CSP, no inline script, no foreign theory, labels not typed, no outside URL, sw.js precache');

  const server = http.createServer((req, res) => {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const file = path.resolve(root, '.' + pathname);
    if (!file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
    const type = { '.js': 'text/javascript', '.css': 'text/css', '.html': 'text/html', '.json': 'application/json', '.svg': 'image/svg+xml' }[path.extname(file)];
    fs.readFile(file, (error, data) => { if (error) res.writeHead(404).end(); else { res.setHeader('Content-Type', type || 'application/octet-stream'); res.end(data); } });
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  let browser;
  const outside = [];
  try {
    browser = await chromium.launch({ headless: true, executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || undefined });
    const context = await browser.newContext({ acceptDownloads: true });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
    await page.addInitScript(() => { document.addEventListener('securitypolicyviolation', (e) => { window.__csp = (window.__csp || []).concat(`${e.violatedDirective} ${e.blockedURI}`); }); });
    await page.route('**/*', (route) => { const u = new URL(route.request().url()); if (u.hostname === '127.0.0.1') return route.continue(); outside.push(u.href); return route.abort(); });
    const base = `http://127.0.0.1:${server.address().port}`;
    await page.goto(base + '/vedha.html');
    await page.waitForFunction(() => document.body.dataset.ready === '1', null, { timeout: 120000 });
    console.log('PASS loads offline with the sovereign modules, the paramparā record and the star catalogue');
    const text = async (sel) => (await page.locator(sel).textContent()).replace(/\s+/g, ' ');
    const predict = async (day) => {
      await page.evaluate(() => { document.getElementById('pred').textContent = ''; });
      await page.fill('#day', day); await page.click('#btn-predict');
      await page.waitForFunction(() => document.getElementById('pred').textContent.length > 0, null, { timeout: 120000 }); await page.waitForTimeout(100);
    };
    const setTier = async (id) => { await page.check(`#moon-tier input[name="moon-tier"][value="${id}"]`); await page.waitForTimeout(200); };

    // observation is optional: the page says so, nothing on it says otherwise, and it predicts with no ledger at all
    assert.match(await page.locator('#optional').textContent(), /Observation is optional\..*complete without it/s);
    const words = (await page.locator('main').innerText()).split(/(?<=[.!?।])\s+/);
    for (const s of words) if (/observ|measur|record|ledger/i.test(s)) assert.doesNotMatch(s, /\b(?:required|requires?|mandatory|necessary|must observe|needs? (?:your |an |the )?observations?)\b/i, s);
    assert.equal(await page.evaluate(() => localStorage.getItem('bharat.vedha-lekha/1')), null, 'no ledger yet');
    assert.match(await page.locator('#pred').textContent(), /Noon shadow/);
    console.log('PASS the page says observation is optional, nothing on it says it is required, and it predicts with no ledger');

    // ── the Moon's three choices ─────────────────────────────────────────────────────────────────────────────────────
    assert.deepEqual(await page.$$eval('#moon-tier input[name="moon-tier"]', (xs) => xs.map((x) => x.value)), M.TIER_IDS);
    const pick = await text('#moon-tier');
    for (const id of M.TIER_IDS) assert.ok(pick.includes(TIERS[id].labelSa) && pick.includes(TIERS[id].label), `the choice ${id} named by M.TIERS`);
    assert.equal(await page.inputValue('#moon-tier input:checked'), 'ss+parameshvara', 'the default is Sūrya-Siddhānta + Parameśvara\'s saṃskāra');
    assert.ok((await text('#moon-tier-note')).includes(ST.label(SAM).caption), 'the saṃskāra\'s caption is the record\'s');
    const ms = { latitude: 23.18, deshantara: 0, palabha: V.placeOf({ latitude: 23.18, deshantara: 0 }, 12).palabha };
    await page.fill('#site-name', 'Ujjayinī test'); await page.fill('#site-lat', '23.18'); await page.fill('#site-desh', '0');
    await page.click('#btn-plan');
    const crescentBy = { ss: (N) => V.predictCrescent(N, 'pashcima', ms),
      'ss+parameshvara': (N) => { const m = Dr.withPanchanga(ST.calendar(SAM), ST.utsava(SAM)).moonAtSunset(N, ms, {}); return m.half !== 'shukla' ? { kalamsa: null, seen: false } : { kalamsa: m.kalamsa, seen: m.kalamsa >= UD.DARSHANA_KALAMSA }; } };
    const placesBy = { ss: (t) => S.sphutaAtDays(t), 'ss+parameshvara': (t) => ST.places(t, SAM) };
    for (const id of ['ss+parameshvara', 'ss']) {
      await setTier(id);
      // the crescent evenings: the conjunction of 2026-10-10 and the evenings after it, at this place
      for (const day of ['2026-10-10', '2026-10-11', '2026-10-12', '2026-10-13']) {
        await predict(day);
        const c = crescentBy[id](kaliOf(day)), t = await text('#pred');
        if (c.kalamsa === null) assert.match(t, /not yet past the Sun/, `${id} ${day}`);
        else { assert.ok(t.includes(`${c.kalamsa.toFixed(2)} kālāṃśa`), `${id} ${day}: ${c.kalamsa.toFixed(2)}`); assert.ok(t.includes(`the text says ${c.seen ? 'seen' : 'not seen'}`), `${id} ${day}: verdict`); }
        assert.ok(t.includes(TIERS[id].label), `${id} ${day}: the prediction names its choice`);
      }
      if (id === 'ss') for (const [day, re] of [['2026-10-10', /not yet past the Sun|not seen/], ['2026-10-11', /not seen/], ['2026-10-12', /the text says seen/]]) {
        await predict(day); assert.match(await text('#pred'), re, `the plain text on ${day}`);
      }
      // the Moon on a junction star, as this test's own computation on the choice's places gives it (and vedha-lekha.js for the plain text)
      await predict('2026-10-08');
      const N = kaliOf('2026-10-08'), t = await text('#pred');
      const ys = STARS.map((s) => ({ s, a: yuti(placesBy[id], N, s, ms) })).filter((x) => x.a !== null);
      assert.ok(ys.length >= 1, 'the Moon meets a junction star that day');
      for (const x of ys) assert.ok(t.includes(`${x.s.name} at ${kapStr(x.a)}`), `${id}: ${x.s.name} at ${kapStr(x.a)}`);
      if (id === 'ss') for (const x of ys) assert.equal(kapStr(V.predictYuti(N, x.s, ms).sinceSunriseAsus), kapStr(x.a), 'the plain text\'s is vedha-lekha.js\'s');
      assert.equal(await page.locator(`#tl-ganita details.tl[data-tier="${id}"]`).count(), 1, `${id}: the labels`);
      const tl = await page.locator('#tl-ganita details.tl').textContent();
      for (const k of ['label', 'engine', 'sunrise', 'dayBoundary', 'month', 'provenance']) assert.ok(tl.includes(TIERS[id][k]), `${id}: the label ${k} from M.TIERS`);
      // the eclipses of the choice
      const E = await page.locator(`#ecl tr[data-tier="${id}"]`).count();
      if (id === 'ss') {
        const list = G.eclipsesBetween(N, N + 400, ms).filter((x) => x.kind === 'lunar' || !x.horizon || Object.values(x.horizon).some((h) => h && h.above));
        assert.equal(E, list.reduce((n, x) => n + V.CONTACTS.filter((c) => x.contacts[c] !== null && x.contacts[c] !== undefined).length, 0), 'ss: one row per contact of ss-grahana.js');
      } else assert.ok(E > 0 || /no eclipse/.test(await text('#ecl')), `${id}: the saṃskāra's eclipses`);
      assert.ok((await text('#ecl-caveat')).length > 20 && (await text('#ecl-tier')).includes(TIERS[id].label));
      console.log(`PASS ${id}: the crescent evenings of 2026-10-10…13 and ${ys.length} junction star(s) on 2026-10-08 as computed here on the choice's places; its eclipses (${E} rows); its labels`);
    }
    // a day at ±49,000 years in the default choice
    await setTier('ss+parameshvara');
    for (const day of ['-49000-06-01', '49000-06-01']) {
      await predict(day);
      const N = kaliOf(day), L = ST.calendar(SAM).limbsAt(V.sunriseAt(N, ms)), tn = P.tithiName(L.tithi);
      const t = await text('#pred');
      assert.ok(t.includes(`Kali day ${N}`) && t.includes(`${tn.paksha} ${tn.name}`) && t.includes(P.NAKSHATRA[L.nakshatra - 1]), `${day}: the tithi and nakṣatra at sunrise`);
      assert.match(t, /Noon shadow/);
      assert.ok((await text('#day-help')).includes(`astronomical year ${day.startsWith('-') ? -49000 : 49000}`));
      console.log(`PASS ${day}: Kali day ${N}, ${tn.paksha} ${tn.name}, ${P.NAKSHATRA[L.nakshatra - 1]} in the default choice`);
    }
    // Modern Bhāratīya (dṛk): the eclipses of its own series; the crescent and the junction stars not computed, and said so
    await setTier('drik');
    await predict('2026-10-08');
    {
      const t = await text('#pred'), N = kaliOf('2026-10-08');
      assert.equal(await page.locator('#drik-moon-note').count(), 1, 'dṛk: the crescent and the junction stars are not computed, and the page says why');
      assert.doesNotMatch(t, /The Moon on a junction star/);
      assert.match(t, /the dṛk choice's own sunrise/);
      const lon = 75.7885, tz = lon / 15, d = M.tierDay(N + 588465.5 - tz / 24 + 0.5, 23.18, lon, tz, 'drik'), s = SD.sunMoon(d.sunriseJd);
      const tn = P.tithiName(Math.floor(mod(s.elongation, 360) / 12) + 1);
      assert.ok(t.includes(`${tn.paksha} ${tn.name}`), 'dṛk: the tithi at the series\' sunrise');
      const j0 = N + 588465.5 - tz / 24, ecl = SD.eclipses(j0, j0 + 400, { latitude: 23.18, longitude: lon });
      const rows = ecl.reduce((n, x) => n + (x.kind === 'lunar' ? ['U1', 'U2', 'U3', 'U4'].filter((c) => x.contacts[c]).length : x.local && x.local.eclipsed ? ['C1', 'C2', 'C3', 'C4'].filter((c) => x.local.contacts[c]).length : 0), 0);
      assert.equal(await page.locator('#ecl tr[data-tier="drik"]').count(), rows, 'dṛk: one row per contact of drik-grahana.js');
      // a penumbral-only lunar eclipse has no umbral contact and no grāsa: it is named, never with a negative grāsa
      const pen = ecl.filter((x) => x.kind === 'lunar' && !(x.umbralMagnitude > 0));
      assert.ok(pen.length >= 1, 'the window holds a penumbral eclipse (2027-02-20), the test\'s own premise');
      const pt = await text('#ecl-penumbral');
      for (const x of pen) assert.ok(pt.includes(`penumbral magnitude ${x.penumbralMagnitude.toFixed(2)}`), `penumbral ${x.penumbralMagnitude.toFixed(2)}`);
      assert.doesNotMatch(await text('#ecl'), /magnitude [−-]\d/, 'no negative magnitude');
      assert.equal(await page.locator('#tl-ganita details.tl[data-tier="drik"]').count(), 1);
      assert.ok((await page.locator('#tl-ganita details.tl').textContent()).includes(TIERS.drik.span.accuracyMeasured), 'dṛk: the measured figures, as M.TIERS states them');
      console.log(`PASS dṛk: ${tn.paksha} ${tn.name} at its own sunrise; ${rows} eclipse contact row(s) from drik-grahana.js; the crescent and the junction stars said not computed`);
    }
    await predict('1800-03-01');
    assert.equal(await page.locator('#pred .refusal[data-refused="drik"]').count(), 1, 'dṛk: 1800 refused in the predictions');
    assert.equal(await page.locator('#ecl .refusal[data-refused="drik"]').count(), 1, 'dṛk: 1800 refused in the eclipses');
    assert.match(await text('#ecl .refusal'), /1850\.0–2150\.0/);
    assert.match(await text('#pred'), /Noon shadow/, 'the text\'s Sun still serves 1800');
    await page.locator('#pred [data-use-tier="ss+parameshvara"]').click();
    await page.waitForFunction(() => document.querySelector('#moon-tier input:checked').value === 'ss+parameshvara', null, { timeout: 60000 });
    await page.waitForTimeout(300);
    assert.equal(await page.locator('#pred .refusal').count(), 0, 'one click back to the default choice serves 1800');
    assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('bharat-ephemeris-yantra-state-v1')).tier), 'ss+parameshvara', 'the choice is the shared one');
    console.log('PASS dṛk refuses 1800 with M.TierSpanError\'s message and offers the two text choices; one click serves it in the default');

    // a day the page cannot read: the last day's predictions are cleared (and cannot be written into a ledger), the reason
    // is said; a good day brings them back
    for (const [bad, re] of [['2026-02-30', /does not exist in the Gregorian calendar/], ['2026-13-01', /month 13 is not 1–12/], ['60000-01-01', /outside -50000 … 50000/], ['8 Oct 2026', /write YYYY-MM-DD/]]) {
      await predict(bad);
      assert.match(await text('#msg'), re, `${bad}: the reason`);
      for (const id of ['pred', 'pred-yantra', 'ecl']) assert.equal(await page.locator(`#${id} .not-computed`).count(), 1, `${bad}: #${id} cleared`);
      assert.doesNotMatch(await text('#pred'), /Noon shadow|Kali day/, `${bad}: nothing from the last day stays`);
      assert.equal(await page.locator('#tl-ganita details.tl[data-tier="ss+parameshvara"]').count(), 1, `${bad}: the labels still name the choice`);
    }
    await page.click('#btn-seal');
    await page.waitForFunction(() => /Predict a day first/.test(document.getElementById('msg').textContent), null, { timeout: 20000 });
    await predict('2026-10-08');
    assert.equal(await page.locator('#pred .not-computed').count(), 0);
    assert.match(await text('#pred'), /Noon shadow/);
    console.log('PASS an unreadable day clears the predictions, the instruments and the eclipses and says why; nothing stale can be written into a ledger; a good day brings them back');

    // ── the ledger ──────────────────────────────────────────────────────────────────────────────────────────────────
    // a day ahead, so that its predictions can be written before it
    const d = new Date(); d.setDate(d.getDate() + 1);
    const tomorrow = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    await predict(tomorrow);
    const pred = await page.locator('#pred').textContent();
    assert.match(pred, /Noon shadow/); assert.match(pred, /घ/);
    assert.match(await page.locator('#ecl').textContent(), /contact|no eclipse|sparsha/);
    console.log('PASS predicts the noon shadow, tonight\'s meridian stars, the Moon and the year\'s eclipses in the default choice');

    await page.click('#btn-start');
    assert.match(await page.locator('#chain').textContent(), /0 entries · chain whole/);
    await page.click('#btn-seal');
    assert.match(await page.locator('#msg').textContent(), /written into the ledger before the night/);
    const sealed = await page.evaluate(() => JSON.parse(localStorage.getItem('bharat.vedha-lekha/1')).entries.map((e) => e.record));
    const nPred = sealed.length;
    assert.ok(nPred >= 1);
    for (const r of sealed.filter((x) => /^candra-/.test(x.for))) { assert.match(r.id, /-parameshvara$/, `${r.id}: the saṃskāra's own id`); assert.ok(r.model.includes(TIERS['ss+parameshvara'].label), `${r.id}: names its choice`); }
    for (const r of sealed.filter((x) => !/^candra-/.test(x.for))) assert.doesNotMatch(r.id, /parameshvara/, `${r.id}: the Sun and the stars are the text's`);
    console.log(`PASS writes ${nPred} predictions first (the Moon's named by their choice)`);

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
    assert.match(await page.locator('#antara-note').textContent(), /plain Sūrya-Siddhānta/);
    console.log('PASS records, refuses a modern clock in a note, and gives the antara against the plain text');

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
    // the frame kinds (vedha-lekha.js → dhruva.js), written through the form — SYNTHETIC: readings made from a chosen sky
    // whose answer is known (the line 7′17″ east of true north, the star 40′ either side of it; ε 23°26′15″ at 23°10′48″)
    await page.fill('#day', todayStr); await page.click('#btn-predict');
    const before = { pred: await page.locator('#pred').textContent(), yantra: await page.locator('#pred-yantra').textContent(), site: await page.locator('#site-state').textContent() };
    const ymd = (x) => `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`;
    const yest = new Date(); yest.setDate(yest.getDate() - 1);
    let sy = now.getFullYear(); if (now < new Date(sy, 5, 22)) sy--;
    const karkaDay = `${sy}-06-21`, makaraDay = `${sy - 1}-12-21`;
    const arc3 = async (p, dd, m, s) => { await page.fill(`[data-f="${p}-a"]`, String(dd)); await page.fill(`[data-f="${p}-k"]`, String(m)); await page.fill(`[data-f="${p}-v"]`, String(s)); };
    const STAR = 'Dhruva<img src=x onerror=window.__x2=1>';                      // markup in a name must stay text
    await page.selectOption('#rec-kind', 'uttara-rekha');
    assert.equal(await page.locator('#rec-day-label').isHidden(), true, 'a frame record carries its readings\' own days');
    assert.equal(await page.getAttribute('[data-f="e-day"]', 'inputmode'), 'text', 'the frame days go through the page\'s one signed parser');
    await page.fill('[data-f="star"]', STAR);
    await page.fill('[data-f="e-day"]', ymd(yest)); await arc3('e', 0, 32, 43); await page.selectOption('[data-f="e-side"]', 'purva');
    await page.fill('[data-f="w-day"]', ymd(yest)); await arc3('w', 0, 47, 17); await page.selectOption('[data-f="w-side"]', 'pashcima');
    await page.click('#btn-record');
    assert.match(await page.locator('#msg').textContent(), /sigma is needed/, 'no σ: refused with its reason');
    await arc3('s', 0, 0, 10);
    await page.selectOption('[data-f="e-side"]', 'pashcima'); await page.selectOption('[data-f="w-side"]', 'purva');
    await page.click('#btn-record');
    assert.match(await page.locator('#msg').textContent(), /must lie east of the western one/, 'the sides swapped: refused before dhruva.js sees them');
    await page.selectOption('[data-f="e-side"]', 'purva'); await page.selectOption('[data-f="w-side"]', 'pashcima');
    await page.click('#btn-record');
    assert.match(await page.locator('#msg').textContent(), /Written: uttara-rekha-/);
    await page.selectOption('#rec-kind', 'ayananta-yugma');
    assert.match(await page.locator('#text-epsilon').textContent(), /The text's ε, in use: arc of 1397\/3438 = 23° 58′ 30\.65″ \(SS 2\.28\)/);
    await page.fill('[data-f="k-day"]', karkaDay);
    await page.click('#btn-record');
    assert.match(await page.locator('#msg').textContent(), /Give the Sun's zenith distance at the karka noon/, 'a blank reading is not taken as zero');
    await arc3('k', 0, 15, 27); await page.selectOption('[data-f="k-disha"]', 'N');
    await page.fill('[data-f="m-day"]', makaraDay); await arc3('m', 46, 37, 3); await page.selectOption('[data-f="m-disha"]', 'N');
    await arc3('s', 0, 0, 10);
    await page.click('#btn-record');
    assert.match(await page.locator('#msg').textContent(), /at the makara noon the Sun must stand further south than at the karka noon/);
    await page.selectOption('[data-f="m-disha"]', 'S');
    await page.click('#btn-record');
    assert.match(await page.locator('#msg').textContent(), /Written: ayananta-yugma-/);
    const keptF = V.fromJSON(await page.evaluate(() => localStorage.getItem('bharat.vedha-lekha/1')));
    assert.equal(keptF.entries.length, nPred + 6);
    const certF = V.certify(keptF);
    assert.ok(certF.ok, JSON.stringify(certF.reasons));
    const redF = V.reduce(keptF);
    const nl = redF.records.find((r) => r.kind === 'uttara-rekha'), sp = redF.records.find((r) => r.kind === 'ayananta-yugma');
    assert.deepEqual([nl.star, nl.trueNorth.vikala, nl.trueNorth.side, nl.applied], [STAR, -437, 'pashcima', false]);
    assert.deepEqual([sp.epsilon.vikala, sp.latitude.vikala, sp.text.epsilon, sp.text.source, sp.applied], [84375, 83448, 'arc of 1397/3438', 'SS 2.28', false]);
    await page.click('#btn-reduce');
    const fp = await page.locator('#frame-preview').textContent();
    for (const re of [/Preview — measured, not applied/, /true north.*Dhruva<img src=x onerror=window\.__x2=1>.*0° 7′ 17″ west \(paścima\) of your line ± 7\.1″/s,
      /ε, the greatest declination.*23° 26′ 15″ ± 7\.1″.*arc of 1397\/3438 = 23° 58′ 30\.65″.*SS 2\.28: the default, in use.*−0° 32′ 15\.65″/s,
      /latitude.*23° 10′ 48″ north ± 7\.1″.*23° 10′ 48\.00″ north \(the ledger's place, as you gave it\)/s,
      /nothing measured is applied or replaces a constant/, /geometric/, /Refraction does not cancel in these readings/]) assert.match(fp, re);
    assert.equal(await page.evaluate(() => window.__x2), undefined, 'the star\'s name stayed text');
    // nothing is applied: the day's predictions, the instruments' and the place are what they were
    await page.click('#btn-predict');
    assert.deepEqual({ pred: await page.locator('#pred').textContent(), yantra: await page.locator('#pred-yantra').textContent(), site: await page.locator('#site-state').textContent() }, before);
    assert.equal(await page.inputValue('#site-lat'), '23.18');
    console.log('PASS writes a north line and a solstice pair through the form (refusing a missing σ and swapped readings), certified; the antara previews true north, ε and the latitude beside the text\'s ε (SS 2.28) and the ledger\'s place, and applies nothing');

    assert.deepEqual(await page.evaluate(() => window.__csp || []), [], 'no CSP violation');

    // a link with a bad choice, at 390 px: the default used and said, nothing stored, no horizontal overflow in any choice
    const fresh = async (opts, route) => {
      const c = await browser.newContext(opts), p = await c.newPage();
      p.on('pageerror', (e) => errors.push(e.message));
      p.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
      await p.route('**/*', (r) => { const u = new URL(r.request().url()); if (u.hostname !== '127.0.0.1') { outside.push(u.href); return r.abort(); } return route ? route(r, u) : r.continue(); });
      return { c, p };
    };
    {
      const { c, p } = await fresh({ viewport: { width: 390, height: 844 }, colorScheme: 'light' });
      await p.goto(base + '/vedha.html?tier=bogus');
      await p.waitForFunction(() => document.body.dataset.ready === '1', null, { timeout: 120000 });
      assert.equal(await p.inputValue('#moon-tier input:checked'), 'ss+parameshvara', 'a bad link shows the default');
      assert.match(await p.locator('#moon-tier-note').textContent(), /not one of the choices/);
      assert.equal(await p.evaluate(() => JSON.parse(localStorage.getItem('bharat-ephemeris-yantra-state-v1') || '{}').tier || ''), '', 'the bad choice is not stored');
      const over = () => p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      for (const id of ['ss+parameshvara', 'ss', 'drik']) {
        await p.evaluate(() => { document.getElementById('pred').textContent = ''; });
        if (id !== 'ss+parameshvara') await p.check(`#moon-tier input[value="${id}"]`); else await p.click('#btn-predict');
        await p.waitForFunction(() => document.getElementById('pred').textContent.length > 0, null, { timeout: 120000 });
        await p.locator('#tl-ganita details').evaluate((d) => { d.open = true; });
        assert.ok(await over() <= 0, `${id}: no horizontal overflow at 390 px`);
      }
      await c.close();
    }
    // the paramparā record unreadable: the default choice says so and the page stays usable; the plain text predicts
    {
      const { c, p } = await fresh({ viewport: { width: 1280, height: 900 } }, (r, u) => (/corpus\/parampara\//.test(u.pathname) ? r.fulfill({ status: 200, contentType: 'application/json', body: 'not the record' }) : r.continue()));
      await p.goto(base + '/vedha.html');
      await p.waitForFunction(() => document.body.dataset.ready === '1', null, { timeout: 120000 });
      assert.equal(await p.evaluate(() => document.body.dataset.parampara), 'unavailable');
      assert.match(await p.locator('#msg').textContent(), /needs the paramparā record/);
      assert.equal(await p.locator('#pred .not-computed').count(), 1, 'no prediction in the default choice');
      await p.evaluate(() => { document.getElementById('pred').textContent = ''; });
      await p.check('#moon-tier input[value="ss"]');
      await p.waitForFunction(() => document.getElementById('pred').textContent.length > 0, null, { timeout: 120000 });
      assert.match(await p.locator('#pred').textContent(), /Noon shadow/);
      assert.match(await p.locator('#pred').textContent(), /Sūrya-Siddhānta/);
      await c.close();
    }
    console.log('PASS a bad ?tier= link uses the default and stores nothing; 390 px with no horizontal overflow in the three choices; without the paramparā record the default says so and the plain text predicts');

    assert.deepEqual(errors, []);
    assert.deepEqual(outside, [], 'no request left the local server');
    console.log('PASS no page errors, no CSP violation, and no request outside the local server');
  } finally {
    if (browser) await browser.close();
    server.close();
  }
})().catch((e) => { console.error(e); process.exit(1); });
