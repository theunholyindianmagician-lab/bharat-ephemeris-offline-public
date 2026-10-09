'use strict';

/**
 * Sovereign Lunar 3D Physical Libration Integrator.
 * Pure JavaScript, zero external runtime dependencies.
 * Integrates 3D Euler equations + Quaternion rotational kinematics:
 * - Moments of inertia ratios: beta = (C-A)/B = 6.315e-4, gamma = (B-A)/C = 2.278e-4
 * - Gravitational torques from Earth and Sun on Moon's triaxial inertia tensor
 * - Outputs physical librations tau (longitude), rho (latitude), and sigma (node)
 */

const BETA_LUNAR = 6.315e-4;
const GAMMA_LUNAR = 2.278e-4;
const ALPHA_LUNAR = 4.037e-4;

const R_MOON_KM = 1737.4;
const C_MOON_MAG = 0.392 * 7.342e22 * (R_MOON_KM * R_MOON_KM);
const A_MOON_MAG = C_MOON_MAG * (1.0 - BETA_LUNAR);
const B_MOON_MAG = C_MOON_MAG * (1.0 - BETA_LUNAR + GAMMA_LUNAR);

const MONTH_DAYS = 27.321661;
const OMEGA_LUNAR_MEAN = 2.0 * Math.PI / MONTH_DAYS; // rad/day

function computeGravitationalTorque(rVec, gmAttractor, q) {
  const r2 = rVec[0]*rVec[0] + rVec[1]*rVec[1] + rVec[2]*rVec[2];
  if (r2 === 0) return [0, 0, 0];
  const rMag = Math.sqrt(r2);

  // Transform rVec to body frame via quaternion q
  const qw = q[0], qx = q[1], qy = q[2], qz = q[3];

  // Body frame vector rBody = R^T * rVec
  const rbx = (1 - 2*(qy*qy + qz*qz))*rVec[0] + (2*(qx*qy + qz*qw))*rVec[1] + (2*(qx*qz - qy*qw))*rVec[2];
  const rby = (2*(qx*qy - qz*qw))*rVec[0] + (1 - 2*(qx*qx + qz*qz))*rVec[1] + (2*(qy*qz + qx*qw))*rVec[2];
  const rbz = (2*(qx*qz + qy*qw))*rVec[0] + (2*(qy*qz - qx*qw))*rVec[1] + (1 - 2*(qx*qx + qy*qy))*rVec[2];

  const factor = (3.0 * gmAttractor) / (r2 * r2 * rMag);
  return [
    factor * (C_MOON_MAG - B_MOON_MAG) * rby * rbz,
    factor * (A_MOON_MAG - C_MOON_MAG) * rbz * rbx,
    factor * (B_MOON_MAG - A_MOON_MAG) * rbx * rby
  ];
}

/**
 * Compute 3x3 rotation matrix converting Principal Axes (PA) frame to Mean Earth / Mean Rotation (ME) frame.
 * R_PA2ME = R_z(-tau) * R_x(-rho) * R_z(-sigma)
 */
