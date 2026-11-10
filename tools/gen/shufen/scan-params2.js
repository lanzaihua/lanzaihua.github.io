'use strict';
const fs=require('fs');
const j=JSON.parse(fs.readFileSync('tools/gen/shufen/out/bank-analysis-part2.json','utf8'));
const byChQ={},byChA={};const samples=[];
for(const q of j.items){
 const bigQ=(q.question.match(/\d+(?:\.\d+)?/g)||[]).map(Number).filter(x=>x>=20);
 const bigA=(String(q.answer)+(q.options||[]).map(o=>o.text).join(' ')).match(/\d+(?:\.\d+)?/g)||[];
 const ba=bigA.map(Number).filter(x=>x>=20);
 if(bigQ.length){byChQ[q.chapter]=(byChQ[q.chapter]||0)+1;if(samples.length<5)samples.push([q.id,'Q',bigQ[0],q.question.slice(0,80)]);}
 if(ba.length){byChA[q.chapter]=(byChA[q.chapter]||0)+1;if(samples.length<10)samples.push([q.id,'A',ba[0],(q.answer||'').slice(0,80)]);}
}
console.log(JSON.stringify({byChQ,byChA,samples},null,1));
