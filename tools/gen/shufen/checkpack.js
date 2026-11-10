'use strict';
/* 单章 pack 快速校验：node checkpack.js <pack文件名(不含.js)> */
const path = require('path');
const P = require('./pack2');
const F = require('./p2lib');
const name = process.argv[2];
if (!name) { console.error('用法: node checkpack.js pack-ch09'); process.exit(2); }
const pack = require(path.join(__dirname, name));
const items = P.build(pack);
const errs = F.checkChapter(items);
const { CATS } = F;
const byCat = {}, byType = {}, bucket = {};
items.forEach(it => { byCat[it.category] = (byCat[it.category] || 0) + 1; byType[it.type] = (byType[it.type] || 0) + 1; });
const stems = new Set(items.map(it => F.norm(it.question)));
console.log(JSON.stringify({ name: pack.name, total: items.length, byType, byCat, unique: stems.size, problems: errs }, null, 2));
process.exit(errs.length ? 1 : 0);
