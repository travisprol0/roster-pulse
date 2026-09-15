from espn.normalize import normalize_player, starter_slots, user_team
from tests.conftest import SWID


def _entry(
    player_id,
    name,
    position_id,
    applied_total,
    primary_stats=None,
    lineup_slot_id=0,
    injury_status="",
    actual_total=1,
):
    stats = primary_stats or [
        {"statSourceId": 0, "appliedTotal": actual_total},
        {"statSourceId": 1, "appliedTotal": applied_total},
    ]
    return {
        "playerId": player_id,
        "lineupSlotId": lineup_slot_id,
        "playerPoolEntry": {
            "player": {
                "id": player_id,
                "fullName": name,
                "defaultPositionId": position_id,
                "injuryStatus": injury_status,
                "stats": stats,
            }
        },
    }


def test_normalize_player_maps_position_and_projected_applied_total():
    player = normalize_player(_entry(3139477, "Patrick Mahomes", 1, 280.4))
    assert player["id"] == 3139477
    assert player["name"] == "Patrick Mahomes"
    assert player["position"] == "QB"
    assert player["stats"] == {"pts": 280.4}


def test_normalize_player_keeps_slot_injury_and_actual_points():
    player = normalize_player(
        _entry(
            3139477,
            "Patrick Mahomes",
            1,
            280.4,
            lineup_slot_id=0,
            injury_status="QUESTIONABLE",
            actual_total=47.2,
        )
    )
    assert player["slot"] == "QB"
    assert player["injury"] == "QUESTIONABLE"
    assert player["projectedPts"] == 280.4
    assert player["actualPts"] == 47.2
    assert player["stats"] == {"pts": 280.4}


def test_normalize_player_maps_bench_and_ir_slots():
    bench = normalize_player(_entry(1, "Bench RB", 2, 90, lineup_slot_id=20))
    ir = normalize_player(_entry(2, "IR WR", 3, 40, lineup_slot_id=21))
    flex = normalize_player(_entry(3, "Flex WR", 3, 80, lineup_slot_id=23))
    assert bench["slot"] == "BE"
    assert ir["slot"] == "IR"
    assert flex["slot"] == "FLEX"


def test_normalize_player_keeps_kicker():
    player = normalize_player(_entry(1, "Kicker", 5, 100, lineup_slot_id=17))
    assert player["position"] == "K"
    assert player["slot"] == "K"
    assert player["projectedPts"] == 100


def test_normalize_player_keeps_dst():
    player = normalize_player(_entry(2, "Chiefs D/ST", 16, 88, lineup_slot_id=16))
    assert player["position"] == "DST"
    assert player["slot"] == "DST"


def test_user_team_matches_swid_to_primary_owner():
    teams = [
        {"id": 1, "primaryOwner": "{OTHER}", "players": []},
        {"id": 2, "primaryOwner": SWID, "players": [{"id": 1}]},
    ]
    assert user_team(teams, SWID)["id"] == 2


def test_starter_slots_from_lineup_slot_counts():
    slots = starter_slots(
        {"lineupSlotCounts": {"0": 1, "2": 2, "4": 2, "6": 1, "23": 1, "20": 7}}
    )
    assert slots == {"QB": 1, "RB": 2, "WR": 2, "TE": 1, "FLEX": 1}
