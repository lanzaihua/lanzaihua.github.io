'use strict';
/*
 * 三端适配回归：手机 / 平板（竖屏 + 横屏）/ 电脑
 * 用法：node tools/qa-responsive.js
 * 可选：PAGE_URL=... node tools/qa-responsive.js
 */
const { chromium } = require('playwright-core');

const URL_BASE = process.env.PAGE_URL || 'https://lanzaihua.github.io/';
const DEVICES = [
  { name: 'phone', width: 390, height: 844, mobile: true, touch: true, dpr: 2 },
  { name: 'tablet-portrait', width: 834, height: 1112, mobile: true, touch: true, dpr: 2 },
  { name: 'tablet-landscape', width: 1112, height: 834, mobile: true, touch: true, dpr: 2 },
  { name: 'desktop', width: 1440, height: 1000, mobile: false, touch: false, dpr: 1 }
];
const ROUTES = [
  ['home', '#/home'],
  ['overview', '#/gaodai/overview'],
  ['entries', '#/gaodai/entries'],
  ['templates', '#/gaodai/templates'],
  ['bank', '#/gaodai/bank'],
  ['guide', '#/gaodai/guide'],
  ['notes', '#/notes']
];

function assert(cond, failures, label) { if (!cond) failures.push(label); }

async function pageOverflow(page) {
  return page.evaluate(function () {
    return {
      doc: document.documentElement.scrollWidth - window.innerWidth,
      body: document.body.scrollWidth - window.innerWidth
    };
  });
}

(async function () {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const report = [];
  const failures = [];
  for (const device of DEVICES) {
    const context = await browser.newContext({
      viewport: { width: device.width, height: device.height },
      deviceScaleFactor: device.dpr,
      isMobile: device.mobile,
      hasTouch: device.touch
    });
    const page = await context.newPage();
    const item = { device: device.name, viewport: device.width + 'x' + device.height, routes: {}, dialogs: {} };
    for (const [name, hash] of ROUTES) {
      await page.goto(URL_BASE + '?v=' + Date.now() + hash, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await page.waitForTimeout(350);
      const overflow = await pageOverflow(page);
      item.routes[name] = overflow;
      assert(overflow.doc <= 1, failures, device.name + ' / ' + name + ' doc overflow ' + overflow.doc);
      assert(overflow.body <= 1, failures, device.name + ' / ' + name + ' body overflow ' + overflow.body);
    }

    await page.goto(URL_BASE + '?v=' + Date.now() + '#/home', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(300);
    await page.locator('[data-act="open-settings"]:visible').first().click();
    await page.waitForTimeout(300);
    item.dialogs.settings = await page.evaluate(function () {
      var d = document.querySelector('#settings');
      var r = d.getBoundingClientRect();
      return {
        width: Math.round(r.width), left: Math.round(r.left), right: Math.round(r.right),
        sections: document.querySelectorAll('.settings-section').length,
        overflow: document.documentElement.scrollWidth - window.innerWidth
      };
    });
    assert(item.dialogs.settings.left >= 0 && item.dialogs.settings.right <= device.width + 1, failures, device.name + ' / settings off-screen');
    assert(item.dialogs.settings.sections === 4, failures, device.name + ' / settings sections');
    assert(item.dialogs.settings.overflow <= 1, failures, device.name + ' / settings overflow');

    await page.locator('[data-act="close-dialog"][data-dialog="settings"]').first().click();
    await page.waitForTimeout(200);
    await page.locator('[data-act="open-changelog"]:visible').first().click();
    await page.waitForTimeout(300);
    item.dialogs.changelog = await page.evaluate(function () {
      var d = document.querySelector('#changelogDialog');
      var r = d.getBoundingClientRect();
      return {
        width: Math.round(r.width), left: Math.round(r.left), right: Math.round(r.right),
        meta: (document.querySelector('.changelog-meta') || {}).innerText || '',
        height: Math.round(r.height), viewportHeight: window.innerHeight,
        columns: getComputedStyle(document.querySelector('.changelog-recent .changelog-groups')).columnCount,
        overflow: document.documentElement.scrollWidth - window.innerWidth
      };
    });
    assert(item.dialogs.changelog.left >= 0 && item.dialogs.changelog.right <= device.width + 1, failures, device.name + ' / changelog off-screen');
    assert(item.dialogs.changelog.overflow <= 1, failures, device.name + ' / changelog overflow');
    assert(device.name === 'phone' || item.dialogs.changelog.height <= device.height - 20, failures, device.name + ' / changelog still full-screen');

    await page.locator('[data-act="close-dialog"][data-dialog="changelogDialog"]').first().click();
    await page.waitForTimeout(150);
    await page.goto(URL_BASE + '?v=' + Date.now() + '#/gaodai/guide', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(300);
    item.dialogs.guide = await page.evaluate(function () {
      var layout = document.querySelector('.guide-layout');
      return {
        aside: !!document.querySelector('.guide-aside'),
        cards: document.querySelectorAll('.guide-card').length,
        columns: getComputedStyle(layout).gridTemplateColumns,
        overflow: document.documentElement.scrollWidth - window.innerWidth
      };
    });
    assert(item.dialogs.guide.aside && item.dialogs.guide.cards === 3, failures, device.name + ' / guide aside');
    assert(item.dialogs.guide.overflow <= 1, failures, device.name + ' / guide overflow');

    report.push(item);
    await context.close();
  }
  await browser.close();
  console.log(JSON.stringify({ url: URL_BASE, report: report, failures: failures }, null, 2));
  if (failures.length) process.exitCode = 1;
})();
