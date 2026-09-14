# [USE-001-02] Trade detail sheet

| Field | Value |
|-------|-------|
| **Epic** | [USE-001 Usable after load](USE-001-usable-after-load.md) |
| **Suggested priority** | P0 |
| **Type** | API + UI |
| **Depends on** | [01](USE-001-01-product-contract.md) |

## Goal

Press a suggested trade and see counterpart team, both players, both deltas, and starter-point totals before/after.

## Scope

- [ ] Extend `find_trades` / `GET /api/trades/` with `sendId`, `receiveId`, `teamBId`, `teamBName`, `beforeA`, `afterA`, `beforeB`, `afterB` (names as implemented; keep existing `send` / `receive` / deltas).
- [ ] TradeDashboard rows are pressable.
- [ ] Detail sheet/panel lists the fields above. Dismiss without navigation stack.

## Acceptance criteria

- [ ] Pytest: seeded league trade JSON includes ids and counterpart name for Bench RB ↔ TE2 (or equivalent fixture).
- [ ] Jest: press a row → detail text visible; dismiss returns to list.

## Pipeline (mandatory)

[AGENT-CHECKLIST.md](AGENT-CHECKLIST.md) — pytest + Jest. User runs tests.

## References

- [`config/views.py`](../../../config/views.py) `trades`
- [`engine/trade.py`](../../../engine/trade.py) `find_trades`, `evaluate_trade`, `starting_ros`

## Test notes

| Layer | Cases |
|-------|--------|
| pytest | Richer trade object; empty list still `{"trades": []}` without league_id |
| Jest | Press row; loading unchanged |
