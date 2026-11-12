'use strict';
/* Cross-page consistency gate: counts, dates, stale copy and skill links. */
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'src');
const problems = [];
const read = (p) => fs.readFileSync(p, 'utf8');

function add(cond, msg) { if (cond) problems.push(msg); }

const banks = ['bank-algebra.json', 'bank-analysis.json', 'bank-geometry.json', 'bank-western.json']
  .map((f) => JSON.parse(read(path.join(SRC, 'data', f))));
const totals = banks.map((b) => (b.items || []).length);
add(totals[0] < 1559 || totals[1] < 3522 || totals[2] < 1199 || totals[3] < 2883, '四科题库计数低于下限：' + totals.join(' / '));
add(totals.reduce((a, b) => a + b, 0) < 9163, '题库总数低于 9163');

const jsFiles = fs.readdirSync(path.join(SRC, 'js')).filter((f) => /\.js$/.test(f));
const js = jsFiles.map((f) => read(path.join(SRC, 'js', f))).join('\n');
const allSource = js + '\n' + read(path.join(SRC, 'index.template.html')) + '\n' + read(path.join(SRC, 'styles.css'));
add(/901\s*题|题库\s*901|解几\s*901/.test(allSource), '页面仍含解析几何 901 的旧计数');
add(/8251/.test(allSource), '页面仍含 8251 的旧计数');
const styles = read(path.join(SRC, 'styles.css'));
add(!/\.home-title\s*\{[^}]*max-width:\s*none\s*!important/.test(styles), '首页标题可能再次被 20ch 窄宽强制换行');
add(/\.home-icon-group\s*\{[^}]*position:\s*fixed/s.test(styles), '手机首页工具栏又变成固定悬浮，可能遮挡内容');
add(!/\.bank-option math[\s\S]{0,500}display:\s*inline\s*!important/.test(styles), '题库选项公式可能再次按块级公式换行');
add(/display:\s*revert/.test(styles), 'MathML 子元素又被 revert 成 UA 的 block math，行内公式会独占整行');
add(!/\.math-inline-scroll math > \*:not\(mtable\)[\s\S]{0,220}display:\s*inline math/.test(styles), '行内公式 mrow 必须保持 inline math');
add(!/\.exam-result-option\s*\{[^}]*display:\s*flex/.test(styles), '模拟考结果选项缺少 flex 排版，选项字母可能单独占行');
add(/(?:解几|解析几何)[^\n]{0,20}92\s*道/.test(allSource), '页面仍含解析几何 92 的旧计数');
add(/<b>A<\/b>高代|<b>M<\/b>数分|<b>G<\/b>解几|<b>E<\/b>西经/.test(js), '规范页仍用 A/M/G/E 旧编号');
add(/仅本机保存<\/span><\/span>\s*·\s*数据保存在浏览器与自建服务里/.test(js), '页脚仍把“仅本机保存”和“自建服务”并列');
add(/从空白开始/.test(js), '首页仍有“从空白开始”旧文案');

const serviceWorker = read(path.join(SRC, 'static', 'sw.js'));
add(!/url\.pathname\.indexOf\('\/api\/'\)\s*===\s*0/.test(serviceWorker), 'Service Worker 可能把 /api 私有响应写入缓存');
const server = read(path.join(ROOT, 'server.js'));
add(!/function assertSafeAiBaseUrl/.test(server), 'server.js 缺少 AI 上游 SSRF 防护');
add(!/req\.destroy\(\)/.test(server), 'server.js 超大请求体没有中止连接');
add(!/application\/manifest\+json/.test(server), 'server.js 缺少 webmanifest MIME');
add(/writeHead\([^)]*200[^)]*\)[\s\S]{0,120}index\.html/.test(server), 'server.js 可能仍把缺失静态资源回退成首页 200');
add(!/securityHeaders/.test(server), 'server.js 缺少基本安全响应头');

const changelog = read(path.join(SRC, 'js', '48-changelog.js'));
const sandbox = {
  window: {},
  document: {
    addEventListener() {},
    querySelector() { return null; },
    querySelectorAll() { return []; },
    getElementById() { return null; }
  },
  console
};
vm.runInNewContext(changelog + '\n;globalThis.__UPDATE_LOG__ = UPDATE_LOG;', sandbox, { filename: '48-changelog.js' });
const logs = sandbox.__UPDATE_LOG__;
add(!Array.isArray(logs) || !logs.length, '更新记录无法解析');

const keys = logs.map((b) => b.date + '|' + b.title);
add(new Set(keys).size !== keys.length, '更新记录存在同一天同标题的重复块');
const dates = logs.map((b) => b.date);
add(new Set(dates).size !== dates.length, '更新记录同一天存在多块，需合并为一块：' + dates.join(','));
add(/UPDATE_LOG\[0\]\.date\s*=/.test(changelog), '更新记录日期仍会被构建日静默改写');
for (let i = 1; i < dates.length; i++) add(dates[i] > dates[i - 1], '更新记录日期未按新到旧排列：' + dates[i - 1] + ' → ' + dates[i]);
const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Shanghai' }).format(new Date());
dates.forEach((d) => add(d > today, '更新记录日期晚于今天：' + d));
add(!dates.includes('2026-11-03'), '缺少 2026-11-03 更新记录');
add(/解几题库[^\n]*900/.test(changelog.slice(changelog.indexOf('2026-11-05'), changelog.indexOf('2026-11-04'))), '最新更新仍含解析几何 900 旧计数');
add(!changelog.includes("title: '题库方案'"), '11-03 未改为题库方案，可能与 11-04 重建冲突');
add(!changelog.includes("title: '题库与界面'"), '缺少 11-04 题库重建记录');
logs.forEach((b) => {
  const items = Array.isArray(b.items) ? b.items : [];
  const groups = new Set(items.map((it) => it.group).filter(Boolean));
  add(!b.date || !b.title, '更新记录缺少日期或标题');
  add(!items.length, b.date + ' 更新记录没有条目');
  add(Array.from(b.title).length > 10, '更新标题超过 10 字：' + b.title);
  items.forEach((it) => add(!it.group || !it.text, b.date + ' 更新条目缺少分组或正文'));
});

