'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  computeERA,
  computePolarMotion,
  computeDeltaUT1,
  computeLOD,
  computeCIPCoordinates,
  buildITRFtoGCRSMatrix,
  buildGCRStoITRFMatrix,
  J2000_JD
} = require('./eop-first-principles.js');

test('eop-first-principles: computes ERA, polar motion, LOD, CIP, and verifies ITRF to GCRS matrix orthogonality', () => {
  const era = computeERA(J2000_JD);
  assert.ok(Math.abs(era - 4.89496) < 0.1);

  const pm = computePolarMotion(J2000_JD + 1000.0);
  assert.ok(Math.abs(pm.xpMas) < 300.0);
  assert.ok(Math.abs(pm.ypMas) < 300.0);

  const dut1 = computeDeltaUT1(J2000_JD + 36525.0);
  assert.ok(dut1 < 0.0); // Secular deceleration

  const lod = computeLOD(J2000_JD + 1000.0);
  assert.ok(lod > 0.0); // positive LOD anomaly

  const cip = computeCIPCoordinates(J2000_JD + 1000.0);
  assert.ok(Math.abs(cip.X) < 1.0e-3);
  assert.ok(Math.abs(cip.Y) < 1.0e-3);

  // Test ITRF to GCRS matrix orthogonality (M * M^T = I)
  const M = buildITRFtoGCRSMatrix(J2000_JD + 500.0, pm.xp, pm.yp);
  const Mt = buildGCRStoITRFMatrix(J2000_JD + 500.0, pm.xp, pm.yp);

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      let dot = 0.0;
      for (let k = 0; k < 3; k++) {
        dot += M[i][k] * Mt[k][j];
      }
      const expected = (i === j) ? 1.0 : 0.0;
      assert.ok(Math.abs(dot - expected) < 1e-12, `EOP matrix orthogonality failed at (${i},${j}): dot=${dot}`);
    }
  }
});

