'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { propagateSTM, computeGravityJacobian } = require('./variational-stm-solver.js');

test('variational-stm-solver: computes gravity Jacobian and propagates State Transition Matrix', () => {
  const pos = [[0.0, 0.0, 0.0], [1.0, 0.0, 0.0]];
  const gm = [0.0002959122082855911, 8.887692445125634e-10];

  const da_dp = computeGravityJacobian(pos, gm);
  assert.equal(da_dp.length, 36);

  const vel = [[0.0, 0.0, 0.0], [0.0, 0.0172, 0.0]];
  const evalDays = [0.0, 5.0, 10.0];

  const res = propagateSTM(pos, vel, gm, evalDays);
  assert.equal(res.length, 3);
  assert.ok(res[2].phiNorm > 1.0);
});