function getPAtoMEMatrix(tauRad, rhoRad, sigmaRad) {
  const cT = Math.cos(-tauRad), sT = Math.sin(-tauRad);
  const cR = Math.cos(-rhoRad), sR = Math.sin(-rhoRad);
  const cS = Math.cos(-sigmaRad), sS = Math.sin(-sigmaRad);

  // R_z(-tau)
  const RzT = [
    [ cT, -sT, 0 ],
    [ sT,  cT, 0 ],
    [  0,   0, 1 ]
  ];

  // R_x(-rho)
  const RxR = [
    [ 1,   0,    0 ],
    [ 0,  cR,  -sR ],
    [ 0,  sR,   cR ]
  ];

  // R_z(-sigma)
  const RzS = [
    [ cS, -sS, 0 ],
    [ sS,  cS, 0 ],
    [  0,   0, 1 ]
  ];

  // Temp = R_x(-rho) * R_z(-sigma)
  const tmp = [
    [ RxR[0][0]*RzS[0][0] + RxR[0][1]*RzS[1][0] + RxR[0][2]*RzS[2][0],
      RxR[0][0]*RzS[0][1] + RxR[0][1]*RzS[1][1] + RxR[0][2]*RzS[2][1],
      RxR[0][0]*RzS[0][2] + RxR[0][1]*RzS[1][2] + RxR[0][2]*RzS[2][2] ],
    [ RxR[1][0]*RzS[0][0] + RxR[1][1]*RzS[1][0] + RxR[1][2]*RzS[2][0],
      RxR[1][0]*RzS[0][1] + RxR[1][1]*RzS[1][1] + RxR[1][2]*RzS[2][1],
      RxR[1][0]*RzS[0][2] + RxR[1][1]*RzS[1][2] + RxR[1][2]*RzS[2][2] ],
    [ RxR[2][0]*RzS[0][0] + RxR[2][1]*RzS[1][0] + RxR[2][2]*RzS[2][0],
      RxR[2][0]*RzS[0][1] + RxR[2][1]*RzS[1][1] + RxR[2][2]*RzS[2][1],
      RxR[2][0]*RzS[0][2] + RxR[2][1]*RzS[1][2] + RxR[2][2]*RzS[2][2] ]
  ];

  // Result = R_z(-tau) * tmp
  const R = [
    [ RzT[0][0]*tmp[0][0] + RzT[0][1]*tmp[1][0] + RzT[0][2]*tmp[2][0],
      RzT[0][0]*tmp[0][1] + RzT[0][1]*tmp[1][1] + RzT[0][2]*tmp[2][1],
      RzT[0][0]*tmp[0][2] + RzT[0][1]*tmp[1][2] + RzT[0][2]*tmp[2][2] ],
    [ RzT[1][0]*tmp[0][0] + RzT[1][1]*tmp[1][0] + RzT[1][2]*tmp[2][0],
      RzT[1][0]*tmp[0][1] + RzT[1][1]*tmp[1][1] + RzT[1][2]*tmp[2][1],
      RzT[1][0]*tmp[0][2] + RzT[1][1]*tmp[1][2] + RzT[1][2]*tmp[2][2] ],
    [ RzT[2][0]*tmp[0][0] + RzT[2][1]*tmp[1][0] + RzT[2][2]*tmp[2][0],
      RzT[2][0]*tmp[0][1] + RzT[2][1]*tmp[1][1] + RzT[2][2]*tmp[2][1],
      RzT[2][0]*tmp[0][2] + RzT[2][1]*tmp[1][2] + RzT[2][2]*tmp[2][2] ]
  ];

  return R;
}

/**
 * Transpose of PA to ME matrix.
 */
function getMEtoPAMatrix(tauRad, rhoRad, sigmaRad) {
  const R = getPAtoMEMatrix(tauRad, rhoRad, sigmaRad);
  return [
    [ R[0][0], R[1][0], R[2][0] ],
    [ R[0][1], R[1][1], R[2][1] ],
    [ R[0][2], R[1][2], R[2][2] ]
  ];
}

/**
 * Propagate 3D Lunar Physical Libration over requested evaluation days with RK4 accuracy.
 */
