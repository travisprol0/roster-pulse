POSITION_BY_ID = {1: "QB", 2: "RB", 3: "WR", 4: "TE", 5: "K", 16: "DST"}
SLOT_TO_POSITION = {"0": "QB", "2": "RB", "4": "WR", "6": "TE"}
SLOT_BY_ID = {
    0: "QB",
    2: "RB",
    4: "WR",
    6: "TE",
    16: "DST",
    17: "K",
    20: "BE",
    21: "IR",
    23: "FLEX",
}


def _applied_total(player, source_id):
    stats = player.get("stats") or []
    pool = [row for row in stats if row.get("statSourceId") == source_id]
    totals = [row.get("appliedTotal") or 0 for row in pool]
    return max(totals) if totals else 0


def projected_points(player):
    projected = _applied_total(player, 1)
    if projected:
        return projected
    stats = player.get("stats") or []
    totals = [row.get("appliedTotal") or 0 for row in stats]
    return max(totals) if totals else 0


def normalize_player(entry):
    player = (entry.get("playerPoolEntry") or {}).get("player") or {}
    position = POSITION_BY_ID.get(player.get("defaultPositionId"))
    if not position:
        return None
    projected = projected_points(player)
    return {
        "id": player.get("id") or entry.get("playerId"),
        "name": player.get("fullName", ""),
        "position": position,
        "slot": SLOT_BY_ID.get(entry.get("lineupSlotId"), "BE"),
        "injury": player.get("injuryStatus") or "",
        "projectedPts": projected,
        "actualPts": _applied_total(player, 0),
        "stats": {"pts": projected},
    }


def normalize_team(team):
    entries = ((team.get("roster") or {}).get("entries") or [])
    players = [player for player in (normalize_player(entry) for entry in entries) if player]
    return {
        "id": team.get("id"),
        "name": team.get("name") or team.get("abbrev") or "",
        "primaryOwner": team.get("primaryOwner"),
        "players": players,
    }


def normalize_roster_payload(payload):
    teams = [normalize_team(team) for team in payload.get("teams") or []]
    players = [player for team in teams for player in team["players"]]
    return teams, players


def normalize_free_agents(payload, rostered_ids=None):
    rostered = {str(pid) for pid in (rostered_ids or set())}
    players = []
    for row in payload.get("players") or []:
        if row.get("onTeamId"):
            continue
        raw = row.get("player") or {}
        entry = {
            "playerId": row.get("id") or raw.get("id"),
            "lineupSlotId": 20,
            "playerPoolEntry": {"player": raw},
        }
        player = normalize_player(entry)
        if not player:
            continue
        if str(player.get("id")) in rostered:
            continue
        players.append(player)
    return players


def user_team(teams, swid):
    for team in teams:
        if team.get("primaryOwner") == swid:
            return team
    return None


def starter_slots(roster_settings):
    counts = (roster_settings or {}).get("lineupSlotCounts") or {}
    slots = {}
    for slot_id, position in SLOT_TO_POSITION.items():
        count = counts.get(slot_id)
        if count:
            slots[position] = count
    return slots or {"QB": 1, "RB": 2, "WR": 2, "TE": 1}
