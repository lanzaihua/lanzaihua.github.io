#!/usr/bin/env node
'use strict';

/**
 * 排版门禁：文字/按钮不顶边框、折叠筛选不留空卡、笔记搜索与页签对齐、
 * 总览操作在手机为 2×2、设置用户名行填满、卡片内距与按钮高度可读。
 * 用法：node tools/qa-ui-polish.js [baseUrl]
 */

const fs = require('fs');
const path = require('path');
const { launchChromium } = require('./browser');

const BASE = process.argv[2] || process.env.PAGE_URL || process.env.BASE_URL || 'http://127.0.0.1:4173';
const WIDTHS = [390, 768, 1440];
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
  finalExam: { date: '2026-12-20', duration: 120, subject: 'gaodai', chapterSel: { gaodai: [] }, sectionSel: {}, items: [], papers: [], done: {} },
  prefs: { theme: 'auto', autoAi: false, userName: '', lang: 'zh-CN', apiNoticeDismissed: true },
  clearEpoch: '2026-10-24-empty-v1'
};

function push(failures, width, message) { failures.push(width + 'px / ' + message); }

async function generic(page, width, failures, label) {
  const data = await page.evaluate(() => {
    const visible = (el) => {
      if (!el || !el.getBoundingClientRect) return false;
      const cs = getComputedStyle(el);
      return cs.display !== 'none' && cs.visibility !== 'hidden' && el.getBoundingClientRect().width > 0;
    };
    const rect = (el) => { const r = el.getBoundingClientRect(); return { l: r.left, r: r.right, t: r.top, b: r.bottom, w: r.width, h: r.height }; };
    const clipped = [];
    document.querySelectorAll('.btn, .filter-clear, .bank-filter-toggle, .note-type-tab, .final-subject-tab').forEach((el) => {
      if (!visible(el)) return;
      const txt = (el.textContent || '').replace(/\s+/g, ' ').trim();
      if (!txt) return;
      const range = document.createRange();
      range.selectNodeContents(el);
      const tr = range.getBoundingClientRect();
      const br = rect(el);
      if (tr.width > 1 && (tr.l < br.l - 1 || tr.r > br.r + 1)) clipped.push({ txt, text: [tr.l, tr.r], btn: [br.l, br.r] });
    });
    const overflow = [...document.querySelectorAll('.main, .page-head, .toolbar, .hero, .note-library-top, .bank-item, .note-books-empty')]
      .filter(visible).filter((el) => el.scrollWidth > el.clientWidth + 1)
      .map((el) => ({ cls: el.className, sw: el.scrollWidth, cw: el.clientWidth }));
    return {
      body: { sw: document.body.scrollWidth, cw: document.body.clientWidth },
      clipped,
      overflow,
      main: (() => { const m = document.querySelector('.main'); return m ? { sw: m.scrollWidth, cw: m.clientWidth } : null; })()
    };
  });
  if (data.body.sw > data.body.cw + 1) push(failures, width, label + ' 页面横向溢出 ' + data.body.sw + '>' + data.body.cw);
  if (data.main && data.main.sw > data.main.cw + 1) push(failures, width, label + ' .main 横向溢出 ' + data.main.sw + '>' + data.main.cw);
  for (const c of data.clipped) push(failures, width, label + ' 按钮文字越出按钮：' + c.txt + ' ' + JSON.stringify(c.text) + ' / ' + JSON.stringify(c.btn));
  for (const o of data.overflow) push(failures, width, label + ' 内部横向溢出：' + o.cls + ' ' + o.sw + '>' + o.cw);
}

async function visit(page, hash, width, failures, label) {
  await page.goto(BASE + '/' + hash, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1200);
  await generic(page, width, failures, label);
}

