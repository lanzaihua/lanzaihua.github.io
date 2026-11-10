'use strict';
const G = require('../chgeneric');
const F = require('../formulasB');
const name = "第二十一章 重积分";
module.exports = { name, build() { return G.build({ name, kind: "multiv", k: 4, formulas: F[name] }); } };
