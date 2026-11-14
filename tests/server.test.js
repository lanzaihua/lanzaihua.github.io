'use strict';
const {test}=require('node:test');const assert=require('node:assert/strict');
const http=require('node:http');const fs=require('node:fs');const path=require('node:path');const os=require('node:os');const {spawn}=require('node:child_process');
const ROOT=path.join(__dirname,'..');
function isolatePackage(dir){fs.writeFileSync(path.join(dir,'package.json'),'{"type":"commonjs"}');}
async function stopChild(child){if(!child||child.exitCode!==null||child.signalCode!==null)return;const done=new Promise(r=>child.once('exit',r));child.kill();await done;}
function request(port,p,opts) {
  opts=opts||{};
  return new Promise((resolve,reject)=>{
    const req=http.request({hostname:'127.0.0.1',port,path:p,method:opts.method||'GET',headers:opts.headers||{}},res=>{
      let body='';res.on('data',x=>body+=x);res.on('end',()=>resolve({status:res.statusCode,body,headers:res.headers}));
    });
    req.on('error',reject);
    if(opts.body) req.write(opts.body);
    req.end();
  });
}
test('malformed static URL returns 400; sibling traversal returns 403; service stays alive',async()=>{
  const temporary=fs.mkdtempSync(path.join(os.tmpdir(),'notebook-server-test-'));
  fs.copyFileSync(path.join(ROOT,'server.js'),path.join(temporary,'server.js'));
  fs.copyFileSync(path.join(ROOT,'skills.js'),path.join(temporary,'skills.js'));isolatePackage(temporary);
  fs.mkdirSync(path.join(temporary,'dist'));fs.writeFileSync(path.join(temporary,'dist','index.html'),'TEST HOME');
  fs.writeFileSync(path.join(temporary,'dist','manifest.webmanifest'),'{}');
  fs.writeFileSync(path.join(temporary,'dist','app.js'),'window.x=1;');
  fs.writeFileSync(path.join(temporary,'dist','404.html'),'CUSTOM 404');
  fs.mkdirSync(path.join(temporary,'dist-secret'));fs.writeFileSync(path.join(temporary,'dist-secret','private.txt'),'MUST NOT LEAK');
  const reserve=http.createServer();await new Promise(r=>reserve.listen(0,'127.0.0.1',r));const port=reserve.address().port;await new Promise(r=>reserve.close(r));
  const child=spawn(process.execPath,['server.js'],{cwd:temporary,env:{...process.env,PORT:String(port),HOST:'127.0.0.1'},stdio:['ignore','pipe','pipe']});
  try {
    await new Promise((resolve,reject)=>{let logs='';const timer=setTimeout(()=>reject(Error('server startup timeout: '+logs)),5000);child.stdout.on('data',d=>{logs+=d;if(logs.includes('本机:')){clearTimeout(timer);resolve();}});child.on('exit',c=>{clearTimeout(timer);reject(Error('server exited '+c));});});
    assert.equal((await request(port,'/%E0%A4%A')).status,400);
    assert.equal((await request(port,'/..%2fdist-secret/private.txt')).status,403);
    assert.equal((await request(port,'/')).body,'TEST HOME');
    const missing=await request(port,'/missing.js');
    assert.equal(missing.status,404,'missing asset must be 404');
    assert.notEqual(missing.body,'TEST HOME','missing asset must not fall back to home');
    assert.match(missing.headers['x-content-type-options']||'',/nosniff/);
    const manifest=await request(port,'/manifest.webmanifest');
    assert.equal(manifest.status,200);
    assert.match(manifest.headers['content-type']||'',/application\/manifest\+json/);
    const js=await request(port,'/app.js');
    assert.match(js.headers['content-type']||'',/text\/javascript/);
    const health=await request(port,'/api/health');
    assert.equal(health.status,200,'loopback health stays available without token');
  } finally {await stopChild(child);fs.rmSync(temporary,{recursive:true,force:true});}
});

