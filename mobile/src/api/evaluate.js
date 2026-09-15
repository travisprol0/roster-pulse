import { API_BASE } from "./config";
import { parseJsonOk } from "./http";

export async function fetchEvaluate(leagueId, sendId, receiveId) {
  const params = new URLSearchParams({ league_id: String(leagueId) });
  const sends = String(sendId).split(/[+]/).filter(Boolean);
  const recvs = String(receiveId).split(/[+]/).filter(Boolean);
  if (sends.length === 1 && recvs.length === 1) {
    params.set("send_id", sends[0]);
    params.set("receive_id", recvs[0]);
  } else {
    params.set("send_ids", sends.join("+"));
    params.set("receive_ids", recvs.join("+"));
  }
  const response = await fetch(`${API_BASE}/api/evaluate/?${params}`);
  return parseJsonOk(response);
}

export async function proposeTrade(leagueId, sendIds, receiveIds) {
  const response = await fetch(`${API_BASE}/api/trades/propose/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      league_id: leagueId,
      send_ids: sendIds,
      receive_ids: receiveIds,
    }),
  });
  return parseJsonOk(response);
}
