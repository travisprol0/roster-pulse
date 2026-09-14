from espn.normalize import normalize_roster_payload
from leagues.models import EspnAccount, LeagueSettings, RosterSnapshot


def _account(client):
    account, _ = EspnAccount.objects.get_or_create(
        espn_s2=client.espn_s2,
        swid=client.swid,
    )
    return account


def _merge_team_standings(teams, team_payload):
    meta = {row.get("id"): row for row in (team_payload or {}).get("teams") or []}
    for team in teams:
        extra = meta.get(team.get("id")) or {}
        overall = ((extra.get("record") or {}).get("overall") or {})
        team["record"] = {
            "wins": overall.get("wins") or 0,
            "losses": overall.get("losses") or 0,
            "ties": overall.get("ties") or 0,
        }
        team["pointsFor"] = overall.get("pointsFor") or 0
        team["pointsAgainst"] = overall.get("pointsAgainst") or 0
        team["playoffSeed"] = extra.get("playoffSeed")
        team["waiverRank"] = extra.get("waiverRank")
    return teams


def sync_league_settings(client):
    payload = client.fetch_settings()
    settings = payload["settings"]
    LeagueSettings.objects.update_or_create(
        espn_league_id=client.league_id,
        season=client.season,
        defaults={
            "account": _account(client),
            "name": settings["name"],
            "scoring_rules": settings["scoringSettings"],
            "roster_sizes": settings["rosterSettings"],
        },
    )


def sync_roster(client):
    payload = client.fetch_roster()
    teams, players = normalize_roster_payload(payload)
    teams = _merge_team_standings(teams, client.fetch_team())
    RosterSnapshot.objects.update_or_create(
        espn_league_id=client.league_id,
        season=client.season,
        defaults={
            "account": _account(client),
            "teams": teams,
            "players": players,
        },
    )


def sync_league(client):
    sync_league_settings(client)
    sync_roster(client)
