from engine.trade import player_ros_points

STREAM_POSITIONS = ("QB", "TE")


def _starters(roster, scoring, slots):
    starters = []
    for position, count in slots.items():
        ranked = sorted(
            (p for p in roster if p["position"] == position),
            key=lambda p: player_ros_points(p, scoring),
            reverse=True,
        )
        starters.extend(ranked[:count])
    return starters


def _bench(roster, scoring, slots):
    starter_ids = {p["id"] for p in _starters(roster, scoring, slots)}
    return [p for p in roster if p["id"] not in starter_ids]


def suggest_waiver_add(roster, free_agents, scoring, slots):
    bench = _bench(roster, scoring, slots)
    if not bench or not free_agents:
        return None
    worst_bench = min(bench, key=lambda p: player_ros_points(p, scoring))
    best_fa = max(free_agents, key=lambda p: player_ros_points(p, scoring))
    if player_ros_points(best_fa, scoring) > player_ros_points(worst_bench, scoring):
        return {"add": best_fa, "drop": worst_bench}
    return None


def flag_bye_week_streamers(roster, free_agents, current_week, slots):
    scoring = {}
    starters = _starters(roster, scoring, slots)
    positions_on_bye_next_week = {
        p["position"]
        for p in starters
        if p["position"] in STREAM_POSITIONS and p.get("bye_week") == current_week + 1
    }
    return [fa for fa in free_agents if fa["position"] in positions_on_bye_next_week]
