'use strict';
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');

test('layout copy and CSS use real chapter counts and fill cramped controls', () => {
  const core = read('src/js/00-core.js');
  const shell = read('src/js/15-shell.js');
  const library = read('src/js/30-library.js');
  const template = read('src/index.template.html');
  const css = read('src/styles.css');
  assert.ok(core.includes('function chapterRangeText(subjectId)'), '缺少按科目生成章数范围的函数');
  assert.ok(shell.includes('chapterListFor(s.id).length'), '总览仍写死教材章数');
  assert.ok(!library.includes('第一章至第十章'), '题库/模板/规范仍写死第一章至第十章');
  assert.ok(library.includes('chapterRangeText(subjectId)'), '页面没有使用真实章数范围');
  assert.ok(template.includes('个性化复习计划'), '欢迎页没有提到 AI 个性化复习计划');
  assert.ok(css.includes('body:not(.bank-filters-open) .toolbar.bank-filters'), '缺少题库手机折叠筛选样式');
  assert.ok(css.includes('width: fit-content !important'), '题库折叠筛选没有收成内容宽度');
  assert.ok(css.includes('.toolbar.template-filters .count-note { flex: 0 0 auto; margin-left: auto;'), '模板筛选计数没有回到栏内右侧');
  assert.ok(css.includes('.note-library-top { max-width: none !important; margin: 18px 0 0 !important; }'), '笔记搜索仍被 980px 居中框住');
  assert.ok(css.includes('.hero-meta span + span::before { content: none !important'), '总览元信息仍用会落行首的分隔点');
  assert.ok(css.includes('grid-template-columns: repeat(2, minmax(0, 1fr))'), '总览手机操作没有 2×2 网格');
  assert.ok(css.includes('.setting-row-name .user-name-actions'), '设置用户名行没有铺满样式');
});

test('UI polish gate is wired into scripts, CI and the current update block', () => {
  const pkg = JSON.parse(read('package.json'));
  assert.strictEqual(pkg.scripts['qa:polish'], 'node tools/qa-ui-polish.js');
  const workflow = read('.github/workflows/quality.yml');
  assert.ok(workflow.includes('npm run qa:polish'), 'CI 没有运行 qa:polish');
  const gate = read('tools/qa-ui-polish.js');
  assert.ok(gate.includes('const WIDTHS = [390, 768, 1440];'), '排版门禁没有覆盖手机/平板/桌面');
  for (const token of ['bank-filter-toggle', 'template-filters', 'note-library-top', 'setting-row-name', 'clipped']) {
    assert.ok(gate.includes(token), '排版门禁缺少检查项 ' + token);
  }
  const readme = read('README.md');
  assert.ok(readme.includes('**排版收口**'), 'README 最新更新块没有排版收口条目');
  assert.ok(readme.includes('qa:polish'), 'README 没有说明排版门禁');
});
