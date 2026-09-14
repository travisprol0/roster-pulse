import pytest

from espn.client import EspnFantasyClient

ESPN_S2 = "s2-token"
SWID = "{TEST-SWID}"
LEAGUE_ID = 12345
SEASON = 2026


@pytest.fixture
def msettings_payload():
    return {
        "id": LEAGUE_ID,
        "settings": {
            "name": "Test League",
            "scoringSettings": {
                "scoringItems": [
                    {"statId": 53, "points": 1.0},
                    {"statId": 42, "points": 0.1},
                ]
            },
            "rosterSettings": {
                "lineupSlotCounts": {"0": 1, "2": 2, "4": 2, "6": 1, "23": 1, "20": 7},
                "rosterSlotCounts": {"0": 1, "2": 2, "4": 2, "6": 1, "23": 1, "20": 7},
            },
        },
    }


@pytest.fixture
def mroster_payload():
    return {
        "teams": [
            {
                "id": 1,
                "abbrev": "TST",
                "name": "Test Team",
                "roster": {
                    "entries": [
                        {
                            "playerId": 3139477,
                            "lineupSlotId": 2,
                            "playerPoolEntry": {
                                "player": {
                                    "id": 3139477,
                                    "fullName": "Patrick Mahomes",
                                    "defaultPositionId": 1,
                                }
                            },
                        }
                    ]
                },
            }
        ]
    }


@pytest.fixture
def espn_client():
    return EspnFantasyClient(
        espn_s2=ESPN_S2,
        swid=SWID,
        league_id=LEAGUE_ID,
        season=SEASON,
    )
