'use strict';
const fs = require('fs');
const B = String.fromCharCode(92);
const NL = String.fromCharCode(10);
const file = process.argv[2];
let s = fs.readFileSync(file, 'utf8');
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
s = out;
const trimmed = s.replace(/\s+$/, '');
const tail = NL + '  }' + NL + '};';
if (trimmed.endsWith(tail)) {
  const head = trimmed.slice(0, -tail.length);
  if (head.trimEnd().endsWith(']')) {
    s = trimmed + NL;
    console.log('array close already present');
  } else {
    s = head + NL + '    ]' + tail + NL;
    console.log('array-close inserted');
  }
} else {
  s = trimmed + NL;
  console.log('tail not matched:', JSON.stringify(trimmed.slice(-30)));
}
fs.writeFileSync(file, s, 'utf8');
console.log('fixed', fixed, 'bytes', s.length);
