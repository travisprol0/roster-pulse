from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("leagues", "0002_espn_account"),
    ]

    operations = [
        migrations.AddField(
            model_name="rostersnapshot",
            name="free_agents",
            field=models.JSONField(default=list),
        ),
    ]
