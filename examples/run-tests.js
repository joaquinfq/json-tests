// Run this file using `mocha`:
// $ /path/to/mocha /path/to/json-tests/examples/run-tests.js
const Runner = require('../src/runner');
const runner = new Runner([__dirname]);
runner.run();
