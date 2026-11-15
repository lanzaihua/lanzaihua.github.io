#!/usr/bin/env node
'use strict';

/**
 * 模拟卷编辑卡跨端门禁。
 *
 * 只验证一件容易复发的事：编辑卡头部（卷名 / 时长 / 题数 / 6 个操作按钮）
 * 在 320–1440 的每个宽度都不出现
 *   1. 标题输入框被截断（值为长标题时 scrollWidth > clientWidth）；
 *   2. 按钮文字被裁（文字行盒越出按钮盒）；
 *   3. 标签与输入框之间出现异常空白（> 40px）；
 *   4. 头部高度异常（手机/平板/桌面各自上限）；
 *   5. 整页横向溢出。
 *
 * 用法：node tools/qa-paper-editor.js [baseUrl]
 * 默认 http://127.0.0.1:4173，可用 BASE_URL 覆盖。
 */

const { launchChromium } = require('./browser');

const BASE = process.argv[2] || process.env.PAGE_URL || process.env.BASE_URL || 'http://127.0.0.1:4173';
const WIDTHS = [320, 360, 390, 414, 480, 540, 600, 700, 768, 834, 900, 918, 1024, 1112, 1200, 1280, 1360, 1440];

function limitFor(width) {
  if (width <= 480) return 280;
  if (width <= 700) return 240;
  if (width <= 1100) return 130;
  if (width <= 1359) return 120;
  return 80;
}

