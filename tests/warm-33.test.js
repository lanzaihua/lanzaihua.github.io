'use strict';
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');

function load(file, globals) {
  const ctx = vm.createContext(Object.assign({ console, Date, Math, JSON, String, Number, Array, Object, RegExp }, globals));
  vm.runInContext(read(file), ctx, { filename: file });
  return ctx;
}

test('review queue uses the next unopened review node, not the total error count', () => {
  const today = new Date(2026, 10, 21, 9, 0, 0).getTime();
  const entries = [
    { id: 'GA-9001', date: '2026-11-20', review: { D1: false, D3: false } },
    { id: 'GA-9002', date: '2026-10-01', review: { D1: false, D3: false } },
    { id: 'GA-9003', date: '2026-10-02', review: { D1: true, D3: false }, reviewAt: { D1: new Date(2026, 10, 21, 8, 0, 0).toISOString() } }
  ];
  const ctx = load('src/js/16-stats.js', {
    SUBJECTS: [{ id: 'gaodai', name: '高等代数' }],
    entriesOf: () => entries,
    reviewPlanKeys: () => ['D1', 'D3'],
    reviewDayAvailableAt: (e, day) => {
      const base = new Date(e.date + 'T00:00:00').getTime();
      return base + (day === 'D1' ? 1 : 3) * 86400000;
    },
    libraryInventory: () => ({ totalBank: 0, totalTemplates: 0, builtInBank: 0, builtInTemplates: 0, userBank: 0, userTemplates: 0, duplicateBank: 0, duplicateTemplates: 0 }),
    state: {}, localDayKey: () => ''
  });
  const q = ctx.reviewQueueStats(today);
  assert.strictEqual(q.overdue, 2);
  assert.strictEqual(q.dueToday, 1);
  assert.strictEqual(q.completedToday, 1);
  assert.strictEqual(q.remaining, 3);
  assert.strictEqual(q.progress, 25);
  assert.ok(q.firstDue && q.firstDue.entryId === 'GA-9002');
});

test('library inventory separates built-in and user resources without double counting duplicate ids', () => {
  const ctx = load('src/js/10-markdown.js', {
    SUBJECTS: [{ id: 'gaodai', name: '高等代数', templates: [{ id: 'T-1' }, { id: 'T-1' }, { id: 'T-2' }] }],
    SUBJ_BY_ID: { gaodai: { id: 'gaodai', name: '高等代数', templates: [{ id: 'T-1' }, { id: 'T-1' }, { id: 'T-2' }] } },
    BANKS: { gaodai: { items: [{ id: 'B1' }, { id: 'B2' }, { id: 'B1' }] } },
    state: { userTemplates: { gaodai: [{ id: 'T-2' }, { id: 'T-3' }] }, userBank: { gaodai: [{ id: 'B2' }, { id: 'B3' }] } },
    ensureBankItemComplete: null, normalizeStars: (n) => n, assessBankDifficulty: (x) => x.difficulty
  });
  const inv = ctx.libraryInventory();
  assert.strictEqual(inv.builtInBank, 2);
  assert.strictEqual(inv.userBank, 1);
  assert.strictEqual(inv.totalBank, 3);
  assert.strictEqual(inv.builtInTemplates, 2);
  assert.strictEqual(inv.userTemplates, 1);
  assert.strictEqual(inv.totalTemplates, 3);
  assert.strictEqual(inv.duplicateBank, 1);
  assert.strictEqual(inv.duplicateTemplates, 1);
});

test('notifications are grouped into learning, operation and system filters', () => {
  const ctx = load('src/js/55-notifications.js', {
    document: { addEventListener: () => {} }, window: {}, state: { notifications: [] }, ui: {}, esc: (s) => String(s || ''), attr: (s) => String(s || ''),
    nowIso: () => '2026-11-21T09:00:00+08:00', markDirty: () => {}, renderNotificationBadge: () => {},
    qs: () => null, qsa: () => [], renderInline: (s) => String(s || ''), renderMarkdown: (s) => String(s || '')
  });
  assert.strictEqual(ctx.notifCategory({ kind: 'review' }), 'learning');
  assert.strictEqual(ctx.notifCategory({ kind: 'update' }), 'system');
  assert.strictEqual(ctx.notifCategory({ kind: 'tip' }), 'operation');
  assert.strictEqual(ctx.notifCategory({ kind: 'warn', title: '复习未到期' }), 'learning');
});

test('AI request lifecycle exposes requesting, success, timeout and failure states without keys', () => {
  const ai = read('src/js/46-direct-ai.js');
  assert.match(ai, /AI_RUNTIME_STATE/);
  assert.match(ai, /aiRuntimeSet\('requesting'/);
  assert.match(ai, /aiRuntimeSet\('success'/);
  assert.match(ai, /aiRuntimeSet\(e && e\.code === 'ABORT' \? 'timeout' : 'failed'/);
  assert.match(ai, /function aiRuntimeLabel\(\)/);
  assert.doesNotMatch(ai, /aiRuntimeSet\([^\n]*apiKey/);
});

test('home uses the review queue and the unified inventory, and backup records its time', () => {
  const shell = read('src/js/15-shell.js');
  const stats = read('src/js/16-stats.js');
  const editor = read('src/js/40-editor.js');
  const css = read('src/styles.css');
  assert.match(shell, /reviewQueueStats\(\)/);
  assert.match(shell, /今日待复习/);
  assert.match(shell, /libraryInventory\(\)/);
  assert.doesNotMatch(shell, /<span>待复习<\/span><b>' \+ t\.unmastered/);
  assert.match(stats, /function dataIntegrityReport\(\)/);
  assert.match(editor, /lastBackupAt/);
  assert.match(editor, /backupStatusText\(\)/);
  assert.match(css, /\.hw-due/);
  assert.match(css, /\.notif-filter/);
});
