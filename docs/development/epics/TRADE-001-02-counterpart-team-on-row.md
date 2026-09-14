# [TRADE-001-02] Counterpart team on every row

| Field | Value |
|-------|-------|
| **Epic** | [TRADE-001 Trade workshop](TRADE-001-trade-workshop.md) |
| **Suggested priority** | P0 |
| **Type** | API + UI |
| **Depends on** | [USE-001-02](USE-001-02-trade-detail-sheet.md) may already add `teamBName`; this ticket is the **list column** if 02 only put it on the sheet |

## Goal

Every suggested-trade row shows the other team’s name. Today the table is send / receive / deltas only.

## Scope

- [x] API includes `teamBName` (and id) on each trade if not already from USE-001-02.
- [x] Dashboard column **Them** (or equivalent) visible without opening detail.

## Acceptance criteria

- [x] Pytest: seeded two-team league; TE2 trade row has Other Team (fixture name).
- [x] Jest: getByText counterpart name on the list.

## Pipeline (mandatory)

[AGENT-CHECKLIST.md](AGENT-CHECKLIST.md).

## References

- [`engine/trade.py`](../../../engine/trade.py) `find_trades`
- [`tests/test_api.py`](../../../tests/test_api.py)

## Test notes

- If USE-001-02 already asserts this JSON, this ticket is UI-only; note that in PROGRESS when closing.
