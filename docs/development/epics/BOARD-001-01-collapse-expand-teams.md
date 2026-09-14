# [BOARD-001-01] Collapse / expand teams

| Field | Value |
|-------|-------|
| **Epic** | [BOARD-001 League intel you can query](BOARD-001-league-intel-query.md) |
| **Suggested priority** | P1 |
| **Type** | UI |
| **Depends on** | — (board display already ships) |

## Goal

Each team card collapses to header + standings. Yours stays expanded by default; others start collapsed.

## Scope

- [x] Press team header toggles roster table.
- [x] `isYou` team expanded on first load.
- [x] Note: display of all teams already exists; this ticket is interaction only.

## Acceptance criteria

- [x] Jest: other team’s player name hidden until expand; your player visible.

## Pipeline (mandatory)

[AGENT-CHECKLIST.md](AGENT-CHECKLIST.md) — Jest.

## References

- [`mobile/src/screens/LeagueBoard.js`](../../../mobile/src/screens/LeagueBoard.js)

## Test notes

- Use existing LeagueBoard fixture (User Team / Other Team).
