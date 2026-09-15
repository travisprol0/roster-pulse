# [WIRE-001-01] Free-agent / player-pool sync

| Field | Value |
|-------|-------|
| **Epic** | [WIRE-001 Waivers](WIRE-001-waivers.md) |
| **Suggested priority** | P2 |
| **Type** | ESPN client + persist + API |
| **Depends on** | — |

## Goal

Fetch a free-agent (or full pool) view from ESPN, normalize like roster players, store, expose `GET /api/waivers/?league_id=`.

## Scope

- [x] Lock the ESPN `view` name in this ticket when implementing; mock it in pytest.
- [x] Skip players already on a roster.
- [x] Positions at least QB/RB/WR/TE (+ K/DST if normalize already keeps them).

Locked ESPN view: **`kona_player_info`**. Persist on `RosterSnapshot.free_agents`.

## Acceptance criteria

- [x] Pytest: mocked payload → API list of unrostered players with projected pts.
- [x] No live ESPN.

## Pipeline (mandatory)

[AGENT-CHECKLIST.md](AGENT-CHECKLIST.md).

## References

- [`espn/client.py`](../../../espn/client.py)
- [`espn/normalize.py`](../../../espn/normalize.py) `normalize_player`

## Test notes

- Unauthorized 401 same as other client fetches.
