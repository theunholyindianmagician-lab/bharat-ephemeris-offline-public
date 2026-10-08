'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { computeMetricDilationRate, integrateProperTime, L_B } = require('./metric-time-integrator.js');

test('metric-time-integrator: computes relativistic time dilation and L_B offsets', () => {
  assert.equal(typeof L_B, 'number');
  assert.ok(L_B > 0);

  const posEarth = [1.0, 0.0, 0.0];
  const velEarth = [0.0, 0.0172, 0.0];
  const posSun = [[0.0, 0.0, 0.0]];
  const gmSun = [0.0002959122082855911];

  const rate = computeMetricDilationRate(posEarth, velEarth, posSun, gmSun);
  assert.ok(rate < 0); // Gravitational time dilation reduces clock rate relative to infinity

  const evalDays = [0.0, 10.0, 20.0, 30.0];
  const trajPos = [posEarth, posEarth, posEarth, posEarth];
  const trajVel = [velEarth, velEarth, velEarth, velEarth];
  const trajSun = [posSun, posSun, posSun, posSun];

  const res = integrateProperTime(evalDays, trajPos, trajVel, trajSun, gmSun);
  assert.equal(res.tcbMinusTtSec.length, 4);
  assert.equal(res.tdbMinusTtSec.length, 4);
});
