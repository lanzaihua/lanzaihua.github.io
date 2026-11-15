#!/usr/bin/env node
'use strict';

/**
 * 题库筛选栏跨端门禁。
 *
 * 题库筛选栏（来源段控件 + 5 个下拉 + 清空 + 题数）曾经在桌面是普通
 * inline 流，控件之间只剩空白字符，1097px 笔记本宽度下挤成三五毫米；
 * 手机端又容易把控件压成一行。这个脚本在 22 个真实宽度上验证：
 *   1. 页面/筛选栏没有横向溢出；
 *   2. 所有控件落在筛选栏内，互不重叠；
 *   3. 行/列间距 >= 8px，下拉宽度 >= 150px（手机 >= 120px）；
 *   4. 按钮/下拉高度 >= 34px（手机 >= 38px），文字不被裁；
 *   5. 手机默认收起，点“筛选”后展开为两列，桌面不出现筛选开关。
 *
 * 用法：node tools/qa-bank-filters.js [baseUrl]
 * 默认 http://127.0.0.1:4173，可用 PAGE_URL / BASE_URL 覆盖。
 */

const { launchChromium } = require('./browser');

const BASE = process.argv[2] || process.env.PAGE_URL || process.env.BASE_URL || 'http://127.0.0.1:4173';
const WIDTHS = [320, 360, 375, 390, 414, 430, 480, 540, 600, 700, 768, 834, 900, 918, 1024, 1097, 1112, 1200, 1280, 1360, 1440, 1920];

function round(n) { return Math.round(n * 10) / 10; }

