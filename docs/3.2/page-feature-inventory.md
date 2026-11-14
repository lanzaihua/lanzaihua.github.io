# Warm Academic 3.2 · 页面与功能清单

基线：`1f551e5`（tree `ebc29eed`，与远端 main `12694a7` 同 tree）。
候选构建：`2026.11.14-3b0bc353`（本地，未推送、未部署）。
范围：`src/index.template.html`、`src/js/*`、`src/styles.css`、`server.js`、`build.js`、`tools/`、`tests/`。
本清单按“用户能到达的页面/弹窗”组织，不把内部函数当页面。

## 1. 路由与入口

| 路由 | 页面 | 入口 |
|---|---|---|
| `#/home` / `#/welcome` | 首页 | 品牌、浏览器根地址 |
| `#/<subject>` | 科目总览 | 首页四科卡、侧栏科目 |
| `#/<subject>/overview` | 总览 | 顶栏“总览” |
| `#/<subject>/stats` | 统计 | 顶栏“统计” |
| `#/<subject>/entries` | 错题 | 顶栏“错题”、首页科目卡 |
| `#/<subject>/entries?e=<id>` | 错题并展开指定条目 | 通知、复制链接、最近记录 |
| `#/<subject>/templates` | 模板库 | 顶栏“模板库” |
| `#/<subject>/bank` | 题库 | 顶栏“题库”、去题库 |
| `#/<subject>/guide` | 规范 | 顶栏“规范” |
| `#/notes` | 笔记库 | 顶栏“笔记本” |
| `#/notes/kb` | 知识笔记 | 笔记库“知识笔记”页签 |
| `#/final` | 期末复习 | 顶栏“期末复习” |
| 未知顶层路由 | 重定向首页 | 404 兜底，提示“链接指向的页面不存在” |
| 科目后未知子路由 | 回科目总览 | 同上 |

科目 id：`gaodai`（高代）、`shufen`（数分）、`jieji`（解几）、`xijing`（西经，兼容旧 `xifang`）。
所有路由均可直接深链；无扩展名的 `/gaodai`、`/shufen/bank` 由 404 页还原成 hash。

## 2. 页面/弹窗

