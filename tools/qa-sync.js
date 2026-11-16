'use strict';
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawn } = require('node:child_process');
const { launchChromium } = require('./browser');
const ROOT = path.join(__dirname, '..');
function wait(ms) { return new Promise(r => setTimeout(r, ms)); }
async function main() {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'notebook-sync-'));
  fs.writeFileSync(path.join(temp, 'package.json'), '{"type":"commonjs"}');
  fs.copyFileSync(path.join(ROOT, 'server.js'), path.join(temp, 'server.js'));
  fs.copyFileSync(path.join(ROOT, 'skills.js'), path.join(temp, 'skills.js'));
  fs.cpSync(path.join(ROOT, 'lib'), path.join(temp, 'lib'), { recursive: true });
  fs.cpSync(path.join(ROOT, 'dist'), path.join(temp, 'dist'), { recursive: true });
  const h = require('node:http');
  const reserve = h.createServer(); await new Promise(r => reserve.listen(0, '127.0.0.1', r));
  const port = reserve.address().port; await new Promise(r => reserve.close(r));
  const child = spawn(process.execPath, ['server.js'], { cwd: temp, env: { ...process.env, PORT: String(port), HOST: '127.0.0.1' }, stdio: ['ignore', 'pipe', 'pipe'] });
  let browser;
  try {
    await new Promise((resolve, reject) => {
      let logs = ''; const timer = setTimeout(() => reject(Error('server startup timeout: ' + logs)), 8000);
      child.stdout.on('data', d => { logs += d; if (logs.includes('本机:')) { clearTimeout(timer); resolve(); } });
      child.on('exit', c => { clearTimeout(timer); reject(Error('server exited ' + c)); });
    });
    const api = 'http://127.0.0.1:' + port;
    let cur = await (await fetch(api + '/api/state')).json();
    const seed = { entries: { gaodai: [{ id: 'SYNC-SEED', title: '云端种子题', blocks: [], review: {}, mastered: false }], shufen: [], jieji: [], xijing: [] }, notes: [], prefs: { theme: 'auto' }, updatedAt: new Date().toISOString() };
    const put = await fetch(api + '/api/state', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ baseRev: cur.rev, state: seed }) });
    if (put.status !== 200) throw Error('seed failed ' + put.status);
    const before = await (await fetch(api + '/api/state')).json();
    browser = await launchChromium();
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await page.goto(api + '/#/gaodai/entries', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3500);
    const after = await (await fetch(api + '/api/state')).json();
    const count = (after.state.entries.gaodai || []).length;
    const routePage = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await routePage.goto(api + '/#/final', { waitUntil: 'networkidle' });
    await routePage.waitForTimeout(1200);
    const routeOk = await routePage.evaluate(() => !!(document.querySelector('.final-editor-head') || (document.querySelector('#main') || {}).innerText && document.querySelector('#main').innerText.includes('我的模拟卷')));
    const ok = count === 1 && after.rev === before.rev && routeOk;
    console.log(JSON.stringify({ ok, beforeRev: before.rev, afterRev: after.rev, count, routeOk }));
    if (!ok) process.exitCode = 1;
  } finally {
    if (browser) await browser.close();
    if (child.exitCode === null) { child.kill(); await new Promise(r => child.once('exit', r)); }
    await wait(150);
    try { fs.rmSync(temp, { recursive: true, force: true, maxRetries: 8, retryDelay: 150 }); } catch (e) { /* Windows 偶尔仍占用临时目录，不影响结论 */ }
  }
}
main().catch(e => { console.error(e); process.exit(1); });
