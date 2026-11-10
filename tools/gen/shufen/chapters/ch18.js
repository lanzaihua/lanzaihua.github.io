'use strict';
const G = require('../chgeneric');
const F = require('../formulasB');
const name = "第十八章 隐函数定理及其应用";
module.exports = { name, build() { return G.build({ name, kind: "multiv", k: 2, formulas: F[name] }); } };
