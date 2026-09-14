# [USE-001-03] Custom 1-for-1 evaluate

| Field | Value |
|-------|-------|
| **Epic** | [USE-001 Usable after load](USE-001-usable-after-load.md) |
| **Suggested priority** | P0 |
| **Type** | API + UI |
| **Depends on** | [02](USE-001-02-trade-detail-sheet.md) |

## Goal

Select one of your players and one opponent player; show evaluation even when `evaluate_trade` would return None (still show both deltas / before-after).

## Scope

- [x] `GET` or `POST /api/evaluate/` with `league_id`, `send_id`, `receive_id` (or teamB + player ids). Returns deltas and starter totals; `mutual: true/false`.
- [x] Board: press your player then theirs (or reverse) to fill the workshop. Clear selection control.

## Acceptance criteria

- [x] Pytest: mutual pair `mutual` true and positive deltas; lopsided pair `mutual` false with numeric deltas.
- [x] Jest: two presses open the same detail pattern as 02.

## Pipeline (mandatory)

[AGENT-CHECKLIST.md](AGENT-CHECKLIST.md).

## References

- [`engine/trade.py`](../../../engine/trade.py) `evaluate_trade` may need a sibling that always returns deltas (do not break “suggestions only if mutual”).

## Test notes

| Layer | Cases |
|-------|--------|
| pytest | 400 if players not on the two teams; mock-free DB seed |
| Jest | Player rows pressable; order of clicks documented in test |
