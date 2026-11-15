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
  const tag = 'v' + localDate().replace(/-/g, '.');
  let tagsAtHead = [];
  try { tagsAtHead = git(['tag', '--points-at', 'HEAD']).split('\n').filter(Boolean); } catch (e) { /* ignore */ }
  if (tagsAtHead.indexOf(tag) < 0) problems.push('HEAD 缺少当天 tag ' + tag + '（现有：' + (tagsAtHead.join(', ') || '无') + '）');

  if (online) {
    const cfg = parseRemote();
    if (!cfg || !cfg.token) {
      problems.push('无法从 origin 解析 GitHub token，不能做在线检查');
    } else {
      try {
        const rel = await api(cfg.token, '/releases/tags/' + tag);
        const names = new Set((rel.assets || []).map(function (a) { return a.name; }));
        ['source.zip', 'SHA256SUMS'].forEach(function (n) { if (!names.has(n)) problems.push('Release ' + tag + ' 缺少资产 ' + n); });
        if (!Array.from(names).some(function (n) { return /static.*\.zip$/.test(n); })) problems.push('Release ' + tag + ' 缺少静态站 zip');
      } catch (e) { problems.push('Release ' + tag + ' 不存在或不可读：' + e.message); }
      try {
        const builds = await api(cfg.token, '/pages/builds/latest');
        if (builds && builds.commit && head && builds.commit !== head) problems.push('GitHub Pages 最新构建提交 ' + String(builds.commit).slice(0, 10) + ' 与 HEAD ' + head.slice(0, 10) + ' 不一致');
      } catch (e) { notes.push('Pages builds API 不可用：' + e.message); }
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
