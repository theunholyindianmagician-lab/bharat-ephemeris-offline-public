'use strict';

/**
 * Sovereign Variational State Transition Matrix (STM) Solver.
 * Pure JavaScript, zero external runtime dependencies.
 * Concurrently integrates 6N x 6N State Transition Matrix Phi(t, t0) = dY(t)/dY(t0)
 * along with N-body trajectories using exact analytical Jacobians and RK4 vector ODE integration.
 * Safe buffer allocation per epoch, zero-mass tracer NaN guards, full matrix return.
 */

function computeGravityJacobian(pos, gm) {
  const n = gm.length;
  const dim = n * 3;
  // Accept both flat Float64Array and nested [[x,y,z],...] formats
  const flatPos = (pos instanceof Float64Array || (pos.length === dim && typeof pos[0] === 'number'))
    ? pos
    : new Float64Array(pos.flat ? pos.flat() : [].concat(...pos));
  const da_dp = new Float64Array(dim * dim);

  for (let i = 0; i < n; ++i) {
    const i3 = i * 3;
    for (let j = i + 1; j < n; ++j) {
      if (gm[i] === 0 && gm[j] === 0) continue;
      const j3 = j * 3;

      const rx = flatPos[j * 3] - flatPos[i * 3];
      const ry = flatPos[j * 3 + 1] - flatPos[i * 3 + 1];
      const rz = flatPos[j * 3 + 2] - flatPos[i * 3 + 2];
      const r2 = rx * rx + ry * ry + rz * rz;
      if (r2 === 0) continue;

      const r = Math.sqrt(r2);
      const r3inv = 1.0 / (r2 * r);
      const r5inv = 1.0 / (r2 * r2 * r);

      // h_ij: tidal tensor of body j's field acting on body i (∂a_i/∂r_j)
      const h_ij = [
        gm[j]*r3inv - 3*gm[j]*r5inv*rx*rx, -3*gm[j]*r5inv*rx*ry,        -3*gm[j]*r5inv*rx*rz,
       -3*gm[j]*r5inv*ry*rx,         gm[j]*r3inv - 3*gm[j]*r5inv*ry*ry, -3*gm[j]*r5inv*ry*rz,
       -3*gm[j]*r5inv*rz*rx,        -3*gm[j]*r5inv*rz*ry,         gm[j]*r3inv - 3*gm[j]*r5inv*rz*rz
      ];

      // h_ji: tidal tensor of body i's field acting on body j (∂a_j/∂r_i)
      // Computed directly from gm[i] — NOT derived from h_ij via gm[i]/gm[j]
      // (that ratio is undefined when gm[j]=0 for massless tracer bodies)
      const h_ji = [
        gm[i]*r3inv - 3*gm[i]*r5inv*rx*rx, -3*gm[i]*r5inv*rx*ry,        -3*gm[i]*r5inv*rx*rz,
       -3*gm[i]*r5inv*ry*rx,         gm[i]*r3inv - 3*gm[i]*r5inv*ry*ry, -3*gm[i]*r5inv*ry*rz,
       -3*gm[i]*r5inv*rz*rx,        -3*gm[i]*r5inv*rz*ry,         gm[i]*r3inv - 3*gm[i]*r5inv*rz*rz
      ];

      for (let rIdx = 0; rIdx < 3; ++rIdx) {
        for (let cIdx = 0; cIdx < 3; ++cIdx) {
          const val_ij = h_ij[rIdx * 3 + cIdx];
          da_dp[(i3 + rIdx) * dim + (j3 + cIdx)] += val_ij;
          da_dp[(i3 + rIdx) * dim + (i3 + cIdx)] -= val_ij;

          const val_ji = h_ji[rIdx * 3 + cIdx];
          da_dp[(j3 + rIdx) * dim + (i3 + cIdx)] += val_ji;
          da_dp[(j3 + rIdx) * dim + (j3 + cIdx)] -= val_ji;
        }
      }
    }
  }

  return da_dp;
}

function evalVariationalRhs(y, phi, gm, dydt, dphidt) {
  const n = gm.length;
  const dim = n * 3;
  const stateDim = dim * 2;

  // dP/dt = V
  for (let i = 0; i < dim; ++i) {
    dydt[i] = y[dim + i];
  }

  // dV/dt = A
  const acc = dydt.subarray(dim);
  acc.fill(0.0);

  for (let i = 0; i < n; ++i) {
    const i3 = i * 3;
    for (let j = 0; j < n; ++j) {
      if (i === j || gm[j] === 0) continue;
      const rx = y[i3] - y[j * 3];
      const ry = y[i3 + 1] - y[j * 3 + 1];
      const rz = y[i3 + 2] - y[j * 3 + 2];
      const r2 = rx * rx + ry * ry + rz * rz;
      if (r2 > 0) {
        const r = Math.sqrt(r2);
        const r3inv = 1.0 / (r2 * r);
        acc[i3]     -= gm[j] * r3inv * rx;
        acc[i3 + 1] -= gm[j] * r3inv * ry;
        acc[i3 + 2] -= gm[j] * r3inv * rz;
      }
    }
  }

  // dPhi/dt = J * Phi
  const da_dp = computeGravityJacobian(y, gm);

  for (let r = 0; r < stateDim; ++r) {
    for (let c = 0; c < stateDim; ++c) {
      let sum = 0.0;
      if (r < dim) {
        sum = phi[(dim + r) * stateDim + c];
      } else {
        const r_acc = r - dim;
        for (let k = 0; k < dim; ++k) {
          sum += da_dp[r_acc * dim + k] * phi[k * stateDim + c];
        }
      }
      dphidt[r * stateDim + c] = sum;
    }
  }
}

