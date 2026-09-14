import pytest

from leagues.models import EspnAccount, LeagueSettings, RosterSnapshot

SEASON = 2026


@pytest.mark.django_db
def test_one_account_owns_multiple_league_settings_and_snapshots():
    account = EspnAccount.objects.create(espn_s2="s2-token", swid="{TEST-SWID}")

    LeagueSettings.objects.create(
        account=account,
        espn_league_id=111,
        season=SEASON,
        name="League A",
        scoring_rules={},
        roster_sizes={},
    )
    LeagueSettings.objects.create(
        account=account,
        espn_league_id=222,
        season=SEASON,
        name="League B",
        scoring_rules={},
        roster_sizes={},
    )
    RosterSnapshot.objects.create(
        account=account,
        espn_league_id=111,
        season=SEASON,
        teams=[],
        players=[],
    )
    RosterSnapshot.objects.create(
        account=account,
        espn_league_id=222,
        season=SEASON,
        teams=[],
        players=[],
    )

    assert account.league_settings.count() == 2
    assert account.roster_snapshots.count() == 2
    assert set(account.league_settings.values_list("espn_league_id", flat=True)) == {
        111,
        222,
    }
    assert set(account.roster_snapshots.values_list("espn_league_id", flat=True)) == {
        111,
        222,
    }
    assert not hasattr(LeagueSettings, "espn_s2")
    assert not hasattr(RosterSnapshot, "espn_s2")
    assert account.espn_s2 == "s2-token"
    assert account.swid == "{TEST-SWID}"
