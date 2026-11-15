'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');

test('题库筛选栏桌面使用显式布局，不再靠 inline 空白分隔', () => {
  const css = read('src/styles.css');
  assert.match(css, /@media \(min-width: 701px\)[\s\S]*?\.toolbar\.bank-filters \{[^}]*display: grid/);
  assert.match(css, /\.bank-filters \.bank-filter-fields \{[^}]*display: flex[^}]*flex-wrap: wrap[^}]*gap: 9px 10px/);
  assert.match(css, /\.bank-filter-fields \.select \{[^}]*flex: 1 1 150px[^}]*max-width: 220px/);
  assert.match(css, /@media \(min-width: 1301px\)[\s\S]*?grid-template-columns: repeat\(4, minmax\(0, 1fr\)\)/);
});

test('题库筛选栏手机端仍是两列折叠，不把控件压成一行', () => {
  const css = read('src/styles.css');
  assert.match(css, /@media \(max-width: 700px\)[\s\S]*?\.toolbar\.bank-filters \{[^}]*display: grid !important/);
  assert.match(css, /body\.bank-filters-open \.bank-filter-fields \{ display: grid; \}/);
  assert.match(css, /\.bank-filters \.bank-filter-fields \.select \{[^}]*width: 100%/);
  assert.match(css, /grid-template-columns: auto minmax\(0, 1fr\) auto/);
  assert.match(css, /\.bank-filters \.bank-filter-fields \.filter-clear \{[^}]*grid-column: 1 \/ -1[^}]*width: 100%/);
});

test('题库筛选栏跨端门禁被 package 与 CI 同时引用', () => {
  const pkg = JSON.parse(read('package.json'));
  assert.equal(pkg.scripts['qa:filters'], 'node tools/qa-bank-filters.js');
  const gatePath = path.join(root, 'tools/qa-bank-filters.js');
  assert.ok(fs.existsSync(gatePath));
  const ci = read('.github/workflows/quality.yml');
  assert.match(ci, /npm run qa:filters/);
  const gate = fs.readFileSync(gatePath, 'utf8');
  assert.match(gate, /320, 360, 375, 390, 414, 430, 480, 540, 600, 700, 768, 834, 900, 918, 1024, 1097, 1112, 1200, 1280, 1360, 1440, 1920/);
  assert.match(gate, /横向间距不足/);
  assert.match(gate, /控件重叠/);
  assert.match(gate, /控件文字被裁/);
  assert.match(gate, /越出筛选栏内容区/);
  assert.match(gate, /手机筛选应为 2 列/);
});
