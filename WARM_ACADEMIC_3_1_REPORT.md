# Warm Academic 3.1 全站视觉精修报告

日期：2026-11-14
候选构建：`2026.11.14-2a6c7910`
分支：`warm-academic-3-1`（基于 main `6672f3a37ac3eafd6ae0b0c4d7194a0c69c8996a`）
状态：候选构建与工作分支，未合并 main，未发布 Release，未部署线上

## 1. 范围与边界

本轮只做视觉、排版、信息架构与文档校准，没有改题库内容、答案、公式、数据结构、存储 key、备份格式、同步协议或 AI 工作流。保留 Warm Academic 3.0 的暖白纸面、砖红强调、衬线标题、Study Folio 档案排版与四科低饱和识别色，不重做产品、不删功能入口。

## 2. 实际改动

### 首页工作台
- 问候区、工作台、今日建议、四科进度、最近记录与学习节奏重新排布；桌面压缩到 1440×1000 首屏完整露出四科入口，第四个科目卡底边为 1000px，不再需要先滚一屏。
- 手机顺序改为问候 → 四科入口 → 笔记库/期末复习 → 工作台，避免零数据工作台把科目入口推到 1400px 之后；工作台不再被隐藏。
- 四科入口保留学科编号与识别色，零数据不画假进度。

### 错题列表与详情
- 空态改为三步起步卡：从题库挑一道、手动新增、智能录入；筛选无结果仍提示换条件或清空，不用假数据填满。
- 桌面与手机均保留题干、选项、标准解答、详细解析、答案、要点、易错点的阅读顺序；公式和长选项沿用 hanging indent 与 inline math 规则。

### 题库与模板库
- 题库筛选下新增“当前范围 / 条件 chip / 命中题数”结果条，桌面与手机都能一眼看出当前筛了什么。
- 手机筛选仍为折叠台，展开后保留完整来源、章节、题型、形式、模板、难度；来源只显示当前科目确实有题的类型，切到没有习题集的科目后自动回到全部，不再出现 0 条的“习题集”死路。
- 题目卡片弱化编号和标签，题干保持视觉主体；选项字母固定悬挂，长公式/长文本在右侧换行。

### 规范页
- 新增四格要点（5 必填字段、02 套编号、7 复习节点、01 套写法）和右侧目录（01/02/03 可跳转），三块正文改成独立 panel。
- 桌面保留三列表格；手机改成带字段名的纵向卡片，不再把三列压成需要左右拖动的细条。
- 编号规范写入错题 A/M/G/E 与题库/模板 GA/MA/GE/WE 两套编号，不再混用。

### 期末复习与模拟考
- 两个入口改成 FINAL WORKFLOW 的 01/02 阶段卡：先出模拟卷，再开考；标准题库开考为主，AI 出题为次，窄屏单列，不再像两张重复大卡。
- 章节选择弹窗保留单列大章 + 手风琴小节、全选/清空、原地更新与 10 章 72 小节统计。
- 模拟考准备、答题卡、倒计时、交卷、结果页逻辑未改。

### 统计中心
- 五个面板各补一句真实数据结论：最忙的一天、四科累计与最高、错因最多、章节最集中、最近均分/最高分；没有数据时明确空态，不画假柱。

### 其他页面与组件
- 笔记库恢复笔记本/知识笔记入口，移动端顶部搜索、科目切换、主操作与编辑器可点。
- 更新记录最近块默认展开、历史折叠；更新记录截图与 README 引用同步。
- 设置页保持外观、语言、AI、数据、备份、同步五段，不删流程。
- 统一页面标题、正文、辅助说明、按钮和输入框字号/高度；重点覆盖主页、导航、卡片、弹窗、筛选、章节选择与统计表。

### 文档与发布边界
- 网页更新记录、README、CHANGELOG 同步为 2026-11-14 的 22 项 / 22 组、85 项回归、8 视口。
- 本块明确写明“只对齐候选构建，尚未发布”；没有把 Release 或线上写成已更新。
- 九枚 README 徽章继续两两不同色；VERSION 徽章为 `2026.11.14--2a6c7910`；历史更新继续折叠在 details 中。

## 3. 修改文件

- `src/js/20-entries.js`：错题空态三步引导。
- `src/js/30-library.js`：规范页字段速览、目录、表格装饰；题库当前范围条。
- `src/js/58-final.js`：期末两个入口的阶段卡与主次按钮。
- `src/js/16-stats.js`：五块统计的真实数据结论。
- `src/js/15-shell.js`：首页工作台抬头与结构。
- `src/js/48-changelog.js`：2026-11-14 更新块、通知摘要与发布边界。
- `src/js/90-init.js`：规范页目录跳转。
- `src/styles.css`：3.1 权威样式层、首屏压缩、手机顺序、错题空态、规范卡片、题库范围条、统计结论、表格与触控规则。
- `tests/regressions.test.js`：新增 3.1 首屏/空态/移动端回归，共 85 项。
- `README.md`、`CHANGELOG.md`：最新块与本轮候选构建、22 项、85 项、8 视口同步。
- `index.html`、`dist/index.html`、`dist-pages/index.html`、`导出/四科错题本.html`、`source.zip`、`SHA256SUMS`、`导出/四科错题本-静态站.zip`：候选产物。

