import { API_BASE } from "./config";

export async function fetchEvaluate(leagueId, sendId, receiveId) {
  const params = new URLSearchParams({
    league_id: leagueId,
    send_id: sendId,
    receive_id: receiveId,
  });
  const response = await fetch(`${API_BASE}/api/evaluate/?${params}`);
  return response.json();
}
