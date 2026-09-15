import json

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

from engine.lineup import fill_starters, recommended_starter_ids
from engine.trade import find_trades, score_trade
from engine.waivers import flag_bye_week_streamers
from espn.client import (
    EspnFantasyClient,
    EspnRateLimitedError,
    EspnTimeoutError,
    EspnUnauthorizedError,
    EspnWriteError,
)
from espn.normalize import starter_slots, user_team
from leagues.models import EspnAccount, LeagueSettings, RosterSnapshot
from leagues.sync import sync_league

DEFAULT_SEASON = 2026
PTS_SCORING = {"pts": 1.0}
SKILL_POSITIONS = {"QB", "RB", "WR", "TE", "K", "DST"}
SURPLUS_POSITIONS = {"QB", "RB", "WR", "TE", "K", "DST"}


def _cors(response):
    response["Access-Control-Allow-Origin"] = "*"
    response["Access-Control-Allow-Headers"] = "Content-Type"
    response["Access-Control-Allow-Methods"] = "GET, POST, DELETE, OPTIONS"
    return response


def _json(data, status=200):
    return _cors(JsonResponse(data, status=status))


def health(_request):
    return _cors(JsonResponse({"status": "ok"}))


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

    try:
        body = json.loads(request.body or b"{}")
    except json.JSONDecodeError:
        return _json({"error": "invalid json"}, status=400)
    rows = body.get("leagues") or []
    complete = [row for row in (_complete_league(r) for r in rows) if row]
    season = body.get("season") or DEFAULT_SEASON
    try:
        season = int(season)
    except (TypeError, ValueError):
        return _json({"error": "invalid season"}, status=400)
    if season < 2000 or season > 2100:
        return _json({"error": "invalid season"}, status=400)
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
        except EspnRateLimitedError:
            return _json({"error": "ESPN rate limited"}, status=429)
        except EspnTimeoutError:
            return _json({"error": "ESPN timed out"}, status=504)
        except EspnWriteError as err:
            return _json({"error": str(err) or "ESPN request failed"}, status=err.status)
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
    if request.method == "DELETE":
        league_id = request.GET.get("league_id")
        if not league_id:
            return _json({"error": "not found"}, status=404)
        settings = LeagueSettings.objects.filter(espn_league_id=int(league_id))
        if not settings.exists():
            return _json({"error": "not found"}, status=404)
        accounts = {row.account_id for row in settings.select_related("account")}
        RosterSnapshot.objects.filter(espn_league_id=int(league_id)).delete()
        settings.delete()
        for account_id in accounts:
            if not LeagueSettings.objects.filter(account_id=account_id).exists():
                EspnAccount.objects.filter(id=account_id).delete()
        return _json({"ok": True})
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


def _serialize_player(player, ranks, starter_ids=None):
    data = {
        "id": player.get("id"),
        "name": player.get("name") or "",
        "position": player.get("position") or "",
        "slot": player.get("slot") or "",
        "projectedPts": _projected(player),
        "actualPts": player.get("actualPts") or 0,
        "injury": player.get("injury") or "",
        "positionRank": ranks.get(player.get("id")),
    }
    if starter_ids is not None:
        data["recommendedStarter"] = player.get("id") in starter_ids
    return data


def _median(values):
    if not values:
        return 0
    ordered = sorted(values)
    n = len(ordered)
    mid = n // 2
    if n % 2:
        return ordered[mid]
    return (ordered[mid - 1] + ordered[mid]) / 2


def _position_score(players, position, depth):
    pts = sorted(
        (_projected(player) for player in players if player.get("position") == position),
        reverse=True,
    )
    return sum(pts[:depth])


def _surplus_need(teams, slots):
    tags_by_id = {}
    for team in teams:
        tags = []
        for position, depth in slots.items():
            if position not in SURPLUS_POSITIONS:
                continue
            scores = [
                _position_score(other.get("players") or [], position, depth) for other in teams
            ]
            score = _position_score(team.get("players") or [], position, depth)
            median = _median(scores)
            if score > median:
                tags.append(f"{position}+")
            elif score < median:
                tags.append(f"{position}-")
        tags_by_id[team.get("id")] = tags
    return tags_by_id


