#!/usr/bin/env node
'use strict';

/**
 * 期末复习门禁：计划 / 出卷 / 模拟考三入口分离、逐日知识点出处、例题解析、三端无溢出。
 * 用法：node tools/qa-final-review.js [baseUrl]
 */

const fs = require('fs');
const path = require('path');
const { launchChromium } = require('./browser');

const BASE = process.argv[2] || process.env.PAGE_URL || process.env.BASE_URL || 'http://127.0.0.1:4173';
const WIDTHS = [390, 768, 1440];
const SUBJECTS = [['gaodai', 10], ['shufen', 23], ['jieji', 6], ['xijing', 16]];
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
  finalExam: {
    date: '2026-12-20',
    duration: 120,
    subject: 'gaodai',
    chapterSel: { gaodai: [] },
    sectionSel: {},
    items: [],
    papers: [],
    done: {}
  },
  prefs: { theme: 'auto', autoAi: false, userName: '', lang: 'zh-CN', apiNoticeDismissed: true },
  clearEpoch: '2026-10-24-empty-v1'
};

function push(failures, width, message) { failures.push(width + 'px / ' + message); }

async function planSnapshot(page) {
  return page.evaluate(() => {
    const visible = (sel) => [...document.querySelectorAll(sel)].filter((el) => {
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    });
    const app = document.querySelector('.app') || document.body;
    const root = document.querySelector('.final-plan-modules');
    const points = visible('.fpm-point');
    const aiBtn = document.querySelector('.final-plan-intro [data-act="final-ai-plan"]');
    const aiRect = aiBtn ? aiBtn.getBoundingClientRect() : null;
    const aiRange = aiBtn ? document.createRange() : null;
    if (aiRange) aiRange.selectNodeContents(aiBtn);
    const aiTextRect = aiRange ? aiRange.getBoundingClientRect() : null;
    return {
      tabs: visible('.final-section-tab').length,
      aiButton: !!aiBtn,
      aiText: aiBtn ? aiBtn.textContent.trim() : '',
      aiDisabled: aiBtn ? aiBtn.disabled : null,
      aiHeight: aiRect ? Math.round(aiRect.height) : 0,
      aiTextClipped: !!(aiRect && aiTextRect && (aiTextRect.right > aiRect.right + 1 || aiTextRect.left < aiRect.left - 1)),
      aiInsideIntro: !!(aiBtn && aiBtn.closest('.final-plan-intro')),
      planPanel: !!document.querySelector('.final-plan-panel'),
      picker: visible('.final-picker').length,
      modules: visible('.final-plan-module').length,
      points: points.length,
      pointTotal: (() => { const h = document.querySelector('.final-plan-modules-head span'); const m = h ? String(h.textContent).match(/(\d+) 个知识点/) : null; return m ? Number(m[1]) : points.length; })(),
      memory: visible('.fpm-memory li').length,
      templates: visible('.fpm-tpl').length,
      days: visible('.final-day').length,
      dayDetails: visible('.fd-more').length,
      sources: points.map((p) => (p.querySelector('.fpm-source') || {}).textContent || ''),
      text: root ? root.textContent : '',
      rawDollar: /\$/.test(root ? root.textContent : ''),
      rawMath: document.querySelectorAll('.math-raw,.temml-error,.merror').length,
      overflow: app.scrollWidth - app.clientWidth
    };
  });
}

async function dailySnapshot(page) {
  return page.evaluate(() => {
    const body = document.querySelector('.fd-more-body');
    if (!body) return null;
    const card = body.querySelector('.fd-point-card');
    const app = document.querySelector('.app') || document.body;
    return {
      text: body.innerText,
      pointCards: body.querySelectorAll('.fd-point-card').length,
      memory: body.querySelectorAll('.fd-memory').length,
      examples: body.querySelectorAll('.fpe-item').length,
      source: card ? (card.querySelector('small') || {}).textContent || '' : '',
      raw: body.querySelectorAll('.math-raw,.temml-error,.merror').length,
      dollars: (body.innerText.match(/\$/g) || []).length,
      scrollW: body.scrollWidth,
      clientW: body.clientWidth,
      pageOverflow: app.scrollWidth - app.clientWidth
    };
  });
}

