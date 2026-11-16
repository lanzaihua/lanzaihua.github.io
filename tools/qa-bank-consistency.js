#!/usr/bin/env node
'use strict';
/* Cross-file bank consistency gate: no duplicate question, no placeholder
 * answer, and every "答案：" tail must equal the authoritative answer field. */
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const FILES = ['algebra', 'analysis', 'geometry', 'western'].map(function (s) {
  return path.join(ROOT, 'src', 'data', 'bank-' + s + '.json');
});
function normalize(text) {
  let s = String(text || '');
  s = s.replace(/\\left|\\right/g, '');
  s = s.replace(/[\s$]/g, '');
  s = s.replace(/（/g, '(').replace(/）/g, ')').replace(/，/g, ',').replace(/。/g, '.');
  s = s.replace(/[.?？]+$/g, '');
  s = s.replace(/\(\)$/g, '');
  s = s.replace(/[.?？]+$/g, '');
  return s;
}
const problems = [];
const seen = new Map();
let total = 0;
for (const file of FILES) {
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  for (const q of data.items || []) {
    total += 1;
    const key = normalize(q.question);
    if (key) {
      if (seen.has(key)) problems.push({ id: q.id, kind: 'duplicate', other: seen.get(key), question: q.question });
      else seen.set(key, q.id);
    }
    const answer = String(q.answer || '').trim();
    if (!answer) problems.push({ id: q.id, kind: 'empty-answer' });
    if (/^证明成立|^详见标准解答|^见标准解答/.test(answer)) problems.push({ id: q.id, kind: 'placeholder-answer', answer: answer });
    const sol = String(q.standardSolution || '');
    const marks = sol.match(/答案\s*[：:]/g);
    if (marks && marks.length) {
      const tail = sol.slice(sol.lastIndexOf('答案：') >= 0 ? sol.lastIndexOf('答案：') : sol.lastIndexOf('答案:'));
      const value = tail.replace(/^答案\s*[：:]\s*/, '').trim();
      if (value !== answer) problems.push({ id: q.id, kind: 'answer-tail-mismatch', expected: answer, actual: value });
    }
  }
}
const result = { total: total, unique: seen.size, problems: problems.length, details: problems.slice(0, 20) };
console.log(JSON.stringify(result, null, 2));
if (problems.length) process.exit(1);
