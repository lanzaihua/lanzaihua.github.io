'use strict';
const fs=require('fs');
const j=JSON.parse(fs.readFileSync('tools/gen/shufen/out/bank-analysis-part2.json','utf8'));
const BS=String.fromCharCode(92);
const toks=['frac','sum','left','right','int','lim','sqrt','infty','cdot','text','exists','varepsilon','delta','prime','arctan','sin','cos','ln','pi'];
const bad=[];const nums={};
for(const q of j.items){
 const txt=[q.question,q.answer,q.standardSolution,q.detailedAnalysis,(q.options||[]).map(o=>o.text).join(' ')].join(' ');
 for(const t of toks){let i=txt.indexOf(t);while(i>=0){if(i>0&&txt[i-1]!==BS&&txt[i-1]!=='_'&&!/[a-zA-Z]/.test(txt[i-1])){bad.push([q.id,q.chapter,t]);break;}i=txt.indexOf(t,i+1);}}
 const arr=(String(q.question).match(/\d+(?:\.\d+)?/g)||[]).map(Number).filter(x=>x>=11);
 if(arr.length){nums[q.chapter]=(nums[q.chapter]||0)+1;}
}
console.log(JSON.stringify({latexBad:bad.length,latexSamples:bad.slice(0,5),questionNumbers11plus:nums},null,1));
