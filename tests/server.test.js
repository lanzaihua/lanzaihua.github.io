'use strict';
const {test}=require('node:test');const assert=require('node:assert/strict');
const http=require('node:http');const fs=require('node:fs');const path=require('node:path');const os=require('node:os');const {spawn}=require('node:child_process');
const ROOT=path.join(__dirname,'..');
function request(port,p) {return new Promise((resolve,reject)=>{http.get({hostname:'127.0.0.1',port,path:p},res=>{let body='';res.on('data',x=>body+=x);res.on('end',()=>resolve({status:res.statusCode,body}));}).on('error',reject);});}
test('malformed static URL returns 400; sibling traversal returns 403; service stays alive',async()=>{
  const temporary=fs.mkdtempSync(path.join(os.tmpdir(),'notebook-server-test-'));
  fs.copyFileSync(path.join(ROOT,'server.js'),path.join(temporary,'server.js'));
  fs.copyFileSync(path.join(ROOT,'skills.js'),path.join(temporary,'skills.js'));
  fs.mkdirSync(path.join(temporary,'dist'));fs.writeFileSync(path.join(temporary,'dist','index.html'),'TEST HOME');
  fs.mkdirSync(path.join(temporary,'dist-secret'));fs.writeFileSync(path.join(temporary,'dist-secret','private.txt'),'MUST NOT LEAK');
  const reserve=http.createServer();await new Promise(r=>reserve.listen(0,'127.0.0.1',r));const port=reserve.address().port;await new Promise(r=>reserve.close(r));
  const child=spawn(process.execPath,['server.js'],{cwd:temporary,env:{...process.env,PORT:String(port),HOST:'127.0.0.1'},stdio:['ignore','pipe','pipe']});
  try {
    await new Promise((resolve,reject)=>{let logs='';const timer=setTimeout(()=>reject(Error('server startup timeout: '+logs)),5000);child.stdout.on('data',d=>{logs+=d;if(logs.includes('本机:')){clearTimeout(timer);resolve();}});child.on('exit',c=>{clearTimeout(timer);reject(Error('server exited '+c));});});
    assert.equal((await request(port,'/%E0%A4%A')).status,400);
    assert.equal((await request(port,'/..%2fdist-secret/private.txt')).status,403);
    assert.equal((await request(port,'/')).body,'TEST HOME');
  } finally {child.kill();await new Promise(r=>child.once('exit',r));fs.rmSync(temporary,{recursive:true,force:true});}
});