def _serialize_team(team, you_id, ranks, surplus_need=None, starter_ids=None):
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
        "surplusNeed": surplus_need or [],
        "players": [
            _serialize_player(player, ranks, starter_ids)
            for player in team.get("players") or []
        ],
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
    settings = LeagueSettings.objects.filter(
        espn_league_id=int(league_id), season=snapshot.season
    ).first()
    slots = starter_slots(settings.roster_sizes if settings else {})
    surplus = _surplus_need(snapshot.teams, slots)
    you_ids = recommended_starter_ids(mine.get("players") or [], slots) if mine else None
    teams = [
        _serialize_team(
            team,
            you_id,
            ranks,
            surplus.get(team.get("id")),
            you_ids if team.get("id") == you_id else None,
        )
        for team in snapshot.teams
    ]
    teams.sort(
        key=lambda team: (
            not team["isYou"],
            team.get("playoffSeed") is None,
            team.get("playoffSeed") or 99,
            team["name"],
        )
    )
    return _json(
        {
            "youTeamId": you_id,
            "teams": teams,
            "fetchedAt": snapshot.fetched_at,
            **(
                {"error": "cookies did not match a team"}
                if you_id is None and teams
                else {}
            ),
        }
    )


@csrf_exempt
def league_refresh(request):
    if request.method == "OPTIONS":
        return _json({})
    if request.method != "POST":
        return _json({"error": "method not allowed"}, status=405)
    body = json.loads(request.body or b"{}")
    league_id = body.get("league_id")
    if not league_id:
        return _json({"error": "not found"}, status=404)
    settings = (
        LeagueSettings.objects.filter(espn_league_id=int(league_id))
        .order_by("-season")
        .select_related("account")
        .first()
    )
    if not settings:
        return _json({"error": "not found"}, status=404)
    account = settings.account
    client = EspnFantasyClient(
        account.espn_s2, account.swid, int(league_id), settings.season
    )
    try:
        sync_league(client)
    except EspnUnauthorizedError:
        return _json({"error": "unauthorized"}, status=401)
    except EspnRateLimitedError:
        return _json({"error": "ESPN rate limited"}, status=429)
    except EspnTimeoutError:
        return _json({"error": "ESPN timed out"}, status=504)
    snapshot = _snapshot(league_id)
    return _json({"fetchedAt": snapshot.fetched_at})


@csrf_exempt
def waivers(request):
    if request.method == "OPTIONS":
        return _json({})
    league_id = request.GET.get("league_id")
    if not league_id:
        return _json({"waivers": []})
    snapshot = _snapshot(league_id)
    if not snapshot:
        return _json({"waivers": []})
    settings = LeagueSettings.objects.filter(
        espn_league_id=int(league_id), season=snapshot.season
    ).first()
    slots = starter_slots(settings.roster_sizes if settings else {})
    mine = user_team(snapshot.teams, snapshot.account.swid)
    if not mine:
        return _json({"waivers": [], "error": "cookies did not match a team"})
    starter_ids = recommended_starter_ids(mine.get("players") or [], slots)
    worst = {}
    worst_player = {}
    for player in mine.get("players") or []:
        if player.get("id") not in starter_ids:
            continue
        position = player.get("position")
        pts = player.get("projectedPts") or 0
        if position not in worst or pts < worst[position]:
            worst[position] = pts
            worst_player[position] = player
    waivers = []
    current_week = settings.current_week if settings else 1
    streamers = flag_bye_week_streamers(
        mine.get("players") or [],
        snapshot.free_agents or [],
        current_week,
        slots,
    )
    streamer_ids = {str(player.get("id")) for player in streamers}
    for player in snapshot.free_agents or []:
        pts = player.get("projectedPts") or 0
        baseline = worst.get(player.get("position"), 0)
        delta = pts - baseline
        waivers.append(
            {
                "id": player.get("id"),
                "name": player.get("name") or "",
                "position": player.get("position") or "",
                "projectedPts": pts,
                "beatsStarter": delta > 0,
                "deltaVsWorstStarter": delta,
                "streamer": str(player.get("id")) in streamer_ids,
            }
        )
    waivers.sort(key=lambda row: row["deltaVsWorstStarter"], reverse=True)
    suggested = None
    for row in waivers:
        if row["beatsStarter"]:
            drop = worst_player.get(row["position"])
            if drop:
                suggested = {
                    "add": {"id": row["id"], "name": row["name"], "position": row["position"]},
                    "drop": {
                        "id": drop.get("id"),
                        "name": drop.get("name") or "",
                        "position": drop.get("position") or "",
                    },
                }
            break
    return _json({"waivers": waivers, "suggested": suggested})


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
        return _json({"trades": [], "error": "cookies did not match a team"})
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


def _split_ids(value):
    if not value:
        return []
    return [part for part in str(value).replace(",", "+").split("+") if part]


def _players_by_ids(players, ids):
    found = []
    for player_id in ids:
        player = _player_by_id(players, player_id)
        if not player:
            return None
        found.append(player)
    return found