test('non-loopback binding without token requires auth for all API routes',async()=>{
  const temporary=fs.mkdtempSync(path.join(os.tmpdir(),'notebook-server-auth-'));
  fs.copyFileSync(path.join(ROOT,'server.js'),path.join(temporary,'server.js'));
  fs.copyFileSync(path.join(ROOT,'skills.js'),path.join(temporary,'skills.js'));isolatePackage(temporary);
  fs.mkdirSync(path.join(temporary,'dist'));fs.writeFileSync(path.join(temporary,'dist','index.html'),'HOME');
  const reserve=http.createServer();await new Promise(r=>reserve.listen(0,'127.0.0.1',r));const port=reserve.address().port;await new Promise(r=>reserve.close(r));
  const child=spawn(process.execPath,['server.js'],{cwd:temporary,env:{...process.env,PORT:String(port),HOST:'0.0.0.0',NOTEBOOK_TOKEN:''},stdio:['ignore','pipe','pipe']});
  try {
    const token=await new Promise((resolve,reject)=>{let logs='';const timer=setTimeout(()=>reject(Error('server startup timeout: '+logs)),8000);child.stdout.on('data',d=>{logs+=d;const m=logs.match(/本次访问口令: (\S+)/);if(m&&logs.includes('本机:')){clearTimeout(timer);resolve(m[1]);}});child.on('exit',c=>{clearTimeout(timer);reject(Error('server exited '+c));});});
    assert.equal((await request(port,'/api/health')).status,401);
    assert.equal((await request(port,'/api/state')).status,401);
    const ok=await request(port,'/api/health',{headers:{'X-Notebook-Token':token}});
    assert.equal(ok.status,200);
  } finally {await stopChild(child);fs.rmSync(temporary,{recursive:true,force:true});}
});

test('server rejects private AI base URLs before making any upstream request',async()=>{
  let hits=0;
  const target=http.createServer((req,res)=>{hits++;res.end('{}');});
  await new Promise(r=>target.listen(0,'127.0.0.1',r));
  const targetPort=target.address().port;
  const temporary=fs.mkdtempSync(path.join(os.tmpdir(),'notebook-server-ssrf-'));
  fs.copyFileSync(path.join(ROOT,'server.js'),path.join(temporary,'server.js'));
  fs.copyFileSync(path.join(ROOT,'skills.js'),path.join(temporary,'skills.js'));isolatePackage(temporary);
  fs.mkdirSync(path.join(temporary,'dist'));fs.writeFileSync(path.join(temporary,'dist','index.html'),'HOME');
  const reserve=http.createServer();await new Promise(r=>reserve.listen(0,'127.0.0.1',r));const port=reserve.address().port;await new Promise(r=>reserve.close(r));
  const child=spawn(process.execPath,['server.js'],{cwd:temporary,env:{...process.env,PORT:String(port),HOST:'127.0.0.1',NOTEBOOK_TOKEN:'',SOLVE_MAX_PER_HOUR:'60'},stdio:['ignore','pipe','pipe']});
  try {
    await new Promise((resolve,reject)=>{let logs='';const timer=setTimeout(()=>reject(Error('server startup timeout: '+logs)),5000);child.stdout.on('data',d=>{logs+=d;if(logs.includes('本机:')){clearTimeout(timer);resolve();}});child.on('exit',c=>{clearTimeout(timer);reject(Error('server exited '+c));});});
    const payload=JSON.stringify({subject:'gaodai',text:'测试题',aiConfig:{protocol:'openai',baseUrl:'http://127.0.0.1:'+targetPort+'/v1',model:'x',apiKey:'x'}});
    const res=await request(port,'/api/solve',{method:'POST',headers:{'Content-Type':'application/json','Content-Length':Buffer.byteLength(payload)},body:payload});
    assert.equal(res.status,400,res.body);
    assert.match(res.body,/UNSAFE_AI_URL|内网|本机/);
    assert.equal(hits,0,'private upstream must not be contacted');
  } finally {await stopChild(child);await new Promise(r=>target.close(r));fs.rmSync(temporary,{recursive:true,force:true});}
});

