import json

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

from engine.trade import find_trades, score_trade
from espn.client import EspnFantasyClient, EspnUnauthorizedError
from espn.normalize import starter_slots, user_team
from leagues.models import EspnAccount, LeagueSettings, RosterSnapshot
from leagues.sync import sync_league

DEFAULT_SEASON = 2026
PTS_SCORING = {"pts": 1.0}
SKILL_POSITIONS = {"QB", "RB", "WR", "TE"}


def _cors(response):
    response["Access-Control-Allow-Origin"] = "*"
    response["Access-Control-Allow-Headers"] = "Content-Type"
    response["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    return response


def _json(data, status=200):
    return _cors(JsonResponse(data, status=status))


def health(_request):
    return JsonResponse({"status": "ok"})


def _complete_league(row):
    league_id = str(row.get("leagueId") or "").strip()
    espn_s2 = str(row.get("espn_s2") or "").strip()
    swid = str(row.get("swid") or "").strip()
    if not league_id or not espn_s2 or not swid:
        return None
    return {"leagueId": int(league_id), "espn_s2": espn_s2, "swid": swid}


@csrf_exempt
def espn_credentials(request):
    if request.method == "OPTIONS":
        return _json({})
    if request.method != "POST":
        return _json({"error": "method not allowed"}, status=405)

    body = json.loads(request.body or b"{}")
    season = body.get("season") or DEFAULT_SEASON
    complete = [row for row in (_complete_league(r) for r in body.get("leagues") or []) if row]
    if not complete:
        return _json({"error": "no complete leagues"}, status=400)

    results = []
    for row in complete:
        client = EspnFantasyClient(row["espn_s2"], row["swid"], row["leagueId"], season)
        try:
            sync_league(client)
        except EspnUnauthorizedError:
            results.append(
                {
                    "league_id": row["leagueId"],
                    "account_id": None,
                    "status": "unauthorized",
                }
            )
            continue
        account = EspnAccount.objects.get(espn_s2=row["espn_s2"], swid=row["swid"])
        results.append(
            {
                "league_id": row["leagueId"],
                "account_id": account.id,
                "status": "ok",
            }
        )
    return _json({"leagues": results})


@csrf_exempt
def leagues(request):
    if request.method == "OPTIONS":
        return _json({})
    data = [
        {"id": str(row.espn_league_id), "name": row.name}
        for row in LeagueSettings.objects.order_by("espn_league_id")
    ]
    return _json({"leagues": data})


def _snapshot(league_id):
    return (
        RosterSnapshot.objects.filter(espn_league_id=int(league_id))
        .order_by("-season")
        .select_related("account")
        .first()
    )


def _projected(player):
    if "projectedPts" in player:
        return player.get("projectedPts") or 0
    return ((player.get("stats") or {}).get("pts") or 0)


def _position_ranks(teams):
    ranks = {}
    by_pos = {}
    for team in teams:
        for player in team.get("players") or []:
            by_pos.setdefault(player.get("position"), []).append(player)
    for group in by_pos.values():
        ordered = sorted(group, key=_projected, reverse=True)
        for index, player in enumerate(ordered, start=1):
            ranks[player.get("id")] = index
    return ranks


def _serialize_player(player, ranks):
    return {
        "id": player.get("id"),
        "name": player.get("name") or "",
        "position": player.get("position") or "",
        "slot": player.get("slot") or "",
        "projectedPts": _projected(player),
        "actualPts": player.get("actualPts") or 0,
        "injury": player.get("injury") or "",
        "positionRank": ranks.get(player.get("id")),
    }


def _serialize_team(team, you_id, ranks):
    record = team.get("record") or {}
    return {
        "id": team.get("id"),
        "name": team.get("name") or "",
        "isYou": team.get("id") == you_id,
        "record": {
            "wins": record.get("wins") or 0,
            "losses": record.get("losses") or 0,
            "ties": record.get("ties") or 0,
        },
        "pointsFor": team.get("pointsFor") or 0,
        "pointsAgainst": team.get("pointsAgainst") or 0,
        "playoffSeed": team.get("playoffSeed"),
        "waiverRank": team.get("waiverRank"),
        "players": [_serialize_player(player, ranks) for player in team.get("players") or []],
    }


@csrf_exempt
def league(request):
    if request.method == "OPTIONS":
        return _json({})
    league_id = request.GET.get("league_id")
    if not league_id:
        return _json({"youTeamId": None, "teams": []})
    snapshot = _snapshot(league_id)
    if not snapshot:
        return _json({"youTeamId": None, "teams": []})
    mine = user_team(snapshot.teams, snapshot.account.swid)
    you_id = mine.get("id") if mine else None
    ranks = _position_ranks(snapshot.teams)
    teams = [_serialize_team(team, you_id, ranks) for team in snapshot.teams]
    teams.sort(
        key=lambda team: (
            not team["isYou"],
            team.get("playoffSeed") is None,
            team.get("playoffSeed") or 99,
            team["name"],
        )
    )
    return _json({"youTeamId": you_id, "teams": teams})


@csrf_exempt
def trades(request):
    if request.method == "OPTIONS":
        return _json({})
    league_id = request.GET.get("league_id")
    if not league_id:
        return _json({"trades": []})

    snapshot = (
        RosterSnapshot.objects.filter(espn_league_id=int(league_id))
        .order_by("-season")
        .select_related("account")
        .first()
    )
    if not snapshot:
        return _json({"trades": []})

    settings = (
        LeagueSettings.objects.filter(
            espn_league_id=int(league_id), season=snapshot.season
        ).first()
    )
    slots = starter_slots(settings.roster_sizes if settings else {})
    mine = user_team(snapshot.teams, snapshot.account.swid)
    if not mine:
        return _json({"trades": []})
    mine_players = [p for p in mine["players"] if p.get("position") in SKILL_POSITIONS]
    others = [
        {
            **team,
            "players": [p for p in team.get("players") or [] if p.get("position") in SKILL_POSITIONS],
        }
        for team in snapshot.teams
        if team.get("id") != mine.get("id")
    ]
    return _json({"trades": find_trades(mine_players, others, PTS_SCORING, slots, two_for_one=request.GET.get("mode") == "2for1")})


def _player_by_id(players, player_id):
    wanted = str(player_id)
    for player in players or []:
        if str(player.get("id")) == wanted:
            return player
    return None


@csrf_exempt
def evaluate(request):
    if request.method == "OPTIONS":
        return _json({})
    league_id = request.GET.get("league_id")
    send_id = request.GET.get("send_id")
    receive_id = request.GET.get("receive_id")
    if not league_id or not send_id or not receive_id:
        return _json({"error": "invalid players"}, status=400)

    snapshot = _snapshot(league_id)
    if not snapshot:
        return _json({"error": "invalid players"}, status=400)

    settings = LeagueSettings.objects.filter(
        espn_league_id=int(league_id), season=snapshot.season
    ).first()
    slots = starter_slots(settings.roster_sizes if settings else {})
    mine = user_team(snapshot.teams, snapshot.account.swid)
    if not mine:
        return _json({"error": "invalid players"}, status=400)

    send = _player_by_id(mine.get("players"), send_id)
    receive = None
    other = None
    for team in snapshot.teams:
        if team.get("id") == mine.get("id"):
            continue
        found = _player_by_id(team.get("players"), receive_id)
        if found:
            receive = found
            other = team
            break
    if not send or not receive:
        return _json({"error": "invalid players"}, status=400)

    scored = score_trade(
        mine.get("players") or [],
        other.get("players") or [],
        [send],
        [receive],
        PTS_SCORING,
        slots,
    )
    return _json(
        {
            "send": send.get("name"),
            "receive": receive.get("name"),
            "sendId": send.get("id"),
            "receiveId": receive.get("id"),
            "teamBId": other.get("id"),
            "teamBName": other.get("name"),
            "teamADelta": scored["team_a_delta"],
            "teamBDelta": scored["team_b_delta"],
            "beforeA": scored["before_a"],
            "afterA": scored["after_a"],
            "beforeB": scored["before_b"],
            "afterB": scored["after_b"],
            "mutual": scored["team_a_delta"] > 0 and scored["team_b_delta"] > 0,
        }
    )
