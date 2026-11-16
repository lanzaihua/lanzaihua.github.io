'use strict';
/**
 * 全库数学语言门禁：把题库的每个可见字段走真实 Markdown/TeX 管线，
 * 再从渲染后的可见文本里找“没进公式”的数学写法。
 *
 * 失败样例：x0、MU1、P^*、{xn}、\frac、裸 $、ln(1+x)。
 * 只检查可见文本，不检查公式内部（公式由 audit-rendered-bank.js 检查解析错误）。
 */
const fs = require('fs');
const vm = require('vm');
const path = require('path');
const { parseHTML } = require('linkedom');
const ROOT = process.cwd();
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const { document } = parseHTML('<!doctype html><html><body></body></html>');
const ctx = {
  console, Date, Set, Map, Intl, URL, Blob,
  setTimeout: () => 0, clearTimeout() {},
  location: { hostname: 'localhost', protocol: 'https:', hash: '', pathname: '/', search: '' },
  localStorage: { getItem() { return null; }, setItem() {} },
  window: { addEventListener() {}, __SEED__: { subjects: [] }, __BANKS__: {}, __PAGES__: false },
  document
};
vm.createContext(ctx);
vm.runInContext(read('src/js/00-chapters.js') + '\n' + read('src/js/00-core.js'), ctx);
ctx.toast = () => {};
ctx.window.marked = ctx.marked = require(path.join(ROOT, 'src/vendor/marked.umd.js'));
vm.runInContext(read('src/vendor/temml.min.js'), ctx);
ctx.window.temml = ctx.temml;
vm.runInContext(read('src/js/10-markdown.js'), ctx);

const FILES = ['src/data/bank-algebra.json', 'src/data/bank-analysis.json', 'src/data/bank-geometry.json', 'src/data/bank-western.json'];
const FIELDS = ['question', 'answer', 'standardSolution', 'detailedAnalysis'];
const LISTS = ['options', 'points', 'pitfalls', 'solution'];

function visibleText(root) {
  let out = '';
  const skip = new Set(['MATH', 'CODE', 'PRE', 'SCRIPT', 'STYLE']);
  function walk(node) {
    if (!node) return;
    if (node.nodeType === 3) { out += node.nodeValue; return; }
    if (node.nodeType !== 1) return;
    const tag = String(node.tagName || '').toUpperCase();
    const cls = node.classList;
    if (skip.has(tag) || (cls && (cls.contains('math-inline-scroll') || cls.contains('math-tail') || cls.contains('math-raw') || cls.contains('temml-error')))) return;
    for (const child of node.childNodes) walk(child);
  }
  walk(root);
  return out;
}

const patterns = [
  ['underscore', /(?:^|[^A-Za-z0-9])[A-Za-z]\s*[_^]\s*\{?[A-Za-z0-9]/g],
  ['caret', /\^/g],
  ['brace', /[{}]/g],
  ['var-digit', /(?:^|[^A-Za-z0-9-])[A-Za-z]\d+(?![A-Za-z0-9-])/g],
  ['dollar', /\$/g],
  ['func', /(?:^|[^A-Za-z])(?:lim|sin|cos|tan|log|ln|max|min|det|rank|dim|gcd)\s*[_({]/g]
];
const counts = {};
const examples = {};
for (const [name] of patterns) { counts[name] = 0; examples[name] = []; }

function checkText(id, field, text, render) {
  if (!text) return;
  const div = document.createElement('div');
  div.innerHTML = render(text);
  const visible = visibleText(div);
  for (const [name, rx] of patterns) {
    rx.lastIndex = 0;
    if (!rx.test(visible)) continue;
    counts[name] += 1;
    if (examples[name].length < 15) examples[name].push([id, field, visible.slice(0, 260).replace(/\s+/g, ' ')]);
  }
}

let checkedFields = 0;
for (const rel of FILES) {
  const data = JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
  for (const item of data.items || []) {
    checkText(item.id, 'title', item.title, ctx.renderInline);
    for (const field of FIELDS) {
      if (typeof item[field] !== 'string') continue;
      checkedFields += 1;
      checkText(item.id, field, item[field], ctx.renderMarkdown);
    }
    for (const field of LISTS) {
      const value = item[field];
      if (!Array.isArray(value)) continue;
      value.forEach((entry, index) => {
        if (typeof entry === 'string') {
          checkedFields += 1;
          checkText(item.id, field + '[' + index + ']', entry, field === 'options' ? ctx.renderInline : ctx.renderMarkdown);
        } else if (entry && typeof entry === 'object') {
          for (const key of ['text', 'q', 'a']) {
            if (typeof entry[key] !== 'string') continue;
            checkedFields += 1;
            checkText(item.id, field + '[' + index + '].' + key, entry[key], ctx.renderInline);
          }
        }
      });
    }
  }
}

const total = Object.keys(counts).reduce((sum, key) => sum + counts[key], 0);
const report = { checkedFields, counts, examples, total };
fs.mkdirSync(path.join(ROOT, 'debug'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'debug', 'math-language-audit.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report, null, 2));
if (total > 0) {
  console.error('MATH LANGUAGE FAILED: visible math is still outside formula delimiters.');
  process.exitCode = 1;
} else {
  console.log('MATH LANGUAGE PASS');
}