test('oversized request body is rejected and the server stays alive',async()=>{
  const temporary=fs.mkdtempSync(path.join(os.tmpdir(),'notebook-server-body-'));
  fs.copyFileSync(path.join(ROOT,'server.js'),path.join(temporary,'server.js'));
  fs.copyFileSync(path.join(ROOT,'skills.js'),path.join(temporary,'skills.js'));isolatePackage(temporary);
  fs.mkdirSync(path.join(temporary,'dist'));fs.writeFileSync(path.join(temporary,'dist','index.html'),'HOME');
  const reserve=http.createServer();await new Promise(r=>reserve.listen(0,'127.0.0.1',r));const port=reserve.address().port;await new Promise(r=>reserve.close(r));
  const child=spawn(process.execPath,['server.js'],{cwd:temporary,env:{...process.env,PORT:String(port),HOST:'127.0.0.1',NOTEBOOK_TOKEN:''},stdio:['ignore','pipe','pipe']});
  try {
    await new Promise((resolve,reject)=>{let logs='';const timer=setTimeout(()=>reject(Error('server startup timeout: '+logs)),5000);child.stdout.on('data',d=>{logs+=d;if(logs.includes('本机:')){clearTimeout(timer);resolve();}});child.on('exit',c=>{clearTimeout(timer);reject(Error('server exited '+c));});});
    const huge='x'.repeat(7*1024*1024);
    let status=0;
    try { const res=await request(port,'/api/state',{method:'PUT',headers:{'Content-Type':'application/json','Content-Length':Buffer.byteLength(huge)},body:huge}); status=res.status; } catch (e) { /* socket may close after 413 */ }
    assert.ok(status===413||status===0,'expected 413, got '+status);
    let healthStatus=0;
    for (let i=0;i<8;i++) {
      try { healthStatus=(await request(port,'/api/health')).status; } catch (e) { healthStatus=0; }
      if (healthStatus===200) break;
      await new Promise(r=>setTimeout(r,200));
    }
    assert.equal(healthStatus,200,'server must stay alive after oversized body');
  } finally {await stopChild(child);fs.rmSync(temporary,{recursive:true,force:true});}
});

test('corrupt server state fails closed, is backed up, and cannot be overwritten',async()=>{
  const temporary=fs.mkdtempSync(path.join(os.tmpdir(),'notebook-server-corrupt-'));
  fs.copyFileSync(path.join(ROOT,'server.js'),path.join(temporary,'server.js'));
  fs.copyFileSync(path.join(ROOT,'skills.js'),path.join(temporary,'skills.js'));isolatePackage(temporary);
  fs.mkdirSync(path.join(temporary,'dist'));fs.writeFileSync(path.join(temporary,'dist','index.html'),'HOME');
  fs.mkdirSync(path.join(temporary,'data'));
  const corrupt='{ this is not valid json';
  fs.writeFileSync(path.join(temporary,'data','state.json'),corrupt);
  const reserve=http.createServer();await new Promise(r=>reserve.listen(0,'127.0.0.1',r));const port=reserve.address().port;await new Promise(r=>reserve.close(r));
  const child=spawn(process.execPath,['server.js'],{cwd:temporary,env:{...process.env,PORT:String(port),HOST:'127.0.0.1',NOTEBOOK_TOKEN:''},stdio:['ignore','pipe','pipe']});
  try {
    await new Promise((resolve,reject)=>{let logs='';const timer=setTimeout(()=>reject(Error('server startup timeout: '+logs)),5000);child.stdout.on('data',d=>{logs+=d;if(logs.includes('本机:')){clearTimeout(timer);resolve();}});child.on('exit',c=>{clearTimeout(timer);reject(Error('server exited '+c));});});
    const health=await request(port,'/api/health');
    assert.equal(health.status,200);
    assert.equal(JSON.parse(health.body).stateCorrupted,true);
    const get=await request(port,'/api/state');
    assert.equal(get.status,500);
    assert.equal(JSON.parse(get.body).code,'STATE_CORRUPTED');
    const payload=JSON.stringify({baseRev:0,state:{entries:{gaodai:[],shufen:[],jieji:[],xijing:[]}}});
    const put=await request(port,'/api/state',{method:'PUT',headers:{'Content-Type':'application/json','Content-Length':Buffer.byteLength(payload)},body:payload});
    assert.equal(put.status,409,put.body);
    assert.equal(JSON.parse(put.body).code,'STATE_CORRUPTED');
    const backup=path.join(temporary,'data','state.json.corrupted');
    assert.ok(fs.existsSync(backup),'corrupt state must be backed up');
    assert.equal(fs.readFileSync(backup,'utf8'),corrupt);
    assert.equal(fs.readFileSync(path.join(temporary,'data','state.json'),'utf8'),corrupt,'original corrupt file must remain untouched');
  } finally {await stopChild(child);fs.rmSync(temporary,{recursive:true,force:true});}
});
