#!/usr/bin/env node
'use strict';
/*
 * 发布一致性检查：本地 HEAD、origin/main、tag、GitHub Release、Pages 构建与线上构建号必须一致。
 * 用法：node tools/verify-release.js [--online] [--allow-dirty]
 * 离线只查本地 HEAD/origin/main/tag；--online 额外查 Release 资产、Pages 构建提交与线上 BUILD_ID。
 */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const args = process.argv.slice(2);
const online = args.includes('--online');
const allowDirty = args.includes('--allow-dirty');
const problems = [];
const notes = [];

function git(argv) {
  return execFileSync('git', argv, { cwd: ROOT, encoding: 'utf8' }).trim();
}
function localDate() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Shanghai' }).format(new Date());
}
function parseRemoteUrl(url, env) {
  // 兼容两种 checkout：origin 内嵌 token（本地），或纯 https URL + GITHUB_TOKEN（Actions）。
  const m = url.match(/^https:\/\/(?:([^@/]+)@)?github\.com\/([^/]+)\/(.+?)(?:\.git)?$/);
  if (!m) return null;
  let token = m[1] || '';
  if (token.startsWith('x-access-token:')) token = token.split(':', 2)[1];
  if (!token || token === 'x-access-token') token = (env && (env.GITHUB_TOKEN || env.DSH_ACCOUNT_TOKEN)) || '';
  return { token, owner: m[2], repo: m[3] };
}
function parseRemote() {
  return parseRemoteUrl(git(['remote', 'get-url', 'origin']), process.env);
}
function selfTest() {
  const assert = require('assert');
  assert.deepStrictEqual(parseRemoteUrl('https://github.com/o/r.git', { GITHUB_TOKEN: 'env-token' }), { token: 'env-token', owner: 'o', repo: 'r' });
  assert.deepStrictEqual(parseRemoteUrl('https://x-access-token:pat@github.com/o/r.git', {}), { token: 'pat', owner: 'o', repo: 'r' });
  assert.deepStrictEqual(parseRemoteUrl('https://github.com/o/r', {}), { token: '', owner: 'o', repo: 'r' });
  assert.strictEqual(parseRemoteUrl('https://gitlab.com/o/r.git', { GITHUB_TOKEN: 'x' }), null);
  console.log('verify-release self-test PASS');
}

function updateLogs() {
  const vm = require('vm');
  const source = fs.readFileSync(path.join(ROOT, 'src', 'js', '48-changelog.js'), 'utf8');
  const sandbox = { window: {}, document: { addEventListener() {}, querySelector() { return null; }, querySelectorAll() { return []; }, getElementById() { return null; } }, console };
  vm.runInNewContext(source + '\n;globalThis.__UPDATE_LOG__ = UPDATE_LOG;', sandbox, { filename: '48-changelog.js' });
  return Array.isArray(sandbox.__UPDATE_LOG__) ? sandbox.__UPDATE_LOG__ : [];
}

async function api(token, p) {
  const res = await fetch('https://api.github.com/repos/' + parseRemote().owner + '/' + parseRemote().repo + p, {
    headers: { Authorization: 'Bearer ' + token, Accept: 'application/vnd.github+json', 'User-Agent': 'dsh-release-check' }
  });
  if (!res.ok) throw new Error('GitHub API ' + p + ' -> ' + res.status);
  return res.json();
}

