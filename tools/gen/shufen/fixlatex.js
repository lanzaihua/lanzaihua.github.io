'use strict';
const fs = require('fs');
const B = String.fromCharCode(92);
const file = process.argv[2];
const s = fs.readFileSync(file, 'utf8');
let out = '';
let i = 0, fixed = 0;
while (i < s.length) {
  if (s[i] === B) {
    let j = i; while (j < s.length && s[j] === B) j++;
    const L = j - i;
    if (L === 1) { out += B + B; fixed++; } else { out += B.repeat(L); }
    i = j;
  } else { out += s[i]; i++; }
}
fs.writeFileSync(file, out, 'utf8');
console.log('fixed', fixed, 'bytes', out.length);
