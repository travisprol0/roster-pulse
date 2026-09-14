from engine.trade import player_ros_points, vorp

PPR = {"rec": 1.0, "rec_yds": 0.1, "rec_td": 6.0}
TE_STARTERS = {"TE": 1}


def _te(rank, rec):
    return {
        "id": rank,
        "name": f"TE{rank}",
        "position": "TE",
        "stats": {"rec": rec, "rec_yds": 0, "rec_td": 0},
    }


def te_pool():
    # Strictly decreasing ROS: rank 1 = 100 PPR pts ... rank 16 = 25
    return [_te(rank, rec=100 - (rank - 1) * 5) for rank in range(1, 17)]


def test_player_ros_points_applies_scoring_settings():
    player = _te(1, rec=80)
    player["stats"] = {"rec": 80, "rec_yds": 100, "rec_td": 2}
    assert player_ros_points(player, PPR) == 80 + 10 + 12


def test_te_vorp_is_higher_in_14_team_than_10_team():
    pool = te_pool()
    elite = pool[0]

    vorp_10 = vorp(elite, pool, PPR, league_size=10, starters=TE_STARTERS)
    vorp_14 = vorp(elite, pool, PPR, league_size=14, starters=TE_STARTERS)

    assert vorp_14 > vorp_10


def test_te_vorp_league_size_delta_matches_replacement_ros():
    pool = te_pool()
    elite = pool[0]
    replacement_10 = pool[9]
    replacement_14 = pool[13]

    vorp_10 = vorp(elite, pool, PPR, league_size=10, starters=TE_STARTERS)
    vorp_14 = vorp(elite, pool, PPR, league_size=14, starters=TE_STARTERS)

    expected_delta = player_ros_points(replacement_10, PPR) - player_ros_points(
        replacement_14, PPR
    )
    assert vorp_14 - vorp_10 == expected_delta
