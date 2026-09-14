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

This is the implementer contract for USE-001-02 … 05. There is no user-facing Help site (this repo has no Sphinx user guide). Do not change product behavior in USE-001-01.

### Product language (UI)

Use these strings in copy and tickets. Do not substitute dump / suggestion / inspector / message.

| Term | Meaning | Ships in |
|------|---------|----------|
| **Board** | League dump: standings + every roster | `LeagueBoard` |
| **Suggested trade** | One engine row: mutually beneficial 1-for-1 | `TradeDashboard` list |
| **Workshop** | Inspect a suggested trade or a custom pair; same sheet/panel | Sheet on the one page (not a new Expo route) |
| **Pitch** | Plain-language clipboard text for league chat | **Copy pitch** on the Workshop |

### v1 actions (clickable after load)

1. **Open detail.** Press a **Suggested trade** → **Workshop** shows counterpart team, both players, both deltas, and starter-point totals before/after. Dismiss the sheet; do not push a navigation stack.
2. **Custom 1-for-1.** On the **Board**, press one of your players and one opponent player (either order). The **Workshop** evaluates that pair and **always shows both deltas and before/after**, including when the pair is not mutual (`mutual: false`). Include a control to clear the selection.
3. **Copy pitch.** From the **Workshop**, **Copy pitch** copies names, counterpart team, and both deltas. Never include `espn_s2` or SWID.
4. **No ESPN write.** Cookies sync read-only league data. Do not call ESPN trade-propose or any write API.

### Settings recede after sync (USE-001-05)

- First-run (`leagues.length === 0`): cookie form **expanded**.
- After a successful sync with at least one league: cookie fields **collapsed by default**. Header still opens them (label **Leagues / cookies**).
- Submit still syncs and calls `onSaved`. The **Board** is the product, not the cookie form.

### Data (read-only snapshots)

Detail and custom evaluate use stored `RosterSnapshot` + `evaluate_trade` / `starting_ros` (or a sibling that always returns deltas without changing “suggestions only if mutual”). No live ESPN in those paths.

### JSON field names (lock these)

Existing `GET /api/trades/` rows already use camelCase `id`, `send`, `receive`, `teamADelta`, `teamBDelta`. Keep those. Extend each **Suggested trade** (USE-001-02) with:

`sendId`, `receiveId`, `teamBId`, `teamBName`, `beforeA`, `afterA`, `beforeB`, `afterB`

Custom evaluate (USE-001-03): **`GET /api/evaluate/`** with query `league_id`, `send_id`, `receive_id` (same GET+query style as trades; your team comes from the snapshot SWID). Response includes the same player/team/delta/before-after fields plus `mutual` (`true` / `false`).

### Mobile

One page (`App.js`): settings + league switcher + **Board** + **Suggested trade** list. **Workshop** is a sheet/panel on that page, not a new Expo route in v1.

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
