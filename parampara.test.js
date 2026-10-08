'use strict';
/*
 * parampara.test.js — the ancestors' recorded eclipse readings (corpus/jyotirmimamsa/readings.json, from eclipses.json's
 * glosses), taken through the text's own clocks and fitted by the robust saṃskāra (scripts/parampara-samskara.cjs), give
 * the same correction Parameśvara published as his epoch (JM p.34): the loop the tradition ran, closed again on its own
 * records, with no modern number anywhere. [recorded]
 */
const assert = require('node:assert/strict');
const { test } = require('node:test');
const SK = require('./samskara.js');
const P = require('./scripts/parampara-samskara.cjs');

test('[recorded] the readings, fitted on the text\'s model, give Parameśvara\'s own epoch correction: the elongation and the Moon − node agree within their σ', () => {
  // Parameśvara − the text's mean places at the same instant, sunrise at Laṅkā on Kali 16,51,700 (Āryabhaṭa's day begins at
  // sunrise [reading]); only differences of places are compared, which no choice of sidereal zero can move
  const par = { sun: 15 / 60, moon: 10 * 30 + 4 + 6 / 60, node: 4 * 30 + 23 + 55 / 60 };
  const w = (x) => ((x + 540) % 360) - 180, m = SK.model({}, { epoch: 1651700 }).mean(1651700.25);
  const elong = (w(par.moon - m.moon) - w(par.sun - m.sun)) * 60, argLat = (w(par.moon - m.moon) - w(par.node - m.node)) * 60;
  assert.ok(Math.abs(elong + 8.0) < 0.1 && Math.abs(argLat - 61.3) < 0.1, `Parameśvara: elongation ${elong.toFixed(2)}′, Moon − node ${argLat.toFixed(2)}′`);
  const f = P.fit(7), mo = f.params['moon.epoch'], no = f.params['node.epoch'];
  assert.equal(mo.status, 'fitted'); assert.equal(no.status, 'fitted');
  // the Sun is held, so the Moon's correction is the elongation's
  assert.ok(Math.abs(mo.delta - elong) < 2 * mo.sigma, `elongation: fit ${mo.delta} ± ${mo.sigma}′, Parameśvara ${elong.toFixed(1)}′`);
  const fitArg = mo.delta - no.delta, sArg = Math.hypot(mo.sigma, no.sigma);
  assert.ok(Math.abs(fitArg - argLat) < 2 * sArg, `Moon − node: fit ${fitArg.toFixed(1)} ± ${sArg.toFixed(1)}′, Parameśvara ${argLat.toFixed(1)}′`);
  assert.ok(f.observations >= 15 && f.rows >= 18);
});
