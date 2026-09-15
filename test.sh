#!/usr/bin/env bash
# Run pytest with coverage; tee output to logs/pytest/; write missing-lines report on success.
# Usage: ./test.sh [pytest args...]
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

PYTHON=""
if [[ -x "$ROOT/.venv/bin/python" ]]; then
  PYTHON="$ROOT/.venv/bin/python"
elif [[ -x "$ROOT/venv/bin/python" ]]; then
  PYTHON="$ROOT/venv/bin/python"
elif command -v python >/dev/null 2>&1; then
  PYTHON="python"
elif command -v python3 >/dev/null 2>&1; then
  PYTHON="python3"
else
  echo "ERROR: python or python3 required. Create a venv: python3 -m venv .venv && .venv/bin/pip install -r requirements.txt" >&2
  exit 1
fi

LOG_DIR="${ROOT}/logs/pytest"
mkdir -p "$LOG_DIR"
LOG_FILE="${LOG_DIR}/pytest_$(date +%Y%m%d_%H%M%S).log"
echo "Logging to: $LOG_FILE"
export LOG_FILE

set +e
"$PYTHON" -m pytest tests "$@" 2>&1 | tee "$LOG_FILE"
ret=${PIPESTATUS[0]}
set -e
if [ "$ret" -eq 0 ]; then
  "$PYTHON" scripts/write_missing_coverage_lines.py --output coverage/missing_python_coverage_lines.md
fi
exit "$ret"
