'use strict';
const G = require('../chgeneric');
const F = require('../formulasB');
const name = "第十五章 傅里叶级数";
module.exports = { name, build() { return G.build({ name, kind: "series", k: 3, formulas: F[name] }); } };
