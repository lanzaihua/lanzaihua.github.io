'use strict';
/* 难度自查与重排：按内容复杂度重排每题难度，保持每(章,题型,星级)恰10题 */
const fs = require('fs');
const path = require('path');
const SRC = process.argv[2] || path.join(__dirname, '..', '..', '..', 'src', 'data', 'bank-analysis.json');
const OUT = process.argv[3] || path.join(__dirname, 'out', 'bank-analysis-regraded.json');
const doc = JSON.parse(fs.readFileSync(SRC, 'utf8'));
const items = doc.items.slice();
const CAT_W = { '概念辨析题': 1.0, '公式填空题': 1.1, '计算题': 1.8, '应用题': 2.2, '反例与存在性题': 2.4, '误差分析题': 2.6, '综合题': 2.8, '多解比较题': 2.9, '分类讨论题': 3.0 };
const hardWords = [['一致收敛',1.2],['一致连续',1.0],['柯西',0.8],['泰勒',1.0],['洛必达',0.9],['中值定理',0.9],['格林',1.0],['高斯',1.0],['斯托克斯',1.0],['雅可比',1.0],['隐函数',1.0],['傅里叶',0.9],['幂级数',0.8],['反常积分',0.7],['曲面积分',0.9],['曲线积分',0.8],['重积分',0.8],['偏导',0.7],['可微',0.7],['收敛',0.4],['证明',0.5],['讨论',0.5],['估计',0.4]];
const easyWords = [['默写',-1.0],['定义',-0.4],['直接',-0.4],['求导',-0.3],['简单',-0.5],['代入',-0.3]];
const chapters = [...new Set(items.map(i => i.chapter))];
function complexity(it) {
  const q = String(it.question || ''), s = String(it.standardSolution || it.answer || '');
  let v = (CAT_W[it.category] || 2) + chapters.indexOf(it.chapter) * 0.06;
  v += Math.min(q.length, 160) / 160 * 1.2;
  v += Math.min(s.length, 300) / 300 * 1.0;
  v += (q.match(/\\int|\\sum|\\lim|\\iint|\\iiint|\\oint|\\frac|\\sqrt/g) || []).length * 0.15;
  v += (q.match(/\d/g) || []).length * 0.02;
  for (const [w, d] of hardWords) if (q.indexOf(w) >= 0) v += d;
  for (const [w, d] of easyWords) if (q.indexOf(w) >= 0) v += d;
  v += ((it.difficulty || 3) - 3) * 0.15; // 保留原难度一点权重
  return v;
}
const byGroup = new Map();
items.forEach(it => { const k = it.chapter + '|' + it.type; if (!byGroup.has(k)) byGroup.set(k, []); byGroup.get(k).push(it); });
let changed = 0;
const before = items.map(i => i.difficulty);
for (const [k, arr] of byGroup) {
  if (arr.length !== 50) throw new Error('组 ' + k + ' 有 ' + arr.length + ' 题');
  const sorted = arr.slice().sort((a, b) => complexity(a) - complexity(b));
  sorted.forEach((it, idx) => { const d = Math.floor(idx / 10) + 1; if (it.difficulty !== d) { it.difficulty = d; changed++; } });
}
// 校验
const bucket = {};
items.forEach(it => { const k = [it.chapter, it.type, it.difficulty].join('|'); bucket[k] = (bucket[k] || 0) + 1; });
const bad = Object.entries(bucket).filter(([k, v]) => v !== 10);
const seen = new Set(); let dup = 0;
items.forEach(it => { const n = String(it.question || '').replace(/\s+/g, ''); if (seen.has(n)) dup++; else seen.add(n); });
console.log('changed difficulty:', changed, 'badBuckets:', bad.length, 'duplicate:', dup);
if (bad.length || dup) process.exit(1);
const outDoc = { subject: 'shufen', items, generatedAt: new Date().toISOString() };
fs.writeFileSync(OUT, JSON.stringify(outDoc, null, 0), 'utf8');
console.log('written', OUT, 'items', items.length);
