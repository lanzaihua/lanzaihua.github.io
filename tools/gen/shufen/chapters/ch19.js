'use strict';
const G = require('../chgeneric');
const F = require('../formulasB');
const name = "第十九章 含参量积分";
module.exports = { name, build() { return G.build({ name, kind: "integral", k: 5, formulas: F[name] }); } };
