# Warm Academic 3.1 全站视觉精修报告

日期：2026-11-14
分支：`warm-academic-3-1`（从 `main@6672f3a37ac3eafd6ae0b0c4d7194a0c69c8996a` 创建，未合并、未部署）
构建：`2026.11.14-f2dd4626`（本地 `dist/index.html`、`dist-pages/index.html`、根 `index.html` 已对齐；导出静态页需在发布前重新生成）

## 1. 审计范围
- 读取并检查 `src/index.template.html`、`src/js/*.js`（25 个运行模块）、`src/styles.css`（约 494 KB）、`src/data/` 结构、`build.js`、`tools/qa-responsive.js`、`tools/qa-site-consistency.js`、`tests/regressions.test.js`，逐页对照 `WARM_ACADEMIC_3_DESIGN.md`、`UI_UX_3_DESIGN.md`、`WARM_ACADEMIC_3_REPORT.md`。
- 页面覆盖：首页工作台、四科总览、统计、错题、模板库、题库、规范、笔记库、期末复习、模拟考、更新记录、设置与同步、AI 智能录入。
- 未改题库内容、答案、公式、数据结构、存储 key、备份格式、同步协议、AI 工作流、鉴权、Service Worker 与 Pages 发布机制。

## 2. 发现与修复
| 编号 | 问题与复现 | 根因 | 修复 | 回归证据 |
|---|---|---|---|---|
| WA31-01 | 规范页首屏只有一大块表格，缺字段/编号/复习节奏的入口；移动端三列表格被压成横向窄条 | 原 `viewGuide` 只有三段 panel；旧 `.guide-panel .md td:nth-child(...) { width: 24%/50%/26% !important }` 在移动端继续生效 | 新增四格 facts、01/02/03 panel 与右侧目录；表格加 `data-label` 与专用类；移动端以更高特异性覆盖为 100% 纵向字段卡，并去掉首列重复的“字段”标签 | 1440/834/768/390/360 截图；390 下表格宽 296，单元格 270（100%），768 恢复三列表格；回归断言见下 |
| WA31-02 | 期末复习两个入口像两块重复大卡，主次不清；桌面阶段卡圆号/标题纵向堆叠、卡片过高 | 旧层 `.final-section-tab { display:flex!important; flex-direction:column }` 压过 3.1 规则 | 新增 `.final-flow` 阶段说明，阶段卡改 grid（编号/标题说明/箭头），标准题库为主、AI 为次；移动单列 | 1440 截图横向两阶段卡；390 单列；真实点击入口保留 |
| WA31-03 | 题库筛选后没有“当前范围/条件/结果数”的明确反馈；手机筛选按钮与结果数重复 | 只有筛选控件，无结果条 | 新增 `.bank-resultbar`，显示当前范围、条件 chip、命中题数；移动隐藏 `.bank-filters .count-note` | 1440/390 截图；题库 1559/1559 正常 |
| WA31-04 | 统计页图表只有图形，缺少可直接读的结论；零数据时容易看成空图 | 图表有 aria-label 但无文本摘要 | 五个面板各加 `.stats-insight` 文字结论；空数据仍走明确空态 | 1440/390 截图；空态截图 |
| WA31-05 | 首页缺“今日工作台”的区块标题，问候区与统计区边界弱 | 首页直接进入指标带 | 加 `.hw-topbar`（STUDY DESK · 今日工作台）与说明；统计、最近记录、节奏三栏在同一工作台 | 1440/834/390 截图 |
| WA31-06 | AI 智能录入弹窗在 1000px 高桌面初始视口下底部提交按钮被裁切 | 弹窗 body 高于可视区，提交行在滚动区末尾 | 提交行 sticky 到底部，弹窗 body 加底部留白 | 1440 实测提交行 top 870/bottom 921，视口 1000；截图为完整按钮 |
| WA31-07 | 移动规范页首列重复“字段”标签，信息层级弱 | 表头转卡片后每个 td 都输出 data-label | 移动端隐藏首列 label，首列作为行标题，其余列保留“要求/位置” | 390 截图 |

