'use strict';
/* part2 章节打包器：新公式表 -> 文本题，num2extra -> 数值题 */
const T = require('./formulabuild2');
const P = require('./pack');
const { buildNumeric2 } = require('./num2extra');
function build(pack) {
  const text = T.textItems({ name: pack.name, formulas: pack.formulas });
  const num = P.numericItems({ name: pack.name, num: buildNumeric2(pack.kind, pack.k) });
  return text.concat(num);
}
module.exports = { build };
