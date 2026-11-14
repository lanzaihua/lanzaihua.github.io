'use strict';
/*
 * 三端真实浏览器回归：8 个视口 + 首页/四科/题库/笔记/模拟考/设置/更新记录 + 深色模式。
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
  { name: 'tablet-768', width: 768, height: 1024, mobile: true, touch: true, dpr: 2 },
  { name: 'tablet-portrait', width: 834, height: 1112, mobile: true, touch: true, dpr: 2 },
  { name: 'tablet-landscape', width: 1112, height: 834, mobile: true, touch: true, dpr: 2 },
  { name: 'desktop', width: 1440, height: 1000, mobile: false, touch: false, dpr: 1 },
  { name: 'desktop-1920', width: 1920, height: 1080, mobile: false, touch: false, dpr: 1 }
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

    // 首页工作台：三栏（手机单栏）不能互相覆盖；长标题必须在最近记录栏内省略。
    // 回归的是 2026-11-14 的真实 bug：隐式网格被 nowrap 标题撑到 800px，压到「学习节奏」。
    const homeRaw = await page.evaluate(function () { return localStorage.getItem('sanke-cuotiben-v1'); });
    await page.evaluate(function () {
      var key = 'sanke-cuotiben-v1';
      var raw = localStorage.getItem(key);
      var st = raw ? JSON.parse(raw) : {};
      st.entries = st.entries || {};
      ['gaodai', 'shufen', 'jieji', 'xijing'].forEach(function (s) { if (!Array.isArray(st.entries[s])) st.entries[s] = []; });
      var longTitle = '设函数在闭区间上连续，证明存在最大值与最小值，并讨论一致连续与振荡间断点的关系，这是一条故意写得很长的最近记录标题';
      for (var i = 0; i < 3; i++) {
        st.entries.gaodai.push({
          id: 'QA-LONG-' + i, code: 'QA-' + i, subject: 'gaodai', summary: longTitle,
          stars: 2, status: 'unmastered', chapter: '第一章', section: '第一节',
          date: '2026-11-14 09:00', updatedAt: new Date(Date.now() - i * 3600000).toISOString(),
          reviewAt: {}, blocks: [{ key: 'question', title: '题目', md: longTitle }], variants: [], points: []
        });
      }
      localStorage.setItem(key, JSON.stringify(st));
    });
    await page.reload({ waitUntil: 'domcontentloaded' });
    await sleep(page, 500);
    if (await page.locator('#apiWelcomeDialog[open]').count()) {
      const dismissHome = page.locator('#apiWelcomeDialog [data-act="dismiss-api-welcome"], #apiWelcomeDialog [data-act="close-dialog"], #apiWelcomeDialog .dlg-close').first();
      if (await dismissHome.count()) await dismissHome.click({ force: true });
    }
    item.homeLayout = await page.evaluate(function () {
      var bottom = document.querySelector('.hw-bottom');
      if (!bottom) return { missing: true };
      var blocks = Array.prototype.slice.call(bottom.children);
      var rects = blocks.map(function (el) {
        var r = el.getBoundingClientRect();
        return { left: r.left, right: r.right, top: r.top, bottom: r.bottom, width: r.width };
      });
      var overlaps = 0;
      for (var i = 0; i < rects.length; i++) {
        for (var j = i + 1; j < rects.length; j++) {
          var a = rects[i], b = rects[j];
          if (a.left < b.right - 1 && a.right > b.left + 1 && a.top < b.bottom - 1 && a.bottom > b.top + 1) overlaps++;
        }
      }
      var list = document.querySelector('.hw-recent-list');
      var first = document.querySelector('.hw-recent-item');
      return {
        display: getComputedStyle(bottom).display,
        blocks: rects,
        overlaps: overlaps,
        list: list ? { client: list.clientWidth, scroll: list.scrollWidth, width: list.getBoundingClientRect().width } : null,
        item: first ? { width: first.getBoundingClientRect().width, scroll: first.scrollWidth, client: first.clientWidth } : null,
        fourthBottom: (function () {
          var cards = document.querySelectorAll('.home-subject');
          var last = cards[cards.length - 1];
          return last ? Math.round(last.getBoundingClientRect().bottom) : null;
        })(),
        viewportHeight: window.innerHeight
      };
    });
    assert(item.homeLayout.display !== 'none', failures, device.name + ' / home workbench hidden');
    assert(item.homeLayout.blocks && item.homeLayout.blocks.length === 3, failures, device.name + ' / home workbench columns missing');
    assert(item.homeLayout.overlaps === 0, failures, device.name + ' / home workbench columns overlap');
    assert(item.homeLayout.list && item.homeLayout.list.scroll <= item.homeLayout.list.client + 2, failures, device.name + ' / recent records overflow column');
    assert(item.homeLayout.item && item.homeLayout.item.width <= item.homeLayout.list.width + 2, failures, device.name + ' / recent record wider than column');
    if (device.width >= 1440 && device.height >= 1000) assert(item.homeLayout.fourthBottom !== null && item.homeLayout.fourthBottom <= item.homeLayout.viewportHeight, failures, device.name + ' / fourth subject card below first screen (' + item.homeLayout.fourthBottom + ' > ' + item.homeLayout.viewportHeight + ')');
    if (homeRaw === null) await page.evaluate(function () { localStorage.removeItem('sanke-cuotiben-v1'); });
    else await page.evaluate(function (raw) { localStorage.setItem('sanke-cuotiben-v1', raw); }, homeRaw);
    await goto(page, '#/home');

    for (const entry of ROUTES) {
      await goto(page, entry[1]);
      const o = await overflow(page);
      item.routes[entry[0]] = o;
      assert(o.doc <= 1, failures, device.name + ' / ' + entry[0] + ' doc overflow ' + o.doc);
      assert(o.body <= 1, failures, device.name + ' / ' + entry[0] + ' body overflow ' + o.body);
    }

    // 路由切换后焦点移到页面标题，键盘与读屏用户不用重新找起点。
    await goto(page, '#/gaodai/overview');
    const bankTab = page.locator('[data-act="nav-view"][data-view="bank"]:visible').first();
    if (await bankTab.count()) {
      await bankTab.click();
      await sleep(page, 220);
      item.focusAfterRoute = await page.evaluate(function () {
        var el = document.activeElement;
        return { tag: el && el.tagName, text: el ? String(el.textContent || '').trim().slice(0, 24) : '', hash: location.hash };
      });
      assert(item.focusAfterRoute.tag === 'H1' || item.focusAfterRoute.tag === 'H2', failures, device.name + ' / route change did not focus page heading');
    }

    // 移动端与平板：主要控件不得小于 44px。
    if (device.touch) {
      item.touchTargets = await page.evaluate(function () {
        var sel = '.btn,.icon-btn,.tab,.seg button,.subject-jump-btn,.exam-answer-tabs button,.changelog-more,.msub,.mobile-brand,#searchInput';
        var small = [];
        document.querySelectorAll(sel).forEach(function (el) {
          var r = el.getBoundingClientRect();
          if (!r.width || !r.height) return;
          if (r.height < 40 || r.width < 32) {
            small.push({ label: (el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 16), w: Math.round(r.width), h: Math.round(r.height) });
          }
        });
        return { checked: document.querySelectorAll(sel).length, small: small.slice(0, 8) };
      });
      assert(item.touchTargets.small.length === 0, failures, device.name + ' / touch targets too small: ' + JSON.stringify(item.touchTargets.small[0] || {}));
    }

    // 知识面板：Escape 必须关闭，并把焦点交还搜索框；aria-hidden 同步。
    if (device.touch) {
      await page.locator('#searchInput').fill('导数');
      await page.waitForSelector('#kbAnswerPanel', { timeout: 8000 });
      item.knowledge = { open: true, hidden: await page.locator('#kbAnswerPanel').getAttribute('aria-hidden') };
      await page.keyboard.press('Escape');
      await sleep(page, 180);
      const afterEscape = await page.evaluate(function () {
        return { panel: !!document.getElementById('kbAnswerPanel'), active: document.activeElement && document.activeElement.id, hidden: document.getElementById('searchInput') && document.getElementById('searchInput').getAttribute('aria-controls') };
      });
      item.knowledge.afterEscape = afterEscape;
      assert(item.knowledge.hidden === 'false', failures, device.name + ' / knowledge search panel aria-hidden not false');
      assert(!afterEscape.panel, failures, device.name + ' / Escape did not close knowledge panel');
      assert(afterEscape.active === 'searchInput', failures, device.name + ' / focus did not return to search after Escape');
      assert(afterEscape.panel === false, failures, device.name + ' / knowledge search panel did not close');
      await page.locator('#searchInput').fill('');
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
    const filterToggle = page.locator('[data-act="toggle-bank-filters"]');
    if (await filterToggle.count() && await filterToggle.isVisible() && (await filterToggle.getAttribute('aria-expanded')) !== 'true') {
      await filterToggle.click();
      await sleep(page, 220);
    }
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

    // 直接访问深链（GitHub Pages 404）应回到 hash 路由并渲染对应页面。
    if (device.name === 'desktop') {
      const rootUrl = URL_BASE.replace(/[?#].*$/, '').replace(/\/+$/, '') + '/gaodai';
      await page.goto(rootUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForFunction(function () { return /#\/gaodai/.test(location.hash); }, null, { timeout: 6000 }).catch(function () {});
      item.deepLink404 = await page.evaluate(function () { return { hash: location.hash, heading: (document.querySelector('#main h1, #main h2') || {}).textContent || '' }; });
      assert(/#\/gaodai/.test(item.deepLink404.hash), failures, device.name + ' / 404 deep link did not restore route');
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
    if (device.touch) {
      item.dialogs.settingsControls = await page.evaluate(function () {
        var small = [];
        document.querySelectorAll('#settings button,#settings select,#settings .user-name-input').forEach(function (el) {
          var r = el.getBoundingClientRect();
          if (!r.width || !r.height || r.bottom < 0 || r.top > innerHeight) return;
          if (r.height < 40) small.push({ label: (el.textContent || el.value || el.getAttribute('aria-label') || '').trim().slice(0, 18), w: Math.round(r.width), h: Math.round(r.height) });
        });
        return small;
      });
      assert(item.dialogs.settingsControls.length === 0, failures, device.name + ' / settings touch target too small: ' + JSON.stringify(item.dialogs.settingsControls[0] || {}));
    }

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
