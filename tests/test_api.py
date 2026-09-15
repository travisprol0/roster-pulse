import json
from unittest.mock import patch

import pytest

from leagues.models import EspnAccount, LeagueSettings, RosterSnapshot
from tests.conftest import ESPN_S2, LEAGUE_ID, SEASON, SWID

SCORING = {"pts": 1.0}
ROSTER_SIZES = {"lineupSlotCounts": {"0": 1, "2": 2, "4": 2, "6": 1}}


def _player(pid, name, position, pts, slot=None, injury="", actual=0):
    return {
        "id": pid,
        "name": name,
        "position": position,
        "slot": slot or position,
        "injury": injury,
        "projectedPts": pts,
        "actualPts": actual,
        "stats": {"pts": pts},
    }


def _user_team():
    return {
        "id": 1,
        "name": "User Team",
        "primaryOwner": SWID,
        "record": {"wins": 3, "losses": 1, "ties": 0},
        "pointsFor": 412.2,
        "pointsAgainst": 380.1,
        "playoffSeed": 2,
        "waiverRank": 5,
        "players": [
            _player("a-qb", "QB", "QB", 200, actual=40),
            _player("a-rb1", "RB1", "RB", 120, actual=30),
            _player("a-rb2", "RB2", "RB", 100, actual=22),
            _player("a-rb3", "Bench RB", "RB", 90, slot="BE", actual=8),
            _player("a-wr1", "WR1", "WR", 80, actual=18),
            _player("a-wr2", "WR2", "WR", 70, actual=14),
            _player("a-te", "Weak TE", "TE", 20, injury="OUT", actual=2),
        ],
    }


def _other_team():
    return {
        "id": 2,
        "name": "Other Team",
        "primaryOwner": "{OTHER}",
        "record": {"wins": 1, "losses": 3, "ties": 0},
        "pointsFor": 300.0,
        "pointsAgainst": 400.0,
        "playoffSeed": 8,
        "waiverRank": 2,
        "players": [
            _player("b-qb", "QB", "QB", 200, actual=38),
            _player("b-rb1", "RB1", "RB", 40, actual=10),
            _player("b-rb2", "RB2", "RB", 30, actual=6),
            _player("b-wr1", "WR1", "WR", 80, actual=16),
            _player("b-wr2", "WR2", "WR", 70, actual=12),
            _player("b-te1", "TE1", "TE", 90, actual=24),
            _player("b-te2", "TE2", "TE", 75, actual=20),
        ],
    }


def _seed_league(league_id=LEAGUE_ID, name="Test League"):
    account = EspnAccount.objects.create(espn_s2=ESPN_S2, swid=SWID)
    LeagueSettings.objects.create(
        account=account,
        espn_league_id=league_id,
        season=SEASON,
        name=name,
        scoring_rules=SCORING,
        roster_sizes=ROSTER_SIZES,
    )
    teams = [_user_team(), _other_team()]
    RosterSnapshot.objects.create(
        account=account,
        espn_league_id=league_id,
        season=SEASON,
        teams=teams,
        players=[p for t in teams for p in t["players"]],
    )
    return account


def _settings_and_roster_get(url, params=None, headers=None):
    from unittest.mock import MagicMock

    response = MagicMock()
    if "/leagues/222" in url:
        response.status_code = 401
        return response
    response.status_code = 200
    view = (params or {}).get("view")
    if view == "mSettings":
        payload = {
            "id": LEAGUE_ID,
            "settings": {
                "name": "Test League",
                "scoringSettings": {"scoringItems": []},
                "rosterSettings": ROSTER_SIZES,
            },
        }
    elif view == "mTeam":
        payload = {
            "teams": [
                {
                    "id": 1,
                    "playoffSeed": 2,
                    "waiverRank": 5,
                    "record": {
                        "overall": {
                            "wins": 3,
                            "losses": 1,
                            "ties": 0,
                            "pointsFor": 412.2,
                            "pointsAgainst": 380.1,
                        }
                    },
                }
            ]
        }
    else:
        payload = {
            "teams": [
                {
                    "id": 1,
                    "name": "Test Team",
                    "primaryOwner": SWID,
                    "roster": {"entries": []},
                }
            ]
        }
    response.json.return_value = payload
    return response


