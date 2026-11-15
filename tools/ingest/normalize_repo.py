import json, os
root = 'src/data'
for f in ['bank-algebra.json', 'bank-analysis.json', 'bank-geometry.json', 'bank-western.json']:
    p = os.path.join(root, f)
    data = json.load(open(p, encoding='utf-8'))
    with open(p, 'w', encoding='utf-8', newline='\n') as fh:
        json.dump(data, fh, ensure_ascii=False, indent=2)
        fh.write('\n')
files = ['README.md', 'CHANGELOG.md', 'build.js', 'server.js', 'package.json',
         'src/js/00-core.js', 'src/js/01-bank-loader.js', 'src/js/48-changelog.js',
         'src/js/49-notes.js', 'src/js/58-final.js', 'src/js/60-paper-edit.js', 'src/js/90-init.js',
         'tests/fixes.test.js', 'tests/regressions.test.js', 'tests/server.test.js',
         'tools/publish-pages.js', 'tools/qa-pages.js', 'tools/qa-responsive.js']
for p in files:
    raw = open(p, 'rb').read()
    if b'\r\n' in raw:
        open(p, 'wb').write(raw.replace(b'\r\n', b'\n'))
print('normalized')
