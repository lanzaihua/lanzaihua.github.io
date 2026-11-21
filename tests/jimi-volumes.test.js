'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.join(__dirname, '..');
const bank = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/bank-analysis.json'), 'utf8')).items;

test('Jimidovich volumes 3 and 4 stay in the bank', function () {
  assert.equal(bank.length, 6936);
  const jimi = bank.filter(q => /吉米多维奇/.test(String(q.source)));
  assert.equal(jimi.length, 2448);
  const v34 = jimi.filter(q => /第(3|4)卷/.test(String(q.source)));
  assert.equal(v34.length, 1502);
  const ctrl = /[\x00-\x08\x0b\x0c\x0e-\x1f]/;
  for (const q of v34) {
    assert.equal(q.subject, 'shufen');
    assert.equal(q.type, 'subjective');
    assert.equal(q.examOrigin, '习题集');
    assert.match(String(q.source), /^习题集（吉米多维奇/);
    assert.match(String(q.standardSolution), /^(解|证明|答)：/);
    assert.ok(q.answer && q.answer !== '等式成立。');
    assert.ok(Array.isArray(q.solution) && q.solution.length >= 1);
    assert.ok(q.points.length >= 1 && q.pitfalls.length >= 1);
    for (const field of [q.question, q.answer, q.standardSolution, q.detailedAnalysis]) {
      const s = String(field || '');
      assert.ok(!ctrl.test(s), q.id + ' control character');
      assert.equal((s.match(/\$\$/g) || []).length % 2, 0, q.id + ' display math');
      assert.equal((s.replace(/\$\$[\s\S]*?\$\$/g, '').match(/\$/g) || []).length % 2, 0, q.id + ' inline math');
    }
  }
});
