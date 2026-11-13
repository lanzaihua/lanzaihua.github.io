# 四科错题本 UI/UX 3.0 改造报告

版本：2026.11.14-ff270e43  
线上：https://lanzaihua.github.io/?v=ff270e43  
仓库：https://github.com/lanzaihua/lanzaihua.github.io  
发布日期：2026-11-14

## 1. 交付结果

本轮在不改业务语义、不删功能、不降测试的前提下，完成全站视觉与交互收口：

- 建立 Warm Academic 3.0 设计系统与 Design Tokens。
- 重做公共外壳：品牌、侧栏、顶栏、标签、按钮、输入框、卡片、弹窗、空态。
- 重做首页学习工作台与统计中心信息层级。
- 修复手机端页头过高、主操作被隐藏、题库首题落屏外、规范表格横向裁切、更新记录提示缺失、模拟考结果整页铺开等问题。
- 补齐 WCAG 对比度、键盘焦点、触控尺寸与深色模式。
- 最终构建、六视口交互、公式、性能、无障碍与 GitHub Actions 全绿。

## 2. 页面清单

| 页面 | 路由 | 改造要点 |
|---|---|---|
| 首页 / 学习工作台 | `#/home` | 问候区、2×2 指标、今日建议、四科进度、最近记录、近 7 天节拍、科目入口、笔记与期末入口 |
| 四科总览 | `#/{subject}/overview` | 学科封面、四项统计、总索引/错因双栏、按章索引、最近动态、复习法 |
| 错题列表 | `#/{subject}/entries` | 筛选条、错题卡、状态、七层详情、复习打卡、笔记区 |
| 模板库 | `#/{subject}/templates` | 章节目录、模板折叠列表、筛选 |
| 题库 | `#/{subject}/bank` | 来源/章节/题型/形式/模板/难度筛选、题卡、选项、解答、Markdown 复制 |
| 规范 | `#/{subject}/guide` | 条目规范、编号规则、格式示例、维护约定；移动端表格卡片化 |
| 统计中心 | `#/{subject}/stats` | 六指标、14 天记录、四科对比、错因、章节、最近模考 |
| 期末复习 | `#/final` | 入口卡、考试日期、复习计划、材料、模拟卷、模拟考 |
| 笔记库 | `#/notes` | 笔记本、知识笔记、搜索、扫描、导入导出 |
| 设置与同步 | 弹窗 | 外观、语言、AI、数据、同步、备份分区 |
| 更新记录 | 弹窗 | 最新 11 组、历史折叠、通知 |
| 知识点面板 | `#kbAnswerPanel` | 教材定位、核心概念、相关题目、加入笔记 |
| 模拟考 | `#/final` 内 | 章节弹窗、规则、运行、答题卡、交卷、结果筛选、DOCX/PDF |

## 3. 设计系统

### 3.1 定位

Quiet Editorial / Study Folio：暖白纸面、纯白面板、细线分隔、砖红强调、学术编辑排版。不是通用 SaaS 卡片模板，也不是 landing page。

### 3.2 Design Tokens

```css
--ui-canvas: #F6F4EE;
--ui-surface: #FFFFFF;
--ui-surface-muted: #EEEAE1;
--ui-ink: #302C28;
--ui-ink-secondary: #665F56;
--ui-ink-faint: #665F56;
--ui-line: #E8E3DA;
--ui-line-strong: #D8D0C4;
--ui-primary: #C8754D;
--ui-primary-hover: #B76540;
--ui-primary-strong: #8F4C2E;
--ui-primary-soft: #F6E6DC;
--ui-success: #64866C;
--ui-warning: #C18D43;
--ui-danger: #BD665D;
--ui-info: #6685A5;
--ui-radius-ctl: 8px;
--ui-radius-card: 14px;
--ui-radius-dialog: 16px;
--ui-radius-big: 18px;
```

学科辅助色只用于学科标识、图表和少量状态，不改变暖白主视觉。

### 3.3 字号与间距

- Display：clamp(44px, 5vw, 66px)
- H1：clamp(30px, 2.9vw, 40px)
- H2：22px
- Body：15px / 1.75
- Meta：12.5px
- 控件高度：38px；手机触控下限：40–44px
- 间距：4px 体系；页面边距、卡片内边距、表单间距、弹窗内边距统一
- 圆角：按钮 8px、卡片 14px、弹窗 16px、大容器 18px

## 4. 组件清单

Button（default/primary/ghost/danger/disabled）、Icon Button、Tab、Segmented Control、Input、Select、Search、Card、Dialog、Drawer、Tooltip、Toast、Badge、Chip、Progress、Table、Empty、Loading、Error、Notification、Answer Card、Chart、Math block。

统一行为：焦点可见、键盘可操作、触控 40px+、弹窗可 Esc 关闭、移动端表单单列、深色 token 同源。

