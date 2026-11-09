'use strict';
const { chromium } = require('playwright-core');
const path = require('path');
(async function () {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const dir = path.join(__dirname, '..', 'screenshots');
  const errs = [];
  const base = 'http://127.0.0.1:4173/';
  async function open(vp) {
    const ctx = await browser.newContext({ viewport: vp, isMobile: vp.width < 500, hasTouch: vp.width < 500, deviceScaleFactor: 1 });
    await ctx.addInitScript(function () { localStorage.setItem('sanke-sync-token', 'ctb-9f3k2m7q'); });
    const page = await ctx.newPage();
    page.on('pageerror', function (e) { errs.push(e.message); });
    page.on('console', function (m) { if (m.type() === 'error' && m.text().indexOf('409') < 0) errs.push(m.text()); });
    await page.goto(base, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    await page.addStyleTag({ content: '.toast-wrap,.skip{display:none!important}' });
    return page;
  }
  const d = await open({ width: 1440, height: 1000 });
  await d.evaluate(function(){ window.scrollTo(0,0); if (document.activeElement) document.activeElement.blur(); });
  await d.screenshot({ path: path.join(dir, 'desktop-overview.png'), fullPage: true });

  // shufen entry with math in related titles
  await d.locator('[data-act="nav-subject"][data-subject="shufen"]').first().click();
  await d.waitForTimeout(300);
  await d.locator('[data-act="nav-view"][data-view="entries"]').first().click();
  await d.waitForTimeout(300);
  await d.locator('.entry-head').first().click();
  await d.waitForTimeout(600);
  await d.screenshot({ path: path.join(dir, 'entry-analysis.png'), fullPage: true });

  // jieji overview + bank
  await d.locator('[data-act="nav-subject"][data-subject="jieji"]').first().click();
  await d.waitForTimeout(300);
  await d.locator('[data-act="nav-view"][data-view="overview"]').first().click();
  await d.waitForTimeout(300);
  await d.screenshot({ path: path.join(dir, 'overview-geometry.png'), fullPage: true });
  await d.locator('[data-act="nav-view"][data-view="bank"]').first().click();
  await d.waitForTimeout(300);
  await d.locator('[data-act="toggle-bank-answer"]').filter({ hasText: '显示答案' }).first().click();
  await d.waitForTimeout(400);
  await d.screenshot({ path: path.join(dir, 'bank-geometry.png'), fullPage: false });

  // dark mode clean
  await d.locator('[data-act="nav-subject"][data-subject="gaodai"]').first().click();
  await d.waitForTimeout(300);
  await d.locator('[data-act="nav-view"][data-view="overview"]').first().click();
  await d.waitForTimeout(300);
  await d.locator('.top-actions [data-act="open-settings"]').first().click();
  await d.waitForTimeout(400);
  await d.locator('[data-act="set-theme"][data-theme="dark"]').click();
  await d.waitForTimeout(300);
  await d.locator('[data-act="close-dialog"][data-dialog="settings"]').first().click();
  await d.waitForTimeout(500);
  await d.evaluate(function(){ window.scrollTo(0,0); if (document.activeElement) document.activeElement.blur(); });
  await d.screenshot({ path: path.join(dir, 'desktop-dark.png'), fullPage: true });
  // restore auto theme
  await d.locator('.top-actions [data-act="open-settings"]').first().click();
  await d.waitForTimeout(300);
  await d.locator('[data-act="set-theme"][data-theme="auto"]').click();
  await d.waitForTimeout(200);
  await d.locator('[data-act="close-dialog"][data-dialog="settings"]').first().click();

  const m = await open({ width: 390, height: 844 });
  await m.evaluate(function(){ window.scrollTo(0,0); if (document.activeElement) document.activeElement.blur(); });
  await m.screenshot({ path: path.join(dir, 'mobile-overview.png'), fullPage: true });
  await m.locator('[data-act="nav-view"][data-view="entries"]').first().click();
  await m.waitForTimeout(300);
  await m.locator('.entry-head').first().click();
  await m.waitForTimeout(500);
  await m.evaluate(function(){ window.scrollTo(0,0); });
  await m.screenshot({ path: path.join(dir, 'mobile-entry.png'), fullPage: true });

  console.log(JSON.stringify({ errors: errs }));
  await browser.close();
})().catch(function (e) { console.error(e); process.exit(1); });
