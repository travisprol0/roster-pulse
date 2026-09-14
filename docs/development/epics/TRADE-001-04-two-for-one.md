# [TRADE-001-04] 2-for-1 search

| Field | Value |
|-------|-------|
| **Epic** | [TRADE-001 Trade workshop](TRADE-001-trade-workshop.md) |
| **Suggested priority** | P2 |
| **Type** | Engine + API + UI |
| **Depends on** | [USE-001-02](USE-001-02-trade-detail-sheet.md) |

## Goal

Optional search: you send two, receive one (or inverse), still only if both starting-ROS improve. Default list stays 1-for-1.

## Scope

- [x] Combinatorial evaluate with a tight cap (document N, e.g. top surplus players only).
- [x] UI: mode toggle 1-for-1 / 2-for-1; rows list two names on one side.
- [x] Mocked tests only; no live ESPN.

N=6: top players per roster by ROS; 2-send-1-receive and inverse. Names joined with ` + `. `GET /api/trades/?mode=2for1`.

## Acceptance criteria

- [x] Pytest: a constructed surplus/need fixture yields at least one 2-for-1 with both deltas > 0.
- [x] 1-for-1 default path unchanged (existing `test_api` trade still passes).

## Pipeline (mandatory)

[AGENT-CHECKLIST.md](AGENT-CHECKLIST.md).

## References

- [`engine/trade.py`](../../../engine/trade.py) `evaluate_trade` already takes lists `send_a`, `send_b`

## Test notes

- Bound runtime in unit tests (tiny rosters).
