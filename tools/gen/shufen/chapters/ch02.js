'use strict';
const P = require('../pack');
const pack = require('../packsA').find(p => p.name.indexOf('第二章') === 0);
module.exports = { name: pack.name, build() { return P.build(pack); } };
