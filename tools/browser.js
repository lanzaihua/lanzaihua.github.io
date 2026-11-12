'use strict';
/*
 * 统一浏览器启动：CI 用 Playwright bundled Chromium；Windows 本机可回退 Edge。
 * 可用 PLAYWRIGHT_CHANNEL 指定品牌（msedge/chrome），或 PLAYWRIGHT_EXECUTABLE_PATH。
 */
const { chromium } = require('playwright-core');

async function launchChromium() {
  const attempts = [];
  if (process.env.PLAYWRIGHT_CHANNEL) attempts.push({ channel: process.env.PLAYWRIGHT_CHANNEL });
  if (process.env.PLAYWRIGHT_EXECUTABLE_PATH) attempts.push({ executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH });
  attempts.push({});
  if (process.platform === 'win32' && !process.env.PLAYWRIGHT_CHANNEL) attempts.push({ channel: 'msedge' });
  let last;
  for (const options of attempts) {
    try { return await chromium.launch(Object.assign({ headless: true }, options)); }
    catch (e) { last = e; }
  }
  throw new Error('无法启动浏览器。CI 请先运行 npx playwright-core install --with-deps chromium；Windows 本机可安装 Edge 或设置 PLAYWRIGHT_CHANNEL=msedge。原始错误：' + (last && last.message));
}

module.exports = { launchChromium };
