# [SYNC-001-03] Season in settings

| Field | Value |
|-------|-------|
| **Epic** | [SYNC-001 Trust the data](SYNC-001-trust-the-data.md) |
| **Suggested priority** | P1 |
| **Type** | UI + API already accepts `season` |
| **Depends on** | — |

## Goal

User can set season on the form. Backend already reads `body.season` or `DEFAULT_SEASON`.

## Scope

- [x] Season field on each league block or once for the submit payload.
- [x] `saveEspnCredentials` sends `season`.
- [x] Placeholder/default 2026 until changed.

## Acceptance criteria

- [x] Jest: change season; Submit payload includes `season: 2025` (or chosen year).
- [x] Existing credentials tests still pass if default omitted (server default).

## Pipeline (mandatory)

[AGENT-CHECKLIST.md](AGENT-CHECKLIST.md) — Jest; pytest only if default handling changes.

## References

- [`config/views.py`](../../../config/views.py) `DEFAULT_SEASON`
- [`mobile/src/api/espnCredentials.js`](../../../mobile/src/api/espnCredentials.js)

## Test notes

- Invalid season: 400 or ignore—pick one in implementation tests.
