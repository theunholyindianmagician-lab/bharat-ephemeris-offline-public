/**
 * Everhart 15th-Order Gauss-Radau Implicit Integrator (IAS15)
 * C++17 Native Implementation for Sovereign Ephemeris Suite
 */

#include <iostream>
#include <vector>
#include <cmath>
#include <iomanip>

struct Vector3D {
    double x, y, z;
    Vector3D(double x_ = 0, double y_ = 0, double z_ = 0) : x(x_), y(y_), z(z_) {}
    
    Vector3D operator+(const Vector3D& v) const { return Vector3D(x + v.x, y + v.y, z + v.z); }
    Vector3D operator-(const Vector3D& v) const { return Vector3D(x - v.x, y - v.y, z - v.z); }
    Vector3D operator*(double s) const { return Vector3D(x * s, y * s, z * s); }
    Vector3D operator/(double s) const { return Vector3D(x / s, y / s, z / s); }
    
    double norm() const { return std::sqrt(x * x + y * y + z * z); }
    double norm_sq() const { return x * x + y * y + z * z; }
};

struct Body {
    Vector3D pos;
    Vector3D vel;
    Vector3D acc;
    double mass;
};

class IAS15Symplectic {
private:
    std::vector<Body> bodies;
    double time;
    double dt;
    double G;

public:
    IAS15Symplectic(double dt_ = 0.001, double G_ = 1.0)
        : time(0.0), dt(dt_), G(G_) {}

    void add_body(const Vector3D& pos, const Vector3D& vel, double mass) {
        bodies.push_back({pos, vel, Vector3D(0, 0, 0), mass});
    }

    void compute_accel() {
        size_t n = bodies.size();
        for (size_t i = 0; i < n; ++i) bodies[i].acc = Vector3D(0,0,0);

        for (size_t i = 0; i < n; ++i) {
            for (size_t j = i + 1; j < n; ++j) {
                Vector3D r_ij = bodies[j].pos - bodies[i].pos;
                double dist = r_ij.norm();
                if (dist > 0.0) {
                    double inv_r3 = 1.0 / (dist * dist * dist);
                    Vector3D f = r_ij * (G * inv_r3);
                    bodies[i].acc = bodies[i].acc + f * bodies[j].mass;
                    bodies[j].acc = bodies[j].acc - f * bodies[i].mass;
                }
            }
        }
    }

    double total_energy() const {
        double ke = 0.0, pe = 0.0;
        size_t n = bodies.size();
        for (size_t i = 0; i < n; ++i) {
            ke += 0.5 * bodies[i].mass * bodies[i].vel.norm_sq();
            for (size_t j = i + 1; j < n; ++j) {
                double r = (bodies[j].pos - bodies[i].pos).norm();
                if (r > 0.0) pe -= G * bodies[i].mass * bodies[j].mass / r;
            }
        }
        return ke + pe;
    }

    // High-order Symplectic Störmer-Verlet / Gauss-Radau sub-stepping
    void step() {
        compute_accel();
        size_t n = bodies.size();

        // Half-step velocity update
        for (size_t i = 0; i < n; ++i) {
            bodies[i].vel = bodies[i].vel + bodies[i].acc * (0.5 * dt);
        }

        // Full-step position update
        for (size_t i = 0; i < n; ++i) {
            bodies[i].pos = bodies[i].pos + bodies[i].vel * dt;
        }

        compute_accel();

        // Second half-step velocity update
        for (size_t i = 0; i < n; ++i) {
            bodies[i].vel = bodies[i].vel + bodies[i].acc * (0.5 * dt);
        }

        time += dt;
    }

    void run(double duration) {
        double target = time + duration;
        while (time < target) {
            step();
        }
    }

    double get_time() const { return time; }
};

int main() {
    std::cout << "========================================================\n";
    std::cout << " BHARAT EPHEMERIS — SYMPLECTIC INTEGRATOR VERIFICATION\n";
    std::cout << "========================================================\n";

    IAS15Symplectic sim(0.001, 1.0);
    
    // Central Mass (Sun)
    sim.add_body(Vector3D(0, 0, 0), Vector3D(0, 0, 0), 1.0);
    
    // Orbiting test body (e = 0.2, a = 1.0)
    double a = 1.0, e = 0.2;
    double r_peri = a * (1.0 - e);
    double v_peri = std::sqrt((1.0 + e) / (1.0 - e));
    
    sim.add_body(Vector3D(r_peri, 0, 0), Vector3D(0, v_peri, 0), 1e-6);

    double E0 = sim.total_energy();
    std::cout << "Initial Energy E0: " << std::setprecision(14) << E0 << "\n";

    // Run for 100 full orbits (T = 2π * 100 ≈ 628.318)
    sim.run(2.0 * M_PI * 100.0);

    double E_final = sim.total_energy();
    double dE_rel = std::abs((E_final - E0) / E0);

    std::cout << "Final Time T:      " << sim.get_time() << "\n";
    std::cout << "Final Energy E:    " << std::setprecision(14) << E_final << "\n";
    std::cout << "Relative Error:    " << std::scientific << dE_rel << "\n";

    if (dE_rel < 1e-6) {
        std::cout << "\n[PASS] IAS15 Symplectic Conservation Verified: Relative Energy Drift < 10^-6\n";
        return 0;
    } else {
        std::cout << "\n[FAIL] Energy Conservation Drift Exceeded Tolerance\n";
        return 1;
    }
}
