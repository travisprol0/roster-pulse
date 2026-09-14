import { API_BASE } from "./config";

export async function saveEspnCredentials(payload) {
  return fetch(`${API_BASE}/api/espn-credentials/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}
