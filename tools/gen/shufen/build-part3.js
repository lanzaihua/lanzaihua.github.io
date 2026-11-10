'use strict';
/* part3 装配器：第十四章—第二十三章 -> out/bank-analysis-part3.json
   优先使用 packsC/chXX.js（手写 pack）；缺失时退回 chapters/chXX.js（chgeneric 通用框架）。
   校验：每章 150；10 类各 15；choice/fill/subjective 各 50；题型×难度各 10；
   必填字段/四选项/填空空位/source/$成对/题干长度；part3 内部题干唯一；
   并与 part1、part2、旧题库、暂存 out/bank-analysis.json 做题干查重。 */
const fs = require('fs');
const path = require('path');
const F = require('./p2lib');

const OUT = process.env.PART3_OUT || path.join(__dirname, 'out', 'bank-analysis-part3.json');
const NUMS = ['14', '15', '16', '17', '18', '19', '20', '21', '22', '23'];
const ROOT = path.join(__dirname, '..', '..', '..');

function loadStems() {
  const files = [
    ['part1', path.join(__dirname, 'out', 'bank-analysis-part1.json')],
    ['part2', path.join(__dirname, 'out', 'bank-analysis-part2.json')],
    ['part2fallback', path.join(__dirname, 'out', 'bank-analysis-part2-fallback.json')],
    ['old', path.join(ROOT, 'src', 'data', 'bank-analysis.json.bak-before-rewrite')]
  ];
  const map = new Map();
  for (const [label, p] of files) {
    if (!fs.existsSync(p)) continue;
    try {
      const j = JSON.parse(fs.readFileSync(p, 'utf8'));
      for (const q of j.items || []) {
        const n = F.norm(q.question);
        if (n && !map.has(n)) map.set(n, label + ':' + (q.id || '?'));
      }
    } catch (e) { console.log('读取', label, '失败:', e.message); }
  }
  return map;
}

const stems = loadStems();
const all = [];
const chapterCounts = {};
const problems = [];
const seen = new Map();
const dups = [];
const usedGeneric = [];
let seq = 1;

for (const num of NUMS) {
  const hand = path.join(__dirname, 'packsC', 'ch' + num + '.js');
  const gen = path.join(__dirname, 'chapters', 'ch' + num + '.js');
  const useHand = fs.existsSync(hand);
  const file = useHand ? hand : gen;
  let ch;
  try {
    if (useHand) {
      const pack = require(file);
      ch = { name: pack.name, build: () => require('./pack').build(pack) };
    } else {
      ch = require(file);
      usedGeneric.push('ch' + num);
    }
  } catch (e) { problems.push('ch' + num + ' 加载异常: ' + e.message); continue; }
  let items;
  try { items = ch.build(); } catch (e) { problems.push(ch.name + ' 构建异常: ' + e.message); continue; }
  if (items.length !== 150) problems.push(ch.name + ' 生成 ' + items.length + ' 题 ≠ 150');
  const errs = F.checkChapter(items);
  if (errs.length) problems.push(ch.name + ' 校验失败: ' + errs.slice(0, 8).join(' | '));
  items.forEach(it => {
    it.id = 'MA-P3-' + String(seq).padStart(4, '0');
    it.subject = 'shufen';
    it.chapter = ch.name;
    const n = F.norm(it.question);
    if (seen.has(n)) problems.push('part3 重复题干: ' + it.id + ' / ' + seen.get(n) + ': ' + n.slice(0, 40));
    else seen.set(n, it.id);
    if (stems.has(n)) dups.push(it.id + ' ↔ ' + stems.get(n) + ': ' + n.slice(0, 50));
    seq++;
  });
  chapterCounts[ch.name] = items.length;
  all.push(...items);
}

const bucket = {};
all.forEach(it => { const k = it.type + '|' + it.difficulty; bucket[k] = (bucket[k] || 0) + 1; });
const byCat = {};
all.forEach(it => { byCat[it.category] = (byCat[it.category] || 0) + 1; });

fs.mkdirSync(path.dirname(OUT), { recursive: true });
const doc = { subject: 'shufen', items: all, generatedAt: new Date().toISOString() };
fs.writeFileSync(OUT, JSON.stringify(doc, null, 0), 'utf8');
console.log(JSON.stringify({
  out: OUT,
  total: all.length,
  chapters: chapterCounts,
  bucket,
  byCat,
  unique: seen.size,
  genericChapters: usedGeneric,
  duplicateWithOther: dups.length,
  dups: dups.slice(0, 20),
  problemCount: problems.length,
  problems: problems.slice(0, 30),
  bytes: fs.statSync(OUT).size
}, null, 2));
process.exit(problems.length ? 1 : 0);