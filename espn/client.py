import requests

ESPN_LEAGUE_URL = (
    "https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl"
    "/seasons/{season}/segments/0/leagues/{league_id}"
)


class EspnUnauthorizedError(Exception):
    pass


class EspnFantasyClient:
    def __init__(self, espn_s2, swid, league_id, season):
        self.espn_s2 = espn_s2
        self.swid = swid
        self.league_id = league_id
        self.season = season

    def fetch_settings(self):
        return self._get("mSettings")

    def fetch_roster(self):
        return self._get("mRoster")

    def fetch_team(self):
        return self._get("mTeam")

    def _get(self, view):
        url = ESPN_LEAGUE_URL.format(season=self.season, league_id=self.league_id)
        response = requests.get(
            url,
            params={"view": view},
            headers={"Cookie": f"espn_s2={self.espn_s2}; SWID={self.swid}"},
        )
        if response.status_code == 401:
            raise EspnUnauthorizedError()
        return response.json()
