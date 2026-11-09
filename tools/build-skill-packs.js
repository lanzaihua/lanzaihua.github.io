'use strict';
const fs = require('fs');
const path = require('path');
const os = require('os');

function candidateRoots() {
  return [
    process.env.SKILLS_ROOT,
    path.join(__dirname, '..', 'skills'),
    path.join(os.homedir(), '.agents', 'skills'),
    path.join(os.homedir(), '.dsh', 'skills')
  ].filter(Boolean);
}

function findSkillDir(id) {
  const roots = candidateRoots();
  for (const root of roots) {
    const dir = path.join(root, id);
    if (fs.existsSync(path.join(dir, 'SKILL.md'))) return dir;
  }
  return null;
}

function read(file) {
  try { return fs.readFileSync(file, 'utf8'); } catch (e) { return ''; }
}

function buildSkillPacks() {
  const { DEFS } = require('../skills');
  const cachePath = path.join(__dirname, '..', 'src', 'data', 'skills.json');
  const cached = fs.existsSync(cachePath) ? JSON.parse(read(cachePath)) : { subjects: {} };
  const out = { generatedAt: cached.generatedAt || new Date().toISOString(), subjects: {} };
  Object.keys(DEFS).forEach(function (subject) {
    const def = DEFS[subject];
    const dir = findSkillDir(def.id);
    if (!dir) {
      const pack = cached.subjects && cached.subjects[subject];
      if (!pack || !pack.skill || !Array.isArray(pack.chapters) || !pack.chapters.length || pack.chapters.some(c => !c.text)) {
        throw new Error('Missing complete skill pack: ' + def.id);
      }
      out.subjects[subject] = pack;
      return;
    }
    out.subjects[subject] = {
      id: def.id,
      name: def.name,
      skill: read(path.join(dir, 'SKILL.md')),
      patterns: read(path.join(dir, 'patterns.md')),
      cheatsheet: read(path.join(dir, 'cheatsheet.md')),
      chapters: (def.chapters || []).map(function (ch) {
        return { file: ch.file, label: ch.label, keys: ch.keys || [], text: read(path.join(dir, ch.file)) };
      })
    };
    console.log(subject + ': ' + out.subjects[subject].chapters.length + ' chapters, ' + dir);
  });
  return out;
}

module.exports = { buildSkillPacks };

if (require.main === module) {
  const packs = buildSkillPacks();
  const outFile = path.join(__dirname, '..', 'src', 'data', 'skills.json');
  fs.writeFileSync(outFile, JSON.stringify(packs), 'utf8');
  console.log('wrote ' + outFile + ' (' + (fs.statSync(outFile).size / 1024).toFixed(1) + ' KB)');
}
