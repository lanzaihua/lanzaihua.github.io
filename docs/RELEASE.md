# 发布流程与一致性门禁

本仓库同时产出三样东西：GitHub Pages 静态站、GitHub Release 资产、可离线打开的单文件 `dist/index.html`。三者必须指向同一个提交。

## 每次发布必须按顺序完成

1. `npm run check`：单测 + 严格题库 QA + 站点一致性 + 语言检查 + Python 题库审计。
2. `npm run build:pages`：生成 `dist-pages/`（首页 + `data/bank.json` + 四个科目分片 + `bank-index.json`）。
3. `npm run prepare:pages`（即 `node tools/publish-pages.js`）：把 Pages 构建与题库分片复制到仓库根目录。
4. `npm run verify:pages`、`npm run verify:build`、`npm run verify:skills`、`npm run qa:size`。
5. 真浏览器验收：`PAGE_URL=http://127.0.0.1:4173/ node tools/qa-pages.js`、`qa:responsive`、`qa:formulas`、`qa:a11y`、`qa:perf`。
6. 提交并推送到 `main`；**不要只把修复留在本地或分支上**。
7. 打当天 tag：`git tag vYYYY.MM.DD && git push origin vYYYY.MM.DD`。
8. 创建 GitHub Release，上传 `source.zip`（含 `src/data/*` 与 `skills/*`，CI 依赖它）、静态站 zip、`SHA256SUMS` 与更新记录截图；同一天只保留一条 Release，不加小版本后缀。
9. `npm run verify:release`：检查 HEAD = origin/main、tag 指向 HEAD、Release 资产齐全、Pages 最新构建提交 = HEAD、线上 `BUILD_ID` 与本地一致。
10. 打开 https://lanzaihua.github.io/ 复核首页与题库；GitHub Actions 的 `Quality checks` 与 `pages build and deployment` 都必须为 success。

## 已经发生过的疏漏（防复发）

- **本地提交未推送**：本地 `main` 曾领先 `origin/main` 两个提交，原因是修复只提交在本地。门禁第 9 步会直接失败。
- **分支已合并但缺少 tag/Release**：只推 main 不打 tag，更新检查会失败；`releases/latest/download/source.zip` 缺失会让 CI 无法还原 `src/data`。
- **Pages 构建落后**：Pages 部署失败时线上仍是旧构建；`verify:release` 比较 Pages 构建提交与线上 `BUILD_ID`。

## 日常自动检查

`.github/workflows/release-check.yml` 在 Release 发布时自动运行，也可手动触发；任何一项不一致都会让工作流失败，避免"看起来发布了、线上还是旧版"。

本地也随时可跑：

```bash
node tools/verify-release.js            # 离线：工作区、HEAD/origin/main、tag
node tools/verify-release.js --online   # 在线：Release 资产、Pages 构建、线上 BUILD_ID
```
