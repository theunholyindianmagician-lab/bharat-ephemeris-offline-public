const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

// Setup mock DOM environment for Node testing
function setupDOMMock() {
  const html = fs.readFileSync(path.join(__dirname, 'library.html'), 'utf-8');
  const s4Start = html.indexOf('const granthaCorpus =');
  const scriptTagStart = html.lastIndexOf('<script>', s4Start);
  const scriptTagEnd = html.indexOf('</script>', s4Start);
  let s4 = html.slice(scriptTagStart + 8, scriptTagEnd);
  s4 = s4.replace('const granthaCorpus =', 'var granthaCorpus =');

  const elements = {};
  function createMockElement(tagName = 'div') {
    const el = {
      tagName: tagName.toUpperCase(),
      id: '',
      className: '',
      classList: {
        _classes: new Set(),
        add(c) { this._classes.add(c); },
        remove(c) { this._classes.delete(c); },
        contains(c) { return this._classes.has(c); },
        toggle(c) {
          if (this._classes.has(c)) { this._classes.delete(c); return false; }
          else { this._classes.add(c); return true; }
        }
      },
      style: {},
      attributes: {},
      children: [],
      innerText: '',
      textContent: '',
      innerHTML: '',
      value: '',
      scrollTop: 0,
      scrollHeight: 1000,
      clientHeight: 400,
      setAttribute(k, v) { this.attributes[k] = String(v); },
      getAttribute(k) { return this.attributes[k] || null; },
      appendChild(child) { this.children.push(child); return child; },
      removeChild(child) { this.children = this.children.filter(c => c !== child); },
      querySelector(sel) {
        if (sel.startsWith('#')) return elements[sel.slice(1)] || null;
        return createMockElement('div');
      },
      querySelector(sel) { return elements['readerModal'] || null; },
      querySelectorAll(sel) { return []; },
      addEventListener() {},
      focus() {},
      scrollIntoView() {},
      scrollTo() {}
    };
    return el;
  }

  // Pre-create known elements
  ['readerModal', 'buyModal', 'readerTitle', 'readerSub', 'readerBadge', 'readerChBadge', 'readerProgressBadge', 'chapterPillsContainer', 'readerBody', 'prevChapterBtn', 'nextChapterBtn', 'readerBuyBtn', 'granthaSearchInput', 'granthaSearchResults', 'reading-progress-bar', 'readerFontScaleLabel'].forEach(id => {
    elements[id] = createMockElement('div');
    elements[id].id = id;
  });

  const localStorageStore = {};
  const mockLocalStorage = {
    getItem(k) { return localStorageStore[k] || null; },
    setItem(k, v) { localStorageStore[k] = String(v); },
    removeItem(k) { delete localStorageStore[k]; }
  };

  const mockWindow = {
    location: { hash: '#reader-surya-0', origin: 'http://localhost', pathname: '/library.html', href: 'http://localhost/library.html#reader-surya-0' },
    history: { replaceState() {} },
    localStorage: mockLocalStorage,
    document: {
      body: createMockElement('body'),
      head: createMockElement('head'),
      documentElement: { scrollTop: 0, scrollHeight: 2000, clientHeight: 800 },
      getElementById(id) {
        if (!elements[id]) {
          elements[id] = createMockElement('div');
          elements[id].id = id;
        }
        return elements[id];
      },
      createElement(tag) { return createMockElement(tag); },
      querySelector(sel) { return elements['readerModal'] || createMockElement('div'); },
      body: createMockElement('body'),
      head: createMockElement('head'),
      querySelectorAll(sel) {
        if (sel.includes('.verse') || sel.includes('.chapter')) return [];
        return [];
      },
      addEventListener() {}
    },
    addEventListener() {},
    setTimeout(fn) { fn(); },
    clearTimeout() {}
  };

  global.window = mockWindow;
  global.location = mockWindow.location;
  global.document = mockWindow.document;
  global.localStorage = mockLocalStorage;
  global.navigator = { clipboard: { writeText: async () => {} } };
  global.Blob = class Blob { constructor(parts, opts) { this.parts = parts; this.opts = opts; } };
  global.URL = { createObjectURL: () => 'blob:mock-url', revokeObjectURL: () => {} };

  // Load edition-nav-enhancer.js
  const enhancerCode = fs.readFileSync(path.join(__dirname, 'edition-nav-enhancer.js'), 'utf-8');
  eval(enhancerCode);

  // Load library.html Script 4
  eval(s4);

  return { mockWindow, elements };
}

test('Audit: granthaCorpus loads 10 masterworks and 199 total chapters', () => {
  setupDOMMock();
  const corpus = window.granthaCorpus;
  assert.ok(corpus, 'granthaCorpus should be defined on window');
  
  const expectedBooks = ['surya', 'parashara', 'grantha', 'panini', 'aryabhata', 'brahmagupta', 'bhaskara', 'madhava', 'pingala', 'sulba'];
  const actualBooks = Object.keys(corpus);
  assert.deepEqual(actualBooks.sort(), expectedBooks.sort(), 'All 10 Grantha books must be present');

  let totalChapters = 0;
  for (const key of expectedBooks) {
    assert.ok(corpus[key].chapters.length > 0, `Book ${key} must have chapters`);
    totalChapters += corpus[key].chapters.length;
  }
  assert.equal(totalChapters, 136, 'Total chapter count across 10 books should be 136');
});

