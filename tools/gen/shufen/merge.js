'use strict';
/* 合并 part1/part2/part3 -> out/bank-analysis.json，并做全科校验 */
const fs = require('fs');
const path = require('path');
const E = require('./engine');
const { CATS } = E;
const OUTDIR = path.join(__dirname, 'out');
const ARGS = process.argv.slice(2).filter(x => x.endsWith('.json'));
const FILES = ARGS.length ? ARGS.map(f => path.basename(f)) : ['bank-analysis-part1.json', 'bank-analysis-part2.json', 'bank-analysis-part3.json'];
const OUT = process.env.MERGE_OUT ? path.resolve(process.env.MERGE_OUT) : path.join(OUTDIR, 'bank-analysis.json');
const CHAPTERS = 23;
const norm = s => String(s || '').replace(/\s+/g, '');
const CATTYPE = { '证明题': 'subjective', '公式填空题': 'fill', '概念辨析题': 'choice' };

function normalize(it) {
  it.id = it.id || 'TMP';
  it.subject = 'shufen';
  it.title = it.title || ((it.category || '题目') + ' · ' + (it.topic || '典型题'));
  it.solution = Array.isArray(it.solution) && it.solution.length ? it.solution : [String(it.standardSolution || it.answer || '')];
  it.tags = Array.isArray(it.tags) && it.tags.length ? it.tags : [it.category || '题目'];
  it.templateId = it.templateId || '';
  it.templateTitle = it.templateTitle || '';
  it.templateNotes = it.templateNotes || null;
  it.verification = it.verification || '';
  it.variants = Array.isArray(it.variants) ? it.variants : [];
  it.relatedEntries = Array.isArray(it.relatedEntries) ? it.relatedEntries : [];
  it.pointKeys = Array.isArray(it.pointKeys) && it.pointKeys.length ? it.pointKeys : (Array.isArray(it.points) ? it.points.slice(0, 3) : []);
  it.difficulty = Number(it.difficulty) || 1;
  if (it.type === 'choice' && Array.isArray(it.options)) {
    it.options = it.options.map((o, i) => (o && typeof o === 'object') ? { key: String(o.key || 'ABCD'[i] || 'A').toUpperCase().slice(0, 1), text: String(o.text == null ? o : o.text) } : { key: 'ABCD'[i] || 'A', text: String(o) });
    if (!it.correct && Array.isArray(it.answer)) it.correct = '';
  }
  if (it.type === 'subjective' && !it.answer) it.answer = '见解答。';
  return it;
}

function validateItem(it, errs) {
  if (!it.id) errs.push('缺 id');
  if (!it.question || !it.answer || !it.standardSolution || !it.detailedAnalysis) errs.push((it.id || '?') + ' 字段缺失');
  if (!Array.isArray(it.points) || !it.points.length) errs.push((it.id || '?') + ' 缺 points');
  if (!Array.isArray(it.pitfalls) || !it.pitfalls.length) errs.push((it.id || '?') + ' 缺 pitfalls');
  if (!/考研(原创同型|真题)/.test(String(it.source || ''))) errs.push((it.id || '?') + ' source 不合规');
  if (it.examOrigin !== '考研原创同型题' && !/真题/.test(String(it.source || ''))) errs.push((it.id || '?') + ' 缺 examOrigin');
  if (!['choice', 'fill', 'subjective'].includes(it.type)) errs.push((it.id || '?') + ' type 非法');
  if (!CATS.includes(it.category)) errs.push((it.id || '?') + ' category 非法');
  if (CATTYPE[it.category] && it.type !== CATTYPE[it.category]) errs.push((it.id || '?') + ' 分类与题型不符');
  if (it.type === 'choice') {
    const o = it.options || [];
    if (o.length !== 4 || new Set(o.map(x => String(x && x.text))).size !== 4 || !it.correct) errs.push((it.id || '?') + ' 客观题选项/答案不合规');
  }
  if (it.type === 'fill' && !/____/.test(String(it.question))) errs.push((it.id || '?') + ' 填空缺空位');
  if (/【[^】]+】/.test(String(it.question))) errs.push((it.id || '?') + ' 含【】');
  ['question', 'answer', 'standardSolution', 'detailedAnalysis'].forEach(f => {
    const s = String(it[f] || '');
    if ((s.match(/\$/g) || []).length % 2) errs.push((it.id || '?') + ' ' + f + ' 的 $ 不成对');
    if (/[\uE000\uE001]/.test(s)) errs.push((it.id || '?') + ' ' + f + ' 含占位符');
  });
  (it.options || []).forEach(o => {
    const s = String(o && o.text || '');
    if ((s.match(/\$/g) || []).length % 2) errs.push((it.id || '?') + ' 选项 $ 不成对');
  });
}

