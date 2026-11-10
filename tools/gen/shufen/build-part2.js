'use strict';
/* part2 装配器：只装配第四章—第十三章 -> out/part2.json
   章节模块直接从 chapters/ch04.js…ch13.js 读取（不依赖 chapters/index.js，避免与并行队友冲突）。
   校验：每章 150；10 类各 15；choice/fill/subjective 各 50；题型×难度各 10；
   必填字段/四选项/填空空位/source/题干长度；全 part2 题干唯一；
   并与旧题库 src/data/bank-analysis.json、暂存 out/bank-analysis.json 做题干查重。 */
const fs = require('fs');
const path = require('path');
const F = require('./p2lib');

const OUT = process.env.PART2_OUT || path.join(__dirname, 'out', 'bank-analysis-part2.json');
const ALIAS = path.join(__dirname, 'out', 'part2.json');
const ID_PREFIX = process.env.PART2_ID || 'MA-9';
const NUM = ['04', '05', '06', '07', '08', '09', '10', '11', '12', '13'];

function loadBankStems() {
  const oldBak = path.join(__dirname, '..', '..', '..', 'src', 'data', 'bank-analysis.json.bak-before-rewrite');
  const old = fs.existsSync(oldBak) ? oldBak : path.join(__dirname, '..', '..', '..', 'src', 'data', 'bank-analysis.json');
  const part1 = path.join(__dirname, 'out', 'bank-analysis-part1.json');
  const staged = fs.existsSync(part1) ? part1 : path.join(__dirname, 'out', 'bank-analysis.json');
  const map = new Map();
  for (const [label, p] of [['old', old], ['staged', staged]]) {
    if (!fs.existsSync(p)) continue;
    const j = JSON.parse(fs.readFileSync(p, 'utf8'));
    for (const q of j.items || []) {
      const n = F.norm(q.question);
      if (n && !map.has(n)) map.set(n, label + ':' + q.id);
    }
  }
  return map;
}

const all = [];
const chapterCounts = {};
const problems = [];
const seen = new Map();
const bankStems = loadBankStems();
const dupsOld = [], dupsStaged = [], dupsInner = [];
let seq = 1;

for (const num of NUM) {
  const file = path.join(__dirname, 'chapters', 'ch' + num + '.js');
  if (!fs.existsSync(file)) { problems.push('缺少章节模块: chapters/ch' + num + '.js'); continue; }
  let ch;
  try { ch = require(file); } catch (e) { problems.push('ch' + num + ' 加载异常: ' + e.message); continue; }
  let items;
  try { items = ch.build(); } catch (e) { problems.push(ch.name + ' 构建异常: ' + e.message); continue; }
  if (items.length !== 150) problems.push(ch.name + ' 生成 ' + items.length + ' 题 ≠ 150');
  const errs = F.checkChapter(items);
  if (errs.length) problems.push(ch.name + ' 校验失败: ' + errs.slice(0, 8).join(' | '));
  items.forEach(it => {
    it.id = ID_PREFIX + String(1000 + seq).slice(1);
    it.subject = 'shufen';
    it.chapter = ch.name;
    const n = F.norm(it.question);
    if (seen.has(n)) problems.push('重复题干: ' + it.id + ' / ' + seen.get(n) + ': ' + n.slice(0, 40));
    else seen.set(n, it.id);
    const hit = bankStems.get(n);
    if (hit) (hit.startsWith('old:') ? dupsOld : dupsStaged).push(it.id + ' ↔ ' + hit + ': ' + n.slice(0, 50));
    seq++;
  });
  chapterCounts[ch.name] = items.length;
  all.push(...items);
}

const missing = F.TARGETS.filter(t => !Object.keys(chapterCounts).some(k => k.startsWith(t)));
if (missing.length) problems.push('缺少章节: ' + missing.join('、'));

const bucket = {};
all.forEach(it => { const k = it.type + '|' + it.difficulty; bucket[k] = (bucket[k] || 0) + 1; });
const byCat = {};
all.forEach(it => { byCat[it.category] = (byCat[it.category] || 0) + 1; });

fs.mkdirSync(path.dirname(OUT), { recursive: true });
const doc = { subject: 'shufen', items: all, generatedAt: new Date().toISOString() };
fs.writeFileSync(OUT, JSON.stringify(doc, null, 0), 'utf8');
fs.writeFileSync(ALIAS, JSON.stringify(doc, null, 0), 'utf8');
console.log(JSON.stringify({
  out: OUT,
  total: all.length,
  chapters: chapterCounts,
  bucket, byCat,
  unique: seen.size,
  duplicateStemsOldBank: dupsOld.length,
  duplicateStemsStaged: dupsStaged.length,
  dupsOld: dupsOld.slice(0, 15),
  dupsStaged: dupsStaged.slice(0, 15),
  problems: problems.slice(0, 40),
  problemCount: problems.length,
  bytes: fs.statSync(OUT).size
}, null, 2));
process.exit(problems.length ? 1 : 0);