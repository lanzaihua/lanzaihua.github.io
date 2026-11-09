/* Remove only presentation-level spaces from question stems, options and titles. */
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const FILES = ['bank-algebra.json','bank-analysis.json','bank-geometry.json','bank-western.json'];

function normalizeStem(value) {
  let s = String(value == null ? '' : value).replace(/\r\n?/g, '\n');
  // Trim presentation spaces inside text-like LaTeX commands, preserving real spaces in English words.
  s = s.replace(/\\(text|mathrm|operatorname|textbf|mathbf)\{([^{}]*)\}/g, function (_, cmd, body) {
    return '\\' + cmd + '{' + body.replace(/^[ \t]+|[ \t]+$/g, '') + '}';
  });
  // No space just inside inline/display math delimiters.
  s = s.replace(/\$\s+/g, '$').replace(/\s+\$/g, '$');
  // No space before Chinese punctuation.
  s = s.replace(/[ \t]+([，。；：、！？])/g, '$1');
  // Chinese text should not contain word spaces.
  s = s.replace(/([\u4e00-\u9fa5])[ \t]+([\u4e00-\u9fa5])/g, '$1$2');
  // Remove LaTeX control-space after a backslash and spaces around relations in stems.
  s = s.replace(/\\[ \t]/g, '');
  s = s.replace(/[ \t]*=[ \t]*/g, '=');
  s = s.replace(/[ \t]*\+[ \t]*/g, '+');
  s = s.replace(/[ \t]{2,}/g, ' ');
  return s;
}

let changed = 0;
for (const file of FILES) {
  const full = path.join(ROOT, 'src', 'data', file);
  const bank = JSON.parse(fs.readFileSync(full, 'utf8'));
  for (const q of bank.items || []) {
    const before = q.question;
    q.question = normalizeStem(q.question);
    if (q.title) q.title = normalizeStem(q.title);
    if (Array.isArray(q.options)) q.options.forEach(function (o) { if (o && o.text) o.text = normalizeStem(o.text); });
    if (q.question !== before) changed++;
  }
  fs.writeFileSync(full, JSON.stringify(bank));
  console.log(file + ': ' + (bank.items || []).length + ' items');
}
console.log('changed questions: ' + changed);
