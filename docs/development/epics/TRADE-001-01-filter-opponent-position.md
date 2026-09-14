# [TRADE-001-01] Filter suggestions by opponent / position

| Field | Value |
|-------|-------|
| **Epic** | [TRADE-001 Trade workshop](TRADE-001-trade-workshop.md) |
| **Suggested priority** | P1 |
| **Type** | UI (+ optional query params) |
| **Depends on** | [USE-001-02](USE-001-02-trade-detail-sheet.md), [TRADE-001-02](TRADE-001-02-counterpart-team-on-row.md) |

## Goal

Narrow the suggested list by counterpart team and by send or receive position.

## Scope

- [ ] Controls: opponent select (all / team name), position select (all / QB/RB/WR/TE).
- [ ] Filter client-side if the list is capped at 20; document if we raise the cap.

## Acceptance criteria

- [ ] Jest: fixture with two counterpart teams; filter hides the other team’s rows.
- [ ] Jest: position filter keeps only matching send or receive position (pick one rule and test it).

## Pipeline (mandatory)

[AGENT-CHECKLIST.md](AGENT-CHECKLIST.md).

## References

- [`mobile/src/screens/TradeDashboard.js`](../../../mobile/src/screens/TradeDashboard.js)

## Test notes

- Needs counterpart team on the row (02) before opponent filter is meaningful.
