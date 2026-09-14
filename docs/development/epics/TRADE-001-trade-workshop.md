# [TRADE-001] Trade workshop

| Field | Value |
|-------|-------|
| **Track** | Product / architecture (epics) |
| **Suggested priority** | P0 (after USE-001-02) |
| **Type** | Epic brief |
| **Source** | Suggested list is a flat table: send, receive, two deltas |
| **Prerequisite** | [USE-001-02](USE-001-02-trade-detail-sheet.md) |

## Problem

The suggestion list cannot be sliced by opponent or position, does not name the other team, and always ranks by “both sides gain.” Power users need fairness vs greed and, later, 2-for-1.

## Success metrics

- Filter list by opponent and by send/receive position.
- Every row names the counterpart team.
- Toggle rank: fairness (`min` of deltas, current) vs max your gain.
- Optional 2-for-1 search; default remains 1-for-1.

## Locked architecture

Reuse `evaluate_trade` / `find_trades`. Ranking toggle is sort-only on the same result set unless 04 adds combinations. Do not call ESPN to submit.

## Out of scope

- ESPN propose
- Multi-team three-way trades

## TDD (mandatory — every ticket)

See [AGENT-CHECKLIST.md](AGENT-CHECKLIST.md).

## Tickets

- [TRADE-001-01](TRADE-001-01-filter-opponent-position.md)
- [TRADE-001-02](TRADE-001-02-counterpart-team-on-row.md)
- [TRADE-001-03](TRADE-001-03-rank-fairness-vs-gain.md)
- [TRADE-001-04](TRADE-001-04-two-for-one.md)
