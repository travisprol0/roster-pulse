# [LINE-001-01] Recommended starters vs bench

| Field | Value |
|-------|-------|
| **Epic** | [LINE-001 Lineup helper](LINE-001-lineup-helper.md) |
| **Suggested priority** | P1 |
| **Type** | API + UI |
| **Depends on** | — |

## Goal

On **your** team, mark recommended starters from projected pts filling `starter_slots` (QB/RB/WR/TE). Remaining skill players are bench for this helper (ignore ESPN slot for the recommendation).

## Scope

- [x] Helper function + `recommendedStarter: true/false` on your players in `/api/league/` (or a nested `lineup` object).
- [x] UI badge **Start** / **Sit** on your card only.

## Acceptance criteria

- [x] Pytest: Weak TE with 20 pts is sit if a better TE exists; top projected at each slot are start.
- [x] Jest: badges on User Team fixture.

## Pipeline (mandatory)

[AGENT-CHECKLIST.md](AGENT-CHECKLIST.md).

## References

- [`engine/trade.py`](../../../engine/trade.py) `starting_ros` ranking is the same idea

## Test notes

- K/DST not required in v1.
