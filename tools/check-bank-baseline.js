#!/usr/bin/env node
/* 题库身份基线：任何删除、替换题干或数量变化都必须显式更新基线。 */
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const ROOT = path.join(__dirname, '..');
const BASELINE = path.join(ROOT, 'src/data/bank-baseline.json');
const FILES = {
  gaodai: 'src/data/bank-algebra.json',
  shufen: 'src/data/bank-analysis.json',
  jieji: 'src/data/bank-geometry.json',
  xijing: 'src/data/bank-western.json'
};
function hash(text) { return crypto.createHash('sha256').update(text, 'utf8').digest('hex'); }
function snapshot() {
  const subjects = {};
  let total = 0;
  Object.keys(FILES).forEach(function (subject) {
    const raw = JSON.parse(fs.readFileSync(path.join(ROOT, FILES[subject]), 'utf8'));
    const items = Array.isArray(raw.items) ? raw.items : [];
    const ids = items.map(function (q) { return String(q && q.id || ''); }).sort();
    const questions = items.map(function (q) { return String(q && q.question || '').trim(); }).sort();
    subjects[subject] = {
      count: items.length,
      idsSha256: hash(ids.join('\n')),
      questionsSha256: hash(questions.join('\n'))
    };
    total += items.length;
  });
  return { version: 1, total: total, subjects: subjects };
}
function main() {
  const current = snapshot();
  if (process.argv.includes('--update')) {
    fs.writeFileSync(BASELINE, JSON.stringify(current, null, 2) + '\n');
    console.log('bank baseline updated: ' + current.total + ' questions');
    return;
  }
  let base;
  try { base = JSON.parse(fs.readFileSync(BASELINE, 'utf8')); }
  catch (e) { console.error('missing or invalid src/data/bank-baseline.json; run node tools/check-bank-baseline.js --update'); process.exit(2); }
  const problems = [];
  if (base.total !== current.total) problems.push('total ' + base.total + ' -> ' + current.total);
  Object.keys(FILES).forEach(function (subject) {
    const a = base.subjects && base.subjects[subject];
    const b = current.subjects[subject];
    if (!a) { problems.push(subject + ': missing baseline'); return; }
    if (a.count !== b.count) problems.push(subject + ': count ' + a.count + ' -> ' + b.count);
    if (a.idsSha256 !== b.idsSha256) problems.push(subject + ': question ids changed');
    if (a.questionsSha256 !== b.questionsSha256) problems.push(subject + ': question text changed');
  });
  if (problems.length) {
    console.error('BANK BASELINE FAILED\n  ' + problems.join('\n  ') + '\nIf the change is intentional, update src/data/bank-baseline.json with --update.');
    process.exit(1);
  }
  console.log('bank baseline OK: ' + current.total + ' questions');
}
main();
