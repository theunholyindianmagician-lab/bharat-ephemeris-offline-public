'use strict';
const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const M = require(process.env.ENGINE_CORE_PATH || './math-core.js');
const fixture = require('./test-fixtures/engine-mode-regressions.json');
const jd = 2461290.7708333335;

test('classical output remains exactly identical to the pre-fix engine across epochs', () => {
  for (const row of fixture.classical) {
    assert.deepEqual(M.sphutaGrahaModel(row.jd, 'classical').map(g => g.longitude), row.longitudes);
  }
});

test('Node and standalone browser builds execute the same actual astronomical kernel', () => {
  const scope = { console }; scope.globalThis = scope;
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, 'vsop87-full.js'), 'utf8'), scope);
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, 'elp-moon.js'), 'utf8'), scope);
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, 'math-core.js'), 'utf8'), scope);
  for (const mode of ['classical', 'calibrated']) {
    assert.equal(JSON.stringify(scope.ShunyaMath.canonicalGrahaModel(jd, { mode })), JSON.stringify(M.canonicalGrahaModel(jd, { mode })));
  }
  assert.notEqual(M.drigCoordinates('candra', jd).longitude, M.drigCoordinates('surya', jd).longitude);
});

test('original compact kernel regression values remain pinned at eight epochs', () => {
  for (const epoch of fixture.modern) for (const row of epoch.rows) {
    assert.equal(M.drigCoordinates(row.key, epoch.jd, { planetaryTheory: "compact" }).longitude.toFixed(9), row.longitude);
  }
});

test('TT diagnostic accepts TT directly and does not apply Delta-T twice', () => {
  const tt = M.drigCoordinates('candra', 2451545, { timeScale: 'TT' });
  assert.equal(tt.jdTT, 2451545);
  assert.ok(tt.jdUT < tt.jdTT);
  const ut = M.drigCoordinates('candra', 2451545, { timeScale: 'UT' });
  assert.equal(ut.jdUT, 2451545);
  assert.ok(ut.jdTT > ut.jdUT);
  assert.notEqual(tt.longitude, ut.longitude);
});

test('calibrated Sun-frame uses a common epoch and preserves classical Sun and nodes', () => {
  for (const epoch of fixture.classical) {
    const classical = M.sphutaGrahaModel(epoch.jd, 'classical');
    const cal = M.sphutaGrahaModel(epoch.jd, 'calibrated');
    for (const key of ['surya', 'rahu', 'ketu']) {
      assert.equal(cal.find(g => g.key === key).longitude, classical.find(g => g.key === key).longitude);
    }
    for (const g of cal) assert.equal(g.longitude, M.drigGrahaLongitude(g.key, epoch.jd, classical[0].longitude));
    assert.notEqual(cal[1].longitude, classical[1].longitude);
  }
});

test('Panchanga, extended Panchanga, bhava rows and velocities follow the selected mode', () => {
  for (const mode of ['classical', 'calibrated']) {
    const planets = M.canonicalGrahaModel(jd, { mode });
    const pan = M.panchangAtJd(jd, 2, mode);
    const ext = M.panchangExtended(jd, 42.62, 25.39, 2, mode);
    const bhava = M.bhavaModel(jd, 42.62, 25.39, mode);
    const velocities = M.computePlanetaryVelocities(jd, { mode });
    assert.equal(pan.mode, mode);
    assert.equal(pan.surya, planets[0].longitude);
    assert.equal(pan.chandra, planets[1].longitude);
    for (const key of ['surya', 'chandra', 'lunar', 'tithiIndex', 'nakshatraIndex', 'yogaIndex', 'karanaIndex']) assert.equal(ext[key], pan[key]);
    assert.deepEqual(bhava.grahas.map(g => g.longitude), planets.map(g => g.longitude));
    assert.deepEqual(velocities.map(g => g.longitude), planets.map(g => g.longitude));
    assert.equal(bhava.lagna, M.siderealAscendantDeg(jd, 42.62, 25.39, mode));
  }
  assert.deepEqual(M.panchangExtended(jd, 42.62, 25.39, 2, 'spica_lahiri', { mode: 'calibrated' }), M.panchangExtended(jd, 42.62, 25.39, 2, 'calibrated'));
});

test('MKY secular calendar convention is exact and distinct from the Sun-frame offset', () => {
  assert.equal(M.ayanamshaDeg(2451545, 'calibrated'), (2000 - 514.4) * (58.5939 / 3600));
  assert.equal(M.ayanamshaRateArcsecPerYear(jd, 'calibrated'), 58.5939);
  assert.notEqual(M.ayanamshaDeg(jd, 'calibrated'), M.coordinateFrameOffsetDeg(jd, 'calibrated'));
});

test('invalid modes and unavailable bodies fail explicitly rather than yielding zeros', () => {
  for (const mode of ['typo', '', null]) {
    assert.throws(() => M.sphutaGrahaModel(jd, { mode }));
    assert.throws(() => M.panchangAtJd(jd, 5.5, mode));
    assert.throws(() => M.computePlanetaryVelocities(jd, { mode }));
  }
  assert.throws(() => M.drigCoordinates('typo', jd), /Unsupported/);
  assert.throws(() => M.drigCoordinates('surya', NaN), /finite/);
  assert.throws(() => M.drigCoordinates('surya', jd, { timeScale: 'TDB' }), /Unknown time scale/);
  assert.throws(() => M.sphutaGrahaModel(jd, { mode: 'calibrated', applyBija: true }), /cannot be combined/);
});

test('harmonics remain explicit experiments and cannot silently alter default output', () => {
  const normal = M.drigCoordinates('budha', jd);
  const experimental = M.drigCoordinates('budha', jd, { quantumBija: true });
  assert.equal(normal.quantumBijaApplied, false);
  assert.equal(experimental.correctionStatus, 'experimental-unvalidated');
  assert.notEqual(normal.longitude, experimental.longitude);
  assert.equal(M.drigGeoJ2000('budha', jd), normal.longitudeJ2000);
});
