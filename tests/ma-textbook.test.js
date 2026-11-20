'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.join(__dirname, '..');
const bank = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/bank-analysis.json'), 'utf8')).items;

function norm(s) {
  return String(s || '').replace(/\s+/g, '').replace(/\$/g, '').replace(/[，。；：]/g, '');
}

test('math analysis textbook chapter 1-2 exercises stay in the bank', function () {
  assert.equal(bank.length, 3638);
  assert.equal(bank.filter(q => q.examOrigin === '教材课后习题').length, 139);
  const ch1 = bank.filter(q => q.chapter === '第一章 实数集与函数' && q.examOrigin === '教材课后习题');
  const ch2 = bank.filter(q => q.chapter === '第二章 数列极限' && q.examOrigin === '教材课后习题');
  assert.ok(ch1.length >= 43, 'chapter 1 textbook questions');
  assert.ok(ch2.length >= 41, 'chapter 2 textbook questions');
  const fresh = bank.filter(q => {
    const m = /^MA-(\d+)$/.exec(q.id);
    return m && Number(m[1]) >= 3499 && Number(m[1]) <= 3565;
  });
  assert.equal(fresh.length, 67);
  const seen = new Set();
  for (const q of fresh) {
    assert.equal(q.subject, 'shufen');
    assert.equal(q.examOrigin, '教材课后习题');
    assert.match(q.source, /^教材课后习题（第[一二]章/);
    assert.match(q.standardSolution, /^(解|证明|答)：/);
    assert.ok(q.answer && q.answer !== '等式成立。');
    assert.ok(Array.isArray(q.solution) && q.solution.length >= 1);
    assert.ok(q.points.length >= 1 && q.pitfalls.length >= 1);
    const key = norm(q.question);
    assert.ok(!seen.has(key), 'duplicate new question ' + q.id);
    seen.add(key);
  }
});
