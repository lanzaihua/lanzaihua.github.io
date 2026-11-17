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
  assert.ok(css.includes('.toolbar.template-filters { display: grid !important; grid-template-columns: minmax(0, 1fr) auto;'), '模板筛选手机仍把计数挤到空行');
    assert.ok(css.includes('grid-template-columns: repeat(2, minmax(0, 1fr))'), '总览手机操作没有 2×2 网格');
  assert.ok(css.includes('.setting-row-name .user-name-actions'), '设置用户名行没有铺满样式');
  assert.ok(css.includes('.hw-nobreak'), '首页工作台说明缺少不可拆分的末句');
  assert.ok(shell.includes('hw-nobreak'), '首页工作台没有把末句包成不可拆分');
  assert.ok(css.includes('.home-features span:not(:last-child)::after { content: none !important; }'), '首页功能条仍会生成双分隔点');
  assert.ok(css.includes('.final-subject-tabs > .final-subject-note'), '科目说明没有并入科目栏');
  assert.ok(css.includes('.page-nb'), '缺少页面说明的不可拆分短语样式');
  assert.ok(css.includes('.page-break-wide'), '缺少桌面说明的换行控制');
  const final = read('src/js/58-final.js');
  assert.ok(final.includes('全部章节'), '未选章节时没有显示「全部章节」');
  assert.ok(final.includes('复习计划只使用当前科目的章节与知识点'), '复习计划科目说明应只描述计划');
  assert.ok(final.includes('按顺序走：先排计划，再出卷，最后开考。'), '流程说明应简短不重复');
  assert.ok(final.includes('page-break-wide'), '期末说明没有使用桌面换行控制');
  const notes = read('src/js/49-notes.js');
  assert.ok(notes.includes('<span class="page-nb">知识笔记</span>'), '笔记标题未保护「知识笔记」不被拆行');
  assert.ok(notes.includes('</b> 本</span>'), '笔记标题把数量与「本」拆开');
  assert.ok(notes.includes('同处；现有 '), '笔记标题未压缩为一行');
  assert.ok(library.includes('<span class="page-nb">1 / 3 / 7 天起步</span>'), '规范说明未保护「起步」');
  assert.ok(read('src/js/16-stats.js').includes('最近 30 天学了多少'), '统计时间口径与 30 天卡片不一致');
  const entries = read('src/js/20-entries.js');
  assert.ok(entries.includes('<span class="page-nb">标准解答</span>'), '错题说明未保护「标准解答」');
  assert.ok(library.includes('<span class="page-nb">易错点</span>'), '模板说明未保护「易错点」');
  assert.ok(library.includes('<span class="page-nb">先自己写</span>'), '题库说明未保护「先自己写」');
  assert.ok(read('src/js/15-shell.js').includes('<span class="page-nb">错题条目</span>'), '总览说明未保护「错题条目」');
  assert.ok(library.indexOf('<b>01</b>') < library.indexOf('<b>02</b>') && library.indexOf('<b>02</b>') < library.indexOf('<b>05</b>') && library.indexOf('<b>05</b>') < library.indexOf('<b>20–32</b>'), '规范速览顺序不连贯');
});

test('UI polish gate is wired into scripts, CI and the current update block', () => {
  const pkg = JSON.parse(read('package.json'));
  assert.strictEqual(pkg.scripts['qa:polish'], 'node tools/qa-ui-polish.js');
  const workflow = read('.github/workflows/quality.yml');
  assert.ok(workflow.includes('npm run qa:polish'), 'CI 没有运行 qa:polish');
  const gate = read('tools/qa-ui-polish.js');
  assert.ok(gate.includes('const WIDTHS = [390, 768, 1440];'), '排版门禁没有覆盖手机/平板/桌面');
  assert.ok(gate.includes('async function reading('), '排版门禁没有检查正文换行与页脚间距');
  assert.ok(gate.includes('全部章节'), '排版门禁没有检查期末章节计数文案');
  assert.ok(gate.includes('知识笔记'), '排版门禁没有检查笔记标题拆词');
  assert.ok(gate.includes('最近 30 天'), '排版门禁没有检查统计口径');
  for (const token of ['bank-filter-toggle', 'template-filters', 'note-library-top', 'setting-row-name', 'clipped']) {
    assert.ok(gate.includes(token), '排版门禁缺少检查项 ' + token);
  }
  const readme = read('README.md');
  assert.ok(readme.includes('**排版收口**'), 'README 最新更新块没有排版收口条目');
  assert.ok(readme.includes('qa:polish'), 'README 没有说明排版门禁');
});
