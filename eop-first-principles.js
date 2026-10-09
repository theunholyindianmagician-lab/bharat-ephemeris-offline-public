'use strict';

/**
 * Sovereign First-Principles Earth Orientation Parameters (EOP) Synthesizer.
 * Pure JavaScript, zero external dependencies.
 * Computes:
 * - Earth Rotation Angle (ERA) theta(Tu)
 * - Chandler Wobble (433d) + Annual Forced Motion (365.25d) Polar Motion (xp, yp)
 * - Lunar Tidal Friction Secular Deceleration Delta-UT1 = UT1 - UTC
 * - ITRF -> GCRS rotation matrix
 */

const J2000_JD = 2451545.0;
const MAS2RAD = (Math.PI / 180.0) / (3600.0 * 1000.0);

const CHANDLER_AMP_X = 150.0 * MAS2RAD;
const CHANDLER_AMP_Y = 150.0 * MAS2RAD;
const ANNUAL_AMP_X = 100.0 * MAS2RAD;
const ANNUAL_AMP_Y = 100.0 * MAS2RAD;

const TIDAL_LOD_RATE_SEC_DAY2 = (1.7e-3 / 36525.0);

/**
 * Compute Earth Rotation Angle ERA theta in radians.
 */
function computeERA(jdUt1) {
  const du = jdUt1 - J2000_JD;
  const eraTurns = 0.7790572732640 + 1.00273781191135448 * du;
  return (eraTurns % 1.0) * 2.0 * Math.PI;
}

/**
 * Compute physical polar motion coordinates (xp, yp) in radians.
 */
function computePolarMotion(jdUt1) {
  const days = jdUt1 - J2000_JD;

  const phaseC = 2.0 * Math.PI * days / 433.0;
  const xpChandler = CHANDLER_AMP_X * Math.cos(phaseC);
  const ypChandler = -CHANDLER_AMP_Y * Math.sin(phaseC);

  const phaseA = 2.0 * Math.PI * days / 365.25;
  const xpAnnual = ANNUAL_AMP_X * Math.cos(phaseA + 0.5);
  const ypAnnual = -ANNUAL_AMP_Y * Math.sin(phaseA + 0.5);

  return {
    xp: xpChandler + xpAnnual,
    yp: ypChandler + ypAnnual,
    xpMas: (xpChandler + xpAnnual) / MAS2RAD,
    ypMas: (ypChandler + ypAnnual) / MAS2RAD
  };
}

/**
 * Compute Delta-UT1 from tidal deceleration.
 */
function computeDeltaUT1(jdUtc) {
  const days = jdUtc - J2000_JD;
  return -0.5 * TIDAL_LOD_RATE_SEC_DAY2 * (days * days);
}

/**
 * Compute Length of Day (LOD) anomaly in milliseconds per day.
 * LOD = -d(Delta-UT1)/dt
 */
function computeLOD(jdUtc) {
  const days = jdUtc - J2000_JD;
  const dDut1_dt_sec_per_day = -TIDAL_LOD_RATE_SEC_DAY2 * days;
  return -dDut1_dt_sec_per_day * 1000.0; // ms / day
}

/**
 * Compute Celestial Intermediate Pole (CIP) coordinates (X, Y) and CIO locator s in radians.
 * Based on IAU 2006/2000A Precession-Nutation model.
 */
