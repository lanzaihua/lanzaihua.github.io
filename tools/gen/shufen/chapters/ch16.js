'use strict';
const G = require('../chgeneric');
const F = require('../formulasB');
const name = "第十六章 多元函数的极限与连续";
module.exports = { name, build() { return G.build({ name, kind: "multiv", k: 0, formulas: F[name] }); } };
