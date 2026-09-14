from engine.trade import simulate_trade

PPR = {"rec": 1.0, "rush_yds": 0.1, "rush_td": 6.0, "rec_yds": 0.1, "rec_td": 6.0}
SLOTS = {"QB": 1, "RB": 2, "WR": 2, "TE": 1}


def _player(pid, position, **stats):
    return {"id": pid, "name": str(pid), "position": position, "stats": stats}


def _qb(pid, pts):
    return _player(pid, "QB", rec=pts)


def _rb(pid, rush_yds):
    return _player(pid, "RB", rush_yds=rush_yds)


def _wr(pid, rec):
    return _player(pid, "WR", rec=rec)


def _te(pid, rec):
    return _player(pid, "TE", rec=rec)


def surplus_rb_team():
    """Strong extra RB, weak TE."""
    return [
        _qb("a-qb", 200),
        _rb("a-rb1", 1200),
        _rb("a-rb2", 1000),
        _rb("a-rb3", 900),
        _wr("a-wr1", 80),
        _wr("a-wr2", 70),
        _te("a-te", 20),
    ]


def surplus_te_team():
    """Strong extra TE, weak RBs."""
    return [
        _qb("b-qb", 200),
        _rb("b-rb1", 400),
        _rb("b-rb2", 300),
        _wr("b-wr1", 80),
        _wr("b-wr2", 70),
        _te("b-te1", 90),
        _te("b-te2", 75),
    ]


def test_simulate_trade_true_when_both_starting_ros_increase():
    team_a = surplus_rb_team()
    team_b = surplus_te_team()
    send_a = [p for p in team_a if p["id"] == "a-rb3"]
    send_b = [p for p in team_b if p["id"] == "b-te2"]

    assert simulate_trade(team_a, team_b, send_a, send_b, PPR, SLOTS) is True


def test_simulate_trade_false_when_only_one_team_improves():
    team_a = surplus_rb_team()
    team_b = surplus_te_team()
    send_a = [p for p in team_a if p["id"] == "a-rb1"]
    send_b = [p for p in team_b if p["id"] == "b-rb2"]

    assert simulate_trade(team_a, team_b, send_a, send_b, PPR, SLOTS) is False


def test_simulate_trade_false_when_starting_ros_unchanged():
    team_a = surplus_rb_team()
    team_b = surplus_te_team()
    send_a = [p for p in team_a if p["id"] == "a-wr2"]
    send_b = [p for p in team_b if p["id"] == "b-wr2"]

    assert simulate_trade(team_a, team_b, send_a, send_b, PPR, SLOTS) is False
