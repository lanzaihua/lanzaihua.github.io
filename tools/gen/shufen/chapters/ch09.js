'use strict';
const G = require('../chgeneric2');
const F = require('../formulas-part2');
const name = '第九章 定积分';
module.exports = { name, build() { return G.build({ name, kind: 'integral', k: 3, formulas: F[name] }); } };