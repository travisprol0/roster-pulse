# [SYNC-001-01] Refresh and last-synced time

| Field | Value |
|-------|-------|
| **Epic** | [SYNC-001 Trust the data](SYNC-001-trust-the-data.md) |
| **Suggested priority** | P0 |
| **Type** | API + UI |
| **Depends on** | — |

## Goal

Refresh the selected league from ESPN using stored cookies; show `fetched_at` on the board.

## Scope

- [x] `POST /api/league/refresh/` (or similar) with `league_id`; runs `sync_league`; returns board or `{fetchedAt}`.
- [x] **Refresh** control; display last synced (ISO or locale string).
- [x] Mock ESPN in pytest.

## Acceptance criteria

- [x] Pytest: refresh calls client fetch (mocked) and updates snapshot.
- [x] Jest: Refresh press calls the API helper.

## Pipeline (mandatory)

[AGENT-CHECKLIST.md](AGENT-CHECKLIST.md).

## References

- [`leagues/sync.py`](../../../leagues/sync.py) `sync_league`
- [`leagues/models.py`](../../../leagues/models.py) `RosterSnapshot.fetched_at`

## Test notes

- 404 if no stored account for that league.
