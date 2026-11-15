#!/usr/bin/env node
/* LaTeX semantic lint: double-escaped commands, unescaped set braces, duplicate options. */
'use strict';
const fs=require('fs'),path=require('path');
const ROOT=path.join(__dirname,'..');
const FILES=['bank-algebra.json','bank-analysis.json','bank-geometry.json','bank-western.json'];
const TEXT=['question','answer','standardSolution','detailedAnalysis','verification'];
const LIST=['solution','pitfalls','points'];
const problems=[];
function fields(it){
  const out=[];
  TEXT.forEach(k=>{if(typeof it[k]==='string') out.push([k,it[k]]);});
  LIST.forEach(k=>{if(Array.isArray(it[k])) it[k].forEach((v,i)=>{if(typeof v==='string') out.push([k+'['+i+']',v]);});});
  if(Array.isArray(it.options)) it.options.forEach((o,i)=>{if(o&&typeof o.text==='string') out.push(['options['+i+']',o.text]);});
  return out;
}
function scan(id,field,text){
  const DS=String.fromCharCode(92,92);
  const badCmd=['infty','xi','alpha','beta','gamma','frac','dfrac','sqrt','sum','int','lim','begin','end','left','right'].find(function(c){
    let at=0;
    const needle=DS+c;
    while((at=text.indexOf(needle,at))>=0){
      if(text.charAt(at-1)!=='\\') return true;
      at+=2;
    }
    return false;
  });
  if(badCmd) problems.push(id+' '+field+' 双反斜杠命令 \\'+badCmd);
  const math=text.match(/\$\$[\s\S]*?\$\$|\$[^$\n]*\$/g)||[];
  for(const seg of math){
    const brace=/(?:\\in|\\ne|=)\{(?!\\?(?:begin|end|frac|dfrac|sqrt|operatorname|text|mathrm|mathbb|left|right)\b)([^{}]*)\}/;
    if(brace.test(seg)) problems.push(id+' '+field+' 集合花括号未转义 '+seg.slice(0,80));
  }
}
for(const f of FILES){
  const d=JSON.parse(fs.readFileSync(path.join(ROOT,'src/data',f),'utf8'));
  for(const it of d.items){
    if(it.type==='choice'){
      const seen=new Map();
      (it.options||[]).forEach(o=>{const t=String(o.text||'').replace(/\s+/g,'');if(seen.has(t)) problems.push(it.id+' 选项重复 '+seen.get(t)+'/'+o.key);else seen.set(t,o.key);});
    }
    if(!('correct' in it)) problems.push(it.id+' 缺少 correct 键');
    fields(it).forEach(([k,v])=>scan(it.id,k,v));
  }
}
if(problems.length){console.error('BANK LATEX FAILED ('+problems.length+')\n  '+problems.slice(0,80).join('\n  '));process.exit(1);}
console.log('BANK LATEX PASS');
