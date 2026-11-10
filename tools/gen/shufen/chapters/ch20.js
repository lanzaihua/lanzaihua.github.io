'use strict';
const G = require('../chgeneric');
const F = require('../formulasB');
const name = "第二十章 曲线积分";
module.exports = { name, build() { return G.build({ name, kind: "multiv", k: 3, formulas: F[name] }); } };
