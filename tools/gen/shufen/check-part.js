'use strict';
/* 分片自检：node tools/gen/shufen/check-part.js out/bank-analysis-part2.json [part1...] */
const fs = require('fs');
const path = require('path');
const E = require('./engine');
const CATS = ['计算题','证明题','概念辨析题','公式填空题','应用题','综合题','反例与存在性题','分类讨论题','误差分析题','多解比较题'];
const CATTYPE = { '证明题': 'subjective', '公式填空题': 'fill', '概念辨析题': 'choice' };
const norm = s => String(s || '').replace(/\s+/g, '');

function main() {
  const args = process.argv.slice(2);
  if (!args.length) { console.log('用法: node check-part.js <分片.json> [other.json ...]'); process.exit(2); }
  const main = JSON.parse(fs.readFileSync(args[0], 'utf8'));
  const others = args.slice(1).map(f => JSON.parse(fs.readFileSync(f, 'utf8')));
  const items = main.items || [];
  const allOthers = [];
  others.forEach(j => (j.items || []).forEach(x => allOthers.push(x)));
  const errs = [];
  const chapters = [...new Set(items.map(i => i.chapter))];
  console.log('文件', args[0], '题数', items.length, '章数', chapters.length);
  chapters.forEach(ch => { const n = items.filter(i => i.chapter === ch).length; if (n !== 150) errs.push(ch + ' 题数 ' + n + ' ≠ 150'); });
  const byCat = {}, byType = {}, cell = {};
  items.forEach(it => {
    byCat[it.category] = (byCat[it.category] || 0) + 1;
    byType[it.type] = (byType[it.type] || 0) + 1;
    const k = it.chapter + '|' + it.type + '|' + it.difficulty;
    cell[k] = (cell[k] || 0) + 1;
    if (!it.question || !it.answer || !it.standardSolution || !it.detailedAnalysis) errs.push((it.id || '?') + ' 字段缺失');
    if (!Array.isArray(it.points) || !it.points.length) errs.push((it.id || '?') + ' 缺 points');
    if (!Array.isArray(it.pitfalls) || !it.pitfalls.length) errs.push((it.id || '?') + ' 缺 pitfalls');
    if (!/考研(原创同型|真题)/.test(String(it.source || ''))) errs.push((it.id || '?') + ' source');
    if (it.examOrigin !== '考研原创同型题' && !/真题/.test(String(it.source || ''))) errs.push((it.id || '?') + ' examOrigin');
    if (!CATS.includes(it.category)) errs.push((it.id || '?') + ' category');
    if (!['choice','fill','subjective'].includes(it.type)) errs.push((it.id || '?') + ' type');
    if (CATTYPE[it.category] && it.type !== CATTYPE[it.category]) errs.push((it.id || '?') + ' 分类题型不符');
    if (it.type === 'choice' && ((it.options || []).length !== 4 || !it.correct)) errs.push((it.id || '?') + ' 选项/答案');
    if (it.type === 'fill' && !/____/.test(String(it.question))) errs.push((it.id || '?') + ' 填空空位');
    ['question','answer','standardSolution','detailedAnalysis'].forEach(f => { const s = String(it[f] || ''); if ((s.match(/\$/g) || []).length % 2) errs.push((it.id || '?') + ' ' + f + ' $不成对'); });
  });
  CATS.forEach(c => { if ((byCat[c] || 0) % 15) errs.push('分类 ' + c + ' 数量 ' + (byCat[c] || 0) + ' 不是15的倍数'); });
  ['choice','fill','subjective'].forEach(t => { if ((byType[t] || 0) % 50) errs.push('题型 ' + t + ' 数量 ' + (byType[t] || 0) + ' 不是50的倍数'); });
  Object.keys(cell).forEach(k => { if (cell[k] !== 10) errs.push('格子 ' + k + ' = ' + cell[k] + ' ≠ 10'); });
  const seen = new Map();
  items.forEach(it => { const n = norm(it.question); if (seen.has(n)) errs.push('内部重复 ' + (it.id || '?') + ' / ' + seen.get(n)); else seen.set(n, it.id); });
  const otherSet = new Map();
  allOthers.forEach(it => { otherSet.set(norm(it.question), it.id || '?'); });
  items.forEach(it => { const n = norm(it.question); if (otherSet.has(n)) errs.push('与他片重复 ' + (it.id || '?') + ' / ' + otherSet.get(n)); });
  console.log('分类', JSON.stringify(byCat), '题型', JSON.stringify(byType));
  if (errs.length) { console.log('问题(' + errs.length + '):'); errs.slice(0, 20).forEach(e => console.log(' - ' + e)); process.exit(1); }
  console.log('通过自检');
}
main();