function computeCIPCoordinates(jdTdb) {
  const t = (jdTdb - J2000_JD) / 36525.0; // Julian centuries since J2000

  // Precession polynomial terms for X and Y (arcseconds -> radians)
  const ARCSEC2RAD = Math.PI / (180.0 * 3600.0);

  // Mean elongation of moon, mean anomaly of sun/moon, etc.
  const omega = (125.04455501 - 1934.1361849 * t) * (Math.PI / 180.0);
  const lSun = (280.46645683 + 36000.76982779 * t) * (Math.PI / 180.0);

  // Major nutation terms in X and Y
  const dX_nut = (-0.00000684 * Math.sin(omega) + 0.00000055 * Math.sin(2 * lSun)) * ARCSEC2RAD;
  const dY_nut = ( 0.00000921 * Math.cos(omega) - 0.00000045 * Math.cos(2 * lSun)) * ARCSEC2RAD;

  const X_prec = (-0.016617 * t + 2004.1917476 * t + -0.4297829 * t*t - 0.19861834 * t*t*t) * ARCSEC2RAD;
  const Y_prec = (-0.006951 + -0.025896 * t + -22.4072747 * t*t + 0.00190059 * t*t*t) * ARCSEC2RAD;

  const X = X_prec + dX_nut;
  const Y = Y_prec + dY_nut;

  // CIO locator s (approximate formula)
  const s = -X * Y / 2.0;

  return { X, Y, s };
}

/**
 * Polar motion matrix W(xp, yp) = R_y(xp) * R_x(yp)
 */
function buildPolarMotionMatrix(xpRad, ypRad) {
  const cX = Math.cos(xpRad), sX = Math.sin(xpRad);
  const cY = Math.cos(ypRad), sY = Math.sin(ypRad);

  return [
    [ cX,      0.0, -sX     ],
    [ sX * sY, cY,   cX * sY ],
    [ sX * cY, -sY,  cX * cY ]
  ];
}

/**
 * Earth Rotation matrix R(theta) = R_z(-theta)
 */
function buildERAMatrix(thetaRad) {
  const cT = Math.cos(thetaRad), sT = Math.sin(thetaRad);

  return [
    [  cT,  sT, 0.0 ],
    [ -sT,  cT, 0.0 ],
    [ 0.0, 0.0, 1.0 ]
  ];
}

/**
 * Precession-Nutation matrix Q(X, Y, s)
 */
function buildPrecessionNutationMatrix(X, Y, s) {
  const a = 1.0 / (1.0 + Math.sqrt(Math.max(0.0, 1.0 - X*X - Y*Y)));
  const cS = Math.cos(s), sS = Math.sin(s);

  // Intermediate matrix Q0
  const Q0 = [
    [ 1.0 - a * X * X, -a * X * Y,      X ],
    [ -a * X * Y,      1.0 - a * Y * Y, Y ],
    [ -X,              -Y,              1.0 - a * (X*X + Y*Y) ]
  ];

  // R_z(s)
  const RzS = [
    [  cS,  sS, 0.0 ],
    [ -sS,  cS, 0.0 ],
    [ 0.0, 0.0, 1.0 ]
  ];

  // Q = Q0 * Rz(s)
  const Q = [
    [ Q0[0][0]*RzS[0][0] + Q0[0][1]*RzS[1][0] + Q0[0][2]*RzS[2][0],
      Q0[0][0]*RzS[0][1] + Q0[0][1]*RzS[1][1] + Q0[0][2]*RzS[2][1],
      Q0[0][0]*RzS[0][2] + Q0[0][1]*RzS[1][2] + Q0[0][2]*RzS[2][2] ],
    [ Q0[1][0]*RzS[0][0] + Q0[1][1]*RzS[1][0] + Q0[1][2]*RzS[2][0],
      Q0[1][0]*RzS[0][1] + Q0[1][1]*RzS[1][1] + Q0[1][2]*RzS[2][1],
      Q0[1][0]*RzS[0][2] + Q0[1][1]*RzS[1][2] + Q0[1][2]*RzS[2][2] ],
    [ Q0[2][0]*RzS[0][0] + Q0[2][1]*RzS[1][0] + Q0[2][2]*RzS[2][0],
      Q0[2][0]*RzS[0][1] + Q0[2][1]*RzS[1][1] + Q0[2][2]*RzS[2][1],
      Q0[2][0]*RzS[0][2] + Q0[2][1]*RzS[1][2] + Q0[2][2]*RzS[2][2] ]
  ];

  return Q;
}

