'use strict';
const fs = require('fs');
const vm = require('vm');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const { Blob, TextEncoder, Uint8Array, DataView } = globalThis;
const ctx = { console, Date, Math, JSON, Blob, TextEncoder, Uint8Array, DataView, Array, Object, String, Number, RegExp, Set, Map,
  window: { innerWidth: 1200, print() {} },
  document: { addEventListener() {}, querySelector() { return null; }, createElement() { return { style: {}, setAttribute() {}, remove() {}, click() {} }; }, body: { appendChild() {} } },
  state: { activeSubject: 'gaodai' }, SUBJECTS: [{ id: 'gaodai', name: '高等代数' }], SUBJ_BY_ID: { gaodai: { id: 'gaodai', name: '高等代数' } },
  toast() {}, qs() { return null; }, esc(s) { return String(s); }, attr(s) { return String(s); }, renderMarkdown(s) { return s; }, markDirty() {}, nowIso() { return '2026-11-15T00:00:00+08:00'; }, normalizeStars(x) { return x || 3; }, entryTitle() { return ''; }, findEntry() { return null; }, bankOf() { return []; }, aiConfigReady() { return false; }, setTimeout() {}, clearTimeout() {}, location: { hash: '' }, URL: { createObjectURL() { return ''; }, revokeObjectURL() {} } };
vm.createContext(ctx);
vm.runInContext(read('src/js/58-final.js'), ctx);
const bank = JSON.parse(read('src/data/bank-algebra.json')).items.filter(q => q.type === 'subjective' && q.standardSolution).slice(0, 4)
  .concat(JSON.parse(read('src/data/bank-algebra.json')).items.filter(q => q.type === 'choice').slice(0, 3));
const items = bank.map((q, i) => ({
  score: i < 4 ? 10 : 5, title: q.title, question: q.question, answer: q.answer,
  correct: q.correct, options: q.options, standardSolution: q.standardSolution,
  detailedAnalysis: q.detailedAnalysis, points: q.points, pitfalls: q.pitfalls
}));
const paper = { title: '期末模拟卷 · DOCX 导出验证', duration: 120, items };
(async () => {
  const blob = ctx.finalPaperDocxBlob(paper);
  const buf = Buffer.from(await blob.arrayBuffer());
  const out = path.join(ROOT, 'debug', 'export-verify.docx');
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, buf);
  console.log('wrote', out, buf.length, 'bytes');
  const xml = await blob.text().catch(() => '');
})();