(async () => {
  const browser = await launchChromium();
  const failures = [];
  const details = [];
  try {
    for (const width of WIDTHS) {
      const page = await browser.newPage({
        viewport: { width, height: 1000 },
        deviceScaleFactor: 1,
        isMobile: width < 700,
        hasTouch: width < 700
      });
      await page.route('**/api/state', (route) => route.abort());
      await page.addInitScript((state) => {
        try { localStorage.setItem('sanke-cuotiben-v1', JSON.stringify(state)); } catch (e) { /* ignore */ }
      }, seed);
      await page.goto(BASE + '/#/final', { waitUntil: 'domcontentloaded', timeout: 60000 });
      await page.waitForSelector('.final-section-tab', { timeout: 20000 });
      await page.evaluate(() => { document.querySelectorAll('dialog[open]').forEach((d) => d.close()); window.scrollTo(0, 0); });
      await page.waitForTimeout(600);

      const initial = await planSnapshot(page);
      if (initial.tabs !== 3) push(failures, width, 'expected 3 section tabs, got ' + initial.tabs);
      if (!initial.aiButton) push(failures, width, 'AI plan button missing');
      if (initial.aiButton && !initial.aiInsideIntro) push(failures, width, 'AI plan button outside plan intro');
      if (initial.aiButton && initial.aiHeight < 30) push(failures, width, 'AI plan button too short ' + initial.aiHeight);
      if (initial.aiTextClipped) push(failures, width, 'AI plan button text clipped');
      if (!initial.planPanel) push(failures, width, 'plan panel missing');
      if (initial.picker) push(failures, width, 'paper picker should not be mixed into plan tab');
      if (initial.modules < 1) push(failures, width, 'no plan modules');
      if (initial.points < 1) push(failures, width, 'plan points missing');
      if (initial.days < 1) push(failures, width, 'no daily plan rows');
      if (initial.dayDetails < 1) push(failures, width, 'no expandable daily details');
      if (initial.sources.length !== initial.points) push(failures, width, 'points without source');
      if (initial.sources.some((s) => s.indexOf('§') < 0)) push(failures, width, 'knowledge source missing section mark');
      if (initial.rawDollar) push(failures, width, 'raw $ in plan');
      if (initial.rawMath) push(failures, width, 'unrendered math in plan');
      if (initial.overflow > 1) push(failures, width, 'page overflow ' + initial.overflow);
      details.push({ width, stage: 'initial', ...initial, sources: initial.sources.slice(0, 3) });

      // 四科：章节数、知识点、出处、模板、记忆法、横向溢出
      for (const [subjectId, expectedModules] of SUBJECTS) {
        if (subjectId !== 'gaodai') {
          const tab = page.locator('.final-subject-tab[data-subject="' + subjectId + '"]').first();
          if (!(await tab.count())) { push(failures, width, 'subject tab missing: ' + subjectId); continue; }
          await tab.click({ timeout: 10000 });
          await page.waitForTimeout(700);
        }
        const snapshot = await planSnapshot(page);
        if (snapshot.modules !== expectedModules) push(failures, width, subjectId + ' plan modules ' + snapshot.modules + ' != ' + expectedModules);
        if ((snapshot.pointTotal || snapshot.points) < expectedModules * 2) push(failures, width, subjectId + ' too few knowledge points ' + (snapshot.pointTotal || snapshot.points));
        if (snapshot.templates < 1) push(failures, width, subjectId + ' plan has no template');
        if (snapshot.memory < 1) push(failures, width, subjectId + ' plan has no memory tips');
        if (snapshot.sources.some((s) => s.indexOf('§') < 0)) push(failures, width, subjectId + ' knowledge source missing section');
        if (snapshot.rawDollar) push(failures, width, subjectId + ' plan has raw $');
        if (snapshot.rawMath) push(failures, width, subjectId + ' plan has unrendered math');
        if (snapshot.overflow > 1) push(failures, width, subjectId + ' page overflow ' + snapshot.overflow);
        details.push({ width, stage: subjectId, ...snapshot, sources: snapshot.sources.slice(0, 2) });
      }
      await page.locator('.final-subject-tab[data-subject="gaodai"]').first().click({ timeout: 10000 });
      await page.waitForTimeout(600);

      // 章节筛选：只保留第二章，逐日任务必须点名第二章
      const chapterButton = page.locator('.final-chapter-filter [data-act="final-chapter"][data-chapter="第二章 行列式"]').first();
      if (!(await chapterButton.count())) push(failures, width, 'chapter chip for 第二章 missing');
      else {
        await chapterButton.click({ timeout: 10000 });
        await page.waitForTimeout(700);
        const filtered = await page.evaluate(() => {
          const modules = [...document.querySelectorAll('.final-plan-module')];
          const focus = [...document.querySelectorAll('.fd-focus')].slice(0, 6).map((x) => x.textContent).join(' ');
          const points = [...document.querySelectorAll('.fpm-point .fpm-source')].map((x) => x.textContent);
          return { modules: modules.length, focus, points };
        });
        if (filtered.modules !== 1) push(failures, width, 'chapter filter kept ' + filtered.modules + ' modules');
        if (!filtered.focus.includes('第二章')) push(failures, width, 'daily plan does not name the selected chapter');
        if (!filtered.points.length || filtered.points.some((s) => s.indexOf('第二章') < 0)) push(failures, width, 'filtered point source is not 第二章');
        details.push({ width, stage: 'filtered', ...filtered, points: filtered.points.slice(0, 2) });
      }

      // 当天知识点 + 当天例题：展开后必须有出处、记忆法、标准解答、模板、解析、易错点
      const day = page.locator('.fd-more').first();
      if (!(await day.count())) push(failures, width, 'no daily detail');
      else {
        await day.locator('> summary').click();
        await page.waitForTimeout(300);
        const nested = day.locator('.fpe-detail').first();
        if (await nested.count()) {
          await nested.locator('summary').click();
          await page.waitForTimeout(300);
        }
        const daily = await dailySnapshot(page);
        if (!daily) push(failures, width, 'daily detail body missing');
        else {
          if (!daily.source.includes('§')) push(failures, width, 'daily point source missing section');
          if (daily.memory < 1) push(failures, width, 'daily memory tip missing');
          if (daily.examples < 1) push(failures, width, 'daily example missing');
          if (!/考试标准解答/.test(daily.text)) push(failures, width, 'daily detail missing standard solution');
          if (!/答题模板/.test(daily.text)) push(failures, width, 'daily detail missing answer template');
          if (!/详细解析/.test(daily.text)) push(failures, width, 'daily detail missing analysis');
          if (!/易错点/.test(daily.text)) push(failures, width, 'daily detail missing pitfalls');
          if (daily.raw) push(failures, width, 'unrendered math in daily detail');
          if (daily.dollars) push(failures, width, 'raw $ in daily detail');
          if (daily.scrollW > daily.clientW + 1) push(failures, width, 'daily detail clipped ' + daily.scrollW + '>' + daily.clientW);
          if (daily.pageOverflow > 1) push(failures, width, 'page overflow after open daily detail');
          details.push({ width, stage: 'daily', ...daily, text: daily.text.slice(0, 160) });
        }
      }

      // 出模拟卷：与计划分开，选题器只在出卷页
      await page.locator('.final-section-tab[data-section="paper"]').click();
      await page.waitForTimeout(500);
      const paperTab = await page.evaluate(() => ({
        plan: !!document.querySelector('.final-plan-panel'),
        picker: !!document.querySelector('.final-picker'),
        rows: document.querySelectorAll('.final-picker .fp-row').length,
        overflow: (document.querySelector('.app') || document.body).scrollWidth - (document.querySelector('.app') || document.body).clientWidth
      }));
      if (paperTab.plan) push(failures, width, 'plan panel still visible on paper tab');
      if (!paperTab.picker) push(failures, width, 'picker missing on paper tab');
      if (paperTab.rows < 1) push(failures, width, 'picker has no rows');
      if (paperTab.overflow > 1) push(failures, width, 'paper tab overflow ' + paperTab.overflow);

      const picker = page.locator('.final-picker');
      if (await picker.count()) {
        const select = picker.locator('[data-paper-picker-chapter]');
        await select.selectOption('第三章 线性方程组');
        await page.waitForTimeout(350);
        const firstSub = await picker.locator('.fp-row .fpr-main small').first().innerText();
        if (!firstSub.includes('第三章')) push(failures, width, 'picker chapter filter did not apply');
        const firstCheck = picker.locator('.fp-row input:not([disabled])').first();
        if (!(await firstCheck.count())) push(failures, width, 'picker has no selectable row');
        else {
          await firstCheck.check();
          await page.waitForTimeout(250);
          const newBtn = picker.locator('[data-act="final-picker-new"]');
          if (await newBtn.isDisabled()) push(failures, width, 'new paper disabled after selecting');
          else {
            await newBtn.click();
            await page.waitForTimeout(700);
            const made = await page.evaluate(() => ({
              items: document.querySelectorAll('.final-paper-item').length,
              chips: document.querySelectorAll('.final-paper-chip').length
            }));
            if (made.items !== 1) push(failures, width, 'new paper expected 1 item, got ' + made.items);
            if (made.chips < 1) push(failures, width, 'new paper chip missing');
          }
        }
      }

      // 模拟考：与计划、出卷分开
      await page.locator('.final-section-tab[data-section="exam"]').click();
      await page.waitForTimeout(400);
      const examTab = await page.evaluate(() => ({
        plan: !!document.querySelector('.final-plan-panel'),
        picker: !!document.querySelector('.final-picker'),
        setup: !!document.querySelector('.final-exam-entry, .exam-rules, .exam-lock, .final-section-tab[data-section="exam"].is-on')
      }));
      if (examTab.plan) push(failures, width, 'plan panel still visible on exam tab');
      if (examTab.picker) push(failures, width, 'picker still visible on exam tab');
      if (!examTab.setup) push(failures, width, 'exam entry not visible');

      const finalOverflow = await page.evaluate(() => {
        const app = document.querySelector('.app') || document.body;
        return app.scrollWidth - app.clientWidth;
      });
      if (finalOverflow > 1) push(failures, width, 'page overflow after interactions ' + finalOverflow);

      await page.screenshot({ path: path.join('debug', 'qa-final-review-' + width + '.png') });
      await page.close();
    }
  } finally {
    await browser.close();
  }

  const report = { base: BASE, widths: WIDTHS, failures, details };
  fs.mkdirSync('debug', { recursive: true });
  fs.writeFileSync(path.join('debug', 'qa-final-review.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
  if (failures.length) process.exitCode = 1;
})().catch((err) => {
  console.error(err && err.stack || err);
  process.exit(1);
});
