const API_URL = "http://localhost:8000/api/espn-credentials/";

export async function saveEspnCredentials(payload) {
  return fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}
