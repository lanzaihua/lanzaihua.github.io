# Warm Academic 3.0 全站界面重构与验收报告

- 站点：https://lanzaihua.github.io/
- 仓库：https://github.com/lanzaihua/lanzaihua.github.io
- 项目目录：D:/学习/大一/错题本网页
- 基线 commit：4c1428ca4ac539548f57b9d893cf3e62b1be1df1（main）
- 本轮构建：2026.11.13-a7ea7cf2
- 验收日期：2026-11-13（Asia/Shanghai）
- 说明：本报告只记录实际执行过的检查；未运行的项目在“未验证项与剩余风险”中明确列出。

## 1. 原始界面与改造范围

改造覆盖 10 个界面和 6 类运行态，不是只改首页：

| 界面 | 本轮处理 |
|---|---|
| 首页 | 保留问候与四科入口；加入学习工作台（错题总数、待复习、已掌握、完成度、今日建议、四科进度、最近记录、连续学习、近 7 天节拍、AI 智能录入）；手机四科卡恢复模板/题库计数 |
| 四科总览 | 统一页头、科目主卡、统计四格、总索引、错因分布、按章索引；手机按章索引由横向表格改为纵向卡片 |
| 错题列表 | 统一工具栏、筛选、空态和条目卡；选项段落改为字母悬挂，长题干与公式自然换行 |
| 题库 | 来源筛选只显示当前科目有题的类型，0 条来源自动回全部；章节/小节级联；题卡选项统一 flex；手机首题进入首屏 |
| 模板库 | 保留手风琴结构，统一章节索引、模板条目、编号与操作区层级 |
| 规范 | 表格、示例、五件套与右侧卡片统一；编号规范拆成“错题 A/M/G/E”和“题库/模板 GA/MA/GE/WE” |
| 笔记库 | 只保留页内搜索；统一笔记本空态、知识笔记卡、标签与元信息；顶栏搜索不再重复 |
| 期末复习 | 两入口改为等宽卡片；日期、复习计划、复习材料与我的模拟卷统一分区；空态文案说明可从标准题库抽题 |
| 模拟考 | 章节选择弹窗单列大章 + 手风琴小节；考生守则统一；运行页加入 27 题答题卡；结果页与评分区统一 |
| 设置/通知/更新记录 | 设置按主题、语言、AI、同步分区；通知工具条与更新记录折叠规则统一；最新 8 组默认展开，历史折叠 |
| 深色模式 | 独立 token 覆盖，底色 #1D1B18，不使用纯黑 |

## 2. Design Tokens

核心 token 已写入 `src/styles.css` 的 Warm Academic 3.0 权威层：

| Token | 值 | 用途 |
|---|---|---|
| `--color-bg` | #F6F4EE | 暖白页面底色 |
| `--color-surface` | #FFFFFF | 面板、卡片 |
| `--color-surface-muted` | #EEEAE1 | 次级面板、空态 |
| `--color-text` | #302C28 | 主正文 |
| `--color-text-secondary` | #827B72 | 辅助说明 |
| `--color-border` | #E8E3DA | 细边框 |
| `--color-primary` | #C8754D | 陶土强调色 |
| `--color-primary-hover` | #B76540 | 悬停 |
| `--color-primary-strong` | #A85F3B | 实心按钮/选中底色（满足白字对比度） |
| `--color-primary-ink` | #9E5636 | 小字号强调文字（新增对比度修正） |
| `--color-success` | #64866C | 成功 |
| `--color-warning` | #C18D43 | 警告 |
| `--color-danger` | #BD665D | 危险 |
| `--color-info` | #6685A5 | 信息 |
| `--offpeak-sage` | #B7C1AF | 谷时进度条，按用户参考图取色 |

四科辅助色：高代 `#5F7D9C`、数分 `#6F8C76`、解几 `#83719B`、西经 `#B08855`；另设四科深色文字变体 `#46617C` / `#4F6857` / `#665377` / `#8A5E32`，只用于小字号科目标记。辅助色不承担正文语义。

排版实测（1440 宽）：首页 Display 68/70、页面 H1 42–46、分区 H2 20–22.5、正文 13.5/23.6、辅助说明 10–11.5、标签 10。圆角使用 6–9px（控件）、12–16px（卡片/弹窗）、18px（大容器）；间距以 4px 为基础，常用 4/8/12/16/20/24；深色模式单独覆盖，无纯黑背景。

## 3. 组件与交互状态

统一并实际覆盖的组件：

