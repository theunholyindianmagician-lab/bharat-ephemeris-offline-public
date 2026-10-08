
import pkg from './math-core.js';
const { canonicalGrahaModel } = pkg;
const jds = JSON.parse(process.argv[2]);
const res = jds.map(jd => {
    // MathCore returns array of {key, longitude}
    const o = canonicalGrahaModel(jd, { observer: { lat: 0, lon: 0 } });
    const m = {};
    if (Array.isArray(o)) {
        for (const r of o) m[r.key === 'chandra' ? 'candra' : r.key.toLowerCase()] = r.longitude;
    }
    return m;
});
console.log(JSON.stringify(res));
