'use strict';
const G = require('../chgeneric');
const F = require('../formulasB');
const name = "第二十三章 向量函数微分学";
module.exports = { name, build() { return G.build({ name, kind: "deriv", k: 5, formulas: F[name] }); } };