- Button：默认、hover、active、focus-visible、disabled；主按钮 38px 高，次按钮 36px，图标按钮 34–36px。
- Input / Select / Search：36px 高、8px 圆角、focus-visible 3px 暖色环；筛选器在小屏改为两列。
- Tabs / 科目切换：桌面下划线，手机横向可滚动；跨模块入口（期末复习/笔记库）改为实心选中。
- Card / Panel：暖白底 + 白面板 + 细边框 + 轻阴影；同一页面不再所有元素都浮起。
- Dialog / Drawer：统一 16px 圆角、遮罩、标题区、底部操作区；设置、更新记录、模拟考章节选择均已检查。
- Table：表头暖灰、行分隔线；手机按章索引改为卡片，不再横向挤压。
- Toast / Badge / Progress / Empty / Loading：统一色阶、字号和间距。
- 图标：沿用项目既有线性图标，不新增手写 SVG、不引入图标库。
- 动效：120–220ms 过渡；`prefers-reduced-motion` 下关闭动画与平滑滚动；无循环背景动画。

## 4. 关键实现与改动文件

- `src/styles.css`：Warm Academic 3.0 权威层；四科辅助色；深色模式；按钮/输入/卡片/表格/弹窗/答题卡/更新记录统一样式；谷时条 #B7C1AF；小字号对比度修正。
- `src/index.template.html`：首页学习工作台容器。
- `src/js/15-shell.js`：工作台渲染、今日建议、四科进度、最近记录、连续学习与 7 天节拍、科目深色索引。
- `src/js/59-exam.js`：答题卡、题号跳转、已答状态、考生守则与结果页选项结构。
- `src/js/30-library.js`：题库来源筛选、空来源回退、选项结构、规范页编号说明。
- `src/js/58-final.js`：期末复习空态与材料说明。
- `src/js/48-changelog.js`：2026-11-13「暖白学术与全站收口」19 项/19 组，通知唯一。
- `src/js/40-editor.js`：导入合并完成后关闭冲突弹窗与导入弹窗（修复弹窗挡设置页）。
- `src/js/10-markdown.js`：行内分式降级、math-tail 紧邻标点、选项段落悬挂。
- `src/js/20-entries.js`：错题题干/原文选项段落转换。
- `src/data/seed.json`：规范页编号口径与标准解答收束说明。
- `tests/regressions.test.js`：新增 Warm Academic token、学习节拍、答题卡、对比度选择器等回归；73 项。
- `tools/qa-a11y.js`：新增 axe WCAG 2A/AA 扫描；已接入 `npm run qa:a11y` 与 GitHub Actions。
- `tools/qa-site-consistency.js`：新增设计 token、谷时色、无障碍选择器门禁。
- `.github/workflows/quality.yml`：构建、发布一致性、技能包、六视口、公式、无障碍、性能全部作为必需步骤。
- `README.md` / `CHANGELOG.md` / `导出/GitHub-README.md` / `导出/GitHub-CHANGELOG.md`：最新 19 项块、当前截图、版本徽章与历史折叠。
- `assets/v2/20261113-*.png`：首页、总览、笔记、模板、规范、期末、欢迎、更新记录截图。

## 5. 测试与验收结果

以下均为实际执行结果：

| 项目 | 结果 |
|---|---|
| `npm test` | 73 tests / 73 pass / 0 fail |
| 严格题库 QA | 9163 总题、55 章、825 桶、每桶 ≥10、0 problems / 0 warnings |
| 题库审计 Python | BANK AUDIT PASS，教材课后 590，习题集 223 |
| 站点一致性 | `{ok:true, totals:[1559,3522,1199,2883], dates:22}` |
| 技能包一致性 | 4 科 10/23/6/17 章，problems [] |
| 构建一致性 | root / dist / dist-pages 均为 2026.11.13-a7ea7cf2 |
| 公式检查 | 5 个页面 raw []、broken 0 |
| 六视口真实交互 | 390×844、360×800、430×932、834×1112、1112×834、1440×1000 全部 failures=0，errors=[] |
| 横向溢出 | 六视口均为 doc/body 横向 -10（无溢出）；深色模式 -10 |
| 数据保护 | 浏览器内备份往返：beforeCount=1、afterCount=1，导入弹窗关闭 |
| 无障碍 | axe WCAG 2A/AA：首页、总览、错题、题库、模板、规范、期末、笔记 8 个路由均为 0 violations |
| 性能 | FCP 552ms、DCL 697ms、load 705ms、题库切换 534ms、JS 堆 27MB、120 卡；problems [] |
| 更新记录 | 2026-11-13 仅一块，19 项/19 组；最新 8 组展开、历史折叠 |
| 通知 | 全新存储下 1 条 update，标题「网页已更新 · 2026-11-13 · 暖白学术与全站收口」，无 pageerror |
| 谷时进度条 | 计算样式与截图均为 rgb(183,193,175) / #B7C1AF |

