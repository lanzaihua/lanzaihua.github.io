'use strict';
const T = require('./formulabuild');
const P = require('./pack');
const { buildNumeric } = require('./groupnum');
function build(pack) {
  const text = T.textItems({ name: pack.name, formulas: pack.formulas });
  const num = P.numericItems({ name: pack.name, num: buildNumeric(pack.kind, pack.k) });
  num.forEach(it => { it.question = '在《' + pack.name + '》中，' + it.question; });
  return text.concat(num);
}
module.exports = { build };
