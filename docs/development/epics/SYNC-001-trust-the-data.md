# [SYNC-001] Trust the data

| Field | Value |
|-------|-------|
| **Track** | Product / architecture (epics) |
| **Suggested priority** | P0 (parallel with USE-001) |
| **Type** | Epic brief |
| **Source** | Sync only on Submit; 401 / SWID miss looks like an empty board; season is server default 2026 |
| **Prerequisite** | `POST /api/espn-credentials/` already syncs settings + roster + mTeam |

## Problem

Users cannot refresh without re-pasting cookies. Failures are silent. Season is not on the form. Empty `youTeamId` is indistinguishable from “no players.”

## Success metrics

- Refresh re-runs `sync_league` with stored account cookies and shows last-synced time (`RosterSnapshot.fetched_at`).
- 401, incomplete league, and unmatched SWID surface as explicit errors.
- Season is an input on settings (not only a hidden default).

## Locked architecture

Stored `EspnAccount` + `espn_league_id` are enough to refresh; do not require the user to retype s2/SWID if the account exists. Never log full cookie values in the UI.

## Out of scope

- Multi-user auth
- Background cron sync

## TDD (mandatory — every ticket)

Mock ESPN. Pytest for refresh and error payloads; Jest for error copy and season field.

## Tickets

- [SYNC-001-01](SYNC-001-01-refresh-and-fetched-at.md)
- [SYNC-001-02](SYNC-001-02-visible-sync-errors.md)
- [SYNC-001-03](SYNC-001-03-season-in-settings.md)
