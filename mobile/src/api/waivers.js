import { API_BASE } from "./config";

export async function fetchWaivers(leagueId) {
  const response = await fetch(
    `${API_BASE}/api/waivers/?league_id=${encodeURIComponent(leagueId)}`
  );
  return response.json();
}
