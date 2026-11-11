'use strict';
/*
 * 把 src/ 下的模板、样式、脚本、数据、vendor 库打包成一个自包含的
 * dist/index.html —— 可以 file:// 打开，也可以直接拖到任意静态托管。
 */
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const crypto = require('crypto');
const { buildSkillPacks } = require('./tools/build-skill-packs');

const ROOT = path.resolve(__dirname);
const SRC = path.join(ROOT, 'src');
const DIST = path.join(ROOT, 'dist');
const PAGES = process.argv.indexOf('--pages') >= 0;
const OUT = path.join(PAGES ? path.join(ROOT, 'dist-pages') : DIST, 'index.html');

function read(p) { return fs.readFileSync(p, 'utf8'); }
function escScript(s) { return s.replace(/<\/script/gi, '<\\/script'); }

const template = read(path.join(SRC, 'index.template.html'));
const styles = read(path.join(SRC, 'styles.css'));
if (styles.indexOf('mobile overflow hardening') < 0 || styles.indexOf('mobile content visibility pass') < 0 || styles.indexOf('mobile table hint') < 0) throw new Error('styles.css 缺少手机端溢出保护');

const jsDir = path.join(SRC, 'js');
const jsFiles = fs.readdirSync(jsDir).filter(function (f) { return /\.js$/.test(f); }).sort();
// 更新记录日期完整性：历史日期不允许因新版本构建而消失。
const REQUIRED_CHANGELOG_DATES = ['2026-11-05','2026-11-04','2026-11-03','2026-11-02','2026-11-01','2026-10-31','2026-10-30','2026-10-29','2026-10-28','2026-10-27','2026-10-26','2026-10-25','2026-10-24','2026-10-23'];
const changelogSource = read(path.join(SRC, 'js', '48-changelog.js'));
const missingDates = REQUIRED_CHANGELOG_DATES.filter(function (d) {
  return changelogSource.indexOf("date: '" + d + "'") < 0;
});
if (missingDates.length) {
  throw new Error('更新记录缺少历史日期: ' + missingDates.join(', '));
}
// 更新记录标题硬限制：所有版本标题最多 10 个字符，避免历史记录被截断。
const UPDATE_TITLE_MAX = 10;
const longTitles = [];
changelogSource.replace(/^\s{4}(title|historyTitle):\s*'([^']*)',/gm, function (all, key, value) {
  if (Array.from(value).length > UPDATE_TITLE_MAX) longTitles.push(key + ': ' + value);
  return all;
});
if (longTitles.length) {
  throw new Error('更新记录标题超过 ' + UPDATE_TITLE_MAX + ' 个字: ' + longTitles.join(' | '));
}
// 源码编码完整性：禁止 U+FFFD / 常见 mojibake 进入页面，避免出现黑色问号方块。
const sourceTextFiles = [path.join(SRC, 'index.template.html'), path.join(SRC, 'styles.css')].concat(
  jsFiles.map(function (f) { return path.join(jsDir, f); })
);
const dataDir = path.join(SRC, 'data');
if (fs.existsSync(dataDir)) {
  fs.readdirSync(dataDir).filter(function (f) { return /\.(json|md|txt)$/.test(f); }).forEach(function (f) {
    sourceTextFiles.push(path.join(dataDir, f));
  });
}
const encodingBroken = [];
sourceTextFiles.forEach(function (file) {
  var text = read(file);
  if (/\uFFFD|\u00EF\u00BF\u00BD|\u00E2\u20AC/.test(text)) encodingBroken.push(path.relative(ROOT, file));
});
if (encodingBroken.length) {
  throw new Error('页面源码含损坏字符（U+FFFD / mojibake），已阻止构建: ' + encodingBroken.join(', '));
}
// 模拟考答案必须带评分标准与评分细则；缺任一段直接阻止构建。
const examSource = read(path.join(SRC, 'js', '59-exam.js'));
const paperSource = read(path.join(SRC, 'js', '60-paper-edit.js'));
const rubricIssues = [];
if (examSource.indexOf('exam-rubric-rules') < 0) rubricIssues.push('59-exam.js 缺少评分细则');
if (examSource.indexOf('finalExamRubricHtml(q)') < 0) rubricIssues.push('59-exam.js 结果页未挂载评分标准');
if (paperSource.indexOf('评分标准与评分细则') < 0) rubricIssues.push('60-paper-edit.js 打印答案缺少评分标准与评分细则');
if (paperSource.indexOf('+ rubric +') < 0) rubricIssues.push('60-paper-edit.js 打印答案未挂载评分表');
if (rubricIssues.length) throw new Error('模拟考评分内容不完整: ' + rubricIssues.join(' | '));
const app = jsFiles.map(function (f) {
  return '/* ---- ' + f + ' ---- */\n' + read(path.join(jsDir, f));
}).join('\n\n');

