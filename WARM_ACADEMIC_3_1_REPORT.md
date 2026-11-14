# Warm Academic 3.1 全站视觉精修报告

日期：2026-11-14
最终构建：2026.11.14-f0b20569
状态：已合并 main、已部署 GitHub Pages、已发布 GitHub Release
线上地址：https://lanzaihua.github.io/

## 1. 范围与边界

本轮在 Warm Academic 3.0 上做全站视觉、排版、信息架构与文档校准，不重做产品、不删除功能入口，不改题库内容、答案、公式、数据结构、存储 key、备份格式、同步协议或 AI 工作流。

继续沿用 3.0 的暖白纸面、砖红强调、衬线标题、Study Folio 档案排版和四科低饱和识别色。改动重点是阅读体验、信息层级、内容密度、页面节奏与三端一致性，而不是换一层全局背景。

## 2. 实际改动

### 首页与学习工作台

- 问候区、工作台、今日建议、四科进度、最近记录与学习节奏重新排布；桌面压缩到 1440×1000 首屏完整露出四科入口。
- 手机顺序改为问候 → 四科入口 → 笔记库/期末复习 → 工作台，零数据工作台不再把科目入口推到首屏之后；工作台不被隐藏。
- 四科入口保留学科编号与识别色；零数据不画假进度，空态给出真实下一步。

### 四科总览与错题

- 四科总览统一科目标题、掌握进度、统计带和章节索引；统计全部来自本机真实记录。
- 错题空态改为三步起步卡：从题库挑一道、手动新增、智能录入；筛选无结果仍提示换条件或清空，不用假数据填满。
- 错题详情保持「题目 → 作答/错因 → 标准解答 → 详细解析 → 答案 → 要点 → 易错点 → 复习操作」的教材阅读顺序。
- 公式、矩阵、分式、长题干和长选项按行内/块级规则换行；长公式可横向滚动，不再把整个单词或半个等式挤成一行。

### 题库与模板库

- 题库筛选下新增「当前范围 / 条件 chip / 命中题数」结果条，桌面与手机都能看到当前筛选。
- 手机筛选为折叠台，展开后保留完整来源、章节、题型、形式、模板、难度；切到没有习题集的科目时来源自动回到全部，不出现 0 条死路。
- 题目卡片弱化编号和标签，题干保持视觉主体；选项字母固定悬挂，长选项在右侧自然换行。
- 模板库与题库共用分页、筛选、章节和小节逻辑；章节索引保持单列可读。

### 规范与指南页

- 新增四格要点（5 必填字段、02 套编号、7 复习节点、01 套写法）和右侧 01/02/03 目录。
- 桌面保留三列表格；手机改成带字段名的纵向信息卡，不再把三列压成需要左右拖动的细条。
- 编号规范拆成两套：错题 A/M/G/E，题库与模板 GA/MA/GE/WE；两种编号不再混用。
- Markdown、LaTeX、编号、链接和列表在表格与卡片内正常渲染，长文本可换行。

### 期末复习与模拟考

- 两个入口改成 FINAL WORKFLOW 的 01/02 阶段卡：先出模拟卷，再开考；标准题库开考为主，AI 出题为次，窄屏单列，不再像两张重复大卡。
- 章节选择弹窗保留单列大章、手风琴小节、全选/清空、原地更新与 10 章 72 小节统计。
- 模拟考准备、答题、答题卡、倒计时、交卷确认、结果页与导出保持原有业务逻辑；视觉上区分准备、作答、批改、结果四种状态。

### 统计中心

- 五个面板各补一句真实数据结论：最忙的一天、四科累计与最高、错因最多、章节最集中、最近均分/最高分；没有数据时显示明确空态，不画假柱。
- 统计范围在本机 localStorage；深色模式下图表与文字保持可读。

### AI、笔记、更新记录与设置

- AI 智能录入弹窗：提交行底部吸附，正文可滚动，桌面初始视口不再裁掉「生成并自动入库」；窄屏按钮可点到。AI 配置、OCR、出题、批改和错误处理逻辑未改。
- 笔记库恢复笔记本/知识笔记入口；移动端搜索、科目切换、主操作与编辑器可点；编辑器保留 Markdown、LaTeX、图片、手写和导入导出。
- 更新记录最近块默认展开、历史折叠；长文本按标题、摘要、分组卡片三层阅读。
- 设置保持外观、语言、AI、数据、备份、同步五段，不删流程；导入导出与备份恢复弹窗保留。

