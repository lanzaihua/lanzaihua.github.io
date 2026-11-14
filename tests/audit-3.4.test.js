'use strict';
const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');
const ROOT=path.join(__dirname,'..');const read=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
test('Pages build keeps HTML small and ships the bank as an external file',()=>{
  const html=read('index.html'),bank=fs.statSync(path.join(ROOT,'data','bank.json')).size;
  assert.ok(html.length<4*1024*1024,'Pages HTML still '+html.length+' bytes');
  const distPath=path.join(ROOT,'dist','index.html');
  // CI 的 npm check 在 build 之前运行，dist 可能尚未产出；Pages 与 root 必须已拆分。
  if (fs.existsSync(distPath)) assert.ok(html.length<fs.statSync(distPath).size*0.25,'Pages split ratio too weak');
  assert.ok(bank>5*1024*1024,'external bank missing or too small');
  assert.equal((html.match(/http-equiv="Cache-Control"/g)||[]).length,0);
});
test('external bank loader validates shape, caches in IndexedDB and falls back to stale data',()=>{
  const js=read('src/js/01-bank-loader.js');
  assert.match(js,/BANK_DATA_URL = 'data\/bank\.json'/);
  assert.match(js,/indexedDB\.open/);
  assert.match(js,/bankCacheRead\(version, true\)/);
  assert.match(js,/bankDataComplete/);
  assert.match(js,/__BANK_SOURCE__ = 'idb-stale'/);
  assert.match(read('src/js/90-init.js'),/await loadBankData\(\)/);
});
test('Cloudflare cache rules ship and do not claim a completed migration',()=>{
  const headers=read('src/static/_headers');
  assert.match(headers,/\/data\/bank\.json[\s\S]{0,120}stale-while-revalidate/);
  assert.match(headers,/\/index\.html[\s\S]{0,80}max-age=0/);
  assert.match(headers,/X-Content-Type-Options: nosniff/);
  const doc=read('docs/cache-migration-cloudflare.md');
  assert.match(doc,/未把线上域名切到 Cloudflare/);
});
test('AI status parsing and dialog focus have explicit failure paths',()=>{
  const ai=read('src/js/45-ai.js'),init=read('src/js/90-init.js');
  assert.match(ai,/try \{ data = await res\.json\(\); \} catch \(parseErr\) \{ data = null; \}/);
  assert.match(ai,/服务端返回了无法解析的状态/);
  assert.match(init,/document\.addEventListener\('close'/);
  assert.match(init,/refocusAfterRender/);
  assert.match(init,/fatal-actions/);
});
