'use strict';
const G = require('../chgeneric2');
const F = require('../formulas-part2');
const name = '第四章 函数的连续性';
module.exports = { name, build() { return G.build({ name, kind: 'limit', k: 1, formulas: F[name] }); } };