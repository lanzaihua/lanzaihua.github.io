# 四科错题本 · 全站审计与修复报告

- 审计日期：2026-11-12（Asia/Shanghai）
- 审计对象：仓库 lanzaihua/lanzaihua.github.io，站点 https://lanzaihua.github.io/
- 审计分支：fix/full-site-audit-2026-11（从 main f9f5afc6a9c2263f560a7f50343b4e68d694d6dd 创建）
- 备份：备份/pre-audit-20261112.tar.gz（41 MB，排除 node_modules、dist、debug、导出、备份等生成物）
- 最终构建：2026.11.12-311ecf4b
- 结论：已修复本次可复现的严重与高优先级问题；未发现未解决的严重安全问题；仍有明确列出的未验证项与剩余风险。

## 1. 仓库扫描统计

扫描范围排除 node_modules、dist、dist-pages、debug、导出、备份、screenshots 与生成物。

- 文件：397 个；体积：259,836,187 bytes。
- 主要类型：JavaScript 133、Markdown 125、PNG 37、JSON 21、HTML 4。
- src/data：57 个文件、186 MB，其中 48 个 .bak 历史备份；source.zip 打包器会跳过 .bak，不会进入发布包。
- 重点目录：src/js（24 个运行模块）、src/data（四科题库）、skills（4 个学科）、tools（QA/构建/打包/浏览器）、tests（6 个测试文件）、.github/workflows（1 个质量工作流）。
- 未使用/历史文件：src/data/*.bak、debug/ 与截图目录属于本地审计产物，已在打包规则中排除。

## 2. 审计方法

1. 静态扫描全部源码、数据、技能、工具、测试、工作流、清单与文档。
2. 对题库执行严格 QA：总数、分科数、55 章、825 桶每桶 ≥10、十类题型、四选项唯一、解答开头、LaTeX 反斜杠、矩阵题干完整性。
3. 对服务器执行真实 HTTP 测试：鉴权、404、MIME、路径穿越、请求体、SSRF。
4. 用 Playwright 在六种视口真实点击核心流程，并完成备份导出/导入往返。
5. 运行构建、发布一致性、技能包逐字节校验与性能检查。
6. 把全部门禁接入 GitHub Actions。

## 3. Bug 清单与处理

| 编号 | 严重度 | 问题 | 根因 | 处理与证据 |
|---|---|---|---|---|
| BUG-001 | 中 | 技能包与 skills/ 源文件可能不一致，且没有自动校验 | 只依赖缓存产物，缺少源文件重建比对 | 新增 tools/verify-skill-packs.js：重建后逐字节比对 skills.json 与 gzip，并检查 4 个 SKILL.md 与全部章节文件；当前 10/23/6/17 章、problems []；接入 CI |
| BUG-002 | 高 | GA-B0868 等题 LaTeX 反斜杠丢失（Usubset） | 历史数据加工时命令被去反斜杠 | 当前数据已修复：选项 C 为 U\subset V；QA/build 已有缺反斜杠命令门禁；71 项回归中 bank math never loses command backslashes 通过 |
| BUG-003 | 高 | GA-B0157 矩阵题干不完整 | 题干缺少矩阵名与向量定义 | 当前题干含系数矩阵 A、向量 b 与求 x1；QA/build 有矩阵名与断句门禁；矩阵 stems 测试通过 |
| BUG-004 | 高 | 题库数量与审计基线不一致 | 审计基线停留在旧版本；11-11 与 11-12 分两次新增题目 | 核验为 1559/3522/1199/2883 = 9163；旧基线 8940 的 115 差额是 11-11 新增 12 高代 + 3 数分 + 100 西经，11-12 再新增 223 西经习题集；没有伪造或删除题目 |
| BUG-005 | 高 | 导出静态页可能与当前源码不一致 | 发布流程依赖手工复制，缺少一致性门禁 | 新增 tools/verify-build-consistency.js：root/dist/dist-pages 构建号一致、root 与 dist-pages 字节一致、静态资源一致、导出 HTML 同步；当前 2026.11.12-311ecf4b 通过 |
| SEC-001 | 高 | 缺失静态文件回退首页 200；webmanifest 等 MIME 缺失 | serveStatic 把所有未命中路径交给 index.html | 改为 404.html + 404；补齐 MIME；静态与 JSON 响应加 nosniff、no-referrer、DENY、Permissions-Policy；server 测试覆盖 |
| SEC-002 | 高 | /api/health 匿名开放；自定义 HOST 可能绕过口令 | 只对部分 API 鉴权，token 生成条件只看 --lan | 所有 /api 统一 authOk；非回环绑定自动生成 token；测试覆盖无口令 401、带口令 200 |
| SEC-003 | 高 | 自定义 AI baseUrl 可被用于 SSRF | 服务端直接 fetch 用户提供的地址 | assertSafeAiBaseUrl 做协议、账号密码、DNS 与私网段校验；上游 fetch 禁止重定向；测试确认私网地址 400 且上游请求数 0 |
| SEC-004 | 中 | 超大请求体可能反复写响应或拖垮服务 | readBody 缺少 settled 与断开处理 | 6MB/26MB 上限、413 后 req.destroy()；测试 7MB 请求后 health 仍 200 |
| SEC-005 | 中 | Service Worker 可能缓存 /api 私有响应 | fetch 事件未排除 API 路径 | sw.js 跳过 /api；站点一致性脚本新增门禁 |
| DATA-001 | 高 | 确认导入后导入弹窗不关闭，挡住设置页 | finishMerge 只关闭冲突弹窗 | 同时关闭 #importDialog；浏览器备份往返实测条目数不减少、弹窗关闭 |
| CI-001 | 高 | 浏览器 QA 硬编码 msedge，CI 无法运行；只测 4 视口且只看截图 | 工具依赖本机浏览器，覆盖面不足 | 新增 tools/browser.js；六视口；真实点击科目、题库、章节、模拟考、笔记、设置、更新记录、备份往返；CI 安装 Chromium |
| PERF-001 | 中 | 没有性能回归门禁 | 缺少测量脚本 | 新增 qa-performance.js：FCP 580ms、DCL 742ms、load 749ms、题库切换 581ms、JS 堆 27MB；阈值失败即阻断 |

## 4. 修改文件清单

- server.js：安全头、MIME、404、统一鉴权、非回环 token、SSRF、请求体上限、错误信息收敛、禁止上游重定向。
- src/static/sw.js：跳过 /api 缓存。
- src/js/40-editor.js：导入完成后关闭导入弹窗。
- src/js/05-sync.js：服务端 401 时显示“需要访问口令”，不误判为无服务。
- tools/browser.js（新增）：跨平台 Chromium 启动。
- tools/qa-responsive.js：六视口、真实交互、备份往返、ONLY_DEVICE。
- tools/qa-performance.js（新增）：性能阈值。
- tools/verify-skill-packs.js（新增）：技能包逐字节校验。
- tools/verify-build-consistency.js（新增）：发布一致性。
- tools/qa-site-consistency.js：服务器安全、SW 缓存与发布门禁。
- tools/qa-formulas.js：改用跨平台浏览器。
- .github/workflows/quality.yml：完整 CI 链路。
- package.json：qa:responsive、qa:formulas、qa:perf、verify:build、verify:skills。
- tests/server.test.js：404/MIME/鉴权/SSRF/413 回归。
- tests/regressions.test.js：导入弹窗、章节弹窗、公式与计数断言。
- README.md、CHANGELOG.md、src/js/48-changelog.js：本块 13 项/13 组记录。
- tools/package-source.py：把 AUDIT_REPORT.md 纳入源码包。

## 5. 自动化测试结果

- npm run check：71 tests / 71 pass / 0 fail；STRICT QA PASS；site consistency {ok:true,totals:[1559,3522,1199,2883],dates:21}；LANGUAGE GATE PASS；BANK AUDIT PASS。
- 题库：total 9163、chapters 55、unique 9163、bucketCount 825、categoryCount 10、minQuota 10、problems 0、warnings 0。
- 技能包：4 学科、章节 10/23/6/17、problems []。
- 构建：dist 与 dist-pages 均为 2026.11.12-311ecf4b，size 15,390.7 KB。
- 发布一致性：root/dist/dist-pages 构建号一致，problems []。
- 性能：FCP 528ms、DCL 605ms、load 610ms、bankSwitch 583ms、heap 27MB、cards 120。

## 6. 浏览器测试结果

六种视口：390×844、360×800、430×932、834×1112、1112×834、1440×1000。

已验证：横向溢出、欢迎弹窗、首页科目入口、题库来源筛选与章→小节级联、题库解答展开、模拟考章节弹窗全选/清空/展开/取消、笔记新建、设置五段、更新记录、深色首页、备份导出与导入往返、无 pageerror。

## 7. 安全审计结论

已解决：静态资源伪装、MIME、匿名 API、非回环口令、SSRF、请求体超限、SW 缓存私有接口、错误信息泄露。

剩余风险：
- DNS 校验与实际连接之间存在理论上的 TOCTOU 窗口；已通过禁止重定向降低，但在受控网络外仍建议只使用可信 AI 端点。
- 允许用户自定义 AI 端点本身是产品能力，不是漏洞；ALLOW_PRIVATE_AI_BASE_URL 可显式放行内网。
- 仍然没有速率限制与多用户隔离，设计定位是单用户本机/局域网工具。

## 8. 未验证项

- 真实第三方 AI 厂商的在线调用、额度、流式协议差异（本次只用本地假上游验证安全与解析）。
- Word/PDF 导出的逐页排版与字体嵌入。
- iOS Safari、Firefox、真实手机软键盘遮挡。
- 真实 OCR 扫描质量、超大图片、并发多标签压力。
- GitHub Actions 在远端 runner 的实际耗时与结果（推送审计分支后确认）。
- 全量无障碍审计（本次只覆盖触控尺寸与对比度相关既有门禁）。

## 9. 发布与回滚

- 所有修改先提交到 fix/full-site-audit-2026-11，不直接覆盖 main。
- 回滚点：备份/pre-audit-20261112.tar.gz 与 main 的 f9f5afc6。
- 发布前必须通过：npm run check、npm test、verify:build、verify:skills、qa:responsive、qa:formulas、qa:perf。
