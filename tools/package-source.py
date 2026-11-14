#!/usr/bin/env python3
"""Package the static site and the portable source archive.

The site is a single generated HTML file, but the repository also ships the
source tree needed to rebuild it. This script is the canonical packager:

    python tools/package-source.py --all
    python tools/package-source.py --static
    python tools/package-source.py --source --checksums

It intentionally uses only the Python standard library so release packaging
does not depend on Node.js, npm, or the author's machine.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import sys
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile

ROOT = Path(__file__).resolve().parent.parent
EXPORT_DIR = ROOT / "导出"
STATIC_FILES = [
    "index.html", "404.html", "favicon.svg", "manifest.webmanifest",
    "robots.txt", "sitemap.xml", "sw.js",
]
ROOT_FILES = [
    ".gitattributes", ".gitignore", ".nojekyll", "404.html", "AUDIT_REPORT.md", "AUDIT_REPORT_2026-11-14.md", "CHANGELOG.md", "WARM_ACADEMIC_3_REPORT.md", "WARM_ACADEMIC_3_1_REPORT.md", "WARM_ACADEMIC_3_DESIGN.md", "UI_UX_3_DESIGN.md",
    "LICENSE", "Makefile", "README.md", "build.js", "favicon.svg", "manifest.webmanifest",
    "package-lock.json", "package.json", "robots.txt", "server.js",
    "sitemap.xml", "skills.js", "sw.js",
]
SOURCE_DIRS = [".github", "assets", "skills", "src", "tests", "tools"]
SKIP_DIR_NAMES = {
    "node_modules", "__pycache__", ".git", "dist", "dist-pages", "debug",
    "备份", "导出", "截图仓库", "screenshots",
}
SKIP_SUFFIXES = {".pyc", ".pyo", ".tmp", ".broken"}
SKIP_NAMES = {"source.zip", "四科错题本-静态站.zip", "state.json", ".DS_Store"}


def is_source_file(path: Path) -> bool:
    if not path.is_file():
        return False
    if path.name in SKIP_NAMES or ".bak" in path.name:
        return False
    if path.suffix.lower() in SKIP_SUFFIXES:
        return False
    if path.suffix.lower() == ".zip" and path.parent.name != "skills":
        return False
    return True


def source_entries():
    entries = []
    for name in ROOT_FILES:
        path = ROOT / name
        if path.is_file():
            entries.append((path, name))
    for folder in SOURCE_DIRS:
        base = ROOT / folder
        if not base.is_dir():
            continue
        for path in sorted(base.rglob("*")):
            relative = path.relative_to(ROOT)
            if any(part in SKIP_DIR_NAMES for part in relative.parts):
                continue
            if is_source_file(path):
                entries.append((path, relative.as_posix()))
    return sorted(entries, key=lambda pair: pair[1])


def write_zip(target: Path, entries, compresslevel=9):
    target.parent.mkdir(parents=True, exist_ok=True)
    with ZipFile(target, "w", ZIP_DEFLATED, compresslevel=compresslevel) as archive:
        for path, name in entries:
            archive.write(path, name)
    return {"path": str(target), "entries": len(entries), "bytes": target.stat().st_size}


def build_source(target: Path):
    return write_zip(target, source_entries())


def build_static(target: Path):
    base = ROOT / "dist-pages"
    missing = [name for name in STATIC_FILES if not (base / name).is_file()]
    if missing:
        raise FileNotFoundError("dist-pages 缺少文件: " + ", ".join(missing))
    entries = [(base / name, name) for name in STATIC_FILES]
    return write_zip(target, entries, compresslevel=6)


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def write_checksums(source_zip: Path):
    value = sha256(source_zip)
    target = ROOT / "SHA256SUMS"
    target.write_text(f"{value}  source.zip\n", encoding="utf-8")
    return {"path": str(target), "sha256": value}


def main(argv=None):
    parser = argparse.ArgumentParser(description="打包静态站、源码包与 SHA256SUMS")
    parser.add_argument("--all", action="store_true", help="打包静态站 + 源码包 + 校验和")
    parser.add_argument("--source", action="store_true", help="只打包 source.zip")
    parser.add_argument("--static", action="store_true", help="只打包静态站 zip")
    parser.add_argument("--checksums", action="store_true", help="只写 SHA256SUMS")
    parser.add_argument("--out-dir", default=str(EXPORT_DIR), help="静态站 zip 输出目录")
    args = parser.parse_args(argv)
    if not (args.all or args.source or args.static or args.checksums):
        args.all = True
    out_dir = Path(args.out_dir)
    result = {}
    source_zip = ROOT / "source.zip"
    static_zip = out_dir / "四科错题本-静态站.zip"
    if args.all or args.source:
        result["source"] = build_source(source_zip)
    if args.all or args.static:
        result["static"] = build_static(static_zip)
    if args.all or args.checksums:
        result["checksums"] = write_checksums(source_zip)
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
