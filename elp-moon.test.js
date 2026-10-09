'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const E=require('./elp-moon.js'),M=require('./math-core.js'),fixture=require('./test-fixtures/elp-reference.json');
const angle=(a,b)=>Math.atan2(Math.hypot(a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]),a.reduce((s,v,i)=>s+v*b[i],0))*180/Math.PI*3600;
test('full lunar geometric theory meets independent 0.06 arcsecond RMS and 3 metre radial RMS budgets',()=>{
 const angles=[],ranges=[];
 for(const r of fixture.refs){const p=E.equatorialJ2000(r.jdTDB),v=[p.x,p.y,p.z].map(x=>x*149597870.7);angles.push(angle(v,r.geometric));ranges.push((Math.hypot(...v)-Math.hypot(...r.geometric))*1000);}
 const rms=a=>Math.sqrt(a.reduce((s,x)=>s+x*x,0)/a.length);
 assert.ok(rms(angles)<.06);assert.ok(rms(ranges)<3);
});
test('full lunar provider is exactly equal in browser and Node and production regressions stay pinned',()=>{
 const scope={};scope.globalThis=scope;vm.runInNewContext(fs.readFileSync(require.resolve('./elp-moon.js'),'utf8'),scope);
 for(const r of fixture.pins){assert.deepEqual(E.equatorialJ2000(r.jdTDB),r.xyz);assert.equal(JSON.stringify(scope.ShunyaElp.equatorialJ2000(r.jdTDB)),JSON.stringify(r.xyz));assert.equal(M.drigCoordinates('candra',r.jdTT,{timeScale:'TT'}).longitude.toFixed(9),r.longitude);}
 assert.throws(()=>E.equatorialJ2000(NaN));assert.throws(()=>M.drigCoordinates('candra',2451545,{lunarTheory:'typo'}));
});
test('lunar provider and deflection choices are explicit and cannot leak through caches',()=>{
 const options={timeScale:'TT'},jd=2451545;
 const first=M.drigCoordinates('candra',jd,options);
 const prior=M.drigCoordinates('candra',jd,{...options,lunarTheory:'compact',deflection:false});
 assert.notEqual(first.longitude,prior.longitude);
 assert.equal(first.lunarTheory,'full-elp-mpp02-DE405');
 assert.equal(first.gravitationalDeflection,'Sun-Jupiter-Saturn-monopole');
 assert.deepEqual(M.drigCoordinates('candra',jd,options),first);
});
