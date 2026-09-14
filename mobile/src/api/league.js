import { API_BASE } from "./config";

export async function fetchLeague(leagueId) {
  const response = await fetch(
    `${API_BASE}/api/league/?league_id=${encodeURIComponent(leagueId)}`
  );
  return response.json();
}
