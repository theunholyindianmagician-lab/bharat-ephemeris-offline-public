'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { propagateLibration, getPAtoMEMatrix, getMEtoPAMatrix, BETA_LUNAR, GAMMA_LUNAR, ALPHA_LUNAR } = require('./lunar-euler-libration.js');

test('lunar-euler-libration: integrates 3D rotational libration stably over 30 days and checks PA2ME frame orthogonality', () => {
  assert.equal(typeof BETA_LUNAR, 'number');
  assert.ok(BETA_LUNAR > 0);

  const evalDays = [0.0, 5.0, 10.0, 15.0, 20.0, 25.0, 30.0];
  const rEarth = (t) => [-384400.0 * Math.cos(0.23 * t), -384400.0 * Math.sin(0.23 * t), 0.0];
  const rSun = (t) => [1.496e8 * Math.cos(0.0172 * t), 1.496e8 * Math.sin(0.0172 * t), 0.0];

  const results = propagateLibration(evalDays, rEarth, rSun, 398600.435507, 1.3271244e11);
  assert.equal(results.length, 7);
  assert.ok(Math.abs(results[0].tauArcsec) < 1.0);
  assert.ok(!Number.isNaN(results[6].tauArcsec));

  // Verify PA to ME rotation matrix orthogonality (R * R^T = I)
  const R = getPAtoMEMatrix(0.05, -0.02, 0.01);
  const Rt = getMEtoPAMatrix(0.05, -0.02, 0.01);

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      let dot = 0.0;
      for (let k = 0; k < 3; k++) {
        dot += R[i][k] * Rt[k][j];
      }
      const expected = (i === j) ? 1.0 : 0.0;
      assert.ok(Math.abs(dot - expected) < 1e-12, `Matrix orthogonality failed at (${i},${j}): dot=${dot}`);
    }
  }
});