async function bank(page, width, failures) {
  await visit(page, '#/gaodai/bank', width, failures, '题库');
  const closed = await page.evaluate(() => {
    const t = document.querySelector('.toolbar.bank-filters');
    const f = document.querySelector('.bank-filter-fields');
    if (!t || !f) return null;
    const tr = t.getBoundingClientRect(), fr = f.getBoundingClientRect();
    const cs = getComputedStyle(t);
    return { tw: tr.width, th: tr.height, border: cs.borderTopWidth, bg: cs.backgroundColor, display: cs.display, fields: getComputedStyle(f).display, fh: fr.height };
  });
  if (!closed) { push(failures, width, '题库缺筛选栏'); return; }
  if (width <= 700) {
    if (closed.fields !== 'none') push(failures, width, '题库手机折叠后字段仍显示 ' + closed.fields);
    if (closed.tw > 180) push(failures, width, '题库手机折叠筛选栏仍是空卡 ' + closed.tw + 'px');
    if (closed.th > 56) push(failures, width, '题库手机折叠筛选栏过高 ' + closed.th + 'px');
    if (parseFloat(closed.border) > 0) push(failures, width, '题库手机折叠筛选栏仍有边框');
    await page.click('.bank-filter-toggle');
    await page.waitForTimeout(500);
    const opened = await page.evaluate(() => {
      const t = document.querySelector('.toolbar.bank-filters');
      const f = document.querySelector('.bank-filter-fields');
      const list = document.querySelector('.bank-list');
      return { tw: t.getBoundingClientRect().width, fields: getComputedStyle(f).display, fw: f.getBoundingClientRect().width, lw: list ? list.getBoundingClientRect().width : 0 };
    });
    if (opened.fields === 'none' || opened.fw < 280) push(failures, width, '题库手机展开筛选字段过窄 ' + opened.fw);
    if (opened.lw < 300) push(failures, width, '题库手机展开后题卡列表被挤窄 ' + opened.lw);
    await generic(page, width, failures, '题库展开');
  }
}

async function templates(page, width, failures) {
  await visit(page, '#/gaodai/templates', width, failures, '模板库');
  const d = await page.evaluate(() => {
    const t = document.querySelector('.toolbar.template-filters');
    const c = t && t.querySelector('.filter-clear');
    const n = t && t.querySelector('.count-note');
    const s = t && t.querySelector('.select');
    if (!t || !c || !n || !s) return null;
    const tr = t.getBoundingClientRect(), cr = c.getBoundingClientRect(), nr = n.getBoundingClientRect(), sr = s.getBoundingClientRect();
    const cs = getComputedStyle(c), ts = getComputedStyle(t);
    return { inside: t.contains(n), padL: parseFloat(cs.paddingLeft), padR: parseFloat(cs.paddingRight), countGap: (tr.right - parseFloat(ts.paddingRight)) - nr.right, sw: sr.width, tw: tr.width, cw: cr.width };
  });
  if (!d) { push(failures, width, '模板库缺筛选栏控件'); return; }
  if (!d.inside) push(failures, width, '模板库计数不在筛选栏内');
  if (d.padL < 12 || d.padR < 12) push(failures, width, '模板库清空按钮内距过小 ' + d.padL + '/' + d.padR);
  if (d.cw < 78) push(failures, width, '模板库清空按钮过窄 ' + d.cw);
  if (d.countGap < -1 || d.countGap > 20) push(failures, width, '模板库计数未贴右缘 gap=' + d.countGap.toFixed(1));
  if (d.sw < 180) push(failures, width, '模板库章节下拉过窄 ' + d.sw);
}

async function notes(page, width, failures) {
  await visit(page, '#/notes', width, failures, '笔记库');
  const d = await page.evaluate(() => {
    const input = document.querySelector('.note-library-search input');
    const tab = document.querySelector('.note-type-tab');
    const count = document.querySelector('.note-library-count');
    if (!input || !tab) return null;
    const ir = input.getBoundingClientRect(), tr = tab.getBoundingClientRect();
    return { leftGap: ir.left - tr.left, iw: ir.width, countRight: count ? count.getBoundingClientRect().right : 0, vw: innerWidth };
  });
  if (!d) { push(failures, width, '笔记库缺搜索或页签'); return; }
  if (Math.abs(d.leftGap) > 2) push(failures, width, '笔记搜索与页签左缘错位 ' + d.leftGap.toFixed(1) + 'px');
  if (d.iw < 240) push(failures, width, '笔记搜索框过窄 ' + d.iw);
  if (d.countRight > d.vw) push(failures, width, '笔记计数越出视口');
}

