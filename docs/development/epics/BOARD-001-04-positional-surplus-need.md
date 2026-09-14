# [BOARD-001-04] Positional surplus / need strip

| Field | Value |
|-------|-------|
| **Epic** | [BOARD-001 League intel you can query](BOARD-001-league-intel-query.md) |
| **Suggested priority** | P1 |
| **Type** | API or client + UI |
| **Depends on** | — |

## Goal

Each team shows a short strip: positions that are surplus vs need vs league, using starter slots and projected pts.

## Scope

- [ ] Document formula in this ticket when implementing (e.g. sum of top-N `projectedPts` at RB vs league median of that sum).
- [ ] Strip on the team header: e.g. `RB+` / `TE-`.
- [ ] Prefer compute in `GET /api/league/` so mobile stays dumb.

## Acceptance criteria

- [ ] Pytest: seeded User Team (weak TE, extra RB) vs Other Team shows TE need on you and TE surplus on them (or the inverse matching the fixture).
- [ ] Jest: strip text visible on the card.

## Pipeline (mandatory)

[AGENT-CHECKLIST.md](AGENT-CHECKLIST.md).

## References

- [`espn/normalize.py`](../../../espn/normalize.py) `starter_slots`
- [`tests/test_api.py`](../../../tests/test_api.py) `_user_team` / `_other_team`

## Test notes

- Lock the formula in pytest so UI copy cannot drift.
