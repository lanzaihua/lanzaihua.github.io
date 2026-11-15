import io
p = 'README.md'
text = open(p, encoding='utf-8').read()
lines = text.splitlines()
for i, line in enumerate(lines):
    if line.startswith('### 2026-11-14') and i + 2 < len(lines) and lines[i + 2].startswith('**31 项'):
        lines[i + 2] = '**25 项 · 25 组**'
open(p, 'w', encoding='utf-8').write('\n'.join(lines) + '\n')
p = 'src/js/48-changelog.js'
s = open(p, encoding='utf-8').read()
s = s.replace('本块随 GitHub Pages 与 v2026.11.14 Release 发布。本块 31 项 / 31 组。', '本块随 GitHub Pages 与 v2026.11.14 Release 发布。本块 25 项 / 25 组。')
open(p, 'w', encoding='utf-8').write(s)
print('ok')
