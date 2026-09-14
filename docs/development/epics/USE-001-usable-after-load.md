# [USE-001] Usable after load

| Field | Value |
|-------|-------|
| **Track** | Product / architecture (epics) |
| **Suggested priority** | P0 |
| **Type** | Epic brief |
| **Source** | After ESPN cookies sync, LeagueBoard and TradeDashboard are read-only; the user cannot act on a loaded team (2026-09) |
| **Prerequisite** | League board display and `/api/trades/` suggestions already ship (viewer only) |

## Problem

Roster Pulse syncs ESPN and paints standings, rosters, and suggested 1-for-1s. None of those rows are clickable. The engine already computes mutually beneficial trades. The product stops at looking.

## Personas

| Persona | Primary pain |
|---------|----------------|
| **Manager (you)** | Loaded a team; need a next action, not another table. |
| **Implementer** | Trade JSON is names + deltas only; no ids or counterpart team for a detail sheet. |

## Success metrics

- After sync, the user can open a suggested trade and see who, what moves, and both sides’ starter-point deltas.
- The user can pick one of their players and one opponent player and see an evaluation even when it is not “mutual.”
- The user can copy a chat pitch. Cookies recede so the board is the product.

## Locked architecture

### Product language (UI)

| Role | Term |
|------|------|
| League dump | **Board** |
| Engine row | **Suggested trade** |
| Inspect / build | **Workshop** |
| Clipboard text | **Pitch** |

### Data

- Detail and custom evaluate use stored `RosterSnapshot` + `evaluate_trade` / `starting_ros`. No ESPN write.
- Suggested-trade API must include player ids and counterpart team id/name (extend `find_trades` / `trades` view).

### Mobile

One page. Detail is a sheet/panel on the board, not a new Expo route in v1.

## Out of scope

- Posting the offer to ESPN
- 2-for-1 (TRADE-001-04)
- Waivers (WIRE-001)

## TDD (mandatory — every ticket)

Failing pytest/Jest first. User runs tests. Mock ESPN. See [AGENT-CHECKLIST.md](AGENT-CHECKLIST.md).

## Tickets

- [USE-001-01](USE-001-01-product-contract.md)
- [USE-001-02](USE-001-02-trade-detail-sheet.md)
- [USE-001-03](USE-001-03-custom-one-for-one.md)
- [USE-001-04](USE-001-04-copy-pitch.md)
- [USE-001-05](USE-001-05-settings-recede.md)
