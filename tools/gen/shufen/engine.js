'use strict';
/* 数学分析题库生成器 · 通用框架：构建 item、LaTeX 工具、校验 */
const fs = require('fs');
const path = require('path');

const CATS = ['计算题','证明题','概念辨析题','公式填空题','应用题','综合题','反例与存在性题','分类讨论题','误差分析题','多解比较题'];
const KEYS = ['A','B','C','D'];
const FORBID = /模板编号|所属的章节名称|题型名称|题型的依据|标准步骤的第|核心公式或结论|题型特征|适用条件|常见易错点|典型变式|完整步骤|识别特征|下列数学命题|补全下列|证明或说明/;

function mulberry32(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { const t = a % b; a = b; b = t; } return a || 1; }
function isInt(x) { return Math.abs(x - Math.round(x)) < 1e-9; }
function texNum(x) {
  if (isInt(x)) return String(Math.round(x));
  // 有限小数转分数
  for (let d = 2; d <= 64; d++) {
    if (Math.abs(x * d - Math.round(x * d)) < 1e-9) {
      const n = Math.round(x * d); const g = gcd(n, d);
      return (n / g < 0 ? '-' : '') + '\\frac{' + Math.abs(n / g) + '}{' + d / g + '}';
    }
  }
  return String(Math.round(x * 1e4) / 1e4);
}
function texFrac(n, d) {
  if (d < 0) { n = -n; d = -d; }
  const g = gcd(n, d); n /= g; d /= g;
  if (d === 1) return String(n);
  return (n < 0 ? '-' : '') + '\\frac{' + Math.abs(n) + '}{' + d + '}';
}
function checkMath(text, where, forb) {
  const s = String(text == null ? '' : text);
  if ((s.match(/\$/g) || []).length % 2) throw new Error('公式定界符不成对 @' + where + ': ' + s.slice(0, 80));
  if (forb !== false && FORBID.test(s)) throw new Error('题干含禁用表述 @' + where + ': ' + s.slice(0, 120));
  return s;
}
function clean(text) { return String(text == null ? '' : text).replace(/\s+$/g, ''); }

/* 每题通用字段，id/subject/chapter 由装配器补 */
function baseItem(type, category, d, o) {
  const question = clean(o.question);
  const answer = clean(o.answer);
  const standardSolution = clean(o.solution);
  const detailedAnalysis = clean(o.analysis);
  if (!question || !answer || !standardSolution || !detailedAnalysis) throw new Error('字段缺失: ' + question.slice(0, 40));
  if (!Array.isArray(o.points) || !o.points.length) throw new Error('points 缺失: ' + question.slice(0, 40));
  if (!Array.isArray(o.pitfalls) || !o.pitfalls.length) throw new Error('pitfalls 缺失: ' + question.slice(0, 40));
  checkMath(question, 'question'); checkMath(answer, 'answer', false); checkMath(standardSolution, 'solution', false); checkMath(detailedAnalysis, 'analysis', false);
  const item = {
    id: '', subject: '', chapter: '',
    templateId: '',
    pointKeys: o.points.slice(0, 3),
    title: clean(o.title || (category + ' · ' + (o.topic || '典型题'))),
    question,
    answer,
    solution: o.steps && o.steps.length ? o.steps.slice(0, 5) : [standardSolution],
    difficulty: d,
    tags: (o.tags || [category]).slice(0, 4),
    source: o.source || '考研原创同型题',
    relatedEntries: [],
    standardSolution,
    detailedAnalysis,
    templateTitle: '',
    templateNotes: null,
    verification: '',
    pitfalls: o.pitfalls.slice(0, 4),
    variants: [],
    points: o.points.slice(0, 3),
    type,
    examOrigin: '考研原创同型题',
    options: [],
    correct: '',
    category
  };
  if (type === 'choice') {
    if (!Array.isArray(o.options) || o.options.length !== 4) throw new Error('选项不足4个: ' + question.slice(0, 40));
    const seen = new Set(o.options.map(x => String(x).replace(/\s+/g, '')));
    if (seen.size !== 4) throw new Error('选项重复: ' + question.slice(0, 40));
    const correct = o.correct;
    if (!(Number.isInteger(correct) && correct >= 0 && correct < 4)) throw new Error('correct 非法: ' + question.slice(0, 40));
    o.options.forEach(t => checkMath(t, 'option', false));
    item.options = o.options.map((text, i) => ({ key: KEYS[i], text: clean(text) }));
    item.correct = KEYS[correct];
    item.answer = clean(o.answer || (KEYS[correct] + '．' + o.options[correct]));
  }
  if (type === 'fill') {
    if (!/____/.test(item.question)) throw new Error('填空题缺少空位: ' + question.slice(0, 60));
  }
  return item;
}
function choice(d, category, o) {
  const opt = { ...o };
  if (!/（\s*）|（ ）/.test(opt.question)) opt.question = String(opt.question).replace(/[。.]?$/, '（ ）。');
  if (opt.answer == null) opt.answer = (KEYS[opt.correct] || 'A') + '．' + opt.options[opt.correct];
  return baseItem('choice', category, d, opt);
}
function fill(d, category, o) {
  if (!/____/.test(o.question)) throw new Error('填空题缺少空位: ' + String(o.question).slice(0, 60));
  return baseItem('fill', category, d, o);
}
function subj(d, category, o) { return baseItem('subjective', category, d, o); }

/* 把 5 个数值答案变成选择项：正确答案 + 3 个接近的干扰项 */
function numericOptions(answerTex, distractors) {
  const opts = [answerTex].concat(distractors.slice(0, 3));
  return opts;
}

function shuffleOptions(opts, correctIdx, seed) {
  const rnd = mulberry32(seed);
  const idx = opts.map((_, i) => i);
  for (let i = idx.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); const t = idx[i]; idx[i] = idx[j]; idx[j] = t; }
  return { options: idx.map(i => opts[i]), correct: idx.indexOf(correctIdx) };
}

module.exports = { CATS, KEYS, mulberry32, texNum, texFrac, gcd, isInt, checkMath, choice, fill, subj, numericOptions, shuffleOptions, FORBID };