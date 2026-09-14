# [LINE-001-02] Highlight injury in a starter slot

| Field | Value |
|-------|-------|
| **Epic** | [LINE-001 Lineup helper](LINE-001-lineup-helper.md) |
| **Suggested priority** | P1 |
| **Type** | UI |
| **Depends on** | [01](LINE-001-01-recommended-starters.md) optional; can flag ESPN `slot` not BE/IR even without 01 |

## Goal

If a player has a non-empty `injury` and is in a starter-like slot (not BE/IR), highlight the row.

## Scope

- [x] Visual treatment (background or **OUT** already shown—add row-level emphasis).
- [x] Treat QUESTIONABLE/OUT/DOUBTFUL/IR as injury; empty string is healthy.

## Acceptance criteria

- [x] Jest: Weak TE `OUT` row has a testID or style marker; healthy row does not.

## Pipeline (mandatory)

[AGENT-CHECKLIST.md](AGENT-CHECKLIST.md) — Jest.

## References

- [`mobile/src/screens/LeagueBoard.js`](../../../mobile/src/screens/LeagueBoard.js) `PlayerRow`
- League fixture injury on Weak TE in [`tests/test_api.py`](../../../tests/test_api.py)

## Test notes

- Do not call ESPN.
