# [WIRE-001-02] Ranked adds vs worst starter

| Field | Value |
|-------|-------|
| **Epic** | [WIRE-001 Waivers](WIRE-001-waivers.md) |
| **Suggested priority** | P2 |
| **Type** | Engine + UI |
| **Depends on** | [01](WIRE-001-01-free-agent-sync.md), [LINE-001-01](LINE-001-01-recommended-starters.md) useful for “worst starter” |

## Goal

Rank free agents who would beat your worst recommended starter at that position on projected pts.

## Scope

- [x] API field or client: `beatsStarter`, `deltaVsWorstStarter`.
- [x] Simple list UI under the board (read-only; no ESPN claim).

## Acceptance criteria

- [x] Pytest: FA with 100 TE pts vs Weak TE 20 → positive delta for TE.
- [x] Jest: name appears in the wire list.

## Pipeline (mandatory)

[AGENT-CHECKLIST.md](AGENT-CHECKLIST.md).

## References

- [LINE-001-01](LINE-001-01-recommended-starters.md)

## Test notes

- Empty FA list → empty state copy.
