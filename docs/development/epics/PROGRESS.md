# Epic progress tracker

**Last updated:** 2026-09-15

Living status for [epic tickets](README.md). Update this file whenever epic ticket work lands.

## How to update

1. Find the ticket row in the table below.
2. Set **Status** to one of: **Done** · **In progress** · **Not started**
3. Add a short **Notes** cell — merge PR, branch, or blocker (one line).
4. Refresh **Last updated** at the top and adjust **Overall counts** if a ticket moved to Done.

Before closing epic tickets: follow [AGENT-CHECKLIST.md](AGENT-CHECKLIST.md).

---

## Overall counts

| Track | Done | In progress | Not started | Total |
| ----- | ---- | ----------- | ----------- | ----- |
| **USE-001** | 5 | 0 | 0 | 5 |
| **TRADE-001** | 4 | 0 | 0 | 4 |
| **BOARD-001** | 4 | 0 | 0 | 4 |
| **LINE-001** | 2 | 0 | 0 | 2 |
| **SYNC-001** | 3 | 0 | 0 | 3 |
| **WIRE-001** | 2 | 0 | 0 | 2 |
| **All tickets** | 20 | 0 | 0 | 20 |

Read-only league board and cookie submit sync exist in the app; they are **not** closed tickets. Notes on BOARD/SYNC call that out.

---

## USE-001-01 … USE-001-05 (usable after load)

Source: [USE-001-usable-after-load.md](USE-001-usable-after-load.md)

| Status | ID | Title | Notes |
| ------ | -- | ----- | ----- |
| Done | USE-001-01 | Product contract | Docs-only; Locked architecture in USE-001. No JSON/UI. |
| Done | USE-001-02 | Trade detail sheet | `find_trades` JSON + Workshop sheet; locked camelCase ids/totals. |
| Done | USE-001-03 | Custom 1-for-1 evaluate | `GET /api/evaluate/` + Board pair → Workshop; `score_trade` always returns deltas. |
| Done | USE-001-04 | Copy pitch | UI-only on 02/03 Workshop JSON; `copyText` + navigator.clipboard. |
| Done | USE-001-05 | Settings recede after sync | UI-only; **Leagues / cookies** collapses cookie fields after sync. |

---

## TRADE-001-01 … TRADE-001-04 (trade workshop)

Source: [TRADE-001-trade-workshop.md](TRADE-001-trade-workshop.md)

| Status | ID | Title | Notes |
| ------ | -- | ----- | ----- |
| Done | TRADE-001-01 | Filter opponent / position | Client-side filters; `sendPosition`/`receivePosition`; cap stays 20. |
| Done | TRADE-001-02 | Counterpart team on every row | UI-only; `teamBName` JSON from USE-001-02. List column **Them**. |
| Done | TRADE-001-03 | Rank fairness vs your gain | UI-only client sort; Fairness default vs Your gain. Cap stays 20. |
| Done | TRADE-001-04 | 2-for-1 search | `mode=2for1`; N=6 pool; send/receive names joined with ` + `. |

---

## BOARD-001-01 … BOARD-001-04 (league intel you can query)

Source: [BOARD-001-league-intel-query.md](BOARD-001-league-intel-query.md)

| Status | ID | Title | Notes |
| ------ | -- | ----- | ----- |
| Done | BOARD-001-01 | Collapse / expand teams | UI-only; yours expanded, others collapsed until header press. |
| Done | BOARD-001-02 | Search players | UI-only on `GET /api/league/`; case-insensitive name filter. |
| Done | BOARD-001-03 | Sort a roster | UI-only; global Slot → Proj → Rank cycle. |
| Done | BOARD-001-04 | Positional surplus / need | `surplusNeed` on `GET /api/league/`; top-N vs league median. |

---

## LINE-001-01 … LINE-001-02 (lineup helper)

Source: [LINE-001-lineup-helper.md](LINE-001-lineup-helper.md)

| Status | ID | Title | Notes |
| ------ | -- | ----- | ----- |
| Done | LINE-001-01 | Recommended starters | `recommendedStarter` on your players; Start/Sit badges. |
| Done | LINE-001-02 | Injury in starter slot | UI-only; `injury-starter-{id}` on OUT in non-BE/IR slot. |

---

## SYNC-001-01 … SYNC-001-03 (trust the data)

Source: [SYNC-001-trust-the-data.md](SYNC-001-trust-the-data.md)

| Status | ID | Title | Notes |
| ------ | -- | ----- | ----- |
| Done | SYNC-001-01 | Refresh + last-synced | `POST /api/league/refresh/` + `fetchedAt` on GET board; Refresh shows ISO. |
| Done | SYNC-001-02 | Visible sync errors | Settings: unauthorized copy; Board `error` when SWID misses with teams. |
| Done | SYNC-001-03 | Season in settings | UI-only; API already accepted `season`. One field, default 2026; invalid ignored. |

---

## WIRE-001-01 … WIRE-001-02 (waivers)

Source: [WIRE-001-waivers.md](WIRE-001-waivers.md)

| Status | ID | Title | Notes |
| ------ | -- | ----- | ----- |
| Done | WIRE-001-01 | Free-agent sync | `kona_player_info` → `free_agents`; `GET /api/waivers/`. |
| Done | WIRE-001-02 | Ranked adds | `beatsStarter` / `deltaVsWorstStarter` on GET waivers; Board list. |
