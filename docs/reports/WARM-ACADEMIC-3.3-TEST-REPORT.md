# Warm Academic 3.3 测试报告

## 一、单元与集成

命令：`npm test`

结果：153/153 通过（新增 5 项 3.3 测试：复习队列、资源清单、通知分类、AI 状态、首页/备份静态断言）。

## 二、质量门禁

命令：`npm run check`

结果：通过。

- 题库基线 9875；严格 QA 9875 唯一，problems 0，warnings 0。
- LaTeX PASS，题库一致性 PASS；全库渲染 9875 题 0 失败；数学语言 107436 字段 0；574 点记忆/考场用法 PASS。

## 三、浏览器与构建

| 门禁 | 结果 |
|---|---|
| qa:polish | 360/390/768/1440，failures 0 |
| qa:resume | 390/1440 子页、题库、根恢复、显式首页全过 |
| qa:search | 390/768/1440，failures 0 |
| qa:final | 四科 × 390/768/1440，failures 0 |
| qa:formulas | 14 个面，broken 0 |
| qa:paper / qa:filters | 18 / 22 个宽度，failures 0 |
| qa:responsive | 8 视口，failures []；桌面 1440×1000 四科卡全部在首屏 |
| qa:pages | 首访 network、刷新 idb，items 2075，id 9d95291b |
| qa:a11y / qa:perf | 8 路由无问题；problems [] |
| verify:build / pages / skills | 三处构建号一致；分片字节一致；技能 121 条目 0 问题 |
| qa:size | root 3.67MB / dist 18.50MB / pages 3.67MB，ratio 19.8% |

## 四、说明

- 统计卡实测 9875 可用题库、118 可用模板、3 今日待复习。
- 通知筛选四类，390/1440 均无横向溢出，pageerror []。
- BUILD_ID：2026.11.21-9d95291b。
- 用户本机 10336/176 的差异仍属浏览器内数据口径，仓库侧不删除用户数据，只按唯一 ID 合并统计。
