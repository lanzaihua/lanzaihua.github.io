'use strict';
/*
 * 技能包一致性门禁：src/data/skills.json 与 skills-pack.json.gz 必须能由 skills/ 源文件重建。
 * 用法：node tools/verify-skill-packs.js
 */
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { buildSkillPacks } = require('./build-skill-packs');
const { DEFS } = require('../skills');
const ROOT = path.join(__dirname, '..');
const problems = [];
const rebuilt = buildSkillPacks();
const raw = JSON.stringify(rebuilt);
const jsonPath = path.join(ROOT, 'src', 'data', 'skills.json');
const gzPath = path.join(ROOT, 'src', 'data', 'skills-pack.json.gz');
const cached = fs.existsSync(jsonPath) ? fs.readFileSync(jsonPath, 'utf8') : '';
if (cached !== raw) problems.push('skills.json 与 skills/ 源文件不一致');
if (!fs.existsSync(gzPath)) problems.push('缺少 skills-pack.json.gz');
else {
  let gunzipped = '';
  try { gunzipped = zlib.gunzipSync(fs.readFileSync(gzPath)).toString('utf8'); }
  catch (e) { problems.push('skills-pack.json.gz 解压失败: ' + e.message); }
  if (gunzipped && gunzipped !== raw) problems.push('skills-pack.json.gz 与 skills/ 源文件不一致');
}
for (const key of Object.keys(DEFS)) {
  const def = DEFS[key];
  const dir = path.join(ROOT, 'skills', def.id);
  if (!fs.existsSync(path.join(dir, 'SKILL.md'))) problems.push('缺少技能源文件: skills/' + def.id + '/SKILL.md');
  for (const ch of (def.chapters || [])) {
    const file = path.join(dir, ch.file);
    if (!fs.existsSync(file) || fs.statSync(file).size < 100) problems.push('技能章节缺失或过短: skills/' + def.id + '/' + ch.file);
  }
}
const subjects = Object.keys(rebuilt.subjects || {});
for (const key of subjects) {
  const pack = rebuilt.subjects[key];
  if (!pack.skill || pack.skill.length < 200) problems.push(key + ' 的 SKILL.md 为空或过短');
  if (!Array.isArray(pack.chapters) || !pack.chapters.length) problems.push(key + ' 没有章节');
  else if (pack.chapters.some(function (ch) { return !ch.text || ch.text.length < 100; })) problems.push(key + ' 存在空章节');
}
if (subjects.length !== 4) problems.push('技能学科数量不是 4: ' + subjects.length);
console.log(JSON.stringify({ ok: problems.length === 0, subjects: subjects, chapters: Object.fromEntries(subjects.map(function (k) { return [k, rebuilt.subjects[k].chapters.length]; })), problems: problems }, null, 2));
if (problems.length) process.exit(1);