## 4. 质量门禁结果（实际运行）

- `npm run check`：85 tests / 85 pass / 0 fail；STRICT QA PASS（9163 题、55 章、825 桶、每桶 ≥10、0 problems / 0 warnings）；site consistency `{ok:true,totals:[1559,3522,1199,2883],dates:23}`；LANGUAGE GATE PASS；BANK AUDIT PASS（textbook 590）。
- `npm run qa:responsive`：8 个设备全部 failures=[]；phone-390/360/430、tablet-768、tablet-portrait/landscape、desktop、desktop-1920；所有路由 doc/body 横向 -10；首页三块重叠 0；备份导出/导入往返 1→1；深链 404 还原 #/gaodai；路由焦点 H1；深色溢出 -10；无 pageerror。
- `npm run qa:formulas`：overview/entries/templates/bank/guide 全部 raw []、broken 0。
- `npm run qa:a11y`：首页、总览、错题、题库、模板库、规范、期末、笔记 8 个路由 axe 结果均为 []。
- `npm run qa:perf`：FCP 608ms、DCL 1008ms、load 1015ms、bankSwitch 676ms、heap 27MB、cards 120，problems []。
- 构建：`node build.js`、`node build.js --pages`、`npm run prepare:pages` 均成功；`index.html` / dist / dist-pages / 导出 HTML 均为 `2026.11.14-2a6c7910`，单文件 15,964,547 bytes。

## 5. 截图

目录：`debug/warm31-review/`。

已生成 9 个页面 × 5 种视口（1440 浅色/深色、834 浅色、390 浅色/深色）：home、overview、entries、bank、templates、guide、notes、final、stats；另有 settings 与 changelog 的 1440 浅色与 390 浅色。共 49 张。重点截图：

- `3.1-home-1440-light.png`：首屏四科入口完整可见。
- `3.1-home-390-light.png`：四科入口在首屏前半段，不再被工作台推后。
- `3.1-home-1440-dark.png` / `3.1-stats-390-dark.png`：深色 token 与文字对比正常。
- `3.1-guide-390-light.png`：规范页四格要点和字段卡片。
- `3.1-final-1440-light.png`：期末 01/02 阶段卡。
- `3.1-bank-1440-light.png`：题库当前范围条与选项悬挂。
- `3.1-entries-empty-390.png`：错题空态三步卡（早前截图）。
- `debug/warm31-review/3.1-settings-1440-light.png`、`3.1-changelog-1440-light.png`。

## 6. 未验证项与剩余风险

- 未在真实 iPhone / iPad / Android 设备上验证，只在 Chromium（Edge）中按 8 个视口模拟。
- 未在 Safari、Firefox 实机复测；WebKit 的 MathML 与 sticky 行为仍有浏览器差异风险。
- 未调用真实 AI API 验证智能录入、AI 出题、AI 批改的视觉状态；本轮只验证静态布局与现有 mock/错误边界。
- 未逐题数学验算 9163 道题；只运行题库结构、公式渲染与数据门禁。
- `npm ci --ignore-scripts` 未重新执行（当前 `node_modules` 已存在）；没有在本机重新安装依赖验证冷启动。
- `npm run verify:pages`、`verify:build`、`verify:skills`、`qa:py` 本轮未重新单独执行；构建与截图前已通过 `prepare:pages`，但没有把本轮所有门禁报告合并成一份 CI 日志。
- GitHub Actions 尚未针对本轮 commit 运行；PR 创建后需要等 CI 全绿再讨论合并。
- Release `v2026.11.14` 仍是上一版 12 项 / 81 项测试的正文与资产，线上仍是 `2026.11.14-45820005`；本轮没有发布，不能声称线上已更新。
- 更新记录截图 `20261114-changelog.png` 为 22 组、0 math-raw，但截图从摘要中部开始，标题未入镜；这是截图裁切问题，不影响页面。
- 知识面板手机端宽表目前可横向滚动，但没有“左右滑动”提示；仍有可读性改进空间。
- 审计 teammate 提到的笔记头部空轨、模拟考结果默认展开 27 题、H1 三套字号、统计页“9163 题库 / 只来自本机记录”的语义边界，本轮未全部修完，列为后续项。

## 7. 回滚

- 本轮在独立分支 `warm-academic-3-1`，未合并 main、未部署生产。
- 回滚只需不合并该分支，或把分支重置到 `e3b5b09` 之前的基线；main 仍是 `6672f3a`。
- 本地候选产物可由上一版 source.zip 重建；没有改题库、存储 key 或用户数据格式，回滚不涉及数据迁移。

## 8. 结论

Warm Academic 3.1 在 3.0 识别基础上完成全站精修：首页首屏、错题空态、规范页、题库范围、期末入口和统计结论都有实质变化；85 项回归、8 视口、公式、无障碍与性能门禁通过。当前只是候选构建，未合并、未发布，等待 CI 与用户批准。
