'use strict';
const path=require('node:path');const assert=require('node:assert/strict');const {start}=require('./serve-pages');
const {launchChromium}=require('./browser');
const PORT=4194;const root=path.join(__dirname,'..');
let server=null;
const base='http://127.0.0.1:'+PORT;
async function waitServer(){for(let i=0;i<60;i++){try{const r=await fetch(base+'/');if(r.ok)return;}catch(e){}await new Promise(r=>setTimeout(r,250));}throw new Error('pages server did not start');}
(async()=>{let browser;try{
  server=await start(PORT);
  await waitServer();
  browser=await launchChromium();const page=await browser.newPage({viewport:{width:1440,height:1000}});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base+'/',{waitUntil:'networkidle',timeout:120000});await page.waitForTimeout(800);
  const home=await page.evaluate(()=>({id:window.__BUILD_ID__,source:window.__BANK_SOURCE__,count:window.__BANKS__&&window.__BANKS__.gaodai&&window.__BANKS__.gaodai.items&&window.__BANKS__.gaodai.items.length}));
  assert.ok(home.id,'build id missing');assert.ok(home.count>1000,'external bank not loaded: '+home.count);assert.notEqual(home.source,'failed');
  await page.goto(base+'/#/gaodai/bank',{waitUntil:'networkidle'});await page.waitForTimeout(700);
  assert.match(await page.locator('#main').innerText(),new RegExp(home.count+'\\s*\\/\\s*'+home.count));
  await page.reload({waitUntil:'networkidle'});await page.waitForTimeout(500);
  const cached=await page.evaluate(()=>window.__BANK_SOURCE__);
  assert.ok(['idb','network'].includes(cached),'unexpected bank source '+cached);
  await page.goto(base+'/gaodai/bank',{waitUntil:'networkidle'});await page.waitForTimeout(900);
  assert.equal(await page.evaluate(()=>location.hash),'#/gaodai/bank');
  assert.deepEqual(errors,[]);
  console.log(JSON.stringify({ok:true,id:home.id,firstSource:home.source,reloadSource:cached,items:home.count}));
}finally{if(browser)await browser.close();if(server)server.close();}})().catch(e=>{console.error(e);process.exit(1);});