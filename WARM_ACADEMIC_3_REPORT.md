# Warm Academic 3.0 全站界面重构与验收报告

- 站点：https://lanzaihua.github.io/
- 仓库：https://github.com/lanzaihua/lanzaihua.github.io
- 项目目录：D:/学习/大一/错题本网页
- 基线：main 85be7c22ed5c53da92662ac791a101f80e9fb8df
- 本轮构建：2026.11.13-ce5a2390
- 验收日期：2026-11-13（Asia/Shanghai）
- 原则：只记录实际执行的检查；未运行的项目在“未验证项与剩余风险”中明确列出。

## 1. 改造范围

覆盖 10 个界面、3 类尺寸、明暗两套主题：

| 界面 | 本轮处理 |
|---|---|
| 首页 | 保留问候；加入学习工作台（错题总数、待复习、已掌握、完成度、今日建议、四科进度、最近记录、连续学习、近 7 天节拍、AI 智能录入）；四科卡统一显示模板与题库数 |
| 四科总览 | 统一页头、科目主卡、统计四格、总索引、错因分布、按章索引；手机按章索引改为纵向卡片 |
| 统计中心 | 新增页面：累计错题、已掌握/待复习、题库总量、模板总量、近 30 天复习、已交模拟考；近 14 天柱状图、四科对比、错因分布、章节分布、最近 6 次模拟考成绩；真实数据，空态给出下一步入口 |
| 错题列表 | 统一工具栏、筛选、空态、条目卡；题目和选项共用基线，A/B 字母悬挂 |
| 模板库 | 统一章节目录、手风琴条目、展开态与空态 |
| 题库 | 来源只显示当前科目有题的类型；章→小节级联；题卡选项 flex；手机首题进入首屏 |
| 规范 | 表格化条目规范、编号规则、示例条目；错题编号 A/M/G/E 与题库编号 GA/MA/GE/WE 分开说明 |
| 笔记库 | 统一页头与宽度；隐藏重复搜索框；“前往科目”不再误跳总览 |
| 期末复习 | 两个入口改等宽卡片；日期/时长/复习材料/模拟卷分区；空态说明来源 |
| 更新记录 | 最近 8 组展开，历史折叠；条目标题、摘要、分组卡片三层；同步 README 与 CHANGELOG |

运行态：空态、加载、错误、筛选、弹窗、深色、手机顶栏、模拟考答题卡。

## 2. 文件与规模

- 运行模块：24 个 src/js 文件，新增 src/js/16-stats.js。
- 样式：src/styles.css 约 426 KB，末尾统一为 Warm Academic 3.0 权威层。
- 设计规范：WARM_ACADEMIC_3_DESIGN.md。
- 构建产物：dist/index.html、dist-pages/index.html、根 index.html，单文件约 15.8 MB。
- 题库：9163 题（1559 / 3522 / 1199 / 2883），55 章、825 个章×星级×题型桶、118 张模板。
- 测试：tests/ 共 76 项回归测试。

## 3. 关键修复

### 3.1 深色主题画布与面板失配（P1，本轮发现并修复）

- 现象：切到深色后正文变浅色，但画布仍是浅色，统计页部分标题和说明几乎不可见。
- 根因：Warm Academic 3.0 新增 --color-bg / --color-surface / --color-text / --color-border token，并把 --paper / --surface / --ink 映射到它们；旧深色块只覆盖了 --paper 等别名，没有覆盖新的 --color-* token，后定义层又把浅色值写回。
- 修复：在 src/styles.css 末尾补充明确的 html[data-theme="dark"] 与 prefers-color-scheme: dark 下 html[data-theme="auto"] 两套 --color-* token；深色画布 #1D1B18、面板 #26231F、正文 #F2EEE6、边框 #3B362F。
- 防复发：tests/regressions.test.js 新增 dark theme overrides the new color tokens，断言深色块必须覆盖画布、面板、正文、边框四个 token。
- 验证：深色首页、统计、题库截图 debug/wa3-dark-home-1440.png、debug/wa3-dark-stats-1440.png、debug/wa3-dark-stats-390.png、debug/wa3-dark-bank-1440.png；body 背景实测 rgb(29,27,24)，无横向溢出。

### 3.2 统计中心缺失（P2）

- 新增真实数据统计页，不写死数字；空数据不再拉出空白图表。
- 数据源只读本机错题、复习打卡、题库与模拟考记录，导出的备份重新导入后会重新计算。

