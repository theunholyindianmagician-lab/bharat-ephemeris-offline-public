const IAS15Engine = require('./ias15-integrator.js');

console.log("========================================================");
console.log(" IAS15 JS SYMPLECTIC INTEGRATOR TEST SUITE");
console.log("========================================================");

const sim = new IAS15Engine(0.001, 1.0);

// Sun at origin
sim.addParticle(0, 0, 0, 0, 0, 0, 1.0);

// Keplerian orbit (e = 0.2, a = 1.0)
const a = 1.0;
const e = 0.2;
const r_peri = a * (1.0 - e);
const v_peri = Math.sqrt((1.0 + e) / (1.0 - e));

sim.addParticle(r_peri, 0, 0, 0, v_peri, 0, 1e-6);

const E0 = sim.calculateTotalEnergy();
console.log("Initial Total Energy E0: ", E0.toFixed(14));

// Propagate 100 orbits (T = 2π * 100)
sim.run(2 * Math.PI * 100);

const E_final = sim.calculateTotalEnergy();
const dE_rel = Math.abs((E_final - E0) / E0);

console.log("Final Simulation Time:  ", sim.currentTime.toFixed(4));
console.log("Final Total Energy E:   ", E_final.toFixed(14));
console.log("Relative Energy Drift:  ", dE_rel.toExponential(6));

if (dE_rel < 1e-6) {
  console.log("\n[PASS] IAS15 JS Energy Conservation Verified: Relative Drift < 10^-6");
  process.exit(0);
} else {
  console.error("\n[FAIL] Energy Drift Exceeded Tolerance");
  process.exit(1);
}
