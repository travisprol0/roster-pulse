# [USE-001-04] Copy pitch

| Field | Value |
|-------|-------|
| **Epic** | [USE-001 Usable after load](USE-001-usable-after-load.md) |
| **Suggested priority** | P1 |
| **Type** | UI |
| **Depends on** | [02](USE-001-02-trade-detail-sheet.md) |

## Goal

From a trade detail, copy a plain-language pitch for league chat. No ESPN write.

## Scope

- [ ] Button **Copy pitch** on the detail sheet.
- [ ] Text includes both player names, counterpart team, and both deltas (one sentence or short paragraph).
- [ ] Web: `Clipboard`; native: `expo-clipboard` only if already a dependency—otherwise web-first `navigator.clipboard` behind a small helper.

## Acceptance criteria

- [ ] Jest: press Copy pitch (mock clipboard); expected string contains send/receive names.
- [ ] Pitch does not include espn_s2 / SWID.

## Pipeline (mandatory)

[AGENT-CHECKLIST.md](AGENT-CHECKLIST.md) — Jest. Pytest N/A unless a `pitch` field is added server-side.

## References

- Detail from [02](USE-001-02-trade-detail-sheet.md)

## Test notes

- Mock clipboard module; do not assert OS pasteboard in CI.
