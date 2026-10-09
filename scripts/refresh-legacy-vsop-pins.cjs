// Explicit regression recapture only. Never change independent reference data.
// Run after independent physical accuracy and browser parity tests pass.
'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const M=require('../math-core.js');
const target=path.join(__dirname,'../test-fixtures/full-vsop-reference.json');
const before=fs.readFileSync(target,'utf8'),r=JSON.parse(before);
const sha=x=>crypto.createHash('sha256').update(x).digest('hex');
const dataHash=sha(JSON.stringify(r.data));
assert.equal(dataHash,'dc40a5753bdba0df2af2dc48d491cc19a95acab66cca91b2fa804b3c4b3374b3','Independent DE440s data changed; stop and audit.');
const changes=[];
for(const [graha,rows]of Object.entries(r.pins))for(const row of rows) {
  const actual=M.drigCoordinates(graha,row.jdTT,{timeScale:'TT',lunarTheory:'compact',deflection:false}).longitude.toFixed(9);
  if(actual!==row.longitude) {
    const arcsec=(Number(actual)-Number(row.longitude))*3600;
    assert.ok(Math.abs(arcsec)<.00001,'Not a last-digit-only regression change; do not auto-refresh');
    changes.push({graha,jdTT:row.jdTT,before:row.longitude,after:actual,arcsec});row.longitude=actual;
  }
}
const evidence={classification:'regression-snapshot-refresh-NOT-physical-reference',dataSha256Unchanged:dataHash,
  sourceSha256:sha(fs.readFileSync(path.join(__dirname,'../math-core.js'))),beforeFileSha256:sha(before),changes};
console.log(JSON.stringify(evidence,null,2));
if(process.argv.includes('--accept-regression-refresh')&&changes.length) {
  const audit=path.join(__dirname,'../test-fixtures/legacy-vsop-pin-refresh-2026-09-17.json');
  if(fs.existsSync(audit))throw new Error('Existing recapture evidence must not be overwritten');
  fs.writeFileSync(audit,JSON.stringify(evidence,null,2)+'\n');
  assert.equal(sha(JSON.stringify(r.data)),dataHash);
  fs.writeFileSync(target,JSON.stringify(r)+'\n');
}
