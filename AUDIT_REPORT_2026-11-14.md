# 四科错题本 · 全站深度审计报告（2026-11-14 复核）

## 0. 结论摘要

本轮审计基于当前未合并的 Warm Academic 3.1 候选分支，目标是核对仓库、数据、安全、构建、发布一致性，并把审计发现变成可重复的门禁。没有直接修改或覆盖 `main`，没有自动合并 PR，没有部署生产。

- 已确认上轮 BUG-001～BUG-005 的当前状态：技能包一致、GA-B0868 与 GA-B0157 已修复、题库总数 9163 与历史基线可对账、构建与发布一致性门禁已存在。
- 本轮新发现并修复 1 个高严重度数据安全问题：服务端状态文件损坏时，旧实现会把损坏文件当成 rev=0 的空状态，下一次 PUT 会以 baseRev=0 通过并覆盖原始文件。现在改为失败关闭：保留只读副本、GET 返回 500、PUT 返回 409，健康检查暴露 stateCorrupted。
- 同时修复服务启动日志在回环模式打印空白口令、在局域网模式重复打印口令的问题。
- 自动化测试由 82 项增至 84 项；严格题库 QA、站点一致性、语言门禁、技能包校验、构建/发布一致性、8 视口真实交互、公式、无障碍与性能检查通过。
- 生产站仍为旧构建 2026.11.14-45820005；本报告不声称已上线。
- 精确分支名 `fix/full-site-audit-2026-11` 已被上轮审计分支占用（1c35efa45a1191e53407bffbf70346fa8ab3e26f，不是当前 main 的祖先）。为避免重写历史，本轮使用新分支 `fix/full-site-audit-2026-11-r2`，基于 Warm Academic 3.1 候选提交 e3b5b09ad6ee2c4cc65a5f42544427c890e2f204；不覆盖旧分支。

## 1. 基线与工作区

- 仓库：https://github.com/lanzaihua/lanzaihua.github.io
- 生产站：https://lanzaihua.github.io/
- 审计时远端 main：`6672f3a37ac3eafd6ae0b0c4d7194a0c69c8996a`（2026.11.14-45820005）
- Warm Academic 3.1 分支：`warm-academic-3-1`，HEAD `e3b5b09ad6ee2c4cc65a5f42544427c890e2f204`，PR #1 open，未合并
- 本地项目：`D:/学习/大一/错题本网页`，不是 git 工作树；所有提交通过 GitHub Git Data API 生成
- 完整备份：`备份/pre-audit-20261112.tar.gz` 为上一轮审计备份；本轮改动前工作树已由 3.1 提交快照覆盖，新分支提供回滚点
- 候选构建：`2026.11.14-0fa27ae7`，单文件 15,581.1 KB

## 2. 文件清单与重复物

排除 `node_modules`、`.git`、`dist`、`dist-pages`、`debug`、`备份`、`导出` 后的源码工作树：

- 586 个文件，280,469,979 字节
- JavaScript 135、Markdown 131、PNG 128、JPG 84、JSON 21、HTML 5、CSS 2、SVG 2、Python 3、Shell 1
- `src/js/` 27 个运行模块；`tests/` 5 个测试文件；`tools/` 114 个条目（含题库生成脚本与历史工具）
- `src/` 内 95 个文件，其中 50 个名字含 `.bak`；`src/data/` 57 个文件中 48 个备份。打包脚本会跳过 `.bak`，这些备份不进入 source.zip，但会放大工作树。
- 最大文件：`source.zip` 17.0MB、根 `index.html` 15.2MB、四科题库 JSON 各 3～5MB。
- 判断：备份文件属于历史修复留痕，未删除；建议后续单独清理，不属于本轮阻塞项。

## 3. 上轮 BUG-001～BUG-005 复核

### BUG-001 技能包与源文件一致
当前 `tools/verify-skill-packs.js` 从 `skills/` 重新生成 `skills.json` 与 gzip，并逐字节比对；同时检查四个 SKILL.md 与章节数量。CI 已执行 `npm run verify:skills`。本轮复核通过，章节数为 advanced-algebra 10、mathematical-analysis 23、analytic-geometry 6、western-economics 17。

### BUG-002 GA-B0868 反斜杠丢失
当前题库中选项 C 为 `$U={(x,0)},V={(x,y)}$且$U\\subset V$`，答案亦包含 `U\\subset V`。未复现反斜杠丢失；题库 QA 与公式门禁均通过。

### BUG-003 GA-B0157 矩阵题干不完整
当前题干含系数矩阵 A、右端向量 b，并明确求 x1；选项为 -2、-3、2、0。未复现题干缺失。

