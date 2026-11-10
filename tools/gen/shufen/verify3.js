'use strict';
const fs = require('fs');
const path = require('path');
const norm = s => String(s || '').replace(/\s+/g, '');
const j = JSON.parse(fs.readFileSync(path.join(__dirname, 'out', 'bank-analysis-part3.json'), 'utf8'));
const items = j.items;
const refs = {
  old: JSON.parse(fs.readFileSync(path.join(__dirname, '..', '..', '..', 'src', 'data', 'bank-analysis.json.bak-before-rewrite'), 'utf8')).items,
  part1: JSON.parse(fs.readFileSync(path.join(__dirname, 'out', 'bank-analysis-part1.json'), 'utf8')).items,
  part2: JSON.parse(fs.readFileSync(path.join(__dirname, 'out', 'bank-analysis-part2.json'), 'utf8')).items
};
const res = {};
for (const k of Object.keys(refs)) {
  const s = new Set(refs[k].map(x => norm(x.question)));
  let n = 0; items.forEach(it => { if (s.has(norm(it.question))) n++; });
  res[k] = n;
}
const ch = {}, bucket = {}, cat = {};
const ids = new Set();
items.forEach(it => { ch[it.chapter] = (ch[it.chapter] || 0) + 1; bucket[it.type + '|' + it.difficulty] = (bucket[it.type + '|' + it.difficulty] || 0) + 1; cat[it.category] = (cat[it.category] || 0) + 1; ids.add(it.id); });
console.log(JSON.stringify({ total: items.length, uniqueIds: ids.size, dupsWithOldBank: res.old, dupsWithPart1: res.part1, dupsWithPart2: res.part2, cat, bucket, chapters: ch }, null, 1));
