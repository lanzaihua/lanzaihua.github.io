import hashlib, os, subprocess, zipfile
root = r'D:\学习\大一\错题本网页'
out = r'D:\dsh-tmp\release'
os.makedirs(out, exist_ok=True)
source = os.path.join(out, 'source.zip')
# 完整源码必须来自 HEAD 的全部 tracked 文件，避免漏掉 skills.js / assets / 根静态文件。
subprocess.run(['git', '-C', root, 'archive', '--format=zip', '-o', source, 'HEAD'], check=True)
static = os.path.join(out, 'sike-cuotiben-static-v2026.11.21.zip')
files = ['index.html', '404.html', 'favicon.svg', 'manifest.webmanifest', 'robots.txt', 'sitemap.xml', 'sw.js', 'skills.js', '_headers', '.nojekyll']
with zipfile.ZipFile(static, 'w', zipfile.ZIP_DEFLATED, compresslevel=9) as z:
    for f in files:
        p = os.path.join(root, f)
        if os.path.exists(p):
            z.write(p, f)
    for dirpath, _, names in os.walk(os.path.join(root, 'data')):
        for n in names:
            p = os.path.join(dirpath, n)
            rel = os.path.relpath(p, root).replace('\\', '/')
            if rel == 'data/state.json':
                continue
            z.write(p, rel)
lines = []
for p in [source, static]:
    h = hashlib.sha256(open(p, 'rb').read()).hexdigest()
    lines.append('%s  %s' % (h, os.path.basename(p)))
open(os.path.join(out, 'SHA256SUMS'), 'w', encoding='utf-8', newline='\n').write('\n'.join(lines) + '\n')
for p in [source, static, os.path.join(out, 'SHA256SUMS')]:
    print(os.path.basename(p), os.path.getsize(p))
