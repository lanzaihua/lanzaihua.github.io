'use strict';
const fs = require('fs');
const j = JSON.parse(fs.readFileSync(process.argv[2] || 'tools/gen/shufen/out/bank-analysis-part2.json', 'utf8'));
const byCh = {}; const samples = {};
for (const q of j.items) {
  const nums = (String(q.question).match(/\d+(?:\.\d+)?/g) || []).map(Number);
  const big = nums.filter(x => x >= 20);
  if (big.length) {
    byCh[q.chapter] = (byCh[q.chapter] || 0) + 1;
    if (!samples[q.chapter]) samples[q.chapter] = [];
    if (samples[q.chapter].length < 3) samples[q.chapter].push([q.id, Math.max(...big), q.question.slice(0, 90)]);
  }
}
console.log(JSON.stringify({ byCh, samples }, null, 1));
