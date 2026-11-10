'use strict';
const G = require('../chgeneric2');
const F = require('../formulas-part2');
const name = '第五章 导数和微分';
module.exports = { name, build() { return G.build({ name, kind: 'deriv', k: 1, formulas: F[name] }); } };