'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  computeKuiperBeltAcceleration,
  computeYarkovskyAcceleration,
  computeSolarCycleJ2,
  compute2PNLightDeflection,
  GM_KUIPER_BELT
} = require('./sovereign-master-physics.js');

test('sovereign-master-physics: verifies Kuiper belt field, Yarkovsky recoil, solar cycle J2, and 2PN deflection', () => {
  assert.ok(GM_KUIPER_BELT > 0);

  const accKbo = computeKuiperBeltAcceleration([35.0, 0.0, 0.0], [0.0, 0.0, 0.0]);
  assert.ok(accKbo[0] < 0); // Attractive force toward Sun

  const accYark = computeYarkovskyAcceleration([2.5, 0.0, 0.0], [0.0, 0.01, 0.0], [0.0, 0.0, 0.0], 10.0);
  assert.ok(accYark[1] > 0); // Transverse recoil acceleration

  const j2_0 = computeSolarCycleJ2(0.0);
  const j2_half = computeSolarCycleJ2(2008.875); // Half cycle
  assert.notEqual(j2_0, j2_half);

  const defl = compute2PNLightDeflection([1, 0, 0], [0, 0, 0], [1, 0.005, 0]);
  assert.ok(defl[1] > 0);
});
