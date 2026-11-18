#!/usr/bin/env node
'use strict';

/**
 * 排版门禁：文字/按钮不顶边框、折叠筛选不留空卡、笔记搜索与页签对齐、期末计划/出卷留白与 2 列网格、
 * 总览操作在手机为 2×2、设置用户名行填满、卡片内距与按钮高度可读。
 * 用法：node tools/qa-ui-polish.js [baseUrl]
 */

const fs = require('fs');
const path = require('path');
const { launchChromium } = require('./browser');

const BASE = process.argv[2] || process.env.PAGE_URL || process.env.BASE_URL || 'http://127.0.0.1:4173';
const WIDTHS = [360, 390, 768, 1440];
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
    return { inside: t.contains(n), padL: parseFloat(cs.paddingLeft), padR: parseFloat(cs.paddingRight), countGap: (tr.right - parseFloat(ts.paddingRight)) - nr.right, sw: sr.width, tw: tr.width, cw: cr.width, countLeft: nr.left, clearLeft: cr.left, sameRow: Math.abs((nr.top + nr.bottom) / 2 - (cr.top + cr.bottom) / 2) < 8, mainW: (document.querySelector('.main') || { clientWidth: tr.width }).clientWidth, mainInner: (function(){ var m=document.querySelector('.main'); if(!m) return tr.width; var ms=getComputedStyle(m); return m.clientWidth - (parseFloat(ms.paddingLeft)||0) - (parseFloat(ms.paddingRight)||0); })() };
  });
  if (!d) { push(failures, width, '模板库缺筛选栏控件'); return; }
  if (!d.inside) push(failures, width, '模板库计数不在筛选栏内');
  if (d.padL < 12 || d.padR < 12) push(failures, width, '模板库清空按钮内距过小 ' + d.padL + '/' + d.padR);
  if (d.cw < 78) push(failures, width, '模板库清空按钮过窄 ' + d.cw);
  if (width > 520 && (d.countGap < -1 || d.countGap > 20)) push(failures, width, '模板库计数未贴右缘 gap=' + d.countGap.toFixed(1));
  if (d.sw < 180) push(failures, width, '模板库章节下拉过窄 ' + d.sw);
  if (width >= 900 && d.tw > 640) push(failures, width, '模板库筛选栏在桌面留出大片空卡 ' + d.tw);
  if (width <= 520 && d.tw < d.mainInner - 2) push(failures, width, '模板库筛选栏未铺满手机内容区 ' + d.tw + '/' + d.mainInner);
  if (width <= 520 && !d.sameRow) push(failures, width, '模板库计数与清空按钮不在同一行');
  if (width <= 520 && d.countLeft > d.clearLeft - 10) push(failures, width, '模板库手机计数未排在清空按钮左侧');
}