## 3. 关键源码改动
- `src/js/30-library.js`：`decorateGuideTables()`、四格 facts、三块 guide panel、右侧目录、`data-act="guide-jump"`、`bank-resultbar`。
- `src/js/90-init.js`：`guide-jump` 平滑滚动、标题 `focus({preventScroll:true})`。
- `src/js/58-final.js`：`final-flow` 阶段说明、阶段卡结构、标准题库/AI 两个主次按钮与说明。
- `src/js/16-stats.js`：五个 `stats-insight` 文本结论。
- `src/js/15-shell.js`：首页 `hw-topbar`。
- `src/styles.css`：3.1 权威层、阶段卡 grid、guide facts/table/toc、bank resultbar、统计结论、移动覆盖、AI sticky 提交行。
- `tools/qa-responsive.js`：从 6 视口扩到 8 视口（新增 768×1024、1920×1080）。
- `tests/regressions.test.js`：新增 Warm 3.1 结构与 CSS 断言。

## 4. 质量门禁与测试结果
- `npm test`：82 tests / 82 pass / 0 fail。
- `npm run check`：见 `debug/wa31-check.log`（最终退出码以该日志为准）。
- 严格题库 QA：9163、55 章、825 桶、每桶 ≥10、0 problems / 0 warnings（`npm run check` 内）。
- 站点一致性：totals 1559 / 3522 / 1199 / 2883，dates 23（最终以日志为准）。
- `qa:responsive`：8 设备 × 10 路由，failures `[]`、pageerrors `[]`；设备为 390×844、360×800、430×932、768×1024、834×1112、1112×834、1440×1000、1920×1080。
- `qa:formulas`：overview / entries / templates / bank / guide 全部 raw `[]`、broken 0，passed。
- `qa:a11y`：8 个路由 axe 结果全部 `[]`，passed。
- `qa:perf`：FCP 556 ms、DCL 828 ms、load 833 ms、题库切换 534 ms、JS 堆 27 MB、120 张卡，problems `[]`。
- `verify:skills`：10 / 23 / 6 / 17 章，problems `[]`。
- `verify:build`：根 / dist / dist-pages 构建号与静态资源一致；导出静态页在本报告生成时仍指向旧构建，发布前需重建。

## 5. 截图
- 最终截图目录：`debug/wa31/final/`。
- 覆盖：1440 浅色/深色、834、768、390 浅色/深色、1920；页面为 home、overview、entries、bank、templates、guide、notes、final、stats、settings、changelog、AI；另有 390 的 guide 表格卡片与 final 单列。
- 代表性文件：`1440-light-home.png`、`1440-light-guide.png`、`390-light-guide.png`、`390-light-bank.png`、`fix-final-1440-light.png`、`fix-final-390-light.png`、`1440-light-ai.png`。

## 6. 未验证项与剩余风险
- 未在真实手机/平板上手测，仅 Chromium 视口仿真；未跑 Safari / Firefox。
- 未走完整 AI 生成、OCR、真实交卷与 DOCX/PDF 导出；仅验证入口、弹窗与既有逻辑未被改坏。
- 深色模式覆盖主要页面，但未逐页逐弹窗截图对比。
- 两轮人工目检以 1440/834/390 为主，1920 与 768 为抽查。
- 导出静态页、source.zip、Release 与线上 Pages 尚未在本分支任务中更新；需在批准后按发布清单重建。
- 未合并 main、未部署生产；线上仍是 `2026.11.14-45820005`。

## 7. 回滚说明
- 本分支未合并，直接关闭 PR 即可；main 未变。
- 如已合并且需回滚：`git revert <merge-commit>`，或恢复分支前的 `6672f3a37ac3eafd6ae0b0c4d7194a0c69c8996a`；不涉及题库或存储迁移。
