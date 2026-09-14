from unittest.mock import patch

import pytest

from leagues.models import LeagueSettings
from leagues.sync import sync_league_settings
from tests.conftest import LEAGUE_ID, SEASON


def _mock_settings_response(mock_get, payload):
    mock_get.return_value.status_code = 200
    mock_get.return_value.json.return_value = payload


@pytest.mark.django_db
@patch("espn.client.requests.get")
def test_sync_league_settings_saves_msettings_to_postgres(
    mock_get, espn_client, msettings_payload
):
    _mock_settings_response(mock_get, msettings_payload)

    sync_league_settings(espn_client)

    assert LeagueSettings.objects.count() == 1
    row = LeagueSettings.objects.get()
    assert row.espn_league_id == LEAGUE_ID
    assert row.season == SEASON
    assert row.name == "Test League"
    assert row.scoring_rules == msettings_payload["settings"]["scoringSettings"]
    assert row.roster_sizes == msettings_payload["settings"]["rosterSettings"]


@pytest.mark.django_db
@patch("espn.client.requests.get")
def test_sync_league_settings_updates_existing_record(
    mock_get, espn_client, msettings_payload
):
    _mock_settings_response(mock_get, msettings_payload)
    sync_league_settings(espn_client)

    updated_payload = {
        **msettings_payload,
        "settings": {
            **msettings_payload["settings"],
            "name": "Updated League",
            "scoringSettings": {"scoringItems": [{"statId": 53, "points": 0.5}]},
            "rosterSettings": {"lineupSlotCounts": {"0": 2}, "rosterSlotCounts": {"0": 2}},
        },
    }
    _mock_settings_response(mock_get, updated_payload)
    sync_league_settings(espn_client)

    assert LeagueSettings.objects.count() == 1
    row = LeagueSettings.objects.get()
    assert row.name == "Updated League"
    assert row.scoring_rules == updated_payload["settings"]["scoringSettings"]
    assert row.roster_sizes == updated_payload["settings"]["rosterSettings"]
