'use strict';
/* part3 章节模块：第十四章—第二十三章（packsC 下手写 pack）
   合并方式（build.js 路径）：
     const all = [require('./ch01'), require('./ch02'), require('./ch03')].concat(require('./indexPart3'));
   注意：chapters/ch14.js…ch23.js 目前仍是通用框架 wrapper，未覆盖；本文件用 packsC 版本。
*/
const P = require('../pack');
const nums = ['14', '15', '16', '17', '18', '19', '20', '21', '22', '23'];
module.exports = nums.map(num => {
  const pack = require('../packsC/ch' + num);
  return { name: pack.name, build() { return P.build(pack); } };
});
