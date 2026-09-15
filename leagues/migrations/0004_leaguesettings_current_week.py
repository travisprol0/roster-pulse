from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("leagues", "0003_rostersnapshot_free_agents"),
    ]

    operations = [
        migrations.AddField(
            model_name="leaguesettings",
            name="current_week",
            field=models.PositiveSmallIntegerField(default=1),
        ),
    ]
