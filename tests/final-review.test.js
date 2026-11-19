'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.join(__dirname, '..');
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');

function finalContext() {
  const ctx = {
    console, Date, Math, JSON, Blob, TextEncoder, Uint8Array, DataView, Array, Object, String, Number, RegExp, Set, Map,
    window: { innerWidth: 1200, print() {}, addEventListener() {} },
    document: { addEventListener() {}, querySelector() { return null; }, createElement() { return { style: {}, setAttribute() {}, remove() {}, click() {} }; }, body: { appendChild() {} } },
    localStorage: { getItem() { return null; }, setItem() {}, removeItem() {} },
    state: { activeSubject: 'gaodai' },
    SUBJECTS: [{ id: 'gaodai', name: '高等代数' }],
    SUBJ_BY_ID: { gaodai: { id: 'gaodai', name: '高等代数' } },
    subjectOf(id) { return ({ gaodai: { id: 'gaodai', name: '高等代数' } })[id] || { id: id, name: id }; },
    toast() {}, qs() { return null; }, esc(s) { return String(s); }, attr(s) { return String(s); },
    pad(n, w) { return String(n).padStart(w || 2, '0'); },
    renderMarkdown(s) { return '<div class="md">' + s + '</div>'; },
    renderInline(s) { return String(s); },
    stripTypePrefix(s) { return String(s); },
    markDirty() {}, nowIso() { return '2026-11-16T00:00:00+08:00'; }, normalizeStars(x) { return x || 3; },
    entryTitle() { return ''; }, findEntry() { return null; }, bankOf() { return []; }, templatesOf() { return []; }, chapterSectionsFor() { return []; },
    aiConfigReady() { return false; }, setTimeout() {}, clearTimeout() {},
    location: { hash: '' }, URL: { createObjectURL() { return ''; }, revokeObjectURL() {} }
  };
  vm.createContext(ctx);
  vm.runInContext(read('src/js/58-final.js'), ctx);
  return ctx;
}

test('期末计划显示本章全部答题模板，而不是只显示一个代表模板', () => {
  const ctx = finalContext();
  const html = ctx.finalPlanTemplateListHtml({
    templates: [
      { id: 'T-01-01', title: '带余除法', sections: [{ label: '步骤骨架', md: '第一步 做带余除法' }] },
      { id: 'T-01-02', title: '最大公因式', sections: [{ label: '标准步骤', md: '第二步 辗转相除' }, { label: '易错点', md: '不要漏掉余式为零' }] }
    ]
  });
  assert.match(html, /T-01-01/);
  assert.match(html, /T-01-02/);
  assert.match(html, /带余除法/);
  assert.match(html, /最大公因式/);
  assert.match(html, /第一步 做带余除法/);
  assert.match(html, /第二步 辗转相除/);
  assert.match(html, /不要漏掉余式为零/);
  assert.equal((html.match(/class="fpm-tpl"/g) || []).length, 2, '应渲染两个模板');
});

