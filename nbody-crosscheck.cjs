'use strict';
/*
 * N-body cross-check harness (sovereign-stack internal).
 *
 * Question: how close does PURE GRAVITATION (dop853-nbody, 8th-order, EIH 1PN)
 * get to the full analytical theories (VSOP87 planets, ELP2000 Moon) when seeded
 * ONLY from those theories — i.e. before ANY fitting to JPL?
 *
 * Seed  : Sun at rest at origin (inertial frame comoving with the Sun at t0);
 *         6 planets from full VSOP87 heliocentric pos+vel; Moon = Earth + ELP
 *         (ELP velocity by central finite-difference). Pluto/Uranus/Neptune
 *         absent from this VSOP build → 8-body model. Everything equatorial J2000.
 * Propagate: dop853-nbody with relativistic EIH on.
 * Compare : N-body heliocentric ecliptic longitude vs VSOP (planets);
 *           N-body geocentric ecliptic longitude vs ELP (Moon). Report arcsec.
 */

const path = require('path');
const R = (f) => require(path.join(__dirname, f));
const NB = R('dop853-nbody.js');
const V = R('vsop87-full.js');
const E = R('elp-moon.js');

const EPOCH_JD_TT = 2451545.0;            // J2000.0 TT
const DEG = Math.PI / 180;
const OBLIQ = 84381.406 / 3600 * DEG;     // mean obliquity J2000 (IAU 2006)
const cosE = Math.cos(OBLIQ), sinE = Math.sin(OBLIQ);

// body index order MUST match dop853 STANDARD_GM: Sun,Mer,Ven,Ear,Moon,Mars,Jup,Sat,...
const VSOP_KEY = { 1:'mercury', 2:'venus', 3:'earth', 5:'mars', 6:'jupiter', 7:'saturn' };
const LABEL    = ['Sun','Mercury','Venus','Earth','Moon','Mars','Jupiter','Saturn'];
const NBODY    = 8;
const gm       = NB.STANDARD_GM.slice(0, NBODY);

// ---- helpers ----
function eqToEclLonDeg(x, y, z) {          // equatorial J2000 -> ecliptic longitude (deg)
  const ey = y * cosE + z * sinE;
  const ex = x;
  let lon = Math.atan2(ey, ex) / DEG;
  return (lon % 360 + 360) % 360;
}
function dLonArcsec(a, b) {                 // signed smallest diff, arcsec
  let d = ((a - b + 540) % 360) - 180;
  return d * 3600;
}
function moonGeoState(jd) {                 // ELP geocentric equ J2000 pos (AU) + vel by 7-point stencil O(h^6)
  const h = 0.125;
  const s = (k) => E.equatorialJ2000(jd + k*h);
  const p = s(0), n3=s(-3),n2=s(-2),n1=s(-1),q1=s(1),q2=s(2),q3=s(3);
  const d7 = (m3,m2,m1,P1,P2,P3) =>
    (-m3/60 + 3*m2/20 - 3*m1/4 + 3*P1/4 - 3*P2/20 + P3/60) / h; // O(h^6)
  return {
    pos: [p.x, p.y, p.z],
    vel: [d7(n3.x,n2.x,n1.x,q1.x,q2.x,q3.x), d7(n3.y,n2.y,n1.y,q1.y,q2.y,q3.y), d7(n3.z,n2.z,n1.z,q1.z,q2.z,q3.z)],
  };
}

// ---- seed at epoch ----
function seed() {
  const pos = Array.from({ length: NBODY }, () => [0, 0, 0]);
  const vel = Array.from({ length: NBODY }, () => [0, 0, 0]);
  // Sun index 0 stays at origin, at rest (frame comoving with the Sun at t0)
  let earthP, earthV;
  for (const [idx, key] of Object.entries(VSOP_KEY)) {
    const s = V.equatorialJ2000(key, EPOCH_JD_TT);
    pos[idx] = [s.x, s.y, s.z];
    vel[idx] = [s.vx, s.vy, s.vz];
    if (key === 'earth') { earthP = pos[idx]; earthV = vel[idx]; }
  }
  const m = moonGeoState(EPOCH_JD_TT);       // Moon heliocentric = Earth + geoMoon
  pos[4] = [earthP[0] + m.pos[0], earthP[1] + m.pos[1], earthP[2] + m.pos[2]];
  vel[4] = [earthV[0] + m.vel[0], earthV[1] + m.vel[1], earthV[2] + m.vel[2]];
  return { pos, vel };
}

// ---- reference longitudes from the theories at absolute jd ----
function refPlanetLonDeg(key, jd) { const s = V.equatorialJ2000(key, jd); return eqToEclLonDeg(s.x, s.y, s.z); }
function refMoonGeoLonDeg(jd) { const m = E.equatorialJ2000(jd); return eqToEclLonDeg(m.x, m.y, m.z); }

// ---- N-body longitudes from a result snapshot ----
function nbPlanetHelioLonDeg(bodies, idx) {
  const b = bodies[idx].pos, s = bodies[0].pos;         // heliocentric = body - Sun
  return eqToEclLonDeg(b[0] - s[0], b[1] - s[1], b[2] - s[2]);
}
function nbMoonGeoLonDeg(bodies) {
  const mo = bodies[4].pos, ea = bodies[3].pos;         // geocentric = Moon - Earth
  return eqToEclLonDeg(mo[0] - ea[0], mo[1] - ea[1], mo[2] - ea[2]);
}

function run(evalDays, tag) {
  const { pos, vel } = seed();
  const t0 = Date.now();
  const out = NB.propagate(pos, vel, evalDays, { relativistic: true, rtol: 1e-13, atol: 1e-16, maxStep: 0.25, gm });
  const secs = ((Date.now() - t0) / 1000).toFixed(1);
  console.log(`\n=== ${tag} · ${out.status} · ${out.results.length}/${evalDays.length} snapshots · ${secs}s ===`);
  const hdr = ['yrs', ...[1,2,3,5,6,7].map(i => LABEL[i]), 'Moon'];
  console.log(hdr.map(h => String(h).padStart(9)).join(''));
  for (const snap of out.results) {
    const jd = EPOCH_JD_TT + snap.t;
    const yrs = (snap.t / 365.25);
    const row = [yrs.toFixed(2)];
    for (const i of [1,2,3,5,6,7]) {
      const d = dLonArcsec(nbPlanetHelioLonDeg(snap.bodies, i), refPlanetLonDeg(VSOP_KEY[i], jd));
      row.push(d.toFixed(2));
    }
    row.push(dLonArcsec(nbMoonGeoLonDeg(snap.bodies), refMoonGeoLonDeg(jd)).toFixed(2));
    console.log(row.map(c => String(c).padStart(9)).join(''));
  }
  console.log('(values = N-body − theory, arcsec of ecliptic longitude)');
}

// smoke: t=0 consistency + 1 month + 3 months + 1 year
run([0, 30, 91.31, 365.25], 'SMOKE (seed/frame check)');
// horizons: yearly to 10y
const yearly = [0]; for (let y = 1; y <= 10; y++) yearly.push(y * 365.25);
run(yearly, 'HORIZON 0..10 yr (yearly)');
