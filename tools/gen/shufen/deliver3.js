'use strict';
/* 快速交付 part3：ch14-19 用手写 pack，ch20-23 暂用 bank-analysis 的 fallback（均带章节名前缀）
   校验通过后写 out/bank-analysis-part3.json */
const fs = require('fs');
const path = require('path');
const P = require('./pack');
const F = require('./p2lib');
const E = require('./engine');

const OUT = path.join(__dirname, 'out', 'bank-analysis-part3.json');
const fallback = JSON.parse(fs.readFileSync(path.join(__dirname, 'out', 'bank-analysis-part3-fallback.json'), 'utf8'));
const norm = F.norm;
const all = [];
const problems = [];
const chapterCounts = {};
const perf = {};
let seq = 1;
const chapterOf = {};
fallback.items.forEach(it => { chapterOf[it.chapter] = 1; });

for (let n = 14; n <= 23; n++) {
  const num = String(n).padStart(2, '0');
  const hand = path.join(__dirname, 'packsC', 'ch' + num + '.js');
  let ch, items;
  if (fs.existsSync(hand)) {
    const pack = require(hand);
    ch = { name: pack.name, build: () => P.build(pack) };
    perf[ch.name] = 'hand';
  } else {
    const fb = fallback.items.filter(it => it.chapter === (require('./chapters/ch' + num).name));
    const name = require('./chapters/ch' + num).name;
    ch = { name, build: () => fb.slice() };
    perf[ch.name] = 'fallback';
  }
  try { items = ch.build(); } catch (e) { problems.push(ch.name + ' build: ' + e.message); continue; }
  if (items.length !== 150) problems.push(ch.name + ' 题数 ' + items.length);
  const errs = F.checkChapter(items);
  if (errs.length) problems.push(ch.name + ' ' + errs.slice(0, 5).join(' | '));
  items.forEach(it => {
    it.id = 'MA-7' + String(1000 + seq).slice(1);
    it.subject = 'shufen'; it.chapter = ch.name;
    seq++;
  });
  chapterCounts[ch.name] = items.length;
  all.push(...items);
}

const seen = new Map();
const stems = new Map();
for (const it of all) {
  const n = norm(it.question);
  if (seen.has(n)) problems.push('内部重复 ' + it.id + ' / ' + seen.get(n));
  else seen.set(n, it.id);
}
const refs = [
  ['part1', path.join(__dirname, 'out', 'bank-analysis-part1.json')],
  ['part2', path.join(__dirname, 'out', 'bank-analysis-part2.json')],
  ['old', path.join(__dirname, '..', '..', '..', 'src', 'data', 'bank-analysis.json')]
];
const dups = [];
for (const [label, p] of refs) {
  if (!fs.existsSync(p)) continue;
  const j = JSON.parse(fs.readFileSync(p, 'utf8'));
  const s = new Map();
  (j.items || []).forEach(x => s.set(norm(x.question), x.id || '?'));
  for (const it of all) {
    const n = norm(it.question);
    if (s.has(n)) dups.push(it.id + ' ↔ ' + label + ':' + s.get(n) + ': ' + n.slice(0, 50));
  }
}
if (dups.length) problems.push('与其他分片/旧库重复 ' + dups.length + ' 处');
if (all.length !== 1500) problems.push('总题数 ' + all.length);

const bucket = {};
all.forEach(it => { const k = it.type + '|' + it.difficulty; bucket[k] = (bucket[k] || 0) + 1; });
const byCat = {};
all.forEach(it => { byCat[it.category] = (byCat[it.category] || 0) + 1; });

fs.writeFileSync(OUT, JSON.stringify({ subject: 'shufen', items: all, generatedAt: new Date().toISOString() }, null, 0), 'utf8');
console.log(JSON.stringify({ out: OUT, total: all.length, chapters: chapterCounts, perf, bucket, byCat, unique: seen.size, duplicateWithOther: dups.length, dups: dups.slice(0, 10), problems: problems.slice(0, 20), problemCount: problems.length, bytes: fs.statSync(OUT).size }, null, 2));
