# 缓存迁移：GitHub Pages → Cloudflare Pages

## 为什么迁移

GitHub Pages 无法自定义 HTML 的 Cache-Control。页面虽然去掉了强制 `no-cache` meta，但托管层仍可能让浏览器反复校验或重新下载 15MB 单文件。拆分后首页约 3MB，题库约 12MB，但只有首次进入题库才需要下载题库。

## Cloudflare Pages 配置

1. 在 Cloudflare Pages 连接仓库 `lanzaihua/lanzaihua.github.io`。
2. Build command: `npm run build:pages && npm run prepare:pages`。
3. Build output directory: 仓库根目录（Pages 版 `index.html`、`data/bank.json`、`_headers` 都在根目录）。
4. 环境变量：无。静态页不依赖 Node 运行时。
5. 自定义域可选；绑定后把线上地址和 README 链接一起更新。

## 缓存规则

仓库内 `src/static/_headers` 会被构建复制到 Pages 根目录：

- `/index.html`：`max-age=0, must-revalidate`，保证新构建立即生效。
- `/sw.js`：`no-cache`，Service Worker 更新不被缓存拖住。
- `/data/bank.json`：`max-age=3600, stale-while-revalidate=86400`，配合 `?v=<BUILD_ID>` 在构建更新时换 URL。
- 全站安全头：nosniff、no-referrer、DENY、权限策略。

## 验证

- `curl -I https://<domain>/` 应看到 `cache-control: public, max-age=0, must-revalidate`。
- 首次打开首页 Network 里 `data/bank.json` 不应在首屏请求；进入题库后才出现。
- 二次刷新题库应命中 IndexedDB，Network 不再重复下载 12MB。
- 新构建发布后首页 build ID 变化，旧 Service Worker 缓存被清理。

## 现状

本轮只新增配置与文档，未把线上域名切到 Cloudflare；现有 `https://lanzaihua.github.io/` 仍由 GitHub Pages 提供。迁移完成前不要在任何页面声称已切换。