
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = 'D:\\学习';
const OUT = path.join(__dirname, '..', 'src', 'data', 'seed.json');

function read(p) { return fs.readFileSync(p, 'utf8').replace(/\r\n/g, '\n'); }
function clean(s) { return s == null ? '' : s.replace(/\n{3,}/g, '\n\n').trim(); }

function parseMetaBullets(text) {
  const fields = {};
  const re = /^- \*\*(.+?)\*\*[：:]\s*([\s\S]*?)(?=^- \*\*|^<a id=|\n\n|$)/gm;
  let m;
  while ((m = re.exec(text))) {
    const k = m[1].trim();
    const v = m[2].trim().replace(/\n\s+/g, ' ');
    if (!(k in fields)) fields[k] = v;
  }
  return fields;
}

function escapeRe(s) { return s.replace(/[.*+?^$\{\}()|[\]\\]/g, '\\$&'); }

function section(body, label) {
  const lines = body.split('\n');
  const startRe = new RegExp('^\\*\\*' + escapeRe(label) + '\\*\\*');
  let i = lines.findIndex(l => startRe.test(l));
  if (i < 0) return '';
  const first = lines[i].replace(startRe, '').replace(/^[：:]\s*/, '');
  const buf = first ? [first] : [];
  for (let j = i + 1; j < lines.length; j++) {
    if (/^\*\*[^\n*]+\*\*\s*(?:[：:]|$)/.test(lines[j]) || /^## /.test(lines[j])) break;
    buf.push(lines[j]);
  }
  return clean(buf.join('\n'));
}

const STAR = { '★': 1, '★★': 2, '★★★': 3 };

function parseGaodai() {
  const raw = read(path.join(ROOT, '大一', '高等代数', '错题本.md'));
  const entries = [];
  const blocks = raw.split(/(?=^<a id="e\d{3}"><\/a>)/m);
  for (const b of blocks) {
    const hm = b.match(/^<a id="e(\d{3})"><\/a>\s*\n\n### (\d{3}) · ([^\n]+)\n([\s\S]*)$/m);
    if (!hm) continue;
    const code = hm[2];
    if (code === '000') continue;
    const heading = hm[3].trim();
    const hm2 = heading.match(/^(.+?)·\s*(★+)\s*$/);
    const dateRaw = hm2 ? hm2[1].trim() : heading;
    const weekday = (dateRaw.match(/（(周.)）/) || [])[1] || '';
    const date = dateRaw.replace(/（周.）/, '').trim();
    const stars = hm2 ? STAR[hm2[2]] || 2 : 2;
    const body = hm[4].split(/\n## 附录 A/)[0];
    const meta = parseMetaBullets(body);
    const chRaw = meta['章节'] || '';
    const chMatch = chRaw.match(/^(.+?)（(ch\d+)）\s*·?\s*(.*)$/);
    const chapter = chMatch ? chMatch[1].trim() : chRaw.split('·')[0].trim();
    const chapterCode = chMatch ? chMatch[2] : '';
    const sectionName = chMatch ? chMatch[3].trim() : '';
    const tplRaw = meta['模板'] || '';
    const tplMatch = tplRaw.match(/^(T-\d{2}-\d{2})\s*(.*)$/);
    const points = (meta['知识要点'] || '').split(/；|;|\s*｜\s*/).map(s => s.trim()).filter(Boolean);
    const errorRaw = meta['错因 / 易错点'] || '';
    const errorTypes = ['概念', '计算', '方法选择', '条件漏用', '表述'].filter(t => new RegExp(t + '\\s*[☑√✓]').test(errorRaw));
    const errorNote = errorRaw.replace(/^[^—]*——\s*/, '').trim();

    const original = section(body, '原题');
    const attempt = section(body, '我的错解 / 卡点');
    const standard = section(body, '考试标准解答');
    const analysis = section(body, '详细解析');
    const answer = section(body, '答案');
    const tplNotesRaw = section(body, '同类型题模板');
    const tplNotes = parseMetaBullets(tplNotesRaw);
    const variantRaw = section(body, '变式（自测）');
    const variants = [];
    if (variantRaw) {
      const vm = variantRaw.match(/^([\s\S]*?)(?:\n?<details><summary>变式答案<\/summary>\s*([\s\S]*?)<\/details>)?$/);
      if (vm) variants.push({ q: clean(vm[1]), a: clean(vm[2] || '') });
    }
    const revLine = (body.match(/^\*\*复习\*\*：([^\n]*)$/m) || [])[1] || '';
    const review = {};
    ['D1','D3','D7','D15','D30'].forEach(k => { review[k.toLowerCase()] = new RegExp(k + '\\s*[☑√✓]').test(revLine); });
    review.mastered = /已掌握\s*[☑√✓]/.test(revLine);

    entries.push({
      id: 'gaodai-' + code, code, subject: 'gaodai',
      date, weekday,
      stars,
      chapter, chapterCode, section: sectionName,
      points, templateId: tplMatch ? tplMatch[1] : '', templateTitle: tplMatch ? tplMatch[2] : '',
      source: meta['来源'] || '', errorTypes, errorNote,
      resorted: meta['重排'] || '',
      status: review.mastered ? 'mastered' : 'unmastered',
      review,
      blocks: [
        { key: 'original', title: '原题', md: original },
        { key: 'attempt', title: '我的错解 / 卡点', md: attempt },
        { key: 'standard', title: '考试标准解答', md: standard },
        { key: 'analysis', title: '详细解析', md: analysis },
        { key: 'answer', title: '答案', md: answer }
      ].filter(x => x.md),
      templateNotes: {
        features: tplNotes['识别特征'] || '',
        method: tplNotes['首选方法'] || '',
        skeleton: tplNotes['步骤骨架'] || '',
        pitfalls: tplNotes['易错点'] || ''
      },
      variants,
      reviewLog: []
    });
  }

  const tplRaw = read(path.join(ROOT, '大一', '高等代数', '解题模版库.md'));
  const templates = [];
  let chapter = '';
  let cur = null;
  for (const line of tplRaw.split('\n')) {
    const cm = line.match(/^## (第.+章.*)$/);
    if (cm) { if (cur) { templates.push(cur); cur = null; } chapter = cm[1].trim(); continue; }
    const tm = line.match(/^### (T-\d{2}-\d{2}) (.+)$/);
    if (tm) {
      if (cur) templates.push(cur);
      cur = { id: tm[1], subject: 'gaodai', chapter, title: tm[2].trim(), sections: [] };
      continue;
    }
    if (cur) {
      const kind = line.match(/^- \*\*(识别特征|首选方法|步骤骨架|易错点|关联错题)\*\*[：:]\s*(.*)$/);
      if (kind) cur.sections.push({ label: kind[1], md: kind[2].trim() });
    }
  }
  if (cur) templates.push(cur);

  const conventionsMd = [
    raw.match(/## 一、怎么用[\s\S]*?(?=\n---\n)/)?.[0] || '',
    raw.match(/## 附录 C[\s\S]*/)?.[0] || ''
  ].join('\n\n');
  const exampleMd = raw.match(/## 附录 B[\s\S]*?(?=\n---\n)/)?.[0] || '';
  return { entries, templates, conventionsMd: clean(conventionsMd), exampleMd: clean(exampleMd) };
}

function parseShufen() {
  const raw = read(path.join(ROOT, '大一', '数学分析', '错题本.md'));
  const entries = [];
  const head = raw.split('\n## 三、条目')[1] || '';
  const bodyAll = head.split('\n## 四、复习节奏')[0];
  const parts = bodyAll.split(/(?=^### M-\d{3} ｜ )/m);
  for (const p of parts) {
    const hm = p.match(/^### (M-\d{3}) ｜ (.+)$/m);
    if (!hm) continue;
    const code = hm[1];
    const title = hm[2].trim();
    const meta = parseMetaBullets(p);
    const chRaw = meta['知识要点'] || '';
    const points = chRaw.split(/｜|\|/).map(s => s.trim()).filter(Boolean);
    const tplRaw = meta['对应模板'] || '';
    const tplMatch = tplRaw.match(/^[\x60]?(T-\d+)[\x60]?\s*(.*)$/);
    const dateRaw = meta['日期时间'] || '';
    const date = (dateRaw.match(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}/) || [dateRaw])[0];
    const srcRaw = meta['来源 / 难度'] || '';
    const starsN = (srcRaw.match(/★/g) || []).length;
    const stars = starsN >= 3 ? 3 : starsN >= 2 ? 2 : starsN === 1 ? 1 : 2;
    const chapterCode = (chRaw.match(/ch\d+/) || [''])[0];
    const chapterNames = { ch02: '第二章 数列极限' };
    const chapter = chapterNames[chapterCode] || chapterCode || '未分章';

    const original = meta['题目'] || section(p, '题目');
    const standard = section(p, '考试标准解答过程');
    const analysis = section(p, '详细解析');
    const verification = section(p, '验证');
    const pitfalls = section(p, '易错点 / 当时卡在哪');
    const reviewLog = section(p, '复习记录');
    const reviewItems = reviewLog.split('\n').map(s => s.replace(/^- /, '').trim()).filter(s => s && !/^---+$/.test(s));

    entries.push({
      id: 'shufen-' + code.replace('M-', ''), code, subject: 'shufen',
      date, weekday: '', stars, chapter, chapterCode, section: '',
      points, templateId: tplMatch ? tplMatch[1] : '', templateTitle: tplMatch ? tplMatch[2] : '',
      source: srcRaw, errorTypes: [], errorNote: '',
      summary: title,
      status: 'unmastered',
      review: { d1: false, d3: false, d7: false, d15: false, d30: false, mastered: false },
      blocks: [
        { key: 'original', title: '题目', md: original },
        { key: 'standard', title: '考试标准解答过程', md: standard },
        { key: 'analysis', title: '详细解析', md: analysis },
        { key: 'verification', title: '验证', md: verification },
        { key: 'pitfalls', title: '易错点 / 当时卡在哪', md: pitfalls },
        { key: 'reviewlog', title: '复习记录', md: reviewLog }
      ].filter(x => x.md),
      templateNotes: null,
      variants: [],
      reviewLog: reviewItems
    });
  }

  const tplRaw = read(path.join(ROOT, '大一', '数学分析', '解题模板库.md'));
  const templates = [];
  const tplBody = tplRaw.split('\n## 模板索引')[1] || tplRaw;
  const parts2 = tplBody.split(/(?=^## T-\d{2} ｜ )/m);
  for (const p of parts2) {
    const hm = p.match(/^## (T-\d{2}) ｜ (.+)$/m);
    if (!hm) continue;
    const id = hm[1], title = hm[2].trim();
    const sections = [];
    const re = /^\*\*(识别特征|标准步骤|易错点|例题|路线（[^）]*）)\*\*[：:]?\s*([\s\S]*?)(?=^\*\*|^---|^## |$)/gm;
    let m;
    while ((m = re.exec(p))) sections.push({ label: m[1], md: clean(m[2]) });
    templates.push({ id, subject: 'shufen', chapter: '按题型归档', title, sections });
  }

  const conventionsMd = [
    (raw.match(/## 二、单条格式[\s\S]*?(?=\n---\n)/) || [''])[0],
    (raw.match(/## 四、复习节奏[\s\S]*$/) || [''])[0]
  ].join('\n\n');
  return { entries, templates, conventionsMd: clean(conventionsMd), exampleMd: '' };
}

function parseJieji() {
  const raw = read(path.join(ROOT, '大一', '解析几何', '错题本', '错题本.md'));
  const readme = read(path.join(ROOT, '大一', '解析几何', '错题本', 'README.md'));

  const templates = [];
  const tplRaw = read(path.join(ROOT, '大一', '解析几何', '错题本', '题型模板库.md'));
  const parts = tplRaw.split(/(?=^## T\d{2} )/m);
  for (const p of parts) {
    const hm = p.match(/^## (T\d{2}) (.+)$/m);
    if (!hm) continue;
    const sections = [];
    const rowRe = /^\| \*\*(.+?)\*\* \| ([\s\S]*?) \|$/gm;
    let m;
    while ((m = rowRe.exec(p))) sections.push({ label: m[1].trim(), md: clean(m[2]) });
    templates.push({ id: hm[1], subject: 'jieji', chapter: '第一章 向量与坐标', title: hm[2].trim(), sections });
  }

  const conventionsMd = [
    (readme.match(/## 一、每次答疑的固定四件套[\s\S]*?(?=\n## 二)/) || [''])[0],
    (readme.match(/## 二、标注规范[\s\S]*?(?=\n## 三)/) || [''])[0],
    (readme.match(/## 三、当前课程进度[\s\S]*?(?=\n## 四)/) || [''])[0],
    (readme.match(/## 五、怎么复习[\s\S]*$/) || [''])[0]
  ].join('\n\n');

  const sampleMd = (readme.match(/## 四、完整示范[\s\S]*?(?=\n## 五)/) || [''])[0];

  return {
    entries: [],
    templates,
    conventionsMd: clean(conventionsMd),
    exampleMd: clean(sampleMd),
    lastUpdated: (raw.match(/最后更新：([^\s｜]+)/) || [])[1] || '',
    headerNote: (raw.match(/^> .*$/m) || [''])[0]
  };
}

const seed = {
  generatedAt: new Date().toISOString(),
  subjects: [
    { id: 'gaodai', name: '高等代数', short: '高代', skill: 'advanced-algebra', tagline: '从极大无关组到二次型，错一道记一类', sourceFile: '大一/高等代数/错题本.md', ...parseGaodai() },
    { id: 'shufen', name: '数学分析', short: '数分', skill: 'mathematical-analysis', tagline: '极限、中值、积分、级数，一步一个判据', sourceFile: '大一/数学分析/错题本.md', ...parseShufen() },
    { id: 'jieji', name: '解析几何', short: '解几', skill: 'analytic-geometry', tagline: '向量、平面、二次曲面，先画图再算', sourceFile: '大一/解析几何/错题本/错题本.md', ...parseJieji() }
  ]
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(seed, null, 2) + '\n', 'utf8');

for (const s of seed.subjects) {
  console.log(s.id, 'entries=' + s.entries.length, 'templates=' + s.templates.length,
    'tplSections=' + s.templates.map(t => t.sections.length).join(','),
    'conventions=' + s.conventionsMd.length, 'example=' + (s.exampleMd || '').length);
  for (const e of s.entries) {
    console.log('  ', e.code, e.date, e.chapter, '| blocks=' + e.blocks.length,
      '| variants=' + e.variants.length, '| points=' + e.points.length,
      '| tpl=' + e.templateId, '| stars=' + e.stars);
  }
}
