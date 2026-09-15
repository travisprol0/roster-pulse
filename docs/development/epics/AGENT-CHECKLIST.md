# Agent checklist — product epics

**Do not mark any epic ticket Done until this checklist is satisfied.** Roster Pulse does not use lattice-log CI (Ruff/Cypress/Sphinx). Follow this repo’s TDD rules instead.

---

## 0. Progress tracker

Before finishing **any epic ticket**, update [PROGRESS.md](PROGRESS.md): status, one-line notes, overall counts, last updated.

---

## 1. TDD (mandatory)

- Write failing tests **before** production code. Do not implement in the same step as the tests.
- After Red and after Green: **stop**. The user runs tests. Never run `pytest` or `npm test` unless they ask.
- Mock ESPN (`unittest.mock` / `responses`). No live network in tests.

```text
./test.sh                 # user runs — creates .venv if needed, backend then frontend coverage
./test.sh backend         # pytest only (project .venv)
./test.sh frontend        # Jest only
```

Do not use system `pip` or system `pytest` (PEP 668). `./test.sh` installs into `.venv`.

After a green backend run: terminal missing-lines, `htmlcov/index.html`, and `coverage/missing_python_coverage_lines.md`.

After a green frontend run: terminal summary, `mobile/coverage/lcov-report/index.html`, and `coverage/missing_js_coverage_lines.md`.

---

## 2. Scope

- Only the code required to make the failing tests pass.
- No live ESPN trade-propose / write API unless a later epic unlocks it.
- Tenant-visible behavior: keep ticket acceptance criteria honest about what the UI can click vs display.

---

## 3. Closeout

- [ ] PROGRESS.md updated
- [ ] Ticket scope checkboxes match what shipped
- [ ] User confirmed Red then Green