/**
 * Propagate N-body positions and 6N x 6N State Transition Matrix Phi with RK4 integration.
 */
function propagateSTM(initialPositions, initialVelocities, gm, evalDays) {
  const n = gm.length;
  const dim = n * 3;
  const stateDim = dim * 2;

  let currentY = new Float64Array(stateDim);
  for (let i = 0; i < n; ++i) {
    currentY[i * 3]     = initialPositions[i][0];
    currentY[i * 3 + 1] = initialPositions[i][1];
    currentY[i * 3 + 2] = initialPositions[i][2];

    currentY[dim + i * 3]     = initialVelocities[i][0];
    currentY[dim + i * 3 + 1] = initialVelocities[i][1];
    currentY[dim + i * 3 + 2] = initialVelocities[i][2];
  }

  let currentPhi = new Float64Array(stateDim * stateDim);
  for (let i = 0; i < stateDim; ++i) {
    currentPhi[i * stateDim + i] = 1.0;
  }

  const results = [];
  let tCurrent = 0.0;
  let dt = 0.1;

  for (let idx = 0; idx < evalDays.length; ++idx) {
    const targetT = evalDays[idx];

    while (tCurrent < targetT) {
      const step = Math.min(dt, targetT - tCurrent);

      // Full RK4 step on Y and Phi
      const k1_y = new Float64Array(stateDim), k1_phi = new Float64Array(stateDim * stateDim);
      const k2_y = new Float64Array(stateDim), k2_phi = new Float64Array(stateDim * stateDim);
      const k3_y = new Float64Array(stateDim), k3_phi = new Float64Array(stateDim * stateDim);
      const k4_y = new Float64Array(stateDim), k4_phi = new Float64Array(stateDim * stateDim);

      evalVariationalRhs(currentY, currentPhi, gm, k1_y, k1_phi);

      const yTemp = new Float64Array(stateDim);
      const phiTemp = new Float64Array(stateDim * stateDim);

      for (let i = 0; i < stateDim; ++i) yTemp[i] = currentY[i] + step * 0.5 * k1_y[i];
      for (let i = 0; i < stateDim * stateDim; ++i) phiTemp[i] = currentPhi[i] + step * 0.5 * k1_phi[i];
      evalVariationalRhs(yTemp, phiTemp, gm, k2_y, k2_phi);

      for (let i = 0; i < stateDim; ++i) yTemp[i] = currentY[i] + step * 0.5 * k2_y[i];
      for (let i = 0; i < stateDim * stateDim; ++i) phiTemp[i] = currentPhi[i] + step * 0.5 * k2_phi[i];
      evalVariationalRhs(yTemp, phiTemp, gm, k3_y, k3_phi);

      for (let i = 0; i < stateDim; ++i) yTemp[i] = currentY[i] + step * k3_y[i];
      for (let i = 0; i < stateDim * stateDim; ++i) phiTemp[i] = currentPhi[i] + step * k3_phi[i];
      evalVariationalRhs(yTemp, phiTemp, gm, k4_y, k4_phi);

      for (let i = 0; i < stateDim; ++i) {
        currentY[i] += (step / 6.0) * (k1_y[i] + 2.0 * k2_y[i] + 2.0 * k3_y[i] + k4_y[i]);
      }
      for (let i = 0; i < stateDim * stateDim; ++i) {
        currentPhi[i] += (step / 6.0) * (k1_phi[i] + 2.0 * k2_phi[i] + 2.0 * k3_phi[i] + k4_phi[i]);
      }

      tCurrent += step;
    }

    let frobNorm = 0.0;
    for (let i = 0; i < stateDim * stateDim; ++i) {
      frobNorm += currentPhi[i] * currentPhi[i];
    }

    // Allocation of distinct buffer array per sample to avoid buffer overwriting!
    results.push({
      t: targetT,
      pos: Float64Array.from(currentY.subarray(0, dim)),
      vel: Float64Array.from(currentY.subarray(dim, stateDim)),
      phi: Float64Array.from(currentPhi),
      phiNorm: Math.sqrt(frobNorm)
    });
  }

  return results;
}

module.exports = {
  propagateSTM,
  computeGravityJacobian
};