@pytest.mark.django_db
@patch("espn.client.requests.get", side_effect=_settings_and_roster_get)
def test_post_credentials_syncs_each_complete_league(mock_get, client):
    response = client.post(
        "/api/espn-credentials/",
        data=json.dumps(
            {
                "season": SEASON,
                "leagues": [
                    {"leagueId": str(LEAGUE_ID), "espn_s2": ESPN_S2, "swid": SWID},
                    {"leagueId": "222", "espn_s2": "other-s2", "swid": "{OTHER}"},
                    {"leagueId": "", "espn_s2": ESPN_S2, "swid": SWID},
                ],
            }
        ),
        content_type="application/json",
    )

    assert response.status_code == 200
    body = response.json()["leagues"]
    assert body[0]["league_id"] == LEAGUE_ID
    assert body[0]["status"] == "ok"
    assert body[0]["account_id"] is not None
    assert body[1]["league_id"] == 222
    assert body[1]["status"] == "unauthorized"
    assert LeagueSettings.objects.filter(espn_league_id=LEAGUE_ID).count() == 1
    assert RosterSnapshot.objects.filter(espn_league_id=LEAGUE_ID).count() == 1
    assert not LeagueSettings.objects.filter(espn_league_id=222).exists()


@pytest.mark.django_db
def test_post_credentials_400_when_no_complete_rows(client):
    response = client.post(
        "/api/espn-credentials/",
        data=json.dumps({"leagues": [{"leagueId": "", "espn_s2": "", "swid": ""}]}),
        content_type="application/json",
    )
    assert response.status_code == 400


@pytest.mark.django_db
def test_get_leagues_returns_cached_leagues(client):
    _seed_league(name="League A")
    response = client.get("/api/leagues/")
    assert response.status_code == 200
    assert response["Access-Control-Allow-Origin"] == "*"
    assert response.json() == {"leagues": [{"id": str(LEAGUE_ID), "name": "League A"}]}


@pytest.mark.django_db
def test_trades_endpoint_returns_computed_trades(client):
    _seed_league()
    response = client.get(f"/api/trades/?league_id={LEAGUE_ID}")
    assert response.status_code == 200
    body = response.json()
    match = next(
        trade
        for trade in body["trades"]
        if trade["send"] == "Bench RB" and trade["receive"] == "TE2"
    )
    assert match["teamADelta"] > 0
    assert match["teamBDelta"] > 0
    assert match["sendId"] == "a-rb3"
    assert match["receiveId"] == "b-te2"
    assert match["teamBId"] == 2
    assert match["teamBName"] == "Other Team"
    assert match["sendPosition"] == "RB"
    assert match["receivePosition"] == "TE"
    assert match["afterA"] - match["beforeA"] == match["teamADelta"]
    assert match["afterB"] - match["beforeB"] == match["teamBDelta"]
    assert match["afterA"] > match["beforeA"]
    assert match["afterB"] > match["beforeB"]


@pytest.mark.django_db
def test_trades_endpoint_empty_without_league_id(client):
    response = client.get("/api/trades/")
    assert response.status_code == 200
    assert response.json() == {"trades": []}


@pytest.mark.django_db
def test_league_endpoint_returns_board(client):
    _seed_league()
    response = client.get(f"/api/league/?league_id={LEAGUE_ID}")
    assert response.status_code == 200
    assert response["Access-Control-Allow-Origin"] == "*"
    body = response.json()
    assert body["youTeamId"] == 1
    assert [team["name"] for team in body["teams"]] == ["User Team", "Other Team"]
    yours = body["teams"][0]
    assert yours["isYou"] is True
    assert yours["record"] == {"wins": 3, "losses": 1, "ties": 0}
    assert yours["pointsFor"] == 412.2
    assert yours["pointsAgainst"] == 380.1
    assert yours["playoffSeed"] == 2
    assert yours["waiverRank"] == 5
    bench = next(p for p in yours["players"] if p["name"] == "Bench RB")
    assert bench["slot"] == "BE"
    assert bench["projectedPts"] == 90
    assert bench["actualPts"] == 8
    assert bench["positionRank"] == 3
    assert bench["recommendedStarter"] is False
    weak_te = next(p for p in yours["players"] if p["name"] == "Weak TE")
    assert weak_te["injury"] == "OUT"
    assert weak_te["positionRank"] == 3
    assert weak_te["recommendedStarter"] is True
    rb1 = next(p for p in yours["players"] if p["name"] == "RB1")
    assert rb1["recommendedStarter"] is True
    other = body["teams"][1]
    assert other["isYou"] is False
    assert "recommendedStarter" not in other["players"][0]
    other = body["teams"][1]
    assert other["isYou"] is False
    assert other["playoffSeed"] == 8
    # top-N projectedPts vs league median of those sums (even count: mean of two middle)
    assert "TE-" in yours["surplusNeed"]
    assert "RB+" in yours["surplusNeed"]
    assert "TE+" in other["surplusNeed"]
    assert "RB-" in other["surplusNeed"]


