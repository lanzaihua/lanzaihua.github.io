'use strict';
const fs=require('fs'),vm=require('vm'),path=require('path');
const {parseHTML}=require('linkedom');
const ROOT=process.cwd();
const read=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
const {document}=parseHTML('<!doctype html><html><body></body></html>');
const ctx={console,Date,Set,Map,Intl,URL,Blob,setTimeout:()=>0,clearTimeout(){},
 location:{hostname:'localhost',protocol:'https:',hash:'',pathname:'/',search:''},
 localStorage:{getItem(){return null},setItem(){}},
 window:{addEventListener(){},__SEED__:{subjects:[]},__BANKS__:{},__PAGES__:true},
 document};
vm.createContext(ctx);
vm.runInContext(read('src/js/00-chapters.js')+'\n'+read('src/js/00-core.js'),ctx);
ctx.toast=()=>{};
ctx.window.marked=ctx.marked=require(path.join(ROOT,'src/vendor/marked.umd.js'));
vm.runInContext(read('src/vendor/temml.min.js'),ctx);ctx.window.temml=ctx.temml;
vm.runInContext(read('src/js/10-markdown.js'),ctx);
const files=['bank-algebra.json','bank-analysis.json','bank-geometry.json','bank-western.json'];
const textFields=['question','answer','standardSolution','detailedAnalysis','points','pitfalls'];
const listFields=['solution'];
function check(html){
  const root=document.createElement('div'); root.innerHTML=html;
  const issues=[];
  const raw=root.querySelectorAll('.math-raw,.temml-error,merror').length;
  if(raw) issues.push('broken='+raw);
  const w=document.createTreeWalker(root,4);
  while(w.nextNode()){
    const n=w.currentNode; const t=n.nodeValue||''; if(!t.trim())continue;
    const p=n.parentElement;
    if(p&&p.closest('code,pre,textarea,script,style,.math-raw,.source-code,.md-copy'))continue;
    let m;
    if((m=/\$[^$\n]+\$/.exec(t))) issues.push('dollar:'+m[0].slice(0,50));
    else if((m=/\\[A-Za-z]{2,}/.exec(t))) issues.push('latex:'+m[0]+' @'+t.slice(Math.max(0,m.index-20),m.index+40));
    else if((m=/[A-Za-z0-9][_^](?:\{?[A-Za-z0-9])/.exec(t))) issues.push('bare:'+m[0]+' @'+t.slice(Math.max(0,m.index-25),m.index+35));
    else if(t.indexOf('\uFFFD')>=0) issues.push('fffd');
  }
  return Array.from(new Set(issues));
}
let total=0; const failures=[]; const byField={};
for(const f of files){
  const d=JSON.parse(read('src/data/'+f)); const items=d.items||d;
  for(const it of items){
    total++;
    const vals=[];
    for(const k of textFields) if(typeof it[k]==='string') vals.push([k,it[k]]);
    for(const k of ['points','pitfalls','tags']) if(Array.isArray(it[k])) it[k].forEach((v,i)=>{if(typeof v==='string') vals.push([k+'['+i+']',v]);});
    for(const k of listFields) if(Array.isArray(it[k])) it[k].forEach((v,i)=>{if(typeof v==='string') vals.push([k+'['+i+']',v]);});
    if(Array.isArray(it.options)) it.options.forEach((o,i)=>{if(o&&typeof o.text==='string') vals.push(['options['+i+']',o.text]);});
    for(const [k,v] of vals){
      let issues=[]; try{issues=check(ctx.renderMarkdown(v));}catch(e){issues=['throw:'+e.message];}
      if(issues.length){ failures.push({id:it.id,field:k,issues:issues.slice(0,6),sample:v.slice(0,160)}); byField[k]=(byField[k]||0)+1; }
    }
    if(total%1000===0) process.stderr.write('.'+total+'\n');
  }
}
fs.mkdirSync(path.join(ROOT,'debug'),{recursive:true});
fs.writeFileSync(path.join(ROOT,'debug/bank-render-audit.json'),JSON.stringify({total,byField,failures},null,2));
console.log(JSON.stringify({total,count:failures.length,byField,first:failures.slice(0,20)},null,2));
process.exitCode=failures.length?1:0;
