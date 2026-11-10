'use strict';
/* part2 独立质检：数量/分类/题型/星级、字段、选项、空位、$ 配对、唯一性、旧题库与 part1 查重 */
const fs = require('fs');
const path = require('path');
const baseDir = path.join(__dirname, '..', '..', '..');
const part = JSON.parse(fs.readFileSync(process.argv[2] || path.join(__dirname, 'out', 'bank-analysis-part2.json'), 'utf8'));
const old = JSON.parse(fs.readFileSync(path.join(baseDir, 'src', 'data', 'bank-analysis.json.bak-before-rewrite'), 'utf8'));
const p1 = JSON.parse(fs.readFileSync(path.join(__dirname, 'out', 'bank-analysis-part1.json'), 'utf8'));
const D = String.fromCharCode(36);
const dollarOk = s => { let c = 0; for (const ch of String(s)) if (ch === D) c++; return c % 2 === 0; };
const norm = s => String(s || '').replace(/[ \t\r\n]+/g, '').replace(/[，。；：？！、,.;:?!]/g, '');
const probs = [], byCh = {}, byCat = {}, byType = {}, bucket = {};
const seen = new Map(), oldM = new Map(), p1M = new Map();
for (const q of old.items) oldM.set(norm(q.question), q.id);
for (const q of p1.items) p1M.set(norm(q.question), q.id);
for (const q of part.items) {
  byCh[q.chapter] = (byCh[q.chapter] || 0) + 1;
  byCat[q.category] = (byCat[q.category] || 0) + 1;
  byType[q.type] = (byType[q.type] || 0) + 1;
  bucket[q.chapter + '|' + q.type + '|' + q.difficulty] = (bucket[q.chapter + '|' + q.type + '|' + q.difficulty] || 0) + 1;
  if (!q.id || !q.question || !q.answer || !q.standardSolution || !q.detailedAnalysis) probs.push(q.id + ' 字段缺失');
  if (!Array.isArray(q.points) || !q.points.length) probs.push(q.id + ' points');
  if (!Array.isArray(q.pitfalls) || !q.pitfalls.length) probs.push(q.id + ' pitfalls');
  if (q.source !== '考研原创同型题') probs.push(q.id + ' source');
  if (q.examOrigin !== '考研原创同型题') probs.push(q.id + ' examOrigin');
  if (![1, 2, 3, 4, 5].includes(q.difficulty)) probs.push(q.id + ' difficulty');
  for (const k of ['question', 'answer', 'standardSolution', 'detailedAnalysis']) if (!dollarOk(q[k])) probs.push(q.id + ' ' + k + ' $不成对');
  if (q.type === 'choice') {
    if (!Array.isArray(q.options) || q.options.length !== 4) probs.push(q.id + ' 选项数');
    else {
      if (q.options.map(o => o.key).join('') !== 'ABCD') probs.push(q.id + ' 选项key');
      if (new Set(q.options.map(o => String(o.text).replace(/\s+/g, ''))).size !== 4) probs.push(q.id + ' 选项重复');
      if (!/^[ABCD]$/.test(q.correct)) probs.push(q.id + ' correct');
      for (const o of q.options) if (!dollarOk(o.text)) probs.push(q.id + ' 选项$不成对');
    }
  }
  if (q.type === 'fill' && !/____/.test(q.question)) probs.push(q.id + ' 填空无空位');
  if (q.category === '证明题' && q.type !== 'subjective') probs.push(q.id + ' 证明题类型');
  if (q.category === '公式填空题' && q.type !== 'fill') probs.push(q.id + ' 公式填空类型');
  if (q.category === '概念辨析题' && q.type !== 'choice') probs.push(q.id + ' 概念辨析类型');
  if (q.question.length > 400) probs.push(q.id + ' 题干过长');
  if (/【[^】]+】/.test(q.question)) probs.push(q.id + ' 题型前缀');
  const n = norm(q.question);
  if (seen.has(n)) probs.push(q.id + ' 重复 ' + seen.get(n)); else seen.set(n, q.id);
  if (oldM.has(n)) probs.push(q.id + ' 旧题库重复');
  if (p1M.has(n)) probs.push(q.id + ' part1重复');
}
const bad = (o, v) => Object.entries(o).filter(([, x]) => x !== v);
const report = {
  total: part.items.length,
  chapters: Object.keys(byCh).length,
  chapterCounts: byCh,
  categories: byCat,
  types: byType,
  bucketGroups: Object.keys(bucket).length,
  badChapter: bad(byCh, 150).length,
  badCategory: bad(byCat, 150).length,
  badType: bad(byType, 500).length,
  badBucket: bad(bucket, 10).map(([k, v]) => k + '=' + v),
  unique: seen.size,
  duplicateInPart2: part.items.length - seen.size,
  duplicateOldBank: probs.filter(p => p.indexOf('旧题库') >= 0).length,
  duplicatePart1: probs.filter(p => p.indexOf('part1') >= 0).length,
  problemCount: probs.length,
  problems: probs.slice(0, 20)
};
console.log(JSON.stringify(report, null, 1));
process.exit(probs.length || report.badChapter || report.badCategory || report.badType || report.badBucket.length ? 1 : 0);