### BUG-004 题库数量
当前实测：高代 1559、数分 3522、解几 1199、西经 2883，合计 9163；55 章、825 个章×星级×题型桶每桶至少 10，教材课后 590、习题集 223。

历史基线的对账关系：

- 用户给出的 8825（1547/3519/1199/2560）是更早的审计基线。
- 8825 + 115 = 8940；这里的 115 是 2026-11-11 新增的 12 道高代、3 道数分、100 道西经。
- 8940 的科目分布为 1559/3522/1199/2660，与用户给出的预期一致。
- 2026-11-12 又新增西经习题集 223 道，因此 8940 + 223 = 9163，西经从 2660 变为 2883。
- 结论：没有 115 道题丢失，也没有用改测试掩盖数量差异；当前 9163 是后续两次扩充后的真实总量。

### BUG-005 构建与发布一致性
`tools/verify-build-consistency.js` 校验根 index.html、dist、dist-pages 的构建号、静态资源与导出 HTML。本轮首次运行发现 `导出/四科错题本.html` 仍停留 45820005，已用 dist-pages 更新；重新校验通过。该失败说明门禁确实能抓住发布产物落后，不是空跑。

## 4. 本轮新发现与修复

### AUD-001（高）服务端损坏状态会被空状态覆盖
- 复现：在临时目录写入非法 `data/state.json`，启动 server.js，GET /api/state 返回 200 且 state=null、rev=0；随后 PUT /api/state 带 baseRev=0 即通过，损坏文件被新状态覆盖。
- 根因：`server.js` 的 `readState()` 捕获所有异常后统一返回 rev=0/state=null，没有区分“文件不存在”和“文件损坏”，PUT 的乐观锁因此把损坏文件当成空库。
- 修复：`server.js:71-96` 增加 corrupted 标记，首次损坏时复制为 `state.json.corrupted`；GET 返回 500 + STATE_CORRUPTED，PUT 返回 409 + STATE_CORRUPTED，HEALTH 返回 stateCorrupted/stateBackup，不再允许覆盖原始文件。
- 回归：新增 `tests/server.test.js` 用例，验证 500/409、副本内容等于损坏原文、原文件未被覆盖。

### AUD-002（低）客户端把损坏状态误报为“未连接同步服务”
- 现象：服务端已改为 500 + STATE_CORRUPTED，但客户端只走通用 catch，显示“未连接同步服务”，用户不知道数据文件损坏、副本在哪里。
- 修复：`src/js/05-sync.js` 在 `/api/health` 读到 stateCorrupted 或 `/api/state` 返回 STATE_CORRUPTED 时，进入 conflict 状态并提示“本地数据文件损坏，已保留原始副本”，不覆盖本地数据。
- 回归：新增 startup sync surfaces corrupted server state without replacing local data。

### AUD-003（低）启动日志口令为空或重复
- 现象：回环模式打印“本次访问口令: ”空行；局域网自动生成口令时，同一口令打印两次。
- 修复：`server.js` 启动段删除回环分支的空白口令输出，只保留 AUTO_TOKEN 或显式 TOKEN 的一条提示。
- 验证：server.test.js 的非回环认证用例仍能解析到唯一口令。

### 已核对但未改动的安全项
- 静态路径穿越：`/%2e%2e/server.js` 返回 403，`/../server.js` 与未匹配资源返回 404，不会把首页冒充 JS/CSS。
- MIME：webmanifest 为 application/manifest+json，JS 为 text/javascript，JSON 为 application/json。
- 非回环认证：HOST=0.0.0.0 且未设 NOTEBOOK_TOKEN 时自动生成随机口令，/api/health 与 /api/state 无口令返回 401。
- SSRF：AI baseUrl 先做协议、账号密码、localhost/元数据、DNS 解析与私网地址校验，再发请求；POST 重定向使用 redirect:error。
- 请求体：超过 6MB/26MB 返回 413 并断开，服务保持可用。
- 客户端：Markdown 使用 DOM 白名单清洗，危险标签与 javascript: URL 被移除；AI Key 只存本机 localStorage。
- Service Worker：跳过 /api 与自身脚本，只缓存完整 200 且非 Range 响应。

## 5. 自动化与门禁证据