(async () => {
  const browser = await launchChromium();
  const failures = [];
  try {
    for (const width of WIDTHS) {
      const page = await browser.newPage({
        viewport: { width, height: 900 },
        deviceScaleFactor: 1,
        isMobile: width < 700,
        hasTouch: width < 700,
      });
      await page.goto(BASE + '/#/final', { waitUntil: 'networkidle', timeout: 120000 });
      await page.waitForTimeout(350);
      if (!(await page.locator('.final-editor-head').count())) {
        const generate = page.locator('[data-act="final-generate-paper"]:visible').first();
        if (await generate.count()) {
          await generate.click();
          await page.waitForTimeout(500);
        }
      }
      if (!(await page.locator('.final-editor-head').count())) {
        failures.push(width + 'px / 模拟卷编辑卡未渲染');
        await page.close();
        continue;
      }
      const data = await page.evaluate(() => {
        const head = document.querySelector('.final-editor-head');
        const hr = head.getBoundingClientRect();
        const labels = [...head.querySelectorAll(':scope > .fpi-label')].map((label) => {
          const lr = label.getBoundingClientRect();
          const walker = document.createTreeWalker(label, NodeFilter.SHOW_TEXT);
          const textNode = walker.nextNode();
          let caption = null;
          if (textNode && textNode.textContent.trim()) {
            const cr = document.createRange();
            cr.selectNodeContents(textNode);
            caption = cr.getBoundingClientRect();
          }
          const input = label.querySelector('.input, .input-num');
          const ir = input ? input.getBoundingClientRect() : null;
          return {
            caption: label.firstElementChild ? label.firstElementChild.textContent.trim() : '',
            labelTop: lr.top,
            labelH: Math.round(lr.height),
            inputTop: ir ? ir.top : null,
            inputH: ir ? Math.round(ir.height) : null,
            gap: caption && ir ? Math.round(ir.top - caption.bottom) : null,
            inputW: ir ? Math.round(ir.width) : null,
            inputScrollW: input ? input.scrollWidth : null,
            inputClientW: input ? input.clientWidth : null,
            value: input && input.value ? input.value : '',
          };
        });
        const buttons = [...head.querySelectorAll('.final-editor-actions .btn')].map((btn) => {
          const br = btn.getBoundingClientRect();
          const range = document.createRange();
          range.selectNodeContents(btn);
          const rects = [...range.getClientRects()].map((r) => ({
            left: r.left, right: r.right, top: r.top, bottom: r.bottom,
          }));
          return {
            text: btn.textContent.trim(),
            w: Math.round(br.width),
            h: Math.round(br.height),
            scrollW: btn.scrollWidth,
            clientW: btn.clientWidth,
            scrollH: btn.scrollHeight,
            clientH: btn.clientHeight,
            textRects: rects,
            left: br.left, right: br.right, top: br.top, bottom: br.bottom,
          };
        });
        const meta = head.querySelector('.final-editor-meta');
        const metaRect = meta ? meta.getBoundingClientRect() : null;
        let metaTextRight = null;
        if (meta && meta.firstChild && meta.firstChild.nodeType === 3) {
          const mr = document.createRange();
          mr.selectNodeContents(meta.firstChild);
          metaTextRight = mr.getBoundingClientRect().right;
        }
        const actionsRect = head.querySelector('.final-editor-actions').getBoundingClientRect();
        return {
          docScrollW: document.documentElement.scrollWidth,
          innerW: window.innerWidth,
          headW: Math.round(hr.width),
          headH: Math.round(hr.height),
          headScrollW: head.scrollWidth,
          headClientW: head.clientWidth,
          headRight: hr.right,
          metaRight: metaRect ? metaRect.right : null,
          metaTextRight,
          actionsRight: actionsRect.right,
          display: getComputedStyle(head).display,
          labels,
          buttons,
          metaText: meta ? meta.textContent.trim() : '',
          metaH: meta ? Math.round(meta.getBoundingClientRect().height) : 0,
        };
      });

      if (data.docScrollW > data.innerW + 1) {
        failures.push(width + 'px / 页面横向溢出 ' + data.docScrollW + ' > ' + data.innerW);
      }
      if (data.headH > limitFor(width)) {
        failures.push(width + 'px / 编辑卡头部过高 ' + data.headH + 'px（上限 ' + limitFor(width) + '）');
      }
      if (data.headScrollW > data.headClientW + 1) {
        failures.push(width + 'px / 编辑卡头部内部横向溢出 ' + data.headScrollW + ' > ' + data.headClientW);
      }
      if (data.actionsRight > data.headRight + 1) {
        failures.push(width + 'px / 操作区越出编辑卡 ' + Math.round(data.actionsRight) + ' > ' + Math.round(data.headRight));
      }
      if (data.metaRight !== null && data.metaRight > data.headRight + 1) {
        failures.push(width + 'px / 题数信息越出编辑卡 ' + Math.round(data.metaRight) + ' > ' + Math.round(data.headRight));
      }
      if (data.metaTextRight !== null && data.metaTextRight > data.headRight - 2) {
        failures.push(width + 'px / 题数信息贴住编辑卡边缘 ' + Math.round(data.metaTextRight) + ' / ' + Math.round(data.headRight));
      }
      const title = data.labels[0];
      if (!title) {
        failures.push(width + 'px / 缺少卷名标签');
      } else {
        if (title.gap === null || title.gap < 0 || title.gap > 40) {
          failures.push(width + 'px / 卷名标签与输入框间距异常 ' + title.gap + 'px');
        }
        if (title.inputScrollW > title.inputClientW + 1) {
          failures.push(width + 'px / 卷名输入框内容被截断（' + title.value + '）');
        }
        if (title.inputW < Math.min(200, data.headW - 4)) {
          failures.push(width + 'px / 卷名输入框过窄 ' + title.inputW + 'px');
        }
      }
      const duration = data.labels[1];
      if (duration && (duration.gap === null || duration.gap < 0 || duration.gap > 40)) {
        failures.push(width + 'px / 时长标签与输入框间距异常 ' + duration.gap + 'px');
      }
      if (data.buttons.length !== 6) {
        failures.push(width + 'px / 操作按钮数量 ' + data.buttons.length + '（应为 6）');
      }
      for (const btn of data.buttons) {
        if (btn.scrollW > btn.clientW + 1 || btn.scrollH > btn.clientH + 1) {
          failures.push(width + 'px / 按钮盒裁切：' + btn.text + '（' + btn.scrollW + 'x' + btn.scrollH + ' vs ' + btn.clientW + 'x' + btn.clientH + '）');
        }
        if (btn.h < 36) {
          failures.push(width + 'px / 按钮过矮：' + btn.text + ' ' + btn.h + 'px');
        }
        if (!btn.textRects.length) {
          failures.push(width + 'px / 按钮没有文字：' + btn.text);
        }
        for (const rect of btn.textRects) {
          if (rect.left < btn.left - 1 || rect.right > btn.right + 1 || rect.top < btn.top - 1 || rect.bottom > btn.bottom + 1) {
            failures.push(width + 'px / 按钮文字越界：' + btn.text);
            break;
          }
        }
      }
      console.log(width + 'px  head=' + data.headH + 'px  title=' + (title ? title.inputW : '?') + 'px  buttons=' + data.buttons.length + '  ' + (failures.length ? 'FAIL' : 'ok'));
      await page.close();
    }
  } finally {
    await browser.close();
  }
  if (failures.length) {
    console.error('\n模拟卷编辑卡门禁失败：');
    for (const f of failures) console.error(' - ' + f);
    process.exit(1);
  }
  console.log('\n模拟卷编辑卡门禁通过：' + WIDTHS.length + ' 个宽度，0 failures。');
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