对比度修正记录：首轮 axe 在题库选项、模板编号、首页科目序号、跨模块选中、期末小标题和笔记空态标记上报 serious color-contrast；已新增 `--color-primary-ink` 与四科深色变体、将实心选中底改为 `--color-primary-strong`、提高笔记空态标记字号，复测 8 个路由全部 0 violations。

## 6. 改造前后截图

改造前审计截图：`debug/audit-m28963-*.png`、`debug/m28963-*-390.png`。
改造后截图：

- `assets/v2/20261113-home.png`
- `assets/v2/20261113-overview.png`
- `assets/v2/20261113-notes.png`
- `assets/v2/20261113-templates.png`
- `assets/v2/20261113-guide.png`
- `assets/v2/20261113-final.png`
- `assets/v2/20261113-welcome.png`
- `debug/wa-bank-1440.png`、`debug/wa-bank-390.png`
- `debug/wa-settings-1440.png`、`debug/wa-settings-390.png`
- `debug/wa-exam-chapters-1440.png`、`debug/wa-exam-running-1440.png`、`debug/wa3-exam-cardnav-1440.png`
- `debug/wa-home-dark-1440.png`
- `debug/wa-defer-1440.png`
- `debug/wa-changelog-1440.png`

截图均人工目检过标题、正文、按钮、表格、弹窗、公式与移动端换行。未做像素级 diff 自动比对，原因是本轮是布局级重构，像素差异不代表回归；可访问性和可见性判断以 DOM 计算样式与 axe 结果为准。

## 7. 已修复的真实问题

1. 手机顶部导航过高导致题库首题落在首屏外：压缩顶栏、隐藏重复功能图标、手机隐藏重复页面操作区。
2. 首页四科卡在手机只显示错题数：恢复模板/题库计数。
3. 来源筛选中 0 条“习题集”死路：只显示当前科目有题来源，切科后自动回全部。
4. 错题/题库/模拟考选项字母被长公式挤成单独一行：字母固定悬挂，正文 flex:1、min-width:0。
5. 知识点搜索行内分式撑高行盒：统一从展示分式降级为普通分式，标点与公式绑定。
6. 更新记录同屏显示 19 组过长：最新 8 组展开，历史折叠；说明与行为一致。
7. 规范页编号混淆：错题 A/M/G/E 与题库 GA/MA/GE/WE 分开说明。
8. 设置弹窗确认导入后仍遮挡页面：合并成功同时关闭冲突与导入弹窗。
9. 小字号对比度不足：新增深色文字 token 并修正 8 个路由，axe serious 归零。
10. 谷时条颜色与参考图不一致：统一为 #B7C1AF。

## 8. 未验证项与剩余风险

- 真实 AI 调用、真实 OCR 扫描未在本轮重跑（没有可用 Key / 扫描服务）；只验证了无 Key 时的界面、错误和本地队列。
- Safari、Firefox 未实测；浏览器测试使用 Playwright Chromium。
- DOCX / PDF 导出的逐页版式未在本轮重新渲染检查。
- 未做自动化像素 diff；视觉回归以截图目检 + DOM 几何/溢出检查为主。
- 弹窗焦点陷阱没有自动化断言；已确认 focus-visible 环和键盘可达，但未声称完整焦点管理。
- 9163 道题的逐题数学正确性未重新审计；沿用严格结构与内容门禁。
- 深色模式覆盖主要页面和设置；第三方嵌入样式若有遗漏需后续真机复核。

## 9. Git 与发布

- 基线 main：`4c1428ca4ac539548f57b9d893cf3e62b1be1df1`
- 设计分支：`redesign/warm-academic-3`
- 功能提交：`dfc1187e715fe66304b0e3c441ff7f3c1ade5738`（27 文件）、`ab54c75a7dcd8f01e23e9802bc20e920a30592fa`（验收报告、source.zip、SHA256SUMS、打包脚本）
- 功能分支 CI：Quality checks `43419400267` success、`43419791023` success（含新增 WCAG 步骤）
- 合并 main：`e40e84e9d859974600072ecc14067eb02440d119`
- main CI：Quality checks `43420893497` success；pages build and deployment `43420892897` success
- 线上：`https://lanzaihua.github.io/?v=a7ea7cf2`，页面内构建号 `2026.11.13-a7ea7cf2`
- 发布前本地门禁：`npm test`、严格 QA、站点一致性、构建一致性、技能包一致性、六视口、公式、无障碍、性能全部通过。

## 10. 结论

本轮把全站从“多套补丁叠加”收口为一套 Warm Academic 3.0 设计 token 与组件规则；页面结构、三端、深色、公式、答题卡、无障碍与性能均有实际检查结果。没有删除功能、题库、技能或用户数据，没有降低测试；题库仍为 9163（1559/3522/1199/2883）、55 章、825 桶。
