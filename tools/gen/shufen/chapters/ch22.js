'use strict';
const G = require('../chgeneric');
const F = require('../formulasB');
const name = "第二十二章 曲面积分";
module.exports = { name, build() { return G.build({ name, kind: "multiv", k: 5, formulas: F[name] }); } };
