from engine.trade import evaluate_trade, find_trades
from tests.test_simulate_trade import PPR, SLOTS, surplus_rb_team, surplus_te_team


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

    trades = find_trades(team_a, [{"players": team_b}], PPR, SLOTS)

    match = next(t for t in trades if t["send"] == "a-rb3" and t["receive"] == "b-te2")
    assert match["teamADelta"] > 0
    assert match["teamBDelta"] > 0
    assert match["id"] == "a-rb3-b-te2"


def test_find_trades_caps_results():
    team_a = surplus_rb_team()
    team_b = surplus_te_team()

    trades = find_trades(team_a, [{"players": team_b}], PPR, SLOTS, limit=1)

    assert len(trades) == 1