test('章节筛选不依赖已加入材料，计划模块接入模板清单并按日轮换', () => {
  const js = read('src/js/58-final.js');
  assert.match(js, /function finalAllChapters\(subject\)/);
  assert.match(js, /chapters = finalAllChapters\(subject\)/);
  assert.equal(/if \(!finalMaterialsForSubject\(subject\)\.length\) return ''/.test(js), false, '没有材料时不应隐藏章节筛选');
  assert.match(js, /finalPlanTemplateListHtml\(m\)/);
  assert.match(js, /% module\.templates\.length/);
  assert.match(js, /m\.templates\.length \+ ' 个模板/);

  const css = read('src/styles.css');
  assert.match(css, /\.fpm-templates \{ display: grid/);
  assert.match(css, /\.fpm-tpl > summary \{/);
  assert.match(css, /\.fpm-tpl-body \{/);
  assert.match(css, /\.fpm-tpl-pitfall \{/);
});

test('多章可分别选小节，计划与 AI 签名都锁定到小节', () => {
  const ctx = finalContext();
  ctx.chapterSectionsFor = function (subject, chapter) {
    if (chapter === '第一章 多项式') return ['数域', '一元多项式'];
    if (chapter === '第二章 行列式') return ['排列', 'n 级行列式'];
    return [];
  };
  ctx.finalAllChapters = function () { return ['第一章 多项式', '第二章 行列式']; };
  ctx.state.finalExam = {
    date: '2026-12-20', duration: 120, subject: 'gaodai',
    chapterSel: { gaodai: ['第二章 行列式', '第一章 多项式'] },
    sectionSel: { gaodai: ['数域', '排列'] },
    items: [], papers: [], done: {}
  };
  const html = ctx.finalChapterFilterHtml('gaodai');
  assert.match(html, /已选 2 章 · 2 节/);
  assert.equal((html.match(/data-section-chapter=/g) || []).length, 2, '每个已选大章都要有小节分组');
  const js = read('src/js/58-final.js');
  assert.match(html, /小节 · 第一章 多项式/);
  assert.match(html, /小节 · 第二章 行列式/);
  assert.ok(html.indexOf('小节 · 第一章 多项式') < html.indexOf('小节 · 第二章 行列式'), '小节分组应按教材章节顺序，而不是点击顺序');
  assert.match(html, /class="fcf-break"/);
  assert.match(read('src/styles.css'), /\.final-chapter-filter:not\(\.final-section-filter\) \.fcf-break/);
  assert.match(js, /finalOrderedSelectedChapters\(subject\)\.map\(function \(chapter\)/);
  assert.match(js, /finalOrderedSelectedChapters\(subject\)\.join\(' \/ '\)/);
  assert.match(html, /data-chapter="第一章 多项式"[^>]*data-section="数域"/);
  assert.match(html, /data-chapter="第二章 行列式"[^>]*data-section="排列"/);
  assert.deepEqual(ctx.finalSelectedSections('gaodai'), ['数域', '排列']);
  assert.deepEqual(ctx.finalSectionsForChapter('gaodai', '第一章 多项式'), ['数域']);
  assert.match(js, /function finalSectionsForChapter/);
  assert.match(js, /var sections = finalSectionsForChapter\(subject, chapter\)/);
  assert.match(js, /finalAiPlanSignature\(subject, chapters, sections\)/);
  assert.match(js, /finalAiPlanFor\(subject, chapters, sections\)/);
  assert.match(js, /sectionsByChapter: data\.sectionMap/);
});

test('计划知识点来自学科 skill，带教材章节小节出处和记忆用法', () => {
  const data = JSON.parse(read('src/data/final-plan-knowledge.json'));
  const expected = { gaodai: 10, shufen: 23, jieji: 6, xijing: 16 };
  assert.equal(Object.keys(data.subjects).length, 4);
  let chapters = 0, points = 0;
  for (const [subject, count] of Object.entries(expected)) {
    const pack = data.subjects[subject];
    assert.ok(pack, subject + ' knowledge pack missing');
    assert.equal(pack.chapters.length, count, subject + ' chapter count');
    assert.ok(pack.skill && pack.book, subject + ' skill/book missing');
    for (const chapter of pack.chapters) {
      chapters += 1;
      assert.ok(chapter.points.length >= 2, subject + ' ' + chapter.chapter + ' too few points');
      for (const point of chapter.points) {
        points += 1;
        assert.ok(point.name && point.detail, subject + ' point name/detail missing');
        assert.match(point.section || '', /^§\d+\.\d+ /, subject + ' point section format');
        assert.match(point.source || '', /§\d+\.\d+ /, subject + ' point source missing section');
        assert.ok((point.source || '').includes('· ' + chapter.chapter + ' ·'), subject + ' point source chapter');
        assert.ok(point.memory && point.memory.length > 8, subject + ' point memory missing');
      }
    }
  }
  assert.equal(chapters, 55);
  assert.ok(points >= 500, 'knowledge points should be detailed, got ' + points);
});

test('计划与出卷、模拟考分开，逐日显示知识点与完整例题', () => {
  const ctx = finalContext();
  const point = ctx.finalPlanPointHtml({
    name: '数域 P',
    section: '§1.1 数域',
    detail: '含 0、1，对四则运算封闭的复数子集。',
    source: '《高等代数》第六版（北大） · 第一章 多项式 · §1.1 数域',
    memory: '先问在哪个域上。'
  });
  assert.match(point, /class="fpm-point"/);
  assert.match(point, /§1\.1 数域/);
  assert.match(point, /出处：《高等代数》/);

  const js = read('src/js/58-final.js');
  assert.match(js, /function finalSectionValue\(\)/);
  assert.match(js, /data-section="plan"/);
  assert.match(js, /data-section="paper"/);
  assert.match(js, /data-section="exam"/);
  assert.match(js, /fd-more/);
  assert.match(js, /fd-point-card/);
  assert.match(js, /finalPlanPointHtml/);
  assert.match(js, /function finalPlanModuleBodyHtml/);
  assert.match(js, /FINAL_PLAN_LAZY/);
  assert.match(js, /data-final-lazy/);
  assert.match(js, /finalPlanFillLazy/);
  assert.match(js, /__FINAL_PLAN_KNOWLEDGE__/);
  const build = read('build.js');
  assert.match(build, /final-plan-knowledge\.json/);
  assert.match(build, /期末复习计划数据不完整/);
  const css = read('src/styles.css');
  assert.match(css, /\.fpm-point \{/);
  assert.match(css, /\.fd-point-card \{/);
  assert.match(css, /\.fd-more-body \{/);
  assert.ok(css.includes('grid-template-columns: minmax(0, 1fr)'), 'daily detail grid must use minmax(0,1fr)');
});

test('期末复习跨端门禁被 package 与 CI 同时引用', () => {
  const pkg = JSON.parse(read('package.json'));
  assert.equal(pkg.scripts['qa:final'], 'node tools/qa-final-review.js');
  const gatePath = path.join(root, 'tools/qa-final-review.js');
  assert.ok(fs.existsSync(gatePath), '缺少 tools/qa-final-review.js');
  const ci = read('.github/workflows/quality.yml');
  assert.match(ci, /npm run qa:final/);
  const gate = fs.readFileSync(gatePath, 'utf8');
  assert.match(gate, /390, 768, 1440/);
  assert.match(gate, /\.fpm-point/);
  assert.match(gate, /fd-more/);
  assert.match(gate, /多章 \+ 多小节/);
  assert.match(gate, /final-section-filter/);
});

test('AI 个性化计划只接受本地章节、模板与题号，非法条目会丢弃并回退', () => {
  const ctx = finalContext();
  ctx.bankOf = () => [{
    id: 'GA-B0001', chapter: '第一章 多项式', title: '证明题', type: 'subjective', difficulty: 3,
    question: '证明整除性质', answer: '结论成立', standardSolution: '证明：由定义直接得到。',
    detailedAnalysis: '按定义展开。', points: ['整除定义'], pitfalls: ['不要漏掉零多项式'],
    templateId: 'T-01-02', pointKeys: ['整除定义']
  }];
  ctx.templatesOf = () => [
    { id: 'T-01-01', chapter: '第一章 多项式', title: '带余除法', sections: [{ label: '步骤骨架', md: '做带余除法' }] },
    { id: 'T-01-02', chapter: '第一章 多项式', title: '整除判定', sections: [{ label: '标准步骤', md: '验证定义' }, { label: '易错点', md: '零多项式' }] }
  ];
  const future = new Date(Date.now() + 2 * 86400000);
  ctx.state.finalExam = {
    date: future.getFullYear() + '-' + String(future.getMonth() + 1).padStart(2, '0') + '-' + String(future.getDate()).padStart(2, '0'),
    duration: 120, subject: 'gaodai', chapterSel: { gaodai: [] }, sectionSel: {}, items: [], papers: [], done: {}
  };
  const plan = ctx.finalAiNormalizePlan('gaodai', ['第一章 多项式'], [], {
    units: [
      { chapter: '第一章 多项式', point: '整除判定', templateId: 'T-01-02', exampleId: 'GA-B9999', task: '先做 $x_1$ 的例题', memory: '记住 $x_1$ 回代' },
      { chapter: '不存在的章节', point: '编造知识点', exampleId: 'NOPE', task: '编造任务' },
      { chapter: '第一章 多项式', point: '带余除法', exampleId: 'GA-B0001', task: '含未闭合 $ 的任务' }
    ],
    tips: ['先做会做的题', '<script>alert(1)</script>', '交卷前查符号']
  }, 'deepseek-flash');
  assert.equal(plan.units.length, 2, '未知章节必须丢弃');
  assert.equal(plan.units[0].exampleId, 'GA-B0001', '不存在的题号必须回退到本地例题');
  assert.equal(plan.units[0].templateId, 'T-01-02');
  assert.equal(plan.units[1].task, '', '未闭合公式的任务必须清空');
  assert.deepEqual(plan.tips, ['先做会做的题', '交卷前查符号']);
  assert.equal(plan.model, 'deepseek-flash');

  ctx.state.finalExam.aiPlan = plan;
  const data = ctx.finalPlanData();
  assert.equal(data.ai, plan);
  assert.equal(data.days[0].ai, true);
  assert.match(data.days[0].focus, /先做/);
  assert.equal(data.days[0].example.id, 'GA-B0001');
});


test('AI 计划读取错题、模拟卷与模拟考，并可用个人错题当例题', () => {
  const ctx = finalContext();
  const bank = [{
    id: 'GA-B0001', chapter: '第一章 多项式', section: '数域', title: '证明题', type: 'subjective', difficulty: 3,
    question: '证明整除性质', answer: '结论成立', standardSolution: '证明：由定义直接得到。',
    detailedAnalysis: '按定义展开。', points: ['整除定义'], pitfalls: ['不要漏掉零多项式'],
    templateId: 'T-01-02', pointKeys: ['整除定义']
  }];
  const entries = [{
    id: 'M-001', code: 'G-001', subject: 'gaodai', chapter: '第一章 多项式', section: '数域',
    status: 'unmastered', summary: '数域判断', errorTypes: ['概念'], errorNote: '忘记先说明数域',
    updatedAt: '2026-11-17T10:00:00+08:00',
    blocks: [
      { key: 'original', md: '判断 $\\{0,1\\}$ 是否构成数域' },
      { key: 'standard', md: '证明：由数域定义逐条检查。' }
    ]
  }, {
    id: 'M-002', code: 'G-002', subject: 'gaodai', chapter: '第一章 多项式', section: '数域',
    status: 'mastered', summary: '整除性质', errorTypes: ['计算'], errorNote: '漏掉零多项式',
    updatedAt: '2026-11-16T10:00:00+08:00',
    blocks: [{ key: 'original', md: '证明整除性质' }, { key: 'standard', md: '证明：略。' }]
  }];
  ctx.bankOf = () => bank;
  ctx.templatesOf = () => [
    { id: 'T-01-01', chapter: '第一章 多项式', title: '带余除法', sections: [{ label: '步骤骨架', md: '做带余除法' }] },
    { id: 'T-01-02', chapter: '第一章 多项式', title: '整除判定', sections: [{ label: '标准步骤', md: '验证定义' }, { label: '易错点', md: '零多项式' }] }
  ];
  ctx.entriesOf = () => entries;
  ctx.findEntry = (subject, id) => entries.filter((e) => e.id === id)[0] || null;
  ctx.entryTitle = (e) => e.summary;
  ctx.chapterSectionsFor = () => ['数域', '一元多项式'];
  const future = new Date(Date.now() + 2 * 86400000);
  ctx.state.finalExam = {
    date: future.getFullYear() + '-' + String(future.getMonth() + 1).padStart(2, '0') + '-' + String(future.getDate()).padStart(2, '0'),
    duration: 120, subject: 'gaodai',
    chapterSel: { gaodai: ['第一章 多项式'] }, sectionSel: { gaodai: ['数域'] },
    items: [], done: {},
    papers: [{
      id: 'P1', subject: 'gaodai', title: '第一章自测卷', duration: 120, createdAt: '2026-11-17T09:00:00+08:00',
      items: [{ code: 'GA-B0001', chapter: '第一章 多项式', section: '数域', score: 10 }]
    }],
    examHistory: [{
      historyId: 'E1', subject: 'gaodai', title: '标准题库模拟考', status: 'submitted', createdAt: '2026-11-16T09:00:00+08:00',
      result: { total: 78, questions: [{
        id: 'GA-B0001', chapter: '第一章 多项式', section: '数域', title: '整除判定', question: '证明整除性质',
        max: 10, score: 0, correct: false, userText: '只写了结论，漏掉数域前提', errorPoints: ['缺少数域前提']
      }] }
    }]
  };
  const personal = ctx.finalAiPersonalContext('gaodai', ['第一章 多项式'], ['数域']);
  assert.equal(personal.stats.entries, 2);
  assert.equal(personal.stats.unmastered, 1);
  assert.equal(personal.stats.papers, 1);
  assert.equal(personal.stats.exams, 1);
  assert.equal(personal.stats.wrongQuestions, 1);
  assert.match(personal.entries[0].errorNote, /数域/);
  assert.match(personal.exams[0].wrong[0].userAnswer, /漏掉数域/);

  const plan = ctx.finalAiNormalizePlan('gaodai', ['第一章 多项式'], ['数域'], {
    units: [{
      chapter: '第一章 多项式', point: '整除定义', templateId: 'T-01-02',
      exampleKind: 'entry', exampleId: 'M-001', task: '先重做你的错题 $x_1$',
      reason: '你在数域判断上漏过前提', memory: '先问在哪个域上'
    }],
    tips: ['先处理未掌握错题']
  }, 'deepseek-flash', personal);
  assert.equal(plan.units[0].exampleKind, 'entry');
  assert.equal(plan.units[0].exampleId, 'M-001');
  assert.match(plan.units[0].reason, /数域判断/);
  assert.equal(plan.personal.entries, 2);
  assert.match(ctx.finalAiPersonalSummary(plan), /2 道错题/);
  assert.match(ctx.finalAiPersonalSummary(plan), /1 张模拟卷/);
  assert.match(ctx.finalAiPersonalSummary(plan), /1 次模拟考/);

  ctx.state.finalExam.aiPlan = plan;
  const data = ctx.finalPlanData();
  assert.equal(data.ai, plan);
  assert.equal(data.days[0].exampleKind, 'entry');
  assert.equal(data.days[0].example.type, 'entry');
  assert.match(data.days[0].reason, /数域判断/);
  assert.match(ctx.finalPlanExampleHtml(data.days[0].example, data.days[0].template), /来自你的错题库/);

  const prompt = ctx.finalAiPlanPrompt(data);
  assert.equal(prompt.personal.stats.entries, 2);
  assert.equal(prompt.personal.stats.exams, 1);
  assert.equal(prompt.bankIndex['第一章 多项式'].length, 1);
  assert.equal(prompt.bankIndex['第一章 多项式'][0].id, 'GA-B0001');

  const fallback = ctx.finalAiNormalizePlan('gaodai', ['第一章 多项式'], ['数域'], {
    units: [{ chapter: '第一章 多项式', point: '整除定义', exampleKind: 'entry', exampleId: 'M-999' }]
  }, 'deepseek-flash', personal);
  assert.equal(fallback.units[0].exampleKind, 'bank', '不存在的个人错题必须回退到题库例题');
  assert.equal(fallback.units[0].exampleId, 'GA-B0001');
});

test('AI 排程完成后显示已排程状态，不再同时出现正在排程与恢复按钮', () => {
  const ctx = finalContext();
  ctx.ui = { finalAiPlanBusy: false, finalAiPlanError: '' };
  ctx.aiConfigReady = () => true;
  ctx.bankOf = () => [{
    id: 'GA-B0001', chapter: '第一章 多项式', title: '证明题', type: 'subjective', difficulty: 3,
    question: '证明整除性质', answer: '结论成立', standardSolution: '证明：由定义直接得到。',
    detailedAnalysis: '按定义展开。', points: ['整除定义'], pitfalls: ['不要漏掉零多项式'],
    templateId: 'T-01-01', pointKeys: ['整除定义']
  }];
  ctx.templatesOf = () => [{
    id: 'T-01-01', chapter: '第一章 多项式', title: '带余除法',
    sections: [{ label: '步骤骨架', md: '做带余除法' }, { label: '易错点', md: '余式次数' }]
  }];
  const future = new Date(Date.now() + 20 * 86400000);
  ctx.state.finalExam = {
    date: future.getFullYear() + '-' + String(future.getMonth() + 1).padStart(2, '0') + '-' + String(future.getDate()).padStart(2, '0'),
    duration: 120, subject: 'gaodai', chapterSel: { gaodai: ['第一章 多项式'] }, sectionSel: {},
    items: [], papers: [], examHistory: [], done: {}
  };
  const plan = ctx.finalAiNormalizePlan('gaodai', ['第一章 多项式'], [], {
    units: [{ chapter: '第一章 多项式', point: '带余除法', templateId: 'T-01-01', exampleId: 'GA-B0001', task: '先口述带余除法，再做例题', memory: '先看余式次数' }]
  }, 'deepseek-flash');
  ctx.state.finalExam.aiPlan = plan;

  let html = ctx.finalPlanHtml();
  assert.match(html, /AI 个性化/);
  assert.match(html, /AI 已排程/, '完成后按钮必须显示 AI 已排程');
  assert.doesNotMatch(html, /AI 正在排程/, '完成后不能残留正在排程');
  assert.match(html, /恢复本地排程/, '完成后应保留恢复本地计划');
  assert.match(html, /data-act="final-ai-plan"[^>]*disabled/, '完成后排程按钮应作为状态禁用，避免误触重排');

  ctx.ui.finalAiPlanBusy = true;
  html = ctx.finalPlanHtml();
  assert.match(html, /AI 正在排程/);
  assert.doesNotMatch(html, /AI 已排程/);
  assert.doesNotMatch(html, /恢复本地排程/, '排程进行中不能同时显示恢复按钮');

  const js = read('src/js/58-final.js');
  const gen = js.slice(js.indexOf('async function finalAiGeneratePlan'), js.indexOf('function finalAiResetPlan'));
  assert.match(gen, /finalData\(\)\.aiPlan = plan;[\s\S]*ui\.finalAiPlanBusy = false;[\s\S]*render\(\);/,
    '成功写回计划后必须先清 busy 再 render');
  assert.match(gen, /catch \(e\) \{[\s\S]*ui\.finalAiPlanBusy = false;[\s\S]*ui\.finalAiPlanError =/,
    '失败时也必须先清 busy 再显示错误');
});
