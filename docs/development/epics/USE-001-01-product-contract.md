# [USE-001-01] Product contract — usable after load

| Field | Value |
|-------|-------|
| **Epic** | [USE-001 Usable after load](USE-001-usable-after-load.md) |
| **Suggested priority** | P0 |
| **Type** | Product + docs |
| **Depends on** | — |

## Goal

Lock UI terms and v1 actions so later tickets implement one contract.

## Scope

- [ ] Document **Board**, **Suggested trade**, **Workshop**, **Pitch**.
- [ ] Document: click suggestion → detail; pick two players → evaluate (show deltas even if not mutual); copy pitch; no ESPN write.
- [ ] Document settings recede after a successful sync (05).

## Acceptance criteria

- [ ] Parent epic **Locked architecture** is unambiguous for implementers.
- [ ] No user-facing Help site required (this repo has no Sphinx user guide).

## Pipeline (mandatory)

[AGENT-CHECKLIST.md](AGENT-CHECKLIST.md). Markdown-only; pytest/Jest N/A.

## References

- Epic: [USE-001](USE-001-usable-after-load.md)
- [`mobile/src/screens/LeagueBoard.js`](../../../mobile/src/screens/LeagueBoard.js)
- [`mobile/src/screens/TradeDashboard.js`](../../../mobile/src/screens/TradeDashboard.js)
- [`engine/trade.py`](../../../engine/trade.py)

## Test notes

- **Unit / component:** deferred to 02–05.
- Do not change product behavior in this ticket.
