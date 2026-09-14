# [WIRE-001] Waivers

| Field | Value |
|-------|-------|
| **Track** | Product / architecture (epics) |
| **Suggested priority** | P2 |
| **Type** | Epic brief |
| **Source** | Only rostered players are synced (`mRoster` / `mTeam`) |
| **Prerequisite** | [LINE-001-01](LINE-001-01-recommended-starters.md) helpful but not required for 01 |

## Problem

Winning a league needs the wire. We do not fetch free agents. Adds cannot be ranked against the user’s worst starter.

## Success metrics

- Sync a player pool / FA list from ESPN (mocked in tests).
- Rank adds vs the user’s worst projected starter at that position.

## Locked architecture

New ESPN view (e.g. kona player info / `mMatchup` filter—lock in 01). Persist on a model or JSON field; do not live-call from the mobile client. Mock HTTP in pytest.

## Out of scope

- Executing a waiver claim on ESPN
- FAAB bidding UI

## TDD (mandatory — every ticket)

See [AGENT-CHECKLIST.md](AGENT-CHECKLIST.md).

## Tickets

- [WIRE-001-01](WIRE-001-01-free-agent-sync.md)
- [WIRE-001-02](WIRE-001-02-ranked-adds.md)
