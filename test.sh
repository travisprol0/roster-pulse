#!/usr/bin/env bash
# Run backend (pytest) and/or frontend (Jest) tests with coverage reports.
# Uses a project .venv (creates/installs it) so Debian PEP 668 system Python is never used.
# Usage:
#   ./test.sh                 — backend then frontend
#   ./test.sh backend [args]  — pytest only (args passed through)
#   ./test.sh frontend [args] — Jest only (args passed through)
#   ./test.sh tests/foo.py    — pytest only (path/flag args imply backend)
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

ensure_venv() {
  local py=""
  if command -v python3 >/dev/null 2>&1; then
    py="python3"
  elif command -v python >/dev/null 2>&1; then
    py="python"
  else
    echo "ERROR: python3 is required to create .venv" >&2
    exit 1
  fi
  if [[ ! -x "$ROOT/.venv/bin/python" ]]; then
    echo "Creating project venv at .venv"
    "$py" -m venv "$ROOT/.venv"
  fi
  echo "Installing Python deps into .venv"
  "$ROOT/.venv/bin/pip" install -q -r "$ROOT/requirements.txt"
}

ensure_node() {
  if [[ ! -d "$ROOT/mobile/node_modules" ]]; then
    echo "Installing mobile npm deps"
    (cd "$ROOT/mobile" && npm install)
  fi
}

PYTHON=""
ensure_venv
PYTHON="$ROOT/.venv/bin/python"

run_backend() {
  local log_dir="${ROOT}/logs/pytest"
  mkdir -p "$log_dir"
  local log_file="${log_dir}/pytest_$(date +%Y%m%d_%H%M%S).log"
  echo "Logging pytest to: $log_file"
  set +e
  "$PYTHON" -m pytest tests "$@" 2>&1 | tee "$log_file"
  local ret=${PIPESTATUS[0]}
  set -e
  if [ "$ret" -eq 0 ]; then
    "$PYTHON" scripts/write_missing_coverage_lines.py --output coverage/missing_python_coverage_lines.md
  fi
  return "$ret"
}

run_frontend() {
  ensure_node
  local log_dir="${ROOT}/logs/jest"
  mkdir -p "$log_dir"
  local log_file="${log_dir}/jest_$(date +%Y%m%d_%H%M%S).log"
  echo "Logging Jest to: $log_file"
  set +e
  (cd "$ROOT/mobile" && npm test -- "$@") 2>&1 | tee "$log_file"
  local ret=${PIPESTATUS[0]}
  set -e
  if [ "$ret" -eq 0 ]; then
    "$PYTHON" scripts/write_missing_js_coverage_lines.py --output coverage/missing_js_coverage_lines.md
  fi
  return "$ret"
}

TARGET="all"
if [[ $# -gt 0 ]]; then
  case "$1" in
    backend|py|pytest)
      TARGET="backend"
      shift
      ;;
    frontend|js|jest)
      TARGET="frontend"
      shift
      ;;
    -*|tests/*|test_*)
      TARGET="backend"
      ;;
  esac
fi

ret=0
case "$TARGET" in
  backend)
    run_backend "$@" || ret=$?
    ;;
  frontend)
    run_frontend "$@" || ret=$?
    ;;
  all)
    run_backend || ret=$?
    if [ "$ret" -eq 0 ]; then
      run_frontend || ret=$?
    fi
    ;;
esac
exit "$ret"
