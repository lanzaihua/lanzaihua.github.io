# Warm Academic 3.2 · 缺陷与回归矩阵

基线：`1f551e5`；候选构建：`2026.11.14-3b0bc353`。
分级：P0 数据丢失/安全/不可访问；P1 核心流程失败/错误保存/数据错乱/崩溃；P2 筛选/路由/公式/导入导出/显著视觉；P3 局部样式文案；R 未复现风险。
“已复现并修复”必须有真实命令或浏览器证据；“已检查未发现”不写成已修复。

## A. 本轮已复现并修复

| BUG-ID | 级别 | 页面/范围 | 复现 | 预期 | 实际（修前） | 根因 | 最小修复 | 回归测试 | 结果 |
|---|---|---|---|---|---|---|---|---|---|
| BUG-3.2-01 | P1（工程门禁） | `npm test` / `npm run check` | 运行 `node --test tests/*.test.js` | 测试结束给出 summary 并退出 0 | 跑完约 80 个 ✔ 后无 summary、永不退出；120s 超时 | 1) tests/server.test.js 把 server.js 复制到系统临时目录后 spawn，Node 向上命中 `C:\Users\廖子恒\AppData\Local\Temp\package.json`（非法），子进程 `ERR_INVALID_PACKAGE_CONFIG` 立即退出；2) finally 里 `child.once('exit')` 在已退出子进程上永不触发 | 临时目录写 `{"type":"commonjs"}` 阻断向上查找；`stopChild` 先查 `exitCode/signalCode` 再等待 exit；SSRF 测试 close 改为回调 Promise | tests/server.test.js 5 项；`node --test` 86/86 | 已修复；`timeout -k 5 90 node --test` 退出 0，86 pass，约 3.2s |
| BUG-3.2-02 | P2 | 手机/平板顶栏、搜索、设置 | 390/430/768/834/1112 点击并量测 | 触控目标 ≥40px，关键 ≥44px | `.mobile-brand` 34×38、`.msub` 32px、`#searchInput` 36px、设置主题按钮 34px、昵称输入 38px；430 展开模型 30×30 | 旧规则 `#settings .setting-row .seg button{min-height:30px!important}` 特异性更高；触控媒体查询只到 700px | styles.css 3.2 触控层扩到 1112px；brand 42、msub 42、search 40；settings 全部 button 40 `!important` | qa-responsive touchTargets 567 项；phone-430/tablet/tablet-landscape 全通过 | 已修复；单设备 failures [] |
| BUG-3.2-03 | P3 | 知识搜索面板 | 390 输入“导数”→打开结果→按 Escape；再点关闭 | Escape 关闭面板、焦点回搜索框；`aria-expanded` 同步 | Escape 只关 AI 菜单，面板不关、焦点落 body；关闭按钮不回归焦点；searchInput 无 aria-controls/expanded | 搜索面板无键盘关闭分支，关闭函数只清 ui 状态 | 57-knowledge-search.js 新增 syncKnowledgeSearchAria、Escape 分支、close(restoreFocus)；index.template 加 aria-controls/expanded；15-shell render 后同步 | phone-390 E2E：open true → Escape 后 panel false、active searchInput、expanded false | 已修复；qa-responsive knowledge 断言通过 |
| BUG-3.2-04 | P2（视觉验收） | 首页 1440×1000 | 打开首页，量测第四张科目卡 bottom | 四科入口在首屏完整可见 | 第四卡 bottom ≈1000px，贴边且被 toast 遮住；无安全余量 | hero/工作台纵向间距偏大（welcome-note 34 + workbench 34） | 3.2 覆盖层把两处 margin 收到 22/24，第四卡 bottom ≈978px | qa-responsive 新增 desktop/1920 首屏断言 | 已修复；desktop failures [] |

## B. 已检查、未发现新缺陷（不等于“永不出错”）

| 范围 | 检查方式 | 结论 |
|---|---|---|
| 首页工作台三栏 | 1440 量测 + qa-responsive | 最近记录右边界 < 学习节奏左边界，无重叠；长标题单行省略 |
| 首页工具栏 | 360/390/430/768/834/1112/1440/1920 | 按钮在页脚内联，不覆盖科目卡；触控 ≥40 |
| 搜索滚动位置 | 390 滚到 1200px 后搜索 | 结果面板 top≈227px 可见；scroll 复位不是缺陷 |
| 设置布局 | 390/1440 | 行/AI 配置单列或双列均无横向溢出 |
| 题库范围条 | overview/bank | 当前范围 chip 与题数存在；来源/章/小节级联正常 |
| 深色主题 | 8 视口 + qa-responsive | 无浅色残留、无横向溢出；token 一致 |
| 备份往返 | qa-responsive 下载→导入 | 条目数保持，导入后提示不遮挡；损坏 JSON 拒绝覆盖 |
| 深链 | /gaodai、/shufen/bank | 404 页面还原 hash 并加载对应页 |
| 公式 | qa-formulas 5 路由 | raw []，broken 0 |
| 无障碍 | qa-a11y 8 路由 axe | serious/critical 0 |

