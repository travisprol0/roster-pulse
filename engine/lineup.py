def recommended_starter_ids(players, slots):
    ids = set()
    for position, count in slots.items():
        ranked = sorted(
            (p for p in players if p.get("position") == position),
            key=lambda p: p.get("projectedPts") or 0,
            reverse=True,
        )
        ids.update(p["id"] for p in ranked[:count])
    return ids