| # | 页面/弹窗 | 主要组件与操作 | 数据源 | 存储/API | 3.2 测试状态 |
|---|---|---|---|---|---|
| 1 | 首页 | 问候标题、STUDY DESK 工作台（错题总数/待复习/已掌握/完成度/今日建议）、四科进度、最近记录、学习节奏、四科入口、笔记/期末入口、更新/语言/设置/通知 | `state`、四科题库/模板/错题、主题、昵称 | localStorage `sanke-cuotiben-v1`、`sanke-theme` 等；可选 `/api/state` | qa-responsive 8 视口；1440×1000 四卡首屏新断言；深色 |
| 2 | 科目总览 | 科目 hero、统计四格、按章索引、错因分布、最近动态、复习法 | 题库、模板、错题统计 | 同上 | qa-responsive，溢出/焦点/深色 |
| 3 | 统计 | 累计错题/掌握/待复习、题库/模板数、近 14 天、四科对比、错因/章节分布、模拟考成绩 | 错题、复习打卡、模拟考历史 | 同上 | qa-responsive，空态/真实数据两种 |
| 4 | 错题列表 | 状态筛选、章/小节/模板/日期/星级/排序、清空筛选、空态三步卡、条目展开 | 错题、模板、题库同类题 | 同上 | qa-responsive；E2E 新增/筛选/展开 |
| 5 | 错题条目 | 题目、标准解答、详细解析、答案、要点、易错点、同类题、复习打卡、笔记、编辑/删除/复制/加入期末 | 错题、题库、笔记 | localStorage；可选同步 | qa-responsive 展开/高度；严格 QA 校验解答开头 |
| 6 | 模板库 | 章节筛选、章节索引、模板卡展开、复制 Markdown、去题库、手动新增 | 模板数据（118 张） | localStorage 用户模板 | qa-responsive；技能包 10/23/6/17 |
| 7 | 题库 | 来源（全部/考研同型/教材课后/习题集）、章节/小节、题型、形式、模板、难度、当前范围、题数、清空筛选、展开解答/加入错题/加入期末/复制 | 四科题库 1559/3522/1199/2883，共 9163 | 只读内置数据 + 用户错题 | qa-responsive 级联筛选；严格 QA |
| 8 | 规范 | 四格要点、字段表、编号、格式、复习法、示例、数据维护；手机改卡片 | 静态文案 | 无 | qa-responsive 表格/卡片 |
| 9 | 知识搜索面板 | 搜索框输入、防抖 420ms、章节/概念命中、相关题目、加入知识笔记 | 四科 skills、题库 | 只读；加入笔记写 localStorage | phone-390 E2E：打开、aria-expanded、Escape 关闭、焦点回搜索框 |
| 10 | AI 智能录入弹窗 | 题目文字/图片（≤3）、错因、章节提示、思考模式、技能包、提交/取消、进度 | 用户输入、AI 配置 | `/api/solve`、AI 配置 localStorage（Key 不入库） | 3.1 截图 + 现有 AI E2E；真实 API 未验证 |
| 11 | 智能扫描/OCR | 拍照/相册、旋转/裁边、识别文字、逐页保存/导出 PDF | 图片 | `/api/ocr`；无 API 时禁用并说明 | 3.1 审计；真实 OCR 未验证 |
| 12 | AI 出题 | 选科目/章节/小节、题数/分值、真实进度、取消 | 题库、AI | `/api/solve` 流式 | 现有 E2E；真实 API 未验证 |
| 13 | AI 批改 | 逐题批改、进度、取消回退标准答案 | 答卷、AI | `/api/solve` | 现有 E2E；真实 API 未验证 |
| 14 | 笔记库 | 手写笔记/知识笔记页签、新建、导入图片/PDF、扫描、搜索、科目筛选 | 笔记 | localStorage；导出 JSON | qa-responsive |
| 15 | 笔记本编辑器 | 多页、画笔/荧光笔/橡皮/套索/直线、颜色、纸张、插入文字/图片、撤销、重命名/封面/交换、导出/PDF | 笔记页 | localStorage；PDF 库 | qa-responsive 打开/关闭 |
| 16 | 知识笔记 | Markdown 编辑/预览、双链、标签、图谱、搜索、删除 | 笔记 | localStorage | qa-responsive |
| 17 | 期末复习 | 考试日期/时长/材料、跳科目、出模拟卷/进行模拟考、复习计划、我的模拟卷 | 错题/题库 | localStorage | qa-responsive |
| 18 | 模拟考章节弹窗 | 全选/清空、章/小节、已选统计、从标准题库开考 | 题库 | 无 | 2026-11-12 已改为单列卡片；qa-responsive 断言 |
| 19 | 模拟考运行页 | 倒计时、答题卡、客观题、主观题输入/手写、临时离开、交卷、防作弊锁 | 试卷 | localStorage 草稿 | qa-responsive；3.1 截图 |
| 20 | 模拟考结果 | 总分、逐题展开/收起、只看错/未答、导出 DOCX/PDF、再考一次 | 试卷/答卷 | 本地 | qa-responsive + 导出脚本 |
| 21 | 试卷编辑器 | 选题/移除/排序、加入题库/错题、导出 DOCX/PDF、保存 | 题库/错题 | localStorage | 3.1 截图；导出真实文件未逐页验证 |
| 22 | 通知中心 | 全部/未读、单条已读、一键已读、删除选中、清空、通知详情 | 通知 | localStorage | 3.1 E2E；同日不重复规则 |
| 23 | 更新记录 | 最近 8 组默认展开、历史折叠、按日期/标题/摘要/分组展示 | `UPDATE_LOG` | 构建内置 | 2026-11-14 23 项/23 组；qa-site-consistency |
| 24 | 设置与同步 | 主题、昵称、语言、AI 协议/模型/Base URL/Key、保存/清除、同步 token、导出/导入 | 设置、AI 配置 | localStorage；`/api/state`、`/api/ai/status` | qa-a11y 8 路由；qa-responsive 5 区；触控 40 |
| 25 | 备份导出/导入 | 导出 JSON、导入 JSON、合并冲突弹窗、损坏文件拒绝覆盖 | 全量用户数据 | 文件系统 | qa-responsive 下载+导入往返；AUD-001 回归 |
| 26 | 本地服务端同步 | GET/PUT `/api/state`、revision 冲突 409、损坏 500、令牌认证、非回环绑定 | `data/state.json` | Node `server.js` | tests/server.test.js 5 项；真实多设备同步未验证 |
| 27 | PWA/离线 | manifest、Service Worker v2、缓存 200 同源响应、跳过 `/api`/Range、离线回最近成功页 | 静态资源 | Cache Storage | 3.1 审计；离线 E2E 部分 |
| 28 | 404/深链 | `404.html` 还原 hash、静态 404 状态、MIME、no-referrer | 无 | 无 | 3.1 审计；qa-responsive 深链 |
| 29 | 静态导出/DOCX/PDF | 导出单文件 HTML、静态站 zip、模拟考/试卷 DOCX/PDF | 构建产物 | 构建 | verify-build；真实 DOCX/PDF 未逐页验证 |
| 30 | 服务端 API | `/api/health`、`/api/ai/status`、`/api/solve`、`/api/ocr`、`/api/state` | `state`、AI 上游 | Node/HTTP | server.test.js：health、认证、SSRF、413、损坏状态 |

## 3. 数据与存储边界

- 主存储 key：`sanke-cuotiben-v1`（错题/模板/笔记/设置/通知/模拟考等聚合状态）。
- 同步令牌：`sanke-sync-token`；主题另有独立 key；AI Key 仅存 localStorage，导出备份时删除。
- 内置题库只读：`src/data/bank-*.json`，不写入用户数据；用户“加入错题”是复制条目。
- 备份 schema v4；导入必须校验版本/结构，失败不覆盖现有数据。
- 题库总数 9163（1559/3522/1199/2883）；教材课后 590；习题集 223；模板 118。

## 4. 状态说明

- 已由 8 视口真实 Chromium 覆盖：首页、总览、统计、错题、模板、题库、规范、笔记、知识、期末、设置、更新记录、深色、深链、备份往返。
- 未在真实手机/平板、Safari、Firefox、WebKit 验证；只能用“模拟视口”表述。
- 真实 AI/OCR、逐题 9163 验算、逐页 DOCX/PDF、干净 clone `npm ci` 未在 3.2 重新验证，标记“未验证”。
- 15MB 单文件、`no-cache` meta 仍保留，属架构级风险，未在本轮拆包。
