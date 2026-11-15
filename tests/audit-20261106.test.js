'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const ROOT = path.join(__dirname, '..');
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');

function runtime() {
  const subjects = JSON.parse(read('src/data/seed.json')).subjects;
  const values = new Map();
  const ctx = { console, Date, Set, Map, Intl, URL, Blob, setTimeout: () => 0, clearTimeout() {},
    location: {hostname: 'localhost', protocol: 'https:', hash: '', pathname: '/', search: ''},
    localStorage: {getItem(k) {return values.get(k) ?? null;}, setItem(k,v) {values.set(k,v);}},
    window: {addEventListener() {}, __SEED__: {subjects}, __BANKS__: {}, __PAGES__: true},
    document: {addEventListener() {}, querySelector(){return null;},querySelectorAll(){return [];}} };
  vm.createContext(ctx);
  vm.runInContext(read('src/js/00-chapters.js') + '\n' + read('src/js/00-core.js') + '\n' + read('src/js/45-ai.js'), ctx);
  ctx.toast = () => {};
  return {ctx, values};
}

test('malformed imported collections are sanitized before rendering', () => {
  const {ctx} = runtime();
  const st = {entries: {gaodai: [null, {id:'ok', code:'A-1', blocks:[null], variants:null}]}, noteBooks: [null, {id:'nb', pages:[null, {id:'p1', items:[null]}]}], notifications:[null,{id:'n',title:'t'}]};
  assert.equal(ctx.sanitizeStateCollections(st), st);
  assert.equal(st.entries.gaodai.length, 1);
  assert.equal(st.entries.gaodai[0].blocks.length, 0);
  assert.equal(st.noteBooks.length, 1);
  assert.equal(st.noteBooks[0].pages.length, 1);
  assert.equal(st.noteBooks[0].pages[0].items.length, 0);
  assert.equal(st.notifications.length, 1);
});

test('saved state with null entries is treated as corrupt, not silently cleaned', () => {
  const {ctx} = runtime();
  assert.equal(ctx.stateCollectionsIntact({entries: {gaodai: [null]}}), false);
  assert.equal(ctx.stateCollectionsIntact({entries: {gaodai: [{id:'ok'}]}}), true);
  assert.equal(ctx.stateCollectionsIntact({entries: {gaodai: []}, noteBooks: [null]}), false);
});

test('concurrent tabs keep independent additions and expose same-entry conflicts', () => {
  const {ctx} = runtime();
  const local = {rev: 1, entries: {gaodai: [{id:'x', code:'X-1', summary:'本地旧', updatedAt:'2020-01-01T00:00:00.000Z'}]}};
  const remote = {rev: 5, entries: {gaodai: [
    {id:'y', code:'Y-1', summary:'另一标签新增', updatedAt:'2026-01-01T00:00:00.000Z'},
    {id:'x', code:'X-1', summary:'另一标签新', updatedAt:'2030-01-01T00:00:00.000Z'}
  ]}};
  const merged = ctx.mergeConcurrentState(local, remote);
  const ids = merged.entries.gaodai.map(e => e.id);
  assert.ok(ids.includes('y'));
  const x = merged.entries.gaodai.find(e => e.id === 'x');
  assert.equal(x.summary, '另一标签新');
  const conflict = merged.entries.gaodai.find(e => e.syncConflictOf === 'x');
  assert.ok(conflict, 'loser must be kept as a conflict copy');
  assert.equal(conflict.summary, '本地旧');
  assert.equal(merged.rev, 6);
});