## C. 历史 BUG 复核

| 历史 ID | 复核结果 | 证据 |
|---|---|---|
| BUG-001 skills 源与打包不一致 | 已复核，未复现 | verify-skill-packs ok，章数 10/23/6/17；skills-full.zip 存在 |
| BUG-002 GA-B0868 反斜杠 | 已复核，未复现 | 严格 QA 0 problems；公式门禁 raw [] |
| BUG-003 GA-B0157 矩阵题干 | 已复核，未复现 | 题库静态检查通过；手动查看题干正常 |
| BUG-004 数量历史基线 | 已复核，未复现 | 9163 = 1559/3522/1199/2883；README/CHANGELOG 当前块一致 |
| BUG-005 构建一致 | 已复核 | verify-build root/dist/pages 均 3b0bc353 |
| SEC-001 静态 404/MIME | 已检查，未发现新问题 | 404 页/404.html/MIME 配置保留 |
| SEC-002 匿名 API/非回环 | 已检查，未发现新问题 | server.test.js：无令牌 401；非回环默认拒绝 |
| SEC-003 AI baseUrl SSRF | 已检查，未发现新问题 | server.test.js SSRF 拦截；私网/回环/云元数据拒绝 |
| SEC-004 超大 body | 已检查，未发现新问题 | 6MB/26MB 返回 413 并断开 |
| SEC-005 SW 缓存 API | 已检查，未发现新问题 | v2 只缓存 200 同源、跳过 /api 与 Range |
| DATA-001 导入后弹窗不关闭 | 已复核，未复现 | qa-responsive 备份往返；导入完成关闭并释放焦点 |
| AUD-001 state.json 损坏被当 rev=0 | 已复核，未复现 | server.test.js 损坏状态 500/只读副本，不覆盖原文件 |
| AUD-002 客户端误报未连接 | 已复核，未复现 | 同步状态 UI 与 API 状态分离 |
| AUD-003 启动日志口令 | 已复核，未复现 | server 启动不打印令牌明文 |
| 3.0 深色 token | 已检查，未发现新问题 | 8 视口深色截图/断言 |
| 3.1 首页四科入口 | 本轮修复 BUG-3.2-04 | 1440×1000 首屏断言 |
| 3.1 错题空态/题库范围/规范表格/期末入口/统计口径 | 已检查，未发现新问题 | qa-responsive + 截图 |
| 行内公式盒模型/标点断行/选项字母悬挂 | 已检查，未发现新问题 | qa-formulas；截图目检 |
| 手机按钮隐藏/弹窗溢出/软键盘 | 已检查；触控已修 | qa-responsive 8 视口；软键盘无真实设备 |

## D. 未验证 / 风险（R）

| ID | 风险 | 说明 | 处理 |
|---|---|---|---|
| R-3.2-01 | 15MB 单文件 | index.html ≈15.97MB，冷启动与低端机内存压力大 | 本轮不拆包；报告记录为架构风险，后续评估懒加载/分包 |
| R-3.2-02 | 缓存头 | 仍有 meta no-cache；Pages 边缘缓存不可控 | 保留现状，避免误改部署行为 |
| R-3.2-03 | 真实设备 | 仅 Chromium 模拟视口，无 iOS/Android/Safari/Firefox/WebKit | 标注“模拟视口”，不声称实机通过 |
| R-3.2-04 | 真实 AI/OCR | 未配置真实 API Key，未验证上游错误/限流/长文本 | 用 mock/现有 E2E；不伪造结果 |
| R-3.2-05 | 逐题验算 | 9163 题未逐题人工验算 | 依赖严格 QA 结构门禁，不声称数学全对 |
| R-3.2-06 | DOCX/PDF | 未逐页打开所有导出文件 | 只验证导出路径与文件生成 |
| R-3.2-07 | 高并发/多设备同步 | 未做压力测试与真实双设备 | server 单测覆盖 409/401/413；不声称并发安全 |
| R-3.2-08 | 软键盘 | 无真实手机软键盘遮挡验证 | 只用 viewport 模拟 |
