/* Full bank QA: counts, uniqueness, fields, category fit, difficulty signal. */
const fs = require('fs');
const path = require('path');
const base = path.join(__dirname, '..', 'src', 'data');
const files = ['bank-algebra.json', 'bank-analysis.json', 'bank-geometry.json', 'bank-western.json'];
const CATS = ['计算题','证明题','概念辨析题','公式填空题','应用题','综合题','反例与存在性题','分类讨论题','误差分析题','多解比较题'];
const all = [];
for (const f of files) { const j = JSON.parse(fs.readFileSync(path.join(base, f), 'utf8')); for (const q of j.items) all.push(q); }
const norm = s => String(s || '').replace(/\s+/g, '');
const key = q => q.subject + '|' + q.chapter + '|' + q.difficulty + '|' + q.type;
const buckets = new Map(); const cats = new Map(); const seen = new Map(); const problems = [];
for (const q of all) {
  const b = key(q); buckets.set(b, (buckets.get(b) || 0) + 1); cats.set(q.category, (cats.get(q.category) || 0) + 1);
  if (!q.id || !q.question || !q.answer || !q.standardSolution || !q.detailedAnalysis || !Array.isArray(q.points) || !q.points.length || !Array.isArray(q.pitfalls) || !q.pitfalls.length) problems.push([q.id, 'missing field']);
  if (!String(q.source || '').match(/考研(原创同型|真题)/)) problems.push([q.id, 'source']);
  if (!['choice','fill','subjective'].includes(q.type)) problems.push([q.id, 'type']);
  if (!CATS.includes(q.category)) problems.push([q.id, 'category']);
  if (q.type === 'choice') { const o = q.options || []; if (o.length !== 4 || new Set(o.map(x => String(x.text))).size !== 4 || !q.correct) problems.push([q.id, 'choice']); }
  if (q.type === 'fill' && !/____|＿/.test(q.question)) problems.push([q.id, 'fill blank']);
  if (q.type === 'subjective' && String(q.question).length < 12) problems.push([q.id, 'short subjective']);
  if (/【[^】]+】/.test(q.question)) problems.push([q.id, 'type prefix']);
  const n = norm(q.question); if (seen.has(n)) problems.push([q.id, 'duplicate of ' + seen.get(n)]); else seen.set(n, q.id);
}
const badBuckets = [...buckets.entries()].filter(([k, v]) => v !== 10);
const badCats = [...cats.entries()].filter(([k, v]) => v !== all.length / 10);
console.log(JSON.stringify({ total: all.length, chapters: new Set(all.map(q => q.subject + '|' + q.chapter)).size, categories: Object.fromEntries(cats), badBuckets: badBuckets.slice(0, 10), badCats, unique: seen.size, problems: problems.slice(0, 30), problemCount: problems.length }, null, 2));
process.exit(problems.length || badBuckets.length || badCats.length ? 1 : 0);
