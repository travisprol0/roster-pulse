from engine.trade import evaluate_trade, find_trades
from tests.test_simulate_trade import (
    PPR,
    SLOTS,
    surplus_rb_team,
    surplus_te_team,
    _qb,
    _rb,
    _wr,
    _te,
)


def test_evaluate_trade_returns_positive_deltas_when_both_improve():
    team_a = surplus_rb_team()
    team_b = surplus_te_team()
    send_a = [p for p in team_a if p["id"] == "a-rb3"]
    send_b = [p for p in team_b if p["id"] == "b-te2"]

    result = evaluate_trade(team_a, team_b, send_a, send_b, PPR, SLOTS)

    assert result is not None
    assert result["team_a_delta"] > 0
    assert result["team_b_delta"] > 0


def test_evaluate_trade_none_when_only_one_team_improves():
    team_a = surplus_rb_team()
    team_b = surplus_te_team()
    send_a = [p for p in team_a if p["id"] == "a-rb1"]
    send_b = [p for p in team_b if p["id"] == "b-rb2"]

    assert evaluate_trade(team_a, team_b, send_a, send_b, PPR, SLOTS) is None


def test_find_trades_includes_mutually_beneficial_one_for_one():
    team_a = surplus_rb_team()
    team_b = surplus_te_team()

    trades = find_trades(
        team_a,
        [{"id": 2, "name": "Other Team", "players": team_b}],
        PPR,
        SLOTS,
    )

    match = next(t for t in trades if t["send"] == "a-rb3" and t["receive"] == "b-te2")
    assert match["teamADelta"] > 0
    assert match["teamBDelta"] > 0
    assert match["id"] == "a-rb3-b-te2"
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


def test_find_trades_caps_results():
    team_a = surplus_rb_team()
    team_b = surplus_te_team()

    trades = find_trades(team_a, [{"players": team_b}], PPR, SLOTS, limit=1)

    assert len(trades) == 1


def two_for_one_need_te_team():
    return [
        _qb("a-qb", 200),
        _rb("a-rb1", 1000),
        _rb("a-rb2", 900),
        _rb("a-rb3", 800),
        _wr("a-wr1", 80),
        _wr("a-wr2", 50),
        _te("a-te", 10),
    ]


def two_for_one_surplus_te_team():
    return [
        _qb("b-qb", 200),
        _rb("b-rb1", 400),
        _rb("b-rb2", 300),
        _wr("b-wr1", 80),
        _wr("b-wr2", 70),
        _te("b-te1", 100),
        _te("b-te2", 90),
    ]


def test_find_trades_two_for_one_returns_mutual_pair():
    trades = find_trades(
        two_for_one_need_te_team(),
        [{"id": 2, "name": "Other Team", "players": two_for_one_surplus_te_team()}],
        PPR,
        SLOTS,
        two_for_one=True,
    )

    match = next(
        t
        for t in trades
        if " + " in t["send"] or " + " in t["receive"]
    )
    assert match["teamADelta"] > 0
    assert match["teamBDelta"] > 0
