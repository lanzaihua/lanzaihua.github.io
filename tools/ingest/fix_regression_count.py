import io
pairs = [
    ('README.md', '四科 9651，98 项回归', '四科 9651，106 项回归'),
    ('README.md', '98 项回归测试', '106 项回归测试'),
    ('src/js/48-changelog.js', '四科 9651，98 项回归', '四科 9651，106 项回归'),
    ('src/js/48-changelog.js', '98 项回归、严格 QA', '106 项回归、严格 QA'),
    ('src/js/48-changelog.js', '99 项回归。', '106 项回归。'),
]
for p, a, b in pairs:
    s = open(p, encoding='utf-8').read()
    if a in s:
        s = s.replace(a, b)
        open(p, 'w', encoding='utf-8', newline='\n').write(s)
        print('fixed', p, a)
    else:
        print('missing', p, a)
