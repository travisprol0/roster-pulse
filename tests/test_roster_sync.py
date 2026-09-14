from unittest.mock import MagicMock, patch

import pytest

from leagues.models import EspnAccount, RosterSnapshot
from leagues.sync import sync_roster
from tests.conftest import LEAGUE_ID, SEASON, SWID


def _mock_roster_and_team(mock_get, roster_payload, team_payload=None):
    def side_effect(url, params=None, headers=None):
        response = MagicMock()
        response.status_code = 200
        view = (params or {}).get("view")
        if view == "mTeam":
            response.json.return_value = team_payload or {"teams": []}
        else:
            response.json.return_value = roster_payload
        return response

    mock_get.side_effect = side_effect


@pytest.mark.django_db
@patch("espn.client.requests.get")
def test_sync_roster_saves_mroster_to_postgres(mock_get, espn_client, mroster_payload):
    _mock_roster_and_team(mock_get, mroster_payload)

    sync_roster(espn_client)

    assert RosterSnapshot.objects.count() == 1
    row = RosterSnapshot.objects.get()
    assert row.espn_league_id == LEAGUE_ID
    assert row.season == SEASON
    assert row.account.espn_s2 == espn_client.espn_s2
    assert row.account.swid == SWID
    assert row.teams[0]["primaryOwner"] == SWID
    assert row.teams[0]["players"][0]["name"] == "Patrick Mahomes"
    assert row.teams[0]["players"][0]["stats"]["pts"] == 280.4
    assert row.players[0]["id"] == 3139477


@pytest.mark.django_db
@patch("espn.client.requests.get")
def test_sync_roster_updates_existing_record(mock_get, espn_client, mroster_payload):
    _mock_roster_and_team(mock_get, mroster_payload)
    sync_roster(espn_client)

    updated = {
        **mroster_payload,
        "teams": [
            {
                **mroster_payload["teams"][0],
                "name": "Updated Team",
            }
        ],
    }
    _mock_roster_and_team(mock_get, updated)
    sync_roster(espn_client)

    assert RosterSnapshot.objects.count() == 1
    assert EspnAccount.objects.count() == 1
    assert RosterSnapshot.objects.get().teams[0]["name"] == "Updated Team"


@pytest.mark.django_db
@patch("espn.client.requests.get")
def test_sync_roster_merges_mteam_standings(
    mock_get, espn_client, mroster_payload, mteam_payload
):
    _mock_roster_and_team(mock_get, mroster_payload, mteam_payload)

    sync_roster(espn_client)

    team = RosterSnapshot.objects.get().teams[0]
    assert team["record"] == {"wins": 3, "losses": 1, "ties": 0}
    assert team["pointsFor"] == 412.2
    assert team["pointsAgainst"] == 380.1
    assert team["playoffSeed"] == 2
    assert team["waiverRank"] == 5