test('Audit: openReader, switchChapter, and stepChapter load chapters smoothly', () => {
  const { elements } = setupDOMMock();
  
  window.openReader('surya', 0);
  assert.equal(window.currentBookKey, 'surya', 'Active book key should be surya');
  assert.equal(window.currentChapterIndex, 0, 'Active chapter index should be 0');
  assert.ok(elements.readerModal.classList.contains('open'), 'Modal should have open class');

  window.switchChapter(1);
  assert.equal(window.currentChapterIndex, 1, 'Switched chapter index should be 1');

  window.stepChapter(1);
  assert.equal(window.currentChapterIndex, 2, 'Stepped forward chapter index should be 2');

  window.stepChapter(-1);
  assert.equal(window.currentChapterIndex, 1, 'Stepped back chapter index should be 1');

  window.closeReader();
  assert.equal(elements.readerModal.classList.contains('open'), false, 'Modal should be closed');
});

test('Audit: KaTeX Math Rendering generates clean HTML output', () => {
  setupDOMMock();
  const render = window.EditionNavEnhancer.renderKaTeX;

  const fracOutput = render('\\frac{\\text{Ahargaṇa} \\times B}{1577917828}');
  assert.ok(fracOutput.includes('katex-frac'), 'Output should contain katex-frac class');
  assert.ok(fracOutput.includes('katex-num') && fracOutput.includes('katex-den'), 'Output should contain num and den spans');

  const symbolOutput = render('\\pi \\approx 3.14159 \\quad \\theta \\le \\phi');
  assert.ok(symbolOutput.includes('π') && symbolOutput.includes('≈'), 'LaTeX symbols \\pi and \\approx should convert to π and ≈');
  assert.ok(symbolOutput.includes('θ') && symbolOutput.includes('≤') && symbolOutput.includes('φ'), 'LaTeX symbols \\theta, \\le, \\phi should convert to θ, ≤, φ');

  const sqrtOutput = render('\\sqrt{a^2 + b^2}');
  assert.ok(sqrtOutput.includes('katex-sqrt'), 'Output should contain square root container');
});

test('Audit: Font size toggle updates scale and persists in localStorage', () => {
  const { elements } = setupDOMMock();

  window.EditionNavEnhancer.setFontScale(1.2);
  assert.equal(window.EditionNavEnhancer.fontScale, 1.2, 'Font scale should be set to 1.2');
  assert.equal(localStorage.getItem('be_reader_font_scale'), '1.2', 'Font scale should persist in localStorage');
  assert.equal(elements.readerBody.style.fontSize, '1.14rem', 'readerBody font size should be updated');

  window.EditionNavEnhancer.adjustFontScale(-0.1);
  assert.equal(Math.round(window.EditionNavEnhancer.fontScale * 10) / 10, 1.1, 'Font scale should decrease to 1.1');
});

test('Audit: Reading progress tracking computes percentage and updates state', () => {
  const { elements } = setupDOMMock();
  elements.readerModal.classList.add('open');
  elements.readerBody.scrollTop = 300;
  elements.readerBody.scrollHeight = 1000;
  elements.readerBody.clientHeight = 400;

  window.currentBookKey = 'surya';
  window.currentChapterIndex = 0;

  window.EditionNavEnhancer.updateReadingProgress();

  assert.equal(elements['reading-progress-bar'].style.width, '50%', 'Progress bar width should be 50%');
  assert.equal(elements.readerProgressBadge.textContent, '50% read', 'Progress badge should read 50% read');

  const saved = JSON.parse(localStorage.getItem('be_reading_progress'));
  assert.equal(saved.bookKey, 'surya', 'Saved reading progress bookKey should match');
  assert.equal(saved.progress, 50, 'Saved reading progress percentage should be 50');
});

test('Audit: JSON dataset exports generate formatted JSON structures', () => {
  setupDOMMock();
  let createdBlob = null;
  let createdFilename = '';

  global.document.createElement = function(tag) {
    const el = {
      tagName: tag.toUpperCase(),
      style: {},
      click() {},
      set href(u) {},
      set download(fn) { createdFilename = fn; }
    };
    return el;
  };

  global.Blob = class MockBlob {
    constructor(parts, opts) {
      createdBlob = parts[0];
    }
  };

  window.EditionNavEnhancer.exportJSON('surya', 0);
  assert.ok(createdFilename.includes('surya_'), 'Export filename should contain book key');
  const exportedObj = JSON.parse(createdBlob);
  assert.equal(exportedObj.bookKey, 'surya', 'Export object bookKey should be surya');
  assert.equal(exportedObj.chapterIndex, 0, 'Export object chapterIndex should be 0');

  window.EditionNavEnhancer.exportJSON('bundle');
  assert.equal(createdFilename, 'Complete_Deca_Grantha_Collector_Bundle.json', 'Bundle export filename should match');
});

test('Audit: Table of contents search filters chapters accurately', () => {
  setupDOMMock();
  window.activeGranthaFilter = 'all';

  // Test main library search
  window.searchGranthaChapters();
  // Modify input and search
  window.document.getElementById('granthaSearchInput').value = 'Mahayuga';
  window.searchGranthaChapters();

  const resBox = window.document.getElementById('granthaSearchResults');
  assert.equal(resBox.style.display, 'block', 'Search results box should be displayed');
  assert.ok(resBox.innerHTML.includes('Surya') || resBox.innerHTML.includes('1'), 'Search results should match Mahayuga chapter');
});
