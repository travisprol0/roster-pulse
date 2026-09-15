import { API_BASE } from "./config";

export async function fetchLeague(leagueId) {
  const response = await fetch(
    `${API_BASE}/api/league/?league_id=${encodeURIComponent(leagueId)}`
  );
  return response.json();
}

export async function refreshLeague(leagueId) {
  const response = await fetch(`${API_BASE}/api/league/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ league_id: leagueId }),
  });
  return response.json();
}
