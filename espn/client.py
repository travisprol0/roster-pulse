import json

import requests

ESPN_LEAGUE_URL = (
    "https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl"
    "/seasons/{season}/segments/0/leagues/{league_id}"
)
ESPN_WRITE_URL = (
    "https://lm-api-writes.fantasy.espn.com/apis/v3/games/ffl"
    "/seasons/{season}/segments/0/leagues/{league_id}"
)


class EspnUnauthorizedError(Exception):
    pass


class EspnRateLimitedError(Exception):
    pass


class EspnTimeoutError(Exception):
    pass


class EspnWriteError(Exception):
    def __init__(self, message, status=400):
        super().__init__(message)
        self.status = status


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

    def fetch_free_agents(self):
        players = []
        offset = 0
        page = 50
        while offset <= 2000:
            payload = self._get(
                "kona_player_info",
                extra_headers={
                    "X-Fantasy-Filter": json.dumps(
                        {
                            "players": {
                                "limit": page,
                                "offset": offset,
                                "filterStatus": {"value": ["FREEAGENT", "WAIVERS"]},
                                "sortPercOwned": {
                                    "sortPriority": 1,
                                    "sortAsc": False,
                                },
                            }
                        }
                    )
                },
            )
            batch = payload.get("players") or []
            players.extend(batch)
            if len(batch) < page:
                break
            offset += page
        return {"players": players}

    def set_lineup(self, lineup_entries):
        return self._post("roster", {"entries": lineup_entries})

    def claim_waiver(self, add_id, drop_id):
        return self._post(
            "transactions",
            {"type": "WAIVER", "add": add_id, "drop": drop_id},
        )

    def propose_trade(self, send_ids, receive_ids):
        return self._post(
            "transactions",
            {"type": "TRADE", "send": send_ids, "receive": receive_ids},
        )

    def _headers(self):
        return {"Cookie": f"espn_s2={self.espn_s2}; SWID={self.swid}"}

    def _raise_status(self, response):
        if response.status_code == 401:
            raise EspnUnauthorizedError()
        if response.status_code == 429:
            raise EspnRateLimitedError()
        if response.status_code >= 400:
            raise EspnWriteError(response.text[:300], status=response.status_code)

    def _get(self, view, extra_headers=None):
        url = ESPN_LEAGUE_URL.format(season=self.season, league_id=self.league_id)
        headers = self._headers()
        if extra_headers:
            headers.update(extra_headers)
        try:
            response = requests.get(
                url,
                params={"view": view},
                headers=headers,
                timeout=20,
            )
        except requests.Timeout as err:
            raise EspnTimeoutError() from err
        self._raise_status(response)
        return response.json()

    def _post(self, path, body):
        url = f"{ESPN_WRITE_URL.format(season=self.season, league_id=self.league_id)}/{path}"
        try:
            response = requests.post(
                url,
                json=body,
                headers={**self._headers(), "Content-Type": "application/json"},
                timeout=20,
            )
        except requests.Timeout as err:
            raise EspnTimeoutError() from err
        self._raise_status(response)
        if not response.content:
            return {}
        try:
            return response.json()
        except ValueError:
            return {}
