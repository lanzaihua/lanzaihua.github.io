'use strict';
const { chromium } = require('playwright-core');
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

(async () => {
  const server = await startServer();
  const base = server.base;
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
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
    const routes = ['overview', 'entries', 'templates', 'bank', 'guide'];
    for (const r of routes) {
      await page.goto(base + '/?v=' + Date.now() + '#/gaodai/' + r, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(700);
      const out = await page.evaluate(() => {
        const raw = [];
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        while (walker.nextNode()) {
          const n = walker.currentNode;
          const t = n.nodeValue || '';
          if (!/\$[^$\n]+\$/.test(t)) continue;
          const par = n.parentElement;
          if (!par || par.closest('code,pre,textarea,script,style,.math-raw,.source-code,.md-copy')) continue;
          raw.push(t.slice(0, 80));
        }
        return { raw, broken: document.querySelectorAll('.temml-error,.math-raw').length };
      });
      if (out.raw.length) failures.push(r + ' raw formula: ' + out.raw[0]);
      if (out.broken) failures.push(r + ' broken formula: ' + out.broken);
      console.log(r, JSON.stringify(out));
    }
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
