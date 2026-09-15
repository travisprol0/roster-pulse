from django.db import models


class EspnAccount(models.Model):
    espn_s2 = models.TextField()
    swid = models.CharField(max_length=64)


class LeagueSettings(models.Model):
    account = models.ForeignKey(
        EspnAccount,
        on_delete=models.CASCADE,
        related_name="league_settings",
    )
    espn_league_id = models.PositiveBigIntegerField()
    season = models.PositiveSmallIntegerField()
    name = models.CharField(max_length=255)
    scoring_rules = models.JSONField()
    roster_sizes = models.JSONField()
    current_week = models.PositiveSmallIntegerField(default=1)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["espn_league_id", "season"],
                name="unique_league_settings_espn_league_id_season",
            )
        ]


class RosterSnapshot(models.Model):
    account = models.ForeignKey(
        EspnAccount,
        on_delete=models.CASCADE,
        related_name="roster_snapshots",
    )
    espn_league_id = models.PositiveBigIntegerField()
    season = models.PositiveSmallIntegerField()
    teams = models.JSONField(default=list)
    players = models.JSONField(default=list)
    free_agents = models.JSONField(default=list)
    fetched_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["espn_league_id", "season"],
                name="unique_roster_snapshot_espn_league_id_season",
            )
        ]
