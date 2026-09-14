# Development epics — Roster Pulse backlog

Product planning docs (UX and architecture). Format follows lattice-log epics: parent brief + numbered tickets + progress table. This repo has no Sphinx user guide and no Cypress; closeout is [AGENT-CHECKLIST.md](AGENT-CHECKLIST.md) (TDD, user-run pytest/Jest, mock ESPN).

## Agent checklist

Before finishing epic ticket work, follow [AGENT-CHECKLIST.md](AGENT-CHECKLIST.md).

## Progress tracker

**[PROGRESS.md](PROGRESS.md)** — living status (Done / In progress / Not started). Update it before finishing any epic ticket.

## Active epics

| Epic | Title (file) |
|------|----------------|
| **USE-001** | [Usable after load](USE-001-usable-after-load.md) |
| **TRADE-001** | [Trade workshop](TRADE-001-trade-workshop.md) |
| **BOARD-001** | [League intel you can query](BOARD-001-league-intel-query.md) |
| **LINE-001** | [Lineup helper](LINE-001-lineup-helper.md) |
| **SYNC-001** | [Trust the data](SYNC-001-trust-the-data.md) |
| **WIRE-001** | [Waivers](WIRE-001-waivers.md) |

Paste into GitHub titles as **`[USE-001-0N] Short title`**; link back to these files.

## Implementation tickets (USE-001-01 … USE-001-05)

Parent: [USE-001](USE-001-usable-after-load.md). After cookies sync, the UI is a viewer; this epic adds clickable next actions.

| ID | Priority | Title (file) |
|----|----------|----------------|
| **USE-001-01** | P0 | [Product contract](USE-001-01-product-contract.md) |
| **USE-001-02** | P0 | [Trade detail sheet](USE-001-02-trade-detail-sheet.md) |
| **USE-001-03** | P0 | [Custom 1-for-1 evaluate](USE-001-03-custom-one-for-one.md) |
| **USE-001-04** | P1 | [Copy pitch](USE-001-04-copy-pitch.md) |
| **USE-001-05** | P0 | [Settings recede after sync](USE-001-05-settings-recede.md) |

## Implementation tickets (TRADE-001-01 … TRADE-001-04)

Parent: [TRADE-001](TRADE-001-trade-workshop.md). Prerequisite: [USE-001-02](USE-001-02-trade-detail-sheet.md).

| ID | Priority | Title (file) |
|----|----------|----------------|
| **TRADE-001-01** | P1 | [Filter opponent / position](TRADE-001-01-filter-opponent-position.md) |
| **TRADE-001-02** | P0 | [Counterpart team on every row](TRADE-001-02-counterpart-team-on-row.md) |
| **TRADE-001-03** | P1 | [Rank fairness vs your gain](TRADE-001-03-rank-fairness-vs-gain.md) |
| **TRADE-001-04** | P2 | [2-for-1 search](TRADE-001-04-two-for-one.md) |

## Implementation tickets (BOARD-001-01 … BOARD-001-04)

Parent: [BOARD-001](BOARD-001-league-intel-query.md). **Partial already shipped:** read-only board (all teams, standings, roster columns). Tickets below are query/interaction only.

| ID | Priority | Title (file) |
|----|----------|----------------|
| **BOARD-001-01** | P1 | [Collapse / expand teams](BOARD-001-01-collapse-expand-teams.md) |
| **BOARD-001-02** | P1 | [Search players](BOARD-001-02-search-players.md) |
| **BOARD-001-03** | P1 | [Sort a roster](BOARD-001-03-sort-roster.md) |
| **BOARD-001-04** | P1 | [Positional surplus / need](BOARD-001-04-positional-surplus-need.md) |

## Implementation tickets (LINE-001-01 … LINE-001-02)

Parent: [LINE-001](LINE-001-lineup-helper.md).

| ID | Priority | Title (file) |
|----|----------|----------------|
| **LINE-001-01** | P1 | [Recommended starters](LINE-001-01-recommended-starters.md) |
| **LINE-001-02** | P1 | [Injury in starter slot](LINE-001-02-injury-in-starter-slot.md) |

## Implementation tickets (SYNC-001-01 … SYNC-001-03)

Parent: [SYNC-001](SYNC-001-trust-the-data.md). **Partial already shipped:** Submit cookies syncs `mSettings` / `mRoster` / `mTeam`. Tickets: refresh, errors, season field.

| ID | Priority | Title (file) |
|----|----------|----------------|
| **SYNC-001-01** | P0 | [Refresh + last-synced](SYNC-001-01-refresh-and-fetched-at.md) |
| **SYNC-001-02** | P0 | [Visible sync errors](SYNC-001-02-visible-sync-errors.md) |
| **SYNC-001-03** | P1 | [Season in settings](SYNC-001-03-season-in-settings.md) |

## Implementation tickets (WIRE-001-01 … WIRE-001-02)

Parent: [WIRE-001](WIRE-001-waivers.md). Later; needs a new ESPN view.

| ID | Priority | Title (file) |
|----|----------|----------------|
| **WIRE-001-01** | P2 | [Free-agent sync](WIRE-001-01-free-agent-sync.md) |
| **WIRE-001-02** | P2 | [Ranked adds](WIRE-001-02-ranked-adds.md) |

## Out of scope (no tickets yet)

- Posting trades to ESPN
- Payments / accounts beyond cookies
