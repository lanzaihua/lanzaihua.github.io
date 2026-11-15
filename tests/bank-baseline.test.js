'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const path = require('node:path');
const ROOT = path.join(__dirname, '..');
test('bank identity baseline catches missing or rewritten questions', () => {
  const r = spawnSync(process.execPath, [path.join(ROOT, 'tools/check-bank-baseline.js')], { encoding: 'utf8' });
  assert.equal(r.status, 0, r.stderr || r.stdout);
  assert.match(r.stdout, /bank baseline OK: \d+ questions/);
});
test('bank LaTeX lint rejects double escapes, set-brace loss and duplicate options', () => {
  const r = spawnSync(process.execPath, [path.join(ROOT, 'tools/qa-bank-latex.js')], { encoding: 'utf8' });
  assert.equal(r.status, 0, r.stderr || r.stdout);
  assert.match(r.stdout, /BANK LATEX PASS/);
});
