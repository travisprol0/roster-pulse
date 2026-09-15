import { API_BASE } from "./config";
import { parseJsonOk } from "./http";

export async function fetchLeague(leagueId) {
  const response = await fetch(
    `${API_BASE}/api/league/?league_id=${encodeURIComponent(leagueId)}`
  );
  return parseJsonOk(response);
}

export async function refreshLeague(leagueId) {
  const response = await fetch(`${API_BASE}/api/league/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ league_id: leagueId }),
  });
  return parseJsonOk(response);
}

export async function setLineup(leagueId) {
  const response = await fetch(`${API_BASE}/api/lineup/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ league_id: leagueId }),
  });
  return parseJsonOk(response);
}