### 文档与发布边界

- 网页更新记录、README、CHANGELOG 同步为 2026-11-14 的 23 项 / 23 组、85 项回归、8 视口。
- README 九枚徽章保持两两不同色；历史更新继续折叠在 details 中。
- 发布前核对构建号、三端页面与仓库文档；未把候选构建写成已发布。

## 3. 修改文件

- src/js/20-entries.js：错题空态三步引导。
- src/js/30-library.js：规范页字段速览、目录、表格装饰；题库当前范围条。
- src/js/58-final.js：期末两个入口的阶段卡与主次按钮。
- src/js/16-stats.js：五块统计的真实数据结论。
- src/js/15-shell.js：首页工作台抬头与结构。
- src/js/48-changelog.js：2026-11-14 更新块、通知摘要与发布边界。
- src/js/90-init.js：规范页目录跳转。
- src/styles.css：3.1 权威样式层、首屏压缩、手机顺序、错题空态、规范卡片、题库范围条、统计结论、表格与触控规则。
- tests/regressions.test.js：3.1 首屏/空态/移动端回归，共 85 项。
- README.md、CHANGELOG.md：最新块、构建号、23 项、85 项、8 视口同步。
- index.html、dist/index.html、dist-pages/index.html、导出/四科错题本.html、source.zip、SHA256SUMS、导出/四科错题本-静态站.zip：发布产物。

## 4. 质量门禁结果（实际运行）

- npm run check：85 tests / 85 pass / 0 fail；STRICT QA PASS（9163 题、55 章、825 桶、每桶 ≥10、0 problems / 0 warnings）；site consistency {ok:true,totals:[1559,3522,1199,2883],dates:23}；LANGUAGE GATE PASS；BANK AUDIT PASS（教材课后 590）。
- npm run verify:build：ok=true，root / dist / dist-pages 均为 2026.11.14-f0b20569，problems []。
- npm run verify:pages：四科 1559 / 3522 / 1199 / 2883，dist-pages 生成成功。
- npm run verify:skills：四科章节 10 / 23 / 6 / 17，problems []。
- npm run qa:responsive：8 个设备全部 failures=[]；phone-390/360/430、tablet-768、tablet-portrait/landscape、desktop、desktop-1920；所有路由横向无溢出；备份导出/导入往返 1→1；深链 404 还原 #/gaodai；路由焦点 H1；深色无溢出；无 pageerror。
- npm run qa:formulas：overview / entries / templates / bank / guide 全部 raw []、broken 0。
- npm run qa:a11y：首页、总览、错题、题库、模板库、规范、期末、笔记 8 个路由 axe 结果均为 []。
- npm run qa:perf：发布前候选构建 FCP 608ms、DCL 1008ms、load 1015ms、bankSwitch 676ms、heap 27MB、cards 120，problems []。
- GitHub Actions：regression / build / deploy 全部 success；Pages latest build commit 61b4cd95，status built。
- 未运行项：npm ci --ignore-scripts 未在最终提交上重新执行（当前 node_modules 已存在），见第 7 节。

## 5. 截图

目录：debug/warm31-review/。

最终截图共 84 张：

- 9 个主页面 × 6 种视口：home、overview、entries、bank、templates、guide、notes、final、stats；每种覆盖 1440 浅色/深色、834 浅色/深色、390 浅色/深色，共 54 张。
- settings、changelog、ai、final-exam、mock-chapters 各 6 种视口，共 30 张。
- 每张截图均在真实 Edge/Chromium 中打开本地最终构建，拦截 /api/state 避免同步提示遮挡，并清掉 toast 后截取。

重点截图：

