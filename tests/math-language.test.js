'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const read = (p) => fs.readFileSync(path.join(__dirname, '..', p), 'utf8');

test('math language gate is wired into npm check and covers braces/variable digits', () => {
  const pkg = JSON.parse(read('package.json'));
  assert.equal(pkg.scripts['qa:mathlang'], 'node tools/audit-math-language.js');
  assert.ok(pkg.scripts.check.includes('node tools/audit-math-language.js'), 'check must run math language audit');
  const audit = read('tools/audit-math-language.js');
  for (const token of ['MATH LANGUAGE PASS', 'var-digit', 'brace', 'underscore', 'caret']) {
    assert.ok(audit.includes(token), 'math language audit missing ' + token);
  }
});

test('formula QA ignores MathML text nodes so braces inside formulas are not false positives', () => {
  const qa = read('tools/qa-formulas.js');
  assert.ok(qa.includes("par.closest('code,pre,textarea,script,style,.math-raw,.source-code,.md-copy,math,.math-inline-scroll,.math-tail')"));
  assert.ok(qa.includes('var-digit') && qa.includes('brace'));
});

test('mathify only escapes set braces and never guesses equation boundaries', () => {
  const md = read('src/js/10-markdown.js');
  const start = md.indexOf('function mathifyPlainText');
  const end = md.indexOf('function canvasToWhiteDataUrl', start);
  const body = md.slice(start, end);
  assert.ok(body.includes("max|min|sup|inf"), 'function sets must be preserved');
  assert.ok(body.includes("sets.push"), 'set braces must become math');
  assert.equal(body.includes('@@EQ'), false, 'must not split equations by regex');
  assert.equal(body.includes('eqs.push'), false, 'must not split equations by regex');
});

test('simple variable digits skip versions and long IDs', () => {
  const md = read('src/js/10-markdown.js');
  assert.ok(md.includes('(\\d{1,3})(?!\\.\\d)(?![A-Za-z0-9_])'), 'version v1.2 and IDs must stay text');
});

test('math pipeline normalizes sizing, bars and unicode subscripts inside formulas', () => {
  const md = read('src/js/10-markdown.js');
  assert.ok(md.includes('(?![A-Za-z])/g'), 'sizing commands must not eat bigcup/bigcap');
  assert.ok(md.includes('\\u1d62-\\u1d6a'), 'unicode subscript letters must join the same math run');
  assert.ok(md.includes("replace(/\\\\\\|/g, '\\\\Vert ')"), 'double bars must become Vert');
  assert.ok(md.includes("replace(/\\\\\\{/g, '\\\\lbrace ')"), 'escaped braces must become lbrace');
  const fin = read('src/js/58-final.js');
  assert.ok(fin.includes("renderInline(d.point.memory)"), 'day memory must use the math renderer');
});