test('2027 official holiday and makeup workday calendar is applied', () => {
  const {ctx} = runtime();
  assert.equal(ctx.aiCnCalendarKnown(2027), true);
  assert.equal(ctx.aiIsCnHoliday(new Date(2027, 0, 1)), true);
  assert.equal(ctx.aiIsCnHoliday(new Date(2027, 0, 4)), false);
  assert.equal(ctx.aiIsCnHoliday(new Date(2027, 1, 5)), true);
  assert.equal(ctx.aiIsCnHoliday(new Date(2027, 1, 13)), true);
  assert.equal(ctx.aiIsCnHoliday(new Date(2027, 1, 14)), false);
  assert.equal(ctx.aiPeakStateAt(new Date(2027, 1, 14, 10, 0)), true, 'makeup Sunday is a workday');
  assert.equal(ctx.aiPeakStateAt(new Date(2027, 1, 13, 10, 0)), false, 'Spring Festival is off');
  assert.equal(ctx.aiIsCnHoliday(new Date(2027, 4, 8)), false);
  assert.equal(ctx.aiPeakStateAt(new Date(2027, 4, 8, 10, 0)), true, 'makeup Saturday is a workday');
  assert.equal(ctx.aiPeakStateAt(new Date(2027, 9, 9, 15, 0)), true, 'National Day makeup Saturday is a workday');
  assert.equal(ctx.aiIsCnHoliday(new Date(2028, 0, 1)), true);
  assert.equal(ctx.aiCnCalendarKnown(2028), false);
});

test('template counterexample and derivative notation are corrected', () => {
  const seed = JSON.parse(read('src/data/seed.json'));
  const list = (seed.subjects || []).flatMap(s => s.templates || []);
  const t3 = list.find(t => t.id === 'T-01-03');
  const t4 = list.find(t => t.id === 'T-01-04');
  assert.ok(t3 && JSON.stringify(t3).includes('x^{2}-2'));
  assert.ok(t3 && !JSON.stringify(t3).includes('x^{2}+1'));
  assert.ok(t4 && JSON.stringify(t4).includes('f^{(k-1)}'));
});

test('inline code keeps LaTeX literal and blank underscores render', () => {
  const {parseHTML} = require('linkedom');
  const {document} = parseHTML('<!doctype html><html><body></body></html>');
  const {ctx} = runtime();
  ctx.document = document;
  ctx.window.marked = ctx.marked = require('../src/vendor/marked.umd.js');
  vm.runInContext(read('src/vendor/temml.min.js'), ctx);
  ctx.window.temml = ctx.temml;
  vm.runInContext(read('src/js/10-markdown.js'), ctx);
  const codeHtml = ctx.renderMarkdown('行内 \`$x$ \\\\frac{1}{2}\` 保持，公式 $a_n=____$ 正常。');
  assert.ok(codeHtml.includes('<code>'), codeHtml);
  assert.ok(codeHtml.includes('$x$'), codeHtml);
  assert.ok(codeHtml.includes('\\frac{1}{2}'), codeHtml);
  assert.ok(!codeHtml.includes('math-raw'), codeHtml);
  const blank = ctx.renderMarkdown('$a_n=____$');
  assert.ok(!blank.includes('math-raw'), blank);
});

test('AI results must be complete before auto-save', () => {
  const {ctx} = runtime();
  ctx.aiState.wrongOn = false;
  const good = {
    question: '求 $x$。',
    standardSolution: '解：$x=1$。',
    detailedAnalysis: '移项。',
    answer: '$x=1$',
    variants: [{q: '求 $y$。', a: '$y=2$'}],
    templateTitle: '一元一次方程',
    templateNotes: {features: '一次', method: '移项', skeleton: '移项、合并', pitfalls: '符号'}
  };
  assert.deepEqual(Array.from(ctx.aiResultIssues(good)), []);
  assert.equal(ctx.aiShouldAutoSave({result: good}), true);

  const noQuestion = Object.assign({}, good, {question: ''});
  assert.ok(ctx.aiResultIssues(noQuestion).includes('原题题干'));

  const halfVariant = Object.assign({}, good, {variants: [{q: '求 $y$。', a: ''}]});
  assert.ok(ctx.aiResultIssues(halfVariant).includes('变式题的题目与答案'));

  assert.equal(ctx.aiShouldAutoSave({result: Object.assign({}, good, {needsClarification: true})}), false);
  assert.equal(ctx.aiShouldAutoSave({result: noQuestion}), false);
});