function propagateLibration(evalDays, getEarthPos, getSunPos, gmEarth, gmSun) {
  // Convert GM from km^3/s^2 to km^3/day^2 if passed in km^3/s^2
  const gmE = gmEarth < 1.0e10 ? gmEarth * (86400.0 * 86400.0) : gmEarth;
  const gmS = gmSun < 1.0e15 ? gmSun * (86400.0 * 86400.0) : gmSun;

  let q = [1.0, 0.0, 0.0, 0.0]; // Unit quaternion
  let w = [0.0, 0.0, OMEGA_LUNAR_MEAN]; // Angular velocity vector in body frame

  const results = [];
  let tCurrent = 0.0;
  let dt = 0.05; // 0.05 day RK4 integration step size

  const computeDerivatives = (t, qState, wState) => {
    const rEarth = getEarthPos(t);
    const rSun = getSunPos(t);

    const nEarth = computeGravitationalTorque(rEarth, gmE, qState);
    const nSun = computeGravitationalTorque(rSun, gmS, qState);

    const nTotal = [nEarth[0] + nSun[0], nEarth[1] + nSun[1], nEarth[2] + nSun[2]];

    const dw = [
      (nTotal[0] + (B_MOON_MAG - C_MOON_MAG) * wState[1] * wState[2]) / A_MOON_MAG,
      (nTotal[1] + (C_MOON_MAG - A_MOON_MAG) * wState[2] * wState[0]) / B_MOON_MAG,
      (nTotal[2] + (A_MOON_MAG - B_MOON_MAG) * wState[0] * wState[1]) / C_MOON_MAG
    ];

    const dq = [
      0.5 * (-qState[1]*wState[0] - qState[2]*wState[1] - qState[3]*wState[2]),
      0.5 * ( qState[0]*wState[0] + qState[2]*wState[2] - qState[3]*wState[1]),
      0.5 * ( qState[0]*wState[1] - qState[1]*wState[2] + qState[3]*wState[0]),
      0.5 * ( qState[0]*wState[2] + qState[1]*wState[1] - qState[2]*wState[0])
    ];

    return { dw, dq };
  };

  for (let idx = 0; idx < evalDays.length; ++idx) {
    const targetT = evalDays[idx];

    while (tCurrent < targetT) {
      const step = Math.min(dt, targetT - tCurrent);

      // RK4 integration step
      const k1 = computeDerivatives(tCurrent, q, w);

      const q_k2 = [
        q[0] + 0.5 * step * k1.dq[0],
        q[1] + 0.5 * step * k1.dq[1],
        q[2] + 0.5 * step * k1.dq[2],
        q[3] + 0.5 * step * k1.dq[3]
      ];
      const w_k2 = [
        w[0] + 0.5 * step * k1.dw[0],
        w[1] + 0.5 * step * k1.dw[1],
        w[2] + 0.5 * step * k1.dw[2]
      ];
      const k2 = computeDerivatives(tCurrent + 0.5 * step, q_k2, w_k2);

      const q_k3 = [
        q[0] + 0.5 * step * k2.dq[0],
        q[1] + 0.5 * step * k2.dq[1],
        q[2] + 0.5 * step * k2.dq[2],
        q[3] + 0.5 * step * k2.dq[3]
      ];
      const w_k3 = [
        w[0] + 0.5 * step * k2.dw[0],
        w[1] + 0.5 * step * k2.dw[1],
        w[2] + 0.5 * step * k2.dw[2]
      ];
      const k3 = computeDerivatives(tCurrent + 0.5 * step, q_k3, w_k3);

      const q_k4 = [
        q[0] + step * k3.dq[0],
        q[1] + step * k3.dq[1],
        q[2] + step * k3.dq[2],
        q[3] + step * k3.dq[3]
      ];
      const w_k4 = [
        w[0] + step * k3.dw[0],
        w[1] + step * k3.dw[1],
        w[2] + step * k3.dw[2]
      ];
      const k4 = computeDerivatives(tCurrent + step, q_k4, w_k4);

      for (let i = 0; i < 3; i++) {
        w[i] += (step / 6.0) * (k1.dw[i] + 2.0 * k2.dw[i] + 2.0 * k3.dw[i] + k4.dw[i]);
      }
      for (let i = 0; i < 4; i++) {
        q[i] += (step / 6.0) * (k1.dq[i] + 2.0 * k2.dq[i] + 2.0 * k3.dq[i] + k4.dq[i]);
      }

      const qNorm = Math.hypot(q[0], q[1], q[2], q[3]);
      q[0] /= qNorm; q[1] /= qNorm; q[2] /= qNorm; q[3] /= qNorm;

      tCurrent += step;
    }

    const meanAngle = OMEGA_LUNAR_MEAN * targetT;
    const q0 = q[0], q1 = q[1], q2 = q[2], q3 = q[3];
    const currentAngle = Math.atan2(2 * (q0 * q3 + q1 * q2), q0 * q0 + q1 * q1 - q2 * q2 - q3 * q3);
    const tauRad = Math.atan2(Math.sin(currentAngle - meanAngle), Math.cos(currentAngle - meanAngle));
    const sinTilt = 2 * Math.hypot(q1 * q3 - q0 * q2, q0 * q1 + q2 * q3);
    const rhoRad = Math.asin(Math.min(1.0, Math.max(-1.0, 2 * (q0 * q1 + q2 * q3))));
    const sigmaRad = Math.atan2(2 * (q0 * q2 - q1 * q3), q0 * q0 - q1 * q1 - q2 * q2 + q3 * q3);

    const matrixPA2ME = getPAtoMEMatrix(tauRad, rhoRad, sigmaRad);

    results.push({
      t: targetT,
      q: q.slice(),
      omega: w.slice(),
      tauArcsec: tauRad * 206264.806247,
      rhoArcsec: rhoRad * 206264.806247,
      sigmaArcsec: sigmaRad * 206264.806247,
      matrixPA2ME
    });
  }

  return results;
}

module.exports = {
  propagateLibration,
  getPAtoMEMatrix,
  getMEtoPAMatrix,
  BETA_LUNAR,
  GAMMA_LUNAR,
  ALPHA_LUNAR
};

