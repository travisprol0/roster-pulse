# Roster Pulse — commands

From the **repo root**. Do not use system `pip` or system `pytest` (PEP 668). `./test.sh` uses `.venv`.

## Coverage

| Command | What it runs | Reports |
|--------|----------------|---------|
| `./test.sh` | Backend then frontend | Both columns below |
| `./test.sh backend` | Django / pytest | Terminal missing-lines; `htmlcov/index.html`; `coverage/missing_python_coverage_lines.md` |
| `./test.sh frontend` | Expo / Jest | Terminal summary; `mobile/coverage/lcov-report/index.html`; `coverage/missing_js_coverage_lines.md` |
| `./test.sh tests/test_api.py` | One backend file | Backend reports |
| `./test.sh frontend -- src/__tests__/App.test.js` | One frontend file | Frontend reports |

Open HTML:

```bash
xdg-open htmlcov/index.html
xdg-open mobile/coverage/lcov-report/index.html
```
