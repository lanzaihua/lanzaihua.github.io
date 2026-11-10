'use strict';
const G = require('../chgeneric');
const F = require('../formulasA');
const name = "第十四章 幂级数";
module.exports = { name, build() { return G.build({ name, kind: "series", k: 2, formulas: F[name] }); } };
