'use strict';
const { chromium } = require('playwright-core');
const path = require('path');
const fs = require('fs');
const { startServer } = require('./qa-server');

(async function () {
  const server = await startServer();
  const base = server.base + '/';
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const out = { errors: [], base: server.base };
  const shots = path.join(__dirname, '..', 'screenshots');
  fs.mkdirSync(shots, { recursive: true });

  function seedEntry(id, code, subject, title, chapter, md) {
    return {
      id: id, code: code, subject: subject, title: title, summary: title,
      date: '2026-11-08 09:00 星期六', chapter: chapter, section: '',
      source: 'QA 种子', points: ['矩阵', '对称性'], errorTypes: [],
      status: 'unmastered',
      blocks: [{ title: '题目', md: md }, { title: '解答', md: '解：由已知条件逐步展开即可。' }],
      variants: [], review: { d1: false, d3: false, d7: false, d15: false, d30: false },
      createdAt: '2026-11-08T01:00:00.000Z', updatedAt: '2026-11-08T01:00:00.000Z'
    };
  }
  const seedState = {
    version: 1, rev: 0, updatedAt: '2026-11-08T01:00:00.000Z',
    activeSubject: 'gaodai', activeView: 'overview',
    entries: {
      gaodai: [seedEntry('qa-seed-gaodai', 'A-001', 'gaodai', '矩阵证明测试', '第一章 多项式', '设 $H=E-2XX^T$，证明 $H$ 是对称阵且 $H^2=E$。')],
      shufen: [seedEntry('qa-seed-shufen', 'MA-001', 'shufen', '数列极限测试', '第一章 实数集与函数', '求 $\\lim_{n\\to\\infty} \\frac{1}{n}$。')],
      jieji: [], xijing: []
    },
    notes: { gaodai: [], shufen: [], jieji: [], xijing: [] },
    prefs: { theme: 'auto', autoAi: true, userName: '', lang: 'zh-CN', apiNoticeDismissed: true }
  };
  async function seed(page) {
    await page.waitForTimeout(500);
    await dismissWelcome(page);
  }

  async function dismissWelcome(page) {
    const dlg = page.locator('#apiWelcomeDialog[open]');
    if (await dlg.count()) {
      const btn = page.locator('[data-act="dismiss-api-welcome"]').first();
      if (await btn.count()) await btn.click();
      await page.waitForTimeout(150);
    }
  }

  async function mk(vp) {
    const ctx = await browser.newContext({ viewport: vp, isMobile: vp.width < 500, hasTouch: vp.width < 500, deviceScaleFactor: 1 });
    await ctx.addInitScript(function (payload) {
      try {
        if (!localStorage.getItem('qa-seeded')) {
          localStorage.setItem('sanke-cuotiben-v1', JSON.stringify(payload));
          localStorage.setItem('qa-seeded', '1');
        }
      } catch (e) { /* ignore */ }
    }, seedState);
    const page = await ctx.newPage();
    page.on('pageerror', function (e) { out.errors.push('pageerror: ' + e.message); });
    page.on('console', function (m) { if (m.type() === 'error' && m.text().indexOf('409') < 0) out.errors.push('console: ' + m.text()); });
    await page.goto(base, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(900);
    await seed(page);
    return page;
  }

  async function go(page, hash) {
    await page.goto(base + '/?v=' + Date.now() + hash, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(800);
    await dismissWelcome(page);
  }

  const page = await mk({ width: 1440, height: 1000 });

  // gaodai bank with math
  await go(page, '#/gaodai/bank');
  out.gaodaiBank = await page.locator('.bank-item').count();
  await page.locator('[data-act="toggle-bank-answer"]').first().click();
  await page.waitForTimeout(500);
  out.bankMath = await page.locator('.bank-item math').count();
  out.bankRaw = await page.locator('.bank-item .math-raw').count();
  await page.screenshot({ path: path.join(shots, 'bank-algebra.png'), fullPage: false });

  // shufen entry
  await go(page, '#/shufen/overview');
  out.shufenHero = await page.locator('.hero-title').textContent();
  await go(page, '#/shufen/entries');
  out.shufenEntries = await page.locator('.entry').count();
  await page.locator('.entry-head').first().click();
  await page.waitForTimeout(600);
  out.shufenBlocks = await page.locator('.entry-body .block').count();
  out.shufenMath = await page.locator('.entry-body math').count();
  await page.screenshot({ path: path.join(shots, 'entry-analysis.png'), fullPage: true });

  // jieji bank
  await go(page, '#/jieji/bank');
  out.jiejiBank = await page.locator('.bank-item').count();
  await page.locator('[data-act="toggle-bank-answer"]').nth(1).click();
  await page.waitForTimeout(500);
  out.jiejiMath = await page.locator('.bank-item math').count();
  await page.screenshot({ path: path.join(shots, 'bank-geometry.png'), fullPage: false });

  // editor save test on gaodai entry
  await go(page, '#/gaodai/entries');
  await page.locator('.entry-head').first().click();
  await page.waitForTimeout(400);
  await page.locator('[data-act="edit-entry"]').first().click();
  await page.waitForTimeout(500);
  out.editorFormPoints = await page.locator('#f-points').inputValue();
  await page.locator('#f-points').fill('测试要点A；测试要点B');
  await page.locator('#f-source').fill('QA 编辑测试');
  await page.locator('[data-act="save-entry"]').click();
  await page.waitForTimeout(1200);
  out.savedOpenEntry = await page.locator('.entry.is-open .entry-title').first().textContent();
  out.savedPoints = await page.locator('.entry.is-open .chip').first().textContent();
  out.savedSource = await page.locator('.entry.is-open .entry-meta').first().textContent();
  await page.screenshot({ path: path.join(shots, 'entry-edited.png'), fullPage: false });

  // add entry test
  await page.locator('[data-act="add-entry"]').first().click();
  await page.waitForTimeout(500);
  await page.locator('#f-code').fill('QA-TEST-1');
  await page.locator('#f-points').fill('QA 新条目');
  await page.locator('#blockEditors .b-md').first().fill('已知测试题面，证明 $a^2+b^2 \\ge 2ab$。');
  await page.locator('[data-act="save-entry"]').click();
  await page.waitForTimeout(1200);
  out.entryCountAfterAdd = await page.locator('.entry').count();
  out.addedEntryExists = await page.locator('.entry-code').filter({ hasText: 'QA-TEST-1' }).count();
  // cleanup: delete test entry
  await page.locator('[data-act="delete-entry"]').first().click();
  await page.waitForTimeout(400);
  await page.locator('#confirmOk').click();
  await page.waitForTimeout(800);
  out.entryCountAfterDelete = await page.locator('.entry').count();

  // mobile
  const mp = await mk({ width: 390, height: 844 });
  out.mobile = await mp.evaluate(function () {
    return { scrollW: document.documentElement.scrollWidth, innerW: window.innerWidth };
  });
  await mp.screenshot({ path: path.join(shots, 'mobile-overview.png'), fullPage: true });
  await go(mp, '#/gaodai/entries');
  await mp.locator('.entry-head').first().click();
  await mp.waitForTimeout(500);
  await mp.screenshot({ path: path.join(shots, 'mobile-entry.png'), fullPage: true });
  await mp.locator('.top-actions [data-act="open-settings"]').first().click();
  await mp.waitForTimeout(400);
  await mp.screenshot({ path: path.join(shots, 'mobile-settings.png'), fullPage: false });

  console.log(JSON.stringify(out, null, 2));
  await browser.close();
  await server.stop();
})().catch(async function (e) { console.error('QA2 FAILED:', e && e.stack || e); process.exit(1); });
