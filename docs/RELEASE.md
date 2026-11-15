# 发布流程与一致性门禁

本仓库同时产出三样东西：GitHub Pages 静态站、GitHub Release 资产、可离线打开的单文件 `dist/index.html`。三者必须指向同一个提交。

## 每次发布必须按顺序完成

1. `npm run check`：单测 + 题库基线 + LaTeX 卫生 + 严格题库 QA + 站点一致性 + 语言检查 + Python 题库审计。
2. `npm run build`：生成单文件 `dist/index.html`（干净构建应删除 `dist/matrix-test.html` 等历史调试页）。
3. `npm run build:pages`：生成 `dist-pages/`（首页 + `data/bank.json` + 四个科目分片 + `bank-index.json`）。
4. `npm run prepare:pages`：把 Pages 构建、静态文件与题库分片复制到仓库根目录，并清理过期分片。
5. `npm run verify:pages`、`verify:build`、`verify:skills`、`qa:size`。
6. 真浏览器验收：`npm run qa:pages`、`qa:responsive`、`qa:paper`、`qa:filters`、`qa:formulas`、`qa:a11y`、`qa:perf`（除 qa:pages 自带服务外，其余用 `PAGE_URL=http://127.0.0.1:4173`）。
7. `git diff --exit-code -- index.html data 404.html favicon.svg manifest.webmanifest robots.txt sitemap.xml sw.js _headers .nojekyll`，确认提交的产物与本次构建一致。
8. 提交并推送到 `main`；**不要只把修复留在本地或分支上**。
9. 打当天 tag：`git tag vYYYY.MM.DD && git push origin vYYYY.MM.DD`。
10. 生成 Release 资产：`python tools/make-release-assets.py`。`source.zip` 必须是 `git archive HEAD` 的完整 tracked 文件（含 `skills.js`、`assets/`、根静态文件），静态站 zip 必须含 `skills.js`、`_headers` 与全部题库分片；上传 `source.zip`、静态站 zip、`SHA256SUMS` 与更新记录截图。同一天只保留一条 Release。
11. `npm run verify:release -- --online`：检查 HEAD = origin/main、tag 指向 HEAD、Release 资产齐全、下载后 sha256 与 `SHA256SUMS` 一致、Pages 最新构建提交 = HEAD、线上 `BUILD_ID` 与本地 `dist-pages` 一致。
12. 打开 https://lanzaihua.github.io/ 复核首页与题库；GitHub Actions 的 `Quality checks`、`release-check` 与 `pages build and deployment` 都必须为 success。

## 已经发生过的疏漏（防复发）

- **本地提交未推送**：本地 `main` 曾领先 `origin/main` 两个提交，原因是修复只提交在本地。门禁第 11 步会直接失败。
- **分支已合并但缺少 tag/Release**：只推 main 不打 tag，更新检查会失败。
- **Pages 构建落后**：Pages 部署失败时线上仍是旧构建；`verify:release --online` 比较 Pages 构建提交与线上 `BUILD_ID`。
- **源码包不完整**：Release 的 `source.zip` 曾漏掉 `skills.js`/静态文件，解压后 `node build.js` 直接失败。打包器现在固定用 `git archive HEAD`，且发布检查下载资产核对摘要。
- **CI 用旧 Release 覆盖 checkout 数据**：已删除 hydration；CI 直接使用当前提交的 `src/data` 与 `skills/`，并新增 `git diff` 检查提交产物是否落后于源码。

## 日常自动检查

`.github/workflows/release-check.yml` 在 Release 发布时自动运行，也可手动触发；任何资产、摘要、Pages 或线上构建号不一致都会失败。

本地也随时可跑：

```bash
node tools/verify-release.js            # 离线：工作区、HEAD/origin/main、tag
node tools/verify-release.js --online   # 在线：Release 资产与摘要、Pages 构建、线上 BUILD_ID
```
