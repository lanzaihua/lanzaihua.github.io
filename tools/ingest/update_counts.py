# -*- coding: utf-8 -*-
import io, json, re, sys
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# tests totals
p = 'tests/regressions.test.js'
s = open(p, encoding='utf-8').read()
s = s.replace("{algebra:1559,analysis:3522,geometry:1199,western:2883}", "{algebra:2046,analysis:3523,geometry:1199,western:2883}")
open(p, 'w', encoding='utf-8').write(s)

# README counts
p = 'README.md'
s = open(p, encoding='utf-8').read()
s = s.replace('**9163** 道题库', '**9651** 道题库')
s = s.replace('内置 9163 道题库', '内置 9651 道题库')
s = s.replace('| 52 | 1559 |', '| 52 | 2046 |')
s = s.replace('| 29 | 3522 |', '| 29 | 3523 |')
s = s.replace('| **合计** | | **118** | **9163** |', '| **合计** | | **118** | **9651** |')
s = s.replace('四科 9163，98 项回归', '四科 9651，98 项回归')
s = s.replace('9163 道题移到 data/bank.json', '9651 道题移到 data/bank.json')
s = s.replace('**25 项 · 25 组**', '**31 项 · 31 组**')
s = s.replace('本块随 GitHub Pages 与 v2026.11.15 Release 发布。25 项 / 25 组。', '本块随 GitHub Pages 与 v2026.11.15 Release 发布。31 项 / 31 组。')
open(p, 'w', encoding='utf-8').write(s)

# changelog summary counts
p = 'src/js/48-changelog.js'
s = open(p, encoding='utf-8').read()
s = s.replace('四科 9163，98 项回归', '四科 9651，98 项回归')
s = s.replace('本块 25 项 / 25 组。', '本块 31 项 / 31 组。')
open(p, 'w', encoding='utf-8').write(s)
print('counts updated')
