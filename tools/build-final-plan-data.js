const fs = require('fs');
const path = require('path');
const os = require('os');
const vm = require('vm');
const ROOT = path.resolve(__dirname, '..');
const csFile = path.join(ROOT, 'src/js/00-chapters.js');
const ctx = { console };
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(csFile, 'utf8') + '\n;globalThis.__CS = CHAPTER_SECTIONS;', ctx, { filename: csFile });
const CS = ctx.__CS;
const SKILL_BASE = process.env.SKILLS_DIR || path.join(os.homedir(), '.agents', 'skills');
const CFG = {
  gaodai: { dir: 'advanced-algebra', book: '《高等代数》第六版（北大）' },
  shufen: { dir: 'mathematical-analysis', book: '《数学分析》第六版（华东师大）' },
  jieji: { dir: 'analytic-geometry', book: '《解析几何》第五版（吕林根）' },
  xijing: { dir: 'western-economics', book: '《西方经济学》第二版（马工程）' }
};
const CN = { '一':1,'二':2,'三':3,'四':4,'五':5,'六':6,'七':7,'八':8,'九':9,'十':10,'十一':11,'十二':12,'十三':13,'十四':14,'十五':15,'十六':16,'十七':17,'十八':18,'十九':19,'二十':20,'二十一':21,'二十二':22,'二十三':23 };
function chapterNo(name) { const m = /^第(.+?)章/.exec(String(name)); return m && CN[m[1]] ? CN[m[1]] : 99; }
function cleanSection(s) {
  return String(s || '').replace(/\s*（[★☆]+）/g, '').replace(/\x60/g, '').replace(/\s+/g, ' ').replace(/\s*（[^）]*）\s*$/,'').trim();
}
function cleanPunct(s) {
  return String(s || '').replace(/。：/g, '：').replace(/：。/g, '：').replace(/。。/g, '。').replace(/，，/g, '，').replace(/；。/g, '；').replace(/、。/g, '、');
}
function stripMd(s) {
  return String(s || '').replace(/\r/g, '').replace(/\*\*/g, '').replace(/\x60/g, '').replace(/\$/g, '').replace(/\s+/g, ' ').trim();
}
function splitConcepts(text) {
  const m = /## Key Concepts[^\n]*\n([\s\S]*?)(?=\n## )/.exec(text);
  if (!m) return [];
  const body = m[1];
  const out = [];
  let cur = null;
  body.split(/\r?\n/).forEach(function (line) {
    let mm = /^\s*[-*]\s+\*\*(.+?)\*\*\s*[：:]\s*(.*)$/.exec(line);
    if (!mm) mm = /^\s*\*\*(.+?)\*\*\s*[：:]\s*(.*)$/.exec(line);
    if (mm) { if (cur) out.push(cur); cur = { name: stripMd(mm[1]), detail: stripMd(mm[2]) }; return; }
    if (cur && line.trim()) cur.detail += ' ' + stripMd(line);
  });
  if (cur) out.push(cur);
  return out.filter(function (x) { return x.name && x.detail; });
}
function splitModels(text) {
  const m = /## Mental Models[^\n]*\n([\s\S]*?)(?=\n## )/.exec(text);
  if (!m) return [];
  const out = [];
  m[1].split(/\r?\n/).forEach(function (line) {
    let mm = /^\s*(?:[-*]|\d+[.)])\s+\*\*(.+?)\*\*\s*[：:]?\s*(.*)$/.exec(line);
    if (mm) { out.push(stripMd(mm[1] + '：' + mm[2])); return; }
    mm = /^\s*(?:[-*]|\d+[.)])\s+(.+)$/.exec(line);
    if (mm) out.push(stripMd(mm[1]));
  });
  return out.filter(Boolean);
}
function bigrams(s) {
  s = String(s || '').replace(/[^\u4e00-\u9fa5A-Za-z0-9]/g, '');
  const set = {};
  for (let i = 0; i < s.length - 1; i++) set[s.slice(i, i + 2)] = 1;
  return set;
}
function overlap(a, b) {
  const A = bigrams(a), B = bigrams(b); let n = 0;
  for (const k in A) if (B[k]) n++;
  return n;
}
function bestBy(text, list) {
  let best = null, score = -1;
  list.forEach(function (x) { const s = overlap(text, typeof x === 'string' ? x : x.name); if (s > score) { score = s; best = x; } });
  return { best: best, score: score };
}
const out = { version: 1, generatedAt: '2026-11-16', subjects: {} };
for (const subject of Object.keys(CFG)) {
  const cfg = CFG[subject];
  const chapters = Object.keys(CS[subject] || {}).sort(function (a, b) { return chapterNo(a) - chapterNo(b); });
  const dir = path.join(SKILL_BASE, cfg.dir, 'chapters');
  const files = fs.readdirSync(dir).filter(function (f) { return /^ch\d+.*\.md$/.test(f); }).sort();
  const planned = [];
  chapters.forEach(function (chapter, ci) {
    const wanted = 'ch' + String(ci + 1).padStart(2, '0');
    const file = files.filter(function (x) { return x.indexOf(wanted + '-') === 0; })[0];
    if (!file) return;
    const text = fs.readFileSync(path.join(dir, file), 'utf8');
    const concepts = splitConcepts(text);
    const models = splitModels(text);
    const allSections = (CS[subject][chapter] || []).map(cleanSection).filter(Boolean);
    if (!allSections.length) return;
    const points = [];
    let sj = 0;
    concepts.forEach(function (c) {
      let bestJ = Math.min(sj, allSections.length - 1);
      let bestScore = -1;
      const nameKey = String(c.name).replace(/（[^）]*）/g, '').replace(/\s+/g, '');
      for (let j = sj; j < Math.min(allSections.length, sj + 4); j++) {
        const secKey = String(allSections[j]).replace(/（[^）]*）/g, '').replace(/\s+/g, '');
        let score = overlap(allSections[j], c.name) * 3 + overlap(allSections[j], c.detail) * 0.6;
        if (nameKey === secKey) score += 30;
        else if (nameKey.indexOf(secKey) >= 0 || secKey.indexOf(nameKey) >= 0) score += 10;
        if (score > bestScore) { bestScore = score; bestJ = j; }
      }
      if (bestScore <= 0) bestJ = Math.min(sj, allSections.length - 1);
      else sj = bestJ;
      const section = allSections[bestJ];
      const model = bestBy(section + ' ' + c.name, models).best || models[0] || '';
      points.push({
        name: c.name,
        detail: cleanPunct(c.detail.slice(0, 300)),
        section: '§' + (ci + 1) + '.' + (bestJ + 1) + ' ' + section,
        source: cfg.book + ' · ' + chapter + ' · §' + (ci + 1) + '.' + (bestJ + 1) + ' ' + section,
        memory: (function () {
          var hook = '记「' + c.name + '」：' + String(c.detail || '').replace(/[。；;]+$/, '').slice(0, 96);
          var use = cleanPunct(String(model || '')).replace(/[。；;]+$/, '').slice(0, 96);
          return hook + '。考场：' + (use || '先写定义或判据，再代入条件，最后用特例检查') + '。';
        })()
      });
    });
    planned.push({ chapter: chapter, chapterNo: ci + 1, sectionCount: allSections.length, points: points });
  });
  out.subjects[subject] = { book: cfg.book, skill: cfg.dir, chapters: planned };
}
const dest = path.join(ROOT, 'src/data/final-plan-knowledge.json');
fs.writeFileSync(dest, JSON.stringify(out, null, 2) + '\n', 'utf8');
let pts = 0, chs = 0;
Object.keys(out.subjects).forEach(function (s) { chs += out.subjects[s].chapters.length; out.subjects[s].chapters.forEach(function (c) { pts += c.points.length; }); });
console.log('wrote', dest, 'subjects', Object.keys(out.subjects).length, 'chapters', chs, 'points', pts, 'bytes', fs.statSync(dest).size);
