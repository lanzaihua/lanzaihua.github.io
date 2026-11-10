'use strict';
const G = require('../chgeneric2');
const F = require('../formulas-part2');
const name = '第十一章 反常积分';
module.exports = { name, build() { return G.build({ name, kind: 'integral', k: 5, formulas: F[name] }); } };