'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.join(__dirname, '..');
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');

test('bank consistency gate is wired into npm check and scans all four banks', function () {
  const pkg = JSON.parse(read('package.json'));
  assert.match(pkg.scripts.check, /qa:bank-consistency/);
  assert.equal(pkg.scripts['qa:bank-consistency'], 'node tools/qa-bank-consistency.js');
  const gate = read('tools/qa-bank-consistency.js');
  assert.match(gate, /duplicate/);
  assert.match(gate, /placeholder-answer/);
  assert.match(gate, /answer-tail-mismatch/);
  assert.match(gate, /algebra/);
  assert.match(gate, /western/);
});
