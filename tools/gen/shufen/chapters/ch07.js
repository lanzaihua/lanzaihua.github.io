'use strict';
const G = require('../chgeneric2');
const F = require('../formulas-part2');
const name = '第七章 实数的完备性';
module.exports = { name, build() { return G.build({ name, kind: 'complete', k: 1, formulas: F[name] }); } };