- 3.1-home-1440-light.png：首屏四科入口完整可见。
- 3.1-home-390-light.png：四科入口在首屏前半段。
- 3.1-guide-834-dark.png：规范页四格要点、三列表格与深色 token。
- 3.1-guide-390-light.png：规范页手机纵向字段卡。
- 3.1-final-exam-390-dark.png：期末 01/02 阶段卡与选中状态。
- 3.1-ai-390-dark.png：智能录入弹窗底部提交行。
- 3.1-mock-chapters-1440-light.png：标准题库章节选择弹窗。
- 3.1-bank-1440-light.png：题库当前范围条与选项悬挂。
- 3.1-stats-390-dark.png：统计中心空态与深色可读性。

改造前对照可参考 debug/a4-1440-home.png、a4-1440-gaodai-bank.png、a4-1440-gaodai-entries.png、a4-1440-gaodai-guide.png、a4-390-home.png 等早期 3.0 截图；本轮没有重拍一套完整的 3.0 前后矩阵，因此报告不把旧图当作本轮逐页前后对照。

## 6. Git、PR 与发布

- 3.1 工作分支：warm-academic-3-1。
- PR #1：merged=true，merge_commit_sha 6c9140f8fb8b9352ff6a736966dfe09015019aad。
- PR #2：merged=true，merge_commit_sha 61b4cd95e0e49ce220aa1d7225214de51a27d90c。
- 代码发布提交（main 合并）：61b4cd95e0e49ce220aa1d7225214de51a27d90c；tree 50c993f0b3d8999d10a30584910d377107e6d790。
- 报告文档定稿：main 上的后续 docs commit；只改文档，不改变构建号。
- 最终构建号：2026.11.14-f0b20569；root index.html 15,965,519 bytes。
- GitHub Release：v2026.11.14「健壮性修复与发布」，tag 指向 61b4cd95。
- 资产：source.zip 19,343,464 bytes；sike-cuotiben-static.zip 2,419,645 bytes；20261114-changelog.png 338,959 bytes；SHA256SUMS 78 bytes（source.zip 一行 ab5cbbae...）。
- 发布方式：因 github.com:443 直连被重置/超时，使用 GitHub Git Data API 创建 blob/tree/commit 并更新 ref；PR 用 GitHub API 合并。

## 7. 未验证项与剩余风险

- 未在真实 iPhone / iPad / Android 设备上验证，只在 Chromium（Edge）中按 8 个视口模拟。
- 未在 Safari、Firefox 实机复测；WebKit 的 MathML 与 sticky 行为仍有浏览器差异风险。
- 未调用真实 AI API 验证智能录入、AI 出题、AI 批改的视觉状态；本轮只验证静态布局与现有 mock/错误边界。
- 未逐题数学验算 9163 道题；只运行题库结构、公式渲染与数据门禁。
- npm ci --ignore-scripts 未在最终提交上重新执行；没有做一次干净 clone 的冷启动验证。
- 题库仍是 15MB 单文件；拆成 data/bank.json + IndexedDB，以及 Cloudflare 级缓存迁移，属于架构级改造，本轮没有实施。
- 线上 head 仍保留 meta http-equiv="Cache-Control" content="no-cache, must-revalidate"，静态托管的缓存策略没有改成长期缓存。
- 知识面板手机端宽表目前可横向滚动，但没有「左右滑动」提示，仍有可读性改进空间。
- 本轮截图清理了 toast 与同步提示；真实用户在有云端冲突时会看到提示，这是预期行为。

## 8. 回滚

- 代码回滚：把 main 重置到 3.1 合并前的基线 6672f3a37ac3eafd6ae0b0c4d7194a0c69c8996a，或回退 PR #2 的合并提交 61b4cd95。
- 页面回滚：用上一版 source.zip 重建并重新部署，或把 Pages 指向已发布的上一个 Release。
- 数据回滚：本轮没有改题库、存储 key、备份格式或用户数据；回滚不涉及数据迁移。
- 发布资产回滚：删除 v2026.11.14 Release 与 tag，恢复上一个已发布 Release 的资产与正文。

## 9. 结论

Warm Academic 3.1 在 3.0 识别基础上完成全站精修：首页首屏、错题空态、规范页、题库范围、期末入口、统计结论、AI 弹窗和移动端阅读都有实质变化；85 项回归、8 视口、公式、无障碍与性能门禁通过，已合并、已部署、已发布。剩余风险集中在真实 Safari/移动设备、真实 AI API、干净 clone 冷启动和题库拆包，不应把本轮写成这些项目也已验证。