@pytest.mark.django_db
def test_league_endpoint_empty_without_league_id(client):
    response = client.get("/api/league/")
    assert response.status_code == 200
    assert response.json() == {"youTeamId": None, "teams": []}


@pytest.mark.django_db
def test_evaluate_endpoint_mutual_pair_returns_positive_deltas(client):
    _seed_league()
    response = client.get(
        f"/api/evaluate/?league_id={LEAGUE_ID}&send_id=a-rb3&receive_id=b-te2"
    )
    assert response.status_code == 200
    body = response.json()
    assert body["mutual"] is True
    assert body["send"] == "Bench RB"
    assert body["receive"] == "TE2"
    assert body["sendId"] == "a-rb3"
    assert body["receiveId"] == "b-te2"
    assert body["teamBId"] == 2
    assert body["teamBName"] == "Other Team"
    assert body["teamADelta"] > 0
    assert body["teamBDelta"] > 0
    assert body["afterA"] - body["beforeA"] == body["teamADelta"]
    assert body["afterB"] - body["beforeB"] == body["teamBDelta"]


@pytest.mark.django_db
def test_evaluate_endpoint_lopsided_pair_returns_numeric_deltas(client):
    _seed_league()
    response = client.get(
        f"/api/evaluate/?league_id={LEAGUE_ID}&send_id=a-rb1&receive_id=b-rb2"
    )
    assert response.status_code == 200
    body = response.json()
    assert body["mutual"] is False
    assert body["send"] == "RB1"
    assert body["receive"] == "RB2"
    assert body["sendId"] == "a-rb1"
    assert body["receiveId"] == "b-rb2"
    assert isinstance(body["teamADelta"], (int, float))
    assert isinstance(body["teamBDelta"], (int, float))
    assert body["afterA"] - body["beforeA"] == body["teamADelta"]
    assert body["afterB"] - body["beforeB"] == body["teamBDelta"]


@pytest.mark.django_db
@patch("espn.client.requests.get", side_effect=_settings_and_roster_get)
def test_post_league_refresh_syncs_snapshot_and_returns_fetched_at(mock_get, client):
    _seed_league()
    before = RosterSnapshot.objects.get().fetched_at

    response = client.post(
        "/api/league/refresh/",
        data=json.dumps({"league_id": LEAGUE_ID}),
        content_type="application/json",
    )

    assert response.status_code == 200
    body = response.json()
    assert body["fetchedAt"]
    snapshot = RosterSnapshot.objects.get()
    assert snapshot.teams[0]["name"] == "Test Team"
    assert snapshot.fetched_at >= before
    assert mock_get.called


@pytest.mark.django_db
def test_post_league_refresh_404_without_account(client):
    response = client.post(
        "/api/league/refresh/",
        data=json.dumps({"league_id": LEAGUE_ID}),
        content_type="application/json",
    )
    assert response.status_code == 404
    assert response.json()["error"] == "not found"


@pytest.mark.django_db
def test_league_endpoint_includes_fetched_at(client):
    _seed_league()
    response = client.get(f"/api/league/?league_id={LEAGUE_ID}")
    assert response.status_code == 200
    assert response.json()["fetchedAt"]


@pytest.mark.django_db
def test_league_endpoint_swid_miss_sets_error_when_teams_exist(client):
    _seed_league()
    account = EspnAccount.objects.get()
    account.swid = "{NO-MATCH}"
    account.save()

    response = client.get(f"/api/league/?league_id={LEAGUE_ID}")
    body = response.json()
    assert response.status_code == 200
    assert body["youTeamId"] is None
    assert body["teams"]
    assert body["error"] == "cookies did not match a team"
    assert "espn_s2" not in body["error"]
    assert account.swid not in body["error"]


@pytest.mark.django_db
def test_evaluate_endpoint_400_when_players_not_on_the_two_teams(client):
    _seed_league()
    missing = client.get(
        f"/api/evaluate/?league_id={LEAGUE_ID}&send_id=missing&receive_id=b-te2"
    )
    swapped = client.get(
        f"/api/evaluate/?league_id={LEAGUE_ID}&send_id=b-te2&receive_id=a-rb3"
    )
    same_team = client.get(
        f"/api/evaluate/?league_id={LEAGUE_ID}&send_id=a-rb3&receive_id=a-te"
    )
    assert missing.status_code == 400
    assert swapped.status_code == 400
    assert same_team.status_code == 400
