from unittest.mock import patch

import pytest

from espn.client import EspnFantasyClient, EspnUnauthorizedError

ESPN_S2 = "s2-token"
SWID = "{TEST-SWID}"
LEAGUE_ID = 12345
SEASON = 2026

SETTINGS_PAYLOAD = {"id": LEAGUE_ID, "settings": {"name": "Test League"}}
ROSTER_PAYLOAD = {"teams": [{"id": 1, "roster": {"entries": []}}]}


def _client():
    return EspnFantasyClient(
        espn_s2=ESPN_S2,
        swid=SWID,
        league_id=LEAGUE_ID,
        season=SEASON,
    )


def _cookie_header(call_args):
    headers = call_args.kwargs.get("headers") or {}
    return headers.get("Cookie", "")


@patch("espn.client.requests.get")
def test_passes_espn_s2_and_swid_in_cookie_header(mock_get):
    mock_get.return_value.status_code = 200
    mock_get.return_value.json.return_value = SETTINGS_PAYLOAD

    _client().fetch_settings()

    cookie = _cookie_header(mock_get.call_args)
    assert f"espn_s2={ESPN_S2}" in cookie
    assert f"SWID={SWID}" in cookie


@patch("espn.client.requests.get")
def test_raises_on_401_unauthorized(mock_get):
    mock_get.return_value.status_code = 401

    with pytest.raises(EspnUnauthorizedError):
        _client().fetch_settings()


@patch("espn.client.requests.get")
def test_deserializes_msettings_json_to_dict(mock_get):
    mock_get.return_value.status_code = 200
    mock_get.return_value.json.return_value = SETTINGS_PAYLOAD

    result = _client().fetch_settings()

    assert isinstance(result, dict)
    assert result == SETTINGS_PAYLOAD
    assert mock_get.call_args.kwargs["params"]["view"] == "mSettings"


@patch("espn.client.requests.get")
def test_deserializes_mroster_json_to_dict(mock_get):
    mock_get.return_value.status_code = 200
    mock_get.return_value.json.return_value = ROSTER_PAYLOAD

    result = _client().fetch_roster()

    assert isinstance(result, dict)
    assert result == ROSTER_PAYLOAD
    assert mock_get.call_args.kwargs["params"]["view"] == "mRoster"