const readme = read(path.join(ROOT, 'README.md'));
add(/(?:解析几何|解几)[^\n]{0,30}901/.test(readme), '仓库 README 仍含解析几何 901 旧计数');
add(/8251/.test(readme), '仓库 README 仍含 8251');
add(/(?:解几|解析几何)[^\n]{0,20}92\s*道/.test(readme), '仓库 README 仍含解析几何 92 的旧计数');
add(!readme.includes('3554833568@qq.com'), '仓库 README 缺少邮箱');

const headings = Array.from(readme.matchAll(/^### (\d{4}-\d{2}-\d{2}) · (.+)$/gm)).map((m) => ({
  date: m[1],
  title: m[2].trim(),
  start: m.index,
  bodyStart: m.index + m[0].length
}));
add(!headings.length, '仓库 README 没有可核对的更新块');
headings.forEach((h, i) => {
  const next = headings[i + 1];
  const body = readme.slice(h.bodyStart, next ? next.start : undefined);
  const log = logs.filter((b) => b.date === h.date && b.title === h.title)[0];
  if (!log) {
    problems.push('README 更新块在 UPDATE_LOG 中找不到：' + h.date + ' · ' + h.title);
    return;
  }
  const count = body.match(/\*\*(\d+) 项 · (\d+) 组\*\*/);
  if (!count) {
    problems.push('README 更新块缺少计数：' + h.date + ' · ' + h.title);
    return;
  }
  const rows = Array.from(body.matchAll(/^\| \*\*(.+?)\*\* \|/gm)).map((m) => m[1].trim());
  const rowGroups = new Set(rows);
  const items = log.items || [];
  const itemGroups = new Set(items.map((it) => it.group));
  const n = Number(count[1]);
  const m = Number(count[2]);
  if (n !== items.length) problems.push('README 项数与代码不一致：' + h.date + ' ' + n + ' vs ' + items.length);
  if (m !== itemGroups.size) problems.push('README 组数与代码不一致：' + h.date + ' ' + m + ' vs ' + itemGroups.size);
  if (rows.length !== n) problems.push('README 表格行数与项数不一致：' + h.date + ' ' + rows.length + ' vs ' + n);
  if (rowGroups.size !== m) problems.push('README 表格分组数与组数不一致：' + h.date + ' ' + rowGroups.size + ' vs ' + m);
});

const latest = logs[0];
const latestHeading = headings[0];
if (!latestHeading || latestHeading.date !== latest.date || latestHeading.title !== latest.title) {
  problems.push('README 最新更新标题与 UPDATE_LOG[0] 不一致');
} else {
  const next = headings[1];
  const latestBlock = readme.slice(latestHeading.bodyStart, next ? next.start : undefined);
  if (!/assets\/v2\/[0-9]+[a-z]?-changelog\.png/.test(latestBlock)) problems.push('README 最新更新块缺少更新记录截图');
  if (/20261108-changelog\.png/.test(readme)) problems.push('README 仍引用旧的 20261108 更新记录截图');
  const notifyGroups = (latest.notifyItems || []).map((it) => it.group);
  notifyGroups.forEach((g) => add(!(latest.items || []).some((it) => it.group === g), '最新通知条目不在更新记录中：' + g));
  if (/^\| \*\*/m.test(latestBlock)) {
    const rows = (latestBlock.match(/^\| \*\*/gm) || []).length;
    if (rows !== (latest.items || []).length) problems.push('README 最新更新表格行数不一致');
  }
}
const imageRefs = Array.from(readme.matchAll(/src="(assets\/v2\/[^"]+)"/g)).map((m) => m[1]);
const imageRoots = [path.join(ROOT, '导出', 'assets-v2'), path.join(ROOT, 'assets', 'v2')].filter((dir) => fs.existsSync(dir));
if (imageRoots.length) {
  imageRefs.forEach((ref) => {
    const name = path.basename(ref);
    const local = imageRoots.map((dir) => path.join(dir, name)).find((file) => fs.existsSync(file));
    add(!local, 'README 引用的截图不存在：' + ref);
  });
}


const badgeColors = Array.from(readme.matchAll(/img\.shields\.io\/badge\/[^"?]*-([0-9A-Fa-f]{6})\?/g)).map((m) => m[1].toUpperCase());
add(badgeColors.length !== 9, '仓库徽章不是 9 个');
add(new Set(badgeColors).size !== badgeColors.length, '仓库徽章颜色有重复：' + badgeColors.join(','));

['advanced-algebra', 'mathematical-analysis', 'analytic-geometry', 'western-economics'].forEach((s) => {
  add(!fs.existsSync(path.join(ROOT, 'skills', s, 'SKILL.md')), '缺少开源 skill：skills/' + s);
});

if (problems.length) {
  console.error(JSON.stringify({ ok: false, problems }, null, 2));
  process.exit(1);
}
console.log(JSON.stringify({ ok: true, totals, dates: dates.length }, null, 2));
