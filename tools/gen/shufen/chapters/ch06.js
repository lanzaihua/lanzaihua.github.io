'use strict';
const G = require('../chgeneric2');
const F = require('../formulas-part2');
const name = '第六章 微分中值定理及其应用';
module.exports = { name, build() { return G.build({ name, kind: 'deriv', k: 2, formulas: F[name] }); } };