'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');

test('模拟卷编辑卡只有一份 HTML 实现（58 与 60 不再重复定义）', () => {
  const files = fs.readdirSync(path.join(root, 'src/js')).filter((f) => f.endsWith('.js'));
  const hits = files.filter((f) => /function finalPaperEditorHtml\(/.test(fs.readFileSync(path.join(root, 'src/js', f), 'utf8')));
  assert.deepEqual(hits, ['60-paper-edit.js']);
});

test('模拟卷编辑卡头部使用显式网格，避免 flex-basis 变成高度', () => {
  const css = read('src/styles.css');
  assert.match(css, /\.final-editor-head\{[^}]*display:grid!important/);
  assert.match(css, /\.final-editor-head\{[^}]*grid-template-columns:minmax\(240px,1fr\)/);
  assert.match(css, /\.final-editor-actions\{[^}]*grid-column:4/);
  assert.match(css, /grid-template-columns:repeat\(auto-fit,minmax\(92px,1fr\)\)/);
  assert.match(css, /\.final-editor-actions \.btn\{[^}]*height:auto!important/);
});

test('跨端门禁被 package 与 CI 同时引用', () => {
  const pkg = JSON.parse(read('package.json'));
  assert.equal(pkg.scripts['qa:paper'], 'node tools/qa-paper-editor.js');
  assert.ok(fs.existsSync(path.join(root, 'tools/qa-paper-editor.js')));
  const ci = read('.github/workflows/quality.yml');
  assert.match(ci, /npm run qa:paper/);
  const gate = read('tools/qa-paper-editor.js');
  assert.match(gate, /320, 360, 390, 414, 480, 540, 600, 700, 768, 834, 900, 918, 1024, 1112, 1200, 1280, 1360, 1440/);
  assert.match(gate, /按钮文字越界/);
  assert.match(gate, /编辑卡头部内部横向溢出/);
  assert.match(gate, /操作区越出编辑卡/);
  assert.match(gate, /卷名输入框内容被截断/);
});
