#!/usr/bin/env bash
# Full local quality gate.
# Usage: tools/check.sh [--fast] [--json]
#   --fast  skip the slower bank audit and language inventory
#   --json  print a small machine-readable summary at the end
set -euo pipefail

ROOT="${ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)}"
cd "$ROOT"

FAST=0
JSON=0
for arg in "$@"; do
  case "$arg" in
    --fast) FAST=1 ;;
    --json) JSON=1 ;;
    -h|--help)
      sed -n '2,7p' "$0" | sed 's/^# \{0,1\}//'
      exit 0
      ;;
    *) echo "未知参数: $arg" >&2; exit 2 ;;
  esac
done

NODE_BIN="${NODE:-node}"
NPM_BIN="${NPM:-npm}"
PYTHON_BIN="${PYTHON:-}"
if [ -z "$PYTHON_BIN" ]; then
  if command -v python3 >/dev/null 2>&1; then PYTHON_BIN=python3
  elif command -v python >/dev/null 2>&1; then PYTHON_BIN=python
  else echo "缺少 Python 3（审计脚本需要它）" >&2; exit 1
  fi
fi

need() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "缺少命令: $1" >&2
    exit 1
  fi
}
need "$NODE_BIN"
need "$NPM_BIN"
need "$PYTHON_BIN"

START=$(date +%s)
run_step() {
  local label="$1"; shift
  local began; began=$(date +%s)
  printf '\n== %s ==\n' "$label"
  "$@"
  printf '   ok (%ss)\n' "$(( $(date +%s) - began ))"
}

run_step "Node tests" "$NPM_BIN" test
run_step "Bank QA (Node)" "$NODE_BIN" tools/qa-bank-strict.js --strict-difficulty
run_step "Site consistency" "$NODE_BIN" tools/qa-site-consistency.js
if [ "$FAST" -eq 0 ]; then
  run_step "Repository languages" "$NODE_BIN" tools/check_repo_languages.js
  run_step "Bank audit (Python)" "$PYTHON_BIN" tools/audit_bank.py --strict-difficulty
fi

TOTAL=$(( $(date +%s) - START ))
echo
echo "ALL CHECKS PASSED in ${TOTAL}s"
if [ "$JSON" -eq 1 ]; then
  printf '{"ok":true,"seconds":%s,"fast":%s}\n' "$TOTAL" "$([ "$FAST" -eq 1 ] && echo true || echo false)"
fi
