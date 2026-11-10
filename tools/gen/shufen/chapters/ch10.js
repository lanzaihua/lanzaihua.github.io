'use strict';
const G = require('../chgeneric2');
const F = require('../formulas-part2');
const name = '第十章 定积分的应用';
module.exports = { name, build() { return G.build({ name, kind: 'integral', k: 4, formulas: F[name] }); } };