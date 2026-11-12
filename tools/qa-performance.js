'use strict';
/*
 * 性能回归：首屏 FCP/DCL/load、题库切换耗时、JS 堆占用。
 * 用法：PAGE_URL=http://127.0.0.1:4173 node tools/qa-performance.js
 */
const { launchChromium } = require('./browser');
const URL_BASE = process.env.PAGE_URL || 'https://lanzaihua.github.io/';
const LIMITS = { fcp: 8000, dcl: 12000, load: 16000, bankSwitch: 6000, heapMB: 700 };

(async function () {
  const browser = await launchChromium();
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e && e.message || e)));
  await page.goto(URL_BASE + '?v=' + Date.now() + '#/home', { waitUntil: 'load', timeout: 60000 });
  await page.waitForTimeout(500);
  const timing = await page.evaluate(function () {
    var nav = performance.getEntriesByType('navigation')[0] || {};
    var fcp = performance.getEntriesByName('first-contentful-paint')[0];
    return {
      fcp: fcp ? Math.round(fcp.startTime) : null,
      dcl: Math.round(nav.domContentLoadedEventEnd || 0),
      load: Math.round(nav.loadEventEnd || 0),
      heap: performance.memory ? performance.memory.usedJSHeapSize : null
    };
  });
  const started = Date.now();
  await page.evaluate(function () { location.hash = '#/xijing/bank'; });
  await page.waitForSelector('.bank-item', { timeout: 20000 });
  const bankSwitch = Date.now() - started;
  const cards = await page.locator('.bank-item').count();
  const heapMB = timing.heap ? Math.round(timing.heap / 1024 / 1024) : null;
  const problems = [];
  if (timing.fcp === null || timing.fcp > LIMITS.fcp) problems.push('FCP ' + timing.fcp + 'ms > ' + LIMITS.fcp);
  if (timing.dcl > LIMITS.dcl) problems.push('DCL ' + timing.dcl + 'ms > ' + LIMITS.dcl);
  if (timing.load > LIMITS.load) problems.push('load ' + timing.load + 'ms > ' + LIMITS.load);
  if (bankSwitch > LIMITS.bankSwitch) problems.push('bank switch ' + bankSwitch + 'ms > ' + LIMITS.bankSwitch);
  if (heapMB !== null && heapMB > LIMITS.heapMB) problems.push('heap ' + heapMB + 'MB > ' + LIMITS.heapMB);
  if (cards < 1) problems.push('bank cards not rendered');
  if (errors.length) problems.push('pageerror: ' + errors[0]);
  await browser.close();
  const report = { url: URL_BASE, metrics: { ...timing, bankSwitch, cards, heapMB }, limits: LIMITS, problems };
  console.log(JSON.stringify(report, null, 2));
  if (problems.length) process.exitCode = 1;
})();
