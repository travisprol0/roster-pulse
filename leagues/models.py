from django.db import models


class LeagueSettings(models.Model):
    espn_league_id = models.PositiveBigIntegerField()
    season = models.PositiveSmallIntegerField()
    name = models.CharField(max_length=255)
    scoring_rules = models.JSONField()
    roster_sizes = models.JSONField()
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["espn_league_id", "season"],
                name="unique_league_settings_espn_league_id_season",
            )
        ]


class RosterSnapshot(models.Model):
    espn_league_id = models.PositiveBigIntegerField()
    season = models.PositiveSmallIntegerField()
    teams = models.JSONField(default=list)
    players = models.JSONField(default=list)
    fetched_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["espn_league_id", "season"],
                name="unique_roster_snapshot_espn_league_id_season",
            )
        ]