const marked = read(path.join(SRC, 'vendor', 'marked.umd.js'));
const temml = read(path.join(SRC, 'vendor', 'temml.min.js'));

// 章节完整性：BOOK_META 必须覆盖四科全部章节，且每章题库至少有一题。
const bookMetaSource = read(path.join(SRC, 'js', '00-core.js'));
const bookMetaBlock = (bookMetaSource.match(/var BOOK_META = \{([\s\S]*?)\n\};/) || [])[1] || '';
const expectedChapterCount = { gaodai: 10, shufen: 23, jieji: 6, xijing: 16 };
const metaChapters = {};
bookMetaBlock.replace(/([a-z]+):\s*\{[\s\S]*?chapters:\s*\[([\s\S]*?)\][\s\S]*?\}/g, function (all, subject, body) {
  metaChapters[subject] = (body.match(/'([^']+)'/g) || []).map(function (x) { return x.slice(1, -1); });
  return all;
});
const chapterIssues = [];
Object.keys(expectedChapterCount).forEach(function (subject) {
  var list = metaChapters[subject] || [];
  if (list.length !== expectedChapterCount[subject]) chapterIssues.push(subject + ' 章节数 ' + list.length + ' ≠ ' + expectedChapterCount[subject]);
  if (new Set(list).size !== list.length) chapterIssues.push(subject + ' 章节重复');
});
const bankChapterFile = { gaodai: 'bank-algebra.json', shufen: 'bank-analysis.json', jieji: 'bank-geometry.json', xijing: 'bank-western.json' };
Object.keys(bankChapterFile).forEach(function (subject) {
  var bank = JSON.parse(read(path.join(SRC, 'data', bankChapterFile[subject])));
  var present = {};
  (bank.items || []).forEach(function (it) { present[it.chapter] = true; });
  (metaChapters[subject] || []).forEach(function (ch) {
    if (!present[ch]) chapterIssues.push(subject + ' 题库缺少章节：' + ch);
  });
});
if (chapterIssues.length) throw new Error('章节覆盖不完整: ' + chapterIssues.join(' | '));

const seed = JSON.parse(read(path.join(SRC, 'data', 'seed.json')));

// 模拟考全站锁定：保留访问门禁与锁定页，防止后续改动把非考试界面重新暴露。
const shellSource = read(path.join(SRC, 'js', '15-shell.js'));
if (shellSource.indexOf('function examAccessLocked') < 0 || shellSource.indexOf('function examLockScreenHtml') < 0) {
  throw new Error('15-shell.js 缺少模拟考全站访问门禁');
}
if (shellSource.indexOf('class="exam-lock"') < 0) throw new Error('15-shell.js 缺少模拟考锁定页');

