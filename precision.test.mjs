import M from './math-core.js';
const {computePrecisionChart,placementPrecision,vargaMarginArcsec,positionBudgetArcsec}=M;

import test from 'node:test';
import assert from 'node:assert/strict';
test('precision API returns absolute coordinates, explicit frame and time, no solar re-anchoring',()=>{
 const p=computePrecisionChart({jdTT:2451545,ayanamshaDeg:24});
 // Regression pin for split-epoch evaluation; physical budgets are separately tested.
 assert.equal(p.grahas.candra.longitudeDeg,223.31485113808816);
 assert.equal(p.grahas.candra.nirayanaDeg,199.31485113808816);
 assert.equal(p.grahas.candra.frame,'true-ecliptic-of-date');
 assert.equal(p.grahas.candra.timeScale,'TT');
 assert.equal(p.grahas.rahu.distanceAU,null);
 assert.equal(p.accuracy.topocentric,false);
});
test('precision API rejects mixed clocks and keeps sidereal rotations separate from physical output',()=>{
 assert.throws(()=>computePrecisionChart({jdTT:2451545,jdUT:2451545}),RangeError);
 assert.throws(()=>computePrecisionChart({jdUT:2451545}),RangeError);
 const a=computePrecisionChart({jdTT:2451545}),b=computePrecisionChart({jdTT:2451545,ayanamshaDeg:23});
 assert.equal(a.grahas.candra.longitudeDeg,b.grahas.candra.longitudeDeg);
 assert.equal(a.grahas.candra.nirayanaDeg-b.grahas.candra.nirayanaDeg,23);
});
test('placement precision abstains without a budget; D30 uses unequal Parashari cells',()=>{
 const p=placementPrecision(17,{model:'test',frame:'test',jdUt:2451545});
 assert.equal(p.nakshatra.reason,'missing-error-budget');
 assert.equal(p.vargas.D108.status,'undetermined');
 assert.equal(vargaMarginArcsec(12,30),7200);
 assert.equal(vargaMarginArcsec(42,30),0);
});
test('time uncertainty propagates in arcseconds; negative uncertainties are invalid',()=>{
 const budget={model:'test',frame:'test',source:'test',validJdUt:[2450000,2460000],
   seriesArcsec:1,frameArcsec:2,deltaTSeconds:3,clockSeconds:4,maxSpeedDegPerDay:12};
 assert.equal(positionBudgetArcsec(budget).totalArcsec,6.5);
 assert.throws(()=>positionBudgetArcsec({...budget,clockSeconds:-1}),RangeError);
});
