'use strict';
const { launchChromium } = require('./browser');
const { startServer } = require('./qa-server');

const seed = {
  version: 1, rev: 0, updatedAt: '2026-11-08T01:00:00.000Z',
  activeSubject: 'gaodai', activeView: 'overview',
  entries: {
    gaodai: [{
      id: 'qa-formula', code: 'A-999', date: '2026-10-30T11:28:00.000Z',
      summary: 'Matrix $\\begin{pmatrix}0&1\\\\0&0\\end{pmatrix}$ and rank $r(A)$',
      points: ['Rank $r(A)$', 'Eigenvalue $\\lambda$'],
      chapter: '第三章 线性方程组', templateId: '', stars: 2, status: 'unmastered',
      blocks: [{ title: '题目', md: 'Find $n$-th power of $2\\times 2$ matrix' }],
      variants: [], review: { d1: false, d3: false, d7: false, d15: false, d30: false },
      source: '智能录入 · /advanced-algebra'
    }],
    shufen: [], jieji: [], xijing: []
  },
  notes: { gaodai: [], shufen: [], jieji: [], xijing: [] },
  prefs: { theme: 'auto', autoAi: true, userName: '', lang: 'zh-CN', apiNoticeDismissed: true }
};

function collect(page, scope) {
  return page.evaluate((selector) => {
    const root = selector ? document.querySelector(selector) : document.body;
    const bad = [];
    const broken = document.querySelectorAll('.math-raw,.temml-error,merror').length;
    if (!root) return { bad: ['missing ' + selector], broken, width: document.documentElement.scrollWidth - document.documentElement.clientWidth };
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const n = walker.currentNode;
      const t = n.nodeValue || '';
      if (!t.trim()) continue;
      const par = n.parentElement;
      if (!par || par.closest('code,pre,textarea,script,style,.math-raw,.source-code,.md-copy')) continue;
      if (t.indexOf('$') >= 0) bad.push('dollar: ' + t.trim().slice(0, 90));
      else if (/\\[A-Za-z]{2,}/.test(t)) bad.push('latex: ' + t.trim().slice(0, 90));
      else if (/[A-Za-z0-9][_^](?:\{?[A-Za-z0-9])/.test(t)) bad.push('bare: ' + t.trim().slice(0, 90));
      else if (t.indexOf('\uFFFD') >= 0) bad.push('fffd: ' + t.trim().slice(0, 90));
    }
    return { bad: Array.from(new Set(bad)).slice(0, 8), broken, width: document.documentElement.scrollWidth - document.documentElement.clientWidth };
  }, scope || '');
}

(async () => {
  const server = await startServer();
  const base = server.base;
  const browser = await launchChromium();
  const page = await (await browser.newContext({ viewport: { width: 1200, height: 1000 } })).newPage();
  const failures = [];
  try {
    await page.addInitScript(function (payload) {
      try {
        if (!localStorage.getItem('qa-seeded')) {
          localStorage.setItem('sanke-cuotiben-v1', JSON.stringify(payload));
          localStorage.setItem('qa-seeded', '1');
        }
      } catch (e) { /* ignore */ }
    }, seed);
    await page.goto(base + '/?v=' + Date.now() + '#/home', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(500);
    const routes = ['overview', 'entries', 'templates', 'bank', 'guide', 'final'];
    for (const r of routes) {
      await page.goto(base + '/?v=' + Date.now() + '#/gaodai/' + r, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(r === 'bank' ? 1200 : 700);
      const out = await collect(page);
      if (out.bad.length) failures.push(r + ' ' + out.bad[0]);
      if (out.broken) failures.push(r + ' broken formula: ' + out.broken);
      if (out.width > 1) failures.push(r + ' horizontal overflow: ' + out.width);
      console.log(r, JSON.stringify(out));
    }

    // 知识点搜索面板：摘录不能把 $...$ 截成半截。
    await page.goto(base + '/?v=' + Date.now() + '#/gaodai/bank', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(900);
    await page.fill('#searchInput', '矩阵');
    await page.waitForTimeout(1400);
    const kb = await collect(page, '.kb-answer');
    if (kb.bad.length) failures.push('knowledge ' + kb.bad[0]);
    if (kb.broken) failures.push('knowledge broken formula: ' + kb.broken);
    if (kb.width > 1) failures.push('knowledge horizontal overflow: ' + kb.width);
    console.log('knowledge', JSON.stringify(kb));

    // 标准题库模拟考：题干、选项、评分标准都要走同一套公式管线。
    await page.goto(base + '/?v=' + Date.now() + '#/final', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(700);
    await page.click('button.final-section-tab[data-section="exam"]');
    await page.waitForTimeout(300);
    await page.getByRole('button', { name: /从标准题库开考/ }).first().click();
    await page.waitForTimeout(700);
    await page.getByRole('button', { name: '从标准题库开考' }).last().click();
    await page.waitForTimeout(1200);
    await page.getByRole('button', { name: '开始模拟考' }).click();
    await page.waitForTimeout(500);
    await page.check('#examRulesAgree', { force: true });
    await page.getByRole('button', { name: '开始作答' }).click();
    await page.waitForTimeout(1600);
    const exam = await collect(page, '.exam-shell');
    if (exam.bad.length) failures.push('exam ' + exam.bad[0]);
    if (exam.broken) failures.push('exam broken formula: ' + exam.broken);
    if (exam.width > 1) failures.push('exam horizontal overflow: ' + exam.width);
    console.log('exam', JSON.stringify(exam));
  } finally {
    await browser.close();
    await server.stop();
  }
  if (failures.length) {
    console.error('FAIL\n' + failures.join('\n'));
    process.exit(1);
  }
  console.log('formula QA passed');
})();
