# [USE-001-05] Settings recede after sync

| Field | Value |
|-------|-------|
| **Epic** | [USE-001 Usable after load](USE-001-usable-after-load.md) |
| **Suggested priority** | P0 |
| **Type** | UI |
| **Depends on** | — (can ship parallel with 02) |

## Goal

After at least one league is loaded, the cookie form is not the whole product. Board is first; settings collapse or sit behind **Leagues / cookies**.

## Scope

- [ ] When `leagues.length > 0`, cookie fields are collapsed by default (header still opens them).
- [ ] Empty state: form expanded (first-run).
- [ ] Submit still syncs and calls `onSaved`.

## Acceptance criteria

- [ ] Jest: with mocked `fetchLeagues` returning a league, cookie placeholders are not in the tree until expand (or `accessibilityState` collapsed).
- [ ] Jest: with no leagues, League ID placeholder is visible.

## Pipeline (mandatory)

[AGENT-CHECKLIST.md](AGENT-CHECKLIST.md) — Jest; update [App.test.js](../../../mobile/src/__tests__/App.test.js) if layout changes.

## References

- [`mobile/src/screens/SettingsScreen.js`](../../../mobile/src/screens/SettingsScreen.js)
- [`mobile/App.js`](../../../mobile/App.js)

## Test notes

| Layer | Cases |
|-------|--------|
| Jest | First-run vs synced; Add league still works when expanded |