@csrf_exempt
def evaluate(request):
    if request.method == "OPTIONS":
        return _json({})
    league_id = request.GET.get("league_id")
    send_ids = _split_ids(request.GET.get("send_ids") or request.GET.get("send_id"))
    receive_ids = _split_ids(
        request.GET.get("receive_ids") or request.GET.get("receive_id")
    )
    if not league_id or not send_ids or not receive_ids:
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

    sends = _players_by_ids(mine.get("players"), send_ids)
    receive = None
    other = None
    for team in snapshot.teams:
        if team.get("id") == mine.get("id"):
            continue
        found = _players_by_ids(team.get("players"), receive_ids)
        if found:
            receive = found
            other = team
            break
    if not sends or not receive:
        return _json({"error": "invalid players"}, status=400)

    scored = score_trade(
        mine.get("players") or [],
        other.get("players") or [],
        sends,
        receive,
        PTS_SCORING,
        slots,
    )
    return _json(
        {
            "send": " + ".join(player.get("name") or "" for player in sends),
            "receive": " + ".join(player.get("name") or "" for player in receive),
            "sendId": "+".join(str(player.get("id")) for player in sends),
            "receiveId": "+".join(str(player.get("id")) for player in receive),
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


def _league_client(league_id):
    settings = (
        LeagueSettings.objects.filter(espn_league_id=int(league_id))
        .order_by("-season")
        .select_related("account")
        .first()
    )
    if not settings:
        return None, None
    account = settings.account
    client = EspnFantasyClient(
        account.espn_s2, account.swid, int(league_id), settings.season
    )
    return client, settings


def _write_caught(fn):
    try:
        return fn(), None
    except EspnUnauthorizedError:
        return None, _json({"error": "unauthorized"}, status=401)
    except EspnRateLimitedError:
        return None, _json({"error": "ESPN rate limited"}, status=429)
    except EspnTimeoutError:
        return None, _json({"error": "ESPN timed out"}, status=504)
    except EspnWriteError as err:
        return None, _json({"error": str(err)}, status=err.status)


@csrf_exempt
def lineup_set(request):
    if request.method == "OPTIONS":
        return _json({})
    if request.method != "POST":
        return _json({"error": "method not allowed"}, status=405)
    body = json.loads(request.body or b"{}")
    league_id = body.get("league_id")
    if not league_id:
        return _json({"error": "not found"}, status=404)
    client, settings = _league_client(league_id)
    if not client:
        return _json({"error": "not found"}, status=404)
    snapshot = _snapshot(league_id)
    if not snapshot:
        return _json({"error": "not found"}, status=404)
    mine = user_team(snapshot.teams, snapshot.account.swid)
    if not mine:
        return _json({"error": "cookies did not match a team"}, status=400)
    slots = starter_slots(settings.roster_sizes if settings else {})
    starters = fill_starters(mine.get("players") or [], slots)
    result, error = _write_caught(
        lambda: client.set_lineup(
            [{"playerId": player.get("id"), "slot": player.get("slot")} for player in starters]
        )
    )
    if error:
        return error
    return _json({"ok": True, "result": result})


@csrf_exempt
def waiver_claim(request):
    if request.method == "OPTIONS":
        return _json({})
    if request.method != "POST":
        return _json({"error": "method not allowed"}, status=405)
    body = json.loads(request.body or b"{}")
    league_id = body.get("league_id")
    add_id = body.get("add_id")
    drop_id = body.get("drop_id")
    if not league_id or add_id is None or drop_id is None:
        return _json({"error": "invalid players"}, status=400)
    client, _settings = _league_client(league_id)
    if not client:
        return _json({"error": "not found"}, status=404)
    result, error = _write_caught(lambda: client.claim_waiver(add_id, drop_id))
    if error:
        return error
    return _json({"ok": True, "result": result})


@csrf_exempt
def trade_propose(request):
    if request.method == "OPTIONS":
        return _json({})
    if request.method != "POST":
        return _json({"error": "method not allowed"}, status=405)
    body = json.loads(request.body or b"{}")
    league_id = body.get("league_id")
    send_ids = body.get("send_ids") or []
    receive_ids = body.get("receive_ids") or []
    if not league_id or not send_ids or not receive_ids:
        return _json({"error": "invalid players"}, status=400)
    client, _settings = _league_client(league_id)
    if not client:
        return _json({"error": "not found"}, status=404)
    result, error = _write_caught(
        lambda: client.propose_trade(send_ids, receive_ids)
    )
    if error:
        return error
    return _json({"ok": True, "result": result})