async function overview(page, width, failures) {
  await visit(page, '#/gaodai', width, failures, '总览');
  const d = await page.evaluate(() => {
    const acts = document.querySelector('.hero .page-actions');
    const spans = [...document.querySelectorAll('.hero-meta span')];
    if (!acts) return null;
    const bs = [...acts.querySelectorAll('.btn')].map((b) => { const r = b.getBoundingClientRect(); return { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) }; });
    const xs = [...new Set(bs.map((b) => b.x))], ys = [...new Set(bs.map((b) => b.y))];
    const before = spans.map((s) => getComputedStyle(s, '::before').content).filter((c) => c && c !== 'none' && c !== 'normal' && c !== '""');
    return { n: bs.length, xs: xs.length, ys: ys.length, widths: [...new Set(bs.map((b) => b.w))], before };
  });
  if (!d) { push(failures, width, '总览缺操作按钮'); return; }
  if (d.n < 4) push(failures, width, '总览操作按钮不足 4 个');
  if (width <= 520) {
    if (d.xs !== 2 || d.ys !== 2) push(failures, width, '总览手机操作不是 2×2：x=' + d.xs + ' y=' + d.ys);
    if (d.widths.length > 1 && Math.max(...d.widths) - Math.min(...d.widths) > 2) push(failures, width, '总览手机按钮不等宽 ' + d.widths);
  }
  if (d.before.length) push(failures, width, '总览元信息仍有伪元素分隔点，换行会落行首');
}

async function settings(page, width, failures) {
  await visit(page, '#/gaodai', width, failures, '设置前');
  await page.evaluate(() => { const b = document.querySelector('[data-act="open-settings"]'); if (b) b.click(); });
  await page.waitForTimeout(800);
  const d = await page.evaluate(() => {
    const dlg = document.querySelector('#settings');
    const act = document.querySelector('.setting-row-name .user-name-actions');
    const input = document.querySelector('#userNameInput');
    const save = act && act.querySelector('.btn');
    if (!dlg || !act || !input || !save) return null;
    const ar = act.getBoundingClientRect(), ir = input.getBoundingClientRect(), sr = save.getBoundingClientRect(), dr = dlg.getBoundingClientRect();
    return { actW: ar.width, inputW: ir.width, saveRight: sr.right, actRight: ar.right, dlgW: dr.width, dlgSw: dlg.scrollWidth, dlgCw: dlg.clientWidth };
  });
  if (!d) { push(failures, width, '设置弹窗缺用户名行'); return; }
  if (d.saveRight > d.actRight + 1) push(failures, width, '设置保存按钮越出操作区');
  if (d.dlgSw > d.dlgCw + 1) push(failures, width, '设置弹窗内部横向溢出 ' + d.dlgSw + '>' + d.dlgCw);
  if (width <= 520) {
    if (d.actW < 280) push(failures, width, '设置用户名操作区仍被挤窄 ' + d.actW);
    if (d.inputW < 180) push(failures, width, '设置用户名输入框过窄 ' + d.inputW);
  }
}

(async () => {
  const failures = [];
  const browser = await launchChromium();
  try {
    for (const width of WIDTHS) {
      const context = await browser.newContext({ viewport: { width, height: 1000 }, deviceScaleFactor: 1 });
      await context.addInitScript((s) => localStorage.setItem('sanke-cuotiben-v1', JSON.stringify(s)), seed);
      const page = await context.newPage();
      await page.route('**/api/state', (route) => route.abort());
      await bank(page, width, failures);
      await templates(page, width, failures);
      await notes(page, width, failures);
      await overview(page, width, failures);
      await settings(page, width, failures);
      await visit(page, '#/gaodai/stats', width, failures, '统计');
      await visit(page, '#/gaodai/guide', width, failures, '规范');
      await visit(page, '#/final', width, failures, '期末复习');
      await context.close();
      console.log(width + 'px done failures=' + failures.length);
    }
  } finally { await browser.close(); }

  const outDir = path.join(__dirname, '..', 'debug');
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'qa-ui-polish.json'), JSON.stringify({ ok: failures.length === 0, widths: WIDTHS, failures }, null, 2));
  if (failures.length) {
    console.error('UI polish QA failed:');
    for (const f of failures) console.error(' - ' + f);
    process.exitCode = 1;
  } else {
    console.log('UI polish QA passed: ' + WIDTHS.join('/') + ' layout, spacing and alignment are clean.');
  }
})().catch((err) => { console.error(err && err.stack || err); process.exitCode = 1; });
