import { API_BASE } from "./config";

export async function fetchTrades(leagueId, mode) {
  const params = new URLSearchParams({ league_id: leagueId });
  if (mode) {
    params.set("mode", mode);
  }
  const response = await fetch(`${API_BASE}/api/trades/?${params}`);
  return response.json();
}
