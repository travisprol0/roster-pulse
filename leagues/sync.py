from leagues.models import EspnAccount, LeagueSettings


def sync_league_settings(client):
    payload = client.fetch_settings()
    settings = payload["settings"]
    account, _ = EspnAccount.objects.get_or_create(
        espn_s2=client.espn_s2,
        swid=client.swid,
    )
    LeagueSettings.objects.update_or_create(
        espn_league_id=client.league_id,
        season=client.season,
        defaults={
            "account": account,
            "name": settings["name"],
            "scoring_rules": settings["scoringSettings"],
            "roster_sizes": settings["rosterSettings"],
        },
    )
