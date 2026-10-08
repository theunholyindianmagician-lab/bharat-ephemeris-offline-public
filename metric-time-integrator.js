'use strict';

/**
 * Sovereign Relativistic Metric Proper Time Integrator.
 * Pure JavaScript, zero external runtime dependencies.
 * Integrates 4D metric potential along Earth's 3D geodesic:
 * d(TCB)/dt = 1 - U(r_Earth(t))/c^2 - v_Earth(t)^2 / (2 c^2)
 */

const AU_KM = 149597870.700;
const DAY_S = 86400.0;
const C_M_S = 299792458.0;
const C_AUDAY = C_M_S * DAY_S / (AU_KM * 1000.0);
const C2 = C_AUDAY * C_AUDAY;
const L_B = 1.550519768e-8;

function computeMetricDilationRate(posEarth, velEarth, posBodies, gmBodies) {
  const v2 = velEarth[0]*velEarth[0] + velEarth[1]*velEarth[1] + velEarth[2]*velEarth[2];

  let uTot = 0.0;
  for (let i = 0; i < gmBodies.length; ++i) {
    const rx = posEarth[0] - posBodies[i][0];
    const ry = posEarth[1] - posBodies[i][1];
    const rz = posEarth[2] - posBodies[i][2];
    const r2 = rx*rx + ry*ry + rz*rz;
    if (r2 > 0 && gmBodies[i] > 0) {
      uTot += gmBodies[i] / Math.sqrt(r2);
    }
  }

  return - (uTot / C2) - 0.5 * (v2 / C2);
}

function integrateProperTime(evalDays, posEarthTrajectory, velEarthTrajectory, posBodiesTrajectory, gmBodies) {
  const n = evalDays.length;
  const tcbMinusTtSec = new Float64Array(n);
  const dt = n > 1 ? evalDays[1] - evalDays[0] : 1.0;

  // By definition, Δτ(t_0) ≡ 0 at the initial epoch
  tcbMinusTtSec[0] = 0.0;

  if (n > 1) {
    let prevRate = computeMetricDilationRate(
      posEarthTrajectory[0],
      velEarthTrajectory[0],
      posBodiesTrajectory[0],
      gmBodies
    ) * DAY_S;

    let accDilation = 0.0;

    for (let i = 1; i < n; ++i) {
      const curRate = computeMetricDilationRate(
        posEarthTrajectory[i],
        velEarthTrajectory[i],
        posBodiesTrajectory[i],
        gmBodies
      ) * DAY_S;

      // Trapezoidal rule: (f[i-1] + f[i]) / 2 * dt
      accDilation += 0.5 * (prevRate + curRate) * dt;
      tcbMinusTtSec[i] = accDilation;
      prevRate = curRate;
    }
  }

  const tdbMinusTtSec = new Float64Array(n);
  for (let i = 0; i < n; ++i) {
    tdbMinusTtSec[i] = tcbMinusTtSec[i] - (L_B * evalDays[i] * DAY_S);
  }

  return {
    tcbMinusTtSec: Array.from(tcbMinusTtSec),
    tdbMinusTtSec: Array.from(tdbMinusTtSec)
  };
}

module.exports = {
  computeMetricDilationRate,
  integrateProperTime,
  L_B
};
