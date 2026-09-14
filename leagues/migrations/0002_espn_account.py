import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("leagues", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="EspnAccount",
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
                ("espn_s2", models.TextField()),
                ("swid", models.CharField(max_length=64)),
            ],
        ),
        migrations.AddField(
            model_name="leaguesettings",
            name="account",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name="league_settings",
                to="leagues.espnaccount",
            ),
        ),
        migrations.AddField(
            model_name="rostersnapshot",
            name="account",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name="roster_snapshots",
                to="leagues.espnaccount",
            ),
        ),
    ]
