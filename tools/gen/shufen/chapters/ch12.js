'use strict';
const G = require('../chgeneric2');
const F = require('../formulas-part2');
const name = '第十二章 数项级数';
module.exports = { name, build() { return G.build({ name, kind: 'series', k: 1, formulas: F[name] }); } };