/**
 * Synthesize complete 3x3 transformation matrix converting ITRF to GCRS.
 * M = Q(X, Y, s) * R(theta) * W(xp, yp)
 */
function buildITRFtoGCRSMatrix(jdUt1, xpRad = 0.0, ypRad = 0.0, dXRad = 0.0, dYRad = 0.0) {
  const theta = computeERA(jdUt1);
  const { X, Y, s } = computeCIPCoordinates(jdUt1);

  const W = buildPolarMotionMatrix(xpRad, ypRad);
  const R = buildERAMatrix(theta);
  const Q = buildPrecessionNutationMatrix(X + dXRad, Y + dYRad, s);

  // Temp = R * W
  const RW = [
    [ R[0][0]*W[0][0] + R[0][1]*W[1][0] + R[0][2]*W[2][0],
      R[0][0]*W[0][1] + R[0][1]*W[1][1] + R[0][2]*W[2][1],
      R[0][0]*W[0][2] + R[0][1]*W[1][2] + R[0][2]*W[2][2] ],
    [ R[1][0]*W[0][0] + R[1][1]*W[1][0] + R[1][2]*W[2][0],
      R[1][0]*W[0][1] + R[1][1]*W[1][1] + R[1][2]*W[2][1],
      R[1][0]*W[0][2] + R[1][1]*W[1][2] + R[1][2]*W[2][2] ],
    [ R[2][0]*W[0][0] + R[2][1]*W[1][0] + R[2][2]*W[2][0],
      R[2][0]*W[0][1] + R[2][1]*W[1][1] + R[2][2]*W[2][1],
      R[2][0]*W[0][2] + R[2][1]*W[1][2] + R[2][2]*W[2][2] ]
  ];

  // M = Q * RW
  const M = [
    [ Q[0][0]*RW[0][0] + Q[0][1]*RW[1][0] + Q[0][2]*RW[2][0],
      Q[0][0]*RW[0][1] + Q[0][1]*RW[1][1] + Q[0][2]*RW[2][1],
      Q[0][0]*RW[0][2] + Q[0][1]*RW[1][2] + Q[0][2]*RW[2][2] ],
    [ Q[1][0]*RW[0][0] + Q[1][1]*RW[1][0] + Q[1][2]*RW[2][0],
      Q[1][0]*RW[0][1] + Q[1][1]*RW[1][1] + Q[1][2]*RW[2][1],
      Q[1][0]*RW[0][2] + Q[1][1]*RW[1][2] + Q[1][2]*RW[2][2] ],
    [ Q[2][0]*RW[0][0] + Q[2][1]*RW[1][0] + Q[2][2]*RW[2][0],
      Q[2][0]*RW[0][1] + Q[2][1]*RW[1][1] + Q[2][2]*RW[2][1],
      Q[2][0]*RW[0][2] + Q[2][1]*RW[1][2] + Q[2][2]*RW[2][2] ]
  ];

  return M;
}

/**
 * Transpose of ITRF to GCRS matrix (GCRS -> ITRF).
 */
function buildGCRStoITRFMatrix(jdUt1, xpRad = 0.0, ypRad = 0.0, dXRad = 0.0, dYRad = 0.0) {
  const M = buildITRFtoGCRSMatrix(jdUt1, xpRad, ypRad, dXRad, dYRad);
  return [
    [ M[0][0], M[1][0], M[2][0] ],
    [ M[0][1], M[1][1], M[2][1] ],
    [ M[0][2], M[1][2], M[2][2] ]
  ];
}

module.exports = {
  computeERA,
  computePolarMotion,
  computeDeltaUT1,
  computeLOD,
  computeCIPCoordinates,
  buildITRFtoGCRSMatrix,
  buildGCRStoITRFMatrix,
  J2000_JD,
  MAS2RAD
};

