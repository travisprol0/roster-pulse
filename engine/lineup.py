SKILL_FLEX = {"RB", "WR", "TE"}
SUPERFLEX = {"QB", "RB", "WR", "TE"}


def _pts(player):
    if "projectedPts" in player:
        return player.get("projectedPts") or 0
    return ((player.get("stats") or {}).get("pts") or 0)


def _eligible(player):
    return (player.get("slot") or "") != "IR"


def fill_starters(players, slots, score_fn=None):
    score = score_fn or _pts
    used = set()
    starters = []

    def take(allowed, count):
        if not count:
            return
        ranked = sorted(
            (
                player
                for player in players
                if _eligible(player)
                and player.get("id") not in used
                and player.get("position") in allowed
            ),
            key=score,
            reverse=True,
        )
        for player in ranked[:count]:
            used.add(player.get("id"))
            starters.append(player)

    take({"QB"}, slots.get("QB") or 0)
    take({"RB"}, slots.get("RB") or 0)
    take({"WR"}, slots.get("WR") or 0)
    take({"TE"}, slots.get("TE") or 0)
    take({"K"}, slots.get("K") or 0)
    take({"DST"}, slots.get("DST") or 0)
    take({"RB", "WR"}, slots.get("RB/WR") or 0)
    take({"WR", "TE"}, slots.get("WR/TE") or 0)
    take(SKILL_FLEX, slots.get("FLEX") or 0)
    take(SUPERFLEX, slots.get("OP") or 0)
    return starters


def recommended_starter_ids(players, slots):
    return {player["id"] for player in fill_starters(players, slots)}
