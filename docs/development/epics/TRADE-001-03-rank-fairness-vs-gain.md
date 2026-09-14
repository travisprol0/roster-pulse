# [TRADE-001-03] Rank fairness vs max your gain

| Field | Value |
|-------|-------|
| **Epic** | [TRADE-001 Trade workshop](TRADE-001-trade-workshop.md) |
| **Suggested priority** | P1 |
| **Type** | Engine + UI |
| **Depends on** | [USE-001-02](USE-001-02-trade-detail-sheet.md) |

## Goal

Toggle sort: current **fairness** (`min(teamADelta, teamBDelta)` desc) vs **your gain** (`teamADelta` desc).

## Scope

- [ ] Keep default fairness (do not change `find_trades` default sort without a param).
- [ ] `?sort=fair|you` or client sort of the same payload.
- [ ] Toggle in TradeDashboard.

## Acceptance criteria

- [ ] Pytest if sort is server-side: order changes for a known fixture.
- [ ] Jest: toggle relabels and reorders rows.

## Pipeline (mandatory)

[AGENT-CHECKLIST.md](AGENT-CHECKLIST.md).

## References

- [`engine/trade.py`](../../../engine/trade.py) `find_trades` sort key

## Test notes

- Do not drop the 20-cap unless a ticket says so.
