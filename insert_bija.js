const fs = require('fs');
const core = fs.readFileSync('math-core.js', 'utf8').split('\n');
const bija = fs.readFileSync('quantum-bija.js', 'utf8');

const insertLine = 4570;
const newCore = [
  ...core.slice(0, insertLine - 1),
  bija,
  ...core.slice(insertLine - 1)
].join('\n');

fs.writeFileSync('math-core.js', newCore);
