from leagues.models import LeagueSettings


def sync_league_settings(client):
    payload = client.fetch_settings()
    settings = payload["settings"]
    LeagueSettings.objects.update_or_create(
        espn_league_id=client.league_id,
        season=client.season,
        defaults={
            "name": settings["name"],
            "scoring_rules": settings["scoringSettings"],
            "roster_sizes": settings["rosterSettings"],
        },
    )
