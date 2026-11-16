'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.join(__dirname, '..');
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');

function finalContext() {
  const ctx = {
    console, Date, Math, JSON, Blob, TextEncoder, Uint8Array, DataView, Array, Object, String, Number, RegExp, Set, Map,
    window: { innerWidth: 1200, print() {}, addEventListener() {} },
    document: { addEventListener() {}, querySelector() { return null; }, createElement() { return { style: {}, setAttribute() {}, remove() {}, click() {} }; }, body: { appendChild() {} } },
    localStorage: { getItem() { return null; }, setItem() {}, removeItem() {} },
    state: { activeSubject: 'gaodai' },
    SUBJECTS: [{ id: 'gaodai', name: '高等代数' }],
    SUBJ_BY_ID: { gaodai: { id: 'gaodai', name: '高等代数' } },
    toast() {}, qs() { return null; }, esc(s) { return String(s); }, attr(s) { return String(s); },
    renderMarkdown(s) { return '<div class="md">' + s + '</div>'; },
    renderInline(s) { return String(s); },
    markDirty() {}, nowIso() { return '2026-11-16T00:00:00+08:00'; }, normalizeStars(x) { return x || 3; },
    entryTitle() { return ''; }, findEntry() { return null; }, bankOf() { return []; }, templatesOf() { return []; },
    aiConfigReady() { return false; }, setTimeout() {}, clearTimeout() {},
    location: { hash: '' }, URL: { createObjectURL() { return ''; }, revokeObjectURL() {} }
  };
  vm.createContext(ctx);
  vm.runInContext(read('src/js/58-final.js'), ctx);
  return ctx;
}

test('期末计划显示本章全部答题模板，而不是只显示一个代表模板', () => {
  const ctx = finalContext();
  const html = ctx.finalPlanTemplateListHtml({
    templates: [
      { id: 'T-01-01', title: '带余除法', sections: [{ label: '步骤骨架', md: '第一步 做带余除法' }] },
      { id: 'T-01-02', title: '最大公因式', sections: [{ label: '标准步骤', md: '第二步 辗转相除' }, { label: '易错点', md: '不要漏掉余式为零' }] }
    ]
  });
  assert.match(html, /T-01-01/);
  assert.match(html, /T-01-02/);
  assert.match(html, /带余除法/);
  assert.match(html, /最大公因式/);
  assert.match(html, /第一步 做带余除法/);
  assert.match(html, /第二步 辗转相除/);
  assert.match(html, /不要漏掉余式为零/);
  assert.equal((html.match(/class="fpm-tpl"/g) || []).length, 2, '应渲染两个模板');
});

test('章节筛选不依赖已加入材料，计划模块接入模板清单并按日轮换', () => {
  const js = read('src/js/58-final.js');
  assert.match(js, /function finalAllChapters\(subject\)/);
  assert.match(js, /chapters = finalAllChapters\(subject\)/);
  assert.equal(/if \(!finalMaterialsForSubject\(subject\)\.length\) return ''/.test(js), false, '没有材料时不应隐藏章节筛选');
  assert.match(js, /finalPlanTemplateListHtml\(m\)/);
  assert.match(js, /i % module\.templates\.length/);
  assert.match(js, /m\.templates\.length \+ ' 个模板/);

  const css = read('src/styles.css');
  assert.match(css, /\.fpm-templates \{ display: grid/);
  assert.match(css, /\.fpm-tpl > summary \{/);
  assert.match(css, /\.fpm-tpl-body \{/);
  assert.match(css, /\.fpm-tpl-pitfall \{/);
});

test('期末复习跨端门禁被 package 与 CI 同时引用', () => {
  const pkg = JSON.parse(read('package.json'));
  assert.equal(pkg.scripts['qa:final'], 'node tools/qa-final-review.js');
  const gatePath = path.join(root, 'tools/qa-final-review.js');
  assert.ok(fs.existsSync(gatePath), '缺少 tools/qa-final-review.js');
  const ci = read('.github/workflows/quality.yml');
  assert.match(ci, /npm run qa:final/);
  const gate = fs.readFileSync(gatePath, 'utf8');
  assert.match(gate, /390, 768, 1440/);
  assert.match(gate, /\.fpm-tpl/);
  assert.match(gate, /章节筛选/);
});
