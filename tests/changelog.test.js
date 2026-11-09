'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const ROOT = path.join(__dirname, '..');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');

test('updates keep one honest block per day and the home toolbar stays in flow', () => {
  const src = read('src/js/48-changelog.js');
  const sandbox = {
    window: {},
    document: { addEventListener() {}, querySelector() { return null; }, querySelectorAll() { return []; }, getElementById() { return null; } },
    console
  };
  vm.runInNewContext(src + '\n;globalThis.__LOG__ = UPDATE_LOG;', sandbox, { filename: '48-changelog.js' });
  const logs = sandbox.__LOG__;
  assert.ok(Array.isArray(logs) && logs.length > 10);
  const dates = logs.map((b) => b.date);
  assert.equal(new Set(dates).size, dates.length, '同一天只能有一块更新记录');
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Shanghai' }).format(new Date());
  dates.forEach((d) => assert.ok(d <= today, '更新记录日期不能晚于今天：' + d));
  assert.equal(/UPDATE_LOG\[0\]\.date\s*=/.test(src), false, '更新记录不能被构建日静默改写');

  const latest = logs[0];
  const n = latest.items.length;
  assert.ok(n > 0);
  assert.equal(new Set(latest.items.map((it) => it.group)).size, n);
  (latest.notifyItems || []).forEach((it) => {
    assert.ok(latest.items.some((x) => x.group === it.group), '通知条目必须属于本版更新：' + it.group);
  });

  const readme = read('README.md');
  assert.ok(readme.includes('### ' + latest.date + ' · ' + latest.title));
  assert.ok(readme.includes('**' + n + ' 项 · ' + n + ' 组**'));
  const heading = '### ' + latest.date + ' · ' + latest.title;
  const start = readme.indexOf(heading);
  const end = readme.indexOf('\n### ', start + heading.length);
  const latestBlock = readme.slice(start, end < 0 ? undefined : end);
  const rows = (latestBlock.match(/^\| \*\*.+?\*\* \|/gm) || []).length;
  assert.equal(rows, n, 'README 最新块表格行数应与更新记录项数一致');

  const styles = read('src/styles.css');
  assert.equal(/\.home-icon-group\s*\{[^}]*position:\s*fixed/s.test(styles), false, '手机首页工具栏不能固定悬浮');
});
