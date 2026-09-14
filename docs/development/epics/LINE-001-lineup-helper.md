# [LINE-001] Lineup helper

| Field | Value |
|-------|-------|
| **Track** | Product / architecture (epics) |
| **Suggested priority** | P1 |
| **Type** | Epic brief |
| **Source** | Roster lists slot from ESPN but does not recommend a start/sit |
| **Prerequisite** | `starter_slots` + projected pts on snapshot players |

## Problem

The board shows ESPN lineup slots and injuries. It never says who *should* start given projections. Injuries can sit in starter slots unnoticed.

## Success metrics

- Your team shows recommended starters vs bench from projected pts and league `starter_slots` (QB/RB/WR/TE; FLEX if we encode it later).
- Starter-slot injuries are visually flagged.

## Locked architecture

Recommendation is local: rank by `projectedPts` into slot counts from `LeagueSettings.roster_sizes` via `starter_slots`. K/DST optional in a later ticket. Does not push lineup to ESPN.

## Out of scope

- ESPN lineup set
- Weekly matchup opponent projection

## TDD (mandatory — every ticket)

Pytest for the ranking helper; Jest for flags on the board.

## Tickets

- [LINE-001-01](LINE-001-01-recommended-starters.md)
- [LINE-001-02](LINE-001-02-injury-in-starter-slot.md)