- `npm run check`：84 tests / 84 pass / 0 fail；STRICT QA total 9163、55 章、825 桶、minQuota 10、problems 0；site consistency ok、totals 1559/3522/1199/2883、dates 23；LANGUAGE GATE PASS；BANK AUDIT PASS（textbook 590）。
- `npm run build`、`npm run prepare:pages`、`npm run verify:pages`、`npm run verify:build`、`npm run verify:skills`：通过；构建号 2026.11.14-0fa27ae7。
- `npm run qa:responsive`：8 视口（390×844、360×800、430×932、768×1024、834×1112、1112×834、1440×1000、1920×1080），真实点击首页/四科/错题/题库/模板/规范/笔记/知识/期末/设置，failures []、errors []。
- `npm run qa:formulas`：页面级原始 LaTeX 0、破损公式 0。
- `npm run qa:a11y`：8 条主路由 axe WCAG 2A/2AA 违规 0。
- `npm run qa:perf`：FCP 496ms、DCL 824ms、load 831ms、题库切换 552ms、JS 堆 27MB、120 张卡，problems []。
- 回归与浏览器日志：`debug/audit-2026-11-14-check.log`、`debug/audit-2026-11-14-browser.log`。
- GitHub Actions 已覆盖 check、Chromium 安装、build、pages/build/skills 校验、server 健康、8 视口、公式、无障碍、性能；任一必需步骤失败会阻断发布。

### 5.1 十五类自动化覆盖矩阵

| # | 类型 | 现有落点 | 状态 |
|---|---|---|---|
| 1 | 单元测试 | `tests/regressions.test.js`、`tests/audit-20261106.test.js` | 通过 |
| 2 | 服务端集成 | `tests/server.test.js` 5 项 | 通过 |
| 3 | 页面渲染 | `qa:responsive` 10 条路由 | 通过 |
| 4 | 浏览器真实交互 | `qa:responsive` 点击/筛选/答题/导入导出 | 通过 |
| 5 | 响应式 | 8 个视口，含 360/390/430/768/834/1112/1440/1920 | 通过 |
| 6 | 公式 | `qa:formulas` 5 个页面 | 通过 |
| 7 | 题库完整性 | `qa-bank-strict.js`、`audit_bank.py` | 通过 |
| 8 | AI 数据/选项校验 | AI 选项白名单、选项唯一性、题库与模拟考数据断言 | 通过 |
| 9 | 导入导出/备份恢复 | `qa:responsive` 备份往返 + sync/localStorage 回归 | 通过 |
| 10 | 本地存储降级 | safeStorage、配额失败、损坏 JSON 副本 | 通过 |
| 11 | 并发/冲突 | 乐观锁 409、同步冲突保留本机改动、并发保存回归 | 逻辑覆盖；未做高并发压力 |
| 12 | 安全 | 路径穿越、MIME、认证、SSRF、请求体、XSS 清洗 | 通过 |
| 13 | 构建 | `npm run build`、`prepare:pages` | 通过 |
| 14 | 发布一致性 | `verify:build`、`verify:pages`、`verify:skills` | 通过 |
| 15 | 性能 | `qa:perf` 阈值门禁 | 通过 |

以上除第 11 类的高并发压力外均已在本地执行；CI 负责在干净 checkout 重跑同一套必需项。

## 6. 未验证项与剩余风险

- 生产站仍是 2026.11.14-45820005；本轮候选分支未合并、未部署，因此没有线上构建号可以验收。
- 真实 AI 调用、OCR、供应商限流与大图识别没有在 CI 中执行；只验证了配置校验、SSRF 拒绝与请求体边界。
- 浏览器只覆盖 Chromium；Safari、Firefox、iOS 实机未验证。
- SSRF 的 DNS 校验与真正 fetch 之间存在 DNS rebinding 窗口；已阻断私网直连与重定向，但没有做自定义 DNS pinning，属于已声明的剩余风险。
- 没有对 9163 道题逐题做独立数学验算；只验证结构、选项唯一性、难度/分类/配额、公式标记与若干已知题。
- 未做多标签并发写入压测；服务端乐观锁与客户端冲突弹窗有既有回归，但没有高并发实测。
- 未验证 Word/PDF 导出的逐页分页与字体嵌入，只验证导出入口和生成逻辑存在。

## 7. 回滚

- 代码回滚：删除或关闭审计分支即可，main 未被改写；生产未部署。
- 服务端状态：若 `data/state.json` 损坏，保留同目录 `state.json.corrupted`，恢复该文件后重启 server.js。
- 构建回滚：重新从 main 的 6672f3a 构建，或使用上一版 source.zip。

## 8. 交付

- 审计分支：`fix/full-site-audit-2026-11-r2`（基于 warm-academic-3-1）
- PR：https://github.com/lanzaihua/lanzaihua.github.io/pull/2（base warm-academic-3-1，不合并、不部署）
- 修复提交：8c08a69c1f8f941a8452ccfc9ee8a5c60b772ec6
- 修改文件：`server.js`、`src/js/05-sync.js`、`tests/server.test.js`、`tests/regressions.test.js`、`index.html`、`AUDIT_REPORT_2026-11-14.md`、`tools/package-source.py`
- 测试日志：`debug/audit-2026-11-14-check.log`、`debug/audit-2026-11-14-browser.log`
