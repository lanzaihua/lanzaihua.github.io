'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const ROOT = path.join(__dirname, '..');
const KEY = 'sanke-cuotiben-v1';
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');

function runtime(raw) {
  const values = new Map(raw === undefined ? [] : [[KEY, raw]]);
  const subjects = JSON.parse(read('src/data/seed.json')).subjects;
  const ctx = { console, Date, Set, Map, Intl, URL, Blob, setTimeout: () => 0, clearTimeout() {},
    location: { hostname: 'localhost', protocol: 'https:', hash: '', pathname: '/', search: '' },
    localStorage: { getItem(k) { return values.get(k) ?? null; }, setItem(k, v) { values.set(k, v); } },
    window: { addEventListener() {}, __SEED__: { subjects }, __BANKS__: {}, __PAGES__: true },
    document: { addEventListener() {}, querySelector() { return null; }, querySelectorAll() { return []; }, getElementById() { return null; }, body: { appendChild() {} } } };
  vm.createContext(ctx);
  vm.runInContext(read('src/js/00-chapters.js') + '\n' + read('src/js/00-core.js'), ctx);
  ctx.toast = () => {};
  return { ctx, values, run(file) { vm.runInContext(read('src/js/' + file), ctx); } };
}

test('backup keeps content block keys while stripping only known credentials', () => {
  const r = runtime(JSON.stringify({ entries: { gaodai: [{ id: 'keep', blocks: [] }], shufen: [], jieji: [], xijing: [] }, prefs: { theme: 'auto' } }));
  r.run('40-editor.js');
  r.ctx.state.entries.gaodai[0].blocks = [{ key: 'original', title: '原题', md: '题干' }, { key: 'standard', title: '标准解答', md: '解：' }];
  r.ctx.state.prefs.apiNoticeDismissed = true;
  r.ctx.state.ai = { apiKey: 'sk-secret', model: 'x' };
  r.ctx.state.sync = { token: 'sync-secret' };
  const safe = r.ctx.backupSafeState();
  assert.equal(safe.entries.gaodai[0].blocks[0].key, 'original');
  assert.equal(safe.entries.gaodai[0].blocks[1].key, 'standard');
  assert.equal(safe.prefs.apiNoticeDismissed, true);
  assert.equal(safe.ai.apiKey, undefined);
  assert.equal(safe.sync.token, undefined);
  const libs = r.ctx.backupSafeLibraries({ templates: [{ key: 'T-01-01', title: '模板' }], apiKey: 'x' });
  assert.equal(libs.templates[0].key, 'T-01-01');
  assert.equal(libs.apiKey, undefined);
});

test('entry and bank lookup by id uses getElementById instead of unsafe selectors', () => {
  const files = ['src/js/20-entries.js', 'src/js/30-library.js', 'src/js/40-editor.js', 'src/js/45-ai.js', 'src/js/50-entry-notes.js', 'src/js/90-init.js'];
  for (const file of files) {
    const src = read(file);
    assert.equal(/qs\('#(?:entry|bank|tpl)-'\s*\+/.test(src), false, file + ' 仍有未转义的 id 选择器');
  }
  assert.match(read('src/js/20-entries.js'), /getElementById\('entry-' \+ entryId\)/);
});

test('cancelling a review checkpoint asks before deleting later checkpoints', () => {
  const src = read('src/js/20-entries.js');
  assert.match(src, /取消打卡会清除后续记录/);
  assert.match(src, /后面已完成的[\s\S]{0,40}个复习节点/);
  assert.match(src, /toggleReview\(entryId, day, true\)/);
});

test('storage overflow shows a persistent banner and blocks silent writes', () => {
  const core = read('src/js/00-core.js');
  assert.match(core, /storageGuardBanner/);
  assert.match(core, /STORAGE_GUARD_CHARS/);
  assert.match(core, /beforeunload/);
  const notes = read('src/js/49-notes.js');
  assert.match(notes, /function noteImageFits/);
  assert.match(notes, /if \(!noteImageFits\(/);
  const css = read('src/styles.css');
  assert.match(css, /\.storage-guard-banner\s*\{/);
});

test('paper DOCX includes options and full solutions, not only the answer', () => {
  const { Blob, TextEncoder, Uint8Array, DataView } = globalThis;
  const ctx = { console, Date, Math, JSON, Blob, TextEncoder, Uint8Array, DataView, Array, Object, String, Number, RegExp, Set, Map,
    window: { innerWidth: 1200, print() {} },
    document: { addEventListener() {}, querySelector() { return null; }, createElement() { return { style: {}, setAttribute() {}, remove() {}, click() {} }; }, body: { appendChild() {} } },
    state: { activeSubject: 'gaodai' }, SUBJECTS: [{ id: 'gaodai', name: '高等代数' }], SUBJ_BY_ID: { gaodai: { id: 'gaodai', name: '高等代数' } },
    toast() {}, qs() { return null; }, esc(s) { return String(s); }, attr(s) { return String(s); }, renderMarkdown(s) { return s; }, markDirty() {}, nowIso() { return '2026-11-15T00:00:00+08:00'; }, normalizeStars(x) { return x || 3; }, entryTitle() { return ''; }, findEntry() { return null; }, bankOf() { return []; }, aiConfigReady() { return false; }, setTimeout() {}, clearTimeout() {}, location: { hash: '' }, URL: { createObjectURL() { return ''; }, revokeObjectURL() {} } };
  vm.createContext(ctx);
  vm.runInContext(read('src/js/58-final.js'), ctx);
  const xml = ctx.finalPaperDocxDocumentXml({ title: '测试卷', duration: 120, items: [
    { score: 3, title: '选择题', question: '若 x^2=1，则 x=（ ）', answer: '±1', correct: 'B', options: [{ key: 'A', text: '1' }, { key: 'B', text: '±1' }, { key: 'C', text: '0' }, { key: 'D', text: '-1' }], standardSolution: '解：由 x^2=1 得 x=±1。', detailedAnalysis: '直接开平方。', points: ['开平方'], pitfalls: ['漏负根'] },
    { score: 7, title: '证明题', question: '证明 1+1=2。', answer: '证明成立', options: [], standardSolution: '证明：由自然数定义可得。', detailedAnalysis: '按定义展开。', points: ['自然数定义'], pitfalls: ['循环论证'] }
  ] });
  for (const t of ['A．', 'B．', 'C．', 'D．', '参考答案与解析', '标准解答：', '详细解析：', '解题要点：', '易错点：']) assert.equal(xml.includes(t), true, 'DOCX 缺少 ' + t);
  assert.equal(/&(?!(amp|lt|gt|quot|apos);)/.test(xml), false, 'DOCX XML 存在非法裸 &');
});
