#!/usr/bin/env node
/* Repository language gate: make the GitHub Languages bar reflect source, not a generated bundle.
   Run with: node tools/check_repo_languages.js --json  */
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', 'dist-pages', 'debug', '备份', '导出', '截图仓库', 'screenshots', 'data', '__pycache__']);
const SKIP_FILES = new Set(['index.html', 'source.zip', 'skills-full.zip', '四科错题本-静态站.zip']);
const LANGUAGE_BY_EXT = {
  '.html': 'HTML',
  '.css': 'CSS',
  '.js': 'JavaScript',
  '.py': 'Python',
  '.sh': 'Shell',
  '.yml': 'YAML',
  '.yaml': 'YAML'
};
const MINIMUM_BYTES = { Python: 12000, Shell: 1000 };

function languageOf(file) {
  if (path.basename(file) === 'Makefile') return 'Makefile';
  return LANGUAGE_BY_EXT[path.extname(file).toLowerCase()] || null;
}

function collect(dir, out) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.') && entry.name !== '.github' && entry.name !== '.gitattributes') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) collect(full, out);
      continue;
    }
    if (!entry.isFile() || SKIP_FILES.has(entry.name)) continue;
    const language = languageOf(full);
    if (!language) continue;
    const size = fs.statSync(full).size;
    out[language] = (out[language] || 0) + size;
  }
}

function main(argv) {
  const languages = {};
  collect(ROOT, languages);
  const total = Object.values(languages).reduce((sum, value) => sum + value, 0);
  const summary = Object.keys(languages).sort((a, b) => languages[b] - languages[a]).map((name) => ({
    name,
    bytes: languages[name],
    percent: Number(((languages[name] / total) * 100).toFixed(2))
  }));
  const problems = [];
  for (const name of ['HTML', 'CSS', 'JavaScript', 'Python', 'Shell', 'Makefile']) {
    if (!languages[name]) problems.push('缺少语言来源: ' + name);
  }
  for (const [name, minimum] of Object.entries(MINIMUM_BYTES)) {
    if ((languages[name] || 0) < minimum) problems.push(name + ' 源码少于 ' + minimum + ' 字节，GitHub 语言条可能再次隐藏');
  }
  const attrsPath = path.join(ROOT, '.gitattributes');
  if (!fs.existsSync(attrsPath)) {
    problems.push('缺少 .gitattributes：生成的 index.html 会重新占满语言统计');
  } else {
    const attrs = fs.readFileSync(attrsPath, 'utf8');
    if (!/^index\.html\s+linguist-generated=true\s*$/m.test(attrs)) {
      problems.push('.gitattributes 未把 index.html 标记为生成文件');
    }
  }
  const result = { ok: problems.length === 0, totalBytes: total, languages: summary, problems };
  if (argv.includes('--json')) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log('Repository languages:');
    summary.forEach((row) => console.log('  ' + row.name.padEnd(12) + String(row.bytes).padStart(8) + '  ' + row.percent + '%'));
    if (problems.length) console.log('PROBLEMS:\n' + problems.join('\n'));
    else console.log('LANGUAGE GATE PASS');
  }
  return result.ok ? 0 : 1;
}

if (require.main === module) process.exit(main(process.argv.slice(2)));
module.exports = { collect, languageOf, main };
