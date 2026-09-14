# [BOARD-001-03] Sort a roster

| Field | Value |
|-------|-------|
| **Epic** | [BOARD-001 League intel you can query](BOARD-001-league-intel-query.md) |
| **Suggested priority** | P1 |
| **Type** | UI |
| **Depends on** | — |

## Goal

Per-team roster sorts by projected pts, position rank, or slot (cycle or select).

## Scope

- [x] Control on each card or one global sort applied to every roster.
- [x] Default: ESPN slot order as returned by the API (no surprise reorder until the user sorts).

## Acceptance criteria

- [x] Jest: after sort by proj, first player is the highest `projectedPts` in that fixture team.

## Pipeline (mandatory)

[AGENT-CHECKLIST.md](AGENT-CHECKLIST.md).

## References

- Player fields: `projectedPts`, `positionRank`, `slot`

## Test notes

- Stable sort for ties.
