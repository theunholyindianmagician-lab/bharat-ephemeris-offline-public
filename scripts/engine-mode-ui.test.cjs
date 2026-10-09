'use strict';
/* engine-mode-ui.test.cjs — the ShunyaBheda page (shunyabheda.html + shunyabheda-app.js) on the three tiers
 * (owner, 2026-10-08): 'ss+parameshvara' (the default), 'ss' and 'drik', one code path each, through math-core's tier
 * API. The page is driven in Chromium with every outside request blocked, and each value it shows is compared with
 * math-core computing the same thing in Node:
 *   - the tier select offers exactly M.TIER_IDS with M.TIERS' labels; the default is the page default;
 *   - for every tier: the planet rows, speeds and pañcāṅga of the API studio equal M.*; the ayanāṃśa shown is the
 *     ayanāṃśa applied (M.tierAyanamsha, and sāyana − nirayana lagna); every computed block carries its tier's labels;
 *     the Findings and Shodhana headers match their rows;
 *   - one signed date parser: −50000-01-01, 0050-03-01, 1500-03-20 (Julian and Gregorian), 50000-12-31 compute in a
 *     text tier with no NaN/Infinity/undefined; the gochara and muhūrta dates take −50000 too;
 *   - deep time: a text-tier date at −49,000 and at +49,000 renders without error in reasonable time;
 *   - the dṛk tier in 1700 (and at 50000) is refused with the message, the outputs are cleared and the text tiers offered;
 *   - an invalid date after a valid one leaves no stale value; the muhūrta rows are the same by render and by button;
 *   - the tier, date and calendar survive a reload; ?tier=bogus is reported, not stored; ?engineMode= migrates;
 *   - no page error and no console error; no foreign theory is loaded (static and runtime checks);
 *   - static source check: every tier-taking math-core call in shunyabheda-app.js passes the tier, and every
 *     panchangAtJd call a site.
 * Render times per tier are printed, not asserted (except the deep-time bound). */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { chromium } = require('playwright');
const M = require('../math-core.js');
const root = path.resolve(__dirname, '..');
const read = (f) => fs.readFileSync(path.join(root, f), 'utf8');

