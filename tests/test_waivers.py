from engine.waivers import flag_bye_week_streamers, suggest_waiver_add

PPR = {"rec": 1.0, "rush_yds": 0.1}
SLOTS = {"QB": 1, "RB": 2, "WR": 2, "TE": 1}


def _player(pid, position, bye_week=None, **stats):
    return {
        "id": pid,
        "name": str(pid),
        "position": position,
        "bye_week": bye_week,
        "stats": stats,
    }


def _roster():
    return [
        _player("qb", "QB", bye_week=7, rec=200),
        _player("rb1", "RB", rush_yds=1200),
        _player("rb2", "RB", rush_yds=1000),
        _player("wr1", "WR", rec=80),
        _player("wr2", "WR", rec=70),
        _player("te", "TE", bye_week=10, rec=90),
        _player("bench-rb", "RB", rush_yds=200),
    ]


def test_suggests_dropping_lowest_bench_for_higher_projected_fa():
    roster = _roster()
    better_fa = _player("fa-rb", "RB", rush_yds=500)
    worse_fa = _player("fa-weak", "RB", rush_yds=50)
    suggestion = suggest_waiver_add(roster, [worse_fa, better_fa], PPR, SLOTS)

    assert suggestion["add"]["id"] == "fa-rb"
    assert suggestion["drop"]["id"] == "bench-rb"


def test_no_suggestion_when_free_agents_are_worse_than_bench():
    roster = _roster()
    worse_fa = _player("fa-weak", "RB", rush_yds=50)
    assert suggest_waiver_add(roster, [worse_fa], PPR, SLOTS) is None


def test_flags_fa_qb_one_week_before_starter_bye():
    roster = _roster()
    fa_qb = _player("fa-qb", "QB", rec=80)
    fa_te = _player("fa-te", "TE", rec=40)
    fa_wr = _player("fa-wr", "WR", rec=60)
    flagged = flag_bye_week_streamers(
        roster, [fa_qb, fa_te, fa_wr], current_week=6, slots=SLOTS
    )
    assert [p["id"] for p in flagged] == ["fa-qb"]


def test_flags_fa_te_one_week_before_starter_bye():
    roster = _roster()
    fa_qb = _player("fa-qb", "QB", rec=80)
    fa_te = _player("fa-te", "TE", rec=40)
    flagged = flag_bye_week_streamers(
        roster, [fa_qb, fa_te], current_week=9, slots=SLOTS
    )
    assert [p["id"] for p in flagged] == ["fa-te"]


def test_does_not_flag_on_bye_week_itself():
    roster = _roster()
    fa_qb = _player("fa-qb", "QB", rec=80)
    flagged = flag_bye_week_streamers(roster, [fa_qb], current_week=7, slots=SLOTS)
    assert flagged == []
