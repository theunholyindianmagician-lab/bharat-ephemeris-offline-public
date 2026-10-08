'use strict';

/**
 * Sovereign DOP853 (8th Order Prince-Dormand Explicit Runge-Kutta) N-Body Integrator.
 * Pure JavaScript, zero external runtime dependencies.
 *
 * Force model actually implemented (audited 2026-09-20; each block is labelled below):
 *   1. Newtonian point masses (DE440 GMs; Mars..Neptune are system barycentres)
 *   2. EIH first post-Newtonian n-body terms (contains geodetic/de Sitter precession)
 *   3. 2PN Schwarzschild + solar Lense-Thirring (negligible at arcsec level; kept)
 *   4. Earth J2 acting on the Moon about the Earth's pole (options.earthPole; J2000 z default)
 *   5. Explicit de Sitter term — OFF by default (options.explicitDeSitter): it double-counts 2.
 *   6. 2.5PN GW damping + secular solar mass loss (negligible; kept)
 *   7. Lunar figure: J2m about the lunar pole (≈ ecliptic pole) + C22m with the long axis
 *      locked to Earth (Cassini laws) — options.lunarFigure (default ON)
 *   8. Lunar tidal secular acceleration: along-track a = −ṅ·a/3 with ṅ = −25.858″/cy² (LLR),
 *      equivalent to the measured 3.8 cm/yr recession — options.lunarTide (default ON)
 * Not implemented (constants below are declared for reference only): Earth J3/J4, belt ring.
 */

const AU_KM = 149597870.700;
const DAY_S = 86400.0;
const C_M_S = 299792458.0;
const C_AUDAY = C_M_S * DAY_S / (AU_KM * 1000.0); // ~173.1446 AU/day
const C2 = C_AUDAY * C_AUDAY;
const C4 = C2 * C2;
const C5 = C4 * C_AUDAY;

// Solar mass loss rate (AU^3 / day^3): -2.5e-16 GM_sun / day
const DGM_SUN_DT_REL = -2.5e-16;

// Standard JPL DE440 GM values (in AU^3 / day^2)
const GM_KM_11 = [
  1.32712440041279419e11, // Sun
  22031.868551,          // Mercury
  324858.592000,         // Venus
  398600.435507,         // Earth
  4902.800118,           // Moon
  42828.375816,          // Mars (barycenter)
  126712764.100000,      // Jupiter (barycenter)
  37940584.841800,       // Saturn (barycenter)
  5794556.400000,        // Uranus (barycenter)
  6836527.100580,        // Neptune (barycenter)
  975.500000             // Pluto (barycenter)
];

const STANDARD_GM = GM_KM_11.map(gm => gm * (DAY_S * DAY_S) / (AU_KM * AU_KM * AU_KM));

const BODY_NAMES = [
  'Sun', 'Mercury', 'Venus', 'Earth', 'Moon',
  'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'
];

// Physical constants for extended body harmonics & fields
const I_SUN = 7.25 * Math.PI / 180.0;
const OMEGA_SUN = 75.76 * Math.PI / 180.0;
const SUN_SPIN_HAT = [
  Math.sin(I_SUN) * Math.sin(OMEGA_SUN),
  -Math.sin(I_SUN) * Math.cos(OMEGA_SUN),
  Math.cos(I_SUN)
];

const R_SUN_AU = 696340.0 / AU_KM;
const J2_SUN = 2.2e-7;
const OMEGA_SUN_RAD_DAY = 2.0 * Math.PI / 25.38;
const S_SUN_MAG = 0.07 * STANDARD_GM[0] * (R_SUN_AU * R_SUN_AU) * OMEGA_SUN_RAD_DAY;
const S_SUN_VEC = [
  S_SUN_MAG * SUN_SPIN_HAT[0],
  S_SUN_MAG * SUN_SPIN_HAT[1],
  S_SUN_MAG * SUN_SPIN_HAT[2]
];

const J2_EARTH = 1.08263e-3;
const J3_EARTH = -2.532e-6;
const J4_EARTH = -1.620e-6;
const R_EARTH_AU = 6378.137 / AU_KM;

const GM_RING = 2.5e-10 * STANDARD_GM[0];
const R_RING_INNER = 2.1;
const R_RING_OUTER = 3.3;

