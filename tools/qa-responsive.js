'use strict';
/*
 * 三端真实浏览器回归：6 个视口 + 首页/四科/题库/笔记/模拟考/设置/更新记录 + 深色模式。
 * 用法：node tools/qa-responsive.js
 * 可选：PAGE_URL=... node tools/qa-responsive.js
 * CI 先运行 npx playwright-core install --with-deps chromium。
 */
const fs = require('fs');
const zlib = require('zlib');
const path = require('path');
const { launchChromium } = require('./browser');

const URL_BASE = process.env.PAGE_URL || 'https://lanzaihua.github.io/';
const DEVICES = [
  { name: 'phone-390', width: 390, height: 844, mobile: true, touch: true, dpr: 2 },
  { name: 'phone-360', width: 360, height: 800, mobile: true, touch: true, dpr: 2 },
  { name: 'phone-430', width: 430, height: 932, mobile: true, touch: true, dpr: 2 },
  { name: 'tablet-portrait', width: 834, height: 1112, mobile: true, touch: true, dpr: 2 },
  { name: 'tablet-landscape', width: 1112, height: 834, mobile: true, touch: true, dpr: 2 },
  { name: 'desktop', width: 1440, height: 1000, mobile: false, touch: false, dpr: 1 }
];
const ROUTES = [
  ['home', '#/home'],
  ['overview', '#/gaodai/overview'],
  ['stats', '#/gaodai/stats'],
  ['entries', '#/gaodai/entries'],
  ['templates', '#/gaodai/templates'],
  ['bank', '#/gaodai/bank'],
  ['guide', '#/gaodai/guide'],
  ['notes', '#/notes'],
  ['knowledge', '#/notes/kb'],
  ['final', '#/final']
];

