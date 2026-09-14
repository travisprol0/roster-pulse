def player_ros_points(player, scoring):
    stats = player.get("stats") or {}
    return sum(stats.get(stat, 0) * points for stat, points in scoring.items())


def vorp(player, pool, scoring, league_size, starters):
    position = player["position"]
    ranked = sorted(
        (p for p in pool if p["position"] == position),
        key=lambda p: player_ros_points(p, scoring),
        reverse=True,
    )
    replacement_rank = starters[position] * league_size
    replacement = ranked[replacement_rank - 1]
    return player_ros_points(player, scoring) - player_ros_points(replacement, scoring)


def starting_ros(roster, scoring, slots):
    total = 0
    for position, count in slots.items():
        ranked = sorted(
            (p for p in roster if p["position"] == position),
            key=lambda p: player_ros_points(p, scoring),
            reverse=True,
        )
        total += sum(player_ros_points(p, scoring) for p in ranked[:count])
    return total


def _apply_trade(roster, sending, receiving):
    send_ids = {p["id"] for p in sending}
    kept = [p for p in roster if p["id"] not in send_ids]
    return kept + list(receiving)


def score_trade(team_a, team_b, send_a, send_b, scoring, slots):
    before_a = starting_ros(team_a, scoring, slots)
    before_b = starting_ros(team_b, scoring, slots)
    after_a = starting_ros(_apply_trade(team_a, send_a, send_b), scoring, slots)
    after_b = starting_ros(_apply_trade(team_b, send_b, send_a), scoring, slots)
    return {
        "team_a_delta": after_a - before_a,
        "team_b_delta": after_b - before_b,
        "before_a": before_a,
        "after_a": after_a,
        "before_b": before_b,
        "after_b": after_b,
    }


def evaluate_trade(team_a, team_b, send_a, send_b, scoring, slots):
    scored = score_trade(team_a, team_b, send_a, send_b, scoring, slots)
    if scored["team_a_delta"] > 0 and scored["team_b_delta"] > 0:
        return {
            "team_a_delta": scored["team_a_delta"],
            "team_b_delta": scored["team_b_delta"],
        }
    return None


def simulate_trade(team_a, team_b, send_a, send_b, scoring, slots):
    return evaluate_trade(team_a, team_b, send_a, send_b, scoring, slots) is not None


def find_trades(user_roster, other_teams, scoring, slots, limit=20):
    results = []
    for team in other_teams:
        is_team = isinstance(team, dict)
        others = team["players"] if is_team and "players" in team else team
        team_b_id = team.get("id") if is_team else None
        team_b_name = team.get("name") if is_team else None
        before_a = starting_ros(user_roster, scoring, slots)
        before_b = starting_ros(others, scoring, slots)
        for player_a in user_roster:
            for player_b in others:
                result = evaluate_trade(
                    user_roster, others, [player_a], [player_b], scoring, slots
                )
                if result:
                    results.append(
                        {
                            "id": f"{player_a['id']}-{player_b['id']}",
                            "send": player_a["name"],
                            "receive": player_b["name"],
                            "sendId": player_a["id"],
                            "receiveId": player_b["id"],
                            "teamBId": team_b_id,
                            "teamBName": team_b_name,
                            "teamADelta": result["team_a_delta"],
                            "teamBDelta": result["team_b_delta"],
                            "beforeA": before_a,
                            "afterA": before_a + result["team_a_delta"],
                            "beforeB": before_b,
                            "afterB": before_b + result["team_b_delta"],
                        }
                    )
    results.sort(key=lambda trade: min(trade["teamADelta"], trade["teamBDelta"]), reverse=True)
    return results[:limit]