// Lunar figure (GRAIL/LLR, DE440 reference radius 1738 km): unnormalised J2, C22
const J2_MOON = 2.0322e-4;
const C22_MOON = 2.238e-5;
const R_MOON_AU = 1738.0 / AU_KM;
// Lunar pole ≈ ecliptic pole (Cassini tilt 1.54° ignored: 2.7% of a 0.1″/yr effect), in the
// J2000 equatorial frame: (0, −sin ε0, cos ε0)
const OBL_J2000 = 84381.406 / 3600 * Math.PI / 180;
const LUNAR_POLE = [0.0, -Math.sin(OBL_J2000), Math.cos(OBL_J2000)];
// Lunar tidal secular acceleration ṅ = −25.858″/cy² (Chapront et al. 2002, LLR).
// Along-track acceleration for a near-circular orbit: from Gauss's equations
// da/dt = 2T/n, n ∝ a^(−3/2) ⇒ ṅ = −3T/a ⇒ T = −ṅ·a/3.  With a = 0.002570 AU this is
// 8.05e−17 AU/day², which reproduces the measured 3.8 cm/yr lunar recession.
const NDOT_MOON_RAD_DAY2 = -25.858 * (Math.PI / 180 / 3600) / (36525.0 * 36525.0);
const A_MOON_AU = 384400.0 / AU_KM;
const T_TIDE_MOON = -NDOT_MOON_RAD_DAY2 * A_MOON_AU / 3.0;

// Oblateness acceleration of a body at relative position r (from the oblate body) about pole ẑ:
//   a = −(3/2)·GM·J2·R²/r⁴ · [ (1 − 5s²) r̂ + 2s ẑ ],  s = r̂·ẑ
function j2Accel(rx, ry, rz, gm, j2, R, pole, out) {
  const r2 = rx * rx + ry * ry + rz * rz;
  if (r2 === 0) { out[0] = out[1] = out[2] = 0; return; }
  const r = Math.sqrt(r2);
  const ux = rx / r, uy = ry / r, uz = rz / r;
  const s = ux * pole[0] + uy * pole[1] + uz * pole[2];
  const f = -1.5 * gm * j2 * R * R / (r2 * r2);
  const g = 1.0 - 5.0 * s * s;
  out[0] = f * (g * ux + 2.0 * s * pole[0]);
  out[1] = f * (g * uy + 2.0 * s * pole[1]);
  out[2] = f * (g * uz + 2.0 * s * pole[2]);
}
const J2_SCRATCH = new Float64Array(3);
const Z_AXIS = [0.0, 0.0, 1.0];

/**
 * Cross product helper [a x b]
 */
function cross3(a, b, out) {
  out[0] = a[1] * b[2] - a[2] * b[1];
  out[1] = a[2] * b[0] - a[0] * b[2];
  out[2] = a[0] * b[1] - a[1] * b[0];
}

const evalRhsScratchGm = new Float64Array(32);
const evalRhsScratchV2 = new Float64Array(32);
const evalRhsScratchPhi = new Float64Array(32);
const ACCN_SCRATCH = new Float64Array(96);

const MAX_STATE_LEN = 128;
const K1_SCRATCH = new Float64Array(MAX_STATE_LEN);
const K2_SCRATCH = new Float64Array(MAX_STATE_LEN);
const K3_SCRATCH = new Float64Array(MAX_STATE_LEN);
const K4_SCRATCH = new Float64Array(MAX_STATE_LEN);
const K5_SCRATCH = new Float64Array(MAX_STATE_LEN);
const K6_SCRATCH = new Float64Array(MAX_STATE_LEN);
const K7_SCRATCH = new Float64Array(MAX_STATE_LEN);
const K8_SCRATCH = new Float64Array(MAX_STATE_LEN);
const K9_SCRATCH = new Float64Array(MAX_STATE_LEN);
const K10_SCRATCH = new Float64Array(MAX_STATE_LEN);
const K11_SCRATCH = new Float64Array(MAX_STATE_LEN);
const K12_SCRATCH = new Float64Array(MAX_STATE_LEN);
const YTEMP_SCRATCH = new Float64Array(MAX_STATE_LEN);

const POS_SCRATCH = Array.from({ length: 32 }, () => new Float64Array(3));
const VEL_SCRATCH = Array.from({ length: 32 }, () => new Float64Array(3));

/**
 * Evaluate full sovereign state derivative dY/dt = [V, A(P, V, t)].
 */
