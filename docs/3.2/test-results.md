# Warm Academic 3.2 测试结果

- 日期：2026-11-14
- 构建号：2026.11.14-63f5de60
- 浏览器：本机 Chromium（tools/browser.js）
- 本地站点：http://127.0.0.1:4173/

## 一、自动化门槛

| 命令 | 结果 | 关键数据 |
| --- | --- | --- |
| `node --test tests/*.test.js` | 86 / 86 通过 | 约 2.4–3.2 秒，0 失败 |
| `node tools/qa-bank-strict.js --strict-difficulty` | STRICT QA PASS | 9163 题 / 55 章 / 825 桶 / 最小配额 10 / 教材课后 590 / problems 0 |
| `node tools/qa-site-consistency.js` | ok true | 四科 [1559, 3522, 1199, 2883]，14 个日期区块一致 |
| `node tools/check_repo_languages.js` | LANGUAGE GATE PASS | JS/CSS/HTML/Python/YAML/Shell/Makefile 均在 |
| `python tools/audit_bank.py --strict-difficulty` | BANK AUDIT PASS | problems 0 / warnings 0 |
| `npm run check` | EXIT 0 | 上述测试 + 题库严格 QA + 站点一致性 + 语言门禁 + Python 审计串联通过 |

视口：360×800、390×844、430×932、768×1024、834×1112、1112×834、1440×1000、1920×1080。

完整输出：`docs/3.2/baseline/check-final.log`。

## 二、页面级检查

| 检查 | 范围 | 结果 | 日志 |
| --- | --- | --- | --- |
| 公式渲染 | overview / entries / templates / bank / guide | raw []，broken 0 | `qa-formulas-final.log` |
| 无障碍（axe-core） | 8 条路由 | 全部 []，accessibility QA passed | `qa-a11y-final.log` |
| 响应式 | 8 视口 × 22 路由 | 全部通过，failures []，无横向溢出/脚本错误 | `qa-responsive-final.log` |
| 性能 | 1440×1000 | FCP 472ms / DCL 702ms / load 708ms / heap 27MB / 题库切换 606ms / 120 卡 | `qa-performance-final.log` |
| 构建一致性 | root / dist / dist-pages | 同一构建号 63f5de60，启动资源一致 | `verify-build-consistency.js` |

## 三、本轮发现与修复

1. **BUG-3.2-01 测试进程挂死**：`tests/server.test.js` 把 `server.js` 复制到系统 Temp 后 spawn，向上命中非法 `C:\Users\廖子恒\AppData\Local\Temp\package.json`，子进程 `ERR_INVALID_PACKAGE_CONFIG` 立即退出；`finally` 又对已退出子进程等 `exit`。临时目录补 `{"type":"commonjs"}`，`stopChild` 先检查 `exitCode/signalCode`；测试恢复并稳定 86/86。
2. **BUG-3.2-02 手机/平板触控尺寸不足**：在 `src/styles.css` 增加 1112px 媒体查询，工具栏图标至少 44px、分页至少 40px、`.msub` 高度 42px；桌面保持原尺寸。
3. **BUG-3.2-03 知识点面板键盘路径**：Escape 关闭、关闭后焦点回到搜索框、面板开合状态通过 `aria-hidden` 同步；搜索框不再挂无效的 `aria-controls/aria-expanded`。
4. **BUG-3.2-04 桌面首屏第 4 科卡贴边**：收紧 hero 与工作台下方间距，1440×1000 下第四卡完整进入首屏；新增 `homeLayout.fourthBottom` 断言。
5. **回归护栏**：新增首页间距、触控尺寸、知识面板键盘、搜索框 ARIA 断言；任何一项退化都会使测试失败。

## 四、视觉复核

- 最终构建截图：`docs/3.2/screenshots/after/`
  - home-390 / home-1440
  - bank-390 / bank-1440
  - settings-390 / settings-1440
  - knowledge-390 / knowledge-1440
- 3.1 基线：`docs/3.2/screenshots/before/`（6 张，knowledge 无对应 before）。
- 截图中的 toast 为测试环境残留数据，不代表线上首访状态。

## 五、已知失败与残余风险

- 自动化门槛当前无失败项。
- 残余风险见 `docs/3.2/risk-register.md`：15MB 单文件、缓存头、真实移动设备、真实 AI 端点、DOCX/PDF 导出、逐题数学验算、多标签并发。
- 本轮未自动合并、未自动部署；发布动作需单独确认。
