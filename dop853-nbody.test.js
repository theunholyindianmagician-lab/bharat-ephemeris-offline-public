'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const Dop853 = require('./dop853-nbody.js');

test('dop853-nbody: instantiates with 11 standard bodies', () => {
  assert.equal(Dop853.BODY_NAMES.length, 11);
  assert.equal(Dop853.STANDARD_GM.length, 11);
});

test('dop853-nbody: propagates circular 2-body orbit over 1 full period cleanly', () => {
  // Keplerian 2-body test: Earth-like mass around fixed Sun at 1 AU
  const gmSun = Dop853.STANDARD_GM[0];
  const gmEarth = Dop853.STANDARD_GM[3];
  const r = 1.0; // 1 AU
  const k = Math.sqrt((gmSun + gmEarth) / (r * r * r)); // mean motion rad/day
  const period = 2.0 * Math.PI / k; // ~365.256898 days

  const pos = Array.from({ length: 11 }, () => [0, 0, 0]);
  const vel = Array.from({ length: 11 }, () => [0, 0, 0]);

  // CM frame positions & velocities
  const gmTotal = gmSun + gmEarth;
  pos[0] = [-(gmEarth / gmTotal) * r, 0, 0];
  vel[0] = [0, -k * (gmEarth / gmTotal) * r, 0];

  pos[3] = [(gmSun / gmTotal) * r, 0, 0];
  vel[3] = [0, k * (gmSun / gmTotal) * r, 0];

  const gm = new Array(11).fill(0);
  gm[0] = gmSun;
  gm[3] = gmEarth;

  const res = Dop853.propagate(pos, vel, [0, period / 2, period], { gm, rtol: 1e-6, maxStep: 10.0, relativistic: false });

  assert.equal(res.status, 'SUCCESS');
  assert.equal(res.results.length, 3);

  // At period / 2, Earth relative to Sun should be near [-1, 0, 0]
  const pMidSun = res.results[1].bodies[0].pos;
  const pMidEarth = res.results[1].bodies[3].pos;
  const relXMid = pMidEarth[0] - pMidSun[0];
  assert.ok(Math.abs(relXMid - (-1.0)) < 1e-4, `Expected relX near -1.0, got ${relXMid}`);

  // At period, Earth relative to Sun should be near [1, 0, 0]
  const pEndSun = res.results[2].bodies[0].pos;
  const pEndEarth = res.results[2].bodies[3].pos;
  const relXEnd = pEndEarth[0] - pEndSun[0];
  assert.ok(Math.abs(relXEnd - 1.0) < 1e-4, `Expected relX near 1.0, got ${relXEnd}`);
  const pEnd = res.results[2].bodies[3].pos;
  assert.ok(Math.abs(pEnd[1]) < 1e-4, `Expected y near 0, got ${pEnd[1]}`);
});
