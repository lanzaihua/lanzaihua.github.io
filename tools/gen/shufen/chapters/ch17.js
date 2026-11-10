'use strict';
const G = require('../chgeneric');
const F = require('../formulasB');
const name = "第十七章 多元函数微分学";
module.exports = { name, build() { return G.build({ name, kind: "multiv", k: 1, formulas: F[name] }); } };
