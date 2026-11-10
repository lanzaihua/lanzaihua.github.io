'use strict';
/* 数学分析单科全量校验：node tools/gen/shufen/qa-analysis.js [json] */
const fs = require('fs');
const path = require('path');
const E = require('./engine');
const CATS = ['计算题','证明题','概念辨析题','公式填空题','应用题','综合题','反例与存在性题','分类讨论题','误差分析题','多解比较题'];
const norm = s => String(s || '').replace(/\s+/g, '');
const file = process.argv[2] || 'src/data/bank-analysis.json';
const j = JSON.parse(fs.readFileSync(file, 'utf8'));
const items = j.items || [];
const problems = [];
const chapterStars = {};
const byCat = {}, byType = {}, byChapter = {};
items.forEach(q => {
  byCat[q.category] = (byCat[q.category] || 0) + 1;
  byType[q.type] = (byType[q.type] || 0) + 1;
  byChapter[q.chapter] = (byChapter[q.chapter] || 0) + 1;
  chapterStars[q.chapter + '|' + q.difficulty + '|' + q.type] = (chapterStars[q.chapter + '|' + q.difficulty + '|' + q.type] || 0) + 1;
  if (!q.id || !q.question || !q.answer || !q.standardSolution || !q.detailedAnalysis) problems.push([q.id, 'missing field']);
  if (!/考研(原创同型|真题)/.test(String(q.source || ''))) problems.push([q.id, 'source']);
  if (!CATS.includes(q.category)) problems.push([q.id, 'category']);
  if (!['choice','fill','subjective'].includes(q.type)) problems.push([q.id, 'type']);
  if (q.type === 'choice') { const o = q.options || []; if (o.length !== 4 || new Set(o.map(x => String(x && x.text))).size !== 4 || !q.correct) problems.push([q.id, 'choice']); }
  if (q.type === 'fill' && !/____/.test(q.question)) problems.push([q.id, 'fill blank']);
  if (/【[^】]+】/.test(q.question)) problems.push([q.id, 'type prefix']);
  ['question','answer','standardSolution','detailedAnalysis'].forEach(f => { const s = String(q[f] || ''); if ((s.match(/\$/g) || []).length % 2) problems.push([q.id, f + ' $ unmatched']); });
});
const seen = new Map();
items.forEach(q => { const n = norm(q.question); if (seen.has(n)) problems.push([q.id, 'duplicate of ' + seen.get(n)]); else seen.set(n, q.id); });
const badBuckets = [];
Object.keys(chapterStars).forEach(k => { if (chapterStars[k] !== 10) badBuckets.push([k, chapterStars[k]]); });
const chapters = Object.keys(byChapter);
const badCats = CATS.map(c => [c, byCat[c] || 0]).filter(([c, n]) => n !== 345);
const summary = {
  file, total: items.length, chapters: chapters.length,
  categories: Object.fromEntries(CATS.map(c => [c, byCat[c] || 0])),
  types: byType,
  badBuckets: badBuckets.slice(0, 10), badCats,
  unique: seen.size, problems: problems.slice(0, 30), problemCount: problems.length
};
console.log(JSON.stringify(summary, null, 2));
process.exit(items.length === 3450 && chapters.length === 23 && !badBuckets.length && !badCats.length && !problems.length ? 0 : 1);
