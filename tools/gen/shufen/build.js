'use strict';
/* 装配：读取各章生成器 -> 校验 -> 写 src/data/bank-analysis.json */
const fs = require('fs');
const path = require('path');
const E = require('./engine');
const { CATS } = E;

const OUT = process.env.BANK_OUT || path.join(__dirname, 'out', 'bank-analysis.json');
fs.mkdirSync(path.dirname(OUT), { recursive: true });
const chapters = require('./chapters');

function norm(s) { return String(s || '').replace(/\s+/g, ''); }
function check(items) {
  const errs = [];
  const byCat = {}, byType = {}, byTypeD = {};
  items.forEach(it => {
    byCat[it.category] = (byCat[it.category] || 0) + 1;
    byType[it.type] = (byType[it.type] || 0) + 1;
    const k = it.type + '|' + it.difficulty;
    byTypeD[k] = (byTypeD[k] || 0) + 1;
    if (it.category === '证明题' && it.type !== 'subjective') errs.push(it.id + ' 证明题不是主观题');
    if (it.category === '公式填空题' && it.type !== 'fill') errs.push(it.id + ' 公式填空不是填空');
    if (it.category === '概念辨析题' && it.type !== 'choice') errs.push(it.id + ' 概念辨析不是选择');
    if (it.type === 'choice' && (!it.options || it.options.length !== 4)) errs.push(it.id + ' 选项数不是4');
    if (it.type === 'fill' && !/____/.test(it.question)) errs.push(it.id + ' 填空无空位');
    if (!/考研|真题|同型/.test(it.source || '')) errs.push(it.id + ' source');
    if (!it.title || !it.question || !it.answer || !it.standardSolution || !it.detailedAnalysis) errs.push(it.id + ' 字段缺失');
    if (it.question.length > 400) errs.push(it.id + ' 题干过长');
  });
  CATS.forEach(c => { if (byCat[c] !== 15) errs.push('分类 ' + c + ' 数量 ' + (byCat[c] || 0) + ' ≠ 15'); });
  ['choice', 'fill', 'subjective'].forEach(t => { if (byType[t] !== 50) errs.push('题型 ' + t + ' 数量 ' + (byType[t] || 0) + ' ≠ 50'); });
  for (let d = 1; d <= 5; d++) ['choice', 'fill', 'subjective'].forEach(t => {
    const k = t + '|' + d;
    if (byTypeD[k] !== 10) errs.push('题型×难度 ' + k + ' 数量 ' + (byTypeD[k] || 0) + ' ≠ 10');
  });
  return errs;
}

const all = [];
let seq = 1;
for (const ch of chapters) {
  const items = ch.build();
  if (items.length !== 150) throw new Error(ch.name + ' 生成 ' + items.length + ' 题 ≠ 150');
  const errs = check(items);
  if (errs.length) throw new Error(ch.name + ' 校验失败: ' + errs.slice(0, 6).join(' | '));
  items.forEach(it => {
    it.id = 'MA-' + String(seq++).padStart(4, '0');
    it.subject = 'shufen';
    it.chapter = ch.name;
  });
  all.push(...items);
  console.log(ch.name + ': ' + items.length);
}
const seen = new Map();
for (const it of all) {
  const n = norm(it.question);
  if (seen.has(n)) throw new Error('重复题干: ' + it.id + ' / ' + seen.get(n) + ': ' + n.slice(0, 50));
  seen.set(n, it.id);
}
const doc = { subject: 'shufen', items: all, generatedAt: new Date().toISOString() };
fs.writeFileSync(OUT, JSON.stringify(doc, null, 0), 'utf8');
console.log('total', all.length, 'unique', seen.size);
console.log('bytes', fs.statSync(OUT).size);
