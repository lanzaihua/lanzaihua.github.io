'use strict';
/* 将 JS 单/双引号字符串中“单个反斜杠”补成双反斜杠；不处理正则字面量（本脚本只用于无正则的文件） */
const fs = require('fs');
const files = process.argv.slice(2);
for (const f of files) {
  const src = fs.readFileSync(f, 'utf8');
  let out = '';
  let state = 'code'; // code | sq | dq | line | block
  for (let i = 0; i < src.length; i++) {
    const c = src[i], n = src[i + 1];
    if (state === 'code') {
      if (c === "'") { state = 'sq'; out += c; continue; }
      if (c === '"') { state = 'dq'; out += c; continue; }
      if (c === '/' && n === '/') { state = 'line'; out += c; continue; }
      if (c === '/' && n === '*') { state = 'block'; out += c; continue; }
      out += c; continue;
    }
    if (state === 'line') { out += c; if (c === '\n') state = 'code'; continue; }
    if (state === 'block') { out += c; if (c === '*' && n === '/') { out += n; i++; state = 'code'; } continue; }
    // in string
    if (c === '\\') {
      if (n === '\\') { out += c + n; i++; continue; }
      out += '\\\\'; continue;
    }
    out += c;
    if (state === 'sq' && c === "'") state = 'code';
    if (state === 'dq' && c === '"') state = 'code';
  }
  fs.writeFileSync(f, out, 'utf8');
  console.log('fixed', f);
}
