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
  const pack = fs.readFileSync(path.join(ROOT, 'tools/package-source.py'), 'utf8');
  const skip = pack.match(/SKIP_DIR_NAMES\s*=\s*\{([\s\S]*?)\}/);
  assert.ok(skip, '找不到 SKIP_DIR_NAMES');
  assert.equal(/["']data["']/.test(skip[1]), false, 'source.zip 不能排除 src/data，否则解压后无法构建');
  assert.ok(pack.includes('"Makefile"'), 'source.zip 必须带上 Makefile 与本地检查入口');
  assert.ok(pack.includes('".bak" in path.name'), '只跳过备份文件，不跳过整个数据目录');
  assert.ok(fs.statSync(path.join(ROOT, 'src/data/bank-algebra.json')).size > 1000000, '题库数据必须留在源码树中');
});