function evalRhs(y, gm, dydt, options = {}) {
  const relativistic = options.relativistic !== false;
  const t = options.t || 0.0;
  const n = gm.length;
  const dim = n * 3;

  // Copy velocity to top half of dydt (dP/dt = V)
  for (let i = 0; i < dim; ++i) {
    dydt[i] = y[dim + i];
  }

  // Accelerations in bottom half
  const acc = dydt.subarray(dim);
  acc.fill(0.0);

  const gmCur = evalRhsScratchGm.subarray(0, n);
  for (let i = 0; i < n; ++i) gmCur[i] = gm[i];
  if (t > 0) gmCur[0] += gm[0] * DGM_SUN_DT_REL * t;

  const pos = POS_SCRATCH;
  const vel = VEL_SCRATCH;

  const v2 = evalRhsScratchV2.subarray(0, n);
  const phi = evalRhsScratchPhi.subarray(0, n);
  phi.fill(0.0);

  for (let i = 0; i < n; ++i) {
    const i3 = i * 3;
    const px = y[i3], py = y[i3 + 1], pz = y[i3 + 2];
    const vx = y[dim + i3], vy = y[dim + i3 + 1], vz = y[dim + i3 + 2];
    pos[i][0] = px; pos[i][1] = py; pos[i][2] = pz;
    vel[i][0] = vx; vel[i][1] = vy; vel[i][2] = vz;
    v2[i] = vx * vx + vy * vy + vz * vz;
  }

  // 1. Newtonian Acceleration Matrix
  for (let i = 0; i < n; ++i) {
    const i3 = i * 3;
    const xi = y[i3], yi = y[i3 + 1], zi = y[i3 + 2];
    for (let j = 0; j < i; ++j) {
      if (gmCur[i] === 0 && gmCur[j] === 0) continue;
      const j3 = j * 3;
      const dx = y[j3] - xi;
      const dy = y[j3 + 1] - yi;
      const dz = y[j3 + 2] - zi;
      const r2 = dx * dx + dy * dy + dz * dz;
      if (r2 === 0) continue;

      const r = Math.sqrt(r2);
      const r3inv = 1.0 / (r2 * r);

      phi[i] += gmCur[j] / r;
      phi[j] += gmCur[i] / r;

      if (gmCur[j] > 0) {
        const forceI = gmCur[j] * r3inv;
        acc[i3]     += dx * forceI;
        acc[i3 + 1] += dy * forceI;
        acc[i3 + 2] += dz * forceI;
      }
      if (gmCur[i] > 0) {
        const forceJ = gmCur[i] * r3inv;
        acc[j3]     -= dx * forceJ;
        acc[j3 + 1] -= dy * forceJ;
        acc[j3 + 2] -= dz * forceJ;
      }
    }
  }

  if (!relativistic) return;

  // Newtonian accelerations, needed by the EIH acceleration-dependent terms below
  const accN = ACCN_SCRATCH.subarray(0, dim);
  accN.set(acc);

  // 2. Multi-body EIH 1PN Relativistic Corrections (complete form, Moyer 2003 eq. 4-26):
  //    bracket = 1 − 4Σφ_i/c² − Σφ_j/c² + v_i²/c² + 2v_j²/c² − 4v_i·v_j/c² − 3/2 (r̂·v_j)²/c²
  //              + (r_j − r_i)·a_j / (2c²)
  //    + (GM_j/c²r³)[(r_i − r_j)·(4v_i − 3v_j)](v_i − v_j) + (7/2c²) GM_j a_j / r
  //    The a_j terms (Newtonian accelerations) carry the geodetic (de Sitter) precession of
  //    the lunar orbit; they were missing before the 2026-09-20 audit.
  for (let i = 0; i < n; ++i) {
    const i3 = i * 3;
    for (let j = 0; j < n; ++j) {
      if (i === j || gmCur[j] === 0) continue;
      const j3 = j * 3;

      const rx = pos[i][0] - pos[j][0];
      const ry = pos[i][1] - pos[j][1];
      const rz = pos[i][2] - pos[j][2];
      const r2 = rx * rx + ry * ry + rz * rz;
      if (r2 === 0) continue;

      const r = Math.sqrt(r2);
      const r_hat_x = rx / r, r_hat_y = ry / r, r_hat_z = rz / r;

      const vj = vel[j];
      const vji_x = vel[i][0] - vj[0];
      const vji_y = vel[i][1] - vj[1];
      const vji_z = vel[i][2] - vj[2];

      const r_dot_vj = (rx * vj[0] + ry * vj[1] + rz * vj[2]) / r;
      const v_i_dot_v_j = vel[i][0] * vj[0] + vel[i][1] * vj[1] + vel[i][2] * vj[2];

      const term1 = - (4.0 / C2) * phi[i] - (1.0 / C2) * phi[j];
      const term2 = (v2[i] + 2.0 * v2[j] - 4.0 * v_i_dot_v_j) / C2;
      const term3 = -1.5 * (r_dot_vj * r_dot_vj) / C2;
      const ajx = accN[j3], ajy = accN[j3 + 1], ajz = accN[j3 + 2];
      const term4 = -0.5 * (rx * ajx + ry * ajy + rz * ajz) / C2;      // (r_j − r_i)·a_j / 2c²

      const scalarFactor = (gmCur[j] / (r2)) * (term1 + term2 + term3 + term4);

      const r_dot_4vi_3vj = rx * (4.0 * vel[i][0] - 3.0 * vj[0]) +
                            ry * (4.0 * vel[i][1] - 3.0 * vj[1]) +
                            rz * (4.0 * vel[i][2] - 3.0 * vj[2]);
      const vFactor = (gmCur[j] / (C2 * r2 * r)) * r_dot_4vi_3vj;
      const aFactor = 3.5 * gmCur[j] / (C2 * r);

      acc[i3]     += -scalarFactor * r_hat_x + vFactor * vji_x + aFactor * ajx;
      acc[i3 + 1] += -scalarFactor * r_hat_y + vFactor * vji_y + aFactor * ajy;
      acc[i3 + 2] += -scalarFactor * r_hat_z + vFactor * vji_z + aFactor * ajz;
    }
  }

  // 3. 2PN Schwarzschild Central Precession & Solar Spin Lense-Thirring
  const gmSun = gmCur[0];
  for (let i = 1; i < n; ++i) {
    const i3 = i * 3;
    const rx = pos[i][0] - pos[0][0];
    const ry = pos[i][1] - pos[0][1];
    const rz = pos[i][2] - pos[0][2];
    const r2 = rx * rx + ry * ry + rz * rz;
    if (r2 > 0) {
      const r = Math.sqrt(r2);

      // Lense-Thirring and 2PN both need the velocity relative to the Sun
      const vx = vel[i][0] - vel[0][0];
      const vy = vel[i][1] - vel[0][1];
      const vz = vel[i][2] - vel[0][2];

      // 2PN, test body about the Sun, Schwarzschild in HARMONIC coordinates (the gauge of the EIH block above):
      //   a_2PN = −(GM/c⁴r²)[(9(GM/r)² − 2(GM/r)ṙ²) n̂ + 2(GM/r) ṙ v]
      // For a body at rest this is −9(GM)³/(c⁴r⁴) n̂ — attraction — the r⁻⁴ term of the exact static acceleration
      // −(GM/r²)(1 − 4GM/c²r + 9(GM/c²r)² …) with r = R − GM/c². (2026-10-07: replaces ∓3(GM)²/(c⁴r⁴), whose sign
      // differed between the engine's copy and this one and whose dimension was not an acceleration;
      // checked against the exact geodesic in pn2-schwarzschild.test.js.)
      {
        const rdot = (rx * vx + ry * vy + rz * vz) / r, mr = gmSun / r;
        const A2 = 9.0 * mr * mr - 2.0 * mr * rdot * rdot, B2 = 2.0 * mr * rdot;
        const f2 = -gmSun / (C4 * r2);
        acc[i3]     += f2 * (A2 * rx / r + B2 * vx);
        acc[i3 + 1] += f2 * (A2 * ry / r + B2 * vy);
        acc[i3 + 2] += f2 * (A2 * rz / r + B2 * vz);
      }

      const r_dot_S = rx * S_SUN_VEC[0] + ry * S_SUN_VEC[1] + rz * S_SUN_VEC[2];
      const v_cross_r = [vy * rz - vz * ry, vz * rx - vx * rz, vx * ry - vy * rx];
      const v_cross_S = [vy * S_SUN_VEC[2] - vz * S_SUN_VEC[1], vz * S_SUN_VEC[0] - vx * S_SUN_VEC[2], vx * S_SUN_VEC[1] - vy * S_SUN_VEC[0]];

      const termSpinFactor = (3.0 * r_dot_S / r2);
      const ltFactor = 2.0 / (C2 * r2 * r);

      acc[i3]     += ltFactor * (termSpinFactor * v_cross_r[0] + v_cross_S[0]);
      acc[i3 + 1] += ltFactor * (termSpinFactor * v_cross_r[1] + v_cross_S[1]);
      acc[i3 + 2] += ltFactor * (termSpinFactor * v_cross_r[2] + v_cross_S[2]);
    }
  }

  // 4. Earth J2 on the Moon about the Earth's pole (Body index 3=Earth, 4=Moon).
  //    options.earthPole: unit vector of the (mean) pole of date in the integration frame;
  //    default J2000 z. Newton-3 reaction on Earth with the mass ratio.
  if (n >= 5) {
    const rx = pos[4][0] - pos[3][0];
    const ry = pos[4][1] - pos[3][1];
    const rz = pos[4][2] - pos[3][2];
    const pole = options.earthPole || Z_AXIS;
    const a = J2_SCRATCH;
    j2Accel(rx, ry, rz, gmCur[3], J2_EARTH, R_EARTH_AU, pole, a);
    const m4 = 3 * 3, m5 = 4 * 3;   // acc slots: m4 = Earth (body 3), m5 = Moon (body 4).
    // AUDIT 2026-09-20: these were 4*3 and 4*4 (slots 12 and 16), i.e. the Moon's J2 acceleration
    // was written into Mars.y/Mars.z/Jupiter.x and the Moon received only −GMm/GMe of it.
    // That bug was the whole ~11.5″/yr Moon drift and the 0.2–0.4″ Mars/Jupiter residuals.
    acc[m5] += a[0]; acc[m5 + 1] += a[1]; acc[m5 + 2] += a[2];
    const massRatio = gmCur[4] / gmCur[3];
    acc[m4] -= massRatio * a[0]; acc[m4 + 1] -= massRatio * a[1]; acc[m4 + 2] -= massRatio * a[2];

    // 7. Lunar figure. Earth (point mass) in the Moon's J2m field about the lunar pole, plus
    //    the C22m term with the long axis locked toward Earth: on Earth, a = −9·GMm·C22·R²/d⁴ · d̂
    //    (d from Moon to Earth; derived by differentiating the (2,2) potential at d ∥ x̂).
    //    The Moon receives the Newton-3 reaction (−GMe/GMm × a_earth).
    if (options.lunarFigure !== false) {
      const dx = -rx, dy = -ry, dz = -rz;                       // Moon -> Earth
      j2Accel(dx, dy, dz, gmCur[4], J2_MOON, R_MOON_AU, LUNAR_POLE, a);
      const d2 = dx * dx + dy * dy + dz * dz, d = Math.sqrt(d2);
      const fC22 = -9.0 * gmCur[4] * C22_MOON * R_MOON_AU * R_MOON_AU / (d2 * d2 * d);
      a[0] += fC22 * dx; a[1] += fC22 * dy; a[2] += fC22 * dz;
      acc[m4] += a[0]; acc[m4 + 1] += a[1]; acc[m4 + 2] += a[2];
      const q = gmCur[3] / gmCur[4];
      acc[m5] -= q * a[0]; acc[m5 + 1] -= q * a[1]; acc[m5 + 2] -= q * a[2];
    }

    // 8. Lunar tidal secular acceleration (LLR ṅ), along the geocentric velocity.
    if (options.lunarTide !== false) {
      const vx = vel[4][0] - vel[3][0], vy = vel[4][1] - vel[3][1], vz = vel[4][2] - vel[3][2];
      const v = Math.sqrt(vx * vx + vy * vy + vz * vz);
      if (v > 0) {
        const Tt = T_TIDE_MOON * (options.timeSign === -1 ? -1 : 1);   // dissipative: flips under time reversal
        const tx = Tt * vx / v, ty = Tt * vy / v, tz = Tt * vz / v;
        acc[m5] += tx; acc[m5 + 1] += ty; acc[m5 + 2] += tz;
        acc[m4] -= massRatio * tx; acc[m4 + 1] -= massRatio * ty; acc[m4 + 2] -= massRatio * tz;
      }
    }
  }

  // 5. Explicit de Sitter (geodetic) term on the Moon. OFF by default: the EIH 1PN block (2)
  //    already produces the geodetic precession of the lunar orbit; adding this doubles it.
  if (n >= 5 && options.explicitDeSitter === true) {
    const r_es_x = pos[3][0] - pos[0][0];
    const r_es_y = pos[3][1] - pos[0][1];
    const r_es_z = pos[3][2] - pos[0][2];
    const r_es_2 = r_es_x * r_es_x + r_es_y * r_es_y + r_es_z * r_es_z;
    if (r_es_2 > 0) {
      const r_es = Math.sqrt(r_es_2);
      const v_es_x = vel[3][0] - vel[0][0];
      const v_es_y = vel[3][1] - vel[0][1];
      const v_es_z = vel[3][2] - vel[0][2];

      const om_geo = [
        (1.5 * gmSun / (C2 * r_es_2 * r_es)) * (r_es_y * v_es_z - r_es_z * v_es_y),
        (1.5 * gmSun / (C2 * r_es_2 * r_es)) * (r_es_z * v_es_x - r_es_x * v_es_z),
        (1.5 * gmSun / (C2 * r_es_2 * r_es)) * (r_es_x * v_es_y - r_es_y * v_es_x)
      ];

      const v_me_x = vel[4][0] - vel[3][0];
      const v_me_y = vel[4][1] - vel[3][1];
      const v_me_z = vel[4][2] - vel[3][2];

      const a_geo_x = om_geo[1] * v_me_z - om_geo[2] * v_me_y;
      const a_geo_y = om_geo[2] * v_me_x - om_geo[0] * v_me_z;
      const a_geo_z = om_geo[0] * v_me_y - om_geo[1] * v_me_x;

      const m4 = 3 * 3, m5 = 4 * 3;   // acc slots: m4 = Earth (body 3), m5 = Moon (body 4).
    // AUDIT 2026-09-20: these were 4*3 and 4*4 (slots 12 and 16), i.e. the Moon's J2 acceleration
    // was written into Mars.y/Mars.z/Jupiter.x and the Moon received only −GMm/GMe of it.
    // That bug was the whole ~11.5″/yr Moon drift and the 0.2–0.4″ Mars/Jupiter residuals.
      acc[m5]     += a_geo_x;
      acc[m5 + 1] += a_geo_y;
      acc[m5 + 2] += a_geo_z;

      const massRatio = gmCur[4] / gmCur[3];
      acc[m4]     -= massRatio * a_geo_x;
      acc[m4 + 1] -= massRatio * a_geo_y;
      acc[m4 + 2] -= massRatio * a_geo_z;
    }
  }

  // 6. 2.5PN Gravitational Wave Damping (Inner planets + Moon)
  for (let i = 1; i < Math.min(n, 6); ++i) {
    const rx = pos[i][0] - pos[0][0];
    const ry = pos[i][1] - pos[0][1];
    const rz = pos[i][2] - pos[0][2];
    const r2 = rx * rx + ry * ry + rz * rz;
    if (r2 > 0) {
      const r = Math.sqrt(r2);
      const vx = vel[i][0] - vel[0][0];
      const vy = vel[i][1] - vel[0][1];
      const vz = vel[i][2] - vel[0][2];
      const v2_i = vx * vx + vy * vy + vz * vz;
      const rdot = (rx * vx + ry * vy + rz * vz) / r;
      const gmTot = gmSun + gmCur[i];

      const gwFactor = (8.0 * gmSun * gmCur[i]) / (5.0 * C5 * r2 * r);
      const termR = (3.0 * v2_i + 17.0 * gmTot / r) * rdot;
      const termV_x = (v2_i + 9.0 * gmTot / r) * vx;
      const termV_y = (v2_i + 9.0 * gmTot / r) * vy;
      const termV_z = (v2_i + 9.0 * gmTot / r) * vz;

      const i3 = i * 3;
      acc[i3]     += gwFactor * (termR * (rx / r) - termV_x);
      acc[i3 + 1] += gwFactor * (termR * (ry / r) - termV_y);
      acc[i3 + 2] += gwFactor * (termR * (rz / r) - termV_z);
    }
  }
}