// 导出文本换行：AI 偶尔把换行写成字面量 \n，渲染与 DOCX 导出前必须统一还原。
const mdExportSource = read(path.join(SRC, 'js', '10-markdown.js'));
if (mdExportSource.indexOf('function normalizeEscapedLineBreaks') < 0) throw new Error('10-markdown.js 缺少字面量换行归一化');
const docxExportSource = read(path.join(SRC, 'js', '58-final.js'));
if (docxExportSource.indexOf('function finalDocxNormalizeText') < 0) throw new Error('58-final.js 缺少 DOCX 字面量换行归一化');
// 删除模拟卷 / 模拟考记录只删除记录本身，绝不改动错题 entries 或题库 bank。
const paperDeleteBody = docxExportSource.slice(docxExportSource.indexOf('function finalDeletePaper'), docxExportSource.indexOf('function finalDeleteSelectedPapers'));
if (/deleteEntry|\.entries\b|bankOf\(|\.bank\b/.test(paperDeleteBody)) throw new Error('finalDeletePaper 不应修改错题或题库');
const examSourceForDelete = read(path.join(SRC, 'js', '59-exam.js'));
const examDeleteBody = examSourceForDelete.slice(examSourceForDelete.indexOf('function finalExamHistoryDeleteIds'), examSourceForDelete.indexOf('function finalExamHistoryConfirmDelete'));
if (/deleteEntry|\.entries\b|bankOf\(|\.bank\b/.test(examDeleteBody)) throw new Error('模拟考删除不应修改错题或题库');
// 满分固定 100：智能分配后必须再做一次 0.5 分单位的精确归零，防止出现 100.5。
const finalScoreSource = read(path.join(SRC, 'js', '58-final.js'));
if (finalScoreSource.indexOf('最终总分必须精确等于 100') < 0) throw new Error('58-final.js 缺少满分 100 的精确归一化');
if (finalScoreSource.indexOf('objective.length * 3') < 0) throw new Error('58-final.js 缺少客观题/填空题统一 3 分');
const examScoreSource = read(path.join(SRC, 'js', '59-exam.js'));
if (examScoreSource.indexOf('return Math.min(100, Math.round(total * 10) / 10);') < 0) throw new Error('59-exam.js 满分显示未限制为 100');
// 行内公式排版：禁止句子中的 $$...$$ 被当作独立公式，禁止 Temml 顶层节点撑满整行。
const markdownGuard = read(path.join(SRC, 'js', '10-markdown.js'));
if (markdownGuard.indexOf('function normalizeInlineDisplayMath') < 0) throw new Error('10-markdown.js 缺少行内公式归一化');
const cssGuard = read(path.join(SRC, 'styles.css'));
if (cssGuard.indexOf('.md math:not([display="block"]) > *') < 0) throw new Error('styles.css 缺少行内公式子节点排版规则');
const examPromptGuard = read(path.join(SRC, 'js', '59-exam.js'));
if (examPromptGuard.indexOf('禁止在句子中间使用') < 0) throw new Error('59-exam.js 出题提示缺少行内公式约束');
// 公式完整性：文本中不允许出现未包进 $...$ 的裸 LaTeX/下标；渲染层必须保留自动包裹兜底。
const markdownSource = read(path.join(SRC, 'js', '10-markdown.js'));
if (markdownSource.indexOf('function wrapBareMathFragments') < 0) {
  throw new Error('10-markdown.js 缺少裸公式自动包裹兜底');
}
function rawMathScan(value, pathName, out) {
  if (typeof value === 'string') {
    var stripped = value.replace(/\$\$[\s\S]*?\$\$/g, ' ').replace(/\$[^$\n]*\$/g, ' ');
    if (/[A-Za-z0-9]\^\{/.test(stripped) || /(^|[^A-Za-z0-9])[A-Za-z]_[A-Za-z0-9{]/.test(stripped) || /[∏∑∫]_/.test(stripped)) {
      out.push(pathName);
    }
    return;
  }
  if (Array.isArray(value)) { value.forEach(function (v, i) { rawMathScan(v, pathName + '[' + i + ']', out); }); return; }
  if (value && typeof value === 'object') { Object.keys(value).forEach(function (k) { rawMathScan(value[k], pathName + '.' + k, out); }); }
}
const rawMathHits = [];
rawMathScan(seed, 'seed', rawMathHits);
if (rawMathHits.length) throw new Error('存在未渲染的裸公式: ' + rawMathHits.slice(0, 8).join(' | '));
const banks = {};
['gaodai', 'shufen', 'jieji', 'xijing'].forEach(function (id) {
  const map = { gaodai: 'bank-algebra.json', shufen: 'bank-analysis.json', jieji: 'bank-geometry.json', xijing: 'bank-western.json' };
  const p = path.join(SRC, 'data', map[id]);
  if (fs.existsSync(p)) {
    try {
      const j = JSON.parse(read(p));
      banks[id] = { subject: id, items: Array.isArray(j.items) ? j.items : [] };
      console.log('bank ' + id + ': ' + banks[id].items.length + ' items');
    } catch (e) {
      console.warn('bank ' + id + ' parse failed: ' + e.message);
      banks[id] = { subject: id, items: [] };
    }
  } else {
    console.warn('bank ' + id + ' missing -> empty');
    banks[id] = { subject: id, items: [] };
  }
});

// 题库覆盖：每个科目、每个章节、每个星级至少 10 题；每题必须含完整解答字段。
// 标准题库开考：必须随机抽题，且流程与 AI 出题一致（先选章节、再守则、再作答）。
const randomExamSource = read(path.join(SRC, 'js', '59-exam.js'));
if (randomExamSource.indexOf('function finalExamShuffle') < 0) throw new Error('59-exam.js 缺少标准题库随机抽题');
if (randomExamSource.indexOf('finalExamChapterMode') < 0) throw new Error('59-exam.js 缺少标准题库章节选择流程');
if (randomExamSource.indexOf('exam-result-diff') < 0) throw new Error('59-exam.js 结果页缺少难度星级');
if (randomExamSource.indexOf('exam-result-question') < 0) throw new Error('59-exam.js 结果页缺少题干');
if (randomExamSource.indexOf('question: q.question, options:') < 0) throw new Error('59-exam.js 批改结果缺少题干字段');
if (randomExamSource.indexOf('finalSmartScoreItems(questions, 100)') < 0) throw new Error('59-exam.js 开考时缺少全卷分值归一化');
if (randomExamSource.indexOf('correct: answered && max > 0') < 0) throw new Error('59-exam.js 未作答可能被判正确');
if (randomExamSource.indexOf('var qAnswered') < 0) throw new Error('59-exam.js 结果页未按作答状态判分');
if (randomExamSource.indexOf('function finalExamRubricMathText') < 0) throw new Error('59-exam.js 缺少评分点数学规范化');
if (randomExamSource.indexOf('exam-rubric-detail') < 0) throw new Error('59-exam.js 评分标准排版缺少结构化列');
if (randomExamSource.indexOf('finalExamComposeByTypeDifficulty') < 0) throw new Error('59-exam.js 缺少按题型×难度组卷');
if (randomExamSource.indexOf('finalExamEnsureCategoryDiversity') < 0) throw new Error('59-exam.js 缺少模拟考题型多样性保障');
if (randomExamSource.indexOf('finalExamStripTypeLabel') < 0) throw new Error('59-exam.js 缺少模拟考纯题干处理');
if (randomExamSource.indexOf('finalExamChoiceAnswer') < 0) throw new Error('59-exam.js 缺少客观题答案字母归一化');
if (randomExamSource.indexOf("String(q.answer || '').trim()") < 0) throw new Error('AI 新题缺少答案校验');
if (randomExamSource.indexOf('finalExamEnsureStandardTypes') < 0) throw new Error('59-exam.js 缺少标准题库题型保障');
if (randomExamSource.indexOf('choiceTarget') < 0 || randomExamSource.indexOf('fillTarget') < 0) throw new Error('59-exam.js 缺少标准题库客观题/填空题配额');
const coverageErrors = []; const seenBankQuestions = Object.create(null);
const CALC_BANK_TOTAL = 8940;
const bankTotal = Object.keys(banks).reduce(function (n, k) { return n + (banks[k].items || []).length; }, 0);
const QUESTION_CATEGORIES = ['计算题', '应用题', '综合题', '概念辨析题', '证明题', '公式填空题', '反例与存在性题', '分类讨论题', '误差分析题', '多解比较题'];
const CATEGORY_TARGETS = { '计算题':1075, '应用题':675, '综合题':825, '概念辨析题':875, '证明题':825, '公式填空题':850, '反例与存在性题':750, '分类讨论题':825, '误差分析题':725, '多解比较题':825 };
const categoryCounts = {};
QUESTION_CATEGORIES.forEach(function (c) { categoryCounts[c] = 0; });
Object.keys(banks).forEach(function (k) { (banks[k].items || []).forEach(function (it) { if (it.examOrigin === '教材课后习题') return; if (categoryCounts[it.category] != null) categoryCounts[it.category]++; }); });
QUESTION_CATEGORIES.forEach(function (c) {
  const want = CATEGORY_TARGETS[c];
  if (categoryCounts[c] < want) coverageErrors.push('题型分类 ' + c + ' 数量 ' + categoryCounts[c] + ' < ' + want);
});
if (bankTotal < CALC_BANK_TOTAL) coverageErrors.push('题库总数 ' + bankTotal + ' < ' + CALC_BANK_TOTAL);
seed.subjects.forEach(function (subj) {
  const bank = banks[subj.id] || { items: [] };
  const chapters = [];
  (subj.templates || []).forEach(function (t) { if (chapters.indexOf(t.chapter) < 0) chapters.push(t.chapter); });
  chapters.forEach(function (chapter) {
    for (let diff = 1; diff <= 5; diff++) {
      ['choice', 'fill', 'subjective'].forEach(function (type) {
        const count = bank.items.filter(function (it) { return it.chapter === chapter && Number(it.difficulty) === diff && (it.type || 'subjective') === type; }).length;
        if (count < 10) coverageErrors.push(subj.id + ' · ' + chapter + ' · ' + diff + '★ · ' + type + ' 只有 ' + count + ' 题');
      });
    }
  });
  bank.items.forEach(function (it) {
    var normalizedQuestion = String(it.question || '').replace(/\s+/g, '');
    if (seenBankQuestions[normalizedQuestion]) coverageErrors.push(it.id + ' 题干与 ' + seenBankQuestions[normalizedQuestion] + ' 重复');
    else seenBankQuestions[normalizedQuestion] = it.id;
    if (it.examOrigin !== '教材课后习题' && /模板编号|所属的章节名称|题型名称|题型的依据|标准步骤的第|核心公式或结论|题型特征|适用条件|常见易错点|典型变式|完整步骤|识别特征/.test(String(it.question || ''))) coverageErrors.push(it.id + ' 题目仍在问元信息或方法步骤');
    // 题型由 category/title 记录；题干不强制嵌入题型文字。
    if (it.examOrigin !== '教材课后习题' && /下列数学命题|补全下列|证明或说明|题型名称|模板编号/.test(String(it.question || ''))) coverageErrors.push(it.id + ' 题库仍有元信息或占位旧题');
    if (it.type === 'choice' && (!Array.isArray(it.options) || it.options.length !== 4)) coverageErrors.push(it.id + ' 客观题选项不是四个');
if (/(?:\\cdot|·)\s*2\s*(?=\$|$)/.test([it.question, it.answer, it.standardSolution, it.detailedAnalysis].join('\n'))) coverageErrors.push(it.id + ' 题干/解答末尾多乘了 2');
if (it.type === 'choice' && Array.isArray(it.options)) {
      var optionKey = function (v) { return String(v || '').replace(/\s+/g, '').replace(/\$/g, '').replace(/\\cdot\s*2/g, '').replace(/·\s*2/g, '').replace(/=-\s*\\exists/g, '=\\exists').replace(/x_2,x_2/g, 'x_1,x_2'); };
      var optionKeys = it.options.map(function (o) { return optionKey(o && o.text); });
      if (new Set(optionKeys).size !== optionKeys.length) coverageErrors.push(it.id + ' 客观题存在重复选项');
      var genericTexts = ['上述等式在给定条件下不成立','条件不足，无法判断','该等式只在特殊情形下成立','上述结论均不正确','该写法不能由定义直接推出'];
      if (it.options.some(function (o) { return genericTexts.indexOf(String(o && o.text || '')) >= 0; })) coverageErrors.push(it.id + ' 客观题使用了一眼可辨的通用干扰项');
      var metaOption = /无法确定|无法判断|条件不足|以上(?:答案|说法|判断)?(?:均|都)?不(?:正确|对|成立)|上述等式在给定条件下不成立|该等式只在特殊情形下成立/;
      if (it.options.filter(function (o) { return metaOption.test(String(o && o.text || '')); }).length >= 2) coverageErrors.push(it.id + ' 客观题含两个以上通用元选项');
      var answerKey = String(it.answer || '').match(/^\s*([A-D])[．.、]/);
      if (answerKey && answerKey[1] !== it.correct) coverageErrors.push(it.id + ' 答案字母与 correct 不一致');
    }
    if (it.category === '应用题' && /^应用情境：结合实际问题中的数据/.test(String(it.question || ''))) coverageErrors.push(it.id + ' 应用题只有伪情境前缀，没有真实应用信息');
    if (it.subject === 'gaodai' && it.category === '误差分析题' && !/误差|近似|某同学|错误|错解|指出|纠错|诊断|验算|检验/.test(String(it.question || ''))) coverageErrors.push(it.id + ' 高代误差分析题题干没有误差/诊断信号');
    var mathHygieneFields = [it.question, it.answer, it.standardSolution, it.detailedAnalysis].concat((it.options || []).map(function (o) { return o && o.text || ''; }), it.solution || []);
    mathHygieneFields.forEach(function (field) {
      var fieldText = String(field || '');
      if (!fieldText) return;
      if (/(^|[^\\])\\[0-9]/.test(fieldText)) coverageErrors.push(it.id + ' 数学文本含单反斜杠数字');
      if (/\\\\\\[A-Za-z](?![A-Za-z])/.test(fieldText)) coverageErrors.push(it.id + ' 数学文本含三反斜杠非法命令');
      if (/(.{8,80})\s+\1$/.test(fieldText)) coverageErrors.push(it.id + ' 解答末尾整句重复');
      if (/\\nee/.test(fieldText)) coverageErrors.push(it.id + ' 数学文本含损坏的 \\nee');
      if (/(?:[A-Za-z](?:subset|subseteq)|=(?:mathbb|mathcal|mathrm|frac|sqrt|infty|cdot|times|partial|nabla)|\bvin\s+[A-Z])/.test(fieldText)) coverageErrors.push(it.id + ' 数学命令缺反斜杠');
      if (/=\\exists|=\\forall|\\Rightarrow-(?:\\exists|\\forall)|\\iff-(?:\\exists|\\forall)/.test(fieldText)) coverageErrors.push(it.id + ' 逻辑运算符损坏');
      if (/\\sqrt\{-[0-9]+\^2/.test(fieldText)) coverageErrors.push(it.id + ' 平方展开写成负数开方');
      if (/设\$\s*\\begin\{(?:pmatrix|bmatrix|vmatrix)\}/.test(fieldText)) coverageErrors.push(it.id + ' 矩阵题干缺少矩阵名（应写成 设$A=…）');
      if (/其中\$\s*\\begin\{(?:pmatrix|bmatrix|vmatrix)\}/.test(fieldText)) coverageErrors.push(it.id + ' 矩阵题干缺少矩阵名（应写成 其中系数矩阵$A=…）');
      if (/\$。\s*\$[^$]+\$的结果是/.test(fieldText)) coverageErrors.push(it.id + ' 公式后句号再问“结果是”，数学语言不连贯');
      var segments = fieldText.split('$');
      for (var si = 1; si < segments.length; si += 2) if (segments[si].indexOf(String.fromCharCode(10)) >= 0) coverageErrors.push(it.id + ' $...$ 内含换行');
    });
    var delimiterFields = mathHygieneFields.concat(it.points || [], it.pitfalls || []);
    delimiterFields.forEach(function (field) {
      var fieldText = String(field || '').replace(/\\\$/g, '');
      if (!fieldText) return;
      if ((fieldText.match(/\$\$/g) || []).length % 2) { coverageErrors.push(it.id + ' 数学显示定界符 $$ 不成对'); return; }
      var inlineText = fieldText.replace(/\$\$[\s\S]*?\$\$/g, '');
      inlineText.split(String.fromCharCode(10)).forEach(function (line) {
        if ((line.match(/\$/g) || []).length % 2) coverageErrors.push(it.id + ' 数学定界符 $ 不成对或公式被截断');
      });
    });
    if (it.type === 'fill' && String(it.question || '').indexOf('____') < 0) coverageErrors.push(it.id + ' 填空题缺少答题空位');
    if (it.type === 'fill' && /两法|两种方法.*(?:一致|相同)|三种方法.*(?:一致|相同)|结论一致|结果一致/.test(String(it.answer || ''))) coverageErrors.push(it.id + ' 填空题答案仍是多方法比较结论');
    if (/【[^】]+】/.test(String(it.question || ''))) coverageErrors.push(it.id + ' 题干仍含【】题型标记');
    if (it.category === '证明题' && (it.type || 'subjective') !== 'subjective') coverageErrors.push(it.id + ' 证明题不是主观题');
if (it.type === 'subjective' && !/^(解|证明|答)[：:]/.test(String(it.standardSolution || '').trim())) coverageErrors.push(it.id + ' 标准解答没有以解/证明/答开头');
    if (it.type === 'subjective' && /^(证毕|命题得证|命题正确|命题成立|略)([：:。]|$)/.test(String(it.answer || '').trim())) coverageErrors.push(it.id + ' 主观题答案仍是占位结论');
    if (it.category === '公式填空题' && it.type !== 'fill') coverageErrors.push(it.id + ' 公式填空题不是填空题');
    if (it.category === '概念辨析题' && it.type !== 'choice' && it.type !== 'subjective') coverageErrors.push(it.id + ' 概念辨析题不是客观题或判断题');
    ['question', 'answer', 'standardSolution', 'detailedAnalysis'].forEach(function (field) {
      var text = String(it[field] || '');
      if (/[\uE000\uE001]/.test(text)) coverageErrors.push(it.id + ' ' + field + ' 含未还原公式占位符');
      if ((text.match(/\$/g) || []).length % 2) coverageErrors.push(it.id + ' ' + field + ' 的 $ 定界符不成对');
    });
    (it.options || []).forEach(function (opt) {
      var text = String(opt && opt.text || '');
      if (/[\uE000\uE001]/.test(text)) coverageErrors.push(it.id + ' 选项含未还原公式占位符');
      if ((text.match(/\$/g) || []).length % 2) coverageErrors.push(it.id + ' 选项的 $ 定界符不成对');
    });

    ['title', 'question', 'answer', 'standardSolution', 'detailedAnalysis'].forEach(function (field) {
      if (!it[field] || !String(it[field]).trim()) coverageErrors.push(it.id + ' 缺少 ' + field);
    });
    if (it.examOrigin === '教材课后习题') {
      if (!/教材课后/.test(String(it.source || ''))) coverageErrors.push(it.id + ' 教材课后题缺少教材来源标记');
    } else {
      if (!/考研|真题|同型/.test(String(it.source || ''))) coverageErrors.push(it.id + ' 未标注考研真题或原创同型题');
      if (it.examOrigin !== '考研原创同型题' && !/真题/.test(String(it.source || ''))) coverageErrors.push(it.id + ' 缺少考研来源标记');
    }
    if (!Array.isArray(it.points) || !it.points.length) coverageErrors.push(it.id + ' 缺少解题要点');
    if (it.type === 'choice' && (!Array.isArray(it.options) || it.options.length < 2 || !it.correct)) coverageErrors.push(it.id + ' 客观题缺少选项或答案');
    if (it.type === 'choice' && /模板|按标准方法|按标准步骤/.test(String(it.question || '') + JSON.stringify(it.options || []))) coverageErrors.push(it.id + ' 客观题仍是元信息或占位表述');
    if (it.type === 'fill' && !String(it.answer || '').trim()) coverageErrors.push(it.id + ' 填空题缺少唯一答案');
    if (it.type === 'fill' && /模板编号|所属的章节名称|题型名称|模板/.test(String(it.question || ''))) coverageErrors.push(it.id + ' 填空题仍在问模板编号/章节/题型');
    if (it.type === 'fill' && String(it.question || '').indexOf('____') < 0) coverageErrors.push(it.id + ' 填空题没有答题空位');
    if (!Array.isArray(it.pitfalls) || !it.pitfalls.length) coverageErrors.push(it.id + ' 缺少易错点');
  });
});
if (coverageErrors.length) throw new Error('题库覆盖不完整: ' + coverageErrors.slice(0, 8).join(' | '));
// 页面一致性门槛：计数、日期、旧编号、旧计数、页脚矛盾与 skill 目录。
const siteQA = require('child_process').spawnSync(process.execPath, [path.join(ROOT, 'tools', 'qa-site-consistency.js')], { cwd: ROOT, encoding: 'utf8' });
if (siteQA.status !== 0) throw new Error('页面一致性校验失败，禁止构建：\n' + (siteQA.stdout || '') + (siteQA.stderr || ''));
// 严格题库门槛：任何结构问题或难度 warning 都禁止构建。
const strictQA = require('child_process').spawnSync(process.execPath, [path.join(ROOT, 'tools', 'qa-bank-strict.js'), '--strict-difficulty'], { cwd: ROOT, encoding: 'utf8' });
if (strictQA.status !== 0) throw new Error('严格题库校验失败，禁止构建：\n' + (strictQA.stdout || '') + (strictQA.stderr || ''));
const skillPacks = buildSkillPacks();
const skillPacksRaw = JSON.stringify(skillPacks);
const skillPackGzFile = path.join(SRC, 'data', 'skills-pack.json.gz');
let skillPacksGz;
if (fs.existsSync(skillPackGzFile)) {
  const packed = fs.readFileSync(skillPackGzFile);
  if (zlib.gunzipSync(packed).toString('utf8') !== skillPacksRaw) {
    throw new Error('skills-pack.json.gz 与当前技能包不一致，先运行 npm run build:skills');
  }
  skillPacksGz = packed.toString('base64');
} else {
  skillPacksGz = zlib.gzipSync(Buffer.from(skillPacksRaw, 'utf8'), { level: 9 }).toString('base64');
}
const seedJson = escScript(JSON.stringify(seed));
const banksJson = escScript(JSON.stringify(banks));

const packSignature = JSON.stringify(skillPacks.subjects);
const buildDay = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Shanghai' }).format(new Date()).replace(/-/g, '.');
const buildId = buildDay + '-' + crypto.createHash('sha1').update(template + app + styles + seedJson + banksJson + packSignature).digest('hex').slice(0, 8);

let html = template
  .replace('__STYLES__', function () { return styles; })
  .replace('__PAGES_FLAG__', function () { return PAGES ? 'true' : 'false'; })
  .replace('__SKILLS_PACK_B64__', function () { return skillPacksGz; })
  .replace('__SEED_JSON__', function () { return seedJson; })
  .replace('__BANKS_JSON__', function () { return banksJson; })
  .replace('__MARKED__', function () { return escScript(marked); })
  .replace('__TEMML__', function () { return escScript(temml); })
  .replace('__APP__', function () { return escScript(app); })
  .replace('__BUILD_HASH__', buildId);

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, html, 'utf8');

// 静态附属文件：robots / sitemap / manifest / 404 / favicon / service worker
const staticDir = path.join(SRC, 'static');
if (fs.existsSync(staticDir)) {
  fs.readdirSync(staticDir).forEach(function (f) {
    fs.copyFileSync(path.join(staticDir, f), path.join(path.dirname(OUT), f));
  });
}

const bytes = Buffer.byteLength(html, 'utf8');
console.log('built ' + OUT);
console.log('js files: ' + jsFiles.join(', '));
console.log('size: ' + (bytes / 1024).toFixed(1) + ' KB');