(async () => {
  const browser = await launchChromium();
  const failures = [];
  try {
    for (const width of WIDTHS) {
      const page = await browser.newPage({
        viewport: { width, height: 1000 },
        deviceScaleFactor: 1,
        isMobile: width <= 700,
        hasTouch: width <= 700,
      });
      await page.route('**/api/state', (r) => r.abort());
      await page.goto(BASE + '/#/gaodai/bank', { waitUntil: 'networkidle', timeout: 120000 });
      await page.waitForSelector('.bank-filters', { timeout: 30000 });
      await page.waitForTimeout(250);

      if (width <= 700) {
        const initial = await page.evaluate(() => {
          const f = document.querySelector('.bank-filters .bank-filter-fields');
          const t = document.querySelector('.bank-filters .bank-filter-toggle');
          return {
            fields: f ? getComputedStyle(f).display : 'missing',
            toggle: t ? getComputedStyle(t).display : 'missing',
          };
        });
        if (initial.fields !== 'none') failures.push(width + 'px / 手机筛选默认应收起，实际 ' + initial.fields);
        if (initial.toggle === 'none') failures.push(width + 'px / 手机筛选开关不可见');
        const toggle = page.locator('.bank-filters .bank-filter-toggle:visible');
        if (!(await toggle.count())) {
          failures.push(width + 'px / 手机筛选开关无法点击');
          await page.close();
          continue;
        }
        await toggle.click();
        await page.waitForTimeout(220);
      } else {
        const toggle = await page.evaluate(() => {
          const t = document.querySelector('.bank-filters .bank-filter-toggle');
          return t ? getComputedStyle(t).display : 'missing';
        });
        if (toggle !== 'none') failures.push(width + 'px / 桌面不应显示筛选开关，实际 ' + toggle);
      }

      const data = await page.evaluate(() => {
        const toolbar = document.querySelector('.bank-filters');
        const fields = toolbar.querySelector('.bank-filter-fields');
        const tr = toolbar.getBoundingClientRect();
        const ts = getComputedStyle(toolbar);
        const fs = getComputedStyle(fields);
        const contentLeft = tr.left + parseFloat(ts.borderLeftWidth || 0) + parseFloat(ts.paddingLeft || 0);
        const contentRight = tr.right - parseFloat(ts.borderRightWidth || 0) - parseFloat(ts.paddingRight || 0);
        const visible = (el) => {
          const s = getComputedStyle(el);
          return s.display !== 'none' && s.visibility !== 'hidden' && parseFloat(s.width) > 0;
        };
        const rect = (el) => {
          const r = el.getBoundingClientRect();
          return {
            left: r.left, right: r.right, top: r.top, bottom: r.bottom,
            width: r.width, height: r.height,
          };
        };
        const describe = (el) => {
          const r = rect(el);
          const range = document.createRange();
          let textRects = [];
          try { range.selectNodeContents(el); textRects = [...range.getClientRects()].map((x) => ({ left: x.left, right: x.right, top: x.top, bottom: x.bottom })); } catch (_) {}
          return {
            tag: el.tagName,
            cls: el.className,
            text: (el.textContent || '').trim().slice(0, 24),
            rect: r,
            scrollW: el.scrollWidth,
            clientW: el.clientWidth,
            scrollH: el.scrollHeight,
            clientH: el.clientHeight,
            textRects,
            disabled: !!el.disabled,
          };
        };
        const kids = [...fields.children].filter(visible).map(describe);
        const controls = [...fields.querySelectorAll('select, .filter-clear')].filter(visible).map(describe);
        const segButtons = [...fields.querySelectorAll('.seg button')].filter(visible).map(describe);
        const count = toolbar.querySelector('.count-note');
        const countStyle = count ? getComputedStyle(count) : null;
        const countData = countStyle && countStyle.display !== 'none' && count.getBoundingClientRect().width > 0
          ? { rect: rect(count), text: count.textContent.trim() }
          : null;
        return {
          docScrollW: document.documentElement.scrollWidth,
          innerW: window.innerWidth,
          toolbar: { rect: rect(toolbar), scrollW: toolbar.scrollWidth, clientW: toolbar.clientWidth },
          content: { left: contentLeft, right: contentRight },
          fields: {
            rect: rect(fields), display: fs.display, flexWrap: fs.flexWrap,
            colGap: parseFloat(fs.columnGap || fs.gap || 0),
            rowGap: parseFloat(fs.rowGap || fs.gap || 0),
            gridCols: fs.gridTemplateColumns,
          },
          kids, controls, segButtons, count: countData,
          fieldCount: kids.length,
        };
      });

      const widthTolerance = 2;
      if (data.docScrollW > data.innerW + 1) {
        failures.push(width + 'px / 页面横向溢出 ' + data.docScrollW + ' > ' + data.innerW);
      }
      if (data.toolbar.scrollW > data.toolbar.clientW + 1) {
        failures.push(width + 'px / 筛选栏内部横向溢出 ' + data.toolbar.scrollW + ' > ' + data.toolbar.clientW);
      }
      if (!(data.fields.colGap >= 8)) failures.push(width + 'px / 横向间距不足 ' + data.fields.colGap + 'px');
      if (!(data.fields.rowGap >= 8)) failures.push(width + 'px / 纵向间距不足 ' + data.fields.rowGap + 'px');
      if (data.fields.display !== 'flex' && data.fields.display !== 'grid') {
        failures.push(width + 'px / 字段容器不是 flex/grid，实际 ' + data.fields.display);
      }
      if (data.fieldCount < 7) {
        failures.push(width + 'px / 控件数量不足 ' + data.fieldCount + '（应为 7：来源段 + 5 下拉 + 清空）');
      }

      const all = data.kids.concat(data.controls);
      for (const item of all) {
        if (item.rect.left < data.content.left - widthTolerance || item.rect.right > data.content.right + widthTolerance) {
          failures.push(width + 'px / ' + (item.text || item.cls || item.tag) + ' 越出筛选栏内容区 ' +
            round(item.rect.left) + '..' + round(item.rect.right) + ' / ' +
            round(data.content.left) + '..' + round(data.content.right));
        }
        if (item.rect.bottom > data.toolbar.rect.bottom + 1) {
          failures.push(width + 'px / ' + (item.text || item.cls || item.tag) + ' 越出筛选栏底部 ' +
            round(item.rect.bottom) + ' > ' + round(data.toolbar.rect.bottom));
        }
        if (!(item.tag === 'DIV' && item.cls && item.cls.indexOf('seg') >= 0) && item.rect.height < (width <= 700 ? 38 : 34)) {
          failures.push(width + 'px / ' + (item.text || item.cls || item.tag) + ' 高度过小 ' + round(item.rect.height));
        }
      }
      for (const item of data.segButtons) {
        if (item.rect.left < data.content.left - widthTolerance || item.rect.right > data.content.right + widthTolerance) {
          failures.push(width + 'px / 来源选项越出筛选栏内容区 ' + (item.text || item.tag));
        }
        if (item.rect.height < 30) {
          failures.push(width + 'px / 来源选项高度过小 ' + round(item.rect.height) + '（' + item.text + '）');
        }
        if (item.scrollW > item.clientW + 2 || item.scrollH > item.clientH + 2) {
          failures.push(width + 'px / 来源选项文字被裁：' + item.text);
        }
      }

      for (let i = 0; i < data.controls.length; i += 1) {
        const a = data.controls[i];
        if (a.tag === 'DIV') continue;
        if (a.scrollW > a.clientW + 2 || a.scrollH > a.clientH + 2) {
          failures.push(width + 'px / 控件文字被裁：' + (a.text || a.tag) + '（' + a.scrollW + 'x' + a.scrollH + ' vs ' + a.clientW + 'x' + a.clientH + '）');
        }
        for (const r of a.textRects) {
          if (r.left < a.rect.left - 2 || r.right > a.rect.right + 2 || r.top < a.rect.top - 2 || r.bottom > a.rect.bottom + 2) {
            failures.push(width + 'px / 控件文字越界：' + (a.text || a.tag));
            break;
          }
        }
      }

      const boxes = data.kids.map((k) => ({ text: k.text || k.tag, r: k.rect }));
      for (let i = 0; i < boxes.length; i += 1) {
        for (let j = i + 1; j < boxes.length; j += 1) {
          const a = boxes[i];
          const b = boxes[j];
          const ox = Math.min(a.r.right, b.r.right) - Math.max(a.r.left, b.r.left);
          const oy = Math.min(a.r.bottom, b.r.bottom) - Math.max(a.r.top, b.r.top);
          if (ox > 1 && oy > 1) failures.push(width + 'px / 控件重叠：' + a.text + ' × ' + b.text);
        }
      }

      const rows = [];
      for (const k of data.kids.slice().sort((a, b) => a.rect.top - b.rect.top)) {
        let row = rows.find((entry) => {
          const overlap = Math.min(entry.bottom, k.rect.bottom) - Math.max(entry.top, k.rect.top);
          return overlap >= Math.min(entry.height, k.rect.height) * 0.5;
        });
        if (!row) {
          row = { top: k.rect.top, bottom: k.rect.bottom, height: k.rect.height, items: [] };
          rows.push(row);
        }
        row.items.push(k);
        row.top = Math.min(row.top, k.rect.top);
        row.bottom = Math.max(row.bottom, k.rect.bottom);
        row.height = row.bottom - row.top;
      }
      const rowCount = rows.length;
      if (rowCount > (width <= 700 ? 5 : 3)) {
        failures.push(width + 'px / 筛选控件行数过多 ' + rowCount);
      }

      const selects = data.controls.filter((c) => c.tag === 'SELECT');
      if (selects.length < 5) failures.push(width + 'px / 下拉数量 ' + selects.length + '（应为 5）');
      for (const sel of selects) {
        const min = width <= 700 ? 120 : 150;
        if (sel.rect.width < min - 1) failures.push(width + 'px / 下拉过窄 ' + round(sel.rect.width) + 'px（' + (sel.text || '') + '）');
      }

      const clear = data.controls.find((c) => c.tag === 'BUTTON' && /清空/.test(c.text || ''));
      if (!clear) failures.push(width + 'px / 缺少清空筛选按钮');
      else if (clear.scrollW > clear.clientW + 2 || clear.scrollH > clear.clientH + 2) {
        failures.push(width + 'px / 清空筛选文字被裁');
      }
      if (clear && clear.rect.height < 40) failures.push(width + 'px / 清空筛选高度不足 40px');

      if (data.count) {
        const c = data.count.rect;
        if (c.left < data.content.left - 1 || c.right > data.content.right + 1) {
          failures.push(width + 'px / 题数越出内容区');
        }
        if (c.top < data.toolbar.rect.top - 1 || c.bottom > data.toolbar.rect.bottom + 1) {
          failures.push(width + 'px / 题数越出筛选栏');
        }
        for (const k of data.kids) {
          const ox = Math.min(c.right, k.rect.right) - Math.max(c.left, k.rect.left);
          const oy = Math.min(c.bottom, k.rect.bottom) - Math.max(c.top, k.rect.top);
          if (ox > 1 && oy > 1) failures.push(width + 'px / 题数与控件重叠：' + k.text);
        }
      }

      if (width <= 700) {
        if (data.fields.display !== 'grid') failures.push(width + 'px / 手机筛选展开后应为 grid，实际 ' + data.fields.display);
        const cols = data.fields.gridCols.split(' ').filter(Boolean).length;
        if (cols !== 2) failures.push(width + 'px / 手机筛选应为 2 列，实际 ' + cols + ' 列（' + data.fields.gridCols + '）');
        if (clear && Math.abs(clear.rect.width - data.fields.rect.width) > 2) {
          failures.push(width + 'px / 手机清空按钮应占满整行 ' + round(clear.rect.width) + ' / ' + round(data.fields.rect.width));
        }
      }

      console.log(width + 'px  rows=' + rowCount + '  fields=' + data.fields.display + '  gap=' + data.fields.rowGap + '/' + data.fields.colGap +
        '  controls=' + data.controls.length + '  ' + (failures.length ? 'FAIL' : 'ok'));
      await page.close();
    }
  } finally {
    await browser.close();
  }
  if (failures.length) {
    console.error('\n题库筛选栏门禁失败：');
    for (const f of failures) console.error(' - ' + f);
    process.exit(1);
  }
  console.log('\n题库筛选栏门禁通过：' + WIDTHS.length + ' 个宽度，0 failures。');
})().catch((err) => {
  console.error(err);
  process.exit(1);
});