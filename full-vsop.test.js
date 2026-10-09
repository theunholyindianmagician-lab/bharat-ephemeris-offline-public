'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm');
const M=require(process.env.ENGINE_CORE_PATH || './math-core.js');
const V=require('./vsop87-full.js');
const reference=require('./test-fixtures/full-vsop-reference.json');
const delta=(a,b)=>((a-b+540)%360-180)*3600;

test('full apparent kernel stays within independently measured DE440s error budgets',()=>{
  // Physical approximation budgets, in arcseconds, not exact-reference claims.
  const limits={surya:.10,candra:.10,budha:.10,shukra:.10,mangala:.15,guru:.30,shani:.25};
  for(const [body,rows] of Object.entries(reference.data)){
    const errors=rows.map(r=>delta(M.drigCoordinates(body,r.jdTT,{timeScale:'TT'}).longitude,r.longitude));
    const rms=Math.sqrt(errors.reduce((s,x)=>s+x*x,0)/errors.length);
    assert.ok(rms<limits[body],`${body} RMS ${rms} exceeds ${limits[body]} arcsec`);
  }
});

test('prior full-VSOP kernel regressions remain exact with explicit prior lunar and ray models',()=>{
  for(const [body,rows] of Object.entries(reference.pins)) for(const row of rows)
    assert.equal(M.drigCoordinates(body,row.jdTT,{timeScale:'TT',lunarTheory:'compact',deflection:false}).longitude.toFixed(9),row.longitude);
});

test('planetary positions and analytic velocities are identical in browser and Node',()=>{
  const scope={};scope.globalThis=scope;
  vm.runInNewContext(fs.readFileSync(require.resolve('./vsop87-full.js'),'utf8'),scope);
  for(const body of V.supportedBodies) for(const jd of [2415020,2451545,2488070])
    assert.equal(JSON.stringify(V.equatorialJ2000(body,jd)),JSON.stringify(scope.ShunyaVsop87.equatorialJ2000(body,jd)));
  assert.throws(()=>V.equatorialJ2000('typo',2451545),/Unsupported/);
  assert.throws(()=>V.equatorialJ2000('Earth',NaN),/finite/);
});

test('TT and diagnostic theory selection survive planetary and velocity option propagation',()=>{
  const jd=2461290.5;
  // drigCoordinates is tested raw: since 2026-10-08 it is referee B and the dṛk tier's labelled comparison, never a page source
  assert.equal(M.drigCoordinates('candra',jd).lunarConvention,'apparent');
  assert.equal(M.drigCoordinates('candra',jd,{planetaryTheory:'compact'}).lunarConvention,'geometric');
  if(typeof M.resolveTier==='function'){
    // the three-choice API (owner decisions 2026-10-08): 'calibrated' is retired; the 'drik' rows are the owner's series
    // (siddhanta-tier.js, Citrā-pakṣa true), not drigCoordinates − Lahiri (design-final "changes": full-vsop.test.js:34-41)
    assert.throws(()=>M.resolveTier('calibrated'),/retired 2026-10-08/);
    const ST=require('./siddhanta-tier.js'),options={mode:'drik',timeScale:'TT'};
    const rows=M.canonicalGrahaModel(jd,options),vel=M.computePlanetaryVelocities(jd,options),st=ST.grahas(jd,{timeScale:'TT'});
    assert.equal(rows.length,9);
    for(const r of rows) assert.equal(r.longitude,st[r.key],`${r.key}: TT reaches the series`);
    assert.deepEqual(vel.map(r=>r.longitude),rows.map(r=>r.longitude));
    const ut=M.canonicalGrahaModel(jd,{mode:'drik'});
    assert.equal(ut[1].longitude,ST.grahas(jd)[1].longitude);
    assert.equal(M.panchangAtJd(jd,5.5,'drik').chandra,ut[1].longitude);
    assert.notEqual(ut[1].longitude,rows[1].longitude,'UT and TT differ by ΔT');
  }else{
    // before the three-choice math-core lands (this file is ahead of it in the B2 worktree): the former assertions, unchanged
    const options={mode:'calibrated',timeScale:'TT'};
    const rows=M.canonicalGrahaModel(jd,options),vel=M.computePlanetaryVelocities(jd,options);
    for(const r of rows) assert.equal(r.longitude,M.drigGrahaLongitude(r.key,jd,rows[0].longitude,options));
    assert.deepEqual(vel.map(r=>r.longitude),rows.map(r=>r.longitude));
    assert.equal(M.panchangAtJd(jd,5.5,options).chandra,rows[1].longitude);
  }
});