/**
 * Authentic DOP853 (8th Order Explicit Runge-Kutta Prince-Dormand 12-stage) Step.
 */
function dop853Step(y, gm, dt, tCurrent, yOut, errOut, options) {
  const len = y.length;

  // DOP853 Nodes C_i
  const c2 = 5.26001519587677318785587544488e-02, c3 = 7.89002279381515978178381316732e-02, c4 = 0.118350341907227396726757197510, c5 = 0.281649658092772603273242802490;
  const c6 = 1.0/3.0, c7 = 0.25, c8 = 0.307692307692307692307692307692, c9 = 0.651282051282051282051282051282;
  const c10 = 0.6, c11 = 0.857142857142857142857142857142, c12 = 1.0;

  const k1 = K1_SCRATCH.subarray(0, len);
  const k2 = K2_SCRATCH.subarray(0, len);
  const k3 = K3_SCRATCH.subarray(0, len);
  const k4 = K4_SCRATCH.subarray(0, len);
  const k5 = K5_SCRATCH.subarray(0, len);
  const k6 = K6_SCRATCH.subarray(0, len);
  const k7 = K7_SCRATCH.subarray(0, len);
  const k8 = K8_SCRATCH.subarray(0, len);
  const k9 = K9_SCRATCH.subarray(0, len);
  const k10 = K10_SCRATCH.subarray(0, len);
  const k11 = K11_SCRATCH.subarray(0, len);
  const k12 = K12_SCRATCH.subarray(0, len);

  const yTemp = YTEMP_SCRATCH.subarray(0, len);
  const opts = { ...options, t: tCurrent };

  // Stage 1
  evalRhs(y, gm, k1, opts);

  // Stage 2
  opts.t = tCurrent + c2 * dt;
  for (let i = 0; i < len; ++i) yTemp[i] = y[i] + dt * (5.26001519587677318785587544488e-2 * k1[i]);
  evalRhs(yTemp, gm, k2, opts);

  // Stage 3
  opts.t = tCurrent + c3 * dt;
  for (let i = 0; i < len; ++i) yTemp[i] = y[i] + dt * (1.97250569845378994544595329183e-2 * k1[i] + 5.91751709536136983633785987549e-2 * k2[i]);
  evalRhs(yTemp, gm, k3, opts);

  // Stage 4
  opts.t = tCurrent + c4 * dt;
  for (let i = 0; i < len; ++i) yTemp[i] = y[i] + dt * (2.95875854768068491816892993775e-2 * k1[i] + 8.87627564304205475450678981324e-2 * k3[i]);
  evalRhs(yTemp, gm, k4, opts);

  // Stage 5
  opts.t = tCurrent + c5 * dt;
  for (let i = 0; i < len; ++i) yTemp[i] = y[i] + dt * (2.41365134159266685502369798665e-1 * k1[i] - 8.84549479328286085344864962717e-1 * k3[i] + 9.24834003261792003115737966543e-1 * k4[i]);
  evalRhs(yTemp, gm, k5, opts);

  // Stage 6
  opts.t = tCurrent + c6 * dt;
  for (let i = 0; i < len; ++i) yTemp[i] = y[i] + dt * (3.7037037037037037037037037037e-2 * k1[i] + 1.70828608729473871279604482173e-1 * k4[i] + 1.25467687566822425016691814123e-1 * k5[i]);
  evalRhs(yTemp, gm, k6, opts);

  // Stage 7
  opts.t = tCurrent + c7 * dt;
  for (let i = 0; i < len; ++i) yTemp[i] = y[i] + dt * (3.7109375e-2 * k1[i] + 1.70252211019544039314978060272e-1 * k4[i] + 6.02165389804559606850219397283e-2 * k5[i] - 1.7578125e-2 * k6[i]);
  evalRhs(yTemp, gm, k7, opts);

  // Stage 8
  opts.t = tCurrent + c8 * dt;
  for (let i = 0; i < len; ++i) yTemp[i] = y[i] + dt * (3.70920001185047927108779319836e-2 * k1[i] + 1.70383925712239993810214054705e-1 * k4[i] + 1.07262030446373284651809199168e-1 * k5[i] - 1.53194377486244017527936158236e-2 * k6[i] + 8.27378916381402288758473766002e-3 * k7[i]);
  evalRhs(yTemp, gm, k8, opts);

  // Stage 9
  opts.t = tCurrent + c9 * dt;
  for (let i = 0; i < len; ++i) yTemp[i] = y[i] + dt * (6.24110958716075717114429577812e-1 * k1[i] - 3.36089262944694129406857109825 * k4[i] - 8.68219346841726006818189891453e-1 * k5[i] + 2.75920996994467083049415600797e1 * k6[i] + 2.01540675504778934086186788979e1 * k7[i] - 4.34898841810699588477366255144e1 * k8[i]);
  evalRhs(yTemp, gm, k9, opts);

  // Stage 10
  opts.t = tCurrent + c10 * dt;
  for (let i = 0; i < len; ++i) yTemp[i] = y[i] + dt * (4.77662536438264365890433908527e-1 * k1[i] - 2.48811461997166764192642586468 * k4[i] - 5.90290826836842996371446475743e-1 * k5[i] + 2.12300514481811942347288949897e1 * k6[i] + 1.52792336328824235832596922938e1 * k7[i] - 3.32882109689848629194453265587e1 * k8[i] - 2.03312017085086261358222928593e-2 * k9[i]);
  evalRhs(yTemp, gm, k10, opts);

  // Stage 11
  opts.t = tCurrent + c11 * dt;
  for (let i = 0; i < len; ++i) yTemp[i] = y[i] + dt * (-9.3714243008598732571704021658e-1 * k1[i] + 5.18637242884406370830023853209 * k4[i] + 1.09143734899672957818500254654 * k5[i] - 8.14978701074692612513997267357 * k6[i] - 1.85200656599969598641566180701e1 * k7[i] + 2.27394870993505042818970056734e1 * k8[i] + 2.49360555267965238987089396762 * k9[i] - 3.0467644718982195003823669022 * k10[i]);
  evalRhs(yTemp, gm, k11, opts);

  // Stage 12
  opts.t = tCurrent + c12 * dt;
  for (let i = 0; i < len; ++i) yTemp[i] = y[i] + dt * (2.27331014751653820792359768449 * k1[i] - 1.05344954667372501984066689879e1 * k4[i] - 2.00087205822486249909675718444 * k5[i] - 1.79589318631187989172765950534e1 * k6[i] + 2.79488845294199600508499808837e1 * k7[i] - 2.85899827713502369474065508674 * k8[i] - 8.87285693353062954433549289258 * k9[i] + 1.23605671757943030647266201528e1 * k10[i] + 6.43392746015763530355970484046e-1 * k11[i]);
  evalRhs(yTemp, gm, k12, opts);

  // DOP853 8th-order solution b_i (Hairer, Nørsett, Wanner)
  const b1 = 5.42937341165687622380535766363e-02;
  const b6 = 4.45031289275240888144113950566;
  const b7 = 1.89151789931450038304281599044;
  const b8 = -5.8012039600105847814672114227;
  const b9 = 3.1116436695781989440891606237e-01;
  const b10 = -1.52160949662516078556178806805e-01;
  const b11 = 2.01365400804030348374776537501e-01;
  const b12 = 4.47106157277725905176885569043e-02;

  const e1 = 0.01312004499419488073250116072708;
  const e6 = -1.2251564463762044371032637160792;
  const e7 = -0.4957589496572501915214079952814;
  const e8 = 1.6643771824549864024404553211904;
  const e9 = -0.35032884874997368168864818875484;
  const e10 = 0.33417911871301747902973262547479;
  const e11 = 0.08192320648511571246570742613857;
  const e12 = -0.022355307863886294282884165816350;

  let maxErr = 0.0;
  for (let i = 0; i < len; ++i) {
    const y8 = y[i] + dt * (b1 * k1[i] + b6 * k6[i] + b7 * k7[i] + b8 * k8[i] + b9 * k9[i] + b10 * k10[i] + b11 * k11[i] + b12 * k12[i]);
    const err = Math.abs(dt * (e1 * k1[i] + e6 * k6[i] + e7 * k7[i] + e8 * k8[i] + e9 * k9[i] + e10 * k10[i] + e11 * k11[i] + e12 * k12[i]));

    yOut[i] = y8;
    if (err > maxErr) maxErr = err;
  }

  errOut[0] = maxErr;
}

