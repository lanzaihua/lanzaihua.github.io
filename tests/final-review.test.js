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
    toast() {}, qs() { return null; }, esc(s) { return String(s); }, attr(s) { return String(s); },
    pad(n, w) { return String(n).padStart(w || 2, '0'); },
    renderMarkdown(s) { return '<div class="md">' + s + '</div>'; },
    renderInline(s) { return String(s); },
    markDirty() {}, nowIso() { return '2026-11-16T00:00:00+08:00'; }, normalizeStars(x) { return x || 3; },
    entryTitle() { return ''; }, findEntry() { return null; }, bankOf() { return []; }, templatesOf() { return []; },
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
  assert.match(gate, /章节筛选/);
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
  const plan = ctx.finalAiNormalizePlan('gaodai', ['第一章 多项式'], {
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