// ── static checks (no browser) ─────────────────────────────────────────────────────────────────────────────────────
function staticChecks() {
  const html = read('shunyabheda.html');
  const srcs = [...html.matchAll(/<script[^>]*\ssrc="([^"?]+)(?:\?[^"]*)?"/g)].map((m) => m[1]);
  for (const foreign of ['vsop87-full.js', 'elp-moon.js', 'drik-engine.js', 'drik-tier.js', 'precision-ephemeris.js']) {
    assert.equal(srcs.includes(foreign), false, `shunyabheda.html must not load the referee ${foreign}`);
  }
  const at = (f) => { const i = srcs.indexOf(f); assert.ok(i >= 0, `shunyabheda.html loads ${f}`); return i; };
  const sovereign = ['katapayadi.js', 'kala-dvara.js', 'parahita-madhyama.js', 'sphuta.js', 'dhruva.js', 'ss-udaya.js', 'spanda-ganita.js', 'ss-graha.js',
    'ss-chaya.js', 'ss-grahana.js', 'ss-ahargana.js', 'panchanga.js', 'utsava.js', 'ss-drishya.js', 'dasha.js', 'muhurta.js', 'yantra.js', 'vedha-lekha.js', 'samskara.js'];
  for (const f of [...sovereign, 'parampara.js']) assert.ok(at(f) < at('ss-tier.js'), `${f} loads before ss-tier.js`);
  assert.ok(at('ss-tier.js') < at('math-core.js'), 'ss-tier.js loads before math-core.js');
  assert.ok(at('math-core.js') < at('siddhanta-drik.js') && at('siddhanta-drik.js') < at('siddhanta-tier.js') && at('siddhanta-tier.js') < at('drik-grahana.js'),
    'the dṛk tier: siddhanta-drik.js, siddhanta-tier.js, drik-grahana.js after math-core.js');
  assert.ok(at('drik-grahana.js') < at('shunyabheda-app.js'), 'the page script loads last');
  for (const id of ['date', 'gochara-date', 'muhurta-start-date']) {
    const tag = html.match(new RegExp(`<input[^>]*id="${id}"[^>]*>`));
    assert.ok(tag, `#${id} exists`);
    assert.match(tag[0], /type="text"/, `#${id} is a text field (one signed parser, not type=date)`);
    assert.match(tag[0], /inputmode="text"/, `#${id} has inputmode=text (a phone keypad may lack the minus key)`);
  }
  assert.doesNotMatch(html, /id="engine-mode"|value="calibrated"/, 'the retired engine-mode select is gone');

  const src = read('shunyabheda-app.js');
  assert.doesNotMatch(src, /DrikTier|drigCoordinates|Astronomy\.|computePrecisionChart|KaalPrecisionEphemeris|ShunyaVsop87|ShunyaElp|localSiderealTimeDeg|tropicalAscendantDeg|gregorianToJulianDay/,
    'the page computes nothing from a vendored foreign theory or a frame outside the tiers');
  assert.doesNotMatch(src, /M\.(ayanamshaDeg|coordinateFrameOffsetDeg|vimshottariAtJd)\(/, 'the ayanāṃśa and the daśā come through the tier API');
  assert.doesNotMatch(src, /["'](spica_lahiri|effective_49|linear_54|linear_50|sinusoidal_27|calibrated)["']/, 'no named ayanāṃśa or retired mode in the page');
  assert.doesNotMatch(src, /catch \(e\) \{\s*\/\* fallback \*\/\s*\}/, 'no silent fallback catch');

  // every tier-taking call passes the tier at its place; panchangAtJd also a site
  const TIER_ARG = { siderealAscendantDeg: 3, sayanaAscendantDeg: 3, tierMeridian: 3, bhavaModel: 3, solarRiseSet: 4, lunarRiseSet: 4, panchangAtJd: 2,
    panchangExtended: 4, tierDay: 4, scanAuspiciousMuhurtas: 6, computeSpecialLagnas: 7, computeUpagrahas: 5, computeBirthDoshasAndShanti: 7,
    computeSuryaSiddhanta14Adhikaras: 6, vimshottariTier: 2, tierAyanamsha: 1, tierGrahaRows: 1 };
  const MODE_ARG = { computePlanetaryVelocities: 1, sphutaGrahaModel: 1, canonicalGrahaModel: 1 };
  const argsAt = (s, i) => {                       // the top-level arguments of the call whose '(' is at s[i - 1]
    const out = []; let depth = 0, cur = '', q = null;
    for (; i < s.length; i++) {
      const c = s[i];
      if (q) { cur += c; if (c === '\\') { cur += s[++i]; continue; } if (c === q) q = null; continue; }
      if (c === '"' || c === "'" || c === '`') { q = c; cur += c; continue; }
      if ('([{'.includes(c)) depth++;
      if (')]}'.includes(c)) { if (depth === 0) { out.push(cur.trim()); return out; } depth--; }
      if (c === ',' && depth === 0) { out.push(cur.trim()); cur = ''; continue; }
      cur += c;
    }
    throw new Error('unbalanced call');
  };
  let checked = 0;
  for (const m of src.matchAll(/\bM\.(\w+)\(/g)) {
    const name = m[1], args = argsAt(src, m.index + m[0].length), where = `shunyabheda-app.js M.${name}(${args.join(', ')})`;
    if (Object.prototype.hasOwnProperty.call(TIER_ARG, name)) {
      assert.equal(args[TIER_ARG[name]], 'tier', `${where}: the tier must be passed as argument ${TIER_ARG[name] + 1}`);
      if (name === 'panchangAtJd') assert.ok(args[3] === 'site' || /latitude/.test(args[3] || '') && /longitude/.test(args[3] || ''), `${where}: panchangAtJd needs the page's site`);
      checked++;
    }
    if (Object.prototype.hasOwnProperty.call(MODE_ARG, name)) {
      assert.match(args[MODE_ARG[name]] || '', /^\{\s*mode:\s*tier\s*\}$/, `${where}: the tier must be passed as { mode: tier }`);
      checked++;
    }
  }
  assert.ok(checked >= 20, `static check saw ${checked} tier-taking calls`);
  console.log(`PASS static: script order and no referee on the page; ${checked} tier-taking calls all pass the tier (and panchangAtJd a site)`);
}

// ── the browser checks ─────────────────────────────────────────────────────────────────────────────────────────────
const DONE = /COMPUTATION COMPLETE|ERROR|REFUSED|NOT COMPUTED/;
async function settle(page, action) {
  await page.evaluate(() => { document.querySelector('#status').textContent = 'pending'; });
  if (action) await action();
  await page.waitForFunction((re) => new RegExp(re).test(document.querySelector('#status').textContent), DONE.source, { timeout: 90000 });
  return page.locator('#status').textContent();
}
async function setDate(page, date, extra = {}) {
  return settle(page, async () => {
    if (extra.calendar) await page.locator('#calendar').selectOption(extra.calendar);
    if (extra.tier) await page.locator('#tier').selectOption(extra.tier);
    await page.locator('#date').fill(date);
    if (extra.time) await page.locator('#time').fill(extra.time);
    await page.evaluate(() => { document.querySelector('#status').textContent = 'pending'; });
    await page.locator('#compute').click();
  });
}
// textContent, not innerText: the collapsed panels count too. The one static sentence that names 0/0 "undefined" is not
// a computed value and is taken out first.
const mainText = (page) => page.evaluate(() => document.querySelector('main').textContent.replace('modern mathematics leaves 0/0 undefined', ''));
function assertClean(text, where) {
  const bad = text.match(/.{0,60}\b(NaN|Infinity|undefined)\b.{0,30}/);
  assert.equal(bad, null, `${where}: the page shows ${bad && JSON.stringify(bad[0])}`);
}

(async () => {
  staticChecks();
  const server = http.createServer((req, res) => {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const file = path.resolve(root, '.' + pathname);
    if (!file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
    const type = { '.js': 'text/javascript', '.css': 'text/css', '.html': 'text/html; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml' }[path.extname(file)];
    fs.readFile(file, (error, data) => { if (error) res.writeHead(404).end(); else { res.setHeader('Content-Type', type || 'application/octet-stream'); res.end(data); } });
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  let browser;
  try {
    browser = await chromium.launch({ headless: true, executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || undefined });
    const page = await browser.newPage();
    const errors = [], consoleErrors = [], foreignRequests = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()); });
    // Prove the served application works without external network resources.
    await page.route('**/*', (route) => {
      const u = new URL(route.request().url());
      if (u.hostname !== '127.0.0.1') { foreignRequests.push(u.href); return route.abort(); }
      return route.continue();
    });
    const base = `http://127.0.0.1:${server.address().port}`;

    // 1. the default tier and the select
    await page.goto(base + '/shunyabheda.html?date=2026-09-07&time=12:00:00&timezone=2&latitude=42.62&longitude=25.39');
    await page.waitForFunction(() => document.querySelector('#status').textContent.includes('COMPUTATION COMPLETE'), null, { timeout: 90000 });
    assert.equal(await page.locator('#date').inputValue(), '2026-09-07');
    assert.equal(await page.locator('#timezone').inputValue(), '2');
    assert.deepEqual(await page.locator('#tier option').evaluateAll((xs) => xs.map((x) => x.value)), M.TIER_IDS.slice());
    assert.equal(await page.locator('#tier').inputValue(), M.DEFAULT_TIER, 'the page default is the default tier');
    const optionTexts = await page.locator('#tier option').evaluateAll((xs) => xs.map((x) => x.textContent));
    M.TIER_IDS.forEach((id, i) => { assert.ok(optionTexts[i].includes(M.TIERS[id].label) && optionTexts[i].includes(M.TIERS[id].labelSa), `option ${id} carries M.TIERS labels`); });
    const runtime = await page.evaluate(() => ({ DrikTier: typeof window.DrikTier, Vsop: typeof window.ShunyaVsop87, Elp: typeof window.ShunyaElp, Precision: typeof window.KaalPrecisionEphemeris,
      SSTier: typeof window.SSTier, SiddhantaTier: typeof window.SiddhantaTier, DrikGrahana: typeof window.DrikGrahana }));
    assert.deepEqual(runtime, { DrikTier: 'undefined', Vsop: 'undefined', Elp: 'undefined', Precision: 'undefined', SSTier: 'object', SiddhantaTier: 'object', DrikGrahana: 'object' });
    console.log('PASS the tier select is M.TIER_IDS with M.TIERS labels; default', M.DEFAULT_TIER, '; no referee loaded on the page');

    // 2. every tier against math-core
    const civil = { calendar: 'gregorian', year: 2026, month: 9, day: 7 };
    const jd = M.civilToJd(civil, '12:00:00', 2);
    const site = { latitude: 42.62, longitude: 25.39 };
    const tables = {};
    for (const tier of M.TIER_IDS) {
      const t0 = Date.now();
      const status = await settle(page, () => page.locator('#tier').selectOption(tier));
      const ms = Date.now() - t0;
      assert.match(status, /COMPUTATION COMPLETE/, `${tier}: ${status}`);
      assert.ok(status.includes(M.TIERS[tier].label), `${tier}: the status names the tier`);
      await page.locator('#apiMethod').selectOption('sphuta');
      const payload = JSON.parse(await page.locator('#apiResponseViewer').textContent());
      assert.equal(payload.tier, tier);
      for (const g of M.canonicalGrahaModel(jd, { mode: tier })) assert.equal(payload.sphuta[g.en].canonical_deg, Number(g.longitude.toFixed(6)), `${tier} ${g.en} longitude`);
      for (const g of M.computePlanetaryVelocities(jd, { mode: tier })) assert.equal(payload.sphuta[g.en].speed_deg_day, Number(g.speedDegDay.toFixed(6)), `${tier} ${g.en} speed`);
      const ay = M.tierAyanamsha(jd, tier);
      assert.equal(payload.ayanamsa.name, M.TIERS[tier].ayanamsha.name);
      assert.equal(payload.ayanamsa.applied_deg, Number(ay.deg.toFixed(8)));
      // displayed = applied: the readout, and the lagna's sāyana − nirayana
      const shown = await page.evaluate(() => ({ deg: document.querySelector('#ayana-value').dataset.deg, text: document.querySelector('#ayana-value').textContent,
        sayana: Number(document.querySelector('#lagna-value').dataset.sayana), nirayana: Number(document.querySelector('#lagna-value').dataset.nirayana) }));
      assert.equal(shown.deg, String(ay.deg), `${tier}: the ayanāṃśa shown is M.tierAyanamsha`);
      assert.ok(shown.text.includes(ay.name), `${tier}: the ayanāṃśa's name is shown`);
      const diff = (((shown.sayana - shown.nirayana - ay.deg) % 360) + 540) % 360 - 180;
      assert.ok(Math.abs(diff) < 1e-9, `${tier}: sāyana − nirayana lagna (${shown.sayana} − ${shown.nirayana}) = the ayanāṃśa ${ay.deg} (Δ ${diff})`);
      assert.equal(shown.nirayana, M.siderealAscendantDeg(jd, site.latitude, site.longitude, tier), `${tier}: the lagna is the tier's`);
      await page.locator('#apiMethod').selectOption('panchang');
      const pan = JSON.parse(await page.locator('#apiResponseViewer').textContent());
      const ref = M.panchangAtJd(jd, 2, tier, site);
      assert.equal(pan.tier, tier);
      assert.equal(pan.pancha_anga.tithi.index, ref.tithiIndex + 1);
      assert.equal(pan.pancha_anga.nakshatra.index, ref.nakshatraIndex + 1);
      assert.equal(pan.pancha_anga.yoga.index, ref.yogaIndex + 1);
      assert.equal(pan.pancha_anga.karana.index, ref.karanaIndex + 1);
      assert.equal(pan.pancha_anga.vara.index, ref.varaIndex, `${tier}: the vāra is the sunrise vāra at the site`);
      assert.equal(pan.vedic_metrology.ahargana_kali, Number(ref.ahargana.toFixed(4)));
      assert.equal(pan.pancha_anga.karana.order, M.TIERS[tier].karanaOrder);
      // headers match rows; the mean column is the text tiers' own
      const shape = await page.evaluate(() => {
        const rows = [...document.querySelectorAll('#planet-body tr')].map((tr) => [...tr.children].map((c) => c.textContent));
        const shod = [...document.querySelectorAll('#bphs-shodhana-body tr')].map((tr) => [...tr.children].reduce((n, c) => n + (Number(c.getAttribute('colspan')) || 1), 0));
        return { th: document.querySelectorAll('#findings thead th').length, rows, shodTh: document.querySelectorAll('#bphs-advanced table')[2].querySelectorAll('thead th').length, shod };
      });
      assert.equal(shape.th, 6);
      assert.equal(shape.rows.length, 9);
      for (const r of shape.rows) assert.equal(r.length, shape.th, `${tier}: a Findings row has as many cells as the header`);
      for (const r of shape.rows) assert.equal(r[1] === '—', tier === 'drik', `${tier}: the mean column is '—' only for the dṛk tier`);
      assert.equal(shape.shodTh, 14);
      for (const n of shape.shod) assert.equal(n, 14, `${tier}: a Shodhana row spans the 14 columns`);
      // every computed block carries its tier's labels (from M.TIERS)
      const strips = await page.evaluate(() => [...document.querySelectorAll('section.panel')].map((s) => ({ id: s.id, strip: s.querySelector('[data-tier-strip]') }))
        .filter((x) => x.strip).map((x) => ({ id: x.id, tier: x.strip.dataset.tier, text: x.strip.textContent })));
      const want = ['api-studio', 'quant-finance', 'shunyabheda-forensics', 'instrument', 'findings', 'vargas', 'bhavas', 'vimshottari', 'natal-id', 'live-gochara',
        'muhurta-scanner', 'ashtakavarga-yogas', 'bphs-advanced', 'surya-siddhanta-suite', 'sovereign-architecture-suite'];
      for (const id of want) {
        const s = strips.find((x) => x.id === id);
        assert.ok(s, `${tier}: #${id} shows its tier's labels`);
        assert.equal(s.tier, tier, `${tier}: #${id} is labelled with the chosen tier`);
        for (const label of [M.TIERS[tier].label, M.TIERS[tier].ayanamsha.name, M.TIERS[tier].sunrise, M.TIERS[tier].dayBoundary, M.TIERS[tier].karanaOrder, M.TIERS[tier].month, M.TIERS[tier].samvatsara, M.TIERS[tier].provenance]) {
          assert.ok(s.text.includes(label), `${tier}: #${id} carries "${label.slice(0, 40)}…"`);
        }
      }
      const captions = await page.evaluate(() => [...document.querySelectorAll('#findings caption, #bhavas caption, #live-gochara caption, #muhurta-scanner caption, #surya-siddhanta-suite caption')].map((c) => c.textContent));
      for (const c of captions) assert.ok(c.includes(M.TIERS[tier].labelSa), `${tier}: caption names the tier: ${c.slice(0, 60)}`);
      assertClean(await mainText(page), tier);
      tables[tier] = await page.locator('#planet-body').textContent();
      console.log(`PASS ${tier}: planet rows, speeds, ayanāṃśa (displayed = applied), lagna and pañcāṅga equal math-core; labels on every block (render ${ms} ms)`);
    }
    assert.notEqual(tables.ss, tables.drik);
    assert.notEqual(tables['ss+parameshvara'], tables.ss, 'the saṃskāra moves the Moon and the node');

    // 3. near the span's edge the dṛk eclipse search is refused — the whole 14-adhikāra panel, or (math-core's EDGE RULE)
    //    the eclipse block alone — and never reported as "no eclipse"
    assert.match(await setDate(page, '2149-12-25', { tier: 'drik' }), /COMPUTATION COMPLETE/);
    const edgeText = await page.evaluate(() => ['#ss-eclipse-body', '#ss-grahana-status', '#ss-grahana-desc', '#ss-14adhikaras-body'].map((s) => document.querySelector(s).textContent).join(' '));
    assert.doesNotMatch(edgeText, /No (lunar |solar )?eclipse within|NO ECLIPSE/i, 'a refused eclipse search is not "no eclipse"');
    assert.match(edgeText, /refused/);
    //    the dṛk tier refuses outside 1850–2150, plainly, clears the outputs and offers the text tiers
    for (const date of ['1700-03-01', '50000-12-31']) {
      const status = await setDate(page, date, { tier: 'drik' });
      assert.match(status, /REFUSED/, `dṛk ${date}: ${status}`);
      assert.match(status, /1850\.0–2150\.0/);
      const box = await page.evaluate(() => ({ hidden: document.querySelector('#tier-refusal').hidden, text: document.querySelector('#tier-refusal-text').textContent,
        offers: [...document.querySelectorAll('#tier-refusal-actions button')].map((b) => b.dataset.tier),
        jd: document.querySelector('#jd-value').textContent, ay: document.querySelector('#ayana-value').textContent, lagna: document.querySelector('#lagna-value').textContent,
        planets: document.querySelector('#planet-body').textContent }));
      assert.equal(box.hidden, false);
      assert.ok(box.text.includes(M.TIERS.drik.labelSa) && box.text.includes('1850'), box.text);
      assert.deepEqual(box.offers, M.TIER_IDS.filter((id) => M.TIERS[id].family === 'ss'));
      assert.equal(box.jd, '—'); assert.equal(box.ay, '—'); assert.equal(box.lagna, '—');
      assert.doesNotMatch(box.planets, /\d+\.\d+°/, 'no stale planet row under a refusal');
      // no label of the previous computation survives the refusal: captions, the tier help line, the studio's call
      const labels = await page.evaluate(() => ({ caps: [...document.querySelectorAll('caption .cap-tier')].map((c) => c.textContent).filter(Boolean),
        help: document.querySelector('#tier-help').textContent, endpoint: document.querySelector('#apiEndpointUrl').value,
        det: document.querySelector('#badge-determinism').textContent }));
      assert.deepEqual(labels.caps, [], `dṛk ${date}: no caption keeps the previous tier's label`);
      assert.ok(labels.help.includes(M.TIERS.drik.ayanamsha.name), `dṛk ${date}: the help line names the selected tier's ayanāṃśa (${labels.help})`);
      assert.match(labels.endpoint, /"drik"/, `dṛk ${date}: the studio's call names the selected tier`);
      assert.doesNotMatch(labels.det, /PASS/, `dṛk ${date}: no determinism verdict from an earlier computation`);
    }
    const backToText = await settle(page, () => page.locator('#tier-refusal-actions button[data-tier="ss"]').click());
    assert.match(backToText, /COMPUTATION COMPLETE/);
    assert.equal(await page.locator('#tier').inputValue(), 'ss');
    assert.equal(await page.evaluate(() => document.querySelector('#tier-refusal').hidden), true);
    console.log('PASS the dṛk tier refuses 1700 and 50000 with the message, clears the outputs and offers the text tiers');

    // 4. one signed parser: deep and odd dates in the text tiers (Gregorian and Julian), no NaN/Infinity/undefined
    for (const [date, calendar, tier] of [['-50000-01-01', 'gregorian', 'ss'], ['0050-03-01', 'gregorian', 'ss'], ['1500-03-20', 'julian', 'ss'], ['1500-03-20', 'gregorian', 'ss+parameshvara'],
      ['50000-12-31', 'gregorian', 'ss+parameshvara'], ['-3101-01-23', 'julian', 'ss+parameshvara']]) {
      const status = await setDate(page, date, { calendar, tier });
      assert.match(status, /COMPUTATION COMPLETE/, `${date} ${calendar} ${tier}: ${status}`);
      const shown = await page.evaluate(() => ({ jd: document.querySelector('#jd-value').textContent, helper: document.querySelector('#date-helper').textContent }));
      const [, y, mo, d] = /^(-?\d+)-(\d+)-(\d+)$/.exec(date);
      const expectJd = M.civilToJd({ calendar, year: Number(y), month: Number(mo), day: Number(d) }, await page.locator('#time').inputValue() + (/:\d\d:\d\d$/.test(await page.locator('#time').inputValue()) ? '' : ':00'), Number(await page.locator('#timezone').inputValue()));
      assert.equal(shown.jd, expectJd.toFixed(8), `${date} ${calendar}: the JD is kala-dvara's`);
      assert.match(shown.helper, calendar === 'gregorian' ? /Gregorian .* = Julian/ : /Julian .* = Gregorian/, `${date}: the other calendar is shown`);
      if (Number(y) <= 0) assert.ok(shown.helper.includes(`${1 - Number(y)} BCE`), `${date}: the BCE form is shown`);
      assertClean(await mainText(page), `${date} ${calendar} ${tier}`);
    }
    await page.locator('#calendar').selectOption('gregorian');
    // the gochara and muhūrta dates take a deep date through the same parser (their panels open first: they start collapsed)
    await page.evaluate(() => window.toggleAllSections(true));
    await setDate(page, '-49990-06-15', { tier: 'ss' });
    let st = await settle(page, async () => {
      await page.locator('#gochara-date').fill('-50000-01-05');
      await page.locator('#gochara-time').fill('06:00:00');
      await page.locator('#muhurta-start-date').fill('-50000-01-01');
      await page.evaluate(() => { document.querySelector('#status').textContent = 'pending'; });
      await page.locator('#compute').click();
    });
    assert.match(st, /COMPUTATION COMPLETE/, st);
    const deep = await page.evaluate(() => ({ g: document.querySelector('#gochara-jd-value').textContent, gh: document.querySelector('#gochara-date-helper').textContent,
      rows: document.querySelectorAll('#gochara-matrix-body tr').length, mu: document.querySelector('#muhurta-results-count').textContent }));
    assert.equal(deep.rows, 9, 'the gochara matrix is computed at −50000');
    assert.ok(deep.gh.includes('50001 BCE'), deep.gh);
    assert.match(deep.mu, /from -50000-01-01/, deep.mu);
    console.log('PASS one signed parser: −50000, 0050, 1500 (Julian/Gregorian), −3101, 50000 compute; gochara and muhūrta dates take −50000');

    // 5. deep time: a text-tier date at −49,000 and +49,000 renders without error in reasonable time (every panel, the
    //    muhūrta scan following the Instrument's date again, the transit set to the same instant)
    await page.locator('#muhurta-sync-instrument').click();
    for (const date of ['-49000-03-01', '49000-03-01']) {
      await page.locator('#gochara-date').fill(date);
      await page.locator('#gochara-time').fill('12:00:00');
      const t0 = Date.now();
      const status = await setDate(page, date, { tier: M.DEFAULT_TIER });
      const ms = Date.now() - t0, renderMs = Number(await page.evaluate(() => document.body.dataset.renderMs));
      assert.match(status, /COMPUTATION COMPLETE/, `${date}: ${status}`);
      assert.doesNotMatch(status, /not computed in/, `${date}: every panel computed (${status})`);
      assert.match(await page.locator('#muhurta-results-count').textContent(), new RegExp(`from ${date}`), `${date}: the muhūrta scan starts at the Instrument's date`);
      assert.equal(await page.locator('#gochara-matrix-body tr').count(), 9, `${date}: the gochara matrix is computed`);
      assertClean(await mainText(page), date);
      assert.ok(renderMs < 15000, `${date}: render took ${renderMs} ms`);
      console.log(`PASS deep time ${date} (${M.DEFAULT_TIER}): computed in ${renderMs} ms (round trip ${ms} ms)`);
    }

    // 6. an invalid date after a valid one leaves no stale value
    await setDate(page, '2026-10-08', { tier: M.DEFAULT_TIER, time: '06:00:00' });
    st = await setDate(page, '2026-02-30');
    assert.match(st, /ERROR/);
    const stale = await page.evaluate(() => ({ jd: document.querySelector('#jd-value').textContent, ay: document.querySelector('#ayana-value').textContent, lagna: document.querySelector('#lagna-value').textContent,
      vara: document.querySelector('#vara-value').textContent, planets: document.querySelector('#planet-body').textContent, bhava: document.querySelector('#bhavas-body').textContent,
      gochara: document.querySelector('#gochara-matrix-body').textContent, err: document.querySelector('#date-error').textContent }));
    for (const k of ['jd', 'ay', 'lagna', 'vara']) assert.equal(stale[k], '—', `${k} is cleared after a bad date`);
    for (const k of ['planets', 'bhava', 'gochara']) assert.doesNotMatch(stale[k], /\d+\.\d+°|Abs:/, `${k} is cleared after a bad date`);
    assert.match(stale.err, /Invalid Gregorian date/);
    st = await setDate(page, '1e3-01-01');
    assert.match(st, /ERROR/);
    assert.doesNotMatch(await page.locator('#apiCodeSnippet').textContent(), /NaN/, 'the snippet never prints an unparsed date as NaN');
    // an export with a bad input says so on the status line (no file, no uncaught error from the button)
    await page.evaluate(() => { window.exportComputationalJson(); window.exportEphemerisCsv(); });
    assert.match(await page.locator('#status').textContent(), /EXPORT NOT MADE \(CSV\)/);
    console.log('PASS an invalid date clears every output (no stale JD, ayanāṃśa, lagna or table)');

    // 7. the muhūrta rows are the same whatever triggers the scan
    await setDate(page, '2026-10-08', { tier: 'ss' });
    await page.locator('#muhurta-start-date').fill('2026-10-08');
    await page.locator('#muhurta-start-date').dispatchEvent('change');
    const byChange = await page.locator('#muhurta-results-body').textContent();
    await settle(page, async () => { await page.evaluate(() => { document.querySelector('#status').textContent = 'pending'; }); await page.locator('#time').fill('23:00:00'); await page.locator('#compute').click(); });
    const byRender = await page.locator('#muhurta-results-body').textContent();
    await page.locator('#muhurta-scan-btn').click();
    const byButton = await page.locator('#muhurta-results-body').textContent();
    assert.equal(byRender, byButton, 'render and button give the same rows');
    assert.equal(byChange, byButton, 'a different Instrument clock does not change the scan of the same start date');
    assert.match(await page.locator('#muhurta-results-count').textContent(), /from 2026-10-08/);
    console.log('PASS the muhūrta scan gives the same rows by render, by button and at another Instrument clock');

    // 8. tier, date and calendar persist; links migrate; a bogus tier is reported, never stored
    await setDate(page, '1500-03-20', { calendar: 'julian', tier: 'ss' });
    await page.goto(base + '/shunyabheda.html');
    await page.waitForFunction(() => document.querySelector('#status').textContent.includes('COMPUTATION COMPLETE'), null, { timeout: 90000 });
    assert.equal(await page.locator('#tier').inputValue(), 'ss');
    assert.equal(await page.locator('#calendar').inputValue(), 'julian');
    assert.equal(await page.locator('#date').inputValue(), '1500-03-20');
    assert.equal(await page.locator('#timezone').inputValue(), '2');
    console.log('PASS persisted tier, calendar, date and timezone survive a reload');
    await page.goto(base + '/shunyabheda.html?tier=bogus');
    await page.waitForFunction(() => /ERROR/.test(document.querySelector('#status').textContent), null, { timeout: 90000 });
    assert.match(await page.locator('#status').textContent(), /Unknown engine mode 'bogus'/);
    const kept = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) || '{}'), M.YANTRA_STATE_KEY);
    assert.notEqual(kept.tier, 'bogus', 'a bogus tier is not stored');
    // the select shows the default (re-choosing it fires no change), so every tier is offered as a button, and one computes
    assert.deepEqual(await page.locator('#tier-refusal-actions button').evaluateAll((bs) => bs.map((b) => b.dataset.tier)), M.TIER_IDS.slice());
    assert.match(await settle(page, () => page.locator(`#tier-refusal-actions button[data-tier="${M.DEFAULT_TIER}"]`).click()), /COMPUTATION COMPLETE/);
    await page.goto(base + '/shunyabheda.html?engineMode=calibrated&date=2026-10-08&calendar=gregorian');
    await page.waitForFunction(() => /COMPUTATION COMPLETE|ERROR|REFUSED/.test(document.querySelector('#status').textContent), null, { timeout: 90000 });
    assert.equal(await page.locator('#tier').inputValue(), 'drik', "an old ?engineMode=calibrated link opens the dṛk tier");
    await page.evaluate((key) => localStorage.removeItem(key), M.YANTRA_STATE_KEY);
    await page.goto(base + '/shunyabheda.html?engineMode=classical');
    await page.waitForFunction(() => /COMPUTATION COMPLETE/.test(document.querySelector('#status').textContent), null, { timeout: 90000 });
    assert.equal(await page.locator('#tier').inputValue(), M.DEFAULT_TIER, "an old ?engineMode=classical link opens the page default");
    console.log('PASS ?tier=bogus is reported and not stored; ?engineMode=calibrated → drik; ?engineMode=classical → the page default');

    assert.deepEqual(errors, [], `page errors: ${errors.join(' | ')}`);
    assert.deepEqual(consoleErrors, [], `console errors: ${consoleErrors.join(' | ')}`);
    assert.deepEqual(foreignRequests, [], 'no request leaves the page\'s origin');
    console.log('PASS no page error, no console error, no outside request');

    // 9. without the paramparā record the default tier says so plainly and offers the other two (a fresh visitor,
    //    the record's two files blocked); the plain text then computes. (Its own page: the blocked fetches are expected.)
    const context = await browser.newContext();
    const p2 = await context.newPage();
    const p2errors = [];
    p2.on('pageerror', (error) => p2errors.push(error.message));
    await p2.route('**/*', (route) => {
      const u = new URL(route.request().url());
      return u.hostname === '127.0.0.1' && !u.pathname.startsWith('/corpus/parampara/') ? route.continue() : route.abort();
    });
    await p2.goto(base + '/shunyabheda.html?date=2026-10-08');
    await p2.waitForFunction(() => /NOT COMPUTED|COMPUTATION COMPLETE/.test(document.querySelector('#status').textContent), null, { timeout: 90000 });
    assert.match(await p2.locator('#status').textContent(), /NOT COMPUTED.*paramparā record/);
    assert.deepEqual(await p2.locator('#tier-refusal-actions button').evaluateAll((bs) => bs.map((b) => b.dataset.tier)), M.TIER_IDS.filter((id) => M.TIERS[id].samskara !== 'parameshvara'));
    assert.equal(await p2.locator('#jd-value').textContent(), '—');
    assert.match(await settle(p2, () => p2.locator('#tier-refusal-actions button[data-tier="ss"]').click()), /COMPUTATION COMPLETE/);
    assert.deepEqual(p2errors, []);
    await context.close();
    console.log('PASS without the paramparā record the default tier is refused plainly and the other tiers are offered');
  } finally {
    if (browser) await browser.close();
    await new Promise((resolve) => server.close(resolve));
  }
})().catch((error) => { console.error(error); process.exitCode = 1; });