### 3.3 手机顶栏与首页页脚（P2）

- 压缩手机与平板顶栏：隐藏重复品牌副标题、主题与语言图标，搜索框独占一行；首页页脚说明与工具按钮分行；平板首页内容垂直居中。
- 360 / 390 / 430 实测无工具按钮遮挡、无横向溢出。

### 3.4 来源筛选死路（P2）

- 高代、数分、解几没有习题集题时不再显示 0 条的“习题集”入口；切科目后 0 条来源自动回到全部。
- 首页、总览、题库副标题统一为考研同型 / 教材课后 / 习题集三类题源。

### 3.5 编号与文案矛盾（P2）

- 规范页区分错题条目编号 A/M/G/E 与题库/模板编号 GA/MA/GE/WE，不再混用。
- 更新记录最近 8 组展开，历史折叠，与设置里的说明一致。
- LOCAL FIRST 横幅与设置里的同步说明统一为“默认保存在本机；可导出备份，或在本机启动 server.js 后连接同步”。

### 3.6 其他

- 模拟考答题卡 27 个题号 34px、已答高亮、点击跳题。
- AI 暂存/峰谷条统一为灰绿谷时色，峰时保留砖红。
- 期末复习两个入口等宽卡片；设置弹窗按主题、语言、AI、同步分区。
- 笔记库隐藏顶栏重复搜索，“前往科目”文案与行为一致。
- README 历史折叠，与网页更新记录同源；11-11 的 109/115、11-08 的 30/57 与三处 undefined 摘要已修正。

## 4. 验收证据

- npm test：76 项，76 通过，0 失败。
- 严格 QA：9163 题、55 章、825 桶、每桶 ≥10、0 problems、0 warnings，STRICT QA PASS。
- 站点一致性：{ ok: true, totals: [1559,3522,1199,2883], dates: 22 }。
- 语言门禁：LANGUAGE GATE PASS。
- 题库审计：BANK AUDIT PASS，教材课后 590。
- 技能包校验：四科 10 / 23 / 6 / 17 章，problems []。
- 构建一致性：root / dist / dist-pages / 导出 HTML 均为 2026.11.13-ce5a2390。
- 公式检查：overview / entries / templates / bank / guide 全部 raw []、broken 0。
- 性能：FCP 544 ms、DCL 717 ms、load 725 ms、题库切换 574 ms、JS 堆 27 MB、120 张卡，problems []。
- 六视口：390×844、360×800、430×932、834×1112、1112×834、1440×1000，真实点击首页科目、题库来源与章节级联、模拟考章节弹窗、笔记、设置、更新记录与备份往返；本地最终运行 failures []、errors 0、无横向溢出，GitHub Actions 六视口步骤 success（run 43459287313）。
- 截图：debug/wa3-home-1440.png、wa3-overview-1440.png、wa3-stats-empty-390.png、wa3-stats-seeded2-1440.png、wa3-guide-vp.png、wa3-final-vp.png、wa3-notes-vp.png、wa3-dark-home-1440.png、wa3-dark-stats-1440.png、wa3-dark-bank-1440.png、assets/v2/20261113-changelog.png。

## 5. 未验证项与剩余风险

- 未在真实 Safari、Firefox、iOS/Android 实机逐页验收；浏览器自动化使用 Chromium/Edge。
- 未对 9163 道题逐题独立数学证明复算；只做结构、公式渲染、答案存在性、选项唯一性、配额与抽样检查。
- guide 表格仍偏密、期末复习两个入口卡层次仍可继续细化；不影响功能，但距离“出版物级”还有空间。
- 导出 DOCX / PDF 未在本轮逐页检查分页与字体嵌入。
- 线上发布与 Release 资产在报告定稿时仍在收尾；CI run 43459287313 已 success，最终线上构建号与 Release 资产以下一线验收为准。
- 体量仍是约 15.8 MB 单文件，首屏解析成本存在；本轮只加性能门禁，未拆分题库包。

## 6. 回滚

- 备份：备份/pre-audit-20261112.tar.gz。
- 代码回滚：恢复 src/js/16-stats.js 删除、还原 src/js/00-core.js 与 15-shell.js 的 stats 接入、还原 src/styles.css 末尾 2026-11-13 段，再重新构建。
- 发布回滚：将 main 指回 4c1428ca4ac539548f57b9d893cf3e62b1be1df1，重新触发 Pages。