## 5. 改动文件

- `src/styles.css`：Warm Academic 3.0 权威层、移动端、深色、对比度与触控底线
- `src/js/15-shell.js`：数据表移动标签、页脚口径
- `src/js/30-library.js`：题库筛选折叠与来源筛选
- `src/js/59-exam.js`：结果逐题展开、筛选、答题卡
- `src/js/90-init.js`：筛选开关、路由焦点、错误边界
- `src/js/48-changelog.js`：11 项更新记录
- `README.md`、`CHANGELOG.md`：更新记录、徽章、历史折叠
- `tools/qa-responsive.js`：移动筛选展开、六视口真实交互
- `tests/regressions.test.js`：81 项回归
- `UI_UX_3_DESIGN.md`：设计与实施说明

## 6. 改造前后截图

改造前基线：`debug/ui3-before/`、`debug/audit-m28963-*.png`  
改造后桌面：`debug/ui3-1440-home.png`、`overview`、`bank`、`entries`、`templates`、`guide`、`stats`、`final`、`notes`、`settings`、`changelog`  
改造后手机：`debug/ui3-390-*.png`、`debug/ui3final-390-result.png`、`debug/ui3final-390-changelog.png`  
线上复验：`debug/live-ui3-home-390.png`、`debug/live-ui3-bank-390.png`、`debug/live-ui3-bank-1440.png`

两轮视觉审查结论：

1. 第一轮：页面骨架、色彩、排版、层级、品牌一致性成立；发现手机指标带变成单列、设置 AI 行被压窄、H1 出现程序化焦点框。
2. 第二轮：按钮、图标、间距、边框、圆角、状态、公式、移动端细节复核；修复触控尺寸、对比度、结果页展开、题库筛选首题位置、规范表格裁切。

## 7. 响应式与深色

- 390×844、360×800、430×932、834×1112、1112×834、1440×1000 六视口真实点击通过。
- 全路由无页面级横向溢出；390 题库首题从 787px 提前到约 544px。
- 手机顶栏 247px → 146px；834 为 143px；1440 为 65px。
- 深色模式保留切换与持久化，使用中性深色，不纯黑；公式、图表、弹窗均有对应 token。

## 8. 数学公式

- 公式检查覆盖首页、错题、模板、题库、规范、知识点、模拟考、结果页。
- 行内分式降级、标点绑定、选项字母悬挂、MathML inline math、独立公式横向滚动均保留。
- `npm run qa:formulas`：raw []、broken 0。
- 未逐题重算 9163 道题的数学正确性；仅做结构与渲染检查。

## 9. 功能与数据回归

- `npm test`：81 / 81 通过。
- 严格 QA：9163 题、55 章、825 桶每桶 ≥ 10、590 教材课后、223 习题集、0 problems/warnings。
- 站点一致性：totals 1559/3522/1199/2883，dates 23。
- 技能包、构建一致性、语言门禁、题库审计通过。
- 备份往返：导出 gzip → 导入 → 条数 1→1，弹窗关闭。
- 来源筛选、章节级联、解答展开、模拟考章节弹窗、笔记编辑器、设置、更新记录均真实点击通过。

## 10. 无障碍

- WCAG 2 A/AA axe 扫描：8 条路由 0 serious/critical。
- 修复二级/三级文字、品牌副标题、活动标签、主按钮的对比度。
- 路由切换焦点落到 H1；移动端主要按钮 40–44px；触控目标检查 561 个，0 小目标。

## 11. 性能

- FCP 556ms，DOMContentLoaded 934ms，load 943ms，题库切换 649ms，JS 堆 27MB。
- 性能门禁 problems []。
- 单文件约 15.5MB，首次解析成本仍是已知边界。

## 12. Git 与发布

- 最终提交：`5cb5d42a9ddda1158eb90f048a0be294e133e335`
- GitHub Actions `Quality checks`：run 43500333157 success
- Release：`v2026.11.14 · Warm Academic 3.0 与健壮性收口`
- 线上构建：`2026.11.14-ff270e43`
- 通知：1 条 tip + 1 条 update「网页已更新 · 2026-11-14 · 健壮性与全站视觉收口」

## 13. 剩余风险与未验证项

- 未在真实 Safari / Firefox / iOS / Android 设备上逐项验证，只用 Chromium 六视口模拟。
- 未逐题重算 9163 道题的数学正确性；本轮验证的是渲染、结构与数据完整性。
- DOCX / PDF 导出未逐页目检，仅验证入口与流程。
- 视觉回归采用截图基线与人工两轮审查，未建立逐像素自动 diff（CI 字体环境不同，像素基线易误报）。
- 单文件约 15.5MB，低端机首屏解析仍可能偏慢。
- 更新记录已合并为同日一块，但历史 Release 的发布时间来自补建，页面仍可能显示补建日期。
