/* Strict bank QA: per chapter / star / type / category, uniqueness, category fit, fields, old-bank overlap, difficulty signal. */
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const DATA = path.join(ROOT, 'src', 'data');
const FILES = ['bank-algebra.json','bank-analysis.json','bank-geometry.json','bank-western.json'];
const CATS = ['计算题','证明题','概念辨析题','公式填空题','应用题','综合题','反例与存在性题','分类讨论题','误差分析题','多解比较题'];
const TYPE_CAT = { '证明题':['subjective'], '公式填空题':['fill'], '概念辨析题':['choice','subjective'] };
const CAT_TARGET = { '计算题':1075, '证明题':825, '概念辨析题':875, '公式填空题':850, '应用题':675, '综合题':825, '反例与存在性题':750, '分类讨论题':825, '误差分析题':725, '多解比较题':825 };
const norm = s => String(s || '').replace(/\s+/g, '');
const issues = [];
const warn = [];
const all = [];
const baseItems = [];
for (const f of FILES) {
  const j = JSON.parse(fs.readFileSync(path.join(DATA, f), 'utf8'));
  for (const q of j.items) { all.push(q); if (q.examOrigin !== '教材课后习题') baseItems.push(q); }
}
function fail(id, msg) { issues.push(id + ' · ' + msg); }
// 1. global shape
if (baseItems.length < 8250) fail('GLOBAL', '基础题库 ' + baseItems.length + ' < 8250');
if (all.length < 9163) fail('GLOBAL', '题库总数 ' + all.length + ' < 9163');
if (all.filter(q => q.examOrigin === '教材课后习题').length < 590) fail('GLOBAL', '教材课后题 ' + all.filter(q => q.examOrigin === '教材课后习题').length + ' < 590');
if (all.filter(q => q.examOrigin === '习题集').length < 223) fail('GLOBAL', '习题集题 ' + all.filter(q => q.examOrigin === '习题集').length + ' < 223');
const chapters = new Set(all.map(q => q.subject + '|' + q.chapter));
if (chapters.size !== 55) fail('GLOBAL', 'chapters ' + chapters.size + ' != 55');
// 2. exact buckets and category counts
const bucket = new Map(), chapterCat = new Map(), chapterStarCat = new Map(), cats = new Map(), seen = new Map();
for (const q of baseItems) {
  const b = q.subject + '|' + q.chapter + '|' + q.difficulty + '|' + q.type;
  bucket.set(b, (bucket.get(b) || 0) + 1);
  const cc = q.subject + '|' + q.chapter + '|' + q.category;
  chapterCat.set(cc, (chapterCat.get(cc) || 0) + 1);
  const csc = q.subject + '|' + q.chapter + '|' + q.difficulty + '|' + q.category;
  chapterStarCat.set(csc, (chapterStarCat.get(csc) || 0) + 1);
  cats.set(q.category, (cats.get(q.category) || 0) + 1);
  const n = norm(q.question);
  if (seen.has(n)) fail(q.id, '题干重复，同 ' + seen.get(n));
  else seen.set(n, q.id);
}
for (const [k, v] of bucket) if (v < 10) fail(k, '章/星级/题型桶 ' + v + ' < 10');
for (const c of CATS) { const v = cats.get(c) || 0; if (v < CAT_TARGET[c]) fail(c, '全科分类 ' + v + ' < ' + CAT_TARGET[c]); }
for (const c of CATS) if (!cats.has(c)) fail('GLOBAL', '缺少分类 ' + c);
const RELABELED_CHAPTERS = new Set([
  'shufen|第九章 定积分', 'shufen|第十章 定积分的应用', 'shufen|第十一章 反常积分',
  'shufen|第十二章 数项级数', 'shufen|第十三章 函数列与函数项级数'
]);
const RELABEL_CAT_TARGET = { '概念辨析题':25, '公式填空题':20 };
const GAODAI_RELABEL = { '计算题':40, '应用题':0, '误差分析题':5 };
const baseChapters = [...new Set(baseItems.map(q => q.subject + '|' + q.chapter))];
for (const key of baseChapters) {
  for (const c of CATS) {
    const n = chapterCat.get(key + '|' + c) || 0;
    const want = RELABELED_CHAPTERS.has(key) ? (c === '反例与存在性题' ? 0 : (RELABEL_CAT_TARGET[c] || 15)) : (key.startsWith('gaodai|') ? (GAODAI_RELABEL[c] != null ? GAODAI_RELABEL[c] : 15) : 15);
    if (n < want) fail(key + '|' + c, '章/分类 ' + n + ' < ' + want);
  }
}
// 3. chapter-star-category coverage (reported, not a hard fail; every category is guaranteed at chapter level)
let emptyStarCategoryCells = 0;
for (const subject of ['gaodai','shufen','jieji','xijing']) {
  const chs = [...new Set(all.filter(q => q.subject === subject).map(q => q.chapter))];
  const stars = [1,2,3,4,5];
  for (const ch of chs) for (const st of stars) for (const c of CATS) {
    const k = subject + '|' + ch + '|' + st + '|' + c;
    if (!chapterStarCat.has(k)) emptyStarCategoryCells++;
  }
}
// 4. field / option / source / category rules
const oldPath = path.join(DATA, 'bank-western.json.bak-before-rewrite');
const oldSet = new Set();
for (const f of FILES) {
  const p = path.join(DATA, f + '.bak-before-rewrite');
  if (fs.existsSync(p)) for (const q of JSON.parse(fs.readFileSync(p, 'utf8')).items) oldSet.add(norm(q.question));
}
for (const q of all) {
  if (!['choice','fill','subjective'].includes(q.type)) fail(q.id, '非法 type');
  if (!CATS.includes(q.category)) fail(q.id, '非法 category');
  if (!q.title || !q.question || !q.answer || !q.standardSolution || !q.detailedAnalysis) fail(q.id, '缺少核心字段');
  if (!Array.isArray(q.points) || !q.points.length) fail(q.id, 'points 为空');
  if (!Array.isArray(q.pitfalls) || !q.pitfalls.length) fail(q.id, 'pitfalls 为空');
  if (!/考研|真题|同型|教材课后|习题集/.test(String(q.source || ''))) fail(q.id, '来源既不是考研/真题/同型/教材课后/习题集');
  if (/\\cdot\s+2(?![\^0-9A-Za-z])|·\s+2(?![\^0-9A-Za-z])/.test(String(q.question))) fail(q.id, '题干残留公式突变 · 2');
  if (/证明过程见标准解答/.test(String(q.answer))) fail(q.id, '答案只指向标准解答，没有结论');
  const trailingTimesTwo = /(?:\\cdot|·)\s*2\s*(?=\$|$)/;
  ['question', 'answer', 'standardSolution', 'detailedAnalysis'].forEach(function (field) {
    if (trailingTimesTwo.test(String(q[field] || ''))) fail(q.id, field + ' 末尾多乘了 2');
  });
  (q.options || []).forEach(function (o) {
    if (trailingTimesTwo.test(String(o && o.text || ''))) fail(q.id, '选项 ' + (o && o.key) + ' 末尾多乘了 2');
  });
  if (q.type === 'subjective' && String(q.standardSolution).replace(/\s/g, '') === String(q.answer).replace(/\s/g, '')) fail(q.id, '标准解答与答案完全相同');
if (q.type === 'subjective' && !/^(解|证明|答)[：:]/.test(String(q.standardSolution || '').trim())) fail(q.id, '标准解答没有以解/证明/答开头');
  if (q.type === 'subjective' && /^分类讨论题/.test(String(q.title || '')) && !/[\u4e00-\u9fa5]/.test(String(q.standardSolution || ''))) fail(q.id, '分类讨论题的标准解答只有公式/答案');
  const mathFields = [q.question, q.answer, q.standardSolution, q.detailedAnalysis].concat((q.options || []).map((o) => o.text || ''), q.solution || []);
  for (const field of mathFields) {
    if (!field) continue;
    const outside = String(field).replace(/\$\$[\s\S]*?\$\$/g, '').replace(/\$[^$]*\$/g, '');
    if (/\\[a-zA-Z]+|[\uE000\uE001]/.test(outside)) fail(q.id, '数学公式未放入 $...$ 或残留裸 LaTeX');
  }
  if (!['考研原创同型题','教材课后习题','习题集'].includes(q.examOrigin)) fail(q.id, 'examOrigin 错误');
  if (/【[^】]+】/.test(String(q.question))) fail(q.id, '题干含【】题型标记');
  if (/\\text\{[ \t]|[ \t]\}/.test(String(q.question)) || /[\u4e00-\u9fa5][ \t]+[\u4e00-\u9fa5]/.test(String(q.question)) || /[ \t]=|=[ \t]/.test(String(q.question))) fail(q.id, '题干含多余空格');
  if (q.examOrigin !== '教材课后习题' && /模板编号|所属的章节名称|题型名称|标准步骤的第|核心公式或结论|题型特征|适用条件|常见易错点|典型变式|完整步骤/.test(String(q.question))) fail(q.id, '题干仍在问元信息');
  if (q.type === 'choice') {
    const o = q.options || [];
    if (o.length !== 4 || new Set(o.map(x => String(x.text))).size !== 4) fail(q.id, '选项不是四个互异');
    if (!q.correct) fail(q.id, '客观题缺 correct');
  }
  if (q.type === 'fill' && String(q.question).indexOf('____') < 0) fail(q.id, '填空题缺 ____');
  if (q.type === 'fill' && (String(q.question).match(/____/g) || []).length !== 1) fail(q.id, '填空题答题空位不是恰好一个');
  if (q.type === 'fill' && /两法|两种方法.*(?:一致|相同)|三种方法.*(?:一致|相同)|结论一致|结果一致/.test(String(q.answer || ''))) fail(q.id, '填空题答案仍是多方法比较结论');
  if (q.type === 'choice') {
    const opts = q.options || [];
    if (opts.some(function (o) { return !String(o && o.text || '').trim(); })) fail(q.id, '选项存在空白项');
    const normalizedOptions = opts.map(function (o) { return String(o && o.text || '').replace(/\s+/g, ''); });
    if (new Set(normalizedOptions).size !== normalizedOptions.length) fail(q.id, '选项归一化后重复');
    const answerKey = String(q.answer || '').match(/^\s*([A-D])[．.、]/);
    if (answerKey && answerKey[1] !== q.correct) fail(q.id, '答案字母与 correct 不一致');
    const metaOption = /无法确定|无法判断|条件不足|以上(?:答案|说法|判断)?(?:均|都)?不(?:正确|对|成立)|上述等式在给定条件下不成立|该等式只在特殊情形下成立/;
    if (opts.filter(function (o) { return metaOption.test(String(o && o.text || '')); }).length >= 2) fail(q.id, '客观题含两个以上通用元选项');
  }
  const mathHygieneFields = [q.question, q.answer, q.standardSolution, q.detailedAnalysis].concat((q.options || []).map(function (o) { return o && o.text || ''; }), q.solution || []);
  for (const field of mathHygieneFields) {
    if (!field) continue;
    const fieldText = String(field);
    if (/(^|[^\\])\\[0-9]/.test(fieldText)) fail(q.id, '数学文本含单反斜杠数字');
    if (/\\\\\\[A-Za-z](?![A-Za-z])/.test(fieldText)) fail(q.id, '数学文本含三反斜杠非法命令');
    if (/(.{8,80})\s+\1$/.test(fieldText)) fail(q.id, '解答末尾整句重复');
    if (/\\nee/.test(fieldText)) fail(q.id, '数学文本含损坏的 \\nee');
    if (/(?:[A-Za-z](?:subset|subseteq)|=(?:mathbb|mathcal|mathrm|frac|sqrt|infty|cdot|times|partial|nabla)|\bvin\s+[A-Z])/.test(fieldText)) fail(q.id, '数学命令缺反斜杠');
    if (/=\\exists|=\\forall|\\Rightarrow-(?:\\exists|\\forall)|\\iff-(?:\\exists|\\forall)/.test(fieldText)) fail(q.id, '逻辑运算符损坏');
    if (/\\sqrt\{-[0-9]+\^2/.test(fieldText)) fail(q.id, '平方展开写成负数开方');
    if (/设\$\s*\\begin\{(?:pmatrix|bmatrix|vmatrix)\}/.test(fieldText)) fail(q.id, '矩阵题干缺少矩阵名（应写成 设$A=…）');
    if (/其中\$\s*\\begin\{(?:pmatrix|bmatrix|vmatrix)\}/.test(fieldText)) fail(q.id, '矩阵题干缺少矩阵名（应写成 其中系数矩阵$A=…）');
    if (/\$。\s*\$[^$]+\$的结果是/.test(fieldText)) fail(q.id, '公式后句号再问“结果是”，数学语言不连贯');
    const segments = fieldText.split('$');
    for (let i = 1; i < segments.length; i += 2) if (segments[i].indexOf(String.fromCharCode(10)) >= 0) fail(q.id, '$...$ 内含换行');
  }
  const delimiterFields = mathHygieneFields.concat(q.points || [], q.pitfalls || []);
  for (const field of delimiterFields) {
    if (!field) continue;
    const fieldText = String(field).replace(/\\\$/g, '');
    if ((fieldText.match(/\$\$/g) || []).length % 2) { fail(q.id, '数学显示定界符 $$ 不成对'); continue; }
    const inlineText = fieldText.replace(/\$\$[\s\S]*?\$\$/g, '');
    for (const line of inlineText.split(String.fromCharCode(10))) {
      if ((line.match(/\$/g) || []).length % 2) { fail(q.id, '数学定界符 $ 不成对或公式被截断'); break; }
    }
  }
  if (q.type !== 'subjective' && /证明|求证|试证|推导|完整过程|说明[^。]*理由/.test(String(q.question))) fail(q.id, '客观题出现证明/推导任务');
  if (q.type === 'subjective' && (String(q.answer || '').trim() === '等式成立。' || /^(证毕|命题得证|命题正确|命题成立|略)([：:。]|$)/.test(String(q.answer || '').trim()) || /本题考查[^。]*每一步的依据/.test(String(q.detailedAnalysis)))) fail(q.id, '主观题解答仍是占位/一句话结论');
  if (TYPE_CAT[q.category] && TYPE_CAT[q.category].indexOf(q.type) < 0) fail(q.id, '分类/题型不匹配');
  if (q.category === '应用题' && /^应用情境：结合实际问题中的数据/.test(String(q.question))) fail(q.id, '应用题只有伪情境前缀，没有真实应用信息');
  if (q.subject === 'gaodai' && q.category === '误差分析题' && !/误差|近似|某同学|错误|错解|指出|纠错|诊断|验算|检验/.test(String(q.question))) fail(q.id, '高代误差分析题题干没有误差/诊断信号');
  if (oldSet.has(norm(q.question))) fail(q.id, '与旧题库题干重复');
  if (!Number.isInteger(q.difficulty) || q.difficulty < 1 || q.difficulty > 5) fail(q.id, 'difficulty 不是 1-5');
  const text = String(q.question) + ' ' + String(q.standardSolution) + ' ' + String(q.detailedAnalysis);
  if (q.difficulty === 1 && /构造反例|分类讨论|参数讨论|存在性证明/.test(String(q.question))) warn.push(q.id + ' · 1★ 出现高难任务');
  if (q.difficulty === 5 && /默写|直接写出|写出公式|背诵/.test(String(q.question))) warn.push(q.id + ' · 5★ 仍是记忆型任务');
}
// 4b. quota: every chapter × star × type must have at least 10 base questions
const quota = new Map();
for (const q of baseItems) {
  const k = q.subject + '|' + q.chapter + '|' + q.difficulty + '|' + q.type;
  quota.set(k, (quota.get(k) || 0) + 1);
}
let minQuota = Infinity;
for (const [k, n] of quota) { minQuota = Math.min(minQuota, n); if (n < 10) fail(k, '每章每星每型至少 10 题，当前 ' + n); }
// 5. output
const summary = { total: all.length, chapters: chapters.size, unique: new Set(all.map(q => norm(q.question))).size, bucketCount: bucket.size, categoryCount: cats.size, minQuota, emptyStarCategoryCells, problems: issues.length, warnings: warn.length };
console.log(JSON.stringify(summary, null, 2));
if (warn.length) console.log('WARNINGS:\n' + warn.slice(0, 20).join('\n'));
if (issues.length) {
  console.log('PROBLEMS:\n' + issues.slice(0, 40).join('\n'));
  process.exit(1);
}
if (warn.length && process.argv.includes('--strict-difficulty')) { console.log('DIFFICULTY WARNINGS FAILED (--strict-difficulty)'); process.exit(1); }
console.log('STRICT QA PASS' + (warn.length ? ' (difficulty warnings reported; use --strict-difficulty to fail)' : ''));