/**
 * Propagate Sovereign N-body system over requested times.
 * @param {Array<Array<number>>} initialPositions - Nx3 array of positions (AU)
 * @param {Array<Array<number>>} initialVelocities - Nx3 array of velocities (AU/day)
 * @param {Array<number>} evalDays - Array of evaluation days relative to initial epoch
 * @param {Object} options - Integration options { rtol, atol, maxStep, relativistic }
 */
function propagate(initialPositions, initialVelocities, evalDays, options = {}) {
  const rtol = options.rtol || 1e-12;
  const atol = options.atol || 1e-15;
  const maxStep = options.maxStep || 1.0;
  const gm = Float64Array.from(options.gm || STANDARD_GM);

  const numBodies = gm.length;
  const dim = numBodies * 3;
  const len = dim * 2;

  const currentY = new Float64Array(len);

  for (let i = 0; i < numBodies; ++i) {
    currentY[i * 3]         = initialPositions[i][0];
    currentY[i * 3 + 1]     = initialPositions[i][1];
    currentY[i * 3 + 2]     = initialPositions[i][2];

    currentY[dim + i * 3]   = initialVelocities[i][0];
    currentY[dim + i * 3 + 1] = initialVelocities[i][1];
    currentY[dim + i * 3 + 2] = initialVelocities[i][2];
  }

  const results = [];
  let tCurrent = 0.0;
  let dt = Math.min(0.1, evalDays[1] || 0.1);

  const nextY = new Float64Array(len);
  const errArr = new Float64Array(1);

  let evalIdx = 0;
  if (evalDays[0] === 0.0) {
    const snap = [];
    for (let i = 0; i < numBodies; ++i) {
      snap.push({
        name: BODY_NAMES[i] || `Body_${i}`,
        pos: [currentY[i * 3], currentY[i * 3 + 1], currentY[i * 3 + 2]],
        vel: [currentY[dim + i * 3], currentY[dim + i * 3 + 1], currentY[dim + i * 3 + 2]]
      });
    }
    results.push({ t: 0.0, bodies: snap });
    evalIdx++;
  }

  const targetFinalTime = evalDays[evalDays.length - 1];

  while (tCurrent < targetFinalTime && evalIdx < evalDays.length) {
    const targetT = evalDays[evalIdx];
    const stepDt = Math.min(dt, targetT - tCurrent);

    dop853Step(currentY, gm, stepDt, tCurrent, nextY, errArr, options);
    const err = errArr[0];
    let normY = 0;
    for (let i = 0; i < len; ++i) normY += nextY[i] * nextY[i];
    const tol = atol + rtol * Math.sqrt(normY);

    if (err <= tol || stepDt <= 1e-8) {
      tCurrent += stepDt;
      currentY.set(nextY);

      if (Math.abs(tCurrent - targetT) < 1e-5) {
        tCurrent = targetT;
        const snap = [];
        for (let i = 0; i < numBodies; ++i) {
          snap.push({
            name: BODY_NAMES[i] || `Body_${i}`,
            pos: [currentY[i * 3], currentY[i * 3 + 1], currentY[i * 3 + 2]],
            vel: [currentY[dim + i * 3], currentY[dim + i * 3 + 1], currentY[dim + i * 3 + 2]]
          });
        }
        results.push({ t: tCurrent, bodies: snap });
        evalIdx++;
      }

      // Step size adjustment for 8th order solver: scale = (tol / err)^(1/8)
      const scale = err === 0 ? 1.5 : Math.min(2.0, Math.max(0.2, 0.9 * Math.pow(tol / err, 0.125)));
      dt = Math.min(maxStep, Math.max(1e-5, dt * scale));
    } else {
      // Reject step
      dt = Math.max(1e-12, dt * 0.5);
    }
  }

  return {
    status: 'SUCCESS',
    solver: 'Authentic DOP853 8th-Order 12-Stage Prince-Dormand Pure JS ODE Solver',
    evaluationCount: results.length,
    results: results
  };
}

module.exports = {
  propagate,
  evalRhs,
  STANDARD_GM,
  BODY_NAMES,
  AU_KM,
  DAY_S,
  // physical constants of the force model (for tests/harnesses)
  J2_EARTH, R_EARTH_AU, J2_MOON, C22_MOON, R_MOON_AU, LUNAR_POLE, T_TIDE_MOON, NDOT_MOON_RAD_DAY2
};
