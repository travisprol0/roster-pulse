from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="LeagueSettings",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("espn_league_id", models.PositiveBigIntegerField()),
                ("season", models.PositiveSmallIntegerField()),
                ("name", models.CharField(max_length=255)),
                ("scoring_rules", models.JSONField()),
                ("roster_sizes", models.JSONField()),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
            options={
                "constraints": [
                    models.UniqueConstraint(
                        fields=("espn_league_id", "season"),
                        name="unique_league_settings_espn_league_id_season",
                    )
                ]
            },
        ),
        migrations.CreateModel(
            name="RosterSnapshot",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("espn_league_id", models.PositiveBigIntegerField()),
                ("season", models.PositiveSmallIntegerField()),
                ("teams", models.JSONField(default=list)),
                ("players", models.JSONField(default=list)),
                ("fetched_at", models.DateTimeField(auto_now=True)),
            ],
            options={
                "constraints": [
                    models.UniqueConstraint(
                        fields=("espn_league_id", "season"),
                        name="unique_roster_snapshot_espn_league_id_season",
                    )
                ]
            },
        ),
    ]
