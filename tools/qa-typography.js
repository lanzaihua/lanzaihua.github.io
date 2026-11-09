'use strict';
/* 10.30 typography regression: every translated language must keep terms and inline spacing clean. */
const { chromium } = require('playwright-core');
const fs = require('node:fs');
const path = require('node:path');
const { startServer } = require('./qa-server');

const i18nSource = fs.readFileSync(path.join(__dirname, '..', 'src', 'js', '52-i18n.js'), 'utf8');
const keyMatch = i18nSource.match(/I18N_KEY\s*=\s*'([^']+)'/);
const I18N_KEY = keyMatch ? keyMatch[1] : 'sanke-i18n-cache-v11';

const EXPECTED = {
  en: 'Adv. Algebra', fr: 'Alg. av.', de: 'Höhere Alg.', ja: '線形代数',
  ko: '고급 대수', pt: 'Álg. Av.', ru: 'Высш. алг.', es: 'Álg. Av.', 'zh-TW': '高代'
};
const SPACED = ['en', 'fr', 'de', 'ko', 'pt', 'ru', 'es'];
const CACHE = {
  '极大无关组与秩（定理 3）': 'Maximal linearly independent set and rank (Theorem 3)',
  '第三章 线性方程组 · §3 线性相关与线性无关': 'Chapter 3 Systems of Linear Equations · §3 Linear Dependence and Independence',
  '高代': 'Higher Algebra',
  '教材 P107 习题3 第7题': 'Textbook, p. 107, Exercise 3, Problem 7',
  '定理 2 推论 1（可表出 + 无关 ⇒ 个数 ≤ r）': 'Theorem 2, Corollary 1 (expressible + independent ⇒ number ≤ r)',
  '这道题现在会了吗？': 'Can you solve this problem now?',
  '：少复习一次；': ': review it one fewer time;',
  '：继续排进复习。': ': keep it scheduled for review.'
};

function seedFor(lang) {
  return {
    version: 1, rev: 0, updatedAt: '2026-11-08T01:00:00.000Z',
    activeSubject: 'gaodai', activeView: 'entries',
    entries: {
      gaodai: [{
        id: 'typography-test', code: 'A-001', subject: 'gaodai',
        title: '极大无关组与秩（定理 3）', summary: '极大无关组与秩（定理 3）',
        date: '2026-10-21 22:20 星期三', chapter: '第三章 线性方程组',
        section: '§3 线性相关与线性无关', source: '教材 P107 习题3 第7题',
        points: ['极大无关组与秩（定理 3）', '定理 2 推论 1（可表出 + 无关 ⇒ 个数 ≤ r）'],
        errorTypes: [], status: 'unmastered', blocks: [], variants: [],
        review: { d1: false, d3: false, d7: false, d15: false, d30: false },
        createdAt: '2026-10-21T22:20:00+08:00', updatedAt: '2026-10-21T22:20:00+08:00'
      }],
      shufen: [], jieji: [], xijing: []
    },
    notes: { gaodai: [], shufen: [], jieji: [], xijing: [] },
    prefs: { theme: 'auto', autoAi: true, userName: '', lang: lang, apiNoticeDismissed: true }
  };
}

(async () => {
  const server = await startServer();
  const base = server.base;
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const failures = [];
  try {
    for (const lang of Object.keys(EXPECTED)) {
      const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
      await ctx.addInitScript(function (payload) {
        try {
          if (!localStorage.getItem('qa-seeded')) {
            localStorage.setItem('sanke-cuotiben-v1', JSON.stringify(payload.state));
            localStorage.setItem('qa-seeded', '1');
          }
          localStorage.setItem(payload.cacheKey, JSON.stringify(payload.cache));
        } catch (e) { /* ignore */ }
      }, { state: seedFor(lang), cacheKey: I18N_KEY, cache: { [lang]: CACHE } });
      const page = await ctx.newPage();
      await page.goto(base + '/#/gaodai/entries', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1400);
      if (await page.locator('#apiWelcomeDialog[open]').count()) {
        const btn = page.locator('[data-act="dismiss-api-welcome"]').first();
        if (await btn.count()) await btn.click();
        await page.waitForTimeout(150);
      }
      await page.locator('.entry-head').first().click();
      await page.waitForTimeout(1200);
      const t = await page.evaluate(() => {
        const card = document.querySelector('.entry');
        return {
          code: card.querySelector('.entry-code')?.innerText || '',
          title: card.querySelector('.entry-title')?.innerText || '',
          meta: card.querySelector('.entry-meta')?.innerText || '',
          mastery: card.querySelector('.mastery-bar')?.innerText || ''
        };
      });
      const fail = (label) => failures.push(lang + ': ' + label);
      if (t.code.indexOf(EXPECTED[lang]) < 0) fail('short subject label');
      if (/Higher Algebra|linear-algebra/.test(JSON.stringify(t))) fail('old/unprofessional term');
      if (SPACED.indexOf(lang) >= 0) {
        if (!/\?\s+\S/.test(t.mastery)) fail('space after question mark');
        if (!/;\s+\S/.test(t.mastery)) fail('space after semicolon');
        if (/\?\p{L}|;\p{L}/u.test(t.mastery)) fail('inline glue');
        if (!/Chapter 3:/.test(t.meta)) fail('chapter colon');
        if (!/§ 3/.test(t.meta) || /§3/.test(t.meta)) fail('section spacing');
        if (!/Maximal linearly independent subset/.test(t.title)) fail('maximal subset term');
      }
      console.log(lang, JSON.stringify({ code: t.code, mastery: t.mastery }));
      await ctx.close();
    }
  } finally {
    await browser.close();
    await server.stop();
  }
  console.log('failures', JSON.stringify(failures));
  if (failures.length) process.exitCode = 1;
})();
