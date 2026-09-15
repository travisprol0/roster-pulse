from engine.lineup import recommended_starter_ids


SLOTS = {"QB": 1, "RB": 2, "WR": 2, "TE": 1}


def test_recommended_starters_sits_weak_te_when_better_exists():
    players = [
        {"id": "good", "name": "Good TE", "position": "TE", "projectedPts": 80},
        {"id": "weak", "name": "Weak TE", "position": "TE", "projectedPts": 20},
    ]
    ids = recommended_starter_ids(players, {"TE": 1})
    assert "good" in ids
    assert "weak" not in ids


def test_recommended_starters_skips_ir_slot():
    players = [
        {"id": "ir", "position": "RB", "projectedPts": 99, "injury": "", "slot": "IR"},
        {"id": "rb", "position": "RB", "projectedPts": 5, "injury": "", "slot": "RB"},
    ]
    ids = recommended_starter_ids(players, {"RB": 1})
    assert ids == {"rb"}


def test_recommended_starters_top_projected_at_each_slot():
    players = [
        {"id": "qb", "position": "QB", "projectedPts": 200},
        {"id": "rb1", "position": "RB", "projectedPts": 120},
        {"id": "rb2", "position": "RB", "projectedPts": 100},
        {"id": "rb3", "position": "RB", "projectedPts": 90},
        {"id": "wr1", "position": "WR", "projectedPts": 80},
        {"id": "wr2", "position": "WR", "projectedPts": 70},
        {"id": "te", "position": "TE", "projectedPts": 20},
    ]
    ids = recommended_starter_ids(players, SLOTS)
    assert ids == {"qb", "rb1", "rb2", "wr1", "wr2", "te"}
    assert "rb3" not in ids
