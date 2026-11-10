'use strict';
/* part2 公共校验与工具 */
const E = require('./engine');
const { CATS } = E;

const TARGETS = ['第四章 函数的连续性', '第五章 导数和微分', '第六章 微分中值定理及其应用', '第七章 实数的完备性',
  '第八章 不定积分', '第九章 定积分', '第十章 定积分的应用', '第十一章 反常积分', '第十二章 数项级数', '第十三章 函数列与函数项级数'];

const norm = s => String(s || '').replace(/\s+/g, '').replace(/[，。；：？！、,.;:?!]/g, '');

function checkChapter(items, name) {
  const errs = [];
  if (name) errs.push = errs.push.bind(errs);
  const byCat = {}, byType = {}, byTypeD = {};
  items.forEach(it => {
    byCat[it.category] = (byCat[it.category] || 0) + 1;
    byType[it.type] = (byType[it.type] || 0) + 1;
    const k = it.type + '|' + it.difficulty;
    byTypeD[k] = (byTypeD[k] || 0) + 1;
    if (it.category === '证明题' && it.type !== 'subjective') errs.push('证明题不是主观题: ' + it.title);
    if (it.category === '公式填空题' && it.type !== 'fill') errs.push('公式填空不是填空: ' + it.title);
    if (it.category === '概念辨析题' && it.type !== 'choice') errs.push('概念辨析不是选择: ' + it.title);
    if (it.type === 'choice' && (!it.options || it.options.length !== 4)) errs.push('选项数不是4: ' + it.title);
    if (it.type === 'choice' && new Set((it.options || []).map(o => norm(o.text))).size !== 4) errs.push('选项重复: ' + it.title);
    if (it.type === 'choice' && !/^[ABCD]$/.test(it.correct || '')) errs.push('correct 非 A-D: ' + it.title);
    if (it.type === 'fill' && !/____/.test(it.question)) errs.push('填空无空位: ' + it.title);
    if (!/考研|真题|同型/.test(it.source || '')) errs.push('source 不合规: ' + it.title);
    if (!it.title || !it.question || !it.answer || !it.standardSolution || !it.detailedAnalysis) errs.push('字段缺失: ' + it.title);
    if (!Array.isArray(it.points) || !it.points.length) errs.push('points 缺失: ' + it.title);
    if (!Array.isArray(it.pitfalls) || !it.pitfalls.length) errs.push('pitfalls 缺失: ' + it.title);
    if (![1, 2, 3, 4, 5].includes(it.difficulty)) errs.push('difficulty 非法: ' + it.title);
    if (it.question.length > 400) errs.push('题干过长: ' + it.title);
    if (/【[^】]+】/.test(it.question)) errs.push('题干含题型前缀: ' + it.title);
  });
  CATS.forEach(c => { if (byCat[c] !== 15) errs.push('分类 ' + c + ' 数量 ' + (byCat[c] || 0) + ' ≠ 15'); });
  ['choice', 'fill', 'subjective'].forEach(t => { if (byType[t] !== 50) errs.push('题型 ' + t + ' 数量 ' + (byType[t] || 0) + ' ≠ 50'); });
  for (let d = 1; d <= 5; d++) ['choice', 'fill', 'subjective'].forEach(t => {
    if (byTypeD[t + '|' + d] !== 10) errs.push('题型×难度 ' + t + '|' + d + ' 数量 ' + (byTypeD[t + '|' + d] || 0) + ' ≠ 10');
  });
  return errs;
}
module.exports = { TARGETS, norm, checkChapter, CATS };
