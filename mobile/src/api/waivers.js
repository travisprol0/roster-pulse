import { API_BASE } from "./config";
import { parseJsonOk } from "./http";

export async function fetchWaivers(leagueId) {
  const response = await fetch(
    `${API_BASE}/api/waivers/?league_id=${encodeURIComponent(leagueId)}`
  );
  const data = await parseJsonOk(response);
  return {
    waivers: data.waivers || [],
    suggested: data.suggested || null,
    error: data.error || "",
  };
}

export async function claimWaiver(leagueId, addId, dropId) {
  const response = await fetch(`${API_BASE}/api/waivers/claim/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      league_id: leagueId,
      add_id: addId,
      drop_id: dropId,
    }),
  });
  return parseJsonOk(response);
}
