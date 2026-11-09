'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.join(__dirname, '..');

test('repository ships real Python, Shell and Makefile sources and a language gate', () => {
  const result = spawnSync(process.execPath, ['tools/check_repo_languages.js', '--json'], {
    cwd: ROOT, encoding: 'utf8'
  });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  const data = JSON.parse(result.stdout);
  assert.equal(data.ok, true, data.problems && data.problems.join('; '));
  const byName = Object.fromEntries(data.languages.map(row => [row.name, row.bytes]));
  for (const name of ['HTML', 'CSS', 'JavaScript', 'Python', 'Shell', 'Makefile']) {
    assert.ok(byName[name] > 0, name + ' 必须来自真实源码');
  }
  assert.ok(byName.Python >= 12000, 'Python 工具需足够大，GitHub 语言条才会显示');
  assert.ok(byName.Shell >= 1000, 'Shell 脚本需足够大，GitHub 语言条才会显示');
  const attrs = fs.readFileSync(path.join(ROOT, '.gitattributes'), 'utf8');
  assert.match(attrs, /^index\.html\s+linguist-generated=true\s*$/m);
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  assert.match(pkg.scripts.check, /check_repo_languages\.js/);
  assert.match(pkg.scripts.check, /audit_bank\.py/);
  assert.ok(fs.statSync(path.join(ROOT, 'Makefile')).size > 500);
});
