#!/usr/bin/env python3
"""skills/skills-full.zip 必须与 skills/ 下的真实文件逐字节一致。"""
import hashlib
import sys
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ARCHIVE = ROOT / "skills" / "skills-full.zip"
problems = []
if not ARCHIVE.is_file():
    print("missing skills/skills-full.zip")
    sys.exit(1)
with zipfile.ZipFile(ARCHIVE) as archive:
    names = archive.namelist()
    if not names:
        problems.append("zip is empty")
    for name in names:
        target = ROOT / "skills" / name
        if not target.is_file():
            problems.append("missing source: " + name)
            continue
        actual = hashlib.sha256(target.read_bytes()).hexdigest()
        expected = hashlib.sha256(archive.read(name)).hexdigest()
        if actual != expected:
            problems.append("stale zip entry: " + name)
print("skills-full.zip entries: %d, problems: %d" % (len(names), len(problems)))
for problem in problems[:20]:
    print("FAIL:", problem)
sys.exit(1 if problems else 0)
