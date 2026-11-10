'use strict';
/* 用同槽位（章节+分类+题型+星级）的备用题替换分片中的重复题
   用法: node repair-dups.js <待修分片> <备用分片> <参考分片...> */
const fs = require('fs');
const norm = s => String(s || '').replace(/\s+/g, '');
function main() {
  const [targetFile, poolFile, ...refFiles] = process.argv.slice(2);
  if (!targetFile || !poolFile) { console.log('用法: node repair-dups.js <target> <pool> [ref...]'); process.exit(2); }
  const target = JSON.parse(fs.readFileSync(targetFile, 'utf8'));
  const pool = JSON.parse(fs.readFileSync(poolFile, 'utf8'));
  const refs = refFiles.map(f => JSON.parse(fs.readFileSync(f, 'utf8')));
  const seen = new Set();
  refs.forEach(j => (j.items || []).forEach(it => seen.add(norm(it.question))));
  const used = new Set();
  const slots = new Map();
  (pool.items || []).forEach(it => {
    const k = [it.chapter, it.category, it.type, it.difficulty].join('|');
    if (!slots.has(k)) slots.set(k, []);
    slots.get(k).push(it);
  });
  let replaced = 0;
  const out = [];
  target.items.forEach(it => {
    const n = norm(it.question);
    if (!seen.has(n)) { seen.add(n); out.push(it); return; }
    const k = [it.chapter, it.category, it.type, it.difficulty].join('|');
    const cand = (slots.get(k) || []).find(x => !used.has(x.id) && !seen.has(norm(x.question)));
    if (!cand) throw new Error('槽位无可用替换: ' + k + ' / ' + it.question.slice(0, 40));
    used.add(cand.id);
    const rep = JSON.parse(JSON.stringify(cand));
    rep.id = it.id;
    seen.add(norm(rep.question));
    out.push(rep);
    replaced++;
  });
  const doc = { subject: target.subject || 'shufen', items: out, generatedAt: new Date().toISOString() };
  fs.writeFileSync(targetFile, JSON.stringify(doc, null, 0), 'utf8');
  console.log('replaced', replaced, 'items', out.length);
}
main();
