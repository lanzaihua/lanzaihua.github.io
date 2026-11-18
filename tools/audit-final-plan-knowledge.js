#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const DATA = path.join(ROOT, 'src/data/final-plan-knowledge.json');
const MEM = path.join(ROOT, 'src/data/final-plan-memory.json');
const problems = [];
function add(msg) { problems.push(msg); }
function norm(s) { return String(s || '').replace(/\s+/g, ''); }
function checkText(label, s) {
  if (!s || !String(s).trim()) { add(label + ': empty'); return; }
  if (/<\/?[A-Za-z][A-Za-z0-9:-]*(?:\s[^<>]*)?\/?>/.test(s)) add(label + ': html tag');
  if (s.indexOf('\uFFFD') >= 0) add(label + ': replacement char');
  if ((String(s).match(/\$/g) || []).length % 2) add(label + ': unbalanced $');
  const plain = String(s).replace(/\$[^$]*\$/g, '');
  if (/\\[A-Za-z]+/.test(plain)) add(label + ': latex command outside $...$');
}
function main() {
  const data = JSON.parse(fs.readFileSync(DATA, 'utf8'));
  const mem = JSON.parse(fs.readFileSync(MEM, 'utf8'));
  const seen = new Set();
  const exams = new Map();
  const hooks = new Map();
  let points = 0;
  Object.keys(data.subjects || {}).forEach(function (subject) {
    (data.subjects[subject].chapters || []).forEach(function (chapter) {
      (chapter.points || []).forEach(function (point) {
        points++;
        const key = subject + '||' + chapter.chapter + '||' + point.name;
        seen.add(key);
        if (!point.memoryHook || !point.exam) add(key + ': missing memoryHook/exam');
        if (!point.memory || point.memory.indexOf('考场：') < 0) add(key + ': memory lacks exam');
        if (point.memory && point.memory.indexOf('记「' + point.name + '」') !== 0) add(key + ': memory lacks name hook');
        checkText(key + '.memoryHook', point.memoryHook);
        checkText(key + '.exam', point.exam);
        const e = norm(point.exam);
        const h = norm(point.memoryHook);
        if (exams.has(e)) add(key + ': duplicate exam with ' + exams.get(e));
        else exams.set(e, key);
        if (hooks.has(h)) add(key + ': duplicate hook with ' + hooks.get(h));
        else hooks.set(h, key);
      });
    });
  });
  const memKeys = Object.keys((mem && mem.points) || {});
  if (points !== memKeys.length) add('memory override count ' + memKeys.length + ' != points ' + points);
  memKeys.forEach(function (k) { if (!seen.has(k)) add('override for unknown point ' + k); });
  if (points !== 574) add('expected 574 points, got ' + points);
  if (problems.length) {
    console.error('FINAL PLAN MEMORY FAILED');
    problems.slice(0, 80).forEach(function (p) { console.error('- ' + p); });
    process.exit(1);
  }
  console.log('FINAL PLAN MEMORY PASS points=' + points + ' uniqueExams=' + exams.size + ' uniqueHooks=' + hooks.size);
}
main();
