'use strict';
const { launchChromium } = require('./browser');
const BASE = process.env.PAGE_URL || 'http://127.0.0.1:4173';
const WIDTHS = [390, 768, 1440];
const ACTIVE_WIDTHS = process.env.ONLY_WIDTH ? WIDTHS.filter(w => String(w) === String(process.env.ONLY_WIDTH)) : WIDTHS;
if (!process.env.ONLY_WIDTH) {
  const { spawnSync } = require('child_process');
  const results = [];
  for (const w of WIDTHS) {
    const r = spawnSync(process.execPath, [__filename], { env: Object.assign({}, process.env, { ONLY_WIDTH: String(w), PAGE_URL: BASE }), encoding: 'utf8', timeout: 150000, maxBuffer: 1048576 });
    if (r.stdout) process.stdout.write(r.stdout);
    if (r.stderr) process.stderr.write(r.stderr);
    if (r.status !== 0) process.exit(r.status || 1);
    try { results.push(JSON.parse(String(r.stdout || '').trim())); }
    catch (e) { console.error('qa-search child output is not JSON'); process.exit(1); }
  }
  const failures = results.flatMap(r => r.failures || []);
  console.log(JSON.stringify({ ok: failures.length === 0, widths: WIDTHS, failures }, null, 2));
  process.exit(failures.length ? 1 : 0);
}
const seed = {
  version: 1, rev: 1, updatedAt: new Date().toISOString(), activeSubject: 'shufen', activeView: 'overview',
  entries: { gaodai: [], shufen: [], jieji: [], xijing: [] },
  notes: { gaodai: [], shufen: [], jieji: [], xijing: [] },
  notifications: [], userTemplates: { gaodai: [], shufen: [], jieji: [], xijing: [] }, userBank: { gaodai: [], shufen: [], jieji: [], xijing: [] },
  finalExam: { date: '2026-12-20', duration: 120, subject: 'shufen', chapterSel: { shufen: [] }, sectionSel: {}, items: [], papers: [], done: {} },
  prefs: { theme: 'auto', autoAi: false, userName: '', lang: 'zh-CN', apiNoticeDismissed: true, finalSection: 'plan', lastRoute: '' },
  clearEpoch: '2026-10-24-empty-v1'
};
const noisy = '## 高阶导数\n\n高阶导数记作 f(^{n}) 或 y(^{n})|_{x=x_{0}}。\n\n莱布尼茨公式：\n\n(uv)(^{n}) = \\sum _{k=0}^{n} C(n,k) u(^{n-k}) v^{(k)}。\n\n左乘 <span class="PA">交换 A 的第 i,j 行。\n\n常用公式：1/[x(1-x)] 的 n 阶导数为 n!/(1-x)^{n+1}；sinx 的高阶导数按 n\\pi/2 平移。';
const broken = '## 高阶导数\n\n<div class="x">这段 AI 内容带 HTML 标签，公式也未闭合 $x^2';
function aiBody(content) {
  return JSON.stringify({ choices: [{ message: { content: JSON.stringify({ title: '高阶导数', content, book: '数学分析', chapter: '第五章 导数和微分', section: '§5.4 高阶导数', page: '以纸书为准', tags: ['导数'] }) }, finish_reason: 'stop' }], usage: { prompt_tokens: 10, completion_tokens: 10 } });
}
function contextSeed(ai) {
  return async (ctx) => {
    await ctx.route('**/api/state', r => r.abort());
    await ctx.addInitScript(({ s, a }) => {
      localStorage.setItem('sanke-cuotiben-v1', JSON.stringify(s));
      if (a) localStorage.setItem('sanke-ai-config-v1', JSON.stringify(a));
    }, { s: seed, a: ai || null });
  };
}
async function settle(page) {
  await page.waitForTimeout(900);
  const dlg = page.locator('#apiWelcomeDialog [data-act="dismiss-api-welcome"]');
  if (await dlg.count()) await dlg.first().click().catch(() => {});
  await page.waitForTimeout(150);
}
async function openSearch(page, q) {
  await page.fill('#searchInput', q);
  await page.waitForSelector('#kbAnswerPanel', { timeout: 15000 });
  await page.waitForTimeout(1300);
}
async function metrics(page) {
  return page.evaluate(() => {
    const p = document.querySelector('#kbAnswerPanel');
    if (!p) return { missing: true };
    const b = p.querySelector('.kb-answer-body');
    const text = (b && b.innerText) || '';
    return {
      title: (p.querySelector('h2') || {}).textContent || '',
      meta: (p.querySelector('.kb-answer-meta') || {}).innerText || '',
      text,
      raw: p.querySelectorAll('.math-raw,.temml-error,merror').length,
      dollars: (text.match(/\$/g) || []).length,
      spanText: /<\s*span|&lt;span/.test(text),
      math: p.querySelectorAll('math').length,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      bodyOverflow: b ? b.scrollWidth - b.clientWidth : 0,
      warn: !!p.querySelector('.kb-ai-warn')
    };
  });
}
async function localSearch(browser, width) {
  const failures = [];
  const context = await browser.newContext({ viewport: { width, height: 1000 } });
  await contextSeed(null)(context);
  const page = await context.newPage();
  try {
    await page.goto(BASE + '/#/shufen/overview', { waitUntil: 'domcontentloaded' });
    await settle(page);
    for (const [q, subject, word] of [['高阶导数', '数学分析', '莱布尼茨'], ['间断点', '数学分析', '可去间断点'], ['初等矩阵的乘法效果', '高等代数', '初等矩阵']]) {
      await openSearch(page, q);
      const m = await metrics(page);
      if (!m.meta.includes(subject)) failures.push(width + ' ' + q + ' subject=' + m.meta);
      if (!m.text.includes(word)) failures.push(width + ' ' + q + ' missing ' + word);
      if (m.raw || m.dollars || m.spanText) failures.push(width + ' ' + q + ' raw=' + m.raw + ' dollar=' + m.dollars + ' span=' + m.spanText);
      if (m.overflow > 1 || m.bodyOverflow > 1) failures.push(width + ' ' + q + ' overflow=' + m.overflow + '/' + m.bodyOverflow);
      if (q === '高阶导数' && (m.text.match(/高阶导数（higher-order derivative）/g) || []).length > 1) failures.push(width + ' 高阶导数 concept duplicated');
      await page.screenshot({ path: 'debug/qa-search-' + width + '-' + (q === '高阶导数' ? 'derivative' : q === '间断点' ? 'discontinuity' : 'matrix') + '.png' });
    }
  } finally { await context.close(); }
  return failures;
}
async function aiSearch(browser, width, content, label) {
  const failures = [];
  const context = await browser.newContext({ viewport: { width, height: 1000 } });
  await contextSeed({ protocol: 'deepseek', baseUrl: BASE + '/v1', model: 'deepseek-flash', apiKey: 'test-key', savedAt: new Date().toISOString() })(context);
  await context.route('**/v1/chat/completions', r => r.fulfill({ status: 200, contentType: 'application/json', body: aiBody(content) }));
  const page = await context.newPage();
  try {
    await page.goto(BASE + '/#/shufen/overview', { waitUntil: 'domcontentloaded' });
    await settle(page);
    await openSearch(page, '高阶导数');
    await page.waitForTimeout(1800);
    const m = await metrics(page);
    if (label === 'noisy') {
      if (m.raw || m.dollars || m.spanText) failures.push(width + ' ai raw=' + m.raw + ' dollar=' + m.dollars + ' span=' + m.spanText);
      if (m.text.includes('(^') || m.text.includes('C(n,k)')) failures.push(width + ' ai pseudo notation remains');
      if (m.math < 8) failures.push(width + ' ai math=' + m.math);
      if (m.warn) failures.push(width + ' ai unexpectedly warned');
    } else {
      if (!m.warn) failures.push(width + ' broken ai did not show warning');
      if (!m.text.includes('高阶导数')) failures.push(width + ' broken ai lost local content');
    }
    if (m.overflow > 1 || m.bodyOverflow > 1) failures.push(width + ' ai overflow=' + m.overflow + '/' + m.bodyOverflow);
    await page.screenshot({ path: 'debug/qa-search-' + width + '-ai-' + label + '.png' });
  } finally { await context.close(); }
  return failures;
}
(async () => {
  const failures = [];
  for (const width of ACTIVE_WIDTHS) {
    const browser = await launchChromium();
    try {
      failures.push(...await localSearch(browser, width));
      failures.push(...await aiSearch(browser, width, noisy, 'noisy'));
      failures.push(...await aiSearch(browser, width, broken, 'broken'));
    } finally { await browser.close(); }
  }
  const out = { ok: failures.length === 0, widths: ACTIVE_WIDTHS, failures };
  console.log(JSON.stringify(out, null, 2));
  process.exit(failures.length ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
