'use strict';
/*
 * 发布一致性门禁：根 index.html、dist、dist-pages、静态资源必须来自同一次构建。
 * 用法：node tools/verify-build-consistency.js
 */
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const problems = [];
function read(file) { try { return fs.readFileSync(path.join(ROOT, file)); } catch (e) { problems.push('缺少文件: ' + file); return null; } }
function text(file) { const b = read(file); return b ? b.toString('utf8') : ''; }
function buildId(html, file) {
  const m = html.match(/window\.__BUILD_ID__="([^"]+)"/);
  if (!m) problems.push(file + ' 缺少 window.__BUILD_ID__');
  return m ? m[1] : '';
}
const rootHtml = text('index.html');
const distHtml = text('dist/index.html');
const pagesHtml = text('dist-pages/index.html');
const ids = { root: buildId(rootHtml, 'index.html'), dist: buildId(distHtml, 'dist/index.html'), pages: buildId(pagesHtml, 'dist-pages/index.html') };
if (!ids.root || ids.root !== ids.dist || ids.root !== ids.pages) problems.push('构建号不一致: ' + JSON.stringify(ids));
const rootBuf = read('index.html');
const pagesBuf = read('dist-pages/index.html');
if (rootBuf && pagesBuf && !rootBuf.equals(pagesBuf)) problems.push('根 index.html 与 dist-pages/index.html 字节不一致');
const exportHtml = path.join(ROOT, '导出', '四科错题本.html');
if (fs.existsSync(exportHtml)) {
  const exportId = buildId(fs.readFileSync(exportHtml, 'utf8'), '导出/四科错题本.html');
  if (exportId !== ids.root) problems.push('导出静态页构建号落后: ' + exportId + ' != ' + ids.root);
}
for (const name of ['404.html', 'favicon.svg', 'manifest.webmanifest', 'robots.txt', 'sitemap.xml', 'sw.js']) {
  const src = path.join(ROOT, 'src', 'static', name);
  const dst = path.join(ROOT, name);
  if (!fs.existsSync(src)) { problems.push('缺少静态源文件: src/static/' + name); continue; }
  if (!fs.existsSync(dst)) { problems.push('根目录缺少静态文件: ' + name); continue; }
  if (!fs.readFileSync(src).equals(fs.readFileSync(dst))) problems.push('静态文件与源不一致: ' + name);
}
for (const page of ['index.html', 'dist/index.html', 'dist-pages/index.html']) {
  const html = text(page);
  if (!/href="#\/home"/.test(html) && !/id="app"/.test(html)) problems.push(page + ' 缺少应用挂载点');
  if (/src="\/src\/js\//.test(html)) problems.push(page + ' 仍引用未打包源码');
}
const report = { ok: problems.length === 0, buildId: ids.root, ids: ids, problems: problems };
console.log(JSON.stringify(report, null, 2));
if (problems.length) process.exit(1);
