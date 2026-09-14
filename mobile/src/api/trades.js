import { API_BASE } from "./config";

export async function fetchTrades(leagueId) {
  const response = await fetch(
    `${API_BASE}/api/trades/?league_id=${encodeURIComponent(leagueId)}`
  );
  return response.json();
}