async function notes(page, width, failures) {
  await visit(page, '#/notes', width, failures, '笔记库');
  const d = await page.evaluate(() => {
    const input = document.querySelector('.note-library-search input');
    const tab = document.querySelector('.note-type-tab');
    const count = document.querySelector('.note-library-count');
    if (!input || !tab) return null;
    const ir = input.getBoundingClientRect(), tr = tab.getBoundingClientRect();
    function splitWord(sel, word) {
      const root = document.querySelector(sel); if (!root) return false;
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      let node;
      while ((node = walker.nextNode())) {
        const idx = node.nodeValue.indexOf(word);
        if (idx < 0) continue;
        const range = document.createRange(); range.setStart(node, idx); range.setEnd(node, idx + word.length);
        const tops = new Set([...range.getClientRects()].filter(r => r.width > 0).map(r => Math.round(r.top)));
        return tops.size > 1;
      }
      return false;
    }
    return { leftGap: ir.left - tr.left, iw: ir.width, countRight: count ? count.getBoundingClientRect().right : 0, vw: innerWidth, splitKnowledge: splitWord('.note-library-head .page-sub', '知识笔记'), splitScan: splitWord('.note-library-head .page-sub', '扫描') };
  });
  if (!d) { push(failures, width, '笔记库缺搜索或页签'); return; }
  if (d.splitKnowledge) push(failures, width, '笔记库标题把「知识笔记」拆到两行');
  if (d.splitScan) push(failures, width, '笔记库标题把「扫描」拆到两行');
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

async function reading(page, width, failures) {
  await visit(page, '#/', width, failures, '首页');
  // 线上首访可能还在加载拆包题库或等待 Service Worker，先等首页骨架出现，避免把加载慢误判成缺页脚。
  await page.waitForSelector('.hw-topbar p', { timeout: 8000 }).catch(() => {});
  const home = await page.evaluate(() => {
    const p = document.querySelector('.hw-topbar p');
    const nb = document.querySelector('.hw-nobreak');
    const feat = document.querySelector('.home-features');
    const foot = document.querySelector('.home-foot');
    const title = document.querySelector('.home-title');
    if (!p || !feat || !foot || !title) return null;
    const pcs = getComputedStyle(p), ncs = nb ? getComputedStyle(nb) : null;
    const uniform = !ncs || ['fontFamily','fontSize','fontWeight','color','letterSpacing','lineHeight'].every((k) => ncs[k] === pcs[k]);
    const titleWeight = parseFloat(getComputedStyle(title).fontWeight) || 0;
    const range = document.createRange(); range.selectNodeContents(p);
    const rows = [];
    for (const r of range.getClientRects()) {
      if (r.width <= 0) continue;
      let row = rows.find((x) => Math.abs(x.t - r.top) < 10);
      if (!row) rows.push((row = { t: r.top, l: r.left, r: r.right }));
      else { row.l = Math.min(row.l, r.left); row.r = Math.max(row.r, r.right); }
    }
    return {
      lines: Math.round(p.getBoundingClientRect().height / (parseFloat(getComputedStyle(p).lineHeight) || 21)),
      lastLine: rows.length ? rows[rows.length - 1].r - rows[rows.length - 1].l : 0,
      nbRects: nb ? nb.getClientRects().length : 0,
      uniform,
      titleWeight,
      dot: getComputedStyle(document.querySelector('.home-features span:not(:last-child)'), '::after').content,
      footGap: Math.round(foot.getBoundingClientRect().top - feat.getBoundingClientRect().bottom)
    };
  });
  if (!home) { push(failures, width, '首页缺工作台或页脚'); return; }
  if (width >= 761 && home.lines !== 1) push(failures, width, '首页工作台说明在桌面被无故换行，行数 ' + home.lines);
  if (width <= 760 && home.lines > 2) push(failures, width, '首页工作台说明在手机超过两行，行数 ' + home.lines);
  if (home.nbRects !== 1) push(failures, width, '首页说明末句仍被拆行 nbRects=' + home.nbRects);
  if (!home.uniform) push(failures, width, '首页说明末句字体/字号/字色与正文不一致');
  if (home.titleWeight < 700) push(failures, width, '首页问候标题字重不足 700');
  if (home.lastLine < 80) push(failures, width, '首页说明末行过短 ' + home.lastLine.toFixed(1) + 'px');
  if (home.dot && home.dot !== 'none' && home.dot !== 'normal' && home.dot !== '\"\"') push(failures, width, '首页功能条仍有重复分隔点');
  if (home.footGap < 24 || home.footGap > 52) push(failures, width, '首页功能条与页脚间距异常 ' + home.footGap + 'px');

  await visit(page, '#/gaodai/guide', width, failures, '规范');
  const tiles = await page.evaluate(() => [...document.querySelectorAll('.guide-facts b')].map((b) => b.textContent.trim()));
  if (tiles.join(',') !== '01,02,05,20–32') push(failures, width, '规范速览顺序不连贯：' + tiles.join(','));
  const guideWord = await page.evaluate(() => { const s = document.querySelector('.guide-panel-lead .page-nb'); if (!s) return 0; return new Set([...s.getClientRects()].filter(r => r.width > 0).map(r => Math.round(r.top))).size; });
  if (guideWord > 1) push(failures, width, '规范说明把「1 / 3 / 7 天起步」拆到两行');

  await visit(page, '#/gaodai/stats', width, failures, '统计');
  const lede = await page.evaluate(() => (document.querySelector('.folio-lede') || {}).textContent || '');
  if (!lede.includes('最近 30 天') || lede.includes('最近两周')) push(failures, width, '统计说明的时间口径与「近 30 天」不一致');

  await visit(page, '#/final', width, failures, '期末复习');
  const plan = await page.evaluate(() => {
    const note = document.querySelector('.final-subject-note');
    const tabs = document.querySelector('.final-subject-tabs');
    const count = document.querySelector('.fcf-count');
    const sub = document.querySelector('.final-page .page-sub');
    if (!note || !tabs || !count || !sub) return null;
    const nr = note.getBoundingClientRect(), tr = tabs.getBoundingClientRect();
    const range = document.createRange(); range.selectNodeContents(sub);
    const rows = [];
    for (const r of range.getClientRects()) {
      if (r.width <= 0) continue;
      let row = rows.find((x) => Math.abs(x.t - r.top) < 10);
      if (!row) rows.push((row = { t: r.top, w: r.width }));
      else row.w = Math.max(row.w, r.width);
    }
    const maxW = Math.max.apply(null, rows.map((x) => x.w));
    return {
      noteInTabs: note.parentElement === tabs,
      noteOnRow: nr.top >= tr.top - 1 && nr.bottom <= tr.bottom + 1,
      count: (count.textContent || '').trim(),
      noteText: (note.textContent || '').trim(),
      lines: rows.length,
      lastRatio: rows.length ? rows[rows.length - 1].w / (maxW || 1) : 0,
      balanced: getComputedStyle(sub).textWrap === 'balance'
    };
  });
  if (!plan) { push(failures, width, '期末复习缺科目/章节/说明'); return; }
  if (!plan.noteInTabs) push(failures, width, '期末复习科目说明不在科目栏内，仍单独占一行');
  if (plan.noteText !== '复习计划只使用当前科目的章节与知识点，不混合科目。') push(failures, width, '期末复习计划科目说明文不对题：' + plan.noteText);
  if (width >= 761 && !plan.noteOnRow) push(failures, width, '期末复习科目说明在桌面未与科目同一行');
  if (plan.count !== '全部章节') push(failures, width, '期末复习未选章节时计数文案不是「全部章节」：' + plan.count);
  if (!plan.balanced) push(failures, width, '期末复习说明没有启用平衡换行');
  if (plan.lastRatio < 0.55) push(failures, width, '期末复习说明末行过短，末行/最长行 ' + plan.lastRatio.toFixed(2));
}


async function finalLayout(page, width, failures) {
  await page.waitForSelector('.final-plan-panel', { timeout: 8000 }).catch(() => {});
  const plan = await page.evaluate(() => {
    const rect = (el) => { const r = el.getBoundingClientRect(); return { l: r.left, r: r.right, t: r.top, b: r.bottom, w: r.width, h: r.height }; };
    const panel = document.querySelector('.final-plan-panel');
    const head = document.querySelector('.final-panel-head h2');
    const filter = document.querySelector('.final-chapter-filter');
    if (!panel || !head || !filter) return { missing: true };
    const p = rect(panel), h = rect(head), gutter = h.l - p.l;
    const blocks = [
      ['排程说明', document.querySelector('.final-plan-intro')],
      ['复习窗口', document.querySelector('.final-count-banner')],
      ['阶段卡', document.querySelector('.final-phase-grid')],
      ['使用说明', document.querySelector('.final-plan-usage')],
      ['章节模块', document.querySelector('.final-plan-modules h3')],
      ['模块卡', document.querySelector('.final-plan-module')],
      ['每日安排', document.querySelector('.final-plan-schedule h3')],
      ['每日行', document.querySelector('.final-day')]
    ];
    const out = { missing: false, gutter, panel: { l: p.l, r: p.r, w: p.w }, blocks: [], chips: null, tabs: null };
    for (const pair of blocks) {
      const label = pair[0], el = pair[1];
      if (!el) { out.blocks.push({ label, missing: true }); continue; }
      const b = rect(el);
      out.blocks.push({ label, l: b.l, r: b.r, w: b.w, leftGap: b.l - p.l, rightGap: p.r - b.r });
    }
    const tabsEl = document.querySelector('.final-subject-tabs');
    const tabRects = [...document.querySelectorAll('.final-subject-tab')].map(rect);
    out.tabs = { cols: getComputedStyle(tabsEl).gridTemplateColumns.split(/\s+/).filter(Boolean).length, rects: tabRects, rows: new Set(tabRects.map((t) => Math.round(t.t))).size };
    const cs = getComputedStyle(filter);
    const chips = [...filter.querySelectorAll('.fcf-chip')].map((el) => {
      const b = rect(el);
      const range = document.createRange(); range.selectNodeContents(el);
      const tr = range.getBoundingClientRect();
      return { l: b.l, r: b.r, w: b.w, h: b.h, fs: parseFloat(getComputedStyle(el).fontSize) || 0, padL: tr.left - b.l, padR: b.r - tr.right };
    });
    const pointB = document.querySelector('.fpm-point-head b');
    const pointSpan = pointB ? pointB.parentElement.querySelector('span') : null;
    if (pointB && pointSpan) {
      out.point = {
        bWeight: parseFloat(getComputedStyle(pointB).fontWeight) || 0,
        bColor: getComputedStyle(pointB).color,
        spanColor: getComputedStyle(pointSpan).color,
        spanFont: getComputedStyle(pointSpan).fontFamily
      };
    }
    const usage = document.querySelector('.final-plan-usage');
    const usageItems = usage ? [...usage.querySelectorAll('li')].map((li) => {
      const m = (li.textContent || '').match(/(\d+)\s*分钟/);
      return m ? Number(m[1]) : null;
    }) : [];
    const metaText = (document.querySelector('.final-plan-meta') || {}).textContent || '';
    const metaMinutes = (metaText.match(/每天约\s*(\d+)\s*分钟/) || [])[1];
    out.usage = { items: usageItems, total: metaMinutes ? Number(metaMinutes) : 0, heading: (usage && usage.querySelector('b') ? usage.querySelector('b').textContent : '').trim() };
    const countEl = filter.querySelector('.fcf-count');
    out.chips = {
      cols: cs.gridTemplateColumns.split(/\s+/).filter(Boolean).length,
      padL: parseFloat(cs.paddingLeft) || 0,
      padR: parseFloat(cs.paddingRight) || 0,
      filterL: rect(filter).l, filterR: rect(filter).r,
      countR: countEl ? rect(countEl).r : 0,
      list: chips
    };
    return out;
  });
  if (plan.missing) { push(failures, width, '期末复习计划缺面板/标题/章节筛选'); return; }
  const inner = plan.gutter;
  for (const b of plan.blocks) {
    if (b.missing) { push(failures, width, '期末复习缺 ' + b.label); continue; }
    if (Math.abs(b.leftGap - inner) > 2) push(failures, width, '期末复习' + b.label + '顶到卡片边框，左内距 ' + b.leftGap.toFixed(1) + ' 应为 ' + inner.toFixed(1));
    if (b.label !== '章节模块' && b.label !== '每日安排' && Math.abs(b.rightGap - inner) > 2) push(failures, width, '期末复习' + b.label + '右侧留白不均，右内距 ' + b.rightGap.toFixed(1) + ' 应为 ' + inner.toFixed(1));
  }
  if (plan.usage) {
    const nums = plan.usage.items.filter((x) => typeof x === 'number');
    const sum = nums.reduce((a, b) => a + b, 0);
    if (!plan.usage.total || sum !== plan.usage.total) push(failures, width, '复习计划每日用时与总时长不一致：' + sum + ' / ' + plan.usage.total);
    if (plan.usage.heading && !plan.usage.heading.includes(String(plan.usage.total))) push(failures, width, '复习计划每日用时标题没有写明总分钟数');
  }
  if (plan.point) {
    if (plan.point.bWeight < 700) push(failures, width, '知识点标题字重不足 700');
    if (plan.point.spanColor === 'rgb(143, 76, 46)') push(failures, width, '知识点出处仍占用章节强调色');
    if (!/mono/i.test(plan.point.spanFont)) push(failures, width, '知识点出处没有使用等宽小字');
  }
  const tabs = plan.tabs;
  if (tabs.rects.length !== 4) push(failures, width, '期末复习科目按钮不是 4 个：' + tabs.rects.length);
  if (tabs.rects.some((t) => t.h < 33.5)) push(failures, width, '期末复习科目按钮过矮');
  if (width >= 761 && tabs.rows !== 1) push(failures, width, '期末复习科目按钮在桌面换行');
  if (width <= 560) {
    if (tabs.cols !== 2) push(failures, width, '期末复习科目按钮手机不是 2 列：' + tabs.cols);
    if (tabs.rects.length > 1 && Math.abs(tabs.rects[0].w - tabs.rects[1].w) > 1.5) push(failures, width, '期末复习科目按钮宽窄不一');
    if (tabs.rects.some((t) => t.h < 40)) push(failures, width, '期末复习科目按钮手机高不足 40px');
  }
  const chips = plan.chips;
  if (width <= 560) {
    if (chips.cols !== 2) push(failures, width, '期末复习章节 chip 手机不是 2 列：' + chips.cols);
    if (chips.list.length > 1 && Math.abs(chips.list[0].w - chips.list[1].w) > 1.5) push(failures, width, '期末复习章节 chip 宽窄不一');
    if (chips.list.some((c) => c.h < 40)) push(failures, width, '期末复习章节 chip 高不足 40px');
    for (const c of chips.list.slice(0, 3)) {
      if (c.padL < 7 || c.padR < 7) push(failures, width, '期末复习章节 chip 文字贴边 ' + c.padL.toFixed(1) + '/' + c.padR.toFixed(1));
    }
    if (chips.countR > chips.filterR - chips.padR + 1.5) push(failures, width, '期末复习章节计数贴到卡片右缘');
  } else {
    if (chips.list.some((c) => c.h < 33.5)) push(failures, width, '期末复习章节 chip 桌面过矮');
    if (chips.list.some((c) => c.fs < 11.5)) push(failures, width, '期末复习章节 chip 字号过小');
  }
  const paperTab = page.locator('[data-act="final-section"][data-section="paper"]').first();
  if (await paperTab.count()) {
    await paperTab.evaluate((el) => el.click());
    await page.waitForTimeout(450);
    const paper = await page.evaluate(() => {
      const f = document.querySelector('.final-papers .final-chapter-filter');
      if (!f) return null;
      const cs = getComputedStyle(f);
      return {
        padL: parseFloat(cs.paddingLeft) || 0,
        padR: parseFloat(cs.paddingRight) || 0,
        cols: cs.gridTemplateColumns.split(/\s+/).filter(Boolean).length,
        chips: [...f.querySelectorAll('.fcf-chip')].map((el) => { const b = el.getBoundingClientRect(); return { l: b.left, w: b.width, h: b.height }; })
      };
    });
    if (!paper) push(failures, width, '期末出卷页缺章节筛选');
    else {
      if (paper.padL < 16 || paper.padR < 16) push(failures, width, '期末出卷页章节筛选顶到卡片边框 ' + paper.padL.toFixed(1) + '/' + paper.padR.toFixed(1));
      if (width <= 560 && paper.chips.length > 1 && Math.abs(paper.chips[0].w - paper.chips[1].w) > 1.5) push(failures, width, '期末出卷页章节 chip 宽窄不一');
      if (width <= 560 && paper.cols !== 2) push(failures, width, '期末出卷页章节 chip 手机不是 2 列：' + paper.cols);
    }
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
      await reading(page, width, failures);
      await finalLayout(page, width, failures);
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
