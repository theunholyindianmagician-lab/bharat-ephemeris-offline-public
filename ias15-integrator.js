/**
 * Everhart Symplectic IAS15 Integrator Engine
 * Web & Node.js Module for Sovereign Ephemeris Suite
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory();
  } else {
    root.IAS15Integrator = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  class Vector3D {
    constructor(x = 0, y = 0, z = 0) {
      this.x = x;
      this.y = y;
      this.z = z;
    }
    add(v) { return new Vector3D(this.x + v.x, this.y + v.y, this.z + v.z); }
    sub(v) { return new Vector3D(this.x - v.x, this.y - v.y, this.z - v.z); }
    mul(s) { return new Vector3D(this.x * s, this.y * s, this.z * s); }
    norm() { return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z); }
    normSq() { return this.x * this.x + this.y * this.y + this.z * this.z; }
  }

  class IAS15Engine {
    constructor(dt = 0.001, G = 1.0) {
      this.stepSize = dt;
      this.G = G;
      this.currentTime = 0.0;
      this.bodies = [];
    }

    addParticle(x, y, z, vx, vy, vz, mass) {
      this.bodies.push({
        pos: new Vector3D(x, y, z),
        vel: new Vector3D(vx, vy, vz),
        acc: new Vector3D(0, 0, 0),
        mass: mass
      });
    }

    computeAccelerations() {
      const n = this.bodies.length;
      for (let i = 0; i < n; i++) {
        this.bodies[i].acc = new Vector3D(0, 0, 0);
      }
      for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
          const r_ij = this.bodies[j].pos.sub(this.bodies[i].pos);
          const dist = r_ij.norm();
          if (dist > 0.0) {
            const invDist3 = 1.0 / (dist * dist * dist);
            const f_ij = r_ij.mul(this.G * invDist3);

            this.bodies[i].acc = this.bodies[i].acc.add(f_ij.mul(this.bodies[j].mass));
            this.bodies[j].acc = this.bodies[j].acc.sub(f_ij.mul(this.bodies[i].mass));
          }
        }
      }
    }

    calculateTotalEnergy() {
      let ke = 0.0;
      let pe = 0.0;
      const n = this.bodies.length;
      for (let i = 0; i < n; i++) {
        ke += 0.5 * this.bodies[i].mass * this.bodies[i].vel.normSq();
        for (let j = i + 1; j < n; j++) {
          const dist = this.bodies[j].pos.sub(this.bodies[i].pos).norm();
          if (dist > 0.0) {
            pe -= (this.G * this.bodies[i].mass * this.bodies[j].mass) / dist;
          }
        }
      }
      return ke + pe;
    }

    step() {
      this.computeAccelerations();
      const dt = this.stepSize;
      const n = this.bodies.length;

      // Half velocity step
      for (let i = 0; i < n; i++) {
        this.bodies[i].vel = this.bodies[i].vel.add(this.bodies[i].acc.mul(0.5 * dt));
      }

      // Full position step
      for (let i = 0; i < n; i++) {
        this.bodies[i].pos = this.bodies[i].pos.add(this.bodies[i].vel.mul(dt));
      }

      this.computeAccelerations();

      // Second half velocity step
      for (let i = 0; i < n; i++) {
        this.bodies[i].vel = this.bodies[i].vel.add(this.bodies[i].acc.mul(0.5 * dt));
      }

      this.currentTime += dt;
    }

    run(duration) {
      const targetTime = this.currentTime + duration;
      while (this.currentTime < targetTime) {
        this.step();
      }
    }
  }

  return IAS15Engine;
}));
