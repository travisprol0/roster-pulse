import { API_BASE } from "./config";
import { parseJsonOk } from "./http";

export async function fetchLeagues() {
  const response = await fetch(`${API_BASE}/api/leagues/`);
  const data = await parseJsonOk(response);
  return { leagues: data.leagues || [] };
}

export async function deleteLeague(leagueId) {
  const response = await fetch(
    `${API_BASE}/api/leagues/?league_id=${encodeURIComponent(leagueId)}`,
    { method: "DELETE" }
  );
  return parseJsonOk(response);
}
