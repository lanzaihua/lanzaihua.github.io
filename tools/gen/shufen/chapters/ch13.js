'use strict';
const G = require('../chgeneric2');
const F = require('../formulas-part2');
const name = '第十三章 函数列与函数项级数';
module.exports = { name, build() { return G.build({ name, kind: 'uniform', k: 1, formulas: F[name] }); } };