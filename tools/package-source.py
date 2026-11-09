#!/usr/bin/env python3
"""Create a portable source archive; omit build products, caches and old data backups."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
root = Path(__file__).resolve().parent.parent
folders = ['src', 'tools', 'tests', 'skills', '.github', 'assets']
files = ['README.md', 'LICENSE', 'CHANGELOG.md', 'package.json', 'package-lock.json', 'build.js', 'server.js', 'skills.js', '.gitignore', '.nojekyll',
         'sw.js', '404.html', 'robots.txt', 'sitemap.xml', 'manifest.webmanifest', 'favicon.svg']
with ZipFile(root / 'source.zip', 'w', ZIP_DEFLATED, compresslevel=9) as archive:
    for folder in folders:
        for file in sorted((root / folder).rglob('*')):
            if file.is_file() and '.bak' not in file.name and file.suffix != '.zip':
                archive.write(file, file.relative_to(root).as_posix())
    for name in files:
        if (root / name).is_file(): archive.write(root / name, name)
print('Created portable source.zip')
