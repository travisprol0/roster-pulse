# [SYNC-001-02] Visible sync errors

| Field | Value |
|-------|-------|
| **Epic** | [SYNC-001 Trust the data](SYNC-001-trust-the-data.md) |
| **Suggested priority** | P0 |
| **Type** | API + UI |
| **Depends on** | — |

## Goal

401, no complete leagues, and unmatched SWID (`youTeamId` null with teams present) are explicit messages—not a blank board.

## Scope

- [ ] Credentials POST already returns `unauthorized` per league; surface it in settings.
- [ ] `GET /api/league/` includes `error` or `youTeamId` null warning when snapshot exists but SWID matches no `primaryOwner`.
- [ ] Jest: copy visible for those states.

## Acceptance criteria

- [ ] Pytest: snapshot with no matching SWID → JSON makes the miss detectable (not only empty teams).
- [ ] Jest: user-visible string for unauthorized and for “cookies did not match a team.”

## Pipeline (mandatory)

[AGENT-CHECKLIST.md](AGENT-CHECKLIST.md).

## References

- [`config/views.py`](../../../config/views.py) `espn_credentials`, `league`, `user_team`

## Test notes

- Do not dump cookie values in the error string.
