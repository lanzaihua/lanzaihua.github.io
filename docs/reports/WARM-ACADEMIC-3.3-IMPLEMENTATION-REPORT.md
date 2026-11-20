# Warm Academic 3.3 实施报告

## 一、实施范围

| 模块 | 实施 |
|---|---|
| 首页 | reviewQueueStats() 接入今日待复习、已完成、逾期、完成度；焦点跳到最早到期错题；手机工作台前置 |
| 资源口径 | libraryInventory() 统一内置、自建/导入、可用总量、重复 ID；首页、统计、设置共用 |
| 数据安全 | 备份写 lastBackupAt；设置页显示备份时间、规模、完整性；dataIntegrityReport() |
| 通知 | 四类筛选、计数、空分类状态；未读与全选仍按真实记录 |
| AI | 请求中/成功/超时/失败状态；设置页标签显示；失败不影响本地功能 |
| 统计 | 四张卡改为可用题库、可用模板、今日待复习、已交模拟考 |
| 视觉 | 统计卡副标签、首页资源副标签、手机两列统计、通知筛选样式 |
| 防复发 | 新增 warm-33 测试；qa:polish 增加首页队列、手机顺序、统计口径、通知分类检查 |

## 二、关键文件

- src/js/15-shell.js：首页数据、焦点、资源入口。
- src/js/16-stats.js：reviewQueueStats、dataIntegrityReport、统计卡。
- src/js/10-markdown.js：libraryInventory、uniqueById。
- src/js/55-notifications.js、src/js/90-init.js、src/index.template.html：通知分类。
- src/js/46-direct-ai.js、src/js/40-editor.js：AI 状态、备份状态、完整性状态。
- src/styles.css：移动端首页顺序、统计副标签、通知筛选。
- tests/warm-33.test.js、tools/qa-ui-polish.js：回归与浏览器门禁。

## 三、验证

- npm test：154/154；npm run check 通过。
- qa:polish、qa:resume、qa:search、qa:final、qa:formulas、qa:paper、qa:filters、qa:responsive、qa:pages、qa:a11y、qa:perf 全部 0 failures。
- 构建号 2026.11.21-fa2e1e33；根 index.html、dist、dist-pages 与导出静态页一致；verify:build/pages/skills 与 qa:size 通过。
- 浏览器探针：首页指标为复习队列；统计卡显示 9942/118 与今日待复习；通知四类筛选；页面无 pageerror。

## 四、提交

建议提交信息：`feat: complete Warm Academic 3.3 quality and UX upgrade`。发布前须通过完整 npm run check 与构建一致性校验。