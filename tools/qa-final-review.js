#!/usr/bin/env node
'use strict';

/**
 * 期末复习模块门禁：章节筛选、知识点/模板/例题计划、题库选题组卷、三端无溢出。
 * 用法：node tools/qa-final-review.js [baseUrl]
 */

const fs = require('fs');
const path = require('path');
const { launchChromium } = require('./browser');

const BASE = process.argv[2] || process.env.PAGE_URL || process.env.BASE_URL || 'http://127.0.0.1:4173';
const WIDTHS = [390, 768, 1440];
const STORAGE_KEY = 'sanke-cuotiben-v1';
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

function push(failures, width, message) {
  failures.push(width + 'px / ' + message);
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
      await page.goto(BASE + '/#/final', { waitUntil: 'networkidle', timeout: 120000 });
      await page.waitForTimeout(500);

      const initial = await page.evaluate(() => {
        const app = document.querySelector('.app') || document.body;
        return {
          modules: document.querySelectorAll('.final-plan-module').length,
          examples: document.querySelectorAll('.fpe-item').length,
          picker: !!document.querySelector('.final-picker'),
          pickerRows: document.querySelectorAll('.fp-row').length,
          chapterChips: document.querySelectorAll('.final-chapter-filter .fcf-chip').length,
          overflow: app.scrollWidth - app.clientWidth
        };
      });
      if (!initial.modules) push(failures, width, 'no plan modules');
      if (!initial.examples) push(failures, width, 'no plan examples');
      if (!initial.picker) push(failures, width, 'no bank picker');
      if (!initial.pickerRows) push(failures, width, 'no bank picker rows');
      if (initial.chapterChips < 2) push(failures, width, 'chapter filter missing chapters');
      if (initial.overflow > 1) push(failures, width, 'page overflow ' + initial.overflow);

      // 四科计划都能渲染：模块数、模板、公式与横向溢出
      const SUBJECTS = [['gaodai', 10], ['shufen', 23], ['jieji', 6], ['xijing', 16]];
      for (const [subjectId, expectedModules] of SUBJECTS) {
        if (subjectId !== 'gaodai') {
          const tab = page.locator('.final-subject-tab[data-subject="' + subjectId + '"]');
          if (!(await tab.count())) { push(failures, width, 'subject tab missing: ' + subjectId); continue; }
          await tab.first().click();
          await page.waitForTimeout(600);
        }
        const subjectPlan = await page.evaluate(() => {
          const root = document.querySelector('.final-plan-modules');
          const app = document.querySelector('.app') || document.body;
          const text = root ? root.textContent : '';
          return {
            modules: document.querySelectorAll('.final-plan-module').length,
            templates: document.querySelectorAll('.fpm-tpl').length,
            rawDollar: /\$/.test(text),
            rawMath: document.querySelectorAll('.math-raw,.temml-error,.merror').length,
            overflow: app.scrollWidth - app.clientWidth
          };
        });
        if (subjectPlan.modules !== expectedModules) push(failures, width, subjectId + ' plan modules ' + subjectPlan.modules + ' != ' + expectedModules);
        if (subjectPlan.templates < 1) push(failures, width, subjectId + ' plan has no template');
        if (subjectPlan.rawDollar) push(failures, width, subjectId + ' plan has raw $');
        if (subjectPlan.rawMath) push(failures, width, subjectId + ' plan has unrendered math');
        if (subjectPlan.overflow > 1) push(failures, width, subjectId + ' page overflow ' + subjectPlan.overflow);
        details.push({ width, subject: subjectId, ...subjectPlan });
      }
      if ((await page.locator('.final-subject-tab[data-subject="gaodai"]').count())) {
        await page.locator('.final-subject-tab[data-subject="gaodai"]').first().click();
        await page.waitForTimeout(600);
      }

      // 按章节筛选：只保留第二章，并确认计划只剩这一章
      const chapterButton = page.locator('.final-chapter-filter [data-act="final-chapter"][data-chapter="第二章 行列式"]').first();
      if (!(await chapterButton.count())) push(failures, width, 'chapter chip for 第二章 missing');
      else {
        await chapterButton.click();
        await page.waitForTimeout(700);
        const filtered = await page.evaluate(() => {
          const modules = [...document.querySelectorAll('.final-plan-module')];
          const text = document.querySelector('.final-plan-modules') ? document.querySelector('.final-plan-modules').innerText : '';
          return {
            modules: modules.length,
            titles: modules.map((m) => (m.querySelector('.fpm-title') || {}).textContent || ''),
            hasSecond: text.indexOf('第二章 行列式') >= 0,
            days: document.querySelectorAll('.final-day').length,
            dayText: [...document.querySelectorAll('.fd-focus')].slice(0, 5).map((x) => x.textContent).join(' ')
          };
        });
        if (filtered.modules !== 1) push(failures, width, 'chapter filter kept ' + filtered.modules + ' modules');
        if (!filtered.hasSecond) push(failures, width, 'filtered plan has no 第二章');
        if (!filtered.dayText.includes('第二章')) push(failures, width, 'daily plan does not name the selected chapter');
        details.push({ width, filtered });
      }

      const plan = await page.evaluate(() => {
        const root = document.querySelector('.final-plan-modules');
        return {
          text: root ? root.innerText : '',
          memory: document.querySelectorAll('.fpm-memory li').length,
          templates: document.querySelectorAll('.fpm-tpl').length,
          usage: document.querySelector('.final-plan-usage') ? document.querySelector('.final-plan-usage').innerText : ''
        };
      });
      if (plan.memory < 1) push(failures, width, 'no memory / exam tips');
      if (plan.templates < 1) push(failures, width, 'no answer template');
      if (!/每天怎么用/.test(plan.usage)) push(failures, width, 'no daily usage block');
      if (/\$/.test(plan.text)) push(failures, width, 'raw $ in plan modules');

      const detail = page.locator('.fpe-detail').first();
      if (!(await detail.count())) push(failures, width, 'no expandable example detail');
      else {
        await detail.locator('summary').click();
        await page.waitForTimeout(250);
        const expanded = await detail.locator('.fpe-detail-body').evaluate((el) => {
          const card = el.closest('.fpe-item');
          return {
            text: el.innerText,
            scrollW: el.scrollWidth,
            clientW: el.clientWidth,
            cardScrollW: card ? card.scrollWidth : 0,
            cardClientW: card ? card.clientWidth : 0,
            raw: el.querySelectorAll('.math-raw,.temml-error,.merror').length
          };
        });
        if (!/考试标准解答/.test(expanded.text)) push(failures, width, 'detail missing standard solution');
        if (!/答题模板/.test(expanded.text)) push(failures, width, 'detail missing answer template');
        if (!/详细解析/.test(expanded.text)) push(failures, width, 'detail missing analysis');
        if (!/易错点/.test(expanded.text)) push(failures, width, 'detail missing pitfalls');
        if (expanded.scrollW > expanded.clientW + 1) push(failures, width, 'detail body clipped ' + expanded.scrollW + '>' + expanded.clientW);
        if (expanded.cardScrollW > expanded.cardClientW + 1) push(failures, width, 'example card clipped ' + expanded.cardScrollW + '>' + expanded.cardClientW);
        if (expanded.raw) push(failures, width, 'unrendered math in detail');
      }

      // 题库选题器：切章节、全选、新建卷、再加入当前卷
      const picker = page.locator('.final-picker');
      if (!(await picker.count())) push(failures, width, 'picker missing');
      else {
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
            await page.waitForTimeout(600);
            const made = await page.evaluate(() => ({
              items: document.querySelectorAll('.final-paper-item').length,
              chips: document.querySelectorAll('.final-paper-chip').length
            }));
            if (made.items !== 1) push(failures, width, 'new paper expected 1 item, got ' + made.items);
            if (made.chips < 1) push(failures, width, 'new paper chip missing');
          }
        }

        await select.selectOption('第二章 行列式');
        await page.waitForTimeout(350);
        const addCheck = picker.locator('.fp-row input:not([disabled])').first();
        if (await addCheck.count()) {
          await addCheck.check();
          await page.waitForTimeout(200);
          const addBtn = picker.locator('[data-act="final-picker-add"]');
          if (await addBtn.isDisabled()) push(failures, width, 'add-to-paper disabled after selecting');
          else {
            await addBtn.click();
            await page.waitForTimeout(500);
            const added = await page.evaluate(() => ({
              items: document.querySelectorAll('.final-paper-item').length,
              chips: document.querySelectorAll('.final-paper-chip').length
            }));
            if (added.items !== 2) push(failures, width, 'add-to-paper expected 2 items, got ' + added.items);
            if (added.chips !== 1) push(failures, width, 'add-to-paper changed paper count');
          }
        } else push(failures, width, 'picker has no selectable row after chapter change');
      }

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
