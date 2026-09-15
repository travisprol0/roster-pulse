import { API_BASE } from "./config";
import { parseJsonOk } from "./http";

export async function saveEspnCredentials(payload) {
  const response = await fetch(`${API_BASE}/api/espn-credentials/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseJsonOk(response);
}