function assert(cond, failures, label) { if (!cond) failures.push(label); }
function sleep(page, ms) { return page.waitForTimeout(ms); }
async function goto(page, hash) {
  await page.goto(URL_BASE + '?v=' + Date.now() + hash, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await sleep(page, 450);
  try { await page.waitForSelector('#apiWelcomeDialog[open]', { timeout: 1800 }); } catch (e) {}
  if (await page.locator('#apiWelcomeDialog[open]').count()) {
    const dismiss = page.locator('#apiWelcomeDialog [data-act="dismiss-api-welcome"], #apiWelcomeDialog [data-act="close-dialog"], #apiWelcomeDialog .dlg-close').first();
    if (await dismiss.count()) await dismiss.click({ force: true });
    try { await page.waitForSelector('#apiWelcomeDialog[open]', { state: 'detached', timeout: 1200 }); } catch (e) {}
  }
}
async function overflow(page) {
  return page.evaluate(function () {
    return { doc: document.documentElement.scrollWidth - window.innerWidth, body: document.body.scrollWidth - window.innerWidth };
  });
}
async function visibleBox(page, selector) {
  return page.evaluate(function (sel) {
    var el = document.querySelector(sel);
    if (!el) return null;
    var r = el.getBoundingClientRect();
    return { left: r.left, right: r.right, top: r.top, bottom: r.bottom, width: r.width, height: r.height };
  }, selector);
}

(async function () {
  const browser = await launchChromium();
  const report = [];
  const failures = [];
  const only = process.env.ONLY_DEVICE || '';
  for (const device of DEVICES) {
    if (only && device.name !== only) continue;
    const context = await browser.newContext({
      viewport: { width: device.width, height: device.height },
      deviceScaleFactor: device.dpr,
      isMobile: device.mobile,
      hasTouch: device.touch
    });
    const page = await context.newPage();
    page.setDefaultTimeout(6000);
    console.error('device ' + device.name + ' start');
    const pageErrors = [];
    page.on('pageerror', function (e) { pageErrors.push(String(e && e.message || e)); });
    const item = { device: device.name, viewport: device.width + 'x' + device.height, routes: {}, dialogs: {}, interactions: {}, errors: pageErrors };

    await goto(page, '#/home');
    item.homeDock = await page.evaluate(function () {
      var dock = document.querySelector('.home-icon-group');
      var card = document.querySelector('.home-subject:last-of-type');
      if (!dock || !card) return { position: 'missing', overlap: false, inFooter: false };
      var a = dock.getBoundingClientRect();
      var b = card.getBoundingClientRect();
      return {
        position: getComputedStyle(dock).position,
        inFooter: !!dock.closest('.home-foot'),
        overlap: !(a.bottom <= b.top || a.top >= b.bottom || a.right <= b.left || a.left >= b.right)
      };
    });
    assert(item.homeDock.position !== 'fixed', failures, device.name + ' / home toolbar fixed over content');
    assert(item.homeDock.inFooter, failures, device.name + ' / home toolbar not in footer');
    assert(!item.homeDock.overlap, failures, device.name + ' / home toolbar overlaps subject card');

    for (const entry of ROUTES) {
      await goto(page, entry[1]);
      const o = await overflow(page);
      item.routes[entry[0]] = o;
      assert(o.doc <= 1, failures, device.name + ' / ' + entry[0] + ' doc overflow ' + o.doc);
      assert(o.body <= 1, failures, device.name + ' / ' + entry[0] + ' body overflow ' + o.body);
    }

    // 首页 -> 科目入口：真实点击，不只截图。
    await goto(page, '#/home');
    const subject = page.locator('.home-subject').first();
    if (await subject.count()) {
      await subject.click();
      await sleep(page, 450);
      item.interactions.homeToSubject = await page.evaluate(function () { return location.hash; });
      assert(/#\/(gaodai|shufen|jieji|xijing)\/(entries|overview)/.test(item.interactions.homeToSubject), failures, device.name + ' / subject card does not open subject page');
    } else {
      failures.push(device.name + ' / subject cards missing');
    }

    // 题库：来源筛选、章 -> 小节级联、展开解答。
    await goto(page, '#/xijing/bank');
    const bankCount = await page.locator('.bank-item').count();
    assert(bankCount > 0, failures, device.name + ' / bank has no cards');
    const exerciseBtn = page.locator('[data-act="bank-origin"][data-value="exercise"]');
    if (await exerciseBtn.count()) {
      await exerciseBtn.click();
      await sleep(page, 350);
      item.interactions.bankExercise = await page.evaluate(function () {
        return {
          pressed: document.querySelector('[data-act="bank-origin"][data-value="exercise"]').getAttribute('aria-pressed'),
          cards: document.querySelectorAll('.bank-item').length,
          countText: (document.querySelector('.bank-filters .count-note') || {}).textContent || ''
        };
      });
      assert(item.interactions.bankExercise.pressed === 'true', failures, device.name + ' / exercise source not selected');
      assert(item.interactions.bankExercise.cards > 0, failures, device.name + ' / exercise source empty');
      const chapterSelect = page.locator('[data-bank-filter="chapter"]');
      if (await chapterSelect.count()) {
        const options = await chapterSelect.locator('option').count();
        if (options > 1) {
          await chapterSelect.selectOption({ index: 1 });
          await sleep(page, 300);
          item.interactions.bankCascade = await page.evaluate(function () {
            return { section: !!document.querySelector('[data-bank-filter="section"]'), cards: document.querySelectorAll('.bank-item').length };
          });
          assert(item.interactions.bankCascade.section, failures, device.name + ' / bank section filter did not appear');
          assert(item.interactions.bankCascade.cards > 0, failures, device.name + ' / bank chapter cascade empty');
        }
      }
      const toggle = page.locator('[data-act="toggle-bank-answer"]').first();
      if (await toggle.count()) {
        await toggle.click();
        await sleep(page, 250);
        item.interactions.bankAnswer = await page.evaluate(function () {
          var open = document.querySelector('.bank-item.is-open');
          return { open: !!open, solution: !!(open && (open.querySelector('.bank-solution') || open.querySelector('[id^="answer-"]'))), overflow: document.documentElement.scrollWidth - window.innerWidth };
        });
        assert(item.interactions.bankAnswer.open && item.interactions.bankAnswer.solution, failures, device.name + ' / bank answer did not expand');
        assert(item.interactions.bankAnswer.overflow <= 1, failures, device.name + ' / bank answer overflow');
      }
    } else {
      failures.push(device.name + ' / exercise source button missing');
    }

    // 模拟考章节弹窗：取消/全选/展开小节/恢复。
    await goto(page, '#/final');
    const examTab = page.locator('[data-act="final-section"][data-section="exam"]:visible').first();
    if (await examTab.count()) { await examTab.click(); await sleep(page, 250); }
    const startStandard = page.locator('[data-act="final-start-exam"]:visible').first();
    if (await startStandard.count()) {
      await startStandard.click();
      await sleep(page, 350);
      item.interactions.examPicker = await page.evaluate(function () {
        return {
          open: !!document.querySelector('.exam-chapter-card'),
          chapters: document.querySelectorAll('[data-final-ai-chapter]').length,
          sections: document.querySelectorAll('.exam-section-block').length,
          statText: (document.querySelector('.exam-chapter-stat') || {}).innerText || ''
        };
      });
      assert(item.interactions.examPicker.open, failures, device.name + ' / exam chapter picker did not open');
      assert(item.interactions.examPicker.chapters >= 2, failures, device.name + ' / exam chapter list empty');
      const none = page.locator('[data-act="final-ai-chapters-none"]');
      await none.click();
      await sleep(page, 150);
      assert(await page.locator('#examChaptersStart').isDisabled(), failures, device.name + ' / exam start still enabled after clear');
      const firstCheck = page.locator('[data-final-ai-chapter]').first();
      await firstCheck.check({ force: true });
      await sleep(page, 150);
      const firstExpand = page.locator('[data-act="final-ai-chapter-toggle"]').first();
      if (await firstExpand.count()) {
        await firstExpand.click();
        await sleep(page, 150);
        const openPanels = await page.locator('.exam-section-block:not([hidden])').count();
        assert(openPanels === 1, failures, device.name + ' / accordion panels ' + openPanels);
      }
      const all = page.locator('[data-act="final-ai-chapters-all"]');
      await all.click();
      await sleep(page, 150);
      assert(!(await page.locator('#examChaptersStart').isDisabled()), failures, device.name + ' / exam start disabled after select all');
      const cancel = page.locator('[data-act="final-ai-chapters-cancel"]');
      await cancel.click();
      await sleep(page, 150);
      assert(!(await page.locator('.exam-chapter-card').count()), failures, device.name + ' / exam picker did not close');
    } else {
      failures.push(device.name + ' / standard exam start button missing');
    }

    // 笔记：新建入口可点，编辑器可打开。
    await goto(page, '#/notes');
    const newNote = page.locator('[data-act="note-new-page"]:visible').first();
    if (await newNote.count()) {
      await newNote.click();
      await sleep(page, 450);
      item.interactions.note = await page.evaluate(function () {
        return { editor: !!document.querySelector('.note-editor, #noteEditor, .note-page'), hash: location.hash, overflow: document.documentElement.scrollWidth - window.innerWidth };
      });
      assert(item.interactions.note.editor, failures, device.name + ' / note editor did not open');
      assert(item.interactions.note.overflow <= 1, failures, device.name + ' / note editor overflow');
    }

    // 设置与更新记录弹窗。
    if (device.name === 'desktop') {
      await goto(page, '#/gaodai/bank');
      const add = page.locator('[data-act="add-from-bank"]:visible').first();
      if (await add.count()) {
        await add.click();
        await page.waitForSelector('#editor[open]', { timeout: 5000 });
        await page.locator('[data-act="save-entry"]').click();
        await sleep(page, 700);
        if (await page.locator('#editor[open]').count()) {
          const closeEditor = page.locator('#editor [data-act="close-dialog"][data-dialog="editor"]').first();
          if (await closeEditor.count()) await closeEditor.click({ force: true });
        }
        item.interactions.addToEntries = await page.evaluate(function () {
          try { var st = JSON.parse(localStorage.getItem('sanke-cuotiben-v1') || '{}'); return ((st.entries && st.entries.gaodai) || []).length; } catch (e) { return 0; }
        });
        assert(item.interactions.addToEntries > 0, failures, device.name + ' / add from bank did not create an entry');
      }
    }
    await goto(page, '#/home');
    await page.locator('[data-act="open-settings"]:visible').first().click();
    await sleep(page, 300);
    item.dialogs.settings = await page.evaluate(function () {
      var d = document.querySelector('#settings');
      var r = d.getBoundingClientRect();
      return { width: Math.round(r.width), left: Math.round(r.left), right: Math.round(r.right), sections: document.querySelectorAll('.settings-section').length, overflow: document.documentElement.scrollWidth - window.innerWidth };
    });
    assert(item.dialogs.settings.left >= 0 && item.dialogs.settings.right <= device.width + 1, failures, device.name + ' / settings off-screen');
    assert(item.dialogs.settings.sections === 5, failures, device.name + ' / settings sections');
    assert(item.dialogs.settings.overflow <= 1, failures, device.name + ' / settings overflow');

    // 数据备份：真实下载 JSON/GZIP，再通过导入入口合并回来。
    if (device.name === 'desktop') {
      const downloadPromise = page.waitForEvent('download', { timeout: 15000 });
      await page.locator('[data-act="export-state"]:visible').first().click();
      const download = await downloadPromise;
      const savedName = download.suggestedFilename() || ('qa-backup-' + Date.now() + '.json');
      const debugDir = path.join(__dirname, '..', 'debug');
      fs.mkdirSync(debugDir, { recursive: true });
      const filePath = path.join(debugDir, 'qa-' + savedName);
      await download.saveAs(filePath);
      const raw = fs.readFileSync(filePath);
      let payload;
      try { payload = JSON.parse(filePath.endsWith('.gz') ? zlib.gunzipSync(raw).toString('utf8') : raw.toString('utf8')); }
      catch (e) { payload = null; }
      const before = await page.evaluate(function () {
        try { return JSON.parse(localStorage.getItem('sanke-cuotiben-v1') || '{}'); } catch (e) { return {}; }
      });
      const beforeCount = Object.keys((before.entries) || {}).reduce(function (n, k) { return n + ((before.entries[k] || []).length); }, 0);
      item.data = { file: download.suggestedFilename(), app: payload && payload.app, version: payload && payload.version, beforeCount: beforeCount };
      assert(payload && payload.app === 'sanke-cuotiben', failures, device.name + ' / backup payload app');
      assert(payload && payload.meta && payload.meta.builtinBankExcluded === true, failures, device.name + ' / backup excludes builtin bank');
      assert(payload && payload.state && typeof payload.state.entries === 'object', failures, device.name + ' / backup state entries');
      await page.setInputFiles('#importFile', filePath);
      await page.waitForSelector('#importDialog[open]', { timeout: 5000 });
      item.data.dialog = (await page.locator('#importBody').innerText()).slice(0, 160);
      assert(/导入文件/.test(item.data.dialog), failures, device.name + ' / import dialog missing summary');
      await page.locator('[data-act="confirm-import"]').click();
      await sleep(page, 700);
      const after = await page.evaluate(function () {
        try { return JSON.parse(localStorage.getItem('sanke-cuotiben-v1') || '{}'); } catch (e) { return {}; }
      });
      const afterCount = Object.keys((after.entries) || {}).reduce(function (n, k) { return n + ((after.entries[k] || []).length); }, 0);
      item.data.afterCount = afterCount;
      assert(afterCount >= beforeCount, failures, device.name + ' / import lost entries ' + beforeCount + ' -> ' + afterCount);
      assert(!(await page.locator('#importDialog[open]').count()), failures, device.name + ' / import dialog did not close');
    }
    await page.locator('[data-act="close-dialog"][data-dialog="settings"]').first().click();
    await sleep(page, 150);

    await page.locator('[data-act="open-changelog"]:visible').first().click();
    await sleep(page, 300);
    item.dialogs.changelog = await page.evaluate(function () {
      var d = document.querySelector('#changelogDialog');
      var r = d.getBoundingClientRect();
      return { width: Math.round(r.width), left: Math.round(r.left), right: Math.round(r.right), height: Math.round(r.height), viewportHeight: window.innerHeight, overflow: document.documentElement.scrollWidth - window.innerWidth };
    });
    assert(item.dialogs.changelog.left >= 0 && item.dialogs.changelog.right <= device.width + 1, failures, device.name + ' / changelog off-screen');
    assert(item.dialogs.changelog.overflow <= 1, failures, device.name + ' / changelog overflow');
    assert(device.name.indexOf('phone') === 0 || item.dialogs.changelog.height <= device.height - 20, failures, device.name + ' / changelog still full-screen');
    await page.locator('[data-act="close-dialog"][data-dialog="changelogDialog"]').first().click();
    await sleep(page, 100);

    // 深色模式：切换主题后首页不溢出。
    await page.evaluate(function () {
      var st = JSON.parse(localStorage.getItem('sanke-cuotiben-v1') || '{}');
      st.prefs = st.prefs || {};
      st.prefs.theme = 'dark';
      localStorage.setItem('sanke-cuotiben-v1', JSON.stringify(st));
    });
    await goto(page, '#/home');
    item.dark = await page.evaluate(function () {
      return { theme: document.documentElement.getAttribute('data-theme') || document.documentElement.className, overflow: document.documentElement.scrollWidth - window.innerWidth };
    });
    assert(item.dark.overflow <= 1, failures, device.name + ' / dark home overflow');

    assert(pageErrors.length === 0, failures, device.name + ' / pageerror: ' + pageErrors[0]);
    report.push(item);
    console.error('device ' + device.name + ' done failures=' + failures.length);
    await context.close();
  }
  await browser.close();
  console.log(JSON.stringify({ url: URL_BASE, report: report, failures: failures }, null, 2));
  if (failures.length) process.exitCode = 1;
})();
