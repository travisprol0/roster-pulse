# [BOARD-001-02] Search players across the league

| Field | Value |
|-------|-------|
| **Epic** | [BOARD-001 League intel you can query](BOARD-001-league-intel-query.md) |
| **Suggested priority** | P1 |
| **Type** | UI |
| **Depends on** | [01](BOARD-001-01-collapse-expand-teams.md) optional (search may auto-expand matching team) |

## Goal

A search box filters which players (and teams) show by name substring, case-insensitive.

## Scope

- [ ] Text input on the board.
- [ ] Empty query shows the default collapse rules from 01 (or all teams if 01 not shipped).
- [ ] Match highlights or at least filters rows.

## Acceptance criteria

- [ ] Jest: type a unique player name; other names gone; matching team visible.

## Pipeline (mandatory)

[AGENT-CHECKLIST.md](AGENT-CHECKLIST.md).

## References

- [`GET /api/league/`](../../../config/views.py) `league`

## Test notes

- Client-side filter on already-fetched `teams`.
