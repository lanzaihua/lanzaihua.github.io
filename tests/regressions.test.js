'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const zlib = require('node:zlib');
const ROOT = path.join(__dirname, '..');
const KEY = 'sanke-cuotiben-v1';
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
function runtime(raw, denied = false, quota = false) {
  const values = new Map(raw === undefined ? [] : [[KEY, raw]]);
  const subjects = JSON.parse(read('src/data/seed.json')).subjects;
  const ctx = { console, Date, Set, Map, Intl, URL, Blob, setTimeout: () => 0, clearTimeout() {},
    location: {hostname: 'localhost', protocol: 'https:', hash: '', pathname: '/', search: ''},
    localStorage: {getItem(k) {if(denied) throw Error('denied');return values.get(k) ?? null;},setItem(k,v) {if(denied) throw Error('denied'); if (quota) throw Object.assign(Error('quota'), {name: 'QuotaExceededError'}); values.set(k,v);}},
    window: {addEventListener() {}, __SEED__: {subjects}, __BANKS__: {}, __PAGES__: true},
    document: {addEventListener() {}, querySelector(){return null;},querySelectorAll(){return [];}} };
  vm.createContext(ctx);
  vm.runInContext(read('src/js/00-chapters.js') + '\n' + read('src/js/00-core.js'), ctx);
  const realToast = ctx.toast;
  ctx.toast = () => {};
  return {ctx, values, toast: realToast, run(file) {vm.runInContext(read('src/js/'+file), ctx);}};
}
function savedEntry(id='keep') {return {id,code:'A-001',date:'2026-01-01',summary:'保留错题',stars:2,blocks:[],variants:[],points:[],errorTypes:[],status:'unmastered'};}
function savedState() { return {entries: {gaodai:[savedEntry()],shufen:[],jieji:[],xijing:[]},prefs:{theme:'auto'}}; }
test('legacy state without clearEpoch retains entries through migration and reload', () => {
  const r = runtime(JSON.stringify(savedState()));
  assert.equal(r.ctx.state.entries.gaodai[0].id,'keep');
  assert.equal(r.ctx.persistLocal(),true);
  assert.equal(runtime(r.values.get(KEY)).ctx.state.entries.gaodai[0].id,'keep');
});
test('corrupt and invalid-shaped state is preserved instead of overwritten', () => {
  for(const raw of ['{broken',JSON.stringify({entries: []}),JSON.stringify({entries:{gaodai:[null]}})]) {
    const r = runtime(raw); assert.equal(r.ctx.storageRecoveryBlocked,true);
    assert.equal(r.ctx.persistLocal(),false); assert.equal(r.values.get(KEY),raw);
    assert.equal(r.values.get(KEY + '-corrupted-backup'),raw,'corrupt raw text must be backed up under a separate key');
  }
});
test('quota failure keeps the latest state in memory and reports a warning without throwing', () => {
  const r = runtime(JSON.stringify(savedState()), false, true);
  assert.equal(r.ctx.persistLocal(true), false);
  const remembered = r.ctx.safeStorage.memory[KEY];
  assert.match(remembered || '', /"id":"keep"/);
  assert.equal(r.ctx.safeStorage.get(KEY), remembered);
  assert.equal(r.values.get(KEY).includes('"id":"keep"'), true);
});
test('missing static routes use a 404 page that restores the hash route', () => {
  const html = read('src/static/404.html');
  assert.match(html, /location\.replace\(target\)/);
  assert.match(html, /'\/#\/' \+ seg/);
  assert.match(html, /href="\/"/);
});
test('service worker skips API and partial responses and clears old cache names', () => {
  const sw = read('src/static/sw.js');
  assert.match(sw, /CACHE = 'sike-cuotiben-v2'/);
  assert.match(sw, /url\.pathname\.indexOf\('\/api\/'\) === 0\) return/);
  assert.match(sw, /req\.headers\.get\('range'\)/);
  assert.match(sw, /\/sw\.js/);
});
test('route changes move focus to the page heading', () => {
  const js = read('src/js/90-init.js');
  assert.match(js, /function focusRouteHeading\(\)/);
  assert.match(js, /focusRouteHeading\(\);/);
  assert.match(js, /showFatalError/);
  assert.match(js, /unhandledrejection/);
});
test('duplicate toast messages do not stack on screen', () => {
  const r=runtime();
  const {parseHTML}=require('linkedom');
  const {document}=parseHTML('<!doctype html><html><body><div id="toastWrap"></div></body></html>');
  r.ctx.document=document;
  r.toast('同一提示'); r.toast('同一提示'); r.toast('另一条');
  assert.equal(document.querySelectorAll('#toastWrap .toast').length,2);
});
test('blocked browser storage does not abort application boot', () => {
  const r = runtime(undefined,true); assert.equal(r.ctx.sync.token,''); assert.equal(r.ctx.persistLocal(),false);
});
test('malformed entry hash does not abort route parsing', () => {
  const r=runtime(); vm.runInContext(read('src/js/90-init.js').split('function updateHash()')[0],r.ctx);
  r.ctx.location.hash='#/gaodai/entries?e=%E0%A4%A';
  assert.doesNotThrow(()=>r.ctx.parseHash()); assert.equal(r.ctx.state.activeView,'entries');
});
test('AI choices require distinct A-D keys and a correct key present in options',()=>{
  const r=runtime();r.run('59-exam.js');r.ctx.mathifyPlainText=s=>s;r.ctx.smartChapterFor=()=>'';
  const base={question:'选择正确项',answer:'A',standardSolution:'解：A',type:'choice',correct:'A',options:['A','B','C','D'].map(key=>({key,text:key}))};
  assert.ok(r.ctx.finalNormalizeAiQuestion(base,0,'gaodai'));
  assert.equal(r.ctx.finalNormalizeAiQuestion({...base,correct:'Z'},0,'gaodai'),null);
  assert.equal(r.ctx.finalNormalizeAiQuestion({...base,options:[base.options[0],base.options[0],...base.options.slice(2)]},0,'gaodai'),null);
  r.run('60-paper-edit.js');r.ctx.finalSubject=()=>'gaodai';r.ctx.subjectOf=sid=>r.ctx.SUBJ_BY_ID[sid];
  assert.equal(r.ctx.finalPaperNormalizeAiQuestions([{...base,correct:'Z'}],{}).length,0);
  assert.equal(r.ctx.finalPaperNormalizeAiQuestions([base],{}).length,1);
});
test('Markdown strips executable tags, URL schemes and attributes; preserves Markdown and math',()=>{
  const {parseHTML}=require('linkedom'); const {document}=parseHTML('<!doctype html><html><body></body></html>');
  const r=runtime();r.ctx.document=document;r.ctx.window.marked=r.ctx.marked=require('../src/vendor/marked.umd.js');
  vm.runInContext(read('src/vendor/temml.min.js'),r.ctx);r.ctx.window.temml=r.ctx.temml;r.run('10-markdown.js');
  for(const src of ['[danger](javascript:alert%281%29)','<a href="jav&#x61;script:alert(1)">danger</a>','<a href="java&#10;script:alert(1)">danger</a>','<img src=x onerror="alert(1)">','<svg><a href="javascript:alert(1)">x</a></svg>','<iframe srcdoc="<script>alert(1)</script>"></iframe>','<object data="data:text/html,bad"></object>','<img src="data:image/svg+xml;base64,AAAA">']) {
    const html=r.ctx.renderMarkdown(src);const e=document.createElement('div');e.innerHTML=html;
    assert.equal(e.querySelector('script,iframe,object,embed,svg,form,style'),null,html);
    for(const el of e.querySelectorAll('*')) for(const a of el.attributes) {
      assert.ok(!/^on/i.test(a.name),html);
      if(['href','src'].includes(a.name)) assert.ok(!/^(javascript|vbscript|data:text|data:image\/svg)/i.test(a.value.replace(/\s/g,'')),html);
    }
  }
  const normal=r.ctx.renderMarkdown('**粗体** [文档](https://example.com)\n\n$x^2+1$');
  assert.match(normal,/<strong>/);assert.match(normal,/https:\/\/example.com/);assert.match(normal,/<math/);
  assert.match(r.ctx.renderMarkdown('![手写](data:image/png;base64,AAAA)'),/data:image\/png;base64,AAAA/);
  const malformed = '故 H 是对称阵。 （2）由 H^T = H 可得 HH^T = H^2。再由 X^T X = 1 及矩阵乘法的结合律，得 H^2=(E-2XX^{\\mathrm T})^2=E-4XX^{\\mathrm T}+4(XX^{\\mathrm T})(XX^{\\mathrm T})$ =E-4XX^{\\mathrm T}+4X(X^{\\mathrm T}X)X^{\\mathrm T} =E-4XX^{\\mathrm T}+4XX^{\\mathrm T}=E. 因此 HH^T = E。证毕。';
  const malformedHtml = r.ctx.renderMarkdown(malformed);
  const malformedDoc = document.createElement('div'); malformedDoc.innerHTML = malformedHtml;
  assert.equal(malformedDoc.querySelectorAll('.math-raw').length, 0, malformedHtml);
  assert.equal(malformedDoc.textContent.includes('$'), false, malformedHtml);
  assert.equal(malformedDoc.textContent.includes('\\mathrm'), false, malformedHtml);
  assert.ok(malformedDoc.querySelectorAll('math').length >= 4, malformedHtml);
  assert.match(r.ctx.renderMarkdown('由 $H^T=H$ 与 $X^TX=1$ 得 $H^2=E$。'), /<math/);
  const bankTitle = r.ctx.renderMarkdown('概念辨析题 · 需求、供给和均衡价格 · 2★');
  assert.equal(bankTitle.includes('<math'), false, bankTitle);
  assert.match(bankTitle, /2★/);
});
test('literal angle brackets and inline <b> text survive Markdown rendering',()=>{
  const {parseHTML}=require('linkedom'); const {document}=parseHTML('<!doctype html><html><body></body></html>');
  const r=runtime();r.ctx.document=document;r.ctx.window.marked=r.ctx.marked=require('../src/vendor/marked.umd.js');
  vm.runInContext(read('src/vendor/temml.min.js'),r.ctx);r.ctx.window.temml=r.ctx.temml;r.run('10-markdown.js');
  function render(src){const e=document.createElement('div');e.innerHTML=r.ctx.renderMarkdown(src);return e;}
  // 1) <b> 不再连同文字一起被删除
  const bold=render('带 <b>粗体</b> 摘要');
  assert.ok(bold.textContent.includes('粗体'), bold.innerHTML);
  assert.equal(bold.querySelectorAll('math').length,0,bold.innerHTML);
  // 2) 转义后的尖括号标签不再被当作裸公式逐字符排版
  const escaped=render('标签 &lt;img src=x onerror=alert(1)&gt; 结尾');
  assert.ok(escaped.textContent.includes('onerror=alert(1)'), escaped.innerHTML);
  assert.equal(escaped.querySelectorAll('math').length,0,escaped.innerHTML);
  // 3) 未知标签解包保留文字，危险标签仍然整棵删除
  const unknown=render('<foo>保留文字</foo><script>alert(1)</script>');
  assert.ok(unknown.textContent.includes('保留文字'), unknown.innerHTML);
  assert.equal(unknown.querySelector('foo,script'),null,unknown.innerHTML);
});
test('sync conflict preserves local edits and revision',async()=>{
  const r=runtime();r.run('05-sync.js');r.ctx.sync.available=true;r.ctx.renderSyncStatus=()=>{};
  r.ctx.state.rev=7;r.ctx.state.updatedAt='2026-01-01T00:00:00Z';
  r.ctx.fetch=async()=>({status:409,json:async()=>({rev:9,state:{...savedState(),updatedAt:'2026-12-01T00:00:00Z'}})});
  await r.ctx.pushSync(false);assert.equal(r.ctx.state.rev,7);assert.equal(r.ctx.sync.mode,'conflict');
});
test('edits made while pushing retain their timestamp and schedule another push',async()=>{
  const r=runtime();r.run('05-sync.js');r.ctx.sync.available=true;r.ctx.renderSyncStatus=()=>{};
  r.ctx.state.updatedAt='2026-01-01T00:00:00Z';let scheduled=false;
  r.ctx.schedulePush=()=>{scheduled=true;};
  r.ctx.fetch=async()=>{r.ctx.state.updatedAt='2026-01-01T00:00:02Z';return {ok:true,status:200,json:async()=>({rev:8,updatedAt:'2026-01-01T00:00:01Z'})};};
  await r.ctx.pushSync(false);assert.equal(r.ctx.state.updatedAt,'2026-01-01T00:00:02Z');assert.equal(scheduled,true);
});
test('all four complete skill packs are usable without author home directories',()=>{
  const {buildSkillPacks}=require('../tools/build-skill-packs');const packs=buildSkillPacks();
  const {loadSkillBundle}=require('../skills');
  for(const sid of ['gaodai','shufen','jieji','xijing']) {assert.ok(packs.subjects[sid].chapters.every(c=>c.text));assert.ok(loadSkillBundle(sid,'极限', '').materials[0].text);}
  const packed=zlib.gunzipSync(fs.readFileSync(path.join(ROOT,'src/data/skills-pack.json.gz'))).toString('utf8');
  assert.equal(packed,JSON.stringify(packs),'committed skills-pack.json.gz must match the current skill sources');
});
test('filling blanks survive typography normalization and rendering',()=>{
  const {document}=require('linkedom').parseHTML('<html></html>');const r=runtime();r.ctx.document=document;
  r.ctx.window.marked=r.ctx.marked=require('../src/vendor/marked.umd.js');r.run('10-markdown.js');
  assert.match(r.ctx.renderMarkdown('答案是____。'),/____/);
});
test('paper preview includes all choice options and material import preserves metadata',()=>{
  const r=runtime(); r.ctx.document.addEventListener=()=>{}; r.run('58-final.js');r.run('60-paper-edit.js');
  r.ctx.renderMarkdown=s=>s;r.ctx.stripTypePrefix=s=>s;
  const html=r.ctx.finalPaperItemHtml({options:[{key:'A',text:'第一项'},{key:'B',text:'第二项'}]},0,{});
  assert.match(html,/第一项/);assert.match(html,/第二项/);
  const paper={items:[]};const m={key:'bank:q',id:'q',questionType:'choice',options:[{key:'A',text:'保留项'}],correct:'A',standardSolution:'完整解答',points:['要点']};
  r.ctx.finalActivePaper=()=>paper;r.ctx.finalSubject=()=>'gaodai';r.ctx.document={querySelector:()=>({value:'bank:q'})};
  r.ctx.finalMaterialsForChapters=()=>[m];r.ctx.markDirty=()=>{};r.ctx.render=()=>{};
  r.ctx.finalPaperImportMaterial();assert.equal(paper.items[0].options[0].text,'保留项');assert.equal(paper.items[0].standardSolution,'完整解答');
});
test('local edit counter is independent from server optimistic-lock revision',async()=>{
  const r=runtime();r.run('05-sync.js');r.ctx.sync.available=true;r.ctx.sync.baseRev=2;r.ctx.state.rev=17;r.ctx.renderSyncStatus=()=>{};let sent;
  r.ctx.fetch=async(url,opts)=>{sent=JSON.parse(opts.body);return {ok:true,status:200,json:async()=>({rev:3})};};
  await r.ctx.pushSync(false);assert.equal(sent.baseRev,2);assert.equal(r.ctx.state.syncBaseRev,3);
});
test('textbook analyses contain no accidentally appended chapter appendix',()=>{
  for(const f of ['bank-algebra','bank-analysis','bank-geometry','bank-western']) for(const q of JSON.parse(read('src/data/'+f+'.json')).items) {
    for(const field of ['detailedAnalysis','pitfalls']) assert.doesNotMatch(JSON.stringify(q[field]),/## (题型清单|Reference Tables|课堂重点|Key Takeaways)/,q.id);
  }
});
test('bank math never loses command backslashes',()=>{
  const corrupt=/(?:[A-Za-z](?:subset|subseteq)|=(?:mathbb|mathcal|mathrm|frac|sqrt|infty|cdot|times|partial|nabla)|\bvin\s+[A-Z])/;
  for(const f of ['bank-algebra','bank-analysis','bank-geometry','bank-western']) for(const q of JSON.parse(read('src/data/'+f+'.json')).items) {
    const fields=[q.question,q.answer,q.standardSolution,q.detailedAnalysis].concat((q.options||[]).map(o=>o.text||''),q.solution||[]);
    for(const field of fields) assert.doesNotMatch(String(field||''),corrupt,q.id+' · '+field);
  }
});
test('all nonempty bank template references resolve in the same subject',()=>{
  const subjects=JSON.parse(read('src/data/seed.json')).subjects;
  const files={gaodai:'algebra',shufen:'analysis',jieji:'geometry',xijing:'western'};
  for(const subject of subjects) {
    const ids=new Set(subject.templates.map(t=>t.id));
    for(const q of JSON.parse(read('src/data/bank-'+files[subject.id]+'.json')).items) if(q.templateId) assert.ok(ids.has(q.templateId),q.id+': '+q.templateId);
  }
});
test('corrected textbook least-squares solution satisfies the unrounded normal equations',()=>{
  const a=[.39,.61,.93,1.35],b=[-1.89,-1.80,-1.68,-1.50];
  const u=a.reduce((s,v)=>s+v*v,0),v=a.reduce((s,x,i)=>s+x*b[i],0),w=b.reduce((s,y)=>s+y*y,0);
  const c=a.reduce((s,x)=>s+x,0),d=b.reduce((s,y)=>s+y,0);const determinant=u*w-v*v;
  assert.ok(Math.abs(determinant-8.76475395)<1e-10);
  const x=(c*w-v*d)/determinant,y=(u*d-v*c)/determinant;
  assert.ok(Math.abs(x-.19722002578292572)<1e-10);assert.ok(Math.abs(y+.48807896084749763)<1e-10);
  const q=JSON.parse(read('src/data/bank-algebra.json')).items.find(q=>q.id==='GA-TX043');
  assert.match(q.standardSolution,/8\.76475395/);assert.match(q.answer,/0\.197/);
});
test('startup sync never silently replaces unsynced local changes with newer remote data',async()=>{
  const r=runtime(JSON.stringify(savedState()));r.run('05-sync.js');r.ctx.PAGES=false;
  r.ctx.state.syncDirty=true;r.ctx.state.syncBaseRev=2;r.ctx.state.updatedAt='2026-01-01T00:00:00Z';
  r.ctx.renderSyncStatus=()=>{};r.ctx.fetch=async url=>({ok:true,status:200,json:async()=>({rev:3,state:{...savedState(),updatedAt:'2026-12-01T00:00:00Z'}})});
  await r.ctx.initSync();assert.equal(r.ctx.state.updatedAt,'2026-01-01T00:00:00Z');assert.equal(r.ctx.sync.mode,'conflict');
});
test('Markdown tables render as tables instead of bare formulas',()=>{
  const {parseHTML}=require('linkedom'); const {document}=parseHTML('<!doctype html><html><body></body></html>');
  const r=runtime();r.ctx.document=document;r.ctx.window.marked=r.ctx.marked=require('../src/vendor/marked.umd.js');
  vm.runInContext(read('src/vendor/temml.min.js'),r.ctx);r.ctx.window.temml=r.ctx.temml;r.run('10-markdown.js');
  const e=document.createElement('div');e.innerHTML=r.ctx.renderMarkdown('| 方法 | 结果 |\n|---|---|\n| 展开 | 4 |\n| 配方 | 4 |');
  assert.equal(e.querySelectorAll('table').length,1,e.innerHTML);
  assert.equal(e.querySelectorAll('tbody tr').length,2,e.innerHTML);
  assert.equal(e.querySelectorAll('math').length,0,e.innerHTML);
  const withMath=document.createElement('div');withMath.innerHTML=r.ctx.renderMarkdown('| 方法 | 结果 |\n|---|---|\n| 展开 | $x^2$ |');
  assert.equal(withMath.querySelectorAll('table').length,1,withMath.innerHTML);
  assert.equal(withMath.querySelectorAll('math').length,1,withMath.innerHTML);
});
test('library backup excludes built-in banks and templates',()=>{
  const r=runtime();r.run('30-library.js');
  r.ctx.state.userTemplates.gaodai=[{id:'U-01',title:'用户模板'}];
  r.ctx.state.userBank.gaodai=[{id:'UB-1',title:'用户题'}];
  const payload=r.ctx.exportLibraryPayload();
  assert.equal(payload.templates.gaodai.length,1);
  assert.equal(payload.bank.gaodai.length,1);
  assert.equal(payload.templates.shufen.length,0);
  assert.equal(payload.bank.xijing.length,0);
});
test('unknown top-level route returns to overview instead of staying on missing page',()=>{
  const r=runtime();vm.runInContext(read('src/js/90-init.js').split('function updateHash()')[0],r.ctx);
  r.ctx.state.activeView='entries';r.ctx.toast=()=>{};let replaced='';r.ctx.history={replaceState(_a,_b,url){replaced=url;}};
  r.ctx.location.hash='#/no-such-page';
  assert.doesNotThrow(()=>r.ctx.parseHash());
  assert.equal(r.ctx.state.activeView,'overview');
  assert.match(replaced,/#\//);
});
test('opening notifications does not clear unread badges; expanding one marks only that item read',()=>{
  const r=runtime();r.run('55-notifications.js');
  r.ctx.state.notifications=[{id:'n1',title:'更新一',body:'正文一',kind:'update',read:false},{id:'n2',title:'更新二',body:'正文二',kind:'tip',read:false}];
  const layer={hidden:true,classList:{toggle(){}}};
  r.ctx.qs=q=>q==='#notifLayer'?layer:q==='#notifPanel'?{focus(){}}:null;
  r.ctx.qsa=()=>[];r.ctx.document={documentElement:{classList:{add(){},remove(){}}}};
  r.ctx.markDirty=()=>{};let rendered=0;r.ctx.renderNotifications=()=>{rendered++;};
  r.ctx.openNotifications();
  assert.deepEqual(r.ctx.state.notifications.map(n=>n.read),[false,false]);
  assert.equal(r.ctx.notifUnreadCount(),2);
  r.ctx.notifMarkRead('n1');
  assert.deepEqual(r.ctx.state.notifications.map(n=>n.read),[true,false]);
  assert.equal(r.ctx.notifUnreadCount(),1);
  assert.ok(rendered>=2);
});
test('manual pull asks before replacing local changes; background pull preserves them',async()=>{
  const r=runtime();r.run('05-sync.js');r.ctx.sync.available=true;r.ctx.state.syncDirty=true;
  r.ctx.state.entries.gaodai=[savedEntry()];r.ctx.renderSyncStatus=()=>{};let confirm=false;
  r.ctx.confirmDialog=()=>{confirm=true;};r.ctx.fetch=async()=>({ok:true,status:200,json:async()=>({rev:4,state:{...savedState(),updatedAt:'2026-12-01'}})});
  await r.ctx.pullSync(false);assert.equal(confirm,false);assert.equal(r.ctx.sync.mode,'conflict');
  await r.ctx.pullSync(true);assert.equal(confirm,true);assert.equal(r.ctx.state.entries.gaodai[0].id,'keep');
});
test('bank labels follow question structure instead of a single template',()=>{
  const banks=['algebra','analysis','geometry','western'].map(k=>JSON.parse(read('src/data/bank-'+k+'.json')).items).flat();
  const diagnosis=/误差|近似|某同学|错误|错解|指出|纠错|诊断|验算|检验/;
  for(const q of banks){
    if(q.examOrigin==='教材课后习题') continue;
    assert.ok(String(q.title).startsWith(q.category+' ·'),q.id+' 标题分类与 category 不一致');
    assert.ok(!(q.category==='应用题'&&/^应用情境：结合实际问题中的数据/.test(q.question)),q.id+' 应用题仍是伪情境前缀');
    if(q.subject==='gaodai'&&q.category==='误差分析题') assert.match(q.question,diagnosis,q.id+' 高代误差分析题没有诊断信号');
  }
  assert.equal(banks.filter(q=>q.examOrigin!=='教材课后习题'&&q.subject==='gaodai'&&q.category==='应用题').length,0);
});
test('cases environments, Chinese subscripts and multi-part proofs render without raw LaTeX',()=>{
  const {parseHTML}=require('linkedom'); const {document}=parseHTML('<!doctype html><html><body></body></html>');
  const r=runtime();r.ctx.document=document;r.ctx.window.marked=r.ctx.marked=require('../src/vendor/marked.umd.js');
  vm.runInContext(read('src/vendor/temml.min.js'),r.ctx);r.ctx.window.temml=r.ctx.temml;r.run('10-markdown.js');
  const src='证明：定义 F(x)=\\begin{cases} f(a+0), & x = a, \\\\ f(x), & a<x<b, \\\\\\\\$ f(b-0), & x=b. \\end{cases} 由 f 在 (a,b) 上连续以及单侧极限的定义，得 F 在 [a,b] 上连续。（1）因 F 在闭区间 [a,b] 上连续，故有界。（2）由最大最小值定理，F 取得最大值。（3）由一致连续性定理，f 在 (a,b) 上一致连续。证毕。';
  const e=document.createElement('div');e.innerHTML=r.ctx.renderMarkdown(src);
  assert.equal(e.querySelectorAll('.math-raw').length,0,e.innerHTML);
  assert.equal(e.querySelectorAll('math').length>0,true,e.innerHTML);
  assert.equal(e.textContent.includes('\\begin{cases}'),false,e.innerHTML);
  assert.equal(e.textContent.includes('\\end{cases}'),false,e.innerHTML);
  assert.equal(e.textContent.includes('\uE000'),false,e.innerHTML);
  assert.ok(e.querySelectorAll('p').length>=4,e.innerHTML);
  const chinese=document.createElement('div');chinese.innerHTML=r.ctx.renderMarkdown('答案：$P_{竞争}<P_{垄断}$；$Q_{市场}<Q^*$。');
  assert.equal(chinese.querySelectorAll('.math-raw').length,0,chinese.innerHTML);
  assert.equal(chinese.querySelectorAll('math').length,2,chinese.innerHTML);
  const text=document.createElement('div');text.innerHTML=r.ctx.renderMarkdown('$f\\text{严格单调且连续}\\Rightarrow f^{-1}\\text{在}f(I)\\text{上连续}$。');
  assert.equal(text.querySelectorAll('.math-raw').length,0,text.innerHTML);
  assert.equal(text.textContent.includes('\\text'),false,text.innerHTML);
});

test('bare arithmetic in Chinese prose renders as math while dates and IDs stay text',()=>{
  const {parseHTML}=require('linkedom'); const {document}=parseHTML('<!doctype html><html><body></body></html>');
  const r=runtime();r.ctx.document=document;r.ctx.window.marked=r.ctx.marked=require('../src/vendor/marked.umd.js');
  vm.runInContext(read('src/vendor/temml.min.js'),r.ctx);r.ctx.window.temml=r.ctx.temml;r.run('10-markdown.js');
  const proof=r.ctx.renderMarkdown('由阿基米德性，取充分大的正整数 n，使 1/n < b-a，则区间 (a,b) 内至少含一个分母为 n 的有理数。');
  assert.match(proof,/<math/);
  assert.equal(proof.includes('math-raw'),false,proof);
  const dates=r.ctx.renderMarkdown('日期 2026-11-08 与 2026/11/08，版本 v1.2。');
  assert.equal((dates.match(/<math/g)||[]).length,0,dates);
  const ids=r.ctx.renderMarkdown('编号 GA-B0001，题号 MA-0001。');
  assert.equal((ids.match(/<math/g)||[]).length,0,ids);
});
test('bank titles do not repeat the difficulty star inside the title',()=>{
  const banks=['algebra','analysis','geometry','western'].map(k=>JSON.parse(read('src/data/bank-'+k+'.json')).items).flat();
  const bad=banks.filter(q=>/[·•]\s*[1-5]\s*★\s*$/.test(String(q.title||'')));
  assert.deepEqual(bad.map(q=>q.id).slice(0,5),[],'题库标题尾部重复星级');
});
test('bank objective options survive the move into an entry',()=>{
  const r=runtime();
  const md=r.ctx.bankQuestionMarkdown({question:'下列正确的是（ ）。',type:'choice',options:[{key:'A',text:'甲'},{key:'B',text:'乙'},{key:'C',text:'丙'},{key:'D',text:'丁'}]});
  assert.match(md,/A．甲/);assert.match(md,/D．丁/);
  assert.equal(md.split('\n\n').length,5,md);
  assert.match(read('src/js/40-editor.js'),/md: bankQuestionMarkdown\(it\)/,'加入错题本必须复用选项格式化函数');
});
test('styles keep MathML layout boxes and balanced mobile action rows',()=>{
  const css=read('src/styles.css');
  assert.ok(css.includes('display: inline math !important'),'MathML 行内公式必须保留 math 盒模型');
  assert.equal(css.includes('display: revert !important'),false,'revert 会把 MathML 子元素交还 UA 的 block math，行内公式因此独占整行');
  assert.match(css,/\.math-inline-scroll math > \*:not\(mtable\)[\s\S]{0,220}display:\s*inline math !important/,'行内公式的 mrow 必须保持 inline math，不能整行占宽');
  assert.match(css,/\.exam-result-option\s*\{[^}]*display:\s*flex/,'模拟考结果选项需要 flex 排版，选项字母不能单独占行');
  assert.match(css,/\.bank-option\s*\{[^}]*display:\s*flex/,'题库选项需要 flex 排版，选项字母不能单独占行');
  assert.ok(/\.math-inline-scroll\.is-wide[\s\S]{0,400}font-size: 1em !important/.test(css),'宽公式不能缩小字号');
  assert.match(css,/\.bank-actions\s*\{[^}]*grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\)/,'移动端题库操作按钮应为两列');
  assert.match(css,/\.entry-foot\s*\{[^}]*grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\)/,'移动端错题操作按钮应为两列');
});
test('site shell restores warm home greeting and paper layout',()=>{
  const tpl=read('src/index.template.html'), css=read('src/styles.css');
  assert.match(tpl,/id="homeGreeting"/,'首页必须有问候主标题');
  assert.match(tpl,/id="homeWelcome"/,'首页必须有每日问候副标题');
  assert.equal(tpl.includes('今天从哪一科开始'),false,'首页不能退回固定主标题');
  assert.match(css,/--paper:\s*#f4f1e9/,'全站必须回到暖米色纸面');
  assert.match(css,/--accent:\s*#b23a26/,'强调色必须回到砖红');
  assert.equal(/--paper:\s*#f2f2ed/.test(css),false,'不能重新引入冷纸色');
});
test('exam header stays sticky at a stable height with explicit expand and collapse rules',()=>{
  const css=read('src/styles.css'), js=read('src/js/59-exam.js');
  assert.match(css,/\.exam-sticky\s*\{[^}]*position:\s*sticky[^}]*height:\s*124px/,'答题页必须使用常高 sticky 外壳，避免收缩时内容跳动');
  assert.match(css,/\.exam-sticky\s+\.exam-top\s*\{[^}]*position:\s*absolute/,'考试信息栏应浮在常高外壳内');
  assert.match(css,/\.exam-top\s*\{[^}]*transition:\s*none/,'考试信息栏不能用 padding/gap 过渡制造闪烁');
  assert.equal(/transition:\s*padding/.test(css),false,'考试信息栏不应过渡布局属性');
  assert.match(css,/html,\s*body\s*\{[^}]*overflow-x:\s*clip/,'html/body 不能建立滚动容器，否则 sticky 失效');
  assert.ok(css.includes('overflow-wrap: anywhere'),'长语言标题必须允许断行，不能横向溢出');
  assert.ok(js.includes('finalExamSyncHeaderHeight'),'收缩/语言变化后必须重新同步外壳高度');
  assert.match(js,/if\s*\(next\s*&&\s*finalExamAtTop\(\)\)\s*next\s*=\s*false/,'回到顶端前不得自动展开');
  assert.match(js,/down\s*&&\s*y\s*>\s*64/,'只有向下滚动才收缩');
  assert.match(js,/touchmove[\s\S]{0,700}finalExamExpandHeader/,'手机端应支持下拉查看考试信息');
  assert.match(js,/pointerenter[\s\S]{0,700}finalExamSetCompact\(false\)/,'桌面端鼠标移入窄栏应恢复宽栏');
});

test('markdown lists survive bare-math wrapping and short display formulas stay inline',()=>{
  const {parseHTML}=require('linkedom'); const {document}=parseHTML('<!doctype html><html><body></body></html>');
  const r=runtime();r.ctx.document=document;r.ctx.window.marked=r.ctx.marked=require('../src/vendor/marked.umd.js');
  vm.runInContext(read('src/vendor/temml.min.js'),r.ctx);r.ctx.window.temml=r.ctx.temml;r.run('10-markdown.js');
  const list=document.createElement('div');list.innerHTML=r.ctx.renderMarkdown('- 第一条\n- 第二条\n- 第三条');
  assert.equal(list.querySelectorAll('ul > li').length,3,list.innerHTML);
  assert.equal(list.textContent.includes('-第一条'),false,list.innerHTML);
  const short=document.createElement('div');
  short.innerHTML=r.ctx.renderMarkdown('将矩阵多项式等式变形为\n\n$$AB=E$$\n\n的形式');
  assert.equal(short.querySelectorAll('.math-display').length,0,short.innerHTML);
  assert.equal(short.querySelectorAll(':scope > p').length,1,short.innerHTML);
  assert.equal(short.querySelectorAll('math').length,1,short.innerHTML);
  const english=document.createElement('div');
  english.innerHTML=r.ctx.renderMarkdown('提示词改为：points / pitfalls 每条写完整句子，复查 390 / 820 / 1440 三端。');
  assert.equal(english.querySelectorAll('math').length,0,'英文词组与宽度列表不能排成公式：'+english.innerHTML);
  assert.match(english.textContent,/points \/ pitfalls/);
  assert.match(english.textContent,/390 \/ 820 \/ 1440/);
  const prose=document.createElement('div');
  prose.innerHTML=r.ctx.renderMarkdown('Markdown 列表恢复逐条，AI 提示词保留空格；全部来源 / 考研同型 / 教材课后。');
  assert.equal(prose.textContent.trim(),'Markdown 列表恢复逐条，AI 提示词保留空格；全部来源 / 考研同型 / 教材课后。','裸公式扫描不能吞掉中英文之间的空格：'+prose.innerHTML);
  const inline=document.createElement('div');
  inline.innerHTML=r.ctx.renderInline('Markdown 列表与 390 / 820 / 1440 复查。');
  assert.match(inline.textContent,/Markdown 列表与 390 \/ 820 \/ 1440 复查/);
  const oneMath=document.createElement('div');
  oneMath.innerHTML=r.ctx.renderMarkdown('设 $AB=E$，复查 390 / 820 / 1440 三端。');
  assert.equal(oneMath.querySelectorAll('math').length,1,oneMath.innerHTML);
  const heading=document.createElement('div');
  heading.innerHTML=r.ctx.renderMarkdown('##平面的法式方程（Normal Equation of a Plane）\n\n###一、定义与来源');
  assert.equal(heading.querySelectorAll('h2').length,1,'无空格 ## 也必须渲染成标题：'+heading.innerHTML);
  assert.equal(heading.querySelectorAll('h3').length,1,'无空格 ### 也必须渲染成标题：'+heading.innerHTML);
  assert.equal(heading.textContent.includes('##'),false,heading.innerHTML);
  const strong=document.createElement('div');
  strong.innerHTML=r.ctx.renderMarkdown('**用途1：点与平面的离差（带符号距离）。**定义 $M_0$ 到平面的距离。');
  assert.equal(strong.querySelectorAll('strong').length,1,'粗体右界后紧跟中文也必须生效：'+strong.innerHTML);
  assert.equal(strong.textContent.includes('**'),false,strong.innerHTML);
  assert.equal(strong.querySelectorAll('math').length,1,strong.innerHTML);
  const longProof=document.createElement('div');
  const longTex='(\\lambda_1 a_1+\\lambda_2 a_2+\\cdots+\\lambda_n a_n)='+Array.from({length:80},(_,i)=>'\\lambda_'+(i+1)+' a_'+(i+1)).join('+');
  longProof.innerHTML=r.ctx.renderMarkdown('证明：$'+longTex+'$。');
  assert.equal(longProof.querySelectorAll('math').length,1,'长行内公式不能被当成坏 $ 删掉：'+longProof.innerHTML.slice(0,300));
  assert.equal(longProof.textContent.includes('$'),false,longProof.innerHTML.slice(0,300));
  assert.equal(longProof.textContent.includes('\\lambda'),false,'长公式不能把 LaTeX 命令漏成正文：'+longProof.textContent.slice(0,200));
  const badCmd=document.createElement('div');
  badCmd.innerHTML=r.ctx.renderMarkdown('证明：$\\1 a_1+\\lambda_2 a_2$。');
  assert.equal(badCmd.querySelectorAll('math').length,1,'反斜杠数字不是合法命令，不能让整条公式回退：'+badCmd.innerHTML.slice(0,300));
  assert.equal(badCmd.textContent.includes('\\'),false,'反斜杠数字应被清理，不能漏进正文：'+badCmd.textContent.slice(0,200));
  const cases=document.createElement('div');
  cases.innerHTML=r.ctx.renderMarkdown('$$\\begin{cases}x=1\\\\y=2\\end{cases}$$');
  assert.equal(cases.querySelectorAll('.math-display').length,1,cases.innerHTML);
  const long=document.createElement('div');
  long.innerHTML=r.ctx.renderMarkdown('$$'+'a+b+c+d+e+f+g+h+i+j+k+l+m+n+o+p+q+r+s+t+u+v+w+x+y+z+1+2+3+4+5+6+7+8+9+0+'.repeat(3)+'$$');
  assert.equal(long.querySelectorAll('.math-display').length,1,long.innerHTML);
  const table=document.createElement('div');
  table.innerHTML=r.ctx.renderMarkdown('| 字段 | 要求 | 页面位置 |\n|---|---|---|\n| 知识要点 | 2–4 个可搜索短语，含定理 / 方法 / 公式名 | 条目信息 |');
  assert.equal(table.querySelectorAll('table').length,1,'表格行必须保持表格：'+table.innerHTML);
  assert.equal(table.querySelectorAll('td').length,3,'单元格间的管道符不能被吞成公式：'+table.innerHTML);
  assert.equal(table.textContent.includes('2–4 个可搜索短语'),true,table.textContent);
  assert.equal(table.textContent.includes('|'),false,'表格管道符不能漏进正文：'+table.textContent);
});
test('real AI progress uses determinate values only when the total is known',()=>{
  const {parseHTML}=require('linkedom');
  const {document}=parseHTML('<!doctype html><html><body></body></html>');
  const r=runtime(); r.ctx.document=document;
  vm.runInContext(read('src/js/43-ai-progress.js'), r.ctx);
  document.body.innerHTML=r.ctx.aiProgressHtml('unit',{steps:['检索资料','分批命题','查重去重','组卷校验'],stage:'正在检索课程资料…'});
  const track=document.querySelector('[data-progress-track]');
  assert.equal(track.getAttribute('role'),'progressbar');
  assert.equal(track.hasAttribute('aria-valuenow'),false,'未知总量时不能伪造百分比');
  assert.ok(document.querySelector('.ai-progress').classList.contains('is-indeterminate'));
  r.ctx.aiProgressSet('unit',{percent:40,stage:'已生成 4 / 10 题',step:1,detail:'真实完成量'});
  assert.equal(track.getAttribute('aria-valuenow'),'40');
  assert.equal(document.querySelector('[data-progress-value]').textContent,'40%');
  assert.equal(document.querySelector('.ai-progress').classList.contains('is-indeterminate'),false);
  assert.ok(document.querySelectorAll('[data-progress-step]')[0].classList.contains('is-done'));
  assert.ok(document.querySelectorAll('[data-progress-step]')[1].classList.contains('is-active'));
});
test('AI entry, generation and grading are wired to real progress and cancellation',()=>{
  const ai=read('src/js/45-ai.js'), exam=read('src/js/59-exam.js'), css=read('src/styles.css');
  assert.equal(/AI_STAGES/.test(ai),false,'旧的假阶段表必须删除');
  assert.match(ai,/aiProgressStart\('ai-entry'/,'智能录入必须启动真实进度');
  assert.match(exam,/var total = count;/,'出题进度分母必须是真实目标题数，不能加虚数');
  assert.match(exam,/finalExamReportAiProgress/,'出题函数必须回报真实阶段与已生成题数');
  assert.match(exam,/AbortController/,'AI 批改必须可中断');
  assert.match(exam,/final-ai-grading-cancel/,'批改界面必须有取消入口');
  assert.match(exam,/finalExamClearGradeProgress/,'批改结束必须清理进度计时器');
  assert.match(css,/\.ai-progress-track/,'进度条必须有稳定布局');
  assert.match(css,/prefers-reduced-motion:[\s\S]{0,120}\.ai-progress/,'进度条必须尊重减少动态效果');
  assert.match(exam,/finalExamStopGenerate/,'取消 AI 出题必须同时中止网络请求');
  assert.match(exam,/if \(aiDone \|\| run !== finalExamGenerateRun/,'取消后异步结果不得再打开考生守则');
  assert.match(exam,/ai && Array\.isArray\(ai\.errorPoints\)/,'AI 批改返回空对象时不能用 null 属性崩溃');
  assert.equal(/TEMP debug hook/.test(exam),false,'发布源码不能保留调试钩子');
});
test('long AI waits stream real fields, real item counts and live elapsed time',()=>{
  const ai=read('src/js/45-ai.js'), exam=read('src/js/59-exam.js');
  const auto=read('src/js/47-auto-ai.js'), kb=read('src/js/57-knowledge-search.js');
  const comp=read('src/js/43-ai-progress.js'), css=read('src/styles.css');
  assert.equal(/aiEntryPercent/.test(ai),false,'智能录入不得再用阶段序号伪造百分比');
  assert.match(ai,/function aiEntryStreamProgress/,'智能录入必须按流式字段推进百分比');
  assert.match(ai,/onDelta:\s*function/,'智能录入必须消费模型流式正文');
  assert.match(ai,/pct = 8 \+ frac \* 80/,'智能录入百分比必须来自字段完成度');
  assert.match(ai,/aiProgressStart\('ai-entry',\s*\{[\s\S]{0,300}percent:\s*0/,'智能录入必须从 0% 确定进度开始');
  assert.match(comp,/function aiProgressJsonFields/,'必须能统计已收到的 JSON 字段');
  assert.match(comp,/function aiProgressJsonArray/,'必须能统计已收到的数组对象');
  assert.match(comp,/aiProgressPct\(state.percent\)/,'百分比必须统一取整');
  assert.match(comp,/percent < last/,'同一任务进度不得倒退');
  assert.match(comp,/data-progress-state="running" aria-busy="true"/,'进度条必须声明运行状态');
  assert.match(comp,/ai-progress-live-dot/,'必须有心跳活动标记');
  assert.match(comp,/setInterval\([\s\S]{0,260}250\)/,'等待秒数必须高频实时刷新');
  assert.match(comp,/function aiProgressSetElapsed/,'必须单独更新等待时间，不能重绘整块');
  assert.match(css,/\.ai-progress-fill \{[^}]*transition: width \.12s linear/,'确定进度必须快速跟随真实百分比');
  assert.equal(/ai-progress-sheen/.test(css.split('@keyframes ai-progress-sheen')[0]),false,'确定进度不得再叠加扫光假动画');
  assert.match(css,/@keyframes ai-progress-dot/,'运行状态必须有可感知的活动标记');
  assert.match(exam,/p\.percent/,'出题百分比必须优先用真实 percent');
  assert.match(exam,/for \(var index = 0; index < totalToCheck; index\+\+\)/,'批改必须逐题推进，不能一次性跳到结果');
  assert.match(exam,/report\(\{ step: 2, loaded: done, total: totalToCheck, percent:/,'批改进度必须来自真实已核对题数');
  assert.match(exam,/await finalExamYieldFrame\(\)/,'逐题批改必须让出动画帧，进度才能实时显示');
  assert.match(exam,/aiProgressJsonArray\(fullText, 'questions'/,'批改必须按流式返回的题目对象推进');
  assert.match(auto,/onDelta:\s*function/,'自动补全必须消费流式正文');
  assert.match(kb,/onDelta:\s*function/,'知识点补全必须消费流式正文');
});
test('streamed JSON fields and arrays produce monotonic exact progress',()=>{
  const {parseHTML}=require('linkedom');
  const {document}=parseHTML('<!doctype html><html><body></body></html>');
  const r=runtime(); r.ctx.document=document;
  r.ctx.setInterval=setInterval; r.ctx.clearInterval=clearInterval;
  vm.runInContext(read('src/js/43-ai-progress.js'), r.ctx);
  var f=r.ctx.aiProgressJsonFields('{"summary":"已收到","question":"设 f(x)=x^2',['summary','question','answer'],{question:100});
  assert.equal(f.completed,1);assert.equal(f.currentKey,'question');assert.ok(f.partial>0);
  var arr=r.ctx.aiProgressJsonArray('{"questions":[{"id":1},{"id":2},{"id":3','questions',40);
  assert.equal(arr.completed,2);assert.ok(arr.partial>0);
  document.body.innerHTML=r.ctx.aiProgressHtml('unit',{percent:0,steps:['准备','请求','解析'],stage:'开始'});
  r.ctx.aiProgressSet('unit',{percent:40,stage:'已收到 4 / 10 字段'});
  assert.equal(document.querySelector('[data-progress-fill]').style.width,'40%');
  assert.equal(document.querySelector('[data-progress-value]').textContent,'40%');
  r.ctx.aiProgressSet('unit',{percent:20,stage:'重试'});
  assert.equal(document.querySelector('[data-progress-fill]').style.width,'40%','进度不得倒退');
  assert.equal(document.querySelector('[data-progress-track]').getAttribute('aria-valuenow'),'40');
  r.ctx.aiProgressSet('unit',{percent:100,complete:true,stage:'完成'});
  assert.equal(document.querySelector('[data-progress-fill]').style.width,'100%');
  assert.equal(document.querySelector('.ai-progress').classList.contains('is-complete'),true);
});
test('elapsed text is live to a tenth of a second and completion needs an explicit flag',()=>{
  const {parseHTML}=require('linkedom');
  const {document}=parseHTML('<!doctype html><html><body></body></html>');
  const r=runtime(); r.ctx.document=document;
  r.ctx.setInterval=setInterval; r.ctx.clearInterval=clearInterval;
  vm.runInContext(read('src/js/43-ai-progress.js'), r.ctx);
  assert.equal(r.ctx.aiProgressElapsedText(5200),'已等待 5.2 秒');
  assert.equal(r.ctx.aiProgressElapsedText(12345),'已等待 12 秒');
  document.body.innerHTML=r.ctx.aiProgressHtml('unit',{steps:['请求','解析','写入'],stage:'正在请求…'});
  const root=document.querySelector('.ai-progress');
  const track=document.querySelector('[data-progress-track]');
  assert.equal(root.getAttribute('aria-busy'),'true');
  r.ctx.aiProgressSet('unit',{percent:100,running:false,stage:'已写入'});
  assert.equal(root.classList.contains('is-complete'),false,'只有显式完成才能标记完成');
  assert.equal(root.getAttribute('aria-busy'),'false');
  r.ctx.aiProgressSet('unit',{percent:100,complete:true,stage:'完成'});
  assert.ok(root.classList.contains('is-complete'));
  assert.equal(root.getAttribute('data-progress-state'),'complete');
});

test('notification update digest groups items and gives each a stable card',()=>{
  const r=runtime();r.run('55-notifications.js');
  const body='版本：2026-11-09 · 通知界面修复\n\n本次更新只改通知面板。\n\n本次更新内容：\n1. 【一键已读】把一键清空换成把全部未读标为已读。\n2. 【角标】修复手机端右上角孤立数字。\n3. 【版式】把更新内容拆成日期、摘要和分组卡片。';
  assert.equal(JSON.stringify(r.ctx.notifParseUpdateItems(body).map(x=>x.group)),JSON.stringify(['一键已读','角标','版式']));
  assert.equal(r.ctx.notifParseUpdateSummary(body),'本次更新只改通知面板。');
  assert.equal(r.ctx.notifParseUpdateMeta(body).date,'2026-11-09');
  r.ctx.ui.notifOpen={u1:true};
  const html=r.ctx.notificationItemHtml({id:'u1',title:'网页已更新 · 2026-11-09 · 通知界面与角标',body,kind:'update',read:false,time:'2026-11-09T10:00:00+08:00'});
  assert.equal((html.match(/notif-update-item/g)||[]).length,3,html);
  assert.equal(/notif-update-head/.test(html),false,'标题已含日期时不再重复日期头');
  assert.match(html,/notif-update-group/);
  assert.match(html,/3 条要点/);
  assert.equal((html.match(/notif-preview md/g)||[]).length,1,'预览只应渲染一次');
  assert.ok(html.includes('网页已更新 · 2026-11-09 · 通知界面与角标'),'通知标题必须保留分隔符两侧空格，不能被行内公式渲染吞掉');
});
test('one-click read marks every notification read and template no longer clears them',()=>{
  const tpl=read('src/index.template.html');
  assert.match(tpl,/data-act="notif-mark-all-read"/);
  assert.match(tpl,/一键已读/);
  assert.equal(tpl.includes('notif-clear'),false);
  const r=runtime();r.run('55-notifications.js');
  r.ctx.state.notifications=[{id:'n1',title:'一',body:'正文',kind:'tip',read:false},{id:'n2',title:'二',body:'正文',kind:'tip',read:false},{id:'n3',title:'三',body:'正文',kind:'tip',read:true}];
  r.ctx.markDirty=()=>{};let rendered=0;r.ctx.renderNotifications=()=>{rendered++;};
  r.ctx.notifMarkAllRead();
  assert.equal(JSON.stringify(r.ctx.state.notifications.map(n=>n.read)),JSON.stringify([true,true,true]));
  assert.equal(r.ctx.notifUnreadCount(),0);
  assert.equal(rendered,1);
});
test('home notification badge stays anchored to its button on narrow screens',()=>{
  const css=read('src/styles.css');
  assert.match(css,/\.home-icon-group \.notif-trigger \{ position: relative; \}/);
  assert.equal(/\.home-icon-group \.icon-btn,[\s\S]{0,60}position: static/.test(css),false);
  assert.match(css,/@media \(max-width: 1024px\)[\s\S]*\.home-icon-group \.notif-trigger \{ position: relative; \}/);
});

test('standard bank chapter confirmation opens the ready page without an extra rules modal',()=>{
  const r=runtime(); r.run('59-exam.js');
  r.ctx.ui.finalExamChapterMode='standard';
  r.ctx.finalAiChapterSel=['第一章 多项式'];
  r.ctx.finalSubject=()=> 'gaodai';
  r.ctx.document={querySelectorAll(){return [{value:'第一章 多项式',checked:true}];}};
  let rules=0, prepared=0;
  r.ctx.finalExamShowRules=()=>{rules++;};
  r.ctx.finalStartExamNow=()=>{prepared++;};
  r.ctx.finalExamChapterConfirm();
  assert.equal(rules,0,'标准题库选完章节后不得先弹考生守则');
  assert.equal(prepared,1,'标准题库选完章节后应直接进入题目已准备页');
});

test('standard exam rules describe standard grading instead of AI grading',()=>{
  const r=runtime(); r.run('59-exam.js');
  r.ctx.ui.finalAiPendingSource='standard';
  const html=r.ctx.finalExamRulesHtml();
  assert.match(html,/标准题库/);
  assert.equal(html.includes('本次考试为AI智能批改'),false,'标准题库考试不得声称 AI 智能批改');
  assert.equal(html.includes('本次考试使用标准题库与本地标准答案批改'),true);
});


test('long task dock exposes real value text, failure state and removal',()=>{
  const {parseHTML}=require('linkedom');
  const {document}=parseHTML('<!doctype html><html><body></body></html>');
  const r=runtime(); r.ctx.document=document;
  r.ctx.setInterval=setInterval; r.ctx.clearInterval=clearInterval; r.ctx.setTimeout=setTimeout; r.ctx.clearTimeout=clearTimeout;
  vm.runInContext(read('src/js/43-ai-progress.js'), r.ctx);
  r.ctx.longTaskStart('i18n-backup', {
    steps:['收集条目','分批翻译','写入缓存'], label:'翻译进度', step:0, percent:0,
    valueText:'0 / 24', stage:'正在准备翻译…', detail:'共 24 条待翻译。'
  });
  const card=document.getElementById('longTask-i18n-backup');
  assert.ok(card,'长任务必须创建独立进度卡');
  assert.equal(document.querySelector('[data-progress-value]').textContent,'0 / 24 · 0%');
  assert.equal(document.querySelector('[data-progress-track]').getAttribute('aria-valuenow'),'0');
  r.ctx.longTaskUpdate('i18n-backup',{step:1,percent:50,valueText:'12 / 24',stage:'正在分批翻译…'});
  assert.equal(document.querySelector('[data-progress-value]').textContent,'12 / 24 · 50%');
  assert.equal(document.querySelector('[data-progress-fill]').style.width,'50%');
  r.ctx.longTaskFail('i18n-backup','网络中断，未完成条目保留原文。');
  assert.ok(card.classList.contains('is-error'));
  assert.equal(card.querySelector('[data-progress-track]').hasAttribute('aria-valuenow'),false);
  assert.match(card.textContent,/关闭/);
  r.ctx.longTaskRemove('i18n-backup');
  assert.equal(document.getElementById('longTask-i18n-backup'),null);
});

test('long task started from an open dialog stays in the dialog top layer',()=>{
  const {parseHTML}=require('linkedom');
  const {document}=parseHTML('<!doctype html><html><body><dialog id="scan" open></dialog></body></html>');
  const r=runtime(); r.ctx.document=document;
  r.ctx.setInterval=setInterval; r.ctx.clearInterval=clearInterval; r.ctx.setTimeout=setTimeout; r.ctx.clearTimeout=clearTimeout;
  vm.runInContext(read('src/js/43-ai-progress.js'), r.ctx);
  r.ctx.longTaskStart('notes-ocr', {label:'文字识别', steps:['准备图片','识别文字','写入结果'], step:0, stage:'正在准备图片…'});
  const dialog=document.querySelector('dialog');
  const dock=dialog.querySelector('#longTaskDockDialog');
  assert.ok(dock,'弹窗内发起的任务必须使用弹窗内的进度卡容器，否则会被 top layer 遮住');
  assert.equal(dialog.querySelector('#longTask-notes-ocr').parentNode,dock);
  r.ctx.longTaskRemove('notes-ocr');
  assert.equal(document.getElementById('longTaskDockDialog'),null);
});

test('every long loading flow reports real counts or stages and stays cancellable',()=>{
  const notes=read('src/js/49-notes.js');
  const i18n=read('src/js/52-i18n.js');
  const kb=read('src/js/57-knowledge-search.js');
  const auto=read('src/js/47-auto-ai.js');
  const css=read('src/styles.css');
  assert.match(notes,/noteBusyProgress\(i - 1, count/,'PDF 导入必须按真实页数推进');
  assert.match(notes,/noteBusyProgress\(i, files.length/,'多文件导入必须按真实文件数推进');
  assert.match(notes,/noteBusyProgress\(i, units.length/,'导出必须按真实页数推进');
  assert.match(notes,/noteBusyProgress\(si, scanItems.length/,'扫描保存必须按真实页数推进');
  assert.match(notes,/async function noteScanSave/);
  assert.match(notes,/async function noteImportPdf/);
  assert.ok(notes.includes('noteBusyElapsedText'),'长任务必须显示真实等待时长');
  assert.match(notes,/id="noteBusyTrack"[^>]*role="progressbar"/,'笔记进度必须有 progressbar 语义');
  assert.match(notes,/var ocrKey = 'notes-ocr'/);
  assert.match(notes,/longTaskStart\(ocrKey/,'扫描 OCR 必须显示长任务进度');
  assert.match(notes,/ocrController\.abort\(\)/,'扫描 OCR 必须可取消');
  assert.match(notes,/signal: ocrController \? ocrController\.signal : undefined/,'扫描 OCR 服务端请求必须携带取消信号');
  assert.match(i18n,/longTaskStart\('i18n-backup'/,'翻译必须显示长任务进度');
  assert.match(i18n,/done \/ missing\.length/,'翻译百分比必须来自真实完成条数');
  assert.match(kb,/longTaskStart\('kb-ai'/,'知识点 AI 补充必须显示进度');
  assert.match(auto,/longTaskStart\('auto-ai'/,'自动补全必须显示进度');
  assert.match(auto,/onCancel: function \(\) \{ autoAiCancel/,'自动补全必须可取消');
  assert.match(css,/\.long-task-dock\s*\{[^}]*position:\s*fixed/);
  assert.match(css,/@media \(max-width: 1024px\)[\s\S]{0,300}\.long-task-dock[\s\S]{0,160}bottom:/,'手机/平板进度卡不能压住底部操作');
  assert.match(css,/\.note-busy-track/,'笔记进度条必须有稳定布局');
  assert.match(css,/prefers-reduced-motion:[\s\S]{0,180}\.note-busy/,'笔记进度必须尊重减少动态效果');
  assert.match(css,/prefers-reduced-motion:[\s\S]{0,180}\.long-task/,'后台进度必须尊重减少动态效果');
});

test('filters can be cleared from every toolbar and bank source can be filtered',()=>{
  const r=runtime();
  r.run('10-markdown.js');
  assert.equal(r.ctx.bankOriginKey({examOrigin:'教材课后习题'}),'textbook');
  assert.equal(r.ctx.bankOriginKey({examOrigin:'习题集'}),'exercise');
  assert.equal(r.ctx.bankOriginKey({examOrigin:'考研原创同型题'}),'exam');
  assert.equal(r.ctx.bankOriginKey({}),'exam');
  r.ctx.ui.bankFilters.gaodai={chapter:'all',category:'all',type:'all',template:'all',diff:'all'};
  assert.equal(r.ctx.bankFilterFor('gaodai').origin,'all','旧本地状态缺少来源字段时必须补成全部来源');
  assert.equal(r.ctx.bankFiltersActive(r.ctx.bankFilterFor('gaodai')),false);
  r.ctx.bankFilterFor('gaodai').origin='textbook';
  assert.equal(r.ctx.bankFiltersActive(r.ctx.bankFilterFor('gaodai')),true);
  assert.equal(r.ctx.templateFilterFor('gaodai').chapter,'all');
  assert.equal(r.ctx.templateFiltersActive(r.ctx.templateFilterFor('gaodai')),false);
  r.ctx.templateFilterFor('gaodai').chapter='第二章 行列式';
  assert.equal(r.ctx.templateFiltersActive(r.ctx.templateFilterFor('gaodai')),true);

  const entries=read('src/js/20-entries.js');
  const library=read('src/js/30-library.js');
  const init=read('src/js/90-init.js');
  assert.match(entries,/data-act="clear-entry-filters"[^>]*>清空筛选/);
  assert.equal((entries.match(/data-act="clear-entry-filters"/g)||[]).length,1,'错题清空按钮只能有一个，避免工具栏和下方重复');
  assert.match(library,/data-act="clear-bank-filters"[^>]*>清空筛选/);
  assert.match(library,/data-act="bank-origin"/);
  assert.match(library,/bankOriginBtn\('exam', '考研同型'\)/);
  assert.match(library,/bankOriginBtn\('textbook', '教材课后'\)/);
  assert.match(library,/bankOriginBtn\('exercise', '习题集'\)/);
  assert.match(library,/bankOriginKey/);
  assert.match(library,/data-template-filter="chapter"/);
  assert.match(library,/data-act="clear-template-filters"[^>]*>清空筛选/);
  assert.match(init,/case 'clear-bank-filters'/);
  assert.match(init,/case 'clear-template-filters'/);
  assert.match(init,/case 'bank-origin'/);
  assert.match(init,/[\[\]]data-template-filter[\[\]]/);
  assert.match(read('src/styles.css'),/\.filter-clear\s*\{[^}]*white-space:\s*nowrap/);
  assert.match(read('src/styles.css'),/@media \(max-width: 1260px\)[\s\S]{0,300}\.entry-filters \.filter-clear/);
});

test('notification signature covers notify items and final page avoids duplicate summaries',()=>{
  const r=runtime();r.run('55-notifications.js');
  const base={date:'2026-11-10',title:'测试',summary:'摘要',items:[{group:'A',text:'正文'}],notifyItems:[{group:'A',text:'通知一'}]};
  const edited={date:'2026-11-10',title:'测试',summary:'摘要',items:[{group:'A',text:'正文'}],notifyItems:[{group:'A',text:'通知二'}]};
  assert.notEqual(r.ctx.notifUpdateSignature(base),r.ctx.notifUpdateSignature(edited),'同一天只改通知要点文字也必须触发新签名');
  const js=read('src/js/55-notifications.js');
  assert.match(js,/state\.notifNotifyItems = \(latest\.notifyItems \|\| \[\]\)/,'通知快照必须在发送成功后保存');
  assert.match(js,/function notifClock\(date\)/,'补充通知的时间要按本机时区显示');
  assert.equal(/String\(nowIso\(\)\)\.slice\(11, 19\)/.test(js),false,'补充通知标题不能直接截 UTC 时间');
  assert.match(js,/updateTitle \+= ' · 补充 ' \+ notifClock\(\)/,'补充通知标题必须用本地时分秒');
  const finalJs=read('src/js/58-final.js');
  assert.equal(/final-head-facts/.test(finalJs),false,'期末首屏不能重复展示日期、时长和材料数');
  assert.equal(/final-empty-actions/.test(finalJs),false,'复习材料空态不能重复期末页顶部入口');
  assert.match(finalJs,/final-countdown is-empty/,'未设定日期时不能留下孤立的破折号');
  assert.match(finalJs,/页面顶部的「挑错题 \/ 挑题库题」/,'空态指引必须与手机端顶部入口一致');
  assert.equal(/页面右上方/.test(finalJs),false,'不能再用桌面端的右上方向指引手机用户');
  assert.match(read('src/styles.css'),/@media \(max-width: 900px\)[\s\S]{0,200}\.topbar \{ position: static; \}/,'手机与平板顶栏不再吸顶遮挡内容');
});


test('home restores warm 2ea palette, daily greeting and welcome dialog',()=>{
  const css=read('src/styles.css');
  const tpl=read('src/index.template.html');
  const shell=read('src/js/15-shell.js');
  assert.match(css,/--paper:\s*#f4f1e9/,'首页必须回到暖米色纸面');
  assert.match(css,/--accent:\s*#b23a26/,'强调色必须回到砖红');
  assert.equal(/--paper:\s*#f2f2ed/.test(css),false,'不能重新引入冷纸色');
  assert.equal(/--accent:\s*#2f5d54/.test(css),false,'不能重新引入深墨绿强调色');
  assert.match(tpl,/id="homeGreeting"/,'首页必须有问候标题');
  assert.match(tpl,/id="homeWelcome"/,'首页必须有每日问候副标题');
  assert.match(tpl,/id="homeWelcomeNote"/,'首页必须有问候提示');
  assert.match(tpl,/id="homeSubjectsTitle"/,'科目入口标题必须可随时段更新');
  assert.match(shell,/function homeWelcome\(hour\)/,'问候必须随小时变化');
  assert.match(shell,/明天想从哪一科继续/, '深夜问候必须把科目标题改成明天继续');
  assert.match(shell,/state\.prefs\.userName/,'问候必须带上用户称呼');
  assert.match(tpl,/class="dlg-api-welcome"/,'欢迎弹窗必须保留原有结构');
  assert.match(tpl,/apiwelcome-mark/,'欢迎弹窗必须保留原有图标');
  assert.match(tpl,/apiwelcome-list/,'欢迎弹窗必须保留原有卡片');
});

test('mobile and tablet controls meet touch target and helper text sizes',()=>{
  const css=read('src/styles.css');
  assert.match(css,/@media \(max-width: 420px\)[\s\S]{0,180}\.icon-btn,[\s\S]{0,80}\.home-icon-group \.icon-btn \{[\s\S]{0,80}width: 40px;[\s\S]{0,40}height: 40px;/, '手机顶栏与页脚图标必须至少 40px');
  assert.match(css,/\.filter-clear \{[\s\S]{0,80}min-height: 36px;/, '清空筛选必须有可点高度');
  assert.match(css,/\.final-subject-tab \{[\s\S]{0,100}min-height: 36px;/, '期末科目按钮必须有可点高度');
  assert.match(css,/\.tpl-body \.linkish \{[\s\S]{0,120}min-height: 36px;/, '模板复制按钮必须有可点高度');
  assert.match(css,/\.brand-sub,[\s\S]{0,60}\.home-brand-sub \{ font-size: 10.5px; \}/, '品牌副标题不能低于 10.5px');
});

test('escaped dollar formulas render as math on entry, bank, exam and knowledge surfaces',()=>{
  const {parseHTML}=require('linkedom');
  const {document}=parseHTML('<!doctype html><html><body></body></html>');
  const r=runtime();r.ctx.document=document;r.ctx.window.marked=r.ctx.marked=require('../src/vendor/marked.umd.js');
  vm.runInContext(read('src/vendor/temml.min.js'),r.ctx);r.ctx.window.temml=r.ctx.temml;r.run('10-markdown.js');
  const bs='\\', d=bs+'$', lim=bs+'lim_{n'+bs+'to'+bs+'infty}';
  const proof='设 '+d+' '+lim+'{f(r_n)}='+lim+'{r_n}=x_0,'+bs+'qquad'+d+' '+d+lim+'{f(s_n)}='+lim+'{(-s_n)}=-x_0.'+d+' 故极限不存在。';
  const cases='定义 F(x)='+bs+'begin{cases} f(a+0), & x=a, '+bs+bs+' f(x), & a<x<b, '+bs+d+' f(b-0), & x=b. '+bs+'end{cases} 由连续性得证。';
  for(const src of [proof,cases]) {
    const e=document.createElement('div');e.innerHTML=r.ctx.renderMarkdown(src);
    assert.equal(e.querySelectorAll('.math-raw').length,0,e.innerHTML);
    assert.ok(e.querySelectorAll('math').length>0,e.innerHTML);
    assert.equal(e.textContent.includes(bs+'lim'),false,e.innerHTML);
    assert.equal(e.textContent.includes(bs+'qquad'),false,e.innerHTML);
    assert.equal(e.textContent.includes(d),false,e.innerHTML);
  }
  const money=document.createElement('div');
  money.innerHTML=r.ctx.renderMarkdown('价格是 '+d+'5 与 '+d+'7，公式 '+d+'x^2+1'+d+'。');
  assert.equal(money.querySelectorAll('.math-raw').length,0,money.innerHTML);
  assert.equal(money.querySelectorAll('math').length,1,money.innerHTML);
  assert.ok(money.textContent.includes('$5')&&money.textContent.includes('$7'),money.innerHTML);
  const english=document.createElement('div');
  english.innerHTML=r.ctx.renderMarkdown('单侧导数（one-sided derivative）：'+d+'f\'_+(x_0)'+d+'，讨论端点。');
  assert.equal(english.querySelectorAll('.math-raw').length,0,english.innerHTML);
  assert.equal(english.querySelectorAll('math').length,1,english.innerHTML);
  assert.ok(english.textContent.includes('one-sided derivative'),english.innerHTML);
  const css=read('src/styles.css');
  assert.match(css,/2026-11-11: 三端行内公式统一基线[\s\S]{0,1200}\.math-inline-scroll:not\(\.is-wide\)[\s\S]{0,260}vertical-align: baseline !important/,'普通行内公式必须与正文共用 baseline');
  assert.match(css,/\.math-inline-scroll\.is-wide[\s\S]{0,220}display: inline-block !important[\s\S]{0,220}overflow-x: auto !important/,'超宽公式才允许横向滚动');
  assert.match(css,/\.math-inline-scroll\.is-wide[\s\S]{0,260}vertical-align: baseline !important/,'滚动容器不能把公式抬离基线');
});

test('matrix stems name the matrix and read as complete sentences',()=>{
  const items=JSON.parse(read('src/data/bank-algebra.json')).items;
  for(const q of items){
    assert.doesNotMatch(q.question,/设\$\\begin\{pmatrix\}/,q.id);
    assert.doesNotMatch(q.question,/其中\$\\begin\{pmatrix\}/,q.id);
    assert.doesNotMatch(q.question,/\$。\$[^$]+\$的结果是/,q.id);
  }
  for(const id of ['GA-B0157','GA-B0158','GA-B0307']){
    const q=items.find(x=>x.id===id);assert.ok(q,id);
    assert.match(q.question,/(设|其中系数矩阵)\$A=/,id);
    assert.doesNotMatch(q.question,/\$。\s/,id);
  }
});
test('bank totals include reviewed textbook and question-bank additions',()=>{
  const files={algebra:'bank-algebra',analysis:'bank-analysis',geometry:'bank-geometry',western:'bank-western'};
  const totals={};
  for(const [k,f] of Object.entries(files)){const d=JSON.parse(read('src/data/'+f+'.json'));totals[k]=d.items.length;}
  assert.deepEqual(totals,{algebra:1559,analysis:3522,geometry:1199,western:2883});
  for(const f of ['bank-algebra','bank-analysis']){
    const d=JSON.parse(read('src/data/'+f+'.json'));
    for(const q of d.items.filter(x=>['GA-TX048','GA-TX049','GA-TX050','MA-TX070','MA-TX071','MA-TX072'].includes(x.id))){
      assert.equal(q.examOrigin,'教材课后习题',q.id);
      assert.equal(q.category,'计算题',q.id);
    }
  }
});

test('every chapter exposes a section list and items map into it',()=>{
  const r=runtime(); const SECTIONS=r.ctx.CHAPTER_SECTIONS;
  assert.deepEqual(Object.fromEntries(Object.entries(SECTIONS).map(([k,v])=>[k,Object.keys(v).length])),{gaodai:10,shufen:23,jieji:6,xijing:16});
  const banks={gaodai:'bank-algebra',shufen:'bank-analysis',jieji:'bank-geometry',xijing:'bank-western'};
  for(const [sid,f] of Object.entries(banks)){
    const d=JSON.parse(read('src/data/'+f+'.json'));
    const chapters=[...new Set(d.items.map(x=>x.chapter))];
    assert.equal(chapters.length,Object.keys(SECTIONS[sid]).length,sid+' chapter count');
    for(const ch of chapters){
      const sections=SECTIONS[sid][ch];
      assert.ok(Array.isArray(sections)&&sections.length>=2,sid+' '+ch);
      for(const item of d.items.filter(x=>x.chapter===ch)){
        const sec=r.ctx.sectionForItem(sid,item);
        assert.ok(sections.includes(sec)||sec==='综合与其他',sid+' '+ch+' '+item.id+' -> '+sec);
      }
    }
    const firstChapter=chapters[0];
    const copy=r.ctx.chapterSectionsFor(sid,firstChapter);
    assert.notEqual(copy,SECTIONS[sid][firstChapter],'returns a copy');
    copy.pop();
    assert.equal(r.ctx.chapterSectionsFor(sid,firstChapter).length,SECTIONS[sid][firstChapter].length,'catalog stays intact');
  }
  assert.equal(r.ctx.sectionForItem('gaodai',{chapter:'第二章 行列式',title:'排列的奇偶性',question:'求排列的逆序数'}),'排列');
  assert.equal(r.ctx.sectionForItem('gaodai',{chapter:'第二章 行列式',title:'克拉默法则',question:'用克拉默法则解方程组'}),'克拉默法则');
});
test('entries, bank, template, exam and final chapter filters cascade into sections',()=>{
  const entries=read('src/js/20-entries.js');
  assert.match(entries,/data-filter="section"/);
  assert.match(entries,/sectionOptions/);
  assert.match(read('src/js/10-markdown.js'),/sectionForItem\(subjectId, e\)/);
  const bank=read('src/js/30-library.js');
  assert.match(bank,/data-bank-filter="section"/);
  assert.match(bank,/data-template-filter="section"/);
  assert.match(bank,/f\.chapter !== 'all'/);
  assert.match(bank,/templateSectionOf/);
  const exam=read('src/js/59-exam.js');
  assert.match(exam,/data-final-ai-section/);
  assert.match(exam,/finalExamChapterSections/);
  assert.match(exam,/exam-section-grid/);
  const fin=read('src/js/58-final.js');
  assert.match(fin,/finalSelectedSections/);
  assert.match(fin,/data-act="final-section"/);
  assert.match(fin,/finalMaterialsForChapters/);
  assert.ok(!read('src/js/30-library.js').includes("chapter !== 'all' && f.section"));
});
test('README puts source details after technical notes and before feedback, with current counts',()=>{
  const md=read('README.md');
  const at=['## 技术说明','## 源码、构建与开源','## 反馈'].map(h=>md.indexOf(h));
  assert.ok(at[0]>=0&&at[0]<at[1]&&at[1]<at[2],'README section order');
  assert.ok(md.includes('590 道教材课后'),'教材课后 current count');
  assert.ok(md.includes('223 道习题集'),'习题集 current count');
  assert.ok(md.includes('9163'),'bank total');
  assert.ok(md.includes('80 项回归测试'),'current test count');
  assert.ok(!md.includes('67 项回归测试')&&!md.includes('66 项回归测试'),'stale test count');
  assert.ok(md.includes('v2026.11.14 Release'),'current release link');
  assert.ok(md.includes('2026.11.14--2112c385'),'current build badge');
  assert.ok(!md.slice(0,3000).includes('20261110-home.png'),'首页截图必须用当前版本');
});
test('navigation, link actions and dialog close buttons keep 34px/40px touch targets',()=>{
  const css=read('src/styles.css');
  assert.match(css,/\.cross-tabs \.tab-cross\s*\{[^}]*min-height:\s*34px/,'tab-cross 34px');
  assert.match(css,/\.linkish-action\s*\{[^}]*min-height:\s*34px/,'linkish action 34px');
  assert.match(css,/\.dlg-head \.icon-btn,[\s\S]{0,120}\.notif-close\s*\{[^}]*width:\s*34px/,'dialog close 34px');
  assert.match(css,/@media \(max-width: 900px\)[\s\S]{0,500}\.cross-tabs \.tab-cross\s*\{[^}]*min-height:\s*38px/,'tablet tab-cross 38px');
  assert.match(css,/\.pages-banner-badge,[\s\S]{0,160}font-size:\s*10px/,'decorative labels 10px');
});

test('chapter picker labels stay plain text and option labels hang cleanly',()=>{
  const chapters=read('src/js/00-chapters.js');
  assert.equal((chapters.match(/"\$[^"]*"/g)||[]).length,0,'章/小节选择是纯文本渲染，不能在名称里写 $...$ 公式');
  assert.match(chapters,/"n 级行列式"/,'行列式小节应用纯文本 n');
  assert.match(chapters,/"对偶空间 V\*、/,'对偶空间小节应用纯文本 V*');
  const exam=read('src/js/59-exam.js'), lib=read('src/js/30-library.js');
  assert.match(exam,/exam-result-key/,'模拟考结果选项需要独立字母标签');
  assert.match(exam,/exam-result-text/,'模拟考结果选项正文需要独立容器');
  assert.match(lib,/bank-option-key/,'题库选项需要独立字母标签');
  assert.match(lib,/bank-option-text/,'题库选项正文需要独立容器');
});

test('exam chapter picker uses one-column accordion with in-place counts and no rerender',()=>{
  const exam=read('src/js/59-exam.js'), css=read('src/styles.css');
  for (const cls of ['exam-chapter-head','exam-chapter-stat','exam-chapter-tools','exam-chapter-list','exam-chapter-block','exam-chapter-expand','exam-chapter-chev','exam-section-block','exam-section-grid','exam-check-sm']) {
    assert.match(exam,new RegExp(cls),'章节选择新结构缺少 '+cls);
  }
  assert.match(exam,/data-final-chapter-count/,'需要实时章节计数');
  assert.match(exam,/data-final-section-count/,'需要实时小节计数');
  assert.match(exam,/final-ai-chapter-toggle/,'需要章节展开按钮');
  assert.match(exam,/aria-controls="' \+ secId/,'展开按钮需要 aria-controls');
  assert.match(exam,/finalExamChapterSync()/,'章节变化应原地同步计数');
  const chapterHandler=(exam.match(/hasAttribute\('data-final-ai-chapter'\)\)[\s\S]{0,2200}?hasAttribute\('data-final-ai-section'\)/)||[''])[0];
  assert.ok(chapterHandler,'找不到章节复选框处理逻辑');
  assert.ok(!/render\(\)/.test(chapterHandler),'勾选章节不应整页 render，避免滚动回顶');
  assert.match(exam,/finalExamChapterSetSections/,'单章小节全选/清空需要原地处理');
  assert.match(css,/\.exam-chapter-card\s*\{[^}]*display:\s*flex/,'章节弹窗需要 flex 纵向布局');
  assert.match(css,/\.exam-chapter-body\s*\{[^}]*overflow-y:\s*auto/,'章节弹窗主体应独立滚动');
  assert.match(css,/\.exam-section-grid\s*\{[^}]*grid-template-columns:\s*repeat\(auto-fill/,'小节应使用自适应网格而非胶囊堆叠');
  assert.ok(!/\.exam-chapter-grid\s*\{/.test(css),'旧双列章节网格样式应删除');
});

test('Warm Academic tokens, home rhythm and exam answer card stay wired',()=>{
  const css=read('src/styles.css'), shell=read('src/js/15-shell.js'), exam=read('src/js/59-exam.js');
  for(const t of ['--color-bg: #F6F4EE','--color-surface: #FFFFFF','--color-text: #302C28','--color-border: #E8E3DA','--color-primary: #C8754D','--color-success: #64866C','--offpeak-sage: #B7C1AF']){
    assert.ok(css.includes(t),'缺少设计 token '+t);
  }
  assert.match(css,/\.ai-defer-track\s*\{[^}]*var\(--offpeak-sage\)/,'谷时进度条必须使用参考图的灰绿色');
  assert.ok(shell.includes('homeStudyRhythm'),'首页学习工作台需要连续学习与近 7 天节奏');
  assert.match(shell,/hw-trend-day/,'首页趋势需要 7 天柱状节拍');
  assert.match(shell,/data-act="ai-open"/,'首页工作台需要 AI 智能录入入口');
  assert.match(css,/\.hw-bottom\s*\{[^}]*grid-template-columns:\s*minmax/,'首页工作台必须使用自适应三栏网格');
  assert.match(exam,/exam-cardnav/,'模拟考需要答题卡');
  assert.match(exam,/data-act="exam-jump"/,'答题卡题号必须可跳转');
  assert.match(css,/\.exam-cardnav-item\s*\{[^}]*min-height:\s*34px/,'答题卡按钮触控高度至少 34px');
  assert.ok(!/background:\s*#000000?\b/.test(css),'深色模式不能用纯黑背景');
});
test('stats centre uses real data and an editorial empty state',()=>{
  const stats=read('src/js/16-stats.js'), core=read('src/js/00-core.js'), shell=read('src/js/15-shell.js'), css=read('src/styles.css');
  for(const fn of ['statsAllEntries','statsActivitySeries','statsSubjectRows','statsTotals','statsErrorTotals','statsChapterRows','statsExamRows','viewStats']) assert.ok(stats.includes('function '+fn),'统计中心缺少 '+fn);
  assert.ok(core.includes("id: 'stats'"),'视图列表必须包含统计页');
  assert.ok(shell.includes("view === 'stats'")&&shell.includes('viewStats(subj)'),'统计页必须接入主视图渲染');
  assert.match(stats,/stats-chart-empty/,'学习记录为空时必须使用空态而不是拉高空白图表');
  assert.match(stats,/examHistory/,'模拟考成绩必须读取真实已交卷记录');
  assert.match(stats,/reviewAt/,'复习次数必须读取真实复习打卡');
  assert.ok(!/9163|1559|3522/.test(stats),'统计页不能写死题库数字');
  assert.match(css,/\.stats-metrics\s*\{[^}]*grid-template-columns/,'统计指标需要自适应网格');
  assert.match(css,/\.stats-chart-empty\s*\{[^}]*grid-template-columns/,'空态图表需要单独排版');
  assert.match(css,/\.stats-layout\s*\{[^}]*display:\s*grid/,'统计面板需要网格布局');
});

test('inline fractions keep text baseline and option labels hang without splitting',()=>{
  const {parseHTML}=require('linkedom');
  const {document}=parseHTML('<!doctype html><html><body></body></html>');
  const r=runtime();r.ctx.document=document;r.ctx.window.marked=r.ctx.marked=require('../src/vendor/marked.umd.js');
  vm.runInContext(read('src/vendor/temml.min.js'),r.ctx);r.ctx.window.temml=r.ctx.temml;r.run('10-markdown.js');
  assert.equal(r.ctx.compactInlineMath('\\dfrac{dy}{dx}'),'\\frac{dy}{dx}','行内分式必须降为 frac，避免撑高整行');
  assert.equal(r.ctx.compactInlineMath('\\displaystyle \\sum_{i=1}^n a_i'),' \\sum_{i=1}^n a_i','行内公式不应强制 displaystyle');
  const options=r.ctx.formatOptionParagraphs('<p>A．<span>x</span></p><p>B. y</p>');
  assert.match(options,/class="md-option"/,'选项段落需要独立排版容器');
  assert.match(options,/class="md-option-key">A．<\/b>/,'选项字母需要独立标签');
  assert.match(options,/class="md-option-text"/,'选项正文需要独立容器');
  const math=r.ctx.renderMarkdown('导数定义：$\\dfrac{dy}{dx}$，也是微商。');
  assert.match(math,/math-tail/,'公式与紧跟的中文标点必须绑定，不能把标点甩到下一行');
  assert.equal(math.includes('displaystyle="true"'),false,math);
  assert.equal(math.includes('\\dfrac'),false,math);
  const multi=document.createElement('div');
  multi.innerHTML=r.ctx.renderMarkdown('错题题干的 $A．/B．$ 选项改为 flex，公式 $min-width:0$，长题干自然换行。');
  const tails=[...multi.querySelectorAll('.math-tail')];
  assert.ok(tails.length>0,multi.innerHTML);
  for(const t of tails){
    assert.equal(t.querySelectorAll('math').length,1,'math-tail 只能包一个紧邻公式，不能吞掉整段文字');
    assert.equal(t.textContent.includes('选项改为'),false,'math-tail 不能跨过正文吞掉后续公式');
  }
  const cssTokens=document.createElement('div');
  cssTokens.innerHTML=r.ctx.renderMarkdown('普通 .math-inline-scroll 为 inline，只有 .is-wide 才横向滚动；补 min-width:0 与 text-wrap:pretty。');
  assert.equal(cssTokens.querySelectorAll('math').length,0,'CSS 类名和声明不能被自动包成公式');
  assert.equal(cssTokens.textContent.includes('.math-inline-scroll'),true,cssTokens.innerHTML);
  assert.equal(cssTokens.textContent.includes('min-width:0'),true,cssTokens.innerHTML);
  const bareCmd=document.createElement('div');
  bareCmd.innerHTML=r.ctx.renderMarkdown('命令 \\frac 缺少参数时不能单独变成公式。');
  assert.equal(bareCmd.querySelectorAll('math').length,0,'单独 LaTeX 命令不能被当成完整公式');
  assert.equal(bareCmd.textContent.includes('\\frac'),true,bareCmd.innerHTML);
  const css=read('src/styles.css');
  assert.match(css,/\.math-tail\s*\{[^}]*display:\s*inline-block/,'公式尾串必须原子化');
  assert.match(css,/\.math-inline-scroll:not\(\.is-wide\)\s*\{[^}]*display:\s*inline !important/,'普通行内公式不能变成整块');
  assert.match(css,/\.md-option\s*\{[^}]*display:\s*flex/,'错题选项需要 flex 悬挂字母');
  assert.match(css,/\.exam-opt-text\s*\{[^}]*flex:\s*1 1 auto/,'模拟考选项正文必须占满剩余宽度');
});


test('western exercise math is typeset instead of flattened plain text',()=>{
  const {parseHTML}=require('linkedom');
  const {document}=parseHTML('<!doctype html><html><body></body></html>');
  const r=runtime();r.ctx.document=document;r.ctx.window.marked=r.ctx.marked=require('../src/vendor/marked.umd.js');
  vm.runInContext(read('src/vendor/temml.min.js'),r.ctx);r.ctx.window.temml=r.ctx.temml;r.run('10-markdown.js');
  const bank=JSON.parse(read('src/data/bank-western.json'));
  const q=bank.items.find(x=>x.id==='WE-9116');
  assert.match(q.question,/\$U\(x,y\)=\\ln\(x\^\{0\.5\}\+y\)\$/,'效用函数必须使用 LaTeX 指数');
  assert.match(q.options[0].text,/\\dfrac\{1\}\{2x\^\{0\.5\}\}/,'无差异曲线斜率必须使用 LaTeX 分式');
  const box=document.createElement('div');
  box.innerHTML=r.ctx.renderMarkdown(q.question);
  assert.ok(box.querySelectorAll('math').length>0,'题干公式必须被 Temml 渲染');
  for(const m of box.querySelectorAll('math')) m.remove();
  assert.equal(box.textContent.includes('x0.5'),false,'渲染后不能残留拍平的 x0.5');
  const options=document.createElement('div');
  options.innerHTML=q.options.map(o=>r.ctx.renderMarkdown(o.text)).join('');
  assert.equal(options.textContent.includes('－'),false,'选项不能残留全角负号');
  const q7=bank.items.find(x=>x.id==='WE-9117');
  assert.match(q7.question,/\\min\\\{3x_1,x_2\\\}/,'min 型效用函数必须使用 LaTeX 下标');
  for(const item of bank.items.filter(x=>/^WE-9[1-3]\\d\\d$/.test(x.id))) {
    for(const field of [item.question].concat((item.options||[]).map(o=>o.text||''))) {
      const outside=String(field||'').replace(/\$\$[\s\S]*?\$\$/g,'').replace(/\$[^$]*\$/g,'');
      assert.ok(!/[＝]|[A-Za-z]0\.5(?![0-9])|k1\/2/.test(outside),item.id+' 仍有拍平公式：'+outside.slice(0,60));
    }
  }
});


test('dark theme overrides the new color tokens, not only the paper aliases',()=>{
  const css=read('src/styles.css');
  assert.match(css,/html\[data-theme="dark"\]\s*\{[^}]*--color-bg:\s*#1D1B18/s,'深色主题必须覆盖新画布 token');
  assert.match(css,/html\[data-theme="dark"\]\s*\{[^}]*--color-surface:\s*#26231F/s,'深色主题必须覆盖新面板 token');
  assert.match(css,/html\[data-theme="dark"\]\s*\{[^}]*--color-text:\s*#F2EEE6/s,'深色主题必须覆盖新正文 token');
  assert.match(css,/html\[data-theme="dark"\]\s*\{[^}]*--color-border:\s*#3B362F/s,'深色主题必须覆盖新边框 token');
  assert.match(css,/html\[data-theme="auto"\]\s*\{[^}]*--color-bg:\s*#1D1B18/s,'跟随系统的深色同样要覆盖新画布 token');
});
