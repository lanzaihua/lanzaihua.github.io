'use strict';
const { launchChromium } = require('./browser');
const { startServer } = require('./qa-server');
const axePath = require.resolve('axe-core/axe.min.js');

const seed = {
  version: 1, rev: 0, updatedAt: '2026-11-13T01:00:00.000Z',
  activeSubject: 'gaodai', activeView: 'overview',
  entries: { gaodai: [], shufen: [], jieji: [], xijing: [] },
  notes: { gaodai: [], shufen: [], jieji: [], xijing: [] },
  prefs: { theme: 'auto', autoAi: true, userName: '', lang: 'zh-CN', apiNoticeDismissed: true }
};

(async () => {
  const server = await startServer();
  const browser = await launchChromium();
  const page = await (await browser.newContext({ viewport: { width: 1440, height: 1000 } })).newPage();
  const failures = [];
  try {
    await page.addInitScript(function (payload) {
      try {
        localStorage.setItem('sanke-cuotiben-v1', JSON.stringify(payload));
      } catch (e) { /* ignore */ }
    }, seed);
    const routes = ['/', '/gaodai/overview', '/gaodai/entries', '/gaodai/bank', '/gaodai/templates', '/gaodai/guide', '/final', '/notes'];
    for (const route of routes) {
      await page.goto(server.base + '/?v=' + Date.now() + '#' + route, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(600);
      await page.addScriptTag({ path: axePath });
      const result = await page.evaluate(async () => {
        const r = await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] } });
        return r.violations.map(v => ({ id: v.id, impact: v.impact, nodes: v.nodes.length, help: v.help, target: v.nodes[0] && v.nodes[0].target }));
      });
      console.log(route, JSON.stringify(result));
      for (const v of result) if (v.impact === 'critical' || v.impact === 'serious') failures.push(route + ' ' + v.id + ' x' + v.nodes + ' ' + (v.target || ''));
    }
  } finally {
    await browser.close();
    await server.stop();
  }
  if (failures.length) { console.error('FAIL\n' + failures.join('\n')); process.exit(1); }
  console.log('accessibility QA passed');
})().catch(e => { console.error(e); process.exit(1); });
