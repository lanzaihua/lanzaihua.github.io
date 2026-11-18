#!/usr/bin/env node
'use strict';

/**
 * 刷新记忆门禁：刷新后恢复上次打开的页面与期末子页（复习计划 / 出模拟卷 / 模拟考）。
 * 用法：node tools/qa-resume.js [baseUrl]
 */

const { launchChromium } = require('./browser');

const BASE = process.argv[2] || process.env.PAGE_URL || process.env.BASE_URL || 'http://127.0.0.1:4173';
const WIDTHS = [390, 1440];
const seed = {
  version: 1,
  rev: 1,
  updatedAt: new Date().toISOString(),
  activeSubject: 'gaodai',
  activeView: 'overview',
  entries: { gaodai: [], shufen: [], jieji: [], xijing: [] },
  notes: { gaodai: [], shufen: [], jieji: [], xijing: [] },
  notifications: [],
  userTemplates: { gaodai: [], shufen: [], jieji: [], xijing: [] },
  userBank: { gaodai: [], shufen: [], jieji: [], xijing: [] },
  finalExam: { date: '2026-12-20', duration: 120, subject: 'gaodai', chapterSel: { gaodai: [] }, sectionSel: {}, items: [], papers: [], done: {} },
  prefs: { theme: 'auto', autoAi: false, userName: '', lang: 'zh-CN', apiNoticeDismissed: true, finalSection: 'plan', lastRoute: '' },
  clearEpoch: '2026-10-24-empty-v1'
};

function push(failures, width, message) { failures.push(width + 'px / ' + message); }

async function open(page, hash) {
  await page.goto(BASE + '/' + (hash || ''), { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(900);
}

async function activeSection(page) {
  return page.evaluate(() => {
    const on = document.querySelector('.final-section-tab.is-on');
    return { hash: location.hash, section: on && on.getAttribute('data-section'), paper: !!document.querySelector('.final-papers'), plan: !!document.querySelector('.final-plan-panel') };
  });
}

async function runWidth(browser, width) {
  const failures = [];
  const context = await browser.newContext({ viewport: { width, height: 900 } });
  const page = await context.newPage();
  await page.route('**/api/state', (route) => route.abort());
  await page.addInitScript((state) => {
    if (!localStorage.getItem('sanke-cuotiben-v1')) localStorage.setItem('sanke-cuotiben-v1', JSON.stringify(state));
  }, seed);
  await open(page, '#/final');
  const tabs = await page.locator('[data-act="final-section"]').count();
  if (tabs !== 3) push(failures, width, '期末页不是三个入口');

  await page.locator('[data-act="final-section"][data-section="paper"]').click();
  await page.waitForFunction(() => location.hash === '#/final/paper', null, { timeout: 5000 }).catch(() => {});
  let paper = await activeSection(page);
  if (paper.hash !== '#/final/paper') push(failures, width, '切到出模拟卷后地址不是 #/final/paper：' + paper.hash);
  if (paper.section !== 'paper' || !paper.paper) push(failures, width, '切到出模拟卷后内容没有换成模拟卷');

  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1200);
  paper = await activeSection(page);
  if (paper.section !== 'paper' || !paper.paper) push(failures, width, '刷新后没有恢复出模拟卷：' + paper.section);
  if (paper.hash !== '#/final/paper') push(failures, width, '刷新后地址丢失出模拟卷：' + paper.hash);

  await page.locator('[data-act="final-section"][data-section="exam"]').click();
  await page.waitForFunction(() => location.hash === '#/final/exam', null, { timeout: 5000 }).catch(() => {});
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1200);
  const exam = await activeSection(page);
  if (exam.section !== 'exam') push(failures, width, '刷新后没有恢复到模拟考入口：' + exam.section);
  if (!(await page.locator('.final-exam-entry').count())) push(failures, width, '刷新后模拟考入口内容缺失');

  await open(page, '#/gaodai/bank');
  if (!(await page.locator('.bank-list').count())) push(failures, width, '题库页没有打开');
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1400);
  if (!(await page.locator('.bank-list').count())) push(failures, width, '刷新后没有恢复到题库页');

  await open(page, '');
  await page.waitForTimeout(1400);
  if (!(await page.locator('.bank-list').count())) push(failures, width, '重新打开站点首页时没有恢复上次的题库页');

  // 显式回到 #/home 必须尊重用户选择，不能被「恢复上次界面」再次拉回题库。
  await open(page, '#/home');
  await page.waitForTimeout(600);
  const home = await page.evaluate(() => ({
    hash: location.hash,
    homeHidden: !!(document.querySelector('#homeScreen') && document.querySelector('#homeScreen').hidden),
    cards: document.querySelectorAll('.home-subject').length
  }));
  if (home.hash !== '#/home') push(failures, width, '打开 #/home 后地址被改回：' + home.hash);
  if (home.homeHidden) push(failures, width, '打开 #/home 后首页仍被隐藏');
  if (!home.cards) push(failures, width, '打开 #/home 后首页科目入口缺失');
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(900);
  if (!(await page.locator('.home-subject').count()) || await page.locator('#homeScreen').evaluate((el) => el.hidden)) push(failures, width, '刷新 #/home 后没有回到首页');

  await context.close();
  return failures;
}

(async () => {
  const browser = await launchChromium();
  const failures = [];
  try {
    for (const width of WIDTHS) {
      const rows = await runWidth(browser, width);
      rows.forEach((row) => failures.push(row));
    }
  } finally {
    await browser.close();
  }
  if (failures.length) {
    console.error(JSON.stringify({ ok: false, failures }, null, 2));
    process.exit(1);
  }
  console.log(JSON.stringify({ ok: true, widths: WIDTHS, checks: ['paper reload', 'exam reload', 'bank reload', 'root restore', 'explicit home'] }, null, 2));
})();
