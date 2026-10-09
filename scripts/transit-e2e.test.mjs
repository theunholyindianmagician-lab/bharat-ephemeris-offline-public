import assert from 'node:assert/strict';
import fs from 'node:fs';
import { chromium } from 'playwright';

const oracle = JSON.parse(fs.readFileSync(new URL('../test-fixtures/transit-independent-oracle.json', import.meta.url), 'utf8'));
const keys = Object.keys(oracle.uiFramePlanets);
const circularDelta = (a, b) => { const d = Math.abs(a - b) % 360; return Math.min(d, 360 - d); };

// The page's dṛk tier (Modern Bhāratīya, the owner's own series) is the absolute frame frozen in the fixture; the
// planet-minus-Sun elongations from an independent engine (Mangal) are the referee. The tier is chosen by the page's
// tier select (#tier, three choices since 2026-10-08); the retired 'calibrated' mode is gone.
async function renderAndRead(page) {
  await page.goto('http://127.0.0.1:8877/shunyabheda.html', { waitUntil: 'domcontentloaded' });
  await page.selectOption('#tier', oracle.uiMode);
  await page.evaluate(({ date, time }) => {
    const d = document.getElementById('gochara-date');
    const t = document.getElementById('gochara-time');
    d.value = date; t.value = time;
    d.dispatchEvent(new Event('input', { bubbles: true }));
    t.dispatchEvent(new Event('input', { bubbles: true }));
  }, oracle.civilInput);
  await page.click('#compute');
  // the rows of THIS transit (the page computed the device's "now" before the inputs were set)
  await page.waitForFunction(({ expected, jd }) => document.querySelectorAll('#gochara-matrix-body tr').length === expected
    && (document.getElementById('gochara-jd-value').textContent || '').startsWith(jd)
    && /COMPUTATION COMPLETE/.test(document.getElementById('status').textContent), { expected: keys.length, jd: oracle.jdUt.toFixed(6) });
  return page.evaluate(() => {
    const longitudes = {};
    const names = { 'सूर्य':'surya', 'चन्द्र':'candra', 'मङ्गल':'mangala', 'मंगल':'mangala', 'बुध':'budha', 'गुरु':'guru', 'शुक्र':'shukra', 'शनि':'shani', 'राहु':'rahu', 'केतु':'ketu' };
    document.querySelectorAll('#gochara-matrix-body tr').forEach(row => {
      const heading = row.querySelector('th')?.textContent || '';
      const text = row.querySelectorAll('td')[1]?.textContent || '';
      const graha = Object.entries(names).find(([name]) => heading.includes(name))?.[1];
      const match = text.match(/Abs:\s*([\d.]+)/);
      if (graha && match) longitudes[graha] = Number(match[1]);
    });
    const signs = {};
    document.querySelectorAll('#chart-gochara-container [data-graha][data-sign-index]').forEach(node => {
      if (node.dataset.graha !== 'lagna') signs[node.dataset.graha] = Number(node.dataset.signIndex);
    });
    return { longitudes, signs };
  });
}

function assertAgainstOracle(rendered) {
  assert.deepEqual(Object.keys(rendered.longitudes).sort(), keys.slice().sort(), 'matrix must expose nine canonical grahas');
  assert.deepEqual(Object.keys(rendered.signs).sort(), keys.slice().sort(), 'SVG must expose nine canonical grahas');
  for (const key of keys) {
    const expected = oracle.uiFramePlanets[key];
    assert.ok(circularDelta(rendered.longitudes[key], expected) <= oracle.displayToleranceDeg,
      `${key} displayed longitude ${rendered.longitudes[key]} differs from frozen UI frame ${expected}`);
    assert.equal(rendered.signs[key], Math.floor(expected / 30), `${key} SVG sign is wrong`);
  }
  const sun = rendered.longitudes.surya;
  for (const [key, expected] of Object.entries(oracle.independentElongationFromSun)) {
    const actual = (rendered.longitudes[key] - sun + 360) % 360;
    assert.ok(circularDelta(actual, expected) <= oracle.elongationToleranceDeg,
      `${key}-Sun elongation ${actual} differs from independent Mangal ${expected}`);
  }
  assert.ok(circularDelta((rendered.longitudes.ketu - rendered.longitudes.rahu + 360) % 360, 180) < 0.011,
    'Rahu/Ketu must remain antipodal');
}

const browser = await chromium.launch({ headless: true, args: ['--disable-service-workers'], executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || undefined });
try {
  const page = await browser.newPage();
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));
  const rendered = await renderAndRead(page);
  assertAgainstOracle(rendered);
  assert.deepEqual(pageErrors, [], `page errors: ${pageErrors.join('; ')}`);

  // RED control: reproduce the historic tAsc bug by collapsing every transit
  // graha into the transit-Lagna sign. The independent oracle must reject it.
  await page.evaluate(() => {
    const lagna = document.querySelector('#chart-gochara-container [data-graha="lagna"]')?.dataset.signIndex;
    document.querySelectorAll('#chart-gochara-container [data-graha]:not([data-graha="lagna"])')
      .forEach(node => { node.dataset.signIndex = lagna; });
  });
  const signs = await page.evaluate(() => Object.fromEntries(
    [...document.querySelectorAll('#chart-gochara-container [data-graha]:not([data-graha="lagna"])')]
      .map(node => [node.dataset.graha, Number(node.dataset.signIndex)])));
  let redDetected = false;
  try { assertAgainstOracle({ longitudes: rendered.longitudes, signs }); } catch { redDetected = true; }
  assert.equal(redDetected, true, 'RED control failed: transit-sign collapse was not detected');
  console.log(JSON.stringify({ status: 'PASS', tests: 2, oracle: oracle.source.classification, grahas: keys.length }));
} finally {
  await browser.close();
}
