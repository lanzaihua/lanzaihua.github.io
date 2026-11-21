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

test('math analysis textbook exercises stay in the bank', function () {
  assert.equal(bank.length, 4491);
  assert.equal(bank.filter(q => q.examOrigin === '教材课后习题').length, 992);
  const chapters = {
    '第一章 实数集与函数': 35, '第二章 数列极限': 32, '第三章 函数极限': 44,
    '第四章 函数的连续性': 38, '第五章 导数和微分': 49, '第六章 微分中值定理及其应用': 69,
    '第七章 实数的完备性': 21, '第八章 不定积分': 18, '第九章 定积分': 62,
    '第十章 定积分的应用': 44, '第十一章 反常积分': 30, '第十二章 数项级数': 46,
    '第十三章 函数列与函数项级数': 32, '第十四章 幂级数': 24, '第十五章 傅里叶级数': 28,
    '第十六章 多元函数的极限与连续': 42, '第十七章 多元函数微分学': 67,
    '第十八章 隐函数定理及其应用': 51, '第十九章 含参量积分': 31, '第二十章 曲线积分': 13,
    '第二十一章 重积分': 77, '第二十二章 曲面积分': 29, '第二十三章 向量函数微分学': 38
  };
  const fresh = bank.filter(q => {
    const m = /^MA-(\d+)$/.exec(q.id);
    return m && Number(m[1]) >= 3499 && Number(m[1]) <= 4419;
  });
  assert.equal(fresh.length, 920);
  for (const [chapter, minimum] of Object.entries(chapters)) {
    const list = fresh.filter(q => q.chapter === chapter);
    assert.ok(list.length >= minimum, chapter + ' expected at least ' + minimum + ', got ' + list.length);
  }
  const seen = new Set();
  for (const q of fresh) {
    assert.equal(q.subject, 'shufen');
    assert.equal(q.examOrigin, '教材课后习题');
    assert.match(q.source, /^教材课后习题（第/);
    assert.match(q.standardSolution, /^(解|证明|答)：/);
    assert.ok(q.answer && q.answer !== '等式成立。');
    assert.ok(Array.isArray(q.solution) && q.solution.length >= 1);
    assert.ok(q.points.length >= 1 && q.pitfalls.length >= 1);
    const key = norm(q.question);
    assert.ok(!seen.has(key), 'duplicate new question ' + q.id);
    seen.add(key);
  }
});
