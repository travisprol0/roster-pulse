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

- [x] Document formula in this ticket when implementing (e.g. sum of top-N `projectedPts` at RB vs league median of that sum).
- [x] Strip on the team header: e.g. `RB+` / `TE-`.
- [x] Prefer compute in `GET /api/league/` so mobile stays dumb.

Formula: for each `starter_slots` position, sum of that team’s top-N `projectedPts` vs the league median of those sums (even count: mean of the two middle values). `score > median` → `POS+`; `score < median` → `POS-`; equal omitted. JSON field `surplusNeed`.

## Acceptance criteria

- [x] Pytest: seeded User Team (weak TE, extra RB) vs Other Team shows TE need on you and TE surplus on them (or the inverse matching the fixture).
- [x] Jest: strip text visible on the card.

## Pipeline (mandatory)

[AGENT-CHECKLIST.md](AGENT-CHECKLIST.md).

## References

- [`espn/normalize.py`](../../../espn/normalize.py) `starter_slots`
- [`tests/test_api.py`](../../../tests/test_api.py) `_user_team` / `_other_team`

## Test notes

- Lock the formula in pytest so UI copy cannot drift.
