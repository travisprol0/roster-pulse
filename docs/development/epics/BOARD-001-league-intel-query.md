# [BOARD-001] League intel you can query

| Field | Value |
|-------|-------|
| **Track** | Product / architecture (epics) |
| **Suggested priority** | P1 |
| **Type** | Epic brief |
| **Source** | LeagueBoard is a static dump of every roster |
| **Prerequisite** | Board display already ships (not interactive) |

## Problem

A 12-team board with full rosters is unusable as a wall of text. The user cannot collapse teams, search a player, sort a roster, or see who is TE-desperate vs RB-rich without scanning every row.

## Success metrics

- Teams collapse; yours stays open by default.
- Search filters players (and can scroll that team into view).
- Each roster sorts by projected pts, position rank, or slot.
- Each team shows a surplus/need strip from starter slots + projected points.

## Locked architecture

Client-side over `GET /api/league/` unless search becomes slow; then add query params. Surplus/need: compare each team’s top-N at a position (`starter_slots`) to league median projected pts at that slot—document the formula in 04. Display-only; no ESPN writes.

## Out of scope

- Click-to-trade lives in USE-001 (may share player press).
- Free agents (WIRE-001).

## TDD (mandatory — every ticket)

See [AGENT-CHECKLIST.md](AGENT-CHECKLIST.md). Jest for board interactions; pytest only if the API grows.

## Tickets

- [BOARD-001-01](BOARD-001-01-collapse-expand-teams.md)
- [BOARD-001-02](BOARD-001-02-search-players.md)
- [BOARD-001-03](BOARD-001-03-sort-roster.md)
- [BOARD-001-04](BOARD-001-04-positional-surplus-need.md)