function stripPrefix(s) { return String(s || '').replace(/\s+/g, '').replace(/^在《[^》]*》中，/, ''); }

function main() {
  const items = [];
  const errs = [];
  const chapterCount = {};
  FILES.forEach(f => {
    const p = path.join(OUTDIR, f);
    if (!fs.existsSync(p)) { errs.push('缺少分片文件: ' + f); return; }
    const j = JSON.parse(fs.readFileSync(p, 'utf8'));
    if (!Array.isArray(j.items)) { errs.push(f + ' 缺少 items'); return; }
    console.log(f + ': ' + j.items.length + ' 题, ' + new Set(j.items.map(x => x.chapter)).size + ' 章');
    j.items.forEach(it => { normalize(it); items.push(it); chapterCount[it.chapter] = (chapterCount[it.chapter] || 0) + 1; });
  });
  if (errs.length) { console.log('分片问题:', errs.slice(0, 10)); process.exit(1); }
  // 旧题检查：与备份旧库比较（题干完全相同或仅章节前缀不同）
  const bakPath = path.join(__dirname, '..', '..', '..', 'src', 'data', 'bank-analysis.json.bak-before-rewrite');
  if (fs.existsSync(bakPath)) {
    const old = JSON.parse(fs.readFileSync(bakPath, 'utf8')).items || [];
    const oldExact = new Set(old.map(x => norm(x.question)));
    const oldStripped = new Set(old.map(x => stripPrefix(x.question)));
    let hits = 0;
    items.forEach(it => { if (oldExact.has(norm(it.question)) || oldStripped.has(stripPrefix(it.question))) { hits++; if (hits <= 10) errs.push('与旧库重复: ' + (it.id || '?') + ' ' + String(it.question).slice(0, 40)); } });
    if (hits) errs.push('共 ' + hits + ' 题与旧库重复');
  }
  const chapters = Object.keys(chapterCount);
  if (chapters.length !== CHAPTERS) errs.push('章节数 ' + chapters.length + ' ≠ ' + CHAPTERS);
  chapters.forEach(ch => {
    if (chapterCount[ch] !== 150) errs.push(ch + ' 题数 ' + chapterCount[ch] + ' ≠ 150');
  });
  if (items.length !== 3450) errs.push('总数 ' + items.length + ' ≠ 3450');
  // 分类/题型/星级
  const byCat = {}, byType = {}, byTypeD = {};
  items.forEach(it => {
    byCat[it.category] = (byCat[it.category] || 0) + 1;
    byType[it.type] = (byType[it.type] || 0) + 1;
    const k = it.type + '|' + it.difficulty;
    byTypeD[k] = (byTypeD[k] || 0) + 1;
    validateItem(it, errs);
  });
  CATS.forEach(c => { if (byCat[c] !== 345) errs.push('分类 ' + c + ' ' + (byCat[c] || 0) + ' ≠ 345'); });
  ['choice', 'fill', 'subjective'].forEach(t => { if (byType[t] !== 1150) errs.push('题型 ' + t + ' ' + (byType[t] || 0) + ' ≠ 1150'); });
  // 每章每型每星 10
  const cell = {};
  items.forEach(it => { const k = it.chapter + '|' + it.type + '|' + it.difficulty; cell[k] = (cell[k] || 0) + 1; });
  Object.keys(cell).forEach(k => { if (cell[k] !== 10) errs.push('格子 ' + k + ' = ' + cell[k] + ' ≠ 10'); });
  // 唯一
  const seen = new Map();
  items.forEach(it => {
    const n = norm(it.question);
    if (seen.has(n)) errs.push('重复题干 ' + it.id + ' / ' + seen.get(n));
    else seen.set(n, it.id);
  });
  // 重编号 & 写盘（先不写，校验通过再写）
  if (errs.length) {
    console.log('校验问题(' + errs.length + '):'); errs.slice(0, 25).forEach(e => console.log(' - ' + e));
    process.exit(1);
  }
  items.sort((a, b) => {
    const ca = chapters.indexOf(a.chapter), cb = chapters.indexOf(b.chapter);
    if (ca !== cb) return ca - cb;
    return String(a.id).localeCompare(String(b.id));
  });
  items.forEach((it, i) => { it.id = 'MA-' + String(i + 1).padStart(4, '0'); it.subject = 'shufen'; });
  const doc = { subject: 'shufen', items, generatedAt: new Date().toISOString() };
  fs.writeFileSync(OUT, JSON.stringify(doc, null, 0), 'utf8');
  console.log('merged ->', OUT, 'bytes', fs.statSync(OUT).size);
  console.log('total', items.length, 'chapters', chapters.length, 'unique', seen.size);
  console.log('categories', JSON.stringify(byCat));
}
main();