(async () => {
  if (args.includes('--self-test')) { selfTest(); return; }
  const status = git(['status', '--porcelain']);
  if (status && !allowDirty) problems.push('工作区不干净：先提交或 stash，再发布');
  try { git(['fetch', '--quiet', 'origin', 'main']); } catch (e) { notes.push('无法 fetch origin/main：' + e.message); }
  let head = '', remote = '';
  try { head = git(['rev-parse', 'HEAD']); remote = git(['rev-parse', 'origin/main']); } catch (e) { problems.push('读取 HEAD/origin/main 失败：' + e.message); }
  if (head && remote && head !== remote) problems.push('HEAD 与 origin/main 不一致：' + head.slice(0, 10) + ' vs ' + remote.slice(0, 10) + '（发布必须推送到 main）');
  let tagsAtHead = [];
  try { tagsAtHead = git(['tag', '--points-at', 'HEAD']).split('\n').filter(Boolean); } catch (e) { /* ignore */ }
  // 补发旧版本或隔日 dispatch 时优先使用 HEAD 上已有的版本 tag；没有时才要求当天 tag。
  const tag = tagsAtHead.filter(function (t) { return /^v\d{4}\.\d{2}\.\d{2}$/.test(t); })[0] || ('v' + localDate().replace(/-/g, '.'));
  if (tagsAtHead.indexOf(tag) < 0) problems.push('HEAD 缺少当天 tag ' + tag + '（现有：' + (tagsAtHead.join(', ') || '无') + '）');

  if (online) {
    const cfg = parseRemote();
    if (!cfg || !cfg.token) {
      problems.push('无法从 origin 解析 GitHub token，不能做在线检查');
    } else {
      try {
        const rel = await api(cfg.token, '/releases/tags/' + tag);
        const relDate = tag.slice(1).replace(/\./g, '-');
        const log = updateLogs().filter(function (b) { return b && b.date === relDate; })[0];
        if (!log) problems.push('Release ' + tag + ' 找不到同一天的更新记录');
        else {
          const body = String(rel.body || '');
          const count = Array.isArray(log.items) ? log.items.length : 0;
          if (body.indexOf('## 四科错题本 ' + tag) !== 0) problems.push('Release ' + tag + ' 正文标题不是同一天记录');
          if (body.indexOf(String(log.title || '')) < 0) problems.push('Release ' + tag + ' 正文缺少当天标题');
          if (body.indexOf('**' + count + ' 项 · ' + count + ' 组**') < 0) problems.push('Release ' + tag + ' 正文项数与当天记录不一致');
          if (/\.3\.2/.test(body)) problems.push('Release ' + tag + ' 正文仍含小版本后缀 .3.2');
        }
        const assets = new Map((rel.assets || []).map(function (a) { return [a.name, a]; }));
        ['source.zip', 'SHA256SUMS'].forEach(function (n) { if (!assets.has(n)) problems.push('Release ' + tag + ' 缺少资产 ' + n); });
        if (!Array.from(assets.keys()).some(function (n) { return /static.*\.zip$/.test(n); })) problems.push('Release ' + tag + ' 缺少静态站 zip');
        const sumsAsset = assets.get('SHA256SUMS');
        if (sumsAsset) {
          const sumsRes = await fetch(sumsAsset.browser_download_url, { headers: { 'User-Agent': 'dsh-release-check' } });
          if (!sumsRes.ok) problems.push('SHA256SUMS 下载失败 ' + sumsRes.status);
          else {
            const sums = new Map((await sumsRes.text()).split(/\r?\n/).filter(Boolean).map(function (line) {
              const m = line.trim().match(/^([0-9a-f]{64})\s+\*?(.+)$/i);
              return m ? [m[2], m[1].toLowerCase()] : null;
            }).filter(Boolean));
            for (const [name, expected] of sums) {
              const asset = assets.get(name);
              if (!asset) { problems.push('SHA256SUMS 列出的资产不存在：' + name); continue; }
              const got = await fetch(asset.browser_download_url, { headers: { 'User-Agent': 'dsh-release-check' } });
              if (!got.ok) { problems.push('资产下载失败 ' + name + ' ' + got.status); continue; }
              const actual = require('crypto').createHash('sha256').update(Buffer.from(await got.arrayBuffer())).digest('hex');
              if (actual !== expected) problems.push('资产摘要不一致：' + name + ' 期望 ' + expected.slice(0, 12) + ' 实际 ' + actual.slice(0, 12));
              else notes.push('asset sha256 OK ' + name);
            }
          }
        }
      } catch (e) { problems.push('Release ' + tag + ' 不存在或不可读：' + e.message); }
      try {
        const builds = await api(cfg.token, '/pages/builds/latest');
        if (builds && builds.commit && head && builds.commit !== head) problems.push('GitHub Pages 最新构建提交 ' + String(builds.commit).slice(0, 10) + ' 与 HEAD ' + head.slice(0, 10) + ' 不一致');
        if (!builds || !builds.commit) problems.push('GitHub Pages 最新构建没有 commit');
      } catch (e) { problems.push('Pages builds API 不可用：' + e.message); }
      try {
        const res = await fetch('https://' + cfg.owner + '.github.io/', { headers: { 'User-Agent': 'dsh-release-check' } });
        const html = await res.text();
        const m = html.match(/window\.__BUILD_ID__="([^"]+)"/);
        if (!m) problems.push('线上首页没有 BUILD_ID');
        else {
          notes.push('线上 BUILD_ID=' + m[1]);
          const localIndex = path.join(ROOT, 'dist-pages', 'index.html');
          if (fs.existsSync(localIndex)) {
            const lm = fs.readFileSync(localIndex, 'utf8').match(/window\.__BUILD_ID__="([^"]+)"/);
            if (lm && lm[1] !== m[1]) problems.push('线上 BUILD_ID ' + m[1] + ' 与本地 dist-pages ' + lm[1] + ' 不一致');
          }
        }
      } catch (e) { problems.push('线上站点不可访问：' + e.message); }
    }
  }

  notes.forEach(function (n) { console.log('note: ' + n); });
  if (problems.length) {
    problems.forEach(function (p) { console.error('FAIL: ' + p); });
    process.exit(1);
  }
  console.log('release check PASS ' + (head ? head.slice(0, 10) : '') + ' ' + tag);
})().catch(function (e) { console.error('release check crashed: ' + e.message); process.exit(1); });
